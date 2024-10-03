import React from 'react';
import { LoadingOverlay } from '@mantine/core';

interface PageLoadingProps {
  visible: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ visible }) => {
  return (
    <LoadingOverlay
      visible={visible}
      zIndex={1000}
      overlayProps={{ radius: "sm" }}
    />
  );
};