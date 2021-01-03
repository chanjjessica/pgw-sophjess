
var socket = io();
var website = window.location.pathname;
console.log(website);
var preprocess=website.split("/")[1];
var roomId = preprocess.slice(5,preprocess.length);
console.log(roomId);
if(roomId!==undefined){

    socket.emit('join',roomId,(data)=>{
        console.log(socket.id+' join a room '+data);
    });
    socket.emit('ready')
}


// For displaying hands later on
class HandView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            concealed: this.props.concealed,
            hand: this.props.hand,
            selectedTiles: this.props.selectedTiles
        }
    }


    getLooseTiles = (hand) => {
        let looseTiles = [];
        for (let i = 0; i < hand.inPlayTiles.length; i++){
            for (let j = 0; j < hand.inPlayTiles[i].length; j++){
                for (let k = 0; k < hand.inPlayTiles[i][j]; k++){
                    looseTiles.push([i, j]);
                }
            }
        }
        return looseTiles;
    }

    mapTileToImage = (suit, rank) => {
        let url = 'images/';
        let imageLink;
        if (suit === 0){
            switch (rank){
                case 0: imageLink = 'BAMBOO-1.png'; break;
                case 1: imageLink = 'BAMBOO-2.png'; break;
                case 2: imageLink = 'BAMBOO-3.png'; break;
                case 3: imageLink = 'BAMBOO-4.png'; break;
                case 4: imageLink = 'BAMBOO-5.png'; break;
                case 5: imageLink = 'BAMBOO-6.png'; break;
                case 6: imageLink = 'BAMBOO-7.png'; break;
                case 7: imageLink = 'BAMBOO-8.png'; break;
                case 8: imageLink = 'BAMBOO-9.png';
            }
        }
        else if (suit === 1){
            switch (rank){
                case 0: imageLink = 'DOT-1.png'; break;
                case 1: imageLink = 'DOT-2.png'; break;
                case 2: imageLink = 'DOT-3.png'; break;
                case 3: imageLink = 'DOT-4.png'; break;
                case 4: imageLink = 'DOT-5.png'; break;
                case 5: imageLink = 'DOT-6.png'; break;
                case 6: imageLink = 'DOT-7.png'; break;
                case 7: imageLink = 'DOT-8.png'; break;
                case 8: imageLink = 'DOT-9.png';
            }
        }
        else if (suit === 2){
            switch (rank){
                case 0: imageLink = 'CHAR-1.png'; break;
                case 1: imageLink = 'CHAR-2.png'; break;
                case 2: imageLink = 'CHAR-3.png'; break;
                case 3: imageLink = 'CHAR-4.png'; break;
                case 4: imageLink = 'CHAR-5.png'; break;
                case 5: imageLink = 'CHAR-6.png'; break;
                case 6: imageLink = 'CHAR-7.png'; break;
                case 7: imageLink = 'CHAR-8.png'; break;
                case 8: imageLink = 'CHAR-9.png';
            }
        }
        else if (suit === 3){
            switch (rank){
                case 0: imageLink = 'WIND-EAST.png'; break;
                case 1: imageLink = 'WIND-SOUTH.png'; break;
                case 2: imageLink = 'WIND-WEST.png'; break;
                case 3: imageLink = 'WIND-NORTH.png';
            }
        }
        else if (suit === 4){
            switch (rank){
                case 0: imageLink = 'DRAGON-RED-REVISED.png'; break;
                case 1: imageLink = 'DRAGON-GREEN.png'; break;
                case 2: imageLink = 'DRAGON-WHITE.png';
            }
        }
        return url + imageLink;
    }

    render (){
        return (concealed ? (<div>

                            </div>) 
                            : 
                            (<div>

                            </div>));
    }
}


class GameRoom extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            round: 0,
            turn: 0,
            started: false,  
            canStart: false, 
            canRoll: true,       
            canPeng: false,    
            canChow: false,    
            canKong: false,    
            canHu: false,
            canDraw: false,    
            canDiscard: false,
            isDiscarding: false,
            selectedTiles: [],
            selectedMeld: null,
            hand: null,     
            wall: 136,
            fourWalls: [],
            dataFieldVal: 'Welcome to Mahjong!',
            infoFieldVal: 'Roll to Start',
            player: 0,
            dealer: 0,
            rightMelds: [],
            leftMelds: [],
            topMelds: [],
            discardedTile: null,
            discardedTilesList: [[], [], [], []],
            leftPlayer: 0,//{player: 0, melds: [], tilesInHand: 0},
            topPlayer: 0,//{player: 0, melds: [], tilesInHand: 0},
            rightPlayer: 0,//{player: 0, melds: [], tilesInHand: 0},
            leftTiles: 0,
            rightTiles: 0,
            topTiles: 0,
            drawLocation: [0, 0],
            canSelectTile: true,
            canSelectMeld: false,
            turnTime: '0:00',
            inBetweenRounds: false,
            topHand: null,
            leftHand: null,
            rightHand: null,
            scores: [0, 0, 0, 0]
        }
    }


    //called whenever component mounts
    componentDidMount = () =>{
        socket.on('connect message', (data) =>{
            this.setState({ player: data }); 
            this.seatPlayers();
        });

        socket.on('start', (data) => {
            //Instantiate wall
            //console.log('Game Started')
            this.setActions(data.actions);
            this.setState({
                hand: data.hand, 
                started: true, 
                wall: data.wallLength,
                fourWalls: Array.from(Array(4), _ => Array(17).fill(2)),
                drawLocation: [this.state.dealer-1, data.drawLocation], 
                canRoll: false,
                rightMelds: [],
                leftMelds: [],
                topMelds: [],
                selectedTiles: [],
                selectedMeld: null,
                canSelectTile: true,
                dealer: data.dealer,
                turn: data.dealer,
                topHand: null,
                leftHand: null,
                rightHand: null,
                dataFieldVal: 'Dealer Rolled For Draw Location'
            });
            //console.log('Table Set');
            this.setDrawView(52);
            //console.log('Wall View Set');
            socket.emit('action',this.state);
        });

        socket.on('turn-timer', (data) => {
            this.setState({ turnTime: data > 9 ? '0:' + data : '0:0' + data});
        });
        
        socket.on('draw-others', (data) => {
            this.setState({ 
                dataFieldVal: '',
                infoFieldVal: 'Player ' + data + ' has drawn a tile',
                wall: this.state.wall - 1 
            });
            this.setDrawView(1);
            switch (data){
                case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles+1}); break;
                case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles+1}); break;
                case this.state.topPlayer: this.setState({topTiles: this.state.topTiles+1});
            }
        });

        socket.on('discard', (data) => {
            this.setActions(data[1].actions);
            this.setState({
                dataFieldVal: 'Player ' + data[0] + ' Discarded a Tile',
                infoFieldVal: "Player " +  data[1].turn + "'s Turn",   //Placeholder till turns tracked on server side
                turn: data[1].turn,
                selectedTiles: [],
            });
            switch (data[0]){
                case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles-1}); break;
                case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles-1}); break;
                case this.state.topPlayer: this.setState({topTiles: this.state.topTiles-1});
            }

            let discardPlayerList = this.state.discardedTilesList[data[0]-1].slice();
            discardPlayerList.push([data[1].discard.suit, data[1].discard.rank]);
            let discards = this.state.discardedTilesList.slice();
            discards[data[0]-1] = discardPlayerList;
            this.setState({discardedTilesList: discards, discardedTile: [data[0]-1, discardPlayerList.length-1]});
        });

        socket.on('peng-others', (data) => {
            this.addPlayerMeld(data.agent, data.peng);
            this.setState({
                infoFieldVal: 'PENG: Player ' + data.agent,
                turn: data.agent
            });
            switch (data.agent){
                case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles-2}); break;
                case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles-2}); break;
                case this.state.topPlayer: this.setState({topTiles: this.state.topTiles-2});
            }
            this.removePrevDiscard();
        });
        socket.on('chow-others', (data) => {
            this.addPlayerMeld(data.agent, data.chow);
            this.setState({ infoFieldVal: 'CHOW: Player ' + data.agent});
            switch (data.agent){
                case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles-2}); break;
                case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles-2}); break;
                case this.state.topPlayer: this.setState({topTiles: this.state.topTiles-2});
            };
            this.removePrevDiscard();
        });
        socket.on('kong-others', (data) => {
            this.addPlayerMeld(data.agent, data.kong);
            this.setState({
                infoFieldVal: 'KONG: Player ' + data.agent,
                turn: data.agent
            });
            this.setDrawView(1);
            if (data.inHand){
                switch (data.agent){
                    case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles-3}); break;
                    case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles-3}); break;
                    case this.state.topPlayer: this.setState({topTiles: this.state.topTiles-3});
                }
            }
            else {
                switch (data.agent){
                    case this.state.leftPlayer: this.setState({leftTiles: this.state.leftTiles-2}); break;
                    case this.state.rightPlayer: this.setState({rightTiles: this.state.rightTiles-2}); break;
                    case this.state.topPlayer: this.setState({topTiles: this.state.topTiles-2});
                }
                this.removePrevDiscard();
            }
            
        });
        socket.on('hu', (data) => {
            this.setActions([false, false, false, false, false, false]);
            if (this.state.round < 4){
                this.setState({
                    dataFieldVal: 'PLAYER ' + data.won + 'WON ROUND ' + this.state.round,
                    infoFieldVal: 'Press Start to Begin Round ' + (this.state.round+1),
                    round: this.state.round,
                    canStart: true
                    // Display Hands
                });
                
            }
            else {
                this.setState({
                    dataFieldVal: 'PLAYER ' + data.won + 'WON ROUND ' + this.state.round,
                    infoFieldVal: 'GAME FINISHED' //Display player points, which player won, etc
                    // Display Hands
                });
            }
            for (let i = 1; i < 5; i++){
                if (i === this.state.topPlayer){
                    switch(i){
                        case 1: this.setState({topHand: data.p1Hand}); break;
                        case 2: this.setState({topHand: data.p2Hand}); break;
                        case 3: this.setState({topHand: data.p3Hand}); break;
                        case 4: this.setState({topHand: data.p4Hand});
                    }
                }
                else if (i === this.state.leftPlayer){
                    switch(i){
                        case 1: this.setState({leftHand: data.p1Hand}); break;
                        case 2: this.setState({leftHand: data.p2Hand}); break;
                        case 3: this.setState({leftHand: data.p3Hand}); break;
                        case 4: this.setState({leftHand: data.p4Hand});
                    }
                }
                else if (i === this.state.rightPlayer){
                    switch(i){
                        case 1: this.setState({rightHand: data.p1Hand}); break;
                        case 2: this.setState({rightHand: data.p2Hand}); break;
                        case 3: this.setState({rightHand: data.p3Hand}); break;
                        case 4: this.setState({rightHand: data.p4Hand});
                    }
                }
            }
            let s = [parseInt(this.state.scores[0]) + parseInt(data.p1Score),
                parseInt(this.state.scores[1]) + parseInt(data.p2Score),
                parseInt(this.state.scores[2]) + parseInt(data.p3Score),
                parseInt(this.state.scores[3]) + parseInt(data.p4Score)];
            this.setState({discardedTilesList: [[], [], [], []], scores: s});
        });

        socket.on('resume',(data)=>{
            this.setState(data.status);
        });

        socket.on('draw', (data) => {
            this.setActions(data.actions);
            this.setState({
                hand: data.hand, 
                wall: data.wallLength,
                dataFieldVal: 'You Drew',
            });
            this.setDrawView(1)
            this.discardSequence();
        });

        socket.on('peng', (data) => {
            this.setActions(data.actions);
            this.setState({ 
                hand: data.hand, 
                dataFieldVal: 'PENG',
                infoFieldVal: 'Select a Tile to Discard or Hu',
                turn: this.state.player
            });
            this.removePrevDiscard();
            this.discardSequence();
        });

        socket.on('chow', (data) => {
            console.log('chow');
            this.setActions(data.actions);
            this.setState({ 
                hand: data.hand, 
                dataFieldVal: 'CHOW',
                infoFieldVal: 'Select a Tile to Discard or Hu',
            });
            console.log('set chow state');
            this.removePrevDiscard();
            this.discardSequence();
        });

        socket.on('kong', (data) => {
            this.setActions(data.actions);
            this.setState({ 
                hand: data.hand, 
                dataFieldVal: 'KONG',
                infoFieldVal: 'Select a Tile to Discard or Hu',
                turn: this.state.player,
            });
            if (this.state.selectedTiles.length === 3){
                this.removePrevDiscard();
            }
            this.setDrawView(1);
            this.discardSequence();
        });

        socket.on('after-discard-hand', (data) => {
            this.setActions(data.actions); 
            this.setState({
                hand: data.hand,
                selectedTiles: [],
                dataFieldVal: 'You Discarded a Tile',
                infoFieldVal: 'Player ' + this.state.leftPlayer + "'s Turn",
                isDiscarding: false,
                turn: data.turn
            });
            let discardPlayerList = this.state.discardedTilesList[this.state.player-1].slice();
            discardPlayerList.push([data.discard.suit, data.discard.rank]);
            let discards = this.state.discardedTilesList.slice();
            discards[this.state.player-1] = discardPlayerList;
            this.setState({discardedTilesList: discards, discardedTile: [this.state.player-1, discardPlayerList.length-1]});
        });

        socket.on('evaluate-selections', (data) => {
            this.setActions(data);
        }); 
    }

    //Adds exposed meld to appropriate player
    addPlayerMeld = (player, meld) => {
        if (player === this.state.rightPlayer){
            let m = this.state.rightMelds;
            m.push(meld);
            this.setState({rightMelds: m});
        }
        else if (player === this.state.leftPlayer){
            let m = this.state.leftMelds;
            m.push(meld);
            this.setState({leftMelds: m});
        }
        else if (player === this.state.topPlayer){
            let m = this.state.topMelds;
            m.push(meld);
            this.setState({topMelds: m});
        }
    }
  
    //sets available actions for this player (enables/disables buttons)
    setActions = (actions) => {
        this.setState({
            canDraw: actions[0],
            canChow: actions[1],
            canPeng: actions[2],
            canKong: actions[3],
            canHu: actions[4],
            canDiscard: actions[5]
        });
    }


    //Returns string representation of given tile
    mapTile = (suit, rank) => {
        let t = '';
        if (suit === 0){ t += 'Ba'; }
        else if (suit === 1){ t += 'Do'; }
        else if (suit === 2){ t += 'Ch'; }
        else if (suit === 3){ t += 'Wi'; }
        else if (suit === 4){ t += 'Dr'; }
        return t + rank.toString();
    }

    mapTileToImage = (suit, rank, concealed = false) => {
        if (concealed && this.state.topHand === null){ return 'https://i.ibb.co/GRK34kv/Back-Tile-Plain.png';}
        let imageLink;
        if (suit === 0){
            switch (rank){
                case 0: imageLink = 'https://i.ibb.co/Gd7vdqx/BAMBOO-1.png'; break;
                case 1: imageLink = 'https://i.ibb.co/GktPJGx/BAMBOO-2.png'; break;
                case 2: imageLink = 'https://i.ibb.co/Ksg4C2H/BAMBOO-3.png'; break;
                case 3: imageLink = 'https://i.ibb.co/R7hq4yz/BAMBOO-4.png'; break;
                case 4: imageLink = 'https://i.ibb.co/rmSZs3F/BAMBOO-5.png'; break;
                case 5: imageLink = 'https://i.ibb.co/PFHmcYd/BAMBOO-6.png'; break;
                case 6: imageLink = 'https://i.ibb.co/M8hhv5F/BAMBOO-7.png'; break;
                case 7: imageLink = 'https://i.ibb.co/8MJxYxf/BAMBOO-8.png'; break;
                case 8: imageLink = 'https://i.ibb.co/NWLdY1Z/BAMBOO-9.png';
            }
        }
        else if (suit === 1){
            switch (rank){
                case 0: imageLink = 'https://i.ibb.co/3yyBJ3n/DOT-1.png'; break;
                case 1: imageLink = 'https://i.ibb.co/T8V9m5f/DOT-2.png'; break;
                case 2: imageLink = 'https://i.ibb.co/dfPZnkZ/DOT-3.png'; break;
                case 3: imageLink = 'https://i.ibb.co/kKNGZbf/DOT-4.png'; break;
                case 4: imageLink = 'https://i.ibb.co/6tztgm3/DOT-5.png'; break;
                case 5: imageLink = 'https://i.ibb.co/Tm8SjWk/DOT-6.png'; break;
                case 6: imageLink = 'https://i.ibb.co/m6Z1znx/DOT-7.png'; break;
                case 7: imageLink = 'https://i.ibb.co/FV83hXP/DOT-8.png'; break;
                case 8: imageLink = 'https://i.ibb.co/z8SqVGs/DOT-9.png';
            }
        }
        else if (suit === 2){
            switch (rank){
                case 0: imageLink = 'https://i.ibb.co/dgBSX7H/CHAR-1.png'; break;
                case 1: imageLink = 'https://i.ibb.co/kM4Jx6v/CHAR-2.png'; break;
                case 2: imageLink = 'https://i.ibb.co/N9jwv3d/CHAR-3.png'; break;
                case 3: imageLink = 'https://i.ibb.co/gMLQVdW/CHAR-4.png'; break;
                case 4: imageLink = 'https://i.ibb.co/mbKkYC9/CHAR-5.png'; break;
                case 5: imageLink = 'https://i.ibb.co/Sd5gV9N/CHAR-6.png'; break;
                case 6: imageLink = 'https://i.ibb.co/VCbZ8fL/CHAR-7.png'; break;
                case 7: imageLink = 'https://i.ibb.co/nCRBqhs/CHAR-8.png'; break;
                case 8: imageLink = 'https://i.ibb.co/Z2y3kTq/CHAR-9.png';
            }
        }
        else if (suit === 3){
            switch (rank){
                case 0: imageLink = 'https://i.ibb.co/p3QRcx3/WIND-EAST.png'; break;
                case 1: imageLink = 'https://i.ibb.co/JxS67xV/WIND-SOUTH.png'; break;
                case 2: imageLink = 'https://i.ibb.co/ZTMgnFy/WIND-WEST.png'; break;
                case 3: imageLink = 'https://i.ibb.co/1sTN26q/WIND-NORTH.png';
            }
        }
        else if (suit === 4){
            switch (rank){
                case 0: imageLink = 'https://i.ibb.co/KLJccj9/DRAGON-RED-REVISED.png'; break;
                case 1: imageLink = 'https://i.ibb.co/s5rMfYH/DRAGON-GREEN.png'; break;
                case 2: imageLink = 'https://i.ibb.co/Z1SVWL7/DRAGON-WHITE.png';
            }
        }
        return imageLink;
    }

    //Returns string representation of given meld
    mapMeld = (meld) => {
        let m = '';
        if (meld.suit === 0){ m += 'Ba ' }
        else if (meld.suit === 1){ m += 'Do ' }
        else if (meld.suit === 2){ m += 'CH ' }
        else if (meld.suit === 3){ m += 'Wi ' }
        else if (meld.suit === 4){ m += 'Dr ' }
        for (let r of meld.ranks){
            m += r.toString();
        }
        return m;
    }


    //returns list of tiles in inPlayTiles of given hand
    getLooseTiles = (hand) => {
        let looseTiles = [];
        for (let i = 0; i < hand.inPlayTiles.length; i++){
            for (let j = 0; j < hand.inPlayTiles[i].length; j++){
                for (let k = 0; k < hand.inPlayTiles[i][j]; k++){
                    looseTiles.push([i, j]);
                }
            }
        }
        return looseTiles;
    }


    // Need to handle wall depletion
    setDrawView = (numTiles) => {
        // Copy Walls
        let wallCopy = [];
        for (let w of this.state.fourWalls){
            wallCopy.push(w.slice());
        }
        // Remove tiles from wall (visually)
        let d = [this.state.drawLocation[0], this.state.drawLocation[1]];
        if (numTiles > 1 && this.state.player !== this.state.dealer){
            d = [this.state.drawLocation[0], 16 - this.state.drawLocation[1]];
        }
        let n = numTiles;
        console.log(d, n);
        while (n > 0) {  
            if (wallCopy[d[0]][d[1]] > 0){
                wallCopy[d[0]][d[1]]--;
                n--;
            }
            else {
                if ((d[1] === 0 && d[0]+1 === this.state.player) || (d[1] === 16 && d[0]+1 !== this.state.player)){
                    if (d[0] === 3){ d[0] = 0; }
                    else { d[0]++; }
                    if (d[0]+1 === this.state.player){
                        d[1] = 16;
                    }
                    else {
                        d[1] = 0;
                    }
                }
                else {
                    if (d[0]+1 === this.state.player){
                        d[1]--;
                    }
                    else {
                        d[1]++;
                    }
                }
            }
            console.log(d, n, wallCopy);
        }
        this.setState({fourWalls: wallCopy, drawLocation: d});
    }


    setWallTile = (stackHeight) => {
        if (stackHeight === 0){
            return null;
        }
        else if (stackHeight === 1){
            return 'https://i.ibb.co/GRK34kv/Back-Tile-Plain.png'
        }
        else {
            return 'https://i.ibb.co/b72yHc8/BACK-TILE-LINE.png'
        }
    }
    

    onPressStart = () => {
        this.setState({canStart: false});

        //Check that all players have pressed start
        socket.emit('start');
    }

    onPressRoll = () => {
        socket.emit('rollDice');
        socket.on('diceTotal', (data) => {
            /*
            if (this.state.secondRoll){
                this.setState({
                    canRoll: false,
                    drawLocation: [this.state.player-1, 16 - data],
                    dataFieldVal: 'You Rolled: ' + data,
                    infoFieldVal: 'Draw Tile to Begin',
                    canDraw: true                    
                })
            }
            else{
                */
                this.setState({
                    dataFieldVal: 'You Rolled: ' + data,
                    infoFieldVal: 'Waiting for Other Players...',
                    canRoll: false
                });
            //}
            socket.emit('action',this.state);
        });

        socket.on('tie', (data) => {
            if (data.includes(this.state.player-1)){
                this.setState({
                    infoFieldVal: 'Tie, Roll Again',
                    canRoll: true
                });
            }
            socket.emit('action',this.state);
        });

        socket.on('dealer', (data) =>{
            this.setState({
                dataFieldVal: 'Dealer is Player ' + data.toString(),
                infoFieldVal: 'Dealer Draw Tile To Start',//'Dealer Must Roll For Draw Location...',
                dealer: data,
                turn: data,
                round: this.state.round+1,
                leftTiles: 13,
                rightTiles: 13,
                topTiles: 13
            });
            socket.emit('action',this.state);
        });
    }

    discardSequence = () => {
        this.setState({
            infoFieldVal: 'Select a Tile to Discard or Hu',
            canDiscard: false, //Tile must be selected before discarding
            isDiscarding: true,
            selectedTiles: []
        })
    }

    removePrevDiscard = () => {
        let d = this.state.discardedTilesList.slice();
        let playerList = this.state.discardedTilesList[this.state.discardedTile[0]].slice();
        playerList.pop();
        d[this.state.discardedTile[0]] = playerList;
        this.setState({discardedTilesList: d});
    }

    onPressDraw = () =>{
        this.setState({canDraw: false, canChow: false, canPeng: false, canKong: false});
        socket.emit('draw');
        //socket.on('draw', (data) => {
        //    this.setActions(data.actions);
        //    this.setState({
        //        hand: data.hand, 
        //        wall: data.wallLength,
        //        dataFieldVal: 'You Drew: ' + this.mapTile(data.newTile.suit, data.newTile.rank),
        //    });
        //    this.discardSequence();
        //});
        socket.emit('action',this.state);
    }
  
    onPressPeng = () => {
        this.setState({canPeng: false, canDraw: false});
        let d = this.state.discardedTile;
        socket.emit('peng', {selected: this.state.selectedTiles, discard: this.state.discardedTilesList[d[0]][d[1]]});
        //socket.on('peng', (data) => {
        //    this.setActions(data.actions);
        //    this.setState({ 
        //        hand: data.hand, 
        //        dataFieldVal: 'PENG',
        //        infoFieldVal: 'Select a Tile to Discard or Hu (If Possible)',
        //        turn: this.state.player
        //    });
        //    this.removePrevDiscard();
        //    this.discardSequence();
        //});
        socket.emit('action',this.state);
    }
  
    onPressChow = () => {
        this.setState({canChow: false, canDraw: false});
        let d = this.state.discardedTile;
        socket.emit('chow', {selected: this.state.selectedTiles, discard: this.state.discardedTilesList[d[0]][d[1]]});
        //socket.on('chow', (data) => {
        //    this.setActions(data.actions);
        //    this.setState({ 
        //        hand: data.hand, 
        //        dataFieldVal: 'CHOW',
        //        infoFieldVal: 'Select a Tile to Discard or Hu (If Possible)',
        //    });
        //    this.removePrevDiscard();
        //    this.discardSequence();
        //});
        socket.emit('action',this.state);
    }
  
    onPressKong = () =>{
        this.setState({canKong: false, canDraw: false});
        let d = this.state.discardedTile;
        if (this.state.selectedMeld === null){
            socket.emit('kong', {selected: this.state.selectedTiles, discard: this.state.discardedTilesList[d[0]][d[1]]});
        }
        else {
            let selects = [];
            selects.push(this.state.selectedTiles[0]);
            for (const i of this.state.selectedMeld.ranks){
                selects.push([this.state.selectedMeld.suit, i]);
            }
            this.setState({selectedMeld: null});
            socket.emit('kong',{selected: selects, discard: this.state.discardedTilesList[d[0]][d[1]]});
        }
        //socket.on('kong', (data) => {
        //    this.setActions(data.actions);
        //    this.setState({ 
        //        hand: data.hand, 
        //        dataFieldVal: 'KONG',
        //        infoFieldVal: 'Select a //Tile to Discard or Hu (If Possible)',
        //        turn: this.state.player,
        //    });
        //    if (this.state.selectedTiles.length === 3){
        //        this.removePrevDiscard();
        //    }
        //    this.setDrawView(1);
        //    this.discardSequence();
        //});
        socket.emit('action',this.state);
    }
  
    onPressHu = () => {
        this.setState({canHu: false});
        socket.emit('hu');
    }

    //send actions for this player from server
    onPressDiscard = () =>{
        socket.emit('discard', this.state.selectedTiles);
        //socket.on('after-discard-hand', (data) => {
        //    this.setActions(data.actions); 
        //    this.setState({
        //        hand: data.hand,
        //        selectedTiles: [],
        //        dataFieldVal: 'You Discarded: ' + this.mapTile(data.discard.suit, data.discard.rank),
        //        infoFieldVal: 'Player ' + this.state.leftPlayer + "'s Turn",
        //        isDiscarding: false,
        //        turn: data.turn
        //    });
        //    let discardPlayerList = this.state.discardedTilesList[this.state.player-1].slice();
        //    discardPlayerList.push([data.discard.suit, data.discard.rank]);
        //    let discards = this.state.discardedTilesList.slice();
        //    discards[this.state.player-1] = discardPlayerList;
        //    this.setState({discardedTilesList: discards, discardedTile: [this.state.player-1, discardPlayerList.length-1]});
        //});
        socket.emit('action',this.state);
    }

    
    onSelectTile = (suit, rank, key) =>{
        let select = true;
        let selectedCopy = this.state.selectedTiles;
        for (let i = 0; i < this.state.selectedTiles.length; i++){
            if (this.state.selectedTiles[i][2] === key){
                select = false;
                selectedCopy.splice(i, 1);
                this.setState({ selectedTiles: selectedCopy, canDiscard: false });
                console.log('Tiles Selected: ', this.state.selectedTiles);
                break;
            }
        }
        if (select){
            selectedCopy.push([suit, rank, key]);
            this.setState({ selectedTiles: selectedCopy});
            console.log('Tiles Selected: ', this.state.selectedTiles);
        }
        // If can discard
        if (this.state.selectedTiles.length === 1 && this.state.isDiscarding && this.state.selectedMeld === null){
            this.setState({ canDiscard: true });
        }
        // If can peng -> kong
        else if (this.state.selectedTiles.length === 1 && this.state.isDiscarding && this.state.selectedMeld !== null){
            this.setState({canDiscard: false});
            let selects = [];
            selects.append(this.state.selectedTiles[0]);
            for (const i of this.state.selectedMeld.ranks){
                selects.append([this.state.selectedMeld.suit, i]);
            }
            socket.emit('select-tiles', selects);
            socket.on('evaluate-selections', (data) => {
                this.setActions([data[0], data[1], data[2], data[3], this.state.canHu, data[5]]);
            });
        }
        // else check tiles
        else if (this.state.selectedTiles.length > 1 && this.state.selectedTiles.length < 5 && this.state.selectedMeld === null){
            this.setState({ canDiscard: false });
            let d = this.state.discardedTile;
            let tiles = {selected: this.state.selectedTiles, discard: this.state.discardedTilesList[d[0]][d[1]], isDiscarding: this.state.isDiscarding};
            socket.emit('select-tiles', tiles);
            socket.on('evaluate-selections', (data) => {
                this.setActions(data);
            }); 
        }
        socket.emit('action',this.state);
    }


    onSelectMeld = (meld) => {
        if (meld.ranks.length === 3 && meld.ranks[0] === meld.ranks[1] && meld.ranks[1] === meld.ranks[2]){
            if (this.isSelectedMeld(meld)){
                this.setState({selectedMeld: null});
            }
            else {
                this.setState({selectedMeld: meld});
            }
        // If can discard
        if (this.state.selectedTiles.length === 1 && this.state.isDiscarding && this.state.selectedMeld === null){
            this.setState({ canDiscard: true });
        }
        // If can peng -> kong
        else if (this.state.selectedTiles.length === 1 && this.state.isDiscarding && this.state.selectedMeld !== null){
            this.setState({canDiscard: false});
            let selects = [];
            selects.append(this.state.selectedTiles[0]);
            for (const i of this.state.selectedMeld.ranks){
                selects.append([this.state.selectedMeld.suit, i]);
            }
            socket.emit('select-tiles', selects);
            //socket.on('evaluate-selections', (data) => {
            //    this.setActions(data);
            //});
        }
        // else check tiles
        else if (this.state.selectedTiles.length > 1 && this.state.selectedTiles.length < 5 && this.state.selectedMeld === null){
            this.setState({ canDiscard: false });
            let d = this.state.discardedTile;
            let tiles = {selected: this.state.selectedTiles, discard: this.state.discardedTilesList[d[0]][d[1]], isDiscarding: this.state.isDiscarding};
            socket.emit('select-tiles', tiles);
            //socket.on('evaluate-selections', (data) => {
            //    this.setActions(data);
            //}); 
        }
        }
    }
    
    isSelected = (key) => {
        for (let i = 0; i < this.state.selectedTiles.length; i++){
            if (this.state.selectedTiles[i][2] === key){
                return true;
            }
        }
        return false;
    }

    isSelectedMeld = (meld) => {
        if (this.state.selectedMeld !== null && this.state.selectedMeld.suit === meld.suit && 
            this.state.selectedMeld.ranks[0] === meld.ranks[0]){
            return true;
        }
        return false;
        
    }


    onPressExit = () => {
        socket.emit('disconnect');
    }
  

    seatPlayers = () => {
        let left = (this.state.player + 1) % 4
        let top = (this.state.player + 2) % 4
        let right = (this.state.player + 3) % 4
        this.setState({
            leftPlayer: left === 0 ? 4 : left,
            topPlayer: top === 0 ? 4 : top,
            rightPlayer: right === 0 ? 4 : right
        });
    }

    getTilesInHand = (tiles) => {
        let backTileImages = [];
        for (let i = 0; i < tiles; i++){
            backTileImages.push(i);
        }
        return backTileImages;
    }

    placeHolderFunction = () => {}

  
    render(){
        return(
            <div className='container' >
                <div className='game-id'>
                    Game ID: {roomId}
                </div>
                <div className='panel panel-default'>
  
                    
                    {/*Gameroom Body*/}
                    <div className='panel-body'>
                        <div className='row'>
  
                            {/* Left Panel */}
                            <div className='col-2' style={{textAlign: 'center'}}>
                                <div className='row'>
                                    <img src='https://i.ibb.co/RPxqJTn/Logo.png' style={{height: '120px', left: '0', top: '0'}}/>
                                </div>
                                <div className='row' style={{width: '150px'}}>
                                    <p className='panel-text'>TURN TIMER</p>
                                </div>
                                <div className='row' style={{width: '150px'}}>
                                    <p className='panel-text'>{this.state.turnTime}</p>
                                </div>
                                <div className='row'>
                                    <button className='btn' disabled={!this.state.canStart}
                                    onClick={this.onPressStart}>
                                    START
                                    </button>
                                </div>
                                <div className='row'>
                                    <button className='btn'
                                    disabled={!(this.state.canDraw && this.state.player === this.state.turn)}
                                    onClick={this.onPressDraw}>
                                    DRAW
                                    </button>
                                </div>
                                <div className='row'>
                                    <button className='btn'
                                    disabled={!this.state.canDiscard}
                                    onClick={this.onPressDiscard}>
                                    DISCARD
                                    </button>
                                </div>
                            </div>
  
  
                            {/* Center Panel */}
                            <div className='col' style={{height: '550px', maxWidth: '700px', minWidth: '700px', margin: 'auto', 
                                                        border:'5px solid black', backgroundColor: 'green'}}>
                                
                                {/* Top row of game panel w/one player*/}
                                <div className='row'>
                                    <div className='col' style={{textAlign: 'center', margin: '0 auto', width: '100%'}}>
                                      <p style={this.state.topPlayer === this.state.turn? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                                          PLAYER {this.state.topPlayer} {this.state.topPlayer === this.state.dealer ? '(dealer)' : ''}
                                      </p>
                                    
                                      {/* Tile Backs*/}
                                      <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(0px, -10px)'}}>
                                        {this.state.started ? this.state.topMelds.map((e, i) => 
                                            (<div key={i}>
                                                {e.ranks.map((t, j) => <img key={j} src={this.mapTileToImage(e.suit, t, e.isConcealed)} 
                                                                            className='meld'/>)}
                                            </div>)) : <p> </p>}
                                        {this.state.topHand === null ? this.getTilesInHand(this.state.topTiles).map((i) => <img key={i} src='https://i.ibb.co/GRK34kv/Back-Tile-Plain.png' className='tile'/>)
                                                                        : this.getLooseTiles(this.state.topHand).map((e, i) =>
                                                                            (<img key={i} src={this.mapTileToImage(e[0], e[1])} className='tile'/>))}
                                      </div>
                                      <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(0px, 40px)'}}>
                                        {this.state.started ? this.state.fourWalls[this.state.topPlayer-1].map((e, i) => (
                                                this.setWallTile(e) === null ? <div key={i} className='blank-wall-tile'></div> 
                                                : <img key={i} src={this.setWallTile(e)} className='wall-tile'/>)) : <p> </p>}
                                      </div>
                                      <div className='row' style={{width: '50%',display: 'flex', justifyContent: 'center', position: 'absolute',  transform: 'translate(50%, 80px)'}}>
                                            {this.state.started ? this.state.discardedTilesList[this.state.topPlayer-1].map((e, i) =><img key={i} src={this.mapTileToImage(e[0], e[1])} 
                                                className={this.state.topPlayer-1 === this.state.discardedTile[0] ? this.state.discardedTile[1] === i ? 'current-discard' : 'discard' : 'discard'}/>) 
                                                : <p></p>}
                                      </div>
                                    </div>
                                </div>
  
                                {/* Mid row of game panel w/two rotated players & field*/}
                                <div className='row'>
                                    {/* Left Side Player*/}
                                    <div className='col' style={{position: 'absolute', textAlign: 'center', transform: 'rotate(-90deg) translate(-205px, -310px)'}}>
                                        <p style={this.state.leftPlayer === this.state.turn? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                                            PLAYER {this.state.leftPlayer} {this.state.leftPlayer === this.state.dealer ? '(dealer)' : ''}
                                        </p>

                                        {/*Tile Backs */}
                                        <div className='btn-group' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '90%', transform: 'translate(30px, -5px)'}}>
                                          {this.state.started ? this.state.leftMelds.map((e, i) => 
                                                (<div key={i}>
                                                    {e.ranks.map((t, j) => <img key={j} src={this.mapTileToImage(e.suit, t, e.isConcealed)} 
                                                                            className='meld'/>)}
                                                </div>)) : <p> </p>}
                                          {this.state.leftHand === null ? this.getTilesInHand(this.state.leftTiles).map((i) => <img key={i} src='https://i.ibb.co/GRK34kv/Back-Tile-Plain.png' className='tile'/>)
                                                                        : this.getLooseTiles(this.state.leftHand).map((e, i) =>
                                                                            (<img key={i} src={this.mapTileToImage(e[0], e[1])} className='tile'/>))}
                                        </div>
                                        <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(15px, 45px)'}}>
                                            {this.state.started ? this.state.fourWalls[this.state.leftPlayer-1].map((e, i) => (
                                                this.setWallTile(e) === null ? <div key={i} className='blank-wall-tile'></div> 
                                                : <img key={i} src={this.setWallTile(e)} className='wall-tile'/>)) : <p> </p>}
                                        </div>
                                        <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '50%', transform: 'translate(50%, 85px)'}}>
                                            {this.state.started ? this.state.discardedTilesList[this.state.leftPlayer-1].map((e, i) =><img key={i} src={this.mapTileToImage(e[0], e[1])} 
                                                className={this.state.leftPlayer-1 === this.state.discardedTile[0] ? this.state.discardedTile[1] === i ? 'current-discard' : 'discard' : 'discard'}/>)
                                                : <p></p>}
                                        </div>
                                    </div>
  
                                    { /* Center Controls*/}
                                    <div className='col' style={{textAlign: 'center', position: 'absolute', transform: 'translate(0px, 160px)'}}>
                                        {this.state.started ? (this.state.topHand === null ?  
                                            (<div style={{margin: '0 auto'}}>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.dataFieldVal}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.infoFieldVal}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>Wall: {this.state.wall} tiles remaining</p>
                                            </div>) 
                                            : (<div style={{height: '240px', width: '300px', margin: '0 auto', backgroundColor: 'white', border: '3px solid black', borderRadius: '30px', transform: 'translate(0px, -70px)'}}>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.dataFieldVal}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.infoFieldVal}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>Player 1 Score: {this.state.scores[0]}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>Player 2 Score: {this.state.scores[1]}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>Player 3 Score: {this.state.scores[2]}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>Player 4 Score: {this.state.scores[3]}</p>
                                              </div>))
                                            : (<div style={{height: '150px', width: '300px', margin: '0 auto', backgroundColor: 'white', border: '3px solid black', borderRadius: '30px'}}>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.dataFieldVal}</p>
                                                <p style={{fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif'}}>{this.state.infoFieldVal}</p>
                                                <img src='https://i.ibb.co/828cCxk/DIE-IMAGE.png'  onClick={this.state.canRoll ? this.onPressRoll : this.placeHolderFunction} style={{height: '60px'}}/>
                                            </div>)
                                        }
                                    </div>
  
                                    {/* Right Side Player*/}
                                    <div className='col' style={{position: 'absolute', textAlign: 'center', transform: 'rotate(90deg) translate(200px, -300px)'}} >
                                        <p style={this.state.rightPlayer === this.state.turn? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                                            PLAYER { this.state.rightPlayer} {this.state.rightPlayer === this.state.dealer ? '(dealer)' : ''}
                                        </p>
  
                                        {/* Melds*/}
                                        <div className='btn-group'>
                                            
                                        </div>
                                        {/* Tile Backs*/}
                                        <div className='btn-group' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '90%', transform: 'translate(0px, -30px)'}}>
                                            {this.state.started ? this.state.rightMelds.map((e, i) => 
                                                (<div key={i}>
                                                    {e.ranks.map((t, j) => <img key={j} src={this.mapTileToImage(e.suit, t, e.isConcealed)} 
                                                                                className='meld'/>)}
                                            </div>)) : <p> </p>}
                                            {this.state.rightHand === null ? this.getTilesInHand(this.state.rightTiles).map((i) => <img key={i} src='https://i.ibb.co/GRK34kv/Back-Tile-Plain.png' className='tile'/>)
                                                                        : this.getLooseTiles(this.state.rightHand).map((e, i) =>
                                                                            (<img key={i} src={this.mapTileToImage(e[0], e[1])} className='tile'/>))}
                                        </div>
                                        <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(-20px, 20px)'}}>
                                            {this.state.started ? this.state.fourWalls[this.state.rightPlayer-1].map((e, i) => (
                                                this.setWallTile(e) === null ? <div key={i} className='blank-wall-tile'></div> 
                                                : <img key={i} src={this.setWallTile(e)} className='wall-tile'/>)) : <p> </p>}
                                        </div>
                                        <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '50%', transform: 'translate(50%, 60px)'}}>
                                            {this.state.started ? this.state.discardedTilesList[this.state.rightPlayer-1].map((e, i) =><img key={i} src={this.mapTileToImage(e[0], e[1])} 
                                                className={this.state.rightPlayer-1 === this.state.discardedTile[0] ? this.state.discardedTile[1] === i ? 'current-discard' : 'discard' : 'discard'}/>)
                                                : <p></p>}
                                        </div>
                                    </div>
                                    
                                </div>
  
                                {/* Bottom row of game panel w/this player*/}
                                <div className='row' >
                                  <div className='col' style={{textAlign: 'center', width: '700px', margin: '0 auto', transform: 'translate(0px, 460px)'}}>
                                    <div className='row' style={{width: '50%',display: 'flex', justifyContent: 'center', position: 'absolute',  transform: 'translate(50%, -115px)'}}>
                                        {this.state.started ? this.state.discardedTilesList[this.state.player-1].map((e, i) =><img key={i} src={this.mapTileToImage(e[0], e[1])} 
                                                className={this.state.player-1 === this.state.discardedTile[0] ? this.state.discardedTile[1] === i ? 'current-discard' : 'discard' : 'discard'}/>) 
                                                : <p></p>}
                                    </div>
                                    <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(0px, -70px)'}}>
                                        {this.state.started ? this.state.fourWalls[this.state.player-1].map((e, i) => (
                                            this.setWallTile(e) === null ? <div key={i} className='blank-wall-tile'></div> 
                                            : <img key={i} src={this.setWallTile(e)} className='wall-tile'/>)) : <p> </p>}
                                    </div>
                                    
                                    {/*Melds Group*/}
                                    <div className='btn-group' style={{position: 'absolute'}}>
                                        
                                    </div>
                                    {/* Tiles in Play */}
                                    <div className='row' style={{display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', transform: 'translate(0px, -40px)'}}>
                                        {this.state.started ? this.state.hand.melds.map((e, i) => 
                                            (<div key={i} onClick={() => this.onSelectMeld(e)}>
                                                {e.ranks.map((t, j) => <img key={j} src={this.mapTileToImage(e.suit, t)} 
                                                                            className={this.isSelectedMeld(e) ? 'selected-meld' : 'meld'}/>)}
                                            </div>)) : <p> </p>}
                                        {this.state.started ? this.getLooseTiles(this.state.hand).map((e, i) =>
                                                    (<img key={i} src={this.mapTileToImage(e[0], e[1])} className={this.isSelected(i) ? 'selected-tile' : 'tile'}
                                                            onClick={() => this.onSelectTile(e[0], e[1], i)}/>
                                                    )) : <p> </p>}
                                    </div>
                                    
                                    <p style={this.state.player === this.state.turn? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                                        PLAYER {this.state.player} {this.state.player === this.state.dealer ? '(dealer)' : ''} (me)
                                    </p>
                                  </div>
                                    
                                </div>
                            </div>
  
  
                            {/* Right Panel */}
                            <div className='col-2'>
                                <div className='row' style={{marginBottom: '20px'}}>
                                     {/*<a style={{marginRight: '10px', fontSize: '14px'}}>Home</a>*/}
                                     {/*<a style={{marginRight: '10px', fontSize: '14px'}}>Settings</a>*/}
                                     {/*<a style={{marginRight: '10px', fontSize: '14px'}}>Logout</a>*/}
                                </div>
                                <div className='row' style={{width: '150px'}}>
                                    <p className='panel-text'>ROUND {this.state.round}/4</p>
                                </div>
                                <div className='row'>
                                    <button className='btn'
                                    disabled={!this.state.canPeng}
                                    onClick={this.onPressPeng}>
                                    PENG</button>
                                </div>
                                <div className='row'>
                                    <button className='btn'
                                    disabled={!this.state.canChow}
                                    onClick={this.onPressChow}>
                                    CHOW</button>
                                </div>
                                <div className='row'>
                                    <button className='btn' 
                                    disabled={!this.state.canKong}
                                    onClick={this.onPressKong}>
                                    KONG</button>
                                </div>
                                <div className='row'>
                                    <button className='btn'
                                    disabled={!this.state.canHu}
                                    onClick={this.onPressHu}>
                                    HU</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


const domContainer = document.querySelector('#game_panel_container');
ReactDOM.render(React.createElement(GameRoom), domContainer);
//export default GameRoom;
