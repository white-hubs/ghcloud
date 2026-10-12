let $$ = document.querySelectorAll.bind(document);
let isTouchAvailable = 'ontouchstart' in window;


// Find exact position of element
function isWindow(obj) {
  return obj !== null && obj === obj.window;
}

function getWindow(elem) {
  return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
}

function isObject(value) {
  let type = typeof value;
  return type === 'function' || type === 'object' && !!value;
}

function isDOMNode(obj) {
  return isObject(obj) && obj.nodeType > 0;
}

function getWavesElements(nodes) {
  let stringRepr = Object.prototype.toString.call(nodes);

  if (stringRepr === '[object String]') {
    return $$(nodes);
  } else if (isObject(nodes) && /^\[object (Array|HTMLCollection|NodeList|Object)\]$/.test(stringRepr) && nodes.hasOwnProperty('length')) {
    return nodes;
  } else if (isDOMNode(nodes)) {
    return [nodes];
  }

  return [];
}

function offset(elem) {
  let docElem, win,
    box = { top: 0, left: 0 },
    doc = elem && elem.ownerDocument;

  docElem = doc.documentElement;

  if (typeof elem.getBoundingClientRect !== typeof undefined) {
    box = elem.getBoundingClientRect();
  }
  win = getWindow(doc);
  return {
    top: box.top + win.pageYOffset - docElem.clientTop,
    left: box.left + win.pageXOffset - docElem.clientLeft
  };
}

function convertStyle(styleObj) {
  let style = '';

  for (let prop in styleObj) {
    if (styleObj.hasOwnProperty(prop)) {
      style += (prop + ':' + styleObj[prop] + ';');
    }
  }

  return style;
}

let Effect = {

  // Effect duration
  duration: 750,

  // Effect delay (check for scroll before showing effect)
  delay: 200,

  show: function (e, element: HTMLElement, velocity?: { x: number, y: number }) {

    // Disable right click
    if (e.button === 2) {
      return false;
    }

    element = element || this;

    // Create ripple
    let ripple = document.createElement('div');
    ripple.className = 'waves-ripple waves-rippling';
    element.appendChild(ripple);

    // Get click coordinate and element width
    let pos = offset(element);
    let relativeY = 0;
    let relativeX = 0;
    // Support for touch devices
    if ('touches' in e && e.touches.length) {
      relativeY = (e.touches[0].pageY - pos.top);
      relativeX = (e.touches[0].pageX - pos.left);
    }
    //Normal case
    else {
      relativeY = (e.pageY - pos.top);
      relativeX = (e.pageX - pos.left);
    }
    // Support for synthetic events
    relativeX = relativeX >= 0 ? relativeX : 0;
    relativeY = relativeY >= 0 ? relativeY : 0;

    let scale = 'scale(' + ((element.clientWidth / 100) * 3) + ')';
    let translate = 'translate(0,0)';

    if (velocity) {
      translate = 'translate(' + (velocity.x) + 'px, ' + (velocity.y) + 'px)';
    }

    // Attach data to element
    ripple.setAttribute('data-hold', Date.now().toString());
    ripple.setAttribute('data-x', relativeX.toString());
    ripple.setAttribute('data-y', relativeY.toString());
    ripple.setAttribute('data-scale', scale);
    ripple.setAttribute('data-translate', translate);

    // Set ripple position
    let rippleStyle = {
      top: relativeY + 'px',
      left: relativeX + 'px',
      transform: '',
      opacity: ''
    };

    ripple.classList.add('waves-notransition');
    ripple.setAttribute('style', convertStyle(rippleStyle));
    ripple.classList.remove('waves-notransition');

    // Scale the ripple
    rippleStyle['-webkit-transform'] = scale + ' ' + translate;
    rippleStyle['-moz-transform'] = scale + ' ' + translate;
    rippleStyle['-ms-transform'] = scale + ' ' + translate;
    rippleStyle['-o-transform'] = scale + ' ' + translate;
    rippleStyle.transform = scale + ' ' + translate;
    rippleStyle.opacity = '1';

    let duration = e.type === 'mousemove' ? 2500 : Effect.duration;
    rippleStyle['-webkit-transition-duration'] = duration + 'ms';
    rippleStyle['-moz-transition-duration'] = duration + 'ms';
    rippleStyle['-o-transition-duration'] = duration + 'ms';
    rippleStyle['transition-duration'] = duration + 'ms';

    ripple.setAttribute('style', convertStyle(rippleStyle));
  },

  hide: function (e, element) {
    element = element || this;

    let ripples = element.getElementsByClassName('waves-rippling');

    for (let i = 0, len = ripples.length; i < len; i++) {
      removeRipple(e, element, ripples[i]);
    }

    if (isTouchAvailable) {
      element.removeEventListener('touchend', Effect.hide);
      element.removeEventListener('touchcancel', Effect.hide);
    }

    element.removeEventListener('mouseup', Effect.hide);
    element.removeEventListener('mouseleave', Effect.hide);
  }
};

/**
 * Collection of wrapper for HTML element that only have single tag
 * like <input> and <img>
 */
let TagWrapper = {

  // Wrap <input> tag so it can perform the effect
  input: function (element) {

    let parent = element.parentNode;

    // If input already have parent just pass through
    if (parent.tagName.toLowerCase() === 'i' && parent.classList.contains('waves-effect')) {
      return;
    }

    // Put element class and style to the specified parent
    let wrapper = document.createElement('i');
    wrapper.className = element.className + ' waves-input-wrapper';
    element.className = 'waves-button-input';

    // Put element as child
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);

    // Apply element color and background color to wrapper
    let elementStyle = window.getComputedStyle(element, null);
    let color = elementStyle.color;
    let backgroundColor = elementStyle.backgroundColor;

    wrapper.setAttribute('style', 'color:' + color + ';background:' + backgroundColor);
    element.setAttribute('style', 'background-color:rgba(0,0,0,0);');

  },

  // Wrap <img> tag so it can perform the effect
  img: function (element) {

    let parent = element.parentNode;

    // If input already have parent just pass through
    if (parent.tagName.toLowerCase() === 'i' && parent.classList.contains('waves-effect')) {
      return;
    }

    // Put element as child
    let wrapper = document.createElement('i');
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);

  }
};

/**
 * Hide the effect and remove the ripple. Must be
 * a separate function to pass the JSLint...
 */
function removeRipple(e, el, ripple) {

  // Check if the ripple still exist
  if (!ripple) {
    return;
  }

  ripple.classList.remove('waves-rippling');

  let relativeX = ripple.getAttribute('data-x');
  let relativeY = ripple.getAttribute('data-y');
  let scale = ripple.getAttribute('data-scale');
  let translate = ripple.getAttribute('data-translate');

  // Get delay beetween mousedown and mouse leave
  let diff = Date.now() - Number(ripple.getAttribute('data-hold'));
  let delay = 350 - diff;

  if (delay < 0) {
    delay = 0;
  }

  if (e.type === 'mousemove') {
    delay = 150;
  }

  // Fade out ripple after delay
  let duration = e.type === 'mousemove' ? 2500 : Effect.duration;

  setTimeout(function () {

    let style = {
      top: relativeY + 'px',
      left: relativeX + 'px',
      opacity: '0',

      // Duration
      '-webkit-transition-duration': duration + 'ms',
      '-moz-transition-duration': duration + 'ms',
      '-o-transition-duration': duration + 'ms',
      'transition-duration': duration + 'ms',
      '-webkit-transform': scale + ' ' + translate,
      '-moz-transform': scale + ' ' + translate,
      '-ms-transform': scale + ' ' + translate,
      '-o-transform': scale + ' ' + translate,
      'transform': scale + ' ' + translate
    };

    ripple.setAttribute('style', convertStyle(style));

    setTimeout(function () {
      try {
        el.removeChild(ripple);
      } catch (e) {
        return false;
      }
    }, duration);

  }, delay);
}


/**
 * Disable mousedown event for 500ms during and after touch
 */
let TouchHandler = {

  /* uses an integer rather than bool so there's no issues with
   * needing to clear timeouts if another touch event occurred
   * within the 500ms. Cannot mouseup between touchstart and
   * touchend, nor in the 500ms after touchend. */
  touches: 0,

  allowEvent: function (e) {

    let allow = true;

    if (/^(mousedown|mousemove)$/.test(e.type) && TouchHandler.touches) {
      allow = false;
    }

    return allow;
  },
  registerEvent: function (e) {
    let eType = e.type;

    if (eType === 'touchstart') {

      TouchHandler.touches += 1; // push

    } else if (/^(touchend|touchcancel)$/.test(eType)) {

      setTimeout(function () {
        if (TouchHandler.touches) {
          TouchHandler.touches -= 1; // pop after 500ms
        }
      }, 500);

    }
  }
};


/**
 * Delegated click handler for .waves-effect element.
 * returns null when .waves-effect element not in "click tree"
 */
function getWavesEffectElement(e) {

  if (TouchHandler.allowEvent(e) === false) {
    return null;
  }

  let element = null;
  let target = e.target || e.srcElement;

  while (target.parentElement) {
    if ((!(target instanceof SVGElement)) && target.classList.contains('waves-effect')) {
      element = target;
      break;
    }
    target = target.parentElement;
  }

  return element;
}

/**
 * Bubble the click and show effect if .waves-effect elem was found
 */
function showEffect(e) {

  // Disable effect if element has "disabled" property on it
  // In some cases, the event is not triggered by the current element
  // if (e.target.getAttribute('disabled') !== null) {
  //     return;
  // }

  let element = getWavesEffectElement(e);

  if (element !== null) {

    // Make it sure the element has either disabled property, disabled attribute or 'disabled' class
    if (element.disabled || element.getAttribute('disabled') || element.classList.contains('disabled')) {
      return;
    }

    TouchHandler.registerEvent(e);

    if (e.type === 'touchstart' && Effect.delay) {

      let hidden = false;

      let timer = setTimeout(function () {
        timer = null;
        Effect.show(e, element);
      }, Effect.delay);

      let hideEffect = function (hideEvent) {

        // if touch hasn't moved, and effect not yet started: start effect now
        if (timer) {
          clearTimeout(timer);
          timer = null;
          Effect.show(e, element);
        }
        if (!hidden) {
          hidden = true;
          Effect.hide(hideEvent, element);
        }

        removeListeners();
      };

      let touchMove = function (moveEvent) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        hideEffect(moveEvent);

        removeListeners();
      };

      element.addEventListener('touchmove', touchMove, false);
      element.addEventListener('touchend', hideEffect, false);
      element.addEventListener('touchcancel', hideEffect, false);

      let removeListeners = function () {
        element.removeEventListener('touchmove', touchMove);
        element.removeEventListener('touchend', hideEffect);
        element.removeEventListener('touchcancel', hideEffect);
      };
    } else {

      Effect.show(e, element);

      if (isTouchAvailable) {
        element.addEventListener('touchend', Effect.hide, false);
        element.addEventListener('touchcancel', Effect.hide, false);
      }

      element.addEventListener('mouseup', Effect.hide, false);
      element.addEventListener('mouseleave', Effect.hide, false);
    }
  }
}

export const Waves = {
  init: function (options?:{duration:number,delay:number}) {
    let body = document.body;

    if(options){
      if ('duration' in options) {
        Effect.duration = options.duration;
      }
  
      if ('delay' in options) {
        Effect.delay = options.delay;
      }
    }


    if (isTouchAvailable) {
      body.addEventListener('touchstart', showEffect, false);
      body.addEventListener('touchcancel', TouchHandler.registerEvent, false);
      body.addEventListener('touchend', TouchHandler.registerEvent, false);
    }

    body.addEventListener('mousedown', showEffect, false);
  },
  attach: function (elements, classes) {

    elements = getWavesElements(elements);

    if (Object.prototype.toString.call(classes) === '[object Array]') {
      classes = classes.join(' ');
    }

    classes = classes ? ' ' + classes : '';

    let element, tagName;

    for (let i = 0, len = elements.length; i < len; i++) {

      element = elements[i];
      tagName = element.tagName.toLowerCase();

      if (['input', 'img'].indexOf(tagName) !== -1) {
        TagWrapper[tagName](element);
        element = element.parentElement;
      }

      if (element.className.indexOf('waves-effect') === -1) {
        element.className += ' waves-effect' + classes;
      }
    }
  },
  ripple: function (elements, options) {
    elements = getWavesElements(elements);
    let elementsLen = elements.length;

    options = options || {};
    options.wait = options.wait || 0;
    options.position = options.position || null; // default = centre of element


    if (elementsLen) {
      let element, pos, off, centre = { x: 0, y: 0 }, i = 0;
      let mousedown = {
        type: 'mousedown',
        button: 1,
        pageX: 0,
        pageY: 0
      };
      let hideRipple = function (mouseup, element) {
        return function () {
          Effect.hide(mouseup, element);
        };
      };

      for (; i < elementsLen; i++) {
        element = elements[i];
        pos = options.position || {
          x: element.clientWidth / 2,
          y: element.clientHeight / 2
        };

        off = offset(element);
        centre.x = off.left + pos.x;
        centre.y = off.top + pos.y;

        mousedown.pageX = centre.x;
        mousedown.pageY = centre.y;

        Effect.show(mousedown, element);

        if (options.wait >= 0 && options.wait !== null) {
          let mouseup = {
            type: 'mouseup',
            button: 1
          };

          setTimeout(hideRipple(mouseup, element), options.wait);
        }
      }
    }
  },
  calm: function (elements) {
    elements = getWavesElements(elements);
    let mouseup = {
      type: 'mouseup',
      button: 1
    };

    for (let i = 0, len = elements.length; i < len; i++) {
      Effect.hide(mouseup, elements[i]);
    }
  },
  displayEffect: function (options) {
    Waves.init(options);
  }
}