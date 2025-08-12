import { Task } from '../types';

export const STALE_TASK_DAYS = 3;

export const isTaskStale = (task: Task): boolean => {
  if (task.completed) return false;
  
  const now = new Date();
  const taskAge = now.getTime() - task.createdAt.getTime();
  const daysOld = taskAge / (1000 * 60 * 60 * 24);
  
  return daysOld >= STALE_TASK_DAYS;
};

export const getTaskAge = (task: Task): number => {
  const now = new Date();
  const taskAge = now.getTime() - task.createdAt.getTime();
  return Math.floor(taskAge / (1000 * 60 * 60 * 24));
};

export const formatTaskAge = (days: number): string => {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export const categorizeTasksByAge = (tasks: Task[]) => {
  const fresh: Task[] = [];
  const stale: Task[] = [];
  
  tasks.forEach(task => {
    if (isTaskStale(task)) {
      stale.push(task);
    } else {
      fresh.push(task);
    }
  });
  
  return { fresh, stale };
};

export const isTaskOldCompleted = (task: Task): boolean => {
  if (!task.completed || !task.completedAt) return false;
  
  const now = new Date();
  const completedAge = now.getTime() - task.completedAt.getTime();
  const daysOld = completedAge / (1000 * 60 * 60 * 24);
  
  return daysOld >= 7;
};

export const categorizeCompletedTasksByAge = (tasks: Task[]) => {
  const recent: Task[] = [];
  const old: Task[] = [];
  
  tasks.forEach(task => {
    if (task.completed) {
      if (isTaskOldCompleted(task)) {
        old.push(task);
      } else {
        recent.push(task);
      }
    }
  });
  
  return { recent, old };
};