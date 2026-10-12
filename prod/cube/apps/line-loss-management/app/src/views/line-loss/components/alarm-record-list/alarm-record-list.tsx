import { defineComponent, onMounted, reactive, ref, computed } from "vue";
import { PopOver, Page } from "@ghcloud/cube-ui";
import { useCubeForm, useCubeTable } from '@ghcloud/cube-app-design';
import { cubeAlarmCenterService } from "@/api/server";
import dayjs from "dayjs";
import styles from "./alarm-record-list.module.less";

export const AlarmRecordList = defineComponent({
  name: 'AlarmRecordList',
  setup: () => {
    const searchParams = reactive({
      alarmHandlerResult: undefined,
      keyword: "",
      alarmStatus: "ALL",
      alarmLevelId: undefined,
      alarmTypeId: undefined,
      period: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const color: Record<string, string> = {
      一级: "rgb(255, 59, 52)",
      二级: "rgb(255, 110, 52)",
      三级: "rgb(255, 194, 52)",
      四级: "rgb(24, 144, 255)",
    };
    
    const handleStatus: Record<string, string> = {
      已挂起: "#02A7F0",
      待接收: "#D9001B",
      处理中: "#F59A23",
      已关闭: "#7F7F7F",
      已处理: "#70B603",
    };

    const columns = [
      {
        dataIndex: "alarmEventName",
        title: "报警事件",
        fixed: "left",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTargetName",
        title: "报警对象",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTypeName",
        title: "报警类型",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "areaName",
        title: "报警区域",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "alarmTime",
        title: "报警时间",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "alarmLevelName",
        title: "报警级别",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span style={{ color: color[text] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmStatusName",
        title: "处理状态",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span style={{ color: handleStatus[text] }}>{text || "--"}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerResultName",
        title: "处理结果",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text || "--"}>
            <span>{text}</span>
          </PopOver>
        ),
      },
      {
        dataIndex: "alarmHandlerName",
        title: "处理人",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      scrollY: 400,
      fetchApi: async () => {
        try {
            const res = await cubeAlarmCenterService.getAlarmRecordsPage({
              pageNumber: searchParams.pageNumber,
              pageSize: searchParams.pageSize,
              keyword: searchParams.keyword,
              alarmStatus: searchParams.alarmStatus === "ALL" ? "" : searchParams.alarmStatus,
              alarmLevelId: searchParams.alarmLevelId ?? '',
              alarmTypeId: searchParams.alarmTypeId ?? '',
              period: searchParams.period,
              alarmHandlerResult: searchParams.alarmHandlerResult ?? '',
            });
            return {
                total: (res as any).total,
                records: (res as any).records,
            } as any
        } catch (e) {
            return { total: 0, records: [] } as any
        }
      },
      fetchLoaded: (data: any) => {
          searchParams.total = data.total
      }
    })

    const handlePageChange = (pageNumber: number, pageSize: number) => {
        searchParams.pageNumber = pageNumber
        searchParams.pageSize = pageSize
        tableApi.query()
    }

    const alarmTypesList = ref<{ label: string; value: string }[]>([]);
    const alarmLevelList = ref<{ label: string; value: string }[]>([]);

    const getAlarmTypesOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmTypes();
      alarmTypesList.value = (data as any[])?.map((e) => ({ label: e.name, value: e.id }));
    };

    const getAlarmLevelOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmLevels();
      alarmLevelList.value = (data as any[])?.map((e) => ({ label: e.name, value: e.id }));
    };

    onMounted(() => {
      getAlarmTypesOptions();
      getAlarmLevelOptions();
    });

    const formSchema = [
        {
            component: 'Select',
            label: '状态',
            fieldName: 'alarmStatus',
            defaultValue: 'ALL',
            componentProps: {
                options: [
                  { label: "所有", value: "ALL" },
                  { label: "待接收", value: "ALARM_UN_CONFIRMED" },
                  { label: "处理中", value: "ALARM_PROGRESS_CONFIRMED" },
                  { label: "已挂起", value: "ALARM_SUSPEND" },
                  { label: "已处理", value: "ALARM_HANDLER" },
                ],
                placeholder: '请选择状态',
                style: { width: '100px' }
            }
        },
        {
            component: 'Select',
            label: '报警级别',
            fieldName: 'alarmLevelId',
            componentProps: {
                options: alarmLevelList.value,
                placeholder: '请选择报警级别',
                style: { width: '140px' }
            }
        },
        {
            component: 'Select',
            label: '报警类型',
            fieldName: 'alarmTypeId',
            componentProps: {
                options: alarmTypesList.value,
                placeholder: '请选择报警类型',
                style: { width: '140px' }
            }
        },
        {
            component: 'Select',
            label: '处理结果',
            fieldName: 'alarmHandlerResult',
            componentProps: {
                options: [
                  { label: "实报", value: "ALARM_ACTUAL" },
                  { label: "误报", value: "ALARM_IMPRACTICAL" },
                ],
                placeholder: '请选择处理结果',
                style: { width: '140px' }
            }
        },
        {
            component: 'RangePicker',
            label: '报警时间',
            fieldName: 'alarmTime',
            componentProps: {
                valueFormat: 'YYYY-MM-DD',
            }
        },
        {
            component: 'Input',
            label: '',
            fieldName: 'keyword',
            componentProps: {
                placeholder: '报警事件/报警对象',
            }
        }
    ]

    const [CubeForm, formApi] = useCubeForm({
        layout: 'horizontal',
        schema: formSchema,
        showCollapseButton: true,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
        handleSubmit: (data) => {
            // searchParams.alarmStatus = data.alarmStatus
            // searchParams.alarmLevelId = data.alarmLevelId
            // searchParams.alarmTypeId = data.alarmTypeId
            // searchParams.alarmHandlerResult = data.alarmHandlerResult
            // searchParams.keyword = data.keyword
            
            // if (data.alarmTime && data.alarmTime.length === 2) {
            //     searchParams.period = `${data.alarmTime[0]} 00:00:00,${data.alarmTime[1]} 23:59:59`
            // } else {
            //     searchParams.period = ""
            // }
            searchParams.pageNumber = 1
            tableApi.query()
        },
        handleReset: () => {
            searchParams.alarmStatus = 'ALL'
            searchParams.alarmLevelId = undefined
            searchParams.alarmTypeId = undefined
            searchParams.alarmHandlerResult = undefined
            searchParams.keyword = ''
            searchParams.period = ''
            searchParams.pageNumber = 1
            tableApi.query()
        },
    })

    return () => (
      <div class={styles["alarm-record-list"]}>
          <CubeForm />
          <CubeTable />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
             <Page
                current={searchParams.pageNumber}
                pageSize={searchParams.pageSize}
                total={searchParams.total}
                onPageChange={handlePageChange}
              />
          </div>
      </div>
    );
  }
});
