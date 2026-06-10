import { capitalizeFirstLetter } from './utils';

describe('capitalizeFirstLetter', () => {
  it('returns null for null input', () => {
    expect(capitalizeFirstLetter(null)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(capitalizeFirstLetter('')).toBeNull();
  });

  it('capitalizes the first letter of a lowercase string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('leaves an already-capitalized string unchanged', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello');
  });

  it('only capitalizes the first letter, leaving the rest unchanged', () => {
    expect(capitalizeFirstLetter('hELLO')).toBe('HELLO');
  });

  it('works on a single character', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
  });

  it('works on a multi-word string', () => {
    expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
  });

  it('works on a string that starts with a digit', () => {
    expect(capitalizeFirstLetter('4bidden')).toBe('4bidden');
  });
});
