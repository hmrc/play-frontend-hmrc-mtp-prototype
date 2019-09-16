const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.use('/summary', (req, res, next) => {
  req.session.data.formattedAddress = (req.session.data.address || '').replace(/\n/g, '<br/>')
  next()
})

router.post('/confirm', (req, res) => {
  req.session.data = {submitted: true}
  res.redirect('/confirm')
})

const redirectIfNotSet = (from, keys, to) => {
  router.use(from, (req, res, next) => {
    if (keys.map(key => req.session.data[key] === undefined).includes(true)) {
      res.redirect(to)
    } else {
      next()
    }
  })
}

redirectIfNotSet('/confirm', ['submitted'], '/summary')
redirectIfNotSet('/summary', ['name', 'phoneNumber', 'address', 'canWeWrite'], '/can-we-write')
redirectIfNotSet('/can-we-write', ['name', 'phoneNumber', 'address'], '/address')
redirectIfNotSet('/address', ['name', 'phoneNumber'], '/phone-number')
redirectIfNotSet('/phone-number', ['name'], '/name')

module.exports = router
