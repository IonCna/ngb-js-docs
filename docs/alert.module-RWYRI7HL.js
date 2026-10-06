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
} from "./chunk-WXFOXQQP.js";
import {
  NgbNavModule
} from "./chunk-SGQK3IOF.js";
import {
  NgbConfig,
  NgbScrollSpyModule
} from "./chunk-TYQFYSAF.js";
import {
  RouterModule
} from "./chunk-44BCS2Q7.js";
import "./chunk-YZVMAT3C.js";
import {
  NgZone,
  inject,
  ngbRunTransition
} from "./chunk-7GLALTP4.js";
import {
  CommonModule,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// src/app/features/alert/alert.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// src/app/features/alert/alert.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Alert",
      tabs: [
        {
          name: "Examples",
          to: "/components/alert/examples"
        },
        {
          name: "Api",
          to: "/components/alert/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/alerts/",
        ngBootstrap: "components/alert/overview"
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
              id: "simple-alert",
              name: "Simple alert"
            },
            {
              id: "alert-closeable",
              name: "Closeable alerts"
            },
            {
              id: "self-closing-alert",
              name: "Self-closing alert"
            },
            {
              id: "alert-custom",
              name: "Custom alert"
            },
            {
              id: "alert-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./alert-examples-page.component-XHBVIY37.js").then((m) => m.AlertExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-alert",
              name: "NgbAlert"
            },
            {
              id: "ngb-alert-config",
              name: "NgbAlertConfig"
            }
          ]
        },
        loadComponent: () => import("./alert-api-page.component-4J2DACJU.js").then((m) => m.AlertApiPageComponent)
      }
    ],
    title: "Ngb-Js | Alert"
  }
];

// src/app/features/alert/components/alert-closeable/alert-closeable.component.ts
var createAlerts = () => [
  {
    id: 1,
    type: "success",
    message: "Your changes were saved successfully.",
    animation: true
  },
  {
    id: 2,
    type: "danger",
    message: "Something needs your attention.",
    animation: true
  },
  {
    id: 3,
    type: "warning",
    message: "This alert closes without animation.",
    animation: false
  },
  {
    id: 4,
    type: "info",
    message: "This one also closes immediately.",
    animation: false
  }
];
var AlertCloseableComponent = class {
  close(id) {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
  }
  reset() {
    this.alerts = createAlerts();
  }
  constructor() {
    this.alerts = createAlerts();
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-07187b5c],.card[_content-07187b5c],.dropdown-menu[_content-07187b5c],.list-group-item[_content-07187b5c],.form-control[_content-07187b5c],.form-select[_content-07187b5c]{border-color:var(--bs-border-color)}.alert-light[_content-07187b5c]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-07187b5c],.list-group[_content-07187b5c],.dropdown-menu[_content-07187b5c]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-07187b5c],.btn-outline-secondary[_content-07187b5c]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-07187b5c],.form-select[_content-07187b5c]{background-color:var(--bs-body-bg)}code[_content-07187b5c]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AlertCloseableComponent.ɵfac = [
  "$element",
  "$scope",
  function AlertCloseableComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AlertCloseableComponent)();
    return instance;
  }
];
AlertCloseableComponent.ɵcmp = {
  selectors: [
    [
      "docs-alert-closeable"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/alert-closeable.component-11c46194.html",
    "controllerAs": "example"
  }
};
AlertCloseableComponent.ɵfac.ɵcomponent = true;
AlertCloseableComponent.ɵfac.ɵtype = AlertCloseableComponent;

// src/app/features/alert/components/alert-custom/alert-custom.component.ts
var AlertCustomComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert-custom[_content-2aa9c46d]{--bs-alert-color: var(--bs-emphasis-color);--bs-alert-bg: color-mix(in srgb, var(--bs-primary-bg-subtle) 45%, var(--bs-body-bg));--bs-alert-border-color: var(--bs-primary-border-subtle);--bs-alert-link-color: var(--bs-primary-text-emphasis);border-left:.3rem solid var(--bs-primary);box-shadow:0 .75rem 2rem rgba(var(--bs-primary-rgb),.08)}.alert-custom .bi[_content-2aa9c46d]{color:var(--bs-primary)}.alert-custom code[_content-2aa9c46d]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AlertCustomComponent.ɵfac = [
  "$element",
  "$scope",
  function AlertCustomComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AlertCustomComponent)();
    return instance;
  }
];
AlertCustomComponent.ɵcmp = {
  selectors: [
    [
      "docs-alert-custom"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/alert-custom.component-553762c2.html",
    "controllerAs": "example"
  }
};
AlertCustomComponent.ɵfac.ɵcomponent = true;
AlertCustomComponent.ɵfac.ɵtype = AlertCustomComponent;

// ../ngb-js/dist/chunk-IAL525UN.js
var import_angular = __toESM(require_angular(), 1);
var NgbAlertConfig = class {
  get animation() {
    return this._animation ?? this._config.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAlertConfig"] ? globalThis.ɵngjsInjected["NgbAlertConfig"][0] : inject(NgbConfig);
    this.dismissible = true;
    this.type = "warning";
  }
};
NgbAlertConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbAlertConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbAlertConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbAlertConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbAlertConfig.ɵprov = {
  token: "NgbAlertConfig_992fd230",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbAlertConfig_992fd230",
  NgbAlertConfig.ɵfac
]);
var ngbAlertFadingTransition = ({ classList }) => {
  classList.remove("show");
};
var NgbAlert = class {
  get _hostClass() {
    return `alert show${this.type ? ` alert-${this.type}` : ""}`;
  }
  get _fade() {
    return this.animation;
  }
  get _dismissibleClass() {
    return this.dismissible;
  }
  close() {
    const transition = ngbRunTransition(this._zone, this._elementRef.nativeElement, ngbAlertFadingTransition, {
      animation: this.animation,
      runningTransition: "continue"
    });
    transition.subscribe(() => {
      this.closed.emit();
    });
    return transition;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAlert"] ? globalThis.ɵngjsInjected["NgbAlert"][0] : inject(NgbAlertConfig);
    this._elementRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAlert"] ? globalThis.ɵngjsInjected["NgbAlert"][1] : inject(ElementRef);
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAlert"] ? globalThis.ɵngjsInjected["NgbAlert"][2] : inject(NgZone);
    this.animation = this._config.animation;
    this.dismissible = this._config.dismissible;
    this.type = this._config.type;
    this.closed = new EventEmitter();
    this._role = "alert";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "ngb-alert{display:block}";
  document.head.appendChild(s);
})();
NgbAlert.ɵfac = [
  "NgbAlertConfig_992fd230",
  "ElementRef_927308a2",
  "NgZone_31031859",
  "$element",
  "$scope",
  function NgbAlert_Factory(i0, i1, i2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbAlert": [
        i0,
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbAlert)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClass;
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
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._fade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._dismissibleClass;
    }, function(v) {
      v ? $element.addClass("alert-dismissible") : $element.removeClass("alert-dismissible");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
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
      })(instance._hostClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fade);
      (function(v) {
        v ? $element.addClass("alert-dismissible") : $element.removeClass("alert-dismissible");
      })(instance._dismissibleClass);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
    });
    return instance;
  }
];
NgbAlert.ɵcmp = {
  selectors: [
    [
      "ngb-alert"
    ]
  ],
  inputs: {
    "animation": "animation",
    "dismissible": "dismissible",
    "type": "type"
  },
  outputs: {
    "closed": "closed"
  },
  exportAs: [
    "ngbAlert"
  ],
  definition: {
    "template": '<ng-content _content-60d96c0e=""></ng-content>\n\n<button ng-if="$.dismissible" ng-click="$.close()" type="button" class="btn-close" aria-label="Close" _content-60d96c0e="">\n</button>',
    "bindings": {
      "animation": "<?",
      "dismissible": "<?",
      "type": "@?",
      "closed": "&?"
    },
    "transclude": true
  }
};
NgbAlert.ɵfac.ɵcomponent = true;
NgbAlert.ɵfac.ɵtype = NgbAlert;
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
var NgbAlertModule = class {
};
NgbAlertModule.ɵfac = [
  function NgbAlertModule_Factory() {
    return new (this && this.ɵT || NgbAlertModule)();
  }
];
NgbAlertModule.ɵmod = {
  id: "NgbAlertModule_4b914a14",
  controllerAs: "$"
};
import_angular.default.module("NgbAlertModule_4b914a14", [
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
]).component("ngbAlert", {
  controller: NgbAlert.ɵfac,
  template: '<ng-content _content-60d96c0e=""></ng-content>\n\n<button ng-if="$.dismissible" ng-click="$.close()" type="button" class="btn-close" aria-label="Close" _content-60d96c0e="">\n</button>',
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "dismissible": "<?",
    "type": "@?",
    "closed": "&?"
  }
}).directive("ngbAlert", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "closed"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbAlertModule_88050415", NgbAlertModule.ɵfac).run([
  "NgbAlertModule_88050415",
  function() {
  }
]);

// src/app/features/alert/components/alert-global/alert-global.component.ts
var AlertGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      animation: config.animation,
      dismissible: config.dismissible,
      type: config.type
    };
    config.animation = false;
    config.dismissible = false;
    config.type = "success";
  }
  ngOnDestroy() {
    this.config.animation = this.initialConfig.animation;
    this.config.dismissible = this.initialConfig.dismissible;
    this.config.type = this.initialConfig.type;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-1297cfdf],.card[_content-1297cfdf],.dropdown-menu[_content-1297cfdf],.list-group-item[_content-1297cfdf],.form-control[_content-1297cfdf],.form-select[_content-1297cfdf]{border-color:var(--bs-border-color)}.alert-light[_content-1297cfdf]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-1297cfdf],.list-group[_content-1297cfdf],.dropdown-menu[_content-1297cfdf]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-1297cfdf],.btn-outline-secondary[_content-1297cfdf]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-1297cfdf],.form-select[_content-1297cfdf]{background-color:var(--bs-body-bg)}code[_content-1297cfdf]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AlertGlobalComponent.ɵfac = [
  "NgbAlertConfig_992fd230",
  "$element",
  "$scope",
  function AlertGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AlertGlobalComponent)(a0);
    return instance;
  }
];
AlertGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-alert-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/alert-global.component-5500f088.html",
    "controllerAs": "example"
  }
};
AlertGlobalComponent.ɵfac.ɵcomponent = true;
AlertGlobalComponent.ɵfac.ɵtype = AlertGlobalComponent;
AlertGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/alert/components/self-closing-alert/self-closing-alert.component.ts
var SelfClosingAlertComponent = class {
  ngOnInit() {
    this.startTimer();
  }
  ngOnDestroy() {
    this.cancelTimer();
  }
  restart() {
    this.cancelTimer();
    this.remaining = this.initialSeconds;
    this.visible = true;
    this.startTimer();
  }
  onClosed() {
    this.visible = false;
    this.cancelTimer();
  }
  startTimer() {
    this.timer = setTimeout(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        if (this.alert) {
          this.alert.close();
        } else {
          this.visible = false;
        }
        return;
      }
      this.startTimer();
    }, 1e3);
  }
  cancelTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
  }
  constructor() {
    this.initialSeconds = 5;
    this.remaining = this.initialSeconds;
    this.visible = true;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-33543651],.card[_content-33543651],.dropdown-menu[_content-33543651],.list-group-item[_content-33543651],.form-control[_content-33543651],.form-select[_content-33543651]{border-color:var(--bs-border-color)}.alert-light[_content-33543651]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-33543651],.list-group[_content-33543651],.dropdown-menu[_content-33543651]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-33543651],.btn-outline-secondary[_content-33543651]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-33543651],.form-select[_content-33543651]{background-color:var(--bs-body-bg)}code[_content-33543651]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
SelfClosingAlertComponent.ɵfac = [
  "$element",
  "$scope",
  function SelfClosingAlertComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SelfClosingAlertComponent)();
    return instance;
  }
];
SelfClosingAlertComponent.ɵcmp = {
  selectors: [
    [
      "docs-self-closing-alert"
    ]
  ],
  inputs: {},
  outputs: {},
  viewQueries: [
    {
      propertyName: "alert",
      first: true,
      descendants: true,
      static: false,
      predicate: [
        "alert"
      ]
    }
  ],
  definition: {
    "templateUrl": "templates/self-closing-alert.component-a407b7cd.html",
    "controllerAs": "example"
  }
};
SelfClosingAlertComponent.ɵfac.ɵcomponent = true;
SelfClosingAlertComponent.ɵfac.ɵtype = SelfClosingAlertComponent;
SelfClosingAlertComponent.prototype.$onInit = function() {
  this.ngOnInit();
};
SelfClosingAlertComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/alert/components/simple-alert/simple-alert.component.ts
var SimpleAlertComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-c63e7b0d],.card[_content-c63e7b0d],.dropdown-menu[_content-c63e7b0d],.list-group-item[_content-c63e7b0d],.form-control[_content-c63e7b0d],.form-select[_content-c63e7b0d]{border-color:var(--bs-border-color)}.alert-light[_content-c63e7b0d]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-c63e7b0d],.list-group[_content-c63e7b0d],.dropdown-menu[_content-c63e7b0d]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-c63e7b0d],.btn-outline-secondary[_content-c63e7b0d]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-c63e7b0d],.form-select[_content-c63e7b0d]{background-color:var(--bs-body-bg)}code[_content-c63e7b0d]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
SimpleAlertComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleAlertComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SimpleAlertComponent)();
    return instance;
  }
];
SimpleAlertComponent.ɵcmp = {
  selectors: [
    [
      "docs-simple-alert"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/simple-alert.component-f9b05b4c.html",
    "controllerAs": "example"
  }
};
SimpleAlertComponent.ɵfac.ɵcomponent = true;
SimpleAlertComponent.ɵfac.ɵtype = SimpleAlertComponent;

// src/app/features/alert/alert.module.ts
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
var AlertModule = class {
};
AlertModule.ɵfac = [
  function AlertModule_Factory() {
    return new (this && this.ɵT || AlertModule)();
  }
];
var ɵAlertModule_import0 = RouterModule.forChild(routes);
AlertModule.ɵmod = {
  id: "AlertModule_816e9736"
};
ɵimportProviders(import_angular2.default.module("AlertModule_816e9736", [
  typeof NgbAlertModule === "string" ? NgbAlertModule : NgbAlertModule.ɵmod ? NgbAlertModule.ɵmod.id : NgbAlertModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵAlertModule_import0)
]), [
  ɵAlertModule_import0
]).component("docsAlertCloseable", {
  controller: AlertCloseableComponent.ɵfac,
  templateUrl: "templates/alert-closeable.component-11c46194.html",
  controllerAs: "example"
}).component("docsAlertCustom", {
  controller: AlertCustomComponent.ɵfac,
  templateUrl: "templates/alert-custom.component-553762c2.html",
  controllerAs: "example"
}).component("docsAlertGlobal", {
  controller: AlertGlobalComponent.ɵfac,
  templateUrl: "templates/alert-global.component-5500f088.html",
  controllerAs: "example"
}).component("docsSelfClosingAlert", {
  controller: SelfClosingAlertComponent.ɵfac,
  templateUrl: "templates/self-closing-alert.component-a407b7cd.html",
  controllerAs: "example"
}).component("docsSimpleAlert", {
  controller: SimpleAlertComponent.ɵfac,
  templateUrl: "templates/simple-alert.component-f9b05b4c.html",
  controllerAs: "example"
}).factory("AlertModule_b9ee769c", AlertModule.ɵfac).run([
  "AlertModule_b9ee769c",
  function() {
  }
]);
export {
  AlertModule
};
