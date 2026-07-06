// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement these observers, but several pages use them
// (infinite scroll sentinels, responsive grid measurement).
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).IntersectionObserver = (global as any).IntersectionObserver || MockObserver;
(global as any).ResizeObserver = (global as any).ResizeObserver || MockObserver;
