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

// src/app/features/progressbar/pages/progressbar-examples-page/progressbar-examples-page.component.ts
var contextualTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-contextual-text-progressbar",\n    controllerAs: "example",\n    templateUrl: "./contextual-text-progressbar.component.html",\n    styleUrl: "./contextual-text-progressbar.component.css",\n})\nexport class ContextualTextProgressbarComponent {}\n';
var contextualHtml = '<div class="vstack gap-3">\n    <ngb-progressbar type="success" text-type="white" value="25" show-value="true"></ngb-progressbar>\n    <ngb-progressbar type="dark" text-type="white" value="50" show-value="true"></ngb-progressbar>\n    <ngb-progressbar type="light" text-type="success" value="75" show-value="true"></ngb-progressbar>\n    <ngb-progressbar type="warning" text-type="dark" value="100" show-value="true"></ngb-progressbar>\n</div>\n';
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbProgressbarConfig } from "ngb-js/progressbar";\n\n@Component({\n    selector: "docs-progressbar-global",\n    controllerAs: "example",\n    templateUrl: "./progressbar-global.component.html",\n    styleUrl: "./progressbar-global.component.css",\n})\nexport class ProgressbarGlobalComponent implements AfterViewInit, OnDestroy {\n    private readonly initialConfig: Pick<NgbProgressbarConfig, "animated" | "height" | "max" | "showValue" | "striped" | "textType" | "type">;\n\n    constructor(private readonly config: NgbProgressbarConfig) {\n        this.initialConfig = {\n            animated: config.animated,\n            height: config.height,\n            max: config.max,\n            showValue: config.showValue,\n            striped: config.striped,\n            textType: config.textType,\n            type: config.type,\n        };\n        config.animated = true;\n        config.height = "1.5rem";\n        config.max = 200;\n        config.showValue = true;\n        config.striped = true;\n        config.textType = "light";\n        config.type = "primary";\n    }\n\n    public ngAfterViewInit() { this.restoreConfig(); }\n    public ngOnDestroy() { this.restoreConfig(); }\n    private restoreConfig() { Object.assign(this.config, this.initialConfig); }\n}\n';
var globalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Primary, striped and animated; maximum 200, visible percentage and 1.5rem height.</p></div>\n</div>\n\n<ngb-progressbar value="135"></ngb-progressbar>\n';
var heightTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-progress-height",\n    controllerAs: "example",\n    templateUrl: "./progress-height.component.html",\n    styleUrl: "./progress-height.component.css",\n})\nexport class ProgressHeightComponent {}\n';
var heightHtml = `<div class="vstack gap-3">
    <ngb-progressbar type="success" value="25">Default</ngb-progressbar>
    <ngb-progressbar type="info" value="50" height="'10px'">10px</ngb-progressbar>
    <ngb-progressbar type="warning" value="75" height="'1.5rem'">1.5rem</ngb-progressbar>
    <ngb-progressbar type="danger" value="100" height="'2rem'">2rem</ngb-progressbar>
</div>
`;
var labelsTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-custom-labels-progressbar",\n    controllerAs: "example",\n    templateUrl: "./custom-labels-progressbar.component.html",\n    styleUrl: "./custom-labels-progressbar.component.css",\n})\nexport class CustomLabelsProgressbarComponent {}\n';
var labelsHtml = '<div class="vstack gap-3">\n    <ngb-progressbar type="success" value="25"><strong>25%</strong></ngb-progressbar>\n    <ngb-progressbar type="info" value="50">Copying file <strong class="ms-1">2 of 4</strong></ngb-progressbar>\n    <ngb-progressbar type="warning" value="75" striped="true" animated="true"><em>Almost there…</em></ngb-progressbar>\n    <ngb-progressbar type="danger" value="100">Completed!</ngb-progressbar>\n</div>\n';
var simpleTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-simple-progressbar",\n    controllerAs: "example",\n    templateUrl: "./simple-progressbar.component.html",\n    styleUrl: "./simple-progressbar.component.css",\n})\nexport class SimpleProgressbarComponent {}\n';
var simpleHtml = '<div class="vstack gap-3">\n    <ngb-progressbar type="success" value="25"></ngb-progressbar>\n    <ngb-progressbar type="info" value="50"></ngb-progressbar>\n    <ngb-progressbar type="warning" value="75"></ngb-progressbar>\n    <ngb-progressbar type="danger" value="100"></ngb-progressbar>\n    <ngb-progressbar type="primary" value="75"></ngb-progressbar>\n    <ngb-progressbar type="secondary" value="50"></ngb-progressbar>\n    <ngb-progressbar type="dark" value="25"></ngb-progressbar>\n</div>\n';
var stackedTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-progress-bars-stacked",\n    controllerAs: "example",\n    templateUrl: "./progress-bars-stacked.component.html",\n    styleUrl: "./progress-bars-stacked.component.css",\n})\nexport class ProgressBarsStackedComponent {}\n';
var stackedHtml = '<ngb-progressbar-stacked>\n    <ngb-progressbar type="danger" value="20">20%</ngb-progressbar>\n    <ngb-progressbar type="warning" value="35">35%</ngb-progressbar>\n    <ngb-progressbar type="success" value="45">45%</ngb-progressbar>\n</ngb-progressbar-stacked>\n\n<p class="small text-body-secondary mt-3 mb-0">The three segments share one Bootstrap stacked progress container.</p>\n';
var stripedTs = 'import { Component } from "ngjs-core";\n\n@Component({\n    selector: "docs-striped-progress-bar",\n    controllerAs: "example",\n    templateUrl: "./striped-progress-bar.component.html",\n    styleUrl: "./striped-progress-bar.component.css",\n})\nexport class StripedProgressBarComponent {}\n';
var stripedHtml = '<div class="vstack gap-3">\n    <ngb-progressbar type="success" value="25" striped="true"></ngb-progressbar>\n    <ngb-progressbar type="info" value="50" striped="true"></ngb-progressbar>\n    <ngb-progressbar type="warning" value="75" striped="true"></ngb-progressbar>\n    <ngb-progressbar type="danger" value="100" striped="true"></ngb-progressbar>\n    <ngb-progressbar type="primary" value="65" striped="true" animated="true">Animated</ngb-progressbar>\n</div>\n';
var ProgressbarExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: simpleHtml,
        typescript: simpleTs
      },
      contextual: {
        html: contextualHtml,
        typescript: contextualTs
      },
      striped: {
        html: stripedHtml,
        typescript: stripedTs
      },
      labels: {
        html: labelsHtml,
        typescript: labelsTs
      },
      height: {
        html: heightHtml,
        typescript: heightTs
      },
      stacked: {
        html: stackedHtml,
        typescript: stackedTs
      },
      global: {
        html: globalHtml,
        typescript: globalTs
      }
    };
  }
};
(function() {
  var h = "styles/progressbar-examples-page.component-2e3e70ab.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
ProgressbarExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function ProgressbarExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new ProgressbarExamplesPageComponent();
    return instance;
  }
];
ProgressbarExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-progressbar-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/progressbar-examples-page.component-82d588cf.html",
    "controllerAs": "$"
  }
};
ProgressbarExamplesPageComponent.ɵfac.ɵcomponent = true;
ProgressbarExamplesPageComponent.ɵfac.ɵtype = ProgressbarExamplesPageComponent;
export {
  ProgressbarExamplesPageComponent
};
