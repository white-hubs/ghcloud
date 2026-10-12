import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const NotificationBox = defineComponent({
  name: "NotificationBox",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="NotificationBox-stub">{slots.default?.()}</div>;
  },
});

export default NotificationBox;
