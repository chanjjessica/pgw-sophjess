const Game = require('../src/game.js').Game;
const Tile = require('../src/meld.js').Tile;
const RankTypes = require('../src/meld.js').RankTypes;
const SuitTypes = require('../src/meld.js').SuitTypes;
const Round = require('../src/round.js').Round;
const SMRTiles = require('../src/round.js').SMRTiles;
const Player = require('../src/player.js').Player;
const Hand = require('../src/hand.js').Hand;
const expect = require('chai').expect;
const assert = require('chai').assert;



describe('#Game() constructor', function () {

    const g = new Game("5adk2g");

    it('assigns instance variables correctly', function () {
        expect(g.hasOwnProperty('roundNumber')).is.true;
        expect(g.hasOwnProperty('dealer')).is.true;
        expect(g.hasOwnProperty('gameId')).is.true;
        expect(g.hasOwnProperty('players')).is.true;
        expect(g.hasOwnProperty('currentRound')).is.true;
        expect(g.gameId).is.deep.equal("5adk2g");
        expect(g.roundNumber).is.deep.equal(1);
        expect(g.dealer).is.deep.equal(0);
        expect(g.players).is.deep.equal([]);
    })
})

const p1 = new Player('1', 'Player 1', 0);
const p2 = new Player('2', 'Player 2', 2);
const p3 = new Player('3', 'Player 3', 3);
const p4 = new Player('4', 'Player 4', 10);
const p5 = new Player('5', 'Player 5', 8);

describe('#seatPlayer()',function(){
	it('check if a game has empty seat', function () {
		const g = new Game("huw3e");
		g.seatPlayer(p1);
        expect(g.players.length).is.deep.equal(1);
        g.seatPlayer(p2);
        expect(g.players.length).is.deep.equal(2);
        g.seatPlayer(p3);
        expect(g.players.length).is.deep.equal(3);
        g.seatPlayer(p4);
        expect(g.players.length).is.deep.equal(4);
        assert.throws(function(){g.seatPlayer(p5)}, Error);
    })
})

describe('#unseatPlayer()',function(){
	it('check if a player can leave a game', function () {
		const g = new Game("wUHF4k");
        expect(g.seatPlayer(p1)).to.be.true;
        expect(g.seatPlayer(p2)).to.be.true;
        expect(g.seatPlayer(p3)).to.be.true;
        expect(g.seatPlayer(p4)).to.be.true;
        assert.throws(function(){g.seatPlayer(p5)}, Error);
 		expect(g.players.length).is.deep.equal(4);
        expect(g.unseatPlayer(3)).to.be.true;
        expect(g.players.length).is.deep.equal(3);
        expect(g.unseatPlayer(1)).to.be.true;
        expect(g.players.length).is.deep.equal(2);
        expect(g.unseatPlayer(1)).to.be.true;
        expect(g.players.length).is.deep.equal(1);
        expect(g.seatPlayer(p5)).to.be.true;
        expect(g.players.length).is.deep.equal(2);
        expect(g.unseatPlayer(0)).to.be.true;
        expect(g.players.length).is.deep.equal(1);
        assert.throws(function(){g.unseatPlayer(1)}, Error);
    })
})

describe('#chooseDealer()',function(){
	it('choose dealer', function () {
		const g = new Game("hdS3ka");
        expect(g.seatPlayer(p1)).to.be.true;
        expect(g.seatPlayer(p2)).to.be.true;
        expect(g.seatPlayer(p3)).to.be.true;
        expect(g.seatPlayer(p4)).to.be.true;
        g.chooseDealer();
        expect(g.dealer).to.not.equal(-1);
        assert.isAtLeast(g.dealer, 0);
    	assert.isAtMost(g.dealer, 3);
    })
})

describe('#startRound()',function(){
	it('choose dealer', function () {
		const g = new Game("3josaf9");
        expect(g.seatPlayer(p1)).to.be.true;
        expect(g.seatPlayer(p2)).to.be.true;
        expect(g.seatPlayer(p3)).to.be.true;
        expect(g.seatPlayer(p4)).to.be.true;
        g.chooseDealer();
        g.startRound();
        expect(g.currentRound.players.length).is.deep.equal(4);
        assert.isAtLeast(g.currentRound.dealer, 0);
    	assert.isAtMost(g.currentRound.dealer, 3);
    	expect(g.currentRound.wall.length).is.deep.equal(136);
    })
})
