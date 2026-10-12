export const VISUAL_DATA_MODAL_POPOVER_CLASS = "visual-data-modal-popover";
export const POPOVER_CLASS = VISUAL_DATA_MODAL_POPOVER_CLASS;

export const getVisualDataModalPopupContainer = (): HTMLElement => document.body;
export const getPopupContainer = getVisualDataModalPopupContainer;

export const toDisplayText = (value?: string | number | null): string =>
  value === undefined || value === null || value === "" ? "--" : String(value);

type PopoverTextOptions = {
  color?: string;
  className?: string;
};

export const renderPopoverText = (value?: string | number | null, options?: PopoverTextOptions): JSX.Element => {
  const displayText = toDisplayText(value);
  const textStyle = options?.color ? { color: options.color } : undefined;
  const className = options?.className ?? "device-record-cell-text";

  if (displayText === "--") {
    return (
      <span class={className} style={textStyle}>
        {displayText}
      </span>
    );
  }

  return (
    <a-popover
      content={displayText}
      placement="top"
      overlayClassName={VISUAL_DATA_MODAL_POPOVER_CLASS}
      getPopupContainer={getVisualDataModalPopupContainer}
    >
      <span class={className} style={textStyle}>
        {displayText}
      </span>
    </a-popover>
  );
};

const extractRenderedText = (value: unknown): string => {
  if (value === null || value === undefined || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map(extractRenderedText)
      .filter((part) => part.length > 0)
      .join("");
  }
  if (typeof value === "object") {
    const node = value as {
      children?: unknown;
      props?: { children?: unknown };
    };
    if (node.children !== undefined && node.children !== null) {
      const fromChildren = extractRenderedText(node.children);
      if (fromChildren) return fromChildren;
    }
    if (node.props?.children !== undefined && node.props?.children !== null) {
      const fromPropsChildren = extractRenderedText(node.props.children);
      if (fromPropsChildren) return fromPropsChildren;
    }
  }
  return "";
};

const resolvePopoverText = (rendered: unknown, rawText?: unknown): string => {
  const renderedText = extractRenderedText(rendered);
  if (renderedText) {
    return toDisplayText(renderedText);
  }
  if (typeof rendered === "string" || typeof rendered === "number") {
    return toDisplayText(rendered);
  }
  if (rendered && typeof rendered === "object") {
    return "";
  }
  return toDisplayText(rawText as string | number | null);
};

export const wrapPopoverCell = (content: unknown, popoverText?: string): JSX.Element => {
  const resolvedText = popoverText ?? extractRenderedText(content);

  if (!resolvedText || resolvedText === "--") {
    if (content && typeof content === "object") {
      return content as JSX.Element;
    }
    return renderPopoverText(resolvedText || "--");
  }

  if (content && typeof content === "object") {
    return (
      <a-popover
        content={resolvedText}
        placement="top"
        overlayClassName={VISUAL_DATA_MODAL_POPOVER_CLASS}
        getPopupContainer={getVisualDataModalPopupContainer}
      >
        {content as JSX.Element}
      </a-popover>
    );
  }

  return renderPopoverText(resolvedText);
};

type ColumnRenderContext = {
  text?: unknown;
  record?: Record<string, unknown>;
  index?: number;
};

export type PopoverColumn = {
  title: string;
  dataIndex?: string;
  key?: string;
  customRender?: (ctx: ColumnRenderContext) => unknown;
  skipPopover?: boolean;
  [key: string]: unknown;
};

const shouldSkipPopover = (col: PopoverColumn): boolean => {
  if (col.skipPopover) return true;
  const key = String(col.key ?? "");
  return key === "action" || key === "operation";
};

export const withPopoverColumns = <T extends PopoverColumn>(columns: T[]): T[] =>
  columns.map((col) => {
    if (shouldSkipPopover(col)) {
      return col;
    }

    const originalRender = col.customRender;
    return {
      ...col,
      customRender: (ctx: ColumnRenderContext) => {
        if (originalRender) {
          const rendered = originalRender(ctx);
          const popoverText = resolvePopoverText(rendered, ctx.text);
          return wrapPopoverCell(rendered, popoverText === "--" || !popoverText ? undefined : popoverText);
        }
        return renderPopoverText(ctx.text as string | number | null);
      },
    };
  });
