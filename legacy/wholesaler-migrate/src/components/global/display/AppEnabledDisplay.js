export default {
  functional: true,
  render(h, { props }) {
    if (props.enabled) {
      return <a-tag color="#87d068">{props.trueLabel || '启用'}</a-tag>;
    }
    return <a-tag color="#F50">{props.falseLabel || '禁用'}</a-tag>;
  },
};
