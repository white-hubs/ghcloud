import { computed, defineComponent, onMounted, ref, provide } from "vue";

import NotificationModal from "../../components/notification-modal";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeAnnouncementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./notice-announcement-list.module.less";

const titleIcon = getThemeImage("alarm-record.png");

type NoticeItem = {
  noticeTime?: string;
  title?: string;
  content?: string;
  firstType?: string;
  [key: string]: unknown;
};

export const NoticeAnnouncementList = defineComponent({
  name: "NoticeAnnouncementList",
  setup() {
    const columns = [
      { title: "公告时间", dataIndex: "noticeTime", width: 120, align: "left" as const },
      { title: "公告标题", dataIndex: "title", align: "left" as const, flex: 1 },
      {
        title: "详情",
        dataIndex: "details",
        width: 56,
        align: "center" as const,
        slots: { customRender: "details" },
      },
    ];
    const noticeArr = ref<NoticeItem[]>([]);
    const showModal = ref(false);
    const noticeData = ref<NoticeItem>({});
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => noticeArr.value.length > 0);

    const openDetails = (value: NoticeItem): void => {
      noticeData.value = value;
      showModal.value = true;
    };

    const getData = async (): Promise<void> => {
      try {
        const res = await cubeAnnouncementService.listAnnouncement({
          pageNumber: 1,
          pageSize: 100,
          status: "DISPLAY",
        });
        noticeArr.value = (res?.records ?? []).filter((e: NoticeItem) => e.firstType === "ANNOUNCEMENT");
      } catch {
        noticeArr.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-notice-list-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["table-wrap", isZoom ? "is-zoom" : ""]}>
            <RollTable
              column={columns}
              data={noticeArr.value}
              showLength={isZoom ? 12 : 8}
              v-slots={{
                details: ({ record }: { record: NoticeItem }) => (
                  <span
                    class="details-btn"
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      openDetails(record);
                    }}
                  >
                    详情
                  </span>
                ),
              }}
            />
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-notice-list-v2-root">
        <SubPanelTemplate
          title="通知公告"
          class="visual-v2-sub-panel v2-panel-card visor-notice-list-v2-panel"
          zoomable
          zoom-title="通知公告详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <NotificationModal
          showModal={showModal.value}
          noticeData={noticeData.value}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </div>
    );
  },
});

export default NoticeAnnouncementList;
