/**
 * splash-loader.ts
 *
 * Imperative full-screen splash loader utility.
 * Works outside React components — no hooks needed.
 *
 * Usage:
 *   import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";
 *
 *   showSplashLoader("Loading...");   // show with optional message
 *   hideSplashLoader();               // hide and remove from DOM
 */

const SPLASH_ID = "crm-splash-loader";

const STYLES = `
  #${SPLASH_ID} {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: splashFadeIn 0.2s ease forwards;
  }

  #${SPLASH_ID}.hide {
    animation: splashFadeOut 0.2s ease forwards;
  }

  @keyframes splashFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes splashFadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  #${SPLASH_ID} .splash-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: splashSpin 0.75s linear infinite;
  }

  @keyframes splashSpin {
    to { transform: rotate(360deg); }
  }

  #${SPLASH_ID} .splash-message {
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.02em;
    font-family: inherit;
    text-align: center;
    margin: 0;
  }
`;

function injectStyles() {
  if (document.getElementById(`${SPLASH_ID}-styles`)) return;
  const style = document.createElement("style");
  style.id = `${SPLASH_ID}-styles`;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

/**
 * Show the full-screen splash loader.
 * @param message  Optional label shown beneath the spinner.
 */
export function showSplashLoader(message = "Loading...") {
  if (typeof document === "undefined") return;

  // Remove any existing instance first
  hideSplashLoaderImmediate();

  injectStyles();

  const overlay = document.createElement("div");
  overlay.id = SPLASH_ID;
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-live", "polite");
  overlay.setAttribute("aria-label", message);

  const spinner = document.createElement("div");
  spinner.className = "splash-spinner";

  const label = document.createElement("p");
  label.className = "splash-message";
  label.textContent = message;

  overlay.appendChild(spinner);
  overlay.appendChild(label);
  document.body.appendChild(overlay);
}

/**
 * Hide and remove the splash loader (with fade-out animation).
 */
export function hideSplashLoader() {
  if (typeof document === "undefined") return;

  const overlay = document.getElementById(SPLASH_ID);
  if (!overlay) return;

  overlay.classList.add("hide");
  overlay.addEventListener("animationend", () => overlay.remove(), {
    once: true,
  });
}

/** Remove immediately without animation (internal use). */
function hideSplashLoaderImmediate() {
  document.getElementById(SPLASH_ID)?.remove();
}

/**
 * Update the message text while the loader is visible.
 * @param message  New message to display.
 */
export function updateSplashMessage(message: string) {
  const label = document.querySelector(`#${SPLASH_ID} .splash-message`);
  if (label) label.textContent = message;
}
