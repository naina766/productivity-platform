import type { TaskSummary } from '@/types/task';

/**
 * Escapes a cell value according to RFC 4180 CSV specifications.
 * Quotes fields that contain commas, double-quotes, or newlines.
 */
export function escapeCSVCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const CSV_TASK_HEADERS = [
  'Task ID',
  'Title',
  'Description',
  'Status',
  'Priority',
  'Assignee Name',
  'Assignee Email',
  'Due Date',
  'Labels',
  'Created At',
  'Updated At',
] as const;

/**
 * Formats an array of tasks into standard CSV text.
 */
export function exportTasksToCSV(tasks: TaskSummary[]): string {
  const headerLine = CSV_TASK_HEADERS.join(',');

  const rows = tasks.map((t) => {
    const labelsStr = t.labels?.map((l) => l.name).join('; ') ?? '';
    const dueDateStr = t.dueDate ? new Date(t.dueDate).toISOString() : '';
    const createdAtStr = t.createdAt ? new Date(t.createdAt).toISOString() : '';
    const updatedAtStr = t.updatedAt ? new Date(t.updatedAt).toISOString() : '';

    const cells = [
      escapeCSVCell(t.id),
      escapeCSVCell(t.title),
      escapeCSVCell(t.description ?? ''),
      escapeCSVCell(t.status),
      escapeCSVCell(t.priority),
      escapeCSVCell(t.assignee?.name ?? ''),
      escapeCSVCell(t.assignee?.email ?? ''),
      escapeCSVCell(dueDateStr),
      escapeCSVCell(labelsStr),
      escapeCSVCell(createdAtStr),
      escapeCSVCell(updatedAtStr),
    ];

    return cells.join(',');
  });

  return [headerLine, ...rows].join('\r\n');
}

export interface TaskExportJsonPayload {
  version: string;
  exportedAt: string;
  totalTasks: number;
  project?: {
    id: string;
    name: string;
  };
  tasks: TaskSummary[];
}

/**
 * Formats tasks into structured JSON.
 */
export function exportTasksToJSON(
  tasks: TaskSummary[],
  projectMeta?: { id: string; name: string }
): string {
  const payload: TaskExportJsonPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    ...(projectMeta ? { project: projectMeta } : {}),
    tasks,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser download of a given string as a file.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
