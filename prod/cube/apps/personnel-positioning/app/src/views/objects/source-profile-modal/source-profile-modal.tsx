import { defineComponent, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Button, Descriptions, DescriptionsItem, Empty, Tag, message } from "@ghcloud/cube-ui";

import type { ApiStaff } from "@/api/positioning";
import { PERSON_SOURCES } from "@/constants/positioning";
import type { PositioningPerson } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";

import "./source-profile-modal.less";

export function useSourceProfileModal() {
  const store = usePositioningStore();
  const person = ref<PositioningPerson>();
  const detail = ref<ApiStaff | null>();
  const loading = ref(false);
  let requestSequence = 0;
  const [CubeModal, modal] = useCubeModal({ title: "来源档案", width: "640px" });
  const text = (value: unknown): string => (typeof value === "string" && value.trim() ? value : "—");
  const renderContent = () => {
    if (loading.value) return <div class="pp-source-profile-loading">正在加载人员详情…</div>;
    if (!detail.value || !person.value) return <Empty description="未获取到人员详情" />;
    const staff = detail.value;
    const source = PERSON_SOURCES[person.value.source];
    return (
      <>
        <Descriptions column={2} bordered size="small">
          <DescriptionsItem label="姓名">{text(staff.name)}</DescriptionsItem>
          <DescriptionsItem label="人员编号">{text(staff.jobNumber)}</DescriptionsItem>
          <DescriptionsItem label="电话号码">{text(staff.mobile)}</DescriptionsItem>
          <DescriptionsItem label="员工状态">
            <Tag color={staff.status === "LEAVE_OFFICE" ? "default" : "green"}>{text(staff.statusName)}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="人员类型">{text(staff.typeName || source.personType)}</DescriptionsItem>
          <DescriptionsItem label="来源应用">{source.label}</DescriptionsItem>
          <DescriptionsItem label="所属部门">{text(staff.organizationName)}</DescriptionsItem>
          <DescriptionsItem label="职位">{text(staff.appointmentName)}</DescriptionsItem>
          <DescriptionsItem label="岗位" span={2}>
            {text(staff.postNames)}
          </DescriptionsItem>
        </Descriptions>
        <p class="pp-source-profile-note">人员基础信息由员工管理维护，此处展示员工详情接口的最新数据。</p>
      </>
    );
  };
  const SourceProfileModal = defineComponent({
    name: "SourceProfileModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: renderContent,
          footer: () => (
            <Button type="primary" onClick={() => modal.close()}>
              关闭
            </Button>
          ),
        }}
      />
    ),
  });
  return {
    SourceProfileModal,
    open: (record: PositioningPerson) => {
      person.value = record;
      detail.value = undefined;
      loading.value = true;
      const sequence = ++requestSequence;
      modal.open();
      void store
        .loadStaffDetail(record.sourceId)
        .then((result) => {
          if (sequence === requestSequence) detail.value = result;
        })
        .catch((error: unknown) => {
          if (sequence === requestSequence) message.error((error as Error).message);
        })
        .finally(() => {
          if (sequence === requestSequence) loading.value = false;
        });
    },
  };
}
