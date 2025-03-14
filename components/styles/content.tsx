import { styled } from '@nextui-org/react';

export const Content = styled('div', {
  boxSizing: 'border-box',
  width: '100%',
  position: 'relative',
  minHeight: '100vh',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  variants: {
    fluid: {
      true: {
        maxWidth: '100%',
        marginLeft: 0,
        marginRight: 0,
      },
      false: {
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
  },
  defaultVariants: {
    fluid: false,
  },
}); 