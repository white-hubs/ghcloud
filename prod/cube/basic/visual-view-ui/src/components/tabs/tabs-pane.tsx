import { defineComponent } from "vue";
import { NTabPane as ATabPane, type TabPaneProps } from "naive-ui";
// todo 暂时无法处理不渲染本组件的问题  先不进行包装
export const TabPane = ATabPane;
// type PaneName = string | number;
// export const TabPane = defineComponent({
//   props: ["tab", "name"],
//   setup(props: TabPaneProps, { slots }) {
//     return () => {
//       return (
//         <ATabPane {...props} name={props.name as PaneName} tab={props.tab}>
//           {slots}
//         </ATabPane>
//       );
//     };
//   }
// });
