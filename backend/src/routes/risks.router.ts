import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { warRoomState } from '../services/warRoomState';
import { RiskModel } from '../models/Risk.model';

export const risksRouter = Router();

// GET /api/risks
risksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { severity, contract_id, contractId, status } = req.query;
    const targetCid = (contract_id || contractId) as string | undefined;

    if (warRoomState.contracts.length === 0) {
      res.json([]);
      return;
    }

    const activeIds = new Set(warRoomState.contracts.map((c) => c.id));
    const cleanKeys = new Set(warRoomState.contracts.map((c) => c.id.replace('cnt-', '').toUpperCase()));

    let risks = warRoomState.risks.filter(
      (r) =>
        activeIds.has(r.contractId) ||
        cleanKeys.has((r.contractId || '').replace('cnt-', '').toUpperCase())
    );

    if (severity && severity !== 'all') {
      risks = risks.filter((r) => r.severity === severity);
    }
    if (targetCid && targetCid !== 'all') {
      risks = risks.filter((r) => r.contractId === targetCid);
    }
    if (status && status !== 'all') {
      risks = risks.filter((r) => r.status === status);
    }

    res.json(risks);
  } catch (err) {
    next(err);
  }
});

// GET /api/risks/:id
risksRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const match = warRoomState.risks.find((r) => r.id === id);
    if (match) {
      res.json(match);
      return;
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbRisk = await RiskModel.findOne({ id }).lean();
      if (dbRisk) {
        res.json(dbRisk);
        return;
      }
    }

    res.status(404).json({ detail: 'Risk not found', error: 'Risk not found' });
  } catch (err) {
    next(err);
  }
});
