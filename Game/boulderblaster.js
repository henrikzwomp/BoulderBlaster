// consts
var gameSpecs = {
  boxSize: 32, 
  gridSquares: 16,
  maxBlockSpeed: 4, 
  maxMissileSpeed: 10, 
  boulderFrequency: 4,
  boulderColor: 0x808080,
};
      
// variable
var gameStage;
var boulderFormationIdCount = 0;
var blocksToMove = false;
var movesCounter = 0;

var entities = {};

function onKeyDown(key) {
  if(key.keyCode === 82) { // R
    initiateGameStage();
    key.preventDefault();
    return;
  }

  if(blocksToMove) // Wait for blocks to stop moving, before allowing next move.
    return;

  if (key.keyCode === 65 || key.keyCode === 37) { // A Key is 65,  Left arrow is 37
    if (entities.playerBlock.gridX > 0) {
      entities.playerBlock.gridX--;
      blocksToMove = true;
      movesCounter++;
    }
    key.preventDefault();
  }
  else if (key.keyCode === 68 || key.keyCode === 39) { // D Key is 68,  Right arrow is 39
    if (entities.playerBlock.gridX != gameSpecs.gridSquares - 1) {
      entities.playerBlock.gridX++;
      blocksToMove = true;
      movesCounter++;
    }
    key.preventDefault();
  } else if (key.keyCode === 87 || key.keyCode === 38) { // W Key is 87, Up arrow is 87
    createMissile(entities.playerBlock.gridX, entities.playerBlock.gridY, -1);
    blocksToMove = true;
    movesCounter++;
    key.preventDefault();
  }
  else if (key.keyCode === 83 || key.keyCode === 40) { // S Key is 83,  Down arrow is 40
    createMissile(entities.playerBlock.gridX, entities.playerBlock.gridY, 1);
    blocksToMove = true;
    movesCounter++;
    key.preventDefault();
  }

  moveAllFallingBouldersDown();
  calculateFallingStatusOnBoulders();

  // Add new rock
  if(movesCounter >= gameSpecs.boulderFrequency) {
    generateBoulderFormation();
    movesCounter = 0;
  }
}

function gameLoop(delta) {
  var changesMade = 0;

  if(blocksToMove) {
    changesMade =+ updateBlockGraphicPosition(entities.playerBlock);
    entities.boulderBlocks.forEach( function(stoneBlock) {changesMade += updateBlockGraphicPosition(stoneBlock);});

    if(changesMade === 0) blocksToMove = false;
  }
  moveExplodingBlocks();

  moveMissiles();
  detectMissileHit();
}

function initiateGameStage() {
  entities = {
    playerBlock: undefined, 
    boulderBlocks: [],
    missiles: [], 
    explodingBlocks: [], 
  };

  gameStage = new PIXI.Container();
  app.stage = gameStage;

  entities.playerBlock = createBlock(Math.floor(Math.random() * gameSpecs.gridSquares), 4, 0x3498db );

  generateBoulderFormation(14);
  generateBoulderFormation(10);
  generateBoulderFormation(6);
  //generateBoulderFormation(2);
  generateBoulderFormation();
}

function createBlock(x, y, color, group_id = 0) {
  //var block = {gridX:x,gridY:y,isFalling:true,groupId:group_id };

  var block = new PIXI.Graphics()
  block.beginFill(color);
  block.drawRect(0, 0, gameSpecs.boxSize, gameSpecs.boxSize);
  block.endFill();
  block.position.x = x * gameSpecs.boxSize;
  block.position.y = y * gameSpecs.boxSize;
  
  block.gridX = x;
  block.gridY = y;
  block.isFalling = true;
  block.groupId = group_id;

  gameStage.addChild(block);

  return block;
}

function generateBoulderFormation(start_y = -2) {
  var trigger = 0.8;
  var top_made = false;
  var left_made = false;
  var right_made = false;
  var bottom_made = false;
  var start_x = Math.floor(Math.random() * gameSpecs.gridSquares+1)-1;
  boulderFormationIdCount++;
  
  entities.boulderBlocks.push(createBlock(start_x, start_y, gameSpecs.boulderColor, boulderFormationIdCount));

  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y-1, gameSpecs.boulderColor, boulderFormationIdCount)); 
    top_made = true; 
  };
  if(start_x-1 >= 0 && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x-1, start_y, gameSpecs.boulderColor, boulderFormationIdCount)); 
    left_made = true; 
  };
  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x+1, start_y, gameSpecs.boulderColor, boulderFormationIdCount)); 
    right_made = true;
  };
  
  if(start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y+1, gameSpecs.boulderColor, boulderFormationIdCount)); 
    bottom_made = true 
  };
  
  if((top_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y-1, gameSpecs.boulderColor, boulderFormationIdCount));
  if((top_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y-1, gameSpecs.boulderColor, boulderFormationIdCount));
  
  if((bottom_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y+1, gameSpecs.boulderColor, boulderFormationIdCount));
  if((bottom_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y+1, gameSpecs.boulderColor, boulderFormationIdCount));
}

function updateBlockGraphicPosition(block) {
  var update_mades = 0;
  
  var speedX = 0;
  var targetX = block.gridX * gameSpecs.boxSize; 
  var diffX = Math.abs(targetX - block.position.x);

  if(diffX > 0){
    speedX = diffX < gameSpecs.maxBlockSpeed ? diffX : gameSpecs.maxBlockSpeed;
    speedX *= targetX > block.position.x ? 1 : -1;
    block.position.x += speedX; 
    update_mades++; 
  }
  
  var speedY = 0;
  var targetY = block.gridY * gameSpecs.boxSize;
  var diffY = Math.abs(targetY - block.position.y);

  if(diffY > 0){
    speedY = diffY < gameSpecs.maxBlockSpeed ? diffY : gameSpecs.maxBlockSpeed;
    speedY *= targetY > block.position.y ? 1 : -1;
    block.position.y += speedY; 
    update_mades++;
  }

  return update_mades;
}

function calculateFallingStatusOnBoulders() {
  var gridMatrix = new Array(gameSpecs.gridSquares);
  for(var i = 0; i < gridMatrix.length; i++) {
    gridMatrix[i] = new Array(gameSpecs.gridSquares); 
  }
 
  entities.boulderBlocks.forEach( function(stoneBlock)  {
    if(stoneBlock.gridY >= 0)
      gridMatrix[stoneBlock.gridY][stoneBlock.gridX] = stoneBlock;
  });
  
  for(var row = gameSpecs.gridSquares-1; row >= 0; row--) { // From bottom to top
      for(var column = 0; column < gameSpecs.gridSquares; column++) { // From left to right
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
            entities.boulderBlocks.filter(stoneBlock3 => stoneBlock3.groupId === stone.groupId)
              .forEach( function(stoneBlock2)  {
                stoneBlock2.isFalling = false;
            });
          }
        }
      }
  }
  
}

function moveAllFallingBouldersDown() {
  entities.boulderBlocks.forEach( function(stoneBlock)  {
    if(stoneBlock.gridY < gameSpecs.gridSquares - 1 && stoneBlock.isFalling)
      stoneBlock.gridY++;
  });
}

function createMissile(gridXPos, gridYPos, direction) {
  var missile = new PIXI.Graphics();
  missile.beginFill(0xee0000);
  missile.drawRect(0, 0, gameSpecs.boxSize / 4, gameSpecs.boxSize / 2);
  missile.endFill();
  missile.position.x = (gridXPos * gameSpecs.boxSize) + (gameSpecs.boxSize / 2) - (gameSpecs.boxSize / 8);
  missile.position.y = (gridYPos * gameSpecs.boxSize) + (gameSpecs.boxSize / 2) - (gameSpecs.boxSize / 4);
  missile.direction = direction;
  missile.gridX = gridXPos;
  entities.missiles.push(missile);
  gameStage.addChild(missile);
}

function moveMissiles() {
  entities.missiles.forEach(function(missile) {
    missile.position.y += gameSpecs.maxMissileSpeed * missile.direction;
  });

  while(entities.missiles.length > 0 && 
    (entities.missiles[0].position.y < 0 || entities.missiles[0].position.y > application_size )) {
    entities.missiles[0].destroy();
    entities.missiles.shift();
  }
}

function detectMissileHit() {
  var removeMissilesIndexes = [];
  var removeBouldersIndexes = [];

  var m = entities.missiles;
  var b = entities.boulderBlocks;

  for(i = 0; i < m.length; i++) {
      for(j = 0; j < b.length; j++) {
        if(m[i].gridX !== b[j].gridX)
          continue;

        if(m[i].position.y > b[j].position.y 
          && m[i].position.y < (b[j].position.y + gameSpecs.boxSize))
        {
          removeMissilesIndexes.push(i);
          removeBouldersIndexes.push(j);
        }
      }
  }

  for(i = removeMissilesIndexes.length-1; i > -1; i--){
    var toDestroy = entities.missiles[removeMissilesIndexes[i]];
    entities.missiles.splice(removeMissilesIndexes[i], 1);
    gameStage.removeChild(toDestroy);
  }

  for(i = removeBouldersIndexes.length-1; i > -1; i--){
    var toDestroy = entities.boulderBlocks[removeBouldersIndexes[i]];
    entities.boulderBlocks.splice(removeBouldersIndexes[i], 1);
    
    placeExplodingBlock(toDestroy.position.x, toDestroy.position.y, gameSpecs.boulderColor);
    gameStage.removeChild(toDestroy);
  }

  if(removeBouldersIndexes.length > 0){
    regroupBoulderFormation();
    calculateFallingStatusOnBoulders();
  }
}

function regroupBoulderFormation(){

  var gridMatrix = new Array(gameSpecs.gridSquares);
  for(var i = 0; i < gridMatrix.length; i++) {
    gridMatrix[i] = new Array(gameSpecs.gridSquares); 
  }
 
  entities.boulderBlocks.forEach( function(stoneBlock)  {
    if(stoneBlock.gridY >= 0) {
      stoneBlock.isFalling = true;
      stoneBlock.groupId = 0;
      gridMatrix[stoneBlock.gridY][stoneBlock.gridX] = stoneBlock;
    }
      
  });
  
  for(var i = 0; i < gridMatrix.length; i++) {
    for(var j = 0; j < gridMatrix[i].length; j++){
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
          gridMatrix[i][j].groupId = ++boulderFormationIdCount;
        }
        
        
      }
    }
  }
}

function replaceGroup(gridMatrix, oldGroupId, newGroupId){
  for(var i = 0; i < gridMatrix.length; i++) {
    for(var j = 0; j < gridMatrix[i].length; j++){
      if(gridMatrix[i][j] !== undefined && gridMatrix[i][j].groupId === oldGroupId){
        gridMatrix[i][j].groupId = newGroupId;
      }
    }
  }
}

function placeExplodingBlock(x, y, color) {
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
      entities.explodingBlocks.push(box1);
      console.log("ToDo");
    }, 
    createBoxQuaterSet: function(x, y, x_mod, y_mod, color) {
      a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 8, 0xff8000);
      a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 6, 0xff8000);
      a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 4, 0xff8000);
      this.createBoxQuater(x, y, x_mod, y_mod, 2, color);
    },
    addRandomAngle: function(x, y) {
      base_angle = 90;
      random = (Math.random() * (Math.PI/180) * base_angle) - (Math.PI/180 * base_angle/2);
      px = x * Math.cos(random) - y * Math.sin(random); 
      py = x * Math.sin(random) + y * Math.cos(random);
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
}

function moveExplodingBlocks(){
  entities.explodingBlocks.forEach(function(item) {
      item.x += item.vx*2;
      item.y += item.vy*2;
      item.alpha -= (Math.abs(item.vy) > Math.abs(item.vx) ? Math.abs(item.vy / 20) : Math.abs(item.vx / 20))*2;
  });
  
  while(entities.explodingBlocks.length > 0 && entities.explodingBlocks[0].alpha < 0){
    gameStage.removeChild(entities.explodingBlocks[0]);
    entities.explodingBlocks.shift();
  }
}