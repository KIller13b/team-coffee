import { Router, Request, Response, NextFunction } from 'express';
import { SimulationRequestSchema } from '../models/Simulation.types';
import { simulationService } from '../services/simulationService';
import { warRoomState } from '../services/warRoomState';
import { ContractModel, normalizeContractId } from '../models/Contract.model';
import { SEED_CONTRACTS } from '../data/seedData';

export const simulationRouter = Router();

/**
 * Predefined scenario templates for What-If Strategy Sandbox
 */
const SCENARIO_TEMPLATES = [
  {
    id: 'tpl-vendor-default',
    scenarioType: 'vendor_default',
    name: 'Major Infrastructure Outage (Vendor Default)',
    description:
      'Simulate an unplanned critical cloud compute service outage exceeding SLA commitments, and trace downstream enterprise customer breaches.',
    defaultParams: {
      outageDurationHours: 24,
      curePeriodDays: 0,
    },
  },
  {
    id: 'tpl-early-termination-conv',
    scenarioType: 'early_termination',
    name: 'Early Termination for Convenience',
    description:
      'Evaluate immediate financial exposure, required notice period liabilities, and downstream vendor replacement obligations.',
    defaultParams: {
      reason: 'convenience',
    },
  },
  {
    id: 'tpl-milestone-delay',
    scenarioType: 'milestone_failure',
    name: 'Milestone Deliverable Failure & Deemed Acceptance',
    description:
      'Simulate deliverable non-acceptance past the inspection window and analyze deemed acceptance fee or delay damage triggers.',
    defaultParams: {
      delayDays: 30,
      isCritical: true,
    },
  },
];

// GET /api/simulation/scenarios
simulationRouter.get('/scenarios', (req: Request, res: Response) => {
  res.json({
    templates: SCENARIO_TEMPLATES,
    supportedTypes: ['vendor_default', 'early_termination', 'milestone_failure'],
  });
});

// GET /api/simulation/dependencies/:id
simulationRouter.get('/dependencies/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const norm = normalizeContractId(rawId);

    const allContracts = await getAllContracts();
    const target = allContracts.find(
      (c) => normalizeContractId(c.id) === norm || c.id === rawId
    );

    if (!target) {
      res.status(404).json({ error: 'Contract not found', detail: `Contract '${rawId}' was not found.` });
      return;
    }

    const cleanTargetId = norm.toLowerCase();
    const dependentContracts = allContracts.filter((c) => {
      if (c.id === target.id) return false;
      const related = (c.relatedContractIds || []).map((r) => normalizeContractId(r).toLowerCase());
      const isRelated = related.includes(cleanTargetId);
      const isSupplierDownstream =
        cleanTargetId.includes('a1') && (c.id.toLowerCase().includes('b1') || c.id.toLowerCase().includes('c1'));
      return isRelated || isSupplierDownstream;
    });

    res.json({
      contractId: target.id,
      title: target.title,
      dependenciesCount: dependentContracts.length,
      dependents: dependentContracts.map((d) => ({
        id: d.id,
        title: d.title,
        counterparty: d.counterparty,
        contractType: d.contractType,
        totalValueINR: d.totalValueINR,
        relationshipType: 'downstream',
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/simulation/what-if
simulationRouter.post('/what-if', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Zod input validation
    const parseResult = SimulationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation Error',
        detail: 'Invalid simulation parameters provided',
        issues: parseResult.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    const simRequest = parseResult.data;
    const targetNorm = normalizeContractId(simRequest.contractId);

    // 2. Fetch contracts snapshot (read-only)
    const allContracts = await getAllContracts();
    const targetContract = allContracts.find(
      (c) => normalizeContractId(c.id) === targetNorm || c.id === simRequest.contractId
    );

    if (!targetContract) {
      res.status(404).json({
        error: 'Contract not found',
        detail: `Contract with ID '${simRequest.contractId}' was not found in the repository.`,
        availableContracts: allContracts.map((c) => ({ id: c.id, title: c.title })),
      });
      return;
    }

    // 3. Execute pure, isolated deterministic simulation
    const simulationResult = simulationService.simulate(
      simRequest,
      targetContract,
      allContracts
    );

    res.json(simulationResult);
  } catch (err) {
    next(err);
  }
});

/**
 * Fetch all available contracts from in-memory state or DB without mutating state
 */
async function getAllContracts(): Promise<any[]> {
  if (warRoomState.contracts && warRoomState.contracts.length > 0) {
    return warRoomState.contracts;
  }
  try {
    const dbContracts = await ContractModel.find().lean();
    if (dbContracts.length > 0) return dbContracts;
  } catch {}
  return SEED_CONTRACTS;
}
