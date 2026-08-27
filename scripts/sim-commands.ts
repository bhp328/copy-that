import { parseDriverCommand } from '../src/commandParser.js';
import type { DriverCommand } from '../src/commandParser.js';

const cases: ReadonlyArray<readonly [string, DriverCommand | null]> = [
  ['INSIDE', 'inside'],
  ['Go inside!', 'inside'],
  ['take the inside', 'inside'],
  ['인사이드', 'inside'],
  ['안쪽으로', 'inside'],
  ['OUTSIDE', 'outside'],
  ['outside line', 'outside'],
  ['take the outside', 'outside'],
  ['아웃사이드', 'outside'],
  ['바깥쪽', 'outside'],
  ['NOW', 'now'],
  ['send it', 'now'],
  ['make the move', 'now'],
  ['지금 가', 'now'],
  ['PUSH', 'push'],
  ['push this lap', 'push'],
  ['밀어붙여', 'push'],
  ['HOLD PACE', 'hold'],
  ['페이스 유지', 'hold'],
  ['inside now', null],
  ['go', null],
  ['can you do something clever?', null],
  ['', null],
];

for (const [input, expected] of cases) {
  const result = parseDriverCommand(input);
  const passed = result.command === expected;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${JSON.stringify(input)} -> ${result.command ?? 'none'}`);
  assert(passed, `Expected ${JSON.stringify(input)} to resolve to ${expected}.`);
}

console.log(`\n${cases.length} command-parser regression cases passed.`);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
