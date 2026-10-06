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
import "./chunk-MTQV7FVC.js";

// src/app/features/carousel/pages/carousel-examples-page/carousel-examples-page.component.ts
var carouselControlsTs = 'import { Component, ViewChild } from "ngjs-core";\n\ninterface CarouselController {\n    cycle(): void;\n    pause(): void;\n}\n\ninterface CarouselSlideEvent {\n    source?: "timer" | "arrowLeft" | "arrowRight" | "indicator";\n}\n\n@Component({\n    selector: "docs-carousel-controls",\n    controllerAs: "example",\n    templateUrl: "carousel-controls.component.html",\n    styleUrl: "./carousel-controls.component.css",\n})\nexport class CarouselControlsComponent {\n    public pauseOnHover = true;\n    public pauseOnFocus = true;\n    public unpauseOnArrow = false;\n    public pauseOnIndicator = false;\n    public paused = false;\n\n    @ViewChild("carousel")\n    private carousel?: CarouselController;\n\n    public onSlide(event: CarouselSlideEvent) {\n        const isArrow = event.source === "arrowLeft" || event.source === "arrowRight";\n\n        if (isArrow && this.unpauseOnArrow) {\n            this.carousel?.cycle();\n            this.paused = false;\n        }\n\n        if (event.source === "indicator" && this.pauseOnIndicator) {\n            this.carousel?.pause();\n            this.paused = true;\n        }\n    }\n\n    public toggleCycle() {\n        if (this.paused) {\n            this.carousel?.cycle();\n        } else {\n            this.carousel?.pause();\n        }\n\n        this.paused = !this.paused;\n    }\n}\n';
var carouselGlobalTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { NgbCarouselConfig } from "ngb-js/carousel";\n\n@Component({\n    selector: "docs-carousel-global",\n    controllerAs: "example",\n    templateUrl: "carousel-global.component.html",\n    styleUrl: "./carousel-global.component.css",\n})\nexport class CarouselGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<\n        NgbCarouselConfig,\n        "animation" | "interval" | "wrap" | "pauseOnFocus" | "pauseOnHover" | "showNavigationArrows"\n    >;\n\n    constructor(private readonly config: NgbCarouselConfig) {\n        this.initialConfig = {\n            animation: config.animation,\n            interval: config.interval,\n            wrap: config.wrap,\n            pauseOnFocus: config.pauseOnFocus,\n            pauseOnHover: config.pauseOnHover,\n            showNavigationArrows: config.showNavigationArrows,\n        };\n\n        config.animation = false;\n        config.interval = 2500;\n        config.wrap = false;\n        config.pauseOnFocus = false;\n        config.pauseOnHover = false;\n        config.showNavigationArrows = false;\n    }\n\n    public ngOnDestroy() {\n        this.config.animation = this.initialConfig.animation;\n        this.config.interval = this.initialConfig.interval;\n        this.config.wrap = this.initialConfig.wrap;\n        this.config.pauseOnFocus = this.initialConfig.pauseOnFocus;\n        this.config.pauseOnHover = this.initialConfig.pauseOnHover;\n        this.config.showNavigationArrows = this.initialConfig.showNavigationArrows;\n    }\n}\n';
var carouselSimpleHtml = '<ngb-carousel aria-label="Featured landscapes">\n    <ng-template ngb-slide id="simple-mountain">\n        <img\n            src="https://picsum.photos/id/944/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="First carousel slide">\n        <div class="carousel-caption d-none d-md-block">\n            <h3 class="h5">Explore new perspectives</h3>\n            <p>Default navigation arrows and indicators are enabled.</p>\n        </div>\n    </ng-template>\n\n    <ng-template ngb-slide id="simple-lake">\n        <img\n            src="https://picsum.photos/id/1011/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Second carousel slide">\n        <div class="carousel-caption d-none d-md-block">\n            <h3 class="h5">Move at your own pace</h3>\n            <p>Use either the controls or the navigation indicators.</p>\n        </div>\n    </ng-template>\n\n    <ng-template ngb-slide id="simple-valley">\n        <img\n            src="https://picsum.photos/id/984/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Third carousel slide">\n        <div class="carousel-caption d-none d-md-block">\n            <h3 class="h5">Ready by default</h3>\n            <p>No local configuration is required.</p>\n        </div>\n    </ng-template>\n</ngb-carousel>\n';
var carouselKeyboardHtml = '<p class="small text-body-secondary mb-3">\n    Click the carousel to focus it, then use the\n    <kbd class="mx-1">←</kbd>\n    and\n    <kbd class="mx-1">→</kbd>\n    keys.\n</p>\n\n<ngb-carousel\n    aria-label="Keyboard-controlled carousel"\n    interval="0"\n    keyboard="true"\n    show-navigation-arrows="false"\n    show-navigation-indicators="false">\n    <ng-template ngb-slide id="keyboard-dog">\n        <img\n            src="https://picsum.photos/id/1025/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Dog wrapped in a blanket">\n    </ng-template>\n\n    <ng-template ngb-slide id="keyboard-river">\n        <img\n            src="https://picsum.photos/id/1035/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="River running through a forest">\n    </ng-template>\n\n    <ng-template ngb-slide id="keyboard-coast">\n        <img\n            src="https://picsum.photos/id/1043/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Rocky coastline">\n    </ng-template>\n</ngb-carousel>\n';
var carouselControlsHtml = `<div class="d-flex flex-column gap-3">
    <div class="row g-3">
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-hover"
                    ng-model="example.pauseOnHover">
                <label class="form-check-label" for="carousel-pause-hover">Pause on hover</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-focus"
                    ng-model="example.pauseOnFocus">
                <label class="form-check-label" for="carousel-pause-focus">Pause on focus</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-unpause-arrows"
                    ng-model="example.unpauseOnArrow">
                <label class="form-check-label" for="carousel-unpause-arrows">Unpause when clicking an arrow</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-indicator"
                    ng-model="example.pauseOnIndicator">
                <label class="form-check-label" for="carousel-pause-indicator">Pause when clicking an indicator</label>
            </div>
        </div>
    </div>

    <div>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.toggleCycle()">
            <i class="bi me-1" ng-class="example.paused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true"></i>
            {{ example.paused ? 'Cycle' : 'Pause' }}
        </button>
    </div>

    <ngb-carousel
        ng-ref="carousel"
        ng-ref-read="ngbCarousel"
        aria-label="Configurable carousel"
        interval="3000"
        pause-on-hover="example.pauseOnHover"
        pause-on-focus="example.pauseOnFocus"
        show-navigation-arrows="true"
        show-navigation-indicators="true"
        slide="example.onSlide($event)">
        <ng-template ngb-slide id="controls-building">
            <img
                src="https://picsum.photos/id/1050/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Building beside the water">
        </ng-template>

        <ng-template ngb-slide id="controls-landscape">
            <img
                src="https://picsum.photos/id/1067/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Open landscape at sunset">
        </ng-template>

        <ng-template ngb-slide id="controls-field">
            <img
                src="https://picsum.photos/id/1074/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Field beneath a cloudy sky">
        </ng-template>

        <ng-template ngb-slide id="controls-hills">
            <img
                src="https://picsum.photos/id/1084/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Hills in warm light">
        </ng-template>
    </ngb-carousel>
</div>
`;
var carouselGlobalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">\n            Slides change every 2.5 seconds without animation, do not pause on hover or focus,\n            hide the arrows and stop after the final slide.\n        </p>\n    </div>\n</div>\n\n<ngb-carousel aria-label="Carousel using global configuration">\n    <ng-template ngb-slide id="global-coast">\n        <img\n            src="https://picsum.photos/id/11/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="First globally configured carousel slide">\n    </ng-template>\n\n    <ng-template ngb-slide id="global-mountains">\n        <img\n            src="https://picsum.photos/id/29/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Second globally configured carousel slide">\n    </ng-template>\n\n    <ng-template ngb-slide id="global-city">\n        <img\n            src="https://picsum.photos/id/42/900/500"\n            class="d-block w-100 h-auto"\n            width="900"\n            height="500"\n            alt="Third globally configured carousel slide">\n    </ng-template>\n</ngb-carousel>\n';
var CarouselExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: carouselSimpleHtml
      },
      keyboard: {
        html: carouselKeyboardHtml
      },
      controls: {
        html: carouselControlsHtml,
        typescript: carouselControlsTs
      },
      global: {
        html: carouselGlobalHtml,
        typescript: carouselGlobalTs
      }
    };
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-d846b87a]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-d846b87a]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-d846b87a]{box-shadow:none}pre[_content-d846b87a]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
CarouselExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function CarouselExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || CarouselExamplesPageComponent)();
    return instance;
  }
];
CarouselExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-carousel-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/carousel-examples-page.component-9edbe1df.html",
    "controllerAs": "$"
  }
};
CarouselExamplesPageComponent.ɵfac.ɵcomponent = true;
CarouselExamplesPageComponent.ɵfac.ɵtype = CarouselExamplesPageComponent;
export {
  CarouselExamplesPageComponent
};
