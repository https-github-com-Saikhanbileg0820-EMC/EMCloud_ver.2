import '../css/EMCloud_common.css';
import '../css/style.css';
import './module/config.js';
import './module/common';
import './module/EMC2_appCoordination.js';
import './module/yubinkensaku.js';
import './module/age_calculator.js';
import './module/undeletable.js';
import './module/CheckCopy.js';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCemployHiring', true);
})();
