const http = require('http')
var toArray = require('stream-to-array')

const conversion = require('phantom-html-to-pdf')({
  numberOfWorkers: 2,
  tmpDir: process.env.temp
})

const exactMatch = /(phantomjs-exact-[-0-9]*)/

const resolvePhantomPath = (phantomPath) => {
  const match = exactMatch.exec(phantomPath)

  if (match && match.length === 2) {
    return require(match[1]).path
  }

  return require('phantomjs').path
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    return res.end('OK')
  }
  console.log('processing request')

  var data = ''
  req.on('data', function (chunk) {
    data += chunk.toString()
  })

  const error = (err) => {
    console.error(err)
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')

    return res.end(JSON.stringify({
      error: {
        message: err.message,
        stack: err.stack
      }
    }))
  }

  req.on('end', function () {
    let opts
    try {
      opts = JSON.parse(data)

      opts.phantomPath = resolvePhantomPath(opts.phantomPath)     
    } catch (e) {
      console.error(e)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')

      return res.end(e.stack)
    }

    conversion(opts, (err, pdf) => {
      if (err) {
        return error(err)
      }

      console.log('conversion finished')

      toArray(pdf.stream, (err, arr) => {
        if (err) {
          return error(err)
        }

        console.log('sending response')
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')

        delete pdf.stream
        pdf.content = Buffer.concat(arr).toString('base64')
        res.end(JSON.stringify(pdf))
      })
    })
  })
})

server.listen(4000)
