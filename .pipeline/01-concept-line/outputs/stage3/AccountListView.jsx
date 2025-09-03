import React from 'react';
import { Card, CardContent, CardHeader, Chip, Box, Typography } from '@mui/material';

function AccountListView() {
  return (
    <Card>
      <CardHeader
        title="Account List"
        action={
          <Box>
            <Chip label="📌 Business Rule: List filtering" size="small" color="primary" />
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body1">
          AccountListView implementation
        </Typography>
      </CardContent>
    </Card>
  );
}

export default AccountListView;