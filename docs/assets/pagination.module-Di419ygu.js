const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/pagination-examples-page.component-BPljVXjf.js","assets/decorate-DwQZkZoC.js","assets/rolldown-runtime-hePW80VL.js","assets/pagination-examples-page-DTW1WprU.css","assets/pagination-api-page.component-BSMvP9-g.js","assets/pagination-api-page-CF40zYeq.css"])))=>i.map(i=>d[i]);
import{E as e,K as t,St as n,Tt as r,_ as i,i as a,kt as o,n as s,o as c,r as l,s as u,t as d,u as f,w as p,x as m,xt as h}from"./decorate-DwQZkZoC.js";import{a as g,t as _}from"./preload-helper-xnC4gL7e.js";import{r as ee}from"./nav-CkU84aaH.js";import{t as v}from"./chunk-5K2ZIVXR-DiaMPVO_.js";import"./common-DYSR_6bS.js";import{m as y,p as b}from"./index-CLOsrUF-.js";import{t as x}from"./collapse-wM2ZSCYr.js";var S=Object.defineProperty,C=Object.getOwnPropertyDescriptor,w=(e,t,n,r)=>{for(var i=r>1?void 0:r?C(t,n):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,n,i):o(i))||i);return r&&i&&S(t,n,i),i},T=class{};T=w([h({selector:`ng-template[ngbPaginationEllipsis]`})],T);var E=class{};E=w([h({selector:`ng-template[ngbPaginationFirst]`})],E);var D=class{};D=w([h({selector:`ng-template[ngbPaginationLast]`})],D);var O=class{};O=w([h({selector:`ng-template[ngbPaginationNext]`})],O);var k=class{};k=w([h({selector:`ng-template[ngbPaginationNumber]`})],k);var A=class{};A=w([h({selector:`ng-template[ngbPaginationPrevious]`})],A);var j=class{};j=w([h({selector:`ng-template[ngbPaginationPages]`})],j);var M=class{constructor(){this._element=f(s).documentElement}isRTL(){return(this._element.getAttribute(`dir`)||``).toLowerCase()===`rtl`}};M=w([e()],M);function N(e){return parseInt(`${e}`,10)}function P(e,t,n=0){return Math.max(Math.min(e,t),n)}function F(e){return!isNaN(N(e))}typeof navigator<`u`&&navigator.userAgent&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints&&navigator.maxTouchPoints>2||/Android/.test(navigator.userAgent)),[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`[contenteditable]`,`[tabindex]:not([tabindex="-1"])`].join(`, `);var I=class{constructor(){this._document=f(s)}hide(){let e=Math.abs(window.innerWidth-this._document.documentElement.clientWidth),t=this._document.body,n=t.style,{overflow:r,paddingRight:i}=n;return e>0&&(n.paddingRight=`${parseFloat(window.getComputedStyle(t).paddingRight)+e}px`),n.overflow=`hidden`,()=>{e>0&&(n.paddingRight=i),n.overflow=r}}};I=w([e()],I);var te=new o(`live announcer delay`,{providedIn:`root`,factory:()=>100});function L(e,t=!1){let n=e.body.querySelector(`#ngb-live`);return n==null&&t&&(n=e.createElement(`div`),n.setAttribute(`id`,`ngb-live`),n.setAttribute(`aria-live`,`polite`),n.setAttribute(`aria-atomic`,`true`),n.classList.add(`visually-hidden`),e.body.appendChild(n)),n}var R=class{constructor(){this._document=f(s),this._delay=f(te)}ngOnDestroy(){let e=L(this._document);e&&e.parentElement.removeChild(e)}say(e){let t=L(this._document,!0),n=this._delay;if(t!=null){t.textContent=``;let r=()=>t.textContent=e;n===null?r():setTimeout(r,n)}}};R=w([e()],R);var z=`<ng-template ng-ref="first">\r
    <span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span>\r
</ng-template>\r
\r
<ng-template ng-ref="previous">\r
    <span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span>\r
</ng-template>\r
\r
<ng-template ng-ref="next">\r
    <span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span>\r
</ng-template>\r
\r
<ng-template ng-ref="last">\r
    <span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span>\r
</ng-template>\r
\r
<ng-template ng-ref="ellipsis">...</ng-template>\r
\r
<ng-template ng-ref="defaultNumber" let-page let-currentPage="currentPage">\r
    {{ page }}\r
</ng-template>\r
\r
<ul class="pagination" ng-class="$.size ? 'pagination-' + $.size : null">\r
    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">\r
        <a\r
                aria-label="First"\r
                i18n-aria-label="@@ngb.pagination.first-aria"\r
                class="page-link"\r
                href\r
                ng-click="$.selectPage(1); $event.preventDefault()"\r
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"\r
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">\r
            <ng-template\r
                    ng-template-outlet="($.tplFirst && $.tplFirst.templateRef) || first"\r
                    ng-template-outlet-context="{ disabled: $.previousDisabled(), currentPage: $.page }">\r
            </ng-template>\r
        </a>\r
    </li>\r
\r
    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">\r
        <a\r
                aria-label="Previous"\r
                i18n-aria-label="@@ngb.pagination.previous-aria"\r
                class="page-link"\r
                href\r
                ng-click="$.selectPage($.page - 1); $event.preventDefault()"\r
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"\r
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">\r
            <ng-template\r
                    ng-template-outlet="($.tplPrevious && $.tplPrevious.templateRef) || previous"\r
                    ng-template-outlet-context="{ disabled: $.previousDisabled() }">\r
            </ng-template>\r
        </a>\r
    </li>\r
\r
    <li\r
            ng-repeat="pageNumber in ($.tplPages ? [] : $.pages) track by $index"\r
            class="page-item"\r
            ng-class="{ 'active': pageNumber === $.page, 'disabled': $.isEllipsis(pageNumber) || $.isDisabled() }">\r
        <a ng-if="$.isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">\r
            <ng-template\r
                    ng-template-outlet="($.tplEllipsis && $.tplEllipsis.templateRef) || ellipsis"\r
                    ng-template-outlet-context="{ disabled: true, currentPage: $.page }">\r
            </ng-template>\r
        </a>\r
\r
        <a\r
                ng-if="!$.isEllipsis(pageNumber)"\r
                class="page-link"\r
                href\r
                ng-click="$.selectPage(pageNumber); $event.preventDefault()"\r
                ng-attr-tabindex="{{ $.isDisabled() ? '-1' : undefined }}"\r
                ng-attr-aria-disabled="{{ $.isDisabled() ? 'true' : undefined }}"\r
                ng-attr-aria-current="{{ pageNumber === $.page ? 'page' : undefined }}">\r
            <ng-template\r
                    ng-template-outlet="($.tplNumber && $.tplNumber.templateRef) || defaultNumber"\r
                    ng-template-outlet-context="{ disabled: $.isDisabled(), $implicit: pageNumber, currentPage: $.page }">\r
            </ng-template>\r
        </a>\r
    </li>\r
\r
    <ng-template\r
            ng-if="$.tplPages"\r
            ng-template-outlet="$.tplPages.templateRef"\r
            ng-template-outlet-context="{ $implicit: $.page, pages: $.pages, disabled: $.isDisabled() }">\r
    </ng-template>\r
\r
    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">\r
        <a\r
                aria-label="Next"\r
                i18n-aria-label="@@ngb.pagination.next-aria"\r
                class="page-link"\r
                href\r
                ng-click="$.selectPage($.page + 1); $event.preventDefault()"\r
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"\r
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}">\r
            <ng-template\r
                    ng-template-outlet="($.tplNext && $.tplNext.templateRef) || next"\r
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">\r
            </ng-template>\r
        </a>\r
    </li>\r
\r
    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">\r
        <a\r
                aria-label="Last"\r
                i18n-aria-label="@@ngb.pagination.last-aria"\r
                class="page-link"\r
                href\r
                ng-click="$.selectPage($.pageCount); $event.preventDefault()"\r
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"\r
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}"\r
        >\r
            <ng-template\r
                    ng-template-outlet="($.tplLast && $.tplLast.templateRef) || last"\r
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">\r
            </ng-template>\r
        </a>\r
    </li>\r
</ul>\r
`,B=class{constructor(){this.disabled=!1,this.boundaryLinks=!1,this.directionLinks=!0,this.ellipses=!0,this.maxSize=0,this.pageSize=10,this.rotate=!1}};B=w([e({id:`ngb.pagination.config.service`})],B);var V=class{constructor(){this._config=f(B),this._ngDisabled=f(p,{optional:!0}),this.pageCount=0,this.pages=[],this.disabled=this._config.disabled,this.boundaryLinks=this._config.boundaryLinks,this.directionLinks=this._config.directionLinks,this.ellipses=this._config.ellipses,this.rotate=this._config.rotate,this.maxSize=this._config.maxSize,this.page=1,this.pageSize=this._config.pageSize,this.pageChange=new t,this.size=this._config.size,this._role=`navigation`}isDisabled(){return this.disabled||!!this._ngDisabled?.disabled}hasPrevious(){return this.page>1}hasNext(){return this.page<this.pageCount}nextDisabled(){return!this.hasNext()||this.isDisabled()}previousDisabled(){return!this.hasPrevious()||this.isDisabled()}selectPage(e){this.isDisabled()||this._updatePages(e)}ngAfterContentInit(){this.tplEllipsis&&(this.tplEllipsis.templateRef=this._refEllipsis),this.tplFirst&&(this.tplFirst.templateRef=this._refFirst),this.tplLast&&(this.tplLast.templateRef=this._refLast),this.tplNext&&(this.tplNext.templateRef=this._refNext),this.tplNumber&&(this.tplNumber.templateRef=this._refNumber),this.tplPrevious&&(this.tplPrevious.templateRef=this._refPrevious),this.tplPages&&(this.tplPages.templateRef=this._refPages)}ngOnChanges(e){this._updatePages(this.page)}isEllipsis(e){return e===-1}_applyEllipses(e,t){this.ellipses&&(e>0&&(e>2&&this.pages.unshift(-1),e===2&&this.pages.unshift(2),this.pages.unshift(1)),t<this.pageCount&&(t<this.pageCount-2&&this.pages.push(-1),t===this.pageCount-2&&this.pages.push(this.pageCount-1),this.pages.push(this.pageCount)))}_applyRotation(){let e=0,t=this.pageCount,n=Math.floor(this.maxSize/2),r=this.maxSize%2==0?n-1:n;return this.page<=n?t=this.maxSize:this.pageCount-this.page<n?e=this.pageCount-this.maxSize:(e=this.page-n-1,t=this.page+r),[e,t]}_applyPagination(){let e=(Math.ceil(this.page/this.maxSize)-1)*this.maxSize;return[e,e+this.maxSize]}_setPageInRange(e){let t=this.page;this.page=P(e,this.pageCount,1),this.page!=t&&F(this.collectionSize)&&this.pageChange.emit(this.page)}_updatePages(e){this.pageCount=Math.ceil(this.collectionSize/this.pageSize),F(this.pageCount)||(this.pageCount=0),this.pages.length=0;for(let e=1;e<=this.pageCount;e++)this.pages.push(e);if(this._setPageInRange(e),this.maxSize>0&&this.pageCount>this.maxSize){let e=0,t=this.pageCount;[e,t]=this.rotate?this._applyRotation():this._applyPagination();let n=this.pages.slice(e,t);this.pages.splice(0,this.pages.length,...n),this._applyEllipses(e,t)}}};w([i(T,{static:!1})],V.prototype,`tplEllipsis`,2),w([i(E,{static:!1})],V.prototype,`tplFirst`,2),w([i(D,{static:!1})],V.prototype,`tplLast`,2),w([i(O,{static:!1})],V.prototype,`tplNext`,2),w([i(k,{static:!1})],V.prototype,`tplNumber`,2),w([i(A,{static:!1})],V.prototype,`tplPrevious`,2),w([i(j,{static:!1})],V.prototype,`tplPages`,2),w([i(T,{read:n,static:!1})],V.prototype,`_refEllipsis`,2),w([i(E,{read:n,static:!1})],V.prototype,`_refFirst`,2),w([i(D,{read:n,static:!1})],V.prototype,`_refLast`,2),w([i(O,{read:n,static:!1})],V.prototype,`_refNext`,2),w([i(k,{read:n,static:!1})],V.prototype,`_refNumber`,2),w([i(A,{read:n,static:!1})],V.prototype,`_refPrevious`,2),w([i(j,{read:n,static:!1})],V.prototype,`_refPages`,2),w([c()],V.prototype,`disabled`,2),w([c()],V.prototype,`boundaryLinks`,2),w([c()],V.prototype,`directionLinks`,2),w([c()],V.prototype,`ellipses`,2),w([c()],V.prototype,`rotate`,2),w([c({required:!0})],V.prototype,`collectionSize`,2),w([c()],V.prototype,`maxSize`,2),w([c()],V.prototype,`page`,2),w([c()],V.prototype,`pageSize`,2),w([u()],V.prototype,`pageChange`,2),w([c()],V.prototype,`size`,2),w([a(`attr.role`)],V.prototype,`_role`,2),V=w([l({selector:`ngb-pagination`,template:z,transclude:!0})],V);var H=`ngb.pagination.config`,U=[V,T,E,D,O,k,A,j],W=class{};W=w([r({id:`ngb-pagination`,imports:[v],declarations:U,providers:[{provide:H,useFactory:()=>f(B)}]})],W);var G=[{path:``,data:{title:`Pagination`,tabs:[{name:`Examples`,to:`/components/pagination/examples`},{name:`Api`,to:`/components/pagination/api`}],externalLinks:{bootstrap:`components/pagination/`,ngBootstrap:`components/pagination/overview`}},children:[{path:``,pathMatch:`full`,redirectTo:`examples`},{path:`examples`,data:{sections:[{id:`basic-pagination`,name:`Basic pagination`},{id:`advanced-pagination`,name:`Advanced pagination`},{id:`custom-pagination`,name:`Custom links and pages`},{id:`pagination-size`,name:`Pagination size`},{id:`pagination-alignment`,name:`Pagination alignment`},{id:`disabled-pagination`,name:`Disabled pagination`},{id:`pagination-global`,name:`Global configuration`}]},loadComponent:()=>_(()=>import(`./pagination-examples-page.component-BPljVXjf.js`).then(e=>e.PaginationExamplesPageComponent),__vite__mapDeps([0,1,2,3]))},{path:`api`,data:{sections:[{id:`ngb-pagination`,name:`NgbPagination`},{id:`ngb-pagination-config`,name:`NgbPaginationConfig`}]},loadComponent:()=>_(()=>import(`./pagination-api-page.component-BSMvP9-g.js`).then(e=>e.PaginationApiPageComponent),__vite__mapDeps([4,1,2,5]))}]}],K=class{paginatedPage=7;rotatedPage=12;compactPage=12;selectPaginatedPage(e){this.paginatedPage=e}selectRotatedPage(e){this.rotatedPage=e}selectCompactPage(e){this.compactPage=e}};K=d([l({selector:`docs-advanced-pagination`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/advanced-pagination.component-bb779627.html`,styleUrl:`./advanced-pagination.component.css`})],K);var q=class{page=4;selectPage(e){this.page=e}};q=d([l({selector:`docs-basic-pagination`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/basic-pagination.component-65e74c38.html`,styleUrl:`./basic-pagination.component.css`})],q);var J=class{page=3;selectPage(e){this.page=e}};J=d([l({selector:`docs-custom-pagination`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/custom-pagination.component-36dbb269.html`,styleUrl:`./custom-pagination.component.css`})],J);var Y=class{page=3;disabled=!0;selectPage(e){this.page=e}};Y=d([l({selector:`docs-disabled-pagination`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/disabled-pagination.component-5771a156.html`,styleUrl:`./disabled-pagination.component.css`})],Y);var X=class{startPage=2;centerPage=2;endPage=2;selectStartPage(e){this.startPage=e}selectCenterPage(e){this.centerPage=e}selectEndPage(e){this.endPage=e}};X=d([l({selector:`docs-pagination-alignment`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/pagination-alignment.component-28c13e8f.html`,styleUrl:`./pagination-alignment.component.css`})],X);var Z=class{config;page=8;initialConfig;constructor(e){this.config=e,this.initialConfig={boundaryLinks:e.boundaryLinks,directionLinks:e.directionLinks,maxSize:e.maxSize,rotate:e.rotate,size:e.size},e.boundaryLinks=!0,e.directionLinks=!1,e.maxSize=5,e.rotate=!0,e.size=`sm`}selectPage(e){this.page=e}ngAfterViewInit(){this.restoreConfig()}ngOnDestroy(){this.restoreConfig()}restoreConfig(){this.config.boundaryLinks=this.initialConfig.boundaryLinks,this.config.directionLinks=this.initialConfig.directionLinks,this.config.maxSize=this.initialConfig.maxSize,this.config.rotate=this.initialConfig.rotate,this.config.size=this.initialConfig.size}};Z=d([l({selector:`docs-pagination-global`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/pagination-global.component-7999b716.html`,styleUrl:`./pagination-global.component.css`}),b(0,m(H)),y(`design:paramtypes`,[B===void 0?Object:B])],Z);var Q=class{smallPage=2;defaultPage=2;largePage=2;selectSmallPage(e){this.smallPage=e}selectDefaultPage(e){this.defaultPage=e}selectLargePage(e){this.largePage=e}};Q=d([l({selector:`docs-pagination-size`,controllerAs:`example`,templateUrl:`/ngb-js-docs/templates/pagination-size.component-8a6ad340.html`,styleUrl:`./pagination-size.component.css`})],Q);var $=class{};$=d([r({id:`docs.pagination`,declarations:[K,q,J,Y,X,Z,Q],imports:[x,ee,W,g.forChild(G)]})],$);export{$ as PaginationModule};