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
        -- Insert into historical data
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
        
        -- Update live data
        EXEC UpdateLiveData @switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, @ActivePower,
                           @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy, @CommStatus,
                           @ProtectionTrip, @ProtectionInstTrip, @ProtectionI_Enabled, @ProtectionS_Enabled, @ProtectionL_Enabled,
                           @ProtectionG_Trip, @ProtectionI_Trip, @ProtectionS_Trip, @ProtectionL_Trip,
                           @TripDisconnected, @Tripped, @Undefined, @BreakerClose, @BreakerOpen;
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
            SELECT * FROM LiveData ORDER BY switch_id ASC;
        END;`);
        console.log("✅ Stored Procedure 'getLiveData' (using LiveData) created successfully");
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
        CREATE OR ALTER PROCEDURE GetLast2DaysActivePower
            @switch_id INT
        AS
        BEGIN
            SET NOCOUNT ON;

            -- Get all records from the last 2 days at the current hour
            DECLARE @TwoDaysAgo DATETIME = DATEADD(DAY, -2, GETDATE());
            DECLARE @CurrentHour INT = DATEPART(HOUR, GETDATE());

            SELECT 
                ActivePower,
                timestamp
            FROM Switches
            WHERE switch_id = @switch_id
                AND timestamp >= @TwoDaysAgo
                AND DATEPART(HOUR, timestamp) = @CurrentHour
            ORDER BY timestamp ASC;
        END`);
        console.log("✅ Stored Procedure 'GetLast2DaysActivePower' created successfully");
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
        DROP PROCEDURE IF EXISTS GetConsumptionWithBilling;
        `);
        
        await pool.request().query(`
        CREATE PROCEDURE GetConsumptionWithBilling
            @switch_id INT,
            @start_date DATE,
            @end_date DATE
        AS
        BEGIN
            SET NOCOUNT ON;
            
            -- Step 1: Get total daily consumption (same as before)
            WITH DailyTotals AS (
                SELECT 
                    CAST(timestamp AS DATE) as consumption_date,
                    MIN(ActiveEnergy) as start_energy,
                    MAX(ActiveEnergy) as end_energy
                FROM Switches
                WHERE switch_id = @switch_id
                  AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date
                GROUP BY CAST(timestamp AS DATE)
            ),
            
            -- Step 2: Calculate consumption per hour to determine peak/off-peak split
            HourlyConsumption AS (
                SELECT 
                    CAST(timestamp AS DATE) as consumption_date,
                    DATEPART(HOUR, timestamp) as hour_of_day,
                    MONTH(timestamp) as month_num,
                    DATEPART(WEEKDAY, timestamp) as day_of_week,
                    MIN(ActiveEnergy) as hour_start_energy,
                    MAX(ActiveEnergy) as hour_end_energy
                FROM Switches
                WHERE switch_id = @switch_id
                  AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date
                GROUP BY CAST(timestamp AS DATE), DATEPART(HOUR, timestamp), MONTH(timestamp), DATEPART(WEEKDAY, timestamp)
            ),
            
            -- Step 3: Classify hours as peak or off-peak
            HourlyClassified AS (
                SELECT 
                    consumption_date,
                    month_num,
                    hour_start_energy,
                    hour_end_energy,
                    -- Classify as peak or off-peak
                    CASE 
                        -- חורף: כל הימים פסגה 17:00-22:00
                        WHEN month_num IN (12, 1, 2) THEN
                            CASE 
                                WHEN hour_of_day >= 17 AND hour_of_day < 22 THEN 'peak'
                                ELSE 'off-peak'
                            END
                            
                        -- קיץ: ימים א'-ה' (2-6) פסגה 17:00-23:00
                        WHEN month_num IN (6, 7, 8, 9) THEN
                            CASE 
                                WHEN day_of_week BETWEEN 2 AND 6 
                                     AND hour_of_day >= 17 
                                     AND hour_of_day < 23 THEN 'peak'
                                ELSE 'off-peak'
                            END
                            
                        -- אביב/סתיו: ימים א'-ה' (2-6) פסגה 07:00-17:00
                        ELSE
                            CASE 
                                WHEN day_of_week BETWEEN 2 AND 6 
                                     AND hour_of_day >= 7 
                                     AND hour_of_day < 17 THEN 'peak'
                                ELSE 'off-peak'
                            END
                    END as time_category
                FROM HourlyConsumption
            ),
            
            -- Step 4: Calculate hourly consumption
            HourlyWithConsumption AS (
                SELECT 
                    consumption_date,
                    month_num,
                    time_category,
                    CASE 
                        WHEN hour_end_energy >= hour_start_energy 
                        THEN hour_end_energy - hour_start_energy
                        ELSE 0
                    END as hourly_consumption
                FROM HourlyClassified
            ),
            
            -- Step 5: Aggregate peak and off-peak consumption per day
            DailyBreakdown AS (
                SELECT 
                    h.consumption_date,
                    h.month_num,
                    dt.end_energy - dt.start_energy as daily_consumption,
                    SUM(CASE WHEN h.time_category = 'peak' THEN h.hourly_consumption ELSE 0 END) as peak_hourly_sum,
                    SUM(CASE WHEN h.time_category = 'off-peak' THEN h.hourly_consumption ELSE 0 END) as offpeak_hourly_sum,
                    SUM(h.hourly_consumption) as total_hourly_sum
                FROM HourlyWithConsumption h
                INNER JOIN DailyTotals dt ON h.consumption_date = dt.consumption_date
                GROUP BY h.consumption_date, h.month_num, dt.end_energy, dt.start_energy
            ),
            
            -- Step 6: Calculate proportional peak/off-peak based on actual daily consumption
            ProportionalSplit AS (
                SELECT 
                    consumption_date,
                    month_num,
                    daily_consumption,
                    CASE 
                        WHEN total_hourly_sum > 0 THEN 
                            daily_consumption * (peak_hourly_sum / total_hourly_sum)
                        ELSE 0
                    END as peak_consumption,
                    CASE 
                        WHEN total_hourly_sum > 0 THEN 
                            daily_consumption * (offpeak_hourly_sum / total_hourly_sum)
                        ELSE daily_consumption
                    END as offpeak_consumption
                FROM DailyBreakdown
            ),
            
            -- Step 7: Calculate costs
            WithCosts AS (
                SELECT *,
                    CASE 
                        WHEN month_num IN (12, 1, 2) THEN 'Winter'
                        WHEN month_num IN (3, 4, 5) THEN 'Spring'
                        WHEN month_num IN (6, 7, 8, 9) THEN 'Summer'
                        ELSE 'Autumn'
                    END as season,
                    CASE 
                        -- חורף
                        WHEN month_num IN (12, 1, 2) THEN
                            peak_consumption * 1.2071 + offpeak_consumption * 0.4557
                            
                        -- קיץ
                        WHEN month_num IN (6, 7, 8, 9) THEN
                            peak_consumption * 1.6895 + offpeak_consumption * 0.5283
                            
                        -- אביב/סתיו
                        ELSE
                            peak_consumption * 0.4977 + offpeak_consumption * 0.4460
                    END as daily_cost
                FROM ProportionalSplit
                WHERE daily_consumption >= 0
            )
            
            SELECT 
                @switch_id as switch_id,
                consumption_date,
                season,
                daily_consumption,
                peak_consumption,
                offpeak_consumption,
                daily_cost,
                SUM(daily_consumption) OVER (ORDER BY consumption_date) as cumulative_consumption,
                SUM(daily_cost) OVER (ORDER BY consumption_date) as cumulative_cost
            FROM WithCosts
            ORDER BY consumption_date;
        END`);
        console.log("✅ Stored Procedure 'GetConsumptionWithBilling' (Seasonal) created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE CheckDataExists
            @switch_id INT,
            @start_date DATE,
            @end_date DATE
        AS
        BEGIN
            SELECT COUNT(*) as record_count,
                   MIN(timestamp) as earliest_record,
                   MAX(timestamp) as latest_record,
                   CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END as data_exists
            FROM Switches 
            WHERE switch_id = @switch_id 
              AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date;
        END`);
        console.log("✅ Stored Procedure 'CheckDataExists' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE getAllSwitchesNames
        AS
        BEGIN
            SELECT id, name, type, load FROM MainData ORDER BY id;
        END`);
        console.log("✅ Stored Procedure 'getAllSwitchesNames' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE ReportPowerData
            @switch_id VARCHAR(50),
            @startTime DATETIME,
            @endTime DATETIME
        AS
        BEGIN
            SELECT ActivePower, ActiveEnergy, timestamp
            FROM Switches
            WHERE switch_id = CAST(@switch_id AS INT)
              AND timestamp BETWEEN @startTime AND @endTime
            ORDER BY timestamp;
        END`);
        console.log("✅ Stored Procedure 'ReportPowerData' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE UpdateLiveData
            @switch_id INT,
            @V12 FLOAT, @V23 FLOAT, @V31 FLOAT,
            @I1 FLOAT, @I2 FLOAT, @I3 FLOAT,
            @Frequency FLOAT, @PowerFactor FLOAT,
            @ActivePower FLOAT, @ReactivePower FLOAT, @ApparentPower FLOAT,
            @NominalCurrent FLOAT, @ActiveEnergy FLOAT,
            @CommStatus BIT, @ProtectionTrip BIT, @ProtectionInstTrip BIT,
            @ProtectionI_Enabled BIT, @ProtectionS_Enabled BIT, @ProtectionL_Enabled BIT,
            @ProtectionG_Trip BIT, @ProtectionI_Trip BIT, @ProtectionS_Trip BIT, @ProtectionL_Trip BIT,
            @TripDisconnected BIT, @Tripped BIT, @Undefined BIT,
            @BreakerClose BIT, @BreakerOpen BIT
        AS
        BEGIN
            MERGE LiveData AS target
            USING (SELECT @switch_id AS switch_id) AS source
            ON target.switch_id = source.switch_id
            WHEN MATCHED THEN
                UPDATE SET
                    V12 = @V12, V23 = @V23, V31 = @V31,
                    I1 = @I1, I2 = @I2, I3 = @I3,
                    Frequency = @Frequency, PowerFactor = @PowerFactor,
                    ActivePower = @ActivePower, ReactivePower = @ReactivePower, ApparentPower = @ApparentPower,
                    NominalCurrent = @NominalCurrent, ActiveEnergy = @ActiveEnergy,
                    CommStatus = @CommStatus, ProtectionTrip = @ProtectionTrip, ProtectionInstTrip = @ProtectionInstTrip,
                    ProtectionI_Enabled = @ProtectionI_Enabled, ProtectionS_Enabled = @ProtectionS_Enabled, ProtectionL_Enabled = @ProtectionL_Enabled,
                    ProtectionG_Trip = @ProtectionG_Trip, ProtectionI_Trip = @ProtectionI_Trip, ProtectionS_Trip = @ProtectionS_Trip, ProtectionL_Trip = @ProtectionL_Trip,
                    TripDisconnected = @TripDisconnected, Tripped = @Tripped, Undefined = @Undefined,
                    BreakerClose = @BreakerClose, BreakerOpen = @BreakerOpen,
                    timestamp = CURRENT_TIMESTAMP
            WHEN NOT MATCHED THEN
                INSERT (switch_id, V12, V23, V31, I1, I2, I3, Frequency, PowerFactor, ActivePower,
                        ReactivePower, ApparentPower, NominalCurrent, ActiveEnergy, CommStatus,
                        ProtectionTrip, ProtectionInstTrip, ProtectionI_Enabled, ProtectionS_Enabled, ProtectionL_Enabled,
                        ProtectionG_Trip, ProtectionI_Trip, ProtectionS_Trip, ProtectionL_Trip,
                        TripDisconnected, Tripped, Undefined, BreakerClose, BreakerOpen)
                VALUES (@switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, @ActivePower,
                        @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy, @CommStatus,
                        @ProtectionTrip, @ProtectionInstTrip, @ProtectionI_Enabled, @ProtectionS_Enabled, @ProtectionL_Enabled,
                        @ProtectionG_Trip, @ProtectionI_Trip, @ProtectionS_Trip, @ProtectionL_Trip,
                        @TripDisconnected, @Tripped, @Undefined, @BreakerClose, @BreakerOpen);
        END`);
        console.log("✅ Stored Procedure 'UpdateLiveData' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetLiveDataOnly
        AS
        BEGIN
            SELECT * FROM LiveData ORDER BY switch_id;
        END`);
        console.log("✅ Stored Procedure 'GetLiveDataOnly' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetHourlySamples
            @StartDate DATETIME,
            @EndDate DATETIME,
            @SwitchId INT = NULL
        AS
        BEGIN
            SELECT 
                switch_id,
                AVG(ActiveEnergy) AS ActiveEnergy,
                DATEADD(HOUR, DATEDIFF(HOUR, 0, timestamp), 0) AS timestamp
            FROM Switches 
            WHERE timestamp BETWEEN @StartDate AND @EndDate
                AND (@SwitchId IS NULL OR switch_id = @SwitchId)
            GROUP BY 
                switch_id,
                DATEADD(HOUR, DATEDIFF(HOUR, 0, timestamp), 0)
            ORDER BY timestamp DESC, switch_id
        END`);
        console.log("✅ Stored Procedure 'GetHourlySamples' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetDailySamples
            @StartDate DATETIME,
            @EndDate DATETIME,
            @SwitchId INT = NULL
        AS
        BEGIN
            SELECT 
                switch_id,
                AVG(ActiveEnergy) AS ActiveEnergy,
                CAST(timestamp AS DATE) AS timestamp
            FROM Switches 
            WHERE timestamp BETWEEN @StartDate AND @EndDate
                AND (@SwitchId IS NULL OR switch_id = @SwitchId)
            GROUP BY 
                switch_id,
                CAST(timestamp AS DATE)
            ORDER BY timestamp DESC, switch_id
        END`);
        console.log("✅ Stored Procedure 'GetDailySamples' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetWeeklySamples
            @StartDate DATETIME,
            @EndDate DATETIME,
            @SwitchId INT = NULL
        AS
        BEGIN
            SELECT 
                switch_id,
                AVG(ActiveEnergy) AS ActiveEnergy,
                DATEADD(WEEK, DATEDIFF(WEEK, 0, timestamp), 0) AS timestamp
            FROM Switches 
            WHERE timestamp BETWEEN @StartDate AND @EndDate
                AND (@SwitchId IS NULL OR switch_id = @SwitchId)
            GROUP BY 
                switch_id,
                DATEADD(WEEK, DATEDIFF(WEEK, 0, timestamp), 0)
            ORDER BY timestamp DESC, switch_id
        END`);
        console.log("✅ Stored Procedure 'GetWeeklySamples' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE DeleteUser
            @userId INT
        AS
        BEGIN
            DELETE FROM Users WHERE id = @userId;
            
            IF @@ROWCOUNT > 0
                SELECT 1 AS success, 'User deleted successfully' AS message;
            ELSE
                SELECT 0 AS success, 'User not found' AS message;
        END`);
        console.log("✅ Stored Procedure 'DeleteUser' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE UpdateUserPassword
            @email VARCHAR(100),
            @newPassword VARCHAR(255)
        AS
        BEGIN
            UPDATE Users 
            SET userPassword = @newPassword 
            WHERE email = @email;
            
            IF @@ROWCOUNT > 0
                SELECT 1 AS success, 'Password updated successfully' AS message;
            ELSE
                SELECT 0 AS success, 'User not found' AS message;
        END`);
        console.log("✅ Stored Procedure 'UpdateUserPassword' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE GetTariffRates
        AS
        BEGIN
            SELECT * FROM TariffRates WHERE isActive = 1 ORDER BY season;
        END`);
        console.log("✅ Stored Procedure 'GetTariffRates' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE UpdateTariffRate
            @season VARCHAR(20),
            @peakRate DECIMAL(10,4),
            @offPeakRate DECIMAL(10,4),
            @peakHours VARCHAR(50),
            @weekdaysOnly BIT,
            @efficiencyBase DECIMAL(10,2) = NULL,
            @efficiencyMultiplier DECIMAL(10,2) = NULL,
            @updatedBy VARCHAR(50)
        AS
        BEGIN
            UPDATE TariffRates 
            SET peakRate = @peakRate,
                offPeakRate = @offPeakRate,
                peakHours = @peakHours,
                weekdaysOnly = @weekdaysOnly,
                efficiencyBase = ISNULL(@efficiencyBase, efficiencyBase),
                efficiencyMultiplier = ISNULL(@efficiencyMultiplier, efficiencyMultiplier),
                createdBy = @updatedBy,
                timestamp = CURRENT_TIMESTAMP
            WHERE season = @season AND isActive = 1;
            
            IF @@ROWCOUNT > 0
                SELECT 1 AS success, 'Tariff updated successfully' AS message;
            ELSE
                SELECT 0 AS success, 'Tariff not found' AS message;
        END`);
        console.log("✅ Stored Procedure 'UpdateTariffRate' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE UpdateTariffRatesOnly
            @season VARCHAR(20),
            @peakRate DECIMAL(10,4),
            @offPeakRate DECIMAL(10,4),
            @updatedBy VARCHAR(50)
        AS
        BEGIN
            UPDATE TariffRates 
            SET peakRate = @peakRate,
                offPeakRate = @offPeakRate,
                createdBy = @updatedBy,
                timestamp = CURRENT_TIMESTAMP
            WHERE season = @season AND isActive = 1;
            
            IF @@ROWCOUNT > 0
                SELECT 1 AS success, 'Tariff rates updated successfully' AS message;
            ELSE
                SELECT 0 AS success, 'Tariff not found' AS message;
        END`);
        console.log("✅ Stored Procedure 'UpdateTariffRatesOnly' created successfully");

        // ---------------------------------------------------------------------------------------
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE UpdateEfficiencySettings
            @efficiencyBase DECIMAL(10,2),
            @efficiencyMultiplier DECIMAL(10,2),
            @updatedBy VARCHAR(50)
        AS
        BEGIN
            UPDATE TariffRates 
            SET efficiencyBase = @efficiencyBase,
                efficiencyMultiplier = @efficiencyMultiplier,
                createdBy = @updatedBy,
                timestamp = CURRENT_TIMESTAMP
            WHERE isActive = 1;
            
            IF @@ROWCOUNT > 0
                SELECT 1 AS success, 'Efficiency settings updated successfully' AS message;
            ELSE
                SELECT 0 AS success, 'No active tariffs found' AS message;
        END`);
        console.log("✅ Stored Procedure 'UpdateEfficiencySettings' created successfully");

        // ===================================================================================================
        // 37️⃣ AddProtectionAlert - Log protection alerts (avoiding duplicates)
        // ===================================================================================================
        await pool.request().query(`
        CREATE OR ALTER PROCEDURE AddProtectionAlert
            @switch_id INT,
            @alert_type VARCHAR(50),
            @alert_message VARCHAR(255)
        AS
        BEGIN
            SET NOCOUNT ON;
            
            -- Check if an unacknowledged alert already exists for this breaker and alert type
            IF NOT EXISTS (
                SELECT 1 
                FROM Alerts 
                WHERE alarmId = @switch_id 
                AND alert_type = @alert_type 
                AND alertAck = 0
            )
            BEGIN
                -- Insert new alert
                INSERT INTO Alerts (alarmId, alert_type, alert_message, alertAck, timestamp)
                VALUES (@switch_id, @alert_type, @alert_message, 0, GETDATE());
                
                PRINT '⚠️ New alert logged: ' + @alert_type + ' for breaker ID ' + CAST(@switch_id AS VARCHAR);
            END
            ELSE
            BEGIN
                PRINT '✓ Alert already exists (not acknowledged): ' + @alert_type + ' for breaker ID ' + CAST(@switch_id AS VARCHAR);
            END
        END`);
        console.log("✅ Stored Procedure 'AddProtectionAlert' created successfully");

    } catch (error) {
        console.error('❌ Error creating stored procedures:', error);
        throw error;
    }
}

module.exports = { createSp };
