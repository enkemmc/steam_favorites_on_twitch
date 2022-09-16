import { Form, Button, Container, Card, CardGroup, CardColumns, Row, Col, CardDeck } from 'react-bootstrap'
import React, { Component } from 'react';
import './CustomCards.css'

function TwitchCard({ props }) {
  const { url, viewers, thumbnail, title } = props

  return (

    <Card key={title} onClick={() => window.location = url} style={{ cursor: 'pointer' }}>
      <Card.Img variant="top" src={thumbnail} />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          Viewers - {viewers}
        </Card.Text>
      </Card.Body>
    </Card>

  )
}

function EmptyCard() {
  return (
    <Card className="empty">
      <Card.Img variant="top" />
      <Card.Body>
        <Card.Title></Card.Title>
        <Card.Text>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

function CardDeckLayout({ maxRowLength, game }) {
  if (!game) {
    return null
  }

  if (!game.streams) {
    return null
  }

  const numberOfRows = Math.ceil(game.streams.length / maxRowLength)
  let cardsArr = game.streams.map((stream, index) => {
    return <TwitchCard props={stream} key={game + index} />
  })

  // fill row with empties
  for (let i = 0; i < (numberOfRows * maxRowLength) - game.streams.length; i++) {
    cardsArr.push(<EmptyCard />)
  }

  let cardsInDecks = []

  for (let row = 0; row <= numberOfRows; row++) {
    let currentRowArr = []
    for (let cardIndex = 0; cardIndex < maxRowLength; cardIndex++) {
      const indexOfCardInCardsArr = (maxRowLength * row) + cardIndex
      const card = cardsArr[indexOfCardInCardsArr]
      currentRowArr.push(card)
    }
    cardsInDecks[row] = currentRowArr
  }

  function makeRow(rowOfCards, keyIndex) {
    return (
      <CardDeck key={'row' + keyIndex}>
        {rowOfCards}
      </CardDeck>
    )
  }

  return (
    cardsInDecks.map((row, keyIndex) => {
      return makeRow(row, keyIndex)
    })
  )
}



export { TwitchCard, CardDeckLayout }