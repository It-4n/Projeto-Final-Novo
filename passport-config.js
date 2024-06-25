const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, senha, done) => {
        const user = getUserByEmail(email);

        if (user == null) {
            return done(null, false, { message: "Não existe usuário com este e-mail." });
        }

        try {
            if (await bcrypt.compare(senha, user.senha)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Senha incorreta." });
            }
        } catch (e) {
            return (e);
        }

    }

    passport.use(new LocalStrategy({ username: 'email' },
        authenticateUser));
    passport.serializeUser((user, done) => { });
    passport.deserializeUser((id, done) => { });
}

module.exports = initialize