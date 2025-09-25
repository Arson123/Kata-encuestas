// prom-client /metrics
import client from 'prom-client';
export const collectDefaultMetrics = client.collectDefaultMetrics;
export const register = client.register;