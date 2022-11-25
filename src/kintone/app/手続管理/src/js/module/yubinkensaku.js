(function() {
   "use strict";
    var myEvents = [
        'app.record.create.change.郵便番号', 
        'app.record.edit.change.郵便番号'
       ];
    var myEvents2 = [
        'app.record.create.change.配偶者_郵便番号', 
        'app.record.edit.change.配偶者_郵便番号'
       ];
    var myEvents3 = [
        'app.record.create.change.郵便番号_配偶者', 
        'app.record.edit.change.郵便番号_配偶者'
       ];   
    var myEvents4 = [
        'app.record.create.change.現住所・郵便番号', 
        'app.record.edit.change.現住所・郵便番号'
       ];
    var myEvents5a = [
        'app.record.create.change.郵便番号_家族_1', 
        'app.record.edit.change.郵便番号_家族_1'
       ];
    var myEvents5b = [
        'app.record.create.change.郵便番号_家族_2', 
        'app.record.edit.change.郵便番号_家族_2'
       ];
    var myEvents5c = [
        'app.record.create.change.郵便番号_家族_3', 
        'app.record.edit.change.郵便番号_家族_3'
       ];
    var myEvents5d = [
        'app.record.create.change.郵便番号_家族_4', 
        'app.record.edit.change.郵便番号_家族_4'
       ];
    var myEvents5e = [
        'app.record.create.change.郵便番号_家族_5', 
        'app.record.edit.change.郵便番号_家族_5'
       ];
    var myEvents5f = [
        'app.record.create.change.郵便番号_家族_6', 
        'app.record.edit.change.郵便番号_家族_6'
       ];
    var myEvents5g = [
        'app.record.create.change.郵便番号_家族_7', 
        'app.record.edit.change.郵便番号_家族_7'
       ];
    var myEvents5h = [
        'app.record.create.change.郵便番号_家族_8', 
        'app.record.edit.change.郵便番号_家族_8'
       ];
    var myEvents5i = [
        'app.record.create.change.郵便番号_家族_9', 
        'app.record.edit.change.郵便番号_家族_9'
       ];
    var myEvents5j = [
        'app.record.create.change.郵便番号_家族_10', 
        'app.record.edit.change.郵便番号_家族_10'
       ];
    var myEvents6 = [
        'app.record.create.change.入社案内＿郵便番号', 
        'app.record.edit.change.入社案内＿郵便番号'
       ];
    var myEvents7 = [
        'app.record.create.change.現住所_郵便番号', 
        'app.record.edit.change.現住所_郵便番号'
       ];
    var myEvents8 = [
        'app.record.create.change.郵便番号_連絡先', 
        'app.record.edit.change.郵便番号_連絡先'
       ];
    var myEvents9 = [
        'app.record.create.change.緊急連絡先_郵便番号', 
        'app.record.edit.change.緊急連絡先_郵便番号'
       ];
  
       
   kintone.events.on(myEvents, function(e) {
       var zipcode = e["record"]["郵便番号"]["value"];
       
       if (String(zipcode).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['都道府県'].value = results['address1'];
                 record.record['市区町村'].value = results['address2'];
                 record.record['番地'].value = results['address3'];
                 record.record['住所カナ'].value = results['kana1'];
                 record.record['住所カナ'].value += results['kana2'];
                 record.record['住所カナ'].value += results['kana3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e;
   });
   
   
   kintone.events.on(myEvents2, function(e2) {
       var zipcode2 = e2["record"]["配偶者_郵便番号"]["value"];
       
       if (String(zipcode2).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode2;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['配偶者_住所'].value = results['address1'];
                 record.record['配偶者_住所'].value += results['address2'];
                 record.record['配偶者_住所'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e2;
   });
   
   
   kintone.events.on(myEvents3, function(e3) {
       var zipcode3 = e3["record"]["郵便番号_配偶者"]["value"];
       
       if (String(zipcode3).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode3;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_配偶者'].value = results['address1'];
                 record.record['住所_配偶者'].value += results['address2'];
                 record.record['住所_配偶者'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e3;
   });
   
   
   kintone.events.on(myEvents4, function(e4) {
       var zipcode4 = e4["record"]["現住所・郵便番号"]["value"];
       
       if (String(zipcode4).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode4;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['現住所_都道府県'].value = results['address1'];
                 record.record['現住所_市区町村'].value = results['address2'];
                 record.record['現住所_番地'].value = results['address3'];
                 record.record['現住所_都道府県_カナ'].value = results['kana1'];
                 record.record['現住所_市区町村_カナ'].value = results['kana2'];
                 record.record['現住所_マンション_ビル等_カナ'].value = results['kana3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e4;
   });
   
   kintone.events.on(myEvents5a, function(e5a) {
       var zipcodefam01 = e5a["record"]["郵便番号_家族_1"]["value"];
       
       if (String(zipcodefam01).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam01;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_1'].value = results['address1'];
                 record.record['住所_家族_1'].value += results['address2'];
                 record.record['住所_家族_1'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5a;
   });
   
   
   kintone.events.on(myEvents5b, function(e5b) {
       var zipcodefam02 = e5b["record"]["郵便番号_家族_2"]["value"];
       
       if (String(zipcodefam02).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam02;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_2'].value = results['address1'];
                 record.record['住所_家族_2'].value += results['address2'];
                 record.record['住所_家族_2'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5b;
   });
   
   
   kintone.events.on(myEvents5c, function(e5c) {
       var zipcodefam03 = e5c["record"]["郵便番号_家族_3"]["value"];
       
       if (String(zipcodefam03).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam03;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_3'].value = results['address1'];
                 record.record['住所_家族_3'].value += results['address2'];
                 record.record['住所_家族_3'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5c;
   });
   
   
   kintone.events.on(myEvents5d, function(e5d) {
       var zipcodefam04 = e5d["record"]["郵便番号_家族_4"]["value"];
       
       if (String(zipcodefam04).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam04;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_4'].value = results['address1'];
                 record.record['住所_家族_4'].value += results['address2'];
                 record.record['住所_家族_4'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5d;
   });
   
   
   kintone.events.on(myEvents5e, function(e5e) {
       var zipcodefam05 = e5e["record"]["郵便番号_家族_5"]["value"];
       
       if (String(zipcodefam05).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam05;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_5'].value = results['address1'];
                 record.record['住所_家族_5'].value += results['address2'];
                 record.record['住所_家族_5'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5e;
   });
   
   
   kintone.events.on(myEvents5f, function(e5f) {
       var zipcodefam06 = e5f["record"]["郵便番号_家族_6"]["value"];
       
       if (String(zipcodefam06).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam06;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_6'].value = results['address1'];
                 record.record['住所_家族_6'].value += results['address2'];
                 record.record['住所_家族_6'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5f;
   });
   
   
   kintone.events.on(myEvents5g, function(e5g) {
       var zipcodefam07 = e5g["record"]["郵便番号_家族_7"]["value"];
       
       if (String(zipcodefam07).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam07;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_7'].value = results['address1'];
                 record.record['住所_家族_7'].value += results['address2'];
                 record.record['住所_家族_7'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5g;
   });
   
   
   kintone.events.on(myEvents5h, function(e5h) {
       var zipcodefam08 = e5h["record"]["郵便番号_家族_7"]["value"];
       
       if (String(zipcodefam08).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam08;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_8'].value = results['address1'];
                 record.record['住所_家族_8'].value += results['address2'];
                 record.record['住所_家族_8'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5h;
   });
   
   
   kintone.events.on(myEvents5i, function(e5i) {
       var zipcodefam09 = e5i["record"]["郵便番号_家族_9"]["value"];
       
       if (String(zipcodefam09).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam09;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_9'].value = results['address1'];
                 record.record['住所_家族_9'].value += results['address2'];
                 record.record['住所_家族_9'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5i;
   });
   
   
   kintone.events.on(myEvents5j, function(e5j) {
       var zipcodefam10 = e5j["record"]["郵便番号_家族_10"]["value"];
       
       if (String(zipcodefam10).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcodefam10;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['住所_家族_10'].value = results['address1'];
                 record.record['住所_家族_10'].value += results['address2'];
                 record.record['住所_家族_10'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e5j;
   });
   
   
   kintone.events.on(myEvents6, function(e6) {
       var zipcode5 = e6["record"]["入社案内＿郵便番号"]["value"];
       
       if (String(zipcode5).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode5;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['入社案内＿住所'].value = results['address1'];
                 record.record['入社案内＿住所'].value += results['address2'];
                 record.record['入社案内＿住所'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e6;
   });
   
   
   kintone.events.on(myEvents7, function(e7) {
       var zipcode6 = e7["record"]["現住所_郵便番号"]["value"];
       
       if (String(zipcode6).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode6;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['現住所_都道府県市区町村名'].value = results['address1'];
                 record.record['現住所_都道府県市区町村名'].value += results['address2'];
                 record.record['現住所_都道府県市区町村名_カナ'].value = results['kana1'];
                 record.record['現住所_都道府県市区町村名_カナ'].value += results['kana2'];
                 record.record['現住所_市区町村以下'].value = results['address3'];
                 record.record['現住所_市区町村以下カナ'].value = results['kana3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e7;
   });
   
   
   kintone.events.on(myEvents8, function(e8) {
       var zipcode7 = e8["record"]["郵便番号_連絡先"]["value"];
       
       if (String(zipcode7).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode7;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['連絡先住所'].value = results['address1'];
                 record.record['連絡先住所'].value += results['address2'];
                 record.record['連絡先住所'].value += results['address3'];
                 record.record['連絡先住所カナ'].value = results['kana1'];
                 record.record['連絡先住所カナ'].value += results['kana2'];
                 record.record['連絡先住所カナ'].value += results['kana3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e8;
   });
   
   
   kintone.events.on(myEvents9, function(e9) {
       var zipcode8 = e9["record"]["緊急連絡先_郵便番号"]["value"];
       
       if (String(zipcode8).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode8;
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['緊急連絡先_都道府県'].value = results['address1'];
                 record.record['緊急連絡先_市区町村'].value += results['address2'];
                 record.record['緊急連絡先_番地'].value += results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e9;
   });
  
})();