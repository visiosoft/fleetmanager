import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface MongoError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Checking MongoDB URI...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Validate connection string format
    if (!process.env.MONGODB_URI.includes('mongodb+srv://')) {
      throw new Error('Invalid connection string format. Must use mongodb+srv:// for Atlas');
    }

    // Log connection string (without credentials)
    const sanitizedUri = process.env.MONGODB_URI.replace(
      /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
      'mongodb$1://****:****@'
    );
    console.log('Using connection string:', sanitizedUri);

    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('Client connected successfully');
    
    // List available databases
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
    const db = client.db("fleet-management");
    console.log('Database selected:', db.databaseName);
    
    // Try to ping the database
    const pingResult = await db.command({ ping: 1 });
    console.log('Ping result:', pingResult);
    
    // Test insert operation
    console.log('Testing insert operation...');
    const testCollection = db.collection('test');
    const testDoc = {
      timestamp: new Date(),
      test: true
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('Insert result:', insertResult);
    
    // Clean up test document
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('Cleanup result:', deleteResult);
    
    // Get server info
    const serverInfo = await db.command({ serverStatus: 1 });
    console.log('Server info:', serverInfo);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully connected to MongoDB and tested operations',
      database: 'fleet-management',
      testResults: {
        insert: insertResult.acknowledged,
        cleanup: deleteResult.acknowledged
      },
      serverInfo: {
        version: serverInfo.version,
        uptime: serverInfo.uptime,
        connections: serverInfo.connections
      },
      availableDatabases: dbs.databases.map(db => db.name)
    });
  } catch (error) {
    const mongoError = error as MongoError;
    console.error('Detailed connection error:', {
      name: mongoError.name,
      message: mongoError.message,
      stack: mongoError.stack,
      code: mongoError.code,
      connectionString: process.env.MONGODB_URI ? 'Connection string exists' : 'No connection string found'
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to connect to MongoDB';
    if (mongoError.message.includes('ECONNREFUSED')) {
      errorMessage = 'Connection refused. Please check if the MongoDB server is running and accessible.';
    } else if (mongoError.message.includes('MONGODB_URI is not defined')) {
      errorMessage = 'MongoDB connection string is not configured. Please check your environment variables.';
    } else if (mongoError.message.includes('Invalid connection string format')) {
      errorMessage = 'Invalid MongoDB connection string format. Must use mongodb+srv:// for Atlas.';
    }

    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: {
        name: mongoError.name,
        message: mongoError.message,
        code: mongoError.code
      }
    });
  }
} 