const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors())
app.options('*', cors())

app.listen(8080)
app.get('/:profileNumber', async (req,res) => {
    const {profileNumber} = req.params
    try {
        const data = await getInfo(profileNumber)
        res.json(data)
    } catch(e){
        console.log(e)
        res.json({})
    }
})


async function getInfo(profileNumber){
    const {getStreams} = require('./steam_and_twitch')
    const url = 'https://store.steampowered.com/wishlist/profiles/' + profileNumber
    const data = await getStreams(url)
    return data
}