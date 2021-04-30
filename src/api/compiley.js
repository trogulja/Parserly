const router = require('express').Router();
const getCompileyMeta = require('../lib/db/getCompileyMeta');
const getCompileyData = require('../lib/db/getCompileyData');

router.get('/meta', async (req, res) => {
  console.log('receiving compiley meta api request!');

  const result = getCompileyMeta();
  const output = result.map(el => ({ [`${el.year}${el.month < 10 ? '0' + el.month : el.month}`]: `i${el.images}t${el.pstime}c${el.channels}u${el.users}` }));

  return res.status(200).send(output);
});

router.get('/data/:yyyymm', async (req, res) => {
  console.log('receiving compiley data api requiest!');

  const yyyymm = Number(req.params.yyyymm);
  if (isNaN(yyyymm)) return res.status(400).send('Bad request.');

  const now = new Date();
  const max = Number(`${now.getFullYear()}${now.getMonth() + 1 < 10 ? '0' : ''}${now.getMonth() + 1}`);
  const year = Math.floor(yyyymm / 100);
  const month = yyyymm % 100;

  if (yyyymm > max) return res.status(400).send('Bad request.');
  if (year < 2015) return res.status(400).send('Bad request.');
  if (month > 12) return res.status(400).send('Bad request.');
  if (month < 1) return res.status(400).send('Bad request.');

  return res.status(200).send(getCompileyData({ year, month }));
});

module.exports = router;
