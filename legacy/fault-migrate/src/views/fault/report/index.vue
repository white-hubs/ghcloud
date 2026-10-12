<template>
  <g-table :title="pageTitle" tableCode="FAULT_REPORT" :columns="columns" :btns="btns" :search="search" :api="api" :modal="modal" :rules="rules"
    :modalTitle="modalTitle" :scrollX="600" ref="pdf">
    <template v-slot:btn="{ record }">
      <a-button type="link" @click="handleDetail(record)">详情</a-button>
    </template>
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs, ref } from 'vue'
import moment from "moment";
import { downloadPDF } from '@/utils/pdf.js'
import { useRoute } from 'vue-router'
import { getBusinessPrefix } from '../../../hooks/useBusinessPrefix'
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const businessPrefix = getBusinessPrefix();
    const pdf = ref()
    const route = useRoute()
    const state = reactive({
      modalTitle: `${businessPrefix}报告1`,
      // 表头
      columns: [
        {
          title: `分析报告名称`,
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '报告类型',
          dataIndex: 'typeName',
          key: 'typeName'
        },
        {
          title: '生成时间',
          dataIndex: 'createTime',
          key: 'createTime',
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft">
                {text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: 'action',
          title: '操作',
          slots: {
            customRender: 'action'
          }
        }
      ],
      // 接口
      api: {
        list: 'getReport',
        add: 'addReport',
        detail: 'record',
        deleteSingle: 'deleteReport',
      },
      // 操作按钮
      btns: ['add', 'deleteSingle'],
      search: [
        {
          label: '',
          value: 'keyword',
          placeholder: '报告名称'
        },
        {
          label: '报告类型',
          value: 'type',
          component: 'g-select',
          url: 'getReportType',
          field: {
            code: "value",
            name: "label",
          },
          placeholder: '请选择'

        },
      ],
      // 对话框弹窗
      modal: [
        {
          label: '报告类型',
          value: 'type',
          component: 'gSelect',
          url: 'getReportType',
          field: {
            code: "value",
            name: "label",
          },
          placeholder: '请选择报告类型'
        },
        {
          label: '时间选择',
          value: 'reportTime',
          component: 'a-date-picker',
          showCondition: (form) => {
            return form.type === 'REPORT_DAY' || form.type === 'REPORT_WEEK' || !form.type
          },
          placeholder: '请选择时间'

        },
        {
          label: '时间选择',
          value: 'reportTime',
          component: 'a-month-picker',
          showCondition: (form) => {
            return form.type === 'REPORT_MONTH'
          },
          placeholder: '请选择时间'

        },
      ],
      rules: {
        type: [{ required: true, message: '请选择报告类型' }],
        reportTime: [{ required: true, message: '请选择时间' }],
      }
    })
    const handleExport = () => {
      downloadPDF(pdf.value.$el)
    }
    const buildBackQuery = () => {
      return {
        fromPath: route.path || '/faultReport',
        fromQuery: encodeURIComponent(JSON.stringify(route.query || {})),
      }
    }
    const buildQueryString = (query) => {
      return Object.keys(query)
        .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== '')
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
        .join('&')
    }
    const buildDetailPath = () => {
      const segments = window.location.pathname.split('/')
      segments[segments.length - 1] = 'faultReportDetail'
      return segments.join('/').replace(/\/{2,}/g, '/')
    }

    //跳转详情
    const handleDetail = (record) => {
      const query = {
        id: record.id,
        ...buildBackQuery(),
      }
      const queryString = buildQueryString(query)
      const target = `${buildDetailPath()}${queryString ? `?${queryString}` : ''}`
      history.pushState({ current: location.pathname + location.search }, '', target)
    }
    return {
      ...toRefs(state),
      pdf,
      handleExport,
      handleDetail,
      pageTitle
    }
  }
})
</script>

<style></style>
