interface DraftBadgeProps {
  className?: string;
}

export function DraftBadge({ className = '' }: DraftBadgeProps) {
  return (
    <span className={`px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full ${className}`}>
      DRAFT
    </span>
  );
} 