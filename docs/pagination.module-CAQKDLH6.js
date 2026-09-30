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
  TemplateRef,
  getValueInRange,
  inject,
  isNumber
} from "./chunk-26Q6D6UX.js";
import {
  CommonModule,
  EventEmitter,
  require_angular
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// src/app/features/pagination/pagination.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-LBCR766V.js
var import_angular = __toESM(require_angular(), 1);
var NgbPaginationEllipsis = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationEllipsis"] ? globalThis.ɵngjsInjected["NgbPaginationEllipsis"][0] : inject(TemplateRef);
  }
};
NgbPaginationEllipsis.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationEllipsis_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationEllipsis: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationEllipsis": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationEllipsis();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationEllipsis.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationEllipsis",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationEllipsis.ɵfac.ɵtype = NgbPaginationEllipsis;
var NgbPaginationFirst = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationFirst"] ? globalThis.ɵngjsInjected["NgbPaginationFirst"][0] : inject(TemplateRef);
  }
};
NgbPaginationFirst.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationFirst_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationFirst: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationFirst": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationFirst();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationFirst.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationFirst",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationFirst.ɵfac.ɵtype = NgbPaginationFirst;
var NgbPaginationLast = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationLast"] ? globalThis.ɵngjsInjected["NgbPaginationLast"][0] : inject(TemplateRef);
  }
};
NgbPaginationLast.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationLast_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationLast: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationLast": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationLast();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationLast.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationLast",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationLast.ɵfac.ɵtype = NgbPaginationLast;
var NgbPaginationNext = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationNext"] ? globalThis.ɵngjsInjected["NgbPaginationNext"][0] : inject(TemplateRef);
  }
};
NgbPaginationNext.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationNext_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationNext: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationNext": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationNext();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationNext.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationNext",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationNext.ɵfac.ɵtype = NgbPaginationNext;
var NgbPaginationNumber = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationNumber"] ? globalThis.ɵngjsInjected["NgbPaginationNumber"][0] : inject(TemplateRef);
  }
};
NgbPaginationNumber.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationNumber_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationNumber: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationNumber": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationNumber();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationNumber.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationNumber",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationNumber.ɵfac.ɵtype = NgbPaginationNumber;
var NgbPaginationPrevious = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationPrevious"] ? globalThis.ɵngjsInjected["NgbPaginationPrevious"][0] : inject(TemplateRef);
  }
};
NgbPaginationPrevious.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationPrevious_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationPrevious: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationPrevious": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationPrevious();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationPrevious.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationPrevious",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationPrevious.ɵfac.ɵtype = NgbPaginationPrevious;
var NgbPaginationPages = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPaginationPages"] ? globalThis.ɵngjsInjected["NgbPaginationPages"][0] : inject(TemplateRef);
  }
};
NgbPaginationPages.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbPaginationPages_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if ([
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbPaginationPages: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPaginationPages": [
        i0
      ]
    };
    try {
      var instance = new NgbPaginationPages();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPaginationPages.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbPaginationPages",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbPaginationPages.ɵfac.ɵtype = NgbPaginationPages;
var NgbPaginationConfig = class {
  constructor() {
    this.disabled = false;
    this.boundaryLinks = false;
    this.directionLinks = true;
    this.ellipses = true;
    this.maxSize = 0;
    this.pageSize = 10;
    this.rotate = false;
  }
};
NgbPaginationConfig.ɵfac = [
  function NgbPaginationConfig_Factory() {
    return new NgbPaginationConfig();
  }
];
NgbPaginationConfig.ɵprov = {
  token: "NgbPaginationConfig_c8e41bb0",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbPaginationConfig_c8e41bb0",
  NgbPaginationConfig.ɵfac
]);
var NgbPagination = class {
  isDisabled() {
    return this.disabled;
  }
  hasPrevious() {
    return this.page > 1;
  }
  hasNext() {
    return this.page < this.pageCount;
  }
  nextDisabled() {
    return !this.hasNext() || this.isDisabled();
  }
  previousDisabled() {
    return !this.hasPrevious() || this.isDisabled();
  }
  selectPage(pageNumber) {
    if (this.isDisabled()) return;
    this._updatePages(pageNumber);
  }
  ngOnChanges(_changes) {
    this._updatePages(this.page);
  }
  isEllipsis(pageNumber) {
    return pageNumber === -1;
  }
  _applyEllipses(start, end) {
    if (!this.ellipses) return;
    if (start > 0) {
      if (start > 2) this.pages.unshift(-1);
      if (start === 2) this.pages.unshift(2);
      this.pages.unshift(1);
    }
    if (end < this.pageCount) {
      if (end < this.pageCount - 2) this.pages.push(-1);
      if (end === this.pageCount - 2) this.pages.push(this.pageCount - 1);
      this.pages.push(this.pageCount);
    }
  }
  _applyRotation() {
    let start = 0;
    let end = this.pageCount;
    const leftOffset = Math.floor(this.maxSize / 2);
    const rightOffset = this.maxSize % 2 == 0 ? leftOffset - 1 : leftOffset;
    if (this.page <= leftOffset) {
      end = this.maxSize;
    } else if (this.pageCount - this.page < leftOffset) {
      start = this.pageCount - this.maxSize;
    } else {
      start = this.page - leftOffset - 1;
      end = this.page + rightOffset;
    }
    return [
      start,
      end
    ];
  }
  _applyPagination() {
    const page = Math.ceil(this.page / this.maxSize) - 1;
    const start = page * this.maxSize;
    const end = start + this.maxSize;
    return [
      start,
      end
    ];
  }
  _setPageInRange(newPageNo) {
    const prevPageNo = this.page;
    this.page = getValueInRange(newPageNo, this.pageCount, 1);
    if (this.page != prevPageNo && isNumber(this.collectionSize)) {
      this.pageChange.emit(this.page);
    }
  }
  _updatePages(newPage) {
    this.pageCount = Math.ceil(this.collectionSize / this.pageSize);
    if (!isNumber(this.pageCount)) {
      this.pageCount = 0;
    }
    this.pages.length = 0;
    for (let index = 1; index <= this.pageCount; index++) {
      this.pages.push(index);
    }
    this._setPageInRange(newPage);
    if (this.maxSize > 0 && this.pageCount > this.maxSize) {
      let start = 0;
      let end = this.pageCount;
      [start, end] = this.rotate ? this._applyRotation() : this._applyPagination();
      const visiblePages = this.pages.slice(start, end);
      this.pages.splice(0, this.pages.length, ...visiblePages);
      this._applyEllipses(start, end);
    }
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPagination"] ? globalThis.ɵngjsInjected["NgbPagination"][0] : inject(NgbPaginationConfig);
    this.pageCount = 0;
    this.pages = [];
    this.disabled = this._config.disabled;
    this.boundaryLinks = this._config.boundaryLinks;
    this.directionLinks = this._config.directionLinks;
    this.ellipses = this._config.ellipses;
    this.rotate = this._config.rotate;
    this.maxSize = this._config.maxSize;
    this.page = 1;
    this.pageSize = this._config.pageSize;
    this.pageChange = new EventEmitter();
    this.size = this._config.size;
    this._role = "navigation";
  }
};
NgbPagination.ɵfac = [
  "NgbPaginationConfig_c8e41bb0",
  "$element",
  "$scope",
  function NgbPagination_Factory(i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbPagination": [
        i0
      ]
    };
    try {
      var instance = new NgbPagination();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbPagination.ɵcmp = {
  selectors: [
    [
      "ngb-pagination"
    ]
  ],
  inputs: {
    "disabled": "disabled",
    "boundaryLinks": "boundaryLinks",
    "directionLinks": "directionLinks",
    "ellipses": "ellipses",
    "rotate": "rotate",
    "collectionSize": "collectionSize",
    "maxSize": "maxSize",
    "page": "page",
    "pageSize": "pageSize",
    "size": "size"
  },
  outputs: {
    "pageChange": "pageChange"
  },
  queries: [
    {
      propertyName: "tplEllipsis",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationEllipsis;
      }
    },
    {
      propertyName: "tplFirst",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationFirst;
      }
    },
    {
      propertyName: "tplLast",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationLast;
      }
    },
    {
      propertyName: "tplNext",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationNext;
      }
    },
    {
      propertyName: "tplNumber",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationNumber;
      }
    },
    {
      propertyName: "tplPrevious",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationPrevious;
      }
    },
    {
      propertyName: "tplPages",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbPaginationPages;
      }
    }
  ],
  definition: {
    "template": `<ng-template ng-ref="first">
    <span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span>
</ng-template>

<ng-template ng-ref="previous">
    <span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span>
</ng-template>

<ng-template ng-ref="next">
    <span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span>
</ng-template>

<ng-template ng-ref="last">
    <span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span>
</ng-template>

<ng-template ng-ref="ellipsis">...</ng-template>

<ng-template ng-ref="defaultNumber" let-page let-currentPage="currentPage">
    {{ page }}
</ng-template>

<ul class="pagination" ng-class="$.size ? 'pagination-' + $.size : null">
    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="First"
                i18n-aria-label="@@ngb.pagination.first-aria"
                class="page-link"
                href
                ng-click="$.selectPage(1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplFirst && $.tplFirst.templateRef) || first"
                    ng-template-outlet-context="{ disabled: $.previousDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="Previous"
                i18n-aria-label="@@ngb.pagination.previous-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page - 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplPrevious && $.tplPrevious.templateRef) || previous"
                    ng-template-outlet-context="{ disabled: $.previousDisabled() }">
            </ng-template>
        </a>
    </li>

    <li
            ng-repeat="pageNumber in ($.tplPages ? [] : $.pages) track by $index"
            class="page-item"
            ng-class="{ 'active': pageNumber === $.page, 'disabled': $.isEllipsis(pageNumber) || $.isDisabled() }">
        <a ng-if="$.isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
            <ng-template
                    ng-template-outlet="($.tplEllipsis && $.tplEllipsis.templateRef) || ellipsis"
                    ng-template-outlet-context="{ disabled: true, currentPage: $.page }">
            </ng-template>
        </a>

        <a
                ng-if="!$.isEllipsis(pageNumber)"
                class="page-link"
                href
                ng-click="$.selectPage(pageNumber); $event.preventDefault()"
                ng-attr-tabindex="{{ $.isDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.isDisabled() ? 'true' : undefined }}"
                ng-attr-aria-current="{{ pageNumber === $.page ? 'page' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNumber && $.tplNumber.templateRef) || defaultNumber"
                    ng-template-outlet-context="{ disabled: $.isDisabled(), $implicit: pageNumber, currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <ng-template
            ng-if="$.tplPages"
            ng-template-outlet="$.tplPages.templateRef"
            ng-template-outlet-context="{ $implicit: $.page, pages: $.pages, disabled: $.isDisabled() }">
    </ng-template>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Next"
                i18n-aria-label="@@ngb.pagination.next-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page + 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNext && $.tplNext.templateRef) || next"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Last"
                i18n-aria-label="@@ngb.pagination.last-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.pageCount); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}"
        >
            <ng-template
                    ng-template-outlet="($.tplLast && $.tplLast.templateRef) || last"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>
</ul>`,
    "bindings": {
      "disabled": "<?ngDisabled",
      "boundaryLinks": "<?",
      "directionLinks": "<?",
      "ellipses": "<?",
      "rotate": "<?",
      "collectionSize": "<?",
      "maxSize": "<?",
      "page": "<?",
      "pageSize": "<?",
      "size": "<?",
      "pageChange": "&?"
    },
    "transclude": true
  }
};
NgbPagination.ɵfac.ɵcomponent = true;
NgbPagination.ɵfac.ɵtype = NgbPagination;
NgbPagination.prototype.$onChanges = function(changesObj) {
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
    var c = changesObj["boundaryLinks"];
    if (!c) return;
    changes["boundaryLinks"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["directionLinks"];
    if (!c) return;
    changes["directionLinks"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["ellipses"];
    if (!c) return;
    changes["ellipses"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["rotate"];
    if (!c) return;
    changes["rotate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["collectionSize"];
    if (!c) return;
    changes["collectionSize"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["maxSize"];
    if (!c) return;
    changes["maxSize"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["page"];
    if (!c) return;
    changes["page"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["pageSize"];
    if (!c) return;
    changes["pageSize"] = {
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
var NgbPaginationModule = class {
};
NgbPaginationModule.ɵfac = [
  function NgbPaginationModule_Factory() {
    return new NgbPaginationModule();
  }
];
NgbPaginationModule.ɵmod = {
  id: "NgbPaginationModule_679545fa",
  controllerAs: "$"
};
import_angular.default.module("NgbPaginationModule_679545fa", [
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
]).component("ngbPagination", {
  controller: NgbPagination.ɵfac,
  template: `<ng-template ng-ref="first">
    <span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span>
</ng-template>

<ng-template ng-ref="previous">
    <span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span>
</ng-template>

<ng-template ng-ref="next">
    <span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span>
</ng-template>

<ng-template ng-ref="last">
    <span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span>
</ng-template>

<ng-template ng-ref="ellipsis">...</ng-template>

<ng-template ng-ref="defaultNumber" let-page let-currentPage="currentPage">
    {{ page }}
</ng-template>

<ul class="pagination" ng-class="$.size ? 'pagination-' + $.size : null">
    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="First"
                i18n-aria-label="@@ngb.pagination.first-aria"
                class="page-link"
                href
                ng-click="$.selectPage(1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplFirst && $.tplFirst.templateRef) || first"
                    ng-template-outlet-context="{ disabled: $.previousDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="Previous"
                i18n-aria-label="@@ngb.pagination.previous-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page - 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplPrevious && $.tplPrevious.templateRef) || previous"
                    ng-template-outlet-context="{ disabled: $.previousDisabled() }">
            </ng-template>
        </a>
    </li>

    <li
            ng-repeat="pageNumber in ($.tplPages ? [] : $.pages) track by $index"
            class="page-item"
            ng-class="{ 'active': pageNumber === $.page, 'disabled': $.isEllipsis(pageNumber) || $.isDisabled() }">
        <a ng-if="$.isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
            <ng-template
                    ng-template-outlet="($.tplEllipsis && $.tplEllipsis.templateRef) || ellipsis"
                    ng-template-outlet-context="{ disabled: true, currentPage: $.page }">
            </ng-template>
        </a>

        <a
                ng-if="!$.isEllipsis(pageNumber)"
                class="page-link"
                href
                ng-click="$.selectPage(pageNumber); $event.preventDefault()"
                ng-attr-tabindex="{{ $.isDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.isDisabled() ? 'true' : undefined }}"
                ng-attr-aria-current="{{ pageNumber === $.page ? 'page' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNumber && $.tplNumber.templateRef) || defaultNumber"
                    ng-template-outlet-context="{ disabled: $.isDisabled(), $implicit: pageNumber, currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <ng-template
            ng-if="$.tplPages"
            ng-template-outlet="$.tplPages.templateRef"
            ng-template-outlet-context="{ $implicit: $.page, pages: $.pages, disabled: $.isDisabled() }">
    </ng-template>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Next"
                i18n-aria-label="@@ngb.pagination.next-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page + 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNext && $.tplNext.templateRef) || next"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Last"
                i18n-aria-label="@@ngb.pagination.last-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.pageCount); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}"
        >
            <ng-template
                    ng-template-outlet="($.tplLast && $.tplLast.templateRef) || last"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>
</ul>`,
  controllerAs: "$",
  bindings: {
    "disabled": "<?ngDisabled",
    "boundaryLinks": "<?",
    "directionLinks": "<?",
    "ellipses": "<?",
    "rotate": "<?",
    "collectionSize": "<?",
    "maxSize": "<?",
    "page": "<?",
    "pageSize": "<?",
    "size": "<?",
    "pageChange": "&?"
  },
  transclude: true
}).directive("ngbPagination", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "page-change"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbPaginationEllipsis", function() {
  return {
    controller: NgbPaginationEllipsis.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationEllipsis"
  };
}).directive("ngbPaginationFirst", function() {
  return {
    controller: NgbPaginationFirst.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationFirst"
  };
}).directive("ngbPaginationLast", function() {
  return {
    controller: NgbPaginationLast.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationLast"
  };
}).directive("ngbPaginationNext", function() {
  return {
    controller: NgbPaginationNext.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationNext"
  };
}).directive("ngbPaginationNumber", function() {
  return {
    controller: NgbPaginationNumber.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationNumber"
  };
}).directive("ngbPaginationPrevious", function() {
  return {
    controller: NgbPaginationPrevious.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationPrevious"
  };
}).directive("ngbPaginationPages", function() {
  return {
    controller: NgbPaginationPages.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbPaginationPages"
  };
}).factory("NgbPaginationModule_c379a2ca", NgbPaginationModule.ɵfac).run([
  "NgbPaginationModule_c379a2ca",
  function() {
  }
]);

// src/app/features/pagination/pagination.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Pagination",
      tabs: [
        {
          name: "Examples",
          to: "/components/pagination/examples"
        },
        {
          name: "Api",
          to: "/components/pagination/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/pagination/",
        ngBootstrap: "components/pagination/overview"
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
              id: "basic-pagination",
              name: "Basic pagination"
            },
            {
              id: "advanced-pagination",
              name: "Advanced pagination"
            },
            {
              id: "custom-pagination",
              name: "Custom links and pages"
            },
            {
              id: "pagination-size",
              name: "Pagination size"
            },
            {
              id: "pagination-alignment",
              name: "Pagination alignment"
            },
            {
              id: "disabled-pagination",
              name: "Disabled pagination"
            },
            {
              id: "pagination-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./pagination-examples-page.component-I6EKA57J.js").then((m) => m.PaginationExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-pagination",
              name: "NgbPagination"
            },
            {
              id: "ngb-pagination-config",
              name: "NgbPaginationConfig"
            }
          ]
        },
        loadComponent: () => import("./pagination-api-page.component-R2LBHWPM.js").then((m) => m.PaginationApiPageComponent)
      }
    ]
  }
];

// src/app/features/pagination/components/advanced-pagination/advanced-pagination.component.ts
var AdvancedPaginationComponent = class {
  selectPaginatedPage(page) {
    this.paginatedPage = page;
  }
  selectRotatedPage(page) {
    this.rotatedPage = page;
  }
  selectCompactPage(page) {
    this.compactPage = page;
  }
  constructor() {
    this.paginatedPage = 7;
    this.rotatedPage = 12;
    this.compactPage = 12;
  }
};
(function() {
  var h = "styles/advanced-pagination.component-76c9e5a5.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
AdvancedPaginationComponent.ɵfac = [
  "$element",
  "$scope",
  function AdvancedPaginationComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new AdvancedPaginationComponent();
    return instance;
  }
];
AdvancedPaginationComponent.ɵcmp = {
  selectors: [
    [
      "docs-advanced-pagination"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/advanced-pagination.component-bb779627.html",
    "controllerAs": "example"
  }
};
AdvancedPaginationComponent.ɵfac.ɵcomponent = true;
AdvancedPaginationComponent.ɵfac.ɵtype = AdvancedPaginationComponent;

// src/app/features/pagination/components/basic-pagination/basic-pagination.component.ts
var BasicPaginationComponent = class {
  selectPage(page) {
    this.page = page;
  }
  constructor() {
    this.page = 4;
  }
};
(function() {
  var h = "styles/basic-pagination.component-b344f122.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
BasicPaginationComponent.ɵfac = [
  "$element",
  "$scope",
  function BasicPaginationComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new BasicPaginationComponent();
    return instance;
  }
];
BasicPaginationComponent.ɵcmp = {
  selectors: [
    [
      "docs-basic-pagination"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/basic-pagination.component-65e74c38.html",
    "controllerAs": "example"
  }
};
BasicPaginationComponent.ɵfac.ɵcomponent = true;
BasicPaginationComponent.ɵfac.ɵtype = BasicPaginationComponent;

// src/app/features/pagination/components/custom-pagination/custom-pagination.component.ts
var CustomPaginationComponent = class {
  selectPage(page) {
    this.page = page;
  }
  constructor() {
    this.page = 3;
  }
};
(function() {
  var h = "styles/custom-pagination.component-4b68ca02.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
CustomPaginationComponent.ɵfac = [
  "$element",
  "$scope",
  function CustomPaginationComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new CustomPaginationComponent();
    return instance;
  }
];
CustomPaginationComponent.ɵcmp = {
  selectors: [
    [
      "docs-custom-pagination"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/custom-pagination.component-36dbb269.html",
    "controllerAs": "example"
  }
};
CustomPaginationComponent.ɵfac.ɵcomponent = true;
CustomPaginationComponent.ɵfac.ɵtype = CustomPaginationComponent;

// src/app/features/pagination/components/disabled-pagination/disabled-pagination.component.ts
var DisabledPaginationComponent = class {
  selectPage(page) {
    this.page = page;
  }
  constructor() {
    this.page = 3;
    this.disabled = true;
  }
};
(function() {
  var h = "styles/disabled-pagination.component-d4d5bfe6.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
DisabledPaginationComponent.ɵfac = [
  "$element",
  "$scope",
  function DisabledPaginationComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new DisabledPaginationComponent();
    return instance;
  }
];
DisabledPaginationComponent.ɵcmp = {
  selectors: [
    [
      "docs-disabled-pagination"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/disabled-pagination.component-ee18f098.html",
    "controllerAs": "example"
  }
};
DisabledPaginationComponent.ɵfac.ɵcomponent = true;
DisabledPaginationComponent.ɵfac.ɵtype = DisabledPaginationComponent;

// src/app/features/pagination/components/pagination-alignment/pagination-alignment.component.ts
var PaginationAlignmentComponent = class {
  selectStartPage(page) {
    this.startPage = page;
  }
  selectCenterPage(page) {
    this.centerPage = page;
  }
  selectEndPage(page) {
    this.endPage = page;
  }
  constructor() {
    this.startPage = 2;
    this.centerPage = 2;
    this.endPage = 2;
  }
};
(function() {
  var h = "styles/pagination-alignment.component-9b1d8326.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PaginationAlignmentComponent.ɵfac = [
  "$element",
  "$scope",
  function PaginationAlignmentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PaginationAlignmentComponent();
    return instance;
  }
];
PaginationAlignmentComponent.ɵcmp = {
  selectors: [
    [
      "docs-pagination-alignment"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/pagination-alignment.component-28c13e8f.html",
    "controllerAs": "example"
  }
};
PaginationAlignmentComponent.ɵfac.ɵcomponent = true;
PaginationAlignmentComponent.ɵfac.ɵtype = PaginationAlignmentComponent;

// src/app/features/pagination/components/pagination-global/pagination-global.component.ts
var PaginationGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.page = 8;
    this.initialConfig = {
      boundaryLinks: config.boundaryLinks,
      directionLinks: config.directionLinks,
      maxSize: config.maxSize,
      rotate: config.rotate,
      size: config.size
    };
    config.boundaryLinks = true;
    config.directionLinks = false;
    config.maxSize = 5;
    config.rotate = true;
    config.size = "sm";
  }
  selectPage(page) {
    this.page = page;
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    this.config.boundaryLinks = this.initialConfig.boundaryLinks;
    this.config.directionLinks = this.initialConfig.directionLinks;
    this.config.maxSize = this.initialConfig.maxSize;
    this.config.rotate = this.initialConfig.rotate;
    this.config.size = this.initialConfig.size;
  }
};
(function() {
  var h = "styles/pagination-global.component-59d4578d.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PaginationGlobalComponent.ɵfac = [
  "NgbPaginationConfig_c8e41bb0",
  "$element",
  "$scope",
  function PaginationGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PaginationGlobalComponent(a0);
    return instance;
  }
];
PaginationGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-pagination-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/pagination-global.component-7999b716.html",
    "controllerAs": "example"
  }
};
PaginationGlobalComponent.ɵfac.ɵcomponent = true;
PaginationGlobalComponent.ɵfac.ɵtype = PaginationGlobalComponent;
PaginationGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
PaginationGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/pagination/components/pagination-size/pagination-size.component.ts
var PaginationSizeComponent = class {
  selectSmallPage(page) {
    this.smallPage = page;
  }
  selectDefaultPage(page) {
    this.defaultPage = page;
  }
  selectLargePage(page) {
    this.largePage = page;
  }
  constructor() {
    this.smallPage = 2;
    this.defaultPage = 2;
    this.largePage = 2;
  }
};
(function() {
  var h = "styles/pagination-size.component-ba8a5cf4.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PaginationSizeComponent.ɵfac = [
  "$element",
  "$scope",
  function PaginationSizeComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PaginationSizeComponent();
    return instance;
  }
];
PaginationSizeComponent.ɵcmp = {
  selectors: [
    [
      "docs-pagination-size"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/pagination-size.component-8a6ad340.html",
    "controllerAs": "example"
  }
};
PaginationSizeComponent.ɵfac.ɵcomponent = true;
PaginationSizeComponent.ɵfac.ɵtype = PaginationSizeComponent;

// src/app/features/pagination/pagination.module.ts
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
var PaginationModule = class {
};
PaginationModule.ɵfac = [
  function PaginationModule_Factory() {
    return new PaginationModule();
  }
];
var ɵPaginationModule_import0 = RouterModule.forChild(routes);
PaginationModule.ɵmod = {
  id: "PaginationModule_ff517f77"
};
ɵimportProviders(import_angular2.default.module("PaginationModule_ff517f77", [
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbPaginationModule === "string" ? NgbPaginationModule : NgbPaginationModule.ɵmod ? NgbPaginationModule.ɵmod.id : NgbPaginationModule.name,
  ɵimportedModuleName(ɵPaginationModule_import0)
]), [
  ɵPaginationModule_import0
]).component("docsAdvancedPagination", {
  controller: AdvancedPaginationComponent.ɵfac,
  templateUrl: "templates/advanced-pagination.component-bb779627.html",
  controllerAs: "example"
}).component("docsBasicPagination", {
  controller: BasicPaginationComponent.ɵfac,
  templateUrl: "templates/basic-pagination.component-65e74c38.html",
  controllerAs: "example"
}).component("docsCustomPagination", {
  controller: CustomPaginationComponent.ɵfac,
  templateUrl: "templates/custom-pagination.component-36dbb269.html",
  controllerAs: "example"
}).component("docsDisabledPagination", {
  controller: DisabledPaginationComponent.ɵfac,
  templateUrl: "templates/disabled-pagination.component-ee18f098.html",
  controllerAs: "example"
}).component("docsPaginationAlignment", {
  controller: PaginationAlignmentComponent.ɵfac,
  templateUrl: "templates/pagination-alignment.component-28c13e8f.html",
  controllerAs: "example"
}).component("docsPaginationGlobal", {
  controller: PaginationGlobalComponent.ɵfac,
  templateUrl: "templates/pagination-global.component-7999b716.html",
  controllerAs: "example"
}).component("docsPaginationSize", {
  controller: PaginationSizeComponent.ɵfac,
  templateUrl: "templates/pagination-size.component-8a6ad340.html",
  controllerAs: "example"
}).factory("PaginationModule_9ba63a27", PaginationModule.ɵfac).run([
  "PaginationModule_9ba63a27",
  function() {
  }
]);
export {
  PaginationModule
};
