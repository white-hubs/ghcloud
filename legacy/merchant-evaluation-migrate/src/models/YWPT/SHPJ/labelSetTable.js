export default () => [
  {
    uid: 'tag',
    dataIndex: 'tag',
    title: '评价标签',
    width: '250px',
  },
  {
    uid: 'evaluation',
    dataIndex: 'evaluation',
    title: '所属维度',
    width: '200px',
    render(h, v) {
      switch (v) {
        case '1':
          return '商品质量';
        case '2':
          return '诚实守信';
        case '3':
          return '环境卫生';
        case '4':
          return '服务态度';
      }
    },
  },
  {
    uid: 'category',
    dataIndex: 'category',
    title: '评价分类',
    width: '200px',
    render(h, v) {
      return <app-new-dict-display value={v} code={'project-merchant-evaluate_level'} />;
    },
  },
];
