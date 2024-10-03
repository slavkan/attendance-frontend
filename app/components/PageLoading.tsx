import React from 'react'
import { LoadingOverlay } from '@mantine/core'

export const PageLoading = () => {
  return (
    <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: "sm" }}
      />
  )
}
