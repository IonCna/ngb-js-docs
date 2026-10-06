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
  NgbConfig,
  NgbScrollSpyModule
} from "./chunk-T2KZSIKQ.js";
import {
  RouterModule
} from "./chunk-44BCS2Q7.js";
import "./chunk-YZVMAT3C.js";
import {
  NgZone,
  TemplateRef,
  inject,
  ngbRunTransition,
  reflow,
  take
} from "./chunk-DXKD6ZA6.js";
import {
  CommonModule,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// src/app/features/toast/toast.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-DZSZTOZM.js
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
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbToastConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbToastConfig)();
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
    var instance = new (this && this.ɵT || NgbToastHeader)();
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
  s.textContent = "ngb-toast{display:block}ngb-toast .toast-header .close[_content-dd14d3e9]{margin-left:auto;margin-bottom:0.25rem}";
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
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbToast": [
        i0,
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbToast)($element[0].getAttribute("aria-live"));
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
    "template": '<ng-template ng-ref="headerTpl" _content-dd14d3e9="">\n    <strong class="me-auto" _content-dd14d3e9="">{{ $.header }}</strong>\n</ng-template>\n\n<div ng-if="$.contentHeaderTpl || $.header" class="toast-header" _content-dd14d3e9="">\n    <ng-container ng-template-outlet="$.contentHeaderTpl || $.headerTpl" _content-dd14d3e9=""></ng-container>\n    <button type="button" class="btn-close" aria-label="Close" ng-click="$.hide()" _content-dd14d3e9=""></button>\n</div>\n\n<div class="toast-body" _content-dd14d3e9="">\n    <ng-content _content-dd14d3e9=""></ng-content>\n</div>',
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
var NgbToastModule = class {
};
NgbToastModule.ɵfac = [
  function NgbToastModule_Factory() {
    return new (this && this.ɵT || NgbToastModule)();
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
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵlazyController
]).component("ngbToast", {
  controller: NgbToast.ɵfac,
  template: '<ng-template ng-ref="headerTpl" _content-dd14d3e9="">\n    <strong class="me-auto" _content-dd14d3e9="">{{ $.header }}</strong>\n</ng-template>\n\n<div ng-if="$.contentHeaderTpl || $.header" class="toast-header" _content-dd14d3e9="">\n    <ng-container ng-template-outlet="$.contentHeaderTpl || $.headerTpl" _content-dd14d3e9=""></ng-container>\n    <button type="button" class="btn-close" aria-label="Close" ng-click="$.hide()" _content-dd14d3e9=""></button>\n</div>\n\n<div class="toast-body" _content-dd14d3e9="">\n    <ng-content _content-dd14d3e9=""></ng-content>\n</div>',
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "delay": "<?",
    "autohide": "<?",
    "header": "@?",
    "shown": "&?",
    "hidden": "&?"
  }
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
        loadComponent: () => import("./toast-examples-page.component-2C3YRQDG.js").then((m) => m.ToastExamplesPageComponent)
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
        loadComponent: () => import("./toast-api-page.component-KI3FPTUK.js").then((m) => m.ToastApiPageComponent)
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-4071c1ea],.card[_content-4071c1ea],.dropdown-menu[_content-4071c1ea],.list-group-item[_content-4071c1ea],.form-control[_content-4071c1ea],.form-select[_content-4071c1ea]{border-color:var(--bs-border-color)}.alert-light[_content-4071c1ea]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-4071c1ea],.list-group[_content-4071c1ea],.dropdown-menu[_content-4071c1ea]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-4071c1ea],.btn-outline-secondary[_content-4071c1ea]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-4071c1ea],.form-select[_content-4071c1ea]{background-color:var(--bs-body-bg)}code[_content-4071c1ea]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CloseableToastComponent.ɵfac = [
  "$element",
  "$scope",
  function CloseableToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CloseableToastComponent)();
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
    "templateUrl": "templates/closeable-toast.component-b472da8f.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-3379857c],.card[_content-3379857c],.dropdown-menu[_content-3379857c],.list-group-item[_content-3379857c],.form-control[_content-3379857c],.form-select[_content-3379857c]{border-color:var(--bs-border-color)}.alert-light[_content-3379857c]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-3379857c],.list-group[_content-3379857c],.dropdown-menu[_content-3379857c]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-3379857c],.btn-outline-secondary[_content-3379857c]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-3379857c],.form-select[_content-3379857c]{background-color:var(--bs-body-bg)}code[_content-3379857c]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
InlineToastComponent.ɵfac = [
  "$element",
  "$scope",
  function InlineToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || InlineToastComponent)();
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
    "templateUrl": "templates/inline-toast.component-0fd25d0f.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-0e132756],.card[_content-0e132756],.dropdown-menu[_content-0e132756],.list-group-item[_content-0e132756],.form-control[_content-0e132756],.form-select[_content-0e132756]{border-color:var(--bs-border-color)}.alert-light[_content-0e132756]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-0e132756],.list-group[_content-0e132756],.dropdown-menu[_content-0e132756]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-0e132756],.btn-outline-secondary[_content-0e132756]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-0e132756],.form-select[_content-0e132756]{background-color:var(--bs-body-bg)}code[_content-0e132756]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PreventAutohideToastComponent.ɵfac = [
  "$element",
  "$scope",
  function PreventAutohideToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PreventAutohideToastComponent)();
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
    "templateUrl": "templates/prevent-autohide-toast.component-765b737c.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-f89b1a3c],.card[_content-f89b1a3c],.dropdown-menu[_content-f89b1a3c],.list-group-item[_content-f89b1a3c],.form-control[_content-f89b1a3c],.form-select[_content-f89b1a3c]{border-color:var(--bs-border-color)}.alert-light[_content-f89b1a3c]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-f89b1a3c],.list-group[_content-f89b1a3c],.dropdown-menu[_content-f89b1a3c]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-f89b1a3c],.btn-outline-secondary[_content-f89b1a3c]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-f89b1a3c],.form-select[_content-f89b1a3c]{background-color:var(--bs-body-bg)}code[_content-f89b1a3c]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
TemplateHeaderToastComponent.ɵfac = [
  "$element",
  "$scope",
  function TemplateHeaderToastComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || TemplateHeaderToastComponent)();
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
    "templateUrl": "templates/template-header-toast.component-eeeb19a4.html",
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
  var s = document.createElement("style");
  s.textContent = ".alert[_content-4c229589],.card[_content-4c229589],.dropdown-menu[_content-4c229589],.list-group-item[_content-4c229589],.form-control[_content-4c229589],.form-select[_content-4c229589]{border-color:var(--bs-border-color)}.alert-light[_content-4c229589]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-4c229589],.list-group[_content-4c229589],.dropdown-menu[_content-4c229589]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-4c229589],.btn-outline-secondary[_content-4c229589]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-4c229589],.form-select[_content-4c229589]{background-color:var(--bs-body-bg)}code[_content-4c229589]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DocsToastService.ɵfac = [
  function DocsToastService_Factory() {
    return new (this && this.ɵT || DocsToastService)();
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
    var instance = new (this && this.ɵT || ToastManagementComponent)(a0);
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
    "templateUrl": "templates/toast-management.component-36cd11a5.html",
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
    return new (this && this.ɵT || ToastModule)();
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
  templateUrl: "templates/closeable-toast.component-b472da8f.html",
  controllerAs: "example"
}).component("docsInlineToast", {
  controller: InlineToastComponent.ɵfac,
  templateUrl: "templates/inline-toast.component-0fd25d0f.html",
  controllerAs: "example"
}).component("docsPreventAutohideToast", {
  controller: PreventAutohideToastComponent.ɵfac,
  templateUrl: "templates/prevent-autohide-toast.component-765b737c.html",
  controllerAs: "example"
}).component("docsTemplateHeaderToast", {
  controller: TemplateHeaderToastComponent.ɵfac,
  templateUrl: "templates/template-header-toast.component-eeeb19a4.html",
  controllerAs: "example"
}).component("docsToastManagement", {
  controller: ToastManagementComponent.ɵfac,
  templateUrl: "templates/toast-management.component-36cd11a5.html",
  controllerAs: "example"
}).factory("ToastModule_f5c37a1b", ToastModule.ɵfac).run([
  "ToastModule_f5c37a1b",
  function() {
  }
]);
export {
  ToastModule
};
