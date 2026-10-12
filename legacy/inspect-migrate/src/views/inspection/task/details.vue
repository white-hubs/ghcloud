<template>
  <g-layout title="巡检任务详情">
    <template #content-table>
      <div class="inspect-info">
        <gVerticalLine title="基本信息" />
        <g-detail-form ref="detailForm" :api="api" :formList="formList" :detailParam="'id'">
        </g-detail-form>
        <gVerticalLine title="巡检对象"/>
        <div class="inspectionInfo">
          <div class="info-item">
              <span class="label">对象总数:</span>
              <span class="value">{{ tableListData?.targetAllNum || 0 }}</span>
              <span class="unit">个</span>
          </div>
          <div class="info-item">
              <span class="label">待巡检对象数:</span>
              <span class="value">{{ tableListData?.waitTargetNum || 0 }}</span>
              <span class="unit">个</span>
          </div>
          <div class="info-item">
              <span class="label">已巡检对象数:</span>
              <span class="value">{{ tableListData?.completedTargetNum || 0 }}</span>
              <span class="unit">个</span>
          </div>
          <div class="info-item">
              <span class="label">结果异常对象数:</span>
              <span class="value">{{ tableListData?.errTargetNum || 0 }}</span>
              <span class="unit">个</span>
          </div>
      </div>
        <div class="inspect-operate">
          <a-form layout="inline">
            <a-form-item label="巡检对象">
              <a-input v-model:value.trim="formState.keyword" placeholder="请输入巡检对象名称" style="width: 220px;" />
            </a-form-item>
            <a-form-item label="巡检对象类型">
              <a-select
              mode="multiple"
              :maxTagCount="3"
              @change="checkChange"
              v-model:value="formState.targetCategory"
              optionFilterProp='label' 
              show-search 
              :options="inspectType"
              allowClear
              :style="{ width: '200px'}"
              placeholder="巡检对象类型" />
            </a-form-item>
            <a-form-item>
              <a-button :style="{ marginLeft: '10px'}" @click="query()" type="primary">查询</a-button>
              <a-button :style="{ marginLeft: '10px'}" @click="reset()">重置</a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-table 
          size="middle"
          :scroll="{ y: 300 }"
          :dataSource="tableListData?.recordTaskResultList"
          :columns="inspectColumns">
          <template #action="{ record }">
            <a-button type="link" @click="jumpPage('detail', record)">
              查看巡检记录
            </a-button>
          </template>
        </a-table>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" v-if="model?.status === 'TO_BE_CONFIRMED'" @click="openModal">
        确认故障
      </a-button>
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
import { timeFormat, chunkArray } from "@/utils/common";
import { useRouter, useRoute } from "vue-router";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import gVerticalLine from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gVerticalLine'
import gDetailForm from '@/components/Common/gDetailForm.vue'

export default defineComponent({
  components: {
    gLayout,
    gVerticalLine,
    gDetailForm
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const id = route.query.id;
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const detailForm = ref();
    const obj = {
      "DEVICE": '设备',
      "STALL": '档位',
      "PROPERTY": '资产',
      "SITE_POINT": '现场点',
      "RISK_SOURCE": '风险源',
      "SMALL_ENGINEERING": '小散工程',
    }
    const inspectData = reactive({
      inspectDataSource: [],
      inspectAllDataSource: [],
      inspectSearch: {
        name: '',
        type: []
      },
      inspectColumns: [
        {
          dataIndex: "targetName",
          title: "巡检对象名称",
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
          dataIndex: "targetCategory",
          title: "巡检对象类",
          align: 'center',
          slots: {
            customRender: "targetCategory",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let obj = {
              'DEVICE': '设备',
              'STALL': '档位',
              'PROPERTY': ' 资产',
              "SITE_POINT": '现场点',
              "RISK_SOURCE": '风险源',
              "SMALL_ENGINEERING": '小散工程',
            }
            return (
              <PopOver position="topLeft" content={obj[text] ? obj[text] : "--"}>
                {obj[text] ? obj[text] : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "状态",
          align: 'center',
          slots: {
            customRender: "status",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "EXECUTING") {
              return "待巡检"
            } else if (text === "OVER") {
              return "已完成"
            } else if (text === "EXPIRE") {
              return "已过期"
            } else if (text === "STOP") {
              return "已终止"
            } else if (text === "CONFIRM") {
              return "待确认"
            } else if (text === "SPLIT") {
              return "待拆解"
            } else if (text === "ACCEPT") {
              return "待接收"
            } else if (text === "OVERTIME") {
              return "超时完成"
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "itemName",
          title: "巡检项",
          align: 'center',
          slots: {
            customRender: "itemName",
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
          title: "巡检结果",
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
          dataIndex: "nickname",
          title: "执行人",
          align: 'center',
          slots: {
            customRender: "nickname",
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
      inspectPagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total) => `总共 ${total} 条数据`,
      }
    })
    const inspectTableChange = (page, pageSize) => {
      inspectData.inspectPagination.current = page.current
      inspectData.inspectPagination.pageSize = page.pageSize
      const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize)
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1]
    }
    const searchInspect = (flag) => {
      inspectData.inspectPagination.current = 1
      if (flag) {
        inspectData.inspectSearch.name = ''
        inspectData.inspectSearch.type = []
      }
      const filterData = inspectData.inspectAllDataSource.filter(item => {
        if (item.targetName.includes(inspectData.inspectSearch.name) && (inspectData.inspectSearch.type.includes(item.targetCategory) || !inspectData.inspectSearch.type.length)) {
          return item
        }
      })
      inspectData.inspectPagination.total = filterData.length
      const chunkArrayData = chunkArray(filterData, inspectData.inspectPagination.pageSize)
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1]
    }
    const state = reactive({
      api: {
        detail: "inspectTaskDetailV2",
      },
      inspectType: [
        {
          label: '设备',
          value: 'DEVICE'
        },
        {
          label: '档位',
          value: 'STALL'
        },
        {
          label: '资产',
          value: 'PROPERTY'
        },
        {
          label: '现场点',
          value: 'SITE_POINT'
        },
        {
          label: '风险源',
          value: 'RISK_SOURCE'
        },
        {
          label: '小散工程',
          value: 'SMALL_ENGINEERING'
        }
      ],
      formState: {
        keyword: '',
        targetCategory: [],
      },
      itemColumns: [
        {
          dataIndex: "referTypeNames",
          title: "巡检项名称",
          ellipsis: true,
          slots: {
            customRender: "referTypeNames",
          },
        },
        {
          dataIndex: "name",
          title: "内容描述",
          ellipsis: true,
          slots: {
            customRender: "name",
          },
        },
        {
          dataIndex: "resultNames",
          title: "巡检结果",
          ellipsis: true,
          slots: {
            customRender: "resultNames",
          },
        }, {
          dataIndex: "targetCategory",
          title: "适用对象",
          ellipsis: true,
          slots: {
            customRender: "targetCategory",
          },
        }, {
          dataIndex: "receiveUserNames",
          title: "执行人",
          ellipsis: true,
          slots: {
            customRender: "receiveUserNames",
          },
        },
        // {
        //   dataIndex: "defaultResult",
        //   title: "默认结果",
        //   ellipsis: true,
        //   slots: {
        //     customRender: "defaultResult",
        //   },
        // },
        // {
        //   dataIndex: "imageFlag",
        //   title: "拍照",
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       text ? '是' : '否'
        //     );
        //   },
        // }
      ],
      treeOptions: [],
      activeKey: '1',
      model: null,
      formList: [
        {
          form: [
            { label: "巡检任务", value: "name" },
            {
              label: "所属计划",
              value: "planName",
              html: true,
              detailFun: (value, form) => {
                return value
                  ? `<a href="./inspectionPlanOperate?type=detail&id=${form.planId}&flag=true&businessType=${route.query.businessType}">${value}</a>`
                  : "--";
              },
            },
            { label: "发布人", value: "publisherName" },
            {
              label: "巡检类型",
              value: "typeName",
            },
            {
              label: "任务级别",
              value: "level",
              detailFun: (text) => {
                return text === 'GENERAL' ? '普通' : "紧急"
              },
            },
            {
              label: "执行人",
              value: "receiveNames",
              detailFun: (value) => {
                return value ? value : "--";
              },
            },
            {
              label: "发布时间",
              value: "updateTime",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            {
              label: "截止时间",
              value: "validEndTime",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            {
              label: "任务状态",
              value: "status",
              detailFun: (text) => {
                if (text === "EXECUTING") {
                  return "待巡检"
                } else if (text === "OVER") {
                  return "已完成"
                } else if (text === "EXPIRE") {
                  return "已过期"
                } else if (text === "STOP") {
                  return "已终止"
                } else if (text === "CONFIRM") {
                  return "待确认"
                } else if (text === "SPLIT") {
                  return "待拆解"
                } else if (text === "ACCEPT") {
                  return "待接收"
                } else if (text === "OVERTIME") {
                  return "超时完成"
                } else {
                  return "--";
                }
              },
            },
            { label: "协同人", value: "assistNames" },
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
      rules: {
        confirmResult: [{ required: true, message: "请选择确认结果" }],
        processInstanceId: [{ required: true, message: "请选择业务流程" }],
      },
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      confirmInfo: null,
    });
    const tableState = reactive({
      tableData: [],
    })
    const tableListData = ref()
    //  处理巡检对象内容
    const handleInspectData = (data) => {
      inspectData.inspectAllDataSource = data.flat().map(item => {
        return {
          ...item,
          standardIds: item.standardDTOList
        }
      })
      inspectData.inspectPagination.total = data.flat().length
      const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize)
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1]
    }
    const getTargetData = async () => {
      const data = {
        id:route.query['id']
      }
      if (route.query['businessType'] && route.query['businessType'] !=='undefined') {
        data.businessType = route.query['businessType']
      }
      proxy.$api.inspectTaskDetailV2(data).then(res => {
        handleInspectData(res.typeTargets)
      })
    }
    const goBack = () => {
      if (route.query.flag) {
        router.push('/inspectionTask')
      } else {
        router.go(-1);
      }
    };

    const afterGet = (res) => {
      state.model = res;
      return res;
    };

    const openModal = () => {
      state.visible = true;
    };
    const toDetails = (record) => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('flag')) {
        router.push({
          path: "/inspectionTaskDetails",
          query: { id: urlParams.get('id'), type: "detail", flag: urlParams.get('flag'), "activeKey": state.activeKey },
        });
      }
    }
    const jumpPage = (type, record) => {
      router.push({
        path: '/inspectionAccountDetails',
        query: {
          type,
          page: 'task',
          id: record ? record.id : null,
        },
      });
      sessionStorage.setItem('id', state.confirmModel.faultId)
    }
    const getTableData = () => {
      tableListData.value = []
      let obj = {
          id: state.confirmModel.faultId,
          keyword: state.formState.keyword || '',
          targetCategory: Array.isArray(state.formState.targetCategory) ? state.formState.targetCategory.join(',') : state.formState.targetCategory,
      }
      proxy.$api.inspectTaskDetailRateV2(obj).then((res) => {
        tableListData.value = res
      });
    }
    const query = () => {
      getTableData()
    }
    const reset = () => {
        for(let key in state.formState) {
          state.formState[key] = null
        }
        state.formState.targetCategory = []
        getTableData()
    }
    onMounted(() => {
      state.confirmModel.faultId = route.query.id;
      toDetails()
      query()
    });

    return {
      modalForm,
      detailForm,
      timeFormat,
      ...toRefs(state),
      ...toRefs(inspectData),
      tableListData,
      openModal,
      afterGet,
      inspectTableChange,
      goBack,
      jumpPage,
      searchInspect,
      query,
      reset,
      getTableData,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

.ctr {
  width: 100%;
  height: 100%;
}


.duringInspection {
  color: #F59A23;
}

.inspected {
  color: #70b630;
}

:deep(.ant-timeline) {
  padding-top: 12px;
  // width: 30%;
  // margin: 0 auto;
}

.recordBtn {
  padding: 0;
}

.standard {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #fff;

  .treeCtr {
    width: 300px;
    border-right: 1px solid #f3f3f3;
  }

  .tableCtr {
    flex: 1;
  }
}

:deep(.ant-table-title) {
  text-align: right;
  padding-top: 0;
}

.inspectionInfo {
  display: flex;
  align-items: center;
  margin: 20px 0;

  div {
    margin-right: 30px;
    font-size: 18px;
  }

  span {
    font-weight: bold;
  }
}

.InspectionStandardsInfoBox {
  height: 500px;
  overflow-y: scroll;
}

:deep(.ant-tree-title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 220px;
  display: inline-block;
}

:deep(.ant-tree) {
  height: calc(100vh - 450px);
  overflow-y: auto;
}

:deep(.detail-form) {
  height: auto !important;
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

.inspect-info {
  height: 100%;
  overflow-y: scroll;
}
</style>
