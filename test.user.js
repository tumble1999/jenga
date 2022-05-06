
//test
(function () {
	'use strict';

	jenga.on("loadScripts", _ => {
		console.log("Scripts Loaded");
	});
	jenga.on("runScripts", _ => {
		console.log("Scripts Ran");
	});
	jenga.on("gameCreated", game => {
		console.log("Game Created", game);
	});
	jenga.on("booterCreated", booter => {
		console.log("Booter Created: ", booter);
	});

	jenga.on("titleScreenShown", (booter, titleScreen) => {
		console.log("Title Screen Shown: ", titleScreen);
	});
	jenga.on("gameScreenShown", (booter, gameScreen) => {
		console.log("Game Screen Shown: ", gameScreen);
	});
	jenga.on("leaderboardShown", (booter, leaderboardScreen) => {
		console.log("Leaderboard Shown: ", leaderboardScreen);
	});
})();