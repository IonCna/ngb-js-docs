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
  NgbConfig
} from "./chunk-TYQFYSAF.js";
import {
  ChangeDetectorRef,
  NgZone,
  PopupService,
  Subject,
  addPopperOffset,
  inject,
  isString,
  listenToTriggers,
  ngbAutoClose,
  ngbPositioning
} from "./chunk-7GLALTP4.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// ../ngb-js/dist/chunk-3KTSMM5T.js
var import_angular = __toESM(require_angular(), 1);
var NgbTooltipConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltipConfig"] ? globalThis.ɵngjsInjected["NgbTooltipConfig"][0] : inject(NgbConfig);
    this.autoClose = true;
    this.placement = "auto";
    this.popperOptions = (options) => options;
    this.triggers = "hover focus";
    this.disableTooltip = false;
    this.openDelay = 0;
    this.closeDelay = 0;
  }
};
NgbTooltipConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbTooltipConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbTooltipConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbTooltipConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbTooltipConfig.ɵprov = {
  token: "NgbTooltipConfig_1833b747",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbTooltipConfig_1833b747",
  NgbTooltipConfig.ɵfac
]);
var NgbTooltipWindow = class {
  get hostId() {
    return this.id;
  }
  get hostClass() {
    return `tooltip${this.tooltipClass ? ` ${this.tooltipClass}` : ""}`;
  }
  get hostFade() {
    return this.animation;
  }
  handleMouseEnter() {
    this.onMouseEnter?.();
  }
  handleMouseLeave() {
    this.onMouseLeave?.();
  }
  constructor() {
    this.role = "tooltip";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-tooltip-window{pointer-events:none;position:absolute}ngb-tooltip-window .tooltip-inner[_content-27bd51a5]{pointer-events:none}ngb-tooltip-window.show .tooltip-inner[_content-27bd51a5]{pointer-events:auto}ngb-tooltip-window.bs-tooltip-top,ngb-tooltip-window.bs-tooltip-bottom{padding-left:0;padding-right:0}ngb-tooltip-window.bs-tooltip-start,ngb-tooltip-window.bs-tooltip-end{padding-top:0;padding-bottom:0}";
  document.head.appendChild(s);
})();
NgbTooltipWindow.ɵfac = [
  "$element",
  "$scope",
  function NgbTooltipWindow_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NgbTooltipWindow)();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance.role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance.hostId;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance.hostClass;
    }, function(v, old) {
      var ɵnames = function(value) {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(" ");
        return Object.keys(value).filter(function(key) {
          return value[key];
        }).join(" ");
      };
      if (v !== old) $element.removeClass(ɵnames(old));
      $element.addClass(ɵnames(v));
    }, true);
    var ɵunwatch3 = $scope.$watch(function() {
      return instance.hostFade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance.role);
      (function(v) {
        $element.prop("id", v);
      })(instance.hostId);
      (function(v) {
        var ɵnames = function(value) {
          if (!value) return "";
          if (typeof value === "string") return value;
          if (Array.isArray(value)) return value.join(" ");
          return Object.keys(value).filter(function(key) {
            return value[key];
          }).join(" ");
        };
        if (v !== void 0) $element.removeClass(ɵnames(void 0));
        $element.addClass(ɵnames(v));
      })(instance.hostClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance.hostFade);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleMouseEnter();
      } else {
        $scope.$apply(function() {
          instance.handleMouseEnter();
        });
      }
    };
    $element.on("mouseenter", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleMouseLeave();
      } else {
        $scope.$apply(function() {
          instance.handleMouseLeave();
        });
      }
    };
    $element.on("mouseleave", ɵhandler1);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      $element.off("mouseenter", ɵhandler0);
      $element.off("mouseleave", ɵhandler1);
    });
    return instance;
  }
];
NgbTooltipWindow.ɵcmp = {
  selectors: [
    [
      "ngb-tooltip-window"
    ]
  ],
  inputs: {
    "animation": "animation",
    "id": "id",
    "tooltipClass": "tooltipClass",
    "onMouseEnter": "onMouseEnter",
    "onMouseLeave": "onMouseLeave"
  },
  outputs: {},
  definition: {
    "template": '<div class="tooltip-arrow" data-popper-arrow="" _content-27bd51a5=""></div>\n<div class="tooltip-inner" _content-27bd51a5=""><ng-content _content-27bd51a5=""></ng-content></div>',
    "bindings": {
      "animation": "<?",
      "id": "<?ngId",
      "tooltipClass": "<?",
      "onMouseEnter": "<?",
      "onMouseLeave": "<?"
    },
    "transclude": true
  }
};
NgbTooltipWindow.ɵfac.ɵcomponent = true;
NgbTooltipWindow.ɵfac.ɵtype = NgbTooltipWindow;
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) resolve(value);
  else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var nextId = 0;
var NgbTooltip = class {
  set ngbTooltip(value) {
    this._ngbTooltip = value;
    if (!value && this._windowRef) {
      this.close();
    }
  }
  get ngbTooltip() {
    return this._ngbTooltip;
  }
  open(context) {
    return _async_to_generator(function* () {
      if (this._opening) {
        this._openCancelled = false;
        return;
      }
      if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
        this._openCancelled = false;
        this._opening = this._popupService.open(this._ngbTooltip, context ?? this.tooltipContext, this.animation);
        const { windowRef, transition$ } = yield this._opening;
        this._opening = null;
        if (this._openCancelled) {
          this._popupService.close(false).subscribe();
          return;
        }
        this._windowRef = windowRef;
        this._windowRef.setInput("animation", this.animation);
        this._windowRef.setInput("tooltipClass", this.tooltipClass);
        this._windowRef.setInput("id", this._ngbTooltipWindowId);
        this._windowRef.setInput("onMouseEnter", () => this._mouseEnterTooltip.next());
        this._windowRef.setInput("onMouseLeave", () => this._mouseLeaveTooltip.next());
        this._getPositionTargetElement().setAttribute("aria-describedby", this._ngbTooltipWindowId);
        if (this.container === "body") {
          this._document.body.appendChild(this._windowRef.location.nativeElement);
        }
        this._windowRef.changeDetectorRef.detectChanges();
        this._windowRef.changeDetectorRef.markForCheck();
        this._ngZone.runOutsideAngular(() => {
          this._positioning.createPopper({
            hostElement: this._getPositionTargetElement(),
            targetElement: this._windowRef.location.nativeElement,
            placement: this.placement,
            appendToBody: this.container === "body",
            baseClass: "bs-tooltip",
            updatePopperOptions: (options) => this.popperOptions(addPopperOffset([
              0,
              6
            ])(options))
          });
          Promise.resolve().then(() => {
            this._positioning.update();
            this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
          });
        });
        ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [
          this._windowRef.location.nativeElement
        ], [
          this._nativeElement
        ]);
        transition$.subscribe(() => {
          this.shown.emit();
        });
      }
    }).call(this);
  }
  close(animation = this.animation) {
    if (this._opening) this._openCancelled = true;
    if (this._windowRef != null) {
      this._getPositionTargetElement().removeAttribute("aria-describedby");
      this._popupService.close(animation).subscribe(() => {
        this._windowRef = null;
        this._positioning.destroy();
        this._zoneSubscription?.unsubscribe();
        this.hidden.emit();
        this._changeDetector.markForCheck();
      });
    }
  }
  toggle() {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }
  isOpen() {
    return this._windowRef != null;
  }
  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(this._nativeElement, this.triggers, this.isOpen.bind(this), this.open.bind(this), this.close.bind(this), +this.openDelay, +this.closeDelay, this._mouseEnterTooltip, this._mouseLeaveTooltip);
  }
  ngOnChanges({ tooltipClass }) {
    if (tooltipClass && this.isOpen()) {
      this._windowRef.setInput("tooltipClass", tooltipClass.currentValue);
    }
  }
  ngOnDestroy() {
    this.close(false);
    this._unregisterListenersFn?.();
  }
  _getPositionTargetElement() {
    return (isString(this.positionTarget) ? this._document.querySelector(this.positionTarget) : this.positionTarget) || this._nativeElement;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltip"] ? globalThis.ɵngjsInjected["NgbTooltip"][0] : inject(NgbTooltipConfig);
    this.animation = this._config.animation;
    this.autoClose = this._config.autoClose;
    this.placement = this._config.placement;
    this.popperOptions = this._config.popperOptions;
    this.triggers = this._config.triggers;
    this.container = this._config.container;
    this.disableTooltip = this._config.disableTooltip;
    this.tooltipClass = this._config.tooltipClass;
    this.openDelay = this._config.openDelay;
    this.closeDelay = this._config.closeDelay;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltip"] ? globalThis.ɵngjsInjected["NgbTooltip"][1] : inject(ElementRef)).nativeElement;
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltip"] ? globalThis.ɵngjsInjected["NgbTooltip"][2] : inject(NgZone);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltip"] ? globalThis.ɵngjsInjected["NgbTooltip"][3] : inject(DOCUMENT);
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTooltip"] ? globalThis.ɵngjsInjected["NgbTooltip"][4] : inject(ChangeDetectorRef);
    this._ngbTooltipWindowId = `ngb-tooltip-${nextId++}`;
    this._popupService = new PopupService(NgbTooltipWindow);
    this._windowRef = null;
    this._positioning = ngbPositioning();
    this._opening = null;
    this._openCancelled = false;
    this._mouseEnterTooltip = new Subject();
    this._mouseLeaveTooltip = new Subject();
  }
};
NgbTooltip.ɵfac = [
  "NgbTooltipConfig_1833b747",
  "ElementRef_927308a2",
  "NgZone_31031859",
  "DOCUMENT_a3a362b8",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbTooltip_Factory(i0, i1, i2, i3, i4, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbTooltip": [
        i0,
        i1,
        i2,
        i3,
        i4
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbTooltip)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbTooltip.ɵdir = {
  selectors: [
    [
      "",
      "ngbTooltip",
      ""
    ]
  ],
  inputs: {
    "animation": "animation",
    "autoClose": "autoClose",
    "placement": "placement",
    "popperOptions": "popperOptions",
    "triggers": "triggers",
    "positionTarget": "positionTarget",
    "container": "container",
    "disableTooltip": "disableTooltip",
    "tooltipClass": "tooltipClass",
    "tooltipContext": "tooltipContext",
    "openDelay": "openDelay",
    "closeDelay": "closeDelay",
    "ngbTooltip": "ngbTooltip"
  },
  outputs: {
    "shown": "shown",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbTooltip"
  ],
  definition: {
    "bindings": {
      "animation": "<?",
      "autoClose": "<?",
      "placement": "@?",
      "popperOptions": "<?",
      "triggers": "@?",
      "positionTarget": "@?",
      "container": "@?",
      "disableTooltip": "<?",
      "tooltipClass": "@?",
      "tooltipContext": "<?",
      "openDelay": "<?",
      "closeDelay": "<?",
      "ngbTooltip": "<?",
      "shown": "&?",
      "hidden": "&?"
    }
  }
};
NgbTooltip.ɵfac.ɵtype = NgbTooltip;
NgbTooltip.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbTooltip.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbTooltip.prototype.$onChanges = function(changesObj) {
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
    var c = changesObj["autoClose"];
    if (!c) return;
    changes["autoClose"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["placement"];
    if (!c) return;
    changes["placement"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popperOptions"];
    if (!c) return;
    changes["popperOptions"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["triggers"];
    if (!c) return;
    changes["triggers"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["positionTarget"];
    if (!c) return;
    changes["positionTarget"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["container"];
    if (!c) return;
    changes["container"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["disableTooltip"];
    if (!c) return;
    changes["disableTooltip"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["tooltipClass"];
    if (!c) return;
    changes["tooltipClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["tooltipContext"];
    if (!c) return;
    changes["tooltipContext"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["openDelay"];
    if (!c) return;
    changes["openDelay"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["closeDelay"];
    if (!c) return;
    changes["closeDelay"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["ngbTooltip"];
    if (!c) return;
    changes["ngbTooltip"] = {
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
var NgbTooltipModule = class {
};
NgbTooltipModule.ɵfac = [
  function NgbTooltipModule_Factory() {
    return new (this && this.ɵT || NgbTooltipModule)();
  }
];
NgbTooltipModule.ɵmod = {
  id: "NgbTooltipModule_593649e3",
  controllerAs: "$"
};
import_angular.default.module("NgbTooltipModule_593649e3", [
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
]).component("ngbTooltipWindow", {
  controller: NgbTooltipWindow.ɵfac,
  template: '<div class="tooltip-arrow" data-popper-arrow="" _content-27bd51a5=""></div>\n<div class="tooltip-inner" _content-27bd51a5=""><ng-content _content-27bd51a5=""></ng-content></div>',
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "id": "<?ngId",
    "tooltipClass": "<?",
    "onMouseEnter": "<?",
    "onMouseLeave": "<?"
  }
}).directive("ngbTooltip", function() {
  return {
    controller: NgbTooltip.ɵfac,
    restrict: "A",
    bindToController: {
      "animation": "<?",
      "autoClose": "<?",
      "placement": "@?",
      "popperOptions": "<?",
      "triggers": "@?",
      "positionTarget": "@?",
      "container": "@?",
      "disableTooltip": "<?",
      "tooltipClass": "@?",
      "tooltipContext": "<?",
      "openDelay": "<?",
      "closeDelay": "<?",
      "ngbTooltip": "<?",
      "shown": "&?",
      "hidden": "&?"
    },
    controllerAs: "ngbTooltip"
  };
}).directive("ngbTooltip", function() {
  return {
    restrict: "A",
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
}).factory("NgbTooltipModule_5572f976", NgbTooltipModule.ɵfac).run([
  "NgbTooltipModule_5572f976",
  function() {
  }
]);

export {
  NgbTooltipModule
};
