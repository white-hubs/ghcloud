import { defineComponent } from "vue";

/** Temporary parseable stub — original vue→tsx conversion was broken. */
export const ChatAssistant = defineComponent({
  name: "ChatAssistant",
  setup(_props, { slots }) {
    return (): JSX.Element => <div class="ChatAssistant-stub">{slots.default?.()}</div>;
  },
});

export default ChatAssistant;
