const Tile = require('../src/meld.js').Tile;
const RankTypes = require('../src/meld.js').RankTypes;
const SuitTypes = require('../src/meld.js').SuitTypes;
const Round = require('../src/round.js').Round;
const SMRTiles = require('../src/round.js').SMRTiles;
const Player = require('../src/player.js').Player;
const MeldTypes = require('../src/meld.js').MeldTypes;
const Evaluator = require('../src/evaluator.js').Evaluator;
const Meld = require('../src/meld.js').Meld;
const expect = require('chai').expect;

const p1 = new Player('1', 'Player 1', 0);
const p2 = new Player('2', 'Player 2', 2);
const p3 = new Player('3', 'Player 3', 3);
const p4 = new Player('4', 'Player 4', 10);

describe('#Array.shuffle()', function () {
    it('preserves length', function () {
        const arr = [0, 1, 2, 3, 4];
        expect(arr.length).is.equal(5);
        arr.shuffle();
        expect(arr.length).is.equal(5);
    })

    it('preserves the number of occurrences of each element', function () {
        const arr = [0, 0, 1, 2, 3, 3, 3, 4, 6];
        const countMap = new Map();
        for (const i of arr) {
            if (countMap.has(i)) {
                countMap.set(i, countMap.get(i) + 1);
            } else {
                countMap.set(i, 1);
            }
        }

        arr.shuffle();
        for (const i of arr) {
            let count = 0;
            for (const j of arr) {
                if (i === j) {
                    count++;
                }
            }
            expect(count).is.equal(countMap.get(i));
        }
    })
})

describe('#Array.deepIncludes()', function () {
    it('finds primitives correctly in arrays', function () {
        const arr = [0, 1, 3, 4];
        expect(arr.deepIncludes(4)).is.true;
        expect(arr.deepIncludes(0)).is.true;
        expect(arr.deepIncludes(2)).is.false;
    });

    it('finds objects by reference correctly in arrays', function () {
        const obj = { a: 1, b: 2 };
        const arr = [{ a: 0, b: 2 }, obj];
        expect(arr.deepIncludes(obj)).is.true;
    });

    it('finds objects by value correctly in arrays', function () {
        const obj = { a: 1, b: 2};
        const arr = [{ a: 0, b: 2 }, { a: 1, b: 2 }];
        expect(arr.deepIncludes(obj)).is.true;
    });

    it('makes no consideration to number of occurrences', function () {
        const arr = [0, 1, 1, 1, 18];
        expect(arr.deepIncludes(0)).is.equal(arr.deepIncludes(1));
    })
})

describe('#Round() constructor', function () {

    const r1 = new Round([p1, p2, p3, p4], 2, SMRTiles);

    it('assigns instance variables correctly', function () {
        expect(r1.hasOwnProperty('players')).is.true;
        expect(r1.hasOwnProperty('wall')).is.true;
        expect(r1.hasOwnProperty('discard')).is.true;
        expect(r1.hasOwnProperty('dealer')).is.true;
        expect(r1.hasOwnProperty('turn')).is.true;
        expect(r1.players).is.deep.equal([p1, p2, p3, p4]);
        expect(r1.discard).is.deep.equal([]);
        expect(r1.dealer).is.equal(2);
        expect(r1.turn).is.equal(2);
    })

    it('instantiates all tiles into the wall', function () {
        const countMap = new Map();
        for (const t of SMRTiles) {
            //stringify to make comparable keys
            const tString = JSON.stringify(t);
            if (countMap.has(tString)) {
                countMap.set(tString, countMap.get(tString) + 1);
            } else {
                countMap.set(tString, 1);
            }
        }
        expect(countMap.size).is.equal(SMRTiles.length / 4);
        for (const val of countMap.values()) {
            expect(val).is.equal(4);
        }
    })
})

describe('#dealHands()', function () {
    it('deals 13 tiles to all players', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        r.dealHands();
        for (const p of [p1, p2, p3, p4]) {
            expect(p.currentHand.numUnmeldedTiles).is.equal(13);
        }
    })

    it('removes 4 x 13 tiles from the wall', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        r.dealHands();
        expect(r.wall.length).is.equal(SMRTiles.length - (4 * 13));
    })

    it('preserves total counts of all tiles', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        r.dealHands();
        for (const t of SMRTiles) {
            let count = 0;
            for (const wt of r.wall) {
                if (t.equals(wt)) {
                    count++;
                }
            }
            for (const p of [p1, p2, p3, p4]) {
                count += p.currentHand.inPlayTiles[t.suit][t.rank];
            }
            expect(count).is.equal(4);
        }
    })
})

describe('#nextTurn() and setTurn()', function () {
    const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
    it('nextTurn updates turn through all four players', function () {
        expect(r.turn).is.equal(0);
        r.nextTurn();
        expect(r.turn).is.equal(1);
        r.nextTurn();
        expect(r.turn).is.equal(2);
        r.nextTurn();
        expect(r.turn).is.equal(3);
        r.nextTurn();
        expect(r.turn).is.equal(0);
    })

    it('setTurn updates turn to specific player', function () {
        r.setTurn(2);
        expect(r.turn).is.equal(2);
        r.setTurn(0);
        expect(r.turn).is.equal(0);
        r.setTurn(1);
        expect(r.turn).is.equal(1);
        r.setTurn(2);
        expect(r.turn).is.equal(2);
    })
})

describe('#getTurnPlayer() and getOtherPlayerIndices()', function () {
    const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
    it('getTurnPlayer retrieves the correct player by turn', function () {
        expect(r.getTurnPlayer()).is.equal(p1);
        r.setTurn(3);
        expect(r.getTurnPlayer()).is.equal(p4);
    })

    it('getOtherPlayerIndices retrieves the indices of all other players', function () {
        expect(r.getOtherPlayerIndices(0)).is.deep.equal([1, 2, 3]);
        expect(r.getOtherPlayerIndices(1)).is.deep.equal([0, 2, 3]);
        expect(r.getOtherPlayerIndices(2)).is.deep.equal([0, 1, 3]);
        expect(r.getOtherPlayerIndices(3)).is.deep.equal([0, 1, 2]);
    })
})

describe('#addToDiscard(), getLastDiscard(), and removeLastDiscard()', function () {
    const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
    it('addToDiscard adds to the end of the discard list', function () {
        r.addToDiscard(new Tile(SuitTypes.dragon, RankTypes.blank));
        r.addToDiscard(new Tile(SuitTypes.dot, RankTypes.five));
        r.addToDiscard(new Tile(SuitTypes.dot, RankTypes.four));
        expect(r.discard[0].equals(new Tile(SuitTypes.dragon, RankTypes.blank))).is.true;
        expect(r.discard[1].equals(new Tile(SuitTypes.dot, RankTypes.five))).is.true;
        expect(r.discard[2].equals(new Tile(SuitTypes.dot, RankTypes.four))).is.true;
    })

    it('getLastDiscard produces the previously discarded tile', function () {
        r.addToDiscard(new Tile(SuitTypes.wind, RankTypes.north));
        r.addToDiscard(new Tile(SuitTypes.dragon, RankTypes.red));
        expect(r.getLastDiscard().equals(new Tile(SuitTypes.dragon, RankTypes.red))).is.true;
    })

    it('getLastDiscard does not update the discard list', function () {
        r.addToDiscard(new Tile(SuitTypes.dot, RankTypes.two));
        const originalLength = r.discard.length;
        r.getLastDiscard();
        expect(r.discard.length).is.equal(originalLength);
    })

    it('removeLastDiscard produces the previously discarded tile', function () {
        r.addToDiscard(new Tile(SuitTypes.character, RankTypes.nine));
        expect(r.removeLastDiscard().equals(new Tile(SuitTypes.character, RankTypes.nine))).is.true;
    })

    it('removeLastDiscard updates the discard list', function () {
        r.discard = [];
        r.addToDiscard(new Tile(SuitTypes.wind, RankTypes.east));
        r.addToDiscard(new Tile(SuitTypes.wind, RankTypes.west));
        r.addToDiscard(new Tile(SuitTypes.wind, RankTypes.south));
        r.removeLastDiscard();
        expect(r.discard.length).is.equal(2);
        expect(r.discard[0].equals(new Tile(SuitTypes.wind, RankTypes.east))).is.true;
        expect(r.discard[1].equals(new Tile(SuitTypes.wind, RankTypes.west))).is.true;
    })
})

describe('turnPlayerDraws()', function () {
    it('updates the hand of the current player', function () {
        const r = new Round([p1, p2, p3, p4], 3, SMRTiles);
        const nextDrawTile = r.wall[r.wall.length - 1];
        const turnPlayerTileCount = r.getTurnPlayer().currentHand.inPlayTiles[nextDrawTile.suit][nextDrawTile.rank];
        const turnPlayerHandSize = r.getTurnPlayer().currentHand.numUnmeldedTiles;
        r.turnPlayerDraws();
        expect(r.getTurnPlayer().currentHand.numUnmeldedTiles).is.equal(turnPlayerHandSize + 1);
        expect(r.getTurnPlayer().currentHand.inPlayTiles[nextDrawTile.suit][nextDrawTile.rank]).is.equal(turnPlayerTileCount + 1);
    })

    it('updates the wall from the end', function () {
        const r = new Round([p1, p2, p3, p4], 3, SMRTiles);
        const originalWall = [...r.wall];
        r.turnPlayerDraws();
        expect(r.wall.length).is.equal(originalWall.length - 1);
        for (let i = 0; i < r.wall.length; i++) {
            expect(r.wall[i].equals(originalWall[i])).is.true;
        }
    })
})

describe('turnPlayerDiscards()', function () {
    it('updates the hand of the current player', function () {
        const r = new Round([p1, p2, p3, p4], 1, SMRTiles);
        r.dealHands();
        const turnPlayer = r.getTurnPlayer();
        let anyTile = undefined;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 9; j++) {
                if (turnPlayer.currentHand.inPlayTiles[i][j] > 0) {
                    anyTile = new Tile(i, j);
                }
            }
        }
        const turnPlayerTileCount = r.getTurnPlayer().currentHand.inPlayTiles[anyTile.suit][anyTile.rank];
        r.turnPlayerDiscards(anyTile);
        expect(turnPlayer.currentHand.inPlayTiles[anyTile.suit][anyTile.rank]).is.equal(turnPlayerTileCount - 1);
        expect(turnPlayer.currentHand.numUnmeldedTiles).is.equal(12);
    })

    it('updates the discard list', function () {
        const r = new Round([p1, p2, p3, p4], 1, SMRTiles);
        r.dealHands();
        const turnPlayer = r.getTurnPlayer();
        let anyTile = undefined;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 9; j++) {
                if (turnPlayer.currentHand.inPlayTiles[i][j] > 0) {
                    anyTile = new Tile(i, j);
                }
            }
        }
        r.turnPlayerDiscards(anyTile);
        expect(r.discard.length).is.equal(1);
        expect(r.discard[0].equals(anyTile)).is.true;
    })

    it('updates the turn counter', function () {
        const r = new Round([p1, p2, p3, p4], 1, SMRTiles);
        r.dealHands();
        const turnPlayer = r.getTurnPlayer();
        let anyTile = undefined;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 9; j++) {
                if (turnPlayer.currentHand.inPlayTiles[i][j] > 0) {
                    anyTile = new Tile(i, j);
                }
            }
        }
        r.turnPlayerDiscards(anyTile);
        expect(r.turn).is.equal(2);
    });
})

describe('boolean checks for player claims', function () {
    it('canPlayerChow appropriately accounts for the turn counter', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.inPlayTiles = [[0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        p2.currentHand.inPlayTiles = [[0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p3.currentHand.inPlayTiles = [[0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p4.currentHand.inPlayTiles = [[0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.one));
        r.turn = 0;
        expect(r.canPlayerChow(0)).is.true;
        expect(r.canPlayerChow(1)).is.false;
        expect(r.canPlayerChow(2)).is.false;
        expect(r.canPlayerChow(3)).is.false;
        r.turn = 2;
        expect(r.canPlayerChow(0)).is.false;
        expect(r.canPlayerChow(1)).is.false;
        expect(r.canPlayerChow(2)).is.true;
        expect(r.canPlayerChow(3)).is.false;
    });

    it('canPlayerPeng appropriately accounts for the turn counter', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.inPlayTiles = [[0, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        p2.currentHand.inPlayTiles = [[0, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p3.currentHand.inPlayTiles = [[0, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p4.currentHand.inPlayTiles = [[0, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.turn = 0;
        expect(r.canPlayerPeng(0)).is.true;
        expect(r.canPlayerPeng(1)).is.true;
        expect(r.canPlayerPeng(2)).is.true;
        expect(r.canPlayerPeng(3)).is.false;
        r.turn = 2;
        expect(r.canPlayerPeng(0)).is.true;
        expect(r.canPlayerPeng(1)).is.false;
        expect(r.canPlayerPeng(2)).is.true;
        expect(r.canPlayerPeng(3)).is.true;
    });

    it('canPlayerDiscardedKong appropriately accounts for the turn counter', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.inPlayTiles = [[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]
        p2.currentHand.inPlayTiles = [[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p3.currentHand.inPlayTiles = [[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        p4.currentHand.inPlayTiles = [[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.turn = 0;
        expect(r.canPlayerDiscardedKong(0)).is.true;
        expect(r.canPlayerDiscardedKong(1)).is.true;
        expect(r.canPlayerDiscardedKong(2)).is.true;
        expect(r.canPlayerDiscardedKong(3)).is.false;
        r.turn = 2;
        expect(r.canPlayerDiscardedKong(0)).is.true;
        expect(r.canPlayerDiscardedKong(1)).is.false;
        expect(r.canPlayerDiscardedKong(2)).is.true;
        expect(r.canPlayerDiscardedKong(3)).is.true;
    });
})

describe('#turnPlayerChows()', function () {
    it('updates nothing if the player cannot chow', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.three));
        p2.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.three));
        p2.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.four));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.one));
        //p2 cannot chow this tile
        r.turn = 1;
        expect(r.turnPlayerChows([new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.four)])).is.false;
        expect(p2.currentHand.inPlayTiles).is.deep.equal([[0, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p2.currentHand.melds).is.deep.equal([]);
        expect(p2.currentHand.numUnmeldedTiles).is.equal(2);
        expect(r.getLastDiscard()).is.deep.equal(new Tile(SuitTypes.bamboo, RankTypes.one));
    })

    it('updates the player hand and the discard list', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.three));
        p2.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.three));
        p2.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.four));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.one));
        //p1 can chow this tile
        r.turn = 0;
        expect(r.turnPlayerChows([new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.three)])).is.true;
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.chow, [new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.three)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(0);
        expect(r.discard.deepIncludes(new Tile(SuitTypes.bamboo, RankTypes.one))).is.false;
    })
})

describe('#playerPengs()', function () {
    it('updates nothing if the player cannot peng', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 cannot peng this tile, as they just discarded it
        r.turn = 1;
        expect(r.playerPengs(0, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.false;
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 2, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(2);
        expect(r.getLastDiscard()).is.deep.equal(new Tile(SuitTypes.bamboo, RankTypes.two));
        expect(r.turn).is.equal(1);
    })

    it('updates the player hand, the discard list, and the turn state', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 can peng this tile, despite it not being their turn
        r.turn = 3;
        expect(r.playerPengs(0, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.true;
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.peng, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(0);
        expect(r.discard.deepIncludes(new Tile(SuitTypes.bamboo, RankTypes.two))).is.false;
        expect(r.turn).is.equal(0);
    })
})

describe('#playerDiscardedKongs()', function () {
    it('updates nothing if the player cannot kong', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 cannot peng this tile, as they just discarded it
        r.turn = 1;
        expect(r.playerDiscardedKongs(0, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.false;
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(3);
        expect(r.getLastDiscard()).is.deep.equal(new Tile(SuitTypes.bamboo, RankTypes.two));
        expect(r.turn).is.equal(1);
    })

    it('updates the player hand, the discard list, and the turn state', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        const wallLen = r.wall.length;
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        r.discard.push(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 can peng this tile, despite it not being their turn
        r.turn = 2;
        expect(r.playerDiscardedKongs(0, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.true;
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.kong, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(1);
        expect(r.wall.length).is.equal(wallLen - 1);
        expect(r.discard.deepIncludes(new Tile(SuitTypes.bamboo, RankTypes.two))).is.false;
        expect(r.turn).is.equal(0);
    })
})

describe('#turnPlayerSelfKongs()', function () {
    it('updates nothing if the player cannot kong', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 only has 3 copies of the tile, so cannot kong
        r.turn = 0;
        expect(r.turnPlayerSelfKongs([new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.false;
        expect(r.turnPlayerSelfKongs([new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.false;
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 3, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(3);
        expect(r.turn).is.equal(0);
    })

    it('updates the player hand when adding to a meld', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        const wallLen = r.wall.length;
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.meld(MeldTypes.peng, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)]);
        expect(p1.currentHand.inPlayTiles).is.deep.equal([[0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.peng, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(1);
        //p1 has an existing peng meld
        r.turn = 0;
        expect(r.turnPlayerSelfKongs([new Tile(SuitTypes.bamboo, RankTypes.two)])).is.true;
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.kong, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(1);
        expect(r.wall.length).is.equal(wallLen - 1);
        expect(r.turn).is.equal(0);
    })

    it('updates the player hand when revealing a concealed kong', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        const wallLen = r.wall.length;
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        p1.currentHand.addTile(new Tile(SuitTypes.bamboo, RankTypes.two));
        //p1 has 4 copies of the tile, so can kong
        r.turn = 0;
        expect(r.turnPlayerSelfKongs([new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])).is.true;
        expect(p1.currentHand.melds).is.deep.equal([new Meld(MeldTypes.kong, [new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two)])]);
        expect(p1.currentHand.numUnmeldedTiles).is.equal(1);
        expect(r.wall.length).is.equal(wallLen - 1);
        expect(r.turn).is.equal(0);
    })
})

describe('coordination of game state', function () {
    it('correctly simulates one turn around the board with only draws and discards', function () {
        const r = new Round([p1, p2, p3, p4], 0, SMRTiles);
        r.dealHands();
        let firstTiles = [];
        let turnStates = [];
        for (let i = 0; i < 4; i++) {
            //log whose turn it is
            turnStates.push(r.turn);

            //have the turn player draw, check hand state and wall state
            const t = r.turnPlayerDraws();
            expect(r.getTurnPlayer().currentHand.numUnmeldedTiles).is.equal(14);
            expect(r.wall.length).is.equal(SMRTiles.length - (4 * 13) - (i + 1))

            //log the tile drawn
            firstTiles.push(t);

            //have the turn player discard, check hand state and discard state
            r.turnPlayerDiscards(t);
            expect(r.getTurnPlayer().currentHand.numUnmeldedTiles).is.equal(13);
            expect(r.discard.length).is.equal(i+1);
        }
        //check that every player went and that the discard list remains ordered correctly;
        for (let i = 0; i < 4; i++) {
            expect(turnStates.includes(i)).is.true;
            expect(r.discard[i].equals(firstTiles[i])).is.true;
        }
    })
})