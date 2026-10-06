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

// src/app/features/timepicker/pages/timepicker-examples-page/timepicker-examples-page.component.ts
var adapterTs = 'import { Component, type DoCheck } from "ngjs-core";\nimport { NgbTimeAdapter, type NgbTimeStruct } from "ngb-js/timepicker";\n\nconst pad = (value: number): string => value.toString().padStart(2, "0");\n\nexport class NgbTimeStringAdapter extends NgbTimeAdapter<string> {\n    public fromModel(value: string | null): NgbTimeStruct | null {\n        if (!value) return null;\n        const [hour, minute, second] = value.split(":").map(Number);\n        return { hour, minute, second };\n    }\n\n    public toModel(time: NgbTimeStruct | null): string | null {\n        return time ? `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second ?? 0)}` : null;\n    }\n}\n\n@Component({\n    selector: "docs-timepicker-custom-adapter",\n    controllerAs: "example",\n    templateUrl: "./timepicker-custom-adapter.component.html",\n    styleUrl: "./timepicker-custom-adapter.component.css",\n})\nexport class TimepickerCustomAdapterComponent implements DoCheck {\n    public readonly adapter = new NgbTimeStringAdapter();\n    public time = this.adapter.fromModel("13:30:00");\n    public model = "13:30:00";\n\n    public ngDoCheck(): void {\n        this.model = this.adapter.toModel(this.time) ?? "";\n    }\n}\n';
var adapterHtml = '<p>This adapter represents the application model as an <code>HH:mm:ss</code> string.</p>\n<div class="d-flex flex-column align-items-start gap-3">\n    <ngb-timepicker ng-model="example.time" seconds="true"></ngb-timepicker>\n    <hr class="w-100 my-0">\n    <pre class="w-100 mb-0">String model: {{ example.model }}</pre>\n</div>\n';
var basicTs = 'import { Component } from "ngjs-core";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-basic-timepicker",\n    controllerAs: "example",\n    templateUrl: "./basic-timepicker.component.html",\n    styleUrl: "./basic-timepicker.component.css",\n})\nexport class BasicTimepickerComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\n}\n';
var basicHtml = '<div class="d-flex flex-column align-items-start gap-3">\n    <ngb-timepicker ng-model="example.time"></ngb-timepicker>\n    <hr class="w-100 my-0">\n    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\n</div>\n';
var i18nTs = 'import { Component, Injectable } from "ngjs-core";\nimport { NgbTimepickerI18n, type NgbTimeStruct } from "ngb-js/timepicker";\n\n@Injectable()\nexport class GreekTimepickerI18n extends NgbTimepickerI18n {\n    public getMorningPeriod(): string { return "π.μ."; }\n    public getAfternoonPeriod(): string { return "μ.μ."; }\n}\n\n@Component({\n    selector: "docs-timepicker-i18n",\n    controllerAs: "example",\n    templateUrl: "./timepicker-i18n.component.html",\n    styleUrl: "./timepicker-i18n.component.css",\n    providers: [{ provide: NgbTimepickerI18n, useClass: GreekTimepickerI18n }],\n})\nexport class TimepickerI18nComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\n    constructor(public readonly i18n: NgbTimepickerI18n) {}\n}\n';
var i18nHtml = '<div class="alert alert-light border" role="note">\n    Greek period labels supplied by a custom <code>NgbTimepickerI18n</code>:\n    <strong>{{ example.i18n.getMorningPeriod() }}</strong> / <strong>{{ example.i18n.getAfternoonPeriod() }}</strong>\n</div>\n\n<div class="d-flex align-items-start">\n    <ngb-timepicker ng-model="example.time" meridian="true"></ngb-timepicker>\n</div>\n';
var meridianTs = 'import { Component } from "ngjs-core";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-meridian-timepicker",\n    controllerAs: "example",\n    templateUrl: "./meridian-timepicker.component.html",\n    styleUrl: "./meridian-timepicker.component.css",\n})\nexport class MeridianTimepickerComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\n    public meridian = true;\n}\n';
var meridianHtml = `<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" meridian="example.meridian"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.meridian ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.meridian = !example.meridian">
        Meridian {{ example.meridian ? 'on' : 'off' }}
    </button>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`;
var secondsTs = 'import { Component } from "ngjs-core";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-seconds-timepicker",\n    controllerAs: "example",\n    templateUrl: "./seconds-timepicker.component.html",\n    styleUrl: "./seconds-timepicker.component.css",\n})\nexport class SecondsTimepickerComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 25 };\n    public seconds = true;\n}\n';
var secondsHtml = `<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" seconds="example.seconds"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.seconds ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.seconds = !example.seconds">
        Seconds {{ example.seconds ? 'on' : 'off' }}
    </button>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`;
var spinnersTs = 'import { Component } from "ngjs-core";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-spinners-timepicker",\n    controllerAs: "example",\n    templateUrl: "./spinners-timepicker.component.html",\n    styleUrl: "./spinners-timepicker.component.css",\n})\nexport class SpinnersTimepickerComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\n    public spinners = true;\n}\n';
var spinnersHtml = `<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" spinners="example.spinners"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.spinners ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.spinners = !example.spinners">
        Spinners {{ example.spinners ? 'on' : 'off' }}
    </button>
</div>
`;
var stepsTs = 'import { Component } from "ngjs-core";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-timepicker-custom-steps",\n    controllerAs: "example",\n    templateUrl: "./timepicker-custom-steps.component.html",\n    styleUrl: "./timepicker-custom-steps.component.css",\n})\nexport class TimepickerCustomStepsComponent {\n    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\n    public hourStep = 1;\n    public minuteStep = 15;\n    public secondStep = 30;\n}\n';
var stepsHtml = '<div class="d-flex flex-column align-items-start gap-3">\n    <ngb-timepicker ng-model="example.time" seconds="true" hour-step="example.hourStep" minute-step="example.minuteStep" second-step="example.secondStep"></ngb-timepicker>\n\n    <div class="row g-3 align-self-stretch">\n        <div class="col-sm-4">\n            <label class="form-label small" for="timepicker-hour-step">Hour step</label>\n            <input id="timepicker-hour-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.hourStep">\n        </div>\n        <div class="col-sm-4">\n            <label class="form-label small" for="timepicker-minute-step">Minute step</label>\n            <input id="timepicker-minute-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.minuteStep">\n        </div>\n        <div class="col-sm-4">\n            <label class="form-label small" for="timepicker-second-step">Second step</label>\n            <input id="timepicker-second-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.secondStep">\n        </div>\n    </div>\n\n    <hr class="w-100 my-0">\n    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\n</div>\n';
var validationTs = 'import { Component, Directive, forwardRef } from "ngjs-core";\nimport { type AbstractControl, NG_VALIDATORS, type ValidationErrors, type Validator } from "ngjs-core/forms";\nimport type { NgbTimeStruct } from "ngb-js/timepicker";\n\n@Component({\n    selector: "docs-timepicker-validation",\n    controllerAs: "example",\n    templateUrl: "./timepicker-validation.component.html",\n    styleUrl: "./timepicker-validation.component.css",\n})\nexport class TimepickerValidationComponent {\n    public time: NgbTimeStruct | null = null;\n}\n\n@Directive({\n    selector: "[docsTimepickerLunchValidator]",\n    providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => TimepickerLunchValidatorDirective), multi: true }],\n})\nexport class TimepickerLunchValidatorDirective implements Validator {\n    public validate(control: AbstractControl): ValidationErrors | null {\n        const time = control.value as NgbTimeStruct | null;\n        return !time || (time.hour >= 12 && time.hour <= 13) ? null : { lunchtime: true };\n    }\n}\n';
var validationHtml = '<p>Select a time between 12:00 and 13:59.</p>\n\n<form name="example.form" novalidate>\n    <div class="d-flex flex-column align-items-start gap-2">\n        <ngb-timepicker name="lunchtime" ng-model="example.time" docs-timepicker-lunch-validator required></ngb-timepicker>\n\n        <div class="small text-success" ng-if="example.form.lunchtime.$valid">Great choice.</div>\n        <div class="small text-danger" ng-if="example.form.lunchtime.$error.required">Select a lunchtime.</div>\n        <div class="small text-danger" ng-if="example.form.lunchtime.$error.lunchtime">The selected time is too early or too late.</div>\n    </div>\n</form>\n\n<hr>\n<pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\n';
var TimepickerExamplesPageComponent = class {
  constructor() {
    this.examples = {
      basic: {
        html: basicHtml,
        typescript: basicTs
      },
      meridian: {
        html: meridianHtml,
        typescript: meridianTs
      },
      seconds: {
        html: secondsHtml,
        typescript: secondsTs
      },
      spinners: {
        html: spinnersHtml,
        typescript: spinnersTs
      },
      steps: {
        html: stepsHtml,
        typescript: stepsTs
      },
      validation: {
        html: validationHtml,
        typescript: validationTs
      },
      adapter: {
        html: adapterHtml,
        typescript: adapterTs
      },
      i18n: {
        html: i18nHtml,
        typescript: i18nTs
      }
    };
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-ed98eee1]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-ed98eee1]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-ed98eee1]{box-shadow:none}pre[_content-ed98eee1]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
TimepickerExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function TimepickerExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || TimepickerExamplesPageComponent)();
    return instance;
  }
];
TimepickerExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-timepicker-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/timepicker-examples-page.component-aae4051c.html",
    "controllerAs": "$"
  }
};
TimepickerExamplesPageComponent.ɵfac.ɵcomponent = true;
TimepickerExamplesPageComponent.ɵfac.ɵtype = TimepickerExamplesPageComponent;
export {
  TimepickerExamplesPageComponent
};
