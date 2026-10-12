/**
 *  @ApiModelProperty("ID")
    private String id;

    @ApiModelProperty("名称")
    private String name;

    @ApiModelProperty(value = "所属区域")
    private List<String> areaNames;

    @ApiModelProperty("类型ID")
    private String typeId;

    @ApiModelProperty("类型编号")
    private String typeCode;

    @ApiModelProperty("类型名称")
    private String typeName;

    @ApiModelProperty("更换配件次数")
    private int replaceTimes;

    @ApiModelProperty("更换配件类型次数")
    private long replaceTypeTimes;

    @ApiModelProperty("数量")
    private int amount;

    @ApiModelProperty("总价")
    private BigDecimal totalPrice;
 */

export default () => [
  {
    uid: 'name',
    dataIndex: 'name',
    title: '名称',
    width: '200px',
  },
  {
    uid: 'areaNames',
    dataIndex: 'areaNames',
    title: '所属区域',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v ? v.join('/') : '--';
    },
  },
  {
    uid: 'typeName',
    dataIndex: 'typeName',
    title: '类型',
    width: '200px',
    // sorter: true,
    render(h, v) {
      return v || '--';
    },
  },
  {
    uid: 'replaceTimes',
    dataIndex: 'replaceTimes',
    title: '更换配件次数',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v + '次';
    },
  },
  {
    uid: 'replaceTypeTimes',
    dataIndex: 'replaceTypeTimes',
    title: '更换配件类型次数',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v + '次';
    },
  },
  {
    uid: 'amount',
    dataIndex: 'amount',
    title: '数量',
    width: '200px',
    align: 'center',
  },
  {
    uid: 'totalPrice',
    dataIndex: 'totalPrice',
    title: '总价',
    width: '200px',
    align: 'center',
    render(h, v) {
      return v + '元';
    },
  },
];
