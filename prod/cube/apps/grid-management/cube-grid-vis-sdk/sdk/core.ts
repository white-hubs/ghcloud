// oxlint-disable no-console
// oxlint-disable new-cap
// oxlint-disable no-magic-numbers
// oxlint-disable no-inferrable-types
// oxlint-disable no-inline-comments
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Tools,
  AbstractMesh,
  FramingBehavior,
  Color4,
  Color3,
  DirectionalLight,
  Observable,
  LoadAssetContainerAsync,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from "@babylonjs/gui";
import gsap from "gsap";
import "@babylonjs/loaders"; // Import loaders for GLB/GLTF

import { ErrorMask } from "./error-mask";
import { LoadingIndicator, type LoadingOptions } from "./loading";

/**
 * SDK 事件接口
 */
export interface CubeGridVisEvent<T = any> {
  /** 事件名称 */
  eventName: string;
  /** 事件数据 */
  data: T;
  /** 原始事件对象 (可选) */
  originalEvent?: any;
  /** 阻止事件传播 */
  stopPropagation: () => void;
  /** 是否已阻止传播 */
  isPropagationStopped: () => boolean;
}

/**
 * SDK 初始化配置选项
 */
export interface CubeGridVisOptions {
  /**
   * 默认俯视角度（度），默认 60 度
   */
  pitchDegrees?: number;
  /**
   * 低帧率阈值（FPS），默认 30
   */
  lowFpsThreshold?: number;
  /**
   * 持续低帧率判定帧数，默认 15
   */
  lowFpsFrameCount?: number;
  /**
   * 加载动画配置
   */
  loadingOptions?: LoadingOptions;

  /**
   * 智能相机视角padding因子，默认 0.85
   */
  smartCameraPaddingFactor?: number;
}

export class CubeGridVis {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private canvas: HTMLCanvasElement;
  private currentMeshes: AbstractMesh[] = [];
  private isLoading: boolean = false;
  private guiTexture: AdvancedDynamicTexture | null = null;
  private loadingIndicator: LoadingIndicator;
  private errorMask: ErrorMask;
  private options: Required<CubeGridVisOptions>;
  private eventListeners: { pattern: string; callback: (event: CubeGridVisEvent) => void }[] = [];

  // FPS 监控相关
  private lowFpsFrameCounter: number = 0;
  public onLowFpsObservable: Observable<number> = new Observable<number>();
  private renderLoopFunc: () => void;

  constructor(canvas: HTMLCanvasElement, options: CubeGridVisOptions = {}) {
    this.canvas = canvas;

    // Merge options with defaults
    this.options = {
      pitchDegrees: 60,
      lowFpsThreshold: 30,
      lowFpsFrameCount: 15,
      loadingOptions: {},
      smartCameraPaddingFactor: 0.85,
      ...options,
    };

    // Create engine (WebGPU if available, fallback to WebGL)
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);

    // Set transparent background
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.camera = new ArcRotateCamera(
      "camera1",
      -Math.PI / 2,
      Math.PI / 3, // Initial beta, will be adjusted by enableSmartCamera
      10,
      Vector3.Zero(),
      this.scene,
    );
    this.camera.attachControl(canvas, true);
    this.camera.minZ = 0.1;

    // 1. Ambient Light (HemisphericLight) - Simulates ambient environment light
    const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), this.scene);
    ambientLight.intensity = 0.5;
    ambientLight.specular = Color3.Black(); // Disable specular highlights from ambient light
    ambientLight.groundColor = new Color3(0.2, 0.2, 0.2); // Add some ground color for better ambient effect

    // 2. Main Light (DirectionalLight) - Simulates sun/point source
    // Using DirectionalLight instead of PointLight for better coverage of large models,
    // but it serves the purpose of the "main source".
    const mainLight = new DirectionalLight("mainLight", new Vector3(-1, -2, -1), this.scene);
    mainLight.intensity = 0.8;
    mainLight.specular = Color3.Black(); // Disable specular highlights (reflections) on materials

    // Handle resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    // Start render loop
    this.renderLoopFunc = () => {
      this.scene.render();
      this.monitorFps();
    };
    this.engine.runRenderLoop(this.renderLoopFunc);

    // Init Loading Indicator
    // We attach it to the canvas parent usually, or a specific container.
    // Assuming canvas parent is suitable.
    const loadingTarget = canvas.parentElement || document.body;
    this.loadingIndicator = new LoadingIndicator(loadingTarget, this.options.loadingOptions);
    this.errorMask = new ErrorMask(loadingTarget, this.options.loadingOptions);
  }

  /**
   * 监控帧率
   */
  private monitorFps(): void {
    const fps = this.engine.getFps();

    // Ignore initial frames or infinity
    if (!isFinite(fps)) {
      return;
    }

    if (fps < this.options.lowFpsThreshold) {
      this.lowFpsFrameCounter += 1;
    } else {
      this.lowFpsFrameCounter = 0;
    }

    if (this.lowFpsFrameCounter >= this.options.lowFpsFrameCount) {
      // Trigger event
      if (this.onLowFpsObservable.hasObservers()) {
        this.onLowFpsObservable.notifyObservers(fps);
        // Reset counter to avoid flooding events?
        // Or keep triggering? Usually trigger once per continuous low period is better,
        // but requirements say "when fps < ... output event".
        // Let's reset to avoid spamming every frame after 15th.
        this.lowFpsFrameCounter = 0;
      }
    }
  }

  /**
   * 获取当前帧率
   * @returns FPS
   */
  public getFps(): number {
    return this.engine.getFps();
  }

  /**
   * 注册事件监听
   * 支持通配符，如 'label-click:*'
   * @param pattern 事件名称或匹配模式
   * @param callback 回调函数
   */
  public on(pattern: string, callback: (event: CubeGridVisEvent) => void): void {
    this.eventListeners.push({ pattern, callback });
  }

  /**
   * 移除事件监听
   * @param pattern 事件名称或匹配模式
   * @param callback 回调函数
   */
  public off(pattern: string, callback: (event: CubeGridVisEvent) => void): void {
    this.eventListeners = this.eventListeners.filter((l) => l.pattern !== pattern || l.callback !== callback);
  }

  /**
   * 触发事件
   * 实现冒泡机制：优先执行精确匹配的监听器，然后是通配符匹配的监听器
   * @param eventName 事件名称
   * @param data 事件数据
   * @param originalEvent 原始事件对象 (可选)
   */
  private triggerEvent(eventName: string, data: any, originalEvent?: any): void {
    let isStopped = false;
    const eventObject: CubeGridVisEvent = {
      eventName,
      data,
      originalEvent,
      stopPropagation: () => {
        isStopped = true;
      },
      isPropagationStopped: () => isStopped,
    };

    // 1. Exact matches (e.g. 'label-click:specificId')
    const exactListeners = this.eventListeners.filter((l) => l.pattern === eventName);
    for (const listener of exactListeners) {
      if (eventObject.isPropagationStopped()) {
        return;
      }
      try {
        listener.callback(eventObject);
      } catch (e) {}
    }

    // 2. Wildcard matches (e.g. 'label-click:*')
    // pattern must end with *, and prefix matches
    const wildcardListeners = this.eventListeners.filter((l) => {
      if (l.pattern === eventName) {
        return false;
      } // Already handled
      if (l.pattern.endsWith("*")) {
        const prefix = l.pattern.slice(0, -1);
        if (eventName.startsWith(prefix)) {
          return true;
        }
      }
      return false;
    });

    for (const listener of wildcardListeners) {
      if (eventObject.isPropagationStopped()) {
        return;
      }
      try {
        listener.callback(eventObject);
      } catch (e) {}
    }
  }

  /**
   * 销毁 SDK 实例，释放所有资源
   */
  public dispose(): void {
    // Stop render loop
    this.engine.stopRenderLoop(this.renderLoopFunc);

    // Dispose labels
    this.disposeLabels();

    // Dispose scene (includes all meshes, materials, lights, cameras)
    if (this.scene) {
      this.scene.dispose();
    }

    // Clear canvas content
    if (this.canvas) {
      // Try to clear via engine first if alive
      // @ts-expect-error - _disposed is private/internal but useful here
      if (this.engine && !this.engine._disposed) {
        this.engine.clear(new Color4(0, 0, 0, 0), true, true, true);
      }

      // Dispose engine
      if (this.engine) {
        this.engine.dispose();
      }

      // Force clear by resetting context or dimensions
      const context = this.canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        // For WebGL, resetting width/height is the most reliable way to clear the buffer
        // This forces the browser to reallocate the buffer
        // this.canvas.width = this.canvas.width;
        // this.canvas.height = this.canvas.height;
      }
    }

    // Clear observables
    this.onLowFpsObservable.clear();
  }

  /**
   * 初始化 SDK
   * @returns this
   */
  public async init(): Promise<this> {
    return this;
  }

  /**
   * 计算最佳水平视角 (Alpha)
   * 确保模型长边面向相机，并包含 180 度偏移
   */
  private getOptimalAlpha(size: Vector3): number {
    let targetAlpha = -Math.PI / 2;

    // If size.z > size.x, Z is longer. Look from X axis.
    if (size.z > size.x) {
      // Look from X axis (Alpha = 0)
      targetAlpha = 0;
    } else {
      // X is longer. Look from -Z axis (Alpha = -PI/2)
      targetAlpha = -Math.PI / 2;
    }

    // Rotate 180 degrees as requested
    targetAlpha += Math.PI;

    return targetAlpha;
  }

  /**
   * 切换到俯视视角 (Top View)
   * 垂直向下观察模型
   * @param animate 是否使用动画过渡，默认 true
   */
  public enableTopView(animate: boolean = true): void {
    if (this.currentMeshes.length === 0) {
      return;
    }

    // Calculate bounds
    const worldExtends = this.scene.getWorldExtends((mesh: AbstractMesh) => this.currentMeshes.includes(mesh) && mesh.isVisible);

    const center = worldExtends.min.add(worldExtends.max).scale(0.5);
    const size = worldExtends.max.subtract(worldExtends.min);

    // Use the same optimal alpha as Smart Camera (Default View)
    const targetAlpha = this.getOptimalAlpha(size);

    // Beta: 0 is pure top down. Use small epsilon to avoid gimbal lock if needed, but 0 is usually fine for ArcRotate.
    // ArcRotateCamera sometimes has issues with exact 0 or PI. 0.01 is safer.
    const targetBeta = 0.01;

    // Calculate radius to fit model
    // oxlint-disable-next-line prefer-destructuring
    const fov = this.camera.fov;
    // Fit max dimension into vertical FOV (since aspect ratio might clip width)
    // Actually for top view, we fit the XZ plane into the screen.
    // Height of view at distance D = 2 * D * tan(fov/2).
    // We want Height >= size.z (if Z aligns with screen height)
    // and Width >= size.x.

    // Simplified: bounding sphere radius is safe.
    const boundingSphereRadius = Math.max(size.x, size.y, size.z) / 2;
    let radius = boundingSphereRadius / Math.tan(fov / 2);

    // Adjust for aspect ratio
    const canvasWidth = this.engine.getRenderWidth();
    const canvasHeight = this.engine.getRenderHeight();
    const aspectRatio = canvasWidth / canvasHeight;

    if (aspectRatio < 1) {
      radius /= aspectRatio;
    }

    // Padding
    radius *= 1.1;

    if (animate) {
      this.camera.useFramingBehavior = false;
      this.camera.lowerRadiusLimit = null;
      this.camera.upperRadiusLimit = null;

      const animState = {
        alpha: this.camera.alpha,
        beta: this.camera.beta,
        radius: this.camera.radius,
        targetX: this.camera.target.x,
        targetY: this.camera.target.y,
        targetZ: this.camera.target.z,
      };

      gsap.to(animState, {
        alpha: targetAlpha,
        beta: targetBeta,
        radius: radius,
        targetX: center.x,
        targetY: center.y,
        targetZ: center.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          this.camera.alpha = animState.alpha;
          this.camera.beta = animState.beta;
          this.camera.radius = animState.radius;
          this.camera.setTarget(new Vector3(animState.targetX, animState.targetY, animState.targetZ));
        },
        onComplete: () => {
          this.camera.lowerRadiusLimit = boundingSphereRadius * 1.1;
          this.camera.upperRadiusLimit = radius * 5;
        },
      });
    } else {
      this.camera.alpha = targetAlpha;
      this.camera.beta = targetBeta;
      this.camera.radius = radius;
      this.camera.setTarget(center);
    }
  }

  /**
   * 统一加载模型接口 (智能加载)
   * 自动处理模型切换、资源释放、加载状态和动画过渡
   * @param url 模型路径 (.glb/.gltf) 或 Blob URL
   * @param releasePreviousModel 可选，是否释放先前加载的模型资源，默认为 true
   */
  public async loadModel(url: Parameters<typeof LoadAssetContainerAsync>[0], releasePreviousModel: boolean = true): Promise<void> {
    this.hideError();
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loadingIndicator.start(); // Start animation

    try {
      // 1. Resource Release / Cleanup
      if (releasePreviousModel) {
        // Dispose only mesh resources first, keep scene/engine alive
        this.disposeCurrentModel();

        // Dispose labels (GUI)
        this.disposeLabels();
      } else {
      }

      // 2. Load Model
      // Ensure scene is valid
      if (!this.scene || this.scene.isDisposed) {
        throw new Error("Scene is disposed or invalid.");
      }

      const assetContainer = await LoadAssetContainerAsync(url, this.scene, {
        pluginOptions: {
          gltf: {
            skipMaterials: false,
            extensionOptions: {
              MSFT_lod: {
                maxLODsToLoad: 1,
              },
            },
          },
        },
      });
      assetContainer.addAllToScene();
      const meshes = assetContainer.meshes.filter((m) => m.isEnabled());

      if (releasePreviousModel) {
        this.currentMeshes = meshes;
      } else {
        // Append new meshes to the existing list
        this.currentMeshes.push(...meshes);
      }

      // 3. Initial state: "Flat" / Top-down before animation
      // Calculate bounds for center
      const worldExtends = this.scene.getWorldExtends((mesh: AbstractMesh) => this.currentMeshes.includes(mesh) && mesh.isVisible);
      const center = worldExtends.min.add(worldExtends.max).scale(0.5);
      const size = worldExtends.max.subtract(worldExtends.min);
      const maxDim = Math.max(size.x, size.y, size.z);

      // Set camera to top-down view initially
      this.camera.setTarget(center);
      this.camera.alpha = -Math.PI / 2; // Front/South
      this.camera.beta = 0.1; // Almost top-down (0 is Gimbal lock prone, use small value)
      this.camera.radius = maxDim * 3; // Zoomed out a bit

      // Force render to show initial state
      this.scene.render();

      // 4. Smart Camera Transition
      this.enableSmartCamera(true);

      // Add labels to sub-grids - REMOVED AUTO CALL
      // this.addLabelsToSubGrids();
    } catch (error) {
      this.showError(`模型加载失败：${(error as Error).message}`);
      throw error;
    } finally {
      this.loadingIndicator.stop(); // Ensure loading stops in all cases
      this.isLoading = false;
    }
  }

  /**
   * 释放当前模型资源
   */
  private disposeCurrentModel(): void {
    // Dispose labels first
    this.disposeLabels();

    if (this.currentMeshes.length > 0) {
      this.currentMeshes.forEach((mesh) => {
        if (!mesh.isDisposed()) {
          // dispose(doNotRecurse, disposeMaterialAndTextures)
          mesh.dispose(false, true);
        }
      });
      this.currentMeshes = [];
      // Optional: Clean up unused materials/textures in scene if needed
      // this.scene.cleanCachedTextureBuffer();
    }
    this.hideError();
  }

  /**
   * 清除所有标签
   */
  private disposeLabels(): void {
    if (this.guiTexture) {
      this.guiTexture.dispose();
      this.guiTexture = null;
    }
  }

  /**
   * 为特定前缀的节点添加标签
   * @param prefix 节点名称前缀，默认为 "sub_grid_"
   */
  public addLabelsToSubGrids(prefix: string = "sub_grid_"): void {
    // Filter meshes starting with prefix
    // Debug: print all mesh names to see what we have

    const targetMeshes = this.currentMeshes.filter((mesh) => mesh.name.startsWith(prefix));

    if (targetMeshes.length === 0) {
      return;
    }

    // Create AdvancedDynamicTexture if not exists
    if (!this.guiTexture) {
      // Use CreateFullscreenUI with foreground = true
      this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
    }

    targetMeshes.forEach((mesh) => {
      // Create label container (Rectangle)
      const rect = new Rectangle();
      rect.adaptWidthToChildren = true; // Use adaptWidthToChildren instead of "auto"
      rect.height = "24px"; // Fixed height container
      rect.cornerRadius = 6;
      rect.color = "white"; // White border
      rect.thickness = 1; // 1px border
      rect.background = "rgba(255, 255, 255, 0.50)";

      // Add text
      const label = new TextBlock();
      // Remove prefix from label text
      label.text = mesh.name.replace(prefix, "");
      label.color = "#464d5b"; // Requested color
      label.fontSize = 14;
      label.fontFamily = "Source Han Sans CN, Source Han Sans CN-Medium, sans-serif";
      label.fontWeight = "500"; // Medium
      label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      label.resizeToFit = true; // Let text determine size
      label.paddingLeft = "5px";
      label.paddingRight = "5px";

      rect.addControl(label);

      // Link to mesh
      this.guiTexture!.addControl(rect);
      rect.linkWithMesh(mesh);
      rect.linkOffsetY = -40; // Approx offset in pixels above center

      // Add click event listener
      rect.isPointerBlocker = true;
      rect.onPointerClickObservable.add((eventData) => {
        const eventPayload = {
          meshName: mesh.name,
          labelText: label.text,
        };

        const eventName = `label-click:${mesh.name}`;
        this.triggerEvent(eventName, eventPayload, eventData);
      });
    });
  }

  /**
   * 截图
   * @returns Base64 string of the screenshot
   */
  public async takeScreenshot(): Promise<string> {
    return new Promise((resolve) => {
      Tools.CreateScreenshot(this.engine, this.camera, { precision: 1 }, (data: string) => {
        resolve(data);
      });
    });
  }

  /**
   * 智能视角
   * 根据模型自动调整视角，提供默认视角是20度俯视
   * @param animate 是否使用动画过渡，默认 false
   */
  public enableSmartCamera(animate: boolean = false): void {
    // Calculate world extends of all meshes
    if (this.currentMeshes.length === 0) {
      return;
    }

    // Use Framing Behavior for auto-zoom and positioning
    // Note: FramingBehavior can conflict with manual GSAP animation if active.
    // For initial load animation, we might want to manually calculate target position/radius
    // instead of relying solely on FramingBehavior's auto transition if we want custom GSAP control.
    // However, FramingBehavior is very robust for bounds calculation.

    // Let's first calculate the target metrics manually to determine where we want to go.
    const worldExtends = this.scene.getWorldExtends((mesh: AbstractMesh) => this.currentMeshes.includes(mesh) && mesh.isVisible);

    const center = worldExtends.min.add(worldExtends.max).scale(0.5);
    const size = worldExtends.max.subtract(worldExtends.min);

    // Use shared optimal alpha calculation
    const targetAlpha = this.getOptimalAlpha(size);

    const targetBeta = this.options.pitchDegrees * (Math.PI / 180);

    // Calculate optimal radius to fit model in view
    // Get canvas aspect ratio
    const canvasWidth = this.engine.getRenderWidth();
    const canvasHeight = this.engine.getRenderHeight();
    const aspectRatio = canvasWidth / canvasHeight;

    // Determine the visible dimensions based on the camera angle (approximate)
    // We want to fit 'size' into the frustum.
    // For PerspectiveCamera (ArcRotateCamera uses perspective by default),
    // FOV is vertical field of view.
    // oxlint-disable-next-line prefer-destructuring
    const fov = this.camera.fov;

    // Calculate the distance required to fit the vertical dimension (Y or projected height)
    // The "vertical" size of the object from the camera's perspective depends on beta.
    // But a safe approximation is the bounding sphere radius or max dimension.
    // To be tighter:
    // If we look from side, width is max(x, z), height is y.

    // Let's use the bounding sphere radius for a safe fit, then tighten it.
    const boundingSphereRadius = Math.max(size.x, size.y, size.z) / 2;

    // Distance to fit vertically:
    // tan(fov/2) = radius / distance
    // distance = radius / tan(fov/2)
    let radius = boundingSphereRadius / Math.tan(fov / 2);

    // Adjust for aspect ratio if width is the limiting factor
    if (aspectRatio < 1) {
      // Portrait mode, width is smaller. Need to push back further.
      radius /= aspectRatio;
    }

    // Apply a small padding factor (e.g. 0.85x to reduce empty space and zoom in more)
    // Previous was 1.05x, user wants "closer".
    radius *= this.options.smartCameraPaddingFactor;

    // Set zoom limits to prevent clipping or getting lost
    // lowerRadiusLimit: Don't let camera go inside the model (bounding sphere)
    this.camera.lowerRadiusLimit = boundingSphereRadius * 1.1;
    // upperRadiusLimit: Don't let camera go too far (e.g. 5x initial distance)
    this.camera.upperRadiusLimit = radius * 5;

    // Adjust minZ to prevent near clipping when zoomed in
    this.camera.minZ = Math.min(0.1, boundingSphereRadius / 100);

    // If animate is requested
    if (animate) {
      // Disable FramingBehavior during manual animation to avoid conflict
      this.camera.useFramingBehavior = false;

      // Disable limits temporarily during animation to allow smooth transition
      // We will restore them after animation
      this.camera.lowerRadiusLimit = null;
      this.camera.upperRadiusLimit = null;

      // Ensure camera limits don't clamp our target immediately
      // (ArcRotateCamera clamps values in setter if limits are active)

      // Use a proxy object to animate values, then apply them in onUpdate
      // This ensures we control the application order and can debug easily
      const animState = {
        alpha: this.camera.alpha,
        beta: this.camera.beta,
        radius: this.camera.radius,
        targetX: this.camera.target.x,
        targetY: this.camera.target.y,
        targetZ: this.camera.target.z,
      };

      gsap.to(animState, {
        alpha: targetAlpha,
        beta: targetBeta,
        radius: radius,
        targetX: center.x,
        targetY: center.y,
        targetZ: center.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          this.camera.alpha = animState.alpha;
          this.camera.beta = animState.beta;
          this.camera.radius = animState.radius;
          this.camera.setTarget(new Vector3(animState.targetX, animState.targetY, animState.targetZ));
        },
        onComplete: () => {
          // Restore limits
          this.camera.lowerRadiusLimit = boundingSphereRadius * 1.1; // New limit
          this.camera.upperRadiusLimit = radius * 5; // New limit
        },
      });
    } else {
      // Instant set
      this.camera.useFramingBehavior = true;
      const framingBehavior = this.camera.getBehaviorByName("Framing") as FramingBehavior;

      if (framingBehavior) {
        framingBehavior.radiusScale = 0.1;
        framingBehavior.positionScale = 0.5;
        framingBehavior.defaultElevation = targetBeta;
      }

      // Apply calculated alpha/beta manual override if framing behavior doesn't enforce specific alpha
      // FramingBehavior mostly handles radius/target.
      this.camera.alpha = targetAlpha;
      this.camera.beta = targetBeta;

      // Trigger framing to center/zoom
      // Note: This might override manual beta if defaultElevation is set differently.
      // But we synced them.
      this.scene.getWorldExtends((mesh: AbstractMesh) => this.currentMeshes.includes(mesh) && mesh.isVisible);
      this.camera.setTarget(center);
      // We can trust FramingBehavior for radius or set manually
      this.camera.radius = radius;
    }
  }

  /**
   * 显示错误提示
   * @param message 错误提示消息
   * @param onRetry 重试回调函数
   */
  public showError(message: string): void {
    this.errorMask.show(message);
  }

  /**
   * 隐藏错误提示
   */
  public hideError(): void {
    this.errorMask.hide();
  }
}
