import fs from 'fs';
import path from 'path';
import { CitationSource, QueryCategory } from '../models/Assistant.types';
import { warRoomState } from './warRoomState';
import { normalizeContractId } from '../models/Contract.model';

export interface RetrievedEvidenceBundle {
  query: string;
  category: QueryCategory;
  targetContracts: string[];
  targetEvents: string[];
  targetPeriod?: string;
  contractTexts: Record<string, string>;
  relevantClauses: {
    contractId: string;
    section: string;
    title: string;
    text: string;
    category?: string;
  }[];
  companyContext: string;
  events: Record<string, any>[];
  citations: CitationSource[];
  missingEntities: string[];
}

export class EvidenceRetrievalService {
  private baseDataDir: string;

  constructor() {
    const candidates = [
      path.resolve(process.cwd(), '../odin_data/bundle'),
      path.resolve(process.cwd(), 'odin_data/bundle'),
      path.resolve(__dirname, '../../../odin_data/bundle'),
      path.resolve(__dirname, '../../odin_data/bundle'),
      '/Users/pagarearyanmanohar/code/ragnarok-4/odin_data/bundle',
    ];
    this.baseDataDir = candidates.find((p) => fs.existsSync(p)) || candidates[0];
  }

  /**
   * Main retrieval method that parses query intent and pulls verifiable evidence
   */
  public async retrieveEvidence(
    query: string,
    activeContractId?: string
  ): Promise<RetrievedEvidenceBundle> {
    const qLower = query.toLowerCase();

    // 1. Identify Query Category
    const category = this.classifyQueryCategory(qLower);

    // 2. Extract Entities
    const targetContracts = this.extractContractReferences(qLower, activeContractId);
    const targetEvents = this.extractEventReferences(qLower);
    const targetPeriod = this.extractPeriod(qLower);

    // 3. Retrieve Contract Texts
    const contractTexts: Record<string, string> = {};
    const missingEntities: string[] = [];

    for (const cid of targetContracts) {
      const text = this.loadContractText(cid);
      if (text) {
        contractTexts[cid] = text;
      } else {
        missingEntities.push(`Contract ${cid}`);
      }
    }

    // 4. Retrieve Company Context
    const companyContext = this.loadCompanyContext();

    // 5. Retrieve Relevant Event Records
    const allEvents = this.loadAllEvents();
    const relevantEvents = allEvents.filter((e) => {
      if (targetEvents.includes(e.event_id)) return true;
      if (targetPeriod) {
        if (targetPeriod.toLowerCase().includes('march') && (e.timestamp?.includes('2027-03') || e.body?.toLowerCase().includes('march'))) {
          return true;
        }
        if (targetPeriod.toLowerCase().includes('may') && (e.timestamp?.includes('2027-05') || e.body?.toLowerCase().includes('may'))) {
          return true;
        }
      }
      // If outage query, include major outages
      if (category === 'sla_calculation' || category === 'financial_recovery') {
        return (
          e.event_id === 'E-04' ||
          e.event_id === 'E-05' ||
          e.event_id === 'E-12' ||
          e.event_id === 'E-13' ||
          e.event_id === 'E-17'
        );
      }
      return false;
    });

    // 6. Extract Relevant Clauses & Construct Clickable Citations
    const relevantClauses = this.extractRelevantClauses(targetContracts, contractTexts, qLower, category);
    const citations: CitationSource[] = [];

    // Add contract clause citations
    for (const cl of relevantClauses) {
      citations.push({
        id: `cit-${cl.contractId}-${cl.section.replace(/[^a-zA-Z0-9]/g, '_')}`,
        sourceType: 'contract_clause',
        contractId: cl.contractId,
        contractName: this.getContractFriendlyName(cl.contractId),
        sectionOrClause: cl.section,
        verbatimExcerpt: cl.text.slice(0, 450),
        confidence: 0.98,
      });
    }

    // Add event citations
    for (const evt of relevantEvents) {
      citations.push({
        id: `cit-evt-${evt.event_id}`,
        sourceType: 'event_log',
        eventOrRecordId: evt.event_id,
        date: evt.timestamp ? evt.timestamp.split('T')[0] : undefined,
        verbatimExcerpt: `${evt.from} -> ${evt.to}: "${evt.subject}". ${evt.body?.slice(0, 300)}`,
        confidence: 0.99,
      });
    }

    // Add company context citations if insurance or corporate terms referenced
    if (qLower.includes('insurance') || qLower.includes('default') || qLower.includes('breach') || qLower.includes('quillhub')) {
      const insuranceMatch = companyContext.match(/INSURANCE[\s\S]*?(?=BANK DETAILS|$)/i);
      if (insuranceMatch) {
        citations.push({
          id: 'cit-company-insurance',
          sourceType: 'company_record',
          documentId: 'context.txt',
          sectionOrClause: 'Company Context § Insurance',
          verbatimExcerpt: insuranceMatch[0].trim(),
          confidence: 0.95,
        });
      }
    }

    return {
      query,
      category,
      targetContracts,
      targetEvents,
      targetPeriod,
      contractTexts,
      relevantClauses,
      companyContext,
      events: relevantEvents,
      citations,
      missingEntities,
    };
  }

  private classifyQueryCategory(q: string): QueryCategory {
    // If explicitly asking about non-outage or breach unrelated to service outages
    if (q.includes('unrelated to') || q.includes('non-outage') || (q.includes('breach') && q.includes('default'))) {
      return 'breach_investigation';
    }
    if (q.includes('uptime') || (q.includes('outage') && (q.includes('credit') || q.includes('recover') || q.includes('march') || q.includes('may') || q.includes('e-04') || q.includes('e-12')))) {
      return q.includes('credit') || q.includes('recover') ? 'financial_recovery' : 'sla_calculation';
    }
    if (q.includes('breach') || q.includes('default') || q.includes('violate')) {
      return 'breach_investigation';
    }
    if (q.includes('contradict') || q.includes('conflict') || q.includes('inconsisten')) {
      return 'contradiction_detection';
    }
    if (q.includes('overdue') || q.includes('obligation') || q.includes('deadline')) {
      return 'obligation_tracking';
    }
    if (q.includes('clause') || q.includes('section') || q.includes('provision')) {
      return 'clause_lookup';
    }
    if (q.includes('what if') || q.includes('simulate') || q.includes('hypothetical')) {
      return 'what_if_simulation';
    }
    return 'general_inquiry';
  }

  private extractContractReferences(q: string, activeContractId?: string): string[] {
    const list = new Set<string>();

    if (q.includes('harbor') || q.includes('b1') || q.includes('b2')) {
      list.add('B1');
      if (q.includes('dpa') || q.includes('security') || q.includes('b2')) list.add('B2');
    }
    if (q.includes('stratonode') || q.includes('strato') || q.includes('a1') || q.includes('a2') || q.includes('a3')) {
      list.add('A1');
      list.add('A2');
      if (q.includes('a3') || q.includes('amendment')) list.add('A3');
    }
    if (q.includes('vantage') || q.includes('c1')) {
      list.add('C1');
    }
    if (q.includes('pixelwright') || q.includes('d1') || q.includes('designer') || q.includes('contractor')) {
      list.add('D1');
    }
    if (q.includes('standard') || q.includes('std')) {
      list.add('STD');
    }

    if (list.size === 0 && activeContractId) {
      const clean = normalizeContractId(activeContractId);
      list.add(clean);
    }

    // Default to B1 and A1/A2 if question mentions Quillhub customer/vendor obligations
    if (list.size === 0) {
      list.add('B1');
      list.add('A2');
    }

    return Array.from(list);
  }

  private extractEventReferences(q: string): string[] {
    const events: string[] = [];
    const eventRegex = /\bE-(\d{1,2})\b/gi;
    let match;
    while ((match = eventRegex.exec(q)) !== null) {
      events.push(`E-${match[1].padStart(2, '0')}`);
    }
    return Array.from(new Set(events));
  }

  private extractPeriod(q: string): string | undefined {
    if (q.includes('march 2027') || q.includes('march 3') || q.includes('march')) return 'March 2027';
    if (q.includes('february 2027') || q.includes('february')) return 'February 2027';
    if (q.includes('may 2027') || q.includes('may 1') || q.includes('may 2') || q.includes('may')) return 'May 2027';
    if (q.includes('june 2027') || q.includes('june 30') || q.includes('june')) return 'June 2027';
    return undefined;
  }

  public loadContractText(cid: string): string | null {
    const clean = normalizeContractId(cid);
    const candidatePaths = [
      path.join(this.baseDataDir, 'contracts', `${clean}.txt`),
      path.join(this.baseDataDir, 'contracts', `${clean.toUpperCase()}.txt`),
      path.join(this.baseDataDir, 'contracts', `cnt-${clean}.txt`),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    }

    // Fallback to warRoomState rawContracts
    if (warRoomState.rawContracts[clean]) {
      return warRoomState.rawContracts[clean];
    }

    return null;
  }

  public loadCompanyContext(): string {
    const p = path.join(this.baseDataDir, 'company', 'context.txt');
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8');
    }
    return warRoomState.contextText || '';
  }

  public loadAllEvents(): Record<string, any>[] {
    const events: Record<string, any>[] = [];
    const dropPaths = [
      path.join(this.baseDataDir, 'events', 'events_drop1.jsonl'),
      path.join(this.baseDataDir, 'events', 'events_drop2.jsonl'),
    ];

    for (const p of dropPaths) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf-8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            events.push(parsed);
          } catch {
            // Ignore malformed lines gracefully (e.g., test line in drop2)
          }
        }
      }
    }

    if (events.length === 0 && warRoomState.rawEvents.length > 0) {
      return warRoomState.rawEvents;
    }

    return events;
  }

  private extractRelevantClauses(
    targetContracts: string[],
    texts: Record<string, string>,
    query: string,
    category: QueryCategory
  ): { contractId: string; section: string; title: string; text: string; category?: string }[] {
    const clauses: { contractId: string; section: string; title: string; text: string; category?: string }[] = [];

    for (const cid of targetContracts) {
      const text = texts[cid];
      if (!text) continue;

      // Extract sections based on Section header patterns
      const sectionBlocks = text.split(/(?=Section [A-Z0-9§])/i);
      for (const block of sectionBlocks) {
        const headerMatch = block.match(/^(Section [A-Z0-9§\.]+[^\n]*)/i);
        const sectionHeader = headerMatch ? headerMatch[1].trim() : 'General Terms';
        const blockLower = block.toLowerCase();

        let isRelevant = false;
        if (category === 'sla_calculation' || category === 'financial_recovery') {
          isRelevant =
            blockLower.includes('uptime') ||
            blockLower.includes('service level') ||
            blockLower.includes('credit') ||
            blockLower.includes('monthly fee');
        } else if (category === 'breach_investigation' || category === 'contradiction_detection') {
          isRelevant =
            blockLower.includes('insurance') ||
            blockLower.includes('exclusivity') ||
            blockLower.includes('termination') ||
            blockLower.includes('data breach') ||
            blockLower.includes('material breach') ||
            blockLower.includes('lapse') ||
            blockLower.includes('deemed acceptance');
        } else {
          isRelevant = query.split(/\s+/).some((w) => w.length > 4 && blockLower.includes(w));
        }

        if (isRelevant) {
          clauses.push({
            contractId: cid,
            section: sectionHeader,
            title: sectionHeader,
            text: block.trim(),
            category: category,
          });
        }
      }
    }

    return clauses;
  }

  public getContractFriendlyName(cid: string): string {
    const map: Record<string, string> = {
      A1: 'StratoNode CloudCore Agreement Cover Page (QH-STRATO-2026-001)',
      A2: 'StratoNode CloudCore Service Level Agreement (QH-STRATO-2026-SLA)',
      A3: 'Amendment No. 1 to StratoNode SLA',
      B1: 'Harbor Retail Cloud Service Agreement (QH-HARBOR-2026-001)',
      B2: 'Harbor Retail Data Protection Addendum (DPA)',
      C1: 'Vantage Logistics Customer Agreement (QH-VANTAGE-2026-001)',
      D1: 'Pixelwright Design Independent Contractor SOW (QH-PIXEL-2026-001)',
      STD: 'Common Paper Cloud Service Agreement Standard Terms 2.0',
    };
    return map[cid.toUpperCase()] || `Contract ${cid}`;
  }
}

export const evidenceRetrievalService = new EvidenceRetrievalService();
