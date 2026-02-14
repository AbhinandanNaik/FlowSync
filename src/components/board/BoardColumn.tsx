'use client'

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '@/types/board';
import { TaskCard } from './TaskCard';
import { NewTaskDialog } from './NewTaskDialog';
import { useMemo } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

interface BoardColumnProps {
    column: Column;
    tasks: Task[];
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
    const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
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
                className="bg-gray-100 dark:bg-gray-800 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col border-2 border-indigo-500 opacity-50"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-100 dark:bg-gray-800/50 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col"
        >
            <div
                {...attributes}
                {...listeners}
                className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-xl flex items-center justify-between cursor-grab active:cursor-grabbing font-bold text-md"
            >
                <div className="flex gap-2 items-center">
                    <div className="bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">
                        {tasks.length}
                    </div>
                    {column.title}
                </div>
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </div>

            <div className="p-3">
                <NewTaskDialog columnId={column.id} />
            </div>
        </div>
    );
}
