'use client'

import { cn } from '@/lib/utils'

interface LabelBadgeProps {
    name: string
    color: string
    size?: 'sm' | 'md'
    onRemove?: () => void
}

export function LabelBadge({ name, color, size = 'sm', onRemove }: LabelBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full whitespace-nowrap",
                size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-0.5' : 'text-xs px-2 py-0.5 gap-1'
            )}
            style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `1px solid ${color}40`
            }}
        >
            <span
                className={cn("rounded-full", size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
                style={{ backgroundColor: color }}
            />
            {name}
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-0.5 hover:opacity-70"
                >
                    ✕
                </button>
            )}
        </span>
    )
}
