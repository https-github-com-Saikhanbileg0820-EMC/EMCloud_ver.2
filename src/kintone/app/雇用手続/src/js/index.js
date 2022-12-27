import '../css/style.css';
import '../css/subtable_split.css';
import './module/force.js';
import './module/config.js';
import './module/common.js';
import './module/employmentProcedure.js';
import './module/yubinkensaku.js';
import './module/EMC2_employmentRelation.js';
import './module/fieldDisabled.js';
import './module/hidden.js';
import './module/fieldchange_02.js';
import './module/undeletable.js';
import './module/master_insert.js';
import './module/age.js';
import './module/CheckCopy.js';
import './module/FamilyChecker.js';
import './module/formbridge_insert_koyou.js';
import './module/subtable_split';
import './module/Tax';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCemployProcedure', true);
})();
