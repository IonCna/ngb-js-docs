import { DOCUMENT, Inject, Injectable } from "ngjs-core";
import { Themes } from "@/core/constants/themes.constant";
import { THEME, THEME_STORAGE_KEY } from "@/core/tokens";

@Injectable({ id: "docs.theme.service" })
export class ThemeService {
    constructor(
        @Inject(THEME) private _currentTheme: Themes,
        @Inject(THEME_STORAGE_KEY) private readonly themeStorageKey: string,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {
        this._applyTheme(this._currentTheme)
    }

    get activeTheme(): Themes {
        return this._currentTheme;
    }

    public toggle() {
        this._currentTheme = this._currentTheme === Themes.light ? Themes.dark : Themes.light;
        this._applyTheme(this._currentTheme)
    }

    public setActive(theme: Themes) {
        this._applyTheme(theme);
    }

    private _applyTheme(theme: Themes) {
        this._currentTheme = theme;

        this.document.documentElement.setAttribute("data-bs-theme", this._currentTheme);
        this.saveInLocalStorage(this._currentTheme)
    }

    private saveInLocalStorage(value: string) {
        localStorage.setItem(this.themeStorageKey, value)
    }
}
