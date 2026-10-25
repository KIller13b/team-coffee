import { Router, Request, Response, NextFunction } from 'express';
import { warRoomState } from '../services/warRoomState';
import { SEED_AGENTS } from '../data/seedData';
import { llmService } from '../services/llmCascade';
import { ContractWarRoomWorkflow } from '../agents/workflow';

export const agentsRouter = Router();

// GET /api/agents
agentsRouter.get('/agents', (req: Request, res: Response) => {
  const hasContracts = warRoomState.contracts.length > 0;
  const standbyTasks: Record<string, string> = {
    odin: 'Standby — Awaiting contract portfolio ingestion',
    thor: 'Standby — Primed for verbatim clause OCR & extraction',
    norns: 'Standby — Primed for temporal milestone projections',
    loki: 'Standby — Primed for adversarial red-team stress test',
    heimdall: 'Standby — Sentinel listening to telemetry & event logs',
    tyr: 'Standby — Arbiter primed for cross-contract dispute rulings',
  };

  const result = SEED_AGENTS.map((a) => {
    const item: any = { ...a };
    if (!hasContracts) {
      item.status = 'ready';
      item.completedTasksCount = 0;
      item.totalProcessedCount = 0;
      item.currentTask = standbyTasks[a.id] || 'Standby — Awaiting document ingestion';
    } else {
      item.completedTasksCount = warRoomState.contracts.length * 4;
      item.totalProcessedCount = warRoomState.contracts.length * 4;
      item.currentTask = `Active analysis across ${warRoomState.contracts.length} commercial agreement${
        warRoomState.contracts.length > 1 ? 's' : ''
      }`;
    }
    return item;
  });

  res.json(result);
});

// GET /api/agents/messages
agentsRouter.get('/agents/messages', (req: Request, res: Response) => {
  if (warRoomState.contracts.length === 0) {
    res.json([]);
    return;
  }
  const activeIds = new Set(warRoomState.contracts.map((c) => c.id));
  const cleanKeys = new Set(warRoomState.contracts.map((c) => c.id.replace('cnt-', '').toUpperCase()));

  const filtered = warRoomState.messages.filter(
    (m) =>
      !m.contractId ||
      activeIds.has(m.contractId) ||
      cleanKeys.has((m.contractId || '').replace('cnt-', '').toUpperCase())
  );
  res.json(filtered);
});

// GET /api/workflow/steps
agentsRouter.get('/workflow/steps', (req: Request, res: Response) => {
  res.json(warRoomState.workflowSteps);
});

// GET /api/observability
agentsRouter.get('/observability', (req: Request, res: Response) => {
  res.json(warRoomState.getObservability());
});

// GET /api/agents/loops
agentsRouter.get('/agents/loops', (req: Request, res: Response) => {
  res.json({
    clarificationLoops: warRoomState.clarificationRecords,
    disputeLoops: warRoomState.disputeRecords,
    boundedLimitsEnforced: true,
  });
});

// GET /api/graph
agentsRouter.get('/graph', (req: Request, res: Response) => {
  res.json(warRoomState.getContractGraph());
});

// POST /api/agents/thor/re-extract
agentsRouter.post('/agents/thor/re-extract', (req: Request, res: Response) => {
  const { contract_id, contractId, clause_field, clauseField } = req.body;
  const targetId = contract_id || contractId;
  const targetField = clause_field || clauseField;

  if (!targetId || !targetField) {
    res.status(400).json({ error: 'contract_id and clause_field are required' });
    return;
  }

  const result = warRoomState.reExtractClause(targetId, targetField);
  if (result.error) {
    res.status(404).json({ detail: result.error, error: result.error });
    return;
  }
  res.json(result);
});

// POST /api/actions/:actionId/approve
agentsRouter.post('/actions/:actionId/approve', (req: Request, res: Response) => {
  const actionId = req.params.actionId as string;
  const result = warRoomState.approveAction(actionId);
  res.json(result);
});

// POST /api/workflow/run
agentsRouter.post('/workflow/run', (req: Request, res: Response) => {
  const { contract_id = 'A2', contract_text, clock_date = '2027-01-15' } = req.body;
  const workflow = new ContractWarRoomWorkflow();
  const cidClean = contract_id.replace('cnt-', '').toUpperCase();
  const text = contract_text || warRoomState.rawContracts[cidClean] || warRoomState.rawContracts['A2'] || '';

  const result = workflow.execute(
    contract_id,
    text,
    warRoomState.rawEvents,
    clock_date,
    warRoomState.contextText
  );
  res.json(result);
});

// POST /api/chat
agentsRouter.post('/chat', async (req: Request, res: Response) => {
  const activeAgent = (req.body.agentId || req.body.agent_id || 'odin').toLowerCase();
  const message = req.body.message;

  const agentPersonas: Record<string, string> = {
    odin: 'You are Odin, the Allfather orchestrator of legal intelligence for Quillhub Inc. Synthesize concrete legal actions grounded in contract terms.',
    thor: 'You are Thor, the extraction agent. Provide exact clause numbers, definitions, and verbatim facts from Quillhub contracts.',
    loki: 'You are Loki, adversarial red-team counsel. Find traps, contradictions, and exposure vulnerabilities in Quillhub agreements.',
    norns: 'You are The Norns, temporal oracle. Calculate deadlines, countdowns, and worst-case liabilities across simulated checkpoints.',
    heimdall: 'You are Heimdall, sentinel fact-checker. Correlate claims against real-world events and status logs.',
    tyr: 'You are Tyr, the binding arbiter. Resolve disputes, dismiss false alarms, and prescribe mitigation protocols.',
  };

  let sysPrompt = agentPersonas[activeAgent] || agentPersonas['odin'];
  sysPrompt +=
    '\nQuillhub Context: Quillhub is a B2B SaaS route-optimization platform in Austin, TX. ' +
    'Upstream provider is StratoNode (A1/A2/A3, 99.5% uptime, $8k/mo). ' +
    'Downstream customer is Harbor Retail (B1/B2, 99.9% uptime, $40k/mo). ' +
    'Customer is Vantage Logistics (C1, $3M insurance requirement). ' +
    'Contractor is Pixelwright (D1, $65k fixed fee, 10-business-day deemed acceptance). ' +
    'Keep answers concise, direct, and legally grounded.';

  if (llmService.isAvailable && message) {
    try {
      const answer = await llmService.generate(message, sysPrompt);
      if (answer) {
        res.json({
          agentId: activeAgent,
          response: answer,
          model: llmService.activeModel,
          source: `${llmService.activeProvider}_llm`,
        });
        return;
      }
    } catch {}
  }

  // Fallback rule-based response
  res.json({
    agentId: activeAgent,
    response: `[${activeAgent.toUpperCase()} ADVISORY]: Quillhub agreements require strict written notice compliance. Review contract clauses and simulated clock deadlines.`,
    model: 'rule_based_fallback',
    source: 'deterministic',
  });
});
