const db = require('./index');

const getCompileyMeta = year => {
  if (!year || isNaN(year)) year = 2010;
  try {
    const query = db.prepare(
      'SELECT [year], [month], sum(images) AS images, sum(pstime) AS pstime, count(DISTINCT channel) AS channels, count(DISTINCT user) AS users FROM (SELECT (CASE WHEN pIns.t_start IS NOT NULL THEN pIns.t_start ELSE pImg.t_start END) AS [timestamp], (CASE WHEN pIns.day IS NOT NULL THEN (SELECT combo FROM [days] WHERE id = pIns.day) ELSE (SELECT combo FROM [days] WHERE id = pImg.day) END) AS dayz, (SELECT [name] FROM names WHERE id = pImg.imageName) AS [filename], (SELECT [name] FROM names WHERE id = pImg.channelName) AS channel, (SELECT [name] FROM names WHERE id = pIns.userName) AS user, sum(pIns.psTime) AS pstime, count(1) AS images, [days].* FROM pImg LEFT JOIN pIns ON pImg.id = pIns.pImg LEFT JOIN [days] ON [days].combo = dayz WHERE days.year >= @year GROUP BY [year], [month], channel, user) GROUP BY [year], [month]'
    );
    return query.all({ year });
  } catch (error) {
    console.error(error);
  }
};

module.exports = getCompileyMeta;
