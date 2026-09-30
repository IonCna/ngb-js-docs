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
  NgbConfig
} from "./chunk-CWWWR73V.js";
import {
  ApplicationRef,
  ChangeDetectorRef,
  ContentRef,
  Key,
  NgZone,
  ScrollBar,
  Subject,
  TemplateRef,
  createComponent,
  filter,
  fromEvent,
  getFocusableBoundaryElements,
  inject,
  isDefined,
  isPromise,
  isString,
  ngbFocusTrap,
  ngbRunTransition,
  of,
  reflow,
  switchMap,
  take,
  takeUntil,
  tap,
  zip
} from "./chunk-26Q6D6UX.js";
import {
  CommonModule,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  Injector,
  require_angular
} from "./chunk-JHSL2Y2Z.js";
import {
  __toESM
} from "./chunk-EXPZ26GU.js";

// ../ngb-js/dist/chunk-SZYGA3VW.js
var import_angular = __toESM(require_angular(), 1);
var import_angular2 = __toESM(require_angular(), 1);
var import_angular3 = __toESM(require_angular(), 1);
var ModalDismissReasons = /* @__PURE__ */ (function(ModalDismissReasons2) {
  ModalDismissReasons2[ModalDismissReasons2["BACKDROP_CLICK"] = 0] = "BACKDROP_CLICK";
  ModalDismissReasons2[ModalDismissReasons2["ESC"] = 1] = "ESC";
  return ModalDismissReasons2;
})({});
var NgbModalConfig = class {
  get animation() {
    return this._animation ?? this._ngbConfig.animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
  constructor() {
    this._ngbConfig = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalConfig"] ? globalThis.ɵngjsInjected["NgbModalConfig"][0] : inject(NgbConfig);
    this.backdrop = true;
    this.fullscreen = false;
    this.keyboard = true;
  }
};
NgbModalConfig.ɵfac = [
  "NgbConfig_c7257787",
  function NgbModalConfig_Factory(i0) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbModalConfig": [
        i0
      ]
    };
    try {
      var instance = new NgbModalConfig();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbModalConfig.ɵprov = {
  token: "NgbModalConfig_d566cf81",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbModalConfig_d566cf81",
  NgbModalConfig.ɵfac
]);
var NgbActiveModal = class {
  update(_options) {
  }
  close(_result) {
  }
  dismiss(_reason) {
  }
};
var NgbModalRef = class {
  update(options) {
    this._windowCmptRef.instance.updateOptions(options);
    if (this._backdropCmptRef?.instance) {
      this._backdropCmptRef.instance.updateOptions(options);
    }
  }
  get componentInstance() {
    return this._contentRef?.componentRef?.instance;
  }
  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }
  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }
  get hidden() {
    return this._hidden.asObservable();
  }
  get shown() {
    return this._windowCmptRef.instance.shown.asObservable();
  }
  constructor(_windowCmptRef, _contentRef, _backdropCmptRef, _beforeDismiss) {
    this._windowCmptRef = _windowCmptRef;
    this._contentRef = _contentRef;
    this._backdropCmptRef = _backdropCmptRef;
    this._beforeDismiss = _beforeDismiss;
    this._closed = new Subject();
    this._dismissed = new Subject();
    this._hidden = new Subject();
    _windowCmptRef.instance.dismissEvent.subscribe((reason) => this.dismiss(reason));
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {
    });
  }
  close(result) {
    if (this._windowCmptRef) {
      this._closed.next(result);
      this._resolve(result);
      this._removeModalElements();
    }
  }
  _dismiss(reason) {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeModalElements();
  }
  dismiss(reason) {
    if (!this._windowCmptRef) return;
    if (!this._beforeDismiss) {
      this._dismiss(reason);
      return;
    }
    const dismiss = this._beforeDismiss();
    if (isPromise(dismiss)) {
      dismiss.then((result) => {
        if (result !== false) this._dismiss(reason);
      }, () => {
      });
    } else if (dismiss !== false) {
      this._dismiss(reason);
    }
  }
  _removeModalElements() {
    const windowTransition$ = this._windowCmptRef.instance.hide();
    const backdropTransition$ = this._backdropCmptRef ? this._backdropCmptRef.instance.hide() : of(void 0);
    windowTransition$.subscribe(() => {
      import_angular.default.element(this._windowCmptRef.location.nativeElement).remove();
      this._windowCmptRef.destroy();
      this._contentRef?.componentRef?.destroy();
      this._contentRef?.viewRef?.destroy();
      this._windowCmptRef = null;
      this._contentRef = null;
    });
    backdropTransition$.subscribe(() => {
      if (this._backdropCmptRef) {
        import_angular.default.element(this._backdropCmptRef.location.nativeElement).remove();
        this._backdropCmptRef.destroy();
        this._backdropCmptRef = void 0;
      }
    });
    zip(windowTransition$, backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
};
var BACKDROP_ATTRIBUTES = [
  "animation",
  "backdropClass"
];
var NgbModalBackdrop = class {
  get _hostClass() {
    return `modal-backdrop${this.backdropClass ? ` ${this.backdropClass}` : ""}`;
  }
  get _fade() {
    return this.animation;
  }
  ngOnInit() {
    this._zone.onStable.pipe(filter(() => this._nativeElement.isConnected), take(1)).subscribe(() => {
      ngbRunTransition(this._zone, this._nativeElement, (element, animation) => {
        if (animation) {
          reflow(element);
        }
        element.classList.add("show");
      }, {
        animation: this.animation,
        runningTransition: "continue"
      });
    });
  }
  hide() {
    return ngbRunTransition(this._zone, this._nativeElement, ({ classList }) => classList.remove("show"), {
      animation: this.animation,
      runningTransition: "stop"
    });
  }
  updateOptions(options) {
    for (const optionName of BACKDROP_ATTRIBUTES) {
      if (isDefined(options[optionName])) {
        this[optionName] = options[optionName];
      }
    }
    this._cdRef.markForCheck();
  }
  static get $name() {
    return "ngbModalBackdrop";
  }
  constructor() {
    this._nativeElement = (globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalBackdrop"] ? globalThis.ɵngjsInjected["NgbModalBackdrop"][0] : inject(ElementRef)).nativeElement;
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalBackdrop"] ? globalThis.ɵngjsInjected["NgbModalBackdrop"][1] : inject(NgZone);
    this._cdRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalBackdrop"] ? globalThis.ɵngjsInjected["NgbModalBackdrop"][2] : inject(ChangeDetectorRef);
    this._zIndex = 1055;
  }
};
NgbModalBackdrop.ɵfac = [
  "ElementRef_927308a2",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbModalBackdrop_Factory(i0, i1, i2, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbModalBackdrop": [
        i0,
        i1,
        i2
      ]
    };
    try {
      var instance = new NgbModalBackdrop();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
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
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._fade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._zIndex;
    }, function(v) {
      v == null ? $element.css("z-index", "") : $element.css("z-index", v + "");
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
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
      })(instance._hostClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fade);
      (function(v) {
        v == null ? $element.css("z-index", "") : $element.css("z-index", v + "");
      })(instance._zIndex);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
    });
    return instance;
  }
];
NgbModalBackdrop.ɵcmp = {
  selectors: [
    [
      "ngb-modal-backdrop"
    ]
  ],
  inputs: {
    "animation": "animation",
    "backdropClass": "backdropClass"
  },
  outputs: {},
  definition: {
    "template": "",
    "bindings": {
      "animation": "<?",
      "backdropClass": "@?"
    }
  }
};
NgbModalBackdrop.ɵfac.ɵcomponent = true;
NgbModalBackdrop.ɵfac.ɵtype = NgbModalBackdrop;
NgbModalBackdrop.prototype.$onInit = function() {
  this.ngOnInit();
};
var WINDOW_ATTRIBUTES = [
  "animation",
  "ariaLabelledBy",
  "ariaDescribedBy",
  "backdrop",
  "centered",
  "fullscreen",
  "keyboard",
  "scrollable",
  "size",
  "windowClass",
  "modalDialogClass"
];
var NgbModalWindow = class {
  get _hostClass() {
    return `modal d-block${this.windowClass ? ` ${this.windowClass}` : ""}`;
  }
  get _fade() {
    return this.animation;
  }
  get _ariaLabelledBy() {
    return this.ariaLabelledBy;
  }
  get _ariaDescribedBy() {
    return this.ariaDescribedBy;
  }
  get fullscreenClass() {
    return this.fullscreen === true ? " modal-fullscreen" : isString(this.fullscreen) ? ` modal-fullscreen-${this.fullscreen}-down` : "";
  }
  dismiss(reason) {
    this.dismissEvent.emit(reason);
  }
  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    this._zone.onStable.pipe(filter(() => this._elRef.nativeElement.isConnected), take(1)).subscribe(() => this._show());
  }
  ngOnDestroy() {
    this._disableEventHandling();
  }
  hide() {
    const { nativeElement } = this._elRef;
    const context = {
      animation: this.animation,
      runningTransition: "stop"
    };
    const windowTransition$ = ngbRunTransition(this._zone, nativeElement, () => nativeElement.classList.remove("show"), context);
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {
    }, context);
    const transitions$ = zip(windowTransition$, dialogTransition$);
    transitions$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });
    this._disableEventHandling();
    this._restoreFocus();
    return transitions$;
  }
  updateOptions(options) {
    for (const optionName of WINDOW_ATTRIBUTES) {
      if (isDefined(options[optionName])) {
        this[optionName] = options[optionName];
      }
    }
    this._cdRef.markForCheck();
  }
  _show() {
    const context = {
      animation: this.animation,
      runningTransition: "continue"
    };
    const windowTransition$ = ngbRunTransition(this._zone, this._elRef.nativeElement, (element, animation) => {
      if (animation) {
        reflow(element);
      }
      element.classList.add("show");
    }, context);
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {
    }, context);
    zip(windowTransition$, dialogTransition$).subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });
    this._enableEventHandling();
    this._setFocus();
  }
  _enableEventHandling() {
    const { nativeElement } = this._elRef;
    this._zone.runOutsideAngular(() => {
      fromEvent(nativeElement, "keydown").pipe(takeUntil(this._closed$), filter((e) => e.which === Key.Escape)).subscribe((event) => {
        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this._zone.run(() => this.dismiss(ModalDismissReasons.ESC));
            }
          });
        } else if (this.backdrop === "static") {
          this._bumpBackdrop();
        }
      });
      let preventClose = false;
      fromEvent(this._dialogEl.nativeElement, "mousedown").pipe(takeUntil(this._closed$), tap(() => preventClose = false), switchMap(() => fromEvent(nativeElement, "mouseup").pipe(takeUntil(this._closed$), take(1))), filter(({ target }) => nativeElement === target)).subscribe(() => {
        preventClose = true;
      });
      fromEvent(nativeElement, "click").pipe(takeUntil(this._closed$)).subscribe(({ target }) => {
        if (nativeElement === target) {
          if (this.backdrop === "static") {
            this._bumpBackdrop();
          } else if (this.backdrop === true && !preventClose) {
            this._zone.run(() => this.dismiss(ModalDismissReasons.BACKDROP_CLICK));
          }
        }
        preventClose = false;
      });
    });
  }
  _disableEventHandling() {
    this._closed$.next();
  }
  _setFocus() {
    const { nativeElement } = this._elRef;
    if (!nativeElement.contains(document.activeElement)) {
      const autoFocusable = nativeElement.querySelector("[ngbAutofocus]");
      const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];
      const elementToFocus = autoFocusable || firstFocusable || nativeElement;
      elementToFocus.focus();
    }
  }
  _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;
    let elementToFocus;
    if (elWithFocus instanceof HTMLElement && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    this._zone.runOutsideAngular(() => {
      setTimeout(() => elementToFocus.focus());
      this._elWithFocus = null;
    });
  }
  _bumpBackdrop() {
    if (this.backdrop === "static") {
      ngbRunTransition(this._zone, this._elRef.nativeElement, ({ classList }) => {
        classList.add("modal-static");
        return () => classList.remove("modal-static");
      }, {
        animation: this.animation,
        runningTransition: "continue"
      });
    }
  }
  static get $name() {
    return "ngbModalWindow";
  }
  constructor() {
    this._document = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalWindow"] ? globalThis.ɵngjsInjected["NgbModalWindow"][0] : inject(DOCUMENT);
    this._elRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalWindow"] ? globalThis.ɵngjsInjected["NgbModalWindow"][1] : inject(ElementRef);
    this._zone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalWindow"] ? globalThis.ɵngjsInjected["NgbModalWindow"][2] : inject(NgZone);
    this._cdRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalWindow"] ? globalThis.ɵngjsInjected["NgbModalWindow"][3] : inject(ChangeDetectorRef);
    this._closed$ = new Subject();
    this._elWithFocus = null;
    this.backdrop = true;
    this.keyboard = true;
    this.dismissEvent = new EventEmitter();
    this.shown = new Subject();
    this.hidden = new Subject();
    this._tabindex = -1;
    this._ariaModal = true;
    this._role = "dialog";
  }
};
NgbModalWindow.ɵfac = [
  "DOCUMENT_a3a362b8",
  "ElementRef_927308a2",
  "NgZone_31031859",
  "ChangeDetectorRef_e2bfcbab",
  "$element",
  "$scope",
  function NgbModalWindow_Factory(i0, i1, i2, i3, $element, $scope) {
    $element.data("$ngjsHost", $element[0]);
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbModalWindow": [
        i0,
        i1,
        i2,
        i3
      ]
    };
    try {
      var instance = new NgbModalWindow();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    var ɵunwatch0 = $scope.$watch(function() {
      return instance._hostClass;
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
    var ɵunwatch1 = $scope.$watch(function() {
      return instance._fade;
    }, function(v) {
      v ? $element.addClass("fade") : $element.removeClass("fade");
    });
    var ɵunwatch2 = $scope.$watch(function() {
      return instance._tabindex;
    }, function(v) {
      v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
    });
    var ɵunwatch3 = $scope.$watch(function() {
      return instance._ariaModal;
    }, function(v) {
      v == null ? $element.removeAttr("aria-modal") : $element.attr("aria-modal", String(v));
    });
    var ɵunwatch4 = $scope.$watch(function() {
      return instance._ariaLabelledBy;
    }, function(v) {
      v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
    });
    var ɵunwatch5 = $scope.$watch(function() {
      return instance._ariaDescribedBy;
    }, function(v) {
      v == null ? $element.removeAttr("aria-describedby") : $element.attr("aria-describedby", String(v));
    });
    var ɵunwatch6 = $scope.$watch(function() {
      return instance._role;
    }, function(v) {
      v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
    });
    var ɵhostOnInit = instance.$onInit;
    instance.$onInit = function() {
      var ɵresult = ɵhostOnInit ? ɵhostOnInit.apply(this, arguments) : void 0;
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
      })(instance._hostClass);
      (function(v) {
        v ? $element.addClass("fade") : $element.removeClass("fade");
      })(instance._fade);
      (function(v) {
        v == null ? $element.removeAttr("tabindex") : $element.attr("tabindex", String(v));
      })(instance._tabindex);
      (function(v) {
        v == null ? $element.removeAttr("aria-modal") : $element.attr("aria-modal", String(v));
      })(instance._ariaModal);
      (function(v) {
        v == null ? $element.removeAttr("aria-labelledby") : $element.attr("aria-labelledby", String(v));
      })(instance._ariaLabelledBy);
      (function(v) {
        v == null ? $element.removeAttr("aria-describedby") : $element.attr("aria-describedby", String(v));
      })(instance._ariaDescribedBy);
      (function(v) {
        v == null ? $element.removeAttr("role") : $element.attr("role", String(v));
      })(instance._role);
      return ɵresult;
    };
    $scope.$on("$destroy", function() {
      ɵunwatch0();
      ɵunwatch1();
      ɵunwatch2();
      ɵunwatch3();
      ɵunwatch4();
      ɵunwatch5();
      ɵunwatch6();
    });
    return instance;
  }
];
NgbModalWindow.ɵcmp = {
  selectors: [
    [
      "ngb-modal-window"
    ]
  ],
  inputs: {
    "animation": "animation",
    "ariaLabelledBy": "ariaLabelledBy",
    "ariaDescribedBy": "ariaDescribedBy",
    "backdrop": "backdrop",
    "centered": "centered",
    "fullscreen": "fullscreen",
    "keyboard": "keyboard",
    "scrollable": "scrollable",
    "size": "size",
    "windowClass": "windowClass",
    "modalDialogClass": "modalDialogClass"
  },
  outputs: {
    "dismiss": "dismissEvent"
  },
  viewQueries: [
    {
      propertyName: "_dialogEl",
      first: true,
      descendants: true,
      static: true,
      predicate: [
        "dialog"
      ],
      get read() {
        return ElementRef;
      }
    }
  ],
  definition: {
    "template": `<div
  ng-ref="dialog"
  ng-class="
    'modal-dialog' +
    ($.size ? ' modal-' + $.size : '') +
    ($.centered ? ' modal-dialog-centered' : '') +
    $.fullscreenClass +
    ($.scrollable ? ' modal-dialog-scrollable' : '') +
    ($.modalDialogClass ? ' ' + $.modalDialogClass : '')
  "
  role="document"
>
  <div class="modal-content"><ng-content></ng-content></div>
</div>`,
    "bindings": {
      "animation": "<?",
      "ariaLabelledBy": "@?",
      "ariaDescribedBy": "@?",
      "backdrop": "<?",
      "centered": "@?",
      "fullscreen": "<?",
      "keyboard": "<?",
      "scrollable": "@?",
      "size": "@?",
      "windowClass": "@?",
      "modalDialogClass": "@?",
      "dismissEvent": "&?dismiss"
    },
    "transclude": true
  }
};
NgbModalWindow.ɵfac.ɵcomponent = true;
NgbModalWindow.ɵfac.ɵtype = NgbModalWindow;
NgbModalWindow.prototype.$onInit = function() {
  this.ngOnInit();
};
NgbModalWindow.prototype.$onDestroy = function() {
  this.ngOnDestroy();
};
var NgbModalStack = class {
  constructor() {
    this._applicationRef = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalStack"] ? globalThis.ɵngjsInjected["NgbModalStack"][0] : inject(ApplicationRef);
    this._scrollBar = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalStack"] ? globalThis.ɵngjsInjected["NgbModalStack"][1] : inject(ScrollBar);
    this._ngZone = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModalStack"] ? globalThis.ɵngjsInjected["NgbModalStack"][2] : inject(NgZone);
    this._activeWindowCmptHasChanged = new Subject();
    this._ariaHiddenValues = /* @__PURE__ */ new Map();
    this._scrollBarRestoreFn = null;
    this._modalRefs = [];
    this._windowCmpts = [];
    this._activeInstances = new EventEmitter();
    this._activeWindowCmptHasChanged.subscribe(() => {
      if (this._windowCmpts.length) {
        const activeWindowCmpt = this._windowCmpts[this._windowCmpts.length - 1];
        ngbFocusTrap(this._ngZone, activeWindowCmpt.location.nativeElement, this._activeWindowCmptHasChanged);
        this._revertAriaHidden();
        this._setAriaHidden(activeWindowCmpt.location.nativeElement);
      }
    });
  }
  open(_contentInjector, content, options) {
    const containerEl = this._resolveContainer(options.container);
    if (!containerEl) {
      throw new Error(`The specified modal container "${options.container || "body"}" was not found in the DOM.`);
    }
    this._hideScrollBar();
    const activeModal = new NgbActiveModal();
    return Promise.all([
      options.backdrop !== false ? this._attachBackdrop(containerEl, options) : Promise.resolve(void 0),
      this._getContentRef(content, activeModal, options)
    ]).then(([backdropCmptRef, contentRef]) => this._attachWindowComponent(containerEl, contentRef, options).then((windowCmptRef) => {
      const ngbModalRef = new NgbModalRef(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);
      this._registerModalRef(ngbModalRef);
      this._registerWindowCmpt(windowCmptRef);
      ngbModalRef.hidden.pipe(take(1)).subscribe(() => Promise.resolve(true).then(() => {
        if (!this._modalRefs.length) {
          document.body.classList.remove("modal-open");
          this._restoreScrollBar();
          this._revertAriaHidden();
        }
      }));
      activeModal.close = (result) => ngbModalRef.close(result);
      activeModal.dismiss = (reason) => ngbModalRef.dismiss(reason);
      activeModal.update = (opts) => ngbModalRef.update(opts);
      ngbModalRef.update(options);
      if (this._modalRefs.length === 1) {
        document.body.classList.add("modal-open");
      }
      backdropCmptRef?.instance && backdropCmptRef.changeDetectorRef.detectChanges();
      windowCmptRef.changeDetectorRef.detectChanges();
      return ngbModalRef;
    }));
  }
  get activeInstances() {
    return this._activeInstances;
  }
  dismissAll(reason) {
    this._modalRefs.forEach((ngbModalRef) => ngbModalRef.dismiss(reason));
  }
  hasOpenModals() {
    return this._modalRefs.length > 0;
  }
  _attachBackdrop(containerEl, options) {
    return this._createRootComponent(NgbModalBackdrop.$name, {
      bindings: {
        animation: options.animation,
        backdropClass: options.backdropClass
      }
    }).then((ref) => {
      containerEl.appendChild(ref.location.nativeElement);
      return ref;
    });
  }
  _attachWindowComponent(containerEl, contentRef, options) {
    return this._createRootComponent(NgbModalWindow.$name, {
      projectableNodes: contentRef.nodes,
      bindings: {
        animation: options.animation
      }
    }).then((ref) => {
      containerEl.appendChild(ref.location.nativeElement);
      return ref;
    });
  }
  _getContentRef(content, activeModal, options) {
    if (!content) {
      return Promise.resolve(new ContentRef([]));
    }
    if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView({
        $implicit: activeModal,
        close: (result) => activeModal.close(result),
        dismiss: (reason) => activeModal.dismiss(reason)
      });
      this._applicationRef.attachView(viewRef);
      return Promise.resolve(new ContentRef([
        viewRef.rootNodes
      ], viewRef));
    }
    return this._createRootComponent(content, {
      bindings: {
        ...options.bindings,
        ngbActiveModal: activeModal
      }
    }).then((componentRef) => {
      if (options.scrollable || options.fullscreen) {
        import_angular2.default.element(componentRef.location.nativeElement).addClass("component-host-scrollable d-flex flex-column flex-grow-1 overflow-hidden");
      }
      return new ContentRef([
        [
          componentRef.location.nativeElement
        ]
      ], void 0, componentRef);
    });
  }
  _createRootComponent(component, options) {
    return Promise.resolve(createComponent(component, {
      environmentInjector: this._applicationRef.injector,
      ...options
    })).then((componentRef) => {
      try {
        this._applicationRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.markForCheck();
      } catch (error) {
        componentRef.destroy();
        throw error;
      }
      componentRef.onDestroy(() => this._applicationRef.detachView(componentRef.hostView));
      return componentRef;
    });
  }
  _resolveContainer(container) {
    if (container instanceof HTMLElement) return container;
    if (typeof container === "string") return document.querySelector(container) ?? void 0;
    return document.body;
  }
  _setAriaHidden(element) {
    const parent = element.parentElement;
    if (parent && element !== document.body) {
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== element && sibling.nodeName !== "SCRIPT") {
          this._ariaHiddenValues.set(sibling, sibling.getAttribute("aria-hidden"));
          sibling.setAttribute("aria-hidden", "true");
        }
      });
      this._setAriaHidden(parent);
    }
  }
  _revertAriaHidden() {
    this._ariaHiddenValues.forEach((value, element) => {
      if (value) element.setAttribute("aria-hidden", value);
      else element.removeAttribute("aria-hidden");
    });
    this._ariaHiddenValues.clear();
  }
  _registerModalRef(ngbModalRef) {
    const unregisterModalRef = () => {
      const index = this._modalRefs.indexOf(ngbModalRef);
      if (index > -1) {
        this._modalRefs.splice(index, 1);
        this._activeInstances.emit(this._modalRefs);
      }
    };
    this._modalRefs.push(ngbModalRef);
    this._activeInstances.emit(this._modalRefs);
    ngbModalRef.result?.then(unregisterModalRef, unregisterModalRef);
  }
  _registerWindowCmpt(ngbWindowCmpt) {
    this._windowCmpts.push(ngbWindowCmpt);
    this._activeWindowCmptHasChanged.next();
    ngbWindowCmpt.onDestroy(() => {
      const index = this._windowCmpts.indexOf(ngbWindowCmpt);
      if (index > -1) {
        this._windowCmpts.splice(index, 1);
        this._activeWindowCmptHasChanged.next();
      }
    });
  }
  _restoreScrollBar() {
    const scrollBarRestoreFn = this._scrollBarRestoreFn;
    if (scrollBarRestoreFn) {
      this._scrollBarRestoreFn = null;
      scrollBarRestoreFn();
    }
  }
  _hideScrollBar() {
    if (!this._scrollBarRestoreFn) {
      this._scrollBarRestoreFn = this._scrollBar.hide();
    }
  }
  static get $name() {
    return "ngb.modal.stack.service";
  }
};
NgbModalStack.ɵfac = [
  "ApplicationRef_584e852c",
  "ScrollBar_ab27c796",
  "NgZone_31031859",
  function NgbModalStack_Factory(i0, i1, i2) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbModalStack": [
        i0,
        i1,
        i2
      ]
    };
    try {
      var instance = new NgbModalStack();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbModalStack.ɵprov = {
  token: "NgbModalStack_aa7e770e",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbModalStack_aa7e770e",
  NgbModalStack.ɵfac
]);
var NgbModal = class {
  /**
  * Abre un modal con el contenido y las opciones dadas.
  *
  * El contenido puede ser un `TemplateRef` o un tipo de componente. Si pasás un
  * componente, sus instancias pueden inyectar `NgbActiveModal` para
  * cerrar/descartar el modal desde adentro.
  *
  * ADAPTACIÓN: `createComponent` de `ngjs-core` es async, así que `open()`
  * devuelve una `Promise<NgbModalRef>` (upstream es sync). Ver CORE_GAPS.
  */
  open(content, options = {}) {
    const combinedOptions = {
      ...this._config,
      animation: this._config.animation,
      ...options
    };
    return this._modalStack.open(this._injector, content, combinedOptions);
  }
  /** Observable con las instancias de modales activas. */
  get activeInstances() {
    return this._modalStack.activeInstances;
  }
  /**
  * Descarta todos los modales abiertos con la razón dada.
  *
  * @since 3.1.0
  */
  dismissAll(reason) {
    this._modalStack.dismissAll(reason);
  }
  /**
  * `true` si hay algún modal abierto en la app.
  *
  * @since 3.3.0
  */
  hasOpenModals() {
    return this._modalStack.hasOpenModals();
  }
  constructor() {
    this._injector = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModal"] ? globalThis.ɵngjsInjected["NgbModal"][0] : inject(Injector);
    this._modalStack = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModal"] ? globalThis.ɵngjsInjected["NgbModal"][1] : inject(NgbModalStack);
    this._config = globalThis.ɵngjsInjected && globalThis.ɵngjsInjected["NgbModal"] ? globalThis.ɵngjsInjected["NgbModal"][2] : inject(NgbModalConfig);
  }
};
NgbModal.ɵfac = [
  "Injector_125f3b76",
  "NgbModalStack_aa7e770e",
  "NgbModalConfig_d566cf81",
  function NgbModal_Factory(i0, i1, i2) {
    var ɵprevious = globalThis.ɵngjsInjected;
    globalThis.ɵngjsInjected = {
      "NgbModal": [
        i0,
        i1,
        i2
      ]
    };
    try {
      var instance = new NgbModal();
    } finally {
      globalThis.ɵngjsInjected = ɵprevious;
    }
    return instance;
  }
];
NgbModal.ɵprov = {
  token: "NgbModal_da91379e",
  providedIn: "root"
};
(globalThis.ɵngjsRootProviders = globalThis.ɵngjsRootProviders || []).push([
  "NgbModal_da91379e",
  NgbModal.ɵfac
]);
var NgbModalModule = class {
};
NgbModalModule.ɵfac = [
  function NgbModalModule_Factory() {
    return new NgbModalModule();
  }
];
NgbModalModule.ɵmod = {
  id: "NgbModalModule_67cdc7e1",
  controllerAs: "$"
};
import_angular3.default.module("NgbModalModule_67cdc7e1", [
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
]).component("ngbModalWindow", {
  controller: NgbModalWindow.ɵfac,
  template: `<div
  ng-ref="dialog"
  ng-class="
    'modal-dialog' +
    ($.size ? ' modal-' + $.size : '') +
    ($.centered ? ' modal-dialog-centered' : '') +
    $.fullscreenClass +
    ($.scrollable ? ' modal-dialog-scrollable' : '') +
    ($.modalDialogClass ? ' ' + $.modalDialogClass : '')
  "
  role="document"
>
  <div class="modal-content"><ng-content></ng-content></div>
</div>`,
  controllerAs: "$",
  bindings: {
    "animation": "<?",
    "ariaLabelledBy": "@?",
    "ariaDescribedBy": "@?",
    "backdrop": "<?",
    "centered": "@?",
    "fullscreen": "<?",
    "keyboard": "<?",
    "scrollable": "@?",
    "size": "@?",
    "windowClass": "@?",
    "modalDialogClass": "@?",
    "dismissEvent": "&?dismiss"
  },
  transclude: true
}).directive("ngbModalWindow", function() {
  return {
    restrict: "E",
    link: {
      pre: function(scope, element) {
        [
          "dismiss"
        ].forEach(function(name) {
          element[0].removeAttribute(name);
        });
      }
    }
  };
}).component("ngbModalBackdrop", {
  controller: NgbModalBackdrop.ɵfac,
  template: "",
  controllerAs: "$",
  bindings: {
    "animation": "<?",
    "backdropClass": "@?"
  }
}).factory("NgbModalModule_ae63b286", NgbModalModule.ɵfac).run([
  "NgbModalModule_ae63b286",
  function() {
  }
]);

export {
  NgbModalModule
};
