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
        uid: 'approachReason',
        dataIndex: 'approachReason',
        title: '进场说明',
    },
    {
        uid: 'registerTime',
        dataIndex: 'registerTime',
        title: '登记时间',
    },
    {
        uid: 'validStage',
        dataIndex: 'validStage',
        title: '有效期',
        render:(v,h,recode) =>{
            return h+'天';
        }
    },
    {
        uid: 'effectiveness',
        dataIndex: 'effectiveness',
        title: '有效性',
        render: (v, h, recode) => {
            return h?'有效':'无效';
        },
    },
    {
        uid: 'approachNum',
        dataIndex: 'approachNum',
        title: '进场次数',
        width: '200px',
    },
    {
        uid: 'latelyEntryTime',
        dataIndex: 'latelyEntryTime',
        title: '最近进场时间',
    },
    {
        uid: 'state',
        dataIndex: 'state',
        title: '状态',
        width: '200px',
        render: (v, h, recode) => {
            return h==0?'未通过':h==1?'通过':h==2?'待审核':'--';
        },
    },
];
  