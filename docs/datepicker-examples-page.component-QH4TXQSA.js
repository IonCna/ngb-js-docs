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

// src/app/features/datepicker/pages/datepicker-examples-page/datepicker-examples-page.component.ts
var adapterTs = 'import { Component } from "ngjs-core";\nimport { NgbDateAdapter, NgbDateParserFormatter, type NgbDateStruct } from "ngb-js/datepicker";\n\nclass StringDateAdapter extends NgbDateAdapter<string> {\n    fromModel(value: string | null): NgbDateStruct | null {\n        if (!value) return null;\n        const [year, month, day] = value.split("/").map(Number);\n        return year && month && day ? { year, month, day } : null;\n    }\n    toModel(date: NgbDateStruct | null): string | null { return date ? `${date.year}/${date.month}/${date.day}` : null; }\n}\n\nclass DotDateParserFormatter extends NgbDateParserFormatter {\n    parse(value: string): NgbDateStruct | null {\n        const [day, month, year] = value.split(".").map(Number);\n        return day && month && year ? { year, month, day } : null;\n    }\n    format(date: NgbDateStruct | null): string { return date ? `${String(date.day).padStart(2, "0")}.${String(date.month).padStart(2, "0")}.${date.year}` : ""; }\n}\n\n@Component({\n    selector: "docs-datepicker-custom-adapter",\n    controllerAs: "example",\n    templateUrl: "./datepicker-custom-adapter.component.html",\n    styleUrl: "./datepicker-custom-adapter.component.css",\n})\nexport class DatepickerCustomAdapterComponent {\n    public readonly adapter = new StringDateAdapter();\n    public readonly formatter = new DotDateParserFormatter();\n    public date = "2026/8/24";\n}\n';
var adapterHtml = '<label class="form-label" for="custom-adapter-input">Date using <code>dd.mm.yyyy</code></label>\n<div class="input-group" style="max-width: 22rem">\n    <input id="custom-adapter-input" class="form-control" ng-model="example.date" ngb-datepicker date-adapter="example.adapter" parser-formatter="example.formatter">\n    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3" aria-hidden="true"></i></button>\n</div>\n<p class="small text-body-secondary mt-3 mb-0">Application model: <code>{{ example.date }}</code></p>\n';
var basicTs = 'import { Component } from "ngjs-core";\nimport { NgbCalendar, type NgbDatepicker, type NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-basic-datepicker",\n    controllerAs: "example",\n    templateUrl: "./basic-datepicker.component.html",\n    styleUrl: "./basic-datepicker.component.css",\n})\nexport class BasicDatepickerComponent {\n    public today: NgbDateStruct;\n\n    public dp?: NgbDatepicker;\n    public model?: NgbDateStruct;\n    public date?: { year: number; month: number };\n\n    constructor(calendar: NgbCalendar) {\n        this.today = calendar.getToday();\n    }\n}\n';
var basicHtml = '<p>Simple datepicker</p>\n\n<ngb-datepicker ng-ref="example.dp" ng-model="example.model" navigate="example.date = $event.next"></ngb-datepicker>\n\n<hr />\n\n<button type="button" class="btn btn-sm btn-outline-primary me-2" ng-click="example.model = example.today">Select Today</button>\n<button type="button" class="btn btn-sm btn-outline-primary me-2" ng-click="example.dp.navigateTo()">To current month</button>\n<button type="button" class="btn btn-sm btn-outline-primary me-2" ng-click="example.dp.navigateTo({ year: 2013, month: 2 })">To Feb 2013</button>\n\n<hr />\n\n<pre>Month: {{ example.date.month }}.{{ example.date.year }}</pre>\n<pre>Model: {{ example.model | json }}</pre>\n';
var customDayCss = ".day { position: relative; display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease, color .15s ease; }\n.day.weekend { color: var(--bs-danger); background: color-mix(in srgb, var(--bs-danger-bg-subtle) 42%, transparent); }\n.day.today { font-weight: 750; box-shadow: inset 0 0 0 1px var(--bs-primary); }\n.day.selected { color: var(--bs-white); background: var(--bs-primary); box-shadow: 0 .35rem .9rem rgba(var(--bs-primary-rgb), .22); }\n.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .4); outline-offset: 1px; }\n.day .bi-dot { position: absolute; bottom: -.4rem; font-size: 1.25rem; }\n";
var customDayTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-datepicker-custom-day",\n    controllerAs: "example",\n    templateUrl: "./datepicker-custom-day.component.html",\n    styleUrl: "./datepicker-custom-day.component.css",\n})\nexport class DatepickerCustomDayComponent {\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n    public dayData(date: NgbDateStruct) {\n        const weekday = new Date(date.year, date.month - 1, date.day).getDay();\n        return { weekend: weekday === 0 || weekday === 6 };\n    }\n}\n';
var customDayHtml = '<ng-template ng-ref="example.customDay" let-date let-data="data" let-selected="selected" let-today="today" let-focused="focused">\n    <span class="day" ng-class="{ selected: selected, today: today, weekend: data.weekend, focused: focused }">\n        {{ date.day }}\n        <i ng-if="today" class="bi bi-dot" aria-hidden="true"></i>\n    </span>\n</ng-template>\n<ngb-datepicker ng-model="example.date" day-template="example.customDay" day-template-data="example.dayData"></ngb-datepicker>\n';
var customMonthCss = ".layout { display: grid; grid-template-columns: repeat(2, max-content); gap: 1rem; width: max-content; border: 1px solid var(--bs-border-color); border-radius: var(--bs-border-radius-lg); background: var(--bs-body-bg); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .06); }\n@media (max-width: 575.98px) { .layout { grid-template-columns: max-content; } }\n";
var customMonthTs = 'import { Component } from "ngjs-core";\nimport type { NgbDatepicker } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-datepicker-custom-month",\n    controllerAs: "example",\n    templateUrl: "./datepicker-custom-month.component.html",\n    styleUrl: "./datepicker-custom-month.component.css",\n})\nexport class DatepickerCustomMonthComponent {\n    public previous(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1)); }\n    public next(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1)); }\n    public today(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getToday()); }\n}\n';
var customMonthHtml = '<ng-template ng-ref="example.content" let-datepicker>\n    <div class="d-flex align-items-center justify-content-between gap-2 p-2 border-bottom bg-body-tertiary">\n        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.previous(datepicker)" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>\n        <button type="button" class="btn btn-sm btn-link text-decoration-none" ng-click="example.today(datepicker)">Today</button>\n        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.next(datepicker)" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>\n    </div>\n    <div class="layout p-2">\n        <div ng-repeat="month in datepicker.model.months track by $index">\n            <p class="small fw-semibold text-center mb-1">{{ datepicker.i18n.getMonthLabel(month.firstDate) }}</p>\n            <ngb-datepicker-month month="month.firstDate" datepicker="datepicker"></ngb-datepicker-month>\n        </div>\n    </div>\n</ng-template>\n<div class="overflow-auto pb-2">\n    <ngb-datepicker display-months="2" navigation="none" outside-days="hidden" content-template="example.content"></ngb-datepicker>\n</div>\n';
var disabledTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-disabled-datepicker",\n    controllerAs: "example",\n    templateUrl: "./disabled-datepicker.component.html",\n    styleUrl: "./disabled-datepicker.component.css",\n})\nexport class DisabledDatepickerComponent {\n    public disabled = true;\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n}\n';
var disabledHtml = '<div class="form-check form-switch mb-3">\n    <input id="disabled-datepicker-switch" class="form-check-input" type="checkbox" ng-model="example.disabled">\n    <label class="form-check-label" for="disabled-datepicker-switch">Disable datepicker</label>\n</div>\n<ngb-datepicker ng-model="example.date" disabled="example.disabled"></ngb-datepicker>\n';
var footerTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-datepicker-footer",\n    controllerAs: "example",\n    templateUrl: "./datepicker-footer.component.html",\n    styleUrl: "./datepicker-footer.component.css",\n})\nexport class DatepickerFooterComponent {\n    public date: NgbDateStruct | null = null;\n    public datepicker?: NgbDatepicker;\n    public today() { if (this.datepicker) this.date = this.datepicker.calendar.getToday(); }\n    public clear() { this.date = null; }\n}\n';
var footerHtml = '<ng-template ng-ref="example.footer">\n    <div class="d-flex gap-2 p-2 border-top bg-body-tertiary">\n        <button type="button" class="btn btn-primary btn-sm" ng-click="example.today()">Today</button>\n        <button type="button" class="btn btn-outline-secondary btn-sm ms-auto" ng-click="example.clear()">Clear</button>\n    </div>\n</ng-template>\n<ngb-datepicker ng-model="example.date" footer-template="example.footer" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>\n<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>\n';
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbDatepickerConfig, NgbInputDatepickerConfig, type NgbDateStruct } from "ngb-js/datepicker";\n\ntype DatepickerDefaults = Pick<NgbDatepickerConfig, "displayMonths" | "navigation" | "outsideDays" | "showWeekNumbers" | "weekdays">;\n\n@Component({\n    selector: "docs-datepicker-global",\n    controllerAs: "example",\n    templateUrl: "./datepicker-global.component.html",\n    styleUrl: "./datepicker-global.component.css",\n})\nexport class DatepickerGlobalComponent implements AfterViewInit, OnDestroy {\n    private readonly inlineDefaults: DatepickerDefaults;\n    private readonly inputDefaults: DatepickerDefaults;\n    public inlineDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n    public popupDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n\n    constructor(private readonly config: NgbDatepickerConfig, private readonly inputConfig: NgbInputDatepickerConfig) {\n        this.inlineDefaults = this.capture(config);\n        this.inputDefaults = this.capture(inputConfig);\n        Object.assign(config, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });\n        Object.assign(inputConfig, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });\n    }\n    public ngAfterViewInit() { this.restore(); }\n    public ngOnDestroy() { this.restore(); }\n    private capture(config: NgbDatepickerConfig): DatepickerDefaults { return { displayMonths: config.displayMonths, navigation: config.navigation, outsideDays: config.outsideDays, showWeekNumbers: config.showWeekNumbers, weekdays: config.weekdays }; }\n    private restore() { Object.assign(this.config, this.inlineDefaults); Object.assign(this.inputConfig, this.inputDefaults); }\n}\n';
var globalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Two months, arrow navigation, hidden outside days, week numbers and short weekday labels.</p></div>\n</div>\n<div class="overflow-auto pb-3"><ngb-datepicker ng-model="example.inlineDate"></ngb-datepicker></div>\n<div class="input-group" style="max-width: 22rem">\n    <input class="form-control" ng-model="example.popupDate" ngb-datepicker aria-label="Globally configured popup datepicker">\n    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3"></i></button>\n</div>\n';
var i18nTs = 'import { Component } from "ngjs-core";\nimport { NgbDatepickerI18n, type NgbDateStruct } from "ngb-js/datepicker";\n\nclass SpanishDatepickerI18n extends NgbDatepickerI18n {\n    private readonly months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];\n    private readonly weekdays = ["L", "M", "X", "J", "V", "S", "D"];\n    getWeekdayLabel(weekday: number) { return this.weekdays[weekday - 1] ?? ""; }\n    getMonthShortName(month: number) { return this.months[month - 1]?.slice(0, 3) ?? ""; }\n    getMonthFullName(month: number) { return this.months[month - 1] ?? ""; }\n    getDayAriaLabel(date: NgbDateStruct) { return `${date.day} de ${this.getMonthFullName(date.month)} de ${date.year}`; }\n}\n\n@Component({\n    selector: "docs-datepicker-i18n",\n    controllerAs: "example",\n    templateUrl: "./datepicker-i18n.component.html",\n    styleUrl: "./datepicker-i18n.component.css",\n})\nexport class DatepickerI18nComponent {\n    public readonly i18n = new SpanishDatepickerI18n();\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n}\n';
var i18nHtml = `<ngb-datepicker ng-model="example.date" i18n="example.i18n" weekdays="'short'"></ngb-datepicker>
`;
var keyboardTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-datepicker-keyboard",\n    controllerAs: "example",\n    templateUrl: "./datepicker-keyboard.component.html",\n    styleUrl: "./datepicker-keyboard.component.css",\n})\nexport class DatepickerKeyboardComponent {\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n    public datepicker?: NgbDatepicker;\n    public onKeydown(event: KeyboardEvent | JQueryEventObject) {\n        if (!this.datepicker || (event.key !== "[" && event.key !== "]")) return;\n        const direction = event.key === "[" ? -1 : 1;\n        const target = direction < 0\n            ? this.datepicker.calendar.getPrev(this.datepicker.state.firstDate, "m", 1)\n            : this.datepicker.calendar.getNext(this.datepicker.state.firstDate, "m", 1);\n        this.datepicker.navigateTo(target);\n        event.preventDefault();\n        event.stopPropagation();\n    }\n}\n';
var keyboardHtml = '<p class="small text-body-secondary">Focus the calendar and press <kbd>[</kbd> or <kbd>]</kbd> to navigate by month. The built-in arrow, Home, End and Page keys continue to work.</p>\n<div ng-keydown="example.onKeydown($event)">\n    <ngb-datepicker ng-model="example.date" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>\n</div>\n';
var multipleTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-multiple-months-datepicker",\n    controllerAs: "example",\n    templateUrl: "./multiple-months-datepicker.component.html",\n    styleUrl: "./multiple-months-datepicker.component.css",\n})\nexport class MultipleMonthsDatepickerComponent {\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n}\n';
var multipleHtml = '<div class="overflow-auto pb-2">\n    <ngb-datepicker ng-model="example.date" display-months="2" outside-days="hidden"></ngb-datepicker>\n</div>\n';
var popupTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-popup-datepicker",\n    controllerAs: "example",\n    templateUrl: "./popup-datepicker.component.html",\n    styleUrl: "./popup-datepicker.component.css",\n})\nexport class PopupDatepickerComponent {\n    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\n}\n';
var popupHtml = '<label class="form-label" for="popup-datepicker-input">Choose a date</label>\n<div class="input-group" style="max-width: 22rem">\n    <input id="popup-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker ng-focus="$datepicker.open()">\n    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar">\n        <i class="bi bi-calendar3" aria-hidden="true"></i>\n    </button>\n</div>\n<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>\n';
var positionTs = 'import { Component } from "ngjs-core";\nimport type { NgbDateStruct } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-datepicker-position-target",\n    controllerAs: "example",\n    templateUrl: "./datepicker-position-target.component.html",\n    styleUrl: "./datepicker-position-target.component.css",\n})\nexport class DatepickerPositionTargetComponent {\n    public date: NgbDateStruct | null = null;\n    public readonly target = "#datepicker-custom-position-target";\n}\n';
var positionHtml = '<div class="row g-3 align-items-end">\n    <div class="col-sm-7">\n        <label class="form-label" for="positioned-datepicker-input">The input controls the popup</label>\n        <div class="input-group">\n            <input id="positioned-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker position-target="example.target">\n            <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()">Open</button>\n        </div>\n    </div>\n    <div class="col-sm-5 text-sm-end">\n        <span id="datepicker-custom-position-target" class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded border bg-body-tertiary">\n            <i class="bi bi-crosshair" aria-hidden="true"></i> Popup target\n        </span>\n    </div>\n</div>\n';
var rangeCss = ".day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }\n.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }\n.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }\n.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }\n";
var rangeTs = 'import { Component } from "ngjs-core";\nimport { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-range-datepicker",\n    controllerAs: "example",\n    templateUrl: "./range-datepicker.component.html",\n    styleUrl: "./range-datepicker.component.css",\n})\nexport class RangeDatepickerComponent {\n    private readonly calendar = new NgbCalendarGregorian();\n    public hoveredDate: NgbDate | null = null;\n    public fromDate = this.calendar.getToday();\n    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 10);\n\n    public select(date: NgbDate) {\n        if (!this.fromDate || this.toDate) {\n            this.fromDate = date;\n            this.toDate = null;\n        } else if (date.after(this.fromDate)) {\n            this.toDate = date;\n        } else {\n            this.fromDate = date;\n        }\n    }\n    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }\n    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }\n    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }\n}\n';
var rangeHtml = '<ng-template ng-ref="example.day" let-date let-focused="focused">\n    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>\n</ng-template>\n<div class="overflow-auto pb-2">\n    <ngb-datepicker display-months="2" outside-days="hidden" day-template="example.day" date-select="example.select($event)"></ngb-datepicker>\n</div>\n<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>\n';
var rangePopupCss = ".day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }\n.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }\n.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }\n.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }\n";
var rangePopupTs = 'import { Component } from "ngjs-core";\nimport { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";\n\n@Component({\n    selector: "docs-range-popup-datepicker",\n    controllerAs: "example",\n    templateUrl: "./range-popup-datepicker.component.html",\n    styleUrl: "./range-popup-datepicker.component.css",\n})\nexport class RangePopupDatepickerComponent {\n    private readonly calendar = new NgbCalendarGregorian();\n    public hoveredDate: NgbDate | null = null;\n    public fromDate = this.calendar.getToday();\n    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 7);\n    public model: NgbDate | null = this.fromDate;\n    public select(date: NgbDate) {\n        if (!this.fromDate || this.toDate) { this.fromDate = date; this.toDate = null; }\n        else if (date.after(this.fromDate)) { this.toDate = date; }\n        else { this.fromDate = date; }\n        this.model = date;\n    }\n    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }\n    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }\n    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }\n}\n';
var rangePopupHtml = `<ng-template ng-ref="example.day" let-date let-focused="focused">
    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>
</ng-template>
<div class="input-group" style="max-width: 24rem">
    <input class="form-control" ng-model="example.model" ngb-datepicker display-months="2" outside-days="hidden" auto-close="'outside'" day-template="example.day" date-select="example.select($event)" aria-label="Date range">
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar-range" aria-hidden="true"></i></button>
</div>
<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>
`;
var DatepickerExamplesPageComponent = class {
  constructor() {
    this.examples = {
      basic: {
        html: basicHtml,
        typescript: basicTs
      },
      popup: {
        html: popupHtml,
        typescript: popupTs
      },
      multiple: {
        html: multipleHtml,
        typescript: multipleTs
      },
      range: {
        html: rangeHtml,
        typescript: rangeTs,
        css: rangeCss
      },
      rangePopup: {
        html: rangePopupHtml,
        typescript: rangePopupTs,
        css: rangePopupCss
      },
      disabled: {
        html: disabledHtml,
        typescript: disabledTs
      },
      adapter: {
        html: adapterHtml,
        typescript: adapterTs
      },
      i18n: {
        html: i18nHtml,
        typescript: i18nTs
      },
      customDay: {
        html: customDayHtml,
        typescript: customDayTs,
        css: customDayCss
      },
      customMonth: {
        html: customMonthHtml,
        typescript: customMonthTs,
        css: customMonthCss
      },
      footer: {
        html: footerHtml,
        typescript: footerTs
      },
      position: {
        html: positionHtml,
        typescript: positionTs
      },
      keyboard: {
        html: keyboardHtml,
        typescript: keyboardTs
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
  s.textContent = "section[_content-8b7dbf84]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-8b7dbf84]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-8b7dbf84]{box-shadow:none}pre[_content-8b7dbf84]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
DatepickerExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function DatepickerExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DatepickerExamplesPageComponent)();
    return instance;
  }
];
DatepickerExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-datepicker-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/datepicker-examples-page.component-acbe589b.html",
    "controllerAs": "$"
  }
};
DatepickerExamplesPageComponent.ɵfac.ɵcomponent = true;
DatepickerExamplesPageComponent.ɵfac.ɵtype = DatepickerExamplesPageComponent;
export {
  DatepickerExamplesPageComponent
};
