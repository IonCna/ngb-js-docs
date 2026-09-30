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

// src/app/features/modal/pages/modal-examples-page/modal-examples-page.component.ts
var modalComponentContentTs = 'import { Component } from "ngjs-core";\nimport { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"\nimport { NgbModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-component-content",\n    controllerAs: "example",\n    templateUrl: "./modal-component-content.component.html",\n    styleUrl: "./modal-component-content.component.css",\n})\nexport class ModalComponentContentComponent {\n    public lastResult = "No result yet";\n\n    constructor(private readonly modal: NgbModal) {}\n\n    public async open() {\n        const modalRef = await this.modal.open(ModalDemoContentComponent, {\n            bindings: {\n                title: "Component as content",\n                description: "NgbActiveModal is provided directly to the content component.",\n            },\n        });\n\n        modalRef.closed.subscribe((result) => {\n            this.lastResult = `Closed with: ${result}`;\n        });\n\n        modalRef.dismissed.subscribe((reason) => {\n            this.lastResult = `Dismissed with: ${reason}`;\n        });\n    }\n}\n';
var modalDefaultTs = 'import { Component, TemplateRef, ViewChild } from "ngjs-core";\nimport { NgbModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-default",\n    controllerAs: "example",\n    templateUrl: "./modal-default.component.html",\n    styleUrl: "./modal-default.component.css",\n})\nexport class ModalDefaultComponent {\n    @ViewChild("content", { read: TemplateRef, static: true })\n    private content!: TemplateRef<unknown>;\n\n    constructor(private readonly modal: NgbModal) {}\n\n    public open() {\n        this.modal.open(this.content);\n    }\n}\n';
var modalDemoContentTs = 'import { Component, Input } from "ngjs-core";\nimport type { NgbActiveModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-demo-content",\n    controllerAs: "$",\n    templateUrl: "./modal-demo-content.component.html",\n    styleUrl: "./modal-demo-content.component.css",\n})\nexport class ModalDemoContentComponent {\n    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\n    @Input() title = "Component modal";\n    @Input() description = "This modal receives a component as its content.";\n    @Input() longContent = false;\n    public readonly items = Array.from({ length: 24 }, (_, index) => `Scrollable content row ${index + 1}`);\n}\n';
var modalFocusTs = 'import { Component } from "ngjs-core";\nimport { ModalFocusContentComponent } from "@/features/modal/components/modal-focus-content/modal-focus-content.component"\nimport { NgbModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-focus",\n    controllerAs: "example",\n    templateUrl: "./modal-focus.component.html",\n    styleUrl: "./modal-focus.component.css",\n})\nexport class ModalFocusComponent {\n    constructor(private readonly modal: NgbModal) {}\n\n    public openDefaultFocus() {\n        this.modal.open(ModalFocusContentComponent, {\n            ariaLabelledBy: "modal-focus-title",\n            bindings: { autofocus: false },\n        });\n    }\n\n    public openCustomFocus() {\n        this.modal.open(ModalFocusContentComponent, {\n            ariaLabelledBy: "modal-focus-title",\n            bindings: { autofocus: true },\n        });\n    }\n}\n';
var modalFocusContentTs = 'import { Component, Input } from "ngjs-core";\nimport type { NgbActiveModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-focus-content",\n    controllerAs: "$",\n    templateUrl: "./modal-focus-content.component.html",\n    styleUrl: "./modal-focus-content.component.css",\n})\nexport class ModalFocusContentComponent {\n    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\n    @Input() autofocus = false;\n}\n';
var modalGlobalTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"\nimport { NgbModal, NgbModalConfig } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-global",\n    controllerAs: "example",\n    templateUrl: "./modal-global.component.html",\n    styleUrl: "./modal-global.component.css",\n})\nexport class ModalGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<NgbModalConfig, "backdrop" | "centered" | "keyboard" | "size">;\n\n    constructor(\n        private readonly modal: NgbModal,\n        private readonly config: NgbModalConfig,\n    ) {\n        this.initialConfig = {\n            backdrop: config.backdrop,\n            centered: config.centered,\n            keyboard: config.keyboard,\n            size: config.size,\n        };\n\n    }\n\n    public async open() {\n        this.applyConfig();\n\n        try {\n            await this.modal.open(ModalDemoContentComponent, {\n                bindings: {\n                    title: "Globally configured modal",\n                    description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click.",\n                },\n            });\n        } finally {\n            this.restoreConfig();\n        }\n    }\n\n    public ngOnDestroy() {\n        this.restoreConfig();\n    }\n\n    private applyConfig() {\n        this.config.backdrop = "static";\n        this.config.centered = true;\n        this.config.keyboard = false;\n        this.config.size = "lg";\n    }\n\n    private restoreConfig() {\n        this.config.backdrop = this.initialConfig.backdrop;\n        this.config.centered = this.initialConfig.centered;\n        this.config.keyboard = this.initialConfig.keyboard;\n        this.config.size = this.initialConfig.size;\n    }\n}\n';
var modalOptionsCss = ".window .modal-content { border-top: .35rem solid var(--bs-primary); box-shadow: 0 1.5rem 4rem rgba(var(--bs-body-color-rgb), .2); }\n.backdrop, .updated-backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }\n.dialog .modal-content, .updated-dialog .modal-content { border-radius: 1.5rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .18); }\n.updated-window .modal-content { border-color: var(--bs-success); box-shadow: 0 1rem 3rem rgba(var(--bs-body-color-rgb), .18); }\n";
var modalOptionsTs = 'import { Component } from "ngjs-core";\nimport { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"\nimport { NgbModal, type NgbModalOptions } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-options",\n    controllerAs: "example",\n    templateUrl: "./modal-options.component.html",\n    styleUrl: "./modal-options.component.css",\n})\nexport class ModalOptionsComponent {\n    constructor(private readonly modal: NgbModal) {}\n\n    public openCustomWindow() {\n        this.open("Custom window class", { windowClass: "window" });\n    }\n\n    public openStaticBackdrop() {\n        this.open("Static custom backdrop", {\n            backdrop: "static",\n            backdropClass: "backdrop",\n            keyboard: false,\n        });\n    }\n\n    public openSmall() {\n        this.open("Small modal", { size: "sm" });\n    }\n\n    public openLarge() {\n        this.open("Large modal", { size: "lg" });\n    }\n\n    public openExtraLarge() {\n        this.open("Extra large modal", { size: "xl" });\n    }\n\n    public openFullscreen() {\n        this.open("Fullscreen modal", { fullscreen: true });\n    }\n\n    public openCentered() {\n        this.open("Vertically centered modal", { centered: true });\n    }\n\n    public openScrollable() {\n        this.open("Scrollable modal", { scrollable: true, size: "lg" }, true);\n    }\n\n    public openCustomDialog() {\n        this.open("Custom dialog class", { modalDialogClass: "dialog" });\n    }\n\n    private open(title: string, options: NgbModalOptions, longContent = false) {\n        this.modal.open(ModalDemoContentComponent, {\n            ...options,\n            bindings: {\n                title,\n                description: "These values are applied only to this modal instance.",\n                longContent,\n            },\n        });\n    }\n}\n';
var modalStackedTs = 'import { Component } from "ngjs-core";\nimport { ModalStackedContentComponent } from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component"\nimport { NgbModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-stacked",\n    controllerAs: "example",\n    templateUrl: "./modal-stacked.component.html",\n    styleUrl: "./modal-stacked.component.css",\n})\nexport class ModalStackedComponent {\n    constructor(private readonly modal: NgbModal) {}\n\n    public async openStack() {\n        for (let level = 1; level <= 3; level++) {\n            await this.modal.open(ModalStackedContentComponent, {\n                bindings: {\n                    level,\n                },\n            });\n        }\n    }\n}\n';
var modalStackedContentTs = 'import { Component, Input } from "ngjs-core";\nimport { NgbModal, type NgbActiveModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-stacked-content",\n    controllerAs: "$",\n    templateUrl: "./modal-stacked-content.component.html",\n    styleUrl: "./modal-stacked-content.component.css",\n})\nexport class ModalStackedContentComponent {\n    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\n    @Input() level = 1;\n\n    constructor(private readonly modal: NgbModal) {}\n\n    public dismissAll() {\n        this.modal.dismissAll("Dismiss all");\n    }\n}\n';
var modalUpdatableTs = 'import { Component } from "ngjs-core";\nimport { ModalUpdatableContentComponent } from "@/features/modal/components/modal-updatable-content/modal-updatable-content.component"\nimport { NgbModal } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-updatable",\n    controllerAs: "example",\n    templateUrl: "./modal-updatable.component.html",\n    styleUrl: "./modal-updatable.component.css",\n})\nexport class ModalUpdatableComponent {\n    constructor(private readonly modal: NgbModal) {}\n\n    public open() {\n        this.modal.open(ModalUpdatableContentComponent, {\n            ariaLabelledBy: "updatable-modal-title",\n            ariaDescribedBy: "updatable-modal-description",\n            size: "sm",\n        });\n    }\n}\n';
var modalUpdatableContentTs = 'import { Component, Input } from "ngjs-core";\nimport type { NgbActiveModal, NgbModalUpdatableOptions } from "ngb-js/modal";\n\n@Component({\n    selector: "docs-modal-updatable-content",\n    controllerAs: "$",\n    templateUrl: "./modal-updatable-content.component.html",\n    styleUrl: "./modal-updatable-content.component.css",\n})\nexport class ModalUpdatableContentComponent {\n    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\n    public ariaReferences = true;\n    public centered = false;\n    public fullscreen = false;\n    public customBackdrop = false;\n    public size: NgbModalUpdatableOptions["size"] = "sm";\n    public customWindow = false;\n    public customDialog = false;\n\n    public toggleAriaReferences() {\n        this.ariaReferences = !this.ariaReferences;\n        this.ngbActiveModal.update({\n            ariaLabelledBy: this.ariaReferences ? "updatable-modal-title" : "",\n            ariaDescribedBy: this.ariaReferences ? "updatable-modal-description" : "",\n        });\n    }\n\n    public toggleCentered() {\n        this.centered = !this.centered;\n        this.ngbActiveModal.update({ centered: this.centered });\n    }\n\n    public toggleFullscreen() {\n        this.fullscreen = !this.fullscreen;\n        this.ngbActiveModal.update({ fullscreen: this.fullscreen });\n    }\n\n    public toggleBackdropClass() {\n        this.customBackdrop = !this.customBackdrop;\n        this.ngbActiveModal.update({ backdropClass: this.customBackdrop ? "updated-backdrop" : "" });\n    }\n\n    public cycleSize() {\n        const sizes: Array<NgbModalUpdatableOptions["size"]> = ["sm", "lg", "xl"];\n        this.size = sizes[(sizes.indexOf(this.size) + 1) % sizes.length];\n        this.ngbActiveModal.update({ size: this.size });\n    }\n\n    public toggleWindowClass() {\n        this.customWindow = !this.customWindow;\n        this.ngbActiveModal.update({ windowClass: this.customWindow ? "updated-window" : "" });\n    }\n\n    public toggleDialogClass() {\n        this.customDialog = !this.customDialog;\n        this.ngbActiveModal.update({ modalDialogClass: this.customDialog ? "updated-dialog" : "" });\n    }\n}\n';
var modalDefaultHtml = `<button type="button" class="btn btn-primary" ng-click="example.open()">Open default modal</button>

<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">
    <div class="modal-header">
        <h2 class="modal-title fs-5">Default modal</h2>
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>
    </div>
    <div class="modal-body">
        <p class="mb-0">This modal uses the global defaults without passing local options.</p>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>
        <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>
    </div>
</ng-template>
`;
var modalComponentContentHtml = '<button type="button" class="btn btn-primary" ng-click="example.open()">Open component modal</button>\n<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>\n';
var modalDemoContentHtml = `<div class="modal-header">
    <h2 class="modal-title fs-5">{{ $.title }}</h2>
    <button
        type="button"
        class="btn-close"
        aria-label="Close"
        ng-click="$.ngbActiveModal.dismiss('header close')">
    </button>
</div>

<div class="modal-body">
    <p ng-class="{ 'mb-0': !$.longContent }">{{ $.description }}</p>

    <div class="list-group" ng-if="$.longContent">
        <div class="list-group-item" ng-repeat="item in $.items track by $index">{{ item }}</div>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveModal.dismiss('cancel')">
        Cancel
    </button>
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close('accepted')">
        Continue
    </button>
</div>
`;
var modalFocusHtml = '<p class="text-body-secondary">\n    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.\n</p>\n\n<div class="d-flex flex-wrap gap-2">\n    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">\n        Focus first element\n    </button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">\n        Use ngbAutofocus\n    </button>\n</div>\n';
var modalFocusContentHtml = '<div class="modal-header">\n    <h2 class="modal-title fs-5" id="modal-focus-title">Focus management</h2>\n</div>\n\n<div class="modal-body">\n    <div class="mb-3">\n        <label class="form-label" for="modal-first-focusable">First focusable element</label>\n        <input id="modal-first-focusable" type="text" class="form-control" placeholder="Focused by default">\n    </div>\n\n    <div ng-if="$.autofocus">\n        <label class="form-label" for="modal-custom-autofocus">Custom autofocus target</label>\n        <input\n            id="modal-custom-autofocus"\n            type="text"\n            class="form-control"\n            placeholder="Focused through ngbAutofocus"\n            ngbAutofocus>\n    </div>\n</div>\n\n<div class="modal-footer">\n    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>\n</div>\n';
var modalOptionsHtml = '<div class="d-flex flex-wrap gap-2">\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomWindow()">Custom class</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openSmall()">Small</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openLarge()">Large</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openExtraLarge()">Extra large</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openFullscreen()">Fullscreen</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCentered()">Vertically centered</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollable()">Scrollable content</button>\n    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomDialog()">Dialog custom class</button>\n</div>\n';
var modalUpdatableHtml = '<button type="button" class="btn btn-primary" ng-click="example.open()">Open updatable modal</button>\n';
var modalUpdatableContentHtml = `<div class="modal-header">
    <h2 class="modal-title fs-5" id="updatable-modal-title">Updatable options</h2>
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>
</div>

<div class="modal-body">
    <p id="updatable-modal-description">
        Change the window, dialog, backdrop and accessibility options while this modal remains open.
    </p>

    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleAriaReferences()">
            ARIA references: {{ $.ariaReferences ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleCentered()">
            Centered: {{ $.centered ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleFullscreen()">
            Fullscreen: {{ $.fullscreen ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleBackdropClass()">
            Backdrop class: {{ $.customBackdrop ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.cycleSize()">
            Size: {{ $.size }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleWindowClass()">
            Window class: {{ $.customWindow ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleDialogClass()">
            Dialog class: {{ $.customDialog ? 'on' : 'off' }}
        </button>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>
</div>
`;
var modalStackedHtml = '<button type="button" class="btn btn-primary" ng-click="example.openStack()">Open three modals</button>\n';
var modalStackedContentHtml = `<div class="modal-header">
    <h2 class="modal-title fs-5">Stacked modal {{ $.level }}</h2>
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>
</div>

<div class="modal-body">
    <p class="mb-0">This is modal layer {{ $.level }} of 3. Close it to return to the previous layer.</p>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-outline-danger" ng-click="$.dismissAll()">Dismiss all</button>
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Close this modal</button>
</div>
`;
var modalGlobalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">\n            Modals are large, vertically centered, use a static backdrop and ignore the Escape key.\n            This documentation example restores the shared defaults immediately after opening.\n        </p>\n    </div>\n</div>\n\n<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured modal</button>\n';
var ModalExamplesPageComponent = class {
  constructor() {
    this.examples = {
      defaults: {
        html: modalDefaultHtml,
        typescript: modalDefaultTs
      },
      componentContent: {
        html: `<!-- modal-component-content.component.html -->
${modalComponentContentHtml}

<!-- modal-demo-content.component.html -->
${modalDemoContentHtml}`,
        typescript: `${modalComponentContentTs}

// modal-demo-content.component.ts
${modalDemoContentTs}`
      },
      focus: {
        html: `<!-- modal-focus.component.html -->
${modalFocusHtml}

<!-- modal-focus-content.component.html -->
${modalFocusContentHtml}`,
        typescript: `${modalFocusTs}

// modal-focus-content.component.ts
${modalFocusContentTs}`
      },
      options: {
        html: modalOptionsHtml,
        typescript: modalOptionsTs,
        css: modalOptionsCss
      },
      updatable: {
        html: `<!-- modal-updatable.component.html -->
${modalUpdatableHtml}

<!-- modal-updatable-content.component.html -->
${modalUpdatableContentHtml}`,
        typescript: `${modalUpdatableTs}

// modal-updatable-content.component.ts
${modalUpdatableContentTs}`,
        css: modalOptionsCss
      },
      stacked: {
        html: `<!-- modal-stacked.component.html -->
${modalStackedHtml}

<!-- modal-stacked-content.component.html -->
${modalStackedContentHtml}`,
        typescript: `${modalStackedTs}

// modal-stacked-content.component.ts
${modalStackedContentTs}`
      },
      global: {
        html: modalGlobalHtml,
        typescript: modalGlobalTs
      }
    };
  }
};
(function() {
  var h = "styles/modal-examples-page.component-e48c9676.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ModalExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function ModalExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ModalExamplesPageComponent();
    return instance;
  }
];
ModalExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-modal-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/modal-examples-page.component-ae7ff5a0.html",
    "controllerAs": "$"
  }
};
ModalExamplesPageComponent.ɵfac.ɵcomponent = true;
ModalExamplesPageComponent.ɵfac.ɵtype = ModalExamplesPageComponent;
export {
  ModalExamplesPageComponent
};
