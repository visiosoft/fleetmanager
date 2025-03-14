import { NextPage } from 'next';
import Link from 'next/link';
import { Text, Button, Input } from '@nextui-org/react';
import { Flex } from '../components/styles/flex';
import { Box } from '../components/styles/box';
import { Breadcrumbs, Crumb, CrumbLink } from '../components/breadcrumb/breadcrumb.styled';
import { HouseIcon } from '../components/icons/breadcrumb/house-icon';
import { VehicleIcon } from '../components/icons/sidebar/vehicle-icon';
import { SettingsIcon } from '../components/icons/sidebar/settings-icon';
import { TrashIcon } from '../components/icons/accounts/trash-icon';
import { InfoIcon } from '../components/icons/accounts/info-icon';
import { DotsIcon } from '../components/icons/accounts/dots-icon';
import { ExportIcon } from '../components/icons/accounts/export-icon';
import { SearchIcon } from '../components/icons/search-icon';
import VehicleList from '../components/vehicles/VehicleList';
import VehicleModal from '../components/vehicles/VehicleModal';
import { useState } from 'react';

const VehiclesPage: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <Breadcrumbs>
        <Crumb>
          <HouseIcon />
          <Link href={'/'}>
            <CrumbLink href="#">Home</CrumbLink>
          </Link>
          <Text>/</Text>
        </Crumb>

        <Crumb>
          <VehicleIcon />
          <CrumbLink href="#">Vehicles</CrumbLink>
          <Text>/</Text>
        </Crumb>
        <Crumb>
          <CrumbLink href="#">List</CrumbLink>
        </Crumb>
      </Breadcrumbs>

      <Text h3>All Vehicles</Text>

      <Flex
        css={{ gap: '$8' }}
        align={'center'}
        justify={'between'}
        wrap={'wrap'}
      >
        <Flex
          css={{
            'gap': '$6',
            'flexWrap': 'wrap',
            '@sm': { flexWrap: 'nowrap' },
          }}
          align={'center'}
        >
          <Input
            css={{ width: '100%', maxW: '410px' }}
            placeholder="Search vehicles"
            contentLeft={<SearchIcon />}
          />
          <SettingsIcon />
          <TrashIcon />
          <InfoIcon />
          <DotsIcon />
        </Flex>
        <Flex direction={'row'} css={{ gap: '$6' }} wrap={'wrap'}>
          <Button auto onClick={() => setIsModalOpen(true)}>
            Add Vehicle
          </Button>
          <Button auto iconRight={<ExportIcon />}>
            Export to CSV
          </Button>
        </Flex>
      </Flex>

      <VehicleList />

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
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

            // Refresh the vehicle list by forcing a re-render of VehicleList
            window.location.reload();
            setIsModalOpen(false);
          } catch (error) {
            console.error('Error creating vehicle:', error);
            alert('Failed to create vehicle. Please try again.');
          }
        }}
      />
    </Flex>
  );
};

export default VehiclesPage; 