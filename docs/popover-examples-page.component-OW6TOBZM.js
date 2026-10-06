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

// src/app/features/popover/pages/popover-examples-page/popover-examples-page.component.ts
var autocloseTs = 'import { Component } from "ngjs-core";\nimport type { NgbPopover } from "ngb-js/popover";\n\n@Component({\n    selector: "docs-popover-autoclose",\n    controllerAs: "example",\n    templateUrl: "./popover-autoclose.component.html",\n    styleUrl: "./popover-autoclose.component.css",\n})\nexport class PopoverAutocloseComponent {\n    public popover?: NgbPopover;\n}\n';
var autocloseHtml = `<p>Every popover also closes with <kbd>Esc</kbd>.</p>
<div class="vstack gap-3 align-items-start">
    <button type="button" class="btn btn-outline-secondary" auto-close="'inside'" ngb-popover="'Click this content or press Escape'" popover-title="'Inside clicks'">Close on inside click</button>
    <button type="button" class="btn btn-outline-secondary" auto-close="'outside'" ngb-popover="'Click elsewhere or press Escape'" popover-title="'Outside clicks'">Close on outside click</button>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" auto-close="true" ngb-popover="'Click anywhere or press Escape'" popover-title="'All clicks'" ng-ref="example.popover" ng-ref-read="ngbPopover">Close on every click</button>
        <button type="button" class="btn btn-outline-secondary" ng-click="example.popover.toggle()">External toggle</button>
    </div>
</div>
`;
var bodyTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-body",\n    controllerAs: "example",\n    templateUrl: "./popover-body.component.html",\n    styleUrl: "./popover-body.component.css",\n})\nexport class PopoverBodyComponent {}\n';
var bodyHtml = `<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Inserted next to the trigger.'">Default</button>
        <button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Appended directly to document.body.'" container="'body'">Append to body</button>
    </div>
</div>
`;
var contextTs = 'import { Component } from "ngjs-core";\nimport type { NgbPopover } from "ngb-js/popover";\nimport type { TemplateRef } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-context",\n    controllerAs: "example",\n    templateUrl: "./popover-context.component.html",\n    styleUrl: "./popover-context.component.css",\n})\nexport class PopoverContextComponent {\n    public name = "World";\n    public contentTemplate?: TemplateRef<unknown>;\n    public titleTemplate?: TemplateRef<unknown>;\n    public french?: NgbPopover;\n    public german?: NgbPopover;\n    public english?: NgbPopover;\n\n    public toggleWithGreeting(popover: NgbPopover, greeting: string, language: string) {\n        popover.isOpen() ? popover.close() : popover.open({ greeting, language });\n    }\n}\n';
var contextHtml = `<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>
<ng-template ng-ref="example.titleTemplate" let-language="language">Greeting in {{ language }}</ng-template>

<p>You can pass context when manually opening a popover.</p>
<div class="d-flex flex-wrap gap-2 mb-4">
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.french" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.french, 'Bonjour', 'French')">French</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.german" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag', 'German')">German</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.english" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.english, 'Hello', 'English')">English</button>
</div>

<p>Alternatively, provide a default context through <code>popover-context</code>.</p>
<button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" popover-context="{ language: '中文', greeting: '你好' }">Chinese</button>
`;
var customClassCss = ".popover-custom { --bs-popover-border-color: var(--bs-primary-border-subtle); --bs-popover-header-bg: var(--bs-primary-bg-subtle); --bs-popover-header-color: var(--bs-primary-text-emphasis); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .12); }\n";
var customClassTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-custom-class",\n    controllerAs: "example",\n    templateUrl: "./popover-custom-class.component.html",\n    styleUrl: "./popover-custom-class.component.css",\n})\nexport class PopoverCustomClassComponent {}\n';
var customClassHtml = `<button type="button" class="btn btn-outline-primary" ngb-popover="'A small custom skin layered on top of Bootstrap variables.'" popover-title="'NgbJS popover'" popover-class="popover-custom">
    Popover with custom class
</button>
`;
var customTargetTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-custom-target",\n    controllerAs: "example",\n    templateUrl: "./popover-custom-target.component.html",\n    styleUrl: "./popover-custom-target.component.css",\n})\nexport class PopoverCustomTargetComponent {}\n';
var customTargetHtml = `<div class="d-flex flex-wrap align-items-baseline gap-2">
    <span>You can click</span>
    <button class="btn btn-outline-secondary" type="button" ngb-popover="'The button triggered me, but this text positioned me.'" popover-title="'Custom target'" position-target="'#popover-position-target'">this button</button>
    <span>but the popover appears over <strong id="popover-position-target" class="text-primary">this target</strong>.</span>
</div>
`;
var delaysTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-delays",\n    controllerAs: "example",\n    templateUrl: "./popover-delays.component.html",\n    styleUrl: "./popover-delays.component.css",\n})\nexport class PopoverDelaysComponent {}\n';
var delaysHtml = `<p>Move the pointer into the popover before its close delay expires to keep it open.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after 300 ms and closes after 500 ms.'" triggers="'mouseenter:mouseleave'" open-delay="300" close-delay="500">300 / 500 ms</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after one second and closes after two.'" triggers="'mouseenter:mouseleave'" open-delay="1000" close-delay="2000">1 / 2 seconds</button>
</div>
`;
var eventsTs = 'import { Component } from "ngjs-core";\nimport type { NgbPopover } from "ngb-js/popover";\n\n@Component({\n    selector: "docs-popover-events",\n    controllerAs: "example",\n    templateUrl: "./popover-events.component.html",\n    styleUrl: "./popover-events.component.css",\n})\nexport class PopoverEventsComponent {\n    public popover?: NgbPopover;\n    public events: { name: string; time: Date }[] = [];\n    public record(name: string) { this.events.unshift({ name, time: new Date() }); }\n}\n';
var eventsHtml = `<button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Watch the event log below.'" popover-title="'Visibility events'" shown="example.record('shown')" hidden="example.record('hidden')" ng-ref="example.popover" ng-ref-read="ngbPopover">
    Toggle popover
</button>

<div class="mt-4">
    <p class="mb-2">Current state: <code>{{ example.popover.isOpen() ? 'open' : 'closed' }}</code></p>
    <ul class="list-group list-group-flush" ng-if="example.events.length">
        <li class="list-group-item px-0 py-2" ng-repeat="event in example.events track by $index"><code>{{ event.name }}</code> at {{ event.time | date:'mediumTime' }}</li>
    </ul>
    <p class="text-body-secondary mb-0" ng-if="!example.events.length">No events recorded yet.</p>
</div>
`;
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbPopoverConfig } from "ngb-js/popover";\n\n@Component({\n    selector: "docs-popover-global",\n    controllerAs: "example",\n    templateUrl: "./popover-global.component.html",\n    styleUrl: "./popover-global.component.css",\n})\nexport class PopoverGlobalComponent implements AfterViewInit, OnDestroy {\n    private readonly initialConfig: Pick<NgbPopoverConfig, "container" | "openDelay" | "placement" | "triggers">;\n\n    constructor(private readonly config: NgbPopoverConfig) {\n        this.initialConfig = {\n            container: config.container,\n            openDelay: config.openDelay,\n            placement: config.placement,\n            triggers: config.triggers,\n        };\n        config.container = "body";\n        config.openDelay = 300;\n        config.placement = "end";\n        config.triggers = "mouseenter:mouseleave";\n    }\n\n    public ngAfterViewInit() { this.restoreConfig(); }\n    public ngOnDestroy() { this.restoreConfig(); }\n    private restoreConfig() {\n        this.config.container = this.initialConfig.container;\n        this.config.openDelay = this.initialConfig.openDelay;\n        this.config.placement = this.initialConfig.placement;\n        this.config.triggers = this.initialConfig.triggers;\n    }\n}\n';
var globalHtml = `<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p></div>
</div>
<button type="button" class="btn btn-outline-primary" ngb-popover="'This instance reads every option from NgbPopoverConfig.'" popover-title="'Configured globally'">Hover over me</button>
`;
var manualTs = 'import { Component } from "ngjs-core";\nimport type { NgbPopover } from "ngb-js/popover";\n\n@Component({\n    selector: "docs-popover-manual-control",\n    controllerAs: "example",\n    templateUrl: "./popover-manual-control.component.html",\n    styleUrl: "./popover-manual-control.component.css",\n})\nexport class PopoverManualControlComponent {\n    public popover?: NgbPopover;\n}\n';
var manualHtml = `<button type="button" class="btn btn-primary mb-3" ngb-popover="'This target is controlled by the buttons below'" popover-title="'External controls'" triggers="'manual'" auto-close="false" ng-ref="example.popover" ng-ref-read="ngbPopover">
    Popover target
</button>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.open()">Open</button>
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.close()">Close</button>
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.toggle()">Toggle</button>
</div>
`;
var placementsTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-placements",\n    controllerAs: "example",\n    templateUrl: "./popover-placements.component.html",\n    styleUrl: "./popover-placements.component.css",\n})\nexport class PopoverPlacementsComponent {}\n';
var placementsHtml = `<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Popover content'" popover-title="'Popover on top'">Top</button>
    <button type="button" class="btn btn-outline-secondary" placement="'end'" ngb-popover="'Popover content'" popover-title="'Popover on right'">Right</button>
    <button type="button" class="btn btn-outline-secondary" placement="'bottom'" ngb-popover="'Popover content'" popover-title="'Popover on bottom'">Bottom</button>
    <button type="button" class="btn btn-outline-secondary" placement="'start'" ngb-popover="'Popover content'" popover-title="'Popover on left'">Left</button>
</div>
`;
var templateTs = 'import { Component } from "ngjs-core";\nimport type { TemplateRef } from "ngjs-core";\n\n@Component({\n    selector: "docs-popover-template",\n    controllerAs: "example",\n    templateUrl: "./popover-template.component.html",\n    styleUrl: "./popover-template.component.css",\n})\nexport class PopoverTemplateComponent {\n    public name = "NgbJS";\n    public contentTemplate?: TemplateRef<unknown>;\n    public titleTemplate?: TemplateRef<unknown>;\n}\n';
var templateHtml = `<ng-template ng-ref="example.titleTemplate">
    <span class="d-flex align-items-center gap-2"><i class="bi bi-code-slash" aria-hidden="true"></i><strong>Template content</strong></span>
</ng-template>
<ng-template ng-ref="example.contentTemplate">
    <p class="mb-2">Hello, <strong>{{ example.name }}</strong>!</p>
    <button class="btn btn-sm btn-primary" type="button" ng-click="example.name = 'AngularJS'">Update binding</button>
</ng-template>

<button type="button" class="btn btn-outline-primary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate">
    HTML and bindings
</button>
`;
var triggersTs = 'import { Component } from "ngjs-core";\nimport type { NgbPopover } from "ngb-js/popover";\n\n@Component({\n    selector: "docs-popover-triggers",\n    controllerAs: "example",\n    templateUrl: "./popover-triggers.component.html",\n    styleUrl: "./popover-triggers.component.css",\n})\nexport class PopoverTriggersComponent {\n    public manual?: NgbPopover;\n}\n';
var triggersHtml = `<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>
<button type="button" class="btn btn-outline-secondary mb-4" ngb-popover="'Shown while the pointer is over the trigger'" popover-title="'Hover trigger'" triggers="'mouseenter:mouseleave'">
    Hover over me
</button>

<p class="mb-3">A manual trigger delegates opening and closing to application code.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-popover="'Manually controlled content'" popover-title="'Manual popover'" triggers="'manual'" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbPopover" ng-click="example.manual.open()">
        Open popover
    </button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close popover</button>
</div>
`;
var PopoverExamplesPageComponent = class {
  constructor() {
    this.examples = {
      placements: {
        html: placementsHtml,
        typescript: placementsTs
      },
      template: {
        html: templateHtml,
        typescript: templateTs
      },
      triggers: {
        html: triggersHtml,
        typescript: triggersTs
      },
      manual: {
        html: manualHtml,
        typescript: manualTs
      },
      autoclose: {
        html: autocloseHtml,
        typescript: autocloseTs
      },
      context: {
        html: contextHtml,
        typescript: contextTs
      },
      customTarget: {
        html: customTargetHtml,
        typescript: customTargetTs
      },
      delays: {
        html: delaysHtml,
        typescript: delaysTs
      },
      events: {
        html: eventsHtml,
        typescript: eventsTs
      },
      body: {
        html: bodyHtml,
        typescript: bodyTs
      },
      customClass: {
        html: customClassHtml,
        typescript: customClassTs,
        css: customClassCss
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
  s.textContent = "section[_content-7b281dc8]{scroll-margin-top:5rem}[ngb-scroll-spy-fragment][_content-7b281dc8]{border-color:color-mix(in srgb,var(--bs-border-color) 78%,transparent)!important}.btn[_content-7b281dc8]{box-shadow:none}pre[_content-7b281dc8]{border-color:var(--bs-border-color)}";
  document.head.appendChild(s);
})();
PopoverExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverExamplesPageComponent)();
    return instance;
  }
];
PopoverExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-examples-page.component-8e345b57.html",
    "controllerAs": "$"
  }
};
PopoverExamplesPageComponent.ɵfac.ɵcomponent = true;
PopoverExamplesPageComponent.ɵfac.ɵtype = PopoverExamplesPageComponent;
export {
  PopoverExamplesPageComponent
};
