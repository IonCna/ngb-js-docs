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
} from "./chunk-MUNJYMJR.js";
import {
  NgbNavModule
} from "./chunk-BZN72FJP.js";
import {
  NgbScrollSpyModule
} from "./chunk-F2WOA7SZ.js";
import {
  RouterModule
} from "./chunk-7ZRTBL6U.js";
import "./chunk-S4GGKWRG.js";
import "./chunk-AUA2A2I3.js";
import {
  require_angular
} from "./chunk-MUYIROFI.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/nav/nav.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/features/nav/nav.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Nav",
      tabs: [
        {
          name: "Examples",
          to: "/components/nav/examples"
        },
        {
          name: "Api",
          to: "/components/nav/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/navs-tabs/",
        ngBootstrap: "components/nav/overview"
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
              id: "simple-nav",
              name: "Simple nav"
            },
            {
              id: "alternative-nav",
              name: "Alternative markup"
            },
            {
              id: "vertical-nav",
              name: "Vertical pills"
            },
            {
              id: "selecting-nav",
              name: "Selecting navs"
            },
            {
              id: "keep-content-nav",
              name: "Keep content"
            },
            {
              id: "dynamic-nav",
              name: "Dynamic navs"
            },
            {
              id: "custom-nav",
              name: "Custom style"
            },
            {
              id: "nav-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./nav-examples-page.component-IFO3MFCT.js").then((m) => m.NavExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-nav",
              name: "NgbNav"
            },
            {
              id: "ngb-nav-item",
              name: "NgbNavItem"
            },
            {
              id: "ngb-nav-link",
              name: "NgbNavLink"
            },
            {
              id: "ngb-nav-content",
              name: "NgbNavContent"
            },
            {
              id: "ngb-nav-outlet",
              name: "NgbNavOutlet"
            },
            {
              id: "ngb-nav-config",
              name: "NgbNavConfig"
            }
          ]
        },
        loadComponent: () => import("./nav-api-page.component-3GF4MLE3.js").then((m) => m.NavApiPageComponent)
      }
    ]
  }
];

// src/app/features/nav/components/alternative-nav/alternative-nav.component.ts
var AlternativeNavComponent = class {
  constructor() {
    this.activeId = "alternative-home";
  }
};
(function() {
  var h = "styles/alternative-nav.component-a7be8944.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
AlternativeNavComponent.ɵfac = [
  "$element",
  "$scope",
  function AlternativeNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new AlternativeNavComponent();
    return instance;
  }
];
AlternativeNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-alternative-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/alternative-nav.component-07d34dcf.html",
    "controllerAs": "example"
  }
};
AlternativeNavComponent.ɵfac.ɵcomponent = true;
AlternativeNavComponent.ɵfac.ɵtype = AlternativeNavComponent;

// src/app/features/nav/components/custom-nav/custom-nav.component.ts
var CustomNavComponent = class {
  constructor() {
    this.activeId = "custom-weekly";
  }
};
(function() {
  var h = "styles/custom-nav.component-065e912d.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
CustomNavComponent.ɵfac = [
  "$element",
  "$scope",
  function CustomNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new CustomNavComponent();
    return instance;
  }
];
CustomNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-custom-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/custom-nav.component-e89077d7.html",
    "controllerAs": "example"
  }
};
CustomNavComponent.ɵfac.ɵcomponent = true;
CustomNavComponent.ɵfac.ɵtype = CustomNavComponent;

// src/app/features/nav/components/dynamic-nav/dynamic-nav.component.ts
var DynamicNavComponent = class {
  add() {
    const item = {
      id: `dynamic-${this.nextId}`,
      title: `Tab ${this.nextId}`
    };
    this.nextId++;
    this.items.push(item);
    this.activeId = item.id;
  }
  removeActive() {
    if (this.items.length === 1) return;
    const activeIndex = this.items.findIndex(({ id }) => id === this.activeId);
    const replacement = this.items[activeIndex === 0 ? 1 : activeIndex - 1];
    this.activeId = replacement.id;
    this.items = this.items.filter(({ id }) => id !== this.items[activeIndex].id);
  }
  constructor() {
    this.items = [
      {
        id: "dynamic-1",
        title: "Tab 1"
      },
      {
        id: "dynamic-2",
        title: "Tab 2"
      },
      {
        id: "dynamic-3",
        title: "Tab 3"
      }
    ];
    this.activeId = "dynamic-1";
    this.nextId = 4;
  }
};
(function() {
  var h = "styles/dynamic-nav.component-1155ecb3.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DynamicNavComponent.ɵfac = [
  "$element",
  "$scope",
  function DynamicNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DynamicNavComponent();
    return instance;
  }
];
DynamicNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-dynamic-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dynamic-nav.component-63926671.html",
    "controllerAs": "example"
  }
};
DynamicNavComponent.ɵfac.ɵcomponent = true;
DynamicNavComponent.ɵfac.ɵtype = DynamicNavComponent;

// src/app/features/nav/components/keep-content-nav/keep-content-nav.component.ts
var KeepContentNavComponent = class {
  constructor() {
    this.activeId = "keep-editor";
    this.draft = "This value survives tab changes.";
  }
};
(function() {
  var h = "styles/keep-content-nav.component-54771ca8.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
KeepContentNavComponent.ɵfac = [
  "$element",
  "$scope",
  function KeepContentNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new KeepContentNavComponent();
    return instance;
  }
];
KeepContentNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-keep-content-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/keep-content-nav.component-17417f59.html",
    "controllerAs": "example"
  }
};
KeepContentNavComponent.ɵfac.ɵcomponent = true;
KeepContentNavComponent.ɵfac.ɵtype = KeepContentNavComponent;

// src/app/features/nav/components/nav-global/nav-global.component.ts
var NavGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.activeId = "global-account";
    this.initialConfig = {
      animation: config.animation,
      destroyOnHide: config.destroyOnHide,
      keyboard: config.keyboard,
      orientation: config.orientation,
      roles: config.roles
    };
    config.animation = false;
    config.destroyOnHide = false;
    config.keyboard = "changeWithArrows";
    config.orientation = "vertical";
    config.roles = "tablist";
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    this.config.animation = this.initialConfig.animation;
    this.config.destroyOnHide = this.initialConfig.destroyOnHide;
    this.config.keyboard = this.initialConfig.keyboard;
    this.config.orientation = this.initialConfig.orientation;
    this.config.roles = this.initialConfig.roles;
  }
};
(function() {
  var h = "styles/nav-global.component-21067163.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
NavGlobalComponent.ɵfac = [
  "NgbNavConfig_a43093eb",
  "$element",
  "$scope",
  function NavGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new NavGlobalComponent(a0);
    return instance;
  }
];
NavGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-nav-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/nav-global.component-3d4ad572.html",
    "controllerAs": "example"
  }
};
NavGlobalComponent.ɵfac.ɵcomponent = true;
NavGlobalComponent.ɵfac.ɵtype = NavGlobalComponent;
NavGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NavGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/nav/components/selecting-nav/selecting-nav.component.ts
var SelectingNavComponent = class {
  select(id) {
    this.nav.select(id);
  }
  constructor() {
    this.activeId = "selecting-first";
  }
};
(function() {
  var h = "styles/selecting-nav.component-de2766be.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
SelectingNavComponent.ɵfac = [
  "$element",
  "$scope",
  function SelectingNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new SelectingNavComponent();
    return instance;
  }
];
SelectingNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-selecting-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/selecting-nav.component-461af4ad.html",
    "controllerAs": "example"
  }
};
SelectingNavComponent.ɵfac.ɵcomponent = true;
SelectingNavComponent.ɵfac.ɵtype = SelectingNavComponent;

// src/app/features/nav/components/simple-nav/simple-nav.component.ts
var SimpleNavComponent = class {
  constructor() {
    this.activeId = "simple-overview";
  }
};
(function() {
  var h = "styles/simple-nav.component-23b8cf3a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
SimpleNavComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new SimpleNavComponent();
    return instance;
  }
];
SimpleNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-simple-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/simple-nav.component-17bfe716.html",
    "controllerAs": "example"
  }
};
SimpleNavComponent.ɵfac.ɵcomponent = true;
SimpleNavComponent.ɵfac.ɵtype = SimpleNavComponent;

// src/app/features/nav/components/vertical-nav/vertical-nav.component.ts
var VerticalNavComponent = class {
  constructor() {
    this.activeId = "vertical-profile";
  }
};
(function() {
  var h = "styles/vertical-nav.component-2c8664fe.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
VerticalNavComponent.ɵfac = [
  "$element",
  "$scope",
  function VerticalNavComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new VerticalNavComponent();
    return instance;
  }
];
VerticalNavComponent.ɵcmp = {
  selectors: [
    [
      "docs-vertical-nav"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/vertical-nav.component-05fb30ee.html",
    "controllerAs": "example"
  }
};
VerticalNavComponent.ɵfac.ɵcomponent = true;
VerticalNavComponent.ɵfac.ɵtype = VerticalNavComponent;

// src/app/features/nav/nav.module.ts
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
var NavModule = class {
};
NavModule.ɵfac = [
  function NavModule_Factory() {
    return new NavModule();
  }
];
var ɵNavModule_import0 = RouterModule.forChild(routes);
NavModule.ɵmod = {
  id: "NavModule_e4c5865c"
};
ɵimportProviders(import_angular.default.module("NavModule_e4c5865c", [
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵNavModule_import0)
]), [
  ɵNavModule_import0
]).component("docsAlternativeNav", {
  controller: AlternativeNavComponent.ɵfac,
  templateUrl: "templates/alternative-nav.component-07d34dcf.html",
  controllerAs: "example"
}).component("docsCustomNav", {
  controller: CustomNavComponent.ɵfac,
  templateUrl: "templates/custom-nav.component-e89077d7.html",
  controllerAs: "example"
}).component("docsDynamicNav", {
  controller: DynamicNavComponent.ɵfac,
  templateUrl: "templates/dynamic-nav.component-63926671.html",
  controllerAs: "example"
}).component("docsKeepContentNav", {
  controller: KeepContentNavComponent.ɵfac,
  templateUrl: "templates/keep-content-nav.component-17417f59.html",
  controllerAs: "example"
}).component("docsNavGlobal", {
  controller: NavGlobalComponent.ɵfac,
  templateUrl: "templates/nav-global.component-3d4ad572.html",
  controllerAs: "example"
}).component("docsSelectingNav", {
  controller: SelectingNavComponent.ɵfac,
  templateUrl: "templates/selecting-nav.component-461af4ad.html",
  controllerAs: "example"
}).component("docsSimpleNav", {
  controller: SimpleNavComponent.ɵfac,
  templateUrl: "templates/simple-nav.component-17bfe716.html",
  controllerAs: "example"
}).component("docsVerticalNav", {
  controller: VerticalNavComponent.ɵfac,
  templateUrl: "templates/vertical-nav.component-05fb30ee.html",
  controllerAs: "example"
}).factory("NavModule_0e4ee266", NavModule.ɵfac).run([
  "NavModule_0e4ee266",
  function() {
  }
]);
export {
  NavModule
};
