const EE = require('events');
const PID = require('node-pid-controller');

const MyThermostat = params => {
  let self = new EE();

  let _params = {
    modes: ['off', 'cool', 'heat', 'auto']
  };
  Object.assign(_params, params);

  // default pid params
  let _pidParams = {
    k_p: 5,
    k_i: 3,
    k_d: 1,
    i_max: 10
  };
  if (Object.prototype.hasOwnProperty.call(_params, 'pid')) {
    Object.assign(_pidParams, _params.pid);
  }
  self._pid = new PID(_pidParams);

  // change handler for mode and temp
  let _handleChange = _ => {
    console.log('_handleChange');
    let currentMode = self.CurrentHeatingCoolingState;
    let targetMode = self.TargetHeatingCoolingState;
    let currentTemp = self.CurrentTemperature;
    let targetTemp = self.TargetTemperature;

    // manipulated var from pid controller
    let pidOutput;

    // mode to be emitted
    let outputMode;
    switch (targetMode) {
      case 'off':
        self.emit('output', {mode: 'off', value: null});
        break;
      case 'heat':
        self._pid.setTarget(targetTemp);
        pidOutput = self._pid.update(currentTemp);

        outputMode = 'heat';
        // set current mode
        self.CurrentHeatingCoolingState = outputMode;
        self.emit('output', {
          mode: outputMode,
          value: pidOutput > 0 ? pidOutput : 0
        });
        break;
      case 'cool':
        // TODO: implement
        self._pid.setTarget(targetTemp);
        pidOutput = self._pid.update(currentTemp);

        outputMode = 'cool';
        // set current mode
        self.CurrentHeatingCoolingState = outputMode;
        self.emit('output', {
          mode: outputMode,
          value: pidOutput < 0 ? Math.abs(pidOutput) : 0
        });
        break;
      case 'auto':
        self._pid.setTarget(targetTemp);
        pidOutput = self._pid.update(currentTemp);

        outputMode = pidOutput >= 0 ? 'heat' : 'cool';
        // set current mode
        self.CurrentHeatingCoolingState = outputMode;
        self.emit('output', {mode: outputMode, value: Math.abs(pidOutput)});
        break;
      default:
        break;
    }
  };
  self._CurrentHeatingCoolingState = 0;
  self._TargetHeatingCoolingState = 0;
  self._CurrentTemperature = 0;
  self._TargetTemperature = 0;
  Object.defineProperties(self, {
    CurrentHeatingCoolingState: {
      get: function() {
        return this._CurrentHeatingCoolingState;
      },
      set: function(value) {
        // TODO: heat, cool, off.
        this._CurrentHeatingCoolingState = value;
      }
    },
    TargetHeatingCoolingState: {
      get: function() {
        return this._TargetHeatingCoolingState;
      },
      set: function(value) {
        if (_params.modes.indexOf(value) > -1) {
          this._TargetHeatingCoolingState = value;
          _handleChange();
        }
      }
    },
    CurrentTemperature: {
      get: function() {
        return this._CurrentTemperature;
      },
      set: function(value) {
        this._CurrentTemperature = value;
        _handleChange();
      }
    },
    TargetTemperature: {
      get: function() {
        return this._TargetTemperature;
      },
      set: function(value) {
        this._TargetTemperature = value;
        _handleChange();
      }
    }
  });

  return self;
};

module.exports = MyThermostat;
