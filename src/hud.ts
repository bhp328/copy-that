import {
  getUiText,
  LANGUAGE_LABELS,
  type Language,
  type PaceMode,
} from './localization';

export type { Language, PaceMode } from './localization';

export interface HudOptions {
  parent?: HTMLElement;
  initialLanguage?: Language;
  initialPace?: PaceMode;
  onPaceChange?: (pace: PaceMode) => void;
  onLanguageChange?: (language: Language) => void;
}

const PACE_MODES: readonly PaceMode[] = ['safe', 'normal', 'push'];
const LANGUAGES: readonly Language[] = ['en', 'ko'];

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.className = className;

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

export class HUD {
  private readonly root: HTMLDivElement;
  private readonly speedLabel: HTMLSpanElement;
  private readonly speedValue: HTMLOutputElement;
  private readonly paceButtons = new Map<PaceMode, HTMLButtonElement>();
  private readonly languageButtons = new Map<Language, HTMLButtonElement>();
  private readonly onPaceChange?: (pace: PaceMode) => void;
  private readonly onLanguageChange?: (language: Language) => void;

  private selectedPace: PaceMode;
  private language: Language;

  constructor(options: HudOptions = {}) {
    this.selectedPace = options.initialPace ?? 'normal';
    this.language = options.initialLanguage ?? 'en';
    this.onPaceChange = options.onPaceChange;
    this.onLanguageChange = options.onLanguageChange;

    this.root = createElement('div', 'game-hud');

    const speedPanel = createElement('div', 'hud-speed');
    this.speedLabel = createElement('span', 'hud-speed__label');
    const speedReading = createElement('div', 'hud-speed__reading');
    this.speedValue = createElement('output', 'hud-speed__value', '0');
    const speedUnit = createElement('span', 'hud-speed__unit', 'km/h');
    speedReading.append(this.speedValue, speedUnit);
    speedPanel.append(this.speedLabel, speedReading);

    const languageToggle = createElement('div', 'hud-language');
    LANGUAGES.forEach((language, index) => {
      if (index > 0) {
        languageToggle.append(createElement('span', 'hud-language__divider', '|'));
      }

      const button = createElement(
        'button',
        'hud-language__button',
        LANGUAGE_LABELS[language],
      );
      button.type = 'button';
      button.dataset.language = language;
      button.addEventListener('click', () => this.setLanguage(language, true));
      this.languageButtons.set(language, button);
      languageToggle.append(button);
    });

    const paceControls = createElement('div', 'hud-pace');
    PACE_MODES.forEach((pace) => {
      const button = createElement('button', 'hud-pace__button');
      button.type = 'button';
      button.dataset.pace = pace;
      button.addEventListener('click', () => this.setPace(pace, true));
      this.paceButtons.set(pace, button);
      paceControls.append(button);
    });

    this.root.append(speedPanel, languageToggle, paceControls);
    (options.parent ?? document.body).append(this.root);

    this.renderLanguage();
    this.renderSelectedPace();
  }

  get element(): HTMLDivElement {
    return this.root;
  }

  get pace(): PaceMode {
    return this.selectedPace;
  }

  get currentLanguage(): Language {
    return this.language;
  }

  setSpeed(speedKmh: number): void {
    const integerSpeed = Number.isFinite(speedKmh)
      ? Math.max(0, Math.round(speedKmh))
      : 0;
    this.speedValue.value = integerSpeed.toString();
    this.speedValue.textContent = integerSpeed.toString();
  }

  setPace(pace: PaceMode, notify = false): void {
    const changed = pace !== this.selectedPace;
    this.selectedPace = pace;
    this.renderSelectedPace();

    if (changed && notify) {
      this.onPaceChange?.(pace);
    }
  }

  setLanguage(language: Language, notify = false): void {
    const changed = language !== this.language;
    this.language = language;
    this.renderLanguage();

    if (changed && notify) {
      this.onLanguageChange?.(language);
    }
  }

  destroy(): void {
    this.root.remove();
  }

  private renderLanguage(): void {
    const text = getUiText(this.language);
    this.speedLabel.textContent = text.speed;

    this.paceButtons.forEach((button, pace) => {
      button.textContent = text.pace[pace];
    });

    this.languageButtons.forEach((button, language) => {
      const selected = language === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });
  }

  private renderSelectedPace(): void {
    this.paceButtons.forEach((button, pace) => {
      const selected = pace === this.selectedPace;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });
  }
}
