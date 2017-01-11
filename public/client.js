

(function() {

  let IO = {

    init: function() {
      IO.socket = io.connect();
      IO.bindEvents();
    },

    bindEvents: function() {
      IO.socket.on('connected', IO.isConnected);
      IO.socket.on('youHost', IO.youHosting);
      IO.socket.on('sendPlayerIdx', IO.getPlayerIdx);
      IO.socket.on('gameReady', IO.gameReady);
      IO.socket.on('notEnoughPlayers', IO.notEnoughPlayers);
      IO.socket.on('newHand', IO.getHand);
      IO.socket.on('startTrick', IO.startTrick);
      IO.socket.on('winTrick', IO.addTrickPoint);
      IO.socket.on('notYourTurn', IO.notYourTurn);
      IO.socket.on('yourTurn', IO.yourTurn);
      IO.socket.on('playCardSuccess', IO.playCardSuccess);
      IO.socket.on('tableAddCard', IO.tableAddCard);
      IO.socket.on('newTrick', IO.clearTable);
      IO.socket.on('roundOver', IO.roundOver);
      IO.socket.on('youWon', IO.youWon);
      IO.socket.on('youLost', IO.youLost);
      IO.socket.on('shuffleDeck', IO.shuffleDeck);
    },

    isConnected: function() {
      Game.mySocketId = IO.socket.socket.sessionid;
    },

    youHosting: function() {
      Game.isHosting = true;
      Game.hosting.innerHTML = "You are host";
    },

    getPlayerIdx: function(data) {
      Game.playerIdx = data.playerIdx;
    },

    gameReady: function() {
      window.alert('Ready to start!');
    },

    notEnoughPlayers: function() {
      window.alert('Not enough players.');
    },

    getHand: function(data) {
      fetch(`https://deckofcardsapi.com/api/deck/${data.deck}/draw/?count=13`)
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
          Game.extractCards(data.cards);
        })
    },

    startTrick: function() {
      Game.tableView.removeChild(Game.tableView.lastChild);
      window.alert('Pick a card to start the trick.');
    },

    addTrickPoint: function() {
      Game.trickPoints++;
      Game.playerPoints.innerHTML = Game.trickPoints;
      window.alert('You start the next trick.');
    },

    notYourTurn: function() {
      window.alert('Not your turn.');
    },

    yourTurn: function() {
      window.alert('Your turn.');
    },

    playCardSuccess: function(data) {
      let cardId = data.cardId;
      Game.cardToTable(cardId);
    },

    tableAddCard: function(data) {
      let imgNode = document.createElement('img');
      imgNode.src = data.newCard.img;
      Game.tableView.appendChild(imgNode);
    },

    clearTable: function() {
      while (Game.tableView.hasChildNodes()) {
        Game.tableView.removeChild(Game.tableView.lastChild);
      }
    },

    roundOver: function() {
      let pointInfo = {
        id: Game.playerIdx,
        points: Game.trickPoints
      };
      IO.socket.emit('sendPoints', pointInfo);
    },

    youWon: function(data) {
      window.alert(`You WON with ${data.tricks}!!!`);
    },

    youLost: function(data) {
      window.alert(`You LOST with ${data.tricks}!!!`);
    },

    shuffleDeck: function() {
      fetch('https://deckofcardsapi.com/api/deck/4e8zujvvleym/shuffle/')
        .then(response => {
          if (response.ok) {
            return response;
          } else {
            let errmsg = 'Failed to shuffle deck.';
            error = new Error(errmsg);
            throw(error);
          }
        })
    }
  }

  let Game = {

    mySocketId: '',
    myName: '',
    isHosting: false,
    playerIdx: 0,
    players: 0,
    playerHand: [],
    isTurn: true,
    trickPoints: 0,

    init: function() {
      Game.cacheElements();
      Game.bindEvents();
      IO.socket.emit('addPlayer');
    },

    cacheElements: function() {
      Game.tableView = document.getElementById('table-view');
      Game.handView = document.getElementById('hand-view');
      Game.pointsView = document.getElementById('points-view');
      Game.startBtn = document.getElementById('start-button');
      Game.hosting = document.getElementById('is-hosting');
      Game.playerPoints = document.getElementById('player-points');
    },

    bindEvents: function() {
      Game.startBtn.addEventListener('click', Game.clickStart);
    },

    clickStart: function() {
      if (Game.isHosting) {
        IO.socket.emit('startGame');
      } else {
        window.alert('You are not host.');
      }
    },

    extractCards: function(cards) {
      cards.forEach((theCard) => {
        let card = {
          img: theCard.image,
          code: theCard.code,
          value: theCard.value,
          suit: theCard.suit
        };
        Game.playerHand.push(card);
      });
      Game.viewHand();
    },

    viewHand: function() {
      Game.playerHand.forEach((card, idx) => {
        let imgNode = document.createElement('img');
        imgNode.src = card.img;
        imgNode.id = idx;
        imgNode.addEventListener('click', Game.clickCard);
        Game.handView.appendChild(imgNode);
      });
    },

    clickCard: function(event) {
      let cardId = event.target.id;
      let data = {
        card: Game.playerHand[cardId],
        id: cardId,
        idx: Game.playerIdx
      };
      IO.socket.emit('sendCard', data);
    },

    cardToTable: function(id) {
      document.getElementById(id).style = "visibility:hidden";
    }

  }

  IO.init();
  Game.init();

})();
