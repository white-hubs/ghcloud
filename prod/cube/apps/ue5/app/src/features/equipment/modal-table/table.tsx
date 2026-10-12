import { defineComponent } from "vue";

export const Table = defineComponent({
  name: "Table",
  setup() {
    return (): JSX.Element => <a-table />;
  },
});

export default Table;
