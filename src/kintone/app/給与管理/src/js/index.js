import '../css/style.css';
import './module/config';
import './module/common.js';
import './module/executionDateInput.js';
import './module/EMC2_request_fieldShown.js';
import './module/basicInfo';
import './module/hidden';
import './module/fieldchange_02';
import './module/undeletable';
import './module/Tax';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCsalaryManagement', true);
})();
