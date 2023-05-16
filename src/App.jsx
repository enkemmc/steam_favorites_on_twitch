import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Spinner from 'react-bootstrap/Spinner'
import './App.css'
import SteamPic from './assets/steam2.gif'

const placeholderSteamId = 'https://steamcommunity.com/id/wishlist_example/'
const { REACT_APP_SERVER_ENDPOINT, NODE_ENV } = process.env

class App extends Component {

  constructor() {
    super()
    this.state = {
      loading: false,
      value: placeholderSteamId,
      games: [],
      endpoint: NODE_ENV === 'development' ? '/' : REACT_APP_SERVER_ENDPOINT
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
    console.log(`mode is: ${NODE_ENV}`)
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
    }, 300)
    const fakejson = [
      {
        name: "Game 1",
        streams: [
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 " },
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 1" },
          { url: "http://www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 2 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 Game 1 - Title 1 " },
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 1" },
          { url: "http://www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 2" },
          { url: "http://www.google.com", viewers: 3, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 1 - Title 2" }
        ]
      },
      {
        name: "Game 2",
        streams: [
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 1" },
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 1" },
          { url: "http://www.google.com", viewers: 4, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 1" },
          { url: "http://www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 21" },
          { url: "http://www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 21" },
          { url: "http://www.google.com", viewers: 8, thumbnail: "https://static-cdn.jtvnw.net/ttv-static/404_preview-291x164.jpg", title: "Game 2 - Title 21" }
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
        <Steam />
      <Container
          style={{
            paddingBottom: '20px'
          }}
        > 
        <div className="myrow" style={{ paddingTop: '50px' }}>
          <div className="mycol">
            <h1>Steam Streamer</h1>
            <ul style={{ listStyleType: 'none', padding: 'auto', paddingTop: '10px' }}>
              <li>1. Add some games to your steam wishlist.</li>
              <li>2. Set your profile to public.</li>
              <li>3. Enter your steam profile URL below.</li>
            </ul>
          </div>
        </div>
        <div className="myrow" style={{ paddingBottom: "10px" }}>
          <div style={{ paddingRight: "5px" }}>
            <Form onSubmit={e => this.handleSubmit(e)}>
              <Form.Group controlId="formBasicEmail">
                <Form.Control as="input" htmlSize={this.state.value.length} type="text" placeholder={placeholderSteamId} name="profileUrl" value={this.state.value} onChange={this.handleChange} />
              </Form.Group>
            </Form>
          </div>
          <div>
            {this.state.loading ? (
              <Button variant="primary" type="submit" disabled className="loader">
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{ marginRight: '5px' }}
                />
                Loading...
              </Button>
            ) : (
              <Button variant="primary" type="submit" onClick={e => this.handleSubmit(e)} className="loader">
              Submit   
              </Button>
            )}
          </div>
        </div>
        </Container>
          {(this.state.games.length) ? (
            <Container 
            className="shade"
            style={{ padding: '1rem', border: '.1px solid lightgrey' , borderRadius: '10px' }}>
              <Accordion flush={true} style={accordionStyles} defaultActiveKey="0">
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
  const handleClick = url => {
    window.open(url, "_blank")
  }

  return (
      streams.length ? (
      <>
        <Accordion.Header fluid="true" >{`${name} (${streams.length})`}</Accordion.Header>
          <Accordion.Body>
          <Row xs={1} md={3} lg={4} className="g-4">
            {streams.map(({ url, viewers, thumbnail, title }, idx) => (
              <Col key={`${name} ${idx}`}>
                <Card 
                  key={title} 
                  onClick={() => handleClick(url)} 
                  className="shade"
                  >
                  <Card.Img variant="top" src={thumbnail} />
                  <Card.Body>
                    <Card.Text className="custom-card-text">{title}</Card.Text>
                    <Card.Text>
                      {viewers} viewers
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

const Steam = () => {
  return (
    <div
      className="steam"
      style={{
        backgroundImage: `url(${SteamPic})`,
      }}
    />
  )
}

export default App;
