<template>
  <div class="analysisBox">
    <div class="contenBox" style="display: flex;justify-content: space-between;">
      <div class="title">{{pageTitle}}</div>
      <div class="header-btn">
        <RadioGroup v-model:value="searchObj.timeType" button-style="solid" @change="changeTime">
          <RadioButton value="ToDay">今日</RadioButton>
          <RadioButton value="ThisWeek">本周</RadioButton>
          <RadioButton value="ThisMonth">本月</RadioButton>
          <RadioButton value="ThisYear">今年</RadioButton>
        </RadioGroup>
        <RangePicker v-model:value="searchObj.period" show-time value-format="YYYY-MM-DD HH:mm:ss" :allow-clear="false"
          @ok="searchEvent" />
      </div>
    </div>
    <div class="Box">
      <div class="taskAnalysis">
        <div class="title">巡检任务分析</div>
        <Spin :spinning="inspectLoading.taskAnalysisSpinning">
          <div class="taskAnalysisBox">
            <div class="taskAnalysis-left">
              <div class="taskAnalysis-top">
                共<span class="blue1 textNum">{{ inspectionPlanAnalysisData?.patrolSchemeTotal }}</span>个巡检计划在正常使用中，其中<span
                  class="blue1">{{ inspectionPlanAnalysisData?.proportionOfPlanTypesVOS[0]?.planType
                  }}</span>的巡检计划最多，有<span class="blue1 textNum">{{
                  inspectionPlanAnalysisData?.proportionOfPlanTypesVOS[0]?.planNum }}</span>个
              </div>
              <div class="taskAnalysis-bottom" v-show="inspectionPlanAnalysisData?.proportionOfPlanTypesVOS &&  inspectionPlanAnalysisData?.proportionOfPlanTypesVOS.length > 0">
                <Bar :data="inspectionPlanAnalysisData?.proportionOfPlanTypesVOS" class="barChar" />
                <BarList :data="inspectionPlanAnalysisData?.proportionOfPlanTypesVOS" />
              </div>
              <div class="taskAnalysis-bottom" v-show="inspectionPlanAnalysisData?.proportionOfPlanTypesVOS.length == 0">
                <Empty />
              </div>
            </div>
            <div class="taskAnalysis-right">
              <div class="taskAnalysis-top">
                截止到目前，一共下发了<span class="blue1 textNum">{{ inspectionAnalysisData?.taskTotalNum }}</span>个巡检任务，环比下降了 <span
                  class="green1">{{ inspectionAnalysisData?.taskTotalNumRatio }}</span>;其中有<span class="blue1 textNum">{{
                  inspectionAnalysisData?.completeTaskNum }}</span>个任务正常执行完成，环比上升<span class="red1">{{
                  inspectionAnalysisData?.completeTaskNumRatio }}</span>;结果异常的有<span class="blue1 textNum">{{
                  inspectionAnalysisData?.abnormalTaskNum }}</span>个，环比下降<span class="green1">{{
                  inspectionAnalysisData?.abnormalTaskNumRatio }}</span>
              </div>
              <div class="taskAnalysis-bottom">
                <div class="contentBox">
                  <Pie :color="'#1AD598'" :data="inspectionAnalysisData?.periodTaskNumProportion" class="pieChar" />
                  <PieList :value="inspectionAnalysisData?.periodTaskNum" :name="'期间巡检占比'"
                    :ratio="inspectionAnalysisData?.completeTaskNumRatio" />
                </div>
                <div class="contentBox">
                  <Pie :color="'#1AD598'" :data="inspectionAnalysisData?.completeTaskNumProportion" class="pieChar" />
                  <PieList :value="inspectionAnalysisData?.completeTaskNum" :name="'已完成占比'"
                    :ratio="inspectionAnalysisData?.completeTaskNumRatio" />
                </div>
                <div class="contentBox">
                  <Pie :color="'#1890FF'" :data="inspectionAnalysisData?.abnormalTaskNumProportion" class="pieChar" />
                  <PieList :value="inspectionAnalysisData?.abnormalTaskNum" :name="'结果异常占比'"
                    :ratio="inspectionAnalysisData?.abnormalTaskNumRatio" />
                </div>
                <div class="contentBox">
                  <Pie :color="'#FE6BBA'" :data="inspectionAnalysisData?.expireTaskNumProportion" class="pieChar" />
                  <PieList :value="inspectionAnalysisData?.expireTaskNum" :name="'过期未执行占比'"
                    :ratio="inspectionAnalysisData?.expireTaskNumRatio" />
                </div>
              </div>
            </div>
          </div>
          <div class="taskAnalysis-top">
            截止到目前，一共下发了<span class="blue1 textNum">{{ inspectionsNumberData?.taskTotalNum }}</span>个巡检任务，覆盖对象有 <span
              class="blue1 textNum">{{ inspectionsNumberData?.objNum }}</span>个，对象覆盖率<span class="blue1 textNum">{{
              inspectionsNumberData?.objCoverageRate }}</span>环比下降<span class="blue1">{{
              inspectionsNumberData?.objCoverageRateRatio }}</span>，巡检次数共有<span class="blue1 textNum">{{
              inspectionsNumberData?.inspectionTotalNum }}</span>次，环比下降<span class="green1">{{
              inspectionsNumberData?.inspectionTotalNumRatio }}</span>
          </div>
          <!-- <PlateList /> -->
          <Line :x-data="inspectionNumDataList?.xData" :y-data1="inspectionNumDataList?.yData1"
            :y-data2="inspectionNumDataList?.yData2" class="lineChar" />
        </Spin>
      </div>
      <Spin :spinning="inspectLoading.performanceAnalysisSpinning">
        <div class="performanceAnalysis">
          <div class="title">任务执行分析</div>
          <PlateList style="margin-bottom: 12px;" :data="inspectPerformanceInfo" />
          <StackedColumn
            v-if="departmentTasks.departmentTasksxData.length"
           :x-data="departmentTasks.departmentTasksxData" :y-data="departmentTasks.departmentTasks"
            class="columBox" />
            <Empty v-if="!departmentTasks.departmentTasksxData.length"/>
          <div class="taskAnalysis-top" style="margin-bottom: 10px;">
            截止到目前，一共下发了<span class="blue1 textNum">{{ inspectPerformanceData?.totalTaskNum }}</span>个巡检任务，环比下降了 <span
              class="green1">{{ inspectPerformanceData?.totalTaskNumRatio }}</span>;其中:
          </div>
          <DepartmentStatus :data="departmentTasks.obj" />
          <div class="taskCharts">
            <barChart  :data="departmentTasksData.yData" :x-data="departmentTasksData.xData.slice(0,5)"
              :title="'部门巡检任务Top5'" />
            <barChart 
             :data="departmentTasksData.yData" :x-data="departmentTasksData.xData.slice(-5)"
              :title="'部门巡检任务last5'" />
          </div>
          <div class="taskAnalysis-top">
            截止到目前，在巡检一共花了<span class="blue1 textNum">{{ taskTimeConsumptionData.totalElapsedTime }}</span>个小时，环比下降 <span
              class="green1">{{ taskTimeConsumptionData?.totalElapsedTimeRatio }}</span>;其中有<span class="blue1 textNum">{{
              taskTimeConsumptionData.taskTypeTime[0]?.inspectionType }}</span>任务耗时最多，一共有<span class="blue1">{{
              taskTimeConsumptionData.taskTypeTime[0]?.taskTimeHour }}个小时</span>,环比上升<span class="red1">{{
              taskTimeConsumptionData.taskTypeTime[0]?.taskTimeRatio }}</span>，
            <span class="blue1 textNum">{{
              taskTimeConsumptionData.taskTypeTime[taskTimeConsumptionData.taskTypeTime.length-1]?.inspectionType
              }}</span>任务耗时最少，一共有
            <span class="blue1">{{
              taskTimeConsumptionData.taskTypeTime[taskTimeConsumptionData.taskTypeTime.length-1]?.taskTimeHour
              }}个小时</span>环比上升
            <span class="red1">{{
              taskTimeConsumptionData.taskTypeTime[taskTimeConsumptionData.taskTypeTime.length-1]?.taskTimeRatio }}</span>
          </div>
          <FoundationColumn :y-data="taskTimeConsumptionCharData.yData" :x-data="taskTimeConsumptionCharData.xData"
            class="columnBox" />
          <div class="taskAnalysis-top" style="margin-bottom: 10px;">
            截止到目前，一共下发了<span class="blue1 textNum">{{ analysisOfAuditResultsData.totalCheckTaskNum }}</span>个稽查任务，环比下降了
            <span class="green1">{{ analysisOfAuditResultsData.totalCheckTaskNumRatio }}</span>;其中：
          </div>
          <div class="inspectInfo">
            <div class="inspectInfo-left">
              <div class="inspectInfo-top">
                由 <span>{{
                  analysisOfAuditResultsData?.top5Match[0]?analysisOfAuditResultsData?.top5Match[0]?.dutyOfficer:'--'
                  }}</span> （人员姓名）负责的
                <span>{{ analysisOfAuditResultsData?.top5Match[0]?analysisOfAuditResultsData?.top5Match[0]?.taskName:'--'
                  }}</span> （任务名称）,稽查结果匹配率最高，稽查结果匹配率为
                <span class="blue1">{{
                  analysisOfAuditResultsData?.top5Match[0]?analysisOfAuditResultsData?.top5Match[0]?.matchRatio:'--'
                  }}</span>
              </div>
              <div class="tableTitle">稽查匹配率Top5</div>
              <Table :data-source="analysisOfAuditResultsData.top5Match" :columns="inspectInfoTable.columns"
                :pagination="false">
                <template #bodyCell="{column,index} ">
                  <template v-if="column.dataIndex==='index'">
                    <span v-if="index===0" class="ranking" :style="{background: '#F53F3F'}">{{ index+1 }}</span>
                    <span v-else-if="index===1" class="ranking" :style="{background: '#FBA33F'}">{{ index+1 }}</span>
                    <span v-else-if="index===3" class="ranking" :style="{background:'#3662EC'}">{{ index+1 }}</span>
                    <span v-else>{{ index+1 }}</span>
                  </template>
                </template>
              </Table>
            </div>
            <div class="inspectInfo-right">
              <div class="inspectInfo-top">
                由 <span>{{
                  analysisOfAuditResultsData?.last5Match[0]?analysisOfAuditResultsData?.last5Match[0]?.dutyOfficer:'--'
                  }}</span> （人员姓名）负责的
                <span>{{
                  analysisOfAuditResultsData?.last5Match[0]?analysisOfAuditResultsData?.last5Match[0]?.taskName:'--'
                  }}</span> （任务名称）,稽查结果匹配率最低，稽查结果匹配率为
                <span class="blue1">{{
                  analysisOfAuditResultsData?.last5Match[0]?analysisOfAuditResultsData?.last5Match[0]?.matchRatio:'--'
                  }}</span>
              </div>
              <div class="tableTitle">稽查匹配率Last5</div>
              <Table :data-source="analysisOfAuditResultsData.last5Match" :columns="inspectInfoTable.columns"
                :pagination="false">
                <template #bodyCell="{column,index} ">
                  <template v-if="column.dataIndex==='index'">
                    <span v-if="index===0" class="ranking" :style="{background: '#F53F3F'}">{{ index+1 }}</span>
                    <span v-else-if="index===1" class="ranking" :style="{background: '#FBA33F'}">{{ index+1 }}</span>
                    <span v-else-if="index===3" class="ranking" :style="{background:'#3662EC'}">{{ index+1 }}</span>
                    <span v-else>{{ index+1 }}</span>
                  </template>
                </template>
              </Table>
            </div>
          </div>
        </div>
      </Spin>
      <Spin :spinning="inspectLoading.PatrolObjectsSpinning">
        <div class="PatrolObjects">
          <div class="title">巡检对象分析</div>
          <div class="inspect_type">
            <div class="inspect_type_item" v-for="item in InspectCategoryData">
              <div class="inspect_type_item_title">{{ item.name }}</div>
              <div class="inspect_type_item_content" v-for="(details) in item.details">
                <template v-if="details.name==='inspection'">
                  <div>巡检次数：{{ details.num }}</div>
                  <div class="inspect_type_item_content_right">次数占比：{{ details.proportion }}</div>
                </template>
                <template v-else-if="details.name==='task'">
                  <div>任务数：{{ details.num }}</div>
                  <div class="inspect_type_item_content_right">任务数占比：{{ details.proportion }}</div>
                </template>
                <template v-else>
                  <div>异常次数：{{ details.num }}</div>
                  <div class="inspect_type_item_content_right">异常次数占比：{{ details.proportion }}</div>
                </template>
              </div>
            </div>
          </div>
          <div class="PatrolObjectsBox" style="margin-top: 24px;">
            <div class="PatrolObjectsList">
              <div class="taskAnalysis-top">
                在此期间，巡检次数一共 有<span class="blue1 textNum">{{ objectCountData?.totalInspectionNum }}</span>
                次，环比上升 <span class="red1">{{ objectCountData?.totalInspectionNumRatio }}</span>;
                其中<span class="blue1 textNum">{{ objectCountData?.maxNumObj }}</span>巡检次数最多有<span class="red1">{{
                  objectCountData?.maxNum }}</span>;
                次，环比下降<span class="blue1 textNum">{{ objectCountData?.maxNumRatio }}</span>，<span class="blue1">{{
                  objectCountData?.minNumObj }}</span>巡检次数最少，有
                <span class="blue1">{{ objectCountData?.minNum }}</span>次，环比<span class="blue1">{{
                  objectCountData?.minNumRatio }}</span>
              </div>
              <div style="text-align: right;">
                <Select v-model:value="patrolObjectsParame.timesNumber"
                  :get-popup-container="triggerNode => {return triggerNode.parentNode;}" placeholder="请选择类型"
                  style="width: 120px;" allow-clear @change="changePatroObjects('timesNumber')">
                  <SelectOption v-for="item in patrolObjectsParame.optionList" :key="item.id" :value="item.name">
                    <div style="text-align: center;">{{ item.name }}</div>
                  </SelectOption>
                </Select>
              </div>
              <barChart :title="'对象巡检次数Top10'" placeholder="请选择类型" :x-data="inspectionsNumber.xData"
                :data="[{color:'#1890FF' ,name:'', data:inspectionsNumber.yData}]" class="columnBox" />
            </div>
            <div class="PatrolObjectsList">
              <div class="taskAnalysis-top">
                在此期间，对象异常项一共有<span class="blue1 textNum">{{ abnormalItemData?.abnormalObjNum }}</span>个，环比下降 <span
                  class="blue1">{{ abnormalItemData?.abnormalObjNumRatio }}</span>
                ；其中 ，<span class="blue1 textNum">{{ abnormalItemData?.maxAbnormalObj }}</span>巡检异常项最多有<span
                  class="blue1 textNum">{{ abnormalItemData?.maxAbnormalObjNum }}</span>
                个，环比下降<span class="blue1 textNum">{{ abnormalItemData?.maxAbnormalObjNumRatio }}</span>;
                <span class="blue1 textNum">{{ abnormalItemData?.minAbnormalObj }}</span>巡检异常项最少，有
                <span class="blue1 textNum">{{ abnormalItemData?.minAbnormalObjNum }}</span>次，环比下降
                <span class="blue1 textNum">{{ abnormalItemData?.minAbnormalObjNumRatio }}
                </span>
              </div>
              <div style="text-align: right;">
                <Select v-model:value="patrolObjectsParame.abnormal"
                  :get-popup-container="triggerNode => {return triggerNode.parentNode;}" placeholder="请选择类型"
                  style="width: 120px;" allow-clear @change="changePatroObjects('abnormal')">
                  <SelectOption v-for="item in patrolObjectsParame.optionList" :key="item.id" :value="item.name">
                    <div style="text-align: center;">{{ item.name }}</div>
                  </SelectOption>
                </Select>
              </div>
              <barChart  :title="'对象异常项数排名Top10'" :x-data="abnormalItemEchar.xData"
                :data="[{color:'#FBA33F' ,name:'', data:abnormalItemEchar.yData}]" class="columnBox" />
              </div>
          </div>
          <div class="taskAnalysis-top" style="margin-bottom: 20px;">
            在此期间，巡检任务一共<span class="blue1 textNum">{{ objectAnalysisData?.inspectionTaskTotalNum }}</span>个，其中针对
            <span class="blue1 textNum">{{ objectAnalysisData?.maxTaskNumObj }}</span>下发的巡检任务数最多，有
            <span class="blue1 textNum">{{ objectAnalysisData?.maxTaskNum }}</span>个，环比下降<span class="red1">{{
              objectAnalysisData?.maxTaskNumRatio }}</span>
            针对<span class="blue1 textNum">{{ objectAnalysisData?.minTaskNumObj }}</span>下发的巡检任务数最少，有
            <span class="blue1">{{ objectAnalysisData?.minTaskNum }}</span>个，环比下降<span class="blue1">{{
              objectAnalysisData?.minTaskNumRatio }}</span>
          </div>
          <div class="PatrolObjectsBox">
            <div class="PatrolObjectsList">
              <div style="text-align: right;">
                <Select v-model:value="patrolObjectsParame.taskNumberTop"
                  :get-popup-container="triggerNode => {return triggerNode.parentNode;}" placeholder="请选择类型"
                  style="width: 120px;" allow-clear @change="changePatroObjects('taskNumberTop')">
                  <SelectOption v-for="item in patrolObjectsParame.optionList" :key="item.id" :value="item.name">
                    <div style="text-align: center;">{{ item.name }}</div>
                  </SelectOption>
                </Select>
              </div>
              <barChart  :title="'对象巡检任务数Top10'" :x-data="inspectionTasksEcahr.xData"
                :data="[{color:'#5654F5' ,name:'', data:inspectionTasksEcahr.yData}]" class="columnBox" />
              </div>
            <div class="PatrolObjectsList">
              <div style="text-align: right;">
                <Select v-model:value="patrolObjectsParame.taskNumberLast"
                  :get-popup-container="triggerNode => {return triggerNode.parentNode;}" placeholder="请选择类型"
                  style="width: 120px;" allow-clear @change="changePatroObjects('taskNumberLast')">
                  <SelectOption v-for="item in patrolObjectsParame.optionList" :key="item.id" :value="item.name">
                    <div style="text-align: center;">{{ item.name }}</div>
                  </SelectOption>
                </Select>
              </div>
              <barChart  :title="'对象巡检任务数Last10'" :x-data="inspectionTaskLastEcahr.xData"
                :data="[{color:'#FD683E' ,name:'', data:inspectionTaskLastEcahr.yData}]" class="columnBox" />
            </div>
          </div>
          <!-- <div class="title">
            此期间没有巡检任务的对象
          </div> -->
          <!-- <Table :data-source="noInspectionTaskTable.tableData" :columns="noInspectionTaskTable.columns"
            :pagination="false" />
          <Pagination v-model:current="noInspectionTaskTable.current" style="    text-align: right;
    margin-top: 10px;" :total="noInspectionTaskTable.total" :show-size-changer="false" @change="noInspectionTask" /> -->
        </div>
      </Spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import type { TableColumnsType } from 'ant-design-vue'
import Bar from '../public/echar/bar.vue'
import BarList from '../public/components/bar-list.vue'
import Pie from '../public/echar/pie.vue'
import PieList from '../public/components/pie-list.vue'
import Line from '../public/echar/line.vue'
import DepartmentStatus from '../public/components/department-status.vue'
import barChart from '../public/echar/bar-chart.vue'
import PlateList from '../public/components/plate-list.vue'
import StackedColumn from '../public/echar/stacked-column.vue'
import FoundationColumn from '../public/echar/foundation-column.vue'
import { usePageName } from '@ghcloud/cube-utils'
import type {
  TaskTypeTime, NotHaveTaskAnalysisObj, ObjInspectionNumTop, InspectionObjAbnormalAnalysis,
  InspectionObjAnalysis, InspectionObjTaskAnalysis, AnalysisOfAuditResults, TaskTimeAnalysis, DepTaskExecutionAnalysis,
  TaskExecutionAnalysis, AddDepTask,
  InspectionTasksType, PatrolSchemeType, InspectionsNumber, TrendOfInspectionTimesVOS
  } from '@/api/model/inspection'
import {
  notHaveTaskAnalysisObj, objInspectionTaskLast, objInspectionTaskTop, objAbnormalNumTop,
  objInspectionNumTop, inspectionObjAbnormalAnalysis,
  inspectionObjAnalysis, inspectionObjTaskAnalysis, analysisOfAuditResults, taskTimeAnalysis,
  inspectionTaskAnalysis, inspectionPlanAnalysis,
  inspectionFrequencyAnalysis, taskExecutionAnalysis, depTaskExecutionAnalysis,getTargetCategory
} from '@/api/inspection'

interface QueryResult {
  timeType?: string;
  period: [Dayjs, Dayjs] | [string, string];
}
interface InspectTab {
  columns: TableColumnsType;
}
const { pageTitle } = usePageName()
const searchObj = reactive<QueryResult>({
  period: [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')],
  timeType: 'ToDay'
})
// 巡检任务分析
const inspectionAnalysisData = ref<InspectionTasksType | null>()
// 巡检计划分析
const inspectionPlanAnalysisData = ref<PatrolSchemeType | null>()
// 巡检次数
const inspectionsNumberData = ref<InspectionsNumber | null>()
const inspectionNumDataList = reactive<{ xData: string[] | undefined; yData1: number[] | undefined; yData2: number[] | undefined; }>({
  xData: ['0'],
  yData1: [0],
  yData2: [0]
})
// 任务执行分析
const inspectPerformanceInfo = reactive<{ value: number;name: string; }[]>([])
const inspectPerformanceData = ref<TaskExecutionAnalysis>()
// 板块loading
const inspectLoading = reactive({
  taskAnalysisSpinning: false,
  performanceAnalysisSpinning: false,
  PatrolObjectsSpinning: false
})
// 部门任务完成情况
interface DepartmentTasksType {
  name: string;
  data: string[];
  color: string;
}
const departmentTasks = reactive<{ obj?: DepTaskExecutionAnalysis | null;departmentTasksxData: string[];departmentTasks: DepartmentTasksType[]; }>(
  {
    departmentTasksxData: [],
    departmentTasks: []
  })
const departmentTasksData = reactive<{ xData: string[];yData: { name: string;color: string;data: string[]; }[]; }>({
  xData: ['0'],
  yData: [{
    name: '',
    color: '',
    data: ['']
  }]
})
// 任务耗时
const taskTimeConsumptionData = reactive<TaskTimeAnalysis>({
  totalElapsedTime: 0,
  totalElapsedTimeRatio: '0',
  taskTypeTime: [{
    inspectionType: '',
    typeId: '',
    taskTimeRatio: '',
    taskTime: 0,
    taskTimeHour: ''
  }]
})
const taskTimeConsumptionCharData = reactive<{ xData: string[];yData: string[]; }>({
  xData: [],
  yData: []
})
// 稽查结果分析
const analysisOfAuditResultsData = reactive<AnalysisOfAuditResults>({
  totalCheckTaskNum: 0,
  totalCheckTaskNumRatio: '',
  top5Match: [
    {
      taskName: '',
      releaseTime: '',
      dutyOfficer: '',
      matchRatio: '',
      notMatchNum: ''
    }
  ],
  last5Match: [
    {
      taskName: '',
      releaseTime: '',
      dutyOfficer: '',
      matchRatio: '',
      notMatchNum: ''
    }
  ]
})
// 对象巡检任务分析
const objectAnalysisData = reactive<InspectionObjTaskAnalysis>({
  inspectionTaskTotalNum: 0,
  maxTaskNumObj: '',
  maxTaskNum: '',
  maxTaskNumRatio: '',
  minTaskNumObj: '',
  minTaskNumRatio: '',
  minTaskNum: ''
})
// 对象巡检任务分析
const objectCountData = reactive<InspectionObjAnalysis>({
  totalInspectionNum: 0,
  maxNum: 0,
  minNum: 0,
  totalInspectionNumRatio: '',
  maxNumObj: '',
  maxNumRatio: '',
  minNumObj: '',
  minNumRatio: ''
})
// 对象异常巡检任务分析
const abnormalItemData = reactive<InspectionObjAbnormalAnalysis>({
  abnormalObjNum: 0,
  maxAbnormalObjNum: 0,
  minAbnormalObjNum: 0,
  abnormalObjNumRatio: '',
  maxAbnormalObj: '',
  maxAbnormalObjNumRatio: '',
  minAbnormalObj: '',
  minAbnormalObjNumRatio: ''
})
// 巡检次数ecahr
const inspectionsNumber = reactive<{ xData: string[] | undefined;yData: number[] | undefined; }>({
  xData: [],
  yData: []
})
// 巡检对象分析统计
const InspectCategoryData:any = ref([])
// 巡检异常ecahr
const abnormalItemEchar = reactive<{ xData: string[] | undefined;yData: number[] | undefined; }>({
  xData: [],
  yData: []
})
// 对象巡检任务数top10
const inspectionTasksEcahr = reactive<{ xData: string[] | undefined;yData: number[] | undefined; }>({
  xData: [],
  yData: []
})
// 对象巡检任务数last10
const inspectionTaskLastEcahr = reactive<{ xData: string[] | undefined;yData: number[] | undefined; }>({
  xData: [],
  yData: []
})
// 巡检对象查询参数
const patrolObjectsParame = reactive({
  timesNumber: undefined,
  abnormal: undefined,
  taskNumberTop: undefined,
  taskNumberLast: undefined,
  optionList: [
    { id: 'DEVICE', name: '设备' },
    { id: 'STALL', name: '档位' },
    { id: 'PROPERTY', name: '资产' },
    { id: 'SITE_POINT', name: '现场点' },
  ]
})
const inspectInfoTable = reactive<InspectTab>({
  columns: [
    {
      title: '排名',
      dataIndex: 'index',
      align: 'center'
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '任务发布时间',
      dataIndex: 'releaseTime',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '责任人',
      dataIndex: 'dutyOfficer',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '稽查结果匹配率',
      dataIndex: 'matchRatio',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '不匹配项数',
      dataIndex: 'notMatchNum',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    }
  ]
})
const noInspectionTaskTable = reactive<{ tableData: NotHaveTaskAnalysisObj[];columns: TableColumnsType;current: number;total: number; }>({
  tableData: [],
  columns: [
    {
      title: '对象名称',
      dataIndex: 'objName',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '对象类型',
      dataIndex: 'objType',
      align: 'center',
      customRender: ({ text }) => {
        if (text === 'DEVICE') {
          return '设备'
        } else if (text === 'STALL') {
          return '档位'
        } else if (text === 'PROPERTY') {
          return '资产'
        } else {
          return '-'
        }
      }
    },
    {
      title: '所在区域',
      dataIndex: 'area',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '所属部门',
      dataIndex: 'belongDep',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    },
    {
      title: '最近一次巡检时间',
      dataIndex: 'lastInspectionTime',
      align: 'center',
      customRender: ({ text }) => {
        return text || '-'
      }
    }
  ],
  current: 1,
  total: 0
})

// 巡检任务分析
const getTaskAnalysis = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionTaskAnalysis({ period: timeArr.join(',') })
  inspectionAnalysisData.value = data
}
// 巡检任务分析
const getPlanAnalysis = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionPlanAnalysis({ period: timeArr.join(',') })
  inspectionPlanAnalysisData.value = data
}
// 巡检次数
const getinspectNum = async () => {
  inspectionNumDataList.xData = []
  inspectionNumDataList.yData1 = []
  inspectionNumDataList.yData2 = []
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionFrequencyAnalysis({ period: timeArr.join(',') })
  inspectionsNumberData.value = data
  inspectionsNumberData.value?.trendOfInspectionTimesVOS.forEach((element: TrendOfInspectionTimesVOS) => {
    inspectionNumDataList.xData?.push(element.abscissa)
    inspectionNumDataList.yData1?.push(element.taskNum)
    inspectionNumDataList.yData2?.push(element.numberOfInspection)
  })
}
// 任务执行分析
const getPerformanceAnalysis = async () => {
  inspectPerformanceInfo.length = 0
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await taskExecutionAnalysis({ period: timeArr.join(',') })
  inspectPerformanceData.value = data
  const title: any = {
    totalTaskNum: '任务总数（个）',
    overTimeTaskNum: '超时完成任务数（个）',
    expiredTaskNum: '过期未执行任务数',
    abnormalTaskNum: '结果异常任务数'
  }
  for (const key in data) {
    key !== 'totalTaskNumRatio' && inspectPerformanceInfo.push({
      value: data[key],
      name: title[key]
    })
  }
}
// 部门任务完成情况
const departmentTaskSituation = async () => {
  departmentTasksData.xData.length = 0
  departmentTasksData.yData.length = 0
  departmentTasks.departmentTasks = []
  departmentTasks.departmentTasksxData = []
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await depTaskExecutionAnalysis({ period: timeArr.join(',') })
  departmentTasks.obj = data
  const completeTaskNum: string[] = []
  const totalTaskNum: string[] = []
  const overTimeTaskNum: string[] = []
  const expireTaskNum: string[] = []
  data?.addDepTask.forEach((item: AddDepTask) => {
    departmentTasksData.xData.push(item.depName)
    departmentTasks.departmentTasksxData.push(item.depName)
    completeTaskNum.push(item.completeTaskNum)
    totalTaskNum.push(item.totalTaskNum)
    expireTaskNum.push(item.expireTaskNum)
    overTimeTaskNum.push(item.overTimeTaskNum)
  })
  departmentTasksData.yData = [{
    name: '已完成任务数',
    color: '#1AD598',
    data: completeTaskNum
  }, {
    name: '任务数',
    color: '#1890FF',
    data: totalTaskNum
  }]
  departmentTasks.departmentTasks = [
    {
      name: '任务总数',
      data: totalTaskNum,
      color: '#1AD598'
    },
    {
      name: '正常完成任务数',
      data: completeTaskNum,
      color: '#1890FF'
    },
    {
      name: '超时完成任务数',
      data: overTimeTaskNum,
      color: '#FBA33F'
    },
    {
      name: '过期未执行数',
      data: expireTaskNum,
      color: '#FBA33F'
    }
  ]
}
// 任务耗时分析
const taskTimeConsumption = async () => {
  taskTimeConsumptionCharData.xData = []
  taskTimeConsumptionCharData.yData = []
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await taskTimeAnalysis({ period: timeArr.join(',') })
  data?.taskTypeTime.forEach((item: TaskTypeTime) => {
    item.taskTime && taskTimeConsumptionCharData.xData.push(item.inspectionType)
    item.taskTime && taskTimeConsumptionCharData.yData.push(item.taskTimeHour)
  })

  Object.assign(taskTimeConsumptionData, data)
}
// 稽查结果分析
const auditAnalysis = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await analysisOfAuditResults({ period: timeArr.join(',') })
  Object.assign(analysisOfAuditResultsData, data)
}
// 对象巡检任务分析
const objectAnalysis = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionObjTaskAnalysis({ period: timeArr.join(',') })
  Object.assign(objectAnalysisData, data)
}
// 对象巡检任务分析
const objectCount = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionObjAnalysis({ period: timeArr.join(',') })
  Object.assign(objectCountData, data)
}
// 对象异常巡检任务分析
const abnormalAnalysis = async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await inspectionObjAbnormalAnalysis({ period: timeArr.join(',') })
  Object.assign(abnormalItemData, data)
}
// 对象巡检次数top10
const getInspectionNumTop = async () => {
  if (inspectionsNumber.xData && inspectionsNumber.yData) {
    inspectionsNumber.xData.length = 0
    inspectionsNumber.yData.length = 0
  }
  const objType = patrolObjectsParame.timesNumber ? patrolObjectsParame.optionList.filter(item => item.name === patrolObjectsParame.timesNumber)[0].id : ''
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await objInspectionNumTop({ period: timeArr.join(','), objType })
  inspectionsNumber.xData = data?.map((item: ObjInspectionNumTop) => {
    return item.objName
  })
  inspectionsNumber.yData = data?.map((item: ObjInspectionNumTop) => {
    return item.inspectionNum
  })
}
// 对象异常巡检次数top10
const getAbnormalItemNumTop = async () => {
  if (abnormalItemEchar.xData && abnormalItemEchar.yData) {
    abnormalItemEchar.xData.length = 0
    abnormalItemEchar.yData.length = 0
  }
  const objType = patrolObjectsParame.abnormal ? patrolObjectsParame.optionList.filter(item => item.name === patrolObjectsParame.abnormal)[0].id : ''
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await objAbnormalNumTop({ period: timeArr.join(','), objType })
  abnormalItemEchar.xData = data?.map((item: ObjInspectionNumTop) => {
    return item.objName
  })
  abnormalItemEchar.yData = data?.map((item: ObjInspectionNumTop) => {
    return item.inspectionNum
  })
}
// 对象巡检任务数top10
const inspectionTaskTop = async () => {
  if (inspectionTasksEcahr.xData && inspectionTasksEcahr.yData) {
    inspectionTasksEcahr.xData.length = 0
    inspectionTasksEcahr.yData.length = 0
  }
  const objType = patrolObjectsParame.taskNumberTop ? patrolObjectsParame.optionList.filter(item => item.name === patrolObjectsParame.taskNumberTop)[0].id : ''
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await objInspectionTaskTop({ period: timeArr.join(','), objType })
  inspectionTasksEcahr.xData = data?.map((item: ObjInspectionNumTop) => {
    return item.objName
  })
  inspectionTasksEcahr.yData = data?.map((item: ObjInspectionNumTop) => {
    return item.inspectionNum
  })
}
// 对象巡检任务数last10
const inspectionTasksLast = async () => {
  if (inspectionTaskLastEcahr.xData && inspectionTaskLastEcahr.yData) {
    inspectionTaskLastEcahr.xData.length = 0
    inspectionTaskLastEcahr.yData.length = 0
  }
  const objType = patrolObjectsParame.taskNumberLast ? patrolObjectsParame.optionList.filter(item => item.name === patrolObjectsParame.taskNumberLast)[0].id : ''
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const { data } = await objInspectionTaskLast({ period: timeArr.join(','), objType })
  inspectionTaskLastEcahr.xData = data?.map((item: ObjInspectionNumTop) => {
    return item.objName
  })
  inspectionTaskLastEcahr.yData = data?.map((item: ObjInspectionNumTop) => {
    return item.inspectionNum
  })
}
// 此期间没有巡检任务的对象
const noInspectionTask = async () => {
  // noInspectionTaskTable.tableData = []
  // const timeArr = searchObj.period.map((item: Dayjs | string) => {
  //   return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  // })
  // const { data } = await notHaveTaskAnalysisObj({ period: timeArr.join(','), pageNumber: noInspectionTaskTable.current })
  // if (data) {
  //   noInspectionTaskTable.tableData = data.records
  //   noInspectionTaskTable.total = data.total
  // }
}
// 修改巡检对象类型
const changePatroObjects = async (val: string) => {
  if (val === 'timesNumber') {
    await getInspectionNumTop()
  } else if (val === 'abnormal') {
    await getAbnormalItemNumTop()
  } else if (val === 'taskNumberTop') {
    await inspectionTaskTop()
  } else {
    await inspectionTasksLast()
  }
  noInspectionTask()
}
const getInspectCategory =async () => {
  const timeArr = searchObj.period.map((item: Dayjs | string) => {
    return item ? dayjs(item).format('YYYY-MM-DD HH:mm:ss') : ''
  })
  const res = await getTargetCategory({ period: timeArr.join(',') })
  const obj = {
    "DEVICE":'设备巡检',
    "PROPERTY":'资产巡检',
    "STALL":'档位巡检',
    "SITE_POINT":'现场点巡检',
    "RISK_SOURCE":'风险源巡检',
    "SMALL_ENGINEERING":'小散工程',
  }
  res?.data.forEach((item: { name: any; targetCategory: string | number })=>{
    item.name = obj[item.targetCategory]
  })
  InspectCategoryData.value = res.data
}
// 搜索
const searchEvent = async () => {
  // inspectLoading.taskAnalysisSpinning = true;
  // inspectLoading.performanceAnalysisSpinning = true;
  // inspectLoading.PatrolObjectsSpinning = true;
  await getPerformanceAnalysis()
  await departmentTaskSituation()
  await taskTimeConsumption()
  await auditAnalysis()
  await objectAnalysis()
  await objectCount()
  await getInspectCategory()
  inspectLoading.performanceAnalysisSpinning = false
  await abnormalAnalysis()
  await getInspectionNumTop()
  await getAbnormalItemNumTop()
  await inspectionTaskTop()
  await inspectionTasksLast()
  await noInspectionTask()
  inspectLoading.PatrolObjectsSpinning = false
  await getTaskAnalysis()
  await getPlanAnalysis()
  await getinspectNum()
  inspectLoading.taskAnalysisSpinning = false
}
// 切换时间
const changeTime = () => {
  switch (searchObj.timeType) {
    case 'ToDay':
      searchObj.period = [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
      break
  case 'ThisWeek':
      searchObj.period = [dayjs().startOf('week'), dayjs()]
      break
  case 'ThisMonth':
      searchObj.period = [dayjs().startOf('month'), dayjs()]
      break
  case 'ThisYear':
      searchObj.period = [dayjs().startOf('year'), dayjs()]
      break
  default:
      break
  }
  searchEvent()
}

onMounted(() => {
  searchEvent()
})
</script>
<style scoped lang="less">
.contenBox {
  background: #fff;
  width: 100%;
  z-index: 10;
  margin-bottom: 10px;
  padding-right: 10px;
  align-items: center;
}

.title {
  height: 56px;
  font-size: 16px;
  color: #333;
  padding: 17px;
  font-weight: bold;
  border-bottom: 1px solid #F3F3F3;
}

.Box {
  width: 100%;
  background-color: #EEF2F5;
  position: relative;
  height: calc(100vh - 230px);
  overflow-y: scroll;

}

.analysisBox {
  background-color: #EEF2F5;
  position: relative;
  width: 100%;

  .header-btn {
    right: 20px;
    background: #fff;

    :deep(.inspection-radio-group) {
      margin-right: 10px;

      .inspection-radio-button-wrapper {
        margin-right: 10px;
      }
    }
  }

  .taskAnalysis {
    background-color: #fff;
    border-radius: 6px;
    padding: 16px;
    width: 100%;
    overflow-x: scroll;

    .taskAnalysisBox {
      display: flex;

      .taskAnalysis-left {
        width: 580px;
      }

      .taskAnalysis-right {
        flex: 1;
        margin-left: 20px;
      }
    }

    .taskAnalysis-bottom {
      padding: 0 50px;
      display: flex;

      .barChar {
        width: 190px;
        height: 159px;
        margin-right: 30px;
      }

      .pieChar {
        width: 160px;
        height: 160px;
      }

      .contentBox {
        display: flex;
        align-items: center;
      }
    }
  }

}

.lineChar {
  margin-top: 10px;
  height: 260px;
}

.taskAnalysis-top {
  min-height: 56px;
  background: #FCFCFC;
  border-radius: 6px;
  padding: 16px;
}

.performanceAnalysis {
  margin-top: 10px;
  background-color: #fff;
  border-radius: 6px;
  padding: 16px;

  .inspectInfo {
    .inspectInfo-top {
      min-height: 64px;
      background: linear-gradient(50deg, #F7FAFF 0%, rgba(245, 249, 255, 0.22) 37%, #F7FAFF 100%);
      border-radius: 6px;
      padding: 10px 16px;
      margin-bottom: 12px;
    }

    display: flex;
    justify-content: space-between;

    .inspectInfo-left,
    .inspectInfo-right {
      width: 710px;
    }
  }
}

.PatrolObjects {
  margin-top: 10px;
  background-color: #fff;
  border-radius: 6px;
  padding: 16px;
  .inspect_type{
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .inspect_type_item{
      padding: 10px;
      width: 280px;
      border: 1px solid;
      .inspect_type_item_title{
        font-size: 16px;
        font-weight: bold;
      }
      .inspect_type_item_content{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        .inspect_type_item_content_right{
          min-width: 150px;
          text-align: left;
        }
      }
    }
  }

  .PatrolObjectsBox {
    display: flex;
    justify-content: space-between;

    .taskAnalysis-top {
      margin-bottom: 20px;
    }

    .PatrolObjectsList {
      width: 820px;
      position: relative;

      .selectBox {
        position: absolute;
        position: absolute;
        right: 0;
        top: 66px;
      }
    }
  }
}

.columBox {
  height: 260px;
}

.blue1 {
  color: #1890FF;
}

.green1 {
  color: #2FC539;
}

.red1 {
  color: #E64141;
}

.textNum {
  font-size: 16px;
}

.taskCharts {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 250px;
}

.columnBox {
  height: 260px;
}

.ringRatio {
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}

.ranking {
  width: 24px;
  height: 24px;
  display: inline-block;
  border-radius: 50%;
  color: #fff;
  line-height: 24px;
}

.tableTitle {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 10px 0;
}

:deep(.inspection-select-selection-item) {
  text-align: left;
}
</style>
