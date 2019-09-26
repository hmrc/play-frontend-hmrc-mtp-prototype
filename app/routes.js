const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.post('/confirm', (req, res) => {
  req.session.data = {submitted: true}
  res.redirect('/confirm')
})

router.post('/name', (req, res) => {
  if (!req.body.name) {
    res.render('name-error-empty.html')
  } else {
    res.redirect('/phone-number')
  }
})

router.post('/phone-number', (req, res) => {
  if (!req.body.phoneNumber) {
    res.render('phone-number-error-empty.html')
  } else if (!req.body.phoneNumber.match(/^0[0-9]{10}$/)) {
    res.render('phone-number-error-invalid.html')
  } else {
    res.redirect('/can-we-write')
  }
})

router.post('/can-we-write', (req, res) => {
  if (!req.body.canWeWrite) {
    res.render('can-we-write-error-empty.html')
  } else if (req.body.canWeWrite === 'Yes') {
    res.redirect('/address')
  } else {
    res.redirect('/summary')
  }
})

router.post('/address', (req, res) => {
  if (!req.body.address.match(/[a-zA-Z0-9]+/)) {
    res.render('address-error-empty.html')
  } else {
    res.redirect('/summary')
  }
})

router.get('/summary', (req, res) => {
  const sessionData = req.session.data
  if (sessionData.address) {
    res.render('summary-with-address', {
      formattedAddress: (sessionData.address || 'No Address').replace(/\n/g, '<br/>')
    })
  } else {
    res.render('summary-without-address')
  }
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
redirectIfNotSet('/summary', ['name', 'phoneNumber', 'canWeWrite'], '/address')
redirectIfNotSet('/address', ['name', 'phoneNumber', 'canWeWrite'], '/can-we-write')
redirectIfNotSet('/can-we-write', ['name', 'phoneNumber'], '/address')
redirectIfNotSet('/phone-number', ['name'], '/name')

module.exports = router
