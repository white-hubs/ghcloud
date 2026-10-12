import { version } from "../../../package.json";
import { EntryHeader } from "./components/header/header";
import { DeptModal } from "@/components/dept-modal/dept-modal";
import "./entry.less";
import { useCache } from "@/hook/use-cache";
import { setPageWidth } from "@/hook/use-fit";
import { getImage } from "@/hook/use-utils";
import { storeUser } from "@/store/user";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

/** 入口页面 */
export const Entry = defineComponent({
  setup() {
    setPageWidth(document.body.clientWidth);
    const { updateCache } = useCache();
    const isInit = ref(false);
    let timer: string | number | NodeJS.Timeout | undefined;

    onMounted(async () => {
      // 更新缓存
      updateCache();
      timer = setTimeout(() => {
        isInit.value = true;
      }, 2000);
      // // 自动跳转到门口屏
      const autoEntranceScreen = localStorage.getItem("auto-entrance-screen");
      if (autoEntranceScreen) {
        router.push({ path: "/entrance-screen" });
      }
    });
    const { tenantInfo } = storeUser();
    const router = useRouter();
    const toNurse = (): void => {
      router.push({ path: "/nurse-station" });
    };
    const toEntrance = (): void => {
      router.push({ path: "/entrance-screen" });
    };
    onUnmounted(() => {
      clearInterval(timer);
    });
    return (): JSX.Element => {
      return (
        <div class="entry-page">
          <EntryHeader />
          <div class="body">
            <span class="tenant-name">{tenantInfo?.name}</span>
            <span class="tips">请选择要进入的监测页面</span>
            <div class="entry-items">
              <div class="entry-item" onClick={toNurse}>
                <img src={getImage("entry-item.webp")} />
                <div class="entry-item-content">
                  <img src={getImage("entry-icon-1.webp")} />
                  <div class="title">护士站</div>
                  <div class="desc">监测多个手术室，适合32寸屏幕</div>
                </div>
              </div>
              <img src="/resource/v1/operating-room/entry-center.webp" />
              <div class="entry-item" onClick={toEntrance}>
                <img src={getImage("entry-item.webp")} style="transform: scale(-1)" />
                <div class="entry-item-content" style="align-items: flex-start;">
                  <img src={getImage("entry-icon-2.webp")} />
                  <div class="title">门口屏</div>
                  <div class="desc">监测单个手术室，适合10寸屏幕</div>
                </div>
              </div>
            </div>
          </div>

          <div class="foot">
            {window.config.copyright} v{version}
          </div>
          {isInit.value && <DeptModal />}
        </div>
      );
    };
  },
});
