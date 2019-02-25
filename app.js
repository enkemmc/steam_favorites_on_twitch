const express = require('express')
const cors = require('cors');
const app = express()
app.use(cors())
app.use(express.static('./build'))
app.options('*', cors())

app.listen(8080, () => {
    console.log('listening on 8080')
})

app.get('/api/:profileNumber', async (req,res) => {
    const {profileNumber} = req.params
    try {
        const data = await getInfo(profileNumber)
        // console.log(data)
        res.json(data)
    } catch(e){
        console.log(e)
        res.json({})
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./build/index.html'))
    //console.log(path.join(__dirname, 'build/index.html'))
})

async function getInfo(profileNumber){
    const {getStreams} = require('./steam_and_twitch')
    return await getStreams(profileNumber)    
}