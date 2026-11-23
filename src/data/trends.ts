// Wait history per terminal, in minutes and report counts.

export type TerminalTrends = {
  // Average wait for each hour from 5 AM to 8 PM.
  hourlyAverageWait: number[];
  // Average wait for Monday to Sunday.
  weekdayAverageWait: number[];
  // Reports for each of the last 7 days, oldest first.
  reportsPerDay: number[];
  // Reports over the last 30 days.
  reportsLast30Days: number;
};

export const TREND_HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export const TREND_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const ALL_TERMINALS = 'all';

export const trendsByTerminal: Record<string, TerminalTrends> = {
  't-poblacion': {
    hourlyAverageWait: [6, 14, 18, 16, 11, 8, 7, 9, 8, 9, 11, 15, 19, 16, 10, 6],
    weekdayAverageWait: [11, 13, 12, 11, 14, 16, 9],
    reportsPerDay: [22, 25, 24, 23, 26, 31, 18],
    reportsLast30Days: 690,
  },
  't-cvsu': {
    hourlyAverageWait: [5, 12, 15, 14, 10, 7, 6, 8, 7, 8, 10, 13, 16, 14, 9, 5],
    weekdayAverageWait: [9, 11, 10, 10, 12, 14, 8],
    reportsPerDay: [28, 30, 29, 31, 33, 36, 24],
    reportsLast30Days: 820,
  },
  't-kaytapos': {
    hourlyAverageWait: [7, 16, 21, 19, 13, 9, 8, 10, 9, 10, 13, 18, 23, 19, 12, 7],
    weekdayAverageWait: [12, 15, 14, 13, 16, 18, 10],
    reportsPerDay: [14, 16, 15, 13, 17, 19, 11],
    reportsLast30Days: 420,
  },
  't-alulod': {
    hourlyAverageWait: [3, 8, 11, 10, 7, 5, 4, 6, 5, 6, 8, 10, 12, 10, 7, 4],
    weekdayAverageWait: [6, 8, 7, 7, 9, 10, 5],
    reportsPerDay: [8, 9, 9, 8, 10, 11, 6],
    reportsLast30Days: 210,
  },
  't-bancod': {
    hourlyAverageWait: [4, 10, 13, 12, 9, 6, 5, 7, 6, 7, 9, 12, 14, 12, 8, 5],
    weekdayAverageWait: [8, 10, 9, 9, 11, 12, 7],
    reportsPerDay: [16, 17, 16, 15, 18, 20, 12],
    reportsLast30Days: 380,
  },
  't-municipal': {
    hourlyAverageWait: [5, 11, 14, 13, 9, 7, 6, 8, 7, 8, 10, 13, 15, 13, 9, 6],
    weekdayAverageWait: [9, 11, 10, 10, 12, 13, 8],
    reportsPerDay: [13, 14, 14, 12, 15, 16, 10],
    reportsLast30Days: 300,
  },
};

const average = (values: number[]) =>
  Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

export function getTrends(terminalId: string): TerminalTrends {
  const direct = trendsByTerminal[terminalId];
  if (direct) return direct;

  const rows = Object.values(trendsByTerminal);
  return {
    hourlyAverageWait: TREND_HOURS.map((_, index) =>
      average(rows.map((row) => row.hourlyAverageWait[index])),
    ),
    weekdayAverageWait: TREND_WEEKDAYS.map((_, index) =>
      average(rows.map((row) => row.weekdayAverageWait[index])),
    ),
    reportsPerDay: TREND_WEEKDAYS.map((_, index) =>
      rows.reduce((sum, row) => sum + row.reportsPerDay[index], 0),
    ),
    reportsLast30Days: rows.reduce((sum, row) => sum + row.reportsLast30Days, 0),
  };
}
