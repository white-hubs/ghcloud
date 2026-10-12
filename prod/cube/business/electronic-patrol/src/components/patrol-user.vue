<template>
  <CLayout title="巡更人员列表">
    <template #content>
      <Form layout="inline" :model="patrolline" :label-col="{ style: 'width: 150px' }">
        <Row class="w-100% mt-15px">
          <Col :span="24">
            <FormItem v-if="isattendance" label="是否只指派给当班人员:">
              <Checkbox v-model:checked="patrolline.onDuty" :disabled="disabledp" />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div class="mt-15px">
        <DailyTaskResponsibleObjectSelect
          ref="responsibleObjectSelectRef"
          v-model:type="responsibleObject.type"
          v-model:userIds="responsibleObject.userIds"
          v-model:userOptions="responsibleObject.userOptions"
          v-model:exceptionUserIds="responsibleObject.exceptionUserIds"
          v-model:exceptionUserOptions="responsibleObject.exceptionUserOptions"
          v-model:deptIds="responsibleObject.deptIds"
          v-model:deptOptions="responsibleObject.deptOptions"
          v-model:postIds="responsibleObject.postIds"
          v-model:postOptions="responsibleObject.postOptions"
          v-model:roleIds="responsibleObject.roleIds"
          v-model:roleOptions="responsibleObject.roleOptions"
          v-model:gridAreaIds="responsibleObject.gridAreaIds"
          v-model:gridAreaOptions="responsibleObject.gridAreaOptions"
          :disabled="disabledp"
        />
      </div>
    </template>
  </CLayout>
</template>
<script lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import CLayout from './common/c-layout.vue'
import { Checkbox, Form, FormItem, Row, Col } from 'ant-design-vue'
import { getexam } from '@/api/plan-api'
import { DailyTaskResponsibleObjectSelect } from '@ghcloud/cube-app-design'
import type { SelectOptionItem } from '@ghcloud/cube-app-design/src/business-components/daily-task-components/daily-task-responsible-object-select'
import { ParticipateType } from '@ghcloud/cube-app-design/src/business-components/daily-task-components/daily-task-responsible-object-select/constant'

</script>

<script setup lang="ts">
// Props 类型定义
interface PatrolUserDataInfo {
  conditionParticipate?: PatrolUserData | null;
  onDuty?: boolean;
}

const props: any = withDefaults(defineProps<{
  datainfo?: PatrolUserDataInfo | null;
  disabled?: boolean;
}>(), {
  datainfo: null,
  disabled: false,
});

const disabledp = ref<boolean>(props.disabled);
const responsibleObjectSelectRef = ref<{ validate: () => { valid: boolean; message?: string; }; }>()

// 数据格式接口
interface PatrolUserData {
  conditionType: 'USER' | 'CONDITION';
  participateList: {
    participateType: string;
    targetId: string;
    targetName: string;
  }[];
  abnormalUserList: {
    participateType: string;
    targetId: string;
    targetName: string;
  }[];
}

// patrolline 接口定义
interface PatrolLineData {
  onDuty: boolean;
  conditionParticipate: PatrolUserData | null;
}

const patrolline = reactive<PatrolLineData>({
  onDuty: false,
  conditionParticipate: null,
});

// 责任对象数据
const responsibleObject = reactive<{
  type: 'USER' | 'CONDITION' | '';
  userIds: string[];
  userOptions: SelectOptionItem[];
  exceptionUserIds: string[];
  exceptionUserOptions: SelectOptionItem[];
  deptIds: string[];
  deptOptions: SelectOptionItem[];
  postIds: string[];
  postOptions: SelectOptionItem[];
  roleIds: string[];
  roleOptions: SelectOptionItem[];
  gridAreaIds: string[];
  gridAreaOptions: SelectOptionItem[];
}>({
  type: 'USER',
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
});

// 将新数据格式转换为 responsibleObject 格式
const convertDataToResponsibleObject = (data: PatrolUserData | null | undefined): void => {
  if (!data) {
    responsibleObject.type = 'USER';
    responsibleObject.userIds = [];
    responsibleObject.userOptions = [];
    responsibleObject.exceptionUserIds = [];
    responsibleObject.exceptionUserOptions = [];
    responsibleObject.deptIds = [];
    responsibleObject.deptOptions = [];
    responsibleObject.postIds = [];
    responsibleObject.postOptions = [];
    responsibleObject.roleIds = [];
    responsibleObject.roleOptions = [];
    responsibleObject.gridAreaIds = [];
    responsibleObject.gridAreaOptions = [];
    return;
  }

  // 设置类型
  responsibleObject.type = (data.conditionType === 'USER' || data.conditionType === 'CONDITION')
    ? data.conditionType
    : 'USER';

  // 初始化所有字段
  responsibleObject.userIds = [];
  responsibleObject.userOptions = [];
  responsibleObject.deptIds = [];
  responsibleObject.deptOptions = [];
  responsibleObject.postIds = [];
  responsibleObject.postOptions = [];
  responsibleObject.roleIds = [];
  responsibleObject.roleOptions = [];
  responsibleObject.gridAreaIds = [];
  responsibleObject.gridAreaOptions = [];

  // 处理 participateList participateType 分类
  if (Array.isArray(data.participateList)) {
    data.participateList.forEach(param => {
      const option = { id: param.targetId, name: param.targetName };
      switch (param.participateType) {
        case ParticipateType.USER:
          responsibleObject.userIds.push(param.targetId);
          responsibleObject.userOptions.push(option);
          break;
        case ParticipateType.DEPT:
          responsibleObject.deptIds.push(param.targetId);
          responsibleObject.deptOptions.push(option);
          break;
        case ParticipateType.POST:
          responsibleObject.postIds.push(param.targetId);
          responsibleObject.postOptions.push(option);
          break;
        case ParticipateType.ROLE:
          responsibleObject.roleIds.push(param.targetId);
          responsibleObject.roleOptions.push(option);
          break;
        case ParticipateType.GRID_AREA:
          responsibleObject.gridAreaIds.push(param.targetId);
          responsibleObject.gridAreaOptions.push(option);
          break;
      }
    });
  }

  // 处理 abnormalUserList（异常用户列表）
  responsibleObject.exceptionUserIds = [];
  responsibleObject.exceptionUserOptions = [];
  if (Array.isArray(data.abnormalUserList)) {
    data.abnormalUserList.forEach(abnormalUser => {
      responsibleObject.exceptionUserIds.push(abnormalUser.targetId);
      responsibleObject.exceptionUserOptions.push({
        id: abnormalUser.targetId,
        name: abnormalUser.targetName
      });
    });
  }
}

// 将 responsibleObject 格式转换为新数据格式
const convertResponsibleObjectToData = (): PatrolUserData => {
  const participateList: {
    participateType: string;
    targetId: string;
    targetName: string;
  }[] = [];

  // 根据类型构建 participateList
  if (responsibleObject.type === 'USER') {
    // USER 模式：添加用户
    responsibleObject.userOptions.forEach((user) => {
      participateList.push({
        participateType: ParticipateType.USER,
        targetId: user.id,
        targetName: user.name
      });
    });
  } else if (responsibleObject.type === 'CONDITION') {
    // CONDITION 模式：添加部门、岗位、角色
    responsibleObject.deptOptions.forEach((dept) => {
      participateList.push({
        participateType: ParticipateType.DEPT,
        targetId: dept.id,
        targetName: dept.name
      });
    });
    responsibleObject.postOptions.forEach((post) => {
      participateList.push({
        participateType: ParticipateType.POST,
        targetId: post.id,
        targetName: post.name
      });
    });
    responsibleObject.roleOptions.forEach((role) => {
      participateList.push({
        participateType: ParticipateType.ROLE,
        targetId: role.id,
        targetName: role.name
      });
    });
    responsibleObject.gridAreaOptions.forEach((gridArea) => {
      participateList.push({
        participateType: ParticipateType.GRID_AREA,
        targetId: gridArea.id,
        targetName: gridArea.name
      });
    });
  }

  // 构建 abnormalUserList
  const abnormalUserList = responsibleObject.exceptionUserOptions.map((exceptionUser) => {
    return {
      participateType: ParticipateType.USER,
      targetId: exceptionUser.id,
      targetName: exceptionUser.name
    };
  });

  // 确保 conditionType 是有效的类型
  const conditionType: 'USER' | 'CONDITION' = 
    (responsibleObject.type === 'USER' || responsibleObject.type === 'CONDITION')
      ? responsibleObject.type
      : 'USER';

  return {
    conditionType,
    participateList,
    abnormalUserList
  };
}

// 监听 responsibleObject 变化，更新 patrolline 数据
watch(() => [
  responsibleObject.type,
  responsibleObject.userIds,
  responsibleObject.userOptions,
  responsibleObject.deptIds,
  responsibleObject.deptOptions,
  responsibleObject.postIds,
  responsibleObject.postOptions,
  responsibleObject.roleIds,
  responsibleObject.roleOptions,
  responsibleObject.gridAreaIds,
  responsibleObject.gridAreaOptions,
  responsibleObject.exceptionUserIds,
  responsibleObject.exceptionUserOptions
], () => {
  // 更新完整的数据格式
  patrolline.conditionParticipate = convertResponsibleObjectToData();
}, { deep: true });

const isattendance = ref<boolean>(false);

// 处理 datainfo 数据的函数
const handleDataInfo = () => {
  if (props.datainfo !== undefined && props.datainfo !== null) {
    // 检查 conditionParticipate 是否存在且不为 null
    if (props.datainfo.conditionParticipate !== undefined && props.datainfo.conditionParticipate !== null) {
      const conditionParticipate: PatrolUserData = props.datainfo.conditionParticipate;
      convertDataToResponsibleObject(conditionParticipate);
      patrolline.conditionParticipate = conditionParticipate;
    } else {
      // 如果 conditionParticipate 为 null，重置为默认值
      patrolline.conditionParticipate = null;
      convertDataToResponsibleObject(null);
    }
    patrolline.onDuty = props.datainfo.onDuty || false;
    disabledp.value = props.disabled || false;
  }
}

// 监听 props.datainfo 的变化
watch(() => props.datainfo, () => {
  handleDataInfo();
}, { deep: true, immediate: true });

onMounted(async () => {
  const { data } = await getexam();
  isattendance.value = data;
  // 确保数据已处理
  handleDataInfo();
});

const setInfo = (conditionParticipate: PatrolUserData | null, onDuty: boolean, disable: boolean) => {
  disabledp.value = disable;
  // 支持新格式：conditionType, participateList, abnormalUserList
  if (conditionParticipate && conditionParticipate.conditionType) {
    convertDataToResponsibleObject(conditionParticipate);
    patrolline.conditionParticipate = conditionParticipate;
  } else {
    // 如果 conditionParticipate 为 null，重置为默认值
    patrolline.conditionParticipate = null;
    convertDataToResponsibleObject(null);
  }
  patrolline.onDuty = onDuty;
};

defineExpose({
  setInfo,
  patrolline,
  validate: () => {
    if (responsibleObjectSelectRef.value?.validate) {
      return responsibleObjectSelectRef.value.validate();
    }
    return { valid: true };
  }
});
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
