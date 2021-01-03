const Tile = require('./meld.js').Tile;
const Meld = require('./meld.js').Meld;
const MeldTypes = require('./meld.js').MeldTypes;
const Evaluator = require('./evaluator.js').Evaluator;


//Represents a player's hand of tiles, with functions to add and remove tiles from hand and to meld tile sets
class Hand {
    constructor(){
        this.inPlayTiles = Array.from(Array(5), _ => Array(9).fill(0));   // Instantiate empty tiles (5x9 Matrix)
        this.melds = [];
        this.numUnmeldedTiles = 0;
    }   

    /**
     * Adds a tile to inPlayTiles
     * @param tile: tile to be added
     * @throws RangeError: If tile suit or rank given is invalid
     */
    addTile(tile){
        this.inPlayTiles[tile.suit][tile.rank]++;
        this.numUnmeldedTiles++;
    }


    /**
     * Removes a tile from inPlayTiles (for discard or if melded)
     * @param tile: tile to be discarded
     * @throws RangeError: 
     */
    removeTile(tile){
        if (this.inPlayTiles[tile.suit][tile.rank] > 0){
            this.inPlayTiles[tile.suit][tile.rank]--;
            this.numUnmeldedTiles--;
        }
        return tile;
    }

    /**
     * If a set of tiles can be melded, melds and adds to meld array
     * @param meldType: type of meld to make
     * @param concealed: whether meld is concealed or not
     * @param tiles: array of tiles to be melded
     * @returns true if melded, else false 
     */
    meld(meldType, tiles, concealed = false){
        let isMeld = false;
        if (meldType === MeldTypes.pair && tiles.length === 2){
            isMeld = tiles[0].equals(tiles[1]);
        } else if (tiles.length === 3){
            if (meldType === MeldTypes.peng){
                isMeld = Evaluator.canPeng(tiles[0], tiles[1], tiles[2]);
            }
            else if (meldType === MeldTypes.chow){
                isMeld = Evaluator.canChow(tiles[0], tiles[1], tiles[2]);
            }
        } else if (tiles.length === 4 && meldType === MeldTypes.kong){
            isMeld = Evaluator.canKong(tiles[0], tiles[1], tiles[2], tiles[3]);
        }

        if (isMeld){
            this.melds.push(new Meld(meldType, tiles, concealed));
            for (let t of tiles){
                this.removeTile(t);
            }
        }
        return isMeld;
    }


    // Creates clone of hand
    copy(){
        let handCopy = new Hand();
        handCopy.numUnmeldedTiles = this.numUnmeldedTiles;
        handCopy.melds = this.melds.slice();
        handCopy.inPlayTiles = [];
        for (let i = 0; i < this.inPlayTiles.length; i++){
            handCopy.inPlayTiles.push(this.inPlayTiles[i].slice());
        }
        return handCopy;
    }

    /**
     * Adds a discarded tile to hand and melds it.
     * Assumes that canTakeDiscarded* has already been called and returned true
     * @param meldType 
     * @param discarded 
     * @param others 
     */
    takeDiscardedTile(meldType, discarded, ...others){
        this.addTile(discarded);
        others.push(discarded);
        this.meld(meldType, others);
    }
    
    /**
     * Check if a player can peng with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkPeng(tile) {
        return Evaluator.getDiscardedPeng(this, tile).length > 0;
    }

    /**
     * Check if a player can kong with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkKong(tile) {
        return Evaluator.getDiscardedKong(this, tile).length > 0;
    }

    // Changes peng in melds array to kong, removes 4th tile from inPlayTiles
    pengToKong(s, r) {
        for (const m of this.melds){
            if (m.type === MeldTypes.peng && m.suit === s && m.ranks[0] === r){
                let t = new Tile(s, r);
                m.ranks.push(t.rank);
                m.type = MeldTypes.kong;
                this.removeTile(t);
                return true;
            }
        }
        return false;
    }


    concealedKong(s, r){
        if (this.inPlayTiles[s][r] === 4){
            let t = new Tile(s, r);
            this.meld(MeldTypes.kong, [t, t, t, t], true);
            return true;
        }
        return false;
    }



    /**
     * Check if a player can chow with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkChow(tile) {
        return Evaluator.getDiscardedChow(this, tile).length > 0;
    }

    /**
     * Check if a player can win with this tile
     * @param tile: a tile object that is discarded by another player
     * @return true if the tile creates a win, false otherwise
     */
    checkWin(tile = null) {
        if (tile === null) {
            return Evaluator.getWinningMelds(this).length > 0;
        } else {
            this.addTile(tile);
            const bool = Evaluator.getWinningMelds(this).length > 0;
            this.removeTile(tile);
            return bool;
        }

    }


}


exports.Hand = Hand;

