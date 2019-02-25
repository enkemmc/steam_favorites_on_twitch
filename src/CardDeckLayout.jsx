import { CardDeck} from 'react-bootstrap'
import React from 'react';

function CardDeckLayout({maxRowLength, game}){
    if (!game){
        return
    }
    /*
    game:
      {
        name: "Game 1",
        streams: [
          {url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1"},
          {url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2"}
        ]
      }
    */

    const cardsArr = game.streams.map((stream, i) => {
      const accessory = {
        [billCode]: {
          ...this.state.accessories[billCode]
        }
      };
      return <MyCard title="Primary Card Title" bg="primary" text="white" givedata={this.getData} accessory={accessory} key={billCode}/> 
    }                
    )

    let cardsInDecks = []
    const numberOfRows = Math.ceil(cardsArr.length % maxRowLength)    

    for (let row = 0; row <= numberOfRows;row++){
      let currentRowArr = []
      for (let cardIndex = 0; cardIndex < maxRowLength; cardIndex++){
        const indexOfCardInCardsArr = (maxRowLength * row) + cardIndex
        const card = cardsArr[indexOfCardInCardsArr]
        currentRowArr.push(card)
      }
      cardsInDecks[row] = currentRowArr
    }

    this.makeRow = (rowOfCards, keyIndex) => {
      return (
        <CardDeck key={'row' + keyIndex}>
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