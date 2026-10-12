<template lang="pug">
  div.properties-container
    div.properties-header 属性面板
    div.properties-body
      a-tabs.properties-tabs(@change="handleTabChange")
        a-tab-pane(v-for="tab in tabs" :key="tab.id" :tab="tab.label") 
          div.properties-pane
            //- div.properties-group(v-for="group in tab.groups" :key="group.id")
            div.properties-group
              //- div.properties-group-title 
              app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="120")
                template(v-if="currentNode.type === 'bpmn:Process'")
                  a-form-model-item(label="流程ID" prop="id")
                    a-input(v-model="model.id" @change="handleChange(entries.id, model.id)" disabled)
                  //- a-form-model-item(label="名称" prop="name")
                  //-   a-input(v-model="model.name" @change="handleChange(entries.name, model.name)")
                template(v-else)
                  a-form-model-item(label="节点ID" prop="id")
                    a-input(v-model="model.id" @change="handleChange(entries.id, model.id)" disabled)
                  a-form-model-item(label="名称" prop="name")
                    a-input(v-model="model.name" @change="handleChange(entries.name, model.name)")
                template(v-if="currentNode.businessObject.$type === 'bpmn:UserTask'")
                  a-form-model-item(label="任务类型" prop="processUserTaskType")
                    app-remote-select(v-model="model.processUserTaskType"
                    @change="handleProcessUserTaskTypeChange"
                    api="/sys/dict-datas/graph?typeCode=processUserTaskType" 
                    :field="{name: 'code', label: 'name'}" 
                    placeholder="请选择")
                  //- a-form-model-item(label="任务时长(小时)" prop="processUserTaskHours")
                  //-   a-input-number(v-model="model.processUserTaskHours" 
                  //-   @change="handleProcessUserTaskTypeChange"
                  //-   :min="0"
                  //-   placeholder="请输入")
                  a-form-model-item(label="节点类型" prop="userTaskType")
                    //- a-select(v-model="model.type" allow-clear )
                    a-radio-group(v-model="model.userTaskType" button-style="solid" @change="handleTaskTypeChange")
                      a-radio-button(value="NORMAL") 普通
                      a-radio-button(value="CROSS_SIGN") 会签
                  a-form-model-item(v-if="model.userTaskType === 'NORMAL'" label="处理人" prop="assigneeUser")
                    a-row(:gutter="8" v-for="(field, index) in model.fields" :key="field.id")
                      a-col(:sm="10")
                        app-enum-select(code="ProcessDutyType4" v-model="field.dutyType" @change="handleDutyTypeChange(field)")
                      a-col(:sm="model.userTaskType === 'CROSS_SIGN' ? 10 : 14")
                        a-input(
                        v-if="preSetDutyTypes.includes(field.dutyType)" 
                        v-model="field.dutyId" disabled)

                        app-user-select(v-if="field.dutyType === 'USERS'" @change="handleDutyIdChange"
                        v-model="field.dutyId" 
                        mode="multiple"
                        :parameter="params" allow-clear)
                        app-remote-select(v-if="field.dutyType === 'POST'" @change="handleDutyIdChange"
                        v-model="field.dutyId" 
                        api="/sys/posts" :params="params" allow-clear)
                        app-tree-select(v-if="field.dutyType === 'DEPT' || field.dutyType === 'DEPT_MANAGER' || field.dutyType === 'DEPT_LEADER'" @change="handleDutyIdChange" 
                        v-model="field.dutyId" 
                        api="/sys/depts/all-graph" :params="params"
                        :dataFormatter="(data) => {data[0].selectable = false; return data;}"
                        allow-clear tree-default-expand-all)
                      a-col(:sm="4" v-if="model.userTaskType === 'CROSS_SIGN'")
                        app-link-btn.m1
                          a-icon(@click="handleAddField(index)" type="plus-square")
                        app-link-btn.ml1
                          a-icon(@click="handleDeleteField(index)" type="delete")
                  a-form-model-item(v-else label="处理人" prop="assigneeUser")
                    //- a-radio-group(v-model="model.signAssigneeMode" button-style="solid" @change="handleSignAssigneeModeChange")
                    //-   a-radio-button(value="PRE_SET") 流程预设
                    //-   a-radio-button(value="CUSTOM_SET") 自定义
                    a-row(v-if="model.signAssigneeMode === 'CUSTOM_SET'" :gutter="8" v-for="(field, index) in model.fields" :key="field.id")
                      a-col(:sm="10")
                        app-enum-select(code="ProcessDutyType3" v-model="field.dutyType" @change="handleDutyTypeChange(field)")
                      a-col(:sm="model.userTaskType === 'CROSS_SIGN' ? 10 : 14")
                        a-input(
                        v-if="preSetDutyTypes.includes(field.dutyType)" 
                        v-model="field.dutyId" disabled)
                        app-user-select(v-if="field.dutyType === 'USERS'" @change="handleDutyIdChange"
                        v-model="field.dutyId" 
                        mode="multiple"
                        :parameter="params" allow-clear)
                        app-remote-select(v-if="field.dutyType === 'POST'" @change="handleDutyIdChange"
                        v-model="field.dutyId" 
                        api="/sys/posts" :params="params" allow-clear)
                        app-tree-select(v-if="field.dutyType === 'DEPT' || field.dutyType === 'DEPT_MANAGER' || field.dutyType === 'DEPT_LEADER' " @change="handleDutyIdChange" 
                        v-model="field.dutyId" 
                        api="/sys/depts/all-graph" :params="params"
                        :dataFormatter="(data) => {data[0].selectable = false; return data;}"
                        allow-clear tree-default-expand-all)
                      a-col(:sm="4" v-if="model.userTaskType === 'CROSS_SIGN'")
                        app-link-btn.m1(@click="handleAddField(index)" )
                          a-icon(type="plus-square")
                        app-link-btn.ml1(@click="handleDeleteField(index)" :disabled="model.fields.length <= 1")
                          a-icon(type="delete")
                  a-form-model-item(v-if="model.userTaskType === 'CROSS_SIGN' && entries.completionCondition" label="完成条件" prop="completeCondition")
                    app-remote-select(v-model="model.completeCondition" 
                    :options="entries.completionCondition.inputOptions" 
                    :field="{name: 'value', label: 'label'}"
                    @change="handleCompleteConditionChange"
                    allow-clear)
              template(v-if="currentNode.businessObject.$type === 'bpmn:UserTask'")
                div.notice
                  .icon
                  .notice_title 通知配置
                app-form(:model="notice" oneline :labelWidth="120")     
                  a-form-model-item(label="通知方式")
                    div.flex.align-center.p1
                      div
                        a-checkbox(v-model="notice.noticeDTOS[0].configDTOS[0].waySite")
                          span 站内信
                      div.ml2
                        a-checkbox(v-if="notice.noticeDTOS[0].configDTOS[0].waySite" v-model="notice.noticeDTOS[0].configDTOS[0].waySitePopup")
                          span 消息弹窗
                      div.ml2
                        a-checkbox(v-model="notice.noticeDTOS[0].configDTOS[0].waySms")
                          span 短信
                      div.ml2
                        a-checkbox(v-model="notice.noticeDTOS[0].configDTOS[0].wayWechat")
                          span 企业微信
                  a-form-model-item(label="超时通知")
                    a-button(@click="handleCreate" type="primary" icon="plus") 新增
                  a-row(v-if="item.noticeType == 'timeout'",v-for="(item,i) in notice.noticeDTOS",:key="i" class="notice_card")
                    .close_icon(@click="handleDelete(i)")
                        a-icon(type='close', style='font-size: 1.5rem') 
                    a-form-model-item(label='超时时间')
                      a-row(type="flex",:gutter="10")
                        a-col(:span="8")
                          a-input(addon-after="时",v-model="item.timeoutHour")
                        a-col(:span="8")
                          a-input(addon-after="分",v-model="item.timeoutMinute")
                    a-form-model-item(label='通知对象')
                      a-button(@click="addConfig(i)" type="primary" icon="plus") 新增 
                    a-row(class="config_card",v-for="(config,j) in item.configDTOS",:key="j")
                      .close_icon(@click="deleteConfig(i,j)")
                        a-icon(type='close', style='font-size: 1.5rem') 
                      a-form-model-item(label='对象条件')
                        a-row(:gutter="16") 
                          a-col(:sm="8")
                            app-enum-select(code="DutyType2" v-model="config.flag" @change="value=>handleDutyType(value,i,j)")
                          a-col(:sm="14")
                            a-row(type="flex" :gutter="10")
                              a-col(v-if="config.flag === 'USER'",:span="24")
                                app-user-select(v-model="config.userIds" :parameter="params" allow-clear mode="multiple")
                              a-col(v-if="config.flag === 'POST' ||config.flag === 'DEPT_POST'",:span="12")  
                                app-remote-select(v-model="config.postIds" api="/sys/posts" :params="params" allow-clear mode="multiple")
                              a-col(v-if="config.flag === 'DEPT'||config.flag === 'DEPT_POST'",:span="12")   
                                app-tree-select( v-model="config.deptIds" api="/sys/depts/all-graph" :params="params"
                                :dataFormatter="(data) => {data[0].selectable = false; return data;}"
                                multiple allow-clear tree-default-expand-all)
                      a-form-model-item(label='通知方式', prop='type')
                        div.flex.align-center.p1
                          div
                            a-checkbox(v-model="config.waySite")
                              span 站内信
                          div.ml2
                            a-checkbox(v-if="config.waySite" v-model="config.waySitePopup")
                              span 消息弹窗
                          div.ml2
                            a-checkbox(v-model="config.waySms")
                              span 短信
                          div.ml2
                            a-checkbox(v-model="config.wayWechat")
                              span 企业微信  
                div.mt2
                  a-button(type="primary" :loading="loading" @click="handleSubmit") 保存配置  
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
function randomStr() {
  return btoa(Math.random() * 100000000).substr(8);
}
export default {
  props: {
    current: Object,
    bpmnModeler: Object,
  },
  data() {
    return {
      edit: false, // 是否编辑
      model: {
        id: null,
        name: null,
        userTaskType: 'NORMAL',
        signAssigneeMode: 'PRE_SET',
        dutyType: 'START_USER', // 默认值
        dutyId: '发起人',
        fields: [
          {
            dutyType: 'START_USER', // 默认值
            dutyId: '发起人',
            id: randomStr(),
          },
        ],
        assignee: null,
        candidateGroups: null,
        candidateUsers: null,
        completeCondition: null,
        processUserTaskType: 'processUserTaskType_general',
        processUserTaskHours: 1,
      },
      loading: false,
      notice: {
        projectId: null,
        businessType: 'ticketinst',
        flowId: null,
        nodeId: null,
        noticeDTOS: [
          {
            noticeType: 'new',
            timeout: null,
            configDTOS: [
              {
                flag: null,
                deptFlag: false,
                deptIds: null,
                postFlag: false,
                userIds: null,
                userFlag: false,
                postIds: null,
                wayWechat: false,
                waySms: false,
                waySite: false,
                waySitePopup: false,
              },
            ],
          },
          {
            noticeType: 'timeout',
            timeout: null,
            configDTOS: [
              {
                flag: null,
                deptFlag: false,
                deptIds: null,
                postFlag: false,
                userIds: null,
                userFlag: false,
                postIds: null,
                wayWechat: false,
                waySms: false,
                waySite: false,
                waySitePopup: false,
              },
            ],
          },
        ],
      },
      rules: {
        id: [{ required: true, message: '必填项' }],
        name: [{ required: true, message: '必填项' }],
        processUserTaskType: [{ required: true, message: '必填项' }],
        processUserTaskHours: [{ required: true, message: '必填项' }],
        userTaskType: [{ required: true, message: '必填项' }],
        assignee: [{ required: true, message: '必填项' }],
      },
      preSetDutyTypes: [
        'NONE',
        'PROCESS_DECISION',
        'START_USER',
        'START_USER_DEPT_MANAGER',
        'START_USER_DEPT_LEADER',
        'PREV_ASSIGNEE',
        'PREV_ASSIGNEE_DEPT_MANAGER',
        'PREV_ASSIGNEE_DEPT_LEADER',
      ],
      preSetDutyIdMap: {
        NONE: 'NONE',
        PROCESS_DECISION: 'execution',
        START_USER: '发起人',
        START_USER_DEPT_MANAGER: '发起人部门负责人',
        START_USER_DEPT_LEADER: '发起人部门分管领导',
        PREV_ASSIGNEE: '上一步处理人',
        PREV_ASSIGNEE_DEPT_MANAGER: '上一步处理人部门负责人',
        PREV_ASSIGNEE_DEPT_LEADER: '上一步处理人部门分管领导',
      },
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return {
        projectId: this.project.id,
      };
    },
    flowId() {
      return this.$route.params.id || null;
    },
    tabs() {
      const tabs = this.current?.tabs;
      return tabs || [];
    },
    groups() {
      const groups = this.current?.groups;
      return groups || {};
    },
    entries() {
      const entries = this.current?.entries;
      return entries || {};
    },
    currentNode() {
      const currentNode = this.current?.element;
      return currentNode || null;
    },
  },
  watch: {
    current() {
      const getFields = () => {
        const userTaskType = !this.currentNode?.businessObject
          ?.loopCharacteristics
          ? 'NORMAL'
          : 'CROSS_SIGN';
        const fields = [];
        let signAssigneeMode = 'CUSTOM_SET';
        if (userTaskType === 'NORMAL') {
          // 普通节点
          const assignee = this.currentNode?.businessObject?.assignee;

          let dutyType = 'START_USER';
          let dutyId = '发起人';
          if (/execution,(.+)\)\}/.test(assignee)) {
            const exp = /execution,(.+)\)\}/
              .exec(assignee)[1]
              ?.trim()
              ?.replace(/'/g, '');
            dutyType = exp.split(':')[0];
            dutyId = exp.split(':')[1] || null;
            if (dutyType === 'USERS' && dutyId) {
              dutyId = dutyId.split(',');
            }
            if (this.preSetDutyTypes.includes(dutyType)) {
              dutyId = this.preSetDutyIdMap[dutyType];
            }
          } else if (assignee?.includes('execution')) {
            dutyType = 'START_USER'; // 默认值
            dutyId = '发起人';
          }
          fields.push({
            dutyType,
            dutyId,
            id: randomStr(),
          });
        } else {
          // 会签节点
          const collection = this.currentNode?.businessObject
            ?.loopCharacteristics?.collection;
          let dutyType = 'START_USER';
          let dutyId = '发起人';
          if (/execution,(.+)\)\}/.test(collection)) {
            const collectionExp = /execution,(.+)\)\}/
              .exec(collection)[1]
              ?.trim();
            const expArr = collectionExp.split(/,'/);
            expArr.forEach((exp) => {
              exp = exp?.replace(/'/g, '');
              let dutyType = exp.split(':')[0];
              let dutyId = exp.split(':')[1] || null;
              if (dutyType === 'USERS' && dutyId) {
                dutyId = dutyId.split(',');
              }
              if (this.preSetDutyTypes.includes(dutyType)) {
                dutyId = this.preSetDutyIdMap[dutyType];
              }
              fields.push({
                dutyType,
                dutyId,
                id: randomStr(),
              });
            });
          } else if (collection?.includes('execution')) {
            dutyType = 'START_USER';
            dutyId = '发起人';
            fields.push({
              dutyType,
              dutyId,
              id: randomStr(),
            });
            signAssigneeMode = 'PRE_SET';
          }
        }
        return {
          fields,
          signAssigneeMode,
        };
      };
      // getFields();
      const documentation = this.currentNode?.businessObject?.documentation;
      let documentationObject = {};
      if (documentation?.length && documentation[0].text) {
        documentationObject = JSON.parse(documentation[0].text);
      }
      if (this.currentNode?.type === 'bpmn:UserTask') {
        this.getNotice(this.currentNode?.id);
      }
      // 获取节点上的属性
      this.model = {
        id: this.currentNode?.id,
        name: this.currentNode?.businessObject?.name,
        userTaskType: !this.currentNode?.businessObject?.loopCharacteristics
          ? 'NORMAL'
          : 'CROSS_SIGN',
        // signAssigneeMode: 'PRE_SET',
        // fields: getFields(),
        ...getFields(),
        assignee: this.currentNode?.businessObject?.assignee,
        candidateUsers: this.currentNode?.businessObject?.candidateUsers,
        candidateGroups: this.currentNode?.businessObject?.candidateGroups,
        completeCondition: this.currentNode?.businessObject?.loopCharacteristics
          ?.completionCondition?.body,
        processUserTaskType:
          documentationObject.type || 'processUserTaskType_general',
        processUserTaskHours: documentationObject.hours || 1,
      };
    },
  },
  updated() {},
  mounted() {
    this.bpmnModeler.on('create.cleanup', (e) => {
      const element = e.elements[0];
      if (element?.type === 'bpmn:UserTask') {
        // =============== 创建新节点  初始化数据 ==============
        this.$nextTick(() => {
          this.handleDutyIdChange();
          this.handleProcessUserTaskTypeChange();
        });
      }
    });
    // 监听全部事件
    // const events = Object.keys(
    //   this.bpmnModeler.get('modeling')._eventBus._listeners,
    // ).filter((event) => event.includes('crea'));
    // events.forEach((event) => {
    //   this.bpmnModeler.on(event, (e) => {
    //     if (/^drag/.test(event)) {
    //       // return false;
    //     }
    //   });
    // });
  },
  methods: {
    // 查询节点的配置
    getNotice(nodeId) {
      this.$restful(`GET:/project-merchant/notice`, {
        flowId: this.flowId,
        nodeId: nodeId,
      }).then((res) => {
        const data = res || {};
        if (res) {
          this.notice = {
            ...this.notice,
            ...data,
          };
        } else {
          this.notice = {
            projectId: null,
            businessType: 'ticketinst',
            flowId: null,
            nodeId: null,
            noticeDTOS: [
              {
                noticeType: 'new',
                timeout: null,
                configDTOS: [
                  {
                    flag: null,
                    deptFlag: false,
                    deptIds: null,
                    postFlag: false,
                    userIds: null,
                    userFlag: false,
                    postIds: null,
                    wayWechat: false,
                    waySms: false,
                    waySite: false,
                    waySitePopup: false,
                  },
                ],
              },
              {
                noticeType: 'timeout',
                timeout: null,
                configDTOS: [
                  {
                    flag: null,
                    deptFlag: false,
                    deptIds: null,
                    postFlag: false,
                    userIds: null,
                    userFlag: false,
                    postIds: null,
                    wayWechat: false,
                    waySms: false,
                    waySite: false,
                    waySitePopup: false,
                  },
                ],
              },
            ],
          };
        }
      });
    },
    handleCreate() {
      this.notice.noticeDTOS.push({
        noticeType: 'timeout',
        timeout: null,
        configDTOS: [
          {
            deptFlag: false,
            deptIds: null,
            postFlag: false,
            userIds: null,
            userFlag: false,
            postIds: null,
            wayWechat: false,
            waySms: false,
            waySite: false,
            waySitePopup: false,
          },
        ],
      });
    },
    handleDelete(index) {
      this.notice.noticeDTOS.splice(index, 1);
    },
    deleteConfig(i, j) {
      this.notice.noticeDTOS[i].configDTOS.splice(j, 1);
    },
    addConfig(i) {
      this.notice.noticeDTOS[i].configDTOS.push({
        deptFlag: false,
        deptIds: null,
        postFlag: false,
        userIds: null,
        userFlag: false,
        postIds: null,
        wayWechat: false,
        waySms: false,
        waySite: false,
        waySitePopup: false,
      });
    },
    handleDutyType(val, i, j) {
      switch (val) {
        case 'USER':
          this.notice.noticeDTOS[i].configDTOS[j].userIds = null;
          break;
        case 'POST':
          this.notice.noticeDTOS[i].configDTOS[j].postIds = null;
          break;
        case 'DEPT':
          this.notice.noticeDTOS[i].configDTOS[j].deptIds = null;
          break;
      }
    },
    // 保存
    async handleSubmit() {
      this.loading = true;
      this.$restful(`POST:/project-merchant/notice`, {
        ...this.notice,
        flowId: this.flowId,
        nodeId: this.model.id,
        businessType: 'ticketinst',
        projectId: this.project.id,
      })
        .then(() => {
          this.$message.success('保存成功!');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleTabChange(key) {
    },
    handleChange(entry, newValue) {
      const cmd = entry.set(this.currentNode, {
        [entry.id]: newValue,
      });
      this.bpmnModeler.get('commandStack').execute(cmd.cmd, cmd.context);
    },
    handleCompleteConditionChange(newValue) {
      const { completionCondition: entry } = this.entries;
      this.handleChange(entry, newValue);
    },
    handleTaskTypeChange() {
      // 切换 普通/会签 节点
      this.entries.swithMutil.action(
        this.currentNode,
        this.bpmnModeler,
        this.entries,
      );
      if (this.model.userTaskType === 'NORMAL') {
        this.model.fields = [
          {
            dutyType: 'START_USER',
            dutyId: '发起人',
            id: randomStr(),
          },
        ];
        this.handleDutyIdChange();
      } else {
        this.$nextTick(() => {
          this.handleSignAssigneeModeChange();
          this.model.completeCondition =
            '${nrOfCompletedInstances/nrOfInstances>=1}';
          this.handleCompleteConditionChange(this.model.completeCondition);
        });
        // setTimeout(, 100);
      }
    },
    handleSignAssigneeModeChange() {
      // 切换会签处理人 流程定义/自定义
      if (this.model.signAssigneeMode === 'PRE_SET') {
        this.handleChange(
          this.entries.collection,
          '${assigneeService.resolveMultipleDutyUsers(execution)}',
        );
      } else {
        this.model.fields = [
          {
            dutyType: 'START_USER',
            dutyId: '发起人',
            id: randomStr(),
          },
        ];
        this.handleChange(
          this.entries.collection,
          `\${assigneeService.resolveMultipleDutyUsers(execution, 'START_USER')}`,
        );
      }
    },
    handleDutyTypeChange(field) {
      field.dutyId = null;
      if (this.preSetDutyTypes.includes(field.dutyType)) {
        const preSetValue = this.preSetDutyIdMap[field.dutyType];
        field.dutyId = preSetValue;
      }
      this.handleDutyIdChange();
    },
    handleDutyIdChange() {
      const fields = this.model.fields;
      let expStr = '';

      fields.forEach((field) => {
        if (this.preSetDutyTypes.includes(field.dutyType)) {
          expStr += `,'${field.dutyType}'`;
        } else {
          expStr += `,'${this.formart(field.dutyType, field.dutyId)}'`;
        }
      });

      if (this.model.userTaskType === 'NORMAL') {
        const { dutyType, dutyId } = this.model.fields[0];
        const assigneeExp = this.createExp('assignee', dutyType, dutyId);
        const candidateUsersExp = this.createExp(
          'candidateUsers',
          dutyType,
          dutyId,
        );
        this.handleChange(this.entries.assignee, assigneeExp);
        this.handleChange(this.entries.candidateUsers, candidateUsersExp);
      } else {
        // 特殊处理 会签节点
        expStr =
          '${assigneeService.resolveMultipleUsers(execution' + expStr + ')}';
        this.handleChange(this.entries.collection, expStr);
        this.handleChange(this.entries.elementVariable, 'assignee');
        this.handleChange(this.entries.assignee, '${assignee}');
        this.handleChange(this.entries.candidateUsers, '');
      }
    },
    formart(type, id) {
      return id?.length ? `${type}:${id}` : '';
    },
    createExp(prop, dutyType, dutyId) {
      const expFunMap = {
        assignee: 'assigneeService.resolveAssigneeUser',
        candidateUsers: 'assigneeService.resolveCandidateUsers',
      };
      const expFun = expFunMap[prop];
      if (this.preSetDutyTypes.includes(dutyType)) {
        return `\${${expFun}(execution, '${dutyType}')}`;
      }
      // if (dutyType === 'START_USER') {
      //   return `\${${expFun}(execution, 'START_USER')}`;
      // }
      const value = dutyId?.length ? `${dutyType}:${dutyId}` : '';
      return `\${${expFun}(execution, '${value}')}`;
    },
    handleAddField() {
      this.model.fields.push({
        dutyType: 'USERS',
        dutyId: null,
        id: randomStr(),
      });
      this.handleDutyIdChange();
    },
    handleDeleteField(index) {
      this.model.fields.splice(index, 1);
      this.handleDutyIdChange();
    },
    // 1107 新增
    handleProcessUserTaskTypeChange() {
      this.model.processUserTaskHours =
        parseInt(this.model.processUserTaskHours) || 0; // 任务时长 只能为整数 2021/01/12
      const documentation = JSON.stringify({
        type: this.model.processUserTaskType,
        hours: this.model.processUserTaskHours,
      });
      this.handleChange(this.entries.documentation, documentation);
    },
  },
};
</script>

<style lang="less" scoped>
.properties-container {
  width: 100%;
  height: 100%;
  .properties-header {
    font-size: 16px;
    font-weight: 600;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  .properties-body {
    height: calc(100% - 45px);
    .properties-tabs {
      height: 100%;
      .properties-pane {
        height: 100%;
        padding: 1rem;
        overflow: auto;
        .properties-group-title {
          font-weight: 600;
          margin-bottom: 16px;
        }
      }
    }
  }
  .notice {
    position: relative;
    align-items: center;
    display: flex;
    gap: 8px;
    .notice_title {
      font-weight: 600;
      font-size: 15px;
    }
    .icon {
      position: relative;
      width: 3px;
      height: 12px;
      display: flex;
      background: #1890ff;
    }
  }

  .notice_card {
    position: relative;
    border: 1px solid #d9d9d9;
    margin: 10px 0;
    padding: 15px 0;
    border-radius: 10px;

    .close_icon {
      position: absolute;
      width: 30px;
      text-align: center;
      top: 1px;
      right: 0;
      color: #000;
      cursor: pointer;
    }
    .config_card {
      position: relative;
      border: 1px dashed #d9d9d9;
      margin: 10px;
      padding: 10px;
    }
  }
}
</style>
<style lang="less">
.properties-container {
  .properties-body {
    .ant-tabs-bar {
      padding: 0 1rem;
      // border-bottom: none;
      margin-bottom: 0.5rem;
    }
    .ant-tabs-content {
      height: calc(100% - 45px - 0.5rem);
      .ant-form-item {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
