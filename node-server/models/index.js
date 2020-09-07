'use strict';

const fs        = require('fs');
const path      = require('path');
const basename  = path.basename(__filename);
const db        = {};
const Sequelize = require('sequelize');

const Op = Sequelize.Op;
const DBNAME = 'lunchwithlovewebapp';
const USER = 'postgres';
const PASSWORD = '!nutkard.pass.asturias.2!'; // !nutkard.pass.asturias.2!
const LOCALHOST = '127.0.0.1';

let sequelize = new Sequelize(DBNAME, USER, PASSWORD, {
    host: LOCALHOST,
    dialect: 'postgres',
    port: 5432,
    logging: false,

    pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 80000
    },
    acquire: 80000,
    operatorsAliases: {
        $and: Op.and,
        $or: Op.or,
        $eq: Op.eq,
        $gt: Op.gt,
        $lt: Op.lt,
        $lte: Op.lte,
        $like: Op.like
    },
    define: {
        freezeTableName: true
    }
});

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    }).forEach(file => {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.sync();

module.exports = db;
