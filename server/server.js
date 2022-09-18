require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const app = express()


const { getStreams } = require('./steam_and_twitch')

app.use(cors())
app.use(express.static('./build'))
app.options('*', cors())

const port = process.env.PORT || 3005
https
    .createServer(
        {
            key: fs.readFileSync("./server/ssl/key.pem"),
            cert: fs.readFileSync("./server/ssl/cert.pem"),
        },
        app
    ).listen(port, () => console.log(`listening on ${port}`))

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
