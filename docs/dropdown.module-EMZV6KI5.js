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
  ChangeDetectorRef,
  FOCUSABLE_ELEMENTS_SELECTOR,
  Key,
  NgZone,
  SOURCE,
  Subject,
  addPopperOffset,
  fromEvent,
  getActiveElement,
  inject,
  ngbAutoClose,
  ngbPositioning,
  take
} from "./chunk-U6UIHJCB.js";
import {
  DOCUMENT,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/features/dropdown/dropdown.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-M3W35AOF.js
var import_angular = __toESM(require_angular(), 1);
var NgbDropdownConfig = class {
  constructor() {
    this.autoClose = true;
    this.placement = [
      "bottom-start",
      "bottom-end",
      "top-start",
      "top-end"
    ];
    this.popperOptions = (options) => options;
    this.container = null;
  }
};
NgbDropdownConfig.ɵfac = [
  function NgbDropdownConfig_Factory() {
    return new (this && this.ɵT || NgbDropdownConfig)();
  }
];
NgbDropdownConfig.ɵprov = {
  token: "NgbDropdownConfig_03322593",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbDropdownConfig_03322593",
  NgbDropdownConfig.ɵfac
]);
var NgbDropdownItem = class {
  set disabled(value) {
    this._disabled = value === "" || value === true;
  }
  get disabled() {
    return this._disabled;
  }
  get _disabledClass() {
    return this.disabled;
  }
  get _tabIndex() {
    return this.disabled ? -1 : this.tabindex;
  }
  /** Solo para `<button ngbDropdownItem>` — el resto de los tags no llevan `disabled` nativo. */
  get _nativeDisabled() {
    return this.nativeElement.tagName === "BUTTON" ? this.disabled : void 0;
  }
  constructor() {
    this._disabled = false;
    this.tabindex = 0;
    this.nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownItem"] ? globalThis.ɵngjsInjected["NgbDropdownItem"][0] : inject(ElementRef)).nativeElement;
    this._dropdownItemClass = true;
  }
};
NgbDropdownItem.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbDropdownItem_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdownItem": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdownItem)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._dropdownItemClass;
    }, function(v) {
      v ? $element.addClass("dropdown-item") : $element.removeClass("dropdown-item");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._disabledClass;
    }, function(v) {
      v ? $element.addClass("disabled") : $element.removeClass("disabled");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._tabIndex;
    }, function(v) {
      $element.prop("tabIndex", v);
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._nativeDisabled;
    }, function(v) {
      $element.prop("disabled", v);
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("dropdown-item") : $element.removeClass("dropdown-item");
      })(instance._dropdownItemClass);
      (function(v) {
        v ? $element.addClass("disabled") : $element.removeClass("disabled");
      })(instance._disabledClass);
      (function(v) {
        $element.prop("tabIndex", v);
      })(instance._tabIndex);
      (function(v) {
        $element.prop("disabled", v);
      })(instance._nativeDisabled);
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
NgbDropdownItem.ɵdir = {
  selectors: [
    [
      "",
      "ngbDropdownItem",
      ""
    ]
  ],
  inputs: {
    "tabindex": "tabindex",
    "disabled": "disabled"
  },
  outputs: {},
  definition: {
    "bindings": {
      "tabindex": "<?",
      "disabled": "<?ngDisabled"
    }
  }
};
NgbDropdownItem.ɵfac.ɵtype = NgbDropdownItem;
var NgbDropdownMenu = class {
  get _show() {
    return this.dropdown.isOpen();
  }
  _onKeyDown(event) {
    this.dropdown.onKeyDown(event);
  }
  constructor() {
    this.dropdown = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownMenu"] ? globalThis.ɵngjsInjected["NgbDropdownMenu"][0] : inject(NgbDropdown);
    this.nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownMenu"] ? globalThis.ɵngjsInjected["NgbDropdownMenu"][1] : inject(ElementRef)).nativeElement;
    this._dropdownMenuClass = true;
  }
};
NgbDropdownMenu.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbDropdownMenu_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdownMenu": [
        ɵelementInstance($element, [
          "ngbDropdown"
        ], {}, false),
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdownMenu)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._dropdownMenuClass;
    }, function(v) {
      v ? $element.addClass("dropdown-menu") : $element.removeClass("dropdown-menu");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._show;
    }, function(v) {
      v ? $element.addClass("show") : $element.removeClass("show");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("dropdown-menu") : $element.removeClass("dropdown-menu");
      })(instance._dropdownMenuClass);
      (function(v) {
        v ? $element.addClass("show") : $element.removeClass("show");
      })(instance._show);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowup" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler0);
    var ɵhandler1 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowdown" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler1);
    var ɵhandler2 = function(event) {
      if (!(String(event.key).toLowerCase() === "home" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler2);
    var ɵhandler3 = function(event) {
      if (!(String(event.key).toLowerCase() === "end" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler3);
    var ɵhandler4 = function(event) {
      if (!(String(event.key).toLowerCase() === "enter" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler4);
    var ɵhandler5 = function(event) {
      if (!(String(event.key).toLowerCase() === " " && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler5);
    var ɵhandler6 = function(event) {
      if (!(String(event.key).toLowerCase() === "tab" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler6);
    var ɵhandler7 = function(event) {
      if (!(String(event.key).toLowerCase() === "tab" && !event.altKey && !event.ctrlKey && !event.metaKey && event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler7);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      $element.off("keydown", ɵhandler0);
      $element.off("keydown", ɵhandler1);
      $element.off("keydown", ɵhandler2);
      $element.off("keydown", ɵhandler3);
      $element.off("keydown", ɵhandler4);
      $element.off("keydown", ɵhandler5);
      $element.off("keydown", ɵhandler6);
      $element.off("keydown", ɵhandler7);
    });
    return instance;
  }
];
NgbDropdownMenu.ɵdir = {
  selectors: [
    [
      "",
      "ngbDropdownMenu",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  queries: [
    {
      propertyName: "menuItems",
      first: false,
      descendants: false,
      static: false,
      get predicate() {
        return NgbDropdownItem;
      }
    }
  ],
  definition: {}
};
NgbDropdownMenu.ɵfac.ɵtype = NgbDropdownMenu;
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
var NgbDropdown = class {
  get _show() {
    return this.isOpen();
  }
  ngOnInit() {
    if (!this.display) {
      this.display = this._nativeElement.closest(".navbar") ? "static" : "dynamic";
    }
  }
  ngAfterContentInit() {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this._applyPlacementClasses();
      if (this._open) {
        this._setCloseHandlers();
      }
    });
  }
  ngOnChanges(changes) {
    if (changes.container && this._open) {
      this._applyContainer(this.container);
    }
    if (changes.placement && !changes.placement.firstChange) {
      this._positioning.setOptions({
        hostElement: this._anchor.nativeElement,
        targetElement: this._bodyContainer || this._menu.nativeElement,
        placement: this.placement,
        appendToBody: this.container === "body"
      });
      this._applyPlacementClasses();
    }
    if (changes.dropdownClass) {
      const { currentValue, previousValue } = changes.dropdownClass;
      this._applyCustomDropdownClass(currentValue, previousValue);
    }
    if (changes.autoClose && this._open) {
      this.autoClose = changes.autoClose.currentValue;
      this._setCloseHandlers();
    }
  }
  /** Indica si el menú está abierto. */
  isOpen() {
    return this._open;
  }
  /** Abre el menú del dropdown. */
  open() {
    if (!this._open) {
      this._open = true;
      this._applyContainer(this.container);
      this.openChange.emit(true);
      this._setCloseHandlers();
      if (this._anchor) {
        this._anchor.nativeElement.focus();
        if (this.display === "dynamic") {
          this._ngZone.runOutsideAngular(() => {
            this._positioning.createPopper({
              hostElement: this._anchor.nativeElement,
              targetElement: this._bodyContainer || this._menu.nativeElement,
              placement: this.placement,
              updatePopperOptions: (options) => this.popperOptions(addPopperOffset([
                0,
                2
              ])(options))
            });
            this._applyPlacementClasses();
            this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positionMenu());
          });
        }
      }
    }
  }
  _setCloseHandlers() {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(this._ngZone, this._document, this.autoClose, (source) => {
      this.close();
      if (source === SOURCE.ESCAPE) {
        this._anchor?.nativeElement.focus();
      }
    }, this._destroyCloseHandlers$, this._menu ? [
      this._menu.nativeElement
    ] : [], this._anchor ? [
      this._anchor.nativeElement
    ] : [], ".dropdown-item,.dropdown-divider");
  }
  /** Cierra el menú del dropdown. */
  close() {
    if (this._open) {
      this._open = false;
      this._resetContainer();
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._zoneSubscription = void 0;
      this._destroyCloseHandlers$.next();
      this.openChange.emit(false);
      this._changeDetector.markForCheck();
    }
  }
  /** Alterna el menú del dropdown. */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  ngOnDestroy() {
    this.close();
  }
  onKeyDown(event) {
    const key = event.which;
    const itemElements = this._getMenuElements();
    let position = -1;
    let itemElement = null;
    const isEventFromToggle = this._isEventFromToggle(event);
    if (!isEventFromToggle && itemElements.length) {
      itemElements.forEach((item, index) => {
        if (item.contains(event.target)) {
          itemElement = item;
        }
        if (item === getActiveElement(this._document)) {
          position = index;
        }
      });
    }
    if (key === Key.Space || key === Key.Enter) {
      if (itemElement && (this.autoClose === true || this.autoClose === "inside")) {
        fromEvent(itemElement, "click").pipe(take(1)).subscribe(() => this.close());
      }
      return;
    }
    if (key === Key.Tab) {
      if (event.target && this.isOpen() && this.autoClose) {
        if (this._anchor.nativeElement === event.target) {
          if (this.container === "body" && !event.shiftKey) {
            this._menu.nativeElement.setAttribute("tabindex", "0");
            this._menu.nativeElement.focus();
            this._menu.nativeElement.removeAttribute("tabindex");
          } else if (event.shiftKey) {
            this.close();
          }
          return;
        }
        if (this.container === "body") {
          const focusableElements = this._menu.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
          if (event.shiftKey && event.target === focusableElements[0]) {
            this._anchor.nativeElement.focus();
            event.preventDefault();
          } else if (!event.shiftKey && event.target === focusableElements[focusableElements.length - 1]) {
            this._anchor.nativeElement.focus();
            this.close();
          }
        } else {
          fromEvent(event.target, "focusout").pipe(take(1)).subscribe(({ relatedTarget }) => {
            if (!this._nativeElement.contains(relatedTarget)) {
              this.close();
            }
          });
        }
      }
      return;
    }
    if (isEventFromToggle || itemElement) {
      this.open();
      if (itemElements.length) {
        switch (key) {
          case Key.ArrowDown:
            position = Math.min(position + 1, itemElements.length - 1);
            break;
          case Key.ArrowUp:
            if (this._isDropup() && position === -1) {
              position = itemElements.length - 1;
              break;
            }
            position = Math.max(position - 1, 0);
            break;
          case Key.Home:
            position = 0;
            break;
          case Key.End:
            position = itemElements.length - 1;
            break;
        }
        itemElements[position].focus();
      }
      event.preventDefault();
    }
  }
  _isDropup() {
    return this._nativeElement.classList.contains("dropup");
  }
  _isEventFromToggle(event) {
    return this._anchor ? this._anchor.nativeElement.contains(event.target) : false;
  }
  _getMenuElements() {
    return this._menu ? this._menu.menuItems.filter((item) => !item.disabled).map(({ nativeElement }) => nativeElement) : [];
  }
  _positionMenu() {
    const menu = this._menu;
    if (this.isOpen() && menu) {
      if (this.display === "dynamic") {
        this._positioning.update();
        this._applyPlacementClasses();
      } else {
        this._applyPlacementClasses(this._getFirstPlacement(this.placement));
      }
    }
  }
  _getFirstPlacement(placement) {
    return Array.isArray(placement) ? placement[0] : placement.split(" ")[0];
  }
  _resetContainer() {
    if (this._menu) {
      this._nativeElement.appendChild(this._menu.nativeElement);
    }
    if (this._bodyContainer) {
      this._document.body.removeChild(this._bodyContainer);
      this._bodyContainer = null;
    }
  }
  _applyContainer(container = null) {
    this._resetContainer();
    if (container === "body") {
      const dropdownMenuElement = this._menu.nativeElement;
      const bodyContainer = this._bodyContainer = this._bodyContainer || this._document.createElement("div");
      bodyContainer.style.position = "absolute";
      dropdownMenuElement.style.position = "static";
      bodyContainer.style.zIndex = "1055";
      bodyContainer.appendChild(dropdownMenuElement);
      this._document.body.appendChild(bodyContainer);
    }
    this._applyCustomDropdownClass(this.dropdownClass);
  }
  _applyCustomDropdownClass(newClass, oldClass) {
    const targetElement = this.container === "body" ? this._bodyContainer : this._nativeElement;
    if (targetElement) {
      if (oldClass) {
        targetElement.classList.remove(oldClass);
      }
      if (newClass) {
        targetElement.classList.add(newClass);
      }
    }
  }
  _applyPlacementClasses(placement) {
    if (this._menu) {
      if (!placement) {
        placement = this._getFirstPlacement(this.placement);
      }
      this._nativeElement.classList.remove("dropup", "dropdown");
      if (this.display === "static") {
        this._menu.nativeElement.setAttribute("data-bs-popper", "static");
      } else {
        this._menu.nativeElement.removeAttribute("data-bs-popper");
      }
      const dropdownClass = placement.search("^top") !== -1 ? "dropup" : "dropdown";
      this._nativeElement.classList.add(dropdownClass);
      if (this._bodyContainer) {
        this._bodyContainer.classList.remove("dropup", "dropdown");
        this._bodyContainer.classList.add(dropdownClass);
      }
    }
  }
  constructor() {
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdown"] ? globalThis.ɵngjsInjected["NgbDropdown"][0] : inject(ChangeDetectorRef);
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdown"] ? globalThis.ɵngjsInjected["NgbDropdown"][1] : inject(NgbDropdownConfig);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdown"] ? globalThis.ɵngjsInjected["NgbDropdown"][2] : inject(DOCUMENT);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdown"] ? globalThis.ɵngjsInjected["NgbDropdown"][3] : inject(NgZone);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdown"] ? globalThis.ɵngjsInjected["NgbDropdown"][4] : inject(ElementRef)).nativeElement;
    this._destroyCloseHandlers$ = new Subject();
    this._bodyContainer = null;
    this._positioning = ngbPositioning();
    this.autoClose = this._config.autoClose;
    this._open = false;
    this.placement = this._config.placement;
    this.popperOptions = this._config.popperOptions;
    this.container = this._config.container;
    this.openChange = new EventEmitter();
  }
};
NgbDropdown.ɵfac = [
  "ChangeDetectorRef_e2bfcbab",
  "NgbDropdownConfig_03322593",
  "DOCUMENT_a3a362b8",
  "NgZone_31031859",
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbDropdown_Factory(i0, i1, i2, i3, i4, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdown": [
        i0,
        i1,
        i2,
        i3,
        i4
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdown)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._show;
    }, function(v) {
      v ? $element.addClass("show") : $element.removeClass("show");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("show") : $element.removeClass("show");
      })(instance._show);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbDropdown.ɵdir = {
  selectors: [
    [
      "",
      "ngbDropdown",
      ""
    ]
  ],
  inputs: {
    "autoClose": "autoClose",
    "dropdownClass": "dropdownClass",
    "open": "_open",
    "placement": "placement",
    "popperOptions": "popperOptions",
    "container": "container",
    "display": "display"
  },
  outputs: {
    "openChange": "openChange"
  },
  exportAs: [
    "ngbDropdown"
  ],
  queries: [
    {
      propertyName: "_menu",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbDropdownMenu;
      }
    },
    {
      propertyName: "_anchor",
      first: true,
      descendants: true,
      static: false,
      get predicate() {
        return NgbDropdownAnchor;
      }
    }
  ],
  definition: {
    "bindings": {
      "autoClose": "<?",
      "dropdownClass": "<?",
      "_open": "<?ngOpen",
      "placement": "<?",
      "popperOptions": "<?",
      "container": "@?",
      "display": "@?",
      "openChange": "&?"
    }
  }
};
NgbDropdown.ɵfac.ɵtype = NgbDropdown;
NgbDropdown.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbDropdown.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbDropdown.prototype.$onChanges = function(changesObj) {
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
    var c = changesObj["dropdownClass"];
    if (!c) return;
    changes["dropdownClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["_open"];
    if (!c) return;
    changes["_open"] = {
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
    var c = changesObj["display"];
    if (!c) return;
    changes["display"] = {
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
NgbDropdown.prototype.$postLink = function() {
  this.ngAfterContentInit();
};
var NgbDropdownAnchor = class {
  get _show() {
    return this.dropdown.isOpen();
  }
  get _ariaExpanded() {
    return `${this.dropdown.isOpen()}`;
  }
  constructor() {
    this.dropdown = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownAnchor"] ? globalThis.ɵngjsInjected["NgbDropdownAnchor"][0] : inject(NgbDropdown);
    this.nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownAnchor"] ? globalThis.ɵngjsInjected["NgbDropdownAnchor"][1] : inject(ElementRef)).nativeElement;
    this._dropdownToggleClass = true;
  }
};
NgbDropdownAnchor.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbDropdownAnchor_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdownAnchor": [
        ɵelementInstance2($element, [
          "ngbDropdown"
        ], {}, false),
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdownAnchor)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._dropdownToggleClass;
    }, function(v) {
      v ? $element.addClass("dropdown-toggle") : $element.removeClass("dropdown-toggle");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._show;
    }, function(v) {
      v ? $element.addClass("show") : $element.removeClass("show");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._ariaExpanded;
    }, function(v) {
      v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("dropdown-toggle") : $element.removeClass("dropdown-toggle");
      })(instance._dropdownToggleClass);
      (function(v) {
        v ? $element.addClass("show") : $element.removeClass("show");
      })(instance._show);
      (function(v) {
        v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
      })(instance._ariaExpanded);
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
NgbDropdownAnchor.ɵdir = {
  selectors: [
    [
      "",
      "ngbDropdownAnchor",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbDropdownAnchor.ɵfac.ɵtype = NgbDropdownAnchor;
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
var NgbDropdownToggle = class extends NgbDropdownAnchor {
  _onClick() {
    this.dropdown.toggle();
  }
  _onKeyDown(event) {
    this.dropdown.onKeyDown(event);
  }
};
NgbDropdownToggle.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbDropdownToggle_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdownAnchor": [
        ɵelementInstance3($element, [
          "ngbDropdown"
        ], {}, false),
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdownToggle)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._dropdownToggleClass;
    }, function(v) {
      v ? $element.addClass("dropdown-toggle") : $element.removeClass("dropdown-toggle");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._show;
    }, function(v) {
      v ? $element.addClass("show") : $element.removeClass("show");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._ariaExpanded;
    }, function(v) {
      v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("dropdown-toggle") : $element.removeClass("dropdown-toggle");
      })(instance._dropdownToggleClass);
      (function(v) {
        v ? $element.addClass("show") : $element.removeClass("show");
      })(instance._show);
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
    var ɵhandler1 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowup" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler1);
    var ɵhandler2 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowdown" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler2);
    var ɵhandler3 = function(event) {
      if (!(String(event.key).toLowerCase() === "home" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler3);
    var ɵhandler4 = function(event) {
      if (!(String(event.key).toLowerCase() === "end" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler4);
    var ɵhandler5 = function(event) {
      if (!(String(event.key).toLowerCase() === "tab" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler5);
    var ɵhandler6 = function(event) {
      if (!(String(event.key).toLowerCase() === "tab" && !event.altKey && !event.ctrlKey && !event.metaKey && event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance._onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler6);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      $element.off("click", ɵhandler0);
      $element.off("keydown", ɵhandler1);
      $element.off("keydown", ɵhandler2);
      $element.off("keydown", ɵhandler3);
      $element.off("keydown", ɵhandler4);
      $element.off("keydown", ɵhandler5);
      $element.off("keydown", ɵhandler6);
    });
    return instance;
  }
];
NgbDropdownToggle.ɵdir = {
  selectors: [
    [
      "",
      "ngbDropdownToggle",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbDropdownToggle.ɵfac.ɵtype = NgbDropdownToggle;
NgbDropdownToggle.ɵfac.ɵproviders = [
  {
    token: "NgbDropdownAnchor_321f1f48",
    kind: "useExisting",
    existing: "NgbDropdownToggle_3d86fbda"
  }
];
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
var NgbDropdownModule = class {
};
NgbDropdownModule.ɵfac = [
  function NgbDropdownModule_Factory() {
    return new (this && this.ɵT || NgbDropdownModule)();
  }
];
NgbDropdownModule.ɵmod = {
  id: "NgbDropdownModule_264e2e60",
  controllerAs: "$"
};
import_angular.default.module("NgbDropdownModule_264e2e60", []).factory("ɵresolve", [
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
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵlazyController
]).directive("ngbDropdown", function() {
  return {
    controller: NgbDropdown.ɵfac,
    restrict: "A",
    bindToController: {
      "autoClose": "<?",
      "dropdownClass": "<?",
      "_open": "<?ngOpen",
      "placement": "<?",
      "popperOptions": "<?",
      "container": "@?",
      "display": "@?",
      "openChange": "&?"
    },
    controllerAs: "ngbDropdown"
  };
}).directive("ngbDropdown", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "open-change"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbDropdownAnchor", function() {
  return {
    controller: NgbDropdownAnchor.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbDropdownAnchor"
  };
}).directive("ngbDropdownToggle", function() {
  return {
    controller: NgbDropdownToggle.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbDropdownToggle"
  };
}).directive("ngbDropdownMenu", function() {
  return {
    controller: NgbDropdownMenu.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbDropdownMenu"
  };
}).directive("ngbDropdownItem", function() {
  return {
    controller: NgbDropdownItem.ɵfac,
    restrict: "A",
    bindToController: {
      "tabindex": "<?",
      "disabled": "<?ngDisabled"
    },
    controllerAs: "ngbDropdownItem"
  };
}).factory("NgbDropdownModule_c700b623", NgbDropdownModule.ɵfac).run([
  "NgbDropdownModule_c700b623",
  function() {
  }
]);

// ../ngb-js/dist/dropdown/index.js
var NgbDropdownButtonItem = class {
  get _disabled() {
    return this._item.disabled;
  }
  constructor() {
    this._item = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbDropdownButtonItem"] ? globalThis.ɵngjsInjected["NgbDropdownButtonItem"][0] : inject(NgbDropdownItem);
  }
};
NgbDropdownButtonItem.ɵfac = [
  "$element",
  "$scope",
  function NgbDropdownButtonItem_Factory($element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if (!(this && this.ɵT) && [
      "button"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbDropdownButtonItem: este selector requiere <button>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbDropdownButtonItem": [
        ɵelementInstance4($element, [
          "ngbDropdownItem"
        ], {}, false)
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbDropdownButtonItem)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._disabled;
    }, function(v) {
      $element.prop("disabled", v);
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("disabled", v);
      })(instance._disabled);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbDropdownButtonItem.ɵdir = {
  selectors: [
    [
      "button",
      "ngbDropdownItem",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbDropdownButtonItem.ɵfac.ɵtype = NgbDropdownButtonItem;
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

// src/app/features/dropdown/dropdown.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Dropdown",
      tabs: [
        {
          name: "Examples",
          to: "/components/dropdown/examples"
        },
        {
          name: "Api",
          to: "/components/dropdown/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/dropdowns/",
        ngBootstrap: "components/dropdown/overview"
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
              id: "simple-dropdown",
              name: "Simple dropdown"
            },
            {
              id: "manual-dropdown",
              name: "Manual triggers"
            },
            {
              id: "dropdown-button-groups",
              name: "Button groups"
            },
            {
              id: "dropdown-disabled-items",
              name: "Disabled items"
            },
            {
              id: "dropdown-form",
              name: "Dropdown form"
            },
            {
              id: "dropdown-body",
              name: "Body container"
            },
            {
              id: "dropdown-navbar",
              name: "Navbar positioning"
            },
            {
              id: "dropdown-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./dropdown-examples-page.component-ZKNLYBHM.js").then((m) => m.DropdownExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-dropdown",
              name: "NgbDropdown"
            },
            {
              id: "ngb-dropdown-anchor",
              name: "NgbDropdownAnchor"
            },
            {
              id: "ngb-dropdown-toggle",
              name: "NgbDropdownToggle"
            },
            {
              id: "ngb-dropdown-menu",
              name: "NgbDropdownMenu"
            },
            {
              id: "ngb-dropdown-item",
              name: "NgbDropdownItem"
            },
            {
              id: "ngb-dropdown-config",
              name: "NgbDropdownConfig"
            }
          ]
        },
        loadComponent: () => import("./dropdown-api-page.component-UUWUEFFJ.js").then((m) => m.DropdownApiPageComponent)
      }
    ]
  }
];

// src/app/features/dropdown/components/dropdown-body/dropdown-body.component.ts
var DropdownBodyComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-c135f30f],.card[_content-c135f30f],.dropdown-menu[_content-c135f30f],.list-group-item[_content-c135f30f],.form-control[_content-c135f30f],.form-select[_content-c135f30f]{border-color:var(--bs-border-color)}.alert-light[_content-c135f30f]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-c135f30f],.list-group[_content-c135f30f],.dropdown-menu[_content-c135f30f]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-c135f30f],.btn-outline-secondary[_content-c135f30f]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-c135f30f],.form-select[_content-c135f30f]{background-color:var(--bs-body-bg)}code[_content-c135f30f]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownBodyComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownBodyComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownBodyComponent)();
    return instance;
  }
];
DropdownBodyComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-body"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-body.component-75157506.html",
    "controllerAs": "example"
  }
};
DropdownBodyComponent.ɵfac.ɵcomponent = true;
DropdownBodyComponent.ɵfac.ɵtype = DropdownBodyComponent;

// src/app/features/dropdown/components/dropdown-button-groups/dropdown-button-groups.component.ts
var DropdownButtonGroupsComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-4e69fdda],.card[_content-4e69fdda],.dropdown-menu[_content-4e69fdda],.list-group-item[_content-4e69fdda],.form-control[_content-4e69fdda],.form-select[_content-4e69fdda]{border-color:var(--bs-border-color)}.alert-light[_content-4e69fdda]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-4e69fdda],.list-group[_content-4e69fdda],.dropdown-menu[_content-4e69fdda]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-4e69fdda],.btn-outline-secondary[_content-4e69fdda]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-4e69fdda],.form-select[_content-4e69fdda]{background-color:var(--bs-body-bg)}code[_content-4e69fdda]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownButtonGroupsComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownButtonGroupsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownButtonGroupsComponent)();
    return instance;
  }
];
DropdownButtonGroupsComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-button-groups"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-button-groups.component-047bfd2d.html",
    "controllerAs": "example"
  }
};
DropdownButtonGroupsComponent.ɵfac.ɵcomponent = true;
DropdownButtonGroupsComponent.ɵfac.ɵtype = DropdownButtonGroupsComponent;

// src/app/features/dropdown/components/dropdown-disabled-items/dropdown-disabled-items.component.ts
var DropdownDisabledItemsComponent = class {
  constructor() {
    this.restricted = true;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-c00d9440],.card[_content-c00d9440],.dropdown-menu[_content-c00d9440],.list-group-item[_content-c00d9440],.form-control[_content-c00d9440],.form-select[_content-c00d9440]{border-color:var(--bs-border-color)}.alert-light[_content-c00d9440]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-c00d9440],.list-group[_content-c00d9440],.dropdown-menu[_content-c00d9440]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-c00d9440],.btn-outline-secondary[_content-c00d9440]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-c00d9440],.form-select[_content-c00d9440]{background-color:var(--bs-body-bg)}code[_content-c00d9440]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownDisabledItemsComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownDisabledItemsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownDisabledItemsComponent)();
    return instance;
  }
];
DropdownDisabledItemsComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-disabled-items"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-disabled-items.component-5bf83320.html",
    "controllerAs": "example"
  }
};
DropdownDisabledItemsComponent.ɵfac.ɵcomponent = true;
DropdownDisabledItemsComponent.ɵfac.ɵtype = DropdownDisabledItemsComponent;

// src/app/features/dropdown/components/dropdown-form/dropdown-form.component.ts
var DropdownFormComponent = class {
  submit() {
    this.submitted = true;
  }
  constructor() {
    this.email = "";
    this.remember = false;
    this.submitted = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-f1854632],.card[_content-f1854632],.dropdown-menu[_content-f1854632],.list-group-item[_content-f1854632],.form-control[_content-f1854632],.form-select[_content-f1854632]{border-color:var(--bs-border-color)}.alert-light[_content-f1854632]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-f1854632],.list-group[_content-f1854632],.dropdown-menu[_content-f1854632]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-f1854632],.btn-outline-secondary[_content-f1854632]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-f1854632],.form-select[_content-f1854632]{background-color:var(--bs-body-bg)}code[_content-f1854632]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownFormComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownFormComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownFormComponent)();
    return instance;
  }
];
DropdownFormComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-form"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-form.component-cbcaa910.html",
    "controllerAs": "example"
  }
};
DropdownFormComponent.ɵfac.ɵcomponent = true;
DropdownFormComponent.ɵfac.ɵtype = DropdownFormComponent;

// src/app/features/dropdown/components/dropdown-global/dropdown-global.component.ts
var DropdownGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      autoClose: config.autoClose,
      container: config.container,
      placement: config.placement
    };
    config.autoClose = "outside";
    config.container = "body";
    config.placement = [
      "top-start",
      "bottom-start"
    ];
  }
  ngOnDestroy() {
    this.config.autoClose = this.initialConfig.autoClose;
    this.config.container = this.initialConfig.container;
    this.config.placement = this.initialConfig.placement;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-2ea7dcb4],.card[_content-2ea7dcb4],.dropdown-menu[_content-2ea7dcb4],.list-group-item[_content-2ea7dcb4],.form-control[_content-2ea7dcb4],.form-select[_content-2ea7dcb4]{border-color:var(--bs-border-color)}.alert-light[_content-2ea7dcb4]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-2ea7dcb4],.list-group[_content-2ea7dcb4],.dropdown-menu[_content-2ea7dcb4]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-2ea7dcb4],.btn-outline-secondary[_content-2ea7dcb4]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-2ea7dcb4],.form-select[_content-2ea7dcb4]{background-color:var(--bs-body-bg)}code[_content-2ea7dcb4]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownGlobalComponent.ɵfac = [
  "NgbDropdownConfig_03322593",
  "$element",
  "$scope",
  function DropdownGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownGlobalComponent)(a0);
    return instance;
  }
];
DropdownGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-global.component-9cacee3a.html",
    "controllerAs": "example"
  }
};
DropdownGlobalComponent.ɵfac.ɵcomponent = true;
DropdownGlobalComponent.ɵfac.ɵtype = DropdownGlobalComponent;
DropdownGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/dropdown/components/dropdown-navbar/dropdown-navbar.component.ts
var DropdownNavbarComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-4634cc89],.card[_content-4634cc89],.dropdown-menu[_content-4634cc89],.list-group-item[_content-4634cc89],.form-control[_content-4634cc89],.form-select[_content-4634cc89]{border-color:var(--bs-border-color)}.alert-light[_content-4634cc89]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-4634cc89],.list-group[_content-4634cc89],.dropdown-menu[_content-4634cc89]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-4634cc89],.btn-outline-secondary[_content-4634cc89]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-4634cc89],.form-select[_content-4634cc89]{background-color:var(--bs-body-bg)}code[_content-4634cc89]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
DropdownNavbarComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownNavbarComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownNavbarComponent)();
    return instance;
  }
];
DropdownNavbarComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-navbar"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-navbar.component-b3083ac5.html",
    "controllerAs": "example"
  }
};
DropdownNavbarComponent.ɵfac.ɵcomponent = true;
DropdownNavbarComponent.ɵfac.ɵtype = DropdownNavbarComponent;

// src/app/features/dropdown/components/manual-dropdown/manual-dropdown.component.ts
var ManualDropdownComponent = class {
  open() {
    this.dropdown.open();
  }
  close() {
    this.dropdown.close();
  }
  toggle() {
    this.dropdown.toggle();
  }
  constructor() {
    this.opened = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-0166eaa6],.card[_content-0166eaa6],.dropdown-menu[_content-0166eaa6],.list-group-item[_content-0166eaa6],.form-control[_content-0166eaa6],.form-select[_content-0166eaa6]{border-color:var(--bs-border-color)}.alert-light[_content-0166eaa6]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-0166eaa6],.list-group[_content-0166eaa6],.dropdown-menu[_content-0166eaa6]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-0166eaa6],.btn-outline-secondary[_content-0166eaa6]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-0166eaa6],.form-select[_content-0166eaa6]{background-color:var(--bs-body-bg)}code[_content-0166eaa6]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ManualDropdownComponent.ɵfac = [
  "$element",
  "$scope",
  function ManualDropdownComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ManualDropdownComponent)();
    return instance;
  }
];
ManualDropdownComponent.ɵcmp = {
  selectors: [
    [
      "docs-manual-dropdown"
    ]
  ],
  inputs: {},
  outputs: {},
  viewQueries: [
    {
      propertyName: "dropdown",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "dropdown"
      ]
    }
  ],
  definition: {
    "templateUrl": "templates/manual-dropdown.component-d65b639b.html",
    "controllerAs": "example"
  }
};
ManualDropdownComponent.ɵfac.ɵcomponent = true;
ManualDropdownComponent.ɵfac.ɵtype = ManualDropdownComponent;

// src/app/features/dropdown/components/simple-dropdown/simple-dropdown.component.ts
var SimpleDropdownComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-b45d6eda],.card[_content-b45d6eda],.dropdown-menu[_content-b45d6eda],.list-group-item[_content-b45d6eda],.form-control[_content-b45d6eda],.form-select[_content-b45d6eda]{border-color:var(--bs-border-color)}.alert-light[_content-b45d6eda]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-b45d6eda],.list-group[_content-b45d6eda],.dropdown-menu[_content-b45d6eda]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-b45d6eda],.btn-outline-secondary[_content-b45d6eda]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-b45d6eda],.form-select[_content-b45d6eda]{background-color:var(--bs-body-bg)}code[_content-b45d6eda]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
SimpleDropdownComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleDropdownComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SimpleDropdownComponent)();
    return instance;
  }
];
SimpleDropdownComponent.ɵcmp = {
  selectors: [
    [
      "docs-simple-dropdown"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/simple-dropdown.component-7cc73b13.html",
    "controllerAs": "example"
  }
};
SimpleDropdownComponent.ɵfac.ɵcomponent = true;
SimpleDropdownComponent.ɵfac.ɵtype = SimpleDropdownComponent;

// src/app/features/dropdown/dropdown.module.ts
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
var DropdownModule = class {
};
DropdownModule.ɵfac = [
  function DropdownModule_Factory() {
    return new (this && this.ɵT || DropdownModule)();
  }
];
var ɵDropdownModule_import0 = RouterModule.forChild(routes);
DropdownModule.ɵmod = {
  id: "DropdownModule_db157176"
};
ɵimportProviders(import_angular2.default.module("DropdownModule_db157176", [
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbDropdownModule === "string" ? NgbDropdownModule : NgbDropdownModule.ɵmod ? NgbDropdownModule.ɵmod.id : NgbDropdownModule.name,
  ɵimportedModuleName(ɵDropdownModule_import0)
]), [
  ɵDropdownModule_import0
]).component("docsDropdownBody", {
  controller: DropdownBodyComponent.ɵfac,
  templateUrl: "templates/dropdown-body.component-75157506.html",
  controllerAs: "example"
}).component("docsDropdownButtonGroups", {
  controller: DropdownButtonGroupsComponent.ɵfac,
  templateUrl: "templates/dropdown-button-groups.component-047bfd2d.html",
  controllerAs: "example"
}).component("docsDropdownDisabledItems", {
  controller: DropdownDisabledItemsComponent.ɵfac,
  templateUrl: "templates/dropdown-disabled-items.component-5bf83320.html",
  controllerAs: "example"
}).component("docsDropdownForm", {
  controller: DropdownFormComponent.ɵfac,
  templateUrl: "templates/dropdown-form.component-cbcaa910.html",
  controllerAs: "example"
}).component("docsDropdownGlobal", {
  controller: DropdownGlobalComponent.ɵfac,
  templateUrl: "templates/dropdown-global.component-9cacee3a.html",
  controllerAs: "example"
}).component("docsDropdownNavbar", {
  controller: DropdownNavbarComponent.ɵfac,
  templateUrl: "templates/dropdown-navbar.component-b3083ac5.html",
  controllerAs: "example"
}).component("docsManualDropdown", {
  controller: ManualDropdownComponent.ɵfac,
  templateUrl: "templates/manual-dropdown.component-d65b639b.html",
  controllerAs: "example"
}).component("docsSimpleDropdown", {
  controller: SimpleDropdownComponent.ɵfac,
  templateUrl: "templates/simple-dropdown.component-7cc73b13.html",
  controllerAs: "example"
}).factory("DropdownModule_57e77076", DropdownModule.ɵfac).run([
  "DropdownModule_57e77076",
  function() {
  }
]);
export {
  DropdownModule
};
