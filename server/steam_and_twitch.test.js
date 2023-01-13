const { getStreams, getTwitchId, getStreamsById } = require('./steam_and_twitch')

test('getStreams finds gamenames from steam', async () => {
  const default_name = 'wishlist_example'
  const { data } = await getStreams(default_name)
  let found = false
  for (const game of data) {
    if (game.name === 'Valheim') {
      found = true
      break
    }
  }
  expect(found).toBe(true)
})

test('make a twitch api call using our bearer token', async () => {
  const name = await getTwitchId('Valheim')
  expect(name).toBe('508455')
})

test('takes a game name and returns the twitch id', async () => {
  const name = await getTwitchId('Valheim')
  expect(name).toBe('508455')
})

test('finds twitch streams that we know exist', async () => {
  const id = '508455'
  const response = await getStreamsById(id)
  const streams = response.data
  expect(streams.len).not.toBe(0)
})
