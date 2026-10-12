import { computed, defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Space } from "@ghcloud/cube-ui";

import { goBack } from "../shared/page";
import { ColdStorageForm } from "./components/cold-storage-form";

import "./form-page.less";

interface ColdStorageFormExpose {
  submit: () => Promise<void>;
}

export const ColdStorageManagementFormPage = defineComponent({
  name: "ColdStorageManagementFormPage",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<ColdStorageFormExpose | null>(null);
    const submitting = ref(false);

    const editingId = computed(() => {
      const value = route.query.id;
      return Array.isArray(value) ? (value[0] ?? undefined) : value ? String(value) : undefined;
    });

    const isEdit = computed(() => route.name === "cold-storage-management-edit" || Boolean(editingId.value));

    const pageTitle = computed(() => {
      if (route.meta.title) {
        return String(route.meta.title);
      }
      return isEdit.value ? "编辑冷库" : "新增冷库";
    });

    const confirmText = computed(() => (isEdit.value ? "确认保存" : "确认创建"));

    const back = (): void => {
      goBack(router, { name: "cold-storage-management" });
    };

    const handleSubmit = async (): Promise<void> => {
      if (!formRef.value) {
        return;
      }
      submitting.value = true;
      try {
        await formRef.value.submit();
      } finally {
        submitting.value = false;
      }
    };

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class="cold-storage-form-page">
          <ColdStorageForm
            ref={formRef}
            editingId={editingId.value}
            onSuccess={() => {
              back();
            }}
          />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={back}>取消</Button>
          <Button type="primary" loading={submitting.value} onClick={() => void handleSubmit()}>
            {confirmText.value}
          </Button>
        </Space>
      ),
    };

    return (): JSX.Element => (
      <div class="cold-storage-management-form-page">
        <CubeLayout title={pageTitle.value} showFooter v-slots={layoutSlots} />
      </div>
    );
  },
});
