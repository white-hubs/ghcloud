import { computed, defineComponent, onMounted, ref, type PropType, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeAnnouncementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

const titleIcon = getThemeImage("alarm-record.png");

type NoticeItem = {
  noticeTime?: string;
  title?: string;
  content?: string;
  firstType?: string;
};

type DetailKind = "ANNOUNCEMENT" | "NEW_INFORMATION";

export const createAnnouncementDetailCard = (options: {
  name: string;
  defaultTitle: string;
  firstType: DetailKind;
  panelClass: string;
  offset: number;
}) =>
  defineComponent({
    name: options.name,
    props: {
      title: { type: String as PropType<string>, default: options.defaultTitle },
    },
    setup(props) {
      const notice = ref<NoticeItem | null>(null);
      const loaded = ref(false);
      provide(panelCardLoadedKey, loaded);
      const hasData = computed(() => Boolean(notice.value?.title || notice.value?.content));

      const getData = async (): Promise<void> => {
        try {
          const res = await cubeAnnouncementService.listAnnouncement({
            pageNumber: 1,
            pageSize: 20,
            status: "DISPLAY",
          });
          const list = (res?.records ?? []).filter((e: NoticeItem) => e.firstType === options.firstType);
          notice.value = list[options.offset] ?? list[0] ?? null;
        } catch {
          notice.value = null;
        } finally {
          loaded.value = true;
        }
      };

      onMounted(() => {
        void getData();
      });

      const renderBody = (isZoom: boolean): JSX.Element => (
        <div class={["visor-announce-detail-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasData.value ? (
            <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          ) : (
            <div class={["detail-card", isZoom ? "is-zoom" : ""]}>
              <div class="detail-title">{notice.value?.title || "--"}</div>
              <div class="detail-time">{notice.value?.noticeTime || "--"}</div>
              <div class="detail-content" v-html={notice.value?.content || ""} />
            </div>
          )}
        </div>
      );

      return () => (
        <div class={`v2-panel-root ${options.panelClass}-root`}>
          <SubPanelTemplate
            title={props.title}
            class={`visual-v2-sub-panel v2-panel-card ${options.panelClass}`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={720}
            v-slots={{
              titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
      );
    },
  });
