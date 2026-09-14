import { Inject, Injectable } from "ngjs-core";
import type { Language } from "@/core/constants/language.constant.ts";
import { LANGUAGE } from "@/core/tokens";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ id: "docs.language.service" })
export class LanguageService {
    private _changeLang: BehaviorSubject<Language>;
    public changeLang$: Observable<Language>;

    constructor(
        @Inject(LANGUAGE) private language: Language,
    ) {
        this._changeLang = new BehaviorSubject(this.language);
        this.changeLang$ = this._changeLang.asObservable();
    }

    public selectLanguage(language: Language) {
        this._changeLang.next(language);
    }
}
