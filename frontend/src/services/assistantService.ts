import { apiRequest } from './apiClient';
import {
  AssistantQueryRequest,
  StructuredAnswer,
  StoredInvestigationSummary,
  CitationSource,
} from '../types/assistant';

export const assistantService = {
  /**
   * Submit natural language query to the evidence-backed assistant
   */
  async askQuestion(req: AssistantQueryRequest): Promise<StructuredAnswer> {
    const res = await apiRequest<StructuredAnswer>(
      '/assistant/query',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      },
      () => createFallbackMockAnswer(req.query)
    );
    return res.data;
  },

  /**
   * Get list of recent multi-agent investigations
   */
  async getInvestigations(): Promise<{ total: number; investigations: StoredInvestigationSummary[] }> {
    try {
      const res = await apiRequest<{ total: number; investigations: StoredInvestigationSummary[] }>(
        '/assistant/investigations',
        {},
        () => ({ total: 0, investigations: [] })
      );
      return res.data;
    } catch {
      return { total: 0, investigations: [] };
    }
  },

  /**
   * Get specific investigation by ID
   */
  async getInvestigationById(id: string): Promise<any> {
    const res = await apiRequest<any>(`/assistant/investigations/${id}`);
    return res.data;
  },

  /**
   * Get full citation source details
   */
  async getCitationSource(sourceId: string): Promise<CitationSource | null> {
    try {
      const res = await apiRequest<CitationSource>(`/assistant/sources/${sourceId}`);
      return res.data;
    } catch {
      return null;
    }
  },
};

function createFallbackMockAnswer(query: string): StructuredAnswer {
  return {
    summary: 'Fallback determination generated while backend is offline.',
    directAnswer: `Analysis for query: "${query}". Please ensure backend is online on http://localhost:8000.`,
    queryIntent: {
      category: 'general_inquiry',
      targetContracts: ['B1'],
      targetEvents: ['E-04'],
      isOutageRelated: false,
    },
    claims: [],
    agentTraces: [],
    debateItems: [],
    citations: [],
    contradictions: [],
    assumptions: ['Client-side offline fallback adapter activated.'],
    missingInformation: [],
    suggestedFollowUps: ['Check system connection status.'],
    deepLinks: [],
  };
}
