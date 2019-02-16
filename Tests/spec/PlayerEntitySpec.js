"use strict";

describe("PlayerEntity.placePlayer", function () {
    let stage;

	beforeEach(function () {
		stage = new PIXI.Container();
	});

    it("Can place Player.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage);

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

    it("Can call placePlayer twice without adding two player graphics.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage);

        expect(stage.children.length).toBe(0);

        player.placePlayer();

        expect(stage.children.length).toBe(1);

        player.placePlayer();

        expect(stage.children.length).toBe(1);
    });
});

describe("PlayerEntity.removePlayer", function () {
    let stage;

	beforeEach(function () {
		stage = new PIXI.Container();
	});

    it("Can remove Player.", function() {
        var player = new BoulderBlaster.PlayerEntity(stage);

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