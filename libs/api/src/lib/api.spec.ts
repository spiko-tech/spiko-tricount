import { Api, HealthApiGroup, HealthResponse } from './api.js';

describe('api', () => {
  it('should have HealthApiGroup', () => {
    expect(HealthApiGroup).toBeDefined();
  });

  it('should have Api', () => {
    expect(Api).toBeDefined();
  });

  it('should have HealthResponse schema', () => {
    expect(HealthResponse).toBeDefined();
  });
});
