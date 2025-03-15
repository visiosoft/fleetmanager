import { ObjectId } from 'mongodb';

export interface Company {
  _id?: ObjectId;
  name: string;
  licenseNumber: string;
  address: string;
  logo?: string;
  renewalDate: string;
  email?: string;
  phone?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyFormData = Omit<Company, '_id' | 'createdAt' | 'updatedAt'>;

export interface CompanyResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    licenseNumber: string;
    address: string;
    logo?: string;
    renewalDate: string;
    email?: string;
    phone?: string;
    website?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
} 