import React, { useState } from 'react';
import { Milestone } from '../types';
import { Edit2, Trash2, Check } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  milestone, 
  onEdit, 
  onDelete, 
  readonly = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(milestone.title);

  const handleEdit = () => {
    if (editTitle.trim()) {
      onEdit(milestone.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(milestone.title);
    setIsEditing(false);
  };

  const colorScheme = milestone.type === 'monthly' 
    ? { bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200', text: 'text-purple-900' }
    : { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-900' };

  if (isEditing && !readonly) {
    return (
      <div className="bg-white border border-blue-300 rounded-lg p-3 min-w-[180px] shadow-sm">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
        />
        <div className="flex gap-1">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            <Check size={12} />
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-gradient-to-r ${colorScheme.bg} border ${colorScheme.border} rounded-lg p-3 min-w-[180px] hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-1">
        <h4 className={`font-medium ${colorScheme.text} text-sm truncate pr-2`}>
          {milestone.title}
        </h4>
        {!readonly && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(milestone.id)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div className={`${milestone.type === 'monthly' ? 'bg-purple-500' : 'bg-blue-500'} h-1 rounded-full w-1/3`}></div>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        {milestone.type === 'monthly' ? 'Monthly Goal' : 'Weekly Goal'}
      </div>
    </div>
  );
};