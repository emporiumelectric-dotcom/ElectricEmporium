const assert=require('node:assert/strict'),C=require('./product-content');
const result=C.parse('Description\nA dry iron.\n\nFeatures\n• Non-stick soleplate — Smooth gliding.\n• 1100 W\n\nTechnical specifications\nVoltage: 240 V\nCord length: 1.7 m');
assert.deepEqual(result.description,['A dry iron.']);assert.equal(result.features.length,2);assert.equal(result.features[0].text,'Smooth gliding.');assert.deepEqual(result.specs,[['Voltage','240 V'],['Cord length','1.7 m']]);
assert.deepEqual(C.parse('Old description\nPower: 100 W').description,['Old description','Power: 100 W']);
assert.equal(C.parse('Features are nice').features.length,0);
console.log('Product sections and legacy descriptions passed.');
