export interface MenuItem {
  label: string;
  url: string;
}

export const menuItems: MenuItem[] = [
  { label: 'Expense Tracker', url: '/expenseTracker' },
  { label: 'Financial Analysis', url: '/financialAnalysis' },
  { label: 'Currency Converter', url: '/currencyConverter' },
  { label: 'Financial Tips', url: '/financialTips' },
  { label: 'About', url: '/about' },
  { label: 'Logout', url: '/logout' },
];

