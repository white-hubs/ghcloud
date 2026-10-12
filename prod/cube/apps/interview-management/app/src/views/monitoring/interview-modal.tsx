import styles from "./monitoring.module.less";
import { cubeSecurityService } from "@/api/service";
import type { MeetingApplyDetail } from "@ghcloud/cube-security-management-service";
import { Modal, Table, Tag } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, ref, watch } from "vue";
export const InterviewModal = defineComponent({
  emits: ["close"],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
  },
  setup: (props, { emit }) => {
    const modalVisible = ref(false);
    const tableLoading = ref(false);
    const detail = ref<MeetingApplyDetail>();
    const meetingType = new Map([
      ["0", "亲友会见"],
      ["1", "法律咨询"],
      ["2", "工作事宜"],
    ]);
    const personType = new Map([
      ["0", "会见人员"],
      ["1", "随行人员"],
      ["2", "被见人员"],
    ]);
    const idType = new Map([
      ["0", "身份证"],
      ["1", "护照"],
    ]);
    const columns = [
      {
        dataIndex: "meetingPersonType",
        title: "类型",
        customRender: ({ text }: { text: string }): string => personType.get(text) || "--",
      },
      {
        dataIndex: "meetingPersonName",
        title: "人员姓名",
        customRender: ({ text }: { text: string }): string => text || "--",
      },
      {
        dataIndex: "meetingPersonDocumentType",
        title: "证件",
        customRender: ({ text }: { text: string }): string => idType.get(text) || "--",
      },
      {
        dataIndex: "meetingPersonDocumentNumber",
        title: "证件号码",
        customRender: ({ text }: { text: string }): string => text || "--",
      },
    ];
    // 表格数据
    const getTableData = async (): Promise<void> => {
      tableLoading.value = true;
      // 会见申请详情
      detail.value =
        props.type === "申请"
          ? await cubeSecurityService.meetingApplyGetById(props.id)
          : await cubeSecurityService.meetingGetById(props.id);
      // 会见记录详情
      tableLoading.value = false;
    };
    const close = (): void => {
      emit("close");
      modalVisible.value = false;
    };
    watch(
      () => props.visible,
      () => {
        modalVisible.value = props.visible;
        getTableData();
      },
      { immediate: true, deep: true },
    );
    return (): JSX.Element => (
      <Modal
        class={styles.modal}
        v-model:visible={modalVisible.value}
        width="800px"
        title={`会见${props.type}详情`}
        onOk={() => {
          close();
        }}
        onCancel={() => {
          close();
        }}
      >
        <div>
          <div class={styles.title}>
            <span>
              会见{props.type}号：{props.type === "申请" ? detail.value?.applyCode || "--" : detail.value?.meetingCode || "--"}
            </span>
            <Tag color={detail.value?.approvalResult === "通过" ? "green" : "red"} v-show={props.type === "申请"}>
              {detail.value?.approvalResult}
            </Tag>
          </div>
          <div>
            <span style="margin-right:10px">会见类型：{meetingType.get(detail.value?.meetingType ?? "") ?? "--"}</span>
            <span style="margin-right:10px" v-show={props.type === "申请"}>
              申请时间：{dayjs(detail.value?.applyTime ?? "").format("YYYY-MM-DD HH:mm:ss") ?? "--"}
            </span>
            <span style="margin-right:10px" v-show={props.type === "申请"}>
              申请人：{detail.value?.applyPersonName}
            </span>
          </div>
          <div class={styles.title}>会见内容</div>
          <div>
            <div>会见事由：{detail.value?.meetingReason}</div>
            <div>
              会见时间：{dayjs(detail.value?.meetingStartTime ?? "").format("YYYY-MM-DD HH:mm") ?? "--"}-
              {dayjs(detail.value?.meetingEndTime ?? "").format("HH:mm") ?? "--"}
            </div>
          </div>
        </div>
        <div class={styles.title}>会见人员</div>
        <Table
          rowKey="id"
          data-source={detail.value?.meetingPersons}
          columns={columns}
          pagination={false}
          scrollY={450}
          size="middle"
          loading={tableLoading.value}
        />
        {props.type === "申请" ? (
          <>
            <div class={styles.title}>审批意见</div>
            <div>审批结果：{detail.value?.approvalResult}</div>
            <div>结果说明：{detail.value?.approvalResultReason}</div>
          </>
        ) : (
          <>
            <div class={styles.title}>会见过程</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              录音：
              <audio src={detail.value?.meetingProcessAudio ?? ""} controls />
            </div>
          </>
        )}
      </Modal>
    );
  },
});
