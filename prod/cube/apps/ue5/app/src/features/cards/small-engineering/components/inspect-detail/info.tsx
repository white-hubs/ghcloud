import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";

import result from "./result";
import { getErrItemTagRecordDetail } from "@/infrastructure/api/maintain";
import noData from "@/shared-ui/panel/noData";

import styles from "./info.module.less";

export default defineComponent({
  props: {
    parameter: {
      type: Object,
      default: {},
    },
  },
  components: { result, noData },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      formState: {
        targetName: "",
        taskName: "",
        planName: "",
        nickname: "",
        time: "",
        status: "",
        result: "",
        assistNames: "",
        projectFiles: [],
        superviseUser: [],
        standardVOS: [],
      },
      loading: false,
    });
    const getData = () => {
      try {
        state.loading = true;
        getErrItemTagRecordDetail({ id: props.parameter.id, businessType: props.parameter.businessType }).then((res) => {
          state.loading = false;
          state.formState = res;
          state.formState.timeText = res?.time ? moment(res?.time).format("YYYY-MM-DD HH:mm:ss") : "";
        });
      } catch (error) {
        state.loading = false;
        proxy.$message.error(error.message || "请求失败，请稍后再试");
      } finally {
        state.loading = false;
      }
    };

    onMounted(() => {
      getData();
    });
    return {
      ...toRefs(state),
      getData,
    };
  },
});
