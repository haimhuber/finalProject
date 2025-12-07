DROP PROCEDURE IF EXISTS GetConsumptionWithBilling;
GO

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
                WHEN month_num IN (12, 1, 2) THEN 'חורף'
                WHEN month_num IN (3, 4, 5) THEN 'אביב'
                WHEN month_num IN (6, 7, 8, 9) THEN 'קיץ'
                ELSE 'סתיו'
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
END
GO