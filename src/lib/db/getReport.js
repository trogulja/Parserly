const db = require('./index');

const getReport = () => {
  try {
    const action = 'Use Processed';
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const time = date.getTime();

    const query = db.prepare(
      'SELECT (SELECT combo FROM [days] WHERE id = pIns.day) AS [day], (SELECT [name] FROM names WHERE id = pIns.channelName) AS channelName, (SELECT [name] FROM names WHERE id = pIns.userName) AS userName, (SELECT [name] FROM names WHERE id = pIns.inspectAction) AS inspectAction, sum(psTime) as psTime, round(sum(calcTime)) as calcTime, count(imageName) as images FROM pIns WHERE t_start > @time AND (SELECT [name] FROM names WHERE id = pIns.inspectAction) = @action GROUP BY [day], channelName, userName ORDER BY [day] desc, channelName, userName'
    );

    return query.all({ time, action });
  } catch (error) {
    console.error(error);
  }
};

module.exports = getReport;
