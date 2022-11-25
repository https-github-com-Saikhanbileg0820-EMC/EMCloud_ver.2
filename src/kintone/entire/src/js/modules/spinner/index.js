import { Spinner } from "spin.js";
import "spin.js/spin.css";
import jQuery from "jquery";
const $ = jQuery.noConflict();
/**
 * スピナー開始
 */
const show = function () {
  // 要素作成等初期化処理
  if ($('.kintone-spinner').length === 0) {
    // スピナー設置用要素と背景要素の作成
    const spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
    const spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

    // スピナー用要素をbodyにappend
    $(document.body).append(spin_div, spin_bg_div);

    // スピナー動作に伴うスタイル設定
    $(spin_div).css({
      'position': 'fixed',
      'top': '50%',
      'left': '50%',
      'z-index': '510',
      'background-color': 'transparent',
      'padding': '26px',
      '-moz-border-radius': '4px',
      '-webkit-border-radius': '4px',
      'border-radius': '4px'
    });
    $(spin_bg_div).css({
      'position': 'fixed',
      'top': '0px',
      'left': '0px',
      'z-index': '500',
      'width': '100%',
      'height': '200%',
      'background-color': '#000',
      'opacity': '0.0',
      'filter': 'alpha(opacity=10)',
      '-ms-filter': "alpha(opacity=10)"
    });
    // スピナーに対するオプション設定
    const opts = {
      'color': '#000'
    };
    // スピナーを作動
    new Spinner(opts).spin(document.getElementById('kintone-spin'));
  }
  // スピナー始動（表示）
  $('.kintone-spinner').show();
}
/**
 * スピナー終了
 */
const hide = function () {
  // スピナー停止（非表示）
  $('.kintone-spinner').hide();
}
export {
  show,
  hide
}