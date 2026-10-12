<template>
    <g-layout title="巡检档案详情">
        <template #content-table>
            <div class="inspect-info"> 
                <gVerticalLine title="基础信息" />
                <g-detail-form ref="detailForm" :api="api" :formList="formList" :afterGet="afterGet" />
                <gVerticalLine title="巡检记录"/>
                <div class="inspectionInfo">
                    <div class="info-item">
                        <span class="label">巡检总次数:</span>
                        <span class="value">{{ Number(dataList.dailyNum || 0) + Number(dataList.temporaryNum || 0) }}</span>
                        <span class="unit">次</span>
                    </div>
                    <div class="info-item">
                        <span class="label">日常巡检:</span>
                        <span class="value">{{ dataList.dailyNum || 0 }}</span>
                        <span class="unit">次</span>
                    </div>
                    <div class="info-item">
                        <span class="label">临时巡检:</span>
                        <span class="value">{{ dataList.temporaryNum || 0 }}</span>
                        <span class="unit">次</span>
                    </div>
                    <div class="info-item">
                        <span class="label">巡检异常结果次数:</span>
                        <span class="value">{{ Number(dataList.dailyErrNum ?? 0) + Number(dataList.temporaryErrNum ?? 0) }}</span>
                        <span class="unit">次</span>
                    </div>
                </div>
                <div class="inspect-operate">
                    <a-form layout="inline">
                        <a-form-item label="巡检类型">
                            <a-select v-model:value="formState.temporary" placeholder="请选择巡检类型" style="width: 150px;" >
                                <a-select-option v-for="item in temporaryTypeList" :key="item.value" :value="item.value">
                                    {{ item.label }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item label="巡检结果">
                            <a-select v-model:value="formState.result" placeholder="请选择巡检结果" style="width: 150px;" >
                                <a-select-option v-for="item in resultList" :key="item.value" :value="item.value">
                                    {{ item.label }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                        <a-form-item>
                            <a-button :style="{ marginLeft: '10px'}" @click="query()" type="primary">查询</a-button>
                            <a-button :style="{ marginLeft: '10px'}" @click="reset()">重置</a-button>
                        </a-form-item>
                    </a-form>
                </div>
                <a-table
                    :dataSource="dailyInspectionData"
                    :columns="dailyInspectionColumns" 
                    :pagination="false"
                    size="middle"
                    >
                    <template #action="{ record }">
                        <a-button type="link" @click="jumpPage('detail', record)">
                            详情
                        </a-button>
                    </template>
                </a-table>
                <div class="paginationBox">
                    <a-pagination v-model:current="current" v-model:pageSize="pageSize" show-size-changer
                        @showSizeChange="getTableData" :total="dailyTotal" @change="getTableData" />
                </div>
            </div>
        </template>
        <template #footer-page>
            <a-button @click="goBack">返回</a-button>
        </template>
    </g-layout>
</template>
<script lang="jsx">
import {
    defineComponent,
    getCurrentInstance,
    onMounted,
    reactive,
    toRefs,
    ref,
} from "vue";
import { timeFormat } from "@/utils/common";
import { useRouter, useRoute } from "vue-router";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import gVerticalLine from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gVerticalLine'
export default defineComponent({
    components: {
        gLayout,
        gVerticalLine
    },
    setup() {
        const dailyPageSize = ref(1);
        const dailyTotal = ref(0);
        const current = ref(1);
        const pageSize = ref(10);
        const temporaryPageSize = ref(1);
        const temporaryTotal = ref(0);
        const router = useRouter();
        const route = useRoute();
        const { proxy } = getCurrentInstance();
        const modalForm = ref();
        const detailForm = ref();
        const state = reactive({
            dataList: {},
            api: {
                detail: "targetRecordDetail",
            },
            activeKey: '0',
            model: null,
            formList: [
                {
                    form: [
                        {
                            label: "对象名称",
                            value: "targetName",
                            detailFun: (value) => {
                                return value ? value : "--";
                            },
                        },
                        {
                            label: "对象类型", value: "targetCategory", detailFun: (value) => {
                                let obj = {
                                    'DEVICE': '设备',
                                    'STALL': '资产',
                                    'PROPERTY': '档位',
                                    'SITE_POINT': '现场点',
                                    'RISK_SOURCE': '风险源',
                                    "SMALL_ENGINEERING": '小散工程',
                                }
                                return obj ? obj[value] : "--";
                            },
                        },
                        {
                            label: "所在区域",
                            value: "areaName",
                            html: true,
                            detailFun: (value) => {
                                return value
                                    ? `<span >${value}</span>`
                                    : "--";
                            },
                        },
                        {
                            label: "所属部门",
                            value: "organizationName",
                            html: true,
                            detailFun: (value) => {
                                return value
                                    ? `<span >${value}</span>`
                                    : "--";
                            },
                        },
                        {
                            label: "最后一次巡检时间",
                            value: "time",
                            detailFun: (value) => {
                                return value ? timeFormat(value, true) : "--";
                            },
                        },
                        {
                            label: "最近一次巡检结果",
                            value: "result",
                            html: true,
                            detailFun: (value) => {
                                switch (value) {
                                    case "ABNORMAL":
                                        return "<span class='abnormal'>异常</span>";
                                    case "NORMAL":
                                        return "<span class='normal'>正常</span>";
                                    default:
                                        return '--'
                                }
                            },
                        },
                    ],
                },
            ],
            confirmPerson: "",
            visible: false,
            confirmModel: {
                faultId: "",
                confirmResult: "",
                processInstanceId: "31236485",
                remark: "",
            },
            confirmInfo: null,
            formState: {
                temporary: null,
                result: '',
            },
            temporaryTypeList: [
                {label: '全部', value: null},
                {label: '日常巡检', value: 1},
                {label: '临时巡检', value: 2},
            ],
            resultList: [
                {label: '全部', value: null},
                {label: '正常', value: 'NORMAL'},
                {label: '异常', value: 'ABNORMAL'},
            ]
        });
        const dailyInspection = reactive({
            dailyInspectionData: [],
            dailyInspectionColumns: [
                {
                    dataIndex: "time",
                    title: "巡检时间",
                    align: 'center',
                    slots: {
                        customRender: "time",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver
                                position="topLeft"
                                content={text ? timeFormat(text, true) : ""}
                            >
                                {text ? timeFormat(text, true) : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "targetName",
                    title: "巡检对象",
                    align: 'center',
                    slots: {
                        customRender: "targetName",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "username",
                    title: "执行人",
                    align: 'center',
                    slots: {
                        customRender: "username",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "result",
                    title: "结果",
                    align: 'center',
                    slots: {
                        customRender: "result",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        switch (text) {
                            case "ABNORMAL":
                                return <span class='abnormal'>异常</span>;
                            case "NORMAL":
                                return <span class='normal'>正常</span>;
                            default:
                                return '--'
                        }
                    },
                },
                {
                    dataIndex: "errValueNum",
                    title: "异常项",
                    align: 'center',
                    slots: {
                        customRender: "errValueNum",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "taskName",
                    title: "所属任务",
                    align: 'center',
                    slots: {
                        customRender: "taskName",
                    },
                    ellipsis: true,
                    customRender: ({ text }) => {
                        return (
                            <PopOver position="topLeft" content={text ? text : ""}>
                                {text ? text : "--"}
                            </PopOver>
                        );
                    },
                },
                {
                    dataIndex: "action",
                    title: "操作",
                    align: 'center',
                    slots: {
                        customRender: "action",
                    },
                    ellipsis: true,
                },

            ],
        })
        const getTableData = () => {
            dailyInspection.dailyInspectionData = []
            dailyTotal.value = 0
            let obj = {
                targetId: state.confirmModel.faultId,
                temporary: state.formState.temporary ?? 0,
                result: state.formState.result || '',
                pageNumber: current.value,
                pageSize: pageSize.value,
            }
            proxy.$api.detailRecordPage(obj).then((res) => {
                dailyInspection.dailyInspectionData = res.records
                dailyTotal.value = res.total
            })
        }
        const query = () => {
            current.value = 1
            getTableData()
        }
        const reset = () => {
            for(let key in state.formState) {
                state.formState[key] = null
            }
            getTableData()
        }
        const goBack = () => {
            router.push('/inspectionAccount')
            // history.go(-1)
        };

        const afterGet = (res) => {
            state.model = res;
            return res;
        };

        const jumpPage = (type, record) => {
            router.push({
                path: '/inspectionAccountDetails',
                query: {
                    type,
                    id: record ? record.id : null,
                },
            });
            sessionStorage.setItem('id', state.confirmModel.faultId)
        }
        const getInspectionData = () => {
            proxy.$api.targetRecordDetail(state.confirmModel.faultId).then((data) => {
                state.dataList = data
            })
        }
        onMounted(() => {
            state.confirmModel.faultId = route.query.id;
            getInspectionData()
            query()
        });

        return {
            modalForm,
            dailyTotal,
            current,
            pageSize,
            detailForm,
            dailyPageSize,
            temporaryTotal,
            temporaryPageSize,
            ...toRefs(state),
            ...toRefs(dailyInspection),
            timeFormat,
            getInspectionData,
            afterGet,
            goBack,
            jumpPage,
            query,
            reset,
            getTableData,
        };
    },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.inspect-info {
  height: 100%;
  overflow-y: scroll;
}
.ctr {
    width: 100%;
    height: 100%;
}

:deep(.ant-timeline) {
    width: 30%;
    margin: 0 auto;
}

.recordBtn {
    padding: 0;
}

.inspectResult {
    .title {
        font-weight: 500;
        font-weight: bold;
    }
}

:deep(.ant-image-img) {
    width: 100%;
    height: 100%;
}

.sortNum {
    width: 30px;
    height: 22px;
}

:deep(.detail-form .ant-form-item > .ant-form-item-label) {
    width: 125px !important;
}
.inspectionInfo {
    padding: 16px 24px;
    background: #f5f7fa;
    border-radius: 4px;
    margin: 16px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;

    .info-item {
        min-width: 200px;
        display: flex;
        align-items: center;
        
        .label {
            color: #666;
            margin-right: 8px;
        }
        
        .value {
            font-size: 20px;
            font-weight: 500;
            color: #2d3a4b;
            margin-right: 4px;
        }
        
        .unit {
            color: #666;
        }
    }
}

.inspect-operate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.paginationBox {
    // position: absolute;
    // right: 0;
    // bottom: 5px;
    text-align: right;
    margin-top: 15px;
}

:deep(.detail-form) {
  height: auto !important;
}
</style>
