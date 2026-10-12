import { Bar } from "../../components/bar/bar";
import styles from "./batch-handle.module.less";
import { cubeDailyInspectionService, cubeDictionaryService, cubeFileService } from "@/api/server";
import { timeFormat } from "@/utils";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Button, Field, Form, Uploader, DropdownMenu, DropdownItem, Image, showImagePreview, showNotify, Icon } from "vant";
import type { UploaderFileListItem } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRouter, useRoute } from "vue-router";

const itemCode = "INSPECTION_PATROL_SUBMIT_CONFIG";

/** 批量异常处理 */
export const ExceptionBatchHandle = defineComponent({
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const ids = ref<string[]>([]);
    const exceptionList = ref<ExceptionItem[]>([]);
    const fileList = ref<UploaderFileListItem[]>([]);
    const batch = route.query.batch as string;
    const type = route.query.type as string;
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
    } = {
      uploadMethod: [],
      watermark: [],
    };
    // 处理结果选项
    const resultOptions: ResultOption[] = [
      { text: "已修复", value: "REPAIRED" },
      { text: "待修复", value: "WAIT_REPAIR" },
    ];

    // 表单数据
    const formData = reactive<FormData>({
      result: "REPAIRED",
      description: "",
      fileIds: [],
    });

    /**
     * 获取异常详情列表
     * 分段请求详情数据，返回一个展示一个，不必等待所有数据返回才显示
     */
    const getExceptionList = async (): Promise<void> => {
      try {
        loading.value = true;
        // 从路由参数中获取ID列表
        const idParam = (route.query.ids as string) || (route.query.id as string);
        if (idParam) {
          ids.value = idParam.split(",");
          exceptionList.value = []; // 清空列表，准备逐个添加

          // 逐个请求异常详情并立即显示
          for (const id of ids.value) {
            try {
              const detail = await cubeDailyInspectionService.getRepairDetail({ recordId: id });
              // 将获取到的详情数据转换为组件所需格式并立即添加到列表中
              exceptionList.value.push(detail);
            } catch {
              // 单个请求失败不影响整体流程，继续请求下一个
            }
          }
        }
      } catch {
        showNotify({ type: "danger", message: "获取异常详情失败" });
      } finally {
        loading.value = false;
      }
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
        if (batch === "cancel") {
          await cubeDailyInspectionService.cancelRepair({
            repairStatus: "CANCEL_REPAIR",
            content: formData.description,
            fileIdList: formData.fileIds || [],
            recordIdList: ids.value,
          });
        } else {
          await cubeDailyInspectionService.updateRepair({
            repairStatus: formData.result,
            content: formData.description,
            fileIdList: formData.fileIds || [],
            recordIdList: ids.value,
          });
        }
        router.replace("/abnormal-inspection");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "提交处理结果失败" });
      } finally {
        loading.value = false;
      }
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
    onMounted(() => {
      getPatrolFormConfig();
      getExceptionList();
    });
    const previewImg = (path: string): void => {
      showImagePreview([path]);
    };
    const upload = (): VNode => {
      return (
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
      );
    };
    const typeMap = new Map([
      ["DEVICE", "设备"],
      ["STALL", "档位"],
      ["PROPERTY", "资产"],
      ["SITE_POINT", "现场点"],
      ["RISK_SOURCE", "风险源"],
      ["SMALL_ENGINEERING", "小散工程"],
    ]);
    return (): VNode => (
      <div class={styles.container}>
        <Bar name={batch !== "cancel" ? "异常处理" : "取消修复 "} />

        {/* 异常对象列表 */}
        <div class={styles.exceptionList}>
          <div class={styles.listTitle}>异常对象{type === "all" && `(${exceptionList.value.length})`}</div>

          {exceptionList.value.map((item, index) => (
            <div class={styles.exceptionItem} key={index}>
              <div>
                <span>巡检对象：</span>
                <span style={{ color: "black" }}>{item.targetName}</span>
              </div>
              <div>
                <span>巡检对象类型：</span>
                <span style={{ color: "black" }}>{typeMap.get(item.targetCategory as string)}</span>
              </div>
              <div>
                <span>巡检人员：</span>
                <span style={{ color: "black" }}>{item.nickname}</span>
              </div>
              <div>
                <span>巡检时间：</span>
                <span style={{ color: "black" }}>{timeFormat(item.time ?? "", true)}</span>
                <div>
                  <span>协同人：</span>
                  <span style={{ color: "black" }}>{item.assistNames ?? "--"}</span>
                </div>
              </div>
              <div class={styles.itemInfo}>异常明细：</div>

              {item.itemVOList && item.itemVOList.length > 0 && (
                <div class={styles.images}>
                  {item.itemVOList.map((img, index) => (
                    <div class={styles.imageWrapper} key={index}>
                      <div style={{ marginBottom: "10px" }}> {img.itemName}</div>
                      {img.fileVOS && img.fileVOS.length > 0 && (
                        <div class={styles.imageWrapperMain}>
                          {img.fileVOS.map((item, index) => (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 处理表单 */}
        <div class={styles.listTitle} style={{ marginLeft: "12px" }}>
          异常处理结果
        </div>

        <Form class={styles.form}>
          {batch !== "cancel" && (
            <div class={styles.field}>
              <div class={styles.label}>处理结果</div>
              <div class={styles.value}>
                <DropdownMenu>
                  <DropdownItem v-model={formData.result} options={resultOptions} />
                </DropdownMenu>
              </div>
            </div>
          )}
          <div class={styles.field}>
            {batch !== "cancel" ? (
              <div class={styles.label}>处理说明</div>
            ) : (
              <div class={styles.label} style={{ width: "90px" }}>
                取消修复说明
              </div>
            )}
            <div class={styles.value}>
              <Field
                v-model={formData.description}
                rows={4}
                autosize
                type="textarea"
                maxlength={200}
                placeholder={batch !== "cancel" ? "输入处理说明" : "输入取消说明"}
                show-word-limit
              />
              {/* 图片上传 */}
              <div class={styles.uploaderContainer}>
                <Field
                  name="uploader"
                  label="附件"
                  v-slots={{ input: upload() }}
                  label-width="40"
                  style={{ paddingLeft: "0px" }}
                  label-align="top"
                />
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
      </div>
    );
  },
});

// 异常对象接口定义
interface ExceptionItem {
  id: string;
  targetName: string; // 异常通检对象名称
  address: string; // 具体地址
  taskName: string; // 所属任务
  targetCategory: string;
  nickname: string;
  time: string;
  assistNames: string;
  itemVOList?: {
    itemName: string;
    fileVOS: {
      businessKey: string;
      id: string;
      name: string;
      path: string;
      refCount: number;
      size: number;
      suffix: string;
      type: string;
    }[];
  }[];
}

// 处理结果选项接口定义
interface ResultOption {
  text: string;
  value: "WAIT_REPAIR" | "REPAIRED";
}

// 表单数据接口定义
interface FormData {
  result: "WAIT_REPAIR" | "REPAIRED";
  description: string;
  fileIds: string[];
}
