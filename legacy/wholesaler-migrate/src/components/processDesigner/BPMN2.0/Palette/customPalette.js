import Palette from 'diagram-js/lib/features/palette/Palette.js';
import { BPMN_USE_ENV } from '../config.default.js';
import { isFunction, isArray, forEach } from 'min-dash';

import {
  domify,
  query as domQuery,
  attr as domAttr,
  clear as domClear,
  classes as domClasses,
  matches as domMatches,
  delegate as domDelegate,
  event as domEvent,
} from 'min-dom';

export default class CustomPalette extends Palette {
  constructor(eventBus, canvas) {
    super(eventBus, canvas);
  }
  _update = function () {
    var entriesContainer = domQuery('.djs-palette-entries', this._container),
      entries = (this._entries = this.getEntries());

    domClear(entriesContainer);

    forEach(entries, function (entry, id) {
      var grouping = entry.group || 'default';

      var container = domQuery(
        '[data-group=' + grouping + ']',
        entriesContainer,
      );
      if (!container) {
        container = domify(
          '<div class="group" data-group="' + grouping + '"></div>',
        );
        entriesContainer.appendChild(container);
      }

      var html =
        entry.html ||
        (entry.separator
          ? '<hr class="separator" />'
          : '<div class="entry" draggable="true"></div>');

      var control = domify(html);
      container.appendChild(control);

      if (!entry.separator) {
        domAttr(control, 'data-action', id);

        if (entry.title) {
          domAttr(control, 'title', entry.title);
        }

        if (entry.className) {
          addClasses(control, entry.className);
        }

        if (entry.imageUrl) {
          control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
        }
      }
    });

    // open after update
    this.open();
  };
}

/* markup definition */

Palette.HTML_MARKUP =
  '<div class="djs-palette">' +
  '<div class="djs-palette-entries"></div>' +
  '<div class="djs-palette-toggle"></div>' +
  '</div>';

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

function addPaletteEntries(entries, provider) {
  var entriesOrUpdater = provider.getPaletteEntries();

  if (isFunction(entriesOrUpdater)) {
    return entriesOrUpdater(entries);
  }

  forEach(entriesOrUpdater, function (entry, id) {
    entries[id] = entry;
  });

  return entries;
}
