import React, { useState } from 'react';
import { Task, Topic } from '../types';
import { TaskItem } from './TaskItem';
import { Clock, ChevronDown, ChevronUp, Archive, AlertTriangle } from 'lucide-react';
import { getTaskAge, formatTaskAge } from '../utils/taskAging';

interface StaleTasksSectionProps {
  staleTasks: Task[];
  topics: Topic[];
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
}

export const StaleTasksSection: React.FC<StaleTasksSectionProps> = ({
  staleTasks,
  topics,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (staleTasks.length === 0) return null;

  // Sort stale tasks by age (oldest first)
  const sortedStaleTasks = [...staleTasks].sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <div className="mb-8">
      <div 
        className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg shadow-sm">
            <Archive size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-amber-900">
                Stale Tasks ({staleTasks.length})
              </h2>
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <p className="text-sm text-amber-700">
              Tasks older than 3 days that need attention
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-amber-700 font-medium">
            {isExpanded ? 'Hide' : 'Show'} tasks
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-amber-600" />
          ) : (
            <ChevronDown size={20} className="text-amber-600" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {sortedStaleTasks.map(task => {
            const taskTopic = topics.find(topic => topic.id === task.topicId);
            const taskAge = getTaskAge(task);
            
            return taskTopic ? (
              <div key={task.id} className="relative">
                <div className="absolute -left-2 top-4 w-1 h-8 bg-amber-400 rounded-full"></div>
                <div className="bg-white border border-amber-200 rounded-xl overflow-hidden">
                  <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-amber-600" />
                      <span className="font-medium text-amber-800">
                        {formatTaskAge(taskAge)}
                      </span>
                      <span className="text-amber-600">•</span>
                      <span className="text-amber-700">
                        Created {task.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-1">
                    <TaskItem
                      task={task}
                      topic={taskTopic}
                      onToggleComplete={onToggleComplete}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  </div>
                </div>
              </div>
            ) : null;
          })}
          
          <div className="text-center py-4">
            <p className="text-sm text-amber-700">
              💡 <strong>Tip:</strong> Complete or delete these tasks to keep your workspace clean
            </p>
          </div>
        </div>
      )}
    </div>
  );
};