export interface ErrorMaskOptions {
  zIndex?: number; // 默认 10000
  color?: string; // 默认 #d93025
}

export class ErrorMask {
  private parent: HTMLElement;
  private container: HTMLDivElement | null = null;
  private styleId = "cube-grid-vis-error-style";
  private options: ErrorMaskOptions;
  private isShowing = false;

  constructor(parent: HTMLElement, options: ErrorMaskOptions = {}) {
    this.parent = parent;
    this.options = {
      zIndex: 10000,
      color: "#d93025",
      ...options,
    };
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById(this.styleId)) {
      return;
    }

    const css = `
      .cgv-error-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      }
      
      @media (prefers-color-scheme: dark) {
        .cgv-error-overlay {
          background: rgba(0, 0, 0, 0.85);
        }
      }

      .cgv-error-overlay.visible {
        opacity: 1;
        pointer-events: all;
      }

      .cgv-error-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        fill: currentColor;
      }

      .cgv-error-message {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        margin-bottom: 24px;
        max-width: 80%;
        word-wrap: break-word;
      }

      @media (prefers-color-scheme: dark) {
        .cgv-error-message {
          color: #eee;
        }
      }

      .cgv-error-retry-btn {
        padding: 8px 24px;
        background-color: transparent;
        border: 1px solid currentColor;
        border-radius: 4px;
        color: inherit;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
        font-weight: 500;
      }

      .cgv-error-retry-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      @media (prefers-color-scheme: dark) {
        .cgv-error-retry-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    `;

    const style = document.createElement("style");
    style.id = this.styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  public show(message: string): void {
    if (!this.container) {
      this.createContainer();
    }

    // Update content
    if (this.container) {
      const msgEl = this.container.querySelector(".cgv-error-message");
      if (msgEl) {
        msgEl.textContent = message;
      }

      // Force reflow
      void this.container.offsetWidth;
      this.container.classList.add("visible");
      this.isShowing = true;
    }
  }

  public hide(): void {
    if (!this.isShowing || !this.container) {
      return;
    }

    this.container.classList.remove("visible");
    this.isShowing = false;

    // Remove from DOM after transition to match loading.ts behavior
    setTimeout(() => {
      if (!this.isShowing && this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
      }
    }, 300); // 300ms matches transition
  }

  public destroy(): void {
    this.hide();
    const style = document.getElementById(this.styleId);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }

  private createContainer(): void {
    const { zIndex, color } = this.options;

    this.container = document.createElement("div");
    this.container.className = "cgv-error-overlay";
    this.container.style.zIndex = zIndex!.toString();
    if (color) {
      this.container.style.color = color;
    }

    this.container.innerHTML = `
      <svg class="cgv-error-icon" viewBox="0 0 24 24">
         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <div class="cgv-error-message"></div>
    `;

    // Ensure parent is positioned relative if static
    const parentStyle = window.getComputedStyle(this.parent);
    if (parentStyle.position === "static") {
      this.parent.style.position = "relative";
    }

    this.parent.appendChild(this.container);
  }
}
