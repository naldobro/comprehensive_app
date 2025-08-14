import React, { useState, useMemo } from 'react';
import { Topic, Task, Milestone } from '../types';
import { X, Calendar, CheckCircle, Target, Edit2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { MilestoneCard } from './MilestoneCard';
import { CreateMilestoneForm } from './CreateMilestoneForm';
import { WeeklyTaskGrid } from './WeeklyTaskGrid';
import { getCurrentTimeContext, getWeekDates, formatDate } from '../utils/timeCalculations';

interface TopicModalProps {
  topic: Topic;
  tasks: Task[];
  milestones: Milestone[];
  isOpen: boolean;
  onClose: () => void;
  onCreateMilestone: (title: string, type: 'monthly' | 'weekly') => void;
  onEditMilestone: (id: string, title: string) => void;
  onDeleteMilestone: (id: string) => void;
  onUpdateBio: (topicId: string, bio: string) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({ 
  topic, 
  tasks, 
  milestones, 
  isOpen, 
  onClose, 
  onCreateMilestone, 
  onEditMilestone, 
  onDeleteMilestone,
  onUpdateBio
}) => {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(topic.bio || '');
  const [viewingMonth, setViewingMonth] = useState<number | null>(null);
  const [viewingWeek, setViewingWeek] = useState<number | null>(null);

  const timeContext = useMemo(() => {
    return getCurrentTimeContext(topic.createdAt);
  }, [topic.createdAt]);

  const currentViewMonth = viewingMonth ?? timeContext.currentMonth;
  const currentViewWeek = viewingWeek ?? timeContext.currentWeek;

  const handleBioSave = () => {
    onUpdateBio(topic.id, bioText);
    setIsEditingBio(false);
  };

  const handleBioCancel = () => {
    setBioText(topic.bio || '');
    setIsEditingBio(false);
  };

  // Update bioText when topic changes
  React.useEffect(() => {
    setBioText(topic.bio || '');
  }, [topic.bio, topic.id]);

  // Reset viewing state when topic changes
  React.useEffect(() => {
    setViewingMonth(null);
    setViewingWeek(null);
  }, [topic.id]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter milestones and tasks for current view
  const monthlyMilestones = milestones.filter(m => 
    m.type === 'monthly' && m.month === currentViewMonth
  );

  const weeklyMilestones = milestones.filter(m => 
    m.type === 'weekly' && m.month === currentViewMonth && m.week === currentViewWeek
  );

  const weekTasks = tasks.filter(task => 
    task.completed && 
    task.completionMonth === currentViewMonth && 
    task.completionWeek === currentViewWeek
  );

  const weekDates = getWeekDates(currentViewMonth, currentViewWeek, topic.createdAt);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentViewMonth > 1) {
      setViewingMonth(currentViewMonth - 1);
      setViewingWeek(1); // Reset to week 1 when changing months
    } else if (direction === 'next') {
      setViewingMonth(currentViewMonth + 1);
      setViewingWeek(1); // Reset to week 1 when changing months
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentViewWeek > 1) {
      setViewingWeek(currentViewWeek - 1);
    } else if (direction === 'next' && currentViewWeek < 4) {
      setViewingWeek(currentViewWeek + 1);
    }
  };

  const isCurrentPeriod = viewingMonth === null && viewingWeek === null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="mb-3">
                <h2 className="text-2xl font-bold text-gray-900">{topic.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Created: {topic.createdAt.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {topic.createdAt.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              <div className="max-w-md">
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Add a bio for this topic..."
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleBioSave}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Check size={14} />
                        Save
                      </button>
                      <button
                        onClick={handleBioCancel}
                        className="px-3 py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="flex items-start gap-2">
                      <p className={`text-sm flex-1 min-h-[20px] cursor-pointer ${
                        topic.bio ? 'text-gray-700' : 'text-gray-500 italic'
                      }`} onClick={() => setIsEditingBio(true)}>
                        {topic.bio || 'Click to add a bio for this topic...'}
                      </p>
                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all duration-200 flex-shrink-0"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  disabled={currentViewMonth <= 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-lg">Month {currentViewMonth}</span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek('prev')}
                  disabled={currentViewWeek <= 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-medium">Week {currentViewWeek}</span>
                <button
                  onClick={() => navigateWeek('next')}
                  disabled={currentViewWeek >= 4}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            {!isCurrentPeriod && (
              <button
                onClick={() => {
                  setViewingMonth(null);
                  setViewingWeek(null);
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Current
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {/* Monthly Milestones Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-900">Monthly Milestones</h3>
              <span className="text-sm text-gray-500">(Month {currentViewMonth})</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {monthlyMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onEdit={onEditMilestone}
                  onDelete={onDeleteMilestone}
                  readonly={!isCurrentPeriod}
                />
              ))}
              {isCurrentPeriod && (
                <CreateMilestoneForm 
                  onCreateMilestone={(title) => onCreateMilestone(title, 'monthly')} 
                />
              )}
            </div>
          </div>

          {/* Weekly Milestones Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Weekly Milestones</h3>
              <span className="text-sm text-gray-500">(Week {currentViewWeek})</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weeklyMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onEdit={onEditMilestone}
                  onDelete={onDeleteMilestone}
                  readonly={!isCurrentPeriod}
                />
              ))}
              {isCurrentPeriod && (
                <CreateMilestoneForm 
                  onCreateMilestone={(title) => onCreateMilestone(title, 'weekly')} 
                />
              )}
            </div>
          </div>

          {/* Weekly Task Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="font-semibold text-gray-900">Daily Task Completion</h3>
              <span className="text-sm text-gray-500">
                (Week {currentViewWeek} - {formatDate(weekDates[0])} to {formatDate(weekDates[6])})
              </span>
            </div>
            <WeeklyTaskGrid
              tasks={weekTasks}
              weekDates={weekDates}
              month={currentViewMonth}
              week={currentViewWeek}
            />
          </div>
        </div>
      </div>
    </div>
  );
};