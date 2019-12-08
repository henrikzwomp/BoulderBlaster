"use strict";

describe("BoulderEntity.setEdges", function () {
    let stage;
    let resourceHolder;

    beforeEach(function () {
		stage = new PIXI.Container();
        resourceHolder = new BoulderBlaster.ResourceHolder();
    });
    
    it("Can set top.", function() {
        var boulder = new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);

        spyOn(resourceHolder, "getGraphic").and.callThrough();

        boulder.setEdges(true, false, false, false);

        expect(resourceHolder.getGraphic).toHaveBeenCalledWith('boulder_top');
    });

    it("Can set left.", function() {
        var boulder = new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);

        spyOn(resourceHolder, "getGraphic").and.callThrough();

        boulder.setEdges(false, true, false, false);

        expect(resourceHolder.getGraphic).toHaveBeenCalledWith('boulder_left');
    });

    it("Can set bottom.", function() {
        var boulder = new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);

        spyOn(resourceHolder, "getGraphic").and.callThrough();

        boulder.setEdges(false, false, true, false);

        expect(resourceHolder.getGraphic).toHaveBeenCalledWith('boulder_bottom');
    });

    it("Can set right.", function() {
        var boulder = new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);

        spyOn(resourceHolder, "getGraphic").and.callThrough();

        boulder.setEdges(false, false, false, true);

        expect(resourceHolder.getGraphic).toHaveBeenCalledWith('boulder_right');
    });

    it("Will redo edges if existing.", function() {
        var boulder = new BoulderBlaster.BoulderEntity(stage, 1, 1, 1, resourceHolder);

        spyOn(resourceHolder, "getGraphic").and.callThrough();

        boulder.setEdges(true, true, true, true);

        expect(boulder.graphic.children.length).toBe(5);

        boulder.setEdges(false, false, false, true);

        expect(resourceHolder.getGraphic).toHaveBeenCalledWith('boulder');

        expect(boulder.graphic.children.length).toBe(2);
    });
});