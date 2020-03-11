const fs = require('fs')

const file = process.argv.pop()
const [r, s, from, to] = process.argv

if (from === undefined || to === undefined || file === undefined) {
  throw new Error('Args missing')
}

if (from === '--config') {
  const hosts = require(`./${to}`)
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return console.log(err)
    let newData = data
    hosts.forEach(function (host) {
      newData = replaceHost(host.from, host.to, newData)
    })
    fs.writeFile(`new-${file}`, newData, 'utf8', function (err) {
       if (err) return console.log(err)
    })
  })
} else {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return console.log(err)
    const newData = replaceHost(from, to, data)
    fs.writeFile(`new-${file}`, newData, 'utf8', function (err) {
       if (err) return console.log(err)
    })
  })
}

function replaceHost (f, t, data) {
  console.log(`replace: ${f} -> ${t}`)

  const lengthDiff = f.length - t.length

  const fHost = new URL(f).host
  const tHost = new URL(t).host

  const reSerialized = new RegExp(`([0-9]+):"${f}`, 'gi')
  const reDefault = new RegExp(`${f}`, 'gi')
  const reHost = new RegExp(`${fHost}`, 'gi')

  let result = data
  result = result.replace(reSerialized, function (str, length, decalage, chaine) {
    const newLength = parseInt(length) - lengthDiff
    return `${newLength}:"${t}`
  })
  result = result.replace(reDefault, function (str, decalage, chaine) {
    return t
  })
  result = result.replace(reHost, function (str, decalage, chaine) {
    return tHost
  })

  return result
}
