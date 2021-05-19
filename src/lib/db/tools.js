const db = require('./index');
const { dayMath } = require('../util/tools');

const writeNames = names => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO names (name) VALUES (?)');
    const insertMany = db.transaction(names => names.map(name => insert.run(name)));
    return insertMany([...names]); // we expect a set, need to create an array - so we can return an array of answers
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const writeDays = days => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO days (combo, year, month, day) VALUES (@combo, @year, @month, @day)');
    const insertMany = db.transaction(days =>
      days.map(d =>
        insert.run({
          combo: d,
          year: Number(String(d).slice(0, 4)),
          month: Number(String(d).slice(4, 6)),
          day: Number(String(d).slice(6, 8))
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

const writeImages = obj => {
  // pImg = t_start, t_end, duration, imageName, numSteps, numErrors, inspectID, error, treadID, channelName
  // pObj = t_start, t_end, duration, objectName, numSteps, numErrors, error, threadID, channelName
  // pIns = t_start, psTime, calcTime, userName, day, imageName, inspectID, channelName, inspectAction
  try {
    const threadIDs = {};
    const inspectIDs = {};

    // Insert all objects and map their ID's to day-threadID
    const insertPObj = db.prepare(
      'INSERT OR IGNORE INTO pObj (t_start, t_end, duration, day, objectName, channelName, numSteps, numErrors, error) VALUES (@t_start, @t_end, @duration, (SELECT id FROM days WHERE combo = @day), (SELECT id FROM names WHERE name = @objectName), (SELECT id FROM names WHERE name = @channelName), @numSteps, @numErrors, @error)'
    );
    const insertManyPObj = db.transaction(pObjs =>
      pObjs.map(pObj => {
        const result = insertPObj.run({
          t_start: pObj.t_start,
          t_end: pObj.t_end,
          duration: pObj.duration,
          objectName: pObj.objectName,
          day: pObj.day,
          channelName: pObj.channelName,
          numSteps: pObj.numSteps,
          numErrors: pObj.numErrors,
          error: pObj.error
        });
        if (result.changes) threadIDs[`${pObj.day}-${pObj.threadID}`] = result.lastInsertRowid;
        return result;
      })
    );

    // Insert all images, use day-threadID to link back to pObj and map their ID's to day-inspectID-imageName
    const insertPImg = db.prepare(
      'INSERT OR IGNORE INTO pImg (pObj, t_start, t_end, duration, day, imageName, channelName, numSteps, numErrors, inspectID, threadID, error) VALUES (@pObj, @t_start, @t_end, @duration, (SELECT id FROM days WHERE combo = @day), (SELECT id FROM names WHERE name = @imageName), (SELECT id FROM names WHERE name = @channelName), @numSteps, @numErrors, @inspectID, @threadID, @error)'
    );
    const insertManyPImg = db.transaction(pImgs =>
      pImgs.map(pImg => {
        const result = insertPImg.run({
          pObj: threadIDs[`${pImg.day}-${pImg.threadID}`],
          t_start: pImg.t_start,
          t_end: pImg.t_end,
          duration: pImg.duration,
          day: pImg.day,
          imageName: pImg.imageName,
          channelName: pImg.channelName,
          numSteps: pImg.numSteps,
          numErrors: pImg.numErrors,
          inspectID: pImg.inspectID,
          threadID: pImg.threadID,
          error: pImg.error
        });
        if (result.changes) inspectIDs[`${pImg.day}-${pImg.inspectID}-${pImg.imageName}`] = result.lastInsertRowid;
        return result;
      })
    );

    // Insert all inspect events, use day-inspectID-imageName to link back to pImg
    const insertPIns = db.prepare(
      'INSERT OR IGNORE INTO pIns (pImg, t_start, channelName, imageName, inspectID, inspectAction, psTime, calcTime, userName, day) VALUES (@pImg, @t_start, (SELECT id FROM names WHERE name = @channelName), (SELECT id FROM names WHERE name = @imageName), @inspectID, (SELECT id FROM names WHERE name = @inspectAction), @psTime, @calcTime, (SELECT id FROM names WHERE name = @userName), (SELECT id FROM days WHERE combo = @day))'
    );
    const insertManyPIns = db.transaction(pInss =>
      pInss.map(pIns => {
        let pImgID;
        if (inspectIDs[`${pIns.day}-${pIns.inspectID}-${pIns.imageName}`]) pImgID = inspectIDs[`${pIns.day}-${pIns.inspectID}-${pIns.imageName}`];
        if (!pImgID) if (inspectIDs[`${dayMath(pIns.day, -1)}-${pIns.inspectID}-${pIns.imageName}`]) pImgID = inspectIDs[`${dayMath(pIns.day, -1)}-${pIns.inspectID}-${pIns.imageName}`];
        let result;
        try {
          result = insertPIns.run({
            pImg: pImgID,
            t_start: pIns.t_start,
            day: pIns.day,
            imageName: pIns.imageName,
            channelName: pIns.channelName,
            userName: pIns.userName,
            inspectAction: pIns.inspectAction,
            psTime: pIns.psTime,
            calcTime: pIns.calcTime,
            inspectID: pIns.inspectID
          });
        } catch (error) {
          console.log({
            pImg: pImgID,
            t_start: pIns.t_start,
            day: pIns.day,
            imageName: pIns.imageName,
            channelName: pIns.channelName,
            userName: pIns.userName,
            inspectAction: pIns.inspectAction,
            psTime: pIns.psTime,
            calcTime: pIns.calcTime,
            inspectID: pIns.inspectID
          });
          console.log(error);
          throw error;
        }
        return result;
      })
    );

    const step1 = insertManyPObj(obj.pObj);
    const step2 = insertManyPImg(obj.pImg);
    const step3 = insertManyPIns(obj.pIns);

    return { pObj: step1, pImg: step2, pIns: step3 };
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const writeRoutes = routes => {
  try {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO route (t_start, t_end, duration, day, objectName, channelName, error) VALUES (@t_start, @t_end, @duration, (SELECT id FROM days WHERE combo = @day), (SELECT id FROM names WHERE name = @objectName), (SELECT id FROM names WHERE name = @channelName), @error)'
    );
    const insertMany = db.transaction(routes => routes.map(route => insert.run(route)));
    return insertMany(routes);
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const writePurges = purges => {
  try {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO purge (t_start, day, channelName, folderName, objectName, error) VALUES (@t_start, (SELECT id FROM days WHERE combo = @day), (SELECT id FROM names WHERE name = @channelName), (SELECT id FROM names WHERE name = @folderName), (SELECT id FROM names WHERE name = @objectName), @error)'
    );
    const insertMany = db.transaction(purges => purges.map(purge => insert.run(purge)));
    return insertMany(purges);
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

const houseKeeping = () => {
  try {
    const fixMissing = db.prepare(
      'UPDATE pIns SET pImg = (SELECT id FROM pImg WHERE pImg.t_start < pIns.t_start AND pImg.channelName = pIns.channelName AND pImg.imageName = pIns.imageName AND pImg.inspectID = pIns.inspectID ORDER BY pImg.t_start DESC LIMIT 1) WHERE pIns.pImg IS NULL'
    );
    const info = fixMissing.run();
    return info.changes;
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

module.exports = { writeNames, writeDays, writeImages, writeRoutes, writePurges, houseKeeping };
