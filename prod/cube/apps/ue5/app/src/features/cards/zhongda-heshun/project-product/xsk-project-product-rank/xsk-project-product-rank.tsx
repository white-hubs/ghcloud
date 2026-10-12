import { defineComponent, ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./xsk-project-product-rank.module.less";
const ZD_SVG = "/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg";
const IconKeyPlace = `${ZD_SVG}/key-place.svg`;
const IconRubbishStation = `${ZD_SVG}/rubbish-station.svg`;
const IconPublicToilet = `${ZD_SVG}/public-toilet.svg`;
const IconPublicInstitution = `${ZD_SVG}/public-institution.svg`;
const IconPark = `${ZD_SVG}/park.svg`;
const IconWorkStation = `${ZD_SVG}/work-station.svg`;
import { Button, Select, Skeleton } from "ant-design-vue";

import { showKeyPlaceMarker, showPersonMarker, showProjectMarker } from "@/features/cards/zhongda-heshun/utils/common";
import { drawGeoJsonLayer } from "@/features/cards/zhongda-heshun/utils/gis-helper";
import { findBestMatchingIcon } from "@/features/cards/zhongda-heshun/utils/icon-helper";
import { createKeyPlaceModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import { debounce } from "@/infrastructure/utils/common";
import NoData from "@/shared-ui/panel/noData";
import { clearMap } from "@/visualization-core/event/register/gis";
const IconUser = `${ZD_SVG}/user.svg`;
import dayjs from "dayjs";

import { ProjectProductStatisticsVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { ProgressBar } from "@/features/cards/zhongda-heshun/components/progress-bar/progress-bar";
import { ProjectSelect } from "@/features/cards/zhongda-heshun/components/project-select/project-select";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

/** 产品统计 */
export const XSKProjectProductRank = defineComponent({
  setup() {
    interface KeyPlaceListItem {
      name: string;
      value: number;
      icon: any;
      id?: string;
    }
    const dataList = ref<ProjectProductStatisticsVO[]>([]);
    const visible = ref(false);
    const time = ref("today");
    const total = ref(100);
    const loading = ref(false);

    /**
     * 根据时间类型生成对应的日期范围
     */
    const generatePeriod = (timeType: string): string => {
      const now = dayjs();
      let startTime: string;
      let endTime: string = now.format("YYYY-MM-DD HH:mm:ss");

      switch (timeType) {
        case "today":
          startTime = now.startOf("day").format("YYYY-MM-DD HH:mm:ss");
          break;
        case "week":
          startTime = now.startOf("week").format("YYYY-MM-DD HH:mm:ss");
          break;
        case "month":
          startTime = now.startOf("month").format("YYYY-MM-DD HH:mm:ss");
          break;
        case "year":
          startTime = now.startOf("year").format("YYYY-MM-DD HH:mm:ss");
          break;
        default:
          startTime = now.startOf("day").format("YYYY-MM-DD HH:mm:ss");
      }

      return `${startTime},${endTime}`;
    };

    const getListData = async (): Promise<void> => {
      try {
        loading.value = true;

        const params = {
          period: generatePeriod(time.value),
        };
        const res = await cubeZDDataVizService.getProjectProductRank(params);
        if (res) {
          dataList.value = res;
          total.value = (res ?? [])?.reduce((acc, cur) => acc + cur.count, 0);
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    onMounted(() => {
      getListData();
    });
    const options = [
      {
        label: "今日",
        value: "today",
      },
      {
        label: "本周",
        value: "week",
      },
      {
        label: "本月",
        value: "month",
      },
      {
        label: "今年",
        value: "year",
      },
    ];
    return (): JSX.Element => (
      <SubPanelTemplate
        v-slots={{
          extra: () => (
            // <ProjectSelect v-model:value={projectId.value} placeholder='请选择项目' width='150px' onChange={getData} />
            <Select
              placeholder="请选择项目"
              v-model:value={time.value}
              style={{ width: "180px", cursor: "pointer" }}
              options={options}
              onChange={getListData}
            ></Select>
          ),
        }}
        titleFontSize="22px"
      >
        <Skeleton loading={loading.value} active>
          <div class={styles["user-static"]}>
            <Button
              type="link"
              size="small"
              style={{ color: "#b0c5ff", fontSize: "18px" }}
              onClick={() => {
                visible.value = true;
              }}
            >
              更多&gt;&gt;
            </Button>
          </div>
          <div class={styles.scroll}>
            {dataList.value?.length === 0 && <NoData />}
            {dataList.value.map((item) => (
              <div class={styles.item} key={item.productType}>
                <ProgressBar total={total.value} label={item.productType} value={item.count} />
              </div>
            ))}
          </div>
        </Skeleton>
        <BaseModal
          v-model:visible={visible.value}
          title={"产品增量排名"}
          size="large"
          style={{ width: "1000px" }}
          onClose={() => {
            // emit('close')
          }}
        >
          <div class={styles.modelScroll}>
            {dataList.value?.length === 0 && <NoData />}
            {dataList.value.map((item) => (
              <div class={styles.item} key={item.productType}>
                <ProgressBar total={total.value} label={item.productType} value={item.count} />
              </div>
            ))}
          </div>
        </BaseModal>
      </SubPanelTemplate>
    );
  },
});
