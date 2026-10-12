import { CubeElectronicGuidePublicPointTypeService, CubeElectronicGuideDevicePublicService, CubeElectronicGuidePublicRegionService, CubeElectronicGuidePointPublicService, CubeElectronicGuideLayerPublicService } from '@ghcloud/electronic-guide-service'
export const regionService = new CubeElectronicGuidePublicRegionService()
export const pointTypeService = new CubeElectronicGuidePublicPointTypeService()
export const pointService = new CubeElectronicGuidePointPublicService()
export const deviceService = new CubeElectronicGuideDevicePublicService()
export const layerService = new CubeElectronicGuideLayerPublicService()
