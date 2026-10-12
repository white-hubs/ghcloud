import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, useCubeTable } from "@ghcloud/cube-app-design";
import type { DispatchOrderVO } from "@ghcloud/cube-service-interface/emergency-supplies";
import { Button, Descriptions, DescriptionsItem, message } from "@ghcloud/cube-ui";

import { service, statusLabel } from "@/shared";

import styles from "./dispatch-order-detail.module.less";

export const DispatchOrderDetail = defineComponent({
  name: "DispatchOrderDetail",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const detail = ref<DispatchOrderVO>();
    const load = async () => {
      if (route.query.id) detail.value = await service.getDispatchOrderDetail(route.query.id as string);
    };
    const [CubeTable] = useCubeTable({
      rowKey: "id",
      tableCode: "EMERGENCY_SUPPLIES_DISPATCH_DETAIL",
      columns: [
        { title: "物资", dataIndex: "suppliesNameSnapshot" },
        { title: "仓库", dataIndex: "warehouseNameSnapshot" },
        { title: "调用数量", dataIndex: "dispatchQuantity" },
        { title: "已归还", dataIndex: "totalReturned" },
        { title: "已核销", dataIndex: "totalWriteoff" },
        {
          title: "状态",
          dataIndex: "status",
          customRender: ({ text }: { text?: string }) => <span class={styles.statusTag}>{statusLabel(text)}</span>,
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 160,
          customRender: ({ record }: { record: any }) => (
            <>
              <Button
                type="link"
                size="small"
                onClick={async () => {
                  await service.returnDispatchItem(record.id, {
                    quantity: record.dispatchQuantity - record.totalReturned - record.totalWriteoff,
                  });
                  message.success("操作成功");
                  load();
                }}
              >
                归还
              </Button>
              <Button
                type="link"
                size="small"
                onClick={async () => {
                  await service.writeoffDispatchItem(record.id, {
                    quantity: record.dispatchQuantity - record.totalReturned - record.totalWriteoff,
                  });
                  message.success("操作成功");
                  load();
                }}
              >
                核销
              </Button>
            </>
          ),
        },
      ],
      fetchApi: async () => ({
        records: detail.value?.items ?? [],
        total: detail.value?.items?.length ?? 0,
      }),
    });
    onMounted(load);
    const slots = {
      "layout-content": () => (
        <div class={styles.content}>
          <div class={styles.section}>
            <Descriptions column={3}>
              <DescriptionsItem label="调用单号">{detail.value?.code ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="调用人">{detail.value?.dispatcherName ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="状态">{statusLabel(detail.value?.status)}</DescriptionsItem>
              <DescriptionsItem label="调用时间">{detail.value?.dispatchTime ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="预计归还">{detail.value?.expectedReturnTime ?? "--"}</DescriptionsItem>
              <DescriptionsItem label="备注">{detail.value?.remark ?? "--"}</DescriptionsItem>
            </Descriptions>
          </div>
          <div class={styles.section}>
            <CubeTable />
          </div>
        </div>
      ),
      "footer-page": () => (
        <Button type="primary" onClick={() => router.replace("/dispatch-order-list")}>
          返回
        </Button>
      ),
    };
    return () => <CubeLayout title="调用详情" v-slots={slots} />;
  },
});
