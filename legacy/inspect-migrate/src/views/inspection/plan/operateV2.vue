<template>
  <div ref="ctr" class="ctr">
    <g-layout :title="type === 'edit'
      ? '编辑巡检计划'
      : type === 'detail'
        ? '巡检计划详情'
        : '新增巡检计划'
      ">
      <template #content-table>
        <div class="detail-form">
          <div class="basic-info">
            <div class="basic-title">基础信息</div>
            <a-form ref="form" :model="model" layout="inline" :rules="type !== 'detail' ? rules : null" id="mainForm">
              <template v-if="type !== 'detail'">
                <a-form-item label="计划名称" name="name">
                  <a-input @change="repeatName" v-model:value.trim="model.name" placeholder="请输入巡检计划名称"></a-input>
                </a-form-item>
                <a-form-item label="巡检类型" name="typeId">
                  <g-select v-model:value="model.typeId" :placeholder="'请选择巡检类型'" :url="'inspectTypeList'"
                    :field="{ name: 'label', id: 'value' }" @change-check="changeLabel"></g-select>
                </a-form-item>
                <a-form-item label="巡检级别" name="typeId">
                  <g-select v-model:value="model.level" :placeholder="'请选择任务级别'" :field="{ name: 'label', id: 'value' }"
                    :options="[{ name: '普通', id: 'GENERAL' }, { name: '紧急', id: 'URGENT' },]"></g-select>
                </a-form-item>
                <a-form-item label="计划生效时间" name="beginTime">
                  <a-date-picker :style="{ width: '100%' }" v-model:value="model.beginTime" :showTime="true"
                    :format="format" :valueFormat="format"></a-date-picker>
                </a-form-item>
                <a-form-item label="计划失效时间" name="endTime">
                  <a-date-picker :style="{ width: '100%' }" v-model:value="model.endTime" :showTime="true"
                    :format="format" :valueFormat="format"></a-date-picker>
                </a-form-item>
                <a-form-item label="任务有效期" name="limitTimeJson">
                  <a-form class="timeLimitForm" layout="inline" ref="timeLimitForm" :model="model.timeLimitModel"
                    :rules="timeLimitRules" :style="{ width: '100%', maxWidth: '300px' }">
                    <a-form-item label="" name="day">
                      <a-input v-model:value.trim="model.timeLimitModel.day" :style="{ width: '100% !important' }"
                        :addonAfter="'天'" placeholder="请输入天" :maxlength="3"></a-input>
                    </a-form-item>
                    <a-form-item label="" name="hour" class="pl1">
                      <a-input v-model:value.trim="model.timeLimitModel.hour" :style="{ width: '100% !important' }"
                        :addonAfter="'时'" placeholder="请输入时" :maxlength="2"></a-input>
                    </a-form-item>
                    <a-form-item label="" name="minute" class="pl1">
                      <a-input v-model:value.trim="model.timeLimitModel.minute" :style="{ width: '100% !important' }"
                        :addonAfter="'分'" placeholder="请输入分" :maxlength="2"></a-input>
                    </a-form-item>
                  </a-form>
                </a-form-item>

                <a-form-item label="责任人" name="receiveTypeRule">
                  <a-input-group compact="compact" :style="{ width: '100%', maxWidth: '300px' }">
                    <div class="formBtnCtr">
                      <a-button @click="receive('2')" :type="model.receiveType === '2' ? 'primary' : 'default'">部门
                      </a-button>
                      <a-button @click="receive('1')" :type="model.receiveType === '1' ? 'primary' : 'default'">人员
                      </a-button>
                    </div>
                    <div v-if="model.receiveType === '1'" :style="{ width: 'calc(100% - 130px)' }">
                      <userSelect class="single pl1" :style="{ width: '100% !important' }"
                        v-model:value="model.receiveIds" :mode="'multiple'" :showSearch="true"
                        :placeholder="'责任人'" :showArrow="true" @change-check="recieveChange"
                        :params="{ pageSize: 100, pageNumber: 1, enabled: true }"></userSelect>
                    </div>

                    <div class="single" v-else :style="{ width: 'calc(100% - 130px)' }">
                      <a-select class="pl1" @change="recieveChange" v-model:value="model.receiveDeptIds"
                        optionFilterProp='label' show-search :options="deptListData" allowClear
                        :style="{ width: '100% !important'}" placeholder="部门" />
                      <a-select class="pl1" @change="recieveChange" v-model:value="model.receivePostIds"
                        optionFilterProp='label' show-search :options="positionData" allowClear
                        :style="{ width: '100% !important'}" placeholder="岗位" />
                      <a-select class="pl1" @change="recieveChange" v-model:value="model.receiveRoleIds"
                        optionFilterProp='label' show-search :options="rolesListData" allowClear
                        :style="{ width: '100% !important'}" placeholder="角色" />
                    </div>
                  </a-input-group>
                </a-form-item>
                <a-form-item label="稽查人" v-if="model.isCheck" name="inspectTypeRule">
                  <a-input-group compact="compact" :style="{ width: '100%', maxWidth: '300px' }">
                    <div class="formBtnCtr">
                      <a-button :disabled="!model.isCheck" @click="model.checkUserType = '2'"
                        :type="model.checkUserType === '2' ? 'primary' : 'default'">部门
                      </a-button>
                      <a-button :disabled="!model.isCheck" @click="model.checkUserType = '1'"
                        :type="model.checkUserType === '1' ? 'primary' : 'default'">人员
                      </a-button>
                    </div>
                    <div v-if="model.checkUserType === '1'" :style="{ width: 'calc(100% - 130px)' }">
                      <userSelect :disabled="!model.isCheck" class="single pl1" :style="{ width: '100% !important' }"
                        v-model:value="model.checkUserIds" :mode="'multiple'" :showSearch="true"
                        :placeholder="'稽查人'" :showArrow="true" @change-check="checkChange"
                        :params="{ pageSize: 100, pageNumber: 1, enabled: true }"></userSelect>
                    </div>

                    <div class="single" v-else :style="{ width: 'calc(100% - 130px)' }">
                      <a-select class="pl1" @change="checkChange" v-model:value="model.receiveDeptIds"
                        optionFilterProp='label' show-search :options="deptListData" allowClear
                        :style="{ width: '100% !important'}" placeholder="部门" />
                      <a-select class="pl1" @change="checkChange" v-model:value="model.receivePostIds"
                        optionFilterProp='label' show-search :options="positionData" allowClear
                        :style="{ width: '100% !important'}" placeholder="岗位" />
                      <a-select class="pl1" @change="checkChange" v-model:value="model.receiveRoleIds"
                        optionFilterProp='label' show-search :options="rolesListData" allowClear
                        :style="{ width: '100% !important'}" placeholder="角色" />
                    </div>
                  </a-input-group>
                </a-form-item>
                <!-- <a-form-item label="计划状态" name="enable">
                    <a-switch v-model:checked="model.enable" un-checked-children="禁用" checked-children="启用"></a-switch>
                  </a-form-item> -->
                <a-form-item label="是否需要拆解任务" name="isSplit">
                  <a-switch v-model:checked="model.isSplit" un-checked-children="禁用" checked-children="启用"></a-switch>
                </a-form-item>
                <a-form-item label="是否需要稽查" name="isCheck">
                  <a-switch v-model:checked="model.isCheck" un-checked-children="禁用" checked-children="启用"></a-switch>
                </a-form-item>
                <a-form-item label="扫码巡检" name="method">
                  <a-switch v-model:checked="model.method" checkedValue="SCAN_CODE" unCheckedValue=""
                    un-checked-children="关闭" checked-children="开启"></a-switch>
                </a-form-item>
                <a-form-item v-if="model.isCheck">
                </a-form-item>
                <a-form-item label="任务生成时间" name="cycle">
                  <div class="cycle-box cycle-item">
                    <a-input-group style="width: 150px">
                      <div class="formBtnCtr">
                        <a-button @click="cycleBtn(false)"
                          :type="model.cycle == false ? 'primary' : 'default'">立即</a-button>
                        <a-button @click="cycleBtn(true)"
                          :type="model.cycle == true ? 'primary' : 'default'">循环</a-button>
                      </div>
                    </a-input-group>
                    <div class="cycle-box">
                      <g-select class="cycle pl1" v-if="model.cycle && cycleOptions.length" v-model:value="model.cronId"
                        :options="cycleOptions" :placeholder="'请选择计划周期'" @change-check="recieveChangeTask"
                        :field="{ name: 'label', id: 'value' }"></g-select>
                      <div class="cycle-box"
                        v-if="(model.cronId === 'custom' || cycleOptions.length === 0) && model.cycle">
                        <g-select class="cycle pl1" @change-check="model.selection = null"
                          v-model:value="model.cycleType" :options="executeCycle" :placeholder="'请选择执行周期'"
                          :field="{ label: 'label', value: 'value' }"></g-select>
                        <g-select mode="multiple" class="cycle pl1" v-if="model.cycleType === 'EVERY_WEEK'"
                          v-model:value="model.selection" :field="{ label: 'label', value: 'value' }"
                          :options="weekCycle" :placeholder="'请选择日期'"></g-select>
                        <g-select mode="multiple" class="cycle pl1" v-if="model.cycleType === 'EVERY_MONTH'"
                          v-model:value="model.selection" :field="{ label: 'label', value: 'value' }"
                          :options="monthCycle" :placeholder="'请选择日期'"></g-select>
                        <a-time-picker valueFormat="HH:mm" v-model:value="model.hour" format="HH:mm"
                          defaultValue="12:00" />
                      </div>
                    </div>
                  </div>
                </a-form-item>
                <a-form-item class="a-form-item-100" label="备注" name="remark" v-bind="textLayout"
                  :style="{ marginBottom: '20px' }">
                  <a-textarea maxlength="200" v-model:value="model.remark" placeholder="请输入备注" :showCount="true"
                    :autoSize="{ minRows: 2, maxRows: 8 }"></a-textarea>
                </a-form-item>
              </template>
              <template v-else>
                <a-form-item label="计划名称" name="name"><span>{{ model.name ? model.name : "--" }}</span></a-form-item>
                <a-form-item label="巡检类型" name="typeName">
                  <span>{{ model.typeName ? model.typeName : "--" }} </span>
                </a-form-item>
                <a-form-item label="计划生效时间" name="beginTime">
                  <span>
                    {{
                    model.beginTime ? timeFormat(model.beginTime, true) : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="计划失效时间" name="endTime">
                  <span>
                    {{ model.endTime ? timeFormat(model.endTime, true) : "--" }}
                  </span>
                </a-form-item>
                <a-form-item label="任务级别" name="level">
                  <span>
                    {{ model.level ==='GENERAL' ? '普通' : "紧急" }}
                  </span>
                </a-form-item>
                <a-form-item label="任务有效期" name="limitTimeJson">
                  <span>
                    {{
                    model.timeLimitModel.day ? model.timeLimitModel.day : "--"
                    }}
                  </span>
                  <span>天</span>
                  <span>
                    {{
                    model.timeLimitModel.hour ? model.timeLimitModel.hour : "--"
                    }}
                  </span>
                  <span>时</span>
                  <span>{{
                    model.timeLimitModel.minute
                    ? model.timeLimitModel.minute
                    : "--"
                    }}
                  </span>
                  <span>分</span>
                </a-form-item>
                <a-form-item label="责任人" name="receiveType">
                  <template v-if="model?.receiveType === '1'">
                    <span>
                      {{ model.receiveNames || "--" }}
                    </span>
                  </template>
                  <template v-else>
                    <span v-if="model?.receivePostNames && model?.receiveDeptNames">
                      {{ model?.receiveDeptNames }}/{{ model?.receivePostNames }}
                    </span>
                    <span v-else-if="model?.receivePostNames || model?.receiveDeptNames
                        ">
                      {{ model?.receivePostNames }}{{ model?.receiveDeptNames }}
                    </span>
                    <span v-else-if="model?.receiveRoleNames || model?.receiveDeptNames
                        ">
                      {{ model?.receiveRoleNames }}{{ model?.receiveDeptNames }}
                    </span>
                    <span v-else>--</span>
                  </template>
                </a-form-item>
                <a-form-item label="稽查人" name="checkUserType">
                  <template v-if="model?.inspectTypeRule === 'true'">
                    <span>
                      {{ model.checkUserNames ? model.checkUserNames : "--" }}
                    </span>
                  </template>
                  <template v-else>
                    <span v-if="model?.checkDeptNames && model?.checkPostNames">
                      {{ model?.checkDeptNames }}/{{ model?.checkPostNames }}
                    </span>
                    <span v-else>--</span>
                  </template>
                </a-form-item>
                <!-- <a-form-item label="计划状态" name="enable">
                    <span :class="model.enable ? 'normalRow' : 'deleteRow'">
                      {{ model.enable ? "启用" : "禁用" }}
                    </span>
                  </a-form-item> -->
                <a-form-item label="是否需要拆解任务" name="isSplit">
                  <span :class="model.isSplit ? 'normalRow' : 'deleteRow'">
                    {{ model.isSplit ? "启用" : "禁用" }}
                  </span>
                </a-form-item>
                <a-form-item label="是否需要稽查" name="isCheck">
                  <span :class="model.isCheck ? 'normalRow' : 'deleteRow'">
                    {{ model.isCheck ? "启用" : "禁用" }}
                  </span>
                </a-form-item>
                <a-form-item label="扫码巡检" name="isCheck">
                  <span :class="model.method ? 'normalRow' : 'deleteRow'">
                    {{ model.method==='SCAN_CODE' ? "打开" : "关闭" }}
                  </span>
                </a-form-item>
                <a-form-item label="任务生成周期" name="cycle"
                  v-if="(model.cycle && model.cronId!=='custom') || !model.cycle">
                  <span>{{ model.cycle ? "循环" : "立即" }}</span>
                </a-form-item>
                <template v-else>
                  <a-form-item label="执行周期" name="cycle">
                    <span>
                      {{ executeCycle.find((item) => item.value === model.cycleType)?.label }}
                    </span>
                  </a-form-item>
                  <a-form-item label="执行日期" name="cycle"
                    v-if="model.cycleType === 'EVERY_MONTH' || model.cycleType === 'EVERY_WEEK'">
                    <span v-if="model.cycleType === 'EVERY_MONTH'">
                      {{ model.selection.map((item) => item +'号').join(",")}}
                    </span>
                    <span v-else>
                      <span v-for="(item,index) in model.selection" :key="item">
                        {{ index != 0 ? "、" : "" }} {{ weekCycle.find((e) => e.value == item)?.label}}
                      </span>
                    </span>
                  </a-form-item>
                  <a-form-item label="执行时间" name="cycle">
                    <span>
                      {{ model.hour }}
                    </span>
                  </a-form-item>
                </template>
                <a-form-item class="a-form-item-100" label="备注" name="remark" v-bind="textLayout">
                  <span>
                    {{ model.remark ? model.remark : "--" }}
                  </span>
                </a-form-item>
              </template>
            </a-form>
            <div class="basic-title">巡检内容</div>
            <div class="inspect-operate">
              <div class="inspect-operate-left">
                <a-input :style="{ width: '200px'}" v-model:value.trim="inspectSearch.name"
                  placeholder="请输入巡检对象名称"></a-input>
                <a-select mode="multiple" class="pl1" @change="checkChange" v-model:value="inspectSearch.type"
                  optionFilterProp='label' show-search :options="inspectType" allowClear :style="{ width: '200px'}"
                  placeholder="巡检对象类型" />
                <a-button :style="{ marginLeft: '10px'}" @click="searchInspect(false)" type="primary">查询</a-button>
                <a-button :style="{ marginLeft: '10px'}" @click="searchInspect(true)">重置</a-button>
              </div>
              <div class="inspect-operate-right">
                <a-button type="primary" :style="{marginRight: '10px'}" @click="openStandardBatch"
                  :disabled="type === 'detail' || inspectSelectedKeysData.length === 0">
                  批量修改巡检标准
                </a-button>
                <a-popconfirm title="确定批量删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteBatchInspect(false)"
                  :disabled="type === 'detail' || !inspectSelectedKeysData.length">
                  <a-button type="primary" :style="{marginRight: '10px'}" danger
                    :disabled="type === 'detail' || !inspectSelectedKeysData.length">
                    批量移除
                  </a-button>
                </a-popconfirm>
                <a-button type="primary" @click="openModal" :disabled="type === 'detail'">
                  添加对象
                </a-button>
              </div>
            </div>
            <a-table rowKey="targetId" :dataSource="inspectDataSource" :columns="inspectColumns"
              :rowSelection="{ selectedRowKeys: inspectSelectedKeysData, onChange: inspectChange,onSelect:inspectSelect,onSelectAll:inspectSelectAll }"
              :pagination="inspectPagination" @change="inspectTableChange">
              <template #targetCategory="{ record }">
                <span>{{ {
                  "DEVICE": '设备',
                  "STALL": '档位',
                  "PROPERTY": '资产',
                  "SITE_POINT": '现场点',
                  "RISK_SOURCE": '风险源',
                  "SMALL_ENGINEERING": '小散工程',
                  }[record.targetCategory] }}</span>
              </template>
              <template #standardIds="{ record }">
                <a-popover placement="top" trigger="hover">
                  <template #content>
                    <span>{{ record.standardIds?record.standardIds.map(e=>e.name).join(","):'' }}</span>
                  </template>
                  <span>
                    {{ record.standardIds?record.standardIds.map(e=>e.name).join(","):'' }}
                  </span>
                </a-popover>
              </template>
              <template #operate="{ record }">
                <a-popconfirm title="是否确定删除?" ok-text="确定" cancel-text="取消" @confirm="deleteBatchInspect(record)">
                  <a-button danger type="text">删除</a-button>
                </a-popconfirm>
                <a-button type="link" @click="openStandard(record)">添加巡检内容</a-button>
              </template>
            </a-table>
          </div>
        </div>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回 </a-button>
        <a-button type="primary" @click="submit" v-if="type !== 'detail'" :loading="submitLoading">保存
        </a-button>
      </template>
    </g-layout>
    <a-modal :title="inspectModalTitle" width="1000px" v-model:visible="standardVisi" centered="centered"
      @cancel="cancelStandard" @ok="saveStandard">
      <a-tabs v-model:activeKey="paneActiveKey">
        <a-tab-pane key="1" tab="巡检标准">
          <TableInModal ref="modalStandardRef" :sly="180" :scrollX="200" :search="deviceSearch" :searchLength="2"
            :api="standardApi" :rowSelection="true" :columns="standardColumns" :selectedKeys="stanSelect" :rowKey="'id'"
            :size="'small'" :isInModal="true" :selectType="'checkbox'" :pagination="true"></TableInModal>
        </a-tab-pane>
        <a-tab-pane key="2" tab="巡检项">
          <TableInModal1 ref="inspectionItem" :sly="180" :scrollX="200" :search="itemSearch" :searchLength="2"
            :api="itemsApi" :rowSelection="true" :columns="itemColumn" :selectedKeys="itemStanSelect" :rowKey="'id'"
            :size="'small'" :isInModal="true" :selectType="'checkbox'" :pagination="true"></TableInModal1>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
    <a-modal width="1000px" v-model:visible="visible" v-if="visible" centered title="添加巡检对象" @ok="setObj"
      @cancel="setObjCancel">
      <a-tabs v-model:activeKey="modalActiveKey" forceRender>
        <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.name">
        </a-tab-pane>
      </a-tabs>
      <deviceTable v-if="tabList.some(item => item.key === 'DEVICE')" v-show="modalActiveKey === 'DEVICE'" :propSelectedKeys="deviceSelectedKeys"
        :propSelectedItems="deviceSelectedItems" ref="deviceTableRef">
      </deviceTable>
      <riskTable v-if="tabList.some(item => item.key === 'RISK_SOURCE')" v-show="modalActiveKey === 'RISK_SOURCE'" :propSelectedKeys="riskSelectedKeys"
        :propSelectedItems="riskSelectedItems" ref="riskTableRef">
      </riskTable>
      <smallTable v-if="tabList.some(item => item.key === 'SMALL_ENGINEERING')" v-show="modalActiveKey === 'SMALL_ENGINEERING'" :propSelectedKeys="smallSelectedKeys"
        :propSelectedItems="smallSelectedItems" ref="smallTableRef">
      </smallTable>
      <stallTable v-if="tabList.some(item => item.key === 'STALL')" v-show="modalActiveKey === 'STALL'" :propSelectedKeys="tableSelectKeys.stall"
        :propSelectedItems="stallSelectedItems" ref="stallTableRef">
      </stallTable>
      <sitePointsTable v-if="tabList.some(item => item.key === 'SITE_POINT')" v-show="modalActiveKey === 'SITE_POINT'" :propSelectedKeys="tableSelectKeys.site"
        :propSelectedItems="sitePointsSelectedItems" ref="sitePointsTableRef">
      </sitePointsTable>
      <s-table1 :tableY="400" v-if="tabList.some(item => item.key === 'PROPERTY')" :defaultKeys="tableSelectKeys.property" v-show="modalActiveKey === 'PROPERTY'"
        ref="propertyTableRef" :params="{ type: 'assetType' }" :api="propertyApi" :scrollX="200"
        :search="propertySearch" :size="'small'" :btns="[]" :columns="propertyObjCol" :showPage="true"
        :allowSelect="true"></s-table1>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed,
  unref,
  watch,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import _ from "lodash";
import { replaceObjectKeys } from "@pansy/utils";
import moment from "moment";
import { timeFormat, extractTree, removeDuplicateObj, chunkArray } from "@/utils/common.js";
import gLayout from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout'
import TableInModal from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/TableInModal'
import gSelect from '@/components/Common/gSelect.vue'
import userSelect from '@/components/Common/userSelect.vue'
import sTable1 from '@/components/Common/sTable1.vue'
import deviceTable from '@/components/Common/deviceTable.vue'
import stallTable from '@/components/Common/stallTable.vue'
import riskTable from '@/components/Common/riskTable.vue'
import sitePointsTable from '@/components/Common/sitePointsTable.vue'
import smallTable from '@/components/Common/smallTable.vue'
import TableInModal1 from '@/components/Common/TableInModal1.vue'
import gVerticalLine from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gVerticalLine'
import { cubeOuaaService } from "@/api/service";
import { getNowEnterprise } from "@/utils/auth";
import { debounce } from 'lodash-es'; // 防抖函数

import {
  DeleteOutlined,
} from '@ant-design/icons-vue';
export default defineComponent({
  components: {
    gLayout,
    TableInModal,
    sTable1,
    deviceTable,
    riskTable,
    stallTable,
    smallTable,
    sitePointsTable,
    TableInModal1,
    gVerticalLine,
    gSelect,
    userSelect,
    DeleteOutlined
  },
  setup() {
    const format = "YYYY-MM-DD HH:mm:ss";
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const ctr = ref();
    const form = ref();
    const timer = ref();
    const submitLoading = ref(false);
    const paneActiveKey = ref('1')
    const inspectCheckedKeys = ref([])
    const deviceSelectedKeys = ref([])
    const deviceSelectedItems = ref([])
    const stallSelectedItems = ref([])
    const sitePointsSelectedItems = ref([])
    const riskSelectedKeys = ref([])
    const riskSelectedItems = ref([])
    const smallSelectedItems = ref([])
    const smallSelectedKeys = ref([])
    const id = route.query.id;
    const type = route.query.type;
    const propertyType = ref([]);
    const layout = {
      labelCol: {
        style: {
          width: "100px",
        },
      },
      wrapperCol: {
        span: 20,
      },
    };
    const textLayout = {
      labelCol: {
        style: {
          width: "100px",
        },
      },
      wrapperCol: {
        flex: 1,
      },
    };

    const inspectData = reactive({
      inspectSelectedKeysData: [],
      inspectDataSource: [],
      inspectCurrentData: {},
      inspectAllDataSource: [],
      inspectSelectedItems: [],
      inspectSearch: {
        name: '',
        type: []
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
      inspectColumns: [
        {
          title: '巡检对象',
          dataIndex: 'targetName',
          key: 'targetName',
          align: 'center',
        },
        {
          title: '巡检对象类型',
          dataIndex: 'targetCategory',
          key: 'targetCategory',
          align: 'center',
          slots: { customRender: 'targetCategory' },
        },
        {
          title: '巡检内容',
          dataIndex: 'standardIds',
          key: 'standardIds',
          align: 'center',
          ellipsis: true,
          // customRender: ({ text }) => {
          //   return (
          //     <PopOver position="topLeft" content={text ? text : ""}>
          //       {text ? text : "--"}
          //     </PopOver>
          //   );
          // },
          slots: { customRender: 'standardIds' },
        },
        {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          align: 'center',
          slots: { customRender: 'operate' },
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
    const inspectChange = (record) => {
      inspectData.inspectSelectedKeysData = record;
    }
    const inspectSelect = (record, selected) => {
      if (selected) {
        inspectData.inspectSelectedItems.push(record);
      } else {
        inspectData.inspectSelectedItems = inspectData.inspectSelectedKeysData.filter(
          (item) => item.id !== record.id
        );
      }
    }
    const inspectSelectAll = (selected, selectedRows, changeRows) => {
      if (selected) {
        inspectData.inspectSelectedItems = inspectData.inspectSelectedItems.concat(changeRows);
      } else {
        const changeKeys = changeRows.map((item) => item.id);
        inspectData.inspectSelectedItems = inspectData.inspectSelectedItems.filter(
          (item) => !changeKeys.includes(item.id)
        );
      }
    }

    const isCheckFalg = async (rule, value) => {
      if (state.model.isCheck) {
        if (state.model.checkUserIds?.length || state.model.checkDeptIds?.length || state.model.checkPostIds?.length || state.model.checkRoleIds?.length) {
          return Promise.resolve();
        } else {
          return Promise.reject("请选择稽查人");
        }
      } else {
        return Promise.resolve();
      }
    };
    const repeatName = () => {
      fnThrottle(changeData, 500, 2000)()
    }
    const changeData = () => {
      state.model.name = state.model.name.replace('[', '【')
      state.model.name = state.model.name.replace(']', '】')
      proxy.$api.checkPlanNameIsRepeat({ planName: state.model.name }).then((res => {
        if (res) {
          proxy.$message.warn("计划名称重复");
        }
      }))
    }
    const fnThrottle = (method, delay, duration) => {
      var begin = new Date().getTime();
      return function () {
        var current = new Date().getTime();
        clearTimeout(timer.value);
        if (current - begin >= duration) {
          method();
          begin = current;
        } else {
          timer.value = setTimeout(function () {
            method();
          }, delay);
        }
      };
    }

    const rules = {
      name: [
        { required: true, message: "请输入计划名称" },
        { message: "名称不超过32个字", pattern: new RegExp(/^.{1,32}$/, "g") },
      ],
      typeId: [{ required: true, message: "请选择巡检类型", trigger: 'blur' }],
      beginTime: [
        { required: true, message: "请选择启用时间" },
        {
          validator(rule, value) {
            if (state.model.endTime) {
              if (state.model.endTime <= value) {
                return Promise.reject("生效时间应小于失效时间");
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
      endTime: [
        { required: false, message: "" },
        {
          validator(rule, value) {
            if (state.model.beginTime) {
              if (!value) {
                return Promise.resolve();
              } else if (state.model.beginTime > value) {
                return Promise.reject("失效时间应大于生效时间");
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
      limitTimeJson: [
        // 请填写任务时限
        { required: true, message: "" },
      ],

      receiveTypeRule: [{
        required: true, validator() {
          if (state.model.receiveIds?.length || state.model.receivePostIds?.length || state.model.receiveDeptIds?.length || state.model.receiveRoleIds?.length) {
            return Promise.resolve();
          } else {
            return Promise.reject("请选择责任人");
          }
        }, message: "请选择责任人"
      }],
      inspectTypeRule: [{ required: true, validator: isCheckFalg, message: "请选择稽查人" }],
      enable: [{ required: true, message: "请选择计划状态" }],
      isSplit: [{ required: true, message: "请选择是否需要任务拆解" }],
      isCheck: [{ required: true, message: "请选择是否需要稽查" }],
      level: [{ required: true, message: "请选择任务级别" }],
    };
    const obj = {
      "DEVICE": '设备',
      "STALL": '档位',
      "PROPERTY": '资产',
      "SITE_POINT": '现场点',
      "RISK_SOURCE": '风险源',
      "SMALL_ENGINEERING": '小散工程',
    }
    const timeLimitForm = ref();

    const timeLimitRules = {
      day: [
        { required: true, message: "请输入天" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      hour: [
        { required: true, message: "请输入时" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      minute: [
        { required: true, message: "请输入分" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
    };

    const state = reactive({
      inspectModalTitle: '添加巡检标准',
      deptListData: [],
      positionData: [],
      rolesListData: [],
      itemStanSelect: [],
      textMessage: [],
      addItmesIndex: 0,
      addItmesId: 0,
      inspectSelectedKeys: [],
      spinning: false,
      executeCycle: [
        {
          label: "每日",
          value: 'EVERY_DAY'
        },
        {
          label: "每周",
          value: 'EVERY_WEEK'
        },
        {
          label: "每月",
          value: 'EVERY_MONTH'
        },
      ],
      weekCycle: [
        {
          label: "周一",
          value: '2'
        },
        {
          label: "周二",
          value: '3'
        },
        {
          label: "周三",
          value: '4'
        },
        {
          label: "周四",
          value: '5'
        },
        {
          label: "周五",
          value: '6'
        },
        {
          label: "周六",
          value: '7'
        },
        {
          label: "周天",
          value: '1'
        },
      ],
      monthCycle: [

      ],
      cycleOptions: [],//任务周期
      model: {
        cycleType: '',//执行周期
        selection: '',
        hour: '12:00',
        name: "",
        typeId: null,
        typeName: null,
        beginTime: "",
        endTime: "",
        limitTimeJson: "",
        cycle: false,
        receiveType: "",
        checkUserType: "",
        method: 'SCAN_CODE',
        receiveTypeRule: null,
        inspectTypeRule: null,
        receiveDeptIds: [],
        receivePostIds: [],
        receiveRoleIds: [],
        checkDeptIds: [],
        checkPostIds: [],
        checkRoleIds: [],
        receiveIds: [],
        checkUserIds: [],
        enable: true,
        isSplit: false,
        isCheck: false,
        remark: "",
        level: 'GENERAL',
        timeLimitModel: {
          day: "0",
          hour: "0",
          minute: "0",
        },
      },
      activeKey: "point",
      keyword: '',
      fieldNames: {
        children: "children",
        label: "targetName",
        key: "id",
      },
      standardData: [],
      standardVisi: false,
      unChecked: [],
      tabList: [
        { key: "DEVICE", name: "设备", applicationCode: "DEVICECENTER" },
        { key: "STALL", name: "档位", applicationCode: "DWGL" },
        { key: "PROPERTY", name: "资产", applicationCode: "PROPERTY_MANAGEMENT" },
        { key: "SITE_POINT", name: "现场点", applicationCode: "INSPECTION" },
        { key: "RISK_SOURCE", name: "风险源", applicationCode: "RISK_SOURCE" },
        { key: "SMALL_ENGINEERING", name: "小散工程", applicationCode: "SMALLENFINEERING" },
      ],
    });

    const tableState = reactive({
      columns: [

        {
          dataIndex: "targetName",
          title: "巡检对象",
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
          dataIndex: "areaName",
          title: "所属区域",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        // {
        //   dataIndex: "address",
        //   title: "安装地址",
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       <PopOver position="topLeft" content={text ? text : ""}>
        //         {text ? text : "--"}
        //       </PopOver>
        //     );
        //   },
        // },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 240,
        },
      ],
      itemColumn: [
        {
          dataIndex: "alias",
          title: "巡检项名称",
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
          dataIndex: "name",
          title: "巡检项内容",
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
          dataIndex: "resultNames",
          title: "巡检结果",
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
          dataIndex: "referTypeNames",
          title: "适用对象",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }
      ],
      tableData: [],
      inspectPointType: "",
      visible: false,
      itemVisible: false,
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      tableStandardSelectKeys: [],
      standardColumns: [
        {
          dataIndex: "name",
          title: "名称",
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
          dataIndex: "remark",
          title: "说明",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      propertyObjCol: [
        {
          dataIndex: "sort",
          title: "序号",
          customRender: ({ index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "serialNumber",
          title: "编码",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          dataIndex: "name",
          title: "名称",
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
          dataIndex: "typeName",
          title: "类型",
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
          dataIndex: "receiveDepName",
          title: "所属部门",
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
          dataIndex: "areaName",
          title: "所属区域",
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
          dataIndex: "status",
          title: "状态",
          ellipsis: true,
          customRender: ({ text }) => {
            switch (text) {
              case " LEAVE_UNUSED":
                return <span>闲置</span>;
              case "MAKE_USE_OF":
                return <span >在用</span>;
              case "WEED_OUT":
                return <span >报废</span>;
              default:
                return '--'
            }
          },
        },
      ],
      stallTable: [],
      deviceCol: [],
      deviceTable: [],
    });
    const modalState = reactive({
      checkedNodes: [],
      itemsApi: {
        list: "inspectItemTemplatePage",
      },
      standardApi: {
        list: "inspectStandard",
      },
      deviceApi: {
        list: "getInstanceList",
      },
      propertyApi: {
        list: "getAssemblyClassifyPage",
      },
      search: [
        {
          label: "类型",
          value: "genreId",
          component: "g-select",
          url: "getGenreSearch",
          defaultValue: "",
          field: { name: "label", id: "value" },
          placeholder: "请选择类型",
        }, {
          label: "区域",
          value: "areaId",
          component: "a-cascader",
          defaultValue: "",
          options: [],
          field: { name: "label", id: "value" },
          placeholder: "请选择区域",
        }, {
          label: "部门",
          value: "departmentId",
          component: "g-select",
          url: "deptList",
          defaultValue: "",
          field: { name: "label", id: "value" },
          placeholder: "请选择部门",
        },
        { label: "", value: "keyword", placeholder: "名称" }
      ],
      propertySearch: [
        {
          label: "类型",
          value: "typeId",
          component: "g-select",
          url: "getAssemblyClassifyPageType",
          defaultValue: "",
          params: { type: 'assetType' },
          field: { name: "label", id: "value" },
          placeholder: "请选择类型",
        }, {
          label: "区域",
          value: "areaId",
          component: "a-cascader",
          defaultValue: "",
          options: [],
          field: { name: "label", id: "value" },
          placeholder: "请选择区域",
        }, {
          label: "部门",
          value: "receiveDepId",
          component: "g-select",
          url: "deptList",
          defaultValue: "",
          field: { name: "label", id: "value" },
          placeholder: "请选择部门",
        },
        { label: "", value: "keyword", placeholder: "名称" }
      ],
      itemSearch: [
        {
          label: "适用对象",
          value: "referType",
          component: "g-select",
          defaultValue: null,
          field: { name: "label", id: "value" },
          options: [{
            name: '全部',
            id: null
          }, {
            name: '设备',
            id: "DEVICE"
          }, {
            name: '档位',
            id: "STALL"
          }, {
            name: '资产',
            id: "PROPERTY"
          },
          {
            name: '现场点',
            id: "SITE_POINT"
          },
          ],
          placeholder: "",
        },
        { label: "", value: "keyword", placeholder: "名称" }
      ],
      deviceSearch: [{ label: "", value: "keyword", placeholder: "名称" }],
      objSelect: [],
      stanSelect: [],
      stanSelectBatch: [],
      checkedStandard: [],
    });
    const stallTableRef = ref();
    const deviceTableRef = ref();
    const riskTableRef = ref();
    const smallTableRef = ref();
    const propertyTableRef = ref();
    const sitePointsTableRef = ref();
    const modalActiveKey = ref("");
    const modalStandardRef = ref();
    const inspectionItem = ref();

    const tableSelectKeys = reactive({
      stall: [],
      property: [],
      site: [],
    })
    // 巡检周期选择
    const cycleBtn = (params) => {
      state.model.cycle = params;
    };

    // 打开巡检对象配置弹框
    const openModal = async () => {
      modalActiveKey.value = state.tabList[0].key;
      tableState.visible = await true;
      modalState.objSelect = inspectData.inspectAllDataSource.map((item) => item.id);
      nextTick(() => {
        if (deviceTableRef.value) {
          deviceTableRef.value?.getData();
          deviceSelectedItems.value = inspectData.inspectAllDataSource.filter(e => {
            return e.targetCategory == 'DEVICE'
          })
          deviceSelectedKeys.value = inspectData.inspectAllDataSource.map(
            (item) => item.targetId
          );
        }
        if (stallTableRef.value) {
          stallTableRef.value?.getData();
          stallSelectedItems.value = inspectData.inspectAllDataSource.filter(e => {
            return e.targetCategory == 'STALL'
          })
          tableSelectKeys.stall = inspectData.inspectAllDataSource.map(
            (item) => item.targetId
          );
        }
        if (smallTableRef.value) {
          smallTableRef.value?.getData();
          smallSelectedItems.value = inspectData.inspectAllDataSource.filter(e => {
            return e.targetCategory == 'SMALL_ENGINEERING'
          })
          smallSelectedKeys.value = inspectData.inspectAllDataSource.map(
            (item) => item.targetId
          );
        }
        if (riskTableRef.value) {
          riskTableRef.value?.getData();
          riskSelectedItems.value = inspectData.inspectAllDataSource.filter(e => {
            return e.targetCategory == 'RISK_SOURCE'
          })
          riskSelectedKeys.value = inspectData.inspectAllDataSource.map(
            (item) => item.targetId
          );
        }
        tableSelectKeys.property = inspectData.inspectAllDataSource.map(
          (item) => item.targetId
        );
        propertyTableRef.value?.getData();
        sitePointsSelectedItems.value = inspectData.inspectAllDataSource.filter(e => {
          return e.targetCategory == 'SITE_POINT'
        })
        tableSelectKeys.site = inspectData.inspectAllDataSource.map(
          (item) => item.targetId
        );
        sitePointsTableRef.value?.getData();
      });
    };
    // 批量移除巡检对象
    const deleteBatchInspect = (record) => {
      if (record) {
        inspectData.inspectAllDataSource = inspectData.inspectAllDataSource.filter(e => {
          return e.targetId != record.targetId
        })
      } else {
        inspectData.inspectAllDataSource = inspectData.inspectAllDataSource.filter(e => {
          return !inspectData.inspectSelectedKeysData.includes(e.targetId)
        })
        inspectData.inspectPagination.current = 1
      }
      const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize)
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1]
      inspectData.inspectPagination.total = inspectData.inspectAllDataSource.length
      inspectData.inspectSelectedKeysData = []
    }
    // 巡检对象配置保存
    const setObj = async (arr) => {
      nextTick(() => {
        let nowSaveStallItems = [],
          nowSaveDeviceItems = [],
          nowSaveRiskItems = [],
          nowSaveSmallItems = [],
          nowSavePropertyItems = [],
          nowSitePointsItems = [];
        if (deviceTableRef.value) {
          deviceTableRef.value.selectedItems.forEach(item => {
            item.targetType = item.productInfo.productCategory?.pathCode
          })
          const res = deviceTableRef.value.getSelectedData()
          deviceSelectedItems.value = res.selectedItems.filter(e => {
            return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
          })
          deviceSelectedItems.value.forEach(item => {
            if(!item.targetType) item.targetType = item.productInfo.productCategory?.pathCode
          })
          function convertHyphensToCommas(str) {
              let parts = str.split("-");
              if (parts.length > 1 && parts[parts.length - 1] === '') {
                  parts.pop();
              }
              return parts.join(",");
          }
          nowSaveDeviceItems = deviceSelectedItems.value.map(e => {
            return {
              targetCategory: "DEVICE",
              targetId: e.id,
              targetAddress: e.locationDes,
              targetTypeName: e.productCategory,
              id: e.targetId,
              targetName: e.name,
              targetCode: e.code,
              targetType: e.productCategory?.code,
              location: e?.lntAndLat,
              latAndLon: e.locationDes,
              targetAreaId:e.area?.pathId? convertHyphensToCommas(e.area.pathId):'',
              targetAreaName:e.area?.pathName || '',
              ...e
            }
          })
        }
        if (riskTableRef.value) {
          const res = riskTableRef.value.getSelectedData()
          riskSelectedItems.value = res.selectedItems.filter(e => {
            return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
          })
          
          nowSaveRiskItems = riskSelectedItems.value.map(e => {
            return {
              targetCategory: "RISK_SOURCE",
              id: e.targetId,
              targetId: e.id,
              targetAddress: e.attribute,
              targetTypeName: e.typeName,
              targetName: e.name,
              targetCode: e.serialNumber,
              targetType: e.typeCode,
              targetAreaId:e.areaId||'',
              targetAreaName:e.areaName||'',
              ...e
            }
          })
        }
        if (smallTableRef.value) {
          const res = smallTableRef.value.getSelectedData()
          smallSelectedItems.value = res.selectedItems.filter(e => {
            return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
          })
          nowSaveSmallItems = smallSelectedItems.value.map(e => {
            return {
              targetCategory: "SMALL_ENGINEERING",
              id: e.targetId,
              targetId: e.id,
              targetTypeName: e.projectTypeName,
              targetName: e.projectName,
              targetCode: e.projectNum,
              targetType: e.projectType,
              ...e
            }
          })
        }

        if (stallTableRef.value) {
          const res = stallTableRef.value.getSelectedData()
          if (res.associationChecked) {
            let data = res.selectedItems.filter(e => {
              return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
            }).map(e => {
              return e.riskData
            })
            JSON.parse(JSON.stringify(data.flat())).forEach(e => {
              nowSaveRiskItems.push(
                {
                  targetCategory: "RISK_SOURCE",
                  targetParentId: e.targetParentId,
                  targetAddress: e.attribute,
                  id: e.targetId,
                  targetId: e.id,
                  targetTypeName: e.typeName,
                  targetName: e.name,
                  targetCode: e.serialNumber,
                  targetType: e.typeCode,
                  targetAreaId:e.areaId||'',
                  targetAreaName:e.areaName||'',
                  ...e
                }
              )
            })
          }
          stallSelectedItems.value = res.selectedItems.filter(e => {
            return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
          })
          
          nowSaveStallItems = stallSelectedItems.value.map(e => {
            return {
              targetCategory: "STALL",
              targetId: e.id,
              targetAddress: e.location,
              targetTypeName: e.typeName,
              id: e.targetId,
              targetName: e.name,
              targetCode: e.code,
              targetType: e.type,
              locationDes: e?.stallExpand?.locationDes,
              latAndLon: e.stallExpand?.lntAndLat,
              targetAreaId:e.area||'',
              targetAreaName:e.areaNames||'',
              ...e
            }
          })
        }
        if (propertyTableRef.value) {

          nowSavePropertyItems = propertyTableRef.value?.selectedItems.map(e => {
            return {
              targetCategory: "PROPERTY",
              targetId: e.id,
              targetAddress: e.location,
              targetTypeName: e.typeName,
              id: e.targetId,
              targetName: e.name,
              targetCode: e.serialNumber,
              targetType: e.typeId,
              targetAreaId:e.areaId||'',
              targetAreaName:e.areaName||'',
              ...e
            }
          })
        }
        if (sitePointsTableRef.value) {
          const res = sitePointsTableRef.value.getSelectedData()
          if (res.associationChecked) {
            let data = res.selectedItems.map(e => {
              return e.riskData
            })
            JSON.parse(JSON.stringify(data.flat())).forEach(e => {
              nowSaveRiskItems.push(
                {
                  targetCategory: "RISK_SOURCE",
                  targetParentId: e.targetParentId,
                  targetAddress: e.attribute,
                  id: e.targetId,
                  targetId: e.id,
                  targetTypeName: e.typeName,
                  targetName: e.name,
                  targetCode: e.serialNumber,
                  targetType: e.typeCode,
                  targetAreaId:e.areaId||'',
                  targetAreaName:e.areaName||'',
                  ...e
                }
              )
            })
          }

          sitePointsSelectedItems.value = res.selectedItems.filter(e => {
            return res.selectedKeys.includes(e.id) || res.selectedKeys.includes(e.targetId)
          })
          nowSitePointsItems = sitePointsSelectedItems.value.map(e => {
            return {
              targetCategory: "SITE_POINT",
              targetId: e.id,
              id: e.targetId,
              targetAddress: e.location,
              targetTypeName: e.typeName,
              targetName: e.name,
              targetCode: e.codeNum,
              targetType: e.typeId,
              targetAreaId:e.areaId||'',
              targetAreaName:e.areaName||'',
              ...e
            }
          })
        }

        inspectData.inspectAllDataSource = [].concat(
          nowSaveDeviceItems,
          nowSaveSmallItems,
          nowSaveStallItems,
          nowSavePropertyItems,
          nowSitePointsItems,
          nowSaveRiskItems,
        )

        setObjCancel();
      });
    };

    // 巡检对象配置关闭弹框
    const setObjCancel = async () => {
      if (stallTableRef.value) {
        stallTableRef.value[0]?.reset();
      }
      if (deviceTableRef.value) {
        deviceTableRef.value[0]?.reset();
      }
      if (propertyTableRef.value) {
        propertyTableRef.value[0]?.reset();
      }
      if (sitePointsTableRef.value) {
        sitePointsTableRef.value[0]?.reset();
      }
      inspectData.inspectAllDataSource = removeDuplicateObj(inspectData.inspectAllDataSource, "id");

      setInspectTableData();
      tableState.visible = false;
    };

    const deleteItem = async (record) => {
      tableState.tableData = tableState.tableData.filter(
        (item) => item.id !== record.id
      );
      modalState.objSelect = tableState.tableData.map((item) => item.id);
      setInspectTableData();
    };
    // 获取巡检对象关联的巡检标准
    const setInspectTableData = async () => {
      if (inspectData.inspectAllDataSource.length) {
        // 将inspectData.inspectAllDataSource中的targetCategory和targetType组合去重
        const uniqueTargets = Array.from(new Set(inspectData.inspectAllDataSource.map(item => `${item.targetCategory},${item.targetType ?? ''}`))).map(target => {
          const [targetCategory, targetType] = target.split(',');
          return { targetCategory, targetType };
        });
        // 为每个唯一的targetCategory和targetType组合调用InternalCirculation接口
        const standardPromises = uniqueTargets.map(async (target) => {
          // 获取具有相同targetCategory和targetType的数据
          const data = inspectData.inspectAllDataSource.filter(item => item.targetCategory === target.targetCategory && item.targetType === target.targetType);
          // 如果有数据没有standardIds，则调用InternalCirculation接口
          if (data.some(item => !item?.standardIds?.length)) {
            const newStandardIds = await InternalCirculation(data[0].targetCategory, data[0].targetType);
            data.forEach(item => {
              item.standardIds = newStandardIds;
            });
          }
          return data;
        });

        Promise.all(standardPromises).then((updatedData) => {
          inspectData.inspectAllDataSource = updatedData.flat();
          inspectData.inspectPagination.total = inspectData.inspectAllDataSource.length;
          // 构造表格数据
          const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize);
          inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1];
        });
      }
    };
    // 获取对象的标准
    const InternalCirculation = (targetCategory, targetType) => {
      return new Promise((resolve) => {
        proxy.$api
          .targetCategory({ targetCategory: targetCategory, targetType: targetType }).then(res => {
            res.forEach(item => {
              item.standardItems.forEach(data => {
                data.isRawItem = 1
              })
            });
            resolve(res)
          })
      })
    }


    // 巡检计划接收对象
    const receive = (params) => {
      state.model.receiveType = params;
    };

    // 获取所有标准
    const getStandard = async (params) => {
      const getParams = {
        ...params,
        pageNum: 1,
        pageSize: 2000,
      };
      const data = await proxy.$api.inspectStandard(getParams, "get");
      if (data && data.records) {
        state.standardData = data.records;
        state.standardData.forEach(item => {
          item.standardItems.forEach(data => {
            data.isRawItem = 1
          })
        })
      } else {
        state.standardData = data;
      }
    };

    // 添加巡检标准弹窗
    const openStandard = async (record) => {
      state.inspectModalTitle = '添加巡检内容';
      inspectData.inspectCurrentData = record
      if (record?.standardIds) {
        modalState.stanSelect = record?.standardIds.map(e => e.id)
        if (record.standardIds) {
          state.itemStanSelect = record.standardIds.flatMap(standardId =>
            standardId.standardItems
              .filter(item => item.isRawItem === 0)
              .map(item => item.id)
          );
        }
      }
      state.standardVisi = await true;
      nextTick(() => {
        modalStandardRef.value?.getData();
      });
    };
    // 批量修改巡检标准弹窗
    const openStandardBatch = async () => {
      state.inspectModalTitle = '批量修改巡检标准';
      state.standardVisi = await true;
      nextTick(() => {
        modalStandardRef.value?.getData();
      });
    };

    // 绑定标准
    const saveStandard = async () => {
      // 检查是否选择了绑定的标准
      if (!modalStandardRef.value.alreadySelected.length) {
        proxy.$message.warn("请选择绑定的标准");
        return;
      }

      // 处理标准数据
      const updateStandardIds = (targetId) => {
        inspectData.inspectAllDataSource.forEach(e => {
          if (e.targetId === targetId) {
            e.standardIds = state.standardData.filter((item) => modalStandardRef.value.alreadySelected.includes(item.id));
          }
        });
      };

      // 处理选中的检查项
      const addInspectionItems = (targetId) => {
        if (inspectionItem.value?.selectedItem.length) {
          const data = inspectionItem.value.selectedItem.map(e => ({
            ...e,
            isRawItem: 0
          }));
          inspectData.inspectAllDataSource.forEach(e => {
            if (e.targetId === targetId) {
              e.standardIds[0].standardItems.push(...data);
            }
          });
        }
      };

      // 根据不同的状态执行操作
      const targetIds = state.inspectModalTitle === '添加巡检内容' ? [inspectData.inspectCurrentData.targetId] : inspectData.inspectSelectedKeysData;

      targetIds.forEach(targetId => {
        updateStandardIds(targetId);
        addInspectionItems(targetId);
      });

      // 分页处理
      const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize);
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1];

      // 取消标准选择
      cancelStandard();
    };


    const cancelStandard = () => {
      modalState.stanSelect = [];
      state.itemStanSelect = []
      state.standardVisi = false;
    };

    const itemSetObjCancel = () => {
      if (inspectionItem.value) {
        inspectionItem.value[0].reset();
        tableState.itemVisible = false
      }
    }
    const goBack = () => {
      history.back()
      return
      history.pushState({ current: location.pathname + location.search }, "", `/portal/inspection/inspectionPlan`)
    };

    //  处理巡检对象内容
    const handleInspectData = (data) => {
      inspectData.inspectAllDataSource = data.flat().map(item => {
        return {
          ...item,
          standardIds: item.standardDTOList,
          targetAddress: item.address,
        }
      })
      inspectData.inspectPagination.total = data.flat().length
      const chunkArrayData = chunkArray(inspectData.inspectAllDataSource, inspectData.inspectPagination.pageSize)
      inspectData.inspectDataSource = chunkArrayData[inspectData.inspectPagination.current - 1]
    }

    const getData = async (params) => {
      const data = await proxy.$api.inspectPlanDetailV2(params, "get");
      handleInspectData(data.typeTargets)
      const timeLimit = data.limitTimeJson ? eval("(" + data.limitTimeJson + ")") : eval("(" + "{\"day\":\"0\",\"hour\":\"0\",\"minute\":\"0\"}" + ")")
      state.model.cronId = data.cronId
      try {
        let cronName = data.cronName ? JSON.parse(data.cronName) : ''
        state.model.cronId = cronName.type === 'custom' ? 'custom' : data.cronId; //周期
        state.model.cycleType = cronName.cycleType
        state.model.selection = cronName.selection ? cronName.selection.split(',') : []
        state.model.hour = cronName.hour || '12:00'
      } catch (error) {
      }

      state.model.name = data.name; //名称
      state.model.typeId = data.typeId; //类型
      state.model.typeName = data.typeName; //类型
      state.model.beginTime = data.validBeginTime; //启用时间
      state.model.endTime = data.validEndTime; //禁用时间
      state.model.isCheck = data.isCheck; //是否稽查
      state.model.isSplit = data.isSplit; //是否拆分
      state.model.remark = data.remark; //备注
      state.model.level = data.level; //级别
      state.model.limitTimeJson = data.limitTimeJson; //时限
      state.model.timeLimitModel.day = timeLimit.day; //天
      state.model.timeLimitModel.hour = timeLimit.hour; //时
      state.model.timeLimitModel.minute = timeLimit.minute; //分
      state.model.method = data.method;
      state.model.cycle = eval(data.cycle); //周期

      state.model.receiveType = data.receiveType; //接收人类型
      state.model.receiveNames = data.receiveNames;
      state.model.checkUserType = data.checkUserType; //稽查人类型
      state.model.receiveTypeRule =
        data.receiveType === "1"
          ? data.receiveIds.length
            ? "true"
            : null
          : data.receiveDeptIds && data.receivePostIds
            ? "true"
            : null; //接收人校验
      state.model.receiveRoleNames = data.receiveRoleNames; //接收人

      state.model.receiveRoleNames = data.receiveRoleNames; //接收人
      state.model.receivePostNames = data.receivePostNames; //接收人
      state.model.receiveDeptNames = data.receiveDeptNames; //接收人
      state.model.checkUserIds = data.checkUserIds
        ? data.checkUserIds.split(",")
        : []; //稽查人
      state.model.checkUserNames = data.checkUserNames; //稽查人
      state.model.checkDeptNames = data.checkDeptNames; //稽查人
      state.model.checkPostNames = data.checkPostNames; //稽查人
      state.model.inspectTypeRule =
        data.checkUserType === "1"
          ? data.checkUserIds.length
            ? "true"
            : null
          : data.checkDeptIds && data.checkPostIds
            ? "true"
            : null; //接收人校验
      state.model.receiveIds = data.receiveIds
        ? data.receiveIds.split(",")
        : []; //接收人类型
      state.model.receiveDeptIds = data.receiveDeptIds; //接收人部门
      state.model.receivePostIds = data.receivePostIds; //接收人岗位
      state.model.receiveRoleIds = data.receiveRoleIds; //接收人角色
      state.model.checkPostIds = data.checkPostIds; //稽查人岗位
      state.model.checkDeptIds = data.checkDeptIds; //稽查人部门
      state.model.checkRoleIds = data.checkRoleIds; //稽查人角色
      state.model.enable = eval(data.enable); //状态
      state.model.remark = data.remark; //备注
      tableState.tableData = replaceObjectKeys(data.typeTargets.flat(), {
        areaId: "areaId",
        address: "address",
        areaName: "areaName",
        standardIds: "standardIds",
        targetCategory: "targetCategory",
        targetId: "id",
        genreId: "genreId",
        targetName: "targetName",
        targetType: "targetType",
        targetTypeName: "typeName",
      });
      if (state.model.endTime && !moment.isMoment(state.model.endTime)) {
        state.model.endTime = moment(state.model.endTime).format("YYYY-MM-DD HH:mm:ss")
      }
      if (state.model.beginTime && !moment.isMoment(state.model.beginTime)) {
        state.model.beginTime = moment(state.model.beginTime).format("YYYY-MM-DD HH:mm:ss")
      }
      if (type === "copy") {
        state.model.id = "";
        state.model.name += `-副本-${timeFormat(new Date())}`;
      }
      // if (JSON.parse(data.copyTargetTree)) {
      //   deviceSelectedItems.value = JSON.parse(data.copyTargetTree).deviceSelectedItems
      //   stallSelectedItems.value = JSON.parse(data.copyTargetTree).stallSelectedItems || []
      //   sitePointsSelectedItems.value = JSON.parse(data.copyTargetTree).sitePointsSelectedItems || []
      //   riskSelectedItems.value = JSON.parse(data.copyTargetTree).riskSelectedItems
      //   smallSelectedItems.value = JSON.parse(data.copyTargetTree).smallSelectedItems
      // }
    };

    const createTreeParams = async () => {
      state.textMessage = []
      let params = [];
      inspectData.inspectAllDataSource.forEach(targetItem => {
        state.textMessage.push(targetItem.standardIds.length)
        targetItem.standardIds && targetItem.standardIds.forEach(standardItem => {
          state.textMessage.push(standardItem.standardItems.length)
          standardItem.standardItems && standardItem.standardItems.forEach(items => {
            const targetObj = {
              targetCategory: targetItem.targetCategory,
              targetId: targetItem.targetId,
              targetType: targetItem.targetType,
              targetName: targetItem.targetName,
              standardId: standardItem.id,
              targetParentId: targetItem.targetParentId,
              targetAddress: targetItem.targetAddress,
              itemId: items.id,
              resultCode: items.resultId,
              latAndLon: targetItem.latAndLon,
              targetCode: targetItem.targetCode,
              location: targetItem.location,
              isRawItem: items.isRawItem,
              targetAreaId:targetItem.targetAreaId,
              targetAreaName:targetItem.targetAreaName
            }
            params.push(targetObj)
          })
        })
      })
      return params
    };

    const submit = debounce(async () => {
      // 使用 nextTick 确保 loading 状态能够及时更新到 UI
      submitLoading.value = true;
      if ((state.model.beginTime > state.model.endTime) && state.model.endTime) {
        proxy.$message.warn("生效时间不能大于失效时间！");
        paneActiveKey.value = '1'
        submitLoading.value = false;
        return
      }
      // const planRelationList = await createTreeParams()
      // return
      const timeLimitData = Object.values(state.model.timeLimitModel)
      const timeLimitFlag = timeLimitData.every(e => e == 0)
      if (timeLimitFlag) {
        timeLimitForm.value.validate();
        proxy.$message.warn("巡检任务时限不能为空！");
        paneActiveKey.value = '1'
        submitLoading.value = false;
        return
      }
      await timeLimitForm.value
        .validate()
        .then(() => {
          state.model.limitTimeJson = JSON.stringify(
            state.model.timeLimitModel
          );
        })
        .catch(() => {
          form.value.validate();
          paneActiveKey.value = '1'
          submitLoading.value = false;
        });
      form.value
        .validate()
        .then(async () => {
          if (inspectData.inspectAllDataSource.length) {
            const planRelationList = await createTreeParams();
            if (state.textMessage.indexOf(0) !== -1 && (type == 'add' || type == 'copy' || type == 'edit')) {
              proxy.$message.warn("请配置巡检对象的巡检标准和巡检项");
              submitLoading.value = false;
              return
            }
            if (state.textMessage.length === 0) {
              proxy.$message.warn("请配置巡检对象的巡检标准和巡检项");
              submitLoading.value = false;
              return
            }
            state.model.receiveDeptId = state.model.receiveDeptId || ''
            state.model.receiveDeptIds = state.model.receiveDeptIds || ''
            state.model.receivePostIds = state.model.receivePostIds || ''
            state.model.checkDeptIds = state.model.checkDeptIds || ''
            state.model.checkPostIds = state.model.checkPostIds || ''
            state.model.receiveRoleIds = state.model.receiveRoleIds || ''
            state.model.checkRoleIds = state.model.checkRoleIds || ''

            const params = {
              ...state.model,
              planRelationList,
              receiveIds: state.model.receiveIds.join(","),
              checkUserIds: state.model.checkUserIds.join(","),
              receiveDeptIds:
                typeof state.model.receiveDeptIds === "string"
                  ? state.model.receiveDeptIds
                  : state.model.receiveDeptIds.join(","),
              receivePostIds:
                typeof state.model.receivePostIds === "string"
                  ? state.model.receivePostIds
                  : state.model.receivePostIds.join(","),
              checkDeptIds:
                typeof state.model.checkDeptIds === "string"
                  ? state.model.checkDeptIds
                  : state.model.checkDeptIds.join(","),
              checkPostIds:
                typeof state.model.checkPostIds === "string"
                  ? state.model.checkPostIds
                  : state.model.checkPostIds.join(","),
              receiveRoleIds:
                typeof state.model.receiveRoleIds === "string"
                  ? state.model.receiveRoleIds
                  : state.model.receiveRoleIds.join(","),
              checkRoleIds:
                typeof state.model.checkRoleIds === "string"
                  ? state.model.checkRoleIds
                  : state.model.checkRoleIds.join(","),
            };
            delete params.receiveTypeRule;
            delete params.inspectTypeRule;
            delete params.timeLimitModel;
            // params.copyTargetTree = JSON.stringify({
            //   deviceSelectedItems: deviceSelectedItems.value,
            //   stallSelectedItems: stallSelectedItems.value,
            //   sitePointsSelectedItems: sitePointsSelectedItems.value,
            //   riskSelectedItems: riskSelectedItems.value,
            //   smallSelectedItems: smallSelectedItems.value,
            // })
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss")
            params.validBeginTime = params.beginTime
            params.validEndTime = params.endTime
            if (type === 'add') {
              params.validEndTime = params.endTime ? (currentTime > params.endTime ? moment(currentTime).add(30, 's').format("YYYY-MM-DD HH:mm:ss") : params.endTime) : null
            }
            if (!state.model.cycle) {
              delete params.cycleType
              delete params.hour
              delete params.selection
            } else {
              if (!state.model.cronId) { 
                proxy.$message.warn("请选择循环周期")
                submitLoading.value = false;
                return
              }
              if (state.model.cronId === 'custom') {
                if (params.cycleType !== 'EVERY_DAY' && !params.selection) {
                  proxy.$message.warn("请选择日期")
                  submitLoading.value = false;
                  return
                }
                if (!params.hour) {
                  proxy.$message.warn("请选择执行时间")
                  submitLoading.value = false;
                  return
                }
                if (!params.cycleType) {
                  proxy.$message.warn("请选择任务周期")
                  submitLoading.value = false;
                  return
                }
              }
            }
            // 处理 selection：如果是数组则转换为逗号分隔的字符串，如果是 EVERY_DAY 则删除
            if (params.cycleType === 'EVERY_DAY') {
              delete params.selection
            } else if (Array.isArray(params.selection)) {
              params.selection = params.selection.join(",")
            }

            // 如果 cronId 是 'custom'，则删除该字段
            if (params.cronId === 'custom') {
              delete params.cronId
            }
            if (type === 'add' || type === 'copy') {
              proxy.$api.inspectRecordAddV2(params, "post").then(() => {
                proxy.$message.success("操作成功");
                submitLoading.value = false;
                goBack();
              }).catch(() => {
                submitLoading.value = false;
              })
            } else if (type === 'edit') {
              params.id = id
              proxy.$api.inspectPlanEdit(params, "post").then(() => {
                proxy.$message.success("操作成功");
                submitLoading.value = false;
                goBack();
              }).catch(() => {
                submitLoading.value = false;
              })
            }
          } else {
            proxy.$message.warn("请配置巡检对象");
            submitLoading.value = false;
          }
        })
        .catch((e) => {
          submitLoading.value = false;
          if (!tableState.tableData.length) {
            proxy.$message.warn("请配置巡检对象");
          }
        });
    }, 500);

    const itemStandardSelect = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(tableState.tableStandardSelectKeys),
        onChange: checkedBatchStandard,
      };
    });

    const checkedBatchStandard = (record) => {
      tableState.tableStandardSelectKeys = record;
    };

    const recieveChange = () => {
      if (state.model.receiveType === "1") {
        state.model.receiveTypeRule = state.model.receiveIds.length
          ? "true"
          : null;
      } else {
        state.model.receiveDeptIds = state.model.receiveDeptIds ? String(state.model.receiveDeptIds) : ''
        state.model.receiveTypeRule =
          state.model.receiveDeptIds?.length ||
            state.model.receivePostIds?.length ||
            state.model.receiveRoleIds?.length
            ? "true"
            : null;
      }
      form.value.validateFields("receiveTypeRule");
    };
    const recieveChangeTask = () => {
      form.value.validateFields("cycle");
    }
    const checkChange = () => {
      if (state.model.checkUserType === "1") {
        state.model.inspectTypeRule = state.model.checkUserIds.length
          ? "true"
          : null;
      } else {
        state.model.checkDeptIds = state.model.checkDeptIds ? String(state.model.checkDeptIds) : ''
        state.model.inspectTypeRule =
          state.model.checkDeptIds?.length ||
            state.model.checkPostIds?.length ||
            state.model.checkRoleIds?.length
            ? "true"
            : null;
      }
      form.value.validateFields("inspectTypeRule");
    };

    const changeLabel = (value, option) => {
      state.model.typeName = option.label;
    };

    const getArelList = () => {
      proxy.$api.getAreaList().then((res) => {
        res = JSON.parse(JSON.stringify(res).replace(/"name"/g, '"label"'))
        res = JSON.parse(JSON.stringify(res).replace(/"id"/g, '"value"'))
        modalState.search[1].options = res
        modalState.propertySearch[1].options = res
      });
    }
    const getAreaDat = (text) => {
      let data = ''
      modalState.search[1].options.forEach(level1 => {
        if (level1.sequence.slice(0, level1.sequence.length - 1) === text) {
          data = level1.label
        } else {
          level1.children.forEach(level2 => {
            if (level2.sequence.slice(0, level2.sequence.length - 1) === text) {
              data = level1.label + '/' + level2.aliasName
            } else {
              level2.children.forEach(level3 => {
                if (level3.sequence.slice(0, level3.sequence.length - 1) === text) {
                  data = level1.label + '/' + level2.aliasName + '/' + level3.aliasName
                }
              })
            }
          })
        }
      })
      return data
    }
    const getPropertyData = async () => {
      const res = await proxy.$api.getAssemblyClassifyPageType({ type: 'assetType' })
      propertyType.value = res.records
    }
    const getProductApplications = async () => {
      const res = await cubeOuaaService.productApplications(getNowEnterprise().code)
      state.tabList = state.tabList.filter(e => res.find(ele => ele.code === e.applicationCode))
    }
    const getCycleOptions = async () => {
      const res = await proxy.$api.inspectCycleList()
      if (res.length > 0) {
        state.cycleOptions = [{ id: 'custom', name: '自定义' }, ...res]
      }
    }
    const getDeptList = () => {
      proxy.$api.deptList({
        pageNum: 1,
        pageSize: 1000
      }).then((res) => {
        state.deptListData = res.map(e => {
          return {
            label: e.name,
            value:String(e.id) 
          }
        })
      })
      proxy.$api.position({
        pageNum: 1,
        pageSize: 1000
      }).then((res) => {
        state.positionData = res.records.map(e => {
          return {
            label: e.name,
            value: String(e.id) 
          }
        })
      })
      proxy.$api.getRolesList({
        pageNum: 1,
        pageSize: 1000
      }).then((res) => {
        state.rolesListData = res.records.map(e => {
          return {
            label: e.name,
            value: String(e.id) 
          }
        })
      })
    }
    onMounted(async () => {
      for (let index = 0; index < 30; index++) {
        state.monthCycle.push({
          label: index + 1 + '号',
          value: String(index + 1)
        })
      }
      // await getCycleOptions()
      // await getProductApplications()
      // await getPropertyData()
      // await getStandard();
      // await getDeptList()
      // await getArelList()

      state.model.receiveType = "1";
      state.model.checkUserType = "1";
      if (id) {
        const data = {
          id,
        }
        if (route.query.businessType && route.query.businessType!=='undefined') {
          data.businessType = route.query['businessType']
        }
        await getData(data);
      }
      if (type === 'detail') {
        inspectData.inspectColumns = inspectData.inspectColumns.slice(0, -1)
      }
      // 并行请求，数据延迟懒加载
      Promise.all([
        getCycleOptions(),
        getProductApplications(),
        getPropertyData(),
        getStandard(),
        getDeptList(),
        getArelList()
      ]);
    });

    watch(
      () => state.model.timeLimitModel,
      (n) => {
        if (
          state.model.timeLimitModel.day &&
          state.model.timeLimitModel.hour &&
          state.model.timeLimitModel.minute
        ) {
          state.model.limitTimeJson = JSON.stringify(n);
        } else {
          state.model.limitTimeJson = "";
        }
        form.value.validateFields("limitTimeJson");
      },
      { deep: true }
    );

    watch(
      () => state.model.receiveType,
      (n) => {
        // 个人
        if (n == "1") {
          state.model.receiveDeptIds = [];
          state.model.receivePostIds = [];
          state.model.receiveRoleIds = [];
          state.model.receiveTypeRule = null;
        } else {
          state.model.receiveIds = [];
          state.model.receiveTypeRule = null;
        }
      }
    );

    watch(
      () => state.model.beginTime,
      () => {
        form.value.validateFields("beginTime");
        form.value.validateFields("endTime");
      }
    );

    watch(
      () => state.model.endTime,
      () => {
        form.value.validateFields("beginTime");
        form.value.validateFields("endTime");
      }
    );

    watch(
      () => state.model.cycle,
      (n, o) => {
        if (n !== o) {
          form.value.validateFields("cycle");
        }
      }
    );

    watch(
      () => state.model.cronId,
      () => {
        form.value.validateFields("cycle");
      }
    );

    return {
      ctr,
      form,
      type,
      rules,
      format,
      layout,
      timeFormat,
      textLayout,
      submitLoading,
      stallTableRef,
      propertyTableRef,
      sitePointsTableRef,
      timeLimitForm,
      timeLimitRules,
      deviceTableRef,
      modalActiveKey,
      modalStandardRef,
      paneActiveKey,
      inspectionItem,
      deviceSelectedKeys,

      ...toRefs(state),
      ...toRefs(inspectData),
      ...toRefs(tableState),
      ...toRefs(modalState),
      tableSelectKeys,
      riskTableRef,
      smallTableRef,
      itemStandardSelect,
      deviceSelectedItems,
      stallSelectedItems,
      sitePointsSelectedItems,
      riskSelectedItems,
      smallSelectedItems,
      smallSelectedKeys,
      riskSelectedKeys,
      inspectCheckedKeys,
      itemSetObjCancel,
      deleteBatchInspect,
      recieveChangeTask,
      cancelStandard,
      recieveChange,
      openStandard,
      openStandardBatch,
      saveStandard,
      setObjCancel,
      repeatName,
      checkChange,
      changeLabel,
      deleteItem,
      openModal,
      cycleBtn,
      receive,
      setObj,
      submit,
      goBack,
      inspectChange,
      inspectSelect,
      inspectSelectAll,
      inspectTableChange,
      searchInspect,
    };
  },
});
</script>

<style lang="less" scoped>
@import "../../../styles/gComponents/gDetailform.less";

.ctr {
  width: 100%;
  height: 100%;
}

:deep(.ant-tabs-tabpane) {
  width: 100%;
  height: 100%;
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
    height: 580px;
    // overflow-y: auto;
  }
}

.timeLimitForm {
  height: 32px !important;

  // display: grid;
  // grid-template-columns: repeat(3, 1fr);
  // grid-column-gap: 4px;
  .ant-form-item {
    margin-bottom: 0;
  }
}

.tabTop {
  // background-color: #fafafa;
  font-family: "SourceHanSansCN-Medium-2";
  font-size: 14px;
  font-weight: 500;
}

:deep(.ant-tabs-top-bar) {
  background-color: #fafafa;
  // background-color: #f3f3f3;
  margin-bottom: 8px;
}


:deep(.ant-table-title) {
  text-align: right;
  padding: 0;
  padding-bottom: 16px;
}

:deep(.ant-table-tbody) {
  text-align: left;
  font-family: "SourceHanSansCN-Regular-2";
}

:deep(.ant-modal) {
  text-align: left;

  .ant-modal-content .ant-modal-body {
    max-height: 600px !important;
    overflow-y: auto;
  }
}

:deep(.ant-modal-body) {
  padding: 16px !important;
}

:deep(.detail-form .ant-form-item > .ant-form-item-label) {
  width: 125px !important;
}

:deep(.ant-select-selection-search) {
  overflow: hidden;
}

.InspectionStandardsInfo-header,
.standardList {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tree_item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .tree_item_name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 150px;
  }
}

.InspectionStandardsInfoBox {
  height: calc(100vh - 400px);
  overflow-y: auto;

  .InspectionStandardsInfo {
    padding: 10px;
  }
}

.addItemsClass {
  cursor: pointer;
  color: dodgerblue;
}

:deep(.ant-tree-title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 220px;
  display: inline-block;
}

:deep(.ant-select-arrow .anticon>svg) {
  display: none;
}

:deep(.ant-select-selector:after) {
  content: ''
}

:deep(.ant-tree) {
  height: calc(100vh - 450px);
  overflow-y: auto;
}

.cycle-box {
  display: flex;

  :deep(.ant-select) {
    width: 150px !important;
  }
}

.cycle-item {
  width: 800px;
}

.basic-info {

  // width: 80vw;
  .basic-title {
    font-size: 14px;
    color: rgb(24, 144, 255);
    width: 100px;
    height: 40px;
    text-align: center;
    border-bottom: 2px solid rgb(24, 144, 255);
    margin-bottom: 5px;
  }

  .inspect-operate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}
</style>
