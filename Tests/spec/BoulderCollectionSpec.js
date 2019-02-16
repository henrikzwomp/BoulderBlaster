"use strict";

describe("BoulderCollection.generateBoulderFormation", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});
	
	it("Can Generate a Boulder Formation.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		
		expect(bc.boulderBlocks.length).toBe(0);
		
		bc.generateBoulderFormation();
		
		expect(bc.boulderBlocks.length).not.toBe(0);
	});
});

describe("BoulderCollection.calculateFallingStatusOnBoulders", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});

	it("Can Calculate Falling Status On Boulders.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		bc.gridSquares = 3;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 2)
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 2)
		bc.boulderBlocks.push(boulder22);

		bc.calculateFallingStatusOnBoulders();

		expect(boulder11.isFalling).toBe(true);
		expect(boulder12.isFalling).toBe(true);
		expect(boulder21.isFalling).toBe(false);
		expect(boulder22.isFalling).toBe(false);
	});
});

describe("BoulderCollection.moveAllFallingBouldersDown", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
	  });
	  
	it("Can Move only falling Boulders Down.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		bc.gridSquares = 3;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 2)
		boulder21.isFalling = false;
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 2)
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
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});

	it("Can assign new group Ids to seperate formations.", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		bc.boulderFormationIdCount = 4;

		let boulder11 = new BoulderBlaster.BoulderEntity(stage, 0, 0, 1);
		bc.boulderBlocks.push(boulder11);
		let boulder12 = new BoulderBlaster.BoulderEntity(stage, 0, 1, 1)
		bc.boulderBlocks.push(boulder12);

		let boulder21 = new BoulderBlaster.BoulderEntity(stage, 2, 1, 1)
		bc.boulderBlocks.push(boulder21);
		let boulder22 = new BoulderBlaster.BoulderEntity(stage, 2, 2, 1)
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
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});
	
	it("Can clear Boulders (including graphics).", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		
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
