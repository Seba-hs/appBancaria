"use strict";

// datos
const account1 = {
  owner: "Cristobal Herrera",
  movements: [2020, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 13000],
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
  currency: "CLP",
  locale: "pt-PT",
};

const account2 = {
  owner: "Armin Avila",
  movements: [5000, 3400, -150, -790, -3210, -1000, 85000, -30],
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

const account3 = {
  owner: "Matías Marmolejo",
  movements: [53000, 34000, -150, -790, -3210, -1000, 85000, -30],
  interestRate: 1.5,
  pin: 3333,

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

const accounts = [account1, account2, account3];

// Elementos
const labelBienvenido = document.querySelector(".bienvenida");
const labelFecha = document.querySelector(".fecha");
const labelSaldo = document.querySelector(".saldo__valor");
const labelResDentro = document.querySelector(".resumen__valor--dentro");
const labelResFuera = document.querySelector(".resumen__valor--fuera");
const labelResInters = document.querySelector(".resumen__valor--interes");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovimientos = document.querySelector(".movimientos");

const btnLogin = document.querySelector(".login__btn");
const btnTransferir = document.querySelector(".form__btn--transferir");
const btnPrestamo = document.querySelector(".form__btn--prestamo");
const btnEliminar = document.querySelector(".form__btn--eliminar");
const btnOrdenar = document.querySelector(".btn--ordenar");

const inputLoginUsername = document.querySelector(".login__input--usuario");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--para");
const inputTransferAmount = document.querySelector(".form__input--monto");
const inputLoanAmount = document.querySelector(".form__input--prestamo-monto");
const inputCloseUsername = document.querySelector(".form__input--usuario");
const inputClosePin = document.querySelector(".form__input--pin");
//
//------------------------  Funciones ----------------------------------------
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
  containerMovimientos.innerHTML = "";
  const movs = ordenar
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const tipo = mov > 0 ? "deposito" : "retiro";
    const fecha = new Date(acc.movementsDates[i]);
    const mostrarFecha = formatoFechaMovimientos(fecha, acc.locale);

    const movimientoFormateado = formatoSaldoActual(
      mov,
      acc.locale,
      acc.currency
    );

    const html = `
      <div class="movimientos__fila">
        <div class="movimientos__tipo movimientos__tipo--${tipo}">${
      i + 1
    } ${tipo}</div>
        <div class="movimientos__fecha">${mostrarFecha}</div>
        <div class="movimientos__valor">${movimientoFormateado}</div>
      </div>
    `;
    containerMovimientos.insertAdjacentHTML("afterbegin", html);
  });
};

const calcSaldoActual = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelSaldo.textContent = formatoSaldoActual(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcResumen = function (acc) {
  const dentro = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelResDentro.textContent = formatoSaldoActual(
    dentro,
    acc.locale,
    acc.currency
  );

  const fuera = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelResFuera.textContent = formatoSaldoActual(
    Math.abs(fuera),
    acc.locale,
    acc.currency
  );

  const interes = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelResInters.textContent = formatoSaldoActual(
    interes,
    acc.locale,
    acc.currency
  );
};

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
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = empezarLogoutTimer();

    actualizarUI(cuentaActual);
  }
});

btnTransferir.addEventListener("click", function (e) {
  e.preventDefault();
  const cantidad = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
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

btnPrestamo.addEventListener("click", function (e) {
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

btnEliminar.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === cuentaActual.username &&
    Number(inputClosePin.value) === cuentaActual.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === cuentaActual.username
    );
    console.log(index);

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelBienvenido.textContent = `Bienvenid@, para comenzar inicia sesión`;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

let ordenar = false;
btnOrdenar.addEventListener("click", function (e) {
  e.preventDefault();
  mostrarMovimientos(cuentaActual, !ordenar);
  ordenar = !ordenar;
});
