export default {
  functional: true,
  render(h, context) {
    return context.props.render && context.props.render(h, context);
  },
};
