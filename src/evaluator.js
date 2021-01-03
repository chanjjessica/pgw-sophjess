const Tile = require('./meld.js').Tile;
const Meld = require('./meld.js').Meld;
const sortMelds = require('./meld').sortMelds;
const MeldTypes = require('./meld.js').MeldTypes;
const SuitTypes = require('./meld.js').SuitTypes;
const ScoreState = require('./score.js').ScoreState;

Object.defineProperty(Array.prototype, 'sum', {
    value: function () {
        return this.reduce((a, b) => a + b, 0);
    }
})

// container class for evaluation logic methods (all static)
class Evaluator {

    /**
     * Checks if three tiles make a peng
     * @param a, b, c: three tiles
     * @returns true if yes, else false
     */
    static canPeng(a, b, c){
        return a.rank === b.rank && a.rank === c.rank && 
                a.suit === b.suit && a.suit === c.suit;
    }

    /**
     * Checks if three tiles make a chow
     * @param a, b, c: three tiles
     * @returns true if yes, else false
     */
    static canChow(a, b, c){
        if (a.suit === b.suit && a.suit === c.suit && a.suit < 3 && 
            a.rank !== b.rank && a.rank !== c.rank && b.rank !== c.rank){
            let lo = Math.min(a.rank, b.rank, c.rank);
            let hi = Math.max(a.rank, b.rank, c.rank);
            return hi - lo === 2;
        }
        return false;
    }

    /**
     * Checks if four tiles make a kong
     * @param a, b, c, d: four given tiles
     * @returns true if yes, else false
     */
    static canKong(a, b, c, d){
        return this.canPeng(a, b, c) && a.rank === d.rank && a.suit === d.suit;
    }

    /**
     * Checks if a hand is a knitted straight, returns the melds if it is
     * @param hand: hand to be checked
     * @returns array of melds (three knitted straights + wind + dragon tiles) if yes, else empty array
     */
    static getKnittedStraightMelds(hand){
        if (hand.melds.length > 0) {
            return [];
        }

        let melds = [];
        let tiles = 14;
        for (let s = 0; s < 3; s++) {
            let suitArray = hand.inPlayTiles[s];
            for (let r = 0; r < 3; r++) {
                if (suitArray[r] === 1 && suitArray[r + 3] === 1 && suitArray[r + 6] === 1) { // all three
                    melds.push(new Meld(MeldTypes.special,
                        [new Tile(s, r), new Tile(s, r + 3), new Tile(s, r + 6)], true));
                    tiles -= 3;
                    break;
                } else if (suitArray[r] === 1 && suitArray[r + 3] === 1) { // lower two
                    melds.push(new Meld(MeldTypes.special,
                        [new Tile(s, r), new Tile(s, r + 3)], true));
                    tiles -= 2;
                    break;
                } else if (suitArray[r] === 1 && suitArray[r + 6] === 1) { // outer two
                    melds.push(new Meld(MeldTypes.special,
                        [new Tile(s, r), new Tile(s, r + 6)], true));
                    tiles -= 2;
                    break;
                } else if (suitArray[r + 3] === 1 && suitArray[r + 6] === 1) { //upper two
                    melds.push(new Meld(MeldTypes.special,
                        [new Tile(s, r + 3), new Tile(s, r + 3)], true));
                    tiles -= 2;
                    break;
                }
            }
        }

        let windTiles = [];
        for (let r = 0; r < 4; r++) {
            if (hand.inPlayTiles[SuitTypes.wind][r] === 1){
                windTiles.push(new Tile(SuitTypes.wind, r));
                tiles -= 1;
            }
        }
        if (windTiles.length > 1) { // at least 2 winds
            melds.push(new Meld(MeldTypes.special, windTiles, true))
        }
        let dragonTiles = [];
        for (let r = 0; r < 3; r++) {
            if (hand.inPlayTiles[SuitTypes.dragon][r] === 1){
                dragonTiles.push(new Tile(SuitTypes.dragon, r));
                tiles -= 1;
            }
        }
        if (dragonTiles.length > 1) { // at least 2 dragons
            melds.push(new Meld(MeldTypes.special, dragonTiles, true))
        }
        if (melds.length === 5 && tiles === 0){
            return melds;
        } else {
            return [];
        }
    }

    /**
     * Check for all pairs winning hand
     * @param hand: hand to be checked
     * @returns melds array if true, else empty array
     */
    static getSevenPairsMelds(hand){
       let pairs = 0;
       let meldedPairs = [];
       if (hand.melds.length > 0){ return []; }
       for (let i = 0; i < 5; i++){
           for (let j = 0; j < 9; j++){
               if (hand.inPlayTiles[i][j] === 2){
                   meldedPairs.push(new Meld(MeldTypes.pair, [new Tile(i, j), new Tile(i, j)], true));
                   pairs++;
               }
               else if (hand.inPlayTiles[i][j] === 4){
                   meldedPairs.push(new Meld(MeldTypes.pair, [new Tile(i, j), new Tile(i, j)], true));
                   meldedPairs.push(new Meld(MeldTypes.pair, [new Tile(i, j), new Tile(i, j)], true));
                   pairs += 2;
               }
               else if (hand.inPlayTiles[i][j] !== 0){
                   return [];
               }
           }
       }
       if (pairs === 7){ return meldedPairs; }
       else { return []; }
    }

    /**
     * Converts the count array of ranks in a particular suit and produces all unique combinations of sets that can be
     * formed from the tiles they represent. Implemented using recursion (see backtracking).
     * NOTE: this function will NOT attempt to pair tiles unless ALL the remaining tiles in the suit are placed into
     * valid sets.
     * @param counts    an array of counts (slice of hand.inPlayTiles)
     * @param suit      an int suit value
     * @return {[[[int, int...]]]} A list of all unique combinations of rank sets; if no rank sets can be formed, the
     * return list contains one empty set = [[]]
     */
    static buildAllRankSetsInSuit(counts, suit) {
        /**
         * Backtracking helper function; performs a depth-first search through the tree of subsets of the input set.
         * @param currCounts        an array of counts
         * @param currentSetPath    the path to the current node from the root (initial count array)
         * @return {[[[int, int...]]]} A list of all combinations of rank sets; if no rank sets can be formed, the
         * return list contains one empty set = [[]]
         */
        function buildSets(currCounts, currentSetPath) {
            if (currCounts.sum() === 0) {
                return [[]];
            } else if (currCounts.sum() === 2) {
                for (let i = 0; i < 9; i++) {
                    if (currCounts[i] === 2) {
                        return [[[i, i]]];
                    }
                }
                return [[]];
            } else {
                let fullPaths = [];
                for (let i = 0; i < 9; i++) {
                    if (suit < 3 && i < 7) {
                        if (currCounts[i] > 0 && currCounts[i+1] > 0 && currCounts[i+2] > 0) {
                            let countCopy = [...currCounts];
                            let setPathCopy = [...currentSetPath];
                            setPathCopy.push([i, i+1, i+2]);
                            countCopy[i]--;
                            countCopy[i+1]--;
                            countCopy[i+2]--;
                            let tailPaths = buildSets(countCopy, []);
                            for (const tp of tailPaths) {
                                let newPath = setPathCopy.concat(tp);
                                fullPaths.push(newPath);
                            }
                        }
                    }
                    if (currCounts[i] > 2) {
                        let countCopy = [...currCounts];
                        let setPathCopy = [...currentSetPath];
                        setPathCopy.push([i, i, i]);
                        countCopy[i] -= 3;
                        let tailPaths = buildSets(countCopy, []);
                        for (const tp of tailPaths) {
                            fullPaths.push(setPathCopy.concat(tp));
                        }
                    }
                }
                if (fullPaths.length > 0) {
                    return fullPaths;
                } else {
                    return [fullPaths];
                }
            }
        }

        /**
         * Helper function to sort set combinations internally for uniqueness checks
         * @param array     an input array
         * @return the sorted array
         */
        function setArraySort(array) {
            return array.sort((x, y) => {
                if (x[0] === y[0]) {
                    return y[1] - x[1];
                } else {
                    return x[0] - y[1];
                }
            })
        }

        const fullPaths = buildSets(counts, []);
        let finalSets = []

        //sort each list of sets
        for (const mset of fullPaths) {
            const sortedMSet = setArraySort(mset);
            //remove duplicates
            if (!finalSets.deepIncludes(sortedMSet)) {
                finalSets.push(sortedMSet);
            }
        }

        return finalSets;
    }

    /**
     * Helper function which converts a set of integer arrays representing tiles into their corresponding melds
     * @param rankSet   a list of lists of integers
     * @param suit      an int suit value
     * @return {[Meld]}     a list of Melds
     */
    static convertRankSetToMelds(rankSet, suit) {
        const melds = [];
        for (const set of rankSet) {
            if (set[0] !== set[1]) {
                melds.push(new Meld(MeldTypes.chow, [new Tile(suit, set[0]), new Tile(suit, set[1]), new Tile(suit, set[2])], true));
            } else {
                if (set.length === 3) {
                    melds.push(new Meld(MeldTypes.peng, [new Tile(suit, set[0]), new Tile(suit, set[1]), new Tile(suit, set[2])], true));
                } else {
                    melds.push(new Meld(MeldTypes.pair, [new Tile(suit, set[0]), new Tile(suit, set[1])], true));
                }
            }
        }
        return sortMelds(melds);
    }

    /**
     * Finds a set of winning melds if hand is a winning hand, else returns empty array
     * @param currentHand   hand to be checked
     * @param newTile       an optional extra tile parameter
     * @return {[]|*[]}     a list of Melds representing a win
     */
    static getWinningMelds(currentHand, newTile = null) {
        /*
            If a new tile is supplied, consider the hand with it added, try making the melds
         */
        const hand = currentHand.copy();
        if (newTile !== null) {
            hand.addTile(newTile);
        }

        function sortG2LByElementLength(array) {
            return array.sort((x, y) => {
                return y.length - x.length;
            })
        }
        /*
            Check edge case hands first:
            knitted straight
            7 pairs
         */

        let isKnittedStraight = this.getKnittedStraightMelds(hand);
        if (isKnittedStraight.length > 0) { //if this wins, no other win is possible
            if (newTile !== null) {
                for (const mld of isKnittedStraight) {
                    if (mld.suit === newTile.suit && mld.ranks.includes(newTile.rank)) {
                        mld.isConcealed = false;
                        break;
                    }
                }
            }
            return isKnittedStraight;
        }

        let allPairs = this.getSevenPairsMelds(hand);
        if (allPairs.length > 0) { //if this wins, it is the highest scoring by Brown SMR
            if (newTile !== null) {
                for (const mld of allPairs) {
                    if (mld.suit === newTile.suit && mld.ranks.includes(newTile.rank)) {
                        mld.isConcealed = false;
                        break;
                    }
                }
            }
            return allPairs;
        }

        /*
            Check normal cases:
                construct all the possible combinations of sets from each suit
                take the longest combinations (most sets)
                combine all such combinations across all suits
         */
        let freeMeldSets = [[]];
        for (let i = 0; i < hand.inPlayTiles.length; i++) {
            let suitArrayCopy = hand.inPlayTiles[i].slice();
            let rs = this.buildAllRankSetsInSuit(suitArrayCopy, i);
            let setCombos = sortG2LByElementLength(rs);
            let longestSetCombos = setCombos.filter((sc) => sc.length === setCombos[0].length);
            let nextMeldSets = [];
            for (const preMeldSet of freeMeldSets) {
                for (const bestRankSet of longestSetCombos) {
                    let meldsInSuit = this.convertRankSetToMelds(bestRankSet, i);
                    //if the new tile goes into one of these melds, find which meld includes it and manually set the conceal state
                    meldsInSuit.sort((x,y) => {
                        return x.type - y.type;
                    });
                    if (newTile !== null && newTile.suit === i) {
                        for (const mld of meldsInSuit) {
                            if (mld.ranks.includes(newTile.rank)) {
                                mld.isConcealed = false;
                                break;
                            }
                        }
                    }
                    nextMeldSets.push(preMeldSet.concat(meldsInSuit));
                }
            }
            freeMeldSets = nextMeldSets;
        }

        let bestMeldSet = [];
        let bestScore = 0;

        for (const freeMeldSet of freeMeldSets) {
            let fullMeldSet = freeMeldSet.concat(hand.melds);

            // check that the total number of sets is 5 and that only 1 is a pair
            if (fullMeldSet.length === 5) {
                let numPairs = 0;
                for (const mld of fullMeldSet) {
                    if (mld.type === MeldTypes.pair) {
                        numPairs++;
                    }
                }
                if (numPairs === 1) {
                    // if this is a valid win, keep only the best win
                    const ss = new ScoreState(fullMeldSet, (newTile === null));
                    ss.checkAllFan().assignScore();
                    const score = ss.totalScore;
                    if (score > bestScore) {
                        bestMeldSet = fullMeldSet;
                        bestScore = score;
                    }
                }
            }
        }

        return bestMeldSet;
    }

    // Check if discarded tile can be taken and returns array containing other tiles of meld.
    // The output of these functions can be used as args to hand.takeDiscardedTile
    /**
     * Check if given discarded tile is part of a peng in given hand
     * @param hand 
     * @param tile 
     * @returns: the other two tiles of the peng if true, else an empty array
     */
    static getDiscardedPeng(hand, tile){
        if (hand.inPlayTiles[tile.suit][tile.rank] >= 2){ return [tile, tile]; }
        return [];
    }


    /**
     * Returns an array of all possible chows with a given discarded tile 
     * (in the form of arrays inside array)
     * @param {*} hand 
     * @param {*} tile 
     */
    static getDiscardedChow(hand, tile){
        let s = tile.suit;
        let r = tile.rank;
        if(s > 2){ return []; }
        let chows = [];
        for (let i = 0; i < 7; i++){
            if (r === i) {
                if (hand.inPlayTiles[s][i+1] > 0 && hand.inPlayTiles[s][i+2] > 0) {
                    chows.push([new Tile(s, i+1), new Tile(s, i+2)]);
                }
            } else if (r === i+1) {
                if (hand.inPlayTiles[s][i] > 0 && hand.inPlayTiles[s][i+2] > 0) {
                    chows.push([new Tile(s, i), new Tile(s, i+2)]);
                }
            } else if (r === i+2) {
                if (hand.inPlayTiles[s][i] > 0 && hand.inPlayTiles[s][i+1] > 0) {
                    chows.push([new Tile(s, i), new Tile(s, i+1)]);
                }
            }
        }
        return chows;
    }


    static getDiscardedKong(hand, tile){
        if (hand.inPlayTiles[tile.suit][tile.rank] === 3){ return [tile, tile, tile]; }
        return [];
    }

    //TODO: function that checks whether a hand can self-kong; unclear contract: 1) (hand, tile => boolean); 2) (hand => array<array<Tile>>); 3) (hand => array<Meld>)

    /*
        Code past this point includes artifacts kept for reference. It will be removed later once it is no longer relevant
     */

    // find meld methods may have other purposes; keeping them for now
    /**
     * For bamboo, dot, character suits
     * Helper function for getWinningMelds - Finds all pengs and chows in a suit and returns them as meld array
     * @param hand : hand to check
     * @param suit : suit to check
     * @param pairRank : tile rank to pair, if any (default - none)
     * @returns: array of melds if no leftover tiles in suit; else [-1]
     */
    static findPengsChowsOfSuit(hand, suit, pairRank = -1){
        let suitArrayCopy = hand.inPlayTiles[suit].slice();
        let m = [];
        // If also need to check for pairs
        if (pairRank > -1 && pairRank < suitArrayCopy.length && suitArrayCopy[pairRank] > 1){
            suitArrayCopy[pairRank] -= 2;
            m.push(new Meld(MeldTypes.pair, [new Tile(suit, pairRank), new Tile(suit, pairRank)], true));
        }
        for (let i = 0; i < suitArrayCopy.length; i++){
            if (suitArrayCopy[i] >= 3){
                let t = new Tile(suit, i);
                m.push(new Meld(MeldTypes.peng, [t, t, t], true));
                suitArrayCopy[i] -= 3;
            }
            if (i + 2 < suitArrayCopy.length-2){
                let numChows = Math.min(suitArrayCopy[i], suitArrayCopy[i+1], suitArrayCopy[i+2]);
                for (let j = 0; j < numChows; j++){
                    m.push(new Meld(MeldTypes.chow, [new Tile(suit, i), new Tile(suit, i+1),
                        new Tile(suit, i+2)], true));
                    suitArrayCopy[i]--;
                    suitArrayCopy[i+1]--;
                    suitArrayCopy[i+2]--;
                }
            }
        }
        // Check if all tiles in hand have been melded
        if (suitArrayCopy.reduce((a, b) => a + b, 0) === 0){ return m; }
        else { return [-1]; }
    }

    // for dragon and wind suits (chows not possible)
    /**
     * Helper function for getWinningMelds - Find all pengs in hand and return them in array
     * @param hand : hand to check
     * @param suit : suit to check
     * @param pairRank : which tile is paired, if any;
     * @returns array of pengs if suit array is cleared out (no leftover tiles), else returns [-1]
     */
    static findPengsOfSuit(hand, suit, pairRank = -1){
        let suitArrayCopy = hand.inPlayTiles[suit].slice();
        let m = [];
        if (pairRank > -1 && pairRank < suitArrayCopy.length && suitArrayCopy[pairRank] > 1){
            suitArrayCopy[pairRank] -= 2;
            m.push(new Meld(MeldTypes.pair, [new Tile(suit, pairRank), new Tile(suit, pairRank)], true));
        }
        for (let i = 0; i < suitArrayCopy.length; i++){
            if (suitArrayCopy[i] > 2){
                let t = new Tile(suit, i);
                m.push(new Meld(MeldTypes.peng, [t, t, t], true));
                suitArrayCopy[i] -= 3;
            }
        }
        // Check if all tiles in hand have been melded, if not -> array of -1
        if (suitArrayCopy.reduce((a, b) => a + b, 0) === 0){ return m; }
        else { return [-1]; }
    }

    //  winningMelds function replaced by another function
    /**
     * Gets winning melds if hand is a winning hand, else returns empty array
     * @param hand: hand to be checked
     * @returns array of melds if true, else empty array
     */
    static getWinningMeldsOld(hand, winPair = null){
        // If discarded tile is taken to complete pair and win hand
        if (winPair instanceof Tile){
            if (hand.inPlayTiles[winPair.suit][winPair.rank] > 0){
                let handCopy = hand.copy();
                handCopy.addTile(winPair);
                handCopy.meld(MeldTypes.pair, [winPair, winPair]);
                hand = handCopy;

            }
            else { return []; }
        }

        //Check Edge Cases: Knitted Straights and All Pairs
        if (winPair === null){
            let isKnittedStraight = this.getKnittedStraightMelds(hand);
            if (isKnittedStraight.length > 0){
                return isKnittedStraight;
            }
        }
        let isAllPairs = this.getSevenPairsMelds(hand);
        if (isAllPairs.length > 0){
            return isAllPairs;
        }

        // Check if all melded
        let pairs = 0;
        let otherMelds = 0;
        for (let i = 0; i < hand.melds.length; i++){
            if (hand.melds[i].type === MeldTypes.pair){ pairs++; }
            else { otherMelds++; }
        }
        if (pairs === 1 && otherMelds === 4){ return hand.melds; }

        // Otherwise check inPlayTiles
        else if (pairs === 1){
            //check winds and dragons for pengs
            let m = [];
            for (let i = SuitTypes.wind; i < SuitTypes.dragon + 1; i++){
                let hasMelds = this.findPengsOfSuit(hand, i);
                if (hasMelds.length > 0){
                    if (hasMelds[0] === -1){
                        return [];
                    }
                    else{ m = m.concat(hasMelds); }
                }
            }
            // Check bamboo, dot, character for pengs and chows
            for (let i = 0; i < SuitTypes.wind; i++){
                let hasMelds = this.findPengsChowsOfSuit(hand, i);
                if (hasMelds.length > 0){
                    if (hasMelds[0] === -1){
                        return [];
                    }
                    else{ m = m.concat(hasMelds); }
                }
            }
            if (m.length + otherMelds === 4){
                return m.concat(hand.melds);
            }
            else { return []; }
        }

        else if (pairs === 0){
            for (let i = 0; i < 5; i++){
                for (let j = 0; j < 9; j++){
                    let m = [];
                    if (hand.inPlayTiles[i][j] > 1){
                        //Holding pair constant, find melds of each suit
                        for (let k = 0; k < 3; k++){
                            let hasMelds;
                            if (k === i){
                                hasMelds = this.findPengsChowsOfSuit(hand, k, j);
                                //console.log(k, hasMelds);
                            }
                            else {
                                hasMelds = this.findPengsChowsOfSuit(hand, k);
                                //console.log(k, hasMelds);
                            }
                            if (hasMelds.length > 0 && hasMelds[0] !== -1){
                                m = m.concat(hasMelds);
                                //console.log('concatted: ', m);
                            }
                        }
                        for (let k = 3; k < 5; k++){
                            let hasMelds;
                            if (k === i){
                                hasMelds = this.findPengsOfSuit(hand, k, j);
                                //console.log(k, hasMelds);
                            }
                            else {
                                hasMelds = this.findPengsOfSuit(hand, k);
                                //console.log(k, hasMelds);
                            }
                            if (hasMelds.length > 0 && hasMelds[0] !== -1){
                                m = m.concat(hasMelds);
                                //console.log('concatted: ', m);
                            }
                        }
                        if (m.length + otherMelds === 5 &&
                            m.filter(a => a.type === MeldTypes.pair).length === 1){
                            return m.concat(hand.melds);
                        }
                    }
                }
            }
        }
        return [];
    }
}

exports.Evaluator = Evaluator;