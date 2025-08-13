import React from 'react';
import { Topic } from '../types';
import { Trash2, Edit2, Target, BookOpen, Briefcase, Heart, Home, Dumbbell, Palette, Code, Music, Camera, Plane, Star } from 'lucide-react';
import { getTopicColor } from '../utils/topicColors';

const iconMap = {
  Target, BookOpen, Briefcase, Heart, Home, Dumbbell, 
  Palette, Code, Music, Camera, Plane, Star
};

interface TopicCardProps {
  topic: Topic;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (topic: Topic) => void;
  onClick: (topic: Topic) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (targetId: string) => void;
  isDragging: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  index, 
  onDelete, 
  onEdit,
  onClick, 
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  isDragging 
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(topic.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(topic);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(topic.id);
  };

  const colorScheme = getTopicColor(parseInt(topic.color));
  
  const IconComponent = iconMap[topic.icon as keyof typeof iconMap] || Target;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onClick(topic)}
      className={`group relative ${colorScheme.bg} border ${colorScheme.border} rounded-xl p-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-sm aspect-square flex flex-col ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1 z-10">
        <button
          onClick={handleEdit}
          className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 hover:text-blue-500 transition-colors duration-200"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 hover:text-red-500 transition-colors duration-200"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {/* Icon */}
      <div className="flex justify-center mb-2">
        <div className={`p-2 ${colorScheme.dot} rounded-lg shadow-md`}>
          <IconComponent size={18} className="text-white" />
        </div>
      </div>
      
      {/* Topic name */}
      <div className="flex-1 flex items-center justify-center mb-2">
        <h3 className={`font-semibold ${colorScheme.text} text-sm text-center leading-tight break-words`}>
          {topic.name}
        </h3>
      </div>
      
      {/* Stats */}
      <div className="text-center">
        <div className={`text-xs font-medium ${colorScheme.text} opacity-90`}>
          {topic.completedTasks} completed
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1 mt-1">
          <div 
            className={`bg-white bg-opacity-80 h-1 rounded-full transition-all duration-500`}
            style={{ 
              width: topic.completedTasks > 0 
                ? `${Math.min(100, Math.max(15, (topic.completedTasks / Math.max(1, topic.completedTasks)) * 100))}%`
                : '0%'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};