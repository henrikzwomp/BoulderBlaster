"use strict";

describe("BlockEntity.constructor", function () {
	it("Can construct a BlockEntity", function() {
		let stage = new PIXI.Container();
		let x = 2;
		let y = 3;
		let color = 0xff00ff;
		let groupId = 10;
		
		expect(stage.children.length).toBe(0);
		
		var block = new BoulderBlaster.BlockEntity(stage, x, y, color, groupId);
		
		expect(block.gridX).toBe(x);
		expect(block.gridY).toBe(y);
		expect(block.isFalling).toBe(true);
		expect(block.groupId).toBe(groupId);
		
		expect(stage.children.length).toBe(1);
		
		expect(block.graphic).toBeDefined();
		expect(block.graphic.position).toBeDefined();
		
		expect(block.graphic.position.x).toBe(x * block.boxSize);
    expect(block.graphic.position.y).toBe(y * block.boxSize);
	});
});

describe("BlockEntity.updateBlockGraphicPosition", function () {
	it("Can move a BlockEntity", function() {
		var block = new BoulderBlaster.BlockEntity(new PIXI.Container(), 2, 2, 0xff00ff, 10);
		block.gridX = 3;
		block.gridY = 3;
		block.maxBlockSpeed = 400;
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize);
    	expect(block.graphic.position.y).toBe(2 * block.boxSize);
		
		block.updateBlockGraphicPosition();
		
		expect(block.graphic.position.x).toBe(3 * block.boxSize);
    	expect(block.graphic.position.y).toBe(3 * block.boxSize);
	});
	
	it("Will call effect function if defined", function() {
		let mock = {
      effect: function(obj) {}
    };
    
    spyOn(mock, "effect");
		
		var block = new BoulderBlaster.BlockEntity(new PIXI.Container(), 2, 2, 0xff00ff, 10);
		block.gridX = 3;
		block.gridY = 3;
		block.maxBlockSpeed = 400;
				
		block.updateBlockGraphicPosition(0, false, mock.effect);
		
		expect(mock.effect).toHaveBeenCalled();
		
	});
	
	it("Will use maxBlockSpeed when moveing block", function() {
		var block = new BoulderBlaster.BlockEntity(new PIXI.Container(), 2, 2, 0xff00ff, 10);
		block.gridX = 3;
		block.gridY = 3;
		block.maxBlockSpeed = 2;
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize);
    	expect(block.graphic.position.y).toBe(2 * block.boxSize);
		
		block.updateBlockGraphicPosition();
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize + block.maxBlockSpeed);
    	expect(block.graphic.position.y).toBe(2 * block.boxSize + block.maxBlockSpeed);
	});
	
	it("SuperSpeed will increse movement by 8", function() {
		var block = new BoulderBlaster.BlockEntity(new PIXI.Container(), 2, 2, 0xff00ff, 10);
		block.gridX = 3;
		block.gridY = 3;
		block.maxBlockSpeed = 2;
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize);
    	expect(block.graphic.position.y).toBe(2 * block.boxSize);
		
		block.updateBlockGraphicPosition(0, true);
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize + (block.maxBlockSpeed * 8));
    expect(block.graphic.position.y).toBe(2 * block.boxSize + (block.maxBlockSpeed * 8));
	});
	
	it("Will use Delta value when moveing block", function() {
		var block = new BoulderBlaster.BlockEntity(new PIXI.Container(), 2, 2, 0xff00ff, 10);
		block.gridX = 3;
		block.gridY = 3;
		block.maxBlockSpeed = 2;
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize);
    	expect(block.graphic.position.y).toBe(2 * block.boxSize);
		
		block.updateBlockGraphicPosition(1);
		
		expect(block.graphic.position.x).toBe(2 * block.boxSize + (block.maxBlockSpeed * 2));
    	expect(block.graphic.position.y).toBe(2 * block.boxSize + (block.maxBlockSpeed * 2));
	});

});