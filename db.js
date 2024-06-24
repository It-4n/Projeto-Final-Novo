const Sequelize = require('sequelize');
const sequelize = new Sequelize('db', 'root', '12345', {
    dialect: 'mysql',
    host: 'localhost',
    port: '3306'
});

sequelize.authenticate().then(function () {
    console.log("Conectado")
}).catch(function (erro) {
    console.log("Erro ao se conectar " + erro)
})

module.exports = sequelize;