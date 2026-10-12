import { describe, expect, it } from "vitest";

import { parseSvgElement } from "../parse-svg-element";

describe("parseSvgElement", () => {
  it("parses extended prop schema fields", () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:scada="http://cube-scada.io/ns/v1" viewBox="0 0 100 100">
  <metadata>
    <scada:element>
      <scada:meta type="fan" label="Fan" category="Industrial" version="1.0.0"/>
      <scada:props>
        <scada:prop name="speed" type="number" label="Speed" default="1000" min="0" max="3000" step="100" precision="0" unit="ms" domain="observe" semantic="status.speed" required="true" bindable="true" controllable="false" allowTransparent="true"/>
      </scada:props>
      <scada:mappings/>
      <scada:animations/>
    </scada:element>
  </metadata>
  <circle cx="50" cy="50" r="40" />
</svg>`;

    const def = parseSvgElement(svg);
    expect(def.propsSchema[0]).toMatchObject({
      name: "speed",
      domain: "observe",
      semantic: "status.speed",
      required: true,
      bindable: true,
      controllable: false,
      step: 100,
      precision: 0,
      unit: "ms",
      allowTransparent: true,
    });
  });

  it("falls back to observe domain for legacy props", () => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:scada="http://cube-scada.io/ns/v1" viewBox="0 0 100 100">
  <metadata>
    <scada:element>
      <scada:meta type="legacy" label="Legacy" category="Industrial" version="1.0.0"/>
      <scada:props>
        <scada:prop name="running" type="boolean" label="Running" default="false"/>
      </scada:props>
      <scada:mappings/>
      <scada:animations/>
    </scada:element>
  </metadata>
  <circle cx="50" cy="50" r="40" />
</svg>`;

    const def = parseSvgElement(svg);
    expect(def.propsSchema[0].domain).toBe("observe");
    expect(def.propsSchema[0].bindable).toBe(true);
    expect(def.propsSchema[0].controllable).toBe(false);
  });

  it("parses uploaded image asset metadata", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:scada="http://cube-scada.io/ns/v1" viewBox="0 0 320 180">
  <metadata>
    <scada:element>
      <scada:meta type="custom-image-demo" label="水泵照片" category="设备图片" version="1.0.0" assetKind="image" assetGroup="设备图片"/>
      <scada:props/>
      <scada:mappings/>
      <scada:animations/>
    </scada:element>
  </metadata>
  <image href="data:image/png;base64,AA==" width="320" height="180"/>
</svg>`;

    const def = parseSvgElement(svg);

    expect(def.assetKind).toBe("image");
    expect(def.assetGroup).toBe("设备图片");
    expect(def.category).toBe("设备图片");
  });

  it("preserves an explicit SVG aspect-ratio mode for stretchable elements", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:scada="http://cube-scada.io/ns/v1" viewBox="0 0 100 60" preserveAspectRatio="none">
  <metadata>
    <scada:element>
      <scada:meta type="stretchable-rect" label="Stretchable Rect" category="Basic" version="1.0.0"/>
      <scada:props/>
      <scada:mappings/>
      <scada:animations/>
    </scada:element>
  </metadata>
  <rect width="100" height="60"/>
</svg>`;

    const def = parseSvgElement(svg);

    expect(def.svgBody).toContain('preserveAspectRatio="none"');
  });
});
