const expect = require('chai').expect;

const Evaluator = require('../src/evaluator.js').Evaluator;
const Tile = require('../src/meld.js').Tile;
const Meld = require('../src/meld.js').Meld;
const Hand = require('../src/hand.js').Hand;
const MeldTypes = require('../src/meld.js').MeldTypes;
const SuitTypes = require('../src/meld.js').SuitTypes;

var a = new Tile(0, 0);
var b = new Tile(0, 1);
var c = new Tile(0, 2);
var d = new Tile(2, 8);
var e = new Tile(4, 0);

// Build all pairs hand -- Meld one pair for different case check
var allPairsHand = new Hand();
for (let i = 0; i < 7; i++){
    allPairsHand.addTile(new Tile(SuitTypes.character, i));
    allPairsHand.addTile(new Tile(SuitTypes.character, i));
}

// Build winning hands
var winOne = new Hand();
winOne.melds.push(new Meld(MeldTypes.pair, [a, a]));
winOne.melds.push(new Meld(MeldTypes.peng, [d, d, d]));
winOne.melds.push(new Meld(MeldTypes.peng, [b, b, b]));
winOne.melds.push(new Meld(MeldTypes.chow, [a, b, c]));
winOne.melds.push(new Meld(MeldTypes.kong, [e, e, e, e]));

var winTwo = new Hand();
winTwo.melds.push(new Meld(MeldTypes.pair, [d, d]));
winTwo.addTile(a);
winTwo.addTile(b);
winTwo.addTile(c);
for (let i = 0; i < 3; i++){ winTwo.addTile(b); }
winTwo.melds.push(new Meld(MeldTypes.peng, [d, d, d]));
winTwo.melds.push(new Meld(MeldTypes.kong, [e, e, e, e]));

describe('#canPeng', function(){
    it ('returns true if valid peng', function(){
        expect(Evaluator.canPeng(a, a, a)).to.equal(true);
        expect(Evaluator.canPeng(new Tile(0, 0), a, a)).to.equal(true);
    })

    it ('returns false if invalid peng', function(){
        expect(Evaluator.canPeng(a, b, a)).to.equal(false);
        expect(Evaluator.canPeng(a, b, c)).to.equal(false);
    })

})


describe('#canChow', function(){
    it ('returns true if valid chow', function(){
        expect(Evaluator.canChow(a, b, c)).to.equal(true);
        expect(Evaluator.canChow(b, a, c)).to.equal(true);
    })

    it ('returns false if invalid chow', function(){
        expect(Evaluator.canChow(b, b, c)).to.equal(false);
        expect(Evaluator.canChow(b, b, b)).to.equal(false);
    })

})


describe('#canKong', function(){
    it ('returns true if valid kong', function(){
        expect(Evaluator.canKong(a, a, a, a)).to.equal(true);
    })

    it ('returns false if invalid kong', function(){
        expect(Evaluator.canKong(a, a, a, b)).to.equal(false);
    })

})

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

describe('#getKnittedStraightMelds', function(){
    it('return meld array of knitted straights and honors if true', function(){
        //missing honors
        const kh1 = createHand([0, 3, 6], [1, 4, 7], [2, 5, 8],[0, 1], [0, 1, 2]);
        expect(Evaluator.getKnittedStraightMelds(kh1).length).to.equal(5);

        //missing middle tile, missing end tile
        const kh2 = createHand([1, 4, 7], [0, 6], [2, 5],[0, 1, 2, 3], [0, 1, 2]);
        expect(Evaluator.getKnittedStraightMelds(kh2).length).to.equal(5);

        //missing middle tile, missing honor
        const kh3 = createHand([2, 8], [0, 3, 6], [1, 4, 7], [0, 2, 3], [0, 1, 2]);
        expect(Evaluator.getKnittedStraightMelds(kh3).length).to.equal(5);

        //repeated knitted ranks
        const kh4 = createHand([2, 5, 8], [1, 4, 7], [1, 4, 7],[0, 1], [0, 1, 2]);
        expect(Evaluator.getKnittedStraightMelds(kh4).length).to.equal(5);
    })

    it('returns an empty array if not knitted straight hand', function(){
        //singleton suit
        const kh1 = createHand([6], [1, 4, 7], [2, 5, 8],[0, 1, 2, 3], [0, 1, 2]);
        expect(Evaluator.getKnittedStraightMelds(kh1).length).to.equal(0);

        //singleton honor
        const kh2 = createHand([0, 3, 6], [1, 4, 7], [2, 5, 8],[0, 1, 2, 3], [0]);
        expect(Evaluator.getKnittedStraightMelds(kh2).length).to.equal(0);

        //voided suit/duplicate suit
        const kh3 = createHand([0, 1, 3, 4, 6, 7], [2, 5, 8], [],[0, 1, 2], [0, 1]);
        expect(Evaluator.getKnittedStraightMelds(kh3).length).to.equal(0);

    })

})


describe('#getSevenPairsMelds', function(){
    it('returns a meld array of 7 pairs if true', function(){
        let pairMelds = Evaluator.getSevenPairsMelds(allPairsHand);
        expect(pairMelds.length).to.equal(7);
        expect(pairMelds.filter(m => m.type === MeldTypes.pair).length).to.equal(7);
    })

    it ('returns an empty array if not all pairs hand', function(){
        expect(Evaluator.getSevenPairsMelds(winOne).length).to.equal(0);
    })
})


describe('#findPengsChowsOfSuit', function(){
    it ('returns empty array if no tiles of suit in hand', function(){
        expect(Evaluator.findPengsChowsOfSuit(winTwo, SuitTypes.dot).length).to.equal(0);
    })

    it('returns an array of all pengs and chows of a given suit if there are no loose tiles', function(){
        let m = Evaluator.findPengsChowsOfSuit(winTwo, 0);
        expect(m.length).to.equal(2);
        expect(m[0].type).to.equal(MeldTypes.chow);
        expect(m[1].type).to.equal(MeldTypes.peng);
    })

    it('return [-1] if there are loose tiles (tiles not included in meld)', function(){
        winTwo.addTile(a);
        let looseTiles = Evaluator.findPengsChowsOfSuit(winTwo, 0);
        expect(looseTiles.length).to.equal(1);
        expect(looseTiles[0]).to.equal(-1);
        winTwo.removeTile(a);
    })
})


describe('#findPengsOfSuit', function(){
    it ('returns empty array if no tiles of suit in hand', function(){
        expect(Evaluator.findPengsOfSuit(winTwo, 4).length).to.equal(0);
    })
    it ('returns array of all pengs of given suit if no loose tiles', function(){
        for (let i = 0; i < 3; i++){
            winTwo.addTile(new Tile(3, 2));
            winTwo.addTile(new Tile(3, 1));
            winTwo.addTile(new Tile(3, 0));
        }
        expect(Evaluator.findPengsOfSuit(winTwo, 3).length).to.equal(3);

    })
    it('returns [-1] if ther are loose tiles in suit', function(){
        winTwo.removeTile(new Tile(3, 2));
        winTwo.removeTile(new Tile(3, 1));
        winTwo.removeTile(new Tile(3, 0));
        let looseTiles = Evaluator.findPengsOfSuit(winTwo, 3);
        expect(looseTiles.length).to.equal(1);
        expect(looseTiles[0]).to.equal(-1);
        for (let i = 0; i < 2; i++){
            winTwo.removeTile(new Tile(3, 2));
            winTwo.removeTile(new Tile(3, 1));
            winTwo.removeTile(new Tile(3, 0));
        }
    })

})


var winThree = new Hand();
winThree.addTile(new Tile(4, 1));
winThree.melds.push(new Meld(MeldTypes.peng, [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)]));
winThree.melds.push(new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]));
winThree.melds.push(new Meld(MeldTypes.peng, [new Tile(2, 2), new Tile(2, 2), new Tile(2, 2)]));
winThree.melds.push(new Meld(MeldTypes.kong, [new Tile(1, 3), new Tile (1, 3), new Tile(1, 3), new Tile (1, 3)]));

var winFour = new Hand();
winFour.addTile(new Tile(0, 0));
winFour.addTile(new Tile(0, 0));
winFour.addTile(new Tile(1, 1));
winFour.addTile(new Tile(1, 1));
winFour.addTile(new Tile(1, 1));
winFour.addTile(new Tile(0, 3));
winFour.addTile(new Tile(0, 3));
winFour.addTile(new Tile(0, 3));
winFour.addTile(new Tile(0, 6));
winFour.addTile(new Tile(0, 7));
winFour.addTile(new Tile(0, 8));
winFour.addTile(new Tile(2, 3));
winFour.addTile(new Tile(2, 3));
winFour.addTile(new Tile(2, 3));

describe('getWinningHandMelds', function(){
    let m = winThree.melds.slice();
    let p = [];
    for (let i = 0; i < 5; i++){ p.push(winThree.inPlayTiles[i].slice()); }

    it ('returns melds if all winning melds already exposed and valid winPair', function(){
        let winMelds = Evaluator.getWinningMelds(winThree, new Tile(4, 1));
        console.log(winMelds);
        expect(winMelds.length).to.equal(5);
        expect(winMelds).to.deep.include(new Meld(MeldTypes.pair, [new Tile(4,1), new Tile(4,1)]));
    })

    winThree.melds = winThree.melds.slice(2);
    for (let i = 0; i < 3; i++){ winThree.addTile(new Tile(3, 2)); }
    winThree.addTile(new Tile(2, 4));
    winThree.addTile(new Tile(2, 5));
    winThree.addTile(new Tile(2, 6));

    it('checks for concealed pengs and chows if valid winPair', function(){
        let winMeld = Evaluator.getWinningMelds(winThree, new Tile(4, 1));
        expect(winMeld.length).to.equal(5);
        expect(winMeld).to.deep.include(new Meld(MeldTypes.peng,
            [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)], true));
        expect(winMeld).to.deep.include(new Meld(MeldTypes.chow,
            [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)], true));
    })

    it ('checks for pengs, chows, and a pair if no melded pair', function(){
        winThree.addTile(new Tile(4, 1));
        winMelds = Evaluator.getWinningMelds(winThree);
        expect(winMelds.length).to.equal(5);
        expect(winMelds).to.deep.include(new Meld(MeldTypes.peng,
            [new Tile(3, 2), new Tile(3, 2), new Tile(3, 2)], true));
        expect(winMelds).to.deep.include(new Meld(MeldTypes.chow,
            [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)], true));
        expect(winMelds).to.deep.include(new Meld(MeldTypes.pair, [new Tile(4, 1), new Tile(4, 1)], true));
    })

    it ('checks for knitted hand', function(){
        const knittedHand = createHand([0, 3, 6], [1, 4, 7], [2, 5, 8], [2, 3], [0, 1, 2]);
        expect(Evaluator.getWinningMelds(knittedHand).length).to.equal(5);
    })

    it ('checks for all pairs hand', function(){
        expect(Evaluator.getWinningMelds(allPairsHand).length).to.equal(7);
    })

    it ('returns empty array if not enough melds', function(){
        winThree.addTile(new Tile(3, 3));
        winThree.addTile(new Tile(3, 3));
        winThree.addTile(new Tile(1, 6));
        winThree.addTile(new Tile(1, 6));
        winThree.melds = winThree.melds.slice(1);
        expect(Evaluator.getWinningMelds(winThree).length).to.equal(0);
    })

    it('finds all melds on a completely concealed hand', function () {
        expect(Evaluator.getWinningMelds(winFour).length).to.equal(5);
    })
})

describe('#buildAllRankSetsInSuit', function () {
    it('works on a variety of meld combinations', function () {
        let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[]]);

        counts = [0, 2, 0, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 1]]]);

        counts = [0, 1, 1, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[]]);

        counts = [0, 1, 0, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[]]);

        counts = [0, 1, 1, 1, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3]]]);

        counts = [0, 1, 1, 1, 1, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3]], [[2, 3, 4]]]);

        counts = [0, 1, 1, 1, 1, 1, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3]], [[2, 3, 4]], [[3, 4, 5]]]);

        counts = [0, 1, 1, 1, 2, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [4, 4]], [[2, 3, 4]]]);

        counts = [0, 1, 1, 2, 1, 1, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [3, 4, 5]], [[2, 3, 4]]]);

        counts = [0, 1, 1, 1, 1, 1, 1, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [4, 5, 6]], [[2, 3, 4]], [[3, 4, 5]]]);

        counts = [1, 1, 1, 0, 1, 1, 1, 0, 1];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[0, 1, 2], [4, 5, 6]]]);

        counts = [1, 1, 1, 0, 1, 1, 1, 0, 2];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[0, 1, 2], [4, 5, 6], [8, 8]]]);

        counts = [3, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[0, 0, 0]]]);

        counts = [0, 3, 2, 0, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 1, 1], [2, 2]]]);

        counts = [0, 3, 2, 1, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3]], [[1, 1, 1]]]);

        counts = [0, 4, 1, 1, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [1, 1, 1]]]);

        counts = [0, 4, 4, 4, 0, 0, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
            [[1, 2, 3], [1, 1, 1], [2, 2, 2], [3, 3, 3]]]);

        counts = [0, 3, 2, 4, 1, 1, 0, 0, 0];
        expect(Evaluator.buildAllRankSetsInSuit(counts, 0)).is.deep.equal([[[1, 2, 3], [1, 2, 3], [3, 4, 5]],
            [[1, 2, 3], [2, 3, 4]],
            [[1, 2, 3], [3, 3, 3]],
            [[1, 1, 1], [2, 3, 4], [3, 3, 3]],
            [[1, 1, 1], [2, 2], [3, 4, 5], [3, 3, 3]]]);
    })
})

//formal test suite for winning hands:

describe('evaluator correctly detects winning hands', function () {
    it('overlapping peng-chow mixtures in suit', function () {
        const h1 = createHand([1,2,3,3,3,3],[1,2,3],[1,1,1],[2,2],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([],[1,2,2,2,2,3],[1,1,1],[2,2],[0, 0, 0]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('non-overlapping peng-chow mixtures in suit', function () {
        const h1 = createHand([],[0,1,2],[2,2,2,5,6,7],[1,1,1],[2, 2]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([5,5,5,6,7,8],[6,7,8],[6,6,6],[0, 0],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('non-overlapping pengs in suit', function () {
        const h1 = createHand([], [7,7], [4,5,6], [0, 0, 0, 2, 2, 2], [1, 1, 1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([8, 8], [3,3,3, 6,6,6], [4,5,6], [3, 3, 3], []);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('overlapping chow mixtures in suit', function () {
        const h1 = createHand([3,4,4,5,5,6],[4,4],[2,3,4],[],[2, 2, 2]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([3,4,5,5,6,7],[4,4],[2,3,4],[],[2, 2, 2]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;

        const h3 = createHand([3,3,4,4,5,5],[4,4],[2,3,4],[],[2, 2, 2]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.true;

        const h4 = createHand([3,4,4,5,5,5,6,6,7],[4,4],[2,3,4],[],[]);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.true;
    })

    it('non-overlapping chow-chow mixtures in suit', function () {
        const h1 = createHand([0,1,2],[4,4],[0,1,2,6,7,8],[2, 2, 2],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,1,2],[4,4],[1,2,3,4,5,6],[2, 2, 2],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('overlapping pair-chow mixtures in suit', function () {
        const h1 = createHand([3,4,5,5,5],[2,3,4],[],[0, 0, 0],[1, 1, 1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([3,4,4,4,5],[2,3,4],[],[0, 0, 0],[1, 1, 1]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;

        const h3 = createHand([3,3,3,4,5],[2,3,4],[],[0, 0, 0],[1, 1, 1]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.true;
    })

    it('non-overlapping pair-chow mixtures in suit', function () {
        const h1 = createHand([0,1,2],[8,8,8],[2,3,4,7,7],[1,1,1],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,1,2],[8,8,8],[1,1,2,3,4],[1,1,1],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('combinatorially complex groupings in one suit', function () {
        const h1 = createHand([1,1,1,1,2,3,3,4,4,4,4,5,6,6],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([1,1,1,1,2,3,3,3,3,4,4,4,4,5],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;

        const h3 = createHand([1,2,2,2,2,3,3,3,3,4,4,5,6,7],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.true;

        const h4 = createHand([1,1,2,2,3,3,3,3,4,4,4,4,5,6],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.true;

        const h5 = createHand([0,1,1,2,2,2,3,3,3,4,4,5,5,5],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h5).length > 0).is.true;

        const h6 = createHand([0,0,1,2,2,2,2,3,3,3,4,4,5,5],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h6).length > 0).is.true;
    })

    it('basic hands across suits', function () {
        const h1 = createHand([2,2,2],[1,1,1],[6,7,8],[3,3],[1,1,1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,0,0],[0,0,0],[0,0],[0,0,0],[0,0,0]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('contains pre-melded sets', function () {
        const c1 = new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]);
        const c2 = new Meld(MeldTypes.chow, [new Tile(0, 6), new Tile(0, 7), new Tile(0, 8)]);
        const p1 = new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]);
        const p2 = new Meld(MeldTypes.peng, [new Tile(2, 3), new Tile(2, 3), new Tile(2, 3)]);
        const k1 = new Meld(MeldTypes.kong, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]);
        const k2 = new Meld(MeldTypes.kong, [new Tile(4, 2), new Tile(4, 2), new Tile(4, 2), new Tile(4, 2)]);

        const h1 = createHand([0,0,0,1,2,3], [], [6,7,8], [], [1,1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;
        h1.melds.push(c1);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,0], [], [], [], [1,1,1]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;
        h2.melds.push(c2);
        h2.melds.push(p1);
        h2.melds.push(k2);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;

        const h3 = createHand([], [], [], [2, 2], []);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.false;
        h3.melds.push(p1);
        h3.melds.push(p2);
        h3.melds.push(k1);
        h3.melds.push(k2);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.true;
    })

    it('multiple win combinations', function () {
        const h1 = createHand([4,4,4,4,5,5,5,5,6,6,6,6,8,8],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,0,0,1,2,3,4,5,6,6,6],[3,4,5],[],[],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;
    })

    it('knitted straight', function () {
        const h1 = createHand([1,4,7],[2,8],[0,3,6],[0,1,2,3],[1,2]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.true;

        const h2 = createHand([0,3],[1,4,7],[2,5,8],[0,1,2],[0,1,2]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.true;

        const h3 = createHand([0,3],[0,3,6],[0,6],[0,1,2,3],[0,1,2]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.true;

        const h4 = createHand([1,4,7],[0,3,6],[1,4,7],[1,3],[0,1,2]);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.true;

        const h5 = createHand([1,7],[2,5,8],[2,5],[0,1,2,3],[0,1,2]);
        expect(Evaluator.getWinningMelds(h5).length > 0).is.true;
    })

    it('seven pairs', function () {
        const h1 = createHand([], [4,4,4,4,5,5,5,5,7,7,7,7,8,8], [],[],[]);
        expect(Evaluator.getWinningMelds(h1).length).is.equal(7);

        const h2 = createHand([1, 1, 7, 7], [2, 2], [8, 8],[2, 2],[0,0,0,0]);
        expect(Evaluator.getWinningMelds(h2).length).is.equal(7);
    })

    it('new tile completes a pair', function () {
        const h = createHand([0, 1, 2],[1,2,3],[2,2,2],[2],[1, 1, 1]);
        const winMelds = Evaluator.getWinningMelds(h, new Tile(3, 2));
        expect(winMelds.length > 0).is.true;
        expect(winMelds.deepIncludes(new Meld(MeldTypes.pair, [new Tile(3, 2), new Tile(3, 2)], false))).is.true;
    })

    it('new tile completes a chow', function () {
        const h = createHand([0, 2],[1,2,3],[2,2,2],[2,2],[1, 1, 1]);
        const winMelds = Evaluator.getWinningMelds(h, new Tile(0, 1));
        expect(winMelds.length > 0).is.true;
        expect(winMelds.deepIncludes(new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)], false))).is.true;
    })

    it('new tile completes a peng', function () {
        const h = createHand([0, 1, 2],[1,2,3],[2,2,2],[2,2],[1, 1]);
        const winMelds = Evaluator.getWinningMelds(h, new Tile(4, 1));
        expect(winMelds.length > 0).is.true;
        expect(winMelds.deepIncludes(new Meld(MeldTypes.peng, [new Tile(4, 1), new Tile(4, 1), new Tile(4, 1)], false))).is.true;
    })
})

describe('evaluator correctly detects non-winning hands', function () {
    it('basic not ready', function () {
        const h1 = createHand([2,2,3,3],[0,1,3,4,6],[],[0,1,2],[1,1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;

        const h2 = createHand([1,1],[2,2],[0],[0,1,2],[0,0,1,1,2,2]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;

        const h3 = createHand([1,1,2,2,6],[2,2],[3,3],[0,0],[0,1,2]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.false;

        const h4 = createHand([5,5,5],[1,1,8],[4,5,2],[1,1,1,2],[0,1,2]);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.false;

        const h5 = createHand([1,1,1],[2,2],[1,5,7],[0,1,2],[0,0,0]);
        expect(Evaluator.getWinningMelds(h5).length > 0).is.false;

        const h6 = createHand([1],[7],[8,8],[0,0,0,1,1,1,1,2],[0,2]);
        expect(Evaluator.getWinningMelds(h6).length > 0).is.false;

        const h7 = createHand([1,2,4,5,7,8],[1,3],[0,2],[0,2],[1,2]);
        expect(Evaluator.getWinningMelds(h7).length > 0).is.false;

        const h8 = createHand([0],[0],[],[0,1,1,2,2,2],[0,1,1,2,2,2]);
        expect(Evaluator.getWinningMelds(h8).length > 0).is.false;
    })

    it('cannot chow dragon tiles', function () {
        const h = createHand([0,0,0],[0,1,2],[5,6,7],[0,0],[0,1,2]);
        expect(Evaluator.getWinningMelds(h).length > 0).is.false;
    })

    it('cannot chow wind tiles', function () {
        const h1 = createHand([0,0],[0,1,2],[5,6,7],[1,2,3],[1,1,1]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;

        const h2 = createHand([0,0],[0,1,2],[5,6,7],[0,1,2],[1,1,1]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;
    })

    it('lacking tiles', function () {
        const c1 = new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]);
        const c2 = new Meld(MeldTypes.chow, [new Tile(0, 6), new Tile(0, 7), new Tile(0, 8)]);
        const p = new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]);
        const k = new Meld(MeldTypes.kong, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]);

        const h1 = createHand([0,0,0, 1,1,1, 2,2,2, 3,3,3, 4], [], [], [], []);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;

        const h2 = createHand([0,0,0, 1,1,1, 2,2,2, 4], [], [], [], []);
        h2.melds.push(c1);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;

        const h3 = createHand([0,0,0, 1,1,1, 4], [], [], [], []);
        h3.melds.push(c1);
        h3.melds.push(c2);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.false;

        const h4 = createHand([0,0,0, 4], [], [], [], []);
        h4.melds.push(c1);
        h4.melds.push(c2);
        h4.melds.push(p);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.false;

        const h5 = createHand([4], [], [], [], []);
        h5.melds.push(c1);
        h5.melds.push(c2);
        h5.melds.push(p);
        h5.melds.push(k);
        expect(Evaluator.getWinningMelds(h5).length > 0).is.false;
    })

    it('excess tiles', function () {
        const c1 = new Meld(MeldTypes.chow, [new Tile(2, 4), new Tile(2, 5), new Tile(2, 6)]);
        const c2 = new Meld(MeldTypes.chow, [new Tile(0, 6), new Tile(0, 7), new Tile(0, 8)]);
        const p = new Meld(MeldTypes.peng, [new Tile(3, 1), new Tile(3, 1), new Tile(3, 1)]);
        const k = new Meld(MeldTypes.kong, [new Tile(1, 0), new Tile(1, 0), new Tile(1, 0), new Tile(1, 0)]);

        const h1 = createHand([0,0,0,0, 1,1,1, 2,2,2, 3,3,3, 4,4], [], [], [], []);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;

        const h2 = createHand([0,0,0,0, 1,1,1, 2,2,2, 3,3], [], [], [], []);
        h2.melds.push(c1);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;

        const h3 = createHand([0,0,0,0, 1,1,1, 2,2], [], [], [], []);
        h3.melds.push(c1);
        h3.melds.push(c2);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.false;

        const h4 = createHand([0,0,0,0, 1,1], [], [], [], []);
        h4.melds.push(c1);
        h4.melds.push(c2);
        h4.melds.push(p);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.false;

        const h5 = createHand([0,0,0], [], [], [], []);
        h5.melds.push(c1);
        h5.melds.push(c2);
        h5.melds.push(p);
        h5.melds.push(k);
        expect(Evaluator.getWinningMelds(h5).length > 0).is.false;
    })

    it('combinatorially complex groupings in one suit', function () {
        const h1 = createHand([1,1,1,1,2,3,3,4,4,4,5,6,6,7],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h1).length > 0).is.false;

        const h2 = createHand([0,0,1,1,1,1,2,3,3,3,4,4,4,5],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h2).length > 0).is.false;

        const h3 = createHand([0,1,2,2,2,3,3,3,4,4,5,6,7,8],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h3).length > 0).is.false;

        const h4 = createHand([1,1,2,2,2,3,3,3,4,4,4,5,6,6],[],[],[],[]);
        expect(Evaluator.getWinningMelds(h4).length > 0).is.false;
    })

    it('ready, but new tile is not correct', function () {
        const h1 = createHand([0,1],[1,2,3],[2,2,2],[2,2],[1, 1, 1]);
        expect(Evaluator.getWinningMelds(h1, new Tile(0, 2)).length > 0).is.true;
        expect(Evaluator.getWinningMelds(h1, new Tile(0, 1)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h1, new Tile(3, 2)).length > 0).is.false;

        const h2 = createHand([0,1,2],[1,2,3,4,5,6,7],[], [2,2,2],[]);
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 1)).length > 0).is.true;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 4)).length > 0).is.true;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 7)).length > 0).is.true;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 0)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 2)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 3)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 5)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 6)).length > 0).is.false;
        expect(Evaluator.getWinningMelds(h2, new Tile(1, 8)).length > 0).is.false;
    })
})

describe('evaluator detects the highest-scoring winning hand', function () {
    it('prioritizes all-pairs over chows', function () {
        const h = createHand([0,0,1,1,2,2,3,3,4,4,5,5], [], [], [], [0,0]);
        expect(Evaluator.getWinningMelds(h).length).is.equal(7);
    })

    it('prioritizes all-pengs over chows', function () {
        const h = createHand([1,1,1, 2,2,2, 3,3,3], [5,5,5], [6,6], [], []);
        expect(Evaluator.getWinningMelds(h)).deep.includes(new Meld(MeldTypes.peng, [new Tile(0, 1), new Tile(0, 1), new Tile(0, 1)], true));
    })

    it('preferentially set a concealed chow over a peng', function () {
        const h = createHand([0, 0, 0, 1, 2], [1, 1, 1, 5, 6, 7], [6, 6], [], []);
        const winMelds = Evaluator.getWinningMelds(h, new Tile(0, 0));
        expect(winMelds).deep.includes(new Meld(MeldTypes.peng, [new Tile(0, 0), new Tile(0, 0), new Tile(0, 0)], true));
        expect(winMelds).not.deep.includes(new Meld(MeldTypes.chow, [new Tile(0, 0), new Tile(0, 1), new Tile(0, 2)], true));
    })
})

