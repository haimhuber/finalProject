-- =====================================================
-- Digital Panel - Complete Database Setup Script
-- =====================================================
-- Run this script in SSMS to create all tables and stored procedures
-- Database: DigitalPanel
-- =====================================================

USE DigitalPanel;
GO

-- =====================================================
-- PART 1: DROP EXISTING OBJECTS (if needed)
-- =====================================================

-- Drop stored procedures first
DROP PROCEDURE IF EXISTS addBreakerData;
DROP PROCEDURE IF EXISTS getActiveEnergy;
DROP PROCEDURE IF EXISTS getAllSwitchesData;
DROP PROCEDURE IF EXISTS getLiveData;
DROP PROCEDURE IF EXISTS GetDailySample;
DROP PROCEDURE IF EXISTS GetDailySampleActiveEnergy;
DROP PROCEDURE IF EXISTS GetLast2DaysActivePower;
DROP PROCEDURE IF EXISTS AddUser;
DROP PROCEDURE IF EXISTS CheckUserExists;
DROP PROCEDURE IF EXISTS AlertsData;
DROP PROCEDURE IF EXISTS UpdateAlertAck;
DROP PROCEDURE IF EXISTS AddAckAlert;
DROP PROCEDURE IF EXISTS ReadAllAckData;
DROP PROCEDURE IF EXISTS GetLatestSwitches;
DROP PROCEDURE IF EXISTS AddUserAudit;
DROP PROCEDURE IF EXISTS ReadAllAuditTrail;
DROP PROCEDURE IF EXISTS GetAllDailySamples;
DROP PROCEDURE IF EXISTS GetAllDailySamplesActiveEnergy;
DROP PROCEDURE IF EXISTS GetDailyConsumption;
DROP PROCEDURE IF EXISTS GetMonthlyConsumption;
DROP PROCEDURE IF EXISTS GetConsumptionSummary;
DROP PROCEDURE IF EXISTS GetConsumptionWithBilling;
DROP PROCEDURE IF EXISTS CheckDataExists;
DROP PROCEDURE IF EXISTS getAllSwitchesNames;
DROP PROCEDURE IF EXISTS ReportPowerData;
DROP PROCEDURE IF EXISTS UpdateLiveData;
DROP PROCEDURE IF EXISTS GetLiveDataOnly;
DROP PROCEDURE IF EXISTS GetHourlySamples;
DROP PROCEDURE IF EXISTS GetDailySamples;
DROP PROCEDURE IF EXISTS GetWeeklySamples;
DROP PROCEDURE IF EXISTS DeleteUser;
DROP PROCEDURE IF EXISTS UpdateUserPassword;
DROP PROCEDURE IF EXISTS GetTariffRates;
DROP PROCEDURE IF EXISTS UpdateTariffRate;
DROP PROCEDURE IF EXISTS UpdateTariffRatesOnly;
DROP PROCEDURE IF EXISTS UpdateEfficiencySettings;
DROP PROCEDURE IF EXISTS AddProtectionAlert;
GO

-- Drop tables in correct order (children first)
DROP TABLE IF EXISTS AckAlert;
DROP TABLE IF EXISTS Alerts;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS UserAuditTrail;
DROP TABLE IF EXISTS Switches;
DROP TABLE IF EXISTS LiveData;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS TariffRates;
DROP TABLE IF EXISTS MainData;
GO

-- =====================================================
-- PART 2: CREATE TABLES
-- =====================================================

-- Main breakers reference table
CREATE TABLE MainData (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    load VARCHAR(50) NOT NULL
);
GO

-- Live data table (latest values for each breaker)
CREATE TABLE LiveData (
    switch_id INT PRIMARY KEY,
    V12 FLOAT,
    V23 FLOAT,
    V31 FLOAT,
    I1 FLOAT,
    I2 FLOAT,
    I3 FLOAT,
    Frequency FLOAT,
    PowerFactor FLOAT,
    ActivePower FLOAT,
    ReactivePower FLOAT,
    ApparentPower FLOAT,
    NominalCurrent FLOAT,
    ActiveEnergy FLOAT,
    CommStatus BIT,
    ProtectionTrip BIT,
    ProtectionInstTrip BIT,
    ProtectionI_Enabled BIT,
    ProtectionS_Enabled BIT,
    ProtectionL_Enabled BIT,
    ProtectionG_Trip BIT,
    ProtectionI_Trip BIT,
    ProtectionS_Trip BIT,
    ProtectionL_Trip BIT,
    TripDisconnected BIT,
    Tripped BIT,
    Undefined BIT,
    BreakerClose BIT,
    BreakerOpen BIT,
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (switch_id) REFERENCES MainData(id)
);
GO

-- Historical data table
CREATE TABLE Switches (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    switch_id INT NOT NULL,
    V12 FLOAT,
    V23 FLOAT,
    V31 FLOAT,
    I1 FLOAT,
    I2 FLOAT,
    I3 FLOAT,
    Frequency FLOAT,
    PowerFactor FLOAT,
    ActivePower FLOAT,
    ReactivePower FLOAT,
    ApparentPower FLOAT,
    NominalCurrent FLOAT,
    ActiveEnergy FLOAT,
    CommStatus BIT,
    ProtectionTrip BIT,
    ProtectionInstTrip BIT,
    ProtectionI_Enabled BIT,
    ProtectionS_Enabled BIT,
    ProtectionL_Enabled BIT,
    ProtectionG_Trip BIT,
    ProtectionI_Trip BIT,
    ProtectionS_Trip BIT,
    ProtectionL_Trip BIT,
    TripDisconnected BIT,
    Tripped BIT,
    Undefined BIT,
    BreakerClose BIT,
    BreakerOpen BIT,
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (switch_id) REFERENCES MainData(id)
);
GO

-- Alerts table
CREATE TABLE Alerts (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    alarmId INT NOT NULL,
    alarmType VARCHAR(50),
    alarmMessage VARCHAR(255),
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (alarmId) REFERENCES MainData(id)
);
GO

-- Acknowledged alerts table
CREATE TABLE AckAlert (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ackId INT NOT NULL,
    ackBy VARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ackId) REFERENCES Alerts(id)
);
GO

-- Events log table
CREATE TABLE Events (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    eventId INT NOT NULL,
    eventType VARCHAR(50),
    eventMessage VARCHAR(255),
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (eventId) REFERENCES MainData(id)
);
GO

-- Users table
CREATE TABLE Users (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);
GO

-- User audit trail table
CREATE TABLE UserAuditTrail (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    type VARCHAR(20),
    timestamp DATETIME DEFAULT GETDATE()
);
GO

-- Tariff rates table
CREATE TABLE TariffRates (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    season VARCHAR(20) NOT NULL,
    peakRate DECIMAL(10,4) NOT NULL,
    offPeakRate DECIMAL(10,4) NOT NULL,
    peakHours VARCHAR(50),
    weekdaysOnly BIT DEFAULT 0,
    efficiencyBase DECIMAL(10,2) DEFAULT 80.0,
    efficiencyMultiplier DECIMAL(10,2) DEFAULT 1.0,
    isActive BIT DEFAULT 1,
    createdBy VARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE()
);
GO

PRINT '✅ All tables created successfully';
GO

-- =====================================================
-- PART 3: INSERT INITIAL DATA
-- =====================================================

-- Insert 21 breakers from config.json
INSERT INTO MainData (name, type, load) VALUES ('Q0', 'EMAX E1.2', 'Main');
INSERT INTO MainData (name, type, load) VALUES ('Q2', 'XT4 160', 'Lighting');
INSERT INTO MainData (name, type, load) VALUES ('Q3', 'XT4 160', 'Sockets');
INSERT INTO MainData (name, type, load) VALUES ('Q4', 'XT4 160', 'AC');
INSERT INTO MainData (name, type, load) VALUES ('Q7', 'XT2 160', 'Kitchen');
INSERT INTO MainData (name, type, load) VALUES ('Q6', 'XT4 160', 'Bathroom');
INSERT INTO MainData (name, type, load) VALUES ('Q5', 'XT4 160', 'Bedroom');
INSERT INTO MainData (name, type, load) VALUES ('Q8', 'XT4 160', 'Office');
INSERT INTO MainData (name, type, load) VALUES ('Q8.1', 'XT4 160', 'Sub1');
INSERT INTO MainData (name, type, load) VALUES ('Q8.2', 'XT4 160', 'Sub2');
INSERT INTO MainData (name, type, load) VALUES ('Q8.3', 'XT4 160', 'Sub3');
INSERT INTO MainData (name, type, load) VALUES ('Q8.15', 'XT4 160', 'Sub15');
INSERT INTO MainData (name, type, load) VALUES ('Q9', 'XT4 160', 'Floor1');
INSERT INTO MainData (name, type, load) VALUES ('Q9.1', 'XT4 160', 'Floor1-1');
INSERT INTO MainData (name, type, load) VALUES ('Q9.2', 'XT4 160', 'Floor1-2');
INSERT INTO MainData (name, type, load) VALUES ('Q9.3', 'XT4 160', 'Floor1-3');
INSERT INTO MainData (name, type, load) VALUES ('Q9.4', 'XT4 160', 'Floor1-4');
INSERT INTO MainData (name, type, load) VALUES ('Q10', 'XT4 160', 'Reserve1');
INSERT INTO MainData (name, type, load) VALUES ('Q11', 'XT4 160', 'Reserve2');
INSERT INTO MainData (name, type, load) VALUES ('Q12', 'XT4 160', 'Reserve3');
INSERT INTO MainData (name, type, load) VALUES ('Q13', 'XT4 160', 'Reserve4');
GO

-- Insert default tariff rates (Israel Electric Company - 2024)
INSERT INTO TariffRates (season, peakRate, offPeakRate, peakHours, weekdaysOnly, isActive, createdBy)
VALUES ('Winter', 1.2071, 0.4557, '17:00-22:00', 0, 1, 'System');

INSERT INTO TariffRates (season, peakRate, offPeakRate, peakHours, weekdaysOnly, isActive, createdBy)
VALUES ('Summer', 1.6895, 0.5283, '17:00-23:00', 1, 1, 'System');

INSERT INTO TariffRates (season, peakRate, offPeakRate, peakHours, weekdaysOnly, isActive, createdBy)
VALUES ('Spring', 0.4977, 0.4460, '07:00-17:00', 1, 1, 'System');

INSERT INTO TariffRates (season, peakRate, offPeakRate, peakHours, weekdaysOnly, isActive, createdBy)
VALUES ('Autumn', 0.4977, 0.4460, '07:00-17:00', 1, 1, 'System');
GO

PRINT '✅ Initial data inserted successfully';
PRINT '   - 21 breakers added to MainData';
PRINT '   - 4 seasonal tariff rates added';
GO

-- =====================================================
-- PART 4: CREATE STORED PROCEDURES
-- =====================================================

-- 1. addBreakerData - Insert historical data
CREATE PROCEDURE addBreakerData
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
    
    EXEC UpdateLiveData @switch_id, @V12, @V23, @V31, @I1, @I2, @I3, @Frequency, @PowerFactor, @ActivePower,
                       @ReactivePower, @ApparentPower, @NominalCurrent, @ActiveEnergy, @CommStatus,
                       @ProtectionTrip, @ProtectionInstTrip, @ProtectionI_Enabled, @ProtectionS_Enabled, @ProtectionL_Enabled,
                       @ProtectionG_Trip, @ProtectionI_Trip, @ProtectionS_Trip, @ProtectionL_Trip,
                       @TripDisconnected, @Tripped, @Undefined, @BreakerClose, @BreakerOpen;
END
GO

-- 2. UpdateLiveData - Update or insert live data (MERGE)
CREATE PROCEDURE UpdateLiveData
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
END
GO

-- 3. getLiveData - Get all live data
CREATE PROCEDURE getLiveData
    @liveData INT
AS
BEGIN
    SELECT * FROM LiveData ORDER BY switch_id ASC;
END
GO

-- 4. getAllSwitchesNames - Get all breaker names
CREATE PROCEDURE getAllSwitchesNames
AS
BEGIN
    SELECT id, name, type, load FROM MainData ORDER BY id;
END
GO

-- 5. getActiveEnergy - Get energy consumption for date range
CREATE PROCEDURE getActiveEnergy
    @switch_id INT,
    @startTime DATETIME,
    @endTime DATETIME
AS
BEGIN
    SELECT 
        M.name,
        S.ActiveEnergy,
        FORMAT(S.timestamp, 'yyyy-MM-dd HH:mm') AS DateTimeHHMM
    FROM MainData AS M
    INNER JOIN Switches AS S ON M.id = S.switch_id
    WHERE S.switch_id = @switch_id
      AND S.timestamp BETWEEN @startTime AND @endTime
    ORDER BY S.timestamp;
END
GO

-- 6. GetDailySample - Get daily power samples (last 10 days)
CREATE PROCEDURE GetDailySample
    @switch_id INT
AS
BEGIN
    SET NOCOUNT ON;
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
    ORDER BY day_slot ASC;
END
GO

-- 7. GetDailySampleActiveEnergy - Get daily energy samples
CREATE PROCEDURE GetDailySampleActiveEnergy
    @switch_id INT
AS
BEGIN
    SET NOCOUNT ON;
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
    ORDER BY day_slot ASC;
END
GO

-- 8. AddUser - Create new user
CREATE PROCEDURE AddUser
    @userName VARCHAR(20),
    @userPassword VARCHAR(255),
    @userEmail VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Users WHERE username = @userName)
    BEGIN
        SELECT 0 AS success, 'Username already exists' AS message;
        RETURN;
    END;
    
    INSERT INTO Users (username, password, email)
    VALUES (@userName, @userPassword, @userEmail);
    
    SELECT 1 AS success, 'User created successfully' AS message, SCOPE_IDENTITY() AS insertedId;
END
GO

-- 9. CheckUserExists - Verify user credentials
CREATE PROCEDURE CheckUserExists
    @userName VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT password, email FROM Users WHERE username = @userName;
END
GO

-- 10. AlertsData - Get all alerts
CREATE PROCEDURE AlertsData
AS
BEGIN
    SELECT * FROM Alerts ORDER BY timestamp DESC;
END
GO

-- 11. AddProtectionAlert - Log protection alerts
CREATE PROCEDURE AddProtectionAlert
    @switch_id INT,
    @alert_type VARCHAR(50),
    @alert_message VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Alerts (alarmId, alarmType, alarmMessage, timestamp)
    VALUES (@switch_id, @alert_type, @alert_message, GETDATE());
END
GO

-- 12. GetConsumptionWithBilling - Calculate consumption with seasonal billing
CREATE PROCEDURE GetConsumptionWithBilling
    @switch_id INT,
    @start_date DATE,
    @end_date DATE
AS
BEGIN
    SET NOCOUNT ON;
    
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
    HourlyClassified AS (
        SELECT 
            consumption_date,
            month_num,
            hour_start_energy,
            hour_end_energy,
            CASE 
                WHEN month_num IN (12, 1, 2) THEN
                    CASE WHEN hour_of_day >= 17 AND hour_of_day < 22 THEN 'peak' ELSE 'off-peak' END
                WHEN month_num IN (6, 7, 8, 9) THEN
                    CASE WHEN day_of_week BETWEEN 2 AND 6 AND hour_of_day >= 17 AND hour_of_day < 23 THEN 'peak' ELSE 'off-peak' END
                ELSE
                    CASE WHEN day_of_week BETWEEN 2 AND 6 AND hour_of_day >= 7 AND hour_of_day < 17 THEN 'peak' ELSE 'off-peak' END
            END as time_category
        FROM HourlyConsumption
    ),
    HourlyWithConsumption AS (
        SELECT 
            consumption_date,
            month_num,
            time_category,
            CASE WHEN hour_end_energy >= hour_start_energy THEN hour_end_energy - hour_start_energy ELSE 0 END as hourly_consumption
        FROM HourlyClassified
    ),
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
    ProportionalSplit AS (
        SELECT 
            consumption_date,
            month_num,
            daily_consumption,
            CASE WHEN total_hourly_sum > 0 THEN daily_consumption * (peak_hourly_sum / total_hourly_sum) ELSE 0 END as peak_consumption,
            CASE WHEN total_hourly_sum > 0 THEN daily_consumption * (offpeak_hourly_sum / total_hourly_sum) ELSE daily_consumption END as offpeak_consumption
        FROM DailyBreakdown
    ),
    WithCosts AS (
        SELECT *,
            CASE 
                WHEN month_num IN (12, 1, 2) THEN 'Winter'
                WHEN month_num IN (3, 4, 5) THEN 'Spring'
                WHEN month_num IN (6, 7, 8, 9) THEN 'Summer'
                ELSE 'Autumn'
            END as season,
            CASE 
                WHEN month_num IN (12, 1, 2) THEN peak_consumption * 1.2071 + offpeak_consumption * 0.4557
                WHEN month_num IN (6, 7, 8, 9) THEN peak_consumption * 1.6895 + offpeak_consumption * 0.5283
                ELSE peak_consumption * 0.4977 + offpeak_consumption * 0.4460
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
END
GO

-- 13. CheckDataExists - Verify data availability
CREATE PROCEDURE CheckDataExists
    @switch_id INT,
    @start_date DATE,
    @end_date DATE
AS
BEGIN
    SELECT 
        COUNT(*) as record_count,
        MIN(timestamp) as earliest_record,
        MAX(timestamp) as latest_record,
        CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END as data_exists
    FROM Switches 
    WHERE switch_id = @switch_id 
      AND CAST(timestamp AS DATE) BETWEEN @start_date AND @end_date;
END
GO

-- 14. ReportPowerData - Get power data for reporting
CREATE PROCEDURE ReportPowerData
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
END
GO

-- 15. AddUserAudit - Log user actions
CREATE PROCEDURE AddUserAudit
    @userName VARCHAR(20),
    @type VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO UserAuditTrail (username, type)
    VALUES (@userName, @type);
    
    SELECT 1 AS success, 'Audit entry recorded successfully' AS message, SCOPE_IDENTITY() AS insertedId;
END
GO

-- 16. ReadAllAuditTrail - Get audit log
CREATE PROCEDURE ReadAllAuditTrail
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM UserAuditTrail ORDER BY timestamp DESC;
END
GO

-- 17. GetTariffRates - Get active tariff rates
CREATE PROCEDURE GetTariffRates
AS
BEGIN
    SELECT * FROM TariffRates WHERE isActive = 1 ORDER BY season;
END
GO

-- 18. UpdateTariffRatesOnly - Update tariff rates
CREATE PROCEDURE UpdateTariffRatesOnly
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
END
GO

PRINT '✅ All 18 main stored procedures created successfully';
GO

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

PRINT '';
PRINT '========================================';
PRINT 'DATABASE SETUP COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'Verification:';

SELECT 'Tables Created' AS Status, COUNT(*) AS Count
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_NAME IN ('MainData', 'LiveData', 'Switches', 'Alerts', 'AckAlert', 'Events', 'Users', 'UserAuditTrail', 'TariffRates');

SELECT 'Breakers Inserted' AS Status, COUNT(*) AS Count FROM MainData;

SELECT 'Stored Procedures' AS Status, COUNT(*) AS Count
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
  AND ROUTINE_NAME IN ('UpdateLiveData', 'addBreakerData', 'getLiveData', 'getAllSwitchesNames');

PRINT '';
PRINT '✅ Ready to run: node app.js';
PRINT '';
GO
