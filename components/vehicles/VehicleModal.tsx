import { Modal, Button, Input, Dropdown, Text, Grid, Image } from '@nextui-org/react';
import { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../../types/vehicle';
import { Key } from 'react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vehicle, '_id' | 'createdAt' | 'updatedAt'>) => void;
  vehicle?: Vehicle;
}

const VehicleModal = ({ isOpen, onClose, onSubmit, vehicle }: VehicleModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Vehicle, '_id' | 'createdAt' | 'updatedAt'>>({
    type: 'Truck' as const,
    make: '',
    model: '',
    status: 'active',
    mileage: 0,
    registrationDate: '',
    purchaseDate: '',
    licenseExpiryDate: '',
    licensePlate: '',
    location: '',
    image: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        status: vehicle.status,
        mileage: vehicle.mileage,
        registrationDate: vehicle.registrationDate,
        purchaseDate: vehicle.purchaseDate,
        licenseExpiryDate: vehicle.licenseExpiryDate,
        licensePlate: vehicle.licensePlate,
        location: vehicle.location,
        image: vehicle.image || ''
      });
      setPreviewUrl(vehicle.image || '');
    } else {
      setFormData({
        type: 'Truck' as const,
        make: '',
        model: '',
        status: 'active',
        mileage: 0,
        registrationDate: '',
        purchaseDate: '',
        licenseExpiryDate: '',
        licensePlate: '',
        location: '',
        image: ''
      });
      setPreviewUrl('');
    }
  }, [vehicle, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      width="600px"
      aria-labelledby="vehicle-modal-title"
    >
      <Modal.Header css={{ borderBottom: '1px solid $borderLight', paddingBottom: '$8' }}>
        <Text h4 css={{ margin: 0 }}>
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Text>
      </Modal.Header>

      <Modal.Body css={{ py: '$10' }}>
        <Grid.Container gap={2}>
          {/* Image Upload Section */}
          <Grid xs={12} css={{ marginBottom: '$10' }}>
            <div className="flex flex-col items-center w-full">
              {previewUrl ? (
                <div className="relative w-full max-w-[200px] aspect-square mb-4">
                  <Image
                    src={previewUrl}
                    alt="Vehicle preview"
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    css={{ borderRadius: '$lg' }}
                  />
                  <Button 
                    size="sm" 
                    color="error" 
                    light
                    css={{ position: 'absolute', top: 8, right: 8 }}
                    onPress={() => {
                      setPreviewUrl('');
                      setFormData({ ...formData, image: '' });
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
                  className="w-full max-w-[200px] aspect-square mb-4 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Text css={{ color: '$accents6' }}>Click to upload image</Text>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Button 
                light 
                auto 
                size="sm"
                onPress={() => fileInputRef.current?.click()}
              >
                {previewUrl ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
          </Grid>

          {/* First Row */}
          <Grid xs={12} sm={6}>
            <Input
              label="License Plate"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
              required
              width="100%"
              bordered
              labelPlaceholder="Enter license plate"
              css={{ marginBottom: '$8' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Dropdown>
              <Dropdown.Button 
                flat 
                css={{ width: '100%', marginBottom: '$8' }}
              >
                {formData.type || 'Select Type'}
              </Dropdown.Button>
              <Dropdown.Menu 
                aria-label="Vehicle Type"
                onAction={(key: Key) => setFormData({ ...formData, type: key as Vehicle['type'] })}
                selectedKeys={[formData.type]}
              >
                <Dropdown.Item key="Truck">Truck</Dropdown.Item>
                <Dropdown.Item key="Bus">Bus</Dropdown.Item>
                <Dropdown.Item key="Van">Van</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Grid>

          {/* Second Row */}
          <Grid xs={12} sm={6}>
            <Input
              label="Make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              required
              width="100%"
              bordered
              labelPlaceholder="Enter make"
              css={{ marginBottom: '$8' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              width="100%"
              bordered
              labelPlaceholder="Enter model"
              css={{ marginBottom: '$8' }}
            />
          </Grid>

          {/* Add Location Field */}
          <Grid xs={12} sm={6}>
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              width="100%"
              bordered
              labelPlaceholder="Enter location"
              css={{ marginBottom: '$8' }}
            />
          </Grid>

          {/* Third Row */}
          <Grid xs={12} sm={6}>
            <Input
              label="Mileage (km)"
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
              required
              min="0"
              width="100%"
              bordered
              labelPlaceholder="Enter mileage"
              css={{ marginBottom: '$8' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Dropdown>
              <Dropdown.Button 
                flat 
                css={{ width: '100%', marginBottom: '$8' }}
              >
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </Dropdown.Button>
              <Dropdown.Menu 
                aria-label="Vehicle Status"
                onAction={(key: Key) => setFormData({ ...formData, status: key as Vehicle['status'] })}
                selectedKeys={[formData.status]}
              >
                <Dropdown.Item key="active">Active</Dropdown.Item>
                <Dropdown.Item key="maintenance">Maintenance</Dropdown.Item>
                <Dropdown.Item key="inactive">Inactive</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Grid>

          {/* Fourth Row - Dates */}
          <Grid xs={12} sm={6}>
            <Input
              label="Registration Date"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
              required
              width="100%"
              bordered
              css={{ marginBottom: '$8' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
              width="100%"
              bordered
              css={{ marginBottom: '$8' }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <Input
              label="License Expiry Date"
              type="date"
              value={formData.licenseExpiryDate}
              onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
              required
              width="100%"
              bordered
              css={{ marginBottom: '$8' }}
            />
          </Grid>
        </Grid.Container>
      </Modal.Body>

      <Modal.Footer css={{ borderTop: '1px solid $borderLight', paddingTop: '$8' }}>
        <Button auto flat color="error" onPress={onClose}>
          Cancel
        </Button>
        <Button auto onPress={handleSubmit}>
          {vehicle ? 'Update' : 'Add'} Vehicle
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehicleModal; 