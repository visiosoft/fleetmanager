import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('fleet-management');
    const collection = db.collection('drivers');
    const { id } = req.query;

    if (!ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid driver ID' });
    }

    const _id = new ObjectId(id as string);

    switch (req.method) {
      case 'GET':
        const driver = await collection.findOne({ _id });
        if (!driver) {
          return res.status(404).json({ error: 'Driver not found' });
        }
        // Transform ObjectId to string for JSON response
        return res.status(200).json({
          ...driver,
          _id: driver._id.toString()
        });

      case 'PUT':
        const updateData = {
          ...req.body,
          updatedAt: new Date().toISOString()
        };

        // Validate image size if present
        if (updateData.image) {
          const base64Size = Buffer.from(updateData.image.split(',')[1], 'base64').length;
          if (base64Size > 5 * 1024 * 1024) { // 5MB limit
            return res.status(400).json({ error: 'Image size must be less than 5MB' });
          }
        }

        const updateResult = await collection.findOneAndUpdate(
          { _id },
          { $set: updateData },
          { returnDocument: 'after' }
        );

        if (!updateResult.value) {
          return res.status(404).json({ error: 'Driver not found' });
        }

        return res.status(200).json({
          ...updateResult.value,
          _id: updateResult.value._id.toString()
        });

      case 'DELETE':
        const deleteResult = await collection.deleteOne({ _id });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Driver not found' });
        }

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in driver API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 