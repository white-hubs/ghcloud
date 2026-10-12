import html2canvas from "html2canvas";
import type { Options } from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip"; // 确保已安装 jszip: npm install jszip

/**
 * 将指定的 HTML 元素转换为 PDF 并直接触发下载。
 * @param page 要转换的 HTML 元素。
 * @param title 生成的 PDF 文件名（不含 .pdf 后缀）。
 */
export const downloadPDF = async (page: HTMLElement, title: string): Promise<void> => {
  const canvas = await html2canvas(page, { useCORS: true });
  canvas2PDF(canvas, title, true);
};

/**
 * 将 Canvas 对象转换为 PDF（保持原有逻辑兼容性）
 */
const canvas2PDF = (canvas: HTMLCanvasElement, title: string, saveFile: boolean = false): Blob | void => {
  const contentWidth = canvas.width;
  const contentHeight = canvas.height;
  let leftHeight = contentHeight;
  let position = 0;
  const pageHeight = (contentWidth / 592.28) * 841.89;
  const pageData = canvas.toDataURL("image/jpeg", 1.0);
  const imgWidth = 595.28;
  const imgHeight = (592.28 / contentWidth) * contentHeight;
  const pdf = new jsPDF("p", "pt", "a4");

  if (leftHeight < pageHeight) {
    pdf.addImage(pageData, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    while (leftHeight > 0) {
      pdf.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight);
      leftHeight -= pageHeight;
      position -= 841.89;
      if (leftHeight > 0) {
        pdf.addPage();
      }
    }
  }

  if (saveFile) {
    pdf.save(title + ".pdf");
  } else {
    return pdf.output("blob");
  }
};

/**
 * 定义批量导出时每个 PDF 项的结构。
 */
interface PdfExportItem<T> {
  data: T; // 用于更新 DOM 的数据
  fileName: string; // 单个 PDF 的文件名（不含 .pdf 后缀）
}

const copyCanvasContent = (source: HTMLElement, target: HTMLElement): void => {
  const sourceCanvases = Array.from(source.querySelectorAll("canvas"));
  const targetCanvases = Array.from(target.querySelectorAll("canvas"));

  sourceCanvases.forEach((sourceCanvas, index) => {
    const targetCanvas = targetCanvases[index];
    if (!targetCanvas) {
      return;
    }

    const context = targetCanvas.getContext("2d");
    if (!context) {
      return;
    }

    try {
      targetCanvas.width = sourceCanvas.width;
      targetCanvas.height = sourceCanvas.height;
      targetCanvas.style.width = sourceCanvas.style.width || `${sourceCanvas.offsetWidth}px`;
      targetCanvas.style.height = sourceCanvas.style.height || `${sourceCanvas.offsetHeight}px`;
      context.drawImage(sourceCanvas, 0, 0);
    } catch {
      // Canvas may be tainted by cross-origin resources. Keep export flowing.
    }
  });
};

/**
 * 批量将同一个 DOM 元素基于不同数据生成多个 PDF，并将它们打包成一个 ZIP 文件下载。
 * @param domElement 要重复截图的 HTML 元素。
 * @param items 一个数组，包含每个 PDF 的数据和文件名。
 * @param updateDomWithData 一个异步函数，接收 DOM 元素和单项数据，负责更新 DOM 内容。
 *                          调用者需要确保此函数正确处理了 DOM 的异步更新，并在 resolve 前 DOM 已准备好截图。
 * @param zipFileName 最终生成的 ZIP 文件名（不含 .zip 后缀）。
 * @template T 每项数据的类型。
 */
export const downloadMultiplePDFsAsZip = async <T>(
  domElement: HTMLElement,
  items: PdfExportItem<T>[],
  updateDomWithData: (element: HTMLElement, data: T) => Promise<void>,
  zipFileName = "exported_documents",
  options?: {
    html2canvasOptions?: Partial<Options>;
    onError?: (error: Error, item?: PdfExportItem<T>) => void;
    onProgress?: (processedCount: number, totalCount: number) => void;
  },
): Promise<void> => {
  const zip = new JSZip();
  const defaultHtml2canvasOptions: Partial<Options> = {
    useCORS: true,
    logging: false,
    scale: window.devicePixelRatio || 2,
  };
  const canvasOptions = { ...defaultHtml2canvasOptions, ...options?.html2canvasOptions };
  const generatedFileNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let pdfFileName = `${item.fileName}.pdf`;
    let counter = 1;

    // 检查文件名是否重复，如果重复则添加序号
    while (generatedFileNames.has(pdfFileName)) {
      pdfFileName = `${item.fileName}(${counter}).pdf`;
      counter++;
    }
    generatedFileNames.add(pdfFileName);

    try {
      await updateDomWithData(domElement, item.data);
      await new Promise((resolve) => setTimeout(resolve, 300)); // 尝试确保DOM更新渲染完成

      const canvas = await html2canvas(domElement, canvasOptions);
      const pdfBlob = canvas2PDF(canvas, item.fileName, false) as Blob; // item.fileName 传给 canvas2PDF 时不需要带 .pdf 后缀

      if (pdfBlob) {
        zip.file(pdfFileName, pdfBlob); // 使用处理过的 pdfFileName
      } else {
        // (function(){})(`PDF Blob for ${item.fileName} could not be generated.`);
        options?.onError?.(new Error(`PDF Blob for ${item.fileName} could not be generated.`), item);
      }
      options?.onProgress?.(i + 1, items.length);
    } catch (error) {
      // (function(){})(`Error processing item ${item.fileName}:`, error);
      options?.onError?.(error as Error, item);
      // 可选: 跳过此项或根据 options?.onError 的返回值决定是否继续
      continue;
    }
  }

  if (Object.keys(zip.files).length > 0) {
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${zipFileName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      // (function(){})('Failed to generate zip file:', err);
      options?.onError?.(err as Error);
      alert("生成压缩文件失败，请检查控制台获取更多信息。");
    }
  } else {
    // (function(){})('No PDFs were generated to include in the zip file.');
    alert("没有可导出的PDF文件。");
  }
};

const PDF_BLOCK_SELECTOR = "[data-pdf-block], .pdf-avoid-break";

const waitForLayout = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

const getRelativeRect = (element: HTMLElement, container: HTMLElement): { top: number; height: number; bottom: number } => {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const top = elementRect.top - containerRect.top;
  const height = elementRect.height;
  return {
    top,
    height,
    bottom: top + height,
  };
};

const isOutermostPdfBlock = (block: HTMLElement): boolean => !block.parentElement?.closest(PDF_BLOCK_SELECTOR);

/**
 * 在 html2canvas 截图前插入空白占位，避免内容块被 PDF 分页截断。
 * html2canvas 会将整页渲染为一张长图，后续按 A4 高度切分；CSS page-break 对此无效。
 */
const preparePdfPageBreaks = (container: HTMLElement): void => {
  const pageWidth = container.offsetWidth;
  if (pageWidth <= 0) {
    return;
  }

  const pageHeight = Math.floor((pageWidth / 210) * 297);
  const pageMargin = 40;
  const effectivePageHeight = pageHeight - pageMargin;

  const blocks = Array.from(container.querySelectorAll<HTMLElement>(PDF_BLOCK_SELECTOR)).filter(
    (block) => block.offsetHeight > 0 && block.offsetHeight <= effectivePageHeight && isOutermostPdfBlock(block),
  );

  blocks.sort((a, b) => getRelativeRect(b, container).top - getRelativeRect(a, container).top);

  for (const block of blocks) {
    const { top, height, bottom } = getRelativeRect(block, container);
    const startPage = Math.floor(top / effectivePageHeight);
    const endPage = Math.floor((bottom - 1) / effectivePageHeight);

    if (endPage <= startPage) {
      continue;
    }

    const nextPageStart = (startPage + 1) * effectivePageHeight;
    const overflow = bottom - nextPageStart;
    const minOverflowToBreak = Math.min(80, height * 0.25);

    // 仅少量跨页时不推整段，避免摘要与图表之间出现大块空白
    if (overflow <= minOverflowToBreak) {
      continue;
    }

    const spacerHeight = nextPageStart - top;
    if (spacerHeight <= 0) {
      continue;
    }

    const spacer = document.createElement("div");
    spacer.className = "pdf-page-spacer";
    spacer.style.height = `${spacerHeight}px`;
    spacer.style.width = "100%";
    spacer.style.flexShrink = "0";
    block.parentNode?.insertBefore(spacer, block);
  }
};

const clonePageForPdf = (page: HTMLElement): HTMLElement => {
  const clonedPage = page.cloneNode(true) as HTMLElement;
  clonedPage.style.position = "absolute";
  clonedPage.style.left = "-9999px";
  clonedPage.style.top = "0";
  clonedPage.style.width = `${page.offsetWidth}px`;
  clonedPage.style.background = "#ffffff";
  document.body.appendChild(clonedPage);
  copyCanvasContent(page, clonedPage);
  return clonedPage;
};

const renderPdfCanvas = async (page: HTMLElement): Promise<HTMLCanvasElement> => {
  const clonedPage = clonePageForPdf(page);

  try {
    await waitForLayout();
    preparePdfPageBreaks(clonedPage);
    await waitForLayout();

    return await html2canvas(clonedPage, {
      useCORS: true,
      scale: 2,
      logging: false,
      allowTaint: true,
    });
  } finally {
    clonedPage.parentNode?.removeChild(clonedPage);
  }
};

/**
 * 改进的PDF导出函数，避免内容块被分页截断
 * @param page 要转换的HTML元素
 * @param title 生成的PDF文件名
 */
export const downloadPDFWithoutTextBreak = async (page: HTMLElement, title: string): Promise<void> => {
  const canvas = await renderPdfCanvas(page);
  simplePDF(canvas, title, true);
};

/**
 * 简化的PDF生成方法，专注于可靠性
 * @param canvas Canvas元素
 * @param title PDF文件名
 * @param saveFile 是否保存文件
 */
const simplePDF = (canvas: HTMLCanvasElement, title: string, saveFile: boolean = false): Blob | void => {
  // 获取Canvas尺寸
  const contentWidth = canvas.width;
  const contentHeight = canvas.height;

  // 计算A4页面高度（像素）
  const imgWidth = 595.28; // A4宽度（pt）
  const imgHeight = (595.28 / contentWidth) * contentHeight;

  // 创建PDF
  const pdf = new jsPDF("p", "pt", "a4");
  const pageHeight = 841.89; // A4高度（pt）

  // 转换Canvas为图像数据
  const imgData = canvas.toDataURL("image/jpeg", 1.0);

  // 添加图像到PDF
  let position = 0;
  let heightLeft = imgHeight;

  // 添加第一页
  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // 如果内容超过一页，添加更多页面
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // 保存或返回PDF
  if (saveFile) {
    pdf.save(`${title}.pdf`);
    return;
  } else {
    return pdf.output("blob");
  }
};

/**
 * 批量导出PDF，避免文字截断
 */
export const downloadMultiplePDFsWithoutTextBreakAsZip = async <T>(
  domElement: HTMLElement,
  items: PdfExportItem<T>[],
  updateDomWithData: (element: HTMLElement, data: T) => Promise<void>,
  zipFileName = "exported_documents",
  options?: {
    html2canvasOptions?: Partial<Options>;
    onError?: (error: Error, item?: PdfExportItem<T>) => void;
    onProgress?: (processedCount: number, totalCount: number) => void;
  },
): Promise<void> => {
  const zip = new JSZip();
  const generatedFileNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let pdfFileName = `${item.fileName}.pdf`;
    let counter = 1;

    // 检查文件名是否重复
    while (generatedFileNames.has(pdfFileName)) {
      pdfFileName = `${item.fileName}(${counter}).pdf`;
      counter++;
    }
    generatedFileNames.add(pdfFileName);

    try {
      // 更新DOM内容
      await updateDomWithData(domElement, item.data);
      await new Promise((resolve) => setTimeout(resolve, 500)); // 确保DOM完全渲染

      const canvas = await renderPdfCanvas(domElement);
      const pdfBlob = simplePDF(canvas, item.fileName, false) as Blob;

      if (pdfBlob) {
        zip.file(pdfFileName, pdfBlob);
      } else {
        options?.onError?.(new Error(`PDF生成失败: ${item.fileName}`), item);
      }

      options?.onProgress?.(i + 1, items.length);
    } catch (error) {
      options?.onError?.(error as Error, item);
      continue;
    }
  }

  // 生成并下载ZIP文件
  if (Object.keys(zip.files).length > 0) {
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${zipFileName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      options?.onError?.(err as Error);
      alert("生成压缩文件失败");
    }
  } else {
    alert("没有可导出的PDF文件");
  }
};
