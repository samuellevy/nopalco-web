import { render, waitFor } from '@testing-library/react';
import SheetMusicPage from './sheet-music.page';

const mockLoad = jest.fn().mockResolvedValue(undefined);
const mockRender = jest.fn();

jest.mock('opensheetmusicdisplay', () => ({
  OpenSheetMusicDisplay: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    load: mockLoad,
    render: mockRender,
  })),
}));

describe('SheetMusicPage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    window.env = { API: 'http://api.test' };
    mockLoad.mockClear();
    mockRender.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('loads uploaded scores from the API and reloads when the filename changes', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const { rerender } = render(<SheetMusicPage sheet="first score.xml" />);
    await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('http://api.test/scores/first%20score.xml'));
    rerender(<SheetMusicPage sheet="second.xml" />);
    await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('http://api.test/scores/second.xml'));
    expect(mockRender).toHaveBeenCalledTimes(2);
  });

  test('loads existing frontend scores when the API does not have them', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    render(<SheetMusicPage sheet="old.xml" />);
    await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('/assets/scores/old.xml'));
  });
});
