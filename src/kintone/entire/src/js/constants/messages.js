const warning = {
  "blank_nenkinNo": "年金手帳が回収済に設定されていますが、基礎年金番号が未入力です。",
  "blank_koyohokenNo": "雇用保険被保険者証が回収済に設定されていますが、雇用保険番号が未入力です。"
}
const error = {
  "run_task": "タスク処理中にエラーが発生しました。管理者に問い合わせて下さい。",
  "run_process": "プロセス処理中にエラーが発生しました。管理者に問い合わせて下さい。",
  "run_put": "レコードの更新に失敗しました。管理者に問い合わせて下さい。"
}
const confirm = {
  "upd_lastTask": "終了タスクに更新します。\n今後このレコードでタスクを更新することは出来ません。"
}
const info = {
  "no_keyRecord": "ライセンスキーが未登録です。システム管理者に問い合わせて下さい。",
  "multi_keyRecord": "ライセンス情報が複数登録されています。システム管理者に問い合わせて下さい。",
  "invalid_key": "無効なライセンスキーです。システム管理者に問い合わせて下さい。",
  "before_key": "ライセンスの有効期間前です。",
  "expired_key": "ライセンスの有効期限が切れています。",
  "fail_connection": "HTTP通信に失敗しました。"
}
export {
  warning,
  error,
  confirm,
  info
}