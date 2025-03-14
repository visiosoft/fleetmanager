import { Text } from '@nextui-org/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const Breadcrumb = () => {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm">
      <NextLink href="/" passHref>
        <Text className="cursor-pointer hover:opacity-80">Home</Text>
      </NextLink>
      {pathSegments.map((segment, index) => (
        <div key={segment} className="flex items-center gap-2">
          <Text className="text-gray-500">/</Text>
          <NextLink href={`/${pathSegments.slice(0, index + 1).join('/')}`} passHref>
            <Text className="cursor-pointer hover:opacity-80">
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Text>
          </NextLink>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb; 