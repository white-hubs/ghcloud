import { cubeFileService } from "../../api/server";
import { Image } from "vant";
import { defineComponent, ref } from "vue";

export const OssPicture = defineComponent({
  props: {
    id: {
      type: [String, Number],
      default: "",
    },
  },
  setup(props) {
    const path = ref("");
    if (props.id) {
      cubeFileService.getFileInfo(props.id as string).then((res) => {
        path.value = res.path || "";
      });
    }
    return () => (
      <>
        <Image width="50" height="50" src={path.value} showLoading={true} />
      </>
    );
  },
});
