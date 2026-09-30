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
  NgbTooltipModule
} from "./chunk-YOPQSGJ5.js";
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

// src/app/features/tooltip/tooltip.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/features/tooltip/tooltip.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Tooltip",
      tabs: [
        {
          name: "Examples",
          to: "/components/tooltip/examples"
        },
        {
          name: "Api",
          to: "/components/tooltip/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/tooltips/",
        ngBootstrap: "components/tooltip/overview"
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
              id: "tooltip-placements",
              name: "Quick and easy tooltips"
            },
            {
              id: "tooltip-template",
              name: "HTML and bindings"
            },
            {
              id: "tooltip-triggers",
              name: "Custom and manual triggers"
            },
            {
              id: "tooltip-autoclose",
              name: "Automatic closing"
            },
            {
              id: "tooltip-context",
              name: "Context and manual triggers"
            },
            {
              id: "tooltip-custom-target",
              name: "Custom target"
            },
            {
              id: "tooltip-delays",
              name: "Open and close delays"
            },
            {
              id: "tooltip-body",
              name: "Append to body"
            },
            {
              id: "tooltip-custom-class",
              name: "Custom class"
            },
            {
              id: "tooltip-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./tooltip-examples-page.component-46SCDAUL.js").then((m) => m.TooltipExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-tooltip",
              name: "NgbTooltip"
            },
            {
              id: "ngb-tooltip-config",
              name: "NgbTooltipConfig"
            }
          ]
        },
        loadComponent: () => import("./tooltip-api-page.component-DAEHCWFC.js").then((m) => m.TooltipApiPageComponent)
      }
    ]
  }
];

// src/app/features/tooltip/components/tooltip-autoclose/tooltip-autoclose.component.ts
var TooltipAutocloseComponent = class {
};
(function() {
  var h = "styles/tooltip-autoclose.component-9b5ea162.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipAutocloseComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipAutocloseComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipAutocloseComponent();
    return instance;
  }
];
TooltipAutocloseComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-autoclose"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-autoclose.component-0588bab3.html",
    "controllerAs": "example"
  }
};
TooltipAutocloseComponent.ɵfac.ɵcomponent = true;
TooltipAutocloseComponent.ɵfac.ɵtype = TooltipAutocloseComponent;

// src/app/features/tooltip/components/tooltip-body/tooltip-body.component.ts
var TooltipBodyComponent = class {
};
(function() {
  var h = "styles/tooltip-body.component-764de29c.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipBodyComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipBodyComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipBodyComponent();
    return instance;
  }
];
TooltipBodyComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-body"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-body.component-13f41e8e.html",
    "controllerAs": "example"
  }
};
TooltipBodyComponent.ɵfac.ɵcomponent = true;
TooltipBodyComponent.ɵfac.ɵtype = TooltipBodyComponent;

// src/app/features/tooltip/components/tooltip-context/tooltip-context.component.ts
var TooltipContextComponent = class {
  toggleWithGreeting(tooltip, greeting) {
    tooltip.isOpen() ? tooltip.close() : tooltip.open({
      greeting
    });
  }
  constructor() {
    this.name = "World";
  }
};
(function() {
  var h = "styles/tooltip-context.component-f9f115fb.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipContextComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipContextComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipContextComponent();
    return instance;
  }
];
TooltipContextComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-context"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-context.component-31406e1f.html",
    "controllerAs": "example"
  }
};
TooltipContextComponent.ɵfac.ɵcomponent = true;
TooltipContextComponent.ɵfac.ɵtype = TooltipContextComponent;

// src/app/features/tooltip/components/tooltip-custom-class/tooltip-custom-class.component.ts
var TooltipCustomClassComponent = class {
};
(function() {
  var h = "styles/tooltip-custom-class.component-e835cc8a.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipCustomClassComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipCustomClassComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipCustomClassComponent();
    return instance;
  }
];
TooltipCustomClassComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-custom-class"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-custom-class.component-e549c47e.html",
    "controllerAs": "example"
  }
};
TooltipCustomClassComponent.ɵfac.ɵcomponent = true;
TooltipCustomClassComponent.ɵfac.ɵtype = TooltipCustomClassComponent;

// src/app/features/tooltip/components/tooltip-custom-target/tooltip-custom-target.component.ts
var TooltipCustomTargetComponent = class {
};
(function() {
  var h = "styles/tooltip-custom-target.component-e2c698cb.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipCustomTargetComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipCustomTargetComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipCustomTargetComponent();
    return instance;
  }
];
TooltipCustomTargetComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-custom-target"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-custom-target.component-d6f2bc59.html",
    "controllerAs": "example"
  }
};
TooltipCustomTargetComponent.ɵfac.ɵcomponent = true;
TooltipCustomTargetComponent.ɵfac.ɵtype = TooltipCustomTargetComponent;

// src/app/features/tooltip/components/tooltip-delays/tooltip-delays.component.ts
var TooltipDelaysComponent = class {
};
(function() {
  var h = "styles/tooltip-delays.component-0b3b61ef.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipDelaysComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipDelaysComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipDelaysComponent();
    return instance;
  }
];
TooltipDelaysComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-delays"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-delays.component-d8aae459.html",
    "controllerAs": "example"
  }
};
TooltipDelaysComponent.ɵfac.ɵcomponent = true;
TooltipDelaysComponent.ɵfac.ɵtype = TooltipDelaysComponent;

// src/app/features/tooltip/components/tooltip-global/tooltip-global.component.ts
var TooltipGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      container: config.container,
      openDelay: config.openDelay,
      placement: config.placement,
      triggers: config.triggers
    };
    config.container = "body";
    config.openDelay = 300;
    config.placement = "end";
    config.triggers = "mouseenter:mouseleave";
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    this.config.container = this.initialConfig.container;
    this.config.openDelay = this.initialConfig.openDelay;
    this.config.placement = this.initialConfig.placement;
    this.config.triggers = this.initialConfig.triggers;
  }
};
(function() {
  var h = "styles/tooltip-global.component-39afef41.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipGlobalComponent.ɵfac = [
  "NgbTooltipConfig_1833b747",
  "$element",
  "$scope",
  function TooltipGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipGlobalComponent(a0);
    return instance;
  }
];
TooltipGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-global.component-38486b3f.html",
    "controllerAs": "example"
  }
};
TooltipGlobalComponent.ɵfac.ɵcomponent = true;
TooltipGlobalComponent.ɵfac.ɵtype = TooltipGlobalComponent;
TooltipGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
TooltipGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/tooltip/components/tooltip-placements/tooltip-placements.component.ts
var TooltipPlacementsComponent = class {
};
(function() {
  var h = "styles/tooltip-placements.component-97571549.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipPlacementsComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipPlacementsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipPlacementsComponent();
    return instance;
  }
];
TooltipPlacementsComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-placements"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-placements.component-ca0060f0.html",
    "controllerAs": "example"
  }
};
TooltipPlacementsComponent.ɵfac.ɵcomponent = true;
TooltipPlacementsComponent.ɵfac.ɵtype = TooltipPlacementsComponent;

// src/app/features/tooltip/components/tooltip-template/tooltip-template.component.ts
var TooltipTemplateComponent = class {
  constructor() {
    this.name = "NgbJS";
  }
};
(function() {
  var h = "styles/tooltip-template.component-36091f5b.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipTemplateComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipTemplateComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipTemplateComponent();
    return instance;
  }
];
TooltipTemplateComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-template"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-template.component-defe8d90.html",
    "controllerAs": "example"
  }
};
TooltipTemplateComponent.ɵfac.ɵcomponent = true;
TooltipTemplateComponent.ɵfac.ɵtype = TooltipTemplateComponent;

// src/app/features/tooltip/components/tooltip-triggers/tooltip-triggers.component.ts
var TooltipTriggersComponent = class {
};
(function() {
  var h = "styles/tooltip-triggers.component-f2303beb.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipTriggersComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipTriggersComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipTriggersComponent();
    return instance;
  }
];
TooltipTriggersComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-triggers"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-triggers.component-139330c7.html",
    "controllerAs": "example"
  }
};
TooltipTriggersComponent.ɵfac.ɵcomponent = true;
TooltipTriggersComponent.ɵfac.ɵtype = TooltipTriggersComponent;

// src/app/features/tooltip/tooltip.module.ts
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
var TooltipModule = class {
};
TooltipModule.ɵfac = [
  function TooltipModule_Factory() {
    return new TooltipModule();
  }
];
var ɵTooltipModule_import0 = RouterModule.forChild(routes);
TooltipModule.ɵmod = {
  id: "TooltipModule_de512f0b"
};
ɵimportProviders(import_angular.default.module("TooltipModule_de512f0b", [
  typeof NgbTooltipModule === "string" ? NgbTooltipModule : NgbTooltipModule.ɵmod ? NgbTooltipModule.ɵmod.id : NgbTooltipModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  ɵimportedModuleName(ɵTooltipModule_import0)
]), [
  ɵTooltipModule_import0
]).component("docsTooltipAutoclose", {
  controller: TooltipAutocloseComponent.ɵfac,
  templateUrl: "templates/tooltip-autoclose.component-0588bab3.html",
  controllerAs: "example"
}).component("docsTooltipBody", {
  controller: TooltipBodyComponent.ɵfac,
  templateUrl: "templates/tooltip-body.component-13f41e8e.html",
  controllerAs: "example"
}).component("docsTooltipContext", {
  controller: TooltipContextComponent.ɵfac,
  templateUrl: "templates/tooltip-context.component-31406e1f.html",
  controllerAs: "example"
}).component("docsTooltipCustomClass", {
  controller: TooltipCustomClassComponent.ɵfac,
  templateUrl: "templates/tooltip-custom-class.component-e549c47e.html",
  controllerAs: "example"
}).component("docsTooltipCustomTarget", {
  controller: TooltipCustomTargetComponent.ɵfac,
  templateUrl: "templates/tooltip-custom-target.component-d6f2bc59.html",
  controllerAs: "example"
}).component("docsTooltipDelays", {
  controller: TooltipDelaysComponent.ɵfac,
  templateUrl: "templates/tooltip-delays.component-d8aae459.html",
  controllerAs: "example"
}).component("docsTooltipGlobal", {
  controller: TooltipGlobalComponent.ɵfac,
  templateUrl: "templates/tooltip-global.component-38486b3f.html",
  controllerAs: "example"
}).component("docsTooltipPlacements", {
  controller: TooltipPlacementsComponent.ɵfac,
  templateUrl: "templates/tooltip-placements.component-ca0060f0.html",
  controllerAs: "example"
}).component("docsTooltipTemplate", {
  controller: TooltipTemplateComponent.ɵfac,
  templateUrl: "templates/tooltip-template.component-defe8d90.html",
  controllerAs: "example"
}).component("docsTooltipTriggers", {
  controller: TooltipTriggersComponent.ɵfac,
  templateUrl: "templates/tooltip-triggers.component-139330c7.html",
  controllerAs: "example"
}).factory("TooltipModule_13b86790", TooltipModule.ɵfac).run([
  "TooltipModule_13b86790",
  function() {
  }
]);
export {
  TooltipModule
};
