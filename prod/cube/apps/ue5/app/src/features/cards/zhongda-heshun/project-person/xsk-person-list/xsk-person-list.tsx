import { Button, Input, Skeleton, message } from "ant-design-vue";
import type { Marker } from "leaflet";
import { computed, defineComponent, onMounted, ref, watch } from "vue";

import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import type { DisinfectionUserInfoVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { Person } from "@/features/cards/zhongda-heshun/components/person/person";
import { useOuaaUserList } from "@/features/cards/zhongda-heshun/components/person/use-ouaa-user-list";
import { ScrollTabs } from "@/features/cards/zhongda-heshun/components/scroll-tabs/scroll-tabs";
import { createUserMarker } from "@/features/cards/zhongda-heshun/utils/gis-helper";
import { createPersonModal } from "@/features/cards/zhongda-heshun/utils/modal-helper";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeZDDataVizService, cubeCommunicateService } from "@/infrastructure/api/service";
import { debounce } from "@/infrastructure/utils/common";
import NoData from "@/shared-ui/panel/noData";
import { clearMap, setCenter, setZoom } from "@/visualization-core/event/register/gis";

import styles from "./xsk-person-list.module.less";

/** 项目人员列表 */
export const XSKPersonList = defineComponent({
  setup() {
    const { userList } = useOuaaUserList();
    const activeKey = ref("all");
    const searchText = ref("");
    const personMarkers = new Map<string, Marker>();
    const tabList = computed(() => {
      const onlineNum = personList.value.filter((e) => e.online).length;
      const realTotal = personList.value.length;
      const offlineNum = realTotal - onlineNum;

      return [
        { text: `人员总数(${realTotal})`, key: "all" },
        { text: `在线数(${onlineNum})`, key: "online" },
        { text: `离线数(${offlineNum})`, key: "offline" },
      ];
    });
    const personList = computed(() => {
      const ids = persons.value.map((e) => e.userId);
      const users = userList.value.filter((e) => ids.includes(e.id));
      const result = persons.value.map((item) => {
        item.online = users.find((e) => e.id === item.userId)?.online;
        return item;
      });
      if (activeKey.value === "online") return result?.filter((e) => e.online);
      if (activeKey.value === "offline") return result?.filter((e) => !e.online);
      return result;
    });
    // 人员情况分布
    const loading = ref(false);
    const total = ref(0);
    const persons = ref<DisinfectionUserInfoVO[]>([]);
    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getPersonnelDistribution();
        if (res) {
          total.value = res.total ?? 0;
          persons.value = (res.disinfectionUserList ?? [])
            ?.map((e) => {
              return {
                ...e,
                id: e.userId,
                fileVO: e.photo?.[0],
              };
            })
            .filter((e) => e.name.includes(searchText.value));
        }
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    onMounted(() => {
      getData();
    });

    const showPersonMarkers = debounce(async (personList: DisinfectionUserInfoVO[]): Promise<void> => {
      clearMap();
      personMarkers.clear();
      personList.map(async (person, key) => {
        const marker = await createUserMarker(person as unknown as UserInfo, undefined, !key);
        if (marker) {
          personMarkers.set(person.userId, marker);
        }
      });
      // for (const person of personList) {

      // }
    }, 1000);

    watch(personList, (val) => {
      showPersonMarkers(val);
    });

    const handleMoreClick = async (): Promise<void> => {
      createPersonModal("项目人员", activeKey.value);
    };
    const handlePersonClick = async (userInfo: DisinfectionUserInfoVO): Promise<void> => {
      const marker = personMarkers.get(userInfo.userId);
      if (marker) {
        const position = marker.getLatLng();
        await setCenter(position);
        await setZoom(15);
        marker.fire("click");
      } else {
        message.warn("该人员无位置信息");
      }
    };
    const search = (): void => {
      getData();
    };
    return (): JSX.Element => (
      <SubPanelTemplate
        v-slots={{
          extra: () => (
            <Button type="link" size="small" style={{ color: "#b0c5ff", fontSize: "18px" }} onClick={handleMoreClick}>
              更多&gt;&gt;
            </Button>
          ),
        }}
      >
        <div class={styles.search}>
          <Input v-model:value={searchText.value} placeholder={"人员支持按名称搜索"}></Input>
          <Button type="primary" onClick={search}>
            查询
          </Button>
        </div>
        <Skeleton loading={loading.value} active paragraph={{ rows: 1 }}>
          <ScrollTabs
            list={tabList.value}
            showPageBtn={false}
            onTabClick={(tab) => {
              activeKey.value = tab.key;
            }}
          ></ScrollTabs>
        </Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}></Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}></Skeleton>
        <Skeleton loading={loading.value} active avatar paragraph={{ rows: 1 }}></Skeleton>
        <div class={styles["user-list"]} v-show={!loading.value}>
          {personList.value.length === 0 && <NoData />}
          {personList.value.map((user) => {
            return (
              <div key={user.userId} class={styles["item"]}>
                <Person
                  userInfo={user}
                  v-slots={{
                    post: (): string => {
                      return user.position || "--";
                    },
                  }}
                  canBeClick
                  onClick={handlePersonClick}
                />
              </div>
            );
          })}
        </div>
      </SubPanelTemplate>
    );
  },
});
