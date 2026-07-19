import { IntakeItem } from '../../types/IntakeTypes';
import {
  detectSource,
  isCapturableUrl,
  mergeItems,
  parseYouTubeUrl,
  visibleItems,
} from '../intakeStore';

const item = (overrides: Partial<IntakeItem>): IntakeItem => ({
  id: 'a',
  url: 'https://example.com',
  source: 'web',
  status: 'inbox',
  createdAt: '2026-07-19T10:00:00.000Z',
  updatedAt: '2026-07-19T10:00:00.000Z',
  ...overrides,
});

describe('mergeItems', () => {
  it('unions by id with newer updatedAt winning', () => {
    const local = [item({ id: 'a', note: 'local', updatedAt: '2026-07-19T12:00:00.000Z' })];
    const remote = [
      item({ id: 'a', note: 'remote', updatedAt: '2026-07-19T11:00:00.000Z' }),
      item({ id: 'b', note: 'remote-only' }),
    ];
    const merged = mergeItems(local, remote);
    expect(merged).toHaveLength(2);
    expect(merged.find(i => i.id === 'a')?.note).toBe('local');
  });

  it('local wins updatedAt ties', () => {
    const stamp = '2026-07-19T12:00:00.000Z';
    const merged = mergeItems(
      [item({ note: 'local', updatedAt: stamp })],
      [item({ note: 'remote', updatedAt: stamp })]
    );
    expect(merged[0].note).toBe('local');
  });

  it('a newer tombstone beats an older edit (deletion roams)', () => {
    const merged = mergeItems(
      [item({ note: 'edited', updatedAt: '2026-07-19T11:00:00.000Z' })],
      [item({ deletedAt: '2026-07-19T12:00:00.000Z', updatedAt: '2026-07-19T12:00:00.000Z' })]
    );
    expect(merged[0].deletedAt).toBeDefined();
  });

  it('a newer status change beats an older one (discard/distill roams)', () => {
    const merged = mergeItems(
      [item({ status: 'inbox', updatedAt: '2026-07-19T11:00:00.000Z' })],
      [
        item({
          status: 'distilled',
          lessonId: 'l1',
          updatedAt: '2026-07-19T12:00:00.000Z',
        }),
      ]
    );
    expect(merged[0].status).toBe('distilled');
    expect(merged[0].lessonId).toBe('l1');
  });
});

describe('visibleItems', () => {
  const items = [
    item({ id: 'old', createdAt: '2026-07-18T10:00:00.000Z' }),
    item({ id: 'new', createdAt: '2026-07-19T10:00:00.000Z' }),
    item({ id: 'gone', deletedAt: '2026-07-19T11:00:00.000Z' }),
    item({ id: 'done', status: 'distilled' }),
    item({ id: 'binned', status: 'discarded' }),
  ];

  it('filters by status, hides tombstones, newest first', () => {
    expect(visibleItems(items, 'inbox').map(i => i.id)).toEqual(['new', 'old']);
    expect(visibleItems(items, 'distilled').map(i => i.id)).toEqual(['done']);
    expect(visibleItems(items, 'discarded').map(i => i.id)).toEqual(['binned']);
  });
});

describe('parseYouTubeUrl / detectSource', () => {
  it.each([
    ['https://www.youtube.com/watch?v=8aGhZQkoFbQ', '8aGhZQkoFbQ'],
    ['https://youtube.com/watch?v=8aGhZQkoFbQ&t=42s', '8aGhZQkoFbQ'],
    ['https://youtu.be/8aGhZQkoFbQ', '8aGhZQkoFbQ'],
    ['https://youtu.be/8aGhZQkoFbQ?si=share-junk', '8aGhZQkoFbQ'],
    ['https://m.youtube.com/watch?v=8aGhZQkoFbQ', '8aGhZQkoFbQ'],
    ['https://www.youtube.com/shorts/abc-DEF_123', 'abc-DEF_123'],
    ['https://www.youtube.com/embed/8aGhZQkoFbQ', '8aGhZQkoFbQ'],
  ])('%s → %s', (url, id) => {
    expect(parseYouTubeUrl(url)).toBe(id);
    expect(detectSource(url)).toBe('youtube');
  });

  it.each([
    'https://www.drumeo.com/some-lesson',
    'https://en.wikipedia.org/wiki/Drum_rudiment',
    'https://youtube.com/', // no video
    'not a url at all',
  ])('%s is not a YouTube video', url => {
    expect(parseYouTubeUrl(url)).toBeNull();
  });
});

describe('isCapturableUrl', () => {
  it('accepts http(s) only', () => {
    expect(isCapturableUrl('https://example.com/a')).toBe(true);
    expect(isCapturableUrl('http://example.com')).toBe(true);
    expect(isCapturableUrl('ftp://example.com')).toBe(false);
    expect(isCapturableUrl('javascript:alert(1)')).toBe(false);
    expect(isCapturableUrl('drums are cool')).toBe(false);
  });
});
