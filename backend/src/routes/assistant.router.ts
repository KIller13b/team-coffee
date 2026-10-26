import { Router, Request, Response, NextFunction } from 'express';
import { AssistantQuerySchema } from '../models/Assistant.types';
import { assistantOrchestrator } from '../services/assistantOrchestrator';
import { evidenceRetrievalService } from '../services/evidenceRetrievalService';

export const assistantRouter = Router();

// POST /api/assistant/query
assistantRouter.post('/query', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = AssistantQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation Error',
        detail: 'Invalid query parameters provided',
        issues: parseResult.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    const answer = await assistantOrchestrator.handleQuery(parseResult.data);
    res.json(answer);
  } catch (err) {
    next(err);
  }
});

// GET /api/assistant/investigations
assistantRouter.get('/investigations', (req: Request, res: Response) => {
  const list = assistantOrchestrator.getRecentInvestigations();
  res.json({
    total: list.length,
    investigations: list.map((inv) => ({
      id: inv.id,
      query: inv.query,
      timestamp: inv.timestamp,
      durationMs: inv.durationMs,
      summary: inv.answer.summary,
      targetContracts: inv.answer.queryIntent.targetContracts,
      claimsCount: inv.answer.claims.length,
      hasCalculation: Boolean(inv.answer.calculation),
    })),
  });
});

// GET /api/assistant/investigations/:id
assistantRouter.get('/investigations/:id', (req: Request, res: Response) => {
  const match = assistantOrchestrator.getInvestigationById(req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Investigation not found', detail: `ID '${req.params.id}' not found.` });
    return;
  }
  res.json(match);
});

// GET /api/assistant/sources/:sourceId
assistantRouter.get('/sources/:sourceId', (req: Request, res: Response) => {
  const sId = req.params.sourceId;

  // Search across recent investigations
  const allInvestigations = assistantOrchestrator.getRecentInvestigations();
  for (const inv of allInvestigations) {
    const found = inv.answer.citations.find((c) => c.id === sId);
    if (found) {
      res.json(found);
      return;
    }
  }

  // Contract clause fallback
  const sUpper = sId.toUpperCase();
  if (sUpper.startsWith('CIT-') && (sUpper.includes('B1') || sUpper.includes('A1') || sUpper.includes('A2') || sUpper.includes('D1') || sUpper.includes('C1'))) {
    const parts = sUpper.split('-');
    const cid = parts[1];
    const text = evidenceRetrievalService.loadContractText(cid);
    if (text) {
      res.json({
        id: sId,
        sourceType: 'contract_clause',
        contractId: cid,
        contractName: evidenceRetrievalService.getContractFriendlyName(cid),
        verbatimExcerpt: text.slice(0, 1000),
        confidence: 0.95,
      });
      return;
    }
  }

  res.status(404).json({ error: 'Citation source not found', sourceId: sId });
});
