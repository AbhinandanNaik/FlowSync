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
import { FilterBar } from './FilterBar';
import { ViewSwitcher } from './ViewSwitcher';
import { TimelineView } from './TimelineView';
import { useBoardStore } from '@/lib/store/board-store';
import { Column, Task } from '@/types/board';
import { isPast } from 'date-fns';

interface BoardViewProps {
    boardId?: string;
    members?: any[];
}

export function BoardView({ boardId, members = [] }: BoardViewProps) {
    const { columns, tasks, setColumns, moveTask, filters, viewMode } = useBoardStore();

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    // Apply filters to tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filters.priority && task.priority !== filters.priority) return false;
            if (filters.assigneeId && task.assignee_id !== filters.assigneeId) return false;
            if (filters.overdue) {
                if (!task.due_date || !isPast(new Date(task.due_date))) return false;
            }
            // Label filter requires task_labels data — skipped for now (handled when label data is loaded)
            return true;
        });
    }, [tasks, filters]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
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

        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) {
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

        if (isActiveTask && isOverTask) {
            const activeTask = tasks.find(t => t.id === activeId);
            const overTask = tasks.find(t => t.id === overId);

            if (activeTask && overTask) {
                if (activeTask.columnId !== overTask.columnId) {
                    moveTask(activeId, overTask.columnId, overTask.order);
                }
            }
        }

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
        <div>
            {boardId && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <FilterBar boardId={boardId} members={members} />
                    <ViewSwitcher />
                </div>
            )}

            {viewMode === 'timeline' ? (
                <TimelineView />
            ) : (

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
                                    tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    {createPortal(
                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeColumn && (
                                <BoardColumn
                                    column={activeColumn}
                                    tasks={filteredTasks.filter((task) => task.columnId === activeColumn.id)}
                                />
                            )}
                            {activeTask && <TaskCard task={activeTask} />}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            )}
        </div>
    );
}

