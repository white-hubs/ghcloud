function getI18nKey(path) {
  const keys = path
    .split("/")
    .filter((item) => !item.startsWith(":") && item != "");
  keys.push("name");
  return keys.join(".");
}
export { getI18nKey };
