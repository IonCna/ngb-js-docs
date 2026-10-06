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
  BehaviorSubject,
  BootstrapListeners,
  CommonModule,
  CompiledType,
  ComponentRegistrar,
  ConfigProviderFactory,
  HashLocationStrategy,
  InjectorImpl,
  LateControllerDecorators,
  LocationStrategy,
  PathLocationStrategy,
  PlatformLocation,
  Subject,
  ViewportScroller,
  from,
  injectionTokenName,
  isObservable,
  map,
  require_angular,
  resolveForwardRef,
  runInInjectionContext
} from "./chunk-PFCKLQSI.js";
import {
  __toESM
} from "./chunk-57M53B5Q.js";

// ../ngjs-core/dist/chunk-YRI23NGR.js
var RuntimeProviders = class _RuntimeProviders {
  static register($provide, providers) {
    const flat = providers.flat(Number.POSITIVE_INFINITY);
    const multi = /* @__PURE__ */ new Map();
    for (const raw of flat) {
      const provider = typeof raw === "function" ? {
        provide: raw
      } : raw;
      const name = _RuntimeProviders.nameOf(provider.provide);
      if (provider.multi) multi.set(name, [
        ...multi.get(name) ?? [],
        provider
      ]);
      else $provide.factory(name, _RuntimeProviders.factoryOf(provider, typeof raw === "function"));
    }
    for (const [name, group] of multi) {
      const factories = group.map((provider) => _RuntimeProviders.factoryOf(provider, false));
      $provide.factory(name, [
        "$injector",
        ($injector2) => factories.map((factory) => $injector2.invoke(factory))
      ]);
    }
  }
  static nameOf(token) {
    return injectionTokenName(resolveForwardRef(token));
  }
  static factoryOf(provider, bare) {
    const deps = (provider.deps ?? []).map((dep) => _RuntimeProviders.nameOf(dep));
    if ("useValue" in provider) return [
      () => provider.useValue
    ];
    if (provider.useFactory) return [
      ...deps,
      provider.useFactory
    ];
    if (provider.useExisting) return [
      _RuntimeProviders.nameOf(provider.useExisting),
      (existing) => existing
    ];
    const type = resolveForwardRef(provider.useClass ?? provider.provide);
    if (typeof type !== "function") throw new Error("provider sin receta y sin clase en `provide`.");
    if (provider.deps) return [
      ...deps,
      (...args) => Reflect.construct(type, args)
    ];
    if (bare && Object.hasOwn(type, "ɵprov") && type.ɵprov?.factory) return type.ɵprov.factory;
    if (Object.hasOwn(type, "ɵfac")) return type.ɵfac;
    if (type.ɵfac) throw new Error(`"${type.name}" hereda el factory de su clase padre — agregale @Injectable().`);
    return [
      () => Reflect.construct(type, [])
    ];
  }
};

// ../ngjs-core/dist/chunk-PZ7HWOOZ.js
var Title = class {
};
var TitleImpl = class extends Title {
  constructor(doc) {
    super(), this.doc = doc;
  }
  getTitle() {
    return this.doc.title;
  }
  setTitle(value) {
    this.doc.title = value ?? "";
  }
};
Title.ɵfac = [
  function Title_Factory() {
    return new (this && this.ɵT || Title)();
  }
];
Title.ɵprov = {
  token: "Title_7d1c46f9"
};
TitleImpl.ɵfac = [
  "DOCUMENT_a3a362b8",
  function TitleImpl_Factory(a0) {
    return new (this && this.ɵT || TitleImpl)(a0);
  }
];
TitleImpl.ɵprov = {
  token: "TitleImpl_ba07f070"
};

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/angular.js
var ng_from_import = __toESM(require_angular());
var ng_from_global = angular;
var ng = ng_from_import && ng_from_import.module ? ng_from_import : ng_from_global;

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/hof.js
var __spreadArray = function(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from2.length, ar; i < l; i++) {
    if (ar || !(i in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
      ar[i] = from2[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
};
function curry(fn) {
  return function curried() {
    if (arguments.length >= fn.length) {
      return fn.apply(this, arguments);
    }
    var args = Array.prototype.slice.call(arguments);
    return curried.bind.apply(curried, __spreadArray([this], args, false));
  };
}
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start, result = args[start].apply(this, arguments);
    while (i--)
      result = args[i].call(this, result);
    return result;
  };
}
function pipe() {
  var funcs = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    funcs[_i] = arguments[_i];
  }
  return compose.apply(null, [].slice.call(arguments).reverse());
}
var prop = function(name) {
  return function(obj) {
    return obj && obj[name];
  };
};
var propEq = curry(function(name, _val, obj) {
  return obj && obj[name] === _val;
});
var parse = function(name) {
  return pipe.apply(null, name.split(".").map(prop));
};
var not = function(fn) {
  return function() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return !fn.apply(null, args);
  };
};
function and(fn1, fn2) {
  return function() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return fn1.apply(null, args) && fn2.apply(null, args);
  };
}
function or(fn1, fn2) {
  return function() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return fn1.apply(null, args) || fn2.apply(null, args);
  };
}
var all = function(fn1) {
  return function(arr) {
    return arr.reduce(function(b, x) {
      return b && !!fn1(x);
    }, true);
  };
};
var any = function(fn1) {
  return function(arr) {
    return arr.reduce(function(b, x) {
      return b || !!fn1(x);
    }, false);
  };
};
var is = function(ctor) {
  return function(obj) {
    return obj != null && obj.constructor === ctor || obj instanceof ctor;
  };
};
var val = function(v) {
  return function() {
    return v;
  };
};
function pattern(struct) {
  return function(x) {
    for (var i = 0; i < struct.length; i++) {
      if (struct[i][0](x))
        return struct[i][1](x);
    }
  };
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/predicates.js
var toStr = Object.prototype.toString;
var tis = function(t) {
  return function(x) {
    return typeof x === t;
  };
};
var isUndefined = tis("undefined");
var isDefined = not(isUndefined);
var isNull = function(o) {
  return o === null;
};
var isNullOrUndefined = or(isNull, isUndefined);
var isFunction = tis("function");
var isNumber = tis("number");
var isString = tis("string");
var isObject = function(x) {
  return x !== null && typeof x === "object";
};
var isArray = Array.isArray;
var isDate = (function(x) {
  return toStr.call(x) === "[object Date]";
});
var isRegExp = (function(x) {
  return toStr.call(x) === "[object RegExp]";
});
function isInjectable(val2) {
  if (isArray(val2) && val2.length) {
    var head = val2.slice(0, -1), tail2 = val2.slice(-1);
    return !(head.filter(not(isString)).length || tail2.filter(not(isFunction)).length);
  }
  return isFunction(val2);
}
var isPromise = and(isObject, pipe(prop("then"), isFunction));

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/coreservices.js
var noImpl = function(fnname) {
  return function() {
    throw new Error("No implementation for ".concat(fnname, ". The framework specific code did not implement this method."));
  };
};
var makeStub = function(service, methods) {
  return methods.reduce(function(acc, key) {
    return acc[key] = noImpl("".concat(service, ".").concat(String(key), "()")), acc;
  }, {});
};
var services = {
  $q: void 0,
  $injector: void 0
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/common.js
var __spreadArray2 = function(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from2.length, ar; i < l; i++) {
    if (ar || !(i in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
      ar[i] = from2[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
};
var root = typeof self === "object" && self.self === self && self || typeof global === "object" && global.global === global && global || void 0;
var angular2 = root.angular || {};
var fromJson = angular2.fromJson || JSON.parse.bind(JSON);
var toJson = angular2.toJson || JSON.stringify.bind(JSON);
var forEach = angular2.forEach || _forEach;
var extend = Object.assign || _extend;
var equals = angular2.equals || _equals;
function identity(x) {
  return x;
}
function noop() {
}
function createProxyFunctions(source, target, bind, fnNames, latebind) {
  if (latebind === void 0) {
    latebind = false;
  }
  var bindFunction = function(fnName) {
    return source()[fnName].bind(bind());
  };
  var makeLateRebindFn = function(fnName) {
    return function lateRebindFunction() {
      target[fnName] = bindFunction(fnName);
      return target[fnName].apply(null, arguments);
    };
  };
  fnNames = fnNames || Object.keys(source());
  return fnNames.reduce(function(acc, name) {
    acc[name] = latebind ? makeLateRebindFn(name) : bindFunction(name);
    return acc;
  }, target);
}
var inherit = function(parent, extra) {
  return extend(Object.create(parent), extra);
};
var inArray = curry(_inArray);
function _inArray(array, obj) {
  return array.indexOf(obj) !== -1;
}
var removeFrom = curry(_removeFrom);
function _removeFrom(array, obj) {
  var idx = array.indexOf(obj);
  if (idx >= 0)
    array.splice(idx, 1);
  return array;
}
var pushTo = curry(_pushTo);
function _pushTo(arr, val2) {
  return arr.push(val2), val2;
}
var deregAll = function(functions) {
  return functions.slice().forEach(function(fn) {
    typeof fn === "function" && fn();
    removeFrom(functions, fn);
  });
};
function defaults(opts) {
  var defaultsList = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    defaultsList[_i - 1] = arguments[_i];
  }
  var defaultVals = extend.apply(void 0, __spreadArray2([{}], defaultsList.reverse(), false));
  return extend(defaultVals, pick(opts || {}, Object.keys(defaultVals)));
}
var mergeR = function(memo, item) {
  return extend(memo, item);
};
function ancestors(first, second) {
  var path = [];
  for (var n in first.path) {
    if (first.path[n] !== second.path[n])
      break;
    path.push(first.path[n]);
  }
  return path;
}
function pick(obj, propNames) {
  var objCopy = {};
  for (var _prop in obj) {
    if (propNames.indexOf(_prop) !== -1) {
      objCopy[_prop] = obj[_prop];
    }
  }
  return objCopy;
}
function omit(obj, propNames) {
  return Object.keys(obj).filter(not(inArray(propNames))).reduce(function(acc, key) {
    return acc[key] = obj[key], acc;
  }, {});
}
function filter(collection, callback) {
  var arr = isArray(collection), result = arr ? [] : {};
  var accept = arr ? function(x) {
    return result.push(x);
  } : function(x, key) {
    return result[key] = x;
  };
  forEach(collection, function(item, i) {
    if (callback(item, i))
      accept(item, i);
  });
  return result;
}
function find(collection, callback) {
  var result;
  forEach(collection, function(item, i) {
    if (result)
      return;
    if (callback(item, i))
      result = item;
  });
  return result;
}
var mapObj = map2;
function map2(collection, callback, target) {
  target = target || (isArray(collection) ? [] : {});
  forEach(collection, function(item, i) {
    return target[i] = callback(item, i);
  });
  return target;
}
var values = function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
};
var allTrueR = function(memo, elem) {
  return memo && elem;
};
var anyTrueR = function(memo, elem) {
  return memo || elem;
};
var unnestR = function(memo, elem) {
  return memo.concat(elem);
};
var flattenR = function(memo, elem) {
  return isArray(elem) ? memo.concat(elem.reduce(flattenR, [])) : pushR(memo, elem);
};
function pushR(arr, obj) {
  arr.push(obj);
  return arr;
}
var uniqR = function(acc, token) {
  return inArray(acc, token) ? acc : pushR(acc, token);
};
var unnest = function(arr) {
  return arr.reduce(unnestR, []);
};
var assertPredicate = assertFn;
function assertFn(predicateOrMap, errMsg) {
  if (errMsg === void 0) {
    errMsg = "assert failure";
  }
  return function(obj) {
    var result = predicateOrMap(obj);
    if (!result) {
      throw new Error(isFunction(errMsg) ? errMsg(obj) : errMsg);
    }
    return result;
  };
}
function arrayTuples() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  if (args.length === 0)
    return [];
  var maxArrayLen = args.reduce(function(min, arr) {
    return Math.min(arr.length, min);
  }, 9007199254740991);
  var result = [];
  var _loop_1 = function(i2) {
    switch (args.length) {
      case 1:
        result.push([args[0][i2]]);
        break;
      case 2:
        result.push([args[0][i2], args[1][i2]]);
        break;
      case 3:
        result.push([args[0][i2], args[1][i2], args[2][i2]]);
        break;
      case 4:
        result.push([args[0][i2], args[1][i2], args[2][i2], args[3][i2]]);
        break;
      default:
        result.push(args.map(function(array) {
          return array[i2];
        }));
        break;
    }
  };
  for (var i = 0; i < maxArrayLen; i++) {
    _loop_1(i);
  }
  return result;
}
function applyPairs(memo, keyValTuple) {
  var key, value;
  if (isArray(keyValTuple))
    key = keyValTuple[0], value = keyValTuple[1];
  if (!isString(key))
    throw new Error("invalid parameters to applyPairs");
  memo[key] = value;
  return memo;
}
function tail(arr) {
  return arr.length && arr[arr.length - 1] || void 0;
}
function copy(src, dest) {
  if (dest)
    Object.keys(dest).forEach(function(key) {
      return delete dest[key];
    });
  if (!dest)
    dest = {};
  return extend(dest, src);
}
function _forEach(obj, cb, _this) {
  if (isArray(obj))
    return obj.forEach(cb, _this);
  Object.keys(obj).forEach(function(key) {
    return cb(obj[key], key);
  });
}
function _extend(toObj) {
  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];
    if (!obj)
      continue;
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; j++) {
      toObj[keys[j]] = obj[keys[j]];
    }
  }
  return toObj;
}
function _equals(o1, o2) {
  if (o1 === o2)
    return true;
  if (o1 === null || o2 === null)
    return false;
  if (o1 !== o1 && o2 !== o2)
    return true;
  var t1 = typeof o1, t2 = typeof o2;
  if (t1 !== t2 || t1 !== "object")
    return false;
  var tup = [o1, o2];
  if (all(isArray)(tup))
    return _arraysEq(o1, o2);
  if (all(isDate)(tup))
    return o1.getTime() === o2.getTime();
  if (all(isRegExp)(tup))
    return o1.toString() === o2.toString();
  if (all(isFunction)(tup))
    return true;
  var predicates = [isFunction, isArray, isDate, isRegExp];
  if (predicates.map(any).reduce(function(b, fn) {
    return b || !!fn(tup);
  }, false))
    return false;
  var keys = {};
  for (var key in o1) {
    if (!_equals(o1[key], o2[key]))
      return false;
    keys[key] = true;
  }
  for (var key in o2) {
    if (!keys[key])
      return false;
  }
  return true;
}
function _arraysEq(a1, a2) {
  if (a1.length !== a2.length)
    return false;
  return arrayTuples(a1, a2).reduce(function(b, t) {
    return b && _equals(t[0], t[1]);
  }, true);
}
var silenceUncaughtInPromise = function(promise) {
  return promise.catch(function(e) {
    return 0;
  }) && promise;
};
var silentRejection = function(error) {
  return silenceUncaughtInPromise(services.$q.reject(error));
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/glob.js
var Glob = (
  /** @class */
  (function() {
    function Glob2(text) {
      this.text = text;
      this.glob = text.split(".");
      var regexpString = this.text.split(".").map(function(seg) {
        if (seg === "**")
          return "(?:|(?:\\.[^.]*)*)";
        if (seg === "*")
          return "\\.[^.]*";
        return "\\." + seg;
      }).join("");
      this.regexp = new RegExp("^" + regexpString + "$");
    }
    Glob2.is = function(text) {
      return !!/[!,*]+/.exec(text);
    };
    Glob2.fromString = function(text) {
      return Glob2.is(text) ? new Glob2(text) : null;
    };
    Glob2.prototype.matches = function(name) {
      return this.regexp.test("." + name);
    };
    return Glob2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/queue.js
var Queue = (
  /** @class */
  (function() {
    function Queue2(_items, _limit) {
      if (_items === void 0) {
        _items = [];
      }
      if (_limit === void 0) {
        _limit = null;
      }
      this._items = _items;
      this._limit = _limit;
      this._evictListeners = [];
      this.onEvict = pushTo(this._evictListeners);
    }
    Queue2.prototype.enqueue = function(item) {
      var items = this._items;
      items.push(item);
      if (this._limit && items.length > this._limit)
        this.evict();
      return item;
    };
    Queue2.prototype.evict = function() {
      var item = this._items.shift();
      this._evictListeners.forEach(function(fn) {
        return fn(item);
      });
      return item;
    };
    Queue2.prototype.dequeue = function() {
      if (this.size())
        return this._items.splice(0, 1)[0];
    };
    Queue2.prototype.clear = function() {
      var current = this._items;
      this._items = [];
      return current;
    };
    Queue2.prototype.size = function() {
      return this._items.length;
    };
    Queue2.prototype.remove = function(item) {
      var idx = this._items.indexOf(item);
      return idx > -1 && this._items.splice(idx, 1)[0];
    };
    Queue2.prototype.peekTail = function() {
      return this._items[this._items.length - 1];
    };
    Queue2.prototype.peekHead = function() {
      if (this.size())
        return this._items[0];
    };
    return Queue2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/rejectFactory.js
var RejectType;
(function(RejectType2) {
  RejectType2[RejectType2["SUPERSEDED"] = 2] = "SUPERSEDED";
  RejectType2[RejectType2["ABORTED"] = 3] = "ABORTED";
  RejectType2[RejectType2["INVALID"] = 4] = "INVALID";
  RejectType2[RejectType2["IGNORED"] = 5] = "IGNORED";
  RejectType2[RejectType2["ERROR"] = 6] = "ERROR";
})(RejectType || (RejectType = {}));
var id = 0;
var Rejection = (
  /** @class */
  (function() {
    function Rejection2(type, message, detail) {
      this.$id = id++;
      this.type = type;
      this.message = message;
      this.detail = detail;
    }
    Rejection2.isRejectionPromise = function(obj) {
      return obj && typeof obj.then === "function" && is(Rejection2)(obj._transitionRejection);
    };
    Rejection2.superseded = function(detail, options) {
      var message = "The transition has been superseded by a different transition";
      var rejection = new Rejection2(RejectType.SUPERSEDED, message, detail);
      if (options && options.redirected) {
        rejection.redirected = true;
      }
      return rejection;
    };
    Rejection2.redirected = function(detail) {
      return Rejection2.superseded(detail, { redirected: true });
    };
    Rejection2.invalid = function(detail) {
      var message = "This transition is invalid";
      return new Rejection2(RejectType.INVALID, message, detail);
    };
    Rejection2.ignored = function(detail) {
      var message = "The transition was ignored";
      return new Rejection2(RejectType.IGNORED, message, detail);
    };
    Rejection2.aborted = function(detail) {
      var message = "The transition has been aborted";
      return new Rejection2(RejectType.ABORTED, message, detail);
    };
    Rejection2.errored = function(detail) {
      var message = "The transition errored";
      return new Rejection2(RejectType.ERROR, message, detail);
    };
    Rejection2.normalize = function(detail) {
      return is(Rejection2)(detail) ? detail : Rejection2.errored(detail);
    };
    Rejection2.prototype.toString = function() {
      var detailString = function(d) {
        return d && d.toString !== Object.prototype.toString ? d.toString() : stringify(d);
      };
      var detail = detailString(this.detail);
      var _a = this, $id = _a.$id, type = _a.type, message = _a.message;
      return "Transition Rejection($id: ".concat($id, " type: ").concat(type, ", message: ").concat(message, ", detail: ").concat(detail, ")");
    };
    Rejection2.prototype.toPromise = function() {
      return extend(silentRejection(this), { _transitionRejection: this });
    };
    return Rejection2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/strings.js
function maxLength(max, str) {
  if (str.length <= max)
    return str;
  return str.substr(0, max - 3) + "...";
}
function padString(length, str) {
  while (str.length < length)
    str += " ";
  return str;
}
function kebobString(camelCase) {
  return camelCase.replace(/^([A-Z])/, function($1) {
    return $1.toLowerCase();
  }).replace(/([A-Z])/g, function($1) {
    return "-" + $1.toLowerCase();
  });
}
function functionToString(fn) {
  var fnStr = fnToString(fn);
  var namedFunctionMatch = fnStr.match(/^(function [^ ]+\([^)]*\))/);
  var toStr2 = namedFunctionMatch ? namedFunctionMatch[1] : fnStr;
  var fnName = fn["name"] || "";
  if (fnName && toStr2.match(/function \(/)) {
    return "function " + fnName + toStr2.substr(9);
  }
  return toStr2;
}
function fnToString(fn) {
  var _fn = isArray(fn) ? fn.slice(-1)[0] : fn;
  return _fn && _fn.toString() || "undefined";
}
function stringify(o) {
  var seen = [];
  var isRejection = Rejection.isRejectionPromise;
  var hasToString = function(obj) {
    return isObject(obj) && !isArray(obj) && obj.constructor !== Object && isFunction(obj.toString);
  };
  var stringifyPattern = pattern([
    [isUndefined, val("undefined")],
    [isNull, val("null")],
    [isPromise, val("[Promise]")],
    [isRejection, function(x) {
      return x._transitionRejection.toString();
    }],
    [hasToString, function(x) {
      return x.toString();
    }],
    [isInjectable, functionToString],
    [val(true), identity]
  ]);
  function format(value) {
    if (isObject(value)) {
      if (seen.indexOf(value) !== -1)
        return "[circular ref]";
      seen.push(value);
    }
    return stringifyPattern(value);
  }
  if (isUndefined(o)) {
    return format(o);
  }
  return JSON.stringify(o, function(key, value) {
    return format(value);
  }).replace(/\\"/g, '"');
}
var beforeAfterSubstr = function(char) {
  return function(str) {
    if (!str)
      return ["", ""];
    var idx = str.indexOf(char);
    if (idx === -1)
      return [str, ""];
    return [str.substr(0, idx), str.substr(idx + 1)];
  };
};
var hostRegex = new RegExp("^(?:[a-z]+:)?//[^/]+/");
var stripLastPathElement = function(str) {
  return str.replace(/\/[^/]*$/, "");
};
var splitHash = beforeAfterSubstr("#");
var splitQuery = beforeAfterSubstr("?");
var splitEqual = beforeAfterSubstr("=");
var trimHashVal = function(str) {
  return str ? str.replace(/^#/, "") : "";
};
function splitOnDelim(delim) {
  var re = new RegExp("(" + delim + ")", "g");
  return function(str) {
    return str.split(re).filter(identity);
  };
}
function joinNeighborsR(acc, x) {
  if (isString(tail(acc)) && isString(x))
    return acc.slice(0, -1).concat(tail(acc) + x);
  return pushR(acc, x);
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/safeConsole.js
var noopConsoleStub = { log: noop, error: noop, table: noop };
function ie9Console(console2) {
  var bound = function(fn) {
    return Function.prototype.bind.call(fn, console2);
  };
  return {
    log: bound(console2.log),
    error: bound(console2.log),
    table: bound(console2.log)
  };
}
function fallbackConsole(console2) {
  var log = console2.log.bind(console2);
  var error = console2.error ? console2.error.bind(console2) : log;
  var table = console2.table ? console2.table.bind(console2) : log;
  return { log, error, table };
}
function getSafeConsole() {
  var isIE9 = typeof document !== "undefined" && document.documentMode && document.documentMode === 9;
  if (isIE9) {
    return window && window.console ? ie9Console(window.console) : noopConsoleStub;
  } else if (!console.table || !console.error) {
    return fallbackConsole(console);
  } else {
    return console;
  }
}
var safeConsole = getSafeConsole();

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/common/trace.js
function uiViewString(uiview) {
  if (!uiview)
    return "ui-view (defunct)";
  var state = uiview.creationContext ? uiview.creationContext.name || "(root)" : "(none)";
  return "[ui-view#".concat(uiview.id, " ").concat(uiview.$type, ":").concat(uiview.fqn, " (").concat(uiview.name, "@").concat(state, ")]");
}
var viewConfigString = function(viewConfig) {
  var view = viewConfig.viewDecl;
  var state = view.$context.name || "(root)";
  return "[View#".concat(viewConfig.$id, " from '").concat(state, "' state]: target ui-view: '").concat(view.$uiViewName, "@").concat(view.$uiViewContextAnchor, "'");
};
function normalizedCat(input) {
  return isNumber(input) ? Category[input] : Category[Category[input]];
}
var Category;
(function(Category2) {
  Category2[Category2["RESOLVE"] = 0] = "RESOLVE";
  Category2[Category2["TRANSITION"] = 1] = "TRANSITION";
  Category2[Category2["HOOK"] = 2] = "HOOK";
  Category2[Category2["UIVIEW"] = 3] = "UIVIEW";
  Category2[Category2["VIEWCONFIG"] = 4] = "VIEWCONFIG";
})(Category || (Category = {}));
var _tid = parse("$id");
var _rid = parse("router.$id");
var transLbl = function(trans) {
  return "Transition #".concat(_tid(trans), "-").concat(_rid(trans));
};
var Trace = (
  /** @class */
  (function() {
    function Trace2() {
      this._enabled = {};
      this.approximateDigests = 0;
    }
    Trace2.prototype._set = function(enabled, categories) {
      var _this = this;
      if (!categories.length) {
        categories = Object.keys(Category).map(function(k) {
          return parseInt(k, 10);
        }).filter(function(k) {
          return !isNaN(k);
        }).map(function(key) {
          return Category[key];
        });
      }
      categories.map(normalizedCat).forEach(function(category) {
        return _this._enabled[category] = enabled;
      });
    };
    Trace2.prototype.enable = function() {
      var categories = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        categories[_i] = arguments[_i];
      }
      this._set(true, categories);
    };
    Trace2.prototype.disable = function() {
      var categories = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        categories[_i] = arguments[_i];
      }
      this._set(false, categories);
    };
    Trace2.prototype.enabled = function(category) {
      return !!this._enabled[normalizedCat(category)];
    };
    Trace2.prototype.traceTransitionStart = function(trans) {
      if (!this.enabled(Category.TRANSITION))
        return;
      safeConsole.log("".concat(transLbl(trans), ": Started  -> ").concat(stringify(trans)));
    };
    Trace2.prototype.traceTransitionIgnored = function(trans) {
      if (!this.enabled(Category.TRANSITION))
        return;
      safeConsole.log("".concat(transLbl(trans), ": Ignored  <> ").concat(stringify(trans)));
    };
    Trace2.prototype.traceHookInvocation = function(step, trans, options) {
      if (!this.enabled(Category.HOOK))
        return;
      var event = parse("traceData.hookType")(options) || "internal", context = parse("traceData.context.state.name")(options) || parse("traceData.context")(options) || "unknown", name = functionToString(step.registeredHook.callback);
      safeConsole.log("".concat(transLbl(trans), ":   Hook -> ").concat(event, " context: ").concat(context, ", ").concat(maxLength(200, name)));
    };
    Trace2.prototype.traceHookResult = function(hookResult, trans, transitionOptions) {
      if (!this.enabled(Category.HOOK))
        return;
      safeConsole.log("".concat(transLbl(trans), ":   <- Hook returned: ").concat(maxLength(200, stringify(hookResult))));
    };
    Trace2.prototype.traceResolvePath = function(path, when, trans) {
      if (!this.enabled(Category.RESOLVE))
        return;
      safeConsole.log("".concat(transLbl(trans), ":         Resolving ").concat(path, " (").concat(when, ")"));
    };
    Trace2.prototype.traceResolvableResolved = function(resolvable, trans) {
      if (!this.enabled(Category.RESOLVE))
        return;
      safeConsole.log("".concat(transLbl(trans), ":               <- Resolved  ").concat(resolvable, " to: ").concat(maxLength(200, stringify(resolvable.data))));
    };
    Trace2.prototype.traceError = function(reason, trans) {
      if (!this.enabled(Category.TRANSITION))
        return;
      safeConsole.log("".concat(transLbl(trans), ": <- Rejected ").concat(stringify(trans), ", reason: ").concat(reason));
    };
    Trace2.prototype.traceSuccess = function(finalState, trans) {
      if (!this.enabled(Category.TRANSITION))
        return;
      safeConsole.log("".concat(transLbl(trans), ": <- Success  ").concat(stringify(trans), ", final state: ").concat(finalState.name));
    };
    Trace2.prototype.traceUIViewEvent = function(event, viewData, extra) {
      if (extra === void 0) {
        extra = "";
      }
      if (!this.enabled(Category.UIVIEW))
        return;
      safeConsole.log("ui-view: ".concat(padString(30, event), " ").concat(uiViewString(viewData)).concat(extra));
    };
    Trace2.prototype.traceUIViewConfigUpdated = function(viewData, context) {
      if (!this.enabled(Category.UIVIEW))
        return;
      this.traceUIViewEvent("Updating", viewData, " with ViewConfig from context='".concat(context, "'"));
    };
    Trace2.prototype.traceUIViewFill = function(viewData, html) {
      if (!this.enabled(Category.UIVIEW))
        return;
      this.traceUIViewEvent("Fill", viewData, " with: ".concat(maxLength(200, html)));
    };
    Trace2.prototype.traceViewSync = function(pairs) {
      if (!this.enabled(Category.VIEWCONFIG))
        return;
      var uivheader = "uiview component fqn";
      var cfgheader = "view config state (view name)";
      var mapping = pairs.map(function(_a) {
        var _b;
        var uiView2 = _a.uiView, viewConfig = _a.viewConfig;
        var uiv = uiView2 && uiView2.fqn;
        var cfg = viewConfig && "".concat(viewConfig.viewDecl.$context.name, ": (").concat(viewConfig.viewDecl.$name, ")");
        return _b = {}, _b[uivheader] = uiv, _b[cfgheader] = cfg, _b;
      }).sort(function(a, b) {
        return (a[uivheader] || "").localeCompare(b[uivheader] || "");
      });
      safeConsole.table(mapping);
    };
    Trace2.prototype.traceViewServiceEvent = function(event, viewConfig) {
      if (!this.enabled(Category.VIEWCONFIG))
        return;
      safeConsole.log("VIEWCONFIG: ".concat(event, " ").concat(viewConfigString(viewConfig)));
    };
    Trace2.prototype.traceViewServiceUIViewEvent = function(event, viewData) {
      if (!this.enabled(Category.VIEWCONFIG))
        return;
      safeConsole.log("VIEWCONFIG: ".concat(event, " ").concat(uiViewString(viewData)));
    };
    return Trace2;
  })()
);
var trace = new Trace();

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/params/paramType.js
var ParamType = (
  /** @class */
  (function() {
    function ParamType2(def) {
      this.pattern = /.*/;
      this.inherit = true;
      extend(this, def);
    }
    ParamType2.prototype.is = function(val2, key) {
      return true;
    };
    ParamType2.prototype.encode = function(val2, key) {
      return val2;
    };
    ParamType2.prototype.decode = function(val2, key) {
      return val2;
    };
    ParamType2.prototype.equals = function(a, b) {
      return a == b;
    };
    ParamType2.prototype.$subPattern = function() {
      var sub = this.pattern.toString();
      return sub.substr(1, sub.length - 2);
    };
    ParamType2.prototype.toString = function() {
      return "{ParamType:".concat(this.name, "}");
    };
    ParamType2.prototype.$normalize = function(val2) {
      return this.is(val2) ? val2 : this.decode(val2);
    };
    ParamType2.prototype.$asArray = function(mode, isSearch) {
      if (!mode)
        return this;
      if (mode === "auto" && !isSearch)
        throw new Error("'auto' array mode is for query parameters only");
      return new ArrayType(this, mode);
    };
    return ParamType2;
  })()
);
function ArrayType(type, mode) {
  var _this = this;
  function arrayWrap(val2) {
    return isArray(val2) ? val2 : isDefined(val2) ? [val2] : [];
  }
  function arrayUnwrap(val2) {
    switch (val2.length) {
      case 0:
        return void 0;
      case 1:
        return mode === "auto" ? val2[0] : val2;
      default:
        return val2;
    }
  }
  function arrayHandler(callback, allTruthyMode) {
    return function handleArray(val2) {
      if (isArray(val2) && val2.length === 0)
        return val2;
      var arr = arrayWrap(val2);
      var result = map2(arr, callback);
      return allTruthyMode === true ? filter(result, function(x) {
        return !x;
      }).length === 0 : arrayUnwrap(result);
    };
  }
  function arrayEqualsHandler(callback) {
    return function handleArray(val1, val2) {
      var left = arrayWrap(val1), right = arrayWrap(val2);
      if (left.length !== right.length)
        return false;
      for (var i = 0; i < left.length; i++) {
        if (!callback(left[i], right[i]))
          return false;
      }
      return true;
    };
  }
  ["encode", "decode", "equals", "$normalize"].forEach(function(name) {
    var paramTypeFn = type[name].bind(type);
    var wrapperFn = name === "equals" ? arrayEqualsHandler : arrayHandler;
    _this[name] = wrapperFn(paramTypeFn);
  });
  extend(this, {
    dynamic: type.dynamic,
    name: type.name,
    pattern: type.pattern,
    inherit: type.inherit,
    raw: type.raw,
    is: arrayHandler(type.is.bind(type), true),
    $arrayMode: mode
  });
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/params/param.js
var hasOwn = Object.prototype.hasOwnProperty;
var isShorthand = function(cfg) {
  return ["value", "type", "squash", "array", "dynamic"].filter(hasOwn.bind(cfg || {})).length === 0;
};
var DefType;
(function(DefType2) {
  DefType2[DefType2["PATH"] = 0] = "PATH";
  DefType2[DefType2["SEARCH"] = 1] = "SEARCH";
  DefType2[DefType2["CONFIG"] = 2] = "CONFIG";
})(DefType || (DefType = {}));
function getParamDeclaration(paramName, location2, state) {
  var noReloadOnSearch = state.reloadOnSearch === false && location2 === DefType.SEARCH || void 0;
  var dynamic = find([state.dynamic, noReloadOnSearch], isDefined);
  var defaultConfig2 = isDefined(dynamic) ? { dynamic } : {};
  var paramConfig = unwrapShorthand(state && state.params && state.params[paramName]);
  return extend(defaultConfig2, paramConfig);
}
function unwrapShorthand(cfg) {
  cfg = isShorthand(cfg) ? { value: cfg } : cfg;
  getStaticDefaultValue["__cacheable"] = true;
  function getStaticDefaultValue() {
    return cfg.value;
  }
  var $$fn = isInjectable(cfg.value) ? cfg.value : getStaticDefaultValue;
  return extend(cfg, { $$fn });
}
function getType(cfg, urlType, location2, id3, paramTypes) {
  if (cfg.type && urlType && urlType.name !== "string")
    throw new Error("Param '".concat(id3, "' has two type configurations."));
  if (cfg.type && urlType && urlType.name === "string" && paramTypes.type(cfg.type))
    return paramTypes.type(cfg.type);
  if (urlType)
    return urlType;
  if (!cfg.type) {
    var type = location2 === DefType.CONFIG ? "any" : location2 === DefType.PATH ? "path" : location2 === DefType.SEARCH ? "query" : "string";
    return paramTypes.type(type);
  }
  return cfg.type instanceof ParamType ? cfg.type : paramTypes.type(cfg.type);
}
function getSquashPolicy(config, isOptional, defaultPolicy) {
  var squash = config.squash;
  if (!isOptional || squash === false)
    return false;
  if (!isDefined(squash) || squash == null)
    return defaultPolicy;
  if (squash === true || isString(squash))
    return squash;
  throw new Error("Invalid squash policy: '".concat(squash, "'. Valid policies: false, true, or arbitrary string"));
}
function getReplace(config, arrayMode, isOptional, squash) {
  var defaultPolicy = [
    { from: "", to: isOptional || arrayMode ? void 0 : "" },
    { from: null, to: isOptional || arrayMode ? void 0 : "" }
  ];
  var replace = isArray(config.replace) ? config.replace : [];
  if (isString(squash))
    replace.push({ from: squash, to: void 0 });
  var configuredKeys = map2(replace, prop("from"));
  return filter(defaultPolicy, function(item) {
    return configuredKeys.indexOf(item.from) === -1;
  }).concat(replace);
}
var Param = (
  /** @class */
  (function() {
    function Param2(id3, type, location2, urlConfig, state) {
      var config = getParamDeclaration(id3, location2, state);
      type = getType(config, type, location2, id3, urlConfig.paramTypes);
      var arrayMode = getArrayMode();
      type = arrayMode ? type.$asArray(arrayMode, location2 === DefType.SEARCH) : type;
      var isOptional = config.value !== void 0 || location2 === DefType.SEARCH;
      var dynamic = isDefined(config.dynamic) ? !!config.dynamic : !!type.dynamic;
      var raw = isDefined(config.raw) ? !!config.raw : !!type.raw;
      var squash = getSquashPolicy(config, isOptional, urlConfig.defaultSquashPolicy());
      var replace = getReplace(config, arrayMode, isOptional, squash);
      var inherit2 = isDefined(config.inherit) ? !!config.inherit : !!type.inherit;
      function getArrayMode() {
        var arrayDefaults = { array: location2 === DefType.SEARCH ? "auto" : false };
        var arrayParamNomenclature = id3.match(/\[\]$/) ? { array: true } : {};
        return extend(arrayDefaults, arrayParamNomenclature, config).array;
      }
      extend(this, { id: id3, type, location: location2, isOptional, dynamic, raw, squash, replace, inherit: inherit2, array: arrayMode, config });
    }
    Param2.values = function(params, values2) {
      if (values2 === void 0) {
        values2 = {};
      }
      var paramValues = {};
      for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var param = params_1[_i];
        paramValues[param.id] = param.value(values2[param.id]);
      }
      return paramValues;
    };
    Param2.changed = function(params, values1, values2) {
      if (values1 === void 0) {
        values1 = {};
      }
      if (values2 === void 0) {
        values2 = {};
      }
      return params.filter(function(param) {
        return !param.type.equals(values1[param.id], values2[param.id]);
      });
    };
    Param2.equals = function(params, values1, values2) {
      if (values1 === void 0) {
        values1 = {};
      }
      if (values2 === void 0) {
        values2 = {};
      }
      return Param2.changed(params, values1, values2).length === 0;
    };
    Param2.validates = function(params, values2) {
      if (values2 === void 0) {
        values2 = {};
      }
      return params.map(function(param) {
        return param.validates(values2[param.id]);
      }).reduce(allTrueR, true);
    };
    Param2.prototype.isDefaultValue = function(value) {
      return this.isOptional && this.type.equals(this.value(), value);
    };
    Param2.prototype.value = function(value) {
      var _this = this;
      var getDefaultValue = function() {
        if (_this._defaultValueCache)
          return _this._defaultValueCache.defaultValue;
        if (!services.$injector)
          throw new Error("Injectable functions cannot be called at configuration time");
        var defaultValue = services.$injector.invoke(_this.config.$$fn);
        if (defaultValue !== null && defaultValue !== void 0 && !_this.type.is(defaultValue))
          throw new Error("Default value (".concat(defaultValue, ") for parameter '").concat(_this.id, "' is not an instance of ParamType (").concat(_this.type.name, ")"));
        if (_this.config.$$fn["__cacheable"]) {
          _this._defaultValueCache = { defaultValue };
        }
        return defaultValue;
      };
      var replaceSpecialValues = function(val2) {
        for (var _i = 0, _a = _this.replace; _i < _a.length; _i++) {
          var tuple = _a[_i];
          if (tuple.from === val2)
            return tuple.to;
        }
        return val2;
      };
      value = replaceSpecialValues(value);
      return isUndefined(value) ? getDefaultValue() : this.type.$normalize(value);
    };
    Param2.prototype.isSearch = function() {
      return this.location === DefType.SEARCH;
    };
    Param2.prototype.validates = function(value) {
      if ((isUndefined(value) || value === null) && this.isOptional)
        return true;
      var normalized = this.type.$normalize(value);
      if (!this.type.is(normalized))
        return false;
      var encoded = this.type.encode(normalized);
      return !(isString(encoded) && !this.type.pattern.exec(encoded));
    };
    Param2.prototype.toString = function() {
      return "{Param:".concat(this.id, " ").concat(this.type, " squash: '").concat(this.squash, "' optional: ").concat(this.isOptional, "}");
    };
    return Param2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/params/paramTypes.js
var ParamTypes = (
  /** @class */
  (function() {
    function ParamTypes2() {
      this.enqueue = true;
      this.typeQueue = [];
      this.defaultTypes = pick(ParamTypes2.prototype, [
        "hash",
        "string",
        "query",
        "path",
        "int",
        "bool",
        "date",
        "json",
        "any"
      ]);
      var makeType = function(definition, name) {
        return new ParamType(extend({ name }, definition));
      };
      this.types = inherit(map2(this.defaultTypes, makeType), {});
    }
    ParamTypes2.prototype.dispose = function() {
      this.types = {};
    };
    ParamTypes2.prototype.type = function(name, definition, definitionFn) {
      if (!isDefined(definition))
        return this.types[name];
      if (this.types.hasOwnProperty(name))
        throw new Error("A type named '".concat(name, "' has already been defined."));
      this.types[name] = new ParamType(extend({ name }, definition));
      if (definitionFn) {
        this.typeQueue.push({ name, def: definitionFn });
        if (!this.enqueue)
          this._flushTypeQueue();
      }
      return this;
    };
    ParamTypes2.prototype._flushTypeQueue = function() {
      while (this.typeQueue.length) {
        var type = this.typeQueue.shift();
        if (type.pattern)
          throw new Error("You cannot override a type's .pattern at runtime.");
        extend(this.types[type.name], services.$injector.invoke(type.def));
      }
    };
    return ParamTypes2;
  })()
);
function initDefaultTypes() {
  var makeDefaultType = function(def) {
    var valToString = function(val2) {
      return val2 != null ? val2.toString() : val2;
    };
    var defaultTypeBase = {
      encode: valToString,
      decode: valToString,
      is: is(String),
      pattern: /.*/,
      // tslint:disable-next-line:triple-equals
      equals: function(a, b) {
        return a == b;
      }
      // allow coersion for null/undefined/""
    };
    return extend({}, defaultTypeBase, def);
  };
  extend(ParamTypes.prototype, {
    string: makeDefaultType({}),
    path: makeDefaultType({
      pattern: /[^/]*/
    }),
    query: makeDefaultType({}),
    hash: makeDefaultType({
      inherit: false
    }),
    int: makeDefaultType({
      decode: function(val2) {
        return parseInt(val2, 10);
      },
      is: function(val2) {
        return !isNullOrUndefined(val2) && this.decode(val2.toString()) === val2;
      },
      pattern: /-?\d+/
    }),
    bool: makeDefaultType({
      encode: function(val2) {
        return val2 && 1 || 0;
      },
      decode: function(val2) {
        return parseInt(val2, 10) !== 0;
      },
      is: is(Boolean),
      pattern: /0|1/
    }),
    date: makeDefaultType({
      encode: function(val2) {
        return !this.is(val2) ? void 0 : [val2.getFullYear(), ("0" + (val2.getMonth() + 1)).slice(-2), ("0" + val2.getDate()).slice(-2)].join("-");
      },
      decode: function(val2) {
        if (this.is(val2))
          return val2;
        var match = this.capture.exec(val2);
        return match ? new Date(match[1], match[2] - 1, match[3]) : void 0;
      },
      is: function(val2) {
        return val2 instanceof Date && !isNaN(val2.valueOf());
      },
      equals: function(l, r) {
        return ["getFullYear", "getMonth", "getDate"].reduce(function(acc, fn) {
          return acc && l[fn]() === r[fn]();
        }, true);
      },
      pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
      capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
    }),
    json: makeDefaultType({
      encode: toJson,
      decode: fromJson,
      is: is(Object),
      equals,
      pattern: /[^/]*/
    }),
    // does not encode/decode
    any: makeDefaultType({
      encode: identity,
      decode: identity,
      is: function() {
        return true;
      },
      equals
    })
  });
}
initDefaultTypes();

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/params/stateParams.js
var StateParams = (
  /** @class */
  (function() {
    function StateParams2(params) {
      if (params === void 0) {
        params = {};
      }
      extend(this, params);
    }
    StateParams2.prototype.$inherit = function(newParams, $current, $to) {
      var parents = ancestors($current, $to), inherited = {}, inheritList = [];
      for (var i in parents) {
        if (!parents[i] || !parents[i].params)
          continue;
        var parentParams = parents[i].params;
        var parentParamsKeys = Object.keys(parentParams);
        if (!parentParamsKeys.length)
          continue;
        for (var j in parentParamsKeys) {
          if (!parentParamsKeys.hasOwnProperty(j) || parentParams[parentParamsKeys[j]].inherit == false || inheritList.indexOf(parentParamsKeys[j]) >= 0)
            continue;
          inheritList.push(parentParamsKeys[j]);
          inherited[parentParamsKeys[j]] = this[parentParamsKeys[j]];
        }
      }
      return extend({}, inherited, newParams);
    };
    return StateParams2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/path/pathNode.js
var PathNode = (
  /** @class */
  (function() {
    function PathNode2(stateOrNode) {
      if (stateOrNode instanceof PathNode2) {
        var node = stateOrNode;
        this.state = node.state;
        this.paramSchema = node.paramSchema.slice();
        this.paramValues = extend({}, node.paramValues);
        this.resolvables = node.resolvables.slice();
        this.views = node.views && node.views.slice();
      } else {
        var state = stateOrNode;
        this.state = state;
        this.paramSchema = state.parameters({ inherit: false });
        this.paramValues = {};
        this.resolvables = state.resolvables.map(function(res) {
          return res.clone();
        });
      }
    }
    PathNode2.prototype.clone = function() {
      return new PathNode2(this);
    };
    PathNode2.prototype.applyRawParams = function(params) {
      var getParamVal = function(paramDef) {
        return [paramDef.id, paramDef.value(params[paramDef.id])];
      };
      this.paramValues = this.paramSchema.reduce(function(memo, pDef) {
        return applyPairs(memo, getParamVal(pDef));
      }, {});
      return this;
    };
    PathNode2.prototype.parameter = function(name) {
      return find(this.paramSchema, propEq("id", name));
    };
    PathNode2.prototype.equals = function(node, paramsFn) {
      var diff = this.diff(node, paramsFn);
      return diff && diff.length === 0;
    };
    PathNode2.prototype.diff = function(node, paramsFn) {
      if (this.state !== node.state)
        return false;
      var params = paramsFn ? paramsFn(this) : this.paramSchema;
      return Param.changed(params, this.paramValues, node.paramValues);
    };
    PathNode2.clone = function(node) {
      return node.clone();
    };
    return PathNode2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/targetState.js
var TargetState = (
  /** @class */
  (function() {
    function TargetState2(_stateRegistry, _identifier, _params, _options) {
      this._stateRegistry = _stateRegistry;
      this._identifier = _identifier;
      this._identifier = _identifier;
      this._params = extend({}, _params || {});
      this._options = extend({}, _options || {});
      this._definition = _stateRegistry.matcher.find(_identifier, this._options.relative);
    }
    TargetState2.prototype.name = function() {
      return this._definition && this._definition.name || this._identifier;
    };
    TargetState2.prototype.identifier = function() {
      return this._identifier;
    };
    TargetState2.prototype.params = function() {
      return this._params;
    };
    TargetState2.prototype.$state = function() {
      return this._definition;
    };
    TargetState2.prototype.state = function() {
      return this._definition && this._definition.self;
    };
    TargetState2.prototype.options = function() {
      return this._options;
    };
    TargetState2.prototype.exists = function() {
      return !!(this._definition && this._definition.self);
    };
    TargetState2.prototype.valid = function() {
      return !this.error();
    };
    TargetState2.prototype.error = function() {
      var base = this.options().relative;
      if (!this._definition && !!base) {
        var stateName = base.name ? base.name : base;
        return "Could not resolve '".concat(this.name(), "' from state '").concat(stateName, "'");
      }
      if (!this._definition)
        return "No such state '".concat(this.name(), "'");
      if (!this._definition.self)
        return "State '".concat(this.name(), "' has an invalid definition");
    };
    TargetState2.prototype.toString = function() {
      return "'".concat(this.name(), "'").concat(stringify(this.params()));
    };
    TargetState2.prototype.withState = function(state) {
      return new TargetState2(this._stateRegistry, state, this._params, this._options);
    };
    TargetState2.prototype.withParams = function(params, replace) {
      if (replace === void 0) {
        replace = false;
      }
      var newParams = replace ? params : extend({}, this._params, params);
      return new TargetState2(this._stateRegistry, this._identifier, newParams, this._options);
    };
    TargetState2.prototype.withOptions = function(options, replace) {
      if (replace === void 0) {
        replace = false;
      }
      var newOpts = replace ? options : extend({}, this._options, options);
      return new TargetState2(this._stateRegistry, this._identifier, this._params, newOpts);
    };
    TargetState2.isDef = function(obj) {
      return obj && obj.state && (isString(obj.state) || isObject(obj.state) && isString(obj.state.name));
    };
    return TargetState2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/path/pathUtils.js
var PathUtils = (
  /** @class */
  (function() {
    function PathUtils2() {
    }
    PathUtils2.makeTargetState = function(registry, path) {
      var state = tail(path).state;
      return new TargetState(registry, state, path.map(prop("paramValues")).reduce(mergeR, {}), {});
    };
    PathUtils2.buildPath = function(targetState) {
      var toParams = targetState.params();
      return targetState.$state().path.map(function(state) {
        return new PathNode(state).applyRawParams(toParams);
      });
    };
    PathUtils2.buildToPath = function(fromPath, targetState) {
      var toPath = PathUtils2.buildPath(targetState);
      if (targetState.options().inherit) {
        return PathUtils2.inheritParams(fromPath, toPath, Object.keys(targetState.params()));
      }
      return toPath;
    };
    PathUtils2.applyViewConfigs = function($view, path, states) {
      path.filter(function(node) {
        return inArray(states, node.state);
      }).forEach(function(node) {
        var viewDecls = values(node.state.views || {});
        var subPath = PathUtils2.subPath(path, function(n) {
          return n === node;
        });
        var viewConfigs = viewDecls.map(function(view) {
          return $view.createViewConfig(subPath, view);
        });
        node.views = viewConfigs.reduce(unnestR, []);
      });
    };
    PathUtils2.inheritParams = function(fromPath, toPath, toKeys) {
      if (toKeys === void 0) {
        toKeys = [];
      }
      function nodeParamVals(path, state) {
        var node = find(path, propEq("state", state));
        return extend({}, node && node.paramValues);
      }
      var noInherit = fromPath.map(function(node) {
        return node.paramSchema;
      }).reduce(unnestR, []).filter(function(param) {
        return !param.inherit;
      }).map(prop("id"));
      function makeInheritedParamsNode(toNode) {
        var toParamVals = extend({}, toNode && toNode.paramValues);
        var incomingParamVals = pick(toParamVals, toKeys);
        toParamVals = omit(toParamVals, toKeys);
        var fromParamVals = omit(nodeParamVals(fromPath, toNode.state) || {}, noInherit);
        var ownParamVals = extend(toParamVals, fromParamVals, incomingParamVals);
        return new PathNode(toNode.state).applyRawParams(ownParamVals);
      }
      return toPath.map(makeInheritedParamsNode);
    };
    PathUtils2.treeChanges = function(fromPath, toPath, reloadState) {
      var max = Math.min(fromPath.length, toPath.length);
      var keep = 0;
      var nodesMatch = function(node1, node2) {
        return node1.equals(node2, PathUtils2.nonDynamicParams);
      };
      while (keep < max && fromPath[keep].state !== reloadState && nodesMatch(fromPath[keep], toPath[keep])) {
        keep++;
      }
      function applyToParams(retainedNode, idx) {
        var cloned = retainedNode.clone();
        cloned.paramValues = toPath[idx].paramValues;
        return cloned;
      }
      var from2, retained, exiting, entering, to;
      from2 = fromPath;
      retained = from2.slice(0, keep);
      exiting = from2.slice(keep);
      var retainedWithToParams = retained.map(applyToParams);
      entering = toPath.slice(keep);
      to = retainedWithToParams.concat(entering);
      return { from: from2, to, retained, retainedWithToParams, exiting, entering };
    };
    PathUtils2.matching = function(pathA, pathB, paramsFn) {
      var done = false;
      var tuples = arrayTuples(pathA, pathB);
      return tuples.reduce(function(matching, _a) {
        var nodeA = _a[0], nodeB = _a[1];
        done = done || !nodeA.equals(nodeB, paramsFn);
        return done ? matching : matching.concat(nodeA);
      }, []);
    };
    PathUtils2.equals = function(pathA, pathB, paramsFn) {
      return pathA.length === pathB.length && PathUtils2.matching(pathA, pathB, paramsFn).length === pathA.length;
    };
    PathUtils2.subPath = function(path, predicate) {
      var node = find(path, predicate);
      var elementIdx = path.indexOf(node);
      return elementIdx === -1 ? void 0 : path.slice(0, elementIdx + 1);
    };
    PathUtils2.nonDynamicParams = function(node) {
      return node.state.parameters({ inherit: false }).filter(function(param) {
        return !param.dynamic;
      });
    };
    PathUtils2.paramValues = function(path) {
      return path.reduce(function(acc, node) {
        return extend(acc, node.paramValues);
      }, {});
    };
    return PathUtils2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/resolve/interface.js
var resolvePolicies = {
  when: {
    LAZY: "LAZY",
    EAGER: "EAGER"
  },
  async: {
    WAIT: "WAIT",
    NOWAIT: "NOWAIT"
  }
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/resolve/resolvable.js
var defaultResolvePolicy = {
  when: "LAZY",
  async: "WAIT"
};
var Resolvable = (
  /** @class */
  (function() {
    function Resolvable2(arg1, resolveFn, deps, policy, data) {
      this.resolved = false;
      this.promise = void 0;
      if (arg1 instanceof Resolvable2) {
        extend(this, arg1);
      } else if (isFunction(resolveFn)) {
        if (isNullOrUndefined(arg1))
          throw new Error("new Resolvable(): token argument is required");
        if (!isFunction(resolveFn))
          throw new Error("new Resolvable(): resolveFn argument must be a function");
        this.token = arg1;
        this.policy = policy;
        this.resolveFn = resolveFn;
        this.deps = deps || [];
        this.data = data;
        this.resolved = data !== void 0;
        this.promise = this.resolved ? services.$q.when(this.data) : void 0;
      } else if (isObject(arg1) && arg1.token && (arg1.hasOwnProperty("resolveFn") || arg1.hasOwnProperty("data"))) {
        var literal = arg1;
        return new Resolvable2(literal.token, literal.resolveFn, literal.deps, literal.policy, literal.data);
      }
    }
    Resolvable2.prototype.getPolicy = function(state) {
      var thisPolicy = this.policy || {};
      var statePolicy = state && state.resolvePolicy || {};
      return {
        when: thisPolicy.when || statePolicy.when || defaultResolvePolicy.when,
        async: thisPolicy.async || statePolicy.async || defaultResolvePolicy.async
      };
    };
    Resolvable2.prototype.resolve = function(resolveContext, trans) {
      var _this = this;
      var $q2 = services.$q;
      var getResolvableDependencies = function() {
        return $q2.all(resolveContext.getDependencies(_this).map(function(resolvable) {
          return resolvable.get(resolveContext, trans);
        }));
      };
      var invokeResolveFn = function(resolvedDeps) {
        return _this.resolveFn.apply(null, resolvedDeps);
      };
      var node = resolveContext.findNode(this);
      var state = node && node.state;
      var asyncPolicy = this.getPolicy(state).async;
      var customAsyncPolicy = isFunction(asyncPolicy) ? asyncPolicy : identity;
      var applyResolvedValue = function(resolvedValue) {
        _this.data = resolvedValue;
        _this.resolved = true;
        _this.resolveFn = null;
        trace.traceResolvableResolved(_this, trans);
        return _this.data;
      };
      return this.promise = $q2.when().then(getResolvableDependencies).then(invokeResolveFn).then(customAsyncPolicy).then(applyResolvedValue);
    };
    Resolvable2.prototype.get = function(resolveContext, trans) {
      return this.promise || this.resolve(resolveContext, trans);
    };
    Resolvable2.prototype.toString = function() {
      return "Resolvable(token: ".concat(stringify(this.token), ", requires: [").concat(this.deps.map(stringify), "])");
    };
    Resolvable2.prototype.clone = function() {
      return new Resolvable2(this);
    };
    Resolvable2.fromData = function(token, data) {
      return new Resolvable2(token, function() {
        return data;
      }, null, null, data);
    };
    return Resolvable2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/resolve/resolveContext.js
var whens = resolvePolicies.when;
var ALL_WHENS = [whens.EAGER, whens.LAZY];
var EAGER_WHENS = [whens.EAGER];
var NATIVE_INJECTOR_TOKEN = "Native Injector";
var ResolveContext = (
  /** @class */
  (function() {
    function ResolveContext2(_path) {
      this._path = _path;
    }
    ResolveContext2.prototype.getTokens = function() {
      return this._path.reduce(function(acc, node) {
        return acc.concat(node.resolvables.map(function(r) {
          return r.token;
        }));
      }, []).reduce(uniqR, []);
    };
    ResolveContext2.prototype.getResolvable = function(token) {
      var matching = this._path.map(function(node) {
        return node.resolvables;
      }).reduce(unnestR, []).filter(function(r) {
        return r.token === token;
      });
      return tail(matching);
    };
    ResolveContext2.prototype.getPolicy = function(resolvable) {
      var node = this.findNode(resolvable);
      return resolvable.getPolicy(node.state);
    };
    ResolveContext2.prototype.subContext = function(state) {
      return new ResolveContext2(PathUtils.subPath(this._path, function(node) {
        return node.state === state;
      }));
    };
    ResolveContext2.prototype.addResolvables = function(newResolvables, state) {
      var node = find(this._path, propEq("state", state));
      var keys = newResolvables.map(function(r) {
        return r.token;
      });
      node.resolvables = node.resolvables.filter(function(r) {
        return keys.indexOf(r.token) === -1;
      }).concat(newResolvables);
    };
    ResolveContext2.prototype.resolvePath = function(when, trans) {
      var _this = this;
      if (when === void 0) {
        when = "LAZY";
      }
      var whenOption = inArray(ALL_WHENS, when) ? when : "LAZY";
      var matchedWhens = whenOption === resolvePolicies.when.EAGER ? EAGER_WHENS : ALL_WHENS;
      trace.traceResolvePath(this._path, when, trans);
      var matchesPolicy = function(acceptedVals, whenOrAsync) {
        return function(resolvable) {
          return inArray(acceptedVals, _this.getPolicy(resolvable)[whenOrAsync]);
        };
      };
      var promises = this._path.reduce(function(acc, node) {
        var nodeResolvables = node.resolvables.filter(matchesPolicy(matchedWhens, "when"));
        var nowait = nodeResolvables.filter(matchesPolicy(["NOWAIT"], "async"));
        var wait = nodeResolvables.filter(not(matchesPolicy(["NOWAIT"], "async")));
        var subContext = _this.subContext(node.state);
        var getResult = function(r) {
          return r.get(subContext, trans).then(function(value) {
            return { token: r.token, value };
          });
        };
        nowait.forEach(getResult);
        return acc.concat(wait.map(getResult));
      }, []);
      return services.$q.all(promises);
    };
    ResolveContext2.prototype.injector = function() {
      return this._injector || (this._injector = new UIInjectorImpl(this));
    };
    ResolveContext2.prototype.findNode = function(resolvable) {
      return find(this._path, function(node) {
        return inArray(node.resolvables, resolvable);
      });
    };
    ResolveContext2.prototype.getDependencies = function(resolvable) {
      var _this = this;
      var node = this.findNode(resolvable);
      var subPath = PathUtils.subPath(this._path, function(x) {
        return x === node;
      }) || this._path;
      var availableResolvables = subPath.reduce(function(acc, _node) {
        return acc.concat(_node.resolvables);
      }, []).filter(function(res) {
        return res !== resolvable;
      });
      var getDependency = function(token) {
        var matching = availableResolvables.filter(function(r) {
          return r.token === token;
        });
        if (matching.length)
          return tail(matching);
        var fromInjector = _this.injector().getNative(token);
        if (isUndefined(fromInjector)) {
          throw new Error("Could not find Dependency Injection token: " + stringify(token));
        }
        return new Resolvable(token, function() {
          return fromInjector;
        }, [], fromInjector);
      };
      return resolvable.deps.map(getDependency);
    };
    return ResolveContext2;
  })()
);
var UIInjectorImpl = (
  /** @class */
  (function() {
    function UIInjectorImpl2(context) {
      this.context = context;
      this.native = this.get(NATIVE_INJECTOR_TOKEN) || services.$injector;
    }
    UIInjectorImpl2.prototype.get = function(token) {
      var resolvable = this.context.getResolvable(token);
      if (resolvable) {
        if (this.context.getPolicy(resolvable).async === "NOWAIT") {
          return resolvable.get(this.context);
        }
        if (!resolvable.resolved) {
          throw new Error("Resolvable async .get() not complete:" + stringify(resolvable.token));
        }
        return resolvable.data;
      }
      return this.getNative(token);
    };
    UIInjectorImpl2.prototype.getAsync = function(token) {
      var resolvable = this.context.getResolvable(token);
      if (resolvable)
        return resolvable.get(this.context);
      return services.$q.when(this.native.get(token));
    };
    UIInjectorImpl2.prototype.getNative = function(token) {
      return this.native && this.native.get(token);
    };
    return UIInjectorImpl2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateBuilder.js
var parseUrl = function(url) {
  if (!isString(url))
    return false;
  var root2 = url.charAt(0) === "^";
  return { val: root2 ? url.substring(1) : url, root: root2 };
};
function nameBuilder(state) {
  return state.name;
}
function selfBuilder(state) {
  state.self.$$state = function() {
    return state;
  };
  return state.self;
}
function dataBuilder(state) {
  if (state.parent && state.parent.data) {
    state.data = state.self.data = inherit(state.parent.data, state.data);
  }
  return state.data;
}
var getUrlBuilder = function($urlMatcherFactoryProvider, root2) {
  return function urlBuilder(stateObject) {
    var stateDec = stateObject.self;
    if (stateDec && stateDec.url && stateDec.name && stateDec.name.match(/\.\*\*$/)) {
      var newStateDec = {};
      copy(stateDec, newStateDec);
      newStateDec.url += "{remainder:any}";
      stateDec = newStateDec;
    }
    var parent = stateObject.parent;
    var parsed = parseUrl(stateDec.url);
    var url = !parsed ? stateDec.url : $urlMatcherFactoryProvider.compile(parsed.val, { state: stateDec });
    if (!url)
      return null;
    if (!$urlMatcherFactoryProvider.isMatcher(url))
      throw new Error("Invalid url '".concat(url, "' in state '").concat(stateObject, "'"));
    return parsed && parsed.root ? url : (parent && parent.navigable || root2()).url.append(url);
  };
};
var getNavigableBuilder = function(isRoot) {
  return function navigableBuilder(state) {
    return !isRoot(state) && state.url ? state : state.parent ? state.parent.navigable : null;
  };
};
var getParamsBuilder = function(paramFactory) {
  return function paramsBuilder(state) {
    var makeConfigParam = function(config, id3) {
      return paramFactory.fromConfig(id3, null, state.self);
    };
    var urlParams = state.url && state.url.parameters({ inherit: false }) || [];
    var nonUrlParams = values(mapObj(omit(state.params || {}, urlParams.map(prop("id"))), makeConfigParam));
    return urlParams.concat(nonUrlParams).map(function(p) {
      return [p.id, p];
    }).reduce(applyPairs, {});
  };
};
function pathBuilder(state) {
  return state.parent ? state.parent.path.concat(state) : (
    /*root*/
    [state]
  );
}
function includesBuilder(state) {
  var includes = state.parent ? extend({}, state.parent.includes) : {};
  includes[state.name] = true;
  return includes;
}
function resolvablesBuilder(state) {
  var objects2Tuples = function(resolveObj, resolvePolicies2) {
    return Object.keys(resolveObj || {}).map(function(token) {
      return {
        token,
        val: resolveObj[token],
        deps: void 0,
        policy: resolvePolicies2[token]
      };
    });
  };
  var annotate = function(fn) {
    var $injector2 = services.$injector;
    return fn["$inject"] || $injector2 && $injector2.annotate(fn, $injector2.strictDi) || "deferred";
  };
  var isResolveLiteral = function(obj) {
    return !!(obj.token && obj.resolveFn);
  };
  var isLikeNg2Provider = function(obj) {
    return !!((obj.provide || obj.token) && (obj.useValue || obj.useFactory || obj.useExisting || obj.useClass));
  };
  var isTupleFromObj = function(obj) {
    return !!(obj && obj.val && (isString(obj.val) || isArray(obj.val) || isFunction(obj.val)));
  };
  var getToken = function(p) {
    return p.provide || p.token;
  };
  var literal2Resolvable = pattern([
    [prop("resolveFn"), function(p) {
      return new Resolvable(getToken(p), p.resolveFn, p.deps, p.policy);
    }],
    [prop("useFactory"), function(p) {
      return new Resolvable(getToken(p), p.useFactory, p.deps || p.dependencies, p.policy);
    }],
    [prop("useClass"), function(p) {
      return new Resolvable(getToken(p), function() {
        return new p.useClass();
      }, [], p.policy);
    }],
    [prop("useValue"), function(p) {
      return new Resolvable(getToken(p), function() {
        return p.useValue;
      }, [], p.policy, p.useValue);
    }],
    [prop("useExisting"), function(p) {
      return new Resolvable(getToken(p), identity, [p.useExisting], p.policy);
    }]
  ]);
  var tuple2Resolvable = pattern([
    [pipe(prop("val"), isString), function(tuple) {
      return new Resolvable(tuple.token, identity, [tuple.val], tuple.policy);
    }],
    [pipe(prop("val"), isArray), function(tuple) {
      return new Resolvable(tuple.token, tail(tuple.val), tuple.val.slice(0, -1), tuple.policy);
    }],
    [pipe(prop("val"), isFunction), function(tuple) {
      return new Resolvable(tuple.token, tuple.val, annotate(tuple.val), tuple.policy);
    }]
  ]);
  var item2Resolvable = pattern([
    [is(Resolvable), function(r) {
      return r;
    }],
    [isResolveLiteral, literal2Resolvable],
    [isLikeNg2Provider, literal2Resolvable],
    [isTupleFromObj, tuple2Resolvable],
    [val(true), function(obj) {
      throw new Error("Invalid resolve value: " + stringify(obj));
    }]
  ]);
  var decl = state.resolve;
  var items = isArray(decl) ? decl : objects2Tuples(decl, state.resolvePolicy || {});
  return items.map(item2Resolvable);
}
var StateBuilder = (
  /** @class */
  (function() {
    function StateBuilder2(matcher, urlMatcherFactory) {
      this.matcher = matcher;
      var self2 = this;
      var root2 = function() {
        return matcher.find("");
      };
      var isRoot = function(state) {
        return state.name === "";
      };
      function parentBuilder(state) {
        if (isRoot(state))
          return null;
        return matcher.find(self2.parentName(state)) || root2();
      }
      this.builders = {
        name: [nameBuilder],
        self: [selfBuilder],
        parent: [parentBuilder],
        data: [dataBuilder],
        // Build a URLMatcher if necessary, either via a relative or absolute URL
        url: [getUrlBuilder(urlMatcherFactory, root2)],
        // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
        navigable: [getNavigableBuilder(isRoot)],
        params: [getParamsBuilder(urlMatcherFactory.paramFactory)],
        // Each framework-specific ui-router implementation should define its own `views` builder
        // e.g., src/ng1/statebuilders/views.ts
        views: [],
        // Keep a full path from the root down to this state as this is needed for state activation.
        path: [pathBuilder],
        // Speed up $state.includes() as it's used a lot
        includes: [includesBuilder],
        resolvables: [resolvablesBuilder]
      };
    }
    StateBuilder2.prototype.builder = function(name, fn) {
      var builders = this.builders;
      var array = builders[name] || [];
      if (isString(name) && !isDefined(fn))
        return array.length > 1 ? array : array[0];
      if (!isString(name) || !isFunction(fn))
        return;
      builders[name] = array;
      builders[name].push(fn);
      return function() {
        return builders[name].splice(builders[name].indexOf(fn, 1)) && null;
      };
    };
    StateBuilder2.prototype.build = function(state) {
      var _a = this, matcher = _a.matcher, builders = _a.builders;
      var parent = this.parentName(state);
      if (parent && !matcher.find(parent, void 0, false)) {
        return null;
      }
      for (var key in builders) {
        if (!builders.hasOwnProperty(key))
          continue;
        var chain = builders[key].reduce(function(parentFn, step) {
          return function(_state) {
            return step(_state, parentFn);
          };
        }, noop);
        state[key] = chain(state);
      }
      return state;
    };
    StateBuilder2.prototype.parentName = function(state) {
      var name = state.name || "";
      var segments = name.split(".");
      var lastSegment = segments.pop();
      if (lastSegment === "**")
        segments.pop();
      if (segments.length) {
        if (state.parent) {
          throw new Error("States that specify the 'parent:' property should not have a '.' in their name (".concat(name, ")"));
        }
        return segments.join(".");
      }
      if (!state.parent)
        return "";
      return isString(state.parent) ? state.parent : state.parent.name;
    };
    StateBuilder2.prototype.name = function(state) {
      var name = state.name;
      if (name.indexOf(".") !== -1 || !state.parent)
        return name;
      var parentName = isString(state.parent) ? state.parent : state.parent.name;
      return parentName ? parentName + "." + name : name;
    };
    return StateBuilder2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateObject.js
var StateObject = (
  /** @class */
  (function() {
    function StateObject2(config) {
      return StateObject2.create(config || {});
    }
    StateObject2.create = function(stateDecl) {
      stateDecl = StateObject2.isStateClass(stateDecl) ? new stateDecl() : stateDecl;
      var state = inherit(inherit(stateDecl, StateObject2.prototype));
      stateDecl.$$state = function() {
        return state;
      };
      state.self = stateDecl;
      state.__stateObjectCache = {
        nameGlob: Glob.fromString(state.name)
        // might return null
      };
      return state;
    };
    StateObject2.prototype.is = function(ref) {
      return this === ref || this.self === ref || this.fqn() === ref;
    };
    StateObject2.prototype.fqn = function() {
      if (!this.parent || !(this.parent instanceof this.constructor))
        return this.name;
      var name = this.parent.fqn();
      return name ? name + "." + this.name : this.name;
    };
    StateObject2.prototype.root = function() {
      return this.parent && this.parent.root() || this;
    };
    StateObject2.prototype.parameters = function(opts) {
      opts = defaults(opts, { inherit: true, matchingKeys: null });
      var inherited = opts.inherit && this.parent && this.parent.parameters() || [];
      return inherited.concat(values(this.params)).filter(function(param) {
        return !opts.matchingKeys || opts.matchingKeys.hasOwnProperty(param.id);
      });
    };
    StateObject2.prototype.parameter = function(id3, opts) {
      if (opts === void 0) {
        opts = {};
      }
      return this.url && this.url.parameter(id3, opts) || find(values(this.params), propEq("id", id3)) || opts.inherit && this.parent && this.parent.parameter(id3);
    };
    StateObject2.prototype.toString = function() {
      return this.fqn();
    };
    StateObject2.isStateClass = function(stateDecl) {
      return isFunction(stateDecl) && stateDecl["__uiRouterState"] === true;
    };
    StateObject2.isStateDeclaration = function(obj) {
      return isFunction(obj["$$state"]);
    };
    StateObject2.isState = function(obj) {
      return isObject(obj["__stateObjectCache"]);
    };
    return StateObject2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateMatcher.js
var StateMatcher = (
  /** @class */
  (function() {
    function StateMatcher2(_states) {
      this._states = _states;
    }
    StateMatcher2.prototype.isRelative = function(stateName) {
      stateName = stateName || "";
      return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
    };
    StateMatcher2.prototype.find = function(stateOrName, base, matchGlob) {
      if (matchGlob === void 0) {
        matchGlob = true;
      }
      if (!stateOrName && stateOrName !== "")
        return void 0;
      var isStr = isString(stateOrName);
      var name = isStr ? stateOrName : stateOrName.name;
      if (this.isRelative(name))
        name = this.resolvePath(name, base);
      var state = this._states[name];
      if (state && (isStr || !isStr && (state === stateOrName || state.self === stateOrName))) {
        return state;
      } else if (isStr && matchGlob) {
        var _states = values(this._states);
        var matches = _states.filter(function(_state) {
          return _state.__stateObjectCache.nameGlob && _state.__stateObjectCache.nameGlob.matches(name);
        });
        if (matches.length > 1) {
          safeConsole.error("stateMatcher.find: Found multiple matches for ".concat(name, " using glob: "), matches.map(function(match) {
            return match.name;
          }));
        }
        return matches[0];
      }
      return void 0;
    };
    StateMatcher2.prototype.resolvePath = function(name, base) {
      if (!base)
        throw new Error("No reference point given for path '".concat(name, "'"));
      var baseState = this.find(base);
      var splitName = name.split(".");
      var pathLength = splitName.length;
      var i = 0, current = baseState;
      for (; i < pathLength; i++) {
        if (splitName[i] === "" && i === 0) {
          current = baseState;
          continue;
        }
        if (splitName[i] === "^") {
          if (!current.parent)
            throw new Error("Path '".concat(name, "' not valid for state '").concat(baseState.name, "'"));
          current = current.parent;
          continue;
        }
        break;
      }
      var relName = splitName.slice(i).join(".");
      return current.name + (current.name && relName ? "." : "") + relName;
    };
    return StateMatcher2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateQueueManager.js
var StateQueueManager = (
  /** @class */
  (function() {
    function StateQueueManager2(router2, states, builder, listeners) {
      this.router = router2;
      this.states = states;
      this.builder = builder;
      this.listeners = listeners;
      this.queue = [];
    }
    StateQueueManager2.prototype.dispose = function() {
      this.queue = [];
    };
    StateQueueManager2.prototype.register = function(stateDecl) {
      var queue = this.queue;
      var state = StateObject.create(stateDecl);
      var name = state.name;
      if (!isString(name))
        throw new Error("State must have a valid name");
      if (this.states.hasOwnProperty(name) || inArray(queue.map(prop("name")), name))
        throw new Error("State '".concat(name, "' is already defined"));
      queue.push(state);
      this.flush();
      return state;
    };
    StateQueueManager2.prototype.flush = function() {
      var _this = this;
      var _a = this, queue = _a.queue, states = _a.states, builder = _a.builder;
      var registered = [], orphans = [], previousQueueLength = {};
      var getState = function(name) {
        return _this.states.hasOwnProperty(name) && _this.states[name];
      };
      var notifyListeners = function() {
        if (registered.length) {
          _this.listeners.forEach(function(listener) {
            return listener("registered", registered.map(function(s) {
              return s.self;
            }));
          });
        }
      };
      while (queue.length > 0) {
        var state = queue.shift();
        var name_1 = state.name;
        var result = builder.build(state);
        var orphanIdx = orphans.indexOf(state);
        if (result) {
          var existingState = getState(name_1);
          if (existingState && existingState.name === name_1) {
            throw new Error("State '".concat(name_1, "' is already defined"));
          }
          var existingFutureState = getState(name_1 + ".**");
          if (existingFutureState) {
            this.router.stateRegistry.deregister(existingFutureState);
          }
          states[name_1] = state;
          this.attachRoute(state);
          if (orphanIdx >= 0)
            orphans.splice(orphanIdx, 1);
          registered.push(state);
          continue;
        }
        var prev = previousQueueLength[name_1];
        previousQueueLength[name_1] = queue.length;
        if (orphanIdx >= 0 && prev === queue.length) {
          queue.push(state);
          notifyListeners();
          return states;
        } else if (orphanIdx < 0) {
          orphans.push(state);
        }
        queue.push(state);
      }
      notifyListeners();
      return states;
    };
    StateQueueManager2.prototype.attachRoute = function(state) {
      if (state.abstract || !state.url)
        return;
      var rulesApi = this.router.urlService.rules;
      rulesApi.rule(rulesApi.urlRuleFactory.create(state));
    };
    return StateQueueManager2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateRegistry.js
var StateRegistry = (
  /** @class */
  (function() {
    function StateRegistry2(router2) {
      this.router = router2;
      this.states = {};
      this.listeners = [];
      this.matcher = new StateMatcher(this.states);
      this.builder = new StateBuilder(this.matcher, router2.urlMatcherFactory);
      this.stateQueue = new StateQueueManager(router2, this.states, this.builder, this.listeners);
      this._registerRoot();
    }
    StateRegistry2.prototype._registerRoot = function() {
      var rootStateDef = {
        name: "",
        url: "^",
        views: null,
        params: {
          "#": { value: null, type: "hash", dynamic: true }
        },
        abstract: true
      };
      var _root = this._root = this.stateQueue.register(rootStateDef);
      _root.navigable = null;
    };
    StateRegistry2.prototype.dispose = function() {
      var _this = this;
      this.stateQueue.dispose();
      this.listeners = [];
      this.get().forEach(function(state) {
        return _this.get(state) && _this.deregister(state);
      });
    };
    StateRegistry2.prototype.onStatesChanged = function(listener) {
      this.listeners.push(listener);
      return function deregisterListener() {
        removeFrom(this.listeners)(listener);
      }.bind(this);
    };
    StateRegistry2.prototype.root = function() {
      return this._root;
    };
    StateRegistry2.prototype.register = function(stateDefinition) {
      return this.stateQueue.register(stateDefinition);
    };
    StateRegistry2.prototype._deregisterTree = function(state) {
      var _this = this;
      var all2 = this.get().map(function(s) {
        return s.$$state();
      });
      var getChildren = function(states) {
        var _children = all2.filter(function(s) {
          return states.indexOf(s.parent) !== -1;
        });
        return _children.length === 0 ? _children : _children.concat(getChildren(_children));
      };
      var children = getChildren([state]);
      var deregistered = [state].concat(children).reverse();
      deregistered.forEach(function(_state) {
        var rulesApi = _this.router.urlService.rules;
        rulesApi.rules().filter(propEq("state", _state)).forEach(function(rule) {
          return rulesApi.removeRule(rule);
        });
        delete _this.states[_state.name];
      });
      return deregistered;
    };
    StateRegistry2.prototype.deregister = function(stateOrName) {
      var _state = this.get(stateOrName);
      if (!_state)
        throw new Error("Can't deregister state; not found: " + stateOrName);
      var deregisteredStates = this._deregisterTree(_state.$$state());
      this.listeners.forEach(function(listener) {
        return listener("deregistered", deregisteredStates.map(function(s) {
          return s.self;
        }));
      });
      return deregisteredStates;
    };
    StateRegistry2.prototype.get = function(stateOrName, base) {
      var _this = this;
      if (arguments.length === 0)
        return Object.keys(this.states).map(function(name) {
          return _this.states[name].self;
        });
      var found = this.matcher.find(stateOrName, base);
      return found && found.self || null;
    };
    StateRegistry2.prototype.decorator = function(property, builderFunction) {
      return this.builder.builder(property, builderFunction);
    };
    return StateRegistry2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/interface.js
var TransitionHookPhase;
(function(TransitionHookPhase2) {
  TransitionHookPhase2[TransitionHookPhase2["CREATE"] = 0] = "CREATE";
  TransitionHookPhase2[TransitionHookPhase2["BEFORE"] = 1] = "BEFORE";
  TransitionHookPhase2[TransitionHookPhase2["RUN"] = 2] = "RUN";
  TransitionHookPhase2[TransitionHookPhase2["SUCCESS"] = 3] = "SUCCESS";
  TransitionHookPhase2[TransitionHookPhase2["ERROR"] = 4] = "ERROR";
})(TransitionHookPhase || (TransitionHookPhase = {}));
var TransitionHookScope;
(function(TransitionHookScope2) {
  TransitionHookScope2[TransitionHookScope2["TRANSITION"] = 0] = "TRANSITION";
  TransitionHookScope2[TransitionHookScope2["STATE"] = 1] = "STATE";
})(TransitionHookScope || (TransitionHookScope = {}));

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/transitionHook.js
var defaultOptions = {
  current: noop,
  transition: null,
  traceData: {},
  bind: null
};
var TransitionHook = (
  /** @class */
  (function() {
    function TransitionHook2(transition, stateContext2, registeredHook, options) {
      var _this = this;
      this.transition = transition;
      this.stateContext = stateContext2;
      this.registeredHook = registeredHook;
      this.options = options;
      this.isSuperseded = function() {
        return _this.type.hookPhase === TransitionHookPhase.RUN && !_this.options.transition.isActive();
      };
      this.options = defaults(options, defaultOptions);
      this.type = registeredHook.eventType;
    }
    TransitionHook2.chain = function(hooks, waitFor) {
      var createHookChainR = function(prev, nextHook) {
        return prev.then(function() {
          return nextHook.invokeHook();
        });
      };
      return hooks.reduce(createHookChainR, waitFor || services.$q.when());
    };
    TransitionHook2.invokeHooks = function(hooks, doneCallback) {
      for (var idx = 0; idx < hooks.length; idx++) {
        var hookResult = hooks[idx].invokeHook();
        if (isPromise(hookResult)) {
          var remainingHooks = hooks.slice(idx + 1);
          return TransitionHook2.chain(remainingHooks, hookResult).then(doneCallback);
        }
      }
      return doneCallback();
    };
    TransitionHook2.runAllHooks = function(hooks) {
      hooks.forEach(function(hook) {
        return hook.invokeHook();
      });
    };
    TransitionHook2.prototype.logError = function(err) {
      this.transition.router.stateService.defaultErrorHandler()(err);
    };
    TransitionHook2.prototype.invokeHook = function() {
      var _this = this;
      var hook = this.registeredHook;
      if (hook._deregistered)
        return;
      var notCurrent = this.getNotCurrentRejection();
      if (notCurrent)
        return notCurrent;
      var options = this.options;
      trace.traceHookInvocation(this, this.transition, options);
      var invokeCallback = function() {
        return hook.callback.call(options.bind, _this.transition, _this.stateContext);
      };
      var normalizeErr = function(err) {
        return Rejection.normalize(err).toPromise();
      };
      var handleError = function(err) {
        return hook.eventType.getErrorHandler(_this)(err);
      };
      var handleResult = function(result2) {
        return hook.eventType.getResultHandler(_this)(result2);
      };
      try {
        var result = invokeCallback();
        if (!this.type.synchronous && isPromise(result)) {
          return result.catch(normalizeErr).then(handleResult, handleError);
        } else {
          return handleResult(result);
        }
      } catch (err) {
        return handleError(Rejection.normalize(err));
      } finally {
        if (hook.invokeLimit && ++hook.invokeCount >= hook.invokeLimit) {
          hook.deregister();
        }
      }
    };
    TransitionHook2.prototype.handleHookResult = function(result) {
      var _this = this;
      var notCurrent = this.getNotCurrentRejection();
      if (notCurrent)
        return notCurrent;
      if (isPromise(result)) {
        return result.then(function(val2) {
          return _this.handleHookResult(val2);
        });
      }
      trace.traceHookResult(result, this.transition, this.options);
      if (result === false) {
        return Rejection.aborted("Hook aborted transition").toPromise();
      }
      var isTargetState = is(TargetState);
      if (isTargetState(result)) {
        return Rejection.redirected(result).toPromise();
      }
    };
    TransitionHook2.prototype.getNotCurrentRejection = function() {
      var router2 = this.transition.router;
      if (router2._disposed) {
        return Rejection.aborted("UIRouter instance #".concat(router2.$id, " has been stopped (disposed)")).toPromise();
      }
      if (this.transition._aborted) {
        return Rejection.aborted().toPromise();
      }
      if (this.isSuperseded()) {
        return Rejection.superseded(this.options.current()).toPromise();
      }
    };
    TransitionHook2.prototype.toString = function() {
      var _a = this, options = _a.options, registeredHook = _a.registeredHook;
      var event = parse("traceData.hookType")(options) || "internal", context = parse("traceData.context.state.name")(options) || parse("traceData.context")(options) || "unknown", name = fnToString(registeredHook.callback);
      return "".concat(event, " context: ").concat(context, ", ").concat(maxLength(200, name));
    };
    TransitionHook2.HANDLE_RESULT = function(hook) {
      return function(result) {
        return hook.handleHookResult(result);
      };
    };
    TransitionHook2.LOG_REJECTED_RESULT = function(hook) {
      return function(result) {
        isPromise(result) && result.catch(function(err) {
          return hook.logError(Rejection.normalize(err));
        });
        return void 0;
      };
    };
    TransitionHook2.LOG_ERROR = function(hook) {
      return function(error) {
        return hook.logError(error);
      };
    };
    TransitionHook2.REJECT_ERROR = function(hook) {
      return function(error) {
        return silentRejection(error);
      };
    };
    TransitionHook2.THROW_ERROR = function(hook) {
      return function(error) {
        throw error;
      };
    };
    return TransitionHook2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/hookRegistry.js
function matchState(state, criterion, transition) {
  var toMatch = isString(criterion) ? [criterion] : criterion;
  function matchGlobs(_state) {
    var globStrings = toMatch;
    for (var i = 0; i < globStrings.length; i++) {
      var glob = new Glob(globStrings[i]);
      if (glob && glob.matches(_state.name) || !glob && globStrings[i] === _state.name) {
        return true;
      }
    }
    return false;
  }
  var matchFn = isFunction(toMatch) ? toMatch : matchGlobs;
  return !!matchFn(state, transition);
}
var RegisteredHook = (
  /** @class */
  (function() {
    function RegisteredHook2(tranSvc, eventType, callback, matchCriteria, removeHookFromRegistry, options) {
      if (options === void 0) {
        options = {};
      }
      this.tranSvc = tranSvc;
      this.eventType = eventType;
      this.callback = callback;
      this.matchCriteria = matchCriteria;
      this.removeHookFromRegistry = removeHookFromRegistry;
      this.invokeCount = 0;
      this._deregistered = false;
      this.priority = options.priority || 0;
      this.bind = options.bind || null;
      this.invokeLimit = options.invokeLimit;
    }
    RegisteredHook2.prototype._matchingNodes = function(nodes, criterion, transition) {
      if (criterion === true)
        return nodes;
      var matching = nodes.filter(function(node) {
        return matchState(node.state, criterion, transition);
      });
      return matching.length ? matching : null;
    };
    RegisteredHook2.prototype._getDefaultMatchCriteria = function() {
      return mapObj(this.tranSvc._pluginapi._getPathTypes(), function() {
        return true;
      });
    };
    RegisteredHook2.prototype._getMatchingNodes = function(treeChanges, transition) {
      var _this = this;
      var criteria = extend(this._getDefaultMatchCriteria(), this.matchCriteria);
      var paths = values(this.tranSvc._pluginapi._getPathTypes());
      return paths.reduce(function(mn, pathtype) {
        var isStateHook = pathtype.scope === TransitionHookScope.STATE;
        var path = treeChanges[pathtype.name] || [];
        var nodes = isStateHook ? path : [tail(path)];
        mn[pathtype.name] = _this._matchingNodes(nodes, criteria[pathtype.name], transition);
        return mn;
      }, {});
    };
    RegisteredHook2.prototype.matches = function(treeChanges, transition) {
      var matches = this._getMatchingNodes(treeChanges, transition);
      var allMatched = values(matches).every(identity);
      return allMatched ? matches : null;
    };
    RegisteredHook2.prototype.deregister = function() {
      this.removeHookFromRegistry(this);
      this._deregistered = true;
    };
    return RegisteredHook2;
  })()
);
function makeEvent(registry, transitionService, eventType) {
  var _registeredHooks = registry._registeredHooks = registry._registeredHooks || {};
  var hooks = _registeredHooks[eventType.name] = [];
  var removeHookFn = removeFrom(hooks);
  registry[eventType.name] = hookRegistrationFn;
  function hookRegistrationFn(matchObject, callback, options) {
    if (options === void 0) {
      options = {};
    }
    var registeredHook = new RegisteredHook(transitionService, eventType, callback, matchObject, removeHookFn, options);
    hooks.push(registeredHook);
    return registeredHook.deregister.bind(registeredHook);
  }
  return hookRegistrationFn;
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/hookBuilder.js
var HookBuilder = (
  /** @class */
  (function() {
    function HookBuilder2(transition) {
      this.transition = transition;
    }
    HookBuilder2.prototype.buildHooksForPhase = function(phase) {
      var _this = this;
      var $transitions = this.transition.router.transitionService;
      return $transitions._pluginapi._getEvents(phase).map(function(type) {
        return _this.buildHooks(type);
      }).reduce(unnestR, []).filter(identity);
    };
    HookBuilder2.prototype.buildHooks = function(hookType) {
      var transition = this.transition;
      var treeChanges = transition.treeChanges();
      var matchingHooks = this.getMatchingHooks(hookType, treeChanges, transition);
      if (!matchingHooks)
        return [];
      var baseHookOptions = {
        transition,
        current: transition.options().current
      };
      var makeTransitionHooks = function(hook) {
        var matches = hook.matches(treeChanges, transition);
        var matchingNodes = matches[hookType.criteriaMatchPath.name];
        return matchingNodes.map(function(node) {
          var _options = extend({
            bind: hook.bind,
            traceData: { hookType: hookType.name, context: node }
          }, baseHookOptions);
          var state = hookType.criteriaMatchPath.scope === TransitionHookScope.STATE ? node.state.self : null;
          var transitionHook = new TransitionHook(transition, state, hook, _options);
          return { hook, node, transitionHook };
        });
      };
      return matchingHooks.map(makeTransitionHooks).reduce(unnestR, []).sort(tupleSort(hookType.reverseSort)).map(function(tuple) {
        return tuple.transitionHook;
      });
    };
    HookBuilder2.prototype.getMatchingHooks = function(hookType, treeChanges, transition) {
      var isCreate = hookType.hookPhase === TransitionHookPhase.CREATE;
      var $transitions = this.transition.router.transitionService;
      var registries = isCreate ? [$transitions] : [this.transition, $transitions];
      return registries.map(function(reg) {
        return reg.getHooks(hookType.name);
      }).filter(assertPredicate(isArray, "broken event named: ".concat(hookType.name))).reduce(unnestR, []).filter(function(hook) {
        return hook.matches(treeChanges, transition);
      });
    };
    return HookBuilder2;
  })()
);
function tupleSort(reverseDepthSort) {
  if (reverseDepthSort === void 0) {
    reverseDepthSort = false;
  }
  return function nodeDepthThenPriority(l, r) {
    var factor = reverseDepthSort ? -1 : 1;
    var depthDelta = (l.node.state.path.length - r.node.state.path.length) * factor;
    return depthDelta !== 0 ? depthDelta : r.hook.priority - l.hook.priority;
  };
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/transition.js
var stateSelf = prop("self");
var Transition = (
  /** @class */
  (function() {
    function Transition2(fromPath, targetState, router2) {
      var _this = this;
      this._deferred = services.$q.defer();
      this.promise = this._deferred.promise;
      this._registeredHooks = {};
      this._hookBuilder = new HookBuilder(this);
      this.isActive = function() {
        return _this.router.globals.transition === _this;
      };
      this.router = router2;
      this._targetState = targetState;
      if (!targetState.valid()) {
        throw new Error(targetState.error());
      }
      this._options = extend({ current: val(this) }, targetState.options());
      this.$id = router2.transitionService._transitionCount++;
      var toPath = PathUtils.buildToPath(fromPath, targetState);
      this._treeChanges = PathUtils.treeChanges(fromPath, toPath, this._options.reloadState);
      this.createTransitionHookRegFns();
      var onCreateHooks = this._hookBuilder.buildHooksForPhase(TransitionHookPhase.CREATE);
      TransitionHook.invokeHooks(onCreateHooks, function() {
        return null;
      });
      this.applyViewConfigs(router2);
    }
    Transition2.prototype.onBefore = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onStart = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onExit = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onRetain = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onEnter = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onFinish = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onSuccess = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.onError = function(criteria, callback, options) {
      return;
    };
    Transition2.prototype.createTransitionHookRegFns = function() {
      var _this = this;
      this.router.transitionService._pluginapi._getEvents().filter(function(type) {
        return type.hookPhase !== TransitionHookPhase.CREATE;
      }).forEach(function(type) {
        return makeEvent(_this, _this.router.transitionService, type);
      });
    };
    Transition2.prototype.getHooks = function(hookName) {
      return this._registeredHooks[hookName];
    };
    Transition2.prototype.applyViewConfigs = function(router2) {
      var enteringStates = this._treeChanges.entering.map(function(node) {
        return node.state;
      });
      PathUtils.applyViewConfigs(router2.transitionService.$view, this._treeChanges.to, enteringStates);
    };
    Transition2.prototype.$from = function() {
      return tail(this._treeChanges.from).state;
    };
    Transition2.prototype.$to = function() {
      return tail(this._treeChanges.to).state;
    };
    Transition2.prototype.from = function() {
      return this.$from().self;
    };
    Transition2.prototype.to = function() {
      return this.$to().self;
    };
    Transition2.prototype.targetState = function() {
      return this._targetState;
    };
    Transition2.prototype.is = function(compare) {
      if (compare instanceof Transition2) {
        return this.is({ to: compare.$to().name, from: compare.$from().name });
      }
      return !(compare.to && !matchState(this.$to(), compare.to, this) || compare.from && !matchState(this.$from(), compare.from, this));
    };
    Transition2.prototype.params = function(pathname) {
      if (pathname === void 0) {
        pathname = "to";
      }
      return Object.freeze(this._treeChanges[pathname].map(prop("paramValues")).reduce(mergeR, {}));
    };
    Transition2.prototype.paramsChanged = function() {
      var fromParams = this.params("from");
      var toParams = this.params("to");
      var allParamDescriptors = [].concat(this._treeChanges.to).concat(this._treeChanges.from).map(function(pathNode) {
        return pathNode.paramSchema;
      }).reduce(flattenR, []).reduce(uniqR, []);
      var changedParamDescriptors = Param.changed(allParamDescriptors, fromParams, toParams);
      return changedParamDescriptors.reduce(function(changedValues, descriptor) {
        changedValues[descriptor.id] = toParams[descriptor.id];
        return changedValues;
      }, {});
    };
    Transition2.prototype.injector = function(state, pathName) {
      if (pathName === void 0) {
        pathName = "to";
      }
      var path = this._treeChanges[pathName];
      if (state)
        path = PathUtils.subPath(path, function(node) {
          return node.state === state || node.state.name === state;
        });
      return new ResolveContext(path).injector();
    };
    Transition2.prototype.getResolveTokens = function(pathname) {
      if (pathname === void 0) {
        pathname = "to";
      }
      return new ResolveContext(this._treeChanges[pathname]).getTokens();
    };
    Transition2.prototype.addResolvable = function(resolvable, state) {
      if (state === void 0) {
        state = "";
      }
      resolvable = is(Resolvable)(resolvable) ? resolvable : new Resolvable(resolvable);
      var stateName = typeof state === "string" ? state : state.name;
      var topath = this._treeChanges.to;
      var targetNode = find(topath, function(node) {
        return node.state.name === stateName;
      });
      var resolveContext = new ResolveContext(topath);
      resolveContext.addResolvables([resolvable], targetNode.state);
    };
    Transition2.prototype.redirectedFrom = function() {
      return this._options.redirectedFrom || null;
    };
    Transition2.prototype.originalTransition = function() {
      var rf = this.redirectedFrom();
      return rf && rf.originalTransition() || this;
    };
    Transition2.prototype.options = function() {
      return this._options;
    };
    Transition2.prototype.entering = function() {
      return map2(this._treeChanges.entering, prop("state")).map(stateSelf);
    };
    Transition2.prototype.exiting = function() {
      return map2(this._treeChanges.exiting, prop("state")).map(stateSelf).reverse();
    };
    Transition2.prototype.retained = function() {
      return map2(this._treeChanges.retained, prop("state")).map(stateSelf);
    };
    Transition2.prototype.views = function(pathname, state) {
      if (pathname === void 0) {
        pathname = "entering";
      }
      var path = this._treeChanges[pathname];
      path = !state ? path : path.filter(propEq("state", state));
      return path.map(prop("views")).filter(identity).reduce(unnestR, []);
    };
    Transition2.prototype.treeChanges = function(pathname) {
      return pathname ? this._treeChanges[pathname] : this._treeChanges;
    };
    Transition2.prototype.redirect = function(targetState) {
      var redirects = 1, trans = this;
      while ((trans = trans.redirectedFrom()) != null) {
        if (++redirects > 20)
          throw new Error("Too many consecutive Transition redirects (20+)");
      }
      var redirectOpts = { redirectedFrom: this, source: "redirect" };
      if (this.options().source === "url" && targetState.options().location !== false) {
        redirectOpts.location = "replace";
      }
      var newOptions = extend({}, this.options(), targetState.options(), redirectOpts);
      targetState = targetState.withOptions(newOptions, true);
      var newTransition = this.router.transitionService.create(this._treeChanges.from, targetState);
      var originalEnteringNodes = this._treeChanges.entering;
      var redirectEnteringNodes = newTransition._treeChanges.entering;
      var nodeIsReloading = function(reloadState) {
        return function(node) {
          return reloadState && node.state.includes[reloadState.name];
        };
      };
      var matchingEnteringNodes = PathUtils.matching(redirectEnteringNodes, originalEnteringNodes, PathUtils.nonDynamicParams).filter(not(nodeIsReloading(targetState.options().reloadState)));
      matchingEnteringNodes.forEach(function(node, idx) {
        node.resolvables = originalEnteringNodes[idx].resolvables;
      });
      return newTransition;
    };
    Transition2.prototype._changedParams = function() {
      var tc = this._treeChanges;
      if (this._options.reload)
        return void 0;
      if (tc.exiting.length || tc.entering.length)
        return void 0;
      if (tc.to.length !== tc.from.length)
        return void 0;
      var pathsDiffer = arrayTuples(tc.to, tc.from).map(function(tuple) {
        return tuple[0].state !== tuple[1].state;
      }).reduce(anyTrueR, false);
      if (pathsDiffer)
        return void 0;
      var nodeSchemas = tc.to.map(function(node) {
        return node.paramSchema;
      });
      var _a = [tc.to, tc.from].map(function(path) {
        return path.map(function(x) {
          return x.paramValues;
        });
      }), toValues = _a[0], fromValues = _a[1];
      var tuples = arrayTuples(nodeSchemas, toValues, fromValues);
      return tuples.map(function(_a2) {
        var schema = _a2[0], toVals = _a2[1], fromVals = _a2[2];
        return Param.changed(schema, toVals, fromVals);
      }).reduce(unnestR, []);
    };
    Transition2.prototype.dynamic = function() {
      var changes = this._changedParams();
      return !changes ? false : changes.map(function(x) {
        return x.dynamic;
      }).reduce(anyTrueR, false);
    };
    Transition2.prototype.ignored = function() {
      return !!this._ignoredReason();
    };
    Transition2.prototype._ignoredReason = function() {
      var pending = this.router.globals.transition;
      var reloadState = this._options.reloadState;
      var same = function(pathA, pathB) {
        if (pathA.length !== pathB.length)
          return false;
        var matching = PathUtils.matching(pathA, pathB);
        return pathA.length === matching.filter(function(node) {
          return !reloadState || !node.state.includes[reloadState.name];
        }).length;
      };
      var newTC = this.treeChanges();
      var pendTC = pending && pending.treeChanges();
      if (pendTC && same(pendTC.to, newTC.to) && same(pendTC.exiting, newTC.exiting))
        return "SameAsPending";
      if (newTC.exiting.length === 0 && newTC.entering.length === 0 && same(newTC.from, newTC.to))
        return "SameAsCurrent";
    };
    Transition2.prototype.run = function() {
      var _this = this;
      var runAllHooks = TransitionHook.runAllHooks;
      var getHooksFor = function(phase) {
        return _this._hookBuilder.buildHooksForPhase(phase);
      };
      var transitionSuccess = function() {
        trace.traceSuccess(_this.$to(), _this);
        _this.success = true;
        _this._deferred.resolve(_this.to());
        runAllHooks(getHooksFor(TransitionHookPhase.SUCCESS));
      };
      var transitionError = function(reason) {
        trace.traceError(reason, _this);
        _this.success = false;
        _this._deferred.reject(reason);
        _this._error = reason;
        runAllHooks(getHooksFor(TransitionHookPhase.ERROR));
      };
      var runTransition = function() {
        var allRunHooks = getHooksFor(TransitionHookPhase.RUN);
        var done = function() {
          return services.$q.when(void 0);
        };
        return TransitionHook.invokeHooks(allRunHooks, done);
      };
      var startTransition = function() {
        var globals = _this.router.globals;
        globals.lastStartedTransitionId = _this.$id;
        globals.transition = _this;
        globals.transitionHistory.enqueue(_this);
        trace.traceTransitionStart(_this);
        return services.$q.when(void 0);
      };
      var allBeforeHooks = getHooksFor(TransitionHookPhase.BEFORE);
      TransitionHook.invokeHooks(allBeforeHooks, startTransition).then(runTransition).then(transitionSuccess, transitionError);
      return this.promise;
    };
    Transition2.prototype.valid = function() {
      return !this.error() || this.success !== void 0;
    };
    Transition2.prototype.abort = function() {
      if (isUndefined(this.success)) {
        this._aborted = true;
      }
    };
    Transition2.prototype.error = function() {
      var state = this.$to();
      if (state.self.abstract) {
        return Rejection.invalid("Cannot transition to abstract state '".concat(state.name, "'"));
      }
      var paramDefs = state.parameters();
      var values2 = this.params();
      var invalidParams = paramDefs.filter(function(param) {
        return !param.validates(values2[param.id]);
      });
      if (invalidParams.length) {
        var invalidValues = invalidParams.map(function(param) {
          return "[".concat(param.id, ":").concat(stringify(values2[param.id]), "]");
        }).join(", ");
        var detail = "The following parameter values are not valid for state '".concat(state.name, "': ").concat(invalidValues);
        return Rejection.invalid(detail);
      }
      if (this.success === false)
        return this._error;
    };
    Transition2.prototype.toString = function() {
      var fromStateOrName = this.from();
      var toStateOrName = this.to();
      var avoidEmptyHash = function(params) {
        return params["#"] !== null && params["#"] !== void 0 ? params : omit(params, ["#"]);
      };
      var id3 = this.$id, from2 = isObject(fromStateOrName) ? fromStateOrName.name : fromStateOrName, fromParams = stringify(avoidEmptyHash(this._treeChanges.from.map(prop("paramValues")).reduce(mergeR, {}))), toValid = this.valid() ? "" : "(X) ", to = isObject(toStateOrName) ? toStateOrName.name : toStateOrName, toParams = stringify(avoidEmptyHash(this.params()));
      return "Transition#".concat(id3, "( '").concat(from2, "'").concat(fromParams, " -> ").concat(toValid, "'").concat(to, "'").concat(toParams, " )");
    };
    Transition2.diToken = Transition2;
    return Transition2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlMatcher.js
function quoteRegExp(str, param) {
  var surroundPattern = ["", ""], result = str.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
  if (!param)
    return result;
  switch (param.squash) {
    case false:
      surroundPattern = ["(", ")" + (param.isOptional ? "?" : "")];
      break;
    case true:
      result = result.replace(/\/$/, "");
      surroundPattern = ["(?:/(", ")|/)?"];
      break;
    default:
      surroundPattern = ["(".concat(param.squash, "|"), ")?"];
      break;
  }
  return result + surroundPattern[0] + param.type.pattern.source + surroundPattern[1];
}
var memoizeTo = function(obj, _prop, fn) {
  return obj[_prop] = obj[_prop] || fn();
};
var splitOnSlash = splitOnDelim("/");
var defaultConfig = {
  state: { params: {} },
  strict: true,
  caseInsensitive: true,
  decodeParams: true
};
var UrlMatcher = (
  /** @class */
  (function() {
    function UrlMatcher2(pattern2, paramTypes, paramFactory, config) {
      var _this = this;
      this._cache = { path: [this] };
      this._children = [];
      this._params = [];
      this._segments = [];
      this._compiled = [];
      this.config = config = defaults(config, defaultConfig);
      this.pattern = pattern2;
      var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:(?=(\s*))\4((?:[^{}\\]|\\.|\{(?:[^{}\\]|\\.)*\})+))?\}/g;
      var searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:(?=(\s*))\4((?:[^{}\\]|\\.|\{(?:[^{}\\]|\\.)*\})+))?\}/g;
      var patterns = [];
      var last = 0;
      var matchArray;
      var checkParamErrors = function(id3) {
        if (!UrlMatcher2.nameValidator.test(id3))
          throw new Error("Invalid parameter name '".concat(id3, "' in pattern '").concat(pattern2, "'"));
        if (find(_this._params, propEq("id", id3)))
          throw new Error("Duplicate parameter name '".concat(id3, "' in pattern '").concat(pattern2, "'"));
      };
      var matchDetails = function(m, isSearch) {
        var id3 = m[2] || m[3];
        var regexp = isSearch ? m[5] : m[5] || (m[1] === "*" ? "[\\s\\S]*" : null);
        var makeRegexpType = function(str) {
          return inherit(paramTypes.type(isSearch ? "query" : "path"), {
            pattern: new RegExp(str, _this.config.caseInsensitive ? "i" : void 0)
          });
        };
        return {
          id: id3,
          regexp,
          segment: pattern2.substring(last, m.index),
          type: !regexp ? null : paramTypes.type(regexp) || makeRegexpType(regexp)
        };
      };
      var details;
      var segment;
      while (matchArray = placeholder.exec(pattern2)) {
        details = matchDetails(matchArray, false);
        if (details.segment.indexOf("?") >= 0)
          break;
        checkParamErrors(details.id);
        this._params.push(paramFactory.fromPath(details.id, details.type, config.state));
        this._segments.push(details.segment);
        patterns.push([details.segment, tail(this._params)]);
        last = placeholder.lastIndex;
      }
      segment = pattern2.substring(last);
      var i = segment.indexOf("?");
      if (i >= 0) {
        var search = segment.substring(i);
        segment = segment.substring(0, i);
        if (search.length > 0) {
          last = 0;
          while (matchArray = searchPlaceholder.exec(search)) {
            details = matchDetails(matchArray, true);
            checkParamErrors(details.id);
            this._params.push(paramFactory.fromSearch(details.id, details.type, config.state));
            last = placeholder.lastIndex;
          }
        }
      }
      this._segments.push(segment);
      this._compiled = patterns.map(function(_pattern) {
        return quoteRegExp.apply(null, _pattern);
      }).concat(quoteRegExp(segment));
    }
    UrlMatcher2.encodeDashes = function(str) {
      return encodeURIComponent(str).replace(/-/g, function(c) {
        return "%5C%".concat(c.charCodeAt(0).toString(16).toUpperCase());
      });
    };
    UrlMatcher2.pathSegmentsAndParams = function(matcher) {
      var staticSegments = matcher._segments;
      var pathParams = matcher._params.filter(function(p) {
        return p.location === DefType.PATH;
      });
      return arrayTuples(staticSegments, pathParams.concat(void 0)).reduce(unnestR, []).filter(function(x) {
        return x !== "" && isDefined(x);
      });
    };
    UrlMatcher2.queryParams = function(matcher) {
      return matcher._params.filter(function(p) {
        return p.location === DefType.SEARCH;
      });
    };
    UrlMatcher2.compare = function(a, b) {
      var segments = function(matcher) {
        return matcher._cache.segments = matcher._cache.segments || matcher._cache.path.map(UrlMatcher2.pathSegmentsAndParams).reduce(unnestR, []).reduce(joinNeighborsR, []).map(function(x) {
          return isString(x) ? splitOnSlash(x) : x;
        }).reduce(unnestR, []);
      };
      var weights = function(matcher) {
        return matcher._cache.weights = matcher._cache.weights || segments(matcher).map(function(segment) {
          if (segment === "/")
            return 1;
          if (isString(segment))
            return 2;
          if (segment instanceof Param)
            return 3;
        });
      };
      var padArrays = function(l, r, padVal) {
        var len = Math.max(l.length, r.length);
        while (l.length < len)
          l.push(padVal);
        while (r.length < len)
          r.push(padVal);
      };
      var weightsA = weights(a), weightsB = weights(b);
      padArrays(weightsA, weightsB, 0);
      var _pairs = arrayTuples(weightsA, weightsB);
      var cmp, i;
      for (i = 0; i < _pairs.length; i++) {
        cmp = _pairs[i][0] - _pairs[i][1];
        if (cmp !== 0)
          return cmp;
      }
      return 0;
    };
    UrlMatcher2.prototype.append = function(url) {
      this._children.push(url);
      url._cache = {
        path: this._cache.path.concat(url),
        parent: this,
        pattern: null
      };
      return url;
    };
    UrlMatcher2.prototype.isRoot = function() {
      return this._cache.path[0] === this;
    };
    UrlMatcher2.prototype.toString = function() {
      return this.pattern;
    };
    UrlMatcher2.prototype._getDecodedParamValue = function(value, param) {
      if (isDefined(value)) {
        if (this.config.decodeParams && !param.type.raw) {
          if (isArray(value)) {
            value = value.map(function(paramValue) {
              return decodeURIComponent(paramValue);
            });
          } else {
            value = decodeURIComponent(value);
          }
        }
        value = param.type.decode(value);
      }
      return param.value(value);
    };
    UrlMatcher2.prototype.exec = function(path, search, hash, options) {
      var _this = this;
      if (search === void 0) {
        search = {};
      }
      if (options === void 0) {
        options = {};
      }
      var match = memoizeTo(this._cache, "pattern", function() {
        return new RegExp([
          "^",
          unnest(_this._cache.path.map(prop("_compiled"))).join(""),
          _this.config.strict === false ? "/?" : "",
          "$"
        ].join(""), _this.config.caseInsensitive ? "i" : void 0);
      }).exec(path);
      if (!match)
        return null;
      var allParams = this.parameters(), pathParams = allParams.filter(function(param2) {
        return !param2.isSearch();
      }), searchParams = allParams.filter(function(param2) {
        return param2.isSearch();
      }), nPathSegments = this._cache.path.map(function(urlm) {
        return urlm._segments.length - 1;
      }).reduce(function(a, x) {
        return a + x;
      }), values2 = {};
      if (nPathSegments !== match.length - 1)
        throw new Error("Unbalanced capture group in route '".concat(this.pattern, "'"));
      function decodePathArray(paramVal) {
        var reverseString = function(str) {
          return str.split("").reverse().join("");
        };
        var unquoteDashes = function(str) {
          return str.replace(/\\-/g, "-");
        };
        var split = reverseString(paramVal).split(/-(?!\\)/);
        var allReversed = map2(split, reverseString);
        return map2(allReversed, unquoteDashes).reverse();
      }
      for (var i = 0; i < nPathSegments; i++) {
        var param = pathParams[i];
        var value = match[i + 1];
        for (var j = 0; j < param.replace.length; j++) {
          if (param.replace[j].from === value)
            value = param.replace[j].to;
        }
        if (value && param.array === true)
          value = decodePathArray(value);
        values2[param.id] = this._getDecodedParamValue(value, param);
      }
      searchParams.forEach(function(param2) {
        var value2 = search[param2.id];
        for (var j2 = 0; j2 < param2.replace.length; j2++) {
          if (param2.replace[j2].from === value2)
            value2 = param2.replace[j2].to;
        }
        values2[param2.id] = _this._getDecodedParamValue(value2, param2);
      });
      if (hash)
        values2["#"] = hash;
      return values2;
    };
    UrlMatcher2.prototype.parameters = function(opts) {
      if (opts === void 0) {
        opts = {};
      }
      if (opts.inherit === false)
        return this._params;
      return unnest(this._cache.path.map(function(matcher) {
        return matcher._params;
      }));
    };
    UrlMatcher2.prototype.parameter = function(id3, opts) {
      var _this = this;
      if (opts === void 0) {
        opts = {};
      }
      var findParam = function() {
        for (var _i = 0, _a = _this._params; _i < _a.length; _i++) {
          var param = _a[_i];
          if (param.id === id3)
            return param;
        }
      };
      var parent = this._cache.parent;
      return findParam() || opts.inherit !== false && parent && parent.parameter(id3, opts) || null;
    };
    UrlMatcher2.prototype.validates = function(params) {
      var validParamVal = function(param, val2) {
        return !param || param.validates(val2);
      };
      params = params || {};
      var paramSchema = this.parameters().filter(function(paramDef) {
        return params.hasOwnProperty(paramDef.id);
      });
      return paramSchema.map(function(paramDef) {
        return validParamVal(paramDef, params[paramDef.id]);
      }).reduce(allTrueR, true);
    };
    UrlMatcher2.prototype.format = function(values2) {
      if (values2 === void 0) {
        values2 = {};
      }
      var urlMatchers = this._cache.path;
      var pathSegmentsAndParams = urlMatchers.map(UrlMatcher2.pathSegmentsAndParams).reduce(unnestR, []).map(function(x) {
        return isString(x) ? x : getDetails(x);
      });
      var queryParams = urlMatchers.map(UrlMatcher2.queryParams).reduce(unnestR, []).map(getDetails);
      var isInvalid = function(param) {
        return param.isValid === false;
      };
      if (pathSegmentsAndParams.concat(queryParams).filter(isInvalid).length) {
        return null;
      }
      function getDetails(param) {
        var value = param.value(values2[param.id]);
        var isValid = param.validates(value);
        var isDefaultValue = param.isDefaultValue(value);
        var squash = isDefaultValue ? param.squash : false;
        var encoded = param.type.encode(value);
        return { param, value, isValid, isDefaultValue, squash, encoded };
      }
      var pathString = pathSegmentsAndParams.reduce(function(acc, x) {
        if (isString(x))
          return acc + x;
        var squash = x.squash, encoded = x.encoded, param = x.param;
        if (squash === true)
          return acc.match(/\/$/) ? acc.slice(0, -1) : acc;
        if (isString(squash))
          return acc + squash;
        if (squash !== false)
          return acc;
        if (encoded == null)
          return acc;
        if (isArray(encoded))
          return acc + map2(encoded, UrlMatcher2.encodeDashes).join("-");
        if (param.raw)
          return acc + encoded;
        return acc + encodeURIComponent(encoded);
      }, "");
      var queryString = queryParams.map(function(paramDetails) {
        var param = paramDetails.param, squash = paramDetails.squash, encoded = paramDetails.encoded, isDefaultValue = paramDetails.isDefaultValue;
        if (encoded == null || isDefaultValue && squash !== false)
          return;
        if (!isArray(encoded))
          encoded = [encoded];
        if (encoded.length === 0)
          return;
        if (!param.raw)
          encoded = map2(encoded, encodeURIComponent);
        return encoded.map(function(val2) {
          return "".concat(param.id, "=").concat(val2);
        });
      }).filter(identity).reduce(unnestR, []).join("&");
      return pathString + (queryString ? "?".concat(queryString) : "") + (values2["#"] ? "#" + values2["#"] : "");
    };
    UrlMatcher2.nameValidator = /^\w+([-.]+\w+)*(?:\[\])?$/;
    return UrlMatcher2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlMatcherFactory.js
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var ParamFactory = (
  /** @class */
  (function() {
    function ParamFactory2(router2) {
      this.router = router2;
    }
    ParamFactory2.prototype.fromConfig = function(id3, type, state) {
      return new Param(id3, type, DefType.CONFIG, this.router.urlService.config, state);
    };
    ParamFactory2.prototype.fromPath = function(id3, type, state) {
      return new Param(id3, type, DefType.PATH, this.router.urlService.config, state);
    };
    ParamFactory2.prototype.fromSearch = function(id3, type, state) {
      return new Param(id3, type, DefType.SEARCH, this.router.urlService.config, state);
    };
    return ParamFactory2;
  })()
);
var UrlMatcherFactory = (
  /** @class */
  (function() {
    function UrlMatcherFactory2(router2) {
      var _this = this;
      this.router = router2;
      this.paramFactory = new ParamFactory(this.router);
      this.UrlMatcher = UrlMatcher;
      this.Param = Param;
      this.caseInsensitive = function(value) {
        return _this.router.urlService.config.caseInsensitive(value);
      };
      this.defaultSquashPolicy = function(value) {
        return _this.router.urlService.config.defaultSquashPolicy(value);
      };
      this.strictMode = function(value) {
        return _this.router.urlService.config.strictMode(value);
      };
      this.type = function(name, definition, definitionFn) {
        return _this.router.urlService.config.type(name, definition, definitionFn) || _this;
      };
    }
    UrlMatcherFactory2.prototype.compile = function(pattern2, config) {
      var urlConfig = this.router.urlService.config;
      var params = config && !config.state && config.params;
      config = params ? __assign({ state: { params } }, config) : config;
      var globalConfig = {
        strict: urlConfig._isStrictMode,
        caseInsensitive: urlConfig._isCaseInsensitive,
        decodeParams: urlConfig._decodeParams
      };
      return new UrlMatcher(pattern2, urlConfig.paramTypes, this.paramFactory, extend(globalConfig, config));
    };
    UrlMatcherFactory2.prototype.isMatcher = function(object) {
      if (!isObject(object))
        return false;
      var result = true;
      forEach(UrlMatcher.prototype, function(val2, name) {
        if (isFunction(val2))
          result = result && isDefined(object[name]) && isFunction(object[name]);
      });
      return result;
    };
    UrlMatcherFactory2.prototype.$get = function() {
      var urlConfig = this.router.urlService.config;
      urlConfig.paramTypes.enqueue = false;
      urlConfig.paramTypes._flushTypeQueue();
      return this;
    };
    return UrlMatcherFactory2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlRule.js
var UrlRuleFactory = (
  /** @class */
  (function() {
    function UrlRuleFactory2(router2) {
      this.router = router2;
    }
    UrlRuleFactory2.prototype.compile = function(str) {
      return this.router.urlMatcherFactory.compile(str);
    };
    UrlRuleFactory2.prototype.create = function(what, handler) {
      var _this = this;
      var isState = StateObject.isState, isStateDeclaration = StateObject.isStateDeclaration;
      var makeRule = pattern([
        [isString, function(_what) {
          return makeRule(_this.compile(_what));
        }],
        [is(UrlMatcher), function(_what) {
          return _this.fromUrlMatcher(_what, handler);
        }],
        [or(isState, isStateDeclaration), function(_what) {
          return _this.fromState(_what, _this.router);
        }],
        [is(RegExp), function(_what) {
          return _this.fromRegExp(_what, handler);
        }],
        [isFunction, function(_what) {
          return new BaseUrlRule(_what, handler);
        }]
      ]);
      var rule = makeRule(what);
      if (!rule)
        throw new Error("invalid 'what' in when()");
      return rule;
    };
    UrlRuleFactory2.prototype.fromUrlMatcher = function(urlMatcher, handler) {
      var _handler = handler;
      if (isString(handler))
        handler = this.router.urlMatcherFactory.compile(handler);
      if (is(UrlMatcher)(handler))
        _handler = function(match) {
          return handler.format(match);
        };
      function matchUrlParamters(url) {
        var params = urlMatcher.exec(url.path, url.search, url.hash);
        return urlMatcher.validates(params) && params;
      }
      function matchPriority(params) {
        var optional = urlMatcher.parameters().filter(function(param) {
          return param.isOptional;
        });
        if (!optional.length)
          return 1e-6;
        var matched = optional.filter(function(param) {
          return params[param.id];
        });
        return matched.length / optional.length;
      }
      var details = { urlMatcher, matchPriority, type: "URLMATCHER" };
      return extend(new BaseUrlRule(matchUrlParamters, _handler), details);
    };
    UrlRuleFactory2.prototype.fromState = function(stateOrDecl, router2) {
      var state = StateObject.isStateDeclaration(stateOrDecl) ? stateOrDecl.$$state() : stateOrDecl;
      var handler = function(match) {
        var $state = router2.stateService;
        var globals = router2.globals;
        if ($state.href(state, match) !== $state.href(globals.current, globals.params)) {
          $state.transitionTo(state, match, { inherit: true, source: "url" });
        }
      };
      var details = { state, type: "STATE" };
      return extend(this.fromUrlMatcher(state.url, handler), details);
    };
    UrlRuleFactory2.prototype.fromRegExp = function(regexp, handler) {
      if (regexp.global || regexp.sticky)
        throw new Error("Rule RegExp must not be global or sticky");
      var redirectUrlTo = function(match) {
        return handler.replace(/\$(\$|\d{1,2})/, function(m, what) {
          return match[what === "$" ? 0 : Number(what)];
        });
      };
      var _handler = isString(handler) ? redirectUrlTo : handler;
      var matchParamsFromRegexp = function(url) {
        return regexp.exec(url.path);
      };
      var details = { regexp, type: "REGEXP" };
      return extend(new BaseUrlRule(matchParamsFromRegexp, _handler), details);
    };
    UrlRuleFactory2.isUrlRule = function(obj) {
      return obj && ["type", "match", "handler"].every(function(key) {
        return isDefined(obj[key]);
      });
    };
    return UrlRuleFactory2;
  })()
);
var BaseUrlRule = (
  /** @class */
  /* @__PURE__ */ (function() {
    function BaseUrlRule2(match, handler) {
      var _this = this;
      this.match = match;
      this.type = "RAW";
      this.matchPriority = function(match2) {
        return 0 - _this.$id;
      };
      this.handler = handler || identity;
    }
    return BaseUrlRule2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlRouter.js
function appendBasePath(url, isHtml5, absolute, baseHref) {
  if (baseHref === "/")
    return url;
  if (isHtml5)
    return stripLastPathElement(baseHref) + url;
  if (absolute)
    return baseHref.slice(1) + url;
  return url;
}
var UrlRouter = (
  /** @class */
  (function() {
    function UrlRouter2(router2) {
      var _this = this;
      this.router = router2;
      this.sync = function(evt) {
        return _this.router.urlService.sync(evt);
      };
      this.listen = function(enabled) {
        return _this.router.urlService.listen(enabled);
      };
      this.deferIntercept = function(defer) {
        return _this.router.urlService.deferIntercept(defer);
      };
      this.match = function(urlParts) {
        return _this.router.urlService.match(urlParts);
      };
      this.initial = function(handler) {
        return _this.router.urlService.rules.initial(handler);
      };
      this.otherwise = function(handler) {
        return _this.router.urlService.rules.otherwise(handler);
      };
      this.removeRule = function(rule) {
        return _this.router.urlService.rules.removeRule(rule);
      };
      this.rule = function(rule) {
        return _this.router.urlService.rules.rule(rule);
      };
      this.rules = function() {
        return _this.router.urlService.rules.rules();
      };
      this.sort = function(compareFn) {
        return _this.router.urlService.rules.sort(compareFn);
      };
      this.when = function(matcher, handler, options) {
        return _this.router.urlService.rules.when(matcher, handler, options);
      };
      this.urlRuleFactory = new UrlRuleFactory(router2);
    }
    UrlRouter2.prototype.update = function(read) {
      var $url = this.router.locationService;
      if (read) {
        this.location = $url.url();
        return;
      }
      if ($url.url() === this.location)
        return;
      $url.url(this.location, true);
    };
    UrlRouter2.prototype.push = function(urlMatcher, params, options) {
      var replace = options && !!options.replace;
      this.router.urlService.url(urlMatcher.format(params || {}), replace);
    };
    UrlRouter2.prototype.href = function(urlMatcher, params, options) {
      var url = urlMatcher.format(params);
      if (url == null)
        return null;
      options = options || { absolute: false };
      var cfg = this.router.urlService.config;
      var isHtml5 = cfg.html5Mode();
      if (!isHtml5 && url !== null) {
        url = "#" + cfg.hashPrefix() + url;
      }
      url = appendBasePath(url, isHtml5, options.absolute, cfg.baseHref());
      if (!options.absolute || !url) {
        return url;
      }
      var slash = !isHtml5 && url ? "/" : "";
      var cfgPort = cfg.port();
      var port = cfgPort === 80 || cfgPort === 443 ? "" : ":" + cfgPort;
      return [cfg.protocol(), "://", cfg.host(), port, slash, url].join("");
    };
    Object.defineProperty(UrlRouter2.prototype, "interceptDeferred", {
      /** @deprecated use [[UrlService.interceptDeferred]]*/
      get: function() {
        return this.router.urlService.interceptDeferred;
      },
      enumerable: false,
      configurable: true
    });
    return UrlRouter2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/view/view.js
var ViewService = (
  /** @class */
  (function() {
    function ViewService2(router2) {
      var _this = this;
      this.router = router2;
      this._uiViews = [];
      this._viewConfigs = [];
      this._viewConfigFactories = {};
      this._listeners = [];
      this._pluginapi = {
        _rootViewContext: this._rootViewContext.bind(this),
        _viewConfigFactory: this._viewConfigFactory.bind(this),
        _registeredUIView: function(id3) {
          return find(_this._uiViews, function(view) {
            return "".concat(_this.router.$id, ".").concat(view.id) === id3;
          });
        },
        _registeredUIViews: function() {
          return _this._uiViews;
        },
        _activeViewConfigs: function() {
          return _this._viewConfigs;
        },
        _onSync: function(listener) {
          _this._listeners.push(listener);
          return function() {
            return removeFrom(_this._listeners, listener);
          };
        }
      };
    }
    ViewService2.normalizeUIViewTarget = function(context, rawViewName) {
      if (rawViewName === void 0) {
        rawViewName = "";
      }
      var viewAtContext = rawViewName.split("@");
      var uiViewName = viewAtContext[0] || "$default";
      var uiViewContextAnchor = isString(viewAtContext[1]) ? viewAtContext[1] : "^";
      var relativeViewNameSugar = /^(\^(?:\.\^)*)\.(.*$)/.exec(uiViewName);
      if (relativeViewNameSugar) {
        uiViewContextAnchor = relativeViewNameSugar[1];
        uiViewName = relativeViewNameSugar[2];
      }
      if (uiViewName.charAt(0) === "!") {
        uiViewName = uiViewName.substr(1);
        uiViewContextAnchor = "";
      }
      var relativeMatch = /^(\^(?:\.\^)*)$/;
      if (relativeMatch.exec(uiViewContextAnchor)) {
        var anchorState = uiViewContextAnchor.split(".").reduce(function(anchor, x) {
          return anchor.parent;
        }, context);
        uiViewContextAnchor = anchorState.name;
      } else if (uiViewContextAnchor === ".") {
        uiViewContextAnchor = context.name;
      }
      return { uiViewName, uiViewContextAnchor };
    };
    ViewService2.prototype._rootViewContext = function(context) {
      return this._rootContext = context || this._rootContext;
    };
    ViewService2.prototype._viewConfigFactory = function(viewType, factory) {
      this._viewConfigFactories[viewType] = factory;
    };
    ViewService2.prototype.createViewConfig = function(path, decl) {
      var cfgFactory = this._viewConfigFactories[decl.$type];
      if (!cfgFactory)
        throw new Error("ViewService: No view config factory registered for type " + decl.$type);
      var cfgs = cfgFactory(path, decl);
      return isArray(cfgs) ? cfgs : [cfgs];
    };
    ViewService2.prototype.deactivateViewConfig = function(viewConfig) {
      trace.traceViewServiceEvent("<- Removing", viewConfig);
      removeFrom(this._viewConfigs, viewConfig);
    };
    ViewService2.prototype.activateViewConfig = function(viewConfig) {
      trace.traceViewServiceEvent("-> Registering", viewConfig);
      this._viewConfigs.push(viewConfig);
    };
    ViewService2.prototype.sync = function() {
      var _this = this;
      var uiViewsByFqn = this._uiViews.map(function(uiv) {
        return [uiv.fqn, uiv];
      }).reduce(applyPairs, {});
      function uiViewDepth(uiView2) {
        var stateDepth = function(context) {
          return context && context.parent ? stateDepth(context.parent) + 1 : 1;
        };
        return uiView2.fqn.split(".").length * 1e4 + stateDepth(uiView2.creationContext);
      }
      function viewConfigDepth(config) {
        var context = config.viewDecl.$context, count = 0;
        while (++count && context.parent)
          context = context.parent;
        return count;
      }
      var depthCompare = curry(function(depthFn, posNeg, left, right) {
        return posNeg * (depthFn(left) - depthFn(right));
      });
      var matchingConfigPair = function(uiView2) {
        var matchingConfigs = _this._viewConfigs.filter(ViewService2.matches(uiViewsByFqn, uiView2));
        if (matchingConfigs.length > 1) {
          matchingConfigs.sort(depthCompare(viewConfigDepth, -1));
        }
        return { uiView: uiView2, viewConfig: matchingConfigs[0] };
      };
      var configureUIView = function(tuple) {
        if (_this._uiViews.indexOf(tuple.uiView) !== -1)
          tuple.uiView.configUpdated(tuple.viewConfig);
      };
      var uiViewTuples = this._uiViews.sort(depthCompare(uiViewDepth, 1)).map(matchingConfigPair);
      var matchedViewConfigs = uiViewTuples.map(function(tuple) {
        return tuple.viewConfig;
      });
      var unmatchedConfigTuples = this._viewConfigs.filter(function(config) {
        return !inArray(matchedViewConfigs, config);
      }).map(function(viewConfig) {
        return { uiView: void 0, viewConfig };
      });
      uiViewTuples.forEach(configureUIView);
      var allTuples = uiViewTuples.concat(unmatchedConfigTuples);
      this._listeners.forEach(function(cb) {
        return cb(allTuples);
      });
      trace.traceViewSync(allTuples);
    };
    ViewService2.prototype.registerUIView = function(uiView2) {
      trace.traceViewServiceUIViewEvent("-> Registering", uiView2);
      var uiViews = this._uiViews;
      var fqnAndTypeMatches = function(uiv) {
        return uiv.fqn === uiView2.fqn && uiv.$type === uiView2.$type;
      };
      if (uiViews.filter(fqnAndTypeMatches).length)
        trace.traceViewServiceUIViewEvent("!!!! duplicate uiView named:", uiView2);
      uiViews.push(uiView2);
      this.sync();
      return function() {
        var idx = uiViews.indexOf(uiView2);
        if (idx === -1) {
          trace.traceViewServiceUIViewEvent("Tried removing non-registered uiView", uiView2);
          return;
        }
        trace.traceViewServiceUIViewEvent("<- Deregistering", uiView2);
        removeFrom(uiViews)(uiView2);
      };
    };
    ViewService2.prototype.available = function() {
      return this._uiViews.map(prop("fqn"));
    };
    ViewService2.prototype.active = function() {
      return this._uiViews.filter(prop("$config")).map(prop("name"));
    };
    ViewService2.matches = function(uiViewsByFqn, uiView2) {
      return function(viewConfig) {
        if (uiView2.$type !== viewConfig.viewDecl.$type)
          return false;
        var vc = viewConfig.viewDecl;
        var vcSegments = vc.$uiViewName.split(".");
        var uivSegments = uiView2.fqn.split(".");
        if (!equals(vcSegments, uivSegments.slice(0 - vcSegments.length)))
          return false;
        var negOffset = 1 - vcSegments.length || void 0;
        var fqnToFirstSegment = uivSegments.slice(0, negOffset).join(".");
        var uiViewContext = uiViewsByFqn[fqnToFirstSegment].creationContext;
        return vc.$uiViewContextAnchor === (uiViewContext && uiViewContext.name);
      };
    };
    return ViewService2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/globals.js
var UIRouterGlobals = (
  /** @class */
  (function() {
    function UIRouterGlobals2() {
      this.params = new StateParams();
      this.lastStartedTransitionId = -1;
      this.transitionHistory = new Queue([], 1);
      this.successfulTransitions = new Queue([], 1);
    }
    UIRouterGlobals2.prototype.dispose = function() {
      this.transitionHistory.clear();
      this.successfulTransitions.clear();
      this.transition = null;
    };
    return UIRouterGlobals2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlRules.js
var prioritySort = function(a, b) {
  return (b.priority || 0) - (a.priority || 0);
};
var typeSort = function(a, b) {
  var weights = { STATE: 4, URLMATCHER: 4, REGEXP: 3, RAW: 2, OTHER: 1 };
  return (weights[a.type] || 0) - (weights[b.type] || 0);
};
var urlMatcherSort = function(a, b) {
  return !a.urlMatcher || !b.urlMatcher ? 0 : UrlMatcher.compare(a.urlMatcher, b.urlMatcher);
};
var idSort = function(a, b) {
  var useMatchPriority = { STATE: true, URLMATCHER: true };
  var equal = useMatchPriority[a.type] && useMatchPriority[b.type];
  return equal ? 0 : (a.$id || 0) - (b.$id || 0);
};
var defaultRuleSortFn;
defaultRuleSortFn = function(a, b) {
  var cmp = prioritySort(a, b);
  if (cmp !== 0)
    return cmp;
  cmp = typeSort(a, b);
  if (cmp !== 0)
    return cmp;
  cmp = urlMatcherSort(a, b);
  if (cmp !== 0)
    return cmp;
  return idSort(a, b);
};
function getHandlerFn(handler) {
  if (!isFunction(handler) && !isString(handler) && !is(TargetState)(handler) && !TargetState.isDef(handler)) {
    throw new Error("'handler' must be a string, function, TargetState, or have a state: 'newtarget' property");
  }
  return isFunction(handler) ? handler : val(handler);
}
var UrlRules = (
  /** @class */
  (function() {
    function UrlRules2(router2) {
      this.router = router2;
      this._sortFn = defaultRuleSortFn;
      this._rules = [];
      this._id = 0;
      this.urlRuleFactory = new UrlRuleFactory(router2);
    }
    UrlRules2.prototype.dispose = function(router2) {
      this._rules = [];
      delete this._otherwiseFn;
    };
    UrlRules2.prototype.initial = function(handler) {
      var handlerFn = getHandlerFn(handler);
      var matchFn = function(urlParts, router2) {
        return router2.globals.transitionHistory.size() === 0 && !!/^\/?$/.exec(urlParts.path);
      };
      this.rule(this.urlRuleFactory.create(matchFn, handlerFn));
    };
    UrlRules2.prototype.otherwise = function(handler) {
      var handlerFn = getHandlerFn(handler);
      this._otherwiseFn = this.urlRuleFactory.create(val(true), handlerFn);
      this._sorted = false;
    };
    UrlRules2.prototype.removeRule = function(rule) {
      removeFrom(this._rules, rule);
    };
    UrlRules2.prototype.rule = function(rule) {
      var _this = this;
      if (!UrlRuleFactory.isUrlRule(rule))
        throw new Error("invalid rule");
      rule.$id = this._id++;
      rule.priority = rule.priority || 0;
      this._rules.push(rule);
      this._sorted = false;
      return function() {
        return _this.removeRule(rule);
      };
    };
    UrlRules2.prototype.rules = function() {
      this.ensureSorted();
      return this._rules.concat(this._otherwiseFn ? [this._otherwiseFn] : []);
    };
    UrlRules2.prototype.sort = function(compareFn) {
      var sorted = this.stableSort(this._rules, this._sortFn = compareFn || this._sortFn);
      var group = 0;
      for (var i = 0; i < sorted.length; i++) {
        sorted[i]._group = group;
        if (i < sorted.length - 1 && this._sortFn(sorted[i], sorted[i + 1]) !== 0) {
          group++;
        }
      }
      this._rules = sorted;
      this._sorted = true;
    };
    UrlRules2.prototype.ensureSorted = function() {
      this._sorted || this.sort();
    };
    UrlRules2.prototype.stableSort = function(arr, compareFn) {
      var arrOfWrapper = arr.map(function(elem, idx) {
        return { elem, idx };
      });
      arrOfWrapper.sort(function(wrapperA, wrapperB) {
        var cmpDiff = compareFn(wrapperA.elem, wrapperB.elem);
        return cmpDiff === 0 ? wrapperA.idx - wrapperB.idx : cmpDiff;
      });
      return arrOfWrapper.map(function(wrapper) {
        return wrapper.elem;
      });
    };
    UrlRules2.prototype.when = function(matcher, handler, options) {
      var rule = this.urlRuleFactory.create(matcher, handler);
      if (isDefined(options && options.priority))
        rule.priority = options.priority;
      this.rule(rule);
      return rule;
    };
    return UrlRules2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlConfig.js
var UrlConfig = (
  /** @class */
  (function() {
    function UrlConfig2(router2) {
      var _this = this;
      this.router = router2;
      this.paramTypes = new ParamTypes();
      this._decodeParams = true;
      this._isCaseInsensitive = false;
      this._isStrictMode = true;
      this._defaultSquashPolicy = false;
      this.dispose = function() {
        return _this.paramTypes.dispose();
      };
      this.baseHref = function() {
        return _this.router.locationConfig.baseHref();
      };
      this.hashPrefix = function(newprefix) {
        return _this.router.locationConfig.hashPrefix(newprefix);
      };
      this.host = function() {
        return _this.router.locationConfig.host();
      };
      this.html5Mode = function() {
        return _this.router.locationConfig.html5Mode();
      };
      this.port = function() {
        return _this.router.locationConfig.port();
      };
      this.protocol = function() {
        return _this.router.locationConfig.protocol();
      };
    }
    UrlConfig2.prototype.caseInsensitive = function(value) {
      return this._isCaseInsensitive = isDefined(value) ? value : this._isCaseInsensitive;
    };
    UrlConfig2.prototype.defaultSquashPolicy = function(value) {
      if (isDefined(value) && value !== true && value !== false && !isString(value))
        throw new Error("Invalid squash policy: ".concat(value, ". Valid policies: false, true, arbitrary-string"));
      return this._defaultSquashPolicy = isDefined(value) ? value : this._defaultSquashPolicy;
    };
    UrlConfig2.prototype.strictMode = function(value) {
      return this._isStrictMode = isDefined(value) ? value : this._isStrictMode;
    };
    UrlConfig2.prototype.type = function(name, definition, definitionFn) {
      var type = this.paramTypes.type(name, definition, definitionFn);
      return !isDefined(definition) ? type : this;
    };
    return UrlConfig2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/url/urlService.js
var UrlService = (
  /** @class */
  (function() {
    function UrlService2(router2) {
      var _this = this;
      this.router = router2;
      this.interceptDeferred = false;
      this.rules = new UrlRules(this.router);
      this.config = new UrlConfig(this.router);
      this.url = function(newurl, replace, state) {
        return _this.router.locationService.url(newurl, replace, state);
      };
      this.path = function() {
        return _this.router.locationService.path();
      };
      this.search = function() {
        return _this.router.locationService.search();
      };
      this.hash = function() {
        return _this.router.locationService.hash();
      };
      this.onChange = function(callback) {
        return _this.router.locationService.onChange(callback);
      };
    }
    UrlService2.prototype.dispose = function() {
      this.listen(false);
      this.rules.dispose();
    };
    UrlService2.prototype.parts = function() {
      return { path: this.path(), search: this.search(), hash: this.hash() };
    };
    UrlService2.prototype.sync = function(evt) {
      if (evt && evt.defaultPrevented)
        return;
      var _a = this.router, urlService = _a.urlService, stateService = _a.stateService;
      var url = { path: urlService.path(), search: urlService.search(), hash: urlService.hash() };
      var best = this.match(url);
      var applyResult = pattern([
        [isString, function(newurl) {
          return urlService.url(newurl, true);
        }],
        [TargetState.isDef, function(def) {
          return stateService.go(def.state, def.params, def.options);
        }],
        [is(TargetState), function(target) {
          return stateService.go(target.state(), target.params(), target.options());
        }]
      ]);
      applyResult(best && best.rule.handler(best.match, url, this.router));
    };
    UrlService2.prototype.listen = function(enabled) {
      var _this = this;
      if (enabled === false) {
        this._stopListeningFn && this._stopListeningFn();
        delete this._stopListeningFn;
      } else {
        return this._stopListeningFn = this._stopListeningFn || this.router.urlService.onChange(function(evt) {
          return _this.sync(evt);
        });
      }
    };
    UrlService2.prototype.deferIntercept = function(defer) {
      if (defer === void 0)
        defer = true;
      this.interceptDeferred = defer;
    };
    UrlService2.prototype.match = function(url) {
      var _this = this;
      url = extend({ path: "", search: {}, hash: "" }, url);
      var rules = this.rules.rules();
      var checkRule = function(rule) {
        var match = rule.match(url, _this.router);
        return match && { match, rule, weight: rule.matchPriority(match) };
      };
      var best;
      for (var i = 0; i < rules.length; i++) {
        if (best && best.rule._group !== rules[i]._group)
          break;
        var current = checkRule(rules[i]);
        best = !best || current && current.weight > best.weight ? current : best;
      }
      return best;
    };
    return UrlService2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/router.js
var _routerInstance = 0;
var locSvcFns = ["url", "path", "search", "hash", "onChange"];
var locCfgFns = ["port", "protocol", "host", "baseHref", "html5Mode", "hashPrefix"];
var locationServiceStub = makeStub("LocationServices", locSvcFns);
var locationConfigStub = makeStub("LocationConfig", locCfgFns);
var UIRouter = (
  /** @class */
  (function() {
    function UIRouter2(locationService, locationConfig) {
      if (locationService === void 0) {
        locationService = locationServiceStub;
      }
      if (locationConfig === void 0) {
        locationConfig = locationConfigStub;
      }
      this.locationService = locationService;
      this.locationConfig = locationConfig;
      this.$id = _routerInstance++;
      this._disposed = false;
      this._disposables = [];
      this.trace = trace;
      this.viewService = new ViewService(this);
      this.globals = new UIRouterGlobals();
      this.transitionService = new TransitionService(this);
      this.urlMatcherFactory = new UrlMatcherFactory(this);
      this.urlRouter = new UrlRouter(this);
      this.urlService = new UrlService(this);
      this.stateRegistry = new StateRegistry(this);
      this.stateService = new StateService(this);
      this._plugins = {};
      this.viewService._pluginapi._rootViewContext(this.stateRegistry.root());
      this.globals.$current = this.stateRegistry.root();
      this.globals.current = this.globals.$current.self;
      this.disposable(this.globals);
      this.disposable(this.stateService);
      this.disposable(this.stateRegistry);
      this.disposable(this.transitionService);
      this.disposable(this.urlService);
      this.disposable(locationService);
      this.disposable(locationConfig);
    }
    UIRouter2.prototype.disposable = function(disposable) {
      this._disposables.push(disposable);
    };
    UIRouter2.prototype.dispose = function(disposable) {
      var _this = this;
      if (disposable && isFunction(disposable.dispose)) {
        disposable.dispose(this);
        return void 0;
      }
      this._disposed = true;
      this._disposables.slice().forEach(function(d) {
        try {
          typeof d.dispose === "function" && d.dispose(_this);
          removeFrom(_this._disposables, d);
        } catch (ignored) {
        }
      });
    };
    UIRouter2.prototype.plugin = function(plugin, options) {
      if (options === void 0) {
        options = {};
      }
      var pluginInstance = new plugin(this, options);
      if (!pluginInstance.name)
        throw new Error("Required property `name` missing on plugin: " + pluginInstance);
      this._disposables.push(pluginInstance);
      return this._plugins[pluginInstance.name] = pluginInstance;
    };
    UIRouter2.prototype.getPlugin = function(pluginName) {
      return pluginName ? this._plugins[pluginName] : values(this._plugins);
    };
    return UIRouter2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/coreResolvables.js
function addCoreResolvables(trans) {
  trans.addResolvable(Resolvable.fromData(UIRouter, trans.router), "");
  trans.addResolvable(Resolvable.fromData(Transition, trans), "");
  trans.addResolvable(Resolvable.fromData("$transition$", trans), "");
  trans.addResolvable(Resolvable.fromData("$stateParams", trans.params()), "");
  trans.entering().forEach(function(state) {
    trans.addResolvable(Resolvable.fromData("$state$", state), state);
  });
}
var registerAddCoreResolvables = function(transitionService) {
  return transitionService.onCreate({}, addCoreResolvables);
};
var TRANSITION_TOKENS = ["$transition$", Transition];
var isTransition = inArray(TRANSITION_TOKENS);
var treeChangesCleanup = function(trans) {
  var nodes = values(trans.treeChanges()).reduce(unnestR, []).reduce(uniqR, []);
  var replaceTransitionWithNull = function(r) {
    return isTransition(r.token) ? Resolvable.fromData(r.token, null) : r;
  };
  nodes.forEach(function(node) {
    node.resolvables = node.resolvables.map(replaceTransitionWithNull);
  });
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/redirectTo.js
var redirectToHook = function(trans) {
  var redirect = trans.to().redirectTo;
  if (!redirect)
    return;
  var $state = trans.router.stateService;
  function handleResult(result) {
    if (!result)
      return;
    if (result instanceof TargetState)
      return result;
    if (isString(result))
      return $state.target(result, trans.params(), trans.options());
    if (result["state"] || result["params"])
      return $state.target(result["state"] || trans.to(), result["params"] || trans.params(), trans.options());
  }
  if (isFunction(redirect)) {
    return services.$q.when(redirect(trans)).then(handleResult);
  }
  return handleResult(redirect);
};
var registerRedirectToHook = function(transitionService) {
  return transitionService.onStart({ to: function(state) {
    return !!state.redirectTo;
  } }, redirectToHook);
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/onEnterExitRetain.js
function makeEnterExitRetainHook(hookName) {
  return function(transition, state) {
    var _state = state.$$state();
    var hookFn = _state[hookName];
    return hookFn(transition, state);
  };
}
var onExitHook = makeEnterExitRetainHook("onExit");
var registerOnExitHook = function(transitionService) {
  return transitionService.onExit({ exiting: function(state) {
    return !!state.onExit;
  } }, onExitHook);
};
var onRetainHook = makeEnterExitRetainHook("onRetain");
var registerOnRetainHook = function(transitionService) {
  return transitionService.onRetain({ retained: function(state) {
    return !!state.onRetain;
  } }, onRetainHook);
};
var onEnterHook = makeEnterExitRetainHook("onEnter");
var registerOnEnterHook = function(transitionService) {
  return transitionService.onEnter({ entering: function(state) {
    return !!state.onEnter;
  } }, onEnterHook);
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/resolve.js
var RESOLVE_HOOK_PRIORITY = 1e3;
var eagerResolvePath = function(trans) {
  return new ResolveContext(trans.treeChanges().to).resolvePath("EAGER", trans).then(noop);
};
var registerEagerResolvePath = function(transitionService) {
  return transitionService.onStart({}, eagerResolvePath, { priority: RESOLVE_HOOK_PRIORITY });
};
var lazyResolveState = function(trans, state) {
  return new ResolveContext(trans.treeChanges().to).subContext(state.$$state()).resolvePath("LAZY", trans).then(noop);
};
var registerLazyResolveState = function(transitionService) {
  return transitionService.onEnter({ entering: val(true) }, lazyResolveState, { priority: RESOLVE_HOOK_PRIORITY });
};
var resolveRemaining = function(trans) {
  return new ResolveContext(trans.treeChanges().to).resolvePath("LAZY", trans).then(noop);
};
var registerResolveRemaining = function(transitionService) {
  return transitionService.onFinish({}, resolveRemaining, { priority: RESOLVE_HOOK_PRIORITY });
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/views.js
var loadEnteringViews = function(transition) {
  var $q2 = services.$q;
  var enteringViews = transition.views("entering");
  if (!enteringViews.length)
    return;
  return $q2.all(enteringViews.map(function(view) {
    return $q2.when(view.load());
  })).then(noop);
};
var registerLoadEnteringViews = function(transitionService) {
  return transitionService.onFinish({}, loadEnteringViews);
};
var activateViews = function(transition) {
  var enteringViews = transition.views("entering");
  var exitingViews = transition.views("exiting");
  if (!enteringViews.length && !exitingViews.length)
    return;
  var $view = transition.router.viewService;
  exitingViews.forEach(function(vc) {
    return $view.deactivateViewConfig(vc);
  });
  enteringViews.forEach(function(vc) {
    return $view.activateViewConfig(vc);
  });
  $view.sync();
};
var registerActivateViews = function(transitionService) {
  return transitionService.onSuccess({}, activateViews);
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/updateGlobals.js
var updateGlobalState = function(trans) {
  var globals = trans.router.globals;
  var transitionSuccessful = function() {
    globals.successfulTransitions.enqueue(trans);
    globals.$current = trans.$to();
    globals.current = globals.$current.self;
    copy(trans.params(), globals.params);
  };
  var clearCurrentTransition = function() {
    if (globals.transition === trans)
      globals.transition = null;
  };
  trans.onSuccess({}, transitionSuccessful, { priority: 1e4 });
  trans.promise.then(clearCurrentTransition, clearCurrentTransition);
};
var registerUpdateGlobalState = function(transitionService) {
  return transitionService.onCreate({}, updateGlobalState);
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/url.js
var updateUrl = function(transition) {
  var options = transition.options();
  var $state = transition.router.stateService;
  var $urlRouter = transition.router.urlRouter;
  if (options.source !== "url" && options.location && $state.$current.navigable) {
    var urlOptions = { replace: options.location === "replace" };
    $urlRouter.push($state.$current.navigable.url, $state.params, urlOptions);
  }
  $urlRouter.update(true);
};
var registerUpdateUrl = function(transitionService) {
  return transitionService.onSuccess({}, updateUrl, { priority: 9999 });
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/lazyLoad.js
var lazyLoadHook = function(transition) {
  var router2 = transition.router;
  function retryTransition() {
    if (transition.originalTransition().options().source !== "url") {
      var orig = transition.targetState();
      return router2.stateService.target(orig.identifier(), orig.params(), orig.options());
    }
    var $url = router2.urlService;
    var result = $url.match($url.parts());
    var rule = result && result.rule;
    if (rule && rule.type === "STATE") {
      var state = rule.state;
      var params = result.match;
      return router2.stateService.target(state, params, transition.options());
    }
    router2.urlService.sync();
  }
  var promises = transition.entering().filter(function(state) {
    return !!state.$$state().lazyLoad;
  }).map(function(state) {
    return lazyLoadState(transition, state);
  });
  return services.$q.all(promises).then(retryTransition);
};
var registerLazyLoadHook = function(transitionService) {
  return transitionService.onBefore({ entering: function(state) {
    return !!state.lazyLoad;
  } }, lazyLoadHook);
};
function lazyLoadState(transition, state) {
  var lazyLoadFn = state.$$state().lazyLoad;
  var promise = lazyLoadFn["_promise"];
  if (!promise) {
    var success = function(result) {
      delete state.lazyLoad;
      delete state.$$state().lazyLoad;
      delete lazyLoadFn["_promise"];
      return result;
    };
    var error = function(err) {
      delete lazyLoadFn["_promise"];
      return services.$q.reject(err);
    };
    promise = lazyLoadFn["_promise"] = services.$q.when(lazyLoadFn(transition, state)).then(updateStateRegistry).then(success, error);
  }
  function updateStateRegistry(result) {
    if (result && Array.isArray(result.states)) {
      result.states.forEach(function(_state) {
        return transition.router.stateRegistry.register(_state);
      });
    }
    return result;
  }
  return promise;
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/transitionEventType.js
var TransitionEventType = (
  /** @class */
  /* @__PURE__ */ (function() {
    function TransitionEventType2(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous) {
      if (reverseSort === void 0) {
        reverseSort = false;
      }
      if (getResultHandler === void 0) {
        getResultHandler = TransitionHook.HANDLE_RESULT;
      }
      if (getErrorHandler === void 0) {
        getErrorHandler = TransitionHook.REJECT_ERROR;
      }
      if (synchronous === void 0) {
        synchronous = false;
      }
      this.name = name;
      this.hookPhase = hookPhase;
      this.hookOrder = hookOrder;
      this.criteriaMatchPath = criteriaMatchPath;
      this.reverseSort = reverseSort;
      this.getResultHandler = getResultHandler;
      this.getErrorHandler = getErrorHandler;
      this.synchronous = synchronous;
    }
    return TransitionEventType2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/ignoredTransition.js
function ignoredHook(trans) {
  var ignoredReason = trans._ignoredReason();
  if (!ignoredReason)
    return;
  trace.traceTransitionIgnored(trans);
  var pending = trans.router.globals.transition;
  if (ignoredReason === "SameAsCurrent" && pending) {
    pending.abort();
  }
  return Rejection.ignored().toPromise();
}
var registerIgnoredTransitionHook = function(transitionService) {
  return transitionService.onBefore({}, ignoredHook, { priority: -9999 });
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/hooks/invalidTransition.js
function invalidTransitionHook(trans) {
  if (!trans.valid()) {
    throw new Error(trans.error().toString());
  }
}
var registerInvalidTransitionHook = function(transitionService) {
  return transitionService.onBefore({}, invalidTransitionHook, { priority: -1e4 });
};

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/transition/transitionService.js
var defaultTransOpts = {
  location: true,
  relative: null,
  inherit: false,
  notify: true,
  reload: false,
  supercede: true,
  custom: {},
  current: function() {
    return null;
  },
  source: "unknown"
};
var TransitionService = (
  /** @class */
  (function() {
    function TransitionService2(_router) {
      this._transitionCount = 0;
      this._eventTypes = [];
      this._registeredHooks = {};
      this._criteriaPaths = {};
      this._router = _router;
      this.$view = _router.viewService;
      this._deregisterHookFns = {};
      this._pluginapi = createProxyFunctions(val(this), {}, val(this), [
        "_definePathType",
        "_defineEvent",
        "_getPathTypes",
        "_getEvents",
        "getHooks"
      ]);
      this._defineCorePaths();
      this._defineCoreEvents();
      this._registerCoreTransitionHooks();
      _router.globals.successfulTransitions.onEvict(treeChangesCleanup);
    }
    TransitionService2.prototype.onCreate = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onBefore = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onStart = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onExit = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onRetain = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onEnter = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onFinish = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onSuccess = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.onError = function(criteria, callback, options) {
      return;
    };
    TransitionService2.prototype.dispose = function(router2) {
      values(this._registeredHooks).forEach(function(hooksArray) {
        return hooksArray.forEach(function(hook) {
          hook._deregistered = true;
          removeFrom(hooksArray, hook);
        });
      });
    };
    TransitionService2.prototype.create = function(fromPath, targetState) {
      return new Transition(fromPath, targetState, this._router);
    };
    TransitionService2.prototype._defineCoreEvents = function() {
      var Phase = TransitionHookPhase;
      var TH = TransitionHook;
      var paths = this._criteriaPaths;
      var NORMAL_SORT = false, REVERSE_SORT = true;
      var SYNCHRONOUS = true;
      this._defineEvent("onCreate", Phase.CREATE, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.THROW_ERROR, SYNCHRONOUS);
      this._defineEvent("onBefore", Phase.BEFORE, 0, paths.to);
      this._defineEvent("onStart", Phase.RUN, 0, paths.to);
      this._defineEvent("onExit", Phase.RUN, 100, paths.exiting, REVERSE_SORT);
      this._defineEvent("onRetain", Phase.RUN, 200, paths.retained);
      this._defineEvent("onEnter", Phase.RUN, 300, paths.entering);
      this._defineEvent("onFinish", Phase.RUN, 400, paths.to);
      this._defineEvent("onSuccess", Phase.SUCCESS, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.LOG_ERROR, SYNCHRONOUS);
      this._defineEvent("onError", Phase.ERROR, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.LOG_ERROR, SYNCHRONOUS);
    };
    TransitionService2.prototype._defineCorePaths = function() {
      var STATE = TransitionHookScope.STATE, TRANSITION = TransitionHookScope.TRANSITION;
      this._definePathType("to", TRANSITION);
      this._definePathType("from", TRANSITION);
      this._definePathType("exiting", STATE);
      this._definePathType("retained", STATE);
      this._definePathType("entering", STATE);
    };
    TransitionService2.prototype._defineEvent = function(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous) {
      if (reverseSort === void 0) {
        reverseSort = false;
      }
      if (getResultHandler === void 0) {
        getResultHandler = TransitionHook.HANDLE_RESULT;
      }
      if (getErrorHandler === void 0) {
        getErrorHandler = TransitionHook.REJECT_ERROR;
      }
      if (synchronous === void 0) {
        synchronous = false;
      }
      var eventType = new TransitionEventType(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous);
      this._eventTypes.push(eventType);
      makeEvent(this, this, eventType);
    };
    TransitionService2.prototype._getEvents = function(phase) {
      var transitionHookTypes = isDefined(phase) ? this._eventTypes.filter(function(type) {
        return type.hookPhase === phase;
      }) : this._eventTypes.slice();
      return transitionHookTypes.sort(function(l, r) {
        var cmpByPhase = l.hookPhase - r.hookPhase;
        return cmpByPhase === 0 ? l.hookOrder - r.hookOrder : cmpByPhase;
      });
    };
    TransitionService2.prototype._definePathType = function(name, hookScope) {
      this._criteriaPaths[name] = { name, scope: hookScope };
    };
    TransitionService2.prototype._getPathTypes = function() {
      return this._criteriaPaths;
    };
    TransitionService2.prototype.getHooks = function(hookName) {
      return this._registeredHooks[hookName];
    };
    TransitionService2.prototype._registerCoreTransitionHooks = function() {
      var fns = this._deregisterHookFns;
      fns.addCoreResolves = registerAddCoreResolvables(this);
      fns.ignored = registerIgnoredTransitionHook(this);
      fns.invalid = registerInvalidTransitionHook(this);
      fns.redirectTo = registerRedirectToHook(this);
      fns.onExit = registerOnExitHook(this);
      fns.onRetain = registerOnRetainHook(this);
      fns.onEnter = registerOnEnterHook(this);
      fns.eagerResolve = registerEagerResolvePath(this);
      fns.lazyResolve = registerLazyResolveState(this);
      fns.resolveAll = registerResolveRemaining(this);
      fns.loadViews = registerLoadEnteringViews(this);
      fns.activateViews = registerActivateViews(this);
      fns.updateGlobals = registerUpdateGlobalState(this);
      fns.updateUrl = registerUpdateUrl(this);
      fns.lazyLoad = registerLazyLoadHook(this);
    };
    return TransitionService2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/state/stateService.js
var StateService = (
  /** @class */
  (function() {
    function StateService2(router2) {
      this.router = router2;
      this.invalidCallbacks = [];
      this._defaultErrorHandler = function $defaultErrorHandler($error$) {
        if ($error$ instanceof Error && $error$.stack) {
          console.error($error$);
          console.error($error$.stack);
        } else if ($error$ instanceof Rejection) {
          console.error($error$.toString());
          if ($error$.detail && $error$.detail.stack)
            console.error($error$.detail.stack);
        } else {
          console.error($error$);
        }
      };
      var getters = ["current", "$current", "params", "transition"];
      var boundFns = Object.keys(StateService2.prototype).filter(not(inArray(getters)));
      createProxyFunctions(val(StateService2.prototype), this, val(this), boundFns);
    }
    Object.defineProperty(StateService2.prototype, "transition", {
      /**
       * The [[Transition]] currently in progress (or null)
       *
       * @deprecated This is a passthrough through to [[UIRouterGlobals.transition]]
       */
      get: function() {
        return this.router.globals.transition;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateService2.prototype, "params", {
      /**
       * The latest successful state parameters
       *
       * @deprecated This is a passthrough through to [[UIRouterGlobals.params]]
       */
      get: function() {
        return this.router.globals.params;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateService2.prototype, "current", {
      /**
       * The current [[StateDeclaration]]
       *
       * @deprecated This is a passthrough through to [[UIRouterGlobals.current]]
       */
      get: function() {
        return this.router.globals.current;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateService2.prototype, "$current", {
      /**
       * The current [[StateObject]] (an internal API)
       *
       * @deprecated This is a passthrough through to [[UIRouterGlobals.$current]]
       */
      get: function() {
        return this.router.globals.$current;
      },
      enumerable: false,
      configurable: true
    });
    StateService2.prototype.dispose = function() {
      this.defaultErrorHandler(noop);
      this.invalidCallbacks = [];
    };
    StateService2.prototype._handleInvalidTargetState = function(fromPath, toState) {
      var _this = this;
      var fromState = PathUtils.makeTargetState(this.router.stateRegistry, fromPath);
      var globals = this.router.globals;
      var latestThing = function() {
        return globals.transitionHistory.peekTail();
      };
      var latest = latestThing();
      var callbackQueue = new Queue(this.invalidCallbacks.slice());
      var injector = new ResolveContext(fromPath).injector();
      var checkForRedirect = function(result) {
        if (!(result instanceof TargetState)) {
          return;
        }
        var target = result;
        target = _this.target(target.identifier(), target.params(), target.options());
        if (!target.valid()) {
          return Rejection.invalid(target.error()).toPromise();
        }
        if (latestThing() !== latest) {
          return Rejection.superseded().toPromise();
        }
        return _this.transitionTo(target.identifier(), target.params(), target.options());
      };
      function invokeNextCallback() {
        var nextCallback = callbackQueue.dequeue();
        if (nextCallback === void 0)
          return Rejection.invalid(toState.error()).toPromise();
        var callbackResult = services.$q.when(nextCallback(toState, fromState, injector));
        return callbackResult.then(checkForRedirect).then(function(result) {
          return result || invokeNextCallback();
        });
      }
      return invokeNextCallback();
    };
    StateService2.prototype.onInvalid = function(callback) {
      this.invalidCallbacks.push(callback);
      return function deregisterListener() {
        removeFrom(this.invalidCallbacks)(callback);
      }.bind(this);
    };
    StateService2.prototype.reload = function(reloadState) {
      return this.transitionTo(this.current, this.params, {
        reload: isDefined(reloadState) ? reloadState : true,
        inherit: false,
        notify: false
      });
    };
    StateService2.prototype.go = function(to, params, options) {
      var defautGoOpts = { relative: this.$current, inherit: true };
      var transOpts = defaults(options, defautGoOpts, defaultTransOpts);
      return this.transitionTo(to, params, transOpts);
    };
    StateService2.prototype.target = function(identifier, params, options) {
      if (options === void 0) {
        options = {};
      }
      if (isObject(options.reload) && !options.reload.name)
        throw new Error("Invalid reload state object");
      var reg = this.router.stateRegistry;
      options.reloadState = options.reload === true ? reg.root() : reg.matcher.find(options.reload, options.relative);
      if (options.reload && !options.reloadState)
        throw new Error("No such reload state '".concat(isString(options.reload) ? options.reload : options.reload.name, "'"));
      return new TargetState(this.router.stateRegistry, identifier, params, options);
    };
    StateService2.prototype.getCurrentPath = function() {
      var _this = this;
      var globals = this.router.globals;
      var latestSuccess = globals.successfulTransitions.peekTail();
      var rootPath = function() {
        return [new PathNode(_this.router.stateRegistry.root())];
      };
      return latestSuccess ? latestSuccess.treeChanges().to : rootPath();
    };
    StateService2.prototype.transitionTo = function(to, toParams, options) {
      var _this = this;
      if (toParams === void 0) {
        toParams = {};
      }
      if (options === void 0) {
        options = {};
      }
      var router2 = this.router;
      var globals = router2.globals;
      options = defaults(options, defaultTransOpts);
      var getCurrent = function() {
        return globals.transition;
      };
      options = extend(options, { current: getCurrent });
      var ref = this.target(to, toParams, options);
      var currentPath = this.getCurrentPath();
      if (!ref.exists())
        return this._handleInvalidTargetState(currentPath, ref);
      if (!ref.valid())
        return silentRejection(ref.error());
      if (options.supercede === false && getCurrent()) {
        return Rejection.ignored("Another transition is in progress and supercede has been set to false in TransitionOptions for the transition. So the transition was ignored in favour of the existing one in progress.").toPromise();
      }
      var rejectedTransitionHandler = function(trans) {
        return function(error) {
          if (error instanceof Rejection) {
            var isLatest = router2.globals.lastStartedTransitionId <= trans.$id;
            if (error.type === RejectType.IGNORED) {
              isLatest && router2.urlRouter.update();
              return services.$q.when(globals.current);
            }
            var detail = error.detail;
            if (error.type === RejectType.SUPERSEDED && error.redirected && detail instanceof TargetState) {
              var redirect = trans.redirect(detail);
              return redirect.run().catch(rejectedTransitionHandler(redirect));
            }
            if (error.type === RejectType.ABORTED) {
              isLatest && router2.urlRouter.update();
              return services.$q.reject(error);
            }
          }
          var errorHandler = _this.defaultErrorHandler();
          errorHandler(error);
          return services.$q.reject(error);
        };
      };
      var transition = this.router.transitionService.create(currentPath, ref);
      var transitionToPromise = transition.run().catch(rejectedTransitionHandler(transition));
      silenceUncaughtInPromise(transitionToPromise);
      return extend(transitionToPromise, { transition });
    };
    StateService2.prototype.is = function(stateOrName, params, options) {
      options = defaults(options, { relative: this.$current });
      var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative);
      if (!isDefined(state))
        return void 0;
      if (this.$current !== state)
        return false;
      if (!params)
        return true;
      var schema = state.parameters({ inherit: true, matchingKeys: params });
      return Param.equals(schema, Param.values(schema, params), this.params);
    };
    StateService2.prototype.includes = function(stateOrName, params, options) {
      options = defaults(options, { relative: this.$current });
      var glob = isString(stateOrName) && Glob.fromString(stateOrName);
      if (glob) {
        if (!glob.matches(this.$current.name))
          return false;
        stateOrName = this.$current.name;
      }
      var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative), include = this.$current.includes;
      if (!isDefined(state))
        return void 0;
      if (!isDefined(include[state.name]))
        return false;
      if (!params)
        return true;
      var schema = state.parameters({ inherit: true, matchingKeys: params });
      return Param.equals(schema, Param.values(schema, params), this.params);
    };
    StateService2.prototype.href = function(stateOrName, params, options) {
      var defaultHrefOpts = {
        lossy: true,
        inherit: true,
        absolute: false,
        relative: this.$current
      };
      options = defaults(options, defaultHrefOpts);
      params = params || {};
      var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative);
      if (!isDefined(state))
        return null;
      if (options.inherit)
        params = this.params.$inherit(params, this.$current, state);
      var nav = state && options.lossy ? state.navigable : state;
      if (!nav || nav.url === void 0 || nav.url === null) {
        return null;
      }
      return this.router.urlRouter.href(nav.url, params, { absolute: options.absolute });
    };
    StateService2.prototype.defaultErrorHandler = function(handler) {
      return this._defaultErrorHandler = handler || this._defaultErrorHandler;
    };
    StateService2.prototype.get = function(stateOrName, base) {
      var reg = this.router.stateRegistry;
      if (arguments.length === 0)
        return reg.get();
      return reg.get(stateOrName, base || this.$current);
    };
    StateService2.prototype.lazyLoad = function(stateOrName, transition) {
      var state = this.get(stateOrName);
      if (!state || !state.lazyLoad)
        throw new Error("Can not lazy load " + stateOrName);
      var currentPath = this.getCurrentPath();
      var target = PathUtils.makeTargetState(this.router.stateRegistry, currentPath);
      transition = transition || this.router.transitionService.create(currentPath, target);
      return lazyLoadState(transition, state);
    };
    return StateService2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/utils.js
var keyValsToObjectR = function(accum, _a) {
  var key = _a[0], val2 = _a[1];
  if (!accum.hasOwnProperty(key)) {
    accum[key] = val2;
  } else if (isArray(accum[key])) {
    accum[key].push(val2);
  } else {
    accum[key] = [accum[key], val2];
  }
  return accum;
};
var getParams = function(queryString) {
  return queryString.split("&").filter(identity).map(splitEqual).reduce(keyValsToObjectR, {});
};
function parseUrl2(url) {
  var orEmptyString = function(x) {
    return x || "";
  };
  var _a = splitHash(url).map(orEmptyString), beforehash = _a[0], hash = _a[1];
  var _b = splitQuery(beforehash).map(orEmptyString), path = _b[0], search = _b[1];
  return { path, search, hash, url };
}
var buildUrl = function(loc) {
  var path = loc.path();
  var searchObject = loc.search();
  var hash = loc.hash();
  var search = Object.keys(searchObject).map(function(key) {
    var param = searchObject[key];
    var vals = isArray(param) ? param : [param];
    return vals.map(function(val2) {
      return key + "=" + val2;
    });
  }).reduce(unnestR, []).join("&");
  return path + (search ? "?" + search : "") + (hash ? "#" + hash : "");
};
function locationPluginFactory(name, isHtml5, serviceClass, configurationClass) {
  return function(uiRouter) {
    var service = uiRouter.locationService = new serviceClass(uiRouter);
    var configuration = uiRouter.locationConfig = new configurationClass(uiRouter, isHtml5);
    function dispose(router2) {
      router2.dispose(service);
      router2.dispose(configuration);
    }
    return { name, service, configuration, dispose };
  };
}

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/baseLocationService.js
var BaseLocationServices = (
  /** @class */
  (function() {
    function BaseLocationServices2(router2, fireAfterUpdate) {
      var _this = this;
      this.fireAfterUpdate = fireAfterUpdate;
      this._listeners = [];
      this._listener = function(evt) {
        return _this._listeners.forEach(function(cb) {
          return cb(evt);
        });
      };
      this.hash = function() {
        return parseUrl2(_this._get()).hash;
      };
      this.path = function() {
        return parseUrl2(_this._get()).path;
      };
      this.search = function() {
        return getParams(parseUrl2(_this._get()).search);
      };
      this._location = root.location;
      this._history = root.history;
    }
    BaseLocationServices2.prototype.url = function(url, replace) {
      if (replace === void 0) {
        replace = true;
      }
      if (isDefined(url) && url !== this._get()) {
        this._set(null, null, url, replace);
        if (this.fireAfterUpdate) {
          this._listeners.forEach(function(cb) {
            return cb({ url });
          });
        }
      }
      return buildUrl(this);
    };
    BaseLocationServices2.prototype.onChange = function(cb) {
      var _this = this;
      this._listeners.push(cb);
      return function() {
        return removeFrom(_this._listeners, cb);
      };
    };
    BaseLocationServices2.prototype.dispose = function(router2) {
      deregAll(this._listeners);
    };
    return BaseLocationServices2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/hashLocationService.js
var __extends = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var HashLocationService = (
  /** @class */
  (function(_super) {
    __extends(HashLocationService2, _super);
    function HashLocationService2(router2) {
      var _this = _super.call(this, router2, false) || this;
      root.addEventListener("hashchange", _this._listener, false);
      return _this;
    }
    HashLocationService2.prototype._get = function() {
      return trimHashVal(this._location.hash);
    };
    HashLocationService2.prototype._set = function(state, title, url, replace) {
      this._location.hash = url;
    };
    HashLocationService2.prototype.dispose = function(router2) {
      _super.prototype.dispose.call(this, router2);
      root.removeEventListener("hashchange", this._listener);
    };
    return HashLocationService2;
  })(BaseLocationServices)
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/memoryLocationService.js
var __extends2 = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var MemoryLocationService = (
  /** @class */
  (function(_super) {
    __extends2(MemoryLocationService2, _super);
    function MemoryLocationService2(router2) {
      return _super.call(this, router2, true) || this;
    }
    MemoryLocationService2.prototype._get = function() {
      return this._url;
    };
    MemoryLocationService2.prototype._set = function(state, title, url, replace) {
      this._url = url;
    };
    return MemoryLocationService2;
  })(BaseLocationServices)
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/pushStateLocationService.js
var __extends3 = /* @__PURE__ */ (function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var PushStateLocationService = (
  /** @class */
  (function(_super) {
    __extends3(PushStateLocationService2, _super);
    function PushStateLocationService2(router2) {
      var _this = _super.call(this, router2, true) || this;
      _this._config = router2.urlService.config;
      root.addEventListener("popstate", _this._listener, false);
      return _this;
    }
    PushStateLocationService2.prototype._getBasePrefix = function() {
      return stripLastPathElement(this._config.baseHref());
    };
    PushStateLocationService2.prototype._get = function() {
      var _a = this._location, pathname = _a.pathname, hash = _a.hash, search = _a.search;
      search = splitQuery(search)[1];
      hash = splitHash(hash)[1];
      var basePrefix = this._getBasePrefix();
      var exactBaseHrefMatch = pathname === this._config.baseHref();
      var startsWithBase = pathname.substr(0, basePrefix.length) === basePrefix;
      pathname = exactBaseHrefMatch ? "/" : startsWithBase ? pathname.substring(basePrefix.length) : pathname;
      return pathname + (search ? "?" + search : "") + (hash ? "#" + hash : "");
    };
    PushStateLocationService2.prototype._set = function(state, title, url, replace) {
      var basePrefix = this._getBasePrefix();
      var slash = url && url[0] !== "/" ? "/" : "";
      var fullUrl = url === "" || url === "/" ? this._config.baseHref() : basePrefix + slash + url;
      if (replace) {
        this._history.replaceState(state, title, fullUrl);
      } else {
        this._history.pushState(state, title, fullUrl);
      }
    };
    PushStateLocationService2.prototype.dispose = function(router2) {
      _super.prototype.dispose.call(this, router2);
      root.removeEventListener("popstate", this._listener);
    };
    return PushStateLocationService2;
  })(BaseLocationServices)
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/memoryLocationConfig.js
var MemoryLocationConfig = (
  /** @class */
  /* @__PURE__ */ (function() {
    function MemoryLocationConfig2() {
      var _this = this;
      this.dispose = noop;
      this._baseHref = "";
      this._port = 80;
      this._protocol = "http";
      this._host = "localhost";
      this._hashPrefix = "";
      this.port = function() {
        return _this._port;
      };
      this.protocol = function() {
        return _this._protocol;
      };
      this.host = function() {
        return _this._host;
      };
      this.baseHref = function() {
        return _this._baseHref;
      };
      this.html5Mode = function() {
        return false;
      };
      this.hashPrefix = function(newval) {
        return isDefined(newval) ? _this._hashPrefix = newval : _this._hashPrefix;
      };
    }
    return MemoryLocationConfig2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/browserLocationConfig.js
var BrowserLocationConfig = (
  /** @class */
  (function() {
    function BrowserLocationConfig2(router2, _isHtml5) {
      if (_isHtml5 === void 0) {
        _isHtml5 = false;
      }
      this._isHtml5 = _isHtml5;
      this._baseHref = void 0;
      this._hashPrefix = "";
    }
    BrowserLocationConfig2.prototype.port = function() {
      if (location.port) {
        return Number(location.port);
      }
      return this.protocol() === "https" ? 443 : 80;
    };
    BrowserLocationConfig2.prototype.protocol = function() {
      return location.protocol.replace(/:/g, "");
    };
    BrowserLocationConfig2.prototype.host = function() {
      return location.hostname;
    };
    BrowserLocationConfig2.prototype.html5Mode = function() {
      return this._isHtml5;
    };
    BrowserLocationConfig2.prototype.hashPrefix = function(newprefix) {
      return isDefined(newprefix) ? this._hashPrefix = newprefix : this._hashPrefix;
    };
    BrowserLocationConfig2.prototype.baseHref = function(href) {
      if (isDefined(href))
        this._baseHref = href;
      if (isUndefined(this._baseHref))
        this._baseHref = this.getBaseHref();
      return this._baseHref;
    };
    BrowserLocationConfig2.prototype.getBaseHref = function() {
      var baseTag = document.getElementsByTagName("base")[0];
      if (baseTag && baseTag.href) {
        return baseTag.href.replace(/^([^/:]*:)?\/\/[^/]*/, "");
      }
      return this._isHtml5 ? "/" : location.pathname || "/";
    };
    BrowserLocationConfig2.prototype.dispose = function() {
    };
    return BrowserLocationConfig2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/vanilla/plugins.js
var hashLocationPlugin = locationPluginFactory("vanilla.hashBangLocation", false, HashLocationService, BrowserLocationConfig);
var pushStateLocationPlugin = locationPluginFactory("vanilla.pushStateLocation", true, PushStateLocationService, BrowserLocationConfig);
var memoryLocationPlugin = locationPluginFactory("vanilla.memoryLocation", false, MemoryLocationService, MemoryLocationConfig);

// ../ngjs-core/node_modules/@uirouter/core/lib-esm/interface.js
var UIRouterPluginBase = (
  /** @class */
  (function() {
    function UIRouterPluginBase2() {
    }
    UIRouterPluginBase2.prototype.dispose = function(router2) {
    };
    return UIRouterPluginBase2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/statebuilders/views.js
function getNg1ViewConfigFactory() {
  var templateFactory = null;
  return function(path, view) {
    templateFactory = templateFactory || services.$injector.get("$templateFactory");
    return [new Ng1ViewConfig(path, view, templateFactory)];
  };
}
var hasAnyKey = function(keys, obj) {
  return keys.reduce(function(acc, key) {
    return acc || isDefined(obj[key]);
  }, false);
};
function ng1ViewsBuilder(state) {
  if (!state.parent)
    return {};
  var tplKeys = ["templateProvider", "templateUrl", "template", "notify", "async"], ctrlKeys = ["controller", "controllerProvider", "controllerAs", "resolveAs"], compKeys = ["component", "bindings", "componentProvider"], nonCompKeys = tplKeys.concat(ctrlKeys), allViewKeys = compKeys.concat(nonCompKeys);
  if (isDefined(state.views) && hasAnyKey(allViewKeys, state)) {
    throw new Error("State '" + state.name + `' has a 'views' object. It cannot also have "view properties" at the state level.  Move the following properties into a view (in the 'views' object): ` + (" " + allViewKeys.filter(function(key) {
      return isDefined(state[key]);
    }).join(", ")));
  }
  var views = {}, viewsObject = state.views || { $default: pick(state, allViewKeys) };
  forEach(viewsObject, function(config, name) {
    name = name || "$default";
    if (isString(config))
      config = { component: config };
    config = extend({}, config);
    if (hasAnyKey(compKeys, config) && hasAnyKey(nonCompKeys, config)) {
      throw new Error("Cannot combine: " + compKeys.join("|") + " with: " + nonCompKeys.join("|") + " in stateview: '" + name + "@" + state.name + "'");
    }
    config.resolveAs = config.resolveAs || "$resolve";
    config.$type = "ng1";
    config.$context = state;
    config.$name = name;
    var normalized = ViewService.normalizeUIViewTarget(config.$context, config.$name);
    config.$uiViewName = normalized.uiViewName;
    config.$uiViewContextAnchor = normalized.uiViewContextAnchor;
    views[name] = config;
  });
  return views;
}
var id2 = 0;
var Ng1ViewConfig = (
  /** @class */
  (function() {
    function Ng1ViewConfig2(path, viewDecl, factory) {
      var _this = this;
      this.path = path;
      this.viewDecl = viewDecl;
      this.factory = factory;
      this.$id = id2++;
      this.loaded = false;
      this.getTemplate = function(uiView2, context) {
        return _this.component ? _this.factory.makeComponentTemplate(uiView2, context, _this.component, _this.viewDecl.bindings) : _this.template;
      };
    }
    Ng1ViewConfig2.prototype.load = function() {
      var _this = this;
      var $q2 = services.$q;
      var context = new ResolveContext(this.path);
      var params = this.path.reduce(function(acc, node) {
        return extend(acc, node.paramValues);
      }, {});
      var promises = {
        template: $q2.when(this.factory.fromConfig(this.viewDecl, params, context)),
        controller: $q2.when(this.getController(context))
      };
      return $q2.all(promises).then(function(results) {
        trace.traceViewServiceEvent("Loaded", _this);
        _this.controller = results.controller;
        extend(_this, results.template);
        return _this;
      });
    };
    Ng1ViewConfig2.prototype.getController = function(context) {
      var provider = this.viewDecl.controllerProvider;
      if (!isInjectable(provider))
        return this.viewDecl.controller;
      var deps = services.$injector.annotate(provider);
      var providerFn = isArray(provider) ? tail(provider) : provider;
      var resolvable = new Resolvable("", providerFn, deps);
      return resolvable.get(context);
    };
    return Ng1ViewConfig2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/templateFactory.js
var TemplateFactory = (
  /** @class */
  (function() {
    function TemplateFactory2() {
      var _this = this;
      this._useHttp = ng.version.minor < 3;
      this.$get = [
        "$http",
        "$templateCache",
        "$injector",
        function($http, $templateCache, $injector2) {
          _this.$templateRequest = $injector2.has && $injector2.has("$templateRequest") && $injector2.get("$templateRequest");
          _this.$http = $http;
          _this.$templateCache = $templateCache;
          return _this;
        }
      ];
    }
    TemplateFactory2.prototype.useHttpService = function(value) {
      this._useHttp = value;
    };
    TemplateFactory2.prototype.fromConfig = function(config, params, context) {
      var defaultTemplate = "<ui-view></ui-view>";
      var asTemplate = function(result) {
        return services.$q.when(result).then(function(str) {
          return { template: str };
        });
      };
      var asComponent = function(result) {
        return services.$q.when(result).then(function(str) {
          return { component: str };
        });
      };
      return isDefined(config.template) ? asTemplate(this.fromString(config.template, params)) : isDefined(config.templateUrl) ? asTemplate(this.fromUrl(config.templateUrl, params)) : isDefined(config.templateProvider) ? asTemplate(this.fromProvider(config.templateProvider, params, context)) : isDefined(config.component) ? asComponent(config.component) : isDefined(config.componentProvider) ? asComponent(this.fromComponentProvider(config.componentProvider, params, context)) : asTemplate(defaultTemplate);
    };
    TemplateFactory2.prototype.fromString = function(template, params) {
      return isFunction(template) ? template(params) : template;
    };
    TemplateFactory2.prototype.fromUrl = function(url, params) {
      if (isFunction(url))
        url = url(params);
      if (url == null)
        return null;
      if (this._useHttp) {
        return this.$http.get(url, { cache: this.$templateCache, headers: { Accept: "text/html" } }).then(function(response) {
          return response.data;
        });
      }
      return this.$templateRequest(url);
    };
    TemplateFactory2.prototype.fromProvider = function(provider, params, context) {
      var deps = services.$injector.annotate(provider);
      var providerFn = isArray(provider) ? tail(provider) : provider;
      var resolvable = new Resolvable("", providerFn, deps);
      return resolvable.get(context);
    };
    TemplateFactory2.prototype.fromComponentProvider = function(provider, params, context) {
      var deps = services.$injector.annotate(provider);
      var providerFn = isArray(provider) ? tail(provider) : provider;
      var resolvable = new Resolvable("", providerFn, deps);
      return resolvable.get(context);
    };
    TemplateFactory2.prototype.makeComponentTemplate = function(uiView2, context, component, bindings) {
      bindings = bindings || {};
      var prefix = ng.version.minor >= 3 ? "::" : "";
      var kebob = function(camelCase) {
        var kebobed = kebobString(camelCase);
        return /^(x|data)-/.exec(kebobed) ? "x-" + kebobed : kebobed;
      };
      var attributeTpl = function(input) {
        var name = input.name, type = input.type;
        var attrName = kebob(name);
        if (uiView2.attr(attrName) && !bindings[name])
          return attrName + "='" + uiView2.attr(attrName) + "'";
        var resolveName = bindings[name] || name;
        if (type === "@")
          return attrName + "='{{" + prefix + "$resolve." + resolveName + "}}'";
        if (type === "&") {
          var res = context.getResolvable(resolveName);
          var fn = res && res.data;
          var args = fn && services.$injector.annotate(fn) || [];
          var arrayIdxStr = isArray(fn) ? "[" + (fn.length - 1) + "]" : "";
          return attrName + "='$resolve." + resolveName + arrayIdxStr + "(" + args.join(",") + ")'";
        }
        return attrName + "='" + prefix + "$resolve." + resolveName + "'";
      };
      var attrs = getComponentBindings(component).map(attributeTpl).join(" ");
      var kebobName = kebob(component);
      return "<" + kebobName + " " + attrs + "></" + kebobName + ">";
    };
    return TemplateFactory2;
  })()
);
function getComponentBindings(name) {
  var cmpDefs = services.$injector.get(name + "Directive");
  if (!cmpDefs || !cmpDefs.length)
    throw new Error("Unable to find component named '" + name + "'");
  return cmpDefs.map(getBindings).reduce(unnestR, []);
}
var getBindings = function(def) {
  if (isObject(def.bindToController))
    return scopeBindings(def.bindToController);
  return scopeBindings(def.scope);
};
var scopeBindings = function(bindingsObj) {
  return Object.keys(bindingsObj || {}).map(function(key) {
    return [key, /^([=<@&])[?]?(.*)/.exec(bindingsObj[key])];
  }).filter(function(tuple) {
    return isDefined(tuple) && isArray(tuple[1]);
  }).map(function(tuple) {
    return { name: tuple[1][2] || tuple[0], type: tuple[1][1] };
  });
};

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/stateProvider.js
var StateProvider = (
  /** @class */
  (function() {
    function StateProvider2(stateRegistry, stateService) {
      this.stateRegistry = stateRegistry;
      this.stateService = stateService;
      createProxyFunctions(val(StateProvider2.prototype), this, val(this));
    }
    StateProvider2.prototype.decorator = function(name, func) {
      return this.stateRegistry.decorator(name, func) || this;
    };
    StateProvider2.prototype.state = function(name, definition) {
      if (isObject(name)) {
        definition = name;
      } else {
        definition.name = name;
      }
      this.stateRegistry.register(definition);
      return this;
    };
    StateProvider2.prototype.onInvalid = function(callback) {
      return this.stateService.onInvalid(callback);
    };
    return StateProvider2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/statebuilders/onEnterExitRetain.js
var getStateHookBuilder = function(hookName) {
  return function stateHookBuilder(stateObject) {
    var hook = stateObject[hookName];
    var pathname = hookName === "onExit" ? "from" : "to";
    function decoratedNg1Hook(trans, state) {
      var resolveContext = new ResolveContext(trans.treeChanges(pathname));
      var subContext = resolveContext.subContext(state.$$state());
      var locals = extend(getLocals(subContext), { $state$: state, $transition$: trans });
      return services.$injector.invoke(hook, this, locals);
    }
    return hook ? decoratedNg1Hook : void 0;
  };
};

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/locationServices.js
var Ng1LocationServices = (
  /** @class */
  (function() {
    function Ng1LocationServices2($locationProvider) {
      this._urlListeners = [];
      this.$locationProvider = $locationProvider;
      var _lp = val($locationProvider);
      createProxyFunctions(_lp, this, _lp, ["hashPrefix"]);
    }
    Ng1LocationServices2.monkeyPatchPathParameterType = function(router2) {
      var pathType = router2.urlMatcherFactory.type("path");
      pathType.encode = function(x) {
        return x != null ? x.toString().replace(/(~|\/)/g, function(m) {
          return { "~": "~~", "/": "~2F" }[m];
        }) : x;
      };
      pathType.decode = function(x) {
        return x != null ? x.toString().replace(/(~~|~2F)/g, function(m) {
          return { "~~": "~", "~2F": "/" }[m];
        }) : x;
      };
    };
    Ng1LocationServices2.prototype.dispose = function() {
    };
    Ng1LocationServices2.prototype.onChange = function(callback) {
      var _this = this;
      this._urlListeners.push(callback);
      return function() {
        return removeFrom(_this._urlListeners)(callback);
      };
    };
    Ng1LocationServices2.prototype.html5Mode = function() {
      var html5Mode = this.$locationProvider.html5Mode();
      html5Mode = isObject(html5Mode) ? html5Mode.enabled : html5Mode;
      return html5Mode && this.$sniffer.history;
    };
    Ng1LocationServices2.prototype.baseHref = function() {
      return this._baseHref || (this._baseHref = this.$browser.baseHref() || this.$window.location.pathname);
    };
    Ng1LocationServices2.prototype.url = function(newUrl, replace, state) {
      if (replace === void 0) {
        replace = false;
      }
      if (isDefined(newUrl))
        this.$location.url(newUrl);
      if (replace)
        this.$location.replace();
      if (state)
        this.$location.state(state);
      return this.$location.url();
    };
    Ng1LocationServices2.prototype._runtimeServices = function($rootScope, $location, $sniffer, $browser, $window) {
      var _this = this;
      this.$location = $location;
      this.$sniffer = $sniffer;
      this.$browser = $browser;
      this.$window = $window;
      $rootScope.$on("$locationChangeSuccess", function(evt) {
        return _this._urlListeners.forEach(function(fn) {
          return fn(evt);
        });
      });
      var _loc = val($location);
      createProxyFunctions(_loc, this, _loc, ["replace", "path", "search", "hash"]);
      createProxyFunctions(_loc, this, _loc, ["port", "protocol", "host"]);
    };
    return Ng1LocationServices2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/urlRouterProvider.js
var UrlRouterProvider = (
  /** @class */
  (function() {
    function UrlRouterProvider2(router2) {
      this.router = router2;
    }
    UrlRouterProvider2.injectableHandler = function(router2, handler) {
      return function(match) {
        return services.$injector.invoke(handler, null, { $match: match, $stateParams: router2.globals.params });
      };
    };
    UrlRouterProvider2.prototype.$get = function() {
      var urlService = this.router.urlService;
      this.router.urlRouter.update(true);
      if (!urlService.interceptDeferred)
        urlService.listen();
      return this.router.urlRouter;
    };
    UrlRouterProvider2.prototype.rule = function(ruleFn) {
      var _this = this;
      if (!isFunction(ruleFn))
        throw new Error("'rule' must be a function");
      var match = function() {
        return ruleFn(services.$injector, _this.router.locationService);
      };
      var rule = new BaseUrlRule(match, identity);
      this.router.urlService.rules.rule(rule);
      return this;
    };
    UrlRouterProvider2.prototype.otherwise = function(rule) {
      var _this = this;
      var urlRules = this.router.urlService.rules;
      if (isString(rule)) {
        urlRules.otherwise(rule);
      } else if (isFunction(rule)) {
        urlRules.otherwise(function() {
          return rule(services.$injector, _this.router.locationService);
        });
      } else {
        throw new Error("'rule' must be a string or function");
      }
      return this;
    };
    UrlRouterProvider2.prototype.when = function(what, handler) {
      if (isArray(handler) || isFunction(handler)) {
        handler = UrlRouterProvider2.injectableHandler(this.router, handler);
      }
      this.router.urlService.rules.when(what, handler);
      return this;
    };
    UrlRouterProvider2.prototype.deferIntercept = function(defer) {
      this.router.urlService.deferIntercept(defer);
    };
    return UrlRouterProvider2;
  })()
);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/services.js
ng.module("ui.router.angular1", []);
var mod_init = ng.module("ui.router.init", ["ng"]);
var mod_util = ng.module("ui.router.util", ["ui.router.init"]);
var mod_rtr = ng.module("ui.router.router", ["ui.router.util"]);
var mod_state = ng.module("ui.router.state", ["ui.router.router", "ui.router.util", "ui.router.angular1"]);
var mod_main = ng.module("ui.router", ["ui.router.init", "ui.router.state", "ui.router.angular1"]);
var mod_cmpt = ng.module("ui.router.compat", ["ui.router"]);
var router = null;
$uiRouterProvider.$inject = ["$locationProvider"];
function $uiRouterProvider($locationProvider) {
  router = this.router = new UIRouter();
  router.stateProvider = new StateProvider(router.stateRegistry, router.stateService);
  router.stateRegistry.decorator("views", ng1ViewsBuilder);
  router.stateRegistry.decorator("onExit", getStateHookBuilder("onExit"));
  router.stateRegistry.decorator("onRetain", getStateHookBuilder("onRetain"));
  router.stateRegistry.decorator("onEnter", getStateHookBuilder("onEnter"));
  router.viewService._pluginapi._viewConfigFactory("ng1", getNg1ViewConfigFactory());
  router.urlService.config._decodeParams = false;
  var ng1LocationService = router.locationService = router.locationConfig = new Ng1LocationServices($locationProvider);
  Ng1LocationServices.monkeyPatchPathParameterType(router);
  router["router"] = router;
  router["$get"] = $get;
  $get.$inject = ["$location", "$browser", "$window", "$sniffer", "$rootScope", "$http", "$templateCache"];
  function $get($location, $browser, $window, $sniffer, $rootScope, $http, $templateCache) {
    ng1LocationService._runtimeServices($rootScope, $location, $sniffer, $browser, $window);
    delete router["router"];
    delete router["$get"];
    return router;
  }
  return router;
}
var getProviderFor = function(serviceName) {
  return [
    "$uiRouterProvider",
    function($urp) {
      var service = $urp.router[serviceName];
      service["$get"] = function() {
        return service;
      };
      return service;
    }
  ];
};
runBlock.$inject = ["$injector", "$q", "$uiRouter"];
function runBlock($injector2, $q2, $uiRouter) {
  services.$injector = $injector2;
  services.$q = $q2;
  if (!Object.prototype.hasOwnProperty.call($injector2, "strictDi")) {
    try {
      $injector2.invoke(function(checkStrictDi) {
      });
    } catch (error) {
      $injector2.strictDi = !!/strict mode/.exec(error && error.toString());
    }
  }
  $uiRouter.stateRegistry.get().map(function(x) {
    return x.$$state().resolvables;
  }).reduce(unnestR, []).filter(function(x) {
    return x.deps === "deferred";
  }).forEach(function(resolvable) {
    return resolvable.deps = $injector2.annotate(resolvable.resolveFn, $injector2.strictDi);
  });
}
var getUrlRouterProvider = function(uiRouter) {
  return uiRouter.urlRouterProvider = new UrlRouterProvider(uiRouter);
};
var getStateProvider = function() {
  return extend(router.stateProvider, { $get: function() {
    return router.stateService;
  } });
};
watchDigests.$inject = ["$rootScope"];
function watchDigests($rootScope) {
  $rootScope.$watch(function() {
    trace.approximateDigests++;
  });
}
mod_init.provider("$uiRouter", $uiRouterProvider);
mod_rtr.provider("$urlRouter", ["$uiRouterProvider", getUrlRouterProvider]);
mod_util.provider("$urlService", getProviderFor("urlService"));
mod_util.provider("$urlMatcherFactory", ["$uiRouterProvider", function() {
  return router.urlMatcherFactory;
}]);
mod_util.provider("$templateFactory", function() {
  return new TemplateFactory();
});
mod_state.provider("$stateRegistry", getProviderFor("stateRegistry"));
mod_state.provider("$uiRouterGlobals", getProviderFor("globals"));
mod_state.provider("$transitions", getProviderFor("transitionService"));
mod_state.provider("$state", ["$uiRouterProvider", getStateProvider]);
mod_state.factory("$stateParams", ["$uiRouter", function($uiRouter) {
  return $uiRouter.globals.params;
}]);
mod_main.factory("$view", function() {
  return router.viewService;
});
mod_main.service("$trace", function() {
  return trace;
});
mod_main.run(watchDigests);
mod_util.run(["$urlMatcherFactory", function($urlMatcherFactory) {
}]);
mod_state.run(["$state", function($state) {
}]);
mod_rtr.run(["$urlRouter", function($urlRouter) {
}]);
mod_init.run(runBlock);
var getLocals = function(ctx) {
  var tokens = ctx.getTokens().filter(isString);
  var tuples = tokens.map(function(key) {
    var resolvable = ctx.getResolvable(key);
    var waitPolicy = ctx.getPolicy(resolvable).async;
    return [key, waitPolicy === "NOWAIT" ? resolvable.promise : resolvable.data];
  });
  return tuples.reduce(applyPairs, {});
};

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/directives/stateDirectives.js
function parseStateRef(ref) {
  var paramsOnly = ref.match(/^\s*({[^}]*})\s*$/);
  if (paramsOnly)
    ref = "(" + paramsOnly[1] + ")";
  var parsed = ref.replace(/\n/g, " ").match(/^\s*([^(]*?)\s*(\((.*)\))?\s*$/);
  if (!parsed || parsed.length !== 4)
    throw new Error("Invalid state ref '" + ref + "'");
  return { state: parsed[1] || null, paramExpr: parsed[3] || null };
}
function stateContext(el) {
  var $uiView = el.parent().inheritedData("$uiView");
  var path = parse("$cfg.path")($uiView);
  return path ? tail(path).state.name : void 0;
}
function processedDef($state, $element, def) {
  var uiState = def.uiState || $state.current.name;
  var uiStateOpts = extend(defaultOpts($element, $state), def.uiStateOpts || {});
  var href = $state.href(uiState, def.uiStateParams, uiStateOpts);
  return { uiState, uiStateParams: def.uiStateParams, uiStateOpts, href };
}
function getTypeInfo(el) {
  var isSvg = Object.prototype.toString.call(el.prop("href")) === "[object SVGAnimatedString]";
  var isForm = el[0].nodeName === "FORM";
  return {
    attr: isForm ? "action" : isSvg ? "xlink:href" : "href",
    isAnchor: el.prop("tagName").toUpperCase() === "A",
    clickable: !isForm
  };
}
function clickHook(el, $state, $timeout, type, getDef) {
  return function(e) {
    var button = e.which || e.button, target = getDef();
    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || el.attr("target"))) {
      var transition_1 = $timeout(function() {
        if (!el.attr("disabled")) {
          $state.go(target.uiState, target.uiStateParams, target.uiStateOpts);
        }
      });
      e.preventDefault();
      var ignorePreventDefaultCount_1 = type.isAnchor && !target.href ? 1 : 0;
      e.preventDefault = function() {
        if (ignorePreventDefaultCount_1-- <= 0)
          $timeout.cancel(transition_1);
      };
    }
  };
}
function defaultOpts(el, $state) {
  return {
    relative: stateContext(el) || $state.$current,
    inherit: true,
    source: "sref"
  };
}
function bindEvents(element, scope, hookFn, uiStateOpts) {
  var events;
  if (uiStateOpts) {
    events = uiStateOpts.events;
  }
  if (!isArray(events)) {
    events = ["click"];
  }
  var on = element.on ? "on" : "bind";
  for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
    var event_1 = events_1[_i];
    element[on](event_1, hookFn);
  }
  scope.$on("$destroy", function() {
    var off = element.off ? "off" : "unbind";
    for (var _i2 = 0, events_2 = events; _i2 < events_2.length; _i2++) {
      var event_2 = events_2[_i2];
      element[off](event_2, hookFn);
    }
  });
}
var uiSrefDirective;
uiSrefDirective = [
  "$uiRouter",
  "$timeout",
  function $StateRefDirective($uiRouter, $timeout) {
    var $state = $uiRouter.stateService;
    return {
      restrict: "A",
      require: ["?^uiSrefActive", "?^uiSrefActiveEq"],
      link: function(scope, element, attrs, uiSrefActive) {
        var type = getTypeInfo(element);
        var active = uiSrefActive[1] || uiSrefActive[0];
        var unlinkInfoFn = null;
        var rawDef = {};
        var getDef = function() {
          return processedDef($state, element, rawDef);
        };
        var ref = parseStateRef(attrs.uiSref);
        rawDef.uiState = ref.state;
        rawDef.uiStateOpts = attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {};
        function update() {
          var def = getDef();
          if (unlinkInfoFn)
            unlinkInfoFn();
          if (active)
            unlinkInfoFn = active.$$addStateInfo(def.uiState, def.uiStateParams);
          if (def.href != null)
            attrs.$set(type.attr, def.href);
        }
        if (ref.paramExpr) {
          scope.$watch(ref.paramExpr, function(val2) {
            rawDef.uiStateParams = extend({}, val2);
            update();
          }, true);
          rawDef.uiStateParams = extend({}, scope.$eval(ref.paramExpr));
        }
        update();
        scope.$on("$destroy", $uiRouter.stateRegistry.onStatesChanged(update));
        scope.$on("$destroy", $uiRouter.transitionService.onSuccess({}, update));
        if (!type.clickable)
          return;
        var hookFn = clickHook(element, $state, $timeout, type, getDef);
        bindEvents(element, scope, hookFn, rawDef.uiStateOpts);
      }
    };
  }
];
var uiStateDirective;
uiStateDirective = [
  "$uiRouter",
  "$timeout",
  function $StateRefDynamicDirective($uiRouter, $timeout) {
    var $state = $uiRouter.stateService;
    return {
      restrict: "A",
      require: ["?^uiSrefActive", "?^uiSrefActiveEq"],
      link: function(scope, element, attrs, uiSrefActive) {
        var type = getTypeInfo(element);
        var active = uiSrefActive[1] || uiSrefActive[0];
        var unlinkInfoFn = null;
        var hookFn;
        var rawDef = {};
        var getDef = function() {
          return processedDef($state, element, rawDef);
        };
        var inputAttrs = ["uiState", "uiStateParams", "uiStateOpts"];
        var watchDeregFns = inputAttrs.reduce(function(acc, attr) {
          return acc[attr] = noop, acc;
        }, {});
        function update() {
          var def = getDef();
          if (unlinkInfoFn)
            unlinkInfoFn();
          if (active)
            unlinkInfoFn = active.$$addStateInfo(def.uiState, def.uiStateParams);
          if (def.href != null)
            attrs.$set(type.attr, def.href);
        }
        inputAttrs.forEach(function(field) {
          rawDef[field] = attrs[field] ? scope.$eval(attrs[field]) : null;
          attrs.$observe(field, function(expr) {
            watchDeregFns[field]();
            watchDeregFns[field] = scope.$watch(expr, function(newval) {
              rawDef[field] = newval;
              update();
            }, true);
          });
        });
        update();
        scope.$on("$destroy", $uiRouter.stateRegistry.onStatesChanged(update));
        scope.$on("$destroy", $uiRouter.transitionService.onSuccess({}, update));
        if (!type.clickable)
          return;
        hookFn = clickHook(element, $state, $timeout, type, getDef);
        bindEvents(element, scope, hookFn, rawDef.uiStateOpts);
      }
    };
  }
];
var uiSrefActiveDirective;
uiSrefActiveDirective = [
  "$state",
  "$stateParams",
  "$interpolate",
  "$uiRouter",
  function $StateRefActiveDirective($state, $stateParams, $interpolate, $uiRouter) {
    return {
      restrict: "A",
      controller: [
        "$scope",
        "$element",
        "$attrs",
        function($scope, $element, $attrs) {
          var states = [];
          var activeEqClass;
          var uiSrefActive;
          activeEqClass = $interpolate($attrs.uiSrefActiveEq || "", false)($scope);
          try {
            uiSrefActive = $scope.$eval($attrs.uiSrefActive);
          } catch (e) {
          }
          uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || "", false)($scope);
          setStatesFromDefinitionObject(uiSrefActive);
          this.$$addStateInfo = function(newState, newParams) {
            if (isObject(uiSrefActive) && states.length > 0) {
              return;
            }
            var deregister = addState(newState, newParams, uiSrefActive);
            update();
            return deregister;
          };
          function updateAfterTransition(trans) {
            trans.promise.then(update, noop);
          }
          $scope.$on("$destroy", setupEventListeners());
          if ($uiRouter.globals.transition) {
            updateAfterTransition($uiRouter.globals.transition);
          }
          function setupEventListeners() {
            var deregisterStatesChangedListener = $uiRouter.stateRegistry.onStatesChanged(handleStatesChanged);
            var deregisterOnStartListener = $uiRouter.transitionService.onStart({}, updateAfterTransition);
            var deregisterStateChangeSuccessListener = $scope.$on("$stateChangeSuccess", update);
            return function cleanUp() {
              deregisterStatesChangedListener();
              deregisterOnStartListener();
              deregisterStateChangeSuccessListener();
            };
          }
          function handleStatesChanged() {
            setStatesFromDefinitionObject(uiSrefActive);
          }
          function setStatesFromDefinitionObject(statesDefinition) {
            if (isObject(statesDefinition)) {
              states = [];
              forEach(statesDefinition, function(stateOrName, activeClass) {
                var addStateForClass = function(stateOrName2, activeClass2) {
                  var ref = parseStateRef(stateOrName2);
                  addState(ref.state, $scope.$eval(ref.paramExpr), activeClass2);
                };
                if (isString(stateOrName)) {
                  addStateForClass(stateOrName, activeClass);
                } else if (isArray(stateOrName)) {
                  forEach(stateOrName, function(stateOrName2) {
                    addStateForClass(stateOrName2, activeClass);
                  });
                }
              });
            }
          }
          function addState(stateName, stateParams, activeClass) {
            var state = $state.get(stateName, stateContext($element));
            var stateInfo = {
              state: state || { name: stateName },
              params: stateParams,
              activeClass
            };
            states.push(stateInfo);
            return function removeState() {
              removeFrom(states)(stateInfo);
            };
          }
          function update() {
            var splitClasses = function(str) {
              return str.split(/\s/).filter(identity);
            };
            var getClasses = function(stateList) {
              return stateList.map(function(x) {
                return x.activeClass;
              }).map(splitClasses).reduce(unnestR, []);
            };
            var allClasses = getClasses(states).concat(splitClasses(activeEqClass)).reduce(uniqR, []);
            var fuzzyClasses = getClasses(states.filter(function(x) {
              return $state.includes(x.state.name, x.params);
            }));
            var exactlyMatchesAny = !!states.filter(function(x) {
              return $state.is(x.state.name, x.params);
            }).length;
            var exactClasses = exactlyMatchesAny ? splitClasses(activeEqClass) : [];
            var addClasses = fuzzyClasses.concat(exactClasses).reduce(uniqR, []);
            var removeClasses = allClasses.filter(function(cls) {
              return !inArray(addClasses, cls);
            });
            $scope.$evalAsync(function() {
              addClasses.forEach(function(className) {
                return $element.addClass(className);
              });
              removeClasses.forEach(function(className) {
                return $element.removeClass(className);
              });
            });
          }
          update();
        }
      ]
    };
  }
];
ng.module("ui.router.state").directive("uiSref", uiSrefDirective).directive("uiSrefActive", uiSrefActiveDirective).directive("uiSrefActiveEq", uiSrefActiveDirective).directive("uiState", uiStateDirective);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/stateFilters.js
$IsStateFilter.$inject = ["$state"];
function $IsStateFilter($state) {
  var isFilter = function(state, params, options) {
    return $state.is(state, params, options);
  };
  isFilter.$stateful = true;
  return isFilter;
}
$IncludedByStateFilter.$inject = ["$state"];
function $IncludedByStateFilter($state) {
  var includesFilter = function(state, params, options) {
    return $state.includes(state, params, options);
  };
  includesFilter.$stateful = true;
  return includesFilter;
}
ng.module("ui.router.state").filter("isState", $IsStateFilter).filter("includedByState", $IncludedByStateFilter);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/directives/viewDirective.js
var uiView;
uiView = [
  "$view",
  "$animate",
  "$uiViewScroll",
  "$interpolate",
  "$q",
  function $ViewDirective($view, $animate, $uiViewScroll, $interpolate, $q2) {
    function getRenderer() {
      return {
        enter: function(element, target, cb) {
          if (ng.version.minor > 2) {
            $animate.enter(element, null, target).then(cb);
          } else {
            $animate.enter(element, null, target, cb);
          }
        },
        leave: function(element, cb) {
          if (ng.version.minor > 2) {
            $animate.leave(element).then(cb);
          } else {
            $animate.leave(element, cb);
          }
        }
      };
    }
    function configsEqual(config1, config2) {
      return config1 === config2;
    }
    var rootData = {
      $cfg: { viewDecl: { $context: $view._pluginapi._rootViewContext() } },
      $uiView: {}
    };
    var directive = {
      count: 0,
      restrict: "ECA",
      terminal: true,
      priority: 400,
      transclude: "element",
      compile: function(tElement, tAttrs, $transclude) {
        return function(scope, $element, attrs) {
          var onloadExp = attrs["onload"] || "", autoScrollExp = attrs["autoscroll"], renderer = getRenderer(), inherited = $element.inheritedData("$uiView") || rootData, name = $interpolate(attrs["uiView"] || attrs["name"] || "")(scope) || "$default";
          var previousEl, currentEl, currentScope, viewConfig;
          var activeUIView = {
            $type: "ng1",
            id: directive.count++,
            name,
            fqn: inherited.$uiView.fqn ? inherited.$uiView.fqn + "." + name : name,
            config: null,
            configUpdated: configUpdatedCallback,
            get creationContext() {
              var fromParentTagConfig = parse("$cfg.viewDecl.$context")(inherited);
              var fromParentTag = parse("$uiView.creationContext")(inherited);
              return fromParentTagConfig || fromParentTag;
            }
          };
          trace.traceUIViewEvent("Linking", activeUIView);
          function configUpdatedCallback(config) {
            if (config && !(config instanceof Ng1ViewConfig))
              return;
            if (configsEqual(viewConfig, config))
              return;
            trace.traceUIViewConfigUpdated(activeUIView, config && config.viewDecl && config.viewDecl.$context);
            viewConfig = config;
            updateView(config);
          }
          $element.data("$uiView", { $uiView: activeUIView });
          updateView();
          var unregister = $view.registerUIView(activeUIView);
          scope.$on("$destroy", function() {
            trace.traceUIViewEvent("Destroying/Unregistering", activeUIView);
            unregister();
          });
          function cleanupLastView() {
            if (previousEl) {
              trace.traceUIViewEvent("Removing (previous) el", previousEl.data("$uiView"));
              previousEl.remove();
              previousEl = null;
            }
            if (currentScope) {
              trace.traceUIViewEvent("Destroying scope", activeUIView);
              currentScope.$destroy();
              currentScope = null;
            }
            if (currentEl) {
              var _viewData_1 = currentEl.data("$uiViewAnim");
              trace.traceUIViewEvent("Animate out", _viewData_1);
              renderer.leave(currentEl, function() {
                _viewData_1.$$animLeave.resolve();
                previousEl = null;
              });
              previousEl = currentEl;
              currentEl = null;
            }
          }
          function updateView(config) {
            var newScope = scope.$new();
            var animEnter = $q2.defer(), animLeave = $q2.defer();
            var $uiViewData = {
              $cfg: config,
              $uiView: activeUIView
            };
            var $uiViewAnim = {
              $animEnter: animEnter.promise,
              $animLeave: animLeave.promise,
              $$animLeave: animLeave
            };
            newScope.$emit("$viewContentLoading", name);
            var cloned = $transclude(newScope, function(clone) {
              clone.data("$uiViewAnim", $uiViewAnim);
              clone.data("$uiView", $uiViewData);
              renderer.enter(clone, $element, function onUIViewEnter() {
                animEnter.resolve();
                if (currentScope)
                  currentScope.$emit("$viewContentAnimationEnded");
                if (isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                  $uiViewScroll(clone);
                }
              });
              cleanupLastView();
            });
            currentEl = cloned;
            currentScope = newScope;
            currentScope.$emit("$viewContentLoaded", config || viewConfig);
            currentScope.$eval(onloadExp);
          }
        };
      }
    };
    return directive;
  }
];
$ViewDirectiveFill.$inject = ["$compile", "$controller", "$transitions", "$view", "$q"];
function $ViewDirectiveFill($compile, $controller, $transitions, $view, $q2) {
  var getControllerAs = parse("viewDecl.controllerAs");
  var getResolveAs = parse("viewDecl.resolveAs");
  return {
    restrict: "ECA",
    priority: -400,
    compile: function(tElement) {
      var initial = tElement.html();
      tElement.empty();
      return function(scope, $element) {
        var data = $element.data("$uiView");
        if (!data) {
          $element.html(initial);
          $compile($element.contents())(scope);
          return;
        }
        var cfg = data.$cfg || { viewDecl: {}, getTemplate: noop };
        var resolveCtx = cfg.path && new ResolveContext(cfg.path);
        $element.html(cfg.getTemplate($element, resolveCtx) || initial);
        trace.traceUIViewFill(data.$uiView, $element.html());
        var link = $compile($element.contents());
        var controller = cfg.controller;
        var controllerAs = getControllerAs(cfg);
        var resolveAs = getResolveAs(cfg);
        var locals = resolveCtx && getLocals(resolveCtx);
        scope[resolveAs] = locals;
        if (controller) {
          var controllerInstance = $controller(controller, extend({}, locals, { $scope: scope, $element }));
          if (controllerAs) {
            scope[controllerAs] = controllerInstance;
            scope[controllerAs][resolveAs] = locals;
          }
          $element.data("$ngControllerController", controllerInstance);
          $element.children().data("$ngControllerController", controllerInstance);
          registerControllerCallbacks($q2, $transitions, controllerInstance, scope, cfg);
        }
        if (isString(cfg.component)) {
          var kebobName = kebobString(cfg.component);
          var tagRegexp_1 = new RegExp("^(x-|data-)?" + kebobName + "$", "i");
          var getComponentController = function() {
            var directiveEl = [].slice.call($element[0].children).filter(function(el) {
              return el && el.tagName && tagRegexp_1.exec(el.tagName);
            });
            return directiveEl && ng.element(directiveEl).data("$" + cfg.component + "Controller");
          };
          var deregisterWatch_1 = scope.$watch(getComponentController, function(ctrlInstance) {
            if (!ctrlInstance)
              return;
            registerControllerCallbacks($q2, $transitions, ctrlInstance, scope, cfg);
            deregisterWatch_1();
          });
        }
        link(scope);
      };
    }
  };
}
var hasComponentImpl = typeof ng.module("ui.router")["component"] === "function";
var _uiCanExitId = 0;
function registerControllerCallbacks($q2, $transitions, controllerInstance, $scope, cfg) {
  if (isFunction(controllerInstance.$onInit) && !((cfg.viewDecl.component || cfg.viewDecl.componentProvider) && hasComponentImpl)) {
    controllerInstance.$onInit();
  }
  var viewState = tail(cfg.path).state.self;
  var hookOptions = { bind: controllerInstance };
  if (isFunction(controllerInstance.uiOnParamsChanged)) {
    var resolveContext = new ResolveContext(cfg.path);
    var viewCreationTrans_1 = resolveContext.getResolvable("$transition$").data;
    var paramsUpdated = function($transition$) {
      if ($transition$ === viewCreationTrans_1 || $transition$.exiting().indexOf(viewState) !== -1)
        return;
      var toParams = $transition$.params("to");
      var fromParams = $transition$.params("from");
      var getNodeSchema = function(node) {
        return node.paramSchema;
      };
      var toSchema = $transition$.treeChanges("to").map(getNodeSchema).reduce(unnestR, []);
      var fromSchema = $transition$.treeChanges("from").map(getNodeSchema).reduce(unnestR, []);
      var changedToParams = toSchema.filter(function(param) {
        var idx = fromSchema.indexOf(param);
        return idx === -1 || !fromSchema[idx].type.equals(toParams[param.id], fromParams[param.id]);
      });
      if (changedToParams.length) {
        var changedKeys_1 = changedToParams.map(function(x) {
          return x.id;
        });
        var newValues = filter(toParams, function(val2, key) {
          return changedKeys_1.indexOf(key) !== -1;
        });
        controllerInstance.uiOnParamsChanged(newValues, $transition$);
      }
    };
    $scope.$on("$destroy", $transitions.onSuccess({}, paramsUpdated, hookOptions));
  }
  if (isFunction(controllerInstance.uiCanExit)) {
    var id_1 = _uiCanExitId++;
    var cacheProp_1 = "_uiCanExitIds";
    var prevTruthyAnswer_1 = function(trans) {
      return !!trans && (trans[cacheProp_1] && trans[cacheProp_1][id_1] === true || prevTruthyAnswer_1(trans.redirectedFrom()));
    };
    var wrappedHook = function(trans) {
      var promise;
      var ids = trans[cacheProp_1] = trans[cacheProp_1] || {};
      if (!prevTruthyAnswer_1(trans)) {
        promise = $q2.when(controllerInstance.uiCanExit(trans));
        promise.then(function(val2) {
          return ids[id_1] = val2 !== false;
        });
      }
      return promise;
    };
    var criteria = { exiting: viewState.name };
    $scope.$on("$destroy", $transitions.onBefore(criteria, wrappedHook, hookOptions));
  }
}
ng.module("ui.router.state").directive("uiView", uiView);
ng.module("ui.router.state").directive("uiView", $ViewDirectiveFill);

// ../ngjs-core/node_modules/@uirouter/angularjs/lib-esm/viewScroll.js
function $ViewScrollProvider() {
  var useAnchorScroll = false;
  this.useAnchorScroll = function() {
    useAnchorScroll = true;
  };
  this.$get = [
    "$anchorScroll",
    "$timeout",
    function($anchorScroll, $timeout) {
      if (useAnchorScroll) {
        return $anchorScroll;
      }
      return function($element) {
        return $timeout(function() {
          $element[0].scrollIntoView();
        }, 0, false);
      };
    }
  ];
}
ng.module("ui.router.state").provider("$uiViewScroll", $ViewScrollProvider);

// ../ngjs-core/dist/router/index.js
var import_angular7 = __toESM(require_angular(), 1);
var import_angular8 = __toESM(require_angular(), 1);
var import_angular9 = __toESM(require_angular(), 1);
var import_angular10 = __toESM(require_angular(), 1);
var ParamMapImpl = class {
  constructor(params) {
    this.params = params;
  }
  has(name) {
    return Object.hasOwn(this.params, name);
  }
  get(name) {
    if (!this.has(name)) return null;
    const value = this.params[name];
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
  }
  getAll(name) {
    if (!this.has(name)) return [];
    const value = this.params[name];
    return Array.isArray(value) ? value : value === void 0 ? [] : [
      value
    ];
  }
  get keys() {
    return Object.keys(this.params);
  }
};
function convertToParamMap(params) {
  return new ParamMapImpl(params);
}
function pickRouteTitle(chain, titles) {
  let picked;
  for (const node of chain) {
    const candidate = titles.get(node.name);
    if (candidate !== void 0) picked = candidate;
  }
  return picked;
}
function pickRouteTitleState(chain, titles) {
  let picked;
  for (const node of chain) if (titles.has(node.name)) picked = node.name;
  return picked;
}
function mergeStaticData(chain, emptyPathStates, strategy) {
  if (chain.length === 0) return {};
  if (strategy === "always") {
    return chain.reduce((acc, node) => ({
      ...acc,
      ...node.data ?? {}
    }), {});
  }
  let merged = {
    ...chain[chain.length - 1].data ?? {}
  };
  for (let i = chain.length - 1; i > 0; i--) {
    if (!emptyPathStates.has(chain[i].name)) break;
    merged = {
      ...chain[i - 1].data ?? {},
      ...merged
    };
  }
  return merged;
}
function mergeResolvedData(chain, resolveKeys, staticData, injector) {
  const data = {
    ...staticData
  };
  if (!injector) return data;
  for (const node of chain) {
    for (const key of resolveKeys.get(node.name) ?? []) {
      try {
        data[key] = injector.get(key);
      } catch {
      }
    }
  }
  return data;
}
var RouterRegistry = class {
  mergeTitles(titles) {
    for (const [key, value] of titles) this.titles.set(key, value);
  }
  mergeResolveKeys(resolveKeys) {
    for (const [key, value] of resolveKeys) this.resolveKeys.set(key, value);
  }
  mergeEmptyPathStates(emptyPathStates) {
    for (const name of emptyPathStates) this.emptyPathStates.add(name);
  }
  mergeRouteProviders(routeProviders) {
    for (const [key, value] of routeProviders) this.routeProviders.set(key, value);
  }
  mergeLazyChildrenStates(names) {
    for (const name of names) this.lazyChildrenStates.add(name);
  }
  mergePathToName(pathToName) {
    for (const [key, value] of pathToName) this.pathToName.set(key, value);
  }
  registerChildRoutes(moduleName, routes) {
    this.childRoutes.set(moduleName, routes);
  }
  childRoutesOf(moduleName) {
    return this.childRoutes.get(moduleName);
  }
  reset() {
    this.childRoutes.clear();
    this.titles.clear();
    this.resolveKeys.clear();
    this.emptyPathStates.clear();
    this.lazyChildrenStates.clear();
    this.routeProviders.clear();
    this.pathToName.clear();
  }
  constructor() {
    this.titles = /* @__PURE__ */ new Map();
    this.resolveKeys = /* @__PURE__ */ new Map();
    this.emptyPathStates = /* @__PURE__ */ new Set();
    this.lazyChildrenStates = /* @__PURE__ */ new Set();
    this.routeProviders = /* @__PURE__ */ new Map();
    this.pathToName = /* @__PURE__ */ new Map();
    this.childRoutes = /* @__PURE__ */ new Map();
  }
};
var routerRegistry = new RouterRegistry();
var LazyNgModuleLoader = class {
  constructor($injector2) {
    this.$injector = $injector2;
    this.routes = [];
  }
  load(moduleType) {
    const registrar = ConfigProviderFactory.current;
    if (!registrar) throw new Error("loadChildren: no hay providers de config capturados (¿falta el bootstrap?).");
    const id3 = moduleType.ɵmod?.id;
    if (!id3) throw new Error(`loadChildren: "${moduleType.name}" no es un @NgModule compilado.`);
    this.collectRoutes(id3, /* @__PURE__ */ new Set());
    const newModules = [];
    this.collectNewModules(id3, newModules);
    const runBlocks = [];
    for (const module2 of newModules) {
      this.assertNoDeclarationCollisions(module2);
      this.runQueue(module2._invokeQueue, registrar.$providerInjector);
      this.runQueue(module2._configBlocks, registrar.$providerInjector);
      runBlocks.push(...module2._runBlocks);
    }
    for (const block of runBlocks) this.$injector.invoke(block);
    return this.routes;
  }
  /** `Routes` de todos los `forChild` del grafo de imports — también de módulos ya cargados (Angular junta `ROUTES`). */
  collectRoutes(name, visited) {
    if (visited.has(name)) return;
    visited.add(name);
    const childRoutes = routerRegistry.childRoutesOf(name);
    if (childRoutes) {
      this.routes.push(...childRoutes);
      return;
    }
    for (const required of import_angular7.default.module(name).requires) this.collectRoutes(required, visited);
  }
  /** Módulos del grafo que la app no tiene cargados, en post-orden (imports primero); los marca cargados. */
  collectNewModules(name, out) {
    if (this.$injector.modules[name]) return;
    const module2 = import_angular7.default.module(name);
    this.$injector.modules[name] = module2;
    if (routerRegistry.childRoutesOf(name)) return;
    for (const required of module2.requires) this.collectNewModules(required, out);
    out.push(module2);
  }
  /**
  * En AngularJS los nombres son globales: un componente o pipe lazy con un nombre ya registrado se aplicaría encima
  * del existente (doble template) o lo pisaría para toda la app — se corta con un error claro.
  */
  assertNoDeclarationCollisions(module2) {
    for (const [providerName, method, args] of module2._invokeQueue) {
      const name = args[0];
      if (typeof name !== "string") continue;
      const isComponent = providerName === "$compileProvider" && method === "component";
      const isPipe = providerName === "$filterProvider" && method === "register";
      const registered = isComponent ? `${name}Directive` : isPipe ? `${name}Filter` : void 0;
      if (registered && this.$injector.has(registered)) {
        throw new Error(`loadChildren: el @NgModule lazy "${module2.name}" declara ${isComponent ? "un componente" : "un pipe"} "${name}" que ya existe en la app. En AngularJS las declarations son globales — renombralo o movelo a un módulo compartido.`);
      }
    }
  }
  runQueue(queue, providerInjector) {
    for (const [providerName, method, args] of queue) {
      if (providerName === "$provide" && method === "decorator" && args[0] === "$controller") {
        if (LateControllerDecorators.add(this.$injector, args[1])) continue;
      }
      const provider = providerInjector.get(providerName);
      provider[method].apply(provider, args);
    }
  }
};
function resolveRouteComponentInstance(componentCamelName) {
  const kebab = componentCamelName.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const element = document.querySelector(kebab);
  if (!element) return void 0;
  const jq = import_angular8.default.element(element);
  return jq.controller(componentCamelName);
}
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
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
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
var LazyLoadMemo = class {
  run($injector2, stateName, load) {
    let loads = this.byInjector.get($injector2);
    if (!loads) {
      loads = /* @__PURE__ */ new Map();
      this.byInjector.set($injector2, loads);
    }
    const existing = loads.get(stateName);
    if (existing) return existing.promise;
    const entry = {
      promise: load(),
      done: false
    };
    loads.set(stateName, entry);
    const owner = loads;
    entry.promise.then(() => {
      entry.done = true;
    }, () => {
      owner.delete(stateName);
    });
    return entry.promise;
  }
  isLoaded($injector2, stateName) {
    return this.byInjector.get($injector2)?.get(stateName)?.done ?? false;
  }
  constructor() {
    this.byInjector = /* @__PURE__ */ new WeakMap();
  }
};
var lazyLoadMemo = new LazyLoadMemo();
var AppLazyRoutes = class {
  add($injector2, entries) {
    let list = this.byInjector.get($injector2);
    if (!list) {
      list = [];
      this.byInjector.set($injector2, list);
    }
    for (const entry of entries) if (!list.includes(entry)) list.push(entry);
  }
  of($injector2) {
    return this.byInjector.get($injector2) ?? [];
  }
  constructor() {
    this.byInjector = /* @__PURE__ */ new WeakMap();
  }
};
var appLazyRoutes = new AppLazyRoutes();
function wireLazyRoutes(entries) {
  const run = ($injector2) => appLazyRoutes.add($injector2, entries);
  run.$inject = [
    "$injector"
  ];
  return run;
}
var LazyRoute = class {
  constructor(route, stateName, handler) {
    this.route = route;
    this.stateName = stateName;
    this.handler = handler;
  }
  load(context) {
    return lazyLoadMemo.run(context.$injector, this.stateName, () => this.handler(context));
  }
  isLoaded($injector2) {
    return lazyLoadMemo.isLoaded($injector2, this.stateName);
  }
  /** Handler `lazyLoad` de UI-Router: arma el contexto desde la transición. */
  forTransition() {
    return (transition) => this.load({
      stateRegistry: transition.router.stateRegistry,
      $injector: transition.injector().get("$injector")
    });
  }
};
var WILDCARD = "**";
function segmentName(path, index) {
  const raw = (path ?? "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return raw || `route${index}`;
}
function dedupe(name, used) {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  let n = 2;
  while (used.has(`${name}_${n}`)) n += 1;
  const unique = `${name}_${n}`;
  used.add(unique);
  return unique;
}
function segmentUrl(path) {
  const p = path ?? "";
  return p ? `/${p}` : "";
}
function joinPath(parent, segment) {
  const s = `${parent}/${segment}`.replace(/\/{2,}/g, "/").replace(/^\/|\/$/g, "");
  return s;
}
function componentName(route) {
  if (!route.component) return void 0;
  const tag = CompiledType.componentTag(route.component);
  if (!tag) {
    throw new Error(`RouterModule: el component de la ruta "${route.path ?? ""}" no es un @Component compilado con selector de elemento.`);
  }
  return CompiledType.camelCase(tag);
}
function runInRouteContext($injector2, _stateName, fn) {
  const injector = new InjectorImpl($injector2);
  return runInInjectionContext({
    get: (token, options) => options?.optional ? injector.get(token, null) : injector.get(token)
  }, fn);
}
function registerRouteProviders(routeProviders) {
  if (!routeProviders.size) return;
  const registrar = ConfigProviderFactory.current;
  if (!registrar) throw new Error("RouterModule: no hay providers de config capturados (falta el bootstrap).");
  for (const providers of routeProviders.values()) RuntimeProviders.register(registrar.$provide, providers);
}
function translateResolve(resolve, data, stateName) {
  if (!resolve) return void 0;
  const out = {};
  for (const [key, value] of Object.entries(resolve)) {
    if (typeof value !== "function") continue;
    out[key] = [
      "$stateParams",
      "$location",
      "$injector",
      ($stateParams, $location, $injector2) => {
        const snapshot = {
          params: {
            ...$stateParams
          },
          data,
          queryParams: {
            ...$location.search()
          },
          fragment: $location.hash() || null
        };
        return runInRouteContext($injector2, stateName, () => value(snapshot));
      }
    ];
  }
  return Object.keys(out).length ? out : void 0;
}
function resolveKeysOf(resolve) {
  if (!resolve) return [];
  return Object.entries(resolve).filter(([, v]) => typeof v === "function").map(([k]) => k);
}
function lazyLoadFor(route, stateName, url, data) {
  const load = route.loadComponent;
  if (!load) throw new Error("lazyLoadFor: ruta sin loadComponent");
  return (context) => _async_to_generator(function* () {
    const loaded = yield load();
    const cls = loaded.default ?? loaded;
    if (!CompiledType.isComponent(cls)) {
      throw new Error(`RouterModule: loadComponent de "${route.path ?? ""}" no resolvió una clase @Component.`);
    }
    const $injector2 = context.$injector;
    const name = ComponentRegistrar.ensure(cls, $injector2, ComponentRegistrar.rootControllerAs($injector2));
    const registry = context.stateRegistry;
    registry.deregister(stateName);
    registry.register({
      name: stateName,
      url,
      component: name,
      data,
      resolve: translateResolve(route.resolve, data, stateName)
    });
  })();
}
function runGuards(guards, arg) {
  const pending = [];
  for (const guard of guards) {
    const result = guard(arg);
    if (result === false) return false;
    if (result !== true) pending.push(Promise.resolve(result));
  }
  if (pending.length === 0) return true;
  return (() => _async_to_generator(function* () {
    for (const p of pending) {
      if ((yield p) === false) return false;
    }
    return true;
  })())();
}
function wireGuardHook($transitions, guard) {
  const criteria = guard.forChildren ? {
    to: `${guard.stateName}.**`
  } : {
    entering: guard.stateName
  };
  $transitions.onBefore(criteria, (transition) => {
    if (guard.forChildren && transition.to().name === guard.stateName) return true;
    const snapshot = {
      params: transition.params(),
      data: guard.data
    };
    const $injector2 = transition.injector().get("$injector");
    return runInRouteContext($injector2, guard.stateName, () => runGuards(guard.canActivate, snapshot));
  });
}
function buildStateSnapshot(transition, which) {
  const decl = which === "to" ? transition.to() : transition.from();
  const params = transition.params(which);
  const url = (transition.router.stateService.href(decl.name, params) ?? "").replace(/^#/, "");
  return {
    url,
    root: {
      params,
      data: decl.data ?? {}
    }
  };
}
function wireDeactivateHook($transitions, binding) {
  $transitions.onExit({
    exiting: binding.stateName
  }, (transition) => _async_to_generator(function* () {
    const instance = binding.componentName ? resolveRouteComponentInstance(binding.componentName) ?? null : null;
    const currentRoute = {
      params: transition.params("from"),
      data: binding.data
    };
    const currentState = buildStateSnapshot(transition, "from");
    const nextState = buildStateSnapshot(transition, "to");
    const $injector2 = transition.injector().get("$injector");
    for (const canDeactivate of binding.guards) {
      const result = runInRouteContext($injector2, binding.stateName, () => canDeactivate(instance, currentRoute, currentState, nextState));
      if ((yield result) === false) return false;
    }
    return true;
  })());
}
function wireMatchHook($transitions, binding) {
  $transitions.onBefore({
    to: binding.criteria
  }, (transition) => runInRouteContext(transition.injector().get("$injector"), binding.stateName, () => runGuards(binding.guards, binding.route)));
}
function unwrapLazyRoutes(loaded, $injector2, stateName) {
  if (Array.isArray(loaded)) return loaded;
  if (typeof loaded === "function" && loaded.ɵmod) {
    const loader = new LazyNgModuleLoader($injector2);
    return loader.load(loaded);
  }
  if ("routes" in loaded && Array.isArray(loaded.routes)) return loaded.routes;
  if ("default" in loaded && loaded.default) return unwrapLazyRoutes(loaded.default, $injector2, stateName);
  throw new Error("RouterModule: loadChildren no resolvió Routes / { routes } / { default } / clase @NgModule.");
}
function lazyLoadChildrenFor(route, stateName, url, fullPath, data, inRootChain) {
  const load = route.loadChildren;
  if (!load) throw new Error("lazyLoadChildrenFor: ruta sin loadChildren");
  return (context) => _async_to_generator(function* () {
    const { $injector: $injector2 } = context;
    const childRoutes = unwrapLazyRoutes(yield load(), $injector2, stateName);
    const sub = translate(childRoutes, stateName, fullPath, inRootChain, !route.component);
    routerRegistry.mergeTitles(sub.titles);
    routerRegistry.mergeResolveKeys(sub.resolveKeys);
    routerRegistry.mergeEmptyPathStates(sub.emptyPathStates);
    routerRegistry.mergeLazyChildrenStates(sub.lazyChildrenStates);
    routerRegistry.mergeRouteProviders(sub.routeProviders);
    routerRegistry.mergePathToName(sub.pathToName);
    appLazyRoutes.add($injector2, sub.lazyRoutes);
    for (const { state, redirectTo, parentPath } of sub.redirects) {
      state.redirectTo = redirectTargetFor(redirectTo, parentPath, routerRegistry.pathToName);
    }
    const registry = context.stateRegistry;
    for (const { cls } of sub.components) ComponentRegistrar.ensure(cls, $injector2);
    registerRouteProviders(sub.routeProviders);
    for (const state of sub.states) registry.register(state);
    const $transitions = $injector2.get("$transitions");
    for (const guard of sub.guards) wireGuardHook($transitions, guard);
    for (const binding of sub.deactivateGuards) wireDeactivateHook($transitions, binding);
    for (const binding of sub.matchGuards) wireMatchHook($transitions, binding);
    const hasIndexChild = childRoutes.some((child) => (child.path ?? "") === "");
    const indexState = hasIndexChild ? sub.pathToName.get(fullPath.replace(/^\/|\/$/g, "")) : void 0;
    registry.deregister(`${stateName}.**`);
    registry.register({
      name: stateName,
      url,
      data,
      redirectTo: indexState
    });
  })();
}
function resolveRedirect(redirectTo, parentPath, pathToName) {
  return pathToName.get(redirectPath(redirectTo, parentPath)) ?? redirectTo;
}
function redirectPath(redirectTo, parentPath) {
  const target = redirectTo.startsWith("/") ? redirectTo.slice(1) : joinPath(parentPath, redirectTo);
  return target.replace(/^\/|\/$/g, "");
}
function redirectTargetFor(redirectTo, parentPath, pathToName) {
  const resolved = pathToName.get(redirectPath(redirectTo, parentPath));
  if (resolved) return resolved;
  const redirect = new LazyRedirect(redirectPath(redirectTo, parentPath), redirectTo);
  return (transition) => redirect.resolve(transition);
}
var MAX_LAZY_DEPTH = 10;
function loadLazyChainForUrl(path, urlService, context) {
  return _async_to_generator(function* () {
    for (let depth = 0; depth < MAX_LAZY_DEPTH; depth++) {
      const matched = urlService.match({
        path
      });
      const stateName = matched?.rule?.type === "STATE" ? matched.rule.state?.name : void 0;
      if (!stateName) return void 0;
      if (!stateName.endsWith(".**")) return matched;
      const entry = lazyEntryForFutureState(context.$injector, stateName);
      if (!entry) return void 0;
      yield entry.load(context);
    }
    return void 0;
  })();
}
function lazyEntryForFutureState($injector2, futureName) {
  const stateName = futureName.slice(0, -".**".length);
  return appLazyRoutes.of($injector2).find((entry) => entry.stateName === stateName && entry.route.loadChildren);
}
function unloadedLazyEntryForState($injector2, stateName) {
  let best;
  for (const entry of appLazyRoutes.of($injector2)) {
    if (!entry.route.loadChildren || entry.isLoaded($injector2)) continue;
    const contains = stateName === entry.stateName || stateName.startsWith(`${entry.stateName}.`);
    if (contains && (!best || entry.stateName.length > best.stateName.length)) best = entry;
  }
  return best;
}
var LazyRedirect = class {
  constructor(path, raw) {
    this.path = path;
    this.raw = raw;
  }
  resolve(transition) {
    return _async_to_generator(function* () {
      const router2 = transition.router;
      const context = {
        stateRegistry: router2.stateRegistry,
        $injector: transition.injector().get("$injector")
      };
      const matched = yield loadLazyChainForUrl(`/${this.path}`, router2.urlService, context);
      const stateName = matched?.rule?.state?.name;
      if (stateName) return router2.stateService.target(stateName, matched?.match ?? {});
      return routerRegistry.pathToName.get(this.path) ?? this.raw;
    }).call(this);
  }
};
var SEGMENT_END_PARAM = "ngjsSegmentEnd";
var SEGMENT_END_TYPE = new ParamType({
  name: SEGMENT_END_PARAM,
  pattern: /(?=\/|$)/,
  is: (value) => value === void 0 || value === null || value === "",
  encode: (value) => value == null ? "" : String(value),
  decode: (value) => value == null ? "" : String(value),
  equals: (a, b) => (a ?? "") === (b ?? "")
});
function futureStateUrl(url) {
  if (!url || url.endsWith("/")) return url;
  return `${url}{${SEGMENT_END_PARAM}}`;
}
function findFoldableIndexRedirect(route) {
  if (!route.children?.length) return void 0;
  const candidates = route.children.filter((child) => (child.path ?? "") === "" && child.redirectTo !== void 0 && !child.children?.length && !child.loadComponent && !child.loadChildren && !child.title && !child.canActivate?.length && !child.canActivateChild?.length && !child.canDeactivate?.length && !child.canMatch?.length);
  return candidates.length === 1 ? candidates[0] : void 0;
}
function walk(routes, ctx) {
  const usedLocals = /* @__PURE__ */ new Set();
  routes.forEach((route, index) => {
    const isWildcard = route.path === WILDCARD;
    const local = dedupe(isWildcard ? "__wildcard__" : segmentName(route.path, index), usedLocals);
    const name = ctx.parentName ? `${ctx.parentName}.${local}` : local;
    const fullPath = isWildcard ? `${ctx.parentPath}/**` : joinPath(ctx.parentPath, route.path ?? "");
    const inRootChain = ctx.rootEmptyChain && !isWildcard && (route.path ?? "") === "";
    const hasChildren = Boolean(route.children?.length || route.loadChildren);
    const isRootIndex = inRootChain && !hasChildren;
    const url = isWildcard ? "/{ngjsCatchAll:.+}" : isRootIndex ? "/" : inRootChain ? "" : segmentUrl(route.path);
    const data = route.data ?? {};
    ctx.out.pathToName.set(fullPath.replace(/^\/|\/$/g, ""), name);
    const state = {
      name,
      url,
      data
    };
    const foldableRedirect = route.redirectTo === void 0 && !route.loadComponent && !route.loadChildren && !inRootChain ? findFoldableIndexRedirect(route) : void 0;
    if (route.redirectTo !== void 0) {
      state.redirectTo = route.redirectTo;
      ctx.redirects.push({
        state,
        redirectTo: route.redirectTo,
        parentPath: ctx.parentPath
      });
    } else if (route.loadComponent) {
      const lazy = new LazyRoute(route, name, lazyLoadFor(route, name, url, data));
      state.lazyLoad = lazy.forTransition();
      ctx.out.lazyRoutes.push(lazy);
    } else if (route.loadChildren) {
      ctx.out.lazyChildrenStates.add(name);
      state.name = `${name}.**`;
      state.url = url === "" && inRootChain ? "/" : futureStateUrl(url);
      if (state.url !== url) state.params = {
        [SEGMENT_END_PARAM]: {
          type: SEGMENT_END_TYPE
        }
      };
      const lazy = new LazyRoute(route, name, lazyLoadChildrenFor(route, name, url, fullPath, data, inRootChain));
      state.lazyLoad = lazy.forTransition();
      ctx.out.lazyRoutes.push(lazy);
    } else {
      const comp = componentName(route);
      if (comp) {
        state.component = comp;
        ctx.out.components.push({
          name: comp,
          cls: route.component,
          stateName: name
        });
      }
      const resolve = translateResolve(route.resolve, data, name);
      if (resolve) state.resolve = resolve;
      if (foldableRedirect) {
        state.redirectTo = foldableRedirect.redirectTo;
        ctx.redirects.push({
          state,
          redirectTo: foldableRedirect.redirectTo,
          parentPath: fullPath
        });
      }
    }
    if (route.title !== void 0) ctx.out.titles.set(name, route.title);
    if (route.providers?.length) ctx.out.routeProviders.set(name, route.providers);
    const rk = resolveKeysOf(route.resolve);
    if (rk.length) ctx.out.resolveKeys.set(name, rk);
    if (route.redirectTo === void 0 && ((route.path ?? "") === "" || ctx.parentComponentless)) {
      ctx.out.emptyPathStates.add(name);
    }
    if (isWildcard) ctx.out.wildcardState = name;
    ctx.out.states.push(state);
    if (route.canActivate?.length) {
      ctx.out.guards.push({
        stateName: name,
        canActivate: route.canActivate,
        data,
        forChildren: route.loadChildren ? true : void 0
      });
    }
    if (route.canActivateChild?.length) {
      ctx.out.guards.push({
        stateName: name,
        canActivate: route.canActivateChild,
        data,
        forChildren: true
      });
    }
    if (route.canDeactivate?.length) {
      ctx.out.deactivateGuards.push({
        stateName: name,
        componentName: route.component ? componentName(route) : void 0,
        data,
        guards: route.canDeactivate
      });
    }
    if (route.canMatch?.length) {
      ctx.out.matchGuards.push({
        stateName: name,
        criteria: route.loadChildren ? `${name}.**` : name,
        route,
        guards: route.canMatch
      });
    }
    const remainingChildren = foldableRedirect ? route.children.filter((c) => c !== foldableRedirect) : route.children;
    if (remainingChildren?.length) {
      walk(remainingChildren, {
        ...ctx,
        parentName: name,
        parentPath: fullPath,
        rootEmptyChain: inRootChain,
        parentComponentless: !route.component && !route.loadComponent,
        redirects: ctx.redirects
      });
    }
  });
}
function translate(routes, parentName, parentPath, rootEmptyChain = false, parentComponentless = false) {
  const out = {
    states: [],
    guards: [],
    deactivateGuards: [],
    matchGuards: [],
    titles: /* @__PURE__ */ new Map(),
    resolveKeys: /* @__PURE__ */ new Map(),
    emptyPathStates: /* @__PURE__ */ new Set(),
    lazyChildrenStates: /* @__PURE__ */ new Set(),
    routeProviders: /* @__PURE__ */ new Map(),
    pathToName: /* @__PURE__ */ new Map(),
    redirects: [],
    components: [],
    lazyRoutes: []
  };
  walk(routes, {
    out,
    parentName,
    parentPath,
    rootEmptyChain,
    parentComponentless,
    redirects: out.redirects
  });
  for (const { state, redirectTo, parentPath: pp } of out.redirects) {
    state.redirectTo = resolveRedirect(redirectTo, pp, out.pathToName);
  }
  return out;
}
function routesToStates(routes, isRoot = false) {
  return translate(routes, void 0, "", isRoot);
}
var ActivatedRoute = class {
};
var ActivatedRouteImpl = class extends ActivatedRoute {
  constructor($state, $transitions, $location, $rootScope, titles = /* @__PURE__ */ new Map(), resolveKeys = /* @__PURE__ */ new Map(), emptyPathStates = /* @__PURE__ */ new Set(), paramsInheritanceStrategy = "emptyOnly", $injector2) {
    super(), this.$state = $state, this.$location = $location, this.titles = titles, this.resolveKeys = resolveKeys, this.emptyPathStates = emptyPathStates, this.paramsInheritanceStrategy = paramsInheritanceStrategy, this.$injector = $injector2, this.params$ = new BehaviorSubject({}), this.queryParams$ = new BehaviorSubject({}), this.fragment$ = new BehaviorSubject(null), this.data$ = new BehaviorSubject({}), this.title$ = new BehaviorSubject(""), this.snapshot = {
      params: {},
      data: {},
      queryParams: {},
      fragment: null
    };
    this.syncRoute();
    this.syncLocation();
    $transitions.onSuccess({}, (transition) => this.syncRoute(transition));
    $rootScope.$on("$locationChangeSuccess", () => this.syncLocation());
  }
  get params() {
    return this.params$.asObservable();
  }
  get paramMap() {
    return this.params$.pipe(map((params) => convertToParamMap(params)));
  }
  get queryParams() {
    return this.queryParams$.asObservable();
  }
  get queryParamMap() {
    return this.queryParams$.pipe(map((params) => convertToParamMap(params)));
  }
  get fragment() {
    return this.fragment$.asObservable();
  }
  get data() {
    return this.data$.asObservable();
  }
  get title() {
    return this.title$.asObservable();
  }
  currentChain() {
    return this.$state.$current.path ?? [];
  }
  syncRoute(transition) {
    const params = {
      ...this.$state.params
    };
    const chain = this.currentChain();
    const staticData = mergeStaticData(chain, this.emptyPathStates, this.paramsInheritanceStrategy);
    const data = mergeResolvedData(chain, this.resolveKeys, staticData, transition?.injector());
    this.params$.next(params);
    this.data$.next(data);
    this.title$.next(this.resolveTitle(chain, params, data));
    this.updateSnapshot({
      params,
      data
    });
  }
  syncLocation() {
    const queryParams = {
      ...this.$location.search()
    };
    const fragment = this.$location.hash() || null;
    this.queryParams$.next(queryParams);
    this.fragment$.next(fragment);
    this.updateSnapshot({
      queryParams,
      fragment
    });
  }
  updateSnapshot(patch) {
    this.snapshot = {
      ...this.snapshot,
      ...patch
    };
  }
  resolveTitle(chain, params, data) {
    const picked = pickRouteTitle(chain, this.titles);
    if (picked === void 0) return "";
    if (typeof picked === "string") return picked;
    const titleState = pickRouteTitleState(chain, this.titles);
    const resolved = runInRouteContext(this.$injector, titleState, () => picked({
      params,
      data,
      queryParams: this.queryParams$.value,
      fragment: this.fragment$.value
    }));
    return typeof resolved === "string" ? resolved : "";
  }
};
ActivatedRoute.ɵfac = [
  function ActivatedRoute_Factory() {
    return new (this && this.ɵT || ActivatedRoute)();
  }
];
ActivatedRoute.ɵprov = {
  token: "ActivatedRoute_07e48dff"
};
var NavigationStart = class {
  constructor(id3, url) {
    this.id = id3;
    this.url = url;
    this.type = "NavigationStart";
  }
};
var NavigationEnd = class {
  constructor(id3, url, urlAfterRedirects) {
    this.id = id3;
    this.url = url;
    this.urlAfterRedirects = urlAfterRedirects;
    this.type = "NavigationEnd";
  }
};
var NavigationCancel = class {
  constructor(id3, url, reason) {
    this.id = id3;
    this.url = url;
    this.reason = reason;
    this.type = "NavigationCancel";
  }
};
var NavigationError = class {
  constructor(id3, url, error) {
    this.id = id3;
    this.url = url;
    this.error = error;
    this.type = "NavigationError";
  }
};
function asyncGeneratorStep2(gen, resolve, reject, _next, _throw, key, arg) {
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
function _async_to_generator2(fn) {
  return function() {
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
      function _next(value) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep2(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var RouterPreloader = class _RouterPreloader {
  constructor(strategy, context) {
    this.strategy = strategy;
    this.context = context;
    this.requested = /* @__PURE__ */ new Set();
  }
  static create(Strategy, $injector2) {
    const factory = Object.hasOwn(Strategy, "ɵfac") ? Strategy.ɵfac : [
      () => new Strategy()
    ];
    const strategy = $injector2.invoke(factory);
    const $uiRouter = $injector2.get("$uiRouter");
    return new _RouterPreloader(strategy, {
      stateRegistry: $uiRouter.stateRegistry,
      $injector: $injector2
    });
  }
  preload() {
    for (const entry of appLazyRoutes.of(this.context.$injector)) {
      if (this.requested.has(entry) || entry.isLoaded(this.context.$injector)) continue;
      this.requested.add(entry);
      const result = this.strategy.preload(entry.route, () => from(this.load(entry)));
      if (isObservable(result)) result.subscribe({
        error: () => this.requested.delete(entry)
      });
    }
  }
  load(entry) {
    return _async_to_generator2(function* () {
      try {
        yield entry.load(this.context);
      } catch (error) {
        this.requested.delete(entry);
        throw error;
      }
      this.preload();
    }).call(this);
  }
};
var UrlCommands = class _UrlCommands {
  static apply(commands, extras, current) {
    const first = commands[0];
    const absolute = typeof first === "string" && first.startsWith("/");
    const relative = !absolute && extras?.relativeTo != null;
    const segments = relative ? _UrlCommands.split(current.path) : [];
    for (const command of commands) {
      if (command !== null && typeof command === "object") {
        throw new Error(`Router.navigate: parámetros de matriz (${JSON.stringify(command)}) no soportados sobre UI-Router — usá queryParams.`);
      }
      for (const part of String(command).split("/")) {
        if (part === "" || part === ".") continue;
        if (part === "..") {
          if (!segments.length) throw new Error(`Router.navigate: "${String(command)}" sube más allá de la raíz.`);
          segments.pop();
          continue;
        }
        segments.push(part);
      }
    }
    const query = _UrlCommands.query(extras, current.query);
    const fragment = extras?.fragment ?? (extras?.preserveFragment ? current.fragment : null);
    return `/${segments.join("/")}${query}${fragment ? `#${fragment}` : ""}`;
  }
  /** `"/a/b?x=1#f"` → `["a", "b"]`. */
  static split(path) {
    return path.split(/[?#]/)[0].split("/").filter((segment) => segment !== "");
  }
  static query(extras, current) {
    const handling = extras?.queryParamsHandling;
    const params = handling === "preserve" ? {
      ...current
    } : handling === "merge" ? {
      ...current,
      ...extras?.queryParams
    } : {
      ...extras?.queryParams
    };
    const pairs = Object.entries(params).flatMap(([key, value]) => {
      if (value === void 0 || value === null) return [];
      const values2 = Array.isArray(value) ? value : [
        value
      ];
      return values2.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    });
    return pairs.length ? `?${pairs.join("&")}` : "";
  }
};
var Router = class {
};
var REJECT_ERROR = 6;
var RouterImpl = class extends Router {
  constructor($location, $transitions, $rootScope, $state) {
    super(), this.$location = $location, this.$transitions = $transitions, this.$rootScope = $rootScope, this.$state = $state, this.events$ = new Subject();
    this.wireEvents();
  }
  get url() {
    return this.$location.url();
  }
  get events() {
    return this.events$.asObservable();
  }
  navigateByUrl(url, extras) {
    const normalized = url.startsWith("/") ? url : `/${url}`;
    if (this.$location.url() === normalized) return Promise.resolve(true);
    const settled = new Promise((resolve) => {
      const offSuccess = this.$transitions.onSuccess({}, () => {
        offSuccess();
        offError();
        resolve(true);
      });
      const offError = this.$transitions.onError({}, () => {
        offSuccess();
        offError();
        resolve(false);
      });
    });
    if (extras?.replaceUrl) this.$location.replace();
    this.$location.url(normalized);
    if (extras?.queryParams) this.$location.search(extras.queryParams);
    if (!this.$rootScope.$$phase) this.$rootScope.$applyAsync();
    return settled;
  }
  navigate(commands, extras) {
    return this.navigateByUrl(this.createUrlTree(commands, extras), {
      replaceUrl: extras?.replaceUrl
    });
  }
  createUrlTree(commands, extras) {
    return UrlCommands.apply(commands, extras, {
      path: this.$location.path(),
      query: this.$location.search(),
      fragment: this.$location.hash() || null
    });
  }
  targetUrl(transition) {
    try {
      return this.$state.href(transition.to().name ?? "", transition.params()) ?? this.$location.url();
    } catch {
      return this.$location.url();
    }
  }
  wireEvents() {
    this.$transitions.onBefore({}, (transition) => {
      this.events$.next(new NavigationStart(Number(transition.$id), this.targetUrl(transition)));
    });
    this.$transitions.onSuccess({}, (transition) => {
      this.events$.next(new NavigationEnd(Number(transition.$id), this.targetUrl(transition), this.$location.url()));
    });
    this.$transitions.onError({}, (transition) => {
      const rejection = transition.error();
      const url = this.targetUrl(transition);
      if (rejection?.type === REJECT_ERROR) {
        this.events$.next(new NavigationError(Number(transition.$id), url, rejection.detail ?? rejection));
      } else {
        this.events$.next(new NavigationCancel(Number(transition.$id), url, rejection?.message ?? "cancelled"));
      }
    });
  }
};
Router.ɵfac = [
  function Router_Factory() {
    return new (this && this.ɵT || Router)();
  }
];
Router.ɵprov = {
  token: "Router_ad76dc05"
};
RouterImpl.ɵfac = [
  "$location",
  "$transitions",
  "$rootScope",
  "$state",
  function RouterImpl_Factory(a0, a1, a2, a3) {
    return new (this && this.ɵT || RouterImpl)(a0, a1, a2, a3);
  }
];
RouterImpl.ɵprov = {
  token: "RouterImpl_e2be651c"
};
var TitleStrategy = class {
};
var DefaultTitleStrategy = class extends TitleStrategy {
  constructor(title) {
    super(), this.title = title;
  }
  updateTitle(title) {
    if (title === void 0) return;
    if (this.title) this.title.setTitle(title);
    else document.title = title;
  }
};
TitleStrategy.ɵfac = [
  function TitleStrategy_Factory() {
    return new (this && this.ɵT || TitleStrategy)();
  }
];
TitleStrategy.ɵprov = {
  token: "TitleStrategy_a55c39e3"
};
function asyncGeneratorStep3(gen, resolve, reject, _next, _throw, key, arg) {
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
function _async_to_generator3(fn) {
  return function() {
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
      function _next(value) {
        asyncGeneratorStep3(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep3(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
function parseSearch(search) {
  const out = {};
  for (const pair of (search ?? "").split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = decodeURIComponent(eq < 0 ? pair : pair.slice(0, eq));
    out[key] = eq < 0 ? "" : decodeURIComponent(pair.slice(eq + 1));
  }
  return out;
}
function urlToStateRef(uiRouter, raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.includes("{{")) return raw;
  const [beforeHash, hash = ""] = trimmed.split("#");
  const [path, search] = beforeHash.split("?");
  const matched = uiRouter.urlService.match({
    path,
    search: parseSearch(search),
    hash
  });
  if (matched && matched.rule.type === "STATE" && matched.rule.state) {
    if (matched.rule.state.name.endsWith(".**")) return raw;
    return `${matched.rule.state.name}(${import_angular10.default.toJson(matched.match ?? {})})`;
  }
  const name = routerRegistry.pathToName.get(path.replace(/^\/+|\/+$/g, ""));
  return name ?? raw;
}
function evalDynamicRef(scope, expr) {
  if (expr.includes("{{")) return void 0;
  try {
    const value = scope.$eval(expr);
    return typeof value === "string" && value.trim().startsWith("/") ? value : void 0;
  } catch {
    return void 0;
  }
}
function decorateUiSrefWithUrl($provide) {
  $provide.decorator("uiSrefDirective", [
    "$delegate",
    "$injector",
    ($delegate, $injector2) => {
      for (const directive of $delegate) {
        const originalLink = directive.link;
        if (!originalLink) continue;
        directive.compile = () => (scope, element, attrs, ...rest) => {
          const raw = attrs.uiSref;
          if (typeof raw === "string" && raw.trim()) {
            const uiRouter = $injector2.get("$uiRouter");
            const link = () => originalLink(scope, element, attrs, ...rest);
            const literal = raw.trim().startsWith("/") ? raw : evalDynamicRef(scope, raw);
            if (literal !== void 0) {
              const translated = urlToStateRef(uiRouter, literal);
              if (translated === literal && LazyUrlLink.targetsUnloadedBranch(uiRouter, literal)) {
                new LazyUrlLink(scope, element, attrs, literal, uiRouter, $injector2, link).start();
                return;
              }
              attrs.uiSref = translated;
            } else {
              LinkIntentPreload.forStateRef(scope, element, raw, uiRouter, $injector2);
            }
          }
          return originalLink(scope, element, attrs, ...rest);
        };
      }
      return $delegate;
    }
  ]);
}
var INTENT_EVENTS = [
  "mouseenter",
  "focus",
  "touchstart"
];
function onIntent(element, handler) {
  const target = element[0];
  if (!target) return () => void 0;
  for (const event of INTENT_EVENTS) target.addEventListener(event, handler, {
    passive: true
  });
  return () => {
    for (const event of INTENT_EVENTS) target.removeEventListener(event, handler);
  };
}
function lazyContext(uiRouter, $injector2) {
  if (!uiRouter.stateRegistry) return void 0;
  return {
    stateRegistry: uiRouter.stateRegistry,
    $injector: $injector2
  };
}
var LinkIntentPreload = class _LinkIntentPreload {
  constructor(element, stateName, context) {
    this.element = element;
    this.stateName = stateName;
    this.context = context;
    this.off = [];
  }
  static forStateRef(scope, element, raw, uiRouter, $injector2) {
    const stateName = raw.trim().match(/^([^(]*?)\s*(\(|$)/)?.[1]?.trim();
    if (!stateName || /^[.^]/.test(stateName) || raw.includes("{{")) return;
    const context = lazyContext(uiRouter, $injector2);
    if (!context || !unloadedLazyEntryForState($injector2, stateName)) return;
    const preload = new _LinkIntentPreload(element, stateName, context);
    preload.listen();
    scope.$on("$destroy", () => preload.dispose());
  }
  listen() {
    this.off.push(onIntent(this.element, () => void this.loadChain()));
  }
  /** Baja la rama y, si el estado vive en una rama lazy anidada, la siguiente. */
  loadChain() {
    return _async_to_generator3(function* () {
      this.dispose();
      const loaded = /* @__PURE__ */ new Set();
      for (let depth = 0; depth < 10; depth++) {
        const entry = unloadedLazyEntryForState(this.context.$injector, this.stateName);
        if (!entry || loaded.has(entry)) return;
        loaded.add(entry);
        try {
          yield entry.load(this.context);
        } catch {
          this.listen();
          return;
        }
      }
    }).call(this);
  }
  dispose() {
    for (const off of this.off.splice(0)) off();
  }
};
var LazyUrlLink = class _LazyUrlLink {
  constructor(scope, element, attrs, url, uiRouter, $injector2, nativeLink) {
    this.scope = scope;
    this.element = element;
    this.attrs = attrs;
    this.url = url;
    this.uiRouter = uiRouter;
    this.$injector = $injector2;
    this.nativeLink = nativeLink;
    this.off = [];
    this.promoted = false;
  }
  /** `true` si la URL matchea un future state (rama lazy sin cargar). */
  static targetsUnloadedBranch(uiRouter, url) {
    const matched = _LazyUrlLink.match(uiRouter, url);
    return Boolean(matched?.rule.type === "STATE" && matched.rule.state?.name.endsWith(".**"));
  }
  /**
  * `true` si la URL solo la atrapa una ruta `**` (su param `ngjsCatchAll`, ver `state-translator.ts`). Al cargar
  * la rama, `lazyLoadChildrenFor` quita el future state (`admin.**`) ANTES de registrar el real (`admin`), y
  * UI-Router avisa `onStatesChanged` en ese hueco: ahí la URL cae en el `**`, que no es su destino.
  * Sin `**` cae en la regla `otherwise`, cuyo `match` es `true` (no un objeto): un `in` sobre eso tira dentro del
  * listener y aborta la carga lazy — por eso se chequea que sea una regla de estado con params.
  */
  static matchesCatchAll(uiRouter, url) {
    const matched = _LazyUrlLink.match(uiRouter, url);
    if (matched?.rule.type !== "STATE" || typeof matched.match !== "object" || matched.match === null) return false;
    return "ngjsCatchAll" in matched.match;
  }
  static match(uiRouter, url) {
    const [beforeHash, hash = ""] = url.trim().split("#");
    const [path, search] = beforeHash.split("?");
    return uiRouter.urlService.match({
      path,
      search: parseSearch(search),
      hash
    });
  }
  start() {
    if (this.element[0]?.tagName === "A") this.attrs.$set("href", this.href());
    const onClick = (event) => this.onClick(event);
    this.element.on("click", onClick);
    this.off.push(() => this.element.off("click", onClick));
    this.off.push(onIntent(this.element, () => void this.preload()));
    const offStates = this.uiRouter.stateRegistry?.onStatesChanged(() => this.promoteIfResolvable());
    if (offStates) this.off.push(() => void Promise.resolve().then(offStates));
    this.scope.$on("$destroy", () => this.dispose());
  }
  href() {
    const name = injectionTokenName(LocationStrategy);
    if (!this.$injector.has(name)) return this.url;
    return this.$injector.get(name).prepareExternalUrl(this.url);
  }
  onClick(event) {
    const mouse = event;
    const modified = mouse.button > 0 || mouse.ctrlKey || mouse.metaKey || mouse.shiftKey || mouse.altKey;
    if (modified || this.element.attr("target")) return;
    event.preventDefault();
    void this.$injector.get(injectionTokenName(Router)).navigateByUrl(this.url);
  }
  preload() {
    return _async_to_generator3(function* () {
      const context = lazyContext(this.uiRouter, this.$injector);
      const [path] = this.url.trim().split(/[?#]/);
      if (context) yield loadLazyChainForUrl(path, this.uiRouter.urlService, context).catch(() => void 0);
    }).call(this);
  }
  /** Cuando la URL ya resuelve a un estado real: se entrega al `ui-sref` nativo. */
  promoteIfResolvable() {
    if (this.promoted) return;
    if (_LazyUrlLink.matchesCatchAll(this.uiRouter, this.url)) return;
    const translated = urlToStateRef(this.uiRouter, this.url);
    if (translated === this.url) return;
    this.promoted = true;
    this.dispose();
    this.attrs.uiSref = translated;
    this.nativeLink();
  }
  dispose() {
    for (const off of this.off.splice(0)) off();
  }
};
function asyncGeneratorStep4(gen, resolve, reject, _next, _throw, key, arg) {
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
function _async_to_generator4(fn) {
  return function() {
    var self2 = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self2, args);
      function _next(value) {
        asyncGeneratorStep4(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep4(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(void 0);
    });
  };
}
var moduleSeq = 0;
function nextModuleName(prefix) {
  moduleSeq += 1;
  return `${prefix}.${moduleSeq}`;
}
var forRootInjectors = /* @__PURE__ */ new WeakSet();
BootstrapListeners.add(($injector2) => {
  if (!forRootInjectors.has($injector2)) return;
  const urlService = $injector2.get("$urlService");
  const $rootScope = $injector2.get("$rootScope");
  const start = () => {
    urlService.listen();
    urlService.sync();
  };
  if ($rootScope.$$phase) start();
  else $rootScope.$apply(start);
});
function applyGlobalRedirects(translated) {
  for (const { state, redirectTo, parentPath } of translated.redirects) {
    state.redirectTo = redirectTargetFor(redirectTo, parentPath, routerRegistry.pathToName);
  }
}
function wirePreloading(strategy) {
  const run = ($transitions, $injector2) => {
    const preloader = RouterPreloader.create(strategy, $injector2);
    $transitions.onSuccess({}, () => {
      void Promise.resolve().then(() => preloader.preload());
    });
  };
  run.$inject = [
    "$transitions",
    "$injector"
  ];
  return run;
}
function wireGuards(guards) {
  const run = ($transitions) => {
    for (const guard of guards) wireGuardHook($transitions, guard);
  };
  run.$inject = [
    "$transitions"
  ];
  return run;
}
function wireDeactivateGuards(bindings) {
  const run = ($transitions) => {
    for (const binding of bindings) wireDeactivateHook($transitions, binding);
  };
  run.$inject = [
    "$transitions"
  ];
  return run;
}
function wireMatchGuards(bindings) {
  const run = ($transitions) => {
    for (const binding of bindings) wireMatchHook($transitions, binding);
  };
  run.$inject = [
    "$transitions"
  ];
  return run;
}
function wireTitles(titles, resolveKeys, emptyPathStates, paramsInheritanceStrategy) {
  const run = ($transitions, $state, $location, $injector2) => {
    const strategyName = injectionTokenName(TitleStrategy);
    const titleName = injectionTokenName(Title);
    const strategy = $injector2.has(strategyName) ? $injector2.get(strategyName) : new DefaultTitleStrategy($injector2.has(titleName) ? $injector2.get(titleName) : void 0);
    $transitions.onSuccess({}, (transition) => _async_to_generator4(function* () {
      const chain = $state.$current.path ?? [];
      const picked = pickRouteTitle(chain, titles);
      if (picked === void 0) return;
      const titleState = pickRouteTitleState(chain, titles);
      let resolved;
      if (typeof picked === "function") {
        const params = {
          ...$state.params
        };
        const staticData = mergeStaticData(chain, emptyPathStates, paramsInheritanceStrategy);
        const data = mergeResolvedData(chain, resolveKeys, staticData, transition.injector());
        const value = yield runInRouteContext($injector2, titleState, () => picked({
          params,
          data,
          queryParams: {
            ...$location.search()
          },
          fragment: $location.hash() || null
        }));
        if (typeof value === "string") resolved = value;
      } else {
        resolved = picked;
      }
      if (resolved !== void 0) strategy.updateTitle(resolved);
    })());
  };
  run.$inject = [
    "$transitions",
    "$state",
    "$location",
    "$injector"
  ];
  return run;
}
function wireRouterScroller(options) {
  const restoration = options.scrollPositionRestoration ?? "disabled";
  const anchorScrolling = options.anchorScrolling ?? "disabled";
  const restoreEnabled = restoration === "enabled";
  const run = (viewportScroller, platformLocation, $transitions, $location, $timeout, $rootScope) => {
    if (restoration !== "disabled") viewportScroller.setHistoryScrollRestoration("manual");
    const store = /* @__PURE__ */ new Map();
    let lastUrl;
    let pendingPop = false;
    if (restoreEnabled) {
      const offPop = platformLocation.onPopState(() => {
        pendingPop = true;
      });
      $rootScope.$on("$destroy", offPop);
      $transitions.onError({}, () => {
        pendingPop = false;
      });
    }
    $transitions.onBefore({}, () => {
      if (restoreEnabled && lastUrl !== void 0) {
        store.set(lastUrl, viewportScroller.getScrollPosition());
      }
    });
    $transitions.onSuccess({}, () => {
      const url = $location.url();
      const anchor = anchorScrolling === "enabled" ? $location.hash() || null : null;
      const restored = restoreEnabled && pendingPop ? store.get(url) : void 0;
      pendingPop = false;
      lastUrl = url;
      $timeout(() => {
        if (restored) viewportScroller.scrollToPosition(restored);
        else if (anchor) viewportScroller.scrollToAnchor(anchor);
        else if (restoration === "top" || restoration === "enabled") viewportScroller.scrollToPosition([
          0,
          0
        ]);
      }, 0);
    });
  };
  run.$inject = [
    injectionTokenName(ViewportScroller),
    injectionTokenName(PlatformLocation),
    "$transitions",
    "$location",
    "$timeout",
    "$rootScope"
  ];
  return run;
}
var RouterModule = {
  /** `imports: [RouterModule]` (sin `forRoot`/`forChild`): trae `ui.router` (directivas `ui-sref`/`ui-view`). */
  name: "ui.router",
  forRoot(routes, config = {}) {
    const translated = routesToStates(
      routes,
      /* isRoot */
      true
    );
    const { states, guards, deactivateGuards, matchGuards, titles, resolveKeys } = translated;
    routerRegistry.mergeTitles(titles);
    routerRegistry.mergeResolveKeys(resolveKeys);
    routerRegistry.mergeEmptyPathStates(translated.emptyPathStates);
    routerRegistry.mergeLazyChildrenStates(translated.lazyChildrenStates);
    routerRegistry.mergeRouteProviders(translated.routeProviders);
    routerRegistry.mergePathToName(translated.pathToName);
    const paramsInheritanceStrategy = config.paramsInheritanceStrategy ?? "emptyOnly";
    const root2 = states.find((state) => !state.name?.includes("."));
    const fallbackUrl = typeof root2?.url === "string" && root2.url || "/";
    const useHash = config.useHash === true;
    const commonId = CommonModule.ɵmod.id;
    const mod = import_angular9.default.module(nextModuleName("ngjs.router"), [
      "ui.router",
      commonId
    ]);
    const Strategy = useHash ? HashLocationStrategy : PathLocationStrategy;
    mod.factory(injectionTokenName(LocationStrategy), Strategy.ɵfac);
    if (translated.routeProviders.size) {
      const registerProviders = ($provide) => {
        for (const providers of translated.routeProviders.values()) RuntimeProviders.register($provide, providers);
      };
      registerProviders.$inject = [
        "$provide"
      ];
      mod.config(registerProviders);
    }
    const configureStates = ($stateProvider, $urlRouterProvider, $locationProvider, $urlServiceProvider) => {
      $urlServiceProvider.deferIntercept();
      if (!useHash) {
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
      } else {
        $locationProvider.hashPrefix("");
      }
      applyGlobalRedirects(translated);
      for (const state of states) $stateProvider.state({
        ...state
      });
      $urlRouterProvider.otherwise(fallbackUrl);
    };
    configureStates.$inject = [
      "$stateProvider",
      "$urlRouterProvider",
      "$locationProvider",
      "$urlServiceProvider"
    ];
    mod.config(configureStates);
    const srefUrlConfig = ($provide) => decorateUiSrefWithUrl($provide);
    srefUrlConfig.$inject = [
      "$provide"
    ];
    mod.config(srefUrlConfig);
    const forRootGuard = ($injector2) => {
      if (forRootInjectors.has($injector2)) {
        throw new Error("RouterModule.forRoot() se llamó dos veces en la misma app. Usá RouterModule.forChild() en los feature modules.");
      }
      forRootInjectors.add($injector2);
    };
    forRootGuard.$inject = [
      "$injector"
    ];
    mod.run(forRootGuard);
    if (guards.length) mod.run(wireGuards(guards));
    if (deactivateGuards.length) mod.run(wireDeactivateGuards(deactivateGuards));
    if (matchGuards.length) mod.run(wireMatchGuards(matchGuards));
    mod.run(wireTitles(routerRegistry.titles, routerRegistry.resolveKeys, routerRegistry.emptyPathStates, paramsInheritanceStrategy));
    if (translated.lazyRoutes.length) mod.run(wireLazyRoutes(translated.lazyRoutes));
    if (config.preloadingStrategy) mod.run(wirePreloading(config.preloadingStrategy));
    const { scrollPositionRestoration, anchorScrolling } = config;
    if (scrollPositionRestoration && scrollPositionRestoration !== "disabled" || anchorScrolling === "enabled") {
      mod.run(wireRouterScroller({
        scrollPositionRestoration,
        anchorScrolling
      }));
    }
    mod.factory(injectionTokenName(Router), RouterImpl.ɵfac);
    const activatedRouteFactory = ($state, $transitions, $location, $rootScope, $injector2) => new ActivatedRouteImpl($state, $transitions, $location, $rootScope, routerRegistry.titles, routerRegistry.resolveKeys, routerRegistry.emptyPathStates, paramsInheritanceStrategy, $injector2);
    activatedRouteFactory.$inject = [
      "$state",
      "$transitions",
      "$location",
      "$rootScope",
      "$injector"
    ];
    mod.factory(injectionTokenName(ActivatedRoute), activatedRouteFactory);
    return mod;
  },
  forChild(routes) {
    const translated = routesToStates(routes);
    const { states, guards, deactivateGuards, matchGuards, titles, resolveKeys } = translated;
    if (!ConfigProviderFactory.current) {
      routerRegistry.mergeTitles(titles);
      routerRegistry.mergeResolveKeys(resolveKeys);
      routerRegistry.mergeEmptyPathStates(translated.emptyPathStates);
      routerRegistry.mergeLazyChildrenStates(translated.lazyChildrenStates);
      routerRegistry.mergeRouteProviders(translated.routeProviders);
      routerRegistry.mergePathToName(translated.pathToName);
    }
    const mod = import_angular9.default.module(nextModuleName("ngjs.router.child"), [
      "ui.router"
    ]);
    routerRegistry.registerChildRoutes(mod.name, routes);
    const config = ($stateProvider) => {
      applyGlobalRedirects(translated);
      for (const state of states) $stateProvider.state({
        ...state
      });
    };
    config.$inject = [
      "$stateProvider"
    ];
    mod.config(config);
    if (translated.routeProviders.size) {
      const registerProviders = ($provide) => {
        for (const providers of translated.routeProviders.values()) RuntimeProviders.register($provide, providers);
      };
      registerProviders.$inject = [
        "$provide"
      ];
      mod.config(registerProviders);
    }
    if (guards.length) mod.run(wireGuards(guards));
    if (deactivateGuards.length) mod.run(wireDeactivateGuards(deactivateGuards));
    if (matchGuards.length) mod.run(wireMatchGuards(matchGuards));
    if (translated.lazyRoutes.length) mod.run(wireLazyRoutes(translated.lazyRoutes));
    return mod;
  }
};

export {
  NavigationEnd,
  RouterModule
};
