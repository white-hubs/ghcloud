import { defineComponent } from "vue";

import "./monitor-list.module.less";

interface MonitorListItem {
  name: string;
  color: string;
  value: number;
}

export const MonitorList = defineComponent({
  name: "MonitorList",
  props: {
    monitorData: { type: Array as () => MonitorListItem[], required: true },
    customValue: { type: Boolean, required: false, default: false },
  },
  emits: ["item-click"],
  setup(props, { emit }) {
    const handleClick = (item: MonitorListItem): void => {
      emit("item-click", item);
    };

    return (): JSX.Element => (
      <div class="monitor">
        {props.monitorData.map((item, index) => (
          <div
            class="monitorBox"
            key={item.name || index}
            onClick={() => {
              handleClick(item);
            }}
          >
            <div class="monitorList">
              <div class="monitorColor" style={{ background: item.color }}></div>
              <div>{item.name}</div>
            </div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
    );
  },
});

export default MonitorList;
