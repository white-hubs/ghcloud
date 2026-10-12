import { defineComponent, type PropType } from "vue";

import type { PositionPoint } from "@/models/positioning";

import "./position-map.less";

export interface MapSegment {
  id: string;
  points: PositionPoint[];
}
const project = (point: PositionPoint): string => `${point.x * 10},${point.y * 10}`;

/** 仅用于本期 mock 数据的二维示意，不表达真实建筑或地理坐标。 */
export const PositionMap = defineComponent({
  props: {
    scene: { type: String, required: true },
    point: { type: Object as PropType<PositionPoint | undefined>, default: undefined },
    label: { type: String, default: "当前位置" },
    muted: { type: Boolean, default: false },
    segments: { type: Array as PropType<MapSegment[]>, default: () => [] },
  },
  setup(props) {
    return () => (
      <div class="personnel-position-map">
        <div class="personnel-position-map__scene">
          <span class="personnel-position-map__scene-dot" />
          {props.scene}
          <span class="personnel-position-map__demo">示例平面图 · 演示</span>
        </div>
        <svg
          class="personnel-position-map__canvas"
          viewBox="0 0 1000 580"
          role="img"
          aria-label={`${props.scene}，示例平面图${props.point ? `，${props.label}` : ""}`}
        >
          <rect x="0" y="0" width="1000" height="580" fill="#f3f7fb" />
          {Array.from({ length: 19 }, (_, i) => (
            <path key={`v${i}`} d={`M${(i + 1) * 50} 0V580`} stroke="#e7edf4" />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${(i + 1) * 50}H1000`} stroke="#e7edf4" />
          ))}
          <g fill="#e7eef5" stroke="#aebed0" stroke-width="3">
            <path d="M70 90H375V155H70Z" />
            <path d="M420 90H690V155H420Z" />
            <path d="M735 90H930V250H735Z" />
            <path d="M70 415H320V510H70Z" />
            <path d="M365 415H610V510H365Z" />
            <path d="M660 315H930V510H660Z" />
          </g>
          <g fill="#7c8fa5" font-size="18" text-anchor="middle">
            <text x="222" y="132">
              生产区域 A
            </text>
            <text x="555" y="132">
              生产区域 B
            </text>
            <text x="832" y="170">
              辅助区域
            </text>
            <text x="195" y="470">
              仓储区域
            </text>
            <text x="487" y="470">
              设备区域
            </text>
            <text x="795" y="415">
              办公区域
            </text>
          </g>
          <path d="M60 290H620V375H620" fill="none" stroke="#d4e0ed" stroke-width="3" stroke-dasharray="10 8" />
          {props.segments.map((segment) => (
            <g key={segment.id}>
              {segment.points.length > 1 && (
                <polyline
                  points={segment.points.map(project).join(" ")}
                  fill="none"
                  stroke="#337bef"
                  stroke-width="4"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
              )}
              {segment.points.map((point, index) => (
                <circle
                  key={`${point.at}-${index}`}
                  cx={point.x * 10}
                  cy={point.y * 10}
                  r="5"
                  fill="#fff"
                  stroke="#337bef"
                  stroke-width="2"
                >
                  <title>{point.at}</title>
                </circle>
              ))}
            </g>
          ))}
          {props.point && (
            <g transform={`translate(${project(props.point).replace(",", " ")})`}>
              <circle r="24" fill={props.muted ? "#c8d0da" : "#bfd5fc"} opacity="0.65" />
              <circle r="11" fill={props.muted ? "#8794a6" : "#337bef"} stroke="#fff" stroke-width="4" />
              <rect x="-78" y="-66" width="156" height="32" rx="5" fill="#fff" stroke="#d5e0ee" />
              <text y="-45" text-anchor="middle" fill="#23354d" font-size="14">
                {props.label}
              </text>
            </g>
          )}
          <g transform="translate(946 40)" fill="#73859a">
            <path d="M0 0L-7 18L0 14L7 18Z" />
            <text x="0" y="-7" font-size="13" text-anchor="middle">
              N
            </text>
          </g>
        </svg>
        <div class="personnel-position-map__note">布局与坐标仅用于定位效果演示</div>
      </div>
    );
  },
});
