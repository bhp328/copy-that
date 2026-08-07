import type {
  CornerDirection,
  CornerResult,
  TimingState,
} from './cornerGameplay';
import type { IntentPlan } from './intentCall';
import type { DefenseSide } from './overtakeScenario';

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
  gap: string;
  intentCall: string;
  plan: string;
  intent: Record<IntentPlan, string>;
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
    gap: 'GAP',
    intentCall: 'INTENT CALL',
    plan: 'PLAN',
    intent: {
      inside: 'INSIDE',
      outside: 'OUTSIDE',
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
    gap: '갭',
    intentCall: '전술 지시',
    plan: '플랜',
    intent: {
      inside: '인사이드',
      outside: '아웃사이드',
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
