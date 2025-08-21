import z from 'zod';
import {Message} from './common';
import {ExpertName} from './expert_name';

export interface PlanIndices {
    prev: number;
    now: number;
    next: number;
    last: number;
}

export interface ExpertPlan {
    expert: ExpertName;
    task: ExpertTask;
}

export interface ExpertTask {
    type: string;
    topic: string;
    content: any;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ExecutionResult {
    output: ExpertOutput;
    newTasks?: ExpertTask[];
}

export type ExpertOutput =
    | {
          type: 'info';
          messages: Message[];
      }
    | {
          type: 'execution_plan';
          messages?: Message[];
      }
    | {
          type: 'plan';
          messages?: Message[];
      };

export interface Expert<TInput = ExpertTask> {
    name: ExpertName;
    description: string;
    taskTypes: string[];
    isExecutingInternalPlan: boolean;
    run(context: ExpertContext, input: TInput): Promise<ExpertOutput>;
    runNextInternalPlan(context: ExpertContext): Promise<ExpertOutput>;
    isInternalPlanCompleted(): boolean;
    getInputSchema(): z.ZodTypeAny;
}

export interface ExpertContext {
    userRequest: string;
    workspacePath: string;
}
