// Debug script to understand sorting behavior
const mockStaff = [
  {
    id: 1,
    name: 'Admin',
    hireDate: new Date('2023-01-01'), // January 1, 2023
  },
  {
    id: 2,
    name: 'Maria',
    hireDate: new Date('2023-06-01'), // June 1, 2023
  },
  {
    id: 3,
    name: 'Carlos',
    hireDate: new Date('2022-03-01'), // March 1, 2022
  },
];

console.log('Original dates:');
mockStaff.forEach(staff => {
  console.log(`${staff.name}: ${staff.hireDate.toISOString()} (Year: ${staff.hireDate.getFullYear()}, Month: ${staff.hireDate.getMonth()})`);
});

// Sort ascending (oldest first)
const ascResult = [...mockStaff].sort((a, b) => {
  const dateA = a.hireDate ? new Date(a.hireDate).getTime() : 0;
  const dateB = b.hireDate ? new Date(b.hireDate).getTime() : 0;
  return dateA - dateB;
});

console.log('\nAscending sort (oldest first):');
ascResult.forEach((staff, index) => {
  console.log(`${index}: ${staff.name}: ${staff.hireDate.toISOString()} (Year: ${staff.hireDate.getFullYear()}, Month: ${staff.hireDate.getMonth()})`);
});

// Sort descending (newest first)
const descResult = [...mockStaff].sort((a, b) => {
  const dateA = a.hireDate ? new Date(a.hireDate).getTime() : 0;
  const dateB = b.hireDate ? new Date(b.hireDate).getTime() : 0;
  return dateB - dateA;
});

console.log('\nDescending sort (newest first):');
descResult.forEach((staff, index) => {
  console.log(`${index}: ${staff.name}: ${staff.hireDate.toISOString()} (Year: ${staff.hireDate.getFullYear()}, Month: ${staff.hireDate.getMonth()})`);
});
