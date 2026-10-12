import parseAPNG, { type APNG } from "apng-js";
import type Player from "apng-js/types/library/player";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, Page, PopOver, Table } from "@ghcloud/cube-ui";
import FormItem from "@ghcloud/cube-ui/src/components/form-item/form-item";

import { LineChart } from "./state/line-chart";
import { cubeDeviceSuperviseService } from "@/api/service";
import { Layout } from "@/components/layout/layout";

import "@/styles/common.less";

/** 设备健康分析动图（MinIO） */
const imgUrl = "/resource/v1/device-center/animation.png";
const animationPng = "/resource/v1/device-center/animation.png";
interface HealthDetailQueryState {
  pageNumber: number;
  pageSize: number;
  total: number;
}

/** 设备通知 - 通知列表 */
export const HealthDetail = defineComponent({
  setup: () => {
    const { id, areaName, code, name } = useRoute().query as { id: string; code: string; name: string; areaName: string };

    const queryState = useCubeQueryState<HealthDetailQueryState>({
      initialState: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        return raw;
      },
    });

    const goBack = (): void => {
      history.back();
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      historyHealthVlaue();
    };
    const loading = ref(false);
    const state = reactive({
      analysisDetail: {
        createTime: "",
        testItemNumber: "",
        problemItemNumber: "",
      },
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      scrollY: 200,
      lineChart: {
        xData: [],
        yData: [],
      },
      healthValue: 100,
      problemsList: [],
    });
    const playerObj = ref<Player | null>();
    const getImgBuffer = async (url: string): Promise<string | ArrayBuffer | null> => {
      return new Promise(async (resolve) => {
        const blob = await fetch(url).then(async (res) => res.blob());
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onload = (): void => {
          resolve(reader.result);
        };
      });
    };
    const createApngPlayer = async (url: string, ctx: unknown): Promise<Player | null> => {
      const imgBuffer = await getImgBuffer(url);
      const apng = parseAPNG(imgBuffer as ArrayBuffer);
      if (apng && typeof (apng as APNG).getPlayer === "function") {
        const player = await (apng as APNG).getPlayer(ctx as CanvasRenderingContext2D);
        return player;
      } else {
        return null;
      }
    };
    const animationImg = async (img1Src: string, ctx: unknown): Promise<void> => {
      playerObj.value = await createApngPlayer(img1Src, ctx);
      playerObj.value?.play(); // 播放
    };
    // 设备健康分析
    const getHealthProblems = async (): Promise<void> => {
      const data = (await cubeDeviceSuperviseService.getHealthProblems(id)) as {
        createTime: string;
        testItemNumber: string;
        problemItemNumber: string;
        problems: never[];
        healthValue: number;
      };
      if (data) {
        state.analysisDetail = data;
        state.problemsList = [];
        if (data.problems.length) {
          data.problems.forEach(async (item: never) => {
            setTimeout(() => {
              state.problemsList.push(item);
            }, 1000);
          });
          setTimeout(() => {
            state.healthValue = data.healthValue;
            playerObj.value?.stop();
          }, 1000 * data.problems.length);
        } else {
          setTimeout(() => {
            state.healthValue = data.healthValue;
            playerObj.value?.stop();
          }, 3000);
        }
      }
    };
    const resetLoading = ref(false);
    const retest = async (): Promise<void> => {
      try {
        resetLoading.value = true;
        const data = await cubeDeviceSuperviseService.retestCheck({ deviceInstanceId: id });
        if (data) {
          if (playerObj.value?.paused) {
            playerObj.value?.play();
          } else {
            playerObj.value?.pause();
          }
          setTimeout(() => {
            getHealthProblems();
          }, 3000);
        }
      } catch {
      } finally {
        resetLoading.value = false;
        await historyHealthVlaue();
        await getHealthProblems();
        await getAnalysisHealth();
      }
    };
    // 历史健康趋势
    const getAnalysisHealth = async (): Promise<void> => {
      const endTime = dayjs().format("YYYY-MM-DD");
      const startTime = dayjs().subtract(30, "day").format("YYYY-MM-DD");
      const data = await cubeDeviceSuperviseService.historyHealthTrend({ deviceInstanceId: id, period: `${startTime},${endTime}` });
      if (data) {
        state.lineChart.xData = (data as { date: unknown }[]).map((item) => item.date) as never[];
        state.lineChart.yData = (data as { healthValue: unknown }[]).map((item) => item.healthValue) as never[];
      }
    };
    // 历史健康分析值分页
    const historyHealthVlaue = async (): Promise<void> => {
      const params = {
        pageNumber: queryState.state.pageNumber,
        pageSize: queryState.state.pageSize,
        deviceId: id,
      };
      const data = await cubeDeviceSuperviseService.historyHealthVlaue(params);
      if (data) {
        state.data = data.records as never[];
        queryState.update({ total: data.total });
        queryState.writeCache();
      }
    };
    onMounted(async () => {
      await historyHealthVlaue();
      await getHealthProblems();
      await getAnalysisHealth();
    });
    const canvasRef = ref();
    watch(canvasRef, async () => {
      if (!canvasRef.value) {
        return;
      }
      const canvas = canvasRef.value;

      const ctx = canvas.getContext("2d");
      const img1Src = animationPng;
      await animationImg(img1Src, ctx);
      await historyHealthVlaue();
      await getHealthProblems();
      await getAnalysisHealth();
    });
    const columns = [
      {
        title: "分析时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "健康值",
        dataIndex: "healthValue",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
    ];
    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div>
              <div style="display: flex; margin-top: 20px;">
                <FormItem label="设备编号:">{code ? decodeURIComponent(code) : "--"}</FormItem>
                <FormItem label="设备名称:">{name ? decodeURIComponent(name) : "--"}</FormItem>
                <FormItem label="所在区域:">{areaName ? decodeURIComponent(areaName) : "--"}</FormItem>
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <div>
                <div style="display:flex;align-items: center;justify-content: center;flex-direction: column;position: relative;">
                  <img src={imgUrl} alt="" width={400} height={400} />
                  <div class="value" style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
                    {/* <canvas ref='canvasRef' width='300' height='300' /> */}
                    <div class="value-num">
                      <span class="test" style={{ fontSize: state.healthValue ? "34px" : "24px" }}>
                        {state.healthValue || "该设备暂未检测"}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="time">检测时间：{state.analysisDetail?.createTime || "该设备暂未检测"}</div>

                <div class="quest-detail">
                  <div class="header">
                    {`共进行${state.analysisDetail?.testItemNumber}项健康监测，有${state.analysisDetail?.problemItemNumber}项存在问题`}
                  </div>
                  <div class="quest-list">
                    {state.problemsList.length > 0 &&
                      state.problemsList.map((item) => {
                        return (
                          <div class="list-item" key={item}>
                            {item}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div style={{ width: "75%" }}>
                <div style={{ height: "200px" }}>
                  <LineChart xData={state.lineChart.xData} yData={state.lineChart.yData} />
                </div>
                <Table columns={columns} loading={loading.value} dataSource={state.data} pagination={false} size="small" />
                <Page
                  style={{ float: "right", marginTop: "10px" }}
                  v-model:current={queryState.state.pageNumber}
                  v-model:pageSize={queryState.state.pageSize}
                  v-model:total={queryState.state.total}
                  onPageChange={pageChange}
                />
              </div>
            </div>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <>
            <Button style={{ marginRight: "10px" }} type="primary" loading={resetLoading.value} onClick={retest}>
              重新检测
            </Button>
            <Button onClick={goBack}>返回</Button>
          </>
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title="健康分析" v-slots={layoutSlots} />
      </>
    );
  },
});
