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
            var injector = angular.bootstrap(host, ["ɵroot"]);
            // El patch de ZonePatchesRuntime (setTimeout/addEventListener/Promise.then) necesita ESTE
            // $rootScope para saber a qué aplicarle $apply — no existe hasta que el bootstrap de verdad corrió.
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
              resolve(injector);
            }, reject);
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

  var ɵsetTimeout = window.setTimeout;
  window.setTimeout = function (fn, delay) {
    if (typeof fn !== "function") return ɵsetTimeout.apply(window, arguments);
    var extra = Array.prototype.slice.call(arguments, 2);
    var inside = ɵinside();
    return ɵsetTimeout.call(window, function () { ɵrunIn(inside, fn, null, extra); }, delay);
  };

  if (typeof window.requestAnimationFrame === "function") {
    var ɵrequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function (fn) {
      if (typeof fn !== "function") return ɵrequestAnimationFrame.apply(window, arguments);
      var inside = ɵinside();
      return ɵrequestAnimationFrame.call(window, function (time) { ɵrunIn(inside, fn, null, [time]); });
    };
  }

  if (typeof window.queueMicrotask === "function") {
    var ɵqueueMicrotask = window.queueMicrotask;
    window.queueMicrotask = function (fn) {
      if (typeof fn !== "function") return ɵqueueMicrotask.apply(window, arguments);
      var inside = ɵinside();
      return ɵqueueMicrotask.call(window, function () { ɵrunIn(inside, fn, null, []); });
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
    return ɵsetInterval.call(window, function () { ɵrunIn(inside, fn, null, extra); }, delay);
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
      return typeof fn === "function" ? function (value) { return ɵrunIn(inside, fn, undefined, [value]); } : fn;
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
import "./chunk-EXPZ26GU.js";

// src/app/features/tooltip/pages/tooltip-examples-page/tooltip-examples-page.component.ts
var autocloseHtml = `<ng-template ng-ref="example.contentTemplate">
    <button type="button" class="btn btn-sm btn-light">Click inside</button>
</ng-template>

<p>Every tooltip can also be closed with <kbd>Esc</kbd>.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'inside'" ngb-tooltip="example.contentTemplate">Inside clicks</button>
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'outside'" ngb-tooltip="example.contentTemplate">Outside clicks</button>
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="true" ngb-tooltip="example.contentTemplate">All clicks</button>
</div>
`;
var autocloseTs = 'import { Component, type TemplateRef } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-autoclose",\n    controllerAs: "example",\n    templateUrl: "./tooltip-autoclose.component.html",\n    styleUrl: "./tooltip-autoclose.component.css",\n})\nexport class TooltipAutocloseComponent {\n    public contentTemplate?: TemplateRef<unknown>;\n}\n';
var bodyHtml = `<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Inserted next to the trigger.'">Default</button>
        <button type="button" class="btn btn-outline-primary" placement="top" ngb-tooltip="'Appended directly to document.body.'" container="body">Append to body</button>
    </div>
</div>
`;
var bodyTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-body",\n    controllerAs: "example",\n    templateUrl: "./tooltip-body.component.html",\n    styleUrl: "./tooltip-body.component.css",\n})\nexport class TooltipBodyComponent {}\n';
var contextHtml = `<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>

<p>Pass a different context each time a tooltip is opened manually.</p>
<div class="d-flex flex-wrap gap-2 mb-4">
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.french" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.french, 'Bonjour')">French</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.german" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag')">German</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.english" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.english, 'Hello')">English</button>
</div>

<p>Alternatively, provide a default context through <code>tooltip-context</code>.</p>
<button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" tooltip-context="{ greeting: 'Hola' }">Spanish</button>
`;
var contextTs = 'import { Component, type TemplateRef } from "ngjs-core";\nimport type { NgbTooltip } from "ngb-js/tooltip";\n\n@Component({\n    selector: "docs-tooltip-context",\n    controllerAs: "example",\n    templateUrl: "./tooltip-context.component.html",\n    styleUrl: "./tooltip-context.component.css",\n})\nexport class TooltipContextComponent {\n    public name = "World";\n    public contentTemplate?: TemplateRef<unknown>;\n    public french?: NgbTooltip;\n    public german?: NgbTooltip;\n    public english?: NgbTooltip;\n\n    public toggleWithGreeting(tooltip: NgbTooltip, greeting: string): void {\n        tooltip.isOpen() ? tooltip.close() : tooltip.open({ greeting });\n    }\n}\n';
var customClassCss = ".tooltip-custom { --bs-tooltip-bg: var(--bs-primary-bg-subtle); --bs-tooltip-color: var(--bs-primary-text-emphasis); --bs-tooltip-opacity: 1; filter: drop-shadow(0 .35rem .8rem rgba(var(--bs-body-color-rgb), .18)); }\n";
var customClassHtml = `<button type="button" class="btn btn-outline-primary" ngb-tooltip="'A custom skin layered on top of Bootstrap tooltip variables.'" tooltip-class="tooltip-custom">
    Tooltip with custom class
</button>
`;
var customClassTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-custom-class",\n    controllerAs: "example",\n    templateUrl: "./tooltip-custom-class.component.html",\n    styleUrl: "./tooltip-custom-class.component.css",\n})\nexport class TooltipCustomClassComponent {}\n';
var customTargetHtml = `<div class="d-flex flex-wrap align-items-baseline gap-2">
    <span>You can hover</span>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'The button triggered me, but the text positioned me.'" position-target="#tooltip-position-target">this button</button>
    <span>while the tooltip appears over <strong id="tooltip-position-target" class="text-primary">this target</strong>.</span>
</div>
`;
var customTargetTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-custom-target",\n    controllerAs: "example",\n    templateUrl: "./tooltip-custom-target.component.html",\n    styleUrl: "./tooltip-custom-target.component.css",\n})\nexport class TooltipCustomTargetComponent {}\n';
var delaysHtml = `<p>Move the pointer into the tooltip before its close delay expires to keep it open.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after 300 ms and closes after 500 ms.'" triggers="mouseenter:mouseleave" open-delay="300" close-delay="500">300 / 500 ms</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after one second and closes after two.'" triggers="mouseenter:mouseleave" open-delay="1000" close-delay="2000">1 / 2 seconds</button>
</div>
`;
var delaysTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-delays",\n    controllerAs: "example",\n    templateUrl: "./tooltip-delays.component.html",\n    styleUrl: "./tooltip-delays.component.css",\n})\nexport class TooltipDelaysComponent {}\n';
var globalHtml = `<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p>
    </div>
</div>

<button type="button" class="btn btn-outline-primary" ngb-tooltip="'This instance reads every option from NgbTooltipConfig.'">Hover over me</button>
`;
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbTooltipConfig } from "ngb-js/tooltip";\n\n@Component({\n    selector: "docs-tooltip-global",\n    controllerAs: "example",\n    templateUrl: "./tooltip-global.component.html",\n    styleUrl: "./tooltip-global.component.css",\n})\nexport class TooltipGlobalComponent implements AfterViewInit, OnDestroy {\n    private readonly initialConfig: Pick<NgbTooltipConfig, "container" | "openDelay" | "placement" | "triggers">;\n\n    constructor(private readonly config: NgbTooltipConfig) {\n        this.initialConfig = {\n            container: config.container,\n            openDelay: config.openDelay,\n            placement: config.placement,\n            triggers: config.triggers,\n        };\n        config.container = "body";\n        config.openDelay = 300;\n        config.placement = "end";\n        config.triggers = "mouseenter:mouseleave";\n    }\n\n    public ngAfterViewInit(): void { this.restoreConfig(); }\n    public ngOnDestroy(): void { this.restoreConfig(); }\n\n    private restoreConfig(): void {\n        this.config.container = this.initialConfig.container;\n        this.config.openDelay = this.initialConfig.openDelay;\n        this.config.placement = this.initialConfig.placement;\n        this.config.triggers = this.initialConfig.triggers;\n    }\n}\n';
var placementsHtml = `<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Tooltip on top'">Top</button>
    <button type="button" class="btn btn-outline-secondary" placement="end" ngb-tooltip="'Tooltip on right'">Right</button>
    <button type="button" class="btn btn-outline-secondary" placement="bottom" ngb-tooltip="'Tooltip on bottom'">Bottom</button>
    <button type="button" class="btn btn-outline-secondary" placement="start" ngb-tooltip="'Tooltip on left'">Left</button>
</div>
`;
var placementsTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-placements",\n    controllerAs: "example",\n    templateUrl: "./tooltip-placements.component.html",\n    styleUrl: "./tooltip-placements.component.css",\n})\nexport class TooltipPlacementsComponent {}\n';
var templateHtml = `<ng-template ng-ref="example.contentTemplate">
    <span>Hello, <strong>{{ example.name }}</strong>!</span>
</ng-template>

<div class="d-flex flex-wrap align-items-center gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="example.contentTemplate">HTML and bindings</button>
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.name = example.name === 'NgbJS' ? 'AngularJS' : 'NgbJS'">Change binding</button>
</div>
`;
var templateTs = 'import { Component, type TemplateRef } from "ngjs-core";\n\n@Component({\n    selector: "docs-tooltip-template",\n    controllerAs: "example",\n    templateUrl: "./tooltip-template.component.html",\n    styleUrl: "./tooltip-template.component.css",\n})\nexport class TooltipTemplateComponent {\n    public name = "NgbJS";\n    public contentTemplate?: TemplateRef<unknown>;\n}\n';
var triggersHtml = `<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>
<button type="button" class="btn btn-outline-secondary mb-4" ngb-tooltip="'Shown while the pointer is over the trigger'" triggers="mouseenter:mouseleave">Hover over me</button>

<p class="mb-3">Manual triggers delegate opening and closing to application code.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="'Manually controlled tooltip'" triggers="manual" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbTooltip" ng-click="example.manual.open()">Open tooltip</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close tooltip</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.toggle()">Toggle tooltip</button>
</div>
`;
var triggersTs = 'import { Component } from "ngjs-core";\nimport type { NgbTooltip } from "ngb-js/tooltip";\n\n@Component({\n    selector: "docs-tooltip-triggers",\n    controllerAs: "example",\n    templateUrl: "./tooltip-triggers.component.html",\n    styleUrl: "./tooltip-triggers.component.css",\n})\nexport class TooltipTriggersComponent {\n    public manual?: NgbTooltip;\n}\n';
var TooltipExamplesPageComponent = class {
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
  var h = "styles/tooltip-examples-page.component-0d020fb9.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TooltipExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function TooltipExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TooltipExamplesPageComponent();
    return instance;
  }
];
TooltipExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-tooltip-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/tooltip-examples-page.component-ed2455d0.html",
    "controllerAs": "$"
  }
};
TooltipExamplesPageComponent.ɵfac.ɵcomponent = true;
TooltipExamplesPageComponent.ɵfac.ɵtype = TooltipExamplesPageComponent;
export {
  TooltipExamplesPageComponent
};
