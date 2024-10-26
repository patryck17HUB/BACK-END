// Importación de modelos
const { accounts, transactions, transfers } = require('../models/init-models')(require('../config/database'));
const { Op, Sequelize } = require('sequelize');

// Usamos Sequelize para la transacción
const sequelize = require('../config/database');


const verifyAccountOwnership = async (account_id, user_id) => {
    const account = await accounts.findOne({
        where: { account_id, user_id }
    });
    return !!account;
};

// Obtener todos los movimientos de una cuenta
const getAllMovements = async (req, res) => {
    const { account_id } = req.params;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const [transactionsList, transfersList] = await Promise.all([
            transactions.findAll({ where: { account_id }, attributes: { include: [['transaction_date', 'date']] } }),
            transfers.findAll({
                where: {
                    [Op.or]: [
                        { from_account_id: account_id },
                        { to_account_id: account_id }
                    ]
                },
                attributes: { include: [['transfer_date', 'date']] }
            })
        ]);

        const combined = [...transactionsList, ...transfersList].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ code: 200, message: combined.length > 0 ? combined : "No hay movimientos" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener transacciones de una cuenta
const getTransactions = async (req, res) => {
    const { account_id } = req.params;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const transactionsList = await transactions.findAll({
            where: { account_id },
            order: [['transaction_date', 'DESC']],
            attributes: { include: [['transaction_date', 'date']] }
        });

        res.status(200).json({ code: 200, message: transactionsList.length > 0 ? transactionsList : "No hay transacciones" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Obtener transferencias de una cuenta
const getTransfers = async (req, res) => {
    const { account_id } = req.params;
    const user_id = req.user.user_id;

    if (!account_id) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    try {
        if (!(await verifyAccountOwnership(account_id, user_id))) {
            return res.status(403).json({ code: 403, message: "Acceso denegado. La cuenta no pertenece al usuario." });
        }

        const transfersList = await transfers.findAll({
            where: {
                [Op.or]: [
                    { from_account_id: account_id },
                    { to_account_id: account_id }
                ]
            },
            order: [['transfer_date', 'DESC']],
            attributes: { include: [['transfer_date', 'date']] }
        });

        res.status(200).json({ code: 200, message: transfersList.length > 0 ? transfersList : "No hay transferencias" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Realizar transferencia entre cuentas
const postTransfer = async (req, res) => {
    const user_id = req.user.user_id;
    const { from_account_id, to_account_id, amount, description } = req.body;

    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    if (amount <= 0) {
        return res.status(400).json({ code: 400, message: "El monto debe ser un número positivo" });
    }

    try {
        const fromAccount = await accounts.findOne({ where: { account_id: from_account_id, user_id } });
        const toAccount = await accounts.findOne({ where: { account_id: to_account_id } });

        if (!fromAccount || fromAccount.balance < amount) {
            return res.status(400).json({ code: 400, message: "Fondos insuficientes o cuenta inválida" });
        }

        if (!toAccount) {
            return res.status(400).json({ code: 400, message: "Cuenta de destino inválida" });
        }

        await sequelize.transaction(async (t) => {
            await fromAccount.decrement('balance', { by: amount, transaction: t });
            await toAccount.increment('balance', { by: amount, transaction: t });
            await transfers.create({
                from_account_id,
                to_account_id,
                amount,
                description
            }, { transaction: t });
        });

        res.status(200).json({ code: 200, message: "Transferencia realizada correctamente" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

// Realizar transacción
const postTransaction = async (req, res) => {
    const user_id = req.user.user_id;
    const { account_id, transaction_type, amount, description } = req.body;

    if (!account_id || !transaction_type || !amount) {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }

    if (amount <= 0) {
        return res.status(400).json({ code: 400, message: "El monto debe ser un número positivo" });
    }

    try {
        const account = await accounts.findOne({ where: { account_id, user_id } });

        if (!account) {
            return res.status(400).json({ code: 400, message: "Cuenta inválida" });
        }

        await sequelize.transaction(async (t) => {
            await transactions.create({
                account_id,
                transaction_type,
                amount,
                description
            }, { transaction: t });

            if (transaction_type === 'deposit') {
                await account.increment('balance', { by: amount, transaction: t });
            } else if (transaction_type === 'withdrawal' && account.balance >= amount) {
                await account.decrement('balance', { by: amount, transaction: t });
            } else {
                throw new Error("Fondos insuficientes");
            }
        });

        res.status(200).json({ code: 200, message: "Transacción realizada correctamente" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};


module.exports = {
    getAllMovements,
    getTransactions,
    getTransfers,
    postTransfer,
    postTransaction
};