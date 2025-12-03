import { Newspaper, Search, Heart, FileText } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type: 'no-results' | 'error' | 'no-articles' | 'no-saved' | 'no-full-articles';
  searchQuery?: string;
  onReset?: () => void;
}

export function EmptyState({ type, searchQuery, onReset }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
          No results found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {searchQuery 
            ? `We couldn't find any articles matching "${searchQuery}".` 
            : "No articles match your current filters."
          }
        </p>
        {onReset && (
          <Button onClick={onReset} variant="outline">
            Clear search
          </Button>
        )}
      </div>
    );
  }

  if (type === 'no-saved') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
          No saved articles yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Tap the heart icon on any article to save it for later reading.
        </p>
      </div>
    );
  }

  if (type === 'no-full-articles') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
          No full articles available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          There are currently no articles with full content in this topic.
        </p>
        {onReset && (
          <Button onClick={onReset} variant="outline">
            Show all articles
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
        No articles available
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
        There are currently no articles to display. Try refreshing or check back later.
      </p>
    </div>
  );
}
