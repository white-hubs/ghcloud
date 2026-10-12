import { computed, onMounted, type Ref, ref } from "vue";

import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import { cubeCommunicateService, cubeOuaaService } from "@/infrastructure/api/service";

export const useOuaaUserList = (): {
  userNum: Ref<number>;
  userList: Ref<(UserInfo & { online: boolean })[]>;
  onlineUser: Ref<{ id: string; name: string }[]>;
  loading: Ref<boolean>;
} => {
  const userNum = ref(0);
  const userList = ref<(UserInfo & { online: boolean })[]>([]);
  const onlineUser = ref<{ id: string; name: string }[]>([]);
  const loading = ref(true);

  const list = computed(() => {
    const data = userList.value.map((item) => {
      return {
        ...item,
        online: onlineUser.value.some((e) => e.id === item.id),
      };
    });
    // 在线的排在前面
    return data.sort((a, b) => {
      if (a.online && !b.online) {
        return -1;
      }
      if (!a.online && b.online) {
        return 1;
      }
      return 0;
    });
  });
  const getUserList = async (): Promise<void> => {
    await cubeOuaaService.getUserList({ enabled: true }).then((res) => {
      userList.value = res.map((item) => {
        return {
          ...item,
          online: false,
        };
      });
      userNum.value = res.length;
    });
  };
  const getOnlineList = async (): Promise<void> => {
    await cubeCommunicateService.queryOnlineList().then((res) => {
      onlineUser.value = res;
    });
  };
  onMounted(() => {
    Promise.all([getOnlineList(), getUserList()]).then(() => {
      loading.value = false;
    });
  });
  return {
    userNum,
    userList: list,
    onlineUser,
    loading,
  };
};
