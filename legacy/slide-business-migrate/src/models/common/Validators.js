import idcard from "@/utils/idcard";
export function isPhone(phone) {
  return /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(phone);
}
export function isEmail(email) {
  return /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(email);
}

export function isIDCardNumber(number) {
  return idcard.checkEssential(number);
}

/**
 * 至少8个字符最多20个字符
 * 必须包含数字和字母
 */
export function isValidPassword(value) {
  if (value.length < 8 || value.length > 20) {
    return false;
  }
  if (!/^(?=.*[a-zA-Z])(?=.*\d).*$/.test(value)) {
    return false;
  }
  return true;
}

export function isValidIsbn(isbn) {
  return /(^\d{8,15}(\d|X)$)/.test(isbn);
}

export function isValidUsername(username) {
  return /^[a-zA-Z][a-zA-Z0-9]+$/.test(username);
}

export function exgHour(hour) {
  return /^([0-5][0-9]):([0-5][0-9]),+$/.test(hour);
}
