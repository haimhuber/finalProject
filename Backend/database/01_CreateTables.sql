-- ===================================================================
-- Database Setup Script - Create All Tables
-- ===================================================================
-- Description: Creates all required tables for the DigitalPanel system
-- Author: Auto-generated
-- Date: 2025-12-07
-- Database: DigitalPanel
-- ===================================================================

USE DigitalPanel;
GO

-- ===================================================================
-- Drop existing tables (in correct order to avoid FK constraints)
-- ===================================================================
IF OBJECT_ID('dbo.Switches', 'U') IS NOT NULL DROP TABLE dbo.Switches;
IF OBJECT_ID('dbo.LiveData', 'U') IS NOT NULL DROP TABLE dbo.LiveData;
IF OBJECT_ID('dbo.Alerts', 'U') IS NOT NULL DROP TABLE dbo.Alerts;
IF OBJECT_ID('dbo.AckAlert', 'U') IS NOT NULL DROP TABLE dbo.AckAlert;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID('dbo.UserAuditTrail', 'U') IS NOT NULL DROP TABLE dbo.UserAuditTrail;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.TariffRates', 'U') IS NOT NULL DROP TABLE dbo.TariffRates;
IF OBJECT_ID('dbo.MainData', 'U') IS NOT NULL DROP TABLE dbo.MainData;
GO

-- ===================================================================
-- Table 1: MainData
-- Description: Main breaker configuration and metadata
-- ===================================================================
CREATE TABLE MainData (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    load VARCHAR(50) NOT NULL
);
GO

-- ===================================================================
-- Table 2: Users
-- Description: User accounts for authentication
-- ===================================================================
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);
GO

-- ===================================================================
-- Table 3: TariffRates
-- Description: Electricity tariff rates configuration
-- ===================================================================
CREATE TABLE TariffRates (
    id INT PRIMARY KEY IDENTITY(1,1),
    season VARCHAR(20) NOT NULL,
    hour_type VARCHAR(20) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    start_hour INT NOT NULL,
    end_hour INT NOT NULL
);
GO

-- ===================================================================
-- Table 4: LiveData
-- Description: Real-time breaker data
-- ===================================================================
CREATE TABLE LiveData (
    id INT PRIMARY KEY IDENTITY(1,1),
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

-- ===================================================================
-- Table 5: Switches
-- Description: Historical breaker data archive
-- ===================================================================
CREATE TABLE Switches (
    rec_id INT PRIMARY KEY IDENTITY(1,1),
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

-- ===================================================================
-- Table 6: Alerts
-- Description: System alerts and alarms
-- ===================================================================
CREATE TABLE Alerts (
    id INT PRIMARY KEY IDENTITY(1,1),
    alarmId INT NOT NULL,
    alarmType VARCHAR(100),
    alarmMessage VARCHAR(255),
    alertAck BIT DEFAULT 0,
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (alarmId) REFERENCES MainData(id)
);
GO

-- ===================================================================
-- Table 7: AckAlert
-- Description: Acknowledged alerts tracking
-- ===================================================================
CREATE TABLE AckAlert (
    id INT PRIMARY KEY IDENTITY(1,1),
    ackId INT NOT NULL,
    user_id VARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE()
);
GO

-- ===================================================================
-- Table 8: Events
-- Description: System events log
-- ===================================================================
CREATE TABLE Events (
    id INT PRIMARY KEY IDENTITY(1,1),
    event_type VARCHAR(50) NOT NULL,
    event_description VARCHAR(255),
    switch_id INT,
    timestamp DATETIME DEFAULT GETDATE()
);
GO

-- ===================================================================
-- Table 9: UserAuditTrail
-- Description: User activity audit trail
-- ===================================================================
CREATE TABLE UserAuditTrail (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details VARCHAR(255),
    timestamp DATETIME DEFAULT GETDATE()
);
GO

PRINT 'All tables created successfully!';
GO
