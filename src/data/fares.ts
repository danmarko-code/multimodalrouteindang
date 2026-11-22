// Single source of truth for Indang fares.
// No screen may hardcode a fare; import from here.

export type PassengerType = 'regular' | 'discounted';
export type FarePeriod = 'day' | 'night';

// LTFRB PUJ General Fare Guide, effective 2026-09-28. Computed per km.
export const PUJ_CONFIG = {
  label: 'Jeepney',
  source: 'LTFRB PUJ General Fare Guide',
  effectiveDate: '2026-09-28',
  regular: { baseFare: 14.0, baseKm: 4, perKm: 2.0 },
  discounted: { baseFare: 11.2, baseKm: 4, perKm: 1.6 }, // Student / Senior / PWD, applies every day
  roundTo: 0.25,
};

// Indang Municipal Ordinance No. 267-S-2023, June 26, 2023. Lookup table, not per km.
export const TRICYCLE_CONFIG = {
  label: 'Tricycle',
  source: 'Indang Municipal Ordinance No. 267-S-2023',
  effectiveDate: '2023-06-26',
  dayTime: '4:01 AM to 8:59 PM',
  nightTime: '9:00 PM to 4:00 AM',
  minimumFare: 15, // per passenger; the same 15 for pick-up/PULOT within the Poblacion, +5 outside the Poblacion
  studentSeniorPwdMinimum: 12, // Student, Senior Citizen and PWD minimum
  discountRate: 0.2, // 20% off the prescribed fare; NOT applicable to special trips
  applyStudentDiscount: false, // set to true to apply the ordinance discount
  specialTrip: { maxPassengers: 2, fare: 30, additionalPassenger: 15 },
  maxPassengers: 4,
};

export type TricycleZone = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type TricycleFare = {
  zone: TricycleZone;
  origin: string;
  destination: string;
  regular: number;
  night: number;
  note?: string;
};

const ORIGIN: Record<TricycleZone, string> = {
  A: 'Poblacion Proper',
  B: 'Poblacion',
  C: 'Palengke (National School, Binambangan) Sub-Terminal',
  D: 'Buna Cerca Junction (Pilahan)',
  E: 'Kaytapos Junction (Pilahan)',
  F: 'National School and Binambangan (Pilahan)',
};

// Zone A is a single flat trip within the Poblacion Proper.
export const POBLACION_PROPER =
  'Poblacion Proper up to Ilaya, PCI/PTT Station, Lintiw Road, Green Valley Subdivision, Tulay Binambangan, Ramirez Subdivision sa Palengke, New Municipal Hall';

const fare = (
  zone: TricycleZone,
  destination: string,
  regular: number,
  night: number,
  note?: string,
): TricycleFare => ({ zone, origin: ORIGIN[zone], destination, regular, night, note });

export const TRICYCLE_FARES: TricycleFare[] = [
  // A: within the Poblacion Proper
  fare('A', POBLACION_PROPER, 30, 35),

  // B: from Poblacion
  fare('B', 'Agus-os', 40, 50),
  fare('B', 'Alulod (Bukana/Barangay Hall/Patilyo)', 35, 40),
  fare('B', 'Alulod (School/Petron/Patilyo Brasbag)', 40, 50),
  fare('B', 'Alulod (Iglesia ni Cristo/Patilyo Dulo)', 50, 55),
  fare('B', 'Banaba Cerca', 50, 60),
  fare('B', 'Banaba Lejos', 65, 75),
  fare('B', 'Bancod (Purok 1 to 2)', 30, 35),
  fare('B', 'Bancod (Purok 3 and 4)', 35, 40),
  fare('B', 'Bancod (Purok 5/Cambe/Dulo)', 45, 55),
  fare('B', 'Buna Cerca (Bukana/School/Sagbat)', 35, 40),
  fare('B', 'Buna Cerca (Puerte/Ulong-ilog/Dulo)', 40, 45),
  fare('B', 'Buna Lejos', 50, 60),
  fare('B', 'Calumpang Cerca', 35, 40),
  fare('B', 'Calumpang (High School annex)', 40, 50),
  fare('B', 'Calumpang Lejos (up to Iglesia/Court)', 45, 55),
  fare('B', 'Calumpang Lejos (Dulo)', 50, 60),
  fare('B', 'Carasuchi', 90, 110),
  fare('B', 'Daine I and Daine II', 90, 110),
  fare('B', 'CvSU (Village, H.S., College Loob)', 30, 35),
  fare('B', 'Guyam Malaki', 100, 120),
  fare('B', 'Guyam Pilipit', 110, 130),
  fare('B', 'Harasan (Bukana/Dulo)', 80, 90),
  fare('B', 'Kayquit II', 35, 40),
  fare('B', 'Kayquit I', 40, 45),
  fare('B', 'Kayquit III', 45, 50),
  fare('B', 'Kaytapos (Upland/Rough road subdivision)', 30, 35),
  fare('B', 'Kaytambog I (Bukana to Brgy. Hall)', 35, 40),
  fare('B', 'Kaytambog II (Simbahan)', 40, 45),
  fare('B', 'Kaytambog Purok III', 45, 50),
  fare('B', 'Kaytambog (Farms Dulo)', 55, 65),
  fare('B', 'Limbon', 50, 60),
  fare('B', 'Lumampong Balagbag', 80, 100),
  fare('B', 'Lumampong Halayhay', 90, 110),
  fare('B', 'Mahabang Kahoy Cerca (Dulong Kanto)', 40, 50),
  fare('B', 'Mahabang Kahoy (Hatchery)', 50, 60),
  fare('B', 'Mahabang Kahoy (Italaro)', 60, 70),
  fare('B', 'Mahabang Kahoy Balagbag', 110, 130),
  fare('B', 'Mataas na Lupa (MetroGate/Villa Corazon)', 60, 70),
  fare('B', 'Mataas na Lupa (Asama Homes)', 60, 70),
  fare('B', 'Mataas na Lupa (School/Dulo)', 70, 80),
  fare('B', 'Tambo Malaki', 40, 45),
  fare('B', 'Tambo Malaki (Gitna Portugal/Piggery)', 45, 50),
  fare('B', 'Tambo Malaki (Queentown/Mushroom Farm)', 50, 60),
  fare('B', 'Tambo Malaki (Flower Farm)', 45, 50),
  fare('B', 'Tambo Ilaya', 45, 50),
  fare('B', 'Tambo Kulit', 60, 70),
  fare('B', 'Tambo Balagbag', 80, 90),
  fare('B', 'Pulo', 75, 85),

  // C: from Palengke (National School, Binambangan) Sub-Terminal
  fare('C', 'Alulod (Bukana/Barangay Hall/Patilyo)', 40, 45),
  fare('C', 'Alulod (School/Petron/Patilyo Brasbag)', 45, 50),
  fare('C', 'Alulod (Iglesia ni Cristo/Patilyo Dulo)', 50, 55),
  fare('C', 'Buna Cerca (Bukana/School/Sagbat)', 40, 45),
  fare('C', 'Buna Cerca (Puerte/Ulong-ilog/Dulo)', 45, 50),
  fare('C', 'Buna Lejos (Ligas)', 50, 55),
  fare('C', 'Buna Lejos (Nayon)', 50, 55),
  fare('C', 'CvSU (Village, H.S., College Loob)', 30, 35),
  fare('C', 'Kayquit II', 40, 45),
  fare('C', 'Kayquit I', 45, 50),
  fare('C', 'Kayquit III', 50, 60),
  fare('C', 'Kaytapos', 35, 40),
  fare('C', 'Limbon', 55, 60),
  fare('C', 'Mahabang Kahoy Cerca/Dulong Kanto', 45, 55),
  fare('C', 'Mahabang Kahoy (Hatchery)', 55, 65),
  fare('C', 'Mahabang Kahoy (Italaro)', 65, 75),
  fare('C', 'Mahabang Kahoy Balagbag', 115, 135),
  fare('C', 'Mataas na Lupa (MetroGate/Villa Corazon)', 65, 75),
  fare('C', 'Mataas na Lupa (Asama Homes)', 65, 75),
  fare('C', 'Mataas na Lupa (School/Dulo)', 75, 85),

  // D: from Buna Cerca Junction (Pilahan)
  fare('D', 'Plaza (Central Terminal)', 25, 30),
  fare('D', 'Mahabang Kahoy Cerca', 35, 40),
  fare('D', 'Buna Lejos', 45, 50),
  fare('D', 'Mahabang Kahoy Balagbag (Italaro)', 80, 100),
  fare('D', 'Mahabang Kahoy Balagbag Proper', 120, 130),

  // E: from Kaytapos Junction (Pilahan)
  fare('E', 'Plaza (Central Terminal)', 25, 30),
  fare('E', 'Buna Cerca (School, Alfamart)', 30, 30),
  fare('E', 'Buna Cerca (Ulo, Ilog, Puerte, Sagbat)', 35, 35),
  fare('E', 'New Municipal Hall', 35, 40),

  // F: from National School and Binambangan (Pilahan)
  fare('F', 'Plaza (Central Terminal)', 25, 25, 'P15 per passenger if two or more'),
];

type DistanceFareRule = { baseFare: number; baseKm: number; perKm: number };

function computeDistanceFare(km: number, rule: DistanceFareRule, roundTo: number): number {
  if (!Number.isFinite(km) || km < 0) {
    throw new RangeError(`Invalid distance: ${km}`);
  }
  const chargedKm = Math.ceil(km); // round km up to the next whole km
  const raw =
    chargedKm <= rule.baseKm
      ? rule.baseFare
      : rule.baseFare + (chargedKm - rule.baseKm) * rule.perKm;
  const rounded = Math.round(raw / roundTo) * roundTo;
  return Math.round(rounded * 100) / 100; // strip floating-point noise
}

export function computePujFare(km: number, passenger: PassengerType = 'regular'): number {
  return computeDistanceFare(km, PUJ_CONFIG[passenger], PUJ_CONFIG.roundTo);
}

function findTricycleFare(zone: TricycleZone, destination: string): TricycleFare | undefined {
  const normalize = (value: string) => value.trim().toLowerCase();
  const key = normalize(destination);
  return (
    TRICYCLE_FARES.find((row) => row.zone === zone && normalize(row.destination) === key) ??
    TRICYCLE_FARES.find((row) => row.zone === zone && normalize(row.destination).startsWith(key))
  );
}

export function getTricycleFare(
  zone: TricycleZone,
  destination: string,
  period: FarePeriod,
  passenger: PassengerType = 'regular',
): number {
  const row = findTricycleFare(zone, destination);
  if (!row) {
    throw new Error(`No tricycle fare for zone ${zone} to "${destination}"`);
  }
  // The night fare always comes straight from the table's night column.
  const base = period === 'day' ? row.regular : row.night;
  if (passenger === 'regular' || !TRICYCLE_CONFIG.applyStudentDiscount || period === 'night') {
    return base;
  }
  const discounted = Math.round(base * (1 - TRICYCLE_CONFIG.discountRate));
  return Math.max(TRICYCLE_CONFIG.studentSeniorPwdMinimum, discounted);
}

const DAY_START_MINUTES = 4 * 60 + 1; // 4:01 AM
const DAY_END_MINUTES = 21 * 60; // 8:59 PM inclusive; 9:00 PM starts night

export function getPeriod(date: Date): FarePeriod {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= DAY_START_MINUTES && minutes < DAY_END_MINUTES ? 'day' : 'night';
}

export type FareLeg =
  | { mode: 'walk' }
  | { mode: 'jeepney'; km: number }
  | { mode: 'tricycle'; zone: TricycleZone; destination: string };

export function computeFare(
  leg: FareLeg,
  context: { passenger: PassengerType; period: FarePeriod },
): number {
  switch (leg.mode) {
    case 'walk':
      return 0;
    case 'jeepney':
      return computePujFare(leg.km, context.passenger);
    case 'tricycle':
      return getTricycleFare(leg.zone, leg.destination, context.period, context.passenger);
  }
}
