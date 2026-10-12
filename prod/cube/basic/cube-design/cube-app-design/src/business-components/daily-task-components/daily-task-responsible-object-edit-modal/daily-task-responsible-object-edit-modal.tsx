import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import type { ResponsibleObjectItem } from "../daily-task-responsible-object-list";
import { DailyTaskResponsibleObjectSelect, type ResponsibleValidateResult } from "../daily-task-responsible-object-select";
import { ParticipateType } from "../daily-task-responsible-object-select/constant";
import type { ParticipateItem } from "@ghcloud/cube-daily-task-service";
import { defineComponent, ref, type ComponentPublicInstance } from "vue";

// 将服务端返回的单个 ParticipateItem 转换为组件需要的 ResponsibleObjectItem 格式
export const convertParticipateItemToResponsibleObjectItem = (participateItem: ParticipateItem, index = 0): ResponsibleObjectItem => {
  const result: ResponsibleObjectItem = {
    key: `${Date.now()}-${index}-${Math.random()}`,
    type:
      participateItem.conditionType === "USER" || participateItem.conditionType === "CONDITION" ? participateItem.conditionType : "USER",
    userIds: [],
    userOptions: [],
    exceptionUserIds: [],
    exceptionUserOptions: [],
    deptIds: [],
    deptOptions: [],
    postIds: [],
    postOptions: [],
    roleIds: [],
    roleOptions: [],
    gridAreaIds: [],
    gridAreaOptions: [],
  };

  // 处理 participateParams，根据 participateType 分类
  participateItem.participateParams.forEach((param) => {
    const option = { id: param.targetId, name: param.targetName };
    switch (param.participateType) {
      case "USER":
        result.userIds.push(param.targetId);
        result.userOptions.push(option);
        break;
      case "DEPT":
        result.deptIds.push(param.targetId);
        result.deptOptions.push(option);
        break;
      case "POST":
        result.postIds.push(param.targetId);
        result.postOptions.push(option);
        break;
      case "ROLE":
        result.roleIds.push(param.targetId);
        result.roleOptions.push(option);
        break;
      case "GRID_AREA":
        result.gridAreaIds.push(param.targetId);
        result.gridAreaOptions.push(option);
        break;
      default:
        break;
    }
  });
  // 处理 abnormalUserList（异常用户列表）
  participateItem.abnormalUserList.forEach((abnormalUser) => {
    result.exceptionUserIds.push(abnormalUser.targetId);
    result.exceptionUserOptions.push({
      id: abnormalUser.targetId,
      name: abnormalUser.targetName,
    });
  });
  return result;
};

// 将 ResponsibleObjectItem 转换为 ParticipateItem
export const convertResponsibleObjectItemToParticipateItem = (item: ResponsibleObjectItem): ParticipateItem => ({
  conditionType: item.type,
  participateParams: buildParticipateParams(item),
  abnormalUserList: item.exceptionUserOptions.map((opt) => ({
    participateType: ParticipateType.USER,
    targetId: opt.id,
    targetName: opt.name,
  })),
});

// 构建参与参数（包含 targetName）
export const buildParticipateParams = (
  item: ResponsibleObjectItem,
): { participateType: string; targetId: string; targetName: string }[] => {
  if (item.type === "USER") {
    return item.userOptions.map((opt) => ({ participateType: ParticipateType.USER, targetId: opt.id, targetName: opt.name }));
  }
  if (item.type === "CONDITION") {
    return [
      ...item.deptOptions.map((opt) => ({ participateType: ParticipateType.DEPT, targetId: opt.id, targetName: opt.name })),
      ...item.postOptions.map((opt) => ({ participateType: ParticipateType.POST, targetId: opt.id, targetName: opt.name })),
      ...item.roleOptions.map((opt) => ({ participateType: ParticipateType.ROLE, targetId: opt.id, targetName: opt.name })),
      ...item.gridAreaOptions.map((opt) => ({ participateType: ParticipateType.GRID_AREA, targetId: opt.id, targetName: opt.name })),
    ];
  }
  return [];
};

interface OptionItem {
  id: string;
  name: string;
}

interface ResponsibleConfig {
  type: "USER" | "CONDITION";
  userIds: string[];
  exceptionUserIds: string[];
  deptIds: string[];
  postIds: string[];
  roleIds: string[];
  gridAreaIds: string[];
  userOptions: OptionItem[];
  exceptionUserOptions: OptionItem[];
  deptOptions: OptionItem[];
  postOptions: OptionItem[];
  roleOptions: OptionItem[];
  gridAreaOptions: OptionItem[];
}

interface Props {
  title?: string;
}

/** 编辑责任对象弹窗组件 */
export const DailyTaskResponsibleObjectEditModal = defineComponent({
  props: {
    title: {
      type: String,
      default: "编辑发放成员",
    },
  },
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const responsibleConfig = ref<ResponsibleConfig>({
      type: "USER",
      userIds: [],
      exceptionUserIds: [],
      deptIds: [],
      postIds: [],
      roleIds: [],
      gridAreaIds: [],
      userOptions: [],
      exceptionUserOptions: [],
      deptOptions: [],
      postOptions: [],
      roleOptions: [],
      gridAreaOptions: [],
    });

    // 责任对象选择组件 ref
    type ResponsibleSelectInstance = ComponentPublicInstance & { validate: () => ResponsibleValidateResult };
    const responsibleSelectRef = ref<ResponsibleSelectInstance>();

    const [CubeModal, modalApi] = useCubeModal({
      title: props.title || "编辑发放成员",
      width: "800px",
      onClosed: () => {
        // 重置配置
        responsibleConfig.value = {
          type: "USER",
          userIds: [],
          exceptionUserIds: [],
          deptIds: [],
          postIds: [],
          roleIds: [],
          gridAreaIds: [],
          userOptions: [],
          exceptionUserOptions: [],
          deptOptions: [],
          postOptions: [],
          roleOptions: [],
          gridAreaOptions: [],
        };
      },
      onConfirm: async () => {
        // 验证责任对象配置
        if (responsibleSelectRef.value?.validate) {
          const validateResult = responsibleSelectRef.value.validate();
          if (!validateResult.valid) {
            return;
          }
        }

        // 转换为 ParticipateItem
        const responsibleObjectItem = {
          key: `${Date.now()}-${Math.random()}`,
          type: responsibleConfig.value.type,
          userIds: responsibleConfig.value.userIds,
          userOptions: responsibleConfig.value.userOptions,
          exceptionUserIds: responsibleConfig.value.exceptionUserIds,
          exceptionUserOptions: responsibleConfig.value.exceptionUserOptions,
          deptIds: responsibleConfig.value.deptIds,
          deptOptions: responsibleConfig.value.deptOptions,
          postIds: responsibleConfig.value.postIds,
          postOptions: responsibleConfig.value.postOptions,
          roleIds: responsibleConfig.value.roleIds,
          roleOptions: responsibleConfig.value.roleOptions,
          gridAreaIds: responsibleConfig.value.gridAreaIds,
          gridAreaOptions: responsibleConfig.value.gridAreaOptions,
        };

        const participateItem = convertResponsibleObjectItemToParticipateItem(responsibleObjectItem);
        emit("enter", participateItem);
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
      },
    });

    const openModal = (defaultData?: ParticipateItem): void => {
      if (defaultData) {
        // 将默认数据转换为 ResponsibleObjectItem
        const responsibleObjectItem = convertParticipateItemToResponsibleObjectItem(defaultData);
        responsibleConfig.value = {
          type: responsibleObjectItem.type,
          userIds: responsibleObjectItem.userIds,
          userOptions: responsibleObjectItem.userOptions,
          exceptionUserIds: responsibleObjectItem.exceptionUserIds,
          exceptionUserOptions: responsibleObjectItem.exceptionUserOptions,
          deptIds: responsibleObjectItem.deptIds,
          deptOptions: responsibleObjectItem.deptOptions,
          postIds: responsibleObjectItem.postIds,
          postOptions: responsibleObjectItem.postOptions,
          roleIds: responsibleObjectItem.roleIds,
          roleOptions: responsibleObjectItem.roleOptions,
          gridAreaIds: responsibleObjectItem.gridAreaIds,
          gridAreaOptions: responsibleObjectItem.gridAreaOptions,
        };
      } else {
        // 重置为默认值
        responsibleConfig.value = {
          type: "USER",
          userIds: [],
          exceptionUserIds: [],
          deptIds: [],
          postIds: [],
          roleIds: [],
          gridAreaIds: [],
          userOptions: [],
          exceptionUserOptions: [],
          deptOptions: [],
          postOptions: [],
          roleOptions: [],
          gridAreaOptions: [],
        };
      }
      modalApi.open();
    };

    expose({
      openModal,
    });

    const modalSlots = {
      default: (): JSX.Element => (
        <div style={{ padding: "20px 0" }}>
          <DailyTaskResponsibleObjectSelect
            ref={responsibleSelectRef}
            type={responsibleConfig.value.type}
            userIds={responsibleConfig.value.userIds}
            exceptionUserIds={responsibleConfig.value.exceptionUserIds}
            deptIds={responsibleConfig.value.deptIds}
            postIds={responsibleConfig.value.postIds}
            roleIds={responsibleConfig.value.roleIds}
            gridAreaIds={responsibleConfig.value.gridAreaIds}
            userOptions={responsibleConfig.value.userOptions}
            exceptionUserOptions={responsibleConfig.value.exceptionUserOptions}
            deptOptions={responsibleConfig.value.deptOptions}
            postOptions={responsibleConfig.value.postOptions}
            roleOptions={responsibleConfig.value.roleOptions}
            gridAreaOptions={responsibleConfig.value.gridAreaOptions}
            onUpdate:type={(v: "USER" | "CONDITION") => {
              responsibleConfig.value.type = v;
            }}
            onUpdate:userIds={(v: string[]) => {
              responsibleConfig.value.userIds = v;
            }}
            onUpdate:exceptionUserIds={(v: string[]) => {
              responsibleConfig.value.exceptionUserIds = v;
            }}
            onUpdate:deptIds={(v: string[]) => {
              responsibleConfig.value.deptIds = v;
            }}
            onUpdate:postIds={(v: string[]) => {
              responsibleConfig.value.postIds = v;
            }}
            onUpdate:roleIds={(v: string[]) => {
              responsibleConfig.value.roleIds = v;
            }}
            onUpdate:gridAreaIds={(v: string[]) => {
              responsibleConfig.value.gridAreaIds = v;
            }}
            onUpdate:userOptions={(v: OptionItem[]) => {
              responsibleConfig.value.userOptions = v;
            }}
            onUpdate:exceptionUserOptions={(v: OptionItem[]) => {
              responsibleConfig.value.exceptionUserOptions = v;
            }}
            onUpdate:deptOptions={(v: OptionItem[]) => {
              responsibleConfig.value.deptOptions = v;
            }}
            onUpdate:postOptions={(v: OptionItem[]) => {
              responsibleConfig.value.postOptions = v;
            }}
            onUpdate:roleOptions={(v: OptionItem[]) => {
              responsibleConfig.value.roleOptions = v;
            }}
            onUpdate:gridAreaOptions={(v: OptionItem[]) => {
              responsibleConfig.value.gridAreaOptions = v;
            }}
          />
        </div>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
