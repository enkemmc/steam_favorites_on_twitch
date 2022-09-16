require('dotenv').config()
console.log(`client-id: ${process.env.CLIENT_ID}`)
const express = require('express')
const cors = require('cors');
const app = express()
const path = require('path')
app.use(cors())
app.use(express.static('./build'))
app.options('*', cors())
const port = process.env.PORT || 3005

app.listen(port, () => {
    console.log(`listening on ${port}`)
})

app.get('/api/:profileNumber', async (req, res) => {
    const { profileNumber } = req.params
    try {
        const data = await getInfo(profileNumber)
        res.json(data)
    } catch (e) {
        console.log(e)
        res.json({})
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./build/index.html'))
})

async function getInfo(profileNumber) {
    const { getStreams } = require('./steam_and_twitch')
    return await getStreams(profileNumber)
}