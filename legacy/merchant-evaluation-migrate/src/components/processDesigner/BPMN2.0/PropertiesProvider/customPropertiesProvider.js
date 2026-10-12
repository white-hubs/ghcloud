// 仿照 Camunda Properties Provider

var inherits = require('inherits');
var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');
var is = require('bpmn-js/lib/util/ModelUtil').is;

// bpmn properties
var processProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps'),
  eventProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps'),
  linkProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps'),
  documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps'),
  idProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps'),
  nameProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps'),
  executableProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps');

// user Tasks
// camunda properties
var serviceTaskDelegateProps = require('bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps'),
  // userTaskProps = require('bpmn-js-properties-panel/lib/provider/camunda/parts/UserTaskProps');
  userTaskProps = require('./parts/userTaskProps'),
  multiInstanceProps = require('./parts/MultiInstanceLoopProps'); // 用自定义的

var PROCESS_KEY_HINT = 'This maps to the process definition key.';
var TASK_KEY_HINT = 'This maps to the task definition key.';
function createGeneralTabGroups(
  element,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
) {
  // refer to target element for external labels
  element = element.labelTarget || element;

  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: [],
  };

  var idOptions;
  var processOptions;

  if (is(element, 'bpmn:Process')) {
    idOptions = { description: PROCESS_KEY_HINT };
  }

  if (is(element, 'bpmn:UserTask')) {
    idOptions = { description: TASK_KEY_HINT };
  }

  if (is(element, 'bpmn:Participant')) {
    processOptions = { processIdDescription: PROCESS_KEY_HINT };
  }

  idProps(generalGroup, element, translate, idOptions);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  processProps(generalGroup, element, translate, processOptions);
  // executableProps(generalGroup, element, translate);

  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: [],
  };
  linkProps(detailsGroup, element, translate);
  userTaskProps(detailsGroup, element, translate);
  var multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: [],
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  var documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: [],
  };
  documentationProps(documentationGroup, element, bpmnFactory, translate);

  var groups = [];
  groups.push(generalGroup);
  if (is(element, 'bpmn:UserTask')) {
    groups.push(detailsGroup);
    groups.push(multiInstanceGroup);
    groups.push(documentationGroup);
  }

  return groups;
}
/**
 * A properties provider for Camunda related properties.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 * @param {ElementTemplates} elementTemplates
 * @param {Translate} translate
 */
function CustomPropertiesProvider(
  eventBus,
  canvas,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate,
) {
  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {
    const generalTab = {
      id: 'general',
      label: '通用',
      groups: createGeneralTabGroups(
        element,
        canvas,
        bpmnFactory,
        elementRegistry,
        elementTemplates,
        translate,
      ),
    };

    return [generalTab];
  };
}

CustomPropertiesProvider.$inject = [
  'eventBus',
  'canvas',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate',
];

inherits(CustomPropertiesProvider, PropertiesActivator);

module.exports = CustomPropertiesProvider;
