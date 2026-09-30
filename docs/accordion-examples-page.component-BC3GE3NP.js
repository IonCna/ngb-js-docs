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

// src/app/features/accordion/pages/accordion-examples-page/accordion-examples-page.component.ts
var accordionContentTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-accordion-content",\n    controllerAs: "example",\n    templateUrl: "accordion-content.component.html",\n    styleUrl: "./accordion-content.component.css",\n})\nexport class AccordionContentComponent {\n    public draft = "This value remains after collapsing the panel.";\n}\n';
var accordionGlobalTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { NgbAccordionConfig } from "ngb-js/accordion";\n\n@Component({\n    selector: "docs-accordion-global",\n    controllerAs: "example",\n    templateUrl: "accordion-global.component.html",\n    styleUrl: "./accordion-global.component.css",\n})\nexport class AccordionGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<NgbAccordionConfig, "animation" | "closeOthers" | "destroyOnHide">;\n\n    constructor(private readonly config: NgbAccordionConfig) {\n        this.initialConfig = {\n            animation: config.animation,\n            closeOthers: config.closeOthers,\n            destroyOnHide: config.destroyOnHide,\n        };\n\n        config.animation = false;\n        config.closeOthers = true;\n        config.destroyOnHide = false;\n    }\n\n    public ngOnDestroy() {\n        this.config.animation = this.initialConfig.animation;\n        this.config.closeOthers = this.initialConfig.closeOthers;\n        this.config.destroyOnHide = this.initialConfig.destroyOnHide;\n    }\n}\n';
var accordionTogglePanelsTs = 'import { Component, ViewChild } from "ngjs-core";\n\ninterface AccordionController {\n    expandAll(): void;\n    collapseAll(): void;\n    toggle(itemId: string): void;\n}\n\n@Component({\n    selector: "docs-accordion-toggle-panels",\n    controllerAs: "example",\n    templateUrl: "accordion-toggle-panels.component.html",\n    styleUrl: "./accordion-toggle-panels.component.css",\n})\nexport class AccordionTogglePanelsComponent {\n    @ViewChild("accordion", { static: true })\n    private accordion!: AccordionController;\n\n    public expandAll() {\n        this.accordion.expandAll();\n    }\n\n    public collapseAll() {\n        this.accordion.collapseAll();\n    }\n\n    public toggle(itemId: string) {\n        this.accordion.toggle(itemId);\n    }\n}\n';
var accordionSimpleHtml = `<ng-template ng-ref="templateHeader">
    <span class="d-inline-flex align-items-center gap-2">
        <i class="bi bi-stars text-primary" aria-hidden="true"></i>
        Header rendered from an ng-template
    </span>
</ng-template>

<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">
    <div ngb-accordion-item="'simple-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Regular header</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This panel uses the standard accordion header and button.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'simple-template'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>
                <ng-container ng-template-outlet="templateHeader"></ng-container>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The header content comes from a reusable AngularJS template.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'simple-disabled'" disabled="true">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Disabled panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Disabled items ignore pointer and keyboard toggle actions.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var onePanelAccordionHtml = `<div ngb-accordion animation="true" close-others="true" destroy-on-hide="true">
    <div ngb-accordion-item="'one-panel-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Opening another panel automatically collapses this one.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'one-panel-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0"><code>close-others</code> keeps only one item expanded.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'one-panel-third'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Third panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The behavior is coordinated by the parent accordion.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var accordionTogglePanelsHtml = `<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.expandAll()">Expand all</button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.collapseAll()">Collapse all</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-first')">Toggle first</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-second')">Toggle second</button>
</div>

<div
    ngb-accordion
    animation="true"
    close-others="false"
    destroy-on-hide="true"
    ng-ref="accordion"
    ng-ref-read="ngbAccordion">
    <div ngb-accordion-item="'toggle-first'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This panel can be controlled from its header or the buttons above.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'toggle-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Use the accordion controller to expand, collapse or toggle known ids.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var accordionCustomHeaderHtml = `<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">
    <div ngb-accordion-item="'custom-profile'" collapsed="false">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary p-2">
                    <i class="bi bi-person" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Profile</span>
                    <span class="d-block small fw-normal text-body-secondary">Personal information and public details</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Custom headers can combine Bootstrap utilities, icons and supporting text.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'custom-preferences'">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis p-2">
                    <i class="bi bi-sliders" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Preferences</span>
                    <span class="d-block small fw-normal text-body-secondary">Language, appearance and notifications</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The toggle directive supplies behavior while Bootstrap classes define the presentation.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'custom-security'">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success p-2">
                    <i class="bi bi-shield-lock" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Security</span>
                    <span class="d-block small fw-normal text-body-secondary">Password and active sessions</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Use semantic buttons so custom headers remain keyboard accessible.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var accordionContentHtml = `<div ngb-accordion animation="true" close-others="false" destroy-on-hide="false">
    <div ngb-accordion-item="'persistent-content'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Persistent form content</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <label class="form-label" for="accordion-persistent-value">Draft value</label>
                    <input
                        id="accordion-persistent-value"
                        class="form-control"
                        type="text"
                        ng-model="example.draft">
                    <p class="small text-body-secondary mt-2 mb-0">
                        Edit the value, collapse the panel and open it again. The same view remains in the DOM.
                    </p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var accordionGlobalHtml = `<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            Animation is disabled, only one panel stays open and collapsed content remains in the DOM.
        </p>
    </div>
</div>

<div ngb-accordion>
    <div ngb-accordion-item="'global-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This accordion receives its behavior from <code>NgbAccordionConfig</code>.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'global-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Opening this item collapses the first without local accordion inputs.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`;
var AccordionExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: accordionSimpleHtml
      },
      onePanel: {
        html: onePanelAccordionHtml
      },
      togglePanels: {
        html: accordionTogglePanelsHtml,
        typescript: accordionTogglePanelsTs
      },
      customHeader: {
        html: accordionCustomHeaderHtml
      },
      content: {
        html: accordionContentHtml,
        typescript: accordionContentTs
      },
      global: {
        html: accordionGlobalHtml,
        typescript: accordionGlobalTs
      }
    };
  }
};
(function() {
  var h = "styles/accordion-examples-page.component-08de2906.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
AccordionExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function AccordionExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new AccordionExamplesPageComponent();
    return instance;
  }
];
AccordionExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-accordion-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/accordion-examples-page.component-1afd8260.html",
    "controllerAs": "$"
  }
};
AccordionExamplesPageComponent.ɵfac.ɵcomponent = true;
AccordionExamplesPageComponent.ɵfac.ɵtype = AccordionExamplesPageComponent;
export {
  AccordionExamplesPageComponent
};
