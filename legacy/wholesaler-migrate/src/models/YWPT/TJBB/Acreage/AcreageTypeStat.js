export default () => [
  {
    uid: 'name',
    dataIndex: 'acreageName',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'buildingAreaTotal',
    dataIndex: 'buildingAreaTotal',
    title: '楼栋区域面积总和(m²)',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
  {
    uid: 'outdoorAreaTotal',
    dataIndex: 'outdoorAreaTotal',
    title: '室外区域面积总和(m²)',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v == null ? '--' : v;
    },
  },
];
