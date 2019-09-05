const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

router.use((req, res, next) => {
    req.session.data.formattedAddress = (req.session.data.address || '').replace(/\n/g, '<br/>')
    next()
})

module.exports = router
