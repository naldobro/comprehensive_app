import React from 'react';
import { Topic, Task, StaleTaskRecord, DoneTaskRecord } from '../types';
import { TrendingUp, Target, Clock, CheckCircle, Zap, Award } from 'lucide-react';

interface QuickStatsBarProps {
  topics: Topic[];
  tasks: Task[];
  staleRecords: StaleTaskRecord[];
  doneRecords: DoneTaskRecord[];
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  topics,
  tasks,
  staleRecords,
  doneRecords,
}) => {
  const completedTasks = tasks.filter(t => t.completed).length + doneRecords.length;
  const totalTasks = tasks.length + staleRecords.length + doneRecords.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate streak
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    return date.toDateString();
  });
  
  const recentCompletions = [...tasks.filter(t => t.completed), ...doneRecords]
    .filter(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && last7Days.includes(completedDate.toDateString());
    });
  
  const streak = last7Days.filter(day => 
    recentCompletions.some(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && completedDate.toDateString() === day;
    })
  ).length;

  const stats = [
    {
      icon: Target,
      label: 'Active Topics',
      value: topics.length,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: CheckCircle,
      label: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      color: completionRate >= 70 ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100',
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: `${streak} days`,
      color: streak >= 3 ? 'text-purple-600 bg-purple-100' : 'text-gray-600 bg-gray-100',
    },
    {
      icon: Clock,
      label: 'Pending Tasks',
      value: tasks.filter(t => !t.completed).length,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600" />
          Quick Stats
        </h3>
        {completionRate >= 80 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Award size={12} />
            High Performer
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 font-medium truncate">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};