require('dotenv').config()
const { CLIENT_ID, BEARER_TOKEN } = process.env
const fetch = require('node-fetch')

const urlprefix = 'https://store.steampowered.com/api/appdetails/?appids='
const settings = {
    headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${BEARER_TOKEN}`
    }
}
function getStreamsUrl(id) {
    return encodeURI(`https://api.twitch.tv/helix/streams?game_id=${id}`)
}

async function getTwitchId(name) {
    const uri = encodeURI(`https://api.twitch.tv/helix/games?name=${name}`)
    const json = await fetch(uri, settings).then(res => res.json())
    if (json.data) {
        if (json.data.length > 0) {
            return json.data[0].id
        }
    }
}



// remove r's and tm's
function cleanName(name) {
    return name.replace(/[\u{0080}-\u{FFFF}]/gu, "")
}

// get profile url
// get html from url
// extract array of objects containing appids of favorites from url using regex
// use these appids to make api calls to steam's appid api 
// extract the name of the game from the response
// remove non-ascii chars from game name
// request the twitch game_id from twitch's api using the steam game name
// if we get a response:
//    request streams of this game from twitch's api
//    return obj with { name, streams[..] }
// if we don't get a response:
//    return obj with { name, streams[] }

async function getStreams(steamUserName) {
    const userNameUrl = `https://steamcommunity.com/id/${steamUserName}/`
    const userNameHtml = await fetch(userNameUrl).then(res => res.text())
    const profileRegex = /(?<=g_rgProfileData = )(.+)(?=;)/g
    const profileObj = userNameHtml.match(profileRegex)
    if (!profileObj) {
        console.log(`couldnt find a profile at ${userNameUrl}`)
        return []
    }
    const profileId = JSON.parse(profileObj[0]).steamid
    const profileIdUrl = 'https://store.steampowered.com/wishlist/profiles/' + profileId
    const html = await fetch(profileIdUrl).then(res => res.text())
    const regex = /(?<=var g_rgWishlistData = )(\[.+\])/g
    const favoritesArr = JSON.parse(html.match(regex))
    if (!favoritesArr) {
        console.log(`couldnt find a match at ${profileIdUrl}`)
        return []
    }
    const gamesAndIdsArrProms = favoritesArr.map(async favorite => {
        const steamUrl = urlprefix + favorite.appid
        const steamJson = await fetch(steamUrl).then(res => res.json())
        const { name } = steamJson[favorite.appid].data
        const cleanedName = cleanName(name)
        const twitchId = await getTwitchId(cleanedName)
        if (twitchId) {
            const twitchUrl = getStreamsUrl(twitchId)
            const res = await fetch(twitchUrl, settings).then(res => res.json())
            return await getStreamers(res, name)
        } else {
            return {
                name,
                streams: []
            }
        }
    })

    const gamesAndIdsArr = await Promise.all(gamesAndIdsArrProms)
    return gamesAndIdsArr
}

async function getStreamers(res, steamName) {

    let streamerArr
    if (res["data"]) {
        streamerArr = res["data"]
    }

    if (!streamerArr) {
        return {
            name: steamName,
            streams: []
        }
    }
    return {
        name: steamName,
        streams: await getStreamsAndViewers(streamerArr)
    }
}

async function getStreamsAndViewers(streamerArr) {
    return streamerArr.map(streamerObj => {
        const thumbnail = streamerObj['thumbnail_url'].replace('{width}', 320).replace('{height}', 180)

        return {
            url: `https://www.twitch.tv/${streamerObj.user_name}`,
            viewers: streamerObj['viewer_count'],
            thumbnail,
            title: streamerObj.title
        }
    })
}

module.exports = { getStreams }