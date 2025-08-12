import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CreateMilestoneFormProps {
  onCreateMilestone: (title: string) => void;
}

export const CreateMilestoneForm: React.FC<CreateMilestoneFormProps> = ({ onCreateMilestone }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateMilestone(title.trim());
      setTitle('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-3 min-w-[180px]">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Milestone title"
            className="w-full p-2 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-1">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs"
            >
              <X size={12} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 min-w-[180px] flex items-center justify-center gap-2 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
    >
      <Plus size={16} />
      <span className="text-sm font-medium">Add Milestone</span>
    </button>
  );
};