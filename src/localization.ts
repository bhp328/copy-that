import type {
  CornerDirection,
  CornerResult,
  TimingState,
} from './cornerGameplay';
import type { IntentPlan } from './intentCall';
import type { GapRelation } from './overtakeGameplay';
import type { DefenseSide } from './overtakeScenario';
import type { DriverCommand } from './commandParser';

export type Language = 'en' | 'ko';

export type PaceMode = 'safe' | 'normal' | 'push';

export interface UiText {
  language: string;
  speed: string;
  paceLabel: string;
  pace: Record<PaceMode, string>;
  nextCorner: string;
  direction: Record<CornerDirection, string>;
  driverFeed: string;
  live: string;
  engineer: string;
  opponent: string;
  defending: Record<DefenseSide, string>;
  tacticalMap: string;
  playerCar: string;
  gap: string;
  gapRelation: Record<GapRelation, string>;
  intentCall: string;
  plan: string;
  intent: Record<IntentPlan, string>;
  now: string;
  retry: string;
  briefingTitle: string;
  briefing: string;
  radio: string;
  radioDriver: string;
  radioHint: string;
  radioPlaceholder: string;
  transmit: string;
  radioStatus: {
    idle: string;
    unrecognized: string;
    unavailable: string;
    sent: Record<DriverCommand, string>;
  };
  driverMessage: {
    copyInside: string;
    copyOutside: string;
    now: string;
    tooSoon: string;
    tooLate: string;
    noRoom: string;
    noCall: string;
    gotHim: string;
  };
  commandLabel: string;
  command: {
    lateBrake: string;
  };
  feedbackHeading: string;
  feedback: {
    lastCall: string;
    ttcWhenReceived: string;
    timing: string;
    result: string;
  };
  timing: Record<TimingState, string>;
  result: Record<CornerResult, string>;
  reaction: Record<TimingState, string>;
  units: {
    metres: string;
    seconds: string;
  };
  emptyValue: string;
}

export const UI_TEXT = {
  en: {
    language: 'Language',
    speed: 'Speed',
    paceLabel: 'Pace',
    pace: {
      safe: 'SAFE',
      normal: 'NORMAL',
      push: 'PUSH',
    },
    nextCorner: 'NEXT',
    direction: {
      left: 'LEFT',
      right: 'RIGHT',
    },
    driverFeed: 'DRIVER FEED',
    live: 'LIVE',
    engineer: 'ENGINEER',
    opponent: 'OPPONENT',
    defending: {
      inside: 'DEFENDING INSIDE',
      outside: 'DEFENDING OUTSIDE',
    },
    tacticalMap: 'TACTICAL',
    playerCar: 'YOU',
    gap: 'GAP',
    gapRelation: {
      behind: 'BEHIND',
      sideBySide: 'SIDE BY SIDE',
      ahead: 'AHEAD',
    },
    intentCall: 'INTENT CALL',
    plan: 'PLAN',
    intent: {
      inside: 'INSIDE',
      outside: 'OUTSIDE',
    },
    now: 'NOW',
    retry: 'RETRY EVENT',
    briefingTitle: 'ENGINEER BRIEF',
    briefing: 'Read the defense. Call a line. Then call NOW.',
    radio: 'DRIVER RADIO',
    radioDriver: 'DRIVER',
    radioHint: 'Type one clear call. Buttons stay live as your fallback.',
    radioPlaceholder: 'e.g. OUTSIDE / NOW',
    transmit: 'TRANSMIT',
    radioStatus: {
      idle: 'CHANNEL OPEN',
      unrecognized: 'USE INSIDE, OUTSIDE, OR NOW',
      unavailable: 'DRIVER CANNOT TAKE THAT CALL YET',
      sent: {
        inside: 'TRANSMITTED: INSIDE',
        outside: 'TRANSMITTED: OUTSIDE',
        now: 'TRANSMITTED: NOW',
        push: 'TRANSMITTED: PUSH',
        hold: 'TRANSMITTED: HOLD',
      },
    },
    driverMessage: {
      copyInside: 'Copy. Inside line set.',
      copyOutside: 'Copy. Outside line set.',
      now: 'On it.',
      tooSoon: 'Too soon. Still setting up.',
      tooLate: "Window's gone. Resetting.",
      noRoom: 'No room there. Hold.',
      noCall: 'No call. Resetting for another run.',
      gotHim: "Clear. We've got him.",
    },
    commandLabel: 'Engineer command',
    command: {
      lateBrake: 'LATE BRAKE',
    },
    feedbackHeading: 'CALL FEEDBACK',
    feedback: {
      lastCall: 'LAST CALL',
      ttcWhenReceived: 'TTC WHEN RECEIVED',
      timing: 'TIMING',
      result: 'RESULT',
    },
    timing: {
      prepared: 'PREPARED',
      rushed: 'RUSHED',
      emergency: 'EMERGENCY',
    },
    result: {
      aggressiveEntry: 'AGGRESSIVE ENTRY',
      hardRecovery: 'HARD RECOVERY',
      overshootRecovery: 'OVERSHOOT RECOVERY',
    },
    reaction: {
      prepared: 'Copy.',
      rushed: 'Copy!',
      emergency: 'NOW?!',
    },
    units: {
      metres: 'm',
      seconds: 's',
    },
    emptyValue: '—',
  },
  ko: {
    language: '언어',
    speed: '속도',
    paceLabel: '주행 모드',
    pace: {
      safe: '안전',
      normal: '보통',
      push: '전력',
    },
    nextCorner: '다음 코너',
    direction: {
      left: '왼쪽',
      right: '오른쪽',
    },
    driverFeed: '드라이버 피드',
    live: '라이브',
    engineer: '레이스 엔지니어',
    opponent: '상대 차량',
    defending: {
      inside: '인사이드 방어 중',
      outside: '아웃사이드 방어 중',
    },
    tacticalMap: '전술 맵',
    playerCar: '내 차량',
    gap: '갭',
    gapRelation: {
      behind: '뒤처짐',
      sideBySide: '나란히',
      ahead: '앞섬',
    },
    intentCall: '전술 지시',
    plan: '플랜',
    intent: {
      inside: '인사이드',
      outside: '아웃사이드',
    },
    now: '지금',
    retry: '이벤트 다시 시도',
    briefingTitle: '엔지니어 브리핑',
    briefing: '방어를 읽고 라인을 지시하세요. 준비가 끝나면 지금을 외치세요.',
    radio: '드라이버 무전',
    radioDriver: '드라이버',
    radioHint: '명확한 한 가지 지시만 입력하세요. 버튼도 언제나 사용할 수 있습니다.',
    radioPlaceholder: '예: 아웃사이드 / 지금',
    transmit: '전송',
    radioStatus: {
      idle: '채널 열림',
      unrecognized: '인사이드, 아웃사이드 또는 지금을 사용하세요',
      unavailable: '지금은 드라이버가 그 지시를 받을 수 없습니다',
      sent: {
        inside: '전송됨: 인사이드',
        outside: '전송됨: 아웃사이드',
        now: '전송됨: 지금',
        push: '전송됨: 푸시',
        hold: '전송됨: 유지',
      },
    },
    driverMessage: {
      copyInside: '확인. 인사이드 라인 잡는다.',
      copyOutside: '확인. 아웃사이드 라인 잡는다.',
      now: '간다.',
      tooSoon: '너무 일러. 아직 준비 중이야.',
      tooLate: '창이 닫혔어. 다시 정비한다.',
      noRoom: '그쪽은 공간이 없어. 유지한다.',
      noCall: '지시 없음. 다음 기회로 리셋한다.',
      gotHim: '클리어. 잡았어.',
    },
    commandLabel: '엔지니어 지시',
    command: {
      lateBrake: '늦게 제동',
    },
    feedbackHeading: '지시 피드백',
    feedback: {
      lastCall: '마지막 지시',
      ttcWhenReceived: '수신 시 TTC',
      timing: '타이밍',
      result: '결과',
    },
    timing: {
      prepared: '준비됨',
      rushed: '촉박',
      emergency: '긴급',
    },
    result: {
      aggressiveEntry: '공격적 진입',
      hardRecovery: '급제동 후 복귀',
      overshootRecovery: '오버슈트 후 복귀',
    },
    reaction: {
      prepared: '확인.',
      rushed: '확인!',
      emergency: '지금?!',
    },
    units: {
      metres: 'm',
      seconds: '초',
    },
    emptyValue: '—',
  },
} as const satisfies Record<Language, UiText>;

export const LANGUAGE_LABELS: Readonly<Record<Language, string>> = {
  en: 'EN',
  ko: '한국어',
};

export function getUiText(language: Language): UiText {
  return UI_TEXT[language];
}
