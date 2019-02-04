// consts
var gameSpecs = {
  boxSize: 32, 
  gridSquares: 16,
  maxBlockSpeed: 4, 
  maxMissileSpeed: 10, 
  boulderFrequency: 4
};
      
//var new_rock_every = 4;

// variable
var gameStage;
var boulderFormationIdCount = 0;
var blocksToMove = false;
var movesCounter = 0;

var entities = {
  playerBlock: undefined, 
  boulderBlocks: [],
  missiles: []
};

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
  calculateFallingStatusOnRocks();

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

  moveMissiles();
  detectMissileHit();
}

function initiateGameStage() {
  gameStage = new PIXI.Container();
  app.stage = gameStage;

  entities.playerBlock = createBlock(Math.floor(Math.random() * gameSpecs.gridSquares), 7, 0x3498db );

  generateBoulderFormation(14);
  generateBoulderFormation(10);
  //GenerateBoulderFormation(6);
  generateBoulderFormation(2);
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
  
  entities.boulderBlocks.push(createBlock(start_x, start_y, 0x808080, boulderFormationIdCount));

  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y-1, 0x808080, boulderFormationIdCount)); 
    top_made = true; 
  };
  if(start_x-1 >= 0 && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x-1, start_y, 0x808080, boulderFormationIdCount)); 
    left_made = true; 
  };
  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x+1, start_y, 0x808080, boulderFormationIdCount)); 
    right_made = true;
  };
  
  if(start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y+1, 0x808080, boulderFormationIdCount)); 
    bottom_made = true 
  };
  
  if((top_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y-1, 0x808080, boulderFormationIdCount));
  if((top_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y-1, 0x808080, boulderFormationIdCount));
  
  if((bottom_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y+1, 0x808080, boulderFormationIdCount));
  if((bottom_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y+1, 0x808080, boulderFormationIdCount));
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

function calculateFallingStatusOnRocks() {
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
    gameStage.removeChild(toDestroy);
  }

  if(removeBouldersIndexes.length > 0){
    regroupBoulderFormation();
    calculateFallingStatusOnRocks();
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
