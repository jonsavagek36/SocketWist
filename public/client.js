

(function() {

  let IO = {

    init: function() {
      IO.socket = io.connect();
      IO.bindEvents();
    },

    bindEvents: function() {
      IO.socket.on('connected', IO.isConnected);
      IO.socket.on('youHost', IO.youHosting);
      IO.socket.on('gameReady', IO.gameReady);
      IO.socket.on('newHand', IO.getHand);
    },

    isConnected: function() {
      Game.mySocketId = IO.socket.socket.sessionid;
    },

    youHosting: function() {
      Game.isHosting = true;
      Game.hosting.innerHTML = "You are host";
    },

    gameReady: function() {
      window.alert('Ready to start!');
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
    }

  }

  let Game = {

    mySocketId: '',
    myName: '',
    isHosting: false,
    players: 0,
    playerHand: [],
    isTurn: true,

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
      console.log(Game.playerHand);
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
      let cardCode = event.target.id;
      let card = Game.playerHand[cardCode];
      event.target.style = "visibility:hidden";
      let imgNode = document.createElement('img');
      imgNode.src = Game.playerHand[cardCode].img;
      Game.tableView.appendChild(imgNode);
    }

  }

  IO.init();
  Game.init();

})();
