import { transformGCJ02ToWGS84 } from "@isvend/coord-transform";
export class TLngLat {
  constructor(lng, lat) {
    const gcj02 = transformGCJ02ToWGS84(+lng, +lat);
    return {
      lng: gcj02[0],
      lat: gcj02[1],
    };
  }
}
