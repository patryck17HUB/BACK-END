const express = require('express');
const morgan = require('morgan');
const app = express();

//Settings
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
const updateUsers = require('./routes/updateUsers');
const users = require('./routes/users');
const accounts = require('./routes/accounts');
const movements = require('./routes/movements');
const admin = require('./routes/admin');
const googlelogin = require('./routes/googlelogin');

//Middlewares
const auth = require('./middleware/auth');
const authAdmin = require('./middleware/authAdmin');
const notFound = require('./middleware/notFound');
const index = require('./middleware/index');
const cors = require('./middleware/cors');

app.use(cors);

app.get('/', index);

app.use("/users", users); // Public

app.use("/googlelogin", googlelogin);

app.use(auth);

// Private
app.use("/updateusers", updateUsers); // INFO DE USUARIO
app.use("/accounts", accounts);
app.use("/movements", movements);

app.use(authAdmin);

app.use("/admin", admin);

app.use(notFound);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

