import type { AttackLane } from './overtakeModel.js';

/**
 * Deliberately narrow radio-command recognition. This is command interpretation,
 * not a conversational agent: only one unambiguous driving call is accepted.
 */
export type DriverCommand = AttackLane | 'now';

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
