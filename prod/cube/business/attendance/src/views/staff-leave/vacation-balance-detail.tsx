import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { Button, Page, PopOver, TabPane, Table, Tabs } from "@ghcloud/cube-ui";
import { useListQueryCache } from "@ghcloud/cube-utils";

import { getStaffLeaveBalance, leaveBalanceDetailPage, leaveRulesList } from "@/api/staff-leave";
import { CancelBalanceModal } from "@/components/business/cancel-balance-modal/cancel-balance-modal";
import { ChangeBalanceModal } from "@/components/business/change-balance-modal/change-balance-modal";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { businessTypeMap } from "@/types/vacation-type";

interface LeaveRule {
  id: number;
  name: string;
  notLimit: boolean;
  unit: "天" | "小时";
}

/** 员工假期余额 详情 */
export const VacationBalanceDetail = defineComponent({
  setup: () => {
    const { id: staffId, holidayRuleId } = useRoute().query;
    const activeKey = ref();
    const unit = ref<"天" | "小时">("天");
    const leaveRules = ref<LeaveRule[]>([]);
    const changeBalanceModalRef = ref<{ openModal: (params: unknown, unit: string) => void }>();
    const cancelBalanceModalRef = ref<{ openModal: (params: unknown, type: string) => void }>();
    const activeRule = computed(() => {
      return leaveRules.value.find((e) => e.id === activeKey.value);
    });
    const availableBalance = ref(0);
    const notLimit = ref(false);
    const tableCell = (effective: boolean, content: string): JSX.Element => {
      return <span style={{ color: !effective ? "#b5b5b5" : "" }}>{content}</span>;
    };
    const columns = [
      {
        title: "时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text, record }: { text: string; record: { effective: boolean } }): VNode => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{tableCell(record.effective, time || "--")}</PopOver>;
        },
      },
      {
        title: "修改人",
        dataIndex: "updateName",
        ellipsis: true,
        width: 180,
        customRender: ({ text, record }: { text: string; record: { effective: boolean } }): VNode => {
          return <PopOver content={text || "--"}>{tableCell(record.effective, text || "--")}</PopOver>;
        },
      },
      {
        title: "余额变动",
        dataIndex: "changeNumber",
        ellipsis: true,
        width: 180,
        customRender: ({ text, record }: { text: string; record: { effective: boolean } }): VNode => {
          return <PopOver content={text || "--"}>{tableCell(record.effective, text || "--")}</PopOver>;
        },
      },
      {
        title: "有效期",
        dataIndex: "deadline",
        ellipsis: true,
        width: 180,
        customRender: ({ text, record }: { text: string; record: { effective: boolean } }): VNode => {
          const time = text ? dayjs(text).format("YYYY-MM-DD") : "--";
          return <PopOver content={text || "--"}>{tableCell(record.effective, time || "--")}</PopOver>;
        },
      },
      {
        title: "备注",
        dataIndex: "remark",
        ellipsis: true,
        width: 180,
        customRender: ({ text, record }: { text: string; record: { effective: boolean } }): VNode => {
          return <PopOver content={text || "--"}>{tableCell(record.effective, text || "--")}</PopOver>;
        },
      },
      {
        title: "操作",
        ellipsis: true,
        width: 180,
        customRender: ({
          record,
        }: {
          record: { id: string; effective: boolean; businessType: string; processInstanceId: string };
        }): VNode => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  cancelRecord(record);
                }}
              >
                {!record.effective ? "详情" : "作废"}
              </Button>
              {record.businessType && record.processInstanceId && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    orderDetail(record);
                  }}
                >
                  工单详情
                </Button>
              )}
            </>
          );
        },
      },
    ];
    const tableSlot = {
      headerCell: ({ column }: { column: { title: string } }): string => {
        return column.title;
      },
    };
    const tableColumns = ref([...columns]);
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const queryCache = useListQueryCache<{
      activeKey: number | undefined;
      pageNumber: number;
      pageSize: number;
    }>({
      defaults: {
        activeKey: undefined,
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        activeKey: activeKey.value,
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
      }),
      setState: (next) => {
        if (next.activeKey !== undefined) {
          activeKey.value = Number(next.activeKey);
        }
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const getTypeList = async (): Promise<void> => {
      const res = await leaveRulesList();
      leaveRules.value = res.data as LeaveRule[];
      queryCache.hydrate();
      const activeKeyInUrl = leaveRules.value.find((item) => item.id.toString() === String(activeKey.value));
      const activeKeyInHolidayRuleId = holidayRuleId && leaveRules.value.find((item) => item.id.toString() === holidayRuleId);
      if (activeKeyInUrl) {
        activeKey.value = activeKeyInUrl.id;
      } else if (activeKeyInHolidayRuleId) {
        activeKey.value = activeKeyInHolidayRuleId.id;
      } else {
        activeKey.value = leaveRules.value[0].id;
      }
    };
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await leaveBalanceDetailPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          staffId,
          holidayRuleId: activeRule.value?.id,
        });
        if (res.data) {
          const { records, total } = res.data;
          const rule = leaveRules.value.find((e) => e.id === activeKey.value);
          const unitStr = rule ? rule?.unit : "";
          dataSource.value = records.map((e) => {
            return {
              ...(e as Record<string, string>),
              changeNumber: (e as { changeNumber: string }).changeNumber + unitStr,
            } as unknown;
          });
          pagination.value.total = total;
        }
      } catch (error) {
        logger.debug(error);
      } finally {
        loading.value = false;
      }
    };
    const fetchTabData = async (): Promise<void> => {
      unit.value = activeRule.value?.unit ?? "天";
      getStaffLeaveBalance({ staffId: staffId as string, holidayRuleId: activeRule.value?.id ?? 0, unit: unit.value }).then((res) => {
        availableBalance.value = res.data.total;
        notLimit.value = res.data.notLimit;
      });
      await getTableData();
    };

    const tabChange = (): void => {
      setTimeout(async () => {
        pagination.value.pageNumber = 1;
        await fetchTabData();
        await queryCache.sync();
      }, 0);
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      void fetchTabData().then(() => queryCache.sync());
    };

    const { scorllY } = useTableScroll();

    const cancelRecord = (record: { effective: boolean }): void => {
      cancelBalanceModalRef.value?.openModal(record, record.effective ? "cancel" : "confirm");
    };
    const orderDetail = (record: { businessType: string; processInstanceId: string }): void => {
      try {
        const { businessType, processInstanceId } = record;
        const applicationName = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? JSON.stringify({}))?.name || "";
        const title = businessTypeMap.get(businessType) || "";
        history.pushState(
          { current: location.pathname + location.search },
          "",
          `/portal/stream-engine-render/index?businessType=${businessType}&processInstanceId=${processInstanceId}&type=detail&title=${title}&appName=${applicationName}`,
        );
      } catch (error) {}
    };

    onMounted(async () => {
      await getTypeList();
      await fetchTabData();
      await queryCache.sync();
    });

    const layoutSlots = {
      "layout-content": (): VNode => {
        return (
          <>
            <Tabs v-model:activeKey={activeKey.value} onTabChange={tabChange}>
              {leaveRules.value.map((e) => {
                return <TabPane key={e.id} tab={e.name} />;
              })}
            </Tabs>
            <div style="margin:10px 0;height:30px;display:flex;justify-content:space-between;align-items: center;">
              <span style="margin-right:10px">
                当前余额：
                {activeRule.value?.notLimit ? "无限制" : `${availableBalance.value}${unit.value}`}
              </span>
              <Button
                type="primary"
                size="small"
                v-show={!activeRule.value?.notLimit}
                onClick={() => {
                  changeBalanceModalRef.value?.openModal(
                    { staffId, holidayRuleId: activeRule.value?.id, availableBalance: availableBalance.value },
                    unit.value,
                  );
                }}
              >
                新增
              </Button>
            </div>
            <Table
              columns={tableColumns.value}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size="small"
              scrollY={scorllY.value || 500}
              scrollX={1000}
              v-slots={tableSlot}
            />
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): VNode => (
      <>
        <Layout title="假期余额明细" v-slots={layoutSlots} />
        <ChangeBalanceModal
          ref={changeBalanceModalRef}
          onSuccess={async () => {
            tabChange();
          }}
        />
        <CancelBalanceModal
          ref={cancelBalanceModalRef}
          onSuccess={async () => {
            tabChange();
          }}
        />
      </>
    );
  },
});
