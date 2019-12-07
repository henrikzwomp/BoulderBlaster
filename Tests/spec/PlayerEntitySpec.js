"use strict";

describe("PlayerEntity.placePlayer", function () {
    let stage;
    let resourceHolder;

	beforeEach(function () {
		stage = new PIXI.Container();
		resourceHolder = new BoulderBlaster.ResourceHolder();
	});

    it("Can place Player.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.gridX).not.toBeDefined();
        expect(player.gridY).not.toBeDefined();
        expect(player.graphic).not.toBeDefined();
        expect(player.isStaged).toBe(false);

        player.placePlayer();

        expect(player.gridX).toBeDefined();
        expect(player.gridY).toBeDefined();
        expect(player.graphic).toBeDefined();
        expect(player.isStaged).toBe(true);
    });
});

describe("PlayerEntity.removePlayer", function () {
    let stage;
    let resourceHolder;

	beforeEach(function () {
		stage = new PIXI.Container();
		resourceHolder = new BoulderBlaster.ResourceHolder();
	});

    it("Can remove Player.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.gridX).not.toBeDefined();
        expect(player.gridY).not.toBeDefined();
        expect(player.graphic).not.toBeDefined();
        expect(player.isStaged).toBe(false);

        player.placePlayer();
        player.removePlayer();

        expect(player.graphic).not.toBeDefined();
        expect(player.isStaged).toBe(false);
    });
});

describe("PlayerEntity.addFlame", function () {
    let stage;
    let resourceHolder;
    let player;

	beforeEach(function () {
		stage = new PIXI.Container();
		resourceHolder = new BoulderBlaster.ResourceHolder();
		player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);
	});

    it("Can place flame to the left", function() {
    	player.placePlayer();
    	
    	player.lastXPos = 6
    	player.graphic.position.x = 8;
      player.graphic.position.y = 10;
      player.flames = [];
      
      player.addFlame(player);
      
      expect(player.flames.length).toBe(1);
      
      expect(player.flames[0].position.x).toBeLessThan(player.graphic.position.x);
    });
    
    it("Can place flame to the right", function() {
    	player.placePlayer();
    	
    	player.lastXPos = 8
    	player.graphic.position.x = 6;
      player.graphic.position.y = 10;
      player.flames = [];
      
      player.addFlame(player);
      
      expect(player.flames.length).toBe(1);
      
      expect(player.flames[0].position.x).toBeGreaterThan(player.graphic.position.x);
    });
});

describe("PlayerEntity.updateFlames", function () {
    let stage;
    let resourceHolder;

	beforeEach(function () {
		stage = new PIXI.Container();
		resourceHolder = new BoulderBlaster.ResourceHolder();
	});

    it("Will update scale", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.flames.length).toBe(0);

        let flame = new PIXI.Graphics();
        flame.vs = 0.02;
        player.flames.push(flame);

        expect(player.flames[0].scale.x).toBe(1);
        expect(player.flames[0].scale.y).toBe(1);

        player.updateFlames();

        expect(player.flames[0].scale.x).toBeGreaterThan(1);
        expect(player.flames[0].scale.y).toBeGreaterThan(1);
    });

    it("Will set alpha to 0 and remove flame if scale is below zero.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.flames.length).toBe(0);

        let flame = new PIXI.Graphics();
        flame.vs = -1.1;
        player.flames.push(flame);

        expect(player.flames[0].scale.x).toBe(1);
        expect(player.flames[0].scale.y).toBe(1);

        expect(player.flames.length).toBe(1);

        spyOn(flame, 'destroy');

        player.updateFlames();

        expect(player.flames.length).toBe(0);

        expect(flame.destroy).toHaveBeenCalled();
    });

    it("Whil update alpha.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.flames.length).toBe(0);

        let flame = new PIXI.Graphics();
        flame.va = -0.05;
        player.flames.push(flame);

        expect(player.flames[0].alpha).toBe(1);

        player.updateFlames();

        expect(player.flames[0].alpha).toBeLessThan(1);
    });

    it("Will remove and destroy flame if alpha below zero.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage, resourceHolder);

        expect(player.flames.length).toBe(0);

        let flame = new PIXI.Graphics();
        flame.va = -1.1;
        player.flames.push(flame);

        expect(player.flames.length).toBe(1);

        spyOn(flame, 'destroy');

        player.updateFlames();

        expect(player.flames.length).toBe(0);

        expect(flame.destroy).toHaveBeenCalled();
    });
});