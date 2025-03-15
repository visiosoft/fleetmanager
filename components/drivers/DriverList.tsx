import { Table, Button, Input, Modal, Image, Text, Tooltip, Col, Row } from '@nextui-org/react';
import { useState, useMemo, useEffect } from 'react';
import DriverModal from './DriverModal';
import { Driver } from '../../types/driver';
import { Box } from '../styles/box';
import { IconButton, StyledBadge } from '../table/table.styled';
import { DeleteIcon } from '../icons/table/delete-icon';
import { EditIcon } from '../icons/table/edit-icon';
import { EyeIcon } from '../icons/table/eye-icon';
import { User } from '@nextui-org/react';
import { ObjectId } from 'mongodb';

interface Props {
  searchQuery: string;
  statusFilter: string;
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  refreshKey: number;
}

const columns = [
  { name: 'DRIVER', uid: 'driver' },
  { name: 'LICENSE', uid: 'license' },
  { name: 'CONTACT', uid: 'contact' },
  { name: 'STATUS', uid: 'status' },
  { name: 'ACTIONS', uid: 'actions' },
];

export default function DriverList({ searchQuery, statusFilter, onEdit, onDelete, refreshKey }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/drivers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [searchQuery, statusFilter, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: Driver['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_leave':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderCell = (driver: Driver, columnKey: string) => {
    switch (columnKey) {
      case 'driver':
        return (
          <User
            squared
            src={driver.image || 'https://i.pravatar.cc/150'}
            name={`${driver.firstName} ${driver.lastName}`}
            css={{ p: 0 }}
          >
            {driver.email}
          </User>
        );
      case 'license':
        return (
          <Col>
            <Row>
              <Text b size="small" css={{ tt: "capitalize" }}>
                {driver.licenseNumber}
              </Text>
            </Row>
            <Row>
              <Text size="small" css={{ color: "$accents7" }}>
                Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}
              </Text>
            </Row>
          </Col>
        );
      case 'contact':
        return (
          <Col>
            <Row>
              <Text size="small">{driver.phone}</Text>
            </Row>
            <Row>
              <Text size="small" css={{ color: "$accents7" }}>
                {driver.email}
              </Text>
            </Row>
          </Col>
        );
      case 'status':
        return (
          <Text
            b
            size="small"
            css={{
              tt: "capitalize",
              color: driver.status === 'active' ? '$success' : 
                     driver.status === 'inactive' ? '$error' : '$warning'
            }}
          >
            {driver.status.replace('_', ' ')}
          </Text>
        );
      case 'actions':
        return (
          <Row justify="center" align="center" css={{ gap: '$8' }}>
            <Tooltip content="Edit driver">
              <IconButton onClick={() => onEdit(driver)} aria-label={`Edit driver ${driver.firstName} ${driver.lastName}`}>
                <EditIcon size={20} fill="#979797" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete driver" color="error">
              <IconButton 
                onClick={() => driver._id && onDelete(driver._id.toString())}
                aria-label={`Delete driver ${driver.firstName} ${driver.lastName}`}
              >
                <DeleteIcon size={20} fill="#FF0080" />
              </IconButton>
            </Tooltip>
          </Row>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <Box css={{
      '& .nextui-table-container': {
        boxShadow: 'none',
      },
    }}>
      <Table
        aria-label="Driver list table"
        css={{
          height: 'auto',
          minWidth: '100%',
          boxShadow: 'none',
          width: '100%',
          px: 0,
        }}
        selectionMode="multiple"
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              hideHeader={column.uid === 'actions'}
              align={column.uid === 'actions' ? 'center' : 'start'}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={drivers}>
          {(driver) => (
            <Table.Row key={driver._id?.toString()}>
              {(columnKey) => (
                <Table.Cell>
                  {renderCell(driver, columnKey as string)}
                </Table.Cell>
              )}
            </Table.Row>
          )}
        </Table.Body>
        <Table.Pagination
          shadow
          noMargin
          align="center"
          rowsPerPage={8}
          onPageChange={(page) => console.log({page})}
        />
      </Table>

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDriver(undefined);
        }}
        width="900px"
        css={{
          '& .nextui-modal-body': {
            padding: '0px !important',
          }
        }}
      >
        {selectedDriver && (
          <>
            <div className="relative w-full h-[200px] bg-gradient-to-r from-blue-500 to-purple-500">
              {selectedDriver.image && (
                <div className="absolute inset-0">
                  <Image
                    src={selectedDriver.image}
                    alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    css={{ opacity: 0.3 }}
                  />
                </div>
              )}
              <div className="absolute inset-0 flex items-center px-8">
                <div className="flex items-center gap-6">
                  <div className="w-[120px] h-[120px] rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/30">
                    {selectedDriver.image ? (
                      <Image
                        src={selectedDriver.image}
                        alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                        objectFit="cover"
                        width="120px"
                        height="120px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <span className="material-icons text-5xl">person</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <Text h2 css={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                    </Text>
                    <Text h4 css={{ color: 'white', margin: 0, opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      License: {selectedDriver.licenseNumber}
                    </Text>
                    <div className="mt-2">
                      <StyledBadge 
                        type={getStatusColor(selectedDriver.status)}
                        css={{ 
                          padding: '8px 16px',
                          borderRadius: '20px',
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {selectedDriver.status.replace('_', ' ').charAt(0).toUpperCase() + selectedDriver.status.slice(1)}
                      </StyledBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                {/* Personal Details */}
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedDriver.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{selectedDriver.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{selectedDriver.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* License & Emergency Info */}
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">License Information</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">License Type</p>
                          <p className="font-medium text-gray-900">Type {selectedDriver.licenseType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Expiry</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedDriver.licenseExpiryDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Emergency Contact</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Contact Person</p>
                          <p className="font-medium text-gray-900">{selectedDriver.emergencyContact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact Number</p>
                          <p className="font-medium text-gray-900">{selectedDriver.emergencyPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Modal.Footer css={{ borderTop: '1px solid $borderLight', paddingTop: '$8' }}>
              <Button auto flat color="error" onPress={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button auto color="primary" onPress={() => {
                setIsViewModalOpen(false);
                onEdit(selectedDriver);
              }}>
                Edit Driver
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Box>
  );
}