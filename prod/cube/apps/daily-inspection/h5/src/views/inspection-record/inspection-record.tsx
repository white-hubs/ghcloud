import dayjs from "dayjs";
import _ from "lodash";
import {
  Checkbox,
  Loading,
  showImagePreview,
  Image,
  Form,
  DropdownMenu,
  DropdownItem,
  Uploader,
  Field,
  Button,
  showNotify,
  Icon,
  type UploaderFileListItem,
  CellGroup,
  Cell,
  Tag,
} from "vant";
import { defineComponent, ref, onMounted, type VNode, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { InspectRecord, RecordToBusinessVOS, StandardVOS } from "@ghcloud/cube-daily-inspection-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { Bar } from "../../components/bar/bar";
import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { cubeDailyInspectionService, cubeDictionaryService, cubeFileService } from "@/api/server";
import { timeFormat } from "@/utils";

import styles from "./inspection-record.module.less";
// 表单数据接口定义
interface FormData {
  result: "WAIT_REPAIR" | "REPAIRED";
  description: string;
  fileIds: string[];
}
// 处理结果选项接口定义
interface ResultOption {
  text: string;
  value: "WAIT_REPAIR" | "REPAIRED";
}

export const InspectionRecord = defineComponent({
  setup() {
    useMetaTitle();
    const showErr = ref(false);

    const loading = ref(false);
    const inspectRecord = ref<InspectRecord>();
    const recordList = ref<StandardVOS[]>([]);
    const filterList = ref<StandardVOS[]>([]);
    // 表单数据
    const formData = reactive<FormData>({
      result: "REPAIRED",
      description: "",
      fileIds: [],
    });
    // 处理结果选项
    const resultOptions: ResultOption[] = [
      { text: "已修复", value: "REPAIRED" },
      { text: "待修复", value: "WAIT_REPAIR" },
    ];
    const fileList = ref<UploaderFileListItem[]>([]);
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
    } = {
      uploadMethod: [],
      watermark: [],
    };

    const route = useRoute();
    const router = useRouter();
    const handle = route.query.handle as string;
    const getInspectRecord = async (): Promise<void> => {
      loading.value = true;
      const data = await cubeDailyInspectionService.InspectRecord({ id: route.query.id as string });
      inspectRecord.value = data;
      filterList.value = data.standardVOS;
      recordList.value = data.standardVOS;
      loading.value = false;
    };
    const typeMap = new Map([
      ["DEVICE", "设备"],
      ["STALL", "档位"],
      ["PROPERTY", "资产"],
      ["SITE_POINT", "现场点"],
      ["RISK_SOURCE", "风险源"],
      ["SMALL_ENGINEERING", "小散工程"],
    ]);
    const showErrClick = (): void => {
      if (showErr.value) {
        filterList.value = _.cloneDeep(recordList.value)
          .map((item: StandardVOS) => {
            const x = item.itemVOS?.filter((x) => {
              return x.itemResultValue === "1";
            });
            item.itemVOS = x;
            return item;
          })
          .filter((x) => x.itemVOS && x.itemVOS?.length > 0);
      } else {
        filterList.value = recordList.value;
      }
    };
    const previewImg = (path: string): void => {
      showImagePreview([path]);
    };
    onMounted(() => {
      getInspectRecord();
      getPatrolFormConfig();
    });
    const goOrderPage = (record: RecordToBusinessVOS): void => {
      if (record.businessCategory === "HAZARD_GOVERNANCE") {
        window.location.href = `/apps/hazard-governance/h5/#/hazards?hazardId=${record.businessId}`;
        return;
      }
      window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=${record.businessCategory}&processId=${record.businessId}`;
    };
    /**
     * 上传图片前的校验
     */
    const beforeRead = (file: File): boolean => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showNotify({ type: "danger", message: "文件大小不能超过10MB" });
        return false;
      }
      return true;
    };

    /**
     * 获取巡检表单配置
     */
    const getPatrolFormConfig = async (): Promise<void> => {
      try {
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode: "INSPECTION_PATROL_SUBMIT_CONFIG",
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

    /**
     * 点击上传图片
     */
    const clickUpload = async (): Promise<void> => {
      if (getEnvironment() === "cubeApp") {
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage("3", {
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          watermarkTypes: dictConfig.watermark,
          uploadMethod: dictConfig.uploadMethod,
        });

        // 添加处理上传结果的代码
        fileList.value = [
          ...fileList.value,
          ...res.map((e) => {
            const item = e as { path: string; id: string };
            return {
              url: item.path,
              file: { name: "image.jpg" },
              isImage: true,
            } as UploaderFileListItem;
          }),
        ];

        // 存储文件ID
        const fileIds = res.map((e) => (e as { id: string }).id);
        formData.fileIds = formData.fileIds || [];
        fileIds.forEach((id) => {
          formData.fileIds.push(id);
        });
      }
    };

    /**
     * 上传图片后的处理
     */
    const afterRead = async (file: UploaderFileListItem | UploaderFileListItem[]): Promise<void> => {
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

      // 存储文件ID
      const fileIds = fileList.map((x) => x.id ?? "");
      // 将新上传的文件ID添加到现有列表中
      formData.fileIds = formData.fileIds || [];
      fileIds.forEach((id) => {
        formData.fileIds.push(id);
      });
    };
    /**
     * 提交处理结果
     */
    const submitHandle = async (): Promise<void> => {
      if (!formData.description) {
        showNotify({ type: "danger", message: "请填写处理说明" });
        return;
      }

      try {
        loading.value = true;
        // 调用API提交处理结果

        await cubeDailyInspectionService.updateRepair({
          repairStatus: formData.result,
          content: formData.description,
          fileIdList: formData.fileIds || [],
          recordIdList: [route.query.id as string],
        });

        router.go(-1);
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "提交处理结果失败" });
      } finally {
        loading.value = false;
      }
    };
    /**
     * 获取状态标签样式
     */
    const getStatusTag = (status: string): { text: string; type: string } => {
      const statusMap = {
        WAIT_REPAIR: { text: "待修复", type: "warning" },
        CANCEL_REPAIR: { text: "取消修复", type: "gray" },
        REPAIRED: { text: "已修复", type: "success" },
        PROCESSING: { text: "处理中", type: "primary" },
        COMPLETED: { text: "已巡检", type: "success" },
      };
      return statusMap[status as keyof typeof statusMap] || { text: "未知状态", type: "default" };
    };
    const ItemDom = (): VNode => (
      <div class={styles["detail-item-wrapper"]} style={{ height: handle === "handle" ? "calc(100vh - 100px)" : "calc(100vh - 50px)" }}>
        <div class={styles["cell-group"]}>
          <div class={styles.title}>巡检信息</div>
          <div class={styles.content}>
            <div>
              <span>巡检对象：</span>
              <span style={{ color: "black" }}>{inspectRecord.value?.targetName}</span>
            </div>
            <div>
              <span>巡检对象类型：</span>
              <span style={{ color: "black" }}>{typeMap.get(inspectRecord.value?.targetCategory as string)}</span>
            </div>
            <div>
              <span>巡检结果：</span>
              <span
                style={{
                  color: `${inspectRecord.value?.result === "NORMAL" ? "#07c160" : inspectRecord.value?.result === "" ? "#c1c1c1" : "#e0120e"}`,
                }}
              >
                {inspectRecord.value?.result === "NORMAL" ? "正常" : inspectRecord.value?.result === "" ? "--" : "异常"}
              </span>
            </div>
            <div>
              <span>巡检人员：</span>
              <span style={{ color: "black" }}>{inspectRecord.value?.nickname}</span>
            </div>
            <div>
              <span>巡检时间：</span>
              <span style={{ color: "black" }}>{timeFormat(inspectRecord.value?.time ?? "", true)}</span>
              <div>
                <span>协同人：</span>
                <span style={{ color: "black" }}>{inspectRecord.value?.assistNames ?? "--"}</span>
              </div>
              <div>
                <span>巡检抓拍：</span>
                {Array.isArray(inspectRecord.value?.snapCaptureUrls) && inspectRecord.value.snapCaptureUrls.length > 0 ? (
                  <div class={styles.imageWrapperMain}>
                    {inspectRecord.value.snapCaptureUrls.map((path: string, index: number) => (
                      <div
                        key={`${path}-${String(index)}`}
                        onClick={() => {
                          previewImg(path);
                        }}
                        style={{ width: "50px", height: "50px", display: "flex" }}
                      >
                        <Image src={path} alt="" width="50" height="50" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: "black" }}>--</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div class={styles["cell-group"]}>
          <div class={styles.title}>
            <span>巡检结果</span>
            <span style={{ fontSize: "15px" }}>
              <Checkbox shape="square" v-model={showErr.value} onClick={showErrClick}>
                只看异常
              </Checkbox>
            </span>
          </div>
          {filterList.value.map((standard, index) => (
            <div class={styles["result-content"]} key={standard.standardId}>
              <div class={styles["title-second"]}>
                {index + 1}、{standard.standardName}
              </div>
              {standard.itemVOS?.map((item, index) => (
                <div class={styles.item} key={item.itemId}>
                  <div style={{ color: "black" }}>
                    {index + 1}、{item.itemName}
                  </div>
                  <div>
                    <span>结果：</span>
                    <span style={{ color: `${item.errorValueFlag ? "#e0120e" : "#07c160"}` }}>{item.itemResultName}</span>
                    {item.fileVOS.map((x) => (
                      <div
                        key={x.id}
                        onClick={() => {
                          previewImg(x.path);
                        }}
                        style={{ width: "50px", height: "50px" }}
                      >
                        <Image src={x.path} alt="" width="50" height="50" />
                      </div>
                    ))}
                    <div style={{ color: "#5f5c5c" }}>描述信息: {item.errorDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* 异常处理 */}

        {inspectRecord.value?.recordHandledManuallyPOS && inspectRecord.value?.recordHandledManuallyPOS.length > 0 && (
          <CellGroup inset class={styles.card}>
            <div class={styles.cardTitle}>异常处理</div>
            <div class={styles.timeline}>
              {inspectRecord.value?.recordHandledManuallyPOS.map((record, index) => (
                <div class={styles.timelineItem} key={index}>
                  <div class={styles.timeInfo}>
                    <div class={styles.time}>{dayjs(record.updateTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div class={styles.dot}></div>
                  </div>
                  <div class={styles.timeContent}>
                    <div class={styles.operator}>{record.userName}</div>
                    <div class={styles.result}>处理结果：{getStatusTag(record.repairStatus).text}</div>
                    <div class={styles.description}>说明：{record.content}</div>
                    <div class={styles.imageWrapperMain}>
                      {record.fileList?.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            previewImg(item.path);
                          }}
                          style={{ width: "50px", height: "50px", display: "flex" }}
                        >
                          <Image src={item.path} alt="" width="50" height="50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CellGroup>
        )}

        {/* 关联工单 */}
        {inspectRecord.value?.recordToBusinessVOS && inspectRecord.value?.recordToBusinessVOS.length > 0 && (
          <CellGroup inset class={styles.card}>
            <div class={styles.cardTitle}>关联工单</div>
            {inspectRecord.value?.recordToBusinessVOS.map((order, index) => (
              <Cell key={index} class={styles.orderItem}>
                <div class={styles.orderInfo}>
                  <div onClick={() => goOrderPage(order)} class={styles.orderLink}>
                    {order.businessName}
                  </div>
                  <Tag size="medium" class={[styles.tag, styles[getStatusTag(order.businessStatus).type]]}>
                    {order.businessStatus}
                  </Tag>
                </div>
              </Cell>
            ))}
          </CellGroup>
        )}
        {/* 关联工单 */}
        {inspectRecord.value?.repairStatus === "CANCEL_REPAIR" && (
          <CellGroup inset class={styles.card}>
            <div class={styles.cardTitle}>取消修复说明</div>
            <div class={styles.cancelMessage}>{inspectRecord.value?.cancelReason}</div>

            <div class={styles.imageWrapperMain}>
              {inspectRecord.value?.cancelFileList?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    previewImg(item.path);
                  }}
                  style={{ width: "50px", height: "50px", display: "flex" }}
                >
                  <Image src={item.path} alt="" width="50" height="50" />
                </div>
              ))}
            </div>
          </CellGroup>
        )}
        {inspectRecord.value?.status === "CANCEL_INSPECT" && (
          <CellGroup inset class={styles.card}>
            <div class={styles.cardTitle}>取消巡检说明</div>
            <div class={styles.cancelMessage}>{inspectRecord.value?.cancelInspectReason}</div>

            <div class={styles.imageWrapperMain}>
              {inspectRecord.value?.cancelInspectFileList?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    previewImg(item.path);
                  }}
                  style={{ width: "50px", height: "50px", display: "flex" }}
                >
                  <Image src={item.path} alt="" width="50" height="50" />
                </div>
              ))}
            </div>
          </CellGroup>
        )}
        {handle === "handle" && (
          <>
            {/* 处理表单 */}
            <div class={styles.listTitle} style={{ marginLeft: "12px" }}>
              异常处理结果
            </div>

            <Form class={styles.form}>
              {
                <div class={styles.field}>
                  <div class={styles.label}>处理结果</div>
                  <div class={styles.value}>
                    <DropdownMenu>
                      <DropdownItem v-model={formData.result} options={resultOptions} />
                    </DropdownMenu>
                  </div>
                </div>
              }
              <div class={styles.field}>
                {<div class={styles.label}>处理说明</div>}
                <div class={styles.value}>
                  <Field
                    v-model={formData.description}
                    rows={4}
                    autosize
                    type="textarea"
                    maxlength={200}
                    placeholder={"输入处理说明"}
                    show-word-limit
                  />
                  {/* 图片上传 */}
                  <div class={styles.uploaderContainer}>
                    <Uploader
                      v-model={fileList.value}
                      multiple
                      max-count={5}
                      onClickUpload={async () => clickUpload()}
                      before-read={beforeRead}
                      after-read={afterRead}
                      deletable
                      preview-size={60}
                      readonly={getEnvironment() === "cubeApp"}
                    >
                      <div class={styles.upload}>
                        <Icon name="plus" size="24" color="#c1c1c1" />
                      </div>
                    </Uploader>
                  </div>
                </div>
              </div>
            </Form>

            {/* 提交按钮 */}
            <div class={styles.submitBtn}>
              <Button type="primary" block loading={loading.value} onClick={submitHandle}>
                提交
              </Button>
            </div>
          </>
        )}
      </div>
    );
    return (): VNode => (
      <div class={styles.wrapper}>
        <Bar
          isShowRight={handle === "handle"}
          name={handle === "handle" ? "异常处理" : ""}
          rightName={"取消修复"}
          onlyText={true}
          onRight={() => {
            router.push({ path: "/inspection-cancel", query: { id: route.query.id as string, batch: "" } });
          }}
        />
        {loading.value ? (
          <Loading size="24px" vertical>
            加载中...
          </Loading>
        ) : (
          ItemDom()
        )}
      </div>
    );
  },
});
