const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let file = process.argv[process.argv.length - 1]
const [r, s, from, to] = process.argv

if (from === undefined || to === undefined) {
  throw new Error('Args missing')
}

const init = async function () {
  if (from === '--config') {
    const config = require(`${process.cwd()}/${to}`)

    if (config.file) file = config.file

    if (config.mysql) {
      file = 'temp-db.sql'
      console.log('database: export')
      const { stdout1, stderr1 } = await exec(`mysqldump ${getMysqlParams(config.mysql)} ${config.mysql.dbname} > temp-db.sql`)
      if (stderr1) throw new Error('Cant export db')
    }

    fs.readFile(file, 'utf8', async function (err, data) {
      if (err) return console.log(err)
      let newData = data
      config.hosts.forEach(function (host) {
        newData = replaceHost(host.from, host.to, newData)
      })
      fs.writeFile(`new-${file}`, newData, 'utf8', async function (err) {
         if (err) return console.log(err)
         if (config.mysql) {
           console.log('database: import')
           const { stdout2, stderr2 } = await exec(`mysql ${getMysqlParams(config.mysql)} ${config.mysql.dbname} < new-temp-db.sql`)
           if (stderr2) throw new Error('Cant import db')
           const { stdout3, stderr3 } = await exec(`rm temp-db.sql new-temp-db.sql`)
           if (stderr3) throw new Error('Cant remove sql files')
         }
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
}

function getMysqlParams (mysql) {
  return mysql.password ? `-h ${mysql.host} -u ${mysql.user} -p${mysql.password}` : `-h ${mysql.host} -u ${mysql.user}`
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

exports.init = init
