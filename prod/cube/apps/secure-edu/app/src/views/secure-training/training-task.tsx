import type { PageResult } from "@/api/common-type";
import { cubeSecureEduHeadQuartersService, cubeSecureEduPublicService, errorMsgHandler } from "@/api/server";
import { getTrainingTaskPage, trainingTaskDel, TrainingTaskStatusUpdate } from "@/api/training-task";
import ThemeSelectInput from "@/components/business/theme-select-input/theme-select-input";
import { Layout } from "@/components/layout/layout";
import { PageOff } from "@/components/page-off/page-off";
import { useAntDTheme } from "@/hook/use-antd-theme";
import { useHeadMode } from "@/hook/use-head-mode";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { TrainingStatusOptions, TrainingTypeOptions, TrainingModeOptions, TrainingTaskStatus } from "@/types/training-task";
import {
  AntModal,
  Button,
  DownOutlined,
  DropDown,
  Form,
  FormItem,
  Input,
  Menu,
  MenuItem,
  Page,
  PopConfirm,
  PopOver,
  Select,
  Table,
  message,
  DatePicker,
} from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import QRCode from "qrcode";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import useClipboard from "vue-clipboard3";
import { useRoute } from "vue-router";

export const TrainingTask = defineComponent({
  setup: () => {
    const { id: marketUrlId, headTenant, marketTenant } = useRoute().query;
    const { themeInject } = useAntDTheme();
    const formState = reactive({
      cultivateTarget: undefined,
      cultivateMode: undefined,
      themeId: undefined,
      cultivateTaskStatus: undefined,
      sourceCode: undefined,
      period: "",
      keyword: "",
    });
    const { isHeadMode, isOutSideLink, basePath } = useHeadMode();

    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", `${basePath}/training-task-form?action=add`);
    };
    const editRow = (record: { id: string; cultivateTaskStatus: TrainingTaskStatus; sourceCode?: string }, detail?: boolean): void => {
      if (!detail) {
        if (record.cultivateTaskStatus === TrainingTaskStatus.PUBLISHED) {
          message.warning("请撤回后再编辑");
          return;
        }
        if (record.cultivateTaskStatus === TrainingTaskStatus.TRAINING) {
          message.warning("培训正在进行中");
          return;
        }
        if (record.cultivateTaskStatus === TrainingTaskStatus.OVER) {
          message.warning("培训已结束");
          return;
        }
      }
      let isHeadTask = false;
      if (isOutSideLink.value || record.sourceCode === "HEADQUARTERS") {
        isHeadTask = true;
      }
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `${basePath}/training-task-form?id=${record.id}&action=${detail ? "detail" : "edit"}${isHeadTask ? "&isHeadTask=true" : ""}${isOutSideLink.value ? "&isOutSideLink=true" : ""}`,
      );
      if (isOutSideLink.value) {
        setTimeout(() => {
          window.location.reload();
        }, 0);
      }
    };
    const delRow = (record: { id: string; cultivateTaskStatus: TrainingTaskStatus; sourceCode?: string }): void => {
      if (isOutSideLink.value || record.sourceCode === "HEADQUARTERS") {
        message.warning("集团发布的任务不支持删除操作");
        return;
      }

      if (record.cultivateTaskStatus === TrainingTaskStatus.PUBLISHED) {
        message.warning("请撤回后再删除");
        return;
      }
      if (record.cultivateTaskStatus === TrainingTaskStatus.TRAINING) {
        message.warning("培训正在进行中");
        return;
      }
      AntModal.confirm({
        centered: true,
        content: "确定要删除该项?",
        async onOk() {
          try {
            if (isHeadMode.value) {
              await cubeSecureEduHeadQuartersService.deleteCultivateTask(record.id).catch(() => message.error("操作失败"));
            } else {
              await trainingTaskDel({ id: record.id });
            }
            AntModal.destroyAll();
            message.success("操作成功");
            getTableData();
          } catch (error) {
            errorMsgHandler(error);
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const withDrawRow = (record: { id: string; cultivateTaskStatus: TrainingTaskStatus }): void => {
      if (record.cultivateTaskStatus === TrainingTaskStatus.WAIT_PUBLISH) {
        message.warning("培训任务未发布");
        return;
      }
      if (record.cultivateTaskStatus === TrainingTaskStatus.OVER) {
        message.warning("培训已结束");
        return;
      }
      if (record.cultivateTaskStatus === TrainingTaskStatus.TRAINING) {
        message.warning("培训正在进行中");
        return;
      }
      AntModal.confirm({
        centered: true,
        content: "确定要撤回该项?",
        async onOk() {
          try {
            if (isHeadMode.value) {
              await cubeSecureEduHeadQuartersService.changeCultivateTaskStatus(record.id, TrainingTaskStatus.REVOKED);
            } else if (isOutSideLink.value) {
              await cubeSecureEduPublicService.changeCultivateTaskStatus(record.id, TrainingTaskStatus.REVOKED);
            } else {
              await TrainingTaskStatusUpdate({ id: record.id, status: TrainingTaskStatus.REVOKED });
            }
            AntModal.destroyAll();
            message.success("操作成功");
            getTableData();
          } catch (error) {
            errorMsgHandler(error);
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const shareLinkRow = async (): Promise<void> => {
      let url = `${window.location.origin}/apps/secure-edu/h5/#/train-list`;
      if (isOutSideLink.value) {
        url += `?marketTenant=${marketTenant}&headTenant=${headTenant}`;
      }

      const { toClipboard } = useClipboard();
      await toClipboard(url);
      message.success("复制成功");
    };
    const publishRow = async (record: { id: string; cultivateTaskStatus: TrainingTaskStatus }): Promise<void> => {
      if (record.cultivateTaskStatus !== TrainingTaskStatus.WAIT_PUBLISH) {
        message.warning("当前状态不支持发布");
        return;
      }
      try {
        loading.value = true;
        if (isHeadMode.value) {
          await cubeSecureEduHeadQuartersService.changeCultivateTaskStatus(record.id, TrainingTaskStatus.PUBLISHED);
        } else if (isOutSideLink.value) {
          await cubeSecureEduPublicService.changeCultivateTaskStatus(record.id, TrainingTaskStatus.PUBLISHED);
        } else {
          await TrainingTaskStatusUpdate({ id: record.id, status: TrainingTaskStatus.PUBLISHED });
        }
        message.success("操作成功");
        getTableData();
      } catch (error) {
        errorMsgHandler(error);
      } finally {
        loading.value = false;
      }
    };
    const qrcode = (record: { id: string; name: string }): void => {
      const canvas = document.getElementById("qrcode") as HTMLCanvasElement; // 获取canvas节点
      QRCode.toCanvas(canvas, record.id, { width: 500, margin: 1 }); // 绘制二维码
      if (canvas) {
        // 将canvas内容转换为图片的base64编码
        const dataUrl = canvas.toDataURL("image/png");

        // 创建img元素，用于预览图片
        const img = document.createElement("img");
        img.src = dataUrl;
        document.querySelector(".qrcode-area")?.appendChild(img);

        // 创建a元素，用于下载图片
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${record.name}.png`;

        // 添加a元素到DOM中，并触发点击事件以下载图片
        document.querySelector(".qrcode-area")?.appendChild(link);
        link.click();
        document.querySelector(".qrcode-area")?.removeChild(link);
        document.querySelector(".qrcode-area")?.removeChild(img);
      }
    };

    const columns = computed(() => {
      const res = [
        {
          title: "序号",
          width: 70,
          align: "center",
          customRender: ({ index }: { index: number }): string => `${index + 1}`,
        },
        {
          title: "任务名称",
          dataIndex: "name",
          width: 150,
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "培训主题",
          dataIndex: "themeName",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "培训类型",
          align: "center",
          width: 80,
          dataIndex: "cultivateTarget",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const type = TrainingTypeOptions.find((e) => (e.value as string) === text)?.label ?? "--";
            return <PopOver content={type}>{type}</PopOver>;
          },
        },
        {
          title: "培训形式",
          align: "center",
          width: 80,
          dataIndex: "cultivateMode",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const mode = TrainingModeOptions.find((e) => (e.value as string) === text)?.label ?? "--";
            return <PopOver content={mode}>{mode}</PopOver>;
          },
        },
        {
          title: "负责人",
          dataIndex: "chargeUserName",
          align: "center",
          width: 100,
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "主讲人",
          dataIndex: "speaker",
          align: "center",
          width: 100,
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "培训截至时间",
          dataIndex: "cultivateEndTime",
          ellipsis: true,
          customRender: ({ text }: { text: number }): JSX.Element => {
            const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "--";
            return <PopOver content={time}>{time}</PopOver>;
          },
        },
        {
          title: "培训地点",
          dataIndex: "cultivateAddress",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "培训内容",
          dataIndex: "cultivateContent",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "参加人数",
          align: "center",
          width: 80,
          dataIndex: "cultivateUserNumber",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "状态",
          align: "center",
          width: 70,
          dataIndex: "cultivateTaskStatus",
          ellipsis: true,
          customRender: ({ text }: { text: TrainingTaskStatus }): JSX.Element => {
            const status = TrainingStatusOptions.find((e) => (e.value as TrainingTaskStatus) === text)?.label ?? "--";
            let color = "black";
            if (text === TrainingTaskStatus.REVOKED) {
              color = "purple";
            } else if (text === TrainingTaskStatus.TRAINING) {
              color = "orange";
            } else if (text === TrainingTaskStatus.WAIT_PUBLISH) {
              color = "red";
            } else if (text === TrainingTaskStatus.PUBLISHED) {
              color = "green";
            }
            return (
              <PopOver content={status}>
                {" "}
                <span style={{ color }}>{status}</span>
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 170,
          customRender: ({
            record,
          }: {
            record: { id: string; cultivateTaskStatus: TrainingTaskStatus; name: string; sourceCode?: string };
          }): JSX.Element => (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record, true);
                }}
              >
                详情
              </Button>
              {!isOutSideLink.value && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    editRow(record);
                  }}
                >
                  编辑
                </Button>
              )}
              <PopConfirm
                title="确认发布该任务？"
                onConfirm={() => {
                  publishRow(record);
                }}
              >
                <Button type="link" size="small">
                  发布
                </Button>
              </PopConfirm>
              <DropDown
                v-slots={{
                  default: () => <DownOutlined />,
                  overlay: () => (
                    <Menu>
                      <MenuItem>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => {
                            delRow(record);
                          }}
                          style={{ width: "100%" }}
                        >
                          删除
                        </Button>
                      </MenuItem>
                      {!isHeadMode.value && (
                        <>
                          {!isOutSideLink.value && (
                            <MenuItem>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  qrcode(record);
                                }}
                                style={{ width: "100%" }}
                              >
                                下载二维码
                              </Button>
                            </MenuItem>
                          )}
                          <MenuItem>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => {
                                shareLinkRow();
                              }}
                              style={{ width: "100%" }}
                            >
                              分享链接
                            </Button>
                          </MenuItem>
                        </>
                      )}
                      <MenuItem>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => {
                            withDrawRow(record);
                          }}
                          style={{ width: "100%" }}
                        >
                          撤回
                        </Button>
                      </MenuItem>
                    </Menu>
                  ),
                }}
              />
            </>
          ),
        },
      ];
      if (!isHeadMode.value && !isOutSideLink.value) {
        res.splice(3, 0, {
          title: "任务来源",
          dataIndex: "sourceCode",
          align: "center",
          width: 100,
          ellipsis: true,
          customRender: ({ text }: { text: string }) => {
            const res = text === "HEADQUARTERS" ? "集团下发" : "自建任务";
            return <PopOver content={res}>{res}</PopOver>;
          },
        });
      }
      return res;
    });

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res: { data: PageResult } = {
          data: {
            total: 0,
            records: [],
            pages: 0,
          },
        };
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
        };
        if (isHeadMode.value) {
          const data = await cubeSecureEduHeadQuartersService.getCultivateTaskPage(params);
          res.data = data;
        } else if (isOutSideLink.value) {
          const data = await cubeSecureEduPublicService.getCultivateTaskPage({
            ...params,
            tenant: headTenant as unknown as number,
            marketTenant: marketTenant as unknown as number,
          });
          res.data = data;
        } else {
          const { data } = await getTrainingTaskPage(params);
          res.data = data;
        }
        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    const reset = (): void => {
      formState.cultivateTarget = undefined;
      formState.cultivateMode = undefined;
      formState.themeId = undefined;
      formState.cultivateTaskStatus = undefined;
      formState.sourceCode = undefined;
      formState.period = "";
      formState.keyword = "";
      queryForm();
    };
    const { scrollYAxis } = useTableScroll();
    const pageOff = ref(false);

    onMounted(async () => {
      if (isOutSideLink.value) {
        themeInject();
        // 外链状态检查
        const marketTaskUrl = await cubeSecureEduPublicService.getMarketTaskUrl({
          id: marketUrlId as string,
          taskType: "CULTIVATE_TASK",
        });
        if (!marketTaskUrl.enabled) {
          pageOff.value = true;
          return;
        }
      }
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element | boolean =>
        !isOutSideLink.value && (
          <Button type="primary" onClick={add}>
            新增
          </Button>
        ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            {!isHeadMode.value && !isOutSideLink.value && (
              <FormItem label="任务来源" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
                <Select
                  v-model:value={formState.sourceCode}
                  style={{ width: "140px" }}
                  allowClear
                  options={[
                    { value: "HEADQUARTERS", label: "集团下发" },
                    { value: "LOCAL_CREATE", label: "自建任务" },
                  ]}
                />
              </FormItem>
            )}

            <FormItem label="培训类型" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <Select v-model:value={formState.cultivateTarget} style={{ width: "140px" }} options={TrainingTypeOptions} allowClear />
            </FormItem>
            <FormItem label="培训形式" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <Select v-model:value={formState.cultivateMode} style={{ width: "140px" }} options={TrainingModeOptions} allowClear />
            </FormItem>
            <FormItem label="培训主题" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <ThemeSelectInput v-model:value={formState.themeId} style={{ width: "140px" }} public tenant={headTenant} />
            </FormItem>
            <FormItem label="状态" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <Select v-model:value={formState.cultivateTaskStatus} style={{ width: "140px" }} options={TrainingStatusOptions} allowClear />
            </FormItem>
            <FormItem label="培训日期" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <DatePicker v-model:value={formState.period} style={{ width: "140px" }} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.keyword} placeholder="培训任务名称" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <Table
            columns={columns.value}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size="small"
            scrollY={scrollYAxis.value}
          />
          <div class="qrcode-area" style={{ display: "none" }}>
            <canvas id="qrcode" />
          </div>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => <>{!pageOff.value ? <Layout title="培训任务" v-slots={layoutSlots} /> : <PageOff />}</>;
  },
});
