require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express()
const path = require('path')
const { getStreams } = require('./steam_and_twitch')

app.use(cors())
app.use(express.static('./build'))
app.options('*', cors())

const port = process.env.PORT || 3005

app.listen(port, () => console.log(`listening on ${port}`))

app.get('/api/:steamUserName', async (req, res) => {
    const { steamUserName } = req.params
    try {
        const data = await getStreams(steamUserName)
        res.json(data)
    } catch (e) {
        console.log(e)
        res.json({})
    }
})

app.get('/', (_req, res) => {
    res.sendFile('index.html')
})