/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ComplaintForm } from '../../components/complaints/ComplaintForm';

export function NewComplaintPage() {
  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Student Portal', href: '/student/dashboard' },
        { label: 'Submit New Complaint' }
      ]}
    >
      <ComplaintForm />
    </DashboardLayout>
  );
}
