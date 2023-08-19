"use strict";

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2023-07-30T12:34:56",
    "2023-08-01T01:40:56",
    "2023-08-01T12:34:56",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "CLP",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelBienvenido = document.querySelector(".welcome");
const labelFecha = document.querySelector(".date");
const labelSaldo = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
//
//------------------------  FUNCTIONS ----------------------------------------
//
const formatoFechaMovimientos = function (fecha, locale) {
  const calcDiasPasados = (fecha1, fecha2) =>
    Math.round(Math.abs(fecha2 - fecha1) / (1000 * 60 * 60 * 24));
  const diasPasados = calcDiasPasados(new Date(), fecha);
  console.log(diasPasados);

  if (diasPasados === 0) return "Hoy";
  if (diasPasados === 1) return "Ayer";
  if (diasPasados === 2) return "2 días atrás";
  if (diasPasados <= 7) return `${diasPasados} días atrás`;

  return new Intl.DateTimeFormat(locale).format(fecha);
};

const formatoSaldoActual = function (valor, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(valor);
};

const mostrarMovimientos = function (acc, ordenar = false) {
  containerMovements.innerHTML = "";

  const movs = ordenar
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const tipo = mov > 0 ? "deposito" : "retiro";

    // recorremos los dates en base al indice (aprovechamos el loop)

    const fecha = new Date(acc.movementsDates[i]);
    const mostrarFecha = formatoFechaMovimientos(fecha, acc.locale);

    const movimientoFormateado = formatoSaldoActual(
      mov,
      acc.locale,
      acc.currency
    );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${tipo}">${
      i + 1
    } ${tipo}</div>
        <div class="movements__date">${mostrarFecha}</div>
        <div class="movements__value">${movimientoFormateado}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};
//
// -----------------------------------------------------------------------------
//
const calcSaldoActual = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelSaldo.textContent = formatoSaldoActual(
    acc.balance,
    acc.locale,
    acc.currency
  );
};
//
// ------------------------------------------------------------------------------
//
const calcResumen = function (acc) {
  const dentro = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatoSaldoActual(dentro, acc.locale, acc.currency);

  const fuera = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatoSaldoActual(
    Math.abs(fuera),
    acc.locale,
    acc.currency
  );

  const interes = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    // recibirimos un 1.2% de los depositos
    // pero el banco solo incluye el interes en depositos mayor a 1
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatoSaldoActual(
    interes,
    acc.locale,
    acc.currency
  );
};
//
// ----------------------------------------------------------------------------------
//
const crearUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
crearUserName(accounts);

const actualizarUI = function (acc) {
  mostrarMovimientos(acc);
  calcSaldoActual(acc);
  calcResumen(acc);
};

const empezarLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(tiempo / 60)).padStart(2, 0);
    const sec = String(Math.trunc(tiempo % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (tiempo === 0) {
      clearInterval(timer);
      labelBienvenido.textContent = `Iniciar sesión`;
      containerApp.style.opacity = 0;
    }
    tiempo--;
  };
  let tiempo = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
//
// --------------- Event Handlers -----------------
//
let cuentaActual, timer;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  cuentaActual = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  // console.log(cuentaActual)
  if (cuentaActual?.pin === Number(inputLoginPin.value)) {
    labelBienvenido.textContent = `Bienvenid@ de vuelta ${
      cuentaActual.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // 1) formato fecha según el perfil
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    labelFecha.textContent = new Intl.DateTimeFormat(
      cuentaActual.locale,
      options
    ).format(now);

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur(); //saca el puntero del campo pin

    // verificamos que no exista un timer, si existe lo borra y en la sgte lo inicia de nuevo
    if (timer) clearInterval(timer);
    timer = empezarLogoutTimer();

    actualizarUI(cuentaActual);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const cantidad = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  // console.log(cantidad, receiverAcc);
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    cantidad > 0 &&
    receiverAcc &&
    cuentaActual.balance >= cantidad &&
    receiverAcc?.username !== cuentaActual.username
  ) {
    console.log("se puede transferir");
  }
  {
    cuentaActual.movements.push(-cantidad);
    receiverAcc.movements.push(cantidad);

    cuentaActual.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    actualizarUI(cuentaActual);

    clearInterval(timer);
    timer = empezarLogoutTimer();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const prestamo = Math.floor(inputLoanAmount.value);
  if (
    prestamo > 0 &&
    cuentaActual.movements.some((mov) => mov >= prestamo * 0.1)
  ) {
    setTimeout(function () {
      cuentaActual.movements.push(prestamo);
      cuentaActual.movementsDates.push(new Date().toISOString());
      actualizarUI(cuentaActual);
      clearInterval(timer);
      timer = empezarLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === cuentaActual.username &&
    Number(inputClosePin.value) === cuentaActual.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === cuentaActual.username
    );
    console.log(index);

    // borramos cuenta
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelBienvenido.textContent = `Bienvenido, para comenzar inicia sesión`;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

let ordenar = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarMovimientos(cuentaActual, !ordenar);
  ordenar = !ordenar;
});
