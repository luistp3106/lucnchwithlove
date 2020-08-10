'use strict';

module.exports = (sequelize, DataTypes) => {
    const emergencia_diagnostico = sequelize.define('usuario', {
        id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre:{
            allowNull: false,
            type: DataTypes.STRING
        },
        apellido:{
            allowNull: false,
            type: DataTypes.STRING
        },
        email:{
            allowNull: false,
            type: DataTypes.STRING
        },
        nombre_usuario:{
            allowNull: false,
            type: DataTypes.STRING
        },
        password:{
            allowNull: false,
            type: DataTypes.STRING
        }
    },{
        freezeTableName: true,
        alter: true
    });
    return emergencia_diagnostico;
};