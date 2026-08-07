export type Language = 'en' | 'ko';

export type PaceMode = 'safe' | 'normal' | 'push';

export interface UiText {
  speed: string;
  pace: Record<PaceMode, string>;
}

export const UI_TEXT = {
  en: {
    speed: 'Speed',
    pace: {
      safe: 'SAFE',
      normal: 'NORMAL',
      push: 'PUSH',
    },
  },
  ko: {
    speed: '속도',
    pace: {
      safe: '안전',
      normal: '보통',
      push: '전력',
    },
  },
} as const satisfies Record<Language, UiText>;

export const LANGUAGE_LABELS: Readonly<Record<Language, string>> = {
  en: 'EN',
  ko: '한국어',
};

export function getUiText(language: Language): UiText {
  return UI_TEXT[language];
}
