const { normalizeId, computeLookupKey } = require('../lib/id');

test('normalize: national id removes spaces/dashes and uppercases', () => {
  expect(normalizeId(' 12-34 56 78 ', 'NATIONAL_ID')).toBe('12345678');
});

test('computeLookupKey deterministic with same secret', () => {
  const k1 = computeLookupKey('12345', 'secret-x');
  const k2 = computeLookupKey('12345', 'secret-x');
  expect(k1).toBe(k2);
});
