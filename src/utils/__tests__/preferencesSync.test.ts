import { shouldApplyServerConfig } from '../preferencesSync';

const T1 = '2026-07-10T10:00:00.000Z';
const T2 = '2026-07-10T11:00:00.000Z';

describe('shouldApplyServerConfig (preferences LWW at sign-in, JAK-57)', () => {
  it('applies the server config when there is no local stamp', () => {
    expect(shouldApplyServerConfig(null, T1)).toBe(true);
    expect(shouldApplyServerConfig(undefined, T1)).toBe(true);
  });

  it('applies the server config only when it is strictly newer than local', () => {
    expect(shouldApplyServerConfig(T1, T2)).toBe(true); // server newer → apply
    expect(shouldApplyServerConfig(T2, T1)).toBe(false); // local newer → keep local
  });

  it('keeps local on a tie (avoids needless churn)', () => {
    expect(shouldApplyServerConfig(T1, T1)).toBe(false);
  });

  it('keeps local when the server row has no timestamp', () => {
    expect(shouldApplyServerConfig(T1, null)).toBe(false);
    expect(shouldApplyServerConfig(T1, undefined)).toBe(false);
  });
});
