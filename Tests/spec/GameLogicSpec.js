"use strict";

describe("GameLogic.startGame", function () {
	let size = 512;
	let app = new PIXI.Application({width: size, height: size});
	let playerBlock;
	let missileHandler;
	let bbCollection;
	let collisionHandler;
	let explosionHandler;
	let resourceHolder;
	let overlayHandler;
	let scoreHandler;
	let soundHandler;

	beforeEach(function () {
		let gameStage = new PIXI.Container();
      	app.stage = gameStage;

		resourceHolder = new BoulderBlaster.ResourceHolder();
		explosionHandler = new BoulderBlaster.ExplosionHandler(gameStage);
		playerBlock = new BoulderBlaster.PlayerEntity(gameStage, resourceHolder);
		missileHandler = new BoulderBlaster.MissileHandler(gameStage, size);
		bbCollection = new BoulderBlaster.BoulderCollection(gameStage, resourceHolder);
		collisionHandler = new BoulderBlaster.CollisionHandler(gameStage, explosionHandler);
		overlayHandler = new BoulderBlaster.OverlayHandler(gameStage, resourceHolder, 512);
		scoreHandler = new BoulderBlaster.ScoreHandler(new PIXI.Container(), new BoulderBlaster.CookieHandler());
		soundHandler = new BoulderBlaster.SoundHandler(new PIXI.Container());
	});
	
	it("Can start the game as expected.", function() {
		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		spyOn(playerBlock, "placePlayer").and.callThrough();
		spyOn(bbCollection, "clearBoulders").and.callThrough();
		spyOn(bbCollection, "generateBoulderFormation").and.callThrough();
		spyOn(bbCollection, "calculateFallingStatusOnBoulders").and.callThrough();
		spyOn(overlayHandler, "clearStage").and.callThrough();
		spyOn(playerBlock, "removePlayer").and.callThrough();
		spyOn(scoreHandler, "resetScore").and.callThrough();

		let key = {keyCode: 82, preventDefault: function() {}};

		logic.startGame();
		logic.onKeyDown(key);
		for(let i = 0; i < 240; i++) // Run through intro.
		{
			logic.gameLoop(0);
		}

		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
		expect(overlayHandler.clearStage).toHaveBeenCalled();
		expect(playerBlock.removePlayer).toHaveBeenCalled();
		expect(scoreHandler.resetScore).toHaveBeenCalled();
	});
});

describe("GameLogic.onKeyDown", function () {
	let size = 512;
	let app = new PIXI.Application({width: size, height: size});
	let playerBlock;
    let missileHandler;
    let bbCollection;
    let collisionHandler;
    let explosionHandler;
	let resourceHolder;
	let overlayHandler;
	let scoreHandler;
	let soundHandler;

	beforeEach(function () {
		let gameStage = new PIXI.Container();
      	app.stage = gameStage;

		resourceHolder = new BoulderBlaster.ResourceHolder();
		explosionHandler = new BoulderBlaster.ExplosionHandler(gameStage);
		playerBlock = new BoulderBlaster.PlayerEntity(gameStage, resourceHolder);
		missileHandler = new BoulderBlaster.MissileHandler(gameStage, size);
		bbCollection = new BoulderBlaster.BoulderCollection(gameStage, resourceHolder);
		collisionHandler = new BoulderBlaster.CollisionHandler(gameStage, explosionHandler);
		overlayHandler = new BoulderBlaster.OverlayHandler(gameStage, resourceHolder, 512);
		scoreHandler = new BoulderBlaster.ScoreHandler(new PIXI.Container(), new BoulderBlaster.CookieHandler());
		soundHandler = new BoulderBlaster.SoundHandler(new PIXI.Container());
	});
	
	it("Can restart game.", function() {

		let key = {keyCode: 82, preventDefault: function() {}};

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		spyOn(playerBlock, "placePlayer").and.callThrough();
		spyOn(bbCollection, "clearBoulders").and.callThrough();
		spyOn(bbCollection, "generateBoulderFormation").and.callThrough();
		spyOn(bbCollection, "calculateFallingStatusOnBoulders").and.callThrough();

		logic.onKeyDown(key);
		for(let i = 0; i < 240; i++) // Run through intro.
		{
			logic.gameLoop(0);
		}

		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
	});

	it("Won't move player if player entity is not staged.", function() {
		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.gridX = 1;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(playerBlock.gridX).toBe(1);
		expect(playerBlock.lastGridXMove).toBe(0);

		playerBlock.placePlayer();
		playerBlock.gridX = 1;

		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(-1);
	});

	it("Can move player to the left, but not past the left edge (and will set lastGridXMove).", function() {
		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		playerBlock.gridX = 1;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(-1);

		playerBlock.lastGridXMove = 0;

		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(0);
	});

	it("Can move player to the right, but not past the right edge (and will set lastGridXMove).", function() {
		let key = {keyCode: 68, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		playerBlock.gridX = playerBlock.gridSquares-2;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(playerBlock.gridSquares-1);
		expect(playerBlock.lastGridXMove).toBe(1);

		playerBlock.lastGridXMove = 0;

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(playerBlock.gridSquares-1);
		expect(playerBlock.lastGridXMove).toBe(0);
	});

	it("Can shoot missile up.", function() {
		let key = {keyCode: 87, preventDefault: function() {}}; // W

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(missileHandler, "createMissile").and.callThrough();

		logic.onKeyDown(key);

		expect(missileHandler.createMissile)
			.toHaveBeenCalledWith(playerBlock.gridX, playerBlock.gridY, -1);
	});

	it("Can shoot missile down.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // S

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(missileHandler, "createMissile").and.callThrough();

		logic.onKeyDown(key);

		expect(missileHandler.createMissile)
			.toHaveBeenCalledWith(playerBlock.gridX, playerBlock.gridY, 1);
	});

	it("Will work on moving boulder and check collisions when player action is made.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // S

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "moveAllFallingBouldersDown").and.callThrough();
		spyOn(bbCollection, "calculateFallingStatusOnBoulders").and.callThrough();
		spyOn(collisionHandler, "detectMissileHit").and.callThrough();
		spyOn(collisionHandler, "checkPlayerBoulderCollision").and.callThrough();

		logic.onKeyDown(key);

		expect(bbCollection.moveAllFallingBouldersDown).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
		expect(collisionHandler.detectMissileHit).toHaveBeenCalled();
		expect(collisionHandler.checkPlayerBoulderCollision).toHaveBeenCalled();
	});

	it("Will generate new Boulders as player moves.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "generateBoulderFormation").and.callThrough();

		for(let i = 0; i < 20; i++) {
			for(let j = 0; j < 20; j++)
				logic.gameLoop(null);

			logic.onKeyDown(key);
			logic.onKeyUp(key);
		}

		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
	});

	it("Will Turn Sound On/Off with N key.", function() {
		let key = {keyCode: 78, preventDefault: function() {}}; // N

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(soundHandler, "soundOnOff"); //.and.callThrough();

		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(soundHandler.soundOnOff).toHaveBeenCalled();

		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(soundHandler.soundOnOff).toHaveBeenCalledTimes(2);
	});

	it("Can toggle Help screen on/off.", function() {
		let hKey = {keyCode: 72, preventDefault: function() {}}; // H
		let aKey = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(overlayHandler, "showHelp").and.callThrough();
		spyOn(overlayHandler, "clearStage").and.callThrough();

		logic.onKeyDown(hKey);
		logic.onKeyUp(hKey);

		expect(overlayHandler.showHelp).toHaveBeenCalled();

		logic.onKeyDown(aKey);
		logic.onKeyUp(aKey);

		expect(overlayHandler.clearStage).toHaveBeenCalled();
	});

	it("Turning help screen off will start the game if not already started.", function() {
		let hKey = {keyCode: 72, preventDefault: function() {}}; // H
		let aKey = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();

		logic.startGame();
		
		spyOn(overlayHandler, "showHelp").and.callThrough();
		spyOn(overlayHandler, "clearStage").and.callThrough();
		spyOn(bbCollection, "generateBoulderFormation").and.callThrough();
		spyOn(playerBlock, "placePlayer").and.callThrough();
		spyOn(bbCollection, "clearBoulders").and.callThrough();

		logic.onKeyDown(hKey);
		logic.onKeyUp(hKey);

		expect(overlayHandler.showHelp).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).not.toHaveBeenCalled();

		logic.onKeyDown(aKey);
		logic.onKeyUp(aKey);

		for(let i = 0; i < 240; i++) // Run through intro.
		{
			logic.gameLoop(0);
		}

		expect(overlayHandler.clearStage).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
	});

	it("Any key will start game.", function() {
		let aKey = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();

		logic.startGame();
		
		spyOn(bbCollection, "generateBoulderFormation").and.callThrough();
		spyOn(playerBlock, "placePlayer").and.callThrough();
		spyOn(bbCollection, "clearBoulders").and.callThrough();

		logic.onKeyDown(aKey);
		logic.onKeyUp(aKey);

		for(let i = 0; i < 240; i++) // Run through intro.
		{
			logic.gameLoop(0);
		}

		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
	});

	it("Will Missile target Boulders when shooting up.", function() {
		let key = {keyCode: 87, preventDefault: function() {}}; // W

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "preMissileTargetBoulder").and.callThrough();

		logic.onKeyDown(key);

		expect(bbCollection.preMissileTargetBoulder).toHaveBeenCalled();
	});

	it("onKeyDown actions will not be trigged until onKeyUp has been trigged.", function() {
		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		playerBlock.gridX = 4;
	
		logic.onKeyDown(key);
		logic.onKeyUp(key);

		expect(playerBlock.gridX).toBe(3);

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(2);

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(2);

		logic.onKeyUp(key);
		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(1);
	});

});

describe("GameLogic.gameLoop", function () {
	let size = 512;
	let app = new PIXI.Application({width: size, height: size});
	let playerBlock;
    let missileHandler;
    let bbCollection;
    let collisionHandler;
    let explosionHandler;
	let resourceHolder;
	let overlayHandler;
	let scoreHandler;
	let soundHandler;

	beforeEach(function () {
		let gameStage = new PIXI.Container();
      	app.stage = gameStage;

		resourceHolder = new BoulderBlaster.ResourceHolder();
		explosionHandler = new BoulderBlaster.ExplosionHandler(gameStage);
		playerBlock = new BoulderBlaster.PlayerEntity(gameStage, resourceHolder);
		missileHandler = new BoulderBlaster.MissileHandler(gameStage, size);
		bbCollection = new BoulderBlaster.BoulderCollection(gameStage, resourceHolder);
		collisionHandler = new BoulderBlaster.CollisionHandler(gameStage, explosionHandler);
		overlayHandler = new BoulderBlaster.OverlayHandler(gameStage, resourceHolder, 512);
		scoreHandler = new BoulderBlaster.ScoreHandler(new PIXI.Container(), new BoulderBlaster.CookieHandler());
		soundHandler = new BoulderBlaster.SoundHandler(new PIXI.Container());
	});
	
	afterEach(function () {
		playerBlock = undefined;
    missileHandler = undefined;
    bbCollection = undefined;
    collisionHandler = undefined;
    explosionHandler = undefined;
    soundHandler = undefined;
	}) 
	
	it("Will move explosions & missiles and detect missile hits.", function() {
		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		playerBlock.placePlayer();
		
		spyOn(explosionHandler, "moveExplodingBlocks").and.callThrough();
		spyOn(missileHandler, "moveMissiles").and.callThrough();
		spyOn(collisionHandler, "detectMissileHit").and.callThrough();

		logic.gameLoop(0);

		expect(explosionHandler.moveExplodingBlocks).toHaveBeenCalled();
		expect(missileHandler.moveMissiles).toHaveBeenCalled();
		expect(collisionHandler.detectMissileHit).toHaveBeenCalled();
	});

	it("Will update block positions if needed.", function() {
		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		playerBlock.placePlayer();
		bbCollection.boulderBlocks.push(new BoulderBlaster.BoulderEntity(app.stage, 0, 0, 2, resourceHolder));
		
		spyOn(playerBlock, "updateBlockGraphicPosition").and.callThrough();
		spyOn(bbCollection.boulderBlocks[0], "updateBlockGraphicPosition").and.callThrough();

		logic.onKeyDown(key);
		logic.onKeyUp(key);
		
		for(let i = 0; i < 100; i++)
			logic.gameLoop(0);

		expect(playerBlock.updateBlockGraphicPosition).toHaveBeenCalled();
		expect(bbCollection.boulderBlocks[0].updateBlockGraphicPosition).toHaveBeenCalled();
	});

	it("Can explode bottom row if complete.", function() {
		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		playerBlock.placePlayer();
		bbCollection.gridSquares = 3;
		bbCollection.boulderBlocks.push(new BoulderBlaster.BoulderEntity(app.stage, 0, 2, 2, resourceHolder));
		bbCollection.boulderBlocks[0].isFalling = false;
		bbCollection.boulderBlocks.push(new BoulderBlaster.BoulderEntity(app.stage, 1, 2, 2, resourceHolder));
		bbCollection.boulderBlocks[1].isFalling = false;
		bbCollection.boulderBlocks.push(new BoulderBlaster.BoulderEntity(app.stage, 2, 2, 2, resourceHolder));
		bbCollection.boulderBlocks[2].isFalling = false;
		
		spyOn(bbCollection, "clearBottomRowIfComplete").and.callThrough().and.callThrough();
		spyOn(explosionHandler, "placeExplodingBlock").and.callThrough().and.callThrough();

		logic.onKeyDown(key);

		expect(bbCollection.clearBottomRowIfComplete).not.toHaveBeenCalled();

		for(let i = 0; i < 20; i++)
			logic.gameLoop(0);

		expect(bbCollection.clearBottomRowIfComplete).toHaveBeenCalled();
		expect(explosionHandler.placeExplodingBlock).toHaveBeenCalled();
	});

	it("Will increse score when bottom row is complete.", function() { 
		let logic = new BoulderBlaster.GameLogic(playerBlock, missileHandler, 
			bbCollection, collisionHandler, explosionHandler, overlayHandler, 
			scoreHandler, soundHandler);

		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "clearBottomRowIfComplete")
			.and.callFake(function() { return true; } );
		spyOn(scoreHandler, "increaseScore");

		logic.onKeyDown(key);

		expect(bbCollection.clearBottomRowIfComplete).not.toHaveBeenCalled();
		expect(scoreHandler.increaseScore).not.toHaveBeenCalled();

		for(let i = 0; i < 100; i++)
			logic.gameLoop(0);

		expect(bbCollection.clearBottomRowIfComplete).toHaveBeenCalled();
		expect(scoreHandler.increaseScore).toHaveBeenCalled();
		
	});
});
