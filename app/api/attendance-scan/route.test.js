jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init = {}) => ({ body, status: init.status ?? 200 })),
  },
}));

const { POST } = require('./route');

describe('attendance-scan route', () => {
  it('exports a POST handler', () => {
    expect(typeof POST).toBe('function');
  });
});
