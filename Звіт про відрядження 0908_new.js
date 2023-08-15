function onBeforeCardSave() {
  copyTableValueFoodTable();
  copyTableValueTravelExpense();
}

function copyTableValueFoodTable() {
  var table = EdocsApi.getAttributeValue("FoodTable").value;
  var dataFood_copy = "";
  var period_to_copy = "";

  if (table) {
    for (var i = 0; i < table.length; i++) {
      dataFood_copy += moment(new Date(EdocsApi.findElementByProperty("code", "dataFood", table[i]).value)).format("DD.MM.YYYY") + "\n\n";
      period_to_copy += EdocsApi.findElementByProperty("code", "FoodChoice", table[i]).value + "\n\n";
    }
  }

  dataFood_copy = dataFood_copy.substring(dataFood_copy.length - 2, 0);
  if (dataFood_copy != EdocsApi.getAttributeValue("dataFood_copy").value) EdocsApi.setAttributeValue({ code: "dataFood_copy", value: dataFood_copy, text: null });

  period_to_copy = period_to_copy.substring(period_to_copy.length - 2, 0);
  if (period_to_copy != EdocsApi.getAttributeValue("FoodChoice_copy").value) EdocsApi.setAttributeValue({ code: "FoodChoice_copy", value: period_to_copy, text: null });
}

function copyTableValueTravelExpense() {
  var table = EdocsApi.getAttributeValue("TravelExpense").value;
  var expenses_copy = "";
  var DestinationPlaceCopy = "";

  if (table) {
    for (var i = 0; i < table.length; i++) {
      expenses_copy += EdocsApi.findElementByProperty("code", "Expenses", table[i]).value + "\n\n";
      DestinationPlaceCopy += EdocsApi.findElementByProperty("code", "vutratu", table[i]).value + "\n\n";
    }
  }

  expenses_copy = expenses_copy.substring(expenses_copy.length - 2, 0);
  if (expenses_copy != EdocsApi.getAttributeValue("expenses_copy").value) EdocsApi.setAttributeValue({ code: "expenses_copy", value: expenses_copy, text: null });

  DestinationPlaceCopy = DestinationPlaceCopy.substring(DestinationPlaceCopy.length - 2, 0);
  if (DestinationPlaceCopy != EdocsApi.getAttributeValue("vutratu_copy").value) EdocsApi.setAttributeValue({ code: "vutratu_copy", value: DestinationPlaceCopy, text: null });
}

function controlHide(CODE) {
  var control = EdocsApi.getControlProperties(CODE);
  if (control) {
    control.hidden = true;
    EdocsApi.setControlProperties(control);
  }
}
function controlShow(CODE) {
  var control = EdocsApi.getControlProperties(CODE);
  if (control) {
    control.hidden = false;
    EdocsApi.setControlProperties(control);
  }
}
function onCardInitialize() {
  if (EdocsApi.getAttributeValue("FoodTable").value.length == 0) {
    onChangetravelDirection();
    onChangedataTripStart();
    onChangedataTripEnd();
    onChangetravelDirection();
    onChangeTravelExpense(true);
  }
}
function onChangecurrencyEUR() {
  setRate();
}
function onChangedateRate() {
  setRate();
}

function clearTable() {
  EdocsApi.setAttributeValue({ code: "FoodTable", type: "table", value: null });
}

function createTable() {
  const table = [];
  for (let index = new Date(EdocsApi.getAttributeValue("dataTripStart").value).getDate(); index <= new Date(EdocsApi.getAttributeValue("dataTripEnd").value).getDate(); index++) {
    table.push([
      { code: "dataFood", value: moment(new Date().setDate(index)).format("YYYY-MM-DD"), text: null },
      { code: "FoodChoice", value: null, text: null },
    ]);
  }
  EdocsApi.setAttributeValue({ code: "FoodTable", type: "table", value: table });
}

function onChangetravelDirection() {
  if (EdocsApi.getAttributeValue("travelDirection").value != "За кордон") {
    clearTable();
    controlHide("FoodTable");
  } else {
    controlShow("FoodTable");
    if (EdocsApi.getAttributeValue("dataTripStart").value && EdocsApi.getAttributeValue("dataTripEnd").value) createTable();
  }
}
function onChangedataTripStart() {
  if (!EdocsApi.getAttributeValue("dataTripStart").value) {
    clearTable();
  } else {
    if (EdocsApi.getAttributeValue("travelDirection").value == "За кордон" && EdocsApi.getAttributeValue("dataTripEnd").value) createTable();
  }
}
function onChangedataTripEnd() {
  if (!EdocsApi.getAttributeValue("dataTripEnd").value) {
    clearTable();
  } else {
    if (EdocsApi.getAttributeValue("travelDirection").value == "За кордон" && EdocsApi.getAttributeValue("dataTripEnd").value) createTable();
  }
}
//Скривати поле Країна
function setControlShow(code) {
  const control = EdocsApi.getControlProperties(code);
  control.hidden = false;
  EdocsApi.setControlProperties(control);
}

function setControlHidden(code) {
  const control = EdocsApi.getControlProperties(code);
  control.hidden = true;
  EdocsApi.setControlProperties(control);
}

function onChangetravelDirection() {
  if (EdocsApi.getAttributeValue("travelDirection").value == "За кордон") {
    setControlShow("country");
  } else {
    setControlHidden("country");
  }
}
//1.Заповнити поле Rate методом зовнішньої системи EdocsGetExchangeRate
function setRate() {
  debugger;

  const currencyEUR = EdocsApi.getAttributeValue("currencyEUR");

  const dateRate = EdocsApi.getAttributeValue("dateRate").value;

  if (currencyEUR.value && dateRate) {
    const methodData = {
      currencyEUR: currencyEUR.value,

      dateRate: dateRate,
    };

    const response = EdocsApi.runExternalFunction("Navision", "EdocsGetExchangeRate", methodData);

    if (!response.data) {
      throw "Не отримано відповіді від зовіншньої системи";
    } else {
      if (response.data.error) {
        EdocsApi.message(response.data.error.message);
      } else {
        EdocsApi.setAttributeValue(response.data);
      }
    }
  } else {
    if (!currencyEUR.text) {
      EdocsApi.setAttributeValue({ code: "rate", value: null, text: null });
    }
  }
}

function setControlRequired(code, required = true) {
  const attr = EdocsApi.getControlProperties(code);
  attr.required = required;
  EdocsApi.setControlProperties(attr);
}

function onChangeTravelExpense(clearOnInit = false) {
  if (clearOnInit) {
    setControlRequired("Expenses");
    setControlRequired("currencyEUR");
    setControlRequired("dateRate");
    setControlRequired("vutratuCurrency");
  } else {
    const tableTravelExpense = EdocsApi.getAttributeValue("TravelExpense");
    if (tableTravelExpense.value) {
      for (let index = 0; index < tableTravelExpense.value.length; index++) {
        tableTravelExpense.value[index].find(x => x.code == "vutratu").value = (tableTravelExpense.value[index].find(x => x.code == "rate").value * tableTravelExpense.value[index].find(x => x.code == "vutratuCurrency").value).toFixed(2);
      }
      EdocsApi.setAttributeValue(tableTravelExpense);
    }
  }
}
