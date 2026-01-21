import { getUnknownErrorMessage } from './errors.js';

describe('getUnknownErrorMessage', () => {
  it('should return reason when Error has reason property', () => {
    const error = new Error('message');
    (error as unknown as Record<string, unknown>).reason = 'custom reason';
    expect(getUnknownErrorMessage(error)).toBe('custom reason');
  });

  it('should return message when Error has no reason property', () => {
    const error = new Error('error message');
    expect(getUnknownErrorMessage(error)).toBe('error message');
  });

  it('should return formatted string for non-Error values', () => {
    expect(getUnknownErrorMessage('string error')).toBe('Unknown error: string error');
    expect(getUnknownErrorMessage(42)).toBe('Unknown error: 42');
    expect(getUnknownErrorMessage(null)).toBe('Unknown error: null');
  });
});
