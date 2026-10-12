import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Popover, Select, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AlarmService, type AlarmLevels, type AlarmRuleListItem, type AlarmRuleListQuery } from "@ghcloud/cube-service";

const PAGE_SIZE = 10;
const LINE_LOSS_MANAGEMENT = "LINE_LOSS_MANAGEMENT";
const TIME_UNIT_LABEL: Record<string, string> = {
  MONTH: "月",
  DAY: "天",
  HOUR: "小时",
  MINUTE: "分钟",
  SECOND: "秒",
};

interface SearchForm {
  keyword?: string | undefined;
  alarmLevelId?: string | undefined;
}

interface DisableForm {
  disableDuration?: number | null;
}

interface ListPagination {
  current: number;
  pageSize: number;
  total: number;
}

function syncUrlParams(values: SearchForm, pageNumber: number, pageSize: number): void {
  const url = new URL(location.href);
  if (values.keyword) {
    url.searchParams.set("keyword", values.keyword);
  } else {
    url.searchParams.delete("keyword");
  }
  if (values.alarmLevelId) {
    url.searchParams.set("alarmLevelId", values.alarmLevelId);
  } else {
    url.searchParams.delete("alarmLevelId");
  }
  url.searchParams.set("pageNumber", `${pageNumber}`);
  url.searchParams.set("pageSize", `${pageSize}`);
  history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function getCurrentApplicationCode(): string {
  const currentApplication = sessionStorage.getItem("GH-currentApplication");
  if (!currentApplication) {
    return "";
  }
  return (JSON.parse(currentApplication) as { code?: string }).code ?? "";
}

function getInitialSearchForm(): SearchForm {
  const params = new URLSearchParams(location.search);
  return {
    keyword: params.get("keyword") || undefined,
    alarmLevelId: params.get("alarmLevelId") || undefined,
  };
}

function getInitialPagination(): ListPagination {
  const params = new URLSearchParams(location.search);
  const pageNumber = Number(params.get("pageNumber"));
  const pageSize = Number(params.get("pageSize"));
  return {
    current: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : PAGE_SIZE,
    total: 0,
  };
}

export const AlarmConfigList: React.FC = () => {
  const [form] = Form.useForm<SearchForm>();
  const [disableForm] = Form.useForm<DisableForm>();
  const initialSearchForm = useMemo(() => getInitialSearchForm(), []);
  const initialPagination = useMemo(() => getInitialPagination(), []);
  const [dataSource, setDataSource] = useState<AlarmRuleListItem[]>([]);
  const [alarmLevels, setAlarmLevels] = useState<AlarmLevels[]>([]);
  const [loading, setLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableRecord, setDisableRecord] = useState<AlarmRuleListItem | null>(null);
  const [pagination, setPagination] = useState<ListPagination>(initialPagination);
  const applicationCode = getCurrentApplicationCode();
  const isLineLossManagement = applicationCode === LINE_LOSS_MANAGEMENT;

  const getList = useCallback(
    async (pageNumber: number, pageSize: number): Promise<void> => {
      const values = form.getFieldsValue();
      const query: AlarmRuleListQuery = {
        pageNumber,
        pageSize,
        applicationCode,
      };
      if (values.keyword) {
        query.keyword = values.keyword;
      }
      if (values.alarmLevelId) {
        query.alarmLevelId = values.alarmLevelId;
      }

      try {
        setLoading(true);
        const result = isLineLossManagement ? await AlarmService.getAlarmLineRuleList(query) : await AlarmService.getAlarmRuleList(query);
        setDataSource(result.records ?? []);
        setPagination({
          current: pageNumber,
          pageSize,
          total: result.total ?? 0,
        });
        syncUrlParams(values, pageNumber, pageSize);
      } finally {
        setLoading(false);
      }
    },
    [applicationCode, form, isLineLossManagement],
  );

  const showRequestError = useCallback((): void => {
    message.error("操作失败");
  }, []);

  useEffect(() => {
    async function getAlarmLevels(): Promise<void> {
      const levels = await AlarmService.getAlarmLevels();
      setAlarmLevels(levels);
    }

    form.setFieldsValue(initialSearchForm);
    getList(initialPagination.current, initialPagination.pageSize).catch(showRequestError);
    getAlarmLevels().catch(showRequestError);
  }, [form, getList, initialPagination.current, initialPagination.pageSize, initialSearchForm, showRequestError]);

  const pushDetail = useCallback(
    (target: string): void => {
      const url = new URL(target, location.origin);
      const values = form.getFieldsValue();
      const returnUrl = new URL(location.pathname, location.origin);
      if (values.keyword) {
        returnUrl.searchParams.set("keyword", values.keyword);
      }
      if (values.alarmLevelId) {
        returnUrl.searchParams.set("alarmLevelId", values.alarmLevelId);
      }
      returnUrl.searchParams.set("pageNumber", `${pagination.current}`);
      returnUrl.searchParams.set("pageSize", `${pagination.pageSize}`);
      url.searchParams.set("returnUrl", `${returnUrl.pathname}${returnUrl.search}`);
      history.pushState({ current: location.pathname + location.search }, "", `${url.pathname}${url.search}`);
    },
    [form, pagination.current, pagination.pageSize],
  );

  const toAdd = useCallback((): void => {
    pushDetail("/portal/iot-center/alarm?type=add");
  }, [pushDetail]);

  const toDetail = useCallback(
    (record: AlarmRuleListItem): void => {
      pushDetail(`/portal/iot-center/alarm?type=detail&id=${record.id}`);
    },
    [pushDetail],
  );

  const toEdit = useCallback(
    (record: AlarmRuleListItem): void => {
      pushDetail(`/portal/iot-center/alarm?type=edit&id=${record.id}`);
    },
    [pushDetail],
  );

  const toCopy = useCallback(
    (record: AlarmRuleListItem): void => {
      pushDetail(`/portal/iot-center/alarm?type=edit&id=${record.id}&copy=1`);
    },
    [pushDetail],
  );

  const closeDisableModal = useCallback((): void => {
    disableForm.resetFields();
    setDisableRecord(null);
  }, [disableForm]);

  const changeEnabled = useCallback(
    async (record: AlarmRuleListItem): Promise<void> => {
      if (record.enabled) {
        if (isLineLossManagement) {
          await AlarmService.enableAlarmLineRule({
            id: record.id,
            enabled: false,
          });
          message.success("操作成功！");
          await getList(pagination.current, pagination.pageSize);
          return;
        }
        setDisableRecord(record);
        return;
      }

      if (isLineLossManagement) {
        await AlarmService.enableAlarmLineRule({
          id: record.id,
          enabled: true,
        });
      } else {
        await AlarmService.enableAlarmRule({
          id: record.id,
          enabled: true,
        });
      }
      message.success("操作成功！");
      await getList(pagination.current, pagination.pageSize);
    },
    [getList, isLineLossManagement, pagination.current, pagination.pageSize],
  );

  const deleteRecord = useCallback(
    async (record: AlarmRuleListItem): Promise<void> => {
      if (isLineLossManagement) {
        await AlarmService.deleteAlarmLineRule(record.id);
      } else {
        await AlarmService.deleteAlarmRule(record.id);
      }
      message.success("操作成功");
      await getList(pagination.current, pagination.pageSize);
    },
    [getList, isLineLossManagement, pagination.current, pagination.pageSize],
  );

  const columns: ColumnsType<AlarmRuleListItem> = useMemo(() => {
    const result: ColumnsType<AlarmRuleListItem> = [
      {
        dataIndex: "name",
        title: "预警规则名称",
        width: 160,
        fixed: "left",
        ellipsis: true,
        render: (text?: string) => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        dataIndex: "alarmLevelName",
        title: "报警级别",
        align: "center",
        width: 100,
      },
    ];

    if (!isLineLossManagement) {
      result.push({
        dataIndex: "repeatTime",
        title: "去重周期",
        width: 120,
        align: "center",
        render: (_text, record) => `${record.repeatTime ?? 0}${TIME_UNIT_LABEL[record.repeatTimeUnit ?? ""] ?? ""}`,
      });
    }

    result.push(
      {
        dataIndex: "estimatedHandlerTime",
        title: "处理时限",
        width: 120,
        align: "center",
        render: (_text, record) => `${record.estimatedHandlerTime ?? 0}${TIME_UNIT_LABEL[record.estimatedHandlerUnit ?? ""] ?? ""}`,
      },
      {
        dataIndex: "enabled",
        title: "状态",
        width: 100,
        align: "center",
        render: (_text, record) => (record.enabled ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>),
      },
    );

    if (!isLineLossManagement) {
      result.push({
        dataIndex: "disableDuration",
        title: "禁用时长",
        width: 120,
        align: "center",
        render: (_text, record) => {
          const textVal = record.disableDuration ? `${record.disableDuration} 小时` : "";
          return <Popover content={textVal || "--"}>{textVal || "--"}</Popover>;
        },
      });
    }

    result.push(
      {
        dataIndex: "remark",
        title: "说明",
        width: 180,
        ellipsis: true,
        align: "center",
        render: (text?: string) => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        dataIndex: "action",
        title: "操作",
        width: isLineLossManagement ? 180 : 240,
        fixed: "right",
        render: (_text, record) => (
          <Space size={0}>
            <Button type="link" onClick={() => toDetail(record)}>
              详情
            </Button>
            <Button type="link" onClick={() => toEdit(record)}>
              编辑
            </Button>
            {!isLineLossManagement && (
              <Button type="link" onClick={() => toCopy(record)}>
                复制
              </Button>
            )}
            <Button type="link" onClick={() => changeEnabled(record)}>
              {record.enabled ? "禁用规则" : "启用规则"}
            </Button>
            <Popconfirm title="删除当前数据？" okText="确定" cancelText="取消" onConfirm={() => deleteRecord(record)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    );

    return result;
  }, [getList, isLineLossManagement, pagination.current, pagination.pageSize]);

  const handleSearch = (): void => {
    getList(1, pagination.pageSize).catch(showRequestError);
  };

  const handleReset = (): void => {
    form.setFieldsValue({
      keyword: undefined,
      alarmLevelId: undefined,
    });
    getList(1, pagination.pageSize).catch(showRequestError);
  };

  const handleTableChange = (tablePagination: TablePaginationConfig): void => {
    getList(tablePagination.current ?? 1, tablePagination.pageSize ?? PAGE_SIZE).catch(showRequestError);
  };

  const handleDisableOk = async (): Promise<void> => {
    if (!disableRecord) {
      return;
    }
    const values = await disableForm.validateFields();
    try {
      setDisableLoading(true);
      await AlarmService.enableAlarmRule({
        id: disableRecord.id,
        enabled: false,
        disableDuration: values.disableDuration ?? null,
      });
      message.success("操作成功！");
      closeDisableModal();
      await getList(pagination.current, pagination.pageSize);
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div className="alarm-config-list-page">
      <div className="alarm-config-list-header">
        <span className="alarm-config-list-title">报警配置</span>
        <Button type="primary" onClick={toAdd}>
          新增
        </Button>
      </div>
      <Form form={form} layout="inline" className="alarm-config-list-search" initialValues={initialSearchForm}>
        <Form.Item name="keyword">
          <Input allowClear placeholder="请输入规则名称" />
        </Form.Item>
        <Form.Item label="报警级别" name="alarmLevelId">
          <Select
            allowClear
            placeholder="请选择报警级别"
            style={{ width: 180 }}
            options={alarmLevels.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table<AlarmRuleListItem>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: isLineLossManagement ? 1000 : 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
      <Modal
        title="禁用规则"
        open={Boolean(disableRecord)}
        confirmLoading={disableLoading}
        width={680}
        onOk={handleDisableOk}
        onCancel={closeDisableModal}
      >
        <Form form={disableForm} labelCol={{ span: 5 }}>
          <Form.Item label="禁用时长" name="disableDuration">
            <InputNumber
              min={0}
              max={999}
              precision={0}
              placeholder="请输入禁用时长（若未设置禁用时长，将默认永久禁用）"
              style={{ width: 380 }}
            />
            <span style={{ marginLeft: 8 }}>小时</span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
