describe("BoulderCollection suite", function () {
	let stage;
	
	beforeEach(function () {
			stage = new PIXI.Container();
  });
	
	it("Can Generate a Boulder Formation", function() {
		let bc = new BoulderBlaster.BoulderCollection(stage);
		
		expect(bc.boulderBlocks.length).toBe(0);
		
		bc.generateBoulderFormation();
		
		expect(bc.boulderBlocks.length).not.toBe(0);
	});
	
	it("Can Calculate Falling Status On Boulders", function() {
		// this.gridSquares = 3;
	});
});
/*
calculateFallingStatusOnBoulders
moveAllFallingBouldersDown
regroupBoulderFormation
*/