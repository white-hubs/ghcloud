import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, InputNumber, Select, message } from "@ghcloud/cube-ui";

import { service } from "@/shared";

import styles from "./dispatch-order-form.module.less";

export const DispatchOrderForm = defineComponent({
  name: "DispatchOrderForm",
  setup: () => {
    const router = useRouter();
    const loading = ref(false);
    const suppliesOptions = ref<{ label: string; value: string }[]>([]);
    const form = reactive<any>({
      dispatcherName: "",
      expectedReturnTime: "",
      remark: "",
      items: [{ suppliesId: undefined, dispatchQuantity: 1 }],
    });
    const load = async () => {
      const data = await service.getSuppliesPage({
        pageNumber: 1,
        pageSize: 200,
        status: "ENABLED",
      });
      suppliesOptions.value = data.records.map((i) => ({
        label: `${i.name}（可用 ${i.availableQuantity ?? 0}${i.unit}）`,
        value: i.id,
      }));
    };
    const submit = async () => {
      loading.value = true;
      try {
        await service.createDispatchOrder(form);
        message.success("操作成功");
        router.replace("/dispatch-order-list");
      } finally {
        loading.value = false;
      }
    };
    onMounted(load);
    const slots = {
      "layout-content": () => (
        <div class={styles.content}>
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <h3 class={styles.sectionTitle}>调用信息</h3>
            </div>
            <Form model={form} label-col={{ style: { width: "110px" } }}>
              <FormItem label="调用人">
                <Input v-model:value={form.dispatcherName} />
              </FormItem>
              <FormItem label="预计归还">
                <Input v-model:value={form.expectedReturnTime} placeholder="YYYY-MM-DD HH:mm:ss" />
              </FormItem>
              <FormItem label="备注">
                <Input v-model:value={form.remark} />
              </FormItem>
            </Form>
          </div>
          <div class={styles.section}>
            <div class={styles.sectionHeader}>
              <h3 class={styles.sectionTitle}>调用物资</h3>
              <Button
                type="primary"
                onClick={() =>
                  form.items.push({
                    suppliesId: undefined,
                    dispatchQuantity: 1,
                  })
                }
              >
                添加物资
              </Button>
            </div>
            {form.items.map((item: any, index: number) => (
              <div class={styles.itemRow} key={index}>
                <Select style={{ flex: 1 }} v-model:value={item.suppliesId} options={suppliesOptions.value} placeholder="请选择物资" />
                <InputNumber style={{ width: "160px" }} v-model:value={item.dispatchQuantity} min={1} />
                <Button danger onClick={() => form.items.splice(index, 1)}>
                  删除
                </Button>
              </div>
            ))}
          </div>
        </div>
      ),
      "footer-page": () => (
        <>
          <Button onClick={() => router.replace("/dispatch-order-list")}>取消</Button>
          <Button type="primary" class={styles.ml16} loading={loading.value} onClick={submit}>
            提交
          </Button>
        </>
      ),
    };
    return () => <CubeLayout title="发起调用" v-slots={slots} />;
  },
});
