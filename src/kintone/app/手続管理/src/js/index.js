import '../css/style.css';
import './module/common.js';
import './module/executionDateInput.js';
import './module/EMC2_request_fieldShown.js';
import './module/yubinkensaku.js';
import './module/disabledcheck.js';
import './module/hidden';
import './module/Required';
import './module/undeletable';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCprocedureManagement', true);
})();
