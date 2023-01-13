import React, { Component } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap'
import { CardDeckLayout } from './CustomCards'
import './App.css';

const placeholderSteamId = 'https://steamcommunity.com/id/wishlist_example/'
const { REACT_APP_SERVER_ENDPOINT, REACT_APP_SERVER_ENDPOINT_DEV, NODE_ENV } = process.env

class App extends Component {

  constructor() {
    super()
    this.state = {
      value: placeholderSteamId,
      games: [],
      endpoint: NODE_ENV === 'development' ? REACT_APP_SERVER_ENDPOINT_DEV : REACT_APP_SERVER_ENDPOINT
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
    console.log(`mode is: ${NODE_ENV}`)
    for (const [k,v] of Object.entries(process.env)) {
      console.log(k, v)
    }
  }

  handleSubmit = async e => {
    e.preventDefault()
    if (!this.state.value.includes('https://steamcommunity.com/id/')) {
      alert('Check URL format.')
      return
    }
    const profileid = this.state.value.split('/id/')[1].replace('/', '')
    try {
      const json = await fetch(this.state.endpoint + profileid).then(res => res.json())
      if (json.error) {
        console.log('there was an error')
        switch (json.error) {
          case 'INVALID_PROFILE':
            alert(`Can't find this profile on steam.`)
            break
          case 'PROFILE_NOT_PUBLIC':
            alert(`Profile isn't set to public.`)
            break
          default:
            alert('Server sent an incomprehensible error.')
            break
        }
      } else {
        console.log(`setting state`)
        console.log(json)
        this.setState({ games: json.data })
      }
    } catch (e) {
      alert('Error accessing the server.')
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
