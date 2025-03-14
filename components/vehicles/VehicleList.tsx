import { Table, Button, Input, Modal, Image, Text, Tooltip, Col, Row } from '@nextui-org/react';
import { useState, useMemo, useEffect } from 'react';
import VehicleModal from './VehicleModal';
import { Vehicle } from '../../types/vehicle';
import { Box } from '../styles/box';
import { Flex } from '../styles/flex';
import { IconButton, StyledBadge } from '../table/table.styled';
import { DeleteIcon } from '../icons/table/delete-icon';
import { EditIcon } from '../icons/table/edit-icon';
import { EyeIcon } from '../icons/table/eye-icon';
import { User } from '@nextui-org/react';

const columns = [
  { name: 'VEHICLE', uid: 'vehicle' },
  { name: 'TYPE', uid: 'type' },
  { name: 'MAKE', uid: 'make' },
  { name: 'MODEL', uid: 'model' },
  { name: 'LOCATION', uid: 'location' },
  { name: 'STATUS', uid: 'status' },
  { name: 'MILEAGE', uid: 'mileage' },
  { name: 'ACTIONS', uid: 'actions' },
];

const VehicleList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    if (searchQuery) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter);
    }

    return filtered;
  }, [vehicles, searchQuery, statusFilter]);

  const handleAddVehicle = async (data: Omit<Vehicle, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create vehicle');
      }

      await fetchVehicles();
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
    }
  };

  const handleEditVehicle = async (data: Omit<Vehicle, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedVehicle) return;

    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      await fetchVehicles();
      setIsModalOpen(false);
      setSelectedVehicle(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      setVehicles(vehicles.filter((v) => v._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
    }
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderCell = (vehicle: Vehicle, columnKey: string) => {
    switch (columnKey) {
      case 'vehicle':
        return (
          <User
            squared
            src={vehicle.image || undefined}
            name={vehicle.licensePlate}
            css={{ p: 0 }}
            description={`${vehicle.make} ${vehicle.model}`}
          >
            {vehicle.licensePlate}
          </User>
        );
      case 'type':
        return (
          <Col>
            <Row>
              <Text b size={14} css={{ tt: 'capitalize' }}>
                {vehicle.type}
              </Text>
            </Row>
          </Col>
        );
      case 'status':
        return (
          <StyledBadge type={getStatusColor(vehicle.status)}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </StyledBadge>
        );
      case 'mileage':
        return (
          <Col>
            <Row>
              <Text b size={14}>
                {vehicle.mileage.toLocaleString()}
              </Text>
            </Row>
            <Row>
              <Text b size={13} css={{ color: '$accents7' }}>
                km
              </Text>
            </Row>
          </Col>
        );
      case 'actions':
        return (
          <Row justify="center" align="center" css={{ gap: '$8', '@md': { gap: 0 } }}>
            <Col css={{ d: 'flex' }}>
              <Tooltip content="View Details">
                <IconButton onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsViewModalOpen(true);
                }}>
                  <EyeIcon size={20} fill="#979797" />
                </IconButton>
              </Tooltip>
            </Col>
            <Col css={{ d: 'flex' }}>
              <Tooltip content="Edit Vehicle">
                <IconButton onClick={() => {
                  setSelectedVehicle(vehicle);
                  setIsModalOpen(true);
                }}>
                  <EditIcon size={20} fill="#979797" />
                </IconButton>
              </Tooltip>
            </Col>
            <Col css={{ d: 'flex' }}>
              <Tooltip content="Delete Vehicle" color="error">
                <IconButton onClick={() => handleDeleteVehicle(vehicle._id)}>
                  <DeleteIcon size={20} fill="#FF0080" />
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );
      default:
        return vehicle[columnKey as keyof Vehicle];
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <Box
      css={{
        '& .nextui-table-container': {
          boxShadow: 'none',
        },
      }}
    >
      <Table
        aria-label="Vehicle fleet table"
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
        <Table.Body items={filteredVehicles}>
          {(vehicle) => (
            <Table.Row key={vehicle._id}>
              {(columnKey) => (
                <Table.Cell>
                  {renderCell(vehicle, columnKey as string)}
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

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        onSubmit={selectedVehicle ? handleEditVehicle : handleAddVehicle}
        vehicle={selectedVehicle}
      />

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        width="900px"
        css={{
          '& .nextui-modal-body': {
            padding: '0px !important',
          }
        }}
      >
        {selectedVehicle && (
          <>
            <div className="relative w-full h-[200px] bg-gradient-to-r from-blue-500 to-purple-500">
              {selectedVehicle.image && (
                <div className="absolute inset-0">
                  <Image
                    src={selectedVehicle.image}
                    alt={selectedVehicle.licensePlate}
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
                    {selectedVehicle.image ? (
                      <Image
                        src={selectedVehicle.image}
                        alt={selectedVehicle.licensePlate}
                        objectFit="cover"
                        width="120px"
                        height="120px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <span className="material-icons text-5xl">directions_car</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <Text h2 css={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {selectedVehicle.licensePlate}
                    </Text>
                    <Text h4 css={{ color: 'white', margin: 0, opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {selectedVehicle.make} {selectedVehicle.model}
                    </Text>
                    <div className="mt-2">
                      <StyledBadge 
                        type={getStatusColor(selectedVehicle.status)}
                        css={{ 
                          padding: '8px 16px',
                          borderRadius: '20px',
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {selectedVehicle.status.charAt(0).toUpperCase() + selectedVehicle.status.slice(1)}
                      </StyledBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                {/* Vehicle Details */}
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{selectedVehicle.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{selectedVehicle.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mileage</p>
                        <p className="font-medium text-gray-900">{selectedVehicle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Info */}
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Registration Info</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Registration Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedVehicle.registrationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Expiry</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedVehicle.licenseExpiryDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Purchase Info</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Purchase Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedVehicle.purchaseDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
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
                setSelectedVehicle(selectedVehicle);
                setIsModalOpen(true);
              }}>
                Edit Vehicle
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Box>
  );
};

export default VehicleList; 