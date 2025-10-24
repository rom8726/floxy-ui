export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  definition: any;
  created_at: string;
}

export interface WorkflowInstance {
  id: number;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: any;
  output: any;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: number;
  instance_id: number;
  step_name: string;
  step_type: 'task' | 'parallel' | 'condition' | 'fork' | 'join' | 'save_point';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'compensation' | 'rolled_back';
  input: any;
  output: any;
  error: string | null;
  retry_count: number;
  max_retries: number;
  compensation_retry_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ActiveWorkflow {
  id: number;
  workflow_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  duration_seconds: number;
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  running_steps: number;
  compensation_steps: number;
  rolled_back_steps: number;
}

export interface WorkflowStats {
  name: string;
  version: number;
  total_instances: number;
  completed: number;
  failed: number;
  running: number;
  avg_duration_seconds: number | null;
}
