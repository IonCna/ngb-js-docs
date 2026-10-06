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
  NgbConfig,
  NgbScrollSpyModule
} from "./chunk-R7GTDWT4.js";
import {
  RouterModule
} from "./chunk-UVJQY4BU.js";
import "./chunk-BJK3QUXG.js";
import {
  BehaviorSubject,
  ChangeDetectorRef,
  DestroyRef,
  NEVER,
  NgZone,
  PLATFORM_ID,
  TemplateRef,
  combineLatest,
  distinctUntilChanged,
  inject,
  isPlatformBrowser,
  map,
  ngbCompleteTransition,
  ngbRunTransition,
  reflow,
  startWith,
  switchMap,
  take,
  takeUntilDestroyed,
  timer,
  zip
} from "./chunk-U6UIHJCB.js";
import {
  CommonModule,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/features/carousel/carousel.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-6CMIBFNT.js
var import_angular = __toESM(require_angular(), 1);
var NgbCarouselConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarouselConfig"] ? globalThis.ɵngjsInjected["NgbCarouselConfig"][0] : inject(NgbConfig);
    this.interval = 5e3;
    this.wrap = true;
    this.keyboard = true;
    this.pauseOnHover = true;
    this.pauseOnFocus = true;
    this.showNavigationArrows = true;
    this.showNavigationIndicators = true;
  }
};
NgbCarouselConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbCarouselConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbCarouselConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbCarouselConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbCarouselConfig.ɵprov = {
  token: "NgbCarouselConfig_bd078add",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbCarouselConfig_bd078add",
  NgbCarouselConfig.ɵfac
]);
var NgbSlideEventDirection = /* @__PURE__ */ (function(NgbSlideEventDirection2) {
  NgbSlideEventDirection2["START"] = "start";
  NgbSlideEventDirection2["END"] = "end";
  return NgbSlideEventDirection2;
})({});
var isBeingAnimated = ({ classList }) => {
  return classList.contains("carousel-item-start") || classList.contains("carousel-item-end");
};
var removeDirectionClasses = (classList) => {
  classList.remove("carousel-item-start", "carousel-item-end");
};
var removeClasses = (classList) => {
  removeDirectionClasses(classList);
  classList.remove("carousel-item-prev", "carousel-item-next");
};
var ngbCarouselTransitionIn = (element, animation, { direction }) => {
  const { classList } = element;
  if (!animation) {
    removeClasses(classList);
    classList.add("active");
    return;
  }
  if (isBeingAnimated(element)) {
    removeDirectionClasses(classList);
  } else {
    classList.add(`carousel-item-${direction === "start" ? "next" : "prev"}`);
    reflow(element);
    classList.add(`carousel-item-${direction}`);
  }
  return () => {
    removeClasses(classList);
    classList.add("active");
  };
};
var ngbCarouselTransitionOut = (element, animation, { direction }) => {
  const { classList } = element;
  if (!animation) {
    removeClasses(classList);
    classList.remove("active");
    return;
  }
  if (isBeingAnimated(element)) {
    removeDirectionClasses(classList);
  } else {
    classList.add(`carousel-item-${direction}`);
  }
  return () => {
    removeClasses(classList);
    classList.remove("active");
  };
};
var nextId = 0;
var NgbSlide = class {
  constructor() {
    this.templateRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbSlide"] ? globalThis.ɵngjsInjected["NgbSlide"][0] : inject(TemplateRef);
    this.id = `ngb-slide-${nextId++}`;
    this.slid = new EventEmitter();
  }
};
NgbSlide.ɵfac = [
  "TemplateRef_22b1ec91",
  "$element",
  "$scope",
  function NgbSlide_Factory(i0, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if (!(this && this.ɵT) && [
      "ng-template"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbSlide: este selector requiere <ng-template>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbSlide": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbSlide)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbSlide.ɵdir = {
  selectors: [
    [
      "ng-template",
      "ngbSlide",
      ""
    ]
  ],
  inputs: {
    "id": "id"
  },
  outputs: {
    "slid": "slid"
  },
  definition: {
    "bindings": {
      "id": "@?",
      "slid": "&?"
    }
  }
};
NgbSlide.ɵfac.ɵtype = NgbSlide;
var carouselId = 0;
var NgbCarousel = class {
  get _activeDescendant() {
    return `slide-${this.activeId}`;
  }
  /**
  * Tiempo en milisegundos antes de mostrar el siguiente slide.
  */
  set interval(value) {
    this._interval$.next(value);
  }
  get interval() {
    return this._interval$.value;
  }
  /**
  * Si es `true`, el carousel 'envuelve' pasando del último slide al primero.
  */
  set wrap(value) {
    this._wrap$.next(value);
  }
  get wrap() {
    return this._wrap$.value;
  }
  /**
  * Si es `true`, pausa el cambio de slides cuando el mouse está sobre el slide.
  *
  * @since 2.2.0
  */
  set pauseOnHover(value) {
    this._pauseOnHover$.next(value);
  }
  get pauseOnHover() {
    return this._pauseOnHover$.value;
  }
  /**
  * Si es `true`, pausa el cambio de slides cuando el foco está dentro del carousel.
  */
  set pauseOnFocus(value) {
    this._pauseOnFocus$.next(value);
  }
  get pauseOnFocus() {
    return this._pauseOnFocus$.value;
  }
  _onMouseEnter() {
    this.mouseHover = true;
  }
  _onMouseLeave() {
    this.mouseHover = false;
  }
  _onFocusIn() {
    this.focused = true;
  }
  _onFocusOut() {
    this.focused = false;
  }
  _onArrowLeftKey() {
    if (this.keyboard) this.arrowLeft();
  }
  _onArrowRightKey() {
    if (this.keyboard) this.arrowRight();
  }
  set mouseHover(value) {
    this._mouseHover$.next(value);
  }
  get mouseHover() {
    return this._mouseHover$.value;
  }
  set focused(value) {
    this._focused$.next(value);
  }
  get focused() {
    return this._focused$.value;
  }
  arrowLeft() {
    this.focus();
    this.prev("arrowLeft");
  }
  arrowRight() {
    this.focus();
    this.next("arrowRight");
  }
  ngAfterContentInit() {
    if (isPlatformBrowser(this._platformId)) {
      this._ngZone.runOutsideAngular(() => {
        const hasNextSlide$ = combineLatest([
          this.slide.pipe(map((slideEvent) => slideEvent.current), startWith(this.activeId)),
          this._wrap$,
          this.slides.changes.pipe(startWith(null))
        ]).pipe(map(([currentSlideId, wrap]) => {
          const slideArr = this.slides.toArray();
          const currentSlideIdx = this._getSlideIdxById(currentSlideId);
          return wrap ? slideArr.length > 1 : currentSlideIdx < slideArr.length - 1;
        }), distinctUntilChanged());
        combineLatest([
          this._pause$,
          this._pauseOnHover$,
          this._mouseHover$,
          this._pauseOnFocus$,
          this._focused$,
          this._interval$,
          hasNextSlide$
        ]).pipe(map(([pause, pauseOnHover, mouseHover, pauseOnFocus, focused, interval, hasNextSlide]) => pause || pauseOnHover && mouseHover || pauseOnFocus && focused || !hasNextSlide ? 0 : interval), distinctUntilChanged(), switchMap((interval) => interval > 0 ? timer(interval, interval) : NEVER), takeUntilDestroyed(this._destroyRef)).subscribe(() => this._ngZone.run(() => this.next("timer")));
      });
    }
    this.slides.changes.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._transitionIds?.forEach((id) => {
        ngbCompleteTransition(this._getSlideElement(id));
      });
      this._transitionIds = null;
      this._cd.markForCheck();
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        for (const { id } of this.slides) {
          const element = this._getSlideElement(id);
          if (id === this.activeId) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        }
      });
    });
  }
  ngAfterContentChecked() {
    const activeSlide = this._getSlideById(this.activeId);
    this.activeId = activeSlide ? activeSlide.id : this.slides.length ? this.slides.first.id : "";
  }
  ngAfterViewInit() {
    const markActive = () => {
      if (this.activeId) {
        const element = this._getSlideElement(this.activeId);
        if (element) {
          element.classList.add("active");
        }
      }
    };
    markActive();
    this._ngZone.onStable.pipe(take(1)).subscribe(markActive);
  }
  /**
  * Navega al slide con el identificador dado.
  */
  select(slideId, source) {
    this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source);
  }
  /**
  * Navega al slide anterior.
  */
  prev(source) {
    this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.END, source);
  }
  /**
  * Navega al slide siguiente.
  */
  next(source) {
    this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.START, source);
  }
  /**
  * Pausa el ciclado de slides.
  */
  pause() {
    this._pause$.next(true);
  }
  /**
  * Reinicia el ciclado de slides de principio a fin.
  */
  cycle() {
    this._pause$.next(false);
  }
  /**
  * Pone el foco en el carousel.
  */
  focus() {
    this._container.nativeElement.focus();
  }
  _cycleToSelected(slideIdx, direction, source) {
    const transitionIds = this._transitionIds;
    if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) {
      return;
    }
    const selectedSlide = this._getSlideById(slideIdx);
    if (selectedSlide && selectedSlide.id !== this.activeId) {
      this._transitionIds = [
        this.activeId,
        slideIdx
      ];
      this.slide.emit({
        prev: this.activeId,
        current: selectedSlide.id,
        direction,
        paused: this._pause$.value,
        source
      });
      const options = {
        animation: this.animation,
        runningTransition: "stop",
        context: {
          direction
        }
      };
      const transitions = [];
      const activeSlide = this._getSlideById(this.activeId);
      if (activeSlide) {
        const activeSlideTransition = ngbRunTransition(this._ngZone, this._getSlideElement(activeSlide.id), ngbCarouselTransitionOut, options);
        activeSlideTransition.subscribe(() => {
          activeSlide.slid.emit({
            isShown: false,
            direction,
            source
          });
        });
        transitions.push(activeSlideTransition);
      }
      const previousId = this.activeId;
      this.activeId = selectedSlide.id;
      const nextSlide = this._getSlideById(this.activeId);
      const transition = ngbRunTransition(this._ngZone, this._getSlideElement(selectedSlide.id), ngbCarouselTransitionIn, options);
      transition.subscribe(() => {
        nextSlide?.slid.emit({
          isShown: true,
          direction,
          source
        });
      });
      transitions.push(transition);
      zip(...transitions).pipe(take(1)).subscribe(() => {
        this._transitionIds = null;
        this.slid.emit({
          prev: previousId,
          // biome-ignore lint/style/noNonNullAssertion: garantizado por el `if (selectedSlide && ...)` de arriba (upstream)
          current: selectedSlide.id,
          direction,
          paused: this._pause$.value,
          source
        });
      });
    }
    this._cd.markForCheck();
  }
  _getSlideEventDirection(currentActiveSlideId, nextActiveSlideId) {
    const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
    const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);
    return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.END : NgbSlideEventDirection.START;
  }
  _getSlideById(slideId) {
    return this.slides.find((slide) => slide.id === slideId) || null;
  }
  _getSlideIdxById(slideId) {
    const slide = this._getSlideById(slideId);
    return slide != null ? this.slides.toArray().indexOf(slide) : -1;
  }
  _getNextSlide(currentSlideId) {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === slideArr.length - 1;
    return isLastSlide ? this.wrap ? slideArr[0].id : slideArr[slideArr.length - 1].id : slideArr[currentSlideIdx + 1].id;
  }
  _getPrevSlide(currentSlideId) {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;
    return isFirstSlide ? this.wrap ? slideArr[slideArr.length - 1].id : slideArr[0].id : slideArr[currentSlideIdx - 1].id;
  }
  _getSlideElement(slideId) {
    return this._container.nativeElement.querySelector(`#slide-${slideId}`);
  }
  constructor() {
    this.NgbSlideEventSource = NgbSlideEventSource;
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][0] : inject(NgbCarouselConfig);
    this._platformId = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][1] : inject(PLATFORM_ID);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][2] : inject(NgZone);
    this._cd = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][3] : inject(ChangeDetectorRef);
    this._container = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][4] : inject(ElementRef);
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbCarousel"] ? globalThis.ɵngjsInjected["NgbCarousel"][5] : inject(DestroyRef);
    this._interval$ = new BehaviorSubject(this._config.interval);
    this._mouseHover$ = new BehaviorSubject(false);
    this._focused$ = new BehaviorSubject(false);
    this._pauseOnHover$ = new BehaviorSubject(this._config.pauseOnHover);
    this._pauseOnFocus$ = new BehaviorSubject(this._config.pauseOnFocus);
    this._pause$ = new BehaviorSubject(false);
    this._wrap$ = new BehaviorSubject(this._config.wrap);
    this.id = `ngb-carousel-${carouselId++}`;
    this._hostClassCarousel = true;
    this._hostClassSlide = true;
    this._hostDisplay = "block";
    this._hostTabindex = 0;
    this.animation = this._config.animation;
    this.keyboard = this._config.keyboard;
    this.showNavigationArrows = this._config.showNavigationArrows;
    this.showNavigationIndicators = this._config.showNavigationIndicators;
    this.slide = new EventEmitter();
    this.slid = new EventEmitter();
    this._transitionIds = null;
  }
};
var NgbSlideEventSource = /* @__PURE__ */ (function(NgbSlideEventSource2) {
  NgbSlideEventSource2["TIMER"] = "timer";
  NgbSlideEventSource2["ARROW_LEFT"] = "arrowLeft";
  NgbSlideEventSource2["ARROW_RIGHT"] = "arrowRight";
  NgbSlideEventSource2["INDICATOR"] = "indicator";
  return NgbSlideEventSource2;
})({});
NgbCarousel.ɵfac = [
  "NgbCarouselConfig_bd078add",
  "PLATFORM_ID_718b0e2a",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "ElementRef_927308a2",
  "DestroyRef_a5c7a091",
  "$element",
  "$scope",
  function NgbCarousel_Factory(i0, i1, i2, i3, i4, i5, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbCarousel": [
        i0,
        i1,
        i2,
        i3,
        i4,
        i5
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbCarousel)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClassCarousel;
    }, function(v) {
      v ? $element.addClass("carousel") : $element.removeClass("carousel");
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._hostClassSlide;
    }, function(v) {
      v ? $element.addClass("slide") : $element.removeClass("slide");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._hostDisplay;
    }, function(v) {
      v == null ? $element.css("display", "") : $element.css("display", v + "");
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._hostTabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._activeDescendant;
    }, function(v) {
      v == null ? $element.removeAttr("aria-activedescendant") : $element.attr("aria-activedescendant", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("carousel") : $element.removeClass("carousel");
      })(instance._hostClassCarousel);
      (function(v) {
        v ? $element.addClass("slide") : $element.removeClass("slide");
      })(instance._hostClassSlide);
      (function(v) {
        v == null ? $element.css("display", "") : $element.css("display", v + "");
      })(instance._hostDisplay);
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance._hostTabindex);
      (function(v) {
        v == null ? $element.removeAttr("aria-activedescendant") : $element.attr("aria-activedescendant", String(v));
      })(instance._activeDescendant);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onMouseEnter();
      } else {
        $scope.$apply(function() {
          instance._onMouseEnter();
        });
      }
    };
    $element.on("mouseenter", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onMouseLeave();
      } else {
        $scope.$apply(function() {
          instance._onMouseLeave();
        });
      }
    };
    $element.on("mouseleave", ɵhandler1);
    var ɵhandler2 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onFocusIn();
      } else {
        $scope.$apply(function() {
          instance._onFocusIn();
        });
      }
    };
    $element.on("focusin", ɵhandler2);
    var ɵhandler3 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onFocusOut();
      } else {
        $scope.$apply(function() {
          instance._onFocusOut();
        });
      }
    };
    $element.on("focusout", ɵhandler3);
    var ɵhandler4 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowleft" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onArrowLeftKey();
      } else {
        $scope.$apply(function() {
          instance._onArrowLeftKey();
        });
      }
    };
    $element.on("keydown", ɵhandler4);
    var ɵhandler5 = function(event) {
      if (!(String(event.key).toLowerCase() === "arrowright" && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)) return;
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance._onArrowRightKey();
      } else {
        $scope.$apply(function() {
          instance._onArrowRightKey();
        });
      }
    };
    $element.on("keydown", ɵhandler5);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      $element.off("mouseenter", ɵhandler0);
      $element.off("mouseleave", ɵhandler1);
      $element.off("focusin", ɵhandler2);
      $element.off("focusout", ɵhandler3);
      $element.off("keydown", ɵhandler4);
      $element.off("keydown", ɵhandler5);
    });
    return instance;
  }
];
NgbCarousel.ɵcmp = {
  selectors: [
    [
      "ngb-carousel"
    ]
  ],
  inputs: {
    "animation": "animation",
    "activeId": "activeId",
    "interval": "interval",
    "wrap": "wrap",
    "keyboard": "keyboard",
    "pauseOnHover": "pauseOnHover",
    "pauseOnFocus": "pauseOnFocus",
    "showNavigationArrows": "showNavigationArrows",
    "showNavigationIndicators": "showNavigationIndicators"
  },
  outputs: {
    "slide": "slide",
    "slid": "slid"
  },
  exportAs: [
    "ngbCarousel"
  ],
  queries: [
    {
      propertyName: "slides",
      first: false,
      descendants: false,
      static: false,
      get predicate() {
        return NgbSlide;
      }
    }
  ],
  definition: {
    "template": `<div class="carousel-indicators" ng-class="{ 'visually-hidden': !$.showNavigationIndicators }" role="tablist">
  <button
    ng-repeat="$slide in $.slides.toArray() track by $slide.id"
    type="button"
    data-bs-target
    ng-class="{ active: $slide.id === $.activeId }"
    role="tab"
    ng-attr-aria-labelledby="slide-{{ $slide.id }}"
    ng-attr-aria-controls="slide-{{ $slide.id }}"
    ng-attr-aria-selected="{{ $slide.id === $.activeId }}"
    ng-click="$.focus(); $.select($slide.id, $.NgbSlideEventSource.INDICATOR)"
  ></button>
</div>
<div class="carousel-inner">
  <div
    ng-repeat="$slide in $.slides.toArray() track by $slide.id"
    class="carousel-item"
    ng-attr-id="slide-{{ $slide.id }}"
    role="tabpanel"
  >
    <span class="visually-hidden">Slide {{ $index + 1 }} of {{ $.slides.length }}</span>
    <ng-container ng-template-outlet="$slide.templateRef"></ng-container>
  </div>
</div>
<button
  ng-if="$.showNavigationArrows"
  class="carousel-control-prev"
  type="button"
  ng-click="$.arrowLeft()"
  ng-attr-aria-labelledby="{{ $.id }}-previous"
>
  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
  <span class="visually-hidden" ng-attr-id="{{ $.id }}-previous">Previous</span>
</button>
<button
  ng-if="$.showNavigationArrows"
  class="carousel-control-next"
  type="button"
  ng-click="$.arrowRight()"
  ng-attr-aria-labelledby="{{ $.id }}-next"
>
  <span class="carousel-control-next-icon" aria-hidden="true"></span>
  <span class="visually-hidden" ng-attr-id="{{ $.id }}-next">Next</span>
</button>`,
    "bindings": {
      "animation": "<?",
      "activeId": "@?",
      "interval": "<?",
      "wrap": "<?",
      "keyboard": "<?",
      "pauseOnHover": "<?",
      "pauseOnFocus": "<?",
      "showNavigationArrows": "<?",
      "showNavigationIndicators": "<?",
      "slide": "&?",
      "slid": "&?"
    },
    "transclude": true
  }
};
NgbCarousel.ɵfac.ɵcomponent = true;
NgbCarousel.ɵfac.ɵtype = NgbCarousel;
NgbCarousel.prototype.$postLink = function() {
  this.ngAfterContentInit();
  this.ngAfterViewInit();
  this.ɵngjsViewInitialized = true;
};
NgbCarousel.prototype.$doCheck = function() {
  if (this.ɵngjsViewInitialized) {
    this.ngAfterContentChecked();
  }
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
var NgbCarouselModule = class {
};
NgbCarouselModule.ɵfac = [
  function NgbCarouselModule_Factory() {
    return new (this && this.ɵT || NgbCarouselModule)();
  }
];
NgbCarouselModule.ɵmod = {
  id: "NgbCarouselModule_d050afc4",
  controllerAs: "$"
};
import_angular.default.module("NgbCarouselModule_d050afc4", [
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
]).component("ngbCarousel", {
  controller: NgbCarousel.ɵfac,
  template: `<div class="carousel-indicators" ng-class="{ 'visually-hidden': !$.showNavigationIndicators }" role="tablist">
  <button
    ng-repeat="$slide in $.slides.toArray() track by $slide.id"
    type="button"
    data-bs-target
    ng-class="{ active: $slide.id === $.activeId }"
    role="tab"
    ng-attr-aria-labelledby="slide-{{ $slide.id }}"
    ng-attr-aria-controls="slide-{{ $slide.id }}"
    ng-attr-aria-selected="{{ $slide.id === $.activeId }}"
    ng-click="$.focus(); $.select($slide.id, $.NgbSlideEventSource.INDICATOR)"
  ></button>
</div>
<div class="carousel-inner">
  <div
    ng-repeat="$slide in $.slides.toArray() track by $slide.id"
    class="carousel-item"
    ng-attr-id="slide-{{ $slide.id }}"
    role="tabpanel"
  >
    <span class="visually-hidden">Slide {{ $index + 1 }} of {{ $.slides.length }}</span>
    <ng-container ng-template-outlet="$slide.templateRef"></ng-container>
  </div>
</div>
<button
  ng-if="$.showNavigationArrows"
  class="carousel-control-prev"
  type="button"
  ng-click="$.arrowLeft()"
  ng-attr-aria-labelledby="{{ $.id }}-previous"
>
  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
  <span class="visually-hidden" ng-attr-id="{{ $.id }}-previous">Previous</span>
</button>
<button
  ng-if="$.showNavigationArrows"
  class="carousel-control-next"
  type="button"
  ng-click="$.arrowRight()"
  ng-attr-aria-labelledby="{{ $.id }}-next"
>
  <span class="carousel-control-next-icon" aria-hidden="true"></span>
  <span class="visually-hidden" ng-attr-id="{{ $.id }}-next">Next</span>
</button>`,
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "activeId": "@?",
    "interval": "<?",
    "wrap": "<?",
    "keyboard": "<?",
    "pauseOnHover": "<?",
    "pauseOnFocus": "<?",
    "showNavigationArrows": "<?",
    "showNavigationIndicators": "<?",
    "slide": "&?",
    "slid": "&?"
  }
}).directive("ngbCarousel", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "slide",
          "slid"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbSlide", function() {
  return {
    controller: NgbSlide.ɵfac,
    restrict: "A",
    bindToController: {
      "id": "@?",
      "slid": "&?"
    },
    controllerAs: "ngbSlide"
  };
}).directive("ngbSlide", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        if (element[0].localName !== "ng-template") return;
        [
          "slid"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbCarouselModule_e33d0f2f", NgbCarouselModule.ɵfac).run([
  "NgbCarouselModule_e33d0f2f",
  function() {
  }
]);

// src/app/features/carousel/carousel.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Carousel",
      tabs: [
        {
          name: "Examples",
          to: "/components/carousel/examples"
        },
        {
          name: "Api",
          to: "/components/carousel/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/carousel/",
        ngBootstrap: "components/carousel/overview"
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
              id: "carousel-simple",
              name: "Simple carousel"
            },
            {
              id: "carousel-keyboard",
              name: "Keyboard navigation"
            },
            {
              id: "carousel-controls",
              name: "Pause controls"
            },
            {
              id: "carousel-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./carousel-examples-page.component-QOWRGXST.js").then((m) => m.CarouselExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-carousel",
              name: "NgbCarousel"
            },
            {
              id: "ngb-slide",
              name: "NgbSlide"
            },
            {
              id: "ngb-carousel-config",
              name: "NgbCarouselConfig"
            }
          ]
        },
        loadComponent: () => import("./carousel-api-page.component-US3E4WMY.js").then((m) => m.CarouselApiPageComponent)
      }
    ]
  }
];

// src/app/features/carousel/components/carousel-controls/carousel-controls.component.ts
var CarouselControlsComponent = class {
  onSlide(event) {
    const isArrow = event.source === "arrowLeft" || event.source === "arrowRight";
    if (isArrow && this.unpauseOnArrow) {
      this.carousel?.cycle();
      this.paused = false;
    }
    if (event.source === "indicator" && this.pauseOnIndicator) {
      this.carousel?.pause();
      this.paused = true;
    }
  }
  toggleCycle() {
    if (this.paused) {
      this.carousel?.cycle();
    } else {
      this.carousel?.pause();
    }
    this.paused = !this.paused;
  }
  constructor() {
    this.pauseOnHover = true;
    this.pauseOnFocus = true;
    this.unpauseOnArrow = false;
    this.pauseOnIndicator = false;
    this.paused = false;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-4b73bbc9],.card[_content-4b73bbc9],.dropdown-menu[_content-4b73bbc9],.list-group-item[_content-4b73bbc9],.form-control[_content-4b73bbc9],.form-select[_content-4b73bbc9]{border-color:var(--bs-border-color)}.alert-light[_content-4b73bbc9]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-4b73bbc9],.list-group[_content-4b73bbc9],.dropdown-menu[_content-4b73bbc9]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-4b73bbc9],.btn-outline-secondary[_content-4b73bbc9]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-4b73bbc9],.form-select[_content-4b73bbc9]{background-color:var(--bs-body-bg)}code[_content-4b73bbc9]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CarouselControlsComponent.ɵfac = [
  "$element",
  "$scope",
  function CarouselControlsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CarouselControlsComponent)();
    return instance;
  }
];
CarouselControlsComponent.ɵcmp = {
  selectors: [
    [
      "docs-carousel-controls"
    ]
  ],
  inputs: {},
  outputs: {},
  viewQueries: [
    {
      propertyName: "carousel",
      first: true,
      descendants: true,
      static: false,
      predicate: [
        "carousel"
      ]
    }
  ],
  definition: {
    "templateUrl": "templates/carousel-controls.component-37009d93.html",
    "controllerAs": "example"
  }
};
CarouselControlsComponent.ɵfac.ɵcomponent = true;
CarouselControlsComponent.ɵfac.ɵtype = CarouselControlsComponent;

// src/app/features/carousel/components/carousel-global/carousel-global.component.ts
var CarouselGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      animation: config.animation,
      interval: config.interval,
      wrap: config.wrap,
      pauseOnFocus: config.pauseOnFocus,
      pauseOnHover: config.pauseOnHover,
      showNavigationArrows: config.showNavigationArrows
    };
    config.animation = false;
    config.interval = 2500;
    config.wrap = false;
    config.pauseOnFocus = false;
    config.pauseOnHover = false;
    config.showNavigationArrows = false;
  }
  ngOnDestroy() {
    this.config.animation = this.initialConfig.animation;
    this.config.interval = this.initialConfig.interval;
    this.config.wrap = this.initialConfig.wrap;
    this.config.pauseOnFocus = this.initialConfig.pauseOnFocus;
    this.config.pauseOnHover = this.initialConfig.pauseOnHover;
    this.config.showNavigationArrows = this.initialConfig.showNavigationArrows;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-e4a6577a],.card[_content-e4a6577a],.dropdown-menu[_content-e4a6577a],.list-group-item[_content-e4a6577a],.form-control[_content-e4a6577a],.form-select[_content-e4a6577a]{border-color:var(--bs-border-color)}.alert-light[_content-e4a6577a]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-e4a6577a],.list-group[_content-e4a6577a],.dropdown-menu[_content-e4a6577a]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-e4a6577a],.btn-outline-secondary[_content-e4a6577a]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-e4a6577a],.form-select[_content-e4a6577a]{background-color:var(--bs-body-bg)}code[_content-e4a6577a]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CarouselGlobalComponent.ɵfac = [
  "NgbCarouselConfig_bd078add",
  "$element",
  "$scope",
  function CarouselGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CarouselGlobalComponent)(a0);
    return instance;
  }
];
CarouselGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-carousel-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/carousel-global.component-3703eb8e.html",
    "controllerAs": "example"
  }
};
CarouselGlobalComponent.ɵfac.ɵcomponent = true;
CarouselGlobalComponent.ɵfac.ɵtype = CarouselGlobalComponent;
CarouselGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/carousel/components/carousel-keyboard/carousel-keyboard.component.ts
var CarouselKeyboardComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-f31c02a5],.card[_content-f31c02a5],.dropdown-menu[_content-f31c02a5],.list-group-item[_content-f31c02a5],.form-control[_content-f31c02a5],.form-select[_content-f31c02a5]{border-color:var(--bs-border-color)}.alert-light[_content-f31c02a5]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-f31c02a5],.list-group[_content-f31c02a5],.dropdown-menu[_content-f31c02a5]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-f31c02a5],.btn-outline-secondary[_content-f31c02a5]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-f31c02a5],.form-select[_content-f31c02a5]{background-color:var(--bs-body-bg)}code[_content-f31c02a5]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CarouselKeyboardComponent.ɵfac = [
  "$element",
  "$scope",
  function CarouselKeyboardComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CarouselKeyboardComponent)();
    return instance;
  }
];
CarouselKeyboardComponent.ɵcmp = {
  selectors: [
    [
      "docs-carousel-keyboard"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/carousel-keyboard.component-15b1c1b2.html",
    "controllerAs": "example"
  }
};
CarouselKeyboardComponent.ɵfac.ɵcomponent = true;
CarouselKeyboardComponent.ɵfac.ɵtype = CarouselKeyboardComponent;

// src/app/features/carousel/components/carousel-simple/carousel-simple.component.ts
var CarouselSimpleComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-1069dc53],.card[_content-1069dc53],.dropdown-menu[_content-1069dc53],.list-group-item[_content-1069dc53],.form-control[_content-1069dc53],.form-select[_content-1069dc53]{border-color:var(--bs-border-color)}.alert-light[_content-1069dc53]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-1069dc53],.list-group[_content-1069dc53],.dropdown-menu[_content-1069dc53]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-1069dc53],.btn-outline-secondary[_content-1069dc53]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-1069dc53],.form-select[_content-1069dc53]{background-color:var(--bs-body-bg)}code[_content-1069dc53]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
CarouselSimpleComponent.ɵfac = [
  "$element",
  "$scope",
  function CarouselSimpleComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CarouselSimpleComponent)();
    return instance;
  }
];
CarouselSimpleComponent.ɵcmp = {
  selectors: [
    [
      "docs-carousel-simple"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/carousel-simple.component-812fb694.html",
    "controllerAs": "example"
  }
};
CarouselSimpleComponent.ɵfac.ɵcomponent = true;
CarouselSimpleComponent.ɵfac.ɵtype = CarouselSimpleComponent;

// src/app/features/carousel/carousel.module.ts
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
var CarouselModule = class {
};
CarouselModule.ɵfac = [
  function CarouselModule_Factory() {
    return new (this && this.ɵT || CarouselModule)();
  }
];
var ɵCarouselModule_import0 = RouterModule.forChild(routes);
CarouselModule.ɵmod = {
  id: "CarouselModule_988ecb80"
};
ɵimportProviders(import_angular2.default.module("CarouselModule_988ecb80", [
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCarouselModule === "string" ? NgbCarouselModule : NgbCarouselModule.ɵmod ? NgbCarouselModule.ɵmod.id : NgbCarouselModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  ɵimportedModuleName(ɵCarouselModule_import0)
]), [
  ɵCarouselModule_import0
]).component("docsCarouselControls", {
  controller: CarouselControlsComponent.ɵfac,
  templateUrl: "templates/carousel-controls.component-37009d93.html",
  controllerAs: "example"
}).component("docsCarouselGlobal", {
  controller: CarouselGlobalComponent.ɵfac,
  templateUrl: "templates/carousel-global.component-3703eb8e.html",
  controllerAs: "example"
}).component("docsCarouselKeyboard", {
  controller: CarouselKeyboardComponent.ɵfac,
  templateUrl: "templates/carousel-keyboard.component-15b1c1b2.html",
  controllerAs: "example"
}).component("docsCarouselSimple", {
  controller: CarouselSimpleComponent.ɵfac,
  templateUrl: "templates/carousel-simple.component-812fb694.html",
  controllerAs: "example"
}).factory("CarouselModule_d548ae05", CarouselModule.ɵfac).run([
  "CarouselModule_d548ae05",
  function() {
  }
]);
export {
  CarouselModule
};
