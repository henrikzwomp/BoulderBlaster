"use strict";

describe("MissileHandler.createMissile", function () {
  let stage;
  
  beforeEach(function () {
       stage = new PIXI.Container();
  });
  
  it("Can create a Missile.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    expect(mh.missiles.length).toBe(0);

    mh.createMissile(0, 0, 1);

    expect(mh.missiles.length).toBe(1);
  });

  it("Can put Missile in right Y position when going downward.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    mh.createMissile(3, 3, 1);

    expect(mh.missiles.length).toBe(1);
    expect(mh.missiles[0].position.y).toBe((3 * mh.boxSize) + mh.boxSize + 1);
  });

  it("Can put Missile in right Y position when going upward.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    mh.createMissile(3, 3, -1);

    expect(mh.missiles.length).toBe(1);
    expect(mh.missiles[0].position.y).toBe((3 * mh.boxSize) - 1);
      
  });

  it("Will place new Missile at index 0 in the container's children array.", function() {
    stage.addChild(new PIXI.Graphics());
    stage.addChild(new PIXI.Graphics());

    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    mh.createMissile(0, 0, 1);

    expect(mh.missiles.length).toBe(1);
    expect(stage.children.length).toBeGreaterThan(0);

    expect(stage.children[0]).toBe(mh.missiles[0]);
  });
});

describe("MissileHandler.moveMissiles", function () {
  let stage;
  
  beforeEach(function () {
    stage = new PIXI.Container();
  });

  it("Can move Missile in right direction when going downward.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    mh.createMissile(3, 3, 1);
        
    expect(mh.missiles.length).toBe(1);
      
    let initial_possition = mh.missiles[0].position.y;

    mh.moveMissiles();

    expect(mh.missiles[0].position.y).toBeGreaterThan(initial_possition);
    expect(mh.missiles[0].position.y).toBe(initial_possition + mh.maxMissileSpeed)
  });

  it("Can move Missile in right direction when going upward.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
      
    mh.createMissile(3, 3, -1);
        
    expect(mh.missiles.length).toBe(1);
        
    let initial_possition = mh.missiles[0].position.y;

    mh.moveMissiles();

    expect(mh.missiles[0].position.y).toBeLessThan(initial_possition);
    expect(mh.missiles[0].position.y).toBe(initial_possition - mh.maxMissileSpeed)
  });

  it("Will add a flame when moving a Missile.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
        
    mh.createMissile(3, 3, 1);
        
    expect(mh.flames.length).toBe(0);
        
    mh.moveMissiles();

    expect(mh.flames.length).toBe(1);

    mh.moveMissiles();

    expect(mh.flames.length).toBe(2);
  });

  it("Will fade flame as Misslie is moving.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
        
    mh.createMissile(3, 3, 1);
        
    expect(mh.flames.length).toBe(0);
        
    mh.moveMissiles();

    expect(mh.flames.length).toBe(1);
    let flame_alpha = mh.flames[0].alpha;

    mh.moveMissiles();

    expect(mh.flames[0].alpha).toBeLessThan(flame_alpha);
  });

  it("Will remove flames that are invisible.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
        
    mh.createMissile(3, 3, 1);
        
    expect(mh.flames.length).toBe(0);
        
    mh.moveMissiles();

    expect(mh.flames.length).toBe(1);

    mh.moveMissiles();

    expect(mh.flames.length).toBe(2);

    mh.flames[0].alpha = 0;
    mh.flames[1].alpha = 0;

    mh.moveMissiles();

    expect(mh.flames.length).toBe(1);
  });

  it("Will remove misslies as they move outside the game area.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 96);
        
    mh.createMissile(2, 2, 1);
    mh.createMissile(2, 2, -1);
        
    expect(mh.missiles.length).toBe(2);

    for(let i = 0; i < 20; i++)
      mh.moveMissiles();

    expect(mh.missiles.length).toBe(0);
  });
});

describe("MissileHandler.addFlame", function () {
  let stage;
  
  beforeEach(function () {
    stage = new PIXI.Container();
  });

  it("Can create a Flame.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
    
    expect(mh.flames.length).toBe(0);
      
    mh.addFlame(64, 64, 1);
        
    expect(mh.flames.length).toBe(1);
  });

  it("Will place flame on the end of a downward going Missile.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
        
    mh.addFlame(64, 64, 1);
      
    expect(mh.flames.length).toBe(1);
    expect(mh.flames[0].position.y).toBe(64);
  });

  it("Will place flame on the end of a upward going Missile.", function() {
    let mh = new BoulderBlaster.MissileHandler(stage, 512);
        
    mh.addFlame(64, 64, -1);
        
    expect(mh.flames.length).toBe(1);
    expect(mh.flames[0].position.y).toBe(64 + mh.missileHeight - mh.missileWidth);
  });

  it("Will place new Flame at index 0 in the container's children array.", function() {
    stage.addChild(new PIXI.Graphics());
    stage.addChild(new PIXI.Graphics());

    let mh = new BoulderBlaster.MissileHandler(stage, 512);

    mh.addFlame(64, 64, 1);
        
    expect(mh.flames.length).toBe(1);
    expect(stage.children.length).toBeGreaterThan(0);

    expect(stage.children[0]).toBe(mh.flames[0]);
  });
});