import { cubeFileService, cubeDictionaryService, cubeDailyInspectionService } from "../../../api/service";
import { InspectionStandard } from "../inspection-standard/inspection-standard";
import { InspectionTask } from "../inspection-task/task";
import styles from "./inspection-execute.module.less";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { StandardVOS, StandardItemType, InspectStandard } from "@ghcloud/cube-daily-inspection-service";
import { Button, Loading, RadioGroup, Radio, Field, Uploader, Icon, Popup, Form, showNotify, TextEllipsis, Tabs, Tab } from "vant";
import type { UploaderFileListItem } from "vant";
import { defineComponent, onMounted, ref, type PropType, type VNode } from "vue";
import { useRouter } from "vue-router";

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
// 执行巡检
export const InspectionExecute = defineComponent({
  props: {
    options: {
      type: Object as PropType<{
        searchParams: Record<string, unknown>;
        getDetailApi: (params?: Record<string, unknown>) => Promise<Record<string, unknown>>;
        submitApi: (params?: unknown) => Promise<Record<string, unknown>>;
        tempSubmitApi: (params?: unknown) => Promise<Record<string, unknown>>;
      }>,
      default: () => {
        return {};
      },
    },
    businessType: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const inspectionTask = new InspectionTask({ ...props.options });
    onMounted(() => {
      getPatrolFormConfig();
      getInspectExecuteDetail();
    });
    const submitLoading = ref(false);
    const formRef = ref();
    const detail = ref();
    const showPopUp = ref(false);
    const router = useRouter();
    const activeTab = ref(props.options.searchParams.targetId);
    const objList = ref<InspectObjType[]>([]);
    const currentObj = ref();
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
    // 获取对象信息
    const getInspectExecuteDetail = async (): Promise<void> => {
      await inspectionTask.getDetailData(props.options.getDetailApi, props.options.searchParams);
      detail.value = inspectionTask.dataDetail;
      // 巡检对象
      objList.value = await getAssociationList(detail.value);
      currentObj.value = objList.value.find((x: { targetId: string }) => x.targetId === activeTab.value);
      baseObjList = objList.value;
      isShowSubmitButton.value = detail.value !== null;
    };
    // 获取关联对象
    const getAssociationList = async (data: InspectStandard): Promise<InspectObjType[]> => {
      let inspectList = [detail.value];
      if (data.childTargetNameList) {
        // 获取关联对象标准
        const inspectionList = Promise.all(
          data.childTargetNameList?.map(async (x) => {
            inspectionTask.updateSearchParams({
              targetId: x.longKey,
              targetCategory: props.options.searchParams.targetCategory,
              taskId: props.options.searchParams.taskId,
            });
            return inspectionTask.getDetailData(props.options.getDetailApi, props.options.searchParams);
          }),
        );
        inspectList = [detail.value, ...(await inspectionList)];
      }
      // 设置默认值，返回所有对象和标准
      return inspectList.map((inspect) => {
        const standardVOS = inspect.standardVOS.map((x: StandardVOS) => {
          x.tempAddFlag = false;
          return x;
        });
        standardVOS.forEach((x: { standardItems: StandardItemType[] }) => {
          x.standardItems?.forEach((item) => {
            item.isEditMore = item.remarkResult?.includes(item.resultItemValue) ?? false;
            item.isUploadImage = item.imageResult?.includes(item.resultItemValue) ?? false;
          });
        });
        return {
          title: inspect.targetName,
          targetCategory: inspect.targetCategory,
          targetType: inspect.targetType,
          targetId: inspect.targetId,
          recordId: inspect.recordId,
          areaId: inspect.areaId,
          areaName: inspect.areaName,
          targetName: inspect.targetName,
          standards: standardVOS,
        };
      });
    };
    // 切换tab
    const onClickTab = (): void => {
      currentObj.value = objList.value.find((x: { targetId: string }) => x.targetId === activeTab.value);
    };
    // 删除临时标准
    const deleteTask = (index: number): void => {
      currentObj.value.standards.splice(index, 1);
    };
    // 添加临时标准
    const onStandards = (standards: StandardVOS[]): void => {
      const baseStandards = baseObjList.find((x: { targetId: string }) => x.targetId === activeTab.value)?.standards ?? [];
      currentObj.value.standards = [...baseStandards, ...standards];
      showPopUp.value = false;
    };
    const addInspectionContent = (): void => {
      showPopUp.value = true;
    };
    const ItemDom = (): VNode => (
      <>
        <div class={styles["cell-group"]}>
          <div class={styles.title}>基本信息</div>
          <div class={styles.content}>
            <div>
              <span>巡检对象：</span>
              <span style={{ color: "black" }}>{detail.value?.taskName}</span>
            </div>
            <div>
              <span>巡检任务：</span>
              <span style={{ color: "black" }}>{detail.value?.targetName}</span>
            </div>
            <div style="display:flex">
              <span>关联对象：</span>
              <span style={{ color: "black", display: "inline-block", width: "calc(100% - 80px)" }}>
                <TextEllipsis
                  content={detail.value?.childTargetNameList?.map((x: { value: string }) => x.value).join(",")}
                  expand-text="►"
                  collapse-text="▼"
                />
              </span>
            </div>
            {/* <div><span>所属区域：</span><span style={{ color: 'black' }}>{detail.value?.areaName}</span></div>
            <div><span>具体地址：</span><span style={{ color: 'black' }}>{detail.value?.address || '--'}</span></div> */}
          </div>
        </div>
        <div class={styles["cell-group"]}>
          <div class={styles.title} style={{ padding: "8px 12px" }}>
            <span>巡检单</span>
            <span>
              <Button plain hairline size="small" type="primary" onClick={addInspectionContent}>
                添加巡检内容
              </Button>
            </span>
          </div>
          <Tabs v-model:active={activeTab.value} onClickTab={onClickTab} lazy-render={false}>
            <div style={{ height: "50vh", overflow: "scroll" }}>
              {objList.value?.map((tab: InspectObjType) => (
                <Tab title={tab.title} name={tab.targetId} key={tab.targetId}>
                  {tab?.standards.map((item, index) => (
                    <div class={styles["result-content"]} key={index}>
                      <div class={styles["title-second"]}>
                        <span>{item?.name}</span>
                        <span
                          style={{ color: "#ed1c24", fontWeight: "normal" }}
                          onClick={() => {
                            deleteTask(index);
                          }}
                          v-show={item.tempAddFlag}
                        >
                          删除
                        </span>
                      </div>
                      {item.standardItems?.map((item, i) => (
                        <div class={styles.item} key={i}>
                          <div style={{ color: "black" }}>
                            {i + 1}、{item?.name}
                          </div>
                          <div>
                            <div class={styles["result-item"]}>
                              <span>{item.resultVO && item.resultVO?.options?.length > 0 ? `${item.resultVO?.name}：` : null}</span>
                              <RadioGroup
                                v-model={item.resultItemValue}
                                direction="horizontal"
                                shape="dot"
                                onChange={(value: string) => {
                                  item.isEditMore = item.remarkResult?.includes(value) ?? false;
                                  item.isUploadImage = item.imageResult?.includes(value) ?? false;
                                }}
                              >
                                {item.resultVO?.options.map((x) => (
                                  <Radio name={x.itemValue} key={x.itemValue}>
                                    {x.itemName}
                                  </Radio>
                                ))}
                              </RadioGroup>
                            </div>
                            {item.isEditMore ? (
                              <div class={styles["result-item"]}>
                                <Field
                                  v-model={item.content}
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
                </Tab>
              ))}
            </div>
          </Tabs>
        </div>
      </>
    );
    const upload = (item: StandardItemType, index: number, i: number): VNode => {
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
    // 上传图片
    const handleFileAfterRead = async (
      file: UploaderFileListItem | UploaderFileListItem[],
      item: StandardItemType,
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
    const clickUpload = async (item: StandardItemType, index: number, i: number): Promise<void> => {
      const fileList = item.fileVOS ? item.fileVOS : [];
      if (getEnvironment() === "cubeApp") {
        if (!currentObj.value.standards[index].standardItems[i].fileVOS) currentObj.value.standards[index].standardItems[i].fileVOS = [];
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage("3", {
          watermarkTypes: dictConfig.watermark,
          uploadMethod: dictConfig.uploadMethod,
        });
        currentObj.value.standards[index].standardItems[i].fileVOS = [
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
        const ids = currentObj.value.standards[index].standardItems[i].fileVOS.map((x: { ossId: string }) => x.ossId ?? "");
        if (!currentObj.value.standards[index].standardItems[i].fileIds) item.fileIds = [];
        ids.forEach((x: string) => {
          currentObj.value.standards[index].standardItems[i].fileIds.push(x);
        });
      }
    };
    // 提交
    const handleSubmit = async (): Promise<void> => {
      const commandList = objList.value.map((item: InspectObjType) => {
        return {
          targetId: item.targetId,
          recordId: item.recordId,
          targetCategory: item.targetCategory,
          areaId: item.areaId,
          areaName: item.areaName,
          targetName: item.targetName,
          commandModels: item.standards
            ?.map((item: StandardVOS) => {
              const standardItems = item?.standardItems.map((x) => {
                return {
                  tempAddFlag: item.tempAddFlag,
                  standardId: item.id,
                  standardName: item?.name,
                  itemId: x.id,
                  itemName: x?.name,
                  itemImageResult: x.imageResult,
                  remarkResult: x.remarkResult,
                  itemResultId: x.resultId,
                  itemResultValue: x.resultItemValue,
                  itemResultName: x.resultVO?.options.find((i) => i.itemValue === x.resultItemValue)?.itemName ?? "",
                  errorValueFlag:
                    x.resultVO?.options.find((i) => i.itemValue === x.resultItemValue)?.errorFlag === true,
                  errorDesc: x.content,
                  itemTag: x?.itemTag,
                  fileIds: x.fileIds ?? [],
                };
              });
              return standardItems;
            })
            .flat(2) as StandardItemType[],
        };
      });
      try {
        await formRef.value?.validate();
        submitLoading.value = true;
        if (props.options.searchParams.isTemporary && detail.value.targetCategory && detail.value.targetId) {
          inspectionTask
            .submitData(async (val) => props.options.tempSubmitApi(val), { commandList }, "提交成功")
            .then(() => {
              router.go(-1);
            });
        } else {
          inspectionTask
            .submitData(async (val) => props.options.submitApi(val), { commandList }, "提交成功")
            .then(() => {
              router.go(-1);
            });
        }
      } catch (e) {
        const isFail = Object.keys(formRef.value?.getValidationStatus()).some((key) => {
          return formRef.value?.getValidationStatus()[key] === "failed";
        });
        if (isFail) {
          showNotify({ type: "warning", message: "未填必填项" });
          return;
        }
        const { errorMessage } = (e as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      } finally {
        submitLoading.value = false;
      }
    };

    return (): JSX.Element => (
      <>
        <Form ref={formRef}>
          <div class={styles.wrapper}>
            {inspectionTask.loadingStatus.loading ? (
              <Loading size="24px" vertical>
                加载中...
              </Loading>
            ) : (
              ItemDom()
            )}
          </div>
          {isShowSubmitButton.value && (
            <Button type="primary" block onClick={handleSubmit} loading={submitLoading.value}>
              提交
            </Button>
          )}
        </Form>
        <Popup v-model:show={showPopUp.value} position="right" style={{ width: "100vw", height: "100vh" }}>
          <InspectionStandard
            options={{
              searchParams: {
                pageNumber: 0,
                total: 1,
                pageSize: 10,
                keyword: "",
                targetCategory: currentObj.value?.targetCategory,
                targetType: currentObj.value?.targetType,
              },
              // 列表数据
              getListApi: async (val: unknown) => {
                const query = val as {
                  pageNumber: number;
                  pageSize: number;
                  keyword: string;
                  targetCategory?: string;
                  targetType?: string;
                  flagDetails?: boolean;
                };
                return cubeDailyInspectionService.InspectStandardPage({ ...query, businessType: props.businessType, flagDetails: true });
              },
            }}
            ids={currentObj.value.standards.map((i: { id: string }) => i.id)}
            onStandards={onStandards}
            show={showPopUp.value}
          />
        </Popup>
      </>
    );
  },
});
