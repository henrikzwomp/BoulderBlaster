"use strict";

describe("CollisionHandler.detectMissileHit", function () {
	let missileMock;
	let boulderMock;
	let mhMock;
	let bbcMock;
	let stage;
	let resourceHolder;
	
	let mock = {
      boulderNeedsToExplodeFunction: function(obj) {}
    };
	
	beforeEach(function () {
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
			
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
			
			mhMock = { missiles: [missileMock], removeMissile: function() {} };
			bbcMock = new BoulderBlaster.BoulderCollection(stage, resourceHolder); //  { boulderBlocks: [boulderMock], regroupBoulderFormation : function(groupId) {}, calculateFallingStatusOnBoulders: function() {} };
			bbcMock.boulderBlocks = [boulderMock];
  });
	
	it("Can detect missile/boulder hit when Y positions are the same.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Will filter on gridX property.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		missileMock.gridX = 1;
	
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);
		
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		missileMock.gridX = 0;
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);
		
		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Can detect missile/boulder hit when graphics are overlapping. (Missile from above)", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		boulderMock.graphic.position.y = 8;

		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Can detect missile/boulder hit when graphics are overlapping. (Missile from below)", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		missileMock.position.y = 8;
	
		expect(mhMock.missiles.length).toBe(1);
		expect(bbcMock.boulderBlocks.length).toBe(1);
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(mhMock.missiles.length).toBe(0);
		expect(bbcMock.boulderBlocks.length).toBe(0);
	});
	
	it("Will call regroupBoulderFormation when hit detected.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		spyOn(bbcMock, 'regroupBoulderFormation');
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(bbcMock.regroupBoulderFormation).toHaveBeenCalled();
	});
	
	it("Will call calculateFallingStatusOnBoulders when hit detected.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
	
		spyOn(bbcMock, 'calculateFallingStatusOnBoulders');
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(bbcMock.calculateFallingStatusOnBoulders).toHaveBeenCalled();
	});
	
	it("Will call boulderNeedsToExplodeFunction when hit detected.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
	
		spyOn(mock, 'boulderNeedsToExplodeFunction');
		
		ch.detectMissileHit(mhMock, bbcMock, mock.boulderNeedsToExplodeFunction);

		expect(mock.boulderNeedsToExplodeFunction).toHaveBeenCalled();
	});
});

describe("CollisionHandler.checkPlayerBoulderCollision", function () {
	let playerMock;
	let boulderMock;
	let bbcMock;
	
	beforeEach(function () {
			playerMock = {gridX: 0, gridY: 0, graphic: new PIXI.Graphics(), playerColor: 0x00ff00, lastGridXMove: 1};
			boulderMock = { gridX: 0, gridY: 0};
			bbcMock = { boulderBlocks: [boulderMock] };
  });
  
  it("Will return true when player and boulder is in same grid square.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		let result = ch.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result).toBe(true);
		
	});
  
  it("Will return false when player and boulder is not in same grid square.", function() {
		let ch = new BoulderBlaster.CollisionHandler();
		
		playerMock.gridX = 1;
		let result1 = ch.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result1).toBe(false);
		
		playerMock.gridX = 0;
		playerMock.gridY = 1;
		let result2 = ch.checkPlayerBoulderCollision(playerMock, bbcMock);
		
		expect(result2).toBe(false);
	});
	
});
