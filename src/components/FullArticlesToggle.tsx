import { ScrollText } from 'lucide-react';

interface FullArticlesToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function FullArticlesToggle({ enabled, onChange }: FullArticlesToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      aria-label={enabled ? "Show all articles" : "Show full articles only"}
      aria-pressed={enabled}
      className={`
        group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
        transition-all duration-200 ease-in-out
        ${enabled 
          ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
          : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
    >
      <ScrollText className="w-4 h-4" />
      <span className="text-sm font-medium">
        Full Articles
      </span>
    </button>
  );
}
