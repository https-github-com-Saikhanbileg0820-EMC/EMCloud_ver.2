import '../css/style.css';
import './module/yubinkensaku.js';
import './module/disable';
import './module/hidden';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCemployee', true);
})();
