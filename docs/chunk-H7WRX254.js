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
} from "./chunk-T2KZSIKQ.js";
import {
  ApplicationRef,
  ChangeDetectorRef,
  ContentRef,
  Key,
  NgZone,
  ScrollBar,
  Subject,
  TemplateRef,
  createComponent,
  defaultIfEmpty,
  filter,
  finalize,
  fromEvent,
  getFocusableBoundaryElements,
  inject,
  isDefined,
  isPromise,
  ngbFocusTrap,
  ngbRunTransition,
  of,
  reflow,
  take,
  takeUntil,
  zip
} from "./chunk-DXKD6ZA6.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  Injector,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// ../ngb-js/dist/chunk-6P67K7NZ.js
var import_angular = __toESM(require_angular(), 1);
var import_angular2 = __toESM(require_angular(), 1);
var OffcanvasDismissReasons = /* @__PURE__ */ (function(OffcanvasDismissReasons2) {
  OffcanvasDismissReasons2[OffcanvasDismissReasons2["BACKDROP_CLICK"] = 0] = "BACKDROP_CLICK";
  OffcanvasDismissReasons2[OffcanvasDismissReasons2["ESC"] = 1] = "ESC";
  return OffcanvasDismissReasons2;
})({});
var NgbActiveOffcanvas = class {
  close(_result) {
  }
  dismiss(_reason) {
  }
};
var NgbOffcanvasRef = class {
  constructor(panelRef, contentRef, backdropRef, _beforeDismiss) {
    this.panelRef = panelRef;
    this.contentRef = contentRef;
    this.backdropRef = backdropRef;
    this._beforeDismiss = _beforeDismiss;
    this._hidden = new Subject();
    this._dismissed = new Subject();
    this._closed = new Subject();
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {
    });
    if (this.panelRef.instance) {
      this.panelRef.instance.dismissEvent.subscribe((reason) => this.dismiss(reason));
    }
    if (this.backdropRef?.instance) {
      this.backdropRef.instance.dismissEvent.subscribe((reason) => this.dismiss(reason));
    }
  }
  close(result) {
    if (!this.panelRef) return;
    this._closed.next(result);
    this._resolve(result);
    this._removeOffcanvasElements();
  }
  dismiss(reason) {
    if (!this.panelRef) return;
    if (!this._beforeDismiss) {
      this._dismiss(reason);
      return;
    }
    const dismiss = this._beforeDismiss();
    if (isPromise(dismiss)) {
      dismiss.then((result) => {
        if (result !== false) this._dismiss(reason);
      }, () => {
      });
    } else if (dismiss !== false) {
      this._dismiss(reason);
    }
  }
  _dismiss(reason) {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeOffcanvasElements();
  }
  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }
  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }
  get hidden() {
    return this._hidden.asObservable();
  }
  get shown() {
    return this.panelRef.instance?.shown.asObservable();
  }
  get componentInstance() {
    return this.contentRef.componentRef?.instance;
  }
  _removeOffcanvasElements() {
    const panelTransition$ = this.panelRef.instance?.hide();
    const backdropTransition$ = this.backdropRef?.instance?.hide() ?? of(void 0);
    panelTransition$?.subscribe(() => {
      import_angular.default.element(this.panelRef.location.nativeElement).remove();
      this.panelRef.destroy();
      this.contentRef.componentRef?.destroy();
      this.contentRef.viewRef?.destroy();
      this.panelRef = null;
      this.contentRef = null;
    });
    backdropTransition$.subscribe(() => {
      if (!this.backdropRef) return;
      import_angular.default.element(this.backdropRef.location.nativeElement).remove();
      this.backdropRef.destroy();
      this.backdropRef = void 0;
    });
    zip(panelTransition$ ?? of(void 0), backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
};
var NgbOffcanvasConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasConfig"] ? globalThis.ɵngjsInjected["NgbOffcanvasConfig"][0] : inject(NgbConfig);
    this.backdrop = true;
    this.keyboard = true;
    this.position = "start";
    this.scroll = false;
  }
};
NgbOffcanvasConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbOffcanvasConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbOffcanvasConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbOffcanvasConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbOffcanvasConfig.ɵprov = {
  token: "NgbOffcanvasConfig_b4ec4aca",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbOffcanvasConfig_b4ec4aca",
  NgbOffcanvasConfig.ɵfac
]);
var ngbOffcanvasFadeInTransition = (element, animation) => {
  if (animation) {
    reflow(element);
  }
  element.classList.add("show");
};
var ngbOffcanvasFadeOutTransition = (element) => {
  element.classList.remove("show");
};
var BACKDROP_ATTRIBUTES = [
  "animation",
  "backdropClass"
];
var NgbOffcanvasBackdrop = class {
  get _hostClass() {
    return `offcanvas-backdrop${this.backdropClass ? ` ${this.backdropClass}` : ""}`;
  }
  get _fade() {
    return this.animation ?? true;
  }
  ngOnInit() {
    const animation = this.animation ?? true;
    this._zone.onStable.pipe(filter(() => this._nativeElement.isConnected), take(1)).subscribe(() => ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasFadeInTransition, {
      animation,
      runningTransition: "continue"
    }));
    this._zone.runOutsideAngular(() => {
      fromEvent(this._nativeElement, "mousedown").pipe(takeUntil(this._destroyed$)).subscribe(() => this._zone.run(() => this.dismiss()));
    });
  }
  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
  hide() {
    return ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasFadeOutTransition, {
      animation: this.animation ?? true,
      runningTransition: "stop"
    }).pipe(defaultIfEmpty(void 0));
  }
  dismiss() {
    if (this.static) return;
    this.dismissEvent.emit(OffcanvasDismissReasons.BACKDROP_CLICK);
  }
  updateOptions(options) {
    for (const attr of BACKDROP_ATTRIBUTES) {
      if (isDefined(options[attr])) {
        this[attr] = options[attr];
      }
    }
    this._cdRef.markForCheck();
  }
  static get $name() {
    return "ngbOffcanvasBackdrop";
  }
  constructor() {
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"] ? globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"][0] : inject(ElementRef)).nativeElement;
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"] ? globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"][1] : inject(NgZone);
    this._cdRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"] ? globalThis.ɵngjsInjected["NgbOffcanvasBackdrop"][2] : inject(ChangeDetectorRef);
    this.dismissEvent = new EventEmitter();
    this._destroyed$ = new Subject();
  }
};
NgbOffcanvasBackdrop.ɵfac = [
  "ElementRef_927308a2",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbOffcanvasBackdrop_Factory(i0, i1, i2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbOffcanvasBackdrop": [
        i0,
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbOffcanvasBackdrop)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v, old) {
      var ɵnames = function(value) {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(" ");
        return Object.keys(value).filter(function(key) {
          return value[key];
        }).join(" ");
      };
      if (v !== old) $element.removeClass(ɵnames(old));
      $element.addClass(ɵnames(v));
    }, true);
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._fade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        var ɵnames = function(value) {
          if (!value) return "";
          if (typeof value === "string") return value;
          if (Array.isArray(value)) return value.join(" ");
          return Object.keys(value).filter(function(key) {
            return value[key];
          }).join(" ");
        };
        if (v !== void 0) $element.removeClass(ɵnames(void 0));
        $element.addClass(ɵnames(v));
      })(instance._hostClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fade);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
    });
    return instance;
  }
];
NgbOffcanvasBackdrop.ɵcmp = {
  selectors: [
    [
      "ngb-offcanvas-backdrop"
    ]
  ],
  inputs: {
    "animation": "animation",
    "backdropClass": "backdropClass",
    "static": "static"
  },
  outputs: {
    "dismiss": "dismissEvent"
  },
  definition: {
    "template": "",
    "bindings": {
      "animation": "<?",
      "backdropClass": "@?",
      "static": "<?",
      "dismissEvent": "&?dismiss"
    }
  }
};
NgbOffcanvasBackdrop.ɵfac.ɵcomponent = true;
NgbOffcanvasBackdrop.ɵfac.ɵtype = NgbOffcanvasBackdrop;
NgbOffcanvasBackdrop.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbOffcanvasBackdrop.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
var ngbOffcanvasPanelShowTransition = (element, animation) => {
  if (animation) {
    reflow(element);
  }
  element.classList.add("show", "showing");
  return () => {
    element.classList.remove("showing");
  };
};
var ngbOffcanvasPanelHideTransition = (element) => {
  element.classList.remove("showing");
  element.classList.add("hiding");
  return () => {
    element.classList.remove("show", "hiding");
  };
};
var PANEL_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "keyboard",
  "panelClass",
  "position"
];
var NgbOffcanvasPanel = class {
  get _hostClass() {
    return `offcanvas offcanvas-${this.position}${this.panelClass ? ` ${this.panelClass}` : ""}`;
  }
  get _ariaLabelledBy() {
    return this.ariaLabelledBy;
  }
  get _ariaDescribedBy() {
    return this.ariaDescribedBy;
  }
  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    this._zone.onStable.pipe(filter(() => this._nativeElement.isConnected), take(1)).subscribe(() => this._show());
  }
  ngOnDestroy() {
    this._disableEventHandling();
  }
  dismiss(reason) {
    this.dismissEvent.emit(reason);
  }
  updateOptions(options) {
    for (const optionName of PANEL_ATTRIBUTES) {
      if (isDefined(options[optionName])) {
        this[optionName] = options[optionName];
      }
    }
    this._cdRef.markForCheck();
  }
  hide() {
    const context = {
      animation: Boolean(this.animation),
      runningTransition: "stop"
    };
    const offcanvasTransition$ = ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasPanelHideTransition, context).pipe(defaultIfEmpty(void 0));
    offcanvasTransition$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });
    this._disableEventHandling();
    this._restoreFocus();
    return offcanvasTransition$;
  }
  _show() {
    const context = {
      animation: Boolean(this.animation),
      runningTransition: "continue"
    };
    const offcanvasTransition$ = ngbRunTransition(this._zone, this._nativeElement, ngbOffcanvasPanelShowTransition, context).pipe(defaultIfEmpty(void 0));
    offcanvasTransition$.subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });
    this._enableEventHandling();
    this._setFocus();
  }
  _enableEventHandling() {
    this._zone.runOutsideAngular(() => {
      fromEvent(this._nativeElement, "keydown").pipe(takeUntil(this._closed$), filter((event) => event.which === Key.Escape)).subscribe((event) => {
        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this._zone.run(() => this.dismiss(OffcanvasDismissReasons.ESC));
            }
          });
        }
      });
    });
  }
  _disableEventHandling() {
    this._closed$.next();
  }
  _setFocus() {
    const native = this._nativeElement;
    if (!native.contains(document.activeElement)) {
      const autoFocusable = native.querySelector("[ngbAutofocus]");
      const [firstFocusable] = getFocusableBoundaryElements(native);
      const elementToFocus = autoFocusable || firstFocusable || native;
      elementToFocus.focus();
    }
  }
  _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;
    const validElementToFocus = elWithFocus instanceof HTMLElement && body.contains(elWithFocus);
    const elementToFocus = validElementToFocus ? elWithFocus : body;
    this._zone.runOutsideAngular(() => setTimeout(() => elementToFocus.focus()));
    this._elWithFocus = null;
  }
  static get $name() {
    return "ngbOffcanvasPanel";
  }
  constructor() {
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasPanel"] ? globalThis.ɵngjsInjected["NgbOffcanvasPanel"][0] : inject(ElementRef)).nativeElement;
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasPanel"] ? globalThis.ɵngjsInjected["NgbOffcanvasPanel"][1] : inject(NgZone);
    this._cdRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasPanel"] ? globalThis.ɵngjsInjected["NgbOffcanvasPanel"][2] : inject(ChangeDetectorRef);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasPanel"] ? globalThis.ɵngjsInjected["NgbOffcanvasPanel"][3] : inject(DOCUMENT);
    this.keyboard = true;
    this.position = "start";
    this.dismissEvent = new EventEmitter();
    this.shown = new Subject();
    this.hidden = new Subject();
    this._elWithFocus = null;
    this._closed$ = new Subject();
    this._role = "dialog";
    this._tabindex = -1;
    this._ariaModal = true;
  }
};
NgbOffcanvasPanel.ɵfac = [
  "ElementRef_927308a2",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "DOCUMENT_a3a362b8",
  "$element",
  "$scope",
  function NgbOffcanvasPanel_Factory(i0, i1, i2, i3, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbOffcanvasPanel": [
        i0,
        i1,
        i2,
        i3
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbOffcanvasPanel)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
    }, function(v, old) {
      var ɵnames = function(value) {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(" ");
        return Object.keys(value).filter(function(key) {
          return value[key];
        }).join(" ");
      };
      if (v !== old) $element.removeClass(ɵnames(old));
      $element.addClass(ɵnames(v));
    }, true);
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._tabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaModal;
    }, function(v) {
      v == null ? $element.removeAttr("aria-modal") : $element.attr("aria-modal", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._ariaLabelledBy;
    }, function(v) {
      v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._ariaDescribedBy;
    }, function(v) {
      v == null ? $element.removeAttr("aria-describedby") : $element.attr("aria-describedby", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        var ɵnames = function(value) {
          if (!value) return "";
          if (typeof value === "string") return value;
          if (Array.isArray(value)) return value.join(" ");
          return Object.keys(value).filter(function(key) {
            return value[key];
          }).join(" ");
        };
        if (v !== void 0) $element.removeClass(ɵnames(void 0));
        $element.addClass(ɵnames(v));
      })(instance._hostClass);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance._tabindex);
      (function(v) {
        v == null ? $element.removeAttr("aria-modal") : $element.attr("aria-modal", String(v));
      })(instance._ariaModal);
      (function(v) {
        v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
      })(instance._ariaLabelledBy);
      (function(v) {
        v == null ? $element.removeAttr("aria-describedby") : $element.attr("aria-describedby", String(v));
      })(instance._ariaDescribedBy);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
    });
    return instance;
  }
];
NgbOffcanvasPanel.ɵcmp = {
  selectors: [
    [
      "ngb-offcanvas-panel"
    ]
  ],
  inputs: {
    "animation": "animation",
    "ariaLabelledBy": "ariaLabelledBy",
    "ariaDescribedBy": "ariaDescribedBy",
    "keyboard": "keyboard",
    "panelClass": "panelClass",
    "position": "position"
  },
  outputs: {
    "dismiss": "dismissEvent"
  },
  definition: {
    "template": "<ng-content></ng-content>",
    "bindings": {
      "animation": "<?",
      "ariaLabelledBy": "@?",
      "ariaDescribedBy": "@?",
      "keyboard": "<?",
      "panelClass": "@?",
      "position": "@?",
      "dismissEvent": "&?dismiss"
    },
    "transclude": true
  }
};
NgbOffcanvasPanel.ɵfac.ɵcomponent = true;
NgbOffcanvasPanel.ɵfac.ɵtype = NgbOffcanvasPanel;
NgbOffcanvasPanel.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbOffcanvasPanel.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
var NgbOffcanvasStack = class {
  constructor() {
    this._applicationRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasStack"] ? globalThis.ɵngjsInjected["NgbOffcanvasStack"][0] : inject(ApplicationRef);
    this._scrollBar = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasStack"] ? globalThis.ɵngjsInjected["NgbOffcanvasStack"][1] : inject(ScrollBar);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvasStack"] ? globalThis.ɵngjsInjected["NgbOffcanvasStack"][2] : inject(NgZone);
    this._scrollBarRestoreFn = null;
    this._activePanelCmptHasChanged = new Subject();
    this._activeInstance = new Subject();
    this._activePanelCmptHasChanged.subscribe(() => {
      if (this._panelRef) {
        ngbFocusTrap(this._ngZone, this._panelRef.location.nativeElement, this._activePanelCmptHasChanged);
      }
    });
  }
  open(_contentInjector, content, options) {
    const container = this._resolveContainer(options.container);
    if (!container) {
      throw new Error(`The specified offcanvas container "${options.container || "body"}" was not found in the DOM.`);
    }
    if (!options.scroll) {
      this._hideScrollBar();
    }
    const activeOffcanvas = new NgbActiveOffcanvas();
    return Promise.all([
      options.backdrop !== false ? this._attachBackdrop(container, options) : Promise.resolve(void 0),
      this._getContentRef(content, activeOffcanvas, options, _contentInjector)
    ]).then(([backdropRef, contentRef]) => this._attachPanelComponent(container, contentRef, options).then((panelRef) => {
      const ngbOffcanvasRef = new NgbOffcanvasRef(panelRef, contentRef, backdropRef, options.beforeDismiss);
      activeOffcanvas.close = (result) => ngbOffcanvasRef.close(result);
      activeOffcanvas.dismiss = (reason) => ngbOffcanvasRef.dismiss(reason);
      panelRef.instance.updateOptions(options);
      if (backdropRef) {
        backdropRef.instance.updateOptions(options);
        backdropRef.instance.static = options.backdrop === "static";
      }
      this._registerOffcanvasRef(ngbOffcanvasRef);
      this._registerPanelRef(panelRef);
      ngbOffcanvasRef.hidden.pipe(finalize(() => this._restoreScrollBar())).subscribe();
      backdropRef?.changeDetectorRef.detectChanges();
      panelRef.changeDetectorRef.detectChanges();
      return ngbOffcanvasRef;
    }));
  }
  get activeInstance() {
    return this._activeInstance.asObservable();
  }
  dismiss(reason) {
    this._offcanvasRef?.dismiss(reason);
  }
  hasOpenOffcanvas() {
    return !!this._offcanvasRef;
  }
  _attachBackdrop(container, options) {
    return this._createRootComponent(NgbOffcanvasBackdrop.$name, {
      bindings: {
        animation: options.animation,
        backdropClass: options.backdropClass
      }
    }).then((ref) => {
      container.appendChild(ref.location.nativeElement);
      return ref;
    });
  }
  _attachPanelComponent(container, contentRef, options) {
    return this._createRootComponent(NgbOffcanvasPanel.$name, {
      projectableNodes: contentRef.nodes,
      bindings: {
        animation: options.animation,
        panelClass: options.panelClass,
        position: options.position
      }
    }).then((ref) => {
      container.appendChild(ref.location.nativeElement);
      return ref;
    });
  }
  _getContentRef(content, activeOffcanvas, options, contentInjector) {
    if (!content) {
      return Promise.resolve(new ContentRef([]));
    }
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeOffcanvas,
        close: (result) => activeOffcanvas.close(result),
        dismiss: (reason) => activeOffcanvas.dismiss(reason)
      });
      this._applicationRef.attachView(viewRef);
      return Promise.resolve(new ContentRef(() => [
        viewRef.rootNodes
      ], viewRef));
    }
    return this._createRootComponent(content, {
      environmentInjector: options.injector || contentInjector,
      bindings: {
        ...options.bindings,
        ngbActiveOffcanvas: activeOffcanvas
      }
    }).then((componentRef) => new ContentRef([
      [
        componentRef.location.nativeElement
      ]
    ], void 0, componentRef));
  }
  _createRootComponent(component, options) {
    return Promise.resolve(createComponent(component, {
      environmentInjector: this._applicationRef.injector,
      ...options
    })).then((componentRef) => {
      try {
        this._applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.markForCheck();
      } catch (error) {
        componentRef.destroy();
        throw error;
      }
      componentRef.onDestroy(() => this._applicationRef.detachView(componentRef.hostView));
      return componentRef;
    });
  }
  _resolveContainer(container) {
    if (typeof container === "string") {
      return document.querySelector(container) ?? void 0;
    }
    if (container) {
      return container;
    }
    return document.body;
  }
  _registerOffcanvasRef(ngbOffcanvasRef) {
    const unregisterOffcanvasRef = () => {
      this._offcanvasRef = void 0;
      this._activeInstance.next(this._offcanvasRef);
    };
    this._offcanvasRef = ngbOffcanvasRef;
    this._activeInstance.next(this._offcanvasRef);
    ngbOffcanvasRef.result?.then(unregisterOffcanvasRef, unregisterOffcanvasRef);
  }
  _registerPanelRef(panelRef) {
    this._panelRef = panelRef;
    this._activePanelCmptHasChanged.next();
    panelRef.onDestroy(() => {
      this._panelRef = void 0;
      this._activePanelCmptHasChanged.next();
    });
  }
  _restoreScrollBar() {
    const scrollBarRestoreFn = this._scrollBarRestoreFn;
    if (scrollBarRestoreFn) {
      this._scrollBarRestoreFn = null;
      scrollBarRestoreFn();
    }
  }
  _hideScrollBar() {
    if (!this._scrollBarRestoreFn) {
      this._scrollBarRestoreFn = this._scrollBar.hide();
    }
  }
  static get $name() {
    return "ngb.offcanvas.stack.service";
  }
};
NgbOffcanvasStack.ɵfac = [
  "ApplicationRef_584e852c",
  "ScrollBar_ab27c796",
  "NgZone_31031859",
  function NgbOffcanvasStack_Factory(i0, i1, i2) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbOffcanvasStack": [
        i0,
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbOffcanvasStack)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbOffcanvasStack.ɵprov = {
  token: "NgbOffcanvasStack_7b2dd8a9"
};
var NgbOffcanvas = class {
  /**
  * Abre un offcanvas con el contenido y las opciones dadas.
  *
  * ADAPTACIÓN: `createComponent` de `ngjs-core` es async, así que `open()`
  * devuelve una `Promise<NgbOffcanvasRef>` (upstream es sync). Ver CORE_GAPS.
  */
  open(content, options = {}) {
    const combinedOptions = {
      ...this._config,
      animation: this._config.animation,
      ...options
    };
    return this._offcanvasStack.open(this._injector, content, combinedOptions);
  }
  /** Observable con la instancia de offcanvas activa. */
  get activeInstance() {
    return this._offcanvasStack.activeInstance;
  }
  /** Descarta el offcanvas abierto con la razón dada. */
  dismiss(reason) {
    this._offcanvasStack.dismiss(reason);
  }
  /** `true` si hay un offcanvas abierto en la app. */
  hasOpenOffcanvas() {
    return this._offcanvasStack.hasOpenOffcanvas();
  }
  constructor() {
    this._injector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvas"] ? globalThis.ɵngjsInjected["NgbOffcanvas"][0] : inject(Injector);
    this._offcanvasStack = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvas"] ? globalThis.ɵngjsInjected["NgbOffcanvas"][1] : inject(NgbOffcanvasStack);
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbOffcanvas"] ? globalThis.ɵngjsInjected["NgbOffcanvas"][2] : inject(NgbOffcanvasConfig);
  }
};
NgbOffcanvas.ɵfac = [
  "Injector_125f3b76",
  "NgbOffcanvasStack_7b2dd8a9",
  "NgbOffcanvasConfig_b4ec4aca",
  function NgbOffcanvas_Factory(i0, i1, i2) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbOffcanvas": [
        i0,
        i1,
        i2
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbOffcanvas)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbOffcanvas.ɵprov = {
  token: "NgbOffcanvas_51c49d46",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbOffcanvas_51c49d46",
  NgbOffcanvas.ɵfac
]);
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
var NgbOffcanvasModule = class {
};
NgbOffcanvasModule.ɵfac = [
  function NgbOffcanvasModule_Factory() {
    return new (this && this.ɵT || NgbOffcanvasModule)();
  }
];
NgbOffcanvasModule.ɵmod = {
  id: "NgbOffcanvasModule_4c898d65",
  controllerAs: "$"
};
import_angular2.default.module("NgbOffcanvasModule_4c898d65", [
  typeof CommonModule === "string" ? CommonModule : CommonModule.ɵmod ? CommonModule.ɵmod.id : CommonModule.name
]).factory("NgbOffcanvasStack_7b2dd8a9", Object.prototype.hasOwnProperty.call(NgbOffcanvasStack, "ɵprov") && NgbOffcanvasStack.ɵprov.factory || (Object.prototype.hasOwnProperty.call(NgbOffcanvasStack, "ɵfac") ? NgbOffcanvasStack.ɵfac : NgbOffcanvasStack.ɵfac ? (function() {
  throw new Error('"' + NgbOffcanvasStack.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new NgbOffcanvasStack();
  }
])).factory("ɵresolve", [
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
]).component("ngbOffcanvasPanel", {
  controller: NgbOffcanvasPanel.ɵfac,
  template: "<ng-content></ng-content>",
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "ariaLabelledBy": "@?",
    "ariaDescribedBy": "@?",
    "keyboard": "<?",
    "panelClass": "@?",
    "position": "@?",
    "dismissEvent": "&?dismiss"
  }
}).directive("ngbOffcanvasPanel", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "dismiss"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).component("ngbOffcanvasBackdrop", {
  controller: NgbOffcanvasBackdrop.ɵfac,
  template: "",
  controllerAs: "$",
  bindings: {
    "animation": "<?",
    "backdropClass": "@?",
    "static": "<?",
    "dismissEvent": "&?dismiss"
  }
}).directive("ngbOffcanvasBackdrop", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "dismiss"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbOffcanvasModule_c629d278", NgbOffcanvasModule.ɵfac).run([
  "NgbOffcanvasModule_c629d278",
  function() {
  }
]);

export {
  NgbOffcanvasModule
};
