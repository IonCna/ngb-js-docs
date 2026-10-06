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

// src/app/features/dropdown/pages/dropdown-examples-page/dropdown-examples-page.component.ts
var dropdownDisabledItemsTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-dropdown-disabled-items",\n    controllerAs: "example",\n    templateUrl: "./dropdown-disabled-items.component.html",\n    styleUrl: "./dropdown-disabled-items.component.css",\n})\nexport class DropdownDisabledItemsComponent {\n    public restricted = true;\n}\n';
var dropdownFormTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-dropdown-form",\n    controllerAs: "example",\n    templateUrl: "./dropdown-form.component.html",\n    styleUrl: "./dropdown-form.component.css",\n})\nexport class DropdownFormComponent {\n    public email = "";\n    public remember = false;\n    public submitted = false;\n\n    public submit() {\n        this.submitted = true;\n    }\n}\n';
var dropdownGlobalTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { NgbDropdownConfig } from "ngb-js/dropdown";\n\n@Component({\n    selector: "docs-dropdown-global",\n    controllerAs: "example",\n    templateUrl: "./dropdown-global.component.html",\n    styleUrl: "./dropdown-global.component.css",\n})\nexport class DropdownGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<NgbDropdownConfig, "autoClose" | "container" | "placement">;\n\n    constructor(private readonly config: NgbDropdownConfig) {\n        this.initialConfig = {\n            autoClose: config.autoClose,\n            container: config.container,\n            placement: config.placement,\n        };\n\n        config.autoClose = "outside";\n        config.container = "body";\n        config.placement = ["top-start", "bottom-start"];\n    }\n\n    public ngOnDestroy() {\n        this.config.autoClose = this.initialConfig.autoClose;\n        this.config.container = this.initialConfig.container;\n        this.config.placement = this.initialConfig.placement;\n    }\n}\n';
var manualDropdownTs = 'import { Component, ViewChild } from "ngjs-core";\nimport { NgbDropdown } from "ngb-js/dropdown";\n\n@Component({\n    selector: "docs-manual-dropdown",\n    controllerAs: "example",\n    templateUrl: "./manual-dropdown.component.html",\n    styleUrl: "./manual-dropdown.component.css",\n})\nexport class ManualDropdownComponent {\n    @ViewChild("dropdown", { static: true })\n    private dropdown!: NgbDropdown;\n\n    public opened = false;\n\n    public open() {\n        this.dropdown.open();\n    }\n\n    public close() {\n        this.dropdown.close();\n    }\n\n    public toggle() {\n        this.dropdown.toggle();\n    }\n}\n';
var simpleDropdownHtml = `<div class="d-flex flex-wrap align-items-center gap-3 py-5">
    <div ngb-dropdown placement="'bottom-start'">
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Bottom dropdown</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Profile</button>
            <button type="button" ngb-dropdown-item>Settings</button>
            <div class="dropdown-divider"></div>
            <button type="button" ngb-dropdown-item>Sign out</button>
        </div>
    </div>

    <div ngb-dropdown placement="'top-start'">
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Top dropdown</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Newest first</button>
            <button type="button" ngb-dropdown-item>Oldest first</button>
            <button type="button" ngb-dropdown-item>Recently updated</button>
        </div>
    </div>
</div>
`;
var manualDropdownHtml = `<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.open()">Open</button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.close()">Close</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle()">Toggle</button>
</div>

<div
    ngb-dropdown
    ng-ref="dropdown"
    ng-ref-read="ngbDropdown"
    open="example.opened"
    open-change="example.opened = $event">
    <button type="button" class="btn btn-outline-dark" ngb-dropdown-anchor>
        Manually controlled menu
    </button>
    <div ngb-dropdown-menu>
        <button type="button" ngb-dropdown-item>First action</button>
        <button type="button" ngb-dropdown-item>Second action</button>
    </div>
</div>

<p class="small text-body-secondary mt-2 mb-0">
    Current state: {{ example.opened ? 'open' : 'closed' }}
</p>
`;
var dropdownButtonGroupsHtml = '<div class="d-flex flex-wrap gap-3">\n    <div class="btn-group" ngb-dropdown>\n        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Button group</button>\n        <div ngb-dropdown-menu>\n            <button type="button" ngb-dropdown-item>Edit</button>\n            <button type="button" ngb-dropdown-item>Duplicate</button>\n            <button type="button" ngb-dropdown-item>Archive</button>\n        </div>\n    </div>\n\n    <div class="btn-group" ngb-dropdown>\n        <button type="button" class="btn btn-success">Save</button>\n        <button\n            type="button"\n            class="btn btn-success dropdown-toggle-split"\n            ngb-dropdown-toggle\n            aria-label="More save options">\n            <span class="visually-hidden">Toggle dropdown</span>\n        </button>\n        <div ngb-dropdown-menu>\n            <button type="button" ngb-dropdown-item>Save as draft</button>\n            <button type="button" ngb-dropdown-item>Save and publish</button>\n            <button type="button" ngb-dropdown-item>Save a copy</button>\n        </div>\n    </div>\n</div>\n';
var dropdownDisabledItemsHtml = '<div class="form-check form-switch mb-3">\n    <input\n        class="form-check-input"\n        type="checkbox"\n        role="switch"\n        id="dropdown-restricted-items"\n        ng-model="example.restricted">\n    <label class="form-check-label" for="dropdown-restricted-items">Disable restricted actions</label>\n</div>\n\n<div ngb-dropdown>\n    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Project actions</button>\n    <div ngb-dropdown-menu>\n        <button type="button" ngb-dropdown-item>Open project</button>\n        <button type="button" ngb-dropdown-item disabled="example.restricted">Archive project</button>\n        <button type="button" ngb-dropdown-item disabled="example.restricted">Delete project</button>\n        <div class="dropdown-divider"></div>\n        <button type="button" ngb-dropdown-item disabled="true">Unavailable action</button>\n    </div>\n</div>\n';
var dropdownFormHtml = `<div ngb-dropdown auto-close="'outside'">
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Sign in</button>
    <div ngb-dropdown-menu class="p-3">
        <form ng-submit="example.submit()">
            <div class="mb-3">
                <label class="form-label" for="dropdown-form-email">Email address</label>
                <input
                    id="dropdown-form-email"
                    type="email"
                    class="form-control"
                    placeholder="name@example.com"
                    ng-model="example.email"
                    required>
            </div>
            <div class="form-check mb-3">
                <input
                    id="dropdown-form-remember"
                    type="checkbox"
                    class="form-check-input"
                    ng-model="example.remember">
                <label class="form-check-label" for="dropdown-form-remember">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary w-100">Continue</button>
            <p class="small text-success mt-2 mb-0" ng-if="example.submitted">Form submitted.</p>
        </form>
    </div>
</div>
`;
var dropdownBodyHtml = '<div class="border rounded p-3 overflow-hidden">\n    <p class="small text-body-secondary mb-3">\n        The wrapper clips overflowing content, but the menu is appended to the document body.\n    </p>\n\n    <div ngb-dropdown container="body">\n        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Open body container</button>\n        <div ngb-dropdown-menu>\n            <button type="button" ngb-dropdown-item>Account</button>\n            <button type="button" ngb-dropdown-item>Notifications</button>\n            <button type="button" ngb-dropdown-item>Privacy</button>\n        </div>\n    </div>\n</div>\n';
var dropdownNavbarHtml = `<nav class="navbar bg-body-tertiary border rounded px-3">
    <span class="navbar-brand mb-0">Workspace</span>

    <div class="ms-auto" ngb-dropdown display="dynamic" placement="'bottom-end'">
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Account</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Profile</button>
            <button type="button" ngb-dropdown-item>Preferences</button>
            <div class="dropdown-divider"></div>
            <button type="button" ngb-dropdown-item>Sign out</button>
        </div>
    </div>
</nav>
`;
var dropdownGlobalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">\n            The menu prefers the top placement, uses the body container and closes only after an outside click.\n        </p>\n    </div>\n</div>\n\n<div ngb-dropdown>\n    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Globally configured</button>\n    <div ngb-dropdown-menu>\n        <button type="button" ngb-dropdown-item>This click keeps the menu open</button>\n        <button type="button" ngb-dropdown-item>So does this one</button>\n    </div>\n</div>\n';
var DropdownExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: simpleDropdownHtml
      },
      manual: {
        html: manualDropdownHtml,
        typescript: manualDropdownTs
      },
      buttonGroups: {
        html: dropdownButtonGroupsHtml
      },
      disabledItems: {
        html: dropdownDisabledItemsHtml,
        typescript: dropdownDisabledItemsTs
      },
      form: {
        html: dropdownFormHtml,
        typescript: dropdownFormTs
      },
      body: {
        html: dropdownBodyHtml
      },
      navbar: {
        html: dropdownNavbarHtml
      },
      global: {
        html: dropdownGlobalHtml,
        typescript: dropdownGlobalTs
      }
    };
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-5bc9dcbe]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-5bc9dcbe]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-5bc9dcbe]{box-shadow:none}pre[_content-5bc9dcbe]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
DropdownExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function DropdownExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || DropdownExamplesPageComponent)();
    return instance;
  }
];
DropdownExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-dropdown-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/dropdown-examples-page.component-3893c5f9.html",
    "controllerAs": "$"
  }
};
DropdownExamplesPageComponent.ɵfac.ɵcomponent = true;
DropdownExamplesPageComponent.ɵfac.ɵtype = DropdownExamplesPageComponent;
export {
  DropdownExamplesPageComponent
};
