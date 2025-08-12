import React from 'react';
import { Task, Topic, StaleTaskRecord, DoneTaskRecord } from '../types';
import { TrendingUp, AlertTriangle, CheckCircle, Target, Clock, Lightbulb } from 'lucide-react';

interface ProductivityInsightsProps {
  topics: Topic[];
  tasks: Task[];
  staleRecords: StaleTaskRecord[];
  doneRecords: DoneTaskRecord[];
}

export const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({
  topics,
  tasks,
  staleRecords,
  doneRecords,
}) => {
  const insights = React.useMemo(() => {
    const allCompletedTasks = [...tasks.filter(t => t.completed), ...doneRecords];
    const totalTasks = tasks.length + staleRecords.length + doneRecords.length;
    const completionRate = totalTasks > 0 ? (allCompletedTasks.length / totalTasks) * 100 : 0;
    
    // Find most productive topic
    const topicStats = topics.map(topic => ({
      ...topic,
      completedCount: allCompletedTasks.filter(t => t.topicId === topic.id).length,
    }));
    const mostProductiveTopic = topicStats.reduce((max, topic) => 
      topic.completedCount > max.completedCount ? topic : max, 
      topicStats[0] || { name: 'None', completedCount: 0 }
    );
    
    // Calculate weekly completion trend
    const now = new Date();
    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return date.toDateString();
    });
    
    const thisWeekCompletions = allCompletedTasks.filter(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && thisWeek.includes(completedDate.toDateString());
    }).length;
    
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (i + 7) * 24 * 60 * 60 * 1000);
      return date.toDateString();
    });
    
    const lastWeekCompletions = allCompletedTasks.filter(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && lastWeek.includes(completedDate.toDateString());
    }).length;
    
    const weeklyTrend = lastWeekCompletions > 0 
      ? ((thisWeekCompletions - lastWeekCompletions) / lastWeekCompletions) * 100 
      : thisWeekCompletions > 0 ? 100 : 0;
    
    // Stale task ratio
    const staleRatio = totalTasks > 0 ? (staleRecords.length / totalTasks) * 100 : 0;
    
    return {
      completionRate,
      mostProductiveTopic,
      weeklyTrend,
      staleRatio,
      thisWeekCompletions,
      lastWeekCompletions,
    };
  }, [topics, tasks, staleRecords, doneRecords]);

  const getInsightCards = () => {
    const cards = [];
    
    // Completion rate insight
    if (insights.completionRate >= 80) {
      cards.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Performance!',
        description: `You're maintaining a ${insights.completionRate.toFixed(1)}% completion rate. Keep up the momentum!`,
        color: 'bg-green-50 border-green-200 text-green-800',
        iconColor: 'text-green-600',
      });
    } else if (insights.completionRate < 50) {
      cards.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Room for Improvement',
        description: `Your completion rate is ${insights.completionRate.toFixed(1)}%. Consider breaking tasks into smaller chunks.`,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconColor: 'text-yellow-600',
      });
    }
    
    // Weekly trend insight
    if (insights.weeklyTrend > 20) {
      cards.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Great Progress!',
        description: `You completed ${insights.thisWeekCompletions} tasks this week, up ${insights.weeklyTrend.toFixed(1)}% from last week.`,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        iconColor: 'text-blue-600',
      });
    } else if (insights.weeklyTrend < -20) {
      cards.push({
        type: 'info',
        icon: Clock,
        title: 'Productivity Dip',
        description: `You completed ${insights.thisWeekCompletions} tasks this week, down from ${insights.lastWeekCompletions} last week. Consider reviewing your schedule.`,
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        iconColor: 'text-orange-600',
      });
    }
    
    // Most productive topic
    if (insights.mostProductiveTopic.completedCount > 0) {
      cards.push({
        type: 'info',
        icon: Target,
        title: 'Top Performing Topic',
        description: `"${insights.mostProductiveTopic.name}" is your most productive topic with ${insights.mostProductiveTopic.completedCount} completed tasks.`,
        color: 'bg-purple-50 border-purple-200 text-purple-800',
        iconColor: 'text-purple-600',
      });
    }
    
    // Stale tasks warning
    if (insights.staleRatio > 25) {
      cards.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Too Many Stale Tasks',
        description: `${insights.staleRatio.toFixed(1)}% of your tasks are stale. Consider reviewing and updating them.`,
        color: 'bg-red-50 border-red-200 text-red-800',
        iconColor: 'text-red-600',
      });
    }
    
    return cards.slice(0, 3); // Show max 3 insights
  };

  const insightCards = getInsightCards();

  if (insightCards.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-600" size={20} />
        <h2 className="text-xl font-semibold text-gray-900">Productivity Insights</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border ${card.color} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white bg-opacity-50`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{card.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};