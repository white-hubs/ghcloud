/** 调试侧栏 / 聊天输出：安全渲染常见 Markdown，并将图片输出渲染为 <img> */

const MARKDOWN_IMAGE_RE = /^!\[([^\]]*)]\((https?:\/\/[^)\s]+)\)\s*$/i;
const BARE_IMAGE_URL_RE = /^https?:\/\/\S+$/i;
const IMAGE_EXT_IN_URL_RE = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i;
const FENCE_RE = /^\s*```([\w-]+)?\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const UNORDERED_LIST_RE = /^\s*[-*+]\s+(.+)$/;
const ORDERED_LIST_RE = /^\s*\d+[.)]\s+(.+)$/;
const TABLE_SEPARATOR_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
const INLINE_TOKEN_RE =
  /(!\[([^\]]*)]\((https?:\/\/[^)\s]+)\)|\[([^\]]+)]((?:\((https?:\/\/[^)\s]+)\)))|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_)/gi;

export function extractImageUrlFromReplyText(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed === "") {
    return null;
  }
  const md = MARKDOWN_IMAGE_RE.exec(trimmed);
  if (md?.[2]) {
    return md[2];
  }
  if (BARE_IMAGE_URL_RE.test(trimmed) && (IMAGE_EXT_IN_URL_RE.test(trimmed) || trimmed.includes("dashscope-result"))) {
    return trimmed;
  }
  return null;
}

function markdownImageFromLine(line: string): { alt: string; url: string } | null {
  const md = MARKDOWN_IMAGE_RE.exec(line.trim());
  if (!md?.[2]) {
    return null;
  }
  return { alt: md[1] ?? "", url: md[2] };
}

function renderInline(text: string, keyPrefix: string, imageClass: string, onContentLoad?: () => void): (string | JSX.Element)[] {
  const nodes: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  INLINE_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_TOKEN_RE.exec(text)) != null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-in-${match.index}`;
    if (match[2] != null && match[3] != null) {
      nodes.push(<img key={key} class={imageClass} src={match[3]} alt={match[2]} onLoad={onContentLoad} />);
    } else if (match[4] != null && match[6] != null) {
      nodes.push(
        <a key={key} href={match[6]} target="_blank" rel="noreferrer">
          {match[4]}
        </a>,
      );
    } else if (match[7] != null) {
      nodes.push(<code key={key}>{match[7]}</code>);
    } else if (match[8] != null || match[9] != null) {
      nodes.push(<strong key={key}>{match[8] ?? match[9]}</strong>);
    } else if (match[10] != null || match[11] != null) {
      nodes.push(<em key={key}>{match[10] ?? match[11]}</em>);
    }
    ({ lastIndex } = INLINE_TOKEN_RE);
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function renderInlineWithBreaks(text: string, keyPrefix: string, imageClass: string, onContentLoad?: () => void): (string | JSX.Element)[] {
  return text.split("\n").flatMap((line, idx) => {
    const inline = renderInline(line, `${keyPrefix}-${idx}`, imageClass, onContentLoad);
    return idx === 0 ? inline : [<br key={`${keyPrefix}-br-${idx}`} />, ...inline];
  });
}

function renderHeading(level: number, children: (string | JSX.Element)[], key: string): JSX.Element {
  if (level === 1) {
    return <h1 key={key}>{children}</h1>;
  }
  if (level === 2) {
    return <h2 key={key}>{children}</h2>;
  }
  if (level === 3) {
    return <h3 key={key}>{children}</h3>;
  }
  if (level === 4) {
    return <h4 key={key}>{children}</h4>;
  }
  if (level === 5) {
    return <h5 key={key}>{children}</h5>;
  }
  return <h6 key={key}>{children}</h6>;
}

function parseTableCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableStart(lines: string[], index: number): boolean {
  const current = lines[index]?.trim() ?? "";
  const next = lines[index + 1]?.trim() ?? "";
  return current.includes("|") && TABLE_SEPARATOR_RE.test(next);
}

function renderMarkdownBlocks(text: string, imageClass: string, onContentLoad?: () => void): JSX.Element[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const key = `md-${blocks.length}`;

    if (trimmed === "") {
      i += 1;
      continue;
    }

    if (FENCE_RE.test(line)) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1;
      }
      blocks.push(
        <pre key={key}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const image = markdownImageFromLine(line);
    if (image != null) {
      blocks.push(<img key={key} class={imageClass} src={image.url} alt={image.alt || "Generated"} onLoad={onContentLoad} />);
      i += 1;
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      blocks.push(renderHeading(Math.min(heading[1].length, 6), renderInline(heading[2], `${key}-h`, imageClass, onContentLoad), key));
      i += 1;
      continue;
    }

    if (UNORDERED_LIST_RE.test(line)) {
      const items: JSX.Element[] = [];
      while (i < lines.length) {
        const m = UNORDERED_LIST_RE.exec(lines[i]);
        if (!m) {
          break;
        }
        items.push(<li key={`${key}-li-${items.length}`}>{renderInline(m[1], `${key}-li-${items.length}`, imageClass, onContentLoad)}</li>);
        i += 1;
      }
      blocks.push(<ul key={key}>{items}</ul>);
      continue;
    }

    if (ORDERED_LIST_RE.test(line)) {
      const items: JSX.Element[] = [];
      while (i < lines.length) {
        const m = ORDERED_LIST_RE.exec(lines[i]);
        if (!m) {
          break;
        }
        items.push(<li key={`${key}-li-${items.length}`}>{renderInline(m[1], `${key}-li-${items.length}`, imageClass, onContentLoad)}</li>);
        i += 1;
      }
      blocks.push(<ol key={key}>{items}</ol>);
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote key={key}>
          <p>{renderInlineWithBreaks(quoteLines.join("\n"), `${key}-q`, imageClass, onContentLoad)}</p>
        </blockquote>,
      );
      continue;
    }

    if (isTableStart(lines, i)) {
      const headers = parseTableCells(lines[i]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim() !== "") {
        rows.push(parseTableCells(lines[i]));
        i += 1;
      }
      blocks.push(
        <table key={key}>
          <thead>
            <tr>
              {headers.map((cell, idx) => (
                <th key={`${key}-th-${idx}`}>{renderInline(cell, `${key}-th-${idx}`, imageClass, onContentLoad)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={`${key}-tr-${rowIdx}`}>
                {headers.map((_, cellIdx) => (
                  <td key={`${key}-td-${rowIdx}-${cellIdx}`}>
                    {renderInline(row[cellIdx] ?? "", `${key}-td-${rowIdx}-${cellIdx}`, imageClass, onContentLoad)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      const curTrimmed = cur.trim();
      if (
        curTrimmed === "" ||
        FENCE_RE.test(cur) ||
        markdownImageFromLine(cur) != null ||
        HEADING_RE.test(cur) ||
        UNORDERED_LIST_RE.test(cur) ||
        ORDERED_LIST_RE.test(cur) ||
        curTrimmed.startsWith(">") ||
        isTableStart(lines, i)
      ) {
        break;
      }
      paragraphLines.push(cur);
      i += 1;
    }
    blocks.push(<p key={key}>{renderInlineWithBreaks(paragraphLines.join("\n"), `${key}-p`, imageClass, onContentLoad)}</p>);
  }

  return blocks;
}

export function WorkflowReplyContent(props: {
  text: string;
  proseClass: string;
  imageClass: string;
  onContentLoad?: () => void;
}): JSX.Element {
  const imageUrl = extractImageUrlFromReplyText(props.text);
  if (imageUrl != null) {
    return <img class={props.imageClass} src={imageUrl} alt="Generated" onLoad={props.onContentLoad} />;
  }
  return <div class={props.proseClass}>{renderMarkdownBlocks(props.text, props.imageClass, props.onContentLoad)}</div>;
}
