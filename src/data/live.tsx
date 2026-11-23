import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { terminals } from './indang';

export type QueueLevel = 'none' | '1-5' | '6-15' | '16+';

type LiveTerminal = {
  queueLevel: QueueLevel;
  waitMinutes: number;
  reportsToday: number;
  reportedAt: number;
};

export type TerminalStatus = LiveTerminal & {
  isStale: boolean;
  minutesAgo: number;
};

type LiveContextValue = {
  getTerminalStatus: (id: string) => TerminalStatus | undefined;
  submitReport: (id: string, queueLevel: QueueLevel, waitMinutes: number) => void;
};

const LiveContext = createContext<LiveContextValue | null>(null);

const STALE_MINUTES = 30;

// Queue size starts from the stored wait so the first render matches the
// figures already in the terminal data.
function initialQueueLevel(waitMinutes: number): QueueLevel {
  if (waitMinutes < 10) return 'none';
  if (waitMinutes <= 20) return '6-15';
  return '16+';
}

function buildInitialState(): Record<string, LiveTerminal> {
  const now = Date.now();
  return Object.fromEntries(
    terminals.map((terminal) => [
      terminal.id,
      {
        queueLevel: initialQueueLevel(terminal.waitMinutes),
        waitMinutes: terminal.waitMinutes,
        reportsToday: terminal.reportsToday,
        reportedAt: now - terminal.lastReportMinutesAgo * 60_000,
      },
    ]),
  );
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Record<string, LiveTerminal>>(buildInitialState);

  const submitReport = useCallback(
    (id: string, queueLevel: QueueLevel, waitMinutes: number) => {
      setState((current) => {
        const existing = current[id];
        if (!existing) return current;
        return {
          ...current,
          [id]: {
            queueLevel,
            waitMinutes,
            reportsToday: existing.reportsToday + 1,
            reportedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const value = useMemo<LiveContextValue>(
    () => ({
      getTerminalStatus: (id) => {
        const entry = state[id];
        if (!entry) return undefined;
        const minutesAgo = Math.max(
          0,
          Math.floor((Date.now() - entry.reportedAt) / 60_000),
        );
        return { ...entry, minutesAgo, isStale: minutesAgo > STALE_MINUTES };
      },
      submitReport,
    }),
    [state, submitReport],
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): LiveContextValue {
  const value = useContext(LiveContext);
  if (!value) {
    throw new Error('useLive must be used inside LiveProvider');
  }
  return value;
}
