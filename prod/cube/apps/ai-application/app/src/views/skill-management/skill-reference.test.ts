import { describe, expect, test } from "bun:test";

import { hasSkillReferenceContent, parseSkillReference, serializeSkillReference } from "./skill-reference";

describe("skill-reference", () => {
  test("parse legacy plain text as note", () => {
    const data = parseSkillReference("请参照公司模板");
    expect(data.files).toEqual([]);
    expect(data.note).toBe("请参照公司模板");
  });

  test("serialize and parse file payload", () => {
    const raw = serializeSkillReference({
      files: [
        {
          id: "f1",
          name: "模板.pdf",
          path: "https://example.com/template.pdf",
          type: "application/pdf",
          size: 1024,
        },
      ],
      note: "优先使用此模板",
    });
    expect(raw.startsWith("{")).toBe(true);
    const parsed = parseSkillReference(raw);
    expect(parsed.files).toHaveLength(1);
    expect(parsed.files[0]?.name).toBe("模板.pdf");
    expect(parsed.note).toBe("优先使用此模板");
    expect(hasSkillReferenceContent(parsed)).toBe(true);
  });

  test("serialize empty returns empty string", () => {
    expect(serializeSkillReference({ files: [] })).toBe("");
  });
});
