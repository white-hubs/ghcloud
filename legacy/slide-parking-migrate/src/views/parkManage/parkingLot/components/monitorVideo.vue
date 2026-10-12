<template lang="pug">
div.monitor_ctr(ref="monitor_ctr" :style="monitorStyle")
  div.list_ctr(v-for="item,index in videoList" @click="checkBox(index)" :class="checkBoxIndex === index ? 'primary-color-border' : '' ")
    ItemVideo(
      v-if="item?.name" 
      :title="item?.name" 
      @fullScreen="changeFull" 
      @deleteItem="deleteItem"
      :ref="el => setRef(el,index)" 
      :cameraItem="item"
      :index="index")
    div.nullTips(v-else)
      //- :description="`添加视频 ${ index+1 } `"
      a-empty(description="" :image="image")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  computed,
  reactive,
  nextTick,
  toRefs,
  watch,
  ref,
} from "vue";
import ItemVideo from "./itemVideo.vue";
const fallback = "data:image/png;base64,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"
export default defineComponent({
  components: {
    ItemVideo,
  },
  props: {
    videoList: {
      type: Array,
      default: () => {
        return [{ name: "测试" }];
      },
    },
    selectedSpace: {
      type: Object,
      default: () => {
        return {
          value: 4,
          label: "2X2",
        };
      },
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      checkBoxIndex: null,
    });

    const image = fallback;

    const monitorStyle = computed(() => {
      const [colNum, rowNum] = props.selectedSpace.label.split("X");
      let areas = "area1";
      switch (props.selectedSpace.value) {
        case 1:
          areas = `'area1'`;
          break;
        case 4:
          areas = `
          'area1 area2'
          'area3 area4'
          `;
          break;
        case 9:
          areas = `
          'area1 area2 area3'
          'area4 area5 area6'
          'area7 area8 area9'
          `;
          break;
        case 16:
          areas = `
          'area1 area2 area3 area4'
          'area5 area6 area7 area8'
          'area9 area10 area11 area12'
          'area13 area14 area15 area16'
          `;
          break;
        case 25:
          areas = `
          'area1 area2 area3 area4 area5'
          'area6 area7 area8 area9 area10'
          'area11 area12 area13 area14 area15'
          'area16 area17 area18 area19 area20'
          'area21 area22 area23 area24 area25'
          `;
          break;
      }
      return {
        display: "grid",
        "grid-template-columns": `repeat(${colNum}, 1fr)`,
        "grid-template-rows": `repeat(${rowNum}, 1fr)`,
        "grid-row-gap": "8px",
        "grid-column-gap": "8px",
        "grid-template-areas": areas,
      };
    });

    let itemForm = ref([]);
    const setRef = (el, index) => {
      itemForm.value[index] = el;
    };

    const changeFull = (status, index) => {
      const element = itemForm.value[index]?.ItemVideoCtr;
      if (status === "open") {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullScreen();
        }
        itemForm.value[index].isFull = true;
      } else if (status === "close") {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        itemForm.value[index].isFull = false;
      }
    };

    const checkBox = (index) => {
      state.checkBoxIndex = index;
      emit("checkbox", index);
    };

    const deleteItem = (index) => {
      emit("deleteItem", index);
    };

    onMounted(function(){});

    // watch(
    //   () => monitorStyle.value,
    //   (n) => {
    //   }
    // );

    return {
      image,
      monitorStyle,
      ...toRefs(state),
      changeFull,
      deleteItem,
      checkBox,
      setRef,
    };
  },
});
</script>
<style lang="less" scoped>
.monitor_ctr {
  width: 100%;
  height: 100%;
  border: 1px solid #000;
  padding: 16px;
  .list_ctr {
    width: 100%;
    height: 100%;
    position: relative;
    // border: 1px solid #000;
    background-color: #f3f3f3;
    overflow: hidden;
    cursor: pointer;
    .nullTips {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      :deep(.ant-empty) {
        width: 100%;
        // max-height: 95%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        overflow: hidden;
        .ant-empty-image {
          width: 100%;
          height: 100%;
          margin: 0;
          display: inline-block;
          img {
            width: 100%;
            height: 100%;
          }
        }
        p {
          margin: 0;
          // font-size: 16px;
        }
      }
    }
  }
}
</style>
