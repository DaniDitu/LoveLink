
// User Types & Roles
export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';

export type GenderType = 'MAN' | 'WOMAN' | 'COUPLE';

export type PhotoVisibility = 'PUBLIC' | 'SECRET' | 'SUPER_SECRET';

export interface GalleryPhoto {
  id: string;
  url: string;
  visibility: PhotoVisibility;
  createdAt?: string;
}

export type AccessDuration = 'PERMANENT' | '24_HOURS' | 'ONE_TIME';

export interface PhotoRequest {
  id: string;
  requesterId: string;
  requesterName: string; // Denormalized for UI
  ownerId: string;
  photoId: string;
  photoUrl: string; // Denormalized for UI preview
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  // NEW: Granular Access Control
  accessDuration?: AccessDuration;
  expiresAt?: string; // ISO Date for expiration
  viewsLeft?: number; // For ONE_TIME access
  updatedAt?: string;
}

export interface PartnerDetails {
  height?: number;
  weight?: number;
  hairColor?: string;
  eyeColor?: string;
  name?: string;
}

export interface CouplePreferences {
  man: 'HETERO' | 'GAY' | 'BISEXUAL';
  woman: 'HETERO' | 'GAY' | 'BISEXUAL';
}

export interface User {
  uid: string;
  email: string;
  password?: string; // Stored for the "Delete Account" verification simulation
  role: UserRole;
  tenantId?: string | null; // Null for SuperAdmins (Fix for Firestore undefined error)
  displayName: string;
  photoURL?: string;
  photos?: string[]; // Deprecated: Legacy array of strings
  gallery?: GalleryPhoto[]; // NEW: Tiered gallery system
  
  // Status for moderation
  // DELETED = Soft delete by user (invisible to app, visible to Admin)
  status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';

  // Dating Profile Specifics (only for role='USER')
  type?: GenderType;
  lookingFor?: GenderType[];
  sexualOrientation?: 'HETERO' | 'GAY' | 'BISEXUAL'; // NEW: Explicit orientation
  couplePreferences?: CouplePreferences; // NEW: Specific preferences for couples (Man/Woman)
  
  bio?: string;
  age?: number;
  location?: string; // General display string
  city?: string;     // Specific City for search
  region?: string;   // Specific Region for search
  isVerified?: boolean;
  joinedAt?: string; // ISO Date string for "New" badge logic
  lastActiveAt?: string; // NEW: ISO Date string for Presence System

  // Physical Attributes & Details (Partner 1 or Single User)
  height?: number; // in cm
  weight?: number; // in kg
  hairColor?: string;
  eyeColor?: string;
  
  // Couple Specifics (Partner 2)
  partnerDetails?: PartnerDetails;

  // Interests/Tags
  interests?: string[];

  // Privacy & Visibility
  blockedUserIds?: string[]; // List of UIDs this user does not want to be visible to
  likedUserIds?: string[];   // List of UIDs this user has liked (Outgoing likes)
}

// NUEVO: Sistema de Inserciones Publicitarias
export interface Insertion {
  id: string;
  title: string;        // Se mapea a displayName de la tarjeta
  subtitle: string;     // Se mapea a la ubicación/badge (ej: "Sponsor")
  description: string;   // Se mapea a la bio
  imageUrl: string;
  externalLink: string;
  buttonText: string;    // Texto del botón de acción
  isActive: boolean;
  tenantId: string | 'GLOBAL'; // Visibilidad global o específica
  createdAt: string;
  priority?: number;     // Para ordenación
  
  // Expiration & Social
  startDate?: string; // ISO Date string
  endDate?: string;   // ISO Date string
  likedUserIds?: string[]; // Users who liked this ad
}

export const isProfileComplete = (user: User): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;

  // Check mandatory fields for Main User / Partner 1
  const mainComplete = !!(
    user.height && 
    user.weight && 
    user.hairColor && 
    user.eyeColor && 
    user.interests && 
    user.interests.length > 0
  );

  if (!mainComplete) return false;

  // For Couples, check Partner 2
  if (user.type === 'COUPLE') {
    const p2 = user.partnerDetails;
    return !!(p2 && p2.height && p2.weight && p2.hairColor && p2.eyeColor);
  }

  return true;
};

export const getProfileStatus = (user: User): { status: 'COMPLETE' | 'WARNING' | 'BLOCKED', daysRemaining: number } => {
  if (user.role === 'SUPER_ADMIN') return { status: 'COMPLETE', daysRemaining: 100 };
  
  if (isProfileComplete(user)) return { status: 'COMPLETE', daysRemaining: 100 };

  // Calculate Grace Period
  const joined = user.joinedAt ? new Date(user.joinedAt).getTime() : Date.now();
  const now = Date.now();
  const diffMs = now - joined;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const gracePeriod = 12; // 12 Days Grace Period
  
  if (diffDays < gracePeriod) {
      return { status: 'WARNING', daysRemaining: gracePeriod - diffDays };
  }
  
  return { status: 'BLOCKED', daysRemaining: 0 };
};

// Chat Rules Configuration
export interface ChatSettings {
  maxConsecutiveMessages: number; // Default 2
  womenCanMessageFreely: boolean; // Default true
}

// Tenant Definition
export interface Tenant {
  id: string;
  name: string;
  domain: string; // e.g., "elite-dates", "casual-encounters"
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  subscriptionPlan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  primaryColor: string; // Theme customization
  userCount: number;
  mrr: number;
  chatSettings?: ChatSettings; // New configuration field
}

// Reporting System
export interface Report {
  id: string;
  reporterId: string;
  targetUserId: string;
  targetUserName: string;
  reason: string;
  timestamp: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  tenantId: string;
}

// System Announcements / Messages
export interface SystemMessage {
  id: string;
  title: string;
  content: string; // HTML/Rich Text
  bannerUrl?: string; // Optional Header Image
  createdAt: string;
  republishedAt?: string; // NEW: To handle "Republish" logic
  isActive: boolean;
  priority: 'INFO' | 'WARNING' | 'ALERT';
}

// System Logs
export interface AuditLog {
  id: string;
  tenantId: string | 'SYSTEM';
  action: 'LOGIN' | 'BAN' | 'CREATE_TENANT' | 'REPORT' | 'SUSPEND' | 'DELETE_USER';
  details: string;
  timestamp: string;
}

// Message Structure
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isDeleted?: boolean; // For soft delete (hiding content)
  
  // Ephemeral / Protected Media Features
  imageUrl?: string; // Explicit field for images
  selfDestruct?: 30 | 60 | null; // Seconds to destruct after viewing
  viewedAt?: string | null; // Timestamp when the receiver first saw the media
}

// Match Structure
export interface Match {
  id: string;
  users: [string, string]; // UIDs
  tenantId: string;
  matchedAt: string;
  lastMessage?: string;
}

// --- CMS / LANDING PAGE CONFIG ---
export interface SuccessStory {
  id: string;
  names: string;
  quote: string;
  image: string;
  tag: string; // e.g., "Sposati nel 2023"
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface HeroButton {
  id: string;
  text: string;
  url: string;
  style: 'PRIMARY' | 'SECONDARY' | 'OUTLINE';
}

export interface FeatureItem {
  id: string;
  icon: 'SHIELD' | 'HEART' | 'GLOBE' | 'ZAP' | 'SMARTPHONE' | 'MESSAGE' | 'LOCK' | 'SEARCH' | 'USERS';
  title: string;
  description: string;
}

export interface LandingPageConfig {
  // Navigation
  navLoginVisible?: boolean; // Toggle "Accedi" in Navbar
  navRegisterVisible?: boolean; // Toggle "Registrati" in Navbar

  // Hero Section
  heroVisible: boolean; // Toggle entire section
  heroTitle: string;
  heroSubtitle: string;
  heroButtons: HeroButton[]; // Dynamic buttons array
  heroImageRight: string; // Top right blob
  heroImageLeft: string; // Bottom left blob
  
  // Auth Card Customization
  authCardVisible: boolean; // NEW: Toggle Auth Card visibility
  authCardTitle: string;
  authCardSubtitle: string;
  authButtonText: string;

  // Features Section (NEW)
  featuresVisible: boolean;
  featuresTitle: string;
  features: FeatureItem[];

  // Success Stories Section
  storiesVisible: boolean;
  storiesTitle: string;
  storiesCtaText: string;
  successStories: SuccessStory[];

  // App Install Section
  appVisible: boolean;
  appTitle: string;
  appSubtitle: string;
  
  // Footer Section
  footerVisible: boolean;
  footerColumns: FooterColumn[];
  
  // Ordering: Which section appears first
  sectionOrder: ('STORIES' | 'APP' | 'FEATURES')[];
}
