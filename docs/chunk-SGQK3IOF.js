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
  NgbConfig
} from "./chunk-TYQFYSAF.js";
import {
  ChangeDetectorRef,
  DestroyRef,
  Key,
  NgZone,
  Subject,
  TemplateRef,
  distinctUntilChanged,
  filter,
  inject,
  ngbRunTransition,
  reflow,
  skip,
  startWith,
  take,
  takeUntilDestroyed
} from "./chunk-7GLALTP4.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// ../ngb-js/dist/chunk-4FFARZO4.js
var import_angular = __toESM(require_angular(), 1);
var NgbNavConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavConfig"] ? globalThis.ɵngjsInjected["NgbNavConfig"][0] : inject(NgbConfig);
    this.destroyOnHide = true;
    this.orientation = "horizontal";
    this.roles = "tablist";
    this.keyboard = true;
  }
};
NgbNavConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbNavConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNavConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNavConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbNavConfig.ɵprov = {
  token: "NgbNavConfig_a43093eb",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbNavConfig_a43093eb",
  NgbNavConfig.ɵfac
]);
var NgbNavContent = class {
};
NgbNavContent.ɵfac = [
  "$element",
  "$scope",
  function NgbNavContent_Factory($element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if (!(this && this.ɵT) && [
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbNavContent: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var instance = new (this && this.ɵT || NgbNavContent)();
    return instance;
  }
];
NgbNavContent.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbNavContent",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbNavContent.ɵfac.ɵtype = NgbNavContent;
var NgbNavLinkBase = class {
  get _isAnchor() {
    return this.nativeElement.tagName === "A";
  }
  get _isButton() {
    return this.nativeElement.tagName === "BUTTON";
  }
  constructor(role) {
    this.role = role;
    this.navItem = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavLinkBase"] ? globalThis.ɵngjsInjected["NgbNavLinkBase"][0] : inject(NgbNavItem);
    this.nav = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavLinkBase"] ? globalThis.ɵngjsInjected["NgbNavLinkBase"][1] : inject(NgbNav);
    this.nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavLinkBase"] ? globalThis.ɵngjsInjected["NgbNavLinkBase"][2] : inject(ElementRef)).nativeElement;
    this._navLinkClass = true;
  }
  get _id() {
    return this.navItem.domId;
  }
  get _navItemClass() {
    return this.navItem.isNgContainer();
  }
  get _role() {
    return this.role || (this.nav.roles ? "tab" : void 0);
  }
  get _active() {
    return this.navItem.active;
  }
  get _disabledClass() {
    return this.navItem.disabled;
  }
  get tabindex() {
    if (this.nav.keyboard === false) {
      return this.navItem.disabled ? -1 : void 0;
    }
    if (this.nav._navigatingWithKeyboard) {
      return -1;
    }
    return this.navItem.disabled || !this.navItem.active ? -1 : void 0;
  }
  get _ariaControls() {
    return this.navItem.isPanelInDom() ? this.navItem.panelDomId : null;
  }
  get _ariaSelected() {
    return this.navItem.active;
  }
  get _ariaDisabled() {
    return this.navItem.disabled;
  }
  // --- específico de `a[ngbNavLink]` ---
  get _href() {
    return this._isAnchor ? "" : void 0;
  }
  // --- específico de `button[ngbNavLink]` ---
  get _type() {
    return this._isButton ? "button" : void 0;
  }
  get _disabled() {
    return this._isButton && this.navItem.disabled;
  }
  _click(event) {
    this.nav.click(this.navItem);
    if (this._isAnchor) event.preventDefault();
  }
};
NgbNavLinkBase.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbNavLinkBase_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNavLinkBase": [
        ɵelementInstance($element, [
          "ngbNavItem"
        ], {}, false),
        ɵelementInstance($element, [
          "ngbNav"
        ], {}, false),
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNavLinkBase)($element[0].getAttribute("role"));
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._navLinkClass;
    }, function(v) {
      v ? $element.addClass("nav-link") : $element.removeClass("nav-link");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._navItemClass;
    }, function(v) {
      v ? $element.addClass("nav-item") : $element.removeClass("nav-item");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._active;
    }, function(v) {
      v ? $element.addClass("active") : $element.removeClass("active");
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._disabledClass;
    }, function(v) {
      v ? $element.addClass("disabled") : $element.removeClass("disabled");
    });
    var ɵunwatch6 = $scope.$watch(function() {
      return instance.tabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch7 = $scope.$watch(function() {
      return instance._ariaControls;
    }, function(v) {
      v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
    });
    var ɵunwatch8 = $scope.$watch(function() {
      return instance._ariaSelected;
    }, function(v) {
      v == null ? $element.removeAttr("aria-selected") : $element.attr("aria-selected", String(v));
    });
    var ɵunwatch9 = $scope.$watch(function() {
      return instance._ariaDisabled;
    }, function(v) {
      v == null ? $element.removeAttr("aria-disabled") : $element.attr("aria-disabled", String(v));
    });
    var ɵunwatch10 = $scope.$watch(function() {
      return instance._href;
    }, function(v) {
      v == null ? $element.removeAttr("href") : $element.attr("href", String(v));
    });
    var ɵunwatch11 = $scope.$watch(function() {
      return instance._type;
    }, function(v) {
      v == null ? $element.removeAttr("type") : $element.attr("type", String(v));
    });
    var ɵunwatch12 = $scope.$watch(function() {
      return instance._disabled;
    }, function(v) {
      $element.prop("disabled", v);
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
      })(instance._id);
      (function(v) {
        v ? $element.addClass("nav-link") : $element.removeClass("nav-link");
      })(instance._navLinkClass);
      (function(v) {
        v ? $element.addClass("nav-item") : $element.removeClass("nav-item");
      })(instance._navItemClass);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v ? $element.addClass("active") : $element.removeClass("active");
      })(instance._active);
      (function(v) {
        v ? $element.addClass("disabled") : $element.removeClass("disabled");
      })(instance._disabledClass);
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance.tabindex);
      (function(v) {
        v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
      })(instance._ariaControls);
      (function(v) {
        v == null ? $element.removeAttr("aria-selected") : $element.attr("aria-selected", String(v));
      })(instance._ariaSelected);
      (function(v) {
        v == null ? $element.removeAttr("aria-disabled") : $element.attr("aria-disabled", String(v));
      })(instance._ariaDisabled);
      (function(v) {
        v == null ? $element.removeAttr("href") : $element.attr("href", String(v));
      })(instance._href);
      (function(v) {
        v == null ? $element.removeAttr("type") : $element.attr("type", String(v));
      })(instance._type);
      (function(v) {
        $element.prop("disabled", v);
      })(instance._disabled);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._click(event);
      } else {
        $scope.$apply(function() {
          instance._click(event);
        });
      }
    };
    $element.on("click", ɵhandler0);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
      ɵunwatch6();
      ɵunwatch7();
      ɵunwatch8();
      ɵunwatch9();
      ɵunwatch10();
      ɵunwatch11();
      ɵunwatch12();
      $element.off("click", ɵhandler0);
    });
    return instance;
  }
];
NgbNavLinkBase.ɵdir = {
  selectors: [
    [
      "",
      "ngbNavLink",
      ""
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {}
};
NgbNavLinkBase.ɵfac.ɵtype = NgbNavLinkBase;
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
var isValidNavId = (id) => id !== void 0 && id !== null && id !== "";
var NgbNav = class {
  constructor(role) {
    this.role = role;
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNav"] ? globalThis.ɵngjsInjected["NgbNav"][0] : inject(NgbNavConfig);
    this._cd = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNav"] ? globalThis.ɵngjsInjected["NgbNav"][1] : inject(ChangeDetectorRef);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNav"] ? globalThis.ɵngjsInjected["NgbNav"][2] : inject(DOCUMENT);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNav"] ? globalThis.ɵngjsInjected["NgbNav"][3] : inject(ElementRef)).nativeElement;
    this.destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNav"] ? globalThis.ɵngjsInjected["NgbNav"][4] : inject(DestroyRef);
    this._navigatingWithKeyboard = false;
    this.activeIdChange = new EventEmitter();
    this.animation = this._config.animation;
    this.destroyOnHide = this._config.destroyOnHide;
    this.orientation = this._config.orientation;
    this.roles = this._config.roles;
    this.keyboard = this._config.keyboard;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this.navChange = new EventEmitter();
    this.navItemChange$ = new Subject();
    this._navClass = true;
  }
  get _verticalClass() {
    return this.orientation === "vertical";
  }
  get _ariaOrientation() {
    return this.orientation === "vertical" && this.roles === "tablist" ? "vertical" : void 0;
  }
  get _role() {
    return this.role || (this.roles ? "tablist" : void 0);
  }
  click(item) {
    if (!item.disabled) {
      this._updateActiveId(item.id);
    }
  }
  onFocusout({ relatedTarget }) {
    if (!this._nativeElement.contains(relatedTarget)) {
      this._navigatingWithKeyboard = false;
    }
  }
  onKeyDown(event) {
    if (this.roles !== "tablist" || !this.keyboard) {
      return;
    }
    const enabledLinks = this.links.filter((link2) => !link2.navItem.disabled);
    const { length } = enabledLinks;
    let position = -1;
    enabledLinks.forEach((link2, index) => {
      if (link2.nativeElement === this._document.activeElement) {
        position = index;
      }
    });
    if (!length) {
      return;
    }
    switch (event.which) {
      case Key.ArrowUp:
      case Key.ArrowLeft:
        position = (position - 1 + length) % length;
        break;
      case Key.ArrowRight:
      case Key.ArrowDown:
        position = (position + 1) % length;
        break;
      case Key.Home:
        position = 0;
        break;
      case Key.End:
        position = length - 1;
        break;
      default:
        return;
    }
    const link = enabledLinks[position];
    if (!link) {
      return;
    }
    if (this.keyboard === "changeWithArrows") {
      this.select(link.navItem.id);
    }
    link.nativeElement.focus();
    this._navigatingWithKeyboard = true;
    event.preventDefault();
  }
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  select(id) {
    this._updateActiveId(id, false);
  }
  ngAfterContentInit() {
    if (this.activeId === void 0 || this.activeId === null) {
      const nextId = this.items.first?.id ?? null;
      if (isValidNavId(nextId)) {
        this._updateActiveId(nextId, false);
        this._cd.detectChanges();
      }
    }
    this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this._notifyItemChanged(this.activeId));
  }
  ngOnChanges({ activeId }) {
    if (activeId && !activeId.isFirstChange()) {
      this._notifyItemChanged(activeId.currentValue);
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  _updateActiveId(nextId, emitNavChange = true) {
    if (this.activeId !== nextId) {
      let defaultPrevented = false;
      if (emitNavChange) {
        this.navChange.emit({
          activeId: this.activeId,
          nextId,
          preventDefault: () => {
            defaultPrevented = true;
          }
        });
      }
      if (!defaultPrevented) {
        this.activeId = nextId;
        this.activeIdChange.emit(nextId);
        this._notifyItemChanged(nextId);
      }
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  _notifyItemChanged(nextItemId) {
    this.navItemChange$.next(this._getItemById(nextItemId));
  }
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  _getItemById(itemId) {
    return this.items.find((item) => item.id === itemId) ?? null;
  }
};
NgbNav.ɵfac = [
  "NgbNavConfig_a43093eb",
  "ChangeDetectorRef_e2bfcbab",
  "DOCUMENT_a3a362b8",
  "ElementRef_927308a2",
  "DestroyRef_a5c7a091",
  "$element",
  "$scope",
  function NgbNav_Factory(i0, i1, i2, i3, i4, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNav": [
        i0,
        i1,
        i2,
        i3,
        i4
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNav)($element[0].getAttribute("role"));
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._navClass;
    }, function(v) {
      v ? $element.addClass("nav") : $element.removeClass("nav");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._verticalClass;
    }, function(v) {
      v ? $element.addClass("flex-column") : $element.removeClass("flex-column");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._ariaOrientation;
    }, function(v) {
      v == null ? $element.removeAttr("aria-orientation") : $element.attr("aria-orientation", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("nav") : $element.removeClass("nav");
      })(instance._navClass);
      (function(v) {
        v ? $element.addClass("flex-column") : $element.removeClass("flex-column");
      })(instance._verticalClass);
      (function(v) {
        v == null ? $element.removeAttr("aria-orientation") : $element.attr("aria-orientation", String(v));
      })(instance._ariaOrientation);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.onFocusout(event);
      } else {
        $scope.$apply(function() {
          instance.onFocusout(event);
        });
      }
    };
    $element.on("focusout", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.onKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance.onKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler1);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      $element.off("focusout", ɵhandler0);
      $element.off("keydown", ɵhandler1);
    });
    return instance;
  }
];
NgbNav.ɵdir = {
  selectors: [
    [
      "",
      "ngbNav",
      ""
    ]
  ],
  inputs: {
    "activeId": "activeId",
    "animation": "animation",
    "destroyOnHide": "destroyOnHide",
    "orientation": "orientation",
    "roles": "roles",
    "keyboard": "keyboard"
  },
  outputs: {
    "activeIdChange": "activeIdChange",
    "shown": "shown",
    "hidden": "hidden",
    "navChange": "navChange"
  },
  exportAs: [
    "ngbNav"
  ],
  queries: [
    {
      propertyName: "items",
      first: false,
      descendants: false,
      static: false,
      get predicate() {
        return NgbNavItem;
      }
    },
    {
      propertyName: "links",
      first: false,
      descendants: true,
      static: false,
      get predicate() {
        return NgbNavLinkBase;
      }
    }
  ],
  definition: {
    "bindings": {
      "activeId": "<?",
      "animation": "<?",
      "destroyOnHide": "<?",
      "orientation": "<?",
      "roles": "<?",
      "keyboard": "<?",
      "activeIdChange": "&?",
      "shown": "&?",
      "hidden": "&?",
      "navChange": "&?"
    }
  }
};
NgbNav.ɵfac.ɵtype = NgbNav;
NgbNav.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["activeId"];
    if (!c) return;
    changes["activeId"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["animation"];
    if (!c) return;
    changes["animation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["destroyOnHide"];
    if (!c) return;
    changes["destroyOnHide"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["orientation"];
    if (!c) return;
    changes["orientation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["roles"];
    if (!c) return;
    changes["roles"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["keyboard"];
    if (!c) return;
    changes["keyboard"] = {
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
NgbNav.prototype.$postLink = function() {
  this.ngAfterContentInit();
};
var isValidNavId2 = (id) => id !== void 0 && id !== null && id !== "";
var navCounter = 0;
var NgbNavItem = class {
  // ng-bootstrap separa esto en `NgbNavItemRole` (`selector: "[ngbNavItem]:not(ng-container)"`).
  // AngularJS no deja dos directivas con el mismo nombre y ambas con controller
  // (`$compile:multidir`), así que acá va integrado, con el mismo criterio
  // `:not(ng-container)` chequeado en runtime. Ver CORE_GAPS.md.
  constructor(_explicitRole) {
    this._explicitRole = _explicitRole;
    this._nav = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavItem"] ? globalThis.ɵngjsInjected["NgbNavItem"][0] : inject(NgbNav);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavItem"] ? globalThis.ɵngjsInjected["NgbNavItem"][1] : inject(ElementRef)).nativeElement;
    this.disabled = false;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._navItemClass = true;
  }
  get _role() {
    if (this._nativeElement.tagName === "NG-CONTAINER") return void 0;
    return this._explicitRole || (this._nav.roles ? "presentation" : void 0);
  }
  ngOnInit() {
    if (this.domId === void 0 || this.domId === null) {
      this.domId = `ngb-nav-${navCounter++}`;
    }
  }
  get active() {
    return this._nav.activeId === this.id;
  }
  // biome-ignore lint/suspicious/noExplicitAny: API pública compatible con ng-bootstrap
  get id() {
    return isValidNavId2(this._id) ? this._id : this.domId;
  }
  get panelDomId() {
    return `${this.domId}-panel`;
  }
  isPanelInDom() {
    return (this.destroyOnHide !== void 0 ? !this.destroyOnHide : !this._nav.destroyOnHide) || this.active;
  }
  isNgContainer() {
    return this._nativeElement.nodeType === Node.COMMENT_NODE;
  }
};
NgbNavItem.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbNavItem_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNavItem": [
        ɵelementInstance2($element, [
          "ngbNav"
        ], {}, false),
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNavItem)($element[0].getAttribute("role"));
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._navItemClass;
    }, function(v) {
      v ? $element.addClass("nav-item") : $element.removeClass("nav-item");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("nav-item") : $element.removeClass("nav-item");
      })(instance._navItemClass);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
    });
    return instance;
  }
];
NgbNavItem.ɵdir = {
  selectors: [
    [
      "",
      "ngbNavItem",
      ""
    ]
  ],
  inputs: {
    "destroyOnHide": "destroyOnHide",
    "disabled": "disabled",
    "domId": "domId",
    "ngbNavItem": "_id"
  },
  outputs: {
    "shown": "shown",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbNavItem"
  ],
  queries: [
    {
      propertyName: "contentTpl",
      first: true,
      descendants: false,
      static: false,
      get predicate() {
        return NgbNavContent;
      },
      get read() {
        return TemplateRef;
      }
    }
  ],
  definition: {
    "bindings": {
      "destroyOnHide": "<?",
      "disabled": "<?ngDisabled",
      "domId": "<?",
      "_id": "<?ngbNavItem",
      "shown": "&?",
      "hidden": "&?"
    }
  }
};
NgbNavItem.ɵfac.ɵtype = NgbNavItem;
NgbNavItem.prototype.$onInit = function() {
  this.ngOnInit();
};
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
var NgbNavPane = class {
  get _id() {
    return this.item.panelDomId;
  }
  get _fadeClass() {
    return this.nav.animation;
  }
  get _role() {
    return this.role || (this.nav.roles ? "tabpanel" : void 0);
  }
  get _ariaLabelledBy() {
    return this.item.domId;
  }
  constructor() {
    this.nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavPane"] ? globalThis.ɵngjsInjected["NgbNavPane"][0] : inject(ElementRef)).nativeElement;
    this._tabPaneClass = true;
  }
};
NgbNavPane.ɵfac = [
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbNavPane_Factory(i0, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNavPane": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNavPane)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._tabPaneClass;
    }, function(v) {
      v ? $element.addClass("tab-pane") : $element.removeClass("tab-pane");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._fadeClass;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._ariaLabelledBy;
    }, function(v) {
      v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
      })(instance._id);
      (function(v) {
        v ? $element.addClass("tab-pane") : $element.removeClass("tab-pane");
      })(instance._tabPaneClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fadeClass);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
      })(instance._ariaLabelledBy);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
    });
    return instance;
  }
];
NgbNavPane.ɵdir = {
  selectors: [
    [
      "",
      "ngbNavPane",
      ""
    ]
  ],
  inputs: {
    "item": "item",
    "nav": "nav",
    "role": "role"
  },
  outputs: {},
  definition: {
    "bindings": {
      "item": "<?",
      "nav": "<?",
      "role": "<?"
    }
  }
};
NgbNavPane.ɵfac.ɵtype = NgbNavPane;
var ngbNavFadeOutTransition = (element) => {
  element.classList.remove("show");
  return () => element.classList.remove("active");
};
var ngbNavFadeInTransition = (element, animation) => {
  if (animation) {
    reflow(element);
  }
  element.classList.add("show");
};
var NgbNavOutlet = class {
  isPanelTransitioning(item) {
    return this._activePane?.item === item;
  }
  ngAfterViewInit() {
    this._updateActivePane();
    if (!this._activePane) {
      this._ngZone.onStable.pipe(filter(() => !this._activePane && !!this._getActivePane()), take(1), takeUntilDestroyed(this.nav.destroyRef)).subscribe(() => this._updateActivePane());
    }
    this.nav.navItemChange$.pipe(takeUntilDestroyed(this.nav.destroyRef), startWith(this._activePane?.item ?? null), distinctUntilChanged(), skip(1)).subscribe((nextItem) => {
      const options = {
        animation: this.nav.animation,
        runningTransition: "stop"
      };
      this._cd.detectChanges();
      if (this._activePane) {
        ngbRunTransition(this._ngZone, this._activePane.nativeElement, ngbNavFadeOutTransition, options).subscribe(() => {
          const activeItem = this._activePane?.item;
          this._activePane = this._getPaneForItem(nextItem);
          this._cd.markForCheck();
          if (this._activePane) {
            this._activePane.nativeElement.classList.add("active");
            ngbRunTransition(this._ngZone, this._activePane.nativeElement, ngbNavFadeInTransition, options).subscribe(() => {
              if (nextItem) {
                nextItem.shown.emit();
                this.nav.shown.emit(nextItem.id);
              }
            });
          }
          if (activeItem) {
            activeItem.hidden.emit();
            this.nav.hidden.emit(activeItem.id);
          }
        });
      } else {
        this._updateActivePane();
      }
    });
  }
  _updateActivePane() {
    this._activePane = this._getActivePane();
    this._activePane?.nativeElement.classList.add("show", "active");
  }
  _getPaneForItem(item) {
    return this._panes.find((pane) => pane.item === item) ?? null;
  }
  _getActivePane() {
    return this._panes.find((pane) => pane.item.active) ?? null;
  }
  constructor() {
    this._cd = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavOutlet"] ? globalThis.ɵngjsInjected["NgbNavOutlet"][0] : inject(ChangeDetectorRef);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbNavOutlet"] ? globalThis.ɵngjsInjected["NgbNavOutlet"][1] : inject(NgZone);
    this._activePane = null;
    this._tabContentClass = true;
  }
};
NgbNavOutlet.ɵfac = [
  "ChangeDetectorRef_e2bfcbab",
  "NgZone_31031859",
  "$element",
  "$scope",
  function NgbNavOutlet_Factory(i0, i1, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbNavOutlet": [
        i0,
        i1
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbNavOutlet)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._tabContentClass;
    }, function(v) {
      v ? $element.addClass("tab-content") : $element.removeClass("tab-content");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("tab-content") : $element.removeClass("tab-content");
      })(instance._tabContentClass);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbNavOutlet.ɵcmp = {
  selectors: [
    [
      "",
      "ngbNavOutlet",
      ""
    ]
  ],
  inputs: {
    "paneRole": "paneRole",
    "ngbNavOutlet": "nav"
  },
  outputs: {},
  viewQueries: [
    {
      propertyName: "_panes",
      first: false,
      descendants: true,
      static: false,
      get predicate() {
        return NgbNavPane;
      }
    }
  ],
  definition: {
    "template": '\n        <div\n          ng-repeat="item in $.nav.items.toArray() track by item.domId"\n          ng-if="item.isPanelInDom() || $.isPanelTransitioning(item)"\n          ngb-nav-pane\n          item="item"\n          nav="$.nav"\n          role="$.paneRole">\n          <ng-container\n            ng-template-outlet="item.contentTpl"\n            ng-template-outlet-context="{ $implicit: item.active || $.isPanelTransitioning(item) }">\n          </ng-container>\n        </div>\n      ',
    "bindings": {
      "paneRole": "<?",
      "nav": "<?ngbNavOutlet"
    }
  }
};
NgbNavOutlet.ɵfac.ɵcomponent = true;
NgbNavOutlet.ɵfac.ɵtype = NgbNavOutlet;
NgbNavOutlet.prototype.$postLink = function() {
  this.ngAfterViewInit();
};
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
var NgbNavModule = class {
};
NgbNavModule.ɵfac = [
  function NgbNavModule_Factory() {
    return new (this && this.ɵT || NgbNavModule)();
  }
];
NgbNavModule.ɵmod = {
  id: "NgbNavModule_333fca44",
  controllerAs: "$"
};
import_angular.default.module("NgbNavModule_333fca44", [
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
]).directive("ngbNavOutlet", function() {
  return {
    controller: NgbNavOutlet.ɵfac,
    template: '\n        <div\n          ng-repeat="item in $.nav.items.toArray() track by item.domId"\n          ng-if="item.isPanelInDom() || $.isPanelTransitioning(item)"\n          ngb-nav-pane\n          item="item"\n          nav="$.nav"\n          role="$.paneRole">\n          <ng-container\n            ng-template-outlet="item.contentTpl"\n            ng-template-outlet-context="{ $implicit: item.active || $.isPanelTransitioning(item) }">\n          </ng-container>\n        </div>\n      ',
    controllerAs: "$",
    restrict: "A",
    scope: {},
    bindToController: {
      "paneRole": "<?",
      "nav": "<?ngbNavOutlet"
    }
  };
}).directive("ngbNavContent", function() {
  return {
    controller: NgbNavContent.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbNavContent"
  };
}).directive("ngbNav", function() {
  return {
    controller: NgbNav.ɵfac,
    restrict: "A",
    bindToController: {
      "activeId": "<?",
      "animation": "<?",
      "destroyOnHide": "<?",
      "orientation": "<?",
      "roles": "<?",
      "keyboard": "<?",
      "activeIdChange": "&?",
      "shown": "&?",
      "hidden": "&?",
      "navChange": "&?"
    },
    controllerAs: "ngbNav"
  };
}).directive("ngbNav", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "active-id-change",
          "shown",
          "hidden",
          "nav-change"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbNavItem", function() {
  return {
    controller: NgbNavItem.ɵfac,
    restrict: "A",
    bindToController: {
      "destroyOnHide": "<?",
      "disabled": "<?ngDisabled",
      "domId": "<?",
      "_id": "<?ngbNavItem",
      "shown": "&?",
      "hidden": "&?"
    },
    controllerAs: "ngbNavItem"
  };
}).directive("ngbNavItem", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "shown",
          "hidden"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbNavLink", function() {
  return {
    controller: NgbNavLinkBase.ɵfac,
    restrict: "A",
    bindToController: true,
    controllerAs: "ngbNavLink"
  };
}).directive("ngbNavPane", function() {
  return {
    controller: NgbNavPane.ɵfac,
    restrict: "A",
    bindToController: {
      "item": "<?",
      "nav": "<?",
      "role": "<?"
    },
    controllerAs: "ngbNavPane"
  };
}).factory("NgbNavModule_c5ef442c", NgbNavModule.ɵfac).run([
  "NgbNavModule_c5ef442c",
  function() {
  }
]);

export {
  NgbNavModule
};
