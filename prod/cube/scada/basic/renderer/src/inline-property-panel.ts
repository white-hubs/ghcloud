const EMPTY_PANEL_TEXT = "（未绑定产品字段）";

export interface InlinePropertyPanelRow {
  label: string;
  value: string;
}

export interface InlinePropertyPanelModel {
  rows: InlinePropertyPanelRow[];
  columns: number;
  labelStyle: { fontSize: string; color: string };
  valueStyle: { fontSize: string; color: string };
}

function fontSize(value: unknown, fallback: number): string {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return `${Number.isFinite(parsed) ? parsed : fallback}px`;
}

function color(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function columns(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(4, Math.max(1, Math.round(parsed)));
}

function lineSeparatorIndex(line: string): number {
  const ascii = line.indexOf(":");
  const chinese = line.indexOf("：");
  if (ascii < 0) return chinese;
  if (chinese < 0) return ascii;
  return Math.min(ascii, chinese);
}

export function buildInlinePropertyPanelModel(props: Record<string, unknown>): InlinePropertyPanelModel {
  const body = String(props.displayBody ?? EMPTY_PANEL_TEXT);
  const rows = body.split(/\r?\n/).map((line) => {
    const separator = lineSeparatorIndex(line);
    if (separator <= 0) return { label: "", value: line };
    return {
      label: line.slice(0, separator).trim(),
      value: line.slice(separator + 1).trimStart(),
    };
  });

  return {
    rows,
    columns: columns(props.columns),
    labelStyle: {
      fontSize: fontSize(props.fontSize, 12),
      color: color(props.fill, "#1a1a1a"),
    },
    valueStyle: {
      fontSize: fontSize(props.valueFontSize, 12),
      color: color(props.valueFill, "#1a1a1a"),
    },
  };
}

export function renderInlinePropertyPanel(root: Element, props: Record<string, unknown>): void {
  const panel = root.querySelector("#panel-text");
  if (!panel || typeof HTMLElement === "undefined" || !(panel instanceof HTMLElement)) return;

  const model = buildInlinePropertyPanelModel(props);
  panel.style.display = "grid";
  panel.style.gridTemplateColumns = `repeat(${model.columns}, minmax(0, 1fr))`;
  const fragment = document.createDocumentFragment();
  for (const row of model.rows) {
    const rowElement = document.createElement("div");
    rowElement.className = "scada-property-panel-row";

    if (row.label) {
      const labelElement = document.createElement("span");
      labelElement.className = "scada-property-panel-label";
      labelElement.textContent = `${row.label}:`;
      Object.assign(labelElement.style, model.labelStyle);
      rowElement.append(labelElement);
    } else {
      rowElement.classList.add("is-message");
    }

    const valueElement = document.createElement("span");
    valueElement.className = "scada-property-panel-value";
    valueElement.textContent = row.value;
    Object.assign(valueElement.style, model.valueStyle);
    rowElement.append(valueElement);
    fragment.append(rowElement);
  }
  panel.replaceChildren(fragment);
}
