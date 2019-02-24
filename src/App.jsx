import React, { Component } from 'react';
import {Form, Button, Container, Card, CardGroup, CardColumns, Row, Col, CardDeck} from 'react-bootstrap'
import logo from './logo.svg';
import './App.css';


class App extends Component {

  constructor(){
    super()
    this.state = {
      value: '',
      games: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  handleSubmit = async e => {
    e.preventDefault()
    const profileid = this.state.value.split('/profiles/')[1].replace('/', '')
    const serverpath = 'http://73.254.14.184:8080/'
    const json = await fetch(serverpath + `${profileid}`).then(res => res.json())
    this.setState({games: json})
  }

  _handleSubmit = e => {
    console.log('clicked')
    e.preventDefault()
    const fakejson = [
      {
        name: "Game 1",
        streams: [
          {url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1"},
          {url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2"}
        ]
      },
      {
        name: "Game 2",
        streams: [
          {url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 1"},
          {url: "www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 21"}
        ]
      }
    ]

    this.setState({
      games: fakejson
    })
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    const gameNames = Object.keys(this.state.games)
    return (
      <div className="App">
      <Container>
        <Form onSubmit={e => this.handleSubmit(e)}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Steam Profile</Form.Label>
            <Form.Control type="text" placeholder="https://store.steampowered.com/wishlist/profiles/76561197993032511" name="profileUrl" value={this.state.value} onChange={this.handleChange}/>
            <Form.Text className="text-muted">
              Make sure it's set to public.
            </Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit" onClick={() => this.handleSubmit}>
            Submit
          </Button>
        </Form>
      </Container>
      {(
        this.state.games.map((game, index) => {
         return (
           <Container>
        <CardDeck key={index}>          
            {game.streams.map((stream, index) => {
              return (
                <TwitchCard props={stream} key={game + index} />
              )
            })}
        </CardDeck>
        </Container>
          )
        })
      )}
      </div>
    )
  }
}

function TwitchCard({props}){
  const {url, viewers, thumbnail, title} = props
  console.log(props)

    return (
      
      <Card style={{ width: '18rem' }} key={title} onClick={() => window.location=url}>
        <Card.Img variant="top" src={thumbnail}/>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            Viewers - {viewers}
          </Card.Text>
        </Card.Body>
      </Card>
      
    )
}

export default App;
