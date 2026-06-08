export type Assignee = 'Michele' | 'Angelo' | 'Entrambi';
export type Priority = 'Bassa' | 'Media' | 'Alta';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  assignee: Assignee;
  priority: Priority;
}
