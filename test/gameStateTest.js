var rewire = require("rewire");
var gameStateModule = rewire("../gameStateManager.js");
const assert = require('assert');

const playerId = "userForTest";

describe('gameState behaviour', function () {
  describe('obtainOperationCost behaviour', function () {

    const obtainOperationCost = gameStateModule.__get__("obtainOperationCost");

    it('should return { cost: integer } if the operation exist', function () {
      const expected = { cost: 1 };
      assert.deepStrictEqual(obtainOperationCost({ operation: "NOT" }), expected);
    });
  });
  describe('checkGameWasStarted', function () {

    const checkGameWasStarted = gameStateModule.__get__("checkGameWasStarted");
    let gameState = {};

    it('should return {gameState} on started false', function () {
      gameState.started = false;
      assert.deepStrictEqual(checkGameWasStarted({ gameState, playerId}).gameState, gameState);
    });
    it('should return null on started true', function () {
      gameState.started = true;
      assert.equal(checkGameWasStarted({ gameState, playerId }), null);
    });  
  });
  describe('checkGameWasNotStarted', function () {

    const checkGameWasNotStarted = gameStateModule.__get__("checkGameWasNotStarted");
    let gameState = {};

    it('should return {gameState} on started true', function () {
      gameState.started = true;
      assert.deepStrictEqual(checkGameWasNotStarted({ gameState, playerId }).gameState, gameState);
    });
    it('should return null on started false', function () {
      gameState.started = false;
      assert.equal(checkGameWasNotStarted({ gameState, playerId }), null);
    });
  });
  describe('checkAlreadyJoined', function () {

    const checkAlreadyJoined = gameStateModule.__get__("checkAlreadyJoined");
    let gameState = {};

    it('should return null if user already joined', function () {
      gameState.playerList = [{ name: playerId}];
      assert.equal(checkAlreadyJoined({ gameState, playerId }), null);
    });
    it('should return {gameState} if user not joined', function () {
      gameState.playerList = [{ name: 'anotherUser' }];
      assert.deepStrictEqual(checkAlreadyJoined({ gameState, playerId }).gameState, gameState);
    });
    it('should return {gameState} if playerList is empty', function () {
      gameState.playerList = [];
      assert.deepStrictEqual(checkAlreadyJoined({ gameState, playerId }).gameState, gameState);
    });
  });
  describe('checkNotJoined', function () {

    const checkNotJoined = gameStateModule.__get__("checkNotJoined");
    let gameState = {};

    it('should return null if user is not joined', function () {
      gameState.playerList = [{ name: "anotherUser" }];
      assert.equal(checkNotJoined({ gameState, playerId }), null);
    });
    it('should return {gameState} if user is joined', function () {
      gameState.playerList = [{ name: playerId }];
      assert.deepStrictEqual(checkNotJoined({ gameState, playerId }).gameState, gameState);
    });
    it('should return null if playerList is empty', function () {
      gameState.playerList = [];
      assert.equal(checkNotJoined({ gameState, playerId }), null);
    });
  });


});
