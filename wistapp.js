let io;
let wistSocket;
let clients = [];
let numClients = 0;
let deckId = '4e8zujvvleym';
// https://deckofcardsapi.com/api/deck/4e8zujvvleym/shuffle/

exports.initGame = function(sio, socket) {
  io = sio;
  wistSocket = socket;

  wistSocket.on('addPlayer', addClient);
  wistSocket.on('startGame', startGame);
}

function addClient() {
  if (numClients == 0) {
    wistSocket.emit('youHost');
  }
  clients.push(wistSocket.id);
  numClients++;
  if (numClients > 3) {
    io.emit('gameReady');
  }
}

function startGame() {
  clients.forEach((client) => {
    io.sockets.connected[client].emit('newHand', { deck: deckId});
  });
}


// API Calls

// function createDeck() {
//   let deck = '';
//   fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
//     .then(response => {
//       if (response.ok) {
//         return response;
//       } else {
//         let errmsg = 'Failed to retrieve deck.';
//         error = new Error(errmsg);
//         throw(error);
//       }
//     })
//     .then(response => response.json())
//     .then(data => {
//       deck = data.deck_id;
//     });
//   return deck;
// }

function dealHand() {
  let hand = [];
  fetch(`https://deckofcardsapi.com/api/deck/4e8zujvvleym/draw/?count=13`)
    .then(response => {
      if (response.ok) {
        return response;
      } else {
        let errmsg = 'Failed to deal hand.';
        error = new Error(errmsg);
        throw(error);
      }
    })
    .then(response => response.json())
    .then(data => {
      hand = data.cards;
    })
  return hand;
}
