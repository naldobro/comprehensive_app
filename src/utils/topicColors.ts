export const TOPIC_COLORS = [
  { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', dot: 'bg-blue-600' },
  { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white', dot: 'bg-green-600' },
  { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white', dot: 'bg-purple-600' },
  { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white', dot: 'bg-orange-600' },
  { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-white', dot: 'bg-pink-600' },
  { bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-white', dot: 'bg-indigo-600' },
  { bg: 'bg-teal-500', border: 'border-teal-600', text: 'text-white', dot: 'bg-teal-600' },
  { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white', dot: 'bg-red-600' },
];

export const TOPIC_ICONS = [
  'Target', 'BookOpen', 'Briefcase', 'Heart', 'Home', 'Dumbbell', 
  'Palette', 'Code', 'Music', 'Camera', 'Plane', 'Star'
];

export const getTopicColor = (index: number) => {
  return TOPIC_COLORS[index % TOPIC_COLORS.length];
};