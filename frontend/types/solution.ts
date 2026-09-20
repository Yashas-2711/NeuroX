export type SolutionStatus = "DRAFT" | "SUBMITTED" | "REJECTED" | "APPROVED" | "ACCEPTED" | "PROTOTYPE" | "TESTING" | "IMPLEMENTATION" | "COMPLETED" | "ARCHIVED";

export interface Solution {
  id: string;
  project: string;
  problem: string;
  title: string;
  description: string;
  approach?: string;
  expectedOutcome?: string;
  requiredResources: string[];
  submittedBy: string;
  status: SolutionStatus;
  reviewNotes?: string;
  reviewedAt?: string;
  lifecycleNotes?: string;
  stageUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionPermissions { canReview: boolean; canManage: boolean; canSubmit?: boolean }

