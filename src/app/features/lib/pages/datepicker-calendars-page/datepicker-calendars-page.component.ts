import { Component } from "ngjs-core";
import { NgbCalendarBuddhist, NgbCalendarEthiopian, NgbCalendarGregorian, NgbCalendarHebrew, NgbCalendarIslamicCivil, NgbCalendarIslamicUmalqura, NgbCalendarPersian, NgbDatepickerI18n, NgbDatepickerI18nAmharic, NgbDatepickerI18nHebrew, type NgbCalendar, type NgbDateStruct } from "ngb-js/datepicker";

class CalendarI18n extends NgbDatepickerI18n {
    constructor(private readonly months: string[], private readonly weekdays: string[], private readonly localeName: string) { super(); }
    getWeekdayLabel(weekday: number) { return this.weekdays[weekday - 1] ?? ""; }
    getMonthShortName(month: number) { return this.months[month - 1]?.slice(0, 3) ?? ""; }
    getMonthFullName(month: number) { return this.months[month - 1] ?? ""; }
    getDayAriaLabel(date: NgbDateStruct) { return `${this.localeName}: ${date.day} ${this.getMonthFullName(date.month)} ${date.year}`; }
}

interface CalendarDemo {
    calendar: NgbCalendar;
    i18n: NgbDatepickerI18n;
    date: NgbDateStruct;
}

const PERSIAN_WEEKDAYS = ["د", "س", "چ", "پ", "ج", "ش", "ی"];
const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const ARABIC_WEEKDAYS = ["ن", "ث", "ر", "خ", "ج", "س", "ح"];
const ISLAMIC_MONTHS = ["محرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"];
const THAI_WEEKDAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const GALACTIC_MONTHS = ["ᔑリ⊣⚍ᔑ∷||", "⎓ᒷʖ∷⚍ᔑ∷||", "ᒲᔑ∷ᓵ⍑", "ᔑ!¡∷╎ꖎ", "ᒲᔑ||", "⋮⚍リᒷ", "⋮⚍ꖎ||", "ᔑ⚍⊣⚍ᓭℸ̣", "ᓭᒷ!¡ℸ̣ᒷᒲʖᒷ∷", "𝙹ᓵℸ̣𝙹ʖᒷ∷", "リ𝙹⍊ᒷᒲʖᒷ∷", "↸ᒷᓵᒷᒲʖᒷ∷"];
const GALACTIC_WEEKDAYS = ["ᒲ", "ℸ̣", "∴", "ℸ̣", "⎓", "ᓭ", "ᓭ"];

@Component({
    selector: "docs-datepicker-calendars-page",
    controllerAs: "$",
    templateUrl: "./datepicker-calendars-page.component.html",
    styleUrl: "./datepicker-calendars-page.component.css",
})
export class DatepickerCalendarsPageComponent {
    public readonly calendars = {
        hebrew: this.create(new NgbCalendarHebrew(), new NgbDatepickerI18nHebrew()),
        jalali: this.create(new NgbCalendarPersian(), new CalendarI18n(PERSIAN_MONTHS, PERSIAN_WEEKDAYS, "Jalali")),
        islamicCivil: this.create(new NgbCalendarIslamicCivil(), new CalendarI18n(ISLAMIC_MONTHS, ARABIC_WEEKDAYS, "Islamic Civil")),
        islamicUmalqura: this.create(new NgbCalendarIslamicUmalqura(), new CalendarI18n(ISLAMIC_MONTHS, ARABIC_WEEKDAYS, "Islamic Umm al-Qura")),
        buddhist: this.create(new NgbCalendarBuddhist(), new CalendarI18n(THAI_MONTHS, THAI_WEEKDAYS, "Buddhist")),
        ethiopian: this.create(new NgbCalendarEthiopian(), new NgbDatepickerI18nAmharic()),
        intergalactic: this.create(new NgbCalendarGregorian(), new CalendarI18n(GALACTIC_MONTHS, GALACTIC_WEEKDAYS, "Intergalactic Standard")),
    };

    private create(calendar: NgbCalendar, i18n: NgbDatepickerI18n): CalendarDemo { return { calendar, i18n, date: calendar.getToday() }; }
}
