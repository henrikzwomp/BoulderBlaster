"use strict";

describe("BoulderCollection.generateBoulderFormation", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
  	});
	
	it("Can Generate a Boulder Formation.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		
		expect(bc.boulderBlocks.length).toBe(0);
		
		bc.generateBoulderFormation();
		
		expect(bc.boulderBlocks.length).not.toBe(0);
	});
	
	it("Don't generate boulders outside game grid X values.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		
		bc.gridSquares = 1;
		
		for(let i = 0; i < 100; i++)
			bc.generateBoulderFormation();
		
		let outsideLeft = 0;
		let outsideRight = 0;
		
		for(let i = 0; i < bc.boulderBlocks.length; i++) {
			if(bc.boulderBlocks[i].gridX < 0) outsideLeft++;
			if(bc.boulderBlocks[i].gridX > 0) outsideRight++;
		}
		
		expect(outsideLeft).toBe(0);
		expect(outsideRight).toBe(0);
	});
});

describe("BoulderCollection.calculateFallingStatusOnBoulders", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
  	});

	it("Can Calculate Falling Status On Boulders.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.gridSquares = 3;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1, resourceHolder);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1, resourceHolder)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 2, resourceHolder)
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 2, resourceHolder)
		bc.boulderBlocks.push(boulder22);

		bc.calculateFallingStatusOnBoulders();

		expect(boulder11.isFalling).toBe(true);
		expect(boulder12.isFalling).toBe(true);
		expect(boulder21.isFalling).toBe(false);
		expect(boulder22.isFalling).toBe(false);
	});
	
	it("Can reassign falling status if blocks below are cleared.", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.gridSquares = 3;

		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 0, 2, 1, resourceHolder));
		bc.boulderBlocks[0].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 1, 2, 1, resourceHolder));
		bc.boulderBlocks[1].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 2, 2, 1, resourceHolder));
		bc.boulderBlocks[2].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 0, 1, 2, resourceHolder));
		bc.boulderBlocks[3].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 1, 1, 2, resourceHolder));
		bc.boulderBlocks[4].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 2, 1, 2, resourceHolder));
		bc.boulderBlocks[5].isFalling = false;
		
		expect(bc.boulderBlocks.length).toBe(6);
		
		bc.clearBottomRowIfComplete(eh);
		bc.calculateFallingStatusOnBoulders();
		
		expect(bc.boulderBlocks.length).toBe(3);

		expect(bc.boulderBlocks[0].isFalling).toBe(true);
		expect(bc.boulderBlocks[1].isFalling).toBe(true);
		expect(bc.boulderBlocks[2].isFalling).toBe(true);
	});
});

describe("BoulderCollection.moveAllFallingBouldersDown", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
	  });
	  
	it("Can Move only falling Boulders Down.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.gridSquares = 3;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1, resourceHolder);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1, resourceHolder)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 2, resourceHolder)
		boulder21.isFalling = false;
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 2, resourceHolder)
		boulder22.isFalling = false;
		bc.boulderBlocks.push(boulder22);

		bc.moveAllFallingBouldersDown();

		expect(boulder11.gridY).toBe(1);
		expect(boulder12.gridY).toBe(2);
		expect(boulder21.gridY).toBe(1);
		expect(boulder22.gridY).toBe(2);
	});
});

describe("BoulderCollection.regroupBoulderFormation", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
  	});

	it("Can assign new group Ids to seperate formations.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.boulderFormationIdCount = 4;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1, resourceHolder);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1, resourceHolder)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 1, resourceHolder)
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 1, resourceHolder)
		bc.boulderBlocks.push(boulder22);

		bc.regroupBoulderFormation(1);

		expect(boulder11.groupId).not.toBe(1);
		expect(boulder12.groupId).not.toBe(1);
		expect(boulder21.groupId).not.toBe(1);
		expect(boulder22.groupId).not.toBe(1);

		expect(boulder11.groupId).not.toBe(boulder21.groupId);
		expect(boulder11.groupId).toBe(boulder12.groupId);
		expect(boulder21.groupId).toBe(boulder22.groupId);

	});
});

describe("BoulderCollection.clearBoulders", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
  	});
	
	it("Can clear Boulders (including graphics).", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		
		expect(bc.boulderBlocks.length).toBe(0);
		expect(stage.children.length).toBe(0);
		
		bc.generateBoulderFormation();
		
		expect(bc.boulderBlocks.length).not.toBe(0);
		expect(stage.children.length).not.toBe(0);

		bc.clearBoulders();

		expect(bc.boulderBlocks.length).toBe(0);
		expect(stage.children.length).toBe(0);
	});
});

describe("BoulderCollection.clearBottomRowIfComplete", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
	});

	it("Can clear bottom row if complete (and place exploding blocks).", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);

		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.gridSquares = 3;

		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 0, 2, 1, resourceHolder));
		bc.boulderBlocks[0].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 1, 2, 1, resourceHolder));
		bc.boulderBlocks[1].isFalling = false;

		spyOn(eh, "placeExplodingBlock");

		expect(bc.boulderBlocks.length).toBe(2);

		bc.clearBottomRowIfComplete(eh);

		expect(bc.boulderBlocks.length).toBe(2);

		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 2, 2, 1, resourceHolder));
		bc.boulderBlocks[2].isFalling = false;

		expect(bc.boulderBlocks.length).toBe(3);

		bc.clearBottomRowIfComplete(eh);

		expect(bc.boulderBlocks.length).toBe(0);
		expect(eh.placeExplodingBlock).toHaveBeenCalled();
	});
	
	it("Will ignore still falling blocks", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);

		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		bc.gridSquares = 3;

		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 0, 2, 1, resourceHolder));
		bc.boulderBlocks[0].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 1, 2, 1, resourceHolder));
		bc.boulderBlocks[1].isFalling = false;
		bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 2, 2, 1, resourceHolder));
		bc.boulderBlocks[2].isFalling = true;

		expect(bc.boulderBlocks.length).toBe(3);

		bc.clearBottomRowIfComplete(eh);

		expect(bc.boulderBlocks.length).toBe(3);
		
		bc.boulderBlocks[2].isFalling = false;

		bc.clearBottomRowIfComplete(eh);

		expect(bc.boulderBlocks.length).toBe(0);
	});

});

/*
Input 0	2	2	3	4	2	0	0	0	1	2	4	3	3	2	3
Output: 0,102	0,061	0,061	0,041	0,020	0,061	0,102	0,102	0,102	0,082	0,061	0,020	0,041	0,041	0,061	0,041

*/
describe("BoulderCollection.getColumnProbabilityShares", function () {
	let stage;
	let resourceHolder;
	
	beforeEach(function () {
			stage = new PIXI.Container();
			resourceHolder = new BoulderBlaster.ResourceHolder();
	});
	
	it("Can calculate Column probability shares.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		
		bc.gridSquares = 16;
		let blouderCount = [0,2,2,3,4,2,0,0,0,1,2,4,3,3,2,3];
		//bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);
		
		for(let i = 0; i < blouderCount.length; i++) {
			for(let j = 0; j < blouderCount[i]; j++) {
				bc.boulderBlocks.push(new BoulderBlaster.BoulderEntity(stage, i, 1, 1, resourceHolder));
			}
		}

		
		// BoulderEntity: function (stage, x, y, group_id)
		
		let result = bc.getColumnProbabilityShares();
		
		expect(result.length).toBe(16);
		expect(result[0]).toBeCloseTo(0.102, 2);
		expect(result[1]).toBeCloseTo(0.061, 2);
		expect(result[2]).toBeCloseTo(0.061, 2);
		expect(result[3]).toBeCloseTo(0.041, 2);
		expect(result[4]).toBeCloseTo(0.020, 2);
		expect(result[5]).toBeCloseTo(0.061, 2);
		expect(result[6]).toBeCloseTo(0.102, 2);
		expect(result[7]).toBeCloseTo(0.102, 2);
		expect(result[8]).toBeCloseTo(0.102, 2);
		expect(result[9]).toBeCloseTo(0.082, 2);
		expect(result[10]).toBeCloseTo(0.061, 2);
		expect(result[11]).toBeCloseTo(0.020, 2);
		expect(result[12]).toBeCloseTo(0.041, 2);
		expect(result[13]).toBeCloseTo(0.041, 2);
		expect(result[14]).toBeCloseTo(0.061, 2);
		expect(result[15]).toBeCloseTo(0.041, 2);
	});
	
	it("Can calculate Column probability shares with zero boulders.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage, resourceHolder);
		
		bc.gridSquares = 16;
	
		let result = bc.getColumnProbabilityShares();
		
		expect(result.length).toBe(16);
		expect(result[0]).toBeCloseTo(0.063, 2);
		expect(result[1]).toBeCloseTo(0.063, 2);
		expect(result[2]).toBeCloseTo(0.063, 2);
		expect(result[3]).toBeCloseTo(0.063, 2);
		expect(result[4]).toBeCloseTo(0.063, 2);
		expect(result[5]).toBeCloseTo(0.063, 2);
		expect(result[6]).toBeCloseTo(0.063, 2);
		expect(result[7]).toBeCloseTo(0.063, 2);
		expect(result[8]).toBeCloseTo(0.063, 2);
		expect(result[9]).toBeCloseTo(0.063, 2);
		expect(result[10]).toBeCloseTo(0.063, 2);
		expect(result[11]).toBeCloseTo(0.063, 2);
		expect(result[12]).toBeCloseTo(0.063, 2);
		expect(result[13]).toBeCloseTo(0.063, 2);
		expect(result[14]).toBeCloseTo(0.063, 2);
		expect(result[15]).toBeCloseTo(0.063, 2);
	});
});