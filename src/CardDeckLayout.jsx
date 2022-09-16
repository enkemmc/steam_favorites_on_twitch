import { CardDeck } from 'react-bootstrap'
import React from 'react';

function CardDeckLayout({ maxRowLength, game }) {
  if (!game) {
    return
  }

  const cardsArr = new Array(game.streams.length)
  let cardsInDecks = []
  const numberOfRows = Math.ceil(cardsArr.length % maxRowLength)

  for (let row = 0; row <= numberOfRows; row++) {
    let currentRowArr = []
    for (let cardIndex = 0; cardIndex < maxRowLength; cardIndex++) {
      const indexOfCardInCardsArr = (maxRowLength * row) + cardIndex
      const card = cardsArr[indexOfCardInCardsArr]
      currentRowArr.push(card)
    }
    cardsInDecks[row] = currentRowArr
  }

  this.makeRow = (rowOfCards, keyIndex) => {
    return (
      <CardDeck key={`row${keyIndex}`}>
        {rowOfCards}
      </CardDeck>
    )
  }

  return (
    cardsInDecks.map((row, keyIndex) => {
      return this.makeRow(row, keyIndex)
    })
  )
}

export default CardDeckLayout