const SuitTypes = Object.freeze({bamboo:0, dot:1, character:2, wind:3, dragon:4});
const RankTypes = Object.freeze({red: 0, green: 1, blank: 2, east: 0, south: 1, west: 2, 
                            north: 3, one: 0, two: 1, three: 2, four: 3, five: 4, six: 5, 
                            seven: 6, eight: 7, nine: 8});
const MeldTypes = Object.freeze({chow:0, peng:1, kong:2, pair: 3, special: 4});


//Represents a tile object, tuple of suit and rank
class Tile {
    constructor(suit, rank) {
        if (suit < 0 || suit > 4 || rank < 0 || rank > 8 || 
            (suit === 3 && rank > 3) || (suit === 4 && rank > 2) ){
            throw new RangeError('Invalid Tile Suit or Rank');
        }
        this.suit = suit;
        this.rank = rank;
    }

    isEqualRank(otherTile) {
        return this.rank === otherTile.rank;
    }

    isSameSuit(otherTile) {
        return this.suit === otherTile.suit;
    }

    equals(otherTile) {
        return this.isEqualRank(otherTile) && this.isSameSuit(otherTile);
    }
}

/**
 A class which defines characteristics of a Meld. Stores its shared suit, the type of Meld, and the
 ranks of its tiles.
 */
class Meld {
    suit; // Types defined above in SuitTypes object
    type; // Types defined above in MeldTypes object
    ranks = []; // An array of integers defining the ranks of the meld
    isConcealed;

    /**
     * Constructor for a Meld instance.
     * @param meldType: the type of meld
     * @param tileArray:    an array of Tiles
     * @param conceal: whether meld is concealed
     */
    constructor(meldType, tileArray, conceal = false) {
        this.suit = tileArray[0].suit;
        this.type = meldType;
        this.isConcealed = conceal;
        for (const t of tileArray) {
            this.ranks.push(t.rank);
        }
        this.ranks.sort(function(a, b){ return a-b });
    }

    /**
     * Sets the meld to concealed
     */
    conceal() {
        this.isConcealed = true;
    }
}


/**
 * Sorts an array of Melds by type (chow < peng/kong < pair), then by rank, then by suit (bamboo < dot < character)
 * @param meldArray
 * @returns     a sorted array of Melds
 */
function sortMelds(meldArray) {
    return meldArray.sort((x,y) => {
        if (x.type === y.type) {
            if (x.ranks[0] === y.ranks[0]) {
                return x.suit - y.suit;
            } else {
                return x.ranks[0] - y.ranks[0];
            }
        } else {
            return x.type - y.type;
        }
    });
}


exports.Tile = Tile;
exports.Meld = Meld;
exports.SuitTypes = SuitTypes;
exports.RankTypes = RankTypes;
exports.MeldTypes = MeldTypes;
exports.sortMelds = sortMelds;


