import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/university.service";
import { universityProblemQuerySchema, universityProfileSchema } from "../validators/university.validators";
function userId(req:Request){if(!req.auth)throw new AppError("Authentication required",401);return req.auth.userId;}
export async function profile(req:Request,res:Response){res.json({success:true,data:{profile:await service.getProfile(userId(req))}})}
export async function updateProfile(req:Request,res:Response){const p=universityProfileSchema.safeParse(req.body);if(!p.success)throw new AppError("Invalid university profile",400);res.json({success:true,message:"University profile saved",data:{profile:await service.saveProfile(userId(req),p.data)}})}
export async function problems(req:Request,res:Response){const p=universityProblemQuerySchema.safeParse(req.query);if(!p.success)throw new AppError("Invalid problem filters",400);res.json({success:true,data:await service.listProblems(userId(req),p.data)})}
export async function problem(req:Request,res:Response){res.json({success:true,data:{problem:await service.getProblem(userId(req),req.params.id as string)}})}
export async function matches(req:Request,res:Response){res.json({success:true,data:{matches:await service.getMatches(userId(req))}})}
export async function searchMembers(req:Request,res:Response){res.json({success:true,data:{users:await service.searchMembers(userId(req),String(req.query.q??""))}})}
export async function match(req:Request,res:Response){res.json({success:true,data:{match:(await service.getProblem(userId(req),req.params.id as string)).match}})}
export async function expressInterest(req:Request,res:Response){res.status(201).json({success:true,message:"Interest expressed successfully",data:await service.interest(userId(req),req.params.id as string)})}
