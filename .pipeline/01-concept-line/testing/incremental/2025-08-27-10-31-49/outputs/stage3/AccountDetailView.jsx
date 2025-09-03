import React from 'react';
import { Card, CardContent, CardHeader, Chip, Box, Typography } from '@mui/material';

function AccountDetailView() {
  return (
    <Card>
      <CardHeader
        title="Account Details"
        action={
          <Box>
            <Chip label="📌 Business Rule: Field validation" size="small" color="primary" />
            <Chip label="⚠️ Gap: Validation logic needed" size="small" color="warning" />
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body1">
          AccountDetailView implementation
        </Typography>
      </CardContent>
    </Card>
  );
}

export default AccountDetailView;