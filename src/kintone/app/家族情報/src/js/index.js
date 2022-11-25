import '../css/style.css';
import './module/yubinkensaku.js';
import './module/hidden';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCdependentExemption', true);
})();
