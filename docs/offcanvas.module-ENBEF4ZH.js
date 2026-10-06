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
  NgbOffcanvasModule
} from "./chunk-PCXZDXJE.js";
import {
  NgbCollapseModule
} from "./chunk-WXFOXQQP.js";
import {
  NgbNavModule
} from "./chunk-SGQK3IOF.js";
import {
  NgbScrollSpyModule
} from "./chunk-TYQFYSAF.js";
import {
  RouterModule
} from "./chunk-44BCS2Q7.js";
import "./chunk-YZVMAT3C.js";
import {
  TemplateRef
} from "./chunk-7GLALTP4.js";
import {
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// src/app/features/offcanvas/offcanvas.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/features/offcanvas/offcanvas.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Offcanvas",
      tabs: [
        {
          name: "Examples",
          to: "/components/offcanvas/examples"
        },
        {
          name: "Api",
          to: "/components/offcanvas/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/offcanvas/",
        ngBootstrap: "components/offcanvas/overview"
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
              id: "offcanvas-default",
              name: "Default options"
            },
            {
              id: "offcanvas-component-content",
              name: "Component content"
            },
            {
              id: "offcanvas-focus",
              name: "Focus management"
            },
            {
              id: "offcanvas-options",
              name: "Offcanvas options"
            },
            {
              id: "offcanvas-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./offcanvas-examples-page.component-YQ4DBMRK.js").then((m) => m.OffcanvasExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-offcanvas",
              name: "NgbOffcanvas"
            },
            {
              id: "ngb-offcanvas-ref",
              name: "NgbOffcanvasRef"
            },
            {
              id: "ngb-active-offcanvas",
              name: "NgbActiveOffcanvas"
            },
            {
              id: "ngb-offcanvas-config",
              name: "NgbOffcanvasConfig"
            }
          ]
        },
        loadComponent: () => import("./offcanvas-api-page.component-5AWVTISQ.js").then((m) => m.OffcanvasApiPageComponent)
      }
    ]
  }
];

// src/app/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component.ts
var OffcanvasDemoContentComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-68f3d054],.card[_content-68f3d054],.dropdown-menu[_content-68f3d054],.list-group-item[_content-68f3d054],.form-control[_content-68f3d054],.form-select[_content-68f3d054]{border-color:var(--bs-border-color)}.alert-light[_content-68f3d054]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-68f3d054],.list-group[_content-68f3d054],.dropdown-menu[_content-68f3d054]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-68f3d054],.btn-outline-secondary[_content-68f3d054]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-68f3d054],.form-select[_content-68f3d054]{background-color:var(--bs-body-bg)}code[_content-68f3d054]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasDemoContentComponent.ɵfac = [
  "$element",
  "$scope",
  function OffcanvasDemoContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasDemoContentComponent)();
    return instance;
  }
];
OffcanvasDemoContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-demo-content"
    ]
  ],
  inputs: {
    "ngbActiveOffcanvas": "ngbActiveOffcanvas"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-demo-content.component-8d4707cf.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveOffcanvas": "<?"
    }
  }
};
OffcanvasDemoContentComponent.ɵfac.ɵcomponent = true;
OffcanvasDemoContentComponent.ɵfac.ɵtype = OffcanvasDemoContentComponent;

// src/app/features/offcanvas/components/offcanvas-component-content/offcanvas-component-content.component.ts
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
var OffcanvasComponentContentComponent = class {
  constructor(offcanvas) {
    this.offcanvas = offcanvas;
    this.lastResult = "No result yet";
  }
  open() {
    return _async_to_generator(function* () {
      const offcanvasRef = yield this.offcanvas.open(OffcanvasDemoContentComponent);
      offcanvasRef.closed.subscribe((result) => {
        this.lastResult = `Closed with: ${result}`;
      });
      offcanvasRef.dismissed.subscribe((reason) => {
        this.lastResult = `Dismissed with: ${reason}`;
      });
    }).call(this);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-0a2d56f9],.card[_content-0a2d56f9],.dropdown-menu[_content-0a2d56f9],.list-group-item[_content-0a2d56f9],.form-control[_content-0a2d56f9],.form-select[_content-0a2d56f9]{border-color:var(--bs-border-color)}.alert-light[_content-0a2d56f9]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-0a2d56f9],.list-group[_content-0a2d56f9],.dropdown-menu[_content-0a2d56f9]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-0a2d56f9],.btn-outline-secondary[_content-0a2d56f9]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-0a2d56f9],.form-select[_content-0a2d56f9]{background-color:var(--bs-body-bg)}code[_content-0a2d56f9]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasComponentContentComponent.ɵfac = [
  "NgbOffcanvas_51c49d46",
  "$element",
  "$scope",
  function OffcanvasComponentContentComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasComponentContentComponent)(a0);
    return instance;
  }
];
OffcanvasComponentContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-component-content"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-component-content.component-ae337a6f.html",
    "controllerAs": "example"
  }
};
OffcanvasComponentContentComponent.ɵfac.ɵcomponent = true;
OffcanvasComponentContentComponent.ɵfac.ɵtype = OffcanvasComponentContentComponent;

// src/app/features/offcanvas/components/offcanvas-default/offcanvas-default.component.ts
var OffcanvasDefaultComponent = class {
  constructor(offcanvas) {
    this.offcanvas = offcanvas;
  }
  open() {
    this.offcanvas.open(this.content);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-5448087f],.card[_content-5448087f],.dropdown-menu[_content-5448087f],.list-group-item[_content-5448087f],.form-control[_content-5448087f],.form-select[_content-5448087f]{border-color:var(--bs-border-color)}.alert-light[_content-5448087f]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-5448087f],.list-group[_content-5448087f],.dropdown-menu[_content-5448087f]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-5448087f],.btn-outline-secondary[_content-5448087f]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-5448087f],.form-select[_content-5448087f]{background-color:var(--bs-body-bg)}code[_content-5448087f]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasDefaultComponent.ɵfac = [
  "NgbOffcanvas_51c49d46",
  "$element",
  "$scope",
  function OffcanvasDefaultComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasDefaultComponent)(a0);
    return instance;
  }
];
OffcanvasDefaultComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-default"
    ]
  ],
  inputs: {},
  outputs: {},
  viewQueries: [
    {
      propertyName: "content",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "content"
      ],
      get read() {
        return TemplateRef;
      }
    }
  ],
  definition: {
    "templateUrl": "templates/offcanvas-default.component-60ef7408.html",
    "controllerAs": "example"
  }
};
OffcanvasDefaultComponent.ɵfac.ɵcomponent = true;
OffcanvasDefaultComponent.ɵfac.ɵtype = OffcanvasDefaultComponent;

// src/app/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component.ts
var OffcanvasFocusContentComponent = class {
  constructor() {
    this.autofocus = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-486788d3],.card[_content-486788d3],.dropdown-menu[_content-486788d3],.list-group-item[_content-486788d3],.form-control[_content-486788d3],.form-select[_content-486788d3]{border-color:var(--bs-border-color)}.alert-light[_content-486788d3]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-486788d3],.list-group[_content-486788d3],.dropdown-menu[_content-486788d3]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-486788d3],.btn-outline-secondary[_content-486788d3]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-486788d3],.form-select[_content-486788d3]{background-color:var(--bs-body-bg)}code[_content-486788d3]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasFocusContentComponent.ɵfac = [
  "$element",
  "$scope",
  function OffcanvasFocusContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasFocusContentComponent)();
    return instance;
  }
];
OffcanvasFocusContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-focus-content"
    ]
  ],
  inputs: {
    "ngbActiveOffcanvas": "ngbActiveOffcanvas",
    "autofocus": "autofocus"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-focus-content.component-6bb99332.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveOffcanvas": "<?",
      "autofocus": "<?"
    }
  }
};
OffcanvasFocusContentComponent.ɵfac.ɵcomponent = true;
OffcanvasFocusContentComponent.ɵfac.ɵtype = OffcanvasFocusContentComponent;

// src/app/features/offcanvas/components/offcanvas-focus/offcanvas-focus.component.ts
var OffcanvasFocusComponent = class {
  constructor(offcanvas) {
    this.offcanvas = offcanvas;
  }
  openDefaultFocus() {
    this.offcanvas.open(OffcanvasFocusContentComponent, {
      ariaLabelledBy: "offcanvas-focus-title",
      bindings: {
        autofocus: false
      }
    });
  }
  openCustomFocus() {
    this.offcanvas.open(OffcanvasFocusContentComponent, {
      ariaLabelledBy: "offcanvas-focus-title",
      bindings: {
        autofocus: true
      }
    });
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-1d6f37eb],.card[_content-1d6f37eb],.dropdown-menu[_content-1d6f37eb],.list-group-item[_content-1d6f37eb],.form-control[_content-1d6f37eb],.form-select[_content-1d6f37eb]{border-color:var(--bs-border-color)}.alert-light[_content-1d6f37eb]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-1d6f37eb],.list-group[_content-1d6f37eb],.dropdown-menu[_content-1d6f37eb]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-1d6f37eb],.btn-outline-secondary[_content-1d6f37eb]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-1d6f37eb],.form-select[_content-1d6f37eb]{background-color:var(--bs-body-bg)}code[_content-1d6f37eb]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasFocusComponent.ɵfac = [
  "NgbOffcanvas_51c49d46",
  "$element",
  "$scope",
  function OffcanvasFocusComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasFocusComponent)(a0);
    return instance;
  }
];
OffcanvasFocusComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-focus"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-focus.component-efe1c651.html",
    "controllerAs": "example"
  }
};
OffcanvasFocusComponent.ɵfac.ɵcomponent = true;
OffcanvasFocusComponent.ɵfac.ɵtype = OffcanvasFocusComponent;

// src/app/features/offcanvas/components/offcanvas-global/offcanvas-global.component.ts
function asyncGeneratorStep2(gen, resolve, reject, _next, _throw, key, arg) {
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
function _async_to_generator2(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var OffcanvasGlobalComponent = class {
  constructor(offcanvas, config) {
    this.offcanvas = offcanvas;
    this.config = config;
    this.initialConfig = {
      backdrop: config.backdrop,
      keyboard: config.keyboard,
      position: config.position,
      scroll: config.scroll
    };
  }
  open() {
    return _async_to_generator2(function* () {
      this.applyConfig();
      try {
        yield this.offcanvas.open(OffcanvasDemoContentComponent);
      } finally {
        this.restoreConfig();
      }
    }).call(this);
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  applyConfig() {
    this.config.backdrop = "static";
    this.config.keyboard = false;
    this.config.position = "end";
    this.config.scroll = true;
  }
  restoreConfig() {
    this.config.backdrop = this.initialConfig.backdrop;
    this.config.keyboard = this.initialConfig.keyboard;
    this.config.position = this.initialConfig.position;
    this.config.scroll = this.initialConfig.scroll;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-56330ce4],.card[_content-56330ce4],.dropdown-menu[_content-56330ce4],.list-group-item[_content-56330ce4],.form-control[_content-56330ce4],.form-select[_content-56330ce4]{border-color:var(--bs-border-color)}.alert-light[_content-56330ce4]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-56330ce4],.list-group[_content-56330ce4],.dropdown-menu[_content-56330ce4]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-56330ce4],.btn-outline-secondary[_content-56330ce4]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-56330ce4],.form-select[_content-56330ce4]{background-color:var(--bs-body-bg)}code[_content-56330ce4]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OffcanvasGlobalComponent.ɵfac = [
  "NgbOffcanvas_51c49d46",
  "NgbOffcanvasConfig_b4ec4aca",
  "$element",
  "$scope",
  function OffcanvasGlobalComponent_Factory(a0, a1, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasGlobalComponent)(a0, a1);
    return instance;
  }
];
OffcanvasGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-global.component-82adf11b.html",
    "controllerAs": "example"
  }
};
OffcanvasGlobalComponent.ɵfac.ɵcomponent = true;
OffcanvasGlobalComponent.ɵfac.ɵtype = OffcanvasGlobalComponent;
OffcanvasGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/offcanvas/components/offcanvas-options/offcanvas-options.component.ts
var OffcanvasOptionsComponent = class {
  constructor(offcanvas) {
    this.offcanvas = offcanvas;
  }
  openCustomPanel() {
    this.open({
      panelClass: "panel"
    });
  }
  openStaticBackdrop() {
    this.open({
      backdrop: "static",
      backdropClass: "backdrop",
      keyboard: false
    });
  }
  openStart() {
    this.open({
      position: "start"
    });
  }
  openEnd() {
    this.open({
      position: "end"
    });
  }
  openTop() {
    this.open({
      position: "top"
    });
  }
  openBottom() {
    this.open({
      position: "bottom"
    });
  }
  openScrollableBody() {
    this.open({
      scroll: true,
      backdrop: false
    });
  }
  open(options) {
    this.offcanvas.open(OffcanvasDemoContentComponent, options);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".panel[_content-67fdd7da]{--bs-offcanvas-width: 28rem;border-color:var(--bs-primary-border-subtle);box-shadow:0 1rem 3rem rgba(var(--bs-primary-rgb),.14)}.panel .offcanvas-header[_content-67fdd7da]{background:color-mix(in srgb,var(--bs-primary-bg-subtle) 55%,var(--bs-body-bg))}.backdrop[_content-67fdd7da]{--bs-backdrop-bg: var(--bs-danger);--bs-backdrop-opacity: .35}";
  document.head.appendChild(s);
})();
OffcanvasOptionsComponent.ɵfac = [
  "NgbOffcanvas_51c49d46",
  "$element",
  "$scope",
  function OffcanvasOptionsComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OffcanvasOptionsComponent)(a0);
    return instance;
  }
];
OffcanvasOptionsComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-options"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-options.component-aa8f6093.html",
    "controllerAs": "example"
  }
};
OffcanvasOptionsComponent.ɵfac.ɵcomponent = true;
OffcanvasOptionsComponent.ɵfac.ɵtype = OffcanvasOptionsComponent;

// src/app/features/offcanvas/offcanvas.module.ts
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
var OffcanvasModule = class {
};
OffcanvasModule.ɵfac = [
  function OffcanvasModule_Factory() {
    return new (this && this.ɵT || OffcanvasModule)();
  }
];
var ɵOffcanvasModule_import0 = RouterModule.forChild(routes);
OffcanvasModule.ɵmod = {
  id: "OffcanvasModule_4b532f0e"
};
ɵimportProviders(import_angular.default.module("OffcanvasModule_4b532f0e", [
  typeof NgbOffcanvasModule === "string" ? NgbOffcanvasModule : NgbOffcanvasModule.ɵmod ? NgbOffcanvasModule.ɵmod.id : NgbOffcanvasModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵOffcanvasModule_import0)
]), [
  ɵOffcanvasModule_import0
]).component("docsOffcanvasComponentContent", {
  controller: OffcanvasComponentContentComponent.ɵfac,
  templateUrl: "templates/offcanvas-component-content.component-ae337a6f.html",
  controllerAs: "example"
}).component("docsOffcanvasDefault", {
  controller: OffcanvasDefaultComponent.ɵfac,
  templateUrl: "templates/offcanvas-default.component-60ef7408.html",
  controllerAs: "example"
}).component("docsOffcanvasDemoContent", {
  controller: OffcanvasDemoContentComponent.ɵfac,
  templateUrl: "templates/offcanvas-demo-content.component-8d4707cf.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveOffcanvas": "<?"
  }
}).component("docsOffcanvasFocus", {
  controller: OffcanvasFocusComponent.ɵfac,
  templateUrl: "templates/offcanvas-focus.component-efe1c651.html",
  controllerAs: "example"
}).component("docsOffcanvasFocusContent", {
  controller: OffcanvasFocusContentComponent.ɵfac,
  templateUrl: "templates/offcanvas-focus-content.component-6bb99332.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveOffcanvas": "<?",
    "autofocus": "<?"
  }
}).component("docsOffcanvasGlobal", {
  controller: OffcanvasGlobalComponent.ɵfac,
  templateUrl: "templates/offcanvas-global.component-82adf11b.html",
  controllerAs: "example"
}).component("docsOffcanvasOptions", {
  controller: OffcanvasOptionsComponent.ɵfac,
  templateUrl: "templates/offcanvas-options.component-aa8f6093.html",
  controllerAs: "example"
}).factory("OffcanvasModule_9e69e12d", OffcanvasModule.ɵfac).run([
  "OffcanvasModule_9e69e12d",
  function() {
  }
]);
export {
  OffcanvasModule
};
