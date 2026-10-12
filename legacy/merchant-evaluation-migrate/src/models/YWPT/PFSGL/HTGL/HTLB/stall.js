export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '档位名称',
    width: '200px',
  },
  {
    uid: 'area',
    dataIndex: 'area',
    title: '所属区域',
    width: '200px',
    render(h, v) {
      return (
        <div class="ellipsis" style="width: 100px;">
          <a-tooltip title={v}>{v?.length ? v.join('/') : '--'}</a-tooltip>
        </div>
      );
    },
  },
  {
    uid: 'companyName',
    dataIndex: 'companyName',
    title: '所属商户',
    width: '200px',
  },
];
