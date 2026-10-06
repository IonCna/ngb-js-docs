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
  BehaviorSubject,
  ReplaySubject,
  Subject,
  filter,
  takeUntil
} from "./chunk-XNJFRLIU.js";
import {
  NgbOffcanvasModule
} from "./chunk-KEPJRYVE.js";
import {
  NgbModalModule
} from "./chunk-CCY4DJEX.js";
import {
  NgbTooltipModule
} from "./chunk-ACCHARCX.js";
import {
  NgbScrollSpyModule
} from "./chunk-R7GTDWT4.js";
import {
  NavigationEnd,
  RouterModule
} from "./chunk-UVJQY4BU.js";
import "./chunk-BJK3QUXG.js";
import {
  bootstrapApplication,
  inject
} from "./chunk-U6UIHJCB.js";
import {
  InjectionToken,
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/app.module.ts
var import_angular5 = __toESM(require_angular(), 1);

// src/app/app.component.ts
var AppComponent = class {
};
AppComponent.ɵfac = [
  "$element",
  "$scope",
  function AppComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AppComponent)();
    return instance;
  }
];
AppComponent.ɵcmp = {
  selectors: [
    [
      "app-root"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "template": "<ui-view></ui-view>"
  }
};
AppComponent.ɵfac.ɵcomponent = true;
AppComponent.ɵfac.ɵtype = AppComponent;

// src/app/core/core.module.ts
var import_angular3 = __toESM(require_angular(), 1);

// src/app/core/layouts/layout.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// src/app/core/layouts/components/footer/footer.component.ts
var FooterComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = "footer[_content-1da26b4f]{color:var(--bs-secondary-color);border-color:color-mix(in srgb,var(--bs-border-color) 75%,transparent)!important;background:color-mix(in srgb,var(--bs-body-bg) 92%,var(--bs-tertiary-bg))}a[_content-1da26b4f]{color:inherit;text-decoration-color:color-mix(in srgb,currentColor 35%,transparent)}a:hover[_content-1da26b4f]{color:var(--bs-link-hover-color)}";
  document.head.appendChild(s);
})();
FooterComponent.ɵfac = [
  "$element",
  "$scope",
  function FooterComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || FooterComponent)();
    return instance;
  }
];
FooterComponent.ɵcmp = {
  selectors: [
    [
      "docs-footer"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/footer.component-74f5e35d.html"
  }
};
FooterComponent.ɵfac.ɵcomponent = true;
FooterComponent.ɵfac.ɵtype = FooterComponent;

// src/app/core/search-index.ts
function tokenize(text) {
  return text.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2").toLowerCase().replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
}
function buildSearchIndex(language, documents3) {
  const data = /* @__PURE__ */ new Map();
  for (const current of documents3) {
    const context = current.translations[language];
    for (const chunk of tokenize(Object.values(context).join(" "))) {
      if (!chunk) continue;
      const existing = data.get(chunk);
      if (existing) existing.add(current.id);
      else data.set(chunk, /* @__PURE__ */ new Set([
        current.id
      ]));
    }
  }
  return data;
}

// src/app/core/constants/language.constant.ts
var Language = /* @__PURE__ */ (function(Language2) {
  Language2["ES_MX"] = "es_mx";
  Language2["EN_US"] = "en_us";
  return Language2;
})({});

// src/app/core/constants/themes.constant.ts
var Themes = /* @__PURE__ */ (function(Themes2) {
  Themes2["light"] = "light";
  Themes2["dark"] = "dark";
  return Themes2;
})({});

// src/app/core/tokens.ts
var THEME_STORAGE_KEY = new InjectionToken("docs.theme.storageKey");
var LANGUAGE_STORAGE_KEY = new InjectionToken("docs.language.storageKey");
var THEMES_ENUM = new InjectionToken("docs.themes.enum");
var SEARCH_DOCUMENTS = new InjectionToken("docs.search.documents");
var BOOTSTRAP_URL = new InjectionToken("docs.bootstrapUrl");
var NG_BOOTSTRAP_URL = new InjectionToken("docs.ngBootstrapUrl");
var THEME = new InjectionToken("docs.theme");
var LANGUAGE = new InjectionToken("docs.language");
var INDEXING = new InjectionToken("docs.indexing");
function bootstrapUrlFactory(config) {
  return `${config.url}/docs/${config.version}/`;
}
function ngBootstrapUrlFactory(config) {
  return `${config.url}/#/`;
}
function themeFactory(storageKey) {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return matchMedia("(prefers-color-scheme: dark)").matches ? Themes.dark : Themes.light;
  }
  if (!(saved in Themes)) throw new Error("this theme is not valid");
  return saved;
}
function languageFactory(storageKey) {
  const saved = localStorage.getItem(storageKey);
  if (!saved || !(saved.toUpperCase() in Language)) return Language.EN_US;
  return saved;
}
THEME_STORAGE_KEY.ɵprov = {
  token: "THEME_STORAGE_KEY_3039135a"
};
LANGUAGE_STORAGE_KEY.ɵprov = {
  token: "LANGUAGE_STORAGE_KEY_1438a9dc"
};
THEMES_ENUM.ɵprov = {
  token: "THEMES_ENUM_1b687200"
};
SEARCH_DOCUMENTS.ɵprov = {
  token: "SEARCH_DOCUMENTS_117b00f2"
};
BOOTSTRAP_URL.ɵprov = {
  token: "BOOTSTRAP_URL_c33137ca"
};
NG_BOOTSTRAP_URL.ɵprov = {
  token: "NG_BOOTSTRAP_URL_c3f6f7a5"
};
THEME.ɵprov = {
  token: "THEME_fcda928d"
};
LANGUAGE.ɵprov = {
  token: "LANGUAGE_a3d2cfaa"
};
INDEXING.ɵprov = {
  token: "INDEXING_9ae97040"
};

// src/app/core/services/search.service.ts
var MAX_RESULTS = 8;
var SearchService = class {
  constructor(index, documents3, language) {
    this.index = index;
    this.language = language;
    this.documentsById = new Map(documents3.map((document2) => [
      document2.id,
      document2
    ]));
  }
  search(query) {
    const terms = tokenize(query);
    if (terms.length !== 1) return [];
    const [term] = terms;
    const documentIds = new Set(this.index.get(term));
    for (const [indexedTerm, ids] of this.index) {
      if (indexedTerm === term || !indexedTerm.startsWith(term)) continue;
      for (const id of ids) {
        documentIds.add(id);
      }
    }
    return [
      ...documentIds
    ].flatMap((id) => {
      const document2 = this.documentsById.get(id);
      if (!document2) return [];
      const translation = document2.translations[this.language];
      return [
        {
          id: document2.id,
          url: document2.url,
          fragment: document2.fragment,
          title: translation.title,
          content: translation.content
        }
      ];
    }).slice(0, MAX_RESULTS);
  }
};
SearchService.ɵfac = [
  "INDEXING_9ae97040",
  "SEARCH_DOCUMENTS_117b00f2",
  "LANGUAGE_a3d2cfaa",
  function SearchService_Factory(a0, a1, a2) {
    return new (this && this.ɵT || SearchService)(a0, a1, a2);
  }
];
SearchService.ɵprov = {
  token: "SearchService_c7962832"
};

// src/app/core/layouts/components/search-modal/search-modal.component.ts
var SEARCH_RECENTS_STORAGE_KEY = "docs.search.recents";
var MAX_RECENT_DOCUMENTS = 10;
var SearchModalComponent = class {
  constructor(searchService, elementRef, router) {
    this.searchService = searchService;
    this.elementRef = elementRef;
    this.router = router;
    this.query = "";
    this.results = [];
    this.recentDocuments = [];
  }
  ngOnInit() {
    this.recentDocuments = this.getRecentDocuments();
    this.activeDocumentId = this.recentDocuments[0]?.id;
  }
  ngAfterViewInit() {
    this.elementRef.nativeElement.classList.add("h-100", "d-flex", "flex-column", "overflow-hidden");
  }
  search() {
    this.results = this.searchService.search(this.query);
    this.activeDocumentId = this.visibleDocuments[0]?.id;
  }
  handleKeydown(event) {
    if (event.key === "Enter") {
      const activeDocument = this.visibleDocuments.find((document1) => document1.id === this.activeDocumentId);
      if (!activeDocument) return;
      event.preventDefault();
      this.selectDocument(activeDocument);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const documents3 = this.visibleDocuments;
    if (!documents3.length) return;
    event.preventDefault();
    const currentIndex = documents3.findIndex((document1) => document1.id === this.activeDocumentId);
    const nextIndex = event.key === "ArrowDown" ? (currentIndex + 1) % documents3.length : currentIndex <= 0 ? documents3.length - 1 : currentIndex - 1;
    this.activeDocumentId = documents3[nextIndex].id;
    requestAnimationFrame(() => {
      this.elementRef.nativeElement.querySelector(".list-group-item.active")?.scrollIntoView({
        block: "nearest"
      });
    });
  }
  activateDocument(document1) {
    this.activeDocumentId = document1.id;
  }
  selectDocument(document1) {
    this.ngbActiveModal.close(document1);
    void this.router.navigateByUrl(document1.url).then(() => {
      requestAnimationFrame(() => {
        globalThis.document.getElementById(document1.fragment)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }
  clearRecentDocuments() {
    localStorage.removeItem(SEARCH_RECENTS_STORAGE_KEY);
    this.recentDocuments = [];
    this.activeDocumentId = this.results[0]?.id;
  }
  get visibleDocuments() {
    const documents3 = this.query ? [
      ...this.results,
      ...this.recentDocuments.slice(0, 2)
    ] : this.recentDocuments;
    const ids = /* @__PURE__ */ new Set();
    return documents3.filter((document1) => {
      if (ids.has(document1.id)) return false;
      ids.add(document1.id);
      return true;
    });
  }
  getRecentDocuments() {
    const storedDocuments = localStorage.getItem(SEARCH_RECENTS_STORAGE_KEY);
    if (!storedDocuments) return [];
    try {
      const documents3 = JSON.parse(storedDocuments);
      return Array.isArray(documents3) ? documents3.slice(0, MAX_RECENT_DOCUMENTS) : [];
    } catch {
      return [];
    }
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".modal-header[_content-452bfb42]{background:color-mix(in srgb,var(--bs-tertiary-bg) 78%,var(--bs-body-bg))}.form-control[_content-452bfb42]{border-color:var(--bs-border-color);background:var(--bs-body-bg)}.list-group-item[_content-452bfb42]{border-color:var(--bs-border-color)}.list-group-item:hover[_content-452bfb42]{background:var(--bs-tertiary-bg)}.badge[_content-452bfb42]{font-weight:650}";
  document.head.appendChild(s);
})();
SearchModalComponent.ɵfac = [
  "SearchService_c7962832",
  "ElementRef_927308a2",
  "Router_ad76dc05",
  "$element",
  "$scope",
  function SearchModalComponent_Factory(a0, a1, a2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SearchModalComponent)(a0, a1, a2);
    return instance;
  }
];
SearchModalComponent.ɵcmp = {
  selectors: [
    [
      "docs-search-modal"
    ]
  ],
  inputs: {
    "ngbActiveModal": "ngbActiveModal"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/search-modal.component-f0d270ea.html",
    "bindings": {
      "ngbActiveModal": "<?"
    }
  }
};
SearchModalComponent.ɵfac.ɵcomponent = true;
SearchModalComponent.ɵfac.ɵtype = SearchModalComponent;
SearchModalComponent.prototype.$onInit = function() {
  this.ngOnInit();
};
SearchModalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/core/services/theme.service.ts
var ThemeService = class {
  constructor(_currentTheme, themeStorageKey, document2) {
    this._currentTheme = _currentTheme;
    this.themeStorageKey = themeStorageKey;
    this.document = document2;
    this._applyTheme(this._currentTheme);
  }
  get activeTheme() {
    return this._currentTheme;
  }
  toggle() {
    this._currentTheme = this._currentTheme === Themes.light ? Themes.dark : Themes.light;
    this._applyTheme(this._currentTheme);
  }
  setActive(theme) {
    this._applyTheme(theme);
  }
  _applyTheme(theme) {
    this._currentTheme = theme;
    this.document.documentElement.setAttribute("data-bs-theme", this._currentTheme);
    this.saveInLocalStorage(this._currentTheme);
  }
  saveInLocalStorage(value) {
    localStorage.setItem(this.themeStorageKey, value);
  }
};
ThemeService.ɵfac = [
  "THEME_fcda928d",
  "THEME_STORAGE_KEY_3039135a",
  "DOCUMENT_a3a362b8",
  function ThemeService_Factory(a0, a1, a2) {
    return new (this && this.ɵT || ThemeService)(a0, a1, a2);
  }
];
ThemeService.ɵprov = {
  token: "ThemeService_7aad7fc5"
};

// src/app/core/layouts/components/menu/menu.component.ts
var MenuComponent = class {
  constructor(elementRef) {
    this.elementRef = elementRef;
    this.mode = "desktop";
  }
  ngAfterViewInit() {
    if (this.mode === "mobile") {
      this.elementRef.nativeElement.classList.add("h-100", "d-flex", "flex-column");
    }
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "nav[_content-005327c4]{color:var(--bs-body-color)}section+section[_content-005327c4]{padding-top:.5rem}h2[_content-005327c4]{letter-spacing:.04em}.nav-pills[_content-005327c4]{--bs-nav-pills-link-active-bg: var(--bs-primary-bg-subtle);--bs-nav-pills-link-active-color: var(--bs-primary-text-emphasis)}.nav-link[_content-005327c4]{color:var(--bs-secondary-color);border:1px solid transparent;transition:background-color .15s ease,border-color .15s ease,color .15s ease}.nav-link:hover[_content-005327c4]{color:var(--bs-emphasis-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 78%,transparent);border-color:color-mix(in srgb,var(--bs-border-color) 65%,transparent)}.nav-link.active[_content-005327c4]{color:var(--bs-primary-text-emphasis);background:var(--bs-primary-bg-subtle);border-color:var(--bs-primary-border-subtle);box-shadow:inset .18rem 0 0 var(--bs-primary)}.offcanvas-header[_content-005327c4]{background:var(--bs-tertiary-bg)}";
  document.head.appendChild(s);
})();
MenuComponent.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function MenuComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || MenuComponent)(a0);
    return instance;
  }
];
MenuComponent.ɵcmp = {
  selectors: [
    [
      "docs-menu"
    ]
  ],
  inputs: {
    "mode": "mode",
    "ngbActiveOffcanvas": "ngbActiveOffcanvas"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/menu.component-ae88a330.html",
    "bindings": {
      "mode": "@?",
      "ngbActiveOffcanvas": "<?"
    }
  }
};
MenuComponent.ɵfac.ɵcomponent = true;
MenuComponent.ɵfac.ɵtype = MenuComponent;
MenuComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/core/services/menu.service.ts
var MenuService = class {
  constructor(offCanvasService) {
    this.offCanvasService = offCanvasService;
    this._isOpen = false;
    this._change = new Subject();
    this.onChange$ = this._change.asObservable();
  }
  toggleMenu() {
    if (this._isOpen || this.offCanvasService.hasOpenOffcanvas()) {
      return;
    }
    this._setOpenState(true);
    this.offCanvasService.open(MenuComponent, {
      bindings: {
        mode: "mobile"
      },
      ariaLabelledBy: "docs-mobile-menu-title",
      animation: true,
      backdrop: true,
      keyboard: true,
      panelClass: "border-0 shadow",
      position: "start",
      scroll: false
    }).then((offcanvasRef) => {
      offcanvasRef.result?.finally(() => this._setOpenState(false));
    }, () => {
      this._setOpenState(false);
    });
  }
  _setOpenState(isOpen) {
    this._isOpen = isOpen;
    this._change.next(this._isOpen);
  }
};
MenuService.ɵfac = [
  "NgbOffcanvas_51c49d46",
  function MenuService_Factory(a0) {
    return new (this && this.ɵT || MenuService)(a0);
  }
];
MenuService.ɵprov = {
  token: "MenuService_5b087ccb",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "MenuService_5b087ccb",
  MenuService.ɵfac
]);

// src/app/core/layouts/components/header/header.component.ts
var brandLogoDarkUrl = "assets/brand/ngb-js-logo-dark.png";
var brandLogoLightUrl = "assets/brand/ngb-js-logo-light.png";
var HeaderComponent = class {
  constructor(modalService, themeService, themes, menuService, document1) {
    this.modalService = modalService;
    this.themeService = themeService;
    this.themes = themes;
    this.menuService = menuService;
    this.document = document1;
    this.brandLogoDarkUrl = brandLogoDarkUrl;
    this.brandLogoLightUrl = brandLogoLightUrl;
    this.handleSearchShortcut = (event) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (!this.modalService.hasOpenModals()) {
        this.openModal();
      }
    };
  }
  ngOnInit() {
    this.document.addEventListener("keydown", this.handleSearchShortcut);
  }
  ngOnDestroy() {
    this.document.removeEventListener("keydown", this.handleSearchShortcut);
  }
  openModal() {
    void this.modalService.open(SearchModalComponent, {
      fullscreen: "md",
      size: "lg",
      scrollable: true,
      animation: false
    }).then((modalRef) => {
      modalRef.result?.then((result) => {
        if (result) this.saveRecentDocument(result);
      }, () => {
      });
    }, () => {
    });
  }
  saveRecentDocument(document1) {
    const storedDocuments = localStorage.getItem(SEARCH_RECENTS_STORAGE_KEY);
    let recentDocuments = [];
    if (storedDocuments) {
      try {
        const documents3 = JSON.parse(storedDocuments);
        recentDocuments = Array.isArray(documents3) ? documents3 : [];
      } catch {
        recentDocuments = [];
      }
    }
    const updatedDocuments = [
      document1,
      ...recentDocuments.filter((recent) => recent.id !== document1.id)
    ].slice(0, MAX_RECENT_DOCUMENTS);
    localStorage.setItem(SEARCH_RECENTS_STORAGE_KEY, JSON.stringify(updatedDocuments));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".navbar[_content-778d7079]{background:color-mix(in srgb,var(--bs-body-bg) 92%,transparent)!important;border-color:color-mix(in srgb,var(--bs-border-color) 70%,transparent)!important;backdrop-filter:saturate(140%) blur(14px)}.navbar-brand[_content-778d7079]{color:var(--bs-emphasis-color);font-weight:750}.btn-link[_content-778d7079]{width:2.75rem;height:2.75rem;border-radius:50%;text-decoration:none}.btn-link:hover[_content-778d7079]{background:var(--bs-tertiary-bg)}.btn-outline-secondary[_content-778d7079]{background:var(--bs-body-bg);border-color:var(--bs-border-color);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 .5rem 1.5rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-secondary:hover[_content-778d7079]{color:var(--bs-emphasis-color);background:var(--bs-tertiary-bg)}kbd[_content-778d7079]{color:var(--bs-secondary-color);background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);box-shadow:none}";
  document.head.appendChild(s);
})();
HeaderComponent.ɵfac = [
  "NgbModal_da91379e",
  "ThemeService_7aad7fc5",
  "THEMES_ENUM_1b687200",
  "MenuService_5b087ccb",
  "DOCUMENT_a3a362b8",
  "$element",
  "$scope",
  function HeaderComponent_Factory(a0, a1, a2, a3, a4, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || HeaderComponent)(a0, a1, a2, a3, a4);
    return instance;
  }
];
HeaderComponent.ɵcmp = {
  selectors: [
    [
      "docs-header"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/header.component-68d0f706.html"
  }
};
HeaderComponent.ɵfac.ɵcomponent = true;
HeaderComponent.ɵfac.ɵtype = HeaderComponent;
HeaderComponent.prototype.$onInit = function() {
  this.ngOnInit();
};
HeaderComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/core/layouts/pages/menu-abstract-page/menu-abstract-page.component.ts
var MenuAbstractPageComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".vh-100[_content-51f0c3a7]{background:var(--bs-body-bg)}.bg-body-tertiary[_content-51f0c3a7]{background:color-mix(in srgb,var(--bs-tertiary-bg) 92%,var(--bs-body-bg))!important}.border-end[_content-51f0c3a7],.border-start[_content-51f0c3a7]{border-color:color-mix(in srgb,var(--bs-border-color) 75%,transparent)!important}#docs-content-scroll[_content-51f0c3a7]{background:linear-gradient(180deg,var(--bs-body-bg),color-mix(in srgb,var(--bs-tertiary-bg) 22%,var(--bs-body-bg)))}";
  document.head.appendChild(s);
})();
MenuAbstractPageComponent.ɵfac = [
  "$element",
  "$scope",
  function MenuAbstractPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || MenuAbstractPageComponent)();
    return instance;
  }
];
MenuAbstractPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-menu-abstract-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/menu-abstract-page.component-ab9f43c6.html"
  }
};
MenuAbstractPageComponent.ɵfac.ɵcomponent = true;
MenuAbstractPageComponent.ɵfac.ɵtype = MenuAbstractPageComponent;

// src/app/shared/shared.module.ts
var import_angular = __toESM(require_angular(), 1);

// src/app/shared/components/copy-button/copy-button.component.ts
var CopyButtonComponent = class {
  copy() {
    window.navigator.clipboard.writeText(this.value).then(() => {
      setTimeout(() => {
        this.copied = true;
      });
      setTimeout(() => {
        this.copied = false;
      });
    });
  }
  constructor() {
    this.copied = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".btn[_content-08a60860]{--bs-btn-padding-x: .55rem;--bs-btn-padding-y: .3rem;display:inline-grid;place-items:center;min-width:2rem;min-height:2rem;border-radius:50%}.btn:hover[_content-08a60860]{background:color-mix(in srgb,currentColor 10%,transparent)}.bi[_content-08a60860]{color:currentColor}";
  document.head.appendChild(s);
})();
CopyButtonComponent.ɵfac = [
  "$element",
  "$scope",
  function CopyButtonComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CopyButtonComponent)();
    return instance;
  }
];
CopyButtonComponent.ɵcmp = {
  selectors: [
    [
      "docs-copy-button"
    ]
  ],
  inputs: {
    "value": "value",
    "ariaLabel": "ariaLabel",
    "buttonClass": "buttonClass"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/copy-button.component-c9415ad5.html",
    "bindings": {
      "value": "<?",
      "ariaLabel": "@?",
      "buttonClass": "@?"
    }
  }
};
CopyButtonComponent.ɵfac.ɵcomponent = true;
CopyButtonComponent.ɵfac.ɵtype = CopyButtonComponent;

// src/app/shared/components/example-section/example-section.component.ts
var ExampleSectionComponent = class {
  toggleCode() {
    this.codeCollapsed = !this.codeCollapsed;
  }
  get hasAdditionalCode() {
    return Boolean(this.tsCode || this.cssCode);
  }
  get activeCode() {
    if (this.activeTab === "typescript") return this.tsCode ?? "";
    if (this.activeTab === "css") return this.cssCode ?? "";
    return this.htmlCode;
  }
  constructor() {
    this.htmlCode = "";
    this.codeCollapsed = true;
    this.activeTab = "html";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-3f5c827f]{scroll-margin-top:5rem;padding-bottom:3.25rem!important;margin-bottom:3.25rem!important;border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}header[_content-3f5c827f]{padding:1rem 1.1rem;border:1px solid color-mix(in srgb,var(--bs-border-color) 70%,transparent);border-radius:var(--bs-border-radius-lg);background:color-mix(in srgb,var(--bs-tertiary-bg) 55%,transparent)}h2[_content-3f5c827f]{color:var(--bs-emphasis-color)}.btn-outline-secondary[_content-3f5c827f]{border-color:var(--bs-border-color);background:var(--bs-body-bg)}.border.rounded-3[_content-3f5c827f]{border-color:color-mix(in srgb,var(--bs-border-color) 82%,transparent)!important;box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.04)}pre[_content-3f5c827f]{max-height:34rem;font-size:.875rem;line-height:1.55}code[_content-3f5c827f]{color:var(--ngbjs-code-color)}.nav-tabs[_content-3f5c827f]{--bs-nav-tabs-border-color: transparent}.nav-tabs .nav-link[_content-3f5c827f]{color:var(--bs-secondary-color);border-radius:var(--bs-border-radius) var(--bs-border-radius)0 0}.nav-tabs .nav-link.active[_content-3f5c827f]{color:var(--bs-primary);background:var(--bs-body-bg);border-color:var(--bs-border-color) var(--bs-border-color) var(--bs-body-bg)}";
  document.head.appendChild(s);
})();
ExampleSectionComponent.ɵfac = [
  "$element",
  "$scope",
  function ExampleSectionComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ExampleSectionComponent)();
    return instance;
  }
];
ExampleSectionComponent.ɵcmp = {
  selectors: [
    [
      "docs-example-section"
    ]
  ],
  inputs: {
    "fragment": "fragment",
    "title": "title",
    "description": "description",
    "htmlCode": "htmlCode",
    "tsCode": "tsCode",
    "cssCode": "cssCode"
  },
  outputs: {},
  definition: {
    "templateUrl": "templates/example-section.component-643ddba3.html",
    "controllerAs": "example",
    "bindings": {
      "fragment": "@?",
      "title": "@?",
      "description": "@?",
      "htmlCode": "<?",
      "tsCode": "<?",
      "cssCode": "<?"
    },
    "transclude": true
  }
};
ExampleSectionComponent.ɵfac.ɵcomponent = true;
ExampleSectionComponent.ɵfac.ɵtype = ExampleSectionComponent;

// src/app/core/services/title.service.ts
var TitleService = class {
  get currentTab() {
    return this._currentTab;
  }
  set currentTab(tab) {
    this._currentTab = tab;
  }
  constructor(activatedRoute, router) {
    this.activatedRoute = activatedRoute;
    this.router = router;
    this._transition = new ReplaySubject(1);
    this.transition$ = this._transition.asObservable();
    this.activatedRoute.data.subscribe((data) => {
      this._currentTab = this.router.url;
      this._transition.next({
        title: data.title,
        header: data.header ?? true,
        tabs: data.tabs ?? [],
        sections: data.sections,
        externalLinks: data.externalLinks
      });
    });
  }
};
TitleService.ɵfac = [
  "ActivatedRoute_07e48dff",
  "Router_ad76dc05",
  function TitleService_Factory(a0, a1) {
    return new (this && this.ɵT || TitleService)(a0, a1);
  }
];
TitleService.ɵprov = {
  token: "TitleService_a4901420",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "TitleService_a4901420",
  TitleService.ɵfac
]);

// src/app/shared/components/page-outline/page-outline.component.ts
var PageOutlineComponent = class {
  constructor(bootstrapUrl, ngBootstrapUrl) {
    this.bootstrapUrl = bootstrapUrl;
    this.ngBootstrapUrl = ngBootstrapUrl;
    this.destroyRef = new Subject();
    this.titleService = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["PageOutlineComponent"] ? globalThis.ɵngjsInjected["PageOutlineComponent"][0] : inject(TitleService);
    this.sections = [];
  }
  get bootstrapHref() {
    return this.externalLinks?.bootstrap ? `${this.bootstrapUrl}${this.externalLinks.bootstrap}` : void 0;
  }
  get ngBootstrapHref() {
    return this.externalLinks?.ngBootstrap ? `${this.ngBootstrapUrl}${this.externalLinks.ngBootstrap}` : void 0;
  }
  ngOnInit() {
    this.titleService.transition$.pipe(takeUntil(this.destroyRef)).subscribe((data) => {
      this.title = data.title;
      this.sections = data.sections ?? [];
      this.externalLinks = data.externalLinks;
    });
  }
  ngOnDestroy() {
    this.destroyRef.next();
    this.destroyRef.complete();
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "aside[_content-4979fabb]{max-height:100vh;overflow:auto;background:color-mix(in srgb,var(--bs-body-bg) 70%,transparent)}h2[_content-4979fabb]{letter-spacing:.04em}.nav-link[_content-4979fabb]{color:var(--bs-secondary-color);border-left:2px solid transparent}.nav-link:hover[_content-4979fabb]{color:var(--bs-emphasis-color)}.nav-link.active[_content-4979fabb]{color:var(--bs-primary);border-left-color:var(--bs-primary)}hr[_content-4979fabb]{color:var(--bs-border-color);opacity:1}";
  document.head.appendChild(s);
})();
PageOutlineComponent.ɵfac = [
  "BOOTSTRAP_URL_c33137ca",
  "NG_BOOTSTRAP_URL_c3f6f7a5",
  "TitleService_a4901420",
  "$element",
  "$scope",
  function PageOutlineComponent_Factory(a0, a1, i0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "PageOutlineComponent": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || PageOutlineComponent)(a0, a1);
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
PageOutlineComponent.ɵcmp = {
  selectors: [
    [
      "docs-page-outline"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/page-outline.component-558c79a2.html"
  }
};
PageOutlineComponent.ɵfac.ɵcomponent = true;
PageOutlineComponent.ɵfac.ɵtype = PageOutlineComponent;
PageOutlineComponent.prototype.$onInit = function() {
  this.ngOnInit();
};
PageOutlineComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/shared/components/title-heading/title-heading.component.ts
var TitleHeadingComponent = class {
  constructor(titleService) {
    this.titleService = titleService;
    this.destroyRef = new Subject();
    this.visible = false;
  }
  ngOnInit() {
    this.titleService.transition$.pipe(takeUntil(this.destroyRef)).subscribe((data) => {
      this.title = data.title;
      this.tabs = data.tabs;
      this.visible = data.header;
    });
  }
  ngOnDestroy() {
    this.destroyRef.next();
    this.destroyRef.complete();
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "header[_content-b07774c0]{padding-top:.75rem}h1[_content-b07774c0]{color:var(--bs-emphasis-color);letter-spacing:0}nav[_content-b07774c0]{border-color:color-mix(in srgb,var(--bs-border-color) 80%,transparent)!important}.nav-underline[_content-b07774c0]{min-width:max-content}.nav-link[_content-b07774c0],a[ngb-nav-link][_content-b07774c0]{color:var(--bs-secondary-color);border-bottom-color:transparent}.nav-link.active[_content-b07774c0],a[ngb-nav-link].active[_content-b07774c0]{color:var(--bs-primary);border-bottom-color:var(--bs-primary)}";
  document.head.appendChild(s);
})();
TitleHeadingComponent.ɵfac = [
  "TitleService_a4901420",
  "$element",
  "$scope",
  function TitleHeadingComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || TitleHeadingComponent)(a0);
    return instance;
  }
];
TitleHeadingComponent.ɵcmp = {
  selectors: [
    [
      "docs-title-heading"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/title-heading.component-86fc702b.html",
    "controllerAs": "$"
  }
};
TitleHeadingComponent.ɵfac.ɵcomponent = true;
TitleHeadingComponent.ɵfac.ɵtype = TitleHeadingComponent;
TitleHeadingComponent.prototype.$onInit = function() {
  this.ngOnInit();
};
TitleHeadingComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/shared/shared.module.ts
var SharedModule = class {
};
SharedModule.ɵfac = [
  function SharedModule_Factory() {
    return new (this && this.ɵT || SharedModule)();
  }
];
SharedModule.ɵmod = {
  id: "SharedModule_375469b0",
  controllerAs: "$"
};
import_angular.default.module("SharedModule_375469b0", []).component("docsCopyButton", {
  controller: CopyButtonComponent.ɵfac,
  templateUrl: "templates/copy-button.component-c9415ad5.html",
  controllerAs: "$",
  bindings: {
    "value": "<?",
    "ariaLabel": "@?",
    "buttonClass": "@?"
  }
}).component("docsExampleSection", {
  controller: ExampleSectionComponent.ɵfac,
  templateUrl: "templates/example-section.component-643ddba3.html",
  controllerAs: "example",
  transclude: true,
  bindings: {
    "fragment": "@?",
    "title": "@?",
    "description": "@?",
    "htmlCode": "<?",
    "tsCode": "<?",
    "cssCode": "<?"
  }
}).component("docsPageOutline", {
  controller: PageOutlineComponent.ɵfac,
  templateUrl: "templates/page-outline.component-558c79a2.html",
  controllerAs: "$"
}).component("docsTitleHeading", {
  controller: TitleHeadingComponent.ɵfac,
  templateUrl: "templates/title-heading.component-86fc702b.html",
  controllerAs: "$"
}).factory("SharedModule_b3e973aa", SharedModule.ɵfac).run([
  "SharedModule_b3e973aa",
  function() {
  }
]);

// src/app/core/layouts/layout.module.ts
var LayoutModule = class {
};
LayoutModule.ɵfac = [
  function LayoutModule_Factory() {
    return new (this && this.ɵT || LayoutModule)();
  }
];
LayoutModule.ɵmod = {
  id: "LayoutModule_7d9a7e54",
  controllerAs: "$"
};
import_angular2.default.module("LayoutModule_7d9a7e54", [
  SharedModule.ɵmod.id,
  typeof NgbModalModule === "string" ? NgbModalModule : NgbModalModule.ɵmod ? NgbModalModule.ɵmod.id : NgbModalModule.name,
  typeof NgbOffcanvasModule === "string" ? NgbOffcanvasModule : NgbOffcanvasModule.ɵmod ? NgbOffcanvasModule.ɵmod.id : NgbOffcanvasModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name
]).component("docsFooter", {
  controller: FooterComponent.ɵfac,
  templateUrl: "templates/footer.component-74f5e35d.html",
  controllerAs: "$"
}).component("docsHeader", {
  controller: HeaderComponent.ɵfac,
  templateUrl: "templates/header.component-68d0f706.html",
  controllerAs: "$"
}).component("docsMenu", {
  controller: MenuComponent.ɵfac,
  templateUrl: "templates/menu.component-ae88a330.html",
  controllerAs: "$",
  bindings: {
    "mode": "@?",
    "ngbActiveOffcanvas": "<?"
  }
}).component("docsSearchModal", {
  controller: SearchModalComponent.ɵfac,
  templateUrl: "templates/search-modal.component-f0d270ea.html",
  controllerAs: "$",
  bindings: {
    "ngbActiveModal": "<?"
  }
}).component("docsMenuAbstractPage", {
  controller: MenuAbstractPageComponent.ɵfac,
  templateUrl: "templates/menu-abstract-page.component-ab9f43c6.html",
  controllerAs: "$"
}).factory("LayoutModule_141bd423", LayoutModule.ɵfac).run([
  "LayoutModule_141bd423",
  function() {
  }
]);

// src/assets/documents/index.json
var documents = [
  {
    id: "guide.introduction.origin",
    url: "/guide/introduction",
    fragment: "origin",
    translations: {
      en_us: {
        title: "Born from a real legacy application",
        content: "NgbJS began inside a large AngularJS application that was still essential to the business, but too complex to migrate all at once. The application needed to keep evolving and deliver a modern interface while staying aligned with another product built with modern Angular and ng-bootstrap. A feature created for the modern application, such as a payment flow, also needed an AngularJS counterpart. In the modern codebase, ng-bootstrap provided the components and their behavior. In the legacy application, the same work meant copying markup, adapting it to the older stack, and rebuilding interactions by hand-often only partially. NgbJS grew out of that repeated translation work: bring the ng-bootstrap experience to AngularJS and reduce the distance between both applications. One component model Build familiar experiences across AngularJS and Angular without reinventing every component for the legacy application. Modern Angular + ng-bootstrap Legacy AngularJS + NgbJS"
      },
      es_mx: {
        title: "Nacido de una aplicacion legacy real",
        content: "NgbJS comenzo dentro de una gran aplicacion AngularJS que seguia siendo esencial para el negocio, pero era demasiado compleja para migrarla de una sola vez. La aplicacion necesitaba continuar evolucionando y ofrecer una interfaz moderna mientras se mantenia alineada con otro producto construido con Angular moderno y ng-bootstrap. Una funcionalidad creada para la aplicacion moderna, como un flujo de pagos, tambien necesitaba una version equivalente en AngularJS. En el codigo moderno, ng-bootstrap proporcionaba los componentes y su comportamiento. En la aplicacion legacy, el mismo trabajo implicaba copiar el marcado, adaptarlo a la tecnologia anterior y reconstruir las interacciones manualmente, muchas veces solo de forma parcial. NgbJS surgio de ese trabajo repetido de traduccion: llevar la experiencia de ng-bootstrap a AngularJS y reducir la distancia entre ambas aplicaciones. Un solo modelo de componentes. Construye experiencias familiares en AngularJS y Angular sin reinventar cada componente para la aplicacion legacy."
      }
    }
  },
  {
    id: "guide.introduction.what-is-ngbjs",
    url: "/guide/introduction",
    fragment: "what-is-ngbjs",
    translations: {
      en_us: {
        title: "What is NgbJS?",
        content: "NgbJS is a port of ng-bootstrap for AngularJS, designed to preserve its API and behavior as closely as the differences between the two frameworks allow. It is more than a collection of visually similar components. NgbJS aims to preserve the same mental model: developers who know ng-bootstrap should recognize its components, services, options, and interaction patterns, then move between AngularJS and Angular with fewer changes. Features that initially appeared difficult to reproduce were not simply discarded. Supporting them also led to complementary infrastructure such as ngjs-core , which brings capabilities required by NgbJS into the AngularJS environment."
      },
      es_mx: {
        title: "Que es NgbJS?",
        content: "NgbJS es una adaptacion de ng-bootstrap para AngularJS, disenada para conservar su API y comportamiento tan fielmente como lo permiten las diferencias entre ambos frameworks. Es mas que una coleccion de componentes visualmente similares. NgbJS busca conservar el mismo modelo mental: los desarrolladores que conocen ng-bootstrap deberian reconocer sus componentes, servicios, opciones y patrones de interaccion, y asi moverse entre AngularJS y Angular con menos cambios. Las funcionalidades que al principio parecian dificiles de reproducir no fueron simplemente descartadas. Darles soporte tambien llevo a crear infraestructura complementaria como ngjs-core, que incorpora al entorno de AngularJS las capacidades que NgbJS necesita."
      }
    }
  },
  {
    id: "guide.introduction.who-is-it-for",
    url: "/guide/introduction",
    fragment: "who-is-it-for",
    translations: {
      en_us: {
        title: "Who is it for?",
        content: "NgbJS is intended for teams whose AngularJS applications still need to grow, even when a full migration is not immediately possible. Long-lived applications Critical AngularJS systems that will remain in production and continue receiving features for years. Mixed technology stacks Products where AngularJS and modern Angular applications must provide consistent interfaces and behavior. Gradual migrations Teams preparing for a future migration while working within current time, budget, or architectural constraints. ng-bootstrap developers Developers who want familiar Bootstrap components and APIs when moving between modern Angular and AngularJS codebases. NgbJS is not a reason to choose AngularJS for a new application. It exists to help established AngularJS systems modernize and move forward."
      },
      es_mx: {
        title: "Para quien es?",
        content: "NgbJS esta pensado para equipos cuyas aplicaciones AngularJS todavia necesitan crecer, incluso cuando una migracion completa no es posible de inmediato. Aplicaciones de larga duracion: sistemas criticos en AngularJS que permaneceran en produccion y seguiran recibiendo funcionalidades durante anos. Tecnologias combinadas: productos donde aplicaciones AngularJS y Angular moderno deben ofrecer interfaces y comportamientos consistentes. Migraciones graduales: equipos que se preparan para una migracion futura mientras trabajan con restricciones actuales de tiempo, presupuesto o arquitectura. Desarrolladores de ng-bootstrap: desarrolladores que quieren componentes y APIs de Bootstrap familiares al moverse entre codigo Angular moderno y AngularJS. NgbJS no es una razon para elegir AngularJS en una aplicacion nueva. Existe para ayudar a los sistemas AngularJS establecidos a modernizarse y seguir avanzando."
      }
    }
  },
  {
    id: "guide.introduction.project-status",
    url: "/guide/introduction",
    fragment: "project-status",
    translations: {
      en_us: {
        title: "Project status",
        content: "Beta NgbJS is in beta because some components are still under review and may contain known bugs or edge cases that are not yet fully covered. Its syntax and intended behavior follow ng-bootstrap and are not expected to change as part of this review; ongoing work focuses on validation, fixes, and bringing each implementation to full parity."
      },
      es_mx: {
        title: "Estado del proyecto",
        content: "Beta. NgbJS esta en beta porque algunos componentes todavia estan en revision y pueden contener errores conocidos o casos limite que aun no estan completamente cubiertos. Su sintaxis y comportamiento esperado siguen a ng-bootstrap y no se espera que cambien como parte de esta revision; el trabajo actual se concentra en la validacion, las correcciones y en llevar cada implementacion a una paridad completa."
      }
    }
  },
  {
    id: "guide.introduction.installation",
    url: "/guide/introduction",
    fragment: "installation",
    translations: {
      en_us: {
        title: "Installation",
        content: "Add NgbJS to your project with your preferred package manager."
      },
      es_mx: {
        title: "Instalacion",
        content: "Agrega NgbJS a tu proyecto con el administrador de paquetes que prefieras. Elige npm, pnpm, yarn o bun y ejecuta el comando de instalacion correspondiente."
      }
    }
  },
  {
    id: "guide.introduction.acknowledgements",
    url: "/guide/introduction",
    fragment: "acknowledgements",
    translations: {
      en_us: {
        title: "Built on the work of ng-bootstrap",
        content: "NgbJS exists thanks to the outstanding work of the ng-bootstrap team and community . Its API, architecture, components, and documentation have been the primary reference for this port. Portions of this documentation are adapted from the official ng-bootstrap documentation , licensed under CC BY 3.0 . Changes were made to reflect AngularJS, the NgbJS API, and this project's examples. Parts of NgbJS are derived from and adapted from the ng-bootstrap source code, used under the terms of its MIT License . NgbJS is an independent project and is not part of the official ng-bootstrap project. It is built with deep respect and gratitude for the people who created and continue to maintain the original library."
      },
      es_mx: {
        title: "Construido sobre el trabajo de ng-bootstrap",
        content: "NgbJS existe gracias al extraordinario trabajo del equipo y la comunidad de ng-bootstrap. Su API, arquitectura, componentes y documentacion han sido la referencia principal para esta adaptacion. Algunas partes de esta documentacion estan adaptadas de la documentacion oficial de ng-bootstrap, publicada bajo la licencia CC BY 3.0. Se realizaron cambios para reflejar AngularJS, la API de NgbJS y los ejemplos de este proyecto. Algunas partes de NgbJS derivan y estan adaptadas del codigo fuente de ng-bootstrap, utilizado bajo los terminos de su licencia MIT. NgbJS es un proyecto independiente y no forma parte del proyecto oficial ng-bootstrap. Esta construido con profundo respeto y gratitud hacia las personas que crearon y continuan manteniendo la biblioteca original."
      }
    }
  },
  {
    id: "guide.philosophy.parity-is-priority",
    url: "/guide/philosophy",
    fragment: "parity-is-priority",
    translations: {
      en_us: {
        title: "Parity is Priority.",
        content: "The guiding principle The closer NgbJS stays to ng-bootstrap, the less developers need to relearn, rewrite, or reinterpret when moving between AngularJS and Angular."
      },
      es_mx: {
        title: "La paridad es la prioridad.",
        content: "Cuanto mas se acerque NgbJS a ng-bootstrap, menos tendran que reaprender, reescribir o reinterpretar los desarrolladores al moverse entre AngularJS y Angular."
      }
    }
  },
  {
    id: "guide.philosophy.what-parity-means",
    url: "/guide/philosophy",
    fragment: "what-parity-means",
    translations: {
      en_us: {
        title: "What parity means",
        content: "Parity is not limited to matching how a component looks. It is pursued across the entire developer experience. API parity Components, services, configuration options, and public names should remain recognizable to developers coming from ng-bootstrap. Syntax parity Templates should express the same intent with as little framework-specific translation as possible. Behavioral parity Interaction, state, defaults, and edge cases should behave consistently across both libraries. Conceptual parity The same mental model should apply, so knowledge gained in one codebase remains useful in the other."
      },
      es_mx: {
        title: "Que significa la paridad",
        content: "La paridad no se limita a igualar la apariencia de un componente. Incluye la API, la sintaxis, el comportamiento y el modelo conceptual para que la experiencia de desarrollo sea consistente."
      }
    }
  },
  {
    id: "guide.philosophy.familiar-by-design",
    url: "/guide/philosophy",
    fragment: "familiar-by-design",
    translations: {
      en_us: {
        title: "Familiar by design",
        content: "NgbJS does not introduce a different API simply because it runs on AngularJS. When ng-bootstrap already provides a well-understood solution, reproducing that solution is more valuable than inventing a new abstraction. Familiarity reduces context switching for teams maintaining both generations of an application. Documentation, examples, and previous experience become transferable instead of being tied to only one framework. A simple decision rule If ng-bootstrap users already know how a component should work, NgbJS should make that knowledge useful."
      },
      es_mx: {
        title: "Familiar por diseno",
        content: "NgbJS no introduce una API diferente solo porque funciona sobre AngularJS. Reproducir las soluciones conocidas de ng-bootstrap reduce el cambio de contexto y permite reutilizar documentacion, ejemplos y experiencia."
      }
    }
  },
  {
    id: "guide.philosophy.a-migration-bridge",
    url: "/guide/philosophy",
    fragment: "a-migration-bridge",
    translations: {
      en_us: {
        title: "A bridge between codebases",
        content: "Parity makes day-to-day development easier now and makes a future migration more predictable. Legacy AngularJS Existing application and business logic Bridge NgbJS Familiar components, APIs, and behavior Modern Angular ng-bootstrap and the target architecture"
      },
      es_mx: {
        title: "Un puente entre bases de codigo",
        content: "La paridad facilita el desarrollo cotidiano y hace mas predecible una migracion futura. AngularJS representa la aplicacion existente, NgbJS aporta componentes y APIs familiares, y Angular con ng-bootstrap representa la arquitectura objetivo."
      }
    }
  },
  {
    id: "guide.philosophy.when-parity-is-hard",
    url: "/guide/philosophy",
    fragment: "when-parity-is-hard",
    translations: {
      en_us: {
        title: "When exact parity is difficult",
        content: "AngularJS and Angular have different component models, template syntax, and runtime capabilities. Small differences are sometimes unavoidable, but they should be deliberate, limited, and easy to understand. A feature is not rejected only because AngularJS cannot reproduce it directly. NgbJS first looks for a compatible implementation that preserves the original behavior. Some of those efforts required supporting libraries such as ngjs-core to provide capabilities that AngularJS did not have on its own. Some parts of ng-bootstrap could be reused directly, while others had to be adapted or reimplemented for AngularJS. In every case, the goal is to preserve the closest practical parity in API, intent, and behavior."
      },
      es_mx: {
        title: "Cuando la paridad exacta es dificil",
        content: "AngularJS y Angular tienen modelos de componentes, sintaxis de plantillas y capacidades de ejecucion diferentes. Las diferencias inevitables deben ser deliberadas, limitadas y faciles de comprender. NgbJS busca la implementacion compatible mas cercana antes de descartar una funcionalidad."
      }
    }
  },
  {
    id: "guide.why-ngbjs.the-legacy-reality",
    url: "/guide/why-ngbjs",
    fragment: "the-legacy-reality",
    translations: {
      en_us: {
        title: "The legacy reality",
        content: "A full migration is not always the next available step. Large AngularJS applications often contain years of business rules, integrations, and operational knowledge. Replacing them can demand more time, budget, and coordination than a team currently has, even while users continue to expect new features and current interfaces. Without a modern component library, teams must either stop improving the interface or rebuild common interactions themselves. Neither option makes the legacy application easier to maintain or eventually migrate."
      },
      es_mx: {
        title: "La realidad de los sistemas legacy",
        content: "Una migracion completa no siempre es el siguiente paso disponible. Las aplicaciones AngularJS grandes contienen anos de reglas de negocio, integraciones y conocimiento operativo, mientras sus usuarios continuan esperando funciones nuevas e interfaces actuales."
      }
    }
  },
  {
    id: "guide.why-ngbjs.before-and-after",
    url: "/guide/why-ngbjs",
    fragment: "before-and-after",
    translations: {
      en_us: {
        title: "From repeated adaptation to a shared model",
        content: "Without NgbJS Copy the modern component markup. Translate it to AngularJS syntax. Rebuild interactions and state by hand. Accept incomplete or inconsistent behavior. Maintain two unrelated implementations over time. With NgbJS Start from a familiar ng-bootstrap API. Reuse the same component model and terminology. Rely on packaged, documented behavior. Reduce differences between both applications. Make later migration work more predictable."
      },
      es_mx: {
        title: "De adaptaciones repetidas a un modelo compartido",
        content: "Sin NgbJS, los equipos copian marcado, lo traducen a AngularJS y reconstruyen manualmente las interacciones. Con NgbJS pueden partir de una API conocida de ng-bootstrap, reutilizar el mismo modelo y reducir las diferencias entre aplicaciones."
      }
    }
  },
  {
    id: "guide.why-ngbjs.what-it-unlocks",
    url: "/guide/why-ngbjs",
    fragment: "what-it-unlocks",
    translations: {
      en_us: {
        title: "What NgbJS unlocks",
        content: "The value is not only in the components themselves, but in the consistency they create. Modern interfaces Give active AngularJS products current Bootstrap components and interactions. A familiar API Let ng-bootstrap experience remain useful when developers work in AngularJS. Less divergence Keep parallel applications closer in terminology, behavior, and implementation. Less custom maintenance Replace one-off, partially implemented components with reusable library behavior. Transferable knowledge Share concepts, documentation patterns, and conventions across framework versions. A clearer migration path Reduce the conceptual changes required when a component eventually moves to Angular."
      },
      es_mx: {
        title: "Lo que NgbJS hace posible",
        content: "NgbJS aporta interfaces modernas, una API familiar, menos divergencia entre aplicaciones, menos mantenimiento personalizado, conocimiento transferible y una ruta de migracion mas clara."
      }
    }
  },
  {
    id: "guide.why-ngbjs.when-to-use-ngbjs",
    url: "/guide/why-ngbjs",
    fragment: "when-to-use-ngbjs",
    translations: {
      en_us: {
        title: "When should you use NgbJS?",
        content: "A strong fit Your AngularJS application will remain active. A complete migration is not currently realistic. Modern and legacy applications must stay consistent. Your team already knows ng-bootstrap. You want to make a gradual migration less disruptive. Probably not the right fit You are starting a new application. You can use modern Angular and ng-bootstrap directly. Your product does not use Bootstrap. Your legacy application is already close to retirement."
      },
      es_mx: {
        title: "Cuando deberias usar NgbJS?",
        content: "NgbJS encaja cuando una aplicacion AngularJS seguira activa, una migracion completa aun no es realista y el equipo necesita consistencia con Angular moderno. No es la opcion indicada para aplicaciones nuevas que pueden usar Angular y ng-bootstrap directamente."
      }
    }
  },
  {
    id: "guide.why-ngbjs.a-bridge-not-a-destination",
    url: "/guide/why-ngbjs",
    fragment: "a-bridge-not-a-destination",
    translations: {
      en_us: {
        title: "A bridge, not a destination",
        content: "NgbJS does not make AngularJS the right choice for new products, and it does not replace a migration strategy. It helps valuable existing applications move forward while that strategy becomes possible. Explore the components"
      },
      es_mx: {
        title: "Un puente, no un destino",
        content: "NgbJS no convierte a AngularJS en la eleccion correcta para productos nuevos ni sustituye una estrategia de migracion. Ayuda a que las aplicaciones existentes sigan avanzando mientras esa estrategia se vuelve posible."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion",
    url: "/components/accordion/api",
    fragment: "ngb-accordion",
    translations: {
      en_us: {
        title: "NgbAccordion",
        content: "Directive Root directive that coordinates all accordion items. It applies the Bootstrap accordion structure, controls whether multiple items may remain open and exposes methods for toggling items by id. Markup <div ngb-accordion> Inputs Input Binding Type Default Description animation <? boolean $config.animation Enables the collapse transition. close-others <? boolean false Closes the currently expanded item before another one opens. destroy-on-hide <? boolean true Removes a collapsed item's body view from the DOM. Outputs Output Binding Payload Emitted when show &? $event: string An item starts expanding; $event is its id. shown &? $event: string An item finishes expanding. hide &? $event: string An item starts collapsing. hidden &? $event: string An item finishes collapsing."
      },
      es_mx: {
        title: "NgbAccordion",
        content: "Referencia del directiva NgbAccordion. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordion, <div ngb-accordion>, animation, <?, boolean, $config.animation, close-others, false, destroy-on-hide, true, show, &?, $event: string, $event, shown, hide, hidden."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-item",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-item",
    translations: {
      en_us: {
        title: "NgbAccordionItem",
        content: `Directive Represents one collapsible item. It owns the item id and collapsed state, applies per-item destroyOnHide behavior and emits the item lifecycle events. Markup <div ngb-accordion-item="'details'"> Requires An ancestor ngb-accordion ; optionally reads disabled . Inputs Input Binding Type Default Description ngb-accordion-item <? string Generated id Expression that identifies the item in the parent accordion. collapsed <? boolean true Controls the initial and current collapsed state. destroy-on-hide <? boolean Inherited Overrides the parent accordion setting for this item. disabled <? boolean false Prevents the item's trigger from changing its state. Outputs Output Binding Payload Emitted when show &? None This item starts expanding. shown &? None This item finishes expanding. hide &? None This item starts collapsing. hidden &? None This item finishes collapsing.`
      },
      es_mx: {
        title: "NgbAccordionItem",
        content: `Referencia del directiva NgbAccordionItem. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionItem, destroyOnHide, <div ngb-accordion-item="'details'">, ngb-accordion, disabled, ngb-accordion-item, <?, string, collapsed, boolean, true, destroy-on-hide, false, show, &?, shown, hide, hidden.`
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-header",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-header",
    translations: {
      en_us: {
        title: "NgbAccordionHeader",
        content: "Directive Marks an item's heading container. It adds the Bootstrap header class and heading semantics, and mirrors the collapsed state without handling the toggle action itself. Markup <h2 ngb-accordion-header> Requires An ancestor ngb-accordion-item . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbAccordionHeader",
        content: "Referencia del directiva NgbAccordionHeader. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionHeader, <h2 ngb-accordion-header>, ngb-accordion-item."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-button",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-button",
    translations: {
      en_us: {
        title: "NgbAccordionButton",
        content: "Directive Provides the standard Bootstrap accordion trigger. It configures the button type, classes and ARIA state, respects the item disabled state and toggles its containing item when clicked. Markup <button ngb-accordion-button> Requires Ancestor controllers for ngb-accordion-item and ngb-accordion . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbAccordionButton",
        content: "Referencia del directiva NgbAccordionButton. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionButton, disabled, <button ngb-accordion-button>, ngb-accordion-item, ngb-accordion."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-toggle",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-toggle",
    translations: {
      en_us: {
        title: "NgbAccordionToggle",
        content: "Directive Adds toggle behavior and accessible state to custom header markup. use it when the trigger should not receive the standard accordion-button presentation supplied by NgbAccordionButton . Markup <span ngb-accordion-toggle> Requires Ancestor controllers for ngb-accordion-item and ngb-accordion . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbAccordionToggle",
        content: "Referencia del directiva NgbAccordionToggle. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionToggle, accordion-button, NgbAccordionButton, <span ngb-accordion-toggle>, ngb-accordion-item, ngb-accordion."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-body",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-body",
    translations: {
      en_us: {
        title: "NgbAccordionBody",
        content: "Directive Hosts the item's body template. Content is supplied through a child ng-template and its embedded view is created or destroyed according to the item state and destroyOnHide . Markup <div ngb-accordion-body> Requires An ancestor ngb-accordion-item . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbAccordionBody",
        content: "Referencia del directiva NgbAccordionBody. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionBody, ng-template, destroyOnHide, <div ngb-accordion-body>, ngb-accordion-item."
      }
    }
  },
  {
    id: "components.accordion.api.ngb-accordion-config",
    url: "/components/accordion/api",
    fragment: "ngb-accordion-config",
    translations: {
      en_us: {
        title: "NgbAccordionConfig",
        content: "Service Provides application-wide default values for accordions. Configure it once during application setup; values supplied directly to an ngb-accordion instance take precedence. Properties Property Type Default Description animation boolean $config.animation Sets the default animation behavior for every accordion. closeOthers boolean false Sets whether opening an item closes the previously expanded item. destroyOnHide boolean true Sets whether hidden body views are removed from the DOM."
      },
      es_mx: {
        title: "NgbAccordionConfig",
        content: "Referencia del servicio NgbAccordionConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAccordionConfig, ngb-accordion, animation, boolean, $config.animation, closeOthers, false, destroyOnHide, true."
      }
    }
  },
  {
    id: "components.alert.api.ngb-alert",
    url: "/components/alert/api",
    fragment: "ngb-alert",
    translations: {
      en_us: {
        title: "NgbAlert",
        content: 'Component Displays contextual feedback and optionally provides a dismiss action with an animated close transition. Markup <ngb-alert> Inputs Input Binding Type Default Description animation <? boolean $config.animation Enables the close transition. dismissible <? boolean true Shows the dismiss button. type @? string "warning" Sets the Bootstrap contextual type. Outputs Output Binding Payload Emitted when closed &? None The close transition finishes.'
      },
      es_mx: {
        title: "NgbAlert",
        content: 'Referencia del componente NgbAlert. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAlert, <ngb-alert>, animation, <?, boolean, $config.animation, dismissible, true, type, @?, string, "warning", closed, &?.'
      }
    }
  },
  {
    id: "components.alert.api.ngb-alert-config",
    url: "/components/alert/api",
    fragment: "ngb-alert-config",
    translations: {
      en_us: {
        title: "NgbAlertConfig",
        content: 'Service Provides application-wide defaults for alert instances. Properties Property Type Default Description animation boolean $config.animation Default close animation state. dismissible boolean true Default dismissible state. type string "warning" Default contextual type.'
      },
      es_mx: {
        title: "NgbAlertConfig",
        content: 'Referencia del servicio NgbAlertConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbAlertConfig, animation, boolean, $config.animation, dismissible, true, type, string, "warning".'
      }
    }
  },
  {
    id: "components.carousel.api.ngb-carousel",
    url: "/components/carousel/api",
    fragment: "ngb-carousel",
    translations: {
      en_us: {
        title: "NgbCarousel",
        content: "Component Coordinates slides, navigation, cycling, pause behavior and transitions. Markup <ngb-carousel> Inputs Input Binding Type Default Description active-id @? string First slide Identifies the active slide. animation <? boolean $config.animation Enables slide transitions. interval <? number 5000 Delay between automatic slides in milliseconds; 0 disables cycling. keyboard <? boolean true Enables keyboard navigation. pause-on-focus <? boolean true Pauses cycling while focused. pause-on-hover <? boolean true Pauses cycling while hovered. show-navigation-arrows <? boolean true Displays previous and next controls. show-navigation-indicators <? boolean true Displays slide indicators. wrap <? boolean true Wraps navigation at the first and last slide. Outputs Output Binding Payload Emitted when slide &? $event: NgbSlideEvent A slide transition starts. slid &? $event: NgbSlideEvent A slide transition finishes."
      },
      es_mx: {
        title: "NgbCarousel",
        content: "Referencia del componente NgbCarousel. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbCarousel, <ngb-carousel>, active-id, @?, string, animation, <?, boolean, $config.animation, interval, number, 5000, 0, keyboard, true, pause-on-focus, pause-on-hover, show-navigation-arrows, show-navigation-indicators, wrap, slide, &?, $event: NgbSlideEvent, slid."
      }
    }
  },
  {
    id: "components.carousel.api.ngb-slide",
    url: "/components/carousel/api",
    fragment: "ngb-slide",
    translations: {
      en_us: {
        title: "NgbSlide",
        content: "Directive Marks projected content as a carousel slide. Markup <ng-template ngb-slide> Requires An ancestor ngb-carousel . Bindings Name Binding Type Default Description id @? string Generated id Identifies the slide. slid &? $event: NgbSingleSlideEvent - Runs when this slide completes a transition."
      },
      es_mx: {
        title: "NgbSlide",
        content: "Referencia del directiva NgbSlide. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbSlide, <ng-template ngb-slide>, ngb-carousel, id, @?, string, slid, &?, $event: NgbSingleSlideEvent."
      }
    }
  },
  {
    id: "components.carousel.api.ngb-carousel-config",
    url: "/components/carousel/api",
    fragment: "ngb-carousel-config",
    translations: {
      en_us: {
        title: "NgbCarouselConfig",
        content: "Service Provides application-wide carousel defaults. Properties Property Type Default animation boolean $config.animation interval number 5000 wrap , keyboard , pauseOnFocus , pauseOnHover boolean true showNavigationArrows , showNavigationIndicators boolean true"
      },
      es_mx: {
        title: "NgbCarouselConfig",
        content: "Referencia del servicio NgbCarouselConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbCarouselConfig, animation, boolean, $config.animation, interval, number, 5000, wrap, keyboard, pauseOnFocus, pauseOnHover, true, showNavigationArrows, showNavigationIndicators."
      }
    }
  },
  {
    id: "components.collapse.api.ngb-collapse",
    url: "/components/collapse/api",
    fragment: "ngb-collapse",
    translations: {
      en_us: {
        title: "NgbCollapse",
        content: 'Directive Controls the visible state of an element and runs vertical or horizontal Bootstrap collapse transitions. Markup <div ngb-collapse="isCollapsed"> Inputs Input Binding Type Default Description ngb-collapse < boolean Required Sets whether the host is collapsed. animation <? boolean $config.animation Enables transition animation. horizontal <? boolean false uses width instead of height for the transition. Outputs Output Binding Payload Emitted when ngb-collapse-change &? $event: boolean toggle() changes the collapsed state. shown &? None The expand transition finishes. ngb-hidden &? None The collapse transition finishes.'
      },
      es_mx: {
        title: "NgbCollapse",
        content: 'Referencia del directiva NgbCollapse. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbCollapse, <div ngb-collapse="isCollapsed">, ngb-collapse, <, boolean, animation, <?, $config.animation, horizontal, false, ngb-collapse-change, &?, $event: boolean, toggle(), shown, ngb-hidden.'
      }
    }
  },
  {
    id: "components.collapse.api.ngb-collapse-config",
    url: "/components/collapse/api",
    fragment: "ngb-collapse-config",
    translations: {
      en_us: {
        title: "NgbCollapseConfig",
        content: "Service Provides application-wide defaults for collapse directives. Properties Property Type Default Description animation boolean $config.animation Default transition animation state. horizontal boolean false Default transition orientation."
      },
      es_mx: {
        title: "NgbCollapseConfig",
        content: "Referencia del servicio NgbCollapseConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbCollapseConfig, animation, boolean, $config.animation, horizontal, false."
      }
    }
  },
  {
    id: "components.datepicker.api.ngb-datepicker",
    url: "/components/datepicker/api",
    fragment: "ngb-datepicker",
    translations: {
      en_us: {
        title: "NgbDatepicker",
        content: 'Component Renders an inline calendar and integrates its selected date with AngularJS forms. Markup <ngb-datepicker ng-model="date"> Integration Optionally reads ng-model and disabled . Inputs Input Binding Default Description calendar <? NgbCalendarGregorian Calendar system used for date arithmetic. date-adapter <? NgbDateStructAdapter Converts between the model and NgbDateStruct . i18n <? NgbDatepickerI18nDefault Supplies localized labels. display-months <? 1 Number of visible months. first-day-of-week <? 1 First weekday, from 1 (Monday) to 7 (Sunday). min-date , max-date <? undefined Selectable date boundaries. start-date <? undefined Initial month displayed when no model is selected. navigation @? "select" Accepts "select" , "arrows" or "none" . outside-days @? "visible" Controls days outside the current month. weekdays <? "narrow" Controls weekday labels and width. show-week-numbers <? false Displays week numbers. mark-disabled <? undefined Function that disables individual dates. day-template , footer-template , content-template <? Built-in templates Customize calendar rendering. day-template-data <? undefined Supplies custom data to day templates. Outputs Output Payload Emitted when date-select $event: NgbDate A date is selected. navigate $event: NgbDatepickerNavigateEvent The visible month changes.'
      },
      es_mx: {
        title: "NgbDatepicker",
        content: 'Referencia del componente NgbDatepicker. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDatepicker, <ngb-datepicker ng-model="date">, ng-model, disabled, calendar, <?, NgbCalendarGregorian, date-adapter, NgbDateStructAdapter, NgbDateStruct, i18n, NgbDatepickerI18nDefault, display-months, 1, first-day-of-week, min-date, max-date, undefined, start-date, navigation, @?, "select", "arrows", "none", outside-days, "visible", weekdays, "narrow", show-week-numbers, false, mark-disabled, day-template, footer-template, content-template, day-template-data, date-select, $event: NgbDate, navigate, $event: NgbDatepickerNavigateEvent.'
      }
    }
  },
  {
    id: "components.datepicker.api.ngb-input-datepicker",
    url: "/components/datepicker/api",
    fragment: "ngb-input-datepicker",
    translations: {
      en_us: {
        title: "NgbInputDatepicker",
        content: 'Directive Adds a popup calendar to an input while preserving AngularJS model parsing and validation. Markup <input ng-model="date" ngb-datepicker> Requires ng-model ; optionally reads disabled . Accepts the calendar inputs above plus the popup-specific inputs below. Popup inputs Input Binding Default Description auto-close <? true Controls which selections or outside clicks close the popup. container @? null Accepts "body" to move the popup. placement <? $config.placement Preferred Popper placements. popper-options <? $config.popperOptions Transforms Popper options. position-target <? Input element Overrides the positioning target. restore-focus <? true Restores focus after closing. datepicker-class @? - Adds a class to the popup calendar. parser-formatter <? NgbDateISOParserFormatter Parses and formats the input text. disabled <? false Disables input behavior. Additional output Output Payload Emitted when closed None The popup calendar closes.'
      },
      es_mx: {
        title: "NgbInputDatepicker",
        content: 'Referencia del directiva NgbInputDatepicker. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbInputDatepicker, <input ng-model="date" ngb-datepicker>, ng-model, disabled, auto-close, <?, true, container, @?, null, "body", placement, $config.placement, popper-options, $config.popperOptions, position-target, restore-focus, datepicker-class, parser-formatter, NgbDateISOParserFormatter, disabled, false, closed.'
      }
    }
  },
  {
    id: "components.datepicker.api.ngb-datepicker-config",
    url: "/components/datepicker/api",
    fragment: "ngb-datepicker-config",
    translations: {
      en_us: {
        title: "NgbDatepickerConfig",
        content: 'Service Provides defaults for inline and popup calendars. Properties Property Default displayMonths , firstDayOfWeek 1 navigation "select" outsideDays "visible" weekdays "narrow" showWeekNumbers false minDate , maxDate , startDate , templates and callbacks undefined'
      },
      es_mx: {
        title: "NgbDatepickerConfig",
        content: 'Referencia del servicio NgbDatepickerConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDatepickerConfig, displayMonths, firstDayOfWeek, 1, navigation, "select", outsideDays, "visible", weekdays, "narrow", showWeekNumbers, false, minDate, maxDate, startDate, undefined.'
      }
    }
  },
  {
    id: "components.datepicker.api.ngb-input-datepicker-config",
    url: "/components/datepicker/api",
    fragment: "ngb-input-datepicker-config",
    translations: {
      en_us: {
        title: "NgbInputDatepickerConfig",
        content: 'Service Extends NgbDatepickerConfig with popup defaults. Additional properties Property Default autoClose true container null placement ["bottom-start", "bottom-end", "top-start", "top-end"] popperOptions Identity transform restoreFocus true positionTarget undefined'
      },
      es_mx: {
        title: "NgbInputDatepickerConfig",
        content: 'Referencia del servicio NgbInputDatepickerConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbInputDatepickerConfig, NgbDatepickerConfig, autoClose, true, container, null, placement, ["bottom-start", "bottom-end", "top-start", "top-end"], popperOptions, restoreFocus, positionTarget, undefined.'
      }
    }
  },
  {
    id: "components.datepicker.api.ngb-datepicker-extension-contracts",
    url: "/components/datepicker/api",
    fragment: "ngb-datepicker-extension-contracts",
    translations: {
      en_us: {
        title: "Calendar and formatting contracts",
        content: "Interfaces Pass custom implementations through the corresponding datepicker inputs. Contract Purpose Core methods NgbCalendar Date arithmetic and calendar rules. getNext() , getPrev() , getToday() , isValid() NgbDateAdapter<D> Application model conversion. fromModel() , toModel() NgbDateParserFormatter Popup input text conversion. parse() , format() NgbDatepickerI18n Localized month, weekday, day and ARIA labels. getWeekdayLabel() , getMonthFullName() , getDayAriaLabel()"
      },
      es_mx: {
        title: "Calendar and formatting contracts",
        content: "Referencia del interfaces Calendar and formatting contracts. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbCalendar, getNext(), getPrev(), getToday(), isValid(), NgbDateAdapter<D>, fromModel(), toModel(), NgbDateParserFormatter, parse(), format(), NgbDatepickerI18n, getWeekdayLabel(), getMonthFullName(), getDayAriaLabel()."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-hebrew",
    url: "/components/datepicker/calendars",
    fragment: "calendar-hebrew",
    translations: {
      en_us: {
        title: "Hebrew",
        content: "NgbCalendarHebrew with NgbDatepickerI18nHebrew , including Hebrew month names and numerals."
      },
      es_mx: {
        title: "Hebreo",
        content: "NgbCalendarHebrew junto con NgbDatepickerI18nHebrew incluye nombres de meses y numerales hebreos."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-jalali",
    url: "/components/datepicker/calendars",
    fragment: "calendar-jalali",
    translations: {
      en_us: {
        title: "Jalali",
        content: "NgbCalendarPersian performs Persian calendar calculations; the labels are supplied independently through NgbDatepickerI18n ."
      },
      es_mx: {
        title: "Jalali",
        content: "NgbCalendarPersian realiza los calculos del calendario persa; NgbDatepickerI18n proporciona las etiquetas de forma independiente."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-islamic-civil",
    url: "/components/datepicker/calendars",
    fragment: "calendar-islamic-civil",
    translations: {
      en_us: {
        title: "Islamic Civil",
        content: "NgbCalendarIslamicCivil uses the tabular civil Hijri calculation."
      },
      es_mx: {
        title: "Islamico civil",
        content: "NgbCalendarIslamicCivil utiliza el calculo tabular del calendario civil Hijri."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-islamic-umalqura",
    url: "/components/datepicker/calendars",
    fragment: "calendar-islamic-umalqura",
    translations: {
      en_us: {
        title: "Islamic Umm al-Qura",
        content: "NgbCalendarIslamicUmalqura uses the Umm al-Qura calendar data while sharing the Hijri presentation layer."
      },
      es_mx: {
        title: "Islamico Umm al-Qura",
        content: "NgbCalendarIslamicUmalqura utiliza los datos del calendario Umm al-Qura y comparte la presentacion Hijri."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-buddhist",
    url: "/components/datepicker/calendars",
    fragment: "calendar-buddhist",
    translations: {
      en_us: {
        title: "Buddhist",
        content: "NgbCalendarBuddhist keeps Gregorian month rules and presents years in the Buddhist era."
      },
      es_mx: {
        title: "Budista",
        content: "NgbCalendarBuddhist conserva las reglas de los meses gregorianos y presenta los anos segun la era budista."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-ethiopian",
    url: "/components/datepicker/calendars",
    fragment: "calendar-ethiopian",
    translations: {
      en_us: {
        title: "Ethiopian",
        content: "NgbCalendarEthiopian and NgbDatepickerI18nAmharic include the thirteenth Ethiopian month."
      },
      es_mx: {
        title: "Etiope",
        content: "NgbCalendarEthiopian y NgbDatepickerI18nAmharic incluyen el decimotercer mes etiope."
      }
    }
  },
  {
    id: "components.datepicker.calendars.calendar-intergalactic",
    url: "/components/datepicker/calendars",
    fragment: "calendar-intergalactic",
    translations: {
      en_us: {
        title: "Intergalactic Standard (just for fun)",
        content: "A custom NgbDatepickerI18n translates Gregorian labels into the Standard Galactic Alphabet. The calendar math stays Gregorian-space-time remains someone else's problem."
      },
      es_mx: {
        title: "Estandar intergalactico (solo por diversion)",
        content: "Una implementacion personalizada de NgbDatepickerI18n traduce las etiquetas gregorianas al alfabeto galactico estandar mientras conserva los calculos gregorianos."
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown",
    translations: {
      en_us: {
        title: "NgbDropdown",
        content: 'Directive Root controller for open state, positioning, focus and auto-close behavior. Markup <div ngb-dropdown> Inputs Input Binding Type Default Description auto-close <? boolean | "inside" | "outside" true Controls which interactions close the menu. animation <? boolean undefined Exposed by the directive factory; it currently has no runtime effect. container @? null | "body" null Moves the menu to the document body. display <? "dynamic" | "static" Contextual Enables or bypasses Popper positioning. dropdown-class <? string - Adds a class to the dropdown container. open <? boolean false Sets the open state. placement <? Placement[] $config.placement Preferred Popper placements. popper-options <? function $config.popperOptions Transforms Popper options. Outputs Output Binding Payload Emitted when open-change &? $event: boolean The dropdown opens or closes.'
      },
      es_mx: {
        title: "NgbDropdown",
        content: 'Referencia del directiva NgbDropdown. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdown, <div ngb-dropdown>, auto-close, <?, boolean | "inside" | "outside", true, animation, boolean, undefined, container, @?, null | "body", null, display, "dynamic" | "static", dropdown-class, string, open, false, placement, Placement[], $config.placement, popper-options, function, $config.popperOptions, open-change, &?, $event: boolean.'
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown-anchor",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown-anchor",
    translations: {
      en_us: {
        title: "NgbDropdownAnchor",
        content: "Directive Marks the element used for positioning without adding click behavior. Markup <button ngb-dropdown-anchor> Requires An ancestor ngb-dropdown . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbDropdownAnchor",
        content: "Referencia del directiva NgbDropdownAnchor. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdownAnchor, <button ngb-dropdown-anchor>, ngb-dropdown."
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown-toggle",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown-toggle",
    translations: {
      en_us: {
        title: "NgbDropdownToggle",
        content: "Directive Extends the anchor with click and keyboard toggle behavior. Markup <button ngb-dropdown-toggle> Requires An ancestor ngb-dropdown . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbDropdownToggle",
        content: "Referencia del directiva NgbDropdownToggle. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdownToggle, <button ngb-dropdown-toggle>, ngb-dropdown."
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown-menu",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown-menu",
    translations: {
      en_us: {
        title: "NgbDropdownMenu",
        content: "Directive Hosts menu items and coordinates keyboard navigation with the root dropdown. Markup <div ngb-dropdown-menu> Requires An ancestor ngb-dropdown . No public inputs or outputs."
      },
      es_mx: {
        title: "NgbDropdownMenu",
        content: "Referencia del directiva NgbDropdownMenu. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdownMenu, <div ngb-dropdown-menu>, ngb-dropdown."
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown-item",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown-item",
    translations: {
      en_us: {
        title: "NgbDropdownItem",
        content: "Directive Marks an interactive menu entry and supports disabled . Markup <button ngb-dropdown-item> Inputs Input Binding Type Default Description tabindex <? string | number 0 Sets the enabled tab order. disabled <? boolean false Disables focus and activation."
      },
      es_mx: {
        title: "NgbDropdownItem",
        content: "Referencia del directiva NgbDropdownItem. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdownItem, disabled, <button ngb-dropdown-item>, tabindex, <?, string | number, 0, boolean, false."
      }
    }
  },
  {
    id: "components.dropdown.api.ngb-dropdown-config",
    url: "/components/dropdown/api",
    fragment: "ngb-dropdown-config",
    translations: {
      en_us: {
        title: "NgbDropdownConfig",
        content: 'Service Provides application-wide dropdown defaults. Properties Property Type Default autoClose boolean | "inside" | "outside" true container null | "body" null placement Placement[] ["bottom-start", "bottom-end", "top-start", "top-end"] popperOptions function Identity transform'
      },
      es_mx: {
        title: "NgbDropdownConfig",
        content: 'Referencia del servicio NgbDropdownConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbDropdownConfig, autoClose, boolean | "inside" | "outside", true, container, null | "body", null, placement, Placement[], ["bottom-start", "bottom-end", "top-start", "top-end"], popperOptions, function.'
      }
    }
  },
  {
    id: "components.modal.api.ngb-modal",
    url: "/components/modal/api",
    fragment: "ngb-modal",
    translations: {
      en_us: {
        title: "NgbModal",
        content: "Service Creates and coordinates modal instances from templates or components. Members Member Returns Description open(content, options?) NgbModalRef Opens content with options merged over NgbModalConfig . activeInstances Active modal collection Exposes the currently open modal instances. dismissAll(reason?) void Dismisses every open modal. hasOpenModals() boolean Reports whether a modal is open."
      },
      es_mx: {
        title: "NgbModal",
        content: "Referencia del servicio NgbModal. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbModal, open(content, options?), NgbModalRef, NgbModalConfig, activeInstances, dismissAll(reason?), void, hasOpenModals(), boolean."
      }
    }
  },
  {
    id: "components.modal.api.ngb-modal-ref",
    url: "/components/modal/api",
    fragment: "ngb-modal-ref",
    translations: {
      en_us: {
        title: "NgbModalRef",
        content: "Class Controls one modal and exposes its result and lifecycle streams. Members Member Description close(result?) Resolves result and closes the modal. dismiss(reason?) Rejects result and dismisses the modal. update(options) Updates supported window and backdrop options. result AngularJS promise settled by close or dismiss. closed , dismissed , shown , hidden Observable lifecycle streams. componentInstance Component controller instance when component content is used."
      },
      es_mx: {
        title: "NgbModalRef",
        content: "Referencia del clase NgbModalRef. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbModalRef, close(result?), result, dismiss(reason?), update(options), closed, dismissed, shown, hidden, componentInstance."
      }
    }
  },
  {
    id: "components.modal.api.ngb-active-modal",
    url: "/components/modal/api",
    fragment: "ngb-active-modal",
    translations: {
      en_us: {
        title: "NgbActiveModal",
        content: "Service Allows modal content to control the modal that contains it. Methods Method Description close(result?) Closes with an optional result. dismiss(reason?) Dismisses with an optional reason. update(options) Updates supported modal options."
      },
      es_mx: {
        title: "NgbActiveModal",
        content: "Referencia del servicio NgbActiveModal. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbActiveModal, close(result?), dismiss(reason?), update(options)."
      }
    }
  },
  {
    id: "components.modal.api.ngb-modal-config",
    url: "/components/modal/api",
    fragment: "ngb-modal-config",
    translations: {
      en_us: {
        title: "NgbModalConfig",
        content: 'Service Provides defaults merged into every open() call. Options Option Default Description animation $config.animation Enables modal and backdrop transitions. backdrop true Accepts true , false or "static" . keyboard true Allows Escape-key dismissal. centered , scrollable undefined Controls dialog layout. fullscreen false Enables full-screen mode at an optional breakpoint. role "dialog" Sets the dialog ARIA role. size undefined Accepts "sm" , "lg" or "xl" . ariaLabelledBy , ariaDescribedBy undefined Connect accessible label and description elements. container , injector , bindings undefined Control content creation and placement. windowClass , modalDialogClass , backdropClass undefined Add custom classes. beforeDismiss undefined Can cancel dismissal synchronously or asynchronously.'
      },
      es_mx: {
        title: "NgbModalConfig",
        content: 'Referencia del servicio NgbModalConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbModalConfig, open(), animation, $config.animation, backdrop, true, false, "static", keyboard, centered, scrollable, undefined, fullscreen, role, "dialog", size, "sm", "lg", "xl", ariaLabelledBy, ariaDescribedBy, container, injector, bindings, windowClass, modalDialogClass, backdropClass, beforeDismiss.'
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav",
    url: "/components/nav/api",
    fragment: "ngb-nav",
    translations: {
      en_us: {
        title: "NgbNav",
        content: 'Directive Coordinates nav items, selection, keyboard behavior and panel transitions. Markup <ul ngb-nav active-id="activeId"> Inputs Input Binding Type Default Description active-id =? string First enabled item Two-way active item id. animation <? boolean $config.animation Enables panel transitions. destroy-on-hide <? boolean true Removes inactive panel views. keyboard <? boolean | "changeWithArrows" true Controls arrow-key navigation. orientation <? "horizontal" | "vertical" "horizontal" Sets keyboard orientation. roles <? "tablist" | false "tablist" Enables or disables tab ARIA roles. Outputs Output Payload Emitted when active-id-change $event: string The active id changes. nav-change $event: NgbNavChangeEvent Before selection changes; the event can prevent it. shown $event: string The next panel finishes appearing. hidden $event: string The previous panel finishes hiding.'
      },
      es_mx: {
        title: "NgbNav",
        content: 'Referencia del directiva NgbNav. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNav, <ul ngb-nav active-id="activeId">, active-id, =?, string, animation, <?, boolean, $config.animation, destroy-on-hide, true, keyboard, boolean | "changeWithArrows", orientation, "horizontal" | "vertical", "horizontal", roles, "tablist" | false, "tablist", active-id-change, $event: string, nav-change, $event: NgbNavChangeEvent, shown, hidden.'
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav-item",
    url: "/components/nav/api",
    fragment: "ngb-nav-item",
    translations: {
      en_us: {
        title: "NgbNavItem",
        content: 'Directive Defines one selectable item and its associated content. Markup <li ngb-nav-item="overview"> Requires An ancestor ngb-nav ; optionally reads disabled . Bindings Name Binding Default Description ngb-nav-item @? Generated id Identifies the item. dom-id @? Generated id Overrides the DOM id. destroy-on-hide <? Inherited Overrides panel lifecycle for this item. shown , hidden &? - Item-level panel lifecycle callbacks.'
      },
      es_mx: {
        title: "NgbNavItem",
        content: 'Referencia del directiva NgbNavItem. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNavItem, <li ngb-nav-item="overview">, ngb-nav, disabled, ngb-nav-item, @?, dom-id, destroy-on-hide, <?, shown, hidden, &?.'
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav-link",
    url: "/components/nav/api",
    fragment: "ngb-nav-link",
    translations: {
      en_us: {
        title: "NgbNavLink",
        content: "Directive Turns an anchor or button into the interactive trigger for its nav item. Markup <button ngb-nav-link> Requires Ancestor ngb-nav-item and ngb-nav controllers. No public inputs or outputs."
      },
      es_mx: {
        title: "NgbNavLink",
        content: "Referencia del directiva NgbNavLink. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNavLink, <button ngb-nav-link>, ngb-nav-item, ngb-nav."
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav-content",
    url: "/components/nav/api",
    fragment: "ngb-nav-content",
    translations: {
      en_us: {
        title: "NgbNavContent",
        content: "Directive Marks the template rendered for a nav item. Markup <ng-template ngb-nav-content> No public inputs or outputs."
      },
      es_mx: {
        title: "NgbNavContent",
        content: "Referencia del directiva NgbNavContent. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNavContent, <ng-template ngb-nav-content>."
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav-outlet",
    url: "/components/nav/api",
    fragment: "ngb-nav-outlet",
    translations: {
      en_us: {
        title: "NgbNavOutlet",
        content: 'Directive Renders the active panel for a nav controller. Markup <div ngb-nav-outlet="navController"> Inputs Input Binding Description ngb-nav-outlet < The NgbNav controller to render. pane-role <? Overrides the generated panel role.'
      },
      es_mx: {
        title: "NgbNavOutlet",
        content: 'Referencia del directiva NgbNavOutlet. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNavOutlet, <div ngb-nav-outlet="navController">, ngb-nav-outlet, <, NgbNav, pane-role, <?.'
      }
    }
  },
  {
    id: "components.nav.api.ngb-nav-config",
    url: "/components/nav/api",
    fragment: "ngb-nav-config",
    translations: {
      en_us: {
        title: "NgbNavConfig",
        content: 'Service Provides application-wide nav defaults. Properties Property Default animation $config.animation destroyOnHide true orientation "horizontal" roles "tablist" keyboard true'
      },
      es_mx: {
        title: "NgbNavConfig",
        content: 'Referencia del servicio NgbNavConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbNavConfig, animation, $config.animation, destroyOnHide, true, orientation, "horizontal", roles, "tablist", keyboard.'
      }
    }
  },
  {
    id: "components.offcanvas.api.ngb-offcanvas",
    url: "/components/offcanvas/api",
    fragment: "ngb-offcanvas",
    translations: {
      en_us: {
        title: "NgbOffcanvas",
        content: "Service Creates and coordinates offcanvas panels from templates or registered AngularJS component names. To open component content, pass its registered name: offcanvas.open(MyContentComponent.$name) . Passing the component class itself is not supported. Members Member Returns Description open(componentName | templateRef, options?) NgbOffcanvasRef Opens a registered Component.$name or a TemplateRef , with options merged over NgbOffcanvasConfig . activeInstance Active instance Exposes the currently open offcanvas instance. dismiss(reason?) void Dismisses the active panel. hasOpenOffcanvas() boolean Reports whether a panel is open."
      },
      es_mx: {
        title: "NgbOffcanvas",
        content: "Referencia del servicio NgbOffcanvas. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbOffcanvas, offcanvas.open(MyContentComponent.$name), open(componentName | templateRef, options?), NgbOffcanvasRef, Component.$name, TemplateRef, NgbOffcanvasConfig, activeInstance, dismiss(reason?), void, hasOpenOffcanvas(), boolean."
      }
    }
  },
  {
    id: "components.offcanvas.api.ngb-offcanvas-ref",
    url: "/components/offcanvas/api",
    fragment: "ngb-offcanvas-ref",
    translations: {
      en_us: {
        title: "NgbOffcanvasRef",
        content: "Class Controls one panel and exposes its result and lifecycle streams. Members Member Description close(result?) Resolves result and closes the panel. dismiss(reason?) Rejects result and dismisses the panel. result AngularJS promise settled by close or dismiss. closed , dismissed , shown , hidden Observable lifecycle streams. componentInstance Component controller instance when component content is used."
      },
      es_mx: {
        title: "NgbOffcanvasRef",
        content: "Referencia del clase NgbOffcanvasRef. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbOffcanvasRef, close(result?), result, dismiss(reason?), closed, dismissed, shown, hidden, componentInstance."
      }
    }
  },
  {
    id: "components.offcanvas.api.ngb-active-offcanvas",
    url: "/components/offcanvas/api",
    fragment: "ngb-active-offcanvas",
    translations: {
      en_us: {
        title: "NgbActiveOffcanvas",
        content: "Service Allows offcanvas content to control the panel that contains it. Methods Method Description close(result?) Closes with an optional result. dismiss(reason?) Dismisses with an optional reason."
      },
      es_mx: {
        title: "NgbActiveOffcanvas",
        content: "Referencia del servicio NgbActiveOffcanvas. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbActiveOffcanvas, close(result?), dismiss(reason?)."
      }
    }
  },
  {
    id: "components.offcanvas.api.ngb-offcanvas-config",
    url: "/components/offcanvas/api",
    fragment: "ngb-offcanvas-config",
    translations: {
      en_us: {
        title: "NgbOffcanvasConfig",
        content: 'Service Provides defaults merged into every open() call. Options Option Default Description animation $config.animation Enables panel and backdrop transitions. backdrop true Accepts true , false or "static" . keyboard true Allows Escape-key dismissal. position "start" Accepts "start" , "end" , "top" or "bottom" . scroll false Allows body scrolling while open. ariaLabelledBy , ariaDescribedBy undefined Connect accessible label and description elements. container , bindings undefined Control content creation and placement. panelClass , backdropClass undefined Add custom classes. beforeDismiss undefined Can cancel dismissal synchronously or asynchronously.'
      },
      es_mx: {
        title: "NgbOffcanvasConfig",
        content: 'Referencia del servicio NgbOffcanvasConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbOffcanvasConfig, open(), animation, $config.animation, backdrop, true, false, "static", keyboard, position, "start", "end", "top", "bottom", scroll, ariaLabelledBy, ariaDescribedBy, undefined, container, bindings, panelClass, backdropClass, beforeDismiss.'
      }
    }
  },
  {
    id: "components.pagination.api.ngb-pagination",
    url: "/components/pagination/api",
    fragment: "ngb-pagination",
    translations: {
      en_us: {
        title: "NgbPagination",
        content: 'Component Builds accessible page navigation for a collection. Markup <ngb-pagination collection-size="total" page="page"> Integration Optionally reads disabled . Inputs Input Binding Type Default Description collection-size < number Required Total number of collection items. page <? number 1 Current page. page-size <? number 10 Items represented by each page. max-size <? number 0 Maximum number of visible page links; zero is unlimited. boundary-links <? boolean false Shows first and last links. direction-links <? boolean true Shows previous and next links. ellipses <? boolean true Shows ellipses for omitted ranges. rotate <? boolean false Centers the current page within the visible range. size <? string | null $config.size Sets the Bootstrap pagination size. disabled <? boolean false Disables page navigation. Outputs Output Binding Payload Emitted when page-change &? $event: number The user selects a page.'
      },
      es_mx: {
        title: "NgbPagination",
        content: 'Referencia del componente NgbPagination. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbPagination, <ngb-pagination collection-size="total" page="page">, disabled, collection-size, <, number, page, <?, 1, page-size, 10, max-size, 0, boundary-links, boolean, false, direction-links, true, ellipses, rotate, size, string | null, $config.size, page-change, &?, $event: number.'
      }
    }
  },
  {
    id: "components.pagination.api.ngb-pagination-config",
    url: "/components/pagination/api",
    fragment: "ngb-pagination-config",
    translations: {
      en_us: {
        title: "NgbPaginationConfig",
        content: "Service Provides application-wide pagination defaults. Properties Property Default disabled , boundaryLinks , rotate false directionLinks , ellipses true maxSize 0 pageSize 10 size undefined"
      },
      es_mx: {
        title: "NgbPaginationConfig",
        content: "Referencia del servicio NgbPaginationConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbPaginationConfig, disabled, boundaryLinks, rotate, false, directionLinks, ellipses, true, maxSize, 0, pageSize, 10, size, undefined."
      }
    }
  },
  {
    id: "components.popover.api.ngb-popover",
    url: "/components/popover/api",
    fragment: "ngb-popover",
    translations: {
      en_us: {
        title: "NgbPopover",
        content: `Directive Attaches a positioned Bootstrap popover to any host element. Markup <button ngb-popover="'Content'"> Inputs Input Binding Type Default Description ngb-popover <? string | TemplateRef - Popover body content. popover-title <? string | TemplateRef - Optional title content. popover-context <? object - Context supplied to template content. animation <? boolean $config.animation Enables open and close transitions. auto-close <? boolean | "inside" | "outside" true Controls automatic closing. placement <? PlacementArray "auto" Preferred Popper placement. triggers <? string "click" Space-separated open and close triggers. container <? string $config.container Container selector for the popover window. position-target <? HTMLElement | string Host element Overrides the positioning target. popover-class @? string - Adds a class to the popover window. disable-popover <? boolean false Prevents the popover from opening. open-delay <? number 0 Delay before opening in milliseconds. close-delay <? number 0 Delay before closing in milliseconds. popper-options <? function $config.popperOptions Transforms Popper options. Outputs Output Binding Payload Emitted when shown &? None The popover opens. hidden &? None The popover closes.`
      },
      es_mx: {
        title: "NgbPopover",
        content: `Referencia del directiva NgbPopover. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbPopover, <button ngb-popover="'Content'">, ngb-popover, <?, string | TemplateRef, popover-title, popover-context, object, animation, boolean, $config.animation, auto-close, boolean | "inside" | "outside", true, placement, PlacementArray, "auto", triggers, string, "click", container, $config.container, position-target, HTMLElement | string, popover-class, @?, disable-popover, false, open-delay, number, 0, close-delay, popper-options, function, $config.popperOptions, shown, &?, hidden.`
      }
    }
  },
  {
    id: "components.popover.api.ngb-popover-config",
    url: "/components/popover/api",
    fragment: "ngb-popover-config",
    translations: {
      en_us: {
        title: "NgbPopoverConfig",
        content: 'Service Provides application-wide popover defaults. Properties Property Default animation $config.animation autoClose true placement "auto" triggers "click" disablePopover false openDelay , closeDelay 0 container , popoverClass undefined popperOptions Identity transform'
      },
      es_mx: {
        title: "NgbPopoverConfig",
        content: 'Referencia del servicio NgbPopoverConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbPopoverConfig, animation, $config.animation, autoClose, true, placement, "auto", triggers, "click", disablePopover, false, openDelay, closeDelay, 0, container, popoverClass, undefined, popperOptions.'
      }
    }
  },
  {
    id: "components.progressbar.api.ngb-progressbar",
    url: "/components/progressbar/api",
    fragment: "ngb-progressbar",
    translations: {
      en_us: {
        title: "NgbProgressbar",
        content: 'Component Renders an accessible Bootstrap progress indicator for a numeric value. Markup <ngb-progressbar value="progress"> Inputs Input Binding Type Default Description value < number Required Current progress value. max <? number 100 Maximum value. animated <? boolean false Animates striped progress. striped <? boolean false uses a striped background. show-value <? boolean false Displays the calculated percentage. type @? string $config.type Sets the bar contextual type. text-type @? string $config.textType Sets the label text color. height @? string $config.height Sets the progress container height. aria-label @? string "progress bar" Accessible label for the bar.'
      },
      es_mx: {
        title: "NgbProgressbar",
        content: 'Referencia del componente NgbProgressbar. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbProgressbar, <ngb-progressbar value="progress">, value, <, number, max, <?, 100, animated, boolean, false, striped, show-value, type, @?, string, $config.type, text-type, $config.textType, height, $config.height, aria-label, "progress bar".'
      }
    }
  },
  {
    id: "components.progressbar.api.ngb-progressbar-stacked",
    url: "/components/progressbar/api",
    fragment: "ngb-progressbar-stacked",
    translations: {
      en_us: {
        title: "NgbProgressbarStacked",
        content: "Component Groups multiple progress bars into a Bootstrap stacked progress container. Markup <ngb-progressbar-stacked> No public inputs or outputs."
      },
      es_mx: {
        title: "NgbProgressbarStacked",
        content: "Referencia del componente NgbProgressbarStacked. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbProgressbarStacked, <ngb-progressbar-stacked>."
      }
    }
  },
  {
    id: "components.progressbar.api.ngb-progressbar-config",
    url: "/components/progressbar/api",
    fragment: "ngb-progressbar-config",
    translations: {
      en_us: {
        title: "NgbProgressbarConfig",
        content: 'Service Provides application-wide progress bar defaults. Properties Property Type Default ariaLabel string "progress bar" animated , showValue , striped boolean false max number 100 height , textType , type string | undefined undefined'
      },
      es_mx: {
        title: "NgbProgressbarConfig",
        content: 'Referencia del servicio NgbProgressbarConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbProgressbarConfig, ariaLabel, string, "progress bar", animated, showValue, striped, boolean, false, max, number, 100, height, textType, type, string | undefined, undefined.'
      }
    }
  },
  {
    id: "components.rating.api.ngb-rating",
    url: "/components/rating/api",
    fragment: "ngb-rating",
    translations: {
      en_us: {
        title: "NgbRating",
        content: 'Component Provides an accessible keyboard-driven rating control with customizable stars. Markup <ngb-rating rate="rating"> Integration Optionally reads disabled . Inputs Input Binding Type Default Description rate <? number 0 Current rating value. max <? number 10 Maximum number of rating items. readonly <? boolean false Prevents user changes. resettable <? boolean false Allows selecting the current value again to reset to zero. star-template <? TemplateRef Default star Provides custom item markup. tabindex <? number | string 0 Sets keyboard tab order. aria-value-text <? function Built-in formatter Formats the accessible value text. disabled <? boolean false Disables interaction and focus. Outputs Output Binding Payload Emitted when rate-change &? $event: number The interactive rating changes. hover &? $event: number A rating item is hovered. leave &? $event: number The pointer leaves the rating.'
      },
      es_mx: {
        title: "NgbRating",
        content: 'Referencia del componente NgbRating. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbRating, <ngb-rating rate="rating">, disabled, rate, <?, number, 0, max, 10, readonly, boolean, false, resettable, star-template, TemplateRef, tabindex, number | string, aria-value-text, function, rate-change, &?, $event: number, hover, leave.'
      }
    }
  },
  {
    id: "components.rating.api.ngb-rating-config",
    url: "/components/rating/api",
    fragment: "ngb-rating-config",
    translations: {
      en_us: {
        title: "NgbRatingConfig",
        content: "Service Provides application-wide rating defaults. Properties Property Type Default max number 10 readonly , resettable boolean false tabindex number | string 0"
      },
      es_mx: {
        title: "NgbRatingConfig",
        content: "Referencia del servicio NgbRatingConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbRatingConfig, max, number, 10, readonly, resettable, boolean, false, tabindex, number | string, 0."
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy",
    translations: {
      en_us: {
        title: "NgbScrollSpy",
        content: 'Directive Turns a scrollable element into an observed container and tracks its active fragment. Markup <main ngb-scroll-spy> Inputs Input Binding Type Default Description active @? string "" Initial or requested active fragment id. process-changes <? NgbScrollSpyProcessChanges $config.processChanges Determines the active fragment from observer changes. root-margin @? string Browser default IntersectionObserver root margin. scroll-behavior @? "auto" | "smooth" "smooth" Default behavior for programmatic scrolling. threshold <? number | number[] Browser default IntersectionObserver thresholds. Outputs Output Binding Payload Emitted when active-change &? $event: string The active fragment changes.'
      },
      es_mx: {
        title: "NgbScrollSpy",
        content: 'Referencia del directiva NgbScrollSpy. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpy, <main ngb-scroll-spy>, active, @?, string, "", process-changes, <?, NgbScrollSpyProcessChanges, $config.processChanges, root-margin, scroll-behavior, "auto" | "smooth", "smooth", threshold, number | number[], active-change, &?, $event: string.'
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy-fragment",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy-fragment",
    translations: {
      en_us: {
        title: "NgbScrollSpyFragment",
        content: 'Directive Registers a section with its ancestor scrollspy and assigns its DOM id. Markup <section ngb-scroll-spy-fragment="overview"> Requires An ancestor ngb-scroll-spy . Inputs Input Binding Type Default ngb-scroll-spy-fragment @ string Required'
      },
      es_mx: {
        title: "NgbScrollSpyFragment",
        content: 'Referencia del directiva NgbScrollSpyFragment. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpyFragment, <section ngb-scroll-spy-fragment="overview">, ngb-scroll-spy, ngb-scroll-spy-fragment, @, string.'
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy-menu",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy-menu",
    translations: {
      en_us: {
        title: "NgbScrollSpyMenu",
        content: "Directive Coordinates nested menu items and applies their active state. Markup <nav ngb-scroll-spy-menu> Inputs Input Binding Description ngb-scroll-spy-menu <? Optional explicit NgbScrollSpy ; otherwise uses an ancestor or injected service."
      },
      es_mx: {
        title: "NgbScrollSpyMenu",
        content: "Referencia del directiva NgbScrollSpyMenu. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpyMenu, <nav ngb-scroll-spy-menu>, ngb-scroll-spy-menu, <?, NgbScrollSpy."
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy-item",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy-item",
    translations: {
      en_us: {
        title: "NgbScrollSpyItem",
        content: 'Directive Links a menu entry to a fragment, applies active and scrolls on click. Markup <a ngb-scroll-spy-item="overview"> Inputs Input Binding Description ngb-scroll-spy-item @? Fragment id or shorthand item data. fragment @? Explicit fragment id. parent @? Parent fragment id for nested menus. scroll-spy <? Explicit NgbScrollSpy controller.'
      },
      es_mx: {
        title: "NgbScrollSpyItem",
        content: 'Referencia del directiva NgbScrollSpyItem. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpyItem, active, <a ngb-scroll-spy-item="overview">, ngb-scroll-spy-item, @?, fragment, parent, scroll-spy, <?, NgbScrollSpy.'
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy-service",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy-service",
    translations: {
      en_us: {
        title: "NgbScrollSpyService",
        content: "Service Provides programmatic scrollspy control without a directive host. Members Member Description active Current fragment id. active$ Observable of distinct active fragment changes. start(options?) Starts observation with optional root, fragments and IntersectionObserver settings. stop() Stops observation and clears the active fragment. observe(fragment) Adds a fragment to observation. unobserve(fragment) Removes a fragment from observation. scrollTo(fragment, options?) Scrolls to a registered id or element."
      },
      es_mx: {
        title: "NgbScrollSpyService",
        content: "Referencia del servicio NgbScrollSpyService. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpyService, active, active$, start(options?), stop(), observe(fragment), unobserve(fragment), scrollTo(fragment, options?)."
      }
    }
  },
  {
    id: "components.scrollspy.api.ngb-scrollspy-config",
    url: "/components/scrollspy/api",
    fragment: "ngb-scrollspy-config",
    translations: {
      en_us: {
        title: "NgbScrollSpyConfig",
        content: 'Service Provides application-wide scrollspy defaults. Properties Property Default scrollBehavior "smooth" processChanges Built-in intersection processing function'
      },
      es_mx: {
        title: "NgbScrollSpyConfig",
        content: 'Referencia del servicio NgbScrollSpyConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbScrollSpyConfig, scrollBehavior, "smooth", processChanges.'
      }
    }
  },
  {
    id: "components.timepicker.api.ngb-timepicker",
    url: "/components/timepicker/api",
    fragment: "ngb-timepicker",
    translations: {
      en_us: {
        title: "NgbTimepicker",
        content: 'Component Edits a time value through AngularJS forms with optional spinners, seconds and meridian mode. Markup <ngb-timepicker ng-model="time"> Requires ng-model ; optionally reads disabled . Inputs Input Binding Type Default Description meridian <? boolean false uses a 12-hour clock with period selector. spinners <? boolean true Shows increment and decrement controls. seconds <? boolean false Shows the seconds field. hour-step <? number 1 Hours changed per step. minute-step <? number 1 Minutes changed per step. second-step <? number 1 Seconds changed per step. readonly-inputs <? boolean false Makes text fields readonly while keeping spinner controls active. size <? "small" | "medium" | "large" "medium" Sets the control size. disabled <? boolean $config.disabled Disables the timepicker.'
      },
      es_mx: {
        title: "NgbTimepicker",
        content: 'Referencia del componente NgbTimepicker. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTimepicker, <ngb-timepicker ng-model="time">, ng-model, disabled, meridian, <?, boolean, false, spinners, true, seconds, hour-step, number, 1, minute-step, second-step, readonly-inputs, size, "small" | "medium" | "large", "medium", $config.disabled.'
      }
    }
  },
  {
    id: "components.timepicker.api.ngb-timepicker-config",
    url: "/components/timepicker/api",
    fragment: "ngb-timepicker-config",
    translations: {
      en_us: {
        title: "NgbTimepickerConfig",
        content: 'Service Provides application-wide timepicker defaults. Properties Property Default meridian , seconds , disabled , readonlyInputs false spinners true hourStep , minuteStep , secondStep 1 size "medium"'
      },
      es_mx: {
        title: "NgbTimepickerConfig",
        content: 'Referencia del servicio NgbTimepickerConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTimepickerConfig, meridian, seconds, disabled, readonlyInputs, false, spinners, true, hourStep, minuteStep, secondStep, 1, size, "medium".'
      }
    }
  },
  {
    id: "components.timepicker.api.ngb-time-adapter",
    url: "/components/timepicker/api",
    fragment: "ngb-time-adapter",
    translations: {
      en_us: {
        title: "NgbTimeAdapter<T>",
        content: "Service Converts between the application model and NgbTimeStruct . Methods Method Returns Description fromModel(value) NgbTimeStruct | null Converts an application value for the timepicker. toModel(time) T | null Converts the timepicker value back to the application model."
      },
      es_mx: {
        title: "NgbTimeAdapter<T>",
        content: "Referencia del servicio NgbTimeAdapter<T>. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTimeAdapter<T>, NgbTimeStruct, fromModel(value), NgbTimeStruct | null, toModel(time), T | null."
      }
    }
  },
  {
    id: "components.timepicker.api.ngb-timepicker-i18n",
    url: "/components/timepicker/api",
    fragment: "ngb-timepicker-i18n",
    translations: {
      en_us: {
        title: "NgbTimepickerI18n",
        content: "Service Supplies localized morning and afternoon period labels. Methods Method Returns getMorningPeriod() string getAfternoonPeriod() string"
      },
      es_mx: {
        title: "NgbTimepickerI18n",
        content: "Referencia del servicio NgbTimepickerI18n. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTimepickerI18n, getMorningPeriod(), string, getAfternoonPeriod()."
      }
    }
  },
  {
    id: "components.toast.api.ngb-toast",
    url: "/components/toast/api",
    fragment: "ngb-toast",
    translations: {
      en_us: {
        title: "NgbToast",
        content: "Component Displays an accessible notification with optional automatic dismissal. Markup <ngb-toast> Inputs Input Binding Type Default Description animation <? boolean $config.animation Enables show and hide transitions. autohide <? boolean true Automatically hides the toast. delay <? number 5000 Autohide delay in milliseconds. header @? string - Sets the default header text. Outputs Output Binding Payload Emitted when shown &? None The show transition finishes. hidden &? None The hide transition finishes."
      },
      es_mx: {
        title: "NgbToast",
        content: "Referencia del componente NgbToast. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbToast, <ngb-toast>, animation, <?, boolean, $config.animation, autohide, true, delay, number, 5000, header, @?, string, shown, &?, hidden."
      }
    }
  },
  {
    id: "components.toast.api.ngb-toast-header",
    url: "/components/toast/api",
    fragment: "ngb-toast-header",
    translations: {
      en_us: {
        title: "NgbToastHeader",
        content: "Directive Marks a custom template as the toast header. Markup <ng-template ngb-toast-header> No public inputs or outputs."
      },
      es_mx: {
        title: "NgbToastHeader",
        content: "Referencia del directiva NgbToastHeader. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbToastHeader, <ng-template ngb-toast-header>."
      }
    }
  },
  {
    id: "components.toast.api.ngb-toast-config",
    url: "/components/toast/api",
    fragment: "ngb-toast-config",
    translations: {
      en_us: {
        title: "NgbToastConfig",
        content: 'Service Provides application-wide toast defaults. Properties Property Type Default animation boolean $config.animation ariaLive "polite" | "assertive" "polite" autohide boolean true delay number 5000'
      },
      es_mx: {
        title: "NgbToastConfig",
        content: 'Referencia del servicio NgbToastConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbToastConfig, animation, boolean, $config.animation, ariaLive, "polite" | "assertive", "polite", autohide, true, delay, number, 5000.'
      }
    }
  },
  {
    id: "components.tooltip.api.ngb-tooltip",
    url: "/components/tooltip/api",
    fragment: "ngb-tooltip",
    translations: {
      en_us: {
        title: "NgbTooltip",
        content: `Directive Attaches a positioned Bootstrap tooltip to any host element. Markup <button ngb-tooltip="'Help text'"> Inputs Input Binding Type Default Description ngb-tooltip <? string | TemplateRef - Tooltip content. tooltip-context <? object - Context supplied to template content. animation <? boolean $config.animation Enables open and close transitions. auto-close <? boolean | "inside" | "outside" true Controls automatic closing. placement <? PlacementArray "auto" Preferred Popper placement. triggers <? string "hover focus" Space-separated open and close triggers. container <? string $config.container Container selector for the tooltip window. position-target @? string Host element Overrides the positioning target. tooltip-class @? string - Adds a class to the tooltip window. disable-tooltip <? boolean false Prevents the tooltip from opening. open-delay <? number 0 Delay before opening in milliseconds. close-delay <? number 0 Delay before closing in milliseconds. popper-options <? function $config.popperOptions Transforms Popper options. Outputs Output Binding Payload Emitted when shown &? None The tooltip opens. hidden &? None The tooltip closes.`
      },
      es_mx: {
        title: "NgbTooltip",
        content: `Referencia del directiva NgbTooltip. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTooltip, <button ngb-tooltip="'Help text'">, ngb-tooltip, <?, string | TemplateRef, tooltip-context, object, animation, boolean, $config.animation, auto-close, boolean | "inside" | "outside", true, placement, PlacementArray, "auto", triggers, string, "hover focus", container, $config.container, position-target, @?, tooltip-class, disable-tooltip, false, open-delay, number, 0, close-delay, popper-options, function, $config.popperOptions, shown, &?, hidden.`
      }
    }
  },
  {
    id: "components.tooltip.api.ngb-tooltip-config",
    url: "/components/tooltip/api",
    fragment: "ngb-tooltip-config",
    translations: {
      en_us: {
        title: "NgbTooltipConfig",
        content: 'Service Provides application-wide tooltip defaults. Properties Property Default animation $config.animation autoClose true placement "auto" triggers "hover focus" disableTooltip false openDelay , closeDelay 0 container , tooltipClass undefined popperOptions Identity transform'
      },
      es_mx: {
        title: "NgbTooltipConfig",
        content: 'Referencia del servicio NgbTooltipConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTooltipConfig, animation, $config.animation, autoClose, true, placement, "auto", triggers, "hover focus", disableTooltip, false, openDelay, closeDelay, 0, container, tooltipClass, undefined, popperOptions.'
      }
    }
  },
  {
    id: "components.typeahead.api.ngb-typeahead",
    url: "/components/typeahead/api",
    fragment: "ngb-typeahead",
    translations: {
      en_us: {
        title: "NgbTypeahead",
        content: 'Directive Connects an input to an observable result source and manages the suggestion popup. Markup <input ng-model="value" ngb-typeahead="search"> Requires ng-model . Inputs Input Binding Default Description ngb-typeahead <? Required Function that maps the text stream to an observable result collection. autocomplete <? - Sets the native autocomplete behavior. container <? $config.container Container used for the popup. editable <? true Allows values not present in the results. focus-first <? true Activates the first result when the popup opens. input-formatter <? String conversion Formats the selected model in the input. result-formatter <? String conversion Formats values in the result list. result-template <? Default result Provides custom result markup. placement <? $config.placement Preferred Popper placements. popper-options <? $config.popperOptions Transforms Popper options. popup-class <? - Adds a class to the results popup. select-on-exact <? false Selects automatically when only one exact result exists. show-hint <? false Shows the completion hint. Outputs Output Binding Payload Emitted when select-item &? $event: NgbTypeaheadSelectItemEvent A result is selected.'
      },
      es_mx: {
        title: "NgbTypeahead",
        content: 'Referencia del directiva NgbTypeahead. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTypeahead, <input ng-model="value" ngb-typeahead="search">, ng-model, ngb-typeahead, <?, autocomplete, container, $config.container, editable, true, focus-first, input-formatter, result-formatter, result-template, placement, $config.placement, popper-options, $config.popperOptions, popup-class, select-on-exact, false, show-hint, select-item, &?, $event: NgbTypeaheadSelectItemEvent.'
      }
    }
  },
  {
    id: "components.typeahead.api.ngb-highlight",
    url: "/components/typeahead/api",
    fragment: "ngb-highlight",
    translations: {
      en_us: {
        title: "NgbHighlight",
        content: 'Component Highlights matching portions of a result label. Markup <ngb-highlight result="label" term="query"> Inputs Input Binding Type Default result < string Required term < string Required highlight-class <? string "ngb-highlight" accent-sensitive <? boolean true'
      },
      es_mx: {
        title: "NgbHighlight",
        content: 'Referencia del componente NgbHighlight. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbHighlight, <ngb-highlight result="label" term="query">, result, <, string, term, highlight-class, <?, "ngb-highlight", accent-sensitive, boolean, true.'
      }
    }
  },
  {
    id: "components.typeahead.api.ngb-typeahead-config",
    url: "/components/typeahead/api",
    fragment: "ngb-typeahead-config",
    translations: {
      en_us: {
        title: "NgbTypeaheadConfig",
        content: 'Service Provides application-wide typeahead defaults. Properties Property Default container undefined editable , focusFirst true selectOnExact , showHint false placement ["bottom-start", "bottom-end", "top-start", "top-end"] popperOptions Identity transform'
      },
      es_mx: {
        title: "NgbTypeaheadConfig",
        content: 'Referencia del servicio NgbTypeaheadConfig. Documenta su marcado, configuracion, entradas, salidas, propiedades, metodos y comportamiento. Terminos de API: NgbTypeaheadConfig, container, undefined, editable, focusFirst, true, selectOnExact, showHint, false, placement, ["bottom-start", "bottom-end", "top-start", "top-end"], popperOptions.'
      }
    }
  },
  {
    id: "components.accordion.examples.accordion-simple",
    url: "/components/accordion/examples",
    fragment: "accordion-simple",
    translations: {
      en_us: {
        title: "Basic accordion",
        content: "Three items with a regular header, a header rendered from a template and a disabled item."
      },
      es_mx: {
        title: "Basic accordion",
        content: "Ejemplo de accordion: Three items with a regular header, a header rendered from a template and a disabled item."
      }
    }
  },
  {
    id: "components.accordion.examples.one-panel-accordion",
    url: "/components/accordion/examples",
    fragment: "one-panel-accordion",
    translations: {
      en_us: {
        title: "One panel at a time",
        content: "Opening an item automatically closes the previously expanded panel."
      },
      es_mx: {
        title: "One panel at a time",
        content: "Ejemplo de accordion: Opening an item automatically closes the previously expanded panel."
      }
    }
  },
  {
    id: "components.accordion.examples.accordion-toggle-panels",
    url: "/components/accordion/examples",
    fragment: "accordion-toggle-panels",
    translations: {
      en_us: {
        title: "Programmatic controls",
        content: "Use the accordion controller to expand, collapse or toggle panels by id."
      },
      es_mx: {
        title: "Programmatic controls",
        content: "Ejemplo de accordion: Use the accordion controller to expand, collapse or toggle panels by id."
      }
    }
  },
  {
    id: "components.accordion.examples.accordion-custom-header",
    url: "/components/accordion/examples",
    fragment: "accordion-custom-header",
    translations: {
      en_us: {
        title: "Custom headers",
        content: "Build richer triggers with Bootstrap utilities while keeping the accordion behavior and accessibility state."
      },
      es_mx: {
        title: "Custom headers",
        content: "Ejemplo de accordion: Build richer triggers with Bootstrap utilities while keeping the accordion behavior and accessibility state."
      }
    }
  },
  {
    id: "components.accordion.examples.accordion-content",
    url: "/components/accordion/examples",
    fragment: "accordion-content",
    translations: {
      en_us: {
        title: "Preserve panel content",
        content: "Keep collapsed content mounted when its local state must survive closing and reopening the panel."
      },
      es_mx: {
        title: "Preserve panel content",
        content: "Ejemplo de accordion: Keep collapsed content mounted when its local state must survive closing and reopening the panel."
      }
    }
  },
  {
    id: "components.accordion.examples.accordion-global",
    url: "/components/accordion/examples",
    fragment: "accordion-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbAccordionConfig once to define defaults for accordions that do not provide local values."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de accordion: Change NgbAccordionConfig once to define defaults for accordions that do not provide local values."
      }
    }
  },
  {
    id: "components.alert.examples.simple-alert",
    url: "/components/alert/examples",
    fragment: "simple-alert",
    translations: {
      en_us: {
        title: "Simple alert",
        content: "A basic alert with a fixed type and no dismiss button."
      },
      es_mx: {
        title: "Simple alert",
        content: "Ejemplo de alert: A basic alert with a fixed type and no dismiss button."
      }
    }
  },
  {
    id: "components.alert.examples.alert-closeable",
    url: "/components/alert/examples",
    fragment: "alert-closeable",
    translations: {
      en_us: {
        title: "Closeable alerts",
        content: "Four dismissible alerts: two close with animation and two close immediately."
      },
      es_mx: {
        title: "Closeable alerts",
        content: "Ejemplo de alert: Four dismissible alerts: two close with animation and two close immediately."
      }
    }
  },
  {
    id: "components.alert.examples.self-closing-alert",
    url: "/components/alert/examples",
    fragment: "self-closing-alert",
    translations: {
      en_us: {
        title: "Self-closing alert",
        content: "A timeout updates the countdown and closes the alert when it reaches zero."
      },
      es_mx: {
        title: "Self-closing alert",
        content: "Ejemplo de alert: A timeout updates the countdown and closes the alert when it reaches zero."
      }
    }
  },
  {
    id: "components.alert.examples.alert-custom",
    url: "/components/alert/examples",
    fragment: "alert-custom",
    translations: {
      en_us: {
        title: "Custom alert",
        content: "A custom alert type styled through the alert-custom class and Bootstrap variables."
      },
      es_mx: {
        title: "Custom alert",
        content: "Ejemplo de alert: A custom alert type styled through the alert-custom class and Bootstrap variables."
      }
    }
  },
  {
    id: "components.alert.examples.alert-global",
    url: "/components/alert/examples",
    fragment: "alert-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbAlertConfig once to define defaults for alerts without local inputs."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de alert: Change NgbAlertConfig once to define defaults for alerts without local inputs."
      }
    }
  },
  {
    id: "components.carousel.examples.carousel-simple",
    url: "/components/carousel/examples",
    fragment: "carousel-simple",
    translations: {
      en_us: {
        title: "Simple carousel",
        content: "A carousel using the default options, including navigation arrows and indicators."
      },
      es_mx: {
        title: "Simple carousel",
        content: "Ejemplo de carousel: A carousel using the default options, including navigation arrows and indicators."
      }
    }
  },
  {
    id: "components.carousel.examples.carousel-keyboard",
    url: "/components/carousel/examples",
    fragment: "carousel-keyboard",
    translations: {
      en_us: {
        title: "Keyboard navigation",
        content: "A carousel without visible controls or indicators that moves only with the left and right arrow keys."
      },
      es_mx: {
        title: "Keyboard navigation",
        content: "Ejemplo de carousel: A carousel without visible controls or indicators that moves only with the left and right arrow keys."
      }
    }
  },
  {
    id: "components.carousel.examples.carousel-controls",
    url: "/components/carousel/examples",
    fragment: "carousel-controls",
    translations: {
      en_us: {
        title: "Pause controls",
        content: "Try the native hover and focus options, then compose navigation behavior from slide events."
      },
      es_mx: {
        title: "Pause controls",
        content: "Ejemplo de carousel: Try the native hover and focus options, then compose navigation behavior from slide events."
      }
    }
  },
  {
    id: "components.carousel.examples.carousel-global",
    url: "/components/carousel/examples",
    fragment: "carousel-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbCarouselConfig once to define carousel defaults without adding local inputs."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de carousel: Change NgbCarouselConfig once to define carousel defaults without adding local inputs."
      }
    }
  },
  {
    id: "components.collapse.examples.simple-collapse",
    url: "/components/collapse/examples",
    fragment: "simple-collapse",
    translations: {
      en_us: {
        title: "Simple collapse",
        content: "Control the same panel by calling toggle() on its controller or by changing the bound collapsed value."
      },
      es_mx: {
        title: "Simple collapse",
        content: "Ejemplo de collapse: Control the same panel by calling toggle() on its controller or by changing the bound collapsed value."
      }
    }
  },
  {
    id: "components.collapse.examples.horizontal-collapse",
    url: "/components/collapse/examples",
    fragment: "horizontal-collapse",
    translations: {
      en_us: {
        title: "Horizontal collapse",
        content: "Set horizontal to true to animate the element's width instead of its height."
      },
      es_mx: {
        title: "Horizontal collapse",
        content: "Ejemplo de collapse: Set horizontal to true to animate the element's width instead of its height."
      }
    }
  },
  {
    id: "components.collapse.examples.navbar-collapse",
    url: "/components/collapse/examples",
    fragment: "navbar-collapse",
    translations: {
      en_us: {
        title: "Responsive navbar",
        content: "Combine NgbCollapse with Bootstrap's navbar classes to provide compact navigation on smaller viewports."
      },
      es_mx: {
        title: "Responsive navbar",
        content: "Ejemplo de collapse: Combine NgbCollapse with Bootstrap's navbar classes to provide compact navigation on smaller viewports."
      }
    }
  },
  {
    id: "components.datepicker.examples.basic-datepicker",
    url: "/components/datepicker/examples",
    fragment: "basic-datepicker",
    translations: {
      en_us: {
        title: "Basic datepicker",
        content: "Bind an NgbDateStruct model to an inline calendar."
      },
      es_mx: {
        title: "Basic datepicker",
        content: "Ejemplo de datepicker: Bind an NgbDateStruct model to an inline calendar."
      }
    }
  },
  {
    id: "components.datepicker.examples.popup-datepicker",
    url: "/components/datepicker/examples",
    fragment: "popup-datepicker",
    translations: {
      en_us: {
        title: "Datepicker in a popup",
        content: "Attach the datepicker to an input and control its popup from a compact calendar button."
      },
      es_mx: {
        title: "Datepicker in a popup",
        content: "Ejemplo de datepicker: Attach the datepicker to an input and control its popup from a compact calendar button."
      }
    }
  },
  {
    id: "components.datepicker.examples.multiple-months-datepicker",
    url: "/components/datepicker/examples",
    fragment: "multiple-months-datepicker",
    translations: {
      en_us: {
        title: "Multiple months",
        content: "Display two consecutive months while keeping a single date model."
      },
      es_mx: {
        title: "Multiple months",
        content: "Ejemplo de datepicker: Display two consecutive months while keeping a single date model."
      }
    }
  },
  {
    id: "components.datepicker.examples.range-datepicker",
    url: "/components/datepicker/examples",
    fragment: "range-datepicker",
    translations: {
      en_us: {
        title: "Range selection",
        content: "Compose a date range from dateSelect and a custom day template with hover feedback."
      },
      es_mx: {
        title: "Range selection",
        content: "Ejemplo de datepicker: Compose a date range from dateSelect and a custom day template with hover feedback."
      }
    }
  },
  {
    id: "components.datepicker.examples.range-popup-datepicker",
    url: "/components/datepicker/examples",
    fragment: "range-popup-datepicker",
    translations: {
      en_us: {
        title: "Range selection in a popup",
        content: "Use the same range state and custom day view inside an input datepicker."
      },
      es_mx: {
        title: "Range selection in a popup",
        content: "Ejemplo de datepicker: Use the same range state and custom day view inside an input datepicker."
      }
    }
  },
  {
    id: "components.datepicker.examples.disabled-datepicker",
    url: "/components/datepicker/examples",
    fragment: "disabled-datepicker",
    translations: {
      en_us: {
        title: "Disabled datepicker",
        content: "Drive the disabled state through the disabled binding."
      },
      es_mx: {
        title: "Disabled datepicker",
        content: "Ejemplo de datepicker: Drive the disabled state through the disabled binding."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-custom-adapter",
    url: "/components/datepicker/examples",
    fragment: "datepicker-custom-adapter",
    translations: {
      en_us: {
        title: "Custom date adapter and formatter",
        content: "Keep a string application model while presenting and parsing a different input format."
      },
      es_mx: {
        title: "Custom date adapter and formatter",
        content: "Ejemplo de datepicker: Keep a string application model while presenting and parsing a different input format."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-i18n",
    url: "/components/datepicker/examples",
    fragment: "datepicker-i18n",
    translations: {
      en_us: {
        title: "Internationalization of datepickers",
        content: "Supply labels and accessible date descriptions per datepicker instance through NgbDatepickerI18n."
      },
      es_mx: {
        title: "Internationalization of datepickers",
        content: "Ejemplo de datepicker: Supply labels and accessible date descriptions per datepicker instance through NgbDatepickerI18n."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-custom-day",
    url: "/components/datepicker/examples",
    fragment: "datepicker-custom-day",
    translations: {
      en_us: {
        title: "Custom day view",
        content: "Render weekends, today, selection and focus states with a custom day template."
      },
      es_mx: {
        title: "Custom day view",
        content: "Ejemplo de datepicker: Render weekends, today, selection and focus states with a custom day template."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-custom-month",
    url: "/components/datepicker/examples",
    fragment: "datepicker-custom-month",
    translations: {
      en_us: {
        title: "Custom month layout",
        content: "Replace the datepicker content while reusing its public month view and navigation API."
      },
      es_mx: {
        title: "Custom month layout",
        content: "Ejemplo de datepicker: Replace the datepicker content while reusing its public month view and navigation API."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-footer",
    url: "/components/datepicker/examples",
    fragment: "datepicker-footer",
    translations: {
      en_us: {
        title: "Footer template",
        content: "Add Today and Clear actions below the calendar with a footer template."
      },
      es_mx: {
        title: "Footer template",
        content: "Ejemplo de datepicker: Add Today and Clear actions below the calendar with a footer template."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-position-target",
    url: "/components/datepicker/examples",
    fragment: "datepicker-position-target",
    translations: {
      en_us: {
        title: "Position target",
        content: "Trigger the popup from an input while positioning it against a separate element."
      },
      es_mx: {
        title: "Position target",
        content: "Ejemplo de datepicker: Trigger the popup from an input while positioning it against a separate element."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-keyboard",
    url: "/components/datepicker/examples",
    fragment: "datepicker-keyboard",
    translations: {
      en_us: {
        title: "Custom keyboard navigation",
        content: "Add application-specific month navigation keys without removing the built-in keyboard behavior."
      },
      es_mx: {
        title: "Custom keyboard navigation",
        content: "Ejemplo de datepicker: Add application-specific month navigation keys without removing the built-in keyboard behavior."
      }
    }
  },
  {
    id: "components.datepicker.examples.datepicker-global",
    url: "/components/datepicker/examples",
    fragment: "datepicker-global",
    translations: {
      en_us: {
        title: "Global configuration of datepickers",
        content: "Change defaults for inline and input datepickers through their configuration services."
      },
      es_mx: {
        title: "Global configuration of datepickers",
        content: "Ejemplo de datepicker: Change defaults for inline and input datepickers through their configuration services."
      }
    }
  },
  {
    id: "components.dropdown.examples.simple-dropdown",
    url: "/components/dropdown/examples",
    fragment: "simple-dropdown",
    translations: {
      en_us: {
        title: "Simple dropdown",
        content: "Two basic menus that prefer bottom and top placement respectively."
      },
      es_mx: {
        title: "Simple dropdown",
        content: "Ejemplo de dropdown: Two basic menus that prefer bottom and top placement respectively."
      }
    }
  },
  {
    id: "components.dropdown.examples.manual-dropdown",
    url: "/components/dropdown/examples",
    fragment: "manual-dropdown",
    translations: {
      en_us: {
        title: "Manual triggers",
        content: "Use the dropdown controller to open, close or toggle a menu without a toggle trigger."
      },
      es_mx: {
        title: "Manual triggers",
        content: "Ejemplo de dropdown: Use the dropdown controller to open, close or toggle a menu without a toggle trigger."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-button-groups",
    url: "/components/dropdown/examples",
    fragment: "dropdown-button-groups",
    translations: {
      en_us: {
        title: "Button groups and split buttons",
        content: "Place dropdown toggles inside Bootstrap button groups, including a split action."
      },
      es_mx: {
        title: "Button groups and split buttons",
        content: "Ejemplo de dropdown: Place dropdown toggles inside Bootstrap button groups, including a split action."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-disabled-items",
    url: "/components/dropdown/examples",
    fragment: "dropdown-disabled-items",
    translations: {
      en_us: {
        title: "Disabled items",
        content: "Use disabled to update disabled dropdown items dynamically."
      },
      es_mx: {
        title: "Disabled items",
        content: "Ejemplo de dropdown: Use disabled to update disabled dropdown items dynamically."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-form",
    url: "/components/dropdown/examples",
    fragment: "dropdown-form",
    translations: {
      en_us: {
        title: "Dropdown form",
        content: "Place an AngularJS form inside the menu and keep it open while interacting with its fields."
      },
      es_mx: {
        title: "Dropdown form",
        content: "Ejemplo de dropdown: Place an AngularJS form inside the menu and keep it open while interacting with its fields."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-body",
    url: "/components/dropdown/examples",
    fragment: "dropdown-body",
    translations: {
      en_us: {
        title: "Body container",
        content: "Append the menu to the document body when an ancestor clips overflowing content."
      },
      es_mx: {
        title: "Body container",
        content: "Ejemplo de dropdown: Append the menu to the document body when an ancestor clips overflowing content."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-navbar",
    url: "/components/dropdown/examples",
    fragment: "dropdown-navbar",
    translations: {
      en_us: {
        title: "Dynamic positioning in a navbar",
        content: "Override the navbar's static default with dynamic Popper positioning."
      },
      es_mx: {
        title: "Dynamic positioning in a navbar",
        content: "Ejemplo de dropdown: Override the navbar's static default with dynamic Popper positioning."
      }
    }
  },
  {
    id: "components.dropdown.examples.dropdown-global",
    url: "/components/dropdown/examples",
    fragment: "dropdown-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbDropdownConfig once to provide shared defaults without local inputs."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de dropdown: Change NgbDropdownConfig once to provide shared defaults without local inputs."
      }
    }
  },
  {
    id: "components.modal.examples.modal-default",
    url: "/components/modal/examples",
    fragment: "modal-default",
    translations: {
      en_us: {
        title: "Modal with default options",
        content: "Open a TemplateRef modal without passing local options."
      },
      es_mx: {
        title: "Modal with default options",
        content: "Ejemplo de modal: Open a TemplateRef modal without passing local options."
      }
    }
  },
  {
    id: "components.modal.examples.modal-component-content",
    url: "/components/modal/examples",
    fragment: "modal-component-content",
    translations: {
      en_us: {
        title: "Components as content",
        content: "Open a registered component, pass bindings to it and close or dismiss through NgbActiveModal."
      },
      es_mx: {
        title: "Components as content",
        content: "Ejemplo de modal: Open a registered component, pass bindings to it and close or dismiss through NgbActiveModal."
      }
    }
  },
  {
    id: "components.modal.examples.modal-focus",
    url: "/components/modal/examples",
    fragment: "modal-focus",
    translations: {
      en_us: {
        title: "Focus management",
        content: "Focus the first interactive element automatically or choose another element with ngbAutofocus."
      },
      es_mx: {
        title: "Focus management",
        content: "Ejemplo de modal: Focus the first interactive element automatically or choose another element with ngbAutofocus."
      }
    }
  },
  {
    id: "components.modal.examples.modal-options",
    url: "/components/modal/examples",
    fragment: "modal-options",
    translations: {
      en_us: {
        title: "Modal with options",
        content: "Open modal variants for custom classes, backdrops, sizes, fullscreen, centering and scrollable content."
      },
      es_mx: {
        title: "Modal with options",
        content: "Ejemplo de modal: Open modal variants for custom classes, backdrops, sizes, fullscreen, centering and scrollable content."
      }
    }
  },
  {
    id: "components.modal.examples.modal-updatable",
    url: "/components/modal/examples",
    fragment: "modal-updatable",
    translations: {
      en_us: {
        title: "Updatable options",
        content: "Change ARIA references, layout, size and custom classes after the modal has opened."
      },
      es_mx: {
        title: "Updatable options",
        content: "Ejemplo de modal: Change ARIA references, layout, size and custom classes after the modal has opened."
      }
    }
  },
  {
    id: "components.modal.examples.modal-stacked",
    url: "/components/modal/examples",
    fragment: "modal-stacked",
    translations: {
      en_us: {
        title: "Stacked modals",
        content: "Open multiple modal layers and dismiss the complete stack from the modal service."
      },
      es_mx: {
        title: "Stacked modals",
        content: "Ejemplo de modal: Open multiple modal layers and dismiss the complete stack from the modal service."
      }
    }
  },
  {
    id: "components.modal.examples.modal-global",
    url: "/components/modal/examples",
    fragment: "modal-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbModalConfig once to provide defaults for every modal opened in this example."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de modal: Change NgbModalConfig once to provide defaults for every modal opened in this example."
      }
    }
  },
  {
    id: "components.nav.examples.simple-nav",
    url: "/components/nav/examples",
    fragment: "simple-nav",
    translations: {
      en_us: {
        title: "Simple nav",
        content: "A basic tabbed nav with three items and an associated content outlet."
      },
      es_mx: {
        title: "Simple nav",
        content: "Ejemplo de nav: A basic tabbed nav with three items and an associated content outlet."
      }
    }
  },
  {
    id: "components.nav.examples.alternative-nav",
    url: "/components/nav/examples",
    fragment: "alternative-nav",
    translations: {
      en_us: {
        title: "Alternative markup",
        content: "Use div elements instead of lists and interchange buttons and anchors as nav links."
      },
      es_mx: {
        title: "Alternative markup",
        content: "Ejemplo de nav: Use div elements instead of lists and interchange buttons and anchors as nav links."
      }
    }
  },
  {
    id: "components.nav.examples.vertical-nav",
    url: "/components/nav/examples",
    fragment: "vertical-nav",
    translations: {
      en_us: {
        title: "Vertical pills",
        content: "Combine vertical orientation with Bootstrap nav pills and a side-by-side outlet."
      },
      es_mx: {
        title: "Vertical pills",
        content: "Ejemplo de nav: Combine vertical orientation with Bootstrap nav pills and a side-by-side outlet."
      }
    }
  },
  {
    id: "components.nav.examples.selecting-nav",
    url: "/components/nav/examples",
    fragment: "selecting-nav",
    translations: {
      en_us: {
        title: "Selecting navs",
        content: "Select any nav item programmatically through the NgbNav controller."
      },
      es_mx: {
        title: "Selecting navs",
        content: "Ejemplo de nav: Select any nav item programmatically through the NgbNav controller."
      }
    }
  },
  {
    id: "components.nav.examples.keep-content-nav",
    url: "/components/nav/examples",
    fragment: "keep-content-nav",
    translations: {
      en_us: {
        title: "Keep content",
        content: "Disable content destruction so form state remains in the DOM while another tab is active."
      },
      es_mx: {
        title: "Keep content",
        content: "Ejemplo de nav: Disable content destruction so form state remains in the DOM while another tab is active."
      }
    }
  },
  {
    id: "components.nav.examples.dynamic-nav",
    url: "/components/nav/examples",
    fragment: "dynamic-nav",
    translations: {
      en_us: {
        title: "Dynamic navs",
        content: "Add new tabs at runtime and safely remove the currently active item."
      },
      es_mx: {
        title: "Dynamic navs",
        content: "Ejemplo de nav: Add new tabs at runtime and safely remove the currently active item."
      }
    }
  },
  {
    id: "components.nav.examples.custom-nav",
    url: "/components/nav/examples",
    fragment: "custom-nav",
    translations: {
      en_us: {
        title: "Custom style",
        content: "Build a distinct nav appearance with a small custom class layered over NgbJS behavior."
      },
      es_mx: {
        title: "Custom style",
        content: "Ejemplo de nav: Build a distinct nav appearance with a small custom class layered over NgbJS behavior."
      }
    }
  },
  {
    id: "components.nav.examples.nav-global",
    url: "/components/nav/examples",
    fragment: "nav-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbNavConfig once to provide orientation, keyboard and content defaults."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de nav: Change NgbNavConfig once to provide orientation, keyboard and content defaults."
      }
    }
  },
  {
    id: "components.offcanvas.examples.offcanvas-default",
    url: "/components/offcanvas/examples",
    fragment: "offcanvas-default",
    translations: {
      en_us: {
        title: "Offcanvas with default options",
        content: "Open a TemplateRef panel without passing local options."
      },
      es_mx: {
        title: "Offcanvas with default options",
        content: "Ejemplo de offcanvas: Open a TemplateRef panel without passing local options."
      }
    }
  },
  {
    id: "components.offcanvas.examples.offcanvas-component-content",
    url: "/components/offcanvas/examples",
    fragment: "offcanvas-component-content",
    translations: {
      en_us: {
        title: "Components as content",
        content: "Open a registered component and close or dismiss it through NgbActiveOffcanvas."
      },
      es_mx: {
        title: "Components as content",
        content: "Ejemplo de offcanvas: Open a registered component and close or dismiss it through NgbActiveOffcanvas."
      }
    }
  },
  {
    id: "components.offcanvas.examples.offcanvas-focus",
    url: "/components/offcanvas/examples",
    fragment: "offcanvas-focus",
    translations: {
      en_us: {
        title: "Focus management",
        content: "Focus the first interactive element automatically or choose another element with ngbAutofocus."
      },
      es_mx: {
        title: "Focus management",
        content: "Ejemplo de offcanvas: Focus the first interactive element automatically or choose another element with ngbAutofocus."
      }
    }
  },
  {
    id: "components.offcanvas.examples.offcanvas-options",
    url: "/components/offcanvas/examples",
    fragment: "offcanvas-options",
    translations: {
      en_us: {
        title: "Offcanvas with options",
        content: "Try custom classes, a static backdrop, every panel position and body scrolling."
      },
      es_mx: {
        title: "Offcanvas with options",
        content: "Ejemplo de offcanvas: Try custom classes, a static backdrop, every panel position and body scrolling."
      }
    }
  },
  {
    id: "components.offcanvas.examples.offcanvas-global",
    url: "/components/offcanvas/examples",
    fragment: "offcanvas-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbOffcanvasConfig once to provide shared defaults when opening a panel."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de offcanvas: Change NgbOffcanvasConfig once to provide shared defaults when opening a panel."
      }
    }
  },
  {
    id: "components.pagination.examples.basic-pagination",
    url: "/components/pagination/examples",
    fragment: "basic-pagination",
    translations: {
      en_us: {
        title: "Basic pagination",
        content: "Navigate a collection with the default pagination options."
      },
      es_mx: {
        title: "Basic pagination",
        content: "Ejemplo de pagination: Navigate a collection with the default pagination options."
      }
    }
  },
  {
    id: "components.pagination.examples.advanced-pagination",
    url: "/components/pagination/examples",
    fragment: "advanced-pagination",
    translations: {
      en_us: {
        title: "Advanced pagination",
        content: "Limit visible pages, rotate the range and control boundary links and ellipses."
      },
      es_mx: {
        title: "Advanced pagination",
        content: "Ejemplo de pagination: Limit visible pages, rotate the range and control boundary links and ellipses."
      }
    }
  },
  {
    id: "components.pagination.examples.custom-pagination",
    url: "/components/pagination/examples",
    fragment: "custom-pagination",
    translations: {
      en_us: {
        title: "Custom links and pages",
        content: "Replace the previous, next and page-number content with ng-template."
      },
      es_mx: {
        title: "Custom links and pages",
        content: "Ejemplo de pagination: Replace the previous, next and page-number content with ng-template."
      }
    }
  },
  {
    id: "components.pagination.examples.pagination-size",
    url: "/components/pagination/examples",
    fragment: "pagination-size",
    translations: {
      en_us: {
        title: "Pagination size",
        content: "Use Bootstrap small, default and large pagination sizes."
      },
      es_mx: {
        title: "Pagination size",
        content: "Ejemplo de pagination: Use Bootstrap small, default and large pagination sizes."
      }
    }
  },
  {
    id: "components.pagination.examples.pagination-alignment",
    url: "/components/pagination/examples",
    fragment: "pagination-alignment",
    translations: {
      en_us: {
        title: "Pagination alignment",
        content: "Align pagination at the start, center or end using Bootstrap flex utilities."
      },
      es_mx: {
        title: "Pagination alignment",
        content: "Ejemplo de pagination: Align pagination at the start, center or end using Bootstrap flex utilities."
      }
    }
  },
  {
    id: "components.pagination.examples.disabled-pagination",
    url: "/components/pagination/examples",
    fragment: "disabled-pagination",
    translations: {
      en_us: {
        title: "Disabled pagination",
        content: "Disable every pagination action through the disabled input."
      },
      es_mx: {
        title: "Disabled pagination",
        content: "Ejemplo de pagination: Disable every pagination action through the disabled input."
      }
    }
  },
  {
    id: "components.pagination.examples.pagination-global",
    url: "/components/pagination/examples",
    fragment: "pagination-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbPaginationConfig once to provide shared pagination defaults."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de pagination: Change NgbPaginationConfig once to provide shared pagination defaults."
      }
    }
  },
  {
    id: "components.popover.examples.popover-placements",
    url: "/components/popover/examples",
    fragment: "popover-placements",
    translations: {
      en_us: {
        title: "Quick and easy popovers",
        content: "Place a popover above, to the right, below or to the left of its trigger."
      },
      es_mx: {
        title: "Quick and easy popovers",
        content: "Ejemplo de popover: Place a popover above, to the right, below or to the left of its trigger."
      }
    }
  },
  {
    id: "components.popover.examples.popover-template",
    url: "/components/popover/examples",
    fragment: "popover-template",
    translations: {
      en_us: {
        title: "HTML and bindings in popovers",
        content: "Use ng-template for rich title and body content with live AngularJS bindings."
      },
      es_mx: {
        title: "HTML and bindings in popovers",
        content: "Ejemplo de popover: Use ng-template for rich title and body content with live AngularJS bindings."
      }
    }
  },
  {
    id: "components.popover.examples.popover-triggers",
    url: "/components/popover/examples",
    fragment: "popover-triggers",
    translations: {
      en_us: {
        title: "Custom and manual triggers",
        content: "Pair custom DOM events or take manual control with two buttons."
      },
      es_mx: {
        title: "Custom and manual triggers",
        content: "Ejemplo de popover: Pair custom DOM events or take manual control with two buttons."
      }
    }
  },
  {
    id: "components.popover.examples.popover-manual-control",
    url: "/components/popover/examples",
    fragment: "popover-manual-control",
    translations: {
      en_us: {
        title: "External manual controls",
        content: "Open, close and toggle a target popover from independent controls."
      },
      es_mx: {
        title: "External manual controls",
        content: "Ejemplo de popover: Open, close and toggle a target popover from independent controls."
      }
    }
  },
  {
    id: "components.popover.examples.popover-autoclose",
    url: "/components/popover/examples",
    fragment: "popover-autoclose",
    translations: {
      en_us: {
        title: "Automatic closing with keyboard and mouse",
        content: "Close on inside clicks, outside clicks, every click or the Escape key."
      },
      es_mx: {
        title: "Automatic closing with keyboard and mouse",
        content: "Ejemplo de popover: Close on inside clicks, outside clicks, every click or the Escape key."
      }
    }
  },
  {
    id: "components.popover.examples.popover-context",
    url: "/components/popover/examples",
    fragment: "popover-context",
    translations: {
      en_us: {
        title: "Context and manual triggers",
        content: "Supply template context while opening manually or through popover-context."
      },
      es_mx: {
        title: "Context and manual triggers",
        content: "Ejemplo de popover: Supply template context while opening manually or through popover-context."
      }
    }
  },
  {
    id: "components.popover.examples.popover-custom-target",
    url: "/components/popover/examples",
    fragment: "popover-custom-target",
    translations: {
      en_us: {
        title: "Custom target",
        content: "Trigger a popover from one element while positioning it against another."
      },
      es_mx: {
        title: "Custom target",
        content: "Ejemplo de popover: Trigger a popover from one element while positioning it against another."
      }
    }
  },
  {
    id: "components.popover.examples.popover-delays",
    url: "/components/popover/examples",
    fragment: "popover-delays",
    translations: {
      en_us: {
        title: "Open and close delays",
        content: "Delay hover opening and keep content available while the pointer moves into it."
      },
      es_mx: {
        title: "Open and close delays",
        content: "Ejemplo de popover: Delay hover opening and keep content available while the pointer moves into it."
      }
    }
  },
  {
    id: "components.popover.examples.popover-events",
    url: "/components/popover/examples",
    fragment: "popover-events",
    translations: {
      en_us: {
        title: "Popover visibility events",
        content: "Observe shown and hidden callbacks and record when each transition completes."
      },
      es_mx: {
        title: "Popover visibility events",
        content: "Ejemplo de popover: Observe shown and hidden callbacks and record when each transition completes."
      }
    }
  },
  {
    id: "components.popover.examples.popover-body",
    url: "/components/popover/examples",
    fragment: "popover-body",
    translations: {
      en_us: {
        title: "Append popover in the body",
        content: "Escape clipping containers by appending the popover window to document.body."
      },
      es_mx: {
        title: "Append popover in the body",
        content: "Ejemplo de popover: Escape clipping containers by appending the popover window to document.body."
      }
    }
  },
  {
    id: "components.popover.examples.popover-custom-class",
    url: "/components/popover/examples",
    fragment: "popover-custom-class",
    translations: {
      en_us: {
        title: "Popover with custom class",
        content: "Layer a focused visual treatment over Bootstrap popover variables."
      },
      es_mx: {
        title: "Popover with custom class",
        content: "Ejemplo de popover: Layer a focused visual treatment over Bootstrap popover variables."
      }
    }
  },
  {
    id: "components.popover.examples.popover-global",
    url: "/components/popover/examples",
    fragment: "popover-global",
    translations: {
      en_us: {
        title: "Global configuration of popovers",
        content: "Change NgbPopoverConfig once to provide shared trigger, placement, delay and container defaults."
      },
      es_mx: {
        title: "Global configuration of popovers",
        content: "Ejemplo de popover: Change NgbPopoverConfig once to provide shared trigger, placement, delay and container defaults."
      }
    }
  },
  {
    id: "components.progressbar.examples.simple-progressbar",
    url: "/components/progressbar/examples",
    fragment: "simple-progressbar",
    translations: {
      en_us: {
        title: "Simple progress bars",
        content: "Display simple values using Bootstrap contextual types."
      },
      es_mx: {
        title: "Simple progress bars",
        content: "Ejemplo de progressbar: Display simple values using Bootstrap contextual types."
      }
    }
  },
  {
    id: "components.progressbar.examples.contextual-text-progressbar",
    url: "/components/progressbar/examples",
    fragment: "contextual-text-progressbar",
    translations: {
      en_us: {
        title: "Contextual text progress bars",
        content: "Show the calculated percentage and choose a contextual foreground color."
      },
      es_mx: {
        title: "Contextual text progress bars",
        content: "Ejemplo de progressbar: Show the calculated percentage and choose a contextual foreground color."
      }
    }
  },
  {
    id: "components.progressbar.examples.striped-progress-bar",
    url: "/components/progressbar/examples",
    fragment: "striped-progress-bar",
    translations: {
      en_us: {
        title: "Striped progress bars",
        content: "Apply striped styling to contextual variants and optionally animate the stripes."
      },
      es_mx: {
        title: "Striped progress bars",
        content: "Ejemplo de progressbar: Apply striped styling to contextual variants and optionally animate the stripes."
      }
    }
  },
  {
    id: "components.progressbar.examples.custom-labels-progressbar",
    url: "/components/progressbar/examples",
    fragment: "custom-labels-progressbar",
    translations: {
      en_us: {
        title: "Custom labels",
        content: "Project arbitrary HTML labels inside each progress bar."
      },
      es_mx: {
        title: "Custom labels",
        content: "Ejemplo de progressbar: Project arbitrary HTML labels inside each progress bar."
      }
    }
  },
  {
    id: "components.progressbar.examples.progress-height",
    url: "/components/progressbar/examples",
    fragment: "progress-height",
    translations: {
      en_us: {
        title: "Progress height",
        content: "Set the progress container height through the height input."
      },
      es_mx: {
        title: "Progress height",
        content: "Ejemplo de progressbar: Set the progress container height through the height input."
      }
    }
  },
  {
    id: "components.progressbar.examples.progress-bars-stacked",
    url: "/components/progressbar/examples",
    fragment: "progress-bars-stacked",
    translations: {
      en_us: {
        title: "Stacked progress bars",
        content: "Combine multiple contextual segments inside NgbProgressbarStacked."
      },
      es_mx: {
        title: "Stacked progress bars",
        content: "Ejemplo de progressbar: Combine multiple contextual segments inside NgbProgressbarStacked."
      }
    }
  },
  {
    id: "components.progressbar.examples.progressbar-global",
    url: "/components/progressbar/examples",
    fragment: "progressbar-global",
    translations: {
      en_us: {
        title: "Global configuration",
        content: "Change NgbProgressbarConfig once to provide shared visual and value defaults."
      },
      es_mx: {
        title: "Global configuration",
        content: "Ejemplo de progressbar: Change NgbProgressbarConfig once to provide shared visual and value defaults."
      }
    }
  },
  {
    id: "components.rating.examples.basic-rating",
    url: "/components/rating/examples",
    fragment: "basic-rating",
    translations: {
      en_us: {
        title: "Basic demo",
        content: "Select a rating and synchronize its value through rate-change."
      },
      es_mx: {
        title: "Basic demo",
        content: "Ejemplo de rating: Select a rating and synchronize its value through rate-change."
      }
    }
  },
  {
    id: "components.rating.examples.rating-events",
    url: "/components/rating/examples",
    fragment: "rating-events",
    translations: {
      en_us: {
        title: "Events and readonly ratings",
        content: "Observe hover and leave events and switch the same rating between editable and read-only states."
      },
      es_mx: {
        title: "Events and readonly ratings",
        content: "Ejemplo de rating: Observe hover and leave events and switch the same rating between editable and read-only states."
      }
    }
  },
  {
    id: "components.rating.examples.rating-custom-template",
    url: "/components/rating/examples",
    fragment: "rating-custom-template",
    translations: {
      en_us: {
        title: "Custom star template",
        content: "Replace the default characters with a child ng-template using Bootstrap Icons."
      },
      es_mx: {
        title: "Custom star template",
        content: "Ejemplo de rating: Replace the default characters with a child ng-template using Bootstrap Icons."
      }
    }
  },
  {
    id: "components.rating.examples.rating-decimal",
    url: "/components/rating/examples",
    fragment: "rating-decimal",
    translations: {
      en_us: {
        title: "Custom decimal rating",
        content: "Render fractional heart fills through star-template and provide accessible value text."
      },
      es_mx: {
        title: "Custom decimal rating",
        content: "Ejemplo de rating: Render fractional heart fills through star-template and provide accessible value text."
      }
    }
  },
  {
    id: "components.rating.examples.rating-form",
    url: "/components/rating/examples",
    fragment: "rating-form",
    translations: {
      en_us: {
        title: "Form integration",
        content: "Synchronize rate and rate-change with an AngularJS form model while direct ng-model support remains pending."
      },
      es_mx: {
        title: "Form integration",
        content: "Ejemplo de rating: Synchronize rate and rate-change with an AngularJS form model while direct ng-model support remains pending."
      }
    }
  },
  {
    id: "components.rating.examples.rating-global",
    url: "/components/rating/examples",
    fragment: "rating-global",
    translations: {
      en_us: {
        title: "Customized default values",
        content: "Change NgbRatingConfig once to provide shared maximum, read-only and tabindex defaults."
      },
      es_mx: {
        title: "Customized default values",
        content: "Ejemplo de rating: Change NgbRatingConfig once to provide shared maximum, read-only and tabindex defaults."
      }
    }
  },
  {
    id: "components.scrollspy.examples.basic-scrollspy",
    url: "/components/scrollspy/examples",
    fragment: "basic-scrollspy",
    translations: {
      en_us: {
        title: "Basic",
        content: "Observe fragments inside an independent scroll container and read the currently active id."
      },
      es_mx: {
        title: "Basic",
        content: "Ejemplo de scrollspy: Observe fragments inside an independent scroll container and read the currently active id."
      }
    }
  },
  {
    id: "components.scrollspy.examples.scrollspy-menu-items",
    url: "/components/scrollspy/examples",
    fragment: "scrollspy-menu-items",
    translations: {
      en_us: {
        title: "Menu items",
        content: "Connect Bootstrap list-group items to a scrollspy instance outside the observed container."
      },
      es_mx: {
        title: "Menu items",
        content: "Ejemplo de scrollspy: Connect Bootstrap list-group items to a scrollspy instance outside the observed container."
      }
    }
  },
  {
    id: "components.scrollspy.examples.nested-scrollspy",
    url: "/components/scrollspy/examples",
    fragment: "nested-scrollspy",
    translations: {
      en_us: {
        title: "Nested items",
        content: "Group child fragments under parent menu items and keep both levels synchronized."
      },
      es_mx: {
        title: "Nested items",
        content: "Ejemplo de scrollspy: Group child fragments under parent menu items and keep both levels synchronized."
      }
    }
  },
  {
    id: "components.scrollspy.examples.navbar-scrollspy",
    url: "/components/scrollspy/examples",
    fragment: "navbar-scrollspy",
    translations: {
      en_us: {
        title: "Navbar",
        content: "Use a Bootstrap navbar as an external menu for a separate scroll container."
      },
      es_mx: {
        title: "Navbar",
        content: "Ejemplo de scrollspy: Use a Bootstrap navbar as an external menu for a separate scroll container."
      }
    }
  },
  {
    id: "components.scrollspy.examples.scrollspy-service",
    url: "/components/scrollspy/examples",
    fragment: "scrollspy-service",
    translations: {
      en_us: {
        title: "Using the service",
        content: "Start, stop and control observation programmatically with NgbScrollSpyService and ordinary DOM fragments."
      },
      es_mx: {
        title: "Using the service",
        content: "Ejemplo de scrollspy: Start, stop and control observation programmatically with NgbScrollSpyService and ordinary DOM fragments."
      }
    }
  },
  {
    id: "components.timepicker.examples.basic-timepicker",
    url: "/components/timepicker/examples",
    fragment: "basic-timepicker",
    translations: {
      en_us: {
        title: "Basic timepicker",
        content: "Bind an NgbTimeStruct model to the default timepicker."
      },
      es_mx: {
        title: "Basic timepicker",
        content: "Ejemplo de timepicker: Bind an NgbTimeStruct model to the default timepicker."
      }
    }
  },
  {
    id: "components.timepicker.examples.meridian-timepicker",
    url: "/components/timepicker/examples",
    fragment: "meridian-timepicker",
    translations: {
      en_us: {
        title: "Meridian",
        content: "Switch between 24-hour and 12-hour input with a localized period selector."
      },
      es_mx: {
        title: "Meridian",
        content: "Ejemplo de timepicker: Switch between 24-hour and 12-hour input with a localized period selector."
      }
    }
  },
  {
    id: "components.timepicker.examples.seconds-timepicker",
    url: "/components/timepicker/examples",
    fragment: "seconds-timepicker",
    translations: {
      en_us: {
        title: "Seconds",
        content: "Show or hide the seconds field while preserving the same time model."
      },
      es_mx: {
        title: "Seconds",
        content: "Ejemplo de timepicker: Show or hide the seconds field while preserving the same time model."
      }
    }
  },
  {
    id: "components.timepicker.examples.spinners-timepicker",
    url: "/components/timepicker/examples",
    fragment: "spinners-timepicker",
    translations: {
      en_us: {
        title: "Spinners",
        content: "Toggle the increment and decrement controls without disabling keyboard input."
      },
      es_mx: {
        title: "Spinners",
        content: "Ejemplo de timepicker: Toggle the increment and decrement controls without disabling keyboard input."
      }
    }
  },
  {
    id: "components.timepicker.examples.timepicker-custom-steps",
    url: "/components/timepicker/examples",
    fragment: "timepicker-custom-steps",
    translations: {
      en_us: {
        title: "Custom steps",
        content: "Configure independent increments for hours, minutes and seconds."
      },
      es_mx: {
        title: "Custom steps",
        content: "Ejemplo de timepicker: Configure independent increments for hours, minutes and seconds."
      }
    }
  },
  {
    id: "components.timepicker.examples.timepicker-validation",
    url: "/components/timepicker/examples",
    fragment: "timepicker-validation",
    translations: {
      en_us: {
        title: "Custom validation",
        content: "Add an AngularJS ngModel validator that only accepts times between 12:00 and 13:59."
      },
      es_mx: {
        title: "Custom validation",
        content: "Ejemplo de timepicker: Add an AngularJS ngModel validator that only accepts times between 12:00 and 13:59."
      }
    }
  },
  {
    id: "components.timepicker.examples.timepicker-custom-adapter",
    url: "/components/timepicker/examples",
    fragment: "timepicker-custom-adapter",
    translations: {
      en_us: {
        title: "Custom time adapter",
        content: "Implement NgbTimeAdapter to convert between NgbTimeStruct and an application-level HH:mm:ss string. Adapter providers are application-wide in AngularJS."
      },
      es_mx: {
        title: "Custom time adapter",
        content: "Ejemplo de timepicker: Implement NgbTimeAdapter to convert between NgbTimeStruct and an application-level HH:mm:ss string. Adapter providers are application-wide in AngularJS."
      }
    }
  },
  {
    id: "components.timepicker.examples.timepicker-i18n",
    url: "/components/timepicker/examples",
    fragment: "timepicker-i18n",
    translations: {
      en_us: {
        title: "Internationalization",
        content: "Replace NgbTimepickerI18n application-wide to supply custom Greek morning and afternoon labels."
      },
      es_mx: {
        title: "Internationalization",
        content: "Ejemplo de timepicker: Replace NgbTimepickerI18n application-wide to supply custom Greek morning and afternoon labels."
      }
    }
  },
  {
    id: "components.toast.examples.inline-toast",
    url: "/components/toast/examples",
    fragment: "inline-toast",
    translations: {
      en_us: {
        title: "Declarative inline usage",
        content: "Render static body-only and text-header toasts directly in the page."
      },
      es_mx: {
        title: "Declarative inline usage",
        content: "Ejemplo de toast: Render static body-only and text-header toasts directly in the page."
      }
    }
  },
  {
    id: "components.toast.examples.template-header-toast",
    url: "/components/toast/examples",
    fragment: "template-header-toast",
    translations: {
      en_us: {
        title: "Using a Template as header",
        content: "Project an ng-template to build a richer header with custom markup."
      },
      es_mx: {
        title: "Using a Template as header",
        content: "Ejemplo de toast: Project an ng-template to build a richer header with custom markup."
      }
    }
  },
  {
    id: "components.toast.examples.closeable-toast",
    url: "/components/toast/examples",
    fragment: "closeable-toast",
    translations: {
      en_us: {
        title: "Closeable toast",
        content: "Handle hidden to remove the toast and recreate it after a short delay."
      },
      es_mx: {
        title: "Closeable toast",
        content: "Ejemplo de toast: Handle hidden to remove the toast and recreate it after a short delay."
      }
    }
  },
  {
    id: "components.toast.examples.prevent-autohide-toast",
    url: "/components/toast/examples",
    fragment: "prevent-autohide-toast",
    translations: {
      en_us: {
        title: "Prevent autohide on mouseover",
        content: "Pause the autohide timer while the pointer remains over the toast and restart it on mouseleave."
      },
      es_mx: {
        title: "Prevent autohide on mouseover",
        content: "Ejemplo de toast: Pause the autohide timer while the pointer remains over the toast and restart it on mouseleave."
      }
    }
  },
  {
    id: "components.toast.examples.toast-management",
    url: "/components/toast/examples",
    fragment: "toast-management",
    translations: {
      en_us: {
        title: "Toast management service",
        content: "Create, remove and clear multiple notifications through a reusable AngularJS service."
      },
      es_mx: {
        title: "Toast management service",
        content: "Ejemplo de toast: Create, remove and clear multiple notifications through a reusable AngularJS service."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-placements",
    url: "/components/tooltip/examples",
    fragment: "tooltip-placements",
    translations: {
      en_us: {
        title: "Quick and easy tooltips",
        content: "Use the four primary Bootstrap placements with the default hover and focus triggers."
      },
      es_mx: {
        title: "Quick and easy tooltips",
        content: "Ejemplo de tooltip: Use the four primary Bootstrap placements with the default hover and focus triggers."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-template",
    url: "/components/tooltip/examples",
    fragment: "tooltip-template",
    translations: {
      en_us: {
        title: "HTML and bindings in tooltips",
        content: "Render an ng-template as tooltip content and keep its bindings synchronized."
      },
      es_mx: {
        title: "HTML and bindings in tooltips",
        content: "Ejemplo de tooltip: Render an ng-template as tooltip content and keep its bindings synchronized."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-triggers",
    url: "/components/tooltip/examples",
    fragment: "tooltip-triggers",
    translations: {
      en_us: {
        title: "Custom and manual triggers",
        content: "Pair custom DOM events or control a tooltip directly through its public controller."
      },
      es_mx: {
        title: "Custom and manual triggers",
        content: "Ejemplo de tooltip: Pair custom DOM events or control a tooltip directly through its public controller."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-autoclose",
    url: "/components/tooltip/examples",
    fragment: "tooltip-autoclose",
    translations: {
      en_us: {
        title: "Automatic closing with keyboard and mouse",
        content: "Compare inside, outside and all-click closing while preserving Escape keyboard support."
      },
      es_mx: {
        title: "Automatic closing with keyboard and mouse",
        content: "Ejemplo de tooltip: Compare inside, outside and all-click closing while preserving Escape keyboard support."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-context",
    url: "/components/tooltip/examples",
    fragment: "tooltip-context",
    translations: {
      en_us: {
        title: "Context and manual triggers",
        content: "Pass template context at open time or provide a default tooltip-context."
      },
      es_mx: {
        title: "Context and manual triggers",
        content: "Ejemplo de tooltip: Pass template context at open time or provide a default tooltip-context."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-custom-target",
    url: "/components/tooltip/examples",
    fragment: "tooltip-custom-target",
    translations: {
      en_us: {
        title: "Custom target",
        content: "Trigger the tooltip from one element while positioning it against another."
      },
      es_mx: {
        title: "Custom target",
        content: "Ejemplo de tooltip: Trigger the tooltip from one element while positioning it against another."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-delays",
    url: "/components/tooltip/examples",
    fragment: "tooltip-delays",
    translations: {
      en_us: {
        title: "Open and close delays",
        content: "Delay opening and closing while allowing the pointer to move safely into the tooltip."
      },
      es_mx: {
        title: "Open and close delays",
        content: "Ejemplo de tooltip: Delay opening and closing while allowing the pointer to move safely into the tooltip."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-body",
    url: "/components/tooltip/examples",
    fragment: "tooltip-body",
    translations: {
      en_us: {
        title: "Append tooltip in the body",
        content: "Escape a clipping container by appending the tooltip window directly to document.body."
      },
      es_mx: {
        title: "Append tooltip in the body",
        content: "Ejemplo de tooltip: Escape a clipping container by appending the tooltip window directly to document.body."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-custom-class",
    url: "/components/tooltip/examples",
    fragment: "tooltip-custom-class",
    translations: {
      en_us: {
        title: "Tooltip with custom class",
        content: "Apply a small custom theme through Bootstrap tooltip variables."
      },
      es_mx: {
        title: "Tooltip with custom class",
        content: "Ejemplo de tooltip: Apply a small custom theme through Bootstrap tooltip variables."
      }
    }
  },
  {
    id: "components.tooltip.examples.tooltip-global",
    url: "/components/tooltip/examples",
    fragment: "tooltip-global",
    translations: {
      en_us: {
        title: "Global configuration of tooltips",
        content: "Set shared container, placement, trigger and delay defaults through NgbTooltipConfig."
      },
      es_mx: {
        title: "Global configuration of tooltips",
        content: "Ejemplo de tooltip: Set shared container, placement, trigger and delay defaults through NgbTooltipConfig."
      }
    }
  },
  {
    id: "components.typeahead.examples.simple-typeahead",
    url: "/components/typeahead/examples",
    fragment: "simple-typeahead",
    translations: {
      en_us: {
        title: "Simple Typeahead",
        content: "Debounce a local string search, require two characters and limit the result set."
      },
      es_mx: {
        title: "Simple Typeahead",
        content: "Ejemplo de typeahead: Debounce a local string search, require two characters and limit the result set."
      }
    }
  },
  {
    id: "components.typeahead.examples.focus-typeahead",
    url: "/components/typeahead/examples",
    fragment: "focus-typeahead",
    translations: {
      en_us: {
        title: "Open on focus",
        content: "Merge an explicit focus stream with user input so an empty field can display suggestions immediately."
      },
      es_mx: {
        title: "Open on focus",
        content: "Ejemplo de typeahead: Merge an explicit focus stream with user input so an empty field can display suggestions immediately."
      }
    }
  },
  {
    id: "components.typeahead.examples.formatted-typeahead",
    url: "/components/typeahead/examples",
    fragment: "formatted-typeahead",
    translations: {
      en_us: {
        title: "Formatted results",
        content: "Transform result labels without changing the selected model value."
      },
      es_mx: {
        title: "Formatted results",
        content: "Ejemplo de typeahead: Transform result labels without changing the selected model value."
      }
    }
  },
  {
    id: "components.typeahead.examples.exact-typeahead",
    url: "/components/typeahead/examples",
    fragment: "exact-typeahead",
    translations: {
      en_us: {
        title: "Select on exact",
        content: "Select an object automatically when its formatted label is the only exact match."
      },
      es_mx: {
        title: "Select on exact",
        content: "Ejemplo de typeahead: Select an object automatically when its formatted label is the only exact match."
      }
    }
  },
  {
    id: "components.typeahead.examples.wikipedia-typeahead",
    url: "/components/typeahead/examples",
    fragment: "wikipedia-typeahead",
    translations: {
      en_us: {
        title: "Wikipedia search",
        content: "Retrieve remote suggestions through AngularJS $http with debounce, stale-response switching and error feedback."
      },
      es_mx: {
        title: "Wikipedia search",
        content: "Ejemplo de typeahead: Retrieve remote suggestions through AngularJS $http with debounce, stale-response switching and error feedback."
      }
    }
  },
  {
    id: "components.typeahead.examples.template-results-typeahead",
    url: "/components/typeahead/examples",
    fragment: "template-results-typeahead",
    translations: {
      en_us: {
        title: "Template for results",
        content: "Render object results with a custom template, contextual term highlighting and additional metadata."
      },
      es_mx: {
        title: "Template for results",
        content: "Ejemplo de typeahead: Render object results with a custom template, contextual term highlighting and additional metadata."
      }
    }
  },
  {
    id: "components.typeahead.examples.non-editable-typeahead",
    url: "/components/typeahead/examples",
    fragment: "non-editable-typeahead",
    translations: {
      en_us: {
        title: "Prevent manual entry",
        content: "Keep the model null until the user chooses a valid object from the suggestion list."
      },
      es_mx: {
        title: "Prevent manual entry",
        content: "Ejemplo de typeahead: Keep the model null until the user chooses a valid object from the suggestion list."
      }
    }
  },
  {
    id: "components.typeahead.examples.typeahead-global",
    url: "/components/typeahead/examples",
    fragment: "typeahead-global",
    translations: {
      en_us: {
        title: "Global configuration of typeaheads",
        content: "Configure hint completion, exact selection and body container defaults through NgbTypeaheadConfig."
      },
      es_mx: {
        title: "Global configuration of typeaheads",
        content: "Ejemplo de typeahead: Configure hint completion, exact selection and body container defaults through NgbTypeaheadConfig."
      }
    }
  }
];

// src/app/core/constants/search-documents.constant.ts
var documents2 = documents;

// src/app/core/services/language.service.ts
var LanguageService = class {
  constructor(language) {
    this.language = language;
    this._changeLang = new BehaviorSubject(this.language);
    this.changeLang$ = this._changeLang.asObservable();
  }
  selectLanguage(language) {
    this._changeLang.next(language);
  }
};
LanguageService.ɵfac = [
  "LANGUAGE_a3d2cfaa",
  function LanguageService_Factory(a0) {
    return new (this && this.ɵT || LanguageService)(a0);
  }
];
LanguageService.ɵprov = {
  token: "LanguageService_40a01705"
};

// src/app/core/services/scroll.service.ts
var ScrollService = class {
  constructor(router) {
    this.router = router;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      requestAnimationFrame(() => {
        document.getElementById("docs-content-scroll")?.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto"
        });
      });
    });
  }
};
ScrollService.ɵfac = [
  "Router_ad76dc05",
  function ScrollService_Factory(a0) {
    return new (this && this.ɵT || ScrollService)(a0);
  }
];
ScrollService.ɵprov = {
  token: "ScrollService_2946cf49"
};

// src/app/core/core.module.ts
var CoreModule = class {
};
CoreModule.ɵfac = [
  function CoreModule_Factory() {
    return new (this && this.ɵT || CoreModule)();
  }
];
CoreModule.ɵmod = {
  id: "CoreModule_6195aa94",
  controllerAs: "$"
};
import_angular3.default.module("CoreModule_6195aa94", [
  LayoutModule.ɵmod.id
]).value("THEME_STORAGE_KEY_3039135a", "theme").value("LANGUAGE_STORAGE_KEY_1438a9dc", "language").value("THEMES_ENUM_1b687200", Themes).value("SEARCH_DOCUMENTS_117b00f2", documents2).value("BOOTSTRAP_URL_c33137ca", bootstrapUrlFactory({
  url: "https://getbootstrap.com",
  version: 5.3
})).value("NG_BOOTSTRAP_URL_c3f6f7a5", ngBootstrapUrlFactory({
  url: "https://ng-bootstrap.github.io"
})).factory("THEME_fcda928d", [
  "THEME_STORAGE_KEY_3039135a",
  themeFactory
]).factory("LANGUAGE_a3d2cfaa", [
  "LANGUAGE_STORAGE_KEY_1438a9dc",
  languageFactory
]).factory("INDEXING_9ae97040", [
  "LANGUAGE_a3d2cfaa",
  "SEARCH_DOCUMENTS_117b00f2",
  buildSearchIndex
]).factory("ThemeService_7aad7fc5", Object.prototype.hasOwnProperty.call(ThemeService, "ɵprov") && ThemeService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(ThemeService, "ɵfac") ? ThemeService.ɵfac : ThemeService.ɵfac ? (function() {
  throw new Error('"' + ThemeService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new ThemeService();
  }
])).factory("LanguageService_40a01705", Object.prototype.hasOwnProperty.call(LanguageService, "ɵprov") && LanguageService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(LanguageService, "ɵfac") ? LanguageService.ɵfac : LanguageService.ɵfac ? (function() {
  throw new Error('"' + LanguageService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new LanguageService();
  }
])).factory("MenuService_5b087ccb", Object.prototype.hasOwnProperty.call(MenuService, "ɵprov") && MenuService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(MenuService, "ɵfac") ? MenuService.ɵfac : MenuService.ɵfac ? (function() {
  throw new Error('"' + MenuService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new MenuService();
  }
])).factory("TitleService_a4901420", Object.prototype.hasOwnProperty.call(TitleService, "ɵprov") && TitleService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(TitleService, "ɵfac") ? TitleService.ɵfac : TitleService.ɵfac ? (function() {
  throw new Error('"' + TitleService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new TitleService();
  }
])).factory("ScrollService_2946cf49", Object.prototype.hasOwnProperty.call(ScrollService, "ɵprov") && ScrollService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(ScrollService, "ɵfac") ? ScrollService.ɵfac : ScrollService.ɵfac ? (function() {
  throw new Error('"' + ScrollService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new ScrollService();
  }
])).factory("SearchService_c7962832", Object.prototype.hasOwnProperty.call(SearchService, "ɵprov") && SearchService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(SearchService, "ɵfac") ? SearchService.ɵfac : SearchService.ɵfac ? (function() {
  throw new Error('"' + SearchService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new SearchService();
  }
])).factory("CoreModule_70b2a9fa", CoreModule.ɵfac).run([
  "CoreModule_70b2a9fa",
  function() {
  }
]);

// src/app/features/home/home.module.ts
var import_angular4 = __toESM(require_angular(), 1);

// src/app/features/home/components/home-hero/home-hero.component.ts
var brandIconUrl = "assets/brand/ngb-js-icon.png";
var HomeHeroComponent = class {
  constructor() {
    this.brandIconUrl = brandIconUrl;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = '.hero[_content-a100cb3b]{--surface: #f7f4f8;--surface-end: rgba(255, 255, 255, 0);--accent: var(--bs-primary);--line: rgba(var(--bs-primary-rgb), .22);position:relative;width:100%;overflow:hidden;padding:clamp(2.5rem,6vh,5rem)0 clamp(2rem,5vh,4rem);text-align:center;background:linear-gradient(180deg,var(--surface),var(--surface-end)),repeating-linear-gradient(90deg,transparent 0 4.5rem,rgba(var(--bs-primary-rgb),.045) 4.5rem calc(4.5rem + 1px))}[data-bs-theme="dark"] .hero[_content-a100cb3b]{--surface: #353d4c;--surface-end: rgba(44, 52, 68, 0);--accent: var(--bs-primary-text-emphasis);--line: rgba(192, 178, 198, .24)}.hero[_content-a100cb3b]::after{content:"";position:absolute;inset:auto 8%0;height:1px;background:linear-gradient(90deg,transparent,var(--line),transparent)}.content[_content-a100cb3b]{max-width:58rem;margin:0 auto}.hero-logo[_content-a100cb3b]{filter:drop-shadow(0 1rem 1.75rem rgba(76,67,81,.2))}[data-bs-theme="dark"] .hero-logo[_content-a100cb3b]{filter:drop-shadow(0 1rem 2rem rgba(0,0,0,.32))}.headline[_content-a100cb3b]{max-width:52rem;margin:0 auto 1.5rem;color:var(--bs-emphasis-color);font-size:5.5rem;font-weight:800;line-height:.95}.headline span[_content-a100cb3b]{color:var(--accent)}.summary[_content-a100cb3b]{max-width:48rem;margin:0 auto;color:var(--bs-secondary-color);font-size:1.35rem;line-height:1.55}.actions[_content-a100cb3b]{display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;margin-top:3rem}.actions .btn[_content-a100cb3b]{min-width:11rem;box-shadow:0 .75rem 1.5rem rgba(var(--bs-body-color-rgb),.08)}@media (max-width:575.98px){.hero[_content-a100cb3b]{padding:5rem 0 4rem}.headline[_content-a100cb3b]{font-size:3rem}.summary[_content-a100cb3b]{font-size:1.15rem}.actions[_content-a100cb3b]{display:grid}}@media (min-width:768px) and (max-height:850px){.hero[_content-a100cb3b]{padding:2rem 0 1.5rem}docs-home-hero .hero-logo[_content-a100cb3b]{width:7.5rem;margin-bottom:1rem}.headline[_content-a100cb3b]{margin-bottom:1rem;font-size:4.5rem}.summary[_content-a100cb3b]{font-size:1.2rem}.actions[_content-a100cb3b]{margin-top:2rem}}';
  document.head.appendChild(s);
})();
HomeHeroComponent.ɵfac = [
  "$element",
  "$scope",
  function HomeHeroComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || HomeHeroComponent)();
    return instance;
  }
];
HomeHeroComponent.ɵcmp = {
  selectors: [
    [
      "docs-home-hero"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/home-hero.component-2f1d6e2d.html"
  }
};
HomeHeroComponent.ɵfac.ɵcomponent = true;
HomeHeroComponent.ɵfac.ɵtype = HomeHeroComponent;

// src/app/features/home/pages/home-page/home-page.component.ts
var HomePageComponent = class {
  constructor() {
    this.installCommand = "npm install ngb-js";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-d635b789]{background:var(--bs-body-bg)}.rounded-3[_content-d635b789]{border-color:color-mix(in srgb,var(--bs-primary-border-subtle) 85%,var(--bs-border-color))!important;box-shadow:0 1rem 2.5rem rgba(var(--bs-body-color-rgb),.08)}.bg-black[_content-d635b789]{background:#111827!important}code[_content-d635b789]{color:var(--bs-light)}";
  document.head.appendChild(s);
})();
HomePageComponent.ɵfac = [
  "$element",
  "$scope",
  function HomePageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || HomePageComponent)();
    return instance;
  }
];
HomePageComponent.ɵcmp = {
  selectors: [
    [
      "home-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/home-page.component-34f83676.html"
  }
};
HomePageComponent.ɵfac.ɵcomponent = true;
HomePageComponent.ɵfac.ɵtype = HomePageComponent;

// src/app/features/home/home.module.ts
var HomeModule = class {
};
HomeModule.ɵfac = [
  function HomeModule_Factory() {
    return new (this && this.ɵT || HomeModule)();
  }
];
HomeModule.ɵmod = {
  id: "HomeModule_fe285497",
  controllerAs: "$"
};
import_angular4.default.module("HomeModule_fe285497", [
  typeof NgbTooltipModule === "string" ? NgbTooltipModule : NgbTooltipModule.ɵmod ? NgbTooltipModule.ɵmod.id : NgbTooltipModule.name
]).component("docsHomeHero", {
  controller: HomeHeroComponent.ɵfac,
  templateUrl: "templates/home-hero.component-2f1d6e2d.html",
  controllerAs: "$"
}).component("homePage", {
  controller: HomePageComponent.ɵfac,
  templateUrl: "templates/home-page.component-34f83676.html",
  controllerAs: "$"
}).factory("HomeModule_c7c6b68c", HomeModule.ɵfac).run([
  "HomeModule_c7c6b68c",
  function() {
  }
]);

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    pathMatch: "full",
    component: HomePageComponent
  },
  {
    path: "",
    component: MenuAbstractPageComponent,
    children: [
      {
        path: "guide",
        loadChildren: () => import("./guide.module-CYCJ75OF.js").then((m) => m.GuideModule)
      },
      {
        path: "components",
        loadChildren: () => import("./features.module-XXG3DWY2.js").then((m) => m.FeaturesModule)
      }
    ]
  }
];

// src/app/app.module.ts
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
var RootModule = class {
};
RootModule.ɵfac = [
  function RootModule_Factory() {
    return new (this && this.ɵT || RootModule)();
  }
];
var ɵRootModule_import0 = RouterModule.forRoot(routes, {
  useHash: true
});
RootModule.ɵmod = {
  id: "RootModule_636781b4",
  bootstrap: [
    "app-root"
  ],
  controllerAs: "$"
};
ɵimportProviders(import_angular5.default.module("RootModule_636781b4", [
  CoreModule.ɵmod.id,
  SharedModule.ɵmod.id,
  HomeModule.ɵmod.id,
  ɵimportedModuleName(ɵRootModule_import0)
]), [
  ɵRootModule_import0
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵscopedController
]).component("appRoot", {
  controller: AppComponent.ɵfac,
  template: "<ui-view></ui-view>",
  controllerAs: "$"
}).factory("RootModule_6c7e9bba", RootModule.ɵfac).run([
  "RootModule_6c7e9bba",
  function() {
  }
]);

// src/main.ts
bootstrapApplication(RootModule).catch((error) => {
  console.log(error);
});
