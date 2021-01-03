const Tile = require('../src/meld.js').Tile;
const RankTypes = require('../src/meld.js').RankTypes;
const SuitTypes = require('../src/meld.js').SuitTypes;
const MeldTypes = require('../src/meld.js').MeldTypes;
const Meld = require('../src/meld.js').Meld;
const expect = require('chai').expect;
const b1 = new Tile(SuitTypes.bamboo, RankTypes.one);
const b2 = new Tile(SuitTypes.bamboo, RankTypes.two);
const b3 = new Tile(SuitTypes.bamboo, RankTypes.three);
const b4 = new Tile(SuitTypes.bamboo, RankTypes.four);
const b5 = new Tile(SuitTypes.bamboo, RankTypes.five);
const b6 = new Tile(SuitTypes.bamboo, RankTypes.six);
const b7 = new Tile(SuitTypes.bamboo, RankTypes.seven);
const b8 = new Tile(SuitTypes.bamboo, RankTypes.eight);
const d1 = new Tile(SuitTypes.dot, RankTypes.one);
const d2 = new Tile(SuitTypes.dot, RankTypes.two);
const c1 = new Tile(SuitTypes.character, RankTypes.one);
const c2 = new Tile(SuitTypes.character, RankTypes.two);
const we = new Tile(SuitTypes.wind, RankTypes.east);
const ws = new Tile(SuitTypes.wind, RankTypes.south);
const ww = new Tile(SuitTypes.wind, RankTypes.west);
const wn = new Tile(SuitTypes.wind, RankTypes.north);
const dr = new Tile(SuitTypes.dragon, RankTypes.red);
const dg = new Tile(SuitTypes.dragon, RankTypes.green);
const dw = new Tile(SuitTypes.dragon, RankTypes.blank);

describe('#Tile() constructor', function () {
    it('assigns instance variables correctly', function () {
        const t1 = new Tile(SuitTypes.dot, RankTypes.one);
        expect(t1.hasOwnProperty('suit')).is.true;
        expect(t1.hasOwnProperty('rank')).is.true;
        expect(t1.suit).is.equal(SuitTypes.dot);
        expect(t1.rank).is.equal(RankTypes.one);

        const t2 = new Tile(SuitTypes.character, RankTypes.eight);
        expect(t2.suit).is.equal(SuitTypes.character);
        expect(t2.rank).is.equal(RankTypes.eight);
        expect(t1.suit).is.not.equal(t2.suit);
        expect(t1.rank).is.not.equal(t2.rank);

        const t3 = new Tile(SuitTypes.dragon, RankTypes.green);
        expect(t3.suit).is.equal(SuitTypes.dragon);
        expect(t3.rank).is.equal(RankTypes.green);

        const t4 = new Tile(SuitTypes.wind, RankTypes.north);
        expect(t4.suit).is.equal(SuitTypes.wind);
        expect(t4.rank).is.equal(RankTypes.north);
    })
})

describe('#isSameSuit()', function () {
    it('identifies suit equality without regard to rank', function () {
        const t1 = new Tile(SuitTypes.bamboo, RankTypes.four);
        expect(t1.isSameSuit(t1)).is.true; //same instance
        expect(t1.isSameSuit(b4)).is.true; //same tile, different instance
        expect(t1.isSameSuit(b4)).is.true; //same suit different tile

        expect(ww.isSameSuit(we)).is.true;
        expect(dw.isSameSuit(dr)).is.true;
    })

    it('identifies suit inequality when ranks may be equal', function () {
        expect(b1.isSameSuit(c1)).is.false;
        expect(b1.isSameSuit(d1)).is.false;
        expect(b1.isSameSuit(we)).is.false;
        expect(b1.isSameSuit(dr)).is.false;
    })

    it('is symmetric', function () {
        expect(b1.isSameSuit(b2)).is.equal(b2.isSameSuit(b1));
        expect(d1.isSameSuit(b1)).is.equal(b1.isSameSuit(d1));
    })
})

describe('isEqualRank()', function () {
    it('identifies rank equality without regard to suit', function () {
        const t1 = new Tile(SuitTypes.bamboo, RankTypes.one);
        expect(t1.isEqualRank(t1)).is.true; //same instance
        expect(t1.isEqualRank(b1)).is.true; //same tile, different instance
        expect(t1.isEqualRank(c1)).is.true; //same rank different tile
    })

    it('identifies rank inequality when suits are only numeric', function () {
        expect(b1.isEqualRank(b2)).is.false;
        expect(b1.isEqualRank(c2)).is.false;
        expect(c1.isEqualRank(d2)).is.false;
    })

    //possibly a bad test case to include
    it('falsely identifies rank equality with honor suits***', function () {
        expect(b1.isEqualRank(we)).is.true;
        expect(c1.isEqualRank(dr)).is.true;
        expect(ws.isEqualRank(dg)).is.true;
    })

    it('is symmetric', function () {
        expect(c1.isEqualRank(d1)).is.equal(d1.isEqualRank(c1));
        expect(c1.isEqualRank(c2)).is.equal(c2.isEqualRank(c1));
    })
})

describe('#equals()', function () {
    it('identifies tile equality by property values only', function () {
        const t1 = new Tile(SuitTypes.bamboo, RankTypes.one);
        expect(t1.equals(t1)).is.true; //same instance
        expect(t1.equals(b1)).is.true; //different instance, same tile
        expect(t1 === b1).is.false;
    })

    it('correctly identifies tile inequality when ranks may be equal across honor suits', function () {
        expect(c1.isEqualRank(we)).is.true; //confirm false rank equality
        expect(c1.equals(we)).is.false;
        expect(d2.isEqualRank(ws)).is.true;
        expect(d2.equals(ws)).is.false;
        expect(b3.isEqualRank(dw)).is.true;
        expect(b3.equals(dw)).is.false;
    })

    it('is symmetric', function () {
        const t1 = new Tile(SuitTypes.bamboo, RankTypes.one);
        expect(t1.equals(b1)).is.equal(b1.equals(t1));
        expect(b1.equals(b2)).is.equal(b2.equals(b1));
    })
})

describe('#Meld() constructor', function() {
    it('assigns instance variables correctly', function () {
        const mc1 = new Meld(MeldTypes.chow, [b1, b2, b3]);
        expect(mc1.hasOwnProperty('suit')).is.true;
        expect(mc1.hasOwnProperty('type')).is.true;
        expect(mc1.hasOwnProperty('ranks')).is.true;
        expect(mc1.hasOwnProperty('isConcealed')).is.true;
        expect(mc1.suit).is.equal(SuitTypes.bamboo);
        expect(mc1.type).is.equal(MeldTypes.chow);
        expect(mc1.ranks).is.deep.equal([RankTypes.one, RankTypes.two, RankTypes.three]);
        expect(mc1.isConcealed).is.false;

        const mc2 = new Meld(MeldTypes.chow, [b4, b5, b6], true);
        expect(mc2.suit).is.equal(SuitTypes.bamboo);
        expect(mc2.type).is.equal(MeldTypes.chow);
        expect(mc2.ranks).is.deep.equal([RankTypes.four, RankTypes.five, RankTypes.six]);
        expect(mc2.isConcealed).is.true;

        const mc3 = new Meld(MeldTypes.chow, [b6, b7, b8]);
        expect(mc3.suit).is.equal(SuitTypes.bamboo);
        expect(mc3.type).is.equal(MeldTypes.chow);
        expect(mc3.ranks).is.deep.equal([RankTypes.six, RankTypes.seven, RankTypes.eight]);
        expect(mc3.isConcealed).is.false;

        const mpe1 = new Meld(MeldTypes.peng, [c2, c2, c2]);
        expect(mpe1.suit).is.equal(SuitTypes.character);
        expect(mpe1.type).is.equal(MeldTypes.peng);
        expect(mpe1.ranks).is.deep.equal([RankTypes.two, RankTypes.two, RankTypes.two]);
        expect(mpe1.isConcealed).is.false;

        const mpe2 = new Meld(MeldTypes.peng, [wn, wn, wn]);
        expect(mpe2.suit).is.equal(SuitTypes.wind);
        expect(mpe2.type).is.equal(MeldTypes.peng);
        expect(mpe2.ranks).is.deep.equal([RankTypes.north, RankTypes.north, RankTypes.north]);
        expect(mpe2.isConcealed).is.false;

        const mpk1 = new Meld(MeldTypes.kong, [dw, dw, dw, dw], true);
        expect(mpk1.suit).is.equal(SuitTypes.dragon);
        expect(mpk1.type).is.equal(MeldTypes.kong);
        expect(mpk1.ranks).is.deep.equal([RankTypes.blank, RankTypes.blank, RankTypes.blank, RankTypes.blank]);
        expect(mpk1.isConcealed).is.true;

        const mpa1 = new Meld(MeldTypes.pair, [d1, d1], true);
        expect(mpa1.suit).is.equal(SuitTypes.dot);
        expect(mpa1.type).is.equal(MeldTypes.pair);
        expect(mpa1.ranks).is.deep.equal([RankTypes.one, RankTypes.one]);
        expect(mpa1.isConcealed).is.true;

    })
})