"use strict";


/*
increaseScore
    Does cookieHandler.getTopScore at start
    Does cookieHandler.getTopScore with new high score
*/

describe("ScoreHandler.init", function () {
	let stage;
    let ch;

    let expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + (700*24*60*60*1000)); // +700 days
    
	beforeEach(function () {
        document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";    
        stage = new PIXI.Container();
        ch = new BoulderBlaster.CookieHandler();
    });

    afterEach(function () {
        document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";
    });

    it("Will get high score at beginning.", function() {
        spyOn(ch, "getTopScore")

		let sh = new BoulderBlaster.ScoreHandler(stage, ch);
		
		expect(ch.getTopScore).toHaveBeenCalled();
	});
});

describe("ScoreHandler.increaseScore", function () {
	let stage;
    let ch;

    let expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + (700*24*60*60*1000)); // +700 days
    
	beforeEach(function () {
        document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";    
        stage = new PIXI.Container();
        ch = new BoulderBlaster.CookieHandler();
    });

    afterEach(function () {
        document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";
    });

    it("Will set high score when past old one.", function() {
        spyOn(ch, "setTopScore")

        let sh = new BoulderBlaster.ScoreHandler(stage, ch);
        
        sh.increaseScore(1);
		
		expect(ch.setTopScore).toHaveBeenCalled();
    });
    
    it("Will not set high score if not past old one.", function() {
        let sh = new BoulderBlaster.ScoreHandler(stage, ch);
        
        sh.increaseScore(10);
        sh.resetScore();

        spyOn(ch, "setTopScore").and.callThrough();

        expect(ch.setTopScore).not.toHaveBeenCalled();

        sh.increaseScore(1);

		expect(ch.setTopScore).not.toHaveBeenCalled();
	});
});