import { cubeMdataService } from "../../api/service";
import type { AreaTree as AreaTreeType } from "@ghcloud/cube-mdata-service";
import { DownOutlined } from "@ghcloud/cube-ui";
import { Tree } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/vc-tree/interface";
//@ts-expect-error
import _ from "lodash";
import { computed, defineComponent, ref } from "vue";

/** 区域树 */
export const AreaTree = defineComponent({
  props: ["filterName"],
  emits: ["select", "getAreaTreeData"],
  setup(props: { filterName: string }, { emit }) {
    const areaOptions = ref<AreaTreeType[]>([]);
    const expandedKeys = ref<Key[]>([]);
    const selectedKeys = ref<Key[]>([]);
    cubeMdataService.getAreaTree().then((res) => {
      areaOptions.value = res as never[];
      emit("getAreaTreeData", areaOptions.value);
    });
    const options = computed(() => {
      if (!props.filterName) {
        return areaOptions.value;
      }
      // 多级递归筛选
      const filter = (items: AreaTreeType[]): AreaTreeType[] => {
        const list: AreaTreeType[] = [];
        items.forEach((item) => {
          if (item.name.includes(props.filterName)) {
            list.push(item);
          } else if (item.children && item.children.length > 0) {
            list.push(...filter(item.children));
          }
        });
        return list;
      };
      return filter(areaOptions.value);
    });

    // 根据Id递归查询
    const getAreaById = (id: string, items: AreaTreeType[]): AreaTreeType | null => {
      for (const item of items) {
        if (item.id === id) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const area = getAreaById(id, item.children);
          if (area) {
            return area;
          }
        }
      }
      return null;
    };

    return (): JSX.Element => (
      <>
        <Tree
          v-slots={{
            switcherIcon: ({ switcherCls }: { switcherCls: string }) => <DownOutlined class={switcherCls} />,
          }}
          fieldNames={{ children: "children", title: "name", key: "id" }}
          v-model:selectedKeys={selectedKeys.value}
          expanded-keys={expandedKeys.value}
          tree-data={options.value}
          onExpand={(keys: Key[], { expanded, node }) => {
            const tempKeys = ((node.parent ? node.parent.children : options.value) || []).map(({ id }) => id);
            if (expanded) {
              expandedKeys.value = _.difference(keys, tempKeys).concat(node.id);
            } else {
              expandedKeys.value = keys;
            }
          }}
          onSelect={() => {
            emit(
              "select",
              selectedKeys.value,
              selectedKeys.value.map((id) => getAreaById(id as string, areaOptions.value)),
            );
          }}
        />
      </>
    );
  },
});
