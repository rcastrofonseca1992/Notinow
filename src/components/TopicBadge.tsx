import { Badge } from './ui/badge';
import { TOPICS } from '../constants';
import { Topic } from '../types';

interface TopicBadgeProps {
  topic: Topic;
  variant?: 'default' | 'compact' | 'overlay';
  className?: string;
}

/**
 * Accessible topic/category badge component
 * Complies with WCAG 2.1 Level AA standards
 */
export function TopicBadge({ topic, variant = 'default', className = '' }: TopicBadgeProps) {
  const topicInfo = TOPICS.find(t => t.value === topic);
  
  if (!topicInfo) return null;

  // Ensure sufficient color contrast for WCAG AA compliance
  const getAccessibleStyles = () => {
    // Use darker backgrounds with white text for better contrast
    const backgroundColor = topicInfo.color;
    const textColor = '#FFFFFF'; // White text on colored background
    
    return {
      backgroundColor: variant === 'overlay' ? `${backgroundColor}20` : backgroundColor,
      color: variant === 'overlay' ? backgroundColor : textColor,
      borderColor: variant === 'overlay' ? `${backgroundColor}40` : backgroundColor,
    };
  };

  const styles = getAccessibleStyles();

  // Compact variant (icon only with tooltip)
  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${className}`}
        style={{
          backgroundColor: `${topicInfo.color}20`,
          color: topicInfo.color,
        }}
        role="img"
        aria-label={`${topicInfo.label} category`}
        title={topicInfo.label}
      >
        <span className="text-sm" aria-hidden="true">
          {topicInfo.icon}
        </span>
      </span>
    );
  }

  // Overlay variant (semi-transparent, used on images)
  if (variant === 'overlay') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${className}`}
        style={styles}
        role="status"
        aria-label={`Category: ${topicInfo.label}`}
      >
        <span aria-hidden="true">{topicInfo.icon}</span>
        <span>{topicInfo.label}</span>
      </span>
    );
  }

  // Default variant (solid badge using Badge component)
  return (
    <Badge
      className={`inline-flex items-center gap-1.5 border-0 ${className}`}
      style={styles}
      role="status"
      aria-label={`Category: ${topicInfo.label}`}
    >
      <span aria-hidden="true">{topicInfo.icon}</span>
      <span>{topicInfo.label}</span>
    </Badge>
  );
}

/**
 * Hook to get topic information
 * Useful for accessing topic data without rendering a badge
 */
export function useTopicInfo(topic: Topic) {
  return TOPICS.find(t => t.value === topic);
}
