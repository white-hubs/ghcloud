import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";

import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { areaTodayUserStat, policeTodayLeavePage } from "@/infrastructure/api/lingchuanhik";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import deviceModule from "@/shared-ui/panel/deviceModule";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./police-statistics.module.less";

export const PoliceStatistics = defineComponent({
  name: "PoliceStatistics",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const dataList = ref([
      {
        title: "进入人数",
        value: "1",
        ringRatio: false,
      },
      {
        title: "离开人数",
        value: "17",
        ringRatio: false,
      },
      {
        title: "遗留人数",
        value: "17",
        ringRatio: false,
      },
    ]);
    const keyword = ref("");
    const lists = ref([]);
    const getPoliceTodayLeavePage = async () => {
      const res = await policeTodayLeavePage({
        pageNumber: 1,
        pageSize: 10,
        keyword: keyword.value,
        areaId: globalState.business.currentAreaId,
      });
      lists.value = res.records;
    };
    const getAreaTodayUserStat = async () => {
      const res = await areaTodayUserStat({
        areaId: globalState.business.currentAreaId,
        type: 2,
      });
      dataList.value[0].value = res.enter;
      dataList.value[1].value = res.exit;
      dataList.value[2].value = res.leave;
    };
    onMounted(() => {
      getAreaTodayUserStat();
      getPoliceTodayLeavePage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="老师进出记录">
          <deviceModule data-list={dataList.value}></deviceModule>
          <a-space size={24}>
            <a-input
              style="width: 180px;"
              value={keyword.value}
              onUpdate:value={(v) => {
                keyword.value = v;
              }}
              placeholder="请输入关键字搜索"
            ></a-input>
            <a-button type="primary" onClick={getPoliceTodayLeavePage}>
              {" "}
              搜索
            </a-button>
          </a-space>
          <div class="abnormal-statistics">
            <vue3-seamless-scroll list={lists.value} step={lists.length > 4 ? 0.5 : 0} hover singleHeight={40} waitTime={1000}>
              {lists.map((item) => (
                <div class="abnormal-statistics-item" key={item.id}>
                  <div class="abnormal-statistics-item-left">
                    {item?.file?.path && <img src={item?.file?.path} alt srcset></img>}
                    <img src={getAssetsImage("alarm-default.png")} alt srcset></img>
                  </div>
                  <div class="abnormal-statistics-item-right">
                    <div class="abnormal-statistics-item-right-top"> {item.name}</div>
                    <div class="abnormal-statistics-item-right-middle">
                      <div class="right-middle-title">
                        编号:
                        {item.number}
                      </div>
                      <div class="right-middle-title">
                        电话号码:
                        {item.phoneNo}
                      </div>
                      <div class="right-middle-title">
                        所属部门:
                        {item.orgName}
                      </div>
                    </div>
                    <div class="abnormal-statistics-item-right-bottom">
                      <div> 进入时间:</div>
                      <div> {dayjs(item.inTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </vue3-seamless-scroll>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PoliceStatistics;
