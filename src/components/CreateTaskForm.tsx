import React, { useState } from 'react';
import { Topic } from '../types';
import { Plus, X, Sparkles, Tag } from 'lucide-react';
import { getTopicColor } from '../utils/topicColors';

interface CreateTaskFormProps {
  topics: Topic[];
  onCreateTask: (title: string, description: string, topicId: string) => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ topics, onCreateTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedTopicId) {
      onCreateTask(title.trim(), description.trim(), selectedTopicId);
      setTitle('');
      setDescription('');
      setSelectedTopicId('');
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setSelectedTopicId('');
    setIsExpanded(false);
  };

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId);

  if (!isExpanded) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsExpanded(true)}
          disabled={topics.length === 0}
          className={`w-full group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
            topics.length === 0
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
          }`}
        >
          <div className="p-6 flex items-center justify-center gap-3">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              topics.length === 0 
                ? 'bg-gray-200' 
                : 'bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-100'
            }`}>
              <Plus size={24} className="group-hover:text-blue-600 transition-colors duration-300" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">
                {topics.length === 0 ? 'Create a topic first' : 'Add New Task'}
              </h3>
              <p className="text-sm opacity-75">
                {topics.length === 0 
                  ? 'You need at least one topic to create tasks' 
                  : 'Create a new task and assign it to a topic'
                }
              </p>
            </div>
          </div>
          {topics.length > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl shadow-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create New Task</h3>
                <p className="text-sm text-gray-600">Add a task and assign it to a topic</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Action Buttons - Moved to top */}
          <div className="flex gap-3 pb-2 border-b border-gray-200">
            <button
              type="submit"
              disabled={!title.trim() || !selectedTopicId}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100 text-sm"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-all duration-200 hover:bg-gray-100 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Topic Selection - Moved to top */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Topic *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {topics.map(topic => {
                const colorScheme = getTopicColor(parseInt(topic.color));
                const isSelected = selectedTopicId === topic.id;
                
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`relative p-2.5 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                      isSelected
                        ? `border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200`
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 ${colorScheme.bg} rounded-full flex-shrink-0 shadow-sm`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-xs truncate ${
                          isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {topic.name}
                        </h4>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400"
              autoFocus
            />
          </div>
          
          {/* Task Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none placeholder-gray-400"
            />
          </div>

          {/* Preview */}
          {title && selectedTopic && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Preview</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTopicColor(parseInt(selectedTopic.color)).bg} ${getTopicColor(parseInt(selectedTopic.color)).text}`}>
                        {selectedTopic.name}
                      </span>
                    </div>
                    {description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Just now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};