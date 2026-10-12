import { message } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import Excel from "exceljs";
import { ref, type Ref } from "vue";

interface UseLoopExportExcel {
  exportLoading: Ref<boolean>;
  exportData: (payload: {
    exportTotal: number; // 导出数据的总条数
    fileName: string; // 导出的文件名称
    pageSize: 999; // 分批导出的数量
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: unknown[] }>; // 分批获取导出的数据函数
  }) => Promise<void>;
}
export interface TableColumn {
  title?: string;
  width?: number;
  dataIndex?: string;
  unit?: string;
  code?: string;
}
export const useLoopExportExcel = (): UseLoopExportExcel => {
  const exportLoading = ref(false);
  let exportFileName = "导出记录";
  const tableColumns = ref<TableColumn[]>();
  const exportExcel = async (data: unknown[]): Promise<void> => {
    try {
      if (data.length === 0) {
        message.warn("暂无数据");
        return;
      }
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet();

      // @ts-expect-error
      worksheet.columns = tableColumns.value?.slice(0, -1).map((e) => ({ header: e?.title, key: e?.dataIndex, width: 20 }));
      const res = data.map((item: unknown, i) => {
        const obj: Record<string, unknown> = { ...(item as Record<string, unknown>) };

        if (tableColumns.value?.some((e) => e.dataIndex === "idx")) {
          obj.idx = `${Number(i) + 1}`;
        }

        if ((item as { time: string })?.time) {
          obj.time = dayjs((item as { time: string }).time).format("YYYY-MM-DD HH:mm:ss");
        }
        const result = (item as { result: string })?.result;
        if (result) {
          obj.result = result ? resultText(result) : "--";
        }
        const targetCategory = (item as { targetCategory: string })?.targetCategory;
        if (targetCategory) {
          obj.targetCategory = targetCategory ? targetCategoryText(targetCategory) : "--";
        }
        const errorDesc = (item as { errorDesc: string })?.errorDesc;
        if (errorDesc) {
          let text = "";
          if (Array.isArray(errorDesc)) {
            errorDesc.map((r) => {
              text += `${r}\n`;
            });
          } else {
            text = (item as { remark: string }).remark;
          }
          obj.errorDesc = text;
        }
        const standardVOS = (
          item as { standardVOS: { itemVOS: { errorValueFlag: boolean; itemName: string; errorDesc: string }[]; standardName: string }[] }
        )?.standardVOS;
        // 处理recordItemVO，按照content内容格式展示异常内容
        if (standardVOS && Array.isArray(standardVOS)) {
          let formattedContent = "";
          standardVOS.forEach((standard) => {
            const errResult = standard?.itemVOS?.filter((item) => item.errorValueFlag);
            if (errResult?.length > 0) {
              // 添加标准名称（将在后面设置为加粗）
              formattedContent += `**${standard.standardName}**\n`;

              errResult.forEach((errItem: { itemName: string; errorDesc: string }, index: number) => {
                // 保持序号在左前方
                formattedContent += `${index + 1}、${errItem.itemName}\n`;
                // 错误描述缩进
                formattedContent += `  ${errItem.errorDesc}\n`;
              });
            }
          });
          obj.standardVOS = formattedContent;
        }
        return obj;
      });
      worksheet.addRows(res);

      if (tableColumns.value) {
        // 找到result列的索引
        const resultColumnIndex = tableColumns.value.findIndex((col) => col.dataIndex === "result") + 1;
        // 找到recordItemVO列的索引
        const recordItemVOColumnIndex = tableColumns.value.findIndex((col) => col.dataIndex === "standardVOS") + 1;

        // 设置单元格样式
        worksheet.eachRow((row, rowNumber) => {
          // 跳过表头行
          if (rowNumber > 1) {
            // 设置异常结果为红色
            if (resultColumnIndex > 0) {
              const cell = row.getCell(resultColumnIndex);
              if (cell.value === "异常") {
                cell.font = { color: { argb: "FFFF0000" } };
              }
            }

            // 处理recordItemVO列的格式
            if (recordItemVOColumnIndex > 0) {
              const cell = row.getCell(recordItemVOColumnIndex);
              if (cell.value && typeof cell.value === "string") {
                // 设置自动换行和垂直对齐方式
                cell.alignment = { wrapText: true, vertical: "middle" };

                // 将标准名称加粗
                const lines = cell.value.split("\n");
                const richText = [];

                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];

                  // 检查是否是标准名称（以**开头和结尾）
                  if (line.startsWith("**") && line.endsWith("**")) {
                    // 添加加粗的标准名称
                    richText.push({
                      text: line.substring(2, line.length - 2) + "\n",
                      font: { bold: true, size: 11 },
                    });
                  }
                  // 检查是否是错误描述（以空格开头）
                  else if (line.startsWith("  ")) {
                    // 添加缩进的错误描述
                    richText.push({
                      text: line + "\n",
                      font: { size: 11 },
                    });
                  }
                  // 其他行（包括序号和项目名称）
                  else {
                    richText.push({
                      text: line + "\n",
                      font: { size: 11 },
                    });
                  }
                }

                // 设置富文本
                cell.value = { richText };
              }
            }
          }

          // 为所有单元格设置垂直居中
          row.eachCell((cell, colNumber) => {
            if (!cell.alignment) {
              cell.alignment = { wrapText: true, vertical: "middle" };
            } else if (!cell.alignment.vertical) {
              cell.alignment.vertical = "middle";
            }
          });
        });
      }

      const a = document.createElement("a");
      a.download = `${exportFileName}.xlsx`;
      a.href = window.URL.createObjectURL(
        new Blob([await workbook.xlsx.writeBuffer()], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }),
      );
      a.click();
      exportLoading.value = false;
    } catch (error) {
      exportLoading.value = false;
      message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
    }
  };
  const exportData = async (payload: {
    exportTotal: number;
    fileName: string;
    pageSize: 999;
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: unknown[] }>;
  }): Promise<void> => {
    try {
      exportLoading.value = true;
      const count = Math.ceil(payload.exportTotal / payload.pageSize);
      const exportData: unknown[] = [];
      for (let i = 0; i < count; i++) {
        if (payload.getExportDataFunc && typeof payload.getExportDataFunc === "function") {
          const { records } = await payload.getExportDataFunc(i + 1, payload.pageSize);
          exportData.push(...records);
        }
      }
      if (payload.fileName) {
        exportFileName = payload.fileName;
      }
      tableColumns.value = payload.columns;
      exportExcel(exportData);
    } catch (error) {
      exportLoading.value = false;
      message.error((error as { errorMessage: string })?.errorMessage ?? "网络异常");
    } finally {
      exportLoading.value = false;
    }
  };

  return {
    exportLoading,
    exportData,
  };
};

export const resultText = (str: string): string => {
  const statusMap = new Map([
    ["NORMAL", "正常"],
    ["ABNORMAL", "异常"],
  ]);
  return statusMap.get(str) || "";
};
export const targetCategoryText = (str: string): string => {
  const statusMap = new Map([
    ["DEVICE", "设备"],
    ["STALL", "档位"],
    ["PROPERTY", "资产"],
    ["SITE_POINT", "现场点"],
    ["RISK_SOURCE", "风险源"],
    ["SMALL_ENGINEERING", "小散工程"],
  ]);
  return statusMap.get(str) || "";
};
