import styles from "./my-booking.module.less";
import { bookStatus, bookStatusBackColor, bookStatusColor } from "./type";
import { cubeOuaaService, cubeVisitorManagementService } from "@/api/server";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { Cell, CellGroup, Empty, PullRefresh, List, Button, Tag, showConfirmDialog, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
interface AppointmentType {
  areaName: string;
  dayStr: string;
  timeStr: string;
  name: string;
  phone: string;
  status: number;
  id: string | number;
}
export const MyBooking = defineComponent({
  setup() {
    useMetaTitle();
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const search = reactive({
      phone: "",
      pageNumber: 0,
      total: 1,
      pageSize: 10,
    });
    const router = useRouter();
    const dataSource = ref<AppointmentType[]>([]);
    // 获取预约列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        finished.value = false;
        search.pageNumber++;
        if (search.phone) {
          const res = await cubeVisitorManagementService.getReservationRecordPage({ ...search });
          search.total = res.total;
          if (res.total <= search.pageSize) {
            finished.value = true;
          }
          if (res.records.length < search.pageSize) {
            finished.value = true;
          }
          if (!dataSource.value) {
            dataSource.value = [];
          }
          if (search.pageNumber === 1) {
            dataSource.value = [];
          }
          dataSource.value = [...dataSource.value, ...res.records];
        }
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const onSearch = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    const toResult = (item: AppointmentType): void => {
      router.push({
        path: "/result",
        query: {
          detail: JSON.stringify({
            id: item.id,
            areaName: item.areaName,
            timeStr: item.timeStr,
            dayStr: item.dayStr,
            name: item.name,
          }),
        },
      });
    };
    const handleCancel = (item: AppointmentType): void => {
      showConfirmDialog({
        cancelButtonText: "否",
        confirmButtonText: "是",
        message: "是否确定取消预约？",
      }).then(async () => {
        try {
          await cubeVisitorManagementService.reservationCancel({ id: item.id as string });
          showNotify({ type: "success", message: "已取消预约" });
          onSearch();
        } catch {
          showNotify({ type: "danger", message: "取消失败" });
        }
      });
    };
    onMounted(async () => {
      const { mobile } = await cubeOuaaService.getUserMine();
      search.phone = mobile;
      onSearch();
    });
    return (): JSX.Element => (
      <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "100vh", overflow: "auto", background: "#F7F7F7" }}>
        <List
          v-model:loading={loading.value}
          finished={finished.value}
          finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
          onLoad={onLoad}
        >
          {dataSource.value &&
            dataSource.value.length > 0 &&
            dataSource.value.map((item) => (
              <CellGroup inset class={styles["cell-group"]} key={item}>
                <Cell>
                  <div class={styles["cell-title"]}>
                    <div class={styles["name-status"]}>
                      <span class={styles.name}>{item.areaName || "--"}</span>
                      <Tag
                        style={{ height: "22px", borderRadius: "4px" }}
                        color={bookStatusBackColor.get(item.status.toString())}
                        text-color={bookStatusColor.get(item.status.toString())}
                      >
                        {bookStatus.get(item.status.toString())}
                      </Tag>
                    </div>
                  </div>
                </Cell>
                <Cell class={styles.cell}>
                  <div class={styles["cell-item"]}>
                    <label>预约日期：</label>
                    <span>{item.dayStr || "--"}</span>
                  </div>
                  <div class={styles["cell-item"]}>
                    <label>预约时段：</label>
                    <span>{item.timeStr || "--"}</span>
                  </div>
                  <div class={styles["cell-item"]}>
                    <label>使用预约人员：</label>
                    <span>{`${item.name}(${item.phone})`}</span>
                  </div>
                  <div style={{ paddingTop: "10px" }}>
                    <Button
                      onClick={() => {
                        handleCancel(item);
                      }}
                      v-show={item.status === 1}
                      type="default"
                      size="small"
                      style={{ width: "60px", marginRight: "10px" }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={() => {
                        toResult(item);
                      }}
                      v-show={item.status === 1 || item.status === 2 || item.status === 3}
                      type="primary"
                      size="small"
                      style={{ width: "70px" }}
                    >
                      预约码
                    </Button>
                  </div>
                </Cell>
              </CellGroup>
            ))}
          {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
        </List>
      </PullRefresh>
    );
  },
});
