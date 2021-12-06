
const handleRegister = (db, bcrypt) => (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('Incorrect form submission');
    }
    const saltRounds = 10;
    const myPlaintextPassword = password;
    //Below is how to hash a password
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                    .into('login')
                    .returning('email')
                    .then(loginEmail => {
                        return trx('users')
                            .returning('*')
                            .insert({
                                email: loginEmail[0],
                                name: name,
                                joined: new Date()
                            })
                            .then(user => {
                                res.json(user[0]);
                            })
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
            })
            .catch(err => res.status(400).json('Unable to register'))
        });
    });
    //Ending of hashing a password
}

module.exports = {
    handleRegister: handleRegister
};