// Minimal jQuery shim for ANDI testing
(function() {
  if (typeof window.jQuery !== 'undefined') return;
  
  // Create a minimal jQuery object
  const $ = function(selector) {
    if (typeof selector === 'string') {
      if (selector.startsWith('<')) {
        // Creating element
        const div = document.createElement('div');
        div.innerHTML = selector;
        return {
          appendTo: function(target) {
            const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
            if (targetEl && div.firstChild) {
              targetEl.appendChild(div.firstChild);
            }
            return this;
          }
        };
      } else {
        // Selecting elements
        const elements = document.querySelectorAll(selector);
        return {
          length: elements.length,
          each: function(callback) {
            for (let i = 0; i < elements.length; i++) {
              callback.call(elements[i], i, elements[i]);
            }
            return this;
          },
          addClass: function(className) {
            elements.forEach(el => el.classList.add(className));
            return this;
          },
          removeClass: function(className) {
            elements.forEach(el => el.classList.remove(className));
            return this;
          },
          attr: function(name, value) {
            if (value === undefined) {
              return elements[0] ? elements[0].getAttribute(name) : null;
            }
            elements.forEach(el => el.setAttribute(name, value));
            return this;
          },
          css: function(prop, value) {
            if (typeof prop === 'object') {
              elements.forEach(el => {
                for (const p in prop) {
                  el.style[p] = prop[p];
                }
              });
            } else if (value === undefined) {
              return elements[0] ? window.getComputedStyle(elements[0])[prop] : null;
            } else {
              elements.forEach(el => el.style[prop] = value);
            }
            return this;
          },
          on: function(event, handler) {
            elements.forEach(el => el.addEventListener(event, handler));
            return this;
          },
          off: function(event, handler) {
            elements.forEach(el => el.removeEventListener(event, handler));
            return this;
          },
          click: function(handler) {
            if (handler) {
              return this.on('click', handler);
            } else {
              elements.forEach(el => el.click());
              return this;
            }
          },
          hide: function() {
            elements.forEach(el => el.style.display = 'none');
            return this;
          },
          show: function() {
            elements.forEach(el => el.style.display = '');
            return this;
          },
          html: function(content) {
            if (content === undefined) {
              return elements[0] ? elements[0].innerHTML : null;
            }
            elements.forEach(el => el.innerHTML = content);
            return this;
          },
          text: function(content) {
            if (content === undefined) {
              return elements[0] ? elements[0].textContent : null;
            }
            elements.forEach(el => el.textContent = content);
            return this;
          },
          val: function(value) {
            if (value === undefined) {
              return elements[0] ? elements[0].value : null;
            }
            elements.forEach(el => el.value = value);
            return this;
          },
          append: function(content) {
            elements.forEach(el => {
              if (typeof content === 'string') {
                el.insertAdjacentHTML('beforeend', content);
              } else {
                el.appendChild(content);
              }
            });
            return this;
          }
        };
      }
    } else if (selector === document) {
      return {
        ready: function(callback) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
          } else {
            callback();
          }
        }
      };
    } else if (typeof selector === 'function') {
      // Document ready shorthand
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', selector);
      } else {
        selector();
      }
    }
    return {};
  };
  
  // Add static methods
  $.fn = {};
  $.extend = function(target, ...sources) {
    sources.forEach(source => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    });
    return target;
  };
  
  // Export jQuery
  window.jQuery = window.$ = $;
})();