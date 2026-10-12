/**
 * code	string	 编码	
name	string	 名称	
description
 */
export default () => [
  {
    uid: 'code',
    dataIndex: 'code',
    title: '编码',
    width: '200px',
    sorter: true,
  },
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'ticket',
    dataIndex: 'ticketId',
    title: '工单模板',
    width: '200px',
    render(h, v, r) {
      return r.ticketName;
    },
  },
  {
    uid: 'description',
    dataIndex: 'description',
    title: '描述',
    width: '200px',
  },
  {
    uid: 'sort',
    dataIndex: 'sort',
    title: '排序',
    width: '200px',
  },
];
