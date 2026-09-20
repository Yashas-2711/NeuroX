import { model, models, Schema, Types } from "mongoose";

const objectId = Schema.Types.ObjectId;

export const USER_ROLES = ["CITIZEN", "STUDENT", "UNIVERSITY", "INDUSTRY", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    avatar: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const User = models.User ?? model<IUser>("User", UserSchema);

export const PROBLEM_CATEGORIES = [
  "Education",
  "Healthcare",
  "Agriculture",
  "Water Resources",
  "Sanitation",
  "Environment",
  "Livelihoods",
  "Accessibility",
  "Infrastructure",
  "Public Services",
] as const;
export type ProblemCategory = (typeof PROBLEM_CATEGORIES)[number];

export const PROBLEM_STATUSES = [
  "SUBMITTED",
  "VALIDATING",
  "VALIDATED",
  "REJECTED",
  "MATCHED",
  "IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
] as const;
export const PROBLEM_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const LocationSchema = new Schema(
  {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number], default: undefined },
  },
  { _id: false },
);

const EvidenceSchema = new Schema(
  {
    description: { type: String, trim: true, maxlength: 2000 },
    reference: { type: String, trim: true, maxlength: 500 },
    url: { type: String, trim: true },
    type: { type: String, trim: true },
    caption: { type: String, trim: true, maxlength: 240 },
  },
  { _id: false },
);

const ProblemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    category: { type: String, enum: PROBLEM_CATEGORIES, required: true, index: true },
    location: { type: LocationSchema },
    evidence: { type: [EvidenceSchema], default: [] },
    submittedBy: { type: objectId, ref: "User", required: true, index: true },
    aiClassification: { type: String, trim: true },
    aiConfidence: { type: Number, min: 0, max: 1 },
    embedding: { type: [Number], default: undefined },
    aiAnalysisStatus: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING", index: true },
    aiAnalyzedAt: { type: Date },
    similarProblems: [{ type: objectId, ref: "Problem" }],
    priority: { type: String, enum: PROBLEM_PRIORITIES, default: "MEDIUM" },
    status: { type: String, enum: PROBLEM_STATUSES, default: "SUBMITTED", index: true },
    assignedUniversity: { type: objectId, ref: "University", index: true },
    validatedAt: { type: Date },
    validatedBy: { type: objectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: objectId, ref: "User" },
    rejectionReason: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

ProblemSchema.index({ createdAt: -1 });
export const Problem = models.Problem ?? model("Problem", ProblemSchema);

const ContactSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

export interface IUniversity {
  user: Types.ObjectId;
  name: string;
  description?: string;
  location?: Types.ObjectId;
  departments: string[];
  expertise: string[];
  capabilities: string[];
  domains: string[];
  researchAreas: string[];
  skills: string[];
  resources: string[];
  collaborationInterests: string[];
  profileLocation?: { city?: string; state?: string; country?: string };
  contact?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    user: { type: objectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    location: { type: objectId },
    departments: { type: [String], default: [] },
    expertise: { type: [String], default: [], index: true },
    capabilities: { type: [String], default: [] },
    domains: { type: [String], default: [], index: true },
    researchAreas: { type: [String], default: [], index: true },
    skills: { type: [String], default: [] },
    resources: { type: [String], default: [] },
    collaborationInterests: { type: [String], default: [] },
    profileLocation: {
      city: { type: String, trim: true, maxlength: 120 },
      state: { type: String, trim: true, maxlength: 120 },
      country: { type: String, trim: true, maxlength: 120 },
    },
    contact: { type: ContactSchema },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

UniversitySchema.index({ location: 1 });
export const University = models.University ?? model<IUniversity>("University", UniversitySchema);

export const INTEREST_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
const UniversityInterestSchema = new Schema(
  {
    university: { type: objectId, ref: "University", required: true, index: true },
    problem: { type: objectId, ref: "Problem", required: true, index: true },
    status: { type: String, enum: INTEREST_STATUSES, default: "PENDING" },
  },
  { timestamps: true },
);
UniversityInterestSchema.index({ university: 1, problem: 1 }, { unique: true });
export const UniversityInterest = models.UniversityInterest ?? model("UniversityInterest", UniversityInterestSchema);

const IndustrySchema = new Schema(
  {
    user: { type: objectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    industryType: { type: String, trim: true, index: true },
    location: { type: objectId },
    expertise: { type: [String], default: [], index: true },
    capabilities: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    resources: { type: [String], default: [] },
    facilities: { type: [String], default: [] },
    collaborationInterests: { type: [String], default: [] },
    profileLocation: {
      city: { type: String, trim: true, maxlength: 120 },
      state: { type: String, trim: true, maxlength: 120 },
      country: { type: String, trim: true, maxlength: 120 },
    },
    contact: { type: ContactSchema },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

IndustrySchema.index({ location: 1 });
export const Industry = models.Industry ?? model("Industry", IndustrySchema);

const TeamMemberSchema = new Schema(
  {
    user: { type: objectId, ref: "User", required: true },
    role: { type: String, enum: ["LEADER", "MEMBER"], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    project: { type: objectId, ref: "Project", required: true, unique: true, index: true },
    university: { type: objectId, ref: "University", required: true, index: true },
    leader: { type: objectId, ref: "User", required: true },
    members: { type: [TeamMemberSchema], default: [] },
  },
  { timestamps: true },
);

export const Team = models.Team ?? model("Team", TeamSchema);

export const PROJECT_STATUSES = ["PROPOSED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

const MilestoneReferenceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 3000 },
    type: { type: String, enum: ["RESEARCH", "DESIGN", "PROTOTYPE", "TESTING", "DEPLOYMENT"], required: true },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED"], default: "PENDING" },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    problem: { type: objectId, ref: "Problem", required: true, index: true },
    university: { type: objectId, ref: "University", required: true, index: true },
    createdBy: { type: objectId, ref: "User", required: true, index: true },
    startDate: { type: Date },
    targetEndDate: { type: Date },
    facultyMentor: { type: objectId, ref: "User" },
    studentTeam: { type: objectId, ref: "Team" },
    industryPartner: { type: objectId, ref: "Industry" },
    milestones: { type: [MilestoneReferenceSchema], default: [] },
    documents: { type: [String], default: [] },
    progressUpdates: { type: [String], default: [] },
    issues: { type: [String], default: [] },
    impact: { type: objectId, ref: "ImpactMetric" },
    status: { type: String, enum: PROJECT_STATUSES, default: "PROPOSED", index: true },
  },
  { timestamps: true },
);

ProjectSchema.index({ createdAt: -1 });
export const Project = models.Project ?? model("Project", ProjectSchema);

export const MILESTONE_TYPES = ["RESEARCH", "DESIGN", "PROTOTYPE", "TESTING", "DEPLOYMENT"] as const;

const MilestoneSchema = new Schema(
  {
    project: { type: objectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 3000 },
    type: { type: String, enum: MILESTONE_TYPES, required: true },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED"], default: "PENDING" },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

MilestoneSchema.index({ project: 1, dueDate: 1 });
export const Milestone = models.Milestone ?? model("Milestone", MilestoneSchema);

const SolutionSchema = new Schema(
  {
    problem: { type: objectId, ref: "Problem", required: true, index: true },
    project: { type: objectId, ref: "Project", index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    approach: { type: String, trim: true, maxlength: 10000 },
    expectedOutcome: { type: String, trim: true, maxlength: 5000 },
    requiredResources: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    submittedBy: { type: objectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["DRAFT", "SUBMITTED", "REJECTED", "APPROVED", "ACCEPTED", "PROTOTYPE", "TESTING", "IMPLEMENTATION", "COMPLETED", "ARCHIVED"], default: "DRAFT", index: true },
    reviewNotes: { type: String, trim: true, maxlength: 5000 },
    reviewedBy: { type: objectId, ref: "User" },
    reviewedAt: { type: Date },
    lifecycleNotes: { type: String, trim: true, maxlength: 5000 },
    stageUpdatedBy: { type: objectId, ref: "User" },
    stageUpdatedAt: { type: Date },
  },
  { timestamps: true },
);

SolutionSchema.index({ project: 1, status: 1 });
SolutionSchema.index({ problem: 1, status: 1 });
export const Solution = models.Solution ?? model("Solution", SolutionSchema);

export const COLLABORATION_TYPES = ["MENTORING", "FUNDING", "PROTOTYPING", "IMPLEMENTATION", "RESOURCE_SUPPORT"] as const;
export const COLLABORATION_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;

const CollaborationSchema = new Schema(
  {
    project: { type: objectId, ref: "Project", required: true, index: true },
    industry: { type: objectId, ref: "Industry", required: true, index: true },
    requestedBy: { type: objectId, ref: "User", required: true },
    type: { type: String, enum: COLLABORATION_TYPES, default: "RESOURCE_SUPPORT" },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: COLLABORATION_STATUSES, default: "PENDING", index: true },
    respondedAt: { type: Date },
    respondedBy: { type: objectId, ref: "User" },
  },
  { timestamps: true },
);

CollaborationSchema.index({ project: 1, industry: 1 }, { unique: true });
CollaborationSchema.index({ industry: 1, status: 1 });
CollaborationSchema.index({ project: 1, status: 1 });

export const Collaboration = models.Collaboration ?? model("Collaboration", CollaborationSchema);

const NotificationSchema = new Schema(
  {
    recipient: { type: objectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
export const Notification = models.Notification ?? model("Notification", NotificationSchema);

const ImpactMetricSchema = new Schema(
  {
    project: { type: objectId, ref: "Project", required: true, index: true },
    metric: { type: String, required: true, trim: true, maxlength: 160 },
    value: { type: Number, required: true },
    unit: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 2000 },
    recordedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export const ImpactMetric = models.ImpactMetric ?? model("ImpactMetric", ImpactMetricSchema);

export const modelsRegistry = {
  User,
  Problem,
  University,
  UniversityInterest,
  Industry,
  Team,
  Project,
  Milestone,
  Solution,
  Collaboration,
  Notification,
  ImpactMetric,
};
