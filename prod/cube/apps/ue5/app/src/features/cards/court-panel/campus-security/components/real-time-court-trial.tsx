import { Col, Row } from "ant-design-vue";
import { defineComponent } from "vue";
import { reactive, toRefs, onMounted } from "vue";

import styles from "./real-time-court-trial.module.less";

export const RealTimeCourtTrial = defineComponent({
  name: "RealTimeCourtTrial",
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
        <div class="real-time-court-trial">
          <div class="images">
            <img src="./images/court1.png" alt srcset></img>
            <img src="./images/court1.png" alt srcset></img>
          </div>
          <div class="content">
            <div class="item">
              <div class="label"> 案号：</div>
              <div class="value"> 民事（2024）陕0602民初5934号</div>
            </div>
            <div class="item">
              <div class="label"> 案由：</div>
              <div class="value"> 信用卡纠纷</div>
            </div>
            <div class="item">
              <div class="label"> 案件名称：</div>
              <div class="value"> 原告李某某诉被告张某某等民间借贷纠纷一案</div>
            </div>
            <Row>
              <Col span={12}>
                <div class="item">
                  <div class="label"> 承办部门：</div>
                  <div class="value"> 法务一部</div>
                </div>
              </Col>
              <Col span={12}>
                <div class="item">
                  <div class="label"> 主审法官：</div>
                  <div class="value"> 刘德泽</div>
                </div>
              </Col>
              <Col span={12}>
                <div class="item">
                  <div class="label"> 原告人员：</div>
                  <div class="value"> 程海超</div>
                </div>
              </Col>
              <Col span={12}>
                <div class="item">
                  <div class="label"> 被告人员：</div>
                  <div class="value"> 邓海阳</div>
                </div>
              </Col>
            </Row>
            <div class="item">
              <div class="label"> 开庭时间：</div>
              <div class="value"> 2024年12月12日 8:30</div>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default RealTimeCourtTrial;
