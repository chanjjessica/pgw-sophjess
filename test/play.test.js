const expect = require('chai').expect;

const Round = require('../src/round.js').Round;
const Evaluator = require('../src/evaluator.js').Evaluator;
const Tile = require('../src/meld.js').Tile;
const Meld = require('../src/meld.js').Meld;
const Hand = require('../src/hand.js').Hand;
const MeldTypes = require('../src/meld.js').MeldTypes;
const SuitTypes = require('../src/meld.js').SuitTypes;
const RankTypes = require('../src/meld.js').RankTypes;
const Game = require('../src/game.js').Game;
const Player = require('../src/player.js').Player;

/**
 * Wall set-up for deal and first three rounds:
 * P1 should have: ([b] 1 1 1 2 2 2 3 3 3) (dr dr dr) (wn) => can kong/peng/chow B1-3 + DR; can win off WN
 * P2 should have: ([b] 4 5 6) ([c] 5 6 7) ([d] 5 6 7) (ww ww) (we we) => can win off WW + WE
 * P3 should have: ([d] 1 1 1 1) ([c] 1) (dw dw) (wn wn) (ws ws) ([b] 8 8) => can self-kong
 * P4 should have: ([c] 2 3) ([d] 5 6 7 7 7 8 8 9 9) ([b] 8 9) => can chow c1/c4; 2 tiles from hu
 *
 * Order of events:
 *      P1 draws DW, throws DW (no change)
 *      P2 skipped
 *      P3 pengs DW, discards C1 (can no longer peng DW)
 *      P4 chows C1, discards B9 (can no longer chow C1 nor C4)
 *
 *      P1 draws WN, can win, chooses not to, throws B3 (B3 is now winning, WN is still winning)
 *      P2 chows B3, discards D5 (can no longer chow B3-7, no longer ready off WW nor WE)
 *      P3 draws D8, kongs D1s, draws B8, discards D8 (can now kong B8)
 *      P4 pengs D8, discards B8 (can no longer chow D9, D4 and D7 are now winning)
 *
 *      P1 skipped
 *      P2 skipped
 *      P3 kongs B8, draws DR, discards WN (can no longer peng WN)
 *      P4 skipped
 *
 *      P1 wins off North
 *      P1's hand is scored
 *
 *
 * Need to check:
 * - chow
 * - peng
 * - self-kong
 * - kong
 * - self hu
 * - hu off turn
 * - altering ready states:
 *      - ready -> not ready
 *      - chow/peng/kong changes canChow/Peng/Kong
 */

const mockWall = [new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.one),
    new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two),
    new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.three),
    new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red),
    new Tile(SuitTypes.wind, RankTypes.north),
    // end of P1's hand
    new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.six),
    new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.six),
    new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.seven),
    new Tile(SuitTypes.wind, RankTypes.west), new Tile(SuitTypes.wind, RankTypes.west),
    new Tile(SuitTypes.wind, RankTypes.east), new Tile(SuitTypes.wind, RankTypes.east),
    // end of P2's hand
    new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one),
    new Tile(SuitTypes.character, RankTypes.one),
    new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight),
    new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank),
    new Tile(SuitTypes.wind, RankTypes.north), new Tile(SuitTypes.wind, RankTypes.north),
    new Tile(SuitTypes.wind, RankTypes.south), new Tile(SuitTypes.wind, RankTypes.south),
    // end of P3's hand
    new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.nine),
    new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.three),
    new Tile(SuitTypes.dot, RankTypes.five),  new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.seven),
    new Tile(SuitTypes.dot, RankTypes.seven), new Tile(SuitTypes.dot, RankTypes.seven),
    new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight),
    new Tile(SuitTypes.dot, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.nine),
    // end of P4's hand
    new Tile(SuitTypes.dragon, RankTypes.blank),
    new Tile(SuitTypes.wind, RankTypes.north),
    new Tile(SuitTypes.dot, RankTypes.eight),
    new Tile(SuitTypes.bamboo, RankTypes.eight),
    new Tile(SuitTypes.dragon, RankTypes.red),
    //end of drawn wall prior to game end

    new Tile(SuitTypes.bamboo, RankTypes.one),
    new Tile(SuitTypes.bamboo, RankTypes.two),
    new Tile(SuitTypes.bamboo, RankTypes.three),
    new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.four),
    new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.five),
    new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.six),
    new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven),
    //b8
    new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.nine),
    new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.one),
    new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.two),
    new Tile(SuitTypes.character, RankTypes.three), new Tile(SuitTypes.character, RankTypes.three), new Tile(SuitTypes.character, RankTypes.three),
    new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.four),
    new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.five),
    new Tile(SuitTypes.character, RankTypes.six), new Tile(SuitTypes.character, RankTypes.six), new Tile(SuitTypes.character, RankTypes.six),
    new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven),
    new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight),
    new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine),
    //d1
    new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two),
    new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three),
    new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four),
    new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.five),
    new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.six),
    new Tile(SuitTypes.dot, RankTypes.eight),
    new Tile(SuitTypes.dot, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.nine),
    new Tile(SuitTypes.wind, RankTypes.east), new Tile(SuitTypes.wind, RankTypes.east),
    new Tile(SuitTypes.wind, RankTypes.south), new Tile(SuitTypes.wind, RankTypes.south),
    new Tile(SuitTypes.wind, RankTypes.west), new Tile(SuitTypes.wind, RankTypes.west),
    //wn
    //dr
    new Tile(SuitTypes.dragon, RankTypes.blank),
    new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green),];

describe('mock game', function () {
    it('correctly simulates a full game of mahjong, see test file for specific events', function () {
        const g = new Game('test_id_1');
        const p1 = new Player('1', 'Player 1', 0);
        const p2 = new Player('2', 'Player 2', 0);
        const p3 = new Player('3', 'Player 3', 0);
        const p4 = new Player('4', 'Player 4', 0);
        g.seatPlayer(p1);
        g.seatPlayer(p2);
        g.seatPlayer(p3);
        g.seatPlayer(p4);
        g.startRound();
        const rnd = g.currentRound;
        mockWall.reverse();
        rnd.wall = mockWall;
        rnd.dealHands();
        //check p1's hand
        expect(p1.currentHand.inPlayTiles).is.deep.equal(
            [[3, 3, 3, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0],
                [3, 0, 0, 0, 0, 0, 0, 0, 0]]
        );
        //ready to win with North, can take B1-4, Red dragon
        expect(p1.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.north))).is.true;
        expect(p1.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.one))).is.true;
        expect(p1.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.two))).is.true;
        expect(p1.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.three))).is.true;
        expect(p1.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.four))).is.true;
        expect(p1.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.five))).is.false;
        expect(p1.currentHand.checkPeng(new Tile(SuitTypes.bamboo, RankTypes.one))).is.true;
        expect(p1.currentHand.checkPeng(new Tile(SuitTypes.bamboo, RankTypes.two))).is.true;
        expect(p1.currentHand.checkPeng(new Tile(SuitTypes.bamboo, RankTypes.three))).is.true;
        expect(p1.currentHand.checkPeng(new Tile(SuitTypes.bamboo, RankTypes.four))).is.false;
        expect(p1.currentHand.checkPeng(new Tile(SuitTypes.dragon, RankTypes.red))).is.true;
        expect(p1.currentHand.checkKong(new Tile(SuitTypes.bamboo, RankTypes.one))).is.true;
        expect(p1.currentHand.checkKong(new Tile(SuitTypes.bamboo, RankTypes.two))).is.true;
        expect(p1.currentHand.checkKong(new Tile(SuitTypes.bamboo, RankTypes.three))).is.true;
        expect(p1.currentHand.checkKong(new Tile(SuitTypes.bamboo, RankTypes.four))).is.false;
        expect(p1.currentHand.checkKong(new Tile(SuitTypes.dragon, RankTypes.red))).is.true;

        //check p2's hand
        expect(p2.currentHand.inPlayTiles).is.deep.equal(
            [[0, 0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 1, 1, 0, 0, 0],
                [2, 0, 2, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        );
        //ready to win with East, West, can take any connected tile to the chows in hand
        expect(p2.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.west))).is.true;
        expect(p2.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.east))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.three))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.four))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.five))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.six))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.seven))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.three))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.four))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.five))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.six))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.seven))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.four))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.five))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.six))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.seven))).is.true;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.eight))).is.true;

        //check p3's hand
        expect(p3.currentHand.inPlayTiles).is.deep.equal(
            [[0, 0, 0, 0, 0, 0, 0, 2, 0],
                [4, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 2, 0, 0, 0, 0, 0],
                [0, 0, 2, 0, 0, 0, 0, 0, 0]]
        );
        //can take B8, South, North, White dragon
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.bamboo, RankTypes.eight))).is.true;
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.wind, RankTypes.north))).is.true;
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.wind, RankTypes.south))).is.true;
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.dragon, RankTypes.blank))).is.true;

        //check p4's hand
        expect(p4.currentHand.inPlayTiles).is.deep.equal(
            [[0, 0, 0, 0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 1, 1, 3, 2, 2],
                [0, 1, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        );
        //can take B7, C1, C4, D4-9
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.seven))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.one))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.four))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.four))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.five))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.six))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.seven))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.eight))).is.true;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.nine))).is.true;
        expect(p4.currentHand.checkPeng(new Tile(SuitTypes.dot, RankTypes.seven))).is.true;
        expect(p4.currentHand.checkPeng(new Tile(SuitTypes.dot, RankTypes.eight))).is.true;
        expect(p4.currentHand.checkPeng(new Tile(SuitTypes.dot, RankTypes.nine))).is.true;
        expect(p4.currentHand.checkKong(new Tile(SuitTypes.dot, RankTypes.seven))).is.true;

        /**
         * P1 draws DW, throws DW (no change)
         *      P2 skipped
         *      P3 pengs DW, discards C1 (can no longer peng DW)
         *      P4 chows C1, discards B9 (can no longer chow C1 nor C4, B8 is now winning)
         *
         *      P1 draws WN, can win, chooses not to, throws B3 (B3 is now winning, WN is still winning)
         *      P2 chows B3, discards D5 (can no longer chow B3-7, no longer ready off WW nor WE)
         *      P3 draws D8, kongs D1s, draws B8, discards D8 (can now kong B8, can now win off WN or WS)
         *      P4 pengs D8, discards B8 (can no longer chow D9, D4 and D7 are now winning, B8 is no longer winning)
         *
         *      P1 skipped
         *      P2 skipped
         *      P3 kongs B8, draws DR, discards WN (can no longer peng WN, WS and WN are no longer winning)
         *      P4 skipped
         *
         *      P1 wins off North
         *      P1's hand is scored
         */

        //P1 draws DW, discards DW
        rnd.turnPlayerDraws();

        expect(p1.currentHand.inPlayTiles[SuitTypes.dragon][RankTypes.blank]).is.equal(1);

        rnd.turnPlayerDiscards(new Tile(SuitTypes.dragon, RankTypes.blank));

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.dragon, RankTypes.blank)]);
        expect(rnd.turn).is.equal(1);

        //P3 pengs DW, discards C1
        let disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p3.currentHand.addTile(disc);
        let meldArr = [new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank)];
        p3.currentHand.meld(MeldTypes.peng, meldArr);
        rnd.setTurn(2);
        rnd.turnPlayerDiscards(new Tile(SuitTypes.character, RankTypes.one));

        //check new hand state
        expect(p3.currentHand.numUnmeldedTiles).is.equal(10);
        expect(p3.currentHand.inPlayTiles[SuitTypes.dragon][RankTypes.blank]).is.equal(0);
        expect(p3.currentHand.melds).is.deep.equal([new Meld(MeldTypes.peng, meldArr)]);
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.dragon, RankTypes.blank))).is.false;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.character, RankTypes.one)]);
        expect(rnd.turn).is.equal(3);

        //P4 chows C1, discards B9
        disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p4.currentHand.addTile(disc);
        meldArr = [new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.three)];
        p4.currentHand.meld(MeldTypes.chow, meldArr);
        rnd.turnPlayerDiscards(new Tile(SuitTypes.bamboo, RankTypes.nine));

        //check new hand state
        expect(p4.currentHand.numUnmeldedTiles).is.equal(10);
        expect(p4.currentHand.inPlayTiles[SuitTypes.character][RankTypes.one]).is.equal(0);
        expect(p4.currentHand.inPlayTiles[SuitTypes.character][RankTypes.two]).is.equal(0);
        expect(p4.currentHand.inPlayTiles[SuitTypes.character][RankTypes.three]).is.equal(0);
        expect(p4.currentHand.melds).is.deep.equal([new Meld(MeldTypes.chow, meldArr)]);
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.one))).is.false;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.character, RankTypes.four))).is.false;
        //TODO: fix checkWin --> not returning true on a winning tile
        //expect(p4.currentHand.checkWin(new Tile(SuitTypes.bamboo, RankTypes.eight))).is.true;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine)]);
        expect(rnd.turn).is.equal(0);

        //P1 draws WN, declines win, discards B3
        rnd.turnPlayerDraws();

        expect(p1.currentHand.inPlayTiles[SuitTypes.wind][RankTypes.north]).is.equal(2);
        expect(p1.currentHand.checkWin()).is.true;

        rnd.turnPlayerDiscards(new Tile(SuitTypes.bamboo, RankTypes.three));

        //check new hand state
        expect(p1.currentHand.checkWin(new Tile(SuitTypes.bamboo, RankTypes.three))).is.true;
        expect(p1.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.north))).is.true;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.three)]);
        expect(rnd.turn).is.equal(1);

        //P2 chows B3, discards D5
        disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p2.currentHand.addTile(disc);
        meldArr = [new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.five)];
        p2.currentHand.meld(MeldTypes.chow, meldArr);
        rnd.turnPlayerDiscards(new Tile(SuitTypes.dot, RankTypes.five));

        //check new hand state
        expect(p2.currentHand.numUnmeldedTiles).is.equal(10);
        expect(p2.currentHand.inPlayTiles[SuitTypes.bamboo][RankTypes.three]).is.equal(0);
        expect(p2.currentHand.inPlayTiles[SuitTypes.bamboo][RankTypes.four]).is.equal(0);
        expect(p2.currentHand.inPlayTiles[SuitTypes.bamboo][RankTypes.five]).is.equal(0);
        expect(p2.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.west))).is.false;
        expect(p2.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.east))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.three))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.four))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.five))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.six))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.bamboo, RankTypes.seven))).is.false;
        expect(p2.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.four))).is.false;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.five)]);
        expect(rnd.turn).is.equal(2);

        //P3 draws D8, kongs D1s, draws B8, discards D8
        rnd.turnPlayerDraws();

        expect(p3.currentHand.inPlayTiles[SuitTypes.dot][RankTypes.eight]).is.equal(1);

        meldArr = [new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one)];
        p3.currentHand.meld(MeldTypes.kong, meldArr);
        rnd.turnPlayerDraws();

        expect(p3.currentHand.inPlayTiles[SuitTypes.bamboo][RankTypes.eight]).is.equal(3);

        rnd.turnPlayerDiscards(new Tile(SuitTypes.dot, RankTypes.eight));

        //check new hand state
        expect(p3.currentHand.numUnmeldedTiles).is.equal(7);
        expect(p3.currentHand.inPlayTiles[SuitTypes.dot][RankTypes.one]).is.equal(0);
        expect(p3.currentHand.melds.length).is.equal(2);
        expect(p3.currentHand.melds[1]).is.deep.equal(new Meld(MeldTypes.kong, meldArr));
        expect(p3.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.north))).is.true;
        expect(p3.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.south))).is.true;
        expect(p3.currentHand.checkKong(new Tile(SuitTypes.bamboo, RankTypes.eight))).is.true;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.eight)]);
        expect(rnd.turn).is.equal(3);

        //P4 pengs D8, discards B8
        disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p4.currentHand.addTile(disc);
        meldArr = [new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight)];
        p4.currentHand.meld(MeldTypes.peng, meldArr);
        rnd.setTurn(3);
        rnd.turnPlayerDiscards(new Tile(SuitTypes.bamboo, RankTypes.eight));

        //check new hand state
        expect(p4.currentHand.numUnmeldedTiles).is.equal(7);
        expect(p4.currentHand.inPlayTiles[SuitTypes.dot][RankTypes.eight]).is.equal(0);
        expect(p4.currentHand.melds.length).is.equal(2);
        expect(p4.currentHand.melds[1]).is.deep.equal(new Meld(MeldTypes.peng, meldArr));
        expect(p4.currentHand.checkWin(new Tile(SuitTypes.dot, RankTypes.four))).is.true;
        expect(p4.currentHand.checkWin(new Tile(SuitTypes.dot, RankTypes.seven))).is.true;
        expect(p4.currentHand.checkWin(new Tile(SuitTypes.dot, RankTypes.four))).is.true;
        expect(p4.currentHand.checkWin(new Tile(SuitTypes.bamboo, RankTypes.eight))).is.false;
        expect(p4.currentHand.checkChow(new Tile(SuitTypes.dot, RankTypes.nine))).is.false;
        expect(p4.currentHand.checkPeng(new Tile(SuitTypes.dot, RankTypes.nine))).is.true;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.eight)]);
        expect(rnd.turn).is.equal(0);

        //P3 kongs B8, draws DR, discards WN
        disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p3.currentHand.addTile(disc);
        meldArr = [new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight)];
        p3.currentHand.meld(MeldTypes.kong, meldArr);
        rnd.setTurn(2);
        rnd.turnPlayerDraws();

        expect(p3.currentHand.inPlayTiles[SuitTypes.dragon][RankTypes.red]).is.equal(1);

        rnd.turnPlayerDiscards(new Tile(SuitTypes.wind, RankTypes.north));

        //check new hand state
        expect(p3.currentHand.numUnmeldedTiles).is.equal(4);
        expect(p3.currentHand.inPlayTiles[SuitTypes.bamboo][RankTypes.eight]).is.equal(0);
        expect(p3.currentHand.melds.length).is.equal(3);
        expect(p3.currentHand.melds[2]).is.deep.equal(new Meld(MeldTypes.kong, meldArr));
        expect(p3.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.north))).is.false;
        expect(p3.currentHand.checkWin(new Tile(SuitTypes.wind, RankTypes.south))).is.false;
        expect(p3.currentHand.checkPeng(new Tile(SuitTypes.wind, RankTypes.north))).is.false;

        //check round state
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.wind, RankTypes.north)]);
        expect(rnd.turn).is.equal(3);

        //P1 wins off North
        disc = rnd.getLastDiscard();
        rnd.removeLastDiscard();
        p1.currentHand.addTile(disc);
        rnd.setTurn(0);
        const winningMelds = Evaluator.getWinningMelds(p1.currentHand);

        //check end of game state
        expect(winningMelds.length > 0).is.true;
        expect(rnd.discard).is.deep.equal([new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.five)]);
        expect(rnd.turn).is.equal(0);

        //TODO: P1's hand is scored
    })
})