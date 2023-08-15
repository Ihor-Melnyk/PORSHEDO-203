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

function onCardInitialize() {
  onChangeTravelExpense(true);
}
