const Sequelize = require('sequelize');
const database = require('../db');

const Usuario = database.define('usuarios', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    telefone: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },

});

(async () => {
    await Usuario.sync();
})();

module.exports = Usuario;