import type {
  CornerDirection,
  LateBrakeFeedback,
  TimingState,
} from './cornerGameplay';
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
  onLateBrake?: () => void;
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
  private readonly languageToggle: HTMLDivElement;
  private readonly paceControls: HTMLDivElement;
  private readonly cornerPanel: HTMLElement;
  private readonly nextCornerLabel: HTMLSpanElement;
  private readonly cornerDirectionValue: HTMLSpanElement;
  private readonly cornerDistanceValue: HTMLOutputElement;
  private readonly cornerDistanceUnit: HTMLSpanElement;
  private readonly commandPanel: HTMLElement;
  private readonly lateBrakeButton: HTMLButtonElement;
  private readonly feedbackPanel: HTMLElement;
  private readonly feedbackHeading: HTMLHeadingElement;
  private readonly lastCallLabel: HTMLElement;
  private readonly lastCallValue: HTMLElement;
  private readonly ttcLabel: HTMLElement;
  private readonly ttcValue: HTMLElement;
  private readonly timingLabel: HTMLElement;
  private readonly timingValue: HTMLElement;
  private readonly resultLabel: HTMLElement;
  private readonly resultValue: HTMLElement;
  private readonly driverReaction: HTMLOutputElement;
  private readonly paceButtons = new Map<PaceMode, HTMLButtonElement>();
  private readonly languageButtons = new Map<Language, HTMLButtonElement>();
  private readonly onPaceChange?: (pace: PaceMode) => void;
  private readonly onLanguageChange?: (language: Language) => void;
  private readonly onLateBrake?: () => void;

  private selectedPace: PaceMode;
  private language: Language;
  private nextCornerDirection: CornerDirection = 'right';
  private nextCornerDistanceMetres = 0;
  private lastCall: LateBrakeFeedback | null = null;
  private driverReactionTiming: TimingState | null = null;

  constructor(options: HudOptions = {}) {
    this.selectedPace = options.initialPace ?? 'normal';
    this.language = options.initialLanguage ?? 'en';
    this.onPaceChange = options.onPaceChange;
    this.onLanguageChange = options.onLanguageChange;
    this.onLateBrake = options.onLateBrake;

    this.root = createElement('div', 'game-hud');

    const speedPanel = createElement('div', 'hud-speed');
    this.speedLabel = createElement('span', 'hud-speed__label');
    const speedReading = createElement('div', 'hud-speed__reading');
    this.speedValue = createElement('output', 'hud-speed__value', '0');
    const speedUnit = createElement('span', 'hud-speed__unit', 'km/h');
    speedReading.append(this.speedValue, speedUnit);
    speedPanel.append(this.speedLabel, speedReading);

    this.languageToggle = createElement('div', 'hud-language');
    this.languageToggle.setAttribute('role', 'group');
    LANGUAGES.forEach((language, index) => {
      if (index > 0) {
        const divider = createElement('span', 'hud-language__divider', '|');
        divider.setAttribute('aria-hidden', 'true');
        this.languageToggle.append(divider);
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
      this.languageToggle.append(button);
    });

    this.cornerPanel = createElement('section', 'hud-corner');
    this.nextCornerLabel = createElement('span', 'hud-corner__label');
    const cornerReading = createElement('div', 'hud-corner__reading');
    this.cornerDirectionValue = createElement('span', 'hud-corner__direction');
    const cornerDivider = createElement('span', 'hud-corner__divider', '—');
    cornerDivider.setAttribute('aria-hidden', 'true');
    this.cornerDistanceValue = createElement(
      'output',
      'hud-corner__distance',
      '0',
    );
    this.cornerDistanceUnit = createElement('span', 'hud-corner__unit');
    cornerReading.append(
      this.cornerDirectionValue,
      cornerDivider,
      this.cornerDistanceValue,
      this.cornerDistanceUnit,
    );
    this.cornerPanel.append(this.nextCornerLabel, cornerReading);

    this.driverReaction = createElement('output', 'hud-driver-reaction');
    this.driverReaction.setAttribute('role', 'status');
    this.driverReaction.setAttribute('aria-live', 'assertive');
    this.driverReaction.setAttribute('aria-atomic', 'true');
    this.driverReaction.hidden = true;

    this.feedbackPanel = createElement('section', 'hud-feedback');
    this.feedbackHeading = createElement('h2', 'hud-feedback__heading');
    const feedbackList = createElement('dl', 'hud-feedback__list');

    const lastCallRow = createElement('div', 'hud-feedback__row');
    this.lastCallLabel = createElement('dt', 'hud-feedback__label');
    this.lastCallValue = createElement('dd', 'hud-feedback__value');
    lastCallRow.append(this.lastCallLabel, this.lastCallValue);

    const ttcRow = createElement('div', 'hud-feedback__row');
    this.ttcLabel = createElement('dt', 'hud-feedback__label');
    this.ttcValue = createElement('dd', 'hud-feedback__value');
    ttcRow.append(this.ttcLabel, this.ttcValue);

    const timingRow = createElement('div', 'hud-feedback__row');
    this.timingLabel = createElement('dt', 'hud-feedback__label');
    this.timingValue = createElement('dd', 'hud-feedback__value');
    timingRow.append(this.timingLabel, this.timingValue);

    const resultRow = createElement('div', 'hud-feedback__row');
    this.resultLabel = createElement('dt', 'hud-feedback__label');
    this.resultValue = createElement('dd', 'hud-feedback__value');
    resultRow.append(this.resultLabel, this.resultValue);

    feedbackList.append(lastCallRow, ttcRow, timingRow, resultRow);
    this.feedbackPanel.append(this.feedbackHeading, feedbackList);

    this.commandPanel = createElement('section', 'hud-command');
    this.commandPanel.setAttribute('role', 'group');
    this.lateBrakeButton = createElement('button', 'hud-command__button');
    this.lateBrakeButton.type = 'button';
    this.lateBrakeButton.dataset.command = 'lateBrake';
    this.lateBrakeButton.disabled = true;
    this.lateBrakeButton.setAttribute('aria-disabled', 'true');
    this.lateBrakeButton.addEventListener('click', () => {
      if (!this.lateBrakeButton.disabled) {
        this.onLateBrake?.();
      }
    });
    this.commandPanel.append(this.lateBrakeButton);

    this.paceControls = createElement('div', 'hud-pace');
    this.paceControls.setAttribute('role', 'group');
    PACE_MODES.forEach((pace) => {
      const button = createElement('button', 'hud-pace__button');
      button.type = 'button';
      button.dataset.pace = pace;
      button.addEventListener('click', () => this.setPace(pace, true));
      this.paceButtons.set(pace, button);
      this.paceControls.append(button);
    });

    this.root.append(
      speedPanel,
      this.languageToggle,
      this.cornerPanel,
      this.driverReaction,
      this.feedbackPanel,
      this.commandPanel,
      this.paceControls,
    );
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

  setNextCorner(
    direction: CornerDirection,
    distanceMetres: number,
  ): void {
    this.nextCornerDirection = direction;
    this.nextCornerDistanceMetres = Number.isFinite(distanceMetres)
      ? Math.max(0, distanceMetres)
      : 0;
    this.renderNextCorner();
  }

  setLateBrakeAvailable(available: boolean): void {
    this.lateBrakeButton.disabled = !available;
    this.lateBrakeButton.setAttribute('aria-disabled', (!available).toString());
  }

  setLastCall(feedback: LateBrakeFeedback | null): void {
    this.lastCall = feedback;
    this.renderLastCall();
  }

  setDriverReaction(timing: TimingState | null): void {
    this.driverReactionTiming = timing;
    this.renderDriverReaction();
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
    this.languageToggle.setAttribute('aria-label', text.language);
    this.paceControls.setAttribute('aria-label', text.paceLabel);
    this.commandPanel.setAttribute('aria-label', text.commandLabel);
    this.lateBrakeButton.textContent = text.command.lateBrake;
    this.feedbackPanel.setAttribute('aria-label', text.feedbackHeading);
    this.feedbackHeading.textContent = text.feedbackHeading;
    this.lastCallLabel.textContent = text.feedback.lastCall;
    this.ttcLabel.textContent = text.feedback.ttcWhenReceived;
    this.timingLabel.textContent = text.feedback.timing;
    this.resultLabel.textContent = text.feedback.result;

    this.paceButtons.forEach((button, pace) => {
      button.textContent = text.pace[pace];
    });

    this.languageButtons.forEach((button, language) => {
      const selected = language === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });

    this.renderNextCorner();
    this.renderLastCall();
    this.renderDriverReaction();
  }

  private renderSelectedPace(): void {
    this.paceButtons.forEach((button, pace) => {
      const selected = pace === this.selectedPace;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });
  }

  private renderNextCorner(): void {
    const text = getUiText(this.language);
    const distanceMetres = Math.round(this.nextCornerDistanceMetres);
    const direction = text.direction[this.nextCornerDirection];

    this.nextCornerLabel.textContent = text.nextCorner;
    this.cornerDirectionValue.textContent = direction;
    this.cornerDistanceValue.value = distanceMetres.toString();
    this.cornerDistanceValue.textContent = distanceMetres.toString();
    this.cornerDistanceUnit.textContent = text.units.metres;
    this.cornerPanel.setAttribute(
      'aria-label',
      `${text.nextCorner}: ${direction}, ${distanceMetres} ${text.units.metres}`,
    );
  }

  private renderLastCall(): void {
    const text = getUiText(this.language);

    if (!this.lastCall) {
      this.lastCallValue.textContent = text.emptyValue;
      this.ttcValue.textContent = text.emptyValue;
      this.timingValue.textContent = text.emptyValue;
      this.resultValue.textContent = text.emptyValue;
      this.feedbackPanel.removeAttribute('data-timing');
      this.feedbackPanel.removeAttribute('data-result');
      return;
    }

    const ttcSeconds = this.lastCall.ttcSeconds;
    const ttcReading =
      ttcSeconds === Number.POSITIVE_INFINITY
        ? `∞ ${text.units.seconds}`
        : `${Number.isFinite(ttcSeconds) ? Math.max(0, ttcSeconds).toFixed(2) : '0.00'} ${text.units.seconds}`;

    this.lastCallValue.textContent = text.command[this.lastCall.command];
    this.ttcValue.textContent = ttcReading;
    this.timingValue.textContent = text.timing[this.lastCall.timing];
    this.resultValue.textContent = text.result[this.lastCall.result];
    this.feedbackPanel.dataset.timing = this.lastCall.timing;
    this.feedbackPanel.dataset.result = this.lastCall.result;
  }

  private renderDriverReaction(): void {
    const timing = this.driverReactionTiming;

    if (!timing) {
      this.driverReaction.hidden = true;
      this.driverReaction.textContent = '';
      delete this.driverReaction.dataset.timing;
      return;
    }

    this.driverReaction.textContent = getUiText(this.language).reaction[timing];
    this.driverReaction.dataset.timing = timing;
    this.driverReaction.hidden = false;
  }
}
