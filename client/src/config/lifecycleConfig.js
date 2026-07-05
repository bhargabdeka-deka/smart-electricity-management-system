import { LIFECYCLE_STATES } from '../constants/connectionStatus';

export const LIFECYCLE_CONFIG = {
  [LIFECYCLE_STATES.REGISTERED]: {
    pageTitle: "Welcome to your Digital Account",
    statusBadge: { text: "Not Applied", color: "gray", show: false },
    allowedNavigation: ['/homepage', '/apply', '/profile'],
    helpdeskCategories: ['Application Setup', 'Account Access'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: false, showConsumerId: false, showPhysicalMeter: false },
      timeline: { visible: false, title: "" },
      energy: { visible: false, title: "" },
      stats: { visible: false, title: "" },
      notifications: { visible: false, title: "" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['apply_connection'] }
    }
  },
  
  [LIFECYCLE_STATES.PENDING]: {
    pageTitle: "Application Submitted",
    statusBadge: { text: "Pending Review", color: "orange", show: true },
    allowedNavigation: ['/homepage', '/profile'],
    helpdeskCategories: ['Application Delay', 'Document Issue'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: false, showPhysicalMeter: false },
      timeline: { visible: true, title: "Application Timeline" },
      energy: { visible: false, title: "" },
      stats: { visible: false, title: "" },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['track_application', 'withdraw_application'] }
    }
  },

  [LIFECYCLE_STATES.UNDER_REVIEW]: {
    pageTitle: "Application Under Review",
    statusBadge: { text: "Under Review", color: "orange", show: true },
    allowedNavigation: ['/homepage', '/profile'],
    helpdeskCategories: ['Application Delay', 'Document Issue'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: false, showPhysicalMeter: false },
      timeline: { visible: true, title: "Application Timeline" },
      energy: { visible: false, title: "" },
      stats: { visible: false, title: "" },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['track_application'] }
    }
  },

  [LIFECYCLE_STATES.APPROVED]: {
    pageTitle: "Application Approved",
    statusBadge: { text: "Approved", color: "blue", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill'],
    helpdeskCategories: ['Application Delay', 'Engineer Delay', 'Visit Reschedule'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: false },
      timeline: { visible: true, title: "Connection Tracking" },
      energy: { visible: false, title: "" },
      stats: { visible: true, title: "Key Metrics", fields: ['kyc_status', 'complaints'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['update_kyc', 'track_engineer'] }
    }
  },

  [LIFECYCLE_STATES.ENGINEER_ASSIGNED]: {
    pageTitle: "Engineer Assigned",
    statusBadge: { text: "Engineer Assigned", color: "blue", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill'],
    helpdeskCategories: ['Engineer Delay', 'Visit Reschedule'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: false },
      timeline: { visible: true, title: "Connection Tracking" },
      energy: { visible: false, title: "" },
      stats: { visible: true, title: "Key Metrics", fields: ['kyc_status', 'complaints'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['update_kyc', 'track_engineer'] }
    }
  },

  [LIFECYCLE_STATES.VISIT_SCHEDULED]: {
    pageTitle: "Visit Scheduled",
    statusBadge: { text: "Visit Scheduled", color: "purple", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill'],
    helpdeskCategories: ['Visit Reschedule', 'Engineer Delay'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: false },
      timeline: { visible: true, title: "Connection Tracking" },
      energy: { visible: false, title: "" },
      stats: { visible: true, title: "Key Metrics", fields: ['kyc_status', 'complaints'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['update_kyc', 'track_engineer'] }
    }
  },

  [LIFECYCLE_STATES.INSTALLATION_IN_PROGRESS]: {
    pageTitle: "Installation In Progress",
    statusBadge: { text: "Installation Ongoing", color: "purple", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill'],
    helpdeskCategories: ['Installation Issue', 'Engineer Delay'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: false },
      timeline: { visible: true, title: "Connection Tracking" },
      energy: { visible: false, title: "" },
      stats: { visible: true, title: "Key Metrics", fields: ['kyc_status', 'complaints'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['update_kyc', 'track_engineer'] }
    }
  },

  [LIFECYCLE_STATES.METER_INSTALLED]: {
    pageTitle: "Meter Installed",
    statusBadge: { text: "Meter Installed", color: "teal", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill'],
    helpdeskCategories: ['Activation Delay', 'Meter Issue'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: true },
      timeline: { visible: true, title: "Connection Tracking" },
      energy: { visible: false, title: "" },
      stats: { visible: true, title: "Key Metrics", fields: ['kyc_status', 'complaints'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['update_kyc', 'track_application'] }
    }
  },

  [LIFECYCLE_STATES.ACTIVATED]: {
    pageTitle: "Smart Electricity Dashboard",
    statusBadge: { text: "Active", color: "green", show: true },
    allowedNavigation: ['/homepage', '/profile', '/kyc-bill', '/tracker', '/helpdesk'],
    helpdeskCategories: ['Power Failure', 'Voltage Issue', 'Billing Issue', 'Meter Fault'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: true, showPhysicalMeter: true },
      timeline: { visible: false, title: "" },
      energy: { visible: true, title: "Energy Usage Preview" },
      stats: { visible: true, title: "Overview", fields: ['kyc_status', 'complaints', 'energy_usage', 'connection_status'] },
      notifications: { visible: true, title: "System Notifications" },
      rejectionReason: { visible: false, title: "" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['raise_complaint', 'energy_dashboard', 'view_bills'] }
    }
  },

  [LIFECYCLE_STATES.REJECTED]: {
    pageTitle: "Application Rejected",
    statusBadge: { text: "Rejected", color: "red", show: true },
    allowedNavigation: ['/homepage', '/profile', '/apply'],
    helpdeskCategories: ['Rejection Appeal', 'Document Clarification'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: false, showPhysicalMeter: false },
      timeline: { visible: false, title: "" },
      energy: { visible: false, title: "" },
      stats: { visible: false, title: "" },
      notifications: { visible: false, title: "" },
      rejectionReason: { visible: true, title: "Rejection Details" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['apply_connection'] }
    }
  },

  [LIFECYCLE_STATES.WITHDRAWN]: {
    pageTitle: "Application Withdrawn",
    statusBadge: { text: "Withdrawn", color: "orange", show: true },
    allowedNavigation: ['/homepage', '/profile', '/apply', '/application-tracker'],
    helpdeskCategories: ['New Application Info', 'Account Query'],
    widgets: {
      accountSummary: { visible: true, title: "Account Summary", showAppId: true, showConsumerId: false, showPhysicalMeter: false },
      timeline: { visible: true, title: "Application Timeline" },
      energy: { visible: false, title: "" },
      stats: { visible: false, title: "" },
      notifications: { visible: false, title: "" },
      rejectionReason: { visible: false, title: "" },
      withdrawalInfo: { visible: true, title: "Withdrawal Details" },
      quickActions: { visible: true, title: "Quick Actions", actions: ['apply_connection', 'view_previous_application'] }
    }
  }
};
