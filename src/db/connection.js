const monk = require('monk');

const localhost = 'localhost:27017/js-auth';

const db = monk(localhost);

module.exports = db;
