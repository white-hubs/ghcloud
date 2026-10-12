import styles from "./device-list.module.less";
import { cubeDeviceCenterService, cubeSecurityManagementService } from "@/api/server";
import type { TagType } from "@ghcloud/cube-iot-center-service";
import type { AreaTreeType, GenreVoType } from "@ghcloud/cube-security-management-service";
import { Button, Cascader, Field, Icon, Popup } from "vant";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

export const FilterDom = defineComponent({
  emits: ["searchForm"],
  props: {
    searchForm: {
      type: Object,
      default: () => ({
        pageNumber: 0,
        total: 1,
        pageSize: 20,
      }),
    },
  },
  setup(props, { emit }) {
    const search = ref<Record<string, unknown>>({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
    });
    const route = useRoute();
    const applicationCode = (route.query.applicationCode as string) ?? "";
    const tagCode = (route.query.applicationCode as string) ? `builtin.app::${applicationCode}` : "";
    const prefix = (route.query.prefix as string) ?? "custom.app::deviceCenter";
    const showAreaPicker = ref(false);
    const areaOptions = ref<AreaTreeType[]>([]);
    const statusList = ref([
      {
        label: "在线",
        value: true,
      },
      {
        label: "离线",
        value: false,
      },
    ]);
    const genreVoList = ref<GenreVoType[]>([]);
    const tagList = ref<TagType[]>([]);
    // 获取区域
    const removeNullChild = (option: AreaTreeType): void => {
      if (option.children) {
        if (option.children.length === 0) {
          delete option.children;
        } else {
          for (const iterator of option.children) {
            removeNullChild(iterator);
          }
        }
      }
    };
    const getArea = async (): Promise<void> => {
      const res = await cubeSecurityManagementService.getAreaTree({ applicationCode });
      for (const iterator of res) {
        removeNullChild(iterator);
      }
      areaOptions.value = res;
    };
    const getRefTagList = async (): Promise<void> => {
      const res = await cubeDeviceCenterService.getRefTagList({ tagCode, prefix });
      tagList.value = res;
    };
    const getApplicationGenreVo = async (): Promise<void> => {
      const res = await cubeSecurityManagementService.getApplicationGenreVo({ applicationCode });
      genreVoList.value = res;
    };
    getArea();
    getRefTagList();
    getApplicationGenreVo();
    // 选择区域查询
    const handleArea = (options: { selectedOptions: []; value: string }): void => {
      search.value.areaName = options.selectedOptions.map((item: { name: string }) => item.name).join("/");
      search.value.appAreaId = options.value;
      showAreaPicker.value = false;
    };
    watch(
      () => props.searchForm,
      () => {
        search.value = props.searchForm;
      },
      { immediate: true, deep: true },
    );
    watch(
      () => search.value,
      () => {
        emit("searchForm", search.value);
      },
      { immediate: true, deep: true },
    );
    return (): JSX.Element => (
      <div class={styles.filter}>
        <div>
          <p style={{ fontWeight: "bold" }}>设备状态</p>
          {statusList.value.map((item) => (
            <Button
              size="mini"
              plain
              key={item.label}
              class={[search.value.deviceStatus === item.value ? styles.active : "", styles["radio-button"]]}
              onClick={() => {
                if (search.value.deviceStatus === item.value) {
                  search.value.deviceStatus = "";
                  return;
                }
                search.value.deviceStatus = item.value;
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div>
          <p style={{ fontWeight: "bold" }}>区域选择</p>
          <Field
            v-model={search.value.areaName}
            is-link
            readonly
            name="area"
            placeholder="选择区域"
            onClick={() => {
              showAreaPicker.value = true;
            }}
          />
          <Popup v-model:show={showAreaPicker.value} position="bottom">
            <Cascader
              v-model={search.value.appAreaId}
              onFinish={handleArea}
              field-names={{ text: "name", value: "id", children: "children" }}
              options={areaOptions.value}
              onCancel={() => {
                showAreaPicker.value = false;
              }}
            />
          </Popup>
        </div>
        <div>
          <p style={{ fontWeight: "bold" }}>设备品类</p>
          <div>
            {genreVoList.value.map((item) => (
              <Button
                size="mini"
                plain
                key={item.deviceProdCategoryCodeConcat}
                class={[
                  search.value.deviceProdCategoryCodeConcat === item.deviceProdCategoryCodeConcat ? styles.active : "",
                  styles["radio-button"],
                ]}
                onClick={() => {
                  if (search.value.deviceProdCategoryCodeConcat === item.deviceProdCategoryCodeConcat) {
                    search.value.deviceProdCategoryCodeConcat = "";
                    return;
                  }
                  search.value.deviceProdCategoryCodeConcat = item.deviceProdCategoryCodeConcat;
                }}
              >
                {item.deviceProdCategoryName}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontWeight: "bold" }}>设备标签</p>
          {tagList.value.map((item) => (
            <Button
              size="mini"
              plain
              key={item.tagCode}
              class={[
                search.value.tagCodes && (search.value.tagCodes as string[]).find((x) => x === item.tagCode) ? styles.active : "",
                styles["checkbox-button"],
              ]}
              onClick={() => {
                if (!search.value.tagCodes) {
                  search.value.tagCodes = [];
                }
                if ((search.value.tagCodes as string[]).find((x) => x === item.tagCode)) {
                  search.value.tagCodes = (search.value.tagCodes as string[]).filter((x) => x !== item.tagCode);
                  return;
                }
                (search.value.tagCodes as string[]).push(item.tagCode);
              }}
            >
              {item.tagName}
              {search.value.tagCodes && (search.value.tagCodes as string[]).find((x) => x === item.tagCode) ? (
                <div class={styles.checkIcon}>
                  {" "}
                  <Icon name="success" color="#ffffff" />
                </div>
              ) : null}
            </Button>
          ))}
        </div>
      </div>
    );
  },
});
