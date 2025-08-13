export const TOPIC_COLORS = [
  { bg: 'bg-blue-50 border-blue-200', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-green-50 border-green-200', border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500' },
  { bg: 'bg-purple-50 border-purple-200', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-500' },
  { bg: 'bg-orange-50 border-orange-200', border: 'border-orange-200', text: 'text-orange-800', dot: 'bg-orange-500' },
  { bg: 'bg-pink-50 border-pink-200', border: 'border-pink-200', text: 'text-pink-800', dot: 'bg-pink-500' },
  { bg: 'bg-indigo-50 border-indigo-200', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  { bg: 'bg-teal-50 border-teal-200', border: 'border-teal-200', text: 'text-teal-800', dot: 'bg-teal-500' },
  { bg: 'bg-red-50 border-red-200', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
];

export const TOPIC_ICONS = [
  'Target', 'BookOpen', 'Briefcase', 'Heart', 'Home', 'Dumbbell', 
  'Palette', 'Code', 'Music', 'Camera', 'Plane', 'Star'
];

export const getTopicColor = (index: number) => {
  // Ensure we always have a valid index
  if (typeof index !== 'number' || isNaN(index)) {
    console.warn('Invalid color index provided:', index, 'using default');
    return TOPIC_COLORS[0];
  }
  
  const colorIndex = Math.abs(Math.floor(index)) % TOPIC_COLORS.length;
  const color = TOPIC_COLORS[colorIndex];
  
  // Double-check that the color object is valid
  if (!color || !color.bg || !color.text || !color.dot) {
    console.warn('Invalid color scheme at index:', colorIndex, 'using default');
    return TOPIC_COLORS[0];
  }
  
  return color;
};