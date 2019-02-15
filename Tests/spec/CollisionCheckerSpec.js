"use strict";

describe("CollisionChecker.detectMissileHit", function () {
	let stage;
	let eh;
	let missileMock;
	let boulderMock;
	let mhMock;
	let bbcMock;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			eh = new BoulderBlaster.ExplosionHandler(stage);
			
			missileMock = new PIXI.Graphics();
			missileMock.gridX = 0;
			missileMock.position.y = 0;
			missileMock.beginFill(0xffffff);
	    missileMock.drawRect(0, 0, 10, 10);
  	  missileMock.endFill();
	
			boulderMock = { gridX: 0, graphic: new PIXI.Graphics()};
			boulderMock.gridX = 0;
			boulderMock.graphic.position.y = 0;
			boulderMock.graphic.beginFill(0xffffff);
    	boulderMock.graphic.drawRect(0, 0, 10, 10);
    	boulderMock.graphic.endFill();
			
			mhMock = { missiles: [missileMock] };
			bbcMock = { boulderBlocks: [boulderMock], regroupBoulderFormation : function(groupId) {}, calculateFallingStatusOnBoulders: function() {} };
  });
	
	it("Can detect missile/boulder hit when Y positions are the same.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Will filter on gridX property.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		missileMock.gridX = 1;
	
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		bc.detectMissileHit(mhMock, bbcMock);
		
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		missileMock.gridX = 0;
		
		bc.detectMissileHit(mhMock, bbcMock);
		
		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Can detect missile/boulder hit when graphics are overlapping. (Missile from above)", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		boulderMock.graphic.position.y = 8;

		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Can detect missile/boulder hit when graphics are overlapping. (Missile from below)", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		missileMock.position.y = 8;
	
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Will call regroupBoulderFormation when hit detected.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		spyOn(bbcMock, 'regroupBoulderFormation');
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(bbcMock.regroupBoulderFormation).toHaveBeenCalled();
	});
	
	it("Will call calculateFallingStatusOnBoulders when hit detected.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
	
		spyOn(bbcMock, 'calculateFallingStatusOnBoulders');
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(bbcMock.calculateFallingStatusOnBoulders).toHaveBeenCalled();
	});
	
		it("Will call placeExplodingBlock when hit detected.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
	
		spyOn(eh, 'placeExplodingBlock');
		
		bc.detectMissileHit(mhMock, bbcMock);

		expect(eh.placeExplodingBlock).toHaveBeenCalled();
	});
});

describe("CollisionChecker.checkPlayerBoulderCollision", function () {
	let stage;
	let eh;
	let playerMock;
	let boulderMock;
	let bbcMock;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			eh = new BoulderBlaster.ExplosionHandler(stage);
			playerMock = {gridX: 0, gridY: 0, graphic: new PIXI.Graphics(), playerColor: 0x00ff00, lastGridXMove: 1};
			boulderMock = { gridX: 0, gridY: 0};
			bbcMock = { boulderBlocks: [boulderMock] };
			stage.addChild(playerMock.graphic);
  });
  
  it("Will return true when player and boulder is in same grid square.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		let result = bc.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result).toBe(true);
		
	});
  
  it("Will return false when player and boulder is not in same grid square.", function() {
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		playerMock.gridX = 1;
		let result1 = bc.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result1).toBe(false);
		
		playerMock.gridX = 0;
		playerMock.gridY = 1;
		let result2 = bc.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result2).toBe(false);
	});
	
	/* ToDo "move" this test to PlayerEntity specs.
	it("Will remvoe player block from stage.", function() {
		eh.placeExplodingBlock = function(x,y,z) {};
		
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);
		
		expect(stage.children.length).toBe(1);
		
		let result = bc.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(stage.children.length).toBe(0);
	});*/
	
	it("Will call placeExplodingBlock.", function() {
		spyOn(eh, 'placeExplodingBlock');
		
		let bc = new BoulderBlaster.CollisionChecker(stage, eh);

		let result = bc.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(eh.placeExplodingBlock).toHaveBeenCalled();
	});
});
