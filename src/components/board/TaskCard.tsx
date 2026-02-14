'use client'

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/board';
import { cn } from '@/lib/utils';
import { GripVertical, AlignLeft } from 'lucide-react';
import { useState } from 'react';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 border-indigo-500 opacity-50 h-[100px] cursor-grabbing relative"
            />
        );
    }

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
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {task.content}
                    </p>
                    <div className="flex flex-col items-center gap-1">
                        <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {task.description && (
                    <div className="mt-2 text-gray-400">
                        <AlignLeft className="w-3.5 h-3.5" />
                    </div>
                )}
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
