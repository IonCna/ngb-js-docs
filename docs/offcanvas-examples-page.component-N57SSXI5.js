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

// src/app/features/offcanvas/pages/offcanvas-examples-page/offcanvas-examples-page.component.ts
var offcanvasComponentContentHtml = '<button type="button" class="btn btn-primary" ng-click="example.open()">Open component offcanvas</button>\n<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>\n';
var offcanvasComponentContentTs = 'import { Component } from "ngjs-core";\nimport { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"\nimport { NgbOffcanvas } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-component-content",\n    controllerAs: "example",\n    templateUrl: "./offcanvas-component-content.component.html",\n    styleUrl: "./offcanvas-component-content.component.css",\n})\nexport class OffcanvasComponentContentComponent {\n    public lastResult = "No result yet";\n\n    constructor(private readonly offcanvas: NgbOffcanvas) {}\n\n    public async open() {\n        const offcanvasRef = await this.offcanvas.open(OffcanvasDemoContentComponent);\n\n        offcanvasRef.closed.subscribe((result) => {\n            this.lastResult = `Closed with: ${result}`;\n        });\n\n        offcanvasRef.dismissed.subscribe((reason) => {\n            this.lastResult = `Dismissed with: ${reason}`;\n        });\n    }\n}\n';
var offcanvasDefaultHtml = `<button type="button" class="btn btn-primary" ng-click="example.open()">Open default offcanvas</button>

<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">
    <div class="offcanvas-header">
        <h2 class="offcanvas-title fs-5">Default offcanvas</h2>
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>
    </div>
    <div class="offcanvas-body">
        <p>This offcanvas uses the global defaults without passing local options.</p>
        <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>
            <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>
        </div>
    </div>
</ng-template>
`;
var offcanvasDefaultTs = 'import { Component, TemplateRef, ViewChild } from "ngjs-core";\nimport { NgbOffcanvas } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-default",\n    controllerAs: "example",\n    templateUrl: "./offcanvas-default.component.html",\n    styleUrl: "./offcanvas-default.component.css",\n})\nexport class OffcanvasDefaultComponent {\n    @ViewChild("content", { read: TemplateRef, static: true })\n    private content!: TemplateRef<unknown>;\n\n    constructor(private readonly offcanvas: NgbOffcanvas) {}\n\n    public open() {\n        this.offcanvas.open(this.content);\n    }\n}\n';
var offcanvasDemoContentHtml = `<div class="offcanvas-header">
    <h2 class="offcanvas-title fs-5">Component offcanvas</h2>
    <button
        type="button"
        class="btn-close"
        aria-label="Close"
        ng-click="$.ngbActiveOffcanvas.dismiss('header close')">
    </button>
</div>

<div class="offcanvas-body">
    <p>This panel receives a registered component as its content.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveOffcanvas.dismiss('cancel')">
            Cancel
        </button>
        <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close('accepted')">
            Continue
        </button>
    </div>
</div>
`;
var offcanvasDemoContentTs = 'import { Component, Input } from "ngjs-core";\nimport type { NgbActiveOffcanvas } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-demo-content",\n    controllerAs: "$",\n    templateUrl: "./offcanvas-demo-content.component.html",\n    styleUrl: "./offcanvas-demo-content.component.css",\n})\nexport class OffcanvasDemoContentComponent {\n    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;\n}\n';
var offcanvasFocusHtml = '<p class="text-body-secondary">\n    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.\n</p>\n\n<div class="d-flex flex-wrap gap-2">\n    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">Focus first element</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">Use ngbAutofocus</button>\n</div>\n';
var offcanvasFocusTs = 'import { Component } from "ngjs-core";\nimport { OffcanvasFocusContentComponent } from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component"\nimport { NgbOffcanvas } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-focus",\n    controllerAs: "example",\n    templateUrl: "./offcanvas-focus.component.html",\n    styleUrl: "./offcanvas-focus.component.css",\n})\nexport class OffcanvasFocusComponent {\n    constructor(private readonly offcanvas: NgbOffcanvas) {}\n\n    public openDefaultFocus() {\n        this.offcanvas.open(OffcanvasFocusContentComponent, {\n            ariaLabelledBy: "offcanvas-focus-title",\n            bindings: { autofocus: false },\n        });\n    }\n\n    public openCustomFocus() {\n        this.offcanvas.open(OffcanvasFocusContentComponent, {\n            ariaLabelledBy: "offcanvas-focus-title",\n            bindings: { autofocus: true },\n        });\n    }\n}\n';
var offcanvasFocusContentHtml = '<div class="offcanvas-header">\n    <h2 class="offcanvas-title fs-5" id="offcanvas-focus-title">Focus management</h2>\n</div>\n\n<div class="offcanvas-body">\n    <div class="mb-3">\n        <label class="form-label" for="offcanvas-first-focusable">First focusable element</label>\n        <input id="offcanvas-first-focusable" type="text" class="form-control" placeholder="Focused by default">\n    </div>\n\n    <div class="mb-3" ng-if="$.autofocus">\n        <label class="form-label" for="offcanvas-custom-autofocus">Custom autofocus target</label>\n        <input\n            id="offcanvas-custom-autofocus"\n            type="text"\n            class="form-control"\n            placeholder="Focused through ngbAutofocus"\n            ngbAutofocus>\n    </div>\n\n    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close()">Done</button>\n</div>\n';
var offcanvasFocusContentTs = 'import { Component, Input } from "ngjs-core";\nimport type { NgbActiveOffcanvas } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-focus-content",\n    controllerAs: "$",\n    templateUrl: "./offcanvas-focus-content.component.html",\n    styleUrl: "./offcanvas-focus-content.component.css",\n})\nexport class OffcanvasFocusContentComponent {\n    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;\n    @Input() autofocus = false;\n}\n';
var offcanvasGlobalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">\n            The panel opens from the end, allows body scrolling, uses a static backdrop and ignores Escape.\n            This documentation example restores the shared defaults immediately after opening.\n        </p>\n    </div>\n</div>\n\n<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured offcanvas</button>\n';
var offcanvasGlobalTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"\nimport { NgbOffcanvas, NgbOffcanvasConfig } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-global",\n    controllerAs: "example",\n    templateUrl: "./offcanvas-global.component.html",\n    styleUrl: "./offcanvas-global.component.css",\n})\nexport class OffcanvasGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<\n        NgbOffcanvasConfig,\n        "backdrop" | "keyboard" | "position" | "scroll"\n    >;\n\n    constructor(\n        private readonly offcanvas: NgbOffcanvas,\n        private readonly config: NgbOffcanvasConfig,\n    ) {\n        this.initialConfig = {\n            backdrop: config.backdrop,\n            keyboard: config.keyboard,\n            position: config.position,\n            scroll: config.scroll,\n        };\n    }\n\n    public async open() {\n        this.applyConfig();\n\n        try {\n            await this.offcanvas.open(OffcanvasDemoContentComponent);\n        } finally {\n            this.restoreConfig();\n        }\n    }\n\n    public ngOnDestroy() {\n        this.restoreConfig();\n    }\n\n    private applyConfig() {\n        this.config.backdrop = "static";\n        this.config.keyboard = false;\n        this.config.position = "end";\n        this.config.scroll = true;\n    }\n\n    private restoreConfig() {\n        this.config.backdrop = this.initialConfig.backdrop;\n        this.config.keyboard = this.initialConfig.keyboard;\n        this.config.position = this.initialConfig.position;\n        this.config.scroll = this.initialConfig.scroll;\n    }\n}\n';
var offcanvasOptionsCss = ".panel { --bs-offcanvas-width: 28rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .14); }\n.panel .offcanvas-header { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 55%, var(--bs-body-bg)); }\n.backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }\n";
var offcanvasOptionsHtml = '<div class="d-flex flex-wrap gap-2">\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomPanel()">Custom panel class</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openStart()">Start</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openEnd()">End</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openTop()">Top</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openBottom()">Bottom</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollableBody()">Body scrolling</button>\n</div>\n';
var offcanvasOptionsTs = 'import { Component } from "ngjs-core";\nimport { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"\nimport { NgbOffcanvas, type NgbOffcanvasOptions } from "ngb-js/offcanvas";\n\n@Component({\n    selector: "docs-offcanvas-options",\n    controllerAs: "example",\n    templateUrl: "./offcanvas-options.component.html",\n    styleUrl: "./offcanvas-options.component.css",\n})\nexport class OffcanvasOptionsComponent {\n    constructor(private readonly offcanvas: NgbOffcanvas) {}\n\n    public openCustomPanel() {\n        this.open({ panelClass: "panel" });\n    }\n\n    public openStaticBackdrop() {\n        this.open({\n            backdrop: "static",\n            backdropClass: "backdrop",\n            keyboard: false,\n        });\n    }\n\n    public openStart() {\n        this.open({ position: "start" });\n    }\n\n    public openEnd() {\n        this.open({ position: "end" });\n    }\n\n    public openTop() {\n        this.open({ position: "top" });\n    }\n\n    public openBottom() {\n        this.open({ position: "bottom" });\n    }\n\n    public openScrollableBody() {\n        this.open({ scroll: true, backdrop: false });\n    }\n\n    private open(options: NgbOffcanvasOptions) {\n        this.offcanvas.open(OffcanvasDemoContentComponent, options);\n    }\n}\n';
var OffcanvasExamplesPageComponent = class {
  constructor() {
    this.examples = {
      defaults: {
        html: offcanvasDefaultHtml,
        typescript: offcanvasDefaultTs
      },
      componentContent: {
        html: `<!-- offcanvas-component-content.component.html -->
${offcanvasComponentContentHtml}

<!-- offcanvas-demo-content.component.html -->
${offcanvasDemoContentHtml}`,
        typescript: `${offcanvasComponentContentTs}

// offcanvas-demo-content.component.ts
${offcanvasDemoContentTs}`
      },
      focus: {
        html: `<!-- offcanvas-focus.component.html -->
${offcanvasFocusHtml}

<!-- offcanvas-focus-content.component.html -->
${offcanvasFocusContentHtml}`,
        typescript: `${offcanvasFocusTs}

// offcanvas-focus-content.component.ts
${offcanvasFocusContentTs}`
      },
      options: {
        html: offcanvasOptionsHtml,
        typescript: offcanvasOptionsTs,
        css: offcanvasOptionsCss
      },
      global: {
        html: offcanvasGlobalHtml,
        typescript: offcanvasGlobalTs
      }
    };
  }
};
(function() {
  var h = "styles/offcanvas-examples-page.component-e3c2e27e.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
OffcanvasExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function OffcanvasExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new OffcanvasExamplesPageComponent();
    return instance;
  }
];
OffcanvasExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-offcanvas-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/offcanvas-examples-page.component-c094aaaa.html",
    "controllerAs": "$"
  }
};
OffcanvasExamplesPageComponent.ɵfac.ɵcomponent = true;
OffcanvasExamplesPageComponent.ɵfac.ɵtype = OffcanvasExamplesPageComponent;
export {
  OffcanvasExamplesPageComponent
};
