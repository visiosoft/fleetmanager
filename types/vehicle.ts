export interface Vehicle {
  _id: string;
  type: 'Truck' | 'Bus' | 'Van';
  make: string;
  model: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive';
  mileage: number;
  registrationDate: string;
  purchaseDate: string;
  licenseExpiryDate: string;
  licensePlate: string;
  image?: string;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
} 