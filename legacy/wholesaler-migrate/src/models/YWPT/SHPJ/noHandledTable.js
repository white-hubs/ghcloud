export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '记录编号',
    width: '250px',
    scopedSlots: { customRender: 'code' },
  },
  {
    uid: 'createTime',
    dataIndex: 'createTime',
    title: '评价时间',
    width: '200px',
  },
  {
    uid: 'nickname',
    dataIndex: 'nickname',
    title: '评价人',
    width: '200px',
  },
  {
    uid: 'descr',
    dataIndex: 'descr',
    title: '评级内容',
    width: '200px',
  },
  {
    uid: 'fileDTOS',
    dataIndex: 'fileDTOS',
    title: '图片',
    width: '200px',
    scopedSlots: { customRender: 'showPic' },
    // render:(h,v,r)=>{
    //     if(v.length>0){
    //       // return (<app-imgs-display files={r.fileDTOS} />)
    //     }else{
    //       return '--'
    //     }
    // }
  },
  {
    uid: 'username',
    dataIndex: 'username',
    title: '处理人',
    width: '200px',
  },
  {
    uid: 'examineStatus',
    dataIndex: 'examineStatus',
    title: '处理结果',
    width: '200px',
    render: (h, v) => {
      return v == '1' ? '已通过' : '未通过';
    },
  },
  {
    uid: 'examineTime',
    dataIndex: 'examineTime',
    title: '处理时间',
    width: '200px',
  },
];
