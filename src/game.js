const round = require('./round');
const tiles = require('./meld');

/**
 * A class for a whole game
 */
class Game{
	players = []; //players in game
    currentRound = 0; //int specifying which round it is (should strictly increase)

    //example format for a constructor: constructor(params...)
    constructor(gameId) {
        //sets the instance variables defined above
        this.roundNumber = 1; //int of which round it is
        this.dealer = 0; //int 0-3 of who is dealing, corresponds to players index
        this.gameId = gameId; //string specific to this gameroom
    }

    //example function headers for class methods (none of the ones below yet return anything)

    //Constructs an instance of a Round (a mahjong game)
    startRound() {
        //use whatever constructor format is defined in the Round class
        this.currentRound = new round.Round(this.players, this.dealer, round.SMRTiles);
    }

    /**
     * Adds a new player to the game
     * @param newPlayer: a player object that add to this game
	 * @throws error where too many players are connected
     */
    seatPlayer(newPlayer) {
        if (this.players.length < 4) {
            this.players.push(newPlayer);
            return true;
        } else {
            throw new Error('game is already full');
        }
    }

    /**
     * Removes a player from the game
     * @param playerIndex: a player object that leave this game
     */
    unseatPlayer(playerIndex) {
    	if (playerIndex < this.players.length) {
			this.players.splice(playerIndex,1);
			return true;
		} else {
    		throw new Error('player is not in game');
		}
    }

	/**
	 * Updates the dealer counter.
	 */
	nextTurn() {
		if (this.dealer < 3) {
			this.dealer++;
		} else {
			this.dealer = 0;
		}
	}

    /** 
     * Roll dices to determine who is dealer first
     */
	chooseDealer(){
		// Find the index of max number function
		function max(arr){
			var max = -Infinity;
    		var maxIndices = [];
    		for (var i = 0; i < arr.length; i++) {
        		if (arr[i] === max) {
          			maxIndices.push(i);
        		} else if (arr[i] > max) {
            		maxIndices = [i];
            		max = arr[i];
        		}
    		}
    		return maxIndices;
		}
		// Everyone roll the dice first
		var dice = [];
		for (var i = 0; i < 4; i++) {
			dice.push(this.players[i].rollDice())
		}
		// Check if there is a draw, if yes, roll the dice till it break
		var candidate=max(dice);
		while (candidate.length > 1){
			for(var i = 0;i < 4;i++){
				if(!candidate.includes(i)){
					dice[i] = -1;
				}
				else{
					dice[i] = this.players[i].rollDice();
				}
			}
			candidate=max(dice);
		}
		this.dealer=candidate[0];
	}
}

exports.Game = Game;