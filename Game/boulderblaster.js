// consts
var gameSpecs = {
  boxSize: 32, 
  gridSquares: 16,
  maxBlockSpeed: 4, 
  boulderFrequency: 4
};
      
//var new_rock_every = 4;

// variable
var gameStage;
var stoneBoxIdCount = 0;
var blocksToMove = false;
var movesCounter = 0;

var entities = {
  playerBlock: undefined, 
  boulderBlocks: []
};

function onKeyDown(key) {
  if(key.keyCode === 82) { // R
    initiateGameStage();
    key.preventDefault();
    return;
  }

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
  }

  MoveAllFallingBouldersDown();
  CalculateFallingStatusOnRocks();

  // Add new rock
  if(movesCounter >= gameSpecs.boulderFrequency) {
    GenerateBoulderFormation();
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
    
}

function initiateGameStage() {
  gameStage = new PIXI.Container();
  app.stage = gameStage;

  entities.playerBlock = createBlock(Math.floor(Math.random() * gameSpecs.gridSquares), 7, 0x3498db );

  GenerateBoulderFormation(14);
  GenerateBoulderFormation(10);
  //GenerateBoulderFormation(6);
  GenerateBoulderFormation(2);
  GenerateBoulderFormation();
}

function createBlock(x, y, color, group_id = 0) {
  var block = {gridX:x,gridY:y,isFalling:true,groupId:group_id };

  var graphic = new PIXI.Graphics()
  graphic.beginFill(color);
  graphic.drawRect(0, 0, gameSpecs.boxSize, gameSpecs.boxSize);
  graphic.endFill();
  graphic.position.x = x * gameSpecs.boxSize;
  graphic.position.y = y * gameSpecs.boxSize;
  
  gameStage.addChild(graphic);
  block.graphic = graphic;

  return block;
}

function GenerateBoulderFormation(start_y = -2) {
  var trigger = 0.8;
  var top_made = false;
  var left_made = false;
  var right_made = false;
  var bottom_made = false;
  var start_x = Math.floor(Math.random() * gameSpecs.gridSquares+1)-1;
  stoneBoxIdCount++;
  
  entities.boulderBlocks.push(createBlock(start_x, start_y, 0x808080, stoneBoxIdCount));

  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y-1, 0x808080, stoneBoxIdCount)); 
    top_made = true; 
  };
  if(start_x-1 >= 0 && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x-1, start_y, 0x808080, stoneBoxIdCount)); 
    left_made = true; 
  };
  if(Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x+1, start_y, 0x808080, stoneBoxIdCount)); 
    right_made = true;
  };
  
  if(start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) {
    entities.boulderBlocks.push(createBlock(start_x, start_y+1, 0x808080, stoneBoxIdCount)); 
    bottom_made = true 
  };
  
  if((top_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y-1, 0x808080, stoneBoxIdCount));
  if((top_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y-1, 0x808080, stoneBoxIdCount));
  
  if((bottom_made || left_made) && start_x-1 >= 0 && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x-1, start_y+1, 0x808080, stoneBoxIdCount));
  if((bottom_made || right_made) && start_x-1 < gameSpecs.gridSquares && Math.random() > trigger) 
    entities.boulderBlocks.push(createBlock(start_x+1, start_y+1, 0x808080, stoneBoxIdCount));
}

function updateBlockGraphicPosition(block) {
  var update_mades = 0;
  
  var speedX = 0;
  var targetX = block.gridX * gameSpecs.boxSize; 
  var diffX = Math.abs(targetX - block.graphic.position.x);

  if(diffX > 0){
    speedX = diffX < gameSpecs.maxBlockSpeed ? diffX : gameSpecs.maxBlockSpeed;
    speedX *= targetX > block.graphic.position.x ? 1 : -1;
    block.graphic.position.x += speedX; 
    update_mades++; 
  }
  
  var speedY = 0;
  var targetY = block.gridY * gameSpecs.boxSize;
  var diffY = Math.abs(targetY - block.graphic.position.y);

  if(diffY > 0){
    speedY = diffY < gameSpecs.maxBlockSpeed ? diffY : gameSpecs.maxBlockSpeed;
    speedY *= targetY > block.graphic.position.y ? 1 : -1;
    block.graphic.position.y += speedY; 
    update_mades++;
  }

  return update_mades;
}

function CalculateFallingStatusOnRocks() {
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
            entities.boulderBlocks.filter(stoneBlock3 => stoneBlock3.groupId == stone.groupId)
              .forEach( function(stoneBox2)  {
                stoneBox2.isFalling = false;
            });
          }
        }
      }
  }
  
}

function MoveAllFallingBouldersDown() {
  entities.boulderBlocks.forEach( function(stoneBlock)  {
    if(stoneBlock.gridY < gameSpecs.gridSquares - 1 && stoneBlock.isFalling)
      stoneBlock.gridY++;
  });
}