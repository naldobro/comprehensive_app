import React from 'react';
import { useState } from 'react';
import { Task } from '../types';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/timeCalculations';

interface WeeklyTaskGridProps {
  tasks: Task[];
  weekDates: Date[];
  month: number;
  week: number;
}

export const WeeklyTaskGrid: React.FC<WeeklyTaskGridProps> = ({ 
  tasks, 
  weekDates, 
  month, 
  week 
}) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group tasks by day (1-7)
  const tasksByDay = tasks.reduce((acc, task) => {
    if (task.completionDay) {
      if (!acc[task.completionDay]) {
        acc[task.completionDay] = [];
      }
      acc[task.completionDay].push(task);
    }
    return acc;
  }, {} as Record<number, Task[]>);

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else if (direction === 'next' && currentDayIndex < 6) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  // Mobile view - show one day at a time
  if (isMobile) {
    const currentDay = currentDayIndex + 1;
    const dayTasks = tasksByDay[currentDay] || [];

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Mobile Header with Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay('prev')}
              disabled={currentDayIndex === 0}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg">Day {currentDay}</div>
              <div className="text-sm text-gray-500">{formatDate(weekDates[currentDayIndex])}</div>
            </div>
            
            <button
              onClick={() => navigateDay('next')}
              disabled={currentDayIndex === 6}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Day indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {[0, 1, 2, 3, 4, 5, 6].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentDayIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentDayIndex 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Mobile Task Content */}
        <div className="p-4 min-h-[300px]">
          {dayTasks.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No tasks completed</p>
              <p className="text-sm">No tasks were completed on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} completed
              </div>
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-green-900 text-base leading-tight mb-2">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-green-700 leading-relaxed mb-3">
                          {task.description}
                        </p>
                      )}
                      {task.completedAt && (
                        <p className="text-sm text-green-600 font-medium">
                          Completed at {new Intl.DateTimeFormat('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(task.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view - show all days in grid
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
            <div className="font-semibold text-gray-900 mb-1">Day {day}</div>
            <div className="text-xs text-gray-500">{formatDate(weekDates[day - 1])}</div>
          </div>
        ))}
      </div>
      
      {/* Task Grid */}
      <div className="grid grid-cols-7 min-h-[200px]">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const dayTasks = tasksByDay[day] || [];
          
          return (
            <div key={day} className="p-3 border-r border-gray-200 last:border-r-0 space-y-2">
              {dayTasks.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <CheckCircle size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No tasks</p>
                </div>
              ) : (
                dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-green-50 border border-green-200 rounded-lg p-2 hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-green-900 text-xs leading-tight mb-1 truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-green-700 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {task.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            {new Intl.DateTimeFormat('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(task.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};