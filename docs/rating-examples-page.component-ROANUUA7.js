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
import "./chunk-57M53B5Q.js";

// src/app/features/rating/pages/rating-examples-page/rating-examples-page.component.ts
var basicTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-basic-rating",\n    controllerAs: "example",\n    templateUrl: "./basic-rating.component.html",\n    styleUrl: "./basic-rating.component.css",\n})\nexport class BasicRatingComponent {\n    public rating = 3;\n    public setRating(rating: number) { this.rating = rating; }\n}\n';
var basicHtml = '<ngb-rating rate="example.rating" rate-change="example.setRating($event)"></ngb-rating>\n<hr>\n<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>\n';
var customTemplateCss = ".star { color: var(--bs-secondary-color); font-size: 2.1rem; padding-right: .15rem; filter: drop-shadow(0 .2rem .35rem rgba(var(--bs-body-color-rgb), .1)); }\n.star.filled { color: var(--bs-warning); }\n.star.filled.low { color: var(--bs-danger); }\n";
var customTemplateTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-rating-custom-template",\n    controllerAs: "example",\n    templateUrl: "./rating-custom-template.component.html",\n    styleUrl: "./rating-custom-template.component.css",\n})\nexport class RatingCustomTemplateComponent {\n    public rating = 6;\n    public setRating(rating: number) { this.rating = rating; }\n}\n';
var customTemplateHtml = `<p>Bootstrap Icons are rendered through a child <code>ng-template</code>.</p>
<ngb-rating rate="example.rating" rate-change="example.setRating($event)">
    <ng-template let-fill="fill" let-index="index">
        <i class="bi star" ng-class="[fill === 100 ? 'bi-star-fill filled' : 'bi-star', { low: index < 3 }]" aria-hidden="true"></i>
    </ng-template>
</ngb-rating>
<hr>
<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>
`;
var decimalCss = ".heart { color: var(--bs-secondary-bg); display: inline-block; font-size: 2.35rem; margin-right: .15rem; position: relative; filter: drop-shadow(0 .25rem .45rem rgba(var(--bs-body-color-rgb), .1)); }\n.heart .fill { color: var(--bs-danger); left: 0; overflow: hidden; position: absolute; top: 0; }\n";
var decimalTs = 'import { Component, type TemplateRef } from "ngjs-core";\n\n@Component({\n    selector: "docs-rating-decimal",\n    controllerAs: "example",\n    templateUrl: "./rating-decimal.component.html",\n    styleUrl: "./rating-decimal.component.css",\n})\nexport class RatingDecimalComponent {\n    public rating = 3.14;\n    public heartTemplate?: TemplateRef<unknown>;\n    public readonly ariaValueText = (current: number, max: number) => `${current} out of ${max} hearts`;\n}\n';
var decimalHtml = `<ng-template ng-ref="example.heartTemplate" let-fill="fill">
    <span class="heart">
        <i class="bi bi-heart-fill" aria-hidden="true"></i>
        <span class="fill" ng-style="{ width: fill + '%' }"><i class="bi bi-heart-fill" aria-hidden="true"></i></span>
    </span>
</ng-template>

<ngb-rating rate="example.rating" max="5" readonly="true" star-template="example.heartTemplate" aria-value-text="example.ariaValueText"></ngb-rating>
<hr>
<p>Rate: <strong>{{ example.rating }}</strong></p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.rating = 1.35">1.35</button>
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.rating = 4.72">4.72</button>
</div>
`;
var eventsTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-rating-events",\n    controllerAs: "example",\n    templateUrl: "./rating-events.component.html",\n    styleUrl: "./rating-events.component.css",\n})\nexport class RatingEventsComponent {\n    public selected = 0;\n    public hovered = 0;\n    public readonly = false;\n    public setSelected(value: number) { this.selected = value; }\n    public setHovered(value: number) { this.hovered = value; }\n}\n';
var eventsHtml = `<ngb-rating rate="example.selected" rate-change="example.setSelected($event)" hover="example.setHovered($event)" leave="example.setHovered(0)" readonly="example.readonly"></ngb-rating>
<hr>
<dl class="row mb-3">
    <dt class="col-auto">Selected</dt><dd class="col mb-0">{{ example.selected }}</dd>
    <dt class="col-auto">Hovered</dt><dd class="col mb-0">{{ example.hovered }}</dd>
</dl>
<button type="button" class="btn btn-sm" ng-class="example.readonly ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.readonly = !example.readonly">
    {{ example.readonly ? 'Read-only' : 'Editable' }}
</button>
`;
var formTs = 'import { Component } from "ngjs-core";\nimport type { IFormController } from "angular";\n\n@Component({\n    selector: "docs-rating-form",\n    controllerAs: "example",\n    templateUrl: "./rating-form.component.html",\n    styleUrl: "./rating-form.component.css",\n})\nexport class RatingFormComponent {\n    public rating: number | null = null;\n    public disabled = false;\n    public form?: IFormController;\n\n    public setRating(rating: number) { this.rating = rating; }\n    public clear() { this.rating = null; }\n}\n';
var formHtml = `<form name="example.form" novalidate>
    <ngb-rating rate="example.rating" rate-change="example.setRating($event)" disabled="example.disabled"></ngb-rating>
    <input class="visually-hidden" type="number" name="rating" ng-model="example.rating" min="1" required disabled="example.disabled" tabindex="-1" aria-hidden="true">

    <p class="small mt-2 mb-3" ng-class="example.form.rating.$valid ? 'text-success' : 'text-danger'">
        {{ example.form.rating.$valid ? 'Thanks!' : 'Please rate us' }}
    </p>

    <p>Model: <strong>{{ example.rating === null ? 'null' : example.rating }}</strong></p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-sm" ng-class="example.disabled ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.disabled = !example.disabled">
            {{ example.disabled ? 'Control disabled' : 'Control enabled' }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.clear()">Clear</button>
    </div>
</form>
`;
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbRatingConfig } from "ngb-js/rating";\n\n@Component({\n    selector: "docs-rating-global",\n    controllerAs: "example",\n    templateUrl: "./rating-global.component.html",\n    styleUrl: "./rating-global.component.css",\n})\nexport class RatingGlobalComponent implements AfterViewInit, OnDestroy {\n    private readonly initialConfig: Pick<NgbRatingConfig, "max" | "readonly" | "resettable" | "tabindex">;\n\n    constructor(private readonly config: NgbRatingConfig) {\n        this.initialConfig = {\n            max: config.max,\n            readonly: config.readonly,\n            resettable: config.resettable,\n            tabindex: config.tabindex,\n        };\n        config.max = 5;\n        config.readonly = true;\n        config.resettable = true;\n        config.tabindex = -1;\n    }\n\n    public ngAfterViewInit() { this.restoreConfig(); }\n    public ngOnDestroy() { this.restoreConfig(); }\n    private restoreConfig() { Object.assign(this.config, this.initialConfig); }\n}\n';
var globalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div><p class="fw-semibold mb-1">Customized defaults</p><p class="small text-body-secondary mb-0">Five stars, read-only behavior and no keyboard tab stop.</p></div>\n</div>\n\n<ngb-rating rate="3"></ngb-rating>\n';
var RatingExamplesPageComponent = class {
  constructor() {
    this.examples = {
      basic: {
        html: basicHtml,
        typescript: basicTs
      },
      events: {
        html: eventsHtml,
        typescript: eventsTs
      },
      customTemplate: {
        html: customTemplateHtml,
        typescript: customTemplateTs,
        css: customTemplateCss
      },
      decimal: {
        html: decimalHtml,
        typescript: decimalTs,
        css: decimalCss
      },
      form: {
        html: formHtml,
        typescript: formTs
      },
      global: {
        html: globalHtml,
        typescript: globalTs
      }
    };
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-b6f5616d]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-b6f5616d]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-b6f5616d]{box-shadow:none}pre[_content-b6f5616d]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
RatingExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function RatingExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || RatingExamplesPageComponent)();
    return instance;
  }
];
RatingExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-rating-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/rating-examples-page.component-917098cf.html",
    "controllerAs": "$"
  }
};
RatingExamplesPageComponent.ɵfac.ɵcomponent = true;
RatingExamplesPageComponent.ɵfac.ɵtype = RatingExamplesPageComponent;
export {
  RatingExamplesPageComponent
};
