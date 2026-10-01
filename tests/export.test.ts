import {
  escapeCSVCell,
  exportTasksToCSV,
  exportTasksToJSON,
  CSV_TASK_HEADERS,
} from '@/lib/export/task-export';
import type { TaskSummary } from '@/types/task';

describe('Task Export Utilities', () => {
  describe('escapeCSVCell', () => {
    it('returns empty string for null and undefined', () => {
      expect(escapeCSVCell(null)).toBe('');
      expect(escapeCSVCell(undefined)).toBe('');
    });

    it('returns unmodified string if no special characters are present', () => {
      expect(escapeCSVCell('simple text')).toBe('simple text');
      expect(escapeCSVCell(123)).toBe('123');
    });

    it('quotes strings containing commas', () => {
      expect(escapeCSVCell('hello, world')).toBe('"hello, world"');
    });

    it('escapes and quotes strings containing double quotes', () => {
      expect(escapeCSVCell('hello "world"')).toBe('"hello ""world"""');
    });

    it('quotes strings containing newlines', () => {
      expect(escapeCSVCell('line 1\nline 2')).toBe('"line 1\nline 2"');
      expect(escapeCSVCell('line 1\r\nline 2')).toBe('"line 1\r\nline 2"');
    });
  });

  describe('exportTasksToCSV', () => {
    const mockTasks: TaskSummary[] = [
      {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Fix issue, asap',
        description: 'Needs urgent fix with "quotes"\nand multiple lines',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-10-15T00:00:00.000Z',
        assigneeId: 'user-1',
        isRecurring: false,
        position: 0,
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-02T10:00:00.000Z',
        assignee: {
          id: 'user-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          avatarUrl: null,
        },
        labels: [
          { id: 'lbl-1', name: 'bug', color: '#ff0000' },
          { id: 'lbl-2', name: 'core', color: '#00ff00' },
        ],
      },
      {
        id: 'task-2',
        projectId: 'proj-1',
        title: 'Simple task',
        description: null,
        status: 'TODO',
        priority: 'LOW',
        dueDate: null,
        assigneeId: null,
        isRecurring: false,
        position: 1,
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
        assignee: null,
        labels: [],
      },
    ];

    it('includes all headers in the first line', () => {
      const csv = exportTasksToCSV(mockTasks);
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe(CSV_TASK_HEADERS.join(','));
    });

    it('properly encodes tasks and respects quoting rules', () => {
      const csv = exportTasksToCSV(mockTasks);
      expect(csv).toContain('"Fix issue, asap"');
      expect(csv).toContain('"Needs urgent fix with ""quotes""\nand multiple lines"');
      expect(csv).toContain('jane@example.com');
      expect(csv).toContain('bug; core');
    });

    it('handles empty task list gracefully with just headers', () => {
      const csv = exportTasksToCSV([]);
      expect(csv).toBe(CSV_TASK_HEADERS.join(','));
    });
  });

  describe('exportTasksToJSON', () => {
    const mockTasks: TaskSummary[] = [
      {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Sample task',
        description: 'Test description',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: null,
        assigneeId: null,
        isRecurring: false,
        position: 0,
        createdAt: '2026-10-01T10:00:00.000Z',
        updatedAt: '2026-10-01T10:00:00.000Z',
        assignee: null,
        labels: [],
      },
    ];

    it('produces valid JSON with metadata', () => {
      const jsonStr = exportTasksToJSON(mockTasks, { id: 'proj-1', name: 'Project Alpha' });
      const parsed = JSON.parse(jsonStr);

      expect(parsed.version).toBe('1.0');
      expect(parsed.totalTasks).toBe(1);
      expect(parsed.project.name).toBe('Project Alpha');
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.tasks[0].title).toBe('Sample task');
    });

    it('handles export without project metadata', () => {
      const jsonStr = exportTasksToJSON(mockTasks);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.project).toBeUndefined();
      expect(parsed.totalTasks).toBe(1);
    });
  });
});
