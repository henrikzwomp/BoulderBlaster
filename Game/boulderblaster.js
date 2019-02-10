/*
 * __ToDo__
 * 
 * __Next__
 * Auto-explode a full line of boulders :)
 * Add background grid
 * Make new boulder placement less random. Incresed chance of new boulder where there is already a lower amount of boulders.
 * Some kind of intro in the beginning. 
 * Add "bottom line" to stage
 * Implement game over when boulds reach height limit
 * Red blinking background when boulds reach near height limit
 *
 * __Test__
 * Boulder logic - When boulder should start falling again
 * Collisions
 * Check that this always works: "Don't explode player if blasting block directly above"
*/
"use strict";

var gameSpecs = {
  boxSize: 32, 
  gridSquares: 16,
  maxBlockSpeed: 4, 
  maxMissileSpeed: 10, 
  boulderFrequency: 4,
  boulderColor: 0x808080,
  playerColor: 0x3498db, 
  missileColor: 0xee0000,
};

function BlockEntity(stage, x, y, color, group_id = 0) {
  this.graphic = new PIXI.Graphics()
  this.graphic.beginFill(color);
  this.graphic.drawRect(0, 0, gameSpecs.boxSize, gameSpecs.boxSize);
  this.graphic.endFill();
  this.graphic.position.x = x * gameSpecs.boxSize;
  this.graphic.position.y = y * gameSpecs.boxSize;
  
  this.gridX = x;
  this.gridY = y;
  this.isFalling = true;
  this.groupId = group_id;

  stage.addChild(this.graphic);

  this.updateBlockGraphicPosition = function() {
    var update_mades = 0;
    
    var speedX = 0;
    var targetX = this.gridX * gameSpecs.boxSize; 
    var diffX = Math.abs(targetX - this.graphic.position.x);
  
    if(diffX > 0){
      speedX = diffX < gameSpecs.maxBlockSpeed ? diffX : gameSpecs.maxBlockSpeed;
      speedX *= targetX > this.graphic.position.x ? 1 : -1;
      this.graphic.position.x += speedX; 
      update_mades++; 
    }
    
    var speedY = 0;
    var targetY = this.gridY * gameSpecs.boxSize;
    var diffY = Math.abs(targetY - this.graphic.position.y);
  
    if(diffY > 0){
      speedY = diffY < gameSpecs.maxBlockSpeed ? diffY : gameSpecs.maxBlockSpeed;
      speedY *= targetY > this.graphic.position.y ? 1 : -1;
      this.graphic.position.y += speedY; 
      update_mades++;
    }
  
    return update_mades;
  };
}

function PlayerEntity(stage) {
  BlockEntity.call(this, stage, 
    Math.floor(Math.random() * gameSpecs.gridSquares), 4, 
    gameSpecs.playerColor);

  this.lastGridXMove = 0;
}

function BoulderEntity(stage, x, y, group_id) {
  BlockEntity.call(this, stage, x, y, gameSpecs.boulderColor, group_id);
}

function BoulderCollectionEntity(stage) {
  this.gameStage = stage;
  this.boulderBlocks = [];
  this.boulderFormationIdCount = 0;

  this.generateBoulderFormation = function(start_y = -2) {
    var trigger = 0.8;
    var top_made = false;
    var left_made = false;
    var right_made = false;
    var bottom_made = false;
    var start_x = Math.floor(Math.random() * gameSpecs.gridSquares+1)-1;
    this.boulderFormationIdCount++;
    
    this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x, start_y, this.boulderFormationIdCount));
  
    if(Math.random() > trigger) {
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x, start_y-1, this.boulderFormationIdCount)); 
      top_made = true; 
    };
    if(start_x-1 >= 0 && Math.random() > trigger) {
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x-1, start_y, this.boulderFormationIdCount)); 
      left_made = true; 
    };
    if(Math.random() > trigger) {
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x+1, start_y, this.boulderFormationIdCount)); 
      right_made = true;
    };
    
    if(start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) {
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x, start_y+1, this.boulderFormationIdCount)); 
      bottom_made = true 
    };
    
    if((top_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x-1, start_y-1, this.boulderFormationIdCount));
    if((top_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x+1, start_y-1, this.boulderFormationIdCount));
    
    if((bottom_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x-1, start_y+1, this.boulderFormationIdCount));
    if((bottom_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
      this.boulderBlocks.push(new BoulderEntity(this.gameStage, start_x+1, start_y+1, this.boulderFormationIdCount));
  };

  this.calculateFallingStatusOnBoulders = function() {
    var gridMatrix = new Array(gameSpecs.gridSquares);
    for(let i = 0; i < gridMatrix.length; i++) {
      gridMatrix[i] = new Array(gameSpecs.gridSquares); 
    }
   
    this.boulderBlocks.forEach( function(stoneBlock)  {
      if(stoneBlock.gridY >= 0) {
        gridMatrix[stoneBlock.gridY][stoneBlock.gridX] = stoneBlock;
        stoneBlock.isFalling = true;
      }
    });
    
    for(let row = gameSpecs.gridSquares-1; row >= 0; row--) { // From bottom to top
      for(let column = 0; column < gameSpecs.gridSquares; column++) { // From left to right
        if(gridMatrix[row][column] !== undefined){
          var stone = gridMatrix[row][column];
          
          if(!stone.isFalling)
            continue;
          
          if(row == gameSpecs.gridSquares-1) // If at bottom, stopp falling
            stone.isFalling = false;
          else if(gridMatrix[row+1][column] !== undefined) { // If has rock below it.
            if(gridMatrix[row+1][column].isFalling === false)
              stone.isFalling = false;
          }
  
          if(!stone.isFalling) {
            // Stop all stoneblocks that are in the same group.
            this.boulderBlocks.filter(stoneBlock3 => stoneBlock3.groupId === stone.groupId)
              .forEach( function(stoneBlock2)  {
                stoneBlock2.isFalling = false;
            });
          }
        }
      }
    }
  };

  this.moveAllFallingBouldersDown = function() {
    this.boulderBlocks.forEach( function(stoneBlock)  {
      if(stoneBlock.gridY < gameSpecs.gridSquares - 1 && stoneBlock.isFalling)
        stoneBlock.gridY++;
    });
  };

  this.regroupBoulderFormation = function(groupId){
    var replaceGroup = function(gridMatrix, oldGroupId, newGroupId){
      for(let i = 0; i < gridMatrix.length; i++) {
        for(let j = 0; j < gridMatrix[i].length; j++){
          if(gridMatrix[i][j] !== undefined && gridMatrix[i][j].groupId === oldGroupId){
            gridMatrix[i][j].groupId = newGroupId;
          }
        }
      }
    };

    var gridMatrix = new Array(gameSpecs.gridSquares);
    for(let i = 0; i < gridMatrix.length; i++) {
      gridMatrix[i] = new Array(gameSpecs.gridSquares); 
    }
   
    this.boulderBlocks.forEach( function(stoneBlock)  {
      if(stoneBlock.groupId === groupId && stoneBlock.gridY >= 0) {
        stoneBlock.isFalling = true;
        stoneBlock.groupId = 0;
        gridMatrix[stoneBlock.gridY][stoneBlock.gridX] = stoneBlock;
      }
        
    });
    
    for(let i = 0; i < gridMatrix.length; i++) {
      for(let j = 0; j < gridMatrix[i].length; j++){
        if(gridMatrix[i][j] !== undefined && gridMatrix[i][j].groupId === 0){
          // If left is in group, copy
          if(i > 0 && gridMatrix[i-1][j] !== undefined && gridMatrix[i-1][j].groupId !== 0){
            gridMatrix[i][j].groupId = gridMatrix[i-1][j].groupId
            
            // If above is of different group. Replace group of above with current.
            if(j > 0 && gridMatrix[i][j-1] !== undefined && gridMatrix[i][j-1].groupId !== gridMatrix[i][j].groupId){
              replaceGroup(gridMatrix, gridMatrix[i][j-1].groupId, gridMatrix[i][j].groupId);
            }
          }
          // If above is in group, copy
          else if(j > 0 && gridMatrix[i][j-1] !== undefined && gridMatrix[i][j-1].groupId !== 0){
            gridMatrix[i][j].groupId = gridMatrix[i][j-1].groupId
          }
          // else set new group
          else {
            gridMatrix[i][j].groupId = ++this.boulderFormationIdCount;
          }
        }
      }
    }
  };
}

function MissileHandler(stage, appSize) {
  this.gameStage = stage;
  this.missiles = [];
  this.flames = [];
  this.applicationSize = appSize;

  this.createMissile = function(gridXPos, gridYPos, direction) {
    var missile = new PIXI.Graphics();
    missile.beginFill(gameSpecs.missileColor);
    missile.drawRect(0, 0, gameSpecs.boxSize / 4, gameSpecs.boxSize / 2);
    missile.endFill();
    missile.position.x = (gridXPos * gameSpecs.boxSize) + (gameSpecs.boxSize / 2) - (gameSpecs.boxSize / 8);
    
    if(direction === -1)
      missile.position.y = (gridYPos * gameSpecs.boxSize) - 1;
    else
      missile.position.y = (gridYPos * gameSpecs.boxSize) + gameSpecs.boxSize + 1;
    
    missile.direction = direction;
    missile.gridX = gridXPos;
    this.missiles.push(missile);
    this.gameStage.addChild(missile);
    this.gameStage.setChildIndex(missile, 0);
  };
  
  this.moveMissiles = function() {
    this.missiles.forEach(function(missile) {
      this.addFlame(missile.position.x, missile.position.y, missile.direction);
      missile.position.y += gameSpecs.maxMissileSpeed * missile.direction;
    }, this);
  
    while(this.missiles.length > 0 && 
      (this.missiles[0].position.y < 0 || this.missiles[0].position.y > this.applicationSize )) {
        this.missiles[0].destroy();
        this.missiles.shift();
    }
    
    this.flames.forEach(function(item) {
        item.alpha -= 0.1;
    });
    
    while(this.flames.length > 0 && this.flames[0].alpha < 0){
      this.gameStage.removeChild(this.flames[0]);
      this.flames.shift();
    }
  };

  this.addFlame = function(x,y,direction) {
    var flame = new PIXI.Graphics();
    flame.beginFill(gameSpecs.missileColor);
    flame.drawRect(0, 0, gameSpecs.boxSize / 4, gameSpecs.boxSize / 4);
    flame.endFill();
    flame.position.x = x;
    flame.position.y = y; // ToDo Fix
    this.flames.push(flame);
    this.gameStage.addChild(flame);
  };
}

var boulderBlaster = (function(){
  var application_size = 512;
  let app = new PIXI.Application({width: application_size, height: application_size});
        
  // variable
  var gameStage;
  var blocksToMove = false;
  var movesCounter = 0;
  
  var entities = {};
  var missileHandler = undefined;
  
  var initiateGameStage = function() {
    gameStage = new PIXI.Container();
    app.stage = gameStage;

    entities = {
      playerBlock: new PlayerEntity(gameStage), 
      boulderBlocks: new BoulderCollectionEntity(gameStage), 
      explodingBlocks: [], 
    };

    missileHandler = new MissileHandler(gameStage, application_size);

    entities.boulderBlocks.generateBoulderFormation(14);
    entities.boulderBlocks.generateBoulderFormation(10);
    entities.boulderBlocks.generateBoulderFormation(6);
    entities.boulderBlocks.generateBoulderFormation();
    entities.boulderBlocks.calculateFallingStatusOnBoulders();
  };

  var onKeyDown = function (key) {
    if(key.keyCode === 82) { // R
      initiateGameStage();
      key.preventDefault();
      return;
    }
  
    if(blocksToMove) // Wait for blocks to stop moving, before allowing next move.
      return;
  
    if (entities.playerBlock == undefined)
      return;
  
    entities.playerBlock.lastGridXMove = 0;
  
    if (keyMovesPlayerBlock(key.keyCode) || keyFiresMissle(key.keyCode)) {
      blocksToMove = true;
      movesCounter++;
      key.preventDefault();
  
      entities.boulderBlocks.moveAllFallingBouldersDown();
      entities.boulderBlocks.calculateFallingStatusOnBoulders();
      detectMissileHit(); // A new missile needs to hit adjecten block immediently 
      checkPlayerBoulderCollision();
  
      // Add new rock
      if (movesCounter >= gameSpecs.boulderFrequency) {
        entities.boulderBlocks.generateBoulderFormation();
          movesCounter = 0;
      }
    }
  
  };
  
  var keyMovesPlayerBlock = function(keyCode) {
    if (keyCode === 65 || keyCode === 37) { // A Key is 65,  Left arrow is 37
      if (entities.playerBlock.gridX > 0) {
          entities.playerBlock.gridX--;
          entities.playerBlock.lastGridXMove = -1;
          return true;
      }
    }
    else if (keyCode === 68 || keyCode === 39) { // D Key is 68,  Right arrow is 39
      if (entities.playerBlock.gridX != gameSpecs.gridSquares - 1) {
          entities.playerBlock.gridX++;
          entities.playerBlock.lastGridXMove = 1;
          return true;
      }
    }
  };
  
  var keyFiresMissle = function (keyCode) {
    if (keyCode === 87 || keyCode === 38) { // W Key is 87, Up arrow is 87
      missileHandler.createMissile(entities.playerBlock.gridX, entities.playerBlock.gridY, -1);
      return true;
    }
    else if (keyCode === 83 || keyCode === 40) { // S Key is 83,  Down arrow is 40
      missileHandler.createMissile(entities.playerBlock.gridX, entities.playerBlock.gridY, 1);
      return true;
    }
  };
  
  var gameLoop = function(delta) {
    var changesMade = 0;
  
    if(blocksToMove) {
      if (entities.playerBlock) changesMade =+ entities.playerBlock.updateBlockGraphicPosition();
      entities.boulderBlocks.boulderBlocks.forEach( function(stoneBlock) {changesMade += stoneBlock.updateBlockGraphicPosition();});
  
      if(changesMade === 0) blocksToMove = false;
    }
    moveExplodingBlocks();
  
    missileHandler.moveMissiles();
    detectMissileHit();
  };
    
  var detectMissileHit = function() {
    var removeMissilesIndexes = [];
    var removeBouldersIndexes = [];
  
    var m = missileHandler.missiles;
    var b = entities.boulderBlocks.boulderBlocks;
  
    for(let i = 0; i < m.length; i++) {
        for(let j = 0; j < b.length; j++) {
          if(m[i].gridX !== b[j].gridX)
            continue;
  
          if(m[i].position.y > b[j].graphic.position.y 
            && m[i].position.y < (b[j].graphic.position.y + gameSpecs.boxSize))
          {
            removeMissilesIndexes.push(i);
            removeBouldersIndexes.push(j);
          }
        }
    }
  
    for(let i = removeMissilesIndexes.length-1; i > -1; i--){
      var toDestroy = missileHandler.missiles[removeMissilesIndexes[i]];
      missileHandler.missiles.splice(removeMissilesIndexes[i], 1);
      gameStage.removeChild(toDestroy);
    }
  
    for(let i = removeBouldersIndexes.length-1; i > -1; i--){
      var toDestroy = entities.boulderBlocks.boulderBlocks[removeBouldersIndexes[i]];
      entities.boulderBlocks.boulderBlocks.splice(removeBouldersIndexes[i], 1);
      placeExplodingBlock(toDestroy.graphic.position.x, toDestroy.graphic.position.y, gameSpecs.boulderColor);
      entities.boulderBlocks.regroupBoulderFormation(toDestroy.groupId);
      gameStage.removeChild(toDestroy.graphic);
    }
  
    if(removeBouldersIndexes.length > 0){
      entities.boulderBlocks.calculateFallingStatusOnBoulders(); // ToDo: Move call to regroupBoulderFormation function?
    }
  };
      
  var placeExplodingBlock = function(x, y, color, addXMove = 0) {
    var helper = { 
      createBoxQuater: function(x, y, x_mod, y_mod, size_mod, color) { 
        var box1 = new PIXI.Graphics();
        box1.beginFill(color);
        box1.drawRect(0, 0, gameSpecs.boxSize/size_mod, gameSpecs.boxSize/size_mod);
        box1.endFill();
        box1.position.x = x - ( x_mod > 0 ? 0 : (gameSpecs.boxSize/size_mod));
        box1.position.y = y - ( y_mod > 0 ? 0 : (gameSpecs.boxSize/size_mod));
        box1.vx = 1 / size_mod * x_mod;
        box1.vy = 1 / size_mod * y_mod;
        box1.va = (Math.abs(box1.vy) > Math.abs(box1.vx) ? Math.abs(box1.vy / 20) : Math.abs(box1.vx / 20))*2;
        box1.vx += addXMove;
        entities.explodingBlocks.push(box1);
      }, 
      createBoxQuaterSet: function(x, y, x_mod, y_mod, color) {
        let a = this.addRandomAngle(x_mod, y_mod);
        this.createBoxQuater(x, y, a[0], a[1], 8, 0xff8000);
        a = this.addRandomAngle(x_mod, y_mod);
        this.createBoxQuater(x, y, a[0], a[1], 6, 0xff8000);
        a = this.addRandomAngle(x_mod, y_mod);
        this.createBoxQuater(x, y, a[0], a[1], 4, 0xff8000);
        this.createBoxQuater(x, y, x_mod, y_mod, 2, color);
      },
      addRandomAngle: function(x, y) {
        let base_angle = 90;
        let random = (Math.random() * (Math.PI/180) * base_angle) - (Math.PI/180 * base_angle/2);
        let px = x * Math.cos(random) - y * Math.sin(random); 
        let py = x * Math.sin(random) + y * Math.cos(random);
        return [px,py];
      }
    };
  
    x += gameSpecs.boxSize/2;
    y += gameSpecs.boxSize/2;
  
    helper.createBoxQuaterSet(x, y, -1, -1, color);
    helper.createBoxQuaterSet(x, y, 1, -1, color);
    helper.createBoxQuaterSet(x, y, -1, 1, color);
    helper.createBoxQuaterSet(x, y, 1, 1, color);
    entities.explodingBlocks.forEach(function(item) {gameStage.addChild(item);} );
  };
  
  var moveExplodingBlocks = function(){
    entities.explodingBlocks.forEach(function(item) {
        item.x += item.vx*2;
        item.y += item.vy*2;
        //item.alpha -= (Math.abs(item.vy) > Math.abs(item.vx) ? Math.abs(item.vy / 20) : Math.abs(item.vx / 20))*2;
        item.alpha -= item.va;
    });
    
    while(entities.explodingBlocks.length > 0 && entities.explodingBlocks[0].alpha < 0){
      gameStage.removeChild(entities.explodingBlocks[0]);
      entities.explodingBlocks.shift();
    }
  }
  
  var checkPlayerBoulderCollision = function() {
    var b = entities.boulderBlocks.boulderBlocks;
  
    for (let i = 0; i < b.length; i++) {
        if (b[i].gridX === entities.playerBlock.gridX &&
          b[i].gridY === entities.playerBlock.gridY) {
            placeExplodingBlock(entities.playerBlock.graphic.position.x, entities.playerBlock.graphic.position.y
              , gameSpecs.playerColor, entities.playerBlock.lastGridXMove * 0.5); 
            gameStage.removeChild(entities.playerBlock.graphic);
            entities.playerBlock = undefined;
            break;
        }
    }
  };

  return {
    initiate: function(document) {
      document.body.appendChild(app.view);
      initiateGameStage();
      app.ticker.add(delta => gameLoop(delta));
      document.addEventListener('keydown', onKeyDown);
    }

  };
})();

boulderBlaster.initiate(document);
