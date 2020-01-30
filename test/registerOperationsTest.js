const registerOperations = require('../registerOperations');
const regOp4bits = registerOperations(4);
const assert = require('assert');

describe('registerOperations with 4 bits', function () {
  describe('inc operation', function () {
    it('value 0 - it should return 1', function () {
      assert.equal(regOp4bits.INC(0), 1);
    });
    it('value 15 - it should return 0', function () {
      assert.equal(regOp4bits.INC(15), 0);
    });
  });

  describe('dec operation', function () {
    it('value 15 - it should return 14', function () {
      assert.equal(regOp4bits.DEC(15), 14);
    });
    it('value 0 - it should return 15', function () {
      assert.equal(regOp4bits.DEC(0), 15);
    });
  });

  describe('mov operation', function () {
    it('value 5 - it should return 5', function () {
      assert.equal(regOp4bits.MOV(undefined, 5), 5);
    });
  });

  describe('not operation', function () {
    it('value 0 - it should return 15', function () {
      assert.equal(regOp4bits.NOT(0), 15);
    });
    it('value 1 - it should return 14', function () {
      assert.equal(regOp4bits.NOT(1), 14);
    });
    it('value 2 - it should return 13', function () {
      assert.equal(regOp4bits.NOT(2), 13);
    });
    it('value 3 - it should return 12', function () {
      assert.equal(regOp4bits.NOT(3), 12);
    });
    it('value 4 - it should return 11', function () {
      assert.equal(regOp4bits.NOT(4), 11);
    });
    it('value 5 - it should return 10', function () {
      assert.equal(regOp4bits.NOT(5), 10);
    });
    it('value 6 - it should return 9', function () {
      assert.equal(regOp4bits.NOT(6), 9);
    });
    it('value 7 - it should return 8', function () {
      assert.equal(regOp4bits.NOT(7), 8);
    });
    it('value 8 - it should return 7', function () {
      assert.equal(regOp4bits.NOT(8), 7);
    });
    it('value 9 - it should return 6', function () {
      assert.equal(regOp4bits.NOT(9), 6);
    });
    it('value 10 - it should return 5', function () {
      assert.equal(regOp4bits.NOT(10), 5);
    });
    it('value 11 - it should return 4', function () {
      assert.equal(regOp4bits.NOT(11), 4);
    });
    it('value 12 - it should return 3', function () {
      assert.equal(regOp4bits.NOT(12), 3);
    });
    it('value 13 - it should return 2', function () {
      assert.equal(regOp4bits.NOT(13), 2);
    });
    it('value 14 - it should return 1', function () {
      assert.equal(regOp4bits.NOT(14), 1);
    });
    it('value 15 - it should return 0', function () {
      assert.equal(regOp4bits.NOT(15), 0);
    });
  });

  describe('or operation', function () {
    it('0 or 15 - it should return 15', function () {
      assert.equal(regOp4bits.OR(0, 15), 15);
    });
    it('15 or 0 - it should return 15', function () {
      assert.equal(regOp4bits.OR(15, 0), 15);
    });
    it('15 or 15 - it should return 15', function () {
      assert.equal(regOp4bits.OR(15, 15), 15);
    });
    it('0 or 0 - it should return 0', function () {
      assert.equal(regOp4bits.OR(0, 0), 0);
    });
    it('10 or 5 - it should return 15', function () {
      assert.equal(regOp4bits.OR(10, 5), 15);
    });
    it('5 or 10 - it should return 15', function () {
      assert.equal(regOp4bits.OR(5, 10), 15);
    });
    it('2 or 6 - it should return 6', function () {
      assert.equal(regOp4bits.OR(2, 6), 6);
    });
    it('6 or 2 - it should return 6', function () {
      assert.equal(regOp4bits.OR(6, 2), 6);
    });
  });

  describe('and operation', function () {
    it('0 and 15 - it should return 0', function () {
      assert.equal(regOp4bits.AND(0, 15), 0);
    });
    it('15 and 0 - it should return 0', function () {
      assert.equal(regOp4bits.AND(15, 0), 0);
    });
    it('15 and 15 - it should return 15', function () {
      assert.equal(regOp4bits.AND(15, 15), 15);
    });
    it('0 and 0 - it should return 0', function () {
      assert.equal(regOp4bits.AND(0, 0), 0);
    });
    it('10 and 5 - it should return 0', function () {
      assert.equal(regOp4bits.AND(10, 5), 0);
    });
    it('15 and 1 - it should return 1', function () {
      assert.equal(regOp4bits.AND(15, 1), 1);
    });
    it('1 and 15 - it should return 1', function () {
      assert.equal(regOp4bits.AND(1, 15), 1);
    });
    it('15 and 14 - it should return 14', function () {
      assert.equal(regOp4bits.AND(15, 14), 14);
    });
    it('14 and 15 - it should return 14', function () {
      assert.equal(regOp4bits.AND(14, 15), 14);
    });
  });

  describe('xor operation', function () {
    it('15 xor 15 - it should return 0', function () {
      assert.equal(regOp4bits.XOR(15, 15), 0);
    });
    it('15 xor 0 - it should return 15', function () {
      assert.equal(regOp4bits.XOR(15, 0), 15);
    });
    it('0 xor 15 - it should return 15', function () {
      assert.equal(regOp4bits.XOR(0, 15), 15);
    });
    it('10 xor 10 - it should return 0', function () {
      assert.equal(regOp4bits.XOR(10, 10), 0);
    });
    it('10 xor 5 - it should return 15', function () {
      assert.equal(regOp4bits.XOR(10, 5), 15);
    });
  });

  describe('rol operation', function () {
    it('valuie 0 - it should return 0', function () {
      assert.equal(regOp4bits.ROL(0), 0);
    });
    it('valuie 15 - it should return 15', function () {
      assert.equal(regOp4bits.ROL(15), 15);
    });
    it('valuie 1 - it should return 2', function () {
      assert.equal(regOp4bits.ROL(1), 2);
    });
    it('valuie 4 - it should return 8', function () {
      assert.equal(regOp4bits.ROL(4), 8);
    });
    it('valuie 8 - it should return 1', function () {
      assert.equal(regOp4bits.ROL(8), 1);
    });
    it('valuie 12 - it should return 9', function () {
      assert.equal(regOp4bits.ROL(12), 9);
    });
    it('valuie 14 - it should return 13', function () {
      assert.equal(regOp4bits.ROL(14), 13);
    });
  });

  describe('ror operation', function () {
    it('value 0 - it should return 0', function () {
      assert.equal(regOp4bits.ROR(0), 0);
    });
    it('value 15 - it should return 15', function () {
      assert.equal(regOp4bits.ROR(15), 15);
    });
    it('value 14 - it should return 7', function () {
      assert.equal(regOp4bits.ROR(14), 7);
    });
    it('value 8 - it should return 4', function () {
      assert.equal(regOp4bits.ROR(8), 4);
    });
    it('value 4 - it should return 2', function () {
      assert.equal(regOp4bits.ROR(4), 2);
    });
    it('value 13 - it should return 14', function () {
      assert.equal(regOp4bits.ROR(13), 14);
    });
    it('value 5 - it should return 10', function () {
      assert.equal(regOp4bits.ROR(5), 10);
    });
  });

});