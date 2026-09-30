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
} from "./chunk-LLJWGL4Q.js";
import {
  NgbNavModule
} from "./chunk-XGPPTD7J.js";
import {
  NgbScrollSpyModule
} from "./chunk-CWWWR73V.js";
import {
  RouterModule
} from "./chunk-5I64J5PC.js";
import "./chunk-S4GGKWRG.js";
import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  isInteger,
  isNumber,
  padNumber,
  toInteger
} from "./chunk-26Q6D6UX.js";
import {
  CommonModule,
  ElementRef,
  require_angular
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/timepicker/timepicker.module.ts
var import_angular3 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-RFSXSMSN.js
var import_angular = __toESM(require_angular(), 1);
var import_angular2 = __toESM(require_angular(), 1);
function NGB_TIMEPICKER_TIME_ADAPTER_FACTORY() {
  return new NgbTimeStructAdapter();
}
var NgbTimeAdapter = class {
};
var NgbTimeStructAdapter = class extends NgbTimeAdapter {
  /**
  * Converts a NgbTimeStruct value into NgbTimeStruct value
  */
  fromModel(time) {
    return time && isInteger(time.hour) && isInteger(time.minute) ? {
      hour: time.hour,
      minute: time.minute,
      second: isInteger(time.second) ? time.second : null
    } : null;
  }
  /**
  * Converts a NgbTimeStruct value into NgbTimeStruct value
  */
  toModel(time) {
    return time && isInteger(time.hour) && isInteger(time.minute) ? {
      hour: time.hour,
      minute: time.minute,
      second: isInteger(time.second) ? time.second : null
    } : null;
  }
};
NgbTimeAdapter.ɵfac = [
  function NgbTimeAdapter_Factory() {
    return new NgbTimeAdapter();
  }
];
NgbTimeAdapter.ɵprov = {
  token: "NgbTimeAdapter_120c0578",
  providedIn: "root",
  factory: [
    function() {
      return NGB_TIMEPICKER_TIME_ADAPTER_FACTORY();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbTimeAdapter_120c0578",
  NgbTimeAdapter.ɵprov.factory
]);
NgbTimeStructAdapter.ɵfac = [
  function NgbTimeStructAdapter_Factory() {
    return new NgbTimeStructAdapter();
  }
];
NgbTimeStructAdapter.ɵprov = {
  token: "NgbTimeStructAdapter_c7ad7bec"
};
var NgbTimepickerConfig = class {
  constructor() {
    this.meridian = false;
    this.spinners = true;
    this.seconds = false;
    this.hourStep = 1;
    this.minuteStep = 1;
    this.secondStep = 1;
    this.disabled = false;
    this.readonlyInputs = false;
    this.size = "medium";
  }
};
NgbTimepickerConfig.ɵfac = [
  function NgbTimepickerConfig_Factory() {
    return new NgbTimepickerConfig();
  }
];
NgbTimepickerConfig.ɵprov = {
  token: "NgbTimepickerConfig_31f5dfb7",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbTimepickerConfig_31f5dfb7",
  NgbTimepickerConfig.ɵfac
]);
var NgbTimepickerI18n = class {
};
var NgbTimepickerI18nDefault = class extends NgbTimepickerI18n {
  // upstream: sin constructor (`inject(LOCALE_ID)` en field). Acá se acepta un
  // `$filter` opcional para el uso `new NgbTimepickerI18nDefault()` fuera de un
  // contexto DI (stubs de test).
  constructor($filter) {
    super();
    const dateFilter = ($filter ?? (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepickerI18nDefault"] ? globalThis.ɵngjsInjected["NgbTimepickerI18nDefault"][0] : inject("$filter")))("date");
    this._periods = [
      dateFilter(/* @__PURE__ */ new Date(36e5), "a", "UTC"),
      dateFilter(new Date(36e5 * 13), "a", "UTC")
    ];
  }
  getMorningPeriod() {
    return this._periods[0];
  }
  getAfternoonPeriod() {
    return this._periods[1];
  }
};
NgbTimepickerI18n.ɵfac = [
  function NgbTimepickerI18n_Factory() {
    return new NgbTimepickerI18n();
  }
];
NgbTimepickerI18n.ɵprov = {
  token: "NgbTimepickerI18n_5f47b5e6",
  providedIn: "root",
  factory: [
    function() {
      return (() => new NgbTimepickerI18nDefault())();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbTimepickerI18n_5f47b5e6",
  NgbTimepickerI18n.ɵprov.factory
]);
NgbTimepickerI18nDefault.ɵfac = [
  "IFilterService_616666ba",
  "$filter",
  function NgbTimepickerI18nDefault_Factory(a0, i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbTimepickerI18nDefault": [
        i0
      ]
    };
    try {
      var instance = new NgbTimepickerI18nDefault(a0);
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbTimepickerI18nDefault.ɵprov = {
  token: "NgbTimepickerI18nDefault_3d4cf5db"
};
var NgbTime = class {
  constructor(hour, minute, second) {
    this.hour = toInteger(hour);
    this.minute = toInteger(minute);
    this.second = toInteger(second);
  }
  changeHour(step = 1) {
    this.updateHour((isNaN(this.hour) ? 0 : this.hour) + step);
  }
  updateHour(hour) {
    if (isNumber(hour)) {
      this.hour = (hour < 0 ? 24 + hour : hour) % 24;
      return;
    }
    this.hour = NaN;
  }
  changeMinute(step = 1) {
    this.updateMinute((isNaN(this.minute) ? 0 : this.minute) + step);
  }
  updateMinute(minute) {
    if (isNumber(minute)) {
      this.minute = minute % 60 < 0 ? 60 + minute % 60 : minute % 60;
      this.changeHour(Math.floor(minute / 60));
      return;
    }
    this.minute = NaN;
  }
  changeSecond(step = 1) {
    this.updateSecond((isNaN(this.second) ? 0 : this.second) + step);
  }
  updateSecond(second) {
    if (isNumber(second)) {
      this.second = second < 0 ? 60 + second % 60 : second % 60;
      this.changeMinute(Math.floor(second / 60));
      return;
    }
    this.second = NaN;
  }
  isValid(checkSecs = true) {
    return isNumber(this.hour) && isNumber(this.minute) && (checkSecs ? isNumber(this.second) : true);
  }
  toString() {
    return `${this.hour || 0}:${this.minute || 0}:${this.second || 0}`;
  }
};
var FILTER_REGEX = /[^0-9]/g;
var NgbTimepicker = class {
  /**
  * The number of hours to add/subtract when clicking hour spinners.
  */
  set hourStep(step) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }
  get hourStep() {
    return this._hourStep;
  }
  /**
  * The number of minutes to add/subtract when clicking minute spinners.
  */
  set minuteStep(step) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }
  get minuteStep() {
    return this._minuteStep;
  }
  /**
  * The number of seconds to add/subtract when clicking second spinners.
  */
  set secondStep(step) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }
  get secondStep() {
    return this._secondStep;
  }
  ngAfterViewInit() {
    this._nativeElement.classList.add("d-inline-block", "fs-6");
    this._nativeElement.addEventListener("input", this._handleInputEvent);
    this._destroyRef.onDestroy(() => this._nativeElement.removeEventListener("input", this._handleInputEvent));
    this._renderInputValues();
  }
  writeValue(value) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();
    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }
    this._renderInputValues();
    this._cd.markForCheck();
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
  /**
  * Increments the hours by the given step.
  */
  changeHour(step) {
    this.model?.changeHour(step);
    this._propagateModelChange();
  }
  /**
  * Increments the minutes by the given step.
  */
  changeMinute(step) {
    this.model?.changeMinute(step);
    this._propagateModelChange();
  }
  /**
  * Increments the seconds by the given step.
  */
  changeSecond(step) {
    this.model?.changeSecond(step);
    this._propagateModelChange();
  }
  /**
  * Update hours with the new value.
  */
  updateHour(newVal) {
    const isPM = this.model ? this.model.hour >= 12 : false;
    const enteredHour = toInteger(newVal);
    if (this.meridian && (isPM && enteredHour < 12 || !isPM && enteredHour === 12)) {
      this.model?.updateHour(enteredHour + 12);
    } else {
      this.model?.updateHour(enteredHour);
    }
    this._propagateModelChange();
  }
  /**
  * Update minutes with the new value.
  */
  updateMinute(newVal) {
    this.model?.updateMinute(toInteger(newVal));
    this._propagateModelChange();
  }
  /**
  * Update seconds with the new value.
  */
  updateSecond(newVal) {
    this.model?.updateSecond(toInteger(newVal));
    this._propagateModelChange();
  }
  toggleMeridian() {
    if (this.model && isNumber(this.model.hour) && this.meridian) {
      this.changeHour(12);
    }
  }
  formatInput(input) {
    input.value = input.value.replace(FILTER_REGEX, "");
  }
  formatHour(value) {
    if (!isNumber(value)) {
      return padNumber(NaN);
    }
    return this.meridian ? padNumber(value % 12 === 0 ? 12 : value % 12) : padNumber(value % 24);
  }
  formatMinSec(value) {
    return padNumber(isNumber(value) ? value : NaN);
  }
  handleBlur() {
    this.onTouched();
  }
  get isSmallSize() {
    return this.size === "small";
  }
  get isLargeSize() {
    return this.size === "large";
  }
  ngOnChanges(changes) {
    if (changes["seconds"] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this._propagateModelChange(false);
    }
    this._renderInputValues();
  }
  _propagateModelChange(touched = true) {
    this._renderInputValues();
    if (touched) {
      this.onTouched();
    }
    if (this.model?.isValid(this.seconds)) {
      this.onChange(this._ngbTimeAdapter.toModel({
        hour: this.model.hour,
        minute: this.model.minute,
        second: this.model.second
      }));
    } else {
      this.onChange(this._ngbTimeAdapter.toModel(null));
    }
  }
  _renderInputValues() {
    this.hourInput = this.formatHour(this.model?.hour);
    this.minuteInput = this.formatMinSec(this.model?.minute);
    this.secondInput = this.formatMinSec(this.model?.second);
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][0] : inject(NgbTimepickerConfig);
    this._ngbTimeAdapter = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][1] : inject(NgbTimeAdapter);
    this._cd = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][2] : inject(ChangeDetectorRef);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][3] : inject(ElementRef)).nativeElement;
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][4] : inject(DestroyRef);
    this.i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTimepicker"] ? globalThis.ɵngjsInjected["NgbTimepicker"][5] : inject(NgbTimepickerI18n);
    this.disabled = this._config.disabled;
    this.hourInput = "";
    this.minuteInput = "";
    this.secondInput = "";
    this._hourStep = this._config.hourStep;
    this._minuteStep = this._config.minuteStep;
    this._secondStep = this._config.secondStep;
    this.meridian = this._config.meridian;
    this.spinners = this._config.spinners;
    this.seconds = this._config.seconds;
    this.readonlyInputs = this._config.readonlyInputs;
    this.size = this._config.size;
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    this._handleInputEvent = (event) => {
      const input = event.target;
      if (input instanceof HTMLInputElement) {
        this.formatInput(input);
      }
    };
  }
};
NgbTimepicker.ɵfac = [
  "NgbTimepickerConfig_31f5dfb7",
  "NgbTimeAdapter_120c0578",
  "ChangeDetectorRef_e2bfcbab",
  "ElementRef_927308a2",
  "DestroyRef_a5c7a091",
  "NgbTimepickerI18n_5f47b5e6",
  "$element",
  "$scope",
  function NgbTimepicker_Factory(i0, i1, i2, i3, i4, i5, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbTimepicker": [
        i0,
        i1,
        i2,
        i3,
        i4,
        i5
      ]
    };
    try {
      var instance = new NgbTimepicker();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbTimepicker.ɵcmp = {
  selectors: [
    [
      "ngb-timepicker"
    ]
  ],
  inputs: {
    "meridian": "meridian",
    "spinners": "spinners",
    "seconds": "seconds",
    "hourStep": "hourStep",
    "minuteStep": "minuteStep",
    "secondStep": "secondStep",
    "readonlyInputs": "readonlyInputs",
    "size": "size"
  },
  outputs: {},
  exportAs: [
    "ngbTimepicker"
  ],
  definition: {
    "template": `<fieldset ng-disabled="$.disabled" ng-class="{ disabled: $.disabled }">
    <div class="d-flex align-items-center">
        <div class="d-flex flex-column align-items-center">
            <button ng-if="$.spinners" ng-click="$.changeHour($.hourStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Increment hours</span>
            </button>

            <input ng-model="$.hourInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateHour($.hourInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeHour($.hourStep); $event.key === 'ArrowDown' &amp;&amp; $.changeHour(-$.hourStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="HH" aria-label="Hours">

            <button ng-if="$.spinners" ng-click="$.changeHour(-$.hourStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Decrement hours</span>
            </button>
        </div>

        <div class="mx-1 fw-bold" aria-hidden="true">:</div>

        <div class="d-flex flex-column align-items-center">
            <button ng-if="$.spinners" ng-click="$.changeMinute($.minuteStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Increment minutes</span>
            </button>

            <input ng-model="$.minuteInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateMinute($.minuteInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeMinute($.minuteStep); $event.key === 'ArrowDown' &amp;&amp; $.changeMinute(-$.minuteStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="MM" aria-label="Minutes">

            <button ng-if="$.spinners" ng-click="$.changeMinute(-$.minuteStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Decrement minutes</span>
            </button>
        </div>

        <div ng-if="$.seconds" class="d-flex align-items-center">
            <div class="mx-1 fw-bold" aria-hidden="true">:</div>

            <div class="d-flex flex-column align-items-center">
                <button ng-if="$.spinners" ng-click="$.changeSecond($.secondStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                    <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                    </span>
                    <span class="visually-hidden">Increment seconds</span>
                </button>

                <input ng-model="$.secondInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateSecond($.secondInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeSecond($.secondStep); $event.key === 'ArrowDown' &amp;&amp; $.changeSecond(-$.secondStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="SS" aria-label="Seconds">

                <button ng-if="$.spinners" ng-click="$.changeSecond(-$.secondStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                    <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                    </span>
                    <span class="visually-hidden">Decrement seconds</span>
                </button>
            </div>
        </div>

        <div ng-if="$.meridian" class="ms-2">
            <button ng-click="$.toggleMeridian()" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-outline-primary" type="button">
                {{
                    $.model &amp;&amp; $.model.hour &gt;= 12
                        ? $.i18n.getAfternoonPeriod()
                        : $.i18n.getMorningPeriod()
                }}
            </button>
        </div>
    </div>
</fieldset>`,
    "controllerAs": "$",
    "bindings": {
      "meridian": "<?",
      "spinners": "<?",
      "seconds": "<?",
      "hourStep": "<?",
      "minuteStep": "<?",
      "secondStep": "<?",
      "readonlyInputs": "<?",
      "size": "<?"
    }
  }
};
NgbTimepicker.ɵfac.ɵcomponent = true;
NgbTimepicker.ɵfac.ɵtype = NgbTimepicker;
NgbTimepicker.ɵfac.ɵproviders = [
  {
    token: "NG_VALUE_ACCESSOR_de942eb5",
    kind: "useExisting",
    existing: "NgbTimepicker_4d805d32",
    multi: true
  }
];
NgbTimepicker.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["meridian"];
    if (!c) return;
    changes["meridian"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["spinners"];
    if (!c) return;
    changes["spinners"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["seconds"];
    if (!c) return;
    changes["seconds"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["hourStep"];
    if (!c) return;
    changes["hourStep"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["minuteStep"];
    if (!c) return;
    changes["minuteStep"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["secondStep"];
    if (!c) return;
    changes["secondStep"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["readonlyInputs"];
    if (!c) return;
    changes["readonlyInputs"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["size"];
    if (!c) return;
    changes["size"] = {
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
NgbTimepicker.prototype.$postLink = function() {
  this.ngAfterViewInit();
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
var NgbTimepickerModule = class {
};
NgbTimepickerModule.ɵfac = [
  function NgbTimepickerModule_Factory() {
    return new NgbTimepickerModule();
  }
];
NgbTimepickerModule.ɵmod = {
  id: "NgbTimepickerModule_61ade37f",
  controllerAs: "$"
};
import_angular2.default.module("NgbTimepickerModule_61ade37f", [
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
]).component("ngbTimepicker", {
  controller: NgbTimepicker.ɵfac,
  template: `<fieldset ng-disabled="$.disabled" ng-class="{ disabled: $.disabled }">
    <div class="d-flex align-items-center">
        <div class="d-flex flex-column align-items-center">
            <button ng-if="$.spinners" ng-click="$.changeHour($.hourStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Increment hours</span>
            </button>

            <input ng-model="$.hourInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateHour($.hourInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeHour($.hourStep); $event.key === 'ArrowDown' &amp;&amp; $.changeHour(-$.hourStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="HH" aria-label="Hours">

            <button ng-if="$.spinners" ng-click="$.changeHour(-$.hourStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Decrement hours</span>
            </button>
        </div>

        <div class="mx-1 fw-bold" aria-hidden="true">:</div>

        <div class="d-flex flex-column align-items-center">
            <button ng-if="$.spinners" ng-click="$.changeMinute($.minuteStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Increment minutes</span>
            </button>

            <input ng-model="$.minuteInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateMinute($.minuteInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeMinute($.minuteStep); $event.key === 'ArrowDown' &amp;&amp; $.changeMinute(-$.minuteStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="MM" aria-label="Minutes">

            <button ng-if="$.spinners" ng-click="$.changeMinute(-$.minuteStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                </span>
                <span class="visually-hidden">Decrement minutes</span>
            </button>
        </div>

        <div ng-if="$.seconds" class="d-flex align-items-center">
            <div class="mx-1 fw-bold" aria-hidden="true">:</div>

            <div class="d-flex flex-column align-items-center">
                <button ng-if="$.spinners" ng-click="$.changeSecond($.secondStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                    <span class="chevron ngb-tp-chevron" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: 0.15em; transform: rotate(-45deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                    </span>
                    <span class="visually-hidden">Increment seconds</span>
                </button>

                <input ng-model="$.secondInput" ng-model-options="{ updateOn: 'change' }" ng-change="$.updateSecond($.secondInput)" ng-blur="$.handleBlur()" ng-keydown="$event.key === 'ArrowUp' &amp;&amp; $.changeSecond($.secondStep); $event.key === 'ArrowDown' &amp;&amp; $.changeSecond(-$.secondStep); ($event.key === 'ArrowUp' || $event.key === 'ArrowDown') &amp;&amp; $event.preventDefault()" ng-readonly="$.readonlyInputs" ng-disabled="$.disabled" ng-class="{ 'form-control-sm': $.isSmallSize, 'form-control-lg': $.isLargeSize }" class="form-control text-center w-auto px-1" type="text" size="2" maxlength="2" inputmode="numeric" placeholder="SS" aria-label="Seconds">

                <button ng-if="$.spinners" ng-click="$.changeSecond(-$.secondStep)" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-link px-2 py-0 lh-1" tabindex="-1" type="button">
                    <span class="chevron ngb-tp-chevron bottom" style="border-style: solid; border-width: 0.29em 0.29em 0 0; display: inline-block; height: 0.69em; left: 0.05em; position: relative; top: -0.3em; transform: rotate(135deg); vertical-align: middle; width: 0.69em;" aria-hidden="true">
                    </span>
                    <span class="visually-hidden">Decrement seconds</span>
                </button>
            </div>
        </div>

        <div ng-if="$.meridian" class="ms-2">
            <button ng-click="$.toggleMeridian()" ng-disabled="$.disabled" ng-class="{ 'btn-sm': $.isSmallSize, 'btn-lg': $.isLargeSize, disabled: $.disabled }" class="btn btn-outline-primary" type="button">
                {{
                    $.model &amp;&amp; $.model.hour &gt;= 12
                        ? $.i18n.getAfternoonPeriod()
                        : $.i18n.getMorningPeriod()
                }}
            </button>
        </div>
    </div>
</fieldset>`,
  controllerAs: "$",
  bindings: {
    "meridian": "<?",
    "spinners": "<?",
    "seconds": "<?",
    "hourStep": "<?",
    "minuteStep": "<?",
    "secondStep": "<?",
    "readonlyInputs": "<?",
    "size": "<?"
  }
}).factory("NgbTimepickerModule_9060a086", NgbTimepickerModule.ɵfac).run([
  "NgbTimepickerModule_9060a086",
  function() {
  }
]);

// src/app/features/timepicker/timepicker.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Timepicker",
      tabs: [
        {
          name: "Examples",
          to: "/components/timepicker/examples"
        },
        {
          name: "Api",
          to: "/components/timepicker/api"
        }
      ],
      externalLinks: {
        ngBootstrap: "components/timepicker/overview"
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
              id: "basic-timepicker",
              name: "Basic timepicker"
            },
            {
              id: "meridian-timepicker",
              name: "Meridian"
            },
            {
              id: "seconds-timepicker",
              name: "Seconds"
            },
            {
              id: "spinners-timepicker",
              name: "Spinners"
            },
            {
              id: "timepicker-custom-steps",
              name: "Custom steps"
            },
            {
              id: "timepicker-validation",
              name: "Custom validation"
            },
            {
              id: "timepicker-custom-adapter",
              name: "Custom time adapter"
            },
            {
              id: "timepicker-i18n",
              name: "Internationalization"
            }
          ]
        },
        loadComponent: () => import("./timepicker-examples-page.component-GX72TSSY.js").then((m) => m.TimepickerExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-timepicker",
              name: "NgbTimepicker"
            },
            {
              id: "ngb-timepicker-config",
              name: "NgbTimepickerConfig"
            },
            {
              id: "ngb-time-adapter",
              name: "NgbTimeAdapter"
            },
            {
              id: "ngb-timepicker-i18n",
              name: "NgbTimepickerI18n"
            }
          ]
        },
        loadComponent: () => import("./timepicker-api-page.component-MOPP6PON.js").then((m) => m.TimepickerApiPageComponent)
      }
    ]
  }
];

// src/app/features/timepicker/components/basic-timepicker/basic-timepicker.component.ts
var BasicTimepickerComponent = class {
  constructor() {
    this.time = {
      hour: 13,
      minute: 30,
      second: 0
    };
  }
};
(function() {
  var h = "styles/basic-timepicker.component-3b6fea46.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
BasicTimepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function BasicTimepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new BasicTimepickerComponent();
    return instance;
  }
];
BasicTimepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-basic-timepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/basic-timepicker.component-9269c0ac.html",
    "controllerAs": "example"
  }
};
BasicTimepickerComponent.ɵfac.ɵcomponent = true;
BasicTimepickerComponent.ɵfac.ɵtype = BasicTimepickerComponent;

// src/app/features/timepicker/components/meridian-timepicker/meridian-timepicker.component.ts
var MeridianTimepickerComponent = class {
  constructor() {
    this.time = {
      hour: 13,
      minute: 30,
      second: 0
    };
    this.meridian = true;
  }
};
(function() {
  var h = "styles/meridian-timepicker.component-3a1b6158.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
MeridianTimepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function MeridianTimepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new MeridianTimepickerComponent();
    return instance;
  }
];
MeridianTimepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-meridian-timepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/meridian-timepicker.component-8805d801.html",
    "controllerAs": "example"
  }
};
MeridianTimepickerComponent.ɵfac.ɵcomponent = true;
MeridianTimepickerComponent.ɵfac.ɵtype = MeridianTimepickerComponent;

// src/app/features/timepicker/components/seconds-timepicker/seconds-timepicker.component.ts
var SecondsTimepickerComponent = class {
  constructor() {
    this.time = {
      hour: 13,
      minute: 30,
      second: 25
    };
    this.seconds = true;
  }
};
(function() {
  var h = "styles/seconds-timepicker.component-62f8695a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
SecondsTimepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function SecondsTimepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new SecondsTimepickerComponent();
    return instance;
  }
];
SecondsTimepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-seconds-timepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/seconds-timepicker.component-eb3b70de.html",
    "controllerAs": "example"
  }
};
SecondsTimepickerComponent.ɵfac.ɵcomponent = true;
SecondsTimepickerComponent.ɵfac.ɵtype = SecondsTimepickerComponent;

// src/app/features/timepicker/components/spinners-timepicker/spinners-timepicker.component.ts
var SpinnersTimepickerComponent = class {
  constructor() {
    this.time = {
      hour: 13,
      minute: 30,
      second: 0
    };
    this.spinners = true;
  }
};
(function() {
  var h = "styles/spinners-timepicker.component-95797339.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
SpinnersTimepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function SpinnersTimepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new SpinnersTimepickerComponent();
    return instance;
  }
];
SpinnersTimepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-spinners-timepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/spinners-timepicker.component-7edee0c0.html",
    "controllerAs": "example"
  }
};
SpinnersTimepickerComponent.ɵfac.ɵcomponent = true;
SpinnersTimepickerComponent.ɵfac.ɵtype = SpinnersTimepickerComponent;

// src/app/features/timepicker/components/timepicker-custom-adapter/timepicker-custom-adapter.component.ts
var pad = (value) => value.toString().padStart(2, "0");
var NgbTimeStringAdapter = class extends NgbTimeAdapter {
  fromModel(value) {
    if (!value) return null;
    const [hour, minute, second] = value.split(":").map(Number);
    return {
      hour,
      minute,
      second
    };
  }
  toModel(time) {
    return time ? `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second ?? 0)}` : null;
  }
};
var TimepickerCustomAdapterComponent = class {
  ngDoCheck() {
    this.model = this.adapter.toModel(this.time) ?? "";
  }
  constructor() {
    this.adapter = new NgbTimeStringAdapter();
    this.time = this.adapter.fromModel("13:30:00");
    this.model = "13:30:00";
  }
};
(function() {
  var h = "styles/timepicker-custom-adapter.component-8d46b80c.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TimepickerCustomAdapterComponent.ɵfac = [
  "$element",
  "$scope",
  function TimepickerCustomAdapterComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TimepickerCustomAdapterComponent();
    return instance;
  }
];
TimepickerCustomAdapterComponent.ɵcmp = {
  selectors: [
    [
      "docs-timepicker-custom-adapter"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/timepicker-custom-adapter.component-cf5812ee.html",
    "controllerAs": "example"
  }
};
TimepickerCustomAdapterComponent.ɵfac.ɵcomponent = true;
TimepickerCustomAdapterComponent.ɵfac.ɵtype = TimepickerCustomAdapterComponent;
TimepickerCustomAdapterComponent.prototype.$doCheck = function() {
  this.ngDoCheck();
};

// src/app/features/timepicker/components/timepicker-custom-steps/timepicker-custom-steps.component.ts
var TimepickerCustomStepsComponent = class {
  constructor() {
    this.time = {
      hour: 13,
      minute: 30,
      second: 0
    };
    this.hourStep = 1;
    this.minuteStep = 15;
    this.secondStep = 30;
  }
};
(function() {
  var h = "styles/timepicker-custom-steps.component-e512eddb.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TimepickerCustomStepsComponent.ɵfac = [
  "$element",
  "$scope",
  function TimepickerCustomStepsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TimepickerCustomStepsComponent();
    return instance;
  }
];
TimepickerCustomStepsComponent.ɵcmp = {
  selectors: [
    [
      "docs-timepicker-custom-steps"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/timepicker-custom-steps.component-7927d59a.html",
    "controllerAs": "example"
  }
};
TimepickerCustomStepsComponent.ɵfac.ɵcomponent = true;
TimepickerCustomStepsComponent.ɵfac.ɵtype = TimepickerCustomStepsComponent;

// src/app/features/timepicker/components/timepicker-i18n/timepicker-i18n.component.ts
var GreekTimepickerI18n = class extends NgbTimepickerI18n {
  getMorningPeriod() {
    return "π.μ.";
  }
  getAfternoonPeriod() {
    return "μ.μ.";
  }
};
var TimepickerI18nComponent = class {
  constructor(i18n) {
    this.i18n = i18n;
    this.time = {
      hour: 13,
      minute: 30,
      second: 0
    };
  }
};
(function() {
  var h = "styles/timepicker-i18n.component-0370ea3d.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
GreekTimepickerI18n.ɵfac = [
  function GreekTimepickerI18n_Factory() {
    return new GreekTimepickerI18n();
  }
];
GreekTimepickerI18n.ɵprov = {
  token: "GreekTimepickerI18n_f9036dca"
};
TimepickerI18nComponent.ɵfac = [
  "NgbTimepickerI18n_5f47b5e6",
  "$element",
  "$scope",
  function TimepickerI18nComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TimepickerI18nComponent(a0);
    return instance;
  }
];
TimepickerI18nComponent.ɵcmp = {
  selectors: [
    [
      "docs-timepicker-i18n"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/timepicker-i18n.component-d049b429.html",
    "controllerAs": "example"
  }
};
TimepickerI18nComponent.ɵfac.ɵcomponent = true;
TimepickerI18nComponent.ɵfac.ɵtype = TimepickerI18nComponent;
TimepickerI18nComponent.ɵfac.ɵproviders = [
  {
    token: "NgbTimepickerI18n_5f47b5e6",
    kind: "useClass",
    ctor: GreekTimepickerI18n
  }
];

// src/app/features/timepicker/components/timepicker-validation/timepicker-validation.component.ts
var TimepickerValidationComponent = class {
  constructor() {
    this.time = null;
  }
};
var TimepickerLunchValidatorDirective = class {
  validate(control) {
    const time = control.value;
    return !time || time.hour >= 12 && time.hour <= 13 ? null : {
      lunchtime: true
    };
  }
};
(function() {
  var h = "styles/timepicker-validation.component-f4426b85.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TimepickerValidationComponent.ɵfac = [
  "$element",
  "$scope",
  function TimepickerValidationComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TimepickerValidationComponent();
    return instance;
  }
];
TimepickerValidationComponent.ɵcmp = {
  selectors: [
    [
      "docs-timepicker-validation"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/timepicker-validation.component-3a494b57.html",
    "controllerAs": "example"
  }
};
TimepickerValidationComponent.ɵfac.ɵcomponent = true;
TimepickerValidationComponent.ɵfac.ɵtype = TimepickerValidationComponent;
TimepickerLunchValidatorDirective.ɵfac = [
  "$element",
  "$scope",
  function TimepickerLunchValidatorDirective_Factory($element, $scope) {
    var instance = new TimepickerLunchValidatorDirective();
    return instance;
  }
];
TimepickerLunchValidatorDirective.ɵdir = {
  selectors: [
    [
      "",
      "docsTimepickerLunchValidator",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
TimepickerLunchValidatorDirective.ɵfac.ɵtype = TimepickerLunchValidatorDirective;
TimepickerLunchValidatorDirective.ɵfac.ɵproviders = [
  {
    token: "NG_VALIDATORS_d8f0216a",
    kind: "useExisting",
    existing: "TimepickerLunchValidatorDirective_638d7515",
    multi: true
  }
];

// src/app/features/timepicker/timepicker.module.ts
function ɵElementInjectorNode2(providers, parent, $injector, element, boundary) {
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
var ɵNOT_FOUND2 = {};
ɵElementInjectorNode2.prototype.resolve = function(name) {
  if (name === "ɵresolve") return this.resolverFor(this.boundary);
  return this.resolveWith(name, {});
};
ɵElementInjectorNode2.prototype.resolverFor = function(boundary) {
  var self = this;
  return function(token, flags) {
    flags = flags || {};
    return flags.host ? self.resolveHost(token, flags, boundary) : self.resolveWith(token, flags);
  };
};
ɵElementInjectorNode2.prototype.resolveWith = function(name, flags) {
  if (flags.host) return this.resolveHost(name, flags, this.boundary);
  if (!flags.skipSelf) {
    var own = this.resolveOwn(name);
    if (own !== ɵNOT_FOUND2) return own;
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
ɵElementInjectorNode2.prototype.resolveHost = function(name, flags, boundary) {
  var within = function(node2) {
    return !boundary || !node2.element || node2.element === boundary || boundary.contains(node2.element);
  };
  for (var node = flags.skipSelf ? this.parent : this; node && within(node); node = node.parent) {
    var own = node.resolveOwn(name);
    if (own !== ɵNOT_FOUND2) return own;
  }
  if (flags.optional) return null;
  throw new Error('ɵElementInjectorNode: no hay provider para "' + name + '" con { host: true } (entre este elemento y su host).');
};
ɵElementInjectorNode2.prototype.provides = function(name) {
  for (var node = this; node; node = node.parent) {
    if (Object.prototype.hasOwnProperty.call(node.singles, name) || Object.prototype.hasOwnProperty.call(node.multis, name)) return true;
  }
  return false;
};
ɵElementInjectorNode2.prototype.resolveOwn = function(name) {
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
  return ɵNOT_FOUND2;
};
ɵElementInjectorNode2.prototype.instantiate = function(descriptor) {
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
ɵElementInjectorNode2.prototype.destroy = function() {
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
ɵElementInjectorNode2.prototype.isAlias = function(name) {
  var single = this.singles[name];
  return Boolean(single && (single.kind === "useExisting" || single.kind === "useValue"));
};
function ɵscopedController2($delegate, $injector) {
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
      node = new ɵElementInjectorNode2(ownProviders, node, $injector, $element[0], boundary);
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
var TimepickerModule = class {
};
TimepickerModule.ɵfac = [
  function TimepickerModule_Factory() {
    return new TimepickerModule();
  }
];
var ɵTimepickerModule_import0 = RouterModule.forChild(routes);
TimepickerModule.ɵmod = {
  id: "TimepickerModule_bec1d829"
};
ɵimportProviders(import_angular3.default.module("TimepickerModule_bec1d829", [
  typeof NgbTimepickerModule === "string" ? NgbTimepickerModule : NgbTimepickerModule.ɵmod ? NgbTimepickerModule.ɵmod.id : NgbTimepickerModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  ɵimportedModuleName(ɵTimepickerModule_import0)
]), [
  ɵTimepickerModule_import0
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵscopedController2
]).component("docsBasicTimepicker", {
  controller: BasicTimepickerComponent.ɵfac,
  templateUrl: "templates/basic-timepicker.component-9269c0ac.html",
  controllerAs: "example"
}).component("docsMeridianTimepicker", {
  controller: MeridianTimepickerComponent.ɵfac,
  templateUrl: "templates/meridian-timepicker.component-8805d801.html",
  controllerAs: "example"
}).component("docsSecondsTimepicker", {
  controller: SecondsTimepickerComponent.ɵfac,
  templateUrl: "templates/seconds-timepicker.component-eb3b70de.html",
  controllerAs: "example"
}).component("docsSpinnersTimepicker", {
  controller: SpinnersTimepickerComponent.ɵfac,
  templateUrl: "templates/spinners-timepicker.component-7edee0c0.html",
  controllerAs: "example"
}).component("docsTimepickerCustomAdapter", {
  controller: TimepickerCustomAdapterComponent.ɵfac,
  templateUrl: "templates/timepicker-custom-adapter.component-cf5812ee.html",
  controllerAs: "example"
}).component("docsTimepickerCustomSteps", {
  controller: TimepickerCustomStepsComponent.ɵfac,
  templateUrl: "templates/timepicker-custom-steps.component-7927d59a.html",
  controllerAs: "example"
}).component("docsTimepickerI18n", {
  controller: TimepickerI18nComponent.ɵfac,
  templateUrl: "templates/timepicker-i18n.component-d049b429.html",
  controllerAs: "example"
}).component("docsTimepickerValidation", {
  controller: TimepickerValidationComponent.ɵfac,
  templateUrl: "templates/timepicker-validation.component-3a494b57.html",
  controllerAs: "example"
}).directive("docsTimepickerLunchValidator", function() {
  return {
    controller: TimepickerLunchValidatorDirective.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "docsTimepickerLunchValidator"
  };
}).factory("TimepickerModule_51757239", TimepickerModule.ɵfac).run([
  "TimepickerModule_51757239",
  function() {
  }
]);
export {
  TimepickerModule
};
