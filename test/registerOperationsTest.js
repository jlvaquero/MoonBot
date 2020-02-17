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

  describe('nor operation', function () {
    it('0 nor 15 - it should return 0', function () {
      assert.equal(regOp4bits.NOR(0, 15), 0);
    });
    it('15 nor 0 - it should return 0', function () {
      assert.equal(regOp4bits.NOR(15, 0), 0);
    });
    it('15 nor 15 - it should return 0', function () {
      assert.equal(regOp4bits.NOR(15, 15), 0);
    });
    it('0 nor 0 - it should return 15', function () {
      assert.equal(regOp4bits.NOR(0, 0), 15);
    });
    it('10 nor 5 - it should return 0', function () {
      assert.equal(regOp4bits.NOR(10, 5), 0);
    });
    it('5 nor 10 - it should return 0', function () {
      assert.equal(regOp4bits.NOR(5, 10), 0);
    });
    it('2 nor 6 - it should return 9', function () {
      assert.equal(regOp4bits.NOR(2, 6), 9);
    });
    it('6 nor 2 - it should return 9', function () {
      assert.equal(regOp4bits.NOR(6, 2), 9);
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
  describe('nand operation', function () {
    it('0 and 15 - it should return 15', function () {
      assert.equal(regOp4bits.NAND(0, 15), 15);
    });
    it('15 and 0 - it should return 15', function () {
      assert.equal(regOp4bits.NAND(15, 0), 15);
    });
    it('15 and 15 - it should return 0', function () {
      assert.equal(regOp4bits.NAND(15, 15), 0);
    });
    it('0 and 0 - it should return 15', function () {
      assert.equal(regOp4bits.NAND(0, 0), 15);
    });
    it('10 and 5 - it should return 15', function () {
      assert.equal(regOp4bits.NAND(10, 5), 15);
    });
    it('15 and 1 - it should return 14', function () {
      assert.equal(regOp4bits.NAND(15, 1), 14);
    });
    it('1 and 15 - it should return 14', function () {
      assert.equal(regOp4bits.NAND(1, 15), 14);
    });
    it('15 and 14 - it should return 1', function () {
      assert.equal(regOp4bits.NAND(15, 14), 1);
    });
    it('14 and 15 - it should return 1', function () {
      assert.equal(regOp4bits.NAND(14, 15), 1);
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
  describe('nxor operation', function () {
    it('15 xor 15 - it should return 15', function () {
      assert.equal(regOp4bits.NXOR(15, 15), 15);
    });
    it('15 xor 0 - it should return 0', function () {
      assert.equal(regOp4bits.NXOR(15, 0), 0);
    });
    it('0 xor 15 - it should return 0', function () {
      assert.equal(regOp4bits.NXOR(0, 15), 0);
    });
    it('10 xor 10 - it should return 15', function () {
      assert.equal(regOp4bits.NXOR(10, 10), 15);
    });
    it('10 xor 5 - it should return 0', function () {
      assert.equal(regOp4bits.NXOR(10, 5), 0);
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

  describe('add operation', function () {
    it('0 add 0 should return 0 ', function () {
      assert.equal(regOp4bits.ADD(0,0), 0);
    });
    it('0 add 1 should return 1 ', function () {
      assert.equal(regOp4bits.ADD(0, 1), 1);
    });
    it('1 add 0 should return 1 ', function () {
      assert.equal(regOp4bits.ADD(1, 0), 1);
    });
    it('1 add 1 should return 2 ', function () {
      assert.equal(regOp4bits.ADD(1, 1), 2);
    });
    it('3 add 5 should return 8 ', function () {
      assert.equal(regOp4bits.ADD(3, 5), 8);
    });
    it('5 add 3 should return 8 ', function () {
      assert.equal(regOp4bits.ADD(5, 3), 8);
    });
    it('15 add 0 should return 15 ', function () {
      assert.equal(regOp4bits.ADD(15, 0), 15);
    });
    it('15 add 1 should return 0 ', function () {
      assert.equal(regOp4bits.ADD(15, 1), 0);
    });
    it('14 add 2 should return 0 ', function () {
      assert.equal(regOp4bits.ADD(14, 2), 0);
    });
    it('15 add 2 should return 1 ', function () {
      assert.equal(regOp4bits.ADD(15, 2), 1);
    });
    it('15 add 15 should return 14 ', function () {
      assert.equal(regOp4bits.ADD(15, 15), 14);
    });
    it('63 add 1 should return 0 ', function () {
      assert.equal(registerOperations(6).ADD(63, 1), 0);
    });
    it('63 add 2 should return 1 ', function () {
      assert.equal(registerOperations(6).ADD(63, 1), 0);
    });
    it('63 add 63 should return 1 ', function () {
      assert.equal(registerOperations(6).ADD(63, 63), 62);
    });
  });
  describe('sub operation', function () {
    it('6 sub 2 should retrun 4', function () {
      assert.equal(regOp4bits.SUB(6, 2), 4);
    });
    it('0 sub 0 should retrun 0', function () {
      assert.equal(regOp4bits.SUB(0, 0), 0);
    });
    it('6 sub 0 should retrun 6', function () {
      assert.equal(regOp4bits.SUB(6, 0), 6);
    });
    it('15 sub 0 should retrun 15', function () {
      assert.equal(regOp4bits.SUB(15, 0), 15);
    });
    it('0 sub 1 should retrun 15', function () {
      assert.equal(regOp4bits.SUB(0, 1), 15);
    });
    it('1 sub 3 should retrun 14', function () {
      assert.equal(regOp4bits.SUB(1, 3), 14);
    });
    it('5 sub 10 should retrun 11', function () {
      assert.equal(regOp4bits.SUB(5, 10), 11);
    });
    it('1 sub 2 should retrun 63', function () {
      assert.equal(registerOperations(6).SUB(1, 2), 63);
    });
  });

});