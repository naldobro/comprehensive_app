export interface Topic {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  completedTasks: number;
  bio?: string;
}

export interface Milestone {
  id: string;
  title: string;
  topicId: string;
  createdAt: Date;
  order: number;
  type: 'monthly' | 'weekly';
  month: number;
  week?: number; // Only for weekly milestones
}

export interface Task {
  id: string;
  title: string;
  description: string;
  topicId: string;
  milestoneId?: string | null;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  completionMonth?: number;
  completionWeek?: number;
  completionDay?: number; // 1-7 within the week
}

export interface TimeContext {
  currentMonth: number;
  currentWeek: number;
  currentDay: number;
  startDate: Date; // When the topic was created, used as reference point
}

export interface UndoRedoAction {
  id: string;
  type: 'CREATE_TOPIC' | 'DELETE_TOPIC' | 'EDIT_TOPIC' | 'REORDER_TOPICS' | 
        'CREATE_TASK' | 'DELETE_TASK' | 'EDIT_TASK' | 'TOGGLE_TASK' |
        'CREATE_MILESTONE' | 'DELETE_MILESTONE' | 'EDIT_MILESTONE' |
        'UPDATE_BIO' | 'CREATE_QUOTE' | 'DELETE_QUOTE' | 'EDIT_QUOTE';
  timestamp: Date;
  data: any;
  reverseData: any;
}

export interface UndoRedoState {
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
}

export interface StaleTaskRecord {
  id: string;
  originalTaskId?: string;
  title: string;
  topicId: string;
  topicName: string;
  createdAt: Date;
  staleDate: Date;
}

export interface DoneTaskRecord {
  id: string;
  originalTaskId?: string;
  title: string;
  topicId: string;
  topicName: string;
  completedAt: Date;
  archivedDate: Date;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  colorScheme: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}