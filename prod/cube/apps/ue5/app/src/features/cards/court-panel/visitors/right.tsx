import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const product = reactive({
      column: [
        {
          title: "来访人",
          dataIndex: "name",
        },
        {
          title: "身份证号",
          dataIndex: "code",
        },
        {
          title: "来访时间",
          dataIndex: "time",
        },
      ],
      tableData: [
        {
          name: "张磊",
          code: "510127********0034",
          time: "2024-11-14",
        },
        {
          name: "李雪",
          code: "510127********0003",
          time: "2024-11-14",
        },
        {
          name: "龚瑞韩",
          code: "510120********6534",
          time: "2024-11-14",
        },
        {
          name: "毛海涛",
          code: "510122********003X",
          time: "2024-11-14",
        },
        {
          name: "王刚",
          code: "510128********0237",
          time: "2024-11-14",
        },
        {
          name: "李双国",
          code: "510135********1194",
          time: "2024-11-14",
        },
        {
          name: "曾炳秋",
          code: "510135********1196",
          time: "2024-11-14",
        },
      ],
    });

    return (): JSX.Element => (
      <div>
        {" "}
        <SubPanelTemplate title="来访记录列表" class="product-table">
          {" "}
          <RollTable column={product.column} data={product.tableData} showLength={20}></RollTable>
        </SubPanelTemplate>
      </div>
    );
  },
});

export default Right;
