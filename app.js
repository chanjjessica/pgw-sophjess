const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('cookie-session');

const app = express();
const http =require('http');
const { isObject } = require('underscore');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
//const { v4: uuidv4 } = require('uuid');
const sharedsession = require("express-socket.io-session");
const favicon = require('serve-favicon');
const bodyParser = require("body-parser");

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
// app.use(express.urlencoded({ extended: true })); // took out temporarily
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  app.use(bodyParser.json());

// Express session
var sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  });
app.use(sessionMiddleware);
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});
io.use(sharedsession(sessionMiddleware, {
    autoSave:true
})); 
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

app.use( express.static( "public" ) );
app.use(favicon(__dirname + '/favicon.ico'));


// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// --------------------------- Routes -------------------------
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use(express.static('node_modules'));
app.use(express.static('ui'));

const PORT = process.env.PORT || 5000;

app.get('/about', function(req, res) {
    res.render('about');
})

app.get('/game_:room', (req, res) => {
	if('passport' in req.session===false){
		res.redirect('/');
	}
	else{
		res.sendFile(__dirname + '/ui/client.html');
	}
    
})

// --------------------------- Server Logic --------------------------

/**
 * REQUIRED that you read:
 *      1) the PDF that Abhay posted in the #summer2020 channel
 *      2) the planning document (Client-side UI Requirements) in the front-end folder of Google Drive
 *
 * Keep in mind that the general logic flow on the server-side is very similar to a model-view-controller pattern:
 *      1) Receive input from client (controller)
 *      2) Update the game state (model)
 *      3) Update the client's data (view)
 *
 * Also keep the following considerations in mind when designing your listeners (ignore 2 for alpha):
 *      1) Security: send ONLY the information the client needs to know.
 *      2) Bandwidth: send the MINIMAL amount of data necessary across the connection.
 *      3) Synchronicity: each listener should be synchronous within itself, but not necessarily across listeners.
 */

const Player = require('./src/player').Player;
const Game = require('./src/game.js').Game;
const Evaluator = require('./src/evaluator.js').Evaluator;
const Tile = require('./src/meld').Tile;
const Meld = require('./src/meld').Meld;
const MeldTypes = require('./src/meld.js').MeldTypes;
const ScoreState = require('./src/score.js').ScoreState;
const ClaimTypes = Object.freeze({none:0, chow:1, peng:2, kong: 3, hu: 4});
const turnTime = 15; // 15 second timer

let clients = [];
const rooms = {};

const game_state = {};

//TODO: spectators, >4 connections into a room
//TODO: look into reconnection issues: logging on/off mid-game switches order of players?

// ---------------------------------- Helper Functions --------------------------------------

function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return dice1 + dice2;
}

/**
 * Subscribes a socket to a gameroom
 * @param socket    a socket.io instance
 * @param room  a room instance
 */
const joinRoom = (socket, room,customID) => {
    if(room!==undefined){
        room.players.push(socket);
        room.game.seatPlayer(new Player(room.players.length, 'username', 0));
        room.players_uid.push(customID);
        socket.join(room.id, () => {
            // store the room id in the socket for future use
            socket.roomId = room.id;
            //console.log(socket.id, "Joined", room.id);
        });
    }
    else{
        console.log('room does not exist');
    }
};

function getOpenRooms() {
    const roomNames = [];
    for (const id in rooms) {
        const room = { id: id, numPlayers: rooms[id].players.length };
        if (room.numPlayers < 4){
            roomNames.push(room);
        }
    }
    return roomNames;
}

// Starts a timer after which claims are evaluated
/**
 * Begins a timer during which players can lay claim to the previously discarded tile; sends the server-synced time
 *      to the clients every second
 * @param roomId    the gameroom id
 */
function setTimer(roomId) {
    const room = rooms[roomId];
    room.currentClaims = [0, 0, 0, 0];
    let sec = turnTime;
    var timer = setInterval(function(){
        io.to(roomId).emit('turn-timer', sec);
        if (sec === 0){
            clearInterval(timer);
            room.timerElapsed = true;
            executeGreatestClaim(roomId);
        }
        sec--;
    }, 1000);
}

// Registers a claim to a discarded tile
/**
 * Registers a claim to a discarded tile; claims to be executed at the end of a timer
 * @param roomId    the gameroom id
 * @param playerIndex   the index of the playing performing the claim within their gameroom
 * @param claimType     an int corresponding to a type of claim
 * @return {boolean}    true if the action is registered
 */
function registerClaim(roomId, playerIndex, claimType) {
    rooms[roomId].currentClaims[playerIndex] = claimType;
    //console.log('claims: ' + rooms[roomId].currentClaims);
    return true;
}

// Performs the greatest claim
/**
 * Performs the claim action with the highest priority: hu > peng/kong > chow > draw
 * @param roomId    the gameroom id
 */
function executeGreatestClaim(roomId) {
    const room = rooms[roomId];
    //console.log('end timer');
    //console.log(room.currentClaims);
    const tile = room.rnd.getLastDiscard();
    room.timerElapsed = true;
    let maxIndices = [];
    let greatestClaim = ClaimTypes.none;
    for (let i = 0; i < 4; i++) {
        if (room.currentClaims[i] > greatestClaim) {
            maxIndices = [i];
            greatestClaim = room.currentClaims[i];
        } else if (room.currentClaims[i] === greatestClaim) {
            maxIndices.push(i);
        }
    }
    if (greatestClaim === ClaimTypes.none) {
        //do nothing, disable all options for non-turn players
        for (let i = 0; i < room.players.length; i++) {
            let actions = [false, false, false, false, false, false];

            if (i === room.rnd.turn && room.hasDrawn) {
                actions[0] = true;
                actions[1] = room.rnd.players[i].currentHand.checkChow(tile);
                actions[2] = room.rnd.players[i].currentHand.checkPeng(tile);
                actions[3] = room.rnd.players[i].currentHand.checkKong(tile);
                actions[4] = room.rnd.players[i].currentHand.checkWin(tile);
                // Draw tile
                executeDraw(roomId);
            }

        }
    } else if (greatestClaim === ClaimTypes.chow) { //chow
        const chowArray = executeChow(roomId);

        for (let i = 0; i < room.players.length; i++) {
            if (i === room.rnd.turn) {
                let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

                const chowPayload = { hand : room.rnd.players[room.rnd.turn].currentHand, actions : actions };
                io.to(room.players[i].id).emit('chow', chowPayload);
            } else {
                let actions = [false, false, false, false, false, false];
                const chowPayloadOthers = { agent : room.rnd.turn+1, chow : new Meld(MeldTypes.chow, chowArray), actions: actions };
                io.to(room.players[i].id).emit('chow-others', chowPayloadOthers);
            }
        }
    } else if (greatestClaim === ClaimTypes.peng) { //peng
        const pengArray = executePeng(roomId, maxIndices[0]);

        for (let i = 0; i < room.players.length; i++) {
            if (i === room.rnd.turn) {
                let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

                const pengPayload = { hand : room.rnd.players[i].currentHand, actions : actions, turn: room.rnd.turn+1 };
                io.to(room.players[i].id).emit('peng', pengPayload);
            } else {
                let actions = [false, false, false, false, false, false];

                const pengPayloadOthers = { agent : room.rnd.turn+1, peng : new Meld(MeldTypes.peng, pengArray), turn: room.rnd.turn+1, actions: actions  };
                io.to(room.players[i].id).emit('peng-others', pengPayloadOthers);
            }
        }
    } else if (greatestClaim === ClaimTypes.kong) {
        const kongArray = executeDiscardedKong(roomId, maxIndices[0]);

        for (let i = 0; i < room.players.length; i++) {
            if (i === room.rnd.turn) {
                let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

                const kongPayload = { hand : room.rnd.players[i].currentHand, actions : actions, turn: room.rnd.turn+1 };
                io.to(room.players[i].id).emit('kong', kongPayload);

            } else {
                let actions = [false, false, false, false, false, false];

                const kongPayloadOthers = { agent : room.rnd.turn+1, kong : new Meld(MeldTypes.kong, kongArray, false), turn: room.rnd.turn+1, actions: actions };
                io.to(room.players[i].id).emit('kong-others', kongPayloadOthers);
            }
        }
    } else if (greatestClaim === ClaimTypes.hu) {
        const winTile = room.rnd.removeLastDiscard();

        for (const maxIndex of maxIndices) {
            const winningMelds = Evaluator.getWinningMelds(room.rnd.players[maxIndex].currentHand, winTile);
            const winScore = new ScoreState(winningMelds, false, false);
            winScore.checkAllFan().assignScore();
            room.game.players[maxIndex].totalScore += winScore.totalScore;
            room.game.players[maxIndex].currentHand.inPlayTiles = Array.from(Array(5), _ => Array(9).fill(0));
            room.game.players[maxIndex].currentHand.melds = winningMelds;
        }

        const huPayload = { won: maxIndices[0]+1, p1Hand : room.game.players[0].currentHand,
            p2Hand : room.game.players[1].currentHand,
            p3Hand : room.game.players[2].currentHand,
            p4Hand : room.game.players[3].currentHand,
            p1Score : room.game.players[0].totalScore,
            p2Score : room.game.players[1].totalScore,
            p3Score : room.game.players[2].totalScore,
            p4Score : room.game.players[3].totalScore}

        //send all hands to everybody
        io.to(roomId).emit('hu', huPayload);
    }
}

/**
 * Calculates a random starting location to draw tiles from
 * @param roomId    the gameroom id
 * @return {number}
 */
function rollForDrawLocation(roomId){
    let r = rooms[roomId].game.players[rooms[roomId].dealer].rollDice();
    return 16 - r;
}

/**
 * Performs a draw action or triggers end-of-game evaluation if cannot draw; sends appropriate payload within gameroom
 * @param roomId    the gameroom id
 */
function executeDraw(roomId){
    const room = rooms[roomId];

    if (room.rnd.wall.length === 0) {
        endByExhaustion(roomId);
    } else {
        const i = room.rnd.turn;
        //console.log(i);
        //current player
        const nextTile = room.rnd.wall.pop();
        room.rnd.players[i].draw(nextTile);
        //[cannot draw, cannot chow, cannot peng, check if able to kong, check if able to win, can discard]  --> cannot kong for now, need to implement meld selection to allow it
        let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

        let drawPayload = {
            newTile: nextTile,
            actions: actions,
            discardList: room.rnd.discard,
            hand: room.rnd.players[i].currentHand,
            wallLength: room.rnd.wall.length
        };

        for (let j = 0; j < room.players.length; j++) {
            if (j === i) {
                io.to(room.players[j].id).emit('draw', drawPayload)
            } else {
                //send draw message to remaining players
                io.to(room.players[j].id).emit('draw-others', i + 1);
            }
        }
        room.hasDrawn = true;
    }
}

/**
 * Performs a chow from the previously discarded tile
 * @param roomId    the gameroom id
 * @return      an array of tiles?
 */
function executeChow(roomId) {
    const room = rooms[roomId];
    const chowArray = room.playerDiscardData[room.rnd.turn];
    let tile = room.rnd.removeLastDiscard();
    room.rnd.players[room.rnd.turn].currentHand.addTile(tile);
    room.rnd.players[room.rnd.turn].currentHand.meld(MeldTypes.chow, chowArray);
    room.hasMelded = true;
    return chowArray;
}

/**
 * Performs a peng from the previously discarded tile
 * @param roomId    the gameroom id
 * @param playerIndex   the index of the player performing the peng within their game
 * @return      an array of tiles?
 */
function executePeng(roomId, playerIndex) {
    const room = rooms[roomId];
    const pengArray = room.playerDiscardData[playerIndex];
    room.rnd.setTurn(playerIndex);
    let tile = room.rnd.removeLastDiscard();
    room.rnd.players[playerIndex].currentHand.addTile(tile);
    room.rnd.players[playerIndex].currentHand.meld(MeldTypes.peng, pengArray);
    room.hasMelded = true;
    return pengArray;
}

/**
 * Performs a kong from the previously discarded tile
 * @param roomId    the gameroom id
 * @param playerIndex   the index of the player performing the kong within their game
 * @return {[*, *, *]|[]}   an array of tiles
 */
function executeDiscardedKong(roomId, playerIndex) {
    const room = rooms[roomId];
    let tile = room.rnd.removeLastDiscard();
    const kongArray = Evaluator.getDiscardedKong(room.rnd.players[playerIndex].currentHand, tile);
    kongArray.push(tile);
    room.rnd.setTurn(playerIndex);
    room.rnd.players[playerIndex].currentHand.addTile(tile);
    room.rnd.players[playerIndex].currentHand.meld(MeldTypes.kong, kongArray);
    room.rnd.turnPlayerDraws();
    room.hasMelded = true;
    return kongArray;
}

/**
 * Calculates hand scores and sends a 'hu' payload corresponding to the end of game by lack of tiles
 * @param roomId    the gameroom id
 */
function endByExhaustion(roomId) {
    const room = rooms[roomId];
    let ready = [false, false, false, false];
    let winningScore = [0, 0, 0, 0];
    let numVoidedSuits = [0, 0, 0, 0];
    for (let i = 0; i < clients.length; i++) {
        const playerHand = room.game.players[i].currentHand;
        //check all tiles for ready state
        for (let s = 0; s < SuitTypes.length; s++) {
            let max = RankTypes.length;
            if (s === SuitTypes.wind) {
                max = 4;
            } else if (s === SuitTypes.dragon) {
                max = 3;
            }
            for (let r = 0; r < max; r++) {
                const winMelds = Evaluator.getWinningMelds(playerHand, new Tile(s, r));
                if (winMelds > 0) { // this player can win
                    ready[i] = true;
                    // score the hand and keep the worst possible score
                    const ss = new ScoreState(winMelds);
                    ss.checkAllFan().assignScore();
                    if (ss.totalScore < winningScore[i] || winningScore[i] === 0) {
                        winningScore[i] = ss.totalScore;
                    }
                }
            }
        }
        for (let s = 0; s < 3; s++) {
            let hasSuit = false;
            if (playerHand.inPlayTiles.slice(s).reduce((a,b) => { return a + b}, 0) === 0) { // voided in free tiles
                for (const mld of playerHand.melds) {
                    if (mld.suit === s) {
                        hasSuit = true;
                    }
                }
            }
            if (!hasSuit) {
                numVoidedSuits[i] += 1;

            }
        }
    }

    if (ready.getAllOccurrences(true).length > 0) { //somebody can win, give them the lowest scoring win
        for (const i of ready.getAllOccurrences(true)) {
            room.game.players[i].totalScore += winningScore[i];
        }
    } else { //award points to player with most voided suits
        let mostVoid = 0;
        let pIndices = [];
        for (let j = 0; j < numVoidedSuits.length; j++) {
            if (numVoidedSuits[j] > mostVoid) {
                mostVoid = numVoidedSuits[j];
                pIndices = [j];
            } else if (numVoidedSuits[j] === mostVoid) {
                pIndices.push(j);
            }
        }
        if (mostVoid > 0) {
            for (const i of pIndices) { //assign points for minor elements: voided suits, dragon p/k, concealed/double peng, concealed/melded kong, tile hog
                const playerHand = room.game.players[i].currentHand;
                let score = mostVoid;

                let dragonPK = 0;
                let concealedPengs = 0;
                let meldedKongs = 0;
                let concealedKongs = 0;
                let tileHogs = 0;
                let pengRanks = [];
                let meldTiles = Array.from(Array(5), _ => Array(9).fill(0));

                // check pre-melded sets
                for (const mld of playerHand.melds) {
                    if (mld.type === MeldTypes.kong) {
                        meldedKongs += 1;
                        if (mld.suit === SuitTypes.dragon) {
                            dragonPK += 1;
                        }
                    } else if (mld.type === MeldTypes.peng) {
                        if (mld.suit === SuitTypes.dragon) {
                            dragonPK += 1;
                        } else if (mld.suit !== SuitTypes.wind) {
                            pengRanks.push(mld.ranks[0]);
                        }
                    }
                    for (const r of mld.ranks) {
                        meldTiles[mld.suit][r] += 1;
                    }
                }

                //check free tiles
                for (let s = 0; s < SuitTypes.length; s++) {
                    for (let r = 0; r < RankTypes.length; r++) {
                        if (playerHand.inPlayTiles[s][r] === 4) {
                            concealedKongs += 1;
                            if (s < 3) {
                                pengRanks.push(r)
                            } else if (s === SuitTypes.dragon) {
                                dragonPK += 1;
                            }
                        } else if (playerHand.inPlayTiles[s][r] === 3) {
                            concealedPengs += 1;
                            if (s < 3) {
                                pengRanks.push(r)
                            } else if (s === SuitTypes.dragon) {
                                dragonPK += 1;
                            }
                            if (meldTiles[s][r] === 1) {
                                tileHogs += 1;
                            }
                        }
                    }
                }

                const uniqueRanks = [...new Set(pengRanks)];
                let doublePeng = false;
                if (uniqueRanks.length < pengRanks) {
                    doublePeng = true;
                }

                if (doublePeng) { // #21
                    score += 2;
                }
                if (concealedPengs > 2) { // #22
                    score += 2;
                }

                score += dragonPK;
                score += 2 * tileHogs; // #20
                score += 2 * concealedKongs; // #23
                score += meldedKongs; // #25

                room.game.players[i].totalScore += score;
            }
        }
    }


    const endPayload = { won: -1, p1Hand : room.game.players[0].currentHand,
        p2Hand : room.game.players[1].currentHand,
        p3Hand : room.game.players[2].currentHand,
        p4Hand : room.game.players[3].currentHand,
        p1Score : room.game.players[0].totalScore,
        p2Score : room.game.players[1].totalScore,
        p3Score : room.game.players[2].totalScore,
        p4Score : room.game.players[3].totalScore}

    io.to(roomId).emit('hu', endPayload);
}

/**
  * Creates a short room ID code.
  * @param {*} length   the desired length of the code
  */
 function generateRoomID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

//----------------------- Event Listeners -----------------------------

io.on('connection', (socket) => {

    //Any initial functions here are the server's response to registering a new Socket (client) connection

    //server logs new connection by printing to console
    //console.log('client ' + socket.id + ' has connected');

    // Unique ID from DB
    var customID = socket.request.session.passport.user;

    //console.log('customID;',customID);

    //add new socket to list of current clients connected
    clients.push(socket.id);
    //console.log(clients);

    // Creates a new game room with game instance variables
    socket.on('createRoom', (roomName, callback) => {
        var rid = generateRoomID(6); // uuidv4();
        const room = {
            id: rid, // generate a unique id for the new room, that way we don't need to deal with duplicates.
            players: [],
            players_uid: [],
            game: new Game(rid),
            dice: [0,0,0,0],
            max : -Infinity,
            maxIndices : [],

            player_action : [{},{},{},{}],

            rnd : 0,
            rolled : 0,
            startRnd : 0,
            dealer : 0,
            currentClaims : [0, 0, 0, 0],
            timerElapsed : true,
            hasDrawn : false,
            hasMelded : false,
            playerDiscardData : [[], [], [], []]
        };
        rooms[room.id] = room;
        callback(room.id);
    });

    //Unused at the moment (returns the list of available game rooms)
    socket.on('getRoomNames', (callback) => {
        const roomNames = [];
        for (const id in rooms) {
            //const {name} = rooms[id];
            const room = { id: id, numPlayers: rooms[id].players.length };
            if (room.numPlayers < 4){
                roomNames.push(room);
            }

        }

        callback(roomNames);
    });

    socket.on('getOpenRooms', () => {
        socket.emit('updateRoomList', getOpenRooms());
    })

    socket.on('validateRoom', (roomId) => {
        const roomExists = rooms.hasOwnProperty(roomId);
        if (roomExists) {
            if (rooms[roomId].players.length < 4) {
                socket.emit('allowJoin', roomId);
            } else {
                socket.emit('roomFull');
            }
        } else {
            socket.emit('roomNotExists');
        }
    })

    socket.on('joinRoom', (roomId,callback) => {
        const room = rooms[roomId];
        callback(roomId);
    });

    socket.on('join',(roomId,callback) => {
        const room = rooms[roomId];
        //console.log(game_state);
        var key=JSON.stringify([customID,roomId]);

        //TODO: fix to check if room.players_uid exists

        //console.log('if press exit the room before:',key in game_state);
        //console.log('if customID in room:',room.players_uid.includes(customID))
        // Game started and rejoin the gameroom with same state
        if (key in game_state){
            room.players[game_state[key].status.player-1] = socket;
            socket.join(room.id, () => {
                socket.roomId = room.id;
            });
            socket.emit('resume',game_state[key]);
            delete game_state[key];

        }
        // resume state after reload page 
        else if (room.players_uid.includes(customID)){
            let i = room.players_uid.indexOf(customID);
            //console.log('join: '+i);
            //console.log('current room player: '+room.players.length);
            room.players[i]=socket;
            socket.join(room.id, () => {
                socket.roomId = room.id;
            });
            //console.log(room.player_action[i]);
            socket.emit('resume',{status:room.player_action[i]});

        }
        // first join the room
        else{

            joinRoom(socket, room,customID);
            socket.emit('connect message', room.players.length);
            //console.log(socket.roomId);
            callback(roomId);
        }
        io.emit('updateRoomList', getOpenRooms())
    })
    // record state while updates from client
    socket.on('action',(data)=>{
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);
        room.player_action[i]=data;
    })

    // Roll the dice to find the dealer
    socket.on('rollDice',()=>{
        //console.log(socket.roomId);
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);
        room.dice[i] = rollDice();
        if (room.dice[i] > room.max) {
            room.max = room.dice[i];
            room.maxIndices = [i];
        } else if (room.dice[i] === room.max) {
            room.maxIndices.push(i);
        }
        room.rolled++;
        socket.emit('diceTotal', room.dice[i]);
        // If everybody rolled
        if (room.rolled === 4 && room.maxIndices.length > 1) {
            // If there are more than 1 player has same max number
            io.to(socket.roomId).emit('tie', room.maxIndices);

            for (let j = 0; j < room.dice.length; j++) {
                if (room.maxIndices.includes(j)) {
                    room.dice[j] = 0;
                    room.rolled--;
                } else {
                    room.dice[j] = -1;
                }
            }
            room.maxIndices = [];
            room.max = -Infinity;
        } else if (room.maxIndices.length === 1 && room.rolled === 4){
            io.to(socket.roomId).emit('dealer', room.maxIndices[0]+1);
            // Roll for Draw Location:
            let drawLoc = rollForDrawLocation(socket.roomId);
            // Start Round
            room.game.startRound();
            room.rnd = room.game.currentRound;
            room.rnd.dealHands();

            //console.log('round has started');
            // tell each client their hand, the wall length, their action booleans: [draw, chow, peng, kong, hu, discard]
            for (let i = 0; i < room.players.length; i++) {
                let actions = [false, false, false, false, false, false];
                if (i === room.maxIndices[0]){
                    //actions[0] = true;
                }
                let startPayload = { hand : room.game.players[i].currentHand, wallLength : room.rnd.wall.length, actions : actions, drawLocation: drawLoc, dealer: room.maxIndices[0]+1 };
                io.to(room.players[i].id).emit('start', startPayload);
            }
            room.rnd.turn = room.maxIndices[0];
            room.dealer = room.rnd.turn;
            executeDraw(socket.roomId);
        }
    })

    //Used for later rounds where there is no roll before starting
    socket.on('start', () => {
        const room = rooms[socket.roomId];
        room.startRnd++;
        if (room.startRnd === 4) {
            if (room.dealer === 3) {
                room.dealer = 0;
            }
            else {
                room.dealer++;
            }
            io.to(socket.roomId).emit('dealer', room.dealer);
            let drawLoc = rollForDrawLocation(socket.roomId);
            room.game.startRound();
            room.rnd = room.game.currentRound;
            room.rnd.dealHands();
            room.rnd.turn = room.dealer;
    
            //console.log('round has started');
            // tell each client their hand, the wall length, their action booleans: [draw, chow, peng, kong, hu, discard]
            for (let i = 0; i < room.players.length; i++) {
                let actions = [false, false, false, false, false, false];
                if (i === room.dealer){ actions[0] = true; }
                let startPayload = { hand : room.game.players[i].currentHand, wallLength : room.rnd.wall.length, actions : actions, turn: room.rnd.turn+1, drawLocation: drawLoc, dealer: room.dealer+1 };
                io.to(room.players[i].id).emit('start', startPayload);
            }
            executeDraw(socket.roomId);
        }

    });

    //player <i> selects a tile (not for discarding)
    socket.on('select-tiles', (data) => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);
        let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), false];
        let tiles = [];
        let d = null;
        if (data.discard !== null){
            d = new Tile(data.discard[0], data.discard[1]);
            //console.log('Discarded tile sent: ', d);
        }
        for (const t of data.selected){ 
            tiles.push(new Tile(t[0], t[1]));
        }
        if (room.rnd.turn === i){
            // If you can draw
            if (!data.isDiscarding){
                actions[0] = true;
            }
            
            // In hand kong
            if (data.selected.length === 4 && data.isDiscarding && Evaluator.canKong(tiles[0], tiles[1], tiles[2], tiles[3])){
                actions[3] = true;
            }
            // chow
            else if (data.selected.length === 2 && d !== null && Evaluator.canChow(d, tiles[0], tiles[1])){
                actions[1] = true;
            }
        }
        
        if (!room.timerElapsed || room.rnd.turn === i){
            // Peng
            if (data.selected.length === 2 && d !== null && Evaluator.canPeng(d, tiles[0], tiles[1])){
                actions[2] = true;
            }
            // Discard kong
            else if (data.selected.length === 3 && d !== null && Evaluator.canKong(d, tiles[0], tiles[1], tiles[2])){
                actions[3] = true;
            }
        }
        socket.emit('evaluate-selections', actions); 
    });

    //player <i> draws a tile
    socket.on('draw', () => {
        const room = rooms[socket.roomId];
        if (room.timerElapsed){
            executeDraw(socket.roomId);
        }
        else {
            room.hasDrawn = true;
        }
    });

    //player <i> discards a tile
    socket.on('discard', (data) => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);

        //extract data from client

        const discarded = new Tile(data[0][0], data[0][1]);

        room.rnd.addToDiscard(discarded);
        room.rnd.players[i].discard(discarded);
        //check all hand states, update turn state
        const claimablePlayerIndices = room.rnd.getOtherPlayerIndices(room.rnd.turn);
        room.rnd.nextTurn();
        //for each client player, send the discarded tile and a set of booleans: {draw, chow, peng, kong, hu, discard}
        for (const index of claimablePlayerIndices) {

            //assume cannot draw, assume cannot chow, check if able to peng, check if able to kong, check if able to win, cannot discard
            let actions = [false, false, false, false, room.rnd.players[index].currentHand.checkWin(discarded), false];
            //if it is the player's turn, update draw and check for chow

            if (index === room.rnd.turn) {
                actions[0] = true;
            }
            const discardPayload = { discard : discarded, actions : actions, turn: room.rnd.turn+1 };
            io.to(room.players[index].id).emit('discard', [i+1,discardPayload]);
        }
        //Changed payload
        let playerActions = [false, false, false, false, false, false];
        let afterPayload = { hand: room.rnd.players[i].currentHand, actions: playerActions, discard: discarded, turn: room.rnd.turn+1}
        socket.emit('after-discard-hand', afterPayload);
        //console.log('start timer');
        room.timerElapsed = false;
        room.hasDrawn = false;
        room.hasMelded = false;
        setTimer(socket.roomId);
    })

    //player <i> chows
    socket.on('chow', (data) => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);

        // create tile obj from client data
        let curTile = new Tile(data.discard[0],data.discard[1]);
        let a = new Tile(data.selected[0][0], data.selected[0][1]);
        let b = new Tile(data.selected[1][0], data.selected[1][1]);
        room.playerDiscardData[i] = [curTile, a, b];

        if (!room.timerElapsed){
            registerClaim(socket.roomId, i, ClaimTypes.chow); // register claim
        }
        else {

        let chowArray = executeChow(socket.roomId);

        //can draw, cannot chow, cannot peng, check if able to kong, check if able to win, can discard
        let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

        const chowPayload = { hand : room.rnd.players[i].currentHand, actions : actions };
        io.to(room.players[i].id).emit('chow', chowPayload);

        //for the remaining players, notify them of who performed the chow and what tiles were revealed; their actions do not change
        const chowPayloadOthers = { agent : i+1, chow : new Meld(MeldTypes.chow, chowArray, false)  };
        socket.broadcast.to(socket.roomId).emit('chow-others', chowPayloadOthers);
        }
    })

    //player <i> pungs
    socket.on('peng', (data) => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);
        
        let curTile;
        if (data.selected.length === 3){
            curTile = new Tile(data.selected[0], data.selected[1]);
        }
        else {
            curTile = new Tile(data.discard[0],data.discard[1]);
        }
        room.playerDiscardData[i] = [curTile, curTile, curTile];
        if (!room.timerElapsed){
            registerClaim(socket.roomId, i, ClaimTypes.peng);
        }
        else if (room.rnd.turn === i){
        
            let pengArray = executePeng(socket.roomId, i);

            //cannot draw, cannot chow, cannot peng, check if able to kong, check if able to win, can discard
            let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

            const pengPayload = { hand : room.rnd.players[i].currentHand, actions : actions};
            io.to(room.players[i].id).emit('peng', pengPayload);

            //for the remaining players, notify them of who performed the peng and what tiles were revealed; their actions do not change
            const pengPayloadOthers = { agent : i+1, peng : new Meld(MeldTypes.peng, pengArray, false) };
            socket.broadcast.to(socket.roomId).emit('peng-others', pengPayloadOthers);
        }
    })

    //player <i> kongs
    socket.on('kong', (data) => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);

        let kongArray = data.selected;
        let concealed = false;
        // In hand kong
        if (data.selected.length === 4 && room.rnd.turn === i){
            if (!room.rnd.players[i].currentHand.pengToKong(data.selected[0][0], data.selected[0][1])){
                // if not from peng, then from hand and concealed
                concealed = room.rnd.players[i].currentHand.concealedKong(data.selected[0][0], data.selected[0][1]);
            }
            //have player draw another tile
            const nextTile = room.rnd.wall.pop();
            room.rnd.players[i].draw(nextTile);
        
            //cannot draw, cannot chow, cannot peng, cannot kong, check if able to win, can discard
            let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

            const kongPayload = { hand : room.rnd.players[i].currentHand, actions : actions};
            io.to(room.players[i].id).emit('kong', kongPayload);
        
            //for the remaining players, notify them of who performed the kong and what tiles were revealed; their actions do not change
            const kongPayloadOthers = { agent : i+1, kong : new Meld(MeldTypes.kong, kongArray, concealed) };
            socket.broadcast.to(socket.roomId).emit('kong-others', kongPayloadOthers);
        }

        else {
            let curTile = new Tile(data.discard[0], data.discard[1]);

            if (!room.timerElapsed){
                registerClaim(socket.roomId, i, ClaimTypes.kong);
            }
            else if (room.rnd.turn === i){
                kongArray = executeDiscardedKong(socket.roomId, i);
                //cannot draw, cannot chow, cannot peng, cannot kong, check if able to win, can discard
                let actions = [false, false, false, false, room.rnd.players[i].currentHand.checkWin(), true];

                const kongPayload = { hand : room.rnd.players[i].currentHand, actions : actions};
                io.to(room.players[i].id).emit('kong', kongPayload);
        
                //for the remaining players, notify them of who performed the kong and what tiles were revealed; their actions do not change
                const kongPayloadOthers = { agent : i+1, kong : new Meld(MeldTypes.kong, kongArray, concealed) };
                socket.broadcast.to(socket.roomId).emit('kong-others', kongPayloadOthers);
            }
        }

        room.hasDrawn = true;
        
    });


    //player <i> hus
    socket.on('hu', () => {
        const room = rooms[socket.roomId];
        let i = room.players.indexOf(socket);

        if (room.hasDrawn || room.hasMelded) { // self-hu
            let winningMelds = Evaluator.getWinningMelds(room.rnd.players[i].currentHand);
            const winScore = new ScoreState(winningMelds, !room.hasMelded, false);
            winScore.checkAllFan().assignScore();
            room.game.players[i].totalScore += winScore.totalScore;
            room.game.players[i].currentHand.inPlayTiles = Array.from(Array(5), _ => Array(9).fill(0));
            room.game.players[i].currentHand.melds = winningMelds;
            const huPayload = { won: i+1, p1Hand : room.game.players[0].currentHand,
                p2Hand : room.game.players[1].currentHand,
                p3Hand : room.game.players[2].currentHand,
                p4Hand : room.game.players[3].currentHand,
                p1Score : room.game.players[0].totalScore,
                p2Score : room.game.players[1].totalScore,
                p3Score : room.game.players[2].totalScore,
                p4Score : room.game.players[3].totalScore}
            //send all hands to everybody
            io.to(socket.roomId).emit('hu', huPayload);
        } else {
            registerClaim(socket.roomId, i, ClaimTypes.hu);
        }
    })


    // record the state when client leave during game
    socket.on('record',(data)=>{
        if(socket.roomId===null){
            //console.log(socket.id,'not in room');
        }else{
            let rid = socket.roomId
            //const room = rooms[rid];
            //let i = room.players.indexOf(socket);
            //console.log('current room:',room.players.length);
            //console.log(data);
            var status=data;
            var key=JSON.stringify([customID,rid]);
            game_state[key] = status;

        }
    })

    //disconnect event, remove connected client from the list
    socket.on('disconnect', () => {
        //console.log('disconnect: '+socket.roomId);
        if(socket.roomId==null){
            let i =clients.indexOf(socket.id);
            clients.splice(i,1);

        }else{
            let rid = socket.roomId
            const room = rooms[rid];
            if (room !== undefined) {
                let i = room.players.indexOf(socket);
                if (room.players.length===4){
                    room.players[i]=-1;
                    //    console.log('leave:'+ i);
                }
                else{
                    room.players.splice(i, 1);
                }
                if(room.players.length===0){
                    delete rooms[rid.toString()];
                }
            }
            //console.log('room.startRnd',room.startRnd);
            
            socket.leave(rid);

            //console.log('after leaving, the remaining player is: '+room.players.length);
            //console.log('client ' + socket.id + ' has disconnected');

            io.to(rid).emit('leave');

            io.emit('updateRoomList', getOpenRooms());

            let j = clients.indexOf(socket.id);
            clients.splice(j,1);
        }
        
    })

});

server.listen(PORT, console.log('Server started on port 5000'));
