import { Tabs } from "ant-design-vue";
import { defineComponent, ref } from "vue";

import { BasicInfo } from "./tabs/basic-info/basic-info";
import { ProjectArea } from "./tabs/project-area/project-area";
import { ProjectMaterials } from "./tabs/project-materials/project-materials";
import { ProjectPerson } from "./tabs/project-person/project-person";
import { ProjectTask } from "./tabs/project-task/project-task";
import { TaskKeyPlace } from "./tabs/task-key-place/task-key-place";
import { BaseModal } from "@/features/widgets/modal/base-modal/base-modal";

import styles from "./project-detail.module.less";

const { TabPane } = Tabs;

interface Props {
  title: string;
  visible: boolean;
  data: Record<string, unknown>;
}

export const ProjectDetail = defineComponent({
  props: ["visible", "data", "title"],
  emits: ["close", "locate"],
  setup: (props: Props, { emit }) => {
    const activeKey = ref("1");

    return (): JSX.Element => (
      <BaseModal
        v-model:visible={props.visible}
        title={props.title}
        size="large"
        onClose={() => {
          emit("close");
        }}
      >
        <Tabs v-model:activeKey={activeKey.value} class={styles["task-detail-tabs"]}>
          <TabPane key="1" tab="基础信息">
            <BasicInfo info={props.data} />
          </TabPane>
          <TabPane key="2" tab="项目资料">
            <ProjectMaterials info={props.data} />
          </TabPane>
          <TabPane key="3" tab="项目区域">
            <ProjectArea info={props.data} />
          </TabPane>
          <TabPane key="4" tab="项目重点场所">
            <TaskKeyPlace
              info={props.data}
              onLocate={(data) => {
                emit("locate", data);
              }}
            />
          </TabPane>
          <TabPane key="5" tab="项目人员">
            <ProjectPerson info={props.data} />
          </TabPane>
          <TabPane key="6" tab="项目任务">
            <ProjectTask info={props.data} />
          </TabPane>
        </Tabs>
      </BaseModal>
    );
  },
});
