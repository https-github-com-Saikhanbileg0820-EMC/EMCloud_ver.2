import '../css/style.css';

import * as modules from './modules';
import * as constants from './constants';
import './modules/EMC';
import './modules/style';

// ネームスペース定義
window.EMCloud = window.EMCloud || {};
// 対象関数追加
window.EMCloud.modules = modules;
// 定数追加
window.EMCloud.constants = constants;
