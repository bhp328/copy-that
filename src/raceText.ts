import type { Language } from './localization';
import type { RaceRadioKey } from './raceSession';
import type { CircuitCornerKey } from './track';

export interface RaceUiText {
  team: string;
  car: string;
  session: string;
  live: string;
  title: string;
  role: string;
  hookLines: readonly string[];
  start: string;
  objectiveLabel: string;
  objective: string;
  position: string;
  lap: string;
  sector: string;
  next: string;
  gap: string;
  clear: string;
  tactical: string;
  target: string;
  leader: string;
  player: string;
  radio: string;
  channelOpen: string;
  radioHint: string;
  radioPlaceholder: string;
  transmit: string;
  unavailable: string;
  unrecognized: string;
  commands: string;
  standby: string;
  push: string;
  hold: string;
  inside: string;
  outside: string;
  now: string;
  soundOn: string;
  soundOff: string;
  finishTitle: string;
  targetAchieved: string;
  targetMissed: string;
  retry: string;
  raceTime: string;
  paceCall: string;
  paceValues: Record<'push' | 'hold' | 'missed' | 'none', string>;
  cue: {
    ready: string;
    countdown: string;
    racing: string;
    pace: string;
    target: string;
    watch: string;
    line: string;
    preparing: string;
    readyToAttack: string;
    success: string;
    tooEarly: string;
    tooLate: string;
    blocked: string;
    noCall: string;
    bringHome: string;
  };
  rivalFact: {
    neutral: string;
    inside: string;
    outside: string;
  };
  radioLine: Record<RaceRadioKey, string>;
  corners: Record<CircuitCornerKey, string>;
}

export const RACE_UI_TEXT = {
  en: {
    team: 'APEX VECTOR',
    car: 'CAR 27',
    session: 'MERIDIAN SPRINT // 3 LAPS',
    live: 'ONBOARD LIVE',
    title: 'COPY THAT?',
    role: 'YOU ARE THE RACE ENGINEER.',
    hookLines: [
      'YOUR DRIVER HAS THE WHEEL.',
      'READ THE RACE.',
      'MAKE THE CALL.',
    ],
    start: 'START SESSION',
    objectiveLabel: 'MISSION',
    objective: 'FINISH P2 OR BETTER',
    position: 'POSITION',
    lap: 'LAP',
    sector: 'SECTOR',
    next: 'NEXT',
    gap: 'GAP TO P2',
    clear: 'CLEAR',
    tactical: 'TACTICAL TRACK',
    target: 'TARGET P2',
    leader: 'LEADER',
    player: 'CAR 27',
    radio: 'DRIVER RADIO',
    channelOpen: 'CHANNEL OPEN',
    radioHint: 'Short calls map to deterministic Driver commands.',
    radioPlaceholder: 'PUSH / OUTSIDE / NOW',
    transmit: 'TRANSMIT',
    unavailable: 'CALL NOT AVAILABLE IN THIS RACE STATE',
    unrecognized: 'USE PUSH, HOLD, INSIDE, OUTSIDE, OR NOW',
    commands: 'DRIVER CALLS',
    standby: 'STANDBY FOR THE NEXT CALL',
    push: 'PUSH',
    hold: 'HOLD',
    inside: 'INSIDE',
    outside: 'OUTSIDE',
    now: 'NOW',
    soundOn: 'AUDIO ON',
    soundOff: 'AUDIO OFF',
    finishTitle: 'CHEQUERED FLAG',
    targetAchieved: 'P2 — TARGET ACHIEVED',
    targetMissed: 'P3 — TARGET MISSED',
    retry: 'RETRY SPRINT',
    raceTime: 'RACE TIME',
    paceCall: 'OPENING CALL',
    paceValues: {
      push: 'PUSH',
      hold: 'HOLD',
      missed: 'NO CALL',
      none: '—',
    },
    cue: {
      ready: 'READ THE RACE. MAKE THE CALL.',
      countdown: 'RADIO LIVE // DRIVER READY',
      racing: 'BUILD THE RACE. WATCH THE GAP.',
      pace: 'CLEAR AIR AHEAD // CHOOSE THE PACE',
      target: 'TARGET P2 AHEAD',
      watch: 'WATCH THE RIVAL COMMIT',
      line: 'RIVAL COMMITTED // CALL YOUR LINE',
      preparing: 'DRIVER PREPARING',
      readyToAttack: 'DRIVER READY // JUDGE THE MOMENT',
      success: 'POSITION GAINED',
      tooEarly: 'TOO SOON',
      tooLate: 'TOO LATE',
      blocked: 'LINE BLOCKED',
      noCall: 'NO CALL',
      bringHome: 'BRING IT HOME',
    },
    rivalFact: {
      neutral: 'RIVAL HOLDING CENTRE',
      inside: 'RIVAL MOVING INSIDE',
      outside: 'RIVAL MOVING OUTSIDE',
    },
    radioLine: {
      radioCheck: 'Radio check.',
      raceStart: "Copy. Let's get this done.",
      pushAck: 'Copy. Pushing.',
      holdAck: 'Holding. Keep me posted.',
      noPaceCall: 'No call. Holding the target.',
      lapTwo: 'Lap two. Balance is good.',
      finalLap: "Final lap. Let's finish this.",
      targetAhead: "I've got him. Tell me where.",
      copyInside: 'Copy. Inside line set.',
      copyOutside: 'Copy. Outside line set.',
      now: 'On it.',
      tooSoon: 'Too early. Still setting up.',
      tooLate: 'Missed it. Call came late.',
      noRoom: "No room there. He's covering.",
      noCall: 'No call. We stay P3.',
      gotHim: 'Got him. Nice call.',
      targetAchieved: "That's P2. Good work.",
      targetMissed: 'P3. We left that one out there.',
    },
    corners: {
      orbit: 'ORBIT HAIRPIN',
      compression: 'COMPRESSION',
      northHairpin: 'NORTH HAIRPIN',
      switchback: 'SWITCHBACK',
      finalChicane: 'FINAL CHICANE',
    },
  },
  ko: {
    team: '에이펙스 벡터',
    car: '27번 차량',
    session: '메리디안 스프린트 // 3랩',
    live: '온보드 라이브',
    title: 'COPY THAT?',
    role: '당신은 레이스 엔지니어입니다.',
    hookLines: [
      '운전은 드라이버가 합니다.',
      '레이스를 읽고,',
      '결정적인 지시를 내리세요.',
    ],
    start: '세션 시작',
    objectiveLabel: '미션',
    objective: '2위 이상으로 완주',
    position: '순위',
    lap: '랩',
    sector: '섹터',
    next: '다음 코너',
    gap: '2위와의 간격',
    clear: '추월 완료',
    tactical: '전술 트랙',
    target: '목표 P2',
    leader: '선두',
    player: '27번',
    radio: '드라이버 무전',
    channelOpen: '채널 열림',
    radioHint: '짧은 지시는 정해진 드라이버 명령으로 연결됩니다.',
    radioPlaceholder: '푸시 / 아웃사이드 / 지금',
    transmit: '전송',
    unavailable: '현재 레이스 상황에서는 받을 수 없는 지시입니다',
    unrecognized: '푸시, 유지, 인사이드, 아웃사이드 또는 지금을 사용하세요',
    commands: '드라이버 지시',
    standby: '다음 지시를 준비하세요',
    push: '푸시',
    hold: '유지',
    inside: '인사이드',
    outside: '아웃사이드',
    now: '지금',
    soundOn: '오디오 켜짐',
    soundOff: '오디오 꺼짐',
    finishTitle: '체커기',
    targetAchieved: 'P2 — 목표 달성',
    targetMissed: 'P3 — 목표 실패',
    retry: '스프린트 다시 시작',
    raceTime: '레이스 시간',
    paceCall: '첫 지시',
    paceValues: {
      push: '푸시',
      hold: '유지',
      missed: '지시 없음',
      none: '—',
    },
    cue: {
      ready: '레이스를 읽고 지시하세요.',
      countdown: '무전 연결 // 드라이버 준비 완료',
      racing: '레이스를 만들고 간격을 확인하세요.',
      pace: '앞은 비어 있음 // 페이스를 선택하세요',
      target: '목표 P2가 앞에 있습니다',
      watch: '상대의 방어를 지켜보세요',
      line: '상대가 움직였습니다 // 라인을 지시하세요',
      preparing: '드라이버 준비 중',
      readyToAttack: '드라이버 준비 완료 // 순간을 판단하세요',
      success: '순위 상승',
      tooEarly: '너무 일렀습니다',
      tooLate: '너무 늦었습니다',
      blocked: '라인이 막혔습니다',
      noCall: '지시 없음',
      bringHome: '끝까지 가져오세요',
    },
    rivalFact: {
      neutral: '상대가 중앙을 유지합니다',
      inside: '상대가 인사이드로 이동합니다',
      outside: '상대가 아웃사이드로 이동합니다',
    },
    radioLine: {
      radioCheck: '무전 확인.',
      raceStart: '확인. 해보자.',
      pushAck: '확인. 밀어붙인다.',
      holdAck: '유지한다. 계속 알려줘.',
      noPaceCall: '지시 없음. 목표 페이스 유지한다.',
      lapTwo: '2랩. 밸런스 좋아.',
      finalLap: '파이널 랩. 마무리하자.',
      targetAhead: '상대 보인다. 라인만 알려줘.',
      copyInside: '확인. 인사이드 라인 잡는다.',
      copyOutside: '확인. 아웃사이드 라인 잡는다.',
      now: '간다.',
      tooSoon: '너무 일러. 아직 준비 중이야.',
      tooLate: '놓쳤어. 지시가 늦었어.',
      noRoom: '공간 없어. 상대가 막고 있어.',
      noCall: '지시 없음. P3 유지.',
      gotHim: '잡았다. 좋은 지시였어.',
      targetAchieved: 'P2다. 잘했어.',
      targetMissed: 'P3. 잡을 수 있었는데.',
    },
    corners: {
      orbit: '오비트 헤어핀',
      compression: '컴프레션',
      northHairpin: '노스 헤어핀',
      switchback: '스위치백',
      finalChicane: '파이널 시케인',
    },
  },
} as const satisfies Record<Language, RaceUiText>;

export function getRaceText(language: Language): RaceUiText {
  return RACE_UI_TEXT[language];
}
