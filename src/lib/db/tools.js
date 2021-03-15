const db = require('./index');
const { dayMath } = require('../util/tools');

const writeNames = (names) => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO names (name) VALUES (?)');
    const insertMany = db.transaction((names) => names.map((name) => insert.run(name)));
    return insertMany([...names]); // we expect a set, need to create an array - so we can return an array of answers
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const writeDays = (days) => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO days (combo, year, month, day) VALUES (@combo, @year, @month, @day)');
    const insertMany = db.transaction((days) =>
      days.map((d) =>
        insert.run({
          combo: d,
          year: Number(String(d).slice(0, 4)),
          month: Number(String(d).slice(4, 6)),
          day: Number(String(d).slice(6, 8)),
        })
      )
    );
    return insertMany([...days]);
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const writeImages = (obj) => {
  // pImg = t_start, t_end, duration, imageName, numSteps, numErrors, inspectID, error, treadID, channelName
  // pObj = t_start, t_end, duration, objectName, numSteps, numErrors, error, threadID, channelName
  // pIns = t_start, psTime, calcTime, userName, day, imageName, inspectID, channelName, inspectAction
  try {
    const threadIDs = {};
    const inspectIDs = {};

    // Insert all objects and map their ID's to day-threadID
    const insertPObj = db.prepare(
      'INSERT OR IGNORE INTO pObj (t_start, t_end, duration, objectName, day, channelName, numSteps, numErrors, error) VALUES (@t_start, @t_end, @duration, (SELECT id FROM names WHERE name = @objectName), (SELECT id FROM days WHERE combo = @day), (SELECT id FROM names WHERE name = @channelName), @numSteps, @numErrors, @error)'
    );
    const insertManyPObj = db.transaction((pObjs) =>
      pObjs.map((pObj) => {
        const result = insertPObj.run({
          t_start: pObj.t_start,
          t_end: pObj.t_end,
          duration: pObj.duration,
          objectName: pObj.objectName,
          day: pObj.day,
          channelName: pObj.channelName,
          numSteps: pObj.numSteps,
          numErrors: pObj.numErrors,
          error: pObj.error,
        });
        if (result.changes) threadIDs[`${pObj.day}-${pObj.threadID}`] = result.lastInsertRowid;
        return result;
      })
    );

    // Insert all images, use day-threadID to link back to pObj and map their ID's to day-inspectID-imageName
    const insertPImg = db.prepare(
      'INSERT OR IGNORE INTO pImg (t_start, t_end, duration, imageName, pObj, numSteps, numErrors, inspectID, error) VALUES (@t_start, @t_end, @duration, (SELECT id FROM names WHERE name = @imageName), @pObj, @numSteps, @numErrors, @inspectID, @error)'
    );
    const insertManyPImg = db.transaction((pImgs) =>
      pImgs.map((pImg) => {
        const result = insertPImg.run({
          t_start: pImg.t_start,
          t_end: pImg.t_end,
          duration: pImg.duration,
          imageName: pImg.imageName,
          pObj: threadIDs[`${pImg.day}-${pImg.threadID}`],
          numSteps: pImg.numSteps,
          numErrors: pImg.numErrors,
          inspectID: pImg.inspectID,
          error: pImg.error,
        });
        if (result.changes) inspectIDs[`${pImg.day}-${pImg.inspectID}-${pImg.imageName}`] = result.lastInsertRowid;
        return result;
      })
    );

    // Insert all inspect events, use day-inspectID-imageName to link back to pImg
    const insertPIns = db.prepare(
      'INSERT OR IGNORE INTO pIns (pImg, t_start, channelName, imageName, inspectID, inspectAction, psTime, calcTime, userName, day) VALUES (@pImg, @t_start, (SELECT id FROM names WHERE name = @channelName), (SELECT id FROM names WHERE name = @imageName), @inspectID, (SELECT id FROM names WHERE name = @inspectAction), @psTime, @calcTime, (SELECT id FROM names WHERE name = @userName), (SELECT id FROM days WHERE combo = @day))'
    );
    const insertManyPIns = db.transaction((pInss) =>
      pInss.map((pIns) => {
        let pImgID;
        if (inspectIDs[`${pIns.day}-${pIns.inspectID}-${pIns.imageName}`]) pImgID = inspectIDs[`${pIns.day}-${pIns.inspectID}-${pIns.imageName}`];
        if (!pImgID) if (inspectIDs[`${dayMath(pIns.day, -1)}-${pIns.inspectID}-${pIns.imageName}`]) pImgID = inspectIDs[`${dayMath(pIns.day, -1)}-${pIns.inspectID}-${pIns.imageName}`];
        let result;
        try {
          result = insertPIns.run({
            pImg: pImgID,
            t_start: pIns.t_start,
            channelName: pIns.channelName,
            imageName: pIns.imageName,
            inspectID: pIns.inspectID,
            inspectAction: pIns.inspectAction,
            psTime: pIns.psTime,
            calcTime: pIns.calcTime,
            userName: pIns.userName,
            day: pIns.day,
          });
        } catch (error) {
          console.log({
            pImg: pImgID,
            t_start: pIns.t_start,
            channelName: pIns.channelName,
            imageName: pIns.imageName,
            inspectID: pIns.inspectID,
            inspectAction: pIns.inspectAction,
            psTime: pIns.psTime,
            calcTime: pIns.calcTime,
            userName: pIns.userName,
            day: pIns.day,
          });
          console.log(error);
          throw error;
        }
        return result;
      })
    );

    insertManyPObj(obj.pObj);
    insertManyPImg(obj.pImg);
    insertManyPIns(obj.pIns);

    return true;
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

module.exports = { writeNames, writeDays, writeImages };
