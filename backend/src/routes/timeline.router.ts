import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { warRoomState } from '../services/warRoomState';
import { TimelineEventModel } from '../models/TimelineEvent.model';
import { ContractReportModel } from '../models/Report.model';

export const timelineRouter = Router();

// GET /api/clock
timelineRouter.get('/clock', (req: Request, res: Response) => {
  res.json({
    clockDate: warRoomState.clockDate,
    currentDate: warRoomState.clockDate,
    checkpoints: warRoomState.checkpoints,
  });
});

// POST /api/clock/set
timelineRouter.post('/clock/set', (req: Request, res: Response) => {
  const { clock_date, clockDate, date } = req.body;
  const targetDate = clock_date || clockDate || date || '2027-01-15';
  const result = warRoomState.setClock(targetDate);
  res.json({
    ...result,
    currentDate: targetDate,
    clockDate: targetDate,
  });
});

// GET /api/timeline/events
timelineRouter.get('/timeline/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (warRoomState.contracts.length === 0) {
      res.json([]);
      return;
    }
    const activeIds = new Set(warRoomState.contracts.map((c) => c.id));
    const cleanKeys = new Set(warRoomState.contracts.map((c) => c.id.replace('cnt-', '').toUpperCase()));

    const events = warRoomState.timelineEvents.filter(
      (e) =>
        activeIds.has(e.contractId) ||
        cleanKeys.has((e.contractId || '').replace('cnt-', '').toUpperCase())
    );
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/external
timelineRouter.get('/events/external', (req: Request, res: Response) => {
  res.json(warRoomState.rawEvents);
});

// GET /api/reports
timelineRouter.get('/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (warRoomState.contracts.length === 0) {
      res.json([]);
      return;
    }
    const activeIds = new Set(warRoomState.contracts.map((c) => c.id));
    const cleanKeys = new Set(warRoomState.contracts.map((c) => c.id.replace('cnt-', '').toUpperCase()));

    const reports = warRoomState.reports.filter(
      (r) =>
        !r.contractId ||
        activeIds.has(r.contractId) ||
        cleanKeys.has((r.contractId || '').replace('cnt-', '').toUpperCase())
    );
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id
timelineRouter.get('/reports/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const match = warRoomState.reports.find((r) => r.id === id);
    if (match) {
      res.json(match);
      return;
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbReport = await ContractReportModel.findOne({ id }).lean();
      if (dbReport) {
        res.json(dbReport);
        return;
      }
    }

    res.status(404).json({ detail: 'Report not found', error: 'Report not found' });
  } catch (err) {
    next(err);
  }
});
