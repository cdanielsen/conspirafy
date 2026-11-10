import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { conspirafy } from './conspirafy.js';

const mockRandom = (...values: number[]) => {
  let call = 0;
  mock.method(Math, 'random', () => values[call++ % values.length]!);
};

describe('conspirafy', () => {
  afterEach(() => mock.restoreAll());

  it('uppercases characters when the random value is above 0.5', () => {
    mockRandom(0.9);
    assert.equal(conspirafy('What about'), 'WHAT ABOUT');
  });

  it('lowercases characters when the random value is below 0.5', () => {
    mockRandom(0.1);
    assert.equal(conspirafy('What ABOUT'), 'what about');
  });

  it('lowercases characters when the random value is exactly 0.5', () => {
    mockRandom(0.5);
    assert.equal(conspirafy('AB'), 'ab');
  });

  it('flips each character independently', () => {
    mockRandom(0.1, 0.9);
    assert.equal(conspirafy('what'), 'wHaT');
  });

  it('keeps emoji intact next to letters', () => {
    mockRandom(0.9);
    assert.equal(conspirafy('😀a'), '😀A');
  });

  it('leaves characters without case unchanged', () => {
    assert.equal(conspirafy('123 !?.,'), '123 !?.,');
  });

  it('returns an empty string for empty input', () => {
    assert.equal(conspirafy(''), '');
  });

  it('only changes the case of its input', () => {
    const text = 'The moon landing was a hoax';
    assert.equal(conspirafy(text).toLowerCase(), text.toLowerCase());
  });
});
