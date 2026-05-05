import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { posthog } from 'posthog-js';

// PostHog is initialised using window.__POSTHOG_KEY__ and window.__POSTHOG_HOST__
// set by the consuming application before this component loads. See .env for the
// environment variable names (POSTHOG_API_KEY, POSTHOG_HOST).
declare global {
  interface Window {
    __POSTHOG_KEY__?: string;
    __POSTHOG_HOST__?: string;
  }
}

export class DuongokuGhPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      min-height: 250px;
      padding: 25px;
      color: var(--duongoku-gh-page-text-color, #000);
    }

    canvas {
      position: absolute;
      inset: 0 auto auto 0;
      z-index: 0;
      pointer-events: none;
    }

    .content {
      position: relative;
      z-index: 1;
    }

    a {
      display: block;
    }
  `;

  @property({ type: String }) header = 'Hey there';

  @property({ type: Number }) counter = 5;

  private readonly spriteUrl = new URL(
    '../../assets/mimikyu.png',
    import.meta.url,
  ).href;

  private readonly sprite = new Image();

  private animationFrameId = 0;

  private animationTimeoutId = 0;

  private currentLoopIndex = 0;

  private currentDirectionIndex = 0;

  private currentPosition: [number, number] = [200, 0];

  private readonly directions = [2, 0, 1, 3];

  private readonly positionChange: [number, number][] = [
    [0, 1],
    [-1, 0],
    [1, 0],
    [0, -1],
  ];

  private readonly spriteSpeed = 4;

  private readonly spriteWidth = 64;

  private readonly spriteHeight = 64;

  connectedCallback() {
    super.connectedCallback();
    try {
      const apiKey = window.__POSTHOG_KEY__;
      const apiHost = window.__POSTHOG_HOST__;
      if (apiKey && !posthog.__loaded) {
        posthog.init(apiKey, {
          api_host: apiHost ?? 'https://us.i.posthog.com',
        });
        posthog.startExceptionAutocapture();
      }
      if (posthog.__loaded) {
        posthog.capture('component_connected', {
          component: 'duongoku-gh-page',
          header: this.header,
        });
      }
    } catch (err) {
      posthog.captureException(err);
    }
  }

  firstUpdated() {
    this.sprite.src = this.spriteUrl;
    this.sprite.onload = () => {
      this.animationFrameId = window.requestAnimationFrame(() =>
        this.gameLoop(),
      );
    };
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousemove', this.handleMouseMove);
    window.cancelAnimationFrame(this.animationFrameId);
    window.clearTimeout(this.animationTimeoutId);
  }

  __increment() {
    this.counter += 1;
  }

  private get canvas() {
    return this.renderRoot.querySelector('canvas');
  }

  private get context() {
    return this.canvas?.getContext('2d');
  }

  private drawFrame(
    frameX: number,
    frameY: number,
    canvasX: number,
    canvasY: number,
  ) {
    this.context?.drawImage(
      this.sprite,
      frameX * this.spriteWidth,
      frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      canvasX,
      canvasY,
      this.spriteWidth,
      this.spriteHeight,
    );
  }

  private gameLoop() {
    const { canvas } = this;
    const { context } = this;
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    this.currentLoopIndex = (this.currentLoopIndex + 1) % 4;
    if (Math.random() * 8 < 1) {
      this.currentDirectionIndex = Math.floor(Math.random() * 4);
    }

    const direction = this.directions[this.currentDirectionIndex];
    this.currentPosition[0] +=
      this.positionChange[direction][0] * this.spriteSpeed;
    this.currentPosition[1] +=
      this.positionChange[direction][1] * this.spriteSpeed;

    if (this.currentPosition[0] >= canvas.width - this.spriteWidth) {
      this.currentPosition[0] = 0;
    } else if (this.currentPosition[0] < 0) {
      this.currentPosition[0] = canvas.width - this.spriteWidth;
    }

    if (this.currentPosition[1] >= canvas.height - this.spriteHeight) {
      this.currentPosition[1] = 0;
    } else if (this.currentPosition[1] < 0) {
      this.currentPosition[1] = canvas.height - this.spriteHeight;
    }

    this.drawFrame(
      this.currentLoopIndex,
      direction,
      this.currentPosition[0],
      this.currentPosition[1],
    );
    this.animationTimeoutId = window.setTimeout(() => {
      this.animationFrameId = window.requestAnimationFrame(() =>
        this.gameLoop(),
      );
    }, 1000 / 60);
  }

  private readonly handleMouseMove = (event: MouseEvent) => {
    const { canvas } = this;
    if (!canvas) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const centerX = this.currentPosition[0] + this.spriteWidth / 2;
    const centerY = this.currentPosition[1] + this.spriteHeight / 2;
    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;
    const distance = Math.sqrt(
      (mouseX - centerX) * (mouseX - centerX) +
        (mouseY - centerY) * (mouseY - centerY),
    );
    const minDistance = this.spriteWidth / 2;
    if (distance > 0 && distance < minDistance) {
      this.currentPosition[0] +=
        (minDistance / distance - 1) * (centerX - mouseX);
      this.currentPosition[1] +=
        (minDistance / distance - 1) * (centerY - mouseY);
    }
  };

  render() {
    document.title = 'Homepage';
    return html`
      <canvas width="500" height="250"></canvas>
      <div class="content">
        <h1>Welcome to my page</h1>
        <h3>
          My name is <i>Dương</i> and <i>duongoku</i> is my alias on the
          internet
        </h3>
        <div>Directory listing:</div>
        <a href="./archive/">/archive</a>
      </div>
    `;
  }
}
