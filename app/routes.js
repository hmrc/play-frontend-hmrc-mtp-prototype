const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

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
    const errors = {name: 'Enter your full name'}
    res.render('name.html', prepareErrorList(errors))
  } else {
    res.redirect('/phone-number')
  }
})

router.post('/phone-number', (req, res) => {
  const errors = {}
  if (!req.body.phoneNumber) {
    errors['phone-number'] = 'Enter your phone number'
  } else if (!req.body.phoneNumber.match(/^0[0-9]{10}$/)) {
    errors['phone-number'] = 'Enter a phone number in the correct format'
  }
  if (Object.keys(errors).length > 0) {
    res.render('phone-number.html', prepareErrorList(errors))
  } else {
    res.redirect('/can-we-write')
  }
})

router.post('/can-we-write', (req, res) => {
  if (!req.body.canWeWrite) {
    const errors = {'can-we-write': 'Select whether we can write to you or not'}
    res.render('can-we-write.html', prepareErrorList(errors))
  } else if (req.body.canWeWrite === 'Yes') {
    res.redirect('/address')
  } else {
    res.redirect('/summary')
  }
})

router.post('/address', (req, res) => {
  if (!req.body.address.match(/[a-zA-Z0-9]+/)) {
    const errors = {address: 'Enter your address'}
    res.render('address.html', prepareErrorList(errors))
  } else {
    res.redirect('/summary')
  }
})

router.get('/summary', (req, res) => {
  const sessionData = req.session.data
  res.render('summary.html', {
    preparedAddress: sessionData.address && sessionData.canWeWrite === 'Yes' ? {
      key: {
        text: 'Address'
      },
      value: {
        html: (req.session.data.address || '').replace(/\n/g, '<br/>')
      },
      actions: {
        items: [
          {
            href: '/address',
            text: 'Change',
            visuallyHiddenText: 'address'
          }
        ]
      }
    } : undefined
  })
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
