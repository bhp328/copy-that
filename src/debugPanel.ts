interface OvertakeDebugSource {
  createDebugReport(): string;
}

/** Developer-only diagnostics, mounted only when the URL contains ?debug=1. */
export class OvertakeDebugPanel {
  readonly element: HTMLElement;

  private readonly output: HTMLPreElement;
  private readonly copyButton: HTMLButtonElement;
  private readonly gameplay: OvertakeDebugSource;

  constructor(parent: HTMLElement, gameplay: OvertakeDebugSource) {
    this.gameplay = gameplay;
    this.element = document.createElement('aside');
    this.element.className = 'debug-panel';
    this.element.setAttribute('aria-label', 'Overtake debug values');

    const header = document.createElement('div');
    header.className = 'debug-panel__header';
    const title = document.createElement('strong');
    title.textContent = 'OVERTAKE DEBUG';
    this.copyButton = document.createElement('button');
    this.copyButton.type = 'button';
    this.copyButton.textContent = 'COPY TEST REPORT';
    this.copyButton.addEventListener('click', () => void this.copyReport());
    header.append(title, this.copyButton);

    this.output = document.createElement('pre');
    this.element.append(header, this.output);
    parent.append(this.element);
    this.update();
  }

  update(): void {
    this.output.textContent = this.gameplay.createDebugReport();
  }

  private async copyReport(): Promise<void> {
    const report = this.gameplay.createDebugReport();
    try {
      await navigator.clipboard.writeText(report);
      this.copyButton.textContent = 'COPIED';
    } catch {
      this.copyButton.textContent = 'COPY FAILED';
    }
    window.setTimeout(() => {
      this.copyButton.textContent = 'COPY TEST REPORT';
    }, 1_300);
  }
}
