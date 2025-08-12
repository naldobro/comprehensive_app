import { useState, useCallback } from 'react';
import { UndoRedoAction, UndoRedoState } from '../types';

const MAX_HISTORY_SIZE = 50;

export const useUndoRedo = () => {
  const [state, setState] = useState<UndoRedoState>({
    undoStack: [],
    redoStack: [],
  });

  const addAction = useCallback((action: UndoRedoAction) => {
    setState(prevState => ({
      undoStack: [...prevState.undoStack.slice(-MAX_HISTORY_SIZE + 1), action],
      redoStack: [], // Clear redo stack when new action is added
    }));
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.undoStack.length === 0) return prevState;
      
      const lastAction = prevState.undoStack[prevState.undoStack.length - 1];
      return {
        undoStack: prevState.undoStack.slice(0, -1),
        redoStack: [...prevState.redoStack, lastAction],
      };
    });
    
    return state.undoStack[state.undoStack.length - 1] || null;
  }, [state.undoStack]);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.redoStack.length === 0) return prevState;
      
      const lastRedoAction = prevState.redoStack[prevState.redoStack.length - 1];
      return {
        undoStack: [...prevState.undoStack, lastRedoAction],
        redoStack: prevState.redoStack.slice(0, -1),
      };
    });
    
    return state.redoStack[state.redoStack.length - 1] || null;
  }, [state.redoStack]);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  const getLastActionDescription = () => {
    if (state.undoStack.length === 0) return '';
    const lastAction = state.undoStack[state.undoStack.length - 1];
    
    switch (lastAction.type) {
      case 'CREATE_TOPIC': return `Create topic "${lastAction.data.name}"`;
      case 'DELETE_TOPIC': return `Delete topic "${lastAction.reverseData.name}"`;
      case 'EDIT_TOPIC': return `Edit topic "${lastAction.data.name}"`;
      case 'REORDER_TOPICS': return 'Reorder topics';
      case 'CREATE_TASK': return `Create task "${lastAction.data.title}"`;
      case 'DELETE_TASK': return `Delete task "${lastAction.reverseData.title}"`;
      case 'EDIT_TASK': return `Edit task "${lastAction.data.title}"`;
      case 'TOGGLE_TASK': return `${lastAction.data.completed ? 'Complete' : 'Uncomplete'} task`;
      case 'CREATE_MILESTONE': return `Create milestone "${lastAction.data.title}"`;
      case 'DELETE_MILESTONE': return `Delete milestone "${lastAction.reverseData.title}"`;
      case 'EDIT_MILESTONE': return `Edit milestone "${lastAction.data.title}"`;
      case 'UPDATE_BIO': return 'Update topic bio';
      default: return 'Unknown action';
    }
  };

  const getNextRedoDescription = () => {
    if (state.redoStack.length === 0) return '';
    const nextAction = state.redoStack[state.redoStack.length - 1];
    
    switch (nextAction.type) {
      case 'CREATE_TOPIC': return `Create topic "${nextAction.data.name}"`;
      case 'DELETE_TOPIC': return `Delete topic "${nextAction.reverseData.name}"`;
      case 'EDIT_TOPIC': return `Edit topic "${nextAction.data.name}"`;
      case 'REORDER_TOPICS': return 'Reorder topics';
      case 'CREATE_TASK': return `Create task "${nextAction.data.title}"`;
      case 'DELETE_TASK': return `Delete task "${nextAction.reverseData.title}"`;
      case 'EDIT_TASK': return `Edit task "${nextAction.data.title}"`;
      case 'TOGGLE_TASK': return `${nextAction.data.completed ? 'Complete' : 'Uncomplete'} task`;
      case 'CREATE_MILESTONE': return `Create milestone "${nextAction.data.title}"`;
      case 'DELETE_MILESTONE': return `Delete milestone "${nextAction.reverseData.title}"`;
      case 'EDIT_MILESTONE': return `Edit milestone "${nextAction.data.title}"`;
      case 'UPDATE_BIO': return 'Update topic bio';
      default: return 'Unknown action';
    }
  };

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    getLastActionDescription,
    getNextRedoDescription,
  };
};