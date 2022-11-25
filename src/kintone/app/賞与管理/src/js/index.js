import '../css/style.css';
import './module/config';
import './module/config';
import './module/CSV';
import './module/undeletable';

(function () {
    //ライセンスキーチェック
    EMCloud.modules.licenseCheck('app', 'EMCbonusManagement', true);
})();
