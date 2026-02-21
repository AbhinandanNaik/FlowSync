'use client'

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Priority } from '@/types/board';
import { cn } from '@/lib/utils';
import { GripVertical, AlignLeft, MessageSquare, Calendar, Flag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TaskDetailModal } from './TaskDetailModal';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, isPast } from 'date-fns';

const PRIORITY_COLORS: Record<Priority, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
};

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(0);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    // Fetch comment count
    useEffect(() => {
        async function fetchCount() {
            try {
                const supabase = createClient();
                const { count, error } = await supabase
                    .from('task_comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('task_id', task.id);

                if (!error && count !== null) {
                    setCommentCount(count);
                }
            } catch {
                // Silently fail — table may not exist yet
            }
        }
        fetchCount();
    }, [task.id]);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 border-indigo-500 opacity-50 h-[100px] cursor-grabbing relative"
            />
        );
    }

    const overdue = task.due_date && isPast(new Date(task.due_date));
    const priorityColor = task.priority ? PRIORITY_COLORS[task.priority] : null;

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setIsModalOpen(true)}
                className={cn(
                    "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-grab active:cursor-grabbing group relative transition-all hover:shadow-md"
                )}
            >
                {/* Priority stripe */}
                {priorityColor && (
                    <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${priorityColor}`} />
                )}

                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {task.content}
                    </p>
                    <div className="flex flex-col items-center gap-1">
                        <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Metadata row */}
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {/* Priority badge */}
                    {task.priority && task.priority !== 'medium' && (
                        <span className={cn(
                            "inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                            task.priority === 'critical' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            task.priority === 'high' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                            task.priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        )}>
                            <Flag className="w-2.5 h-2.5" />
                            {task.priority}
                        </span>
                    )}

                    {/* Due date chip */}
                    {task.due_date && (
                        <span className={cn(
                            "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded",
                            overdue
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        )}>
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                        </span>
                    )}

                    {/* Description icon */}
                    {task.description && (
                        <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
                    )}

                    {/* Comment count */}
                    {commentCount > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-gray-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{commentCount}</span>
                        </div>
                    )}

                    {/* Assignee avatar (right-aligned) */}
                    {task.assignee_id && (
                        <div className="ml-auto" title={task.assigneeFullName || task.assigneeEmail || 'Assigned'}>
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {(task.assigneeFullName || task.assigneeEmail || '?')[0].toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <TaskDetailModal
                    task={task}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
