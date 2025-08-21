import React from 'react';
import { Task, Topic } from '../types';
import { TaskItem } from './TaskItem';
import { Clock, Calendar } from 'lucide-react';

interface FreshTasksSectionProps {
  freshTasks: Task[];
  topics: Topic[];
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
}

export const FreshTasksSection: React.FC<FreshTasksSectionProps> = ({
  freshTasks,
  topics,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  // Categorize tasks by age in days
  const categorizeTasksByDays = (tasks: Task[]) => {
    const now = new Date();
    const day1: Task[] = []; // Today (0-24 hours old)
    const day2: Task[] = []; // Yesterday (24-48 hours old)
    const day3: Task[] = []; // Day before yesterday (48-72 hours old)

    tasks.forEach(task => {
      const taskAge = now.getTime() - task.createdAt.getTime();
      const hoursOld = taskAge / (1000 * 60 * 60);
      
      if (hoursOld < 24) {
        day1.push(task);
      } else if (hoursOld < 48) {
        day2.push(task);
      } else if (hoursOld < 72) {
        day3.push(task);
      }
    });

    return { day1, day2, day3 };
  };

  const { day1, day2, day3 } = categorizeTasksByDays(freshTasks);

  const formatDayLabel = (dayNumber: number) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (dayNumber - 1));
    
    if (dayNumber === 1) {
      return {
        title: 'Day 1 - Today',
        subtitle: targetDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        color: 'bg-green-50 border-green-200 text-green-800',
        iconColor: 'text-green-600',
        dotColor: 'bg-green-500'
      };
    } else if (dayNumber === 2) {
      return {
        title: 'Day 2 - Yesterday',
        subtitle: targetDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconColor: 'text-yellow-600',
        dotColor: 'bg-yellow-500'
      };
    } else {
      return {
        title: 'Day 3 - 2 Days Ago',
        subtitle: targetDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        iconColor: 'text-orange-600',
        dotColor: 'bg-orange-500'
      };
    }
  };

  const renderTaskColumn = (tasks: Task[], dayNumber: number) => {
    const dayInfo = formatDayLabel(dayNumber);
    
    return (
      <div className="flex-1 min-w-0">
        {/* Column Header */}
        <div className={`p-4 rounded-t-xl border ${dayInfo.color} border-b-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-white bg-opacity-50 rounded-lg`}>
                <Clock size={18} className={dayInfo.iconColor} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{dayInfo.title}</h3>
                <p className="text-xs opacity-90">{dayInfo.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${dayInfo.dotColor} rounded-full`}></div>
              <span className="text-sm font-medium">{tasks.length}</span>
            </div>
          </div>
        </div>

        {/* Tasks Container */}
        <div className="bg-white border border-gray-200 rounded-b-xl h-[400px] p-3 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">No tasks</p>
              <p className="text-xs">No tasks for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Newest first
                .map(task => {
                  const taskTopic = topics.find(topic => topic.id === task.topicId);
                  return taskTopic ? (
                    <div key={task.id} className="relative">
                      {/* Age indicator */}
                      <div className={`absolute -left-1 top-4 w-1 h-8 ${dayInfo.dotColor} rounded-full opacity-60`}></div>
                      <TaskItem
                        task={task}
                        topic={taskTopic}
                        onToggleComplete={onToggleComplete}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                      />
                    </div>
                  ) : null;
                })
              }
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-blue-600" size={24} />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Fresh Tasks ({freshTasks.length})
          </h2>
          <p className="text-sm text-gray-600">
            Tasks organized by creation date - newest on the right
          </p>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Day 3 Column (leftmost - oldest) */}
        {renderTaskColumn(day3, 3)}
        
        {/* Day 2 Column (middle) */}
        {renderTaskColumn(day2, 2)}
        
        {/* Day 1 Column (rightmost - newest) */}
        {renderTaskColumn(day1, 1)}
      </div>
    </div>
  );
};