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
  describe('checkNoPlayersLeft', function () {

    const checkNoPlayersLeft = gameStateModule.__get__("checkNoPlayersLeft");
    let gameState = {};

    it('should return null if there is no players joined in the game', function () {
      gameState.playerList = [];
      assert.equal(checkNoPlayersLeft({ gameState, playerId }), null);
    });
    it('should return {gameState} if any player is joined', function () {
      gameState.playerList = [{ name: playerId }];
      assert.deepStrictEqual(checkNoPlayersLeft({ gameState, playerId }).gameState, gameState);
    });
  });
  describe('checkIsNotPlayerTurn', function () {

    const checkIsNotPlayerTurn = gameStateModule.__get__("checkIsNotPlayerTurn");
    let gameState = { playerTurn: 0};

    it('should return null if is no players turn', function () {
      gameState.playerList = [{ name: "noTurnPlayer" }];
      
      assert.equal(checkIsNotPlayerTurn({ gameState, playerId }), null);
    });
    it('should return {gameState} if is player turn', function () {
      gameState.playerList = [{ name: playerId }];
      assert.deepStrictEqual(checkIsNotPlayerTurn({ gameState, playerId }).gameState, gameState);
    });
  });
  describe('checkGameLost', function () {

    const checkGameLost = gameStateModule.__get__("checkGameLost");
    let gameState = {};

    it('should return null if is the game was lost with 2 bugs and 4 unresolved', function () {
      gameState = { unresolved: 4,  bugsFound: 2};
      assert.equal(checkGameLost({ gameState, playerId }), null);
    });
    it('should return null if is the game was lost with 1 bugs and 5 unresolved', function () {
      gameState = { unresolved: 5, bugsFound: 1 };
      assert.equal(checkGameLost({ gameState, playerId }), null);
    });
    it('should return null if is the game was lost with 0 bugs and 6 unresolved', function () {
      gameState = { unresolved: 6, bugsFound: 0 };
      assert.equal(checkGameLost({ gameState, playerId }), null);
    });
    it('should return null if is the game was lost with 0 bugs and 7 unresolved', function () {
      gameState = { unresolved: 7, bugsFound: 0 };
      assert.equal(checkGameLost({ gameState, playerId }), null);
    });
    it('should return null if is the game was lost with 2 bugs and 5 unresolved', function () {
      gameState = { unresolved: 5, bugsFound: 2 };
      assert.equal(checkGameLost({ gameState, playerId }), null);
    });
    it('should return {gameState} game was not lost with 0 bugs and 0 unresolved', function () {
      gameState = { unresolved: 0, bugsFound: 0 };
      assert.deepStrictEqual(checkGameLost({ gameState, playerId }).gameState, gameState);
    });
    it('should return {gameState} game was not lost with 2 bugs and 0 unresolved', function () {
      gameState = { unresolved: 0, bugsFound: 2 };
      assert.deepStrictEqual(checkGameLost({ gameState, playerId }).gameState, gameState);
    });
    it('should return {gameState} game was not lost with 2 bugs and 1 unresolved', function () {
      gameState = { unresolved: 1, bugsFound: 2 };
      assert.deepStrictEqual(checkGameLost({ gameState, playerId }).gameState, gameState);
    });
    it('should return {gameState} game was not lost with 2 bugs and 3 unresolved', function () {
      gameState = { unresolved: 1, bugsFound: 2 };
      assert.deepStrictEqual(checkGameLost({ gameState, playerId }).gameState, gameState);
    });
  });
  describe('checkRegisterLocked', function () {

    const checkRegisterLocked = gameStateModule.__get__("checkRegisterLocked");
    let gameState = { };

    it('should return null if both of the target registers are locked', function () {
      gameState.errors = {
        B: true,
        C: true
      };

      assert.equal(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', cpu_reg2:'C' }), null);
    });
    it('should return null if reg1 is locked', function () {
      gameState.errors = {
        B: true,
        C: false
      };
      assert.equal(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', cpu_reg2: 'C' }), null);
    });
    it('should return null if reg2 is locked', function () {
      gameState.errors = {
        B: false,
        C: true
      };
      assert.equal(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', cpu_reg2: 'C' }), null);
    });
    it('should return null if reg1 is locked and reg2 is not present', function () {
      gameState.errors = {
        B: true
      };
      assert.equal(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', cpu_reg2: undefined }), null);
    });
    it('should return {ganmeState} if none of the target register are locked', function () {
      gameState.errors = {
        B: false,
        C: false
      };
      assert.deepStrictEqual(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', cpu_reg2: 'C' }).gameState, gameState);
    });
    it('should return {ganmeState} if reg1 is not locked and reg2 is not present', function () {
      gameState.errors = {
        B: false
      };
      assert.deepStrictEqual(checkRegisterLocked({ gameState, playerId, cpu_reg1: 'B', undefined }).gameState, gameState);
    });
  });
  describe('checkOperationLocked', function () {

    const checkOperationLocked = gameStateModule.__get__("checkOperationLocked");
    let gameState = {};

    it('should return null operation is locked', function () {
      gameState.errors = {
        AND: true
      };

      assert.equal(checkOperationLocked({ gameState, playerId, operation: 'AND' }), null);
    });
    it('should return {ganmeState} operation is not locked', function () {
      gameState.errors = {
        AND: false
      };
      assert.deepStrictEqual(checkOperationLocked({ gameState, playerId, operation: 'AND' }).gameState, gameState);
    });
  });
  describe('checkNotEnoughEnergy', function () {

    const checkNotEnoughEnergy = gameStateModule.__get__("checkNotEnoughEnergy");
    let gameState = {
      playerList: [{name: playerId}],
      playerTurn: 0
    };

    it('should return null if player has not enough energy to run the requested operation', function () {
      gameState.playerList[0].energy = 0;

      assert.equal(checkNotEnoughEnergy({ gameState, playerId, cost: 1 }), null);
    });
    it('should return {gameState} if player has more than the energy needed to run the requested operation', function () {
      gameState.playerList[0].energy = 3;
      assert.deepStrictEqual(checkNotEnoughEnergy({ gameState, playerId, cost: 1 }).gameState, gameState);
    });
    it('should return {gameState} if player has just the energy to run the requested operation', function () {
      gameState.playerList[0].energy = 1;
      assert.deepStrictEqual(checkNotEnoughEnergy({ gameState, playerId, cost: 1 }).gameState, gameState);
    });
  });
});
