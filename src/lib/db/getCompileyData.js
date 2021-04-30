const db = require('./index');

const getCompileyData = ({ year, month }) => {
  try {
    const query = db.prepare(
      'SELECT (CASE WHEN pIns.t_start IS NOT NULL THEN pIns.t_start ELSE pImg.t_start END) AS [timestamp], (CASE WHEN pIns.day IS NOT NULL THEN (SELECT combo FROM [days] WHERE id = pIns.day) ELSE (SELECT combo FROM [days] WHERE id = pImg.day) END) AS [days], (SELECT [name] FROM names WHERE id = pImg.imageName) AS filename, (SELECT [name] FROM names WHERE id = pImg.channelName) AS channel, (SELECT [name] FROM names WHERE id = pIns.userName) AS user, pIns.psTime AS pstime, pIns.calcTime AS calctime FROM pImg LEFT JOIN pIns ON pImg.id = pIns.pImg LEFT JOIN [days] ON [days].combo = [days] WHERE [days].[year] = @year AND [days].[month] = @month'
    );
    return query.all({ year, month });
  } catch (error) {
    console.error(error);
  }
  console.log({ year, month });
  return { year, month };
};

module.exports = getCompileyData;
