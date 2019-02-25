require('dotenv').config()
const {TWITCH_API_KEY} = process.env
const fetch = require('node-fetch')
const fs = require('fs')
const urlprefix = 'https://store.steampowered.com/api/appdetails/?appids='

function getUrl(name){
    return encodeURI(`https://api.twitch.tv/kraken/search/games?query=${name}&type=suggest`)
}

const settings = {
    headers: {
        'Client-ID': TWITCH_API_KEY
    }
}

async function getStreams(appid){
    const paturl = 'https://store.steampowered.com/wishlist/profiles/' + appid
    const html = await fetch(paturl).then(res => res.text())
    const regex = /(?<=var g_rgWishlistData = )(\[.+\])/g    
    const favoritesJson = JSON.parse(html.match(regex))    
    const gamesAndIdsArrProms = favoritesJson.map(async favorite => {        
        const steamUrl = urlprefix + favorite.appid
        const steamJson = await fetch(steamUrl).then(res => res.json())
        const {name} = steamJson[favorite.appid].data
        const twitchUrl = getUrl(name)
        // console.log(twitchUrl)
        const twitchJson = await fetch(twitchUrl, settings).then(res => res.json())
        return await getGamesAndIds(twitchJson, name)
    })

    const gamesAndIdsArr = await Promise.all(gamesAndIdsArrProms)
    // fs.writeFileSync('./data.json', JSON.stringify(gamesAndIdsArr, null, 2))
    // console.log(gamesAndIdsArr)
    return gamesAndIdsArr
}

async function getGamesAndIds(obj, steamName){
    const games = obj["games"][0]
    // console.log(Object.keys(obj))
    if (!games){
        // console.log(obj)
        return {
            name: steamName,
            streams: []
        }
    }
    // console.log(obj)
    const {_id, name} = games
    return {
        name,
        streams: await getStreamsAndViewers(_id)
    }
}

async function getStreamsAndViewers(id){
    const myurl = `https://api.twitch.tv/helix/streams?game_id=${id}`
    const viewersArr = await fetch(myurl, settings).then(res => res.json()).then(json => json.data)
    return viewersArr.map(viewerObj => {
        const thumbnail = viewerObj['thumbnail_url'].replace('{width}', 320).replace('{height}', 180)

        return {
            url: `https://www.twitch.tv/${viewerObj.user_name}`,
            viewers: viewerObj['viewer_count'],
            thumbnail,
            title: viewerObj.title
        }
    })
}

module.exports = {getStreams}

// fetch('https://api.twitch.tv/kraken/search/games?query=Metal%20Wolf%20Chaos%20XD&type=suggest', args).then(res => res.json()).then(json => console.log(json))

