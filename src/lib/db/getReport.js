const db = require('./index');

const getReport = () => {
  try {
    const action = 'Use Processed';
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const time = date.getTime();

    const query = db.prepare(
      'SELECT (SELECT combo FROM days WHERE id = pIns.day) AS day, (SELECT name FROM names WHERE id = pIns.channelName) AS channelName, (SELECT name FROM names WHERE id = pIns.userName) AS userName, (SELECT name FROM names WHERE id = pIns.inspectAction) AS inspectAction, sum(case when pIns.calcTime <= 30 then pIns.psTime else 0 end) AS halbauto_psTime, sum(case when pIns.calcTime > 30 then pIns.psTime else 0 end) AS standard_psTime, sum(psTime) AS psTime, round(sum(case when pIns.calcTime <= 30 then pIns.calcTime else 0 end)) AS halbauto_calcTime, round(sum(case when pIns.calcTime > 30 then pIns.calcTime else 0 end)) AS standard_calcTime, round(sum(calcTime)) AS calcTime, sum(CASE WHEN pIns.calcTime <= 30 THEN 1 ELSE 0 END) AS halbauto, sum(CASE WHEN pIns.calcTime > 30 THEN 1 ELSE 0 END) AS standard, count(1) AS images FROM pIns WHERE t_start > @time AND (SELECT name FROM names WHERE id = pIns.inspectAction) = @action GROUP BY day, channelName, userName ORDER BY day DESC, channelName, userName'
    );

    return query.all({ time, action });
  } catch (error) {
    console.error(error);
  }
};

module.exports = getReport;
