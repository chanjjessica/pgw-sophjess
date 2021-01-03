const expect = require('chai').expect;
const Hand = require('../src/hand').Hand;
const Tile = require('../src/meld').Tile;
const Meld = require('../src/meld').Meld;
const MeldTypes = require('../src/meld').MeldTypes;
const SuitTypes = require('../src/meld').SuitTypes;
const RankTypes = require('../src/meld').RankTypes;
const ScoreState = require('../src/score.js').ScoreState;
const arrayTripleProduct = require('../src/score').arrayTripleProduct;
const Evaluator = require('../src/evaluator').Evaluator;

function createHand(bambooRanks, dotRanks, charRanks, windRanks, dragonRanks) {
    const hand = new Hand();
    const rankArrays = [bambooRanks, dotRanks, charRanks, windRanks, dragonRanks];
    for (let s = 0; s < rankArrays.length; s++) {
        for (const r of rankArrays[s]) {
            hand.addTile(new Tile(s, r));
        }
    }
    return hand;
}

describe('#getAllOccurences()', function () {
    it('1 occurence of int should produce length 1 array', function () {
        expect([1, 2, 3].getAllOccurrences(2)).is.deep.equal([1]);
    })

    it('2 occurrences of int should produce length 2 array', function () {
        expect([1, 3, 1, 4, 5].getAllOccurrences(1)).is.deep.equal([0, 2]);
    })

    it('works on array equality', function () {
        expect([[1, 2], [3, 4], [5, 6]].getAllOccurrences([3, 4])).is.deep.equal([1]);
    })

    it('respects inner array groupings', function () {
        expect([[1, 2], [3, 4], [5, 6]].getAllOccurrences([2, 3])).is.deep.equal([]);
        expect([[1, 2], [3, 4], [5, 6]].getAllOccurrences(2)).is.deep.equal([]);
    })
})

describe('#arrayTripleProduct()', function () {
    it('1x1x1 should produce one array', function () {
        expect(arrayTripleProduct([1], [2], [3])).is.deep.equal([[1, 2, 3]]);
    })

    it('2x1x1 should produce 2 arrays', function () {
        expect(arrayTripleProduct([1, 2], [3], [4])).is.deep.equal([[1, 3, 4], [2, 3, 4]]);
        expect(arrayTripleProduct([1], [2, 3], [4])).is.deep.equal([[1, 2, 4], [1, 3, 4]]);
        expect(arrayTripleProduct([1], [2], [3, 4])).is.deep.equal([[1, 2, 3], [1, 2, 4]]);
    })

    it('3x1x1 should produce 3 arrays', function () {
        expect(arrayTripleProduct([1, 2, 3], [4], [5])).is.deep.equal([[1, 4, 5], [2, 4, 5], [3, 4, 5]]);
        expect(arrayTripleProduct([1], [2, 3, 4], [5])).is.deep.equal([[1, 2, 5], [1, 3, 5], [1, 4, 5]]);
        expect(arrayTripleProduct([1], [2], [3, 4, 5])).is.deep.equal([[1, 2, 3], [1, 2, 4], [1, 2, 5]]);
    })

    it('2x2x1 should produce 4 arrays', function () {
        expect(arrayTripleProduct([1, 2], [3, 4], [5])).is.deep.equal([[1, 3, 5], [1, 4, 5], [2, 3, 5], [2, 4, 5]]);
    })

    it('should be ordered', function () {
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.deep.include(['a', 'b', 'c']);
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.not.deep.include(['a', 'c', 'b']);
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.not.deep.include(['b', 'a', 'c']);
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.not.deep.include(['b', 'c', 'a']);
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.not.deep.include(['c', 'a', 'b']);
        expect(arrayTripleProduct(['a'], ['b'], ['c'])).is.not.deep.include(['c', 'b', 'a']);
    })
})

describe('ScoreState constructor', function () {
    it('assigns instance variables correctly', function () {
        const m1 = new Meld(MeldTypes.chow, [new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.six)], true);
        const m2 = new Meld(MeldTypes.chow, [new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.seven)], true);
        const m3 = new Meld(MeldTypes.peng, [new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two)], true);
        const m4 = new Meld(MeldTypes.kong, [new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red)], true);
        const m5 = new Meld(MeldTypes.pair, [new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green)], true);
        const inputMeldList = [m3, m2, m5, m4, m1];
        const ss1 = new ScoreState(inputMeldList, true, true);

        expect(ss1.totalScore).is.equal(0);
        expect(ss1.rawMelds).is.deep.equal([m1, m2, m3, m4, m5]);
        expect(ss1.meldMask).is.deep.equal([MeldTypes.chow, MeldTypes.chow, MeldTypes.peng, MeldTypes.kong, MeldTypes.pair]);
        expect(ss1.suitMask).is.deep.equal([SuitTypes.bamboo, SuitTypes.bamboo, SuitTypes.dot, SuitTypes.dragon, SuitTypes.dragon]);
        expect(ss1.rankMask).is.deep.equal([[RankTypes.four, RankTypes.five, RankTypes.six],
            [RankTypes.five, RankTypes.six, RankTypes.seven],
            [RankTypes.two, RankTypes.two, RankTypes.two],
            [RankTypes.red, RankTypes.red, RankTypes.red, RankTypes.red],
            [RankTypes.green, RankTypes.green]]);
        expect(ss1.fullyConcealed).is.true;
        expect(ss1.selfDraw).is.true;
        expect(ss1.wallExhausted).is.true;
        expect(ss1.allPairs).is.false;
        expect(ss1.knittedStraight).is.false;
        expect(ss1.flush).is.false;
        expect(ss1.halfFlush).is.false;
        expect(ss1.pureStraight).is.false;
        expect(ss1.pureShift).is.false;
        expect(ss1.onlyFives).is.false;
        expect(ss1.onlyUpper).is.false;
        expect(ss1.onlyLower).is.false;
        expect(ss1.threeWinds).is.false;
        expect(ss1.mixedStraight).is.false;
        expect(ss1.mixedTripleChow).is.false;
        expect(ss1.mixedShift).is.false;
        expect(ss1.allTypes).is.false;
        expect(ss1.allPengs).is.false;
        expect(ss1.lacksHonors).is.false;
        expect(ss1.oneVoidedSuit).is.false;
        expect(ss1.doublePengs).is.equal(0);
        expect(ss1.concealed2Pengs).is.equal(0);
        expect(ss1.dragonPengs).is.equal(0);
        expect(ss1.tileHogs).is.equal(0);
        expect(ss1.concealedKongs).is.equal(0);
        expect(ss1.meldedKongs).is.equal(0);
    })
})

describe('special hand scoring', function () {
    it('checkKnittedStraight() identifies knitted straights (#9)', function () {
        const h = createHand([0, 3, 6], [2, 5, 8], [1, 4, 7], [0, 1, 3], [1, 2]);
        const melds = Evaluator.getKnittedStraightMelds(h);
        const ssks = new ScoreState(melds, false);
        ssks.checkKnittedStraight();
        expect(ssks.knittedStraight).is.true;
    })

    it('checkAllPairs() identifies all pairs (#1)', function () {
        const h = createHand([0, 0], [1, 1, 1, 1, 3, 3], [2, 2], [], [0, 0, 2, 2]);
        const melds = Evaluator.getSevenPairsMelds(h);
        const ss7p = new ScoreState(melds, false);
        ss7p.checkAllPairs();
        expect(ss7p.allPairs).is.true;
    })
})

describe('checkSuits()', function () {
    it('identifies full flushes (#1)', function () {
        const ffmelds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.kong, [new Tile(1, 7), new Tile(1, 7), new Tile(1, 7), new Tile(1, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const ssff = new ScoreState(ffmelds, false);
        ssff.checkSuits();
        expect(ssff.flush).is.true;

        expect(ssff.allTypes).is.false;
        expect(ssff.halfFlush).is.false;
        expect(ssff.oneVoidedSuit).is.false;
        expect(ssff.lacksHonors).is.true;
    })

    it('identifies half-flushes (#13)', function () {
        //one numeric, one honor
        const hf1melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.kong, [new Tile(1, 7), new Tile(1, 7), new Tile(1, 7), new Tile(1, 7)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const sshf1 = new ScoreState(hf1melds, false);
        sshf1.checkSuits();
        expect(sshf1.halfFlush).is.true;

        expect(sshf1.allTypes).is.false;
        expect(sshf1.flush).is.false;
        expect(sshf1.oneVoidedSuit).is.false;
        expect(sshf1.lacksHonors).is.false;

        //one numeric, two honors
        const hf2melds = [new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.kong, [new Tile(4, 2), new Tile(4, 2), new Tile(4, 2), new Tile(4, 2)]),
            new Meld(MeldTypes.pair, [new Tile(0, 8), new Tile(1, 8)]),
            new Meld(MeldTypes.peng, [new Tile(0, 0), new Tile(0, 0), new Tile(0, 0)])];
        const sshf2 = new ScoreState(hf2melds, false);
        sshf1.checkSuits();
        expect(sshf1.halfFlush).is.true;

        expect(sshf1.allTypes).is.false;
        expect(sshf1.flush).is.false;
        expect(sshf1.oneVoidedSuit).is.false;
        expect(sshf1.lacksHonors).is.false;
    })

    it('identifies all suits (#15)', function () {
        const asmelds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(2, 0), new Tile(2, 0), new Tile(2, 0)])];
        const ssas = new ScoreState(asmelds, false);
        ssas.checkSuits();
        expect(ssas.allTypes).is.true;

        expect(ssas.flush).is.false;
        expect(ssas.halfFlush).is.false;
        expect(ssas.oneVoidedSuit).is.false;
        expect(ssas.lacksHonors).is.false;
    })

    it('identifies one voided suit (#26)', function () {
        //counts for missing a numeric suit
        const ov1melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const ssov1 = new ScoreState(ov1melds, false);
        ssov1.checkSuits();
        expect(ssov1.oneVoidedSuit).is.true;

        expect(ssov1.allTypes).is.false;
        expect(ssov1.flush).is.false;
        expect(ssov1.halfFlush).is.false;
        expect(ssov1.lacksHonors).is.false;

        //does not count for missing an honor suit
        const ov2melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.kong, [new Tile(2, 1), new Tile(2, 1), new Tile(2, 1), new Tile(2, 1)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const ssov2 = new ScoreState(ov2melds, false);
        ssov2.checkSuits();
        expect(ssov2.oneVoidedSuit).is.false;

        expect(ssov2.allTypes).is.false;
        expect(ssov2.flush).is.false;
        expect(ssov2.halfFlush).is.false;
        expect(ssov2.lacksHonors).is.false;
    })

    it('identifies no honors (#27)', function () {
        //3 numeric suits
        const lh1melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.kong, [new Tile(2, 1), new Tile(2, 1), new Tile(2, 1), new Tile(2, 1)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const sslh1 = new ScoreState(lh1melds, false);
        sslh1.checkSuits();
        expect(sslh1.lacksHonors).is.true;

        expect(sslh1.allTypes).is.false;
        expect(sslh1.flush).is.false;
        expect(sslh1.halfFlush).is.false;
        expect(sslh1.oneVoidedSuit).is.false;

        //2 numeric suits
        const lh2melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.kong, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)])];
        const sslh2 = new ScoreState(lh2melds, false);
        sslh2.checkSuits();
        expect(sslh2.lacksHonors).is.true;

        expect(sslh2.allTypes).is.false;
        expect(sslh2.flush).is.false;
        expect(sslh2.halfFlush).is.false;
        expect(sslh2.oneVoidedSuit).is.true;
    })
})

describe('checkStraights()', function () {
    it('identifies pure straights (#3)', function () {
        const psmelds = [new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssps = new ScoreState(psmelds, false);
        ssps.checkStraights();
        expect(ssps.pureStraight).is.true;
        expect(ssps.mixedStraight).is.false;
    })

    it('identifies mixed straights (#10)', function () {
        //straight across all numeric suits
        const ms1melds = [new Meld(MeldTypes.chow, [new Tile(0, 6), new Tile(0, 7), new Tile(0, 8)]),
            new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms1 = new ScoreState(ms1melds, false);
        ssms1.checkStraights();
        expect(ssms1.mixedStraight).is.true;
        expect(ssms1.pureStraight).is.false;

        //straight across only 2 numeric suits
        const ms2melds = [new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms2 = new ScoreState(ms2melds, false);
        ssms2.checkStraights();
        expect(ssms2.mixedStraight).is.false;
        expect(ssms2.pureStraight).is.false;
    })
})

describe('checkShiftsAndTriples()', function () {
    it('identifies pure shifts (#4)', function () {
        //shift by 1
        const ps1melds = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 5), new Tile(0, 6), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssps1 = new ScoreState(ps1melds, false);
        ssps1.checkShiftsAndTriples();
        expect(ssps1.pureShift).is.true;
        expect(ssps1.mixedShift).is.false;
        expect(ssps1.mixedTripleChow).is.false;

        //shift by 2
        const ps2melds = [new Meld(MeldTypes.chow, [new Tile(2, 1), new Tile(2, 2), new Tile(2, 3)]),
            new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssps2 = new ScoreState(ps2melds, false);
        ssps2.checkShiftsAndTriples();
        expect(ssps2.pureShift).is.true;
        expect(ssps2.mixedShift).is.false;
        expect(ssps2.mixedTripleChow).is.false;

        //both shifts present
        const ps3melds = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssps3 = new ScoreState(ps3melds, false);
        ssps3.checkShiftsAndTriples();
        expect(ssps3.pureShift).is.true;
        expect(ssps3.mixedShift).is.false;
        expect(ssps3.mixedTripleChow).is.false;
    })

    it('identifies mixed triples (#11)', function () {
        //3 numeric suits, lowest chow min
        const mt1melds = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssmt1 = new ScoreState(mt1melds, false);
        ssmt1.checkShiftsAndTriples();
        expect(ssmt1.pureShift).is.false;
        expect(ssmt1.mixedShift).is.false;
        expect(ssmt1.mixedTripleChow).is.true;

        //3 numeric suits, 2nd lowest chow min
        const mt2melds = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssmt2 = new ScoreState(mt2melds, false);
        ssmt2.checkShiftsAndTriples();
        expect(ssmt2.pureShift).is.false;
        expect(ssmt2.mixedShift).is.false;
        expect(ssmt2.mixedTripleChow).is.true;

        //2 numeric suits
        const mt3melds = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssmt3 = new ScoreState(mt3melds, false);
        ssmt2.checkShiftsAndTriples();
        expect(ssmt3.pureShift).is.false;
        expect(ssmt3.mixedShift).is.false;
        expect(ssmt3.mixedTripleChow).is.false;
    })

    it('identifies mixed shifts (#14)', function () {
        //shift by 1
        const ms1melds = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms1 = new ScoreState(ms1melds, false);
        ssms1.checkShiftsAndTriples();
        expect(ssms1.pureShift).is.false;
        expect(ssms1.mixedShift).is.true;
        expect(ssms1.mixedTripleChow).is.false;

        //shift by 2
        const ms2melds = [new Meld(MeldTypes.chow, [new Tile(0, 1), new Tile(0, 2), new Tile(0, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms2 = new ScoreState(ms2melds, false);
        ssms2.checkShiftsAndTriples();
        expect(ssms2.pureShift).is.false;
        expect(ssms2.mixedShift).is.true;
        expect(ssms2.mixedTripleChow).is.false;

        //both shifts present
        const ms3melds = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.chow, [new Tile(0, 4), new Tile(0, 5), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms3 = new ScoreState(ms3melds, false);
        ssms3.checkShiftsAndTriples();
        expect(ssms3.pureShift).is.false;
        expect(ssms3.mixedShift).is.true;
        expect(ssms3.mixedTripleChow).is.false;

        //only 2 numeric suits
        const ms4melds = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssms4 = new ScoreState(ms4melds, false);
        ssms4.checkShiftsAndTriples();
        expect(ssms4.pureShift).is.false;
        expect(ssms4.mixedShift).is.false;
        expect(ssms4.mixedTripleChow).is.false;
    })
})

describe('checkRanks()', function () {
    it('identifies all fives (#5)', function () {
        //each meld includes a 5
        const a5amelds = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.peng, [new Tile(0, 4), new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(2, 4), new Tile(2, 4)])];
        const ssa5a = new ScoreState(a5amelds, false);
        ssa5a.checkRanks();
        expect(ssa5a.onlyFives).is.true;
        expect(ssa5a.onlyLower).is.false;
        expect(ssa5a.onlyUpper).is.false;

        //at least five 5's present, but not across each meld
        const a5bmelds = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.peng, [new Tile(0, 4), new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(2, 4), new Tile(2, 4)])];
        const ssa5b = new ScoreState(a5bmelds, false);
        ssa5b.checkRanks();
        expect(ssa5b.onlyFives).is.false;
        expect(ssa5b.onlyLower).is.false;
        expect(ssa5b.onlyUpper).is.false;
    })

    it('identifies upper four (#6)', function () {
        const u5amelds = [new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.kong, [new Tile(0, 8), new Tile(0, 8), new Tile(0, 8), new Tile(0, 8)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(2, 5), new Tile(2, 5)])];
        const ssu5a = new ScoreState(u5amelds, false);
        ssu5a.checkRanks();
        expect(ssu5a.onlyFives).is.false;
        expect(ssu5a.onlyLower).is.false;
        expect(ssu5a.onlyUpper).is.true;

        //negated by honors
        const u5bmelds = [new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.kong, [new Tile(0, 8), new Tile(0, 8), new Tile(0, 8), new Tile(0, 8)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ssu5b = new ScoreState(u5bmelds, false);
        ssu5b.checkRanks();
        expect(ssu5b.onlyFives).is.false;
        expect(ssu5b.onlyLower).is.false;
        expect(ssu5b.onlyUpper).is.false;
    })

    it('identifies lower four (#7)', function () {
        const l5melds = [new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 1), new Tile(0, 2), new Tile(0, 3)]),
            new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.pair, [new Tile(2, 3), new Tile(2, 3)])];
        const ssl5 = new ScoreState(l5melds, false);
        ssl5.checkRanks();
        expect(ssl5.onlyFives).is.false;
        expect(ssl5.onlyLower).is.true;
        expect(ssl5.onlyUpper).is.false;
    })
})

describe('checkPengsOrKongs()', function () {
    it('identifies big three winds (#8)', function () {
        // all four winds
        const bw1melds = [new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.kong, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssbw1 = new ScoreState(bw1melds, false);
        ssbw1.checkPengsOrKongs();
        expect(ssbw1.threeWinds).is.true;
        expect(ssbw1.allPengs).is.true;
        expect(ssbw1.doublePengs).is.equal(0);
        expect(ssbw1.concealed2Pengs).is.equal(0);
        expect(ssbw1.concealedKongs).is.equal(0);
        expect(ssbw1.meldedKongs).is.equal(2);
        expect(ssbw1.dragonPengs).is.equal(0);

        // all three winds
        const bw2melds = [new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.kong, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssbw2 = new ScoreState(bw2melds, false);
        ssbw2.checkPengsOrKongs();
        expect(ssbw2.threeWinds).is.true;
        expect(ssbw2.allPengs).is.false;
        expect(ssbw2.doublePengs).is.equal(0);
        expect(ssbw2.concealed2Pengs).is.equal(0);
        expect(ssbw2.concealedKongs).is.equal(0);
        expect(ssbw2.meldedKongs).is.equal(2);
        expect(ssbw2.dragonPengs).is.equal(0);

        // pair doesn't count
        const bw3melds = [new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.peng, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)]),
            new Meld(MeldTypes.pair, [new Tile(3, 2), new Tile(3, 2)])];
        const ssbw3 = new ScoreState(bw3melds, false);
        ssbw3.checkPengsOrKongs();
        expect(ssbw3.threeWinds).is.false;
        expect(ssbw3.allPengs).is.false;
        expect(ssbw3.doublePengs).is.equal(0);
        expect(ssbw3.concealed2Pengs).is.equal(0);
        expect(ssbw3.concealedKongs).is.equal(0);
        expect(ssbw3.meldedKongs).is.equal(1);
        expect(ssbw3.dragonPengs).is.equal(0);
    })

    it('identifies all pengs (#12), counts dragon pengs (#16, #18)', function () {
        const apmelds = [new Meld(MeldTypes.kong, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.kong, [new Tile(4, 1), new Tile(4, 1), new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.kong, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssap = new ScoreState(apmelds, false);
        ssap.checkPengsOrKongs();
        expect(ssap.threeWinds).is.false;
        expect(ssap.allPengs).is.true;
        expect(ssap.doublePengs).is.equal(0); //also checks that doublePengs doesn't count matching honor ranks
        expect(ssap.concealed2Pengs).is.equal(0);
        expect(ssap.concealedKongs).is.equal(0);
        expect(ssap.meldedKongs).is.equal(3);
        expect(ssap.dragonPengs).is.equal(1); //also checks that dragon pengs are counted
    })

    it('identifies double pengs (#21)', function () {
        //single pair: kong/peng, concealed/revealed
        const dp1melds = [new Meld(MeldTypes.peng, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)], true),
            new Meld(MeldTypes.kong, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssdp1 = new ScoreState(dp1melds, false);
        ssdp1.checkPengsOrKongs();
        expect(ssdp1.threeWinds).is.false;
        expect(ssdp1.allPengs).is.false;
        expect(ssdp1.doublePengs).is.equal(1);
        expect(ssdp1.concealed2Pengs).is.equal(0);
        expect(ssdp1.concealedKongs).is.equal(0);
        expect(ssdp1.meldedKongs).is.equal(1);
        expect(ssdp1.dragonPengs).is.equal(0);
    })

    it('identifies two concealed pengs', function () {
        const c2pmelds = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)], true),
            new Meld(MeldTypes.kong, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)], true),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)], true),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssc2p = new ScoreState(c2pmelds, false);
        ssc2p.checkPengsOrKongs();
        expect(ssc2p.threeWinds).is.false;
        expect(ssc2p.allPengs).is.false;
        expect(ssc2p.doublePengs).is.equal(0);
        expect(ssc2p.concealed2Pengs).is.equal(1);
        expect(ssc2p.concealedKongs).is.equal(1);
        expect(ssc2p.meldedKongs).is.equal(0);
        expect(ssc2p.dragonPengs).is.equal(0);
    })
})

describe('check4OfKind()', function () {
    it('identifies tile hog (#20)', function () {
        //single tile hog; across peng/chow
        const th1melds = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)]),
            new Meld(MeldTypes.peng, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.kong, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssth1 = new ScoreState(th1melds, false);
        ssth1.check4ofKind();
        expect(ssth1.tileHogs).is.equal(1);

        //multiple tile hogs; across pair/chows
        const th2melds = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.pair, [new Tile(1, 2), new Tile(1, 2)])];
        const ssth2 = new ScoreState(th2melds, false);
        ssth2.check4ofKind();
        expect(ssth2.tileHogs).is.equal(2);

        //doesn't count kongs
        const th3melds = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)]),
            new Meld(MeldTypes.kong, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssth3 = new ScoreState(th3melds, false);
        ssth3.check4ofKind();
        expect(ssth3.tileHogs).is.equal(0);
    })
})

describe('assignment of scoring values', function () {
    it('assigns singular base values (non-meta conditions) correctly (not #17, #19, #22, #23, #24, #25)', function () {
        // #1 7 pairs
        const allPairs = [new Meld(MeldTypes.pair, [new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(2, 4), new Tile(2, 4)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.pair, [new Tile(0, 2), new Tile(0, 2)]),
            new Meld(MeldTypes.pair, [new Tile(1, 7), new Tile(1, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ss7p = new ScoreState(allPairs, false);
        ss7p.checkAllFan().assignScore();
        expect(ss7p.totalScore).is.equal(24);

        // #2 full flush
        const fullFlush = [new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 6), new Tile(1, 6), new Tile(1, 6)]),
            new Meld(MeldTypes.peng, [new Tile(1, 7), new Tile(1, 7), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.pair, [new Tile(1, 8), new Tile(1, 8)])];
        const ssff = new ScoreState(fullFlush, false);
        ssff.checkAllFan().assignScore();
        expect(ssff.totalScore).is.equal(24);

        // #3 pure straight
        const pureStraight = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.peng, [new Tile(0, 0), new Tile(0, 0), new Tile(0, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const sspst = new ScoreState(pureStraight, false);
        sspst.checkAllFan().assignScore();
        expect(sspst.totalScore).is.equal(17); //base 16 + one voided suit 1

        // #4 pure shift
        const pureShift = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.peng, [new Tile(0, 0), new Tile(0, 0), new Tile(0, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const sspsh = new ScoreState(pureShift, false);
        sspsh.checkAllFan().assignScore();
        expect(sspsh.totalScore).is.equal(17); //base 16 + one voided suit 1

        // #5 all fives
        const allFives = [new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.peng, [new Tile(0, 4), new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(1, 4), new Tile(1, 4)])];
        const ssaf = new ScoreState(allFives, false);
        ssaf.checkAllFan().assignScore();
        expect(ssaf.totalScore).is.equal(17); //base 16 + lacks honors 1

        // #6 upper four (12)
        const upperFour = [new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.peng, [new Tile(0, 7), new Tile(0, 7), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(1, 8), new Tile(1, 8)])];
        const ssu4 = new ScoreState(upperFour, false);
        ssu4.checkAllFan().assignScore();
        expect(ssu4.totalScore).is.equal(13); //base 12 + lacks honors 1

        // #7 lower four
        const lowerFour = [new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 1)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.peng, [new Tile(0, 3), new Tile(0, 3), new Tile(0, 3)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)])];
        const ssl4 = new ScoreState(lowerFour, false);
        ssl4.checkAllFan().assignScore();
        expect(ssl4.totalScore).is.equal(13); //base 12 + lacks honors 1

        // #8 big three winds
        const bigWinds = [new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)])];
        const ss3w = new ScoreState(bigWinds, false);
        ss3w.checkAllFan().assignScore();
        expect(ss3w.totalScore).is.equal(13); //base 12 + one voided suit 1

        // #9 knitted straight
        const knittedStraight = [new Meld(MeldTypes.special, [new Tile(0, 0), new Tile(0, 3), new Tile(0, 6)]),
            new Meld(MeldTypes.special, [new Tile(1, 1), new Tile(1, 4), new Tile(1, 7)]),
            new Meld(MeldTypes.special, [new Tile(2, 2), new Tile(2, 5), new Tile(2, 8)]),
            new Meld(MeldTypes.special, [new Tile(3, 3), new Tile(3, 2, new Tile(3, 1))]),
            new Meld(MeldTypes.special, [new Tile(4, 1), new Tile(4, 2)])];
        const ssks = new ScoreState(knittedStraight, false);
        ssks.checkAllFan().assignScore();
        expect(ssks.totalScore).is.equal(12);

        // #10 mixed straight (8)
        const mixedStraight = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 3), new Tile(0, 4), new Tile(0, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ssmst = new ScoreState(mixedStraight, false);
        ssmst.checkAllFan().assignScore();
        expect(ssmst.totalScore).is.equal(8);

        // #11 mixed triple
        const mixedTriple = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ssmt = new ScoreState(mixedTriple, false);
        ssmt.checkAllFan().assignScore();
        expect(ssmt.totalScore).is.equal(8);

        // #12 all pengs (6)
        const allPengs = [new Meld(MeldTypes.peng, [new Tile(0, 0), new Tile(0, 0), new Tile(0, 0)]),
            new Meld(MeldTypes.peng, [new Tile(1, 2), new Tile(1, 2), new Tile(1, 2)]),
            new Meld(MeldTypes.peng, [new Tile(2, 1), new Tile(2, 1), new Tile(2, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.pair, [new Tile(1, 1), new Tile(1, 1)])];

        // #13 half flush
        const halfFlush = [new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 6), new Tile(1, 6), new Tile(1, 6)]),
            new Meld(MeldTypes.peng, [new Tile(1, 7), new Tile(1, 7), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.pair, [new Tile(3, 2), new Tile(3, 2)])];
        const sshf = new ScoreState(halfFlush, false);
        sshf.checkAllFan().assignScore();
        expect(sshf.totalScore).is.equal(6);

        // #14 mixed shift
        const mixedShift = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 1), new Tile(0, 2), new Tile(0, 3)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ssmsh = new ScoreState(mixedShift, false);
        ssmsh.checkAllFan().assignScore();
        expect(ssmsh.totalScore).is.equal(6);

        // #15 all types
        const allTypes = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssat = new ScoreState(allTypes, false);
        ssat.checkAllFan().assignScore();
        expect(ssat.totalScore).is.equal(6);

        // #16 2 dragons
        const twoDragons = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(4, 1), new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(4, 0), new Tile(4, 0), new Tile(4, 0)]),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ss2d = new ScoreState(twoDragons, false);
        ss2d.checkAllFan().assignScore();
        expect(ss2d.totalScore).is.equal(6);

        // #18 1 dragon (2)
        const oneDragon = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 8), new Tile(1, 8), new Tile(1, 8)]),
            new Meld(MeldTypes.peng, [new Tile(4, 0), new Tile(4, 0), new Tile(4, 0)]),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ss1d = new ScoreState(oneDragon, false);
        ss1d.checkAllFan().assignScore();
        expect(ss1d.totalScore).is.equal(2);

        // #20 tile hog
        const tileHog = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ssth = new ScoreState(tileHog, false);
        ssth.checkAllFan().assignScore();
        expect(ssth.totalScore).is.equal(2);

        // #21 double peng
        const doublePeng = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.peng, [new Tile(2, 0), new Tile(2, 0), new Tile(2, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ss2p = new ScoreState(doublePeng, false);
        ss2p.checkAllFan().assignScore();
        expect(ss2p.totalScore).is.equal(2);

        // #26 one voided suit
        const oneVoid = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ss1v = new ScoreState(oneVoid, false);
        ss1v.checkAllFan().assignScore();
        expect(ss1v.totalScore).is.equal(1);

        // #27 no honors
        const lacksHonors = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ss0h = new ScoreState(lacksHonors, false);
        ss0h.checkAllFan().assignScore();
        expect(ss0h.totalScore).is.equal(1);

        // #28 basic hu
        const basic = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ssb = new ScoreState(basic, false);
        ssb.checkAllFan().assignScore();
        expect(ssb.totalScore).is.equal(1);
    })

    it('assigns combination values (non-meta conditions) correctly (not #17, #19, #22, #23, #24, #25)', function () {
        // #1 + #2 seven pairs in one suit
        const pairsFlush = [new Meld(MeldTypes.pair, [new Tile(0, 0), new Tile(0, 0)]),
            new Meld(MeldTypes.pair, [new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.pair, [new Tile(0, 3), new Tile(0, 3)]),
            new Meld(MeldTypes.pair, [new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(0, 5), new Tile(0, 5)]),
            new Meld(MeldTypes.pair, [new Tile(0, 7), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(0, 8), new Tile(0, 8)])];
        const sspf = new ScoreState(pairsFlush, false);
        sspf.checkAllFan().assignScore();
        expect(sspf.totalScore).is.equal(24 + 24);

        // #1 + #2 + #6 + #20 seven pairs >5 in one suit
        const highFlushPairs = [new Meld(MeldTypes.pair, [new Tile(0, 5), new Tile(0, 5)]),
            new Meld(MeldTypes.pair, [new Tile(0, 5), new Tile(0, 5)]),
            new Meld(MeldTypes.pair, [new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(0, 6), new Tile(0, 6)]),
            new Meld(MeldTypes.pair, [new Tile(0, 7), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(0, 7), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(0, 8), new Tile(0, 8)])];
        const sshpf = new ScoreState(highFlushPairs, false);
        sshpf.checkAllFan().assignScore();
        expect(sshpf.totalScore).is.equal(24 + 24 + 12 + (3 * 2));

        // #1 + #13 seven pairs in one suit + honors
        const pairsHalfFlush = [new Meld(MeldTypes.pair, [new Tile(0, 0), new Tile(0, 0)]),
            new Meld(MeldTypes.pair, [new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.pair, [new Tile(0, 3), new Tile(0, 3)]),
            new Meld(MeldTypes.pair, [new Tile(0, 4), new Tile(0, 4)]),
            new Meld(MeldTypes.pair, [new Tile(0, 5), new Tile(0, 5)]),
            new Meld(MeldTypes.pair, [new Tile(0, 7), new Tile(0, 7)]),
            new Meld(MeldTypes.pair, [new Tile(3, 1), new Tile(3, 1)])];
        const ssphf = new ScoreState(pairsHalfFlush, false);
        ssphf.checkAllFan().assignScore();
        expect(ssphf.totalScore).is.equal(24 + 6);

        // #2 + #3 straight in one suit
        const straightFlush = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssstf = new ScoreState(straightFlush, false);
        ssstf.checkAllFan().assignScore();
        expect(ssstf.totalScore).is.equal(24 + 16);

        // #2 + #4 shift in one suit
        const shiftFlush = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const ssshf = new ScoreState(shiftFlush, false);
        ssshf.checkAllFan().assignScore();
        expect(ssstf.totalScore).is.equal(24 + 16);

        // #2 + #7 + #20 <5 in one suit
        const lowFlush = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.pair, [new Tile(1, 0), new Tile(1, 0)])];
        const sslf = new ScoreState(lowFlush, false);
        sslf.checkAllFan().assignScore();
        expect(sslf.totalScore).is.equal(24 + 12 + (3 * 2));

        // #2 + #12 all pengs in one suit
        const pengFlush = [new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.peng, [new Tile(1, 2), new Tile(1, 2), new Tile(1, 2)]),
            new Meld(MeldTypes.peng, [new Tile(1, 3), new Tile(1, 3), new Tile(1, 3)]),
            new Meld(MeldTypes.peng, [new Tile(1, 5), new Tile(1, 5), new Tile(1, 5)]),
            new Meld(MeldTypes.pair, [new Tile(1, 6), new Tile(1, 6)])];
        const sspef = new ScoreState(pengFlush, false);
        sspef.checkAllFan().assignScore();
        expect(sspef.totalScore).is.equal(24 + 6);

        // #3 + #13 straight in one suit + honors
        const straightHalfFlush = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const sssthf = new ScoreState(straightHalfFlush, false);
        sssthf.checkAllFan().assignScore();
        expect(sssthf.totalScore).is.equal(16 + 6);

        // #4 + #5 + #27: pure shift, all 5's, one voided suit
        const pureShiftFives = [new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.pair, [new Tile(2, 4), new Tile(2, 4)])];
        const ssps5 = new ScoreState(pureShiftFives, false);
        ssps5.checkRanks();
        ssps5.checkAllFan().assignScore();
        expect(ssps5.totalScore).is.equal(16 + 16 + 1 + 1);

        // #4 + 13: shifted chows in one suit + honors
        const pureShiftHalfFlush = [new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const sspshf = new ScoreState(pureShiftHalfFlush, false);
        sspshf.checkAllFan().assignScore();
        expect(sspshf.totalScore).is.equal(16 + 6);

        // #5 + #11: mixed triple, all fives
        const tripleFives = [new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 2), new Tile(2, 3), new Tile(2, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 4), new Tile(1, 4)])];
        const sst5 = new ScoreState(tripleFives, false);
        sst5.checkAllFan().assignScore();
        expect(sst5.totalScore).is.equal(16 + 8 + 1);

        // #5 + #14: mixed shift, all fives
        const mixedShiftFives = [new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.pair, [new Tile(1, 4), new Tile(1, 4)])];
        const ssmsh5 = new ScoreState(mixedShiftFives, false);
        ssmsh5.checkAllFan().assignScore();
        expect(ssmsh5.totalScore).is.equal(16 + 6 + 1);

        // #6 + #11: mixed triple chow, >5
        const highTriple = [new Meld(MeldTypes.chow, [new Tile(1, 5), new Tile(1, 6), new Tile(1, 7)]),
            new Meld(MeldTypes.chow, [new Tile(0, 5), new Tile(0, 6), new Tile(0, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.pair, [new Tile(1, 5), new Tile(1, 5)])];
        const ssht = new ScoreState(highTriple, false);
        ssht.checkAllFan().assignScore();
        expect(ssht.totalScore).is.equal(12 + 8 + 1);

        // #8 + #12: four winds (3 winds), all pengs
        const allWinds = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssaw = new ScoreState(allWinds, false);
        ssaw.checkAllFan().assignScore();
        expect(ssaw.totalScore).is.equal(12 + 6);

        // #8 + #13: three winds, one suit + honors
        const halfFlushWinds = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const sshfw = new ScoreState(halfFlushWinds, false);
        sshfw.checkAllFan().assignScore();
        expect(sshfw.totalScore).is.equal(12 + 6);

        // #8 + #26: three winds
        const oneVoidedWinds = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.pair, [new Tile(2, 0), new Tile(2, 0)])];
        const ss1vw = new ScoreState(oneVoidedWinds, false);
        ss1vw.checkAllFan().assignScore();
        expect(ss1vw.totalScore).is.equal(12 + 1);

        // #8 + #12 + #13: three winds, all pungs in one suit + honors
        const allPengWinds = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.peng, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.pair, [new Tile(4, 0), new Tile(4, 0)])];
        const ssapw = new ScoreState(allPengWinds, false);
        ssapw.checkAllFan().assignScore();
        expect(ssapw.totalScore).is.equal(12 + 6 + 6);

        // #10 + #15: mixed straight, all types
        const mixedStraightAllTypes = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssmstat = new ScoreState(mixedStraightAllTypes, false);
        ssmstat.checkAllFan().assignScore();
        expect(ssmstat.totalScore).is.equal(8 + 6);

        // #11 + #15: mixed triple chow, all types
        const mixedTripleAllTypes = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssmtat = new ScoreState(mixedTripleAllTypes, false);
        ssmtat.checkAllFan().assignScore();
        expect(ssmtat.totalScore).is.equal(8 + 6);

        // #14 + #15: mixed shifted chow, all types
        const mixedShiftAllTypes = [new Meld(MeldTypes.chow, [new Tile(0, 1), new Tile(0, 2), new Tile(0, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 5), new Tile(2, 6), new Tile(2, 7)]),
            new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]),
            new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)])];
        const ssmshat = new ScoreState(mixedShiftAllTypes, false);
        ssmshat.checkAllFan().assignScore();
        expect(ssmshat.totalScore).is.equal(6 + 6);
    })

    it('adds multiplier values correctly (#20, #23, #25)', function () {
        // #20 multiple tile hogs covered above
        // #23 multiple concealed kongs
        const concealedKongs = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)], true),
            new Meld(MeldTypes.kong, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)], true),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.pair, [new Tile(0, 0), new Tile(0, 0)])];
        const ssck = new ScoreState(concealedKongs, false);
        ssck.checkAllFan().assignScore();
        expect(ssck.totalScore).is.equal(2 * 2);

        // #25 multiple melded kongs
        const meldedKongs = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]),
            new Meld(MeldTypes.kong, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.pair, [new Tile(0, 0), new Tile(0, 0)])];
        const ssmk = new ScoreState(meldedKongs, false);
        ssmk.checkAllFan().assignScore();
        expect(ssmk.totalScore).is.equal(2 * 1);

        // #23 + #25 mixed kongs
        const mixedKongs = [new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.kong, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)], true),
            new Meld(MeldTypes.kong, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.pair, [new Tile(0, 0), new Tile(0, 0)])];
        const ssk = new ScoreState(mixedKongs, false);
        ssk.checkAllFan().assignScore();
        expect(ssk.totalScore).is.equal(2 + 1);
    })

    it('adds meta-condition values correctly (#17, #19, #22, #24)', function () {
        // #17 fully concealed and self drawn
        const selfConceal = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)], true),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)], true),
            new Meld(MeldTypes.chow, [new Tile(3, 1), new Tile(3, 2), new Tile(3, 3)], true),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)], true),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)], true)];
        const sssc = new ScoreState(selfConceal, true);
        sssc.checkAllFan().assignScore();
        expect(sssc.totalScore).is.equal(2 + 2);

        // #19 fully concealed
        const conceal = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)], true),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)], true),
            new Meld(MeldTypes.chow, [new Tile(3, 1), new Tile(3, 2), new Tile(3, 3)], true),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)], true),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)], true)];
        const ssc = new ScoreState(conceal, false);
        ssc.checkAllFan().assignScore();
        expect(ssc.totalScore).is.equal(2);

        // #22 concealed pengs
        const concealedPengs = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)], true),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)], true),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const sscp = new ScoreState(concealedPengs, false);
        sscp.checkAllFan().assignScore();
        expect(sscp.totalScore).is.equal(2);

        // #24 self drawn
        const selfDraw = [new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.chow, [new Tile(0, 2), new Tile(0, 3), new Tile(0, 4)]),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)]),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)], true),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)], true)];
        const sssd = new ScoreState(selfDraw, true);
        sssd.checkAllFan().assignScore();
        expect(sssd.totalScore).is.equal(2);
    })

    it('caps non-multiplying values (non-meta conditions) correctly (#3, #4, #10, #11, #14, #18, #21, #22)', function () {
        // #3: two pure straights
        const doubleStraight = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 6), new Tile(1, 7), new Tile(1, 8)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2st = new ScoreState(doubleStraight, false);
        ss2st.checkAllFan().assignScore();
        expect(ss2st.totalScore).is.equal(16 + 6);

        // #4: two pure shifts
        const doubleShift = [new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 1), new Tile(1, 2), new Tile(1, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(1, 4), new Tile(1, 5), new Tile(1, 6)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2sh = new ScoreState(doubleShift, false);
        ss2sh.checkAllFan().assignScore();
        expect(ss2sh.totalScore).is.equal(16 + 6);

        // #10: two mixed straights
        const doubleMixedStraight = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.chow, [new Tile(2, 6), new Tile(2, 7), new Tile(2, 8)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2mst = new ScoreState(doubleMixedStraight, false);
        ss2mst.checkAllFan().assignScore();
        expect(ss2mst.totalScore).is.equal(8);

        // #11: two triple chows
        const doubleTriple = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(1, 0), new Tile(1, 1), new Tile(1, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 0), new Tile(2, 1), new Tile(2, 2)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2t = new ScoreState(doubleTriple, false);
        ss2t.checkAllFan().assignScore();
        expect(ss2t.totalScore).is.equal(8);

        // #14: two mixed shifts
        const doubleMixedShift = [new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)]),
            new Meld(MeldTypes.chow, [new Tile(2, 1), new Tile(2, 2), new Tile(2, 3)]),
            new Meld(MeldTypes.chow, [new Tile(1, 2), new Tile(1, 3), new Tile(1, 4)]),
            new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2msh = new ScoreState(doubleMixedShift, false);
        ss2msh.checkAllFan().assignScore();
        expect(ss2msh.totalScore).is.equal(6);

        // #18: multiple dragon pengs
        const allDragons = [new Meld(MeldTypes.peng, [new Tile(4, 0), new Tile(4, 0), new Tile(4, 0)]),
            new Meld(MeldTypes.peng, [new Tile(4, 1), new Tile(4, 1), new Tile(4, 1)]),
            new Meld(MeldTypes.peng, [new Tile(4, 2), new Tile(4, 2), new Tile(4, 2)]),
            new Meld(MeldTypes.peng, [new Tile(3, 3), new Tile(3, 3), new Tile(3, 3)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss3d = new ScoreState(allDragons, false);
        ss3d.checkAllFan().assignScore();
        expect(ss3d.totalScore).is.equal(6 + 6 + 2);

        // #21: two double pengs
        const twoDoublePeng = [new Meld(MeldTypes.peng, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]),
            new Meld(MeldTypes.peng, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.peng, [new Tile(2, 0), new Tile(2, 0), new Tile(2, 0)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss2dp = new ScoreState(twoDoublePeng, false);
        ss2dp.checkAllFan().assignScore();
        expect(ss2dp.totalScore).is.equal(6 + 2);

        // #21: one triple peng
        const triplePeng = [new Meld(MeldTypes.chow, [new Tile(1, 3), new Tile(1, 4), new Tile(1, 5)]),
            new Meld(MeldTypes.peng, [new Tile(1, 1), new Tile(1, 1), new Tile(1, 1)]),
            new Meld(MeldTypes.peng, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)]),
            new Meld(MeldTypes.peng, [new Tile(2, 1), new Tile(2, 1), new Tile(2, 1)]),
            new Meld(MeldTypes.pair, [new Tile(3, 0), new Tile(3, 0)])];
        const ss3p = new ScoreState(triplePeng, false);
        ss3p.checkAllFan().assignScore();
        expect(ss3p.totalScore).is.equal(2);

        // #22: four concealed pengs
        const fourConcealedPengs = [new Meld(MeldTypes.peng, [new Tile(1, 4), new Tile(1, 4), new Tile(1, 4)], true),
            new Meld(MeldTypes.peng, [new Tile(0, 2), new Tile(0, 2), new Tile(0, 2)], true),
            new Meld(MeldTypes.peng, [new Tile(3, 0), new Tile(3, 0), new Tile(3, 0)], true),
            new Meld(MeldTypes.peng, [new Tile(0, 6), new Tile(0, 6), new Tile(0, 6)], true),
            new Meld(MeldTypes.pair, [new Tile(2, 1), new Tile(2, 1)])];
        const ss4cp = new ScoreState(fourConcealedPengs, false);
        ss4cp.checkAllFan().assignScore();
        expect(ss4cp.totalScore).is.equal(6 + 2);
    })

})