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

// src/app/features/typeahead/pages/typeahead-examples-page/typeahead-examples-page.component.ts
var exactHtml = '<label class="form-label" for="exact-typeahead">Search for a state</label>\n<input id="exact-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" select-on-exact="true" placeholder="Try California">\n<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\n';
var exactTs = 'import { Component } from "ngjs-core";\nimport { debounceTime, map, type OperatorFunction } from "rxjs";\n\ninterface State { name: string }\nconst STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map(name => ({ name }));\n\n@Component({\n    selector: "docs-exact-typeahead",\n    controllerAs: "example",\n    templateUrl: "./exact-typeahead.component.html",\n    styleUrl: "./exact-typeahead.component.css",\n})\nexport class ExactTypeaheadComponent {\n    public model?: State;\n    public readonly formatter = (state: State): string => state.name;\n    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(\n        debounceTime(200),\n        map(term => term ? STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase())) : []),\n    );\n}\n';
var focusHtml = `<label class="form-label" for="focus-typeahead">Search for a state</label>
<input id="focus-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" ng-focus="example.focus$.next($event.target.value)" placeholder="Focus to see suggestions">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`;
var focusTs = 'import { Component, type OnDestroy } from "ngjs-core";\nimport { debounceTime, distinctUntilChanged, map, merge, type OperatorFunction, Subject } from "rxjs";\n\nconst STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];\n\n@Component({\n    selector: "docs-focus-typeahead",\n    controllerAs: "example",\n    templateUrl: "./focus-typeahead.component.html",\n    styleUrl: "./focus-typeahead.component.css",\n})\nexport class FocusTypeaheadComponent implements OnDestroy {\n    public model = "";\n    public readonly focus$ = new Subject<string>();\n    public readonly search: OperatorFunction<string, string[]> = text$ => merge(\n        text$.pipe(debounceTime(200), distinctUntilChanged()),\n        this.focus$,\n    ).pipe(\n        map(term => (term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : STATES).slice(0, 10)),\n    );\n    public ngOnDestroy(): void { this.focus$.complete(); }\n}\n';
var formattedHtml = `<label class="form-label" for="formatted-typeahead">Search for a state</label>
<input id="formatted-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-formatter="example.formatter" placeholder="Results are formatted in uppercase">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`;
var formattedTs = 'import { Component } from "ngjs-core";\nimport { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\n\nconst STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];\n\n@Component({\n    selector: "docs-formatted-typeahead",\n    controllerAs: "example",\n    templateUrl: "./formatted-typeahead.component.html",\n    styleUrl: "./formatted-typeahead.component.css",\n})\nexport class FormattedTypeaheadComponent {\n    public model = "";\n    public readonly formatter = (result: string): string => result.toUpperCase();\n    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\n        debounceTime(200),\n        distinctUntilChanged(),\n        map(term => term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : []),\n    );\n}\n';
var globalHtml = '<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\n    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\n    <div>\n        <p class="fw-semibold mb-1">Global defaults used by this example</p>\n        <p class="small text-body-secondary mb-0">Hint completion, exact-match selection and a popup appended to body.</p>\n    </div>\n</div>\n\n<label class="form-label" for="global-typeahead">Search for a state</label>\n<input id="global-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Try Cal">\n';
var globalTs = 'import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\nimport { NgbTypeaheadConfig } from "ngb-js/typeahead";\nimport { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\n\nconst STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];\n\n@Component({\n    selector: "docs-typeahead-global",\n    controllerAs: "example",\n    templateUrl: "./typeahead-global.component.html",\n    styleUrl: "./typeahead-global.component.css",\n})\nexport class TypeaheadGlobalComponent implements AfterViewInit, OnDestroy {\n    public model = "";\n    private readonly initialConfig: Pick<NgbTypeaheadConfig, "container" | "selectOnExact" | "showHint">;\n\n    constructor(private readonly config: NgbTypeaheadConfig) {\n        this.initialConfig = {\n            container: config.container,\n            selectOnExact: config.selectOnExact,\n            showHint: config.showHint,\n        };\n        config.container = "body";\n        config.selectOnExact = true;\n        config.showHint = true;\n    }\n\n    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\n        debounceTime(200),\n        distinctUntilChanged(),\n        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().startsWith(term.toLowerCase()))),\n    );\n\n    public ngAfterViewInit(): void { this.restoreConfig(); }\n    public ngOnDestroy(): void { this.restoreConfig(); }\n    private restoreConfig(): void {\n        this.config.container = this.initialConfig.container;\n        this.config.selectOnExact = this.initialConfig.selectOnExact;\n        this.config.showHint = this.initialConfig.showHint;\n    }\n}\n';
var nonEditableHtml = '<p>Manual text is not accepted; the model changes only after selecting a suggestion.</p>\n<label class="form-label" for="non-editable-typeahead">Search for a state</label>\n<input id="non-editable-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" editable="false" placeholder="Type at least two characters">\n<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\n';
var nonEditableTs = 'import { Component } from "ngjs-core";\nimport { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\n\ninterface State { id: number; name: string }\nconst STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map((name, id) => ({ id, name }));\n\n@Component({\n    selector: "docs-non-editable-typeahead",\n    controllerAs: "example",\n    templateUrl: "./non-editable-typeahead.component.html",\n    styleUrl: "./non-editable-typeahead.component.css",\n})\nexport class NonEditableTypeaheadComponent {\n    public model: State | null = null;\n    public readonly formatter = (state: State): string => state.name;\n    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(\n        debounceTime(200),\n        distinctUntilChanged(),\n        map(term => term.length < 2 ? [] : STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase()))),\n    );\n}\n';
var simpleHtml = `<label class="form-label" for="simple-typeahead">Search for a state</label>
<input id="simple-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Type at least two characters">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`;
var simpleTs = 'import { Component } from "ngjs-core";\nimport { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\n\nconst STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];\n\n@Component({\n    selector: "docs-simple-typeahead",\n    controllerAs: "example",\n    templateUrl: "./simple-typeahead.component.html",\n    styleUrl: "./simple-typeahead.component.css",\n})\nexport class SimpleTypeaheadComponent {\n    public model = "";\n    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\n        debounceTime(200),\n        distinctUntilChanged(),\n        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())).slice(0, 10)),\n    );\n}\n';
var templateResultsHtml = '<ng-template ng-ref="example.resultTemplate" let-result="result" let-term="term">\n    <span class="d-flex align-items-center gap-2">\n        <span class="fs-5" aria-hidden="true">{{ result.flag }}</span>\n        <span class="flex-grow-1"><ngb-highlight result="result.name" term="term"></ngb-highlight></span>\n        <small class="text-body-secondary">{{ result.region }}</small>\n    </span>\n</ng-template>\n\n<label class="form-label" for="template-results-typeahead">Search for a country</label>\n<input id="template-results-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-template="example.resultTemplate" input-formatter="example.formatter" placeholder="Try Mexico">\n<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\n';
var templateResultsTs = 'import { Component, type TemplateRef } from "ngjs-core";\nimport { debounceTime, map, type OperatorFunction } from "rxjs";\n\ninterface Country { name: string; flag: string; region: string }\nconst COUNTRIES: Country[] = [\n    { name: "Mexico", flag: "🇲🇽", region: "North America" },\n    { name: "Argentina", flag: "🇦🇷", region: "South America" },\n    { name: "Brazil", flag: "🇧🇷", region: "South America" },\n    { name: "Canada", flag: "🇨🇦", region: "North America" },\n    { name: "Colombia", flag: "🇨🇴", region: "South America" },\n    { name: "Germany", flag: "🇩🇪", region: "Europe" },\n    { name: "Japan", flag: "🇯🇵", region: "Asia" },\n    { name: "Spain", flag: "🇪🇸", region: "Europe" },\n];\n\n@Component({\n    selector: "docs-template-results-typeahead",\n    controllerAs: "example",\n    templateUrl: "./template-results-typeahead.component.html",\n    styleUrl: "./template-results-typeahead.component.css",\n})\nexport class TemplateResultsTypeaheadComponent {\n    public model?: Country;\n    public resultTemplate?: TemplateRef<unknown>;\n    public readonly formatter = (country: Country): string => country.name;\n    public readonly search: OperatorFunction<string, Country[]> = text$ => text$.pipe(\n        debounceTime(200),\n        map(term => term ? COUNTRIES.filter(country => country.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8) : []),\n    );\n}\n';
var wikipediaHtml = `<label class="form-label" for="wikipedia-typeahead">Search for a Wikipedia page</label>
<input id="wikipedia-typeahead" type="text" class="form-control" ng-class="{ 'is-invalid': example.searchFailed }" ng-model="example.model" ngb-typeahead="example.search" placeholder="Wikipedia search">
<div class="form-text" ng-if="example.searching">Searching…</div>
<div class="invalid-feedback" ng-if="example.searchFailed">Suggestions could not be loaded.</div>
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`;
var wikipediaTs = 'import { Component, Injectable } from "ngjs-core";\nimport { HttpClient, HttpParams } from "ngjs-core/common/http";\nimport { catchError, debounceTime, distinctUntilChanged, map, type OperatorFunction, of, switchMap, tap } from "rxjs";\n\nconst WIKI_URL = "https://en.wikipedia.org/w/api.php";\ntype WikiResponse = [string, string[], string[], string[]];\n\n@Injectable()\nexport class WikipediaSearchService {\n    constructor(private readonly http: HttpClient) {}\n\n    public search(term: string) {\n        if (!term) return of([] as string[]);\n        return this.http.get<WikiResponse>(WIKI_URL, {\n            params: new HttpParams({ action: "opensearch", format: "json", origin: "*", search: term }),\n        }).pipe(map(response => response[1]));\n    }\n}\n\n@Component({\n    selector: "docs-wikipedia-typeahead",\n    controllerAs: "example",\n    templateUrl: "./wikipedia-typeahead.component.html",\n    styleUrl: "./wikipedia-typeahead.component.css",\n})\nexport class WikipediaTypeaheadComponent {\n    public model = "";\n    public searching = false;\n    public searchFailed = false;\n\n    constructor(private readonly wikipedia: WikipediaSearchService) {}\n\n    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\n        debounceTime(300),\n        distinctUntilChanged(),\n        tap(() => this.searching = true),\n        switchMap(term => this.wikipedia.search(term).pipe(\n            tap(() => this.searchFailed = false),\n            catchError(() => {\n                this.searchFailed = true;\n                return of([] as string[]);\n            }),\n        )),\n        tap(() => this.searching = false),\n    );\n}\n';
var TypeaheadExamplesPageComponent = class {
  constructor() {
    this.examples = {
      simple: {
        html: simpleHtml,
        typescript: simpleTs
      },
      focus: {
        html: focusHtml,
        typescript: focusTs
      },
      formatted: {
        html: formattedHtml,
        typescript: formattedTs
      },
      exact: {
        html: exactHtml,
        typescript: exactTs
      },
      wikipedia: {
        html: wikipediaHtml,
        typescript: wikipediaTs
      },
      templateResults: {
        html: templateResultsHtml,
        typescript: templateResultsTs
      },
      nonEditable: {
        html: nonEditableHtml,
        typescript: nonEditableTs
      },
      global: {
        html: globalHtml,
        typescript: globalTs
      }
    };
  }
};
(function() {
  var h = "styles/typeahead-examples-page.component-f9522c28.css";
  if (document.querySelector('link[data-ngjs-style="' + h + '"]')) return;
  var l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = h;
  l.setAttribute("data-ngjs-style", h);
  document.head.appendChild(l);
})();
TypeaheadExamplesPageComponent.ɵfac = [
  "$element",
  "$scope",
  function TypeaheadExamplesPageComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new TypeaheadExamplesPageComponent();
    return instance;
  }
];
TypeaheadExamplesPageComponent.ɵcmp = {
  selectors: [
    [
      "docs-typeahead-examples-page"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/typeahead-examples-page.component-87c6ae11.html",
    "controllerAs": "$"
  }
};
TypeaheadExamplesPageComponent.ɵfac.ɵcomponent = true;
TypeaheadExamplesPageComponent.ɵfac.ɵtype = TypeaheadExamplesPageComponent;
export {
  TypeaheadExamplesPageComponent
};
