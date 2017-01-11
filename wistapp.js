let io;
let wistSocket;
let clients = [];
let numClients = 0;
let deckId = '4e8zujvvleym';
// https://deckofcardsapi.com/api/deck/4e8zujvvleym/shuffle/

// Trick Variables
let playersTurn = 0;    // 0 - 3
let trickSuit = '';
let trumpSuit = 'SPADES';
let trickHiLow = 'high';
let trickHighValue = 0;
let trickSize = 0;
let trickHighPlayer = 0;
let trickCount = 0;

// Player/Team Points
let teamOnePoints = 0;
let teamTwoPoints = 0;

exports.initGame = function(sio, socket) {
  io = sio;
  wistSocket = socket;

  wistSocket.on('addPlayer', addClient);
  wistSocket.on('startGame', startRound);
  wistSocket.on('sendCard', playCard);
  wistSocket.on('sendPoints', calcPoints);
}

function addClient() {
  if (numClients == 0) {
    wistSocket.emit('youHost');
  }
  clients.push(wistSocket.id);
  let idx = clients.length - 1;
  io.sockets.connected[wistSocket.id].emit('sendPlayerIdx', { playerIdx: idx });
  numClients++;
  if (numClients > 3) {
    io.emit('gameReady');
  }
}

function startRound() {
  let host = clients[0];
  // io.sockets.connected[host].emit('shuffleDeck');
  if (numClients == 4) {
    let trickStarter = clients[playersTurn];
    clients.forEach((client) => {
      io.sockets.connected[client].emit('newHand', { deck: deckId });
    });
    let player = clients[playersTurn];
    io.sockets.connected[player].emit('startTrick');
  } else {
    let host = clients[0];
    io.sockets.connected[host].emit('notEnoughPlayers');
  }
}

function playCard(data) {
  let playerIdx = data.idx;
  let card = data.card;
  let cardPlayer = clients[playerIdx];
  if (playersTurn == playerIdx) {
    io.sockets.connected[cardPlayer].emit('playCardSuccess', { cardId: data.id });
    io.emit('tableAddCard', { newCard: card });
    if (trickSize > 0) {
      if (card.suit == trickSuit || card.suit == trumpSuit) {
        if (getCardRank(card) > trickHighValue) {
          trickHighValue = getCardRank(card);
          trickHighPlayer = playerIdx;
        }
      }
    } else {
      trickSuit = card.suit;
      trickHighValue = getCardRank(card);
      trickHighPlayer = playerIdx;
    }
    trickSize++;
    if (trickSize == 4) {
      trickCount++;
      let hiPlayer = clients[trickHighPlayer];
      io.sockets.connected[hiPlayer].emit('winTrick');
      newTrick();
      if (trickCount == 13) {
        io.emit('roundOver');
      }
    } else {
      changeTurn();
      let nextPlayer = clients[playersTurn];
      io.sockets.connected[nextPlayer].emit('yourTurn');
    }
  } else {
    io.sockets.connected[cardPlayer].emit('notYourTurn');
  }
}

function changeTurn() {
  if (playersTurn < 3) {
    playersTurn++;
  } else {
    playersTurn = 0;
  }
}

function getCardRank(card) {
  let value = card.value;
  let suit = card.suit;
  let newRank;
  let values = [2,3,4,5,6,7,8,9,10,11,12,13];
  if (value == 'JACK') value = 11;
  if (value == 'QUEEN') value = 12;
  if (value == 'KING') value = 13;
  if (value != 'ACE') {
    switch(trickHiLow) {
      case 'high':
        newRank = values[value - 2];
        break;
      case 'low':
        values.reverse();
        newRank = values[value - 2];
        break;
    }
  } else {
    newRank = 14;
  }
  if (suit == trumpSuit) {
    newRank = newRank * 13;
  }
  return newRank;
}

function newTrick() {
  playersTurn = trickHighPlayer;
  trickSuit = '';
  trickHighValue = 0;
  trickSize = 0;
  io.emit('newTrick');
}

function calcPoints(data) {
  let playerIdx = data.id;
  let points = data.points;
  let host = clients[0];
  if (playerIdx == 0 && playerIdx == 2) {
    teamOnePoints += points;
  } else {
    teamTwoPoints += points;
  }
  let total = teamOnePoints + teamTwoPoints;
  if (total == 13) {
    let t1p1 = clients[0];
    let t1p2 = clients[2];
    let t2p1 = clients[1];
    let t2p2 = clients[3];
    if (teamOnePoints > teamTwoPoints) {
      io.sockets.connected[t1p1].emit('youWon', { tricks: teamOnePoints });
      io.sockets.connected[t1p2].emit('youWon', { tricks: teamOnePoints });
      io.sockets.connected[t2p1].emit('youLost', { tricks: teamTwoPoints });
      io.sockets.connected[t2p2].emit('youLost', { tricks: teamTwoPoints });
    } else {
      io.sockets.connected[t1p1].emit('youLost', { tricks: teamOnePoints });
      io.sockets.connected[t1p2].emit('youLost', { tricks: teamOnePoints });
      io.sockets.connected[t2p1].emit('youWon', { tricks: teamTwoPoints });
      io.sockets.connected[t2p2].emit('youWon', { tricks: teamTwoPoints });
    }
    // io.sockets.connected[host].emit('shuffleDeck');
  }
}
