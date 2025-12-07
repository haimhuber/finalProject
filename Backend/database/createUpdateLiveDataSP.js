require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const sqlConnection = require('./db');

async function createUpdateLiveDataSP() {
    try {
        console.log('🔄 מתחבר למסד הנתונים...');
        const pool = await sqlConnection.connectionToSqlDB();
        console.log('✅ התחבר בהצלחה');
        
        const updateLiveDataProcedure = `
CREATE PROCEDURE UpdateLiveData
    @switch_id INT,
    @V12 FLOAT,
    @V23 FLOAT,
    @V31 FLOAT,
    @I1 FLOAT,
    @I2 FLOAT,
    @I3 FLOAT,
    @Frequency FLOAT,
    @PowerFactor FLOAT,
    @ActivePower FLOAT,
    @ReactivePower FLOAT,
    @ApparentPower FLOAT,
    @NominalCurrent FLOAT,
    @ActiveEnergy FLOAT,
    @CommStatus BIT,
    @ProtectionTrip BIT,
    @ProtectionInstTrip BIT,
    @ProtectionI_Enabled BIT,
    @ProtectionS_Enabled BIT,
    @ProtectionL_Enabled BIT,
    @ProtectionG_Trip BIT,
    @ProtectionI_Trip BIT,
    @ProtectionS_Trip BIT,
    @ProtectionL_Trip BIT,
    @TripDisconnected BIT,
    @Tripped BIT,
    @Undefined BIT,
    @BreakerClose BIT,
    @BreakerOpen BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    MERGE INTO LiveData AS target
    USING (VALUES (@switch_id)) AS source (switch_id)
    ON target.switch_id = source.switch_id
    WHEN MATCHED THEN
        UPDATE SET
            V12 = @V12,
            V23 = @V23,
            V31 = @V31,
            I1 = @I1,
            I2 = @I2,
            I3 = @I3,
            Frequency = @Frequency,
            PowerFactor = @PowerFactor,
            ActivePower = @ActivePower,
            ReactivePower = @ReactivePower,
            ApparentPower = @ApparentPower,
            NominalCurrent = @NominalCurrent,
            ActiveEnergy = @ActiveEnergy,
            CommStatus = @CommStatus,
            ProtectionTrip = @ProtectionTrip,
            ProtectionInstTrip = @ProtectionInstTrip,
            ProtectionI_Enabled = @ProtectionI_Enabled,
            ProtectionS_Enabled = @ProtectionS_Enabled,
            ProtectionL_Enabled = @ProtectionL_Enabled,
            ProtectionG_Trip = @ProtectionG_Trip,
            ProtectionI_Trip = @ProtectionI_Trip,
            ProtectionS_Trip = @ProtectionS_Trip,
            ProtectionL_Trip = @ProtectionL_Trip,
            TripDisconnected = @TripDisconnected,
            Tripped = @Tripped,
            Undefined = @Undefined,
            BreakerClose = @BreakerClose,
            BreakerOpen = @BreakerOpen,
            timestamp = GETDATE()
    WHEN NOT MATCHED THEN
        INSERT (switch_id, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, 
                ActivePower, ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy, 
                CommStatus, ProtectionTrip, ProtectionInstTrip, ProtectionI_Enabled, 
                ProtectionS_Enabled, ProtectionL_Enabled, ProtectionG_Trip, ProtectionI_Trip, 
                ProtectionS_Trip, ProtectionL_Trip, TripDisconnected, Tripped, Undefined, 
                BreakerClose, BreakerOpen, timestamp)
        VALUES (@switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, 
                @ActivePower, @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy, 
                @CommStatus, @ProtectionTrip, @ProtectionInstTrip, @ProtectionI_Enabled, 
                @ProtectionS_Enabled, @ProtectionL_Enabled, @ProtectionG_Trip, @ProtectionI_Trip, 
                @ProtectionS_Trip, @ProtectionL_Trip, @TripDisconnected, @Tripped, @Undefined, 
                @BreakerClose, @BreakerOpen, GETDATE());
END;
`;

        console.log('🔄 יוצר Stored Procedure UpdateLiveData...');
        await pool.request().query(updateLiveDataProcedure);
        console.log('✅ SP UpdateLiveData נוצר בהצלחה!');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ שגיאה:', err.message);
        console.error(err);
        process.exit(1);
    }
}

createUpdateLiveDataSP();
