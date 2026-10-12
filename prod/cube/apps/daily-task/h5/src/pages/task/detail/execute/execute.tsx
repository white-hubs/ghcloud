import {
  Button,
  Loading,
  RadioGroup,
  Radio,
  Field,
  Uploader,
  Icon,
  Popup,
  Form,
  showImagePreview,
  showNotify,
  TextEllipsis,
  Tabs,
  Tab,
} from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeDailyTaskService, cubeFileService, cubeDictionaryService } from "@/api/server";

import styles from "./execute.module.less";
// import { InspectionStandard } from '@/views/inspection-standard/inspection-standard'
import type { FormInstance, UploaderFileListItem } from "vant";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { StandardVOS, StandardItemType, InspectStandard } from "@ghcloud/cube-daily-inspection-service";
import type { TaskExecuteModel } from "@ghcloud/cube-daily-task-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { Bar } from "@/components/bar/bar";
import { storeInspect } from "@/store/inspect";
const itemCode = "INSPECTION_PATROL_SUBMIT_CONFIG";
interface FileType {
  businessKey: string;
  ossId: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
interface InspectObjType {
  targetName: string;
  areaName: string;
  areaId: string;
  title: string;
  targetCategory: string;
  targetType: string;
  targetId: string;
  recordId: string;
  standards: StandardVOS[];
}
type TaskItemAllList = {
  id: string;
  name: string;
  itemList: TaskItemList[];
};
type TaskItemList = {
  content: string;
  createTime: string;
  id: string;
  name: string;
  operationGuide?: string;
  tag: string;
  resultList: TaskItem[];
  itemList: TaskItem[];
  fileVOS: FileType[];
};
type TaskItem = {
  defaultResultItem: string;
  createTime: string;
  id: string;
  mustRemarkResultItems: string;
  mustTakePhotoResultItems: string;
  name: string;
  resultLabelJson: string;
  resultItemValue: string;
  resultItemName: string;
  isEditMore: boolean;
  isUploadImage: boolean;
  remark: string;
  errorFlag: boolean;
  fileIds: string[];
  fileVOS?: FileType[];
};
type TaskObjectItem = {
  id: string;
  targetName: string;
  executorName: string;
  location: string;
  handlerName: string;
  status: string;
  areaName: string;
};
export const TaskExecute = defineComponent({
  setup() {
    const store = storeInspect();

    const loading = ref(false);
    const submitLoading = ref(false);
    const formRef = ref();
    const route = useRoute();
    const detail = ref();
    const showPopUp = ref(false);
    const guidePopupVisible = ref(false);
    const currentOperationGuide = ref("");
    const router = useRouter();
    const PropsTaskItemList = route.query?.taskItemList as string;
    const dailyType = route.query?.dailyType as string;
    const TaskItemList = ref<TaskItemList[]>();
    const TaskObjItemList = ref<TaskItemAllList[]>();
    // const isTemporary = route.query?.isTemporary === 'true'
    const taskId = (route.query?.taskId as string) ?? "";
    const taskName = (route.query?.taskName as string) ?? "";
    const targetType = (route.query?.targetType as string) ?? "";
    const targetObj = (route.query?.targetObj as string) ?? "";
    const targetObjList = ref<TaskObjectItem>();
    const targetCategory = (route.query?.targetCategory as string) ?? "";
    const returnPagePath = (route.query?.returnPagePath as string) ?? "";
    // const activeTab = ref(targetId)
    // const objList = ref<InspectObjType[]>([])
    const currentObj = ref();
    const isCopy = ref(false);
    let baseObjList: InspectObjType[] = [];
    const isShowSubmitButton = ref(false);
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
    } = {
      uploadMethod: [],
      watermark: [],
    };

    const getPatrolFormConfig = async (): Promise<void> => {
      try {
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode,
          code: "uploadPicConfig",
        });
        if (config.length === 0) return;
        const variable = JSON.parse(config[0].variable);
        dictConfig = variable as typeof dictConfig;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };

    const getTaskStandards = async (id: string): Promise<void> => {
      const data = await cubeDailyTaskService.getTargetFormObj({ id, taskId });
      TaskObjItemList.value = data;
    };
    const clickUpload = async (item: StandardItemType | TaskItem, index: number, i: number): Promise<void> => {
      const fileList = item.fileVOS ? item.fileVOS : [];
      if (getEnvironment() === "cubeApp") {
        if (!item.fileVOS) {
          item.fileVOS = [];
        }
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage("3", {
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          watermarkTypes: dictConfig.watermark,
          uploadMethod: dictConfig.uploadMethod,
        });
        item.fileVOS = [
          ...fileList,
          ...res.map((e) => {
            const item = e as { path: string; id: string };
            return {
              url: item.path,
              ossId: item.id,
              isImage: true,
            };
          }),
        ] as FileType[];
        const ids = item.fileVOS.map((x: { ossId: string }) => x.ossId ?? "");
        if (!item.fileIds) item.fileIds = [];
        ids.forEach((x: string) => {
          item.fileIds.push(x);
        });
      }
    };
    // 上传图片
    const handleFileAfterRead = async (
      file: UploaderFileListItem | UploaderFileListItem[],
      item: StandardItemType | TaskItem,
      index: number,
      i: number,
    ): Promise<void> => {
      const fileList = [];
      if (Array.isArray(file)) {
        for (const fileItem of file) {
          fileItem.status = "uploading";
          fileItem.message = "上传中...";
          const payload = {
            businessKey: "mdata",
            sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
            file: fileItem.file as Blob,
          };
          const fileInfo = await cubeFileService.uploadFile(payload);
          fileList.push(fileInfo);
          fileItem.url = fileInfo.path as unknown as string;
          fileItem.status = "done";
          fileItem.message = "上传成功";
        }
      } else {
        file.status = "uploading";
        file.message = "上传中...";
        const payload = {
          businessKey: "mdata",
          // sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          file: file.file as Blob,
        };
        const result = await cubeFileService.uploadFile(payload);
        fileList.push(result);
        file.url = result.path as unknown as string;
        file.status = "done";
        file.message = "上传成功";
      }
      if (getEnvironment() === "cubeApp") {
        currentObj.value.standards[index].standardItems[i].fileVOS = fileList as FileType[];
      }
      const ids = fileList.map((x) => x.id ?? "");
      if (!item.fileIds) item.fileIds = [];
      ids.forEach((x) => {
        item.fileIds.push(x);
      });
    };
    const upload = (item: StandardItemType | TaskItem, index: number, i: number): VNode => {
      return (
        <Uploader
          v-model={item.fileVOS}
          multiple
          capture="camera"
          readonly={getEnvironment() === "cubeApp"}
          onClickUpload={async () => clickUpload(item, index, i)}
          afterRead={(file: UploaderFileListItem | UploaderFileListItem[]) => {
            handleFileAfterRead(file, item, index, i);
          }}
        >
          <div class={styles.upload}>
            <Icon name="plus" size="24" color="#c1c1c1" />
          </div>
        </Uploader>
      );
    };
    const clickCopyObj = (): void => {
      // router.push({ path: '/inspect-object', query: { id: currentObj.value?.recordId } })
      isCopy.value = true;
    };
    const openOperationGuide = (guide?: string): void => {
      currentOperationGuide.value = guide || "";
      guidePopupVisible.value = true;
    };
    const handleOperationGuideClick = async (event: MouseEvent): Promise<void> => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      if (target instanceof HTMLImageElement) {
        const container = event.currentTarget as HTMLElement;
        const images = Array.from(container.querySelectorAll("img"))
          .map((image) => image.currentSrc || image.src)
          .filter(Boolean);
        const currentIndex = Math.max(
          0,
          Array.from(container.querySelectorAll("img")).findIndex((image) => image === target),
        );
        showImagePreview(images, currentIndex);
        return;
      }
      const attachmentLink = target.closest<HTMLAnchorElement>('a[data-operation-guide-attachment="true"]');
      if (!attachmentLink?.href) {
        return;
      }
      event.preventDefault();
      if (getEnvironment() === "cubeApp") {
        await cubeAppService.openFile(attachmentLink.href);
        return;
      }
      window.open(attachmentLink.href, "_blank", "noopener,noreferrer");
    };
    const ItemDom = (): VNode => (
      <>
        {!PropsTaskItemList && (
          <div class={styles["cell-group"]}>
            <div class={styles.title}>基本信息</div>
            <div class={styles.content}>
              <div>
                <span>任务名称：</span>
                <span style={{ color: "black" }}>{taskName ?? "-"}</span>
              </div>
              <div>
                <span>巡检对象：</span>
                <span style={{ color: "black" }}>{targetObjList.value?.targetName}</span>
              </div>
              <div>
                <span>所属区域：</span>
                <span style={{ color: "black" }}>{targetObjList.value?.areaName || "-"}</span>
              </div>
              <div>
                <span>具体地址：</span>
                <span style={{ color: "black" }}>{targetObjList.value?.location || "-"}</span>
              </div>
            </div>
          </div>
        )}
        <div class={styles["cell-group"]}>
          {/* <div class={styles.title} style={{ padding: '8px 12px' }}>
            <span>巡检单</span>
            <span><Button plain hairline size='small' type='primary' onClick={addInspectionContent}>添加巡检内容</Button></span>
          </div> */}
          {/* <Tabs v-model:active={activeTab.value} onClickTab={onClickTab} lazy-render={false}>
            <div style={{ height: '54vh', overflow: 'scroll' }}>
              {
                objList.value?.map((tab: InspectObjType) =>
                  <Tab title={tab.title} name={tab.targetId} key={tab.targetId}>
                    {tab?.standards.map((item, index) =>
                      <div class={styles['result-content']} key={index}>
                        <div class={styles['title-second']}>
                          <span>{item?.name}</span>
                        </div>
                        {item.standardItems?.map((item, i) =>
                          <div class={styles.item} key={i}>
                            <div style={{ color: 'black' }}>{i + 1}、{item?.name}</div>
                            <div>
                              <div class={styles['result-item']}>
                                <span>{item.resultVO?.name}：</span>
                                <RadioGroup
                                  v-model={item.resultItemValue}
                                  direction='horizontal' shape='dot'
                                  onChange={(value: string) => {
                                    item.isEditMore = item.remarkResult?.includes(value) ?? false
                                    item.isUploadImage = item.imageResult?.includes(value) ?? false
                                  }}
                                >
                                  {item.resultVO?.options.map(x =>
                                    <Radio name={x.itemValue} key={x.itemValue}>{x.itemName}</Radio>)}
                                </RadioGroup>
                              </div>
                              {item.isEditMore
                                ? (
                                  <div class={styles['result-item']}>
                                    <Field
                                      v-model={item.content}
                                      name='content'
                                      rows='2'
                                      type='textarea'
                                      placeholder='工作任务开展情况的描述'
                                      style={{ background: '#f7f8fa' }}
                                      rules={[{ required: true, message: '请输入描述' }]}
                                    />
                                  </div>)
                                : null}
                              {item.isUploadImage
                                ? (
                                  <div class={styles['result-item']}>
                                    <Field
                                      name='uploader'
                                      label='附件'
                                      v-slots={{ input: upload(item, index, i) }}
                                      required
                                      label-width='40'
                                      style={{ paddingLeft: '0px' }}
                                      label-align='top'
                                      rules={[{ required: true, message: '请上传图片' }]}
                                    />
                                  </div>
                                )
                                : null}

                            </div>
                          </div>)}

                      </div>)}
                  </Tab>)
              }
            </div>
          </Tabs> */}
          {TaskItemList.value?.map((list, index) => (
            <div class={styles["result-content"]} key={index}>
              <div class={styles["title-second"]}>
                <span>
                  {index + 1}、{list?.name}
                </span>
                {!!list?.operationGuide?.trim() && (
                  <Button
                    size="mini"
                    plain
                    hairline
                    type="primary"
                    onClick={() => {
                      openOperationGuide(list.operationGuide);
                    }}
                  >
                    操作指引
                  </Button>
                )}
                {/* <span style={{ color: '#ed1c24', fontWeight: 'normal' }} onClick={() => {
                            deleteTask(index)
                          }} v-show={item.tempAddFlag}>删除</span> */}
              </div>
              <div class={styles.item}>
                <span>内容描述：{list?.content?.trim() || "--"}</span>
              </div>
              {list.resultList?.map((item, i) => (
                <div class={styles.item} key={i}>
                  {/* <div style={{ color: 'black' }}>{i + 1}、{item?.name}</div> */}
                  <div>
                    <div class={styles["result-item"]}>
                      {/* <span>{item.resultVO?.name}：</span> */}
                      <span>结果：</span>
                      <RadioGroup
                        v-model={item.resultItemValue}
                        direction="horizontal"
                        shape="dot"
                        onChange={(value: string) => {
                          const resultOptions = JSON.parse(item.resultLabelJson) as { value: string; label: string; errorFlag: boolean }[];
                          item.isEditMore = item.mustRemarkResultItems?.includes(value) ?? false;
                          item.isUploadImage = item.mustTakePhotoResultItems?.includes(value) ?? false;
                          item.errorFlag = resultOptions.filter((x) => x.value === value)[0].errorFlag;
                          item.resultItemName = resultOptions.filter((x) => x.value === value)[0].label;
                        }}
                      >
                        {(JSON.parse(item.resultLabelJson) as { value: string; label: string }[]).map((x) => (
                          <Radio name={x.value} key={x.value}>
                            {x.label}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                    {item.isEditMore ? (
                      <div class={styles["result-item"]}>
                        <Field
                          v-model={item.remark}
                          name="content"
                          rows="2"
                          label="描述"
                          type="textarea"
                          placeholder="工作任务开展情况的描述"
                          style={{ background: "#f7f8fa" }}
                          rules={[{ required: true, message: "请输入描述" }]}
                        />
                      </div>
                    ) : null}
                    {item.isUploadImage ? (
                      <div class={styles["result-item"]}>
                        <Field
                          name="uploader"
                          label="附件"
                          v-slots={{ input: upload(item, index, i) }}
                          required
                          label-width="40"
                          style={{ paddingLeft: "0px" }}
                          label-align="top"
                          rules={[{ required: true, message: "请上传图片" }]}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {TaskObjItemList.value?.map((obj) => (
            <div>
              <div class={styles["title-first"]}>{obj.name}</div>
              <div>
                {obj.itemList?.map((list, index) => (
                  <div class={styles["result-content"]} key={index}>
                    <div class={styles["title-second"]}>
                      <span>
                        {index + 1}、{list?.name}
                      </span>
                      {!!list?.operationGuide?.trim() && (
                        <Button
                          size="mini"
                          plain
                          hairline
                          type="primary"
                          onClick={() => {
                            openOperationGuide(list.operationGuide);
                          }}
                        >
                          操作指引
                        </Button>
                      )}
                    </div>
                    {list.resultList?.map((item, i) => (
                      <div class={styles.item} key={i}>
                        {/* <div style={{ color: 'black' }}>{item?.name}</div> */}
                        <div>
                          <div class={styles["result-item"]}>
                            {/* <span>{item.resultVO?.name}：</span> */}
                            <span>结果：</span>
                            <RadioGroup
                              v-model={item.resultItemValue}
                              direction="horizontal"
                              shape="dot"
                              onChange={(value: string) => {
                                const resultOptions = JSON.parse(item.resultLabelJson) as {
                                  value: string;
                                  label: string;
                                  errorFlag: boolean;
                                }[];
                                item.isEditMore = item.mustRemarkResultItems?.includes(value) ?? false;
                                item.isUploadImage = item.mustTakePhotoResultItems?.includes(value) ?? false;
                                item.errorFlag = resultOptions.filter((x) => x.value === value)[0].errorFlag;
                                item.resultItemName = resultOptions.filter((x) => x.value === value)[0].label;
                              }}
                            >
                              {(JSON.parse(item.resultLabelJson) as { value: string; label: string }[]).map((x) => (
                                <Radio name={x.value} key={x.value}>
                                  {x.label}
                                </Radio>
                              ))}
                            </RadioGroup>
                          </div>
                          {item.isEditMore ? (
                            <div class={styles["result-item"]}>
                              <Field
                                v-model={item.remark}
                                name="content"
                                rows="2"
                                type="textarea"
                                placeholder="工作任务开展情况的描述"
                                style={{ background: "#f7f8fa" }}
                                rules={[{ required: true, message: "请输入描述" }]}
                              />
                            </div>
                          ) : null}
                          {item.isUploadImage ? (
                            <div class={styles["result-item"]}>
                              <Field
                                name="uploader"
                                label="附件"
                                v-slots={{ input: upload(item, index, i) }}
                                required
                                label-width="40"
                                style={{ paddingLeft: "0px" }}
                                label-align="top"
                                rules={[{ required: true, message: "请上传图片" }]}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );

    // 提交
    const handleSubmit = async (): Promise<void> => {
      formRef.value.validate().then(async () => {
        let targetItem: {
          targetId: string | undefined;
          targetItemList: {
            standardId: string;
            standardName: string;
            resultId?: string;
          }[];
        } = {
          targetId: targetObjList.value?.id,
          targetItemList: [],
        };
        TaskObjItemList.value?.map((i) => {
          i.itemList.map((list) => {
            let obj = {
              standardId: i.id,
              standardName: i.name,
            };
            const newObj = {
              dailyType: dailyType,
              taskId,
              taskName: taskName,
              itemId: list.id,
              itemName: list.name,
              itemTag: list.tag,
              resultId: list.resultList[0].resultItemValue,
              resultName: list.resultList[0].resultItemName,
              errorFlag: list.resultList[0].errorFlag,
              remark: list.resultList[0].remark,
              fileIdList: list.resultList[0].fileIds,
              defaultResultItem: list.resultList[0].defaultResultItem,
              mustTakePhotoResultItems: list.resultList[0].mustTakePhotoResultItems,
              mustRemarkResultItems: list.resultList[0].mustRemarkResultItems,
            };
            Object.assign(obj, newObj);
            targetItem.targetItemList.push(obj);
          });
        });
        const commandList: TaskExecuteModel = {
          dailyType: dailyType,
          taskId,
          taskName: taskName,
          recordItemList: TaskItemList.value?.map((item) => {
            return {
              dailyType: dailyType,
              taskId,
              taskName: taskName,
              itemId: item.id,
              itemName: item.name,
              itemTag: item.tag,
              resultId: item.resultList[0].resultItemValue,
              resultName: item.resultList[0].resultItemName,
              errorFlag: item.resultList[0].errorFlag,
              remark: item.resultList[0].remark,
              fileIdList: item.resultList[0].fileIds,
              defaultResultItem: item.resultList[0].defaultResultItem,
              mustTakePhotoResultItems: item.resultList[0].mustTakePhotoResultItems,
              mustRemarkResultItems: item.resultList[0].mustRemarkResultItems,
            };
          }),

          recordTargetList: targetObj ? [targetItem] : null,
        };
        let isError = false;
        if (targetObj) {
          targetItem.targetItemList.map((item) => {
            if (item.resultId === undefined) {
              showNotify({ type: "warning", message: "请完善结果" });
              isError = true;
              return;
            }
          });
        } else {
          commandList?.recordItemList?.map((item) => {
            if (item.resultId === undefined) {
              showNotify({ type: "warning", message: "请完善结果" });
              isError = true;
              return;
            }
          });
        }
        if (!isError) {
          handleRequest(commandList);
        }
      });
    };
    const handleRequest = async (commandList: TaskExecuteModel): Promise<void> => {
      submitLoading.value = true;
      try {
        await cubeDailyTaskService.dailyTaskSubmit(commandList);
        showNotify({ type: "success", message: "处理成功" });
        onCancel();
      } catch {
      } finally {
        submitLoading.value = false;
      }
    };
    onMounted(() => {
      getPatrolFormConfig();
      if (PropsTaskItemList) {
        TaskItemList.value = JSON.parse(PropsTaskItemList);
      } else if (targetObj) {
        targetObjList.value = JSON.parse(targetObj);
        getTaskStandards(targetObjList.value?.id ?? "");
      }

      // getInspectExecuteDetail()
      // copyObjList.value = store.checkedList ?? []
    });

    // const cancel = (): void => {
    //   router.push({ path: '/inspection-cancel', query: { id: detail.value.recordId, batch: 'inspection' } })
    // }
    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
      } else {
        history.back();
      }
    };
    return (): VNode => (
      <>
        {
          <>
            <Bar name={"执行处理"} />
            <Form ref={formRef}>
              <div class={styles.wrapper}>
                {loading.value ? (
                  <Loading size="24px" vertical>
                    加载中...
                  </Loading>
                ) : (
                  ItemDom()
                )}
              </div>
              {
                <Button type="primary" block onClick={handleSubmit} loading={submitLoading.value}>
                  提交
                </Button>
              }
            </Form>
            {/* <Popup
                v-model:show={showPopUp.value}
                position='right'
                style={{ width: '80vw', height: '100vh' }}
              >
                <InspectionStandard
                  params={{
                    targetCategory: currentObj.value?.targetCategory,
                    targetType: currentObj.value?.targetType
                  }}
                  ids={currentObj.value.standards.map((i: { id: string; }) => i.id)}
                  onStandards={onStandards}
                  show={showPopUp.value}
                />
              </Popup> */}
            <Popup v-model:show={guidePopupVisible.value} position="bottom" round closeable style={{ maxHeight: "70vh" }}>
              <div
                class={styles["operation-guide-content"]}
                v-html={currentOperationGuide.value || "--"}
                onClick={handleOperationGuideClick}
              />
            </Popup>
          </>
        }
      </>
    );
  },
});
