import dayjs from "dayjs";

const ID_CARD_PATTERN = /^[1-9]\d{16}(\d|X|x)$/;
const ID_CARD_FACTORS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CARD_CHECK_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
const VALID_AREA_CODES = new Set([
  "11",
  "12",
  "13",
  "14",
  "15",
  "21",
  "22",
  "23",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "50",
  "51",
  "52",
  "53",
  "54",
  "61",
  "62",
  "63",
  "64",
  "65",
  "71",
  "81",
  "82",
  "83",
  "91",
]);

const parseDate = (value: unknown) => {
  if (!value) {
    return null;
  }
  const date = dayjs(value as string | number | Date);
  return date.isValid() ? date : null;
};

const isValidIdCardBirthDate = (year: string, month: string, day: string) => {
  const date = dayjs(`${year}-${month}-${day}`);
  return (
    date.isValid() &&
    date.year().toString() === year &&
    String(date.month() + 1).padStart(2, "0") === month &&
    String(date.date()).padStart(2, "0") === day
  );
};

export const parseIdCardInfo = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  const idCard = value.trim();
  if (!ID_CARD_PATTERN.test(idCard) || !VALID_AREA_CODES.has(idCard.slice(0, 2))) {
    return null;
  }

  const year = idCard.slice(6, 10);
  const month = idCard.slice(10, 12);
  const day = idCard.slice(12, 14);
  if (!isValidIdCardBirthDate(year, month, day)) {
    return null;
  }

  const sum = ID_CARD_FACTORS.reduce((total, factor, index) => total + Number(idCard[index]) * factor, 0);
  if (ID_CARD_CHECK_CODES[sum % 11] !== idCard[17].toUpperCase()) {
    return null;
  }

  return {
    dateOfBirth: `${year}-${month}-${day}`,
    gender: Number(idCard[16]) % 2 === 1 ? "MALE" : "FEMALE",
  };
};

export const calculateAge = (dateOfBirth: unknown) => {
  const birthDate = parseDate(dateOfBirth);
  if (!birthDate) {
    return null;
  }
  const today = dayjs();
  if (birthDate.isAfter(today, "day")) {
    return 0;
  }
  let age = today.year() - birthDate.year();
  if (today.isBefore(birthDate.add(age, "year"), "day")) {
    age -= 1;
  }
  return Math.max(age, 0);
};

export const calculateCeilYears = (startDateValue: unknown) => {
  const startDate = parseDate(startDateValue);
  if (!startDate) {
    return null;
  }
  const today = dayjs();
  if (startDate.isAfter(today, "day")) {
    return 0;
  }
  const fullYears = today.diff(startDate, "year");
  if (fullYears === 0) {
    return 1;
  }
  return startDate.add(fullYears, "year").isSame(today, "day") ? fullYears : fullYears + 1;
};

export const applyRosterDerivedFields = <T extends Record<string, any>>(form: T) => {
  const idCardInfo = parseIdCardInfo(form.idCard);
  if (idCardInfo) {
    form.dateOfBirth = idCardInfo.dateOfBirth;
    form.gender = idCardInfo.gender;
  }

  const age = calculateAge(form.dateOfBirth);
  if (age !== null) {
    form.age = age;
  }

  const companyYears = calculateCeilYears(form.inductionDate);
  if (companyYears !== null) {
    form.companyYears = companyYears;
  }

  const workingYears = calculateCeilYears(form.paySocialInsuranceFirstDate);
  if (workingYears !== null) {
    form.workingYears = workingYears;
  }

  return form;
};

export const getRosterDerivedDisplayValue = (record: Record<string, any>, field: string) => {
  const idCardInfo = parseIdCardInfo(record.idCard);
  if (field === "age") {
    return calculateAge(idCardInfo?.dateOfBirth ?? record.dateOfBirth) ?? record.age;
  }
  if (field === "companyYears") {
    return calculateCeilYears(record.inductionDate) ?? record.companyYears;
  }
  if (field === "workingYears") {
    return calculateCeilYears(record.paySocialInsuranceFirstDate) ?? record.workingYears;
  }
  return record[field];
};
