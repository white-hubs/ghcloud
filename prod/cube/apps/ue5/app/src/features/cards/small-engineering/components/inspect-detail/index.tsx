import { CloseOutlined, RollbackOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { onMounted, reactive, watch, onUnmounted, ref } from "vue";

import info from "./info";

import styles from "./index.module.less";

export const Index = defineComponent({
  name: "Index",
  props: {
    title: { type: String, required: false },
    parameter: { type: Object, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      title?: string;
      parameter: Record<string, any>;
    }
    const datainfo = reactive<Record<string, any>>({
      id: props.parameter.id,
      marketTenant: props.parameter.marketTenant,
      marketName: props.parameter.marketName || props.parameter.name,
      authInfo: null,
    });

    const authLoading = ref(false);

    watch(
      () => props.parameter,
      async () => {
        datainfo.marketTenant = props.parameter.marketTenant;
        datainfo.id = props.parameter.id;
        datainfo.businessType = props.parameter.businessType;
        Object.assign(datainfo, props.parameter);
      },
      { deep: true, immediate: true },
    );
    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      // const el = document.getElementById('inspectDetail')
      // document.body.appendChild(el)
    });

    return (): JSX.Element => (
      <>
        <Teleport to="body">
          <div id="inspectDetail">
            <div class="alarmDetail-modal">
              <div class="alarmDetail-modal-header">
                <div class="header-title">
                  <IconFont type="icon-offline" style={{ fontSize: "24px", color: "rgba(41, 137, 255, 1)" }} />
                  <span> {props?.title}</span>
                </div>
                <div style="display: flex;">
                  {" "}
                  <div class="header-close">
                    {" "}
                    <CloseOutlined onClick={closeModal} />
                  </div>
                </div>
              </div>
              <div class="alarmDetail-modal-content flex-column">
                {" "}
                <div class="conent-body" style="padding-bottom: 10px;overflow-y: auto;">
                  {" "}
                  <a-spin spinning={authLoading.value}>
                    {" "}
                    <info parameter={datainfo}></info>
                  </a-spin>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </>
    );
  },
});

export default Index;
