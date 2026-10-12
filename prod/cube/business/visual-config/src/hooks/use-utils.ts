export const useUtils = (): {
  getVisualType: (type: string) => string;
  getProjectId: () => string;
} => {
  const getVisualType = (type: string): string => {
    switch (type) {
      case 'views':
        return 'UE5'
      case 'views-2d':
        return '组态链接'
      case 'views-three':
        return 'WEBGL-ThreeJS'
      case 'views-3d':
        return 'WEBGL-BabylonJS'
      default:
        return 'UE5'
    }
  }
  const getProjectId = (): string => {
    const url = window.location.href
    const index = url.indexOf('?')
    if (index === -1) {
      return ''
    }
    const queryString = url.substring(index + 1)
    const params = new URLSearchParams(queryString)
    const projectId = params.get('projectId')
    return projectId ?? ''
  }

  return {
    getVisualType,
    getProjectId
  }
}
