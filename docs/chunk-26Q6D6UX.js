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
import {
  CompiledType,
  ComponentRegistrar,
  ConfigProviderFactory,
  DOCUMENT,
  EMPTY,
  ElementRef,
  ElementRefImpl,
  EventEmitter,
  InjectionToken,
  Injector,
  Observable,
  Subject,
  currentInjector,
  decorateControllerLateDecorators,
  firstValueFrom,
  injectionTokenName,
  isObservable,
  map,
  of,
  require_angular,
  takeUntil,
  unwrapAngularInjector
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// ../ngjs-core/dist/chunk-MCTYH633.js
var import_angular = __toESM(require_angular(), 1);
var import_angular2 = __toESM(require_angular(), 1);
var ChangeDetectorRef = class {
};
var ChangeDetectorRefImpl = class extends ChangeDetectorRef {
  constructor(scope) {
    super(), this.scope = scope, this.attached = true, // nombre distinto al `destroyed` público que declara ViewRefImpl (subclase) —
    // mismo nombre en las dos causaría un choque de "override" en TS.
    this.cdDestroyed = false;
    scope.$on("$destroy", () => {
      this.cdDestroyed = true;
      this.attached = false;
    });
  }
  markForCheck() {
    if (this.cdDestroyed || !this.attached) return;
    this.scope.$evalAsync(() => void 0);
  }
  detectChanges() {
    if (this.cdDestroyed) return;
    const root = this.scope.$root;
    const phase = root?.$$phase ?? this.scope.$$phase;
    if (!phase) {
      this.scope.$digest();
      return;
    }
    if (phase !== "$apply") return;
    root.$$phase = null;
    try {
      this.scope.$digest();
    } finally {
      root.$$phase = phase;
    }
  }
  detach() {
    if (this.cdDestroyed) return;
    this.attached = false;
    this.scope.$suspend();
  }
  reattach() {
    if (this.cdDestroyed || this.attached) return;
    this.attached = true;
    this.scope.$resume();
    this.markForCheck();
  }
};
ChangeDetectorRef.ɵfac = [
  function ChangeDetectorRef_Factory() {
    return new ChangeDetectorRef();
  }
];
ChangeDetectorRef.ɵprov = {
  token: "ChangeDetectorRef_e2bfcbab"
};
var ViewRefImpl = class extends ChangeDetectorRefImpl {
  constructor($scope, rootNodes = []) {
    super($scope), this.rootNodes = rootNodes, this._destroyed = false, this.callbacks = /* @__PURE__ */ new Set();
  }
  get destroyed() {
    return this._destroyed;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    let firstError;
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch (error) {
        firstError ??= error;
      }
    }
    this.callbacks.clear();
    for (const node of this.rootNodes) node.parentNode?.removeChild(node);
    this.scope.$destroy();
    if (firstError) throw firstError;
  }
  onDestroy(callback) {
    if (!this._destroyed) this.callbacks.add(callback);
  }
};
var EmbeddedViewRefImpl = class extends ViewRefImpl {
  constructor(context2, $scope, $transclude, host) {
    super($scope), this.context = context2, this.rootNodes = [];
    if (host) {
      const clone2 = $transclude(this.scope, (cloned) => {
        for (const node of Array.from(cloned)) {
          host.parent.insertBefore(node, host.anchor);
        }
      }, import_angular.default.element(host.parent));
      const wrapper = clone2[0];
      this.rootNodes = Array.from(clone2.contents());
      for (const node of this.rootNodes) wrapper.parentNode?.insertBefore(node, wrapper);
      clone2.remove();
      return;
    }
    const clone = $transclude(this.scope, () => void 0);
    this.rootNodes = Array.from(clone.contents());
    for (const node of this.rootNodes) node.parentNode?.removeChild(node);
    clone.remove();
  }
  destroy() {
    for (const node of this.rootNodes) node.parentNode?.removeChild(node);
    super.destroy();
  }
};
var DECLARATION_PREFIX = "let";
var TemplateRef = class {
};
var TemplateRefImpl = class _TemplateRefImpl extends TemplateRef {
  static {
    this.$inject = [
      "$transclude",
      "$scope",
      "$element"
    ];
  }
  static {
    this.byAnchor = /* @__PURE__ */ new WeakMap();
  }
  constructor($transclude, $scope, $element) {
    super(), this.$transclude = $transclude, this.$scope = $scope, this.declarations = /* @__PURE__ */ new Map();
    const anchor = $element?.[0];
    if (anchor) _TemplateRefImpl.byAnchor.set(anchor, this);
  }
  /**
  * El `TemplateRef` del `<ng-template>` en `node` (su comentario ancla). Si otra directiva del mismo `<ng-template>`
  * se construye antes que `ngTemplate` (AngularJS los construye por prioridad y nombre), se devuelve uno que
  * delega en el real al usarse.
  */
  static of(node) {
    if (!node) return void 0;
    const existing = _TemplateRefImpl.byAnchor.get(node);
    if (existing) return existing;
    if (node.nodeType !== 8 || !/ngTemplate/.test(node.nodeValue ?? "")) return void 0;
    return new DeferredTemplateRef(() => _TemplateRefImpl.byAnchor.get(node));
  }
  /** Llamado por `compileNgTemplate` (el `pre`-link) al parsear los atributos `let-*` — nadie más lo llama. */
  registerDeclarations(declarations) {
    this.declarations = new Map(declarations);
  }
  /**
  * `let-item="clave"` → dentro de la vista embebida, `item` resuelve a
  * `context.clave` (`"$implicit"` si no se puso valor).
  *
  * La variable se define como **getter en vivo** sobre el objeto `context`, no
  * como copia de valor: si el consumidor muta `context.clave` in-place (patrón
  * de `NgbRating`, `NgbCarousel`, …), el diget de la vista lo refleja — igual
  * que Angular, donde el contexto se pasa por referencia.
  */
  createEmbeddedView(context2, scope, host) {
    const targetScope = (scope ?? this.$scope).$new();
    const source = context2 ?? {};
    for (const [localName, key] of this.declarations) {
      Object.defineProperty(targetScope, localName, {
        get: () => source[key],
        configurable: true,
        enumerable: true
      });
    }
    return new EmbeddedViewRefImpl(context2, targetScope, this.$transclude, host);
  }
  static directive() {
    return {
      controller: _TemplateRefImpl,
      bindToController: true,
      restrict: "E",
      compile: compileNgTemplate,
      transclude: "element"
    };
  }
};
var compileNgTemplate = (_element, attrs) => {
  const declarations = /* @__PURE__ */ new Map();
  for (const [name, value] of Object.entries(attrs)) {
    if (!name.startsWith(DECLARATION_PREFIX)) continue;
    const rest = name.slice(DECLARATION_PREFIX.length);
    if (!rest) continue;
    const localName = rest[0].toLowerCase() + rest.slice(1);
    if (!localName) continue;
    declarations.set(localName, value || "$implicit");
  }
  return {
    pre: (_scope, _element2, _attrs, ctrl) => {
      ctrl.registerDeclarations(declarations);
    }
  };
};
var DeferredTemplateRef = class extends TemplateRef {
  constructor(resolve) {
    super(), this.resolve = resolve;
  }
  createEmbeddedView(context2, scope, host) {
    const target = this.resolve();
    if (!target) throw new Error("TemplateRef: el <ng-template> todavía no se creó.");
    return target.createEmbeddedView(context2, scope, host);
  }
};
TemplateRef.ɵfac = [
  function TemplateRef_Factory() {
    return new TemplateRef();
  }
];
TemplateRef.ɵprov = {
  token: "TemplateRef_22b1ec91"
};
function isSubscribable(value) {
  return typeof value.subscribe === "function";
}
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function unsubscribe(handle) {
  if (typeof handle === "function") handle();
  else handle?.unsubscribe();
}
var AsyncPipe = class {
};
var AsyncPipeImpl = class extends AsyncPipe {
  constructor($scope) {
    super(), this.$scope = $scope, this.cache = /* @__PURE__ */ new Map(), this.destroyed = false;
    $scope.$on("$destroy", () => this.destroy());
  }
  transform(input) {
    if (input == null || this.destroyed) return null;
    if (typeof input !== "object" && typeof input !== "function") return null;
    let entry = this.cache.get(input);
    if (!entry) {
      entry = this.subscribeTo(input);
      this.cache.set(input, entry);
    }
    return entry.value;
  }
  subscribeTo(input) {
    const entry = {
      value: null,
      teardown: () => {
      }
    };
    const onValue = (value) => {
      entry.value = value;
      if (!this.$scope.$$phase) this.$scope.$applyAsync();
    };
    if (isSubscribable(input)) {
      const handle = input.subscribe(onValue);
      entry.teardown = () => unsubscribe(handle);
    } else if (isPromiseLike(input)) {
      let cancelled = false;
      input.then((value) => {
        if (!cancelled) onValue(value);
      });
      entry.teardown = () => {
        cancelled = true;
      };
    }
    return entry;
  }
  destroy() {
    this.destroyed = true;
    for (const entry of this.cache.values()) entry.teardown();
    this.cache.clear();
  }
};
AsyncPipe.ɵfac = [
  function AsyncPipe_Factory() {
    return new AsyncPipe();
  }
];
AsyncPipe.ɵprov = {
  token: "AsyncPipe_3089ec2a"
};
var ComponentRef = class {
};
var ComponentRefImpl = class extends ComponentRef {
  constructor(location, instance, changeDetectorRef, hostView, initialInputs = {}) {
    super(), this.location = location, this.instance = instance, this.changeDetectorRef = changeDetectorRef, this.hostView = hostView, this.destroyCallbacks = /* @__PURE__ */ new Set(), this.destroyed = false, this.inputValues = /* @__PURE__ */ new Map();
    for (const [name, value] of Object.entries(initialInputs)) {
      this.inputValues.set(name, value);
    }
  }
  setInput(name, value) {
    if (this.destroyed) {
      throw new Error("No se puede actualizar un componente destruido");
    }
    const firstChange = !this.inputValues.has(name);
    const previousValue = this.inputValues.get(name);
    if (!firstChange && Object.is(previousValue, value)) return;
    this.inputValues.set(name, value);
    Object.assign(this.instance, {
      [name]: value
    });
    const controller = this.instance;
    controller.$onChanges?.({
      [name]: {
        currentValue: value,
        previousValue,
        isFirstChange: () => firstChange
      }
    });
    this.changeDetectorRef.markForCheck();
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    const callbacks = [
      ...this.destroyCallbacks
    ];
    this.destroyCallbacks.clear();
    let firstError;
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        firstError ??= error;
      }
    }
    try {
      this.hostView.destroy();
    } catch (error) {
      firstError ??= error;
    }
    if (firstError) throw firstError;
  }
  onDestroy(callback) {
    if (!this.destroyed) this.destroyCallbacks.add(callback);
  }
};
var SCOPED_INJECTOR_DATA_KEY = "$ngjsScopedInjector";
function createComponent(component, options) {
  const injector = ComponentCreation.injectorOf(options);
  let target;
  let linked;
  try {
    target = ComponentCreation.target(component, injector);
    linked = ComponentCreation.link(target, options, injector);
  } catch (error) {
    return Promise.reject(error);
  }
  const instance = linked.linkedElement.controller(target.controllerName);
  if (instance !== void 0) return Promise.resolve(ComponentCreation.ref(instance, linked));
  return ComponentCreation.waitForController(linked.linkedElement, target.controllerName).then((resolved) => ComponentCreation.ref(resolved, linked), (error) => {
    linked.ownerScope.$destroy();
    throw error;
  });
}
var ComponentCreation = class _ComponentCreation {
  static {
    this.PROJECTABLE_NODE_ATTRIBUTE = "data-ngjs-projectable-node";
  }
  static injectorOf(options) {
    const injector = options.elementInjector ?? options.injector ?? options.environmentInjector;
    if (!injector) throw new Error("createComponent: falta injector/environmentInjector");
    return injector instanceof Injector ? unwrapAngularInjector(injector) : injector;
  }
  static target(component, injector) {
    if (typeof component === "string") {
      return {
        tag: _ComponentCreation.kebabCase(component),
        controllerName: component,
        bindings: _ComponentCreation.registeredBindings(component, injector)
      };
    }
    const tag = CompiledType.componentTag(component);
    if (!tag) throw new Error(`createComponent: "${component.name}" no es un @Component compilado con selector de elemento.`);
    const controllerName = ComponentRegistrar.ensure(component, injector);
    return {
      tag,
      controllerName,
      bindings: _ComponentCreation.registeredBindings(controllerName, injector)
    };
  }
  /** El `bindings` con que se registró el componente (`.component(name, { bindings })`). */
  static registeredBindings(name, injector) {
    if (!injector.has(`${name}Directive`)) return {};
    const [definition] = injector.get(`${name}Directive`);
    const raw = definition?.bindToController;
    return raw && typeof raw === "object" ? raw : {};
  }
  static link(target, options, injector) {
    const $compile = injector.get("$compile");
    const $rootScope = injector.get("$rootScope");
    const ownerScope = $rootScope.$new(true);
    const bindings = _ComponentCreation.normalizeBindings(options.bindings);
    const hostElement = _ComponentCreation.host(options.hostElement ?? document.createElement(target.tag), target.tag);
    Object.assign(ownerScope, bindings);
    const containerInjector = options.ɵparentElement && import_angular2.default.element(options.ɵparentElement).inheritedData(SCOPED_INJECTOR_DATA_KEY);
    if (containerInjector) import_angular2.default.element(hostElement).data(SCOPED_INJECTOR_DATA_KEY, containerInjector);
    _ComponentCreation.applyHostAttributes(hostElement, bindings, options.directives ?? [], target.bindings);
    const projectableNodes = options.projectableNodes ?? [];
    _ComponentCreation.appendProjectionMarkers(hostElement, projectableNodes);
    try {
      const linkedElement = $compile(hostElement)(ownerScope);
      if (projectableNodes.length) _ComponentCreation.projectNodes(hostElement, projectableNodes);
      return {
        bindings,
        hostElement,
        linkedElement,
        ownerScope
      };
    } catch (error) {
      ownerScope.$destroy();
      throw error;
    }
  }
  static ref(instance, linked) {
    const { hostElement, linkedElement, ownerScope, bindings } = linked;
    const rootNodes = Array.from(linkedElement);
    const hostView = new ViewRefImpl(ownerScope, rootNodes);
    hostView.detach();
    return new ComponentRefImpl(new ElementRefImpl(rootNodes[0] ?? hostElement), instance, new ChangeDetectorRefImpl(ownerScope), hostView, bindings);
  }
  static waitForController(linkedElement, controllerName) {
    const timeoutAt = Date.now() + 1e4;
    return new Promise((resolve, reject) => {
      const check = () => {
        const instance = linkedElement.controller(controllerName);
        if (instance !== void 0) return resolve(instance);
        if (Date.now() >= timeoutAt) {
          return reject(new Error(`createComponent: no se pudo crear el componente "${controllerName}"`));
        }
        setTimeout(check, 0);
      };
      check();
    });
  }
  /** Cada binding inicial como atributo del host: el nombre del atributo (el alias, si lo hay) y su modo. */
  static applyHostAttributes(host, bindings, directives, registered) {
    for (const key of Object.keys(bindings)) {
      const [, mode = "<", alias = ""] = /^([<@&=])\??(\w*)$/.exec(registered[key] ?? "") ?? [];
      host.setAttribute(_ComponentCreation.kebabCase(alias || key), mode === "@" ? `{{${key}}}` : key);
    }
    for (const directive of directives) host.setAttribute(_ComponentCreation.kebabCase(directive), "");
  }
  static appendProjectionMarkers(host, projectableNodes) {
    projectableNodes.forEach((_, index) => {
      const marker = document.createElement("ngjs-projectable-node");
      marker.setAttribute(_ComponentCreation.PROJECTABLE_NODE_ATTRIBUTE, String(index));
      host.append(marker);
    });
  }
  static projectNodes(host, projectableNodes) {
    const projected = /* @__PURE__ */ new Set();
    for (const marker of Array.from(host.querySelectorAll(`[${_ComponentCreation.PROJECTABLE_NODE_ATTRIBUTE}]`))) {
      const index = Number(marker.getAttribute(_ComponentCreation.PROJECTABLE_NODE_ATTRIBUTE));
      const parent = marker.parentNode;
      if (parent && !projected.has(index)) {
        for (const node of projectableNodes[index] ?? []) parent.insertBefore(node, marker);
        projected.add(index);
      }
      parent?.removeChild(marker);
    }
    projectableNodes.forEach((nodes, index) => {
      if (!projected.has(index)) host.append(...nodes);
    });
  }
  static normalizeBindings(bindings) {
    if (!bindings) return {};
    return Array.isArray(bindings) ? Object.assign({}, ...bindings) : {
      ...bindings
    };
  }
  /** El host tiene que ser el tag del componente; si se pidió otro elemento, el componente va adentro. */
  static host(requested, tag) {
    if (requested.localName === tag) return requested;
    const componentHost = document.createElement(tag);
    requested.replaceChildren(componentHost);
    return componentHost;
  }
  static kebabCase(value) {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
  }
};
var owners = /* @__PURE__ */ new WeakMap();
function getViewOwner(viewRef) {
  return owners.get(viewRef);
}
function claimView(viewRef, owner) {
  const currentOwner = owners.get(viewRef);
  if (currentOwner === owner) return;
  if (currentOwner) {
    throw new Error(`La vista ya pertenece a un ${currentOwner.viewOwnerKind}`);
  }
  owners.set(viewRef, owner);
}
function releaseView(viewRef, owner) {
  if (owners.get(viewRef) === owner) owners.delete(viewRef);
}
var ViewContainerRef = class {
};
var ViewContainerRefImpl = class _ViewContainerRefImpl extends ViewContainerRef {
  constructor(element, injector) {
    super(), this.element = element, this.injector = injector, this.viewOwnerKind = "container", this.views = [], this.trackedViews = /* @__PURE__ */ new WeakSet();
  }
  get length() {
    return this.views.length;
  }
  clear() {
    while (this.length) this.remove(this.length - 1);
  }
  createComponent(componentType, options) {
    return createComponent(componentType, {
      injector: options?.injector ?? this.injector,
      environmentInjector: options?.environmentInjector,
      // Sin `injector` explícito, el componente hereda la cadena de DI del contenedor
      // (solo tiene efecto dentro de una rama lazy — ver `createComponent`).
      ɵparentElement: options?.injector ? void 0 : this.element.nativeElement,
      projectableNodes: options?.projectableNodes,
      directives: options?.directives,
      bindings: options?.bindings
    }).then((componentRef) => {
      try {
        this.insert(componentRef.hostView, options?.index);
        return componentRef;
      } catch (error) {
        componentRef.destroy();
        throw error;
      }
    });
  }
  createEmbeddedView(templateRef, context2, optionsOrIndex) {
    const viewRef = templateRef.createEmbeddedView(context2 ?? {});
    const index = typeof optionsOrIndex === "number" ? optionsOrIndex : optionsOrIndex?.index;
    try {
      this.insert(viewRef, index);
    } catch (error) {
      viewRef.destroy();
      throw error;
    }
    return viewRef;
  }
  get(index) {
    return this.views[index] ?? null;
  }
  indexOf(viewRef) {
    return this.views.indexOf(viewRef);
  }
  insert(viewRef, index) {
    if (viewRef.destroyed) {
      throw new Error("No se puede insertar una vista destruida");
    }
    const currentOwner = getViewOwner(viewRef);
    if (currentOwner) {
      if (!(currentOwner instanceof _ViewContainerRefImpl)) {
        throw new Error("La vista pertenece a ApplicationRef y debe separarse antes de insertarla");
      }
      const currentIndex = currentOwner.indexOf(viewRef);
      if (currentIndex !== -1) currentOwner.detach(currentIndex);
    }
    const targetIndex = this.normalizeInsertIndex(index);
    const anchor = this.element.nativeElement;
    const parent = anchor.parentNode;
    if (!parent) {
      throw new Error("El ViewContainerRef no tiene un ancla conectada al DOM");
    }
    const referenceNode = this.getInsertionReference(targetIndex);
    const rootNodes = this.getRootNodes(viewRef);
    for (const node of rootNodes) parent.insertBefore(node, referenceNode);
    this.views.splice(targetIndex, 0, viewRef);
    claimView(viewRef, this);
    viewRef.reattach();
    this.trackDestroyedView(viewRef);
    return viewRef;
  }
  move(viewRef, currentIndex) {
    if (this.indexOf(viewRef) === -1) {
      throw new Error("La vista no pertenece a este ViewContainerRef");
    }
    return this.insert(viewRef, currentIndex);
  }
  remove(index) {
    const viewRef = this.detach(index);
    viewRef?.destroy();
  }
  detach(index) {
    const targetIndex = index ?? this.length - 1;
    if (targetIndex < 0 || targetIndex >= this.length) return null;
    const [viewRef] = this.views.splice(targetIndex, 1);
    for (const node of this.getRootNodes(viewRef)) {
      node.parentNode?.removeChild(node);
    }
    releaseView(viewRef, this);
    viewRef.detach();
    return viewRef;
  }
  normalizeInsertIndex(index) {
    const targetIndex = index ?? this.length;
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex > this.length) {
      throw new RangeError(`índice de inserción fuera de rango: ${targetIndex}`);
    }
    return targetIndex;
  }
  getRootNodes(viewRef) {
    const rootNodes = viewRef.rootNodes;
    if (!rootNodes) {
      throw new Error("La vista no expone rootNodes y no puede insertarse");
    }
    return Array.from(rootNodes);
  }
  getInsertionReference(index) {
    for (let current = index; current < this.length; current++) {
      const [firstNode] = this.getRootNodes(this.views[current]);
      if (firstNode) return firstNode;
    }
    for (let current = index - 1; current >= 0; current--) {
      const rootNodes = this.getRootNodes(this.views[current]);
      const lastNode = rootNodes[rootNodes.length - 1];
      if (lastNode) return lastNode.nextSibling;
    }
    return this.element.nativeElement.nextSibling;
  }
  trackDestroyedView(viewRef) {
    if (this.trackedViews.has(viewRef)) return;
    this.trackedViews.add(viewRef);
    viewRef.onDestroy(() => {
      const index = this.views.indexOf(viewRef);
      if (index !== -1) this.views.splice(index, 1);
      releaseView(viewRef, this);
    });
  }
};
ViewContainerRef.ɵfac = [
  function ViewContainerRef_Factory() {
    return new ViewContainerRef();
  }
];
ViewContainerRef.ɵprov = {
  token: "ViewContainerRef_2579ba28"
};
var NgContainer = class _NgContainer {
  static {
    this.$inject = [
      "$transclude",
      "$scope",
      "$element",
      "$injector"
    ];
  }
  static {
    this.byAnchor = /* @__PURE__ */ new WeakMap();
  }
  /** El `<ng-container>` de ese comentario ancla (fuera de un `require: "ngContainer"`). */
  static of(anchor) {
    return _NgContainer.byAnchor.get(anchor);
  }
  constructor($transclude, $scope, $element, $injector) {
    this.$transclude = $transclude;
    this.$scope = $scope;
    this.$element = $element;
    this.viewContainerRef = new ViewContainerRefImpl(new ElementRefImpl($element[0]), $injector);
    _NgContainer.byAnchor.set($element[0], this);
  }
  $postLink() {
    const wrapper = this.$transclude(this.$scope, (clone) => {
      this.$element.after(clone);
    });
    this.content = wrapper.contents();
    wrapper.after(this.content);
    wrapper.remove();
  }
  $onDestroy() {
    this.viewContainerRef.clear();
    this.content?.remove();
  }
  static directive() {
    return {
      controller: _NgContainer,
      restrict: "E",
      transclude: "element"
    };
  }
};
var QueryContext = class _QueryContext {
  static {
    this.registriesByScope = /* @__PURE__ */ new WeakMap();
  }
  static {
    this.contentOwnersByScope = /* @__PURE__ */ new WeakMap();
  }
  static {
    this.activeContentOwners = [];
  }
  static registerScopeRegistry(scope, registry) {
    const existing = _QueryContext.registriesByScope.get(scope);
    if (existing) existing.push(registry);
    else _QueryContext.registriesByScope.set(scope, [
      registry
    ]);
  }
  static scopeRegistries(scope) {
    return _QueryContext.registriesByScope.get(scope) ?? [];
  }
  /**
  * `scope` y los scopes de los que hereda por prototipo (`ng-repeat`, `ng-if`, …): el mismo template, como las
  * variables de un template de Angular. Corta en un scope aislado (el template de otro componente): su prototipo ya
  * no es un scope.
  */
  static lexicalScopes(scope) {
    const scopes = [];
    for (let current = scope; current && Object.hasOwn(current, "$id"); current = Object.getPrototypeOf(current)) {
      scopes.push(current);
    }
    return scopes;
  }
  static ancestorRegistries(scope) {
    const registries = [];
    for (let current = scope.$parent; current; current = current.$parent) {
      registries.push(..._QueryContext.scopeRegistries(current));
    }
    return registries;
  }
  static bindContentOwners(scope, owners2) {
    _QueryContext.contentOwnersByScope.set(scope, owners2);
    scope.$on("$destroy", () => {
      if (_QueryContext.contentOwnersByScope.get(scope) === owners2) _QueryContext.contentOwnersByScope.delete(scope);
    });
  }
  static contentOwners(scope) {
    const active = _QueryContext.activeContentOwners.at(-1);
    if (active) return active;
    for (let current = scope; current; current = current.$parent) {
      const owners2 = _QueryContext.contentOwnersByScope.get(current);
      if (owners2) return owners2;
    }
    return [];
  }
  static runWithContentOwners(owners2, callback) {
    _QueryContext.activeContentOwners.push(owners2);
    try {
      return callback();
    } finally {
      _QueryContext.activeContentOwners.pop();
    }
  }
};
function decorateControllerWith($delegate, hooks) {
  const invoke = $delegate;
  const wrapped = (expression, locals, later, identifier) => {
    const augmentedLocals = hooks.augmentLocals ? hooks.augmentLocals(locals, expression) : locals;
    if (!later) {
      const runInvoke = () => invoke(expression, augmentedLocals, later, identifier);
      const result = hooks.aroundInit ? hooks.aroundInit(runInvoke, augmentedLocals) : runInvoke();
      hooks.onInstance?.(result, augmentedLocals);
      return result;
    }
    const initializer = invoke(expression, augmentedLocals, later, identifier);
    const wrappedInitializer = function() {
      const construct = () => initializer.call(this);
      const instance = hooks.aroundInit ? hooks.aroundInit(construct, augmentedLocals) : construct();
      hooks.onInstance?.(instance, augmentedLocals);
      return instance;
    };
    Object.defineProperty(wrappedInitializer, "instance", {
      get: () => initializer.instance,
      set: (value) => {
        initializer.instance = value;
      },
      enumerable: true
    });
    Object.defineProperty(wrappedInitializer, "identifier", {
      get: () => initializer.identifier,
      enumerable: true
    });
    return wrappedInitializer;
  };
  return wrapped;
}
function chainInstanceMethod(instance, methodName, addition) {
  const target = instance;
  const previous = target[methodName];
  target[methodName] = function(...args) {
    const result = previous?.apply(this, args);
    addition();
    return result;
  };
}
function prependInstanceMethod(instance, methodName, addition) {
  const target = instance;
  const previous = target[methodName];
  target[methodName] = function(...args) {
    addition();
    return previous?.apply(this, args);
  };
}
var CONTENT_PROJECTION_KEY = "$ngjsContentProjection";
function decorateControllerContentProjection($delegate) {
  return decorateControllerWith($delegate, {
    onInstance: (instance, locals) => {
      if (!instance || typeof instance !== "object") return;
      if (!CompiledType.isComponent(CompiledType.ofInstance(instance))) return;
      const $transclude = locals?.$transclude;
      const $element = locals?.$element;
      const $scope = locals?.$scope;
      if (typeof $transclude !== "function" || !$element || !$scope) return;
      if ($element.data(CONTENT_PROJECTION_KEY)) return;
      const hasContentQueries = QueryContext.scopeRegistries($scope).some((registry) => registry.hasContentQueries);
      if (!hasContentQueries) return;
      const projection = {
        consumed: false
      };
      $element.data(CONTENT_PROJECTION_KEY, projection);
      chainInstanceMethod(instance, "$onInit", () => {
        const owners2 = QueryContext.scopeRegistries($scope).filter((registry) => registry.hasContentQueries);
        QueryContext.runWithContentOwners(owners2, () => {
          $transclude((clone, transcludedScope) => {
            projection.clone = clone;
            if (clone?.length) {
              const container = $element[0].ownerDocument.createDocumentFragment();
              for (const node of Array.from(clone)) container.appendChild(node);
              projection.container = container;
            }
            const rootNodes = clone ? Array.from(clone) : [];
            for (const owner of owners2) owner.registerContentRoots(rootNodes);
            if (transcludedScope) QueryContext.bindContentOwners(transcludedScope, owners2);
          });
        });
      });
    }
  });
}
decorateControllerContentProjection.$inject = [
  "$delegate"
];
var NgContent = class _NgContent {
  static {
    this.$inject = [
      "$element",
      "$transclude",
      "$scope"
    ];
  }
  constructor($element, $transclude, $scope) {
    this.$element = $element;
    this.$transclude = $transclude;
    this.$scope = $scope;
  }
  $postLink() {
    const projection = this.$element.inheritedData(CONTENT_PROJECTION_KEY);
    if (projection && !projection.consumed) {
      projection.consumed = true;
      const host = this.$element[0];
      if (projection.container && host.parentNode) host.parentNode.insertBefore(projection.container, host.nextSibling);
      else if (projection.clone) this.$element.after(projection.clone);
      this.$element.remove();
      return;
    }
    const localOwners = QueryContext.scopeRegistries(this.$scope).filter((registry) => registry.hasContentQueries);
    const owners2 = [
      .../* @__PURE__ */ new Set([
        ...localOwners,
        ...QueryContext.contentOwners(this.$scope)
      ])
    ];
    QueryContext.runWithContentOwners(owners2, () => {
      this.$transclude?.((clone, transcludedScope) => {
        const rootNodes = clone ? Array.from(clone) : [];
        for (const owner of owners2) owner.registerContentRoots(rootNodes);
        if (transcludedScope) QueryContext.bindContentOwners(transcludedScope, owners2);
        if (clone) this.$element.after(clone);
      });
    });
    this.$element.remove();
  }
  static directive() {
    return {
      controller: _NgContent,
      restrict: "E"
    };
  }
};

// ../ngjs-core/dist/chunk-53AWRANH.js
var ApplicationRef = class {
};
var ApplicationRefImpl = class extends ApplicationRef {
  constructor($rootScope, injector) {
    super(), this.$rootScope = $rootScope, this.injector = injector, this.viewOwnerKind = "application", this._destroyed = false, this._destroyListeners = /* @__PURE__ */ new Set(), this.views = /* @__PURE__ */ new Set(), this.trackedViews = /* @__PURE__ */ new WeakSet();
    this.isStable = of(true);
  }
  get destroyed() {
    return this._destroyed;
  }
  get viewCount() {
    return this.views.size;
  }
  tick() {
    if (this._destroyed || this.$rootScope.$$phase) return;
    this.$rootScope.$digest();
  }
  whenStable() {
    return Promise.resolve();
  }
  attachView(viewRef) {
    this.assertNotDestroyed();
    if (viewRef.destroyed) {
      throw new Error("No se puede adjuntar una vista destruida");
    }
    const currentOwner = getViewOwner(viewRef);
    if (currentOwner === this) return;
    if (currentOwner) {
      throw new Error(`La vista ya pertenece a un ${currentOwner.viewOwnerKind}`);
    }
    claimView(viewRef, this);
    this.views.add(viewRef);
    try {
      viewRef.reattach();
    } catch (error) {
      this.views.delete(viewRef);
      releaseView(viewRef, this);
      throw error;
    }
    if (this.trackedViews.has(viewRef)) return;
    this.trackedViews.add(viewRef);
    viewRef.onDestroy(() => {
      this.views.delete(viewRef);
      releaseView(viewRef, this);
    });
  }
  detachView(viewRef) {
    if (getViewOwner(viewRef) !== this) return;
    this.views.delete(viewRef);
    releaseView(viewRef, this);
    viewRef.detach();
  }
  onDestroy(callback) {
    this.assertNotDestroyed();
    this._destroyListeners.add(callback);
    return () => {
      this._destroyListeners.delete(callback);
    };
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    for (const viewRef of [
      ...this.views
    ]) viewRef.destroy();
    this.views.clear();
    for (const callback of this._destroyListeners) callback();
    this._destroyListeners.clear();
    this.$rootScope.$destroy();
  }
  assertNotDestroyed() {
    if (this._destroyed) throw new Error("ApplicationRef ya fue destruido");
  }
};
ApplicationRef.ɵfac = [
  function ApplicationRef_Factory() {
    return new ApplicationRef();
  }
];
ApplicationRef.ɵprov = {
  token: "ApplicationRef_584e852c",
  providedIn: "root",
  factory: [
    "$rootScope",
    "$injector",
    function(a0, a1) {
      return (($rootScope, $injector) => new ApplicationRefImpl($rootScope, $injector))(a0, a1);
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "ApplicationRef_584e852c",
  ApplicationRef.ɵprov.factory
]);

// ../ngjs-core/dist/chunk-KH2MUQKK.js
var NG_VALUE_ACCESSOR = new InjectionToken("NG_VALUE_ACCESSOR");
NG_VALUE_ACCESSOR.ɵprov = {
  token: "NG_VALUE_ACCESSOR_de942eb5"
};
var NG_VALIDATORS = new InjectionToken("NG_VALIDATORS");
var NG_ASYNC_VALIDATORS = new InjectionToken("NG_ASYNC_VALIDATORS");
NG_VALIDATORS.ɵprov = {
  token: "NG_VALIDATORS_d8f0216a"
};
NG_ASYNC_VALIDATORS.ɵprov = {
  token: "NG_ASYNC_VALIDATORS_51166bf2"
};

// ../ngjs-core/dist/chunk-UMOHHN4T.js
var DestroyRef = class {
};
var DestroyRefImpl = class extends DestroyRef {
  constructor($scope) {
    super(), // ya tenemos RxJS — un Subject resuelve "avisar ahora, y si ya pasó, avisar
    // igual al toque" solo: al completarse, cualquier subscribe() posterior
    // recibe `complete()` sincrónico (confirmado leyendo Subject._innerSubscribe/
    // _checkFinalizedStatuses en rxjs), sin necesitar banderas ni Set a mano.
    this.destroyed$ = new Subject();
    $scope.$on("$destroy", () => {
      this.destroyed$.next();
      this.destroyed$.complete();
    });
  }
  onDestroy(callback) {
    const subscription = this.destroyed$.subscribe({
      complete: callback
    });
    return () => subscription.unsubscribe();
  }
};
DestroyRef.ɵfac = [
  function DestroyRef_Factory() {
    return new DestroyRef();
  }
];
DestroyRef.ɵprov = {
  token: "DestroyRef_a5c7a091"
};

// ../ngjs-core/dist/chunk-6CHJLWAB.js
var stack = [];
function runInInjectionContext(resolver, fn2) {
  stack.push(resolver);
  try {
    return fn2();
  } finally {
    stack.pop();
  }
}
function currentInjectionResolver() {
  return stack.at(-1);
}

// ../ngjs-core/dist/chunk-66LGCCGC.js
var import_angular3 = __toESM(require_angular(), 1);
var import_angular4 = __toESM(require_angular(), 1);
var NgDisabled = class {
  static {
    this.$name = "ngDisabled";
  }
};
NgDisabled.ɵfac = [
  function NgDisabled_Factory() {
    return new NgDisabled();
  }
];
NgDisabled.ɵprov = {
  token: "NgDisabled_ad0baf4f"
};
var ErrorHandler = class {
};
var ErrorHandlerImpl = class extends ErrorHandler {
  handleError(error) {
    console.error(error);
  }
};
ErrorHandler.ɵfac = [
  function ErrorHandler_Factory() {
    return new ErrorHandler();
  }
];
ErrorHandler.ɵprov = {
  token: "ErrorHandler_2d9404f0",
  providedIn: "root",
  factory: [
    "$injector",
    function($injector) {
      return $injector.invoke(Object.prototype.hasOwnProperty.call(ErrorHandlerImpl, "ɵfac") ? ErrorHandlerImpl.ɵfac : [
        function() {
          return new ErrorHandlerImpl();
        }
      ]);
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "ErrorHandler_2d9404f0",
  ErrorHandler.ɵprov.factory
]);
function flattenResults(resultsTree) {
  return resultsTree.flat(Number.POSITIVE_INFINITY);
}
var QueryList = class {
  constructor(emitDistinctChangesOnly = true) {
    this.emitDistinctChangesOnly = emitDistinctChangesOnly;
    this.changesSubject = new Subject();
    this.changesDetected = false;
    this.lastNotifiedResults = [];
    this.results = [];
    this.changes = this.changesSubject.asObservable();
  }
  get length() {
    return this.results.length;
  }
  get first() {
    return this.results[0];
  }
  get last() {
    return this.results[this.length - 1];
  }
  get(index) {
    return this.results[index];
  }
  map(fn2) {
    return this.results.map(fn2);
  }
  filter(predicate) {
    return this.results.filter(predicate);
  }
  find(fn2) {
    return this.results.find(fn2);
  }
  reduce(fn2, initialValue) {
    return this.results.reduce(fn2, initialValue);
  }
  forEach(fn2) {
    this.results.forEach(fn2);
  }
  some(fn2) {
    return this.results.some(fn2);
  }
  toArray() {
    return [
      ...this.results
    ];
  }
  toString() {
    return this.results.toString();
  }
  reset(resultsTree, identityAccessor) {
    const nextResults = flattenResults(resultsTree);
    const identity2 = identityAccessor ?? ((value) => value);
    this.changesDetected = nextResults.length !== this.lastNotifiedResults.length || nextResults.some((value, index) => identity2(value) !== identity2(this.lastNotifiedResults[index]));
    this.results = nextResults;
  }
  notifyOnChanges() {
    if (!this.emitDistinctChangesOnly || this.changesDetected) {
      this.changesSubject.next(this);
    }
    this.lastNotifiedResults = [
      ...this.results
    ];
    this.changesDetected = false;
  }
  destroy() {
    this.changesSubject.complete();
  }
  [Symbol.iterator]() {
    return this.results[Symbol.iterator]();
  }
};
var NATIVE_INPUT_SYNC_EVENTS = [
  "input",
  "change",
  "compositionstart",
  "compositionend",
  "compositionupdate",
  "drop"
];
function jqLiteHandlers(element) {
  const data = import_angular4.default.element._data(element);
  return new Map(NATIVE_INPUT_SYNC_EVENTS.map((type) => [
    type,
    [
      ...data.events?.[type] ?? []
    ]
  ]));
}
var NATIVE_FORM_CONTROL_TAGS = /* @__PURE__ */ new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT"
]);
function declaresNgValueAccessor(type) {
  return CompiledType.providerTokens(type).includes(injectionTokenName(NG_VALUE_ACCESSOR));
}
function isControlValueAccessor(value) {
  const cva = value;
  return !!cva && typeof cva.writeValue === "function" && typeof cva.registerOnChange === "function" && typeof cva.registerOnTouched === "function";
}
function decorateControllerControlValueAccessor($delegate) {
  return decorateControllerWith($delegate, {
    onInstance: (instance, locals) => {
      if (!isControlValueAccessor(instance)) return;
      if (!declaresNgValueAccessor(CompiledType.ofInstance(instance))) return;
      const $element = locals?.$element;
      const $scope = locals?.$scope;
      const $attrs = locals?.$attrs;
      if (!$element || !$scope) return;
      const accessor = instance;
      const isNativeFormControl = NATIVE_FORM_CONTROL_TAGS.has($element[0]?.tagName ?? "");
      const ownHandlers = isNativeFormControl ? jqLiteHandlers($element[0]) : void 0;
      chainInstanceMethod(instance, "$postLink", () => {
        const ngModel = $element.controller("ngModel");
        if (!ngModel) return;
        if (isNativeFormControl) {
          ngModel.$formatters.length = 0;
          ngModel.$parsers.length = 0;
          for (const [type, handlers] of jqLiteHandlers($element[0])) {
            const own = ownHandlers?.get(type) ?? [];
            for (const handler of handlers) if (!own.includes(handler)) $element.off(type, handler);
          }
        }
        ngModel.$render = () => accessor.writeValue(ngModel.$modelValue);
        accessor.registerOnChange((value) => {
          $scope.$evalAsync(() => ngModel.$setViewValue(value));
        });
        accessor.registerOnTouched(() => {
          $scope.$evalAsync(() => ngModel.$setTouched?.());
        });
        if (ngModel.$modelValue !== void 0 && !Number.isNaN(ngModel.$modelValue)) {
          accessor.writeValue(ngModel.$modelValue);
        }
        if (accessor.setDisabledState && $attrs) {
          $attrs.$observe("disabled", (value) => {
            accessor.setDisabledState?.(value !== void 0 && value !== false);
          });
        }
      });
    }
  });
}
decorateControllerControlValueAccessor.$inject = [
  "$delegate"
];
var NgDisabledImpl = class extends NgDisabled {
  get disabled() {
    return this.currentDisabled;
  }
  onChange(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
  setDisabled(disabled) {
    if (disabled === this.currentDisabled) return;
    this.currentDisabled = disabled;
    for (const listener of this.listeners) listener(disabled);
  }
  constructor(...args) {
    super(...args), this.currentDisabled = false, this.listeners = /* @__PURE__ */ new Set();
  }
};
var NgDisabledController = class extends NgDisabled {
  static {
    this.$inject = [
      "$attrs"
    ];
  }
  constructor($attrs) {
    super(), this.$attrs = $attrs, this.implementation = new NgDisabledImpl();
  }
  $onInit() {
    this.$attrs.$observe("disabled", (value) => {
      this.implementation.setDisabled(value === true || value === "disabled" || value === "true");
    });
  }
  get disabled() {
    return this.implementation.disabled;
  }
  onChange(callback) {
    return this.implementation.onChange(callback);
  }
};
var ElementNgDisabled = class _ElementNgDisabled extends NgDisabled {
  static {
    this.ATTRIBUTES = [
      "ng-disabled",
      "data-ng-disabled",
      "x-ng-disabled",
      "ng:disabled",
      "ng_disabled"
    ];
  }
  constructor($element) {
    super(), this.$element = $element;
  }
  static of($element) {
    const element = $element[0];
    if (!element?.hasAttribute || !_ElementNgDisabled.ATTRIBUTES.some((name) => element.hasAttribute(name))) return null;
    return new _ElementNgDisabled($element);
  }
  get controller() {
    return this.$element.data("$ngDisabledController");
  }
  get disabled() {
    return this.controller?.disabled ?? false;
  }
  onChange(callback) {
    return this.controller?.onChange(callback) ?? (() => void 0);
  }
};
function decorateNgDisabledDirective($delegate) {
  for (const directive of $delegate) {
    directive.controller = NgDisabledController;
  }
  return $delegate;
}
decorateNgDisabledDirective.$inject = [
  "$delegate"
];
var VIEW_CONTAINER_REF_DATA_KEY = "$viewContainerRefController";
var RESOLVE = "ɵresolve";
var ElementTokens = class _ElementTokens {
  static {
    this.created = /* @__PURE__ */ new WeakMap();
  }
  static factories() {
    _ElementTokens.byName ??= /* @__PURE__ */ new Map([
      [
        injectionTokenName(ElementRef),
        ({ $element }) => new ElementRefImpl($element[0])
      ],
      [
        injectionTokenName(ChangeDetectorRef),
        ({ $scope }) => new ChangeDetectorRefImpl($scope)
      ],
      [
        injectionTokenName(DestroyRef),
        ({ $scope }) => new DestroyRefImpl($scope)
      ],
      [
        injectionTokenName(AsyncPipe),
        ({ $scope }) => new AsyncPipeImpl($scope)
      ],
      [
        injectionTokenName(ViewContainerRef),
        ({ $element, $injector }) => _ElementTokens.viewContainerRefOf($element, $injector)
      ],
      // El `<ng-template>` donde está (o del que sale) este elemento: el controller de la directiva `ngTemplate`.
      [
        injectionTokenName(TemplateRef),
        ({ $element }) => TemplateRefImpl.of($element[0]) ?? $element.controller("ngTemplate") ?? null
      ],
      // El `ng-disabled` del mismo elemento (su controller lo pone `ng-disabled-bridge`); `null` si no tiene.
      [
        injectionTokenName(NgDisabled),
        ({ $element }) => ElementNgDisabled.of($element)
      ]
    ]);
    return _ElementTokens.byName;
  }
  /** Un `ViewContainerRef` por elemento (se crea la primera vez), descubrible por `$element.data()`. */
  static viewContainerRefOf($element, $injector) {
    const existing = $element.data(VIEW_CONTAINER_REF_DATA_KEY);
    if (existing) return existing;
    const viewContainerRef = new ViewContainerRefImpl(new ElementRefImpl($element[0]), $injector);
    $element.data(VIEW_CONTAINER_REF_DATA_KEY, viewContainerRef);
    return viewContainerRef;
  }
  static has(name) {
    return _ElementTokens.factories().has(name);
  }
  /** El valor de `name` para la construcción con estos `locals` (`undefined` si no es un token de elemento). */
  static resolve(name, locals, $injector) {
    const factory = _ElementTokens.factories().get(name);
    const $element = locals?.$element;
    const $scope = locals?.$scope;
    if (!factory || !locals || !$element?.[0] || !$scope) return void 0;
    let values = _ElementTokens.created.get(locals);
    if (!values) {
      values = /* @__PURE__ */ new Map();
      _ElementTokens.created.set(locals, values);
    }
    if (!values.has(name)) values.set(name, factory({
      $element,
      $scope,
      $injector
    }));
    return values.get(name);
  }
  /** `locals` con los tokens de elemento que pide `expression` (los que ya estén no se pisan). */
  static augment(locals, expression, $injector) {
    let augmented;
    for (const name of CompiledType.depNames(expression)) {
      if (name === RESOLVE) {
        if (!locals?.$element) continue;
        augmented ??= {
          ...locals
        };
        augmented[RESOLVE] = _ElementTokens.resolver(locals, $injector);
        continue;
      }
      if (!_ElementTokens.has(name) || locals && Object.hasOwn(locals, name)) continue;
      augmented ??= {
        ...locals
      };
      augmented[name] = _ElementTokens.resolve(name, locals, $injector);
    }
    return augmented ?? locals;
  }
  /**
  * `ɵresolve` (lo que pide el `ɵfac` para una dependencia con flags, `inject(NgDisabled, { optional: true })`) que
  * conoce los tokens de elemento: sin esto iban al injector de la app, que no los tiene. Lo demás sigue al
  * `ɵresolve` que ya hubiera en `locals` (el del injector de elemento) o al de la app.
  */
  static resolver(locals, $injector) {
    const inner = locals[RESOLVE];
    return (name, flags = {}, element) => {
      if (_ElementTokens.has(name) && !flags.skipSelf) {
        const value = _ElementTokens.resolve(name, locals, $injector);
        if (value !== void 0 && value !== null) return value;
        if (flags.optional) return null;
      }
      return (inner ?? $injector.get(RESOLVE))(name, flags, element);
    };
  }
};
function decorateControllerElementTokens($delegate, $injector) {
  return decorateControllerWith($delegate, {
    augmentLocals: (locals, expression) => ElementTokens.augment(locals, expression, $injector)
  });
}
decorateControllerElementTokens.$inject = [
  "$delegate",
  "$injector"
];
function decorateExceptionHandler($delegate, $injector) {
  let handler;
  return (exception, cause) => {
    const name = injectionTokenName(ErrorHandler);
    if (!handler && !$injector.has(name)) return $delegate(exception, cause);
    handler ??= $injector.get(name);
    handler.handleError(exception);
  };
}
decorateExceptionHandler.$inject = [
  "$delegate",
  "$injector"
];
function decorateControllerHostDirectives($delegate) {
  const invoke = $delegate;
  const wrapped = (expression, locals, later, identifier) => {
    const hostType = CompiledType.ofExpression(expression);
    if (hostType) HostDirectives.apply(hostType, locals, wrapped);
    return invoke(expression, locals, later, identifier);
  };
  return wrapped;
}
decorateControllerHostDirectives.$inject = [
  "$delegate"
];
var HostDirectives = class {
  static apply(hostType, locals, construct) {
    const entries = CompiledType.def(hostType)?.hostDirectives ?? [];
    if (entries.length === 0) return;
    const $element = locals?.$element;
    if (!$element) return;
    const $scope = locals?.$scope;
    for (const entry of entries) {
      const type = entry.directive;
      const [name] = CompiledType.registrationNames(type);
      if (!name) {
        throw new Error(`hostDirectives: "${type.name}" necesita selector — es la clave con que queda en el elemento.`);
      }
      const key = `$${name}Controller`;
      if ($element.data(key) !== void 0) continue;
      const factory = type.ɵfac;
      const instance = construct(factory, locals);
      $element.data(key, instance);
      instance.$onInit?.();
      if (instance.$postLink) {
        const runPostLink = instance.$postLink.bind(instance);
        $scope?.$$postDigest(runPostLink);
      }
      if (instance.$onDestroy && $scope) {
        $scope.$on("$destroy", () => instance.$onDestroy?.());
      }
    }
  }
};
var SCOPED_INJECTOR_DATA_KEY2 = "$ngjsScopedInjector";
var ConstructionResolver = class {
  constructor(locals, $injector) {
    this.locals = locals;
    this.$injector = $injector;
  }
  get(token, options = {}) {
    const $element = this.locals?.$element;
    if (typeof token === "function" && CompiledType.def(token)) {
      const found = options.skipSelf ? CompiledType.instanceOn($element?.parent(), token) : CompiledType.instanceOn($element, token);
      if (found !== void 0) return found;
      if (options.optional) return null;
      throw new Error(`inject(): no hay una instancia de "${token.name}" en este elemento ni en sus ancestros.`);
    }
    let name;
    try {
      name = injectionTokenName(token);
    } catch (error) {
      if (options.optional) return null;
      throw error;
    }
    if (!options.skipSelf && this.locals && Object.hasOwn(this.locals, name)) return this.locals[name];
    if (!options.skipSelf && ElementTokens.has(name)) return ElementTokens.resolve(name, this.locals, this.$injector);
    const node = $element?.inheritedData(SCOPED_INJECTOR_DATA_KEY2);
    if (node && (node.provides(name) || options.self || options.host)) return node.resolveWith(name, options);
    if (options.self || options.host) {
      if (options.optional) return null;
      throw new Error(`inject(): no se resolvió "${name}" con { ${options.self ? "self" : "host"}: true }.`);
    }
    if (options.optional && !this.$injector.has(name)) return null;
    return this.$injector.get(name);
  }
};
function decorateControllerInjectionContext($delegate, $injector) {
  return decorateControllerWith($delegate, {
    aroundInit: (construct, locals) => runInInjectionContext(new ConstructionResolver(locals, $injector), construct)
  });
}
decorateControllerInjectionContext.$inject = [
  "$delegate",
  "$injector"
];
var PATCHED = /* @__PURE__ */ Symbol("ngjsInputDeferPatched");
var READY = /* @__PURE__ */ Symbol("ngjsInputsReady");
var PENDING = /* @__PURE__ */ Symbol("ngjsPendingInputs");
function decorateControllerInputDefer($delegate) {
  return decorateControllerWith($delegate, {
    onInstance: (instance) => {
      if (!instance) return;
      const Clase = CompiledType.ofInstance(instance);
      if (CompiledType.isComponent(Clase)) return;
      const inputs = Object.values(CompiledType.def(Clase)?.inputs ?? {});
      if (inputs.length === 0) return;
      patchInputSetters(Clase, inputs);
      prependInstanceMethod(instance, "$postLink", () => {
        const state = instance;
        state[READY] = true;
        const pending = state[PENDING];
        if (!pending || pending.size === 0) return;
        const entries = [
          ...pending
        ];
        pending.clear();
        for (const [prop, value] of entries) {
          state[prop] = value;
        }
      });
    }
  });
}
decorateControllerInputDefer.$inject = [
  "$delegate"
];
function patchInputSetters(Clase, propNames) {
  const proto = Clase.prototype;
  if (proto[PATCHED]) return;
  proto[PATCHED] = true;
  for (const prop of propNames) {
    const found = findAccessor(proto, prop);
    if (!found || typeof found.desc.set !== "function") continue;
    const originalSet = found.desc.set;
    const originalGet = found.desc.get;
    Object.defineProperty(proto, prop, {
      configurable: true,
      enumerable: found.desc.enumerable ?? false,
      get: originalGet ? function() {
        return originalGet.call(this);
      } : void 0,
      set(value) {
        if (this[READY]) {
          originalSet.call(this, value);
          return;
        }
        try {
          originalSet.call(this, value);
        } catch {
          (this[PENDING] ??= /* @__PURE__ */ new Map()).set(prop, value);
        }
      }
    });
  }
}
function findAccessor(proto, prop) {
  for (let target = proto; target && target !== Object.prototype; target = Object.getPrototypeOf(target)) {
    const desc = Object.getOwnPropertyDescriptor(target, prop);
    if (desc) return {
      target,
      desc
    };
  }
  return void 0;
}
var Query = class {
  constructor(def) {
    this.def = def;
  }
  /** Una clase, o nombres de `#ref`/`ng-ref`. */
  get predicate() {
    return this.def.predicate;
  }
  get read() {
    return this.def.read;
  }
  get descendants() {
    return this.def.descendants;
  }
  static from(def) {
    return def.first ? new SingleQuery(def) : new ListQuery(def);
  }
};
var SingleQuery = class extends Query {
  get value() {
    return this.current;
  }
  resolve(values) {
    this.current = values[0];
  }
  destroy() {
  }
};
var ListQuery = class extends Query {
  get value() {
    return this.resolved ? this.list : void 0;
  }
  resolve(values) {
    this.resolved = true;
    this.list.reset(values);
    this.list.notifyOnChanges();
  }
  destroy() {
    this.list.destroy();
  }
  constructor(...args) {
    super(...args), this.list = new QueryList(), this.resolved = false;
  }
};
var ViewQueryRegistry = class _ViewQueryRegistry {
  get hasContentQueries() {
    return this.contentQueries.length > 0;
  }
  /** `true` si `node` está dentro del host de este registry (y no es el host). */
  containsLightDomNode(node) {
    const host = this.hostNode;
    if (!host || !node || node === host) return false;
    return host.contains(node);
  }
  /** `true` si `node` está en la vista de este componente (dentro de su host, sin ser el host). */
  containsViewNode(node) {
    const host = this.componentNode;
    return !!host && !!node && node !== host && host.contains(node);
  }
  registerViewQuery(query) {
    this.viewQueries.push(query);
  }
  registerContentQuery(query) {
    this.contentQueries.push(query);
  }
  registerCandidate(tokens, value, node) {
    this.candidates.push({
      tokens,
      value,
      node
    });
    this.notifyDynamic();
  }
  registerContentCandidate(tokens, value, node) {
    this.contentCandidates.push({
      tokens,
      value,
      node
    });
    this.notifyDynamic();
  }
  registerNamedCandidate(locator, value, node) {
    this.candidates.push({
      tokens: [],
      locator,
      value,
      node
    });
    this.notifyDynamic();
  }
  registerNamedContentCandidate(locator, value, node) {
    this.contentCandidates.push({
      tokens: [],
      locator,
      value,
      node
    });
    this.notifyDynamic();
  }
  /** Quita todo candidato (de vista y de contenido) cuyo valor sea `value` — al destruirse el controller. */
  removeCandidate(value) {
    const before = this.candidates.length + this.contentCandidates.length;
    _ViewQueryRegistry.prune(this.candidates, value);
    _ViewQueryRegistry.prune(this.contentCandidates, value);
    if (this.candidates.length + this.contentCandidates.length !== before) this.notifyDynamic();
  }
  registerContentRoots(nodes) {
    for (const node of nodes) this.contentRoots.add(node);
  }
  resolve() {
    for (const query of this.viewQueries) query.resolve(this.results(query, this.candidates, false));
    for (const query of this.contentQueries) query.resolve(this.results(query, this.contentCandidates, true));
    this.resolvedOnce = true;
  }
  destroy() {
    for (const query of [
      ...this.viewQueries,
      ...this.contentQueries
    ]) query.destroy();
  }
  notifyDynamic() {
    if (this.resolvedOnce) this.onDynamicChange?.();
  }
  results(query, candidates, content) {
    return candidates.filter((candidate) => _ViewQueryRegistry.matches(query, candidate) && (!content || this.matchesDepth(query, candidate))).map((candidate) => this.read(query, candidate, candidates)).filter((value) => value !== void 0);
  }
  /**
  * `descendants: false` (default de `@ContentChildren`): solo los hijos directos del contenido proyectado. Lo que un
  * `ng-repeat`/`ng-if` de la raíz del contenido inserta al lado de su ancla también lo es (en Angular son los nodos
  * raíz de las vistas de un `@for`/`@if`): comparte padre con los nodos raíz.
  */
  matchesDepth(query, candidate) {
    if (query.descendants || this.contentRoots.size === 0) return true;
    const node = candidate.node;
    if (node === void 0) return false;
    if (this.contentRoots.has(node)) return true;
    const parent = node.parentNode;
    if (!parent) return false;
    for (const root of this.contentRoots) if (root.parentNode === parent) return true;
    return false;
  }
  static matches(query, candidate) {
    const { predicate } = query;
    return Array.isArray(predicate) ? candidate.locator !== void 0 && predicate.includes(candidate.locator) : candidate.tokens.includes(predicate);
  }
  /** `read` de la query: sin `read`, el valor del candidato; con `read`, ese token sobre el mismo elemento. */
  read(query, candidate, siblings) {
    const read2 = query.read;
    if (!read2) return candidate.value;
    if (read2 === ElementRef) return candidate.node ? new ElementRefImpl(candidate.node) : void 0;
    if (read2 === TemplateRef && candidate.value instanceof TemplateRef) return candidate.value;
    if (read2 === ViewContainerRef) {
      if (candidate.value instanceof ViewContainerRef) return candidate.value;
      const owned2 = _ViewQueryRegistry.ownedToken(candidate.value, ViewContainerRef);
      if (owned2) return owned2;
      if (candidate.node && this.injector) return new ViewContainerRefImpl(new ElementRefImpl(candidate.node), this.injector);
      return void 0;
    }
    if (typeof read2 !== "function") return void 0;
    if (candidate.tokens.includes(read2)) return candidate.value;
    const owned = _ViewQueryRegistry.ownedToken(candidate.value, read2);
    if (owned !== void 0) return owned;
    return candidate.node ? siblings.find((sibling) => sibling !== candidate && sibling.node === candidate.node && sibling.value instanceof read2)?.value : void 0;
  }
  /** Una propiedad de `value` que es instancia de `token` (ej. el `TemplateRef` que una directiva guardó). */
  static ownedToken(value, token) {
    if (!value || typeof value !== "object") return void 0;
    return Object.values(value).find((property) => property instanceof token);
  }
  static prune(list, value) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].value === value) list.splice(i, 1);
    }
  }
  constructor() {
    this.viewQueries = [];
    this.contentQueries = [];
    this.candidates = [];
    this.contentCandidates = [];
    this.contentRoots = /* @__PURE__ */ new Set();
    this.resolvedOnce = false;
  }
};
function decorateControllerViewChildQueries($delegate, $injector) {
  return decorateControllerWith($delegate, {
    onInstance: (instance, locals) => {
      if (!instance || typeof instance !== "object") return;
      const $scope = locals?.$scope;
      const $element = locals?.$element;
      const node = $element?.[0];
      const type = CompiledType.ofInstance(instance);
      const registry = new ViewQueryRegistry();
      registry.injector = $injector;
      if (node && !CompiledType.isComponent(type) && CompiledType.def(type)) registry.hostNode = node;
      if (node && CompiledType.isComponent(type)) registry.componentNode = node;
      const setterQueries = QueryInstaller.install(instance, CompiledType.def(type), registry);
      const resolve = () => {
        registry.resolve();
        for (const { propertyName, query } of setterQueries) instance[propertyName] = query.value;
      };
      if ($scope) {
        QueryContext.registerScopeRegistry($scope, registry);
        let pending = false;
        registry.onDynamicChange = () => {
          if (pending) return;
          pending = true;
          $scope.$evalAsync(() => {
            pending = false;
            resolve();
          });
        };
        CandidatePublisher.publish(instance, $scope, node, registry);
        $scope.$on("$destroy", () => registry.destroy());
      }
      prependInstanceMethod(instance, "$postLink", resolve);
    }
  });
}
decorateControllerViewChildQueries.$inject = [
  "$delegate",
  "$injector"
];
var QueryInstaller = class _QueryInstaller {
  /** Instala las queries de `def` en `instance`; devuelve las que van por setter (se asignan en cada resolve). */
  static install(instance, def, registry) {
    const setterQueries = [];
    const register = (queryDef, content) => {
      for (const definition of queryDef ?? []) {
        const query = Query.from(definition);
        if (content) registry.registerContentQuery(query);
        else registry.registerViewQuery(query);
        const { propertyName } = definition;
        if (_QueryInstaller.hasSetter(instance, propertyName)) {
          setterQueries.push({
            propertyName,
            query
          });
          continue;
        }
        Object.defineProperty(instance, propertyName, {
          configurable: true,
          enumerable: true,
          get: () => query.value
        });
      }
    };
    register(def?.queries, true);
    register(def?.viewQueries, false);
    return setterQueries;
  }
  static hasSetter(instance, propertyName) {
    for (let proto = Object.getPrototypeOf(instance); proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
      if (descriptor) return typeof descriptor.set === "function";
    }
    return false;
  }
};
var CandidatePublisher = class _CandidatePublisher {
  /** Las clases de la cadena de `instance` (la propia y sus bases): una query por cualquiera de ellas la encuentra. */
  static tokensOf(instance) {
    const tokens = [];
    for (let proto = Object.getPrototypeOf(instance); proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
      const ctor = proto.constructor;
      if (ctor && !tokens.includes(ctor)) tokens.push(ctor);
    }
    return tokens;
  }
  static publish(instance, $scope, node, own) {
    const tokens = _CandidatePublisher.tokensOf(instance);
    const published = [];
    for (const registry of QueryContext.ancestorRegistries($scope)) {
      registry.registerCandidate(tokens, instance, node);
      published.push(registry);
    }
    for (const owner of QueryContext.contentOwners($scope)) {
      owner.registerContentCandidate(tokens, instance, node);
      published.push(owner);
    }
    for (const registry of QueryContext.scopeRegistries($scope)) {
      if (registry === own || !registry.containsViewNode(node)) continue;
      registry.registerCandidate(tokens, instance, node);
      published.push(registry);
    }
    for (const scope of QueryContext.lexicalScopes($scope)) {
      for (const registry of QueryContext.scopeRegistries(scope)) {
        if (registry === own || !registry.hostNode || !registry.hasContentQueries) continue;
        if (registry.containsLightDomNode(node)) {
          registry.registerContentCandidate(tokens, instance, node);
          published.push(registry);
        }
      }
    }
    if (published.length > 0) {
      $scope.$on("$destroy", () => {
        for (const registry of published) registry.removeCandidate(instance);
      });
    }
  }
  /** Un `ng-ref="nombre"` (el `#nombre` de Angular) como candidato con nombre, de vista y de contenido. */
  static publishNamed(scope, locator, value) {
    const nativeElement = value && typeof value === "object" ? value.nativeElement : void 0;
    const node = nativeElement instanceof Node ? nativeElement : void 0;
    for (const registry of [
      ...QueryContext.scopeRegistries(scope),
      ...QueryContext.ancestorRegistries(scope)
    ]) {
      registry.registerNamedCandidate(locator, value, node);
    }
    for (const owner of QueryContext.contentOwners(scope)) owner.registerNamedContentCandidate(locator, value, node);
  }
};
function decorateNgRefDirective($delegate, $parse, $injector) {
  const [native] = $delegate;
  return [
    {
      ...native,
      priority: 0,
      restrict: "A",
      require: {
        ngTemplate: "?ngTemplate"
      },
      link: void 0,
      compile: (_element, attrs) => {
        const getter = $parse(attrs.ngRef);
        const setter = getter.assign;
        if (!setter) throw new Error(`ngRef: la expresión "${attrs.ngRef}" no es asignable`);
        return {
          pre: (scope, linkedElement, linkedAttrs, controllers) => {
            const [linkedNative] = Array.from(linkedElement);
            const elementRef = new ElementRefImpl(linkedNative);
            const templateRef = controllers?.ngTemplate;
            const value = NgRefValue.resolve(linkedAttrs.ngRefRead, linkedElement, elementRef, templateRef, $injector);
            CandidatePublisher.publishNamed(scope, linkedAttrs.ngRef, value);
            scope.$on("$destroy", () => {
              if (getter(scope) === value) setter(scope, null);
            });
            setter(scope, value);
          }
        };
      }
    }
  ];
}
decorateNgRefDirective.$inject = [
  "$delegate",
  "$parse",
  "$injector"
];
var NgRefValue = class _NgRefValue {
  static {
    this.SYNTHETIC = /* @__PURE__ */ new Map([
      [
        "ElementRef",
        "ElementRef"
      ],
      [
        "elementRef",
        "ElementRef"
      ],
      [
        "TemplateRef",
        "TemplateRef"
      ],
      [
        "templateRef",
        "TemplateRef"
      ],
      [
        "ViewContainerRef",
        "ViewContainerRef"
      ],
      [
        "viewContainerRef",
        "ViewContainerRef"
      ]
    ]);
  }
  static resolve(read2, element, elementRef, templateRef, $injector) {
    if (!read2) return _NgRefValue.componentOn(element) ?? templateRef ?? elementRef;
    if (read2 === "$element" || read2 === "ngTemplate") {
      _NgRefValue.warnLegacy(read2);
      return read2 === "$element" ? elementRef : templateRef ?? null;
    }
    const synthetic = _NgRefValue.SYNTHETIC.get(read2);
    if (synthetic === "ElementRef") return elementRef;
    if (synthetic === "TemplateRef") return templateRef ?? null;
    if (synthetic === "ViewContainerRef") return ElementTokens.viewContainerRefOf(element, $injector);
    const byExportAs = _NgRefValue.controllersOn(element).find((controller) => CompiledType.def(CompiledType.ofInstance(controller))?.exportAs?.includes(read2));
    if (byExportAs) return byExportAs;
    return element.data(`$${read2}Controller`) ?? null;
  }
  static {
    this.warnedLegacy = false;
  }
  static warnLegacy(read2) {
    if (_NgRefValue.warnedLegacy) return;
    _NgRefValue.warnedLegacy = true;
    console.warn(`ng-ref-read="${read2}" está deprecado; usá "${read2 === "$element" ? "ElementRef" : "TemplateRef"}".`);
  }
  /** Los controllers que AngularJS guardó en el elemento (`$<nombre>Controller`). */
  static controllersOn(element) {
    const data = element.data() ?? {};
    return Object.entries(data).filter(([key, value]) => /^\$.+Controller$/.test(key) && value && typeof value === "object").map(([, value]) => value);
  }
  static componentOn(element) {
    return _NgRefValue.controllersOn(element).find((controller) => CompiledType.isComponent(CompiledType.ofInstance(controller)));
  }
};
var SYNC_KEY = "ngjsValidators";
var ASYNC_KEY = "ngjsAsyncValidators";
function declaresProvider(type, token) {
  return CompiledType.providerTokens(type).includes(injectionTokenName(token));
}
function hasValidateMethod(value) {
  return !!value && typeof value.validate === "function";
}
function createValueOnlyControl(value) {
  return {
    value
  };
}
function toPromise(value) {
  return isObservable(value) ? firstValueFrom(value) : value;
}
function mergeErrors(errorsList) {
  let merged = {};
  let hasErrors = false;
  for (const errors of errorsList) {
    if (errors != null) {
      hasErrors = true;
      merged = {
        ...merged,
        ...errors
      };
    }
  }
  return hasErrors ? merged : null;
}
function applyErrorKeys(ngModel, errors, previousKeys) {
  const nextKeys = new Set(errors ? Object.keys(errors) : []);
  for (const key of previousKeys) {
    if (!nextKeys.has(key)) ngModel.$setValidity(key, true);
  }
  for (const key of nextKeys) ngModel.$setValidity(key, false);
  previousKeys.clear();
  for (const key of nextKeys) previousKeys.add(key);
}
function ensureSyncValidatorWired(ngModel) {
  if (!ngModel.$ngjsSyncValidators) {
    ngModel.$ngjsSyncValidators = [];
    const seenKeys = /* @__PURE__ */ new Set();
    ngModel.$validators[SYNC_KEY] = (modelValue) => {
      const control = createValueOnlyControl(modelValue);
      const merged = mergeErrors(ngModel.$ngjsSyncValidators.map((validator) => validator.validate(control)));
      applyErrorKeys(ngModel, merged, seenKeys);
      return merged === null;
    };
  }
  return ngModel.$ngjsSyncValidators;
}
function ensureAsyncValidatorWired(ngModel) {
  if (!ngModel.$ngjsAsyncValidators) {
    ngModel.$ngjsAsyncValidators = [];
    const seenKeys = /* @__PURE__ */ new Set();
    ngModel.$asyncValidators[ASYNC_KEY] = (modelValue) => {
      const control = createValueOnlyControl(modelValue);
      const validators = ngModel.$ngjsAsyncValidators;
      return Promise.all(validators.map((validator) => toPromise(validator.validate(control)))).then((results) => {
        const merged = mergeErrors(results);
        applyErrorKeys(ngModel, merged, seenKeys);
        return merged === null ? void 0 : Promise.reject(merged);
      });
    };
  }
  return ngModel.$ngjsAsyncValidators;
}
function decorateControllerNgValidators($delegate) {
  return decorateControllerWith($delegate, {
    onInstance: (instance, locals) => {
      if (!hasValidateMethod(instance)) return;
      const Clase = CompiledType.ofInstance(instance);
      const isSyncValidator = declaresProvider(Clase, NG_VALIDATORS);
      const isAsyncValidator = declaresProvider(Clase, NG_ASYNC_VALIDATORS);
      if (!isSyncValidator && !isAsyncValidator) return;
      const $element = locals?.$element;
      if (!$element) return;
      chainInstanceMethod(instance, "$postLink", () => {
        const ngModel = $element.controller("ngModel");
        if (!ngModel) return;
        if (isSyncValidator) ensureSyncValidatorWired(ngModel).push(instance);
        if (isAsyncValidator) ensureAsyncValidatorWired(ngModel).push(instance);
        ngModel.$validate();
      });
    }
  });
}
decorateControllerNgValidators.$inject = [
  "$delegate"
];
function isEmitterLike(value) {
  return !!value && typeof value === "object" && typeof value.subscribe === "function";
}
function outputPropsOf(instance) {
  return Object.values(CompiledType.def(CompiledType.ofInstance(instance))?.outputs ?? {});
}
function decorateControllerOutputEmitters($delegate) {
  return decorateControllerWith($delegate, {
    onInstance: (instance) => {
      if (!instance || typeof instance !== "object") return;
      const outputs = outputPropsOf(instance).filter((propName) => isEmitterLike(instance[propName]));
      if (outputs.length === 0) return;
      const activeSubs = /* @__PURE__ */ new Map();
      for (const propName of outputs) {
        const emitter = instance[propName];
        let boundFn;
        Object.defineProperty(instance, propName, {
          configurable: true,
          enumerable: true,
          get: () => emitter,
          set: (value) => {
            if (value === boundFn) return;
            boundFn = value;
            activeSubs.get(propName)?.unsubscribe();
            activeSubs.delete(propName);
            if (typeof value === "function") {
              activeSubs.set(propName, emitter.subscribe((emitted) => value({
                $event: emitted
              })));
            }
          }
        });
      }
      chainInstanceMethod(instance, "$onDestroy", () => {
        for (const subscription of activeSubs.values()) subscription.unsubscribe();
        activeSubs.clear();
      });
    }
  });
}
decorateControllerOutputEmitters.$inject = [
  "$delegate"
];
var BypassType = /* @__PURE__ */ (function(BypassType2) {
  BypassType2["Url"] = "URL";
  BypassType2["Html"] = "HTML";
  BypassType2["ResourceUrl"] = "ResourceURL";
  BypassType2["Script"] = "Script";
  BypassType2["Style"] = "Style";
  return BypassType2;
})({});
var SafeValueImpl = class {
  constructor(changingThisBreaksApplicationSecurity) {
    this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see https://g.co/ng/security#xss)`;
  }
};
function unwrapSafeValue(value) {
  return value instanceof SafeValueImpl ? value.changingThisBreaksApplicationSecurity : value;
}
function getSanitizationBypassType(value) {
  return value instanceof SafeValueImpl ? value.getTypeName() : null;
}
function allowSanitizationBypassAndThrow(value, type) {
  const actualType = getSanitizationBypassType(value);
  if (actualType != null && actualType !== type) {
    if (actualType === "ResourceURL" && type === "URL") return true;
    throw new Error(`Required a safe ${type}, got a ${actualType} (see https://g.co/ng/security#xss)`);
  }
  return actualType === type;
}
var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
function sanitizeUrl(url) {
  const u = String(url);
  if (u.match(SAFE_URL_PATTERN)) return u;
  return `unsafe:${u}`;
}
var SAFE_SRCSET_PATTERN = /^(?:(?:https?|file):|[^&:/?#]*(?:[/?#]|$))/i;
function sanitizeSrcset(srcset) {
  return String(srcset).split(",").map((part) => {
    const trimmed = part.trim();
    const spaceIdx = trimmed.indexOf(" ");
    const rawUrl = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const descriptor = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx);
    const safeUrl = rawUrl.match(SAFE_SRCSET_PATTERN) ? rawUrl : `unsafe:${rawUrl}`;
    return safeUrl + descriptor;
  }).join(", ");
}
function tagSet(...sets) {
  const out = {};
  for (const set of sets) for (const t of set.split(",")) out[t] = true;
  return out;
}
function merge(...sets) {
  return Object.assign({}, ...sets);
}
var VOID_ELEMENTS = tagSet("area,br,col,hr,img,wbr");
var OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");
var OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet("rp,rt");
var OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
var BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figcaption,figure,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul"));
var INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video"));
var VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
var URI_ATTRS = tagSet("background,cite,href,itemtype,longdesc,poster,src,xlink:href");
var HTML_ATTRS = tagSet("abbr,accesskey,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width");
var VALID_ATTRS = merge(URI_ATTRS, HTML_ATTRS);
var SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS = tagSet("script,style,template");
var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var NON_ALPHANUMERIC_REGEXP = /([^#-~ |!])/g;
function encodeEntities(value) {
  return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, (match) => {
    const hi = match.charCodeAt(0);
    const low = match.charCodeAt(1);
    return `&#${(hi - 55296) * 1024 + (low - 56320) + 65536};`;
  }).replace(NON_ALPHANUMERIC_REGEXP, (match) => `&#${match.charCodeAt(0)};`).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function assertNotClobbered(node, next) {
  if (next && (node.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_CONTAINED_BY) === Node.DOCUMENT_POSITION_CONTAINED_BY) {
    throw new Error("Failed to sanitize html because the element is clobbered");
  }
  return next;
}
var SanitizingHtmlSerializer = class {
  sanitizeChildren(el) {
    let current = el.firstChild;
    let traverse = true;
    const parents = [];
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        traverse = this.startElement(current);
      } else if (current.nodeType === Node.TEXT_NODE) {
        this.buf.push(encodeEntities(current.nodeValue ?? ""));
      }
      if (traverse && current.firstChild) {
        parents.push(current);
        current = current.firstChild;
        continue;
      }
      while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) this.endElement(current);
        const next = assertNotClobbered(current, current.nextSibling);
        if (next) {
          current = next;
          break;
        }
        current = assertNotClobbered(current, parents.pop() ?? null);
      }
    }
    return this.buf.join("");
  }
  startElement(element) {
    const tagName = element.nodeName.toLowerCase();
    if (VALID_ELEMENTS[tagName] !== true) {
      return SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS[tagName] !== true;
    }
    this.buf.push("<", tagName);
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name;
      const lower = name.toLowerCase();
      if (VALID_ATTRS[lower] !== true) continue;
      let value = attr.value;
      if (URI_ATTRS[lower]) value = sanitizeUrl(value);
      else if (lower === "srcset") value = sanitizeSrcset(value);
      this.buf.push(" ", name, '="', encodeEntities(value), '"');
    }
    this.buf.push(">");
    return true;
  }
  endElement(element) {
    const tagName = element.nodeName.toLowerCase();
    if (VALID_ELEMENTS[tagName] === true && VOID_ELEMENTS[tagName] !== true) {
      this.buf.push("</", tagName, ">");
    }
  }
  constructor() {
    this.buf = [];
  }
};
function inertBody(doc, html) {
  try {
    const parsed = new DOMParser().parseFromString(`<body><remove></remove>${html}`, "text/html").body;
    if (parsed) {
      parsed.firstChild?.remove();
      return parsed;
    }
  } catch {
  }
  const tpl = doc.createElement("template");
  tpl.innerHTML = html;
  return tpl.content;
}
function sanitizeHtml(doc, unsafeHtmlInput) {
  let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : "";
  let body = inertBody(doc, unsafeHtml);
  let attempts = 5;
  let parsedHtml = body.innerHTML;
  while (unsafeHtml !== parsedHtml) {
    if (attempts-- === 0) throw new Error("Failed to sanitize html because the input is unstable");
    unsafeHtml = parsedHtml;
    body = inertBody(doc, unsafeHtml);
    parsedHtml = body.innerHTML;
  }
  const result = new SanitizingHtmlSerializer().sanitizeChildren(body);
  while (body.firstChild) body.firstChild.remove();
  return result;
}
var SanitizeBridge = class _SanitizeBridge {
  static {
    this.factory = [
      "$document",
      ($document) => (value) => _SanitizeBridge.sanitize($document[0], value)
    ];
  }
  static sanitize(doc, value) {
    if (value == null) return "";
    if (allowSanitizationBypassAndThrow(value, BypassType.Html)) return unwrapSafeValue(value);
    return sanitizeHtml(doc, String(value));
  }
};
var NativeModule = import_angular3.default.module("ng.js.native", []).decorator("$controller", decorateControllerInjectionContext).decorator("$controller", decorateControllerElementTokens).decorator("$controller", decorateControllerInputDefer).decorator("$controller", decorateControllerViewChildQueries).decorator("$controller", decorateControllerContentProjection).decorator("$controller", decorateControllerOutputEmitters).decorator("$controller", decorateControllerControlValueAccessor).decorator("$controller", decorateControllerNgValidators).decorator("$controller", decorateControllerHostDirectives).decorator("$controller", decorateControllerLateDecorators).decorator("ngDisabledDirective", decorateNgDisabledDirective).decorator("ngRefDirective", decorateNgRefDirective).decorator("$exceptionHandler", decorateExceptionHandler).factory("$sanitize", SanitizeBridge.factory).directive("ngTemplate", TemplateRefImpl.directive).directive("ngContent", NgContent.directive).directive("ngContainer", NgContainer.directive).config(ConfigProviderFactory.capture);

// ../ngjs-core/dist/chunk-2GO46SZR.js
var import_angular5 = __toESM(require_angular(), 1);
var APP_INITIALIZERS_GLOBAL = "ɵngjsAppInitializers";
var APP_INITIALIZER = new InjectionToken("APP_INITIALIZER");
var AppInitializers = class {
  static add(initializer) {
    const globals = globalThis;
    const list = globals[APP_INITIALIZERS_GLOBAL] ?? [];
    list.push(initializer);
    globals[APP_INITIALIZERS_GLOBAL] = list;
  }
  static fromToken($injector) {
    const name = injectionTokenName(APP_INITIALIZER);
    if (!$injector.has(name)) return void 0;
    const initializers = $injector.get(name);
    return Promise.all(initializers.map((initializer) => initializer()));
  }
};
AppInitializers.add(($injector) => AppInitializers.fromToken($injector));
APP_INITIALIZER.ɵprov = {
  token: "APP_INITIALIZER_c591fd3f"
};
var PlatformRef = class {
};
var PlatformRefImpl = class _PlatformRefImpl extends PlatformRef {
  bootstrapModule(moduleType, _options) {
    if (this._destroyed) return Promise.reject(new Error("PlatformRef ya fue destruido"));
    const platform2 = globalThis.ɵngjsPlatform;
    if (!platform2 || typeof platform2 !== "object" || !("bootstrapModule" in platform2)) {
      return Promise.reject(new Error("La plataforma del compiler no está disponible. Usa una aplicación compilada con ng-js-cli."));
    }
    try {
      _PlatformRefImpl.prepareRootModule(moduleType);
    } catch (error) {
      return Promise.reject(error);
    }
    return platform2.bootstrapModule(moduleType).then(($injector) => {
      this.injectors.add($injector);
      return $injector;
    });
  }
  /**
  * Los bridges de `ngjs-core` (`ElementRef`, queries, `hostDirectives`, …) viven en un `angular.module` propio
  * (`NativeModule`). Como la plataforma de Angular, arrancar con `platformBrowserDynamic()` los trae solos: se
  * agregan a los `requires` del módulo raíz antes de `angular.bootstrap` (que recién ahí resuelve los requires).
  * El `controllerAs` del módulo raíz queda como constante de la app: lo usan los componentes que se registran al
  * vuelo fuera de todo `@NgModule` (`loadComponent`), ver `ComponentRegistrar`.
  */
  static prepareRootModule(moduleType) {
    const mod = moduleType?.ɵmod;
    if (!mod?.id) return;
    const module = import_angular5.default.module(mod.id);
    if (!module.requires.includes(NativeModule.name)) module.requires.unshift(NativeModule.name);
    if (mod.controllerAs !== void 0) module.constant(ComponentRegistrar.ROOT_CONTROLLER_AS, mod.controllerAs);
  }
  onDestroy(callback) {
    if (this._destroyed) return;
    this._destroyListeners.add(callback);
  }
  get destroyed() {
    return this._destroyed;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    for (const $injector of this.injectors) $injector.get(injectionTokenName(ApplicationRef)).destroy();
    this.injectors.clear();
    for (const callback of this._destroyListeners) callback();
    this._destroyListeners.clear();
  }
  constructor(...args) {
    super(...args), this._destroyed = false, this._destroyListeners = /* @__PURE__ */ new Set(), /** Las apps que arrancó: `destroy()` las destruye (su `ApplicationRef`), como Angular. */
    this.injectors = /* @__PURE__ */ new Set();
  }
};
var platform;
function platformBrowserDynamic() {
  platform ??= new PlatformRefImpl();
  return platform;
}
function bootstrapApplication(moduleType) {
  return platformBrowserDynamic().bootstrapModule(moduleType).then(($injector) => $injector.get(injectionTokenName(ApplicationRef)));
}
var PLATFORM_ID = new InjectionToken("PLATFORM_ID", {
  factory: () => "browser"
});
PLATFORM_ID.ɵprov = {
  token: "PLATFORM_ID_718b0e2a",
  providedIn: "root",
  factory: [
    function() {
      return /* @__PURE__ */ (() => "browser")();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "PLATFORM_ID_718b0e2a",
  PLATFORM_ID.ɵprov.factory
]);

// ../ngjs-core/dist/chunk-6GPCLUHF.js
var import_angular6 = __toESM(require_angular(), 1);
var OUTSIDE_ANGULAR_GLOBAL = "ɵngjsOutsideAngular";
var NgZone = class _NgZone {
  constructor($rootScope) {
    this.$rootScope = $rootScope;
    this.onUnstable = new EventEmitter();
    this.onMicrotaskEmpty = new EventEmitter();
    this.onStable = new EventEmitter();
    this.onError = new EventEmitter();
  }
  get isStable() {
    return !this.$rootScope.$$phase;
  }
  get hasPendingMicrotasks() {
    return false;
  }
  get hasPendingMacrotasks() {
    return false;
  }
  /** Afuera de un `runOutsideAngular`: lo que se programe dispara digest. */
  static isInAngularZone() {
    return !(globalThis[OUTSIDE_ANGULAR_GLOBAL] ?? 0);
  }
  static assertInAngularZone() {
    if (!_NgZone.isInAngularZone()) throw new Error("Se esperaba estar dentro de la zona de Angular.");
  }
  static assertNotInAngularZone() {
    if (_NgZone.isInAngularZone()) throw new Error("Se esperaba estar fuera de la zona de Angular.");
  }
};
var NgZoneImpl = class extends NgZone {
  constructor($rootScope, reportError = () => {
  }) {
    super($rootScope), this.reportError = reportError, this.running = 0, this.stableScheduled = false;
    $rootScope.$watch(() => this.scheduleStable());
  }
  run(fn2) {
    this.enter();
    try {
      return fn2();
    } catch (error) {
      this.onError.emit(error);
      throw error;
    } finally {
      this.leave();
    }
  }
  /** Como Angular: el error no se propaga — va a `onError` y al `ErrorHandler` (vía `$exceptionHandler`). */
  runGuarded(fn2) {
    try {
      return this.run(fn2);
    } catch (error) {
      this.reportError(error);
      return void 0;
    }
  }
  runTask(fn2) {
    return this.run(fn2);
  }
  /**
  * Lo que `fn` programe (timers, listeners, `.then`) no dispara digest al correr: los patches del compilador lo
  * deciden al programarlo, mirando este contador (como la zona de Angular).
  */
  runOutsideAngular(fn2) {
    const globals = globalThis;
    globals[OUTSIDE_ANGULAR_GLOBAL] = (globals[OUTSIDE_ANGULAR_GLOBAL] ?? 0) + 1;
    try {
      return fn2();
    } finally {
      globals[OUTSIDE_ANGULAR_GLOBAL] = globals[OUTSIDE_ANGULAR_GLOBAL] - 1;
    }
  }
  enter() {
    if (this.running++ === 0) this.onUnstable.emit();
  }
  leave() {
    if (--this.running !== 0) return;
    if (this.$rootScope.$$phase) this.scheduleStable();
    else this.$rootScope.$evalAsync(() => void 0);
  }
  /** `onMicrotaskEmpty` + `onStable` una vez, al terminar el digest en curso. */
  scheduleStable() {
    if (this.stableScheduled) return;
    this.stableScheduled = true;
    this.$rootScope.$$postDigest(() => {
      this.stableScheduled = false;
      this.onMicrotaskEmpty.emit();
      this.runOutsideAngular(() => this.onStable.emit());
    });
  }
};
NgZone.ɵfac = [
  "IRootScopeService_4447c2a8",
  function NgZone_Factory(a0) {
    return new NgZone(a0);
  }
];
NgZone.ɵprov = {
  token: "NgZone_31031859",
  providedIn: "root",
  factory: [
    "$rootScope",
    "$exceptionHandler",
    function(a0, a1) {
      return (($rootScope, $exceptionHandler) => new NgZoneImpl($rootScope, $exceptionHandler))(a0, a1);
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgZone_31031859",
  NgZone.ɵprov.factory
]);

// ../ngjs-core/dist/chunk-QYF4GMEX.js
function isPlatformBrowser(platformId) {
  return platformId === "browser";
}

// ../ngjs-core/dist/chunk-OYQQCLBA.js
var import_angular7 = __toESM(require_angular(), 1);
var HttpHeaders = class _HttpHeaders {
  constructor(init) {
    this.headers = /* @__PURE__ */ new Map();
    if (typeof init === "string") {
      for (const line of init.split("\n")) {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) continue;
        const name = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        if (name) this.appendInPlace(name, value);
      }
    } else if (init) {
      for (const [name, value] of Object.entries(init)) this.appendInPlace(name, value);
    }
  }
  has(name) {
    return this.headers.has(name.toLowerCase());
  }
  get(name) {
    return this.headers.get(name.toLowerCase())?.[0] ?? null;
  }
  getAll(name) {
    const values = this.headers.get(name.toLowerCase());
    return values ? [
      ...values
    ] : null;
  }
  keys() {
    return [
      ...this.headers.keys()
    ];
  }
  set(name, value) {
    const copy = this.clone();
    copy.headers.set(name.toLowerCase(), Array.isArray(value) ? [
      ...value
    ] : [
      value
    ]);
    return copy;
  }
  append(name, value) {
    const copy = this.clone();
    copy.appendInPlace(name, value);
    return copy;
  }
  delete(name) {
    const copy = this.clone();
    copy.headers.delete(name.toLowerCase());
    return copy;
  }
  /** Aplanado a `{nombre: "v1, v2"}` — lo que espera `$httpBackend`. */
  toObject() {
    const result = {};
    for (const [key, values] of this.headers) result[key] = values.join(", ");
    return result;
  }
  appendInPlace(name, value) {
    const key = name.toLowerCase();
    const values = Array.isArray(value) ? value : [
      value
    ];
    this.headers.set(key, [
      ...this.headers.get(key) ?? [],
      ...values
    ]);
  }
  clone() {
    const copy = new _HttpHeaders();
    for (const [key, values] of this.headers) copy.headers.set(key, [
      ...values
    ]);
    return copy;
  }
};
var HttpResponse = class {
  constructor(init) {
    this.type = 0;
    this.status = init.status;
    this.statusText = init.statusText;
    this.headers = init.headers;
    this.url = init.url;
    this.body = init.body;
    this.ok = init.status >= 200 && init.status < 300;
  }
};
var HttpErrorResponse = class extends Error {
  constructor(init) {
    super(`Http failure response for ${init.url ?? "(unknown url)"}: ${init.status} ${init.statusText}`), this.ok = false;
    this.name = "HttpErrorResponse";
    this.status = init.status;
    this.statusText = init.statusText;
    this.headers = init.headers;
    this.url = init.url;
    this.error = init.error;
  }
};
var HttpBackend = class {
};
var HttpBackendImpl = class extends HttpBackend {
  constructor($httpBackend) {
    super(), this.$httpBackend = $httpBackend;
  }
  handle(req) {
    return new Observable((subscriber) => {
      let resolveCancel;
      const cancelPromise = new Promise((resolve) => {
        resolveCancel = resolve;
      });
      const timeoutHandle = typeof req.timeout === "number" ? setTimeout(resolveCancel, req.timeout) : void 0;
      const rawBackend = this.$httpBackend;
      rawBackend(req.method, req.urlWithParams(), req.body, (status, response, headersString, statusText) => {
        const headers = new HttpHeaders(headersString);
        const url = req.urlWithParams();
        if (status >= 200 && status < 300) {
          subscriber.next(new HttpResponse({
            status,
            statusText,
            headers,
            url,
            body: response
          }));
          subscriber.complete();
        } else {
          subscriber.error(new HttpErrorResponse({
            status,
            statusText,
            headers,
            url,
            error: response
          }));
        }
      }, req.headers.toObject(), cancelPromise, req.withCredentials, req.responseType === "json" ? "json" : req.responseType);
      return () => {
        if (timeoutHandle !== void 0) clearTimeout(timeoutHandle);
        resolveCancel();
      };
    });
  }
};
HttpBackend.ɵfac = [
  function HttpBackend_Factory() {
    return new HttpBackend();
  }
];
HttpBackend.ɵprov = {
  token: "HttpBackend_fd8f1883"
};
HttpBackendImpl.ɵfac = [
  "$httpBackend",
  function HttpBackendImpl_Factory(a0) {
    return new HttpBackendImpl(a0);
  }
];
HttpBackendImpl.ɵprov = {
  token: "HttpBackendImpl_71e66bb5"
};
var HTTP_INTERCEPTORS = new InjectionToken("HTTP_INTERCEPTORS");
var HttpInterceptorHandler = class {
  constructor(next, interceptor) {
    this.next = next;
    this.interceptor = interceptor;
  }
  handle(req) {
    return this.interceptor.intercept(req, this.next);
  }
};
function buildInterceptorChain(interceptors, backendHandler) {
  return interceptors.reduceRight((next, interceptor) => new HttpInterceptorHandler(next, interceptor), backendHandler);
}
HTTP_INTERCEPTORS.ɵprov = {
  token: "HTTP_INTERCEPTORS_3a0bef79"
};
var HttpParams = class _HttpParams {
  constructor(init) {
    this.params = /* @__PURE__ */ new Map();
    if (typeof init === "string") {
      const search = init.startsWith("?") ? init.slice(1) : init;
      for (const pair of search.split("&")) {
        if (!pair) continue;
        const [rawKey, rawValue = ""] = pair.split("=");
        this.appendInPlace(decodeURIComponent(rawKey), decodeURIComponent(rawValue));
      }
    } else if (init) {
      for (const [key, value] of Object.entries(init)) this.appendInPlace(key, value);
    }
  }
  has(key) {
    return this.params.has(key);
  }
  get(key) {
    return this.params.get(key)?.[0] ?? null;
  }
  getAll(key) {
    const values = this.params.get(key);
    return values ? [
      ...values
    ] : null;
  }
  keys() {
    return [
      ...this.params.keys()
    ];
  }
  set(key, value) {
    const copy = this.clone();
    copy.params.set(key, (Array.isArray(value) ? value : [
      value
    ]).map(String));
    return copy;
  }
  append(key, value) {
    const copy = this.clone();
    copy.appendInPlace(key, value);
    return copy;
  }
  delete(key) {
    const copy = this.clone();
    copy.params.delete(key);
    return copy;
  }
  toString() {
    const parts = [];
    for (const [key, values] of this.params) {
      for (const value of values) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return parts.join("&");
  }
  appendInPlace(key, value) {
    const values = (Array.isArray(value) ? value : [
      value
    ]).map(String);
    this.params.set(key, [
      ...this.params.get(key) ?? [],
      ...values
    ]);
  }
  clone() {
    const copy = new _HttpParams();
    for (const [key, values] of this.params) copy.params.set(key, [
      ...values
    ]);
    return copy;
  }
};
var HttpRequest = class _HttpRequest {
  constructor(method, url, body = null, init = {}) {
    this.method = method;
    this.url = url;
    this.body = body;
    this.headers = init.headers ?? new HttpHeaders();
    this.params = init.params ?? new HttpParams();
    this.withCredentials = init.withCredentials ?? false;
    this.responseType = init.responseType ?? "json";
    this.timeout = init.timeout;
  }
  /** La URL de verdad a pedir — `params` ya anexados como query string. */
  urlWithParams() {
    const query = this.params.toString();
    if (!query) return this.url;
    return this.url + (this.url.includes("?") ? "&" : "?") + query;
  }
  clone(update = {}) {
    return new _HttpRequest(update.method ?? this.method, update.url ?? this.url, "body" in update ? update.body ?? null : this.body, {
      headers: update.headers ?? this.headers,
      params: update.params ?? this.params,
      withCredentials: update.withCredentials ?? this.withCredentials,
      responseType: update.responseType ?? this.responseType,
      timeout: update.timeout ?? this.timeout
    });
  }
};
var HttpClient = class {
};
var HttpClientImpl = class extends HttpClient {
  constructor(injector, backend) {
    super();
    const interceptors = injector.get(HTTP_INTERCEPTORS, []);
    this.chain = buildInterceptorChain(interceptors, backend);
  }
  request(method, url, options = {}) {
    const req = new HttpRequest(method, url, options.body ?? null, {
      headers: options.headers ?? new HttpHeaders(),
      params: options.params ?? new HttpParams(),
      withCredentials: options.withCredentials,
      responseType: options.responseType,
      timeout: options.timeout
    });
    const events$ = this.chain.handle(req);
    if (options.observe === "events" || options.observe === "response") {
      return events$;
    }
    return events$.pipe(map((event) => event.body));
  }
  get(url, options) {
    return this.request("GET", url, options);
  }
  post(url, body, options = {}) {
    return this.request("POST", url, {
      ...options,
      body
    });
  }
  put(url, body, options = {}) {
    return this.request("PUT", url, {
      ...options,
      body
    });
  }
  patch(url, body, options = {}) {
    return this.request("PATCH", url, {
      ...options,
      body
    });
  }
  delete(url, options) {
    return this.request("DELETE", url, options);
  }
  head(url, options) {
    return this.request("HEAD", url, options);
  }
};
HttpClient.ɵfac = [
  function HttpClient_Factory() {
    return new HttpClient();
  }
];
HttpClient.ɵprov = {
  token: "HttpClient_b810fb9f"
};
HttpClientImpl.ɵfac = [
  "Injector_125f3b76",
  "HttpBackend_fd8f1883",
  function HttpClientImpl_Factory(a0, a1) {
    return new HttpClientImpl(a0, a1);
  }
];
HttpClientImpl.ɵprov = {
  token: "HttpClientImpl_8280e091"
};
var HttpClientModule = class {
};
HttpClientModule.ɵfac = [
  function HttpClientModule_Factory() {
    return new HttpClientModule();
  }
];
HttpClientModule.ɵmod = {
  id: "HttpClientModule_5f687317"
};
import_angular7.default.module("HttpClientModule_5f687317", []).factory("HttpBackend_fd8f1883", Object.prototype.hasOwnProperty.call(HttpBackendImpl, "ɵfac") ? HttpBackendImpl.ɵfac : HttpBackendImpl.ɵfac ? (function() {
  throw new Error('"' + HttpBackendImpl.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new HttpBackendImpl();
  }
]).factory("HttpClient_b810fb9f", Object.prototype.hasOwnProperty.call(HttpClientImpl, "ɵfac") ? HttpClientImpl.ɵfac : HttpClientImpl.ɵfac ? (function() {
  throw new Error('"' + HttpClientImpl.name + '" hereda el factory de su clase padre — agregale @Injectable() (Angular también lo exige).');
})() : [
  function() {
    return new HttpClientImpl();
  }
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
]).factory("HttpClientModule_72dd13ea", HttpClientModule.ɵfac).run([
  "HttpClientModule_72dd13ea",
  function() {
  }
]);

// ../ngjs-core/dist/chunk-36OTCCA5.js
var import_angular8 = __toESM(require_angular(), 1);
var NgHidden = class {
  get _hidden() {
    return this.ngHidden ? "" : null;
  }
};
var NgId = class {
  get _id() {
    return this.ngId === null || this.ngId === void 0 ? null : String(this.ngId);
  }
};
var NgTitle = class {
  get _title() {
    return this.ngTitle === null || this.ngTitle === void 0 ? null : String(this.ngTitle);
  }
};
NgHidden.ɵfac = [
  "$element",
  "$scope",
  function NgHidden_Factory($element, $scope) {
    var instance = new NgHidden();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hidden;
    }, function(v) {
      v == null ? $element.removeAttr("hidden") : $element.attr("hidden", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("hidden") : $element.attr("hidden", String(v));
      })(instance._hidden);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgHidden.ɵdir = {
  selectors: [
    [
      "",
      "ngHidden",
      ""
    ]
  ],
  inputs: {
    "ngHidden": "ngHidden"
  },
  outputs: {},
  definition: {
    "bindings": {
      "ngHidden": "<?"
    }
  }
};
NgHidden.ɵfac.ɵtype = NgHidden;
NgId.ɵfac = [
  "$element",
  "$scope",
  function NgId_Factory($element, $scope) {
    var instance = new NgId();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._id;
    }, function(v) {
      v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("id") : $element.attr("id", String(v));
      })(instance._id);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgId.ɵdir = {
  selectors: [
    [
      "",
      "ngId",
      ""
    ]
  ],
  inputs: {
    "ngId": "ngId"
  },
  outputs: {},
  definition: {
    "bindings": {
      "ngId": "<?"
    }
  }
};
NgId.ɵfac.ɵtype = NgId;
NgTitle.ɵfac = [
  "$element",
  "$scope",
  function NgTitle_Factory($element, $scope) {
    var instance = new NgTitle();
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._title;
    }, function(v) {
      v == null ? $element.removeAttr("title") : $element.attr("title", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
      (function(v) {
        v == null ? $element.removeAttr("title") : $element.attr("title", String(v));
      })(instance._title);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
    });
    return instance;
  }
];
NgTitle.ɵdir = {
  selectors: [
    [
      "",
      "ngTitle",
      ""
    ]
  ],
  inputs: {
    "ngTitle": "ngTitle"
  },
  outputs: {},
  definition: {
    "bindings": {
      "ngTitle": "<?"
    }
  }
};
NgTitle.ɵfac.ɵtype = NgTitle;
var CoreModule = class {
};
CoreModule.ɵfac = [
  function CoreModule_Factory() {
    return new CoreModule();
  }
];
CoreModule.ɵmod = {
  id: "CoreModule_311f7517"
};
import_angular8.default.module("CoreModule_311f7517", [
  typeof NativeModule === "string" ? NativeModule : NativeModule.ɵmod ? NativeModule.ɵmod.id : NativeModule.name
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
]).directive("ngHidden", function() {
  return {
    controller: NgHidden.ɵfac,
    restrict: "A",
    bindToController: {
      "ngHidden": "<?"
    },
    controllerAs: "ngHidden"
  };
}).directive("ngId", function() {
  return {
    controller: NgId.ɵfac,
    restrict: "A",
    bindToController: {
      "ngId": "<?"
    },
    controllerAs: "ngId"
  };
}).directive("ngTitle", function() {
  return {
    controller: NgTitle.ɵfac,
    restrict: "A",
    bindToController: {
      "ngTitle": "<?"
    },
    controllerAs: "ngTitle"
  };
}).factory("CoreModule_2247a4cf", CoreModule.ɵfac).run([
  "CoreModule_2247a4cf",
  function() {
  }
]);
var Renderer2 = class {
};
var RendererFactory2 = class {
};
Renderer2.ɵfac = [
  function Renderer2_Factory() {
    return new Renderer2();
  }
];
Renderer2.ɵprov = {
  token: "Renderer2_d5837541"
};
RendererFactory2.ɵfac = [
  function RendererFactory2_Factory() {
    return new RendererFactory2();
  }
];
RendererFactory2.ɵprov = {
  token: "RendererFactory2_2cb52d8a"
};

// ../ngjs-core/dist/chunk-CEW374N4.js
function inject(token, options) {
  const resolver = currentInjectionResolver();
  if (resolver) return resolver.get(token, options);
  const injector = currentInjector();
  if (!injector) {
    if (options?.optional) return null;
    throw new Error("inject(): no existe un contexto de inyección activo. Ejecuta el código dentro de una aplicación compilada.");
  }
  return options?.optional ? injector.get(token, null) : injector.get(token);
}

// ../ngb-js/node_modules/tslib/tslib.es6.mjs
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1) throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from2, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from2.length, ar; i < l; i++) {
    if (ar || !(i in from2)) {
      if (!ar) ar = Array.prototype.slice.call(from2, 0, i);
      ar[i] = from2[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from2));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isFunction.js
function isFunction(value) {
  return typeof value === "function";
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
function createErrorClass(createImpl) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js
var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
function arrRemove(arr, item) {
  if (arr) {
    var index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/Subscription.js
var Subscription = (function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = (function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  })();
  return Subscription2;
})();
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/config.js
var config = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false
};

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js
var timeoutProvider = {
  setTimeout: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = timeoutProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
      return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function(handle) {
    var delegate = timeoutProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
  },
  delegate: void 0
};

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    var onUnhandledError = config.onUnhandledError;
    if (onUnhandledError) {
      onUnhandledError(err);
    } else {
      throw err;
    }
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/noop.js
function noop() {
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
var COMPLETE_NOTIFICATION = (function() {
  return createNotification("C", void 0, void 0);
})();
function errorNotification(error) {
  return createNotification("E", void 0, error);
}
function nextNotification(value) {
  return createNotification("N", value, void 0);
}
function createNotification(kind, value, error) {
  return {
    kind,
    value,
    error
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/errorContext.js
var context = null;
function errorContext(cb) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    var isRoot = !context;
    if (isRoot) {
      context = { errorThrown: false, error: null };
    }
    cb();
    if (isRoot) {
      var _a = context, errorThrown = _a.errorThrown, error = _a.error;
      context = null;
      if (errorThrown) {
        throw error;
      }
    }
  } else {
    cb();
  }
}
function captureError(err) {
  if (config.useDeprecatedSynchronousErrorHandling && context) {
    context.errorThrown = true;
    context.error = err;
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/Subscriber.js
var Subscriber = (function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) {
      handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) {
      handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) {
      handleStoppedNotification(COMPLETE_NOTIFICATION, this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
})(Subscription);
var _bind = Function.prototype.bind;
function bind(fn2, thisArg) {
  return _bind.call(fn2, thisArg);
}
var ConsumerObserver = (function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
})();
var SafeSubscriber = (function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      var context_1;
      if (_this && config.useDeprecatedNextContext) {
        context_1 = Object.create(observerOrNext);
        context_1.unsubscribe = function() {
          return _this.unsubscribe();
        };
        partialObserver = {
          next: observerOrNext.next && bind(observerOrNext.next, context_1),
          error: observerOrNext.error && bind(observerOrNext.error, context_1),
          complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
        };
      } else {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
})(Subscriber);
function handleUnhandledError(error) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    captureError(error);
  } else {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
function handleStoppedNotification(notification, subscriber) {
  var onStoppedNotification = config.onStoppedNotification;
  onStoppedNotification && timeoutProvider.setTimeout(function() {
    return onStoppedNotification(notification, subscriber);
  });
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/symbol/observable.js
var observable = (function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
})();

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/identity.js
function identity(x) {
  return x;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/pipe.js
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn2) {
      return fn2(prev);
    }, input);
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/Observable.js
var Observable2 = (function() {
  function Observable3(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable3.prototype.lift = function(operator) {
    var observable2 = new Observable3();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable3.prototype.subscribe = function(observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function() {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable3.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable3.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable3.prototype._subscribe = function(subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable3.prototype[observable] = function() {
    return this;
  };
  Observable3.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable3.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable3.create = function(subscribe) {
    return new Observable3(subscribe);
  };
  return Observable3;
})();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js
var ObjectUnsubscribedError = createErrorClass(function(_super) {
  return function ObjectUnsubscribedErrorImpl() {
    _super(this);
    this.name = "ObjectUnsubscribedError";
    this.message = "object unsubscribed";
  };
});

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/Subject.js
var Subject2 = (function(_super) {
  __extends(Subject3, _super);
  function Subject3() {
    var _this = _super.call(this) || this;
    _this.closed = false;
    _this.currentObservers = null;
    _this.observers = [];
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject3.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject3.prototype._throwIfClosed = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
  };
  Subject3.prototype.next = function(value) {
    var _this = this;
    errorContext(function() {
      var e_1, _a;
      _this._throwIfClosed();
      if (!_this.isStopped) {
        if (!_this.currentObservers) {
          _this.currentObservers = Array.from(_this.observers);
        }
        try {
          for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
            var observer = _c.value;
            observer.next(value);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
    });
  };
  Subject3.prototype.error = function(err) {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.hasError = _this.isStopped = true;
        _this.thrownError = err;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().error(err);
        }
      }
    });
  };
  Subject3.prototype.complete = function() {
    var _this = this;
    errorContext(function() {
      _this._throwIfClosed();
      if (!_this.isStopped) {
        _this.isStopped = true;
        var observers = _this.observers;
        while (observers.length) {
          observers.shift().complete();
        }
      }
    });
  };
  Subject3.prototype.unsubscribe = function() {
    this.isStopped = this.closed = true;
    this.observers = this.currentObservers = null;
  };
  Object.defineProperty(Subject3.prototype, "observed", {
    get: function() {
      var _a;
      return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
    },
    enumerable: false,
    configurable: true
  });
  Subject3.prototype._trySubscribe = function(subscriber) {
    this._throwIfClosed();
    return _super.prototype._trySubscribe.call(this, subscriber);
  };
  Subject3.prototype._subscribe = function(subscriber) {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  };
  Subject3.prototype._innerSubscribe = function(subscriber) {
    var _this = this;
    var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
    if (hasError || isStopped) {
      return EMPTY_SUBSCRIPTION;
    }
    this.currentObservers = null;
    observers.push(subscriber);
    return new Subscription(function() {
      _this.currentObservers = null;
      arrRemove(observers, subscriber);
    });
  };
  Subject3.prototype._checkFinalizedStatuses = function(subscriber) {
    var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  };
  Subject3.prototype.asObservable = function() {
    var observable2 = new Observable2();
    observable2.source = this;
    return observable2;
  };
  Subject3.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject3;
})(Observable2);
var AnonymousSubject = (function(_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function(value) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
  };
  AnonymousSubject2.prototype.error = function(err) {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
  };
  AnonymousSubject2.prototype.complete = function() {
    var _a, _b;
    (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
  };
  AnonymousSubject2.prototype._subscribe = function(subscriber) {
    var _a, _b;
    return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
  };
  return AnonymousSubject2;
})(Subject2);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/BehaviorSubject.js
var BehaviorSubject = (function(_super) {
  __extends(BehaviorSubject2, _super);
  function BehaviorSubject2(_value) {
    var _this = _super.call(this) || this;
    _this._value = _value;
    return _this;
  }
  Object.defineProperty(BehaviorSubject2.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: false,
    configurable: true
  });
  BehaviorSubject2.prototype._subscribe = function(subscriber) {
    var subscription = _super.prototype._subscribe.call(this, subscriber);
    !subscription.closed && subscriber.next(this._value);
    return subscription;
  };
  BehaviorSubject2.prototype.getValue = function() {
    var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
    if (hasError) {
      throw thrownError;
    }
    this._throwIfClosed();
    return _value;
  };
  BehaviorSubject2.prototype.next = function(value) {
    _super.prototype.next.call(this, this._value = value);
  };
  return BehaviorSubject2;
})(Subject2);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isScheduler.js
function isScheduler(value) {
  return value && isFunction(value.schedule);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/args.js
function last(arr) {
  return arr[arr.length - 1];
}
function popResultSelector(args) {
  return isFunction(last(args)) ? args.pop() : void 0;
}
function popScheduler(args) {
  return isScheduler(last(args)) ? args.pop() : void 0;
}
function popNumber(args, defaultValue) {
  return typeof last(args) === "number" ? args.pop() : defaultValue;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
var isArrayLike = (function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
});

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isPromise.js
function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js
function isInteropObservable(input) {
  return isFunction(input[observable]);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js
function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isIterable.js
function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js
function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          if (false) return [3, 8];
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done) return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js
function innerFrom(input) {
  if (input instanceof Observable2) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable2(function(subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable2(function(subscriber) {
    for (var i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable2(function(subscriber) {
    promise.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable2(function(subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable2(function(subscriber) {
    process(asyncIterable, subscriber).catch(function(err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter(this, void 0, void 0, function() {
    var value, e_2_1;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2) throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/executeSchedule.js
function executeSchedule(parentSubscription, scheduler, work, delay2, repeat) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  if (repeat === void 0) {
    repeat = false;
  }
  var scheduleSubscription = scheduler.schedule(function() {
    work();
    if (repeat) {
      parentSubscription.add(this.schedule(null, delay2));
    } else {
      this.unsubscribe();
    }
  }, delay2);
  parentSubscription.add(scheduleSubscription);
  if (!repeat) {
    return scheduleSubscription;
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/lift.js
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = (function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
})(Subscriber);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/observeOn.js
function observeOn(scheduler, delay2) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  return operate(function(source, subscriber) {
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.next(value);
      }, delay2);
    }, function() {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.complete();
      }, delay2);
    }, function(err) {
      return executeSchedule(subscriber, scheduler, function() {
        return subscriber.error(err);
      }, delay2);
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js
function subscribeOn(scheduler, delay2) {
  if (delay2 === void 0) {
    delay2 = 0;
  }
  return operate(function(source, subscriber) {
    subscriber.add(scheduler.schedule(function() {
      return source.subscribe(subscriber);
    }, delay2));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js
function scheduleObservable(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js
function schedulePromise(input, scheduler) {
  return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js
function scheduleArray(input, scheduler) {
  return new Observable2(function(subscriber) {
    var i = 0;
    return scheduler.schedule(function() {
      if (i === input.length) {
        subscriber.complete();
      } else {
        subscriber.next(input[i++]);
        if (!subscriber.closed) {
          this.schedule();
        }
      }
    });
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js
function scheduleIterable(input, scheduler) {
  return new Observable2(function(subscriber) {
    var iterator2;
    executeSchedule(subscriber, scheduler, function() {
      iterator2 = input[iterator]();
      executeSchedule(subscriber, scheduler, function() {
        var _a;
        var value;
        var done;
        try {
          _a = iterator2.next(), value = _a.value, done = _a.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
        }
      }, 0, true);
    });
    return function() {
      return isFunction(iterator2 === null || iterator2 === void 0 ? void 0 : iterator2.return) && iterator2.return();
    };
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js
function scheduleAsyncIterable(input, scheduler) {
  if (!input) {
    throw new Error("Iterable cannot be null");
  }
  return new Observable2(function(subscriber) {
    executeSchedule(subscriber, scheduler, function() {
      var iterator2 = input[Symbol.asyncIterator]();
      executeSchedule(subscriber, scheduler, function() {
        iterator2.next().then(function(result) {
          if (result.done) {
            subscriber.complete();
          } else {
            subscriber.next(result.value);
          }
        });
      }, 0, true);
    });
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js
function scheduleReadableStreamLike(input, scheduler) {
  return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js
function scheduled(input, scheduler) {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    }
    if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    }
    if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    }
    if (isAsyncIterable(input)) {
      return scheduleAsyncIterable(input, scheduler);
    }
    if (isIterable(input)) {
      return scheduleIterable(input, scheduler);
    }
    if (isReadableStreamLike(input)) {
      return scheduleReadableStreamLike(input, scheduler);
    }
  }
  throw createInvalidObservableTypeError(input);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/from.js
function from(input, scheduler) {
  return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/of.js
function of2() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  return from(args, scheduler);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/map.js
function map2(project, thisArg) {
  return operate(function(source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      subscriber.next(project.call(thisArg, value, index++));
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js
var isArray = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf;
var objectProto = Object.prototype;
var getKeys = Object.keys;
function argsArgArrayOrObject(args) {
  if (args.length === 1) {
    var first_1 = args[0];
    if (isArray(first_1)) {
      return { args: first_1, keys: null };
    }
    if (isPOJO(first_1)) {
      var keys = getKeys(first_1);
      return {
        args: keys.map(function(key) {
          return first_1[key];
        }),
        keys
      };
    }
  }
  return { args, keys: null };
}
function isPOJO(obj) {
  return obj && typeof obj === "object" && getPrototypeOf(obj) === objectProto;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js
var isArray2 = Array.isArray;
function callOrApply(fn2, args) {
  return isArray2(args) ? fn2.apply(void 0, __spreadArray([], __read(args))) : fn2(args);
}
function mapOneOrManyArgs(fn2) {
  return map2(function(args) {
    return callOrApply(fn2, args);
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/createObject.js
function createObject(keys, values) {
  return keys.reduce(function(result, key, i) {
    return result[key] = values[i], result;
  }, {});
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js
function combineLatest() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  var resultSelector = popResultSelector(args);
  var _a = argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
  if (observables.length === 0) {
    return from([], scheduler);
  }
  var result = new Observable2(combineLatestInit(observables, scheduler, keys ? function(values) {
    return createObject(keys, values);
  } : identity));
  return resultSelector ? result.pipe(mapOneOrManyArgs(resultSelector)) : result;
}
function combineLatestInit(observables, scheduler, valueTransform) {
  if (valueTransform === void 0) {
    valueTransform = identity;
  }
  return function(subscriber) {
    maybeSchedule(scheduler, function() {
      var length = observables.length;
      var values = new Array(length);
      var active = length;
      var remainingFirstValues = length;
      var _loop_1 = function(i2) {
        maybeSchedule(scheduler, function() {
          var source = from(observables[i2], scheduler);
          var hasFirstValue = false;
          source.subscribe(createOperatorSubscriber(subscriber, function(value) {
            values[i2] = value;
            if (!hasFirstValue) {
              hasFirstValue = true;
              remainingFirstValues--;
            }
            if (!remainingFirstValues) {
              subscriber.next(valueTransform(values.slice()));
            }
          }, function() {
            if (!--active) {
              subscriber.complete();
            }
          }));
        }, subscriber);
      };
      for (var i = 0; i < length; i++) {
        _loop_1(i);
      }
    }, subscriber);
  };
}
function maybeSchedule(scheduler, execute, subscription) {
  if (scheduler) {
    executeSchedule(subscription, scheduler, execute);
  } else {
    execute();
  }
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
  var buffer = [];
  var active = 0;
  var index = 0;
  var isComplete = false;
  var checkComplete = function() {
    if (isComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };
  var outerNext = function(value) {
    return active < concurrent ? doInnerSub(value) : buffer.push(value);
  };
  var doInnerSub = function(value) {
    expand && subscriber.next(value);
    active++;
    var innerComplete = false;
    innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
      onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
      if (expand) {
        outerNext(innerValue);
      } else {
        subscriber.next(innerValue);
      }
    }, function() {
      innerComplete = true;
    }, void 0, function() {
      if (innerComplete) {
        try {
          active--;
          var _loop_1 = function() {
            var bufferedValue = buffer.shift();
            if (innerSubScheduler) {
              executeSchedule(subscriber, innerSubScheduler, function() {
                return doInnerSub(bufferedValue);
              });
            } else {
              doInnerSub(bufferedValue);
            }
          };
          while (buffer.length && active < concurrent) {
            _loop_1();
          }
          checkComplete();
        } catch (err) {
          subscriber.error(err);
        }
      }
    }));
  };
  source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
    isComplete = true;
    checkComplete();
  }));
  return function() {
    additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  if (isFunction(resultSelector)) {
    return mergeMap(function(a, i) {
      return map2(function(b, ii) {
        return resultSelector(a, b, i, ii);
      })(innerFrom(project(a, i)));
    }, concurrent);
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return operate(function(source, subscriber) {
    return mergeInternals(source, subscriber, project, concurrent);
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js
var nodeEventEmitterMethods = ["addListener", "removeListener"];
var eventTargetMethods = ["addEventListener", "removeEventListener"];
var jqueryMethods = ["on", "off"];
function fromEvent(target, eventName, options, resultSelector) {
  if (isFunction(options)) {
    resultSelector = options;
    options = void 0;
  }
  if (resultSelector) {
    return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs(resultSelector));
  }
  var _a = __read(isEventTarget(target) ? eventTargetMethods.map(function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler, options);
    };
  }) : isNodeStyleEventEmitter(target) ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName)) : isJQueryStyleEventEmitter(target) ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName)) : [], 2), add = _a[0], remove = _a[1];
  if (!add) {
    if (isArrayLike(target)) {
      return mergeMap(function(subTarget) {
        return fromEvent(subTarget, eventName, options);
      })(innerFrom(target));
    }
  }
  if (!add) {
    throw new TypeError("Invalid event target");
  }
  return new Observable2(function(subscriber) {
    var handler = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return subscriber.next(1 < args.length ? args : args[0]);
    };
    add(handler);
    return function() {
      return remove(handler);
    };
  });
}
function toCommonHandlerRegistry(target, eventName) {
  return function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler);
    };
  };
}
function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
  return isFunction(target.on) && isFunction(target.off);
}
function isEventTarget(target) {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/Action.js
var Action = (function(_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return this;
  };
  return Action2;
})(Subscription);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js
var intervalProvider = {
  setInterval: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var delegate = intervalProvider.delegate;
    if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
      return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
    }
    return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearInterval: function(handle) {
    var delegate = intervalProvider.delegate;
    return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
  },
  delegate: void 0
};

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js
var AsyncAction = (function(_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function(state, delay2) {
    var _a;
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay2);
    }
    this.pending = true;
    this.delay = delay2;
    this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay2);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function(scheduler, _id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay2);
  };
  AsyncAction2.prototype.recycleAsyncId = function(_scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 != null && this.delay === delay2 && this.pending === false) {
      return id;
    }
    if (id != null) {
      intervalProvider.clearInterval(id);
    }
    return void 0;
  };
  AsyncAction2.prototype.execute = function(state, delay2) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay2);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function(state, _delay) {
    var errored = false;
    var errorValue;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = e ? e : new Error("Scheduled action threw falsy error");
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype.unsubscribe = function() {
    if (!this.closed) {
      var _a = this, id = _a.id, scheduler = _a.scheduler;
      var actions = scheduler.actions;
      this.work = this.state = this.scheduler = null;
      this.pending = false;
      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }
      this.delay = null;
      _super.prototype.unsubscribe.call(this);
    }
  };
  return AsyncAction2;
})(Action);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
  now: function() {
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: void 0
};

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/Scheduler.js
var Scheduler = (function() {
  function Scheduler2(schedulerActionCtor, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.schedulerActionCtor = schedulerActionCtor;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return new this.schedulerActionCtor(this, work).schedule(state, delay2);
  };
  Scheduler2.now = dateTimestampProvider.now;
  return Scheduler2;
})();

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js
var AsyncScheduler = (function(_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, now) || this;
    _this.actions = [];
    _this._active = false;
    return _this;
  }
  AsyncScheduler2.prototype.flush = function(action) {
    var actions = this.actions;
    if (this._active) {
      actions.push(action);
      return;
    }
    var error;
    this._active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this._active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
})(Scheduler);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/scheduler/async.js
var asyncScheduler = new AsyncScheduler(AsyncAction);
var async = asyncScheduler;

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/isDate.js
function isValidDate(value) {
  return value instanceof Date && !isNaN(value);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/timer.js
function timer(dueTime, intervalOrScheduler, scheduler) {
  if (dueTime === void 0) {
    dueTime = 0;
  }
  if (scheduler === void 0) {
    scheduler = async;
  }
  var intervalDuration = -1;
  if (intervalOrScheduler != null) {
    if (isScheduler(intervalOrScheduler)) {
      scheduler = intervalOrScheduler;
    } else {
      intervalDuration = intervalOrScheduler;
    }
  }
  return new Observable2(function(subscriber) {
    var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
    if (due < 0) {
      due = 0;
    }
    var n = 0;
    return scheduler.schedule(function() {
      if (!subscriber.closed) {
        subscriber.next(n++);
        if (0 <= intervalDuration) {
          this.schedule(void 0, intervalDuration);
        } else {
          subscriber.complete();
        }
      }
    }, due);
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js
function mergeAll(concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  return mergeMap(identity, concurrent);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/empty.js
var EMPTY2 = new Observable2(function(subscriber) {
  return subscriber.complete();
});

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/merge.js
function merge2() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = popScheduler(args);
  var concurrent = popNumber(args, Infinity);
  var sources = args;
  return !sources.length ? EMPTY2 : sources.length === 1 ? innerFrom(sources[0]) : mergeAll(concurrent)(from(sources, scheduler));
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/never.js
var NEVER = new Observable2(noop);

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/filter.js
function filter(predicate, thisArg) {
  return operate(function(source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      return predicate.call(thisArg, value, index++) && subscriber.next(value);
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/util/argsOrArgArray.js
var isArray3 = Array.isArray;
function argsOrArgArray(args) {
  return args.length === 1 && isArray3(args[0]) ? args[0] : args;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/zip.js
function zip() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var resultSelector = popResultSelector(args);
  var sources = argsOrArgArray(args);
  return sources.length ? new Observable2(function(subscriber) {
    var buffers = sources.map(function() {
      return [];
    });
    var completed = sources.map(function() {
      return false;
    });
    subscriber.add(function() {
      buffers = completed = null;
    });
    var _loop_1 = function(sourceIndex2) {
      innerFrom(sources[sourceIndex2]).subscribe(createOperatorSubscriber(subscriber, function(value) {
        buffers[sourceIndex2].push(value);
        if (buffers.every(function(buffer) {
          return buffer.length;
        })) {
          var result = buffers.map(function(buffer) {
            return buffer.shift();
          });
          subscriber.next(resultSelector ? resultSelector.apply(void 0, __spreadArray([], __read(result))) : result);
          if (buffers.some(function(buffer, i) {
            return !buffer.length && completed[i];
          })) {
            subscriber.complete();
          }
        }
      }, function() {
        completed[sourceIndex2] = true;
        !buffers[sourceIndex2].length && subscriber.complete();
      }));
    };
    for (var sourceIndex = 0; !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
      _loop_1(sourceIndex);
    }
    return function() {
      buffers = completed = null;
    };
  }) : EMPTY2;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js
function defaultIfEmpty(defaultValue) {
  return operate(function(source, subscriber) {
    var hasValue = false;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      hasValue = true;
      subscriber.next(value);
    }, function() {
      if (!hasValue) {
        subscriber.next(defaultValue);
      }
      subscriber.complete();
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/take.js
function take(count) {
  return count <= 0 ? function() {
    return EMPTY2;
  } : operate(function(source, subscriber) {
    var seen = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      if (++seen <= count) {
        subscriber.next(value);
        if (count <= seen) {
          subscriber.complete();
        }
      }
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js
function distinctUntilChanged(comparator, keySelector) {
  if (keySelector === void 0) {
    keySelector = identity;
  }
  comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
  return operate(function(source, subscriber) {
    var previousKey;
    var first = true;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var currentKey = keySelector(value);
      if (first || !comparator(previousKey, currentKey)) {
        first = false;
        previousKey = currentKey;
        subscriber.next(value);
      }
    }));
  });
}
function defaultCompare(a, b) {
  return a === b;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/finalize.js
function finalize(callback) {
  return operate(function(source, subscriber) {
    try {
      source.subscribe(subscriber);
    } finally {
      subscriber.add(callback);
    }
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/skip.js
function skip(count) {
  return filter(function(_, index) {
    return count <= index;
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/concatAll.js
function concatAll() {
  return mergeAll(1);
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/concat.js
function concat() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return concatAll()(from(args, popScheduler(args)));
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/startWith.js
function startWith() {
  var values = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    values[_i] = arguments[_i];
  }
  var scheduler = popScheduler(values);
  return operate(function(source, subscriber) {
    (scheduler ? concat(values, source, scheduler) : concat(values, source)).subscribe(subscriber);
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/switchMap.js
function switchMap(project, resultSelector) {
  return operate(function(source, subscriber) {
    var innerSubscriber = null;
    var index = 0;
    var isComplete = false;
    var checkComplete = function() {
      return isComplete && !innerSubscriber && subscriber.complete();
    };
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
      var innerIndex = 0;
      var outerIndex = index++;
      innerFrom(project(value, outerIndex)).subscribe(innerSubscriber = createOperatorSubscriber(subscriber, function(innerValue) {
        return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue);
      }, function() {
        innerSubscriber = null;
        checkComplete();
      }));
    }, function() {
      isComplete = true;
      checkComplete();
    }));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js
function takeUntil2(notifier) {
  return operate(function(source, subscriber) {
    innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, function() {
      return subscriber.complete();
    }, noop));
    !subscriber.closed && source.subscribe(subscriber);
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/tap.js
function tap(observerOrNext, error, complete) {
  var tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error, complete } : observerOrNext;
  return tapObserver ? operate(function(source, subscriber) {
    var _a;
    (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
    var isUnsub = true;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var _a2;
      (_a2 = tapObserver.next) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, value);
      subscriber.next(value);
    }, function() {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.complete) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      subscriber.complete();
    }, function(err) {
      var _a2;
      isUnsub = false;
      (_a2 = tapObserver.error) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver, err);
      subscriber.error(err);
    }, function() {
      var _a2, _b;
      if (isUnsub) {
        (_a2 = tapObserver.unsubscribe) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      }
      (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
    }));
  }) : identity;
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/observable/race.js
function race() {
  var sources = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    sources[_i] = arguments[_i];
  }
  sources = argsOrArgArray(sources);
  return sources.length === 1 ? innerFrom(sources[0]) : new Observable2(raceInit(sources));
}
function raceInit(sources) {
  return function(subscriber) {
    var subscriptions = [];
    var _loop_1 = function(i2) {
      subscriptions.push(innerFrom(sources[i2]).subscribe(createOperatorSubscriber(subscriber, function(value) {
        if (subscriptions) {
          for (var s = 0; s < subscriptions.length; s++) {
            s !== i2 && subscriptions[s].unsubscribe();
          }
          subscriptions = null;
        }
        subscriber.next(value);
      })));
    };
    for (var i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
      _loop_1(i);
    }
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/ignoreElements.js
function ignoreElements() {
  return operate(function(source, subscriber) {
    source.subscribe(createOperatorSubscriber(subscriber, noop));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/mapTo.js
function mapTo(value) {
  return map2(function() {
    return value;
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/delayWhen.js
function delayWhen(delayDurationSelector, subscriptionDelay) {
  if (subscriptionDelay) {
    return function(source) {
      return concat(subscriptionDelay.pipe(take(1), ignoreElements()), source.pipe(delayWhen(delayDurationSelector)));
    };
  }
  return mergeMap(function(value, index) {
    return innerFrom(delayDurationSelector(value, index)).pipe(take(1), mapTo(value));
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/delay.js
function delay(due, scheduler) {
  if (scheduler === void 0) {
    scheduler = asyncScheduler;
  }
  var duration = timer(due, scheduler);
  return delayWhen(function() {
    return duration;
  });
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/endWith.js
function endWith() {
  var values = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    values[_i] = arguments[_i];
  }
  return function(source) {
    return concat(source, of2.apply(void 0, __spreadArray([], __read(values))));
  };
}

// ../ngb-js/node_modules/rxjs/dist/esm5/internal/operators/withLatestFrom.js
function withLatestFrom() {
  var inputs = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    inputs[_i] = arguments[_i];
  }
  var project = popResultSelector(inputs);
  return operate(function(source, subscriber) {
    var len = inputs.length;
    var otherValues = new Array(len);
    var hasValue = inputs.map(function() {
      return false;
    });
    var ready = false;
    var _loop_1 = function(i2) {
      innerFrom(inputs[i2]).subscribe(createOperatorSubscriber(subscriber, function(value) {
        otherValues[i2] = value;
        if (!ready && !hasValue[i2]) {
          hasValue[i2] = true;
          (ready = hasValue.every(identity)) && (hasValue = null);
        }
      }, noop));
    };
    for (var i = 0; i < len; i++) {
      _loop_1(i);
    }
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      if (ready) {
        var values = __spreadArray([value], __read(otherValues));
        subscriber.next(project ? project.apply(void 0, __spreadArray([], __read(values))) : values);
      }
    }));
  });
}

// ../ngb-js/dist/chunk-W7PFLLUP.js
function toInteger(value) {
  return parseInt(`${value}`, 10);
}
function toString(value) {
  return value !== void 0 && value !== null ? `${value}` : "";
}
function getValueInRange(value, max2, min2 = 0) {
  return Math.max(Math.min(value, max2), min2);
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return !isNaN(toInteger(value));
}
function isInteger(value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isPromise2(value) {
  return value && value.then;
}
function padNumber(value) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  }
  return "";
}
function regExpEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
function closest(element, selector) {
  if (!selector || typeof element.closest === "undefined") {
    return null;
  }
  return element.closest(selector);
}
function reflow(element) {
  return (element || document.body).getBoundingClientRect();
}
function runInZone(zone) {
  return (source) => new Observable2((observer) => {
    const next = (value) => zone.run(() => observer.next(value));
    const error = (error2) => zone.run(() => observer.error(error2));
    const complete = () => zone.run(() => observer.complete());
    return source.subscribe({
      next,
      error,
      complete
    });
  });
}
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function getActiveElement(root = document) {
  const activeElement = root?.activeElement;
  if (!activeElement) {
    return null;
  }
  return activeElement.shadowRoot ? getActiveElement(activeElement.shadowRoot) : activeElement;
}
function getTransitionDurationMs(element) {
  const { transitionDelay, transitionDuration } = window.getComputedStyle(element);
  const transitionDelaySec = parseFloat(transitionDelay);
  const transitionDurationSec = parseFloat(transitionDuration);
  return (transitionDelaySec + transitionDurationSec) * 1e3;
}
var noopFn = () => {
};
var environment = {
  getTransitionTimerDelayMs: () => 5
};
var runningTransitions = /* @__PURE__ */ new Map();
var ngbRunTransition = (zone, element, startFn, options) => {
  let context2 = options.context || {};
  const running = runningTransitions.get(element);
  if (running) {
    switch (options.runningTransition) {
      case "continue":
        return EMPTY2;
      case "stop":
        zone.run(() => running.transition$.complete());
        context2 = Object.assign(running.context, context2);
        runningTransitions.delete(element);
    }
  }
  const endFn = startFn(element, options.animation, context2) || noopFn;
  if (!options.animation || window.getComputedStyle(element).transitionProperty === "none") {
    zone.run(() => endFn());
    return of2(void 0).pipe(runInZone(zone));
  }
  const transition$ = new Subject2();
  const finishTransition$ = new Subject2();
  const stop$ = transition$.pipe(endWith(true));
  runningTransitions.set(element, {
    transition$,
    complete: () => {
      finishTransition$.next();
      finishTransition$.complete();
    },
    context: context2
  });
  const transitionDurationMs = getTransitionDurationMs(element);
  zone.runOutsideAngular(() => {
    const transitionEnd$ = fromEvent(element, "transitionend").pipe(takeUntil2(stop$), filter(({ target }) => target === element));
    const timer$ = timer(transitionDurationMs + environment.getTransitionTimerDelayMs()).pipe(takeUntil2(stop$));
    race(timer$, transitionEnd$, finishTransition$).pipe(takeUntil2(stop$)).subscribe(() => {
      runningTransitions.delete(element);
      zone.run(() => {
        endFn();
        transition$.next();
        transition$.complete();
      });
    });
  });
  return transition$.asObservable();
};
var ngbCompleteTransition = (element) => {
  runningTransitions.get(element)?.complete();
};

// ../ngb-js/node_modules/@popperjs/core/lib/enums.js
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
var applyStyles_default = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect,
  requires: ["computeStyles"]
};

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function getBasePlacement(placement) {
  return placement.split("-")[0];
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/math.js
var max = Math.max;
var min = Math.min;
var round = Math.round;

// ../ngb-js/node_modules/@popperjs/core/lib/utils/userAgent.js
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/contains.js
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : (
    // $FlowFixMe[prop-missing]
    element.document
  )) || window.document).documentElement;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || // DOM Element detected
    (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element)
  );
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/within.js
function within(min2, value, max2) {
  return max(min2, min(value, max2));
}
function withinMaxClamp(min2, value, max2) {
  var v = within(min2, value, max2);
  return v > max2 ? max2 : v;
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/expandToHashMap.js
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/arrow.js
var toPaddingObject = function toPaddingObject2(padding, state) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var state = _ref.state, name = _ref.name, options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets2) {
    return;
  }
  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
  var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset2 = within(min2, center, max2);
  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
}
function effect2(_ref2) {
  var state = _ref2.state, options = _ref2.options;
  var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }
  state.elements.arrow = arrowElement;
}
var arrow_default = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect: effect2,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getVariation.js
function getVariation(placement) {
  return placement.split("-")[1];
}

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x, y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x,
    y
  }) : {
    x,
    y
  };
  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp]
      );
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp]
      );
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x,
    y
  }, getWindow(popper2)) : {
    x,
    y
  };
  x = _ref4.x;
  y = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var state = _ref5.state, options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === "fixed"
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
var computeStyles_default = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/eventListeners.js
var passive = {
  passive: true
};
function effect3(_ref) {
  var state = _ref.state, instance = _ref.instance, options = _ref.options;
  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
var eventListeners_default = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect: effect3,
  data: {}
};

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
var hash = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash[matched];
  });
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
var hash2 = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash2[matched];
  });
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();
    if (layoutViewport || !layoutViewport && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element),
    y
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
function getDocumentRect(element) {
  var _element$ownerDocumen;
  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;
  if (getComputedStyle(body || html).direction === "rtl") {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)))
  );
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/rectToClientRect.js
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === "fixed");
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}
function getClippingParents(element) {
  var clippingParents2 = listScrollParents(getParentNode(element));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/computeOffsets.js
function computeOffsets(_ref) {
  var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
        break;
      default:
    }
  }
  return offsets;
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/detectOverflow.js
function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets2 = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: "absolute",
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset2 = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset2[axis] * multiply;
    });
  }
  return overflowOffsets;
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements2.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements2;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a, b) {
    return overflows[a] - overflows[b];
  });
}

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/flip.js
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  if (state.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = /* @__PURE__ */ new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i = 0; i < placements2.length; i++) {
    var placement = placements2[i];
    var _basePlacement = getBasePlacement(placement);
    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i2) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i2).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);
      if (_ret === "break") break;
    }
  }
  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}
var flip_default = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/offset.js
function distanceAndSkiddingToXY(placement, rects, offset2) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
    placement
  })) : offset2, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var state = _ref2.state, options = _ref2.options, name = _ref2.name;
  var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }
  state.modifiersData[name] = data;
}
var offset_default = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function popperOffsets(_ref) {
  var state = _ref.state, name = _ref.name;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: "absolute",
    placement: state.placement
  });
}
var popperOffsets_default = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};

// ../ngb-js/node_modules/@popperjs/core/lib/utils/getAltAxis.js
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}

// ../ngb-js/node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
function preventOverflow(_ref) {
  var state = _ref.state, options = _ref.options, name = _ref.name;
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis) {
    var _offsetModifierState$;
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min2 = offset2 + overflow[mainSide];
    var max2 = offset2 - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset2 + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
    popperOffsets2[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset2;
  }
  if (checkAltAxis) {
    var _offsetModifierState$2;
    var _mainSide = mainAxis === "x" ? top : left;
    var _altSide = mainAxis === "x" ? bottom : right;
    var _offset = popperOffsets2[altAxis];
    var _len = altAxis === "y" ? "height" : "width";
    var _min = _offset + overflow[_mainSide];
    var _max = _offset - overflow[_altSide];
    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
    popperOffsets2[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }
  state.modifiersData[name] = data;
}
var preventOverflow_default = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

// ../ngb-js/node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/orderModifiers.js
function order(modifiers) {
  var map3 = /* @__PURE__ */ new Map();
  var visited = /* @__PURE__ */ new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map3.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map3.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/debounce.js
function debounce(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve(fn2());
        });
      });
    }
    return pending;
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/utils/mergeByName.js
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}

// ../ngb-js/node_modules/@popperjs/core/lib/createPopper.js
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper2(reference2, popper2, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options2);
        state.scrollParents = {
          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state = fn2({
              state,
              options: _options,
              name,
              instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function() {
        return new Promise(function(resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance;
    }
    instance.setOptions(options).then(function(state2) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref) {
        var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect4 = _ref.effect;
        if (typeof effect4 === "function") {
          var cleanupFn = effect4({
            state,
            name,
            instance,
            options: options2
          });
          var noopFn2 = function noopFn3() {
          };
          effectCleanupFns.push(cleanupFn || noopFn2);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}

// ../ngb-js/node_modules/@popperjs/core/lib/popper-lite.js
var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});

// ../ngb-js/dist/chunk-KILNRYUJ.js
var ARIA_LIVE_DELAY = new InjectionToken("live announcer delay", {
  providedIn: "root",
  factory: () => 100
});
function getLiveElement(document2, lazyCreate = false) {
  let element = document2.body.querySelector("#ngb-live");
  if (element == null && lazyCreate) {
    element = document2.createElement("div");
    element.setAttribute("id", "ngb-live");
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    element.classList.add("visually-hidden");
    document2.body.appendChild(element);
  }
  return element;
}
var Live = class {
  ngOnDestroy() {
    const element = getLiveElement(this._document);
    if (element) {
      element.parentElement.removeChild(element);
    }
  }
  say(message) {
    const element = getLiveElement(this._document, true);
    const delay2 = this._delay;
    if (element != null) {
      element.textContent = "";
      const setText = () => element.textContent = message;
      if (delay2 === null) {
        setText();
      } else {
        setTimeout(setText, delay2);
      }
    }
  }
  constructor() {
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["Live"] ? globalThis.ɵngjsInjected["Live"][0] : inject(DOCUMENT);
    this._delay = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["Live"] ? globalThis.ɵngjsInjected["Live"][1] : inject(ARIA_LIVE_DELAY);
  }
};
Live.ɵfac = [
  "DOCUMENT_a3a362b8",
  "ARIA_LIVE_DELAY_afbc1606",
  function Live_Factory(i0, i1) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "Live": [
        i0,
        i1
      ]
    };
    try {
      var instance = new Live();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
Live.ɵprov = {
  token: "Live_00e51de5",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "Live_00e51de5",
  Live.ɵfac
]);
ARIA_LIVE_DELAY.ɵprov = {
  token: "ARIA_LIVE_DELAY_afbc1606",
  providedIn: "root",
  factory: [
    function() {
      return /* @__PURE__ */ (() => 100)();
    }
  ]
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "ARIA_LIVE_DELAY_afbc1606",
  ARIA_LIVE_DELAY.ɵprov.factory
]);
var Key = /* @__PURE__ */ (function(Key2) {
  Key2[Key2["Tab"] = 9] = "Tab";
  Key2[Key2["Enter"] = 13] = "Enter";
  Key2[Key2["Escape"] = 27] = "Escape";
  Key2[Key2["Space"] = 32] = "Space";
  Key2[Key2["PageUp"] = 33] = "PageUp";
  Key2[Key2["PageDown"] = 34] = "PageDown";
  Key2[Key2["End"] = 35] = "End";
  Key2[Key2["Home"] = 36] = "Home";
  Key2[Key2["ArrowLeft"] = 37] = "ArrowLeft";
  Key2[Key2["ArrowUp"] = 38] = "ArrowUp";
  Key2[Key2["ArrowRight"] = 39] = "ArrowRight";
  Key2[Key2["ArrowDown"] = 40] = "ArrowDown";
  return Key2;
})({});
var isContainedIn = (element, array) => array ? array.some((item) => item?.contains(element)) : false;
var matchesSelectorIfAny = (element, selector) => !selector || closest(element, selector) != null;
var isMobile = (() => {
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
  const isAndroid = () => /Android/.test(navigator.userAgent);
  return typeof navigator !== "undefined" ? !!navigator.userAgent && (isIOS() || isAndroid()) : false;
})();
var wrapAsyncForMobile = (fn2) => isMobile ? () => setTimeout(() => fn2(), 100) : fn2;
var SOURCE = /* @__PURE__ */ (function(SOURCE2) {
  SOURCE2[SOURCE2["ESCAPE"] = 0] = "ESCAPE";
  SOURCE2[SOURCE2["CLICK"] = 1] = "CLICK";
  return SOURCE2;
})({});
function ngbAutoClose(zone, document2, type, close, closed$, insideElements, ignoreElements2, insideSelector) {
  if (type) {
    zone.runOutsideAngular(wrapAsyncForMobile(() => {
      const shouldCloseOnClick = (event) => {
        const element = event.target;
        if (event.button === 2 || isContainedIn(element, ignoreElements2)) {
          return false;
        }
        if (type === "inside") {
          return isContainedIn(element, insideElements) && matchesSelectorIfAny(element, insideSelector);
        } else if (type === "outside") {
          return !isContainedIn(element, insideElements);
        } else {
          return matchesSelectorIfAny(element, insideSelector) || !isContainedIn(element, insideElements);
        }
      };
      const escapes$ = fromEvent(document2, "keydown").pipe(takeUntil2(closed$), filter((event) => event.which === Key.Escape), tap((event) => event.preventDefault()));
      const mouseDowns$ = fromEvent(document2, "mousedown").pipe(map2(shouldCloseOnClick), takeUntil2(closed$));
      const closeableClicks$ = fromEvent(document2, "mouseup").pipe(withLatestFrom(mouseDowns$), filter(([, shouldClose]) => shouldClose), delay(0), takeUntil2(closed$));
      race([
        escapes$.pipe(map2(() => 0)),
        closeableClicks$.pipe(map2(() => 1))
      ]).subscribe((source) => zone.run(() => close(source)));
    }));
  }
}
var FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");
function getFocusableBoundaryElements(element) {
  const list = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR)).filter((el) => el.tabIndex !== -1);
  return [
    list[0],
    list[list.length - 1]
  ];
}
var ngbFocusTrap = (zone, element, stopFocusTrap$, refocusOnClick = false) => {
  zone.runOutsideAngular(() => {
    const lastFocusedElement$ = fromEvent(element, "focusin").pipe(takeUntil2(stopFocusTrap$), map2((event) => event.target));
    fromEvent(element, "keydown").pipe(takeUntil2(stopFocusTrap$), filter((event) => event.which === Key.Tab), withLatestFrom(lastFocusedElement$)).subscribe(([tabEvent, focusedElement]) => {
      const [first, last2] = getFocusableBoundaryElements(element);
      if ((focusedElement === first || focusedElement === element) && tabEvent.shiftKey) {
        last2.focus();
        tabEvent.preventDefault();
      }
      if (focusedElement === last2 && !tabEvent.shiftKey) {
        first.focus();
        tabEvent.preventDefault();
      }
    });
    if (refocusOnClick) {
      fromEvent(element, "click").pipe(takeUntil2(stopFocusTrap$), withLatestFrom(lastFocusedElement$), map2((array) => array[1])).subscribe((lastFocusedElement) => lastFocusedElement.focus());
    }
  });
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
function _async_to_generator(fn2) {
  return function() {
    var self = this, args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn2.apply(self, args);
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
var ContentRef = class {
  constructor(nodes, viewRef, componentRef) {
    this.nodes = nodes;
    this.viewRef = viewRef;
    this.componentRef = componentRef;
  }
};
var PopupService = class {
  constructor(_componentType) {
    this._componentType = _componentType;
    this._windowRef = null;
    this._contentRef = null;
    this._document = inject(DOCUMENT);
    this._applicationRef = inject(ApplicationRef);
    this._injector = inject(Injector);
    this._viewContainerRef = inject(ViewContainerRef);
    this._ngZone = inject(NgZone);
  }
  open(content, templateContext, animation = false) {
    return _async_to_generator(function* () {
      if (!this._windowRef) {
        this._contentRef = this._getContentRef(content, templateContext);
        this._windowRef = yield this._viewContainerRef.createComponent(this._componentType, {
          injector: this._injector,
          projectableNodes: this._contentRef.nodes
        });
      }
      const { nativeElement } = this._windowRef.location;
      const transition$ = this._ngZone.onStable.pipe(take(1), mergeMap(() => ngbRunTransition(this._ngZone, nativeElement, ({ classList }) => classList.add("show"), {
        animation,
        runningTransition: "continue"
      })));
      return {
        windowRef: this._windowRef,
        transition$
      };
    }).call(this);
  }
  close(animation = false) {
    if (!this._windowRef) {
      return of2(void 0);
    }
    return ngbRunTransition(this._ngZone, this._windowRef.location.nativeElement, ({ classList }) => classList.remove("show"), {
      animation,
      runningTransition: "stop"
    }).pipe(tap(() => {
      if (this._windowRef) {
        const viewIndex = this._viewContainerRef.indexOf(this._windowRef.hostView);
        if (viewIndex !== -1) {
          this._viewContainerRef.remove(viewIndex);
        } else {
          this._windowRef.destroy();
        }
        this._windowRef = null;
      }
      if (this._contentRef?.viewRef) {
        this._applicationRef.detachView(this._contentRef.viewRef);
        this._contentRef.viewRef.destroy();
        this._contentRef = null;
      }
    }));
  }
  _getContentRef(content, templateContext) {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(templateContext);
      this._applicationRef.attachView(viewRef);
      return new ContentRef([
        viewRef.rootNodes
      ], viewRef);
    } else {
      return new ContentRef([
        [
          this._document.createTextNode(`${content}`)
        ]
      ]);
    }
  }
};
var NgbRTL = class {
  isRTL() {
    return (this._element.getAttribute("dir") || "").toLowerCase() === "rtl";
  }
  constructor() {
    this._element = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbRTL"] ? globalThis.ɵngjsInjected["NgbRTL"][0] : inject(DOCUMENT)).documentElement;
  }
};
NgbRTL.ɵfac = [
  "DOCUMENT_a3a362b8",
  function NgbRTL_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbRTL": [
        i0
      ]
    };
    try {
      var instance = new NgbRTL();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbRTL.ɵprov = {
  token: "NgbRTL_5719b062",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbRTL_5719b062",
  NgbRTL.ɵfac
]);
var placementSeparator = /\s+/;
var spacesRegExp = /  +/gi;
var bootstrapPopperMatches = {
  top: [
    "top"
  ],
  bottom: [
    "bottom"
  ],
  start: [
    "left",
    "right"
  ],
  left: [
    "left"
  ],
  end: [
    "right",
    "left"
  ],
  right: [
    "right"
  ],
  "top-start": [
    "top-start",
    "top-end"
  ],
  "top-left": [
    "top-start"
  ],
  "top-end": [
    "top-end",
    "top-start"
  ],
  "top-right": [
    "top-end"
  ],
  "bottom-start": [
    "bottom-start",
    "bottom-end"
  ],
  "bottom-left": [
    "bottom-start"
  ],
  "bottom-end": [
    "bottom-end",
    "bottom-start"
  ],
  "bottom-right": [
    "bottom-end"
  ],
  "start-top": [
    "left-start",
    "right-start"
  ],
  "left-top": [
    "left-start"
  ],
  "start-bottom": [
    "left-end",
    "right-end"
  ],
  "left-bottom": [
    "left-end"
  ],
  "end-top": [
    "right-start",
    "left-start"
  ],
  "right-top": [
    "right-start"
  ],
  "end-bottom": [
    "right-end",
    "left-end"
  ],
  "right-bottom": [
    "right-end"
  ]
};
function getPopperClassPlacement(placement, isRTL) {
  const [leftClass, rightClass] = bootstrapPopperMatches[placement];
  return isRTL ? rightClass || leftClass : leftClass;
}
var popperStartPrimaryPlacement = /^left/;
var popperEndPrimaryPlacement = /^right/;
var popperStartSecondaryPlacement = /^start/;
var popperEndSecondaryPlacement = /^end/;
function getBootstrapBaseClassPlacement(baseClass, placement) {
  const [primary, secondary] = placement.split("-");
  const newPrimary = primary.replace(popperStartPrimaryPlacement, "start").replace(popperEndPrimaryPlacement, "end");
  let classnames = [
    newPrimary
  ];
  if (secondary) {
    let newSecondary = secondary;
    if (primary === "left" || primary === "right") {
      newSecondary = newSecondary.replace(popperStartSecondaryPlacement, "top").replace(popperEndSecondaryPlacement, "bottom");
    }
    classnames.push(`${newPrimary}-${newSecondary}`);
  }
  if (baseClass) {
    classnames = classnames.map((classname) => `${baseClass}-${classname}`);
  }
  return classnames.join(" ");
}
function getPopperOptions({ placement, baseClass }, rtl) {
  const placementVals = Array.isArray(placement) ? placement : placement.split(placementSeparator);
  const allowedPlacements = [
    "top",
    "bottom",
    "start",
    "end",
    "top-start",
    "top-end",
    "bottom-start",
    "bottom-end",
    "start-top",
    "start-bottom",
    "end-top",
    "end-bottom"
  ];
  let hasAuto = placementVals.findIndex((value) => value === "auto");
  if (hasAuto >= 0) {
    allowedPlacements.forEach((placementValue) => {
      if (placementVals.find((value) => value.search(`^${placementValue}`) !== -1) == null) {
        placementVals.splice(hasAuto++, 1, placementValue);
      }
    });
  }
  const popperPlacements = placementVals.map((placementValue) => getPopperClassPlacement(placementValue, rtl.isRTL()));
  const mainPlacement = popperPlacements.shift();
  const bsModifier = {
    name: "bootstrapClasses",
    enabled: !!baseClass,
    phase: "write",
    fn({ state }) {
      const bsClassRegExp = new RegExp(`${baseClass}(-[a-z]+)*`, "gi");
      const popperElement = state.elements.popper;
      const popperPlacement = state.placement;
      let className = popperElement.className;
      className = className.replace(bsClassRegExp, "");
      className += ` ${getBootstrapBaseClassPlacement(baseClass, popperPlacement)}`;
      className = className.trim().replace(spacesRegExp, " ");
      popperElement.className = className;
    }
  };
  return {
    placement: mainPlacement,
    modifiers: [
      bsModifier,
      flip_default,
      preventOverflow_default,
      arrow_default,
      {
        enabled: true,
        name: "flip",
        options: {
          fallbackPlacements: popperPlacements
        }
      },
      {
        enabled: true,
        name: "preventOverflow",
        phase: "main",
        fn: function() {
        }
      }
    ]
  };
}
function noop2(argument) {
  return argument;
}
function ngbPositioning() {
  const rtl = inject(NgbRTL);
  let popperInstance = null;
  return {
    createPopper(positioningOption) {
      if (!popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop2;
        const popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
        popperInstance = createPopper(positioningOption.hostElement, positioningOption.targetElement, popperOptions);
      }
    },
    update() {
      if (popperInstance) {
        popperInstance.update();
      }
    },
    setOptions(positioningOption) {
      if (popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop2;
        const popperOptions = updatePopperOptions(getPopperOptions(positioningOption, rtl));
        popperInstance.setOptions(popperOptions);
      }
    },
    destroy() {
      if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
      }
    }
  };
}
function addPopperOffset(offset2) {
  return (options) => {
    options.modifiers.push(offset_default, {
      name: "offset",
      options: {
        offset: () => offset2
      }
    });
    return options;
  };
}
function measureCollapsingElementDimensionPx(element, dimension) {
  if (typeof navigator === "undefined") {
    return "0px";
  }
  const { classList, style } = element;
  const hasShowClass = classList.contains("show");
  if (!hasShowClass) {
    classList.add("show");
  }
  style[dimension] = "";
  const dimensionSize = `${element.getBoundingClientRect()[dimension]}px`;
  if (!hasShowClass) {
    classList.remove("show");
  }
  return dimensionSize;
}
var ngbCollapsingTransition = (element, animation, context2) => {
  let { direction, maxSize, dimension } = context2;
  const { classList } = element;
  const setInitialClasses = () => {
    classList.add("collapse");
    if (direction === "show") {
      classList.add("show");
      return;
    }
    classList.remove("show");
  };
  if (!animation) {
    setInitialClasses();
    return;
  }
  if (!context2.maxSize) {
    maxSize = measureCollapsingElementDimensionPx(element, dimension);
    context2.maxSize = maxSize;
    element.style[dimension] = direction !== "show" ? maxSize : "0px";
    classList.remove("collapse", "collapsing", "show");
    reflow(element);
    classList.add("collapsing");
  }
  element.style[dimension] = direction === "show" ? maxSize : "0px";
  return () => {
    setInitialClasses();
    classList.remove("collapsing");
    element.style[dimension] = "";
  };
};
var ALIASES = {
  hover: [
    "mouseenter",
    "mouseleave"
  ],
  focus: [
    "focusin",
    "focusout"
  ]
};
function parseTriggers(triggers) {
  const trimmedTriggers = (triggers || "").trim();
  if (trimmedTriggers.length === 0) {
    return [];
  }
  const parsedTriggers = trimmedTriggers.split(/\s+/).map((trigger) => trigger.split(":")).map((triggerPair) => ALIASES[triggerPair[0]] || triggerPair);
  const manualTriggers = parsedTriggers.filter((triggerPair) => triggerPair.includes("manual"));
  if (manualTriggers.length > 1) {
    throw `Triggers parse error: only one manual trigger is allowed`;
  }
  if (manualTriggers.length === 1 && parsedTriggers.length > 1) {
    throw `Triggers parse error: manual trigger can't be mixed with other triggers`;
  }
  return manualTriggers.length ? [] : parsedTriggers;
}
function listenToTriggers(element, triggers, isOpenedFn, openFn, closeFn, openDelayMs = 0, closeDelayMs = 0, enterContent = EMPTY2, leaveContent = EMPTY2) {
  const parsedTriggers = parseTriggers(triggers);
  if (parsedTriggers.length === 0) {
    return () => {
    };
  }
  const activeOpenTriggers = /* @__PURE__ */ new Set();
  const cleanupFns = [];
  let timeout;
  function addEventListener(name, listener) {
    element.addEventListener(name, listener);
    cleanupFns.push(() => element.removeEventListener(name, listener));
  }
  function withDelay(fn2, delayMs) {
    clearTimeout(timeout);
    if (delayMs > 0) {
      timeout = setTimeout(fn2, delayMs);
    } else {
      fn2();
    }
  }
  for (const [openTrigger, closeTrigger] of parsedTriggers) {
    if (!closeTrigger) {
      addEventListener(openTrigger, () => isOpenedFn() ? withDelay(closeFn, closeDelayMs) : withDelay(openFn, openDelayMs));
    } else {
      addEventListener(openTrigger, () => {
        activeOpenTriggers.add(openTrigger);
        withDelay(() => activeOpenTriggers.size > 0 && openFn(), openDelayMs);
      });
      addEventListener(closeTrigger, () => {
        activeOpenTriggers.delete(openTrigger);
        withDelay(() => activeOpenTriggers.size === 0 && closeFn(), closeDelayMs);
      });
    }
    if (openTrigger === "mouseenter" && closeTrigger === "mouseleave" && closeDelayMs > 0) {
      const enterContentSub = enterContent.subscribe(() => {
        activeOpenTriggers.delete(openTrigger);
        clearTimeout(timeout);
      });
      const leaveContentSub = leaveContent.subscribe(() => {
        activeOpenTriggers.delete(openTrigger);
        withDelay(() => activeOpenTriggers.size === 0 && closeFn(), closeDelayMs);
      });
      cleanupFns.push(() => enterContentSub.unsubscribe(), () => leaveContentSub.unsubscribe());
    }
  }
  cleanupFns.push(() => clearTimeout(timeout));
  return () => cleanupFns.forEach((cleanupFn) => cleanupFn());
}
var ScrollBar = class {
  hide() {
    const scrollbarWidth = Math.abs(window.innerWidth - this._document.documentElement.clientWidth);
    const body = this._document.body;
    const bodyStyle = body.style;
    const { overflow, paddingRight } = bodyStyle;
    if (scrollbarWidth > 0) {
      const actualPadding = parseFloat(window.getComputedStyle(body).paddingRight);
      bodyStyle.paddingRight = `${actualPadding + scrollbarWidth}px`;
    }
    bodyStyle.overflow = "hidden";
    return () => {
      if (scrollbarWidth > 0) {
        bodyStyle.paddingRight = paddingRight;
      }
      bodyStyle.overflow = overflow;
    };
  }
  constructor() {
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["ScrollBar"] ? globalThis.ɵngjsInjected["ScrollBar"][0] : inject(DOCUMENT);
  }
};
ScrollBar.ɵfac = [
  "DOCUMENT_a3a362b8",
  function ScrollBar_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "ScrollBar": [
        i0
      ]
    };
    try {
      var instance = new ScrollBar();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
ScrollBar.ɵprov = {
  token: "ScrollBar_ab27c796",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "ScrollBar_ab27c796",
  ScrollBar.ɵfac
]);

// ../ngjs-core/dist/rxjs-interop/index.js
function takeUntilDestroyed(destroyRef) {
  const ref = destroyRef ?? inject(DestroyRef);
  const destroyed$ = new Subject();
  let alreadyDestroyed = false;
  ref.onDestroy(() => {
    alreadyDestroyed = true;
    destroyed$.next();
    destroyed$.complete();
  });
  return (source) => alreadyDestroyed ? EMPTY : source.pipe(takeUntil(destroyed$));
}

export {
  ChangeDetectorRef,
  TemplateRef,
  createComponent,
  ViewContainerRef,
  ApplicationRef,
  DestroyRef,
  bootstrapApplication,
  PLATFORM_ID,
  NgZone,
  isPlatformBrowser,
  HttpParams,
  inject,
  Subject2 as Subject,
  BehaviorSubject,
  of2 as of,
  map2 as map,
  combineLatest,
  fromEvent,
  timer,
  merge2 as merge,
  NEVER,
  filter,
  zip,
  defaultIfEmpty,
  take,
  distinctUntilChanged,
  finalize,
  skip,
  startWith,
  switchMap,
  takeUntil2 as takeUntil,
  tap,
  toInteger,
  toString,
  getValueInRange,
  isString,
  isNumber,
  isInteger,
  isDefined,
  isPromise2 as isPromise,
  padNumber,
  regExpEscape,
  reflow,
  removeAccents,
  getActiveElement,
  ngbRunTransition,
  ngbCompleteTransition,
  Live,
  Key,
  SOURCE,
  ngbAutoClose,
  FOCUSABLE_ELEMENTS_SELECTOR,
  getFocusableBoundaryElements,
  ngbFocusTrap,
  ContentRef,
  PopupService,
  ngbPositioning,
  addPopperOffset,
  ngbCollapsingTransition,
  listenToTriggers,
  ScrollBar,
  takeUntilDestroyed
};
