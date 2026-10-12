import { Graph, Shape } from "@antv/x6";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, type PropType, ref, shallowRef, watch } from "vue";

import { ORG_CANVAS_HEADER_ICON } from "@/constants";
import type { OrgMemberUI, OrgNodeUI } from "@/types/ui";
import { resolveOrgMemberAvatarUrl } from "@/utils/member-avatar";

import styles from "./org-architecture-canvas.module.less";

const NODE_SHAPE = "safety-personnel-org-node";
const EDGE_SHAPE = "safety-personnel-org-edge";
const INPUT_PORT = "input";
const OUTPUT_PORT = "output";

const CARD_WIDTH = 450;
const HEADER_HEIGHT = 48;
const MEMBER_HEIGHT = 96;
const MEMBER_GAP = 10;
const BODY_PADDING_TOP = 14;
const BODY_PADDING_BOTTOM = 16;
const LEVEL_GAP = 82;
const SIBLING_GAP = 36;
const CANVAS_PADDING = 56;
const MAX_MEMBERS = 5;

let registered = false;

interface OrgGraphNodeData {
  node: OrgNodeUI;
  visibleMembers: OrgMemberUI[];
  hiddenCount: number;
}

interface LayoutNode {
  graphId: string;
  node: OrgNodeUI;
  depth: number;
  height: number;
  subtreeWidth: number;
  x: number;
  y: number;
  children: LayoutNode[];
}

function textEl(className: string, text: string): HTMLSpanElement {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

function memberInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed === "" ? "-" : trimmed.slice(0, 1);
}

function measureNodeHeight(node: OrgNodeUI): number {
  const visible = Math.min(node.members.length, MAX_MEMBERS);
  const itemCount = Math.max(1, visible + (node.members.length > MAX_MEMBERS ? 1 : 0));
  const rows = Math.ceil(itemCount / 2);
  return HEADER_HEIGHT + BODY_PADDING_TOP + BODY_PADDING_BOTTOM + rows * MEMBER_HEIGHT + (rows - 1) * MEMBER_GAP;
}

const AVATAR_BOX_STYLE = ["flex:0 0 auto", "width:28px", "height:28px", "margin-left:8px", "border-radius:50%", "overflow:hidden"].join(
  ";",
);

function createMemberAvatarElement(member: OrgMemberUI): HTMLElement {
  const avatarSrc = resolveOrgMemberAvatarUrl(member);

  const avatar = document.createElement("div");
  avatar.className = avatarSrc ? styles.memberAvatarImg : styles.memberAvatar;
  avatar.style.cssText = AVATAR_BOX_STYLE;

  if (avatarSrc) {
    // X6 HTML 节点内 CSS Modules 可能不生效，用内联 background-image 保证展示
    avatar.style.backgroundImage = `url("${avatarSrc.replace(/"/g, "%22")}")`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center center";
    avatar.style.backgroundRepeat = "no-repeat";
    avatar.style.border = "1px solid #dfedff";
    avatar.style.backgroundColor = "#f5faff";
    avatar.setAttribute("role", "img");
    avatar.setAttribute("aria-label", member.userName || "成员头像");
    return avatar;
  }

  avatar.style.display = "flex";
  avatar.style.alignItems = "center";
  avatar.style.justifyContent = "center";
  avatar.style.color = "#ffffff";
  avatar.style.fontSize = "13px";
  avatar.style.fontWeight = "600";
  avatar.style.background = "#1677ff";
  avatar.textContent = memberInitial(member.userName);
  return avatar;
}

function createMemberElement(member: OrgMemberUI): HTMLDivElement {
  const item = document.createElement("div");
  item.className = styles.memberItem;

  const nameRow = document.createElement("div");
  nameRow.className = styles.memberNameRow;
  nameRow.appendChild(textEl(styles.memberName, member.userName || "--"));
  nameRow.appendChild(createMemberAvatarElement(member));

  item.appendChild(nameRow);
  item.appendChild(textEl(styles.memberMeta, `部门：${member.dept?.trim() || "--"}`));
  item.appendChild(textEl(styles.memberMeta, `电话：${member.phone?.trim() || "--"}`));
  return item;
}

function createMoreElement(totalCount: number): HTMLDivElement {
  const item = document.createElement("div");
  item.className = `${styles.memberItem} ${styles.memberItemMore}`;
  item.textContent = `等 ${totalCount} 人`;
  return item;
}

function createEmptyMemberElement(): HTMLDivElement {
  const item = document.createElement("div");
  item.className = `${styles.memberItem} ${styles.memberItemEmpty}`;
  item.textContent = "暂无人员";
  return item;
}

function createOrgCardElement(data: OrgGraphNodeData): HTMLDivElement {
  const card = document.createElement("div");
  card.className = styles.orgCard;

  const header = document.createElement("div");
  header.className = styles.cardHeader;
  header.appendChild(textEl(styles.cardTitle, data.node.name || "--"));

  const cardIcon = document.createElement("img");
  cardIcon.className = styles.cardIcon;
  cardIcon.src = ORG_CANVAS_HEADER_ICON;
  cardIcon.alt = "";
  header.appendChild(cardIcon);

  const body = document.createElement("div");
  const isSingleMember = data.visibleMembers.length === 1 && data.hiddenCount === 0;
  body.className = isSingleMember ? `${styles.cardBody} ${styles.cardBodySingle}` : styles.cardBody;

  if (data.visibleMembers.length === 0) {
    body.appendChild(createEmptyMemberElement());
  } else {
    data.visibleMembers.forEach((member) => {
      body.appendChild(createMemberElement(member));
    });
    if (data.hiddenCount > 0) {
      body.appendChild(createMoreElement(data.node.members.length));
    }
  }

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function registerOrgChartShapes(): void {
  if (registered) return;
  Shape.HTML.register({
    shape: NODE_SHAPE,
    width: CARD_WIDTH,
    height: HEADER_HEIGHT + BODY_PADDING_TOP + BODY_PADDING_BOTTOM + MEMBER_HEIGHT,
    effect: ["data"],
    html: (cell) => createOrgCardElement(cell.getData<OrgGraphNodeData>()),
    ports: {
      groups: {
        input: {
          position: { name: "absolute", args: { x: "50%", y: 0 } },
          markup: [{ tagName: "circle", selector: "portBody" }],
          attrs: {
            portBody: {
              r: 1,
              fill: "transparent",
              stroke: "transparent",
              magnet: false,
            },
          },
        },
        output: {
          position: { name: "absolute", args: { x: "50%", y: "100%" } },
          markup: [{ tagName: "circle", selector: "portBody" }],
          attrs: {
            portBody: {
              r: 1,
              fill: "transparent",
              stroke: "transparent",
              magnet: false,
            },
          },
        },
      },
      items: [
        { id: INPUT_PORT, group: "input" },
        { id: OUTPUT_PORT, group: "output" },
      ],
    },
  });
  Graph.registerEdge(
    EDGE_SHAPE,
    {
      inherit: "edge",
      connector: { name: "normal" },
      router: { name: "normal" },
      zIndex: 0,
      attrs: {
        line: {
          stroke: "#1677ff",
          strokeWidth: 2,
          targetMarker: null,
        },
      },
    },
    true,
  );
  registered = true;
}

function buildLayoutTree(node: OrgNodeUI, depth: number, path: string): LayoutNode {
  const children = node.children.map((child, index) => buildLayoutTree(child, depth + 1, `${path}-${index}`));
  const childrenWidth = children.reduce((sum, child) => sum + child.subtreeWidth, 0) + Math.max(0, children.length - 1) * SIBLING_GAP;
  return {
    graphId: `org-${node.id || path}`,
    node,
    depth,
    height: measureNodeHeight(node),
    subtreeWidth: Math.max(CARD_WIDTH, childrenWidth),
    x: 0,
    y: 0,
    children,
  };
}

function collectDepthHeights(layout: LayoutNode, heights: number[]): void {
  heights[layout.depth] = Math.max(heights[layout.depth] ?? 0, layout.height);
  layout.children.forEach((child) => collectDepthHeights(child, heights));
}

function assignRowPositions(layout: LayoutNode, left: number, rowY: number[]): void {
  layout.x = left + (layout.subtreeWidth - CARD_WIDTH) / 2;
  layout.y = rowY[layout.depth] ?? 0;

  if (layout.children.length === 0) return;

  const childrenWidth = layout.children.reduce((sum, child) => sum + child.subtreeWidth, 0) + (layout.children.length - 1) * SIBLING_GAP;
  let childLeft = left + (layout.subtreeWidth - childrenWidth) / 2;
  layout.children.forEach((child) => {
    assignRowPositions(child, childLeft, rowY);
    childLeft += child.subtreeWidth + SIBLING_GAP;
  });
}

function flattenLayout(layout: LayoutNode, nodes: LayoutNode[] = []): LayoutNode[] {
  nodes.push(layout);
  layout.children.forEach((child) => flattenLayout(child, nodes));
  return nodes;
}

function buildLayout(root: OrgNodeUI): LayoutNode {
  const layout = buildLayoutTree(root, 0, "0");
  const heights: number[] = [];
  collectDepthHeights(layout, heights);
  const rowY = heights.reduce<number[]>((rows, _height, index) => {
    rows[index] = index === 0 ? 0 : rows[index - 1] + heights[index - 1] + LEVEL_GAP;
    return rows;
  }, []);
  assignRowPositions(layout, 0, rowY);
  return layout;
}

function nodeCenterX(node: LayoutNode): number {
  return node.x + CARD_WIDTH / 2 + CANVAS_PADDING;
}

function addGraphCells(graph: Graph, root: OrgNodeUI): void {
  const layout = buildLayout(root);
  const nodes = flattenLayout(layout);
  const nodeMap = new Map(nodes.map((node) => [node.graphId, node]));

  graph.clearCells();
  graph.batchUpdate(() => {
    nodes.forEach((layoutNode) => {
      const visibleMembers = layoutNode.node.members.slice(0, MAX_MEMBERS).map((member) => ({
        ...member,
        avatarUrl: resolveOrgMemberAvatarUrl(member),
      }));
      graph.addNode({
        id: layoutNode.graphId,
        shape: NODE_SHAPE,
        x: layoutNode.x + CANVAS_PADDING,
        y: layoutNode.y + CANVAS_PADDING,
        width: CARD_WIDTH,
        height: layoutNode.height,
        zIndex: 2,
        data: {
          node: layoutNode.node,
          visibleMembers,
          hiddenCount: Math.max(0, layoutNode.node.members.length - visibleMembers.length),
        } satisfies OrgGraphNodeData,
      });
    });

    nodes.forEach((layoutNode) => {
      layoutNode.children.forEach((child) => {
        const parent = nodeMap.get(layoutNode.graphId);
        if (!parent) return;
        const sourceY = parent.y + parent.height + CANVAS_PADDING;
        const targetY = child.y + CANVAS_PADDING;
        const branchY = Math.round(sourceY + Math.max(26, (targetY - sourceY) / 2));

        graph.addEdge({
          shape: EDGE_SHAPE,
          source: { cell: parent.graphId, port: OUTPUT_PORT },
          target: { cell: child.graphId, port: INPUT_PORT },
          vertices: [
            { x: nodeCenterX(parent), y: branchY },
            { x: nodeCenterX(child), y: branchY },
          ],
        });
      });
    });
  });
}

export const OrgArchitectureCanvas = defineComponent({
  props: {
    root: {
      type: Object as PropType<OrgNodeUI>,
      required: true,
    },
  },
  setup(props) {
    const canvasRef = ref<HTMLDivElement | null>(null);
    const graphRef = shallowRef<Graph | null>(null);
    const resizeObserverRef = shallowRef<ResizeObserver | null>(null);
    const chartKey = computed(() => JSON.stringify(props.root));

    const fitGraph = (): void => {
      const graph = graphRef.value;
      const container = canvasRef.value;
      if (!graph || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      graph.resize(width, height);
      if (graph.getCells().length === 0) return;
      graph.zoomToFit({
        padding: {
          top: 54,
          right: 48,
          bottom: 54,
          left: 48,
        },
        maxScale: 1,
        minScale: 0.2,
        useCellGeometry: true,
      });
      graph.centerContent({ useCellGeometry: true });
    };

    const renderGraph = async (): Promise<void> => {
      await nextTick();
      const graph = graphRef.value;
      if (!graph) return;
      addGraphCells(graph, props.root);
      requestAnimationFrame(fitGraph);
    };

    const mountGraph = async (): Promise<void> => {
      if (!canvasRef.value || graphRef.value) return;
      registerOrgChartShapes();
      await nextTick();
      const graph = new Graph({
        container: canvasRef.value,
        async: false,
        autoResize: false,
        background: { color: "#edf4fb" },
        grid: false,
        connecting: {
          anchor: "center",
          connectionPoint: { name: "anchor" },
        },
        interacting: {
          nodeMovable: false,
          edgeMovable: false,
          arrowheadMovable: false,
          vertexMovable: false,
          vertexAddable: false,
          vertexDeletable: false,
          magnetConnectable: false,
        },
        panning: {
          enabled: true,
          modifiers: null,
          eventTypes: ["leftMouseDown", "rightMouseDown", "mouseWheelDown"],
        },
        mousewheel: {
          enabled: true,
          modifiers: ["ctrl", "meta"],
          factor: 1.1,
          minScale: 0.2,
          maxScale: 1.6,
          zoomAtMousePosition: true,
        },
      });

      graphRef.value = graph;
      const observer = new ResizeObserver(() => {
        requestAnimationFrame(fitGraph);
      });
      observer.observe(canvasRef.value);
      resizeObserverRef.value = observer;
      await renderGraph();
    };

    onMounted(() => {
      void mountGraph();
    });

    watch(chartKey, () => {
      void renderGraph();
    });

    onBeforeUnmount(() => {
      resizeObserverRef.value?.disconnect();
      resizeObserverRef.value = null;
      graphRef.value?.dispose();
      graphRef.value = null;
    });

    return (): JSX.Element => (
      <div class={styles.canvasShell}>
        <div ref={canvasRef} class={styles.canvas} />
      </div>
    );
  },
});
