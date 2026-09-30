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
  ChangeDetectorRef,
  DestroyRef,
  NgZone,
  Subject,
  TemplateRef,
  ViewContainerRef,
  addPopperOffset,
  filter,
  fromEvent,
  inject,
  isInteger,
  isNumber,
  isString,
  merge,
  ngbAutoClose,
  ngbFocusTrap,
  ngbPositioning,
  padNumber,
  take,
  takeUntilDestroyed,
  toInteger
} from "./chunk-26Q6D6UX.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  Injector,
  forwardRef,
  require_angular
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// ../ngb-js/dist/chunk-4XP4RO2H.js
var import_angular = __toESM(require_angular(), 1);
var import_angular2 = __toESM(require_angular(), 1);
function NGB_DATEPICKER_DATE_ADAPTER_FACTORY() {
  return new NgbDateStructAdapter();
}
var NgbDateAdapter = class {
};
var NgbDateStructAdapter = class extends NgbDateAdapter {
  /**
  * Converts a NgbDateStruct value into NgbDateStruct value
  */
  fromModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? {
      year: date.year,
      month: date.month,
      day: date.day
    } : null;
  }
  /**
  * Converts a NgbDateStruct value into NgbDateStruct value
  */
  toModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? {
      year: date.year,
      month: date.month,
      day: date.day
    } : null;
  }
};
NgbDateAdapter.ɵfac = [
  function NgbDateAdapter_Factory() {
    return new NgbDateAdapter();
  }
];
NgbDateAdapter.ɵprov = {
  token: "NgbDateAdapter_53a4f8ce",
  providedIn: "root",
  factory: [
    function() {
      return NGB_DATEPICKER_DATE_ADAPTER_FACTORY();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDateAdapter_53a4f8ce",
  NgbDateAdapter.ɵprov.factory
]);
NgbDateStructAdapter.ɵfac = [
  function NgbDateStructAdapter_Factory() {
    return new NgbDateStructAdapter();
  }
];
NgbDateStructAdapter.ɵprov = {
  token: "NgbDateStructAdapter_db8caed6"
};
var NgbDate = class _NgbDate {
  static from(date) {
    if (date instanceof _NgbDate) {
      return date;
    }
    return date ? new _NgbDate(date.year, date.month, date.day) : null;
  }
  constructor(year, month, day) {
    this.year = isInteger(year) ? year : null;
    this.month = isInteger(month) ? month : null;
    this.day = isInteger(day) ? day : null;
  }
  equals(other) {
    return other != null && this.year === other.year && this.month === other.month && this.day === other.day;
  }
  before(other) {
    if (!other) return false;
    if (this.year === other.year) {
      if (this.month === other.month) {
        return this.day === other.day ? false : this.day < other.day;
      }
      return this.month < other.month;
    }
    return this.year < other.year;
  }
  after(other) {
    if (!other) return false;
    if (this.year === other.year) {
      if (this.month === other.month) {
        return this.day === other.day ? false : this.day > other.day;
      }
      return this.month > other.month;
    }
    return this.year > other.year;
  }
};
function fromJSDate(jsDate) {
  return new NgbDate(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
}
function toJSDate(date) {
  const jsDate = new Date(date.year, date.month - 1, date.day, 12);
  if (!isNaN(jsDate.getTime())) {
    jsDate.setFullYear(date.year);
  }
  return jsDate;
}
function NGB_DATEPICKER_CALENDAR_FACTORY() {
  return new NgbCalendarGregorian();
}
var NgbCalendar = class {
};
var NgbCalendarGregorian = class extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
    ];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    const jsDate = toJSDate(date);
    let checkMonth = true;
    let expectedMonth = jsDate.getMonth();
    switch (period) {
      case "y":
        jsDate.setFullYear(jsDate.getFullYear() + number);
        break;
      case "m":
        expectedMonth += number;
        jsDate.setMonth(expectedMonth);
        expectedMonth = expectedMonth % 12;
        if (expectedMonth < 0) {
          expectedMonth = expectedMonth + 12;
        }
        break;
      case "d":
        jsDate.setDate(jsDate.getDate() + number);
        checkMonth = false;
        break;
      default:
        return date;
    }
    if (checkMonth && jsDate.getMonth() !== expectedMonth) {
      jsDate.setDate(0);
    }
    return fromJSDate(jsDate);
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const jsDate = toJSDate(date);
    const day = jsDate.getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = toJSDate(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    jsDate.setMonth(0);
    jsDate.setDate(1);
    return Math.floor(Math.round((time - jsDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return fromJSDate(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    if (!date || !isInteger(date.year) || !isInteger(date.month) || !isInteger(date.day)) {
      return false;
    }
    if (date.year === 0) {
      return false;
    }
    const jsDate = toJSDate(date);
    return !isNaN(jsDate.getTime()) && jsDate.getFullYear() === date.year && jsDate.getMonth() + 1 === date.month && jsDate.getDate() === date.day;
  }
};
NgbCalendar.ɵfac = [
  function NgbCalendar_Factory() {
    return new NgbCalendar();
  }
];
NgbCalendar.ɵprov = {
  token: "NgbCalendar_5acf56e4",
  providedIn: "root",
  factory: [
    function() {
      return NGB_DATEPICKER_CALENDAR_FACTORY();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbCalendar_5acf56e4",
  NgbCalendar.ɵprov.factory
]);
NgbCalendarGregorian.ɵfac = [
  function NgbCalendarGregorian_Factory() {
    return new NgbCalendarGregorian();
  }
];
NgbCalendarGregorian.ɵprov = {
  token: "NgbCalendarGregorian_13a7e098"
};
var NgbDatepickerI18n = class {
  /**
  * Returns the text label to display above the day view.
  *
  * @since 9.1.0
  */
  getMonthLabel(date) {
    return `${this.getMonthFullName(date.month, date.year)} ${this.getYearNumerals(date.year)}`;
  }
  /**
  * Returns the textual representation of a day that is rendered in a day cell.
  *
  * @since 3.0.0
  */
  getDayNumerals(date) {
    return `${date.day}`;
  }
  /**
  * Returns the textual representation of a week number rendered by datepicker.
  *
  * @since 3.0.0
  */
  getWeekNumerals(weekNumber) {
    return `${weekNumber}`;
  }
  /**
  * Returns the textual representation of a year that is rendered in the datepicker year select box.
  *
  * @since 3.0.0
  */
  getYearNumerals(year) {
    return `${year}`;
  }
  /**
  * Returns the week label to display in the heading of the month view.
  *
  * @since 9.1.0
  */
  getWeekLabel() {
    return "";
  }
};
var NgbDatepickerI18nDefault = class extends NgbDatepickerI18n {
  // upstream: sin constructor (`inject(LOCALE_ID)` en field). Acá se aceptan
  // `$locale` / `$filter` opcionales para el uso `new NgbDatepickerI18nDefault()`
  // fuera de un contexto DI (`NgbDatepickerService`, stubs de test).
  constructor($locale, $filter) {
    super();
    this._locale = $locale ?? (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerI18nDefault"] ? globalThis.ɵngjsInjected["NgbDatepickerI18nDefault"][0] : inject("$locale"));
    this._dateFilter = ($filter ?? (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerI18nDefault"] ? globalThis.ɵngjsInjected["NgbDatepickerI18nDefault"][1] : inject("$filter")))("date");
    this._monthsShort = [
      ...Array(12).keys()
    ].map((month) => Intl.DateTimeFormat(this._locale.id, {
      month: "short",
      timeZone: "UTC"
    }).format(Date.UTC(2e3, month)));
    this._monthsFull = [
      ...Array(12).keys()
    ].map((month) => Intl.DateTimeFormat(this._locale.id, {
      month: "long",
      timeZone: "UTC"
    }).format(Date.UTC(2e3, month)));
  }
  getWeekdayLabel(weekday, width = "narrow") {
    const weekdays = [
      1,
      2,
      3,
      4,
      5,
      6,
      7
    ].map((day) => Intl.DateTimeFormat(this._locale.id, {
      weekday: width,
      timeZone: "UTC"
    }).format(Date.UTC(2e3, 4, day)));
    return weekdays[weekday - 1] || "";
  }
  getMonthShortName(month) {
    return this._monthsShort[month - 1] || "";
  }
  getMonthFullName(month) {
    return this._monthsFull[month - 1] || "";
  }
  getDayAriaLabel(date) {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return this._dateFilter(jsDate, "fullDate");
  }
};
NgbDatepickerI18n.ɵfac = [
  function NgbDatepickerI18n_Factory() {
    return new NgbDatepickerI18n();
  }
];
NgbDatepickerI18n.ɵprov = {
  token: "NgbDatepickerI18n_1bb4881a",
  providedIn: "root",
  factory: [
    function() {
      return (() => new NgbDatepickerI18nDefault())();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDatepickerI18n_1bb4881a",
  NgbDatepickerI18n.ɵprov.factory
]);
NgbDatepickerI18nDefault.ɵfac = [
  "ILocaleService_c15b845b",
  "IFilterService_616666ba",
  "$locale",
  "$filter",
  function NgbDatepickerI18nDefault_Factory(a0, a1, i0, i1) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerI18nDefault": [
        i0,
        i1
      ]
    };
    try {
      var instance = new NgbDatepickerI18nDefault(a0, a1);
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbDatepickerI18nDefault.ɵprov = {
  token: "NgbDatepickerI18nDefault_805ca2af"
};
function isChangedDate(prev, next) {
  return !dateComparator(prev, next);
}
function isChangedMonth(prev, next) {
  return !prev && !next ? false : !prev || !next ? true : prev.year !== next.year || prev.month !== next.month;
}
function dateComparator(prev, next) {
  return !prev && !next || !!prev && !!next && prev.equals(next);
}
function checkMinBeforeMax(minDate, maxDate) {
  if (maxDate && minDate && maxDate.before(minDate)) {
    throw new Error(`'maxDate' ${maxDate} should be greater than 'minDate' ${minDate}`);
  }
}
function checkDateInRange(date, minDate, maxDate) {
  if (date && minDate && date.before(minDate)) {
    return minDate;
  }
  if (date && maxDate && date.after(maxDate)) {
    return maxDate;
  }
  return date || null;
}
function isDateSelectable(date, state) {
  const { minDate, maxDate, disabled, markDisabled } = state;
  return !(date === null || date === void 0 || disabled || markDisabled && markDisabled(date, {
    year: date.year,
    month: date.month
  }) || minDate && date.before(minDate) || maxDate && date.after(maxDate));
}
function generateSelectBoxMonths(calendar, date, minDate, maxDate) {
  if (!date) {
    return [];
  }
  let months = calendar.getMonths(date.year);
  if (minDate && date.year === minDate.year) {
    const index = months.findIndex((month) => month === minDate.month);
    months = months.slice(index);
  }
  if (maxDate && date.year === maxDate.year) {
    const index = months.findIndex((month) => month === maxDate.month);
    months = months.slice(0, index + 1);
  }
  return months;
}
function generateSelectBoxYears(date, minDate, maxDate) {
  if (!date) {
    return [];
  }
  const start = minDate ? Math.max(minDate.year, date.year - 500) : date.year - 10;
  const end = maxDate ? Math.min(maxDate.year, date.year + 500) : date.year + 10;
  const length = end - start + 1;
  const numbers = Array(length);
  for (let i = 0; i < length; i++) {
    numbers[i] = start + i;
  }
  return numbers;
}
function nextMonthDisabled(calendar, date, maxDate) {
  const nextDate = Object.assign(calendar.getNext(date, "m"), {
    day: 1
  });
  return maxDate != null && nextDate.after(maxDate);
}
function prevMonthDisabled(calendar, date, minDate) {
  const prevDate = Object.assign(calendar.getPrev(date, "m"), {
    day: 1
  });
  return minDate != null && (prevDate.year === minDate.year && prevDate.month < minDate.month || prevDate.year < minDate.year && minDate.month === 1);
}
function buildMonths(calendar, date, state, i18n, force) {
  const { displayMonths, months } = state;
  const monthsToReuse = months.splice(0, months.length);
  const firstDates = Array.from({
    length: displayMonths
  }, (_, index) => {
    const firstDate = Object.assign(calendar.getNext(date, "m", index), {
      day: 1
    });
    months[index] = null;
    if (!force) {
      const reusedIndex = monthsToReuse.findIndex((month) => month.firstDate.equals(firstDate));
      if (reusedIndex !== -1) {
        months[index] = monthsToReuse.splice(reusedIndex, 1)[0];
      }
    }
    return firstDate;
  });
  firstDates.forEach((firstDate, index) => {
    if (months[index] == null) {
      months[index] = buildMonth(calendar, firstDate, state, i18n, monthsToReuse.shift() || {});
    }
  });
  return months;
}
function buildMonth(calendar, date, state, i18n, month = {}) {
  const { dayTemplateData, minDate, maxDate, firstDayOfWeek, markDisabled, outsideDays, weekdayWidth, weekdaysVisible } = state;
  const calendarToday = calendar.getToday();
  month.firstDate = null;
  month.lastDate = null;
  month.number = date.month;
  month.year = date.year;
  month.weeks = month.weeks || [];
  month.weekdays = month.weekdays || [];
  date = getFirstViewDate(calendar, date, firstDayOfWeek);
  if (!weekdaysVisible) {
    month.weekdays.length = 0;
  }
  for (let week = 0; week < calendar.getWeeksPerMonth(); week++) {
    let weekObject = month.weeks[week];
    if (!weekObject) {
      weekObject = month.weeks[week] = {
        number: 0,
        days: [],
        collapsed: true
      };
    }
    const days = weekObject.days;
    for (let day = 0; day < calendar.getDaysPerWeek(); day++) {
      if (week === 0 && weekdaysVisible) {
        month.weekdays[day] = i18n.getWeekdayLabel(calendar.getWeekday(date), weekdayWidth);
      }
      const newDate = new NgbDate(date.year, date.month, date.day);
      const nextDate = calendar.getNext(newDate);
      const ariaLabel = i18n.getDayAriaLabel(newDate);
      let disabled = !!(minDate && newDate.before(minDate) || maxDate && newDate.after(maxDate));
      if (!disabled && markDisabled) {
        disabled = markDisabled(newDate, {
          month: month.number,
          year: month.year
        });
      }
      const today = newDate.equals(calendarToday);
      const contextUserData = dayTemplateData ? dayTemplateData(newDate, {
        month: month.number,
        year: month.year
      }) : void 0;
      if (month.firstDate === null && newDate.month === month.number) {
        month.firstDate = newDate;
      }
      if (newDate.month === month.number && nextDate.month !== month.number) {
        month.lastDate = newDate;
      }
      let dayObject = days[day];
      if (!dayObject) {
        dayObject = days[day] = {};
      }
      dayObject.date = newDate;
      dayObject.context = Object.assign(dayObject.context || {}, {
        $implicit: newDate,
        date: newDate,
        data: contextUserData,
        currentMonth: month.number,
        currentYear: month.year,
        disabled,
        focused: false,
        selected: false,
        today
      });
      dayObject.tabindex = -1;
      dayObject.ariaLabel = ariaLabel;
      dayObject.hidden = false;
      date = nextDate;
    }
    weekObject.number = calendar.getWeekNumber(days.map((day) => day.date), firstDayOfWeek);
    weekObject.collapsed = outsideDays === "collapsed" && days[0].date.month !== month.number && days[days.length - 1].date.month !== month.number;
  }
  return month;
}
function getFirstViewDate(calendar, date, firstDayOfWeek) {
  const daysPerWeek = calendar.getDaysPerWeek();
  const firstMonthDate = new NgbDate(date.year, date.month, 1);
  const dayOfWeek = calendar.getWeekday(firstMonthDate) % daysPerWeek;
  return calendar.getPrev(firstMonthDate, "d", (daysPerWeek + dayOfWeek - firstDayOfWeek) % daysPerWeek);
}
var NgbDatepickerService = class {
  get model$() {
    return this._model$.pipe(filter((model) => model.months.length > 0));
  }
  get dateSelect$() {
    return this._dateSelect$.pipe(filter((date) => date !== null));
  }
  set(options) {
    const patch = Object.keys(options).map((key) => this._VALIDATORS[key](options[key]) ?? {}).reduce((obj, part) => ({
      ...obj,
      ...part
    }), {});
    if (Object.keys(patch).length > 0) {
      this._nextState(patch);
    }
  }
  focus(date) {
    const focusedDate = this.toValidDate(date, null);
    if (focusedDate != null && !this._state.disabled && isChangedDate(this._state.focusDate, focusedDate)) {
      this._nextState({
        focusDate: date
      });
    }
  }
  focusSelect() {
    if (isDateSelectable(this._state.focusDate, this._state)) {
      this.select(this._state.focusDate, {
        emitEvent: true
      });
    }
  }
  open(date) {
    const firstDate = this.toValidDate(date, this._calendar.getToday());
    if (firstDate != null && !this._state.disabled && (!this._state.firstDate || isChangedMonth(this._state.firstDate, firstDate))) {
      this._nextState({
        firstDate
      });
    }
  }
  select(date, options = {}) {
    const selectedDate = this.toValidDate(date, null);
    if (selectedDate != null && !this._state.disabled) {
      if (isChangedDate(this._state.selectedDate, selectedDate)) {
        this._nextState({
          selectedDate
        });
      }
      if (options.emitEvent && isDateSelectable(selectedDate, this._state)) {
        this._dateSelect$.next(selectedDate);
      }
    }
  }
  toValidDate(date, defaultValue) {
    const ngbDate = NgbDate.from(date);
    if (defaultValue === void 0) {
      defaultValue = this._calendar.getToday();
    }
    return this._calendar.isValid(ngbDate) ? ngbDate : defaultValue;
  }
  getMonth(struct) {
    for (let month of this._state.months) {
      if (struct.month === month.number && struct.year === month.year) {
        return month;
      }
    }
    throw new Error(`month ${struct.month} of year ${struct.year} not found`);
  }
  _nextState(patch) {
    const newState = this._updateState(patch);
    this._patchContexts(newState);
    this._state = newState;
    this._model$.next(this._state);
  }
  _patchContexts(state) {
    const { months, displayMonths, selectedDate, focusDate, focusVisible, disabled, outsideDays } = state;
    state.months.forEach((month) => {
      month.weeks.forEach((week) => {
        week.days.forEach((day) => {
          if (focusDate) {
            day.context.focused = focusDate.equals(day.date) && focusVisible;
          }
          day.tabindex = !disabled && focusDate && day.date.equals(focusDate) && focusDate.month === month.number ? 0 : -1;
          if (disabled === true) {
            day.context.disabled = true;
          }
          if (selectedDate !== void 0) {
            day.context.selected = selectedDate !== null && selectedDate.equals(day.date);
          }
          if (month.number !== day.date.month) {
            day.hidden = outsideDays === "hidden" || outsideDays === "collapsed" || displayMonths > 1 && day.date.after(months[0].firstDate) && day.date.before(months[displayMonths - 1].lastDate);
          }
        });
      });
    });
  }
  _updateState(patch) {
    const state = Object.assign({}, this._state, patch);
    let startDate = state.firstDate;
    if ("minDate" in patch || "maxDate" in patch) {
      checkMinBeforeMax(state.minDate, state.maxDate);
      state.focusDate = checkDateInRange(state.focusDate, state.minDate, state.maxDate);
      state.firstDate = checkDateInRange(state.firstDate, state.minDate, state.maxDate);
      startDate = state.focusDate;
    }
    if ("disabled" in patch) {
      state.focusVisible = false;
    }
    if ("selectedDate" in patch && this._state.months.length === 0) {
      startDate = state.selectedDate;
    }
    if ("focusVisible" in patch) {
      return state;
    }
    if ("focusDate" in patch) {
      state.focusDate = checkDateInRange(state.focusDate, state.minDate, state.maxDate);
      startDate = state.focusDate;
      if (state.months.length !== 0 && state.focusDate && !state.focusDate.before(state.firstDate) && !state.focusDate.after(state.lastDate)) {
        return state;
      }
    }
    if ("firstDate" in patch) {
      state.firstDate = checkDateInRange(state.firstDate, state.minDate, state.maxDate);
      startDate = state.firstDate;
    }
    if (startDate) {
      const forceRebuild = "dayTemplateData" in patch || "firstDayOfWeek" in patch || "markDisabled" in patch || "minDate" in patch || "maxDate" in patch || "disabled" in patch || "outsideDays" in patch || "weekdaysVisible" in patch;
      const months = buildMonths(this._calendar, startDate, state, this._i18n, forceRebuild);
      state.months = months;
      state.firstDate = months[0].firstDate;
      state.lastDate = months[months.length - 1].lastDate;
      if ("selectedDate" in patch && !isDateSelectable(state.selectedDate, state)) {
        state.selectedDate = null;
      }
      if ("firstDate" in patch) {
        if (!state.focusDate || state.focusDate.before(state.firstDate) || state.focusDate.after(state.lastDate)) {
          state.focusDate = startDate;
        }
      }
      const yearChanged = !this._state.firstDate || this._state.firstDate.year !== state.firstDate.year;
      const monthChanged = !this._state.firstDate || this._state.firstDate.month !== state.firstDate.month;
      if (state.navigation === "select") {
        if ("minDate" in patch || "maxDate" in patch || state.selectBoxes.years.length === 0 || yearChanged) {
          state.selectBoxes.years = generateSelectBoxYears(state.firstDate, state.minDate, state.maxDate);
        }
        if ("minDate" in patch || "maxDate" in patch || state.selectBoxes.months.length === 0 || yearChanged) {
          state.selectBoxes.months = generateSelectBoxMonths(this._calendar, state.firstDate, state.minDate, state.maxDate);
        }
      } else {
        state.selectBoxes = {
          years: [],
          months: []
        };
      }
      if ((state.navigation === "arrows" || state.navigation === "select") && (monthChanged || yearChanged || "minDate" in patch || "maxDate" in patch || "disabled" in patch)) {
        state.prevDisabled = state.disabled || prevMonthDisabled(this._calendar, state.firstDate, state.minDate);
        state.nextDisabled = state.disabled || nextMonthDisabled(this._calendar, state.lastDate, state.maxDate);
      }
    }
    return state;
  }
  constructor() {
    this._VALIDATORS = {
      dayTemplateData: (dayTemplateData) => {
        if (this._state.dayTemplateData !== dayTemplateData) {
          return {
            dayTemplateData
          };
        }
      },
      displayMonths: (displayMonths) => {
        displayMonths = toInteger(displayMonths);
        if (isInteger(displayMonths) && displayMonths > 0 && this._state.displayMonths !== displayMonths) {
          return {
            displayMonths
          };
        }
      },
      disabled: (disabled) => {
        if (this._state.disabled !== disabled) {
          return {
            disabled
          };
        }
      },
      firstDayOfWeek: (firstDayOfWeek) => {
        firstDayOfWeek = toInteger(firstDayOfWeek);
        if (isInteger(firstDayOfWeek) && firstDayOfWeek >= 0 && this._state.firstDayOfWeek !== firstDayOfWeek) {
          return {
            firstDayOfWeek
          };
        }
      },
      focusVisible: (focusVisible) => {
        if (this._state.focusVisible !== focusVisible && !this._state.disabled) {
          return {
            focusVisible
          };
        }
      },
      markDisabled: (markDisabled) => {
        if (this._state.markDisabled !== markDisabled) {
          return {
            markDisabled
          };
        }
      },
      maxDate: (date) => {
        const maxDate = this.toValidDate(date, null);
        if (isChangedDate(this._state.maxDate, maxDate)) {
          return {
            maxDate
          };
        }
      },
      minDate: (date) => {
        const minDate = this.toValidDate(date, null);
        if (isChangedDate(this._state.minDate, minDate)) {
          return {
            minDate
          };
        }
      },
      navigation: (navigation) => {
        if (this._state.navigation !== navigation) {
          return {
            navigation
          };
        }
      },
      outsideDays: (outsideDays) => {
        if (this._state.outsideDays !== outsideDays) {
          return {
            outsideDays
          };
        }
      },
      weekdays: (weekdays) => {
        const weekdayWidth = weekdays === true || weekdays === false ? "narrow" : weekdays;
        const weekdaysVisible = weekdays === true || weekdays === false ? weekdays : true;
        if (this._state.weekdayWidth !== weekdayWidth || this._state.weekdaysVisible !== weekdaysVisible) {
          return {
            weekdayWidth,
            weekdaysVisible
          };
        }
      }
    };
    this._calendar = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerService"] ? globalThis.ɵngjsInjected["NgbDatepickerService"][0] : inject(NgbCalendar);
    this._i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerService"] ? globalThis.ɵngjsInjected["NgbDatepickerService"][1] : inject(NgbDatepickerI18n);
    this._model$ = new Subject();
    this._dateSelect$ = new Subject();
    this._state = {
      dayTemplateData: null,
      markDisabled: null,
      maxDate: null,
      minDate: null,
      disabled: false,
      displayMonths: 1,
      firstDate: null,
      firstDayOfWeek: 1,
      lastDate: null,
      focusDate: null,
      focusVisible: false,
      months: [],
      navigation: "select",
      outsideDays: "visible",
      prevDisabled: false,
      nextDisabled: false,
      selectedDate: null,
      selectBoxes: {
        years: [],
        months: []
      },
      weekdayWidth: "narrow",
      weekdaysVisible: true
    };
  }
};
NgbDatepickerService.ɵfac = [
  "NgbCalendar_5acf56e4",
  "NgbDatepickerI18n_1bb4881a",
  function NgbDatepickerService_Factory(i0, i1) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerService": [
        i0,
        i1
      ]
    };
    try {
      var instance = new NgbDatepickerService();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbDatepickerService.ɵprov = {
  token: "NgbDatepickerService_1521c269"
};
var NgbDatepickerConfig = class {
  constructor() {
    this.displayMonths = 1;
    this.firstDayOfWeek = 1;
    this.navigation = "select";
    this.outsideDays = "visible";
    this.showWeekNumbers = false;
    this.weekdays = "narrow";
  }
};
NgbDatepickerConfig.ɵfac = [
  function NgbDatepickerConfig_Factory() {
    return new NgbDatepickerConfig();
  }
];
NgbDatepickerConfig.ɵprov = {
  token: "NgbDatepickerConfig_32959658",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDatepickerConfig_32959658",
  NgbDatepickerConfig.ɵfac
]);
var NgbDatepickerContent = class {
};
NgbDatepickerContent.ɵfac = [
  "$element",
  "$scope",
  function NgbDatepickerContent_Factory($element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbDatepickerContent: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var instance = new NgbDatepickerContent();
    return instance;
  }
];
NgbDatepickerContent.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbDatepickerContent",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbDatepickerContent.ɵfac.ɵtype = NgbDatepickerContent;
var NavigationEvent = /* @__PURE__ */ (function(NavigationEvent2) {
  NavigationEvent2[NavigationEvent2["PREV"] = 0] = "PREV";
  NavigationEvent2[NavigationEvent2["NEXT"] = 1] = "NEXT";
  return NavigationEvent2;
})({});
var SERVICE_INPUT_NAMES = [
  "dayTemplateData",
  "displayMonths",
  "markDisabled",
  "firstDayOfWeek",
  "navigation",
  "minDate",
  "maxDate",
  "outsideDays",
  "weekdays"
];
var NgbDatepicker = class {
  get _hostDisabled() {
    return !!this.model?.disabled;
  }
  constructor() {
    this._service = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][0] : inject(NgbDatepickerService);
    this._calendar = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][1] : inject(NgbCalendar);
    this._i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][2] : inject(NgbDatepickerI18n);
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][3] : inject(NgbDatepickerConfig);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][4] : inject(ElementRef)).nativeElement;
    this._ngbDateAdapter = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][5] : inject(NgbDateAdapter);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][6] : inject(NgZone);
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][7] : inject(DestroyRef);
    this._controlValue = null;
    this._publicState = {};
    this._initialized = false;
    this.dayTemplate = this._config.dayTemplate;
    this.dayTemplateData = this._config.dayTemplateData;
    this.displayMonths = this._config.displayMonths;
    this.firstDayOfWeek = this._config.firstDayOfWeek;
    this.footerTemplate = this._config.footerTemplate;
    this.markDisabled = this._config.markDisabled;
    this.maxDate = this._config.maxDate;
    this.minDate = this._config.minDate;
    this.navigation = this._config.navigation;
    this.outsideDays = this._config.outsideDays;
    this.showWeekNumbers = this._config.showWeekNumbers;
    this.startDate = this._config.startDate;
    this.weekdays = this._config.weekdays;
    this.navigate = new EventEmitter();
    this.dateSelect = new EventEmitter();
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    const cd = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepicker"] ? globalThis.ɵngjsInjected["NgbDatepicker"][8] : inject(ChangeDetectorRef);
    this._service.dateSelect$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((date) => {
      this.dateSelect.emit(date);
    });
    this._service.model$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((model) => {
      const newDate = model.firstDate;
      const oldDate = this.model ? this.model.firstDate : null;
      this._publicState = {
        maxDate: model.maxDate,
        minDate: model.minDate,
        firstDate: model.firstDate,
        lastDate: model.lastDate,
        focusedDate: model.focusDate,
        months: model.months.map((viewModel) => viewModel.firstDate)
      };
      let navigationPrevented = false;
      if (!newDate.equals(oldDate)) {
        this.navigate.emit({
          current: oldDate ? {
            year: oldDate.year,
            month: oldDate.month
          } : null,
          next: {
            year: newDate.year,
            month: newDate.month
          },
          preventDefault: () => navigationPrevented = true
        });
        if (navigationPrevented && oldDate !== null) {
          this._service.open(oldDate);
          return;
        }
      }
      const newSelectedDate = model.selectedDate;
      const newFocusedDate = model.focusDate;
      const oldFocusedDate = this.model ? this.model.focusDate : null;
      this.model = model;
      if (isChangedDate(newSelectedDate, this._controlValue)) {
        this._controlValue = newSelectedDate;
        this.onTouched();
        this.onChange(this._ngbDateAdapter.toModel(newSelectedDate));
      }
      if (isChangedDate(newFocusedDate, oldFocusedDate) && oldFocusedDate && model.focusVisible) {
        this.focus();
      }
      cd.markForCheck();
    });
  }
  /**
  *  Returns the readonly public state of the datepicker
  *
  * @since 5.2.0
  */
  get state() {
    return this._publicState;
  }
  /**
  *  Returns the calendar service used in the specific datepicker instance.
  *
  *  @since 5.3.0
  */
  get calendar() {
    return this._calendar;
  }
  /**
  * Returns the i18n service used in the specific datepicker instance.
  *
  * @since 14.2.0
  */
  get i18n() {
    return this._i18n;
  }
  /**
  *  Focuses on given date.
  */
  focusDate(date) {
    this._service.focus(NgbDate.from(date));
  }
  /**
  *  Selects focused date.
  */
  focusSelect() {
    this._service.focusSelect();
  }
  focus() {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this._nativeElement.querySelector('div.ngb-dp-day[tabindex="0"]')?.focus();
    });
  }
  /**
  * Navigates to the provided date.
  */
  navigateTo(date) {
    this._service.open(NgbDate.from(date ? date.day ? date : {
      ...date,
      day: 1
    } : null));
  }
  ngAfterContentInit() {
    if (!this.dayTemplate) {
      this.dayTemplate = this._defaultDayTemplate;
    }
  }
  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      const focusIns$ = fromEvent(this._contentEl.nativeElement, "focusin");
      const focusOuts$ = fromEvent(this._contentEl.nativeElement, "focusout");
      merge(focusIns$, focusOuts$).pipe(filter((focusEvent) => {
        const target = focusEvent.target;
        const relatedTarget = focusEvent.relatedTarget;
        return !(target?.classList.contains("ngb-dp-day") && relatedTarget?.classList.contains("ngb-dp-day") && this._nativeElement.contains(target) && this._nativeElement.contains(relatedTarget));
      }), takeUntilDestroyed(this._destroyRef)).subscribe(({ type }) => this._ngZone.run(() => this._service.set({
        focusVisible: type === "focusin"
      })));
    });
  }
  ngOnInit() {
    if (this.model === void 0) {
      const inputs = {};
      SERVICE_INPUT_NAMES.forEach((name) => inputs[name] = this[name]);
      this._service.set(inputs);
      this.navigateTo(this.startDate);
    }
    this._initialized = true;
  }
  ngOnChanges(changes) {
    const inputs = {};
    SERVICE_INPUT_NAMES.filter((name) => name in changes).forEach((name) => inputs[name] = this[name]);
    this._service.set(inputs);
    if ("startDate" in changes && this._initialized) {
      const { currentValue, previousValue } = changes.startDate;
      if (isChangedMonth(previousValue, currentValue)) {
        this.navigateTo(this.startDate);
      }
    }
  }
  onDateSelect(date) {
    this._service.focus(date);
    this._service.select(date, {
      emitEvent: true
    });
  }
  onNavigateDateSelect(date) {
    this._service.open(date);
  }
  onNavigateEvent(event) {
    switch (event) {
      case NavigationEvent.PREV:
        this._service.open(this._calendar.getPrev(this.model.firstDate, "m", 1));
        break;
      case NavigationEvent.NEXT:
        this._service.open(this._calendar.getNext(this.model.firstDate, "m", 1));
        break;
    }
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  setDisabledState(disabled) {
    this._service.set({
      disabled
    });
  }
  writeValue(value) {
    this._controlValue = NgbDate.from(this._ngbDateAdapter.fromModel(value));
    this._service.select(this._controlValue);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-datepicker{border:1px solid var(--bs-border-color);border-radius:0.25rem;display:inline-block}ngb-datepicker-month[_content-d1dce1b8]{pointer-events:auto}ngb-datepicker.dropdown-menu{padding:0}ngb-datepicker.disabled .ngb-dp-month-name[_content-d1dce1b8]{color:var(--bs-text-muted)}ngb-datepicker.ngb-dp-body{z-index:1055}.ngb-dp-header[_content-d1dce1b8]{border-bottom:0;border-radius:0.25rem 0.25rem 0 0;padding-top:0.25rem;background-color:var(--bs-tertiary-bg)}.ngb-dp-months[_content-d1dce1b8]{display:flex}.ngb-dp-month[_content-d1dce1b8]{pointer-events:none}.ngb-dp-month-name[_content-d1dce1b8]{font-size:larger;height:2rem;line-height:2rem;text-align:center;background-color:var(--bs-tertiary-bg)}.ngb-dp-month+.ngb-dp-month .ngb-dp-month-name[_content-d1dce1b8]{padding-left:1rem}";
  document.head.appendChild(s);
})();
NgbDatepicker.ɵfac = [
  "NgbDatepickerService_1521c269",
  "NgbCalendar_5acf56e4",
  "NgbDatepickerI18n_1bb4881a",
  "NgbDatepickerConfig_32959658",
  "ElementRef_927308a2",
  "NgbDateAdapter_53a4f8ce",
  "NgZone_31031859",
  "DestroyRef_a5c7a091",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbDatepicker_Factory(i0, i1, i2, i3, i4, i5, i6, i7, i8, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepicker": [
        i0,
        i1,
        i2,
        i3,
        i4,
        i5,
        i6,
        i7,
        i8
      ]
    };
    try {
      var instance = new NgbDatepicker();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostDisabled;
    }, function(v) {
      v ? $element.addClass("disabled") : $element.removeClass("disabled");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("disabled") : $element.removeClass("disabled");
      })(instance._hostDisabled);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbDatepicker.ɵcmp = {
  selectors: [
    [
      "ngb-datepicker"
    ]
  ],
  inputs: {
    "contentTemplate": "contentTemplate",
    "dayTemplate": "dayTemplate",
    "dayTemplateData": "dayTemplateData",
    "displayMonths": "displayMonths",
    "firstDayOfWeek": "firstDayOfWeek",
    "footerTemplate": "footerTemplate",
    "markDisabled": "markDisabled",
    "maxDate": "maxDate",
    "minDate": "minDate",
    "navigation": "navigation",
    "outsideDays": "outsideDays",
    "showWeekNumbers": "showWeekNumbers",
    "startDate": "startDate",
    "weekdays": "weekdays"
  },
  outputs: {
    "navigate": "navigate",
    "dateSelect": "dateSelect"
  },
  exportAs: [
    "ngbDatepicker"
  ],
  queries: [
    {
      propertyName: "contentTemplateFromContent",
      first: true,
      descendants: true,
      static: true,
      get predicate() {
        return NgbDatepickerContent;
      },
      get read() {
        return TemplateRef;
      }
    }
  ],
  viewQueries: [
    {
      propertyName: "_defaultDayTemplate",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "defaultDayTemplate"
      ]
    },
    {
      propertyName: "_contentEl",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "content"
      ],
      get read() {
        return ElementRef;
      }
    }
  ],
  definition: {
    "template": `<ng-template ng-ref="defaultDayTemplate" let-date="date" let-current-month="currentMonth" let-selected="selected" let-disabled="disabled" let-focused="focused" _content-d1dce1b8="">
  <div ngb-datepicker-day-view="" date="date" current-month="currentMonth" ng-selected="selected" ng-disabled="disabled" focused="focused" _content-d1dce1b8="">
  </div>
</ng-template>

<ng-template ng-ref="defaultContentTemplate" _content-d1dce1b8="">
  <div ng-repeat="month in $.model.months track by $index" class="ngb-dp-month pe-none" ng-class="{ 'ps-3': !$first, 'ps-1': $first, 'pe-1': $last }" _content-d1dce1b8="">
    <div ng-if="$.navigation === 'none' || ($.displayMonths > 1 &amp;&amp; $.navigation === 'select')" class="ngb-dp-month-name fs-5 text-center bg-body-tertiary" ng-class="{ 'text-muted': $.model.disabled }" style="height: 2rem; line-height: 2rem" _content-d1dce1b8="">
      {{ $.i18n.getMonthLabel(month.firstDate) }}
    </div>
    <ngb-datepicker-month class="d-block pe-auto" month="month.firstDate" _content-d1dce1b8=""></ngb-datepicker-month>
  </div>
</ng-template>

<div class="ngb-dp-header pt-1 border-bottom-0 rounded-top bg-body-tertiary" _content-d1dce1b8="">
  <ngb-datepicker-navigation ng-if="$.navigation !== 'none' &amp;&amp; $.model" date="$.model.firstDate" months="$.model.months" ng-disabled="$.model.disabled" show-select="$.model.navigation === 'select'" prev-disabled="$.model.prevDisabled" next-disabled="$.model.nextDisabled" select-boxes="$.model.selectBoxes" navigate="$.onNavigateEvent($event)" select="$.onNavigateDateSelect($event)" class="d-flex align-items-center" _content-d1dce1b8="">
  </ngb-datepicker-navigation>
</div>

<div class="ngb-dp-content" ng-class="{ 'ngb-dp-months': !$.contentTemplate, 'd-flex': !$.contentTemplate }" ng-ref="content" _content-d1dce1b8="">
  <ng-template ng-if="$.model" ng-template-outlet="$.contentTemplate || $.contentTemplateFromContent || defaultContentTemplate" ng-template-outlet-context="{ $implicit: $ }" _content-d1dce1b8="">
  </ng-template>
</div>

<ng-template ng-if="$.footerTemplate" ng-template-outlet="$.footerTemplate" _content-d1dce1b8=""></ng-template>
<ng-content _content-d1dce1b8=""></ng-content>`,
    "controllerAs": "$",
    "bindings": {
      "contentTemplate": "<?",
      "dayTemplate": "<?",
      "dayTemplateData": "<?",
      "displayMonths": "<?",
      "firstDayOfWeek": "<?",
      "footerTemplate": "<?",
      "markDisabled": "<?",
      "maxDate": "<?",
      "minDate": "<?",
      "navigation": "<?",
      "outsideDays": "<?",
      "showWeekNumbers": "<?",
      "startDate": "<?",
      "weekdays": "<?",
      "navigate": "&?",
      "dateSelect": "&?"
    },
    "transclude": true
  }
};
NgbDatepicker.ɵfac.ɵcomponent = true;
NgbDatepicker.ɵfac.ɵtype = NgbDatepicker;
NgbDatepicker.ɵfac.ɵproviders = [
  {
    token: "NG_VALUE_ACCESSOR_de942eb5",
    kind: "useExisting",
    existing: "NgbDatepicker_ceb8ee34",
    multi: true
  },
  {
    token: "NgbDatepickerService_1521c269",
    kind: "class",
    ctor: NgbDatepickerService
  }
];
NgbDatepicker.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbDatepicker.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["contentTemplate"];
    if (!c) return;
    changes["contentTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["dayTemplate"];
    if (!c) return;
    changes["dayTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["dayTemplateData"];
    if (!c) return;
    changes["dayTemplateData"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["displayMonths"];
    if (!c) return;
    changes["displayMonths"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["firstDayOfWeek"];
    if (!c) return;
    changes["firstDayOfWeek"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["footerTemplate"];
    if (!c) return;
    changes["footerTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["markDisabled"];
    if (!c) return;
    changes["markDisabled"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["maxDate"];
    if (!c) return;
    changes["maxDate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["minDate"];
    if (!c) return;
    changes["minDate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["navigation"];
    if (!c) return;
    changes["navigation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["outsideDays"];
    if (!c) return;
    changes["outsideDays"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["showWeekNumbers"];
    if (!c) return;
    changes["showWeekNumbers"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["startDate"];
    if (!c) return;
    changes["startDate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["weekdays"];
    if (!c) return;
    changes["weekdays"] = {
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
NgbDatepicker.prototype.$postLink = function() {
  this.ngAfterContentInit();
  this.ngAfterViewInit();
};
var NgbDatepickerDayView = class {
  get _bgPrimary() {
    return this.selected;
  }
  get _textWhite() {
    return this.selected;
  }
  get _textMuted() {
    return this.isMuted();
  }
  get _outside() {
    return this.isMuted();
  }
  get _active() {
    return this.focused;
  }
  isMuted() {
    return !this.selected && (this.date.month !== this.currentMonth || this.disabled);
  }
  constructor() {
    this.i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerDayView"] ? globalThis.ɵngjsInjected["NgbDatepickerDayView"][0] : inject(NgbDatepickerI18n);
    this._btnLight = true;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "[ngb-datepicker-day-view]{text-align:center;width:2rem;height:2rem;line-height:2rem;border-radius:0.25rem;background:transparent}[ngb-datepicker-day-view]:hover:not(.bg-primary),[ngb-datepicker-day-view].active:not(.bg-primary){background-color:var(--bs-tertiary-bg);outline:1px solid var(--bs-border-color)}[ngb-datepicker-day-view].outside{opacity:0.5}";
  document.head.appendChild(s);
})();
NgbDatepickerDayView.ɵfac = [
  "NgbDatepickerI18n_1bb4881a",
  "$element",
  "$scope",
  function NgbDatepickerDayView_Factory(i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerDayView": [
        i0
      ]
    };
    try {
      var instance = new NgbDatepickerDayView();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._btnLight;
    }, function(v) {
      v ? $element.addClass("btn-light") : $element.removeClass("btn-light");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._bgPrimary;
    }, function(v) {
      v ? $element.addClass("bg-primary") : $element.removeClass("bg-primary");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._textWhite;
    }, function(v) {
      v ? $element.addClass("text-white") : $element.removeClass("text-white");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._textMuted;
    }, function(v) {
      v ? $element.addClass("text-muted") : $element.removeClass("text-muted");
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._outside;
    }, function(v) {
      v ? $element.addClass("outside") : $element.removeClass("outside");
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._active;
    }, function(v) {
      v ? $element.addClass("active") : $element.removeClass("active");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("btn-light") : $element.removeClass("btn-light");
      })(instance._btnLight);
      (function(v) {
        v ? $element.addClass("bg-primary") : $element.removeClass("bg-primary");
      })(instance._bgPrimary);
      (function(v) {
        v ? $element.addClass("text-white") : $element.removeClass("text-white");
      })(instance._textWhite);
      (function(v) {
        v ? $element.addClass("text-muted") : $element.removeClass("text-muted");
      })(instance._textMuted);
      (function(v) {
        v ? $element.addClass("outside") : $element.removeClass("outside");
      })(instance._outside);
      (function(v) {
        v ? $element.addClass("active") : $element.removeClass("active");
      })(instance._active);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
    });
    return instance;
  }
];
NgbDatepickerDayView.ɵcmp = {
  selectors: [
    [
      "",
      "ngbDatepickerDayView",
      ""
    ]
  ],
  inputs: {
    "currentMonth": "currentMonth",
    "date": "date",
    "disabled": "disabled",
    "focused": "focused",
    "selected": "selected"
  },
  outputs: {},
  definition: {
    "template": "{{ $.i18n.getDayNumerals($.date) }}",
    "controllerAs": "$",
    "bindings": {
      "currentMonth": "<?",
      "date": "<?",
      "disabled": "<?ngDisabled",
      "focused": "<?",
      "selected": "<?ngSelected"
    }
  }
};
NgbDatepickerDayView.ɵfac.ɵcomponent = true;
NgbDatepickerDayView.ɵfac.ɵtype = NgbDatepickerDayView;
var NgbDatepickerKeyboardService = class {
  /**
  * Processes a keyboard event.
  */
  processKey(event, datepicker) {
    const { state, calendar } = datepicker;
    switch (event.key) {
      case "PageUp":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case "PageDown":
        datepicker.focusDate(calendar.getNext(state.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case "End":
        datepicker.focusDate(event.shiftKey ? state.maxDate : state.lastDate);
        break;
      case "Home":
        datepicker.focusDate(event.shiftKey ? state.minDate : state.firstDate);
        break;
      case "ArrowLeft":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, "d", 1));
        break;
      case "ArrowUp":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case "ArrowRight":
        datepicker.focusDate(calendar.getNext(state.focusedDate, "d", 1));
        break;
      case "ArrowDown":
        datepicker.focusDate(calendar.getNext(state.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case "Enter":
      case " ":
        datepicker.focusSelect();
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }
};
NgbDatepickerKeyboardService.ɵfac = [
  function NgbDatepickerKeyboardService_Factory() {
    return new NgbDatepickerKeyboardService();
  }
];
NgbDatepickerKeyboardService.ɵprov = {
  token: "NgbDatepickerKeyboardService_3b3c9f77",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDatepickerKeyboardService_3b3c9f77",
  NgbDatepickerKeyboardService.ɵfac
]);
var NgbDatepickerMonth = class {
  /**
  * The first date of month to be rendered.
  *
  * This month must one of the months present in the
  * [datepicker state](#/components/datepicker/api#NgbDatepickerState).
  */
  set month(month) {
    this.viewModel = this._service.getMonth(month);
  }
  onKeyDown(event) {
    this._keyboardService.processKey(event, this.datepicker);
  }
  doSelect(day) {
    if (!day.context.disabled && !day.hidden) {
      this.datepicker.onDateSelect(day.date);
    }
  }
  constructor() {
    this._keyboardService = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerMonth"] ? globalThis.ɵngjsInjected["NgbDatepickerMonth"][0] : inject(NgbDatepickerKeyboardService);
    this._service = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerMonth"] ? globalThis.ɵngjsInjected["NgbDatepickerMonth"][1] : inject(NgbDatepickerService);
    this.i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerMonth"] ? globalThis.ɵngjsInjected["NgbDatepickerMonth"][2] : inject(NgbDatepickerI18n);
    this.datepicker = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerMonth"] ? globalThis.ɵngjsInjected["NgbDatepickerMonth"][3] : inject(forwardRef(() => NgbDatepicker));
    this.role = "grid";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = 'ngb-datepicker-month{display:block}.ngb-dp-weekday[_content-cce99068],.ngb-dp-week-number[_content-cce99068]{line-height:2rem;text-align:center;font-style:italic}.ngb-dp-weekday[_content-cce99068]{color:var(--bs-info)}.ngb-dp-week[_content-cce99068]{border-radius:0.25rem;display:flex}.ngb-dp-weekdays[_content-cce99068]{border-bottom:1px solid var(--bs-border-color);border-radius:0;background-color:var(--bs-tertiary-bg)}.ngb-dp-day[_content-cce99068],.ngb-dp-weekday[_content-cce99068],.ngb-dp-week-number[_content-cce99068]{width:2rem;height:2rem}.ngb-dp-day[_content-cce99068]{cursor:pointer}.ngb-dp-day.disabled[_content-cce99068],.ngb-dp-day.hidden[_content-cce99068]{cursor:default;pointer-events:none}.ngb-dp-day[tabindex="0"][_content-cce99068]{z-index:1}ngb-datepicker.disabled ngb-datepicker-month .ngb-dp-weekday[_content-cce99068],ngb-datepicker-month ngb-datepicker.disabled .ngb-dp-weekday[_content-cce99068],ngb-datepicker.disabled ngb-datepicker-month .ngb-dp-week-number[_content-cce99068],ngb-datepicker-month ngb-datepicker.disabled .ngb-dp-week-number[_content-cce99068]{color:var(--bs-text-muted)}.ngb-dp-month+.ngb-dp-month ngb-datepicker-month .ngb-dp-week[_content-cce99068],ngb-datepicker-month.ngb-dp-month+.ngb-dp-month .ngb-dp-week[_content-cce99068]{padding-left:1rem}.ngb-dp-month:last-child ngb-datepicker-month .ngb-dp-week[_content-cce99068],ngb-datepicker-month.ngb-dp-month:last-child .ngb-dp-week[_content-cce99068]{padding-right:0.25rem}.ngb-dp-month:first-child ngb-datepicker-month .ngb-dp-week[_content-cce99068],ngb-datepicker-month.ngb-dp-month:first-child .ngb-dp-week[_content-cce99068]{padding-left:0.25rem}.ngb-dp-month ngb-datepicker-month .ngb-dp-week:last-child[_content-cce99068],ngb-datepicker-month.ngb-dp-month .ngb-dp-week:last-child[_content-cce99068]{padding-bottom:0.25rem}';
  document.head.appendChild(s);
})();
NgbDatepickerMonth.ɵfac = [
  "NgbDatepickerKeyboardService_3b3c9f77",
  "NgbDatepickerService_1521c269",
  "NgbDatepickerI18n_1bb4881a",
  "$element",
  "$scope",
  function NgbDatepickerMonth_Factory(i0, i1, i2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerMonth": [
        i0,
        i1,
        i2,
        ɵelementInstance($element, [
          "ngbDatepicker"
        ], {}, true)
      ]
    };
    try {
      var instance = new NgbDatepickerMonth();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance.role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance.role);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance.onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler0);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      $element.off("keydown", ɵhandler0);
    });
    return instance;
  }
];
NgbDatepickerMonth.ɵcmp = {
  selectors: [
    [
      "ngb-datepicker-month"
    ]
  ],
  inputs: {
    "month": "month"
  },
  outputs: {},
  definition: {
    "template": `<div ng-if="$.viewModel.weekdays.length" class="ngb-dp-week ngb-dp-weekdays d-flex rounded-0 border-bottom bg-body-tertiary" role="row" _content-cce99068="">
  <div ng-if="$.datepicker.showWeekNumbers" class="ngb-dp-weekday ngb-dp-showweek small fst-italic text-center" ng-class="{ 'text-muted': $.datepicker.model.disabled }" style="width: 2rem; height: 2rem; line-height: 2rem" _content-cce99068="">
    {{ $.datepicker.i18n.getWeekLabel() }}
  </div>
  <div ng-repeat="weekday in $.viewModel.weekdays track by $index" class="ngb-dp-weekday small fst-italic text-center text-info" ng-class="{ 'text-muted': $.datepicker.model.disabled }" style="width: 2rem; height: 2rem; line-height: 2rem" role="columnheader" _content-cce99068="">
    {{ weekday }}
  </div>
</div>

<div ng-repeat="week in $.viewModel.weeks track by $index" ng-if="!week.collapsed" class="ngb-dp-week d-flex rounded-1" ng-class="{ 'pb-1': $last }" role="row" _content-cce99068="">
  <div ng-if="$.datepicker.showWeekNumbers" class="ngb-dp-week-number small text-muted fst-italic text-center" style="width: 2rem; height: 2rem; line-height: 2rem" _content-cce99068="">
    {{ $.datepicker.i18n.getWeekNumerals(week.number) }}
  </div>
  <div ng-repeat="day in week.days track by day.date.year + '-' + day.date.month + '-' + day.date.day" ng-click="$.doSelect(day); $event.preventDefault()" class="ngb-dp-day" style="width: 2rem; height: 2rem; cursor: pointer" ng-style="{ cursor: day.context.disabled || day.hidden ? 'default' : 'pointer' }" ng-class="{ disabled: day.context.disabled, hidden: day.hidden, invisible: day.hidden, 'pe-none': day.context.disabled || day.hidden, 'z-1': day.tabindex === 0, 'ngb-dp-today': day.context.today }" role="gridcell" ng-attr-tabindex="{{ day.tabindex }}" ng-attr-aria-label="{{ day.ariaLabel }}" ng-attr-aria-disabled="{{ day.context.disabled }}" ng-attr-aria-selected="{{ day.context.selected }}" _content-cce99068="">
    <ng-template ng-if="!day.hidden" ng-template-outlet="$.datepicker.dayTemplate" ng-template-outlet-context="day.context" _content-cce99068="">
    </ng-template>
  </div>
</div>`,
    "controllerAs": "$",
    "bindings": {
      "month": "<?"
    }
  }
};
NgbDatepickerMonth.ɵfac.ɵcomponent = true;
NgbDatepickerMonth.ɵfac.ɵtype = NgbDatepickerMonth;
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
var NgbDatepickerNavigation = class {
  onClickPrev(event) {
    event.currentTarget.focus();
    this.navigate.emit(this.navigation.PREV);
  }
  onClickNext(event) {
    event.currentTarget.focus();
    this.navigate.emit(this.navigation.NEXT);
  }
  idMonth(month) {
    return month;
  }
  constructor() {
    this.navigation = NavigationEvent;
    this.i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerNavigation"] ? globalThis.ɵngjsInjected["NgbDatepickerNavigation"][0] : inject(NgbDatepickerI18n);
    this.months = [];
    this.navigate = new EventEmitter();
    this.select = new EventEmitter();
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-datepicker-navigation{display:flex;align-items:center}.ngb-dp-navigation-chevron[_content-7f65cbcb]{border-style:solid;border-width:0.2em 0.2em 0 0;display:inline-block;width:0.75em;height:0.75em;margin-left:0.25em;margin-right:0.15em;transform:rotate(-135deg)}.ngb-dp-arrow[_content-7f65cbcb]{display:flex;flex:1 1 auto;padding-right:0;padding-left:0;margin:0;width:2rem;height:2rem}.ngb-dp-arrow-next[_content-7f65cbcb]{justify-content:flex-end}.ngb-dp-arrow-next .ngb-dp-navigation-chevron[_content-7f65cbcb]{transform:rotate(45deg);margin-left:0.15em;margin-right:0.25em}.ngb-dp-arrow-btn[_content-7f65cbcb]{padding:0 0.25rem;margin:0 0.5rem;border:none;background-color:transparent;z-index:1}.ngb-dp-arrow-btn:focus[_content-7f65cbcb]{outline-width:1px;outline-style:auto}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.ngb-dp-arrow-btn:focus[_content-7f65cbcb]{outline-style:solid}}.ngb-dp-month-name[_content-7f65cbcb]{font-size:larger;height:2rem;line-height:2rem;text-align:center}.ngb-dp-navigation-select[_content-7f65cbcb]{display:flex;flex:1 1 9rem}";
  document.head.appendChild(s);
})();
NgbDatepickerNavigation.ɵfac = [
  "NgbDatepickerI18n_1bb4881a",
  "$element",
  "$scope",
  function NgbDatepickerNavigation_Factory(i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerNavigation": [
        i0
      ]
    };
    try {
      var instance = new NgbDatepickerNavigation();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbDatepickerNavigation.ɵcmp = {
  selectors: [
    [
      "ngb-datepicker-navigation"
    ]
  ],
  inputs: {
    "date": "date",
    "disabled": "disabled",
    "months": "months",
    "showSelect": "showSelect",
    "prevDisabled": "prevDisabled",
    "nextDisabled": "nextDisabled",
    "selectBoxes": "selectBoxes"
  },
  outputs: {
    "navigate": "navigate",
    "select": "select"
  },
  definition: {
    "template": `<div class="ngb-dp-arrow ngb-dp-arrow-prev d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
  <button type="button" class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0" ng-click="$.onClickPrev($event)" ng-disabled="$.prevDisabled" i18n-aria-label="@@ngb.datepicker.previous-month" aria-label="Previous month" i18n-title="@@ngb.datepicker.previous-month" title="Previous month" _content-7f65cbcb="">
    <span class="ngb-dp-navigation-chevron d-inline-block" style="width: .75em; height: .75em; margin-right: .15em; margin-left: .25em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(-135deg)" _content-7f65cbcb="">
    </span>
  </button>
</div>

<ngb-datepicker-navigation-select ng-if="$.showSelect" class="ngb-dp-navigation-select d-flex flex-grow-1" style="flex-basis: 9rem" date="$.date" ng-disabled="$.disabled" months="$.selectBoxes.months" years="$.selectBoxes.years" select="$.select.emit($event)" _content-7f65cbcb="">
</ngb-datepicker-navigation-select>

<ng-container ng-if="!$.showSelect" _content-7f65cbcb="">
  <ng-container ng-repeat="month in $.months track by $index" _content-7f65cbcb="">
    <div ng-if="$index > 0" class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb=""></div>
    <div class="ngb-dp-month-name fs-5 text-center" ng-class="{ 'text-muted': $.disabled }" style="height: 2rem; line-height: 2rem" _content-7f65cbcb="">
      {{ $.i18n.getMonthLabel(month.firstDate) }}
    </div>
    <div ng-if="$index !== $.months.length - 1" class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
    </div>
  </ng-container>
</ng-container>

<div class="visually-hidden" aria-live="polite" _content-7f65cbcb="">
  <span ng-repeat="month in $.months track by $index" _content-7f65cbcb="">{{ $.i18n.getMonthLabel(month.firstDate) }}</span>
</div>

<div class="ngb-dp-arrow ngb-dp-arrow-next d-flex flex-grow-1 justify-content-end p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
  <button type="button" class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0" ng-click="$.onClickNext($event)" ng-disabled="$.nextDisabled" i18n-aria-label="@@ngb.datepicker.next-month" aria-label="Next month" i18n-title="@@ngb.datepicker.next-month" title="Next month" _content-7f65cbcb="">
    <span class="ngb-dp-navigation-chevron d-inline-block" style="width: .75em; height: .75em; margin-right: .25em; margin-left: .15em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(45deg)" _content-7f65cbcb="">
    </span>
  </button>
</div>`,
    "controllerAs": "$",
    "bindings": {
      "date": "<?",
      "disabled": "<?ngDisabled",
      "months": "<?",
      "showSelect": "<?",
      "prevDisabled": "<?",
      "nextDisabled": "<?",
      "selectBoxes": "<?",
      "navigate": "&?",
      "select": "&?"
    }
  }
};
NgbDatepickerNavigation.ɵfac.ɵcomponent = true;
NgbDatepickerNavigation.ɵfac.ɵtype = NgbDatepickerNavigation;
var NgbDatepickerNavigationSelect = class {
  ngOnInit() {
    this._syncSelection();
  }
  ngOnChanges() {
    this._syncSelection();
  }
  changeMonth(month) {
    this.select.emit(new NgbDate(this.date.year, toInteger(month), 1));
  }
  changeYear(year) {
    this.select.emit(new NgbDate(toInteger(year), this.date.month, 1));
  }
  _syncSelection() {
    if (!this.date) return;
    this.selectedMonth = this.date.month;
    this.selectedYear = this.date.year;
  }
  constructor() {
    this.i18n = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDatepickerNavigationSelect"] ? globalThis.ɵngjsInjected["NgbDatepickerNavigationSelect"][0] : inject(NgbDatepickerI18n);
    this.months = [];
    this.years = [];
    this.select = new EventEmitter();
    this.selectedMonth = 0;
    this.selectedYear = 0;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-datepicker-navigation-select>.form-select[_content-fbcd1297]{flex:1 1 auto;padding:0 0.5rem;font-size:0.875rem;height:1.85rem}ngb-datepicker-navigation-select>.form-select:focus[_content-fbcd1297]{z-index:1}ngb-datepicker-navigation-select>.form-select[_content-fbcd1297]::-ms-value{background-color:transparent!important}";
  document.head.appendChild(s);
})();
NgbDatepickerNavigationSelect.ɵfac = [
  "NgbDatepickerI18n_1bb4881a",
  "$element",
  "$scope",
  function NgbDatepickerNavigationSelect_Factory(i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbDatepickerNavigationSelect": [
        i0
      ]
    };
    try {
      var instance = new NgbDatepickerNavigationSelect();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbDatepickerNavigationSelect.ɵcmp = {
  selectors: [
    [
      "ngb-datepicker-navigation-select"
    ]
  ],
  inputs: {
    "date": "date",
    "disabled": "disabled",
    "months": "months",
    "years": "years"
  },
  outputs: {
    "select": "select"
  },
  definition: {
    "template": '<select ng-disabled="$.disabled" ng-model="$.selectedMonth" ng-change="$.changeMonth($.selectedMonth)" class="form-select flex-grow-1 py-0 px-2 small" style="height: 1.85rem" i18n-aria-label="@@ngb.datepicker.select-month" aria-label="Select month" i18n-title="@@ngb.datepicker.select-month" title="Select month" _content-fbcd1297="">\n  <option ng-repeat="month in $.months track by month" ng-value="month" ng-attr-aria-label="{{ $.i18n.getMonthFullName(month, $.date.year) }}" _content-fbcd1297="">\n    {{ $.i18n.getMonthShortName(month, $.date.year) }}\n  </option>\n</select>\n<select ng-disabled="$.disabled" ng-model="$.selectedYear" ng-change="$.changeYear($.selectedYear)" class="form-select flex-grow-1 py-0 px-2 small" style="height: 1.85rem" i18n-aria-label="@@ngb.datepicker.select-year" aria-label="Select year" i18n-title="@@ngb.datepicker.select-year" title="Select year" _content-fbcd1297="">\n  <option ng-repeat="year in $.years track by year" ng-value="year" _content-fbcd1297="">\n    {{ $.i18n.getYearNumerals(year) }}\n  </option>\n</select>',
    "controllerAs": "$",
    "bindings": {
      "date": "<?",
      "disabled": "<?ngDisabled",
      "months": "<?",
      "years": "<?",
      "select": "&?"
    }
  }
};
NgbDatepickerNavigationSelect.ɵfac.ɵcomponent = true;
NgbDatepickerNavigationSelect.ɵfac.ɵtype = NgbDatepickerNavigationSelect;
NgbDatepickerNavigationSelect.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbDatepickerNavigationSelect.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["date"];
    if (!c) return;
    changes["date"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
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
    var c = changesObj["months"];
    if (!c) return;
    changes["months"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["years"];
    if (!c) return;
    changes["years"] = {
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
function NGB_DATEPICKER_PARSER_FORMATTER_FACTORY() {
  return new NgbDateISOParserFormatter();
}
var NgbDateParserFormatter = class {
};
var NgbDateISOParserFormatter = class extends NgbDateParserFormatter {
  parse(value) {
    if (value != null) {
      const dateParts = value.trim().split("-");
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return {
          year: toInteger(dateParts[0]),
          month: null,
          day: null
        };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return {
          year: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          day: null
        };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return {
          year: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          day: toInteger(dateParts[2])
        };
      }
    }
    return null;
  }
  format(date) {
    return date ? `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${isNumber(date.day) ? padNumber(date.day) : ""}` : "";
  }
};
NgbDateParserFormatter.ɵfac = [
  function NgbDateParserFormatter_Factory() {
    return new NgbDateParserFormatter();
  }
];
NgbDateParserFormatter.ɵprov = {
  token: "NgbDateParserFormatter_2a13db01",
  providedIn: "root",
  factory: [
    function() {
      return NGB_DATEPICKER_PARSER_FORMATTER_FACTORY();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDateParserFormatter_2a13db01",
  NgbDateParserFormatter.ɵprov.factory
]);
NgbDateISOParserFormatter.ɵfac = [
  function NgbDateISOParserFormatter_Factory() {
    return new NgbDateISOParserFormatter();
  }
];
NgbDateISOParserFormatter.ɵprov = {
  token: "NgbDateISOParserFormatter_b76b9ec1"
};
var NgbInputDatepickerConfig = class extends NgbDatepickerConfig {
  constructor(...args) {
    super(...args), this.autoClose = true, this.container = null, this.placement = [
      "bottom-start",
      "bottom-end",
      "top-start",
      "top-end"
    ], this.popperOptions = (options) => options, this.restoreFocus = true;
  }
};
NgbInputDatepickerConfig.ɵfac = [
  function NgbInputDatepickerConfig_Factory() {
    return new NgbInputDatepickerConfig();
  }
];
NgbInputDatepickerConfig.ɵprov = {
  token: "NgbInputDatepickerConfig_4a9881f2",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbInputDatepickerConfig_4a9881f2",
  NgbInputDatepickerConfig.ɵfac
]);
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
var NgbInputDatepicker = class {
  get _hostDisabled() {
    return this._disabled;
  }
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value === "" || value && value !== "false";
    if (this.isOpen()) {
      this._cRef.instance.setDisabledState(this._disabled);
    }
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  registerOnValidatorChange(fn) {
    this._validatorChange = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  validate(c) {
    const { value } = c;
    if (value != null) {
      const ngbDate = this._fromDateStruct(this._dateAdapter.fromModel(value));
      if (!ngbDate) {
        return {
          ngbDate: {
            invalid: value
          }
        };
      }
      if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
        return {
          ngbDate: {
            minDate: {
              minDate: this.minDate,
              actual: value
            }
          }
        };
      }
      if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
        return {
          ngbDate: {
            maxDate: {
              maxDate: this.maxDate,
              actual: value
            }
          }
        };
      }
    }
    return null;
  }
  writeValue(value) {
    this._model = this._fromDateStruct(this._dateAdapter.fromModel(value));
    this._writeModelValue(this._model);
  }
  // upstream: `host: { '(input)': 'manualDateChange($any($event).target.value)',
  //   '(change)': 'manualDateChange($any($event).target.value, true)' }`.
  // ngjs-core `@HostListener` no evalúa expresiones de argumento (siempre pasa el
  // `event`), así que se extrae el value acá. Ver CORE_GAPS.
  _handleInput(event) {
    this.manualDateChange(event.target.value);
  }
  _handleChange(event) {
    this.manualDateChange(event.target.value, true);
  }
  manualDateChange(value, updateView = false) {
    const inputValueChanged = value !== this._inputValue;
    if (inputValueChanged) {
      this._inputValue = value;
      this._model = this._fromDateStruct(this._parserFormatter.parse(value));
    }
    if (inputValueChanged || !updateView) {
      this._onChange(this._model ? this._dateAdapter.toModel(this._model) : value === "" ? null : value);
    }
    if (updateView && this._model) {
      this._writeModelValue(this._model);
    }
  }
  isOpen() {
    return !!this._cRef;
  }
  /**
  * Opens the datepicker popup.
  *
  * ngjs-core: `createComponent` es async → método `async`.
  */
  open() {
    return _async_to_generator(function* () {
      if (!this.isOpen()) {
        this._cRef = yield this._vcRef.createComponent(NgbDatepicker, {
          injector: this._injector
        });
        this._applyPopupStyling(this._cRef.location.nativeElement);
        this._applyDatepickerInputs(this._cRef);
        this._subscribeForDatepickerOutputs(this._cRef.instance);
        this._cRef.instance.ngOnInit();
        this._cRef.instance.writeValue(this._dateAdapter.toModel(this._model));
        this._cRef.instance.registerOnChange((selectedDate) => {
          this.writeValue(selectedDate);
          this._onChange(selectedDate);
          this._onTouched();
        });
        this._cRef.changeDetectorRef.detectChanges();
        this._cRef.instance.setDisabledState(this.disabled);
        if (this.container === "body") {
          this._document.querySelector(this.container)?.appendChild(this._cRef.location.nativeElement);
        }
        this._elWithFocus = this._document.activeElement;
        ngbFocusTrap(this._ngZone, this._cRef.location.nativeElement, this.closed, true);
        setTimeout(() => this._cRef?.instance.focus());
        let hostElement;
        if (isString(this.positionTarget)) {
          hostElement = this._document.querySelector(this.positionTarget);
        } else if (this.positionTarget instanceof HTMLElement) {
          hostElement = this.positionTarget;
        } else {
          hostElement = this._elRef.nativeElement;
        }
        if (this.positionTarget && !hostElement) {
          throw new Error("ngbDatepicker could not find element declared in [positionTarget] to position against.");
        }
        this._ngZone.runOutsideAngular(() => {
          if (this._cRef && hostElement) {
            this._positioning.createPopper({
              hostElement,
              targetElement: this._cRef.location.nativeElement,
              placement: this.placement,
              appendToBody: this.container === "body",
              updatePopperOptions: (options) => this.popperOptions(addPopperOffset([
                0,
                2
              ])(options))
            });
            Promise.resolve().then(() => {
              this._positioning.update();
              this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
            });
          }
        });
        this._setCloseHandlers();
      }
    }).call(this);
  }
  /**
  * Closes the datepicker popup.
  */
  close() {
    if (this.isOpen()) {
      this._cRef?.destroy();
      this._cRef = null;
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._destroyCloseHandlers$.next();
      this.closed.emit();
      this._changeDetector.markForCheck();
      let elementToFocus = this._elWithFocus;
      if (isString(this.restoreFocus)) {
        elementToFocus = this._document.querySelector(this.restoreFocus);
      } else if (this.restoreFocus !== void 0) {
        elementToFocus = this.restoreFocus;
      }
      if (elementToFocus && elementToFocus["focus"]) {
        elementToFocus.focus();
      } else {
        this._document.body.focus();
      }
    }
  }
  /**
  * Toggles the datepicker popup.
  */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
  * Navigates to the provided date.
  */
  navigateTo(date) {
    if (this.isOpen()) {
      this._cRef.instance.navigateTo(date);
    }
  }
  onBlur() {
    this._onTouched();
  }
  onFocus() {
    this._elWithFocus = this._elRef.nativeElement;
  }
  ngOnChanges(changes) {
    if (changes["minDate"] || changes["maxDate"]) {
      this._validatorChange();
      if (this.isOpen()) {
        if (changes["minDate"]) {
          this._cRef.setInput("minDate", this.minDate);
        }
        if (changes["maxDate"]) {
          this._cRef.setInput("maxDate", this.maxDate);
        }
      }
    }
    if (changes["datepickerClass"]) {
      const { currentValue, previousValue } = changes["datepickerClass"];
      this._applyPopupClass(currentValue, previousValue);
    }
    if (changes["autoClose"] && this.isOpen()) {
      this._setCloseHandlers();
    }
  }
  ngOnDestroy() {
    this.close();
  }
  _applyDatepickerInputs(datepickerComponentRef) {
    [
      "contentTemplate",
      "dayTemplate",
      "dayTemplateData",
      "displayMonths",
      "firstDayOfWeek",
      "footerTemplate",
      "markDisabled",
      "minDate",
      "maxDate",
      "navigation",
      "outsideDays",
      "showNavigation",
      "showWeekNumbers",
      "weekdays"
    ].forEach((inputName) => {
      if (this[inputName] !== void 0) {
        datepickerComponentRef.setInput(inputName, this[inputName]);
      }
    });
    datepickerComponentRef.setInput("startDate", this.startDate || this._model);
  }
  _applyPopupClass(newClass, oldClass) {
    const popupEl = this._cRef?.location.nativeElement;
    if (popupEl) {
      if (newClass) {
        popupEl.classList.add(newClass);
      }
      if (oldClass) {
        popupEl.classList.remove(oldClass);
      }
    }
  }
  _applyPopupStyling(nativeElement) {
    nativeElement.classList.add("dropdown-menu", "show");
    if (this.container === "body") {
      nativeElement.classList.add("ngb-dp-body");
    }
    this._applyPopupClass(this.datepickerClass);
  }
  _subscribeForDatepickerOutputs(datepickerInstance) {
    datepickerInstance.navigate.subscribe((navigateEvent) => this.navigate.emit(navigateEvent));
    datepickerInstance.dateSelect.subscribe((date) => {
      this.dateSelect.emit(date);
      if (this.autoClose === true || this.autoClose === "inside") {
        this.close();
      }
    });
  }
  _writeModelValue(model) {
    const value = this._parserFormatter.format(model);
    this._inputValue = value;
    this._elRef.nativeElement.value = value;
    if (this.isOpen()) {
      this._cRef.instance.writeValue(this._dateAdapter.toModel(model));
      this._onTouched();
    }
  }
  _fromDateStruct(date) {
    const ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
    return this._calendar.isValid(ngbDate) ? ngbDate : null;
  }
  _setCloseHandlers() {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this._destroyCloseHandlers$, [], [
      this._elRef.nativeElement,
      this._cRef.location.nativeElement
    ]);
  }
  constructor() {
    this._parserFormatter = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][0] : inject(NgbDateParserFormatter);
    this._elRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][1] : inject(ElementRef);
    this._vcRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][2] : inject(ViewContainerRef);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][3] : inject(NgZone);
    this._calendar = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][4] : inject(NgbCalendar);
    this._dateAdapter = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][5] : inject(NgbDateAdapter);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][6] : inject(DOCUMENT);
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][7] : inject(ChangeDetectorRef);
    this._injector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][8] : inject(Injector);
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbInputDatepicker"] ? globalThis.ɵngjsInjected["NgbInputDatepicker"][9] : inject(NgbInputDatepickerConfig);
    this._cRef = null;
    this._disabled = false;
    this._elWithFocus = null;
    this._model = null;
    this._positioning = ngbPositioning();
    this._destroyCloseHandlers$ = new Subject();
    this.autoClose = this._config.autoClose;
    this.placement = this._config.placement;
    this.popperOptions = this._config.popperOptions;
    this.container = this._config.container;
    this.positionTarget = this._config.positionTarget;
    this.dateSelect = new EventEmitter();
    this.navigate = new EventEmitter();
    this.closed = new EventEmitter();
    this._onChange = (_) => {
    };
    this._onTouched = () => {
    };
    this._validatorChange = () => {
    };
  }
};
NgbInputDatepicker.ɵfac = [
  "NgbDateParserFormatter_2a13db01",
  "ElementRef_927308a2",
  "ViewContainerRef_2579ba28",
  "NgZone_31031859",
  "NgbCalendar_5acf56e4",
  "NgbDateAdapter_53a4f8ce",
  "DOCUMENT_a3a362b8",
  "ChangeDetectorRef_e2bfcbab",
  "Injector_125f3b76",
  "NgbInputDatepickerConfig_4a9881f2",
  "$element",
  "$scope",
  function NgbInputDatepicker_Factory(i0, i1, i2, i3, i4, i5, i6, i7, i8, i9, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "input"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbInputDatepicker: este selector requiere <input>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbInputDatepicker": [
        i0,
        i1,
        i2,
        i3,
        i4,
        i5,
        i6,
        i7,
        i8,
        i9
      ]
    };
    try {
      var instance = new NgbInputDatepicker();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostDisabled;
    }, function(v) {
      $element.prop("disabled", v);
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("disabled", v);
      })(instance._hostDisabled);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._handleInput(event);
      } else {
        $scope.$apply(function() {
          instance._handleInput(event);
        });
      }
    };
    $element.on("input", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._handleChange(event);
      } else {
        $scope.$apply(function() {
          instance._handleChange(event);
        });
      }
    };
    $element.on("change", ɵhandler1);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      $element.off("input", ɵhandler0);
      $element.off("change", ɵhandler1);
    });
    return instance;
  }
];
NgbInputDatepicker.ɵdir = {
  selectors: [
    [
      "input",
      "ngbDatepicker",
      ""
    ]
  ],
  inputs: {
    "autoClose": "autoClose",
    "contentTemplate": "contentTemplate",
    "datepickerClass": "datepickerClass",
    "dayTemplate": "dayTemplate",
    "dayTemplateData": "dayTemplateData",
    "displayMonths": "displayMonths",
    "firstDayOfWeek": "firstDayOfWeek",
    "footerTemplate": "footerTemplate",
    "markDisabled": "markDisabled",
    "minDate": "minDate",
    "maxDate": "maxDate",
    "navigation": "navigation",
    "outsideDays": "outsideDays",
    "placement": "placement",
    "popperOptions": "popperOptions",
    "restoreFocus": "restoreFocus",
    "showWeekNumbers": "showWeekNumbers",
    "startDate": "startDate",
    "container": "container",
    "positionTarget": "positionTarget",
    "weekdays": "weekdays",
    "disabled": "disabled"
  },
  outputs: {
    "dateSelect": "dateSelect",
    "navigate": "navigate",
    "closed": "closed"
  },
  exportAs: [
    "ngbDatepicker"
  ],
  definition: {
    "bindings": {
      "autoClose": "<?",
      "contentTemplate": "<?",
      "datepickerClass": "@?",
      "dayTemplate": "<?",
      "dayTemplateData": "<?",
      "displayMonths": "<?",
      "firstDayOfWeek": "<?",
      "footerTemplate": "<?",
      "markDisabled": "<?",
      "minDate": "<?",
      "maxDate": "<?",
      "navigation": "@?",
      "outsideDays": "@?",
      "placement": "<?",
      "popperOptions": "<?",
      "restoreFocus": "<?",
      "showWeekNumbers": "<?",
      "startDate": "<?",
      "container": "@?",
      "positionTarget": "<?",
      "weekdays": "<?",
      "disabled": "<?ngDisabled",
      "dateSelect": "&?",
      "navigate": "&?",
      "closed": "&?"
    }
  }
};
NgbInputDatepicker.ɵfac.ɵtype = NgbInputDatepicker;
NgbInputDatepicker.ɵfac.ɵproviders = [
  {
    token: "NG_VALUE_ACCESSOR_de942eb5",
    kind: "useExisting",
    existing: "NgbInputDatepicker_d2b25036",
    multi: true
  },
  {
    token: "NG_VALIDATORS_d8f0216a",
    kind: "useExisting",
    existing: "NgbInputDatepicker_d2b25036",
    multi: true
  },
  {
    token: "NgbDatepickerConfig_32959658",
    kind: "useExisting",
    existing: "NgbInputDatepickerConfig_4a9881f2"
  }
];
NgbInputDatepicker.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbInputDatepicker.prototype.$onChanges = function(changesObj) {
  var changes = {};
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
    var c = changesObj["contentTemplate"];
    if (!c) return;
    changes["contentTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["datepickerClass"];
    if (!c) return;
    changes["datepickerClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["dayTemplate"];
    if (!c) return;
    changes["dayTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["dayTemplateData"];
    if (!c) return;
    changes["dayTemplateData"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["displayMonths"];
    if (!c) return;
    changes["displayMonths"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["firstDayOfWeek"];
    if (!c) return;
    changes["firstDayOfWeek"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["footerTemplate"];
    if (!c) return;
    changes["footerTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["markDisabled"];
    if (!c) return;
    changes["markDisabled"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["minDate"];
    if (!c) return;
    changes["minDate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["maxDate"];
    if (!c) return;
    changes["maxDate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["navigation"];
    if (!c) return;
    changes["navigation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["outsideDays"];
    if (!c) return;
    changes["outsideDays"] = {
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
    var c = changesObj["restoreFocus"];
    if (!c) return;
    changes["restoreFocus"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["showWeekNumbers"];
    if (!c) return;
    changes["showWeekNumbers"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["startDate"];
    if (!c) return;
    changes["startDate"] = {
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
    var c = changesObj["weekdays"];
    if (!c) return;
    changes["weekdays"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
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
var NgbDatepickerModule = class {
};
NgbDatepickerModule.ɵfac = [
  function NgbDatepickerModule_Factory() {
    return new NgbDatepickerModule();
  }
];
NgbDatepickerModule.ɵmod = {
  id: "NgbDatepickerModule_d226be2c",
  controllerAs: "$"
};
import_angular2.default.module("NgbDatepickerModule_d226be2c", [
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
]).component("ngbDatepicker", {
  controller: NgbDatepicker.ɵfac,
  template: `<ng-template ng-ref="defaultDayTemplate" let-date="date" let-current-month="currentMonth" let-selected="selected" let-disabled="disabled" let-focused="focused" _content-d1dce1b8="">
  <div ngb-datepicker-day-view="" date="date" current-month="currentMonth" ng-selected="selected" ng-disabled="disabled" focused="focused" _content-d1dce1b8="">
  </div>
</ng-template>

<ng-template ng-ref="defaultContentTemplate" _content-d1dce1b8="">
  <div ng-repeat="month in $.model.months track by $index" class="ngb-dp-month pe-none" ng-class="{ 'ps-3': !$first, 'ps-1': $first, 'pe-1': $last }" _content-d1dce1b8="">
    <div ng-if="$.navigation === 'none' || ($.displayMonths > 1 &amp;&amp; $.navigation === 'select')" class="ngb-dp-month-name fs-5 text-center bg-body-tertiary" ng-class="{ 'text-muted': $.model.disabled }" style="height: 2rem; line-height: 2rem" _content-d1dce1b8="">
      {{ $.i18n.getMonthLabel(month.firstDate) }}
    </div>
    <ngb-datepicker-month class="d-block pe-auto" month="month.firstDate" _content-d1dce1b8=""></ngb-datepicker-month>
  </div>
</ng-template>

<div class="ngb-dp-header pt-1 border-bottom-0 rounded-top bg-body-tertiary" _content-d1dce1b8="">
  <ngb-datepicker-navigation ng-if="$.navigation !== 'none' &amp;&amp; $.model" date="$.model.firstDate" months="$.model.months" ng-disabled="$.model.disabled" show-select="$.model.navigation === 'select'" prev-disabled="$.model.prevDisabled" next-disabled="$.model.nextDisabled" select-boxes="$.model.selectBoxes" navigate="$.onNavigateEvent($event)" select="$.onNavigateDateSelect($event)" class="d-flex align-items-center" _content-d1dce1b8="">
  </ngb-datepicker-navigation>
</div>

<div class="ngb-dp-content" ng-class="{ 'ngb-dp-months': !$.contentTemplate, 'd-flex': !$.contentTemplate }" ng-ref="content" _content-d1dce1b8="">
  <ng-template ng-if="$.model" ng-template-outlet="$.contentTemplate || $.contentTemplateFromContent || defaultContentTemplate" ng-template-outlet-context="{ $implicit: $ }" _content-d1dce1b8="">
  </ng-template>
</div>

<ng-template ng-if="$.footerTemplate" ng-template-outlet="$.footerTemplate" _content-d1dce1b8=""></ng-template>
<ng-content _content-d1dce1b8=""></ng-content>`,
  controllerAs: "$",
  bindings: {
    "contentTemplate": "<?",
    "dayTemplate": "<?",
    "dayTemplateData": "<?",
    "displayMonths": "<?",
    "firstDayOfWeek": "<?",
    "footerTemplate": "<?",
    "markDisabled": "<?",
    "maxDate": "<?",
    "minDate": "<?",
    "navigation": "<?",
    "outsideDays": "<?",
    "showWeekNumbers": "<?",
    "startDate": "<?",
    "weekdays": "<?",
    "navigate": "&?",
    "dateSelect": "&?"
  },
  transclude: true
}).directive("ngbDatepicker", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "navigate",
          "date-select"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).component("ngbDatepickerMonth", {
  controller: NgbDatepickerMonth.ɵfac,
  template: `<div ng-if="$.viewModel.weekdays.length" class="ngb-dp-week ngb-dp-weekdays d-flex rounded-0 border-bottom bg-body-tertiary" role="row" _content-cce99068="">
  <div ng-if="$.datepicker.showWeekNumbers" class="ngb-dp-weekday ngb-dp-showweek small fst-italic text-center" ng-class="{ 'text-muted': $.datepicker.model.disabled }" style="width: 2rem; height: 2rem; line-height: 2rem" _content-cce99068="">
    {{ $.datepicker.i18n.getWeekLabel() }}
  </div>
  <div ng-repeat="weekday in $.viewModel.weekdays track by $index" class="ngb-dp-weekday small fst-italic text-center text-info" ng-class="{ 'text-muted': $.datepicker.model.disabled }" style="width: 2rem; height: 2rem; line-height: 2rem" role="columnheader" _content-cce99068="">
    {{ weekday }}
  </div>
</div>

<div ng-repeat="week in $.viewModel.weeks track by $index" ng-if="!week.collapsed" class="ngb-dp-week d-flex rounded-1" ng-class="{ 'pb-1': $last }" role="row" _content-cce99068="">
  <div ng-if="$.datepicker.showWeekNumbers" class="ngb-dp-week-number small text-muted fst-italic text-center" style="width: 2rem; height: 2rem; line-height: 2rem" _content-cce99068="">
    {{ $.datepicker.i18n.getWeekNumerals(week.number) }}
  </div>
  <div ng-repeat="day in week.days track by day.date.year + '-' + day.date.month + '-' + day.date.day" ng-click="$.doSelect(day); $event.preventDefault()" class="ngb-dp-day" style="width: 2rem; height: 2rem; cursor: pointer" ng-style="{ cursor: day.context.disabled || day.hidden ? 'default' : 'pointer' }" ng-class="{ disabled: day.context.disabled, hidden: day.hidden, invisible: day.hidden, 'pe-none': day.context.disabled || day.hidden, 'z-1': day.tabindex === 0, 'ngb-dp-today': day.context.today }" role="gridcell" ng-attr-tabindex="{{ day.tabindex }}" ng-attr-aria-label="{{ day.ariaLabel }}" ng-attr-aria-disabled="{{ day.context.disabled }}" ng-attr-aria-selected="{{ day.context.selected }}" _content-cce99068="">
    <ng-template ng-if="!day.hidden" ng-template-outlet="$.datepicker.dayTemplate" ng-template-outlet-context="day.context" _content-cce99068="">
    </ng-template>
  </div>
</div>`,
  controllerAs: "$",
  bindings: {
    "month": "<?"
  }
}).component("ngbDatepickerNavigation", {
  controller: NgbDatepickerNavigation.ɵfac,
  template: `<div class="ngb-dp-arrow ngb-dp-arrow-prev d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
  <button type="button" class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0" ng-click="$.onClickPrev($event)" ng-disabled="$.prevDisabled" i18n-aria-label="@@ngb.datepicker.previous-month" aria-label="Previous month" i18n-title="@@ngb.datepicker.previous-month" title="Previous month" _content-7f65cbcb="">
    <span class="ngb-dp-navigation-chevron d-inline-block" style="width: .75em; height: .75em; margin-right: .15em; margin-left: .25em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(-135deg)" _content-7f65cbcb="">
    </span>
  </button>
</div>

<ngb-datepicker-navigation-select ng-if="$.showSelect" class="ngb-dp-navigation-select d-flex flex-grow-1" style="flex-basis: 9rem" date="$.date" ng-disabled="$.disabled" months="$.selectBoxes.months" years="$.selectBoxes.years" select="$.select.emit($event)" _content-7f65cbcb="">
</ngb-datepicker-navigation-select>

<ng-container ng-if="!$.showSelect" _content-7f65cbcb="">
  <ng-container ng-repeat="month in $.months track by $index" _content-7f65cbcb="">
    <div ng-if="$index > 0" class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb=""></div>
    <div class="ngb-dp-month-name fs-5 text-center" ng-class="{ 'text-muted': $.disabled }" style="height: 2rem; line-height: 2rem" _content-7f65cbcb="">
      {{ $.i18n.getMonthLabel(month.firstDate) }}
    </div>
    <div ng-if="$index !== $.months.length - 1" class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
    </div>
  </ng-container>
</ng-container>

<div class="visually-hidden" aria-live="polite" _content-7f65cbcb="">
  <span ng-repeat="month in $.months track by $index" _content-7f65cbcb="">{{ $.i18n.getMonthLabel(month.firstDate) }}</span>
</div>

<div class="ngb-dp-arrow ngb-dp-arrow-next d-flex flex-grow-1 justify-content-end p-0 m-0" style="width: 2rem; height: 2rem" _content-7f65cbcb="">
  <button type="button" class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0" ng-click="$.onClickNext($event)" ng-disabled="$.nextDisabled" i18n-aria-label="@@ngb.datepicker.next-month" aria-label="Next month" i18n-title="@@ngb.datepicker.next-month" title="Next month" _content-7f65cbcb="">
    <span class="ngb-dp-navigation-chevron d-inline-block" style="width: .75em; height: .75em; margin-right: .25em; margin-left: .15em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(45deg)" _content-7f65cbcb="">
    </span>
  </button>
</div>`,
  controllerAs: "$",
  bindings: {
    "date": "<?",
    "disabled": "<?ngDisabled",
    "months": "<?",
    "showSelect": "<?",
    "prevDisabled": "<?",
    "nextDisabled": "<?",
    "selectBoxes": "<?",
    "navigate": "&?",
    "select": "&?"
  }
}).directive("ngbDatepickerNavigation", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "navigate",
          "select"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).component("ngbDatepickerNavigationSelect", {
  controller: NgbDatepickerNavigationSelect.ɵfac,
  template: '<select ng-disabled="$.disabled" ng-model="$.selectedMonth" ng-change="$.changeMonth($.selectedMonth)" class="form-select flex-grow-1 py-0 px-2 small" style="height: 1.85rem" i18n-aria-label="@@ngb.datepicker.select-month" aria-label="Select month" i18n-title="@@ngb.datepicker.select-month" title="Select month" _content-fbcd1297="">\n  <option ng-repeat="month in $.months track by month" ng-value="month" ng-attr-aria-label="{{ $.i18n.getMonthFullName(month, $.date.year) }}" _content-fbcd1297="">\n    {{ $.i18n.getMonthShortName(month, $.date.year) }}\n  </option>\n</select>\n<select ng-disabled="$.disabled" ng-model="$.selectedYear" ng-change="$.changeYear($.selectedYear)" class="form-select flex-grow-1 py-0 px-2 small" style="height: 1.85rem" i18n-aria-label="@@ngb.datepicker.select-year" aria-label="Select year" i18n-title="@@ngb.datepicker.select-year" title="Select year" _content-fbcd1297="">\n  <option ng-repeat="year in $.years track by year" ng-value="year" _content-fbcd1297="">\n    {{ $.i18n.getYearNumerals(year) }}\n  </option>\n</select>',
  controllerAs: "$",
  bindings: {
    "date": "<?",
    "disabled": "<?ngDisabled",
    "months": "<?",
    "years": "<?",
    "select": "&?"
  }
}).directive("ngbDatepickerNavigationSelect", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "select"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbDatepickerDayView", function() {
  return {
    controller: NgbDatepickerDayView.ɵfac,
    template: "{{ $.i18n.getDayNumerals($.date) }}",
    controllerAs: "$",
    restrict: "A",
    scope: {},
    bindToController: {
      "currentMonth": "<?",
      "date": "<?",
      "disabled": "<?ngDisabled",
      "focused": "<?",
      "selected": "<?ngSelected"
    }
  };
}).directive("ngbDatepickerContent", function() {
  return {
    controller: NgbDatepickerContent.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbDatepickerContent"
  };
}).directive("ngbDatepicker", function() {
  return {
    controller: NgbInputDatepicker.ɵfac,
    restrict: "A",
    bindToController: {
      "autoClose": "<?",
      "contentTemplate": "<?",
      "datepickerClass": "@?",
      "dayTemplate": "<?",
      "dayTemplateData": "<?",
      "displayMonths": "<?",
      "firstDayOfWeek": "<?",
      "footerTemplate": "<?",
      "markDisabled": "<?",
      "minDate": "<?",
      "maxDate": "<?",
      "navigation": "@?",
      "outsideDays": "@?",
      "placement": "<?",
      "popperOptions": "<?",
      "restoreFocus": "<?",
      "showWeekNumbers": "<?",
      "startDate": "<?",
      "container": "@?",
      "positionTarget": "<?",
      "weekdays": "<?",
      "disabled": "<?ngDisabled",
      "dateSelect": "&?",
      "navigate": "&?",
      "closed": "&?"
    },
    controllerAs: "ngbDatepicker"
  };
}).directive("ngbDatepicker", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        if (element[0].localName !== "input") return;
        [
          "date-select",
          "navigate",
          "closed"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbDatepickerModule_882e6feb", NgbDatepickerModule.ɵfac).run([
  "NgbDatepickerModule_882e6feb",
  function() {
  }
]);

// ../ngb-js/dist/datepicker/index.js
var NgbDateNativeAdapter = class extends NgbDateAdapter {
  fromModel(date) {
    return date instanceof Date && !isNaN(date.getTime()) ? this._fromNativeDate(date) : null;
  }
  toModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? this._toNativeDate(date) : null;
  }
  _fromNativeDate(date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }
  _toNativeDate(date) {
    const jsDate = new Date(date.year, date.month - 1, date.day, 12);
    jsDate.setFullYear(date.year);
    return jsDate;
  }
};
NgbDateNativeAdapter.ɵfac = [
  function NgbDateNativeAdapter_Factory() {
    return new NgbDateNativeAdapter();
  }
];
NgbDateNativeAdapter.ɵprov = {
  token: "NgbDateNativeAdapter_e40258a2"
};
var NgbDateNativeUTCAdapter = class extends NgbDateNativeAdapter {
  _fromNativeDate(date) {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate()
    };
  }
  _toNativeDate(date) {
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    jsDate.setUTCFullYear(date.year);
    return jsDate;
  }
};
NgbDateNativeUTCAdapter.ɵfac = [
  function NgbDateNativeUTCAdapter_Factory() {
    return new NgbDateNativeUTCAdapter();
  }
];
NgbDateNativeUTCAdapter.ɵprov = {
  token: "NgbDateNativeUTCAdapter_a29c1288"
};
function toGregorian(date) {
  return new Date(date.year - 543, date.month - 1, date.day);
}
function fromGregorian(gdate) {
  return new NgbDate(gdate.getFullYear() + 543, gdate.getMonth() + 1, gdate.getDate());
}
var NgbCalendarBuddhist = class extends NgbCalendarGregorian {
  getToday() {
    return fromGregorian(/* @__PURE__ */ new Date());
  }
  getNext(date, period = "d", number = 1) {
    const jsDate = toGregorian(date);
    let checkMonth = true;
    let expectedMonth = jsDate.getMonth();
    switch (period) {
      case "y":
        jsDate.setFullYear(jsDate.getFullYear() + number);
        break;
      case "m":
        expectedMonth += number;
        jsDate.setMonth(expectedMonth);
        expectedMonth = expectedMonth % 12;
        if (expectedMonth < 0) {
          expectedMonth = expectedMonth + 12;
        }
        break;
      case "d":
        jsDate.setDate(jsDate.getDate() + number);
        checkMonth = false;
        break;
      default:
        return date;
    }
    if (checkMonth && jsDate.getMonth() !== expectedMonth) {
      jsDate.setDate(0);
    }
    return fromGregorian(jsDate);
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const jsDate = toGregorian(date);
    const day = jsDate.getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = toGregorian(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    jsDate.setMonth(0);
    jsDate.setDate(1);
    return Math.floor(Math.round((time - jsDate.getTime()) / 864e5) / 7) + 1;
  }
  isValid(date) {
    if (!date || !isInteger(date.year) || !isInteger(date.month) || !isInteger(date.day)) {
      return false;
    }
    if (date.year === 0) {
      return false;
    }
    const jsDate = toGregorian(date);
    return !isNaN(jsDate.getTime()) && jsDate.getFullYear() === date.year - 543 && jsDate.getMonth() + 1 === date.month && jsDate.getDate() === date.day;
  }
};
NgbCalendarBuddhist.ɵfac = [
  function NgbCalendarBuddhist_Factory() {
    return new NgbCalendarBuddhist();
  }
];
NgbCalendarBuddhist.ɵprov = {
  token: "NgbCalendarBuddhist_bd920354"
};
var WEEKDAYS = [
  "እሑድ",
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሓሙስ",
  "ዓርብ",
  "ቅዳሜ"
];
var MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታህሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ"
];
var NgbDatepickerI18nAmharic = class extends NgbDatepickerI18n {
  getMonthShortName(month, year) {
    return this.getMonthFullName(month, year);
  }
  getMonthFullName(month, _year) {
    return MONTHS[month - 1] ?? "";
  }
  getWeekdayLabel(weekday) {
    return WEEKDAYS[weekday - 1] ?? "";
  }
  getDayAriaLabel(date) {
    return `${date.day} ${this.getMonthFullName(date.month, date.year)} ${date.year}`;
  }
};
NgbDatepickerI18nAmharic.ɵfac = [
  function NgbDatepickerI18nAmharic_Factory() {
    return new NgbDatepickerI18nAmharic();
  }
];
NgbDatepickerI18nAmharic.ɵprov = {
  token: "NgbDatepickerI18nAmharic_b7e37b6e"
};
var JD_EPOCH = 17242205e-1;
var DAYSPERMONTH = [
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  30,
  5
];
function isEthiopianLeapYear(year) {
  if (year != null) {
    return year % 4 == 3 || year % 4 == -1;
  }
  return false;
}
function setEthiopianYear(date, yearValue) {
  date.year = +yearValue;
  return date;
}
function setEthiopianMonth(date, val) {
  val = +val;
  date.year = date.year + Math.floor((val - 1) / 13);
  date.month = Math.floor(((val - 1) % 13 + 13) % 13) + 1;
  return date;
}
function setEthiopianDay(date, day) {
  let mDays = getDaysPerMonth(date.month, date.year);
  if (day <= 0) {
    while (day <= 0) {
      date = setEthiopianMonth(date, date.month - 1);
      mDays = getDaysPerMonth(date.month, date.year);
      day += mDays;
    }
  } else if (day > mDays) {
    while (day > mDays) {
      day -= mDays;
      date = setEthiopianMonth(date, date.month + 1);
      mDays = getDaysPerMonth(date.month, date.year);
    }
  }
  date.day = day;
  return date;
}
function getDaysPerMonth(month, year) {
  const leapYear = isEthiopianLeapYear(year);
  return DAYSPERMONTH[month - 1] + (month === 13 && leapYear ? 1 : 0);
}
function toGregorian2(ethiopianDate) {
  const jdn = ethiopianToJulian(ethiopianDate.year, ethiopianDate.month, ethiopianDate.day);
  const date = julianToGregorian(jdn);
  date.setHours(6, 30, 3, 200);
  return date;
}
function fromGregorian2(gdate) {
  const g2d = gregorianToJulian(gdate.getFullYear(), gdate.getMonth() + 1, gdate.getDate());
  return juilianToEthiopia(g2d);
}
function ethiopianToJulian(year, month, day) {
  if (year < 0) {
    year++;
  }
  return day + (month - 1) * 30 + (year - 1) * 365 + Math.floor(year / 4) + JD_EPOCH - 1;
}
function juilianToEthiopia(jd) {
  let c = Math.floor(jd) + 0.5 - JD_EPOCH;
  let year = Math.floor((c - Math.floor((c + 366) / 1461)) / 365) + 1;
  if (year <= 0) {
    year--;
  }
  c = Math.floor(jd) + 0.5 - ethiopianToJulian(year, 1, 1);
  const month = Math.floor(c / 30) + 1;
  const day = c - (month - 1) * 30 + 1;
  return new NgbDate(year, month, day);
}
function julianToGregorian(jd) {
  const z = Math.floor(jd + 0.5);
  let a = Math.floor((z - 186721625e-2) / 36524.25);
  a = z + 1 + a - Math.floor(a / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(e * 30.6001);
  const month = e - (e > 13.5 ? 13 : 1);
  let year = c - (month > 2.5 ? 4716 : 4715);
  if (year <= 0) {
    year--;
  }
  return new Date(year, month, day);
}
function gregorianToJulian(year, month, day) {
  if (year < 0) {
    year++;
  }
  if (month < 3) {
    month += 12;
    year--;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}
var NgbCalendarEthiopian = class extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths(_year) {
    return [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13
    ];
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date = setEthiopianYear(date, date.year + number);
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = setEthiopianMonth(date, date.month + number);
        date.day = 1;
        return date;
      case "d":
        return setEthiopianDay(date, date.day + number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const dt = Math.floor(ethiopianToJulian(date.year, date.month, date.day) + 3) % 7;
    return dt === 0 ? 7 : dt;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = toGregorian2(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    const startDate = toGregorian2(new NgbDate(date.year, 1, 1));
    return Math.floor(Math.round((time - startDate.getTime()) / 864e5) / 7) + 1;
  }
  getWeeksPerMonth() {
    return 6;
  }
  getToday() {
    return fromGregorian2(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) && !isNaN(toGregorian2(date).getTime());
  }
};
NgbCalendarEthiopian.ɵfac = [
  function NgbCalendarEthiopian_Factory() {
    return new NgbCalendarEthiopian();
  }
];
NgbCalendarEthiopian.ɵprov = {
  token: "NgbCalendarEthiopian_c62bda05"
};
var PARTS_PER_HOUR = 1080;
var PARTS_PER_DAY = 24 * PARTS_PER_HOUR;
var PARTS_FRACTIONAL_MONTH = 12 * PARTS_PER_HOUR + 793;
var PARTS_PER_MONTH = 29 * PARTS_PER_DAY + PARTS_FRACTIONAL_MONTH;
var BAHARAD = 11 * PARTS_PER_HOUR + 204;
var HEBREW_DAY_ON_JAN_1_1970 = 2092591;
var GREGORIAN_EPOCH = 17214255e-1;
function isGregorianLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function numberOfFirstDayInYear(year) {
  const monthsBeforeYear = Math.floor((235 * year - 234) / 19);
  const fractionalMonthsBeforeYear = monthsBeforeYear * PARTS_FRACTIONAL_MONTH + BAHARAD;
  let dayNumber = monthsBeforeYear * 29 + Math.floor(fractionalMonthsBeforeYear / PARTS_PER_DAY);
  const timeOfDay = fractionalMonthsBeforeYear % PARTS_PER_DAY;
  let dayOfWeek = dayNumber % 7;
  if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
    dayNumber++;
    dayOfWeek = dayNumber % 7;
  }
  if (dayOfWeek === 1 && timeOfDay > 15 * PARTS_PER_HOUR + 204 && !isHebrewLeapYear(year)) {
    dayNumber += 2;
  } else if (dayOfWeek === 0 && timeOfDay > 21 * PARTS_PER_HOUR + 589 && isHebrewLeapYear(year - 1)) {
    dayNumber++;
  }
  return dayNumber;
}
function getDaysInGregorianMonth(month, year) {
  const days = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];
  if (isGregorianLeapYear(year)) {
    days[1]++;
  }
  return days[month - 1];
}
function getHebrewMonths(year) {
  return isHebrewLeapYear(year) ? 13 : 12;
}
function getDaysInHebrewYear(year) {
  return numberOfFirstDayInYear(year + 1) - numberOfFirstDayInYear(year);
}
function isHebrewLeapYear(year) {
  if (year != null) {
    const b = (year * 12 + 17) % 19;
    return b >= (b < 0 ? -7 : 12);
  }
  return false;
}
function getDaysInHebrewMonth(month, year) {
  const yearLength = numberOfFirstDayInYear(year + 1) - numberOfFirstDayInYear(year);
  const yearType = (yearLength <= 380 ? yearLength : yearLength - 30) - 353;
  const leapYear = isHebrewLeapYear(year);
  const daysInMonth = leapYear ? [
    30,
    29,
    29,
    29,
    30,
    30,
    29,
    30,
    29,
    30,
    29,
    30,
    29
  ] : [
    30,
    29,
    29,
    29,
    30,
    29,
    30,
    29,
    30,
    29,
    30,
    29
  ];
  if (yearType > 0) {
    daysInMonth[2]++;
  }
  if (yearType > 1) {
    daysInMonth[1]++;
  }
  return daysInMonth[month - 1];
}
function getDayNumberInHebrewYear(date) {
  let numberOfDay = 0;
  for (let i = 1; i < date.month; i++) {
    numberOfDay += getDaysInHebrewMonth(i, date.year);
  }
  return numberOfDay + date.day;
}
function setHebrewMonth(date, val) {
  const after = val >= 0;
  if (!after) {
    val = -val;
  }
  while (val > 0) {
    if (after) {
      if (val > getHebrewMonths(date.year) - date.month) {
        val -= getHebrewMonths(date.year) - date.month + 1;
        date.year++;
        date.month = 1;
      } else {
        date.month += val;
        val = 0;
      }
    } else {
      if (val >= date.month) {
        date.year--;
        val -= date.month;
        date.month = getHebrewMonths(date.year);
      } else {
        date.month -= val;
        val = 0;
      }
    }
  }
  return date;
}
function setHebrewDay(date, val) {
  const after = val >= 0;
  if (!after) {
    val = -val;
  }
  while (val > 0) {
    if (after) {
      if (val > getDaysInHebrewYear(date.year) - getDayNumberInHebrewYear(date)) {
        val -= getDaysInHebrewYear(date.year) - getDayNumberInHebrewYear(date) + 1;
        date.year++;
        date.month = 1;
        date.day = 1;
      } else if (val > getDaysInHebrewMonth(date.month, date.year) - date.day) {
        val -= getDaysInHebrewMonth(date.month, date.year) - date.day + 1;
        date.month++;
        date.day = 1;
      } else {
        date.day += val;
        val = 0;
      }
    } else {
      if (val >= date.day) {
        val -= date.day;
        date.month--;
        if (date.month === 0) {
          date.year--;
          date.month = getHebrewMonths(date.year);
        }
        date.day = getDaysInHebrewMonth(date.month, date.year);
      } else {
        date.day -= val;
        val = 0;
      }
    }
  }
  return date;
}
function fromGregorian3(gdate) {
  const date = new Date(gdate);
  const gYear = date.getFullYear(), gMonth = date.getMonth(), gDay = date.getDate();
  let julianDay = GREGORIAN_EPOCH - 1 + 365 * (gYear - 1) + Math.floor((gYear - 1) / 4) - Math.floor((gYear - 1) / 100) + Math.floor((gYear - 1) / 400) + Math.floor((367 * (gMonth + 1) - 362) / 12 + (gMonth + 1 <= 2 ? 0 : isGregorianLeapYear(gYear) ? -1 : -2) + gDay);
  julianDay = Math.floor(julianDay + 0.5);
  const daysSinceHebEpoch = julianDay - 347997;
  const monthsSinceHebEpoch = Math.floor(daysSinceHebEpoch * PARTS_PER_DAY / PARTS_PER_MONTH);
  let hYear = Math.floor((monthsSinceHebEpoch * 19 + 234) / 235) + 1;
  let firstDayOfThisYear = numberOfFirstDayInYear(hYear);
  let dayOfYear = daysSinceHebEpoch - firstDayOfThisYear;
  while (dayOfYear < 1) {
    hYear--;
    firstDayOfThisYear = numberOfFirstDayInYear(hYear);
    dayOfYear = daysSinceHebEpoch - firstDayOfThisYear;
  }
  let hMonth = 1;
  let hDay = dayOfYear;
  while (hDay > getDaysInHebrewMonth(hMonth, hYear)) {
    hDay -= getDaysInHebrewMonth(hMonth, hYear);
    hMonth++;
  }
  return new NgbDate(hYear, hMonth, hDay);
}
function toGregorian3(hebrewDate) {
  const hYear = hebrewDate.year;
  const hMonth = hebrewDate.month;
  const hDay = hebrewDate.day;
  let days = numberOfFirstDayInYear(hYear);
  for (let i = 1; i < hMonth; i++) {
    days += getDaysInHebrewMonth(i, hYear);
  }
  days += hDay;
  let diffDays = days - HEBREW_DAY_ON_JAN_1_1970;
  const after = diffDays >= 0;
  if (!after) {
    diffDays = -diffDays;
  }
  let gYear = 1970;
  let gMonth = 1;
  let gDay = 1;
  while (diffDays > 0) {
    if (after) {
      if (diffDays >= (isGregorianLeapYear(gYear) ? 366 : 365)) {
        diffDays -= isGregorianLeapYear(gYear) ? 366 : 365;
        gYear++;
      } else if (diffDays >= getDaysInGregorianMonth(gMonth, gYear)) {
        diffDays -= getDaysInGregorianMonth(gMonth, gYear);
        gMonth++;
      } else {
        gDay += diffDays;
        diffDays = 0;
      }
    } else {
      if (diffDays >= (isGregorianLeapYear(gYear - 1) ? 366 : 365)) {
        diffDays -= isGregorianLeapYear(gYear - 1) ? 366 : 365;
        gYear--;
      } else {
        if (gMonth > 1) {
          gMonth--;
        } else {
          gMonth = 12;
          gYear--;
        }
        if (diffDays >= getDaysInGregorianMonth(gMonth, gYear)) {
          diffDays -= getDaysInGregorianMonth(gMonth, gYear);
        } else {
          gDay = getDaysInGregorianMonth(gMonth, gYear) - diffDays + 1;
          diffDays = 0;
        }
      }
    }
  }
  return new Date(gYear, gMonth - 1, gDay);
}
function hebrewNumerals(numerals) {
  if (!numerals) {
    return "";
  }
  const hArray0_9 = [
    "",
    "א",
    "ב",
    "ג",
    "ד",
    "ה",
    "ו",
    "ז",
    "ח",
    "ט"
  ];
  const hArray10_19 = [
    "י",
    "יא",
    "יב",
    "יג",
    "יד",
    "טו",
    "טז",
    "יז",
    "יח",
    "יט"
  ];
  const hArray20_90 = [
    "",
    "",
    "כ",
    "ל",
    "מ",
    "נ",
    "ס",
    "ע",
    "פ",
    "צ"
  ];
  const hArray100_900 = [
    "",
    "ק",
    "ר",
    "ש",
    "ת",
    "תק",
    "תר",
    "תש",
    "תת",
    "תתק"
  ];
  const hArray1000_9000 = [
    "",
    "א",
    "ב",
    "בא",
    "בב",
    "ה",
    "הא",
    "הב",
    "הבא",
    "הבב"
  ];
  const geresh = "׳", gershaim = "״";
  let mem = 0;
  let result = [];
  let step = 0;
  while (numerals > 0) {
    const m = numerals % 10;
    if (step === 0) {
      mem = m;
    } else if (step === 1) {
      if (m !== 1) {
        result.unshift(hArray20_90[m], hArray0_9[mem]);
      } else {
        result.unshift(hArray10_19[mem]);
      }
    } else if (step === 2) {
      result.unshift(hArray100_900[m]);
    } else {
      if (m !== 5) {
        result.unshift(hArray1000_9000[m], geresh, " ");
      }
      break;
    }
    numerals = Math.floor(numerals / 10);
    if (step === 0 && numerals === 0) {
      result.unshift(hArray0_9[m]);
    }
    step++;
  }
  result = result.join("").split("");
  if (result.length === 1) {
    result.push(geresh);
  } else if (result.length > 1) {
    result.splice(result.length - 1, 0, gershaim);
  }
  return result.join("");
}
var WEEKDAYS2 = [
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
  "ראשון"
];
var MONTHS2 = [
  "תשרי",
  "חשון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר",
  "ניסן",
  "אייר",
  "סיון",
  "תמוז",
  "אב",
  "אלול"
];
var MONTHS_LEAP = [
  "תשרי",
  "חשון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר א׳",
  "אדר ב׳",
  "ניסן",
  "אייר",
  "סיון",
  "תמוז",
  "אב",
  "אלול"
];
var NgbDatepickerI18nHebrew = class extends NgbDatepickerI18n {
  getMonthShortName(month, year) {
    return this.getMonthFullName(month, year);
  }
  getMonthFullName(month, year) {
    return isHebrewLeapYear(year) ? MONTHS_LEAP[month - 1] ?? "" : MONTHS2[month - 1] ?? "";
  }
  getWeekdayLabel(weekday) {
    return WEEKDAYS2[weekday - 1] ?? "";
  }
  getDayAriaLabel(date) {
    return `${hebrewNumerals(date.day)} ${this.getMonthFullName(date.month, date.year)} ${hebrewNumerals(date.year)}`;
  }
  getDayNumerals(date) {
    return hebrewNumerals(date.day);
  }
  getWeekNumerals(weekNumber) {
    return hebrewNumerals(weekNumber);
  }
  getYearNumerals(year) {
    return hebrewNumerals(year);
  }
};
NgbDatepickerI18nHebrew.ɵfac = [
  function NgbDatepickerI18nHebrew_Factory() {
    return new NgbDatepickerI18nHebrew();
  }
];
NgbDatepickerI18nHebrew.ɵprov = {
  token: "NgbDatepickerI18nHebrew_a23121d2"
};
var NgbCalendarHebrew = class extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths(year) {
    if (year && isHebrewLeapYear(year)) {
      return [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13
      ];
    } else {
      return [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
      ];
    }
  }
  getWeeksPerMonth() {
    return 6;
  }
  isValid(date) {
    if (date != null) {
      let b = isNumber(date.year) && isNumber(date.month) && isNumber(date.day);
      b = b && date.month > 0 && date.month <= (isHebrewLeapYear(date.year) ? 13 : 12);
      b = b && date.day > 0 && date.day <= getDaysInHebrewMonth(date.month, date.year);
      return b && !isNaN(toGregorian3(date).getTime());
    }
    return false;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date.year += number;
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = setHebrewMonth(date, number);
        date.day = 1;
        return date;
      case "d":
        return setHebrewDay(date, number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = toGregorian3(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, _firstDayOfWeek) {
    const date = week[week.length - 1];
    return Math.ceil(getDayNumberInHebrewYear(date) / 7);
  }
  getToday() {
    return fromGregorian3(/* @__PURE__ */ new Date());
  }
  /**
  * @since 3.4.0
  */
  toGregorian(date) {
    return fromJSDate(toGregorian3(date));
  }
  /**
  * @since 3.4.0
  */
  fromGregorian(date) {
    return fromGregorian3(toJSDate(date));
  }
};
NgbCalendarHebrew.ɵfac = [
  function NgbCalendarHebrew_Factory() {
    return new NgbCalendarHebrew();
  }
];
NgbCalendarHebrew.ɵprov = {
  token: "NgbCalendarHebrew_3baaf167"
};
var NgbCalendarHijri = class extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
    ];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date = this._setYear(date, date.year + number);
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = this._setMonth(date, date.month + number);
        date.day = 1;
        return date;
      case "d":
        return this._setDay(date, date.day + number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = this.toGregorian(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = this.toGregorian(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    const MuhDate = this.toGregorian(new NgbDate(date.year, 1, 1));
    return Math.floor(Math.round((time - MuhDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return this.fromGregorian(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    return date != null && isNumber(date.year) && isNumber(date.month) && isNumber(date.day) && !isNaN(this.toGregorian(date).getTime());
  }
  _setDay(date, day) {
    day = +day;
    let mDays = this.getDaysPerMonth(date.month, date.year);
    if (day <= 0) {
      while (day <= 0) {
        date = this._setMonth(date, date.month - 1);
        mDays = this.getDaysPerMonth(date.month, date.year);
        day += mDays;
      }
    } else if (day > mDays) {
      while (day > mDays) {
        day -= mDays;
        date = this._setMonth(date, date.month + 1);
        mDays = this.getDaysPerMonth(date.month, date.year);
      }
    }
    date.day = day;
    return date;
  }
  _setMonth(date, month) {
    month = +month;
    date.year = date.year + Math.floor((month - 1) / 12);
    date.month = Math.floor(((month - 1) % 12 + 12) % 12) + 1;
    return date;
  }
  _setYear(date, year) {
    date.year = +year;
    return date;
  }
};
NgbCalendarHijri.ɵfac = [
  function NgbCalendarHijri_Factory() {
    return new NgbCalendarHijri();
  }
];
NgbCalendarHijri.ɵprov = {
  token: "NgbCalendarHijri_befb589e"
};
function isIslamicLeapYear(hYear) {
  return (14 + 11 * hYear) % 30 < 11;
}
function isGregorianLeapYear2(gDate) {
  const year = gDate.getFullYear();
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function getIslamicMonthStart(hYear, hMonth) {
  return Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 + Math.floor((3 + 11 * hYear) / 30);
}
function getIslamicYearStart(year) {
  return (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
}
function mod(a, b) {
  return a - b * Math.floor(a / b);
}
var GREGORIAN_EPOCH2 = 17214255e-1;
var ISLAMIC_EPOCH = 19484395e-1;
var NgbCalendarIslamicCivil = class extends NgbCalendarHijri {
  /**
  * Returns the equivalent islamic(civil) date value for a give input Gregorian date.
  * `gDate` is a JS Date to be converted to Hijri.
  */
  fromGregorian(gDate) {
    const gYear = gDate.getFullYear(), gMonth = gDate.getMonth(), gDay = gDate.getDate();
    let julianDay = GREGORIAN_EPOCH2 - 1 + 365 * (gYear - 1) + Math.floor((gYear - 1) / 4) + -Math.floor((gYear - 1) / 100) + Math.floor((gYear - 1) / 400) + Math.floor((367 * (gMonth + 1) - 362) / 12 + (gMonth + 1 <= 2 ? 0 : isGregorianLeapYear2(gDate) ? -1 : -2) + gDay);
    julianDay = Math.floor(julianDay) + 0.5;
    const days = julianDay - ISLAMIC_EPOCH;
    const hYear = Math.floor((30 * days + 10646) / 10631);
    let hMonth = Math.ceil((days - 29 - getIslamicYearStart(hYear)) / 29.5);
    hMonth = Math.min(hMonth, 11);
    const hDay = Math.ceil(days - getIslamicMonthStart(hYear, hMonth)) + 1;
    return new NgbDate(hYear, hMonth + 1, hDay);
  }
  /**
  * Returns the equivalent JS date value for a give input islamic(civil) date.
  * `hDate` is an islamic(civil) date to be converted to Gregorian.
  */
  toGregorian(hDate) {
    const hYear = hDate.year;
    const hMonth = hDate.month - 1;
    const hDay = hDate.day;
    const julianDay = hDay + Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 + Math.floor((3 + 11 * hYear) / 30) + ISLAMIC_EPOCH - 1;
    const wjd = Math.floor(julianDay - 0.5) + 0.5, depoch = wjd - GREGORIAN_EPOCH2, quadricent = Math.floor(depoch / 146097), dqc = mod(depoch, 146097), cent = Math.floor(dqc / 36524), dcent = mod(dqc, 36524), quad = Math.floor(dcent / 1461), dquad = mod(dcent, 1461), yindex = Math.floor(dquad / 365);
    let year = quadricent * 400 + cent * 100 + quad * 4 + yindex;
    if (!(cent === 4 || yindex === 4)) {
      year++;
    }
    const gYearStart = GREGORIAN_EPOCH2 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400);
    const yearday = wjd - gYearStart;
    const tjd = GREGORIAN_EPOCH2 - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor(739 / 12 + (isGregorianLeapYear2(new Date(year, 3, 1)) ? -1 : -2) + 1);
    const leapadj = wjd < tjd ? 0 : isGregorianLeapYear2(new Date(year, 3, 1)) ? 1 : 2;
    const month = Math.floor(((yearday + leapadj) * 12 + 373) / 367);
    const tjd2 = GREGORIAN_EPOCH2 - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor((367 * month - 362) / 12 + (month <= 2 ? 0 : isGregorianLeapYear2(new Date(year, month - 1, 1)) ? -1 : -2) + 1);
    const day = wjd - tjd2 + 1;
    return new Date(year, month - 1, day);
  }
  /**
  * Returns the number of days in a specific Hijri month.
  * `month` is 1 for Muharram, 2 for Safar, etc.
  * `year` is any Hijri year.
  */
  getDaysPerMonth(month, year) {
    year = year + Math.floor(month / 13);
    month = (month - 1) % 12 + 1;
    let length = 29 + month % 2;
    if (month === 12 && isIslamicLeapYear(year)) {
      length++;
    }
    return length;
  }
};
NgbCalendarIslamicCivil.ɵfac = [
  function NgbCalendarIslamicCivil_Factory() {
    return new NgbCalendarIslamicCivil();
  }
];
NgbCalendarIslamicCivil.ɵprov = {
  token: "NgbCalendarIslamicCivil_968e4165"
};
var GREGORIAN_FIRST_DATE = new Date(1882, 10, 12);
var GREGORIAN_LAST_DATE = new Date(2174, 10, 25);
var HIJRI_BEGIN = 1300;
var HIJRI_END = 1600;
var ONE_DAY = 1e3 * 60 * 60 * 24;
var MONTH_LENGTH = [
  // 1300-1304
  "101010101010",
  "110101010100",
  "111011001001",
  "011011010100",
  "011011101010",
  // 1305-1309
  "001101101100",
  "101010101101",
  "010101010101",
  "011010101001",
  "011110010010",
  // 1310-1314
  "101110101001",
  "010111010100",
  "101011011010",
  "010101011100",
  "110100101101",
  // 1315-1319
  "011010010101",
  "011101001010",
  "101101010100",
  "101101101010",
  "010110101101",
  // 1320-1324
  "010010101110",
  "101001001111",
  "010100010111",
  "011010001011",
  "011010100101",
  // 1325-1329
  "101011010101",
  "001011010110",
  "100101011011",
  "010010011101",
  "101001001101",
  // 1330-1334
  "110100100110",
  "110110010101",
  "010110101100",
  "100110110110",
  "001010111010",
  // 1335-1339
  "101001011011",
  "010100101011",
  "101010010101",
  "011011001010",
  "101011101001",
  // 1340-1344
  "001011110100",
  "100101110110",
  "001010110110",
  "100101010110",
  "101011001010",
  // 1345-1349
  "101110100100",
  "101111010010",
  "010111011001",
  "001011011100",
  "100101101101",
  // 1350-1354
  "010101001101",
  "101010100101",
  "101101010010",
  "101110100101",
  "010110110100",
  // 1355-1359
  "100110110110",
  "010101010111",
  "001010010111",
  "010101001011",
  "011010100011",
  // 1360-1364
  "011101010010",
  "101101100101",
  "010101101010",
  "101010101011",
  "010100101011",
  // 1365-1369
  "110010010101",
  "110101001010",
  "110110100101",
  "010111001010",
  "101011010110",
  // 1370-1374
  "100101010111",
  "010010101011",
  "100101001011",
  "101010100101",
  "101101010010",
  // 1375-1379
  "101101101010",
  "010101110101",
  "001001110110",
  "100010110111",
  "010001011011",
  // 1380-1384
  "010101010101",
  "010110101001",
  "010110110100",
  "100111011010",
  "010011011101",
  // 1385-1389
  "001001101110",
  "100100110110",
  "101010101010",
  "110101010100",
  "110110110010",
  // 1390-1394
  "010111010101",
  "001011011010",
  "100101011011",
  "010010101011",
  "101001010101",
  // 1395-1399
  "101101001001",
  "101101100100",
  "101101110001",
  "010110110100",
  "101010110101",
  // 1400-1404
  "101001010101",
  "110100100101",
  "111010010010",
  "111011001001",
  "011011010100",
  // 1405-1409
  "101011101001",
  "100101101011",
  "010010101011",
  "101010010011",
  "110101001001",
  // 1410-1414
  "110110100100",
  "110110110010",
  "101010111001",
  "010010111010",
  "101001011011",
  // 1415-1419
  "010100101011",
  "101010010101",
  "101100101010",
  "101101010101",
  "010101011100",
  // 1420-1424
  "010010111101",
  "001000111101",
  "100100011101",
  "101010010101",
  "101101001010",
  // 1425-1429
  "101101011010",
  "010101101101",
  "001010110110",
  "100100111011",
  "010010011011",
  // 1430-1434
  "011001010101",
  "011010101001",
  "011101010100",
  "101101101010",
  "010101101100",
  // 1435-1439
  "101010101101",
  "010101010101",
  "101100101001",
  "101110010010",
  "101110101001",
  // 1440-1444
  "010111010100",
  "101011011010",
  "010101011010",
  "101010101011",
  "010110010101",
  // 1445-1449
  "011101001001",
  "011101100100",
  "101110101010",
  "010110110101",
  "001010110110",
  // 1450-1454
  "101001010110",
  "111001001101",
  "101100100101",
  "101101010010",
  "101101101010",
  // 1455-1459
  "010110101101",
  "001010101110",
  "100100101111",
  "010010010111",
  "011001001011",
  // 1460-1464
  "011010100101",
  "011010101100",
  "101011010110",
  "010101011101",
  "010010011101",
  // 1465-1469
  "101001001101",
  "110100010110",
  "110110010101",
  "010110101010",
  "010110110101",
  // 1470-1474
  "001011011010",
  "100101011011",
  "010010101101",
  "010110010101",
  "011011001010",
  // 1475-1479
  "011011100100",
  "101011101010",
  "010011110101",
  "001010110110",
  "100101010110",
  // 1480-1484
  "101010101010",
  "101101010100",
  "101111010010",
  "010111011001",
  "001011101010",
  // 1485-1489
  "100101101101",
  "010010101101",
  "101010010101",
  "101101001010",
  "101110100101",
  // 1490-1494
  "010110110010",
  "100110110101",
  "010011010110",
  "101010010111",
  "010101000111",
  // 1495-1499
  "011010010011",
  "011101001001",
  "101101010101",
  "010101101010",
  "101001101011",
  // 1500-1504
  "010100101011",
  "101010001011",
  "110101000110",
  "110110100011",
  "010111001010",
  // 1505-1509
  "101011010110",
  "010011011011",
  "001001101011",
  "100101001011",
  "101010100101",
  // 1510-1514
  "101101010010",
  "101101101001",
  "010101110101",
  "000101110110",
  "100010110111",
  // 1515-1519
  "001001011011",
  "010100101011",
  "010101100101",
  "010110110100",
  "100111011010",
  // 1520-1524
  "010011101101",
  "000101101101",
  "100010110110",
  "101010100110",
  "110101010010",
  // 1525-1529
  "110110101001",
  "010111010100",
  "101011011010",
  "100101011011",
  "010010101011",
  // 1530-1534
  "011001010011",
  "011100101001",
  "011101100010",
  "101110101001",
  "010110110010",
  // 1535-1539
  "101010110101",
  "010101010101",
  "101100100101",
  "110110010010",
  "111011001001",
  // 1540-1544
  "011011010010",
  "101011101001",
  "010101101011",
  "010010101011",
  "101001010101",
  // 1545-1549
  "110100101001",
  "110101010100",
  "110110101010",
  "100110110101",
  "010010111010",
  // 1550-1554
  "101000111011",
  "010010011011",
  "101001001101",
  "101010101010",
  "101011010101",
  // 1555-1559
  "001011011010",
  "100101011101",
  "010001011110",
  "101000101110",
  "110010011010",
  // 1560-1564
  "110101010101",
  "011010110010",
  "011010111001",
  "010010111010",
  "101001011101",
  // 1565-1569
  "010100101101",
  "101010010101",
  "101101010010",
  "101110101000",
  "101110110100",
  // 1570-1574
  "010110111001",
  "001011011010",
  "100101011010",
  "101101001010",
  "110110100100",
  // 1575-1579
  "111011010001",
  "011011101000",
  "101101101010",
  "010101101101",
  "010100110101",
  // 1580-1584
  "011010010101",
  "110101001010",
  "110110101000",
  "110111010100",
  "011011011010",
  // 1585-1589
  "010101011011",
  "001010011101",
  "011000101011",
  "101100010101",
  "101101001010",
  // 1590-1594
  "101110010101",
  "010110101010",
  "101010101110",
  "100100101110",
  "110010001111",
  // 1595-1599
  "010100100111",
  "011010010101",
  "011010101010",
  "101011010110",
  "010101011101",
  // 1600
  "001010011101"
];
function getDaysDiff(date1, date2) {
  const time1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const time2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diff = Math.abs(time1 - time2);
  return Math.round(diff / ONE_DAY);
}
var NgbCalendarIslamicUmalqura = class extends NgbCalendarIslamicCivil {
  /**
  * Returns the equivalent islamic(Umalqura) date value for a give input Gregorian date.
  * `gdate` is s JS Date to be converted to Hijri.
  */
  fromGregorian(gDate) {
    let hDay = 1, hMonth = 0, hYear = 1300;
    let daysDiff = getDaysDiff(gDate, GREGORIAN_FIRST_DATE);
    if (gDate.getTime() - GREGORIAN_FIRST_DATE.getTime() >= 0 && gDate.getTime() - GREGORIAN_LAST_DATE.getTime() <= 0) {
      let year = 1300;
      for (let i = 0; i < MONTH_LENGTH.length; i++, year++) {
        for (let j = 0; j < 12; j++) {
          const numOfDays = +MONTH_LENGTH[i][j] + 29;
          if (daysDiff <= numOfDays) {
            hDay = daysDiff + 1;
            if (hDay > numOfDays) {
              hDay = 1;
              j++;
            }
            if (j > 11) {
              j = 0;
              year++;
            }
            hMonth = j;
            hYear = year;
            return new NgbDate(hYear, hMonth + 1, hDay);
          }
          daysDiff = daysDiff - numOfDays;
        }
      }
      return null;
    } else {
      return super.fromGregorian(gDate);
    }
  }
  /**
  * Converts the current Hijri date to Gregorian.
  */
  toGregorian(hDate) {
    const hYear = hDate.year;
    const hMonth = hDate.month - 1;
    const hDay = hDate.day;
    let gDate = new Date(GREGORIAN_FIRST_DATE);
    let dayDiff = hDay - 1;
    if (hYear >= HIJRI_BEGIN && hYear <= HIJRI_END) {
      for (let y = 0; y < hYear - HIJRI_BEGIN; y++) {
        for (let m = 0; m < 12; m++) {
          dayDiff += +MONTH_LENGTH[y][m] + 29;
        }
      }
      for (let m = 0; m < hMonth; m++) {
        dayDiff += +MONTH_LENGTH[hYear - HIJRI_BEGIN][m] + 29;
      }
      gDate.setDate(GREGORIAN_FIRST_DATE.getDate() + dayDiff);
    } else {
      gDate = super.toGregorian(hDate);
    }
    return gDate;
  }
  /**
  * Returns the number of days in a specific Hijri hMonth.
  * `hMonth` is 1 for Muharram, 2 for Safar, etc.
  * `hYear` is any Hijri hYear.
  */
  getDaysPerMonth(hMonth, hYear) {
    if (hYear >= HIJRI_BEGIN && hYear <= HIJRI_END) {
      const pos = hYear - HIJRI_BEGIN;
      return +MONTH_LENGTH[pos][hMonth - 1] + 29;
    }
    return super.getDaysPerMonth(hMonth, hYear);
  }
};
NgbCalendarIslamicUmalqura.ɵfac = [
  function NgbCalendarIslamicUmalqura_Factory() {
    return new NgbCalendarIslamicUmalqura();
  }
];
NgbCalendarIslamicUmalqura.ɵprov = {
  token: "NgbCalendarIslamicUmalqura_f6f07f6e"
};
function toGregorian4(jalaliDate) {
  const jdn = jalaliToJulian(jalaliDate.year, jalaliDate.month, jalaliDate.day);
  const date = julianToGregorian2(jdn);
  date.setHours(6, 30, 3, 200);
  return date;
}
function fromGregorian4(gdate) {
  const g2d = gregorianToJulian2(gdate.getFullYear(), gdate.getMonth() + 1, gdate.getDate());
  return julianToJalali(g2d);
}
function setJalaliYear(date, yearValue) {
  date.year = +yearValue;
  return date;
}
function setJalaliMonth(date, month) {
  month = +month;
  date.year = date.year + Math.floor((month - 1) / 12);
  date.month = Math.floor(((month - 1) % 12 + 12) % 12) + 1;
  return date;
}
function setJalaliDay(date, day) {
  let mDays = getDaysPerMonth2(date.month, date.year);
  if (day <= 0) {
    while (day <= 0) {
      date = setJalaliMonth(date, date.month - 1);
      mDays = getDaysPerMonth2(date.month, date.year);
      day += mDays;
    }
  } else if (day > mDays) {
    while (day > mDays) {
      day -= mDays;
      date = setJalaliMonth(date, date.month + 1);
      mDays = getDaysPerMonth2(date.month, date.year);
    }
  }
  date.day = day;
  return date;
}
function mod2(a, b) {
  return a - b * Math.floor(a / b);
}
function div(a, b) {
  return Math.trunc(a / b);
}
function jalCal(jalaliYear) {
  const breaks = [
    -61,
    9,
    38,
    199,
    426,
    686,
    756,
    818,
    1111,
    1181,
    1210,
    1635,
    2060,
    2097,
    2192,
    2262,
    2324,
    2394,
    2456,
    3178
  ];
  const breaksLength = breaks.length;
  const gYear = jalaliYear + 621;
  let leapJ = -14;
  let jp = breaks[0];
  if (jalaliYear < jp || jalaliYear >= breaks[breaksLength - 1]) {
    throw new Error("Invalid Jalali year " + jalaliYear);
  }
  let jump = 0;
  for (let i = 1; i < breaksLength; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jalaliYear < jm) {
      break;
    }
    leapJ = leapJ + div(jump, 33) * 8 + div(mod2(jump, 33), 4);
    jp = jm;
  }
  let n = jalaliYear - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod2(n, 33) + 3, 4);
  if (mod2(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }
  const leapG = div(gYear, 4) - div((div(gYear, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod2(mod2(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }
  return {
    leap,
    gy: gYear,
    march
  };
}
function julianToGregorian2(julianDayNumber) {
  let j = 4 * julianDayNumber + 139361631;
  j = j + div(div(4 * julianDayNumber + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod2(j, 1461), 4) * 5 + 308;
  const gDay = div(mod2(i, 153), 5) + 1;
  const gMonth = mod2(div(i, 153), 12) + 1;
  const gYear = div(j, 1461) - 100100 + div(8 - gMonth, 6);
  return new Date(gYear, gMonth - 1, gDay);
}
function gregorianToJulian2(gy, gm, gd) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod2(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}
function julianToJalali(julianDayNumber) {
  let gy = julianToGregorian2(julianDayNumber).getFullYear(), jalaliYear = gy - 621, r = jalCal(jalaliYear), gregorianDay = gregorianToJulian2(gy, 3, r.march), jalaliDay, jalaliMonth, numberOfDays;
  numberOfDays = julianDayNumber - gregorianDay;
  if (numberOfDays >= 0) {
    if (numberOfDays <= 185) {
      jalaliMonth = 1 + div(numberOfDays, 31);
      jalaliDay = mod2(numberOfDays, 31) + 1;
      return new NgbDate(jalaliYear, jalaliMonth, jalaliDay);
    } else {
      numberOfDays -= 186;
    }
  } else {
    jalaliYear -= 1;
    numberOfDays += 179;
    if (r.leap === 1) {
      numberOfDays += 1;
    }
  }
  jalaliMonth = 7 + div(numberOfDays, 30);
  jalaliDay = mod2(numberOfDays, 30) + 1;
  return new NgbDate(jalaliYear, jalaliMonth, jalaliDay);
}
function jalaliToJulian(jYear, jMonth, jDay) {
  const r = jalCal(jYear);
  return gregorianToJulian2(r.gy, 3, r.march) + (jMonth - 1) * 31 - div(jMonth, 7) * (jMonth - 7) + jDay - 1;
}
function getDaysPerMonth2(month, year) {
  if (month <= 6) {
    return 31;
  }
  if (month <= 11) {
    return 30;
  }
  if (jalCal(year).leap === 0) {
    return 30;
  }
  return 29;
}
var NgbCalendarPersian = class extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
    ];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date = setJalaliYear(date, date.year + number);
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = setJalaliMonth(date, date.month + number);
        date.day = 1;
        return date;
      case "d":
        return setJalaliDay(date, date.day + number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = toGregorian4(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = toGregorian4(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    const startDate = toGregorian4(new NgbDate(date.year, 1, 1));
    return Math.floor(Math.round((time - startDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return fromGregorian4(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    return date != null && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) && !isNaN(toGregorian4(date).getTime());
  }
};
NgbCalendarPersian.ɵfac = [
  function NgbCalendarPersian_Factory() {
    return new NgbCalendarPersian();
  }
];
NgbCalendarPersian.ɵprov = {
  token: "NgbCalendarPersian_8882191e"
};

export {
  NgbDateAdapter,
  NgbCalendarGregorian,
  NgbDatepickerI18n,
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbCalendarBuddhist,
  NgbDatepickerI18nAmharic,
  NgbCalendarEthiopian,
  NgbDatepickerI18nHebrew,
  NgbCalendarHebrew,
  NgbCalendarIslamicCivil,
  NgbCalendarIslamicUmalqura,
  NgbCalendarPersian
};
