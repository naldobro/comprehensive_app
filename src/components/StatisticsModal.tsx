import React, { useState, useMemo } from 'react';
import { Topic, Task, StaleTaskRecord, DoneTaskRecord } from '../types';
import { X, BarChart3, TrendingUp, Target, Clock, Calendar, Award, Zap, Activity, PieChart, Users, CheckCircle2 } from 'lucide-react';
import { getTopicColor } from '../utils/topicColors';
import { getCurrentTimeContext } from '../utils/timeCalculations';

interface StatisticsModalProps {
  topics: Topic[];
  tasks: Task[];
  staleRecords: StaleTaskRecord[];
  doneRecords: DoneTaskRecord[];
  isOpen: boolean;
  onClose: () => void;
}

interface ProductivityMetrics {
  completionRate: number;
  averageTasksPerDay: number;
  streakDays: number;
  mostProductiveDay: string;
  totalTasksCompleted: number;
  averageCompletionTime: number;
}

interface TopicPerformance {
  topicId: string;
  topicName: string;
  completedTasks: number;
  pendingTasks: number;
  staleRate: number;
  averageCompletionTime: number;
  color: string;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  topics,
  tasks,
  staleRecords,
  doneRecords,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'trends' | 'insights'>('overview');

  const stats = useMemo(() => {
    const now = new Date();
    const allCompletedTasks = [...tasks.filter(t => t.completed), ...doneRecords];
    const allTasks = [...tasks, ...staleRecords, ...doneRecords];
    
    // Basic metrics
    const totalTasks = allTasks.length;
    const completedTasks = allCompletedTasks.length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const staleTasks = staleRecords.length;
    
    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Time-based analysis
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentCompletions = allCompletedTasks.filter(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && completedDate >= last7Days;
    });
    
    const monthlyCompletions = allCompletedTasks.filter(task => {
      const completedDate = task.completedAt || task.archivedDate;
      return completedDate && completedDate >= last30Days;
    });
    
    // Daily productivity
    const dailyStats: Record<string, number> = {};
    allCompletedTasks.forEach(task => {
      const completedDate = task.completedAt || task.archivedDate;
      if (completedDate) {
        const dayKey = completedDate.toDateString();
        dailyStats[dayKey] = (dailyStats[dayKey] || 0) + 1;
      }
    });
    
    const averageTasksPerDay = Object.keys(dailyStats).length > 0 
      ? Object.values(dailyStats).reduce((a, b) => a + b, 0) / Object.keys(dailyStats).length 
      : 0;
    
    // Most productive day
    const mostProductiveDay = Object.entries(dailyStats).reduce((max, [day, count]) => 
      count > max.count ? { day, count } : max, { day: 'None', count: 0 }
    );
    
    // Streak calculation
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = checkDate.toDateString();
      if (dailyStats[dayKey] > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // Average completion time (for tasks with creation and completion dates)
    const completionTimes = allCompletedTasks
      .filter(task => task.createdAt && (task.completedAt || task.archivedDate))
      .map(task => {
        const completedDate = task.completedAt || task.archivedDate!;
        return completedDate.getTime() - task.createdAt.getTime();
      });
    
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;
    
    // Topic performance
    const topicPerformance: TopicPerformance[] = topics.map(topic => {
      const topicTasks = allTasks.filter(t => t.topicId === topic.id);
      const topicCompleted = allCompletedTasks.filter(t => t.topicId === topic.id);
      const topicPending = tasks.filter(t => t.topicId === topic.id && !t.completed);
      const topicStale = staleRecords.filter(r => r.topicId === topic.id);
      
      const staleRate = topicTasks.length > 0 ? (topicStale.length / topicTasks.length) * 100 : 0;
      
      const topicCompletionTimes = topicCompleted
        .filter(task => task.createdAt && (task.completedAt || task.archivedDate))
        .map(task => {
          const completedDate = task.completedAt || task.archivedDate!;
          return completedDate.getTime() - task.createdAt.getTime();
        });
      
      const avgCompletionTime = topicCompletionTimes.length > 0
        ? topicCompletionTimes.reduce((a, b) => a + b, 0) / topicCompletionTimes.length
        : 0;
      
      return {
        topicId: topic.id,
        topicName: topic.name,
        completedTasks: topicCompleted.length,
        pendingTasks: topicPending.length,
        staleRate,
        averageCompletionTime: avgCompletionTime,
        color: topic.color,
      };
    });
    
    // Weekly pattern analysis
    const weeklyPattern: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    
    allCompletedTasks.forEach(task => {
      const completedDate = task.completedAt || task.archivedDate;
      if (completedDate) {
        const dayName = completedDate.toLocaleDateString('en-US', { weekday: 'long' });
        weeklyPattern[dayName]++;
      }
    });
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      staleTasks,
      completionRate,
      averageTasksPerDay,
      streakDays: currentStreak,
      mostProductiveDay: mostProductiveDay.day !== 'None' 
        ? new Date(mostProductiveDay.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
        : 'None',
      recentCompletions: recentCompletions.length,
      monthlyCompletions: monthlyCompletions.length,
      averageCompletionTime: averageCompletionTime / (1000 * 60 * 60 * 24), // Convert to days
      topicPerformance: topicPerformance.sort((a, b) => b.completedTasks - a.completedTasks),
      weeklyPattern,
      dailyStats,
    };
  }, [topics, tasks, staleRecords, doneRecords]);

  const formatDuration = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    if (days < 7) return `${Math.round(days)}d`;
    return `${Math.round(days / 7)}w`;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'topics', label: 'Topics', icon: Target },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl shadow-sm">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Analytics Dashboard</h2>
                <p className="text-sm sm:text-base text-blue-700">Comprehensive insights into your productivity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  } whitespace-nowrap`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-blue-600" size={24} />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.completionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Activity className="text-green-600" size={24} />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Current Streak</p>
                      <p className="text-2xl font-bold text-green-900">{stats.streakDays} days</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Clock className="text-purple-600" size={24} />
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Avg Completion</p>
                      <p className="text-2xl font-bold text-purple-900">{formatDuration(stats.averageCompletionTime)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-orange-600" size={24} />
                    <div>
                      <p className="text-sm text-orange-700 font-medium">Daily Average</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.averageTasksPerDay.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Distribution */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-600" />
                    Task Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600">{stats.completedTasks}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Pending</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">{stats.pendingTasks}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({((stats.pendingTasks / stats.totalTasks) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium">Stale</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600">{stats.staleTasks}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({((stats.staleTasks / stats.totalTasks) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-purple-600" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Last 7 Days</p>
                        <p className="text-sm text-green-700">Tasks completed</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{stats.recentCompletions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">Last 30 Days</p>
                        <p className="text-sm text-blue-700">Tasks completed</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{stats.monthlyCompletions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-900">Most Productive</p>
                        <p className="text-sm text-purple-700">{stats.mostProductiveDay}</p>
                      </div>
                      <Award className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                Topic Performance Analysis
              </h3>
              <div className="space-y-4">
                {stats.topicPerformance.map((topic, index) => {
                  const colorScheme = getTopicColor(parseInt(topic.color));
                  const totalTasks = topic.completedTasks + topic.pendingTasks;
                  const completionRate = totalTasks > 0 ? (topic.completedTasks / totalTasks) * 100 : 0;
                  
                  return (
                    <div key={topic.topicId} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${colorScheme.bg} rounded-full`}></div>
                          <h4 className="font-semibold text-gray-900">{topic.topicName}</h4>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Top Performer
                            </span>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(completionRate)}`}>
                          {completionRate.toFixed(1)}% complete
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{topic.completedTasks}</p>
                          <p className="text-sm text-green-700">Completed</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{topic.pendingTasks}</p>
                          <p className="text-sm text-blue-700">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{topic.staleRate.toFixed(1)}%</p>
                          <p className="text-sm text-red-700">Stale Rate</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{formatDuration(topic.averageCompletionTime)}</p>
                          <p className="text-sm text-purple-700">Avg Time</p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colorScheme.bg}`}
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Productivity Trends
              </h3>
              
              {/* Weekly Pattern */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Weekly Productivity Pattern</h4>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(stats.weeklyPattern).map(([day, count]) => {
                    const maxCount = Math.max(...Object.values(stats.weeklyPattern));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div className="h-32 flex items-end justify-center mb-2">
                          <div 
                            className="w-8 bg-blue-500 rounded-t-md transition-all duration-500"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-medium text-gray-600">{day.slice(0, 3)}</p>
                        <p className="text-sm font-bold text-gray-900">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Activity Heatmap */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Daily Activity</h4>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (34 - i));
                    const dayKey = date.toDateString();
                    const count = stats.dailyStats[dayKey] || 0;
                    const intensity = count > 0 ? Math.min(count / 5, 1) : 0;
                    
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-sm border border-gray-200 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: intensity > 0 
                            ? `rgba(59, 130, 246, ${0.2 + intensity * 0.8})` 
                            : '#f3f4f6',
                          color: intensity > 0.5 ? 'white' : '#374151'
                        }}
                        title={`${date.toLocaleDateString()}: ${count} tasks`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">Last 5 weeks • Darker = more tasks completed</p>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Zap size={20} className="text-blue-600" />
                AI-Powered Insights
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Performance Insights */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Performance Insights</h4>
                  
                  {stats.completionRate >= 80 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Award className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-green-900">Excellent Performance!</p>
                          <p className="text-sm text-green-700">You're maintaining a {stats.completionRate.toFixed(1)}% completion rate. Keep up the great work!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats.streakDays >= 7 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Activity className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-blue-900">Consistency Champion!</p>
                          <p className="text-sm text-blue-700">You've been productive for {stats.streakDays} days straight. Consistency is key to success!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats.staleTasks > stats.completedTasks * 0.2 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-amber-900">Focus Opportunity</p>
                          <p className="text-sm text-amber-700">You have {stats.staleTasks} stale tasks. Consider breaking them into smaller, actionable items.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Recommendations</h4>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-purple-900">Optimize Your Schedule</p>
                        <p className="text-sm text-purple-700">
                          Your most productive day is {stats.mostProductiveDay}. Try scheduling important tasks on similar days.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {stats.topicPerformance.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Users className="text-indigo-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="font-medium text-indigo-900">Topic Focus</p>
                          <p className="text-sm text-indigo-700">
                            "{stats.topicPerformance[0].topicName}" is your top-performing topic. Consider applying similar strategies to other areas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="text-teal-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-teal-900">Growth Opportunity</p>
                        <p className="text-sm text-teal-700">
                          Your average completion time is {formatDuration(stats.averageCompletionTime)}. Setting deadlines might help improve this metric.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};