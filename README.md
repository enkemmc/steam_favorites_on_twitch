# Steam Streamer

## Introduction
Steam Streamer is a web application that helps users quickly find live-streams of video games on their Steam wishlist. The application allows users to provide a link to their public wishlist of games from the Steam store, and the application will display live-streaming channels related to those games. 

## Demo
The static front-end for this project is hosted via [Github Pages](https://enkemmc.github.io/steam_favorites_on_twitch/)!

## Usage
If you'd prefer to run the code yourself, you can use the getStreams(steamUserName) function which is exported from the steam_and_twitch.js file in the server folder.  You will need to secure a BEARER_TOKEN and CLIENT_ID from Twitch and provide those as environment variables in order to access their api.

1. Register this code as an app to acquire a Client Id and Bearer token via the twitch documentation [here](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/).
2. Store these two items in an .env file like this:
``` 
CLIENT_ID=yourclientidhere
BEARER_TOKEN=yourbearertokenhere
```
3. Implement your own method of passing a steam username into the getStreams function
4. Implement your own method of handling the resulting payloads from twitch
5. PROFIT!

## Why
I grew up PC gaming, so I've used Steam since it came out.  It's often hard to tell whether a game is going to be worth your time.  This app helps you to quickly "try it before you buy it."
