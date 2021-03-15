SELECT
  channel AS channelName,
  inspectUsername AS userName,
  inspectDate AS combo,
  count(endName) AS imageCount,
  sum(inspectPStime) AS psTimeSum,
  sum(inspectCalcTime) AS calcTimeSum
FROM
  images
WHERE
  channel = 'klz-inspectorEdit'
GROUP BY
  inspectDate,
  inspectUsername
ORDER BY
  combo;