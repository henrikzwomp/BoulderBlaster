/*
 * __Next__
 * Auto-explode a full line of boulders :)
 * Add background grid
 --* Make new boulder placement less random. Incresed chance of new boulder where there is already a lower amount of boulders.--
 * Some kind of intro in the beginning. 
 * Add "bottom line" to stage
 * Implement game over when boulds reach height limit
 * Red blinking background when boulds reach near height limit
*/
"use strict";

var BoulderBlaster = {
  bbBase: function(stage) {
    this.gridSquares = 16;
    this.boxSize = 32;
    this.gameStage = stage;
  },

  BlockEntity: function(stage, x, y, color, group_id = 0) {
    BoulderBlaster.bbBase.call(this, stage);
    this.maxBlockSpeed = 4;

    this.graphic = new PIXI.Graphics()
    this.graphic.beginFill(color);
    this.graphic.drawRect(0, 0, this.boxSize, this.boxSize);
    this.graphic.endFill();
    this.graphic.position.x = x * this.boxSize;
    this.graphic.position.y = y * this.boxSize;
    
    this.gridX = x;
    this.gridY = y;
    this.isFalling = true;
    this.groupId = group_id;

    this.gameStage.addChild(this.graphic);

    this.updateBlockGraphicPosition = function() {
      var update_mades = 0;
      
      var speedX = 0;
      var targetX = this.gridX * this.boxSize; 
      var diffX = Math.abs(targetX - this.graphic.position.x);
    
      if(diffX > 0){
        speedX = diffX < this.maxBlockSpeed ? diffX : this.maxBlockSpeed;
        speedX *= targetX > this.graphic.position.x ? 1 : -1;
        this.graphic.position.x += speedX; 
        update_mades++; 
      }
      
      var speedY = 0;
      var targetY = this.gridY * this.boxSize;
      var diffY = Math.abs(targetY - this.graphic.position.y);
    
      if(diffY > 0){
        speedY = diffY < this.maxBlockSpeed ? diffY : this.maxBlockSpeed;
        speedY *= targetY > this.graphic.position.y ? 1 : -1;
        this.graphic.position.y += speedY; 
        update_mades++;
      }
    
      return update_mades;
    };
  }, 

  PlayerEntity: function(stage) {
  	this.isStaged = false;
    this.playerColor = 0x3498db;

    BoulderBlaster.bbBase.call(this, stage);

    this.lastGridXMove = 0;
    
    this.placePlayer = function() {
    	if(this.graphic)
    		this.graphic.destroy();
    	BoulderBlaster.BlockEntity.call(this, stage, 
      Math.floor(Math.random() * this.gridSquares), 4, 
      this.playerColor);
      this.isStaged = true;
    }

    this.removePlayer = function() {
    	this.graphic.destroy();
    	delete this.graphic;
    	this.isStaged = false;
    }
  },

  BoulderEntity: function (stage, x, y, group_id) {
    this.boulderColor = 0x808080;
    BoulderBlaster.BlockEntity.call(this, stage, x, y, this.boulderColor, group_id);
  }, 

  BoulderCollection: function(stage) {
    BoulderBlaster.bbBase.call(this, stage);
    this.boulderBlocks = [];
    this.boulderFormationIdCount = 0;

    this.generateBoulderFormation = function(start_y = -2) {
      var trigger = 0.7;
      var top_made = false;
      var left_made = false;
      var right_made = false;
      var bottom_made = false;
      
      // ToDo break out to own function
      var start_x = 0;
      var propShares = this.getColumnProbabilityShares();
      var propSum = 0;
      var randomValue = Math.random();
      
      for(let i = 0; i < propShares.length; i++) {
      	propSum += propShares[i];
      	if(randomValue < propSum) {
      		start_x = i;
      		break;
      	}
    	}
      
      //var start_x = Math.floor(Math.random() * this.gridSquares+1)-1;
      this.boulderFormationIdCount++;
      
      this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y, this.boulderFormationIdCount));
    
    	// Top?
      if(Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y-1, this.boulderFormationIdCount)); 
        top_made = true; 
      };
      // Left
      if((start_x-1) >= 0 && Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y, this.boulderFormationIdCount)); 
        left_made = true; 
      };
      // Right
      if((start_x+1) < this.gridSquares && Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y, this.boulderFormationIdCount)); 
        right_made = true;
      };
      // Bottom
      if(Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y+1, this.boulderFormationIdCount)); 
        bottom_made = true 
      };
      
      if((top_made || left_made) && (start_x-1) >= 0 && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y-1, this.boulderFormationIdCount));
      if((top_made || right_made) && (start_x+1) < this.gridSquares && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y-1, this.boulderFormationIdCount));
      
      if((bottom_made || left_made) && (start_x-1) >= 0 && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y+1, this.boulderFormationIdCount));
      if((bottom_made || right_made) && (start_x+1) < this.gridSquares && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y+1, this.boulderFormationIdCount));
    };

    this.calculateFallingStatusOnBoulders = function() {
      var gridMatrix = new Array(this.gridSquares);
      for(let i = 0; i < gridMatrix.length; i++) {
        gridMatrix[i] = new Array(this.gridSquares); 
      }
     
     
      this.boulderBlocks.forEach( function(stoneBlock)  {
        if(stoneBlock.gridY >= 0) {
          gridMatrix[stoneBlock.gridY][stoneBlock.gridX] = stoneBlock;
          stoneBlock.isFalling = true;
        }
      });
      
      for(let row = this.gridSquares-1; row >= 0; row--) { // From bottom to top
        for(let column = 0; column < this.gridSquares; column++) { // From left to right
          if(gridMatrix[row][column] !== undefined){
            var stone = gridMatrix[row][column];
            
            if(!stone.isFalling)
              continue;
            
            if(row == this.gridSquares-1) // If at bottom, stopp falling
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
        if(stoneBlock.gridY < stoneBlock.gridSquares - 1 && stoneBlock.isFalling)
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

      var gridMatrix = new Array(this.gridSquares);
      for(let i = 0; i < gridMatrix.length; i++) {
        gridMatrix[i] = new Array(this.gridSquares); 
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
    
    this.clearBoulders = function() {
    	this.boulderBlocks.forEach(function(block) { block.graphic.destroy(); });
    	this.boulderBlocks = [];
    };

    this.removeBoulder = function(index) {
      this.boulderBlocks[index].graphic.destroy();
      this.gameStage.removeChild(this.boulderBlocks[index].graphic);
      this.boulderBlocks.splice(index, 1);
    }

    this.clearBottomRowIfComplete = function(explosionHandler) {
        let bottomBouldersIndexes = [];

        for(let i = 0; i < this.boulderBlocks.length; i++){
          if(this.boulderBlocks[i].isFalling === false && this.boulderBlocks[i].gridY === this.gridSquares - 1 )
            bottomBouldersIndexes.push(i);
        }

        if(bottomBouldersIndexes.length < this.gridSquares ) // ToDo test
          return;

        for(let i = bottomBouldersIndexes.length-1; i > -1; i--){
          var toDestroy = this.boulderBlocks[bottomBouldersIndexes[i]];
          explosionHandler.placeExplodingBlock(toDestroy.graphic.position.x, toDestroy.graphic.position.y, toDestroy.boulderColor);
          this.removeBoulder(bottomBouldersIndexes[i]);
        }
    };
    
    this.getColumnProbabilityShares = function() {
    	/*
    	Better placement 
				Parse through boulders
					Sum number of boulder in each column (ColumnCount)
					Save biggest column count (MaxCount)
				For each column calulate: MaxCount-ColumnCount+1 (ColumnScore)
				Probability share of column: ColumnScore / (Sum all ColumnScore)
   	  */
    	
    	let column = new Array(this.gridSquares);
    	let maxColumnCount = 0;
    	
    	for(let i = 0; i < column.length; i++) { column[i] = 0 };
    	
    	this.boulderBlocks.forEach(function(boulder) {
    		console.log(boulder.gridX);
    		column[boulder.gridX]++;
    		if(column[boulder.gridX] > maxColumnCount)
    			maxColumnCount = column[boulder.gridX];
    	});
    	
    	let sumAll = 0;
    	for(let i = 0; i < column.length; i++) {
    		column[i] = maxColumnCount-column[i]+1;
    		sumAll += column[i];
    	}
    	
    	
    	for(let i = 0; i < column.length; i++) {
    		column[i] = column[i] / sumAll;
    	}
    	
    	return column;
    }
  }, 

  MissileHandler: function(stage, appSize) {
    BoulderBlaster.bbBase.call(this, stage);
    this.maxMissileSpeed = 10;
    this.missileColor = 0xee0000;

    this.missileWidth = this.boxSize / 4;
    this.missileHeight = this.boxSize / 2;

    this.missiles = [];
    this.flames = [];
    this.applicationSize = appSize;

    this.createMissile = function(gridXPos, gridYPos, direction) {
      var missile = new PIXI.Graphics();
      missile.beginFill(this.missileColor);
      missile.drawRect(0, 0, this.missileWidth, this.missileHeight);
      missile.endFill();
      missile.position.x = (gridXPos * this.boxSize) + (this.boxSize / 2) - (this.missileWidth / 2);
      
      if(direction === -1)
        missile.position.y = (gridYPos * this.boxSize) - 1;
      else
        missile.position.y = ((gridYPos+1) * this.boxSize) + 1;
      
      missile.direction = direction;
      missile.gridX = gridXPos;
      this.missiles.push(missile);
      this.gameStage.addChild(missile);
      this.gameStage.setChildIndex(missile, 0);
    };
    
    this.moveMissiles = function() {
      this.missiles.forEach(function(missile) {
        this.addFlame(missile.position.x, missile.position.y, missile.direction);
        missile.position.y += this.maxMissileSpeed * missile.direction;
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
      flame.beginFill(this.missileColor);
      flame.drawRect(0, 0, this.missileWidth, this.missileWidth);
      flame.endFill();
      flame.position.x = x;
      if(direction === -1)
        flame.position.y = y + this.missileHeight - this.missileWidth;
      else
        flame.position.y = y;
      this.flames.push(flame);
      this.gameStage.addChild(flame);
      this.gameStage.setChildIndex(flame, 0);
    };
  }, 

  CollisionHandler: function (stage, exploHandler) {
    BoulderBlaster.bbBase.call(this, stage);
    this.explosionHandler = exploHandler;
    
    this.detectMissileHit = function(missileHandler, bbCollection) {
      var removeMissilesIndexes = [];
      var removeBouldersIndexes = [];
    
      var m = missileHandler.missiles;
      var b = bbCollection.boulderBlocks;
      
      for(let i = 0; i < m.length; i++) {
          for(let j = 0; j < b.length; j++) {
            if(m[i].gridX !== b[j].gridX)
              continue;

            if((m[i].position.y + m[i].height) >= b[j].graphic.position.y 
              && m[i].position.y <= (b[j].graphic.position.y + b[j].graphic.height))
            {
              removeMissilesIndexes.push(i);
              removeBouldersIndexes.push(j);
            }
          }
      }
    
      for(let i = removeMissilesIndexes.length-1; i > -1; i--){
        var toDestroy = missileHandler.missiles[removeMissilesIndexes[i]];
        missileHandler.missiles.splice(removeMissilesIndexes[i], 1);
        this.gameStage.removeChild(toDestroy);
        toDestroy.destroy();
      }
    
      for(let i = removeBouldersIndexes.length-1; i > -1; i--){
        var toDestroy = bbCollection.boulderBlocks[removeBouldersIndexes[i]];
        this.explosionHandler.placeExplodingBlock(toDestroy.graphic.position.x, toDestroy.graphic.position.y, toDestroy.boulderColor);
        bbCollection.removeBoulder(removeBouldersIndexes[i]);
      }
    
      if(removeBouldersIndexes.length > 0){
        bbCollection.regroupBoulderFormation(toDestroy.groupId);
        bbCollection.calculateFallingStatusOnBoulders();
      }
    };
    
    this.checkPlayerBoulderCollision = function(playerBlock, bbCollection) {
      var b = bbCollection.boulderBlocks;
    
      for (let i = 0; i < b.length; i++) {
          if (b[i].gridX === playerBlock.gridX &&
            b[i].gridY === playerBlock.gridY) {
              this.explosionHandler.placeExplodingBlock(playerBlock.graphic.position.x, playerBlock.graphic.position.y
                , playerBlock.playerColor, playerBlock.lastGridXMove * 0.5); 
              return true;
          }
      }
      return false;
    };
  }, 

  ExplosionHandler: function(stage) {
    BoulderBlaster.bbBase.call(this, stage);
    this.explodingBlocks = [];
    
    this.placeExplodingBlock = function(x, y, color, addXMove = 0) {
      x += this.boxSize/2;
      y += this.boxSize/2;
    
      this.createBoxQuaterSet(x, y, -1, -1, color, addXMove);
      this.createBoxQuaterSet(x, y, 1, -1, color, addXMove);
      this.createBoxQuaterSet(x, y, -1, 1, color, addXMove);
      this.createBoxQuaterSet(x, y, 1, 1, color, addXMove);
      this.explodingBlocks.forEach(function(item) {this.gameStage.addChild(item);}, this );
    };
    
    this.moveExplodingBlocks = function(){
      this.explodingBlocks.forEach(function(item) {
          item.x += item.vx;
          item.y += item.vy;
          item.alpha += item.va;
      });
      
      while(this.explodingBlocks.length > 0 && this.explodingBlocks[0].alpha < 0){
        this.gameStage.removeChild(this.explodingBlocks[0]);
        this.explodingBlocks.shift();
      }
    };
    
    this.createBoxQuater = function(x, y, x_mod, y_mod, size_mod, color, addXMove) { 
      var box1 = new PIXI.Graphics();
      box1.beginFill(color);
      box1.drawRect(0, 0, this.boxSize/size_mod, this.boxSize/size_mod);
      box1.endFill();
      box1.position.x = x - ( x_mod > 0 ? 0 : (this.boxSize/size_mod));
      box1.position.y = y - ( y_mod > 0 ? 0 : (this.boxSize/size_mod));
      box1.vx = (1 / size_mod * x_mod)*2;
      box1.vy = (1 / size_mod * y_mod)*2;
      box1.va = (Math.abs(box1.vy) > Math.abs(box1.vx) ? Math.abs(box1.vy / 20) : Math.abs(box1.vx / 20))*-2;
      box1.vx += addXMove;
      this.explodingBlocks.push(box1);
    };
        
    this.createBoxQuaterSet = function(x, y, x_mod, y_mod, color, addXMove) {
      let a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 8, 0xff8000, addXMove);
      a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 6, 0xff8000, addXMove);
      a = this.addRandomAngle(x_mod, y_mod);
      this.createBoxQuater(x, y, a[0], a[1], 4, 0xff8000, addXMove);
      this.createBoxQuater(x, y, x_mod, y_mod, 2, color, addXMove);
    };
    
    this.addRandomAngle = function(x, y) {
      let base_angle = 90;
      let random = (Math.random() * (Math.PI/180) * base_angle) - (Math.PI/180 * base_angle/2);
      let px = x * Math.cos(random) - y * Math.sin(random); 
      let py = x * Math.sin(random) + y * Math.cos(random);
      return [px,py];
    };
  }, 
  
  GameLogic: function(pixi_app, size, pb, mh, bbc, cc, eh) {
    let application_size = size;
    let app = pixi_app;
    var boulderFrequency = 4;
    var blocksToMove = false;
    var movesCounter = 0;

    let playerBlock = pb;
    let missileHandler = mh;
    let bbCollection = bbc;
    let CollisionHandler = cc;
    let explosionHandler = eh;
    
    this.startGame = function() {
    	setGameStage();
    };
    
    var setGameStage = function() {
    	playerBlock.placePlayer();
    	bbCollection.clearBoulders();
    	bbCollection.generateBoulderFormation(14);
      bbCollection.generateBoulderFormation(10);
      bbCollection.generateBoulderFormation(6);
      bbCollection.generateBoulderFormation();
      bbCollection.calculateFallingStatusOnBoulders();
    };
    
    this.onKeyDown = function (key) {
      if(key.keyCode === 82) { // R
        setGameStage();
        key.preventDefault();
        return;
      }

      if(blocksToMove) // Wait for blocks to stop moving, before allowing next move.
        return;
    
      if (!playerBlock.isStaged)
        return;
    
      playerBlock.lastGridXMove = 0;
    
      if (keyMovesPlayerBlock(key.keyCode) || keyFiresMissle(key.keyCode)) {
        blocksToMove = true;
        movesCounter++;
        key.preventDefault();
    
        bbCollection.moveAllFallingBouldersDown();
        bbCollection.calculateFallingStatusOnBoulders();
        CollisionHandler.detectMissileHit(missileHandler, bbCollection); // A new missile needs to hit adjecten block immediently 
        if(CollisionHandler.checkPlayerBoulderCollision(playerBlock, bbCollection))
          playerBlock.removePlayer();

        // Add new rock
        if (movesCounter >= boulderFrequency) {
          bbCollection.generateBoulderFormation();
            movesCounter = 0;
        }
      }
    
    };
    
    var keyMovesPlayerBlock = function(keyCode) {
      if (keyCode === 65 || keyCode === 37) { // A Key is 65,  Left arrow is 37
        if (playerBlock.gridX > 0) {
            playerBlock.gridX--;
            playerBlock.lastGridXMove = -1;
            return true;
        }
      }
      else if (keyCode === 68 || keyCode === 39) { // D Key is 68,  Right arrow is 39
        if (playerBlock.gridX != playerBlock.gridSquares - 1) {
            playerBlock.gridX++;
            playerBlock.lastGridXMove = 1;
            return true;
        }
      }
    };
    
    var keyFiresMissle = function (keyCode) {
      if (keyCode === 87 || keyCode === 38) { // W Key is 87, Up arrow is 87
        missileHandler.createMissile(playerBlock.gridX, playerBlock.gridY, -1);
        return true;
      }
      else if (keyCode === 83 || keyCode === 40) { // S Key is 83,  Down arrow is 40
        missileHandler.createMissile(playerBlock.gridX, playerBlock.gridY, 1);
        return true;
      }
    };
    
    this.gameLoop = function(delta) {
      var changesMade = 0;
    
      if(blocksToMove) {
        if (playerBlock.isStaged) changesMade =+ playerBlock.updateBlockGraphicPosition();
        bbCollection.boulderBlocks.forEach( function(stoneBlock) {changesMade += stoneBlock.updateBlockGraphicPosition();});
    
        if(changesMade === 0) blocksToMove = false;
      }
      explosionHandler.moveExplodingBlocks();
      missileHandler.moveMissiles();
      CollisionHandler.detectMissileHit(missileHandler, bbCollection);
      if(blocksToMove === false) {
        bbCollection.clearBottomRowIfComplete(explosionHandler);
      }
    };
  },

  Game: function() {
    let application_size = 512;
    let app;
    let logic;
    
    var gameStage;

    this.initiate = function(document) {
      app = new PIXI.Application({width: application_size, height: application_size});
      
      gameStage = new PIXI.Container();
      app.stage = gameStage;
      
      let eh = new BoulderBlaster.ExplosionHandler(gameStage);
      
      logic = new BoulderBlaster.GameLogic(app, application_size, 
        new BoulderBlaster.PlayerEntity(gameStage),
        new BoulderBlaster.MissileHandler(gameStage, application_size),
        new BoulderBlaster.BoulderCollection(gameStage),
        new BoulderBlaster.CollisionHandler(gameStage, eh), eh)

      document.body.appendChild(app.view);
      app.ticker.add(delta => logic.gameLoop(delta));
      document.addEventListener('keydown', logic.onKeyDown);
      
      logic.startGame();
    };
  },
  

};