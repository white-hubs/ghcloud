import { DeleteOutlined, EditOutlined } from "@ant-design/icons-vue";
import type { ElementDef } from "@cube-scada/core";
import { Dropdown, Menu } from "ant-design-vue";
import { defineComponent, type PropType } from "vue";

export const ElementCardGrid = defineComponent({
  name: "ElementCardGrid",
  props: {
    elements: { type: Array as PropType<ElementDef[]>, required: true },
  },
  emits: ["deleteImage", "editImage"],
  setup(props, { emit }) {
    function onDragStart(event: DragEvent, elementType: string): void {
      event.dataTransfer?.setData("application/scada-element-type", elementType);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
    }

    function renderCard(def: ElementDef) {
      const card = (
        <div
          key={def.type}
          draggable
          onDragstart={(event: DragEvent) => onDragStart(event, def.type)}
          style={{
            minWidth: 0,
            textAlign: "center",
            cursor: "grab",
            padding: "8px 4px 6px",
            borderRadius: "6px",
            border: "1px solid #f0f0f0",
            background: def.assetKind === "image" ? "#f6f8fb" : "#fafafa",
            fontSize: "11px",
            transition: "background 0.15s, border-color 0.15s",
            userSelect: "none",
          }}
          title={def.assetKind === "image" ? `${def.label}（右键编辑）` : def.label}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 6px",
              overflow: "hidden",
              borderRadius: def.assetKind === "image" ? "4px" : "0",
              background: def.assetKind === "image" ? "#fff" : "transparent",
            }}
            innerHTML={def.svgBody}
          />
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#555",
              fontSize: "11px",
              lineHeight: "1.3",
            }}
          >
            {def.label}
          </div>
        </div>
      );

      if (def.assetKind !== "image") return card;
      return (
        <Dropdown
          key={def.type}
          trigger={["contextmenu"]}
          overlay={
            <Menu
              items={[
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "修改名称与分组",
                  onClick: () => emit("editImage", def),
                },
                {
                  key: "delete",
                  danger: true,
                  icon: <DeleteOutlined />,
                  label: "删除图片",
                  onClick: () => emit("deleteImage", def),
                },
              ]}
            />
          }
        >
          {card}
        </Dropdown>
      );
    }

    return () => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "8px",
          padding: "4px 0",
        }}
      >
        {props.elements.map(renderCard)}
      </div>
    );
  },
});
