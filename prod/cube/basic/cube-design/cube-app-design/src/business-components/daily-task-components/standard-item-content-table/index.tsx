import { computed, defineComponent, ref, watch } from "vue";

import { DailyTaskTagOptions, type TaskResultModel } from "@ghcloud/cube-daily-task-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Button, Input, Modal, PopConfirm, PopOver, Select, Table, Textarea } from "@ghcloud/cube-ui";

import { FileUpload, type OSSFile } from "../../file-upload/file-upload";
import { DailyTaskResultSelect } from "../daily-task-result-select";
import { DailyTaskTagSelect } from "../daily-task-tag-select";
import type { StandardItemContent } from "./type";
import { useValidate } from "./use-validate";

import styles from "./index.module.less";

interface Props {
  value: StandardItemContent[];
  readonly: boolean;
  scrollY: number;
  id?: string | undefined;
  action: "add" | "edit" | "detail";
  showAdd: boolean;
  editContentPolicy?: "all" | "new" | "none";
  /** 是否显示标准名称列，默认为 true */
  showItemName?: boolean;
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const getAttachmentHtml = (files: OSSFile[]): string =>
  files
    .map((file) => {
      const path = escapeHtml(file.path || "");
      const name = escapeHtml(file.name || "附件");
      const type = escapeHtml(file.type || file.suffix || "");
      const id = escapeHtml(file.id || "");
      const businessKey = escapeHtml(file.businessKey || "");
      const suffix = escapeHtml(file.suffix || "");
      return `<p><a href="${path}" target="_blank" rel="noopener noreferrer" data-operation-guide-attachment="true" data-file-id="${id}" data-file-name="${name}" data-file-path="${path}" data-file-type="${type}" data-file-suffix="${suffix}" data-file-size="${file.size || 0}" data-file-ref-count="${file.refCount || 0}" data-file-business-key="${businessKey}">📎 ${name}</a></p>`;
    })
    .join("");

const getGuidePlainText = (container: HTMLElement): string => {
  const textContainer = container.cloneNode(true) as HTMLElement;
  textContainer.querySelectorAll("br").forEach((lineBreak) => {
    lineBreak.replaceWith("\n");
  });
  textContainer.querySelectorAll("p,div,li,h1,h2,h3,h4,h5,h6").forEach((block) => {
    block.append("\n");
  });
  return (textContainer.textContent ?? "").replace(/\n$/, "");
};

const parseOperationGuide = (value: string): { text: string; files: OSSFile[]; legacyAttachmentHtml: string } => {
  if (!value) {
    return { text: "", files: [], legacyAttachmentHtml: "" };
  }
  const container = document.createElement("div");
  container.innerHTML = value;
  const attachments = Array.from(container.querySelectorAll('a[data-operation-guide-attachment="true"]'));
  const files: OSSFile[] = [];
  const legacyAttachmentHtml: string[] = [];
  attachments.forEach((attachment) => {
    const element = attachment as HTMLAnchorElement;
    const id = element.dataset.fileId;
    if (id) {
      files.push({
        id,
        businessKey: element.dataset.fileBusinessKey || null,
        name: element.dataset.fileName || element.textContent?.replace(/^📎\s*/, "") || "附件",
        path: element.dataset.filePath || element.href,
        refCount: Number(element.dataset.fileRefCount || 0),
        size: Number(element.dataset.fileSize || 0),
        suffix: element.dataset.fileSuffix || "",
        type: element.dataset.fileType || "",
      });
    } else {
      legacyAttachmentHtml.push(attachment.parentElement?.outerHTML ?? attachment.outerHTML);
    }
    const parent = attachment.parentElement;
    if (parent?.childNodes.length === 1) {
      parent.remove();
    } else {
      attachment.remove();
    }
  });
  return {
    text: getGuidePlainText(container),
    files,
    legacyAttachmentHtml: legacyAttachmentHtml.join(""),
  };
};

/** 添加标准项内容组件 */
export const StandardItemContentTable = defineComponent({
  props: ["value", "readonly", "scrollY", "id", "action", "showAdd", "editContentPolicy", "showItemName"],
  emits: ["update:value"],
  setup: (props: Props, { slots, emit, expose }) => {
    const dataSource = ref<StandardItemContent[]>(props.value ?? []);
    const {
      isValid,
      standardItemContent,
      itemNameChange,
      contentChange,
      tagChange,
      resultIdChange,
      defaultResultItemChange,
      mustTakePhotoResultChange,
      mustRemarkResultChange,
      validate,
    } = useValidate();

    const initContent = (data: StandardItemContent[]): void => {
      dataSource.value = data;
      standardItemContent.value = data;
      try {
        dataSource.value?.forEach((record) => {
          if (record.resultId) {
            handleChangeResultId(record.resultId, record as unknown as TaskResultModel, record);
          }
        });
      } catch {}
    };

    watch(
      () => props.value,
      () => {
        if (props.value) {
          initContent(props.value);
        }
      },
      { immediate: true },
    );

    const isEdit = computed(() => props.action !== "detail");
    const rowEditable = (record: StandardItemContent): boolean => {
      if (!isEdit.value) {
        return false;
      }
      const policy = props.editContentPolicy ?? "all";
      if (policy === "none") {
        return false;
      }
      if (policy === "new") {
        return record.source === "new";
      }
      return true;
    };
    const curItem = ref<StandardItemContent>();
    const guideModalVisible = ref(false);
    const guideValue = ref("");
    const existingGuideAttachmentHtml = ref("");
    const guideAttachments = ref<OSSFile[]>([]);
    const currentGuideRow = ref<StandardItemContent>();
    const canEditGuide = computed(() => !!currentGuideRow.value && rowEditable(currentGuideRow.value));
    const openGuideModal = (record: StandardItemContent): void => {
      currentGuideRow.value = record;
      if (!rowEditable(record)) {
        guideValue.value = record.operationGuide ?? "";
        existingGuideAttachmentHtml.value = "";
        guideAttachments.value = [];
        guideModalVisible.value = true;
        return;
      }
      const parsedGuide = parseOperationGuide(record.operationGuide ?? "");
      guideValue.value = parsedGuide.text;
      existingGuideAttachmentHtml.value = parsedGuide.legacyAttachmentHtml;
      guideAttachments.value = parsedGuide.files;
      guideModalVisible.value = true;
    };
    const handleGuideSave = (): void => {
      if (currentGuideRow.value) {
        const guideTextHtml = escapeHtml(guideValue.value).replace(/\r?\n/g, "<br>");
        currentGuideRow.value.operationGuide = `${guideTextHtml}${existingGuideAttachmentHtml.value}${getAttachmentHtml(guideAttachments.value)}`;
        standardItemContent.value = [...dataSource.value];
      }
      guideModalVisible.value = false;
    };
    const resolveResultNameFromChange = (data: TaskResultModel | null | undefined, record: StandardItemContent): string => {
      if (data === undefined || data === null) {
        return "";
      }
      return data.name ?? (data as Partial<StandardItemContent>).resultName ?? record.resultName ?? "";
    };
    const handleChangeResultId = (e: string, data: TaskResultModel | null | undefined, record: StandardItemContent): void => {
      const row = { ...record };
      curItem.value = row;
      record.resultName = resolveResultNameFromChange(data, record);
      const options =
        data?.resultLabelList?.map((item) => ({
          value: String(item.value),
          label: item.label,
          errorFlag: item.errorFlag,
        })) ?? [];
      const optionValues = new Set(options.map((opt) => opt.value));
      record.resultLabelList = options;
      const prevDefault = row.defaultResultItem;
      record.defaultResultItem = prevDefault && optionValues.has(prevDefault) ? prevDefault : (options[0]?.value ?? undefined);
      const errResultLabelList = options.filter((opt) => opt.errorFlag);
      record.errResultLabelList = errResultLabelList;
      const prevMustPhoto = Array.isArray(row.mustTakePhotoResultItems) ? row.mustTakePhotoResultItems : [];
      const filteredPhoto = prevMustPhoto.filter((v) => optionValues.has(v));
      record.mustTakePhotoResultItems =
        filteredPhoto.length > 0
          ? filteredPhoto
          : errResultLabelList[0]?.value
            ? String(errResultLabelList[0]?.value).split(",")
            : undefined;
      const prevMustRemark = Array.isArray(row.mustRemarkResultItems) ? row.mustRemarkResultItems : [];
      const filteredRemark = prevMustRemark.filter((v) => optionValues.has(v));
      record.mustRemarkResultItems =
        filteredRemark.length > 0
          ? filteredRemark
          : errResultLabelList[0]?.value
            ? String(errResultLabelList[0]?.value).split(",")
            : undefined;
      resultIdChange(e as string, record);
    };

    const showItemNameColumn = props.showItemName === undefined || props.showItemName === true;

    const columns = [
      ...(showItemNameColumn
        ? [
            {
              dataIndex: "itemName",
              title: "标准名称",
              align: "center",
              width: 200,
              fixed: "left",
              customRender: ({ record }: { record: StandardItemContent }): JSX.Element => (
                <div class={styles["input-wrap"]}>
                  <>
                    {rowEditable(record) ? (
                      <>
                        <Input
                          v-model:value={record.itemName}
                          placeholder="请输入标准名称"
                          maxlength={100}
                          onUpdate:value={(e: string) => {
                            itemNameChange(e, record);
                          }}
                        />
                        {record.itemNameError && <span class={styles["error-msg"]}>{record.itemNameErrorMsg}</span>}
                      </>
                    ) : (
                      <PopOver content={record.itemName ?? "--"}>{record.itemName ?? "--"}</PopOver>
                    )}
                  </>
                </div>
              ),
            },
          ]
        : []),
      {
        dataIndex: "itemContent",
        title: "内容描述",
        align: "center",
        width: 240,
        fixed: showItemNameColumn ? undefined : "left",
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => (
          <div class={styles["input-wrap"]}>
            <>
              {!rowEditable(record) && <PopOver content={record.itemContent ?? "--"}>{record.itemContent ?? "--"}</PopOver>}
              {rowEditable(record) && (
                <>
                  <Textarea
                    v-model:value={record.itemContent}
                    placeholder="请输入内容描述"
                    maxlength={200}
                    autoSize
                    onUpdate:value={(e: string) => {
                      contentChange(e, record);
                    }}
                  />
                  {record.itemContentError && <span class={styles["error-msg"]}>{record.itemContentErrorMsg}</span>}
                </>
              )}
            </>
          </div>
        ),
      },
      {
        dataIndex: "resultId",
        title: "结果项",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => (
          <div class={styles["input-wrap"]}>
            <>
              {!rowEditable(record) && <PopOver content={record.resultName ?? "--"}>{record.resultName ?? "--"}</PopOver>}
              {rowEditable(record) && (
                <>
                  <DailyTaskResultSelect
                    v-model:value={record.resultId}
                    enable={true}
                    onChange={(e: string, data: TaskResultModel) => {
                      handleChangeResultId(e, data, record);
                    }}
                  />
                  {record.resultIdError && <span class={styles["error-msg"]}>{record.resultIdErrorMsg}</span>}
                </>
              )}
            </>
          </div>
        ),
      },
      {
        dataIndex: "defaultResultItem",
        title: "默认结果",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => {
          const options = record.resultLabelList ?? [];
          let textVal = "";
          if (!rowEditable(record)) {
            textVal = options
              ?.filter((e) => record?.defaultResultItem?.split(",")?.includes(String(e.value)))
              .map((e) => e.label)
              .join(",");
          }
          return (
            <div class={styles["input-wrap"]}>
              <>
                {!rowEditable(record) && <PopOver content={textVal ?? "--"}>{textVal ?? "--"}</PopOver>}
                {rowEditable(record) && (
                  <>
                    <Select
                      v-model:value={record.defaultResultItem}
                      options={record.resultLabelList}
                      onChange={(e: string) => {
                        defaultResultItemChange(e, record);
                      }}
                      placeholder="请选择默认结果"
                    />
                    {record.defaultResultItemError && <span class={styles["error-msg"]}>{record.defaultResultItemErrorMsg}</span>}
                  </>
                )}
              </>
            </div>
          );
        },
      },
      {
        dataIndex: "mustTakePhotoResultItems",
        title: "以下巡检结果必须拍照",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => {
          const options = record.resultLabelList ?? [];
          const textVal = options
            ?.filter((e) => record?.mustTakePhotoResultItems?.includes(String(e.value)))
            .map((e) => e.label)
            .join(",");
          return (
            <div class={styles["input-wrap"]}>
              <>
                {!rowEditable(record) && <PopOver content={textVal ?? "--"}>{textVal ?? "--"}</PopOver>}
                {rowEditable(record) && (
                  <>
                    <Select
                      v-model:value={record.mustTakePhotoResultItems}
                      mode="multiple"
                      options={record.resultLabelList}
                      onChange={(e: string[]) => {
                        mustTakePhotoResultChange(e, record);
                      }}
                      placeholder="请选择以下巡检结果必须拍照"
                    />
                    {record.mustTakePhotoResultItemsError && (
                      <span class={styles["error-msg"]}>{record.mustTakePhotoResultItemsErrorMsg}</span>
                    )}
                  </>
                )}
              </>
            </div>
          );
        },
      },
      {
        dataIndex: "mustRemarkResultItems",
        title: "以下巡检结果必须备注",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => {
          const options = record.resultLabelList ?? [];
          const textVal = options
            ?.filter((e) => record?.mustRemarkResultItems?.includes(String(e.value)))
            .map((e) => e.label)
            .join(",");
          return (
            <div class={styles["input-wrap"]}>
              <>
                {!rowEditable(record) && <PopOver content={textVal ?? "--"}>{textVal ?? "--"}</PopOver>}
                {rowEditable(record) && (
                  <>
                    <Select
                      v-model:value={record.mustRemarkResultItems}
                      mode="multiple"
                      options={record.resultLabelList}
                      onChange={(e: string[]) => {
                        mustRemarkResultChange(e, record);
                      }}
                      placeholder="请选择以下巡检结果必须备注"
                    />
                    {record.mustRemarkResultItemsError && <span class={styles["error-msg"]}>{record.mustRemarkResultItemsErrorMsg}</span>}
                  </>
                )}
              </>
            </div>
          );
        },
      },
      {
        dataIndex: "tag",
        title: "标签",
        align: "center",
        width: 150,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => {
          const textVal = DailyTaskTagOptions.find((e) => record.tag === e.value)?.label;
          return (
            <div class={styles["input-wrap"]}>
              <>
                {!rowEditable(record) && <PopOver content={textVal ?? "--"}>{textVal ?? "--"}</PopOver>}
                {rowEditable(record) && (
                  <>
                    <DailyTaskTagSelect
                      v-model:value={record.tag}
                      onChange={(e: string) => {
                        tagChange(e, record);
                      }}
                    />
                    {record.tagError && <span class={styles["error-msg"]}>{record.tagErrorMsg}</span>}
                  </>
                )}
              </>
            </div>
          );
        },
      },
      {
        dataIndex: "operationGuide",
        title: "操作指引",
        align: "center",
        width: 300,
        ellipsis: true,
        customRender: ({ record }: { record: StandardItemContent }): JSX.Element => {
          const text = record.operationGuide ?? "";
          const previewText = text
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
          const editable = rowEditable(record);
          const showActionButton = editable || !!text;
          return (
            <div class={styles["input-wrap"]}>
              <PopOver content={<div class={styles["rich-text-content"]} v-html={text || "--"} />}>
                <span
                  style={{
                    display: "inline-block",
                    maxWidth: "180px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    verticalAlign: "middle",
                  }}
                >
                  {previewText || "--"}
                </span>
              </PopOver>
              {showActionButton && (
                <Button type="link" size="small" onClick={() => openGuideModal(record)}>
                  {editable ? (text ? "修改" : "输入") : "查看"}
                </Button>
              )}
            </div>
          );
        },
      },
    ];
    const tableColumns = computed(() => {
      const action =
        props.readonly || dataSource.value.length < 2
          ? []
          : [
              {
                title: "操作",
                dataIndex: "action",
                align: "center",
                width: 130,
                customRender: ({ index }: { index: number }): JSX.Element => (
                  <>
                    <PopConfirm
                      title="确认删除该项？"
                      onConfirm={() => {
                        handleDeleteRow(index);
                      }}
                    >
                      <Button type="link" size="small" danger>
                        删除
                      </Button>
                    </PopConfirm>
                  </>
                ),
              },
            ];
      return [...columns, ...action];
    });
    const handleDeleteRow = (index: number): void => {
      dataSource.value?.splice(index, 1);
      standardItemContent.value = [...dataSource.value];
    };
    const addContent = (): void => {
      const newItem: StandardItemContent = {
        itemId: "",
        itemName: "",
        itemContent: "",
        operationGuide: "",
        resultId: undefined,
        resultName: undefined,
        defaultResultItem: undefined,
        mustTakePhotoResultItems: undefined,
        mustRemarkResultItems: undefined,
        tag: undefined,
        source: "new",
        isEdit: true,
      };
      dataSource.value.push(newItem);
      standardItemContent.value = [...dataSource.value];
      // 新增后立即触发验证，显示必填项错误提示
      if (showItemNameColumn) {
        itemNameChange(newItem.itemName || "", newItem);
      }
      contentChange(newItem.itemContent || "", newItem);
    };
    const checkData = async (): Promise<StandardItemContent[]> => {
      try {
        await validate(showItemNameColumn);

        if (isValid.value) {
          emit("update:value", standardItemContent.value);
          return Promise.resolve(standardItemContent.value);
        }
        return Promise.reject(new Error("校验失败"));
      } catch (error) {
        return Promise.reject(error);
      }
    };
    expose({
      checkData,
      isValid,
      dataSource,
      addContent,
      initContent,
    });
    return (): JSX.Element => (
      <>
        <div class={styles["mb-16"]}>
          {props.showAdd && (
            <Button type="primary" onClick={addContent}>
              添加
            </Button>
          )}
          {slots.default?.()}
        </div>
        <Table columns={tableColumns.value} dataSource={standardItemContent.value} pagination={false} scrollY={props.scrollY} />
        <Modal
          title="操作指引"
          v-model:visible={guideModalVisible.value}
          onOk={handleGuideSave}
          okText={canEditGuide.value ? "确定" : "关闭"}
          cancelButtonProps={{ style: { display: canEditGuide.value ? "inline-block" : "none" } }}
        >
          {canEditGuide.value ? (
            <>
              <Textarea v-model:value={guideValue.value} rows={6} maxlength={500} placeholder="请输入操作指引" />
              <div class={styles["guide-attachment-upload"]}>
                <FileUpload
                  v-model:value={guideAttachments.value}
                  multiple
                  showText={false}
                  type="text"
                  size={300}
                  maxCount={10}
                  sceneCode={GLOBAL_SCENE_CODE.dailyTask}
                  buttonText="上传附件"
                />
              </div>
            </>
          ) : (
            <div class={styles["rich-text-content"]} style={{ minHeight: "120px" }} v-html={guideValue.value || "--"} />
          )}
        </Modal>
      </>
    );
  },
});
