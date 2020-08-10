'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var VNodes = {
  functional: true,
  props: {
    vnodes: {
      type: [Array, Object],
      required: true
    }
  },
  render: (h, {
    props
  }) => {
    const nodes = props.vnodes;

    if (Array.isArray(nodes)) {
      return nodes;
    }

    return h(nodes);
  }
};

var InputForm = ((ctx, options, model) => {
  if (!['text', 'select'].includes(options.tag)) {
    throw new Error('[talquei] Invalid input type');
  }

  if (options.tag === 'select') {
    if (!options.options) {
      throw new Error('[talquei] You must pass some items to select');
    }
  }

  const emit = value => {
    ctx.$_next();
    ctx.$emit(model.event, value);
  };

  return {
    name: 'InputForm',
    directives: {
      focus: {
        inserted: el => el.focus()
      }
    },

    render(h) {
      let inputEl;
      const sendIcon = h('svg', {
        attrs: {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 512 512',
          width: '16px',
          height: '16px',
          fill: 'currentColor'
        }
      }, [h('path', {
        attrs: {
          d: 'M277.375 427V167.296l119.702 119.702L427 256 256 85 85 256l29.924 29.922 119.701-118.626V427h42.75z'
        }
      })]);

      const submitButton = cb => h('button', {
        class: 'talquei-form__submit',
        attrs: {
          type: 'submit'
        },
        on: {
          click: () => emit(cb())
        }
      }, ctx.$_submitSlot ? ctx.$_submitSlot : [sendIcon]);

      if (options.tag === 'text') {
        const {
          tag,
          ...attributes
        } = options;
        inputEl = [h('input', {
          class: ['talquei-form__text'],
          attrs: {
            type: 'text',
            ...attributes
          },
          ref: 'text',
          directives: [{
            name: 'focus'
          }]
        }), submitButton(() => this.$refs.text.value)];
      } else if (options.tag === 'select') {
        const itemsKeys = Object.keys(options.options);
        inputEl = [h('div', {
          class: ['talquei-form__select']
        }, itemsKeys.map((key, index) => h('button', {
          attrs: {
            type: 'button'
          },
          class: 'talquei-form__select__item',
          on: {
            click: () => emit(options.options[key])
          },
          directives: [index === 0 ? {
            name: 'focus'
          } : {}] // focus first item

        }, options.options[key])))];
      }

      return h('form', {
        class: 'talquei-form',
        on: {
          submit: evt => {
            evt.preventDefault();
            evt.stopPropagation();
          }
        }
      }, inputEl);
    }

  };
});

//
var script = {
  name: 'TalqueiMessage',
  components: {
    VNodes
  },
  inject: {
    $_next: 'next',
    $_showInput: 'showInput',
    $_avatarSlot: 'avatarSlot',
    $_submitSlot: 'submitSlot',
    $_scrollToTerminal: 'scrollToTerminal'
  },
  model: {
    prop: 'text',
    event: 'input'
  },
  props: {
    input: {
      type: Object,
      required: false,
      default: undefined
    },
    isUser: {
      type: Boolean,
      required: false,
      default: false
    },
    text: {
      type: String,
      required: false,
      default: undefined
    },
    template: {
      type: String,
      required: false,
      default: '{text}'
    }
  },
  data: () => ({
    isEnabled: false,
    isPending: true
  }),
  computed: {
    hasInput() {
      return !!this.$slots.default || !!this.input;
    },

    formattedText: {
      cache: false,

      get() {
        return this.template.replace('{text}', this.text);
      }

    }
  },
  watch: {
    isEnabled(val) {
      if (val) {
        this.renderInput();

        if (!this.isUser) {
          this.showText();
        }
      }
    },

    text: {
      handler(val) {
        if (val && this.isEnabled) {
          this.showText();
        }
      },

      immediate: true
    },

    isPending(val) {
      if (!val && this.isEnabled && !this.hasInput) {
        setTimeout(() => this.$_next(), 1500);
      }
    }

  },
  methods: {
    renderInput() {
      setTimeout(() => {
        if (this.$slots.default) {
          this.$_showInput(this.$slots.default);
        } else if (this.input) {
          const inputComponent = InputForm(this, this.input, this.$options.model);
          this.$_showInput(inputComponent);
        }
      }, 500);
    },

    showText() {
      if (this.isUser) {
        this.isPending = false;
      } else {
        setTimeout(() => this.isPending = false, 500);
      }
    },

    onAfterLeave() {
      setTimeout(() => this.$_scrollToTerminal(), 100);
    },

    run() {
      this.isEnabled = true;
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _vm.isEnabled && (_vm.text || _vm.isUser) ? _c('div', {
    staticClass: "talquei-message",
    class: _vm.isUser ? 'talquei-message--user' : 'talquei-message--app'
  }, [_c('div', {
    staticClass: "talquei-message__avatar"
  }, [!_vm.isUser ? _c('div', [_vm.$_avatarSlot ? _c('VNodes', {
    attrs: {
      "vnodes": _vm.$_avatarSlot
    }
  }) : _c('span', [_vm._v("\n        🤖\n      ")])], 1) : _vm._e()]), _vm._v(" "), _c('div', {
    staticClass: "talquei-message__text"
  }, [_c('Transition', {
    attrs: {
      "name": "talquei--fade",
      "mode": "out-in",
      "duration": _vm.isUser ? 50 : 600
    },
    on: {
      "after-leave": _vm.onAfterLeave
    }
  }, [_vm.isPending ? _c('span', {
    key: "pending",
    staticClass: "talquei--blink talquei-message__text__pending"
  }, [_vm._v("\n        …\n      ")]) : _c('span', {
    key: "text"
  }, [_vm._v("\n        " + _vm._s(_vm.formattedText) + "\n      ")])])], 1)]) : _vm._e();
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

/**
* Based from theomessin/vue-chat-scroll with some changes
* MIT - Theodore Messinezis <theo@theomessin.com>
*/
const scrollToBottom = (el, smooth) => {
  if (typeof el.scroll === 'function') {
    el.scroll({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    });
  } else {
    el.scrollTop = el.scrollHeight;
  }
};

var scrollDown = {
  bind: (el, binding) => {
    let scrolled = false;

    if (el.addEventListener) {
      el.addEventListener('scroll', () => {
        scrolled = el.scrollTop + el.clientHeight + 1 < el.scrollHeight;
      });
    }

    new MutationObserver(e => {
      const config = binding.value || {};
      const pause = config.always === false && scrolled;
      if (pause || e[e.length - 1].addedNodes.length !== 1) return;
      scrollToBottom(el, config.smooth);
    }).observe(el, {
      childList: true,
      subtree: true
    });
  },
  inserted: scrollToBottom
};

//
var script$1 = {
  name: 'Talquei',
  directives: {
    'scroll-down': scrollDown
  },

  provide() {
    return {
      avatarSlot: this.$slots.avatar,
      submitSlot: this.$slots.submit,
      next: this.next,
      showInput: this.showInput,
      scrollToTerminal: this.scrollToTerminal
    };
  },

  components: {
    VNodes
  },
  props: {
    autoRun: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: () => ({
    step: undefined,
    inputNode: undefined,
    messages: []
  }),
  computed: {
    totalSteps() {
      return this.messages.length;
    }

  },
  watch: {
    step(val) {
      this.inputNode = undefined;
      this.runMessage(this.messages[val]);
    }

  },

  mounted() {
    if (this.autoRun) {
      this.init();
    }
  },

  updated() {
    this.scrollToTerminal();
  },

  methods: {
    scrollToTerminal() {
      scrollToBottom(this.$refs.terminal);
    },

    init() {
      this.collectMessages();
      this.step = 0;
    },

    next() {
      this.inputNode = undefined;
      this.collectMessages();
      const nextStep = this.step + 1;

      if (nextStep < this.totalSteps) {
        setTimeout(() => this.step = nextStep, 500);
      } else {
        this.emitComplete();
      }
    },

    emitComplete() {
      this.$emit('complete');
    },

    showInput(vnode) {
      this.inputNode = vnode;
    },

    collectMessages() {
      this.messages = this.$children.filter(node => node.$options.name === __vue_component__.name);
    },

    runMessage(message) {
      if (!message) return;
      message.run();
    }

  }
};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('section', {
    staticClass: "talquei"
  }, [_c('div', {
    directives: [{
      name: "scroll-down",
      rawName: "v-scroll-down"
    }],
    ref: "terminal",
    staticClass: "talquei-terminal"
  }, [_vm._t("default")], 2), _vm._v(" "), _vm.inputNode ? _c('div', {
    staticClass: "talquei-inputbar"
  }, [_c('VNodes', {
    attrs: {
      "vnodes": _vm.inputNode
    }
  })], 1) : _vm._e()]);
};

var __vue_staticRenderFns__$1 = [];
/* style */

const __vue_inject_styles__$1 = undefined;
/* scoped */

const __vue_scope_id__$1 = undefined;
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

function install(Vue) {
  Vue.component(__vue_component__$1.name, __vue_component__$1);
  Vue.component(__vue_component__.name, __vue_component__);
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
}

exports.Talquei = __vue_component__$1;
exports.TalqueiMessage = __vue_component__;
exports.default = install;
