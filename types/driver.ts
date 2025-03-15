import { ObjectId } from 'mongodb';

export interface Driver {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  phone: string;
  email: string;
  address: string;
  image?: string;
  status: 'active' | 'inactive' | 'on_leave';
  emergencyContact: string;
  emergencyPhone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    licenseNumber: string;
    phone: string;
    email: string;
    address: string;
    image?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
} 