export default `<?xml version="1.0" encoding="UTF-8"?>
<definitions 
xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" 
xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" 
xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
xmlns:magic="http://magic" 
id="sid-38422fae-e03e-43a3-bef4-bd33b32041b2" 
targetNamespace="http://bpmn.io/bpmn" 
exporter="bpmn-js (https://demo.bpmn.io)" 
exporterVersion="5.1.2">
  <process id="process_leave" name="请假流程" isExecutable="true">
    <startEvent id="startevent1" name="Start"></startEvent>
    <userTask id="usertask1" name="填写请假单" activiti:assignee="\${context.initiatorUserId}" activiti:formKey="form1"></userTask>
    <sequenceFlow id="flow1" sourceRef="startevent1" targetRef="usertask1"></sequenceFlow>
    <userTask id="usertask2" name="部门负责人审批" activiti:assignee="\${assigneeService.resolveAssigneeUser(context, 'POST:1281515938236534786')}" activiti:candidateUsers="\${assigneeService.resolveCandidateUsers(context, 'POST:1281515938236534786')}" activiti:formKey="form2"></userTask>
    <sequenceFlow id="flow2" sourceRef="usertask1" targetRef="usertask2"></sequenceFlow>
    <sequenceFlow id="flow3" sourceRef="usertask2" targetRef="usertask3"></sequenceFlow>
    <userTask id="usertask3" name="总经理审批" activiti:assignee="\${assigneeService.resolveAssigneeUser(context, 'PREV_ASSIGNEE_DEPT_LEADER')}" activiti:candidateUsers="\${assigneeService.resolveCandidateUsers(context, 'PREV_ASSIGNEE_DEPT_LEADER')}" activiti:formKey="form3"></userTask>
    <endEvent id="endevent1" name="End"></endEvent>
    <sequenceFlow id="flow4" sourceRef="usertask3" targetRef="endevent1"></sequenceFlow>
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_process_leave">
    <bpmndi:BPMNPlane bpmnElement="process_leave" id="BPMNPlane_process_leave">
      <bpmndi:BPMNShape bpmnElement="startevent1" id="BPMNShape_startevent1">
        <omgdc:Bounds height="35.0" width="35.0" x="220.0" y="240.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="usertask1" id="BPMNShape_usertask1">
        <omgdc:Bounds height="55.0" width="105.0" x="300.0" y="230.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="usertask2" id="BPMNShape_usertask2">
        <omgdc:Bounds height="55.0" width="105.0" x="460.0" y="230.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="usertask3" id="BPMNShape_usertask3">
        <omgdc:Bounds height="55.0" width="105.0" x="620.0" y="230.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape bpmnElement="endevent1" id="BPMNShape_endevent1">
        <omgdc:Bounds height="35.0" width="35.0" x="770.0" y="240.0"></omgdc:Bounds>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge bpmnElement="flow1" id="BPMNEdge_flow1">
        <omgdi:waypoint x="255.0" y="257.0"></omgdi:waypoint>
        <omgdi:waypoint x="300.0" y="257.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="flow2" id="BPMNEdge_flow2">
        <omgdi:waypoint x="405.0" y="257.0"></omgdi:waypoint>
        <omgdi:waypoint x="460.0" y="257.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="flow3" id="BPMNEdge_flow3">
        <omgdi:waypoint x="565.0" y="257.0"></omgdi:waypoint>
        <omgdi:waypoint x="620.0" y="257.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge bpmnElement="flow4" id="BPMNEdge_flow4">
        <omgdi:waypoint x="725.0" y="257.0"></omgdi:waypoint>
        <omgdi:waypoint x="770.0" y="257.0"></omgdi:waypoint>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;
