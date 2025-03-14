import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('fleet-management');
  const collection = db.collection('vehicles');
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const vehicle = req.body;
        const result = await collection.updateOne(
          { _id: new ObjectId(id as string) },
          { $set: vehicle }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json({ ...vehicle, _id: id });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update vehicle' });
      }
      break;

    case 'DELETE':
      try {
        const result = await collection.deleteOne({ _id: new ObjectId(id as string) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete vehicle' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 