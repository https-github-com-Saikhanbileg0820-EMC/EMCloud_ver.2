import '../css/style.css';
import './module/force.js';
import './module/config.js';
import './module/common.js';
import './module/employmentProcedure.js';
import './module/yubinkensaku.js';
import './module/EMC2_employmentRelation.js';
import './module/fieldDisabled';
import './module/hidden';
import './module/fieldchange_02';
import './module/undeletable';
import './module/master_insert';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCemployProcedure', true);
})();
