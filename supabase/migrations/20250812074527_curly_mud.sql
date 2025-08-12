/*
  # Complete TaskFlow Database Schema

  1. New Tables
    - `topics` - Stores all topic information with metadata
    - `tasks` - Stores all tasks with completion tracking and time context
    - `milestones` - Stores monthly and weekly milestones
    - `stale_task_records` - Archive for tasks that became stale
    - `done_task_records` - Archive for completed tasks older than 7 days

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth required)

  3. Features
    - Full time tracking with months, weeks, and days
    - Task aging and archival system
    - Comprehensive milestone system
    - Topic performance tracking
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '0',
  icon text NOT NULL DEFAULT 'Target',
  bio text,
  completed_tasks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  milestone_id uuid,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  completion_month integer,
  completion_week integer,
  completion_day integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('monthly', 'weekly')),
  month integer NOT NULL,
  week integer,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stale task records table
CREATE TABLE IF NOT EXISTS stale_task_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_task_id text NOT NULL,
  title text NOT NULL,
  topic_id uuid NOT NULL,
  topic_name text NOT NULL,
  created_at timestamptz NOT NULL,
  stale_date timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NOT NULL DEFAULT now()
);

-- Done task records table
CREATE TABLE IF NOT EXISTS done_task_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_task_id text NOT NULL,
  title text NOT NULL,
  topic_id uuid NOT NULL,
  topic_name text NOT NULL,
  completed_at timestamptz NOT NULL,
  archived_date timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key reference for milestone_id in tasks
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_milestone 
  FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_topic_id ON tasks(topic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_milestones_topic_id ON milestones(topic_id);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(type);
CREATE INDEX IF NOT EXISTS idx_stale_records_topic_id ON stale_task_records(topic_id);
CREATE INDEX IF NOT EXISTS idx_done_records_topic_id ON done_task_records(topic_id);

-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE stale_task_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE done_task_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow all operations on topics" ON topics FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on milestones" ON milestones FOR ALL USING (true);
CREATE POLICY "Allow all operations on stale_task_records" ON stale_task_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on done_task_records" ON done_task_records FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();