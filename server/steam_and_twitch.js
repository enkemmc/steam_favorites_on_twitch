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
function getUrl(id) {
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



function cleanName(name) {
    // remove r's and tm's
    return name.replace(/[\u{0080}-\u{FFFF}]/gu, "")
}

async function getStreams(appid) {
    const paturl = 'https://store.steampowered.com/wishlist/profiles/' + appid
    const html = await fetch(paturl).then(res => res.text())
    const regex = /(?<=var g_rgWishlistData = )(\[.+\])/g
    const favoritesJson = JSON.parse(html.match(regex))
    const gamesAndIdsArrProms = favoritesJson.map(async favorite => {
        const steamUrl = urlprefix + favorite.appid
        const steamJson = await fetch(steamUrl).then(res => res.json())
        const { name } = steamJson[favorite.appid].data
        const cleanedName = cleanName(name)
        const twitchId = await getTwitchId(cleanedName)
        if (twitchId) {
            const twitchUrl = getUrl(twitchId)
            const twitchJson = await fetch(twitchUrl, settings).then(res => res.json())
            return await getGamesAndIds(twitchJson, name)
        } else {
            return {
                name,
                streams: []
            }
        }
    })

    const gamesAndIdsArr = await Promise.all(gamesAndIdsArrProms)
    // fs.writeFileSync('./data.json', JSON.stringify(gamesAndIdsArr, null, 2))
    // console.log(gamesAndIdsArr)
    return gamesAndIdsArr
}

async function getGamesAndIds(obj, steamName) {

    let viewers
    if (obj["data"]) {
        viewers = obj["data"]
    }

    if (!viewers) {
        return {
            name: steamName,
            streams: []
        }
    }
    return {
        name: steamName,
        streams: await getStreamsAndViewers(viewers)
    }
}

async function getStreamsAndViewers(viewersArr) {
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

module.exports = { getStreams }