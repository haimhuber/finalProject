-- =============================================
-- Complete Stored Procedures Creation Script
-- Database: DigitalPanel
-- Created: Auto-generated from existing database
-- Description: Creates all 13 stored procedures in correct dependency order
-- =============================================

USE DigitalPanel;
GO

-- =============================================
-- DROP existing procedures if they exist
-- =============================================

IF OBJECT_ID('addBreakerData', 'P') IS NOT NULL DROP PROCEDURE addBreakerData;
GO
IF OBJECT_ID('UpdateLiveData', 'P') IS NOT NULL DROP PROCEDURE UpdateLiveData;
GO
IF OBJECT_ID('getAllSwitchesNames', 'P') IS NOT NULL DROP PROCEDURE getAllSwitchesNames;
GO
IF OBJECT_ID('CheckUserExists', 'P') IS NOT NULL DROP PROCEDURE CheckUserExists;
GO
IF OBJECT_ID('AddUser', 'P') IS NOT NULL DROP PROCEDURE AddUser;
GO
IF OBJECT_ID('getLiveData', 'P') IS NOT NULL DROP PROCEDURE getLiveData;
GO
IF OBJECT_ID('getAllSwitchesData', 'P') IS NOT NULL DROP PROCEDURE getAllSwitchesData;
GO
IF OBJECT_ID('AlertsData', 'P') IS NOT NULL DROP PROCEDURE AlertsData;
GO
IF OBJECT_ID('getActiveEnergy', 'P') IS NOT NULL DROP PROCEDURE getActiveEnergy;
GO
IF OBJECT_ID('GetDailySample', 'P') IS NOT NULL DROP PROCEDURE GetDailySample;
GO
IF OBJECT_ID('GetDailySampleActiveEnergy', 'P') IS NOT NULL DROP PROCEDURE GetDailySampleActiveEnergy;
GO
IF OBJECT_ID('GetLast2DaysActivePower', 'P') IS NOT NULL DROP PROCEDURE GetLast2DaysActivePower;
GO
IF OBJECT_ID('AddProtectionAlert', 'P') IS NOT NULL DROP PROCEDURE AddProtectionAlert;
GO

-- =============================================
-- PROCEDURE: UpdateLiveData
-- Description: Merges live data into Switches table using MERGE statement
-- Dependencies: None (must be created FIRST - called by addBreakerData)
-- =============================================

CREATE PROCEDURE UpdateLiveData
    @switch_id INT,
    @VL1 FLOAT,
    @VL2 FLOAT,
    @VL3 FLOAT,
    @IL1 FLOAT,
    @IL2 FLOAT,
    @IL3 FLOAT,
    @AvgVoltage FLOAT,
    @AvgCurrent FLOAT,
    @TotalActivePower FLOAT,
    @ActivePower FLOAT,
    @ReactivePower FLOAT,
    @ApparentPower FLOAT,
    @ActiveEnergy FLOAT,
    @ReactiveEnergy FLOAT,
    @ApparentEnergy FLOAT,
    @PowerFactor FLOAT,
    @Frequency FLOAT,
    @PB1 BIT = NULL,
    @PB2 BIT = NULL,
    @PB3 BIT = NULL,
    @PB4 BIT = NULL,
    @PB5 BIT = NULL,
    @PB6 BIT = NULL,
    @PB7 BIT = NULL,
    @PB8 BIT = NULL,
    @PB9 BIT = NULL,
    @PB10 BIT = NULL,
    @PB11 BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    MERGE INTO Switches AS Target
    USING (
        SELECT 
            @switch_id AS switch_id,
            @VL1 AS VL1,
            @VL2 AS VL2,
            @VL3 AS VL3,
            @IL1 AS IL1,
            @IL2 AS IL2,
            @IL3 AS IL3,
            @AvgVoltage AS AvgVoltage,
            @AvgCurrent AS AvgCurrent,
            @TotalActivePower AS TotalActivePower,
            @ActivePower AS ActivePower,
            @ReactivePower AS ReactivePower,
            @ApparentPower AS ApparentPower,
            @ActiveEnergy AS ActiveEnergy,
            @ReactiveEnergy AS ReactiveEnergy,
            @ApparentEnergy AS ApparentEnergy,
            @PowerFactor AS PowerFactor,
            @Frequency AS Frequency,
            @PB1 AS PB1,
            @PB2 AS PB2,
            @PB3 AS PB3,
            @PB4 AS PB4,
            @PB5 AS PB5,
            @PB6 AS PB6,
            @PB7 AS PB7,
            @PB8 AS PB8,
            @PB9 AS PB9,
            @PB10 AS PB10,
            @PB11 AS PB11,
            GETDATE() AS timestamp
    ) AS Source
    ON Target.switch_id = Source.switch_id
    WHEN MATCHED THEN
        UPDATE SET
            VL1 = Source.VL1,
            VL2 = Source.VL2,
            VL3 = Source.VL3,
            IL1 = Source.IL1,
            IL2 = Source.IL2,
            IL3 = Source.IL3,
            AvgVoltage = Source.AvgVoltage,
            AvgCurrent = Source.AvgCurrent,
            TotalActivePower = Source.TotalActivePower,
            ActivePower = Source.ActivePower,
            ReactivePower = Source.ReactivePower,
            ApparentPower = Source.ApparentPower,
            ActiveEnergy = Source.ActiveEnergy,
            ReactiveEnergy = Source.ReactiveEnergy,
            ApparentEnergy = Source.ApparentEnergy,
            PowerFactor = Source.PowerFactor,
            Frequency = Source.Frequency,
            PB1 = Source.PB1,
            PB2 = Source.PB2,
            PB3 = Source.PB3,
            PB4 = Source.PB4,
            PB5 = Source.PB5,
            PB6 = Source.PB6,
            PB7 = Source.PB7,
            PB8 = Source.PB8,
            PB9 = Source.PB9,
            PB10 = Source.PB10,
            PB11 = Source.PB11,
            timestamp = Source.timestamp
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (
            switch_id, VL1, VL2, VL3, IL1, IL2, IL3,
            AvgVoltage, AvgCurrent, TotalActivePower,
            ActivePower, ReactivePower, ApparentPower,
            ActiveEnergy, ReactiveEnergy, ApparentEnergy,
            PowerFactor, Frequency,
            PB1, PB2, PB3, PB4, PB5, PB6, PB7, PB8, PB9, PB10, PB11,
            timestamp
        )
        VALUES (
            Source.switch_id, Source.VL1, Source.VL2, Source.VL3,
            Source.IL1, Source.IL2, Source.IL3,
            Source.AvgVoltage, Source.AvgCurrent, Source.TotalActivePower,
            Source.ActivePower, Source.ReactivePower, Source.ApparentPower,
            Source.ActiveEnergy, Source.ReactiveEnergy, Source.ApparentEnergy,
            Source.PowerFactor, Source.Frequency,
            Source.PB1, Source.PB2, Source.PB3, Source.PB4, Source.PB5,
            Source.PB6, Source.PB7, Source.PB8, Source.PB9, Source.PB10, Source.PB11,
            Source.timestamp
        );
END
GO

-- =============================================
-- PROCEDURE: addBreakerData
-- Description: Wrapper procedure that calls UpdateLiveData
-- Dependencies: UpdateLiveData (must exist)
-- =============================================

CREATE PROCEDURE addBreakerData
    @switch_id INT,
    @VL1 FLOAT,
    @VL2 FLOAT,
    @VL3 FLOAT,
    @IL1 FLOAT,
    @IL2 FLOAT,
    @IL3 FLOAT,
    @AvgVoltage FLOAT,
    @AvgCurrent FLOAT,
    @TotalActivePower FLOAT,
    @ActivePower FLOAT,
    @ReactivePower FLOAT,
    @ApparentPower FLOAT,
    @ActiveEnergy FLOAT,
    @ReactiveEnergy FLOAT,
    @ApparentEnergy FLOAT,
    @PowerFactor FLOAT,
    @Frequency FLOAT,
    @PB1 BIT = NULL,
    @PB2 BIT = NULL,
    @PB3 BIT = NULL,
    @PB4 BIT = NULL,
    @PB5 BIT = NULL,
    @PB6 BIT = NULL,
    @PB7 BIT = NULL,
    @PB8 BIT = NULL,
    @PB9 BIT = NULL,
    @PB10 BIT = NULL,
    @PB11 BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    EXEC UpdateLiveData 
        @switch_id, @VL1, @VL2, @VL3, @IL1, @IL2, @IL3,
        @AvgVoltage, @AvgCurrent, @TotalActivePower,
        @ActivePower, @ReactivePower, @ApparentPower,
        @ActiveEnergy, @ReactiveEnergy, @ApparentEnergy,
        @PowerFactor, @Frequency,
        @PB1, @PB2, @PB3, @PB4, @PB5, @PB6, @PB7, @PB8, @PB9, @PB10, @PB11;
END
GO

-- =============================================
-- PROCEDURE: getAllSwitchesNames
-- Description: Returns all breaker names from MainData
-- Dependencies: MainData table
-- =============================================

CREATE PROCEDURE getAllSwitchesNames
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id, name, type, load
    FROM MainData
    ORDER BY id;
END
GO

-- =============================================
-- PROCEDURE: CheckUserExists
-- Description: Checks if a user exists by email
-- Dependencies: Users table
-- =============================================

CREATE PROCEDURE CheckUserExists
    @email VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM Users
    WHERE email = @email;
END
GO

-- =============================================
-- PROCEDURE: AddUser
-- Description: Inserts a new user into the Users table
-- Dependencies: Users table
-- =============================================

CREATE PROCEDURE AddUser
    @firstName VARCHAR(50),
    @lastName VARCHAR(50),
    @email VARCHAR(255),
    @userPassword VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Users (firstName, lastName, email, userPassword)
    VALUES (@firstName, @lastName, @email, @userPassword);
END
GO

-- =============================================
-- PROCEDURE: getLiveData
-- Description: Gets live data for a specific switch
-- Dependencies: Switches table
-- =============================================

CREATE PROCEDURE getLiveData
    @switch_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM Switches
    WHERE switch_id = @switch_id;
END
GO

-- =============================================
-- PROCEDURE: getAllSwitchesData
-- Description: Gets all switches data joined with MainData
-- Dependencies: MainData, Switches tables
-- =============================================

CREATE PROCEDURE getAllSwitchesData
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        s.rec_id,
        s.switch_id,
        m.name,
        m.type,
        m.load,
        s.VL1,
        s.VL2,
        s.VL3,
        s.IL1,
        s.IL2,
        s.IL3,
        s.AvgVoltage,
        s.AvgCurrent,
        s.TotalActivePower,
        s.ActivePower,
        s.ReactivePower,
        s.ApparentPower,
        s.ActiveEnergy,
        s.ReactiveEnergy,
        s.ApparentEnergy,
        s.PowerFactor,
        s.Frequency,
        s.PB1,
        s.PB2,
        s.PB3,
        s.PB4,
        s.PB5,
        s.PB6,
        s.PB7,
        s.PB8,
        s.PB9,
        s.PB10,
        s.PB11,
        s.timestamp
    FROM Switches s
    INNER JOIN MainData m ON s.switch_id = m.id;
END
GO

-- =============================================
-- PROCEDURE: AlertsData
-- Description: Returns all alerts ordered by timestamp descending
-- Dependencies: Alerts table
-- =============================================

CREATE PROCEDURE AlertsData
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        id, 
        alarmId, 
        alarmType AS alert_type, 
        alarmMessage AS alert_message, 
        timestamp, 
        alertAck
    FROM Alerts
    ORDER BY timestamp DESC;
END
GO

-- =============================================
-- PROCEDURE: getActiveEnergy
-- Description: Gets active energy data for a switch within a time range
-- Dependencies: MainData, Switches tables
-- =============================================

CREATE PROCEDURE getActiveEnergy
    @switch_id INT,
    @startTime DATETIME,
    @endTime DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        m.id,
        m.name,
        s.ActiveEnergy,
        FORMAT(s.timestamp, 'yyyy-MM-dd HH:mm') AS timestamp
    FROM Switches s
    INNER JOIN MainData m ON s.switch_id = m.id
    WHERE s.switch_id = @switch_id
        AND s.timestamp BETWEEN @startTime AND @endTime
    ORDER BY s.timestamp;
END
GO

-- =============================================
-- PROCEDURE: GetDailySample
-- Description: Returns last 10 days of ActivePower samples (latest per day)
-- Dependencies: Switches table
-- =============================================

CREATE PROCEDURE GetDailySample
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
GO

-- =============================================
-- PROCEDURE: GetDailySampleActiveEnergy
-- Description: Returns last 10 days of ActiveEnergy samples (latest per day)
-- Dependencies: Switches table
-- =============================================

CREATE PROCEDURE GetDailySampleActiveEnergy
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
END
GO

-- =============================================
-- PROCEDURE: GetLast2DaysActivePower
-- Description: Gets ActivePower records from last 2 days at current hour
-- Dependencies: Switches table
-- =============================================

CREATE PROCEDURE GetLast2DaysActivePower
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
END
GO

-- =============================================
-- PROCEDURE: AddProtectionAlert
-- Description: Logs protection alerts (avoiding duplicates)
-- Dependencies: Alerts table
-- =============================================

CREATE PROCEDURE AddProtectionAlert
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
        AND alarmType = @alert_type 
        AND alertAck = 0
    )
    BEGIN
        -- Insert new alert
        INSERT INTO Alerts (alarmId, alarmType, alarmMessage, alertAck, timestamp)
        VALUES (@switch_id, @alert_type, @alert_message, 0, GETDATE());
    END
END
GO

-- =============================================
-- PROCEDURE: AddAckAlert
-- Description: Adds acknowledgment record with user and timestamp
-- Dependencies: AckAlert table
-- =============================================

CREATE PROCEDURE AddAckAlert
    @ackId INT,
    @ackBy VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AckAlert (ackId, user_id, timestamp)
    VALUES (@ackId, @ackBy, GETDATE());
END
GO

-- =============================================
-- Script completed successfully
-- Total procedures created: 14
-- =============================================

PRINT 'All stored procedures created successfully!';
GO
