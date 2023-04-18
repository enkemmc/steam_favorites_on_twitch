use fancy_regex::Regex;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use rocket::response::status::NotFound;
use rocket::http::hyper::uri::Uri;
use rocket::serde::json::Json;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

lazy_static! {
    pub static ref PROFILE_REGEX: Regex = Regex::new(r#"(?<=g_rgProfileData = )(.+)(?=;)"#).unwrap();
    pub static ref GAMES_REGEX: Regex = Regex::new(r#"(?<=var g_rgWishlistData = )(\[.+\])"#).unwrap();
    pub static ref TWITCH_SETTINGS: String = "some settings".to_string();
    pub static ref CLIENT_ID: String = std::env::var("CLIENT_ID").expect("no CLIENT_ID variable set");
    pub static ref BEARER_TOKEN: String = std::env::var("BEARER_TOKEN").expect("no BEARER_TOKEN variable set");
}

/// Receive a message from a form submission and broadcast it to any receivers.
#[get("/<steamUserName>")]
pub async fn get_streams_by_username(steamUserName: String) -> std::result::Result<Json<StreamData>, NotFound<String>>  {
    let streamdata = get_streams(steamUserName).await.unwrap();
    Ok(Json(streamdata))
}

// scrapes profileid via username
// scrapes appids off of the username's profile
// gets gamename from steam's actual api via appid
async fn get_streams(username: String) -> Result<StreamData> {
    let client = reqwest::Client::new();
    let appids = steam::get_app_ids(username, &client).await?;
    let mut data = vec![];

    for appid in appids {
        let name = steam::get_gamename(appid, &client).await?;
        let twitchid = twitch::get_twitchid(&name, &client).await?;
        let streams = twitch::get_streams_by_id(twitchid, &client).await?;
        data.push(GameResult {
            name,
            streams
        });
    }

    Ok(StreamData {
        data
    })
}

mod twitch {
    use super::{Result, CLIENT_ID, BEARER_TOKEN, GameResult, GameStream};
    use reqwest::Client;
    use serde::{Serialize, Deserialize};

    fn encodeURI(initial: &str) -> String {
        let raw = rocket::http::RawStr::new(initial);
        let cow = raw.percent_encode();
        cow.to_string()
    }

    pub async fn get_twitchid(gamename: &str, client: &Client) -> Result<String> {
        //let client = reqwest::Client::new();
        let encoded = encodeURI(gamename);
        let url = format!("https://api.twitch.tv/helix/games?name={}", encoded);

        let json: serde_json::Value = client.get(url.to_string())
            .header("Client-ID", CLIENT_ID.clone())
            .header("Authorization", format!("Bearer {}", BEARER_TOKEN.clone()))
            .send()
            .await?
            .json()
            .await?;
        let id = serde_json::from_value::<String>(json["data"][0]["id"].clone()).expect("parseable json");
        Ok(id)
    }

    #[derive(Serialize, Deserialize)]
    pub struct GetStreamsJson {
        user_name: String,
        viewer_count: i32,
        thumbnail_url: String,
        title: String,
    }

    pub async fn get_streams_by_id(twitchid: String, client: &Client) -> Result<Vec<GameStream>> {
        let url = format!("https://api.twitch.tv/helix/streams?game_id={}", twitchid);
        let json: serde_json::Value = client.get(url)
            .header("Client-ID", CLIENT_ID.clone())
            .header("Authorization", format!("Bearer {}", BEARER_TOKEN.clone()))
            .send()
            .await?
            .json()
            .await?;

        let streamers: Vec<GetStreamsJson> = serde_json::from_value(json["data"].clone()).expect("parseable json");
        let gamestreams = streamers
            .into_iter()
            .map(|s| {
                let GetStreamsJson { user_name, viewer_count, thumbnail_url, title } = s;
                let thumbnail = thumbnail_url
                    .replace("{width}", "320")
                    .replace("{height}", "180");

                GameStream {
                    url: format!("https://www.twitch.tv/{}", user_name),
                    viewers: viewer_count,
                    thumbnail,
                    title
                }
            })
            .collect();

        Ok(gamestreams)
    }

    #[cfg(test)]
    mod twitch_tests {
        use super::super::Result;
        use super::{get_twitchid, get_streams_by_id, encodeURI};

        #[tokio::test]
        async fn test_get_twitchid() -> Result<()> {
            let client = reqwest::Client::new();
            let gamename = "Terraria".to_string();
            let expected = "31376".to_string();
            let id = get_twitchid(&gamename, &client).await.unwrap();
            assert_eq!(id, expected);
            Ok(())
        }


        #[tokio::test]
        async fn test_get_streamsbyid() -> Result<()> {
            let client = reqwest::Client::new();
            let id = "31376".to_string();
            let expected = 5;
            let streams = get_streams_by_id(id, &client).await.unwrap();
            assert!(!streams.is_empty());
            Ok(())
        }

        #[test]
        fn test_encodeuri_1() {
            let expected = "Remnant:%20From%20the%20Ashes".to_string();
            let initial = "Remnant: From the Ashes".to_string();
            let encoded = encodeURI(&initial);
            assert_eq!(encoded, expected);
        }
    }
}

mod steam {
    use super::{Result, GAMES_REGEX, PROFILE_REGEX, Deserialize};
    use reqwest::{self, Client};

    async fn get_profile_id(username: String, client: &Client) -> Result<String> {
        let html: String = client.get(format!("https://steamcommunity.com/id/{}/", username))
            .send()
            .await?
            .text()
            .await?;
    
        let pmatch = PROFILE_REGEX.find(&html)?;
        let html_string = pmatch.unwrap();
        let json: serde_json::Value = serde_json::from_str(html_string.as_str())?;
        let profileid: String = serde_json::from_value(json["steamid"].clone()).expect("steamid is still extractable from the page source");
        Ok(profileid)
    }

    pub async fn get_app_ids(username: String, client: &Client) -> Result<Vec<String>> {
        let profileid = get_profile_id(username, client).await?;
        let app_ids = scrape_app_ids(profileid, client).await?;
        Ok(app_ids)
    }

    #[derive(Deserialize)]
    struct ExtractAppid {
        appid: i32
    }

    async fn scrape_app_ids(profileid: String, client: &Client) -> Result<Vec<String>> {
        let steam_url = format!("https://store.steampowered.com/wishlist/profiles/{}", profileid);
        let html: String = client.get(steam_url)
            .send()
            .await?
            .text()
            .await?;
        let wlmatch = GAMES_REGEX.find(&html)?;
        let json_string = wlmatch.expect("regex matches");
        let appids: Vec<String> = serde_json::from_str::<Vec<ExtractAppid>>(json_string.as_str())?
            .into_iter()
            .map(|extracted| extracted.appid.to_string())
            .collect();
        Ok(appids)
    }

    pub async fn get_gamename(appid: String, client: &Client) -> Result<String> {
        let steam_url = format!("https://store.steampowered.com/api/appdetails/?appids={}", appid);
        let json: serde_json::Value = client.get(steam_url)
            .send()
            .await?
            .json()
            .await?;
        let name = serde_json::from_value::<String>(json[appid]["data"]["name"].clone())
            .expect("steam api hasnt changed")
            .replace(|c: char| !c.is_ascii(), "");
        Ok(name)
    }

    #[cfg(test)]
    mod steam_tests {
        use reqwest::Client;

        use super::super::Result;
        use super::{get_app_ids, scrape_app_ids, get_profile_id, get_gamename};

        #[tokio::test]
        async fn test_get_profile_id() -> Result<()> {
            let client = Client::new();
            let username = "wishlist_example".to_string();
            let expected = "76561199053582024".to_string();
            let profile_id = get_profile_id(username, &client).await.unwrap();
            assert_eq!(profile_id, expected);
            Ok(())
        }

        #[tokio::test]
        async fn test_scrape_appids() -> Result<()> {
            let client = Client::new();
            let expected: Vec<String> = vec!["105600", "617290", "814000", "892970", "1100600"]
                .into_iter()
                .map(|a| a.to_string())
                .collect();
            let profileid = "76561199053582024".to_string();
            let appids = scrape_app_ids(profileid, &client).await.unwrap();
            assert_eq!(appids, expected);
            Ok(())
        }

        #[tokio::test]
        async fn test_get_appids() -> Result<()> {
            let client = Client::new();
            let username = "wishlist_example".to_string();
            let appids = get_app_ids(username, &client).await.unwrap();
            let expected: Vec<String> = vec!["105600", "617290", "814000", "892970", "1100600"]
                .into_iter()
                .map(|a| a.to_string())
                .collect();
            assert_eq!(appids, expected);
            Ok(())
        }

        #[tokio::test]
        async fn test_get_gamename() -> Result<()> {
            let client = reqwest::Client::new();
            let appid = "105600".to_string();
            let gamename = get_gamename(appid, &client).await.unwrap();
            let expected = "Terraria".to_string();
            assert_eq!(gamename, expected);
            Ok(())
        }

        async fn test_fail_get_appids() -> Result<()> {
            // write some test for when the profile cant be found
            //  * profile doesnt exist
            //  * profile isnt public
            //  * steam changes something
            todo!()
        }
    }
}


#[derive(Serialize)]
pub struct StreamData {
    data: Vec<GameResult>
}


// the value that will be displayed on an individual card
#[derive(Debug, Serialize)]
pub struct GameStream {
    url: String,
    viewers: i32,
    thumbnail: String,
    title: String
}

#[derive(Debug, Serialize)]
pub struct GameResult {
    name: String,
    streams: Vec<GameStream>
}
