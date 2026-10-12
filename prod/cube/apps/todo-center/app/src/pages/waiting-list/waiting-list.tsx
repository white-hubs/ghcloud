import { Button, DatePicker, Form, Input, Pagination, Popover, Table } from "antd";
import datePickerZhCN from "antd/es/date-picker/locale/zh_CN";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useImmer } from "use-immer";

import type { TaskRecord } from "@ghcloud/cube-todo-center-service";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeTodoTaskStatService } from "@/api/server";
import { TodoTaskTypeSelect } from "@/components/business/todo-task-type-select/todo-task-type-select";
import { Layout } from "@/components/layout/layout";
import { Slot } from "@/components/slot/slot";
import useListOperate from "@/hooks/use-list-operate";
import useTableScroll from "@/hooks/use-table-scroll";

/** 待办列表 */
export const WaitingList = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pageTitle } = usePageName();

  const parsePeriod = (raw: string | null): Dayjs[] => {
    if (!raw) return [];
    return raw
      .split(",")
      .filter(Boolean)
      .map((d) => dayjs(d));
  };

  const { scrollY, calcTableScroll, showSwitchBtn, formExpend, setFormExpend } = useTableScroll();
  const { buttonText, operate } = useListOperate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<TaskRecord[]>([]);
  const [formState, setFormState] = useImmer<{
    keyword: string;
    period: Dayjs[];
    todoTagCode: string | undefined;
  }>({
    keyword: searchParams.get("keyword") || "",
    period: parsePeriod(searchParams.get("period")),
    todoTagCode: searchParams.get("todoTagCode") || searchParams.get("businessType") || undefined,
  });

  const [page, setPage] = useImmer({
    pageNumber: Number(searchParams.get("pageNumber") || 1),
    pageSize: Number(searchParams.get("pageSize") || 10),
    total: 0,
  });

  const buildSearchParams = (form: typeof formState, pageState: typeof page): URLSearchParams => {
    const next = new URLSearchParams();
    if (form.keyword) next.set("keyword", form.keyword);
    if (form.todoTagCode) next.set("todoTagCode", form.todoTagCode);
    if (form.period.length) {
      next.set("period", form.period.map((d) => d.format("YYYY-MM-DD")).join(","));
    }
    if (pageState.pageNumber !== 1) next.set("pageNumber", String(pageState.pageNumber));
    if (pageState.pageSize !== 10) next.set("pageSize", String(pageState.pageSize));
    return next;
  };

  const writeCache = (pageOverride?: Partial<typeof page>): void => {
    setSearchParams(buildSearchParams(formState, { ...page, ...pageOverride }));
  };

  const columns = [
    {
      title: "任务时间",
      dataIndex: "taskTime",
      width: showSwitchBtn ? "180px" : undefined,
      render: (text: number): JSX.Element => {
        const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
        return <Popover content={time}>{time}</Popover>;
      },
    },
    {
      title: "任务名称",
      dataIndex: "taskName",
      render: (text: string): JSX.Element => {
        return <Popover content={text}>{text}</Popover>;
      },
    },
    {
      title: "类型",
      width: showSwitchBtn ? "100px" : undefined,
      dataIndex: "businessTypeName",
      render: (text: string): JSX.Element => {
        return <Popover content={text || "--"}>{text || "--"}</Popover>;
      },
    },
    {
      title: "任务状态",
      width: showSwitchBtn ? "100px" : undefined,
      dataIndex: "businessStatusName",
      render: (text: string): JSX.Element => {
        return <Popover content={text || "--"}>{text || "--"}</Popover>;
      },
    },
    {
      title: "操作",
      render: (record: TaskRecord): JSX.Element => {
        return (
          <Button
            type="link"
            style={{ paddingLeft: "0px" }}
            onClick={() => {
              operate(record, "waiting");
            }}
          >
            {buttonText(record)}
          </Button>
        );
      },
    },
  ];

  const getTableData = async (searchParams?: {
    pageNumber?: number;
    pageSize?: number;
    keyword?: string;
    period?: [];
    todoTagCode?: undefined;
  }): Promise<void> => {
    if (loading) {
      return;
    }
    setLoading(true);
    const params = {
      pageNumber: searchParams?.pageNumber ?? page.pageNumber,
      pageSize: searchParams?.pageSize ?? page.pageSize,
      todoTagCode: formState.todoTagCode ?? undefined,
      keyword: formState.keyword ? formState.keyword : undefined,
      period: formState.period ? formState.period.map((e) => e.format("YYYY-MM-DD")).join(",") : undefined,
    };
    if (searchParams && Object.prototype.hasOwnProperty.call(searchParams, "todoTagCode")) {
      params.todoTagCode = undefined;
      setFormState((draft) => {
        draft.todoTagCode = undefined;
      });
    }
    if (searchParams && Object.prototype.hasOwnProperty.call(searchParams, "period")) {
      params.period = undefined;
      setFormState((draft) => {
        draft.period = [];
      });
    }
    if (searchParams && Object.prototype.hasOwnProperty.call(searchParams, "keyword")) {
      params.keyword = searchParams.keyword;
      setFormState((draft) => {
        draft.keyword = searchParams.keyword as unknown as string;
      });
    }
    const res = await cubeTodoTaskStatService.getTodoTaskPage(params);
    setPage((draft) => {
      draft.total = res.total;
      draft.pageNumber = params.pageNumber;
      draft.pageSize = params.pageSize;
    });
    setDataSource(res.records);
    setLoading(false);
    calcTableScroll();
  };

  const queryForm = (): void => {
    setPage((draft) => {
      draft.pageNumber = 1;
    });
    getTableData({ pageNumber: 1 });
    writeCache({ pageNumber: 1 });
  };

  const reset = (): void => {
    setLoading(false);
    setFormState((draft) => {
      draft.keyword = "";
      draft.period = [];
      draft.todoTagCode = undefined;
    });
    setPage((draft) => {
      draft.pageNumber = 1;
      draft.pageSize = 10;
    });
    getTableData({
      pageNumber: 1,
      todoTagCode: undefined,
      keyword: "",
      period: [],
    });
    setSearchParams(new URLSearchParams());
  };
  let timer: string | number | NodeJS.Timeout | null | undefined = null;

  useEffect(() => {
    getTableData();
    timer = setInterval(() => {
      getTableData();
    }, 30000);

    return (): void => {
      timer && clearInterval(timer);
    };
  }, []);

  return (
    <Layout title={pageTitle ?? "待办事项"}>
      <Slot slotName="content">
        <Form autoComplete="off" layout="inline" style={{ margin: "16px 0" }}>
          <Form.Item label="待办类型" style={{ marginBottom: formExpend ? "10px" : 0 }}>
            <TodoTaskTypeSelect
              value={formState.todoTagCode}
              style={{ width: "120px" }}
              onChange={(e) => {
                setFormState((draft) => {
                  draft.todoTagCode = e;
                });
              }}
            />
          </Form.Item>
          {formExpend && (
            <Form.Item label="任务时间">
              <DatePicker.RangePicker
                value={formState.period as [Dayjs, Dayjs]}
                locale={datePickerZhCN}
                allowClear
                onChange={(e) => {
                  setFormState((draft) => {
                    draft.period = (e as Dayjs[] | null) ?? [];
                  });
                }}
              />
            </Form.Item>
          )}

          <Form.Item label="任务名称">
            <Input
              placeholder="任务名称"
              value={formState.keyword}
              onChange={(e) => {
                setFormState((draft) => {
                  draft.keyword = e.target.value;
                });
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={queryForm}>
              查询
            </Button>
            <Button style={{ marginLeft: "10px" }} onClick={reset}>
              重置
            </Button>
          </Form.Item>
          {showSwitchBtn && (
            <Form.Item>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setFormExpend(!formExpend);
                }}
              >
                {formExpend ? "∧ 收起" : "∨ 展开"}
              </Button>
            </Form.Item>
          )}
        </Form>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          loading={loading}
          scroll={{ x: true, y: scrollY }}
          size="small"
        />
      </Slot>
      <Slot slotName="footer-page">
        <Pagination
          total={page.total}
          showTotal={(total) => `共计 ${total} 条`}
          defaultPageSize={10}
          defaultCurrent={1}
          current={page.pageNumber}
          onChange={(pageNumber, pageSize) => {
            getTableData({ pageNumber, pageSize });
            writeCache({ pageNumber, pageSize });
          }}
        />
      </Slot>
    </Layout>
  );
};
