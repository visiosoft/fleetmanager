import { NextPage } from 'next';
import { Card, Text, Button, Spinner } from '@nextui-org/react';
import { Flex } from '../components/styles/flex';
import { Box } from '../components/styles/box';
import { useState } from 'react';

interface ApiError {
  name: string;
  message: string;
  details?: any;
}

const TestDBPage: NextPage = () => {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setData(null);

    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to connect to database');
      }

      setSuccess(true);
      setData(result);
    } catch (err) {
      const error = err as Error;
      setError({
        name: 'Network Error',
        message: 'Failed to reach the API endpoint',
        details: error.message
      });
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      css={{
        'mt': '$5',
        'px': '$6',
        '@sm': {
          mt: '$10',
          px: '$16',
        },
      }}
      justify={'center'}
      direction={'column'}
    >
      <Text h3>Database Connection Test</Text>
      <Text css={{ color: '$accents8', mb: '$8' }}>
        Click the button below to test the MongoDB connection
      </Text>

      <Box css={{ maxW: '600px', mx: 'auto' }}>
        <Card
          css={{
            height: 'auto',
            bg: '$accents0',
            borderRadius: '$xl',
            px: '$6',
          }}
        >
          <Card.Body css={{ py: '$10' }}>
            <Box css={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '$4'
            }}>
              <Button 
                color="primary" 
                onClick={testConnection}
                css={{ width: '200px', mx: 'auto' }}
                disabled={loading}
              >
                {loading ? (
                  <Flex align="center" css={{ gap: '$2' }}>
                    <Spinner size="sm" />
                    <Text>Testing...</Text>
                  </Flex>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {status && (
                <Text css={{ textAlign: 'center', color: '$success' }}>
                  {status}
                </Text>
              )}

              {error && (
                <Card css={{ bg: '$errorLight', p: '$4' }}>
                  <Card.Body>
                    <Text css={{ color: '$error' }}>Connection Error</Text>
                    <Text css={{ color: '$error', fontSize: '$sm' }}>
                      {error.name}: {error.message}
                    </Text>
                    {error.details && (
                      <Text css={{ color: '$error', fontSize: '$sm' }}>
                        Details: {error.details}
                      </Text>
                    )}
                  </Card.Body>
                </Card>
              )}

              {success && data && (
                <Card css={{ bg: '$successLight', p: '$4' }}>
                  <Card.Body>
                    <Text css={{ color: '$success' }}>Connection Successful</Text>
                    <Text css={{ color: '$success', fontSize: '$sm' }}>
                      {data.message}
                    </Text>
                    
                    {/* Test Results */}
                    {data.testResults && (
                      <Box css={{ mt: '$4' }}>
                        <Text css={{ color: '$success', fontWeight: '$bold', mb: '$2' }}>
                          Test Operations:
                        </Text>
                        <Box css={{ 
                          p: '$4', 
                          bg: '$successLight', 
                          borderRadius: '$md',
                          fontSize: '$sm'
                        }}>
                          <Text css={{ color: '$success' }}>
                            Insert Test: {data.testResults.insert ? '✓ Success' : '✗ Failed'}
                          </Text>
                          <Text css={{ color: '$success' }}>
                            Cleanup Test: {data.testResults.cleanup ? '✓ Success' : '✗ Failed'}
                          </Text>
                        </Box>
                      </Box>
                    )}

                    <Box css={{ mt: '$4' }}>
                      <Text css={{ color: '$success', fontWeight: '$bold', mb: '$2' }}>
                        Server Information:
                      </Text>
                      <Box css={{ 
                        p: '$4', 
                        bg: '$successLight', 
                        borderRadius: '$md',
                        fontSize: '$sm',
                        overflow: 'auto'
                      }}>
                        <Text as="pre" css={{ 
                          color: '$success',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {JSON.stringify(data.serverInfo, null, 2)}
                        </Text>
                      </Box>
                    </Box>
                    
                    <Box css={{ mt: '$4' }}>
                      <Text css={{ color: '$success', fontWeight: '$bold', mb: '$2' }}>
                        Available Databases:
                      </Text>
                      <Box as="ul" css={{ 
                        listStyle: 'disc',
                        pl: '$4',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '$2'
                      }}>
                        {data.availableDatabases.map((db: string) => (
                          <Box as="li" key={db}>
                            <Text css={{ color: '$success' }}>{db}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Card.Body>
                </Card>
              )}
            </Box>
          </Card.Body>
        </Card>
      </Box>
    </Flex>
  );
};

export default TestDBPage; 