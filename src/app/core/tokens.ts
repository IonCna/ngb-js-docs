import { InjectionToken } from "ngjs-core"
import { Language } from "@/core/constants/language.constant"
import { Themes } from "@/core/constants/themes.constant"
import type { SearchDocument } from "@/core/constants/search-documents.constant"

// --- Config / valores estáticos ---------------------------------------------

/** Clave de localStorage donde se guarda el tema. */
export const THEME_STORAGE_KEY = new InjectionToken<string>("docs.theme.storageKey")
/** Clave de localStorage donde se guarda el idioma. */
export const LANGUAGE_STORAGE_KEY = new InjectionToken<string>("docs.language.storageKey")
/** El enum `Themes` completo (para componentes que necesitan las opciones). */
export const THEMES_ENUM = new InjectionToken<typeof Themes>("docs.themes.enum")
/** Documentos indexables de la búsqueda. */
export const SEARCH_DOCUMENTS = new InjectionToken<SearchDocument[]>("docs.search.documents")

/** URL base de la doc de Bootstrap. */
export const BOOTSTRAP_URL = new InjectionToken<string>("docs.bootstrapUrl")
/** URL base de la doc de ng-bootstrap. */
export const NG_BOOTSTRAP_URL = new InjectionToken<string>("docs.ngBootstrapUrl")

// --- Valores derivados (useFactory) ---------------------------------------

/** Tema activo inicial. */
export const THEME = new InjectionToken<Themes>("docs.theme")
/** Idioma activo. */
export const LANGUAGE = new InjectionToken<Language>("docs.language")
/** Índice invertido de búsqueda. */
export const INDEXING = new InjectionToken<Map<string, Set<string>>>("docs.indexing")

// --- Factories -----------------------------------------------------------

export function bootstrapUrlFactory(config: { url: string; version: number }): string {
    return `${config.url}/docs/${config.version}/`
}

export function ngBootstrapUrlFactory(config: { url: string }): string {
    return `${config.url}/#/`
}

export function themeFactory(storageKey: string): Themes {
    const saved = localStorage.getItem(storageKey)

    if (!saved) {
        return matchMedia("(prefers-color-scheme: dark)").matches ? Themes.dark : Themes.light
    }

    if (!(saved in Themes)) throw new Error("this theme is not valid")

    return saved as Themes
}

export function languageFactory(storageKey: string): Language {
    const saved = localStorage.getItem(storageKey)

    if (!saved || !(saved.toUpperCase() in Language)) return Language.EN_US

    return saved as Language
}
