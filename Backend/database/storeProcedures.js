const connectDb = require('./db');
const checkDelete = require('./deleteTables');
const database = 'DigitalPanel';

async function createSp() {
  try {
    const pool = await connectDb.connectionToSqlDB(database);
    await pool.request().query(`
      CREATE or alter PROCEDURE addBreakerData
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
        INSERT INTO Switches (
          switch_id, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, ActivePower,
          ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy, CommStatus,
          ProtectionTrip, ProtectionInstTrip, ProtectionI_Enabled, ProtectionS_Enabled, ProtectionL_Enabled,
          ProtectionG_Trip, ProtectionI_Trip, ProtectionS_Trip, ProtectionL_Trip,
          TripDisconnected, Tripped, Undefined, BreakerClose, BreakerOpen
        )
        VALUES (
          @switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, @ActivePower,
          @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy, @CommStatus,
          @ProtectionTrip, @ProtectionInstTrip, @ProtectionI_Enabled, @ProtectionS_Enabled, @ProtectionL_Enabled,
          @ProtectionG_Trip, @ProtectionI_Trip, @ProtectionS_Trip, @ProtectionL_Trip,
          @TripDisconnected, @Tripped, @Undefined, @BreakerClose, @BreakerOpen
        );
      END
    `);
    console.log("✅ Stored Procedure 'addBreakerData' created successfully");
    // ---------------------------------------------------------------------------------------
    await pool.request().query(`      
            CREATE OR ALTER PROCEDURE getActiveEnergy
                @switch_id INT,
                @startTime DATETIME,
                @endTime DATETIME
            AS
            BEGIN
                SELECT 
                    M.name,
                    S.ActiveEnergy,
                    FORMAT(S.timestamp, 'yyyy-MM-dd HH:mm') AS DateTimeHHMM
                FROM 
                    MainData AS M
                INNER JOIN 
                    Switches AS S ON M.id = S.switch_id
                WHERE
                    S.switch_id = @switch_id
                    AND S.timestamp BETWEEN @startTime AND @endTime
                ORDER BY 
                    S.timestamp;
            END;`);

    console.log("✅ Stored Procedure 'getActiveEnergy' created successfully");
// ---------------------------------------------------------------------------------------
    await pool.request().query(`      
           create or alter Procedure getAllSwitchesData
            @rows INT
            as 
              begin
              select TOP (@rows) * from Switches
            end`);
    console.log("✅ Stored Procedure 'getLiveSwitchesData' created successfully");
// ---------------------------------------------------------------------------------------
    await pool.request().query(`             
        CREATE OR ALTER PROCEDURE getLiveData
            @liveData INT
        AS
        BEGIN
        SELECT *
            FROM (
            SELECT TOP (@liveData) *
            FROM Switches
            ORDER BY Switches.timestamp DESC
        ) AS Latest
        ORDER BY Latest.timestamp ASC;
        END;`);
    console.log("✅ Stored Procedure 'getLiveData' created successfully");
// ---------------------------------------------------------------------------------------
     await pool.request().query(`             
      CREATE OR ALTER PROCEDURE GetDailySample
            @switch_id INT
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get the last 10 days (latest record per day)
            WITH DailyLatest AS (
                SELECT 
                    CAST(timestamp AS DATE) AS day_slot,
                    ActivePower,
                    timestamp,
                    ROW_NUMBER() OVER (
                        PARTITION BY CAST(timestamp AS DATE)
                        ORDER BY timestamp DESC
                    ) AS rn
                FROM Switches
                WHERE switch_id = @switch_id
            ),
            Last10Days AS (
                SELECT TOP 10 day_slot, ActivePower, timestamp
                FROM DailyLatest
                WHERE rn = 1
                ORDER BY day_slot DESC
            )
            SELECT day_slot, ActivePower, timestamp
            FROM Last10Days
            ORDER BY day_slot ASC;  -- return sorted oldest → newest
        END
                      
              `);
    console.log("✅ Stored Procedure 'GetDailySample' created successfully");

    // --------------------------------------------------------------------------
     await pool.request().query(`             
     CREATE OR ALTER PROCEDURE GetDailySampleActiveEnergy
            @switch_id INT
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get the last 10 days (latest record per day)
            WITH DailyLatest AS (
                SELECT 
                    CAST(timestamp AS DATE) AS day_slot,
                    ActiveEnergy,
                    timestamp,
                    ROW_NUMBER() OVER (
                        PARTITION BY CAST(timestamp AS DATE)
                        ORDER BY timestamp DESC
                    ) AS rn
                FROM Switches
                WHERE switch_id = @switch_id
            ),
            Last10Days AS (
                SELECT TOP 10 day_slot, ActiveEnergy, timestamp
                FROM DailyLatest
                WHERE rn = 1
                ORDER BY day_slot DESC
            )
            SELECT day_slot, ActiveEnergy, timestamp
            FROM Last10Days
            ORDER BY day_slot ASC;  -- return sorted oldest → newest
        END`);
    console.log("✅ Stored Procedure 'GetDailySampleActiveEnergy' created successfully");
    // ---------------------------------------------------------------------------------------
     await pool.request().query(`             
     CREATE or alter PROCEDURE AddUser
        @userName VARCHAR(20),
        @userPassword VARCHAR(255)
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Check if username already exists
            IF EXISTS (SELECT 1 FROM Users WHERE userName = @userName)
            BEGIN
                SELECT 
                    0 AS success,
                    'Username already exists' AS message;
                RETURN;
            END;

            -- Insert new user
            INSERT INTO Users (userName, userPassword)
            VALUES (@userName, @userPassword);

            SELECT
                1 AS success,
                'User created successfully' AS message,
                SCOPE_IDENTITY() AS insertedId;
        END`);
    console.log("✅ Stored Procedure 'AddUser' created successfully");
     // ---------------------------------------------------------------------------------------
     await pool.request().query(`             
    CREATE OR ALTER PROCEDURE CheckUserExists
    @userName VARCHAR(20),
    @userPassword VARCHAR(255)
        AS
        BEGIN
            SET NOCOUNT ON;
            SELECT *
            FROM Users
            WHERE userName = @userName
            AND userPassword = @userPassword;
    END`);
    console.log("✅ Stored Procedure 'CheckUserExists' created successfully");
     // ---------------------------------------------------------------------------------------
     await pool.request().query(`                
        CREATE OR ALTER PROCEDURE AlertsData
            
        AS
        BEGIN

            SELECT *
            FROM Alerts
        order by Alerts.timestamp DESC
        END`);
    console.log("✅ Stored Procedure 'AlertsData' created successfully");
 // ---------------------------------------------------------------------------------------
     await pool.request().query(`                
       CREATE OR ALTER PROCEDURE UpdateAlertAck
            @AlertId INT,
            @AckValue INT,
            @AckType VARCHAR(50),
            @AckMessage VARCHAR(255)
            AS
            BEGIN
                SET NOCOUNT ON;
                UPDATE Alerts
                SET 
                    alert_type = @AckType,
                    alert_message = @AckMessage,
                    alertAck = @AckValue
                WHERE id = @AlertId;
        END`);
    console.log("✅ Stored Procedure 'UpdateAlertAck' created successfully");
     // ---------------------------------------------------------------------------------------
     await pool.request().query(`                
        CREATE or alter PROCEDURE AddAckAlert
            @ackId INT,
            @ackBy VARCHAR(50)
            AS
            BEGIN
                SET NOCOUNT ON;
                INSERT INTO AckAlert (ackId, ackBy)
                VALUES (@ackId, @ackBy);
        END`);
    console.log("✅ Stored Procedure 'AddAckAlert' created successfully");

     // ---------------------------------------------------------------------------------------
     await pool.request().query(`                
        CREATE OR ALTER PROCEDURE ReadAllAckData
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT * 
                FROM AckAlert;
        END`);
    console.log("✅ Stored Procedure 'ReadAllAckData' created successfully");

  } catch (err) {
    console.error('❌ Error creating addBreakerData SP:', err);
    return { message: err.message, status: 500 };
  }  
}

module.exports = { createSp };
