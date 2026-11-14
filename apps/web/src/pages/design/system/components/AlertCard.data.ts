interface AlertSample {
  severity: 'success' | 'info' | 'warning' | 'error'
  title?: string
  message: string
}

export const ALERTS: AlertSample[] = [
  { severity: 'success', title: 'DEPLOYED', message: 'Build 2.1.0 is live on the edge.' },
  { severity: 'info', message: 'A new design-system release is available.' },
  { severity: 'warning', message: 'The API quota is at 80% for this hour.' },
  { severity: 'error', message: 'The worker failed its health check.' },
]
