export type CommandCategory = 'navigation' | 'actions' | 'system';

export interface CommandAction {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  shortcut?: string[]; // e.g. ['G', 'D'] or ['⌘', 'K']
  icon: 'dashboard' | 'tasks' | 'today' | 'upcoming' | 'overdue' | 'calendar' | 'theme' | 'help' | 'search';
  perform: () => void | Promise<void>;
  keywords?: string[];
}

export interface ShortcutGroup {
  name: string;
  shortcuts: {
    description: string;
    keys: string[];
  }[];
}
