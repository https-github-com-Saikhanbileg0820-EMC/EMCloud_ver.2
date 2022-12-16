import '../css/style.css';
import '../css/subtable_split.css';
import '../css/procedure.css';
import './module/common.js';
import './module/executionDateInput.js';
import './module/EMC2_request_fieldShown.js';
import './module/yubinkensaku.js';
import './module/disabledcheck.js';
import './module/hidden.js';
import './module/Required.js';
import './module/undeletable.js';
import './module/CheckCopy.js';
import './module/familyBasic.js';
import './module/FamilyChecker.js';
import './module/formbridge_insert (6).js';
import './module/subtable_split.js';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCprocedureManagement', true);
})();
