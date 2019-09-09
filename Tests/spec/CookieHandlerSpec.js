"use strict";

describe("CookieHandler.getTopScore", function () {

  let expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + (700*24*60*60*1000)); // +700 days

  beforeEach(function () {
    document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";
  });

  afterEach(function () {
    document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";
  });

  it("Can get Top score if cookie is not set.", function() {
      let ch = new BoulderBlaster.CookieHandler();

      expect(ch.getTopScore()).toBe(0);
  });

  it("Can get Top score if cookie is set.", function() {
    let score = 2;
    document.cookie = "BoulderBlaser=topScore:" + score + "; expires=" + expiresDate.toUTCString() + ";path=/";
    
    let ch = new BoulderBlaster.CookieHandler();
    
    expect(ch.getTopScore()).toBe(2);
  });

  it("Will cache Top score.", function() {
    document.cookie = "BoulderBlaser=topScore:2; expires=" + expiresDate.toUTCString() + ";path=/";
    
    let ch = new BoulderBlaster.CookieHandler();
    
    expect(ch.getTopScore()).toBe(2);

    document.cookie = "BoulderBlaser=topScore:3; expires=" + expiresDate.toUTCString() + ";path=/";

    expect(ch.getTopScore()).toBe(2);
  });
});

describe("CookieHandler.setTopScore", function () {

  let expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + (700*24*60*60*1000)); // +700 days

  beforeEach(function () {
  
  });

  afterEach(function () {
    document.cookie = "BoulderBlaser=; expires=" + expiresDate.toUTCString() + ";path=/";
  });

  it("Can set Top score.", function() {
    document.cookie = "";

    let ch = new BoulderBlaster.CookieHandler();
    
    ch.setTopScore(123456789);

    expect(document.cookie.indexOf('123456789')).toBeGreaterThan(0);

  });
});