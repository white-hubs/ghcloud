import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";

export const RentRatioDataCollection = defineComponent({
  name: 'RentRatioDataCollection',
  setup () {
    const columns = ref([
      {
        title: "区域名称",
        dataIndex: "area",
      },
      {
        title: "租金单价",
        dataIndex: "rentPrice",
      },
      {
        title: "销售单价",
        dataIndex: "salePrice",
      }
    ]);

    const data = ref([
      {
        area: "区域A",
        rentPrice: 120,
        salePrice: 20000,
        ratio: 0.6
      },
      {
        area: "区域B",
        rentPrice: 150,
        salePrice: 22000,
        ratio: 0.68
      },
      {
        area: "区域C",
        rentPrice: 180,
        salePrice: 25000,
        ratio: 0.72
      },
      {
        area: "区域A",
        rentPrice: 120,
        salePrice: 20000,
        ratio: 0.6
      },
      {
        area: "区域B",
        rentPrice: 150,
        salePrice: 22000,
        ratio: 0.68
      },
      {
        area: "区域C",
        rentPrice: 180,
        salePrice: 25000,
        ratio: 0.72
      },
      {
        area: "区域A",
        rentPrice: 120,
        salePrice: 20000,
        ratio: 0.6
      },
      {
        area: "区域B",
        rentPrice: 150,
        salePrice: 22000,
        ratio: 0.68
      },
      {
        area: "区域C",
        rentPrice: 180,
        salePrice: 25000,
        ratio: 0.72
      },
      {
        area: "区域A",
        rentPrice: 120,
        salePrice: 20000,
        ratio: 0.6
      },
      {
        area: "区域B",
        rentPrice: 150,
        salePrice: 22000,
        ratio: 0.68
      },
      {
        area: "区域C",
        rentPrice: 180,
        salePrice: 25000,
        ratio: 0.72
      },
      {
        area: "区域A",
        rentPrice: 120,
        salePrice: 20000,
        ratio: 0.6
      },
      {
        area: "区域B",
        rentPrice: 150,
        salePrice: 22000,
        ratio: 0.68
      },
      {
        area: "区域C",
        rentPrice: 180,
        salePrice: 25000,
        ratio: 0.72
      },
    ]);

    return (): JSX.Element => (
      <SubPanelTemplate title="租赁比例数据收集">
        <div class='card-container-3'>
          <RollTable column={columns.value} data={data.value}></RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})