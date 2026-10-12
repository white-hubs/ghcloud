export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '姓名',
    width: '130px',
  },
  {
    uid: 'idCard',
    dataIndex: 'idCard',
    title: '身份证号',
    width: '200px',
  },
  {
    uid: 'tel',
    dataIndex: 'tel',
    title: '手机号码',
    width: '200px',
  },
  {
    uid: 'identity',
    dataIndex: 'identity',
    title: '身份',
    width: '200px',
  },
  {
    uid: 'dept',
    dataIndex: 'dept',
    title: '部门',
    width: '200px',
    render: (v, h, recode) => {
      return h || '--';
    },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '添加时间',
    //     width: '200px',
  },
  {
    uid:'seat',
    dataIndex:'seat',
    title:'席位号',
    render:(v,h,recode) =>{
      return recode.seat?recode.seat:'--'
    }
  },
  {
    uid: 'detectState',
    dataIndex: 'detectState',
    title: '当天核酸检测状态',
    width: '200px',
  },
  {
    uid: 'detectTime',
    dataIndex: 'detectTime',
    title: '最近核酸监测时间',
    width: '200px',
    render: (v, h, recode) => {
      if (recode.detectState != '未检测') {
        return recode.detectTime;
      } else {
        return '--';
      }
    },
  },
];
