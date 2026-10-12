import { initAMapPlugin } from "./amap-plugins/index";
import { getAuth } from "./index";
import { CubeMapLeaflet } from "./map-leaflet/cube-map.es";
import { MapPlugin } from "./t-map-plugins";
export const initMap = async () => {
  const auth = getAuth();
  const mapLeaflet = new CubeMapLeaflet(auth);
  await mapLeaflet.getMapConfig();
  window.mapType = mapLeaflet.mapType;
  if (mapLeaflet.mapType === "gdMap") {
    await initAMapPlugin();
    return;
  }
  window.AMap = MapPlugin;
};
(async () => {
  await initMap();
})();
