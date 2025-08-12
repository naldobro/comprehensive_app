import React from 'react';
import { useState } from 'react';
import { Task, Topic } from '../types';
import { Check, Clock, Edit2, Trash2, X, Save } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  topic: Topic;
  onToggleComplete: (id: string) => void;
  onEditTask?: (id: string, title: string, description: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  topic, 
  onToggleComplete, 
  onEditTask, 
  onDeleteTask 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleEdit = () => {
    if (editTitle.trim() && onEditTask) {
      onEditTask(task.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-blue-300 rounded-xl p-4 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task title"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task description"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:border-gray-300 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {task.completed && <Check size={14} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h4>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
              {topic.name}
            </span>
          </div>
          
          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={12} />
            {task.completed && task.completedAt
              ? `Completed ${formatDate(task.completedAt)}`
              : `Created ${formatDate(task.createdAt)}`
            }
          </div>
        </div>
        
        {/* Action buttons */}
        {!task.completed && (onEditTask || onDeleteTask) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
            {onEditTask && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDeleteTask && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  );
};