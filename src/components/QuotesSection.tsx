import React, { useState } from 'react';
import { Quote } from '../types';
import { Quote as QuoteIcon, Plus, Edit2, Trash2, X, Save, Star, Heart, Lightbulb, Zap } from 'lucide-react';

interface QuotesSectionProps {
  quotes: Quote[];
  onCreateQuote: (text: string, author: string, colorScheme: string, priority: number) => void;
  onEditQuote: (id: string, text: string, author: string, colorScheme: string, priority: number) => void;
  onDeleteQuote: (id: string) => void;
}

const QUOTE_COLOR_SCHEMES = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    border: 'border-blue-200',
    text: 'text-blue-900',
    accent: 'text-blue-600',
    button: 'bg-blue-500 hover:bg-blue-600',
    icon: 'text-blue-500',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
    border: 'border-green-200',
    text: 'text-green-900',
    accent: 'text-green-600',
    button: 'bg-green-500 hover:bg-green-600',
    icon: 'text-green-500',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-violet-100',
    border: 'border-purple-200',
    text: 'text-purple-900',
    accent: 'text-purple-600',
    button: 'bg-purple-500 hover:bg-purple-600',
    icon: 'text-purple-500',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    border: 'border-orange-200',
    text: 'text-orange-900',
    accent: 'text-orange-600',
    button: 'bg-orange-500 hover:bg-orange-600',
    icon: 'text-orange-500',
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
    border: 'border-pink-200',
    text: 'text-pink-900',
    accent: 'text-pink-600',
    button: 'bg-pink-500 hover:bg-pink-600',
    icon: 'text-pink-500',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    border: 'border-teal-200',
    text: 'text-teal-900',
    accent: 'text-teal-600',
    button: 'bg-teal-500 hover:bg-teal-600',
    icon: 'text-teal-500',
  },
};

const PRIORITY_ICONS = {
  100: Star,
  90: Heart,
  80: Lightbulb,
  70: Zap,
  60: QuoteIcon,
};

export const QuotesSection: React.FC<QuotesSectionProps> = ({
  quotes,
  onCreateQuote,
  onEditQuote,
  onDeleteQuote,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    colorScheme: 'blue',
    priority: 80,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.text.trim()) {
      if (editingId) {
        onEditQuote(editingId, formData.text.trim(), formData.author.trim(), formData.colorScheme, formData.priority);
        setEditingId(null);
      } else {
        onCreateQuote(formData.text.trim(), formData.author.trim(), formData.colorScheme, formData.priority);
        setIsCreating(false);
      }
      setFormData({ text: '', author: '', colorScheme: 'blue', priority: 80 });
    }
  };

  const handleCancel = () => {
    setFormData({ text: '', author: '', colorScheme: 'blue', priority: 80 });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (quote: Quote) => {
    setFormData({
      text: quote.text,
      author: quote.author || '',
      colorScheme: quote.colorScheme,
      priority: quote.priority,
    });
    setEditingId(quote.id);
    setIsCreating(true);
  };

  if (quotes.length === 0 && !isCreating) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsCreating(true)}
          className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 transition-all duration-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]"
        >
          <div className="p-6 flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-100 transition-all duration-300">
              <QuoteIcon size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-gray-700 group-hover:text-blue-700">Add Your First Quote</h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-600">Create motivational quotes and important reminders</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <QuoteIcon className="text-indigo-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Daily Inspiration</h2>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Quote</span>
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Quote' : 'Create New Quote'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Text *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter your motivational quote or important reminder..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                rows={3}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author (Optional)
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Quote author or source"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(QUOTE_COLOR_SCHEMES).map(([key, scheme]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorScheme: key })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${scheme.bg} ${
                        formData.colorScheme === key
                          ? `${scheme.border} ring-2 ring-offset-2 ring-indigo-500`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${scheme.button} mx-auto`}></div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white"
                >
                  <option value={100}>Highest (⭐)</option>
                  <option value={90}>High (❤️)</option>
                  <option value={80}>Medium (💡)</option>
                  <option value={70}>Normal (⚡)</option>
                  <option value={60}>Low (💬)</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {formData.text && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">Preview</p>
                <QuoteCard
                  quote={{
                    id: 'preview',
                    text: formData.text,
                    author: formData.author || undefined,
                    colorScheme: formData.colorScheme,
                    priority: formData.priority,
                    isActive: true,
                    createdAt: new Date(),
                  }}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isPreview
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!formData.text.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                <Save size={16} className="inline mr-2" />
                {editingId ? 'Update Quote' : 'Create Quote'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-xl"
              >
                <X size={16} className="inline mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onEdit={handleEdit}
            onDelete={onDeleteQuote}
          />
        ))}
      </div>
    </div>
  );
};

interface QuoteCardProps {
  quote: Quote;
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  isPreview?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onEdit, onDelete, isPreview = false }) => {
  const colorScheme = QUOTE_COLOR_SCHEMES[quote.colorScheme as keyof typeof QUOTE_COLOR_SCHEMES] || QUOTE_COLOR_SCHEMES.blue;
  const PriorityIcon = PRIORITY_ICONS[quote.priority as keyof typeof PRIORITY_ICONS] || QuoteIcon;

  return (
    <div className={`group relative ${colorScheme.bg} border ${colorScheme.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg overflow-hidden`}>
      {/* Priority indicator */}
      <div className="absolute top-4 right-4 opacity-60">
        <PriorityIcon size={20} className={colorScheme.icon} />
      </div>

      {/* Action buttons */}
      {!isPreview && (
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1">
          <button
            onClick={() => onEdit(quote)}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-all duration-200"
          >
            <Edit2 size={14} className={colorScheme.accent} />
          </button>
          <button
            onClick={() => onDelete(quote.id)}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-all duration-200"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      )}

      {/* Quote content */}
      <div className="mt-2">
        <div className="flex items-start gap-3 mb-4">
          <QuoteIcon size={24} className={`${colorScheme.accent} flex-shrink-0 mt-1`} />
          <blockquote className={`${colorScheme.text} text-lg font-medium leading-relaxed italic`}>
            "{quote.text}"
          </blockquote>
        </div>

        {quote.author && (
          <div className={`text-right ${colorScheme.accent} font-medium text-sm`}>
            — {quote.author}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white via-50% to-transparent opacity-20"></div>
      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      <div className="absolute -top-2 -left-2 w-12 h-12 bg-white bg-opacity-10 rounded-full blur-lg"></div>
    </div>
  );
};