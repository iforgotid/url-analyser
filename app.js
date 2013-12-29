/**
 * Created with JetBrains PhpStorm.
 * User: philipp <philipp.xue@gmail.com>
 * Date: 12/29/13
 * Time: 10:20 AM
 */
var analyser = require('./runner');
var fs=require('fs');
process.on('uncaughtException', function (err) {
  console.error(err);
});

//var ret = analyser('http://tv.sohu.com/hdtv/');
//var ret = analyser('http://www.intel.com/go/getwimax');
var count = -1;
fs.readFile('./data/url.txt','utf8',function(err,data){
  if(err){
    return console.log(err);
  };
  var urls = data.split('\n');
  //console.log(urls.length);
  //console.log(urls[0]);
  fs.readFile('./data/count','utf8',function(err,data){
    if(data) {
      count = Number(data);
    }
    setInterval(function(){
      count++;
      var urlInfo = urls[count].split(',');
      if(!!urlInfo && !!urlInfo[1]) {
        var url = urlInfo[1];
        url = url.replace(/\r/,'');
        analyser(url);
      }
      if(count % 50 == 0) {
        fs.writeFile('./data/count',count,function(err){

        });
      }
    },200);
  });
});
