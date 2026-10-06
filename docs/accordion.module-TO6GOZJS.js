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
  NgbTooltipModule
} from "./chunk-CT3FPONO.js";
import {
  NgbCollapse,
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
  TemplateRef,
  ViewContainerRef,
  inject,
  isString,
  takeUntilDestroyed
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

// src/app/features/accordion/accordion.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-LRB6RCNW.js
var import_angular = __toESM(require_angular(), 1);
var NgbAccordionConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAccordionConfig"] ? globalThis.ɵngjsInjected["NgbAccordionConfig"][0] : inject(NgbConfig);
    this.closeOthers = false;
    this.destroyOnHide = true;
  }
};
NgbAccordionConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbAccordionConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbAccordionConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbAccordionConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbAccordionConfig.ɵprov = {
  token: "NgbAccordionConfig_a94c9de4",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbAccordionConfig_a94c9de4",
  NgbAccordionConfig.ɵfac
]);
var NgbAccordionDirective = class {
  /**
  * Alterna el item con el id dado. Lo alterna aunque esté deshabilitado.
  */
  toggle(itemId) {
    this._getItem(itemId)?.toggle();
  }
  /**
  * Expande el item con el id dado. Si `closeOthers` es `true`, colapsa los otros.
  */
  expand(itemId) {
    this._getItem(itemId)?.expand();
  }
  /**
  * Expande todos los items.
  *
  * Si `closeOthers` es `true` y todos están cerrados, abre el primero. Si no,
  * deja el que ya estaba abierto.
  */
  expandAll() {
    if (this._items) {
      if (this.closeOthers) {
        if (!this._items.find((item) => !item.collapsed)) {
          this._items.first.expand();
        }
      } else {
        this._items.forEach((item) => item.expand());
      }
    }
  }
  /**
  * Colapsa el item con el id dado. No hace nada si `itemId` no corresponde a
  * ningún item.
  */
  collapse(itemId) {
    this._getItem(itemId)?.collapse();
  }
  /** Colapsa todos los items. */
  collapseAll() {
    this._items?.forEach((item) => item.collapse());
  }
  /**
  * Chequea si el item con el id dado está expandido. Devuelve `false` si el
  * `itemId` no corresponde a ningún item.
  */
  isExpanded(itemId) {
    const item = this._getItem(itemId);
    return item ? !item.collapsed : false;
  }
  /**
  * Chequea si el item se puede expandir en el estado actual del acordeón.
  * Con `closeOthers` solo puede haber un item expandido a la vez.
  *
  * @internal
  */
  _ensureCanExpand(toExpand) {
    if (!this.closeOthers) {
      return true;
    }
    const registered = this._items?.toArray() ?? [];
    if (!registered.includes(toExpand)) {
      const initial = this._itemExpandedDuringInitialisation;
      const alreadyExpanded = registered.some((item) => !item.collapsed) || !!initial && initial !== toExpand && !initial.collapsed;
      if (alreadyExpanded) {
        return false;
      }
      this._itemExpandedDuringInitialisation = toExpand;
      return true;
    }
    this._items?.find((item) => !item.collapsed && toExpand !== item)?.collapse();
    return true;
  }
  _getItem(itemId) {
    return this._items?.find((item) => item.id === itemId);
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAccordionDirective"] ? globalThis.ɵngjsInjected["NgbAccordionDirective"][0] : inject(NgbAccordionConfig);
    this._hostClass = true;
    this.animation = this._config.animation;
    this.closeOthers = this._config.closeOthers;
    this.destroyOnHide = this._config.destroyOnHide;
    this.show = new EventEmitter();
    this.shown = new EventEmitter();
    this.hide = new EventEmitter();
    this.hidden = new EventEmitter();
  }
};
NgbAccordionDirective.ɵfac = [
  "NgbAccordionConfig_a94c9de4",
  "$element",
  "$scope",
  function NgbAccordionDirective_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbAccordionDirective": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbAccordionDirective)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion") : $element.removeClass("accordion");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("accordion") : $element.removeClass("accordion");
      })(instance._hostClass);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbAccordionDirective.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordion",
      ""
    ]
  ],
  inputs: {
    "animation": "animation",
    "closeOthers": "closeOthers",
    "destroyOnHide": "destroyOnHide"
  },
  outputs: {
    "show": "show",
    "shown": "shown",
    "hide": "hide",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbAccordion"
  ],
  queries: [
    {
      propertyName: "_items",
      first: false,
      descendants: false,
      static: false,
      get predicate() {
        return NgbAccordionItem;
      }
    }
  ],
  definition: {
    "bindings": {
      "animation": "<?",
      "closeOthers": "<?",
      "destroyOnHide": "<?",
      "show": "&?",
      "shown": "&?",
      "hide": "&?",
      "hidden": "&?"
    }
  }
};
NgbAccordionDirective.ɵfac.ɵtype = NgbAccordionDirective;
var nextId = 0;
var NgbAccordionItem = class {
  constructor(accordion, cd, destroyRef) {
    this._collapsed = true;
    this._id = `ngb-accordion-item-${nextId++}`;
    this._collapseAnimationRunning = false;
    this._hostClass = true;
    this.disabled = false;
    this.show = new EventEmitter();
    this.shown = new EventEmitter();
    this.hide = new EventEmitter();
    this.hidden = new EventEmitter();
    this._accordion = accordion;
    this._cd = cd;
    this._destroyRef = destroyRef;
  }
  get _hostId() {
    return this.id;
  }
  /**
  * Setea el ID custom del item del acordeón. Debe ser único en el documento.
  */
  set id(id) {
    if (isString(id) && id !== "") {
      this._id = id;
    }
  }
  /**
  * Si es `true`, el contenido del body del item se quita del DOM (si no, solo
  * se oculta). Se puede setear también en la directiva `NgbAccordion` padre.
  *
  * @defaultValue `true` — se inicializa desde el `NgbAccordion` padre
  */
  set destroyOnHide(destroyOnHide) {
    this._destroyOnHide = destroyOnHide;
  }
  get destroyOnHide() {
    return this._destroyOnHide === void 0 ? this._accordion.destroyOnHide : this._destroyOnHide;
  }
  /**
  * Si es `true`, el item arranca colapsado. Si no, expandido.
  *
  * @defaultValue `true`
  */
  set collapsed(collapsed) {
    if (collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  get collapsed() {
    return this._collapsed;
  }
  get id() {
    return `${this._id}`;
  }
  get toggleId() {
    return `${this.id}-toggle`;
  }
  get collapseId() {
    return `${this.id}-collapse`;
  }
  get _shouldBeInDOM() {
    return !this.collapsed || this._collapseAnimationRunning || !this.destroyOnHide;
  }
  ngAfterContentInit() {
    const { ngbCollapse } = this._collapse;
    ngbCollapse.animation = false;
    ngbCollapse.collapsed = this.collapsed;
    ngbCollapse.animation = this._accordion.animation;
    ngbCollapse.hidden.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._collapseAnimationRunning = false;
      this.hidden.emit();
      this._accordion.hidden.emit(this.id);
      this._cd.markForCheck();
    });
    ngbCollapse.shown.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this.shown.emit();
      this._accordion.shown.emit(this.id);
      this._cd.markForCheck();
    });
  }
  /** Alterna un item del acordeón. */
  toggle() {
    this.collapsed = !this.collapsed;
  }
  /** Expande un item del acordeón. */
  expand() {
    if (this.collapsed) {
      if (!this._accordion._ensureCanExpand(this)) {
        return;
      }
      this._collapsed = false;
      this._cd.markForCheck();
      this._cd.detectChanges();
      this.show.emit();
      this._accordion.show.emit(this.id);
      this._collapse.ngbCollapse.animation = this._accordion.animation;
      this._collapse.ngbCollapse.collapsed = false;
    }
  }
  /** Colapsa un item del acordeón. */
  collapse() {
    if (!this.collapsed) {
      this._collapsed = true;
      this._collapseAnimationRunning = true;
      this._cd.markForCheck();
      this.hide.emit();
      this._accordion.hide.emit(this.id);
      this._collapse.ngbCollapse.animation = this._accordion.animation;
      this._collapse.ngbCollapse.collapsed = true;
    }
  }
};
NgbAccordionItem.ɵfac = [
  "ChangeDetectorRef_e2bfcbab",
  "DestroyRef_a5c7a091",
  "$element",
  "$scope",
  function NgbAccordionItem_Factory(a1, a2, $element, $scope) {
    var instance = new (this && this.ɵT || NgbAccordionItem)(ɵelementInstance($element, [
      "ngbAccordion"
    ], {}, false), a1, a2);
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostId;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion-item") : $element.removeClass("accordion-item");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("id", v);
      })(instance._hostId);
      (function(v) {
        v ? $element.addClass("accordion-item") : $element.removeClass("accordion-item");
      })(instance._hostClass);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
    });
    return instance;
  }
];
NgbAccordionItem.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordionItem",
      ""
    ]
  ],
  inputs: {
    "ngbAccordionItem": "id",
    "destroyOnHide": "destroyOnHide",
    "disabled": "disabled",
    "collapsed": "collapsed"
  },
  outputs: {
    "show": "show",
    "shown": "shown",
    "hide": "hide",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbAccordionItem"
  ],
  queries: [
    {
      propertyName: "_collapse",
      first: true,
      descendants: true,
      static: true,
      get predicate() {
        return NgbAccordionCollapse;
      }
    }
  ],
  definition: {
    "bindings": {
      "id": "<?ngbAccordionItem",
      "destroyOnHide": "<?",
      "disabled": "<?ngDisabled",
      "collapsed": "<?",
      "show": "&?",
      "shown": "&?",
      "hide": "&?",
      "hidden": "&?"
    }
  }
};
NgbAccordionItem.ɵfac.ɵtype = NgbAccordionItem;
NgbAccordionItem.prototype.$postLink = function() {
  this.ngAfterContentInit();
};
function ɵelementInstance($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionCollapse = class {
  // `forwardRef` en el primer parámetro: import circular con
  // `ngb-accordion-item.directive.ts` (mismo motivo que su `@ContentChild`).
  constructor(item, ngbCollapse) {
    this._role = "region";
    this._hostClass = true;
    this.item = item;
    this.ngbCollapse = ngbCollapse;
  }
  get _id() {
    return this.item.collapseId;
  }
  get _ariaLabelledby() {
    return this.item.toggleId;
  }
};
NgbAccordionCollapse.ɵfac = [
  "$element",
  "$scope",
  function NgbAccordionCollapse_Factory($element, $scope) {
    var instance = new (this && this.ɵT || NgbAccordionCollapse)(ɵelementInstance2($element, [
      "ngbAccordionItem"
    ], {}, false), ɵelementInstance2($element, [
      "ngbCollapse"
    ], {}, false));
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion-collapse") : $element.removeClass("accordion-collapse");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaLabelledby;
    }, function(v) {
      v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v ? $element.addClass("accordion-collapse") : $element.removeClass("accordion-collapse");
      })(instance._hostClass);
      (function(v) {
        $element.prop("id", v);
      })(instance._id);
      (function(v) {
        v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
      })(instance._ariaLabelledby);
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
NgbAccordionCollapse.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordionCollapse",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  exportAs: [
    "ngbAccordionCollapse"
  ],
  hostDirectives: [
    {
      get directive() {
        return NgbCollapse;
      }
    }
  ],
  definition: {}
};
NgbAccordionCollapse.ɵfac.ɵtype = NgbAccordionCollapse;
function ɵelementInstance2($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionBody = class {
  ngAfterContentChecked() {
    if (this._bodyTpl) {
      if (this._item._shouldBeInDOM) {
        this._createViewIfNotExists();
      } else {
        this._destroyViewIfExists();
      }
    }
  }
  ngOnDestroy() {
    this._destroyViewIfExists();
  }
  _destroyViewIfExists() {
    this._viewRef?.destroy();
    this._viewRef = null;
  }
  _createViewIfNotExists() {
    if (!this._viewRef) {
      this._viewRef = this._vcr.createEmbeddedView(this._bodyTpl);
      this._viewRef.detectChanges();
      for (const node of this._viewRef.rootNodes) {
        this._element.appendChild(node);
      }
    }
  }
  constructor() {
    this._vcr = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAccordionBody"] ? globalThis.ɵngjsInjected["NgbAccordionBody"][0] : inject(ViewContainerRef);
    this._element = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAccordionBody"] ? globalThis.ɵngjsInjected["NgbAccordionBody"][1] : inject(ElementRef)).nativeElement;
    this._item = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbAccordionBody"] ? globalThis.ɵngjsInjected["NgbAccordionBody"][2] : inject(NgbAccordionItem);
    this._viewRef = null;
    this._hostClass = true;
  }
};
NgbAccordionBody.ɵfac = [
  "ViewContainerRef_2579ba28",
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbAccordionBody_Factory(i0, i1, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbAccordionBody": [
        i0,
        i1,
        ɵelementInstance3($element, [
          "ngbAccordionItem"
        ], {}, false)
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbAccordionBody)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion-body") : $element.removeClass("accordion-body");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("accordion-body") : $element.removeClass("accordion-body");
      })(instance._hostClass);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbAccordionBody.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordionBody",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  queries: [
    {
      propertyName: "_bodyTpl",
      first: true,
      descendants: true,
      static: true,
      get predicate() {
        return TemplateRef;
      }
    }
  ],
  definition: {}
};
NgbAccordionBody.ɵfac.ɵtype = NgbAccordionBody;
NgbAccordionBody.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbAccordionBody.prototype.$postLink = function() {
  this.ɵngjsViewInitialized = true;
};
NgbAccordionBody.prototype.$doCheck = function() {
  if (this.ɵngjsViewInitialized) {
    this.ngAfterContentChecked();
  }
};
function ɵelementInstance3($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionToggle = class {
  constructor(item, accordion) {
    this.item = item;
    this.accordion = accordion;
  }
  get _id() {
    return this.item.toggleId;
  }
  get _collapsed() {
    return this.item.collapsed;
  }
  get _ariaControls() {
    return this.item.collapseId;
  }
  get _ariaExpanded() {
    return `${!this.item.collapsed}`;
  }
  _onClick() {
    if (!this.item.disabled) {
      this.accordion.toggle(this.item.id);
    }
  }
};
NgbAccordionToggle.ɵfac = [
  "$element",
  "$scope",
  function NgbAccordionToggle_Factory($element, $scope) {
    var instance = new (this && this.ɵT || NgbAccordionToggle)(ɵelementInstance4($element, [
      "ngbAccordionItem"
    ], {}, false), ɵelementInstance4($element, [
      "ngbAccordion"
    ], {}, false));
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._collapsed;
    }, function(v) {
      v ? $element.addClass("collapsed") : $element.removeClass("collapsed");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._ariaControls;
    }, function(v) {
      v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaExpanded;
    }, function(v) {
      v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("id", v);
      })(instance._id);
      (function(v) {
        v ? $element.addClass("collapsed") : $element.removeClass("collapsed");
      })(instance._collapsed);
      (function(v) {
        v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
      })(instance._ariaControls);
      (function(v) {
        v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
      })(instance._ariaExpanded);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onClick();
      } else {
        $scope.$apply(function() {
          instance._onClick();
        });
      }
    };
    $element.on("click", ɵhandler0);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      $element.off("click", ɵhandler0);
    });
    return instance;
  }
];
NgbAccordionToggle.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordionToggle",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbAccordionToggle.ɵfac.ɵtype = NgbAccordionToggle;
function ɵelementInstance4($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionButton = class {
  constructor(item) {
    this._hostClass = true;
    this._type = "button";
    this.item = item;
  }
  get _disabled() {
    return this.item.disabled;
  }
};
NgbAccordionButton.ɵfac = [
  "$element",
  "$scope",
  function NgbAccordionButton_Factory($element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if (!(this && this.ɵT) && [
      "button"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbAccordionButton: este selector requiere <button>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var instance = new (this && this.ɵT || NgbAccordionButton)(ɵelementInstance5($element, [
      "ngbAccordionItem"
    ], {}, false));
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._disabled;
    }, function(v) {
      $element.prop("disabled", v);
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion-button") : $element.removeClass("accordion-button");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._type;
    }, function(v) {
      v == null ? $element.removeAttr("type") : $element.attr("type", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("disabled", v);
      })(instance._disabled);
      (function(v) {
        v ? $element.addClass("accordion-button") : $element.removeClass("accordion-button");
      })(instance._hostClass);
      (function(v) {
        v == null ? $element.removeAttr("type") : $element.attr("type", String(v));
      })(instance._type);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
    });
    return instance;
  }
];
NgbAccordionButton.ɵdir = {
  selectors: [
    [
      "button",
      "ngbAccordionButton",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  hostDirectives: [
    {
      get directive() {
        return NgbAccordionToggle;
      }
    }
  ],
  definition: {}
};
NgbAccordionButton.ɵfac.ɵtype = NgbAccordionButton;
function ɵelementInstance5($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionHeader = class {
  constructor(item) {
    this._role = "heading";
    this._hostClass = true;
    this.item = item;
  }
  get _collapsed() {
    return this.item.collapsed;
  }
};
NgbAccordionHeader.ɵfac = [
  "$element",
  "$scope",
  function NgbAccordionHeader_Factory($element, $scope) {
    var instance = new (this && this.ɵT || NgbAccordionHeader)(ɵelementInstance6($element, [
      "ngbAccordionItem"
    ], {}, false));
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v) {
      v ? $element.addClass("accordion-header") : $element.removeClass("accordion-header");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._collapsed;
    }, function(v) {
      v ? $element.addClass("collapsed") : $element.removeClass("collapsed");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v ? $element.addClass("accordion-header") : $element.removeClass("accordion-header");
      })(instance._hostClass);
      (function(v) {
        v ? $element.addClass("collapsed") : $element.removeClass("collapsed");
      })(instance._collapsed);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
    });
    return instance;
  }
];
NgbAccordionHeader.ɵdir = {
  selectors: [
    [
      "",
      "ngbAccordionHeader",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbAccordionHeader.ɵfac.ɵtype = NgbAccordionHeader;
function ɵelementInstance6($element, names, flags, isComponent) {
  var read = function(el2) {
    for (var i = 0; i < names.length; i++) {
      var found2 = el2.data("$" + names[i] + "Controller");
      if (found2) return typeof found2["ɵngjsBuild"] === "function" ? found2["ɵngjsBuild"]() : found2;
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
var NgbAccordionModule = class {
};
NgbAccordionModule.ɵfac = [
  function NgbAccordionModule_Factory() {
    return new (this && this.ɵT || NgbAccordionModule)();
  }
];
NgbAccordionModule.ɵmod = {
  id: "NgbAccordionModule_052ffd9c",
  controllerAs: "$"
};
import_angular.default.module("NgbAccordionModule_052ffd9c", [
  NgbCollapseModule.ɵmod.id,
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
]).directive("ngbAccordionButton", function() {
  return {
    controller: NgbAccordionButton.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbAccordionButton"
  };
}).directive("ngbAccordion", function() {
  return {
    controller: NgbAccordionDirective.ɵfac,
    restrict: "A",
    bindToController: {
      "animation": "<?",
      "closeOthers": "<?",
      "destroyOnHide": "<?",
      "show": "&?",
      "shown": "&?",
      "hide": "&?",
      "hidden": "&?"
    },
    controllerAs: "ngbAccordion"
  };
}).directive("ngbAccordion", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "show",
          "shown",
          "hide",
          "hidden"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbAccordionItem", function() {
  return {
    controller: NgbAccordionItem.ɵfac,
    restrict: "A",
    bindToController: {
      "id": "<?ngbAccordionItem",
      "destroyOnHide": "<?",
      "disabled": "<?ngDisabled",
      "collapsed": "<?",
      "show": "&?",
      "shown": "&?",
      "hide": "&?",
      "hidden": "&?"
    },
    controllerAs: "ngbAccordionItem"
  };
}).directive("ngbAccordionItem", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "show",
          "shown",
          "hide",
          "hidden"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbAccordionHeader", function() {
  return {
    controller: NgbAccordionHeader.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbAccordionHeader"
  };
}).directive("ngbAccordionToggle", function() {
  return {
    controller: NgbAccordionToggle.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbAccordionToggle"
  };
}).directive("ngbAccordionBody", function() {
  return {
    controller: NgbAccordionBody.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbAccordionBody"
  };
}).directive("ngbAccordionCollapse", function() {
  return {
    controller: NgbAccordionCollapse.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbAccordionCollapse"
  };
}).factory("NgbAccordionModule_538e3dac", NgbAccordionModule.ɵfac).run([
  "NgbAccordionModule_538e3dac",
  function() {
  }
]);

// src/app/features/accordion/components/accordion-content/accordion-content.component.ts
var AccordionContentComponent = class {
  constructor() {
    this.draft = "This value remains after collapsing the panel.";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-8dd42237],.card[_content-8dd42237],.dropdown-menu[_content-8dd42237],.list-group-item[_content-8dd42237],.form-control[_content-8dd42237],.form-select[_content-8dd42237]{border-color:var(--bs-border-color)}.alert-light[_content-8dd42237]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-8dd42237],.list-group[_content-8dd42237],.dropdown-menu[_content-8dd42237]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-8dd42237],.btn-outline-secondary[_content-8dd42237]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-8dd42237],.form-select[_content-8dd42237]{background-color:var(--bs-body-bg)}code[_content-8dd42237]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AccordionContentComponent.ɵfac = [
  "$element",
  "$scope",
  function AccordionContentComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AccordionContentComponent)();
    return instance;
  }
];
AccordionContentComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-content"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/accordion-content.component-da6b2323.html",
    "controllerAs": "example"
  }
};
AccordionContentComponent.ɵfac.ɵcomponent = true;
AccordionContentComponent.ɵfac.ɵtype = AccordionContentComponent;

// src/app/features/accordion/components/accordion-custom-header/accordion-custom-header.component.ts
var AccordionCustomHeaderComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-a679697a],.card[_content-a679697a],.dropdown-menu[_content-a679697a],.list-group-item[_content-a679697a],.form-control[_content-a679697a],.form-select[_content-a679697a]{border-color:var(--bs-border-color)}.alert-light[_content-a679697a]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-a679697a],.list-group[_content-a679697a],.dropdown-menu[_content-a679697a]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-a679697a],.btn-outline-secondary[_content-a679697a]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-a679697a],.form-select[_content-a679697a]{background-color:var(--bs-body-bg)}code[_content-a679697a]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AccordionCustomHeaderComponent.ɵfac = [
  "$element",
  "$scope",
  function AccordionCustomHeaderComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AccordionCustomHeaderComponent)();
    return instance;
  }
];
AccordionCustomHeaderComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-custom-header"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/accordion-custom-header.component-81dd1e7a.html",
    "controllerAs": "example"
  }
};
AccordionCustomHeaderComponent.ɵfac.ɵcomponent = true;
AccordionCustomHeaderComponent.ɵfac.ɵtype = AccordionCustomHeaderComponent;

// src/app/features/accordion/components/accordion-global/accordion-global.component.ts
var AccordionGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      animation: config.animation,
      closeOthers: config.closeOthers,
      destroyOnHide: config.destroyOnHide
    };
    config.animation = false;
    config.closeOthers = true;
    config.destroyOnHide = false;
  }
  ngOnDestroy() {
    this.config.animation = this.initialConfig.animation;
    this.config.closeOthers = this.initialConfig.closeOthers;
    this.config.destroyOnHide = this.initialConfig.destroyOnHide;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-12b1e3d5],.card[_content-12b1e3d5],.dropdown-menu[_content-12b1e3d5],.list-group-item[_content-12b1e3d5],.form-control[_content-12b1e3d5],.form-select[_content-12b1e3d5]{border-color:var(--bs-border-color)}.alert-light[_content-12b1e3d5]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-12b1e3d5],.list-group[_content-12b1e3d5],.dropdown-menu[_content-12b1e3d5]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-12b1e3d5],.btn-outline-secondary[_content-12b1e3d5]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-12b1e3d5],.form-select[_content-12b1e3d5]{background-color:var(--bs-body-bg)}code[_content-12b1e3d5]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AccordionGlobalComponent.ɵfac = [
  "NgbAccordionConfig_a94c9de4",
  "$element",
  "$scope",
  function AccordionGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AccordionGlobalComponent)(a0);
    return instance;
  }
];
AccordionGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/accordion-global.component-c9bfa59f.html",
    "controllerAs": "example"
  }
};
AccordionGlobalComponent.ɵfac.ɵcomponent = true;
AccordionGlobalComponent.ɵfac.ɵtype = AccordionGlobalComponent;
AccordionGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/accordion/components/accordion-simple/accordion-simple.component.ts
var AccordionSimpleComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-5f4ffab5],.card[_content-5f4ffab5],.dropdown-menu[_content-5f4ffab5],.list-group-item[_content-5f4ffab5],.form-control[_content-5f4ffab5],.form-select[_content-5f4ffab5]{border-color:var(--bs-border-color)}.alert-light[_content-5f4ffab5]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-5f4ffab5],.list-group[_content-5f4ffab5],.dropdown-menu[_content-5f4ffab5]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-5f4ffab5],.btn-outline-secondary[_content-5f4ffab5]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-5f4ffab5],.form-select[_content-5f4ffab5]{background-color:var(--bs-body-bg)}code[_content-5f4ffab5]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AccordionSimpleComponent.ɵfac = [
  "$element",
  "$scope",
  function AccordionSimpleComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AccordionSimpleComponent)();
    return instance;
  }
];
AccordionSimpleComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-simple"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/accordion-simple.component-aa3ab5e0.html",
    "controllerAs": "example"
  }
};
AccordionSimpleComponent.ɵfac.ɵcomponent = true;
AccordionSimpleComponent.ɵfac.ɵtype = AccordionSimpleComponent;

// src/app/features/accordion/components/accordion-toggle-panels/accordion-toggle-panels.component.ts
var AccordionTogglePanelsComponent = class {
  expandAll() {
    this.accordion.expandAll();
  }
  collapseAll() {
    this.accordion.collapseAll();
  }
  toggle(itemId) {
    this.accordion.toggle(itemId);
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-99a0cd36],.card[_content-99a0cd36],.dropdown-menu[_content-99a0cd36],.list-group-item[_content-99a0cd36],.form-control[_content-99a0cd36],.form-select[_content-99a0cd36]{border-color:var(--bs-border-color)}.alert-light[_content-99a0cd36]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-99a0cd36],.list-group[_content-99a0cd36],.dropdown-menu[_content-99a0cd36]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-99a0cd36],.btn-outline-secondary[_content-99a0cd36]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-99a0cd36],.form-select[_content-99a0cd36]{background-color:var(--bs-body-bg)}code[_content-99a0cd36]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
AccordionTogglePanelsComponent.ɵfac = [
  "$element",
  "$scope",
  function AccordionTogglePanelsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || AccordionTogglePanelsComponent)();
    return instance;
  }
];
AccordionTogglePanelsComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-toggle-panels"
    ]
  ],
  inputs: {},
  outputs: {},
  viewQueries: [
    {
      propertyName: "accordion",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "accordion"
      ]
    }
  ],
  definition: {
    "templateUrl": "templates/accordion-toggle-panels.component-92550b6f.html",
    "controllerAs": "example"
  }
};
AccordionTogglePanelsComponent.ɵfac.ɵcomponent = true;
AccordionTogglePanelsComponent.ɵfac.ɵtype = AccordionTogglePanelsComponent;

// src/app/features/accordion/components/one-panel-accordion/one-panel-accordion.component.ts
var OnePanelAccordionComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-2796ca82],.card[_content-2796ca82],.dropdown-menu[_content-2796ca82],.list-group-item[_content-2796ca82],.form-control[_content-2796ca82],.form-select[_content-2796ca82]{border-color:var(--bs-border-color)}.alert-light[_content-2796ca82]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-2796ca82],.list-group[_content-2796ca82],.dropdown-menu[_content-2796ca82]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-2796ca82],.btn-outline-secondary[_content-2796ca82]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-2796ca82],.form-select[_content-2796ca82]{background-color:var(--bs-body-bg)}code[_content-2796ca82]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
OnePanelAccordionComponent.ɵfac = [
  "$element",
  "$scope",
  function OnePanelAccordionComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || OnePanelAccordionComponent)();
    return instance;
  }
];
OnePanelAccordionComponent.ɵcmp = {
  selectors: [
    [
      "docs-one-panel-accordion"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/one-panel-accordion.component-c94afbf8.html",
    "controllerAs": "example"
  }
};
OnePanelAccordionComponent.ɵfac.ɵcomponent = true;
OnePanelAccordionComponent.ɵfac.ɵtype = OnePanelAccordionComponent;

// src/app/features/accordion/accordion.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Accordion",
      tabs: [
        {
          name: "Examples",
          to: "/components/accordion/examples"
        },
        {
          name: "Api",
          to: "/components/accordion/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/accordion/",
        ngBootstrap: "components/accordion/overview"
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
              id: "accordion-simple",
              name: "Basic accordion"
            },
            {
              id: "one-panel-accordion",
              name: "One panel at a time"
            },
            {
              id: "accordion-toggle-panels",
              name: "Programmatic controls"
            },
            {
              id: "accordion-custom-header",
              name: "Custom headers"
            },
            {
              id: "accordion-content",
              name: "Preserve content"
            },
            {
              id: "accordion-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./accordion-examples-page.component-3NISSFMY.js").then((m) => m.AccordionExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-accordion",
              name: "NgbAccordion"
            },
            {
              id: "ngb-accordion-item",
              name: "NgbAccordionItem"
            },
            {
              id: "ngb-accordion-header",
              name: "NgbAccordionHeader"
            },
            {
              id: "ngb-accordion-button",
              name: "NgbAccordionButton"
            },
            {
              id: "ngb-accordion-toggle",
              name: "NgbAccordionToggle"
            },
            {
              id: "ngb-accordion-body",
              name: "NgbAccordionBody"
            },
            {
              id: "ngb-accordion-config",
              name: "NgbAccordionConfig"
            }
          ]
        },
        loadComponent: () => import("./accordion-api-page.component-7D64QSDG.js").then((m) => m.AccordionApiPageComponent)
      }
    ]
  }
];

// src/app/features/accordion/accordion.module.ts
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
var AccordionModule = class {
};
AccordionModule.ɵfac = [
  function AccordionModule_Factory() {
    return new (this && this.ɵT || AccordionModule)();
  }
];
var ɵAccordionModule_import0 = RouterModule.forChild(routes);
AccordionModule.ɵmod = {
  id: "AccordionModule_760785fd"
};
ɵimportProviders(import_angular2.default.module("AccordionModule_760785fd", [
  typeof NgbAccordionModule === "string" ? NgbAccordionModule : NgbAccordionModule.ɵmod ? NgbAccordionModule.ɵmod.id : NgbAccordionModule.name,
  typeof NgbTooltipModule === "string" ? NgbTooltipModule : NgbTooltipModule.ɵmod ? NgbTooltipModule.ɵmod.id : NgbTooltipModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵAccordionModule_import0)
]), [
  ɵAccordionModule_import0
]).component("docsAccordionContent", {
  controller: AccordionContentComponent.ɵfac,
  templateUrl: "templates/accordion-content.component-da6b2323.html",
  controllerAs: "example"
}).component("docsAccordionCustomHeader", {
  controller: AccordionCustomHeaderComponent.ɵfac,
  templateUrl: "templates/accordion-custom-header.component-81dd1e7a.html",
  controllerAs: "example"
}).component("docsAccordionGlobal", {
  controller: AccordionGlobalComponent.ɵfac,
  templateUrl: "templates/accordion-global.component-c9bfa59f.html",
  controllerAs: "example"
}).component("docsAccordionSimple", {
  controller: AccordionSimpleComponent.ɵfac,
  templateUrl: "templates/accordion-simple.component-aa3ab5e0.html",
  controllerAs: "example"
}).component("docsAccordionTogglePanels", {
  controller: AccordionTogglePanelsComponent.ɵfac,
  templateUrl: "templates/accordion-toggle-panels.component-92550b6f.html",
  controllerAs: "example"
}).component("docsOnePanelAccordion", {
  controller: OnePanelAccordionComponent.ɵfac,
  templateUrl: "templates/one-panel-accordion.component-c94afbf8.html",
  controllerAs: "example"
}).factory("AccordionModule_747a7c4a", AccordionModule.ɵfac).run([
  "AccordionModule_747a7c4a",
  function() {
  }
]);
export {
  AccordionModule
};
