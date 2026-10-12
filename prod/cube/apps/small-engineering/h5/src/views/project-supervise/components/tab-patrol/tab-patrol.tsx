import dayjs from "dayjs";
import { PullRefresh, showNotify, List, CellGroup, Empty, Cell } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { ArchivesDetail, DetailRecordPage } from "@ghcloud/cube-daily-inspection-service";

import { cubeDailyInspectionService } from "@/api/server";

import "./tab-patrol.less";

export const TabPatrol = defineComponent({
  setup() {
    const router = useRouter();
    const { id } = useRoute().query as { id: string };
    const dataSource = ref<DetailRecordPage[]>([]);
    const targetDetail = ref<ArchivesDetail>({
      id: "",
      targetId: "",
      targetName: "",
      targetCategory: "",
      areaName: "",
      organizationName: "",
      time: 0,
      result: "",
      dailyNum: 0,
      dailyErrNum: 0,
      dailyList: [],
      temporaryNum: 0,
      temporaryErrNum: 0,
      temporaryList: [],
    });
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });
    const getDataSource = async (): Promise<{ total: number; records: DetailRecordPage[] }> => {
      try {
        const params = {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          targetId: id,
          temporary: "0",
          businessType: "SMALL_ENGINEERING",
        };
        const { total, records } = await cubeDailyInspectionService.detailRecordPage(params);
        return { total, records };
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
        return { total: 0, records: [] };
      }
    };
    const getTargetDetail = async (): Promise<void> => {
      try {
        targetDetail.value = await cubeDailyInspectionService.getInspectArchivesDetail({
          targetId: id,
          businessType: "SMALL_ENGINEERING",
          targetCategory: "SMALL_ENGINEERING",
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };

    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await getDataSource();
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0;
      finished.value = false;
      await onLoad();
      getTargetDetail();
    };
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0;
      onRefresh();
    };
    onMounted(() => {
      getData();
    });

    const toDetail = (value: DetailRecordPage): void => {
      router.push({ path: "/inspection-record-detail", query: { id: value.id } });
    };
    return (): JSX.Element => (
      <>
        <div class="patrol-title">
          <span>巡查次数：{targetDetail.value?.dailyNum ?? "0"}次 </span>
          <span>巡检发现异常：{targetDetail.value?.dailyErrNum ?? "0"}项</span>
        </div>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class="patrol-list">
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {dataSource.value &&
              dataSource.value.length > 0 &&
              dataSource.value.map((e) => (
                <CellGroup inset key={e.id} class="list-item">
                  <div
                    class="van-cell card-body"
                    onClick={() => {
                      toDetail(e);
                    }}
                  >
                    <div class="right">
                      <Cell is-link title={e.taskName || "--"} value="" border style={{ width: "100%", padding: "0px" }} />
                      <div class="item">巡查时间：{dayjs(e.time).format("YYYY-MM-DD HH:mm")}</div>
                      <div class="item">巡查人：{e.username || "--"}</div>
                      <div class="item">巡查部门：{e.organizationName || "--"}</div>
                      <div class="item">
                        巡查任务结果：
                        <span class={["status", e.result === "NORMAL" ? "normal" : "warn"]}>{e.result === "NORMAL" ? "正常" : "异常"}</span>
                      </div>
                    </div>
                  </div>
                </CellGroup>
              ))}
            {dataSource.value.length === 0 && search.pageNumber === 1 && !loading.value && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
      </>
    );
  },
});
