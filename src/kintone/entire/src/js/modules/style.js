
(() => {

  let a =[];
// load、hashchange発生時にスペースのカスタマイズを実行
  // (popstateはIEで発生しないのでhashchange)
  //  
  window.addEventListener('load', function(event) {
    customizeSpace()
    .then(function(resp) {
      return event;
    });
  });
  
  window.addEventListener('hashchange', function(event) {
    customizeSpace()
    .then(function(resp) {
      return event;
    });
  });
  
  function customizeSpace(){
    return new kintone.Promise(function(resolve, reject) {
      
      // 初期化
      document.body.classList.remove('style');
      
      // スペースを表示中でない場合や
      // 表示中のスペースがカスタマイズ対象でない場合は処理終了
     
      const targetSpaceIds = [291, 296, 297,298,288,305,306,308,317,319,321];  // カスタマイズ対象スペースID
      
      
      var regexp = /#\/space\//;
      var hash = window.location.hash;
      
      if (!regexp.test(hash)) { return resolve(); }
      
      let spaceId = Number(hash.split('/')[2]);
      if (isNaN(spaceId)) { return resolve(); }
      
      if (!targetSpaceIds.includes(spaceId)) { return resolve(); }
      
      document.body.classList.add('style');
      
      
    });

  }
})();