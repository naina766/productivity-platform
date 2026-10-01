'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { toggleTheme } from '@/lib/theme';

interface KeyboardShortcutsContextValue {
  isCommandPaletteOpen: boolean;
  isShortcutsModalOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  toggleCommandPalette: () => void;
}

const defaultContextValue: KeyboardShortcutsContextValue = {
  isCommandPaletteOpen: false,
  isShortcutsModalOpen: false,
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  openShortcutsModal: () => {},
  closeShortcutsModal: () => {},
  toggleCommandPalette: () => {},
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue>(defaultContextValue);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const pendingChord = useRef<string | null>(null);
  const chordTimer = useRef<NodeJS.Timeout | null>(null);

  const openCommandPalette = useCallback(() => {
    setIsShortcutsModalOpen(false);
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const openShortcutsModal = useCallback(() => {
    setIsCommandPaletteOpen(false);
    setIsShortcutsModalOpen(true);
  }, []);

  const closeShortcutsModal = useCallback(() => {
    setIsShortcutsModalOpen(false);
  }, []);

  const clearChord = useCallback(() => {
    pendingChord.current = null;
    if (chordTimer.current) {
      clearTimeout(chordTimer.current);
      chordTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check for Command Palette: ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        clearChord();
        return;
      }

      // Check if user is typing in an editable field
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isEditable) {
        clearChord();
        return;
      }

      // If Command Palette or Shortcuts modal is open, let them handle internal keys
      if (isCommandPaletteOpen || isShortcutsModalOpen) {
        if (e.key === 'Escape') {
          closeCommandPalette();
          closeShortcutsModal();
          clearChord();
        }
        return;
      }

      const key = e.key.toLowerCase();

      // 2. Question mark ? for shortcuts cheatsheet
      if (e.key === '?') {
        e.preventDefault();
        openShortcutsModal();
        clearChord();
        return;
      }

      // 3. Two-key chord sequences
      if (pendingChord.current === 'g') {
        clearChord();
        switch (key) {
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'm':
            e.preventDefault();
            router.push('/my-tasks');
            break;
          case 't':
            e.preventDefault();
            router.push('/tasks/today');
            break;
          case 'u':
            e.preventDefault();
            router.push('/tasks/upcoming');
            break;
          case 'o':
            e.preventDefault();
            router.push('/tasks/overdue');
            break;
          case 'c':
            e.preventDefault();
            router.push('/calendar');
            break;
        }
        return;
      }

      if (pendingChord.current === 't') {
        clearChord();
        if (key === 't') {
          e.preventDefault();
          toggleTheme();
        }
        return;
      }

      // Set initial chord trigger
      if (key === 'g' || key === 't') {
        pendingChord.current = key;
        if (chordTimer.current) clearTimeout(chordTimer.current);
        chordTimer.current = setTimeout(() => {
          pendingChord.current = null;
        }, 1200);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (chordTimer.current) clearTimeout(chordTimer.current);
    };
  }, [
    isCommandPaletteOpen,
    isShortcutsModalOpen,
    toggleCommandPalette,
    openShortcutsModal,
    closeCommandPalette,
    closeShortcutsModal,
    clearChord,
    router,
  ]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        isCommandPaletteOpen,
        isShortcutsModalOpen,
        openCommandPalette,
        closeCommandPalette,
        openShortcutsModal,
        closeShortcutsModal,
        toggleCommandPalette,
      }}
    >
      {children}
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        onOpenShortcuts={openShortcutsModal}
      />
      <KeyboardShortcutsModal
        open={isShortcutsModalOpen}
        onClose={closeShortcutsModal}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  return useContext(KeyboardShortcutsContext);
}
