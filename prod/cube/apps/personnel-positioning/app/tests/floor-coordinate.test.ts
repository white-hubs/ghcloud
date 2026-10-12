import { describe, expect, test } from "bun:test";

import { parseFloorCoordinateAxis, projectFloorCoordinate } from "../src/utils/floor-coordinate";

describe("楼层平面图二维坐标系", () => {
  test("把左下角原点的实际坐标映射到左上角原点的图片百分比位置", () => {
    const axis = parseFloorCoordinateAxis('{"bottomLeft":{"x":0,"y":0},"topRight":{"x":21,"y":17.6}}');
    expect(axis).not.toBeNull();
    expect(projectFloorCoordinate({ x: 0, y: 0 }, axis)).toEqual({ x: 0, y: 100 });
    expect(projectFloorCoordinate({ x: 21, y: 17.6 }, axis)).toEqual({ x: 100, y: 0 });
    expect(projectFloorCoordinate({ x: 10.5, y: 8.8 }, axis)).toEqual({ x: 50, y: 50 });
    expect(projectFloorCoordinate({ x: 5.25, y: 4.4 }, axis)).toEqual({ x: 25, y: 75 });
  });

  test("支持非零原点，超出图片坐标范围的点不落图", () => {
    const axis = parseFloorCoordinateAxis('{"bottomLeft":{"x":-5,"y":10},"topRight":{"x":15,"y":30}}');
    expect(projectFloorCoordinate({ x: 0, y: 15 }, axis)).toEqual({ x: 25, y: 75 });
    expect(projectFloorCoordinate({ x: 16, y: 15 }, axis)).toBeNull();
    expect(projectFloorCoordinate({ x: 0, y: 9 }, axis)).toBeNull();
    expect(projectFloorCoordinate({ x: Number.NaN, y: 15 }, axis)).toBeNull();
  });

  test("无效配置不参与坐标换算", () => {
    for (const value of [null, "", "{", "{}", '{"bottomLeft":{"x":0,"y":0},"topRight":{"x":0,"y":17.6}}', '{"bottomLeft":{"x":"0","y":0},"topRight":{"x":21,"y":17.6}}']) {
      expect(parseFloorCoordinateAxis(value)).toBeNull();
    }
    expect(projectFloorCoordinate({ x: 10, y: 10 }, null)).toBeNull();
  });
});
