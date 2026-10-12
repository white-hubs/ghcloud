export interface LoadingOptions {
  size?: number; // 默认 64
  color?: string; // 默认 #4285F4
  zIndex?: number; // 默认 9999
}

export class LoadingIndicator {
  private parent: HTMLElement;
  private container: HTMLDivElement | null = null;
  private styleId = "cube-grid-vis-loading-style";
  private options: LoadingOptions;
  private isShowing = false;

  constructor(parent: HTMLElement, options: LoadingOptions = {}) {
    this.parent = parent;
    this.options = {
      size: 64,
      color: "#4285F4",
      zIndex: 9999,
      ...options,
    };
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById(this.styleId)) {
      return;
    }

    const css = `
      .cgv-loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.6s ease;
        pointer-events: none;
      }
      
      @media (prefers-color-scheme: dark) {
        .cgv-loading-overlay {
          background: rgba(0, 0, 0, 0.6);
        }
      }

      .cgv-loading-overlay.visible {
        opacity: 1;
        pointer-events: all;
      }

      .cgv-spinner {
        position: relative;
        will-change: transform;
      }

      .cgv-spinner svg {
        display: block;
        transform-origin: center;
      }

      /* 动画 1: 外圈旋转 */
      .cgv-circle-outer {
        fill: none;
        stroke-width: 4;
        stroke-linecap: round;
        stroke-dasharray: 150;
        stroke-dashoffset: 0;
        transform-origin: center;
        animation: cgv-rotate 2s linear infinite, cgv-dash 1.5s ease-in-out infinite;
      }

      /* 动画 2: 内圈呼吸 */
      .cgv-circle-inner {
        fill: currentColor;
        opacity: 0.2;
        transform-origin: center;
        animation: cgv-pulse 1.5s ease-in-out infinite alternate;
      }

      /* 动画 3: 中心点渐显 */
      .cgv-center-dot {
        fill: currentColor;
        transform-origin: center;
        animation: cgv-scale-in 1.5s ease-out infinite;
      }
      
      /* Removed checkmark styles */

      @keyframes cgv-rotate {
        100% { transform: rotate(360deg); }
      }

      @keyframes cgv-dash {
        0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
        100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
      }

      @keyframes cgv-pulse {
        0% { transform: scale(0.8); opacity: 0.1; }
        100% { transform: scale(1.1); opacity: 0.3; }
      }

      @keyframes cgv-scale-in {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
    `;

    const style = document.createElement("style");
    style.id = this.styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  public start(): void {
    if (this.isShowing) {
      return;
    }
    this.isShowing = true;

    if (!this.container) {
      this.createContainer();
    }

    // Reset state
    if (this.container) {
      // Force reflow
      void this.container.offsetWidth;
      this.container.classList.add("visible");
    }
  }

  public stop(): void {
    if (!this.isShowing || !this.container) {
      return;
    }
    this.hide();
  }

  private hide(): void {
    if (this.container) {
      this.container.classList.remove("visible");
      this.isShowing = false;

      // Remove from DOM after transition
      setTimeout(() => {
        if (!this.isShowing && this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
          this.container = null;
        }
      }, 600);
    }
  }

  public destroy(): void {
    this.hide();
    const style = document.getElementById(this.styleId);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }

  private createContainer(): void {
    const { size, color, zIndex } = this.options;

    this.container = document.createElement("div");
    this.container.className = "cgv-loading-overlay";
    this.container.style.zIndex = zIndex!.toString();
    this.container.style.color = color!;

    // SVG Content
    // viewBox 0 0 64 64
    const r = 28;
    const c = 32;

    this.container.innerHTML = `
      <div class="cgv-spinner" style="width: ${size}px; height: ${size}px;">
        <svg width="100%" height="100%" viewBox="0 0 64 64">
           <!-- Inner Pulse Circle -->
           <circle class="cgv-circle-inner" cx="${c}" cy="${c}" r="${r * 0.6}" />
           
           <!-- Center Dot Fade -->
           <circle class="cgv-center-dot" cx="${c}" cy="${c}" r="4" />

           <!-- Outer Rotating Ring -->
           <circle class="cgv-circle-outer" cx="${c}" cy="${c}" r="${r}" stroke="currentColor" />
        </svg>
      </div>
    `;

    // Ensure parent is positioned relative if static
    const parentStyle = window.getComputedStyle(this.parent);
    if (parentStyle.position === "static") {
      this.parent.style.position = "relative";
    }

    this.parent.appendChild(this.container);
  }
}
