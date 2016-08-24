const http = require('http')
const conversion = require('phantom-html-to-pdf')()

const server = http.createServer((req, res) => {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk.toString()
  })

  req.on('end', function () {
    const opts = JSON.parse(data)

    console.log(JSON.stringify(opts))

    conversion(opts, (err, pdf) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        return res.end('Error when executing script ' + err.stack)
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/octet-stream')
      pdf.stream.pipe(res)
    })
  })
})

server.listen(4000)
