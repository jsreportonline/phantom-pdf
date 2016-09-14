const http = require('http')
var toArray = require('stream-to-array')
const conversion = require('phantom-html-to-pdf')({
  numberOfWorkers: 2
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
  var data = ''
  req.on('data', function (chunk) {
    data += chunk.toString()
  })

  req.on('end', function () {
    const opts = JSON.parse(data)

    console.log(JSON.stringify(opts))

    opts.phantomPath = resolvePhantomPath(opts.phantomPath)

    conversion(opts, (err, pdf) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        return res.end('Error when phantomjs ' + err.stack)
      }

      toArray(pdf.stream, (err, arr) => {
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
