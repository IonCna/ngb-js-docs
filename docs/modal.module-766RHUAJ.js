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
  NgbModalModule
} from "./chunk-CCY4DJEX.js";
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
  TemplateRef
} from "./chunk-U6UIHJCB.js";
import {
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/features/modal/modal.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/features/modal/modal.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Modal",
      tabs: [
        {
          name: "Examples",
          to: "/components/modal/examples"
        },
        {
          name: "Api",
          to: "/components/modal/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/modal/",
        ngBootstrap: "components/modal/overview"
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
              id: "modal-default",
              name: "Default options"
            },
            {
              id: "modal-component-content",
              name: "Component content"
            },
            {
              id: "modal-focus",
              name: "Focus management"
            },
            {
              id: "modal-options",
              name: "Modal options"
            },
            {
              id: "modal-updatable",
              name: "Updatable options"
            },
            {
              id: "modal-stacked",
              name: "Stacked modals"
            },
            {
              id: "modal-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./modal-examples-page.component-6XDL62F4.js").then((m) => m.ModalExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-modal",
              name: "NgbModal"
            },
            {
              id: "ngb-modal-ref",
              name: "NgbModalRef"
            },
            {
              id: "ngb-active-modal",
              name: "NgbActiveModal"
            },
            {
              id: "ngb-modal-config",
              name: "NgbModalConfig"
            }
          ]
        },
        loadComponent: () => import("./modal-api-page.component-AZUIEAW7.js").then((m) => m.ModalApiPageComponent)
      }
    ]
  }
];

// src/app/features/modal/components/modal-demo-content/modal-demo-content.component.ts
var ModalDemoContentComponent = class {
  constructor() {
    this.title = "Component modal";
    this.description = "This modal receives a component as its content.";
    this.longContent = false;
    this.items = Array.from({
      length: 24
    }, (_, index) => `Scrollable content row ${index + 1}`);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-78e17aa0],.card[_content-78e17aa0],.dropdown-menu[_content-78e17aa0],.list-group-item[_content-78e17aa0],.form-control[_content-78e17aa0],.form-select[_content-78e17aa0]{border-color:var(--bs-border-color)}.alert-light[_content-78e17aa0]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-78e17aa0],.list-group[_content-78e17aa0],.dropdown-menu[_content-78e17aa0]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-78e17aa0],.btn-outline-secondary[_content-78e17aa0]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-78e17aa0],.form-select[_content-78e17aa0]{background-color:var(--bs-body-bg)}code[_content-78e17aa0]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalDemoContentComponent.ɵfac = [
  "$element",
  "$scope",
  function ModalDemoContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalDemoContentComponent)();
    return instance;
  }
];
ModalDemoContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-demo-content"
    ]
  ],
  inputs: {
    "ngbActiveModal": "ngbActiveModal",
    "title": "title",
    "description": "description",
    "longContent": "longContent"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-demo-content.component-a94ddd4c.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveModal": "<?",
      "title": "<?ngTitle",
      "description": "<?",
      "longContent": "<?"
    }
  }
};
ModalDemoContentComponent.ɵfac.ɵcomponent = true;
ModalDemoContentComponent.ɵfac.ɵtype = ModalDemoContentComponent;

// src/app/features/modal/components/modal-component-content/modal-component-content.component.ts
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
var ModalComponentContentComponent = class {
  constructor(modal) {
    this.modal = modal;
    this.lastResult = "No result yet";
  }
  open() {
    return _async_to_generator(function* () {
      const modalRef = yield this.modal.open(ModalDemoContentComponent, {
        bindings: {
          title: "Component as content",
          description: "NgbActiveModal is provided directly to the content component."
        }
      });
      modalRef.closed.subscribe((result) => {
        this.lastResult = `Closed with: ${result}`;
      });
      modalRef.dismissed.subscribe((reason) => {
        this.lastResult = `Dismissed with: ${reason}`;
      });
    }).call(this);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-485d5ec1],.card[_content-485d5ec1],.dropdown-menu[_content-485d5ec1],.list-group-item[_content-485d5ec1],.form-control[_content-485d5ec1],.form-select[_content-485d5ec1]{border-color:var(--bs-border-color)}.alert-light[_content-485d5ec1]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-485d5ec1],.list-group[_content-485d5ec1],.dropdown-menu[_content-485d5ec1]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-485d5ec1],.btn-outline-secondary[_content-485d5ec1]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-485d5ec1],.form-select[_content-485d5ec1]{background-color:var(--bs-body-bg)}code[_content-485d5ec1]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalComponentContentComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalComponentContentComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalComponentContentComponent)(a0);
    return instance;
  }
];
ModalComponentContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-component-content"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-component-content.component-3afd3b5f.html",
    "controllerAs": "example"
  }
};
ModalComponentContentComponent.ɵfac.ɵcomponent = true;
ModalComponentContentComponent.ɵfac.ɵtype = ModalComponentContentComponent;

// src/app/features/modal/components/modal-default/modal-default.component.ts
var ModalDefaultComponent = class {
  constructor(modal) {
    this.modal = modal;
  }
  open() {
    this.modal.open(this.content);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-bf95db10],.card[_content-bf95db10],.dropdown-menu[_content-bf95db10],.list-group-item[_content-bf95db10],.form-control[_content-bf95db10],.form-select[_content-bf95db10]{border-color:var(--bs-border-color)}.alert-light[_content-bf95db10]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-bf95db10],.list-group[_content-bf95db10],.dropdown-menu[_content-bf95db10]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-bf95db10],.btn-outline-secondary[_content-bf95db10]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-bf95db10],.form-select[_content-bf95db10]{background-color:var(--bs-body-bg)}code[_content-bf95db10]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalDefaultComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalDefaultComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalDefaultComponent)(a0);
    return instance;
  }
];
ModalDefaultComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-default"
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
    "templateUrl": "templates/modal-default.component-ef64dea9.html",
    "controllerAs": "example"
  }
};
ModalDefaultComponent.ɵfac.ɵcomponent = true;
ModalDefaultComponent.ɵfac.ɵtype = ModalDefaultComponent;

// src/app/features/modal/components/modal-focus-content/modal-focus-content.component.ts
var ModalFocusContentComponent = class {
  constructor() {
    this.autofocus = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-a937b33f],.card[_content-a937b33f],.dropdown-menu[_content-a937b33f],.list-group-item[_content-a937b33f],.form-control[_content-a937b33f],.form-select[_content-a937b33f]{border-color:var(--bs-border-color)}.alert-light[_content-a937b33f]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-a937b33f],.list-group[_content-a937b33f],.dropdown-menu[_content-a937b33f]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-a937b33f],.btn-outline-secondary[_content-a937b33f]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-a937b33f],.form-select[_content-a937b33f]{background-color:var(--bs-body-bg)}code[_content-a937b33f]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalFocusContentComponent.ɵfac = [
  "$element",
  "$scope",
  function ModalFocusContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalFocusContentComponent)();
    return instance;
  }
];
ModalFocusContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-focus-content"
    ]
  ],
  inputs: {
    "ngbActiveModal": "ngbActiveModal",
    "autofocus": "autofocus"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-focus-content.component-587df668.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveModal": "<?",
      "autofocus": "<?"
    }
  }
};
ModalFocusContentComponent.ɵfac.ɵcomponent = true;
ModalFocusContentComponent.ɵfac.ɵtype = ModalFocusContentComponent;

// src/app/features/modal/components/modal-focus/modal-focus.component.ts
var ModalFocusComponent = class {
  constructor(modal) {
    this.modal = modal;
  }
  openDefaultFocus() {
    this.modal.open(ModalFocusContentComponent, {
      ariaLabelledBy: "modal-focus-title",
      bindings: {
        autofocus: false
      }
    });
  }
  openCustomFocus() {
    this.modal.open(ModalFocusContentComponent, {
      ariaLabelledBy: "modal-focus-title",
      bindings: {
        autofocus: true
      }
    });
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-84b10333],.card[_content-84b10333],.dropdown-menu[_content-84b10333],.list-group-item[_content-84b10333],.form-control[_content-84b10333],.form-select[_content-84b10333]{border-color:var(--bs-border-color)}.alert-light[_content-84b10333]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-84b10333],.list-group[_content-84b10333],.dropdown-menu[_content-84b10333]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-84b10333],.btn-outline-secondary[_content-84b10333]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-84b10333],.form-select[_content-84b10333]{background-color:var(--bs-body-bg)}code[_content-84b10333]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalFocusComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalFocusComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalFocusComponent)(a0);
    return instance;
  }
];
ModalFocusComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-focus"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-focus.component-fed04cbc.html",
    "controllerAs": "example"
  }
};
ModalFocusComponent.ɵfac.ɵcomponent = true;
ModalFocusComponent.ɵfac.ɵtype = ModalFocusComponent;

// src/app/features/modal/components/modal-global/modal-global.component.ts
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
var ModalGlobalComponent = class {
  constructor(modal, config) {
    this.modal = modal;
    this.config = config;
    this.initialConfig = {
      backdrop: config.backdrop,
      centered: config.centered,
      keyboard: config.keyboard,
      size: config.size
    };
  }
  open() {
    return _async_to_generator2(function* () {
      this.applyConfig();
      try {
        yield this.modal.open(ModalDemoContentComponent, {
          bindings: {
            title: "Globally configured modal",
            description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click."
          }
        });
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
    this.config.centered = true;
    this.config.keyboard = false;
    this.config.size = "lg";
  }
  restoreConfig() {
    this.config.backdrop = this.initialConfig.backdrop;
    this.config.centered = this.initialConfig.centered;
    this.config.keyboard = this.initialConfig.keyboard;
    this.config.size = this.initialConfig.size;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-72db6603],.card[_content-72db6603],.dropdown-menu[_content-72db6603],.list-group-item[_content-72db6603],.form-control[_content-72db6603],.form-select[_content-72db6603]{border-color:var(--bs-border-color)}.alert-light[_content-72db6603]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-72db6603],.list-group[_content-72db6603],.dropdown-menu[_content-72db6603]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-72db6603],.btn-outline-secondary[_content-72db6603]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-72db6603],.form-select[_content-72db6603]{background-color:var(--bs-body-bg)}code[_content-72db6603]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalGlobalComponent.ɵfac = [
  "NgbModal_da91379e",
  "NgbModalConfig_d566cf81",
  "$element",
  "$scope",
  function ModalGlobalComponent_Factory(a0, a1, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalGlobalComponent)(a0, a1);
    return instance;
  }
];
ModalGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-global.component-b36feb32.html",
    "controllerAs": "example"
  }
};
ModalGlobalComponent.ɵfac.ɵcomponent = true;
ModalGlobalComponent.ɵfac.ɵtype = ModalGlobalComponent;
ModalGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/modal/components/modal-options/modal-options.component.ts
var ModalOptionsComponent = class {
  constructor(modal) {
    this.modal = modal;
  }
  openCustomWindow() {
    this.open("Custom window class", {
      windowClass: "window"
    });
  }
  openStaticBackdrop() {
    this.open("Static custom backdrop", {
      backdrop: "static",
      backdropClass: "backdrop",
      keyboard: false
    });
  }
  openSmall() {
    this.open("Small modal", {
      size: "sm"
    });
  }
  openLarge() {
    this.open("Large modal", {
      size: "lg"
    });
  }
  openExtraLarge() {
    this.open("Extra large modal", {
      size: "xl"
    });
  }
  openFullscreen() {
    this.open("Fullscreen modal", {
      fullscreen: true
    });
  }
  openCentered() {
    this.open("Vertically centered modal", {
      centered: true
    });
  }
  openScrollable() {
    this.open("Scrollable modal", {
      scrollable: true,
      size: "lg"
    }, true);
  }
  openCustomDialog() {
    this.open("Custom dialog class", {
      modalDialogClass: "dialog"
    });
  }
  open(title, options, longContent = false) {
    this.modal.open(ModalDemoContentComponent, {
      ...options,
      bindings: {
        title,
        description: "These values are applied only to this modal instance.",
        longContent
      }
    });
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".window .modal-content[_content-e8d32981]{border-top:.35rem solid var(--bs-primary);box-shadow:0 1.5rem 4rem rgba(var(--bs-body-color-rgb),.2)}.backdrop[_content-e8d32981],.updated-backdrop[_content-e8d32981]{--bs-backdrop-bg: var(--bs-danger);--bs-backdrop-opacity: .35}.dialog .modal-content[_content-e8d32981],.updated-dialog .modal-content[_content-e8d32981]{border-radius:1.5rem;border-color:var(--bs-primary-border-subtle);box-shadow:0 1rem 3rem rgba(var(--bs-primary-rgb),.18)}.updated-window .modal-content[_content-e8d32981]{border-color:var(--bs-success);box-shadow:0 1rem 3rem rgba(var(--bs-body-color-rgb),.18)}";
  document.head.appendChild(s);
})();
ModalOptionsComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalOptionsComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalOptionsComponent)(a0);
    return instance;
  }
];
ModalOptionsComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-options"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-options.component-4af7670f.html",
    "controllerAs": "example"
  }
};
ModalOptionsComponent.ɵfac.ɵcomponent = true;
ModalOptionsComponent.ɵfac.ɵtype = ModalOptionsComponent;

// src/app/features/modal/components/modal-stacked-content/modal-stacked-content.component.ts
var ModalStackedContentComponent = class {
  constructor(modal) {
    this.modal = modal;
    this.level = 1;
  }
  dismissAll() {
    this.modal.dismissAll("Dismiss all");
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-61e30cc4],.card[_content-61e30cc4],.dropdown-menu[_content-61e30cc4],.list-group-item[_content-61e30cc4],.form-control[_content-61e30cc4],.form-select[_content-61e30cc4]{border-color:var(--bs-border-color)}.alert-light[_content-61e30cc4]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-61e30cc4],.list-group[_content-61e30cc4],.dropdown-menu[_content-61e30cc4]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-61e30cc4],.btn-outline-secondary[_content-61e30cc4]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-61e30cc4],.form-select[_content-61e30cc4]{background-color:var(--bs-body-bg)}code[_content-61e30cc4]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalStackedContentComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalStackedContentComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalStackedContentComponent)(a0);
    return instance;
  }
];
ModalStackedContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-stacked-content"
    ]
  ],
  inputs: {
    "ngbActiveModal": "ngbActiveModal",
    "level": "level"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-stacked-content.component-f99dc82b.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveModal": "<?",
      "level": "<?"
    }
  }
};
ModalStackedContentComponent.ɵfac.ɵcomponent = true;
ModalStackedContentComponent.ɵfac.ɵtype = ModalStackedContentComponent;

// src/app/features/modal/components/modal-stacked/modal-stacked.component.ts
function asyncGeneratorStep3(gen, resolve, reject, _next, _throw, key, arg) {
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
function _async_to_generator3(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep3(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep3(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var ModalStackedComponent = class {
  constructor(modal) {
    this.modal = modal;
  }
  openStack() {
    return _async_to_generator3(function* () {
      for (let level = 1; level <= 3; level++) {
        yield this.modal.open(ModalStackedContentComponent, {
          bindings: {
            level
          }
        });
      }
    }).call(this);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-e4c83fac],.card[_content-e4c83fac],.dropdown-menu[_content-e4c83fac],.list-group-item[_content-e4c83fac],.form-control[_content-e4c83fac],.form-select[_content-e4c83fac]{border-color:var(--bs-border-color)}.alert-light[_content-e4c83fac]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-e4c83fac],.list-group[_content-e4c83fac],.dropdown-menu[_content-e4c83fac]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-e4c83fac],.btn-outline-secondary[_content-e4c83fac]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-e4c83fac],.form-select[_content-e4c83fac]{background-color:var(--bs-body-bg)}code[_content-e4c83fac]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalStackedComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalStackedComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalStackedComponent)(a0);
    return instance;
  }
];
ModalStackedComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-stacked"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-stacked.component-8d5bb93c.html",
    "controllerAs": "example"
  }
};
ModalStackedComponent.ɵfac.ɵcomponent = true;
ModalStackedComponent.ɵfac.ɵtype = ModalStackedComponent;

// src/app/features/modal/components/modal-updatable-content/modal-updatable-content.component.ts
var ModalUpdatableContentComponent = class {
  toggleAriaReferences() {
    this.ariaReferences = !this.ariaReferences;
    this.ngbActiveModal.update({
      ariaLabelledBy: this.ariaReferences ? "updatable-modal-title" : "",
      ariaDescribedBy: this.ariaReferences ? "updatable-modal-description" : ""
    });
  }
  toggleCentered() {
    this.centered = !this.centered;
    this.ngbActiveModal.update({
      centered: this.centered
    });
  }
  toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    this.ngbActiveModal.update({
      fullscreen: this.fullscreen
    });
  }
  toggleBackdropClass() {
    this.customBackdrop = !this.customBackdrop;
    this.ngbActiveModal.update({
      backdropClass: this.customBackdrop ? "updated-backdrop" : ""
    });
  }
  cycleSize() {
    const sizes = [
      "sm",
      "lg",
      "xl"
    ];
    this.size = sizes[(sizes.indexOf(this.size) + 1) % sizes.length];
    this.ngbActiveModal.update({
      size: this.size
    });
  }
  toggleWindowClass() {
    this.customWindow = !this.customWindow;
    this.ngbActiveModal.update({
      windowClass: this.customWindow ? "updated-window" : ""
    });
  }
  toggleDialogClass() {
    this.customDialog = !this.customDialog;
    this.ngbActiveModal.update({
      modalDialogClass: this.customDialog ? "updated-dialog" : ""
    });
  }
  constructor() {
    this.ariaReferences = true;
    this.centered = false;
    this.fullscreen = false;
    this.customBackdrop = false;
    this.size = "sm";
    this.customWindow = false;
    this.customDialog = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-92f041ce],.card[_content-92f041ce],.dropdown-menu[_content-92f041ce],.list-group-item[_content-92f041ce],.form-control[_content-92f041ce],.form-select[_content-92f041ce]{border-color:var(--bs-border-color)}.alert-light[_content-92f041ce]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-92f041ce],.list-group[_content-92f041ce],.dropdown-menu[_content-92f041ce]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-92f041ce],.btn-outline-secondary[_content-92f041ce]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-92f041ce],.form-select[_content-92f041ce]{background-color:var(--bs-body-bg)}code[_content-92f041ce]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalUpdatableContentComponent.ɵfac = [
  "$element",
  "$scope",
  function ModalUpdatableContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalUpdatableContentComponent)();
    return instance;
  }
];
ModalUpdatableContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-updatable-content"
    ]
  ],
  inputs: {
    "ngbActiveModal": "ngbActiveModal"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-updatable-content.component-7686877e.html",
    "controllerAs": "$",
    "bindings": {
      "ngbActiveModal": "<?"
    }
  }
};
ModalUpdatableContentComponent.ɵfac.ɵcomponent = true;
ModalUpdatableContentComponent.ɵfac.ɵtype = ModalUpdatableContentComponent;

// src/app/features/modal/components/modal-updatable/modal-updatable.component.ts
var ModalUpdatableComponent = class {
  constructor(modal) {
    this.modal = modal;
  }
  open() {
    this.modal.open(ModalUpdatableContentComponent, {
      ariaLabelledBy: "updatable-modal-title",
      ariaDescribedBy: "updatable-modal-description",
      size: "sm"
    });
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-d7b734e4],.card[_content-d7b734e4],.dropdown-menu[_content-d7b734e4],.list-group-item[_content-d7b734e4],.form-control[_content-d7b734e4],.form-select[_content-d7b734e4]{border-color:var(--bs-border-color)}.alert-light[_content-d7b734e4]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-d7b734e4],.list-group[_content-d7b734e4],.dropdown-menu[_content-d7b734e4]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-d7b734e4],.btn-outline-secondary[_content-d7b734e4]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-d7b734e4],.form-select[_content-d7b734e4]{background-color:var(--bs-body-bg)}code[_content-d7b734e4]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ModalUpdatableComponent.ɵfac = [
  "NgbModal_da91379e",
  "$element",
  "$scope",
  function ModalUpdatableComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ModalUpdatableComponent)(a0);
    return instance;
  }
];
ModalUpdatableComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-updatable"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-updatable.component-e56273bc.html",
    "controllerAs": "example"
  }
};
ModalUpdatableComponent.ɵfac.ɵcomponent = true;
ModalUpdatableComponent.ɵfac.ɵtype = ModalUpdatableComponent;

// src/app/features/modal/modal.module.ts
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
var ModalModule = class {
};
ModalModule.ɵfac = [
  function ModalModule_Factory() {
    return new (this && this.ɵT || ModalModule)();
  }
];
var ɵModalModule_import0 = RouterModule.forChild(routes);
ModalModule.ɵmod = {
  id: "ModalModule_8624e49b"
};
ɵimportProviders(import_angular.default.module("ModalModule_8624e49b", [
  typeof NgbModalModule === "string" ? NgbModalModule : NgbModalModule.ɵmod ? NgbModalModule.ɵmod.id : NgbModalModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵModalModule_import0)
]), [
  ɵModalModule_import0
]).component("docsModalComponentContent", {
  controller: ModalComponentContentComponent.ɵfac,
  templateUrl: "templates/modal-component-content.component-3afd3b5f.html",
  controllerAs: "example"
}).component("docsModalDefault", {
  controller: ModalDefaultComponent.ɵfac,
  templateUrl: "templates/modal-default.component-ef64dea9.html",
  controllerAs: "example"
}).component("docsModalDemoContent", {
  controller: ModalDemoContentComponent.ɵfac,
  templateUrl: "templates/modal-demo-content.component-a94ddd4c.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveModal": "<?",
    "title": "<?ngTitle",
    "description": "<?",
    "longContent": "<?"
  }
}).component("docsModalFocus", {
  controller: ModalFocusComponent.ɵfac,
  templateUrl: "templates/modal-focus.component-fed04cbc.html",
  controllerAs: "example"
}).component("docsModalFocusContent", {
  controller: ModalFocusContentComponent.ɵfac,
  templateUrl: "templates/modal-focus-content.component-587df668.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveModal": "<?",
    "autofocus": "<?"
  }
}).component("docsModalGlobal", {
  controller: ModalGlobalComponent.ɵfac,
  templateUrl: "templates/modal-global.component-b36feb32.html",
  controllerAs: "example"
}).component("docsModalOptions", {
  controller: ModalOptionsComponent.ɵfac,
  templateUrl: "templates/modal-options.component-4af7670f.html",
  controllerAs: "example"
}).component("docsModalStacked", {
  controller: ModalStackedComponent.ɵfac,
  templateUrl: "templates/modal-stacked.component-8d5bb93c.html",
  controllerAs: "example"
}).component("docsModalStackedContent", {
  controller: ModalStackedContentComponent.ɵfac,
  templateUrl: "templates/modal-stacked-content.component-f99dc82b.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveModal": "<?",
    "level": "<?"
  }
}).component("docsModalUpdatable", {
  controller: ModalUpdatableComponent.ɵfac,
  templateUrl: "templates/modal-updatable.component-e56273bc.html",
  controllerAs: "example"
}).component("docsModalUpdatableContent", {
  controller: ModalUpdatableContentComponent.ɵfac,
  templateUrl: "templates/modal-updatable-content.component-7686877e.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveModal": "<?"
  }
}).factory("ModalModule_e7a38138", ModalModule.ɵfac).run([
  "ModalModule_e7a38138",
  function() {
  }
]);
export {
  ModalModule
};
