# Basic thermostat that will emit control mode and output

## Usage

```js
const MyThermostat = require('mythermostat');

const myThermostat = MyThermostat();

const init = _ => {
  myThermostat.TargetHeatingCoolingState = 'auto';
  myThermostat.TargetTemperature = 25;
  myThermostat.CurrentTemperature = 20;
  myThermostat.on('output', console.log);
};
init();

// now you are able to change `TargetHeatingCoolingState`, `TargetTemperature`, `CurrentTemperature`
// and read `CurrentHeatingCoolingState`.
```
