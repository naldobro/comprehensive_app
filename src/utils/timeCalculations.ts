export interface TimePosition {
  month: number;
  week: number;
  day: number;
}

export interface TimeContext {
  currentMonth: number;
  currentWeek: number;
  currentDay: number;
  startDate: Date;
}

export const calculateTimePosition = (date: Date, startDate: Date): TimePosition => {
  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate which day (1-7), week (1-4), and month (1, 2, 3...)
  const totalDays = diffDays + 1; // +1 because day 1 is the start date
  const day = ((totalDays - 1) % 7) + 1; // 1-7
  const totalWeeks = Math.ceil(totalDays / 7);
  const week = ((totalWeeks - 1) % 4) + 1; // 1-4
  const month = Math.ceil(totalWeeks / 4); // 1, 2, 3...
  
  return { month, week, day };
};

export const getCurrentTimeContext = (startDate: Date): TimeContext => {
  const now = new Date();
  const position = calculateTimePosition(now, startDate);
  
  return {
    currentMonth: position.month,
    currentWeek: position.week,
    currentDay: position.day,
    startDate
  };
};

export const getTimeContextForDate = (date: Date, startDate: Date): TimeContext => {
  const position = calculateTimePosition(date, startDate);
  
  return {
    currentMonth: position.month,
    currentWeek: position.week,
    currentDay: position.day,
    startDate
  };
};

export const getDateForPosition = (month: number, week: number, day: number, startDate: Date): Date => {
  // Calculate total days from start
  const totalWeeks = (month - 1) * 4 + (week - 1);
  const totalDays = totalWeeks * 7 + (day - 1);
  
  const resultDate = new Date(startDate);
  resultDate.setDate(startDate.getDate() + totalDays);
  return resultDate;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getWeekDates = (month: number, week: number, startDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let day = 1; day <= 7; day++) {
    dates.push(getDateForPosition(month, week, day, startDate));
  }
  return dates;
};