const connectDb = require('./db');
const sql = require('mssql');
const databse = 'DigitalPanel';
const path = require('path');
const fs = require('fs');
const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

async function writeBreakerData(data, tableIndex) {
  const bits = [];
  for (let i = 14; i >= 0; i--) { // Only 14 bits
    bits.push((data[12] >> i) & 1); // MSB bits[0] | LSB bits[14]
  }
  console.log(bits);

  try {
    const pool = await connectDb.connectionToSqlDB();
    const result = await pool.request()
      .input('switch_id', tableIndex)
      .input('V12', data[0] / 10.0)
      .input('V23', data[1] / 10.0)
      .input('V31', data[2] / 10.0)
      .input('I1', data[3] / 10.0)
      .input('I2', data[4] / 10.0)
      .input('I3', data[5] / 10.0)
      .input('Frequency', data[6] / 10.0)
      .input('PowerFactor', data[7] / 1000.0 )
      .input('ActivePower', data[8] / 10.0)
      .input('ReactivePower', data[9] / 10.0)
      .input('ApparentPower', data[10] / 10.0)
      .input('NominalCurrent', data[11] / 10.0)
      .input('ActiveEnergy', ((data[13] * 65536) + data[14]) / 10.0)
      .input('CommStatus', bits[0])
      .input('ProtectionTrip', bits[1])
      .input('ProtectionInstTrip', bits[2])
      .input('ProtectionI_Enabled', bits[3])
      .input('ProtectionS_Enabled', bits[4])
      .input('ProtectionL_Enabled', bits[5])
      .input('ProtectionG_Trip', bits[6])
      .input('ProtectionI_Trip', bits[7])
      .input('ProtectionS_Trip', bits[8])
      .input('ProtectionL_Trip', bits[9])
      .input('TripDisconnected', bits[10])
      .input('Tripped', bits[11])
      .input('Undefined', bits[12])
      .input('BreakerClose', bits[13])
      .input('BreakerOpen', bits[14])
      .execute('addBreakerData');

    if (result.rowsAffected[0] === 0) {
      return { message: 'Values cannot be sent', status: 404 };
    }
    return { message: 'Values sent successfully', status: 200 };
  } catch (err) {
    console.error('DB insert error:', err); // log full error
    return { message: err.message || 'Unknown error', status: 500 };
  }
}

// --------------------------------------------------------------------------------------//
async function getActivePower(switch_id) {
  try {
    if (!switch_id) {
      throw new Error('Missing required parameters: switch_id, startTime, endTime');
    }
  
    const pool = await connectDb.connectionToSqlDB(databse);
    const result = await pool.request()
      .input('switch_id', sql.Int, switch_id)
      .execute('GetDailySample');           // call the SP that returns formatted time

    if (!result.recordset || result.recordset.length === 0) {
      console.log('No data found for the given parameters');
      return { status: 200, data: [] };
    }

    console.log({ status: 200, data: result.recordset });
    return { status: 200, data: result.recordset };

  } catch (err) {
    console.error('Error fetching active energy:', err);
    return { status: 500, message: err.message };
  }
}

// --------------------------------------------------------------------------------------//


async function getBreakersNames() {
  try {
    const pool = await connectDb.connectionToSqlDB(databse);
    const result = await pool.request()
      .execute('getAllSwitchesNames');
    if (!result.recordset || result.recordset.length === 0) {
      console.log('No data found');
      return { status: 200, data: [] };
    }

    console.log({ status: 200, data: result.recordset });
    return { status: 200, data: result.recordset };

  } catch (err) {
    console.error('Error fetching active energy:', err);
    return { status: 500, message: err.message };
  }
}

async function getBreakersMainData() {
  try {
    const pool = await connectDb.connectionToSqlDB(databse);
    const result = await pool.request()
      .input('liveData', sql.Int, config.breakers.length)
      .execute('getLiveData');
    if (!result.recordset || result.recordset.length === 0) {
      console.log('No data found');
      return { status: 200, data: [] };
    }

    console.log({ status: 200, data: result.recordset });
    return { status: 200, data: result.recordset };

  } catch (err) {
    console.error('Error fetching Switches data:', err);
    return { status: 500, message: err.message };
  }
}




module.exports = { writeBreakerData, getActivePower, getBreakersMainData, getBreakersNames };
