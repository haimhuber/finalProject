const connectDb = require('./db');
const sql = require('mssql');
async function writeBreakerData(data, tableIndex) {
  const bits = [];
  for (let i = 15; i >= 0; i--) {
    bits.push((data[12] >> i) & 1);    
  }
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
      .input('PowerFactor', data[7] / 100.0)
      .input('ActivePower', data[8] / 10.0)
      .input('ReactivePower', data[9] / 10.0)
      .input('ApparentPower', data[10] / 10.0)
      .input('NominalCurrent', data[11] / 10.0)
      .input('ActiveEnergy', ((data[13] * 65536) + data[14]) / 10.0)
      .query(`INSERT INTO Switches
                    (switch_id, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, ActivePower, ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy)
                    VALUES 
                    (@switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, @ActivePower, @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy)`);

    if (result.rowsAffected[0] === 0) {
      return { message: 'Values cannot be sent', status: 404 };
    }
    return { message: 'Values sent successfully', status: 200 };
  } catch (err) {
    console.error('DB insert error:', err); // log full error
    return { message: err.message || 'Unknown error', status: 500 };
  }
}


async function getActiveEnergy(startTime, endTime) {
  try {
    const pool = await connectDb.connectionToSqlDB();
    const result = await pool.request()
      .input('StartTime', sql.DateTime, startTime)
      .input('EndTime', sql.DateTime, endTime)
      .execute('GetActiveEnergyByTime');
    console.log({ status: 200, data: result.recordset[0] });
    return { status: 200, data: result.recordset };

  } catch (err) {
    console.error('Error imported!:', err);
    return { message: err, status: 500 };
  }
};

module.exports = { writeBreakerData, getActiveEnergy };
