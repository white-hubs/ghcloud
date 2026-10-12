import { describe, expect, it } from "vitest";

import { createDefaultPage, deserializePage, nodeToInstance, PageModelMigrator, serializePage } from "../page-serializer";

describe("page-serializer", () => {
  it("serializes and deserializes page model", () => {
    const page = createDefaultPage({
      id: "page-1",
      name: "Test Page",
      backgroundImage: "data:image/png;base64,dGVzdA==",
      elements: [],
    });

    const json = serializePage(page);
    const restored = deserializePage(json);

    expect(restored.id).toBe("page-1");
    expect(restored.name).toBe("Test Page");
    expect(restored.version).toBe("1.1");
    expect(restored.backgroundImage).toBe("data:image/png;base64,dGVzdA==");
  });

  it("fills defaults for missing fields during deserialize", () => {
    const restored = deserializePage(
      JSON.stringify({
        version: "1.0",
        id: "legacy-page",
        name: "Legacy",
      }),
    );

    expect(restored.width).toBe(1920);
    expect(restored.height).toBe(1080);
    expect(restored.grid.size).toBe(10);
    expect(restored.aliases).toEqual([]);
    expect(restored.elements).toEqual([]);
    expect(restored.connections).toEqual([]);
    expect(restored.backgroundImage).toBeUndefined();
  });

  it("normalizes opacity for current and legacy elements", () => {
    const baseElement = {
      id: "node-1",
      type: "test",
      x: 0,
      y: 0,
      width: 100,
      height: 80,
      rotation: 0,
      zIndex: 1,
      locked: false,
      visible: true,
      props: {},
      bindings: [],
      eventHandlers: [],
    };
    const restored = deserializePage(
      JSON.stringify({
        version: "1.1",
        id: "opacity-page",
        elements: [baseElement, { ...baseElement, id: "node-2", opacity: 2 }],
      }),
    );

    expect(restored.elements.map((element) => element.opacity)).toEqual([1, 1]);
  });

  it("reads opacity from graph node data when saving", () => {
    const instance = nodeToInstance({
      id: "node-1",
      getPosition: () => ({ x: 10, y: 20 }),
      getSize: () => ({ width: 120, height: 90 }),
      getAngle: () => 45,
      getZIndex: () => 2,
      getData: () => ({ elementType: "test", elementProps: {}, opacity: 0.35 }),
    });

    expect(instance.opacity).toBe(0.35);
  });

  it("reads initial visibility from graph node data when saving", () => {
    const hidden = nodeToInstance({
      id: "hidden-node",
      getPosition: () => ({ x: 10, y: 20 }),
      getSize: () => ({ width: 120, height: 90 }),
      getData: () => ({ elementType: "test", elementProps: {}, visible: false }),
    });
    const legacy = nodeToInstance({
      id: "legacy-node",
      getPosition: () => ({ x: 0, y: 0 }),
      getSize: () => ({ width: 100, height: 100 }),
      getData: () => ({ elementType: "test", elementProps: {} }),
    });

    expect(hidden.visible).toBe(false);
    expect(legacy.visible).toBe(true);

    const restored = deserializePage(
      JSON.stringify({
        version: "1.1",
        id: "visibility-page",
        elements: [hidden, { ...legacy, visible: undefined }],
      }),
    );
    expect(restored.elements.map((element) => element.visible)).toEqual([false, true]);
  });

  it("preserves product-property metadata on logical tag bindings", () => {
    const instance = nodeToInstance({
      id: "gauge-1",
      getPosition: () => ({ x: 0, y: 0 }),
      getSize: () => ({ width: 60, height: 80 }),
      getData: () => ({
        elementType: "gauge",
        elementProps: {},
        bindings: [
          {
            id: "binding-1",
            propName: "value",
            tagName: "gauge.current",
            productProperty: {
              propCode: "remainingCurrent",
              propName: "剩余电流",
              dataType: "double",
            },
          },
        ],
      }),
    });

    expect(instance.bindings).toEqual([
      expect.objectContaining({
        propName: "value",
        tagName: "gauge.current",
        productProperty: expect.objectContaining({ propCode: "remainingCurrent", dataType: "double" }),
      }),
    ]);
  });

  it("migrates through registered steps", () => {
    const migrator = new PageModelMigrator();
    migrator
      .register("0.9", "1.0", (raw) => ({
        ...raw,
        background: raw.background ?? "#000000",
      }))
      .register("1.0", "1.1", (raw) => ({
        ...raw,
        name: raw.name ?? "Migrated",
      }));

    const migrated = migrator.migrate(
      {
        version: "0.9",
        id: "p-1",
      },
      "1.1",
    );

    expect(migrated.version).toBe("1.1");
    expect(migrated.background).toBe("#000000");
    expect(migrated.name).toBe("Migrated");
  });
});
