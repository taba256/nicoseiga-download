// ==UserScript==
// @name        ニコニコ静画(マンガ)ダウンロード
// @namespace   https://github.com/taba256/nicoseiga-download
// @description ニコニコ静画(マンガ)の作品を、zipファイルに圧縮してダウンロードできます。
// @author      taba
// @version     1.0.0
// @supportURL  https://github.com/taba256/nicoseiga-download/issues
// @match       *://seiga.nicovideo.jp/watch/mg*
// @grant       unsafeWindow
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @connect     drm.nicoseiga.jp
// @connect     lohas.nicoseiga.jp
// @connect     seiga.nicovideo.jp
// @require     https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js
// ==/UserScript==

(()=>{
	"use strict";
	const download=async()=>{
		try{
			const zip = new JSZip();
			const dir = zip.folder(episode_title);
			const args = unsafeWindow.args;
			await Promise.all(args.pages.map(page=>new Promise((resolve,reject)=>{
				GM_xmlhttpRequest({method:"GET",url:page.url,responseType:"arraybuffer",onload:xhr=>{
					const url=new URL(xhr.finalUrl);
					let data=new Uint8Array(xhr.response);
					if(url.hostname==="drm.nicoseiga.jp"){
						const key=new Uint8Array(8);
						const keystring=xhr.finalUrl.match(/[0-9a-fA-F]{40}/)[0];
						for(let i=0;i<8;i++){
							key[i]=parseInt(keystring.substr(i*2,2),16);
						}
						data=data.map((v,i)=>v^key[i&7]);
					}
					dir.file(page.image_id+".jpg",data);
					resolve();
				},onerror:reject});
			})));
			const content = await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:9}})
			saveAs(content,episode_title+".zip");
		}catch(e){
			alert("ダウンロードに失敗しました");
		}
	};
	const title_element=document.querySelector("div.title");
	const episode_title=title_element.innerText.replace("\n"," ");
	const downloadButton = document.createElement("button");
	downloadButton.textContent = "ダウンロード";
	downloadButton.addEventListener("click",download);
	title_element.appendChild(downloadButton);
	GM_registerMenuCommand("ニコニコ静画ダウンロード",download);
})();