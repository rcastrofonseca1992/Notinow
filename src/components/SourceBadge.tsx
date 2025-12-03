import { Crown, Unlock } from 'lucide-react';
import { Badge } from './ui/badge';
import { getSourceType } from '../utils/sourceUtils';

interface SourceBadgeProps {
  sourceName: string;
  variant?: 'default' | 'compact';
}

export function SourceBadge({ sourceName, variant = 'default' }: SourceBadgeProps) {
  const sourceType = getSourceType(sourceName);

  if (sourceType === 'unknown') return null;

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        {sourceType === 'premium' ? (
          <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400" />
        ) : (
          <Unlock className="w-3 h-3 text-green-500 dark:text-green-400" />
        )}
      </span>
    );
  }

  return (
    <Badge
      variant={sourceType === 'premium' ? 'default' : 'secondary'}
      className={
        sourceType === 'premium'
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700'
          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700'
      }
    >
      {sourceType === 'premium' ? (
        <>
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </>
      ) : (
        <>
          <Unlock className="w-3 h-3 mr-1" />
          Free
        </>
      )}
    </Badge>
  );
}
