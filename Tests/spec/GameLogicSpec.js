/*
Game
	<- & A moves player to the left (and set lastGridXMove)
	-> & D moves player to the right (and set lastGridXMove)
	Up & W will fire missile up
	Down & S will fire missile down

	Key press ->
		bbCollection.moveAllFallingBouldersDown();
		bbCollection.calculateFallingStatusOnBoulders();
		collisionChecker.detectMissileHit(missileHandler, bbCollection); // A new missile needs to hit adjecten block immediently 

		generateBoulderFormation calling

	gameLoop
		explosionHandler.moveExplodingBlocks();
    missileHandler.moveMissiles();
    collisionChecker.detectMissileHit(missileHandler, bbCollection);

    if(blocksToMove) {
      if (playerBlock) changesMade =+ playerBlock.updateBlockGraphicPosition();
      bbCollection.boulderBlocks.forEach( function(stoneBlock) {changesMade += stoneBlock.updateBlockGraphicPosition();});


*/

"use strict";

describe("GameLogic.XXXX", function () {
	beforeEach(function () {
	});
	
	it("zzz", function() {

	});
});
