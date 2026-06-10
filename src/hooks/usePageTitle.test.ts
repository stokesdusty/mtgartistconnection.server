import { renderHook } from '@testing-library/react';
import { usePageTitle } from './usePageTitle';

const SITE_NAME = 'MtG Artist Connection';

afterEach(() => {
  document.title = '';
});

describe('usePageTitle', () => {
  it('sets document.title to the site name when no title is provided', () => {
    renderHook(() => usePageTitle());
    expect(document.title).toBe(SITE_NAME);
  });

  it('sets document.title to "<title> | <site name>" when a title is provided', () => {
    renderHook(() => usePageTitle('Aaron Miller'));
    expect(document.title).toBe(`Aaron Miller | ${SITE_NAME}`);
  });

  it('resets document.title to the site name on unmount', () => {
    document.title = 'something else';
    const { unmount } = renderHook(() => usePageTitle('Aaron Miller'));
    expect(document.title).toBe(`Aaron Miller | ${SITE_NAME}`);
    unmount();
    expect(document.title).toBe(SITE_NAME);
  });

  it('updates document.title when the title prop changes', () => {
    let title = 'First';
    const { rerender } = renderHook(() => usePageTitle(title));
    expect(document.title).toBe(`First | ${SITE_NAME}`);

    title = 'Second';
    rerender();
    expect(document.title).toBe(`Second | ${SITE_NAME}`);
  });

  it('switches back to the bare site name when title changes to undefined', () => {
    let title: string | undefined = 'Aaron Miller';
    const { rerender } = renderHook(() => usePageTitle(title));
    expect(document.title).toBe(`Aaron Miller | ${SITE_NAME}`);

    title = undefined;
    rerender();
    expect(document.title).toBe(SITE_NAME);
  });
});
