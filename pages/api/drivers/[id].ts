import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { Driver, DriverResponse } from '../../../types/driver';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DriverResponse>
) {
  const { id } = req.query;
  
  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid driver ID',
      error: 'The provided ID is not a valid MongoDB ObjectId'
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db('fleet-management');
    const collection = db.collection<Driver>('drivers');
    const driverId = new ObjectId(id as string);

    switch (req.method) {
      case 'PUT':
        const updateData = req.body;
        
        const updatedDriver = await collection.findOneAndUpdate(
          { _id: driverId },
          { $set: { ...updateData, updatedAt: new Date().toISOString() } },
          { returnDocument: 'after' }
        );

        if (!updatedDriver) {
          return res.status(404).json({ 
            success: false,
            message: 'Driver not found',
            error: 'Unable to update driver information' 
          });
        }

        // Transform the driver data to match the response type
        const formattedUpdatedDriver = {
          _id: updatedDriver._id.toString(),
          name: `${updatedDriver.firstName} ${updatedDriver.lastName}`,
          licenseNumber: updatedDriver.licenseNumber,
          phone: updatedDriver.phone,
          email: updatedDriver.email,
          address: updatedDriver.address,
          status: updatedDriver.status === 'on_leave' ? 'inactive' : updatedDriver.status,
          image: updatedDriver.image,
          createdAt: updatedDriver.createdAt,
          updatedAt: updatedDriver.updatedAt
        };

        return res.status(200).json({
          success: true,
          message: 'Driver updated successfully',
          data: formattedUpdatedDriver
        });

      case 'DELETE':
        const deletedDriver = await collection.findOneAndDelete({
          _id: driverId
        });

        if (!deletedDriver) {
          return res.status(404).json({ 
            success: false,
            message: 'Driver not found',
            error: 'Unable to delete driver' 
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Driver deleted successfully'
        });

      case 'GET':
        const driver = await collection.findOne({
          _id: driverId
        });
        
        if (!driver) {
          return res.status(404).json({ 
            success: false,
            message: 'Driver not found' 
          });
        }

        // Transform the driver data to match the response type
        const formattedDriver = {
          _id: driver._id.toString(),
          name: `${driver.firstName} ${driver.lastName}`,
          licenseNumber: driver.licenseNumber,
          phone: driver.phone,
          email: driver.email,
          address: driver.address,
          status: driver.status === 'on_leave' ? 'inactive' : driver.status,
          image: driver.image,
          createdAt: driver.createdAt,
          updatedAt: driver.updatedAt
        };

        return res.status(200).json({
          success: true,
          message: 'Driver retrieved successfully',
          data: formattedDriver
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ 
          success: false,
          message: `Method ${req.method} Not Allowed` 
        });
    }
  } catch (error) {
    console.error('Error in driver API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 