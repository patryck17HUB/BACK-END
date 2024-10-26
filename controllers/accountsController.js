const { accounts } = require('../models/init-models')(require('../config/database'));

const getAllAccounts = async (req, res, next) => {
    const user_id = req.user.user_id;

    try {
        // Usamos Sequelize para obtener todas las cuentas de un usuario
        const userAccounts = await accounts.findAll({ where: { user_id } });

        if (userAccounts.length > 0) {
            return res.status(200).json({ code: 200, message: userAccounts });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};


const getAccountById = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.params;

    try {
        const account = await accounts.findOne({ where: { user_id, account_id } });

        if (account) {
            return res.status(200).json({ code: 200, message: account });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontró la cuenta" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};


const createAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_type, balance } = req.body;

    // Función para generar un número de tarjeta aleatorio con el algoritmo de Luhn
    const generateCardNumber = () => {
        let cardNumber = '400000';
        for (let i = 0; i < 9; i++) {
            cardNumber += Math.floor(Math.random() * 10);
        }
        const luhnCheck = (num) => {
            let sum = 0;
            let shouldDouble = false;
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num[i]);
                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            return sum % 10 === 0 ? 0 : 10 - (sum % 10);
        };
        const checkDigit = luhnCheck(cardNumber);
        cardNumber += checkDigit.toString();
        return cardNumber;
    };

    if (account_type && balance) {
        try {
            let card_number;
            let isUnique = false;
            while (!isUnique) {
                card_number = generateCardNumber();
                const existingAccount = await accounts.findOne({ where: { card_number } });
                isUnique = !existingAccount;
            }

            const newAccount = await accounts.create({
                user_id,
                account_type,
                balance,
                card_number
            });

            return res.status(201).json({ code: 201, message: "Cuenta creada correctamente", card_number: newAccount.card_number });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};

const deleteAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.params;

    try {
        const accountDeleted = await accounts.destroy({ where: { user_id, account_id } });

        if (accountDeleted) {
            return res.status(200).json({ code: 200, message: "Cuenta eliminada correctamente" });
        } else {
            return res.status(404).json({ code: 404, message: "Cuenta no encontrada" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    deleteAccount
};
