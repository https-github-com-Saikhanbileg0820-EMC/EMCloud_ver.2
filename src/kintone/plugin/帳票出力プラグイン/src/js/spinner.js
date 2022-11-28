/**
 * @fileoverview スピナー
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
jQuery.noConflict();
(function($) {
   "use strict";
    /**
     * スピナー開始
     */
    var showSpinner = function () {
        // 要素作成等初期化処理
        if ($('.kintone-spinner').length === 0) {
            // スピナー設置用要素と背景要素の作成
            var spin_div = $('<div id ="kintone-spin" class="kintone-spinner"></div>');
            var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');

            // スピナー用要素をbodyにappend
            $(document.body).append(spin_div, spin_bg_div);

            // スピナー動作に伴うスタイル設定
            $(spin_div).css({
                'position': 'fixed',
                'top': '50%',
                'left': '50%',
                'z-index': '510',
                'background-color': '#fff',
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
                'opacity': '0.5',
                'filter': 'alpha(opacity=50)',
                '-ms-filter': "alpha(opacity=50)"
            });

            // スピナーに対するオプション設定
            var opts = {
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
    var hideSpinner = function () {
        // スピナー停止（非表示）
        $('.kintone-spinner').hide();
    }
    
    window.excelReport = window.excelReport || {};
    window.excelReport.EMCloud_spinner = window.excelReport.EMCloud_spinner || {};
    window.excelReport.EMCloud_spinner.showSpinner = showSpinner;
    window.excelReport.EMCloud_spinner.hideSpinner = hideSpinner;
})(jQuery);
