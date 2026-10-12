import { Navigation, Pagination, Scrollbar } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, defineComponent, type PropType, ref, watch } from "vue";

import type { AreaType } from "@/infrastructure/api/models/mdata";

import "swiper/css";
import "swiper/css/navigation";

import "./build-tag.module.less";

const pageSize = 10;
const modules = [Pagination, Navigation, Scrollbar];

interface CurBuild {
  props: {
    areaId: string;
    name: string;
  };
}

const sortAreas = (a: AreaType, b: AreaType): number => {
  if (a.sort < b.sort) return -1;
  if (a.sort > b.sort) return 1;
  return 0;
};

export const BuildTag = defineComponent({
  name: "Scada2DBuildTag",
  props: {
    areaList: { type: Array as PropType<AreaType[]>, default: () => [] },
    curBuild: { type: Object as PropType<CurBuild>, default: undefined },
  },
  emits: ["changeBuild"],
  setup(props, { emit }) {
    const list = computed(() => (props.areaList.length ? [...props.areaList].sort(sortAreas) : []));
    const selected = ref<{ id: string; name: string }>(
      props.curBuild ? { id: props.curBuild.props.areaId, name: props.curBuild.props.name } : { id: "", name: "" },
    );
    const swiperRef = ref<InstanceType<typeof Swiper>>();
    const page = ref(1);

    watch(
      () => props.curBuild,
      () => {
        if (props.curBuild) {
          selected.value = { id: props.curBuild.props.areaId, name: props.curBuild.props.name };
        }
      },
    );

    const showPageButton = computed(() => props.areaList.length > pageSize);
    const maxPage = computed(() => Math.ceil(props.areaList.length / pageSize));

    const pageChange = (direction: "up" | "down"): void => {
      if (direction === "up" && page.value <= 1) {
        return;
      }
      if (direction === "down" && page.value >= maxPage.value) {
        return;
      }
      if (direction === "up") {
        page.value--;
        swiperRef.value?.$el.swiper.slidePrev();
      }
      if (direction === "down") {
        page.value++;
        swiperRef.value?.$el.swiper.slideNext();
      }
    };

    const changeBuild = (item: AreaType): void => {
      selected.value = item;
      emit("changeBuild", item);
    };

    return (): JSX.Element => (
      <>
        <div class="tag-container">
          <div
            class={["tag-item waves-effect", { disabled: page.value === 1 }]}
            style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
            onClick={() => {
              pageChange("up");
            }}
          >
            上一页
          </div>

          {list.value.length > pageSize ? (
            <Swiper
              class="swiper-area"
              modules={modules}
              slides-per-view={pageSize}
              slides-per-group={pageSize}
              direction="vertical"
              ref={swiperRef}
            >
              {props.areaList.map((item, index) => (
                <SwiperSlide key={item.id ?? index}>
                  <div
                    class={["tag-item waves-effect", { active: item.id === selected.value?.id }]}
                    onClick={() => {
                      changeBuild(item);
                    }}
                  >
                    {item.name}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            props.areaList.map((item, index) => (
              <div
                class={["tag-item mg-t-12 waves-effect", { active: item.id === selected.value?.id }]}
                key={item.id ?? index}
                onClick={() => {
                  changeBuild(item);
                }}
              >
                {item.name}
              </div>
            ))
          )}

          <div
            class={["tag-item waves-effect", { disabled: page.value === maxPage.value }]}
            style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
            onClick={() => {
              pageChange("down");
            }}
          >
            下一页
          </div>
        </div>
      </>
    );
  },
});

export default BuildTag;
