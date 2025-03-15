import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { Company, CompanyResponse } from '../../../types/company';
import { ObjectId, WithId, Collection } from 'mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse<CompanyResponse>) => {
  try {
    const client = await clientPromise;
    const db = client.db('fleet-management');
    const collection: Collection<Company> = db.collection('company');

    switch (req.method) {
      case 'GET':
        const company = await collection.findOne<WithId<Company>>({});
        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'Company information not found'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Company information retrieved successfully',
          data: {
            ...company,
            _id: company._id.toString()
          }
        });

      case 'POST':
      case 'PUT':
        const { name, licenseNumber, address, logo, renewalDate, email, phone, website } = req.body;

        // Validate required fields
        if (!name || !licenseNumber || !address || !renewalDate) {
          return res.status(400).json({
            success: false,
            message: 'Required fields are missing',
            error: 'Please provide all required fields: name, licenseNumber, address, and renewalDate'
          });
        }

        // Validate image size if logo is provided
        if (logo) {
          const base64Size = Buffer.from(logo.split(',')[1], 'base64').length;
          if (base64Size > 5 * 1024 * 1024) { // 5MB limit
            return res.status(400).json({
              success: false,
              message: 'Logo size exceeds limit',
              error: 'Logo size should not exceed 5MB'
            });
          }
        }

        const existingCompany = await collection.findOne<WithId<Company>>({});
        if (existingCompany) {
          // Update existing company info
          const updatedDoc: Partial<Company> = {
            name,
            licenseNumber,
            address,
            logo,
            renewalDate,
            email,
            phone,
            website,
            updatedAt: new Date().toISOString()
          };

          const result = await collection.findOneAndUpdate(
            { _id: existingCompany._id },
            { $set: updatedDoc },
            { returnDocument: 'after' }
          );

          if (!result) {
            return res.status(404).json({
              success: false,
              message: 'Company not found',
              error: 'Unable to update company information'
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Company information updated successfully',
            data: {
              ...result,
              _id: result._id.toString()
            }
          });
        } else {
          // Create new company info
          const newCompany: Omit<Company, '_id'> = {
            name,
            licenseNumber,
            address,
            logo,
            renewalDate,
            email,
            phone,
            website,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const result = await collection.insertOne(newCompany);
          return res.status(201).json({
            success: true,
            message: 'Company information created successfully',
            data: {
              ...newCompany,
              _id: result.insertedId.toString()
            }
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Error in company API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

export default handler;

// Configure body parser for handling large payloads (for logo uploads)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 