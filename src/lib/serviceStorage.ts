export interface Service {
  id: string;
  name: string;
  url: string;
  sandboxPolicies?: string[];
}

const STORAGE_KEY = 'hubui-services';

export function getServices(): Service[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addService(service: Omit<Service, 'id'>): Service {
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
  };
  
  const services = getServices();
  const updatedServices = [...services, newService];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('servicesUpdated'));
  }
  
  return newService;
}

export function removeService(id: string): void {
  const services = getServices();
  const updatedServices = services.filter(service => service.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('servicesUpdated'));
  }
}

export function removeServices(ids: string[]): void {
  const services = getServices();
  const updatedServices = services.filter(service => !ids.includes(service.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('servicesUpdated'));
  }
}

export function updateServiceSandboxPolicies(id: string, sandboxPolicies: string[]): void {
  const services = getServices();
  const updatedServices = services.map(service => 
    service.id === id ? { ...service, sandboxPolicies } : service
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('servicesUpdated'));
  }
}

export function getServiceSandboxPolicies(id: string): string[] {
  const services = getServices();
  const service = services.find(s => s.id === id);
  return service?.sandboxPolicies || ['allow-scripts', 'allow-forms'];
}

export function updateService(id: string, updates: Partial<Omit<Service, 'id'>>): void {
  const services = getServices();
  const updatedServices = services.map(service => 
    service.id === id ? { ...service, ...updates } : service
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('servicesUpdated'));
  }
}
