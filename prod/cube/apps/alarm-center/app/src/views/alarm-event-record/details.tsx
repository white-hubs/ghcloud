import { getAssistConfirmResultText } from "./assist-confirm-result";
import { SceneSnap } from "./scene-snap";
import { cubeLinkageService } from "@/api/service";
import type { AlarmEventRecord } from "@ghcloud/cube-alarm-center-service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { Row, Col, Form, FormItem, Space, Button } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const AlarmEventRecordDetails = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const id = route.query.id as string;
    const details = ref<AlarmEventRecord>({} as AlarmEventRecord);

    const infoItems: { label: string; render: () => string }[] = [
      {
        label: "事件名称：",
        render: () => details.value.name || "--",
      },
      {
        label: "事件时间：",
        render: () => {
          const t = details.value.eventTime;
          if (t === undefined || t === null || t === "") {
            return "--";
          }
          return dayjs(t as string | number).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        label: "事件设备：",
        render: () => details.value.eventDevice?.name || "--",
      },
      {
        label: "事件级别：",
        render: () => details.value.eventLevel?.name || "--",
      },
      {
        label: "事件区域：",
        render: () => details.value.eventDevice?.areaName || "--",
      },
      {
        label: "设备位置：",
        render: () => {
          const text = `${details.value.eventDevice?.address ?? ""} ${details.value.eventDevice?.lntAndLat ?? ""}`.trim();
          return text || "--";
        },
      },
      {
        label: "事件研判：",
        render: () => getAssistConfirmResultText(details.value.assistConfirmResult?.result),
      },
      {
        label: "事件类型：",
        render: () => details.value.eventType?.name || "--",
      },
    ];

    const getDetails = async () => {
      const res = await cubeLinkageService.getAlarmEventRecordDetails(id);
      details.value = res;
    };

    onMounted(() => {
      getDetails();
    });

    const handleBack = (): void => {
      const returnUrl = typeof route.query.returnUrl === "string" ? route.query.returnUrl : "";
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
      history.back();
    };

    return (): JSX.Element => {
      const slots = {
        "layout-content": (): JSX.Element => (
          <>
            <Form layout="horizontal" style={{ padding: "20px 20px" }} labelCol={{ style: { minWidth: "96px", fontWeight: "bold" } }}>
              <Row gutter={[0, 0]}>
                {infoItems.map((item) => (
                  <Col key={item.label} span={8}>
                    <FormItem label={item.label}>{item.render()}</FormItem>
                  </Col>
                ))}
              </Row>
            </Form>
            {details.value.eventId && <SceneSnap eventId={details.value.eventId} />}
          </>
        ),
        "footer-page": (): JSX.Element => (
          <Space>
            <Button
              onClick={() => {
                handleBack();
              }}
            >
              返回
            </Button>
          </Space>
        ),
      };

      return <CubeLayout key={details.value.id || "pending"} title={pageTitle} v-slots={slots} />;
    };
  },
});
