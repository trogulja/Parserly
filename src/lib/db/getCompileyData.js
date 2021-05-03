const db = require('./index');

const getCompileyData = ({ year, month }) => {
  try {
    const query = db.prepare(
      "SELECT (CASE WHEN pIns.t_start IS NOT NULL THEN pIns.t_start ELSE pImg.t_start END) AS timestamp, (CASE WHEN pIns.day IS NOT NULL THEN (SELECT combo FROM days WHERE id = pIns.day) ELSE (SELECT combo FROM days WHERE id = pImg.day) END) AS days, (CASE (SELECT name FROM names WHERE id = pImg.channelName) WHEN 'cro-inspectorEdit' THEN 1 WHEN 'cro-fullAuto' THEN 2 WHEN 'klz-inspectorEdit' THEN 3 WHEN 'klz-01-fullAuto' THEN 4 WHEN 'klz-99-sendToElvis' THEN 5 WHEN 'Werbemarkt - ColdSet' THEN 6 WHEN 'Werbemarkt - HeatSet - ISO Coated v2 300' THEN 6 WHEN 'Werbemarkt - HeatSet - PSO LWC Improved' THEN 6 WHEN 'Vanjski cro-inspectorEdit' THEN 6 WHEN 'klz-00-inputCheck' THEN 7 ELSE 0 END) AS type, (SELECT name FROM names WHERE id = pImg.imageName) AS filename, (SELECT name FROM names WHERE id = pImg.channelName) AS channel, (SELECT name FROM names WHERE id = pIns.userName) AS user, pIns.psTime AS pstime, pIns.calcTime AS calctime FROM pImg LEFT JOIN pIns ON pImg.id = pIns.pImg LEFT JOIN days ON days.combo = days WHERE days.year = @year AND days.month = @month and type > 0"
    );
    return query.all({ year, month });
  } catch (error) {
    console.error(error);
  }
  console.log({ year, month });
  return { year, month };
};

module.exports = getCompileyData;
