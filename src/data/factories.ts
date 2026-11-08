import { TestCase } from '../api/types';

/**
 * Test data factory.
 * Values are randomized but reproducible: set FACTORY_SEED to replay a run
 * with exactly the same generated data. Uniqueness of titles is NOT left to
 * the factory; ApiClient.createTestCase() and the UI tests add timestamps.
 */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seed = Number(process.env.FACTORY_SEED) || Date.now();
const random = mulberry32(seed);

const ACTIONS = ['Open', 'Verify', 'Enter', 'Select', 'Submit', 'Check'];
const TARGETS = ['the dashboard', 'the form', 'the list', 'the details page', 'the result'];

const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];

export function buildSteps(count = 2): { value: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    value: `Step ${i + 1}: ${pick(ACTIONS)} ${pick(TARGETS)}`,
  }));
}

/** Builds a valid test case payload; any field can be overridden. */
export function buildTestCase(overrides: Partial<TestCase> = {}): Partial<TestCase> {
  return {
    title: `Factory case ${Math.floor(random() * 100000)}`,
    description: `Description: ${pick(ACTIONS)} ${pick(TARGETS)}`,
    expected_result: `Expected: ${pick(TARGETS)} is correct`,
    automated: false,
    test_steps: buildSteps(),
    ...overrides,
  };
}
