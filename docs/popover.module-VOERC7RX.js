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
import {
  NgbCollapseModule
} from "./chunk-Y3STFSLE.js";
import {
  NgbNavModule
} from "./chunk-S3STC4KD.js";
import {
  NgbConfig,
  NgbScrollSpyModule
} from "./chunk-R7GTDWT4.js";
import {
  RouterModule
} from "./chunk-JSJOQJIT.js";
import "./chunk-BJK3QUXG.js";
import {
  ChangeDetectorRef,
  NgZone,
  PopupService,
  Subject,
  TemplateRef,
  addPopperOffset,
  inject,
  isString,
  listenToTriggers,
  ngbAutoClose,
  ngbPositioning
} from "./chunk-U6UIHJCB.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  require_angular
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// src/app/features/popover/popover.module.ts
var import_angular2 = __toESM(require_angular(), 1);

// ../ngb-js/dist/chunk-735XJ36E.js
var import_angular = __toESM(require_angular(), 1);
var NgbPopoverConfig = class {
  get animation() {
    return this._animation ?? this._config.animation;
  }
  set animation(value) {
    this._animation = value;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopoverConfig"] ? globalThis.ɵngjsInjected["NgbPopoverConfig"][0] : inject(NgbConfig);
    this.autoClose = true;
    this.placement = "auto";
    this.popperOptions = (options) => options;
    this.triggers = "click";
    this.disablePopover = false;
    this.openDelay = 0;
    this.closeDelay = 0;
  }
};
NgbPopoverConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbPopoverConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbPopoverConfig": [
        i0
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbPopoverConfig)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPopoverConfig.ɵprov = {
  token: "NgbPopoverConfig_39c292c6",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbPopoverConfig_39c292c6",
  NgbPopoverConfig.ɵfac
]);
var NgbPopoverWindow = class {
  get hostId() {
    return this.id;
  }
  get hostClass() {
    return `popover${this.popoverClass ? ` ${this.popoverClass}` : ""}`;
  }
  get hostFade() {
    return this.animation;
  }
  handleMouseEnter() {
    this.onMouseEnter?.();
  }
  handleMouseLeave() {
    this.onMouseLeave?.();
  }
  isTitleTemplate() {
    return this.title instanceof TemplateRef;
  }
  constructor() {
    this.role = "tooltip";
    this.position = "absolute";
  }
};
NgbPopoverWindow.ɵfac = [
  "$element",
  "$scope",
  function NgbPopoverWindow_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || NgbPopoverWindow)();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance.role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵunwatch1 = $scope.$watch(function() {
      return instance.position;
    }, function(v) {
      v == null ? $element.css("position", "") : $element.css("position", v + "");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance.hostId;
    }, function(v) {
      $element.prop("id", v);
    });
    var ɵunwatch3 = $scope.$watch(function() {
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
    var ɵunwatch4 = $scope.$watch(function() {
      return instance.hostFade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance.role);
      (function(v) {
        v == null ? $element.css("position", "") : $element.css("position", v + "");
      })(instance.position);
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
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance.hostFade);
      return ɵresult;
    };
    var ɵhandler0 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleMouseEnter();
      } else {
        $scope.$apply(function() {
          instance.handleMouseEnter();
        });
      }
    };
    $element.on("mouseenter", ɵhandler0);
    var ɵhandler1 = function(event) {
      var ɵphase = $scope.$root.$$phase;
      if (ɵphase === "$apply" || ɵphase === "$digest") {
        instance.handleMouseLeave();
      } else {
        $scope.$apply(function() {
          instance.handleMouseLeave();
        });
      }
    };
    $element.on("mouseleave", ɵhandler1);
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      $element.off("mouseenter", ɵhandler0);
      $element.off("mouseleave", ɵhandler1);
    });
    return instance;
  }
];
NgbPopoverWindow.ɵcmp = {
  selectors: [
    [
      "ngb-popover-window"
    ]
  ],
  inputs: {
    "animation": "animation",
    "title": "title",
    "id": "id",
    "popoverClass": "popoverClass",
    "context": "context",
    "onMouseEnter": "onMouseEnter",
    "onMouseLeave": "onMouseLeave"
  },
  outputs: {},
  definition: {
    "template": '<div class="popover-arrow" data-popper-arrow></div>\n\n<h3 ng-if="$.title" class="popover-header">\n    <ng-template ng-ref="simpleTitle">{{ $.title }}</ng-template>\n    <ng-container\n        ng-template-outlet="$.isTitleTemplate() ? $.title : simpleTitle"\n        ng-template-outlet-context="$.context"\n    ></ng-container>\n</h3>\n\n<div class="popover-body"><ng-content></ng-content></div>',
    "bindings": {
      "animation": "<?",
      "title": "<?ngTitle",
      "id": "<?ngId",
      "popoverClass": "<?",
      "context": "<?",
      "onMouseEnter": "<?",
      "onMouseLeave": "<?"
    },
    "transclude": true
  }
};
NgbPopoverWindow.ɵfac.ɵcomponent = true;
NgbPopoverWindow.ɵfac.ɵtype = NgbPopoverWindow;
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
var nextId = 0;
var NgbPopover = class {
  /**
  * Opens the popover.
  *
  * This is considered to be a "manual" triggering.
  * The `context` is an optional value to be injected into the popover template when it is created.
  */
  open(context) {
    return _async_to_generator(function* () {
      if (!this._windowRef && !this._isDisabled()) {
        const templateContext = context ?? this.popoverContext;
        const { windowRef, transition$ } = yield this._popupService.open(this.ngbPopover, templateContext, this.animation);
        this._windowRef = windowRef;
        this._windowRef.setInput("animation", this.animation);
        this._windowRef.setInput("title", this.popoverTitle);
        this._windowRef.setInput("context", templateContext);
        this._windowRef.setInput("popoverClass", this.popoverClass);
        this._windowRef.setInput("id", this._ngbPopoverWindowId);
        this._windowRef.setInput("onMouseEnter", () => this._mouseEnterPopover.next());
        this._windowRef.setInput("onMouseLeave", () => this._mouseLeavePopover.next());
        this._getPositionTargetElement().setAttribute("aria-describedby", this._ngbPopoverWindowId);
        if (this.container === "body") {
          this._document.body.appendChild(this._windowRef.location.nativeElement);
        }
        this._windowRef.changeDetectorRef.detectChanges();
        this._windowRef.changeDetectorRef.markForCheck();
        this._ngZone.runOutsideAngular(() => {
          this._positioning.createPopper({
            hostElement: this._getPositionTargetElement(),
            targetElement: this._windowRef.location.nativeElement,
            placement: this.placement,
            appendToBody: this.container === "body",
            baseClass: "bs-popover",
            updatePopperOptions: (options) => this.popperOptions(addPopperOffset([
              0,
              8
            ])(options))
          });
          Promise.resolve().then(() => {
            this._positioning.update();
            this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
          });
        });
        ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [
          this._windowRef.location.nativeElement
        ]);
        transition$.subscribe(() => {
          this.shown.emit();
        });
      }
    }).call(this);
  }
  /**
  * Closes the popover.
  *
  * This is considered to be a "manual" triggering of the popover.
  */
  close(animation = this.animation) {
    if (this._windowRef != null) {
      this._getPositionTargetElement().removeAttribute("aria-describedby");
      this._popupService.close(animation).subscribe(() => {
        this._windowRef = null;
        this._positioning.destroy();
        this._zoneSubscription?.unsubscribe();
        this.hidden.emit();
        this._changeDetector.markForCheck();
      });
    }
  }
  /**
  * Toggles the popover.
  *
  * This is considered to be a "manual" triggering of the popover.
  */
  toggle() {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
  * Returns `true`, if the popover is currently shown.
  */
  isOpen() {
    return this._windowRef != null;
  }
  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(this._nativeElement, this.triggers, this.isOpen.bind(this), this.open.bind(this), this.close.bind(this), +this.openDelay, +this.closeDelay, this._mouseEnterPopover, this._mouseLeavePopover);
  }
  ngOnChanges({ ngbPopover, popoverTitle, disablePopover, popoverClass }) {
    if (popoverClass && this.isOpen()) {
      this._windowRef.setInput("popoverClass", popoverClass.currentValue);
    }
    if ((ngbPopover || popoverTitle || disablePopover) && this._isDisabled()) {
      this.close();
    }
  }
  ngOnDestroy() {
    this.close(false);
    this._unregisterListenersFn?.();
  }
  _isDisabled() {
    return this.disablePopover ? true : !this.ngbPopover && !this.popoverTitle;
  }
  _getPositionTargetElement() {
    return (isString(this.positionTarget) ? this._document.querySelector(this.positionTarget) : this.positionTarget) || this._nativeElement;
  }
  constructor() {
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopover"] ? globalThis.ɵngjsInjected["NgbPopover"][0] : inject(NgbPopoverConfig);
    this.animation = this._config.animation;
    this.autoClose = this._config.autoClose;
    this.placement = this._config.placement;
    this.popperOptions = this._config.popperOptions;
    this.triggers = this._config.triggers;
    this.container = this._config.container;
    this.disablePopover = this._config.disablePopover;
    this.popoverClass = this._config.popoverClass;
    this.openDelay = this._config.openDelay;
    this.closeDelay = this._config.closeDelay;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopover"] ? globalThis.ɵngjsInjected["NgbPopover"][1] : inject(ElementRef)).nativeElement;
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopover"] ? globalThis.ɵngjsInjected["NgbPopover"][2] : inject(NgZone);
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopover"] ? globalThis.ɵngjsInjected["NgbPopover"][3] : inject(DOCUMENT);
    this._changeDetector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbPopover"] ? globalThis.ɵngjsInjected["NgbPopover"][4] : inject(ChangeDetectorRef);
    this._ngbPopoverWindowId = `ngb-popover-${nextId++}`;
    this._popupService = new PopupService(NgbPopoverWindow);
    this._windowRef = null;
    this._positioning = ngbPositioning();
    this._mouseEnterPopover = new Subject();
    this._mouseLeavePopover = new Subject();
  }
};
NgbPopover.ɵfac = [
  "NgbPopoverConfig_39c292c6",
  "ElementRef_927308a2",
  "NgZone_31031859",
  "DOCUMENT_a3a362b8",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbPopover_Factory(i0, i1, i2, i3, i4, $element, $scope) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = Object.assign({}, ɵprevious, {
      "NgbPopover": [
        i0,
        i1,
        i2,
        i3,
        i4
      ]
    });
    try {
      var instance = new (this && this.ɵT || NgbPopover)();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbPopover.ɵdir = {
  selectors: [
    [
      "",
      "ngbPopover",
      ""
    ]
  ],
  inputs: {
    "animation": "animation",
    "autoClose": "autoClose",
    "ngbPopover": "ngbPopover",
    "popoverTitle": "popoverTitle",
    "placement": "placement",
    "popperOptions": "popperOptions",
    "triggers": "triggers",
    "positionTarget": "positionTarget",
    "container": "container",
    "disablePopover": "disablePopover",
    "popoverClass": "popoverClass",
    "popoverContext": "popoverContext",
    "openDelay": "openDelay",
    "closeDelay": "closeDelay"
  },
  outputs: {
    "shown": "shown",
    "hidden": "hidden"
  },
  exportAs: [
    "ngbPopover"
  ],
  definition: {
    "bindings": {
      "animation": "<?",
      "autoClose": "<?",
      "ngbPopover": "<?",
      "popoverTitle": "<?",
      "placement": "<?",
      "popperOptions": "<?",
      "triggers": "<?",
      "positionTarget": "<?",
      "container": "<?",
      "disablePopover": "<?",
      "popoverClass": "@?",
      "popoverContext": "<?",
      "openDelay": "<?",
      "closeDelay": "<?",
      "shown": "&?",
      "hidden": "&?"
    }
  }
};
NgbPopover.ɵfac.ɵtype = NgbPopover;
NgbPopover.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbPopover.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
NgbPopover.prototype.$onChanges = function(changesObj) {
  var changes = {};
  (function() {
    var c = changesObj["animation"];
    if (!c) return;
    changes["animation"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["autoClose"];
    if (!c) return;
    changes["autoClose"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["ngbPopover"];
    if (!c) return;
    changes["ngbPopover"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popoverTitle"];
    if (!c) return;
    changes["popoverTitle"] = {
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
    var c = changesObj["triggers"];
    if (!c) return;
    changes["triggers"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["positionTarget"];
    if (!c) return;
    changes["positionTarget"] = {
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
    var c = changesObj["disablePopover"];
    if (!c) return;
    changes["disablePopover"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popoverClass"];
    if (!c) return;
    changes["popoverClass"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["popoverContext"];
    if (!c) return;
    changes["popoverContext"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["openDelay"];
    if (!c) return;
    changes["openDelay"] = {
      previousValue: c.previousValue,
      currentValue: c.currentValue,
      firstChange: c.isFirstChange(),
      isFirstChange: function() {
        return c.isFirstChange();
      }
    };
  })();
  (function() {
    var c = changesObj["closeDelay"];
    if (!c) return;
    changes["closeDelay"] = {
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
var NgbPopoverModule = class {
};
NgbPopoverModule.ɵfac = [
  function NgbPopoverModule_Factory() {
    return new (this && this.ɵT || NgbPopoverModule)();
  }
];
NgbPopoverModule.ɵmod = {
  id: "NgbPopoverModule_9a2a51af",
  controllerAs: "$"
};
import_angular.default.module("NgbPopoverModule_9a2a51af", [
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
  ɵlazyController
]).component("ngbPopoverWindow", {
  controller: NgbPopoverWindow.ɵfac,
  template: '<div class="popover-arrow" data-popper-arrow></div>\n\n<h3 ng-if="$.title" class="popover-header">\n    <ng-template ng-ref="simpleTitle">{{ $.title }}</ng-template>\n    <ng-container\n        ng-template-outlet="$.isTitleTemplate() ? $.title : simpleTitle"\n        ng-template-outlet-context="$.context"\n    ></ng-container>\n</h3>\n\n<div class="popover-body"><ng-content></ng-content></div>',
  controllerAs: "$",
  transclude: true,
  bindings: {
    "animation": "<?",
    "title": "<?ngTitle",
    "id": "<?ngId",
    "popoverClass": "<?",
    "context": "<?",
    "onMouseEnter": "<?",
    "onMouseLeave": "<?"
  }
}).directive("ngbPopover", function() {
  return {
    controller: NgbPopover.ɵfac,
    restrict: "A",
    bindToController: {
      "animation": "<?",
      "autoClose": "<?",
      "ngbPopover": "<?",
      "popoverTitle": "<?",
      "placement": "<?",
      "popperOptions": "<?",
      "triggers": "<?",
      "positionTarget": "<?",
      "container": "<?",
      "disablePopover": "<?",
      "popoverClass": "@?",
      "popoverContext": "<?",
      "openDelay": "<?",
      "closeDelay": "<?",
      "shown": "&?",
      "hidden": "&?"
    },
    controllerAs: "ngbPopover"
  };
}).directive("ngbPopover", function() {
  return {
    restrict: "A",
    link: {
      pre: function(scope, element) {
        [
          "shown",
          "hidden"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).factory("NgbPopoverModule_ccba0884", NgbPopoverModule.ɵfac).run([
  "NgbPopoverModule_ccba0884",
  function() {
  }
]);

// src/app/features/popover/popover.routes.ts
var routes = [
  {
    path: "",
    data: {
      title: "Popover",
      tabs: [
        {
          name: "Examples",
          to: "/components/popover/examples"
        },
        {
          name: "Api",
          to: "/components/popover/api"
        }
      ],
      externalLinks: {
        bootstrap: "components/popovers/",
        ngBootstrap: "components/popover/overview"
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
              id: "popover-placements",
              name: "Quick popovers"
            },
            {
              id: "popover-template",
              name: "HTML and bindings"
            },
            {
              id: "popover-triggers",
              name: "Custom triggers"
            },
            {
              id: "popover-manual-control",
              name: "External controls"
            },
            {
              id: "popover-autoclose",
              name: "Automatic closing"
            },
            {
              id: "popover-context",
              name: "Template context"
            },
            {
              id: "popover-custom-target",
              name: "Custom target"
            },
            {
              id: "popover-delays",
              name: "Open and close delays"
            },
            {
              id: "popover-events",
              name: "Visibility events"
            },
            {
              id: "popover-body",
              name: "Body container"
            },
            {
              id: "popover-custom-class",
              name: "Custom class"
            },
            {
              id: "popover-global",
              name: "Global configuration"
            }
          ]
        },
        loadComponent: () => import("./popover-examples-page.component-OW6TOBZM.js").then((m) => m.PopoverExamplesPageComponent)
      },
      {
        path: "api",
        data: {
          sections: [
            {
              id: "ngb-popover",
              name: "NgbPopover"
            },
            {
              id: "ngb-popover-config",
              name: "NgbPopoverConfig"
            }
          ]
        },
        loadComponent: () => import("./popover-api-page.component-TGSCLFYT.js").then((m) => m.PopoverApiPageComponent)
      }
    ]
  }
];

// src/app/features/popover/components/popover-autoclose/popover-autoclose.component.ts
var PopoverAutocloseComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-acd61655],.card[_content-acd61655],.dropdown-menu[_content-acd61655],.list-group-item[_content-acd61655],.form-control[_content-acd61655],.form-select[_content-acd61655]{border-color:var(--bs-border-color)}.alert-light[_content-acd61655]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-acd61655],.list-group[_content-acd61655],.dropdown-menu[_content-acd61655]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-acd61655],.btn-outline-secondary[_content-acd61655]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-acd61655],.form-select[_content-acd61655]{background-color:var(--bs-body-bg)}code[_content-acd61655]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverAutocloseComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverAutocloseComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverAutocloseComponent)();
    return instance;
  }
];
PopoverAutocloseComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-autoclose"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-autoclose.component-c40fbebe.html",
    "controllerAs": "example"
  }
};
PopoverAutocloseComponent.ɵfac.ɵcomponent = true;
PopoverAutocloseComponent.ɵfac.ɵtype = PopoverAutocloseComponent;

// src/app/features/popover/components/popover-body/popover-body.component.ts
var PopoverBodyComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-1e1275c4],.card[_content-1e1275c4],.dropdown-menu[_content-1e1275c4],.list-group-item[_content-1e1275c4],.form-control[_content-1e1275c4],.form-select[_content-1e1275c4]{border-color:var(--bs-border-color)}.alert-light[_content-1e1275c4]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-1e1275c4],.list-group[_content-1e1275c4],.dropdown-menu[_content-1e1275c4]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-1e1275c4],.btn-outline-secondary[_content-1e1275c4]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-1e1275c4],.form-select[_content-1e1275c4]{background-color:var(--bs-body-bg)}code[_content-1e1275c4]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverBodyComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverBodyComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverBodyComponent)();
    return instance;
  }
];
PopoverBodyComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-body"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-body.component-de1dc788.html",
    "controllerAs": "example"
  }
};
PopoverBodyComponent.ɵfac.ɵcomponent = true;
PopoverBodyComponent.ɵfac.ɵtype = PopoverBodyComponent;

// src/app/features/popover/components/popover-context/popover-context.component.ts
var PopoverContextComponent = class {
  toggleWithGreeting(popover, greeting, language) {
    popover.isOpen() ? popover.close() : popover.open({
      greeting,
      language
    });
  }
  constructor() {
    this.name = "World";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-eedd347d],.card[_content-eedd347d],.dropdown-menu[_content-eedd347d],.list-group-item[_content-eedd347d],.form-control[_content-eedd347d],.form-select[_content-eedd347d]{border-color:var(--bs-border-color)}.alert-light[_content-eedd347d]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-eedd347d],.list-group[_content-eedd347d],.dropdown-menu[_content-eedd347d]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-eedd347d],.btn-outline-secondary[_content-eedd347d]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-eedd347d],.form-select[_content-eedd347d]{background-color:var(--bs-body-bg)}code[_content-eedd347d]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverContextComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverContextComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverContextComponent)();
    return instance;
  }
];
PopoverContextComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-context"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-context.component-196fb837.html",
    "controllerAs": "example"
  }
};
PopoverContextComponent.ɵfac.ɵcomponent = true;
PopoverContextComponent.ɵfac.ɵtype = PopoverContextComponent;

// src/app/features/popover/components/popover-custom-class/popover-custom-class.component.ts
var PopoverCustomClassComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".popover-custom[_content-cde1f398]{--bs-popover-border-color: var(--bs-primary-border-subtle);--bs-popover-header-bg: var(--bs-primary-bg-subtle);--bs-popover-header-color: var(--bs-primary-text-emphasis);box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.12)}";
  document.head.appendChild(s);
})();
PopoverCustomClassComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverCustomClassComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverCustomClassComponent)();
    return instance;
  }
];
PopoverCustomClassComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-custom-class"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-custom-class.component-d67eddf2.html",
    "controllerAs": "example"
  }
};
PopoverCustomClassComponent.ɵfac.ɵcomponent = true;
PopoverCustomClassComponent.ɵfac.ɵtype = PopoverCustomClassComponent;

// src/app/features/popover/components/popover-custom-target/popover-custom-target.component.ts
var PopoverCustomTargetComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-cfcbc3f7],.card[_content-cfcbc3f7],.dropdown-menu[_content-cfcbc3f7],.list-group-item[_content-cfcbc3f7],.form-control[_content-cfcbc3f7],.form-select[_content-cfcbc3f7]{border-color:var(--bs-border-color)}.alert-light[_content-cfcbc3f7]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-cfcbc3f7],.list-group[_content-cfcbc3f7],.dropdown-menu[_content-cfcbc3f7]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-cfcbc3f7],.btn-outline-secondary[_content-cfcbc3f7]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-cfcbc3f7],.form-select[_content-cfcbc3f7]{background-color:var(--bs-body-bg)}code[_content-cfcbc3f7]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverCustomTargetComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverCustomTargetComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverCustomTargetComponent)();
    return instance;
  }
];
PopoverCustomTargetComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-custom-target"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-custom-target.component-06308280.html",
    "controllerAs": "example"
  }
};
PopoverCustomTargetComponent.ɵfac.ɵcomponent = true;
PopoverCustomTargetComponent.ɵfac.ɵtype = PopoverCustomTargetComponent;

// src/app/features/popover/components/popover-delays/popover-delays.component.ts
var PopoverDelaysComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-a35db811],.card[_content-a35db811],.dropdown-menu[_content-a35db811],.list-group-item[_content-a35db811],.form-control[_content-a35db811],.form-select[_content-a35db811]{border-color:var(--bs-border-color)}.alert-light[_content-a35db811]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-a35db811],.list-group[_content-a35db811],.dropdown-menu[_content-a35db811]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-a35db811],.btn-outline-secondary[_content-a35db811]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-a35db811],.form-select[_content-a35db811]{background-color:var(--bs-body-bg)}code[_content-a35db811]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverDelaysComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverDelaysComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverDelaysComponent)();
    return instance;
  }
];
PopoverDelaysComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-delays"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-delays.component-d2235543.html",
    "controllerAs": "example"
  }
};
PopoverDelaysComponent.ɵfac.ɵcomponent = true;
PopoverDelaysComponent.ɵfac.ɵtype = PopoverDelaysComponent;

// src/app/features/popover/components/popover-events/popover-events.component.ts
var PopoverEventsComponent = class {
  record(name) {
    this.events.unshift({
      name,
      time: /* @__PURE__ */ new Date()
    });
  }
  constructor() {
    this.events = [];
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-67eedc1c],.card[_content-67eedc1c],.dropdown-menu[_content-67eedc1c],.list-group-item[_content-67eedc1c],.form-control[_content-67eedc1c],.form-select[_content-67eedc1c]{border-color:var(--bs-border-color)}.alert-light[_content-67eedc1c]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-67eedc1c],.list-group[_content-67eedc1c],.dropdown-menu[_content-67eedc1c]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-67eedc1c],.btn-outline-secondary[_content-67eedc1c]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-67eedc1c],.form-select[_content-67eedc1c]{background-color:var(--bs-body-bg)}code[_content-67eedc1c]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverEventsComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverEventsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverEventsComponent)();
    return instance;
  }
];
PopoverEventsComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-events"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-events.component-274a2ad4.html",
    "controllerAs": "example"
  }
};
PopoverEventsComponent.ɵfac.ɵcomponent = true;
PopoverEventsComponent.ɵfac.ɵtype = PopoverEventsComponent;

// src/app/features/popover/components/popover-global/popover-global.component.ts
var PopoverGlobalComponent = class {
  constructor(config) {
    this.config = config;
    this.initialConfig = {
      container: config.container,
      openDelay: config.openDelay,
      placement: config.placement,
      triggers: config.triggers
    };
    config.container = "body";
    config.openDelay = 300;
    config.placement = "end";
    config.triggers = "mouseenter:mouseleave";
  }
  ngAfterViewInit() {
    this.restoreConfig();
  }
  ngOnDestroy() {
    this.restoreConfig();
  }
  restoreConfig() {
    this.config.container = this.initialConfig.container;
    this.config.openDelay = this.initialConfig.openDelay;
    this.config.placement = this.initialConfig.placement;
    this.config.triggers = this.initialConfig.triggers;
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-d8d827b5],.card[_content-d8d827b5],.dropdown-menu[_content-d8d827b5],.list-group-item[_content-d8d827b5],.form-control[_content-d8d827b5],.form-select[_content-d8d827b5]{border-color:var(--bs-border-color)}.alert-light[_content-d8d827b5]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-d8d827b5],.list-group[_content-d8d827b5],.dropdown-menu[_content-d8d827b5]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-d8d827b5],.btn-outline-secondary[_content-d8d827b5]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-d8d827b5],.form-select[_content-d8d827b5]{background-color:var(--bs-body-bg)}code[_content-d8d827b5]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverGlobalComponent.ɵfac = [
  "NgbPopoverConfig_39c292c6",
  "$element",
  "$scope",
  function PopoverGlobalComponent_Factory(a0, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverGlobalComponent)(a0);
    return instance;
  }
];
PopoverGlobalComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-global"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-global.component-fb61418c.html",
    "controllerAs": "example"
  }
};
PopoverGlobalComponent.ɵfac.ɵcomponent = true;
PopoverGlobalComponent.ɵfac.ɵtype = PopoverGlobalComponent;
PopoverGlobalComponent.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
PopoverGlobalComponent.prototype.$postLink = function() {
  this.ngAfterViewInit();
};

// src/app/features/popover/components/popover-manual-control/popover-manual-control.component.ts
var PopoverManualControlComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-aee305c7],.card[_content-aee305c7],.dropdown-menu[_content-aee305c7],.list-group-item[_content-aee305c7],.form-control[_content-aee305c7],.form-select[_content-aee305c7]{border-color:var(--bs-border-color)}.alert-light[_content-aee305c7]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-aee305c7],.list-group[_content-aee305c7],.dropdown-menu[_content-aee305c7]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-aee305c7],.btn-outline-secondary[_content-aee305c7]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-aee305c7],.form-select[_content-aee305c7]{background-color:var(--bs-body-bg)}code[_content-aee305c7]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverManualControlComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverManualControlComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverManualControlComponent)();
    return instance;
  }
];
PopoverManualControlComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-manual-control"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-manual-control.component-1cad49b2.html",
    "controllerAs": "example"
  }
};
PopoverManualControlComponent.ɵfac.ɵcomponent = true;
PopoverManualControlComponent.ɵfac.ɵtype = PopoverManualControlComponent;

// src/app/features/popover/components/popover-placements/popover-placements.component.ts
var PopoverPlacementsComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-a6c99627],.card[_content-a6c99627],.dropdown-menu[_content-a6c99627],.list-group-item[_content-a6c99627],.form-control[_content-a6c99627],.form-select[_content-a6c99627]{border-color:var(--bs-border-color)}.alert-light[_content-a6c99627]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-a6c99627],.list-group[_content-a6c99627],.dropdown-menu[_content-a6c99627]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-a6c99627],.btn-outline-secondary[_content-a6c99627]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-a6c99627],.form-select[_content-a6c99627]{background-color:var(--bs-body-bg)}code[_content-a6c99627]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverPlacementsComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverPlacementsComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverPlacementsComponent)();
    return instance;
  }
];
PopoverPlacementsComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-placements"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-placements.component-2bee48bb.html",
    "controllerAs": "example"
  }
};
PopoverPlacementsComponent.ɵfac.ɵcomponent = true;
PopoverPlacementsComponent.ɵfac.ɵtype = PopoverPlacementsComponent;

// src/app/features/popover/components/popover-template/popover-template.component.ts
var PopoverTemplateComponent = class {
  constructor() {
    this.name = "NgbJS";
  }
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-bdf9a36a],.card[_content-bdf9a36a],.dropdown-menu[_content-bdf9a36a],.list-group-item[_content-bdf9a36a],.form-control[_content-bdf9a36a],.form-select[_content-bdf9a36a]{border-color:var(--bs-border-color)}.alert-light[_content-bdf9a36a]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-bdf9a36a],.list-group[_content-bdf9a36a],.dropdown-menu[_content-bdf9a36a]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-bdf9a36a],.btn-outline-secondary[_content-bdf9a36a]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-bdf9a36a],.form-select[_content-bdf9a36a]{background-color:var(--bs-body-bg)}code[_content-bdf9a36a]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverTemplateComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverTemplateComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverTemplateComponent)();
    return instance;
  }
];
PopoverTemplateComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-template"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-template.component-dc72a210.html",
    "controllerAs": "example"
  }
};
PopoverTemplateComponent.ɵfac.ɵcomponent = true;
PopoverTemplateComponent.ɵfac.ɵtype = PopoverTemplateComponent;

// src/app/features/popover/components/popover-triggers/popover-triggers.component.ts
var PopoverTriggersComponent = class {
};
(function() {
  var s = document.createElement("style");
  s.textContent = ".alert[_content-e758b8c0],.card[_content-e758b8c0],.dropdown-menu[_content-e758b8c0],.list-group-item[_content-e758b8c0],.form-control[_content-e758b8c0],.form-select[_content-e758b8c0]{border-color:var(--bs-border-color)}.alert-light[_content-e758b8c0]{color:var(--bs-body-color);background:color-mix(in srgb,var(--bs-tertiary-bg) 86%,var(--bs-body-bg))}.card[_content-e758b8c0],.list-group[_content-e758b8c0],.dropdown-menu[_content-e758b8c0]{box-shadow:0 .75rem 2rem rgba(var(--bs-body-color-rgb),.05)}.btn-outline-primary[_content-e758b8c0],.btn-outline-secondary[_content-e758b8c0]{--bs-btn-border-color: color-mix(in srgb, var(--bs-border-color) 85%, currentColor)}.form-control[_content-e758b8c0],.form-select[_content-e758b8c0]{background-color:var(--bs-body-bg)}code[_content-e758b8c0]{color:var(--ngbjs-code-color)}";
  document.head.appendChild(s);
})();
PopoverTriggersComponent.ɵfac = [
  "$element",
  "$scope",
  function PopoverTriggersComponent_Factory($element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var instance = new (this && this.ɵT || PopoverTriggersComponent)();
    return instance;
  }
];
PopoverTriggersComponent.ɵcmp = {
  selectors: [
    [
      "docs-popover-triggers"
    ]
  ],
  inputs: {},
  outputs: {},
  definition: {
    "templateUrl": "templates/popover-triggers.component-d37199ad.html",
    "controllerAs": "example"
  }
};
PopoverTriggersComponent.ɵfac.ɵcomponent = true;
PopoverTriggersComponent.ɵfac.ɵtype = PopoverTriggersComponent;

// src/app/features/popover/popover.module.ts
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
var PopoverModule = class {
};
PopoverModule.ɵfac = [
  function PopoverModule_Factory() {
    return new (this && this.ɵT || PopoverModule)();
  }
];
var ɵPopoverModule_import0 = RouterModule.forChild(routes);
PopoverModule.ɵmod = {
  id: "PopoverModule_3aa17801"
};
ɵimportProviders(import_angular2.default.module("PopoverModule_3aa17801", [
  typeof NgbCollapseModule === "string" ? NgbCollapseModule : NgbCollapseModule.ɵmod ? NgbCollapseModule.ɵmod.id : NgbCollapseModule.name,
  typeof NgbNavModule === "string" ? NgbNavModule : NgbNavModule.ɵmod ? NgbNavModule.ɵmod.id : NgbNavModule.name,
  typeof NgbScrollSpyModule === "string" ? NgbScrollSpyModule : NgbScrollSpyModule.ɵmod ? NgbScrollSpyModule.ɵmod.id : NgbScrollSpyModule.name,
  typeof NgbPopoverModule === "string" ? NgbPopoverModule : NgbPopoverModule.ɵmod ? NgbPopoverModule.ɵmod.id : NgbPopoverModule.name,
  ɵimportedModuleName(ɵPopoverModule_import0)
]), [
  ɵPopoverModule_import0
]).component("docsPopoverAutoclose", {
  controller: PopoverAutocloseComponent.ɵfac,
  templateUrl: "templates/popover-autoclose.component-c40fbebe.html",
  controllerAs: "example"
}).component("docsPopoverBody", {
  controller: PopoverBodyComponent.ɵfac,
  templateUrl: "templates/popover-body.component-de1dc788.html",
  controllerAs: "example"
}).component("docsPopoverContext", {
  controller: PopoverContextComponent.ɵfac,
  templateUrl: "templates/popover-context.component-196fb837.html",
  controllerAs: "example"
}).component("docsPopoverCustomClass", {
  controller: PopoverCustomClassComponent.ɵfac,
  templateUrl: "templates/popover-custom-class.component-d67eddf2.html",
  controllerAs: "example"
}).component("docsPopoverCustomTarget", {
  controller: PopoverCustomTargetComponent.ɵfac,
  templateUrl: "templates/popover-custom-target.component-06308280.html",
  controllerAs: "example"
}).component("docsPopoverDelays", {
  controller: PopoverDelaysComponent.ɵfac,
  templateUrl: "templates/popover-delays.component-d2235543.html",
  controllerAs: "example"
}).component("docsPopoverEvents", {
  controller: PopoverEventsComponent.ɵfac,
  templateUrl: "templates/popover-events.component-274a2ad4.html",
  controllerAs: "example"
}).component("docsPopoverGlobal", {
  controller: PopoverGlobalComponent.ɵfac,
  templateUrl: "templates/popover-global.component-fb61418c.html",
  controllerAs: "example"
}).component("docsPopoverManualControl", {
  controller: PopoverManualControlComponent.ɵfac,
  templateUrl: "templates/popover-manual-control.component-1cad49b2.html",
  controllerAs: "example"
}).component("docsPopoverPlacements", {
  controller: PopoverPlacementsComponent.ɵfac,
  templateUrl: "templates/popover-placements.component-2bee48bb.html",
  controllerAs: "example"
}).component("docsPopoverTemplate", {
  controller: PopoverTemplateComponent.ɵfac,
  templateUrl: "templates/popover-template.component-dc72a210.html",
  controllerAs: "example"
}).component("docsPopoverTriggers", {
  controller: PopoverTriggersComponent.ɵfac,
  templateUrl: "templates/popover-triggers.component-d37199ad.html",
  controllerAs: "example"
}).factory("PopoverModule_3f1d3b2a", PopoverModule.ɵfac).run([
  "PopoverModule_3f1d3b2a",
  function() {
  }
]);
export {
  PopoverModule
};
