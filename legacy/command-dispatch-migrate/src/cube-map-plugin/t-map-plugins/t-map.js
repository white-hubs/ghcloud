import { transformGCJ02ToWGS84 } from "@isvend/coord-transform";

import { getAuth } from "../index";
import { CubeMapLeaflet } from "../map-leaflet/cube-map.es";

const themeMap = new Map([["amap://styles/darkblue", "url('#x-rays') hue-rotate(357deg) brightness(70%) saturate(90%) contrast(140%)"]]);
export class TMap {
  center = null;
  zoom = 11.2;
  events = {};
  #cubeMapLeaflet = null;
  mapType = "cube-map";
  mapInstance = null;
  constructor(container, { center, zoom, mapStyle }) {
    this.container = container;
    this.center = center;
    this.zoom = zoom;
    const [lng, lat] = Array.isArray(center) ? center : [center?.lng, center?.lat];
    this.options = {
      center: {
        lng: Number(lng),
        lat: Number(lat),
      },
    };
    this._init(mapStyle);
  }
  _init(mapStyle) {
    const auth = getAuth();
    this.#cubeMapLeaflet = new CubeMapLeaflet(auth);
    this.#cubeMapLeaflet.renderMap(this.container, this.options).then(() => {
      this.mapInstance = this.#cubeMapLeaflet.mapInstance;
      document.querySelector(".leaflet-tile-pane .leaflet-layer").style.filter = `${themeMap.get(mapStyle)}`;
      let tileStarted = 0;
      let tileFinished = 0;
      const reportTiles = () => {
        if (!tileStarted) return;
        const ratio = Math.min(1, tileFinished / tileStarted);
        window.updateAppSplashProgress?.(55 + ratio * 40, "正在加载地图瓦片（" + tileFinished + "/" + tileStarted + "）", "map");
      };
      this.mapInstance.on("tileloadstart", () => {
        tileStarted += 1;
        reportTiles();
      });
      this.mapInstance.on("tileload", () => {
        tileFinished += 1;
        reportTiles();
      });
      this.mapInstance.on("tileerror", () => {
        tileFinished += 1;
        reportTiles();
      });
      this.#cubeMapLeaflet.mapInstance.whenReady(() => {
        window.updateAppSplashProgress?.(96, "地图加载完成，即将进入系统", "map");
        this.addListener("complete");
      });
      this.setZoom(this.zoom);
    });
  }
  setCenter(lngLat) {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.setCenter(lngLat);
      });
      return;
    }
    const transformLngLat = transformGCJ02ToWGS84(+lngLat[0], +lngLat[1]);
    this.mapInstance.panTo([transformLngLat[1], transformLngLat[0]], {
      animate: false,
    });
  }
  setFitView(markers, options) {
    if (!markers || markers.length === 0) {
      return;
    }
    const bounds = L.latLngBounds();
    markers.forEach((marker) => {
      if (marker instanceof L.LatLng) {
        bounds.extend(marker);
      } else if ("getPosition" in marker) {
        const latlng = marker.getPosition();
        bounds.extend([latlng.lat, latlng.lng]);
      } else {
        bounds.extend(marker?.getLngLat() || marker?.getPosition());
      }
    });
    this.mapInstance.fitBounds(bounds, {
      animate: true,
      padding: [10, 10],
      maxZoom: 18,
      ...options,
    });
  }
  setZoom(zoom) {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.setZoom(zoom);
      });
      return;
    }
    this.mapInstance.setZoom(zoom);
  }
  getZoom() {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.getZoom();
      });
      return;
    }
    return this.mapInstance.getZoom();
  }
  setZoomAndCenter(zoom, lngLat) {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.setZoomAndCenter(zoom, lngLat);
      });
      return;
    }
    this.setZoom(zoom);
    this.setCenter(lngLat);
  }
  setRotation(angle, animation) {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.setRotation(angle, animation);
      });
      return;
    }
    this.#cubeMapLeaflet.setRotation(angle);
  }
  // 监听订阅执行
  on(eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
  }
  // 添加监听事件
  addListener(eventName, data) {
    const events = this.events[eventName] || [];
    events.forEach((callback) => {
      callback(data);
    });
  }
  //停止监听event事件
  off(eventName, callback) {
    let callbacks = this.events[eventName];
    this.events[eventName] = callbacks && callbacks.filter((fn) => fn !== callback);
  }
  //为事件注册单次监听器
  once(eventName, callback) {
    let wrapFunc = (...args) => {
      callback.apply(...args);
      this.off(eventName, wrapFunc);
    };
    this.on(eventName, wrapFunc);
  }
  add(marker) {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.add(marker);
      });
      return;
    }
    if (Array.isArray(marker)) {
      marker.forEach((mark) => {
        this.add(mark);
      });
      return;
    }
    marker.addTo(this.mapInstance);
  }
  remove(instance) {
    if (Array.isArray(instance)) {
      for (const inst of instance) {
        this.remove(inst);
      }
      return;
    }
    if (this.mapInstance.hasLayer(instance)) {
      this.mapInstance.removeLayer(instance);
    }
  }
  clearInfoWindow() {
    if (!this.mapInstance) {
      this.once("complete", () => {
        this.clearInfoWindow(marker);
      });
      return;
    }
    this.mapInstance.eachLayer((layer) => {
      if (layer instanceof L.Popup) {
        this.mapInstance.removeLayer(layer);
      }
    });
  }
}
