export interface AlertInterface {
  id: number;
  alarmId: number;
  alert_type: string;
  alert_message: string;
  timestamp: string;
  alertAck : number;
  ackBy: string;
}