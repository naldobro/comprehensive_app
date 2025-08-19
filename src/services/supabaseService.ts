import { supabase, handleSupabaseError } from '../lib/supabase';
import { Topic, Task, Milestone, StaleTaskRecord, DoneTaskRecord, Quote } from '../types';

// Topic Services
export const topicService = {
  async getAll(): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          color,
          icon,
          bio,
          completed_tasks,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      return data.map(topic => ({
        ...topic,
        createdAt: new Date(topic.created_at),
        completedTasks: topic.completed_tasks || 0,
        // Ensure color is always a string
        color: topic.color || '0',
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch topics');
      return [];
    }
  },

  async create(topic: Omit<Topic, 'id' | 'createdAt'>): Promise<Topic> {
    try {
      console.log('Creating topic:', topic);
      
      const { data, error } = await supabase
        .from('topics')
        .insert({
          name: topic.name,
          color: topic.color,
          icon: topic.icon,
          bio: topic.bio,
          completed_tasks: topic.completedTasks,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('Topic created successfully:', data);

      return {
        ...data,
        createdAt: new Date(data.created_at),
        completedTasks: data.completed_tasks,
      };
    } catch (error) {
      console.error('Topic creation failed:', error);
      handleSupabaseError(error, 'create topic');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Topic>): Promise<Topic> {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.completedTasks !== undefined) updateData.completed_tasks = updates.completedTasks;

      const { data, error } = await supabase
        .from('topics')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        createdAt: new Date(data.created_at),
        completedTasks: data.completed_tasks,
      };
    } catch (error) {
      handleSupabaseError(error, 'update topic');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete topic');
      throw error;
    }
  },
};

// Task Services
export const taskService = {
  async getAll(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          topic_id,
          milestone_id,
          completed,
          created_at,
          completed_at,
          completion_month,
          completion_week,
          completion_day,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      return data.map(task => ({
        ...task,
        topicId: task.topic_id,
        milestoneId: task.milestone_id || null,
        createdAt: new Date(task.created_at),
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        completionMonth: task.completion_month,
        completionWeek: task.completion_week,
        completionDay: task.completion_day,
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch tasks');
      return [];
    }
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          topic_id: task.topicId,
          milestone_id: task.milestoneId || null,
          completed: task.completed,
          completed_at: task.completedAt?.toISOString(),
          completion_month: task.completionMonth,
          completion_week: task.completionWeek,
          completion_day: task.completionDay,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        topicId: data.topic_id,
        milestoneId: data.milestone_id || null,
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        completionMonth: data.completion_month,
        completionWeek: data.completion_week,
        completionDay: data.completion_day,
      };
    } catch (error) {
      handleSupabaseError(error, 'create task');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.topicId !== undefined) updateData.topic_id = updates.topicId;
      if (updates.milestoneId !== undefined) updateData.milestone_id = updates.milestoneId || null;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();
      if (updates.completionMonth !== undefined) updateData.completion_month = updates.completionMonth;
      if (updates.completionWeek !== undefined) updateData.completion_week = updates.completionWeek;
      if (updates.completionDay !== undefined) updateData.completion_day = updates.completionDay;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        topicId: data.topic_id,
        milestoneId: data.milestone_id || null,
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        completionMonth: data.completion_month,
        completionWeek: data.completion_week,
        completionDay: data.completion_day,
      };
    } catch (error) {
      handleSupabaseError(error, 'update task');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete task');
      throw error;
    }
  },
};

// Milestone Services
export const milestoneService = {
  async getAll(): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          id,
          title,
          topic_id,
          type,
          month,
          week,
          order_index,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data) return [];

      return data.map(milestone => ({
        ...milestone,
        topicId: milestone.topic_id,
        order: milestone.order_index,
        createdAt: new Date(milestone.created_at),
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch milestones');
      return [];
    }
  },

  async create(milestone: Omit<Milestone, 'id' | 'createdAt'>): Promise<Milestone> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          title: milestone.title,
          topic_id: milestone.topicId,
          type: milestone.type,
          month: milestone.month,
          week: milestone.week,
          order_index: milestone.order,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        topicId: data.topic_id,
        order: data.order_index,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      handleSupabaseError(error, 'create milestone');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.topicId !== undefined) updateData.topic_id = updates.topicId;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.month !== undefined) updateData.month = updates.month;
      if (updates.week !== undefined) updateData.week = updates.week;
      if (updates.order !== undefined) updateData.order_index = updates.order;

      const { data, error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        topicId: data.topic_id,
        order: data.order_index,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      handleSupabaseError(error, 'update milestone');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete milestone');
      throw error;
    }
  },
};

// Stale Task Records Services
export const staleTaskRecordService = {
  async getAll(): Promise<StaleTaskRecord[]> {
    try {
      const { data, error } = await supabase
        .from('stale_task_records')
        .select(`
          id,
          original_task_id,
          title,
          topic_id,
          topic_name,
          created_at,
          stale_date,
          archived_at
        `)
        .order('stale_date', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      return data.map(record => ({
        id: record.id,
        title: record.title,
        topicId: record.topic_id,
        topicName: record.topic_name,
        createdAt: new Date(record.created_at),
        staleDate: new Date(record.stale_date),
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch stale task records');
      return [];
    }
  },

  async create(record: Omit<StaleTaskRecord, 'id'>): Promise<StaleTaskRecord> {
    try {
      const { data, error } = await supabase
        .from('stale_task_records')
        .insert({
          original_task_id: record.title, // Use title as identifier since id is not available
          title: record.title,
          topic_id: record.topicId,
          topic_name: record.topicName,
          created_at: record.createdAt.toISOString(),
          stale_date: record.staleDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        topicId: data.topic_id,
        topicName: data.topic_name,
        createdAt: new Date(data.created_at),
        staleDate: new Date(data.stale_date),
      };
    } catch (error) {
      handleSupabaseError(error, 'create stale task record');
      throw error;
    }
  },
};

// Done Task Records Services
export const doneTaskRecordService = {
  async getAll(): Promise<DoneTaskRecord[]> {
    try {
      const { data, error } = await supabase
        .from('done_task_records')
        .select(`
          id,
          original_task_id,
          title,
          topic_id,
          topic_name,
          completed_at,
          archived_date
        `)
        .order('archived_date', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      return data.map(record => ({
        id: record.id,
        title: record.title,
        topicId: record.topic_id,
        topicName: record.topic_name,
        completedAt: new Date(record.completed_at),
        archivedDate: new Date(record.archived_date),
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch done task records');
      return [];
    }
  },

  async create(record: Omit<DoneTaskRecord, 'id'>): Promise<DoneTaskRecord> {
    try {
      const { data, error } = await supabase
        .from('done_task_records')
        .insert({
          original_task_id: record.title, // Use title as identifier since id is not available
          title: record.title,
          topic_id: record.topicId,
          topic_name: record.topicName,
          completed_at: record.completedAt.toISOString(),
          archived_date: record.archivedDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        topicId: data.topic_id,
        topicName: data.topic_name,
        completedAt: new Date(data.completed_at),
        archivedDate: new Date(data.archived_date),
      };
    } catch (error) {
      handleSupabaseError(error, 'create done task record');
      throw error;
    }
  },
};

// Quote Services
export const quoteService = {
  async getAll(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          text,
          author,
          color_scheme,
          priority,
          is_active,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      return data.map(quote => ({
        id: quote.id,
        text: quote.text,
        author: quote.author || undefined,
        colorScheme: quote.color_scheme,
        priority: quote.priority,
        isActive: quote.is_active,
        createdAt: new Date(quote.created_at),
      }));
    } catch (error) {
      handleSupabaseError(error, 'fetch quotes');
      return [];
    }
  },

  async create(quote: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          text: quote.text,
          author: quote.author || null,
          color_scheme: quote.colorScheme,
          priority: quote.priority,
          is_active: quote.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        text: data.text,
        author: data.author || undefined,
        colorScheme: data.color_scheme,
        priority: data.priority,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      handleSupabaseError(error, 'create quote');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Quote>): Promise<Quote> {
    try {
      const updateData: any = {};
      if (updates.text !== undefined) updateData.text = updates.text;
      if (updates.author !== undefined) updateData.author = updates.author || null;
      if (updates.colorScheme !== undefined) updateData.color_scheme = updates.colorScheme;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        text: data.text,
        author: data.author || undefined,
        colorScheme: data.color_scheme,
        priority: data.priority,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      handleSupabaseError(error, 'update quote');
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'delete quote');
      throw error;
    }
  },
};