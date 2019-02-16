"use strict";

describe("GameLogic.startGame", function () {
	let size = 512;
	let app = new PIXI.Application({width: size, height: size});
	let playerBlock;
    let missileHandler;
    let bbCollection;
    let collisionChecker;
    let explosionHandler;

	beforeEach(function () {
		let gameStage = new PIXI.Container();
      	app.stage = gameStage;

		explosionHandler = new BoulderBlaster.ExplosionHandler(gameStage);
		playerBlock = new BoulderBlaster.PlayerEntity(gameStage);
        missileHandler = new BoulderBlaster.MissileHandler(gameStage, size);
        bbCollection = new BoulderBlaster.BoulderCollection(gameStage);
        collisionChecker = new BoulderBlaster.CollisionChecker(gameStage, explosionHandler);
	});
	
	it("Will Start the game as expected.", function() {
		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		spyOn(playerBlock, "placePlayer");
		spyOn(bbCollection, "clearBoulders");
		spyOn(bbCollection, "generateBoulderFormation");
		spyOn(bbCollection, "calculateFallingStatusOnBoulders");

		logic.startGame();

		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
	});
});

describe("GameLogic.onKeyDown", function () {
	let size = 512;
	let app = new PIXI.Application({width: size, height: size});
	let playerBlock;
    let missileHandler;
    let bbCollection;
    let collisionChecker;
    let explosionHandler;

	beforeEach(function () {
		let gameStage = new PIXI.Container();
      	app.stage = gameStage;

		explosionHandler = new BoulderBlaster.ExplosionHandler(gameStage);
		playerBlock = new BoulderBlaster.PlayerEntity(gameStage);
        missileHandler = new BoulderBlaster.MissileHandler(gameStage, size);
        bbCollection = new BoulderBlaster.BoulderCollection(gameStage);
        collisionChecker = new BoulderBlaster.CollisionChecker(gameStage, explosionHandler);
	});
	
	it("Can restart game.", function() {

		let key = {keyCode: 82, preventDefault: function() {}};

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		spyOn(playerBlock, "placePlayer");
		spyOn(bbCollection, "clearBoulders");
		spyOn(bbCollection, "generateBoulderFormation");
		spyOn(bbCollection, "calculateFallingStatusOnBoulders");

		logic.onKeyDown(key);

		expect(playerBlock.placePlayer).toHaveBeenCalled();
		expect(bbCollection.clearBoulders).toHaveBeenCalled();
		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
	});

	it("Won't move player if player entity is not staged.", function() {
		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.gridX = 1;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(1);
		expect(playerBlock.lastGridXMove).toBe(0);

		playerBlock.placePlayer();
		playerBlock.gridX = 1;

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(-1);
	});

	it("Can move player to the left, but not past the left edge (and will set lastGridXMove).", function() {
		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		playerBlock.gridX = 1;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(-1);

		playerBlock.lastGridXMove = 0;

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(0);
		expect(playerBlock.lastGridXMove).toBe(0);
	});

	it("Can move player to the right, but not past the right edge (and will set lastGridXMove).", function() {
		let key = {keyCode: 68, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

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

	it("Will not accept player move until animation is complete.", function() {
		let key = {keyCode: 68, preventDefault: function() {}}; // D 

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		playerBlock.gridX = 0;
		playerBlock.lastGridXMove = 0;
		
		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(1);

		logic.onKeyDown(key);

		expect(playerBlock.gridX).toBe(1);
	});

	it("Can shoot missile up.", function() {
		let key = {keyCode: 87, preventDefault: function() {}}; // W

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		
		spyOn(missileHandler, "createMissile");

		logic.onKeyDown(key);

		expect(missileHandler.createMissile)
			.toHaveBeenCalledWith(playerBlock.gridX, playerBlock.gridY, -1);
	});

	it("Can shoot missile down.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // S

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		
		spyOn(missileHandler, "createMissile");

		logic.onKeyDown(key);

		expect(missileHandler.createMissile)
			.toHaveBeenCalledWith(playerBlock.gridX, playerBlock.gridY, 1);
	});

	it("Will work on moving boulder and check collisions when player action is made.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // S

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "moveAllFallingBouldersDown");
		spyOn(bbCollection, "calculateFallingStatusOnBoulders");
		spyOn(collisionChecker, "detectMissileHit");
		spyOn(collisionChecker, "checkPlayerBoulderCollision");

		logic.onKeyDown(key);

		expect(bbCollection.moveAllFallingBouldersDown).toHaveBeenCalled();
		expect(bbCollection.calculateFallingStatusOnBoulders).toHaveBeenCalled();
		expect(collisionChecker.detectMissileHit).toHaveBeenCalled();
		expect(collisionChecker.checkPlayerBoulderCollision).toHaveBeenCalled();
	});

	it("Will generate new Boulders as player moves.", function() {
		let key = {keyCode: 83, preventDefault: function() {}}; // A 

		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		
		spyOn(bbCollection, "generateBoulderFormation");

		for(let i = 0; i < 20; i++) {
			for(let j = 0; j < 20; j++)
				logic.gameLoop(null);

			logic.onKeyDown(key);
		}

		expect(bbCollection.generateBoulderFormation).toHaveBeenCalled();
	});

	it("Will move explosions & missiles and detect missile hits.", function() {
		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		playerBlock.placePlayer();
		
		spyOn(explosionHandler, "moveExplodingBlocks");
		spyOn(missileHandler, "moveMissiles");
		spyOn(collisionChecker, "detectMissileHit");

		logic.gameLoop(0);

		expect(explosionHandler.moveExplodingBlocks).toHaveBeenCalled();
		expect(missileHandler.moveMissiles).toHaveBeenCalled();
		expect(collisionChecker.detectMissileHit).toHaveBeenCalled();
	});

	it("Will update block positions if needed.", function() {
		let logic = new BoulderBlaster.GameLogic(app, size, playerBlock, missileHandler, 
			bbCollection, collisionChecker, explosionHandler);

		let key = {keyCode: 65, preventDefault: function() {}}; // A 

		playerBlock.placePlayer();
		bbCollection.boulderBlocks.push(new BoulderBlaster.BoulderEntity(app.stage, 0, 0, 2));
		
		spyOn(playerBlock, "updateBlockGraphicPosition");
		spyOn(bbCollection.boulderBlocks[0], "updateBlockGraphicPosition");

		logic.onKeyDown(key);
		logic.gameLoop(0);

		expect(playerBlock.updateBlockGraphicPosition).toHaveBeenCalled();
		expect(bbCollection.boulderBlocks[0].updateBlockGraphicPosition).toHaveBeenCalled();
	});
});
