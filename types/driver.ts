export interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  emergencyContact: string;
  emergencyPhone: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
} 