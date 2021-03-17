const config = require('./lib/config');
const tables = ['crop', 'dlink', 'pImg', 'pIns', 'pObj', 'purge', 'route', 'system'];

/** PassableObject
 * Passable object
 * because we need to pass the data as a whole around
 * @typedef {Object} PassableObject
 * @property {PassableObject.Detected} detected data still being collected from logs - multiline atomic data
 * @property {Object} PassableObject.output data prepared for database write
 * @property {Array.<dataCrop>} PassableObject.output.crop data prepared for database write: crop channel
 * @property {Array.<dataDeviceLink>} PassableObject.output.dlink data prepared for database write: device link channel
 * @property {Array.<dataProcessObject>} PassableObject.output.pObj data prepared for database write: process image channel - objects
 * @property {Array.<dataProcessImage>} PassableObject.output.pImg data prepared for database write: process image channel - images
 * @property {Array.<dataProcessInspect>} PassableObject.output.pIns data prepared for database write: process image channel - inspects
 * @property {Array.<dataPurge>} PassableObject.output.purge data prepared for database write: purge channel
 * @property {Array.<dataRoute>} PassableObject.output.route data prepared for database write: route channel
 * @property {Array.<dataSystem>} PassableObject.output.system data prepared for database write: system events
 * @property {Set} names all strings from *Name properties should end up in here
 * @property {Set} days all date values in YYYYMMDD format should end up in here
 * @property {Set} configPointer set of config nodes that add context to log parsing
 * @property {Array.<claroConfigElement>} config - configuration data tree
 */

/** claroConfigElement
 * Claro logs configuration element
 * @typedef {Object} claroConfigElement
 * @property {string} id string value: configuration node identifier
 * @property {string} act string value: name of method that is called when node is triggered
 * @property {string} desc string value: description of the configuration node
 * @property {string[]} members array of strings: positions and descriptions of regexp capture groups
 * @property {RegExp} match RegExp literal
 * @property {Array.<claroConfigElement>} children array of child configuration nodes
 */

/** PassableObject.Detected
 * Data still being collected from logs - multiline atomic data
 * @typedef {Object} PassableObject.Detected
 * @property {dataCrop} crop atomic crop channel information
 * @property {dataDeviceLink} dlink atomic device link channel information
 * @property {dataProcessObject} pObj atomic process image channel - top element: object
 * @property {dataProcessImage} pImg atomic process image channel - child element: image
 * @property {dataProcessInspect} pIns atomic process image channel - inspect event
 * @property {dataPurge} purge atomic purge channel information
 * @property {dataRoute} route atomic route channel information
 * @property {dataSystem} system atomic system event information
 */

/** dataCrop
 * Crop channel information - incomplete!
 * @typedef {Object} dataCrop
 */

/** dataDeviceLink
 * DeviceLink channel information - incomplete!
 * @typedef {Object} dataDeviceLink
 */

/** dataProcessObject
 * Process image channel - object information
 * top element of process image channel
 * @typedef {Object} dataProcessObject
 * @property {number} t_start time value in milliseconds
 * @property {number} t_end time value in milliseconds
 * @property {number} duration time value in milliseconds
 * @property {number} day date value in YYYYMMDD format
 * @property {string} objectName file name without extension: path.parse(filename).name
 * @property {string} channelName name of the channel that is processing this object
 * @property {number} numSteps number of processing steps detected for this object
 * @property {number} numErrors number of errors detected for this object
 * @property {string} error last error detected that wasn't resolved <id - description>
 * @property {number} threadID thread id of this object
 */

/** dataProcessImage
 * Process image channel - image information
 * child element of process image channel
 * @typedef {Object} dataProcessImage
 * @property {number} t_start time value in milliseconds
 * @property {number} t_end time value in milliseconds
 * @property {number} duration time value in milliseconds
 * @property {number} day date value in YYYYMMDD format
 * @property {string} imageName file name or derived file name (in case of PDF) without extension: path.parse(filename).name
 * @property {string} channelName name of the channel that is processing this object
 * @property {number} numSteps number of processing steps detected for this object
 * @property {number} numErrors number of errors detected for this object
 * @property {number} threadID thread id of this object
 * @property {number} inspectID inspect id of this object if it was sent to inspector
 * @property {string} error last error detected that wasn't resolved <id - description>
 * @property
 */

/** dataProcessInspect
 * Process image channel - inspect event information
 * inspect event occuring in process image channel
 * @typedef {Object} dataProcessInspect
 * @property {number} t_start time value in milliseconds
 * @property {number} day date value in YYYYMMDD format
 * @property {string} imageName file name or derived file name (in case of PDF) without extension: path.parse(filename).name
 * @property {string} channelName name of the channel that inspected this image
 * @property {string} userName name of the user that inspected this image
 * @property {string} inspectAction 'Use Processed' or 'Use Original' depending on user choice
 * @property {number} psTime time value in seconds or undefined if image was not opened in photoshop
 * @property {number} calcTime time value in seconds with included overhead
 * @property {number} inspectID inspect id of this image so we can link it with pImg
 */

/** dataPurge
 * Purge channel information
 * @typedef {Object} dataPurge
 * @property {number} t_start time value in milliseconds
 * @property {number} day date value in YYYYMMDD format
 * @property {string} channelName name of the channel that is deleting this object
 * @property {string} folderName name of the folder containing purged file or empty folder: path.parse(filename).dir
 * @property {string} objectName name of the empty folder or file without extension that was purged: path.parse(filename).name
 * @property {string} error last error detected that wasn't resolved <id - description>
 */

/** dataRoute
 * Route channel information
 * @typedef {Object} dataRoute
 * @property {number} t_start time value in milliseconds
 * @property {number} t_end time value in milliseconds
 * @property {number} duration time value in milliseconds
 * @property {number} day date value in YYYYMMDD format
 * @property {string} objectName file name without extension: path.parse(filename).name
 * @property {string} channelName name of the channel that is processing this object
 * @property {string} error last error detected that wasn't resolved <id - description>
 */

/** dataSystem
 * System information - incomplete!
 * @typedef {Object} dataSystem
 */

/**
 * @type {PassableObject}
 */
const po = {
  detected: {},
  output: {},
  names: new Set(),
  days: new Set(),
  configPointer: new Set(),
  config,
};

tables.forEach((el) => {
  po.detected[el] = {};
  po.output[el] = [];
});

module.exports = po;
