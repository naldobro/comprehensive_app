import React, { useState, useMemo } from 'react';
import { DoneTaskRecord } from '../types';
import { X, CheckCircle, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getTopicColor } from '../utils/topicColors';

interface DoneTasksModalProps {
  doneRecords: DoneTaskRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const DoneTasksModal: React.FC<DoneTasksModalProps> = ({
  doneRecords,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return doneRecords;
    
    const term = searchTerm.toLowerCase();
    return doneRecords.filter(record => 
      record.title.toLowerCase().includes(term) ||
      record.topicName.toLowerCase().includes(term)
    );
  }, [doneRecords, searchTerm]);

  // Group records by month and year
  const groupedRecords = useMemo(() => {
    const groups: Record<string, DoneTaskRecord[]> = {};
    
    filteredRecords.forEach(record => {
      const monthKey = record.archivedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(record);
    });

    // Sort each group by date (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.archivedDate.getTime() - a.archivedDate.getTime());
    });

    return groups;
  }, [filteredRecords]);

  // Sort month keys (newest first)
  const sortedMonthKeys = Object.keys(groupedRecords).sort((a, b) => {
    const dateA = new Date(a + ' 1');
    const dateB = new Date(b + ' 1');
    return dateB.getTime() - dateA.getTime();
  });

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  // Auto-expand current month
  React.useEffect(() => {
    if (sortedMonthKeys.length > 0) {
      setExpandedMonths(new Set([sortedMonthKeys[0]]));
    }
  }, [sortedMonthKeys.length]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-xl shadow-sm">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">Done Tasks Archive</h2>
                <p className="text-green-700">
                  {doneRecords.length} tasks completed more than 7 days ago
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks or topics..."
              className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {sortedMonthKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching done tasks' : 'No archived tasks yet'}
              </p>
              <p className="text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Completed tasks older than 7 days will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {sortedMonthKeys.map(monthKey => {
                const monthRecords = groupedRecords[monthKey];
                const isExpanded = expandedMonths.has(monthKey);
                
                return (
                  <div key={monthKey} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-gray-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{monthKey}</h3>
                          <p className="text-sm text-gray-600">
                            {monthRecords.length} task{monthRecords.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="max-h-80 overflow-y-auto">
                          {monthRecords.map((record, index) => {
                            const colorIndex = parseInt(record.topicId) % 8;
                            const colorScheme = getTopicColor(colorIndex);
                            
                            return (
                              <div
                                key={record.id}
                                className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                                  index !== monthRecords.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900 truncate">
                                        {record.title}
                                      </h4>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorScheme.bg} ${colorScheme.text} flex-shrink-0`}>
                                        {record.topicName}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span>
                                        Completed: {record.completedAt.toLocaleDateString()}
                                      </span>
                                      <span>
                                        Archived: {record.archivedDate.toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};