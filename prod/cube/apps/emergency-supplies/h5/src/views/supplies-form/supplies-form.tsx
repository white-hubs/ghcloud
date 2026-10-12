import { Button, showNotify } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { SuppliesFields } from "./supplies-fields";
import { service } from "@/shared";
import { assertForm, buildPayload, createInitialForm, type SuppliesFormState } from "@/views/supplies-list/supplies-shared";

import styles from "./supplies-form.module.less";

export const SuppliesForm = defineComponent({
  name: "SuppliesForm",
  setup: () => {
    const router = useRouter();
    const submitLoading = ref(false);
    const form = reactive<SuppliesFormState>(createInitialForm());

    const submit = async (): Promise<void> => {
      try {
        assertForm(form);
      } catch (error) {
        showNotify({ type: "warning", message: (error as Error).message });
        return;
      }
      submitLoading.value = true;
      try {
        await service.createSupplies({
          ...buildPayload(form),
          status: "ENABLED",
        });
        showNotify({ type: "success", message: "操作成功" });
        router.back();
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "操作失败",
        });
      } finally {
        submitLoading.value = false;
      }
    };

    return () => (
      <div class={styles.page}>
        <header class={styles.appHeader}>
          <button class={styles.backButton} type="button" onClick={() => router.back()}>
            <span>‹</span>
            返回
          </button>
          <h1>新增物资 / 入库登记</h1>
          <i />
        </header>

        <section class={styles.contentBlock}>
          <SuppliesFields form={form} />
        </section>

        <div class={styles.footer}>
          <Button class={styles.submitButton} type="primary" block loading={submitLoading.value} onClick={submit}>
            确认新增
          </Button>
        </div>
      </div>
    );
  },
});
