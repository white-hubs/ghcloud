import { defineComponent } from "vue";

export const CockpitPanel = defineComponent({
  name: "CockpitPanel",
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    bodyClass: { type: String, default: "" },
    grow: { type: Boolean, default: false },
  },
  setup: (props, { slots }) => {
    return (): JSX.Element => (
      <section class={["cockpit-panel", props.grow && "cockpit-panel--grow"]}>
        <header class="cockpit-panel__header">
          <h2 class="cockpit-panel__title">{props.title}</h2>
          {props.subtitle ? <span class="cockpit-panel__subtitle">{props.subtitle}</span> : null}
        </header>
        <div class={["cockpit-panel__body", props.bodyClass]}>{slots.default?.()}</div>
      </section>
    );
  },
});
