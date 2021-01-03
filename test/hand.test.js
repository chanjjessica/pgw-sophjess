const Meld = require('../src/meld.js').Meld;
const MeldTypes = require('../src/meld.js').MeldTypes;
const expect = require('chai').expect;
const Hand = require('../src/hand.js').Hand;
const Tile = require('../src/meld.js').Tile;

var h = new Hand();
var t = new Tile(2, 7);
var a = new Tile(1, 4);
var b = new Tile(1, 5);
var c = new Tile(1, 6);
var d = new Tile(1, 7);

describe('#hand_constructor', function(){
    it('creates a 5x9 matrix', function(){
        expect(h.inPlayTiles.length).to.equal(5);
        expect(h.inPlayTiles[0].length).to.equal(9);
    })
})


describe('#addTile', function(){
    it ('increments inPlayTiles[suit][rank] if valid tile', function(){
        h.addTile(t);
        expect(h.inPlayTiles[2][7]).to.equal(1);
        h.addTile(t)
        expect(h.inPlayTiles[2][7]).to.equal(2);
        expect(h.numUnmeldedTiles).to.equal(2);
    })
})


describe('#removeTile', function(){
    it ('decrements inPlayTiles[suit][rank] if valid tile and at least 1 in hand', function(){
        let r = h.removeTile(t);
        expect(r).to.eql(t); //deep equal
        expect(h.inPlayTiles[2][7]).to.equal(1);
        expect(h.numUnmeldedTiles).to.equal(1);
        h.removeTile(t);
        expect(h.inPlayTiles[2][7]).to.equal(0);
        expect(h.numUnmeldedTiles).to.equal(0);
        h.removeTile(t);
        expect(h.inPlayTiles[2][7]).to.equal(0);
        expect(h.numUnmeldedTiles).to.equal(0);
    })
})



describe('#meld', function(){
    
    it('adds meld to melds and returns true if valid pair', function(){
        expect(h.meld(MeldTypes.pair, [a, a], true)).to.equal(true);  
        expect(h.melds).to.deep.include(new Meld(MeldTypes.pair, [a, a], true));
    })

    it('adds meld to melds and returns true if valid peng', function(){
        expect(h.meld(MeldTypes.peng, [a, a, a], true)).to.equal(true);  
        expect(h.melds).to.deep.include(new Meld(MeldTypes.peng, [a, a, a], true));
    })

    it('adds meld to melds and returns true if valid chow', function(){
        expect(h.meld(MeldTypes.chow, [c, a, b])).to.equal(true);  
        expect(h.melds).to.deep.include(new Meld(MeldTypes.chow, [a, b, c], false));
    })

    it ('melds chows with tiles given in any order', function(){
        expect(h.meld(MeldTypes.chow, [d, b, c])).to.equal(true);  
        expect(h.melds).to.deep.include(new Meld(MeldTypes.chow, [b, c, d], false));
    })

    it('adds meld to melds and returns true if valid kong', function(){
        expect(h.meld(MeldTypes.kong, [a, a, a, a])).to.equal(true);  
        expect(h.melds).to.deep.include(new Meld(MeldTypes.kong, [a, a, a, a]));
    })

    let m = h.melds;

    it('returns false if invalid meld', function(){
        expect(h.meld(MeldTypes.pair, [a, b])).to.equal(false);
        expect(h.meld(MeldTypes.pair, [a, a, a])).to.equal(false);
        expect(h.meld(MeldTypes.peng, [a, a, b])).to.equal(false);
        expect(h.meld(MeldTypes.peng, [a, a, a, a])).to.equal(false);
        expect(h.meld(MeldTypes.peng, [a, a])).to.equal(false);
        expect(h.meld(MeldTypes.chow, [a, a, b])).to.equal(false);
        expect(h.meld(MeldTypes.chow, [a, a, a])).to.equal(false);
        expect(h.meld(MeldTypes.kong, [a, a, a])).to.equal(false);
        expect(h.meld(MeldTypes.peng, [a, a, a, b])).to.equal(false);
        expect(h.meld(MeldTypes.kong, [a, b, c, a])).to.equal(false);
    })

    it ('leaves melds array unchanged if invalid', function(){
        expect(h.melds).to.eql(m);
    })
})


describe('#takeDiscardedTile', function(){
    let h = new Hand();
    let m = [new Tile(2, 3), new Tile(2, 4)]
    let d = new Tile(2, 2);
    h.takeDiscardedTile(MeldTypes.chow, d, ...m);
    it ('adds meld to hand from given tiles', function(){
        expect(h.melds.length).to.equal(1);
        expect(h.melds[0]).to.eql(new Meld(MeldTypes.chow, [new Tile(2, 3), new Tile(2, 4), new Tile(2, 2)]))
    })
})
