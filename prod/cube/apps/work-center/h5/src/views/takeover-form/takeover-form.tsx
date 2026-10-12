import styles from "./takeover-form.module.less";
import { cubeFileService, cubeWorkCenterService } from "@/api/server";
import { Signature } from "@/components/signature/signature";
import { useGlobalRouter } from "@/hook/use-global-router";
import { storeTodo } from "@/store/todo";
import { dataUrlToFile, getFileName } from "@/utils";
import { applicationBackgroundColor, applicationTextColor } from "@/utils/types";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { kkFilePreview, type FileState } from "@ghcloud/cube-utils";
import type { FileVO, HandoverRecordDetailVO } from "@ghcloud/cube-work-center-service/src/type";
import { Button, Field, Form, showNotify, type FormInstance, Image, showImagePreview, Tag } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";

const parseViteBool = (raw: string | undefined): boolean => {
  if (raw === undefined || raw === "") {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
};

// 与交班页保持一致：总开关控制是否展示扩展信息
const handoverExtendEnabled = parseViteBool(import.meta.env.VITE_HANDOVER_EXTEND_ENABLED);
const HANDOVER_EXTEND_SECTIONS = [
  { key: "extend1" as const, label: "整理内务，填报记录", textField: "attInfo1" as const, fileField: "file1" as const },
  {
    key: "extend2" as const,
    label: "检查设备（含岗亭道闸）数量和状态，寻找遗失物品、登记损坏情况",
    textField: "attInfo2" as const,
    fileField: "file2" as const,
  },
  { key: "extend3" as const, label: "集体学习、总结", textField: "attInfo3" as const, fileField: "file3" as const },
  {
    key: "extend4" as const,
    label: "岗位和任务安排，交接需跟进的工作事项",
    textField: "attInfo4" as const,
    fileField: "file4" as const,
  },
];

// 接班
export const TakeoverForm = defineComponent({
  name: "TakeoverForm",
  setup() {
    const { router, route } = useGlobalRouter();
    const id = route.query?.id as string;
    const isDetailPage = route.query?.isDetailPage as string;
    const todoStore = storeTodo();
    const formRef = ref<FormInstance>();
    const state = reactive<{
      detail: HandoverRecordDetailVO | undefined;
      signature: string;
      shiftSignFileId: string;
      loading: boolean;
    }>({
      loading: false,
      detail: undefined,
      signature: "",
      shiftSignFileId: "",
    });
    const isImage = (file: FileVO): boolean => {
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      return !!file.type && imageTypes.includes(file.type.toLowerCase());
    };
    const previewImg = (imgs: FileVO[], index: number): void => {
      showImagePreview(
        imgs.map((f) => f.path ?? ""),
        index,
      );
    };
    const renderFileList = (files?: FileVO[]): JSX.Element => {
      if (!files || files.length === 0) {
        return <div>暂无</div>;
      }
      const imgs = files.filter((file) => isImage(file));
      const others = files.filter((file) => !isImage(file));
      return (
        <div class={styles.selectedItems}>
          <div class={styles["img-list"]}>
            {imgs.map((item: FileVO, index: number) => (
              <div
                class={styles["img-warp"]}
                key={index}
                onClick={() => {
                  previewImg(imgs, index);
                }}
              >
                <Image src={item.path} class={styles["img-item"]} />
              </div>
            ))}
          </div>
          <div class={styles["details-file"]}>
            {others.map((e: FileVO, i: number) => (
              <div
                class={styles["details-file-item"]}
                key={`${e.id}-${i}`}
                onClick={() => {
                  kkFilePreview(e as unknown as FileState);
                }}
              >
                <img class={styles["details-file-img"]} src={getFileName(e)} />
                <div class={styles["details-file-name"]}>{e.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    const filedUploadSlots = {
      input: (): JSX.Element => {
        return renderFileList(state.detail?.files);
      },
    };

    const onConfirm = async () => {
      signatureRef.value?.openDialog();
    };
    const signatureRef = ref<{ openDialog: () => void; closeDialog: () => void }>();
    const onSignatureConfirm = async (signature: string): Promise<void> => {
      if (signature) {
        state.signature = signature;
        signatureRef.value?.closeDialog();
        await uploadSingature();
        await handleSubmit();
      } else {
        signatureRef.value?.openDialog();
      }
    };
    const handleSubmit = async (): Promise<void> => {
      try {
        state.loading = true;
        const params = {
          id: id ?? "",
          takeSignFileId: state.shiftSignFileId,
        };
        await cubeWorkCenterService.takeover(params);
        // ShowNotify({ type: 'success', message: '接班成功' })
        setTimeout(() => {
          todoStore.checkItems = [];
          todoStore.checkUsers = [];
          router.back();
        }, 1 * 1000);
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      } finally {
        setTimeout(() => {
          state.loading = false;
        }, 800);
      }
    };
    const uploadSingature = async (): Promise<void> => {
      try {
        let fileObj = dataUrlToFile(state.signature, "sign-" + new Date().valueOf() + ".png");
        const res = await cubeFileService.uploadFile({
          file: fileObj,
          businessKey: "maintain",
          sceneCode: GLOBAL_SCENE_CODE.workCenter,
        });
        if (res) {
          state.shiftSignFileId = res.id;
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const onSignatureCancel = () => {
      state.signature = "";
      signatureRef.value?.closeDialog();
    };
    const getInfo = async (): Promise<void> => {
      try {
        const params = {
          id: id ?? "",
        };
        const res = await cubeWorkCenterService.getHandoverDetail(params);
        state.detail = res;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    onMounted(() => {
      getInfo();
    });

    return () => {
      const detail = state.detail as (HandoverRecordDetailVO & {
        extend?: {
          attInfo1?: string;
          attInfo2?: string;
          attInfo3?: string;
          attInfo4?: string;
          file1?: FileVO[];
          file2?: FileVO[];
          file3?: FileVO[];
          file4?: FileVO[];
        };
      }) | undefined;
      const extend = detail?.extend;

      return (
        <div class={styles.container}>
          <CubeNavBar title={isDetailPage ? "详情" : "接班"} showBack />
          <div class={styles.form}>
            <Form ref={formRef} required="auto">
              <Field label="交班人" model-value={state.detail?.shiftOverUserName} readonly />
              <Field
                label="交接事项"
                readonly
                v-slots={{
                  input: () => (
                    <div class={styles.itemCount}>
                      {state.detail?.shiftOverTask && state.detail?.shiftOverTask?.length > 0
                        ? `已选择${state.detail?.shiftOverTask.length}项`
                        : ""}
                    </div>
                  ),
                }}
              />
              {state.detail?.shiftOverTask && state.detail?.shiftOverTask?.length > 0 && (
                <div class={[styles.selectedItems, "van-hairline--bottom"]}>
                  {state.detail?.shiftOverTask?.map((item, index) => (
                    <div key={item.id ?? index} class={styles.selectedItem}>
                      <div class={styles.itemInfo}>
                        <p class={styles.itemName}>{item.taskName}</p>
                        <div class={styles.itemTags}>
                          <div class={styles["status-level"]}>
                            <Tag
                              color={applicationBackgroundColor.get(item?.applicationCode || item?.businessType || "") ?? "#1578FF19"}
                              text-color={applicationTextColor.get(item?.applicationCode || item?.businessType || "") ?? "#1578FF"}
                              size="medium"
                            >
                              {item?.applicationName || item?.businessTypeName}
                            </Tag>
                          </div>
                          {/* <span class={styles.tag}>{item.businessTypeName}</span> */}
                        </div>
                      </div>
                      {/* <span class={styles.removeItem} onClick={() => removeItem(index)}>×</span> */}
                    </div>
                  ))}
                </div>
              )}
              <Field
                rows="4"
                label="其他事项或问题"
                autosize
                label-align="top"
                model-value={state.detail?.remarks}
                type="textarea"
                readonly
              />
              <Field label="附件" label-align="top" name="files" v-slots={filedUploadSlots} readonly />

              {handoverExtendEnabled &&
                extend &&
                HANDOVER_EXTEND_SECTIONS.some((cfg) => extend[cfg.textField] || extend[cfg.fileField]) && (
                  <div>
                    {HANDOVER_EXTEND_SECTIONS.map((cfg) => {
                      const text = extend[cfg.textField];
                      const files = extend[cfg.fileField];
                      if (!text && (!files || files.length === 0)) {
                        return null;
                      }
                      return (
                        <div key={cfg.key}>
                          <Field
                            rows="4"
                            label={cfg.label}
                            autosize
                            label-align="top"
                            model-value={text}
                            type="textarea"
                            readonly
                          />
                          {files && files.length > 0 && (
                            <Field
                              label="附件"
                              label-align="top"
                              v-slots={{
                                input: (): JSX.Element => renderFileList(files),
                              }}
                              readonly
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              {state.detail?.shiftOverUserSign?.path && (
                <Field
                  label="交班签名"
                  label-align="top"
                  name="shiftOverUserSign"
                  v-slots={{
                    input: (): JSX.Element => (
                      <div class={styles.selectedItems}>
                        <div class={styles["img-list"]}>
                          <div class={styles["img-warp"]}>
                            <Image src={state.detail?.shiftOverUserSign?.path} class={styles["img-item"]} />
                          </div>
                        </div>
                      </div>
                    ),
                  }}
                  readonly
                />
              )}
              {state.detail?.takeOverUserSign?.path && (
                <Field
                  label="接班签名"
                  label-align="top"
                  name="takeOverUserSign"
                  v-slots={{
                    input: (): JSX.Element => (
                      <div class={styles.selectedItems}>
                        <div class={styles["img-list"]}>
                          <div class={styles["img-warp"]}>
                            <Image src={state.detail?.takeOverUserSign?.path} class={styles["img-item"]} />
                          </div>
                        </div>
                      </div>
                    ),
                  }}
                  readonly
                />
              )}
            </Form>
          </div>
          {!isDetailPage && (
            <div class={styles.footer}>
              <Button type="primary" block onClick={onConfirm} loading={state.loading}>
                确认接班
              </Button>
            </div>
          )}

          <Signature ref={signatureRef} onConfirm={onSignatureConfirm} onCancel={onSignatureCancel} />
        </div>
      );
    };
  },
});
