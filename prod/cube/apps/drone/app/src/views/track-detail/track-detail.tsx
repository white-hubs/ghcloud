import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { TrackListModel } from "@ghcloud/cube-drone-service";
import { Button, Col, FormItem, Row } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import styles from "./track-detail.module.less";

const renderValue = (value?: number | string): string => {
  if (value === 0) {
    return "0";
  }
  return value ? String(value) : "--";
};

const trackTypeTextMap: Record<number, string> = {
  1: "一维航迹",
  2: "二维航迹",
  3: "三维航迹",
  11: "电力航迹",
};

const getTrackTypeText = (type?: number): string => (type == null ? "--" : (trackTypeTextMap[type] ?? "--"));
const getCreatorName = (track?: TrackListModel | null): string | undefined =>
  track?.createByName ?? track?.createUserName ?? track?.createBy ?? track?.creatorName;

export const TrackDetail = defineComponent({
  name: "TrackDetail",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const trackInfo = ref<TrackListModel | null>(null);

    const loadTrackInfo = (): void => {
      const detail = sessionStorage.getItem("trackInfo");
      trackInfo.value = detail ? (JSON.parse(detail) as TrackListModel) : null;
    };

    onMounted(() => {
      loadTrackInfo();
    });

    return (): JSX.Element => (
      <CubeLayout title={pageTitle}>
        {{
          "layout-content": (): JSX.Element => (
            <div class={styles.content}>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="航线名称">{renderValue(trackInfo.value?.trackName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="项目名称">{renderValue(trackInfo.value?.projectName)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="创建人">{renderValue(getCreatorName(trackInfo.value))}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="航线状态">{renderValue(trackInfo.value?.status)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="航点数量">{renderValue(trackInfo.value?.waypointCount)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="预计飞行时长(秒)">{renderValue(trackInfo.value?.estimatedTime)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="航线类型">{getTrackTypeText(trackInfo.value?.type)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="机巢编码">{renderValue(trackInfo.value?.nestSn)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="机巢名称">{renderValue(trackInfo.value?.nestName)}</FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem label="飞行高度">{renderValue(trackInfo.value?.height)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="飞行速度">{renderValue(trackInfo.value?.speed)}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="云台俯仰角">{renderValue(trackInfo.value?.pitchAngle)}</FormItem>
                </Col>
              </Row>
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <Button
              type="primary"
              onClick={() => {
                router.push({ path: "/drone-route" });
              }}
            >
              返回
            </Button>
          ),
        }}
      </CubeLayout>
    );
  },
});
