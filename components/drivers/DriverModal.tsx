import { Modal, Button, Input, Dropdown, Row, Text } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { Driver } from '../../types/driver';
import Image from 'next/image';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Driver>) => void;
  driver?: Driver | null;
}

export default function DriverModal({ open, onClose, onSubmit, driver }: Props) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiryDate: '',
    status: 'active',
    emergencyContact: '',
    emergencyPhone: '',
    image: ''
  });

  useEffect(() => {
    if (driver) {
      // Format the date or use empty string if invalid
      let formattedDate = '';
      try {
        const date = new Date(driver.licenseExpiryDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.warn('Invalid date format:', driver.licenseExpiryDate);
      }

      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        address: driver.address,
        licenseNumber: driver.licenseNumber,
        licenseType: driver.licenseType,
        licenseExpiryDate: formattedDate,
        status: driver.status,
        emergencyContact: driver.emergencyContact,
        emergencyPhone: driver.emergencyPhone,
        image: driver.image || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        licenseNumber: '',
        licenseType: '',
        licenseExpiryDate: '',
        status: 'active',
        emergencyContact: '',
        emergencyPhone: '',
        image: ''
      });
    }
  }, [driver]);

  const handleSubmit = () => {
    // Format the date for submission
    const submissionData = {
      ...formData,
      licenseExpiryDate: formData.licenseExpiryDate 
        ? new Date(formData.licenseExpiryDate).toISOString()
        : new Date().toISOString() // Default to current date if empty
    };
    onSubmit(submissionData);
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="600px"
    >
      <Modal.Header>
        <Text h3>{driver ? 'Edit Driver' : 'Add Driver'}</Text>
      </Modal.Header>
      <Modal.Body>
        <form id="driver-form">
          <Row css={{ gap: '$10', mb: '$10' }}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              fullWidth
            />
          </Row>

          <Row css={{ gap: '$10', mb: '$10' }}>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              fullWidth
            />
          </Row>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            fullWidth
            css={{ mb: '$10' }}
          />

          <Row css={{ gap: '$10', mb: '$10' }}>
            <Input
              label="License Number"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="License Type"
              value={formData.licenseType}
              onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
              required
              fullWidth
            />
          </Row>

          <Row css={{ gap: '$10', mb: '$10' }}>
            <Input
              label="License Expiry Date"
              type="date"
              value={formData.licenseExpiryDate}
              onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
              required
              fullWidth
            />
            <Dropdown>
              <Dropdown.Button flat css={{ tt: 'capitalize', width: '100%' }}>
                {formData.status}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Driver Status"
                selectionMode="single"
                selectedKeys={[formData.status || '']}
                onSelectionChange={(keys) => {
                  const status = Array.from(keys)[0] as Driver['status'];
                  setFormData({ ...formData, status });
                }}
              >
                <Dropdown.Item key="active">Active</Dropdown.Item>
                <Dropdown.Item key="inactive">Inactive</Dropdown.Item>
                <Dropdown.Item key="on_leave">On Leave</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Row>

          <Row css={{ gap: '$10', mb: '$10' }}>
            <Input
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Emergency Phone"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              required
              fullWidth
            />
          </Row>

          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            label="Driver Image"
            css={{ mb: '$10' }}
          />

          <Image
            src={formData.image || '/images/avatar.png'}
            alt="Driver photo"
            width={100}
            height={100}
            className="rounded-lg object-cover"
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={onClose}>
          Cancel
        </Button>
        <Button auto color="primary" onPress={handleSubmit}>
          {driver ? 'Update Driver' : 'Add Driver'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 