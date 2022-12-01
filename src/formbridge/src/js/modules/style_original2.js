(function() {
  "use strict";

  fb.events.form.mounted = [function () {
    var alertmsg = function(){
      
    //hogeクラスの要素取得
    var tmp = document.getElementsByClassName("segment") ;
    var tmp2 = document.getElementsByClassName("header") ;
    document.getElementsByClassName("fb-submit").innerHTML = "送信";

    //付与するid名
    var val="testID";
    var val2="logout";

    //id属性追加
    tmp[0].setAttribute("id",val);
    tmp2[0].setAttribute("id",val2);
    
 
      const div3 = document.getElementById("testID");
      // 素の追加
      // alert("wd");
      const a1 = document.createElement("a");
      a1.href = "https://9382da7d.viewer.kintoneapp.com/public/61080b6049e9073202376ea9df3bd02e02c60efe6eb214a2f0e800adb0821455";
      a1.target = "_self";
      a1.id = "a";
      a1.innerText = "マイページへ";
      div3.appendChild(a1);
      
      const div5 = document.getElementById("logout");
      const a2 = document.createElement("a");
      a2.href = "https://a@9382da7d.viewer.kintoneapp.com/public/61080b6049e9073202376ea9df3bd02e02c60efe6eb214a2f0e800adb0821455";
      a2.target = "_top";
      a2.id = "logout_btn";
      a2.innerText = "ログアウト";
      div5.appendChild(a2);
      
      const searchId = document.getElementById("softname");
      
      if(searchId === null) {
          var tmp3 = document.getElementsByClassName("fb-header") ;
          var val3="softname";
          tmp3[0].setAttribute("id",val3);
          
          const div7 = document.getElementById("softname");
          const a3 = document.createElement("p");
          a3.id = "softname";
          a3.innerText = "EMCloud Basic ver.2";  //企業名
          div7.appendChild(a3);
      }
    }
    setTimeout(alertmsg, 500);
  }];
})();


let once = false;
window.addEventListener('touchmove', function () {
    
    // ターゲットの画面トップからの距離
    taeget_position = document.querySelector('.stackable').getBoundingClientRect().top;
    var tt = document.getElementById("a");
    var vv = location.href;
    if(vv.match(/confirm/)) {
       vv = true;
    } else {
       vv = false;
    }
    // 画面トップからの距離から画面の高さより小さければ実行する
        if (taeget_position <= window.innerHeight && tt == null && vv != true) {
            setTimeout(alertmsg, 0);
        }
});

    // 特定の要素高さを取得
    // Math.maxで持ってくる
    // この取得した値を持ってくる
    var alertmsg2 = function(){

    let elements = document.getElementsByTagName("th");
    Array.prototype.forEach.call(elements, function (element) {

        element.classList.add("thtd");
    });

    let elements2 = document.getElementsByTagName("td");
    Array.prototype.forEach.call(elements2, function (element2) {
        element2.classList.add("thtd");
    });

    const autoHeight = () => {
        // alert(2);
        //idがelemの要素を取得
       
        let elem = document.getElementsByClassName('thtd');
        
        //elemの子要素をすべて取得
        // let elemChildren = elem.children;
        //高さの最大値を代入する変数を初期化
        let elemMaxHeight = 0;
        //elemの子要素の高さを格納する配列を初期化
        let elemArray = new Array;
        console.log(elemArray);
        //elemの子要素をループ
        Array.prototype.forEach.call(elem, function(elem) {
            
          //子要素の高さのスタイルを初期化（リサイズ対応用）
          elem.style.height = '';
          //elemの各子要素の高さを取得
          elemArray.push(elem.clientHeight);
      
        });
      
        //配列に格納した高さの最大値を取得
        elemMaxHeight = Math.max.apply(null, elemArray);
      
        //elemの子要素をループ
        Array.prototype.forEach.call(elem, function(elem) {
          //elemの子要素のheightにelemMaxHeightを設定
          elem.style.height = elemMaxHeight + 'px';
    
        });
      }
      
    // window.addEventListener('scroll', autoHeight);
    window.addEventListener('touchmove', autoHeight);
    // window.addEventListener('resize', autoHeight);
    }
    setTimeout(alertmsg2, 500);

    // var alertmsg3 = function(){

        const autoHeight = () => {


    let elements = document.getElementsByTagName("th");
    Array.prototype.forEach.call(elements, function (element) {

        element.classList.add("thtd");
    });
    
    let elements2 = document.getElementsByTagName("td");
    Array.prototype.forEach.call(elements2, function (element2) {
        element2.classList.add("thtd");
    });
            // alert(2);
            //idがelemの要素を取得
           
            let elem = document.getElementsByClassName('thtd');
            
            //elemの子要素をすべて取得
            // let elemChildren = elem.children;
            //高さの最大値を代入する変数を初期化
            let elemMaxHeight = 0;
            //elemの子要素の高さを格納する配列を初期化
            let elemArray = new Array;
            console.log(elemArray);
            //elemの子要素をループ
            Array.prototype.forEach.call(elem, function(elem) {
                
              //子要素の高さのスタイルを初期化（リサイズ対応用）
              elem.style.height = '';
              //elemの各子要素の高さを取得
              elemArray.push(elem.clientHeight);
          
            });
          
            //配列に格納した高さの最大値を取得
            elemMaxHeight = Math.max.apply(null, elemArray);
          
            //elemの子要素をループ
            Array.prototype.forEach.call(elem, function(elem) {
              //elemの子要素のheightにelemMaxHeightを設定
              elem.style.height = elemMaxHeight + 'px';
        
            });
          }
          
        window.addEventListener('touchmove', autoHeight);