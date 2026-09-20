import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/problem-dna.service";

function actor(request: Request) { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; }
function id(request: Request) { return Array.isArray(request.params.id) ? request.params.id[0] : request.params.id; }
export async function generate(request: Request, response: Response) { response.status(201).json({ success: true, data: { dna: await service.generate(id(request), actor(request)) } }); }
export async function get(request: Request, response: Response) { response.json({ success: true, data: { dna: await service.getDNA(id(request), actor(request)) } }); }
export async function status(request: Request, response: Response) { response.json({ success: true, data: await service.getStatus(id(request), actor(request)) }); }
