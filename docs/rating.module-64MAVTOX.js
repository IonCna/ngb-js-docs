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
            var modules = ["ng", ["$provide", function ($provide) { $provide.value("$rootElement", element); }], "ɵroot"];
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
} from "./chunk-Y3STFSLE.js";
import {
  NgbNavModule
} from "./chunk-S3STC4KD.js";
import {
  NgbScrollSpyModule
} from "./chunk-R7GTDWT4.js";
import {
  RouterModule
} from "./chunk-UVJQY4BU.js";
import "./chunk-BJK3QUXG.js";
import {
  ChangeDetectorRef,
  Key,
  TemplateRef,
  getValueInRange,
  inject
} from "./chunk-U6UIHJCB.js";
import {
  CommonModule,
  EventEmitter,
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/features/rating/rating.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-CCIF4QUF.js
var import_angular = __toESM(require_angular(), 1);
var NgbRatingConfig = class {
  constructor() {
    this.max = 10;
    this.readonly = false;
    this.resettable = false;
    this.tabindex = 0;
  }
};
NgbRatingConfig.ɵfac = [
  function NgbRatingConfig_Factory() {
    return new (this && this.ɵT || NgbRatingConfig)();
  }
];
NgbRatingConfig.ɵprov = {
  token: "NgbRatingConfig_27d85a85",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbRatingConfig_27d85a85",
  NgbRatingConfig.ɵfac
]);
var NgbRating = class {
  ariaValueText(current, max) {
    return `${current} out of ${max}`;
  }
  get _tabindex() {
    return this.disabled ? -1 : this.tabindex;
  }
  get _ariaValueMax() {
    return this.max;
  }
  get _ariaValueNow() {
    return this.nextRate;
  }
  get _ariaValueText() {
    return this.ariaValueText(this.nextRate, this.max);
  }
  get _ariaReadonly() {
    return this.readonly && !this.disabled ? true : null;
  }
  get _ariaDisabled() {
    return this.disabled ? true : null;
  }
  ngOnChanges(changes) {
    if (changes["rate"]) {
      this.update(this.rate);
    }
    if (changes["max"]) {
      this._updateMax();
    }
  }
  ngOnInit() {
    this._setupContexts();
    this._updateState(this.rate);
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  isInteractive() {
    return !this.readonly && !this.disabled;
  }
  enter(value) {
    if (this.isInteractive()) {
      this._updateState(value);
    }
    this.hover.emit(value);
  }
  handleBlur() {
    this.onTouched();
  }
  handleClick(value) {
    if (this.isInteractive()) {
      this.update(this.resettable && this.rate === value ? 0 : value);
    }
  }
  handleKeyDown(event) {
    switch (event.which) {
      case Key.ArrowDown:
      case Key.ArrowLeft:
        this.update(this.rate - 1);
        break;
      case Key.ArrowUp:
      case Key.ArrowRight:
        this.update(this.rate + 1);
        break;
      case Key.Home:
        this.update(0);
        break;
      case Key.End:
        this.update(this.max);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
  reset() {
    this.leave.emit(this.nextRate);
    this._updateState(this.rate);
  }
  update(value, internalChange = true) {
    const newRate = getValueInRange(value, this.max, 0);
    if (this.isInteractive() && this.rate !== newRate) {
      this.rate = newRate;
      this.rateChange.emit(this.rate);
    }
    if (internalChange) {
      this.onChange(this.rate);
      this.onTouched();
    }
    this._updateState(this.rate);
  }
  writeValue(value) {
    this.update(value, false);
    this._changeDetectorRef.markForCheck();
  }
  _updateState(nextValue) {
    this.nextRate = nextValue;
    this.contexts.forEach((context, index) => context.fill = Math.round(getValueInRange(nextValue - index, 1, 0) * 100));
  }
  _updateMax() {
    if (this.max > 0) {
      this._setupContexts();
      this.update(this.rate);
    }
  }
  _setupContexts() {
    this.contexts = Array.from({
      length: this.max
    }, (_value, index) => ({
      fill: 0,
      index
    }));
  }
  constructor() {
    this.contexts = [];
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbRating"] ? globalThis.ɵngjsInjected["NgbRating"][0] : inject(NgbRatingConfig);
    this._changeDetectorRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbRating"] ? globalThis.ɵngjsInjected["NgbRating"][1] : inject(ChangeDetectorRef);
    this.disabled = false;
    this.max = this._config.max;
    this.readonly = this._config.readonly;
    this.resettable = this._config.resettable;
    this.tabindex = this._config.tabindex;
    this.hover = new EventEmitter();
    this.leave = new EventEmitter();
    this.rateChange = new EventEmitter();
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    this._dInlineFlex = true;
    this._role = "slider";
    this._ariaValueMin = "0";
  }
};
NgbRating.ɵfac = [
  "NgbRatingConfig_27d85a85",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbRating_Factory(i0, i1, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbRating": [
        i0,
        i1
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbRating)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._dInlineFlex;
    }, function(v) {
      v ? $element.addClass("d-inline-flex") : $element.removeClass("d-inline-flex");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._tabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaValueMin;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuemin") : $element.attr("aria-valuemin", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._ariaValueMax;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuemax") : $element.attr("aria-valuemax", String(v));
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._ariaValueNow;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuenow") : $element.attr("aria-valuenow", String(v));
    });
    var ɵunwatch6 = $scope.$watch(function() {
      return instance._ariaValueText;
    }, function(v) {
      v == null ? $element.removeAttr("aria-valuetext") : $element.attr("aria-valuetext", String(v));
    });
    var ɵunwatch7 = $scope.$watch(function() {
      return instance._ariaReadonly;
    }, function(v) {
      v == null ? $element.removeAttr("aria-readonly") : $element.attr("aria-readonly", String(v));
    });
    var ɵunwatch8 = $scope.$watch(function() {
      return instance._ariaDisabled;
    }, function(v) {
      v == null ? $element.removeAttr("aria-disabled") : $element.attr("aria-disabled", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("d-inline-flex") : $element.removeClass("d-inline-flex");
      })(instance._dInlineFlex);
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance._tabindex);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuemin") : $element.attr("aria-valuemin", String(v));
      })(instance._ariaValueMin);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuemax") : $element.attr("aria-valuemax", String(v));
      })(instance._ariaValueMax);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuenow") : $element.attr("aria-valuenow", String(v));
      })(instance._ariaValueNow);
      (function(v) {
        v == null ? $element.removeAttr("aria-valuetext") : $element.attr("aria-valuetext", String(v));
      })(instance._ariaValueText);
      (function(v) {
        v == null ? $element.removeAttr("aria-readonly") : $element.attr("aria-readonly", String(v));
      })(instance._ariaReadonly);
      (function(v) {
        v == null ? $element.removeAttr("aria-disabled") : $element.attr("aria-disabled", String(v));
      })(instance._ariaDisabled);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleBlur();
      } else {
        $scope.$apply(function() {
          instance.handleBlur();
        });
      }
    };
    $element.on("blur", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance.handleKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler1);
    var ɵhandler2 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.reset();
      } else {
        $scope.$apply(function() {
          instance.reset();
        });
      }
    };
    $element.on("mouseleave", ɵhandler2);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
      ɵunwatch6();
      ɵunwatch7();
      ɵunwatch8();
      $element.off("blur", ɵhandler0);
      $element.off("keydown", ɵhandler1);
      $element.off("mouseleave", ɵhandler2);
    });
    return instance;
  }
];
NgbRating.ɵcmp = {
  selectors: [
    [
      "ngb-rating"
    ]
  ],
  inputs: {
    "disabled": "disabled",
    "max": "max",
    "rate": "rate",
    "readonly": "readonly",
    "resettable": "resettable",
    "starTemplate": "starTemplate",
    "tabindex": "tabindex",
    "ariaValueText": "ariaValueText"
  },
  outputs: {
    "hover": "hover",
    "leave": "leave",
    "rateChange": "rateChange"
  },
  queries: [
    {
      propertyName: "starTemplateFromContent",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return TemplateRef;
      }
    }
  ],
  viewQueries: [
    {
      propertyName: "defaultStarTemplate",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "defaultStar"
      ],
      get read() {
        return TemplateRef;
      }
    }
  ],
  definition: {
    "template": `<ng-template ng-ref="defaultStar" let-fill="fill">{{ fill === 100 ? '&#9733;' : '&#9734;' }}</ng-template>

<span ng-repeat="star in $.contexts track by $index">
    <span class="visually-hidden">({{ $index < $.nextRate ? '*' : ' ' }})</span>
    <span
        ng-mouseenter="$.enter($index + 1)"
        ng-click="$.handleClick($index + 1)"
        ng-style="{ cursor: $.isInteractive() ? 'pointer' : 'default' }">
        <ng-container
            ng-template-outlet="$.starTemplate || $.starTemplateFromContent || $.defaultStarTemplate"
            ng-template-outlet-context="star">
        </ng-container>
    </span>
</span>

<ng-content></ng-content>`,
    "bindings": {
      "disabled": "<?ngDisabled",
      "max": "<?",
      "rate": "<?",
      "readonly": "<?ngReadonly",
      "resettable": "<?",
      "starTemplate": "<?",
      "tabindex": "<?",
      "ariaValueText": "<?",
      "hover": "&?",
      "leave": "&?",
      "rateChange": "&?"
    },
    "transclude": true
  }
};
NgbRating.ɵfac.ɵcomponent = true;
NgbRating.ɵfac.ɵtype = NgbRating;
NgbRating.ɵfac.ɵproviders = [
  {
    token: "NG_VALUE_ACCESSOR_de942eb5",
    kind: "useExisting",
    existing: "NgbRating_23cc7bfe",
    multi: true
  }
];
NgbRating.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbRating.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["disabled"];
    if (!c) return;
    changes["disabled"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["max"];
    if (!c) return;
    changes["max"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["rate"];
    if (!c) return;
    changes["rate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["readonly"];
    if (!c) return;
    changes["readonly"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["resettable"];
    if (!c) return;
    changes["resettable"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["starTemplate"];
    if (!c) return;
    changes["starTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["tabindex"];
    if (!c) return;
    changes["tabindex"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["ariaValueText"];
    if (!c) return;
    changes["ariaValueText"] = {
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
function ɵElementInjectorNode(providers, parent, $injector, element, boundary) {
  this.parent = parent;
  this.$injector = $injector;
  this.element = element;
  this.boundary = boundary;
  this.singles = {};
  this.multis = {};
  this.cache = {};
  for (var i = 0; i < providers.length; i++) {
    var p = providers[i];
    if (p.multi) {
      (this.multis[p.token] = this.multis[p.token] || []).push(p);
    } else {
      this.singles[p.token] = p;
    }
  }
}
var ɵNOT_FOUND = {};
ɵElementInjectorNode.prototype.resolve = function(name) {
  if (name === "ɵresolve") return this.resolverFor(this.boundary);
  return this.resolveWith(name, {});
};
ɵElementInjectorNode.prototype.resolverFor = function(boundary) {
  var self = this;
  return function(token, flags) {
    flags = flags || {};
    return flags.host ? self.resolveHost(token, flags, boundary) : self.resolveWith(token, flags);
  };
};
ɵElementInjectorNode.prototype.resolveWith = function(name, flags) {
  if (flags.host) return this.resolveHost(name, flags, this.boundary);
  if (!flags.skipSelf) {
    var own = this.resolveOwn(name);
    if (own !== ɵNOT_FOUND) return own;
    if (flags.self) {
      if (flags.optional) return null;
      throw new Error('ɵElementInjectorNode: no hay provider para "' + name + '" con { self: true }.');
    }
  }
  if (this.parent) return this.parent.resolveWith(name, {
    optional: flags.optional
  });
  if (!flags.optional) return this.$injector.get(name);
  return this.$injector.has(name) ? this.$injector.get(name) : null;
};
ɵElementInjectorNode.prototype.resolveHost = function(name, flags, boundary) {
  var within = function(node2) {
    return !boundary || !node2.element || node2.element === boundary || boundary.contains(node2.element);
  };
  for (var node = flags.skipSelf ? this.parent : this; node && within(node); node = node.parent) {
    var own = node.resolveOwn(name);
    if (own !== ɵNOT_FOUND) return own;
  }
  if (flags.optional) return null;
  throw new Error('ɵElementInjectorNode: no hay provider para "' + name + '" con { host: true } (entre este elemento y su host).');
};
ɵElementInjectorNode.prototype.provides = function(name) {
  for (var node = this; node; node = node.parent) {
    if (Object.prototype.hasOwnProperty.call(node.singles, name) || Object.prototype.hasOwnProperty.call(node.multis, name)) return true;
  }
  return false;
};
ɵElementInjectorNode.prototype.resolveOwn = function(name) {
  if (Object.prototype.hasOwnProperty.call(this.cache, name)) return this.cache[name];
  if (Object.prototype.hasOwnProperty.call(this.multis, name)) {
    var resolved = this.multis[name].map(this.instantiate, this);
    this.cache[name] = resolved;
    return resolved;
  }
  if (Object.prototype.hasOwnProperty.call(this.singles, name)) {
    var resolved = this.instantiate(this.singles[name]);
    this.cache[name] = resolved;
    return resolved;
  }
  return ɵNOT_FOUND;
};
ɵElementInjectorNode.prototype.instantiate = function(descriptor) {
  var self = this;
  var resolve = function(name) {
    return self.resolve(name);
  };
  if (descriptor.kind === "useValue") return descriptor.value;
  if (descriptor.kind === "useFactory") return descriptor.factory.apply(null, descriptor.deps.map(resolve));
  if (descriptor.kind === "useExisting") return resolve(descriptor.existing);
  if (descriptor.deps) return new (Function.prototype.bind.apply(descriptor.ctor, [
    null
  ].concat(descriptor.deps.map(resolve))))();
  var ctor = descriptor.ctor;
  var own = Object.prototype.hasOwnProperty;
  var fac = descriptor.kind === "class" && own.call(ctor, "ɵprov") && ctor.ɵprov.factory || (own.call(ctor, "ɵfac") ? ctor.ɵfac : null);
  if (!fac && ctor.ɵfac) throw new Error('"' + ctor.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
  if (!fac) return new ctor();
  return fac[fac.length - 1].apply(null, fac.slice(0, -1).map(resolve));
};
ɵElementInjectorNode.prototype.destroy = function() {
  var cache = this.cache;
  this.cache = {};
  for (var name in cache) {
    var values = Object.prototype.hasOwnProperty.call(this.multis, name) ? cache[name] : [
      cache[name]
    ];
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      if (value && typeof value.ngOnDestroy === "function" && !this.isAlias(name)) value.ngOnDestroy();
    }
  }
};
ɵElementInjectorNode.prototype.isAlias = function(name) {
  var single = this.singles[name];
  return Boolean(single && (single.kind === "useExisting" || single.kind === "useValue"));
};
function ɵscopedController($delegate, $injector) {
  if ($injector.ɵngjsScopedController) return $delegate;
  $injector.ɵngjsScopedController = true;
  return function(expression, locals, later, ident) {
    var $element = locals && locals.$element;
    if (!$element) return $delegate(expression, locals, later, ident);
    var isComponent = Boolean(expression && expression.ɵcomponent);
    var boundary = isComponent ? $element[0] : $element.parent ? $element.parent().inheritedData("$ngjsHost") : void 0;
    var ownProviders = expression && expression.ɵproviders;
    var node = $element.inheritedData("$ngjsScopedInjector");
    if (ownProviders && ownProviders.length) {
      node = new ɵElementInjectorNode(ownProviders, node, $injector, $element[0], boundary);
      $element.data("$ngjsScopedInjector", node);
      var $scope = locals.$scope;
      if ($scope && $scope.$on) {
        (function(ownNode) {
          $scope.$on("$destroy", function() {
            ownNode.destroy();
          });
        })(node);
      }
    }
    if (!node) return $delegate(expression, locals, later, ident);
    var depNames = Array.isArray(expression) ? expression.slice(0, -1) : expression && expression.$inject || [];
    var extra;
    for (var i = 0; i < depNames.length; i++) {
      var name = depNames[i];
      if (locals && Object.prototype.hasOwnProperty.call(locals, name)) continue;
      if (name !== "ɵresolve" && !node.provides(name)) continue;
      extra = extra || {};
      extra[name] = name === "ɵresolve" ? node.resolverFor(boundary) : node.resolve(name);
    }
    if (!extra) return $delegate(expression, locals, later, ident);
    var merged = {};
    for (var k in locals) merged[k] = locals[k];
    for (var k2 in extra) merged[k2] = extra[k2];
    return $delegate(expression, merged, later, ident);
  };
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
var NgbRatingModule = class {
};
NgbRatingModule.ɵfac = [
  function NgbRatingModule_Factory() {
    return new (this && this.ɵT || NgbRatingModule)();
  }
];
NgbRatingModule.ɵmod = {
  id: "NgbRatingModule_d2b906a9",
  controllerAs: "$"
};
import_angular.default.module("NgbRatingModule_d2b906a9", [
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
  ɵscopedController
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵlazyController
]).component("ngbRating", {
  controller: NgbRating.ɵfac,
  template: `<ng-template ng-ref="defaultStar" let-fill="fill">{{ fill === 100 ? '&#9733;' : '&#9734;' }}</ng-template>

<span ng-repeat="star in $.contexts track by $index">
    <span class="visually-hidden">({{ $index < $.nextRate ? '*' : ' ' }})</span>
    <span
        ng-mouseenter="$.enter($index + 1)"
        ng-click="$.handleClick($index + 1)"
        ng-style="{ cursor: $.isInteractive() ? 'pointer' : 'default' }">
        <ng-container
            ng-template-outlet="$.starTemplate || $.starTemplateFromContent || $.defaultStarTemplate"
            ng-template-outlet-context="star">
        </ng-container>
    </span>
</span>

<ng-content></ng-content>`,
  controllerAs: "$",
  transclude: true,
  bindings: {
    "disabled": "<?ngDisabled",
    "max": "<?",
    "rate": "<?",
    "readonly": "<?ngReadonly",
    "resettable": "<?",
    "starTemplate": "<?",
    "tabindex": "<?",
    "ariaValueText": "<?",
    "hover": "&?",
    "leave": "&?",
    "rateChange": "&?"
  }
}).directive("ngbRating", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "hover",
          "leave",
          "rate-change"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbRatingModule_dec67b10", NgbRatingModule.ɵfac).run([
  "NgbRatingModule_dec67b10",
  function() {
  }
]);

// src/app/features/rating/rating.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Rating",
      tabs: [
        {
          name: "Examples",
          to: "/components/rating/examples"
        },
        {
          name: "Api",
          to: "/components/rating/api"
        }
      ],
      externalLinks: {
        ngBootstrap: "components/rating/overview"
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
              id: "basic-rating",
              name: "Basic demo"
            },
            {
              id: "rating-events",
              name: "Events and readonly"
            },
            {
              id: "rating-custom-template",
              name: "Custom star template"
            },
            {
              id: "rating-decimal",
              name: "Decimal rating"
            },
            {
              id: "rating-form",
              name: "Form integration"
            },
            {
              id: "rating-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./rating-examples-page.component-ROANUUA7.js").then((m) => m.RatingExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-rating",
              name: "NgbRating"
            },
            {
              id: "ngb-rating-config",
              name: "NgbRatingConfig"
            }
          ]
        },
        loadComponent: () => import("./rating-api-page.component-QETUFWOM.js").then((m) => m.RatingApiPageComponent)
      }
    ]
  }
];

// src/app/features/rating/components/basic-rating/basic-rating.component.ts
var BasicRatingComponent = class {
  setRating(rating) {
    this.rating = rating;
  }
  constructor() {
    this.rating = 3;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-52efd2d9],.card[_content-52efd2d9],.dropdown-menu[_content-52efd2d9],.list-group-item[_content-52efd2d9],.form-control[_content-52efd2d9],.form-select[_content-52efd2d9]{border-color:var(--bs-border-color)}.alert-light[_content-52efd2d9]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-52efd2d9],.list-group[_content-52efd2d9],.dropdown-menu[_content-52efd2d9]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-52efd2d9],.btn-outline-secondary[_content-52efd2d9]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-52efd2d9],.form-select[_content-52efd2d9]{background-color:var(--bs-body-bg)}code[_content-52efd2d9]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
BasicRatingComponent.ɵfac = [
  "$element",
  "$scope",
  function BasicRatingComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || BasicRatingComponent)();
    return instance;
  }
];
BasicRatingComponent.ɵcmp = {
  selectors: [
    [
      "docs-basic-rating"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/basic-rating.component-e476946c.html",
    "controllerAs": "example"
  }
};
BasicRatingComponent.ɵfac.ɵcomponent = true;
BasicRatingComponent.ɵfac.ɵtype = BasicRatingComponent;

// src/app/features/rating/components/rating-custom-template/rating-custom-template.component.ts
var RatingCustomTemplateComponent = class {
  setRating(rating) {
    this.rating = rating;
  }
  constructor() {
    this.rating = 6;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".star[_content-05673c88]{color:var(--bs-secondary-color);font-size:2.1rem;padding-right:.15rem;filter:drop-shadow(0 .2rem .35rem rgba(var(--bs-body-color-rgb),.1))}.star.filled[_content-05673c88]{color:var(--bs-warning)}.star.filled.low[_content-05673c88]{color:var(--bs-danger)}";
  document.head.appendChild(s);
})();
RatingCustomTemplateComponent.ɵfac = [
  "$element",
  "$scope",
  function RatingCustomTemplateComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingCustomTemplateComponent)();
    return instance;
  }
];
RatingCustomTemplateComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-custom-template"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-custom-template.component-68dc6f69.html",
    "controllerAs": "example"
  }
};
RatingCustomTemplateComponent.ɵfac.ɵcomponent = true;
RatingCustomTemplateComponent.ɵfac.ɵtype = RatingCustomTemplateComponent;

// src/app/features/rating/components/rating-decimal/rating-decimal.component.ts
var RatingDecimalComponent = class {
  constructor() {
    this.rating = 3.14;
    this.ariaValueText = (current, max) => `${current} out of ${max} hearts`;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".heart[_content-fccd2cc9]{color:var(--bs-secondary-bg);display:inline-block;font-size:2.35rem;margin-right:.15rem;position:relative;filter:drop-shadow(0 .25rem .45rem rgba(var(--bs-body-color-rgb),.1))}.heart .fill[_content-fccd2cc9]{color:var(--bs-danger);left:0;overflow:hidden;position:absolute;top:0}";
  document.head.appendChild(s);
})();
RatingDecimalComponent.ɵfac = [
  "$element",
  "$scope",
  function RatingDecimalComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingDecimalComponent)();
    return instance;
  }
];
RatingDecimalComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-decimal"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-decimal.component-0cd006c3.html",
    "controllerAs": "example"
  }
};
RatingDecimalComponent.ɵfac.ɵcomponent = true;
RatingDecimalComponent.ɵfac.ɵtype = RatingDecimalComponent;

// src/app/features/rating/components/rating-events/rating-events.component.ts
var RatingEventsComponent = class {
  setSelected(value) {
    this.selected = value;
  }
  setHovered(value) {
    this.hovered = value;
  }
  constructor() {
    this.selected = 0;
    this.hovered = 0;
    this.readonly = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-0c77f322],.card[_content-0c77f322],.dropdown-menu[_content-0c77f322],.list-group-item[_content-0c77f322],.form-control[_content-0c77f322],.form-select[_content-0c77f322]{border-color:var(--bs-border-color)}.alert-light[_content-0c77f322]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-0c77f322],.list-group[_content-0c77f322],.dropdown-menu[_content-0c77f322]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-0c77f322],.btn-outline-secondary[_content-0c77f322]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-0c77f322],.form-select[_content-0c77f322]{background-color:var(--bs-body-bg)}code[_content-0c77f322]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
RatingEventsComponent.ɵfac = [
  "$element",
  "$scope",
  function RatingEventsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingEventsComponent)();
    return instance;
  }
];
RatingEventsComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-events"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-events.component-98d0ca49.html",
    "controllerAs": "example"
  }
};
RatingEventsComponent.ɵfac.ɵcomponent = true;
RatingEventsComponent.ɵfac.ɵtype = RatingEventsComponent;

// src/app/features/rating/components/rating-form/rating-form.component.ts
var RatingFormComponent = class {
  setRating(rating) {
    this.rating = rating;
  }
  clear() {
    this.rating = null;
  }
  constructor() {
    this.rating = null;
    this.disabled = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-19e9bd2f],.card[_content-19e9bd2f],.dropdown-menu[_content-19e9bd2f],.list-group-item[_content-19e9bd2f],.form-control[_content-19e9bd2f],.form-select[_content-19e9bd2f]{border-color:var(--bs-border-color)}.alert-light[_content-19e9bd2f]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-19e9bd2f],.list-group[_content-19e9bd2f],.dropdown-menu[_content-19e9bd2f]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-19e9bd2f],.btn-outline-secondary[_content-19e9bd2f]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-19e9bd2f],.form-select[_content-19e9bd2f]{background-color:var(--bs-body-bg)}code[_content-19e9bd2f]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
RatingFormComponent.ɵfac = [
  "$element",
  "$scope",
  function RatingFormComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingFormComponent)();
    return instance;
  }
];
RatingFormComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-form"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-form.component-09a82829.html",
    "controllerAs": "example"
  }
};
RatingFormComponent.ɵfac.ɵcomponent = true;
RatingFormComponent.ɵfac.ɵtype = RatingFormComponent;

// src/app/features/rating/components/rating-global/rating-global.component.ts
var RatingGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      max: config.max,
      readonly: config.readonly,
      resettable: config.resettable,
      tabindex: config.tabindex
    };
    config.max = 5;
    config.readonly = true;
    config.resettable = true;
    config.tabindex = -1;
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
  s.textContent = ".alert[_content-84b9b3ad],.card[_content-84b9b3ad],.dropdown-menu[_content-84b9b3ad],.list-group-item[_content-84b9b3ad],.form-control[_content-84b9b3ad],.form-select[_content-84b9b3ad]{border-color:var(--bs-border-color)}.alert-light[_content-84b9b3ad]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-84b9b3ad],.list-group[_content-84b9b3ad],.dropdown-menu[_content-84b9b3ad]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-84b9b3ad],.btn-outline-secondary[_content-84b9b3ad]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-84b9b3ad],.form-select[_content-84b9b3ad]{background-color:var(--bs-body-bg)}code[_content-84b9b3ad]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
RatingGlobalComponent.ɵfac = [
  "NgbRatingConfig_27d85a85",
  "$element",
  "$scope",
  function RatingGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingGlobalComponent)(a0);
    return instance;
  }
];
RatingGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-global.component-15369898.html",
    "controllerAs": "example"
  }
};
RatingGlobalComponent.ɵfac.ɵcomponent = true;
RatingGlobalComponent.ɵfac.ɵtype = RatingGlobalComponent;
RatingGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
RatingGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/rating/rating.module.ts
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
var RatingModule = class {
};
RatingModule.ɵfac = [
  function RatingModule_Factory() {
    return new (this && this.ɵT || RatingModule)();
  }
];
var ɵRatingModule_import0 = RouterModule.forChild(routes);
RatingModule.ɵmod = {
  id: "RatingModule_57d47c4b"
};
ɵimportProviders(import_angular2.default.module("RatingModule_57d47c4b", [
  typeof NgbRatingModule === "string" ? NgbRatingModule : NgbRatingModule.ɵmod ? NgbRatingModule.ɵmod.id : NgbRatingModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  ɵimportedModuleName(ɵRatingModule_import0)
]), [
  ɵRatingModule_import0
]).component("docsBasicRating", {
  controller: BasicRatingComponent.ɵfac,
  templateUrl: "templates/basic-rating.component-e476946c.html",
  controllerAs: "example"
}).component("docsRatingCustomTemplate", {
  controller: RatingCustomTemplateComponent.ɵfac,
  templateUrl: "templates/rating-custom-template.component-68dc6f69.html",
  controllerAs: "example"
}).component("docsRatingDecimal", {
  controller: RatingDecimalComponent.ɵfac,
  templateUrl: "templates/rating-decimal.component-0cd006c3.html",
  controllerAs: "example"
}).component("docsRatingEvents", {
  controller: RatingEventsComponent.ɵfac,
  templateUrl: "templates/rating-events.component-98d0ca49.html",
  controllerAs: "example"
}).component("docsRatingForm", {
  controller: RatingFormComponent.ɵfac,
  templateUrl: "templates/rating-form.component-09a82829.html",
  controllerAs: "example"
}).component("docsRatingGlobal", {
  controller: RatingGlobalComponent.ɵfac,
  templateUrl: "templates/rating-global.component-15369898.html",
  controllerAs: "example"
}).factory("RatingModule_fdac28a9", RatingModule.ɵfac).run([
  "RatingModule_fdac28a9",
  function() {
  }
]);
export {
  RatingModule
};
