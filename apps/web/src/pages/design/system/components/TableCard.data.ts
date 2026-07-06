export interface ServiceRow {
  service: string
  region: string
  status: 'healthy' | 'degraded'
  latency: number
}

export const SERVICES: ServiceRow[] = [
  { service: 'web', region: 'fra1', status: 'healthy', latency: 42 },
  { service: 'api', region: 'fra1', status: 'healthy', latency: 87 },
  { service: 'worker', region: 'iad1', status: 'degraded', latency: 213 },
  { service: 'cron', region: 'iad1', status: 'healthy', latency: 55 },
  { service: 'edge', region: 'sin1', status: 'healthy', latency: 12 },
  { service: 'db-proxy', region: 'fra1', status: 'healthy', latency: 31 },
  { service: 'queue', region: 'sfo1', status: 'degraded', latency: 158 },
  { service: 'auth', region: 'fra1', status: 'healthy', latency: 64 },
  { service: 'cdn', region: 'global', status: 'healthy', latency: 8 },
  { service: 'search', region: 'iad1', status: 'healthy', latency: 96 },
  { service: 'mailer', region: 'sfo1', status: 'healthy', latency: 120 },
  { service: 'metrics', region: 'sin1', status: 'degraded', latency: 176 },
]
