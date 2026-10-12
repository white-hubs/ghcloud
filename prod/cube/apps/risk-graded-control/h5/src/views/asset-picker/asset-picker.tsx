import { Button, Cell, CellGroup, Empty, List, PullRefresh, Radio, RadioGroup, Search, showToast } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { showApiError } from "@/utils/api-error";
import { saveAssetPickResult } from "@/utils/asset-pick-result";
import { pagePropertyAssets, PROPERTY_ASSET_PAGE_SIZE, type PropertyAssetOption } from "@/utils/load-property-assets";

import styles from "./asset-picker.module.less";

function formatAssetMeta(asset: PropertyAssetOption): string {
  const parts = [asset.typeName, asset.receiveDepName, asset.areaName].filter(Boolean);
  return parts.join(" · ") || "--";
}

export const AssetPickerPage = defineComponent({
  name: "AssetPickerPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const objectIdx = Number(route.query.objectIdx ?? 0);
    const selectedId = ref(String(route.query.assetId ?? ""));
    const keyword = ref("");
    const records = ref<PropertyAssetOption[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const pageNumber = ref(0);
    const total = ref(0);

    const loadPage = async (): Promise<void> => {
      loading.value = true;
      try {
        pageNumber.value += 1;
        const page = await useAuthRequest(() =>
          pagePropertyAssets({
            pageNumber: pageNumber.value,
            pageSize: PROPERTY_ASSET_PAGE_SIZE,
            keyword: keyword.value,
          }),
        );
        total.value = page.total;
        if (pageNumber.value === 1) {
          records.value = [];
        }
        records.value = [...records.value, ...page.records];
        finished.value = records.value.length >= total.value || page.records.length < PROPERTY_ASSET_PAGE_SIZE;
      } catch (e) {
        showApiError(e);
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };

    const resetAndLoad = (): void => {
      pageNumber.value = 0;
      finished.value = false;
      void loadPage();
    };

    const onSearch = (): void => {
      resetAndLoad();
    };

    const onRefresh = (): void => {
      refreshing.value = true;
      resetAndLoad();
    };

    const goBackWithResult = (id: string, name: string): void => {
      saveAssetPickResult({ objectIdx, id, name });
      router.back();
    };

    const confirm = (): void => {
      if (!selectedId.value) {
        showToast("请选择资产");
        return;
      }
      const selected = records.value.find((item) => item.id === selectedId.value);
      goBackWithResult(selectedId.value, selected?.name ?? String(route.query.assetName ?? ""));
    };

    const clearAssociation = (): void => {
      goBackWithResult("", "");
    };

    onMounted(() => {
      document.title = "选择关联资产";
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="选择关联资产" isShowRight={false} />
        <div class={styles.searchWrap}>
          <Search v-model={keyword.value} placeholder="请输入资产名称" onSearch={onSearch} />
        </div>
        <div class={styles.listWrap}>
          <PullRefresh modelValue={refreshing.value} onRefresh={onRefresh}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={records.value.length === 0 ? "" : "没有更多了"}
              onLoad={loadPage}
            >
              <RadioGroup v-model={selectedId.value}>
                <CellGroup inset>
                  {records.value.map((item) => (
                    <Cell
                      key={item.id}
                      clickable
                      onClick={() => {
                        selectedId.value = item.id;
                      }}
                      v-slots={{
                        title: () => (
                          <div>
                            <div>{item.name}</div>
                            <div class={styles.assetMeta}>{formatAssetMeta(item)}</div>
                          </div>
                        ),
                        "right-icon": () => <Radio name={item.id} />,
                      }}
                    />
                  ))}
                </CellGroup>
              </RadioGroup>
              {!loading.value && records.value.length === 0 && pageNumber.value >= 1 && <Empty description="暂无可选资产" />}
            </List>
          </PullRefresh>
        </div>
        <div class={styles.bottomBar}>
          <Button class={styles.bottomBtn} onClick={clearAssociation}>
            不关联
          </Button>
          <Button class={styles.bottomBtn} type="primary" onClick={confirm}>
            确定
          </Button>
        </div>
      </div>
    );
  },
});
