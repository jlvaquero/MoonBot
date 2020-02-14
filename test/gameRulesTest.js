const ruleModule = require('../gameRules');
const assert = require('assert');

describe('game rules', function () {
  describe('cpu bits range 4-6', function () {
    it('should return 4 when value is MIN_INTEGER', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(Number.MIN_SAFE_INTEGER), 4);
    });
    it('should return 4 when value is -1', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(-1), 4);
    });
    it('should return 4 when value is 0', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(0), 4);
    });
    it('should return 4 when value is 3', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(3), 4);
    });
    it('should return 4 when value is 4', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(4), 4);
    });
    it('should return 5 when value is 5', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(5), 5);
    });
    it('should return 6 when value is 6', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(6), 6);
    });
    it('should return 6 when value is 7', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(7), 6);
    });
    it('should return 6 when value is MAX_INTEGER', function () {
      assert.equal(ruleModule.Rules.KeepNumBitsRange(Number.MAX_SAFE_INTEGER), 6);
    });
  });

  describe('get current player', function () {

    let gameState = {
      playerList: ['player0', 'player1']
    };

    it('should return player0 when turn 0', function () {
      gameState.playerTurn = 0;
      assert.equal(ruleModule.Rules.CurrentPlayer(gameState), 'player0');
    });
    it('should return player1 when turn 1', function () {
      gameState.playerTurn = 1;
      assert.equal(ruleModule.Rules.CurrentPlayer(gameState), 'player1');
    });
  });

  describe('determine player turn', function () {

    let gameState = {
      playerList: [{ name: 'player0' }, {name :'player1'}]
    };

    it('should return true when playerturn 0 for player0 input', function () {
      gameState.playerTurn = 0;
      assert.equal(ruleModule.Rules.IsPlayerTurn(gameState, 'player0'), true);
    });
    it('should return false when playerturn 1 for player0 input', function () {
      gameState.playerTurn = 1;
      assert.equal(ruleModule.Rules.IsPlayerTurn(gameState, 'player0'), false);
    });
  });

  describe('determine player is joined in the game', function () {

    let gameState = {
      playerList: [{ name: 'player0' }]
    };

    it('should return true when player0 input', function () {
      assert.equal(ruleModule.Rules.PlayerIsInGame(gameState, 'player0'), true);
    });
    it('should return false when player1 input', function () {
      assert.equal(ruleModule.Rules.PlayerIsInGame(gameState, 'player1'), false);
    });
  });

  describe('determine no players left', function () {

    let gameState = {
    };

    it('should return false when playerList is not empty', function () {
      gameState.playerList = [{ name: 'player0' }, { name: 'player1' }];
      assert.equal(ruleModule.Rules.NoPlayersLeft(gameState), false);
    });
    it('should return true when playerList is empty', function () {
      gameState.playerList = [];
      assert.equal(ruleModule.Rules.PlayerIsInGame(gameState), false);
    });
  });

  describe('check if game reach to max unresolved objetives (6)', function () {

    let gameState = {
    };

    it('should return false if unresolved + bugsFound are 0', function () {
      gameState.unresolved = 0;
      gameState.bugsFound = 0;
      assert.equal(ruleModule.Rules.MaxUnresolvedReached(gameState), false);
    });
    it('should return false if unresolved + bugsFound are 5', function () {
      gameState.unresolved = 3;
      gameState.bugsFound = 2;
      assert.equal(ruleModule.Rules.MaxUnresolvedReached(gameState), false);
    });
    it('should return true if unresolved + bugsFound are 6', function () {
      gameState.unresolved = 4;
      gameState.bugsFound = 2;
      assert.equal(ruleModule.Rules.MaxUnresolvedReached(gameState), true);
    });
    it('should return true if unresolved + bugsFound are 7', function () {
      gameState.unresolved = 5;
      gameState.bugsFound = 2;
      assert.equal(ruleModule.Rules.MaxUnresolvedReached(gameState), true);
    });
  });

  describe('check no objetives left', function () {

    let gameState = {
    };

    it('should return true if no objetives and no currentObjetive', function () {
      gameState.objetives = [];
      gameState.currentObjetive = undefined;
      assert.equal(ruleModule.Rules.NoObjetivesLeft(gameState), true);
    });
    it('should return false if no objetives but currentObjetive', function () {
      gameState.objetives = [];
      gameState.currentObjetive = 1;
      assert.equal(ruleModule.Rules.NoObjetivesLeft(gameState), false);
    });
    it('should return false if objetives queue has elments', function () {
      gameState.objetives = [1];
      gameState.currentObjetive = undefined;
      assert.equal(ruleModule.Rules.NoObjetivesLeft(gameState), false);
    });
    it('should return false if objetives queue has elments', function () {
      gameState.objetives = [1];
      gameState.currentObjetive = 1;
      assert.equal(ruleModule.Rules.NoObjetivesLeft(gameState), false);
    });
  });

  describe('check current player has enough energy for operation', function () {

    let gameState = {
      playerTurn: 0,
      playerList: [{}]
    };

    describe('inc operation', function () {
      it('should return true if energy left is 2', function () {
        gameState.playerList[0].energy = 2;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'INC'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'INC'), true);
      });
      it('should return false if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'INC'), false);
      });
    });

    describe('dec operation', function () {
      it('should return true if energy left is 2', function () {
        gameState.playerList[0].energy = 2;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'DEC'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'DEC'), true);
      });
      it('should return false if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'DEC'), false);
      });
    });

    describe('mov operation', function () {
      it('should return true if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'MOV'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'MOV'), true);
      });
      it('should return false if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'MOV'), false);
      });
    });

    describe('not operation', function () {
      it('should return true if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'NOT'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'NOT'), true);
      });
      it('should return false if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'NOT'), false);
      });
    });

    describe('rol operation', function () {
      it('should return true if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROL'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROL'), true);
      });
      it('should return false if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROL'), false);
      });
    });

    describe('ror operation', function () {
      it('should return true if energy left is 1', function () {
        gameState.playerList[0].energy = 1;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROR'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROR'), true);
      });
      it('should return false if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'ROR'), false);
      });
    });

    describe('or operation', function () {
      it('should return true if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'OR'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'OR'), true);
      });
      it('should return false if energy left is 0', function () {
        gameState.playerList[0].energy = 0;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'OR'), false);
      });
    });

    describe('and operation', function () {
      it('should return true if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'AND'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'AND'), true);
      });
      it('should return false if energy left is 0', function () {
        gameState.playerList[0].energy = 0;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'AND'), false);
      });
    });

    describe('xor operation', function () {
      it('should return true if energy left is 0.5', function () {
        gameState.playerList[0].energy = 0.5;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'XOR'), true);
      });
      it('should return true if energy left is 3', function () {
        gameState.playerList[0].energy = 3;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'XOR'), true);
      });
      it('should return false if energy left is 0', function () {
        gameState.playerList[0].energy = 0;
        assert.equal(ruleModule.Rules.EnoughEnergyFor(gameState, 'XOR'), false);
      });
    });

  });

  describe('check objetive slots empty', function () {

    let gameState = {
    };

    it('should return true if unresolved is 0', function () {
      gameState.unresolved = 0;
      assert.equal(ruleModule.Rules.NoUnresolvedLeft(gameState), true);
    });
    it('should return true if unresolved is -1', function () {
      gameState.unresolved = -1;
      assert.equal(ruleModule.Rules.NoUnresolvedLeft(gameState), true);
    });
    it('should return false if unresolved is 1', function () {
      gameState.unresolved = 1;
      assert.equal(ruleModule.Rules.NoUnresolvedLeft(gameState), false);
    });
  
  });

  describe('check if the current player is the last of the round', function () {

    let gameState = {
    };

    it('should return true on just one player and playerTurn 0', function () {
      gameState.playerTurn = 0;
      gameState.playerList= ['player0'];
      assert.equal(ruleModule.Rules.LastPlayerPlaying(gameState), true);
    });
    it('should return true on 2 players and playerTurn 1', function () {
      gameState.playerTurn = 1;
      gameState.playerList = ['player0', 'player1'];
      assert.equal(ruleModule.Rules.LastPlayerPlaying(gameState), true);
    });
    it('should return false on 2 players and playerTurn 0', function () {
      gameState.playerTurn = 0;
      gameState.playerList = ['player0', 'player1'];
      assert.equal(ruleModule.Rules.LastPlayerPlaying(gameState), false);
    });

  });

  describe('check if some system error is present', function () {

    let gameState = {
    };

    it('should return 0 if all errors are false', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: false,
        ROL: false,
        NOT: false,
        XOR: false
      };

      assert.equal(ruleModule.Rules.SomeSystemError(gameState), 0);  
    });

    it('should return 1 if 1 error present', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: true,
        ROL: false,
        NOT: false,
        XOR: false
      };
     
      assert.equal(ruleModule.Rules.SomeSystemError(gameState), 1);
    });

    it('should return 2 if 2 error present', function () {
      gameState.errors = {
        B: true,
        C: false,
        D: true,
        ROL: false,
        NOT: false,
        XOR: false
      };

      assert.equal(ruleModule.Rules.SomeSystemError(gameState), 2);
    });

    it('should return 6 if 6 error present', function () {
      gameState.errors = {
        B: true,
        C: true,
        D: true,
        ROL: true,
        NOT: true,
        XOR: true
      };

      assert.equal(ruleModule.Rules.SomeSystemError(gameState), 6);
    });
 
  });

  describe('max energy range [3||2.5||2||1.5]', function () {
    it('should return 1.5 on 1.5 input', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(1.5), 1.5);
    });
    it('should return 2 on 2 input', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(2), 2);
    });
    it('should return 2.5 on 2.5 input', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(2.5), 2.5);
    });
    it('should return 3 on 3 input', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(3), 3);
    });
    it('should fallback to default (3) less than 1.5', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(1), 3);
    });
    it('should fallback to default (3) more than 3', function () {
      assert.equal(ruleModule.Rules.KeepMaxEnergyInRange(3.5), 3);
    });
  });

  describe('num bugs range 0-2', function () {
    it('should return 0 on 0 input', function () {
      assert.equal(ruleModule.Rules.KeepNumBugsInRange(0), 0);
    });
    it('should return 1 on 1 input', function () {
      assert.equal(ruleModule.Rules.KeepNumBugsInRange(1), 1);
    });
    it('should return 2 on 2 input', function () {
      assert.equal(ruleModule.Rules.KeepNumBugsInRange(2), 2);
    });
    it('should return 2 on 3 input', function () {
      assert.equal(ruleModule.Rules.KeepNumBugsInRange(3), 2);
    });
    it('should return 0 on -1 input', function () {
      assert.equal(ruleModule.Rules.KeepNumBugsInRange(-1), 0);
    });
    
  });

  describe('apply bug game card', function () {
    let gameState = {};
    it('should set bugsFound = 1 when bugsFound 0', function () {
      gameState.bugsFound = 0;
      currentGameState = ruleModule.Rules.ApplyBug(gameState);
      assert.equal(currentGameState.bugsFound, 1);
    });
    it('should  set bugsFound = 2 when bugsFound 1', function () {
      gameState.bugsFound = 1;
      currentGameState = ruleModule.Rules.ApplyBug(gameState);
      assert.equal(currentGameState.bugsFound, 2);
    });

  });

  describe('apply reset register game card', function () {
    let gameState = {};

    it('should set requested register to 0', function () {
      gameState.registers = {
        A: 1,
        B: 2,
        C: 3,
        D: 4
      };
      currentGameState = ruleModule.Rules.ApplyRegisterReset('A', gameState);
      assert.equal(currentGameState.registers.A, 0);
    });
    it('should not set any other register to 0', function () {
      gameState.registers = {
        A: 1,
        B: 2,
        C: 3,
        D: 4
      };
      currentGameState = ruleModule.Rules.ApplyRegisterReset('A', gameState);
      assert.notEqual(currentGameState.registers.B, 0);
      assert.notEqual(currentGameState.registers.C, 0);
      assert.notEqual(currentGameState.registers.D, 0);
    });
   
  });

  describe('apply reset column game card', function () {
    let gameState = {};

    it('should set bit column 2 to 0', function () {
      gameState.registers = {
        A: 1,
        B: 2,
        C: 6,
        D: 13
      };

      const expected = {
        A: 1,
        B: 0,
        C: 4,
        D: 13
      };
      currentGameState = ruleModule.Rules.ApplyColumnReset(0xD , gameState);
      assert.deepStrictEqual(currentGameState.registers, expected);
    });
    it('should set bit column 4 to 0', function () {
      gameState.registers = {
        A: 3,
        B: 4,
        C: 6,
        D: 11
      };

      const expected = {
        A: 3,
        B: 0,
        C: 2,
        D: 11
      };
      currentGameState = ruleModule.Rules.ApplyColumnReset(0xB, gameState);
      assert.deepStrictEqual(currentGameState.registers, expected);
    });
    it('should set bit column 8 to 0', function () {
      gameState.registers = {
        A: 7,
        B: 8,
        C: 12,
        D: 15
      };

      const expected = {
        A: 7,
        B: 0,
        C: 4,
        D: 7
      };
      currentGameState = ruleModule.Rules.ApplyColumnReset(0x7, gameState);
      assert.deepStrictEqual(currentGameState.registers, expected);
    });

  });

  describe('apply register error game card', function () {
    let gameState = {
    };

    it('should set register error to true', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: false
      };
      gameState = ruleModule.Rules.ApplyRegisterError('B', gameState);
      assert.equal(gameState.errors.B, true);
      assert.equal(gameState.errors.C, false);
      assert.equal(gameState.errors.D, false);
    });
  });

  describe('apply operation error game card', function () {
    let gameState = {
    };

    it('should set register error to true', function () {
      gameState.errors = {
        ROL: false,
        NOT: false,
        XOR: false
      };
      gameState = ruleModule.Rules.ApplyRegisterError('NOT', gameState);
      assert.equal(gameState.errors.ROL, false);
      assert.equal(gameState.errors.NOT, true);
      assert.equal(gameState.errors.XOR, false);
    });
  });

  describe('apply fix error game card', function () {
    let gameState = {
    };

    it('should increase fixPending on any error present', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: false,
        ROL: true,
        NOT: false,
        XOR: false
      };
      gameState.fixPending = 0;
      gameState = ruleModule.Rules.ApplyFixOperation(gameState);
      assert.equal(gameState.fixPending, 1);
    });

    it('should not increase fixPending beyond # errors present', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: false,
        ROL: true,
        NOT: false,
        XOR: false
      };
      gameState.fixPending = 1;
      gameState = ruleModule.Rules.ApplyFixOperation(gameState);
      assert.equal(gameState.fixPending, 1);
    });

    it('should not increase fixPending because not error present', function () {
      gameState.errors = {
        B: false,
        C: false,
        D: false,
        ROL: false,
        NOT: false,
        XOR: false,
      };
      gameState.fixPending = 0;
      gameState = ruleModule.Rules.ApplyFixOperation(gameState);
      assert.equal(gameState.fixPending, 0);
    });
  });
});
