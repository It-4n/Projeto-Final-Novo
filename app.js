const dotenv = require('dotenv').config();
const express = require('express');
const bp = require('body-parser');
const moment = require('moment');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const session = require('express-session');
const Reserva = require('./models/reserva');
const Usuario = require('./models/usuario');
const flash = require('express-flash');
const { engine } = require('express-handlebars');
const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 1000 }
}));

initializePassport(
    passport, 
    email => users.find(user => user.email === email)
)

app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(express.static('./public'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'handlebars');
app.set('views', './views');
app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/reservar', (req, res) => {
    res.render('reservar');
});

app.get('/sobre', (req, res) => {
    res.render('sobre');
});

app.get('/editar', (req, res) => {
    res.render('editar');
});

app.post('/reservar', (req, res) => {
    Reserva.create({
        nome: req.body.nome,
        data: req.body.data,
        hora: req.body.hora
    }).then(reservas => {
        res.redirect('/admreservas');
    }).catch(err => {
        res.render('admreservas', { erro: 'Error ao criar reserva:' + err });
    });
});

app.get('/admreservas', (req, res) => {
    Reserva.findAll()
        .then(reservas => {
            reservas.forEach(reserva => {
                reserva.dataFormatada = moment(reserva.data).format('DD/MM/YYYY');
            });
            res.render('admreservas', { reservas: reservas });
        })
        .catch(err => {
            res.render('admreservas', { erro: 'Erro ao buscar reservas:' + err });
        });
});
app.post('/registrar', async (req, res) => {
    const hashSenha = await bcrypt.hash(req.body.senha, 10);

    Usuario.create({
        name: req.body.name,
        telefone: req.body.telefone,
        email: req.body.email,
        senha: hashSenha
    }).then(usuarios => {
        res.redirect('/login');
    }).catch(err => {
        console.error('Erro ao cadastrar:', err);
        res.render('login', { erro: 'Error ao cadastrar: ' + err });
    });

    console.log(usuarios);
});

app.get('/admreservas', (req, res) => {
    Usuario.findAll()
        .then(usuarios => {
            res.render('admreservas', { usuarios: usuarios });
        })
        .catch(err => {
            res.render('admreservas', { erro: 'Erro ao buscar reservas:' + err });
        });
});

app.get('/editar/:id', (req, res) => {
    Reserva.findByPk(req.params.id)
        .then(reservas => {
            if (reservas) {
                res.render('editar', { reservas: reservas });
            } else {
                res.send('Reserva não encontrada');
            }
        })
        .catch(error => {
            res.send('Erro ao buscar reserva: ' + error.message);
        });
});

app.post('/editar/:id', (req, res) => {
    const id = req.params.id

    console.log('ID recebido:', id);
    console.log('Dados recebidos:', req.body);

    Reserva.update({
        nome: req.body.nome,
        data: req.body.data,
        hora: req.body.hora
    },
        { where: { id: id } }
    )
        .catch(error => {
            console.error('Erro ao atualizar reserva:', error);
            res.send('Erro ao atualizar reserva: ' + error.message);
        });
});

app.get('/admreservas/:id', (req, res) => {
    Reserva.destroy({ where: { id: req.params.id } })
        .then(function () {
            res.redirect('/admreservas');
        }).catch(function (erro) {
            res.send('Erro ao excluir a reserva');
        });
});

app.get('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/login', (req, res) => {

});

app.get('/registrar', (req, res) => {
    res.render('registrar');
});

app.listen(4444, () => {
    console.log("Servidor rodando em http://localhost:4444");
});