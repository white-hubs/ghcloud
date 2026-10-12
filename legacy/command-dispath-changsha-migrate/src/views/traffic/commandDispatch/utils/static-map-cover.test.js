import { describe, expect, test } from "bun:test";

import { calculateCoverLayout, projectNormalizedPoint } from "./static-map-cover";

describe("static map cover projection", () => {
  test("centers a source-image point when cover crops vertically", () => {
    const layout = calculateCoverLayout({
      containerWidth: 1920,
      containerHeight: 900,
      imageWidth: 2568,
      imageHeight: 1478,
    });

    expect(layout).not.toBeNull();
    expect(layout.offsetX).toBeCloseTo(0);
    expect(layout.offsetY).toBeLessThan(0);
    expect(projectNormalizedPoint({ x: 0.5, y: 0.5 }, layout)).toEqual({
      left: 960,
      top: 450,
    });
  });

  test("centers a source-image point when cover crops horizontally", () => {
    const layout = calculateCoverLayout({
      containerWidth: 900,
      containerHeight: 1200,
      imageWidth: 2568,
      imageHeight: 1478,
    });

    expect(layout).not.toBeNull();
    expect(layout.offsetX).toBeLessThan(0);
    expect(layout.offsetY).toBeCloseTo(0);
    expect(projectNormalizedPoint({ x: 0.5, y: 0.5 }, layout)).toEqual({
      left: 450,
      top: 600,
    });
  });

  test("projects non-central points through cover scale and offsets", () => {
    const layout = calculateCoverLayout({
      containerWidth: 1000,
      containerHeight: 500,
      imageWidth: 1000,
      imageHeight: 1000,
    });

    expect(projectNormalizedPoint({ x: 0.25, y: 0.75 }, layout)).toEqual({
      left: 250,
      top: 500,
    });
  });

  test("rejects invalid dimensions and normalized coordinates", () => {
    expect(
      calculateCoverLayout({
        containerWidth: 0,
        containerHeight: 500,
        imageWidth: 1000,
        imageHeight: 1000,
      }),
    ).toBeNull();

    const layout = calculateCoverLayout({
      containerWidth: 1000,
      containerHeight: 500,
      imageWidth: 1000,
      imageHeight: 1000,
    });

    expect(projectNormalizedPoint({ x: -0.1, y: 0.5 }, layout)).toBeNull();
    expect(projectNormalizedPoint({ x: 0.5, y: 1.1 }, layout)).toBeNull();
    expect(projectNormalizedPoint({ x: "invalid", y: 0.5 }, layout)).toBeNull();
  });
});
