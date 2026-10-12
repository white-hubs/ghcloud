<template lang="pug">
div.navtabs
    a-tabs(
      :activeKey="activeKey" 
      type="editable-card" 
      hide-add 
      @edit="onEdit" 
      size="small" 
      @change="changeTab")
        a-tab-pane(
          v-for="pane,index in tabPanes" 
          :key="pane.id" 
          :closable="false")
          //- :closable="tabPanes.length>1 && (mouseIndex===index || pane.id === activeKey)")
          template(#tab) 
            span.tabItem(@mouseover="changeIndex(index)" @mouseleave="mouseleave") 
              span {{pane.applicationName}}-{{pane.name}}
              CloseOutlined.close(v-if="tabPanes.length>1 && (mouseIndex===index || pane.id === activeKey)" @click.stop="onEdit(pane.id)")
          //- :closable="tabPanes.length>1")
    //- a-breadcrumb
    //-     a-breadcrumb-item {{menuName.name}}
    //-     a-breadcrumb-item(v-for="(item,i) in breadcrums" :key="i") {{item}}
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import {
computed, defineComponent, onMounted, reactive,
toRefs,
watch
} from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: { CloseOutlined },
  props: {
    activeKey: {
      default: "",
      type: String,
    },
    title: {
      default: "",
      type: String,
    },
    tabPanes: {
      default: () => {
        return [];
      },
      type: Array,
    },
    breadcrums: {
      default: () => {
        return [];
      },
      type: Array,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      activeKey: props.activeKey,
      menuName: null,
      mouseIndex: 0,
    });
    const onEdit = (key) => {
      const obj = props.tabPanes.find((item) => item.id === key);
      emit("removeTab", key, obj);
    };
    const changeTab = (key) => {
      const index = props.tabPanes.findIndex((item) => item.id === key);
      const obj = props.tabPanes.find((item) => item.id === key);
      if (index !== -1) {
        state.mouseIndex = index;
      }
      emit("changeTab", key, obj);
    };

    state.menuName = computed(() => {
      return store.getters.currentApplication;
    });

    const changeIndex = (index) => {
      state.mouseIndex = index;
    };

    const mouseleave = () => {
      state.mouseIndex = null;
    };

    onMounted(() => {
    });

    watch(
      () => props.activeKey,
      (newVal) => {
        const index = props.tabPanes.findIndex((item) => item.id === newVal);
        if (index !== -1) {
          state.mouseIndex = index;
        }
        state.activeKey = newVal;
      }
    );
    return {
      ...toRefs(state),
      onEdit,
      changeTab,
      changeIndex,
      mouseleave,
    };
  },
});
</script>

<style lang="less">
.navtabs {
  .ant-tabs-nav {
    width: 100%;
    text-align: left;
    // padding: 0 6px;
  }
  .tabItem {
    padding: 0 8px;
    display: inline-block;
  }
  .close {
    width: 16px;
    height: 16px;
    // margin-right: -5px;
    // margin-left: 3px;
    margin: 0;
    margin-right: 0 !important;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    vertical-align: middle;
    transition: all 0.3s;
  }

  .ant-tabs-bar {
    margin: 0;
  }
  .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
    padding: 0 0 !important;
  }
}

// .ant-tabs-nav .ant-tabs-tab {
//   padding: 0 0;
// }
</style>
