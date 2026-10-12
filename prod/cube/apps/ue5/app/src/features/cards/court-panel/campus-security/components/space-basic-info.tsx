import { defineComponent } from "vue";
import { reactive, toRefs, onMounted } from "vue";

import styles from "./space-basic-info.module.less";

export const SpaceBasicInfo = defineComponent({
  name: "SpaceBasicInfo",
  setup(_props, { expose }) {
    /**
     * 数据部分
     */
    const state = reactive({});
    onMounted(() => {});
    // 使用toRefs解构
    // let { } = { ...toRefs(state) }
    expose({
      ...toRefs(state),
    });

    return (): JSX.Element => (
      <>
        <div class="basic-info">
          <div class="img-info">
            <img src="./images/court2.png" alt srcset></img>
            <div class="info">
              <div class="title">
                <div class="label">
                  <div class="label-text"> 空间名称</div>
                  <div class="status"> 使用中</div>
                </div>
                <div class="value"> 大法庭</div>
              </div>
              <div class="area">
                <div class="label">
                  {" "}
                  <div class="label-text"> 所在区域</div>
                </div>
                <div class="value"> 办公1区</div>
              </div>
            </div>
          </div>
          <div class="address">
            <div class="label">
              {" "}
              <div class="label-text"> 详细位置</div>
            </div>
            <div class="value"> 办公大楼-2楼-大法庭</div>
          </div>
        </div>
      </>
    );
  },
});

export default SpaceBasicInfo;
