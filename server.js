const express = require('express')
const app = express()
app.listen(80, () => {
    console.log('react app listening on 80')
})

app.use(express.static('./build'))

app.get('/*', (req, res) => {
    res.sendFile(path.resolve('./build/index.html'))
    //console.log(path.join(__dirname, 'build/index.html'))
})