import React, { Component } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap'
import { CardDeckLayout } from './CustomCards'
import './App.css';

const placeholderSteamId = 'https://steamcommunity.com/id/avaray/'
const { REACT_APP_SERVER_ENDPOINT, NODE_ENV } = process.env

class App extends Component {

  constructor() {
    super()
    this.state = {
      value: placeholderSteamId,
      games: []
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
  }

  handleSubmit = async e => {
    e.preventDefault()
    if (!this.state.value.includes('https://steamcommunity.com/id/')) {
      alert('Check URL format.')
      return
    }
    const profileid = this.state.value.split('/id/')[1].replace('/', '')
    const serverpath = REACT_APP_SERVER_ENDPOINT || '/api/'
    console.log(NODE_ENV)
    console.log(serverpath)
    // console.log('fetchin:', serverpath + profileid)
    try {
      const json = await fetch(serverpath + profileid).then(res => res.json())
      console.log(`received:`)
      console.log(`${JSON.stringify(json, null, 3)}`)
      this.setState({ games: json })
    } catch (e) {
      alert('Make sure steam profile is set to public.  Test the url in a Chrome incognito browser to confirm visibility.')
    }

  }

  //dummy data
  _handleSubmit = e => {
    e.preventDefault()
    const fakejson = [
      {
        name: "Game 1",
        streams: [
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1" },
          { url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2" }
        ]
      },
      {
        name: "Game 2",
        streams: [
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 1" },
          { url: "www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 21" }
        ]
      }
    ]

    this.setState({
      games: fakejson
    })
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div className="App">
        <Container>
          <Form onSubmit={e => this.handleSubmit(e)}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Steam Profile</Form.Label>
              <Form.Control type="text" placeholder={placeholderSteamId} name="profileUrl" value={this.state.value} onChange={this.handleChange} />
              <Form.Text className="text-muted">
                Make sure it's set to public.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" onClick={e => this.handleSubmit(e)}>
              Submit
            </Button>
          </Form>
        </Container>
        {(this.state.games) ? (
          this.state.games.map((game) => {
            return (
              (game.streams.length > 0) ?
                <Container key={game.name}>
                  <Card>
                    <Card.Header as="h2">{game.name}</Card.Header>
                  </Card>
                  <CardDeckLayout maxRowLength={4} game={game} />
                </Container>
                : null)
          })
        ) : null}
      </div>
    )
  }
}

export default App;
