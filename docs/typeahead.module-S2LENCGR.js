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
import {
  Subject as Subject2,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map as map2,
  merge,
  of as of2,
  switchMap as switchMap2,
  tap as tap2
} from "./chunk-GIOLWBI5.js";
import {
  NgbCollapseModule
} from "./chunk-EP2AMMBI.js";
import {
  NgbNavModule
} from "./chunk-GBQCJSNK.js";
import {
  NgbScrollSpyModule
} from "./chunk-T2KZSIKQ.js";
import {
  RouterModule
} from "./chunk-44BCS2Q7.js";
import "./chunk-YZVMAT3C.js";
import {
  BehaviorSubject,
  ChangeDetectorRef,
  HttpParams,
  Key,
  Live,
  NgZone,
  PopupService,
  Subject,
  addPopperOffset,
  fromEvent,
  inject,
  isDefined,
  map,
  ngbAutoClose,
  ngbPositioning,
  of,
  regExpEscape,
  removeAccents,
  switchMap,
  tap,
  toString
} from "./chunk-DXKD6ZA6.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-K6VJMEI3.js";
import {
  __toESM
} from "./chunk-MTQV7FVC.js";

// src/app/features/typeahead/typeahead.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-YIURIJXL.js
var import_angular = __toESM(require_angular(), 1);
var NgbHighlight = class {
  ngOnChanges(_changes) {
    if (!this.accentSensitive && !String.prototype.normalize) {
      console.warn("The `accentSensitive` input in `ngb-highlight` cannot be set to `false` in a browser that does not implement the `String.normalize` function. You will have to include a polyfill in your application to use this feature in the current browser.");
      this.accentSensitive = true;
    }
    const result = toString(this.result);
    const terms = Array.isArray(this.term) ? this.term : [
      this.term
    ];
    const prepareTerm = (term) => this.accentSensitive ? term : removeAccents(term);
    const escapedTerms = terms.map((term) => regExpEscape(prepareTerm(toString(term)))).filter((term) => term);
    const toSplit = this.accentSensitive ? result : removeAccents(result);
    const parts = escapedTerms.length ? toSplit.split(new RegExp(`(${escapedTerms.join("|")})`, "gmi")) : [
      result
    ];
    if (this.accentSensitive) {
      this.parts = parts;
    } else {
      let offset = 0;
      this.parts = parts.map((part) => result.substring(offset, offset += part.length));
    }
  }
  constructor() {
    this.highlightClass = "ngb-highlight";
    this.accentSensitive = true;
  }
};
NgbHighlight.ɵfac = [
  "$element",
  "$scope",
  function NgbHighlight_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NgbHighlight)();
    return instance;
  }
];
NgbHighlight.ɵcmp = {
  selectors: [
    [
      "ngb-highlight"
    ]
  ],
  inputs: {
    "highlightClass": "highlightClass",
    "result": "result",
    "term": "term",
    "accentSensitive": "accentSensitive"
  },
  outputs: {},
  definition: {
    "template": `<span
    ng-repeat="part in $.parts track by $index"
    ng-class="[$odd ? $.highlightClass : '', $odd && $.highlightClass === 'ngb-highlight' ? 'fw-bold' : '']">{{ part }}</span>`,
    "bindings": {
      "highlightClass": "<?",
      "result": "<?",
      "term": "<?",
      "accentSensitive": "<?"
    }
  }
};
NgbHighlight.ɵfac.ɵcomponent = true;
NgbHighlight.ɵfac.ɵtype = NgbHighlight;
NgbHighlight.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["highlightClass"];
    if (!c) return;
    changes["highlightClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["result"];
    if (!c) return;
    changes["result"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["term"];
    if (!c) return;
    changes["term"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["accentSensitive"];
    if (!c) return;
    changes["accentSensitive"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  this.ngOnChanges(changes);
};
var NgbTypeaheadConfig = class {
  constructor() {
    this.editable = true;
    this.focusFirst = true;
    this.selectOnExact = false;
    this.showHint = false;
    this.placement = [
      "bottom-start",
      "bottom-end",
      "top-start",
      "top-end"
    ];
    this.popperOptions = (options) => options;
  }
};
NgbTypeaheadConfig.ɵfac = [
  function NgbTypeaheadConfig_Factory() {
    return new (this && this.ɵT || NgbTypeaheadConfig)();
  }
];
NgbTypeaheadConfig.ɵprov = {
  token: "NgbTypeaheadConfig_2a81f1f3",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbTypeaheadConfig_2a81f1f3",
  NgbTypeaheadConfig.ɵfac
]);
var NgbTypeaheadWindow = class {
  get hostId() {
    return this.id;
  }
  get hostClass() {
    return `dropdown-menu show${this.popupClass ? ` ${this.popupClass}` : ""}`;
  }
  onMouseDown(event) {
    event.preventDefault();
  }
  hasActive() {
    return this.activeIdx > -1 && this.activeIdx < this.results.length;
  }
  getActive() {
    return this.results[this.activeIdx];
  }
  markActive(activeIdx) {
    this.activeIdx = activeIdx;
    this._activeChanged();
  }
  next() {
    if (this.activeIdx === this.results.length - 1) {
      this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
    } else {
      this.activeIdx++;
    }
    this._activeChanged();
  }
  prev() {
    if (this.activeIdx < 0) {
      this.activeIdx = this.results.length - 1;
    } else if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
    } else {
      this.activeIdx--;
    }
    this._activeChanged();
  }
  resetActive() {
    this.activeIdx = this.focusFirst ? 0 : -1;
    this._activeChanged();
  }
  select(item) {
    this.selectEvent.emit(item);
  }
  ngOnInit() {
    this.resetActive();
  }
  _activeChanged() {
    this.activeChangeEvent.emit(this.activeIdx >= 0 ? `${this.id}-${this.activeIdx}` : void 0);
  }
  constructor() {
    this.activeIdx = 0;
    this.focusFirst = true;
    this.formatter = toString;
    this.selectEvent = new EventEmitter();
    this.activeChangeEvent = new EventEmitter();
    this.role = "listbox";
  }
};
NgbTypeaheadWindow.ɵfac = [
  "$element",
  "$scope",
  function NgbTypeaheadWindow_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NgbTypeaheadWindow)();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance.role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance.hostId;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance.hostClass;
    }, function(v, old) {
      var ɵnames = function(value) {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(" ");
        return Object.keys(value).filter(function(key) {
          return value[key];
        }).join(" ");
      };
      if (v !== old) $element.removeClass(ɵnames(old));
      $element.addClass(ɵnames(v));
    }, true);
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance.role);
      (function(v) {
        $element.prop("id", v);
      })(instance.hostId);
      (function(v) {
        var ɵnames = function(value) {
          if (!value) return "";
          if (typeof value === "string") return value;
          if (Array.isArray(value)) return value.join(" ");
          return Object.keys(value).filter(function(key) {
            return value[key];
          }).join(" ");
        };
        if (v !== void 0) $element.removeClass(ɵnames(void 0));
        $element.addClass(ɵnames(v));
      })(instance.hostClass);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.onMouseDown(event);
      } else {
        $scope.$apply(function() {
          instance.onMouseDown(event);
        });
      }
    };
    $element.on("mousedown", ɵhandler0);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      $element.off("mousedown", ɵhandler0);
    });
    return instance;
  }
];
NgbTypeaheadWindow.ɵcmp = {
  selectors: [
    [
      "ngb-typeahead-window"
    ]
  ],
  inputs: {
    "id": "id",
    "focusFirst": "focusFirst",
    "results": "results",
    "term": "term",
    "formatter": "formatter",
    "resultTemplate": "resultTemplate",
    "popupClass": "popupClass"
  },
  outputs: {
    "select": "selectEvent",
    "activeChange": "activeChangeEvent"
  },
  exportAs: [
    "ngbTypeaheadWindow"
  ],
  definition: {
    "template": `<ng-template ng-ref="rt" let-result="result" let-term="term" let-formatter="formatter">
    <ngb-highlight result="formatter(result)" term="term"></ngb-highlight>
</ng-template>

<button
        type="button"
        class="dropdown-item"
        role="option"
        ng-attr-id="{{ $.id + '-' + $index }}"
        ng-class="{ active: $index === $.activeIdx }"
        ng-mouseenter="$.markActive($index)"
        ng-click="$.select(result)"
        ng-repeat="result in $.results track by $index">
    <ng-container
            ng-template-outlet="$.resultTemplate || rt"
            ng-template-outlet-context="{ result: result, term: $.term, formatter: $.formatter }"
    ></ng-container>
</button>`,
    "controllerAs": "$",
    "bindings": {
      "id": "@?",
      "focusFirst": "<?",
      "results": "<?",
      "term": "<?",
      "formatter": "<?",
      "resultTemplate": "<?",
      "popupClass": "<?",
      "selectEvent": "&?select",
      "activeChangeEvent": "&?activeChange"
    }
  }
};
NgbTypeaheadWindow.ɵfac.ɵcomponent = true;
NgbTypeaheadWindow.ɵfac.ɵtype = NgbTypeaheadWindow;
NgbTypeaheadWindow.prototype.$onInit = function() {
  this.ngOnInit();
};
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) resolve(value);
  else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var nextWindowId = 0;
var NgbTypeahead = class {
  get isOpenClass() {
    return this.isPopupOpen();
  }
  get ariaAutocomplete() {
    return this.showHint ? "both" : "list";
  }
  get ariaControls() {
    return this.isPopupOpen() ? this.popupId : null;
  }
  get ariaExpanded() {
    return this.isPopupOpen();
  }
  ngOnInit() {
    this._subscribeToUserInput();
  }
  ngOnChanges({ ngbTypeahead }) {
    if (ngbTypeahead && !ngbTypeahead.firstChange) {
      this._unsubscribeFromUserInput();
      this._subscribeToUserInput();
    }
  }
  ngOnDestroy() {
    this._closePopup();
    this._unsubscribeFromUserInput();
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  writeValue(value) {
    this._writeInputValue(this._formatItemForInput(value));
    if (this.showHint) {
      this._inputValueBackup = value;
    }
  }
  setDisabledState(isDisabled) {
    this._nativeElement.disabled = isDisabled;
  }
  dismissPopup() {
    if (this.isPopupOpen()) {
      this._resubscribeTypeahead$.next(null);
      this._closePopup();
      if (this.showHint && this._inputValueBackup !== null) {
        this._writeInputValue(this._inputValueBackup);
      }
      this._changeDetector.markForCheck();
    }
  }
  isPopupOpen() {
    return this._windowRef != null;
  }
  handleBlur() {
    this._resubscribeTypeahead$.next(null);
    this._onTouched();
  }
  handleKeyDown(event) {
    if (!this.isPopupOpen()) {
      return;
    }
    switch (event.which) {
      case Key.ArrowDown:
        event.preventDefault();
        this._windowRef.instance.next();
        this._showHint();
        break;
      case Key.ArrowUp:
        event.preventDefault();
        this._windowRef.instance.prev();
        this._showHint();
        break;
      case Key.Enter:
      case Key.Tab: {
        const result = this._windowRef.instance.getActive();
        if (isDefined(result)) {
          event.preventDefault();
          event.stopPropagation();
          this._selectResult(result);
        }
        this._closePopup();
        break;
      }
    }
  }
  _openPopup() {
    return _async_to_generator(function* () {
      if (!this.isPopupOpen()) {
        this._inputValueBackup = this._nativeElement.value;
        const { windowRef } = yield this._popupService.open();
        this._windowRef = windowRef;
        this._windowRef.setInput("id", this.popupId);
        this._windowRef.setInput("popupClass", this.popupClass);
        this._windowRef.instance.selectEvent.subscribe((result) => this._selectResultClosePopup(result));
        this._windowRef.instance.activeChangeEvent.subscribe((activeId) => this.activeDescendant = activeId);
        if (this.container === "body") {
          this._windowRef.location.nativeElement.style.zIndex = "1055";
          this._document.body.appendChild(this._windowRef.location.nativeElement);
        }
        this._changeDetector.markForCheck();
        this._ngZone.runOutsideAngular(() => {
          if (this._windowRef) {
            this._positioning.createPopper({
              hostElement: this._nativeElement,
              targetElement: this._windowRef.location.nativeElement,
              placement: this.placement,
              appendToBody: this.container === "body",
              updatePopperOptions: (options) => this.popperOptions(addPopperOffset([
                0,
                2
              ])(options))
            });
            Promise.resolve().then(() => {
              this._positioning.update();
              this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
            });
          }
        });
        ngbAutoClose(this._ngZone, this._document, "outside", () => this.dismissPopup(), this._closed$, [
          this._nativeElement,
          this._windowRef.location.nativeElement
        ]);
      }
    }).call(this);
  }
  _closePopup() {
    this._popupService.close().subscribe(() => {
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._closed$.next();
      this._windowRef = null;
      this.activeDescendant = null;
    });
  }
  _selectResult(result) {
    let defaultPrevented = false;
    this.selectItem.emit({
      item: result,
      preventDefault: () => {
        defaultPrevented = true;
      }
    });
    this._resubscribeTypeahead$.next(null);
    if (!defaultPrevented) {
      this.writeValue(result);
      this._onChange(result);
    }
  }
  _selectResultClosePopup(result) {
    this._selectResult(result);
    this._closePopup();
  }
  _showHint() {
    if (this.showHint && this._windowRef?.instance.hasActive() && this._inputValueBackup != null) {
      const userInputLowerCase = this._inputValueBackup.toLowerCase();
      const formattedVal = this._formatItemForInput(this._windowRef.instance.getActive());
      if (userInputLowerCase === formattedVal.substring(0, this._inputValueBackup.length).toLowerCase()) {
        this._writeInputValue(this._inputValueBackup + formattedVal.substring(this._inputValueBackup.length));
        this._nativeElement.setSelectionRange(this._inputValueBackup.length, formattedVal.length);
      } else {
        this._writeInputValue(formattedVal);
      }
    }
  }
  _formatItemForInput(item) {
    return item != null && this.inputFormatter ? this.inputFormatter(item) : toString(item);
  }
  _writeInputValue(value) {
    this._nativeElement.value = toString(value);
  }
  _subscribeToUserInput() {
    const results$ = this._valueChanges$.pipe(tap((value) => {
      this._inputValueBackup = this.showHint ? value : null;
      this._inputValueForSelectOnExact = this.selectOnExact ? value : null;
      this._onChange(this.editable ? value : null);
    }), this.ngbTypeahead ? this.ngbTypeahead : () => of([]));
    this._subscription = this._resubscribeTypeahead$.pipe(switchMap(() => results$)).subscribe((results) => _async_to_generator(function* () {
      if (!results || results.length === 0) {
        this._closePopup();
      } else if (this.selectOnExact && results.length === 1 && this._formatItemForInput(results[0]) === this._inputValueForSelectOnExact) {
        this._selectResult(results[0]);
        this._closePopup();
      } else {
        yield this._openPopup();
        this._windowRef.setInput("focusFirst", this.focusFirst);
        this._windowRef.setInput("results", results);
        this._windowRef.setInput("term", this._nativeElement.value);
        if (this.resultFormatter) {
          this._windowRef.setInput("formatter", this.resultFormatter);
        }
        if (this.resultTemplate) {
          this._windowRef.setInput("resultTemplate", this.resultTemplate);
        }
        this._windowRef.instance.resetActive();
        this._windowRef.changeDetectorRef.detectChanges();
        this._showHint();
      }
      const count = results ? results.length : 0;
      this._live.say(count === 0 ? "No results available" : `${count} result${count === 1 ? "" : "s"} available`);
    }).call(this));
  }
  _unsubscribeFromUserInput() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._subscription = null;
  }
  constructor() {
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][0] : inject(ElementRef)).nativeElement;
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][1] : inject(NgbTypeaheadConfig);
    this._live = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][2] : inject(Live);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][3] : inject(DOCUMENT);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][4] : inject(NgZone);
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbTypeahead"] ? globalThis.ɵngjsInjected["NgbTypeahead"][5] : inject(ChangeDetectorRef);
    this._popupService = new PopupService(NgbTypeaheadWindow);
    this._positioning = ngbPositioning();
    this._subscription = null;
    this._closed$ = new Subject();
    this._inputValueBackup = null;
    this._inputValueForSelectOnExact = null;
    this._valueChanges$ = fromEvent(this._nativeElement, "input").pipe(map(($event) => $event.target.value));
    this._resubscribeTypeahead$ = new BehaviorSubject(null);
    this._windowRef = null;
    this.autocomplete = "off";
    this.container = this._config.container;
    this.editable = this._config.editable;
    this.focusFirst = this._config.focusFirst;
    this.selectOnExact = this._config.selectOnExact;
    this.showHint = this._config.showHint;
    this.placement = this._config.placement;
    this.popperOptions = this._config.popperOptions;
    this.selectItem = new EventEmitter();
    this.role = "combobox";
    this.autocapitalize = "off";
    this.autocorrect = "off";
    this.activeDescendant = null;
    this.popupId = `ngb-typeahead-${nextWindowId++}`;
    this._onTouched = () => {
    };
    this._onChange = (_) => {
    };
  }
};
NgbTypeahead.ɵfac = [
  "ElementRef_927308a2",
  "NgbTypeaheadConfig_2a81f1f3",
  "Live_00e51de5",
  "DOCUMENT_a3a362b8",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbTypeahead_Factory(i0, i1, i2, i3, i4, i5, $element, $scope) {
    var ɵtag = $element[0].nodeType === 8 && /ngTemplate/.test($element[0].nodeValue) ? "ng-template" : String($element[0].tagName || $element[0].nodeName).toLowerCase();
    if (!(this && this.ɵT) && [
      "input"
    ].indexOf(ɵtag) === -1) {
      console.warn("NgbTypeahead: este selector requiere <input>, no se aplica en <" + ɵtag + ">.");
      return {};
    }
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbTypeahead": [
        i0,
        i1,
        i2,
        i3,
        i4,
        i5
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbTypeahead)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance.autocomplete;
    }, function(v) {
      $element.prop("autocomplete", v);
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance.role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance.autocapitalize;
    }, function(v) {
      v == null ? $element.removeAttr("autocapitalize") : $element.attr("autocapitalize", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance.autocorrect;
    }, function(v) {
      v == null ? $element.removeAttr("autocorrect") : $element.attr("autocorrect", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance.activeDescendant;
    }, function(v) {
      v == null ? $element.removeAttr("aria-activedescendant") : $element.attr("aria-activedescendant", String(v));
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance.isOpenClass;
    }, function(v) {
      v ? $element.addClass("open") : $element.removeClass("open");
    });
    var ɵunwatch6 = $scope.$watch(function() {
      return instance.ariaAutocomplete;
    }, function(v) {
      v == null ? $element.removeAttr("aria-autocomplete") : $element.attr("aria-autocomplete", String(v));
    });
    var ɵunwatch7 = $scope.$watch(function() {
      return instance.ariaControls;
    }, function(v) {
      v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
    });
    var ɵunwatch8 = $scope.$watch(function() {
      return instance.ariaExpanded;
    }, function(v) {
      v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        $element.prop("autocomplete", v);
      })(instance.autocomplete);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance.role);
      (function(v) {
        v == null ? $element.removeAttr("autocapitalize") : $element.attr("autocapitalize", String(v));
      })(instance.autocapitalize);
      (function(v) {
        v == null ? $element.removeAttr("autocorrect") : $element.attr("autocorrect", String(v));
      })(instance.autocorrect);
      (function(v) {
        v == null ? $element.removeAttr("aria-activedescendant") : $element.attr("aria-activedescendant", String(v));
      })(instance.activeDescendant);
      (function(v) {
        v ? $element.addClass("open") : $element.removeClass("open");
      })(instance.isOpenClass);
      (function(v) {
        v == null ? $element.removeAttr("aria-autocomplete") : $element.attr("aria-autocomplete", String(v));
      })(instance.ariaAutocomplete);
      (function(v) {
        v == null ? $element.removeAttr("aria-controls") : $element.attr("aria-controls", String(v));
      })(instance.ariaControls);
      (function(v) {
        v == null ? $element.removeAttr("aria-expanded") : $element.attr("aria-expanded", String(v));
      })(instance.ariaExpanded);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleBlur();
      } else {
        $scope.$apply(function() {
          instance.handleBlur();
        });
      }
    };
    $element.on("blur", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleKeyDown(event);
      } else {
        $scope.$apply(function() {
          instance.handleKeyDown(event);
        });
      }
    };
    $element.on("keydown", ɵhandler1);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
      ɵunwatch6();
      ɵunwatch7();
      ɵunwatch8();
      $element.off("blur", ɵhandler0);
      $element.off("keydown", ɵhandler1);
    });
    return instance;
  }
];
NgbTypeahead.ɵdir = {
  selectors: [
    [
      "input",
      "ngbTypeahead",
      ""
    ]
  ],
  inputs: {
    "autocomplete": "autocomplete",
    "container": "container",
    "editable": "editable",
    "focusFirst": "focusFirst",
    "inputFormatter": "inputFormatter",
    "ngbTypeahead": "ngbTypeahead",
    "resultFormatter": "resultFormatter",
    "resultTemplate": "resultTemplate",
    "selectOnExact": "selectOnExact",
    "showHint": "showHint",
    "placement": "placement",
    "popperOptions": "popperOptions",
    "popupClass": "popupClass"
  },
  outputs: {
    "selectItem": "selectItem"
  },
  exportAs: [
    "ngbTypeahead"
  ],
  definition: {
    "bindings": {
      "autocomplete": "@?",
      "container": "<?",
      "editable": "<?",
      "focusFirst": "<?",
      "inputFormatter": "<?",
      "ngbTypeahead": "<?",
      "resultFormatter": "<?",
      "resultTemplate": "<?",
      "selectOnExact": "<?",
      "showHint": "<?",
      "placement": "<?",
      "popperOptions": "<?",
      "popupClass": "<?",
      "selectItem": "&?"
    }
  }
};
NgbTypeahead.ɵfac.ɵtype = NgbTypeahead;
NgbTypeahead.ɵfac.ɵproviders = [
  {
    token: "NG_VALUE_ACCESSOR_de942eb5",
    kind: "useExisting",
    existing: "NgbTypeahead_c7cc54a2",
    multi: true
  }
];
NgbTypeahead.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbTypeahead.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbTypeahead.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["autocomplete"];
    if (!c) return;
    changes["autocomplete"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["container"];
    if (!c) return;
    changes["container"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["editable"];
    if (!c) return;
    changes["editable"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["focusFirst"];
    if (!c) return;
    changes["focusFirst"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["inputFormatter"];
    if (!c) return;
    changes["inputFormatter"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["ngbTypeahead"];
    if (!c) return;
    changes["ngbTypeahead"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["resultFormatter"];
    if (!c) return;
    changes["resultFormatter"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["resultTemplate"];
    if (!c) return;
    changes["resultTemplate"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["selectOnExact"];
    if (!c) return;
    changes["selectOnExact"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["showHint"];
    if (!c) return;
    changes["showHint"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["placement"];
    if (!c) return;
    changes["placement"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popperOptions"];
    if (!c) return;
    changes["popperOptions"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popupClass"];
    if (!c) return;
    changes["popupClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  this.ngOnChanges(changes);
};
function ɵElementInjectorNode(providers, parent, $injector, element, boundary) {
  this.parent = parent;
  this.$injector = $injector;
  this.element = element;
  this.boundary = boundary;
  this.singles = {};
  this.multis = {};
  this.cache = {};
  for (var i = 0; i < providers.length; i++) {
    var p = providers[i];
    if (p.multi) {
      (this.multis[p.token] = this.multis[p.token] || []).push(p);
    } else {
      this.singles[p.token] = p;
    }
  }
}
var ɵNOT_FOUND = {};
ɵElementInjectorNode.prototype.resolve = function(name) {
  if (name === "ɵresolve") return this.resolverFor(this.boundary);
  return this.resolveWith(name, {});
};
ɵElementInjectorNode.prototype.resolverFor = function(boundary) {
  var self = this;
  return function(token, flags) {
    flags = flags || {};
    return flags.host ? self.resolveHost(token, flags, boundary) : self.resolveWith(token, flags);
  };
};
ɵElementInjectorNode.prototype.resolveWith = function(name, flags) {
  if (flags.host) return this.resolveHost(name, flags, this.boundary);
  if (!flags.skipSelf) {
    var own = this.resolveOwn(name);
    if (own !== ɵNOT_FOUND) return own;
    if (flags.self) {
      if (flags.optional) return null;
      throw new Error('ɵElementInjectorNode: no hay provider para "' + name + '" con { self: true }.');
    }
  }
  if (this.parent) return this.parent.resolveWith(name, {
    optional: flags.optional
  });
  if (!flags.optional) return this.$injector.get(name);
  return this.$injector.has(name) ? this.$injector.get(name) : null;
};
ɵElementInjectorNode.prototype.resolveHost = function(name, flags, boundary) {
  var within = function(node2) {
    return !boundary || !node2.element || node2.element === boundary || boundary.contains(node2.element);
  };
  for (var node = flags.skipSelf ? this.parent : this; node && within(node); node = node.parent) {
    var own = node.resolveOwn(name);
    if (own !== ɵNOT_FOUND) return own;
  }
  if (flags.optional) return null;
  throw new Error('ɵElementInjectorNode: no hay provider para "' + name + '" con { host: true } (entre este elemento y su host).');
};
ɵElementInjectorNode.prototype.provides = function(name) {
  for (var node = this; node; node = node.parent) {
    if (Object.prototype.hasOwnProperty.call(node.singles, name) || Object.prototype.hasOwnProperty.call(node.multis, name)) return true;
  }
  return false;
};
ɵElementInjectorNode.prototype.resolveOwn = function(name) {
  if (Object.prototype.hasOwnProperty.call(this.cache, name)) return this.cache[name];
  if (Object.prototype.hasOwnProperty.call(this.multis, name)) {
    var resolved = this.multis[name].map(this.instantiate, this);
    this.cache[name] = resolved;
    return resolved;
  }
  if (Object.prototype.hasOwnProperty.call(this.singles, name)) {
    var resolved = this.instantiate(this.singles[name]);
    this.cache[name] = resolved;
    return resolved;
  }
  return ɵNOT_FOUND;
};
ɵElementInjectorNode.prototype.instantiate = function(descriptor) {
  var self = this;
  var resolve = function(name) {
    return self.resolve(name);
  };
  if (descriptor.kind === "useValue") return descriptor.value;
  if (descriptor.kind === "useFactory") return descriptor.factory.apply(null, descriptor.deps.map(resolve));
  if (descriptor.kind === "useExisting") return resolve(descriptor.existing);
  if (descriptor.deps) return new (Function.prototype.bind.apply(descriptor.ctor, [
    null
  ].concat(descriptor.deps.map(resolve))))();
  var ctor = descriptor.ctor;
  var own = Object.prototype.hasOwnProperty;
  var fac = descriptor.kind === "class" && own.call(ctor, "ɵprov") && ctor.ɵprov.factory || (own.call(ctor, "ɵfac") ? ctor.ɵfac : null);
  if (!fac && ctor.ɵfac) throw new Error('"' + ctor.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
  if (!fac) return new ctor();
  return fac[fac.length - 1].apply(null, fac.slice(0, -1).map(resolve));
};
ɵElementInjectorNode.prototype.destroy = function() {
  var cache = this.cache;
  this.cache = {};
  for (var name in cache) {
    var values = Object.prototype.hasOwnProperty.call(this.multis, name) ? cache[name] : [
      cache[name]
    ];
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      if (value && typeof value.ngOnDestroy === "function" && !this.isAlias(name)) value.ngOnDestroy();
    }
  }
};
ɵElementInjectorNode.prototype.isAlias = function(name) {
  var single = this.singles[name];
  return Boolean(single && (single.kind === "useExisting" || single.kind === "useValue"));
};
function ɵscopedController($delegate, $injector) {
  if ($injector.ɵngjsScopedController) return $delegate;
  $injector.ɵngjsScopedController = true;
  return function(expression, locals, later, ident) {
    var $element = locals && locals.$element;
    if (!$element) return $delegate(expression, locals, later, ident);
    var isComponent = Boolean(expression && expression.ɵcomponent);
    var boundary = isComponent ? $element[0] : $element.parent ? $element.parent().inheritedData("$ngjsHost") : void 0;
    var ownProviders = expression && expression.ɵproviders;
    var node = $element.inheritedData("$ngjsScopedInjector");
    if (ownProviders && ownProviders.length) {
      node = new ɵElementInjectorNode(ownProviders, node, $injector, $element[0], boundary);
      $element.data("$ngjsScopedInjector", node);
      var $scope = locals.$scope;
      if ($scope && $scope.$on) {
        (function(ownNode) {
          $scope.$on("$destroy", function() {
            ownNode.destroy();
          });
        })(node);
      }
    }
    if (!node) return $delegate(expression, locals, later, ident);
    var depNames = Array.isArray(expression) ? expression.slice(0, -1) : expression && expression.$inject || [];
    var extra;
    for (var i = 0; i < depNames.length; i++) {
      var name = depNames[i];
      if (locals && Object.prototype.hasOwnProperty.call(locals, name)) continue;
      if (name !== "ɵresolve" && !node.provides(name)) continue;
      extra = extra || {};
      extra[name] = name === "ɵresolve" ? node.resolverFor(boundary) : node.resolve(name);
    }
    if (!extra) return $delegate(expression, locals, later, ident);
    var merged = {};
    for (var k in locals) merged[k] = locals[k];
    for (var k2 in extra) merged[k2] = extra[k2];
    return $delegate(expression, merged, later, ident);
  };
}
function ɵlazyController($delegate, $injector) {
  if ($injector.ɵngjsLazyController) return $delegate;
  $injector.ɵngjsLazyController = true;
  return function(expression, locals, later, ident) {
    var init = $delegate.apply(this, arguments);
    if (!later || !expression || !expression.ɵtype || typeof init !== "function" || !init.instance) return init;
    var state = 0, built;
    var lazy = function() {
      if (state === 2) return built;
      if (state === 1) throw new Error('NG0200: dependencia circular — "' + expression.ɵtype.name + '" se pidió a sí misma mientras se construía (directivas del mismo elemento que se inyectan entre sí).');
      state = 1;
      try {
        built = init();
        state = 2;
      } finally {
        if (state !== 2) state = 0;
      }
      return built;
    };
    Object.defineProperty(init.instance, "ɵngjsBuild", {
      value: lazy,
      configurable: true
    });
    lazy.instance = init.instance;
    lazy.identifier = init.identifier;
    return lazy;
  };
}
var NgbTypeaheadModule = class {
};
NgbTypeaheadModule.ɵfac = [
  function NgbTypeaheadModule_Factory() {
    return new (this && this.ɵT || NgbTypeaheadModule)();
  }
];
NgbTypeaheadModule.ɵmod = {
  id: "NgbTypeaheadModule_f72b1943",
  controllerAs: "$"
};
import_angular.default.module("NgbTypeaheadModule_f72b1943", [
  typeof CommonModule === "string" ? CommonModule : CommonModule.ɵmod ? CommonModule.ɵmod.id : CommonModule.name
]).factory("ɵresolve", [
  "$injector",
  function($injector) {
    return function(name, flags, element) {
      flags = flags || {};
      var bounded = element && (flags.self || flags.host);
      if (!bounded && $injector.has(name)) return $injector.get(name);
      if (flags.optional) return null;
      throw new Error('ɵresolve: no hay provider para "' + name + '"' + (bounded ? " con { " + (flags.self ? "self" : "host") + ": true } (sin injector de elemento)" : "") + ".");
    };
  }
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵscopedController
]).decorator("$controller", [
  "$delegate",
  "$injector",
  ɵlazyController
]).component("ngbHighlight", {
  controller: NgbHighlight.ɵfac,
  template: `<span
    ng-repeat="part in $.parts track by $index"
    ng-class="[$odd ? $.highlightClass : '', $odd && $.highlightClass === 'ngb-highlight' ? 'fw-bold' : '']">{{ part }}</span>`,
  controllerAs: "$",
  bindings: {
    "highlightClass": "<?",
    "result": "<?",
    "term": "<?",
    "accentSensitive": "<?"
  }
}).directive("ngbTypeahead", function() {
  return {
    controller: NgbTypeahead.ɵfac,
    restrict: "A",
    bindToController: {
      "autocomplete": "@?",
      "container": "<?",
      "editable": "<?",
      "focusFirst": "<?",
      "inputFormatter": "<?",
      "ngbTypeahead": "<?",
      "resultFormatter": "<?",
      "resultTemplate": "<?",
      "selectOnExact": "<?",
      "showHint": "<?",
      "placement": "<?",
      "popperOptions": "<?",
      "popupClass": "<?",
      "selectItem": "&?"
    },
    controllerAs: "ngbTypeahead"
  };
}).directive("ngbTypeahead", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        if (element[0].localName !== "input") return;
        [
          "select-item"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbTypeaheadModule_def87fa3", NgbTypeaheadModule.ɵfac).run([
  "NgbTypeaheadModule_def87fa3",
  function() {
  }
]);

// src/app/features/typeahead/typeahead.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Typeahead",
      tabs: [
        {
          name: "Examples",
          to: "/components/typeahead/examples"
        },
        {
          name: "Api",
          to: "/components/typeahead/api"
        }
      ],
      externalLinks: {
        ngBootstrap: "components/typeahead/overview"
      }
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "examples"
      },
      {
        path: "examples",
        data: {
          sections: [
            {
              id: "simple-typeahead",
              name: "Simple Typeahead"
            },
            {
              id: "focus-typeahead",
              name: "Open on focus"
            },
            {
              id: "formatted-typeahead",
              name: "Formatted results"
            },
            {
              id: "exact-typeahead",
              name: "Select on exact"
            },
            {
              id: "wikipedia-typeahead",
              name: "Wikipedia search"
            },
            {
              id: "template-results-typeahead",
              name: "Template for results"
            },
            {
              id: "non-editable-typeahead",
              name: "Prevent manual entry"
            },
            {
              id: "typeahead-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./typeahead-examples-page.component-2YVMXFDV.js").then((m) => m.TypeaheadExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-typeahead",
              name: "NgbTypeahead"
            },
            {
              id: "ngb-highlight",
              name: "NgbHighlight"
            },
            {
              id: "ngb-typeahead-config",
              name: "NgbTypeaheadConfig"
            }
          ]
        },
        loadComponent: () => import("./typeahead-api-page.component-VGHLZTTE.js").then((m) => m.TypeaheadApiPageComponent)
      }
    ]
  }
];

// src/app/features/typeahead/components/exact-typeahead/exact-typeahead.component.ts
var STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii"
].map((name) => ({
  name
}));
var ExactTypeaheadComponent = class {
  constructor() {
    this.formatter = (state) => state.name;
    this.search = (text$) => text$.pipe(debounceTime(200), map2((term) => term ? STATES.filter((state) => state.name.toLowerCase().includes(term.toLowerCase())) : []));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-39ea28dd],.card[_content-39ea28dd],.dropdown-menu[_content-39ea28dd],.list-group-item[_content-39ea28dd],.form-control[_content-39ea28dd],.form-select[_content-39ea28dd]{border-color:var(--bs-border-color)}.alert-light[_content-39ea28dd]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-39ea28dd],.list-group[_content-39ea28dd],.dropdown-menu[_content-39ea28dd]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-39ea28dd],.btn-outline-secondary[_content-39ea28dd]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-39ea28dd],.form-select[_content-39ea28dd]{background-color:var(--bs-body-bg)}code[_content-39ea28dd]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
ExactTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function ExactTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || ExactTypeaheadComponent)();
    return instance;
  }
];
ExactTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-exact-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/exact-typeahead.component-9649ae75.html",
    "controllerAs": "example"
  }
};
ExactTypeaheadComponent.ɵfac.ɵcomponent = true;
ExactTypeaheadComponent.ɵfac.ɵtype = ExactTypeaheadComponent;

// src/app/features/typeahead/components/focus-typeahead/focus-typeahead.component.ts
var STATES2 = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];
var FocusTypeaheadComponent = class {
  ngOnDestroy() {
    this.focus$.complete();
  }
  constructor() {
    this.model = "";
    this.focus$ = new Subject2();
    this.search = (text$) => merge(text$.pipe(debounceTime(200), distinctUntilChanged()), this.focus$).pipe(map2((term) => (term ? STATES2.filter((state) => state.toLowerCase().includes(term.toLowerCase())) : STATES2).slice(0, 10)));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-2cebcf67],.card[_content-2cebcf67],.dropdown-menu[_content-2cebcf67],.list-group-item[_content-2cebcf67],.form-control[_content-2cebcf67],.form-select[_content-2cebcf67]{border-color:var(--bs-border-color)}.alert-light[_content-2cebcf67]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-2cebcf67],.list-group[_content-2cebcf67],.dropdown-menu[_content-2cebcf67]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-2cebcf67],.btn-outline-secondary[_content-2cebcf67]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-2cebcf67],.form-select[_content-2cebcf67]{background-color:var(--bs-body-bg)}code[_content-2cebcf67]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
FocusTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function FocusTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || FocusTypeaheadComponent)();
    return instance;
  }
];
FocusTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-focus-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/focus-typeahead.component-f21e7cde.html",
    "controllerAs": "example"
  }
};
FocusTypeaheadComponent.ɵfac.ɵcomponent = true;
FocusTypeaheadComponent.ɵfac.ɵtype = FocusTypeaheadComponent;
FocusTypeaheadComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};

// src/app/features/typeahead/components/formatted-typeahead/formatted-typeahead.component.ts
var STATES3 = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii"
];
var FormattedTypeaheadComponent = class {
  constructor() {
    this.model = "";
    this.formatter = (result) => result.toUpperCase();
    this.search = (text$) => text$.pipe(debounceTime(200), distinctUntilChanged(), map2((term) => term ? STATES3.filter((state) => state.toLowerCase().includes(term.toLowerCase())) : []));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-30158ffa],.card[_content-30158ffa],.dropdown-menu[_content-30158ffa],.list-group-item[_content-30158ffa],.form-control[_content-30158ffa],.form-select[_content-30158ffa]{border-color:var(--bs-border-color)}.alert-light[_content-30158ffa]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-30158ffa],.list-group[_content-30158ffa],.dropdown-menu[_content-30158ffa]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-30158ffa],.btn-outline-secondary[_content-30158ffa]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-30158ffa],.form-select[_content-30158ffa]{background-color:var(--bs-body-bg)}code[_content-30158ffa]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
FormattedTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function FormattedTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || FormattedTypeaheadComponent)();
    return instance;
  }
];
FormattedTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-formatted-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/formatted-typeahead.component-6f488d85.html",
    "controllerAs": "example"
  }
};
FormattedTypeaheadComponent.ɵfac.ɵcomponent = true;
FormattedTypeaheadComponent.ɵfac.ɵtype = FormattedTypeaheadComponent;

// src/app/features/typeahead/components/non-editable-typeahead/non-editable-typeahead.component.ts
var STATES4 = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii"
].map((name, id) => ({
  id,
  name
}));
var NonEditableTypeaheadComponent = class {
  constructor() {
    this.model = null;
    this.formatter = (state) => state.name;
    this.search = (text$) => text$.pipe(debounceTime(200), distinctUntilChanged(), map2((term) => term.length < 2 ? [] : STATES4.filter((state) => state.name.toLowerCase().includes(term.toLowerCase()))));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-6ac7d01b],.card[_content-6ac7d01b],.dropdown-menu[_content-6ac7d01b],.list-group-item[_content-6ac7d01b],.form-control[_content-6ac7d01b],.form-select[_content-6ac7d01b]{border-color:var(--bs-border-color)}.alert-light[_content-6ac7d01b]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-6ac7d01b],.list-group[_content-6ac7d01b],.dropdown-menu[_content-6ac7d01b]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-6ac7d01b],.btn-outline-secondary[_content-6ac7d01b]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-6ac7d01b],.form-select[_content-6ac7d01b]{background-color:var(--bs-body-bg)}code[_content-6ac7d01b]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
NonEditableTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function NonEditableTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NonEditableTypeaheadComponent)();
    return instance;
  }
];
NonEditableTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-non-editable-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/non-editable-typeahead.component-e0568a93.html",
    "controllerAs": "example"
  }
};
NonEditableTypeaheadComponent.ɵfac.ɵcomponent = true;
NonEditableTypeaheadComponent.ɵfac.ɵtype = NonEditableTypeaheadComponent;

// src/app/features/typeahead/components/simple-typeahead/simple-typeahead.component.ts
var STATES5 = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];
var SimpleTypeaheadComponent = class {
  constructor() {
    this.model = "";
    this.search = (text$) => text$.pipe(debounceTime(200), distinctUntilChanged(), map2((term) => term.length < 2 ? [] : STATES5.filter((state) => state.toLowerCase().includes(term.toLowerCase())).slice(0, 10)));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-ef1d3fc8],.card[_content-ef1d3fc8],.dropdown-menu[_content-ef1d3fc8],.list-group-item[_content-ef1d3fc8],.form-control[_content-ef1d3fc8],.form-select[_content-ef1d3fc8]{border-color:var(--bs-border-color)}.alert-light[_content-ef1d3fc8]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-ef1d3fc8],.list-group[_content-ef1d3fc8],.dropdown-menu[_content-ef1d3fc8]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-ef1d3fc8],.btn-outline-secondary[_content-ef1d3fc8]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-ef1d3fc8],.form-select[_content-ef1d3fc8]{background-color:var(--bs-body-bg)}code[_content-ef1d3fc8]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
SimpleTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function SimpleTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || SimpleTypeaheadComponent)();
    return instance;
  }
];
SimpleTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-simple-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/simple-typeahead.component-64fa496a.html",
    "controllerAs": "example"
  }
};
SimpleTypeaheadComponent.ɵfac.ɵcomponent = true;
SimpleTypeaheadComponent.ɵfac.ɵtype = SimpleTypeaheadComponent;

// src/app/features/typeahead/components/template-results-typeahead/template-results-typeahead.component.ts
var COUNTRIES = [
  {
    name: "Mexico",
    flag: "🇲🇽",
    region: "North America"
  },
  {
    name: "Argentina",
    flag: "🇦🇷",
    region: "South America"
  },
  {
    name: "Brazil",
    flag: "🇧🇷",
    region: "South America"
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    region: "North America"
  },
  {
    name: "Colombia",
    flag: "🇨🇴",
    region: "South America"
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    region: "Europe"
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    region: "Asia"
  },
  {
    name: "Spain",
    flag: "🇪🇸",
    region: "Europe"
  }
];
var TemplateResultsTypeaheadComponent = class {
  constructor() {
    this.formatter = (country) => country.name;
    this.search = (text$) => text$.pipe(debounceTime(200), map2((term) => term ? COUNTRIES.filter((country) => country.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8) : []));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-8136f252],.card[_content-8136f252],.dropdown-menu[_content-8136f252],.list-group-item[_content-8136f252],.form-control[_content-8136f252],.form-select[_content-8136f252]{border-color:var(--bs-border-color)}.alert-light[_content-8136f252]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-8136f252],.list-group[_content-8136f252],.dropdown-menu[_content-8136f252]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-8136f252],.btn-outline-secondary[_content-8136f252]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-8136f252],.form-select[_content-8136f252]{background-color:var(--bs-body-bg)}code[_content-8136f252]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
TemplateResultsTypeaheadComponent.ɵfac = [
  "$element",
  "$scope",
  function TemplateResultsTypeaheadComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || TemplateResultsTypeaheadComponent)();
    return instance;
  }
];
TemplateResultsTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-template-results-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/template-results-typeahead.component-4e92c511.html",
    "controllerAs": "example"
  }
};
TemplateResultsTypeaheadComponent.ɵfac.ɵcomponent = true;
TemplateResultsTypeaheadComponent.ɵfac.ɵtype = TemplateResultsTypeaheadComponent;

// src/app/features/typeahead/components/typeahead-global/typeahead-global.component.ts
var STATES6 = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii"
];
var TypeaheadGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.model = "";
    this.search = (text$) => text$.pipe(debounceTime(200), distinctUntilChanged(), map2((term) => term.length < 2 ? [] : STATES6.filter((state) => state.toLowerCase().startsWith(term.toLowerCase()))));
    this.initialConfig = {
      container: config.container,
      selectOnExact: config.selectOnExact,
      showHint: config.showHint
    };
    config.container = "body";
    config.selectOnExact = true;
    config.showHint = true;
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    this.config.container = this.initialConfig.container;
    this.config.selectOnExact = this.initialConfig.selectOnExact;
    this.config.showHint = this.initialConfig.showHint;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-e9eba44b],.card[_content-e9eba44b],.dropdown-menu[_content-e9eba44b],.list-group-item[_content-e9eba44b],.form-control[_content-e9eba44b],.form-select[_content-e9eba44b]{border-color:var(--bs-border-color)}.alert-light[_content-e9eba44b]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-e9eba44b],.list-group[_content-e9eba44b],.dropdown-menu[_content-e9eba44b]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-e9eba44b],.btn-outline-secondary[_content-e9eba44b]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-e9eba44b],.form-select[_content-e9eba44b]{background-color:var(--bs-body-bg)}code[_content-e9eba44b]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
TypeaheadGlobalComponent.ɵfac = [
  "NgbTypeaheadConfig_2a81f1f3",
  "$element",
  "$scope",
  function TypeaheadGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || TypeaheadGlobalComponent)(a0);
    return instance;
  }
];
TypeaheadGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-typeahead-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/typeahead-global.component-34702eef.html",
    "controllerAs": "example"
  }
};
TypeaheadGlobalComponent.ɵfac.ɵcomponent = true;
TypeaheadGlobalComponent.ɵfac.ɵtype = TypeaheadGlobalComponent;
TypeaheadGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
TypeaheadGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/typeahead/components/wikipedia-typeahead/wikipedia-typeahead.component.ts
var WIKI_URL = "https://en.wikipedia.org/w/api.php";
var WikipediaSearchService = class {
  constructor(http) {
    this.http = http;
  }
  search(term) {
    if (!term) return of2([]);
    return this.http.get(WIKI_URL, {
      params: new HttpParams({
        fromObject: {
          action: "opensearch",
          format: "json",
          origin: "*",
          search: term
        }
      })
    }).pipe(map2((response) => response[1]));
  }
};
var WikipediaTypeaheadComponent = class {
  constructor(wikipedia) {
    this.wikipedia = wikipedia;
    this.model = "";
    this.searching = false;
    this.searchFailed = false;
    this.search = (text$) => text$.pipe(debounceTime(300), distinctUntilChanged(), tap2(() => this.searching = true), switchMap2((term) => this.wikipedia.search(term).pipe(tap2(() => this.searchFailed = false), catchError(() => {
      this.searchFailed = true;
      return of2([]);
    }))), tap2(() => this.searching = false));
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-9950bfc3],.card[_content-9950bfc3],.dropdown-menu[_content-9950bfc3],.list-group-item[_content-9950bfc3],.form-control[_content-9950bfc3],.form-select[_content-9950bfc3]{border-color:var(--bs-border-color)}.alert-light[_content-9950bfc3]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-9950bfc3],.list-group[_content-9950bfc3],.dropdown-menu[_content-9950bfc3]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-9950bfc3],.btn-outline-secondary[_content-9950bfc3]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-9950bfc3],.form-select[_content-9950bfc3]{background-color:var(--bs-body-bg)}code[_content-9950bfc3]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
WikipediaSearchService.ɵfac = [
  "HttpClient_b810fb9f",
  function WikipediaSearchService_Factory(a0) {
    return new (this && this.ɵT || WikipediaSearchService)(a0);
  }
];
WikipediaSearchService.ɵprov = {
  token: "WikipediaSearchService_b96fd3dd"
};
WikipediaTypeaheadComponent.ɵfac = [
  "WikipediaSearchService_b96fd3dd",
  "$element",
  "$scope",
  function WikipediaTypeaheadComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || WikipediaTypeaheadComponent)(a0);
    return instance;
  }
];
WikipediaTypeaheadComponent.ɵcmp = {
  selectors: [
    [
      "docs-wikipedia-typeahead"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/wikipedia-typeahead.component-a4b50ff7.html",
    "controllerAs": "example"
  }
};
WikipediaTypeaheadComponent.ɵfac.ɵcomponent = true;
WikipediaTypeaheadComponent.ɵfac.ɵtype = WikipediaTypeaheadComponent;

// src/app/features/typeahead/typeahead.module.ts
function ɵtokenName(token) {
  if (typeof token === "string") return token;
  if (token && token.ɵprov) return token.ɵprov.token;
  throw new Error("ModuleWithProviders: el token " + String(token && token.name || token) + " no tiene nombre de DI en runtime (solo un string, una clase con @Injectable o un InjectionToken) — si es una clase, agregale @Injectable().");
}
function ɵownFactory(cls) {
  if (Object.prototype.hasOwnProperty.call(cls, "ɵfac")) return cls.ɵfac;
  if (cls.ɵfac) throw new Error('"' + cls.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
  return [
    function() {
      return new cls();
    }
  ];
}
function ɵimportedModuleName(imported) {
  var module = imported && imported.ngModule ? imported.ngModule : imported;
  if (typeof module === "string") return module;
  return module.ɵmod ? module.ɵmod.id : module.name;
}
function ɵregisterProvider(module, key, provider) {
  if ("useValue" in provider) return module.value(key, provider.useValue);
  if (provider.useFactory) return module.factory(key, (provider.deps || []).map(ɵtokenName).concat([
    provider.useFactory
  ]));
  if (provider.useExisting) return module.factory(key, [
    ɵtokenName(provider.useExisting),
    function(existing) {
      return existing;
    }
  ]);
  var cls = provider.useClass || provider.provide;
  if (typeof cls !== "function") throw new Error('ModuleWithProviders: provider de "' + key + '" sin receta y sin clase en provide.');
  if (!provider.deps) return module.factory(key, provider.ɵbare && Object.prototype.hasOwnProperty.call(cls, "ɵprov") && cls.ɵprov.factory || ɵownFactory(cls));
  return module.factory(key, provider.deps.map(ɵtokenName).concat([
    function() {
      return new (Function.prototype.bind.apply(cls, [
        null
      ].concat(Array.prototype.slice.call(arguments))))();
    }
  ]));
}
function ɵimportProviders(module, imports) {
  var providers = [];
  var flatten = function(list) {
    for (var i2 = 0; i2 < list.length; i2++) Array.isArray(list[i2]) ? flatten(list[i2]) : providers.push(list[i2]);
  };
  for (var i = 0; i < imports.length; i++) if (imports[i] && imports[i].ngModule) flatten(imports[i].providers || []);
  var single = {};
  var multi = {};
  for (var j = 0; j < providers.length; j++) {
    var raw = providers[j];
    var provider = typeof raw === "function" ? {
      provide: raw,
      ɵbare: true
    } : raw;
    var token = ɵtokenName(provider.provide);
    if (provider.multi ? single[token] : multi[token]) {
      throw new Error('ModuleWithProviders: mezcla providers multi y no-multi para el token "' + token + '".');
    }
    if (provider.multi) (multi[token] = multi[token] || []).push(provider);
    else single[token] = provider;
  }
  for (var name in single) ɵregisterProvider(module, name, single[name]);
  for (var multiName in multi) {
    var members = multi[multiName].map(function(_, index) {
      return multiName + "#multi#" + module.name + "#import#" + index;
    });
    for (var k = 0; k < members.length; k++) ɵregisterProvider(module, members[k], multi[multiName][k]);
    module.config(ɵmultiConfig(multiName, members));
  }
  return module;
}
function ɵmultiMixError(token) {
  return new Error('Multi-providers: mezcla providers multi y no-multi para el token "' + token + '" entre módulos.');
}
function ɵmultiProviders($provide, providers, token, members) {
  var state = providers.ɵmulti;
  if (!state) {
    state = providers.ɵmulti = {
      tokens: {},
      factory: $provide.factory
    };
    [
      "provider",
      "factory",
      "service",
      "value",
      "constant"
    ].forEach(function(method) {
      var original = $provide[method];
      $provide[method] = function(name) {
        if (typeof name === "string" && Object.prototype.hasOwnProperty.call(state.tokens, name)) throw ɵmultiMixError(name);
        return original.apply(this, arguments);
      };
    });
  }
  var rootDefault = providers.ɵrootDefaults && providers.ɵrootDefaults[token];
  if (!state.tokens[token] && providers.has(token + "Provider") && !rootDefault) throw ɵmultiMixError(token);
  state.tokens[token] = (state.tokens[token] || []).concat(members);
  state.factory(token, state.tokens[token].concat([
    function() {
      return Array.prototype.slice.call(arguments);
    }
  ]));
}
function ɵmultiConfig(token, members) {
  return [
    "$provide",
    "$injector",
    function($provide, providers) {
      ɵmultiProviders($provide, providers, token, members);
    }
  ];
}
var TypeaheadModule = class {
};
TypeaheadModule.ɵfac = [
  function TypeaheadModule_Factory() {
    return new (this && this.ɵT || TypeaheadModule)();
  }
];
var ɵTypeaheadModule_import0 = RouterModule.forChild(routes);
TypeaheadModule.ɵmod = {
  id: "TypeaheadModule_c0e164ce"
};
ɵimportProviders(import_angular2.default.module("TypeaheadModule_c0e164ce", [
  typeof NgbTypeaheadModule === "string" ? NgbTypeaheadModule : NgbTypeaheadModule.ɵmod ? NgbTypeaheadModule.ɵmod.id : NgbTypeaheadModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  ɵimportedModuleName(ɵTypeaheadModule_import0)
]), [
  ɵTypeaheadModule_import0
]).factory("WikipediaSearchService_b96fd3dd", Object.prototype.hasOwnProperty.call(WikipediaSearchService, "ɵprov") && WikipediaSearchService.ɵprov.factory || (Object.prototype.hasOwnProperty.call(WikipediaSearchService, "ɵfac") ? WikipediaSearchService.ɵfac : WikipediaSearchService.ɵfac ? (function() {
  throw new Error('"' + WikipediaSearchService.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new WikipediaSearchService();
  }
])).component("docsExactTypeahead", {
  controller: ExactTypeaheadComponent.ɵfac,
  templateUrl: "templates/exact-typeahead.component-9649ae75.html",
  controllerAs: "example"
}).component("docsFocusTypeahead", {
  controller: FocusTypeaheadComponent.ɵfac,
  templateUrl: "templates/focus-typeahead.component-f21e7cde.html",
  controllerAs: "example"
}).component("docsFormattedTypeahead", {
  controller: FormattedTypeaheadComponent.ɵfac,
  templateUrl: "templates/formatted-typeahead.component-6f488d85.html",
  controllerAs: "example"
}).component("docsNonEditableTypeahead", {
  controller: NonEditableTypeaheadComponent.ɵfac,
  templateUrl: "templates/non-editable-typeahead.component-e0568a93.html",
  controllerAs: "example"
}).component("docsSimpleTypeahead", {
  controller: SimpleTypeaheadComponent.ɵfac,
  templateUrl: "templates/simple-typeahead.component-64fa496a.html",
  controllerAs: "example"
}).component("docsTemplateResultsTypeahead", {
  controller: TemplateResultsTypeaheadComponent.ɵfac,
  templateUrl: "templates/template-results-typeahead.component-4e92c511.html",
  controllerAs: "example"
}).component("docsTypeaheadGlobal", {
  controller: TypeaheadGlobalComponent.ɵfac,
  templateUrl: "templates/typeahead-global.component-34702eef.html",
  controllerAs: "example"
}).component("docsWikipediaTypeahead", {
  controller: WikipediaTypeaheadComponent.ɵfac,
  templateUrl: "templates/wikipedia-typeahead.component-a4b50ff7.html",
  controllerAs: "example"
}).factory("TypeaheadModule_abc33bbf", TypeaheadModule.ɵfac).run([
  "TypeaheadModule_abc33bbf",
  function() {
  }
]);
export {
  TypeaheadModule
};
