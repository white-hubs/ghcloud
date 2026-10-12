interface UserFunctionRole {
  code?: string;
}

export const hasAiInspectionPermission = (code: string): boolean => {
  try {
    const roles = JSON.parse(sessionStorage.getItem("user-function-roles") ?? "[]") as UserFunctionRole[];
    return roles.some((item) => item.code === code);
  } catch {
    return false;
  }
};
