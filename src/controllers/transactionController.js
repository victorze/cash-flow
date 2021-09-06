const Account = require('../models/account')
const Category = require('../models/category')
const Transaction = require('../models/transaction')

async function index(req, res) {
  const currentDate = new Date()
  const [currentYear, currentMonth] = [
    currentDate.getFullYear(),
    currentDate.getMonth(),
  ]
  const currentMonthTransactions = await Transaction.find({
    createdAt: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lte: new Date(currentYear, currentMonth + 1, 1),
    },
    user: req.user._id,
  })

  console.log({ currentMonthTransactions })
  res.render('transactions/index', { transactions: currentMonthTransactions })
}

async function create(req, res) {
  const [accounts, categories] = await Promise.all([
    Account.find({ user: req.user._id }),
    Category.find({ type: req.query.type, user: req.user._id }),
  ])

  res.render('transactions/create', {
    type: req.query.type,
    accounts,
    categories,
  })
}

async function store(req, res) {
  req.body.user = req.user._id
  await Transaction.create(req.body)

  req.flash('success', 'La transacción fue almacenada')
  res.redirect('/')
}

function validateTransaction(req, res, next) {
  const errors = []

  if (!req.body.account) {
    errors.push('Debe seleccionar una cuenta')
  }

  if (!req.body.category) {
    errors.push('Debe seleccionar una categoría')
  }

  if (isNaN(req.body.amount) || !req.body.amount) {
    errors.push('Ingrese un monto válido')
  }

  if (errors.length) {
    req.flash('error', errors)
    res.redirect('back')
  } else {
    next()
  }
}

module.exports = {
  index,
  create,
  store,
  validateTransaction,
}
