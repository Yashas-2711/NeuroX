import type { Request, Response } from "express";
import * as service from "../services/impact-twin.service";
import { AppError } from "../utils/app-error";
import { indicatorCreateSchema, indicatorUpdateSchema, scenarioCreateSchema, scenarioUpdateSchema, observationCreateSchema, historyQuerySchema } from "../validators/impact.validators";

const actor = (request: Request) => { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; };
const parse = <T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }, value: unknown) => { const result = schema.safeParse(value); if (!result.success) throw new AppError("Invalid impact data", 400); return result.data as T; };
export async function get(request: Request, response: Response) { response.json({ success: true, data: await service.getImpactTwin(request.params.problemId as string, actor(request)) }); }
export async function createIndicator(request: Request, response: Response) { const item = await service.createIndicator(request.params.problemId as string, parse(indicatorCreateSchema, request.body), actor(request)); response.status(201).json({ success: true, data: { indicator: item } }); }
export async function updateIndicator(request: Request, response: Response) { const item = await service.updateIndicator(request.params.problemId as string, request.params.indicatorId as string, parse(indicatorUpdateSchema, request.body), actor(request)); response.json({ success: true, data: { indicator: item } }); }
export async function createScenario(request: Request, response: Response) { const item = await service.createScenario(request.params.problemId as string, parse(scenarioCreateSchema, request.body), actor(request)); response.status(201).json({ success: true, data: { scenario: item } }); }
export async function updateScenario(request: Request, response: Response) { const item = await service.updateScenario(request.params.problemId as string, request.params.scenarioId as string, parse(scenarioUpdateSchema, request.body), actor(request)); response.json({ success: true, data: { scenario: item } }); }
export async function observe(request: Request, response: Response) { const item = await service.recordObservation(request.params.problemId as string, parse(observationCreateSchema, request.body), actor(request)); response.status(201).json({ success: true, data: { observation: item } }); }
export async function history(request: Request, response: Response) { const query = parse(historyQuerySchema, request.query); response.json({ success: true, data: await service.getHistory(request.params.problemId as string, query, actor(request)) }); }
