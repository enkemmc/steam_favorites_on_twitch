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
async function getStreamsById(id) {
    const url = encodeURI(`https://api.twitch.tv/helix/streams?game_id=${id}`)
    return await fetch(url, settings).then(res => res.json())
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

// [{ name, stream[] }]
// { error, data: [{ name, stream[] }]}
async function getStreams(steamUserName) {
    let result = {
        error: null,
        data: {
            name: null,
            streams: []
        }
    }
    const userNameUrl = `https://steamcommunity.com/id/${steamUserName}/`
    const userNameHtml = await fetch(userNameUrl).then(res => res.text())
    const profileRegex = /(?<=g_rgProfileData = )(.+)(?=;)/g
    const profileObj = userNameHtml.match(profileRegex)
    if (!profileObj) {
        console.log(`couldnt find a profile at ${userNameUrl}`)
        return {
            error: 'INVALID_PROFILE'
        }
    }
    const profileId = JSON.parse(profileObj[0]).steamid
    const profileIdUrl = 'https://store.steampowered.com/wishlist/profiles/' + profileId
    const html = await fetch(profileIdUrl).then(res => res.text())
    const regex = /(?<=var g_rgWishlistData = )(\[.+\])/g
    const favoritesArr = JSON.parse(html.match(regex))
    if (!favoritesArr) {
        console.log(`couldnt find a match at ${profileIdUrl}`)
        return {
            error: 'PROFILE_NOT_PUBLIC'
        }
    }
    const gamesAndIdsArrProms = favoritesArr.map(async favorite => {
        const steamUrl = urlprefix + favorite.appid
        const steamJson = await fetch(steamUrl).then(res => res.json())
        if (!steamJson[favorite.appid]) {
            return
        }
        const { name } = steamJson[favorite.appid].data
        const cleanedName = cleanName(name)
        const twitchId = await getTwitchId(cleanedName)
        if (twitchId) {
            const apiResponse = await getStreamsById(twitchId)
            return await getStreamers(apiResponse, name)
        } else {
            return {
                name,
                streams: []
            }
        }
    })

    const gamesAndIdsArr = await Promise.all(gamesAndIdsArrProms)
    return {
        data: gamesAndIdsArr
    }
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

module.exports = { getStreams, getTwitchId, getStreamsById }
