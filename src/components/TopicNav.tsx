import { memo } from 'react';
import { Topic } from '../types';
import { TOPICS } from '../constants';
import { motion } from 'motion/react';

interface TopicNavProps {
  selectedTopics: Topic[];
  onTopicToggle: (topic: Topic) => void;
  isLoading?: boolean;
}

export const TopicNav = memo(function TopicNav({
  selectedTopics,
  onTopicToggle,
  isLoading = false,
}: TopicNavProps) {
  return (
    <nav 
      className="border-t border-gray-100 dark:border-gray-900"
      aria-label="News topics navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div 
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3"
          role="group"
          aria-label="Topic filters"
        >
          {TOPICS.map((topic) => {
            const isActive = selectedTopics.includes(topic.value);
            
            return (
              <motion.button
                key={topic.value}
                onClick={() => !isLoading && onTopicToggle(topic.value)}
                disabled={isLoading}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={isActive}
                aria-label={`${topic.label} filter`}
                aria-disabled={isLoading}
                className={`
                  flex items-center px-4 py-2 rounded-lg whitespace-nowrap
                  transition-all duration-150 text-sm font-medium
                  ${
                    isActive
                      ? 'bg-primary shadow-sm'
                      : 'bg-secondary/50 hover:bg-secondary'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className={isActive ? 'text-white' : 'text-muted-foreground'}>
                  {topic.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});