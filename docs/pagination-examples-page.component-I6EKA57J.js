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

// src/app/features/pagination/pages/pagination-examples-page/pagination-examples-page.component.ts
var advancedPaginationHtml = '<div class="vstack gap-4">\n    <div>\n        <p class="small fw-semibold mb-2">Restricted page range</p>\n        <ngb-pagination\n            collection-size="120"\n            page="example.paginatedPage"\n            page-change="example.selectPaginatedPage($event)"\n            max-size="5"\n            boundary-links="true">\n        </ngb-pagination>\n    </div>\n\n    <div>\n        <p class="small fw-semibold mb-2">Rotating page range</p>\n        <ngb-pagination\n            collection-size="240"\n            page="example.rotatedPage"\n            page-change="example.selectRotatedPage($event)"\n            max-size="5"\n            rotate="true"\n            boundary-links="true">\n        </ngb-pagination>\n    </div>\n\n    <div>\n        <p class="small fw-semibold mb-2">Without ellipses</p>\n        <ngb-pagination\n            collection-size="240"\n            page="example.compactPage"\n            page-change="example.selectCompactPage($event)"\n            max-size="5"\n            rotate="true"\n            ellipses="false">\n        </ngb-pagination>\n    </div>\n</div>\n';
var advancedPaginationTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-advanced-pagination",\n    controllerAs: "example",\n    templateUrl: "./advanced-pagination.component.html",\n    styleUrl: "./advanced-pagination.component.css",\n})\nexport class AdvancedPaginationComponent {\n    public paginatedPage = 7;\n    public rotatedPage = 12;\n    public compactPage = 12;\n\n    public selectPaginatedPage(page: number) { this.paginatedPage = page; }\n    public selectRotatedPage(page: number) { this.rotatedPage = page; }\n    public selectCompactPage(page: number) { this.compactPage = page; }\n}\n';
var basicPaginationHtml = '<ngb-pagination\n    collection-size="70"\n    page="example.page"\n    page-change="example.selectPage($event)">\n</ngb-pagination>\n\n<p class="small text-body-secondary mb-0">Current page: <strong>{{ example.page }}</strong></p>\n';
var basicPaginationTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-basic-pagination",\n    controllerAs: "example",\n    templateUrl: "./basic-pagination.component.html",\n    styleUrl: "./basic-pagination.component.css",\n})\nexport class BasicPaginationComponent {\n    public page = 4;\n\n    public selectPage(page: number) {\n        this.page = page;\n    }\n}\n';
var customPaginationHtml = '<ngb-pagination\n    collection-size="50"\n    page="example.page"\n    page-change="example.selectPage($event)">\n    <ng-template ngb-pagination-previous>\n        <span aria-hidden="true">←</span> Previous\n    </ng-template>\n    <ng-template ngb-pagination-next>\n        Next <span aria-hidden="true">→</span>\n    </ng-template>\n    <ng-template ngb-pagination-number let-page>\n        <span class="fw-semibold">{{ page }}</span>\n    </ng-template>\n</ngb-pagination>\n';
var customPaginationTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-custom-pagination",\n    controllerAs: "example",\n    templateUrl: "./custom-pagination.component.html",\n    styleUrl: "./custom-pagination.component.css",\n})\nexport class CustomPaginationComponent {\n    public page = 3;\n\n    public selectPage(page: number) {\n        this.page = page;\n    }\n}\n';
var disabledPaginationHtml = '<div class="form-check form-switch mb-3">\n    <input class="form-check-input" type="checkbox" role="switch" id="pagination-disabled" ng-model="example.disabled">\n    <label class="form-check-label" for="pagination-disabled">Disabled</label>\n</div>\n\n<ngb-pagination\n    collection-size="70"\n    page="example.page"\n    page-change="example.selectPage($event)"\n    disabled="example.disabled">\n</ngb-pagination>\n';
var disabledPaginationTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-disabled-pagination",\n    controllerAs: "example",\n    templateUrl: "./disabled-pagination.component.html",\n    styleUrl: "./disabled-pagination.component.css",\n})\nexport class DisabledPaginationComponent {\n    public page = 3;\n    public disabled = true;\n\n    public selectPage(page: number) {\n        this.page = page;\n    }\n}\n';
var paginationAlignmentHtml = '<div class="vstack gap-4">\n    <div>\n        <p class="small text-body-secondary mb-2">Start</p>\n        <ngb-pagination class="d-flex justify-content-start" collection-size="50" page="example.startPage" page-change="example.selectStartPage($event)"></ngb-pagination>\n    </div>\n    <div>\n        <p class="small text-body-secondary text-center mb-2">Center</p>\n        <ngb-pagination class="d-flex justify-content-center" collection-size="50" page="example.centerPage" page-change="example.selectCenterPage($event)"></ngb-pagination>\n    </div>\n    <div>\n        <p class="small text-body-secondary text-end mb-2">End</p>\n        <ngb-pagination class="d-flex justify-content-end" collection-size="50" page="example.endPage" page-change="example.selectEndPage($event)"></ngb-pagination>\n    </div>\n</div>\n';
var paginationAlignmentTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-pagination-alignment",\n    controllerAs: "example",\n    templateUrl: "./pagination-alignment.component.html",\n    styleUrl: "./pagination-alignment.component.css",\n})\nexport class PaginationAlignmentComponent {\n    public startPage = 2;\n    public centerPage = 2;\n    public endPage = 2;\n\n    public selectStartPage(page: number) { this.startPage = page; }\n    public selectCenterPage(page: number) { this.centerPage = page; }\n    public selectEndPage(page: number) { this.endPage = page; }\n}\n';
var paginationGlobalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">\n            Pagination is small, rotating, limited to five pages and uses boundary links without direction links.\n        </p>\n    </div>\n</div>\n\n<ngb-pagination\n    collection-size="200"\n    page="example.page"\n    page-change="example.selectPage($event)">\n</ngb-pagination>\n';
var paginationGlobalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbPaginationConfig } from "ngb-js/pagination";\n\n@Component({\n    selector: "docs-pagination-global",\n    controllerAs: "example",\n    templateUrl: "./pagination-global.component.html",\n    styleUrl: "./pagination-global.component.css",\n})\nexport class PaginationGlobalComponent implements AfterViewInit, OnDestroy {\n    public page = 8;\n\n    private readonly initialConfig: Pick<\n        NgbPaginationConfig,\n        "boundaryLinks" | "directionLinks" | "maxSize" | "rotate" | "size"\n    >;\n\n    constructor(private readonly config: NgbPaginationConfig) {\n        this.initialConfig = {\n            boundaryLinks: config.boundaryLinks,\n            directionLinks: config.directionLinks,\n            maxSize: config.maxSize,\n            rotate: config.rotate,\n            size: config.size,\n        };\n\n        config.boundaryLinks = true;\n        config.directionLinks = false;\n        config.maxSize = 5;\n        config.rotate = true;\n        config.size = "sm";\n    }\n\n    public selectPage(page: number) {\n        this.page = page;\n    }\n\n    public ngAfterViewInit() {\n        this.restoreConfig();\n    }\n\n    public ngOnDestroy() {\n        this.restoreConfig();\n    }\n\n    private restoreConfig() {\n        this.config.boundaryLinks = this.initialConfig.boundaryLinks;\n        this.config.directionLinks = this.initialConfig.directionLinks;\n        this.config.maxSize = this.initialConfig.maxSize;\n        this.config.rotate = this.initialConfig.rotate;\n        this.config.size = this.initialConfig.size;\n    }\n}\n';
var paginationSizeHtml = `<div class="vstack gap-4">
    <div>
        <p class="small text-body-secondary mb-2">Small</p>
        <ngb-pagination collection-size="50" page="example.smallPage" page-change="example.selectSmallPage($event)" size="'sm'"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary mb-2">Default</p>
        <ngb-pagination collection-size="50" page="example.defaultPage" page-change="example.selectDefaultPage($event)"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary mb-2">Large</p>
        <ngb-pagination collection-size="50" page="example.largePage" page-change="example.selectLargePage($event)" size="'lg'"></ngb-pagination>
    </div>
</div>
`;
var paginationSizeTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-pagination-size",\n    controllerAs: "example",\n    templateUrl: "./pagination-size.component.html",\n    styleUrl: "./pagination-size.component.css",\n})\nexport class PaginationSizeComponent {\n    public smallPage = 2;\n    public defaultPage = 2;\n    public largePage = 2;\n\n    public selectSmallPage(page: number) { this.smallPage = page; }\n    public selectDefaultPage(page: number) { this.defaultPage = page; }\n    public selectLargePage(page: number) { this.largePage = page; }\n}\n';
var PaginationExamplesPageComponent = class {
  constructor() {
    this.examples = {
      basic: {
        html: basicPaginationHtml,
        typescript: basicPaginationTs
      },
      advanced: {
        html: advancedPaginationHtml,
        typescript: advancedPaginationTs
      },
      custom: {
        html: customPaginationHtml,
        typescript: customPaginationTs
      },
      size: {
        html: paginationSizeHtml,
        typescript: paginationSizeTs
      },
      alignment: {
        html: paginationAlignmentHtml,
        typescript: paginationAlignmentTs
      },
      disabled: {
        html: disabledPaginationHtml,
        typescript: disabledPaginationTs
      },
      global: {
        html: paginationGlobalHtml,
        typescript: paginationGlobalTs
      }
    };
  }
};
(function() {
  var h = "styles/pagination-examples-page.component-a0729f31.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
PaginationExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function PaginationExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new PaginationExamplesPageComponent();
    return instance;
  }
];
PaginationExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-pagination-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/pagination-examples-page.component-de22c993.html",
    "controllerAs": "$"
  }
};
PaginationExamplesPageComponent.ɵfac.ɵcomponent = true;
PaginationExamplesPageComponent.ɵfac.ɵtype = PaginationExamplesPageComponent;
export {
  PaginationExamplesPageComponent
};
