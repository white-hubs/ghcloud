import { defineComponent, reactive, onMounted } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import { Empty } from "@ghcloud/cube-ui";

import { cubeAnnouncementService } from "../../../api/service";
import PanelCard from "../../card/card";

import "./notice.less";

interface NoticeItem {
  id: string;
  typeName: string;
  title: string;
  createBy: string;
  noticeTime: string;
}

interface NoticeState {
  list: NoticeItem[];
}

export default defineComponent({
  name: "Notice",
  emits: ["close"],
  setup(props, { emit }) {
    const state = reactive<NoticeState>({
      list: [],
    });

    const handleClose = (): void => {
      emit("close");
    };

    const getData = (): void => {
      cubeAnnouncementService.listAnnouncement({ pageNumber: 1, pageSize: 5 }).then((res) => {
        state.list = [...(res.records as unknown as NoticeItem[])].sort(
          (left, right) => new Date(right.noticeTime).getTime() - new Date(left.noticeTime).getTime(),
        );
      });
    };

    onMounted(() => {
      getData();
    });

    const goNotice = (id?: string): void => {
      const path = id ? `/portal/technicalBulletin/noticeInfo?id=${id}` : "/portal/technicalBulletin/noticeInfo";
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, { code: "TECHNICAL_BULLETIN", path });
    };

    return (): JSX.Element => (
      <PanelCard title="通知公告" icon="icon-xitongtongzhigonggao" onClose={handleClose}>
        {{
          btn: () => <a onClick={() => goNotice()}>查看全部 &gt;</a>,
          default: () => (
            <div class="notice-container">
              {state.list.length > 0 ? (
                state.list.map((item) => (
                  <button class="notice-item" key={item.id} type="button" onClick={() => goNotice(item.id)}>
                    <div class="notice-info">
                      <span>【{item.typeName}】</span>
                      {item.title}
                    </div>
                    <div class="notice-time">{item.noticeTime}</div>
                  </button>
                ))
              ) : (
                <div style={{ width: "100%" }}>
                  <Empty description="暂无数据" />
                </div>
              )}
            </div>
          ),
        }}
      </PanelCard>
    );
  },
});
