import styles from "./deviceEvents.module.less";
import { defineComponent } from "vue";
import { getAssetsImage } from '@/infrastructure/utils/getImage';

export const DeviceEvents = defineComponent({
  name: "DeviceEvents",
  props: {

    typeList: { type: Object, required: true },
    alarmList: { type: Array, required: true }
  },
  setup(props, ctx) {

    interface list {
        time: string,
        levels: number,
        type: string,
        content: string,
        status: string
    }
    interface Props {
        typeList: object;
        alarmList: list[];
    }
    return (): JSX.Element => (
      <>
<div class="eventList">
        {props.alarmList.map((item, index) => (
          <div class="eventBox" key={index}>
          <div class="eventBox-left">            {item.time}</div>
          <img class="eventBox-centre" src={getAssetsImage(props.typeList[item.levels])}></img>
          <div class="eventBox-right">
            <div class="info-panel-triple"></div>
            <div>
              <div>                {item.type}</div>
              <div>                {item.content}</div>
            </div>
            <div class={[item.status ? 'success' : 'warn']}>              {item.status ? '已确认' : '待确认'}</div>
          </div>
          <div class="line"></div>
        </div>
        ))}
      </div>
      </>
    );
  },
});

export default DeviceEvents;
