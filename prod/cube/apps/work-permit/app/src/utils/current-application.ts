export const getCurrentApplicationCode = (): string => {
  try {
    const application = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string) as { code?: string };
    return application?.code ?? __ENV__.applicationCode ?? "";
  } catch {
    return __ENV__.applicationCode ?? "";
  }
};
