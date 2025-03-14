import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("fleet");
    const collection = db.collection("drivers");

    switch (req.method) {
      case 'GET':
        const { status, search } = req.query;
        let query: any = {};

        // Apply status filter
        if (status && status !== 'all') {
          query.status = status;
        }

        // Apply search filter
        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { licenseNumber: { $regex: search, $options: 'i' } }
          ];
        }

        const drivers = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        return res.status(200).json(drivers);

      case 'POST':
        const driver = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await collection.insertOne(driver);
        return res.status(201).json({ ...driver, _id: result.insertedId });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in drivers API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 