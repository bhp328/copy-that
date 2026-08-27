import { parseDriverCommand, type DriverCommand } from './commandParser';
import type { Language } from './localization';
import { getRaceText } from './raceText';
import type { SprintRaceSnapshot } from './raceSession';
import type { CircuitCorner, CircuitMapPoint } from './track';

export interface RaceEngineerUIOptions {
  parent: HTMLElement;
  canvas: HTMLCanvasElement;
  mapPoints: readonly CircuitMapPoint[];
  initialLanguage?: Language;
  onStart: () => void;
  onRetry: () => void;
  onCommand: (command: DriverCommand) => boolean;
  onAudioToggle: () => boolean;
}

export interface NextCornerReading {
  corner: CircuitCorner;
  distanceMetres: number;
}

type RadioInputState = 'idle' | 'sent' | 'unavailable' | 'unrecognized';

export class RaceEngineerUI {
  readonly element: HTMLDivElement;
  readonly feed: HTMLElement;

  private readonly mapPoints: readonly CircuitMapPoint[];
  private readonly onCommand: (command: DriverCommand) => boolean;
  private readonly onAudioToggle: () => boolean;
  private language: Language;
  private audioMuted = false;
  private radioInputState: RadioInputState = 'idle';
  private lastRadioSequence = -1;
  private latestSnapshot: SprintRaceSnapshot | null = null;

  private readonly teamLabel: HTMLElement;
  private readonly carLabel: HTMLElement;
  private readonly sessionLabel: HTMLElement;
  private readonly liveLabel: HTMLElement;
  private readonly startOverlay: HTMLElement;
  private readonly startTitle: HTMLElement;
  private readonly startRole: HTMLElement;
  private readonly startHook: HTMLElement;
  private readonly startButton: HTMLButtonElement;
  private readonly countdown: HTMLElement;
  private readonly cue: HTMLElement;
  private readonly cueText: HTMLElement;
  private readonly feedPositionLabel: HTMLElement;
  private readonly feedPosition: HTMLElement;
  private readonly feedLapLabel: HTMLElement;
  private readonly feedLap: HTMLElement;
  private readonly feedSectorLabel: HTMLElement;
  private readonly feedSector: HTMLElement;
  private readonly radioToast: HTMLElement;
  private readonly radioToastLine: HTMLElement;
  private readonly resultOverlay: HTMLElement;
  private readonly resultEyebrow: HTMLElement;
  private readonly resultHeadline: HTMLElement;
  private readonly resultDriverLine: HTMLElement;
  private readonly resultTimeLabel: HTMLElement;
  private readonly resultTime: HTMLElement;
  private readonly resultPaceLabel: HTMLElement;
  private readonly resultPace: HTMLElement;
  private readonly retryButton: HTMLButtonElement;
  private readonly missionLabel: HTMLElement;
  private readonly missionValue: HTMLElement;
  private readonly positionLabel: HTMLElement;
  private readonly positionValue: HTMLElement;
  private readonly lapLabel: HTMLElement;
  private readonly lapValue: HTMLElement;
  private readonly sectorLabel: HTMLElement;
  private readonly sectorValue: HTMLElement;
  private readonly tacticalLabel: HTMLElement;
  private readonly mapPlayer: SVGCircleElement;
  private readonly mapRival: SVGCircleElement;
  private readonly mapLeader: SVGCircleElement;
  private readonly mapPlayerLabel: HTMLElement;
  private readonly mapRivalLabel: HTMLElement;
  private readonly mapLeaderLabel: HTMLElement;
  private readonly nextLabel: HTMLElement;
  private readonly nextValue: HTMLElement;
  private readonly nextDistance: HTMLElement;
  private readonly gapLabel: HTMLElement;
  private readonly gapValue: HTMLElement;
  private readonly rivalFact: HTMLElement;
  private readonly radioHeading: HTMLElement;
  private readonly radioHint: HTMLElement;
  private readonly radioInput: HTMLInputElement;
  private readonly transmitButton: HTMLButtonElement;
  private readonly radioStatus: HTMLElement;
  private readonly engineerLog: HTMLElement;
  private readonly driverLog: HTMLElement;
  private readonly commandsHeading: HTMLElement;
  private readonly standby: HTMLElement;
  private readonly commandButtons = new Map<DriverCommand, HTMLButtonElement>();
  private readonly languageButtons = new Map<Language, HTMLButtonElement>();
  private readonly audioButton: HTMLButtonElement;

  constructor(options: RaceEngineerUIOptions) {
    this.language = options.initialLanguage ?? 'en';
    this.mapPoints = options.mapPoints;
    this.onCommand = options.onCommand;
    this.onAudioToggle = options.onAudioToggle;

    this.element = el('div', 'race-ops');
    this.feed = el('main', 'onboard-feed');
    this.feed.setAttribute('aria-label', 'Car 27 onboard live feed');
    options.canvas.className = 'onboard-feed__canvas';
    this.feed.append(options.canvas);

    const monitorFx = el('div', 'onboard-feed__monitor-fx');
    monitorFx.setAttribute('aria-hidden', 'true');
    this.feed.append(monitorFx);

    const feedIdentity = el('div', 'feed-identity');
    this.liveLabel = el('span', 'feed-identity__live');
    const liveDot = el('span', 'feed-identity__dot');
    liveDot.setAttribute('aria-hidden', 'true');
    this.carLabel = el('span', 'feed-identity__car');
    feedIdentity.append(this.liveLabel, liveDot, this.carLabel);
    this.feed.append(feedIdentity);

    const feedStatus = el('div', 'feed-status');
    const positionStatus = createFeedStatus();
    this.feedPositionLabel = positionStatus.label;
    this.feedPosition = positionStatus.value;
    const lapStatus = createFeedStatus();
    this.feedLapLabel = lapStatus.label;
    this.feedLap = lapStatus.value;
    const sectorStatus = createFeedStatus();
    this.feedSectorLabel = sectorStatus.label;
    this.feedSector = sectorStatus.value;
    feedStatus.append(positionStatus.element, lapStatus.element, sectorStatus.element);
    this.feed.append(feedStatus);

    this.cue = el('div', 'race-cue');
    const cueLine = el('span', 'race-cue__line');
    this.cueText = el('strong', 'race-cue__text');
    this.cue.append(cueLine, this.cueText);
    this.feed.append(this.cue);

    this.countdown = el('div', 'start-countdown');
    this.countdown.hidden = true;
    this.feed.append(this.countdown);

    this.radioToast = el('div', 'driver-radio-toast');
    const radioToastSource = el('span', 'driver-radio-toast__source', 'DRV // 27');
    this.radioToastLine = el('p', 'driver-radio-toast__line');
    this.radioToast.append(radioToastSource, this.radioToastLine);
    this.radioToast.hidden = true;
    this.feed.append(this.radioToast);

    this.startOverlay = el('section', 'start-overlay');
    const startBrand = el('div', 'start-overlay__brand');
    this.startTitle = el('h1', 'start-overlay__title');
    this.startRole = el('p', 'start-overlay__role');
    this.startHook = el('div', 'start-overlay__hook');
    this.startButton = el('button', 'start-overlay__button');
    this.startButton.type = 'button';
    this.startButton.addEventListener('click', options.onStart);
    startBrand.append(this.startTitle, this.startRole, this.startHook, this.startButton);
    this.startOverlay.append(startBrand);
    this.feed.append(this.startOverlay);

    this.resultOverlay = el('section', 'result-overlay');
    this.resultEyebrow = el('span', 'result-overlay__eyebrow');
    this.resultHeadline = el('h2', 'result-overlay__headline');
    this.resultDriverLine = el('p', 'result-overlay__driver');
    const resultStats = el('div', 'result-overlay__stats');
    const timeStat = el('div', 'result-stat');
    this.resultTimeLabel = el('span', 'result-stat__label');
    this.resultTime = el('strong', 'result-stat__value');
    timeStat.append(this.resultTimeLabel, this.resultTime);
    const paceStat = el('div', 'result-stat');
    this.resultPaceLabel = el('span', 'result-stat__label');
    this.resultPace = el('strong', 'result-stat__value');
    paceStat.append(this.resultPaceLabel, this.resultPace);
    resultStats.append(timeStat, paceStat);
    this.retryButton = el('button', 'result-overlay__retry');
    this.retryButton.type = 'button';
    this.retryButton.addEventListener('click', () => {
      this.clearRadioLog();
      options.onRetry();
    });
    this.resultOverlay.append(
      this.resultEyebrow,
      this.resultHeadline,
      this.resultDriverLine,
      resultStats,
      this.retryButton,
    );
    this.resultOverlay.hidden = true;
    this.feed.append(this.resultOverlay);

    const consolePanel = el('aside', 'engineer-console');
    const consoleHeader = el('header', 'console-header');
    const consoleIdentity = el('div', 'console-header__identity');
    this.teamLabel = el('span', 'console-header__team');
    this.sessionLabel = el('span', 'console-header__session');
    consoleIdentity.append(this.teamLabel, this.sessionLabel);
    const consoleTools = el('div', 'console-header__tools');
    const languageGroup = el('div', 'language-toggle');
    languageGroup.setAttribute('role', 'group');
    (['en', 'ko'] as const).forEach((language) => {
      const button = el('button', 'language-toggle__button', language === 'en' ? 'EN' : '한국어');
      button.type = 'button';
      button.addEventListener('click', () => this.setLanguage(language));
      this.languageButtons.set(language, button);
      languageGroup.append(button);
    });
    this.audioButton = el('button', 'console-tool');
    this.audioButton.type = 'button';
    this.audioButton.addEventListener('click', () => {
      this.audioMuted = this.onAudioToggle();
      this.renderLanguage();
    });
    consoleTools.append(languageGroup, this.audioButton);
    consoleHeader.append(consoleIdentity, consoleTools);
    consolePanel.append(consoleHeader);

    const mission = el('section', 'mission-strip');
    this.missionLabel = el('span', 'mission-strip__label');
    this.missionValue = el('strong', 'mission-strip__value');
    mission.append(this.missionLabel, this.missionValue);
    consolePanel.append(mission);

    const raceNumbers = el('section', 'race-numbers');
    const numberPosition = createConsoleNumber();
    this.positionLabel = numberPosition.label;
    this.positionValue = numberPosition.value;
    const numberLap = createConsoleNumber();
    this.lapLabel = numberLap.label;
    this.lapValue = numberLap.value;
    const numberSector = createConsoleNumber();
    this.sectorLabel = numberSector.label;
    this.sectorValue = numberSector.value;
    raceNumbers.append(numberPosition.element, numberLap.element, numberSector.element);
    consolePanel.append(raceNumbers);

    const tactical = el('section', 'tactical-surface');
    const tacticalHeader = el('div', 'surface-heading');
    this.tacticalLabel = el('h2', 'surface-heading__title');
    const tacticalPulse = el('span', 'surface-heading__pulse');
    tacticalHeader.append(this.tacticalLabel, tacticalPulse);
    const map = svg('svg', 'circuit-map');
    map.setAttribute('viewBox', '0 0 240 140');
    map.setAttribute('role', 'img');
    const mapShadow = svg('path', 'circuit-map__shadow');
    const mapRoad = svg('path', 'circuit-map__road');
    const mapD = toMapPath(this.mapPoints);
    mapShadow.setAttribute('d', mapD);
    mapRoad.setAttribute('d', mapD);
    this.mapLeader = marker('circuit-map__marker circuit-map__marker--leader', 2.4);
    this.mapRival = marker('circuit-map__marker circuit-map__marker--rival', 3.1);
    this.mapPlayer = marker('circuit-map__marker circuit-map__marker--player', 3.4);
    map.append(mapShadow, mapRoad, this.mapLeader, this.mapRival, this.mapPlayer);
    const mapLegend = el('div', 'map-legend');
    this.mapPlayerLabel = createLegend(mapLegend, 'player');
    this.mapRivalLabel = createLegend(mapLegend, 'rival');
    this.mapLeaderLabel = createLegend(mapLegend, 'leader');
    tactical.append(tacticalHeader, map, mapLegend);
    consolePanel.append(tactical);

    const facts = el('section', 'race-facts');
    const nextFact = el('div', 'race-fact');
    this.nextLabel = el('span', 'race-fact__label');
    this.nextValue = el('strong', 'race-fact__value');
    this.nextDistance = el('span', 'race-fact__sub');
    nextFact.append(this.nextLabel, this.nextValue, this.nextDistance);
    const gapFact = el('div', 'race-fact');
    this.gapLabel = el('span', 'race-fact__label');
    this.gapValue = el('strong', 'race-fact__value race-fact__value--gap');
    gapFact.append(this.gapLabel, this.gapValue);
    facts.append(nextFact, gapFact);
    this.rivalFact = el('div', 'rival-fact');
    facts.append(this.rivalFact);
    consolePanel.append(facts);

    const radio = el('section', 'radio-console');
    const radioHeader = el('div', 'surface-heading');
    this.radioHeading = el('h2', 'surface-heading__title');
    const radioSignal = el('span', 'radio-console__signal');
    radioHeader.append(this.radioHeading, radioSignal);
    this.radioHint = el('p', 'radio-console__hint');
    const radioLog = el('div', 'radio-log');
    this.engineerLog = el('p', 'radio-log__line radio-log__line--engineer');
    this.driverLog = el('p', 'radio-log__line radio-log__line--driver');
    radioLog.append(this.engineerLog, this.driverLog);
    const radioControls = el('div', 'radio-console__controls');
    this.radioInput = el('input', 'radio-console__input');
    this.radioInput.type = 'text';
    this.radioInput.autocomplete = 'off';
    this.radioInput.spellcheck = false;
    this.radioInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.transmitInput();
      }
    });
    this.transmitButton = el('button', 'radio-console__transmit');
    this.transmitButton.type = 'button';
    this.transmitButton.addEventListener('click', () => this.transmitInput());
    radioControls.append(this.radioInput, this.transmitButton);
    this.radioStatus = el('output', 'radio-console__status');
    this.radioStatus.setAttribute('aria-live', 'polite');
    radio.append(radioHeader, this.radioHint, radioLog, radioControls, this.radioStatus);
    consolePanel.append(radio);

    const commandDeck = el('section', 'command-deck');
    const commandHeader = el('div', 'surface-heading');
    this.commandsHeading = el('h2', 'surface-heading__title');
    this.standby = el('span', 'command-deck__standby');
    commandHeader.append(this.commandsHeading, this.standby);
    const paceRow = el('div', 'command-row command-row--pace');
    paceRow.append(this.createCommandButton('push'), this.createCommandButton('hold'));
    const lineRow = el('div', 'command-row command-row--line');
    lineRow.append(this.createCommandButton('inside'), this.createCommandButton('outside'));
    const nowRow = el('div', 'command-row command-row--now');
    nowRow.append(this.createCommandButton('now'));
    commandDeck.append(commandHeader, paceRow, lineRow, nowRow);
    consolePanel.append(commandDeck);

    this.element.append(this.feed, consolePanel);
    options.parent.append(this.element);
    document.documentElement.lang = this.language;
    this.renderLanguage();
    this.clearRadioLog();
  }

  render(snapshot: SprintRaceSnapshot, nextCorner: NextCornerReading): void {
    this.latestSnapshot = snapshot;
    const text = getRaceText(this.language);
    this.element.dataset.phase = snapshot.phase;
    this.element.classList.toggle('is-finished', snapshot.phase === 'finished');
    this.startOverlay.hidden = snapshot.phase !== 'ready';
    this.resultOverlay.hidden = snapshot.phase !== 'finished';
    this.countdown.hidden = snapshot.phase !== 'countdown';
    setText(this.countdown, snapshot.countdownValue?.toString() ?? '');

    const positionText = `P${snapshot.position}`;
    const lapText = `${snapshot.lap}/${snapshot.totalLaps}`;
    setText(this.feedPosition, positionText);
    setText(this.positionValue, positionText);
    setText(this.feedLap, lapText);
    setText(this.lapValue, lapText);
    setText(this.feedSector, snapshot.sector.toString());
    setText(this.sectorValue, snapshot.sector.toString());

    const cornerName = text.corners[nextCorner.corner.key];
    setText(this.nextValue, cornerName);
    setText(this.nextDistance, `${Math.max(0, Math.round(nextCorner.distanceMetres))} m`);
    const isClear = snapshot.position === 2 && snapshot.core.gapRelation === 'ahead';
    setText(this.gapValue, isClear ? text.clear : `+${snapshot.gapSeconds.toFixed(1)} s`);

    const defenseFact =
      snapshot.core.defenseReadable && snapshot.phase === 'overtake'
        ? text.rivalFact[snapshot.core.defenseSide]
        : text.rivalFact.neutral;
    setText(this.rivalFact, defenseFact);
    this.rivalFact.dataset.state = snapshot.core.defenseReadable ? 'alert' : 'neutral';

    setMarkerPosition(this.mapPlayer, this.mapPoints, snapshot.playerTotalProgress);
    setMarkerPosition(this.mapRival, this.mapPoints, snapshot.rivalTotalProgress);
    setMarkerPosition(this.mapLeader, this.mapPoints, snapshot.leaderTotalProgress);

    const cue = getCue(snapshot, text);
    setText(this.cueText, cue.text);
    this.cue.dataset.tone = cue.tone;
    this.cue.hidden = snapshot.phase === 'ready' || snapshot.phase === 'finished';

    this.updateCommandButton('push', snapshot.canCallPace, snapshot.paceDecision === 'push');
    this.updateCommandButton('hold', snapshot.canCallPace, snapshot.paceDecision === 'hold');
    this.updateCommandButton('inside', snapshot.canCallIntent, snapshot.intent === 'inside');
    this.updateCommandButton('outside', snapshot.canCallIntent, snapshot.intent === 'outside');
    this.updateCommandButton('now', snapshot.canCallNow, snapshot.nowCalled);
    const anyCallAvailable = snapshot.canCallPace || snapshot.canCallIntent || snapshot.canCallNow;
    this.standby.classList.toggle('is-live', anyCallAvailable);
    setText(this.standby, anyCallAvailable ? text.channelOpen : text.standby);

    if (snapshot.radioSequence !== this.lastRadioSequence) {
      this.lastRadioSequence = snapshot.radioSequence;
      if (snapshot.radioKey) {
        const line = text.radioLine[snapshot.radioKey];
        setText(this.driverLog, `DRV // ${line}`);
        setText(this.radioToastLine, line);
      }
    }
    this.radioToast.hidden = snapshot.radioKey === null || snapshot.phase === 'finished';
    if (snapshot.radioKey) setText(this.radioToastLine, text.radioLine[snapshot.radioKey]);

    if (snapshot.phase === 'finished') {
      const achieved = snapshot.resultAchieved === true;
      setText(this.resultHeadline, achieved ? text.targetAchieved : text.targetMissed);
      setText(
        this.resultDriverLine,
        `DRV // ${text.radioLine[achieved ? 'targetAchieved' : 'targetMissed']}`,
      );
      setText(this.resultTime, formatRaceTime(snapshot.elapsedSeconds));
      const paceKey = snapshot.paceDecision ?? 'none';
      setText(this.resultPace, text.paceValues[paceKey]);
      this.resultOverlay.dataset.result = achieved ? 'success' : 'missed';
    }

    this.renderRadioStatus();
  }

  setAudioMuted(muted: boolean): void {
    this.audioMuted = muted;
    this.renderLanguage();
  }

  private createCommandButton(command: DriverCommand): HTMLButtonElement {
    const button = el('button', `command-button command-button--${command}`);
    button.type = 'button';
    button.disabled = true;
    button.dataset.command = command;
    button.addEventListener('click', () => this.sendCommand(command));
    this.commandButtons.set(command, button);
    return button;
  }

  private updateCommandButton(command: DriverCommand, enabled: boolean, selected: boolean): void {
    const button = this.commandButtons.get(command);
    if (!button) return;
    button.disabled = !enabled;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', selected.toString());
  }

  private sendCommand(command: DriverCommand): void {
    const accepted = this.onCommand(command);
    this.radioInputState = accepted ? 'sent' : 'unavailable';
    if (accepted) {
      const text = getRaceText(this.language);
      setText(this.engineerLog, `ENG // ${getCommandLabel(text, command)}`);
    }
    this.renderRadioStatus();
  }

  private transmitInput(): void {
    const parsed = parseDriverCommand(this.radioInput.value);
    if (!parsed.command) {
      this.radioInputState = 'unrecognized';
      this.renderRadioStatus();
      return;
    }
    const accepted = this.onCommand(parsed.command);
    this.radioInputState = accepted ? 'sent' : 'unavailable';
    if (accepted) {
      const text = getRaceText(this.language);
      setText(this.engineerLog, `ENG // ${getCommandLabel(text, parsed.command)}`);
      this.radioInput.value = '';
    }
    this.renderRadioStatus();
  }

  private setLanguage(language: Language): void {
    this.language = language;
    document.documentElement.lang = language;
    this.renderLanguage();
    if (this.latestSnapshot?.radioKey) {
      const line = getRaceText(language).radioLine[this.latestSnapshot.radioKey];
      setText(this.driverLog, `DRV // ${line}`);
      setText(this.radioToastLine, line);
    }
  }

  private renderLanguage(): void {
    const text = getRaceText(this.language);
    setText(this.teamLabel, text.team);
    setText(this.carLabel, text.car);
    setText(this.sessionLabel, text.session);
    setText(this.liveLabel, text.live);
    setText(this.startTitle, text.title);
    setText(this.startRole, text.role);
    this.startHook.replaceChildren(...text.hookLines.map((line) => el('span', '', line)));
    setText(this.startButton, text.start);
    setText(this.missionLabel, text.objectiveLabel);
    setText(this.missionValue, text.objective);
    setText(this.feedPositionLabel, text.position);
    setText(this.positionLabel, text.position);
    setText(this.feedLapLabel, text.lap);
    setText(this.lapLabel, text.lap);
    setText(this.feedSectorLabel, text.sector);
    setText(this.sectorLabel, text.sector);
    setText(this.tacticalLabel, text.tactical);
    setText(this.mapPlayerLabel, text.player);
    setText(this.mapRivalLabel, text.target);
    setText(this.mapLeaderLabel, text.leader);
    setText(this.nextLabel, text.next);
    setText(this.gapLabel, text.gap);
    setText(this.radioHeading, text.radio);
    setText(this.radioHint, text.radioHint);
    this.radioInput.placeholder = text.radioPlaceholder;
    this.radioInput.setAttribute('aria-label', text.radio);
    setText(this.transmitButton, text.transmit);
    setText(this.commandsHeading, text.commands);
    setText(this.commandButtons.get('push'), text.push);
    setText(this.commandButtons.get('hold'), text.hold);
    setText(this.commandButtons.get('inside'), text.inside);
    setText(this.commandButtons.get('outside'), text.outside);
    setText(this.commandButtons.get('now'), text.now);
    setText(this.audioButton, this.audioMuted ? text.soundOff : text.soundOn);
    setText(this.resultEyebrow, text.finishTitle);
    setText(this.resultTimeLabel, text.raceTime);
    setText(this.resultPaceLabel, text.paceCall);
    setText(this.retryButton, text.retry);
    this.languageButtons.forEach((button, key) => {
      const selected = key === this.language;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected.toString());
    });
    this.renderRadioStatus();
  }

  private renderRadioStatus(): void {
    const text = getRaceText(this.language);
    const status =
      this.radioInputState === 'unavailable'
        ? text.unavailable
        : this.radioInputState === 'unrecognized'
          ? text.unrecognized
          : text.channelOpen;
    setText(this.radioStatus, status);
    this.radioStatus.dataset.state = this.radioInputState;
  }

  private clearRadioLog(): void {
    setText(this.engineerLog, 'ENG // —');
    setText(this.driverLog, 'DRV // —');
    this.radioInputState = 'idle';
    this.lastRadioSequence = -1;
  }
}

function createFeedStatus(): { element: HTMLElement; label: HTMLElement; value: HTMLElement } {
  const element = el('div', 'feed-status__item');
  const label = el('span', 'feed-status__label');
  const value = el('strong', 'feed-status__value');
  element.append(label, value);
  return { element, label, value };
}

function createConsoleNumber(): { element: HTMLElement; label: HTMLElement; value: HTMLElement } {
  const element = el('div', 'race-number');
  const label = el('span', 'race-number__label');
  const value = el('strong', 'race-number__value');
  element.append(label, value);
  return { element, label, value };
}

function createLegend(parent: HTMLElement, tone: string): HTMLElement {
  const item = el('span', `map-legend__item map-legend__item--${tone}`);
  const dot = el('i', 'map-legend__dot');
  const label = el('span', 'map-legend__label');
  item.append(dot, label);
  parent.append(item);
  return label;
}

function marker(className: string, radius: number): SVGCircleElement {
  const result = svg('circle', className);
  result.setAttribute('r', radius.toString());
  result.setAttribute('cx', '0');
  result.setAttribute('cy', '0');
  return result;
}

function setMarkerPosition(
  markerElement: SVGCircleElement,
  points: readonly CircuitMapPoint[],
  totalProgress: number,
): void {
  if (points.length === 0) return;
  const progress = ((totalProgress % 1) + 1) % 1;
  const scaled = progress * (points.length - 1);
  const index = Math.floor(scaled);
  const nextIndex = Math.min(points.length - 1, index + 1);
  const blend = scaled - index;
  const x = points[index].x + (points[nextIndex].x - points[index].x) * blend;
  const y = points[index].y + (points[nextIndex].y - points[index].y) * blend;
  markerElement.setAttribute('cx', x.toFixed(2));
  markerElement.setAttribute('cy', y.toFixed(2));
}

function toMapPath(points: readonly CircuitMapPoint[]): string {
  if (points.length === 0) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ') + ' Z';
}

function getCue(
  snapshot: SprintRaceSnapshot,
  text: ReturnType<typeof getRaceText>,
): { text: string; tone: string } {
  if (snapshot.phase === 'ready') return { text: text.cue.ready, tone: 'neutral' };
  if (snapshot.phase === 'countdown') return { text: text.cue.countdown, tone: 'live' };
  if (snapshot.outcome !== 'pending') {
    const outcomeCue = {
      success: text.cue.success,
      tooEarly: text.cue.tooEarly,
      tooLate: text.cue.tooLate,
      blocked: text.cue.blocked,
      noCall: text.cue.noCall,
      pending: text.cue.watch,
    }[snapshot.outcome];
    return { text: outcomeCue, tone: snapshot.outcome === 'success' ? 'success' : 'warning' };
  }
  if (snapshot.phase === 'runout') return { text: text.cue.bringHome, tone: snapshot.resultAchieved ? 'success' : 'warning' };
  if (snapshot.phase === 'opening') {
    if (snapshot.canCallPace) return { text: text.cue.pace, tone: 'action' };
    if (snapshot.playerTotalProgress >= 2.3) return { text: text.cue.target, tone: 'live' };
    return { text: text.cue.racing, tone: 'neutral' };
  }
  if (!snapshot.core.defenseReadable) return { text: text.cue.watch, tone: 'neutral' };
  if (snapshot.canCallIntent) return { text: text.cue.line, tone: 'action' };
  if (snapshot.intent && snapshot.core.preparationProgress < 0.8) {
    return { text: text.cue.preparing, tone: 'live' };
  }
  return { text: text.cue.readyToAttack, tone: 'action' };
}

function getCommandLabel(
  text: ReturnType<typeof getRaceText>,
  command: DriverCommand,
): string {
  return text[command];
}

function formatRaceTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.max(0, seconds - minutes * 60);
  return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`;
}

function setText(element: HTMLElement | undefined, value: string): void {
  if (element && element.textContent !== value) element.textContent = value;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  className: string,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  element.setAttribute('class', className);
  return element;
}
