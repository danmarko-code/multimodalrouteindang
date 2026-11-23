// Hardcoded local data for Indang, Cavite. No network or backend yet.
import { POBLACION_PROPER, type FareLeg, type TricycleZone } from '@data/fares';

export type OperatingHours = {
  opensAt: string; // 24-hour HH:MM
  closesAt: string; // 24-hour HH:MM
};

export type Terminal = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  operatingHours?: OperatingHours;
};

export type PlaceCategory =
  | 'school'
  | 'market'
  | 'government'
  | 'health'
  | 'worship'
  | 'barangay'
  | 'landmark';

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  terminalId: string;
};

export type JeepneyLeg = {
  id: string;
  mode: 'jeepney';
  fromTerminalId: string;
  toTerminalId: string;
  distanceKm: number;
};

export type TricycleLeg = {
  id: string;
  mode: 'tricycle';
  fromTerminalId: string;
  toTerminalId: string;
  tricycle: { zone: TricycleZone; destination: string };
};

export type RouteLeg = JeepneyLeg | TricycleLeg;

// Jeepney terminals are open 6:00 AM to 7:00 PM. Municipal Hall Stop is a
// tricycle-only stop, so it has no hours on record.
export const terminals: Terminal[] = [
  {
    id: 't-poblacion',
    name: 'Poblacion Terminal',
    area: 'Poblacion',
    lat: 14.1919,
    lng: 120.8778,
    operatingHours: { opensAt: '06:00', closesAt: '19:00' },
  },
  {
    id: 't-cvsu',
    name: 'CvSU Terminal',
    area: 'CvSU Main Campus',
    lat: 14.1936,
    lng: 120.8794,
    operatingHours: { opensAt: '06:00', closesAt: '19:00' },
  },
  {
    id: 't-kaytapos',
    name: 'Kaytapos Terminal',
    area: 'Kaytapos',
    lat: 14.1875,
    lng: 120.883,
    operatingHours: { opensAt: '06:00', closesAt: '19:00' },
  },
  {
    id: 't-alulod',
    name: 'Alulod Terminal',
    area: 'Alulod',
    lat: 14.2,
    lng: 120.86,
    operatingHours: { opensAt: '06:00', closesAt: '19:00' },
  },
  {
    id: 't-bancod',
    name: 'Bancod Terminal',
    area: 'Bancod',
    lat: 14.18,
    lng: 120.885,
    operatingHours: { opensAt: '06:00', closesAt: '19:00' },
  },
  { id: 't-municipal', name: 'Municipal Hall Stop', area: 'Poblacion', lat: 14.1928, lng: 120.8762 },
];

export const places: Place[] = [
  { id: 'p-cvsu-gate', name: 'CvSU Main Gate', category: 'school', terminalId: 't-cvsu' },
  { id: 'p-cvsu-admin', name: 'CvSU Administration Building', category: 'school', terminalId: 't-cvsu' },
  { id: 'p-market', name: 'Indang Public Market', category: 'market', terminalId: 't-poblacion' },
  { id: 'p-municipal-hall', name: 'Indang Municipal Hall', category: 'government', terminalId: 't-municipal' },
  { id: 'p-church', name: 'St. Gregory the Great Parish Church', category: 'worship', terminalId: 't-poblacion' },
  { id: 'p-national-hs', name: 'Indang National High School', category: 'school', terminalId: 't-poblacion' },
  { id: 'p-rhu', name: 'Indang Rural Health Unit', category: 'health', terminalId: 't-municipal' },
  { id: 'p-police', name: 'Indang Police Station', category: 'government', terminalId: 't-municipal' },
  { id: 'p-plaza', name: 'Indang Plaza', category: 'landmark', terminalId: 't-poblacion' },
  { id: 'p-kaytapos-bridge', name: 'Kaytapos Bridge', category: 'landmark', terminalId: 't-kaytapos' },
  { id: 'p-alulod-hall', name: 'Alulod Barangay Hall', category: 'barangay', terminalId: 't-alulod' },
  { id: 'p-bancod-hall', name: 'Bancod Barangay Hall', category: 'barangay', terminalId: 't-bancod' },
];

// Route legs store no fare values: jeepney legs store km, tricycle legs reference a fare row.
export const routeLegs: RouteLeg[] = [
  { id: 'leg-poblacion-cvsu', mode: 'tricycle', fromTerminalId: 't-poblacion', toTerminalId: 't-cvsu', tricycle: { zone: 'B', destination: 'CvSU (Village, H.S., College Loob)' } },
  { id: 'leg-poblacion-kaytapos', mode: 'tricycle', fromTerminalId: 't-poblacion', toTerminalId: 't-kaytapos', tricycle: { zone: 'B', destination: 'Kaytapos (Upland/Rough road subdivision)' } },
  { id: 'leg-poblacion-alulod', mode: 'tricycle', fromTerminalId: 't-poblacion', toTerminalId: 't-alulod', tricycle: { zone: 'B', destination: 'Alulod (Bukana/Barangay Hall/Patilyo)' } },
  { id: 'leg-poblacion-bancod', mode: 'tricycle', fromTerminalId: 't-poblacion', toTerminalId: 't-bancod', tricycle: { zone: 'B', destination: 'Bancod (Purok 1 to 2)' } },
  { id: 'leg-poblacion-municipal', mode: 'tricycle', fromTerminalId: 't-poblacion', toTerminalId: 't-municipal', tricycle: { zone: 'A', destination: POBLACION_PROPER } },
  { id: 'leg-cvsu-kaytapos', mode: 'jeepney', fromTerminalId: 't-cvsu', toTerminalId: 't-kaytapos', distanceKm: 3.2 },
  { id: 'leg-cvsu-alulod', mode: 'jeepney', fromTerminalId: 't-cvsu', toTerminalId: 't-alulod', distanceKm: 7.8 },
  { id: 'leg-cvsu-bancod', mode: 'jeepney', fromTerminalId: 't-cvsu', toTerminalId: 't-bancod', distanceKm: 5.4 },
  { id: 'leg-kaytapos-alulod', mode: 'jeepney', fromTerminalId: 't-kaytapos', toTerminalId: 't-alulod', distanceKm: 6.1 },
  { id: 'leg-kaytapos-bancod', mode: 'jeepney', fromTerminalId: 't-kaytapos', toTerminalId: 't-bancod', distanceKm: 4.3 },
  { id: 'leg-alulod-bancod', mode: 'jeepney', fromTerminalId: 't-alulod', toTerminalId: 't-bancod', distanceKm: 9.2 },
  { id: 'leg-municipal-cvsu', mode: 'tricycle', fromTerminalId: 't-municipal', toTerminalId: 't-cvsu', tricycle: { zone: 'B', destination: 'CvSU (Village, H.S., College Loob)' } },
];

export type ResultsLeg = FareLeg & {
  durationMin: number;
  fromTerminalId?: string;
  toTerminalId?: string;
};

export type ResultsRoute = {
  id: string;
  name: string;
  legs: ResultsLeg[];
};

// Calibrated so the jeepney fare matches the observed P40 regular fare
// (LTFRB: 17 km = P40.00 regular / P32.00 student, senior, PWD).
export const DASMARINAS_TO_CVSU_KM = 17;
// UNVERIFIED. Estimated fare is about P25; the LTFRB formula gives P24 at 9 km and P26 at 10 km.
// Confirm the real fare with drivers and update.
export const TRECE_TO_CVSU_KM = 10;
// Same values as above, used only for the alternative routes through the town center.
export const DASMARINAS_TO_INDANG_POBLACION_KM = 17;
export const TRECE_TO_INDANG_POBLACION_KM = 10;
// Estimate only; replace with the GPS-logged distance.
export const CVSU_TO_POBLACION_KM = 1.5;

export type ResultsOrigin = 'dasmarinas' | 'trece';

export const RESULTS_ORIGINS: Record<ResultsOrigin, string> = {
  dasmarinas: 'Dasmariñas',
  trece: 'Trece Martires',
};

const CVSU_TRICYCLE_DESTINATION = 'CvSU (Village, H.S., College Loob)';

function buildResults(
  cvsuKm: number,
  poblacionKm: number,
  jeepneyMin: number,
): ResultsRoute[] {
  return [
    {
      id: 'direct-jeepney',
      name: 'Direct Jeepney',
      legs: [
        { mode: 'jeepney', durationMin: jeepneyMin, km: cvsuKm },
        { mode: 'walk', durationMin: 3 },
      ],
    },
    {
      id: 'poblacion-tricycle',
      name: 'Jeepney + Tricycle via Poblacion',
      legs: [
        { mode: 'jeepney', durationMin: jeepneyMin, km: poblacionKm },
        {
          mode: 'tricycle',
          durationMin: 6,
          zone: 'B',
          destination: CVSU_TRICYCLE_DESTINATION,
        },
        { mode: 'walk', durationMin: 3 },
      ],
    },
    {
      id: 'cvsu-terminal',
      name: 'Jeepney via CvSU Terminal',
      legs: [
        { mode: 'jeepney', durationMin: jeepneyMin, km: poblacionKm, toTerminalId: 't-poblacion' },
        {
          mode: 'jeepney',
          durationMin: 10,
          km: CVSU_TO_POBLACION_KM,
          fromTerminalId: 't-poblacion',
          toTerminalId: 't-cvsu',
        },
        { mode: 'walk', durationMin: 3 },
      ],
    },
  ];
}

export const resultsRoutesByOrigin: Record<ResultsOrigin, ResultsRoute[]> = {
  dasmarinas: buildResults(
    DASMARINAS_TO_CVSU_KM,
    DASMARINAS_TO_INDANG_POBLACION_KM,
    45,
  ),
  trece: buildResults(TRECE_TO_CVSU_KM, TRECE_TO_INDANG_POBLACION_KM, 30),
};

export type RouteDiagramStopKind = 'start' | 'stop' | 'transfer' | 'end';

// Ordered stops for each results route, drawn top to bottom on the route
// detail diagram. Real coordinates are kept so a GeoJSON path can replace the
// straight lines later. The start label comes from the chosen origin.
export type RouteDiagramStop = {
  id: string;
  label: string;
  kind: RouteDiagramStopKind;
  terminalId?: string;
  lat?: number;
  lng?: number;
};

export const routeDiagramStops: Record<string, RouteDiagramStop[]> = {
  'direct-jeepney': [
    { id: 'start', label: '', kind: 'start' },
    {
      id: 'cvsu-terminal',
      label: 'CvSU Terminal',
      kind: 'stop',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
    {
      id: 'cvsu-gate',
      label: 'CvSU Main Gate',
      kind: 'end',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
  ],
  'poblacion-tricycle': [
    { id: 'start', label: '', kind: 'start' },
    {
      id: 'poblacion',
      label: 'Poblacion Terminal',
      kind: 'transfer',
      terminalId: 't-poblacion',
      lat: 14.1919,
      lng: 120.8778,
    },
    {
      id: 'cvsu-campus',
      label: 'CvSU Campus',
      kind: 'stop',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
    {
      id: 'cvsu-gate',
      label: 'CvSU Main Gate',
      kind: 'end',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
  ],
  'cvsu-terminal': [
    { id: 'start', label: '', kind: 'start' },
    {
      id: 'poblacion',
      label: 'Poblacion Terminal',
      kind: 'transfer',
      terminalId: 't-poblacion',
      lat: 14.1919,
      lng: 120.8778,
    },
    {
      id: 'cvsu-terminal',
      label: 'CvSU Terminal',
      kind: 'stop',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
    {
      id: 'cvsu-gate',
      label: 'CvSU Main Gate',
      kind: 'end',
      terminalId: 't-cvsu',
      lat: 14.1936,
      lng: 120.8794,
    },
  ],
};

export function getRouteDiagramStops(routeId: string, startLabel: string): RouteDiagramStop[] {
  return (routeDiagramStops[routeId] ?? []).map((stop) =>
    stop.kind === 'start' ? { ...stop, label: startLabel } : stop,
  );
}

export type RouteAvailability = { available: boolean; reason?: string };

const minutesOf = (clock: string) => {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatClock = (clock: string) => {
  const [hours, minutes] = clock.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const terminalById = new Map(terminals.map((terminal) => [terminal.id, terminal]));

// A route runs only if every terminal it uses is open at the departure time.
// Terminals without hours cannot be checked, so they are not treated as closed.
export function getRouteAvailability(route: ResultsRoute, departure: Date): RouteAvailability {
  const minutes = departure.getHours() * 60 + departure.getMinutes();
  const terminalIds = new Set<string>();
  for (const leg of route.legs) {
    if (leg.fromTerminalId) terminalIds.add(leg.fromTerminalId);
    if (leg.toTerminalId) terminalIds.add(leg.toTerminalId);
  }

  for (const id of terminalIds) {
    const terminal = terminalById.get(id);
    const hours = terminal?.operatingHours;
    if (!terminal || !hours) continue;
    if (minutes < minutesOf(hours.opensAt)) {
      return {
        available: false,
        reason: `${terminal.name} opens at ${formatClock(hours.opensAt)}`,
      };
    }
    if (minutes > minutesOf(hours.closesAt)) {
      return {
        available: false,
        reason: `${terminal.name} closes at ${formatClock(hours.closesAt)}`,
      };
    }
  }
  return { available: true };
}
