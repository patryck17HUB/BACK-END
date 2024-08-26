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
const account = require('./routes/account');
const movements = require('./routes/movements');
const admin = require('./routes/admin');

//Middlewares
const auth = require('./middleware/auth');
const authAdmin = require('./middleware/authAdmin');
const notFound = require('./middleware/notFound');
const index = require('./middleware/index');
const cors = require('./middleware/cors');

app.use(cors);

app.get('/', index);

app.use("/users", users); // Public

app.use(auth);

// Private
app.use("/updateUsers", updateUsers);
app.use("/accounts", account);
app.use("/movements", movements);

app.use(authAdmin);

app.use("/admin", admin);

app.use(notFound);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
/*   -------------------------- To do LIST --------------------------
- [1] Logica de Accounts
- [1] Logica de Transactions
- [1] Logica de Transfers
- [1] Logica de Movements
- [1] Logica de Users
- [1] Logica de UpdateUsers
- [1] Logica de Auth
- [1] Logica de Cors
- [ ] Logica de Admin
- [1] Propiedad transferencias
*/