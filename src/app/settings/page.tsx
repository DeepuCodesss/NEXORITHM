"use client";

import { useEffect, useState, useRef } from "react";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  ShieldAlert,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  GraduationCap,
  Trophy,
  Bell,
  Shield,
  Paintbrush,
  Camera,
  Trash2,
  RotateCcw,
  Upload,
  UserCheck,
  Check,
  Key,
  Download,
  AlertTriangle,
  Smartphone,
  Laptop,
  Search,
  Sparkles,
  Info
} from "lucide-react";

const AVATAR_GRADIENTS = [
  "from-[#F97316] via-[#FB7185] to-[#8B5CF6]",
  "from-[#8B5CF6] via-[#06B6D4] to-[#22C55E]",
  "from-[#0EA5E9] via-[#6366F1] to-[#A78BFA]",
  "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
  "from-[#22C55E] via-[#14B8A6] to-[#38BDF8]",
  "from-[#EC4899] via-[#8B5CF6] to-[#06B6D4]",
];

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "?";
}

function getThemeById(themeId?: string) {
  const themes: Record<string, string> = {
    violet: AVATAR_GRADIENTS[0],
    aurora: AVATAR_GRADIENTS[1],
    sky: AVATAR_GRADIENTS[2],
    sunset: AVATAR_GRADIENTS[3],
    mint: AVATAR_GRADIENTS[4],
    rose: AVATAR_GRADIENTS[5],
  };
  return themes[themeId || "violet"] || AVATAR_GRADIENTS[0];
}

// Top 30 Colleges list for searchable autocomplete
const TOP_COLLEGES = [
  "Indian Institute of Technology, Bombay (IITB)",
  "Indian Institute of Technology, Delhi (IITD)",
  "Indian Institute of Technology, Madras (IITM)",
  "Indian Institute of Technology, Kanpur (IITK)",
  "Indian Institute of Technology, Kharagpur (IITKGP)",
  "Indian Institute of Technology, Roorkee (IITR)",
  "Indian Institute of Technology, Guwahati (IITG)",
  "Indian Institute of Science, Bangalore (IISc)",
  "Birla Institute of Technology and Science, Pilani (BITS Pilani)",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "International Institute of Information Technology, Hyderabad (IIITH)",
  "International Institute of Information Technology, Bangalore (IIITB)",
  "National Institute of Technology, Trichy (NIT Trichy)",
  "National Institute of Technology, Surathkal (NIT Surathkal)",
  "Vellore Institute of Technology (VIT)",
  "SRM Institute of Science and Technology",
  "Manipal Institute of Technology (MIT)",
  "GLA University",
  "Lovely Professional University (LPU)",
  "Amity University",
  "Stanford University",
  "Massachusetts Institute of Technology (MIT)",
  "Harvard University",
  "California Institute of Technology (Caltech)",
  "Carnegie Mellon University (CMU)",
  "Oxford University",
  "Cambridge University",
  "National University of Singapore (NUS)",
  "Nanyang Technological University (NTU)"
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Singapore", 
  "Australia", "Germany", "Japan", "France", "Netherlands", "United Arab Emirates"
];

export default function SettingsPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { session: currentSession } = useSession();
  const { signOut: clerkSignOut } = useClerk();
  const { user: dbUser, signOut } = useApp();
  const router = useRouter();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "education" | "coding" | "notifications" | "security" | "appearance" | "danger"
  >("profile");

  // Global Status State
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Avatar Management States
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  // 1. Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  // Auto-resize biography textarea dynamically
  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = "auto";
      bioRef.current.style.height = `${bioRef.current.scrollHeight}px`;
    }
  }, [bio]);

  // Instant Username Check States
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");

  // 2. Education fields
  const [college, setCollege] = useState("");
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [collegeFocused, setCollegeFocused] = useState(false);
  const [graduationYear, setGraduationYear] = useState("");
  const [country, setCountry] = useState("");

  // 3. Competitive Coding fields
  const [preferredLanguage, setPreferredLanguage] = useState("C++");
  const [publicProfile, setPublicProfile] = useState(true);
  const [showCollege, setShowCollege] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // 4. Notifications fields
  const [dailyMission, setDailyMission] = useState(true);
  const [weeklyMission, setWeeklyMission] = useState(true);
  const [contestReminders, setContestReminders] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [pushSupported, setPushSupported] = useState(true);

  // 5. Security fields
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // 6. Appearance settings (Applied locally & stored in metadata)
  const [themeSetting] = useState("dark"); // Locked to premium dark
  const [uiAnimations, setUiAnimations] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
  const [cardHoverEffects, setCardHoverEffects] = useState(true);

  // 7. Danger Zone fields
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Save States (idle | saving | saved)
  const [profileSaveState, setProfileSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [educationSaveState, setEducationSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [codingSaveState, setCodingSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [notificationsSaveState, setNotificationsSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [appearanceSaveState, setAppearanceSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [passwordSaveState, setPasswordSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Load state from Clerk and Database User
  useEffect(() => {
    if (!clerkUser || !dbUser) return;

    setFirstName(clerkUser.firstName || "");
    setLastName(clerkUser.lastName || "");
    setUsername(clerkUser.username || "");
    setBio(dbUser.bio || "");
    setWebsite(dbUser.website || "");
    setGithub(dbUser.github || "");
    setLinkedin(dbUser.linkedin || "");
    setTwitter(dbUser.twitter || "");

    setCollege(dbUser.college || "");
    setCollegeSearchQuery(dbUser.college || "");
    setGraduationYear(dbUser.graduationYear || "");
    setCountry(dbUser.country || "");

    setPreferredLanguage(dbUser.preferredLanguage || "C++");
    setPublicProfile(dbUser.publicProfile !== false);
    setShowCollege(dbUser.showCollege !== false);
    setShowStats(dbUser.showStats !== false);

    const meta = (clerkUser.unsafeMetadata || {}) as {
      dailyMission?: boolean;
      weeklyMission?: boolean;
      contestReminders?: boolean;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      twoFactorEnabled?: boolean;
      uiAnimations?: boolean;
      reduceMotion?: boolean;
      compactLayout?: boolean;
      cardHoverEffects?: boolean;
    };

    setDailyMission(meta.dailyMission !== false);
    setWeeklyMission(meta.weeklyMission !== false);
    setContestReminders(meta.contestReminders !== false);
    setEmailNotifications(meta.emailNotifications !== false);
    setPushNotifications(meta.pushNotifications !== false);

    setTwoFactorEnabled(meta.twoFactorEnabled || false);
    setUiAnimations(meta.uiAnimations !== false);
    setReduceMotion(meta.reduceMotion || false);
    setCompactLayout(meta.compactLayout || false);
    setCardHoverEffects(meta.cardHoverEffects !== false);

    // Push notification support check
    setPushSupported("Notification" in window);
  }, [clerkUser, dbUser]);

  // Load Clerk Active Sessions
  const fetchClerkSessions = async () => {
    if (!clerkUser) return;
    setLoadingSessions(true);
    try {
      const activeSessions = await clerkUser.getSessions();
      setSessions(activeSessions);
    } catch (err) {
      console.error("Failed to load active sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (clerkUser && activeTab === "security") {
      void fetchClerkSessions();
    }
  }, [clerkUser, activeTab]);

  // Instant username availability checker (debounced)
  useEffect(() => {
    if (!username || username === clerkUser?.username) {
      setUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,25}$/.test(username)) {
      setUsernameAvailable(false);
      setUsernameError("Username must be 3-25 alphanumeric characters or underscores.");
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username.toLowerCase())}`);
        const data = await res.json();
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameError("");
        } else {
          setUsernameAvailable(false);
          setUsernameError(data.error || "Username is taken.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, clerkUser]);

  // Flash a status message and auto-hide
  const triggerStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => {
      setStatus(null);
    }, 5000);
  };

  // Safe Clerk Error Handler to prevent exposing stack traces or raw Clerk components
  const handleClerkError = (err: unknown) => {
    console.error(err);
    const clerkErr = err as { errors?: { code?: string; message?: string; longMessage?: string }[] };
    
    if (clerkErr.errors && clerkErr.errors.length > 0) {
      const errorObj = clerkErr.errors[0];
      if (errorObj.code === "needs_reverification" || errorObj.message?.toLowerCase().includes("verification")) {
        triggerStatus("error", "Security verification required. Please log out and sign in again to modify sensitive profile credentials.");
        return;
      }
      triggerStatus("error", errorObj.longMessage || errorObj.message || "An authentication error occurred.");
    } else {
      triggerStatus("error", "Failed to update profile settings. Connection reset.");
    }
  };

  const isProfileChanged = 
    firstName.trim() !== (clerkUser?.firstName || "") ||
    lastName.trim() !== (clerkUser?.lastName || "") ||
    username.trim().toLowerCase() !== (clerkUser?.username || "") ||
    bio.trim() !== (dbUser?.bio || "") ||
    website.trim() !== (dbUser?.website || "") ||
    github.trim() !== (dbUser?.github || "") ||
    linkedin.trim() !== (dbUser?.linkedin || "") ||
    twitter.trim() !== (dbUser?.twitter || "");

  const isEducationChanged =
    college.trim() !== (dbUser?.college || "") ||
    graduationYear !== (dbUser?.graduationYear || "") ||
    country !== (dbUser?.country || "");

  const isCodingChanged =
    preferredLanguage !== (dbUser?.preferredLanguage || "C++") ||
    publicProfile !== dbUser?.publicProfile ||
    showCollege !== dbUser?.showCollege ||
    showStats !== dbUser?.showStats;

  const isNotificationsChanged = () => {
    if (!clerkUser) return false;
    const meta = (clerkUser.unsafeMetadata || {}) as any;
    return (
      dailyMission !== (meta.dailyMission !== false) ||
      weeklyMission !== (meta.weeklyMission !== false) ||
      contestReminders !== (meta.contestReminders !== false) ||
      emailNotifications !== (meta.emailNotifications !== false) ||
      pushNotifications !== (meta.pushNotifications !== false)
    );
  };

  const isAppearanceChanged = () => {
    if (!clerkUser) return false;
    const meta = (clerkUser.unsafeMetadata || {}) as any;
    return (
      uiAnimations !== (meta.uiAnimations !== false) ||
      reduceMotion !== (meta.reduceMotion || false) ||
      compactLayout !== (meta.compactLayout || false) ||
      cardHoverEffects !== (meta.cardHoverEffects !== false)
    );
  };

  // --- HANDLERS ---

  // 1. Save Profile Settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      triggerStatus("error", "First name and Last name cannot be empty.");
      return;
    }
    if (usernameAvailable === false) {
      triggerStatus("error", "Please select an available username.");
      return;
    }

    setProfileSaveState("saving");
    try {
      // Step A: Only update Clerk if name or username actually changed
      const clerkFieldsChanged =
        firstName.trim() !== (clerkUser?.firstName || "") ||
        lastName.trim() !== (clerkUser?.lastName || "") ||
        username.trim().toLowerCase() !== (clerkUser?.username || "");

      if (clerkFieldsChanged && clerkUser) {
        const clerkUpdates: { firstName?: string; lastName?: string; username?: string } = {};
        if (firstName.trim() !== (clerkUser.firstName || "")) clerkUpdates.firstName = firstName.trim();
        if (lastName.trim() !== (clerkUser.lastName || "")) clerkUpdates.lastName = lastName.trim();
        if (username.trim().toLowerCase() !== (clerkUser.username || "")) clerkUpdates.username = username.trim().toLowerCase();
        
        if (Object.keys(clerkUpdates).length > 0) {
          await clerkUser.update(clerkUpdates);
        }
      }

      // Step B: Always sync DB fields (bio, social links)
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim(),
          website: website.trim(),
          github: github.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile database record.");
      }

      setProfileSaveState("saved");
      triggerStatus("success", "Profile synced successfully.");
      setTimeout(() => setProfileSaveState("idle"), 1500);
    } catch (err: unknown) {
      setProfileSaveState("idle");
      handleClerkError(err);
    }
  };

  // 2. Save Education Settings
  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEducationSaveState("saving");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          college: college.trim(),
          graduationYear: graduationYear.trim(),
          country: country.trim()
        }),
      });
      const dbData = await res.json();

      if (!res.ok || !dbData.success) {
        throw new Error(dbData.error || "Failed to sync academic info.");
      }

      setEducationSaveState("saved");
      triggerStatus("success", "Academic credentials updated.");
      setTimeout(() => setEducationSaveState("idle"), 1500);
    } catch (err: unknown) {
      setEducationSaveState("idle");
      triggerStatus("error", err instanceof Error ? err.message : "Failed to update education details.");
    }
  };

  // 3. Save Competitive Coding Settings
  const handleSaveCoding = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodingSaveState("saving");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredLanguage,
          publicProfile,
          showCollege,
          showStats
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update coding preferences.");
      }

      setCodingSaveState("saved");
      triggerStatus("success", "Competitive coding environment updated.");
      setTimeout(() => setCodingSaveState("idle"), 1500);
    } catch (err) {
      console.error(err);
      setCodingSaveState("idle");
      triggerStatus("error", "Failed to save settings.");
    }
  };

  // 4. Save Notifications Settings
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationsSaveState("saving");

    try {
      await clerkUser?.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          dailyMission,
          weeklyMission,
          contestReminders,
          emailNotifications,
          pushNotifications: pushSupported ? pushNotifications : false
        }
      });

      setNotificationsSaveState("saved");
      triggerStatus("success", "Notification channels saved.");
      setTimeout(() => setNotificationsSaveState("idle"), 1500);
    } catch (err: unknown) {
      setNotificationsSaveState("idle");
      handleClerkError(err);
    }
  };

  // 5. Change Password (Email/Password Accounts Only)
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerStatus("error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      triggerStatus("error", "New password must be at least 8 characters.");
      return;
    }

    setPasswordSaveState("saving");
    try {
      await clerkUser?.updatePassword({
        currentPassword,
        newPassword
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaveState("saved");
      triggerStatus("success", "Account credentials updated successfully.");
      setTimeout(() => setPasswordSaveState("idle"), 1500);
    } catch (err: unknown) {
      setPasswordSaveState("idle");
      handleClerkError(err);
    }
  };

  // 6. Save Appearance Settings
  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceSaveState("saving");

    try {
      await clerkUser?.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          uiAnimations,
          reduceMotion,
          compactLayout,
          cardHoverEffects
        }
      });

      // Apply effects globally to Document
      if (typeof window !== "undefined") {
        const bodyClass = document.body.classList;
        
        if (reduceMotion) {
          bodyClass.add("reduce-motion");
          const style = document.createElement("style");
          style.id = "reduce-motion-style";
          style.innerHTML = "* { transition: none !important; animation: none !important; }";
          document.head.appendChild(style);
        } else {
          bodyClass.remove("reduce-motion");
          document.getElementById("reduce-motion-style")?.remove();
        }

        if (compactLayout) {
          bodyClass.add("compact-density");
        } else {
          bodyClass.remove("compact-density");
        }
      }

      setAppearanceSaveState("saved");
      triggerStatus("success", "Aesthetic layout settings saved.");
      setTimeout(() => setAppearanceSaveState("idle"), 1500);
    } catch (err: unknown) {
      setAppearanceSaveState("idle");
      handleClerkError(err);
    }
  };

  // --- AVATAR IMAGE UTILITIES WITH AUTO-CROP ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      triggerStatus("error", "Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageToCrop(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Crop dynamic rectangular images to square bounds using Canvas API
  const cropImageToSquare = (imageUrl: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        // Center crop calculation
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            resolve(file);
          } else {
            reject(new Error("Canvas conversion to Blob failed"));
          }
        }, "image/jpeg", 0.9);
      };
      img.onerror = () => reject(new Error("Failed to load image for cropping"));
    });
  };

  const handleUploadPhoto = async () => {
    if (!imageToCrop) return;
    setCropping(true);

    try {
      // 1. Crop image automatically
      const croppedFile = await cropImageToSquare(imageToCrop);

      // 2. Upload to Clerk
      await clerkUser?.setProfileImage({ file: croppedFile });
      const updatedClerkUrl = clerkUser?.imageUrl || "";

      // 3. Sync to Database profile
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: updatedClerkUrl, avatarMode: "image" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to sync avatar to database.");
      }

      setImageToCrop(null);
      setAvatarModalOpen(false);
      triggerStatus("success", "Avatar image cropped and updated.");
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      triggerStatus("error", "Failed to crop and upload avatar.");
    } finally {
      setCropping(false);
    }
  };

  const handleRemovePhoto = async () => {
    setLoading(true);
    setAvatarModalOpen(false);

    try {
      await clerkUser?.setProfileImage({ file: null });

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "/default-avatar.svg", avatarMode: "image" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove database profile picture.");
      }

      triggerStatus("success", "Avatar reverted to premium default.");
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      triggerStatus("error", "Failed to delete avatar picture.");
    }
  };

  const handleRestoreDefault = async () => {
    setLoading(true);
    setAvatarModalOpen(false);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: "/default-avatar.svg", avatarMode: "image" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to restore default avatar.");
      }

      triggerStatus("success", "Premium default avatar restored.");
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
      triggerStatus("error", "Failed to reset avatar.");
    }
  };

  // --- DANGER ZONE ACTIONS ---

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          avatarUrl: dbUser.avatarUrl,
          username: dbUser.username,
          fullName: dbUser.fullName,
          email: dbUser.email,
          college: dbUser.college,
          graduationYear: dbUser.graduationYear,
          country: dbUser.country,
          preferredLanguage: dbUser.preferredLanguage,
          solvedCount: dbUser.solvedProblemIds.length,
          stats: {
            xp: dbUser.xp,
            coins: dbUser.coins,
            reputation: dbUser.reputation,
            devRank: dbUser.devRank,
            currentStreak: dbUser.currentStreak
          }
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexorithm_${dbUser.username}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerStatus("success", "Real profile logs exported successfully.");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      triggerStatus("error", "Please type DELETE to confirm account removal.");
      return;
    }
    setDeleteModalOpen(false);
    triggerStatus("error", "Simulated Account Deletion: Account purging is locked on staging environments.");
  };

  // Revoke Session Handler
  const handleRevokeSession = async (sess: any) => {
    try {
      await sess.revoke();
      triggerStatus("success", "Workspace session revoked.");
      void fetchClerkSessions();
    } catch (err) {
      console.error(err);
      triggerStatus("error", "Failed to revoke session.");
    }
  };

  // First name inputs validation (filter character keying)
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[a-zA-Z\s-]*$/.test(val)) {
      setFirstName(val);
    }
  };

  // College search autocomplete selection helper
  const filteredColleges = collegeSearchQuery.trim()
    ? TOP_COLLEGES.filter((c) => c.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
    : TOP_COLLEGES;

  // Constants
  if (!isLoaded || !clerkUser || !dbUser) {
    return (
      <div className="app-shell flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const displayAvatar = dbUser.avatarUrl && !dbUser.avatarUrl.includes("dicebear.com") ? dbUser.avatarUrl : "/default-avatar.svg";
  const showInitials = dbUser.avatarMode === "initials";
  const initialsText = getInitials(dbUser.fullName || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "Nexorithm Coder");
  const initialsTheme = getThemeById(dbUser.avatarTheme);
  const isGoogleAccount = clerkUser.externalAccounts.some((acc) => acc.provider === "google");
  const joinedDate = clerkUser.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "June 2026";

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "coding", label: "Competitive Coding", icon: Trophy },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, color: "text-red-500 hover:text-red-400" }
  ] as const;

  return (
    <div className="app-shell pb-16">
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* Settings Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E2736] pb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Settings
            </h1>
            <p className="mt-1.5 text-xs text-secondary-text">
              Configure profile metadata, language preferences, notification settings, and authentication sessions.
            </p>
          </div>
          
          {/* Account Status Box */}
          <div className="flex gap-4 items-center bg-[#111827]/60 border border-[#1E2736] px-4 py-2.5 rounded-xl">
            <div className="px-1 text-left">
              <span className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider">Account Status</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                <Check className="h-3 w-3" /> Verified
              </span>
            </div>
            <div className="h-7 w-[1px] bg-[#1E2736]" />
            <div className="px-1 text-left">
              <span className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider">Tier</span>
              <span className="text-xs font-bold text-white mt-0.5">{dbUser.isPro ? "Pro Member" : "Standard"}</span>
            </div>
            <div className="h-7 w-[1px] bg-[#1E2736]" />
            <div className="px-1 text-left">
              <span className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider">Member Since</span>
              <span className="text-xs font-mono text-secondary-text mt-0.5">{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Global Toast Alert */}
        {status && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border p-4 text-xs shadow-2xl max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              status.type === "success"
                ? "border-success/20 bg-[#161B22] text-success"
                : "border-primary/20 bg-[#161B22] text-primary"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
            )}
            <div>
              <p className="font-bold">{status.type === "success" ? "Success" : "Security Notice"}</p>
              <p className="mt-0.5 text-secondary-text leading-relaxed">{status.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 items-start">
          
          {/* LEFT SIDEBAR: Sticky, height fits elements */}
          <nav className="flex flex-row md:flex-col space-y-0 md:space-y-1 gap-1 md:gap-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:col-span-1 md:sticky md:top-20">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setStatus(null);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/10"
                      : item.id === "danger"
                      ? `${item.color} bg-red-950/5 border border-red-950/20`
                      : "text-secondary-text hover:text-white hover:bg-hover"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT CONTENT PANEL */}
          <div className="md:col-span-3">
            
            {/* PROFILE PANEL */}
            {activeTab === "profile" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                  <User className="h-4.5 w-4.5 text-primary" />
                  Profile details
                </h2>

                {/* Avatar Display */}
                <div className="mb-6 flex items-center gap-5 p-4 rounded-xl bg-black/10 border border-[#1E2736]">
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 rounded-full border border-border bg-[#1C2230] overflow-hidden flex items-center justify-center">
                      {showInitials ? (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${initialsTheme} text-white text-base font-black leading-none`}>
                          {initialsText}
                        </div>
                      ) : (
                        <Image
                          src={displayAvatar}
                          alt="User avatar"
                          width={64}
                          height={64}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    {/* Floating camera button */}
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="absolute -bottom-1 -right-1 flex h-6.5 w-6.5 items-center justify-center rounded-full border border-[#1E2736] bg-primary text-white shadow-md hover:scale-105 transition-transform"
                      title="Manage Avatar"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Avatar image</h3>
                    <p className="text-[10px] text-secondary-text mt-1 max-w-md">
                      Customize your account image. Reverts automatically to the premium default faceless avatar if removed.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        required
                        className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-secondary-text">@</span>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="subtle-input h-10 w-full rounded-xl pl-8 pr-8 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        placeholder="username"
                      />
                      <div className="absolute right-3.5 top-3 flex items-center">
                        {isCheckingUsername && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                        {!isCheckingUsername && usernameAvailable === true && <Check className="h-4.5 w-4.5 text-emerald-500" />}
                        {!isCheckingUsername && usernameAvailable === false && <AlertCircle className="h-4.5 w-4.5 text-red-500" />}
                      </div>
                    </div>
                    {usernameError && (
                      <p className="mt-1.5 text-[10px] text-red-500 font-semibold">{usernameError}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="bio" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text">
                        Biography
                      </label>
                      <span className="text-[9px] font-mono text-secondary-text">{bio.length} / 160</span>
                    </div>
                    <textarea
                      id="bio"
                      ref={bioRef}
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      maxLength={160}
                      rows={2}
                      className="subtle-input w-full rounded-xl p-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none leading-relaxed overflow-hidden"
                      placeholder="Write a brief profile biography..."
                    />
                  </div>

                  <div className="h-[1px] bg-[#1E2736] my-4" />

                  {/* Social Profiles */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Social Profiles</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="website" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          Website URL
                        </label>
                        <input
                          id="website"
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="github" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          GitHub Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-secondary-text">@</span>
                          <input
                            id="github"
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value.replace(/^@/, ""))}
                            className="subtle-input h-10 w-full rounded-xl pl-8 pr-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                            placeholder="username"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="linkedin" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          id="linkedin"
                          type="text"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label htmlFor="twitter" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          X (Twitter) Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-secondary-text">@</span>
                          <input
                            id="twitter"
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                            className="subtle-input h-10 w-full rounded-xl pl-8 pr-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaveState !== "idle" || !isProfileChanged || usernameAvailable === false}
                      className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                        profileSaveState === "saved" 
                          ? "bg-emerald-600 text-white" 
                          : "btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {profileSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {profileSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                      {profileSaveState === "saving" ? "Saving..." : profileSaveState === "saved" ? "Saved ✓" : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* EDUCATION PANEL */}
            {activeTab === "education" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                  <GraduationCap className="h-4.5 w-4.5 text-primary" />
                  Academic profile
                </h2>

                <form onSubmit={handleSaveEducation} className="space-y-4">
                  <div className="relative">
                    <label htmlFor="college" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                      College / University
                    </label>
                    <div className="relative">
                      <input
                        id="college"
                        type="text"
                        value={collegeSearchQuery}
                        onChange={(e) => {
                          setCollegeSearchQuery(e.target.value);
                          setCollege(e.target.value);
                        }}
                        onFocus={() => setCollegeFocused(true)}
                        onBlur={() => setTimeout(() => setCollegeFocused(false), 200)}
                        required
                        className="subtle-input h-10 w-full rounded-xl pl-9 pr-4 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        placeholder="Search or enter college..."
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-text" />
                    </div>

                    {/* Autocomplete dropdown suggestions */}
                    {collegeFocused && filteredColleges.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#2A3242] bg-[#0F1117] shadow-2xl custom-scrollbar">
                        {filteredColleges.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onMouseDown={() => {
                              setCollege(col);
                              setCollegeSearchQuery(col);
                              setCollegeFocused(false);
                            }}
                            className="flex w-full items-center px-4 py-2.5 text-left text-xs text-white hover:bg-hover border-b border-border/10 last:border-b-0"
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gradYear" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                        Graduation Year
                      </label>
                      <select
                        id="gradYear"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 6 - i).map((y) => (
                          <option key={y} value={y.toString()}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                        Country
                      </label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                      >
                        <option value="">Select Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={educationSaveState !== "idle" || !isEducationChanged}
                      className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                        educationSaveState === "saved" 
                          ? "bg-emerald-600 text-white" 
                          : "btn-primary disabled:opacity-40"
                      }`}
                    >
                      {educationSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {educationSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                      {educationSaveState === "saving" ? "Saving..." : educationSaveState === "saved" ? "Saved ✓" : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* COMPETITIVE CODING PANEL */}
            {activeTab === "coding" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                  <Trophy className="h-4.5 w-4.5 text-primary" />
                  Competitive coding settings
                </h2>

                <form onSubmit={handleSaveCoding} className="space-y-5">
                  <div>
                    <label htmlFor="language" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                      Preferred Programming Language
                    </label>
                    <select
                      id="language"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                    >
                      <option value="C++">C++</option>
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                    </select>
                    <p className="mt-2 text-[10px] text-secondary-text">
                      This updates the default workspace editor language across all problems.
                    </p>
                  </div>

                  <div className="h-[1px] bg-[#1E2736]" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & visibility</h3>
                    
                    {/* Toggle: Public Profile */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Public Profile</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Render performance metrics and solving history on public views.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPublicProfile(!publicProfile)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          publicProfile ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            publicProfile ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Show College */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Show College Info</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Reveal college rankings next to user identifiers.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCollege(!showCollege)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          showCollege ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showCollege ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Show Stats */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Show Detailed Statistics</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Expose code runtime rankings and streak counters.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowStats(!showStats)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          showStats ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showStats ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={codingSaveState !== "idle" || !isCodingChanged}
                      className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                        codingSaveState === "saved" 
                          ? "bg-emerald-600 text-white" 
                          : "btn-primary disabled:opacity-40"
                      }`}
                    >
                      {codingSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {codingSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                      {codingSaveState === "saving" ? "Saving..." : codingSaveState === "saved" ? "Saved ✓" : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* NOTIFICATIONS PANEL */}
            {activeTab === "notifications" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                  <Bell className="h-4.5 w-4.5 text-primary" />
                  Notifications & alerts
                </h2>

                <form onSubmit={handleSaveNotifications} className="space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mission updates</h3>

                    {/* Toggle: Daily Mission */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Daily Mission Alerts</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Ping when new daily problems and xp multipliers are online.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDailyMission(!dailyMission)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          dailyMission ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            dailyMission ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Weekly Mission */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Weekly Mission Summaries</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Notify before weekly epic reward chests and contests expire.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWeeklyMission(!weeklyMission)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          weeklyMission ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            weeklyMission ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Contest Reminders */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Contest Reminders</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Alert me 30 minutes before real-time contests begin.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setContestReminders(!contestReminders)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          contestReminders ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            contestReminders ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#1E2736]" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Channels</h3>

                    {/* Toggle: Email */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Email Notifications</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Receive summaries of contest rankings and credentials sync logs.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          emailNotifications ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            emailNotifications ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Push (Checking support) */}
                    <div className={`flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60 ${!pushSupported && "opacity-50"}`}>
                      <div>
                        <span className="block text-xs font-semibold text-white">Push Notifications</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Enable instant browser overlays for streak thresholds.</span>
                        {!pushSupported && (
                          <span className="text-[9px] text-amber-500 mt-1 block">Browser push notifications are not supported on this device/browser.</span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!pushSupported}
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          pushSupported && pushNotifications ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            pushSupported && pushNotifications ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={notificationsSaveState !== "idle" || !isNotificationsChanged()}
                      className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                        notificationsSaveState === "saved" 
                          ? "bg-emerald-600 text-white" 
                          : "btn-primary disabled:opacity-40"
                      }`}
                    >
                      {notificationsSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {notificationsSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                      {notificationsSaveState === "saving" ? "Saving..." : notificationsSaveState === "saved" ? "Saved ✓" : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* SECURITY PANEL */}
            {activeTab === "security" && (
              <div className="space-y-6">
                
                {/* Password manager panel */}
                <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                  <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                    <Key className="h-4.5 w-4.5 text-primary" />
                    Security credentials
                  </h2>

                  {isGoogleAccount ? (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                      <Info className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-white">OAuth authentication active</p>
                        <p className="mt-1 text-secondary-text leading-relaxed">
                          You signed in with Google. Password changes and multi-factor credentials are managed securely by Google.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSavePassword} className="space-y-4">
                      <div>
                        <label htmlFor="currPass" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                          Current Password
                        </label>
                        <input
                          id="currPass"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="newPass" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                            New Password
                          </label>
                          <input
                            id="newPass"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                            placeholder="Min. 8 characters"
                          />
                        </div>
                        <div>
                          <label htmlFor="confPass" className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-2">
                            Confirm New Password
                          </label>
                          <input
                            id="confPass"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-[#2A3242] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                            placeholder="Re-enter password"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={passwordSaveState !== "idle" || !newPassword.trim()}
                          className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                            passwordSaveState === "saved" 
                              ? "bg-emerald-600 text-white" 
                              : "btn-primary disabled:opacity-40"
                          }`}
                        >
                          {passwordSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {passwordSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                          {passwordSaveState === "saving" ? "Saving..." : passwordSaveState === "saved" ? "Saved ✓" : "Update credentials"}
                        </button>
                      </div>
                    </form>
                  )}
                </section>

                {/* Real Active Sessions from Clerk */}
                {sessions.length > 0 && (
                  <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                    <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                      <Shield className="h-4.5 w-4.5 text-primary" />
                      Active sessions
                    </h2>
                    <p className="text-[11px] text-secondary-text mb-6">
                      Workspace browser sessions currently authenticated on this account.
                    </p>

                    <div className="space-y-3">
                      {loadingSessions ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : (
                        sessions.map((sess) => {
                          const isCurrent = sess.id === currentSession?.id;
                          return (
                            <div key={sess.id} className="flex items-center justify-between p-3 rounded-xl border border-[#1E2736] bg-black/10">
                              <div className="flex items-center gap-3">
                                {sess.latestActivity?.isMobile ? (
                                  <Smartphone className="h-5 w-5 text-secondary-text" />
                                ) : (
                                  <Laptop className="h-5 w-5 text-primary" />
                                )}
                                <div>
                                  <span className="block text-xs font-semibold text-white">
                                    {sess.latestActivity?.browserName || "Web Browser"} on {sess.latestActivity?.osName || "Unknown OS"}
                                  </span>
                                  <span className="text-[10px] text-secondary-text leading-none mt-1 block">
                                    IP: {sess.latestActivity?.ipAddress || "Local"} • {sess.latestActivity?.country || "Localhost"}
                                  </span>
                                </div>
                              </div>
                              {isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full bg-success/15 border border-success/30 text-[9px] font-bold text-success uppercase">
                                  Current
                                </span>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => handleRevokeSession(sess)}
                                  className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* APPEARANCE PANEL */}
            {activeTab === "appearance" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-[#1E2736] bg-gradient-to-br from-[#1C2230] to-[#11151F] shadow-xl">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                  <Paintbrush className="h-4.5 w-4.5 text-primary" />
                  Appearance settings
                </h2>

                <form onSubmit={handleSaveAppearance} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary-text mb-3">
                      Theme selection
                    </label>
                    <div className="p-4 rounded-xl border border-primary bg-primary/10 flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-white">Premium Dark</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Vibrant purple flows on slate card backdrops.</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-[9px] font-bold text-white uppercase tracking-wider">
                        ✓ Current
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#1E2736]" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Aesthetic layout settings</h3>

                    {/* Toggle: UI Animations */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Interface Animations</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Enable responsive micro-animations on interactive chips.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUiAnimations(!uiAnimations)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          uiAnimations ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            uiAnimations ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Reduce Motion */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Reduce Motion</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Globally bypass transitions and spinning indicators.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReduceMotion(!reduceMotion)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          reduceMotion ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            reduceMotion ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Compact Density */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Compact Layout</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Reduce workspace padding constraints for widescreen density.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompactLayout(!compactLayout)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          compactLayout ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            compactLayout ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle: Card Hover Effects */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/10 border border-[#1E2736]/60">
                      <div>
                        <span className="block text-xs font-semibold text-white">Card Hover Effects</span>
                        <span className="text-[10px] text-secondary-text mt-0.5 block">Toggle ambient glow shadows when cursors hover over dashboard cards.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCardHoverEffects(!cardHoverEffects)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          cardHoverEffects ? "bg-primary" : "bg-[#1E2736]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            cardHoverEffects ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={appearanceSaveState !== "idle" || !isAppearanceChanged()}
                      className={`h-10 px-5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                        appearanceSaveState === "saved" 
                          ? "bg-emerald-600 text-white" 
                          : "btn-primary disabled:opacity-40"
                      }`}
                    >
                      {appearanceSaveState === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {appearanceSaveState === "saved" && <Check className="h-3.5 w-3.5" />}
                      {appearanceSaveState === "saving" ? "Saving..." : appearanceSaveState === "saved" ? "Saved ✓" : "Save preferences"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* DANGER ZONE PANEL */}
            {activeTab === "danger" && (
              <section className="surface-panel rounded-2xl p-6 md:p-8 border border-red-900/40 bg-red-950/5 shadow-xl">
                <h2 className="text-lg font-black text-red-500 flex items-center gap-2 mb-6">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                  Danger zone
                </h2>

                <div className="space-y-4">
                  {/* Real Export log */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#1E2736] bg-black/25">
                    <div>
                      <span className="block text-xs font-bold text-white">Export profile data</span>
                      <span className="text-[10px] text-secondary-text mt-0.5 block">
                        Download your database configurations, solved counts, and levels in a single JSON block.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-bold text-white hover:bg-hover shrink-0 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-primary" />
                      Export data
                    </button>
                  </div>

                  {/* Account Deletion */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-950 bg-red-950/10">
                    <div>
                      <span className="block text-xs font-bold text-red-500">Delete Account</span>
                      <span className="text-[10px] text-secondary-text mt-0.5 block">
                        Permanently delete your profile and resolve history. This cannot be undone.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmText("");
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shrink-0 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete account
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>

      {/* MODAL: PROFILE PICTURE UTILITIES WITH PRE-CROP PREVIEW */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#1E2736] bg-[#11151F] p-6 shadow-2xl text-center">
            
            {imageToCrop ? (
              // Crop View
              <div>
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Crop image</h3>
                <p className="text-[10px] text-secondary-text mb-4 leading-relaxed">
                  Confirm square coordinates before uploading your avatar.
                </p>
                
                {/* Circle viewport cropping preview */}
                <div className="mx-auto h-40 w-40 rounded-full border border-primary/40 bg-black/20 overflow-hidden flex items-center justify-center mb-6 relative shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageToCrop}
                    alt="Preview cropping"
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-4 ring-offset-[#11151F] pointer-events-none" />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageToCrop(null)}
                    disabled={cropping}
                    className="flex-1 py-2.5 rounded-xl border border-border bg-[#0F1117] text-xs font-bold text-white hover:bg-hover disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={cropping}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {cropping && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm crop
                  </button>
                </div>
              </div>
            ) : (
              // Actions List View
              <div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Manage avatar</h3>
                <p className="text-[10px] text-secondary-text mb-6">Select an action for your account photo.</p>
                
                <div className="space-y-2.5">
                  {/* Button: Choose File */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload new photo
                  </button>
                  
                  {/* Button: Remove Photo */}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A3242] bg-[#0F1117] py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove current photo
                  </button>

                  {/* Button: Restore Default Avatar */}
                  <button
                    type="button"
                    onClick={handleRestoreDefault}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A3242] bg-[#0F1117] py-2.5 text-xs font-bold text-white hover:bg-hover transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    Restore default avatar
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(false)}
                    className="w-full text-[10px] uppercase tracking-wider text-secondary-text font-bold pt-4 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-red-950 bg-[#11151F] p-6 shadow-2xl text-center">
            <h3 className="text-sm font-bold text-red-500 mb-2 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5" /> Danger
            </h3>
            <p className="text-[11px] text-secondary-text mb-4 leading-relaxed">
              This action is permanent and cannot be undone. To proceed, please type <b className="text-white">DELETE</b> in the input below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="subtle-input h-10 w-full rounded-xl px-3.5 text-xs bg-[#0F1117] border border-red-950 text-white focus:outline-none mb-5 text-center font-bold tracking-widest"
              placeholder="type DELETE here"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-border bg-[#0F1117] text-xs font-bold text-white hover:bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-1 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
