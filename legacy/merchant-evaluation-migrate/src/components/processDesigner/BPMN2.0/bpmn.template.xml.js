export default function (processKey) {
  return `
  <?xml version="1.0" encoding="UTF-8"?>
  <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:activiti="http://activiti.org/schema/1.0/bpmn" xmlns:magic="http://magic" id="sid-38422fae-e03e-43a3-bef4-bd33b32041b2" targetNamespace="http://bpmn.io/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="5.1.2">
    <process id="${processKey}" name="流程" isExecutable="true">
      <extensionElements>
        <activiti:executionListener event="end" expression="\${processPassedListener.onPassed(execution)}"></activiti:executionListener>
      </extensionElements>
    </process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_${processKey}">
    <bpmndi:BPMNPlane bpmnElement="${processKey}" id="BPMNPlane_${processKey}">
    </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </definitions>
  `;
}
