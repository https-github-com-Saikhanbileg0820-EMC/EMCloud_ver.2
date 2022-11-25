const hide = function () {
  const HIDE_TAB_EVENTS = [
    "app.record.edit.show",
    "app.record.detail.show"
  ];
  kintone.events.on(HIDE_TAB_EVENTS, function (e) {
    //コメント隠す
    const arr_hash = window.location.hash.split("&");
    if (arr_hash.indexOf("tab=none") === -1) {
      arr_hash.push("tab=none");
      if (arr_hash.indexOf("tab=history") >= 0) arr_hash.splice(arr_hash.indexOf("tab=history"), 1);
      if (arr_hash.indexOf("tab=comments") >= 0) arr_hash.splice(arr_hash.indexOf("tab=comments"), 1)
      window.location.hash = arr_hash.join('&');
    }
    return e;
  });
}
export {
  hide
}
