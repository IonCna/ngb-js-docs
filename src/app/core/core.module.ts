import { NgModule } from "ngjs-core";

import { LayoutModule } from "@/core/layouts/layout.module"

import { Themes } from "@/core/constants/themes.constant"
import { documents } from "@/core/constants/search-documents.constant"
import { buildSearchIndex } from "@/core/search-index"
import {
    BOOTSTRAP_URL,
    NG_BOOTSTRAP_URL,
    THEME,
    LANGUAGE,
    INDEXING,
    SEARCH_DOCUMENTS,
    THEMES_ENUM,
    THEME_STORAGE_KEY,
    LANGUAGE_STORAGE_KEY,
    bootstrapUrlFactory,
    ngBootstrapUrlFactory,
    themeFactory,
    languageFactory,
} from "@/core/tokens"

import { ThemeService } from "@/core/services/theme.service"
import { LanguageService } from "@/core/services/language.service"
import { MenuService } from "@/core/services/menu.service"
import { TitleService } from "@/core/services/title.service"
import { ScrollService } from "@/core/services/scroll.service"
import { SearchService } from "@/core/services/search.service"

@NgModule({
    id: "docs.core",
    imports: [LayoutModule],
    providers: [
        { provide: THEME_STORAGE_KEY, useValue: "theme" },
        { provide: LANGUAGE_STORAGE_KEY, useValue: "language" },
        { provide: THEMES_ENUM, useValue: Themes },
        { provide: SEARCH_DOCUMENTS, useValue: documents },

        { provide: BOOTSTRAP_URL, useValue: bootstrapUrlFactory({ url: "https://getbootstrap.com", version: 5.3 }) },
        { provide: NG_BOOTSTRAP_URL, useValue: ngBootstrapUrlFactory({ url: "https://ng-bootstrap.github.io" }) },

        { provide: THEME, useFactory: themeFactory, deps: [THEME_STORAGE_KEY] },
        { provide: LANGUAGE, useFactory: languageFactory, deps: [LANGUAGE_STORAGE_KEY] },
        { provide: INDEXING, useFactory: buildSearchIndex, deps: [LANGUAGE, SEARCH_DOCUMENTS] },

        ThemeService,
        LanguageService,
        MenuService,
        TitleService,
        ScrollService,
        SearchService,
    ],
})
export class CoreModule {}
