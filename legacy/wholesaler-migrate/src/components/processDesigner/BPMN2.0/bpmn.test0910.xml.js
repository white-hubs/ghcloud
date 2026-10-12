export default `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:activiti="http://activiti.org/schema/1.0/bpmn" xmlns:magic="http://magic" id="sid-38422fae-e03e-43a3-bef4-bd33b32041b2" targetNamespace="http://bpmn.io/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="5.1.2">
  <process id="process_test" name="流程" isExecutable="true">
    <extensionElements>
      <activiti:executionListener expression="\${processPassedListener.onPassed(context, execution)}" event="end" />
    </extensionElements>
    <startEvent id="Event_1y9wgej" name="开始">
      <outgoing>Flow_0lk272w</outgoing>
    </startEvent>
    <userTask id="Activity_0fje2x0" name="发起任务">
      <incoming>Flow_0lk272w</incoming>
      <outgoing>Flow_0jris5f</outgoing>
    </userTask>
    <sequenceFlow id="Flow_0lk272w" sourceRef="Event_1y9wgej" targetRef="Activity_0fje2x0" />
    <userTask id="Activity_1mdbykn" name="用户接单/抢单" activiti:assignee="\${assigneeService.resolveAssigneeDutyUser(execution)}" activiti:candidateUsers="\${assigneeService.resolveCandidateDutyUsers(execution)}">
      <incoming>Flow_0jris5f</incoming>
      <outgoing>Flow_0gmdmrc</outgoing>
    </userTask>
    <sequenceFlow id="Flow_0jris5f" sourceRef="Activity_0fje2x0" targetRef="Activity_1mdbykn" />
    <endEvent id="Event_0yvf3ox" name="结束">
      <incoming>Flow_0yca2ks</incoming>
    </endEvent>
    <userTask id="Activity_0w3ot3m" name="用户任务完成" activiti:assignee="\${duty_user_id}">
      <incoming>Flow_0gmdmrc</incoming>
      <outgoing>Flow_0yca2ks</outgoing>
      <multiInstanceLoopCharacteristics isSequential="false" activiti:collection="\${assigneeService.resolveMultipleDutyUsers(execution)}" activiti:elementVariable="duty_user_id">
        <completionCondition xsi:type="tFormalExpression">\${nrOfCompletedInstances/nrOfInstances&gt;=1}</completionCondition>
      </multiInstanceLoopCharacteristics>
    </userTask>
    <sequenceFlow id="Flow_0gmdmrc" sourceRef="Activity_1mdbykn" targetRef="Activity_0w3ot3m" />
    <sequenceFlow id="Flow_0yca2ks" sourceRef="Activity_0w3ot3m" targetRef="Event_0yvf3ox" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_process_test">
    <bpmndi:BPMNPlane id="BPMNPlane_process_test" bpmnElement="process_test">
      <bpmndi:BPMNEdge id="Flow_0lk272w_di" bpmnElement="Flow_0lk272w">
        <omgdi:waypoint x="250" y="98" />
        <omgdi:waypoint x="250" y="145" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0jris5f_di" bpmnElement="Flow_0jris5f">
        <omgdi:waypoint x="250" y="195" />
        <omgdi:waypoint x="250" y="255" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0gmdmrc_di" bpmnElement="Flow_0gmdmrc">
        <omgdi:waypoint x="250" y="305" />
        <omgdi:waypoint x="250" y="375" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0yca2ks_di" bpmnElement="Flow_0yca2ks">
        <omgdi:waypoint x="250" y="425" />
        <omgdi:waypoint x="250" y="492" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1y9wgej_di" bpmnElement="Event_1y9wgej">
        <omgdc:Bounds x="232" y="62" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="238" y="38" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0fje2x0_di" bpmnElement="Activity_0fje2x0">
        <omgdc:Bounds x="190" y="145" width="120" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1mdbykn_di" bpmnElement="Activity_1mdbykn">
        <omgdc:Bounds x="190" y="255" width="120" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0w3ot3m_di" bpmnElement="Activity_0w3ot3m">
        <omgdc:Bounds x="190" y="375" width="120" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0yvf3ox_di" bpmnElement="Event_0yvf3ox">
        <omgdc:Bounds x="232" y="492" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="238" y="533" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
`;
