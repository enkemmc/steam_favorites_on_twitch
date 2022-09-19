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
            key: fs.readFileSync("./server/certs/privkey1.pem"),
            cert: fs.readFileSync("./server/certs/cert1.pem"),
        },
        app
    ).listen(port, () => console.log(`listening on ${port}`))
// app.listen(port, () => console.log(`listening on port: ${port}`))

app.get('/hello/', (req, res) => {
    res.send('working')
})

app.get('/api/:steamUserName', async (req, res) => {
    const { steamUserName } = req.params
    try {
        const result = await getStreams(steamUserName)
        console.log(result)
        if (result.error) {
            res.json({
                error: result.error
            })
            // handle error
        } else {
            res.json({
                data: result.data
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500)
    }
})

app.get('/', (_req, res) => {
    res.sendFile('index.html')
})
