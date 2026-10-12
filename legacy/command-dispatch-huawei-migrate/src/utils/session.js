export function getSessionItemWithObject(token) {
  const cacheData = sessionStorage.getItem(token);
  if (cacheData) {
    return JSON.parse(cacheData);
  }
}

export function setSessionItemWithObject(token, data) {
  const cacheData = JSON.stringify(data);
  sessionStorage.setItem(token, cacheData);
}

export function getSessionItemWithNumber(token) {
  const cacheData = sessionStorage.getItem(token);
  if (cacheData) {
    return parseInt(cacheData);
  }
}

export function setSessionItemWithNumber(token, data) {
  sessionStorage.setItem(token, data + "");
}
