export const VALID_CITIES = [
  'baghdad', 'basra', 'mosul', 'erbil', 'sulaymaniyah', 'kirkuk',
  'najaf', 'karbala', 'hillah', 'nasiriyah', 'amarah', 'diwaniyah',
  'kut', 'samawah', 'ramadi', 'fallujah', 'tikrit', 'baqubah',
  'samarra', 'dohuk', 'zakho', 'halabja', 'khanaqin', 'mandali',
  'balad', 'tal_afar', 'sinjar', 'haditha', 'hit', 'nukhayb',
  'rutba', 'ali_gharbi', 'qurnah', 'faw', 'zubair',
] as const;

export type IraqiCityValue = typeof VALID_CITIES[number];
