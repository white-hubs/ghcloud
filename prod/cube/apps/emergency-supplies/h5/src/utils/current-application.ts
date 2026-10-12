const APPLICATION_CODE = "EMERGENCY_SUPPLIES";

export const getCurrentApplicationCode = (): string => {
  try {
    const application = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string) as { code?: string };
    return application?.code ?? APPLICATION_CODE;
  } catch {
    return APPLICATION_CODE;
  }
};
