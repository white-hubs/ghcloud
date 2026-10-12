// oxlint-disable no-negated-condition
// oxlint-disable no-inline-comments
// oxlint-disable max-lines-per-function
// oxlint-disable no-console
// oxlint-disable no-alert
// oxlint-disable no-magic-numbers
import { CubeGridVis } from "../sdk";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;

const sdk = new CubeGridVis(canvas);

// Sample models (using BabylonJS playground assets or placeholder)
// Note: These URLs require internet access.
// const DUCK_URL = 'https://models.babylonjs.com/Duck/Duck.gltf';
// const BOX_URL = 'https://models.babylonjs.com/box.glb';

async function init() {
  await sdk.init();
  statusDiv.innerText = "SDK Initialized";

  // File upload handler
  const fileInput = document.getElementById("file-upload") as HTMLInputElement;
  fileInput?.addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      statusDiv.innerText = `Loading ${file.name}...`;
      try {
        // Check if append mode is checked
        const appendCheckbox = document.getElementById("chk-append-model") as HTMLInputElement;
        const appendMode = appendCheckbox?.checked || false;

        // Use unified loadModel interface
        // releasePreviousModel = !appendMode
        await sdk.loadModel(file, !appendMode);

        statusDiv.innerText = `${file.name} Loaded (Append: ${appendMode})`;

        // Optional: Revoke object URL after a while or manage it
        // URL.revokeObjectURL(objectUrl);
      } catch (e) {
        statusDiv.innerText = `Error loading ${file.name}`;
      } finally {
        // Reset input so same file can be selected again
        fileInput.value = "";
      }
    }
  });

  document.getElementById("btn-screenshot")?.addEventListener("click", async () => {
    try {
      const data = await sdk.takeScreenshot();
      // Show image in a popup or console

      // Remove existing preview if any
      const existingImg = document.getElementById("screenshot-preview");
      if (existingImg) {
        existingImg.remove();
      }

      const img = new Image();
      img.id = "screenshot-preview";
      img.src = data;
      img.style.position = "fixed"; // Use fixed to be on top of everything
      img.style.top = "50%";
      img.style.left = "50%";
      img.style.transform = "translate(-50%, -50%)";
      img.style.border = "4px solid #fff";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
      img.style.maxWidth = "80%";
      img.style.maxHeight = "80%";
      img.style.zIndex = "9999"; // Ensure it's very high
      img.style.cursor = "pointer";
      img.title = "Click to close";

      img.onclick = () => img.remove();
      document.body.appendChild(img);
      statusDiv.innerText = "Screenshot captured (Click image to close)";
    } catch (e) {
      statusDiv.innerText = "Screenshot failed";
    }
  });

  document.getElementById("btn-smart-cam")?.addEventListener("click", () => {
    sdk.enableSmartCamera(true); // Enable animation on reset
    statusDiv.innerText = "Smart Camera Reset";
  });

  document.getElementById("btn-top-view")?.addEventListener("click", () => {
    sdk.enableTopView(true); // Enable animation
    statusDiv.innerText = "Top View Enabled";
  });

  document.getElementById("btn-add-labels")?.addEventListener("click", () => {
    sdk.addLabelsToSubGrids("sub_grid_"); // Optional: Pass prefix if needed
    statusDiv.innerText = "Labels Added";
  });

  document.getElementById("btn-dispose")?.addEventListener("click", () => {
    sdk.dispose();
    statusDiv.innerText = "SDK Disposed";
  });

  // URL Load Handler
  document.getElementById("btn-load-url")?.addEventListener("click", async () => {
    const urlInput = document.getElementById("model-url-input") as HTMLInputElement;
    const url = urlInput?.value?.trim();

    if (url) {
      statusDiv.innerText = `Loading URL: ${url}...`;
      try {
        // Check if append mode is checked
        const appendCheckbox = document.getElementById("chk-append-model") as HTMLInputElement;
        const appendMode = appendCheckbox?.checked || false;

        await sdk.loadModel(url, !appendMode);
        statusDiv.innerText = `Loaded URL (Append: ${appendMode})`;
      } catch (e) {
        statusDiv.innerText = "Error loading URL";
      }
    } else {
      alert("Please enter a valid URL");
    }
  });

  // FPS Monitoring Demo
  const fpsDiv = document.getElementById("fps-stats")!;

  // 1. Listen for low FPS events
  sdk.onLowFpsObservable.add((fps) => {
    fpsDiv.style.color = "red";
    fpsDiv.innerText = `FPS: ${fps.toFixed(1)} (Low Performance Detected!)`;
  });

  // 2. Poll FPS for display (optional, just to show current FPS)
  setInterval(() => {
    try {
      const fps = sdk.getFps();
      if (isFinite(fps)) {
        // Only update if not in "Low FPS" warning state or update normally
        if (fpsDiv.style.color !== "red") {
          fpsDiv.innerText = `FPS: ${fps.toFixed(1)}`;
        } else {
          // Append current if warning
          fpsDiv.innerText = `FPS: ${fps.toFixed(1)} (Low Performance Detected!)`;
          // Reset color if recovered?
          if (fps >= 30) {
            fpsDiv.style.color = "#666";
          }
        }
      }
    } catch (e) {
      // SDK might be disposed
      fpsDiv.innerText = "FPS: - (SDK Disposed)";
    }
  }, 1000);
}

init();
