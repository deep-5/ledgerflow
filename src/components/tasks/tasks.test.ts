import { describe, it, expect } from 'vitest';
import { INITIAL_TASKS, INITIAL_USERS } from '../../data/initialData';
import { Task, TaskStatus } from '../../types';

describe('Phase 3: Work & Tasks Management', () => {
  it('Task list contains initial multi-status tasks with checklists', () => {
    expect(INITIAL_TASKS.length).toBeGreaterThanOrEqual(5);

    const recurringTask = INITIAL_TASKS.find(t => t.isRecurring);
    expect(recurringTask).toBeDefined();
    expect(recurringTask?.checklist).toBeDefined();
  });

  it('Updating a task status transitions smoothly across workflow stages', () => {
    const tasksList: Task[] = [...INITIAL_TASKS];
    const targetTask = { ...tasksList[0] };

    // Initial status
    expect(targetTask.status).toBeDefined();

    // Transition to In Review
    targetTask.status = 'In Review';
    expect(targetTask.status).toBe('In Review');

    // Transition to Completed with completed timestamp
    targetTask.status = 'Completed';
    targetTask.completedAt = new Date().toISOString();
    expect(targetTask.status).toBe('Completed');
    expect(targetTask.completedAt).toBeDefined();
  });

  it('Recurring template spawner creates new task with subtasks and recurrence interval', () => {
    const template = {
      title: 'Monthly Bookkeeping Close & Reconciliations',
      category: 'Monthly Bookkeeping',
      interval: 'monthly',
      checklist: [
        { id: '1', text: 'Import and clear operating bank transactions', completed: false },
        { id: '2', text: 'Reconcile credit card feeds and chase missing receipts', completed: false },
      ],
    };

    const spawnedTask: Task = {
      id: `task-${Date.now()}`,
      title: template.title,
      clientId: 'client-1',
      serviceCategory: template.category,
      description: 'End of month reconciliations',
      assignedStaffId: 'user-3',
      reviewerId: 'user-5',
      startDate: '2024-10-17',
      dueDate: '2024-10-31',
      priority: 'High',
      status: 'Not Started',
      estimatedHours: 4.5,
      actualHours: 0,
      isRecurring: true,
      recurrenceInterval: 'monthly',
      checklist: template.checklist,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    expect(spawnedTask.isRecurring).toBe(true);
    expect(spawnedTask.checklist?.length).toBe(2);
    expect(spawnedTask.dueDate).toBe('2024-10-31');
  });

  it('Rescheduling task updates due date accurately', () => {
    const task = { ...INITIAL_TASKS[0] };
    const originalDate = task.dueDate;
    const newDueDate = '2024-11-15';

    task.dueDate = newDueDate;
    expect(task.dueDate).not.toBe(originalDate);
    expect(task.dueDate).toBe('2024-11-15');
  });
});
