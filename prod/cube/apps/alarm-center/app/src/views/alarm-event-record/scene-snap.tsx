import { cubeLinkageService } from "@/api/service";
import type { MediaState } from "@ghcloud/cube-alarm-center-service";
import { Row, Col, Image } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref, watch } from "vue";

interface Props {
  eventId: string;
}

export const SceneSnap = defineComponent({
  props: {
    eventId: {
      type: String,
      required: true,
    },
  },
  setup: (props: Props) => {
    const mediaList = ref<MediaState[]>([]);
    const serveIp = window.location.protocol;

    const getLinkageMedia = async (): Promise<void> => {
      if (!props.eventId) {
        return;
      }
      try {
        const result = await cubeLinkageService.getEventVideoImages({ eventId: props.eventId });
        mediaList.value = result;
      } catch {
        mediaList.value = [];
      }
    };

    onMounted(() => {
      getLinkageMedia();
    });

    watch(
      () => props.eventId,
      () => {
        getLinkageMedia();
      },
    );

    return (): JSX.Element | null => {
      const images = mediaList.value
        .filter((item) => item.type === "PHOTOGRAPH")
        .map((item) => (serveIp === "http:" ? item.intranetFilePath : item.extranetFilePath));
      const videos = mediaList.value
        .filter((item) => item.type !== "PHOTOGRAPH")
        .map((item) => (serveIp === "http:" ? item.intranetFilePath : item.extranetFilePath));

      if (images.length === 0 && videos.length === 0) {
        return null;
      }

      return (
        <div style={{ padding: "0 20px 20px" }}>
          {images.length > 0 && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 600, margin: "8px 0 12px" }}>现场抓拍</div>
              <Row gutter={[32, 16]}>
                {images.map((src, index) => (
                  <Col key={`${src}-${index}`} span={8}>
                    <Image src={src} width="100%" height="260px" />
                  </Col>
                ))}
              </Row>
            </>
          )}
          {videos.length > 0 && (
            <>
              <div style={{ fontSize: "16px", fontWeight: 600, margin: "24px 0 12px" }}>现场录像</div>
              <Row gutter={[32, 16]}>
                {videos.map((src, index) => (
                  <Col key={`${src}-${index}`} span={8}>
                    <video src={src} controls style={{ width: "100%", maxHeight: "260px", objectFit: "fill" }} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      );
    };
  },
});
