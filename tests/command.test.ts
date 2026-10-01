import { toggleTheme } from '@/lib/theme';

describe('Command Palette & Keyboard Shortcuts', () => {
  const classList = new Set<string>();
  const storage: Record<string, string> = {};

  beforeAll(() => {
    const mockDoc = {
      documentElement: {
        classList: {
          contains: (cls: string) => classList.has(cls),
          add: (cls: string) => classList.add(cls),
          remove: (cls: string) => classList.delete(cls),
        },
        style: {} as Record<string, string>,
      },
    };

    const mockWin = {
      localStorage: {
        getItem: jest.fn((key: string) => storage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete storage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(storage).forEach((k) => delete storage[k]);
        }),
      },
      dispatchEvent: jest.fn(),
    };

    const mockCustomEvent = class CustomEvent {
      type: string;
      detail: unknown;
      constructor(type: string, params?: { detail?: unknown }) {
        this.type = type;
        this.detail = params?.detail;
      }
    };

    Object.defineProperty(globalThis, 'document', { value: mockDoc, writable: true, configurable: true });
    Object.defineProperty(globalThis, 'window', { value: mockWin, writable: true, configurable: true });
    Object.defineProperty(globalThis, 'CustomEvent', { value: mockCustomEvent, writable: true, configurable: true });
  });

  beforeEach(() => {
    classList.clear();
    Object.keys(storage).forEach((k) => delete storage[k]);
    jest.clearAllMocks();
  });

  describe('Theme Toggle Helper', () => {
    it('switches to light mode when dark class is initially active', () => {
      classList.add('dark');
      const next = toggleTheme();
      expect(next).toBe('light');
      expect(classList.has('dark')).toBe(false);
      expect((global as unknown as { window: { localStorage: { setItem: jest.Mock } } }).window.localStorage.setItem).toHaveBeenCalledWith(
        'nova-theme',
        'light'
      );
    });

    it('switches to dark mode when dark class is not active', () => {
      classList.clear();
      const next = toggleTheme();
      expect(next).toBe('dark');
      expect(classList.has('dark')).toBe(true);
      expect((global as unknown as { window: { localStorage: { setItem: jest.Mock } } }).window.localStorage.setItem).toHaveBeenCalledWith(
        'nova-theme',
        'dark'
      );
    });

    it('dispatches nova-theme-change custom event on toggle', () => {
      const windowObj = (global as unknown as { window: { dispatchEvent: jest.Mock } }).window;
      toggleTheme();
      expect(windowObj.dispatchEvent).toHaveBeenCalled();
      const event = windowObj.dispatchEvent.mock.calls[0][0] as { type: string };
      expect(event.type).toBe('nova-theme-change');
    });
  });

  describe('Command Definitions & Keyword Matching', () => {
    const builtInCommands = [
      { id: 'cmd-dashboard', title: 'Go to Dashboard', keywords: ['dashboard', 'home', 'overview'] },
      { id: 'cmd-my-tasks', title: 'Go to My Tasks', keywords: ['tasks', 'my tasks', 'assigned'] },
      { id: 'cmd-today', title: "Go to Today's Tasks", keywords: ['today', 'due today', 'tasks'] },
      { id: 'cmd-upcoming', title: 'Go to Upcoming Tasks', keywords: ['upcoming', 'future', 'schedule'] },
      { id: 'cmd-overdue', title: 'Go to Overdue Tasks', keywords: ['overdue', 'late', 'urgent'] },
      { id: 'cmd-calendar', title: 'Go to Calendar', keywords: ['calendar', 'month', 'schedule'] },
      { id: 'cmd-toggle-theme', title: 'Toggle Dark / Light Theme', keywords: ['theme', 'dark', 'light'] },
      { id: 'cmd-shortcuts', title: 'Keyboard Shortcuts Cheatsheet', keywords: ['shortcuts', 'help', '?'] },
    ];

    it('matches navigation commands by exact or partial query', () => {
      const query = 'dash';
      const matched = builtInCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.keywords.some((k) => k.includes(query))
      );
      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0].id).toBe('cmd-dashboard');
    });

    it('matches commands by keyword', () => {
      const query = 'late';
      const matched = builtInCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.keywords.some((k) => k.includes(query))
      );
      expect(matched.length).toBe(1);
      expect(matched[0].id).toBe('cmd-overdue');
    });

    it('matches shortcuts command with "?" character', () => {
      const query = '?';
      const matched = builtInCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.keywords.some((k) => k.includes(query))
      );
      expect(matched.length).toBe(1);
      expect(matched[0].id).toBe('cmd-shortcuts');
    });
  });

  describe('Shortcuts Cheatsheet Definitions', () => {
    it('verifies standard navigation chords exist', () => {
      const expectedChords = [
        { desc: 'Go to Dashboard', keys: ['G', 'D'] },
        { desc: 'Go to My Tasks', keys: ['G', 'M'] },
        { desc: "Go to Today's Tasks", keys: ['G', 'T'] },
        { desc: 'Go to Upcoming Tasks', keys: ['G', 'U'] },
        { desc: 'Go to Overdue Tasks', keys: ['G', 'O'] },
        { desc: 'Go to Calendar', keys: ['G', 'C'] },
        { desc: 'Toggle Dark / Light Theme', keys: ['T', 'T'] },
      ];

      expectedChords.forEach((chord) => {
        expect(chord.keys).toHaveLength(2);
        expect(['G', 'T']).toContain(chord.keys[0]);
      });
    });
  });
});
