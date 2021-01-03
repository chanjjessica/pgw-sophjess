const Meld = require('./meld.js').Meld;
const _ = require('underscore');
const sortMelds = require('./meld.js').sortMelds;
const RankTypes = require('./meld').RankTypes;
const SuitTypes = require('./meld').SuitTypes;
const MeldTypes = require('./meld').MeldTypes;

/**
 * Finds all the indices of a particular element in an array.
 * @param array:    an array of elements
 * @param element:  an element
 * @returns     an array of integer indices
 */
Object.defineProperty(Array.prototype, 'getAllOccurrences', {
    value: function (element) {
        return this.reduce((arr, ele, i) => {
            if (_.isEqual(ele, element)) {
                arr.push(i);
            }
            return arr;
        }, []);
    }
})

/**
 * Finds the Cartesian product a1 x a2 x a3 of three arrays. This is all combinations of the ordered triple:
 *      [element from a1, element from a2, element from a3]
 * @param a1:   the first array
 * @param a2:   the second array
 * @param a3:   the third array
 * @returns     an array of arrays of length 3
 */
function arrayTripleProduct(a1, a2, a3) {
    let arrays = [];
    for (const e1 of a1) {
        for (const e2 of a2) {
            for (const e3 of a3) {
                arrays.push([e1, e2, e3]);
            }
        }
    }
    return arrays;
}

/**
    A Class which scores a winning hand. Proper use would be something of the form:

    const ss = new ScoreState(Array<Melds>, false, false)
    const score = ss.getScore()

    See specific constructors and methods below for details.
 */
class ScoreState {
    totalScore = 0;
    rawMelds; //Array of Melds

    meldMask = []; //Array of MeldTypes [mt1, mt2, mt3, mt4, mt5]
    suitMask = []; //Suits are shared by their meld, so this is an Array of suits [s1, s2, s3, s4, s5]
    rankMask = []; //Array of array of ranks [[r1, r2, r3], [r4, r4, r4],...]

    //gamestate variables which must be supplied when constructing a ScoreState
    fullyConcealed = true; //true if no tiles melded, checked from input melds
    selfDraw; //true if last tile was self drawn
    wallExhausted; //boolean for scoring best hand in case nobody won

    //special hands
    allPairs = false;
    knittedStraight = false;

    //hand types
    flush = false;
    halfFlush = false;
    pureStraight = false;
    pureShift = false;
    onlyFives = false;
    onlyUpper = false;
    onlyLower = false;
    threeWinds = false;
    mixedStraight = false;
    mixedTripleChow = false;
    mixedShift = false;
    allTypes = false;
    allPengs = false;

    lacksHonors = false;
    oneVoidedSuit = false;

    //bonuses
    doublePengs = 0;
    concealed2Pengs = 0;
    dragonPengs = 0;
    tileHogs = 0;

    concealedKongs = 0;
    meldedKongs = 0;

    //TODO: scoring logic for concealed kongs/melded kongs

    /**
     * Constructor for a ScoreState object
     * @param melds:    an array of Melds representing a winning hand
     * @param selfDraw:     a boolean: true if last tile was drawn from wall
     * @param wallExhausted:    a boolean: true if game ended by wall exhaustion AND player has a scoring hand
     */
    constructor(melds, selfDraw, wallExhausted = false) {
        this.rawMelds = sortMelds(melds);
        this.selfDraw = selfDraw;
        this.wallExhausted = wallExhausted
        for (const meld of this.rawMelds) {
            this.meldMask.push(meld.type);
            this.suitMask.push(meld.suit);
            this.rankMask.push(meld.ranks);
            if (!meld.isConcealed) {
                this.fullyConcealed = false;
            }
        }
    }

    /**
     * Finds all chows in the hand.
     * @returns     an array of Melds
     */
    getChows() {
        return this.rawMelds.filter((m) => m.type === MeldTypes.chow);
    }

    /**
     * Finds all pengs in the hand.
     * @returns     an array of Melds
     */
    getPengs() {
        return this.rawMelds.filter((m) => m.type === MeldTypes.peng);
    }

    /**
     * Finds all kongs in the hand.
     * @returns     an array of Melds
     */
    getKongs() {
        return this.rawMelds.filter((m) => m.type === MeldTypes.kong);
    }

    /**
     * Finds all pengs or kongs in the hand.
     * @returns     an array of Melds
     */
    getPengsOrKongs() {
        return this.rawMelds.filter((m) => m.type === MeldTypes.peng || m.type === MeldTypes.kong);
    }

    /**
     * Finds all pairs in the hand.
     * @returns     an array of Melds.
     */
    getPairs() {
        return this.rawMelds.filter((m) => m.type === MeldTypes.pair);
    }

    /**
     * Finds all suits corresponding to the specified Melds by index.
     * @param indexArray    an array of integer indices
     * @returns     an array of integers representing SuitTypes
     */
    meldIndicesToSuits(indexArray) {
        return indexArray.map((i) => this.suitMask[i]);
    }

    /**
     * Checks for Fan #1: all pairs
     * @returns {ScoreState} the updated ScoreState
     */
    checkAllPairs() {
        if (this.rawMelds.length === 7) {
            this.allPairs = true;
        }
        return this;
    }

    /**
     * Checks for Fan #9: knitted straight
     * @returns {ScoreState} the updated ScoreState
     */
    checkKnittedStraight() {
        // 5 special meld types, 1 of each suit
        if (_.isEqual(this.meldMask, [4, 4, 4, 4, 4]) && _.isEqual([...this.suitMask].sort(), [0, 1, 2, 3, 4])) {
            this.knittedStraight = true;
        }
        return this;
    }

    /**
     * Checks for Fan defined only by suits: #2, #13, #15, #26, #27
     * @returns {ScoreState} the updated ScoreState
     */
    checkSuits() {
        const allSuits = [...new Set(this.suitMask)]
        let uniqueSuits = [];
        for (const st of allSuits) {
            if (!uniqueSuits.includes(st)) {
                uniqueSuits.push(st)
            }
        }
        const numericSuits = uniqueSuits.filter((x) => x < SuitTypes.wind);
        const honorSuits = uniqueSuits.filter((x) => x > SuitTypes.character);

        if (uniqueSuits.length === 5) { //hand contains all suits
            this.allTypes = true;
        } else if (numericSuits.length === 2) { //missing a numeric suit
            this.oneVoidedSuit = true;
        } else if (numericSuits.length === 1) { // only contains one numeric suit
            if (honorSuits.length > 0) { // if has honors --> half flush
                this.halfFlush = true;
            } else { // if lacks honors --> full flush
                this.flush = true;
                this.lacksHonors = true;
            }
        }

        if (honorSuits.length === 0) { // lacks honors
            this.lacksHonors = true;
        }

        return this;
    }

    /**
     * Checks for Fan defined only by rank: #5, #6, #7
     * @returns {ScoreState} the updated ScoreState
     */
    checkRanks() {
        let underFive = 0;
        let fives = 0;
        let overFive = 0;
        for (const arr of this.rankMask) {
            if (arr.includes(RankTypes.five)) {
                fives++;
            }
            for (const r of arr) {
                if (r < RankTypes.five) {
                    underFive++;
                } else if (r > RankTypes.five) {
                    overFive++;
                }
            }
        }
        if (fives >= 5) {
            this.onlyFives = true;
        } else if (fives === 0) { // no fives
            if (overFive >= 14 && !this.suitMask.includes(SuitTypes.wind) && !this.suitMask.includes(SuitTypes.dragon)) { // no tiles > 5, only suits
                this.onlyUpper = true;
            } else if (underFive >= 14 && !this.suitMask.includes(SuitTypes.wind) && !this.suitMask.includes(SuitTypes.dragon)) { // no tiles < 5, only suits
                this.onlyLower = true;
            }
        }
        return this;
    }

    /**
     * Checks for Fan defined by straights: #3, #10
     * @returns {ScoreState} the updated ScoreState
     */
    checkStraights() {
        const lowerIndices = this.rankMask.getAllOccurrences([RankTypes.one, RankTypes.two, RankTypes.three]);
        const middleIndices = this.rankMask.getAllOccurrences([RankTypes.four, RankTypes.five, RankTypes.six]);
        const upperIndices = this.rankMask.getAllOccurrences([RankTypes.seven, RankTypes.eight, RankTypes.nine]);
        if (lowerIndices.length > 0 && middleIndices.length > 0 && upperIndices.length > 0) {
            const lowerSuits = this.meldIndicesToSuits(lowerIndices);
            const middleSuits = this.meldIndicesToSuits(middleIndices);
            const upperSuits = this.meldIndicesToSuits(upperIndices);
            const suitSets = arrayTripleProduct(lowerSuits, middleSuits, upperSuits);
            const uniqueSuitSets = suitSets.map((arr) => [...new Set(arr)]);
            for (const uniqueSuitSet of uniqueSuitSets) {
                if (uniqueSuitSet.length === 3) {
                    this.mixedStraight = true;
                } else if (uniqueSuitSet.length === 1) {
                    this.pureStraight = true;
                }
            }
        }
        return this;
    }

    /**
     * Checks for Fan defined by shifts and triples: #4, #11, #14
     * @returns {ScoreState} the updated ScoreState
     */
    checkShiftsAndTriples() {
        const chows = this.getChows();
        if (chows.length > 2) {
            // find min and 2nd min values
            let min = Infinity, min2 = Infinity;
            for (const r of chows.map((x) => x.ranks[0])) {
                if (r < min) {
                    min2 = min;
                    min = r;
                } else if (r < min2) {
                    min2 = r;
                }
            }

            //Case 1: lowest value begins the shift/triple
            const bottomIndices = this.rankMask.getAllOccurrences([min, min + 1, min + 2]);
            const upshift1Indices = this.rankMask.getAllOccurrences([min + 1, min + 2, min + 3]);
            const upshift2Indices = this.rankMask.getAllOccurrences([min + 2, min + 3, min + 4]);
            const upshift4Indices = this.rankMask.getAllOccurrences([min + 4, min + 5, min + 6]);

            //Check for triples
            if (bottomIndices.length > 2) {
                const suitSet = this.meldIndicesToSuits(bottomIndices)
                const uniqueSuitSet = [...new Set(suitSet)];
                if (uniqueSuitSet.length === 3) {
                    this.mixedTripleChow = true;
                }
            }

            //Check for shifts
            if (upshift2Indices.length > 0) {
                const bottomSuits = this.meldIndicesToSuits(bottomIndices);
                const upshift2Suits = this.meldIndicesToSuits(upshift2Indices);
                if (upshift1Indices.length > 0) { // shift by 1 possible
                    const upshift1Suits = this.meldIndicesToSuits(upshift1Indices);
                    const suitSets = arrayTripleProduct(bottomSuits, upshift1Suits, upshift2Suits);
                    const uniqueSuitSets = suitSets.map((arr) => [...new Set(arr)]);
                    for (const uniqueSuitSet of uniqueSuitSets) {
                        if (uniqueSuitSet.length === 3) {
                            this.mixedShift = true;
                        } else if (uniqueSuitSet.length === 1) {
                            this.pureShift = true;
                        }
                    }
                }
                if (upshift4Indices.length > 0) { // shift by 2 possible
                    const upshift4Suits = this.meldIndicesToSuits(upshift4Indices);
                    const suitSets = arrayTripleProduct(bottomSuits, upshift2Suits, upshift4Suits);
                    const uniqueSuitSets = suitSets.map((arr) => [...new Set(arr)]);
                    for (const uniqueSuitSet of uniqueSuitSets) {
                        if (uniqueSuitSet.length === 3) {
                            this.mixedShift = true;
                        } else if (uniqueSuitSet.length === 1) {
                            this.pureShift = true;
                        }
                    }
                }
            }

            //Case 2: second lowest value begins the shift/triple
            if (chows.length === 4) {
                const bottomIndices2 = this.rankMask.getAllOccurrences([min2, min2 + 1, min2 + 2]);
                const upshift1Indices2 = this.rankMask.getAllOccurrences([min2 + 1, min2 + 2, min2 + 3]);
                const upshift2Indices2 = this.rankMask.getAllOccurrences([min2 + 2, min2 + 3, min2 + 4]);
                const upshift4Indices2 = this.rankMask.getAllOccurrences([min2 + 4, min2 + 5, min2 + 6]);

                //check for triples
                if (bottomIndices2.length === 3) {
                    const suitSet = this.meldIndicesToSuits(bottomIndices2)
                    const uniqueSuitSet = [...new Set(suitSet)];
                    if (uniqueSuitSet.length === 3) {
                        this.mixedTripleChow = true;
                    }
                }

                //check for shifts
                if (upshift2Indices2.length === 1) {
                    if (upshift1Indices2.length === 1) {
                        const suitSet = [this.suitMask[bottomIndices2[0]], this.suitMask[upshift1Indices2[0]], this.suitMask[upshift2Indices2[0]]];
                        const uniqueSuitSet = [...new Set(suitSet)];
                        if (uniqueSuitSet.length === 3) {
                            this.mixedShift = true;
                        } else if (uniqueSuitSet.length === 1) {
                            this.pureShift = true;
                        }
                    } else if (upshift4Indices2.length === 1) {
                        const suitSet = [this.suitMask[bottomIndices2[0]], this.suitMask[upshift2Indices2[0]], this.suitMask[upshift4Indices2[0]]];
                        const uniqueSuitSet = [...new Set(suitSet)];
                        if (uniqueSuitSet.length === 3) {
                            this.mixedShift = true;
                        } else if (uniqueSuitSet.length === 1) {
                            this.pureShift = true;
                        }
                    }
                }
            }
        }
        return this;
    }

    /**
     * Checks for Fan defined by pengs: #8, #12, #16, #18, #21, #22
     * @returns {ScoreState} the updated ScoreState
     */
    checkPengsOrKongs() {
        let pengIndices = [];
        let pengSuits = [];
        for (let i = 0; i < this.meldMask.length; i++) {
            if (this.meldMask[i] === MeldTypes.peng || this.meldMask[i] === MeldTypes.kong) {
                pengIndices.push(i);
                pengSuits.push(this.suitMask[i]);
            }
        }
        const windIndices = pengSuits.getAllOccurrences(SuitTypes.wind);
        const dragonIndices = pengSuits.getAllOccurrences(SuitTypes.dragon);
        if (pengIndices.length === 4) {
            this.allPengs = true;
        }
        if (windIndices.length > 2) {
            this.threeWinds = true;
        }
        this.dragonPengs = dragonIndices.length;

        // double peng logic
        let pengRanks = [];
        let numConcealed = 0;
        for (const i of pengIndices) {
            if (this.rawMelds[i].suit !== SuitTypes.wind && this.rawMelds[i].suit !== SuitTypes.dragon) {
                pengRanks.push(this.rawMelds[i].ranks[0]);
            }
            if (this.rawMelds[i].type === MeldTypes.kong) {
                if (this.rawMelds[i].isConcealed) {
                    this.concealedKongs++;
                } else {
                    this.meldedKongs++
                }
            }
            if (this.rawMelds[i].type === MeldTypes.peng && this.rawMelds[i].isConcealed) {
                numConcealed++;
            }
        }
        this.concealed2Pengs = Math.floor(numConcealed / 2);
        for (let rnk = RankTypes.one; rnk < RankTypes.nine + 1; rnk++) {
            let count = 0;
            for (let i = 0; i < pengRanks.length; i++) {
                if (pengRanks[i] === rnk) {
                    count++;
                }
            }
            if (count > 1) {
                this.doublePengs++;
            }
        }
        return this;
    }

    /**
     * Checks for Fan #20: Tile Hog
     * @returns {ScoreState} the updated ScoreState
     */
    check4ofKind() {
        const numericMelds = this.rawMelds.filter((x) => x.suit !== SuitTypes.dragon && x.suit !== SuitTypes.wind && x.type !== MeldTypes.kong);
        for (const i of [SuitTypes.bamboo, SuitTypes.dot, SuitTypes.character]) {
            for (let r = RankTypes.one; r <= RankTypes.nine; r++) {
                let count = 0;
                for (const meld of numericMelds) {
                    for (const v of meld.ranks) {
                        if (v === r && meld.suit === i) {
                            count++;
                        }
                    }
                }
                if (count === 4) {
                    this.tileHogs++;
                }
            }
        }
        return this;
    }


    /**
     * Calculates all state variables necessary to compute score
     * @returns {ScoreState} the updated ScoreState
     */
    checkAllFan() {
        return this.checkAllPairs()
            .checkKnittedStraight()
            .checkSuits()
            .checkRanks()
            .checkStraights()
            .checkShiftsAndTriples()
            .checkPengsOrKongs()
            .check4ofKind();
    }

    /**
     * Uses the current ScoreState to calculate the Score
     * @returns {ScoreState} the updated ScoreState
     */
    assignScore() {
        //TODO: scoring logic for end of game by exhaustion

        //special hands
        if (this.knittedStraight) { // #9
            this.totalScore += 12;
        } else {
            //suits
            if (this.flush) { // #2
                this.totalScore += 24;
            } else if (this.halfFlush) { // #13
                this.totalScore += 6;
            } else if (this.allTypes) { // #15
                this.totalScore += 6;
            } else {
                if (this.oneVoidedSuit) { // #26
                    this.totalScore += 1;
                }
                if (this.lacksHonors) { // #27
                    this.totalScore += 1;
                }
            }

            //set types
            if (this.allPairs) { // #1
                this.totalScore += 24;
            } else if (this.pureStraight || this.pureShift) { // #3, #4
                this.totalScore += 16;
            } else if (this.mixedStraight || this.mixedTripleChow) { // #10, #11
                this.totalScore += 8;
            } else if (this.allPengs || this.mixedShift) { // #12, #14
                this.totalScore += 6;
            }

            //values
            if (this.onlyFives) { // #5
                this.totalScore += 16;
            } else if (this.onlyUpper || this.onlyLower || this.threeWinds) { // #6, #7, #8
                this.totalScore += 12;
            }
        }

        // gamestate bonuses (#17)
        if (this.fullyConcealed) { // #19
            this.totalScore += 2;
        }
        if (this.selfDraw) { // #24
            this.totalScore += 2;
        }

        //singular bonuses
        if (this.dragonPengs === 3) {
            this.totalScore += 8;
        } else if (this.dragonPengs === 2) { // #16
            this.totalScore += 6;
        } else if (this.dragonPengs === 1) { // #18
            this.totalScore += 2;
        }
        if (this.doublePengs > 0) { // #21
            this.totalScore += 2;
        }
        if (this.concealed2Pengs > 0) { // #22
            this.totalScore += 2;
        }

        //multiplier bonuses
        this.totalScore += 2 * this.tileHogs; // #20
        this.totalScore += 2 * this.concealedKongs; // #23
        this.totalScore += this.meldedKongs; // #25

        //base value
        if (this.totalScore === 0) { // #28
            this.totalScore = 1;
        }
        return this;
    }

    /**
     * Computes the necessary scoring variables and produces the int score of the winning hand.
     * @returns {number} the integer score.
     */
    getScore() {
        return this.checkAllFan().assignScore().totalScore;
    }
}

exports.arrayTripleProduct = arrayTripleProduct;
exports.ScoreState = ScoreState;
