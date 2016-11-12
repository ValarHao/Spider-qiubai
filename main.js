'use strict';

var fs = require('fs');
var cheerio = require('cheerio');
var superagent = require('superagent');
var request = require('request');
var page = 1;

const URL = "http://www.qiushibaike.com/hot/page/";
const PAGE_SIZE = 5;

function fetchPage() {
    startRequest();
}

function startRequest() {
    var url;

    url = URL + page;
    console.log('正在爬取：' + url);

    superagent
        .get(url)
        .end(function (err, response) {
            if (err) {
                console.log(err.status);
                return false;
            }
            if (response.status === 200) {
                var $ = cheerio.load(response.text);
                //console.log(response.text);
            }
        
            saveContent($); //保存内容
            saveImage($); //保存图片
            
            //递归获取
            if (++page <= PAGE_SIZE) {
                fetchPage();
            }
        });
}

//保存内容到./content.txt中
function saveContent($) {
    var str = '';
    $('div.content span').each(function() {
        str = str + $(this).text() + '\n';
    });

    fs.appendFile('./content.txt', str, 'utf-8', function (err) {
        if (err) {
            console.log(err);
        }
    });
}

//保存图片到./image/x.jpg
function saveImage($) {
    var link = '';
    var title = '';
    $('div.thumb img').each(function() {
        link = $(this).attr('src');
        title = $(this).attr('alt');
    });
    request.head(link, function(err, res, body) {
        if (err) {
            console.log(err);
        }
    });
    request(link).pipe(fs.createWriteStream('./image/' + title + '.jpg'));
}

fetchPage(); //开始爬虫
