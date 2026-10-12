export default () => [
  {
    uid: 'type',
    dataIndex: 'label',
    title: '类型',
    width: '100px',
  },
  {
    uid: 'a',
    dataIndex: 'a',
    title: '电流',
    width: '100px',
    render(h, v) {
      return !v ? '-' : v.value + v.unitCN;
    },
  },
  {
    uid: 'v',
    dataIndex: 'v',
    title: '电压',
    width: '100px',
    render(h, v) {
      return !v ? '-' : v.value + v.unitCN;
    },
  },
  {
    uid: 't',
    dataIndex: 't',
    title: '温度',
    width: '100px',
    render(h, v) {
      return !v ? '-' : v.value + v.unitCN;
    },
  },
  {
    uid: 'l',
    dataIndex: 'l',
    title: '功率',
    width: '100px',
    render(h, v) {
      return !v ? '-' : v.value + v.unitCN;
    },
  },
  {
    uid: 'ldl',
    dataIndex: 'ldl',
    title: '漏电流',
    width: '100px',
    render(h, v) {
      return !v ? '-' : v.value + v.unitCN;
    },
  },
];
