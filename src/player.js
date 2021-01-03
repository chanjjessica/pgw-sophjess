const Hand = require('./hand').Hand;

/**
 * A class of each player
 */
class Player {
	currentHand = new Hand(); //a Hand object
	constructor(id, name, points) {
		this.id = id; //player's unique id
		this.name = name; // player's name
		this.points = points; //player's points. Should initial with 0 or the total points in tournament.
	}

	/**
	 * Randomly rolling two dices
	 */
	rollDice() {
		const dice1 = Math.floor(Math.random() * 6) + 1;
		const dice2 = Math.floor(Math.random() * 6) + 1;
		return dice1 + dice2;
	}

	/**
	 * Draw a tile from deck
	 * @param tile: a tile object that the player draw
	 */
	draw(tile) {
		this.currentHand.addTile(tile);
	}

	/**
	 * Discard a tile. Need some more info
	 * @param tile: the tile to discard
	 * @returns a tile that is discard
	 */
	discard(tile) {
		return this.currentHand.removeTile(tile);
	}
	/**
     * Check if a player can peng with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkPeng(tile){
    	return this.currentHand.checkPeng(tile);
    }

    /**
     * Check if a player can kong with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkKong(tile){
        return this.currentHand.checkKong(tile);
    }

    /**
     * Check if a player can chow with this tile
     * @param tile: a tile object that is discard by others
     * @return true if yes,else false
     */
    checkChow(tile){
        return this.currentHand.checkChow(tile);
    }


}



exports.Player = Player;

