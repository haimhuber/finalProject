CREATE TABLE Switches(
id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
name VARCHAR(50) NOT NULL,
type VARCHAR(50));

CREATE TABLE Q1 (
id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
switch_id INT,
V12 Float Not Null,
V23 Float Not Null,
V31 Float Not Null,
I1 Float Not Null,
I2 Float Not Null,
I3 Float Not Null,
Frequency Float Not Null,
PowerFactor Float Not Null,
ActivePower Float Not Null,
ReactivePower Float Not Null,
ApparentPower Float Not Null,
NominalCurrent Float Not Null,
ActiveEnergy Float Not Null,
FOREIGN KEY (switch_id) REFERENCES Switches(id) ON DELETE CASCADE);



CREATE TABLE Alerts (
id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
switch_id INT,
alert_type VARCHAR(50),
alert_message VARCHAR(255),
timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (switch_id) REFERENCES Switches(id) ON DELETE CASCADE);