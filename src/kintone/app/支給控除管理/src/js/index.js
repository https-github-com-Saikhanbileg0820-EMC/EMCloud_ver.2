import '../css/style.css';
import './module/force.js';
import './module/config.js';
import './module/common.js';
import './module/payrollExemptionManagement_new.js';
import './module/yubinkensaku.js';
import './module/fieldchange_02';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCpaymentDeduction', true);
})();
