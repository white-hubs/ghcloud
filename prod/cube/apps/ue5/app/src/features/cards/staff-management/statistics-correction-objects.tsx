import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { personRollCallPage } from "@/infrastructure/api/lingchuanhik";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./statistics-correction-objects.module.less";

export const StatisticsCorrectionObjects = defineComponent({
  name: "StatisticsCorrectionObjects",
  setup(_props, ctx) {
    const keyword = ref("");
    const { globalState } = useStateStore();

    const lists = ref([]);
    const getPersonRollCallPage = async () => {
      const res = await personRollCallPage({
        pageNumber: 1,
        pageSize: 10,
        keyword: keyword.value,
        areaId: globalState.business.currentAreaId,
      });
      lists.value = res.records;
    };
    onMounted(() => {
      getPersonRollCallPage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="学生点名记录">
          <a-space size={24}>
            <a-input
              style="width: 180px;"
              value={keyword.value}
              onUpdate:value={(v) => {
                keyword.value = v;
              }}
              placeholder="请输入关键字搜索"
            ></a-input>
            <a-button type="primary" onClick={getPersonRollCallPage}>
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
                    <div class="abnormal-statistics-item-right-top">
                      <span> {item.personName}</span>
                      <span style="margin-left: 10px;"> 重点关注对象</span>
                    </div>
                    <div class="abnormal-statistics-item-right-middle">
                      <div class="right-middle-title">
                        所属宿舍:
                        {item.orgName}
                      </div>
                    </div>
                    <div class="abnormal-statistics-item-right-bottom">
                      <div> 点名时间:</div>
                      <div> {dayjs(item.rollcallTime).format("YYYY-MM-DD HH:mm:ss")}</div>
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

export default StatisticsCorrectionObjects;
