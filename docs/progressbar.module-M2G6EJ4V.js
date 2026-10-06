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
            // Lo que hace `angular.bootstrap` (`doBootstrap`), partido en dos: primero el injector (con sus `.config`/`.run`)
            // y recién después de los initializers el `$compile` del host. Como Angular: `APP_INITIALIZER` termina
            // antes de que exista el primer componente — un componente no ve la app a medio inicializar.
            var element = angular.element(host);
            if (element.injector()) throw new Error("bootstrapModule(): el host ya tiene una app arrancada.");
            var modules = ["ng", ["$provide", function ($provide) { $provide.value("$rootElement", element); }], ["$compileProvider", function ($compileProvider) { $compileProvider.debugInfoEnabled(false); }], "ɵroot"];
            // `angular.reloadWithDebugInfo()` deja la marca en `window.name` y recarga: se respeta igual que `angular.bootstrap`.
            if (/^NG_ENABLE_DEBUG_INFO!/.test(window.name)) {
              window.name = window.name.replace(/^NG_ENABLE_DEBUG_INFO!/, "");
              modules.push(["$compileProvider", function ($compileProvider) { $compileProvider.debugInfoEnabled(true); }]);
            }
            var injector = angular.injector(modules);
            element.data("$injector", injector);
            // El patch de ZonePatchesRuntime (setTimeout/addEventListener/Promise.then) necesita ESTE
            // $rootScope para saber a qué aplicarle $apply — no existe hasta que el injector de verdad se creó.
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
              injector.invoke(["$rootScope", "$compile", function (scope, compile) {
                var mount = function () { compile(element)(scope); };
                if (scope.$$phase) mount(); else scope.$apply(mount);
              }]);
              return injector;
            }).then(resolve, reject);
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

  // `.then` (microtasks): el digest corre cuando se vacía la cola de microtasks, como `onMicrotaskEmpty` de Zone.js,
  // no tras cada callback. Si el callback devuelve una promesa (la `$q` de un hook de UI-Router), el motor la adopta
  // en un microtask POSTERIOR: un digest inmediato veía esa promesa rechazada todavía sin handlers y `$q` reportaba
  // "Possibly unhandled rejection". Además, una cadena de `.then` termina en un solo digest. "Vacía": una vuelta de
  // microtask sin callbacks `.then` nuevos; el tope evita esperar para siempre si la app encadena microtasks sin fin.
  var ɵnativeQueueMicrotask = typeof window.queueMicrotask === "function" ? window.queueMicrotask.bind(window) : null;
  var ɵMAX_DRAIN_TURNS = 100;
  var ɵmicrotaskActivity = 0;
  var ɵdrainScheduled = false;
  function ɵapplyWhenMicrotasksDrain() {
    if (!ɵnativeQueueMicrotask) return ɵsafeApply();
    if (ɵdrainScheduled) return;
    ɵdrainScheduled = true;
    var seen = -1;
    var turns = 0;
    var check = function () {
      if (ɵmicrotaskActivity !== seen && turns < ɵMAX_DRAIN_TURNS) {
        seen = ɵmicrotaskActivity;
        turns++;
        ɵnativeQueueMicrotask(check);
        return;
      }
      ɵdrainScheduled = false;
      ɵsafeApply();
    };
    ɵnativeQueueMicrotask(check);
  }
  function ɵrunInMicrotask(inside, fn, self, args) {
    if (!inside) return ɵrunIn(false, fn, self, args);
    ɵmicrotaskActivity++;
    try {
      return fn.apply(self, args);
    } finally {
      ɵapplyWhenMicrotasksDrain();
    }
  }

  globalThis.ɵngjsZone = { inside: ɵinside, runIn: ɵrunIn };

  // El reloj de `fakeAsync` (si hay uno activo) toma el trabajo ya envuelto en su zona.
  function ɵschedule(kind, native, run, delay) {
    var fake = globalThis.ɵngjsFakeAsync;
    return fake ? fake.schedule(kind, run, delay) : native.call(window, run, delay);
  }
  function ɵpatchCancel(name) {
    var native = window[name];
    if (typeof native !== "function") return;
    window[name] = function (id) {
      var fake = globalThis.ɵngjsFakeAsync;
      if (fake && fake.cancel(id)) return;
      return native.apply(window, arguments);
    };
  }
  ɵpatchCancel("clearTimeout");
  ɵpatchCancel("clearInterval");
  ɵpatchCancel("cancelAnimationFrame");

  var ɵsetTimeout = window.setTimeout;
  window.setTimeout = function (fn, delay) {
    if (typeof fn !== "function") return ɵsetTimeout.apply(window, arguments);
    var extra = Array.prototype.slice.call(arguments, 2);
    var inside = ɵinside();
    return ɵschedule("timeout", ɵsetTimeout, function () { ɵrunIn(inside, fn, null, extra); }, delay);
  };

  if (typeof window.requestAnimationFrame === "function") {
    var ɵrequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function (fn) {
      if (typeof fn !== "function") return ɵrequestAnimationFrame.apply(window, arguments);
      var inside = ɵinside();
      return ɵschedule("animationFrame", ɵrequestAnimationFrame, function (time) { ɵrunIn(inside, fn, null, [time]); });
    };
  }

  if (typeof window.queueMicrotask === "function") {
    var ɵqueueMicrotask = window.queueMicrotask;
    window.queueMicrotask = function (fn) {
      if (typeof fn !== "function") return ɵqueueMicrotask.apply(window, arguments);
      var inside = ɵinside();
      var run = function () { ɵrunIn(inside, fn, null, []); };
      var fake = globalThis.ɵngjsFakeAsync;
      return fake ? fake.queueMicrotask(run) : ɵqueueMicrotask.call(window, run);
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
    return ɵschedule("interval", ɵsetInterval, function () { ɵrunIn(inside, fn, null, extra); }, delay);
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
      return typeof fn === "function" ? function (value) { return ɵrunInMicrotask(inside, fn, undefined, [value]); } : fn;
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
} from "./chunk-EP2AMMBI.js";
import {
  NgbNavModule
} from "./chunk-GBQCJSNK.js";
import {
  NgbScrollSpyModule
} from "./chunk-T2KZSIKQ.js";
import {
  RouterModule
} from "./chunk-44BCS2Q7.js";
import "./chunk-YZVMAT3C.js";
import {
  getValueInRange,
  inject,
  isNumber
} from "./chunk-DXKD6ZA6.js";
import {
  CommonModule,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// src/app/features/progressbar/progressbar.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-E4VIJIDX.js
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
    return new (this && this.ɵT || NgbProgressbarConfig)();
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
    var instance = new (this && this.ɵT || NgbProgressbarStacked)();
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
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbProgressbar": [
        i0,
        ɵelementInstance($element, [
          "ngbProgressbarStacked"
        ], {
          "optional": true
        }, true)
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbProgressbar)();
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
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
function ɵlazyController($delegate, $injector) {
  if ($injector.ɵngjsLazyController) return $delegate;
  $injector.ɵngjsLazyController = true;
  return function(expression, locals, later, ident) {
    var init = $delegate.apply(this, arguments);
    if (!later || !expression || !expression.ɵtype || typeof init !== "function" || !init.instance) return init;
    var state = 0, built;
    var lazy = function() {
      if (state === 2) return built;
      if (state === 1) throw new Error('NG0200: dependencia circular — "' + expression.ɵtype.name + '" se pidió a sí misma mientras se construía (directivas del mismo elemento que se inyectan entre sí).');
      state = 1;
      try {
        built = init();
        state = 2;
      } finally {
        if (state !== 2) state = 0;
      }
      return built;
    };
    Object.defineProperty(init.instance, "ɵngjsBuild", {
      value: lazy,
      configurable: true
    });
    lazy.instance = init.instance;
    lazy.identifier = init.identifier;
    return lazy;
  };
}
var NgbProgressbarModule = class {
};
NgbProgressbarModule.ɵfac = [
  function NgbProgressbarModule_Factory() {
    return new (this && this.ɵT || NgbProgressbarModule)();
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
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵlazyController
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
  transclude: true,
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
  }
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
        loadComponent: () => import("./progressbar-examples-page.component-MAYJDO4I.js").then((m) => m.ProgressbarExamplesPageComponent)
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
        loadComponent: () => import("./progressbar-api-page.component-ABJVGZQG.js").then((m) => m.ProgressbarApiPageComponent)
      }
    ]
  }
];

// src/app/features/progressbar/components/contextual-text-progressbar/contextual-text-progressbar.component.ts
var ContextualTextProgressbarComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-5d32a1bd],.card[_content-5d32a1bd],.dropdown-menu[_content-5d32a1bd],.list-group-item[_content-5d32a1bd],.form-control[_content-5d32a1bd],.form-select[_content-5d32a1bd]{border-color:var(--bs-border-color)}.alert-light[_content-5d32a1bd]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-5d32a1bd],.list-group[_content-5d32a1bd],.dropdown-menu[_content-5d32a1bd]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-5d32a1bd],.btn-outline-secondary[_content-5d32a1bd]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-5d32a1bd],.form-select[_content-5d32a1bd]{background-color:var(--bs-body-bg)}code[_content-5d32a1bd]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ContextualTextProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function ContextualTextProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ContextualTextProgressbarComponent)();
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
    "templateUrl": "templates/contextual-text-progressbar.component-8e1c624d.html",
    "controllerAs": "example"
  }
};
ContextualTextProgressbarComponent.ɵfac.ɵcomponent = true;
ContextualTextProgressbarComponent.ɵfac.ɵtype = ContextualTextProgressbarComponent;

// src/app/features/progressbar/components/custom-labels-progressbar/custom-labels-progressbar.component.ts
var CustomLabelsProgressbarComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-8ab2c2c6],.card[_content-8ab2c2c6],.dropdown-menu[_content-8ab2c2c6],.list-group-item[_content-8ab2c2c6],.form-control[_content-8ab2c2c6],.form-select[_content-8ab2c2c6]{border-color:var(--bs-border-color)}.alert-light[_content-8ab2c2c6]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-8ab2c2c6],.list-group[_content-8ab2c2c6],.dropdown-menu[_content-8ab2c2c6]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-8ab2c2c6],.btn-outline-secondary[_content-8ab2c2c6]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-8ab2c2c6],.form-select[_content-8ab2c2c6]{background-color:var(--bs-body-bg)}code[_content-8ab2c2c6]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CustomLabelsProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function CustomLabelsProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CustomLabelsProgressbarComponent)();
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
    "templateUrl": "templates/custom-labels-progressbar.component-30fc40c9.html",
    "controllerAs": "example"
  }
};
CustomLabelsProgressbarComponent.ɵfac.ɵcomponent = true;
CustomLabelsProgressbarComponent.ɵfac.ɵtype = CustomLabelsProgressbarComponent;

// src/app/features/progressbar/components/progress-bars-stacked/progress-bars-stacked.component.ts
var ProgressBarsStackedComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-8a1b3e6e],.card[_content-8a1b3e6e],.dropdown-menu[_content-8a1b3e6e],.list-group-item[_content-8a1b3e6e],.form-control[_content-8a1b3e6e],.form-select[_content-8a1b3e6e]{border-color:var(--bs-border-color)}.alert-light[_content-8a1b3e6e]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-8a1b3e6e],.list-group[_content-8a1b3e6e],.dropdown-menu[_content-8a1b3e6e]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-8a1b3e6e],.btn-outline-secondary[_content-8a1b3e6e]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-8a1b3e6e],.form-select[_content-8a1b3e6e]{background-color:var(--bs-body-bg)}code[_content-8a1b3e6e]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ProgressBarsStackedComponent.ɵfac = [
  "$element",
  "$scope",
  function ProgressBarsStackedComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ProgressBarsStackedComponent)();
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
    "templateUrl": "templates/progress-bars-stacked.component-8841e1ae.html",
    "controllerAs": "example"
  }
};
ProgressBarsStackedComponent.ɵfac.ɵcomponent = true;
ProgressBarsStackedComponent.ɵfac.ɵtype = ProgressBarsStackedComponent;

// src/app/features/progressbar/components/progress-height/progress-height.component.ts
var ProgressHeightComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-39fc7720],.card[_content-39fc7720],.dropdown-menu[_content-39fc7720],.list-group-item[_content-39fc7720],.form-control[_content-39fc7720],.form-select[_content-39fc7720]{border-color:var(--bs-border-color)}.alert-light[_content-39fc7720]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-39fc7720],.list-group[_content-39fc7720],.dropdown-menu[_content-39fc7720]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-39fc7720],.btn-outline-secondary[_content-39fc7720]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-39fc7720],.form-select[_content-39fc7720]{background-color:var(--bs-body-bg)}code[_content-39fc7720]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ProgressHeightComponent.ɵfac = [
  "$element",
  "$scope",
  function ProgressHeightComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ProgressHeightComponent)();
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
    "templateUrl": "templates/progress-height.component-2bdf093f.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-3bcda9d6],.card[_content-3bcda9d6],.dropdown-menu[_content-3bcda9d6],.list-group-item[_content-3bcda9d6],.form-control[_content-3bcda9d6],.form-select[_content-3bcda9d6]{border-color:var(--bs-border-color)}.alert-light[_content-3bcda9d6]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-3bcda9d6],.list-group[_content-3bcda9d6],.dropdown-menu[_content-3bcda9d6]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-3bcda9d6],.btn-outline-secondary[_content-3bcda9d6]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-3bcda9d6],.form-select[_content-3bcda9d6]{background-color:var(--bs-body-bg)}code[_content-3bcda9d6]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ProgressbarGlobalComponent.ɵfac = [
  "NgbProgressbarConfig_8f992f52",
  "$element",
  "$scope",
  function ProgressbarGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ProgressbarGlobalComponent)(a0);
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
    "templateUrl": "templates/progressbar-global.component-2b27f1f3.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-61ed11b0],.card[_content-61ed11b0],.dropdown-menu[_content-61ed11b0],.list-group-item[_content-61ed11b0],.form-control[_content-61ed11b0],.form-select[_content-61ed11b0]{border-color:var(--bs-border-color)}.alert-light[_content-61ed11b0]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-61ed11b0],.list-group[_content-61ed11b0],.dropdown-menu[_content-61ed11b0]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-61ed11b0],.btn-outline-secondary[_content-61ed11b0]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-61ed11b0],.form-select[_content-61ed11b0]{background-color:var(--bs-body-bg)}code[_content-61ed11b0]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
SimpleProgressbarComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleProgressbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SimpleProgressbarComponent)();
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
    "templateUrl": "templates/simple-progressbar.component-9233313b.html",
    "controllerAs": "example"
  }
};
SimpleProgressbarComponent.ɵfac.ɵcomponent = true;
SimpleProgressbarComponent.ɵfac.ɵtype = SimpleProgressbarComponent;

// src/app/features/progressbar/components/striped-progress-bar/striped-progress-bar.component.ts
var StripedProgressBarComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-078ac200],.card[_content-078ac200],.dropdown-menu[_content-078ac200],.list-group-item[_content-078ac200],.form-control[_content-078ac200],.form-select[_content-078ac200]{border-color:var(--bs-border-color)}.alert-light[_content-078ac200]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-078ac200],.list-group[_content-078ac200],.dropdown-menu[_content-078ac200]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-078ac200],.btn-outline-secondary[_content-078ac200]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-078ac200],.form-select[_content-078ac200]{background-color:var(--bs-body-bg)}code[_content-078ac200]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
StripedProgressBarComponent.ɵfac = [
  "$element",
  "$scope",
  function StripedProgressBarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || StripedProgressBarComponent)();
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
    "templateUrl": "templates/striped-progress-bar.component-716ff7e9.html",
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
    return new (this && this.ɵT || ProgressbarModule)();
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
  templateUrl: "templates/contextual-text-progressbar.component-8e1c624d.html",
  controllerAs: "example"
}).component("docsCustomLabelsProgressbar", {
  controller: CustomLabelsProgressbarComponent.ɵfac,
  templateUrl: "templates/custom-labels-progressbar.component-30fc40c9.html",
  controllerAs: "example"
}).component("docsProgressBarsStacked", {
  controller: ProgressBarsStackedComponent.ɵfac,
  templateUrl: "templates/progress-bars-stacked.component-8841e1ae.html",
  controllerAs: "example"
}).component("docsProgressHeight", {
  controller: ProgressHeightComponent.ɵfac,
  templateUrl: "templates/progress-height.component-2bdf093f.html",
  controllerAs: "example"
}).component("docsProgressbarGlobal", {
  controller: ProgressbarGlobalComponent.ɵfac,
  templateUrl: "templates/progressbar-global.component-2b27f1f3.html",
  controllerAs: "example"
}).component("docsSimpleProgressbar", {
  controller: SimpleProgressbarComponent.ɵfac,
  templateUrl: "templates/simple-progressbar.component-9233313b.html",
  controllerAs: "example"
}).component("docsStripedProgressBar", {
  controller: StripedProgressBarComponent.ɵfac,
  templateUrl: "templates/striped-progress-bar.component-716ff7e9.html",
  controllerAs: "example"
}).factory("ProgressbarModule_9795cfcc", ProgressbarModule.ɵfac).run([
  "ProgressbarModule_9795cfcc",
  function() {
  }
]);
export {
  ProgressbarModule
};
