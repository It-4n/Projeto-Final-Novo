const Sequelize = require('sequelize');
const database = require('../db');

const Reserva = database.define('reservas', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false
    }
});

(async () => {
    await Reserva.sync();
})();

module.exports = Reserva;