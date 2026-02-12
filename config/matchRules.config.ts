
import { User } from '../types';

/**
 * Checks if User A and User B are a valid match based on rules.
 */
export const isMatchCompatible = (userA: User, userB: User): boolean => {
  // 1. Basic integrity checks
  if (!userA.type || !userB.type) {
    return false;
  }

  // 2. Tenant Isolation Check (Critical)
  if (!userA.tenantId || !userB.tenantId || userA.tenantId !== userB.tenantId) {
    return false;
  }

  // 3. Self Check
  if (userA.uid === userB.uid) {
    return false;
  }

  // 4. Privacy & Block Logic
  const aBlockedB = userA.blockedUserIds?.includes(userB.uid);
  const bBlockedA = userB.blockedUserIds?.includes(userA.uid);

  if (aBlockedB || bBlockedA) {
    return false;
  }

  // 5. Visibility Rule: Everyone sees Everyone within the tenant
  return true;
};

// --- PRESENCE CONFIG ---
export const ONLINE_WINDOW_MINUTES = 5; 

// Helper to determine online status
export const isUserOnline = (user: User): boolean => {
    if (!user.lastActiveAt) return false;
    const diff = Date.now() - new Date(user.lastActiveAt).getTime();
    return diff < ONLINE_WINDOW_MINUTES * 60 * 1000;
};

// Helper to create dates relative to now
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const MOCK_USERS: User[] = [];
