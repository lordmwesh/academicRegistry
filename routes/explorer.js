var express = require('express');
var router = express.Router();

/* GET explorer page. */
router.get('/', function(req, res, next) {
  res.render('explorer');
});

module.exports = router;
