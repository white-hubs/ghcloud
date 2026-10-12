import { defineComponent, type PropType } from "vue";

import scrollParams from "@/features/panel-shell/tables/roll-table/scroll-params";
import { StaffResultList } from "@/infrastructure/api/models/attendance";

import "./duty-person-list.module.less";

export const DutyPersonList = defineComponent({
  name: "DutyPersonList",
  props: {
    title: { type: String, required: false, default: "标题" },
    arrive: { type: Number, required: true },
    total: { type: Number, required: true },
    list: { type: Array as PropType<StaffResultList[]>, required: true },
  },
  setup(props) {
    const { step, waitTime } = scrollParams();

    return (): JSX.Element => (
      <>
        <div class="dutyPersonList">
          <div class="list">
            <vue3-seamless-scroll list={props.list} step={step} hover singleHeight={74} waitTime={waitTime}>
              {props.list.map((item, index) => (
                <div class="item" key={index}>
                  <div class="content">
                    <a-avatar src={"https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"} size={46}></a-avatar>
                    <div class="info">
                      <div class="user">
                        <span class="name"> {item.staffName}</span>
                        <span class="phone"> {item.mobile}</span>
                      </div>
                      <div class="duty">
                        班次名称:
                        {item.className || ""}
                        {item.startWorkTime && item.endWorkTime ? `(${item.startWorkTime}-${item.endWorkTime})` : "无班次"}
                      </div>
                    </div>
                  </div>
                  <div class={["status"]}> 在岗</div>
                </div>
              ))}
            </vue3-seamless-scroll>
          </div>
        </div>
      </>
    );
  },
});

export default DutyPersonList;
