export default () => [
  {
    uid: 'ttl',
    dataIndex: 'ttl',
    title: 'TTL(秒)',
    width: '200px',
  },
  {
    uid: 'token',
    dataIndex: 'token',
    title: 'Token',
    width: '200px',
    render(h, v) {
      const str1 = v.substr(0, 5);
      const str2 = v.substr(-5);
      return `${str1} ...... ...... ${str2}`;
    },
  },
];
