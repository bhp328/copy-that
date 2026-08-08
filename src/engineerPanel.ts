import type { CornerDirection } from './cornerGameplay';
import {
  getUiText,
  LANGUAGE_LABELS,
  type Language,
} from './localization';
import type { IntentPlan } from './intentCall';
import type {
  DriverMessageKey,
  GapRelation,
} from './overtakeGameplay';

export interface EngineerPanelOptions {
  parent: HTMLElement;
  driverFeedLabel: HTMLElement;
  driverFeedStatus: HTMLElement;
  initialLanguage?: Language;
  onIntentCall?: (plan: IntentPlan) => void;
  onNowCall?: () => void;
  onRetry?: () => void;
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
  private readonly tacticalLabel: HTMLElement;
  private readonly tacticalMap: SVGSVGElement;
  private readonly tacticalRoadPath: SVGPathElement;
  private readonly playerMarker: SVGGElement;
  private readonly opponentMarker: SVGGElement;
  private readonly playerLegend: HTMLElement;
  private readonly opponentLegend: HTMLElement;
  private readonly gapLabel: HTMLElement;
  private readonly gapCard: HTMLElement;
  private readonly gapValue: HTMLOutputElement;
  private readonly gapUnit: HTMLElement;
  private readonly acknowledgement: HTMLOutputElement;
  private readonly intentSection: HTMLElement;
  private readonly intentHeading: HTMLElement;
  private readonly planLabel: HTMLElement;
  private readonly planValue: HTMLOutputElement;
  private readonly intentButtons = new Map<IntentPlan, HTMLButtonElement>();
  private readonly nowButton: HTMLButtonElement;
  private readonly retryButton: HTMLButtonElement;
  private readonly onIntentCall?: (plan: IntentPlan) => void;
  private readonly onNowCall?: () => void;
  private readonly onRetry?: () => void;

  private language: Language;
  private cornerDirection: CornerDirection = 'right';
  private distanceMetres = 0;
  private relativeGapSeconds = 0;
  private gapRelation: GapRelation = 'behind';
  private opponentLateralOffsetMetres = 0;
  private playerLateralOffsetMetres = 0;
  private corridorWidthMetres = 8.5;
  private playerDistanceMetres = 0;
  private opponentDistanceMetres = 22;
  private eventDistanceMetres = 145;
  private intentAvailable = false;
  private committedPlan: IntentPlan | null = null;
  private acknowledgementText: string | null = null;
  private driverMessage: DriverMessageKey | null = null;
  private nowAvailable = false;
  private nowCalled = false;
  private retryAvailable = false;

  constructor(options: EngineerPanelOptions) {
    this.language = options.initialLanguage ?? 'en';
    this.driverFeedLabel = options.driverFeedLabel;
    this.driverFeedStatus = options.driverFeedStatus;
    this.onIntentCall = options.onIntentCall;
    this.onNowCall = options.onNowCall;
    this.onRetry = options.onRetry;

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

    const tacticalCard = createElement(
      'section',
      'engineer-card engineer-card--tactical',
    );
    this.tacticalLabel = createElement('span', 'engineer-card__label');
    this.tacticalMap = createSvgElement('svg', 'tactical-map');
    this.tacticalMap.setAttribute('viewBox', '0 0 240 150');
    this.tacticalMap.setAttribute('role', 'img');

    const outerRoad = createSvgElement('path', 'tactical-map__road-edge');
    outerRoad.setAttribute(
      'd',
      'M 108 154 L 108 100 C 108 56 148 32 190 32 L 246 32',
    );
    const road = createSvgElement('path', 'tactical-map__road');
    road.setAttribute('d', outerRoad.getAttribute('d') ?? '');
    this.tacticalRoadPath = road;
    const centreReference = createSvgElement(
      'path',
      'tactical-map__centre-reference',
    );
    centreReference.setAttribute('d', outerRoad.getAttribute('d') ?? '');

    this.playerMarker = createCarMarker('tactical-map__car--player');
    this.opponentMarker = createCarMarker('tactical-map__car--opponent');
    this.tacticalMap.append(
      outerRoad,
      road,
      centreReference,
      this.opponentMarker,
      this.playerMarker,
    );

    const tacticalLegend = createElement('div', 'tactical-map__legend');
    const playerLegendItem = createElement(
      'span',
      'tactical-map__legend-item tactical-map__legend-item--player',
    );
    this.playerLegend = createElement('span', 'tactical-map__legend-text');
    const opponentLegendItem = createElement(
      'span',
      'tactical-map__legend-item tactical-map__legend-item--opponent',
    );
    this.opponentLegend = createElement('span', 'tactical-map__legend-text');
    playerLegendItem.append(this.playerLegend);
    opponentLegendItem.append(this.opponentLegend);
    tacticalLegend.append(playerLegendItem, opponentLegendItem);
    tacticalCard.append(this.tacticalLabel, this.tacticalMap, tacticalLegend);

    this.gapCard = createElement(
      'section',
      'engineer-card engineer-card--gap',
    );
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
    this.gapCard.append(this.gapLabel, gapReading);

    information.append(nextCard, tacticalCard, this.gapCard);

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
    const commandControls = createElement('div', 'engineer-command');
    this.nowButton = createElement(
      'button',
      'engineer-command__button engineer-command__button--now',
    );
    this.nowButton.type = 'button';
    this.nowButton.disabled = true;
    this.nowButton.addEventListener('click', () => {
      if (!this.nowButton.disabled) {
        this.onNowCall?.();
      }
    });
    this.retryButton = createElement(
      'button',
      'engineer-command__button engineer-command__button--retry',
    );
    this.retryButton.type = 'button';
    this.retryButton.hidden = true;
    this.retryButton.addEventListener('click', () => this.onRetry?.());
    commandControls.append(this.nowButton, this.retryButton);
    this.intentSection.append(intentHeader, intentControls, commandControls);

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

  setTacticalPositions(
    opponentLateralOffsetMetres: number,
    playerLateralOffsetMetres: number,
    corridorWidthMetres: number,
    playerDistanceMetres = 0,
    opponentDistanceMetres = 22,
    eventDistanceMetres = 145,
  ): void {
    this.opponentLateralOffsetMetres = finiteOrZero(
      opponentLateralOffsetMetres,
    );
    this.playerLateralOffsetMetres = finiteOrZero(playerLateralOffsetMetres);
    this.corridorWidthMetres = Number.isFinite(corridorWidthMetres)
      ? Math.max(1, corridorWidthMetres)
      : 8.5;
    this.playerDistanceMetres = finiteOrZero(playerDistanceMetres);
    this.opponentDistanceMetres = finiteOrZero(opponentDistanceMetres);
    this.eventDistanceMetres = Number.isFinite(eventDistanceMetres)
      ? Math.max(1, eventDistanceMetres)
      : 145;
    this.renderTacticalPositions();
  }

  setRaceGap(
    relativeGapSeconds: number,
    relation: GapRelation,
  ): void {
    this.relativeGapSeconds = Number.isFinite(relativeGapSeconds)
      ? relativeGapSeconds
      : 0;
    this.gapRelation = relation;
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

  setGameplayState(
    nowAvailable: boolean,
    nowCalled: boolean,
    retryAvailable: boolean,
    driverMessage: DriverMessageKey | null,
  ): void {
    this.nowAvailable = nowAvailable;
    this.nowCalled = nowCalled;
    this.retryAvailable = retryAvailable;
    this.driverMessage = driverMessage;
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
    this.tacticalLabel.textContent = text.tacticalMap;
    this.playerLegend.textContent = text.playerCar;
    this.opponentLegend.textContent = text.opponent;
    this.tacticalMap.setAttribute('aria-label', text.tacticalMap);
    this.intentHeading.textContent = text.intentCall;
    this.planLabel.textContent = text.plan;

    this.languageButtons.forEach((button, language) => {
      const selected = language === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });

    this.renderNextCorner();
    this.renderTacticalPositions();
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

  private renderTacticalPositions(): void {
    const corridorHalfWidth = Math.max(1, this.corridorWidthMetres * 0.5);
    const pixelsPerMetre = 34 / corridorHalfWidth;
    const averageDistance =
      (this.playerDistanceMetres + this.opponentDistanceMetres) * 0.5;
    const centre = this.getTacticalPathFrame(averageDistance);
    const gapMetres =
      this.opponentDistanceMetres - this.playerDistanceMetres;
    const gapPixels = clamp(gapMetres * 1.75, -32, 32);
    const playerAlong = -gapPixels * 0.5;
    const opponentAlong = gapPixels * 0.5;
    const playerMapX =
      centre.x + centre.tangentX * playerAlong +
      centre.normalX * this.playerLateralOffsetMetres * pixelsPerMetre;
    const playerMapY =
      centre.y + centre.tangentY * playerAlong +
      centre.normalY * this.playerLateralOffsetMetres * pixelsPerMetre;
    const opponentMapX =
      centre.x + centre.tangentX * opponentAlong +
      centre.normalX * this.opponentLateralOffsetMetres * pixelsPerMetre;
    const opponentMapY =
      centre.y + centre.tangentY * opponentAlong +
      centre.normalY * this.opponentLateralOffsetMetres * pixelsPerMetre;
    this.playerMarker.setAttribute(
      'transform',
      `translate(${playerMapX} ${playerMapY}) rotate(${centre.rotationDegrees})`,
    );
    this.opponentMarker.setAttribute(
      'transform',
      `translate(${opponentMapX} ${opponentMapY}) rotate(${centre.rotationDegrees})`,
    );
  }

  private getTacticalPathFrame(distanceMetres: number): {
    x: number;
    y: number;
    tangentX: number;
    tangentY: number;
    normalX: number;
    normalY: number;
    rotationDegrees: number;
  } {
    const pathLength = Math.max(1, this.tacticalRoadPath.getTotalLength());
    const inset = 24;
    const phase = clamp01(distanceMetres / this.eventDistanceMetres);
    const pathDistance = inset + phase * Math.max(1, pathLength - inset * 2);
    const before = this.tacticalRoadPath.getPointAtLength(
      Math.max(0, pathDistance - 1),
    );
    const after = this.tacticalRoadPath.getPointAtLength(
      Math.min(pathLength, pathDistance + 1),
    );
    const point = this.tacticalRoadPath.getPointAtLength(pathDistance);
    const length = Math.max(0.001, Math.hypot(after.x - before.x, after.y - before.y));
    const tangentX = (after.x - before.x) / length;
    const tangentY = (after.y - before.y) / length;
    return {
      x: point.x,
      y: point.y,
      tangentX,
      tangentY,
      // Screen-space left of the path direction; model-positive is physical left.
      normalX: tangentY,
      normalY: -tangentX,
      rotationDegrees: (Math.atan2(tangentY, tangentX) * 180) / Math.PI + 90,
    };
  }

  private renderGap(): void {
    const text = getUiText(this.language);
    const magnitude = Math.abs(this.relativeGapSeconds);
    const formattedGap =
      this.gapRelation === 'ahead'
        ? `+${magnitude.toFixed(1)}`
        : this.gapRelation === 'sideBySide'
          ? '0.0'
          : magnitude.toFixed(1);
    this.gapLabel.textContent = text.gapRelation[this.gapRelation];
    this.gapCard.dataset.relation = this.gapRelation;
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

    this.nowButton.textContent = text.now;
    this.nowButton.disabled = !this.nowAvailable;
    this.nowButton.classList.toggle('is-called', this.nowCalled);
    this.retryButton.textContent = text.retry;
    this.retryButton.hidden = !this.retryAvailable;

    const radioText = this.driverMessage
      ? text.driverMessage[this.driverMessage]
      : this.acknowledgementText;
    this.acknowledgement.hidden = radioText === null;
    this.acknowledgement.value = radioText ?? '';
    this.acknowledgement.textContent = radioText ?? '';
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

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  className: string,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
  element.setAttribute('class', className);
  return element;
}

function createCarMarker(className: string): SVGGElement {
  const marker = createSvgElement('g', `tactical-map__car ${className}`);
  const body = createSvgElement('rect', 'tactical-map__car-body');
  body.setAttribute('x', '-5');
  body.setAttribute('y', '-6');
  body.setAttribute('width', '10');
  body.setAttribute('height', '12');
  body.setAttribute('rx', '2');
  const heading = createSvgElement('path', 'tactical-map__car-heading');
  heading.setAttribute('d', 'M -3 -4 L 0 -8 L 3 -4');
  marker.append(body, heading);
  return marker;
}

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
