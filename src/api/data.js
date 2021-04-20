const router = require('express').Router();
const getReport = require('../lib/db/getReport');

router.get('/', async (req, res) => {
  console.log('receiving an api request!');
  return res.status(200).send(getReport());
});

module.exports = router;
