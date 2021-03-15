SELECT
  (
    SELECT
      name
    FROM
      names
    WHERE
      id = pIns.channelName
  ) AS channelName,
  (
    SELECT
      name
    FROM
      names
    WHERE
      id = pIns.userName
  ) AS userName,
  (
    SELECT
      combo
    FROM
      days
    WHERE
      id = pIns.day
  ) AS combo,
  (
    SELECT
      year
    FROM
      days
    WHERE
      id = pIns.day
  ) AS year,
  (
    SELECT
      month
    FROM
      days
    WHERE
      id = pIns.day
  ) AS month,
  (
    SELECT
      day
    FROM
      days
    WHERE
      id = pIns.day
  ) AS day,
  count(imageName) AS imageCount,
  sum(psTime) AS psTimeSum,
  sum(calcTime) AS calcTimeSum
FROM
  pIns
WHERE
  (
    SELECT
      name
    FROM
      names
    WHERE
      id = pIns.channelName
  ) = 'klz-inspectorEdit'
GROUP BY
  pIns.day,
  pIns.userName
ORDER BY
  combo;