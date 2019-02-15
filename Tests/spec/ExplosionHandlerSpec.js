"use strict";

describe("ExplosionHandler.placeExplodingBlock", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});
	
	it("Can place out exploding blocks.", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		expect(eh.explodingBlocks.length).toBe(0);
		expect(stage.children.length).toBe(0);
		
		eh.placeExplodingBlock(64, 64, 0xff00ff);
		
		expect(eh.explodingBlocks.length).toBeGreaterThan(0);
		expect(stage.children.length).toBeGreaterThan(0);
	});
	
	it("Can add additional X movement.", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		eh.placeExplodingBlock(64, 64, 0xff00ff, 100);
		
		expect(eh.explodingBlocks.length).toBeGreaterThan(1);
		
		eh.explodingBlocks.forEach(function(block) {
			expect(block.vx).toBeGreaterThan(97);
		});
	});
});

describe("ExplosionHandler.moveExplodingBlocks", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
  	});
	
	it("Can move Exploding blocks", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		eh.placeExplodingBlock(64, 64, 0xff00ff);
		
		expect(eh.explodingBlocks.length).toBeGreaterThan(0);
		
		expect(eh.explodingBlocks[0].vx).toBeDefined();
		expect(eh.explodingBlocks[0].vy).toBeDefined();
		
		let x = eh.explodingBlocks[0].x;
		let y = eh.explodingBlocks[0].y;
		let vx = eh.explodingBlocks[0].vx;
		let vy = eh.explodingBlocks[0].vy;
		
		eh.moveExplodingBlocks();
		
		expect(eh.explodingBlocks[0].x).toBe(x + vx);
		expect(eh.explodingBlocks[0].y).toBe(y + vy);
	});
	
	it("Will fade Exploding blocks", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		eh.placeExplodingBlock(64, 64, 0xff00ff);
		
		expect(eh.explodingBlocks.length).toBeGreaterThan(0);
		
		expect(eh.explodingBlocks[0].alpha).toBeDefined();
		expect(eh.explodingBlocks[0].va).toBeDefined();
		
		let a = eh.explodingBlocks[0].alpha;
		let va = eh.explodingBlocks[0].va;
		
		eh.moveExplodingBlocks();
		
		expect(eh.explodingBlocks[0].alpha).toBe(a + va);
		expect(eh.explodingBlocks[0].alpha).toBeLessThan(a);
	});
	
	it("Will remove invisible blocks", function() {
		let eh = new BoulderBlaster.ExplosionHandler(stage);
		
		eh.placeExplodingBlock(64, 64, 0xff00ff);
		
		expect(eh.explodingBlocks.length).toBeGreaterThan(0);
		
		eh.explodingBlocks.forEach(function(block) {
			block.alpha = 0; 
		});
		
		eh.moveExplodingBlocks();
		
		expect(eh.explodingBlocks.length).toBe(0);
	});
});