import styles from "./index.module.less";
import { cubeGridManagementService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { GridHandoverDetailDTO, GridHandoverFileVO } from "@ghcloud/cube-grid-management-service";
import { Button, Field, Form, Image, showImagePreview, showNotify } from "vant";
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

const formatTime = (time?: string | number): string => {
  if (time === undefined || time === null || time === "") {
    return "-";
  }
  const raw = String(time).trim();
  let date: Date;
  if (/^\d+$/.test(raw)) {
    const timestamp = Number(raw);
    date = new Date(raw.length === 10 ? timestamp * 1000 : timestamp);
  } else {
    date = new Date(raw.replace(/-/g, "/"));
  }
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  const pad = (num: number): string => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

export const GridTakeover = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const handoverId = String(route.query.id || "");
    const isDetailPage = String(route.query.isDetailPage || "") === "true";
    const redirectPath = String(route.query.redirect || "");
    const activeTab = String(route.query.active || "");
    const state = reactive<{
      loading: boolean;
      detail: GridHandoverDetailDTO | undefined;
    }>({
      loading: false,
      detail: undefined,
    });

    const getDetail = async () => {
      if (!handoverId) {
        showNotify({ type: "warning", message: "缺少交接班ID" });
        router.back();
        return;
      }
      try {
        state.detail = await cubeGridManagementService.getGridHandoverDetail({ id: handoverId });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "获取交接详情失败" });
      }
    };

    onMounted(() => {
      getDetail();
    });

    const isImage = (file: GridHandoverFileVO): boolean => {
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      return !!file.type && imageTypes.includes(file.type.toLowerCase());
    };
    const previewImg = (imgs: GridHandoverFileVO[], index: number): void => {
      showImagePreview(
        imgs.map((f) => f.path ?? "").filter((path) => !!path),
        index,
      );
    };
    const openFile = (file: GridHandoverFileVO): void => {
      if (file.path) {
        window.open(file.path, "_blank");
      }
    };
    const renderFileList = (files?: GridHandoverFileVO[]): JSX.Element => {
      if (!files || files.length === 0) {
        return <div class={styles["empty-file"]}>暂无</div>;
      }
      const imgs = files.filter((file) => isImage(file));
      const others = files.filter((file) => !isImage(file));
      return (
        <div class={styles["attachment-wrap"]}>
          <div class={styles["img-list"]}>
            {imgs.map((item, index) => (
              <div
                class={styles["img-wrap"]}
                key={`${item.id || item.path || "img"}-${index}`}
                onClick={() => {
                  previewImg(imgs, index);
                }}
              >
                <Image src={item.path} class={styles["img-item"]} />
              </div>
            ))}
          </div>
          <div class={styles["file-list"]}>
            {others.map((item, index) => (
              <div
                class={styles["file-item"]}
                key={`${item.id || item.path || "file"}-${index}`}
                onClick={() => {
                  openFile(item);
                }}
              >
                {item.name || item.path || "附件"}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const onConfirm = () => {
      router.push({
        path: "/my-grid/handover/signature",
        query: { id: handoverId, redirect: redirectPath || "/grid-list", active: activeTab, backSteps: redirectPath ? "0" : "2" },
      });
    };

    return (): JSX.Element => {
      const extend = state.detail?.extend;
      return (
        <div class={styles["container"]}>
          <CubeNavBar title="接班" />
          <div class={styles["content"]}>
            <Form>
              <Field label="交班人" readonly model-value={state.detail?.shiftOverUserName || "-"} />
              <Field label="交接网格" readonly model-value={state.detail?.gridAreaName || "-"} />
              <Field label="交班时间" readonly model-value={formatTime(state.detail?.shiftOverTime)} />
              <Field
                rows="4"
                label="其他事项/问题"
                autosize
                label-align="top"
                model-value={state.detail?.remarks || ""}
                type="textarea"
                readonly
              />
              {extend?.attInfo1 && (
                <div>
                  <Field
                    rows="3"
                    label="整理内务，填报记录"
                    autosize
                    label-align="top"
                    model-value={extend.attInfo1}
                    type="textarea"
                    readonly
                  />
                  {extend.file1 && extend.file1.length > 0 && (
                    <Field label="附件" label-align="top" readonly v-slots={{ input: () => renderFileList(extend.file1) }} />
                  )}
                </div>
              )}
              {extend?.attInfo2 && (
                <div>
                  <Field
                    rows="3"
                    label="检查设备（含岗亭道闸）数量和状态，寻找遗失物品、登记损坏情况"
                    autosize
                    label-align="top"
                    model-value={extend.attInfo2}
                    type="textarea"
                    readonly
                  />
                  {extend.file2 && extend.file2.length > 0 && (
                    <Field label="附件" label-align="top" readonly v-slots={{ input: () => renderFileList(extend.file2) }} />
                  )}
                </div>
              )}
              {extend?.attInfo3 && (
                <div>
                  <Field
                    rows="3"
                    label="集体学习、总结"
                    autosize
                    label-align="top"
                    model-value={extend.attInfo3}
                    type="textarea"
                    readonly
                  />
                  {extend.file3 && extend.file3.length > 0 && (
                    <Field label="附件" label-align="top" readonly v-slots={{ input: () => renderFileList(extend.file3) }} />
                  )}
                </div>
              )}
              {extend?.attInfo4 && (
                <div>
                  <Field
                    rows="3"
                    label="岗位和任务安排，交接需跟进的工作事项"
                    autosize
                    label-align="top"
                    model-value={extend.attInfo4}
                    type="textarea"
                    readonly
                  />
                  {extend.file4 && extend.file4.length > 0 && (
                    <Field label="附件" label-align="top" readonly v-slots={{ input: () => renderFileList(extend.file4) }} />
                  )}
                </div>
              )}
            </Form>
          </div>
          {!isDetailPage && state.detail?.status === "WAIT_HANDOVER" && (
            <div class={styles["footer"]}>
              <Button type="primary" block loading={state.loading} onClick={onConfirm}>
                确认接班
              </Button>
            </div>
          )}
        </div>
      );
    };
  },
});
