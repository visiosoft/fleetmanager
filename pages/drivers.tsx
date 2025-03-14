import { Button, Input, Dropdown } from '@nextui-org/react';
import { useState, useCallback } from 'react';
import { Content } from '../components/styles/content';
import DriverList from '../components/drivers/DriverList';
import DriverModal from '../components/drivers/DriverModal';
import { Flex } from '../components/styles/flex';
import { AddIcon } from '../components/icons/table/add-icon';
import { Driver } from '../types/driver';

export default function DriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshTable = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleAddDriver = async (driverData: Partial<Driver>) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        throw new Error('Failed to add driver');
      }

      setIsModalOpen(false);
      setSelectedDriver(null);
      refreshTable();
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

  const handleEditDriver = async (driverData: Partial<Driver>) => {
    if (!selectedDriver?._id) return;

    try {
      const response = await fetch(`/api/drivers/${selectedDriver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        throw new Error('Failed to update driver');
      }

      setIsModalOpen(false);
      setSelectedDriver(null);
      refreshTable();
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    
    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete driver');
      }

      refreshTable();
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  return (
    <Content>
      <Flex
        css={{
          'gap': '$8',
          'pt': '$5',
          'height': 'fit-content',
          'flexWrap': 'wrap',
          '@sm': {
            flexWrap: 'nowrap',
          },
        }}
        justify={'between'}
        align={'center'}
      >
        <Flex
          css={{
            'gap': '$6',
            'flexWrap': 'wrap',
            '@sm': {
              flexWrap: 'nowrap',
            },
          }}
          align={'center'}
        >
          <Input
            css={{ width: '100%', maxW: '410px' }}
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dropdown>
            <Dropdown.Button css={{ tt: 'capitalize' }}>
              {statusFilter === 'all' ? 'All Status' : statusFilter.replace('_', ' ')}
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Status filter"
              selectionMode="single"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
            >
              <Dropdown.Item key="all">All Status</Dropdown.Item>
              <Dropdown.Item key="active">Active</Dropdown.Item>
              <Dropdown.Item key="inactive">Inactive</Dropdown.Item>
              <Dropdown.Item key="on_leave">On Leave</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Flex>
        <Button
          auto
          color="primary"
          icon={<AddIcon />}
          onPress={() => {
            setSelectedDriver(null);
            setIsModalOpen(true);
          }}
        >
          Add Driver
        </Button>
      </Flex>
      <DriverList
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onEdit={handleEdit}
        onDelete={handleDeleteDriver}
        refreshKey={refreshKey}
      />
      <DriverModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDriver(null);
        }}
        onSubmit={selectedDriver ? handleEditDriver : handleAddDriver}
        driver={selectedDriver}
      />
    </Content>
  );
} 