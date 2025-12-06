export type Vertical = {
  id: string
  name: string
  route: string
}

export const VERTICALS: Vertical[] = [
  { id: 'travel_agent', name: 'Travel Agent', route: '/(verticals)/travel-agent' },
  { id: 'freelancer', name: 'Freelancer', route: '/(verticals)/freelancer' },
  { id: 'service_provider', name: 'Service Provider', route: '/(verticals)/service-provider' },
  { id: 'admin', name: 'Admin', route: '/(verticals)/admin' }
]

export function findVerticalById(id: string) {
  return VERTICALS.find(v => v.id === id) || null
}