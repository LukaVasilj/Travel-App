import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default RootLayout;