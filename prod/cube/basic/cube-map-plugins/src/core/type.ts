import type L from 'leaflet'

export type MapType = 'gdMap' | 't-map' | 'TD_MAP'

export interface MapConfig {
  andriodKey: string;
  iosKey: string;
  webKey: string;
  securityJsCode: string;
}

export type GeoJSONParameters = ConstructorParameters<typeof L.GeoJSON>;
