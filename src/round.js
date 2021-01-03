const Tile = require('./meld').Tile;
const RankTypes = require('./meld').RankTypes;
const SuitTypes = require('./meld').SuitTypes;
const MeldTypes = require('./meld').MeldTypes;
const Hand = require('./hand').Hand;
const isEqual = require('underscore').isEqual;
const Evaluator = require('./evaluator.js').Evaluator;

const SMRTiles = [new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.one), new Tile(SuitTypes.bamboo, RankTypes.one),
	new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two), new Tile(SuitTypes.bamboo, RankTypes.two),
	new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.three), new Tile(SuitTypes.bamboo, RankTypes.three),
	new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.four), new Tile(SuitTypes.bamboo, RankTypes.four),
	new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.five), new Tile(SuitTypes.bamboo, RankTypes.five),
	new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.six), new Tile(SuitTypes.bamboo, RankTypes.six),
	new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven), new Tile(SuitTypes.bamboo, RankTypes.seven),
	new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight), new Tile(SuitTypes.bamboo, RankTypes.eight),
	new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.nine), new Tile(SuitTypes.bamboo, RankTypes.nine),
	new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.one), new Tile(SuitTypes.character, RankTypes.one),
	new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.two), new Tile(SuitTypes.character, RankTypes.two),
	new Tile(SuitTypes.character, RankTypes.three), new Tile(SuitTypes.character, RankTypes.three), new Tile(SuitTypes.character, RankTypes.three), new Tile(SuitTypes.character, RankTypes.three),
	new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.four), new Tile(SuitTypes.character, RankTypes.four),
	new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.five), new Tile(SuitTypes.character, RankTypes.five),
	new Tile(SuitTypes.character, RankTypes.six), new Tile(SuitTypes.character, RankTypes.six), new Tile(SuitTypes.character, RankTypes.six), new Tile(SuitTypes.character, RankTypes.six),
	new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven), new Tile(SuitTypes.character, RankTypes.seven),
	new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight), new Tile(SuitTypes.character, RankTypes.eight),
	new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine), new Tile(SuitTypes.character, RankTypes.nine),
	new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one), new Tile(SuitTypes.dot, RankTypes.one),
	new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two), new Tile(SuitTypes.dot, RankTypes.two),
	new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three), new Tile(SuitTypes.dot, RankTypes.three),
	new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four), new Tile(SuitTypes.dot, RankTypes.four),
	new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.five), new Tile(SuitTypes.dot, RankTypes.five),
	new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.six), new Tile(SuitTypes.dot, RankTypes.six),
	new Tile(SuitTypes.dot, RankTypes.seven), new Tile(SuitTypes.dot, RankTypes.seven), new Tile(SuitTypes.dot, RankTypes.seven), new Tile(SuitTypes.dot, RankTypes.seven),
	new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight), new Tile(SuitTypes.dot, RankTypes.eight),
	new Tile(SuitTypes.dot, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.nine), new Tile(SuitTypes.dot, RankTypes.nine),
	new Tile(SuitTypes.wind, RankTypes.east), new Tile(SuitTypes.wind, RankTypes.east), new Tile(SuitTypes.wind, RankTypes.east), new Tile(SuitTypes.wind, RankTypes.east),
	new Tile(SuitTypes.wind, RankTypes.south), new Tile(SuitTypes.wind, RankTypes.south), new Tile(SuitTypes.wind, RankTypes.south), new Tile(SuitTypes.wind, RankTypes.south),
	new Tile(SuitTypes.wind, RankTypes.west), new Tile(SuitTypes.wind, RankTypes.west), new Tile(SuitTypes.wind, RankTypes.west), new Tile(SuitTypes.wind, RankTypes.west),
	new Tile(SuitTypes.wind, RankTypes.north), new Tile(SuitTypes.wind, RankTypes.north), new Tile(SuitTypes.wind, RankTypes.north), new Tile(SuitTypes.wind, RankTypes.north),
	new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red), new Tile(SuitTypes.dragon, RankTypes.red),
	new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank), new Tile(SuitTypes.dragon, RankTypes.blank),
	new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green), new Tile(SuitTypes.dragon, RankTypes.green)];

/**
 * An includes() array method using deep equality for objects contained in the array
 * @param element: an object
 * @returns	true if the array includes an element which is deep equal to the specified object
 */
Object.defineProperty(Array.prototype, 'deepIncludes', {
	value: function (element) {
		for (let i = 0; i < this.length; i++) {
			if (isEqual(this[i], element)) {
				return true;
			}
		}
		return false;
	}
})

/**
 * A random shuffle function for an array, implementing the Fisher-Yates algorithm
 * @returns the shuffled array
 */
Object.defineProperty(Array.prototype, 'shuffle', {
	value: function () {
		for (let i = this.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[this[i], this[j]] = [this[j], this[i]];
		}
		return this;
	}
})

/**
 * A class which used in each play game.
 */
class Round{
	players;
	wall; // An array of Tiles. Tiles will always be taken from the end using wall.pop()
	discard = []; // all discard which is open information to every player
	dealer; // int value 0-3
	turn; // int value 0-3, indicating the current players turn (should always be reserved for the player about to draw
	// or the player who needs to discard)
	constructor(players, dealer, tileSet){
		this.players = players;// list of references to players in this game.
		//reset player hands
		for (const p of this.players) {
			p.currentHand = new Hand();
		}
		this.wall = [...tileSet]; // initialize the set of tiles to use
		this.wall.shuffle(); // shuffle the tiles
		this.dealer = dealer; // int value. The dealer for this game. Does not change
		this.turn = dealer; // initial is the dealer
	}

	/**
	 * Calculates the initial starting index for drawing tiles. Note that this does not affect the state of the wall.
	 * @return {number} an int, whose range depends on the number of dice rolled and the length of the wall
	 */
	getInitialDrawIndex() {
		const wallLength = this.wall.length / 8;
		var start = this.players[this.dealer].rollDice();
		return (this.dealer * wallLength) + start;
	}

	/**
	 * Deals the initial hands (13 tiles) to each player
	 */
	dealHands() {
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 13; j++) {
				this.players[i].draw(this.wall.pop());
			}
		}
	}

	/**
	 * Updates the turn counter.
	 */
	nextTurn() {
		if (this.turn < 3) {
			this.turn++;
		} else {
			this.turn = 0;
		}
	}

	/**
	 * Sets the turn counter to a specific turn.
	 * @param turn: 	int value 0-3
	 */
	setTurn(turn) {
		this.turn = turn;
	}

	/**
	 * Adds a tile to the discard list.
	 * @param tile: 	a tile
	 */
	addToDiscard(tile) {
		this.discard.push(tile);
	}

	/**
	 * Retrieves the previously discarded tile.
	 * @return {Tile}:	a tile
	 */
	getLastDiscard() {
		return this.discard[this.discard.length - 1];
	}

	/**
	 * Removes the previously discarded tile from the discard list and returns it.
	 * @return {Tile}:	a tile
	 */
	removeLastDiscard() {
		return this.discard.pop();
	}

	/**
	 * Retrieves the player whose turn it is.
	 * @return {Player}	a Player object
	 */
	getTurnPlayer() {
		return this.players[this.turn];
	}

	/**
	 * Retrieves the indices of the remaining players besides the one corresponding to i.
	 * @return {[int]}	a list of int indices
	 */
	getOtherPlayerIndices(i) {
		let others = [0, 1, 2, 3];
		others.splice(others.indexOf(i), 1);
		return others;
	}

	/**
	 * Conducts a draw for the current player.
	 * @return {Tile}:	the tile drawn from the wall.
	 */
	turnPlayerDraws() {
		const tile = this.wall.pop();
		this.players[this.turn].draw(tile);
		return tile;
	}

	/**
	 * Conducts a discard for the current player and updates the turn counter.
	 * @param tile:	the tile to be discarded from the hand.
	 * @return {Tile}: 	the tile discarded
	 */
	turnPlayerDiscards(tile) {
		this.players[this.turn].discard(tile);
		this.discard.push(tile);
		this.nextTurn();
		return tile;
	}

	/**
	 * Checks whether a specified player can chow the previously discarded tile
	 * @param playerIndex: and int 0-3
	 * @return {boolean}
	 */
	canPlayerChow(playerIndex) {
		if (playerIndex !== this.turn) {
			return false
		}
		return this.players[playerIndex].currentHand.checkChow(this.getLastDiscard());
	}

	/**
	 * Checks whether a specified player can peng the previously discarded tile
	 * @param playerIndex: and int 0-3
	 * @return {boolean}
	 */
	canPlayerPeng(playerIndex) {
		if (this.turn === 0) {
			if (playerIndex === 3) { //they just discarded
				return false;
			}
		} else {
			if (playerIndex === this.turn - 1) { //they just discarded
				return false;
			}
		}
		return this.players[playerIndex].currentHand.checkPeng(this.getLastDiscard());
	}

	/**
	 * Checks whether a specified player can kong the previously discarded tile
	 * @param playerIndex: and int 0-3
	 * @return {boolean}
	 */
	canPlayerDiscardedKong(playerIndex) {
		if (this.turn === 0) {
			if (playerIndex === 3) { //they just discarded
				return false;
			}
		} else {
			if (playerIndex === this.turn - 1) { //they just discarded
				return false;
			}
		}
		return this.players[playerIndex].currentHand.checkKong(this.getLastDiscard());
	}

	/**
	 * Conducts a complete chow action for the player whose turn it is, if possible.
	 * @param otherTiles: an array of other tiles used for the meld
	 * @return {boolean}: True if successful; False if a chow was not possible
	 */
	//TODO: needs testing
	turnPlayerChows(otherTiles) {
		otherTiles.sort((x,y) => {
			if (x.suit === y.suit) {
				return x.rank - y.rank;
			} else {
				return x.suit - y.suit;
			}
		});
		const disc = this.getLastDiscard();
		const possibleChows = Evaluator.getDiscardedChow(this.players[this.turn].currentHand, disc);
		if (possibleChows.deepIncludes(otherTiles)) {
			const candidateMeld = [...otherTiles];
			candidateMeld.push(disc);
			this.removeLastDiscard();
			this.players[this.turn].currentHand.meld(MeldTypes.chow, candidateMeld);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Conducts a complete peng action for the specified player, if possible.
	 * @param playerIndex: an int 0-3
	 * @param otherTiles: an array of other tiles used for the meld
	 * @return {boolean}: True if successful; False if a peng was not possible
	 */
	//TODO: needs testing
	playerPengs(playerIndex, otherTiles) {
		if (this.turn === 0) {
			if (playerIndex === 3) { //they just discarded
				return false;
			}
		} else {
			if (playerIndex === this.turn - 1) { //they just discarded
				return false;
			}
		}
		const disc = this.getLastDiscard();
		const possiblePengs = Evaluator.getDiscardedPeng(this.players[playerIndex].currentHand, disc);
		if (isEqual(possiblePengs, otherTiles)) {
			const candidateMeld = [...otherTiles];
			candidateMeld.push(disc);
			this.removeLastDiscard();
			this.setTurn(playerIndex);
			this.players[playerIndex].currentHand.meld(MeldTypes.peng, candidateMeld);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Conducts a complete kong action for the specified player, if possible.
	 * @param playerIndex: an int 0-3
	 * @param otherTiles: an array of other tiles used for the meld
	 * @return {boolean}: True if successful; False if a kong was not possible
	 */
	playerDiscardedKongs(playerIndex, otherTiles) {
		if (this.turn === 0) {
			if (playerIndex === 3) { //they just discarded
				return false;
			}
		} else {
			if (playerIndex === this.turn - 1) { //they just discarded
				return false;
			}
		}
		const disc = this.getLastDiscard();
		const possibleKong = Evaluator.getDiscardedKong(this.players[playerIndex].currentHand, disc);
		if (isEqual(possibleKong, otherTiles)) {
			const candidateMeld = [...otherTiles];
			candidateMeld.push(disc);
			this.removeLastDiscard();
			this.setTurn(playerIndex);
			this.players[playerIndex].currentHand.meld(MeldTypes.kong, candidateMeld);
			this.turnPlayerDraws();
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Conducts a complete kong action for the player whose turn it is, if possible.
	 * @param tiles: an array of tiles used for the meld
	 * @return {boolean}: True if successful; False if a kong was not possible
	 */
	//TODO: needs testing
	turnPlayerSelfKongs(tiles) {
		if (tiles.length === 1) { //supplement an existing meld
			const addedTile = tiles[0];
			for (const meld of this.players[this.turn].currentHand.melds) {
				if (meld.type === MeldTypes.peng && meld.suit === addedTile.suit && meld.ranks.includes(addedTile.rank)) {
					meld.type = MeldTypes.kong;
					meld.ranks.push(addedTile.rank);
					this.players[this.turn].currentHand.removeTile(addedTile);
					this.turnPlayerDraws();
					return true;
				}
			}
			return false;
		} else if (tiles.length === 4 && tiles[0].equals(tiles[1]) && tiles[1].equals(tiles[2]) && tiles[2].equals(tiles[3])) {
			//reveal a concealed kong
			if (this.players[this.turn].currentHand.inPlayTiles[tiles[0].suit][tiles[0].rank] === 4) {
				this.players[this.turn].currentHand.meld(MeldTypes.kong, tiles);
				this.turnPlayerDraws();
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	//Outdated methods. I'll leave for now, but the code below is not in use.

	//Seems fine, but unnecessary to create a new tile set every round. Tile set has been moved to a constant object
	//	above.
	/**
	 * Create all tiles by using Tile class and store in tiles list
	 */
	generateTiles(){
		// Create bamboo, dot, character tiles
		for(var i = 0;i < 3;i++){               // suit
			for(var j = 0;j < 9;i++){           // rank
				for (var x = 0;x < 4;x++){      // amount
					var newTile = new Tile(i,j);
					this.tiles.push(newTile);
				}
			}
		}
		// Create wind tiles
		for (var i = 0;i < 4;i++){              // rank
			for (var x = 0;x < 4;x++){          // amount
				var newTile = new Tile(3,i);
				this.tiles.push(newTile);
			}
		}
		// Create dragon tiles
		for (var i = 0;i < 3;i++){               // rank
			for (var x = 0;x < 4;x++){           // amount
				var newTile = new Tile(4,i);
				this.tiles.push(newTile);
			}
		}
	}

	//walls are generated upon initialization of the round
	/**
	 * Generate four walls and store in walls list
	 */
	generateWall(){
		// Shuffle all the tiles
		shuffle(this.tiles);
		var count=0;
		// Split the tiles into for walls
		for(var i = 0;i < 4;i++){
			var currentWall = this.tiles.slice(count,count+34);
			this.walls.push(currentWall);
			count=count+34;
		}
	}

	//functionality abstracted to two separate methods above (initialDrawIndex(), loadHands())
	/**
	 * Load the initial hands for four players
	 */
	loadHand(){
		// Start from the number which the dealer roll the dice
		var start = this.players[dealer].rollDice();
		var grab = this.dealer;
		// To make it simple, each player grab 13 tiles and then next player can grab.
		// Since the walls are build with randomly shuffle tiles, so this won't affect the fairness.
		for(var i = 0;i < 4;i++){			// Four player grab their tiles
			for(var j = 0;j < 13;j++){		// Every player grab 13 tiles
				if(start < walls[grab].length){
					this.player[i].addTile(walls[grab][start].rank,walls[dealer][start].suit);
					start++;
				}
				else{
					start = 0;
					grab++;
					this.player[i].addTile(walls[grab][start].rank,walls[dealer][start].suit);
				}

			}
		}
		this.nextTile = [grab,start]; // The one should be draw
	}

	//Not sure why/how the code below works, I'll leave for now, but this definitely needs to be explained more or
	//	tested.

	/** 
	 * Determine which tile is the next draw tile 
	 * @param turn: an int value which indicate who's turn now
	 */
	isDraw(turn){
		if(this.nextTile[1] < walls[this.nextTile[0]].length){
			this.player[turn].draw(walls[this.nextTile[0]][this.nextTile[1]]);
			this.nextTile[1]++;
		}
		else{
			this.nextTile[1] = 0;
			this.nextTile[0]++;
			this.player[turn].draw(walls[this.nextTile[0]][this.nextTile[1]]);
		}
		this.turn++;
	}	

	/** 
	 * Add the discard in the discard list
	 * @param turn: an int value which indicate who's turn now
	 */
	isDiscard(turn){
		turn = turn%4;
		this.discard.push(this.player[turn].discard())
	}
	/** 
	 * Change the turn to the player who pung or gang
	 * @param player: a player object who pung
	 */
	isPung(player){
		this.turn = this.player.indexOf(player)
	}

}

exports.SMRTiles = SMRTiles;
exports.Round = Round;