'use strict';

module.exports = (sequelize, DataTypes) => {
    const emergencia_diagnostico = sequelize.define('cita', {
        id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre_paciente:{
            allowNull: false,
            type: DataTypes.STRING
        },
        fecha_inicio:{
            allowNull: false,
            type: DataTypes.DATE
        },
        fecha_fin:{
            allowNull: false,
            type: DataTypes.DATE
        },
        tipo_cita:{
            allowNull: false,
            type: DataTypes.STRING
        }
    },{
        freezeTableName: true,
        alter: true
    });
    return emergencia_diagnostico;
};