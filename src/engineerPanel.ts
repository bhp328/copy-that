import type { CornerDirection } from './cornerGameplay';
import {
  getUiText,
  LANGUAGE_LABELS,
  type Language,
} from './localization';
import type { DefenseSide } from './overtakeScenario';

export interface EngineerPanelOptions {
  parent: HTMLElement;
  driverFeedLabel: HTMLElement;
  driverFeedStatus: HTMLElement;
  initialLanguage?: Language;
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

  private language: Language;
  private cornerDirection: CornerDirection = 'right';
  private distanceMetres = 0;
  private defenseSide: DefenseSide = 'inside';
  private gapSeconds = 0;

  constructor(options: EngineerPanelOptions) {
    this.language = options.initialLanguage ?? 'en';
    this.driverFeedLabel = options.driverFeedLabel;
    this.driverFeedStatus = options.driverFeedStatus;

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
    this.element.append(header, information);
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

    this.languageButtons.forEach((button, language) => {
      const selected = language === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });

    this.renderNextCorner();
    this.renderDefense();
    this.renderGap();
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
