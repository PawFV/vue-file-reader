/* eslint-disable no-unused-vars */
const parser = require('vue-template-compiler')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
var start = new Date()
var hrstart = process.hrtime()

function getFiles(src, callback) {
  console.log(src)
  glob(src + '/**/*.vue', callback)
}

getFiles(path.join(__dirname, '../'), (err, filePaths) => {
  if (err) return console.log('Error', err)
  let templates = []

  const promises = filePaths.map(filePath => {
    try {
      const data = fs.readFileSync(filePath, 'utf8', (err, data) => {
        if (err) throw err

        const parsed = parser.parseComponent(data)
        if (parsed.template) {
          return parsed.template
        }
      })
      templates.push(data)
    } catch (error) {
      console.log(error)
    }
  })

  const materialIcons = fs.readFileSync(
    path.join(__dirname, '/material-icons.js'),
    'utf-8'
  )

  Promise.all(promises, materialIcons)
    .then(_ => {
      const regex = /([A-z]*Icon)(?=,|\r\n})/gi
      const icons = materialIcons.match(regex)
      let filesText = ''
      templates.map(t => (filesText += t))

      function countIcons(iconName) {
        const myReg = new RegExp('(<' + iconName + ')', 'gi')
        const IconCount = filesText.match(myReg)
        return IconCount === null ? 0 : IconCount.length
      }

      const iconsData = icons.map(icon => {
        return {
          icon: icon,
          count: countIcons(icon),
          backgroundColor:
            '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
      })

      fs.writeFile(
        __dirname + '/iconStats.json',
        JSON.stringify(iconsData),
        err => {
          if (err) throw err
        }
      )
      var end = new Date() - start,
        hrend = process.hrtime(hrstart)

      console.info('Execution time: %dms', end)
      console.info('Execution hr: %ds %dms', hrend[0], hrend[1] / 1000000)
    })
    .catch(err => {
      console.error(err)
    })
})
