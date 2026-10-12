import { defineComponent, ref, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./xsk-project-product-statistics.module.less";
const ZD_SVG = "/resource/v1/ue5-migrate/components/businessPanel/zhongda-heshun/assets/svg";
const IconKeyPlace = `${ZD_SVG}/key-place.svg`;
const IconRubbishStation = `${ZD_SVG}/rubbish-station.svg`;
const IconPublicToilet = `${ZD_SVG}/public-toilet.svg`;
const IconPublicInstitution = `${ZD_SVG}/public-institution.svg`;
const IconPark = `${ZD_SVG}/park.svg`;
const IconWorkStation = `${ZD_SVG}/work-station.svg`;
import { Button, Skeleton } from "ant-design-vue";

import { showKeyPlaceMarker, showPersonMarker, showProjectMarker } from "@/features/cards/zhongda-heshun/utils/common";
import { drawGeoJsonLayer } from "@/features/cards/zhongda-heshun/utils/gis-helper";
import { findBestMatchingIcon } from "@/features/cards/zhongda-heshun/utils/icon-helper";
import { createKeyPlaceModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import { debounce } from "@/infrastructure/utils/common";
import NoData from "@/shared-ui/panel/noData";
import { clearMap } from "@/visualization-core/event/register/gis";
const IconUser = `${ZD_SVG}/user.svg`;
import { ProjectProductStatisticsVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { ProgressBar } from "@/features/cards/zhongda-heshun/components/progress-bar/progress-bar";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

/** 产品统计 */
export const XSKProjectProductStatistics = defineComponent({
  setup() {
    const dataList = ref<ProjectProductStatisticsVO[]>([]);
    const visible = ref(false);
    const total = ref(0);
    const loading = ref(false);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;

        const res = await cubeZDDataVizService.getProjectProductCount();
        if (res) {
          total.value = res;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const getListData = async (): Promise<void> => {
      try {
        loading.value = true;

        const res = await cubeZDDataVizService.getProjectProductTypeCount();
        if (res) {
          dataList.value = res;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    onMounted(() => {
      getData();
      getListData();
    });

    return (): JSX.Element => (
      <SubPanelTemplate
        v-slots={{
          extra: () => (
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
          ),
        }}
        titleFontSize="22px"
      >
        <Skeleton loading={loading.value} active>
          <div class={styles["user-static"]}>
            <div class={styles["label"]}>
              <img src={IconUser} />
              产品总数
            </div>
            <div class={styles["value"]}>
              {total.value}
              <span class={styles["unit"]}>个</span>
            </div>
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
          title={"产品列表"}
          size="large"
          style={{ width: "1000px" }}
          // width={'1000px'}
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
