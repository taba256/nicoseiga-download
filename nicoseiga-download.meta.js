// ==UserScript==
// @name        ニコニコ静画(マンガ)ダウンロード
// @namespace   https://github.com/taba256/nicoseiga-download
// @description ニコニコ静画(マンガ)の作品を、zipファイルに圧縮してダウンロードできます。
// @author      taba
// @version     1.1.6
// @supportURL  https://github.com/taba256/nicoseiga-download/issues
// @updateURL   https://github.com/taba256/nicoseiga-download/raw/main/nicoseiga-download.meta.js
// @downloadURL https://github.com/taba256/nicoseiga-download/raw/main/nicoseiga-download.user.js
// @match       *://seiga.nicovideo.jp/watch/mg*
// @grant       unsafeWindow
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @connect     nicoseiga.jp
// @connect     nicovideo.jp
// @connect     nimg.jp
// @connect     nicomanga.jp
// @require     https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
// ==/UserScript==