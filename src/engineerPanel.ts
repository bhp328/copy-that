import type { CornerDirection } from './cornerGameplay';
import {
  getUiText,
  LANGUAGE_LABELS,
  type Language,
} from './localization';
import type { IntentPlan } from './intentCall';
import type { DefenseSide } from './overtakeScenario';

export interface EngineerPanelOptions {
  parent: HTMLElement;
  driverFeedLabel: HTMLElement;
  driverFeedStatus: HTMLElement;
  initialLanguage?: Language;
  onIntentCall?: (plan: IntentPlan) => void;
}

const LANGUAGES: readonly Language[] = ['en', 'ko'];

export class EngineerPanel {
  readonly element: HTMLElement;

  private readonly driverFeedLabel: HTMLElement;
  private readonly driverFeedStatus: HTMLElement;
  private readonly heading: HTMLHeadingElement;
  private readonly languageToggle: HTMLDivElement;
  private readonly languageButtons = new Map<Language, HTMLButtonElement>();
  private readonly nextLabel: HTMLElement;
  private readonly nextDirection: HTMLOutputElement;
  private readonly nextDistance: HTMLOutputElement;
  private readonly nextUnit: HTMLElement;
  private readonly opponentLabel: HTMLElement;
  private readonly defenseValue: HTMLOutputElement;
  private readonly gapLabel: HTMLElement;
  private readonly gapValue: HTMLOutputElement;
  private readonly gapUnit: HTMLElement;
  private readonly acknowledgement: HTMLOutputElement;
  private readonly intentSection: HTMLElement;
  private readonly intentHeading: HTMLElement;
  private readonly planLabel: HTMLElement;
  private readonly planValue: HTMLOutputElement;
  private readonly intentButtons = new Map<IntentPlan, HTMLButtonElement>();
  private readonly onIntentCall?: (plan: IntentPlan) => void;

  private language: Language;
  private cornerDirection: CornerDirection = 'right';
  private distanceMetres = 0;
  private defenseSide: DefenseSide = 'inside';
  private gapSeconds = 0;
  private intentAvailable = false;
  private committedPlan: IntentPlan | null = null;
  private acknowledgementText: string | null = null;

  constructor(options: EngineerPanelOptions) {
    this.language = options.initialLanguage ?? 'en';
    this.driverFeedLabel = options.driverFeedLabel;
    this.driverFeedStatus = options.driverFeedStatus;
    this.onIntentCall = options.onIntentCall;

    this.element = createElement('aside', 'engineer-panel');
    this.element.setAttribute('aria-label', 'Engineer');

    const header = createElement('header', 'engineer-panel__header');
    const titleGroup = createElement('div', 'engineer-panel__title-group');
    const eyebrow = createElement('span', 'engineer-panel__eyebrow', 'COPY THAT?');
    this.heading = createElement('h1', 'engineer-panel__heading');
    titleGroup.append(eyebrow, this.heading);

    this.languageToggle = createElement('div', 'engineer-panel__language');
    this.languageToggle.setAttribute('role', 'group');
    LANGUAGES.forEach((language) => {
      const button = createElement(
        'button',
        'engineer-panel__language-button',
        LANGUAGE_LABELS[language],
      );
      button.type = 'button';
      button.addEventListener('click', () => this.setLanguage(language));
      this.languageButtons.set(language, button);
      this.languageToggle.append(button);
    });
    header.append(titleGroup, this.languageToggle);

    this.acknowledgement = createElement(
      'output',
      'engineer-panel__acknowledgement',
    );
    this.acknowledgement.setAttribute('role', 'status');
    this.acknowledgement.setAttribute('aria-live', 'assertive');
    this.acknowledgement.setAttribute('aria-atomic', 'true');
    this.acknowledgement.hidden = true;

    const information = createElement('div', 'engineer-panel__information');

    const nextCard = createElement('section', 'engineer-card engineer-card--next');
    this.nextLabel = createElement('span', 'engineer-card__label');
    const nextReading = createElement('div', 'engineer-card__reading');
    this.nextDirection = createElement('output', 'engineer-card__primary');
    const nextDistanceGroup = createElement('span', 'engineer-card__secondary');
    this.nextDistance = createElement('output', 'engineer-card__number', '0');
    this.nextUnit = createElement('span', 'engineer-card__unit');
    nextDistanceGroup.append(this.nextDistance, this.nextUnit);
    nextReading.append(this.nextDirection, nextDistanceGroup);
    nextCard.append(this.nextLabel, nextReading);

    const opponentCard = createElement(
      'section',
      'engineer-card engineer-card--opponent',
    );
    this.opponentLabel = createElement('span', 'engineer-card__label');
    this.defenseValue = createElement(
      'output',
      'engineer-card__primary engineer-card__primary--defense',
    );
    opponentCard.append(this.opponentLabel, this.defenseValue);

    const gapCard = createElement('section', 'engineer-card engineer-card--gap');
    this.gapLabel = createElement('span', 'engineer-card__label');
    const gapReading = createElement('div', 'engineer-card__gap-reading');
    const approximation = createElement(
      'span',
      'engineer-card__approximation',
      '≈',
    );
    this.gapValue = createElement('output', 'engineer-card__gap-value', '0.0');
    this.gapUnit = createElement('span', 'engineer-card__gap-unit');
    gapReading.append(approximation, this.gapValue, this.gapUnit);
    gapCard.append(this.gapLabel, gapReading);

    information.append(nextCard, opponentCard, gapCard);

    this.intentSection = createElement('section', 'engineer-intent');
    const intentHeader = createElement('div', 'engineer-intent__header');
    this.intentHeading = createElement('h2', 'engineer-intent__heading');
    const planReading = createElement('div', 'engineer-intent__plan');
    this.planLabel = createElement('span', 'engineer-intent__plan-label');
    this.planValue = createElement('output', 'engineer-intent__plan-value');
    planReading.append(this.planLabel, this.planValue);
    intentHeader.append(this.intentHeading, planReading);

    const intentControls = createElement('div', 'engineer-intent__controls');
    (['inside', 'outside'] as const).forEach((plan) => {
      const button = createElement('button', 'engineer-intent__button');
      button.type = 'button';
      button.dataset.intent = plan;
      button.disabled = true;
      button.addEventListener('click', () => {
        if (!button.disabled) {
          this.onIntentCall?.(plan);
        }
      });
      this.intentButtons.set(plan, button);
      intentControls.append(button);
    });
    this.intentSection.append(intentHeader, intentControls);

    this.element.append(
      header,
      this.acknowledgement,
      information,
      this.intentSection,
    );
    options.parent.append(this.element);
    this.renderLanguage();
  }

  setNextCorner(direction: CornerDirection, distanceMetres: number): void {
    this.cornerDirection = direction;
    this.distanceMetres = Number.isFinite(distanceMetres)
      ? Math.max(0, distanceMetres)
      : 0;
    this.renderNextCorner();
  }

  setDefenseSide(defenseSide: DefenseSide): void {
    this.defenseSide = defenseSide;
    this.renderDefense();
  }

  setGapSeconds(gapSeconds: number): void {
    this.gapSeconds = Number.isFinite(gapSeconds)
      ? Math.max(0, gapSeconds)
      : 0;
    this.renderGap();
  }

  setIntentState(
    available: boolean,
    committedPlan: IntentPlan | null,
    acknowledgement: string | null,
  ): void {
    this.intentAvailable = available;
    this.committedPlan = committedPlan;
    this.acknowledgementText = acknowledgement;
    this.renderIntentState();
  }

  setLanguage(language: Language): void {
    this.language = language;
    document.documentElement.lang = language;
    this.renderLanguage();
  }

  private renderLanguage(): void {
    const text = getUiText(this.language);
    this.driverFeedLabel.textContent = text.driverFeed;
    this.driverFeedStatus.textContent = text.live;
    this.heading.textContent = text.engineer;
    this.element.setAttribute('aria-label', text.engineer);
    this.languageToggle.setAttribute('aria-label', text.language);
    this.nextLabel.textContent = text.nextCorner;
    this.opponentLabel.textContent = text.opponent;
    this.gapLabel.textContent = text.gap;
    this.intentHeading.textContent = text.intentCall;
    this.planLabel.textContent = text.plan;

    this.languageButtons.forEach((button, language) => {
      const selected = language === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });

    this.renderNextCorner();
    this.renderDefense();
    this.renderGap();
    this.renderIntentState();
  }

  private renderNextCorner(): void {
    const text = getUiText(this.language);
    const distanceMetres = Math.round(this.distanceMetres);
    this.nextDirection.value = text.direction[this.cornerDirection];
    this.nextDirection.textContent = text.direction[this.cornerDirection];
    this.nextDistance.value = distanceMetres.toString();
    this.nextDistance.textContent = distanceMetres.toString();
    this.nextUnit.textContent = text.units.metres;
  }

  private renderDefense(): void {
    const defense = getUiText(this.language).defending[this.defenseSide];
    this.defenseValue.value = defense;
    this.defenseValue.textContent = defense;
    this.defenseValue.dataset.defense = this.defenseSide;
  }

  private renderGap(): void {
    const text = getUiText(this.language);
    const formattedGap = this.gapSeconds.toFixed(1);
    this.gapValue.value = formattedGap;
    this.gapValue.textContent = formattedGap;
    this.gapUnit.textContent = text.units.seconds;
  }

  private renderIntentState(): void {
    const text = getUiText(this.language);
    const controlsAvailable =
      this.intentAvailable && this.committedPlan === null;

    this.planValue.value = this.committedPlan
      ? text.intent[this.committedPlan]
      : text.emptyValue;
    this.planValue.textContent = this.planValue.value;
    this.intentSection.classList.toggle('is-available', controlsAvailable);

    if (this.committedPlan) {
      this.intentSection.dataset.plan = this.committedPlan;
    } else {
      this.intentSection.removeAttribute('data-plan');
    }

    this.intentButtons.forEach((button, plan) => {
      const selected = plan === this.committedPlan;
      button.textContent = text.intent[plan];
      button.disabled = !controlsAvailable;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });

    this.acknowledgement.hidden = this.acknowledgementText === null;
    this.acknowledgement.value = this.acknowledgementText ?? '';
    this.acknowledgement.textContent = this.acknowledgementText ?? '';
  }
}

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
