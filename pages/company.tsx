import { useState, useEffect, useRef } from 'react';
import { Text, Input, Button, Image, Card, Grid, Loading, Row, Col, Spacer } from '@nextui-org/react';
import type { FormEvent, ChangeEvent } from 'react';
import { Company } from '../types/company';
import { Layout } from '../components/layout/layout';
import { Box } from '../components/styles/box';
import { EditIcon } from '../components/icons/table/edit-icon';
import { Tooltip } from '@nextui-org/react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

const Toast = ({ message, type }: ToastProps) => (
  <div className="fixed top-4 right-4 z-50 animate-fade-in">
    <Card css={{ 
      backgroundColor: type === 'success' ? '$success' : '$error', 
      p: '$6',
      mw: '300px'
    }}>
      <Row align="center" css={{ gap: '$6' }}>
        <Text css={{ color: 'white' }}>{type === 'success' ? '✓' : '⚠'}</Text>
        <Text css={{ color: 'white' }}>{message}</Text>
      </Row>
    </Card>
  </div>
);

const CompanyPage = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setPreviewUrl(data.logo || '');
      }
    } catch (err) {
      setError('Failed to fetch company information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a preview URL for the image
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCompany(prev => prev ? { ...prev, logo: base64String } : null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/company', {
        method: company._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(company),
      });

      if (!response.ok) {
        throw new Error('Failed to save company information');
      }

      const result = await response.json();
      setCompany(prev => ({ ...prev!, ...result }));
      setSuccess('Company information saved successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const PreviewMode = () => (
    <Card css={{ p: '$6', mt: '$8' }}>
      <Card.Header css={{ pb: '$10' }}>
        <Row justify="space-between" align="center">
          <Text h3 css={{ m: 0 }}>Company Details</Text>
          <Button
            auto
            light
            icon={<EditIcon size={20} fill="currentColor" />}
            onPress={() => setIsEditing(true)}
          >
            Edit Details
          </Button>
        </Row>
      </Card.Header>
      <Card.Body css={{ py: '$2' }}>
        <Grid.Container gap={2}>
          {/* Logo Section */}
          <Grid xs={12} justify="center" css={{ borderBottom: '1px solid $border', pb: '$10' }}>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Company logo"
                objectFit="contain"
                width={200}
                height={200}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                <Text css={{ color: '$accents6' }}>No Logo</Text>
              </div>
            )}
          </Grid>

          {/* Company Information */}
          <Grid xs={12} sm={6}>
            <Box>
              <Text h5 css={{ color: '$accents7', mb: '$4' }}>Basic Information</Text>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>Company Name</Text>
                <Text h5 css={{ mt: '$2' }}>{company?.name || 'Not set'}</Text>
              </Box>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>License Number</Text>
                <Text h5 css={{ mt: '$2' }}>{company?.licenseNumber || 'Not set'}</Text>
              </Box>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>Address</Text>
                <Text h5 css={{ mt: '$2' }}>{company?.address || 'Not set'}</Text>
              </Box>
            </Box>
          </Grid>

          <Grid xs={12} sm={6}>
            <Box>
              <Text h5 css={{ color: '$accents7', mb: '$4' }}>Contact Information</Text>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>Email</Text>
                <Text h5 css={{ mt: '$2' }}>{company?.email || 'Not set'}</Text>
              </Box>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>Phone</Text>
                <Text h5 css={{ mt: '$2' }}>{company?.phone || 'Not set'}</Text>
              </Box>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>Website</Text>
                <Text h5 css={{ mt: '$2' }}>
                  {company?.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                      {company.website}
                    </a>
                  ) : (
                    'Not set'
                  )}
                </Text>
              </Box>
            </Box>
          </Grid>

          <Grid xs={12}>
            <Box css={{ mt: '$8', pt: '$8', borderTop: '1px solid $border' }}>
              <Text h5 css={{ color: '$accents7', mb: '$4' }}>License Information</Text>
              <Box css={{ mb: '$8' }}>
                <Text css={{ color: '$accents7', fontSize: '$sm' }}>License Renewal Date</Text>
                <Text h5 css={{ mt: '$2' }}>
                  {company?.renewalDate ? formatDate(company.renewalDate) : 'Not set'}
                </Text>
              </Box>
            </Box>
          </Grid>
        </Grid.Container>
      </Card.Body>
    </Card>
  );

  const EditMode = () => (
    <Card css={{ p: '$6', mt: '$8' }}>
      <Card.Header css={{ pb: '$10' }}>
        <Row justify="space-between" align="center">
          <Text h3 css={{ m: 0 }}>Edit Company Information</Text>
          <Button
            auto
            light
            color="primary"
            onPress={() => {
              setIsEditing(false);
              setError(null);
              setSuccess(null);
            }}
          >
            Cancel Edit
          </Button>
        </Row>
      </Card.Header>
      <form onSubmit={handleSubmit}>
        <Grid.Container gap={2}>
          {/* Logo Upload Section */}
          <Grid xs={12} direction="column" css={{ gap: '$6' }}>
            <Text h4>Company Logo</Text>
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <div className="relative w-[200px] h-[200px] mb-4">
                  <Image
                    src={previewUrl}
                    alt="Company logo"
                    objectFit="contain"
                    width="200px"
                    height="200px"
                  />
                  <Button 
                    size="sm" 
                    color="error" 
                    light
                    css={{ position: 'absolute', top: 8, right: 8 }}
                    onPress={() => {
                      setPreviewUrl('');
                      setCompany(prev => prev ? { ...prev, logo: '' } : null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div 
                  className="w-[200px] h-[200px] mb-4 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Text css={{ color: '$accents6' }}>Click to upload logo</Text>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <Button 
                light 
                auto 
                onPress={() => fileInputRef.current?.click()}
              >
                {previewUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </div>
          </Grid>

          {/* Company Details */}
          <Grid xs={12} sm={6}>
            <Input
              label="Company Name"
              value={company?.name || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, name: e.target.value } : null)}
              required
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="License Number"
              value={company?.licenseNumber || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, licenseNumber: e.target.value } : null)}
              required
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12}>
            <Input
              label="Address"
              value={company?.address || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, address: e.target.value } : null)}
              required
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="Email"
              type="email"
              value={company?.email || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, email: e.target.value } : null)}
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="Phone"
              value={company?.phone || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, phone: e.target.value } : null)}
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="Website"
              value={company?.website || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, website: e.target.value } : null)}
              fullWidth
              bordered
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="License Renewal Date"
              type="date"
              value={company?.renewalDate?.split('T')[0] || ''}
              onChange={(e) => setCompany(prev => prev ? { ...prev, renewalDate: e.target.value } : null)}
              required
              fullWidth
              bordered
            />
          </Grid>

          {/* Error Message */}
          {error && (
            <Grid xs={12}>
              <Text color="error">{error}</Text>
            </Grid>
          )}

          {/* Submit Button */}
          <Grid xs={12} justify="flex-end">
            <Button
              type="submit"
              disabled={saving}
              color="primary"
            >
              {saving ? <Loading size="sm" /> : 'Save Changes'}
            </Button>
          </Grid>
        </Grid.Container>
      </form>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[600px]">
          <Loading size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box css={{ px: '$12', mt: '$8', '@xsMax': { px: '$10' } }}>
        <div className="relative">
          <Text h2>Company Information</Text>
          
          {/* Success Message */}
          {success && <Toast message={success} type="success" />}

          {/* Error Message */}
          {error && <Toast message={error} type="error" />}

          {isEditing ? <EditMode /> : <PreviewMode />}
        </div>
      </Box>
    </Layout>
  );
};

// Add animation keyframes
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CompanyPage; 