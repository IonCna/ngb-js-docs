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
  NgbScrollSpyModule
} from "./chunk-F2WOA7SZ.js";
import {
  RouterModule
} from "./chunk-7ZRTBL6U.js";
import "./chunk-S4GGKWRG.js";
import {
  getValueInRange,
  inject,
  isNumber
} from "./chunk-AUA2A2I3.js";
import {
  CommonModule,
  require_angular
} from "./chunk-MUYIROFI.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/progressbar/progressbar.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-H26W5AQZ.js
var import_angular = __toESM(require_angular(), 1);
var NgbProgressbarConfig = class {
  constructor() {
    this.max = 100;
    this.animated = false;
    this.ariaLabel = "progress bar";
    this.striped = false;
    this.showValue = false;
  }
};
NgbProgressbarConfig.ɵfac = [
  function NgbProgressbarConfig_Factory() {
    return new NgbProgressbarConfig();
  }
];
NgbProgressbarConfig.ɵprov = {
  token: "NgbProgressbarConfig_8f992f52",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbProgressbarConfig_8f992f52",
  NgbProgressbarConfig.ɵfac
]);
var NgbProgressbarStacked = class {
  constructor() {
    this._progressStacked = true;
  }
};
NgbProgressbarStacked.ɵfac = [
  "$element",
  "$scope",
  function NgbProgressbarStacked_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new NgbProgressbarStacked();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._progressStacked;
    }, function(v) {
      v ? $element.addClass("progress-stacked") : $element.removeClass("progress-stacked");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("progress-stacked") : $element.removeClass("progress-stacked");
      })(instance._progressStacked);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbProgressbarStacked.ɵcmp = {
  selectors: [
    [
      "ngb-progressbar-stacked"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "template": "<ng-content></ng-content>",
    "transclude": true
  }
};
NgbProgressbarStacked.ɵfac.ɵcomponent = true;
NgbProgressbarStacked.ɵfac.ɵtype = NgbProgressbarStacked;
var NgbProgressbar = class {
  set max(max) {
    this._max = !isNumber(max) || max <= 0 ? 100 : max;
  }
  get max() {
    return this._max;
  }
  get _ariaValueNow() {
    return this.getValue();
  }
  get _ariaValueMax() {
    return this.max;
  }
  get _ariaLabel() {
    return this.ariaLabel;
  }
  get _width() {
    return this.stacked ? `${this.getPercentValue()}%` : null;
  }
  get _height() {
    return this.height;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbProgressbar"] ? globalThis.ɵngjsInjected["NgbProgressbar"][0] : inject(NgbProgressbarConfig);
    this.stacked = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbProgressbar"] ? globalThis.ɵngjsInjected["NgbProgressbar"][1] : inject(NgbProgressbarStacked, {
      optional: true
    });
    this.animated = this._config.animated;
    this.ariaLabel = this._config.ariaLabel;
    this.striped = this._config.striped;
    this.showValue = this._config.showValue;
    this.textType = this._config.textType;
    this.type = this._config.type;
    this.value = 0;
    this.height = this._config.height;
    this._progress = true;
    this._role = "progressbar";
    this._ariaValueMin = 0;
    this.max = this._config.max;
  }
  getValue() {
    return getValueInRange(this.value, this.max);
  }
  getPercentValue() {
    return 100 * this.getValue() / this.max;
  }
};
NgbProgressbar.ɵfac = [
  "NgbProgressbarConfig_8f992f52",
  "$element",
  "$scope",
  function NgbProgressbar_Factory(i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbProgressbar": [
        i0,
        ɵelementInstance($element, [
          "ngbProgressbarStacked"
        ], {
          "optional": true
        }, true)
      ]
    };
    try {
      var instance = new NgbProgressbar();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._progress;
    }, function(v) {
      v ? $element.addClass("progress") : $element.removeClass("progress");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._ariaValueMin;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuemin") : $element.attr("aria-valuemin", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaValueNow;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuenow") : $element.attr("aria-valuenow", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._ariaValueMax;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuemax") : $element.attr("aria-valuemax", String(v));
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._ariaLabel;
    }, function(v) {
      v == null ? $element.removeAttr("aria-label") : $element.attr("aria-label", String(v));
    });
    var ɵunwatch6 = $scope.$watch(function() {
      return instance._width;
    }, function(v) {
      v == null ? $element.css("width", "") : $element.css("width", v + "");
    });
    var ɵunwatch7 = $scope.$watch(function() {
      return instance._height;
    }, function(v) {
      v == null ? $element.css("height", "") : $element.css("height", v + "");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("progress") : $element.removeClass("progress");
      })(instance._progress);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuemin") : $element.attr("aria-valuemin", String(v));
      })(instance._ariaValueMin);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuenow") : $element.attr("aria-valuenow", String(v));
      })(instance._ariaValueNow);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuemax") : $element.attr("aria-valuemax", String(v));
      })(instance._ariaValueMax);
      (function(v) {
        v == null ? $element.removeAttr("aria-label") : $element.attr("aria-label", String(v));
      })(instance._ariaLabel);
      (function(v) {
        v == null ? $element.css("width", "") : $element.css("width", v + "");
      })(instance._width);
      (function(v) {
        v == null ? $element.css("height", "") : $element.css("height", v + "");
      })(instance._height);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
      ɵunwatch6();
      ɵunwatch7();
    });
    return instance;
  }
];
NgbProgressbar.ɵcmp = {
  selectors: [
    [
      "ngb-progressbar"
    ]
  ],
  inputs: {
    "max": "max",
    "animated": "animated",
    "ariaLabel": "ariaLabel",
    "striped": "striped",
    "showValue": "showValue",
    "textType": "textType",
    "type": "type",
    "value": "value",
    "height": "height"
  },
  outputs: {},
  definition: {
    "template": `<div
    class="progress-bar"
    ng-class="[
        $.type ? ($.textType ? 'bg-' + $.type : ' text-bg-' + $.type) : '',
        $.textType ? ' text-' + $.textType : '',
        { 'progress-bar-animated': $.animated, 'progress-bar-striped': $.striped },
    ]"
    ng-style="{ width: !$.stacked ? $.getPercentValue() + '%' : null }">
    <span ng-if="$.showValue">{{ $.getValue() / $.max | percent }}</span>
    <ng-content></ng-content>
</div>`,
    "bindings": {
      "max": "<?",
      "animated": "<?",
      "ariaLabel": "<?",
      "striped": "<?",
      "showValue": "<?",
      "textType": "@?",
      "type": "@?",
      "value": "<?",
      "height": "<?"
    },
    "transclude": true
  }
};
NgbProgressbar.ɵfac.ɵcomponent = true;
NgbProgressbar.ɵfac.ɵtype = NgbProgressbar;
function ɵelementInstance($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return found2;
    }
    return void 0;
  };
  var boundary = isComponent ? $element[0] : $element.parent().inheritedData("$ngjsHost");
  for (var el = flags.skipSelf ? $element.parent() : $element; el && el.length; el = el.parent()) {
    var found = read(el);
    if (found) return found;
    if (flags.self || flags.host && boundary && el[0] === boundary) break;
  }
  if (flags.optional) return null;
  throw new Error("No hay una instancia de " + names.join("/") + (flags.self ? " en este elemento" : flags.host ? " entre este elemento y su host" : " en este elemento ni en sus ancestros") + ".");
}
var NgbProgressbarModule = class {
};
NgbProgressbarModule.ɵfac = [
  function NgbProgressbarModule_Factory() {
    return new NgbProgressbarModule();
  }
];
NgbProgressbarModule.ɵmod = {
  id: "NgbProgressbarModule_3f166392",
  controllerAs: "$"
};
import_angular.default.module("NgbProgressbarModule_3f166392", [
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
]).component("ngbProgressbar", {
  controller: NgbProgressbar.ɵfac,
  template: `<div
    class="progress-bar"
    ng-class="[
        $.type ? ($.textType ? 'bg-' + $.type : ' text-bg-' + $.type) : '',
        $.textType ? ' text-' + $.textType : '',
        { 'progress-bar-animated': $.animated, 'progress-bar-striped': $.striped },
    ]"
    ng-style="{ width: !$.stacked ? $.getPercentValue() + '%' : null }">
    <span ng-if="$.showValue">{{ $.getValue() / $.max | percent }}</span>
    <ng-content></ng-content>
</div>`,
  controllerAs: "$",
  bindings: {
    "max": "<?",
    "animated": "<?",
    "ariaLabel": "<?",
    "striped": "<?",
    "showValue": "<?",
    "textType": "@?",
    "type": "@?",
    "value": "<?",
    "height": "<?"
  },
  transclude: true
}).component("ngbProgressbarStacked", {
  controller: NgbProgressbarStacked.ɵfac,
  template: "<ng-content></ng-content>",
  controllerAs: "$",
  transclude: true
}).factory("NgbProgressbarModule_cdc2d044", NgbProgressbarModule.ɵfac).run([
  "NgbProgressbarModule_cdc2d044",
  function() {
  }
]);

// src/app/features/progressbar/progressbar.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Progress bar",
      tabs: [
        {
          name: "Examples",
          to: "/components/progressbar/examples"
        },
        {
          name: "Api",
          to: "/components/progressbar/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/progress/",
        ngBootstrap: "components/progressbar/overview"
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
              id: "simple-progressbar",
              name: "Simple progress bars"
            },
            {
              id: "contextual-text-progressbar",
              name: "Contextual text"
            },
            {
              id: "striped-progress-bar",
              name: "Striped bars"
            },
            {
              id: "custom-labels-progressbar",
              name: "Custom labels"
            },
            {
              id: "progress-height",
              name: "Custom height"
            },
            {
              id: "progress-bars-stacked",
              name: "Stacked bars"
            },
            {
              id: "progressbar-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./progressbar-examples-page.component-ISKI6AMK.js").then((m) => m.ProgressbarExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-progressbar",
              name: "NgbProgressbar"
            },
            {
              id: "ngb-progressbar-stacked",
              name: "NgbProgressbarStacked"
            },
            {
              id: "ngb-progressbar-config",
              name: "NgbProgressbarConfig"
            }
          ]
        },
        loadComponent: () => import("./progressbar-api-page.component-7MEOFDBH.js").then((m) => m.ProgressbarApiPageComponent)
      }
    ]
  }
];

// src/app/features/progressbar/components/contextual-text-progressbar/contextual-text-progressbar.component.ts
var ContextualTextProgressbarComponent = class {
};
(function() {
  var h = "styles/contextual-text-progressbar.component-e7d9d0e2.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ContextualTextProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function ContextualTextProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ContextualTextProgressbarComponent();
    return instance;
  }
];
ContextualTextProgressbarComponent.ɵcmp = {
  selectors: [
    [
      "docs-contextual-text-progressbar"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/contextual-text-progressbar.component-90a1e7f9.html",
    "controllerAs": "example"
  }
};
ContextualTextProgressbarComponent.ɵfac.ɵcomponent = true;
ContextualTextProgressbarComponent.ɵfac.ɵtype = ContextualTextProgressbarComponent;

// src/app/features/progressbar/components/custom-labels-progressbar/custom-labels-progressbar.component.ts
var CustomLabelsProgressbarComponent = class {
};
(function() {
  var h = "styles/custom-labels-progressbar.component-5628f060.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
CustomLabelsProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function CustomLabelsProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new CustomLabelsProgressbarComponent();
    return instance;
  }
];
CustomLabelsProgressbarComponent.ɵcmp = {
  selectors: [
    [
      "docs-custom-labels-progressbar"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/custom-labels-progressbar.component-71ec1153.html",
    "controllerAs": "example"
  }
};
CustomLabelsProgressbarComponent.ɵfac.ɵcomponent = true;
CustomLabelsProgressbarComponent.ɵfac.ɵtype = CustomLabelsProgressbarComponent;

// src/app/features/progressbar/components/progress-bars-stacked/progress-bars-stacked.component.ts
var ProgressBarsStackedComponent = class {
};
(function() {
  var h = "styles/progress-bars-stacked.component-b0387721.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ProgressBarsStackedComponent.ɵfac = [
  "$element",
  "$scope",
  function ProgressBarsStackedComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ProgressBarsStackedComponent();
    return instance;
  }
];
ProgressBarsStackedComponent.ɵcmp = {
  selectors: [
    [
      "docs-progress-bars-stacked"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/progress-bars-stacked.component-13b6c3a2.html",
    "controllerAs": "example"
  }
};
ProgressBarsStackedComponent.ɵfac.ɵcomponent = true;
ProgressBarsStackedComponent.ɵfac.ɵtype = ProgressBarsStackedComponent;

// src/app/features/progressbar/components/progress-height/progress-height.component.ts
var ProgressHeightComponent = class {
};
(function() {
  var h = "styles/progress-height.component-24c49d97.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ProgressHeightComponent.ɵfac = [
  "$element",
  "$scope",
  function ProgressHeightComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ProgressHeightComponent();
    return instance;
  }
];
ProgressHeightComponent.ɵcmp = {
  selectors: [
    [
      "docs-progress-height"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/progress-height.component-20e682d5.html",
    "controllerAs": "example"
  }
};
ProgressHeightComponent.ɵfac.ɵcomponent = true;
ProgressHeightComponent.ɵfac.ɵtype = ProgressHeightComponent;

// src/app/features/progressbar/components/progressbar-global/progressbar-global.component.ts
var ProgressbarGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      animated: config.animated,
      height: config.height,
      max: config.max,
      showValue: config.showValue,
      striped: config.striped,
      textType: config.textType,
      type: config.type
    };
    config.animated = true;
    config.height = "1.5rem";
    config.max = 200;
    config.showValue = true;
    config.striped = true;
    config.textType = "light";
    config.type = "primary";
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    Object.assign(this.config, this.initialConfig);
  }
};
(function() {
  var h = "styles/progressbar-global.component-85ef7a6f.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ProgressbarGlobalComponent.ɵfac = [
  "NgbProgressbarConfig_8f992f52",
  "$element",
  "$scope",
  function ProgressbarGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ProgressbarGlobalComponent(a0);
    return instance;
  }
];
ProgressbarGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-progressbar-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/progressbar-global.component-12205696.html",
    "controllerAs": "example"
  }
};
ProgressbarGlobalComponent.ɵfac.ɵcomponent = true;
ProgressbarGlobalComponent.ɵfac.ɵtype = ProgressbarGlobalComponent;
ProgressbarGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
ProgressbarGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/progressbar/components/simple-progressbar/simple-progressbar.component.ts
var SimpleProgressbarComponent = class {
};
(function() {
  var h = "styles/simple-progressbar.component-4d14b3e1.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
SimpleProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new SimpleProgressbarComponent();
    return instance;
  }
];
SimpleProgressbarComponent.ɵcmp = {
  selectors: [
    [
      "docs-simple-progressbar"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/simple-progressbar.component-c26cd852.html",
    "controllerAs": "example"
  }
};
SimpleProgressbarComponent.ɵfac.ɵcomponent = true;
SimpleProgressbarComponent.ɵfac.ɵtype = SimpleProgressbarComponent;

// src/app/features/progressbar/components/striped-progress-bar/striped-progress-bar.component.ts
var StripedProgressBarComponent = class {
};
(function() {
  var h = "styles/striped-progress-bar.component-7de31a08.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
StripedProgressBarComponent.ɵfac = [
  "$element",
  "$scope",
  function StripedProgressBarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new StripedProgressBarComponent();
    return instance;
  }
];
StripedProgressBarComponent.ɵcmp = {
  selectors: [
    [
      "docs-striped-progress-bar"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/striped-progress-bar.component-13f0f0d9.html",
    "controllerAs": "example"
  }
};
StripedProgressBarComponent.ɵfac.ɵcomponent = true;
StripedProgressBarComponent.ɵfac.ɵtype = StripedProgressBarComponent;

// src/app/features/progressbar/progressbar.module.ts
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
var ProgressbarModule = class {
};
ProgressbarModule.ɵfac = [
  function ProgressbarModule_Factory() {
    return new ProgressbarModule();
  }
];
var ɵProgressbarModule_import0 = RouterModule.forChild(routes);
ProgressbarModule.ɵmod = {
  id: "ProgressbarModule_caebb1f1"
};
ɵimportProviders(import_angular2.default.module("ProgressbarModule_caebb1f1", [
  typeof NgbProgressbarModule === "string" ? NgbProgressbarModule : NgbProgressbarModule.ɵmod ? NgbProgressbarModule.ɵmod.id : NgbProgressbarModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵProgressbarModule_import0)
]), [
  ɵProgressbarModule_import0
]).component("docsContextualTextProgressbar", {
  controller: ContextualTextProgressbarComponent.ɵfac,
  templateUrl: "templates/contextual-text-progressbar.component-90a1e7f9.html",
  controllerAs: "example"
}).component("docsCustomLabelsProgressbar", {
  controller: CustomLabelsProgressbarComponent.ɵfac,
  templateUrl: "templates/custom-labels-progressbar.component-71ec1153.html",
  controllerAs: "example"
}).component("docsProgressBarsStacked", {
  controller: ProgressBarsStackedComponent.ɵfac,
  templateUrl: "templates/progress-bars-stacked.component-13b6c3a2.html",
  controllerAs: "example"
}).component("docsProgressHeight", {
  controller: ProgressHeightComponent.ɵfac,
  templateUrl: "templates/progress-height.component-20e682d5.html",
  controllerAs: "example"
}).component("docsProgressbarGlobal", {
  controller: ProgressbarGlobalComponent.ɵfac,
  templateUrl: "templates/progressbar-global.component-12205696.html",
  controllerAs: "example"
}).component("docsSimpleProgressbar", {
  controller: SimpleProgressbarComponent.ɵfac,
  templateUrl: "templates/simple-progressbar.component-c26cd852.html",
  controllerAs: "example"
}).component("docsStripedProgressBar", {
  controller: StripedProgressBarComponent.ɵfac,
  templateUrl: "templates/striped-progress-bar.component-13f0f0d9.html",
  controllerAs: "example"
}).factory("ProgressbarModule_9795cfcc", ProgressbarModule.ɵfac).run([
  "ProgressbarModule_9795cfcc",
  function() {
  }
]);
export {
  ProgressbarModule
};
