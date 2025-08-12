import React, { useState } from 'react';
import { Plus, X, Target, BookOpen, Briefcase, Heart, Home, Dumbbell, Palette, Code, Music, Camera, Plane, Star, Sparkles } from 'lucide-react';
import { TOPIC_ICONS, TOPIC_COLORS } from '../utils/topicColors';

const iconMap = {
  Target, BookOpen, Briefcase, Heart, Home, Dumbbell, 
  Palette, Code, Music, Camera, Plane, Star
};

interface CreateTopicFormProps {
  onCreateTopic: (name: string, icon: string, colorIndex: number) => void;
}

export const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ onCreateTopic }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicName.trim()) {
      onCreateTopic(topicName.trim(), selectedIcon, selectedColorIndex);
      setTopicName('');
      setSelectedIcon('Target');
      setSelectedColorIndex(0);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTopicName('');
    setSelectedIcon('Target');
    setSelectedColorIndex(0);
    setIsCreating(false);
  };

  if (isCreating) {
    const selectedColor = TOPIC_COLORS[selectedColorIndex];
    const SelectedIconComponent = iconMap[selectedIcon as keyof typeof iconMap];

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200 min-w-[400px] max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${selectedColor.dot} rounded-xl shadow-sm`}>
              <Sparkles size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Topic</h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic Name
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Enter topic name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              autoFocus
            />
          </div>
          
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Icon
            </label>
            <div className="grid grid-cols-4 gap-3">
              {TOPIC_ICONS.map((iconName) => {
                const IconComponent = iconMap[iconName as keyof typeof iconMap];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? `border-blue-500 bg-blue-50 text-blue-600 shadow-md`
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Color Theme
            </label>
            <div className="grid grid-cols-4 gap-4">
              {TOPIC_COLORS.map((color, index) => {
                const isSelected = selectedColorIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColorIndex(index)}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${color.bg} ${
                      isSelected
                        ? `${color.border} shadow-lg ring-2 ring-white ring-opacity-50`
                        : `${color.border} hover:shadow-md`
                    }`}
                  >
                    <div className={`w-8 h-8 ${color.dot} rounded-lg mx-auto shadow-md`}></div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Preview</p>
            <div className={`${selectedColor.bg} border ${selectedColor.border} rounded-xl p-4 transition-all duration-200`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 ${selectedColor.dot} rounded-lg shadow-md`}>
                  <SelectedIconComponent size={16} className="text-white" />
                </div>
                <h4 className={`font-semibold ${selectedColor.text} text-sm`}>
                  {topicName || 'Topic Name'}
                </h4>
              </div>
              <div className={`mt-3 text-xs ${selectedColor.text} opacity-90`}>
                0 completed tasks
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!topicName.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              Create Topic
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="group bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-sm aspect-square"
    >
      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:bg-blue-100">
        <Plus size={18} className="group-hover:text-blue-600 transition-colors duration-300" />
      </div>
      <div className="text-center">
        <span className="font-semibold text-sm block">Create Topic</span>
        <span className="text-xs text-gray-500">Add new topic</span>
      </div>
    </button>
  );
};