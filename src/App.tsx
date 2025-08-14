import React, { useState } from 'react';
import { useEffect } from 'react';
import { topicService, taskService, milestoneService, staleTaskRecordService, doneTaskRecordService } from './services/supabaseService';
import { Topic, Task, Milestone, StaleTaskRecord, DoneTaskRecord } from './types';
import { useUndoRedo } from './hooks/useUndoRedo';
import { categorizeTasksByAge, categorizeCompletedTasksByAge } from './utils/taskAging';
import { TopicCard } from './components/TopicCard';
import { TaskItem } from './components/TaskItem';
import { UndoRedoControls } from './components/UndoRedoControls';
import { StaleTasksSection } from './components/StaleTasksSection';
import { StaleTasksModal } from './components/StaleTasksModal';
import { DoneTasksModal } from './components/DoneTasksModal';
import { StatisticsModal } from './components/StatisticsModal';
import { TopicModal } from './components/TopicModal';
import { EditTopicModal } from './components/EditTopicModal';
import { CreateTopicForm } from './components/CreateTopicForm';
import { CreateTaskForm } from './components/CreateTaskForm';
import { QuickStatsBar } from './components/QuickStatsBar';
import { ProductivityInsights } from './components/ProductivityInsights';
import { Target, CheckSquare, Clock, Archive, BarChart3 } from 'lucide-react';
import { getCurrentTimeContext, calculateTimePosition, getTimeContextForDate } from './utils/timeCalculations';

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draggedTopic, setDraggedTopic] = useState<string | null>(null);
  const [staleRecords, setStaleRecords] = useState<StaleTaskRecord[]>([]);
  const [doneRecords, setDoneRecords] = useState<DoneTaskRecord[]>([]);
  const [isStaleModalOpen, setIsStaleModalOpen] = useState(false);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);

  const {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    getLastActionDescription,
    getNextRedoDescription,
  } = useUndoRedo();

  // Load initial data from Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading initial data...');
        
        const [topicsData, tasksData, milestonesData, staleRecordsData, doneRecordsData] = await Promise.all([
          topicService.getAll(),
          taskService.getAll(),
          milestoneService.getAll(),
          staleTaskRecordService.getAll(),
          doneTaskRecordService.getAll(),
        ]);
        
        console.log('Loaded data:', {
          topics: topicsData.length,
          tasks: tasksData.length,
          milestones: milestonesData.length,
          staleRecords: staleRecordsData.length,
          doneRecords: doneRecordsData.length
        });
        
        setTopics(topicsData);
        setTasks(tasksData);
        setMilestones(milestonesData);
        setStaleRecords(staleRecordsData);
        setDoneRecords(doneRecordsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load data. Please check your internet connection and Supabase configuration.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  // Check for stale tasks and move them to records
  useEffect(() => {
    if (loading) return; // Don't run while loading
    
    const checkStaleTasksInterval = setInterval(() => {
      const checkAndMoveStale = async () => {
        const now = new Date();
        const tasksToMoveToStale: Task[] = [];
        
        tasks.forEach(task => {
          if (!task.completed) {
            const taskAge = now.getTime() - task.createdAt.getTime();
            const daysOld = taskAge / (1000 * 60 * 60 * 24);
            
            if (daysOld >= 3) {
              tasksToMoveToStale.push(task);
            }
          }
        });
        
        if (tasksToMoveToStale.length > 0) {
          try {
            // Create stale records in Supabase
            const staleRecordPromises = tasksToMoveToStale.map(async (task) => {
              const topic = topics.find(t => t.id === task.topicId);
              const staleRecord = {
                title: task.title,
                topicId: task.topicId,
                topicName: topic?.name || 'Unknown Topic',
                createdAt: task.createdAt,
                staleDate: now,
              };
              
              const createdRecord = await staleTaskRecordService.create(staleRecord);
              await taskService.delete(task.id);
              return createdRecord;
            });
            
            const newStaleRecords = await Promise.all(staleRecordPromises);
            
            setStaleRecords(prev => [...prev, ...newStaleRecords]);
            
            // Remove from tasks
            const staleTaskIds = new Set(tasksToMoveToStale.map(t => t.id));
            setTasks(prev => prev.filter(task => !staleTaskIds.has(task.id)));
          } catch (error) {
            console.error('Failed to move stale tasks:', error);
          }
        }
      };
      
      checkAndMoveStale();
    }, 60000); // Check every minute
    
    return () => clearInterval(checkStaleTasksInterval);
  }, [tasks, topics, loading]);

  // Check for old completed tasks and move them to done records
  useEffect(() => {
    if (loading) return; // Don't run while loading
    
    const checkDoneTasksInterval = setInterval(() => {
      const checkAndMoveDone = async () => {
        const now = new Date();
        const tasksToMoveToDone: Task[] = [];
        
        tasks.forEach(task => {
          if (task.completed && task.completedAt) {
            const completedAge = now.getTime() - task.completedAt.getTime();
            const daysOld = completedAge / (1000 * 60 * 60 * 24);
            
            if (daysOld >= 7) {
              tasksToMoveToDone.push(task);
            }
          }
        });
        
        if (tasksToMoveToDone.length > 0) {
          try {
            // Create done records in Supabase
            const doneRecordPromises = tasksToMoveToDone.map(async (task) => {
              const topic = topics.find(t => t.id === task.topicId);
              const doneRecord = {
                title: task.title,
                topicId: task.topicId,
                topicName: topic?.name || 'Unknown Topic',
                completedAt: task.completedAt!,
                archivedDate: now,
              };
              
              const createdRecord = await doneTaskRecordService.create(doneRecord);
              await taskService.delete(task.id);
              return createdRecord;
            });
            
            const newDoneRecords = await Promise.all(doneRecordPromises);
            
            setDoneRecords(prev => [...prev, ...newDoneRecords]);
            
            // Remove from tasks
            const doneTaskIds = new Set(tasksToMoveToDone.map(t => t.id));
            setTasks(prev => prev.filter(task => !doneTaskIds.has(task.id)));
          } catch (error) {
            console.error('Failed to move done tasks:', error);
          }
        }
      };
      
      checkAndMoveDone();
    }, 60000); // Check every minute
    
    return () => clearInterval(checkDoneTasksInterval);
  }, [tasks, topics, loading]);

  const createTopic = async (name: string, icon: string = 'Target', colorIndex: number = 0) => {
    try {
      const newTopic = await topicService.create({
        name,
        color: colorIndex.toString(),
        icon,
        completedTasks: 0,
      });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'CREATE_TOPIC',
        timestamp: new Date(),
        data: newTopic,
        reverseData: null,
      });
      
      setTopics([...topics, newTopic]);
    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create topic. Please try again.');
    }
  };

  const editTopic = async (id: string, name: string, icon: string, colorIndex: number) => {
    try {
      const oldTopic = topics.find(topic => topic.id === id);
      if (!oldTopic) return;
      
      const updatedTopic = await topicService.update(id, {
        name,
        icon,
        color: colorIndex.toString(),
      });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'EDIT_TOPIC',
        timestamp: new Date(),
        data: updatedTopic,
        reverseData: oldTopic,
      });
      
      setTopics(topics.map(topic =>
        topic.id === id ? updatedTopic : topic
      ));
    } catch (error) {
      console.error('Failed to edit topic:', error);
      setError('Failed to edit topic. Please try again.');
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      const topicToDelete = topics.find(topic => topic.id === topicId);
      const relatedTasks = tasks.filter(task => task.topicId === topicId);
      const relatedMilestones = milestones.filter(milestone => milestone.topicId === topicId);
      
      if (!topicToDelete) return;
      
      await topicService.delete(topicId);
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'DELETE_TOPIC',
        timestamp: new Date(),
        data: { topicId },
        reverseData: { topic: topicToDelete, tasks: relatedTasks, milestones: relatedMilestones },
      });
      
      setTopics(topics.filter(topic => topic.id !== topicId));
      setTasks(tasks.filter(task => task.topicId !== topicId));
      setMilestones(milestones.filter(milestone => milestone.topicId !== topicId));
    } catch (error) {
      console.error('Failed to delete topic:', error);
      setError('Failed to delete topic. Please try again.');
    }
  };

  const reorderTopics = async (draggedId: string, targetId: string) => {
    const draggedIndex = topics.findIndex(topic => topic.id === draggedId);
    const targetIndex = topics.findIndex(topic => topic.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const oldOrder = [...topics];
    const newTopics = [...topics];
    const [draggedTopic] = newTopics.splice(draggedIndex, 1);
    newTopics.splice(targetIndex, 0, draggedTopic);
    
    // Add to undo stack
    addAction({
      id: Date.now().toString(),
      type: 'REORDER_TOPICS',
      timestamp: new Date(),
      data: newTopics,
      reverseData: oldOrder,
    });
    
    setTopics(newTopics);
  };

  const createTask = async (title: string, description: string, topicId: string) => {
    try {
      const newTask = await taskService.create({
        title,
        description,
        topicId,
        completed: false,
      });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'CREATE_TASK',
        timestamp: new Date(),
        data: newTask,
        reverseData: null,
      });
      
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  const editTask = async (taskId: string, title: string, description: string) => {
    try {
      const oldTask = tasks.find(task => task.id === taskId);
      if (!oldTask) return;
      
      const updatedTask = await taskService.update(taskId, { title, description });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'EDIT_TASK',
        timestamp: new Date(),
        data: updatedTask,
        reverseData: oldTask,
      });
      
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to edit task:', error);
      setError('Failed to edit task. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      if (!taskToDelete) return;
      
      await taskService.delete(taskId);
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'DELETE_TASK',
        timestamp: new Date(),
        data: { taskId },
        reverseData: taskToDelete,
      });
      
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const createMilestone = async (title: string, type: 'monthly' | 'weekly') => {
    try {
      if (!selectedTopic) return;
      
      const timeContext = getCurrentTimeContext(selectedTopic.createdAt);
      
      const newMilestone = await milestoneService.create({
        title,
        topicId: selectedTopic.id,
        order: milestones.filter(m => 
          m.topicId === selectedTopic.id && 
          m.type === type &&
          m.month === timeContext.currentMonth &&
          (type === 'weekly' ? m.week === timeContext.currentWeek : true)
        ).length,
        type,
        month: timeContext.currentMonth,
        week: type === 'weekly' ? timeContext.currentWeek : undefined,
      });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'CREATE_MILESTONE',
        timestamp: new Date(),
        data: newMilestone,
        reverseData: null,
      });
      
      setMilestones([...milestones, newMilestone]);
    } catch (error) {
      console.error('Failed to create milestone:', error);
      setError('Failed to create milestone. Please try again.');
    }
  };

  const editMilestone = async (id: string, title: string) => {
    try {
      const oldMilestone = milestones.find(milestone => milestone.id === id);
      if (!oldMilestone) return;
      
      const updatedMilestone = await milestoneService.update(id, { title });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'EDIT_MILESTONE',
        timestamp: new Date(),
        data: updatedMilestone,
        reverseData: oldMilestone,
      });
      
      setMilestones(milestones.map(milestone =>
        milestone.id === id ? updatedMilestone : milestone
      ));
    } catch (error) {
      console.error('Failed to edit milestone:', error);
      setError('Failed to edit milestone. Please try again.');
    }
  };

  const updateTopicBio = async (topicId: string, bio: string) => {
    try {
      const oldTopic = topics.find(topic => topic.id === topicId);
      if (!oldTopic) return;
      
      const updatedTopic = await topicService.update(topicId, { bio });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'UPDATE_BIO',
        timestamp: new Date(),
        data: { topicId, bio },
        reverseData: { topicId, bio: oldTopic.bio || '' },
      });
      
      setTopics(topics.map(topic =>
        topic.id === topicId ? updatedTopic : topic
      ));
    } catch (error) {
      console.error('Failed to update topic bio:', error);
      setError('Failed to update topic bio. Please try again.');
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const milestoneToDelete = milestones.find(milestone => milestone.id === id);
      if (!milestoneToDelete) return;
      
      await milestoneService.delete(id);
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'DELETE_MILESTONE',
        timestamp: new Date(),
        data: { id },
        reverseData: milestoneToDelete,
      });
      
      setMilestones(milestones.filter(milestone => milestone.id !== id));
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      setError('Failed to delete milestone. Please try again.');
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    try {
      const oldTask = tasks.find(task => task.id === taskId);
      if (!oldTask) return;
      
      const topic = topics.find(t => t.id === oldTask.topicId);
      let completionData = {};
      
      if (!oldTask.completed && topic) {
        const completionDate = new Date();
        const timeContext = getTimeContextForDate(completionDate, topic.createdAt);
        completionData = {
          completionMonth: timeContext.currentMonth,
          completionWeek: timeContext.currentWeek,
          completionDay: timeContext.currentDay,
        };
      }
      
      const updatedTask = await taskService.update(taskId, {
        completed: !oldTask.completed,
        completedAt: !oldTask.completed ? new Date() : undefined,
        ...(!oldTask.completed ? completionData : {
          completionMonth: undefined,
          completionWeek: undefined,
          completionDay: undefined,
        }),
      });
      
      // Add to undo stack
      addAction({
        id: Date.now().toString(),
        type: 'TOGGLE_TASK',
        timestamp: new Date(),
        data: updatedTask,
        reverseData: oldTask,
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      // Update topic completed tasks count
      if (topic) {
        const countDiff = !oldTask.completed ? 1 : -1;
        const updatedTopic = await topicService.update(topic.id, {
          completedTasks: Math.max(0, topic.completedTasks + countDiff),
        });
        
        setTopics(topics.map(t => 
          t.id === topic.id ? updatedTopic : t
        ));
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Error handling component
  const ErrorBanner = () => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  // Add error boundary for color scheme issues
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("Cannot read properties of undefined (reading 'bg')")) {
        console.error('Color scheme error detected, this might be due to invalid topic data');
        setError('There was an issue with topic colors. Please refresh the page.');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading TaskFlow</h2>
          <p className="text-gray-600">Syncing your data...</p>
        </div>
      </div>
    );
  }

  const handleUndo = () => {
    const action = undo();
    if (!action) return;
    
    switch (action.type) {
      case 'CREATE_TOPIC':
        setTopics(topics.filter(topic => topic.id !== action.data.id));
        break;
      case 'DELETE_TOPIC':
        setTopics([...topics, action.reverseData.topic]);
        setTasks([...tasks, ...action.reverseData.tasks]);
        setMilestones([...milestones, ...action.reverseData.milestones]);
        break;
      case 'EDIT_TOPIC':
        setTopics(topics.map(topic => 
          topic.id === action.reverseData.id ? action.reverseData : topic
        ));
        break;
      case 'REORDER_TOPICS':
        setTopics(action.reverseData);
        break;
      case 'CREATE_TASK':
        setTasks(tasks.filter(task => task.id !== action.data.id));
        break;
      case 'DELETE_TASK':
        setTasks([...tasks, action.reverseData]);
        break;
      case 'EDIT_TASK':
        setTasks(tasks.map(task => 
          task.id === action.reverseData.id ? action.reverseData : task
        ));
        break;
      case 'TOGGLE_TASK':
        setTasks(tasks.map(task => 
          task.id === action.reverseData.id ? action.reverseData : task
        ));
        // Update topic completed tasks count
        const topic = topics.find(t => t.id === action.reverseData.topicId);
        if (topic) {
          const countDiff = action.reverseData.completed ? 1 : -1;
          setTopics(topics.map(t => 
            t.id === topic.id 
              ? { ...t, completedTasks: Math.max(0, t.completedTasks + countDiff) }
              : t
          ));
        }
        break;
      case 'CREATE_MILESTONE':
        setMilestones(milestones.filter(milestone => milestone.id !== action.data.id));
        break;
      case 'DELETE_MILESTONE':
        setMilestones([...milestones, action.reverseData]);
        break;
      case 'EDIT_MILESTONE':
        setMilestones(milestones.map(milestone => 
          milestone.id === action.reverseData.id ? action.reverseData : milestone
        ));
        break;
      case 'UPDATE_BIO':
        setTopics(topics.map(topic => 
          topic.id === action.reverseData.topicId 
            ? { ...topic, bio: action.reverseData.bio }
            : topic
        ));
        break;
    }
  };

  const handleRedo = () => {
    const action = redo();
    if (!action) return;
    
    switch (action.type) {
      case 'CREATE_TOPIC':
        setTopics([...topics, action.data]);
        break;
      case 'DELETE_TOPIC':
        setTopics(topics.filter(topic => topic.id !== action.data.topicId));
        setTasks(tasks.filter(task => task.topicId !== action.data.topicId));
        setMilestones(milestones.filter(milestone => milestone.topicId !== action.data.topicId));
        break;
      case 'EDIT_TOPIC':
        setTopics(topics.map(topic => 
          topic.id === action.data.id ? action.data : topic
        ));
        break;
      case 'REORDER_TOPICS':
        setTopics(action.data);
        break;
      case 'CREATE_TASK':
        setTasks([...tasks, action.data]);
        break;
      case 'DELETE_TASK':
        setTasks(tasks.filter(task => task.id !== action.data.taskId));
        break;
      case 'EDIT_TASK':
        setTasks(tasks.map(task => 
          task.id === action.data.id ? action.data : task
        ));
        break;
      case 'TOGGLE_TASK':
        setTasks(tasks.map(task => 
          task.id === action.data.id ? action.data : task
        ));
        // Update topic completed tasks count
        const topic = topics.find(t => t.id === action.data.topicId);
        if (topic) {
          const countDiff = action.data.completed ? 1 : -1;
          setTopics(topics.map(t => 
            t.id === topic.id 
              ? { ...t, completedTasks: Math.max(0, t.completedTasks + countDiff) }
              : t
          ));
        }
        break;
      case 'CREATE_MILESTONE':
        setMilestones([...milestones, action.data]);
        break;
      case 'DELETE_MILESTONE':
        setMilestones(milestones.filter(milestone => milestone.id !== action.data.id));
        break;
      case 'EDIT_MILESTONE':
        setMilestones(milestones.map(milestone => 
          milestone.id === action.data.id ? action.data : milestone
        ));
        break;
      case 'UPDATE_BIO':
        setTopics(topics.map(topic => 
          topic.id === action.data.topicId 
            ? { ...topic, bio: action.data.bio }
            : topic
        ));
        break;
    }
  };
  const openTopicModal = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const closeTopicModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTopic(null);
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const allCompletedTasks = tasks.filter(task => task.completed);
  const { recent: completedTasks } = categorizeCompletedTasksByAge(allCompletedTasks);
  const { fresh: freshPendingTasks, stale: staleTasks } = categorizeTasksByAge(pendingTasks);
  const topicTasks = selectedTopic ? tasks.filter(task => task.topicId === selectedTopic.id) : [];
  const topicMilestones = selectedTopic ? milestones.filter(milestone => milestone.topicId === selectedTopic.id) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <ErrorBanner />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <Target className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">TaskFlow</h1>
          </div>
            <UndoRedoControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              lastActionDescription={getLastActionDescription()}
              nextRedoDescription={getNextRedoDescription()}
            />
          </div>
          <p className="text-gray-600">Organize your goals and track your progress</p>
        </div>

        {/* Topics Section */}
        <div className="mb-8">
          {/* Quick Stats Bar */}
          <QuickStatsBar
            topics={topics}
            tasks={tasks}
            staleRecords={staleRecords}
            doneRecords={doneRecords}
          />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3 items-start">
            {topics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={index}
                onDelete={deleteTopic}
                onEdit={openEditModal}
                onClick={openTopicModal}
                onDragStart={() => setDraggedTopic(topic.id)}
                onDragEnd={() => setDraggedTopic(null)}
                onDragOver={(targetId) => {
                  if (draggedTopic && draggedTopic !== targetId) {
                    reorderTopics(draggedTopic, targetId);
                  }
                }}
                isDragging={draggedTopic === topic.id}
              />
            ))}
            <CreateTopicForm onCreateTopic={createTopic} />
          </div>
        </div>

        {/* Task Creation */}
        <div className="mb-8">
          <CreateTaskForm topics={topics} onCreateTask={createTask} />
        </div>

        {/* Productivity Insights */}
        <ProductivityInsights
          topics={topics}
          tasks={tasks}
          staleRecords={staleRecords}
          doneRecords={doneRecords}
        />

        {/* Stale Tasks Section */}
        <StaleTasksSection
          staleTasks={staleTasks}
          topics={topics}
          onToggleComplete={toggleTaskComplete}
          onEditTask={editTask}
          onDeleteTask={deleteTask}
        />

        {/* Tasks Sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-amber-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">
                Fresh Tasks ({freshPendingTasks.length})
              </h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {freshPendingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No fresh tasks</p>
                </div>
              ) : (
                freshPendingTasks.map(task => {
                  const taskTopic = topics.find(topic => topic.id === task.topicId);
                  return taskTopic ? (
                    <TaskItem
                      key={task.id}
                      task={task}
                      topic={taskTopic}
                      onToggleComplete={toggleTaskComplete}
                      onEditTask={editTask}
                      onDeleteTask={deleteTask}
                    />
                  ) : null;
                })
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="text-green-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">
                Completed Tasks ({completedTasks.length})
              </h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No completed tasks yet</p>
                </div>
              ) : (
                completedTasks
                  .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                  .map(task => {
                    const taskTopic = topics.find(topic => topic.id === task.topicId);
                    return taskTopic ? (
                      <TaskItem
                        key={task.id}
                        task={task}
                        topic={taskTopic}
                        onToggleComplete={toggleTaskComplete}
                        onEditTask={editTask}
                        onDeleteTask={deleteTask}
                      />
                    ) : null;
                  })
              )}
            </div>
          </div>
        </div>

        {/* Archive Buttons */}
        <div className="pt-12 mb-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setIsStatisticsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BarChart3 size={20} />
            Analytics Dashboard
          </button>
          <button
            onClick={() => setIsStaleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 font-medium"
          >
            <Archive size={18} />
            Stale Tasks ({staleRecords.length})
          </button>
          <button
            onClick={() => setIsDoneModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 font-medium"
          >
            <CheckSquare size={18} />
            Done Tasks ({doneRecords.length})
          </button>
        </div>

        {/* Topic Detail Modal */}
        {selectedTopic && isModalOpen && (
          <TopicModal
            topic={selectedTopic}
            tasks={topicTasks}
            milestones={topicMilestones}
            isOpen={isModalOpen}
            onClose={closeTopicModal}
            onCreateMilestone={createMilestone}
            onEditMilestone={editMilestone}
            onDeleteMilestone={deleteMilestone}
            onUpdateBio={updateTopicBio}
          />
        )}

        {/* Edit Topic Modal */}
        {editingTopic && isEditModalOpen && (
          <EditTopicModal
            topic={editingTopic}
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            onSave={editTopic}
          />
        )}

        {/* Stale Tasks Modal */}
        {isStaleModalOpen && (
          <StaleTasksModal
            staleRecords={staleRecords}
            isOpen={isStaleModalOpen}
            onClose={() => setIsStaleModalOpen(false)}
          />
        )}

        {/* Done Tasks Modal */}
        {isDoneModalOpen && (
          <DoneTasksModal
            doneRecords={doneRecords}
            isOpen={isDoneModalOpen}
            onClose={() => setIsDoneModalOpen(false)}
          />
        )}

        {/* Statistics Modal */}
        {isStatisticsModalOpen && (
          <StatisticsModal
            topics={topics}
            tasks={tasks}
            staleRecords={staleRecords}
            doneRecords={doneRecords}
            isOpen={isStatisticsModalOpen}
            onClose={() => setIsStatisticsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;