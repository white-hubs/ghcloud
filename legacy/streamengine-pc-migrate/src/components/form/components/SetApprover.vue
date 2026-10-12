<template>
  <div class="assigned-user-content">
    <span class="title"></span>
    <div class="assigned-user-list">
      <template v-for="(item, i) in users">
        <Avatar :show-close="item.preReduceSign && !notOperates"  @close="delUser(i)">
          {{item.name.substring(item.name.length > 2 ? item.name.length - 2 : 0) }}
        </Avatar>
        <span class="separator" v-if="(!notOperates&&props.preAddSign)||i!==users.length-1">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
            width="16" height="16" viewBox="0 0 16 16">
            <defs>
              <clipPath id="master_svg0_sa1291_68801">
                <rect x="0" y="0" width="16" height="16" rx="0" />
              </clipPath>
            </defs>
            <g transform="matrix(0,1,1,0,0,0)" clip-path="url(#master_svg0_sa1291_68801)">
              <g transform="matrix(0.9999999403953552,0,0,-0.9999999403953552,1.7881393432617188e-7,25.999999225139618)">
                <path
                  d="M12.58485,17.57862L8.45105,17.57992L8.45105,13.418001C8.45105,13.187261,8.2643,13,8.0342,13C7.80409,13,7.61737,13.187261,7.61737,13.418001L7.61737,17.576999999999998L3.418112,17.57468C3.417687,17.57468,3.417283,17.57468,3.416858,17.57468C3.187178,17.57468,3.000857901,17.76069,3.00000636047,17.99143C2.99875157,18.22217,3.185094,18.40983,3.415177,18.41066L7.61734,18.41298L7.61734,22.582C7.61734,22.81314,7.80409,23,8.03417,23C8.26426,23,8.45103,22.81317,8.45103,22.582L8.45103,18.4159L12.58149,18.4146C12.58232,18.4146,12.58274,18.4146,12.58315,18.4146C12.81283,18.4146,12.99915,18.22859,13,17.99785C13.0008,17.76711,12.81453,17.57945,12.58485,17.57862Z"
                  fill="#999999" fill-opacity="1" />
              </g>
            </g>
          </svg>
        </span>
      </template>
      <PushUser @push="addUser" v-if="!notOperates&&props.preAddSign" :active-id="activeId"
        :disabled-id="disabledId" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { reduceAppointApprover, setAppointApprover } from "@/api/flow";
import { CurrentTaskDetail } from "@/domain/form-flow";
import { message } from "ant-design-vue";
import { computed, inject, Ref, ref } from "vue";
import { getNode } from "../units";
import Avatar from "./Avatar.vue";
import PushUser from "./PushUser.vue";

const notOperates = inject("notOperates") as Boolean;

type Type = "copy" | "inTurn" | "or" | "onece" | "removed";

const props = withDefaults(defineProps<{
  type: Type;
  assigneeList: any[];
  nodeId: string;
  /** 是否能指定审批人 */
  preAddSign:boolean;
}>(), {
  type: "copy"
})

const users = ref(props.assigneeList)
const activeId = computed(() => {
  return users.value.map(e => { return e.id })
})
const disabledId = computed(() => {
  const ids: string[] = []
  props.assigneeList.forEach(e => {
    if (!e.preReduceSign) {
      ids.push(e.id)
    }
  })
  return ids
})

const title = computed<string>((): string => {
  if (props.type === 'copy') {
    return '抄送'
  } else if (props.type === 'inTurn') {
    return users.value.length + '人依次签'
  } else if (props.type === 'or') {
    return users.value.length + '人或签'
  } else if (props.type === 'onece') {
    return users.value.length + '人会签'
  }
  return ''
})

const delUser = async (index: number) => {
  const params = {
    processInstanceId: processId,
    taskKey: props.nodeId,
    userIds: [users.value[index].id]
  }
  await reduceAppointApprover(params)
  message.success('预减签成功')
  users.value.splice(index, 1)
}

const processId = inject('processId') as string
const addUser = async (value: any[]) => {
  //过滤掉当前已有人员
  value = value.filter((e: any) => {
    const userIndex = users.value.findIndex(ele => e && ele.id === e.id)
    if (userIndex === -1) {
      return e;
    }
    if (userIndex !== -1) {
      if (users.value[userIndex].preReduceSign) {
        return e;
      }
    }
  })

  //数据transfer
  const data: { id: string; name: string, preReduceSign: boolean }[] = []
  value.forEach(e => {
    const findIndex = props.assigneeList.findIndex(ele => ele.id === e.id)
    let preReduceSign = true
    if (findIndex !== -1) {
      preReduceSign = props.assigneeList[findIndex].preReduceSign;
    }
    data.push({
      id: e.id,
      name: e.name,
      preReduceSign: preReduceSign
    })
  })

  const params = {
    processInstanceId: processId,
    taskKey: props.nodeId,
    userIds: data.map(e => { return e.id })
  }
  await setAppointApprover(params)
  message.success('指定成功')
  
  //回显去重
  let obj: Record<string, string> = {}
  users.value = [...users.value, ...data].reduce(function (item, next) {
    obj[next.id] ? '' : obj[next.id] = true && item.push(next)
    return item
  }, [])
}


// 是否开启指定审批人
const currentTaskDetail = inject('currentTaskDetail') as Ref<CurrentTaskDetail>;
const designatedApprover = computed(() => {
  if (currentTaskDetail.value) {
    const flowJson = currentTaskDetail.value.properties.processJson
    const node = getNode(JSON.parse(flowJson), props.nodeId)
    if (!node) {
      return false
    }
    if (node.type === 'APPROVAL') {
      return node.props.designatedApprover
    }
  }
  return false
})
</script>
<style scoped lang="less">
.assigned-user-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .assigned-user-list {
    display: flex;
    align-self: center;
    flex-wrap: wrap;

    .avatar {
      margin-bottom: 10px;
    }

    .separator {
      width: 40px;
      text-align: center;
      font-size: 20px;
      display: inline-block;
      color: #999999;
      flex-shrink: 0;
      line-height: 50px;
    }
  }
}
</style>