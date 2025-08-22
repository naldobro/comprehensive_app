import { Task } from '../types';

export const STALE_TASK_DAYS = 3;

// Helper function to get the start of a day
const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Helper function to get days difference based on calendar days, not hours
const getCalendarDaysDifference = (date1: Date, date2: Date): number => {
  const start = getStartOfDay(date1);
  const end = getStartOfDay(date2);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const isTaskStale = (task: Task): boolean => {
  if (task.completed) return false;
  
  const now = new Date();
  const daysOld = getCalendarDaysDifference(task.createdAt, now);
  
  return daysOld >= STALE_TASK_DAYS;
};

export const getTaskAge = (task: Task): number => {
  const now = new Date();
  return getCalendarDaysDifference(task.createdAt, now);
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
  const daysOld = getCalendarDaysDifference(task.completedAt, now);
  
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