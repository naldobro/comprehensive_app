import React, { useState } from 'react';
import { Topic } from '../types';
import { X, Save, Target, BookOpen, Briefcase, Heart, Home, Dumbbell, Palette, Code, Music, Camera, Plane, Star } from 'lucide-react';
import { TOPIC_ICONS, TOPIC_COLORS } from '../utils/topicColors';

const iconMap = {
  Target, BookOpen, Briefcase, Heart, Home, Dumbbell, 
  Palette, Code, Music, Camera, Plane, Star
};

interface EditTopicModalProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, icon: string, colorIndex: number) => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({ 
  topic, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [topicName, setTopicName] = useState(topic.name);
  const [selectedIcon, setSelectedIcon] = useState(topic.icon);
  const [selectedColorIndex, setSelectedColorIndex] = useState(parseInt(topic.color));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicName.trim()) {
      onSave(topic.id, topicName.trim(), selectedIcon, selectedColorIndex);
      onClose();
    }
  };

  const handleCancel = () => {
    setTopicName(topic.name);
    setSelectedIcon(topic.icon);
    setSelectedColorIndex(parseInt(topic.color));
    onClose();
  };

  // Update state when topic changes
  React.useEffect(() => {
    setTopicName(topic.name);
    setSelectedIcon(topic.icon);
    setSelectedColorIndex(parseInt(topic.color));
  }, [topic]);

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

  const selectedColor = TOPIC_COLORS[selectedColorIndex];
  const SelectedIconComponent = iconMap[selectedIcon as keyof typeof iconMap];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${selectedColor.dot} rounded-xl shadow-sm`}>
                <SelectedIconComponent size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Topic</h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
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
                  {topic.completedTasks} completed tasks
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!topicName.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};