import type { AttackLane } from './overtakeModel.js';

/**
 * Deliberately narrow radio-command recognition. This is command interpretation,
 * not a conversational agent: only one unambiguous driving call is accepted.
 */
export type DriverCommand = AttackLane | 'now' | 'push' | 'hold';

export interface ParsedDriverCommand {
  command: DriverCommand | null;
  normalized: string;
}

const COMMAND_PHRASES: Readonly<Record<DriverCommand, readonly string[]>> = {
  inside: [
    'inside',
    'go inside',
    'take the inside',
    'inside line',
    'inner line',
    '인사이드',
    '안쪽',
    '안쪽으로',
  ],
  outside: [
    'outside',
    'go outside',
    'take the outside',
    'outside line',
    'outer line',
    '아웃사이드',
    '바깥쪽',
    '바깥으로',
  ],
  now: [
    'now',
    'go now',
    'attack now',
    'send it',
    'make the move',
    'take it now',
    '지금',
    '지금 가',
    '지금 공격',
    '지금 들어가',
  ],
  push: [
    'push',
    'push now',
    'push this lap',
    'full push',
    'attack pace',
    '푸시',
    '밀어붙여',
    '전력으로',
  ],
  hold: [
    'hold',
    'hold pace',
    'maintain pace',
    'stay on pace',
    '유지',
    '페이스 유지',
    '그대로 가',
  ],
};

export function parseDriverCommand(input: string): ParsedDriverCommand {
  const normalized = normalizeCommand(input);
  if (!normalized) {
    return { command: null, normalized };
  }

  const matches = (Object.entries(COMMAND_PHRASES) as Array<
    [DriverCommand, readonly string[]]
  >)
    .filter(([, phrases]) => phrases.includes(normalized))
    .map(([command]) => command);

  return {
    command: matches.length === 1 ? matches[0] : null,
    normalized,
  };
}

function normalizeCommand(input: string): string {
  return input
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
