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
            @userPassword VARCHAR(255),
            @userEmail VARCHAR(255)
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
                INSERT INTO Users (userName, userPassword, email)
                VALUES (@userName, @userPassword, @userEmail);

                SELECT
                    1 AS success,
                    'User created successfully' AS message,
                    SCOPE_IDENTITY() AS insertedId;
            END`);
        console.log("✅ Stored Procedure 'AddUser' created successfully");
        // ---------------------------------------------------------------------------------------
        await pool.request().query(`             
            CREATE OR ALTER PROCEDURE CheckUserExists
                @userName VARCHAR(20)
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT userPassword, email
                FROM Users
                WHERE userName = @userName;
            END
            `);
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
        // ---------------------------------------------------------------------------------------
        await pool.request().query(`                
        CREATE OR ALTER PROCEDURE GetLatestSwitches
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT TOP 21 
                    BreakerClose, 
                    BreakerOpen, 
                    timestamp
                FROM Switches
                ORDER BY timestamp DESC;
            END`);
        console.log("✅ Stored Procedure 'GetLatestSwitches' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`                
        CREATE OR ALTER PROCEDURE AddUserAudit
            @userName VARCHAR(20),
            @type VARCHAR(20)
        AS
        BEGIN
            SET NOCOUNT ON;

            INSERT INTO UserAuditTrail (userName, type)
            VALUES (@userName, @type);

            SELECT 
                1 AS success,
                'Audit entry recorded successfully' AS message,
                SCOPE_IDENTITY() AS insertedId;
        END`);
        console.log("✅ Stored Procedure 'AddUserAudit' created successfully");
        // ---------------------------------------------------------------------------------------
        await pool.request().query(`                
        CREATE OR ALTER PROCEDURE ReadAllAuditTrail
            AS
            BEGIN
                SET NOCOUNT ON;

                SELECT * 
                FROM UserAuditTrail
                Order by timestamp DESC;
        END`);
        console.log("✅ Stored Procedure 'ReadAllAuditTrail' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`                
        CREATE OR ALTER PROCEDURE GetAllDailySamples
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get the last 10 days for all switches (latest record per day per switch)
            WITH DailyLatest AS (
                SELECT 
                    switch_id,
                    CAST(timestamp AS DATE) AS day_slot,
                    ActivePower,
                    timestamp,
                    ROW_NUMBER() OVER (
                        PARTITION BY switch_id, CAST(timestamp AS DATE)
                        ORDER BY timestamp DESC
                    ) AS rn
                FROM Switches
            ),
            Last10Days AS (
                SELECT switch_id, day_slot, ActivePower, timestamp,
                       ROW_NUMBER() OVER (
                           PARTITION BY switch_id 
                           ORDER BY day_slot DESC
                       ) AS day_rank
                FROM DailyLatest
                WHERE rn = 1
            )
            SELECT switch_id, day_slot, ActivePower, timestamp
            FROM Last10Days
            WHERE day_rank <= 10
            ORDER BY switch_id ASC, day_slot ASC;
        END`);
        console.log("✅ Stored Procedure 'GetAllDailySamples' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`                
        CREATE OR ALTER PROCEDURE GetAllDailySamplesActiveEnergy
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get the last 10 days for all switches (latest record per day per switch)
            WITH DailyLatest AS (
                SELECT 
                    switch_id,
                    CAST(timestamp AS DATE) AS day_slot,
                    ActiveEnergy,
                    timestamp,
                    ROW_NUMBER() OVER (
                        PARTITION BY switch_id, CAST(timestamp AS DATE)
                        ORDER BY timestamp DESC
                    ) AS rn
                FROM Switches
            ),
            Last10Days AS (
                SELECT switch_id, day_slot, ActiveEnergy, timestamp,
                       ROW_NUMBER() OVER (
                           PARTITION BY switch_id 
                           ORDER BY day_slot DESC
                       ) AS day_rank
                FROM DailyLatest
                WHERE rn = 1
            )
            SELECT switch_id, day_slot, ActiveEnergy, timestamp
            FROM Last10Days
            WHERE day_rank <= 10
            ORDER BY switch_id ASC, day_slot ASC;
        END`);
        console.log("✅ Stored Procedure 'GetAllDailySamplesActiveEnergy' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetDailyConsumption
            @switch_id INT,
            @date DATE
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get 4 daily samples (6-hour intervals)
            WITH HourlySamples AS (
                SELECT 
                    ActiveEnergy,
                    timestamp,
                    DATEPART(HOUR, timestamp) as hour_part,
                    ROW_NUMBER() OVER (
                        PARTITION BY DATEPART(HOUR, timestamp) / 6
                        ORDER BY timestamp DESC
                    ) AS rn
                FROM Switches
                WHERE switch_id = @switch_id
                    AND CAST(timestamp AS DATE) = @date
            ),
            DailySamples AS (
                SELECT ActiveEnergy, timestamp
                FROM HourlySamples
                WHERE rn = 1
            )
            SELECT 
                switch_id = @switch_id,
                date = @date,
                ActiveEnergy,
                timestamp,
                -- Calculate consumption difference between samples
                LAG(ActiveEnergy) OVER (ORDER BY timestamp) as prev_energy,
                CASE 
                    WHEN LAG(ActiveEnergy) OVER (ORDER BY timestamp) IS NOT NULL 
                    THEN ActiveEnergy - LAG(ActiveEnergy) OVER (ORDER BY timestamp)
                    ELSE 0
                END as consumption_kwh
            FROM DailySamples
            ORDER BY timestamp;
        END`);
        console.log("✅ Stored Procedure 'GetDailyConsumption' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetMonthlyConsumption
            @switch_id INT,
            @year INT,
            @month INT
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get daily consumption for entire month
            WITH DailyConsumption AS (
                SELECT 
                    CAST(timestamp AS DATE) as consumption_date,
                    MAX(ActiveEnergy) - MIN(ActiveEnergy) as daily_consumption
                FROM Switches
                WHERE switch_id = @switch_id
                    AND YEAR(timestamp) = @year
                    AND MONTH(timestamp) = @month
                GROUP BY CAST(timestamp AS DATE)
            )
            SELECT 
                switch_id = @switch_id,
                year = @year,
                month = @month,
                consumption_date,
                daily_consumption,
                SUM(daily_consumption) OVER (ORDER BY consumption_date) as cumulative_consumption
            FROM DailyConsumption
            ORDER BY consumption_date;
        END`);
        console.log("✅ Stored Procedure 'GetMonthlyConsumption' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetConsumptionSummary
            @switch_id INT,
            @start_date DATE,
            @end_date DATE
        AS
        BEGIN
            SET NOCOUNT ON;

            SELECT 
                switch_id = @switch_id,
                period_start = @start_date,
                period_end = @end_date,
                total_consumption = MAX(ActiveEnergy) - MIN(ActiveEnergy),
                avg_daily_consumption = (MAX(ActiveEnergy) - MIN(ActiveEnergy)) / DATEDIFF(DAY, @start_date, @end_date),
                sample_count = COUNT(*)
            FROM Switches
            WHERE switch_id = @switch_id
                AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date;
        END`);
        console.log("✅ Stored Procedure 'GetConsumptionSummary' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetConsumptionWithBilling
            @switch_id INT,
            @start_date DATE,
            @end_date DATE
        AS
        BEGIN
            SET NOCOUNT ON;

            WITH DailyConsumption AS (
                SELECT 
                    CAST(timestamp AS DATE) as consumption_date,
                    DATEPART(HOUR, timestamp) as hour_part,
                    MAX(ActiveEnergy) - MIN(ActiveEnergy) as daily_consumption
                FROM Switches
                WHERE switch_id = @switch_id
                    AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date
                GROUP BY CAST(timestamp AS DATE), DATEPART(HOUR, timestamp)
            ),
            ConsumptionWithTariff AS (
                SELECT 
                    consumption_date,
                    daily_consumption,
                    CASE 
                        WHEN hour_part BETWEEN 7 AND 16 THEN 'Peak'      -- שיא 7:00-17:00
                        WHEN hour_part BETWEEN 17 AND 22 THEN 'Mid'       -- גבע 17:00-23:00
                        ELSE 'Off-Peak'                                   -- שפל 23:00-7:00
                    END as tariff_type,
                    CASE 
                        WHEN hour_part BETWEEN 7 AND 16 THEN daily_consumption * 0.5712  -- שיא
                        WHEN hour_part BETWEEN 17 AND 22 THEN daily_consumption * 0.4827  -- גבע
                        ELSE daily_consumption * 0.3956                                   -- שפל
                    END as cost_shekel
                FROM DailyConsumption
            )
            SELECT 
                switch_id = @switch_id,
                consumption_date,
                tariff_type,
                daily_consumption,
                cost_shekel,
                SUM(daily_consumption) OVER (ORDER BY consumption_date) as cumulative_consumption,
                SUM(cost_shekel) OVER (ORDER BY consumption_date) as cumulative_cost
            FROM ConsumptionWithTariff
            ORDER BY consumption_date;
        END`);
        console.log("✅ Stored Procedure 'GetConsumptionWithBilling' created successfully");

    } catch (error) {
        console.error('❌ Error creating stored procedures:', error);
        throw error;
    }
}

module.exports = { createSp };
