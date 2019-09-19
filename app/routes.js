const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.use('/summary', (req, res, next) => {
  req.session.data.formattedAddress = (req.session.data.address || '').replace(/\n/g, '<br/>')
  next()
})

const prepareErrorList = (errorsIn) => {
  const errors = {}
  const preparedErrorList = []

  Object.keys(errorsIn).forEach(key => {
    preparedErrorList.push({ href: `#${key}`, text: errorsIn[key] })
    errors[key] = { text: errorsIn[key] }
  })

  return {
    preparedErrorList,
    errors
  }
}

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
    res.redirect('/address')
  }
})

router.post('/address', (req, res) => {
  if (!req.body.address.match(/[a-zA-Z0-9]+/)) {
    const errors = {address: 'Enter your address'}
    res.render('address.html', prepareErrorList(errors))
  } else {
    res.redirect('/can-we-write')
  }
})

router.post('/can-we-write', (req, res) => {
  if (!req.body.canWeWrite) {
    const errors = {'can-we-write': 'Please provide an answer'}
    res.render('can-we-write.html', prepareErrorList(errors))
  } else {
    res.redirect('/summary')
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
redirectIfNotSet('/summary', ['name', 'phoneNumber', 'address', 'canWeWrite'], '/can-we-write')
redirectIfNotSet('/can-we-write', ['name', 'phoneNumber', 'address'], '/address')
redirectIfNotSet('/address', ['name', 'phoneNumber'], '/phone-number')
redirectIfNotSet('/phone-number', ['name'], '/name')

module.exports = router
