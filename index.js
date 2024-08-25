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

//Middlewares
const auth = require('./middleware/auth');
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

app.use(notFound);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
/*   -------------------------- To do LIST --------------------------
- [ ] Logica de Accounts
- [ ] Logica de Transactions
- [ ] Logica de Transfers
*/