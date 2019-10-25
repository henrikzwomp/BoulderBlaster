/*
 * __Next__
 * --Auto-explode a full line of boulders :)--
 * --Add background grid--
 * --Make new boulder placement less random. Incresed chance of new boulder where there is already a lower amount of boulders.--
 * --Some kind of intro in the beginning. --
 * --Add "bottom line" to stage--
 * Skipp: Implement game over when boulds reach height limit
 * Skipp: Red blinking background when boulds reach near height limit
 
 * --Game over screen--
 * --Start screen / Help text--
 * Scoreboard
 
 Known bugs
 * Quickly shooting two boulders right above ship will result in game over.


*/
"use strict";

var BoulderBlaster = {
  bbBase: function(stage) {
    this.gridSquares = 16;
    this.boxSize = 32;
    this.gameStage = stage;
  },

  BlockEntity: function(stage, x, y, color, group_id = 0, sprite = undefined) {
    BoulderBlaster.bbBase.call(this, stage);
    this.maxBlockSpeed = 2;

		if(sprite != undefined) {
			this.graphic = sprite;
		}
		else {
			this.graphic = new PIXI.Graphics()
    	this.graphic.beginFill(color);
    	this.graphic.drawRect(0, 0, this.boxSize, this.boxSize);
    	this.graphic.endFill();
		}

		this.graphic.position.x = x * this.boxSize;
   	this.graphic.position.y = y * this.boxSize;
    this.gridX = x;
    this.gridY = y;
    this.isFalling = true;
    this.groupId = group_id;

    this.gameStage.addChild(this.graphic);

    this.updateBlockGraphicPosition = function(delta = 0, superSpeed = false, effect = null) {
    	let speed = superSpeed ? 8 * this.maxBlockSpeed : this.maxBlockSpeed;
    	speed += speed * delta; // Not sure if this is correct.
      var update_mades = 0;
      
      var speedX = 0;
      var targetX = this.gridX * this.boxSize; 
      var diffX = Math.abs(targetX - this.graphic.position.x);
      
      if(diffX > 0){
        speedX = diffX < speed ? diffX : speed;
        speedX *= targetX > this.graphic.position.x ? 1 : -1;
        this.graphic.position.x += speedX; 
        update_mades++; 
      }
      
      var speedY = 0;
      var targetY = this.gridY * this.boxSize;
      var diffY = Math.abs(targetY - this.graphic.position.y);
    
      if(diffY > 0){
        speedY = diffY < speed ? diffY : speed;
        speedY *= targetY > this.graphic.position.y ? 1 : -1;
        this.graphic.position.y += speedY; 
        update_mades++;
      }
      
      if(effect) // ToDo Test
      	effect(this);
    
      return update_mades;
    };
  }, 

  PlayerEntity: function(stage, resourceHolder) {
  	this.isStaged = false;
    this.playerColor = 0xFFD800;
    this.flames = [];  // ToDo: Should be rename

    BoulderBlaster.bbBase.call(this, stage);

    this.lastGridXMove = 0;
    this.lastXPos = 0;
    
    this.placePlayer = function() {
    	if(this.graphic)
    		this.graphic.destroy();
    	
    	BoulderBlaster.BlockEntity.call(this, stage, Math.floor(Math.random() * this.gridSquares), 4, 
    		this.playerColor, 0, resourceHolder.getGraphic('ship') ); // new PIXI.Sprite(resources.ship.texture)

      this.isStaged = true;
      
      this.lastXPos  = this.graphic.position.x;

      // Intro effect
      let cSmaller = new PIXI.Graphics();
      cSmaller.beginFill(0xccffff);
      cSmaller.drawCircle(0,0,64)
      cSmaller.position.x = this.gridX * this.boxSize + this.boxSize / 2;
      cSmaller.position.y = this.gridY * this.boxSize + this.boxSize / 2;
      cSmaller.endFill();
      cSmaller.alpha = 0;
      cSmaller.va = 0.02;
      cSmaller.vs = -0.03;
  
      let cBigger = new PIXI.Graphics();
      cBigger.beginFill(0xccffff);
      cBigger.drawCircle(0,0,10)
      cBigger.position.x = this.gridX * this.boxSize + this.boxSize / 2;
      cBigger.position.y = this.gridY * this.boxSize + this.boxSize / 2;
      cBigger.endFill();
      cBigger.va = -0.04;
      cBigger.vs = 0.2;

      this.flames.push(cSmaller);
		  stage.addChild(cSmaller);
      stage.setChildIndex(cSmaller, 0);
      this.flames.push(cBigger);
		  stage.addChild(cBigger);
		  stage.setChildIndex(cBigger, stage.children.length-1);
    }

    this.removePlayer = function() {
    	if(this.graphic) {// ToDo Test
    		this.graphic.destroy();
    		delete this.graphic;
    	}
    	this.isStaged = false;
    }

		// ToDo position is wrong
		this.addFlame = function(obj) { // ToDo Test
			let x1 = obj.lastXPos;
			let x2 = obj.graphic.position.x;
			let y = obj.graphic.position.y;
			let direction = x1 > x2 ? -1 : 1;
			
			let flame = new PIXI.Graphics();
		  flame.beginFill(0xc0f0f0);
		  flame.drawRect(0, 0, (x1-x2) * 0.85 , 6);
		  flame.endFill();
		  
		  flame.position.y = y + 16 - (flame.height/2);
		  
		  if(direction < 0) {
		  	flame.position.x = x2+32;
		  }
		  else {
		  	flame.position.x = x2;
		  }
		    
		  flame.va = -0.05;
		  
		  obj.flames.push(flame);
		  stage.addChild(flame);
		  stage.setChildIndex(flame, 0);
		  
		  obj.lastXPos  = obj.graphic.position.x;
		}
		
		this.updateFlames = function() {
			this.flames.forEach(flame => {
        flame.alpha += flame.va;
        
        if(flame.vs){
          flame.scale.x += flame.vs;
          flame.scale.y += flame.vs;

          if(flame.scale.x < 0)
            flame.alpha = 0;
        }
        
			});
			
			while(this.flames.length > 0 && this.flames[0].alpha <= 0) {
				this.flames[0].destroy();
				this.flames.shift();
			}
		}
  },

  BoulderEntity: function (stage, x, y, group_id, resourceHolder) {
    this.boulderColor = 0x808080;
    
    let boulderEntity = new PIXI.Container();
    boulderEntity.addChild(resourceHolder.getGraphic('boulder')); // new PIXI.Sprite(resources.boulder.texture)
    
    BoulderBlaster.BlockEntity.call(this, stage, x, y, this.boulderColor, group_id, boulderEntity);
    
    // ToDo Test
    this.setEdges = function(top, left, bottom, right) {
    	if(this.graphic && this.graphic.children && this.graphic.children.length > 1) {
    		this.graphic.removeChildren();
    		this.graphic.addChild(resourceHolder.getGraphic('boulder')); // new PIXI.Sprite(resources.boulder.texture)
    	}
    	
    	if(bottom)
    		this.graphic.addChild(resourceHolder.getGraphic('boulder_bottom')); // new PIXI.Sprite(resources.boulder_bottom.texture)
    	if(right)
    		this.graphic.addChild(resourceHolder.getGraphic('boulder_right')); // new PIXI.Sprite(resources.boulder_right.texture)
    	if(left)
    		this.graphic.addChild(resourceHolder.getGraphic('boulder_left')); // new PIXI.Sprite(resources.boulder_left.texture)
    	if(top)
    		this.graphic.addChild(resourceHolder.getGraphic('boulder_top')); // new PIXI.Sprite(resources.boulder_top.texture)
    		
    }
  }, 

  BoulderCollection: function(stage, resources) {
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
      
      this.boulderFormationIdCount++;
      
      this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y, this.boulderFormationIdCount, resources));
    
    	// Top?
      if(Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y-1, this.boulderFormationIdCount, resources)); 
        top_made = true; 
      };
      // Left
      if((start_x-1) >= 0 && Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y, this.boulderFormationIdCount, resources)); 
        left_made = true; 
      };
      // Right
      if((start_x+1) < this.gridSquares && Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y, this.boulderFormationIdCount, resources)); 
        right_made = true;
      };
      // Bottom
      if(Math.random() > trigger) {
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x, start_y+1, this.boulderFormationIdCount, resources)); 
        bottom_made = true 
      };
      
      if((top_made || left_made) && (start_x-1) >= 0 && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y-1, this.boulderFormationIdCount, resources));
      if((top_made || right_made) && (start_x+1) < this.gridSquares && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y-1, this.boulderFormationIdCount, resources));
      
      if((bottom_made || left_made) && (start_x-1) >= 0 && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x-1, start_y+1, this.boulderFormationIdCount, resources));
      if((bottom_made || right_made) && (start_x+1) < this.gridSquares && Math.random() > trigger) 
        this.boulderBlocks.push(new BoulderBlaster.BoulderEntity(this.gameStage, start_x+1, start_y+1, this.boulderFormationIdCount, resources));
        
      this.setBoulderGroupBorders(this.boulderFormationIdCount);
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
        {
        	stoneBlock.gridY++;
        	}
          
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
      
      let startCount = this.boulderFormationIdCount;

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
      
      // ToDo Test
      for(let i = startCount; i < this.boulderFormationIdCount; i++)
      	this.setBoulderGroupBorders(i+1);
    };
    
    this.clearBoulders = function() {
    	this.boulderBlocks.forEach(function(block) { block.graphic.destroy(); });
    	this.boulderBlocks = [];
    };

    this.removeBoulder = function(index) {
      //this.boulderBlocks[index].graphic.destroy();
      this.gameStage.removeChild(this.boulderBlocks[index].graphic);
      this.boulderBlocks.splice(index, 1);
    }

		// ToDo redo boulder edges
    this.clearBottomRowIfComplete = function(explosionHandler) {
        let bottomBouldersIndexes = [];

        for(let i = 0; i < this.boulderBlocks.length; i++){
          if(this.boulderBlocks[i].isFalling === false && this.boulderBlocks[i].gridY === this.gridSquares - 1 )
            bottomBouldersIndexes.push(i);
        }

        if(bottomBouldersIndexes.length < this.gridSquares ) // ToDo test
          return false;

        for(let i = bottomBouldersIndexes.length-1; i > -1; i--){
          var toDestroy = this.boulderBlocks[bottomBouldersIndexes[i]];
          explosionHandler.placeExplodingBlock(toDestroy.graphic.position.x, toDestroy.graphic.position.y, toDestroy.boulderColor);
          this.removeBoulder(bottomBouldersIndexes[i]);
        }
        
        return true; // ToDo Test
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
    
    // ToDo Test
    this.setBoulderGroupBorders = function(groupId) {
    	this.boulderBlocks.forEach(function(boulder, i, bbArray) {
    		if(boulder.groupId != groupId)
    			return;
    		
    		let top, right, bottom, left;
    		
    		if(bbArray.filter(block => block.groupId === groupId && block.gridX == boulder.gridX && block.gridY == (boulder.gridY - 1)).length === 0)
    			top = true;
    			
    		if(bbArray.filter(block => block.groupId === groupId && block.gridX == boulder.gridX && block.gridY == (boulder.gridY + 1)).length === 0)
    			bottom = true;
    			
    		if(bbArray.filter(block => block.groupId === groupId && block.gridY == boulder.gridY && block.gridX == (boulder.gridX - 1)).length === 0)
    			left = true;
    			
    		if(bbArray.filter(block => block.groupId === groupId && block.gridY == boulder.gridY  && block.gridX == (boulder.gridX + 1)).length === 0)
    			right = true;
    			
    		boulder.setEdges(top, left, bottom, right);
    	});
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
        (this.missiles[0].position.y + this.missileHeight < 0 || this.missiles[0].position.y > this.applicationSize )) {
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
    
      this.removeMissile = function (toDestroy) {
          this.gameStage.removeChild(toDestroy);
      };
  }, 

    CollisionHandler: function () { // stage, exploHandler
    
        this.detectMissileHit = function (missileHandler, bbCollection, explosionHandler) {
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
          missileHandler.removeMissile(toDestroy);
      }
    
      for(let i = removeBouldersIndexes.length-1; i > -1; i--){
        var toDestroy = bbCollection.boulderBlocks[removeBouldersIndexes[i]];
        explosionHandler.placeExplodingBlock(toDestroy.graphic.position.x, toDestroy.graphic.position.y, toDestroy.boulderColor); // TD2 move to game logic
        bbCollection.removeBoulder(removeBouldersIndexes[i]);
      }
    
      if(removeBouldersIndexes.length > 0){
        bbCollection.regroupBoulderFormation(toDestroy.groupId);
        bbCollection.calculateFallingStatusOnBoulders();
      }
    };
    
        this.checkPlayerBoulderCollision = function (playerBlock, bbCollection, explosionHandler) {
      var b = bbCollection.boulderBlocks;
    
      for (let i = 0; i < b.length; i++) {
          if (b[i].gridX === playerBlock.gridX &&
            b[i].gridY === playerBlock.gridY) {
              explosionHandler.placeExplodingBlock(playerBlock.graphic.position.x, playerBlock.graphic.position.y
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
  
  LoadingBar: function(app, numberOfItemsToLoad, applicationSize) { // ToDo value used for applicationSize is wrong. 
	  let loadingStage = new PIXI.Container();
	  let loadingBox;
	  let loadingBoxBorder;
	  let itemCount = numberOfItemsToLoad;
	  let itemsLoaded = 0;
	  
	  draw(app, applicationSize);
	  
	  this.loaded = function(loader, resource) { // loader, resource
	    itemsLoaded++;
	        
	    if(loadingBox)
	      loadingBox.destroy();
	    
	    let maxWidth = loadingBoxBorder.width - 12;
	    let width =  maxWidth * (loader.progress / 100);
	    //let width =  (maxWidth/itemCount) * itemsLoaded;
	    
	    loadingBox = new PIXI.Graphics();
	    loadingBox.beginFill(0xff0000);
	    loadingBox.drawRect(0, 0, width, loadingBoxBorder.height - 12);
	    loadingBox.endFill();
	    loadingBox.position.y = loadingBoxBorder.position.y + 5;
	    loadingBox.position.x = loadingBoxBorder.position.x + 5;
	    
	    loadingStage.addChild(loadingBox);
	  }
	  
	  function draw(app, applicationSize) {
	  	let text = new PIXI.Text('Loading...',{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
	  
		  loadingBoxBorder = new PIXI.Graphics();
		  loadingBoxBorder.lineStyle(2, 0xffffff);
		  loadingBoxBorder.beginFill(0x000000);
		  loadingBoxBorder.drawRect(0, 0, 200, 26);
		  loadingBoxBorder.endFill();
		    
		  loadingBoxBorder.position.y = 30;
		  
		  loadingStage.addChild(text);
		  loadingStage.addChild(loadingBoxBorder);
		  
		  text.position.x = (loadingStage.width / 2) - (text.width / 2);
		  
		  loadingStage.position.x = (applicationSize / 2) - (loadingStage.width / 2);
			loadingStage.position.y = (applicationSize / 2) - (loadingStage.height / 2);
	  
	  	app.stage = loadingStage;
	  }

	  this.isDone = function() {
	    return itemCount >= itemsLoaded;
	  }
	},
	
	OverlayHandler: function(overlayStage, gameAreaSize) {
		let stage = overlayStage;
		let size = gameAreaSize;
		
		let space_style = new PIXI.TextStyle({
    		align: "center",
    		fill: "white",
    		fontSize: 26, fontWeight: "bold", 
    		fontFamily: "arial, sans-serif"
			});
		
		
		let help_style = new PIXI.TextStyle({
    		align: "center",
    		fill: "white",
    		fontSize: 14,
    		fontFamily: "arial, sans-serif"
			});
		
		this.showMenu = function() {
			stage.removeChildren();
			
    	let space_text = new PIXI.Text('Press any key to Start', space_style);
			let help_text = new PIXI.Text('Press "H" anytime to display help text', help_style);
			
			space_text.position.x = size / 2 - space_text.width / 2;
			space_text.position.y = size / 2 - space_text.height / 2 - 16;
			
			help_text.position.x = size / 2 - help_text.width / 2;
			help_text.position.y = size / 2 - help_text.height / 2 + 16;
			
			stage.addChild(space_text);
			stage.addChild(help_text);
			
		}
		
		this.clearStage = function() {
			stage.removeChildren();
		}

		this.showHelp = function() {
			stage.removeChildren();
			
			let bgBox = new PIXI.Graphics()
    	bgBox.beginFill(0x000000);
    	bgBox.drawRect(0, 0, size, size);
    	bgBox.endFill();
    	bgBox.alpha = 0.5;
    	stage.addChild(bgBox);
    	
    	let help_text = new PIXI.Text('This is a turn based game with object to complete a full row of boulder at \n' + 
    	'the bottom as many times as possible. Fire a laser to shape the boulder\n' + 
    	'and move around to avoid any collision.\n' + 
			'\n' + 
			'Use Left/Right or A/D to move.\n' + 
			'\n' + 
			'Use Up/Down or W/D to fire.\n' + 
			'\n' + 
			'Press any key to continue', help_style);
    	
			help_text.position.x = size / 2 - help_text.width / 2;
			help_text.position.y = size / 2 - help_text.height / 2;
    	
			stage.addChild(help_text);
			
		}
		
		this.showGameOverScreen = function() {
			stage.removeChildren();
			
			let bgBox = new PIXI.Graphics()
    	bgBox.beginFill(0x000000);
    	bgBox.drawRect(0, 0, size, size);
    	bgBox.endFill();
    	bgBox.alpha = 0.25;
    	stage.addChild(bgBox);
    	
    	let space_text = new PIXI.Text('GAME OVER', space_style);
    	space_text.position.x = size / 2 - space_text.width / 2;
			space_text.position.y = size / 2 - space_text.height / 2 - 16;
			stage.addChild(space_text);
			
			let help_text = new PIXI.Text('Press \'space\' to restart', help_style);
			help_text.position.x = size / 2 - help_text.width / 2;
			help_text.position.y = size / 2 - help_text.height / 2 + 16;
			stage.addChild(help_text);
		}
	}, 
	
	ScoreHandler: function(scoreContainer, ch) {
		let stage = scoreContainer;
		let score = 0;
		let cookieHandler = ch;

		let small_text_style = new PIXI.TextStyle({
    		align: "center",
    		fill: "white",
    		fontSize: 14, 
    		fontFamily: "monospace"
			});

		let current_text = new PIXI.Text('Current:', small_text_style);
		current_text.position.x = 0;
		current_text.position.y = 0;
		stage.addChild(current_text);
		
		let highest_text = new PIXI.Text('Max:', small_text_style);
		highest_text.position.x = 0;
		highest_text.position.y = 20;
		stage.addChild(highest_text);
		
		let score_text = new PIXI.Text(score, small_text_style);
		score_text.position.x = 70;
		score_text.position.y = 0;
		stage.addChild(score_text);
		
		let highest_score = new PIXI.Text(cookieHandler.getTopScore(), small_text_style);
		highest_score.position.x = 70;
		highest_score.position.y = 20;
		stage.addChild(highest_score);
		
		this.increaseScore = function(amount) {
			score += amount;
			score_text.text = score;
			
			if(score > cookieHandler.getTopScore()) // ToDo test
			{
				cookieHandler.setTopScore(score);
				highest_score.text = score;
			}
				
		}
		
		this.resetScore = function() {
			score = 0;
			score_text.text = score;
		}

	}, 
  
  CookieHandler: function() { // ToDo Test everything
  	let topScore = -1;
  	let expiresDate = new Date();
  	expiresDate.setTime(expiresDate.getTime() + (700*24*60*60*1000)); // +700 days
    
    this.cookieName = "BoulderBlaser";
  	
  	this.setTopScore = function (score) {
      topScore = score;
  		document.cookie = "BoulderBlaser=topScore:" + score + "; expires=" + expiresDate.toUTCString() + ";path=/";
  	}
  	
  	this.getTopScore = function() {
  		if(topScore < 0) {
        let theCookie = document.cookie + ";";
  			if(theCookie.indexOf('topScore:') > 0) {
          topScore = parseInt(theCookie.substring(
            theCookie.indexOf('topScore:') + 9,
            theCookie.indexOf(';')), 10);
  			}
  			else {
  				topScore = 0;
  			}
  		}
  		return topScore;
  	}
  }, 
  
  GameLogic: function(pb, mh, bbc, ch, eh, oh, sh) {
    let boulderFrequency = 4;
    let blocksToMove = false;
    let movesCounter = 0;
    
    const stateStart = 4;
    const stateRunningIntro = 1;
    const stateGameOn = 2;
    const stateGameOver = 3;
    let gameState = 0;
    
    let showingHelp = false;

    let playerBlock = pb;
    let missileHandler = mh;
    let bbCollection = bbc;
    let CollisionHandler = ch;
    let explosionHandler = eh;
    let overlayHandler = oh;
    let scoreHandler = sh;
    
    this.startGame = function() {
			setMenuStage(this.gameStage);
    };
    
    var setMenuStage = function(gameStage) {
    	gameState = stateStart;
			overlayHandler.showMenu();
    };
    
    var setGameStage = function() {
    	gameState = stateRunningIntro;
    	overlayHandler.clearStage(); // ToDo Test?
      bbCollection.clearBoulders();
      playerBlock.removePlayer();// ToDo Test
      scoreHandler.resetScore(); // ToDo Test
      
      let startY = 14;
      while(bbCollection.boulderBlocks.length < 32) {
      	bbCollection.generateBoulderFormation(startY);
      	startY -= 4; 
    	}
      
     while(bbCollection.boulderBlocks.filter(block => block.isFalling === true).length > 0) {
      	bbCollection.moveAllFallingBouldersDown();
      	bbCollection.calculateFallingStatusOnBoulders();
      }
      blocksToMove = true;
    };
    
    this.onKeyDown = function (key) {
    	if(showingHelp === true) // ToDo Test
    	{
    		overlayHandler.clearStage();
    		showingHelp = false;
    		
    		if(gameState !== stateStart) {  // ToDo Test
    			key.preventDefault();
    			return;
    		}
    	}
    	else if(key.keyCode === 72)// h 72  // ToDo Test
    	{
    		overlayHandler.showHelp();
    		showingHelp = true;
    		key.preventDefault();
        return;
    	}
    	
    	// ToDo: Test "any" keypress?
      if(key.keyCode === 82 || (gameState === stateStart) || (key.keyCode === 32 && gameState === stateGameOver) ) { // R  (&& key.keyCode === 32 and Space)
        setGameStage();
        key.preventDefault();
        return;
      }

      /*if(blocksToMove) // Wait for blocks to stop moving, before allowing next move.
        return;*/
    
      if (!playerBlock.isStaged)
        return;
    
      playerBlock.lastGridXMove = 0;
    
      if (keyMovesPlayerBlock(key.keyCode) || keyFiresMissle(key.keyCode)) {
        blocksToMove = true;
        movesCounter++;
        key.preventDefault();
    
        bbCollection.moveAllFallingBouldersDown();
        bbCollection.calculateFallingStatusOnBoulders();
          CollisionHandler.detectMissileHit(missileHandler, bbCollection, explosionHandler); // A new missile needs to hit adjecten block immediently 
          if (CollisionHandler.checkPlayerBoulderCollision(playerBlock, bbCollection, explosionHandler)) {
          playerBlock.removePlayer();
          gameState = stateGameOver;
          overlayHandler.showGameOverScreen();
				}
				
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
        if (playerBlock.isStaged) changesMade =+ playerBlock.updateBlockGraphicPosition(delta, (gameState === stateRunningIntro), playerBlock.addFlame);
        bbCollection.boulderBlocks.forEach( function(stoneBlock) {changesMade += stoneBlock.updateBlockGraphicPosition(delta, (gameState === stateRunningIntro));});
        if(changesMade === 0) blocksToMove = false;
        
        if(blocksToMove === false) {
        	let boom = bbCollection.clearBottomRowIfComplete(explosionHandler);
        	if(gameState === stateRunningIntro) { 
        		playerBlock.placePlayer(); gameState = stateGameOn; 
        	}
        	else if(boom) {
        		scoreHandler.increaseScore(1); // ToDo Test
        	}
      	}
      }
      explosionHandler.moveExplodingBlocks();
      missileHandler.moveMissiles();
        CollisionHandler.detectMissileHit(missileHandler, bbCollection, explosionHandler);
      playerBlock.updateFlames();
      };
  },

  Game: function() {
    let gameAreaSize = 512;
    let gameAreaX = 32;
    let gameAreaY = 64;
    
    let app;
    let logic;
    let doc;
   
    var mainStage;
    var backgroundStage;
    var gameStage;
    var foregroundStage;
    var menuStage;
    
    let resourceHolder = new BoulderBlaster.ResourceHolder();

		this.initiate = function(document) {
			app = new PIXI.Application({width: gameAreaSize+(gameAreaX*2), height: gameAreaSize+(gameAreaY*2), antialias: true});
			doc = document;
			
			let div = document.createElement("div");
			div.style.width = "576px";
			div.style.margin = "auto";
			div.appendChild(app.view);
      document.body.appendChild(div);
      
			mainStage = new PIXI.Container();
			
      backgroundStage = new PIXI.Container();
      backgroundStage.x = gameAreaX;
      backgroundStage.y = gameAreaY;
      
      foregroundStage = new PIXI.Container();
      
      gameStage = new PIXI.Container();
      gameStage.width = gameAreaSize;
      gameStage.height = gameAreaSize;
      gameStage.x = gameAreaX;
      gameStage.y = gameAreaY;
      
      menuStage = new PIXI.Container();
      menuStage.width = gameAreaSize;
      menuStage.height = gameAreaSize;
      menuStage.x = gameAreaX;
      menuStage.y = gameAreaY;
      
      mainStage.addChild(backgroundStage);
      mainStage.addChild(gameStage);
      mainStage.addChild(menuStage);
      mainStage.addChild(foregroundStage);
			
			let lbar = new BoulderBlaster.LoadingBar(app, 2, gameAreaSize);
			
  
  		let loader = new PIXI.Loader();
  		resourceHolder.configureLoader(loader);
  		loader.onProgress.add(lbar.loaded);
  		loader.load( (loader, resources) => {this.setGameStage(loader, resources); } ); 
		}

    this.setGameStage = function(loader, resources) {
    	resourceHolder.setResources(resources);
			foregroundStage.addChild(resourceHolder.getGraphic('console')); // new PIXI.Sprite(resources.console.texture)
			let scoreboardContainer = new PIXI.Container();
      scoreboardContainer.position.x = 28;
      scoreboardContainer.position.y = 596;
			foregroundStage.addChild(scoreboardContainer);

      app.stage = mainStage;
      
      logic = new BoulderBlaster.GameLogic(
        new BoulderBlaster.PlayerEntity(gameStage, resourceHolder),
        new BoulderBlaster.MissileHandler(gameStage, gameAreaSize),
        new BoulderBlaster.BoulderCollection(gameStage, resourceHolder),
        new BoulderBlaster.CollisionHandler(), 
        new BoulderBlaster.ExplosionHandler(gameStage), 
        new BoulderBlaster.OverlayHandler(menuStage, gameAreaSize), 
        new BoulderBlaster.ScoreHandler(scoreboardContainer, new BoulderBlaster.CookieHandler)
        );
     
      createGrid(backgroundStage);
      app.ticker.add(delta => logic.gameLoop(delta));
      doc.addEventListener('keydown', logic.onKeyDown);
      logic.startGame();
    };
    
    // ToDo Refactor
    function createGrid(stage) {
    	let size = 32;
    	
    	for(let i = 0; i < 16; i++) {
    		for(let j = 0; j < 16; j++) {
    			var graphics = new PIXI.Graphics();
					graphics.beginFill(0x000000);
					graphics.lineStyle(1, 0x202060);
					graphics.drawRect(i * size, j * size, size, size);
					stage.addChild(graphics);
    		}
   		}
			
    }
  },
  
  ResourceHolder: function() {
  	this.resources = null;
  	
  	this.configureLoader = function(loader) {
  		loader
  			.add('console', 'imgs/console.png')
    		.add('ship', 'imgs/ship.png')
    		.add('boulder', 'imgs/boulder.png')
    		.add('boulder_bottom', 'imgs/boulder_bottom.png')
    		.add('boulder_top', 'imgs/boulder_top.png')
    		.add('boulder_left', 'imgs/boulder_left.png')
    		.add('boulder_right', 'imgs/boulder_right.png')
    		.add('skull', 'imgs/skull.png');
  	};
  	
  	this.getGraphic = function(resourceName) {
  		if(!this.resources)
  			return new PIXI.Graphics(); // Something for the tests to work :/
  		
  		if(resourceName === 'console')
  			return new PIXI.Sprite(this.resources.console.texture);
  		
  		if(resourceName === 'ship')
  			return new PIXI.Sprite(this.resources.ship.texture);
  			
  		if(resourceName === 'boulder')
				return new PIXI.Sprite(this.resources.boulder.texture);
		
		if(resourceName === 'boulder_bottom')
			return new PIXI.Sprite(this.resources.boulder_bottom.texture);
			
		if(resourceName === 'boulder_right')
			return new PIXI.Sprite(this.resources.boulder_right.texture);
			
		if(resourceName === 'boulder_left')
			return new PIXI.Sprite(this.resources.boulder_left.texture);
			
		if(resourceName === 'boulder_top')
			return new PIXI.Sprite(this.resources.boulder_top.texture);
				
		if(resourceName === 'skull')
			return new PIXI.Sprite(this.resources.skull.texture);
				
			//return generic graphic? 
  	};
  	
  	this.setResources = function(input) {
  		this.resources = input;
  	};
	}, 
};