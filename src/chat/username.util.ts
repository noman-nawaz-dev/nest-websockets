/**
 * Utility for generating unique usernames for chat participants
 */

const availableNames = [
  'Bilal',
  'Noman',
  'Azeem',
  'Khuzaima',
  'Ahmed',
  'Ali',
  'Hassan',
  'Usman',
  'Hamza',
  'Zain',
  'Fahad',
  'Saad',
  'Omar',
  'Ibrahim',
  'Yousuf',
  'Haris',
  'Adnan',
  'Imran',
  'Tariq',
  'Shahid',
];

// Track used names
const usedNames = new Set<string>();

/**
 * Assigns a unique username from the available names pool
 * If all names are used, appends a number to make it unique
 * @returns A unique username
 */
export function assignUsername(): string {
  // Find first available name
  const availableName = availableNames.find((name) => !usedNames.has(name));

  if (availableName) {
    usedNames.add(availableName);
    return availableName;
  }

  // If all names are used, create numbered variants
  let counter = 1;
  let newName: string;

  do {
    const randomName =
      availableNames[Math.floor(Math.random() * availableNames.length)];
    newName = `${randomName}${counter}`;
    counter++;
  } while (usedNames.has(newName));

  usedNames.add(newName);
  return newName;
}

/**
 * Releases a username back to the available pool
 * @param username - The username to release
 */
export function releaseUsername(username: string): void {
  usedNames.delete(username);
}

/**
 * Gets all currently used usernames
 * @returns Array of used usernames
 */
export function getUsedUsernames(): string[] {
  return Array.from(usedNames);
}
