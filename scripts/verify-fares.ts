import {
  computePujFare,
  getPeriod,
  getTricycleFare,
  TRICYCLE_CONFIG,
} from '../src/data/fares.ts';

let failures = 0;

function check(name: string, actual: number | string, expected: number | string) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${actual} (expected ${expected})`);
}

console.log('Jeepney (PUJ, per km) - verified with 17 km = P40 regular / P32 discounted, 10 km = P26 regular / P20.75 discounted');
check('17 km regular', computePujFare(17, 'regular'), 40.0);
check('17 km discounted', computePujFare(17, 'discounted'), 32.0);
check('10 km regular', computePujFare(10, 'regular'), 26.0);
check('10 km discounted', computePujFare(10, 'discounted'), 20.75);

console.log('\nTricycle (lookup table) - zone-based');
check('Poblacion (Zone B) to CvSU day regular', getTricycleFare('B', 'CvSU', 'day', 'regular'), 30);
check('Poblacion (Zone B) to CvSU night regular', getTricycleFare('B', 'CvSU', 'night', 'regular'), 35);

console.log('\nDiscount while applyStudentDiscount = false');
const discountOff = TRICYCLE_CONFIG.applyStudentDiscount === false;
console.log(`INFO  applyStudentDiscount is ${TRICYCLE_CONFIG.applyStudentDiscount}`);
const cases: [string, string, 'day' | 'night'][] = [
  ['B', 'CvSU', 'day'],
  ['B', 'CvSU', 'night'],
];
for (const [zone, destination, period] of cases) {
  const regular = getTricycleFare(zone, destination, period, 'regular');
  const discounted = getTricycleFare(zone, destination, period, 'discounted');
  if (discountOff) {
    check(`discounted == regular (${zone} ${destination} ${period})`, discounted, regular);
  } else {
    console.log(`SKIP  discount is enabled, so equality is not expected`);
  }
}

console.log('\nPeriod boundaries');
check('04:00 is night', getPeriod(new Date(2026, 0, 1, 4, 0)), 'night');
check('04:01 is day', getPeriod(new Date(2026, 0, 1, 4, 1)), 'day');
check('20:59 is day', getPeriod(new Date(2026, 0, 1, 20, 59)), 'day');
check('21:00 is night', getPeriod(new Date(2026, 0, 1, 21, 0)), 'night');

console.log(failures === 0 ? '\nRESULT: PASS' : `\nRESULT: FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
