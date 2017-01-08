

class Trick {
  constructor(trumpSuit, highOrLow) {
    this.trickSize = 0;
    this.trickSuit = '';
    this.trumpSuit = trumpSuit;
    this.highOrLow = highOrLow;
    this.highValue = '';
    this.highCard = '';
    this.highPlayer = '';
  }

  addCard(card, playerId) {
    let suit = card.suit;
    let rank = card.rank;
    let code = card.code;
    if (this.trickSize < 4) {
      if (this.trickSize > 0) {
        if (suit == this.trickSuit || suit == this.trumpSuit) {
          if (this.getCardRank(card) > this.highValue) {
            this.highValue = this.getCardRank(card);
            this.highCard = code;
            this.highPlayer = playerId;
          }
        }
      } else {
        this.trickSuit = suit;
        this.highValue = this.getCardRank(card);
        this.highCard = code;
        this.highPlayer = playerId;
      }
      this.trickSize++;
    }
  }

  getCardRank(card) {
    let rank = card.rank;
    let suit = card.suit;
    let newRank;
    let values = [2,3,4,5,6,7,8,9,10,11,12,13];
    if (rank == 'JACK') rank = 11;
    if (rank == 'QUEEN') rank = 12;
    if (rank == 'KING') rank = 13;
    if (rank != 'ACE') {
      switch(this.highLow) {
        case 'high':
          newRank = values[rank - 2];
          break;
        case 'low':
          values.reverse();
          newRank = values[rank - 2];
          break;
      }
    } else {
      newRank = 14;
    }
    if (suit == this.trumpSuit) {
      newRank = newRank * 13;
    }
    return newRank;
  }

}

export default Trick;
