Simple React app that takes a user's public Steam wishlist and displys any live Twitch streams of those games, ordered from highest view-count to lowest view-count.

Input Example: 
https://store.steampowered.com/wishlist/profiles/76561197971155323/

npm install
npm build
node app


expected folder structure:
root
    build
    node_modules
    public
    server
        server.js
    src 
    package.json
    .env


helpful content:
  hosting & portforwarding w/ wsl2 - https://www.youtube.com/watch?v=ACjlvzw4bVE&ab_channel=JohnCapobianco


how am i generating the certs for the http server?
https://docs.google.com/document/d/1m8dXIYXqFITHagkyyVHvzikvPVOgdb0A_XjY6mLf8yg/edit

how does the server work for test and prod?
  test:
    "localhost" works unexpectedly.  when i try to run the server on wsl, and reference the server via localhost in the react code, it cannot find the server.
    i am working around this by running the server on a rpi
  prod:
    hosting the server on the rpi on https.  using llyth as a target for the frontend

what's the default steam name going to be?
  wishlist_example
    this is a dummy account i set up just for this.  its assocaited with my personal email  
