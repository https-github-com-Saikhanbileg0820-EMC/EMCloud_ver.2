/**
 * メッセージ定義
 * Copyright © 2020 エムザス株式会社 All rights reserved.
 */
jQuery.noConflict();
(function ($) {
    var message = {
        "no_keyRecord": "ライセンスキーが未登録です。システム管理者に問い合わせて下さい。",
        "multi_keyRecord": "ライセンス情報が複数登録されています。システム管理者に問い合わせて下さい。",
        "invalid_key": "無効なライセンスキーです。システム管理者に問い合わせて下さい。",
        "before_key": "ライセンスの有効期間前です。",
        "expired_key": "ライセンスの有効期限が切れています。",
        "fail_connection": "HTTP通信に失敗しました。"
    }

    window.EMCconst_message = window.EMCconst_message || {};
    window.EMCconst_message.message = message;
})(jQuery);	