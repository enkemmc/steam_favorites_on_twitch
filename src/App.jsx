import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap'
import './App.css';
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'

const placeholderSteamId = 'https://steamcommunity.com/id/wishlist_example/'
const { REACT_APP_SERVER_ENDPOINT, REACT_APP_SERVER_ENDPOINT_DEV, NODE_ENV } = process.env

class App extends Component {

  constructor() {
    super()
    this.state = {
      loading: false,
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
      this.setState({
        loading: true
      })
      const json = await fetch(this.state.endpoint + profileid).then(res => res.json())
      this.setState({
        loading: false
      })
      if (json.error) {
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
        this.setState({ games: json.data, loading: false })
      }
    } catch (e) {
      this.setState({
        loading: false
      })
      alert('Error accessing the server.')
    }

  }

  //dummy data
  _handleSubmit = e => {
    e.preventDefault()
    this.setState({
      loading: true
    })
    setTimeout(() => {
      this.setState({
        games: fakejson,
        loading: false
      })
    }, 1000)
    const fakejson = [
      {
        name: "Game 1",
        streams: [
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1" },
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1" },
          { url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2" },
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 1" },
          { url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2" },
          { url: "www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 1 - Title 2" }
        ]
      },
      {
        name: "Game 2",
        streams: [
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 1" },
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 1" },
          { url: "www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 1" },
          { url: "www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 21" },
          { url: "www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 21" },
          { url: "www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-110x110.jpg", title: "Game 2 - Title 21" }
        ]
      },
      {
        name: "Game 3",
        streams: [
        ]
      }
    ]

  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    const accordionStyles = {
      textAlign: 'left',
      border: '.1px solid lightgrey'
    }

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
                {this.state.loading ? (
                  <Button variant="primary" type="submit" disabled>
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    Loading...
                  </Button>
                ) : (
                  <Button variant="primary" type="submit" onClick={e => this.handleSubmit(e)}>
                  Submit
                  </Button>
                )}
              </Form>
            </Container>
            {(this.state.games.length) ? (
              <Container style={{ padding: '1rem', border: '.1px solid lightgrey' , borderRadius: '10px' }}>
                <Accordion flush={true} style={accordionStyles}>
                {this.state.games
                  .map((game, gi) => {
                  return (
                    <Accordion.Item eventKey={`${gi}`} key={`item ${gi}`}>
                      <GameAccordionItems game={game} />
                    </Accordion.Item>
                  )
                })}
                </Accordion>
              </Container>
            ) : null}
          </div>
        )  
  }
}

function GameAccordionItems({ game }) {
  const { name, streams } = game
  //const { url, viewers, thumbnail, title } = streams
  return (
      streams.length ? (
      <>
        <Accordion.Header fluid >{name}</Accordion.Header>
          <Accordion.Body>
          <Row xs={1} md={3} className="g-4">
            {streams.map(({ url, viewers, thumbnail, title }, idx) => (
              <Col key={`${name} ${idx}`}>
                <Card 
                  key={title} 
                  onClick={() => window.location = url} 
                  style={{ 
                    cursor: 'pointer', 
                    //width: '220px', 
                    //textOverflow: 'ellipsis',
                    //overflow: 'hidden'  
                  }}
                  >
                  <Card.Img variant="top" src={thumbnail} />
                  <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                      Viewers - {viewers}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Accordion.Body>
      </>
    ) :
    (
      <Accordion.Header fluid className="disabled">{name}</Accordion.Header>
    )
  )
}

//const { url, viewers, thumbnail, title } = props
export default App;
