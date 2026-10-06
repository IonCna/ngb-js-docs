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
  ChangeDetectorRef,
  DestroyRef,
  NgZone,
  Subject,
  distinctUntilChanged,
  inject,
  takeUntil,
  takeUntilDestroyed
} from "./chunk-DXKD6ZA6.js";
import {
  DOCUMENT,
  ElementRef,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// ../ngb-js/dist/chunk-4XYE6WYD.js
var import_angular = __toESM(require_angular(), 1);
function toFragmentElement(container, id) {
  if (!container || id == null) {
    return null;
  }
  return typeof id === "string" ? container.querySelector(`#${CSS.escape(id)}`) : id;
}
function getOrderedFragments(container, fragments) {
  const selector = [
    ...fragments
  ].map(({ id }) => `#${CSS.escape(id)}`).join(",");
  return Array.from(container.querySelectorAll(selector));
}
var defaultProcessChanges = (state, changeActive, ctx) => {
  const { rootElement, fragments, scrollSpy, options, entries } = state;
  const orderedFragments = getOrderedFragments(rootElement, fragments);
  const context = ctx;
  if (!context.initialized) {
    context.initialized = true;
    context.gapFragment = null;
    context.visibleFragments = /* @__PURE__ */ new Set();
    const preSelectedFragment = toFragmentElement(rootElement, options?.initialFragment);
    if (preSelectedFragment) {
      scrollSpy.scrollTo(preSelectedFragment);
      return;
    }
  }
  const visibleFragments = context.visibleFragments;
  for (const entry of entries) {
    const { isIntersecting, target: fragment } = entry;
    if (isIntersecting) {
      if (context.gapFragment) {
        visibleFragments.delete(context.gapFragment);
        context.gapFragment = null;
      }
      visibleFragments.add(fragment);
      continue;
    }
    visibleFragments.delete(fragment);
    if (visibleFragments.size > 0 || scrollSpy.active === "") {
      continue;
    }
    if (entry.boundingClientRect.top < entry.rootBounds.top) {
      context.gapFragment = fragment;
      visibleFragments.add(context.gapFragment);
      continue;
    }
    if (fragment === orderedFragments[0]) {
      context.gapFragment = null;
      visibleFragments.clear();
      changeActive("");
      return;
    }
    const fragmentIndex = orderedFragments.indexOf(fragment);
    context.gapFragment = orderedFragments[fragmentIndex - 1] || null;
    if (context.gapFragment) {
      visibleFragments.add(context.gapFragment);
    }
  }
  for (const fragment of orderedFragments) {
    if (visibleFragments.has(fragment)) {
      changeActive(fragment.id);
      break;
    }
  }
};
var NgbScrollSpyConfig = class {
  constructor() {
    this.scrollBehavior = "smooth";
    this.processChanges = defaultProcessChanges;
  }
};
NgbScrollSpyConfig.ɵfac = [
  function NgbScrollSpyConfig_Factory() {
    return new (this && this.ɵT || NgbScrollSpyConfig)();
  }
];
NgbScrollSpyConfig.ɵprov = {
  token: "NgbScrollSpyConfig_2b54fbda",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbScrollSpyConfig_2b54fbda",
  NgbScrollSpyConfig.ɵfac
]);
var MATCH_THRESHOLD = 3;
var NgbScrollSpyService = class {
  constructor() {
    this._observer = null;
    this._containerElement = null;
    this._fragments = /* @__PURE__ */ new Set();
    this._preRegisteredFragments = /* @__PURE__ */ new Set();
    this._active$ = new Subject();
    this._distinctActive$ = this._active$.pipe(distinctUntilChanged());
    this._active = "";
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyService"] ? globalThis.ɵngjsInjected["NgbScrollSpyService"][0] : inject(NgbScrollSpyConfig);
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyService"] ? globalThis.ɵngjsInjected["NgbScrollSpyService"][1] : inject(DestroyRef, {
      optional: true
    });
    this._destroyed$ = new Subject();
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyService"] ? globalThis.ɵngjsInjected["NgbScrollSpyService"][2] : inject(DOCUMENT);
    this._scrollBehavior = this._config.scrollBehavior;
    this._diChangeDetectorRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyService"] ? globalThis.ɵngjsInjected["NgbScrollSpyService"][3] : inject(ChangeDetectorRef, {
      optional: true
    });
    this._changeDetectorRef = this._diChangeDetectorRef;
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyService"] ? globalThis.ɵngjsInjected["NgbScrollSpyService"][4] : inject(NgZone);
    this._destroyRef?.onDestroy(() => this._destroyed$.next());
    this._distinctActive$.pipe(takeUntil(this._destroyed$)).subscribe((active) => {
      this._active = active;
      this._changeDetectorRef?.markForCheck();
    });
  }
  get active() {
    return this._active;
  }
  get active$() {
    return this._distinctActive$;
  }
  start(options) {
    this._cleanup();
    const { root, rootMargin, scrollBehavior, threshold, fragments, changeDetectorRef, processChanges } = {
      ...options
    };
    this._containerElement = root ?? this._document.documentElement;
    this._changeDetectorRef = changeDetectorRef ?? this._diChangeDetectorRef;
    this._scrollBehavior = scrollBehavior ?? this._config.scrollBehavior;
    const processChangesFn = processChanges ?? this._config.processChanges;
    const context = {};
    this._observer = new IntersectionObserver((entries) => processChangesFn({
      entries,
      rootElement: this._containerElement,
      fragments: this._fragments,
      scrollSpy: this,
      options: {
        ...options
      }
    }, (active) => this._active$.next(active), context), {
      root: root ?? this._document,
      ...rootMargin && {
        rootMargin
      },
      ...threshold && {
        threshold
      }
    });
    for (const element of [
      ...this._preRegisteredFragments,
      ...fragments ?? []
    ]) {
      this.observe(element);
    }
    this._preRegisteredFragments.clear();
  }
  stop() {
    this._cleanup();
    this._active$.next("");
  }
  scrollTo(fragment, options) {
    const { behavior } = {
      behavior: this._scrollBehavior,
      ...options
    };
    if (this._containerElement) {
      const fragmentElement = toFragmentElement(this._containerElement, fragment);
      if (fragmentElement) {
        const heightPx = fragmentElement.offsetTop - this._containerElement.offsetTop;
        this._containerElement.scrollTo({
          top: heightPx,
          behavior
        });
        let lastOffset = this._containerElement.scrollTop;
        let matchCounter = 0;
        const containerElement = this._containerElement;
        this._zone.runOutsideAngular(() => {
          const updateActiveWhenScrollingIsFinished = () => {
            const sameOffsetAsLastTime = lastOffset === containerElement.scrollTop;
            if (sameOffsetAsLastTime) {
              matchCounter++;
            } else {
              matchCounter = 0;
            }
            if (!sameOffsetAsLastTime || sameOffsetAsLastTime && matchCounter < MATCH_THRESHOLD) {
              lastOffset = containerElement.scrollTop;
              requestAnimationFrame(updateActiveWhenScrollingIsFinished);
            } else {
              this._zone.run(() => this._active$.next(fragmentElement.id));
            }
          };
          requestAnimationFrame(updateActiveWhenScrollingIsFinished);
        });
      }
    }
  }
  observe(fragment) {
    if (!this._observer) {
      this._preRegisteredFragments.add(fragment);
      return;
    }
    const fragmentElement = toFragmentElement(this._containerElement, fragment);
    if (fragmentElement && !this._fragments.has(fragmentElement)) {
      this._fragments.add(fragmentElement);
      this._observer.observe(fragmentElement);
    }
  }
  unobserve(fragment) {
    if (!this._observer) {
      this._preRegisteredFragments.delete(fragment);
      return;
    }
    const fragmentElement = toFragmentElement(this._containerElement, fragment);
    if (fragmentElement) {
      this._fragments.delete(fragmentElement);
      this._observer.disconnect();
      for (const fragment2 of this._fragments) {
        this._observer.observe(fragment2);
      }
    }
  }
  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
    this._cleanup();
  }
  _cleanup() {
    this._fragments.clear();
    this._observer?.disconnect();
    this._changeDetectorRef = this._diChangeDetectorRef;
    this._scrollBehavior = this._config.scrollBehavior;
    this._observer = null;
    this._containerElement = null;
  }
};
NgbScrollSpyService.ɵfac = [
  "NgbScrollSpyConfig_2b54fbda",
  "ɵresolve",
  "DOCUMENT_a3a362b8",
  "ɵresolve",
  "NgZone_31031859",
  function NgbScrollSpyService_Factory(i0, i1, i2, i3, i4) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbScrollSpyService": [
        i0,
        i1("DestroyRef_a5c7a091", {
          "optional": true
        }),
        i2,
        i3("ChangeDetectorRef_e2bfcbab", {
          "optional": true
        }),
        i4
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbScrollSpyService)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbScrollSpyService.ɵprov = {
  token: "NgbScrollSpyService_c5e43f01",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbScrollSpyService_c5e43f01",
  NgbScrollSpyService.ɵfac
]);
var NgbScrollSpy = class {
  set active(fragment) {
    this._initialFragment = fragment;
    this.scrollTo(fragment);
  }
  get active() {
    return this._service.active;
  }
  get active$() {
    return this._service.active$;
  }
  ngAfterViewInit() {
    this._service.start({
      processChanges: this.processChanges,
      root: this._nativeElement,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
      ...this._initialFragment && {
        initialFragment: this._initialFragment
      }
    });
  }
  /**
  * @internal
  */
  _registerFragment(fragment) {
    this._service.observe(fragment.id);
  }
  /**
  * @internal
  */
  _unregisterFragment(fragment) {
    this._service.unobserve(fragment.id);
  }
  scrollTo(fragment, options) {
    this._service.scrollTo(fragment, {
      ...this.scrollBehavior && {
        behavior: this.scrollBehavior
      },
      ...options
    });
  }
  constructor() {
    this._initialFragment = null;
    this._service = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpy"] ? globalThis.ɵngjsInjected["NgbScrollSpy"][0] : inject(NgbScrollSpyService);
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpy"] ? globalThis.ɵngjsInjected["NgbScrollSpy"][1] : inject(ElementRef)).nativeElement;
    this.activeChange = this._service.active$;
    this._tabindex = "0";
    this._overflowY = "auto";
  }
};
NgbScrollSpy.ɵfac = [
  "NgbScrollSpyService_c5e43f01",
  "ElementRef_927308a2",
  "$element",
  "$scope",
  function NgbScrollSpy_Factory(i0, i1, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbScrollSpy": [
        i0,
        i1
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbScrollSpy)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._tabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._overflowY;
    }, function(v) {
      v == null ? $element.css("overflow-y", "") : $element.css("overflow-y", v + "");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance._tabindex);
      (function(v) {
        v == null ? $element.css("overflow-y", "") : $element.css("overflow-y", v + "");
      })(instance._overflowY);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
    });
    return instance;
  }
];
NgbScrollSpy.ɵdir = {
  selectors: [
    [
      "",
      "ngbScrollSpy",
      ""
    ]
  ],
  inputs: {
    "processChanges": "processChanges",
    "rootMargin": "rootMargin",
    "scrollBehavior": "scrollBehavior",
    "threshold": "threshold",
    "active": "active"
  },
  outputs: {
    "activeChange": "activeChange"
  },
  exportAs: [
    "ngbScrollSpy"
  ],
  definition: {
    "bindings": {
      "processChanges": "<?",
      "rootMargin": "@?",
      "scrollBehavior": "@?",
      "threshold": "<?",
      "active": "<?",
      "activeChange": "&?"
    }
  }
};
NgbScrollSpy.ɵfac.ɵtype = NgbScrollSpy;
NgbScrollSpy.ɵfac.ɵproviders = [
  {
    token: "NgbScrollSpyService_c5e43f01",
    kind: "class",
    ctor: NgbScrollSpyService
  }
];
NgbScrollSpy.prototype.$postLink = function() {
  this.ngAfterViewInit();
};
var NgbScrollSpyFragment = class {
  get _id() {
    return this.id;
  }
  ngAfterViewInit() {
    this._scrollSpy._registerFragment(this);
  }
  ngOnDestroy() {
    this._scrollSpy._unregisterFragment(this);
  }
  constructor() {
    this._scrollSpy = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyFragment"] ? globalThis.ɵngjsInjected["NgbScrollSpyFragment"][0] : inject(NgbScrollSpy);
  }
};
NgbScrollSpyFragment.ɵfac = [
  "$element",
  "$scope",
  function NgbScrollSpyFragment_Factory($element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbScrollSpyFragment": [
        ɵelementInstance($element, [
          "ngbScrollSpy"
        ], {}, false)
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbScrollSpyFragment)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
      })(instance._id);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgbScrollSpyFragment.ɵdir = {
  selectors: [
    [
      "",
      "ngbScrollSpyFragment",
      ""
    ]
  ],
  inputs: {
    "ngbScrollSpyFragment": "id"
  },
  outputs: {},
  definition: {
    "bindings": {
      "id": "@?ngbScrollSpyFragment"
    }
  }
};
NgbScrollSpyFragment.ɵfac.ɵtype = NgbScrollSpyFragment;
NgbScrollSpyFragment.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbScrollSpyFragment.prototype.$postLink = function() {
  this.ngAfterViewInit();
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
var NgbScrollSpyItem = class {
  // String literal (`ngb-scroll-spy-item="overview"`, como el atributo estático de Angular): binding `@`. Las formas
  // `NgbScrollSpy`/array de upstream no entran por un `@` — el spy explícito va por `scroll-spy`.
  set data(data) {
    if (Array.isArray(data)) {
      this._scrollSpyAPI = data[0];
      this.fragment = data[1];
      this.parent ??= data[2];
    } else if (data instanceof NgbScrollSpy) {
      this._scrollSpyAPI = data;
    } else if (typeof data === "string") {
      this.fragment = data;
    }
  }
  /** El `NgbScrollSpy` al que se engancha el item cuando no está dentro de un `ngbScrollSpyMenu`. */
  set scrollSpy(scrollSpy) {
    if (scrollSpy) this._scrollSpyAPI = scrollSpy;
  }
  isActive() {
    return this._isActive;
  }
  // `@HostBinding` sobre un método observa la referencia de la función (constante):
  // el `$watch` nunca dispararía el cambio. Va sobre un getter, como en el resto
  // del port. Upstream usa `host: { '[class.active]': 'isActive()' }`.
  get _activeClass() {
    return this._isActive;
  }
  ngOnInit() {
    if (!this._scrollSpyMenu) {
      this._scrollSpyAPI.active$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((active) => {
        if (active === this.fragment) {
          this._activate();
        } else {
          this._deactivate();
        }
        this._changeDetector.markForCheck();
      });
    }
  }
  /**
  * @internal
  */
  _activate() {
    this._isActive = true;
    this._scrollSpyMenu?.getItem(this.parent ?? "")?._activate();
  }
  /**
  * @internal
  */
  _deactivate() {
    this._isActive = false;
    this._scrollSpyMenu?.getItem(this.parent ?? "")?._deactivate();
  }
  scrollTo(options) {
    this._scrollSpyAPI.scrollTo(this.fragment, options);
  }
  constructor() {
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyItem"] ? globalThis.ɵngjsInjected["NgbScrollSpyItem"][0] : inject(ChangeDetectorRef);
    this._scrollSpyMenu = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyItem"] ? globalThis.ɵngjsInjected["NgbScrollSpyItem"][1] : inject(NgbScrollSpyMenu, {
      optional: true
    });
    this._scrollSpyAPI = this._scrollSpyMenu ?? (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyItem"] ? globalThis.ɵngjsInjected["NgbScrollSpyItem"][2] : inject(NgbScrollSpyService));
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyItem"] ? globalThis.ɵngjsInjected["NgbScrollSpyItem"][3] : inject(DestroyRef);
    this._isActive = false;
  }
};
NgbScrollSpyItem.ɵfac = [
  "ChangeDetectorRef_e2bfcbab",
  "NgbScrollSpyService_c5e43f01",
  "DestroyRef_a5c7a091",
  "$element",
  "$scope",
  function NgbScrollSpyItem_Factory(i0, i1, i2, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbScrollSpyItem": [
        i0,
        ɵelementInstance2($element, [
          "ngbScrollSpyMenu"
        ], {
          "optional": true
        }, false),
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbScrollSpyItem)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._activeClass;
    }, function(v) {
      v ? $element.addClass("active") : $element.removeClass("active");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v ? $element.addClass("active") : $element.removeClass("active");
      })(instance._activeClass);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.scrollTo();
      } else {
        $scope.$apply(function() {
          instance.scrollTo();
        });
      }
    };
    $element.on("click", ɵhandler0);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      $element.off("click", ɵhandler0);
    });
    return instance;
  }
];
NgbScrollSpyItem.ɵdir = {
  selectors: [
    [
      "",
      "ngbScrollSpyItem",
      ""
    ]
  ],
  inputs: {
    "ngbScrollSpyItem": "data",
    "fragment": "fragment",
    "parent": "parent",
    "scrollSpy": "scrollSpy"
  },
  outputs: {},
  exportAs: [
    "ngbScrollSpyItem"
  ],
  definition: {
    "bindings": {
      "data": "@?ngbScrollSpyItem",
      "fragment": "@?",
      "parent": "@?",
      "scrollSpy": "<?"
    }
  }
};
NgbScrollSpyItem.ɵfac.ɵtype = NgbScrollSpyItem;
NgbScrollSpyItem.prototype.$onInit = function() {
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
var NgbScrollSpyMenu = class {
  /**
  * The `NgbScrollSpy` this menu is bound to. When omitted, the menu falls back
  * to the ambient `NgbScrollSpyService`.
  */
  set scrollSpy(scrollSpy) {
    this._scrollSpyRef = scrollSpy;
  }
  get active() {
    return this._scrollSpyRef.active;
  }
  get active$() {
    return this._scrollSpyRef.active$;
  }
  scrollTo(fragment, options) {
    this._scrollSpyRef.scrollTo(fragment, options);
  }
  getItem(id) {
    return this._map.get(id);
  }
  ngAfterViewInit() {
    this._items.changes.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => this._rebuildMap());
    this._rebuildMap();
    this._scrollSpyRef.active$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((activeId) => {
      this._lastActiveItem?._deactivate();
      const item = this._map.get(activeId);
      if (item) {
        item._activate();
        this._lastActiveItem = item;
      }
    });
  }
  _rebuildMap() {
    this._map.clear();
    for (const item of this._items) {
      this._map.set(item.fragment, item);
    }
  }
  constructor() {
    this._scrollSpyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyMenu"] ? globalThis.ɵngjsInjected["NgbScrollSpyMenu"][0] : inject(NgbScrollSpyService);
    this._destroyRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbScrollSpyMenu"] ? globalThis.ɵngjsInjected["NgbScrollSpyMenu"][1] : inject(DestroyRef);
    this._map = /* @__PURE__ */ new Map();
    this._lastActiveItem = null;
  }
};
NgbScrollSpyMenu.ɵfac = [
  "NgbScrollSpyService_c5e43f01",
  "DestroyRef_a5c7a091",
  "$element",
  "$scope",
  function NgbScrollSpyMenu_Factory(i0, i1, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbScrollSpyMenu": [
        i0,
        i1
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbScrollSpyMenu)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbScrollSpyMenu.ɵdir = {
  selectors: [
    [
      "",
      "ngbScrollSpyMenu",
      ""
    ]
  ],
  inputs: {
    "ngbScrollSpyMenu": "scrollSpy"
  },
  outputs: {},
  queries: [
    {
      propertyName: "_items",
      first: false,
      descendants: true,
      static: false,
      get predicate() {
        return NgbScrollSpyItem;
      }
    }
  ],
  definition: {
    "bindings": {
      "scrollSpy": "<?ngbScrollSpyMenu"
    }
  }
};
NgbScrollSpyMenu.ɵfac.ɵtype = NgbScrollSpyMenu;
NgbScrollSpyMenu.prototype.$postLink = function() {
  this.ngAfterViewInit();
};
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
var NgbScrollSpyModule = class {
};
NgbScrollSpyModule.ɵfac = [
  function NgbScrollSpyModule_Factory() {
    return new (this && this.ɵT || NgbScrollSpyModule)();
  }
];
NgbScrollSpyModule.ɵmod = {
  id: "NgbScrollSpyModule_65dee2fd",
  controllerAs: "$"
};
import_angular.default.module("NgbScrollSpyModule_65dee2fd", []).factory("ɵresolve", [
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
]).directive("ngbScrollSpy", function() {
  return {
    controller: NgbScrollSpy.ɵfac,
    restrict: "A",
    bindToController: {
      "processChanges": "<?",
      "rootMargin": "@?",
      "scrollBehavior": "@?",
      "threshold": "<?",
      "active": "<?",
      "activeChange": "&?"
    },
    controllerAs: "ngbScrollSpy"
  };
}).directive("ngbScrollSpy", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "active-change"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).directive("ngbScrollSpyItem", function() {
  return {
    controller: NgbScrollSpyItem.ɵfac,
    restrict: "A",
    bindToController: {
      "data": "@?ngbScrollSpyItem",
      "fragment": "@?",
      "parent": "@?",
      "scrollSpy": "<?"
    },
    controllerAs: "ngbScrollSpyItem"
  };
}).directive("ngbScrollSpyFragment", function() {
  return {
    controller: NgbScrollSpyFragment.ɵfac,
    restrict: "A",
    bindToController: {
      "id": "@?ngbScrollSpyFragment"
    },
    controllerAs: "ngbScrollSpyFragment"
  };
}).directive("ngbScrollSpyMenu", function() {
  return {
    controller: NgbScrollSpyMenu.ɵfac,
    restrict: "A",
    bindToController: {
      "scrollSpy": "<?ngbScrollSpyMenu"
    },
    controllerAs: "ngbScrollSpyMenu"
  };
}).factory("NgbScrollSpyModule_cb89f530", NgbScrollSpyModule.ɵfac).run([
  "NgbScrollSpyModule_cb89f530",
  function() {
  }
]);

// ../ngb-js/dist/chunk-V54P2627.js
var environment = {
  animation: true,
  transitionTimerDelayMs: 5
};
var NgbConfig = class {
  constructor() {
    this.animation = environment.animation;
  }
};
NgbConfig.ɵfac = [
  function NgbConfig_Factory() {
    return new (this && this.ɵT || NgbConfig)();
  }
];
NgbConfig.ɵprov = {
  token: "NgbConfig_c7257787",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbConfig_c7257787",
  NgbConfig.ɵfac
]);

export {
  NgbConfig,
  NgbScrollSpyService,
  NgbScrollSpyModule
};
