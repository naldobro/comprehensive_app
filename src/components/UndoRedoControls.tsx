import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastActionDescription: string;
  nextRedoDescription: string;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastActionDescription,
  nextRedoDescription,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          canUndo
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105 shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={canUndo ? `Undo: ${lastActionDescription}` : 'Nothing to undo'}
      >
        <Undo2 size={16} />
        <span className="hidden sm:inline">Undo</span>
        
        {canUndo && lastActionDescription && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Undo: {lastActionDescription}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          canRedo
            ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105 shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={canRedo ? `Redo: ${nextRedoDescription}` : 'Nothing to redo'}
      >
        <Redo2 size={16} />
        <span className="hidden sm:inline">Redo</span>
        
        {canRedo && nextRedoDescription && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Redo: {nextRedoDescription}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </button>
    </div>
  );
};