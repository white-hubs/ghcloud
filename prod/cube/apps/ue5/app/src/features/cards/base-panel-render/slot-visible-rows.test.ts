import { describe, expect, test } from "bun:test";

import { countVisibleTableRows, measureRollTableVisibleRows } from "./slot-visible-rows";

describe("countVisibleTableRows", () => {
  test("fits whole rows after reserving the header", () => {
    expect(countVisibleTableRows(32 + 36 * 5)).toBe(5);
    expect(countVisibleTableRows(32 + 36 * 4 + 20)).toBe(4);
  });

  test("defaults to one visible row when space is tight", () => {
    expect(countVisibleTableRows(40)).toBe(1);
  });

  test("clamps to the configured min and max", () => {
    expect(countVisibleTableRows(40, { min: 3, max: 8 })).toBe(3);
    expect(countVisibleTableRows(800, { min: 3, max: 6 })).toBe(6);
  });

  test("ignores invalid row heights", () => {
    expect(countVisibleTableRows(200, { rowHeight: 0 })).toBe(4);
  });
});

describe("measureRollTableVisibleRows", () => {
  test("measures body height from roll-table header and actual row height", () => {
    const surface = {
      clientHeight: 200,
      querySelector(selector: string) {
        if (selector !== ".roll-table") return null;
        return {
          clientHeight: 200,
          querySelector(innerSelector: string) {
            if (innerSelector === ".header") return { offsetHeight: 32 };
            if (innerSelector === ".table-tr") return { offsetHeight: 36 };
            return null;
          },
        };
      },
    } as unknown as HTMLElement;

    expect(measureRollTableVisibleRows(surface, { rowHeight: 36, min: 1, max: 8 })).toBe(4);
  });

  test("uses the allocated surface height even if the inner roll-table has already collapsed", () => {
    const surface = {
      clientHeight: 176,
      querySelector(selector: string) {
        if (selector !== ".roll-table") return null;
        return {
          clientHeight: 50,
          querySelector(innerSelector: string) {
            if (innerSelector === ".header") return { offsetHeight: 32 };
            if (innerSelector === ".table-tr") return { offsetHeight: 36 };
            return null;
          },
        };
      },
    } as unknown as HTMLElement;

    expect(measureRollTableVisibleRows(surface, { rowHeight: 36, min: 3, max: 8 })).toBe(4);
  });

  test("fits more rem-scaled rows when CSS row is shorter than design px", () => {
    const surface = {
      clientHeight: 176,
      querySelector(selector: string) {
        if (selector !== ".roll-table") return null;
        return {
          clientHeight: 176,
          querySelector(innerSelector: string) {
            if (innerSelector === ".header") return { offsetHeight: 21 };
            if (innerSelector === ".table-tr") return { offsetHeight: 24 };
            return null;
          },
        };
      },
    } as unknown as HTMLElement;

    expect(measureRollTableVisibleRows(surface, { rowHeight: 36, min: 1, max: 8 })).toBe(6);
  });
});
