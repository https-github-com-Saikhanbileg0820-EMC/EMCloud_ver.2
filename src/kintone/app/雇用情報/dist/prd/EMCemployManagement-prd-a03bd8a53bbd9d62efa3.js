!function(){var e={481:function(){!function(){"use strict";kintone.events.on(["app.record.edit.show","app.record.detail.show","app.record.edit.change.雇用区分","app.record.edit.change.雇用区分コピー","app.record.create.change.雇用区分","app.record.create.change.雇用区分コピー","app.record.create.show"],(function(e){const c=["給与支給1","給与支給2","給与支給3","給与支給4","給与支給5","給与支給6","給与支給7","給与支給8","給与支給9","給与支給10","給与支給11","給与支給12","給与支給13","給与支給14","給与支給15","給与支給16","給与支給17","給与支内1","給与支内2","給与支内3","給与支内4","給与支内5","給与支内6","給与支内7","給与支内8","給与支内9","給与支内10","給与控除7","給与控除8","給与控除9","給与控除10","給与控除11","給与控除12","給与控除13","給与控除14","給与控除15","給与控除16","給与控除17","給与控除18","給与控除19","給与控除20","給与控内1","給与控内2","給与控内3","給与控内4","給与控内5","給与控内6","給与控内7","給与控内8","給与控内9","給与控内10"];var n=e.record.雇用区分.value;let r=document.querySelectorAll(".targetform");if(r.length>0&&void 0===n)for(let e=0;e<r.length;e++)r[e].innerHTML=c[e];let o=document.querySelectorAll(".control-label-gaia .control-label-text-gaia");console.log(o);var t={app:5142,fields:["雇用区分","給与支給1_c","給与支給2_c","給与支給3_c","給与支給4_c","給与支給5_c","給与支給6_c","給与支給7_c","給与支給8_c","給与支給9_c","給与支給10_c","給与支給11_c","給与支給12_c","給与支給13_c","給与支給14_c","給与支給15_c","給与支給16_c","給与支給17_c","給与支内1_c","給与支内2_c","給与支内3_c","給与支内4_c","給与支内5_c","給与支内6_c","給与支内7_c","給与支内8_c","給与支内9_c","給与支内10_c","給与控除7_c","給与控除8_c","給与控除9_c","給与控除10_c","給与控除11_c","給与控除12_c","給与控除13_c","給与控除14_c","給与控除15_c","給与控除16_c","給与控除17_c","給与控除18_c","給与控除19_c","給与控除20_c","給与控内1_c","給与控内2_c","給与控内3_c","給与控内4_c","給与控内5_c","給与控内6_c","給与控内7_c","給与控内8_c","給与控内9_c","給与控内10_c"],query:'マスタ区分 in ("雇用区分")'};kintone.api(kintone.api.url("/k/v1/records",!0),"GET",t).then((function(e){let c=t.fields;c=c.map((function(e){return e.replace("_c","")}));for(let r=0;r<e.records.length;r++)if(e.records[r].雇用区分.value==n)for(let n=0;n<o.length;n++)for(let t=1;t<=c.length;t++){let a=c[t]+"_c";o[n].innerHTML==c[t]&&""!=e.records[r][a].value&&(o[n].innerHTML=e.records[r][a].value,o[n].classList.add("targetform"))}}))}))}()},909:function(){!function(){"use strict";kintone.events.on(["app.record.index.show","app.record.detail.show"],(function(e){function c(e,c){for(var n=document.getElementsByClassName(e),r=0;r<n.length;r++)n[r].style.display=c}c("recordlist-edit-gaia","none"),c("recordlist-remove-gaia","none"),c("gaia-argoui-app-menu-add","none"),c("gaia-argoui-app-menu-edit","none"),c("gaia-argoui-optionmenubutton","none"),c("gaia-argoui-app-menu-copy","none")}))}()}},c={};function n(r){var o=c[r];if(void 0!==o)return o.exports;var t=c[r]={exports:{}};return e[r](t,t.exports,n),t.exports}n.n=function(e){var c=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(c,{a:c}),c},n.d=function(e,c){for(var r in c)n.o(c,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:c[r]})},n.o=function(e,c){return Object.prototype.hasOwnProperty.call(e,c)},function(){"use strict";n(909),n(481),EMCloud.modules.licenseCheck("app","EMCemployManagement",!0)}()}();
//# sourceMappingURL=http://localhost:8000/app/EMCemployManagement/dist/prd/EMCemployManagement-prd-a03bd8a53bbd9d62efa3.map