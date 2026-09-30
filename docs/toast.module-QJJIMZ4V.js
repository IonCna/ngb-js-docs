(function () {
  if (globalThis.ɵngjsPlatform) return;
  globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || [];
  globalThis.ɵngjsPlatform = {
    bootstrapModule: function (moduleType) {
      return new Promise(function (resolve, reject) {
        angular.element(document).ready(function () {
          try {
            if (!moduleType || !moduleType.ɵmod) throw new Error("bootstrapModule(): recibe una clase @NgModule compilada.");
            // `ɵresolve` siempre acá: un factory `providedIn: "root"` (`InjectionToken`, receta de `@Injectable`) puede pedirlo
            // aunque ningún `@NgModule` del proyecto lo registre (ver `ResolveDependency`).
            var providers = angular.module("ɵroot.providers", []).factory("ɵresolve", ["$injector", function ($injector) { return function (name, flags, element) {
    flags = flags || {};
    var bounded = element && (flags.self || flags.host);
    if (!bounded && $injector.has(name)) return $injector.get(name);
    if (flags.optional) return null;
    throw new Error("ɵresolve: no hay provider para \"" + name + "\"" + (bounded ? " con { " + (flags.self ? "self" : "host") + ": true } (sin injector de elemento)" : "") + ".");
  }; }]);
            globalThis.ɵngjsRootProviders.forEach(function (provider) { providers.factory(provider[0], provider[1]); });
            providers.config(["$provide", "$injector", function ($provide, providerInjector) {
              var defaults = providerInjector.ɵrootDefaults = {};
              globalThis.ɵngjsRootProviders.forEach(function (provider) { defaults[provider[0]] = true; });
              ["provider", "factory", "service", "value", "constant"].forEach(function (method) {
                var original = $provide[method];
                $provide[method] = function (name) {
                  if (typeof name === "string") delete defaults[name];
                  return original.apply(this, arguments);
                };
              });
            }]);
            var registerLateRoot;
            providers.config(["$provide", "$injector", function ($provide, providerInjector) {
              registerLateRoot = function (provider) {
                if (providerInjector.has(provider[0] + "Provider")) return;
                $provide.factory(provider[0], provider[1]);
                if (providerInjector.ɵrootDefaults) providerInjector.ɵrootDefaults[provider[0]] = true;
              };
            }]);
            angular.module("ɵroot", ["ɵroot.providers", moduleType.ɵmod.id]);
            var host = document.body;
            (moduleType.ɵmod.bootstrap || []).forEach(function (tag) { if (!host.querySelector(tag)) host.appendChild(document.createElement(tag)); });
            var injector = angular.bootstrap(host, ["ɵroot"]);
            // El patch de ZonePatchesRuntime (setTimeout/addEventListener/Promise.then) necesita ESTE
            // $rootScope para saber a qué aplicarle $apply — no existe hasta que el bootstrap de verdad corrió.
            globalThis.ɵngjsRootScope = injector.get("$rootScope");
            globalThis.ɵngjsInjector = injector;
            var queue = globalThis.ɵngjsRootProviders;
            if (!queue.ɵlateRoot) {
              var push = queue.push;
              queue.ɵlateRoot = [];
              queue.push = function () {
                var added = Array.prototype.slice.call(arguments);
                var length = push.apply(queue, added);
                added.forEach(function (provider) { queue.ɵlateRoot.forEach(function (register) { register(provider); }); });
                return length;
              };
            }
            queue.ɵlateRoot.push(registerLateRoot);
            var initializers = globalThis.ɵngjsAppInitializers || [];
            globalThis.ɵngjsAppInitializers = [];
            Promise.all(initializers.map(function (initializer) { return initializer(injector); })).then(function () {
              resolve(injector);
            }, reject);
          } catch (error) { reject(error); }
        });
      });
    },
  };
})();
(function () {
  if (globalThis.ɵngjsZonePatched) return;
  globalThis.ɵngjsZonePatched = true;

  function ɵsafeApply() {
    var scope = globalThis.ɵngjsRootScope;
    // Un `$rootScope` destruido (app destruida) queda con `$root = null`: un timer pendiente ya no tiene a quién aplicarle.
    if (!scope || !scope.$root || scope.$root.$$phase) return;
    scope.$apply();
  }

  // `NgZone.runOutsideAngular(fn)` sube `globalThis.ɵngjsOutsideAngular` mientras corre `fn`: lo que se programe ahí
  // (timer, listener, `.then`) no dispara digest al correr — se decide al PROGRAMARLO, como la zona de Angular.
  function ɵinside() {
    return !(globalThis.ɵngjsOutsideAngular > 0);
  }

  // Corre un callback en la zona donde se programó: adentro, digest al terminar; afuera, con el contador arriba —
  // lo que el callback programe también queda afuera (en Zone.js una tarea corre en su zona). Sin esto, un `.then`
  // programado afuera (el `update()` de popper) que toca el DOM agendaba trabajo "adentro" y volvía a disparar digest.
  function ɵrunIn(inside, fn, self, args) {
    if (inside) {
      var result = fn.apply(self, args);
      ɵsafeApply();
      return result;
    }
    globalThis.ɵngjsOutsideAngular = (globalThis.ɵngjsOutsideAngular || 0) + 1;
    try {
      return fn.apply(self, args);
    } finally {
      globalThis.ɵngjsOutsideAngular--;
    }
  }

  var ɵsetTimeout = window.setTimeout;
  window.setTimeout = function (fn, delay) {
    if (typeof fn !== "function") return ɵsetTimeout.apply(window, arguments);
    var extra = Array.prototype.slice.call(arguments, 2);
    var inside = ɵinside();
    return ɵsetTimeout.call(window, function () { ɵrunIn(inside, fn, null, extra); }, delay);
  };

  if (typeof window.requestAnimationFrame === "function") {
    var ɵrequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function (fn) {
      if (typeof fn !== "function") return ɵrequestAnimationFrame.apply(window, arguments);
      var inside = ɵinside();
      return ɵrequestAnimationFrame.call(window, function (time) { ɵrunIn(inside, fn, null, [time]); });
    };
  }

  if (typeof window.queueMicrotask === "function") {
    var ɵqueueMicrotask = window.queueMicrotask;
    window.queueMicrotask = function (fn) {
      if (typeof fn !== "function") return ɵqueueMicrotask.apply(window, arguments);
      var inside = ɵinside();
      return ɵqueueMicrotask.call(window, function () { ɵrunIn(inside, fn, null, []); });
    };
  }

  // Observers nativos (como `patchClass` de Zone.js): el callback corre en la zona donde se CONSTRUYÓ el observer.
  // El constructor parcheado comparte `prototype` con el nativo (`instanceof` sigue andando) y respeta `new.target`
  // (una subclase del dev hereda del parcheado).
  function ɵpatchObserver(name) {
    var Native = window[name];
    if (typeof Native !== "function") return;
    var Patched = function (callback, options) {
      var inside = ɵinside();
      var wrapped = typeof callback === "function"
        ? function () { return ɵrunIn(inside, callback, this, arguments); }
        : callback;
      return Reflect.construct(Native, [wrapped, options], new.target || Patched);
    };
    Patched.prototype = Native.prototype;
    Object.setPrototypeOf(Patched, Native);
    window[name] = Patched;
  }
  ɵpatchObserver("IntersectionObserver");
  ɵpatchObserver("MutationObserver");
  ɵpatchObserver("ResizeObserver");

  var ɵsetInterval = window.setInterval;
  window.setInterval = function (fn, delay) {
    if (typeof fn !== "function") return ɵsetInterval.apply(window, arguments);
    var extra = Array.prototype.slice.call(arguments, 2);
    var inside = ɵinside();
    return ɵsetInterval.call(window, function () { ɵrunIn(inside, fn, null, extra); }, delay);
  };

  // Los `resolve`/`reject` nativos de una promesa (sin nombre, sin `prototype`): los pasa el motor cuando una promesa
  // se resuelve con otra (el "thenable job"), desde su propio microtask. No es trabajo de la app — los `.then` de la
  // app sobre la promesa de afuera ya disparan su digest — y contarlo "adentro" encadenaba digests sin fin.
  var ɵfnToString = Function.prototype.toString;
  function ɵisResolver(fn) {
    return typeof fn === "function" && fn.name === "" && !("prototype" in fn) && ɵfnToString.call(fn).indexOf("[native code]") !== -1;
  }

  var ɵthen = Promise.prototype.then;
  Promise.prototype.then = function (onFulfilled, onRejected) {
    if (ɵisResolver(onFulfilled) && ɵisResolver(onRejected)) return ɵthen.call(this, onFulfilled, onRejected);
    var inside = ɵinside();
    var wrap = function (fn) {
      return typeof fn === "function" ? function (value) { return ɵrunIn(inside, fn, undefined, [value]); } : fn;
    };
    return ɵthen.call(this, wrap(onFulfilled), wrap(onRejected));
  };

  // listener original -> [{ target, type, capture, wrapped }] — así `removeEventListener` encuentra el wrapper
  // real que quedó registrado EN ESE target (no el original, que nunca se le pasó al `addEventListener` nativo;
  // ni el de otro elemento que comparte el mismo handler).
  var ɵwrappers = new WeakMap();
  var ɵaddEventListener = EventTarget.prototype.addEventListener;
  var ɵremoveEventListener = EventTarget.prototype.removeEventListener;

  function ɵfindWrapper(entries, target, type, capture) {
    if (!entries) return -1;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].target === target && entries[i].type === type && entries[i].capture === capture) return i;
    }
    return -1;
  }

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (typeof listener !== "function") return ɵaddEventListener.call(this, type, listener, options);
    var capture = typeof options === "boolean" ? options : !!(options && options.capture);
    var entries = ɵwrappers.get(listener);
    // Como el nativo: el mismo listener dos veces en el mismo target/tipo/fase se registra una sola vez.
    if (ɵfindWrapper(entries, this, type, capture) !== -1) return;
    var once = typeof options === "object" && options !== null && !!options.once;
    var signal = typeof options === "object" && options !== null ? options.signal : undefined;
    // Con una señal ya abortada el nativo no registra nada: tampoco hay que anotarlo.
    if (signal && signal.aborted) return ɵaddEventListener.call(this, type, listener, options);
    if (!entries) { entries = []; ɵwrappers.set(listener, entries); }
    var inside = ɵinside();
    var entry = { target: this, type: type, capture: capture, wrapped: null };
    // `once`/`signal`: el navegador saca el listener solo, sin pasar por `removeEventListener` — la entrada se
    // olvida acá, o volver a registrar el mismo handler quedaría bloqueado por el chequeo de duplicados.
    entry.wrapped = function (event) {
      if (once) ɵforget(entries, entry);
      return ɵrunIn(inside, listener, this, [event]);
    };
    entries.push(entry);
    if (signal) ɵaddEventListener.call(signal, "abort", function () { ɵforget(entries, entry); }, { once: true });
    return ɵaddEventListener.call(this, type, entry.wrapped, options);
  };

  function ɵforget(entries, entry) {
    var index = entries.indexOf(entry);
    if (index !== -1) entries.splice(index, 1);
  }

  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (typeof listener !== "function") return ɵremoveEventListener.call(this, type, listener, options);
    var capture = typeof options === "boolean" ? options : !!(options && options.capture);
    var entries = ɵwrappers.get(listener);
    var index = ɵfindWrapper(entries, this, type, capture);
    var registered = listener;
    if (index !== -1) {
      registered = entries[index].wrapped;
      entries.splice(index, 1);
    }
    return ɵremoveEventListener.call(this, type, registered, options);
  };

  // Handlers por propiedad (`el.onclick = fn`, `xhr.onload = fn`, `ws.onmessage = fn`), como `patchOnProperties` de
  // Zone.js: el setter guarda un wrapper que corre en la zona donde se ASIGNÓ; el getter devuelve el original (el dev
  // compara/lee lo que asignó). El valor de retorno se respeta (`return false`, `onbeforeunload`).
  var ɵonHandlers = new WeakMap();
  function ɵpatchOnProperties(target) {
    if (!target) return;
    Object.getOwnPropertyNames(target).forEach(function (name) {
      if (name.slice(0, 2) !== "on") return;
      var desc = Object.getOwnPropertyDescriptor(target, name);
      if (!desc || !desc.get || !desc.set || !desc.configurable) return;
      Object.defineProperty(target, name, {
        configurable: true,
        enumerable: desc.enumerable,
        get: function () {
          var current = desc.get.call(this);
          var handlers = ɵonHandlers.get(this);
          var entry = handlers && handlers[name];
          return entry && entry.wrapped === current ? entry.original : current;
        },
        set: function (fn) {
          var handlers = ɵonHandlers.get(this);
          if (typeof fn !== "function") {
            if (handlers) delete handlers[name];
            return desc.set.call(this, fn);
          }
          var inside = ɵinside();
          var wrapped = function () { return ɵrunIn(inside, fn, this, arguments); };
          if (!handlers) { handlers = {}; ɵonHandlers.set(this, handlers); }
          handlers[name] = { original: fn, wrapped: wrapped };
          desc.set.call(this, wrapped);
        },
      });
    });
  }
  ɵpatchOnProperties(window);
  [
    "Window", "Document", "Element", "HTMLElement", "SVGElement", "HTMLBodyElement", "HTMLFrameSetElement",
    "XMLHttpRequest", "XMLHttpRequestEventTarget", "WebSocket", "FileReader", "Worker", "MessagePort",
    "EventSource", "IDBRequest", "IDBOpenDBRequest", "IDBTransaction", "IDBDatabase", "Notification",
    "MediaQueryList", "BroadcastChannel", "AbortSignal",
  ].forEach(function (name) {
    var ctor = window[name];
    if (typeof ctor === "function") ɵpatchOnProperties(ctor.prototype);
  });
})();
import {
  NgbCollapseModule
} from "./chunk-MUNJYMJR.js";
import {
  NgbNavModule
} from "./chunk-BZN72FJP.js";
import {
  NgbConfig,
  NgbScrollSpyModule
} from "./chunk-F2WOA7SZ.js";
import {
  RouterModule
} from "./chunk-7ZRTBL6U.js";
import "./chunk-S4GGKWRG.js";
import {
  NgZone,
  TemplateRef,
  inject,
  ngbRunTransition,
  reflow,
  take
} from "./chunk-AUA2A2I3.js";
import {
  CommonModule,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-MUYIROFI.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/toast/toast.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-XHGDWMZ5.js
var import_angular = __toESM(require_angular(), 1);
var NgbToastConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbToastConfig"] ? globalThis.ɵngjsInjected["NgbToastConfig"][0] : inject(NgbConfig);
    this.autohide = true;
    this.delay = 5e3;
    this.ariaLive = "polite";
  }
};
NgbToastConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbToastConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbToastConfig": [
        i0
      ]
    };
    try {
      var instance = new NgbToastConfig();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbToastConfig.ɵprov = {
  token: "NgbToastConfig_cf333917",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbToastConfig_cf333917",
  NgbToastConfig.ɵfac
]);
var NgbToastHeader = class {
};
NgbToastHeader.ɵfac = [
  "$element",
  "$scope",
  function NgbToastHeader_Factory($element, $scope) {
    var instance = new NgbToastHeader();
    return instance;
  }
];
NgbToastHeader.ɵdir = {
  selectors: [
    [
      "",
      "ngbToastHeader",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbToastHeader.ɵfac.ɵtype = NgbToastHeader;
var ngbToastFadeInTransition = (element, animation) => {
  const { classList } = element;
  if (animation) {
    classList.add("fade");
  } else {
    classList.add("show");
    return;
  }
  reflow(element);
  classList.add("show", "showing");
  return () => {
    classList.remove("showing");
  };
};
var ngbToastFadeOutTransition = ({ classList }) => {
  classList.add("showing");
  return () => {
    classList.remove("show", "showing");
  };
};
var NgbToast = class {
  get _ariaLive() {
    return this.ariaLive;
  }
  get _fade() {
    return this.animation;
  }
  constructor(ariaLive) {
    this.ariaLive = ariaLive;
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbToast"] ? globalThis.ɵngjsInjected["NgbToast"][0] : inject(NgbToastConfig);
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbToast"] ? globalThis.ɵngjsInjected["NgbToast"][1] : inject(NgZone);
    this._element = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbToast"] ? globalThis.ɵngjsInjected["NgbToast"][2] : inject(ElementRef);
    this._timeoutID = null;
    this.animation = this._config.animation;
    this.delay = this._config.delay;
    this.autohide = this._config.autohide;
    this.contentHeaderTpl = null;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._role = "alert";
    this._ariaAtomic = "true";
    this._toast = true;
    this.ariaLive ??= this._config.ariaLive;
  }
  ngAfterContentInit() {
    this._zone.onStable.pipe(take(1)).subscribe(() => {
      this._init();
      this.show();
    });
  }
  ngOnChanges(changes) {
    if ("autohide" in changes) {
      this._clearTimeout();
      this._init();
    }
  }
  hide() {
    this._clearTimeout();
    const transition = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeOutTransition, {
      animation: this.animation,
      runningTransition: "stop"
    });
    transition.subscribe(() => {
      this.hidden.emit();
    });
    return transition;
  }
  show() {
    const transition = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeInTransition, {
      animation: this.animation,
      runningTransition: "continue"
    });
    transition.subscribe(() => {
      this.shown.emit();
    });
    return transition;
  }
  _init() {
    if (this.autohide && !this._timeoutID) {
      this._timeoutID = setTimeout(() => this.hide(), this.delay);
    }
  }
  _clearTimeout() {
    if (this._timeoutID) {
      clearTimeout(this._timeoutID);
      this._timeoutID = null;
    }
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-toast{display:block}ngb-toast .toast-header .close[_content-d999cd07]{margin-left:auto;margin-bottom:0.25rem}";
  document.head.appendChild(s);
})();
NgbToast.ɵfac = [
  "NgbToastConfig_cf333917",
  "NgZone_31031859",
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbToast_Factory(i0, i1, i2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbToast": [
        i0,
        i1,
        i2
      ]
    };
    try {
      var instance = new NgbToast($element[0].getAttribute("aria-live"));
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._ariaAtomic;
    }, function(v) {
      v == null ? $element.removeAttr("aria-atomic") : $element.attr("aria-atomic", String(v));
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._toast;
    }, function(v) {
      v ? $element.addClass("toast") : $element.removeClass("toast");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaLive;
    }, function(v) {
      v == null ? $element.removeAttr("aria-live") : $element.attr("aria-live", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._fade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v == null ? $element.removeAttr("aria-atomic") : $element.attr("aria-atomic", String(v));
      })(instance._ariaAtomic);
      (function(v) {
        v ? $element.addClass("toast") : $element.removeClass("toast");
      })(instance._toast);
      (function(v) {
        v == null ? $element.removeAttr("aria-live") : $element.attr("aria-live", String(v));
      })(instance._ariaLive);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fade);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
    });
    return instance;
  }
];
NgbToast.ɵcmp = {
  selectors: [
    [
      "ngb-toast"
    ]
  ],
  inputs: {
    "animation": "animation",
    "delay": "delay",
    "autohide": "autohide",
    "header": "header"
  },
  outputs: {
    "shown": "shown",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbToast"
  ],
  queries: [
    {
      propertyName: "contentHeaderTpl",
      first: true,
      descendants: true,
      static: true,
      get predicate() {
        return NgbToastHeader;
      },
      get read() {
        return TemplateRef;
      }
    }
  ],
  viewQueries: [
    {
      propertyName: "headerTpl",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "headerTpl"
      ],
      get read() {
        return TemplateRef;
      }
    }
  ],
  definition: {
    "template": '<ng-template ng-ref="headerTpl" _content-d999cd07="">\n    <strong class="me-auto" _content-d999cd07="">{{ $.header }}</strong>\n</ng-template>\n\n<div ng-if="$.contentHeaderTpl || $.header" class="toast-header" _content-d999cd07="">\n    <ng-container ng-template-outlet="$.contentHeaderTpl || $.headerTpl" _content-d999cd07=""></ng-container>\n    <button type="button" class="btn-close" aria-label="Close" ng-click="$.hide()" _content-d999cd07=""></button>\n</div>\n\n<div class="toast-body" _content-d999cd07="">\n    <ng-content _content-d999cd07=""></ng-content>\n</div>',
    "bindings": {
      "animation": "<?",
      "delay": "<?",
      "autohide": "<?",
      "header": "@?",
      "shown": "&?",
      "hidden": "&?"
    },
    "transclude": true
  }
};
NgbToast.ɵfac.ɵcomponent = true;
NgbToast.ɵfac.ɵtype = NgbToast;
NgbToast.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["animation"];
    if (!c) return;
    changes["animation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["delay"];
    if (!c) return;
    changes["delay"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["autohide"];
    if (!c) return;
    changes["autohide"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["header"];
    if (!c) return;
    changes["header"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  this.ngOnChanges(changes);
};
NgbToast.prototype.$postLink = function() {
  this.ngAfterContentInit();
};
var NgbToastModule = class {
};
NgbToastModule.ɵfac = [
  function NgbToastModule_Factory() {
    return new NgbToastModule();
  }
];
NgbToastModule.ɵmod = {
  id: "NgbToastModule_90bbc7b7",
  controllerAs: "$"
};
import_angular.default.module("NgbToastModule_90bbc7b7", [
  typeof CommonModule === "string" ? CommonModule : CommonModule.ɵmod ? CommonModule.ɵmod.id : CommonModule.name
]).factory("ɵresolve", [
  "$injector",
  function($injector) {
    return function(name, flags, element) {
      flags = flags || {};
      var bounded = element && (flags.self || flags.host);
      if (!bounded && $injector.has(name)) return $injector.get(name);
      if (flags.optional) return null;
      throw new Error('ɵresolve: no hay provider para "' + name + '"' + (bounded ? " con { " + (flags.self ? "self" : "host") + ": true } (sin injector de elemento)" : "") + ".");
    };
  }
]).component("ngbToast", {
  controller: NgbToast.ɵfac,
  template: '<ng-template ng-ref="headerTpl" _content-d999cd07="">\n    <strong class="me-auto" _content-d999cd07="">{{ $.header }}</strong>\n</ng-template>\n\n<div ng-if="$.contentHeaderTpl || $.header" class="toast-header" _content-d999cd07="">\n    <ng-container ng-template-outlet="$.contentHeaderTpl || $.headerTpl" _content-d999cd07=""></ng-container>\n    <button type="button" class="btn-close" aria-label="Close" ng-click="$.hide()" _content-d999cd07=""></button>\n</div>\n\n<div class="toast-body" _content-d999cd07="">\n    <ng-content _content-d999cd07=""></ng-content>\n</div>',
  controllerAs: "$",
  bindings: {
    "animation": "<?",
    "delay": "<?",
    "autohide": "<?",
    "header": "@?",
    "shown": "&?",
    "hidden": "&?"
  },
  transclude: true
}).directive("ngbToast", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "shown",
          "hidden"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbToastHeader", function() {
  return {
    controller: NgbToastHeader.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbToastHeader"
  };
}).factory("NgbToastModule_b8dfc097", NgbToastModule.ɵfac).run([
  "NgbToastModule_b8dfc097",
  function() {
  }
]);

// src/app/features/toast/toast.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Toast",
      tabs: [
        {
          name: "Examples",
          to: "/components/toast/examples"
        },
        {
          name: "Api",
          to: "/components/toast/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/toasts/",
        ngBootstrap: "components/toast/overview"
      }
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "examples"
      },
      {
        path: "examples",
        data: {
          sections: [
            {
              id: "inline-toast",
              name: "Declarative inline usage"
            },
            {
              id: "template-header-toast",
              name: "Template header"
            },
            {
              id: "closeable-toast",
              name: "Closeable toast"
            },
            {
              id: "prevent-autohide-toast",
              name: "Prevent autohide"
            },
            {
              id: "toast-management",
              name: "Management service"
            }
          ]
        },
        loadComponent: () => import("./toast-examples-page.component-I45P36AT.js").then((m) => m.ToastExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-toast",
              name: "NgbToast"
            },
            {
              id: "ngb-toast-header",
              name: "NgbToastHeader"
            },
            {
              id: "ngb-toast-config",
              name: "NgbToastConfig"
            }
          ]
        },
        loadComponent: () => import("./toast-api-page.component-EJ3P4T7C.js").then((m) => m.ToastApiPageComponent)
      }
    ]
  }
];

// src/app/features/toast/components/closeable-toast/closeable-toast.component.ts
var CloseableToastComponent = class {
  close() {
    this.visible = false;
    this.reopenTimer = setTimeout(() => {
      this.visible = true;
    }, 3e3);
  }
  ngOnDestroy() {
    if (this.reopenTimer) clearTimeout(this.reopenTimer);
  }
  constructor() {
    this.visible = true;
  }
};
(function() {
  var h = "styles/closeable-toast.component-18ac57f1.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
CloseableToastComponent.ɵfac = [
  "$element",
  "$scope",
  function CloseableToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new CloseableToastComponent();
    return instance;
  }
];
CloseableToastComponent.ɵcmp = {
  selectors: [
    [
      "docs-closeable-toast"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/closeable-toast.component-84489704.html",
    "controllerAs": "example"
  }
};
CloseableToastComponent.ɵfac.ɵcomponent = true;
CloseableToastComponent.ɵfac.ɵtype = CloseableToastComponent;
CloseableToastComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/toast/components/inline-toast/inline-toast.component.ts
var InlineToastComponent = class {
  constructor() {
    this.showHeaderToast = true;
  }
};
(function() {
  var h = "styles/inline-toast.component-4fd34267.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
InlineToastComponent.ɵfac = [
  "$element",
  "$scope",
  function InlineToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new InlineToastComponent();
    return instance;
  }
];
InlineToastComponent.ɵcmp = {
  selectors: [
    [
      "docs-inline-toast"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/inline-toast.component-26b8a5f4.html",
    "controllerAs": "example"
  }
};
InlineToastComponent.ɵfac.ɵcomponent = true;
InlineToastComponent.ɵfac.ɵtype = InlineToastComponent;

// src/app/features/toast/components/prevent-autohide-toast/prevent-autohide-toast.component.ts
var PreventAutohideToastComponent = class {
  show() {
    this.visible = false;
    this.autohide = true;
    setTimeout(() => this.visible = true);
  }
  hide() {
    this.visible = false;
    this.autohide = true;
  }
  constructor() {
    this.visible = false;
    this.autohide = true;
  }
};
(function() {
  var h = "styles/prevent-autohide-toast.component-fdb75b69.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PreventAutohideToastComponent.ɵfac = [
  "$element",
  "$scope",
  function PreventAutohideToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PreventAutohideToastComponent();
    return instance;
  }
];
PreventAutohideToastComponent.ɵcmp = {
  selectors: [
    [
      "docs-prevent-autohide-toast"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/prevent-autohide-toast.component-cbb705d3.html",
    "controllerAs": "example"
  }
};
PreventAutohideToastComponent.ɵfac.ɵcomponent = true;
PreventAutohideToastComponent.ɵfac.ɵtype = PreventAutohideToastComponent;

// src/app/features/toast/components/template-header-toast/template-header-toast.component.ts
var TemplateHeaderToastComponent = class {
  constructor() {
    this.visible = true;
  }
};
(function() {
  var h = "styles/template-header-toast.component-159d5e5a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TemplateHeaderToastComponent.ɵfac = [
  "$element",
  "$scope",
  function TemplateHeaderToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TemplateHeaderToastComponent();
    return instance;
  }
];
TemplateHeaderToastComponent.ɵcmp = {
  selectors: [
    [
      "docs-template-header-toast"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/template-header-toast.component-d20c61b2.html",
    "controllerAs": "example"
  }
};
TemplateHeaderToastComponent.ɵfac.ɵcomponent = true;
TemplateHeaderToastComponent.ɵfac.ɵtype = TemplateHeaderToastComponent;

// src/app/features/toast/components/toast-management/toast-management.component.ts
var DocsToastService = class {
  show(body, options = {}) {
    this.toasts.push({
      id: ++this.nextId,
      body,
      ...options
    });
  }
  remove(toast) {
    const index = this.toasts.indexOf(toast);
    if (index >= 0) this.toasts.splice(index, 1);
  }
  clear() {
    this.toasts.length = 0;
  }
  constructor() {
    this.toasts = [];
    this.nextId = 0;
  }
};
var ToastManagementComponent = class {
  constructor(toastService) {
    this.toastService = toastService;
  }
  showStandard() {
    this.toastService.show("I am a standard toast.");
  }
  showSuccess() {
    this.toastService.show("Your changes were saved.", {
      className: "bg-success text-white",
      delay: 8e3
    });
  }
  showDanger() {
    this.toastService.show("The operation could not be completed.", {
      className: "bg-danger text-white",
      delay: 1e4
    });
  }
  ngOnDestroy() {
    this.toastService.clear();
  }
};
(function() {
  var h = "styles/toast-management.component-2b736c2a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DocsToastService.ɵfac = [
  function DocsToastService_Factory() {
    return new DocsToastService();
  }
];
DocsToastService.ɵprov = {
  token: "DocsToastService_8bbd794d"
};
ToastManagementComponent.ɵfac = [
  "DocsToastService_8bbd794d",
  "$element",
  "$scope",
  function ToastManagementComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ToastManagementComponent(a0);
    return instance;
  }
];
ToastManagementComponent.ɵcmp = {
  selectors: [
    [
      "docs-toast-management"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/toast-management.component-3986e699.html",
    "controllerAs": "example"
  }
};
ToastManagementComponent.ɵfac.ɵcomponent = true;
ToastManagementComponent.ɵfac.ɵtype = ToastManagementComponent;
ToastManagementComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/toast/toast.module.ts
function ɵtokenName(token) {
  if (typeof token === "string") return token;
  if (token && token.ɵprov) return token.ɵprov.token;
  throw new Error("ModuleWithProviders: el token " + String(token && token.name || token) + " no tiene nombre de DI en runtime (solo un string, una clase con @Injectable o un InjectionToken) — si es una clase, agregale @Injectable().");
}
function ɵownFactory(cls) {
  if (Object.prototype.hasOwnProperty.call(cls, "ɵfac")) return cls.ɵfac;
  if (cls.ɵfac) throw new Error('"' + cls.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
  return [
    function() {
      return new cls();
    }
  ];
}
function ɵimportedModuleName(imported) {
  var module = imported && imported.ngModule ? imported.ngModule : imported;
  if (typeof module === "string") return module;
  return module.ɵmod ? module.ɵmod.id : module.name;
}
function ɵregisterProvider(module, key, provider) {
  if ("useValue" in provider) return module.value(key, provider.useValue);
  if (provider.useFactory) return module.factory(key, (provider.deps || []).map(ɵtokenName).concat([
    provider.useFactory
  ]));
  if (provider.useExisting) return module.factory(key, [
    ɵtokenName(provider.useExisting),
    function(existing) {
      return existing;
    }
  ]);
  var cls = provider.useClass || provider.provide;
  if (typeof cls !== "function") throw new Error('ModuleWithProviders: provider de "' + key + '" sin receta y sin clase en provide.');
  if (!provider.deps) return module.factory(key, provider.ɵbare && Object.prototype.hasOwnProperty.call(cls, "ɵprov") && cls.ɵprov.factory || ɵownFactory(cls));
  return module.factory(key, provider.deps.map(ɵtokenName).concat([
    function() {
      return new (Function.prototype.bind.apply(cls, [
        null
      ].concat(Array.prototype.slice.call(arguments))))();
    }
  ]));
}
function ɵimportProviders(module, imports) {
  var providers = [];
  var flatten = function(list) {
    for (var i2 = 0; i2 < list.length; i2++) Array.isArray(list[i2]) ? flatten(list[i2]) : providers.push(list[i2]);
  };
  for (var i = 0; i < imports.length; i++) if (imports[i] && imports[i].ngModule) flatten(imports[i].providers || []);
  var single = {};
  var multi = {};
  for (var j = 0; j < providers.length; j++) {
    var raw = providers[j];
    var provider = typeof raw === "function" ? {
      provide: raw,
      ɵbare: true
    } : raw;
    var token = ɵtokenName(provider.provide);
    if (provider.multi ? single[token] : multi[token]) {
      throw new Error('ModuleWithProviders: mezcla providers multi y no-multi para el token "' + token + '".');
    }
    if (provider.multi) (multi[token] = multi[token] || []).push(provider);
    else single[token] = provider;
  }
  for (var name in single) ɵregisterProvider(module, name, single[name]);
  for (var multiName in multi) {
    var members = multi[multiName].map(function(_, index) {
      return multiName + "#multi#" + module.name + "#import#" + index;
    });
    for (var k = 0; k < members.length; k++) ɵregisterProvider(module, members[k], multi[multiName][k]);
    module.config(ɵmultiConfig(multiName, members));
  }
  return module;
}
function ɵmultiMixError(token) {
  return new Error('Multi-providers: mezcla providers multi y no-multi para el token "' + token + '" entre módulos.');
}
function ɵmultiProviders($provide, providers, token, members) {
  var state = providers.ɵmulti;
  if (!state) {
    state = providers.ɵmulti = {
      tokens: {},
      factory: $provide.factory
    };
    [
      "provider",
      "factory",
      "service",
      "value",
      "constant"
    ].forEach(function(method) {
      var original = $provide[method];
      $provide[method] = function(name) {
        if (typeof name === "string" && Object.prototype.hasOwnProperty.call(state.tokens, name)) throw ɵmultiMixError(name);
        return original.apply(this, arguments);
      };
    });
  }
  var rootDefault = providers.ɵrootDefaults && providers.ɵrootDefaults[token];
  if (!state.tokens[token] && providers.has(token + "Provider") && !rootDefault) throw ɵmultiMixError(token);
  state.tokens[token] = (state.tokens[token] || []).concat(members);
  state.factory(token, state.tokens[token].concat([
    function() {
      return Array.prototype.slice.call(arguments);
    }
  ]));
}
function ɵmultiConfig(token, members) {
  return [
    "$provide",
    "$injector",
    function($provide, providers) {
      ɵmultiProviders($provide, providers, token, members);
    }
  ];
}
var ToastModule = class {
};
ToastModule.ɵfac = [
  function ToastModule_Factory() {
    return new ToastModule();
  }
];
var ɵToastModule_import0 = RouterModule.forChild(routes);
ToastModule.ɵmod = {
  id: "ToastModule_0901b02f"
};
ɵimportProviders(import_angular2.default.module("ToastModule_0901b02f", [
  typeof NgbToastModule === "string" ? NgbToastModule : NgbToastModule.ɵmod ? NgbToastModule.ɵmod.id : NgbToastModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  ɵimportedModuleName(ɵToastModule_import0)
]), [
  ɵToastModule_import0
]).factory("DocsToastService_8bbd794d", Object.prototype.hasOwnProperty.call(DocsToastService, "ɵprov") && DocsToastService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(DocsToastService, "ɵfac") ? DocsToastService.ɵfac : DocsToastService.ɵfac ? (function() {
  throw new Error('"' + DocsToastService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new DocsToastService();
  }
])).component("docsCloseableToast", {
  controller: CloseableToastComponent.ɵfac,
  templateUrl: "templates/closeable-toast.component-84489704.html",
  controllerAs: "example"
}).component("docsInlineToast", {
  controller: InlineToastComponent.ɵfac,
  templateUrl: "templates/inline-toast.component-26b8a5f4.html",
  controllerAs: "example"
}).component("docsPreventAutohideToast", {
  controller: PreventAutohideToastComponent.ɵfac,
  templateUrl: "templates/prevent-autohide-toast.component-cbb705d3.html",
  controllerAs: "example"
}).component("docsTemplateHeaderToast", {
  controller: TemplateHeaderToastComponent.ɵfac,
  templateUrl: "templates/template-header-toast.component-d20c61b2.html",
  controllerAs: "example"
}).component("docsToastManagement", {
  controller: ToastManagementComponent.ɵfac,
  templateUrl: "templates/toast-management.component-3986e699.html",
  controllerAs: "example"
}).factory("ToastModule_f5c37a1b", ToastModule.ɵfac).run([
  "ToastModule_f5c37a1b",
  function() {
  }
]);
export {
  ToastModule
};
