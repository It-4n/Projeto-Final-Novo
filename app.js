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

// Configuração de sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 1000 } // Tempo de expiração do cookie de sessão
}));

// Inicialização do Passport
initializePassport(passport, 
    email => Usuario.find(user => user.email === email),
    id => Usuario.find(user => user.id === id)
);

// Middlewares
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(express.static('./public'));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configuração do Handlebars
app.set('view engine', 'handlebars');
app.set('views', './views');
app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

// Rotas
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/reservar', (req, res) => {
    res.render('reservar');
});

app.get('#about', (req, res) => {
    res.render('about');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/registrar', (req, res) => {
    res.render('registrar');
});

// Rota de autenticação
app.post('/login', passport.authenticate('local', {
    successRedirect: '/admreservas',
    failureRedirect: '/login',
    failureFlash: false
}));

async function criarAdmin() {
    try {
        const email = 'adm@adm';
        const senha = '123';
        const hashSenha = await bcrypt.hash(senha, 10);

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            console.log('Administrador já existe.');
            return;
        }

        await Usuario.create({ email, senha: hashSenha });
        console.log('Administrador criado com sucesso.');
    } catch (error) {
        console.error('Erro ao criar administrador:', error.message);
    }
}

app.post('/reservar', (req, res) => {
    Reserva.create({
        nome: req.body.nome,
        data: req.body.data,
        hora: req.body.hora
    })
    .then(reservas => {
        res.redirect('/');
    })
    .catch(err => {
        console.error('Erro ao criar reserva:', err);
        res.render('admreservas', { erro: 'Erro ao criar reserva: ' + err.message });
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
        console.error('Erro ao buscar reservas:', err);
        res.render('admreservas', { erro: 'Erro ao buscar reservas: ' + err.message });
    });
});

app.post('/registrar', async (req, res) => {
    const { name, telefone, email, senha } = req.body;

    try {
        const hashSenha = await bcrypt.hash(senha, 10);
        await Usuario.create({ name, telefone, email, senha: hashSenha });
        res.redirect('/login');
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        res.render('registrar', { erro: 'Erro ao cadastrar: ' + error.message });
    }
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
        console.error('Erro ao buscar reserva:', error);
        res.send('Erro ao buscar reserva: ' + error.message);
    });
});

app.post('/editar/:id', (req, res) => {
    const id = req.params.id;

    Reserva.update({
        nome: req.body.nome,
        data: req.body.data,
        hora: req.body.hora
    }, { where: { id: id } })
    .then(() => {
        res.redirect('/admreservas');
    })
    .catch(error => {
        console.error('Erro ao atualizar reserva:', error);
        res.send('Erro ao atualizar reserva: ' + error.message);
    });
});

app.get('/admreservas/:id', (req, res) => {
    Reserva.destroy({ where: { id: req.params.id } })
    .then(() => {
        res.redirect('/admreservas');
    })
    .catch(erro => {
        console.error('Erro ao excluir a reserva:', erro);
        res.send('Erro ao excluir a reserva: ' + erro.message);
    });
});

// Inicialização do servidor
app.listen(4444, () => {
    console.log("Servidor rodando em http://localhost:4444");
});
