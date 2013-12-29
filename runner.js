/**
 * Created with JetBrains PhpStorm.
 * User: philipp <philipp.xue@gmail.com>
 * Date: 12/29/13
 * Time: 10:20 AM
 */
//var http = require('http');
var nodegrass = require('nodegrass');
var fs = require("fs");
function handleUrl(url) {
  getHtml(url,function(err,data){

  });
  return 'hello';
}

function getHtml(url,callback) {
  nodegrass.get(url,function(data,status,headers){
    //console.log(status);
    var charset = getCharset({
      header : headers,
      data : data
    });
    var execCharset = charset;
    if(charset == 'unknown') {
      execCharset = 'gb2312';
    }
    getKeywordsAndDescription(data,execCharset,url,function(params){
      var tpl = '{url}-||-{title}-||-{keywords}-||-{description}';
      var info = tpl.replace(/\{url\}/,url)
                    .replace(/\{keywords\}/,params.keywords)
                    .replace(/\{description\}/,params.description)
                    .replace(/\{title\}/,params.title);
      info += '\n';
      fs.appendFile('./data/url-result.txt',info,function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("The file was saved!");
        }
      });
      //console.log(url + '|-|' + params.keywords + '|-|' + params.description);
    });
    //console.log(charset + ':->>' + url);
    callback(null,{});
  },'binary').on('error', function(err) {
    console.log("Got error: " + err.message);
    callback(err);
  });
}

function getKey(str,name) {
  var pattern = new RegExp("<" + name + ">(\\w){1,}" + "</" + name + ">","gi");
  var matches = pattern.exec(str);
  return matches;
}

function getCharset(params) {
  var header = params.header || '';
  var data = params.data || '';
  var execStr = '';
  if(!!header['content-type'] && header['content-type'].toLowerCase().indexOf('charset')!==-1) {
    execStr = header['content-type'];
  } else {
    var headArr = getKey(data,'head');
    if(!!headArr && headArr.length>0) {
      execStr = headArr[1];
    }
  }
  //console.log('head:'+ JSON.stringify(header));
  //console.log(execStr);
  var charsetArr = /charset=(((\w)|-){1,})/i.exec(execStr);
  var charset = 'unknown';
  if(!!charsetArr && charsetArr.length > 0) {
    charset = charsetArr[1];
  }
  return charset;
}

function getKeywordsAndDescription (str,charset,url,callback) {
  var jsdom = require('jsdom').jsdom;
  var iconv = require('iconv');
  var jquery = fs.readFileSync("./lib/jquery.js").toString();
  var mongoskin = require('mongoskin');
  var data = new iconv.Iconv(charset, 'UTF-8//TRANSLIT//IGNORE').convert(new Buffer(str,'binary')).toString();
  jsdom.env({
        html:data,
        src:[jquery],
        done:function (errors, window) {
          if(errors) {
            //console.log(errors);
            throw errors;
          };
          var $ = window.$;
          var retObj = {
            url : url
          };
          $('meta').each(function(index,meta){
            //console.log(meta.name);
            if(!!meta.name && meta.name.toLowerCase() === 'keywords') {
              retObj.keywords = meta.content || meta.CONTENT;
            } else if(!!meta.name && meta.name.toLowerCase() === 'description') {
              retObj.description = meta.content || meta.CONTENT;
            }
          });
          var title = $('title').text();
          console.log(title);
          retObj.title = title;
          callback(retObj);
          window.close();
        }
      }
  );
};


module.exports = function(url) {
  return handleUrl(url);
}