require('dotenv').config()
const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const fs = require('fs')

const {TWITCH_API_KEY} = process.env
const profilepath = 'http://store.steampowered.com/wishlist/profiles/76561197993032511'

class TwitchScraper {
    async getGameUrls(name){
        const twitchurl = 'https://www.twitch.tv/'
        console.log('gettingfile')
        console.log('------------')
        const browser = await puppeteer.launch({
            // headless: false
        })
        const page = await browser.newPage()
        await page.goto(twitchurl)
        console.log(`Loading ${twitchurl}`)
        console.log('--------')

        const selector = 'button[aria-label="Search"]'
        await page.waitForSelector(selector)
        const searchBoxRes = await page.$$(selector)
        const searchBox = searchBoxRes[0]
        
        await searchBox.click()
        await page.keyboard.type(name)
        // await searchBox.type(name)
        console.log('typing in ', name)
        
        // wait for dropdown
        const dropdownselector = '.search-result-section__listing-wrapper'
        await page.waitForSelector(dropdownselector)
        console.log('waiting for search results')
        const searchresults = await page.$$(dropdownselector)

        const firstgameselector = 'a.tw-interactive'
        let gameHrefs = []
        for (let result of searchresults){  
            const game = await result.$(firstgameselector)
            const href = await page.evaluate(e => e["href"], game)
            gameHrefs.push(href)
        }
        await browser.close()
        return gameHrefs
    }

    // profilepath = steam wishlist
    // eg 'https://store.steampowered.com/wishlist/profiles/76561197993032511'
    async getFavoriteTitles(profilepath) {
        console.log('gettingfile')
        console.log('------------')
        const browser = await puppeteer.launch({
            
        })
        const page = await browser.newPage()
        await page.goto(profilepath)
        console.log(`Loading ${profilepath}`)
        console.log('--------')
        const selector = '.title'
        await page.waitForSelector(selector)
        const elements = await page.$$(selector)
        let titles = []

        for (let element of elements){
            const html = await page.evaluate(a => a.innerHTML, element)
            titles.push(html.replace(/[\u{0080}-\u{FFFF}]/gu,"").trim())
        }
        
        await browser.close()
        return titles
    }

    async getIdFromName(name){
        const myurl = `https://api.twitch.tv/helix/games?name=${name}`
        return await fetch(myurl, {
            headers: {
                'Client-ID': TWITCH_API_KEY
            }
        }).then(res => res.json()).then(json => json.data[0].id)

        //https://api.twitch.tv/helix/streams?game_id=488564
    }

    async getStreamsAndViewers(id){
        const myurl = `https://api.twitch.tv/helix/streams?game_id=${id}`
        const viewersArr = await fetch(myurl, {
            headers: {
                'Client-ID': TWITCH_API_KEY
            }
        }).then(res => res.json()).then(json => json.data)
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
}

async function getStreams(url){
    const scraper = new TwitchScraper()
    const gameNames = await scraper.getFavoriteTitles(url)
    let friendlyGameNames = []
    const twitchIdsPromises = await gameNames.map(async name => {
        const urls = await scraper.getGameUrls(name)
        if (urls[0].includes('/game/')){
            const gamename = urls[0].split('/game/')[1]
            friendlyGameNames.push(name)
            return await scraper.getIdFromName(gamename)
        } else {
            return
        }
    })
    const twitchIdsArr = await Promise.all(twitchIdsPromises)
    // console.log(twitchIdsArr)
    const streamUrlAndViewersPromises = twitchIdsArr.map(gameName => {
        return scraper.getStreamsAndViewers(gameName)
    })
    const results = await Promise.all(streamUrlAndViewersPromises)
    const mappedResults = friendlyGameNames.map((name, index)=> {
        return {
            name,
            streams: results[index]
        }
    })
    return mappedResults
}

module.exports = {getStreams}
