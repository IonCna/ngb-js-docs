import{r as e}from"./rolldown-runtime-hePW80VL.js";import{At as t,D as n,E as r,Et as i,G as a,I as o,J as s,K as c,Q as l,S as u,St as d,Tt as f,U as p,W as m,Y as h,_ as g,a as _,b as ee,bt as te,c as v,ct as ne,i as y,jt as re,k as ie,kt as ae,l as oe,n as b,o as x,r as S,s as C,u as w,w as se,xt as ce}from"./decorate-DwQZkZoC.js";import{a as T,n as le,t as E}from"./takeUntil-BKtcECga.js";import{a as ue,i as de,n as fe,o as pe,r as me,t as he}from"./popper-lite-DBfQD1Rd.js";import{t as ge}from"./tap-CIgbelGH.js";import{t as _e}from"./withLatestFrom-BubtPwG_.js";import{l as ve,n as ye,t as be,u as xe}from"./chunk-5K2ZIVXR-DiaMPVO_.js";import"./common-DYSR_6bS.js";import{t as Se}from"./rxjs-interop-D-zScHkx.js";var Ce=class{static $name=`Renderer2`},we=class{static $name=`RendererFactory2`},Te={httpEquiv:`http-equiv`},Ee=class{static $name=`Meta`},De=class extends Ee{constructor(e){super(),this.doc=e}doc;static $inject=[b.toString()];addTag(e,t=!1){return e?this.getOrCreateElement(e,t):null}addTags(e,t=!1){return e?e.reduce((e,n)=>(n&&e.push(this.getOrCreateElement(n,t)),e),[]):[]}getTag(e){return e?this.doc.querySelector(`meta[${e}]`)??null:null}getTags(e){return e?Array.from(this.doc.querySelectorAll(`meta[${e}]`)):[]}updateTag(e,t){if(!e)return null;let n=t||this.parseSelector(e),r=this.getTag(n);return r?this.setAttributes(e,r):this.getOrCreateElement(e,!0)}removeTag(e){this.removeTagElement(this.getTag(e))}removeTagElement(e){e?.remove()}getOrCreateElement(e,t=!1){if(!t){let t=this.getTags(this.parseSelector(e)).find(t=>this.containsAttributes(e,t));if(t!==void 0)return t}let n=this.doc.createElement(`meta`);return this.setAttributes(e,n),this.doc.getElementsByTagName(`head`)[0].appendChild(n),n}setAttributes(e,t){for(let n of Object.keys(e)){let r=e[n];r!==void 0&&t.setAttribute(this.keyMap(n),r)}return t}parseSelector(e){let t=e.name?`name`:`property`;return`${t}="${e[t]}"`}containsAttributes(e,t){return Object.keys(e).every(n=>t.getAttribute(this.keyMap(n))===e[n])}keyMap(e){return Te[e]??e}},Oe=class extends Ce{constructor(e){super(),this.doc=e}doc;data={};destroyNode=null;destroy(){}createElement(e,t){return t?this.doc.createElementNS(t,e):this.doc.createElement(e)}createComment(e){return this.doc.createComment(e)}createText(e){return this.doc.createTextNode(e)}appendChild(e,t){e.appendChild(t)}insertBefore(e,t,n){e&&e.insertBefore(t,n)}removeChild(e,t){e?.removeChild(t)}selectRootElement(e,t){let n=typeof e==`string`?this.doc.querySelector(e):e;if(!n)throw Error(`El elemento ra\xEDz no existe (selectRootElement): ${e}`);return t||(n.textContent=``),n}parentNode(e){return e.parentNode}nextSibling(e){return e.nextSibling}setAttribute(e,t,n,r){r?e.setAttributeNS(r,`${r}:${t}`,n):e.setAttribute(t,n)}removeAttribute(e,t,n){n?e.removeAttributeNS(n,t):e.removeAttribute(t)}addClass(e,t){e.classList.add(t)}removeClass(e,t){e.classList.remove(t)}setStyle(e,t,n,r){r&&r&2?e.style.setProperty(t,String(n),r&1?`important`:``):e.style[t]=n}removeStyle(e,t,n){n&&n&2?e.style.removeProperty(t):e.style[t]=``}setProperty(e,t,n){e[t]=n}setValue(e,t){e.nodeValue=t}listen(e,t,n){return e.addEventListener(t,n),()=>e.removeEventListener(t,n)}},ke=class extends we{static $inject=[b.toString()];renderer;constructor(e){super(),this.renderer=new Oe(e)}createRenderer(e,t){return this.renderer}},D=class{constructor(e){this.changingThisBreaksApplicationSecurity=e}changingThisBreaksApplicationSecurity;toString(){return`SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see https://g.co/ng/security#xss)`}},Ae=class extends D{getTypeName(){return`HTML`}},je=class extends D{getTypeName(){return`Style`}},Me=class extends D{getTypeName(){return`Script`}},Ne=class extends D{getTypeName(){return`URL`}},Pe=class extends D{getTypeName(){return`ResourceURL`}};function O(e){return e instanceof D?e.changingThisBreaksApplicationSecurity:e}function Fe(e){return e instanceof D?e.getTypeName():null}function Ie(e,t){let n=Fe(e);if(n!=null&&n!==t){if(n===`ResourceURL`&&t===`URL`)return!0;throw Error(`Required a safe ${t}, got a ${n} (see https://g.co/ng/security#xss)`)}return n===t}function Le(e){return new Ae(e)}function Re(e){return new je(e)}function ze(e){return new Me(e)}function Be(e){return new Ne(e)}function Ve(e){return new Pe(e)}var He=/^(?!javascript:)(?:[a-z0-9+.\-]+:|[^&:/?#]*(?:[/?#]|$))/i;function Ue(e){let t=String(e);return t.match(He)?t:`unsafe:${t}`}var We=/^(?:(?:https?|file):|[^&:/?#]*(?:[/?#]|$))/i;function Ge(e){return String(e).split(`,`).map(e=>{let t=e.trim(),n=t.indexOf(` `),r=n===-1?t:t.slice(0,n),i=n===-1?``:t.slice(n);return(r.match(We)?r:`unsafe:${r}`)+i}).join(`, `)}function k(...e){let t={};for(let n of e)for(let e of n.split(`,`))t[e]=!0;return t}function Ke(...e){return Object.assign({},...e)}var qe=k(`area,br,col,hr,img,wbr`),Je=k(`colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr`),Ye=k(`rp,rt`),Xe=Ke(Ye,Je),Ze=Ke(qe,Ke(Je,k(`address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figcaption,figure,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul`)),Ke(Ye,k(`a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video`)),Xe),Qe=k(`background,cite,href,itemtype,longdesc,poster,src,xlink:href`),$e=Ke(Qe,k(`abbr,accesskey,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width`)),et=k(`script,style,template`),tt=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,nt=/([^#-~ |!])/g;function rt(e){return e.replace(/&/g,`&amp;`).replace(tt,e=>{let t=e.charCodeAt(0),n=e.charCodeAt(1);return`&#${(t-55296)*1024+(n-56320)+65536};`}).replace(nt,e=>`&#${e.charCodeAt(0)};`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function it(e,t){if(t&&(e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY)===Node.DOCUMENT_POSITION_CONTAINED_BY)throw Error(`Failed to sanitize html because the element is clobbered`);return t}var at=class{buf=[];sanitizeChildren(e){let t=e.firstChild,n=!0,r=[];for(;t;){if(t.nodeType===Node.ELEMENT_NODE?n=this.startElement(t):t.nodeType===Node.TEXT_NODE&&this.buf.push(rt(t.nodeValue??``)),n&&t.firstChild){r.push(t),t=t.firstChild;continue}for(;t;){t.nodeType===Node.ELEMENT_NODE&&this.endElement(t);let e=it(t,t.nextSibling);if(e){t=e;break}t=it(t,r.pop()??null)}}return this.buf.join(``)}startElement(e){let t=e.nodeName.toLowerCase();if(Ze[t]!==!0)return et[t]!==!0;this.buf.push(`<`,t);for(let t of Array.from(e.attributes)){let e=t.name,n=e.toLowerCase();if($e[n]!==!0)continue;let r=t.value;Qe[n]?r=Ue(r):n===`srcset`&&(r=Ge(r)),this.buf.push(` `,e,`="`,rt(r),`"`)}return this.buf.push(`>`),!0}endElement(e){let t=e.nodeName.toLowerCase();Ze[t]===!0&&qe[t]!==!0&&this.buf.push(`</`,t,`>`)}};function ot(e,t){try{let e=new DOMParser().parseFromString(`<body><remove></remove>${t}`,`text/html`).body;if(e)return e.firstChild?.remove(),e}catch{}let n=e.createElement(`template`);return n.innerHTML=t,n.content}function st(e,t){let n=t?String(t):``,r=ot(e,n),i=5,a=r.innerHTML;for(;n!==a;){if(i--===0)throw Error(`Failed to sanitize html because the input is unstable`);n=a,r=ot(e,n),a=r.innerHTML}let o=new at().sanitizeChildren(r);for(;r.firstChild;)r.firstChild.remove();return o}var ct=class{static $name=`DomSanitizer`},lt=class extends ct{constructor(e){super(),this.doc=e}doc;static $inject=[b.toString()];sanitize(e,t){if(t==null)return null;switch(e){case 0:return t;case 1:return Ie(t,`HTML`)?O(t):st(this.doc,String(t));case 2:return Ie(t,`Style`)?O(t):t;case 3:if(Ie(t,`Script`))return O(t);throw Error(`unsafe value used in a script context`);case 4:return Ie(t,`URL`)?O(t):Ue(String(t));case 5:if(Ie(t,`ResourceURL`))return O(t);throw Error(`unsafe value used in a resource URL context (see https://g.co/ng/security#xss)`);default:throw Error(`Unexpected SecurityContext ${e} (see https://g.co/ng/security#xss)`)}}bypassSecurityTrustHtml(e){return Le(e)}bypassSecurityTrustStyle(e){return Re(e)}bypassSecurityTrustScript(e){return ze(e)}bypassSecurityTrustUrl(e){return Be(e)}bypassSecurityTrustResourceUrl(e){return Ve(e)}},ut=e(re(),1),dt;function ft(){return dt||(o(),ye(),dt=ut.default.module(`ng.js.platform-browser`,[`ng.js.core`,`ng.js.common`]).service(ve.$name,xe).service(Ee.$name,De).service(ct.$name,lt).service(we.$name,ke),dt)}var pt=ft(),mt=Object.defineProperty,ht=Object.getOwnPropertyDescriptor,A=(e,t,n,r)=>{for(var i=r>1?void 0:r?ht(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&mt(t,n,i),i},gt=class{constructor(){this._element=w(b).documentElement}isRTL(){return(this._element.getAttribute(`dir`)||``).toLowerCase()===`rtl`}};gt=A([r()],gt);var _t=/\s+/,vt=/  +/gi,yt={top:[`top`],bottom:[`bottom`],start:[`left`,`right`],left:[`left`],end:[`right`,`left`],right:[`right`],"top-start":[`top-start`,`top-end`],"top-left":[`top-start`],"top-end":[`top-end`,`top-start`],"top-right":[`top-end`],"bottom-start":[`bottom-start`,`bottom-end`],"bottom-left":[`bottom-start`],"bottom-end":[`bottom-end`,`bottom-start`],"bottom-right":[`bottom-end`],"start-top":[`left-start`,`right-start`],"left-top":[`left-start`],"start-bottom":[`left-end`,`right-end`],"left-bottom":[`left-end`],"end-top":[`right-start`,`left-start`],"right-top":[`right-start`],"end-bottom":[`right-end`,`left-end`],"right-bottom":[`right-end`]};function bt(e,t){let[n,r]=yt[e];return t&&r||n}var xt=/^left/,St=/^right/,Ct=/^start/,wt=/^end/;function Tt(e,t){let[n,r]=t.split(`-`),i=n.replace(xt,`start`).replace(St,`end`),a=[i];if(r){let e=r;(n===`left`||n===`right`)&&(e=e.replace(Ct,`top`).replace(wt,`bottom`)),a.push(`${i}-${e}`)}return e&&(a=a.map(t=>`${e}-${t}`)),a.join(` `)}function Et({placement:e,baseClass:t},n){let r=Array.isArray(e)?e:e.split(_t),i=[`top`,`bottom`,`start`,`end`,`top-start`,`top-end`,`bottom-start`,`bottom-end`,`start-top`,`start-bottom`,`end-top`,`end-bottom`],a=r.findIndex(e=>e===`auto`);a>=0&&i.forEach(e=>{r.find(t=>t.search(`^${e}`)!==-1)??r.splice(a++,1,e)});let o=r.map(e=>bt(e,n.isRTL()));return{placement:o.shift(),modifiers:[{name:`bootstrapClasses`,enabled:!!t,phase:`write`,fn({state:e}){let n=RegExp(`${t}(-[a-z]+)*`,`gi`),r=e.elements.popper,i=e.placement,a=r.className;a=a.replace(n,``),a+=` ${Tt(t,i)}`,a=a.trim().replace(vt,` `),r.className=a}},de,fe,ue,{enabled:!0,name:`flip`,options:{fallbackPlacements:o}}]}}function Dt(e){return e}function Ot(){let e=w(gt),t=null;return{createPopper(n){if(!t){let r=(n.updatePopperOptions||Dt)(Et(n,e));t=he(n.hostElement,n.targetElement,r)}},update(){t&&t.update()},setOptions(n){if(t){let r=(n.updatePopperOptions||Dt)(Et(n,e));t.setOptions(r)}},destroy(){t&&=(t.destroy(),null)}}}function j(e){return parseInt(`${e}`,10)}function kt(e){return typeof e==`string`}function M(e){return!isNaN(j(e))}function N(e){return typeof e==`number`&&isFinite(e)&&Math.floor(e)===e}function At(e){return M(e)?`0${e}`.slice(-2):``}function jt(e,t){return t?e.closest(t):null}var Mt=(e,t)=>t?t.some(t=>t?.contains(e)):!1,Nt=(e,t)=>!t||jt(e,t)!=null,Pt=typeof navigator<`u`&&!!navigator.userAgent&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints&&navigator.maxTouchPoints>2||/Android/.test(navigator.userAgent)),Ft=e=>Pt?()=>setTimeout(()=>e(),100):e;function It(e,t,n,r,i,a,o,c){n&&e.runOutsideAngular(Ft(()=>{let u=e=>{let t=e.target;return e.button===2||Mt(t,o)?!1:n===`inside`?Mt(t,a)&&Nt(t,c):n===`outside`?!Mt(t,a):Nt(t,c)||!Mt(t,a)},d=T(t,`keydown`).pipe(E(i),s(e=>e.key===`Escape`),ge(e=>e.preventDefault())),f=T(t,`mousedown`).pipe(l(u),E(i)),p=T(t,`mouseup`).pipe(_e(f),s(([,e])=>e),pe(0),E(i));le([d.pipe(l(()=>0)),p.pipe(l(()=>1))]).subscribe(t=>e.run(()=>r(t)))}))}var Lt=[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`[contenteditable]`,`[tabindex]:not([tabindex="-1"])`].join(`, `);function Rt(e){let t=Array.from(e.querySelectorAll(Lt)).filter(e=>e.tabIndex!==-1);return[t[0],t[t.length-1]]}var zt=(e,t,n,r=!1)=>{e.runOutsideAngular(()=>{let e=T(t,`focusin`).pipe(E(n),l(e=>e.target));T(t,`keydown`).pipe(E(n),s(e=>e.key===`Tab`),_e(e)).subscribe(([e,n])=>{let[r,i]=Rt(t);(n===r||n===t)&&e.shiftKey&&(i.focus(),e.preventDefault()),n===i&&!e.shiftKey&&(r.focus(),e.preventDefault())}),r&&T(t,`click`).pipe(E(n),_e(e),l(e=>e[1])).subscribe(e=>e.focus())})};function Bt(e){return t=>(t.modifiers.push(me,{name:`offset`,options:{offset:()=>e}}),t)}var Vt=class{constructor(){this._document=w(b)}hide(){let e=Math.abs(window.innerWidth-this._document.documentElement.clientWidth),t=this._document.body,n=t.style,{overflow:r,paddingRight:i}=n;return e>0&&(n.paddingRight=`${parseFloat(window.getComputedStyle(t).paddingRight)+e}px`),n.overflow=`hidden`,()=>{e>0&&(n.paddingRight=i),n.overflow=r}}};Vt=A([r()],Vt);var Ht=new ae(`live announcer delay`,{providedIn:`root`,factory:()=>100});function Ut(e,t=!1){let n=e.body.querySelector(`#ngb-live`);return n==null&&t&&(n=e.createElement(`div`),n.setAttribute(`id`,`ngb-live`),n.setAttribute(`aria-live`,`polite`),n.setAttribute(`aria-atomic`,`true`),n.classList.add(`visually-hidden`),e.body.appendChild(n)),n}var Wt=class{constructor(){this._document=w(b),this._delay=w(Ht)}ngOnDestroy(){let e=Ut(this._document);e&&e.parentElement.removeChild(e)}say(e){let t=Ut(this._document,!0),n=this._delay;if(t!=null){t.textContent=``;let r=()=>t.textContent=e;n===null?r():setTimeout(r,n)}}};Wt=A([r()],Wt);function Gt(){return new Kt}var P=class{};P=A([u({providedIn:`root`})],P);var Kt=class extends P{fromModel(e){return e&&N(e.year)&&N(e.month)&&N(e.day)?{year:e.year,month:e.month,day:e.day}:null}toModel(e){return e&&N(e.year)&&N(e.month)&&N(e.day)?{year:e.year,month:e.month,day:e.day}:null}};Kt=A([u()],Kt);var F=class e{static from(t){return t instanceof e?t:t?new e(t.year,t.month,t.day):null}constructor(e,t,n){this.year=N(e)?e:null,this.month=N(t)?t:null,this.day=N(n)?n:null}equals(e){return e!=null&&this.year===e.year&&this.month===e.month&&this.day===e.day}before(e){return e?this.year===e.year?this.month===e.month?this.day!==e.day&&this.day<e.day:this.month<e.month:this.year<e.year:!1}after(e){return e?this.year===e.year?this.month===e.month?this.day!==e.day&&this.day>e.day:this.month>e.month:this.year>e.year:!1}};function qt(e){return new Date(e.year-543,e.month-1,e.day)}function Jt(e){return new F(e.getFullYear()+543,e.getMonth()+1,e.getDate())}function Yt(e){return new F(e.getFullYear(),e.getMonth()+1,e.getDate())}function Xt(e){let t=new Date(e.year,e.month-1,e.day,12);return isNaN(t.getTime())||t.setFullYear(e.year),t}function Zt(){return new Qt}var I=class{};I=A([u({providedIn:`root`})],I);var Qt=class extends I{getDaysPerWeek(){return 7}getMonths(){return[1,2,3,4,5,6,7,8,9,10,11,12]}getWeeksPerMonth(){return 6}getNext(e,t=`d`,n=1){let r=Xt(e),i=!0,a=r.getMonth();switch(t){case`y`:r.setFullYear(r.getFullYear()+n);break;case`m`:a+=n,r.setMonth(a),a%=12,a<0&&(a+=12);break;case`d`:r.setDate(r.getDate()+n),i=!1;break;default:return e}return i&&r.getMonth()!==a&&r.setDate(0),Yt(r)}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=Xt(e).getDay();return t===0?7:t}getWeekNumber(e,t){t===7&&(t=0);let n=e[(11-t)%7],r=Xt(n);r.setDate(r.getDate()+4-(r.getDay()||7));let i=r.getTime();return r.setMonth(0),r.setDate(1),Math.floor(Math.round((i-r.getTime())/864e5)/7)+1}getToday(){return Yt(new Date)}isValid(e){if(!e||!N(e.year)||!N(e.month)||!N(e.day)||e.year===0)return!1;let t=Xt(e);return!isNaN(t.getTime())&&t.getFullYear()===e.year&&t.getMonth()+1===e.month&&t.getDate()===e.day}};Qt=A([u()],Qt);var $t=class extends Qt{getToday(){return Jt(new Date)}getNext(e,t=`d`,n=1){let r=qt(e),i=!0,a=r.getMonth();switch(t){case`y`:r.setFullYear(r.getFullYear()+n);break;case`m`:a+=n,r.setMonth(a),a%=12,a<0&&(a+=12);break;case`d`:r.setDate(r.getDate()+n),i=!1;break;default:return e}return i&&r.getMonth()!==a&&r.setDate(0),Jt(r)}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=qt(e).getDay();return t===0?7:t}getWeekNumber(e,t){t===7&&(t=0);let n=e[(11-t)%7],r=qt(n);r.setDate(r.getDate()+4-(r.getDay()||7));let i=r.getTime();return r.setMonth(0),r.setDate(1),Math.floor(Math.round((i-r.getTime())/864e5)/7)+1}isValid(e){if(!e||!N(e.year)||!N(e.month)||!N(e.day)||e.year===0)return!1;let t=qt(e);return!isNaN(t.getTime())&&t.getFullYear()===e.year-543&&t.getMonth()+1===e.month&&t.getDate()===e.day}},L=class{getMonthLabel(e){return`${this.getMonthFullName(e.month,e.year)} ${this.getYearNumerals(e.year)}`}getDayNumerals(e){return`${e.day}`}getWeekNumerals(e){return`${e}`}getYearNumerals(e){return`${e}`}getWeekLabel(){return``}};L=A([u({providedIn:`root`})],L);var en=class extends L{constructor(e,t){super(),this._locale=e??w(`$locale`),this._dateFilter=(t??w(`$filter`))(`date`),this._monthsShort=[...Array(12).keys()].map(e=>Intl.DateTimeFormat(this._locale.id,{month:`short`,timeZone:`UTC`}).format(Date.UTC(2e3,e))),this._monthsFull=[...Array(12).keys()].map(e=>Intl.DateTimeFormat(this._locale.id,{month:`long`,timeZone:`UTC`}).format(Date.UTC(2e3,e)))}getWeekdayLabel(e,t=`narrow`){return[1,2,3,4,5,6,7].map(e=>Intl.DateTimeFormat(this._locale.id,{weekday:t,timeZone:`UTC`}).format(Date.UTC(2e3,4,e)))[e-1]||``}getMonthShortName(e){return this._monthsShort[e-1]||``}getMonthFullName(e){return this._monthsFull[e-1]||``}getDayAriaLabel(e){let t=new Date(e.year,e.month-1,e.day);return this._dateFilter(t,`fullDate`)}};en=A([u()],en);var tn=[`እሑድ`,`ሰኞ`,`ማክሰኞ`,`ረቡዕ`,`ሓሙስ`,`ዓርብ`,`ቅዳሜ`],nn=[`መስከረም`,`ጥቅምት`,`ኅዳር`,`ታህሣሥ`,`ጥር`,`የካቲት`,`መጋቢት`,`ሚያዝያ`,`ግንቦት`,`ሰኔ`,`ሐምሌ`,`ነሐሴ`,`ጳጉሜ`],rn=class extends L{getMonthShortName(e,t){return this.getMonthFullName(e,t)}getMonthFullName(e,t){return nn[e-1]??``}getWeekdayLabel(e){return tn[e-1]??``}getDayAriaLabel(e){return`${e.day} ${this.getMonthFullName(e.month,e.year)} ${e.year}`}},an=1724220.5,on=[30,30,30,30,30,30,30,30,30,30,30,30,5];function sn(e){return e==null?!1:e%4==3||e%4==-1}function cn(e,t){return e.year=+t,e}function ln(e,t){return t=+t,e.year+=Math.floor((t-1)/13),e.month=Math.floor(((t-1)%13+13)%13)+1,e}function un(e,t){let n=dn(e.month,e.year);if(t<=0)for(;t<=0;)e=ln(e,e.month-1),n=dn(e.month,e.year),t+=n;else if(t>n)for(;t>n;)t-=n,e=ln(e,e.month+1),n=dn(e.month,e.year);return e.day=t,e}function dn(e,t){let n=sn(t);return on[e-1]+(e===13&&n?1:0)}function fn(e){let t=gn(mn(e.year,e.month,e.day));return t.setHours(6,30,3,200),t}function pn(e){return hn(_n(e.getFullYear(),e.getMonth()+1,e.getDate()))}function mn(e,t,n){return e<0&&e++,n+(t-1)*30+(e-1)*365+Math.floor(e/4)+an-1}function hn(e){let t=Math.floor(e)+.5-an,n=Math.floor((t-Math.floor((t+366)/1461))/365)+1;n<=0&&n--,t=Math.floor(e)+.5-mn(n,1,1);let r=Math.floor(t/30)+1,i=t-(r-1)*30+1;return new F(n,r,i)}function gn(e){let t=Math.floor(e+.5),n=Math.floor((t-1867216.25)/36524.25);n=t+1+n-Math.floor(n/4);let r=n+1524,i=Math.floor((r-122.1)/365.25),a=Math.floor(365.25*i),o=Math.floor((r-a)/30.6001),s=r-a-Math.floor(o*30.6001),c=o-(o>13.5?13:1),l=i-(c>2.5?4716:4715);return l<=0&&l--,new Date(l,c,s)}function _n(e,t,n){e<0&&e++,t<3&&(t+=12,e--);let r=Math.floor(e/100),i=2-r+Math.floor(r/4);return Math.floor(365.25*(e+4716))+Math.floor(30.6001*(t+1))+n+i-1524.5}var vn=class extends I{getDaysPerWeek(){return 7}getMonths(e){return[1,2,3,4,5,6,7,8,9,10,11,12,13]}getNext(e,t=`d`,n=1){switch(e=new F(e.year,e.month,e.day),t){case`y`:return e=cn(e,e.year+n),e.month=1,e.day=1,e;case`m`:return e=ln(e,e.month+n),e.day=1,e;case`d`:return un(e,e.day+n);default:return e}}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=Math.floor(mn(e.year,e.month,e.day)+3)%7;return t===0?7:t}getWeekNumber(e,t){t===7&&(t=0);let n=e[(11-t)%7],r=fn(n);r.setDate(r.getDate()+4-(r.getDay()||7));let i=r.getTime(),a=fn(new F(n.year,1,1));return Math.floor(Math.round((i-a.getTime())/864e5)/7)+1}getWeeksPerMonth(){return 6}getToday(){return pn(new Date)}isValid(e){return e&&N(e.year)&&N(e.month)&&N(e.day)&&!isNaN(fn(e).getTime())}},yn=1080,bn=24*yn,xn=12*yn+793,Sn=29*bn+xn,Cn=11*yn+204,wn=2092591,Tn=1721425.5;function R(e){return e%4==0&&e%100!=0||e%400==0}function z(e){let t=Math.floor((235*e-234)/19),n=t*xn+Cn,r=t*29+Math.floor(n/bn),i=n%bn,a=r%7;return(a===2||a===4||a===6)&&(r++,a=r%7),a===1&&i>15*yn+204&&!B(e)?r+=2:a===0&&i>21*yn+589&&B(e-1)&&r++,r}function En(e,t){let n=[31,28,31,30,31,30,31,31,30,31,30,31];return R(t)&&n[1]++,n[e-1]}function Dn(e){return B(e)?13:12}function On(e){return z(e+1)-z(e)}function B(e){if(e!=null){let t=(e*12+17)%19;return t>=(t<0?-7:12)}return!1}function V(e,t){let n=z(t+1)-z(t),r=(n<=380?n:n-30)-353,i=B(t)?[30,29,29,29,30,30,29,30,29,30,29,30,29]:[30,29,29,29,30,29,30,29,30,29,30,29];return r>0&&i[2]++,r>1&&i[1]++,i[e-1]}function kn(e){let t=0;for(let n=1;n<e.month;n++)t+=V(n,e.year);return t+e.day}function An(e,t){let n=t>=0;for(n||(t=-t);t>0;)n?t>Dn(e.year)-e.month?(t-=Dn(e.year)-e.month+1,e.year++,e.month=1):(e.month+=t,t=0):t>=e.month?(e.year--,t-=e.month,e.month=Dn(e.year)):(e.month-=t,t=0);return e}function jn(e,t){let n=t>=0;for(n||(t=-t);t>0;)n?t>On(e.year)-kn(e)?(t-=On(e.year)-kn(e)+1,e.year++,e.month=1,e.day=1):t>V(e.month,e.year)-e.day?(t-=V(e.month,e.year)-e.day+1,e.month++,e.day=1):(e.day+=t,t=0):t>=e.day?(t-=e.day,e.month--,e.month===0&&(e.year--,e.month=Dn(e.year)),e.day=V(e.month,e.year)):(e.day-=t,t=0);return e}function Mn(e){let t=new Date(e),n=t.getFullYear(),r=t.getMonth(),i=t.getDate(),a=Tn-1+365*(n-1)+Math.floor((n-1)/4)-Math.floor((n-1)/100)+Math.floor((n-1)/400)+Math.floor((367*(r+1)-362)/12+(r+1<=2?0:R(n)?-1:-2)+i);a=Math.floor(a+.5);let o=a-347997,s=Math.floor(o*bn/Sn),c=Math.floor((s*19+234)/235)+1,l=z(c),u=o-l;for(;u<1;)c--,l=z(c),u=o-l;let d=1,f=u;for(;f>V(d,c);)f-=V(d,c),d++;return new F(c,d,f)}function Nn(e){let t=e.year,n=e.month,r=e.day,i=z(t);for(let e=1;e<n;e++)i+=V(e,t);i+=r;let a=i-wn,o=a>=0;o||(a=-a);let s=1970,c=1,l=1;for(;a>0;)o?a>=(R(s)?366:365)?(a-=R(s)?366:365,s++):a>=En(c,s)?(a-=En(c,s),c++):(l+=a,a=0):a>=(R(s-1)?366:365)?(a-=R(s-1)?366:365,s--):(c>1?c--:(c=12,s--),a>=En(c,s)?a-=En(c,s):(l=En(c,s)-a+1,a=0));return new Date(s,c-1,l)}function Pn(e){if(!e)return``;let t=[``,`א`,`ב`,`ג`,`ד`,`ה`,`ו`,`ז`,`ח`,`ט`],n=[`י`,`יא`,`יב`,`יג`,`יד`,`טו`,`טז`,`יז`,`יח`,`יט`],r=[``,``,`כ`,`ל`,`מ`,`נ`,`ס`,`ע`,`פ`,`צ`],i=[``,`ק`,`ר`,`ש`,`ת`,`תק`,`תר`,`תש`,`תת`,`תתק`],a=[``,`א`,`ב`,`בא`,`בב`,`ה`,`הא`,`הב`,`הבא`,`הבב`],o=0,s=[],c=0;for(;e>0;){let l=e%10;if(c===0)o=l;else if(c===1)l===1?s.unshift(n[o]):s.unshift(r[l],t[o]);else if(c===2)s.unshift(i[l]);else{l!==5&&s.unshift(a[l],`׳`,` `);break}e=Math.floor(e/10),c===0&&e===0&&s.unshift(t[l]),c++}return s=s.join(``).split(``),s.length===1?s.push(`׳`):s.length>1&&s.splice(s.length-1,0,`״`),s.join(``)}var Fn=[`שני`,`שלישי`,`רביעי`,`חמישי`,`שישי`,`שבת`,`ראשון`],In=[`תשרי`,`חשון`,`כסלו`,`טבת`,`שבט`,`אדר`,`ניסן`,`אייר`,`סיון`,`תמוז`,`אב`,`אלול`],Ln=[`תשרי`,`חשון`,`כסלו`,`טבת`,`שבט`,`אדר א׳`,`אדר ב׳`,`ניסן`,`אייר`,`סיון`,`תמוז`,`אב`,`אלול`],Rn=class extends L{getMonthShortName(e,t){return this.getMonthFullName(e,t)}getMonthFullName(e,t){return B(t)?Ln[e-1]??``:In[e-1]??``}getWeekdayLabel(e){return Fn[e-1]??``}getDayAriaLabel(e){return`${Pn(e.day)} ${this.getMonthFullName(e.month,e.year)} ${Pn(e.year)}`}getDayNumerals(e){return Pn(e.day)}getWeekNumerals(e){return Pn(e)}getYearNumerals(e){return Pn(e)}},zn=class extends I{getDaysPerWeek(){return 7}getMonths(e){return e&&B(e)?[1,2,3,4,5,6,7,8,9,10,11,12,13]:[1,2,3,4,5,6,7,8,9,10,11,12]}getWeeksPerMonth(){return 6}isValid(e){if(e!=null){let t=M(e.year)&&M(e.month)&&M(e.day);return t=t&&e.month>0&&e.month<=(B(e.year)?13:12),t=t&&e.day>0&&e.day<=V(e.month,e.year),t&&!isNaN(Nn(e).getTime())}return!1}getNext(e,t=`d`,n=1){switch(e=new F(e.year,e.month,e.day),t){case`y`:return e.year+=n,e.month=1,e.day=1,e;case`m`:return e=An(e,n),e.day=1,e;case`d`:return jn(e,n);default:return e}}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=Nn(e).getDay();return t===0?7:t}getWeekNumber(e,t){let n=e[e.length-1];return Math.ceil(kn(n)/7)}getToday(){return Mn(new Date)}toGregorian(e){return Yt(Nn(e))}fromGregorian(e){return Mn(Xt(e))}},Bn=class extends I{getDaysPerWeek(){return 7}getMonths(){return[1,2,3,4,5,6,7,8,9,10,11,12]}getWeeksPerMonth(){return 6}getNext(e,t=`d`,n=1){switch(e=new F(e.year,e.month,e.day),t){case`y`:return e=this._setYear(e,e.year+n),e.month=1,e.day=1,e;case`m`:return e=this._setMonth(e,e.month+n),e.day=1,e;case`d`:return this._setDay(e,e.day+n);default:return e}}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=this.toGregorian(e).getDay();return t===0?7:t}getWeekNumber(e,t){t===7&&(t=0);let n=e[(11-t)%7],r=this.toGregorian(n);r.setDate(r.getDate()+4-(r.getDay()||7));let i=r.getTime(),a=this.toGregorian(new F(n.year,1,1));return Math.floor(Math.round((i-a.getTime())/864e5)/7)+1}getToday(){return this.fromGregorian(new Date)}isValid(e){return e!=null&&M(e.year)&&M(e.month)&&M(e.day)&&!isNaN(this.toGregorian(e).getTime())}_setDay(e,t){t=+t;let n=this.getDaysPerMonth(e.month,e.year);if(t<=0)for(;t<=0;)e=this._setMonth(e,e.month-1),n=this.getDaysPerMonth(e.month,e.year),t+=n;else if(t>n)for(;t>n;)t-=n,e=this._setMonth(e,e.month+1),n=this.getDaysPerMonth(e.month,e.year);return e.day=t,e}_setMonth(e,t){return t=+t,e.year+=Math.floor((t-1)/12),e.month=Math.floor(((t-1)%12+12)%12)+1,e}_setYear(e,t){return e.year=+t,e}};function Vn(e){return(14+11*e)%30<11}function Hn(e){let t=e.getFullYear();return t%4==0&&t%100!=0||t%400==0}function Un(e,t){return Math.ceil(29.5*t)+(e-1)*354+Math.floor((3+11*e)/30)}function Wn(e){return(e-1)*354+Math.floor((3+11*e)/30)}function Gn(e,t){return e-t*Math.floor(e/t)}var Kn=1721425.5,qn=1948439.5,Jn=class extends Bn{fromGregorian(e){let t=e.getFullYear(),n=e.getMonth(),r=e.getDate(),i=Kn-1+365*(t-1)+Math.floor((t-1)/4)+-Math.floor((t-1)/100)+Math.floor((t-1)/400)+Math.floor((367*(n+1)-362)/12+(n+1<=2?0:Hn(e)?-1:-2)+r);i=Math.floor(i)+.5;let a=i-qn,o=Math.floor((30*a+10646)/10631),s=Math.ceil((a-29-Wn(o))/29.5);s=Math.min(s,11);let c=Math.ceil(a-Un(o,s))+1;return new F(o,s+1,c)}toGregorian(e){let t=e.year,n=e.month-1,r=e.day+Math.ceil(29.5*n)+(t-1)*354+Math.floor((3+11*t)/30)+qn-1,i=Math.floor(r-.5)+.5,a=i-Kn,o=Math.floor(a/146097),s=Gn(a,146097),c=Math.floor(s/36524),l=Gn(s,36524),u=Math.floor(l/1461),d=Gn(l,1461),f=Math.floor(d/365),p=o*400+c*100+u*4+f;c!==4&&f!==4&&p++;let m=i-(Kn+365*(p-1)+Math.floor((p-1)/4)-Math.floor((p-1)/100)+Math.floor((p-1)/400)),h=i<Kn-1+365*(p-1)+Math.floor((p-1)/4)-Math.floor((p-1)/100)+Math.floor((p-1)/400)+Math.floor(739/12+(Hn(new Date(p,3,1))?-1:-2)+1)?0:Hn(new Date(p,3,1))?1:2,g=Math.floor(((m+h)*12+373)/367),_=i-(Kn-1+365*(p-1)+Math.floor((p-1)/4)-Math.floor((p-1)/100)+Math.floor((p-1)/400)+Math.floor((367*g-362)/12+(g<=2?0:Hn(new Date(p,g-1,1))?-1:-2)+1))+1;return new Date(p,g-1,_)}getDaysPerMonth(e,t){t+=Math.floor(e/13),e=(e-1)%12+1;let n=29+e%2;return e===12&&Vn(t)&&n++,n}},Yn=new Date(1882,10,12),Xn=new Date(2174,10,25),Zn=1300,Qn=1600,$n=864e5,er=`101010101010.110101010100.111011001001.011011010100.011011101010.001101101100.101010101101.010101010101.011010101001.011110010010.101110101001.010111010100.101011011010.010101011100.110100101101.011010010101.011101001010.101101010100.101101101010.010110101101.010010101110.101001001111.010100010111.011010001011.011010100101.101011010101.001011010110.100101011011.010010011101.101001001101.110100100110.110110010101.010110101100.100110110110.001010111010.101001011011.010100101011.101010010101.011011001010.101011101001.001011110100.100101110110.001010110110.100101010110.101011001010.101110100100.101111010010.010111011001.001011011100.100101101101.010101001101.101010100101.101101010010.101110100101.010110110100.100110110110.010101010111.001010010111.010101001011.011010100011.011101010010.101101100101.010101101010.101010101011.010100101011.110010010101.110101001010.110110100101.010111001010.101011010110.100101010111.010010101011.100101001011.101010100101.101101010010.101101101010.010101110101.001001110110.100010110111.010001011011.010101010101.010110101001.010110110100.100111011010.010011011101.001001101110.100100110110.101010101010.110101010100.110110110010.010111010101.001011011010.100101011011.010010101011.101001010101.101101001001.101101100100.101101110001.010110110100.101010110101.101001010101.110100100101.111010010010.111011001001.011011010100.101011101001.100101101011.010010101011.101010010011.110101001001.110110100100.110110110010.101010111001.010010111010.101001011011.010100101011.101010010101.101100101010.101101010101.010101011100.010010111101.001000111101.100100011101.101010010101.101101001010.101101011010.010101101101.001010110110.100100111011.010010011011.011001010101.011010101001.011101010100.101101101010.010101101100.101010101101.010101010101.101100101001.101110010010.101110101001.010111010100.101011011010.010101011010.101010101011.010110010101.011101001001.011101100100.101110101010.010110110101.001010110110.101001010110.111001001101.101100100101.101101010010.101101101010.010110101101.001010101110.100100101111.010010010111.011001001011.011010100101.011010101100.101011010110.010101011101.010010011101.101001001101.110100010110.110110010101.010110101010.010110110101.001011011010.100101011011.010010101101.010110010101.011011001010.011011100100.101011101010.010011110101.001010110110.100101010110.101010101010.101101010100.101111010010.010111011001.001011101010.100101101101.010010101101.101010010101.101101001010.101110100101.010110110010.100110110101.010011010110.101010010111.010101000111.011010010011.011101001001.101101010101.010101101010.101001101011.010100101011.101010001011.110101000110.110110100011.010111001010.101011010110.010011011011.001001101011.100101001011.101010100101.101101010010.101101101001.010101110101.000101110110.100010110111.001001011011.010100101011.010101100101.010110110100.100111011010.010011101101.000101101101.100010110110.101010100110.110101010010.110110101001.010111010100.101011011010.100101011011.010010101011.011001010011.011100101001.011101100010.101110101001.010110110010.101010110101.010101010101.101100100101.110110010010.111011001001.011011010010.101011101001.010101101011.010010101011.101001010101.110100101001.110101010100.110110101010.100110110101.010010111010.101000111011.010010011011.101001001101.101010101010.101011010101.001011011010.100101011101.010001011110.101000101110.110010011010.110101010101.011010110010.011010111001.010010111010.101001011101.010100101101.101010010101.101101010010.101110101000.101110110100.010110111001.001011011010.100101011010.101101001010.110110100100.111011010001.011011101000.101101101010.010101101101.010100110101.011010010101.110101001010.110110101000.110111010100.011011011010.010101011011.001010011101.011000101011.101100010101.101101001010.101110010101.010110101010.101010101110.100100101110.110010001111.010100100111.011010010101.011010101010.101011010110.010101011101.001010011101`.split(`.`);function tr(e,t){let n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),r=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()),i=Math.abs(n-r);return Math.round(i/$n)}var nr=class extends Jn{fromGregorian(e){let t=1,n=0,r=1300,i=tr(e,Yn);if(e.getTime()-Yn.getTime()>=0&&e.getTime()-Xn.getTime()<=0){let e=1300;for(let a=0;a<er.length;a++,e++)for(let o=0;o<12;o++){let s=+er[a][o]+29;if(i<=s)return t=i+1,t>s&&(t=1,o++),o>11&&(o=0,e++),n=o,r=e,new F(r,n+1,t);i-=s}return null}return super.fromGregorian(e)}toGregorian(e){let t=e.year,n=e.month-1,r=e.day,i=new Date(Yn),a=r-1;if(t>=Zn&&t<=Qn){for(let e=0;e<t-Zn;e++)for(let t=0;t<12;t++)a+=+er[e][t]+29;for(let e=0;e<n;e++)a+=+er[t-Zn][e]+29;i.setDate(Yn.getDate()+a)}else i=super.toGregorian(e);return i}getDaysPerMonth(e,t){return t>=Zn&&t<=Qn?+er[t-Zn][e-1]+29:super.getDaysPerMonth(e,t)}};function rr(e){let t=lr(fr(e.year,e.month,e.day));return t.setHours(6,30,3,200),t}function ir(e){return dr(ur(e.getFullYear(),e.getMonth()+1,e.getDate()))}function ar(e,t){return e.year=+t,e}function or(e,t){return t=+t,e.year+=Math.floor((t-1)/12),e.month=Math.floor(((t-1)%12+12)%12)+1,e}function sr(e,t){let n=pr(e.month,e.year);if(t<=0)for(;t<=0;)e=or(e,e.month-1),n=pr(e.month,e.year),t+=n;else if(t>n)for(;t>n;)t-=n,e=or(e,e.month+1),n=pr(e.month,e.year);return e.day=t,e}function H(e,t){return e-t*Math.floor(e/t)}function U(e,t){return Math.trunc(e/t)}function cr(e){let t=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178],n=t.length,r=e+621,i=-14,a=t[0];if(e<a||e>=t[n-1])throw Error(`Invalid Jalali year `+e);let o=0;for(let r=1;r<n;r+=1){let n=t[r];if(o=n-a,e<n)break;i=i+U(o,33)*8+U(H(o,33),4),a=n}let s=e-a;i=i+U(s,33)*8+U(H(s,33)+3,4),H(o,33)===4&&o-s===4&&(i+=1);let c=U(r,4)-U((U(r,100)+1)*3,4)-150,l=20+i-c;o-s<6&&(s=s-o+U(o+4,33)*33);let u=H(H(s+1,33)-1,4);return u===-1&&(u=4),{leap:u,gy:r,march:l}}function lr(e){let t=4*e+139361631;t=t+U(U(4*e+183187720,146097)*3,4)*4-3908;let n=U(H(t,1461),4)*5+308,r=U(H(n,153),5)+1,i=H(U(n,153),12)+1,a=U(t,1461)-100100+U(8-i,6);return new Date(a,i-1,r)}function ur(e,t,n){let r=U((e+U(t-8,6)+100100)*1461,4)+U(153*H(t+9,12)+2,5)+n-34840408;return r=r-U(U(e+100100+U(t-8,6),100)*3,4)+752,r}function dr(e){let t=lr(e).getFullYear(),n=t-621,r=cr(n),i=ur(t,3,r.march),a,o,s;if(s=e-i,s>=0){if(s<=185)return o=1+U(s,31),a=H(s,31)+1,new F(n,o,a);s-=186}else--n,s+=179,r.leap===1&&(s+=1);return o=7+U(s,30),a=H(s,30)+1,new F(n,o,a)}function fr(e,t,n){let r=cr(e);return ur(r.gy,3,r.march)+(t-1)*31-U(t,7)*(t-7)+n-1}function pr(e,t){return e<=6?31:e<=11||cr(t).leap===0?30:29}var mr=class extends I{getDaysPerWeek(){return 7}getMonths(){return[1,2,3,4,5,6,7,8,9,10,11,12]}getWeeksPerMonth(){return 6}getNext(e,t=`d`,n=1){switch(e=new F(e.year,e.month,e.day),t){case`y`:return e=ar(e,e.year+n),e.month=1,e.day=1,e;case`m`:return e=or(e,e.month+n),e.day=1,e;case`d`:return sr(e,e.day+n);default:return e}}getPrev(e,t=`d`,n=1){return this.getNext(e,t,-n)}getWeekday(e){let t=rr(e).getDay();return t===0?7:t}getWeekNumber(e,t){t===7&&(t=0);let n=e[(11-t)%7],r=rr(n);r.setDate(r.getDate()+4-(r.getDay()||7));let i=r.getTime(),a=rr(new F(n.year,1,1));return Math.floor(Math.round((i-a.getTime())/864e5)/7)+1}getToday(){return ir(new Date)}isValid(e){return e!=null&&N(e.year)&&N(e.month)&&N(e.day)&&!isNaN(rr(e).getTime())}};function hr(){return new gr}var W=class{};W=A([u({providedIn:`root`})],W);var gr=class extends W{parse(e){if(e!=null){let t=e.trim().split(`-`);if(t.length===1&&M(t[0]))return{year:j(t[0]),month:null,day:null};if(t.length===2&&M(t[0])&&M(t[1]))return{year:j(t[0]),month:j(t[1]),day:null};if(t.length===3&&M(t[0])&&M(t[1])&&M(t[2]))return{year:j(t[0]),month:j(t[1]),day:j(t[2])}}return null}format(e){return e?`${e.year}-${M(e.month)?At(e.month):``}-${M(e.day)?At(e.day):``}`:``}};gr=A([u()],gr);var _r=`<style>\r
  /* Compiled from ng-bootstrap datepicker*.scss (ViewEncapsulation.None) — inline porque\r
     ngjs-core no soporta \`styleUrl\` (no auto-inyecta CSS de componente). */\r
  ngb-datepicker {\r
    border: 1px solid var(--bs-border-color);\r
    border-radius: 0.25rem;\r
    display: inline-block;\r
  }\r
\r
  ngb-datepicker-month {\r
    pointer-events: auto;\r
  }\r
\r
  ngb-datepicker.dropdown-menu {\r
    padding: 0;\r
  }\r
\r
  ngb-datepicker.disabled .ngb-dp-weekday,\r
  ngb-datepicker.disabled .ngb-dp-week-number,\r
  ngb-datepicker.disabled .ngb-dp-month-name {\r
    color: var(--bs-text-muted);\r
  }\r
\r
  .ngb-dp-body {\r
    z-index: 1055;\r
  }\r
\r
  .ngb-dp-header {\r
    border-bottom: 0;\r
    border-radius: 0.25rem 0.25rem 0 0;\r
    padding-top: 0.25rem;\r
    background-color: var(--bs-tertiary-bg);\r
  }\r
\r
  .ngb-dp-months {\r
    display: flex;\r
  }\r
\r
  .ngb-dp-month {\r
    pointer-events: none;\r
  }\r
\r
  .ngb-dp-month-name {\r
    font-size: larger;\r
    height: 2rem;\r
    line-height: 2rem;\r
    text-align: center;\r
    background-color: var(--bs-tertiary-bg);\r
  }\r
\r
  .ngb-dp-month + .ngb-dp-month .ngb-dp-month-name,\r
  .ngb-dp-month + .ngb-dp-month .ngb-dp-week {\r
    padding-left: 1rem;\r
  }\r
\r
  .ngb-dp-month:last-child .ngb-dp-week {\r
    padding-right: 0.25rem;\r
  }\r
\r
  .ngb-dp-month:first-child .ngb-dp-week {\r
    padding-left: 0.25rem;\r
  }\r
\r
  .ngb-dp-month .ngb-dp-week:last-child {\r
    padding-bottom: 0.25rem;\r
  }\r
\r
  [ngbDatepickerDayView] {\r
    text-align: center;\r
    width: 2rem;\r
    height: 2rem;\r
    line-height: 2rem;\r
    border-radius: 0.25rem;\r
    background: transparent;\r
  }\r
\r
  [ngbDatepickerDayView]:hover:not(.bg-primary),\r
  [ngbDatepickerDayView].active:not(.bg-primary) {\r
    background-color: var(--bs-tertiary-bg);\r
    outline: 1px solid var(--bs-border-color);\r
  }\r
\r
  [ngbDatepickerDayView].outside {\r
    opacity: 0.5;\r
  }\r
\r
  ngb-datepicker-month {\r
    display: block;\r
  }\r
\r
  .ngb-dp-weekday,\r
  .ngb-dp-week-number {\r
    line-height: 2rem;\r
    text-align: center;\r
    font-style: italic;\r
  }\r
\r
  .ngb-dp-weekday {\r
    color: var(--bs-info);\r
  }\r
\r
  .ngb-dp-week {\r
    border-radius: 0.25rem;\r
    display: flex;\r
  }\r
\r
  .ngb-dp-weekdays {\r
    border-bottom: 1px solid var(--bs-border-color);\r
    border-radius: 0;\r
    background-color: var(--bs-tertiary-bg);\r
  }\r
\r
  .ngb-dp-day,\r
  .ngb-dp-weekday,\r
  .ngb-dp-week-number {\r
    width: 2rem;\r
    height: 2rem;\r
  }\r
\r
  .ngb-dp-day {\r
    cursor: pointer;\r
  }\r
\r
  .ngb-dp-day.disabled,\r
  .ngb-dp-day.hidden {\r
    cursor: default;\r
    pointer-events: none;\r
  }\r
\r
  .ngb-dp-day[tabindex="0"] {\r
    z-index: 1;\r
  }\r
\r
  ngb-datepicker-navigation {\r
    display: flex;\r
    align-items: center;\r
  }\r
\r
  .ngb-dp-navigation-chevron {\r
    border-style: solid;\r
    border-width: 0.2em 0.2em 0 0;\r
    display: inline-block;\r
    width: 0.75em;\r
    height: 0.75em;\r
    margin-left: 0.25em;\r
    margin-right: 0.15em;\r
    transform: rotate(-135deg);\r
  }\r
\r
  .ngb-dp-arrow {\r
    display: flex;\r
    flex: 1 1 auto;\r
    padding-right: 0;\r
    padding-left: 0;\r
    margin: 0;\r
    width: 2rem;\r
    height: 2rem;\r
  }\r
\r
  .ngb-dp-arrow-next {\r
    justify-content: flex-end;\r
  }\r
\r
  .ngb-dp-arrow-next .ngb-dp-navigation-chevron {\r
    transform: rotate(45deg);\r
    margin-left: 0.15em;\r
    margin-right: 0.25em;\r
  }\r
\r
  .ngb-dp-arrow-btn {\r
    padding: 0 0.25rem;\r
    margin: 0 0.5rem;\r
    border: none;\r
    background-color: transparent;\r
    z-index: 1;\r
  }\r
\r
  .ngb-dp-arrow-btn:focus {\r
    outline-width: 1px;\r
    outline-style: auto;\r
  }\r
\r
  .ngb-dp-navigation-select {\r
    display: flex;\r
    flex: 1 1 9rem;\r
  }\r
\r
  ngb-datepicker-navigation-select > .form-select {\r
    flex: 1 1 auto;\r
    padding: 0 0.5rem;\r
    font-size: 0.875rem;\r
    height: 1.85rem;\r
  }\r
\r
  ngb-datepicker-navigation-select > .form-select:focus {\r
    z-index: 1;\r
  }\r
\r
  ngb-datepicker-navigation-select > .form-select::-ms-value {\r
    background-color: transparent !important;\r
  }\r
</style>\r
\r
<ng-template\r
  ng-ref="defaultDayTemplate"\r
  let-date="date"\r
  let-current-month="currentMonth"\r
  let-selected="selected"\r
  let-disabled="disabled"\r
  let-focused="focused">\r
  <div\r
    ngb-datepicker-day-view\r
    date="date"\r
    current-month="currentMonth"\r
    selected="selected"\r
    disabled="disabled"\r
    focused="focused"\r
    class="btn btn-light border-0 p-0 text-center rounded-1"\r
    style="width: 2rem; height: 2rem; line-height: 2rem; background: transparent">\r
  </div>\r
</ng-template>\r
\r
<ng-template ng-ref="defaultContentTemplate">\r
  <div\r
    ng-repeat="month in $.model.months track by $index"\r
    class="ngb-dp-month pe-none"\r
    ng-class="{ 'ps-3': !$first, 'ps-1': $first, 'pe-1': $last }">\r
    <div\r
      ng-if="$.navigation === 'none' || ($.displayMonths > 1 && $.navigation === 'select')"\r
      class="ngb-dp-month-name fs-5 text-center bg-body-tertiary"\r
      ng-class="{ 'text-muted': $.model.disabled }"\r
      style="height: 2rem; line-height: 2rem">\r
      {{ $.i18n.getMonthLabel(month.firstDate) }}\r
    </div>\r
    <ngb-datepicker-month class="d-block pe-auto" month="month.firstDate"></ngb-datepicker-month>\r
  </div>\r
</ng-template>\r
\r
<div class="ngb-dp-header pt-1 border-bottom-0 rounded-top bg-body-tertiary">\r
  <ngb-datepicker-navigation\r
    ng-if="$.navigation !== 'none' && $.model"\r
    date="$.model.firstDate"\r
    months="$.model.months"\r
    disabled="$.model.disabled"\r
    show-select="$.model.navigation === 'select'"\r
    prev-disabled="$.model.prevDisabled"\r
    next-disabled="$.model.nextDisabled"\r
    select-boxes="$.model.selectBoxes"\r
    navigate="$.onNavigateEvent($event)"\r
    select="$.onNavigateDateSelect($event)"\r
    class="d-flex align-items-center">\r
  </ngb-datepicker-navigation>\r
</div>\r
\r
<div\r
  class="ngb-dp-content"\r
  ng-class="{ 'ngb-dp-months': !$.contentTemplate, 'd-flex': !$.contentTemplate }"\r
  ng-ref="content">\r
  <ng-template\r
    ng-if="$.model"\r
    ng-template-outlet="$.contentTemplate || $.contentTemplateFromContent || defaultContentTemplate"\r
    ng-template-outlet-context="{ $implicit: $ }">\r
  </ng-template>\r
</div>\r
\r
<ng-template ng-if="$.footerTemplate" ng-template-outlet="$.footerTemplate"></ng-template>\r
<ng-content></ng-content>\r
`;function G(e,t){return!yr(e,t)}function vr(e,t){return!e&&!t?!1:!e||!t||e.year!==t.year||e.month!==t.month}function yr(e,t){return!e&&!t||!!e&&!!t&&e.equals(t)}function br(e,t){if(t&&e&&t.before(e))throw Error(`'maxDate' ${t} should be greater than 'minDate' ${e}`)}function xr(e,t,n){return e&&t&&e.before(t)?t:e&&n&&e.after(n)?n:e||null}function Sr(e,t){let{minDate:n,maxDate:r,disabled:i,markDisabled:a}=t;return!(e==null||i||a&&a(e,{year:e.year,month:e.month})||n&&e.before(n)||r&&e.after(r))}function Cr(e,t,n,r){if(!t)return[];let i=e.getMonths(t.year);if(n&&t.year===n.year){let e=i.findIndex(e=>e===n.month);i=i.slice(e)}if(r&&t.year===r.year){let e=i.findIndex(e=>e===r.month);i=i.slice(0,e+1)}return i}function wr(e,t,n){if(!e)return[];let r=t?Math.max(t.year,e.year-500):e.year-10,i=(n?Math.min(n.year,e.year+500):e.year+10)-r+1,a=Array(i);for(let e=0;e<i;e++)a[e]=r+e;return a}function Tr(e,t,n){let r=Object.assign(e.getNext(t,`m`),{day:1});return n!=null&&r.after(n)}function Er(e,t,n){let r=Object.assign(e.getPrev(t,`m`),{day:1});return n!=null&&(r.year===n.year&&r.month<n.month||r.year<n.year&&n.month===1)}function Dr(e,t,n,r,i){let{displayMonths:a,months:o}=n,s=o.splice(0,o.length);return Array.from({length:a},(n,r)=>{let a=Object.assign(e.getNext(t,`m`,r),{day:1});if(o[r]=null,!i){let e=s.findIndex(e=>e.firstDate.equals(a));e!==-1&&(o[r]=s.splice(e,1)[0])}return a}).forEach((t,i)=>{o[i]??(o[i]=Or(e,t,n,r,s.shift()||{}))}),o}function Or(e,t,n,r,i={}){let{dayTemplateData:a,minDate:o,maxDate:s,firstDayOfWeek:c,markDisabled:l,outsideDays:u,weekdayWidth:d,weekdaysVisible:f}=n,p=e.getToday();i.firstDate=null,i.lastDate=null,i.number=t.month,i.year=t.year,i.weeks=i.weeks||[],i.weekdays=i.weekdays||[],t=kr(e,t,c),f||(i.weekdays.length=0);for(let n=0;n<e.getWeeksPerMonth();n++){let m=i.weeks[n];m||=i.weeks[n]={number:0,days:[],collapsed:!0};let h=m.days;for(let c=0;c<e.getDaysPerWeek();c++){n===0&&f&&(i.weekdays[c]=r.getWeekdayLabel(e.getWeekday(t),d));let u=new F(t.year,t.month,t.day),m=e.getNext(u),g=r.getDayAriaLabel(u),_=!!(o&&u.before(o)||s&&u.after(s));!_&&l&&(_=l(u,{month:i.number,year:i.year}));let ee=u.equals(p),te=a?a(u,{month:i.number,year:i.year}):void 0;i.firstDate===null&&u.month===i.number&&(i.firstDate=u),u.month===i.number&&m.month!==i.number&&(i.lastDate=u);let v=h[c];v||=h[c]={},v.date=u,v.context=Object.assign(v.context||{},{$implicit:u,date:u,data:te,currentMonth:i.number,currentYear:i.year,disabled:_,focused:!1,selected:!1,today:ee}),v.tabindex=-1,v.ariaLabel=g,v.hidden=!1,t=m}m.number=e.getWeekNumber(h.map(e=>e.date),c),m.collapsed=u===`collapsed`&&h[0].date.month!==i.number&&h[h.length-1].date.month!==i.number}return i}function kr(e,t,n){let r=e.getDaysPerWeek(),i=new F(t.year,t.month,1),a=e.getWeekday(i)%r;return e.getPrev(i,`d`,(r+a-n)%r)}var Ar=class{constructor(){this._VALIDATORS={dayTemplateData:e=>{if(this._state.dayTemplateData!==e)return{dayTemplateData:e}},displayMonths:e=>{if(e=j(e),N(e)&&e>0&&this._state.displayMonths!==e)return{displayMonths:e}},disabled:e=>{if(this._state.disabled!==e)return{disabled:e}},firstDayOfWeek:e=>{if(e=j(e),N(e)&&e>=0&&this._state.firstDayOfWeek!==e)return{firstDayOfWeek:e}},focusVisible:e=>{if(this._state.focusVisible!==e&&!this._state.disabled)return{focusVisible:e}},markDisabled:e=>{if(this._state.markDisabled!==e)return{markDisabled:e}},maxDate:e=>{let t=this.toValidDate(e,null);if(G(this._state.maxDate,t))return{maxDate:t}},minDate:e=>{let t=this.toValidDate(e,null);if(G(this._state.minDate,t))return{minDate:t}},navigation:e=>{if(this._state.navigation!==e)return{navigation:e}},outsideDays:e=>{if(this._state.outsideDays!==e)return{outsideDays:e}},weekdays:e=>{let t=e===!0||e===!1?`narrow`:e,n=e===!0||e===!1?e:!0;if(this._state.weekdayWidth!==t||this._state.weekdaysVisible!==n)return{weekdayWidth:t,weekdaysVisible:n}}},this._calendar=w(I),this._i18n=w(L),this._model$=new ne,this._dateSelect$=new ne,this._state={dayTemplateData:null,markDisabled:null,maxDate:null,minDate:null,disabled:!1,displayMonths:1,firstDate:null,firstDayOfWeek:1,lastDate:null,focusDate:null,focusVisible:!1,months:[],navigation:`select`,outsideDays:`visible`,prevDisabled:!1,nextDisabled:!1,selectedDate:null,selectBoxes:{years:[],months:[]},weekdayWidth:`narrow`,weekdaysVisible:!0}}get model$(){return this._model$.pipe(s(e=>e.months.length>0))}get dateSelect$(){return this._dateSelect$.pipe(s(e=>e!==null))}set(e){let t=Object.keys(e).map(t=>this._VALIDATORS[t](e[t])??{}).reduce((e,t)=>({...e,...t}),{});Object.keys(t).length>0&&this._nextState(t)}focus(e){let t=this.toValidDate(e,null);t!=null&&!this._state.disabled&&G(this._state.focusDate,t)&&this._nextState({focusDate:e})}focusSelect(){Sr(this._state.focusDate,this._state)&&this.select(this._state.focusDate,{emitEvent:!0})}open(e){let t=this.toValidDate(e,this._calendar.getToday());t!=null&&!this._state.disabled&&(!this._state.firstDate||vr(this._state.firstDate,t))&&this._nextState({firstDate:t})}select(e,t={}){let n=this.toValidDate(e,null);n!=null&&!this._state.disabled&&(G(this._state.selectedDate,n)&&this._nextState({selectedDate:n}),t.emitEvent&&Sr(n,this._state)&&this._dateSelect$.next(n))}toValidDate(e,t){let n=F.from(e);return t===void 0&&(t=this._calendar.getToday()),this._calendar.isValid(n)?n:t}getMonth(e){for(let t of this._state.months)if(e.month===t.number&&e.year===t.year)return t;throw Error(`month ${e.month} of year ${e.year} not found`)}_nextState(e){let t=this._updateState(e);this._patchContexts(t),this._state=t,this._model$.next(this._state)}_patchContexts(e){let{months:t,displayMonths:n,selectedDate:r,focusDate:i,focusVisible:a,disabled:o,outsideDays:s}=e;e.months.forEach(e=>{e.weeks.forEach(c=>{c.days.forEach(c=>{i&&(c.context.focused=i.equals(c.date)&&a),c.tabindex=!o&&i&&c.date.equals(i)&&i.month===e.number?0:-1,o===!0&&(c.context.disabled=!0),r!==void 0&&(c.context.selected=r!==null&&r.equals(c.date)),e.number!==c.date.month&&(c.hidden=s===`hidden`||s===`collapsed`||n>1&&c.date.after(t[0].firstDate)&&c.date.before(t[n-1].lastDate))})})})}_updateState(e){let t=Object.assign({},this._state,e),n=t.firstDate;if((`minDate`in e||`maxDate`in e)&&(br(t.minDate,t.maxDate),t.focusDate=xr(t.focusDate,t.minDate,t.maxDate),t.firstDate=xr(t.firstDate,t.minDate,t.maxDate),n=t.focusDate),`disabled`in e&&(t.focusVisible=!1),`selectedDate`in e&&this._state.months.length===0&&(n=t.selectedDate),`focusVisible`in e||`focusDate`in e&&(t.focusDate=xr(t.focusDate,t.minDate,t.maxDate),n=t.focusDate,t.months.length!==0&&t.focusDate&&!t.focusDate.before(t.firstDate)&&!t.focusDate.after(t.lastDate)))return t;if(`firstDate`in e&&(t.firstDate=xr(t.firstDate,t.minDate,t.maxDate),n=t.firstDate),n){let r=`dayTemplateData`in e||`firstDayOfWeek`in e||`markDisabled`in e||`minDate`in e||`maxDate`in e||`disabled`in e||`outsideDays`in e||`weekdaysVisible`in e,i=Dr(this._calendar,n,t,this._i18n,r);t.months=i,t.firstDate=i[0].firstDate,t.lastDate=i[i.length-1].lastDate,`selectedDate`in e&&!Sr(t.selectedDate,t)&&(t.selectedDate=null),`firstDate`in e&&(!t.focusDate||t.focusDate.before(t.firstDate)||t.focusDate.after(t.lastDate))&&(t.focusDate=n);let a=!this._state.firstDate||this._state.firstDate.year!==t.firstDate.year,o=!this._state.firstDate||this._state.firstDate.month!==t.firstDate.month;t.navigation===`select`?((`minDate`in e||`maxDate`in e||t.selectBoxes.years.length===0||a)&&(t.selectBoxes.years=wr(t.firstDate,t.minDate,t.maxDate)),(`minDate`in e||`maxDate`in e||t.selectBoxes.months.length===0||a)&&(t.selectBoxes.months=Cr(this._calendar,t.firstDate,t.minDate,t.maxDate))):t.selectBoxes={years:[],months:[]},(t.navigation===`arrows`||t.navigation===`select`)&&(o||a||`minDate`in e||`maxDate`in e||`disabled`in e)&&(t.prevDisabled=t.disabled||Er(this._calendar,t.firstDate,t.minDate),t.nextDisabled=t.disabled||Tr(this._calendar,t.lastDate,t.maxDate))}return t}};Ar=A([u()],Ar);var K=class{constructor(){this.displayMonths=1,this.firstDayOfWeek=1,this.navigation=`select`,this.outsideDays=`visible`,this.showWeekNumbers=!1,this.weekdays=`narrow`}};K=A([u({providedIn:`root`})],K);var jr=class{};jr=A([ce({selector:`ng-template[ngbDatepickerContent]`})],jr);var Mr=(e=>(e[e.PREV=0]=`PREV`,e[e.NEXT=1]=`NEXT`,e))(Mr||{}),Nr=[`dayTemplateData`,`displayMonths`,`markDisabled`,`firstDayOfWeek`,`navigation`,`minDate`,`maxDate`,`outsideDays`,`weekdays`],q=class{constructor(){this.injector=w(a),this._service=w(Ar),this._calendar=w(I),this._i18n=w(L),this._config=w(K),this._nativeElement=w(p).nativeElement,this._ngbDateAdapter=w(P),this._ngZone=w(t),this._destroyRef=w(ee),this._injector=w(a),this._controlValue=null,this._publicState={},this._initialized=!1,this.dayTemplate=this._config.dayTemplate,this.dayTemplateData=this._config.dayTemplateData,this.displayMonths=this._config.displayMonths,this.firstDayOfWeek=this._config.firstDayOfWeek,this.footerTemplate=this._config.footerTemplate,this.markDisabled=this._config.markDisabled,this.maxDate=this._config.maxDate,this.minDate=this._config.minDate,this.navigation=this._config.navigation,this.outsideDays=this._config.outsideDays,this.showWeekNumbers=this._config.showWeekNumbers,this.startDate=this._config.startDate,this.weekdays=this._config.weekdays,this.navigate=new c,this.dateSelect=new c,this.onChange=e=>{},this.onTouched=()=>{};let e=w(te);this._service.dateSelect$.pipe(Se(this._destroyRef)).subscribe(e=>{this.dateSelect.emit(e)}),this._service.model$.pipe(Se(this._destroyRef)).subscribe(t=>{let n=t.firstDate,r=this.model?this.model.firstDate:null;this._publicState={maxDate:t.maxDate,minDate:t.minDate,firstDate:t.firstDate,lastDate:t.lastDate,focusedDate:t.focusDate,months:t.months.map(e=>e.firstDate)};let i=!1;if(!n.equals(r)&&(this.navigate.emit({current:r?{year:r.year,month:r.month}:null,next:{year:n.year,month:n.month},preventDefault:()=>i=!0}),i&&r!==null)){this._service.open(r);return}let a=t.selectedDate,o=t.focusDate,s=this.model?this.model.focusDate:null;this.model=t,G(a,this._controlValue)&&(this._controlValue=a,this.onTouched(),this.onChange(this._ngbDateAdapter.toModel(a))),G(o,s)&&s&&t.focusVisible&&this.focus(),e.markForCheck()})}get _hostDisabled(){return!!this.model?.disabled}get state(){return this._publicState}get calendar(){return this._calendar}get i18n(){return this._i18n}focusDate(e){this._service.focus(F.from(e))}focusSelect(){this._service.focusSelect()}focus(){oe({read:()=>{this._nativeElement.querySelector(`div.ngb-dp-day[tabindex="0"]`)?.focus()}},{injector:this._injector})}navigateTo(e){this._service.open(F.from(e?e.day?e:{...e,day:1}:null))}ngAfterContentInit(){this.dayTemplate||=this._defaultDayTemplate}ngAfterViewInit(){this._ngZone.runOutsideAngular(()=>{let e=T(this._contentEl.nativeElement,`focusin`),t=T(this._contentEl.nativeElement,`focusout`);h(e,t).pipe(s(e=>{let t=e.target,n=e.relatedTarget;return!(t?.classList.contains(`ngb-dp-day`)&&n?.classList.contains(`ngb-dp-day`)&&this._nativeElement.contains(t)&&this._nativeElement.contains(n))}),Se(this._destroyRef)).subscribe(({type:e})=>this._ngZone.run(()=>this._service.set({focusVisible:e===`focusin`})))})}ngOnInit(){if(this.model===void 0){let e={};Nr.forEach(t=>e[t]=this[t]),this._service.set(e),this.navigateTo(this.startDate)}this._initialized=!0}ngOnChanges(e){let t={};if(Nr.filter(t=>t in e).forEach(e=>t[e]=this[e]),this._service.set(t),`startDate`in e&&this._initialized){let{currentValue:t,previousValue:n}=e.startDate;vr(n,t)&&this.navigateTo(this.startDate)}}onDateSelect(e){this._service.focus(e),this._service.select(e,{emitEvent:!0})}onNavigateDateSelect(e){this._service.open(e)}onNavigateEvent(e){switch(e){case 0:this._service.open(this._calendar.getPrev(this.model.firstDate,`m`,1));break;case 1:this._service.open(this._calendar.getNext(this.model.firstDate,`m`,1))}}registerOnChange(e){this.onChange=e}registerOnTouched(e){this.onTouched=e}setDisabledState(e){this._service.set({disabled:e})}writeValue(e){this._controlValue=F.from(this._ngbDateAdapter.fromModel(e)),this._service.select(this._controlValue)}};A([n(`defaultDayTemplate`,{static:!0})],q.prototype,`_defaultDayTemplate`,2),A([n(`content`,{read:p,static:!0})],q.prototype,`_contentEl`,2),A([x()],q.prototype,`contentTemplate`,2),A([g(jr,{read:d,static:!0})],q.prototype,`contentTemplateFromContent`,2),A([x()],q.prototype,`dayTemplate`,2),A([x()],q.prototype,`dayTemplateData`,2),A([x()],q.prototype,`displayMonths`,2),A([x()],q.prototype,`firstDayOfWeek`,2),A([x()],q.prototype,`footerTemplate`,2),A([x()],q.prototype,`markDisabled`,2),A([x()],q.prototype,`maxDate`,2),A([x()],q.prototype,`minDate`,2),A([x()],q.prototype,`navigation`,2),A([x()],q.prototype,`outsideDays`,2),A([x()],q.prototype,`showWeekNumbers`,2),A([x()],q.prototype,`startDate`,2),A([x()],q.prototype,`weekdays`,2),A([C()],q.prototype,`navigate`,2),A([C()],q.prototype,`dateSelect`,2),A([y(`class.disabled`)],q.prototype,`_hostDisabled`,1),q=A([S({exportAs:`ngbDatepicker`,selector:`ngb-datepicker`,controllerAs:`$`,template:_r,transclude:!0,providers:[{provide:m,useExisting:i(()=>q),multi:!0},Ar]})],q);var J=class{constructor(){this.i18n=w(L),this._btnLight=!0}get _bgPrimary(){return this.selected}get _textWhite(){return this.selected}get _textMuted(){return this.isMuted()}get _outside(){return this.isMuted()}get _active(){return this.focused}isMuted(){return!this.selected&&(this.date.month!==this.currentMonth||this.disabled)}};A([x()],J.prototype,`currentMonth`,2),A([x()],J.prototype,`date`,2),A([x()],J.prototype,`disabled`,2),A([x()],J.prototype,`focused`,2),A([x()],J.prototype,`selected`,2),A([y(`class.btn-light`)],J.prototype,`_btnLight`,2),A([y(`class.bg-primary`)],J.prototype,`_bgPrimary`,1),A([y(`class.text-white`)],J.prototype,`_textWhite`,1),A([y(`class.text-muted`)],J.prototype,`_textMuted`,1),A([y(`class.outside`)],J.prototype,`_outside`,1),A([y(`class.active`)],J.prototype,`_active`,1),J=A([S({selector:`[ngbDatepickerDayView]`,controllerAs:`$`,template:`{{ $.i18n.getDayNumerals($.date) }}`})],J);var Pr=class{processKey(e,t){let{state:n,calendar:r}=t;switch(e.key){case`PageUp`:t.focusDate(r.getPrev(n.focusedDate,e.shiftKey?`y`:`m`,1));break;case`PageDown`:t.focusDate(r.getNext(n.focusedDate,e.shiftKey?`y`:`m`,1));break;case`End`:t.focusDate(e.shiftKey?n.maxDate:n.lastDate);break;case`Home`:t.focusDate(e.shiftKey?n.minDate:n.firstDate);break;case`ArrowLeft`:t.focusDate(r.getPrev(n.focusedDate,`d`,1));break;case`ArrowUp`:t.focusDate(r.getPrev(n.focusedDate,`d`,r.getDaysPerWeek()));break;case`ArrowRight`:t.focusDate(r.getNext(n.focusedDate,`d`,1));break;case`ArrowDown`:t.focusDate(r.getNext(n.focusedDate,`d`,r.getDaysPerWeek()));break;case`Enter`:case` `:t.focusSelect();break;default:return}e.preventDefault(),e.stopPropagation()}};Pr=A([u({providedIn:`root`})],Pr);var Fr=`<div\r
  ng-if="$.viewModel.weekdays.length"\r
  class="ngb-dp-week ngb-dp-weekdays d-flex rounded-0 border-bottom bg-body-tertiary"\r
  role="row">\r
  <div\r
    ng-if="$.datepicker.showWeekNumbers"\r
    class="ngb-dp-weekday ngb-dp-showweek small fst-italic text-center"\r
    ng-class="{ 'text-muted': $.datepicker.model.disabled }"\r
    style="width: 2rem; height: 2rem; line-height: 2rem">\r
    {{ $.datepicker.i18n.getWeekLabel() }}\r
  </div>\r
  <div\r
    ng-repeat="weekday in $.viewModel.weekdays track by $index"\r
    class="ngb-dp-weekday small fst-italic text-center text-info"\r
    ng-class="{ 'text-muted': $.datepicker.model.disabled }"\r
    style="width: 2rem; height: 2rem; line-height: 2rem"\r
    role="columnheader">\r
    {{ weekday }}\r
  </div>\r
</div>\r
\r
<div\r
  ng-repeat="week in $.viewModel.weeks track by $index"\r
  ng-if="!week.collapsed"\r
  class="ngb-dp-week d-flex rounded-1"\r
  ng-class="{ 'pb-1': $last }"\r
  role="row">\r
  <div\r
    ng-if="$.datepicker.showWeekNumbers"\r
    class="ngb-dp-week-number small text-muted fst-italic text-center"\r
    style="width: 2rem; height: 2rem; line-height: 2rem">\r
    {{ $.datepicker.i18n.getWeekNumerals(week.number) }}\r
  </div>\r
  <div\r
    ng-repeat="day in week.days track by day.date.year + '-' + day.date.month + '-' + day.date.day"\r
    ng-click="$.doSelect(day); $event.preventDefault()"\r
    class="ngb-dp-day"\r
    style="width: 2rem; height: 2rem; cursor: pointer"\r
    ng-style="{ cursor: day.context.disabled || day.hidden ? 'default' : 'pointer' }"\r
    ng-class="{ disabled: day.context.disabled, hidden: day.hidden, invisible: day.hidden, 'pe-none': day.context.disabled || day.hidden, 'z-1': day.tabindex === 0, 'ngb-dp-today': day.context.today }"\r
    role="gridcell"\r
    ng-attr-tabindex="{{ day.tabindex }}"\r
    ng-attr-aria-label="{{ day.ariaLabel }}"\r
    ng-attr-aria-disabled="{{ day.context.disabled }}"\r
    ng-attr-aria-selected="{{ day.context.selected }}">\r
    <ng-template\r
      ng-if="!day.hidden"\r
      ng-template-outlet="$.datepicker.dayTemplate"\r
      ng-template-outlet-context="day.context">\r
    </ng-template>\r
  </div>\r
</div>\r
`,Y=class{constructor(){this._keyboardService=w(Pr),this._service=w(Ar),this.i18n=w(L),this.datepicker=w(i(()=>q)),this.role=`grid`}set month(e){this.viewModel=this._service.getMonth(e)}onKeyDown(e){this._keyboardService.processKey(e,this.datepicker)}doSelect(e){!e.context.disabled&&!e.hidden&&this.datepicker.onDateSelect(e.date)}};A([y(`attr.role`)],Y.prototype,`role`,2),A([x()],Y.prototype,`month`,1),A([_(`keydown`,[`$event`])],Y.prototype,`onKeyDown`,1),Y=A([S({selector:`ngb-datepicker-month`,controllerAs:`$`,template:Fr})],Y);var Ir=`<div class="ngb-dp-arrow ngb-dp-arrow-prev d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem">\r
  <button\r
    type="button"\r
    class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0"\r
    ng-click="$.onClickPrev($event)"\r
    ng-disabled="$.prevDisabled"\r
    i18n-aria-label="@@ngb.datepicker.previous-month"\r
    aria-label="Previous month"\r
    i18n-title="@@ngb.datepicker.previous-month"\r
    title="Previous month">\r
    <span\r
      class="ngb-dp-navigation-chevron d-inline-block"\r
      style="width: .75em; height: .75em; margin-right: .15em; margin-left: .25em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(-135deg)">\r
    </span>\r
  </button>\r
</div>\r
\r
<ngb-datepicker-navigation-select\r
  ng-if="$.showSelect"\r
  class="ngb-dp-navigation-select d-flex flex-grow-1"\r
  style="flex-basis: 9rem"\r
  date="$.date"\r
  disabled="$.disabled"\r
  months="$.selectBoxes.months"\r
  years="$.selectBoxes.years"\r
  select="$.select.emit($event)">\r
</ngb-datepicker-navigation-select>\r
\r
<ng-container ng-if="!$.showSelect">\r
  <ng-container ng-repeat="month in $.months track by $index">\r
    <div ng-if="$index > 0" class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0" style="width: 2rem; height: 2rem"></div>\r
    <div\r
      class="ngb-dp-month-name fs-5 text-center"\r
      ng-class="{ 'text-muted': $.disabled }"\r
      style="height: 2rem; line-height: 2rem">\r
      {{ $.i18n.getMonthLabel(month.firstDate) }}\r
    </div>\r
    <div\r
      ng-if="$index !== $.months.length - 1"\r
      class="ngb-dp-arrow d-flex flex-grow-1 p-0 m-0"\r
      style="width: 2rem; height: 2rem">\r
    </div>\r
  </ng-container>\r
</ng-container>\r
\r
<div class="visually-hidden" aria-live="polite">\r
  <span ng-repeat="month in $.months track by $index">{{ $.i18n.getMonthLabel(month.firstDate) }}</span>\r
</div>\r
\r
<div\r
  class="ngb-dp-arrow ngb-dp-arrow-next d-flex flex-grow-1 justify-content-end p-0 m-0"\r
  style="width: 2rem; height: 2rem">\r
  <button\r
    type="button"\r
    class="btn btn-link ngb-dp-arrow-btn z-1 py-0 px-1 mx-2 my-0 bg-transparent border-0"\r
    ng-click="$.onClickNext($event)"\r
    ng-disabled="$.nextDisabled"\r
    i18n-aria-label="@@ngb.datepicker.next-month"\r
    aria-label="Next month"\r
    i18n-title="@@ngb.datepicker.next-month"\r
    title="Next month">\r
    <span\r
      class="ngb-dp-navigation-chevron d-inline-block"\r
      style="width: .75em; height: .75em; margin-right: .25em; margin-left: .15em; border-style: solid; border-width: .2em .2em 0 0; transform: rotate(45deg)">\r
    </span>\r
  </button>\r
</div>\r
`,X=class{constructor(){this.navigation=Mr,this.i18n=w(L),this.months=[],this.navigate=new c,this.select=new c}onClickPrev(e){e.currentTarget.focus(),this.navigate.emit(this.navigation.PREV)}onClickNext(e){e.currentTarget.focus(),this.navigate.emit(this.navigation.NEXT)}idMonth(e){return e}};A([x()],X.prototype,`date`,2),A([x()],X.prototype,`disabled`,2),A([x()],X.prototype,`months`,2),A([x()],X.prototype,`showSelect`,2),A([x()],X.prototype,`prevDisabled`,2),A([x()],X.prototype,`nextDisabled`,2),A([x()],X.prototype,`selectBoxes`,2),A([C()],X.prototype,`navigate`,2),A([C()],X.prototype,`select`,2),X=A([S({selector:`ngb-datepicker-navigation`,controllerAs:`$`,template:Ir})],X);var Lr=`<select\r
  ng-disabled="$.disabled"\r
  ng-model="$.selectedMonth"\r
  ng-change="$.changeMonth($.selectedMonth)"\r
  class="form-select flex-grow-1 py-0 px-2 small"\r
  style="height: 1.85rem"\r
  i18n-aria-label="@@ngb.datepicker.select-month"\r
  aria-label="Select month"\r
  i18n-title="@@ngb.datepicker.select-month"\r
  title="Select month">\r
  <option\r
    ng-repeat="month in $.months track by month"\r
    ng-value="month"\r
    ng-attr-aria-label="{{ $.i18n.getMonthFullName(month, $.date.year) }}">\r
    {{ $.i18n.getMonthShortName(month, $.date.year) }}\r
  </option>\r
</select>\r
<select\r
  ng-disabled="$.disabled"\r
  ng-model="$.selectedYear"\r
  ng-change="$.changeYear($.selectedYear)"\r
  class="form-select flex-grow-1 py-0 px-2 small"\r
  style="height: 1.85rem"\r
  i18n-aria-label="@@ngb.datepicker.select-year"\r
  aria-label="Select year"\r
  i18n-title="@@ngb.datepicker.select-year"\r
  title="Select year">\r
  <option ng-repeat="year in $.years track by year" ng-value="year">\r
    {{ $.i18n.getYearNumerals(year) }}\r
  </option>\r
</select>\r
`,Z=class{constructor(){this.i18n=w(L),this.months=[],this.years=[],this.select=new c,this.selectedMonth=0,this.selectedYear=0}ngOnInit(){this._syncSelection()}ngOnChanges(){this._syncSelection()}changeMonth(e){this.select.emit(new F(this.date.year,j(e),1))}changeYear(e){this.select.emit(new F(j(e),this.date.month,1))}_syncSelection(){this.date&&(this.selectedMonth=this.date.month,this.selectedYear=this.date.year)}};A([x()],Z.prototype,`date`,2),A([x()],Z.prototype,`disabled`,2),A([x()],Z.prototype,`months`,2),A([x()],Z.prototype,`years`,2),A([C()],Z.prototype,`select`,2),Z=A([S({selector:`ngb-datepicker-navigation-select`,controllerAs:`$`,template:Lr})],Z);var Q=class extends K{constructor(){super(...arguments),this.autoClose=!0,this.container=null,this.placement=[`bottom-start`,`bottom-end`,`top-start`,`top-end`],this.popperOptions=e=>e,this.restoreFocus=!0}};Q=A([u({providedIn:`root`})],Q);var $=class{constructor(){this._parserFormatter=w(W),this._elRef=w(p),this._vcRef=w(ie),this._ngZone=w(t),this._calendar=w(I),this._dateAdapter=w(P),this._document=w(b),this._changeDetector=w(te),this._injector=w(a),this._config=w(Q),this._cRef=null,this._disabled=!1,this._elWithFocus=null,this._model=null,this._positioning=Ot(),this._destroyCloseHandlers$=new ne,this.autoClose=this._config.autoClose,this.placement=this._config.placement,this.popperOptions=this._config.popperOptions,this.container=this._config.container,this.positionTarget=this._config.positionTarget,this.dateSelect=new c,this.navigate=new c,this.closed=new c,this._ngDisabled=w(se,{optional:!0}),this._onChange=e=>{},this._onTouched=()=>{},this._validatorChange=()=>{}}get _hostDisabled(){return this._disabled}get disabled(){return this._disabled}set disabled(e){this._disabled=e===``||e&&e!==`false`,this.isOpen()&&this._cRef.instance.setDisabledState(this._disabled)}registerOnChange(e){this._onChange=e}registerOnTouched(e){this._onTouched=e}registerOnValidatorChange(e){this._validatorChange=e}setDisabledState(e){this.disabled=e}validate(e){let{value:t}=e;if(t!=null){let e=this._fromDateStruct(this._dateAdapter.fromModel(t));if(!e)return{ngbDate:{invalid:t}};if(this.minDate&&e.before(F.from(this.minDate)))return{ngbDate:{minDate:{minDate:this.minDate,actual:t}}};if(this.maxDate&&e.after(F.from(this.maxDate)))return{ngbDate:{maxDate:{maxDate:this.maxDate,actual:t}}}}return null}writeValue(e){this._model=this._fromDateStruct(this._dateAdapter.fromModel(e)),this._writeModelValue(this._model)}_handleInput(e){this.manualDateChange(e.target.value)}_handleChange(e){this.manualDateChange(e.target.value,!0)}manualDateChange(e,t=!1){let n=e!==this._inputValue;n&&(this._inputValue=e,this._model=this._fromDateStruct(this._parserFormatter.parse(e))),(n||!t)&&this._onChange(this._model?this._dateAdapter.toModel(this._model):e===``?null:e),t&&this._model&&this._writeModelValue(this._model)}isOpen(){return!!this._cRef}async open(){if(!this.isOpen()){this._cRef=await this._vcRef.createComponent(q,{injector:this._injector}),this._applyPopupStyling(this._cRef.location.nativeElement),this._applyDatepickerInputs(this._cRef),this._subscribeForDatepickerOutputs(this._cRef.instance),this._cRef.instance.ngOnInit(),this._cRef.instance.writeValue(this._dateAdapter.toModel(this._model)),this._cRef.instance.registerOnChange(e=>{this.writeValue(e),this._onChange(e),this._onTouched()}),this._cRef.changeDetectorRef.detectChanges(),this._cRef.instance.setDisabledState(this.disabled),this.container===`body`&&this._document.querySelector(this.container)?.appendChild(this._cRef.location.nativeElement),this._elWithFocus=this._document.activeElement,zt(this._ngZone,this._cRef.location.nativeElement,this.closed,!0),setTimeout(()=>this._cRef?.instance.focus());let e;if(e=kt(this.positionTarget)?this._document.querySelector(this.positionTarget):this.positionTarget instanceof HTMLElement?this.positionTarget:this._elRef.nativeElement,this.positionTarget&&!e)throw Error(`ngbDatepicker could not find element declared in [positionTarget] to position against.`);this._ngZone.runOutsideAngular(()=>{this._cRef&&e&&(this._positioning.createPopper({hostElement:e,targetElement:this._cRef.location.nativeElement,placement:this.placement,updatePopperOptions:e=>this.popperOptions(Bt([0,2])(e))}),this._afterRenderRef=v({mixedReadWrite:()=>{this._positioning.update()}},{injector:this._injector}))}),this._setCloseHandlers()}}close(){if(this.isOpen()){this._cRef?.destroy(),this._cRef=null,this._positioning.destroy(),this._afterRenderRef?.destroy(),this._destroyCloseHandlers$.next(),this.closed.emit(),this._changeDetector.markForCheck();let e=this._elWithFocus;kt(this.restoreFocus)?e=this._document.querySelector(this.restoreFocus):this.restoreFocus!==void 0&&(e=this.restoreFocus),e&&e.focus?e.focus():this._document.body.focus()}}toggle(){this.isOpen()?this.close():this.open()}navigateTo(e){this.isOpen()&&this._cRef.instance.navigateTo(e)}onBlur(){this._onTouched()}onFocus(){this._elWithFocus=this._elRef.nativeElement}ngAfterViewInit(){this._ngModelCtrl&&(this._ngModelCtrl.$validators.ngbDate=e=>this.validate({value:e})===null,this.registerOnValidatorChange(()=>this._ngModelCtrl?.$validate())),this._ngDisabled&&(this.setDisabledState(this._ngDisabled.disabled),this._ngDisabled.onChange(e=>this.setDisabledState(e)))}ngOnChanges(e){if((e.minDate||e.maxDate)&&(this._validatorChange(),this.isOpen()&&(e.minDate&&this._cRef.setInput(`minDate`,this.minDate),e.maxDate&&this._cRef.setInput(`maxDate`,this.maxDate))),e.datepickerClass){let{currentValue:t,previousValue:n}=e.datepickerClass;this._applyPopupClass(t,n)}e.autoClose&&this.isOpen()&&this._setCloseHandlers()}ngOnDestroy(){this.close()}_applyDatepickerInputs(e){[`contentTemplate`,`dayTemplate`,`dayTemplateData`,`displayMonths`,`firstDayOfWeek`,`footerTemplate`,`markDisabled`,`minDate`,`maxDate`,`navigation`,`outsideDays`,`showNavigation`,`showWeekNumbers`,`weekdays`].forEach(t=>{this[t]!==void 0&&e.setInput(t,this[t])}),e.setInput(`startDate`,this.startDate||this._model)}_applyPopupClass(e,t){let n=this._cRef?.location.nativeElement;n&&(e&&n.classList.add(e),t&&n.classList.remove(t))}_applyPopupStyling(e){e.classList.add(`dropdown-menu`,`show`),this.container===`body`&&e.classList.add(`ngb-dp-body`),this._applyPopupClass(this.datepickerClass)}_subscribeForDatepickerOutputs(e){e.navigate.subscribe(e=>this.navigate.emit(e)),e.dateSelect.subscribe(e=>{this.dateSelect.emit(e),(this.autoClose===!0||this.autoClose===`inside`)&&this.close()})}_writeModelValue(e){let t=this._parserFormatter.format(e);this._inputValue=t,this._elRef.nativeElement.value=t,this.isOpen()&&(this._cRef.instance.writeValue(this._dateAdapter.toModel(e)),this._onTouched())}_fromDateStruct(e){let t=e?new F(e.year,e.month,e.day):null;return this._calendar.isValid(t)?t:null}_setCloseHandlers(){this._destroyCloseHandlers$.next(),It(this._ngZone,this._document,this.autoClose,()=>this.close(),this._destroyCloseHandlers$,[],[this._elRef.nativeElement,this._cRef.location.nativeElement])}};A([x()],$.prototype,`autoClose`,2),A([x()],$.prototype,`contentTemplate`,2),A([x({binding:`@`})],$.prototype,`datepickerClass`,2),A([x()],$.prototype,`dayTemplate`,2),A([x()],$.prototype,`dayTemplateData`,2),A([x()],$.prototype,`displayMonths`,2),A([x()],$.prototype,`firstDayOfWeek`,2),A([x()],$.prototype,`footerTemplate`,2),A([x()],$.prototype,`markDisabled`,2),A([x()],$.prototype,`minDate`,2),A([x()],$.prototype,`maxDate`,2),A([x({binding:`@`})],$.prototype,`navigation`,2),A([x({binding:`@`})],$.prototype,`outsideDays`,2),A([x()],$.prototype,`placement`,2),A([x()],$.prototype,`popperOptions`,2),A([x()],$.prototype,`restoreFocus`,2),A([x()],$.prototype,`showWeekNumbers`,2),A([x()],$.prototype,`startDate`,2),A([x({binding:`@`})],$.prototype,`container`,2),A([x()],$.prototype,`positionTarget`,2),A([x()],$.prototype,`weekdays`,2),A([C()],$.prototype,`dateSelect`,2),A([C()],$.prototype,`navigate`,2),A([C()],$.prototype,`closed`,2),A([y(`disabled`)],$.prototype,`_hostDisabled`,1),A([_(`input`,[`$event`])],$.prototype,`_handleInput`,1),A([_(`change`,[`$event`])],$.prototype,`_handleChange`,1),$=A([ce({selector:`input[ngbDatepicker]`,exportAs:`ngbDatepicker`,require:{_ngModelCtrl:`?ngModel`},providers:[{provide:m,useExisting:i(()=>$),multi:!0},{provide:K,useExisting:Q}]})],$);var Rr=class{constructor(){this._element=document.documentElement}isRTL(){return(this._element.getAttribute(`dir`)||``).toLowerCase()===`rtl`}static get $inject(){return[]}static get $name(){return`ngb.rtl.service`}},zr=[q,jr,$,Y,X,Z,J],Br=class{};Br=A([f({id:`ngb.datepicker`,controllerAs:`$`,imports:[be,pt],declarations:zr,providers:[Rr,K,Q,Pr,{provide:I,useFactory:Zt},{provide:P,useFactory:Gt},{provide:W,useFactory:hr},{provide:L,useClass:en}]})],Br);export{Jn as a,P as c,L as d,rn as f,Q as h,zn as i,W as l,Br as m,vn as n,nr as o,Rn as p,Qt as r,mr as s,$t as t,K as u};