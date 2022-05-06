// ==UserScript==
// @name         Jenga
// @description  Modding api for CritterClimb (based of cardboard by SArpnt)
// @author       Tumble
// @version      0.1.1.2
// @namespace    https://boxcrittersmods.ga/authors/tumble/
// @homepage     https://boxcrittersmods.ga/projects/jenga/
// @updateURL    https://github.com/tumble1999/jenga/raw/master/script.user.js
// @downloadURL  https://github.com/tumble1999/jenga/raw/master/script.user.js
// @supportURL   https://github.com/tumble1999/jenga/issues
// @icon         https://github.com/tumble1999/jenga/raw/master/icon16.png
// @icon64       https://github.com/tumble1999/jenga/raw/master/icon64.png
// @run-at       document-start
// @include      /^https:\/\/boxcritters\.com\/games\/critterclimb\/(v2\/)?(index\.html)?([\?#].*)?$/
// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// ==/UserScript==

(function () {
	'use strict';

	const uWindow = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

	let deps = [
		{
			obj: "joinFunction",
			text: "// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js"
		},
		{
			obj: "EventHandler",
			text: "// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js"
		},
	];
	if (deps.map(dep => eval("typeof " + dep.obj)).includes("undefined")) throw "\nATTENTION MOD DEVELOPER:\nPlease add the following to your code:\n" + deps.map(dep => {
		if (eval("typeof " + dep.obj) == "undefined") return dep.text;
	}).filter(d => !!d).join("\n");

	const VERSION = [0, 1, 1, 2];
	const IS_USERSCRIPT = GM_info.script.name == 'Jenga';

	if (uWindow.jenga) {
		// register
		if (uWindow.jenga.awaitingReg)
			uWindow.jenga.unregistered.push(uWindow.jenga.awaitingReg.script.name);
		else if (uWindow.jenga.awaitingReg === undefined)
			alert(`The mod '${GM_info.script.name}' loaded late!
Contact the mod developer.`);

		if (IS_USERSCRIPT)
			uWindow.jenga.awaitingReg = null;
		else
			uWindow.jenga.awaitingReg = GM_info;

		// version detection
		let comp = (a, b) => (a < b) - (b < a);
		switch (comp(uWindow.jenga.version, VERSION)) {
			case 1: // this is newer
				if (uWindow.jenga.mods) {
					let m = Object.keys(uWindow.jenga.mods);
					alert(`The mod${m.length == 1 ? '' : 's'} ${m.map(a => `'${a}'`).join(',')} ${m.length == 1 ? 'is' : 'are'} using an older version of jenga.
Try reinstalling ${m.length == 1 ? 'this mod' : 'these mods'}.`);
				} else
					alert(`Unknown mods are using an older version of jenga.
Try reinstalling all active mods.`);
				break;
			case -1: // this is older
				if (IS_USERSCRIPT)
					alert(`The mod 'Jenga' (the userscript) is out of date.
Update this mod.`);
				else
					alert(`The mod '${GM_info.script.name}' using an older version of jenga.
Try reinstalling this mod.`);
				break;
		}
		return;
	}
	/*
	Game engine - b
	leaderboard - d
	titleScreen - h
	*/

	let jenga = new EventHandler([
		'modRegistered',
		'requiredModRegistered',
		'unrequiredModRegistered',
		'allModsRegistered',

		'loadScripts',
		'runScripts',
		'loadScript',
		'runScript',

		'gameCreated',
		'booterCreated',
		'assetsLoaded',
		'titleScreenShown',
		'gameScreenShown',
		'leaderboardShown'
	], false);
	jenga.version = VERSION;

	// register system
	jenga.mods = {};
	jenga.awaitingReg = GM_info;
	jenga.unregistered = [];
	jenga.register = function (mod, data = {}, req = true, gmInfo) {
		if (typeof mod != 'string' || !mod) throw new TypeError(`Parameter 1 must be of type 'string'`);
		if (!/^[a-z_$][\w$]*$/i.test(mod)) throw new TypeError(`Invalid characters in modname (must be valid for dot notation)`);
		if (typeof data != 'object' || data === null) throw new TypeError(`Parameter 2 must be of type 'object'`);
		if (typeof gmInfo != 'undefined' && (
			typeof gmInfo != 'object' || gmInfo === null ||
			!gmInfo.script || !gmInfo.script.name)) throw new TypeError(`Parameter 4 must be of type GM_info`);

		if (req && !jenga.awaitingReg) {
			if (jenga.mods[mod]) {
				alert(`The mod '${(jenga.mods[mod].GM_info && jenga.mods[mod].GM_info) || mod}' registered twice!
Contact the mod creator.`);
				return;
			} else {
				alert(`The mod '${mod}' registered without jenga detecting it beforehand!
Contact the mod creator.`);
			}
		}
		if (jenga.mods[mod]) {
			alert(`The mod '${(jenga.awaitingReg && jenga.awaitingReg.script.name) ||
				(gmInfo && gmInfo.script.name) ||
				mod}' is conflicting with '${mod}'!
Either don't use these mods together or contact the mod creator.`);
			return;
		}
		if (req) { // assign gm_info
			data.GM_info = jenga.awaitingReg;
			jenga.awaitingReg = null;
		} else {
			data.GM_info = gmInfo;
			if (!gmInfo)
				console.warn(`No GM_info for mod '${mod}'!`);
		}

		jenga.mods[mod] = data;
		jenga.emit('modRegistered', mod, data, jenga.mods);
		jenga.emit(req ? 'requiredModRegistered' : 'unrequiredModRegistered', mod, data, jenga.mods);
		return data;
	};
	setTimeout(function () {
		if (jenga.awaitingReg)
			jenga.unregistered.push(jenga.awaitingReg.script.name);
		delete jenga.awaitingReg;

		if (jenga.unregistered.length)
			alert(`The mod${jenga.unregistered.length == 1 ? '' : 's'} ${jenga.unregistered.map(a => `'${a}'`).join(',')} didn't register!
Try reinstalling the${jenga.unregistered.length == 1 ? 'is mod' : 'ese mods'}.`);
		jenga.register = function (mod) {
			alert(`The mod '${mod}' registered late!
Contact the mod developer.`);
		};
		jenga.emit('allModsRegistered', jenga.mods);
	}, 0);
	jenga.register('jenga', jenga, IS_USERSCRIPT);

	let ajax = function (url, callback, stopCache = false) {
		if (stopCache)
			url += (url.includes('?') ? '&' : '?') + (new Date).getTime();
		let x = new XMLHttpRequest;
		x.onreadystatechange = e => callback && x.readyState == 4 && x.status == 200 && callback(x.response, x, e);
		try {
			x.open('GET', url, false);
			x.send();
		} catch (e) {
			x.open('GET', url, true);
			x.send();
		}
		return x;
	};

	{ // scriptHandling
		let getScript = function (s) {
			if (s.selector)
				if (typeof s.selector == 'string')
					return document.querySelector(`script[${s.selector}]`);
				else if (s.selector.constructor.name == 'RegExp')
					return Array.from(document.scripts).find(e => s.selector.test(s.src ? e.src : e.innerHTML));
				else
					return s.selector();
			else
				return document.querySelector(`script[src="${s.src}"]`);
		};
		let scriptTags = [
			{ name: "Seedrandom", selector: /vendor\/seedrandom(\.min)?\.js$/, src: 'vendor/seedrandom.js', ranTest: _ => uWindow.Math.seedrandom, state: 0, }, // state 0 unloaded, 1 loaded, 2 ran
			{ name: "Createjs", selector: /vendor\/createjs(\.min)?\.js$/, src: 'vendor/createjs.min.js', ranTest: _ => uWindow.createjs, state: 0, },
			{ name: "Critterclimb", nicknames: ["Game"], selector: /critterclimb(\.min)?\.js$/, src: 'critterclimb.min.js', ranTest: _ => uWindow.CritterClimb, state: 0, },
		];
		if (document.scripts)
			for (let s of scriptTags)
				if (getScript(s) && (!s.ranTest || s.ranTest())) {
					alert(`Jenga wasn't injected in time!
					1) Try refreshing to see if this fixes the issue
					2) Enable instant script injection in tampermonkey settings:
						- Click tampermonkey's icon, a menu should appear
						- Go to dashboard
						- Select the settings tab near the top right
						- Set config mode to advanced (first setting)
						- Set inject mode to instant (scroll to the bottom of the page)`
					);
					console.log(document.cloneNode(document.documentElement));
					return;
				}
		for (let s of scriptTags)
			if (typeof s.src == 'string')
				s.ajax = ajax(s.src, d => { s.text = d; if (s.state == 1) finish(s); });

		let MO = new MutationObserver((m, o) => {
			for (let s of scriptTags)
				if (!s.state) {
					let tag = getScript(s);
					if (tag) {
						tag.remove();
						s.state = 1;
						tag.addEventListener('beforescriptexecute', e => e.preventDefault()); // firefox fix
						s.tag = document.createElement('script');

						if (tag.src) {
							if (tag.src != s.src) {
								if (s.ajax)
									s.ajax.abort();
								s.ajax = ajax(tag.src, d => { s.text = d; finish(s); });
							}
						} else {
							s.text = tag.innerHTML;
							finish(s);
						}
					}
				}
		});
		MO.observe(document.documentElement, { childList: true, subtree: true });

		let finish = function (s) {
			s.tag.innerHTML = s.text;
			jenga.emit(`loadScript${s.name}`, s.tag);
			jenga.emit(`loadScript`, s.name, s.tag);
			if (s.nicknames)
				for (let n of s.nicknames) {
					jenga.emit(`loadScript${n}`, s.tag);
					jenga.emit(`loadScript`, n, s.tag);
				}

			s.state = 2;

			if (Object.values(scriptTags).every(e => e.state >= 2))
				runScripts();
		};
		function runScripts() {
			MO.disconnect();
			jenga.emit('loadScripts');
			for (let s of scriptTags)
				if (s.state == 2) {
					document.documentElement.appendChild(s.tag);
					s.state = 3;
					jenga.emit(`runScript${s.name}`, s.tag);
					jenga.emit(`runScript`, s.name, s.tag);
					if (s.nicknames)
						for (let n of s.nicknames) {
							jenga.emit(`runScript${n}`, s.tag);
							jenga.emit(`runScript`, n, s.tag);
						}
				}
			jenga.emit('runScripts');
		}

		let pageLoadDebugger = function () {
			let run = false;
			for (let t of scriptTags)
				switch (t.state) {
					case 0:
						console.error(`Jenga: Script event issues! Couldn't find`, t);
						run = true;
						break;
					case 1:
						console.warn(`Jenga: Script not ran in time! (Not all script srcs finished loading) May have compatibility issues`, t);
						break;
					//case 2:
					//	console.error(`Jenga: Script src found but not ran? Needs to be fixed`, t);
					//	run = true;
				}
			if (run) runScripts();
		};
		uWindow.addEventListener('load', _ => setTimeout(pageLoadDebugger, 0));
	}


	let docEventListen = document.addEventListener;
	document.addEventListener = function (name, action) {
		if (name == "DOMContentLoaded") {
			action = function () {
				var t, e = new CritterClimb;
				jenga.emit("gameCreated", e);
				e.init({
					language: "en",
					path: "./assets/",
					quality: "high",
					debug: !1,
					canvas: {
						parentDivId: "boxcritters",
						canvasId: "cc_canvas"
					}
				}),
					e.bootGame(),
					(t = e.getCanvas()).style.marginLeft = "auto",
					t.style.marginRight = "auto",
					t.style.display = "block";
			};
		}
		docEventListen(name, action);
	};


	jenga.on("gameCreated", game => {
		uWindow.game = game;
	});

	let proto, jengaVersionText;


	function initModVersionText(booter) {
		if (!jengaVersionText) {
			jengaVersionText = CritterClimb.Text.create({
				text: "Jenga " + jenga.version.join("."),
				font: "bold 17px Arial",
				color: "#ffffff",
				textAlign: "center",
				outline: {
					size: 1,
					color: "#000000"
				}
			});
			jengaVersionText.x = booter.stage.canvas.width / 2;
			jengaVersionText.y = 15;
		}

	}



	jenga.on("runScriptGame", function () {

		proto = Object.keys(CritterClimb).reduce((obj, key) => {
			obj[key] = CritterClimb[key].prototype;
			return obj;
		}, {});
		proto.Booter.createCanvas = joinFunction(proto.Booter.createCanvas, function () {
			jenga.emit("booterCreated", this);
		});
		proto.Booter.handleLoadComplete = joinFunction(proto.Booter.handleLoadComplete, function () {
			jenga.emit("assetsLoaded", this, this.loadedImages, this.loadedSpriteSheets, this.loadedSound);
		});
	});

	jenga.on("booterCreated", booter => {
		proto.TitleScreen.show = joinFunction(proto.TitleScreen.show, function () {
			jenga.emit("titleScreenShown", booter, this);
		});
		proto.GameEngine.show = joinFunction(proto.GameEngine.show, function () {
			jenga.emit("gameScreenShown", booter, this);
		});
		proto.LeaderboardScreen.show = joinFunction(proto.LeaderboardScreen.show, function () {
			jenga.emit("leaderboardScreenShown", booter, this);
		});
	});

	jenga.on("titleScreenShown", (booter, titleScreen) => {
		initModVersionText(booter);
		titleScreen.titleScreenContainer.addChild(jengaVersionText);
	});
	jenga.on("gameScreenShown", (booter, gameScreen) => {
		initModVersionText(booter);
		gameScreen.gameScreenContainer.addChild(jengaVersionText);
	});

	uWindow.jenga = jenga;
	window.dispatchEvent(new Event('jengaLoaded'));
})();
