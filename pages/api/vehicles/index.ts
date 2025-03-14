import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Increase size limit for base64 images
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('fleet-management');
  const collection = db.collection('vehicles');

  switch (req.method) {
    case 'GET':
      try {
        const vehicles = await collection.find({}).toArray();
        // Transform ObjectId to string for JSON response
        const transformedVehicles = vehicles.map(vehicle => ({
          ...vehicle,
          _id: vehicle._id.toString()
        }));
        res.status(200).json(transformedVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
      }
      break;

    case 'POST':
      try {
        const vehicleData = req.body;
        
        // Validate image size if present
        if (vehicleData.image) {
          const base64Size = Buffer.from(vehicleData.image.split(',')[1], 'base64').length;
          if (base64Size > 5 * 1024 * 1024) { // 5MB limit
            return res.status(400).json({ error: 'Image size must be less than 5MB' });
          }
        }
        
        // Remove any _id field if present
        delete vehicleData._id;
        
        // Add timestamps
        const now = new Date();
        const vehicleToInsert = {
          ...vehicleData,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        const result = await collection.insertOne(vehicleToInsert);
        res.status(201).json({ 
          ...vehicleToInsert, 
          _id: result.insertedId.toString() 
        });
      } catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: 'Failed to create vehicle' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 