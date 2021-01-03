const SMRTiles = require('../src/round.js').SMRTiles;
const Player = require('../src/player.js').Player;
const Hand = require('../src/hand.js').Hand;
const expect = require('chai').expect;
const assert = require('chai').assert;


describe('#Player() constructor',function(){

    const p1 = new Player(18,'Bob',23);
    it('assigns instance variables correctly',function(){
        expect(p1.hasOwnProperty('id')).is.true;
        expect(p1.hasOwnProperty('name')).is.true;
        expect(p1.hasOwnProperty('points')).is.true;
        expect(p1.hasOwnProperty('currentHand')).is.true;
        expect(p1.id).is.deep.equal(18);
        expect(p1.name).is.deep.equal('Bob');
        expect(p1.points).is.deep.equal(23);

    })

})

const p = new Player(8,'Ken',0);
var testElementsRange = function(start, end) {

    var actual = p.rollDice();

    assert.isAtLeast(actual, start);
    assert.isAtMost(actual, end);

}
describe('#rollDice()', function () {
    it('check the sum of the dice is in range 2-12',function(){
        testElementsRange(2,12);
    })
})

describe('#draw()',function(){
    it('check initial status',function(){
        const p = new Player(3,'Tim',8);
        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 9; j++){
                expect(p.currentHand.inPlayTiles[i][j]).is.deep.equal(0);
            }
        }
        expect(p.currentHand.numUnmeldedTiles).is.equal(0);
        expect(p.currentHand.melds).is.deep.equal([]);
    })
    it('draw a card',function(){
        const p = new Player(4,'Tim',4);
        const tile = [...SMRTiles];
        p.draw(tile[0]);
        //console.log(p.currentHand.inPlayTiles[x.suit][x.rank]);
        expect(p.currentHand.inPlayTiles[tile[0].suit][tile[0].rank]).is.deep.equal(1);
    })
})

describe('#discard()',function(){
    
    it('discard a card',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        
        p.draw(tile[0]);
        expect(p.currentHand.inPlayTiles[tile[0].suit][tile[0].rank]).is.deep.equal(1);
        p.discard(tile[0]);
        expect(p.currentHand.inPlayTiles[tile[0].suit][tile[0].rank]).is.deep.equal(0);

    })
})
describe('#checkPeng()',function(){
    it('return true if can peng',function(){
        const p = new Player(3,'Tim',8);
        p.currentHand = new Hand();
        const tile = [...SMRTiles];
        p.draw(tile.pop());
        p.draw(tile.pop());
        const x = tile.pop();
        expect(p.checkPeng(x)).to.be.true;

    })
})
describe('#checkKong()',function(){
    it('return true if can kong',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile.pop());
        p.draw(tile.pop());
        p.draw(tile.pop());
        const x = tile.pop();
        expect(p.checkKong(x)).to.be.true;

    })
})

describe('#checkChow()',function(){
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[0]);
        p.draw(tile[4]);
        expect(p.checkChow(tile[8])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[32]);
        p.draw(tile[28]);
        expect(p.checkChow(tile[24])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[0]);
        p.draw(tile[8]);
        expect(p.checkChow(tile[4])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[24]);
        p.draw(tile[32]);
        expect(p.checkChow(tile[28])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[20]);
        p.draw(tile[24]);
        expect(p.checkChow(tile[28])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[20]);
        p.draw(tile[28]);
        expect(p.checkChow(tile[24])).to.be.true;
    })
    it('return true if can chou',function(){
        const p = new Player(3,'Tim',8);
        const tile = [...SMRTiles];
        p.draw(tile[24]);
        p.draw(tile[28]);
        expect(p.checkChow(tile[20])).to.be.true;
    })

})







