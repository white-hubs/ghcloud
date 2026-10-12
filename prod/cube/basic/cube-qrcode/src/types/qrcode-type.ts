export interface QrCode {
  id: string;
  code: string;
  name: string;
  entityType: string;
  entityTypeName: string;
  entityId: string;
  entityName: string;
  styleId: string;
  configJson: DesignConfig;
  serialNumber: string;
}

export interface Component {
  top: number;
  left: number;
  name: string;
  width: number;
  height: number;
}

export interface Layer {
  option: {
    fontSize: string;
    color: string;
    fontWeight: string;
    backgroundColor: string;
    textAlign: string;
    textDecoration: string;
  };
  text: string;
  component: Component;
  imgId: string;
  index: string;
  id: string;
  type: string;
  url: string;
}

export interface DesignConfig {
  backgroundColor: string;
  imgId: string;
  backgroundImage: string;
  name: string;
  width: string;
  layers: Layer[];
  height: string;
}
