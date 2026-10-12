/**
 * 不同端特性开关，目前仅业务PC端使用特性开关
 * 特性开关配置在window.config.feature中
 * 特性开关配置的key值为特性开关的名称，value为特性开关的状态或者值
 */

declare const window: {
  config: {
    feature: {
      "usePersonal": boolean;
      "useBusinessDelete": boolean;
      "loginStyle": string;
      "useUploadTemporary": boolean;
    };
  };
}


interface BimopsWebManageFeature {
  usePersonal: boolean;
  useBusinessDelete: boolean;
  loginStyle: string;
  useUploadTemporary: boolean;
}


interface UseFeature {
  getBimopsWebManageFeature: () => BimopsWebManageFeature;
}


/**
 * 开河特性开关
 * @returns UseFeature
 */
export const useFeature = (): UseFeature => {
  /**
   * 获取业务PC端特性开关
   * @returns BimopsWebManageFeature
   */
  const getBimopsWebManageFeature = (): BimopsWebManageFeature => {
    return {
      usePersonal: window.config.feature?.usePersonal ?? false,
      useBusinessDelete: window.config.feature?.useBusinessDelete ?? false,
      loginStyle: window.config.feature?.loginStyle ?? "asyncLoginTemplate",
      useUploadTemporary: window.config.feature?.useUploadTemporary ?? false,
    }
  }

  return {
    getBimopsWebManageFeature
  }
}
