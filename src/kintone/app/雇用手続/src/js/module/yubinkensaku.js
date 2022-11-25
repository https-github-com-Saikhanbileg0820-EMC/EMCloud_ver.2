(function() {
   "use strict";
   console.log("c");
   var myEvents = [
        'app.record.create.change.郵便番号', 
        'app.record.edit.change.郵便番号', 
        'app.record.create.change.配偶者_郵便番号', 
        'app.record.edit.change.配偶者_郵便番号', 
        'app.record.create.change.現住所・郵便番号', 
        'app.record.edit.change.現住所・郵便番号', 
        'app.record.create.change.郵便番号_配偶者', 
        'app.record.edit.change.郵便番号_配偶者',, 
        'app.record.create.change.郵便番号_家族_1', 
        'app.record.edit.change.郵便番号_家族_1', 
        'app.record.create.change.郵便番号_家族_2', 
        'app.record.edit.change.郵便番号_家族_2', 
        'app.record.create.change.郵便番号_家族_3', 
        'app.record.edit.change.郵便番号_家族_3', 
        'app.record.create.change.郵便番号_家族_4', 
        'app.record.edit.change.郵便番号_家族_4', 
        'app.record.create.change.郵便番号_家族_5', 
        'app.record.edit.change.郵便番号_家族_5', 
        'app.record.create.change.郵便番号_家族_6', 
        'app.record.edit.change.郵便番号_家族_6', 
        'app.record.create.change.郵便番号_家族_7', 
        'app.record.edit.change.郵便番号_家族_7', 
        'app.record.create.change.郵便番号_家族_8', 
        'app.record.edit.change.郵便番号_家族_8', 
        'app.record.create.change.郵便番号_家族_9', 
        'app.record.edit.change.郵便番号_家族_9', 
        'app.record.create.change.郵便番号_家族_10', 
        'app.record.edit.change.郵便番号_家族_10', 
        'app.record.create.change.入社案内＿郵便番号', 
        'app.record.edit.change.入社案内＿郵便番号'
       ];
   
   kintone.events.on(myEvents, function(e) {
       var zipcode = e["record"]["郵便番号"]["value"];
       console.log("a");
       
       if (String(zipcode).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode;
       console.log(url);
           
           kintone.proxy(url, 'GET', {}, {})
           .then(function(args) {
                var record = kintone.app.record.get();
                //success
                 var results = JSON.parse(args[0])['results'][0];
                 
                 record.record['都道府県'].value = results['address1'];
                 record.record['市区町村'].value = results['address2'];
                 record.record['番地'].value = results['address3'];
                 
                 kintone.app.record.set(record);
           },function(error) {
               console.log(error);
           });
       }
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcode2 = e["record"]["配偶者_郵便番号"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcode3 = e["record"]["現住所・郵便番号"]["value"];
       
       if (String(zipcode3).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode3;
           
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
                 record.record['現住所'].value = results['address1'];
                 record.record['現住所'].value += results['address2'];
                 record.record['現住所'].value += results['address3'];
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
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcode4 = e["record"]["郵便番号_配偶者"]["value"];
       
       if (String(zipcode4).length === 7) {
           var url = 'https://zip-cloud.appspot.com/api/search?zipcode=' + zipcode4;
           
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam01 = e["record"]["郵便番号_家族_1"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam02 = e["record"]["郵便番号_家族_2"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam03 = e["record"]["郵便番号_家族_3"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam04 = e["record"]["郵便番号_家族_4"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam05 = e["record"]["郵便番号_家族_5"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam06 = e["record"]["郵便番号_家族_6"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam07 = e["record"]["郵便番号_家族_7"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam08 = e["record"]["郵便番号_家族_7"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam09 = e["record"]["郵便番号_家族_9"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcodefam10 = e["record"]["郵便番号_家族_10"]["value"];
       
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
       return e;
   });
   
   
   kintone.events.on(myEvents, function(e) {
       var zipcode5 = e["record"]["入社案内＿郵便番号"]["value"];
       
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
       return e;
   });
})();