-- Stored Procedure: AddProtectionAlert
-- Purpose: Log protection alerts to Alerts table, avoiding duplicates

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
END;
GO
