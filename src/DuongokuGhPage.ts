import { html, css, LitElement } from 'lit';
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
      min-height: 100vh;
      color: var(--duongoku-gh-page-text-color, #151515);
      background: #f8f7f3;
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        sans-serif;
    }

    main {
      box-sizing: border-box;
      width: min(100%, 780px);
      min-height: 100vh;
      padding: clamp(48px, 10vw, 96px) clamp(20px, 6vw, 56px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 32px;
    }

    .identity {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(3rem, 11vw, 7rem);
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: 0;
    }

    .alias {
      color: #5e5b52;
      font-size: clamp(1.05rem, 3vw, 1.4rem);
      line-height: 1.45;
    }

    .intro {
      max-width: 34rem;
      color: #2a2926;
      font-size: clamp(1.1rem, 3vw, 1.45rem);
      line-height: 1.6;
    }

    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    a {
      color: #151515;
      font-size: 1rem;
      font-weight: 700;
      text-decoration-thickness: 2px;
      text-underline-offset: 5px;
    }

    a:hover {
      color: #9a3412;
    }
  `;

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
        });
      }
    } catch (err) {
      posthog.captureException(err);
    }
  }

  render() {
    document.title = 'Dương / duongoku';
    return html`
      <main>
        <section class="identity" aria-labelledby="page-title">
          <h1 id="page-title">Dương</h1>
          <p class="alias">duongoku on the internet</p>
        </section>
        <p class="intro">
          Personal homepage and archive for projects, notes, experiments, and
          old course work.
        </p>
        <nav aria-label="Site sections">
          <a href="/archive/">/archive</a>
        </nav>
      </main>
    `;
  }
}
