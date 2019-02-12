describe("BlockEntity suite", function () {
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
});