'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../VueComponent/PropertiesPanel/EntryFactory');

module.exports = function (group, element, translate) {
  if (is(element, 'activiti:Assignable')) {
    // Assignee
    group.entries.push({
      ...entryFactory.textField({
        id: 'assignee',
        label: '处理人', // translate('Assignee'),
        modelProperty: 'assignee',
      }),
      inputComponent: 'app-remote-select',
      inputOptions: [
        { label: '发起人', value: '${context.initiatorUserId}' },
        {
          label: '部门负责人',
          value:
            "${assigneeService.resolveAssigneeUser(context, 'POST:1281515938236534786')}",
        },
        {
          label: '总经理',
          value:
            "${assigneeService.resolveAssigneeUser(context, 'PREV_ASSIGNEE_DEPT_LEADER')}",
        },
      ],
      isHide() {
        return !!element.businessObject.loopCharacteristics;
      },
    });

    // Candidate Users
    group.entries.push({
      ...entryFactory.textField({
        id: 'candidateUsers',
        label: '候选处理人', // translate('Candidate Users'),
        modelProperty: 'candidateUsers',
      }),
      inputComponent: 'app-remote-select',
      inputOptions: [
        { label: '发起人', value: '${context.initiatorUserId}' },
        {
          label: '部门负责人',
          value:
            "${assigneeService.resolveCandidateUsers(context, 'POST:1281515938236534786')}",
        },
        {
          label: '总经理',
          value:
            "${assigneeService.resolveCandidateUsers(context, 'PREV_ASSIGNEE_DEPT_LEADER')}",
        },
      ],
      isHide() {
        return !!element.businessObject.loopCharacteristics;
      },
    });

    // Candidate Groups
    group.entries.push({
      ...entryFactory.textField({
        id: 'candidateGroups',
        label: '候选处理人组', // translate('Candidate Groups'),
        modelProperty: 'candidateGroups',
      }),
      inputComponent: 'app-remote-select',
      inputOptions: [
        { label: '发起人', value: '${context.initiatorUserId}' },
        {
          label: '部门负责人',
          value:
            "${assigneeService.resolveCandidateGroups(context, 'POST:1281515938236534786')}",
        },
        {
          label: '总经理',
          value:
            "${assigneeService.resolveCandidateGroups(context, 'PREV_ASSIGNEE_DEPT_LEADER')}",
        },
      ],
      isHide() {
        return !!element.businessObject.loopCharacteristics;
      },
    });

    // 是否会签

    group.entries.push({
      ...entryFactory.textField({
        id: 'swithMutil',
        label: '是否会签',
        modelProperty: 'loopCharacteristics',
      }),
      inputComponent: 'a-switch',
      action: (element, bpmnModeler, entries) => {
        const moddle = bpmnModeler.get('moddle');
        const modeling = bpmnModeler.get('modeling');
        const commandStack = bpmnModeler.get('commandStack');
        if (!element.businessObject.loopCharacteristics) {
          const loopCharacteristics = moddle.create(
            'bpmn:MultiInstanceLoopCharacteristics',
          );
          loopCharacteristics.isSequential = 'false';
          loopCharacteristics.elementVariable = 'assignee';
          modeling.updateProperties(element, {
            loopCharacteristics: loopCharacteristics,
          });
          // 设置默认值
          const cmd = entries['assignee'].set(element, {
            assignee: '${assignee}',
          });
          commandStack.execute(cmd.cmd, cmd.context);
          const cmd2 = entries['candidateUsers'].set(element, {
            candidateUsers: '',
          });
          commandStack.execute(cmd2.cmd, cmd2.context);
        } else {
          modeling.updateProperties(element, {
            loopCharacteristics: undefined,
          });
        }
      },
    });
  }
};
