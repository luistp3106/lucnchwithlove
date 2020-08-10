'use strict';

module.exports = (sequelize, DataTypes) => {
    const emergencia_diagnostico = sequelize.define('formulario', {
        id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        json:{
            allowNull: false,
            type: DataTypes.JSON
        }
    },{
        freezeTableName: true,
        alter: true
    });
    return emergencia_diagnostico;
};