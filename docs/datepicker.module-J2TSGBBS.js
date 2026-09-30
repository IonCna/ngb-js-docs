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
  NgbCalendarGregorian,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDatepickerModule
} from "./chunk-HTNRKNEL.js";
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
import "./chunk-26Q6D6UX.js";
import {
  require_angular
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/datepicker/datepicker.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/features/datepicker/datepicker.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Datepicker",
      tabs: [
        {
          name: "Examples",
          to: "/components/datepicker/examples"
        },
        {
          name: "Api",
          to: "/components/datepicker/api"
        },
        {
          name: "Calendars",
          to: "/components/datepicker/calendars"
        }
      ],
      externalLinks: {
        ngBootstrap: "components/datepicker/overview"
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
              id: "basic-datepicker",
              name: "Basic"
            },
            {
              id: "popup-datepicker",
              name: "Popup"
            },
            {
              id: "multiple-months-datepicker",
              name: "Multiple months"
            },
            {
              id: "range-datepicker",
              name: "Range selection"
            },
            {
              id: "range-popup-datepicker",
              name: "Range in a popup"
            },
            {
              id: "disabled-datepicker",
              name: "Disabled"
            },
            {
              id: "datepicker-custom-adapter",
              name: "Adapter and formatter"
            },
            {
              id: "datepicker-i18n",
              name: "Internationalization"
            },
            {
              id: "datepicker-custom-day",
              name: "Custom day"
            },
            {
              id: "datepicker-custom-month",
              name: "Custom month layout"
            },
            {
              id: "datepicker-footer",
              name: "Footer template"
            },
            {
              id: "datepicker-position-target",
              name: "Position target"
            },
            {
              id: "datepicker-keyboard",
              name: "Keyboard navigation"
            },
            {
              id: "datepicker-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./datepicker-examples-page.component-KMGFE5TH.js").then((m) => m.DatepickerExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-datepicker",
              name: "NgbDatepicker"
            },
            {
              id: "ngb-input-datepicker",
              name: "NgbInputDatepicker"
            },
            {
              id: "ngb-datepicker-config",
              name: "NgbDatepickerConfig"
            },
            {
              id: "ngb-input-datepicker-config",
              name: "NgbInputDatepickerConfig"
            },
            {
              id: "ngb-datepicker-extension-contracts",
              name: "Extension contracts"
            }
          ]
        },
        loadComponent: () => import("./datepicker-api-page.component-G5LNZ3QH.js").then((m) => m.DatepickerApiPageComponent)
      },
      {
        path: "calendars",
        data: {
          sections: [
            {
              id: "calendar-hebrew",
              name: "Hebrew"
            },
            {
              id: "calendar-jalali",
              name: "Jalali"
            },
            {
              id: "calendar-islamic-civil",
              name: "Islamic Civil"
            },
            {
              id: "calendar-islamic-umalqura",
              name: "Islamic Umm al-Qura"
            },
            {
              id: "calendar-buddhist",
              name: "Buddhist"
            },
            {
              id: "calendar-ethiopian",
              name: "Ethiopian"
            },
            {
              id: "calendar-intergalactic",
              name: "Intergalactic Standard"
            }
          ]
        },
        loadComponent: () => import("./datepicker-calendars-page.component-YWQR2QJB.js").then((m) => m.DatepickerCalendarsPageComponent)
      }
    ]
  }
];

// src/app/features/datepicker/components/basic-datepicker/basic-datepicker.component.ts
var BasicDatepickerComponent = class {
  constructor(calendar) {
    this.today = calendar.getToday();
  }
};
(function() {
  var h = "styles/basic-datepicker.component-ddf0563a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
BasicDatepickerComponent.ɵfac = [
  "NgbCalendar_5acf56e4",
  "$element",
  "$scope",
  function BasicDatepickerComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new BasicDatepickerComponent(a0);
    return instance;
  }
];
BasicDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-basic-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/basic-datepicker.component-2e549afd.html",
    "controllerAs": "example"
  }
};
BasicDatepickerComponent.ɵfac.ɵcomponent = true;
BasicDatepickerComponent.ɵfac.ɵtype = BasicDatepickerComponent;

// src/app/features/datepicker/components/datepicker-custom-adapter/datepicker-custom-adapter.component.ts
var StringDateAdapter = class extends NgbDateAdapter {
  fromModel(value) {
    if (!value) return null;
    const [year, month, day] = value.split("/").map(Number);
    return year && month && day ? {
      year,
      month,
      day
    } : null;
  }
  toModel(date) {
    return date ? `${date.year}/${date.month}/${date.day}` : null;
  }
};
var DotDateParserFormatter = class extends NgbDateParserFormatter {
  parse(value) {
    const [day, month, year] = value.split(".").map(Number);
    return day && month && year ? {
      year,
      month,
      day
    } : null;
  }
  format(date) {
    return date ? `${String(date.day).padStart(2, "0")}.${String(date.month).padStart(2, "0")}.${date.year}` : "";
  }
};
var DatepickerCustomAdapterComponent = class {
  constructor() {
    this.adapter = new StringDateAdapter();
    this.formatter = new DotDateParserFormatter();
    this.date = "2026/8/24";
  }
};
(function() {
  var h = "styles/datepicker-custom-adapter.component-6569448b.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerCustomAdapterComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerCustomAdapterComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerCustomAdapterComponent();
    return instance;
  }
];
DatepickerCustomAdapterComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-custom-adapter"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-custom-adapter.component-a275bedb.html",
    "controllerAs": "example"
  }
};
DatepickerCustomAdapterComponent.ɵfac.ɵcomponent = true;
DatepickerCustomAdapterComponent.ɵfac.ɵtype = DatepickerCustomAdapterComponent;

// src/app/features/datepicker/components/datepicker-custom-day/datepicker-custom-day.component.ts
var DatepickerCustomDayComponent = class {
  dayData(date) {
    const weekday = new Date(date.year, date.month - 1, date.day).getDay();
    return {
      weekend: weekday === 0 || weekday === 6
    };
  }
  constructor() {
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/datepicker-custom-day.component-139cb817.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerCustomDayComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerCustomDayComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerCustomDayComponent();
    return instance;
  }
];
DatepickerCustomDayComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-custom-day"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-custom-day.component-94ab0199.html",
    "controllerAs": "example"
  }
};
DatepickerCustomDayComponent.ɵfac.ɵcomponent = true;
DatepickerCustomDayComponent.ɵfac.ɵtype = DatepickerCustomDayComponent;

// src/app/features/datepicker/components/datepicker-custom-month/datepicker-custom-month.component.ts
var DatepickerCustomMonthComponent = class {
  previous(datepicker) {
    datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1));
  }
  next(datepicker) {
    datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1));
  }
  today(datepicker) {
    datepicker.navigateTo(datepicker.calendar.getToday());
  }
};
(function() {
  var h = "styles/datepicker-custom-month.component-0e4bc584.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerCustomMonthComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerCustomMonthComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerCustomMonthComponent();
    return instance;
  }
];
DatepickerCustomMonthComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-custom-month"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-custom-month.component-ac61eb24.html",
    "controllerAs": "example"
  }
};
DatepickerCustomMonthComponent.ɵfac.ɵcomponent = true;
DatepickerCustomMonthComponent.ɵfac.ɵtype = DatepickerCustomMonthComponent;

// src/app/features/datepicker/components/datepicker-footer/datepicker-footer.component.ts
var DatepickerFooterComponent = class {
  today() {
    if (this.datepicker) this.date = this.datepicker.calendar.getToday();
  }
  clear() {
    this.date = null;
  }
  constructor() {
    this.date = null;
  }
};
(function() {
  var h = "styles/datepicker-footer.component-56348c0a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerFooterComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerFooterComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerFooterComponent();
    return instance;
  }
];
DatepickerFooterComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-footer"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-footer.component-a31c0427.html",
    "controllerAs": "example"
  }
};
DatepickerFooterComponent.ɵfac.ɵcomponent = true;
DatepickerFooterComponent.ɵfac.ɵtype = DatepickerFooterComponent;

// src/app/features/datepicker/components/datepicker-global/datepicker-global.component.ts
var DatepickerGlobalComponent = class {
  constructor(config, inputConfig) {
    this.config = config;
    this.inputConfig = inputConfig;
    this.inlineDate = {
      year: 2026,
      month: 8,
      day: 24
    };
    this.popupDate = {
      year: 2026,
      month: 8,
      day: 24
    };
    this.inlineDefaults = this.capture(config);
    this.inputDefaults = this.capture(inputConfig);
    Object.assign(config, {
      displayMonths: 2,
      navigation: "arrows",
      outsideDays: "hidden",
      showWeekNumbers: true,
      weekdays: "short"
    });
    Object.assign(inputConfig, {
      displayMonths: 2,
      navigation: "arrows",
      outsideDays: "hidden",
      showWeekNumbers: true,
      weekdays: "short"
    });
  }
  ngAfterViewInit() {
    this.restore();
  }
  ngOnDestroy() {
    this.restore();
  }
  capture(config) {
    return {
      displayMonths: config.displayMonths,
      navigation: config.navigation,
      outsideDays: config.outsideDays,
      showWeekNumbers: config.showWeekNumbers,
      weekdays: config.weekdays
    };
  }
  restore() {
    Object.assign(this.config, this.inlineDefaults);
    Object.assign(this.inputConfig, this.inputDefaults);
  }
};
(function() {
  var h = "styles/datepicker-global.component-1b177de2.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerGlobalComponent.ɵfac = [
  "NgbDatepickerConfig_32959658",
  "NgbInputDatepickerConfig_4a9881f2",
  "$element",
  "$scope",
  function DatepickerGlobalComponent_Factory(a0, a1, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerGlobalComponent(a0, a1);
    return instance;
  }
];
DatepickerGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-global.component-e26933a5.html",
    "controllerAs": "example"
  }
};
DatepickerGlobalComponent.ɵfac.ɵcomponent = true;
DatepickerGlobalComponent.ɵfac.ɵtype = DatepickerGlobalComponent;
DatepickerGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
DatepickerGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/datepicker/components/datepicker-i18n/datepicker-i18n.component.ts
var SpanishDatepickerI18n = class extends NgbDatepickerI18n {
  getWeekdayLabel(weekday) {
    return this.weekdays[weekday - 1] ?? "";
  }
  getMonthShortName(month) {
    return this.months[month - 1]?.slice(0, 3) ?? "";
  }
  getMonthFullName(month) {
    return this.months[month - 1] ?? "";
  }
  getDayAriaLabel(date) {
    return `${date.day} de ${this.getMonthFullName(date.month)} de ${date.year}`;
  }
  constructor(...args) {
    super(...args), this.months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre"
    ], this.weekdays = [
      "L",
      "M",
      "X",
      "J",
      "V",
      "S",
      "D"
    ];
  }
};
var DatepickerI18nComponent = class {
  constructor() {
    this.i18n = new SpanishDatepickerI18n();
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/datepicker-i18n.component-5d416b6e.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerI18nComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerI18nComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerI18nComponent();
    return instance;
  }
];
DatepickerI18nComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-i18n"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-i18n.component-f7fa30e0.html",
    "controllerAs": "example"
  }
};
DatepickerI18nComponent.ɵfac.ɵcomponent = true;
DatepickerI18nComponent.ɵfac.ɵtype = DatepickerI18nComponent;

// src/app/features/datepicker/components/datepicker-keyboard/datepicker-keyboard.component.ts
var DatepickerKeyboardComponent = class {
  onKeydown(event) {
    if (!this.datepicker || event.key !== "[" && event.key !== "]") return;
    const direction = event.key === "[" ? -1 : 1;
    const target = direction < 0 ? this.datepicker.calendar.getPrev(this.datepicker.state.firstDate, "m", 1) : this.datepicker.calendar.getNext(this.datepicker.state.firstDate, "m", 1);
    this.datepicker.navigateTo(target);
    event.preventDefault();
    event.stopPropagation();
  }
  constructor() {
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/datepicker-keyboard.component-cc1d1524.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerKeyboardComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerKeyboardComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerKeyboardComponent();
    return instance;
  }
];
DatepickerKeyboardComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-keyboard"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-keyboard.component-bb9b18fa.html",
    "controllerAs": "example"
  }
};
DatepickerKeyboardComponent.ɵfac.ɵcomponent = true;
DatepickerKeyboardComponent.ɵfac.ɵtype = DatepickerKeyboardComponent;

// src/app/features/datepicker/components/datepicker-position-target/datepicker-position-target.component.ts
var DatepickerPositionTargetComponent = class {
  constructor() {
    this.date = null;
    this.target = "#datepicker-custom-position-target";
  }
};
(function() {
  var h = "styles/datepicker-position-target.component-dabfe76e.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DatepickerPositionTargetComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerPositionTargetComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DatepickerPositionTargetComponent();
    return instance;
  }
];
DatepickerPositionTargetComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-position-target"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-position-target.component-904fbd5b.html",
    "controllerAs": "example"
  }
};
DatepickerPositionTargetComponent.ɵfac.ɵcomponent = true;
DatepickerPositionTargetComponent.ɵfac.ɵtype = DatepickerPositionTargetComponent;

// src/app/features/datepicker/components/disabled-datepicker/disabled-datepicker.component.ts
var DisabledDatepickerComponent = class {
  constructor() {
    this.disabled = true;
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/disabled-datepicker.component-226008dc.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DisabledDatepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function DisabledDatepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DisabledDatepickerComponent();
    return instance;
  }
];
DisabledDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-disabled-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/disabled-datepicker.component-73b1f886.html",
    "controllerAs": "example"
  }
};
DisabledDatepickerComponent.ɵfac.ɵcomponent = true;
DisabledDatepickerComponent.ɵfac.ɵtype = DisabledDatepickerComponent;

// src/app/features/datepicker/components/multiple-months-datepicker/multiple-months-datepicker.component.ts
var MultipleMonthsDatepickerComponent = class {
  constructor() {
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/multiple-months-datepicker.component-b80f75bd.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
MultipleMonthsDatepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function MultipleMonthsDatepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new MultipleMonthsDatepickerComponent();
    return instance;
  }
];
MultipleMonthsDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-multiple-months-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/multiple-months-datepicker.component-f828b361.html",
    "controllerAs": "example"
  }
};
MultipleMonthsDatepickerComponent.ɵfac.ɵcomponent = true;
MultipleMonthsDatepickerComponent.ɵfac.ɵtype = MultipleMonthsDatepickerComponent;

// src/app/features/datepicker/components/popup-datepicker/popup-datepicker.component.ts
var PopupDatepickerComponent = class {
  constructor() {
    this.date = {
      year: 2026,
      month: 8,
      day: 24
    };
  }
};
(function() {
  var h = "styles/popup-datepicker.component-9cee11a9.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PopupDatepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function PopupDatepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PopupDatepickerComponent();
    return instance;
  }
];
PopupDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-popup-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popup-datepicker.component-f7d68df9.html",
    "controllerAs": "example"
  }
};
PopupDatepickerComponent.ɵfac.ɵcomponent = true;
PopupDatepickerComponent.ɵfac.ɵtype = PopupDatepickerComponent;

// src/app/features/datepicker/components/range-datepicker/range-datepicker.component.ts
var RangeDatepickerComponent = class {
  select(date) {
    if (!this.fromDate || this.toDate) {
      this.fromDate = date;
      this.toDate = null;
    } else if (date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.fromDate = date;
    }
  }
  isHovered(date) {
    return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  isInside(date) {
    return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }
  isRange(date) {
    return date.equals(this.fromDate) || !!this.toDate && date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }
  constructor() {
    this.calendar = new NgbCalendarGregorian();
    this.hoveredDate = null;
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.fromDate, "d", 10);
  }
};
(function() {
  var h = "styles/range-datepicker.component-732d1b0a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
RangeDatepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function RangeDatepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new RangeDatepickerComponent();
    return instance;
  }
];
RangeDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-range-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/range-datepicker.component-af8153d7.html",
    "controllerAs": "example"
  }
};
RangeDatepickerComponent.ɵfac.ɵcomponent = true;
RangeDatepickerComponent.ɵfac.ɵtype = RangeDatepickerComponent;

// src/app/features/datepicker/components/range-popup-datepicker/range-popup-datepicker.component.ts
var RangePopupDatepickerComponent = class {
  select(date) {
    if (!this.fromDate || this.toDate) {
      this.fromDate = date;
      this.toDate = null;
    } else if (date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.fromDate = date;
    }
    this.model = date;
  }
  isHovered(date) {
    return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  isInside(date) {
    return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }
  isRange(date) {
    return date.equals(this.fromDate) || !!this.toDate && date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }
  constructor() {
    this.calendar = new NgbCalendarGregorian();
    this.hoveredDate = null;
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.fromDate, "d", 7);
    this.model = this.fromDate;
  }
};
(function() {
  var h = "styles/range-popup-datepicker.component-426b7094.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
RangePopupDatepickerComponent.ɵfac = [
  "$element",
  "$scope",
  function RangePopupDatepickerComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new RangePopupDatepickerComponent();
    return instance;
  }
];
RangePopupDatepickerComponent.ɵcmp = {
  selectors: [
    [
      "docs-range-popup-datepicker"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/range-popup-datepicker.component-01a043b5.html",
    "controllerAs": "example"
  }
};
RangePopupDatepickerComponent.ɵfac.ɵcomponent = true;
RangePopupDatepickerComponent.ɵfac.ɵtype = RangePopupDatepickerComponent;

// src/app/features/datepicker/datepicker.module.ts
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
var DatepickerModule = class {
};
DatepickerModule.ɵfac = [
  function DatepickerModule_Factory() {
    return new DatepickerModule();
  }
];
var ɵDatepickerModule_import0 = RouterModule.forChild(routes);
DatepickerModule.ɵmod = {
  id: "DatepickerModule_d3071f07"
};
ɵimportProviders(import_angular.default.module("DatepickerModule_d3071f07", [
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbDatepickerModule === "string" ? NgbDatepickerModule : NgbDatepickerModule.ɵmod ? NgbDatepickerModule.ɵmod.id : NgbDatepickerModule.name,
  ɵimportedModuleName(ɵDatepickerModule_import0)
]), [
  ɵDatepickerModule_import0
]).component("docsBasicDatepicker", {
  controller: BasicDatepickerComponent.ɵfac,
  templateUrl: "templates/basic-datepicker.component-2e549afd.html",
  controllerAs: "example"
}).component("docsDatepickerCustomAdapter", {
  controller: DatepickerCustomAdapterComponent.ɵfac,
  templateUrl: "templates/datepicker-custom-adapter.component-a275bedb.html",
  controllerAs: "example"
}).component("docsDatepickerCustomDay", {
  controller: DatepickerCustomDayComponent.ɵfac,
  templateUrl: "templates/datepicker-custom-day.component-94ab0199.html",
  controllerAs: "example"
}).component("docsDatepickerCustomMonth", {
  controller: DatepickerCustomMonthComponent.ɵfac,
  templateUrl: "templates/datepicker-custom-month.component-ac61eb24.html",
  controllerAs: "example"
}).component("docsDatepickerFooter", {
  controller: DatepickerFooterComponent.ɵfac,
  templateUrl: "templates/datepicker-footer.component-a31c0427.html",
  controllerAs: "example"
}).component("docsDatepickerGlobal", {
  controller: DatepickerGlobalComponent.ɵfac,
  templateUrl: "templates/datepicker-global.component-e26933a5.html",
  controllerAs: "example"
}).component("docsDatepickerI18n", {
  controller: DatepickerI18nComponent.ɵfac,
  templateUrl: "templates/datepicker-i18n.component-f7fa30e0.html",
  controllerAs: "example"
}).component("docsDatepickerKeyboard", {
  controller: DatepickerKeyboardComponent.ɵfac,
  templateUrl: "templates/datepicker-keyboard.component-bb9b18fa.html",
  controllerAs: "example"
}).component("docsDatepickerPositionTarget", {
  controller: DatepickerPositionTargetComponent.ɵfac,
  templateUrl: "templates/datepicker-position-target.component-904fbd5b.html",
  controllerAs: "example"
}).component("docsDisabledDatepicker", {
  controller: DisabledDatepickerComponent.ɵfac,
  templateUrl: "templates/disabled-datepicker.component-73b1f886.html",
  controllerAs: "example"
}).component("docsMultipleMonthsDatepicker", {
  controller: MultipleMonthsDatepickerComponent.ɵfac,
  templateUrl: "templates/multiple-months-datepicker.component-f828b361.html",
  controllerAs: "example"
}).component("docsPopupDatepicker", {
  controller: PopupDatepickerComponent.ɵfac,
  templateUrl: "templates/popup-datepicker.component-f7d68df9.html",
  controllerAs: "example"
}).component("docsRangeDatepicker", {
  controller: RangeDatepickerComponent.ɵfac,
  templateUrl: "templates/range-datepicker.component-af8153d7.html",
  controllerAs: "example"
}).component("docsRangePopupDatepicker", {
  controller: RangePopupDatepickerComponent.ɵfac,
  templateUrl: "templates/range-popup-datepicker.component-01a043b5.html",
  controllerAs: "example"
}).factory("DatepickerModule_f6e256e1", DatepickerModule.ɵfac).run([
  "DatepickerModule_f6e256e1",
  function() {
  }
]);
export {
  DatepickerModule
};
