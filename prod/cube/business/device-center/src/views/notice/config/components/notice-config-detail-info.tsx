import type { NotifyConfigDetail } from "./model/notify-config-type";
import { logger } from "@/logger";
import { Form, FormItem, type FormExpose } from "@ghcloud/cube-ui";
import { VerticalLine } from "@ghcloud/generic-component";
import { defineComponent, onMounted, reactive, ref } from "vue";

/** 设备通知配置-基础信息 */
export const NoticeConfigDetailInfo = defineComponent({
  props: {
    notifyConigDetail: {
      type: Object as () => NotifyConfigDetail,
      default: () => ({}),
    },
  },
  setup: (props, { expose }) => {
    const formInstance = ref<FormExpose>();
    const formState = reactive<NotifyConfigDetail>({
      name: "",
      prodName: "",
      productCategoryName: "",
      enabled: true,
      ruleConditions: [],
      messageNotifies: [],
    });

    const formRules = {};

    const getData = async (): Promise<NotifyConfigDetail> => {
      try {
        formInstance.value?.validate();
        return formState;
      } catch (error) {
        logger.error("验证失败", error);
        throw error;
      }
    };

    const loading = ref(false);
    const getNofityInfo = async (): Promise<void> => {
      try {
        loading.value = true;
        formState.enabled = props.notifyConigDetail.enabled || true;
        formState.name = props.notifyConigDetail.name || "";
        formState.prodName = props.notifyConigDetail.prodName || "";
        formState.productCategoryName = props.notifyConigDetail.productCategoryName || "";
        formState.ruleConditions = props.notifyConigDetail.ruleConditions || [];
        formState.messageNotifies = props.notifyConigDetail.messageNotifies || [];
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };
    onMounted(() => {
      getNofityInfo();
    });
    expose({
      getData,
    });

    return (): JSX.Element => (
      <>
        <VerticalLine title="通知信息" style="margin-top:20px" />
        <Form style={{ margin: "10px 0 0 40px", width: "60%" }} model={formState} rules={formRules} ref={formInstance}>
          <FormItem label="通知设备" style="width:50%;display:inline-flex">
            {formState.name || "--"}
          </FormItem>

          <FormItem label="产品品类" style="width:50%;display:inline-flex">
            {formState.productCategoryName || "--"}
          </FormItem>

          <FormItem label="所属产品" style="width:50%;display:inline-flex">
            {formState.prodName || "--"}
          </FormItem>
        </Form>
      </>
    );
  },
});
