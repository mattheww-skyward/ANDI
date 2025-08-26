// Enhanced jQuery shim for ANDI testing
(function() {
  if (typeof window.jQuery !== 'undefined') return;
  
  // Create a minimal jQuery object
  const $ = function(selector) {
    if (typeof selector === 'string') {
      if (selector.startsWith('<')) {
        // Creating element
        const div = document.createElement('div');
        div.innerHTML = selector;
        const elements = Array.from(div.children);
        return createJQueryObject(elements);
      } else {
        // Selecting elements
        const elements = Array.from(document.querySelectorAll(selector));
        return createJQueryObject(elements);
      }
    } else if (selector === document) {
      return {
        ready: function(callback) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
          } else {
            callback();
          }
          return this;
        }
      };
    } else if (typeof selector === 'function') {
      // Document ready shorthand
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', selector);
      } else {
        selector();
      }
    } else if (selector && selector.nodeType) {
      // Wrapping a DOM element
      return createJQueryObject([selector]);
    }
    return createJQueryObject([]);
  };
  
  function createJQueryObject(elements) {
    const obj = {
      length: elements.length,
      
      // Array-like access
      get: function(index) {
        return index >= 0 ? elements[index] : elements[elements.length + index];
      },
      
      eq: function(index) {
        return createJQueryObject([this.get(index)].filter(el => el));
      },
      
      first: function() {
        return createJQueryObject(elements.length > 0 ? [elements[0]] : []);
      },
      
      last: function() {
        return createJQueryObject(elements.length > 0 ? [elements[elements.length - 1]] : []);
      },
      
      each: function(callback) {
        for (let i = 0; i < elements.length; i++) {
          const result = callback.call(elements[i], i, elements[i]);
          if (result === false) break;
        }
        return this;
      },
      
      map: function(callback) {
        const results = [];
        for (let i = 0; i < elements.length; i++) {
          const result = callback.call(elements[i], i, elements[i]);
          if (result != null) results.push(result);
        }
        return createJQueryObject(results);
      },
      
      filter: function(selector) {
        const filtered = elements.filter(el => {
          if (typeof selector === 'string') {
            return el.matches(selector);
          } else if (typeof selector === 'function') {
            return selector.call(el, elements.indexOf(el), el);
          }
          return false;
        });
        return createJQueryObject(filtered);
      },
      
      find: function(selector) {
        const found = [];
        elements.forEach(el => {
          found.push(...el.querySelectorAll(selector));
        });
        return createJQueryObject(found);
      },
      
      closest: function(selector) {
        const found = elements.map(el => el.closest(selector)).filter(el => el);
        return createJQueryObject(found);
      },
      
      parent: function() {
        const parents = elements.map(el => el.parentElement).filter(el => el);
        return createJQueryObject(parents);
      },
      
      children: function(selector) {
        const children = [];
        elements.forEach(el => {
          const childNodes = Array.from(el.children);
          if (selector) {
            children.push(...childNodes.filter(child => child.matches(selector)));
          } else {
            children.push(...childNodes);
          }
        });
        return createJQueryObject(children);
      },
      
      addClass: function(className) {
        elements.forEach(el => {
          if (className) {
            className.split(' ').forEach(cls => {
              if (cls.trim()) el.classList.add(cls.trim());
            });
          }
        });
        return this;
      },
      
      removeClass: function(className) {
        elements.forEach(el => {
          if (className) {
            className.split(' ').forEach(cls => {
              if (cls.trim()) el.classList.remove(cls.trim());
            });
          } else {
            el.className = '';
          }
        });
        return this;
      },
      
      hasClass: function(className) {
        return elements.some(el => el.classList.contains(className));
      },
      
      toggleClass: function(className) {
        elements.forEach(el => el.classList.toggle(className));
        return this;
      },
      
      attr: function(name, value) {
        if (value === undefined) {
          return elements[0] ? elements[0].getAttribute(name) : null;
        }
        elements.forEach(el => {
          if (value === null) {
            el.removeAttribute(name);
          } else {
            el.setAttribute(name, value);
          }
        });
        return this;
      },
      
      removeAttr: function(name) {
        elements.forEach(el => el.removeAttribute(name));
        return this;
      },
      
      prop: function(name, value) {
        if (value === undefined) {
          return elements[0] ? elements[0][name] : undefined;
        }
        elements.forEach(el => el[name] = value);
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
          if (elements[0]) {
            const computed = window.getComputedStyle(elements[0]);
            return computed[prop] || elements[0].style[prop];
          }
          return undefined;
        } else {
          elements.forEach(el => el.style[prop] = value);
        }
        return this;
      },
      
      on: function(events, selector, handler) {
        if (typeof selector === 'function') {
          handler = selector;
          selector = undefined;
        }
        
        events.split(' ').forEach(event => {
          elements.forEach(el => {
            if (selector) {
              // Event delegation
              el.addEventListener(event, function(e) {
                if (e.target.matches(selector)) {
                  handler.call(e.target, e);
                }
              });
            } else {
              el.addEventListener(event, handler);
            }
          });
        });
        return this;
      },
      
      off: function(events, handler) {
        events.split(' ').forEach(event => {
          elements.forEach(el => {
            if (handler) {
              el.removeEventListener(event, handler);
            } else {
              // Clone element to remove all listeners
              const newEl = el.cloneNode(true);
              el.parentNode.replaceChild(newEl, el);
            }
          });
        });
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
      
      toggle: function() {
        elements.forEach(el => {
          el.style.display = el.style.display === 'none' ? '' : 'none';
        });
        return this;
      },
      
      html: function(content) {
        if (content === undefined) {
          return elements[0] ? elements[0].innerHTML : '';
        }
        elements.forEach(el => el.innerHTML = content);
        return this;
      },
      
      text: function(content) {
        if (content === undefined) {
          return elements[0] ? elements[0].textContent : '';
        }
        elements.forEach(el => el.textContent = content);
        return this;
      },
      
      val: function(value) {
        if (value === undefined) {
          return elements[0] ? elements[0].value : '';
        }
        elements.forEach(el => el.value = value);
        return this;
      },
      
      append: function(content) {
        elements.forEach(el => {
          if (typeof content === 'string') {
            el.insertAdjacentHTML('beforeend', content);
          } else if (content.nodeType) {
            el.appendChild(content);
          } else if (content.length) {
            // jQuery object
            for (let i = 0; i < content.length; i++) {
              el.appendChild(content[i]);
            }
          }
        });
        return this;
      },
      
      prepend: function(content) {
        elements.forEach(el => {
          if (typeof content === 'string') {
            el.insertAdjacentHTML('afterbegin', content);
          } else if (content.nodeType) {
            el.insertBefore(content, el.firstChild);
          }
        });
        return this;
      },
      
      appendTo: function(target) {
        const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
        if (targetEl) {
          elements.forEach(el => targetEl.appendChild(el));
        }
        return this;
      },
      
      remove: function() {
        elements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        return this;
      },
      
      empty: function() {
        elements.forEach(el => el.innerHTML = '');
        return this;
      },
      
      is: function(selector) {
        return elements.some(el => el.matches(selector));
      },
      
      not: function(selector) {
        const filtered = elements.filter(el => !el.matches(selector));
        return createJQueryObject(filtered);
      },
      
      width: function() {
        return elements[0] ? elements[0].offsetWidth : 0;
      },
      
      height: function() {
        return elements[0] ? elements[0].offsetHeight : 0;
      },
      
      offset: function() {
        if (elements[0]) {
          const rect = elements[0].getBoundingClientRect();
          return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
          };
        }
        return { top: 0, left: 0 };
      },
      
      position: function() {
        if (elements[0]) {
          return {
            top: elements[0].offsetTop,
            left: elements[0].offsetLeft
          };
        }
        return { top: 0, left: 0 };
      },
      
      wrapInner: function(content) {
        elements.forEach(el => {
          const wrapper = document.createElement('div');
          if (typeof content === 'string') {
            wrapper.innerHTML = content;
          } else {
            wrapper.appendChild(content);
          }
          
          // Move all children to the wrapper
          while (el.firstChild) {
            wrapper.appendChild(el.firstChild);
          }
          
          // Add wrapper to element
          el.appendChild(wrapper);
        });
        return this;
      },
      
      wrap: function(content) {
        elements.forEach(el => {
          const wrapper = document.createElement('div');
          if (typeof content === 'string') {
            wrapper.innerHTML = content;
            const wrapperChild = wrapper.firstChild;
            if (wrapperChild) {
              el.parentNode.insertBefore(wrapperChild, el);
              wrapperChild.appendChild(el);
            }
          } else {
            el.parentNode.insertBefore(content, el);
            content.appendChild(el);
          }
        });
        return this;
      }
    };
    
    // Add array-like indexing
    for (let i = 0; i < elements.length; i++) {
      obj[i] = elements[i];
    }
    
    return obj;
  }
  
  // Add static methods
  $.fn = {
    jquery: "3.6.0", // Fake jQuery version that ANDI will accept
    extend: function(obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          this[key] = obj[key];
        }
      }
      return this;
    }
  };
  
  $.extend = function(target, ...sources) {
    sources.forEach(source => {
      if (source) {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      }
    });
    return target;
  };
  
  $.trim = function(str) {
    return str ? str.trim() : '';
  };
  
  $.each = function(obj, callback) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (callback.call(obj[i], i, obj[i]) === false) break;
      }
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (callback.call(obj[key], key, obj[key]) === false) break;
        }
      }
    }
  };
  
  $.inArray = function(elem, arr) {
    return arr.indexOf(elem);
  };
  
  $.isArray = Array.isArray;
  
  $.isFunction = function(obj) {
    return typeof obj === 'function';
  };
  
  $.isPlainObject = function(obj) {
    return obj && typeof obj === 'object' && !obj.nodeType && !$.isArray(obj);
  };
  
  // Sizzle-like selector engine properties
  $.expr = {
    pseudos: {},
    createPseudo: function(fn) {
      return fn;
    }
  };
  
  // Data storage
  const dataCache = new WeakMap();
  $.data = function(element, key, value) {
    if (!dataCache.has(element)) {
      dataCache.set(element, {});
    }
    const cache = dataCache.get(element);
    
    if (value !== undefined) {
      cache[key] = value;
      return value;
    } else if (key !== undefined) {
      return cache[key];
    } else {
      return cache;
    }
  };
  
  // Export jQuery
  window.jQuery = window.$ = $;
})();