# Migración de `ngbjs-doc` a autoría con `ngjs-core` + `ngb-js`

> No es una migración en bloque. El runtime **es** AngularJS 1.8; `ngjs-core` es una
> capa de traducción. Un `@Component` nuevo y un `.component(X.$name, X.$factory)`
> viejo conviven en el mismo `angular.module`. Cada paso deja la app corriendo.

## 0. Estado actual (de dónde partimos)

| Zona | Cómo está hoy |
|---|---|
| Bootstrap | `index.html` con `ng-app="docs"` (auto-bootstrap síncrono, **fuera de la zona**); `main.ts` solo importa `@/app.module` |
| `AppModule` | `angular.module('docs', [router, CoreModule.name, NgJsCoreModule.name, NgbModule.name, …])` + `.component()` + `.config(routing)` |
| `CoreModule` | **ya híbrido**: `@NgModule` + `registerNgModule()` → `CoreModuleLegacy`, y una cola larga de `.provider()/.service()/.constant()/.config()/.run()` imperativos |
| `FeaturesModule` / `GuideModule` / `LibModule` / `SharedModule` | `angular.module(...)` + N líneas `Mod.component(X.$name, X.$factory)` |
| Componentes | clase con `static get $name`, `static get $factory(): IComponentOptions`, `static get $inject`. **Algunos ya usan `@ViewChild`** (decorador de campo) pero siguen con `$factory`/`$name` a mano |
| Servicios | clase con `static get $name` / `static get $inject`. `TitleService` **ya usa `@Injectable({ id, providedIn: 'root' })`** |
| Providers config-phase | `ThemeProvider`, `LanguageProvider`, `IndexingProvider`, `BootstrapUrlProvider`, `NgBootstrapUrlProvider` — `implements IServiceProvider` con `$get`, registrados con `.provider()` y consumidos en `.config()` |
| Routing | funciones `routing($stateProvider, …)` de `@uirouter/angularjs`, con estados nombrados, `abstract`, `data`, `redirectTo`, anidados |
| Templates | ya usan directivas `ngb-*` y primitivas `ng-template` / `ng-ref` / `ng-ref-read` / `ng-template-outlet` / `ng-container` de `ngjs-core`. `controllerAs` = `"$"` en core/layout, `"example"` en `features/lib` |
| `ngb-js` | integrado por `NgbModule.name` en `AppModule`; servicios (`NgbModal`, `NgbOffcanvas`) inyectados por `.$name` |

**Objetivo:** escribir con decoradores (`@Component`, `@Directive`, `@Injectable`,
`@NgModule`, `@Pipe`, `@Input/@Output/@Model`, `@HostBinding/@HostListener`,
`@ViewChild`, `@Attribute`, `inject()`) corriendo en el **modo runtime** de
`ngjs-core` (`registerNgModule` / `bootstrapApplication`), sin depender del
transform de decoradores de `ng-js-vite` (hoy stub; `templateUrl`/`styleUrl` los
sigue resolviendo el plugin por regex).

---

## Ruta de migración (orden recomendado)

Cada fase es autónoma y termina con `bun run dev` verde.

### Fase 0 — Preparar el toolchain (bloqueante, una vez)

1. **`tsconfig.json`**
   - `"emitDecoratorMetadata": true` — hoy no está. Sin esto, `@Injectable` +
     constructor tipado **no resuelve DI por tipo** (esbuild/Vite lee esta flag del
     tsconfig). `TitleService` ya depende de esto.
   - `"useDefineForClassFields": false` — con `target: es2023` el default es `true`,
     y eso hace que `@Input() x;` / `@HostBinding() y = false` emitan un initializer
     que pisa lo que setea el bridge. Angular pre-signals usa lo mismo.
2. **`src/main.ts`**: `import "reflect-metadata"` como **primera** línea (lo necesita
   el camino `@Injectable`/`@Inject` con `design:paramtypes`).
3. **Sanity check**: convertí **un** componente hoja a `@Component` (p.ej.
   `SimpleAlertComponent`) y verificá que renderiza. Si falla acá, es toolchain, no
   arquitectura.

### Fase 1 — Bootstrap dentro de la zona

Necesario para que RxJS / `Promise` / `$timeout` disparen `$digest` solos (sin
`$apply` a mano). Hoy `ng-app` bootstrapea antes de que exista la zona.

1. `index.html`: quitar `ng-app="docs"` del `<body>` (dejar `<ui-view>`).
2. `AppModule` pasa a `@NgModule` (ver Fase 2) **o**, transición mínima, dejar el
   `angular.module` y en `main.ts`:
   ```ts
   import "reflect-metadata"
   import { bootstrapApplication } from "ngjs-core"
   import { AppModule } from "@/app.module"   // sigue siendo la clase @NgModule
   bootstrapApplication(AppModule)
   ```
   `bootstrapApplication` hace `installCoreModule()` + `registerNgModule(AppModule)`
   + `platformBrowser().bootstrapModule(name)` **dentro del fork de Zone**.

### Fase 2 — Módulos: `angular.module()` → `@NgModule`

De arriba hacia abajo: `SharedModule` → `GuideModule` → `LibModule` →
`FeaturesModule` → `AppModule`. `CoreModule` ya está; solo hay que ir vaciando su
cola legacy a medida que migran los providers (Fase 4).

Patrón por módulo:

```ts
// antes
export const SharedModule = angular.module("docs.shared", [])
SharedModule.component(CopyButtonComponent.$name, CopyButtonComponent.$factory)
// …

// después
@NgModule({
  id: "docs.shared",
  imports: [],
  declarations: [CopyButtonComponent, ExampleSectionComponent, PageOutlineComponent, TitleHeadingComponent],
})
export class SharedModule {}
```

- `declarations` acepta clases con `@Component`/`@Directive`/`@Pipe` **o** con
  `static $factory` (el registrador lee `$factory` si está). Podés listar la clase
  antes de haberla decorado — migrás el módulo primero y los componentes después.
- `imports` acepta: clase `@NgModule`, `angular.IModule`, o `string` (nombre). Así
  `imports: [NgbModule]` (la clase, viene de `ngb-js`) y `imports: ["ui.router"]`
  conviven.
- Config imperativa que sobreviva (`.config(routing)`, `.provider()`, `.run()`):
  ```ts
  export const SharedModuleLegacy = registerNgModule(SharedModule)
  SharedModuleLegacy.config(routing)
  ```
  Mismo patrón que `CoreModuleLegacy` hoy.
- **Ojo `controllerAs`**: `@NgModule({ controllerAs: "example" })` se hereda a todas
  las `declarations` de ese módulo. `features/lib` usa `example.` en los templates
  → ponéselo al módulo (o submódulo) de ejemplos. El resto queda en `"$"` (default).

### Fase 3 — Componentes: `$factory`/`$name` → `@Component`

Uno por uno, hoja primero. El registro no cambia (lo hace `declarations`).

```ts
// antes
export class AccordionSimpleComponent implements IComponentController {
  static get $name() { return "docsAccordionSimple" }
  static get $factory(): IComponentOptions {
    return {
      controller: AccordionSimpleComponent,
      controllerAs: "example",
      templateUrl: "./accordion-simple.component.html",
      styleUrl: "./accordion-simple.component.css",
    }
  }
}

// después
@Component({
  selector: "docs-accordion-simple",              // → registra "docsAccordionSimple", restrict E
  templateUrl: "./accordion-simple.component.html", // string literal → ng-js-vite lo sigue procesando
  styleUrl: "./accordion-simple.component.css",
})
export class AccordionSimpleComponent {}
```

- `selector` en `kebab-case` de elemento → nombre `camelCase` (igual que hoy). Con
  `selector: "[docsFoo]"` → `restrict: 'A'` (para directivas de atributo).
- `controllerAs`: **no** en `@Component`; viene del `@NgModule`. Si un componente
  necesita otro prefijo, va en su propio módulo. (Alternativa: migrar el template de
  `example.` a `$.` y unificar en `"$"`.)
- `@Input()` / `@Output()` / `@Model()` reemplazan `bindings`. `@HostBinding` /
  `@HostListener` reemplazan `link`. Hooks: la clase escribe `ngOnInit` /
  `ngOnChanges` / `ngOnDestroy` / `ngDoCheck` (el bridge los reenvía a `$onInit`…);
  **nunca** escribas `$onInit` en una clase decorada.
- DI: borrás `static get $inject`; el constructor tipado alcanza (necesita Fase 0).
  Para tokens string usá `@Inject(TOKEN)` + `InjectionToken`.
- `@ViewChild` ya funciona hoy sin `@Component` — no lo toques al migrar la clase.

### Fase 4 — Servicios y DI

1. **Servicios de estado** (`ThemeService`, `MenuService`, `ScrollService`,
   `SearchService`, `LanguageService`, `TitleService`✅):
   ```ts
   @Injectable({ id: "docs.menu.service" })   // id → reemplaza static get $name
   export class MenuService {
     constructor(private offcanvas: NgbOffcanvas) {}   // sin static $inject
   }
   ```
   - Listalo en `providers: [MenuService]` del `@NgModule` correspondiente, o
     `@Injectable({ providedIn: "root" })` para singleton de app sin listarlo.
   - `@Service()` (sin paréntesis de config) = singleton de app **siempre**, pero
     sin DI por constructor (dependencias con `inject()` en field initializers) y
     sin recetas de provider. Para servicios simples sin deps.
   - Cambiá `new Subject()` interno por `EventEmitter` de `ngjs-core` si querés la
     semántica Angular (ya extiende `Subject`).
2. **`{ provide, useClass/useValue/useFactory/useExisting, multi }`**: van en
   `providers` del `@NgModule` (ya lo hacés en `CoreModule` con
   `{ provide: BOOSTRAP_URL, useClass: BootstrapUrlProvider }`).
3. **Providers config-phase** (`ThemeProvider`, `LanguageProvider`,
   `IndexingProvider`, `*UrlProvider`): **no hay decorador** para el `.provider()`
   de AngularJS (fase config con `$get`). Dos caminos:
   - **Dejarlos legacy** sobre el `angular.IModule` de `registerNgModule` (patrón
     actual de `CoreModuleLegacy.provider(...)` + `.config(provideX())`). Es lo
     recomendado mientras la config sea "elegir valores antes del `run`".
   - Si la config es en realidad "cargar datos async una vez" → `InjectionToken`
     con `factory` + un `.run()`/`APP_INITIALIZER`.
   Mapea a `ModuleWithProviders` de Angular; se migra a Angular real después.

### Fase 5 — Directivas y pipes

- Directivas propias (`docsTimepickerLunchValidator`, validadores): `@Directive({
  selector: "[docsX]" })`, `restrict: 'A'`. Los factories de validador que atan al
  `NgModelController` mapean a `$validators` / `$asyncValidators`.
- Si aparece algún `.filter()` propio → `@Pipe({ name: "x" })` con `transform()`.

### Fase 6 — `ngb-js`: import por feature

- Global (ya hecho): `imports: [NgbModule]` (la **clase**, no `.name`) en `AppModule`
  una vez que sea `@NgModule`.
- Tree-shaking opcional: en vez del `NgbModule` entero, importar por subpath la
  clase `@NgModule` de cada feature usada:
  ```ts
  import { NgbAlertModule } from "ngb-js/alert"
  import { NgbModalModule } from "ngb-js/modal"
  @NgModule({ imports: [NgbAlertModule, NgbModalModule, /* … */] })
  ```
- `ngb-js/<feature>/compat` (`NgbAlertModule.name`) es para apps AngularJS clásicas
  sin `ngjs-core` — **no** lo necesitás acá.

### Fase 7 — Routing (último, opcional)

`@uirouter/angularjs` se queda. `ngjs-core/router` (superficie `@angular/router`
path-based sobre UI-Router) existe pero tu árbol usa estados nombrados +
`abstract` + `data` + `redirectTo` anidados: es el punto de mayor fricción
(`brecha`). Recomendación: **no migrar routing** en esta pasada; dejá las funciones
`routing` como `.config()` sobre el `angular.IModule` de cada módulo.

---

## Tabla de equivalencias («simils»)

### Módulo / bootstrap

| Hoy en `ngbjs-doc` | Equivalente `ngjs-core` | Nota |
|---|---|---|
| `angular.module("docs.x", [A.name, B.name])` | `@NgModule({ id: "docs.x", imports: [A, B] })` + `registerNgModule(X)` | `imports` acepta clase / `IModule` / string |
| `Mod.component(X.$name, X.$factory)` | `@NgModule({ declarations: [X] })` | lee `@Component` o `$factory` |
| `Mod.service(S.$name, S)` | `providers: [S]` (con `@Injectable`) | |
| `Mod.constant(K.$key, K.$value)` | `providers: [{ provide: K, useValue: … }]` | `K` = `InjectionToken` |
| `Mod.provider(P.$name, P)` + `Mod.config(provideP())` | **sin decorador** — queda sobre `registerNgModule(X)` (patrón `CoreModuleLegacy`) | `ModuleWithProviders` |
| `Mod.config(routing)` / `Mod.run(fn)` | igual, sobre el `IModule` que devuelve `registerNgModule(X)` | |
| `ng-app="docs"` + `angular.module` | `bootstrapApplication(AppModule)` en `main.ts` (dentro de la zona) | quitar `ng-app` |
| `NgbModule.name` en deps | `imports: [NgbModule]` (la clase) | o `ngb-js/<feature>` por subpath |

### Componente

| Hoy | Equivalente | Nota |
|---|---|---|
| `static get $name() { return "docsFoo" }` | `@Component({ selector: "docs-foo" })` | selector elemento → nombre camelCase |
| `static get $factory(): IComponentOptions { … }` | metadata del `@Component` | |
| `controller: FooComponent` | la clase decorada **es** el controller | |
| `controllerAs: "example"` | `@NgModule({ controllerAs: "example" })` (heredado) | **no** va en `@Component` |
| `templateUrl: "./foo.html"` | `@Component({ templateUrl: "./foo.html" })` | dejar string literal para `ng-js-vite` |
| `styleUrl: "./foo.css"` | `@Component({ styleUrl: "./foo.css" })` | encapsulación emulada la hace el plugin |
| `bindings: { x: "<" }` | `@Input() x` | `@Input({ required: true })` → `<` + assert |
| `bindings: { x: "@" }` | `@Input({ binding: "@" }) x` | string/interpolación de atributo |
| `bindings: { xChange: "&" }` | `@Output() xChange = new EventEmitter<T>()` | `emit(v)` → `xChange({ $event: v })` |
| `bindings: { total: "=" }` | `@Model() total: T` | two-way nativo, sin `@Output` aparte |
| `link` / `$element.on(...)` para el host | `@HostListener("click") onClick() {}` | soporta `keydown.arrowdown`, `keydown.shift.tab` |
| clases/attrs del host en `link` | `@HostBinding("class.active") isActive = false` | wiring con `$watch`, se limpia en `$destroy` |
| `static get $inject() { return ["$timeout"] }` | constructor tipado: `constructor(private $timeout: ITimeoutService)` | necesita `emitDecoratorMetadata` |
| `$onInit()` en la clase | `ngOnInit()` (el bridge → `$onInit`) | idem `ngOnChanges`/`ngOnDestroy`/`ngDoCheck` |
| `$postLink()` | `ngAfterViewInit()` / `ngAfterContentInit()` | ambos → `$postLink` (no 1-a-1) |
| `implements IComponentController` | `implements OnInit, OnDestroy` (solo tipos) | opcional |

### Directiva / pipe

| Hoy | Equivalente | Nota |
|---|---|---|
| `Mod.directive("docsX", factoryFn)` | `@Directive({ selector: "[docsX]" })` en `declarations` | `restrict: 'A'` |
| factory de validador atando `NgModelController` | `@Directive` + `$validators` / `$asyncValidators` | firma `(control) => errors\|null` |
| `Mod.filter("x", fn)` | `@Pipe({ name: "x" })` `transform()` | filtro = impuro (re-evalúa cada digest) |

### Servicio / DI

| Hoy | Equivalente | Nota |
|---|---|---|
| `class S { static get $name() { return "docs.s" } }` + `Mod.service(...)` | `@Injectable({ id: "docs.s" })` + `providers: [S]` | `id` reemplaza `$name` |
| singleton de app | `@Injectable({ providedIn: "root" })` (o `@Service()`) | `@Service` = sin DI por ctor, deps con `inject()` |
| `static get $inject() { return [Dep.$name, TOKEN] }` | `constructor(private dep: Dep, @Inject(TOKEN) private t: T)` | |
| token string suelto (`"$document"`, `Const.$key`) | `InjectionToken` + `@Inject(TOKEN)` | sin tipo en runtime, el token lleva el genérico |
| `new Subject<T>()` interno + `.asObservable()` | `new EventEmitter<T>()` | ya extiende `Subject` |
| `{ provide: TOKEN, useClass: Impl }` (ya en `CoreModule`) | igual, en `providers` | `useValue`/`useFactory`/`useExisting`/`multi` soportados |
| override de servicio por instancia de componente | `@Component({ providers: [{ provide, useClass }] })` | inyector jerárquico (ver **CORE-003**, hoy `Open`) |
| `.provider()` + `$get` + `.config()` | queda **legacy** sobre `registerNgModule(X)` | sin decorador equivalente |

### Queries / refs (mayormente ya migrado)

| Hoy | Equivalente | Nota |
|---|---|---|
| `@ViewChild("nav", { read: NgbNav, static: true })` | igual — ya lo usás | resuelto en `$postLink` |
| `ng-ref="x"` en template | `@ViewChild("x")` | ver **CORE-001** para `ng-ref-read` + query string |
| `ng-ref-read="ngbAlert"` + método de controller | `@ViewChild("x", { read: NgbAlert })` | el `read` de clase sí trae el controller |
| `ng-ref-read="ElementRef"` | `@ViewChild("x", { read: ElementRef })` | idem `TemplateRef` / `ViewContainerRef` |
| `$element` / `$scope` inyectados | `ElementRef` / `ChangeDetectorRef` como locals | `detectChanges()` → ver **CORE-002** |

### Template (ya está — referencia)

| Concepto | En `ngbjs-doc` |
|---|---|
| `<ng-content>` | `transclude` + `<ng-template ng-ref>` / slots |
| `*ngTemplateOutlet` | `ng-template-outlet="ref"` |
| `<ng-container>` | `ng-container` (sin nodo DOM) |
| `#ref` | `ng-ref="ref"` |
| `[(ngModel)]` | `ng-model` |
| `[disabled]` | `ng-disabled` (+ `NgDisabled` inyectable) |
| `routerLink` / `routerLinkActive` | `ui-sref` / `ui-sref-active` (UI-Router se queda) |

### `ngb-js` — puntos de entrada

| Necesidad | Import |
|---|---|
| Todo `ngb-js` (global) | `import { NgbModule } from "ngb-js"` → `imports: [NgbModule]` |
| Solo una feature | `import { NgbAlertModule } from "ngb-js/alert"` (clase `@NgModule`) |
| Servicio / tipo de una feature | `import { NgbModal } from "ngb-js"` / `import type { INgbAlert } from "ngb-js"` |
| App AngularJS clásica (no aplica acá) | `import { NgbAlertModule } from "ngb-js/alert/compat"` → `.name` |
| Config global | `import { NgbConfig } from "ngb-js"` en `providers` |

---

## Riesgos / brechas conocidas (de los ISSUES del repo)

| ID | Impacto en la migración |
|---|---|
| **CORE-001** | `@ViewChild("ref")` string + `ng-ref-read` devuelve `ElementRef`, no el controller. Workaround: `@ViewChild("ref", { read: NgbX })`. |
| **CORE-002** | `ChangeDetectorRef.detectChanges()` desde un scope hijo durante un digest raíz → `$digest already in progress`. Aparece con `NgbNavOutlet`. |
| **CORE-003** | No hay `providers` scoped por instancia de componente todavía → no se puede tener dos `NgbTimepicker` con `NgbTimepickerI18n` distinto salvo override global. Afecta `timepicker-i18n` de la doc. |
| **NAV-001** (Done) | `<a ngb-nav-link ui-sref>` cancelaba la transición; usar `<button ngb-nav-link ui-sref>`. |
| Routing | `ngjs-core/router` no cubre estados nombrados/abstract/anidados de UI-Router — no migrar routing. |
| Toolchain | Sin `emitDecoratorMetadata` + `reflect-metadata`, `@Injectable` con ctor tipado no resuelve. Sin `useDefineForClassFields: false`, los decoradores de campo (`@Input`/`@HostBinding`) se pisan. |

---

## Checklist rápido

- [ ] Fase 0: `emitDecoratorMetadata: true`, `useDefineForClassFields: false`, `import "reflect-metadata"` en `main.ts`, 1 componente de prueba
- [ ] Fase 1: quitar `ng-app`, `bootstrapApplication(AppModule)`
- [ ] Fase 2: `SharedModule` → `GuideModule` → `LibModule` → `FeaturesModule` → `AppModule` a `@NgModule`
- [ ] Fase 3: componentes `$factory` → `@Component` (hoja primero; cuidar `controllerAs`)
- [ ] Fase 4: servicios → `@Injectable`; providers config-phase quedan legacy
- [ ] Fase 5: directivas/pipes propios → `@Directive` / `@Pipe`
- [ ] Fase 6: `ngb-js` por clase / subpath
- [ ] Fase 7: routing — no tocar (por ahora)
