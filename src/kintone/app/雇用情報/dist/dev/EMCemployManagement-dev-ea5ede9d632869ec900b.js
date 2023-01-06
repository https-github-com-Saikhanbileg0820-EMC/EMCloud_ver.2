/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./kintone/app/雇用情報/src/js/indexDev.js":
/*!*********************************************!*\
  !*** ./kintone/app/雇用情報/src/js/indexDev.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.css */ \"./kintone/app/雇用情報/src/css/style.css\");\n/* harmony import */ var _module_hidden__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/hidden */ \"./kintone/app/雇用情報/src/js/module/hidden.js\");\n/* harmony import */ var _module_hidden__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_module_hidden__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _module_fieldchange_02__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./module/fieldchange_02 */ \"./kintone/app/雇用情報/src/js/module/fieldchange_02.js\");\n/* harmony import */ var _module_fieldchange_02__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_module_fieldchange_02__WEBPACK_IMPORTED_MODULE_2__);\n\r\n\r\n\r\n\n\n//# sourceURL=webpack://emc-sources/./kintone/app/%E9%9B%87%E7%94%A8%E6%83%85%E5%A0%B1/src/js/indexDev.js?");

/***/ }),

/***/ "./kintone/app/雇用情報/src/js/module/fieldchange_02.js":
/*!**********************************************************!*\
  !*** ./kintone/app/雇用情報/src/js/module/fieldchange_02.js ***!
  \**********************************************************/
/***/ (function() {

eval("(function () {\r\n    \"use strict\";\r\n    kintone.events.on(['app.record.edit.show', 'app.record.detail.show', 'app.record.edit.change.雇用区分', 'app.record.edit.change.雇用区分コピー', 'app.record.create.change.雇用区分', 'app.record.create.change.雇用区分コピー', 'app.record.create.show'], function(event){\r\n      \r\n      const setcolmun = ['給与支給1','給与支給2','給与支給3','給与支給4','給与支給5','給与支給6','給与支給7','給与支給8','給与支給9','給与支給10','給与支給11','給与支給12','給与支給13','給与支給14','給与支給15','給与支給16','給与支給17','給与支内1','給与支内2','給与支内3','給与支内4','給与支内5','給与支内6','給与支内7','給与支内8','給与支内9','給与支内10','給与控除7','給与控除8','給与控除9','給与控除10','給与控除11','給与控除12','給与控除13','給与控除14','給与控除15','給与控除16','給与控除17','給与控除18','給与控除19','給与控除20','給与控内1','給与控内2','給与控内3','給与控内4','給与控内5','給与控内6','給与控内7','給与控内8','給与控内9','給与控内10']\r\n      \r\n      var kubun = event.record.雇用区分.value;\r\n      \r\n      let classsearch = document.querySelectorAll(\".targetform\");\r\n      \r\n      if(classsearch.length > 0 && kubun === undefined) {\r\n          for(let y = 0; y < classsearch.length; y++) {\r\n              classsearch[y].innerHTML = setcolmun[y];\r\n          }\r\n      }\r\n      \r\n      let matches = document.querySelectorAll(\".control-label-gaia .control-label-text-gaia\");\r\n      \r\n      console.log(matches);\r\n      \r\n        //paramsに環境マスタ-区分マスタの値を格納\r\n        var params = {\r\n            'app': 5142,\r\n            'fields':['雇用区分','給与支給1_c','給与支給2_c','給与支給3_c','給与支給4_c','給与支給5_c','給与支給6_c','給与支給7_c','給与支給8_c','給与支給9_c','給与支給10_c','給与支給11_c','給与支給12_c','給与支給13_c','給与支給14_c','給与支給15_c','給与支給16_c','給与支給17_c','給与支内1_c','給与支内2_c','給与支内3_c','給与支内4_c','給与支内5_c','給与支内6_c','給与支内7_c','給与支内8_c','給与支内9_c','給与支内10_c','給与控除7_c','給与控除8_c','給与控除9_c','給与控除10_c','給与控除11_c','給与控除12_c','給与控除13_c','給与控除14_c','給与控除15_c','給与控除16_c','給与控除17_c','給与控除18_c','給与控除19_c','給与控除20_c','給与控内1_c','給与控内2_c','給与控内3_c','給与控内4_c','給与控内5_c','給与控内6_c','給与控内7_c','給与控内8_c','給与控内9_c','給与控内10_c'],\r\n            'query': 'マスタ区分 in (\"雇用区分\")'\r\n        };\r\n        \r\n        kintone.api(\r\n          kintone.api.url('/k/v1/records', true),\r\n          'GET',\r\n          params\r\n        )\r\n        .then(function(resp) {\r\n            let setfields = params.fields;\r\n            \r\n            setfields = setfields.map(function(a){\r\n              return a.replace('_c', '');\r\n            });\r\n            \r\n            for(let i = 0; i < resp.records.length; i++) {\r\n                if(resp.records[i].雇用区分.value == kubun){\r\n                    for(let s = 0; s < matches.length; s++) {\r\n                        for(let p = 1; p <= setfields.length; p++) {\r\n                            let setvals = setfields[p] + '_c';\r\n                             if(matches[s].innerHTML == setfields[p] && resp['records'][i][setvals].value != \"\"){matches[s].innerHTML = resp['records'][i][setvals].value; matches[s].classList.add(\"targetform\");}\r\n                        }\r\n                    }\r\n                }\r\n            }\r\n        })\r\n    });\r\n})();\n\n//# sourceURL=webpack://emc-sources/./kintone/app/%E9%9B%87%E7%94%A8%E6%83%85%E5%A0%B1/src/js/module/fieldchange_02.js?");

/***/ }),

/***/ "./kintone/app/雇用情報/src/js/module/hidden.js":
/*!**************************************************!*\
  !*** ./kintone/app/雇用情報/src/js/module/hidden.js ***!
  \**************************************************/
/***/ (function() {

eval("(function() {\r\n  'use strict';\r\n  kintone.events.on(['app.record.index.show','app.record.detail.show'], function(event) {\r\n    function toggle(className, displayState){\r\n    var elements = document.getElementsByClassName(className)\r\n\r\n    for (var i = 0; i < elements.length; i++){\r\n        elements[i].style.display = displayState;\r\n    }\r\n}\r\ntoggle('recordlist-edit-gaia', 'none'); // hides\r\ntoggle('recordlist-remove-gaia', 'none');\r\ntoggle('gaia-argoui-app-menu-add', 'none');\r\ntoggle('gaia-argoui-app-menu-edit', 'none');\r\ntoggle('gaia-argoui-optionmenubutton', 'none');\r\ntoggle('gaia-argoui-app-menu-copy', 'none');\r\n\r\n\r\n\r\n\r\n    \r\n  });\r\n})();\r\n\n\n//# sourceURL=webpack://emc-sources/./kintone/app/%E9%9B%87%E7%94%A8%E6%83%85%E5%A0%B1/src/js/module/hidden.js?");

/***/ }),

/***/ "./kintone/app/雇用情報/src/css/style.css":
/*!********************************************!*\
  !*** ./kintone/app/雇用情報/src/css/style.css ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://emc-sources/./kintone/app/%E9%9B%87%E7%94%A8%E6%83%85%E5%A0%B1/src/css/style.css?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./kintone/app/雇用情報/src/js/indexDev.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=http://localhost:8000/app/EMCemployManagement/dist/prd/EMCemployManagement-dev-ea5ede9d632869ec900b.map