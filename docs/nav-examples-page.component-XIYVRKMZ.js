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

// src/app/features/nav/pages/nav-examples-page/nav-examples-page.component.ts
var alternativeNavHtml = `<nav
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    class="nav-tabs">
    <div ngb-nav-item="'alternative-home'">
        <button type="button" ngb-nav-link>Button link</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">This item uses a button without list markup.</p>
        </ng-template>
    </div>
    <div ngb-nav-item="'alternative-profile'">
        <a ngb-nav-link>Anchor link</a>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">This item uses an anchor inside a plain div.</p>
        </ng-template>
    </div>
    <div ngb-nav-item="'alternative-contact'">
        <button type="button" ngb-nav-link>Another button</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Buttons and anchors can be interchanged.</p>
        </ng-template>
    </div>
</nav>

<div ngb-nav-outlet="example.nav"></div>
`;
var alternativeNavTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-alternative-nav",\n    controllerAs: "example",\n    templateUrl: "./alternative-nav.component.html",\n    styleUrl: "./alternative-nav.component.css",\n})\nexport class AlternativeNavComponent {\n    public activeId = "alternative-home";\n}\n';
var customNavCss = ".nav-demo { gap: .35rem; padding: .4rem; border: 1px solid var(--bs-border-color); border-radius: 999px; background: color-mix(in srgb, var(--bs-tertiary-bg) 82%, var(--bs-body-bg)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05); }\n.nav-demo .nav-link { border-radius: 999px; color: var(--bs-secondary-color); }\n.nav-demo .nav-link:hover { color: var(--bs-emphasis-color); background: var(--bs-body-bg); }\n.nav-demo .nav-link.active { color: var(--bs-primary-text-emphasis); background: var(--bs-primary-bg-subtle); box-shadow: 0 .35rem 1rem rgba(var(--bs-body-color-rgb), .08); }\n";
var customNavHtml = `<div
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    roles="false"
    class="nav-demo">
    <div ngb-nav-item="'custom-daily'">
        <button type="button" ngb-nav-link>Daily</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Daily activity summary.</p></ng-template>
    </div>
    <div ngb-nav-item="'custom-weekly'">
        <button type="button" ngb-nav-link>Weekly</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Weekly activity summary.</p></ng-template>
    </div>
    <div ngb-nav-item="'custom-monthly'">
        <button type="button" ngb-nav-link>Monthly</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Monthly activity summary.</p></ng-template>
    </div>
</div>

<div ngb-nav-outlet="example.nav"></div>
`;
var customNavTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-custom-nav",\n    controllerAs: "example",\n    templateUrl: "./custom-nav.component.html",\n    styleUrl: "./custom-nav.component.css",\n})\nexport class CustomNavComponent {\n    public activeId = "custom-weekly";\n}\n';
var dynamicNavHtml = '<div class="d-flex flex-wrap gap-2 mb-3">\n    <button type="button" class="btn btn-primary btn-sm" ng-click="example.add()">Add tab</button>\n    <button\n        type="button"\n        class="btn btn-outline-danger btn-sm"\n        ng-click="example.removeActive()"\n        disabled="example.items.length === 1">\n        Remove active tab\n    </button>\n</div>\n\n<ul\n    ngb-nav\n    ng-ref="example.nav"\n    ng-ref-read="ngbNav"\n    active-id="example.activeId"\n    class="nav-tabs">\n    <li ng-repeat="item in example.items track by item.id" ngb-nav-item="item.id">\n        <button type="button" ngb-nav-link>{{ item.title }}</button>\n        <ng-template ngb-nav-content>\n            <p class="pt-3 mb-0">Dynamic content for {{ item.title }}.</p>\n        </ng-template>\n    </li>\n</ul>\n\n<div ngb-nav-outlet="example.nav"></div>\n';
var dynamicNavTs = 'import { Component } from "ngjs-core";\n\ninterface DynamicNavItem {\n    id: string;\n    title: string;\n}\n\n@Component({\n    selector: "docs-dynamic-nav",\n    controllerAs: "example",\n    templateUrl: "./dynamic-nav.component.html",\n    styleUrl: "./dynamic-nav.component.css",\n})\nexport class DynamicNavComponent {\n    public items: DynamicNavItem[] = [\n        { id: "dynamic-1", title: "Tab 1" },\n        { id: "dynamic-2", title: "Tab 2" },\n        { id: "dynamic-3", title: "Tab 3" },\n    ];\n    public activeId = "dynamic-1";\n    private nextId = 4;\n\n    public add() {\n        const item = {\n            id: `dynamic-${this.nextId}`,\n            title: `Tab ${this.nextId}`,\n        };\n\n        this.nextId++;\n        this.items.push(item);\n        this.activeId = item.id;\n    }\n\n    public removeActive() {\n        if (this.items.length === 1) return;\n\n        const activeIndex = this.items.findIndex(({ id }) => id === this.activeId);\n        const replacement = this.items[activeIndex === 0 ? 1 : activeIndex - 1];\n\n        this.activeId = replacement.id;\n        this.items = this.items.filter(({ id }) => id !== this.items[activeIndex].id);\n    }\n}\n';
var keepContentNavHtml = `<ul
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    destroy-on-hide="false"
    class="nav-tabs">
    <li ngb-nav-item="'keep-editor'">
        <button type="button" ngb-nav-link>Editor</button>
        <ng-template ngb-nav-content>
            <div class="pt-3">
                <label class="form-label" for="keep-content-draft">Draft</label>
                <input id="keep-content-draft" type="text" class="form-control" ng-model="example.draft">
            </div>
        </ng-template>
    </li>
    <li ngb-nav-item="'keep-preview'">
        <button type="button" ngb-nav-link>Preview</button>
        <ng-template ngb-nav-content>
            <div class="pt-3">
                <p class="small text-body-secondary mb-1">Current draft</p>
                <p class="mb-0">{{ example.draft }}</p>
            </div>
        </ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
`;
var keepContentNavTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-keep-content-nav",\n    controllerAs: "example",\n    templateUrl: "./keep-content-nav.component.html",\n    styleUrl: "./keep-content-nav.component.css",\n})\nexport class KeepContentNavComponent {\n    public activeId = "keep-editor";\n    public draft = "This value survives tab changes.";\n}\n';
var navGlobalHtml = `<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            The nav is vertical, keeps hidden content and selects tabs while navigating with the arrow keys.
        </p>
    </div>
</div>

<div class="d-flex align-items-start gap-3">
    <div
        ngb-nav
        ng-ref="example.nav"
        ng-ref-read="ngbNav"
        active-id="example.activeId"
        class="nav-pills flex-column flex-shrink-0">
        <div ngb-nav-item="'global-account'">
            <button type="button" ngb-nav-link>Account</button>
            <ng-template ngb-nav-content><p class="mb-0">Global account settings.</p></ng-template>
        </div>
        <div ngb-nav-item="'global-team'">
            <button type="button" ngb-nav-link>Team</button>
            <ng-template ngb-nav-content><p class="mb-0">Global team settings.</p></ng-template>
        </div>
        <div ngb-nav-item="'global-billing'">
            <button type="button" ngb-nav-link>Billing</button>
            <ng-template ngb-nav-content><p class="mb-0">Global billing settings.</p></ng-template>
        </div>
    </div>

    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>
</div>
`;
var navGlobalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbNavConfig } from "ngb-js/nav";\n\n@Component({\n    selector: "docs-nav-global",\n    controllerAs: "example",\n    templateUrl: "./nav-global.component.html",\n    styleUrl: "./nav-global.component.css",\n})\nexport class NavGlobalComponent implements AfterViewInit, OnDestroy {\n    public activeId = "global-account";\n\n    private readonly initialConfig: Pick<\n        NgbNavConfig,\n        "animation" | "destroyOnHide" | "keyboard" | "orientation" | "roles"\n    >;\n\n    constructor(private readonly config: NgbNavConfig) {\n        this.initialConfig = {\n            animation: config.animation,\n            destroyOnHide: config.destroyOnHide,\n            keyboard: config.keyboard,\n            orientation: config.orientation,\n            roles: config.roles,\n        };\n\n        config.animation = false;\n        config.destroyOnHide = false;\n        config.keyboard = "changeWithArrows";\n        config.orientation = "vertical";\n        config.roles = "tablist";\n    }\n\n    public ngAfterViewInit() {\n        this.restoreConfig();\n    }\n\n    public ngOnDestroy() {\n        this.restoreConfig();\n    }\n\n    private restoreConfig() {\n        this.config.animation = this.initialConfig.animation;\n        this.config.destroyOnHide = this.initialConfig.destroyOnHide;\n        this.config.keyboard = this.initialConfig.keyboard;\n        this.config.orientation = this.initialConfig.orientation;\n        this.config.roles = this.initialConfig.roles;\n    }\n}\n';
var selectingNavHtml = `<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-first')">
        Select first
    </button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-second')">
        Select second
    </button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-third')">
        Select third
    </button>
</div>

<ul ngb-nav ng-ref="example.nav" ng-ref-read="ngbNav" active-id="example.activeId" class="nav-tabs">
    <li ngb-nav-item="'selecting-first'">
        <button type="button" ngb-nav-link>First</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">First tab selected.</p></ng-template>
    </li>
    <li ngb-nav-item="'selecting-second'">
        <button type="button" ngb-nav-link>Second</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Second tab selected.</p></ng-template>
    </li>
    <li ngb-nav-item="'selecting-third'">
        <button type="button" ngb-nav-link>Third</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Third tab selected.</p></ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
<p class="small text-body-secondary mt-2 mb-0">Active id: {{ example.activeId }}</p>
`;
var selectingNavTs = 'import { Component } from "ngjs-core";\nimport { NgbNav } from "ngb-js/nav";\n\n@Component({\n    selector: "docs-selecting-nav",\n    controllerAs: "example",\n    templateUrl: "./selecting-nav.component.html",\n    styleUrl: "./selecting-nav.component.css",\n})\nexport class SelectingNavComponent {\n    public nav!: NgbNav;\n\n    public activeId = "selecting-first";\n\n    public select(id: string) {\n        this.nav.select(id);\n    }\n}\n';
var simpleNavHtml = `<ul
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    class="nav-tabs">
    <li ngb-nav-item="'simple-overview'">
        <button type="button" ngb-nav-link>Overview</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">A concise overview of the current project.</p>
        </ng-template>
    </li>
    <li ngb-nav-item="'simple-features'">
        <button type="button" ngb-nav-link>Features</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Explore the features exposed by this library.</p>
        </ng-template>
    </li>
    <li ngb-nav-item="'simple-settings'">
        <button type="button" ngb-nav-link>Settings</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Adjust the settings for this example.</p>
        </ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
`;
var simpleNavTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-simple-nav",\n    controllerAs: "example",\n    templateUrl: "./simple-nav.component.html",\n    styleUrl: "./simple-nav.component.css",\n})\nexport class SimpleNavComponent {\n    public activeId = "simple-overview";\n}\n';
var verticalNavHtml = `<div class="d-flex align-items-start gap-3">
    <div
        ngb-nav
        ng-ref="example.nav"
        ng-ref-read="ngbNav"
        active-id="example.activeId"
        orientation="'vertical'"
        class="nav-pills flex-shrink-0">
        <div ngb-nav-item="'vertical-profile'">
            <button type="button" ngb-nav-link>Profile</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Profile</h3>
                <p class="mb-0">Manage your public information and preferences.</p>
            </ng-template>
        </div>
        <div ngb-nav-item="'vertical-security'">
            <button type="button" ngb-nav-link>Security</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Security</h3>
                <p class="mb-0">Review sessions, passwords and account access.</p>
            </ng-template>
        </div>
        <div ngb-nav-item="'vertical-notifications'">
            <button type="button" ngb-nav-link>Notifications</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Notifications</h3>
                <p class="mb-0">Choose when and how the application contacts you.</p>
            </ng-template>
        </div>
    </div>

    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>
</div>
`;
var verticalNavTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-vertical-nav",\n    controllerAs: "example",\n    templateUrl: "./vertical-nav.component.html",\n    styleUrl: "./vertical-nav.component.css",\n})\nexport class VerticalNavComponent {\n    public activeId = "vertical-profile";\n}\n';
var NavExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: simpleNavHtml,
        typescript: simpleNavTs
      },
      alternative: {
        html: alternativeNavHtml,
        typescript: alternativeNavTs
      },
      vertical: {
        html: verticalNavHtml,
        typescript: verticalNavTs
      },
      selecting: {
        html: selectingNavHtml,
        typescript: selectingNavTs
      },
      keepContent: {
        html: keepContentNavHtml,
        typescript: keepContentNavTs
      },
      dynamic: {
        html: dynamicNavHtml,
        typescript: dynamicNavTs
      },
      custom: {
        html: customNavHtml,
        typescript: customNavTs,
        css: customNavCss
      },
      global: {
        html: navGlobalHtml,
        typescript: navGlobalTs
      }
    };
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = "section[_content-6fdec1e3]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-6fdec1e3]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-6fdec1e3]{box-shadow:none}pre[_content-6fdec1e3]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
NavExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function NavExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NavExamplesPageComponent)();
    return instance;
  }
];
NavExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-nav-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/nav-examples-page.component-8b6b8e6c.html",
    "controllerAs": "$"
  }
};
NavExamplesPageComponent.ɵfac.ɵcomponent = true;
NavExamplesPageComponent.ɵfac.ɵtype = NavExamplesPageComponent;
export {
  NavExamplesPageComponent
};
