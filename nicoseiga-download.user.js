// ==UserScript==
// @name        ニコニコ静画(マンガ)ダウンロード
// @namespace   https://github.com/taba256/nicoseiga-download
// @description ニコニコ静画(マンガ)の作品を、zipファイルに圧縮してダウンロードできます。
// @author      taba
// @version     1.1.7
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

(() => {
	"use strict";
	class DownloadItem {
		constructor(dlinfo, parent_div, name) {
			this.dlinfo = dlinfo;
			const div = document.createElement("div");
			div.style.display = "flex";
			const span = document.createElement("span");
			span.textContent = name;
			span.style.flex = "1";
			div.appendChild(span);
			this.progressBar = document.createElement("progress");
			this.progressBar.max = 100;
			this.progressBar.value = 0;
			this.progressBar.style.flex = "2";
			div.appendChild(this.progressBar);
			parent_div.appendChild(div);
			this.completed = false;
		}
		update(progress) {
			if (progress.lengthComputable) {
				this.progressBar.max = progress.total;
				this.progressBar.value = progress.loaded;
			}
		}
		downloadComplete() {
			this.completed = true;
			this.dlinfo.checkAllCompleted();
		}
		get isCompleted() {
			return this.completed;
		}
	}
	class DownloadInfomation {
		constructor(title) {
			this.downloads = [];
			this.cancel = [];
			this.fulldiv = document.createElement("div");
			this.fulldiv.style.cssText = "background-color:#ffffff7f;z-index:114514;position:fixed;width:100vw;height:100vh;top:0;left:0;";
			document.body.appendChild(this.fulldiv);
			const h1Title = document.createElement("h1");
			h1Title.textContent = title;
			h1Title.style.cssText = "text-align:center;padding-top:10px;";
			this.fulldiv.appendChild(h1Title);
			this.divInfo = document.createElement("div");
			this.divInfo.style.cssText = "width:80%;height:80%;border:dotted medium black;margin:20px auto;background-color:white;overflow:auto;";
			this.fulldiv.appendChild(this.divInfo);
			this.buttonOK = document.createElement("button");
			this.buttonOK.textContent = "OK!";
			this.buttonOK.disabled = true;
			this.buttonOK.style.cssText = "padding:10px 20px;border-radius:20px;";
			this.buttonOK.addEventListener("click", () => {
				this.Dispose();
			});
			const buttonCancel = document.createElement("button");
			buttonCancel.textContent = "Cancel";
			buttonCancel.style.cssText = "padding:10px 20px;border-radius:20px;";
			buttonCancel.addEventListener("click", () => {
				this.cancel.forEach(f => f());
				this.Dispose();
			});
			const buttonDiv = document.createElement("div");
			buttonDiv.appendChild(this.buttonOK);
			buttonDiv.appendChild(buttonCancel);
			buttonDiv.style.cssText = "text-align:center;";
			this.fulldiv.appendChild(buttonDiv);
		}
		Dispose() {
			document.body.removeChild(this.fulldiv);
		}
		addDownload(name, cancel) {
			const newItem = new DownloadItem(this, this.divInfo, name);
			this.downloads.push(newItem);
			this.cancel.push(cancel);
			return newItem;
		}
		checkAllCompleted() {
			if (this.downloads.every(d => d.isCompleted)) {
				this.buttonOK.disabled = false;
			}
		}
	}

	const download = async () => {
		try {
			const zip = new JSZip();
			const dir = zip.folder(episode_title);
			const args = unsafeWindow.args;
			const di = new DownloadInfomation(episode_title);

			await Promise.all(args.pages.map((page, index) => new Promise((resolve, reject) => {
				let url = page.url;
				let thumbWebpMatch = /^https:\/\/deliver\.cdn\.nicomanga\.jp\/thumb\/(aHR0[A-Za-z0-9+=]+)\.webp$/.exec(url);
				if (thumbWebpMatch != null) {
					url = atob(thumbWebpMatch[1]);
				}
				const dl = di.addDownload((new URL(url)).pathname.replace(/.*\//, ""), reject);
				GM_xmlhttpRequest({
					method: "GET", url: url, responseType: "arraybuffer", onload: xhr => {
						const url = new URL(xhr.finalUrl);
						let data = new Uint8Array(xhr.response);
						const keystring = xhr.finalUrl.match(/[0-9a-fA-F]{40}/);
						if (keystring != null) {
							const key = new Uint8Array(8);
							for (let i = 0; i < 8; i++) {
								key[i] = parseInt(keystring[0].substr(i * 2, 2), 16);
							}
							data = data.map((v, i) => v ^ key[i & 7]);
						}
						dir.file(("0000" + index).slice(-4) + "_" + page.image_id + ".jpg", data);
						resolve();
						dl.downloadComplete();
					},
					onerror: reject,
					onprogress: progress => { dl.update(progress); }
				});
			})));
			const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } })
			saveAs(content, episode_title + ".zip");
		} catch (e) {
			console.log(e);
			alert("ダウンロードに失敗しました");
		}
	};
	const title_element = document.querySelector("div.title");
	const episode_title = title_element.innerText.replace("\n", " ");
	const downloadButton = document.createElement("button");
	downloadButton.textContent = "ダウンロード";
	downloadButton.addEventListener("click", download);
	title_element.appendChild(downloadButton);
	GM_registerMenuCommand("ニコニコ静画ダウンロード", download);
})();
