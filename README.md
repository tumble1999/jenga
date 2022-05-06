# Jenga

> A fork of Cardboard for creating mods of CritterClimb

modding api

if jenga is required:
```js
// @run-at       document-start

// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/tumble/jenga/raw/master/script.user.js

const MOD_DATA = jenga.register(MOD_NAME, /*optional*/ {data});
```

if jenga isn't required:
```js
// @run-at       document-start

let MOD_DATA = {data}; // can be replaced with undefined
const cRegister = _ => jenga.register(MOD_NAME, MOD_DATA, false, GM_info);
if (window.jenga)
	cRegister();
else
	window.addEventListener('jengaLoaded', cRegister);
```

creates variable jenga containing useful things.

jenga.version stores version of jenga

jenga.mods stores mods and mod data\
use allModsRegistered event to check when all mods that require jenga have registered\
use modRegistered to check when a new mod registers\
use unrequiredModRegistered to check when a new mod that doesn't require jenga registers

jenga contains an [EventHandler](https://github.com/SArpnt/EventHandler)

events:
- modRegistered(mod, data, jenga.mods)
- unrequiredModRegistered(mod, data, jenga.mods)
- requiredModRegistered(mod, data, jenga.mods)
- allModsRegistered(jenga.mods)
<br><br>
- loadScripts
- runScripts
- loadScript(scriptname, script tag)
- runScript(scriptname, script tag)
- loadScript*\[scriptname\]*(script tag)
- runScript*\[scriptname\]*(script tag)
  - Seedrandom
  - Createjs
  - Critterclimb
<br><br>
- gameCreated(game)
- booterCreated(booter)
- assetsLoaded(booter,images,spriteSheets,sounds)
- titleScreenShown(booter, titleScreen)
- gameScreenShown(booter, gameScreenShown)
- leaderboardShown(booter, leaderboard)