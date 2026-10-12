import { saveAs } from "file-saver";
import JSZip from "jszip";
function getFileExtension(fileName: string): string {
  // 使用正则表达式匹配文件名中最后一个点（.）及其后面的所有字符
  const match = fileName.match(/\.([^.]+)$/);
  if (match?.[1]) {
    // 返回匹配到的后缀名，不包括点（.）
    return "." + match[1];
  }
  // 如果没有匹配到后缀，返回空字符串或null
  return "";
}
/**
 * 下载压缩包
 * @param zipName zip文件名
 * @param fileList 文件列表
 */
export const downloadZipFile = async (zipName: string, fileList: { url: string; name: string }[]): Promise<void> => {
  const zip = new JSZip();
  const promises = fileList.map(async (item) =>
    fetch(item.url)
      .then(async (response) => response.blob())
      .then((blob) => {
        const extra = getFileExtension(item.url);
        const fileName = item.name + extra;

        zip.file(fileName, blob);
      }),
  );
  await Promise.all(promises);
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${zipName}节目素材.zip`);
};
