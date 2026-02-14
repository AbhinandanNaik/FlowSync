'use client'

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useSensors,
    useSensor,
    PointerSensor,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { useBoardStore } from '@/lib/store/board-store';
import { Column, Task } from '@/types/board';

export function BoardView() {
    const { columns, tasks, setColumns, moveTask } = useBoardStore();

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px distance before drag starts
            },
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Handling Column Reordering
        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) {
            // In a real app we'd reuse reorderBoard function (not implemented in store yet)
            const oldIndex = columns.findIndex((col) => col.id === activeId);
            const newIndex = columns.findIndex((col) => col.id === overId);
            setColumns(arrayMove(columns, oldIndex, newIndex));
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            const activeTask = tasks.find(t => t.id === activeId);
            const overTask = tasks.find(t => t.id === overId); // Task we are hovering over

            if (activeTask && overTask) {
                if (activeTask.columnId !== overTask.columnId) {
                    // Moving to a different column
                    // Visual update only handled by dnd-kit for now unless we update state here
                    // We'll update state on DragEnd for simplicity or implement advanced smooth reordering
                    moveTask(activeId, overTask.columnId, overTask.order);
                } else {
                    // Same column reordering (would use arrayMove logic on tasks in store)
                }
            }
        }

        // Dropping a Task over a Column
        const isOverColumn = over.data.current?.type === 'Column';
        if (isActiveTask && isOverColumn) {
            const activeTask = tasks.find(t => t.id === activeId);
            if (activeTask) {
                if (activeTask.columnId !== overId) {
                    moveTask(activeId, overId, tasks.filter(t => t.columnId === overId).length);
                }
            }
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
                <SortableContext items={columnsId}>
                    {columns.map((col) => (
                        <BoardColumn
                            key={col.id}
                            column={col}
                            tasks={tasks.filter((task) => task.columnId === col.id)}
                        />
                    ))}
                </SortableContext>
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeColumn && (
                        <BoardColumn
                            column={activeColumn}
                            tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                        />
                    )}
                    {activeTask && <TaskCard task={activeTask} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
