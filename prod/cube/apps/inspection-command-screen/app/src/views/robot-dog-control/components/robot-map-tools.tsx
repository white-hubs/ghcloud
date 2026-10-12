import { DeleteOutlined, EnvironmentOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons-vue";
import { defineComponent, type PropType } from "vue";

import { Button } from "@ghcloud/cube-ui";

export const RobotMapTools = defineComponent({
  name: "RobotMapTools",
  props: {
    onAction: {
      type: Function as PropType<(action: string) => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="robot-map-tools">
        <section class="robot-section robot-navigation-card">
          <div class="robot-section-title">
            <span class="robot-section-icon">◉</span>
            <strong>导航目标</strong>
          </div>
          <div class="robot-coordinate-grid">
            {["X (M)", "Y (M)", "YAW (°)"].map((label) => (
              <label key={label}>
                <span>{label}</span>
                <input value="0.00" readonly />
              </label>
            ))}
          </div>
          <div class="robot-info-box">
            <span>ⓘ</span>
            <p>直接在地图上单击目标可自动填入目标坐标，无需手动输入。Yaw为朝向角度，0 = 正东方向。</p>
          </div>
          <Button type="primary" class="robot-wide-btn" onClick={() => props.onAction("发送导航目标")}>
            <SendOutlined />
            发送导航目标
          </Button>
          <Button danger class="robot-wide-btn robot-danger-ghost" onClick={() => props.onAction("取消导航")}>
            × 取消导航
          </Button>
          <div class="robot-idle-bar">● 待命</div>
        </section>

        <section class="robot-section">
          <div class="robot-section-title">
            <span class="robot-section-icon">↝</span>
            <strong>巡检路线</strong>
          </div>
          <div class="robot-warning-box">
            <EnvironmentOutlined />
            <p>在地图上 Shift + 单击 依次标记多个目标点，机器狗将按照顺序自动逐点导航。</p>
          </div>
          <div class="robot-empty-route">尚未添加巡检点</div>
          <div class="robot-route-actions">
            <Button onClick={() => props.onAction("添加当前点")}>
              <EnvironmentOutlined />
              添加当前点
            </Button>
            <Button onClick={() => props.onAction("清空路线")}>
              <DeleteOutlined />
              清空
            </Button>
          </div>
          <Button type="primary" class="robot-wide-btn" onClick={() => props.onAction("开始巡检")}>
            ▶ 开始巡检
          </Button>
          <Button class="robot-wide-btn" disabled>
            ■ 停止巡检
          </Button>
        </section>

        <section class="robot-section">
          <div class="robot-section-title">
            <span class="robot-section-icon">◎</span>
            <strong>地图管理</strong>
          </div>
          <div class="robot-map-note">
            Web UI 保存与命令行等效，底层均调用 <code>nav2_map_server map_saver_cli</code> 生成 <code>.pgm</code> 与 <code>.yaml</code>{" "}
            地图文件。
          </div>
          <input class="robot-map-input" placeholder="文件名（留空则自动按时间戳命名）" />
          <Button class="robot-wide-btn robot-outline-primary" onClick={() => props.onAction("保存当前地图")}>
            <SaveOutlined />
            保存当前地图
          </Button>
        </section>
      </div>
    );
  },
});
