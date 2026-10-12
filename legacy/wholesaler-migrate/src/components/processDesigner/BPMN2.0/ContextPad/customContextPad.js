import { assign, isFunction, isArray, forEach, isDefined } from 'min-dash';

import {
  delegate as domDelegate,
  event as domEvent,
  attr as domAttr,
  query as domQuery,
  classes as domClasses,
  domify,
} from 'min-dom';
import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad.js';

export default class CustomContextPad extends ContextPad {
  constructor(config, eventBus, overlays) {
    super(config, eventBus, overlays);
  }
  _updateAndOpen = function (element) {
    var entries = this.getEntries(element),
      pad = this.getPad(element),
      html = pad.html;

    forEach(entries, function (entry, id) {
      var grouping = entry.group || 'default',
        control = domify(
          entry.html || '<div class="entry" draggable="true"></div>',
        ),
        container;

      domAttr(control, 'data-action', id);

      container = domQuery('[data-group=' + grouping + ']', html);
      if (!container) {
        container = domify(
          '<div class="group" data-group="' + grouping + '"></div>',
        );
        html.appendChild(container);
      }

      container.appendChild(control);

      if (entry.className) {
        addClasses(control, entry.className);
      }

      if (entry.title) {
        domAttr(control, 'title', entry.title);
      }

      if (entry.imageUrl) {
        control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
      }
    });

    domClasses(html).add('open');

    this._current = {
      element: element,
      pad: pad,
      entries: entries,
    };

    this._eventBus.fire('contextPad.open', { current: this._current });
  };
}

// helpers //////////////////////

function addClasses(element, classNames) {
  var classes = domClasses(element);

  var actualClassNames = isArray(classNames)
    ? classNames
    : classNames.split(/\s+/g);
  actualClassNames.forEach(function (cls) {
    classes.add(cls);
  });
}
