const APPLICATION_CODE = "WORK_PERMIT_MANAGE";
const APPLICATION_NAME = "危险作业";

interface CurrentApplication {
  code?: string;
  name?: string;
}

const readCurrentApplication = (): CurrentApplication | null => {
  try {
    const raw = sessionStorage.getItem("GH-currentApplication");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as CurrentApplication;
  } catch {
    return null;
  }
};

export const getCurrentApplicationCode = (): string => {
  return readCurrentApplication()?.code ?? APPLICATION_CODE;
};

export const getCurrentApplicationName = (): string => {
  return readCurrentApplication()?.name ?? APPLICATION_NAME;
};
