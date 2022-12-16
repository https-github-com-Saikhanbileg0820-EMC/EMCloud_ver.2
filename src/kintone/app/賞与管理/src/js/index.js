import '../css/style.css';
import './module/config';
import './module/common';
import './module/CSV';
import './module/undeletable';
import './module/executionDateInput';
import './module/EMC2_request_fieldShown';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCbonusManagement', true);
})();
