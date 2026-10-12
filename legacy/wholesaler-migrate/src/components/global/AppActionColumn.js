export default {
  name: 'AppToolColumn',
  functional: true,
  render: function (h, context) {
    const vnodes = context.slots().default.filter((a) => a.context); // 过滤出有权限的按钮
    const outSideVNodes = vnodes.slice(0, context.props.max || 2);
    const moreVNodes = vnodes.slice(context.props.max || 2); // 显示在更多下拉中的按钮

    const renderVNodes = [...outSideVNodes];
    if (moreVNodes.length === 1) {
      renderVNodes.push(...moreVNodes);
    }
    if (moreVNodes.length > 1) {
      renderVNodes.push(
        <a-dropdown>
          <app-link-btn size="small" type="link">
            更多
            <a-icon type="down" />
          </app-link-btn>
          <a-menu slot="overlay">
            {moreVNodes.map((vNode) => {
              return <a-menu-item>{vNode}</a-menu-item>;
            })}
          </a-menu>
          ;
        </a-dropdown>,
      );
    }

    const renderVNodesWithDividers = [];

    renderVNodes.forEach((item, index) => {
      renderVNodesWithDividers.push(item);
      if (index % 1 === 0 && index < renderVNodes.length - 1) {
        renderVNodesWithDividers.push(<a-divider type="vertical" />);
      }
    });

    return renderVNodesWithDividers;
  },
};
