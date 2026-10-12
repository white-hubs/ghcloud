import { Navigation, Pagination, Scrollbar } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, defineComponent, onMounted, type PropType, ref, watch } from "vue";
import "swiper/css";
import "swiper/css/navigation";

import "./floor.module.less";

const pageSize = 10;
const modules = [Pagination, Navigation, Scrollbar];
import type { FloorType } from "./floor-types";

export const Floor = defineComponent({
  name: "Scada2DFloor",
  props: {
    floors: { type: Array as PropType<FloorType[]>, default: () => [] },
  },
  emits: ["floorBack", "changeFloor"],
  setup(props, { emit }) {
    const floorList = ref<FloorType[]>(props.floors ?? []);
    const selectedFloor = ref<FloorType>();
    const swiperRef = ref<InstanceType<typeof Swiper>>();
    const page = ref(1);

    const showPageButton = computed(() => floorList.value.length > pageSize);
    const maxPage = computed(() => Math.ceil(floorList.value.length / pageSize));

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

    onMounted(() => {
      floorList.value = props.floors;
    });

    watch(
      () => props.floors,
      (value) => {
        floorList.value = value;
      },
    );

    const backArea = (): void => {
      if (!selectedFloor.value) {
        floorList.value = [];
      }
      emit("floorBack");
      selectedFloor.value = undefined;
    };

    const changeFloor = (item: FloorType): void => {
      selectedFloor.value = item;
      emit("changeFloor", item);
    };

    return (): JSX.Element => (
      <div class="floor-container">
        {page.value > 1 ? (
          <div
            class={["floor-item waves-effect", { disabled: page.value === 1 }]}
            style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
            onClick={() => {
              pageChange("up");
            }}
          >
            上一页
          </div>
        ) : (
          <div class="floor-item waves-effect" onClick={backArea}>
            返回
          </div>
        )}

        {floorList.value.length > pageSize ? (
          <Swiper
            class="swiper-area"
            modules={modules}
            slides-per-view={pageSize}
            slides-per-group={pageSize}
            direction="vertical"
            ref={swiperRef}
            observe-parents={true}
            observer={true}
            observeSlideChildren={true}
          >
            {floorList.value.map((item, index) => (
              <SwiperSlide key={item.id ?? index}>
                <div
                  class={["floor-item waves-effect", { active: item.id === selectedFloor.value?.id }]}
                  onClick={() => {
                    changeFloor(item);
                  }}
                >
                  {item.name}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          floorList.value.map((item, index) => (
            <div
              class={["floor-item mg-t-12 waves-effect", { active: item.id === selectedFloor.value?.id }]}
              key={item.id ?? index}
              onClick={() => {
                changeFloor(item);
              }}
            >
              {item.name}
            </div>
          ))
        )}

        <div
          class={["floor-item waves-effect", { disabled: page.value === maxPage.value }]}
          style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
          onClick={() => {
            pageChange("down");
          }}
        >
          下一页
        </div>
      </div>
    );
  },
});

export default Floor;
