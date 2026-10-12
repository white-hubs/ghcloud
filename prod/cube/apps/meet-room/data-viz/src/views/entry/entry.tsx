import { EntryHeader } from "./components/header/header";
import { cubeMeetRoomPublicService } from "@/api/service";
import "./entry.less";
import { MeetInfo } from "@/components/meet-info/meet-info";
import { SwiperList } from "@/components/swiper-list/swiper-list";
import { defineComponent, onMounted, onBeforeUnmount, ref } from "vue";
/** 会议室大屏背景（MinIO） */
const emptyPng = "/resource/v1/meet-room/meet-bg.png";
import type { BookRoomAppointmentVo } from "@ghcloud/cube-meet-room-service";
import { message } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { useRoute } from "vue-router";
/** 入口页面 */
export const Entry = defineComponent({
  setup() {
    const { id } = useRoute().query as { id: string };
    // const id = '1780773849583923201'
    const loading = ref(false);
    const dataSource = ref<BookRoomAppointmentVo>({});
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: 1,
          pageSize: 999,
          conferenceId: id,
          date: dayjs().format("YYYY-MM-DD"),
        };
        const tenantId = ref((import.meta as unknown as { env: { VITE_TENANT_ID: string } }).env.VITE_TENANT_ID);
        const res = await cubeMeetRoomPublicService.getPublicBookRoomInfo(params, tenantId.value);
        if (res) {
          dataSource.value = res;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    // 添加轮询定时器
    const timer = ref<NodeJS.Timeout | null>(null);
    const POLLING_INTERVAL = 30000; // 30秒
    // 开始轮询
    const startPolling = (): void => {
      if (timer.value) return;
      getData();
      timer.value = setInterval(() => {
        getData();
      }, POLLING_INTERVAL);
    };
    onMounted(() => {
      startPolling();
    });
    onBeforeUnmount(() => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    });

    return (): JSX.Element => {
      return (
        <div class="entry-page">
          <img src={emptyPng} class="entry-bg" />
          <div class="entry-content">
            <div class="top">
              <EntryHeader info={dataSource.value} />
              <div class="center">
                <MeetInfo info={dataSource.value} />
              </div>
            </div>
            <div class="footer">
              <SwiperList info={dataSource.value} />
            </div>
          </div>
        </div>
      );
    };
  },
});
