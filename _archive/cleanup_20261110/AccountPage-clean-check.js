import { Fragment, jsx, jsxs } from "react/jsx-runtime";
try {
  const cleanKey = "yr_storage_cleaned_v2";
  if (!localStorage.getItem(cleanKey)) {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("yr_x_") || k.startsWith("yr_user_profile_") || k === "yr_community_reports")) {
        localStorage.removeItem(k);
      }
    }
    localStorage.setItem(cleanKey, "true");
  }
} catch (_) {
}
"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserProfile, getUserPosts, toggleFollow, checkIsFollowing, toggleBlockUser, checkIsBlocked } from "../services/socialService";
import {
  ArrowRight,
  RotateCw,
  MoreHorizontal,
  MapPin,
  Calendar,
  Cake,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Plus,
  Camera,
  X,
  Image as ImageIcon,
  Pin,
  Trash2,
  Edit3,
  Loader2,
  MessageSquare,
  Phone,
  Mail,
  LogOut,
  UserPlus,
  UserCheck,
  Lock,
  BarChart,
  AlertTriangle
} from "lucide-react";
import { AuthModal } from "../components/auth/AuthModal";
import { MobileBottomNav } from "../components/navigation/MobileBottomNav";
const safeSetStorage = (key, data) => {
  try {
    let payload = data;
    if (Array.isArray(payload) && payload.length > 40) {
      payload = payload.slice(0, 40);
    }
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn("Storage limit reached, auto-pruning...", err);
    try {
      if (Array.isArray(data)) {
        localStorage.setItem(key, JSON.stringify(data.slice(0, 20)));
      }
    } catch (_) {
    }
  }
};
const GLOBAL_FEED_KEY = "yr_community_global_posts";
const USERS_DIR_KEY = "yr_users_directory";
const FOLLOWS_KEY = "yr_social_follows";
const compressImage = (file, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
const VerifiedBadge = ({ type, size = 19 }) => {
  if (!type || type === "none" || type === false) return null;
  const bType = type === true ? "blue" : type;
  const colors = { blue: "#1D9BF0", gold: "#EAB308", gray: "#829AAB" };
  const fill = colors[bType] || "#1D9BF0";
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", className: "inline-block flex-shrink-0 align-middle mr-1.5 drop-shadow-sm", children: [
    /* @__PURE__ */ jsx("path", { d: "M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z", fill }),
    /* @__PURE__ */ jsx("path", { d: "M9.8 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z", fill: "#FFFFFF" })
  ] });
};
const AccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navState = routerLocation.state || {};
  const targetIdParam = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("\u0628\u062F\u0621...");
  const [sessionUser, setSessionUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [verificationType, setVerificationType] = useState("none");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [dmContent, setDmContent] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [activeMenuPost, setActiveMenuPost] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const postImageInputRef = useRef(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3e3);
  };
  const loadProfile = async (currentUserParam) => {
    try {
      const user = currentUserParam !== void 0 ? currentUserParam : (await supabase.auth.getUser()).data.user;
      setSessionUser(user);
      const myId = user?.id || "";
      const targetId = targetIdParam || myId;
      console.log("\u{1F7E2} DEBUG:", { targetId, targetIdParam, myId, profileId });
      console.log("\u{1F7E2} targetId:", targetId, "| myId:", myId);
      if (!targetId) {
        setLoading(false);
        return;
      }
      const viewingOwner = targetId === myId;
      if (navState && navState.name) {
        setName(navState.name);
        if (navState.username) setUsername(navState.username);
        if (navState.avatarUrl) setAvatarUrl(navState.avatarUrl);
        setLoading(false);
      }
      setIsOwner(viewingOwner);
      setProfileId(targetId);
      if (viewingOwner && user) {
        const meta = user.user_metadata || {};
        setName(meta.full_name || meta.name || user.email?.split("@")[0] || "\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u0645\u0646 \u0631\u064A\u062A\u0646\u062C");
        setUsername(meta.username || user.email?.split("@")[0] || "user");
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
        if (meta.bio) setBio(meta.bio);
        setEmail(user.email || "");
        setPhone(meta.phone || user.phone || "");
        if (user.created_at) {
          const d = new Date(user.created_at);
          const months = ["\u064A\u0646\u0627\u064A\u0631", "\u0641\u0628\u0631\u0627\u064A\u0631", "\u0645\u0627\u0631\u0633", "\u0625\u0628\u0631\u064A\u0644", "\u0645\u0627\u064A\u0648", "\u064A\u0648\u0646\u064A\u0648", "\u064A\u0648\u0644\u064A\u0648", "\u0623\u063A\u0633\u0637\u0633", "\u0633\u0628\u062A\u0645\u0628\u0631", "\u0623\u0643\u062A\u0648\u0628\u0631", "\u0646\u0648\u0641\u0645\u0628\u0631", "\u062F\u064A\u0633\u0645\u0628\u0631"];
          setJoinDate("\u0627\u0646\u0636\u0645 \u0641\u064A " + months[d.getMonth()] + " " + d.getFullYear());
        }
        setLoading(false);
      }
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject("timeout"), 2500));
      try {
        const pData = await getUserProfile(targetId);
        if (pData) {
          if (pData.full_name) setName(pData.full_name);
          else if (navState.name) setName(navState.name);
          if (pData.username) setUsername(pData.username);
          else if (navState.username) setUsername(navState.username);
          if (pData.avatar_url) setAvatarUrl(pData.avatar_url);
          else if (navState.avatarUrl) setAvatarUrl(navState.avatarUrl);
          if (pData.cover_url) setCoverUrl(pData.cover_url);
          if (pData.bio) setBio(pData.bio);
          if (pData.location) setLocation(pData.location);
          setFollowersCount(pData.followers_count || 0);
          setFollowingCount(pData.following_count || 0);
          setVerificationType(pData.verification_type || (pData.is_verified ? "blue" : "none"));
        }
      } catch (_) {
      }
      if (myId && myId !== targetId) {
        try {
          const [following, blocked] = await Promise.race([
            Promise.all([checkIsFollowing(myId, targetId), checkIsBlocked(myId, targetId)]),
            timeoutPromise
          ]);
          setIsFollowing(!!following);
          setIsBlocked(!!blocked);
        } catch (_) {
        }
      }
      try {
        console.log("\u{1F7E2} Before getUserPosts \u2014 targetId:", targetId, "| myId:", myId);
        const dbPosts = await getUserPosts(targetId, myId);
        const errMsg = window.__lastGetUserPostsError;
        if (errMsg) {
        }
        console.log("\u{1F7E2} After getUserPosts \u2014 got:", dbPosts?.length || 0, "posts");
        if (dbPosts && dbPosts[0]) console.log("   first:", dbPosts[0].content);
        if (Array.isArray(dbPosts)) {
          console.log("\u{1F7E2} About to setUserPosts with:", dbPosts.length);
          setUserPosts(dbPosts.map((p) => ({
            id: p.id,
            authorId: p.user_id,
            authorName: p.profile?.full_name || name,
            authorUsername: p.profile?.username || username,
            authorAvatar: p.profile?.avatar_url || "",
            authorBadge: p.profile?.verification_type || (p.profile?.is_verified ? "blue" : "none"),
            text: p.content,
            image: p.image_url || void 0,
            createdAt: p.created_at,
            createdAtDisplay: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            likedBy: [],
            isLiked: p.isLiked,
            replies: p.comments_count || 0,
            reposts: p.reposts_count || 0,
            views: p.views_count || 1
          })));
        }
      } catch (_) {
      }
    } catch (e) {
      console.error("LoadProfile error:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;
    const tryLoad = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          loadProfile(session.user);
          return;
        }
        if (attempts >= maxAttempts) {
          console.error("\u{1F7E2} Session not found after", maxAttempts, "attempts");
          loadProfile(null);
          return;
        }
        setTimeout(tryLoad, 500);
      } catch (e) {
        console.error("\u{1F7E2} getSession error:", e);
        if (attempts < maxAttempts) setTimeout(tryLoad, 500);
      }
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, [targetIdParam]);
  useEffect(() => {
    if (!profileId || profileId === "guest") return;
    const channel = supabase.channel(`account-posts-${profileId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts",
      filter: `user_id=eq.${profileId}`
    }, async () => {
      try {
        const dbPosts = await getUserPosts(profileId, sessionUser?.id);
        if (Array.isArray(dbPosts)) {
          setUserPosts(dbPosts.map((p) => ({
            id: p.id,
            authorId: p.user_id,
            authorName: p.profile?.full_name || "",
            authorUsername: p.profile?.username || "",
            authorAvatar: p.profile?.avatar_url || "",
            authorBadge: p.profile?.verification_type || (p.profile?.is_verified ? "blue" : "none"),
            text: p.content,
            image: p.image_url || void 0,
            createdAt: p.created_at,
            createdAtDisplay: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            likedBy: [],
            isLiked: p.isLiked,
            replies: p.comments_count || 0,
            reposts: p.reposts_count || 0,
            views: p.views_count || 1
          })));
        }
      } catch (_) {
      }
    }).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "post_likes"
    }, async () => {
      try {
        const dbPosts = await getUserPosts(profileId, sessionUser?.id);
        if (Array.isArray(dbPosts)) {
          setUserPosts((prev) => prev.map((p) => {
            const fresh = dbPosts.find((dp) => dp.id === p.id);
            return fresh ? { ...p, likes: fresh.likes_count || 0, isLiked: fresh.isLiked } : p;
          }));
        }
      } catch (_) {
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, sessionUser?.id]);
  const handlePhotoUpload = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast("\u062C\u0627\u0631\u064A \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0635\u0648\u0631\u0629...");
      const maxWidth = target === "avatar" ? 180 : 600;
      const maxHeight = target === "avatar" ? 180 : 250;
      const compressedDataUrl = await compressImage(file, maxWidth, maxHeight, 0.6);
      if (target === "avatar") {
        setAvatarUrl(compressedDataUrl);
      } else {
        setCoverUrl(compressedDataUrl);
      }
      const usersDir = JSON.parse(localStorage.getItem(USERS_DIR_KEY) || "{}");
      if (usersDir[profileId]) {
        if (target === "avatar") usersDir[profileId].avatarUrl = compressedDataUrl;
        if (target === "cover") usersDir[profileId].coverUrl = compressedDataUrl;
        safeSetStorage(USERS_DIR_KEY, usersDir);
      }
      if (target === "avatar") {
        const globalFeed = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || "[]");
        const updatedFeed = globalFeed.map((t) => t.authorId === profileId ? { ...t, authorAvatar: compressedDataUrl } : t);
        localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(updatedFeed));
        setUserPosts(updatedFeed.filter((t) => t.authorId === profileId));
      }
      if (profileId && profileId !== "guest") {
        const pObj = target === "avatar" ? { avatar_url: compressedDataUrl } : { cover_url: compressedDataUrl };
        supabase.auth.getSession().then(({ data: { session } }) => {
          const uToken = session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w";
          fetch("/supabase-api/rest/v1/profiles?id=eq." + profileId, {
            method: "PATCH",
            credentials: "omit",
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w",
              "Authorization": "Bearer " + uToken,
              "Content-Type": "application/json",
              "Prefer": "return=representation"
            },
            body: JSON.stringify(pObj)
          }).catch(console.error);
        });
      }
      showToast(target === "avatar" ? "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0628\u0646\u062C\u0627\u062D! \u2705" : "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u063A\u0644\u0627\u0641 \u0628\u0646\u062C\u0627\u062D! \u2705");
    } catch (err) {
      console.error(err);
      showToast("\u062A\u0639\u0630\u0631 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0635\u0648\u0631\u0629\u060C \u064A\u0631\u062C\u0649 \u062A\u062C\u0631\u0628\u0629 \u0635\u0648\u0631\u0629 \u0623\u062E\u0631\u0649");
    }
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const updated = {
      id: profileId,
      name: editName.trim() || name,
      phone: editPhone.trim(),
      username: editUsername.trim() || username,
      bio: editBio.trim(),
      location: editLocation.trim(),
      birthDate: editBirthDate.trim(),
      avatarUrl,
      coverUrl
    };
    setName(updated.name);
    setPhone(updated.phone);
    setUsername(updated.username);
    setBio(updated.bio);
    setLocation(updated.location);
    setBirthDate(updated.birthDate);
    const usersDir = JSON.parse(localStorage.getItem(USERS_DIR_KEY) || "{}");
    usersDir[profileId] = { ...usersDir[profileId], ...updated };
    safeSetStorage(USERS_DIR_KEY, usersDir);
    const globalFeed = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || "[]");
    const synced = globalFeed.map((t) => t.authorId === profileId ? { ...t, authorName: updated.name, authorUsername: updated.username } : t);
    localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(synced));
    setUserPosts(synced.filter((t) => t.authorId === profileId));
    try {
      if (sessionUser) {
        await supabase.auth.updateUser({
          data: {
            full_name: updated.name,
            phone: updated.phone,
            username: updated.username,
            bio: updated.bio
          }
        }).catch(() => {
        });
        if (profileId && profileId !== "guest") {
          await supabase.from("profiles").update({
            full_name: updated.name,
            username: updated.username,
            phone: updated.phone,
            bio: updated.bio,
            location: updated.location
          }).eq("id", profileId);
        }
      }
      showToast("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0628\u0646\u062C\u0627\u062D");
      setIsEditModalOpen(false);
    } catch (_) {
      showToast("\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0645\u062D\u0644\u064A\u0627\u064B \u0628\u0646\u062C\u0627\u062D!");
      setIsEditModalOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };
  const handleToggleFollow = async () => {
    if (!sessionUser) {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B \u0644\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629!");
      setAuthModalOpen(true);
      return;
    }
    const myId = sessionUser.id;
    const targetId = profileId;
    if (!targetId || myId === targetId) return;
    try {
      const nowFollowing = await toggleFollow(myId, targetId);
      setIsFollowing(nowFollowing);
      if (nowFollowing) {
        setFollowersCount((prev) => prev + 1);
        showToast(`\u062A\u0627\u0628\u0639\u062A ${name} \u0628\u0646\u062C\u0627\u062D! \u2B50`);
      } else {
        setFollowersCount((prev) => Math.max(0, prev - 1));
        showToast(`\u0623\u0644\u063A\u064A\u062A \u0645\u062A\u0627\u0628\u0639\u0629 ${name}`);
      }
    } catch (e) {
      console.error("Toggle follow error:", e);
      showToast("\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629");
    }
  };
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage) {
      showToast("\u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u0646\u0635 \u0623\u0648 \u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629");
      return;
    }
    if (!sessionUser || !profileId || profileId === "guest") {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B \u0644\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0646\u0634\u0631");
      setAuthModalOpen(true);
      return;
    }
    showToast("\u062C\u0627\u0631\u064A \u0646\u0634\u0631 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629 \u0633\u062D\u0627\u0628\u064A\u0627\u064B... \u23F3");
    try {
      const { data: inserted, error: pErr } = await supabase.from("posts").insert({
        user_id: profileId,
        content: newPostText.trim(),
        image_url: newPostImage || null
      }).select().single();
      if (pErr) throw pErr;
      const realPost = {
        id: inserted?.id || Date.now().toString(),
        authorId: profileId,
        authorName: name,
        authorUsername: username,
        authorAvatar: avatarUrl,
        authorBadge: verificationType,
        text: newPostText.trim(),
        image: newPostImage || void 0,
        createdAt: "\u0627\u0644\u0622\u0646",
        likes: 0,
        likedBy: [],
        replies: 0,
        reposts: 0,
        views: 1
      };
      setUserPosts((prev) => [realPost, ...prev]);
      setNewPostText("");
      setNewPostImage("");
      setIsPostModalOpen(false);
      showToast("\u062A\u0645 \u0646\u0634\u0631 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629 \u0648\u062D\u0641\u0638\u0647\u0627 \u0641\u064A \u0627\u0644\u0633\u062D\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D");
    } catch (err) {
      console.error("Post error:", err);
      showToast("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0646\u0634\u0631: " + (err.message || ""));
    }
  };
  const loadComments = async (postId) => {
    setLoadingComments(true);
    try {
      const { data: comments, error } = await supabase.from("post_comments").select("id, post_id, user_id, content, created_at").eq("post_id", postId).order("created_at", { ascending: true });
      if (error) throw error;
      if (!comments || comments.length === 0) {
        setPostComments([]);
        return;
      }
      const userIds = [...new Set(comments.map((c) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
      const mapped = comments.map((c) => {
        const profile = profileMap.get(c.user_id);
        return {
          id: c.id,
          userId: c.user_id,
          userName: profile?.full_name || "\u0645\u0633\u062A\u062E\u062F\u0645",
          userUsername: profile?.username || "user",
          userAvatar: profile?.avatar_url || "",
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" })
        };
      });
      setPostComments(mapped);
    } catch (e) {
      console.error("loadComments error:", e);
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };
  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || !sessionUser?.id || !activeCommentPost) return;
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: activeCommentPost.id,
        user_id: sessionUser.id,
        content: newCommentText.trim()
      });
      if (error) throw error;
      setNewCommentText("");
      await loadComments(activeCommentPost.id);
      showToast("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0631\u062F");
    } catch (e) {
      console.error("add comment error:", e);
      showToast("\u0641\u0634\u0644: " + (e?.message || "\u062E\u0637\u0623"));
    }
  };
  const handleRepost = async (postId) => {
    if (!sessionUser?.id) {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644");
      return;
    }
    try {
      const { data: existing } = await supabase.from("post_reposts").select("id").eq("post_id", postId).eq("user_id", sessionUser.id).maybeSingle();
      if (existing) {
        await supabase.from("post_reposts").delete().eq("post_id", postId).eq("user_id", sessionUser.id);
        setUserPosts((prev) => prev.map(
          (p) => p.id === postId ? { ...p, reposts: Math.max(0, (p.reposts || 0) - 1) } : p
        ));
        showToast("\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0634\u0631");
      } else {
        await supabase.from("post_reposts").insert({ post_id: postId, user_id: sessionUser.id });
        setUserPosts((prev) => prev.map(
          (p) => p.id === postId ? { ...p, reposts: (p.reposts || 0) + 1 } : p
        ));
        showToast("\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0634\u0631");
      }
    } catch (e) {
      console.error("repost error:", e);
      showToast("\u0641\u0634\u0644: " + (e?.message || "\u062E\u0637\u0623"));
    }
  };
  const handleToggleLike = (postId) => {
    const myId = sessionUser?.id || "guest";
    const updated = userPosts.map((p) => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        const isCurrentlyLiked = likedBy.includes(myId);
        const nextLikedBy = isCurrentlyLiked ? likedBy.filter((id) => id !== myId) : [...likedBy, myId];
        return {
          ...p,
          isLiked: !isCurrentlyLiked,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy
        };
      }
      return p;
    });
    setUserPosts(updated);
    const globalFeed = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || "[]");
    const synced = globalFeed.map((t) => {
      if (t.id === postId) {
        const likedBy = t.likedBy || [];
        const isLiked = likedBy.includes(myId);
        const nextLikedBy = isLiked ? likedBy.filter((id) => id !== myId) : [...likedBy, myId];
        return {
          ...t,
          isLiked: !isLiked,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy
        };
      }
      return t;
    });
    localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(synced));
  };
  const handleDeletePost = (postId) => {
    if (window.confirm("\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u061F")) {
      const updated = userPosts.filter((p) => p.id !== postId);
      setUserPosts(updated);
      const globalFeed = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || "[]");
      localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(globalFeed.filter((t) => t.id !== postId)));
      supabase.from("posts").delete().eq("id", postId).then(() => {
      });
      showToast("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u0634\u0648\u0631");
    }
  };
  const handleToggleBlock = () => {
    setIsMenuOpen(false);
    if (!sessionUser) {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B");
      setAuthModalOpen(true);
      return;
    }
    const willBlock = !isBlocked;
    setConfirmModal({
      open: true,
      title: willBlock ? "\u062D\u0638\u0631 @" + (username || name) : "\u0625\u0644\u063A\u0627\u0621 \u062D\u0638\u0631 @" + (username || name),
      desc: willBlock ? "\u0644\u0646 \u064A\u062A\u0645\u0643\u0646 \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0646 \u0645\u062A\u0627\u0628\u0639\u062A\u0643 \u0623\u0648 \u0631\u0624\u064A\u0629 \u0645\u0646\u0634\u0648\u0631\u0627\u062A\u0643." : "\u0633\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u0631\u0624\u064A\u0629 \u0645\u0646\u0634\u0648\u0631\u0627\u062A\u0647 \u0648\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639\u0647 \u0645\u062C\u062F\u062F\u0627\u064B.",
      onConfirm: async () => {
        const res = await toggleBlockUser(sessionUser.id, profileId);
        setIsBlocked(res);
        showToast(res ? "\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u062D\u0633\u0627\u0628" : "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u0638\u0631");
      }
    });
  };
  const handleSendDm = async (e) => {
    e.preventDefault();
    if (!sessionUser) {
      showToast("\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0645\u0631\u0627\u0633\u0644\u0629");
      setAuthModalOpen(true);
      return;
    }
    if (!dmContent.trim()) return;
    try {
      await supabase.from("direct_messages").insert({
        sender_id: sessionUser.id,
        receiver_id: profileId,
        content: dmContent.trim()
      });
      setDmContent("");
      setIsDmOpen(false);
      showToast("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0646\u062C\u0627\u062D \u2709\uFE0F");
    } catch (_) {
      showToast("\u062A\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629");
    }
  };
  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (window.confirm("\u0647\u0644 \u062A\u0631\u064A\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C\u061F")) {
      await supabase.auth.signOut();
      localStorage.removeItem("sb-auth-token");
      showToast("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0646\u062C\u0627\u062D \u{1F44B}");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 300);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-black flex items-center justify-center text-white font-['Cairo',sans-serif]", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-[#1D9BF0]" }) });
  }
  if (!sessionUser && !targetIdParam) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-['Cairo',sans-serif]", dir: "rtl", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-3xl bg-[#141E30] border border-[#2F3336] flex items-center justify-center mb-5 text-[#1D9BF0] shadow-2xl", children: /* @__PURE__ */ jsx(Lock, { size: 36 }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-black mb-2", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed", children: "\u0633\u062C\u0651\u0644 \u062F\u062E\u0648\u0644\u0643 \u0628\u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0645\u0644\u0641\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u060C \u0648\u062A\u063A\u064A\u064A\u0631 \u0635\u0648\u0631\u062A\u0643 \u0648\u063A\u0644\u0627\u0641\u0643\u060C \u0648\u0645\u0634\u0627\u0631\u0643\u0629 \u062A\u063A\u0631\u064A\u062F\u0627\u062A\u0643 \u0645\u0639 \u0645\u062C\u062A\u0645\u0639 \u064A\u0645\u0646 \u0631\u064A\u062A\u0646\u062C." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setAuthModalOpen(true),
          className: "w-full max-w-xs py-3.5 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white font-black text-sm transition shadow-[0_8px_25px_rgba(29,155,240,0.4)]",
          children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 / \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628"
        }
      ),
      /* @__PURE__ */ jsx(AuthModal, { isOpen: authModalOpen, onClose: () => {
        setAuthModalOpen(false);
        loadProfile();
      }, defaultMode: "login" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-black text-[#E7E9EA] font-['Cairo',sans-serif] selection:bg-[#1D9BF0] selection:text-white pb-32", dir: "rtl", children: [
    toastMessage && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-[#16181C]/95 backdrop-blur-2xl border border-[#2F3336] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-fade-in flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 16, className: "text-[#1D9BF0] flex-shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: toastMessage })
    ] }),
    isOwner && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("input", { type: "file", ref: avatarInputRef, className: "hidden", accept: "image/*", onChange: (e) => handlePhotoUpload(e, "avatar") }),
      /* @__PURE__ */ jsx("input", { type: "file", ref: coverInputRef, className: "hidden", accept: "image/*", onChange: (e) => handlePhotoUpload(e, "cover") }),
      /* @__PURE__ */ jsx("input", { type: "file", ref: postImageInputRef, className: "hidden", accept: "image/*", onChange: async (e) => {
        const f = e.target.files?.[0];
        if (f) {
          const compressed = await compressImage(f, 1e3, 1e3, 0.85);
          setNewPostImage(compressed);
        }
      } })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-44 sm:h-52 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950", children: [
      coverUrl ? /* @__PURE__ */ jsx("img", { src: coverUrl, alt: "\u0627\u0644\u063A\u0644\u0627\u0641", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black flex items-center justify-center text-zinc-700 text-xs font-bold", children: isOwner && "\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0632\u0631 \u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0627 \u0644\u0625\u0636\u0627\u0641\u0629 \u063A\u0644\u0627\u0641" }),
      isOwner && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => coverInputRef.current?.click(),
          className: "absolute bottom-3 left-3 bg-black/70 hover:bg-black/90 active:scale-95 text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 text-xs font-bold shadow-lg z-10",
          title: "\u062A\u063A\u064A\u064A\u0631 \u0635\u0648\u0631\u0629 \u0627\u0644\u063A\u0644\u0627\u0641",
          children: [
            /* @__PURE__ */ jsx(Camera, { size: 16 }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u063A\u0644\u0627\u0641" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 right-3 flex items-center justify-between z-20", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate(-1),
            className: "w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95",
            title: "\u0631\u062C\u0648\u0639",
            children: /* @__PURE__ */ jsx(ArrowRight, { size: 20 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95",
              children: /* @__PURE__ */ jsx(RotateCw, { size: 17 })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/feed"),
              title: "\u062A\u063A\u0631\u064A\u062F\u0627\u062A \u0627\u0644\u0645\u062C\u062A\u0645\u0639",
              className: "w-9 h-9 rounded-full bg-[#1D9BF0]/30 hover:bg-[#1D9BF0]/50 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95",
              children: /* @__PURE__ */ jsx(MessageSquare, { size: 17 })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsMenuOpen(!isMenuOpen),
              title: "\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628",
              className: "w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95 relative",
              children: /* @__PURE__ */ jsx(MoreHorizontal, { size: 19 })
            }
          ),
          isMenuOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setIsMenuOpen(false) }),
            /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-12 w-44 bg-[#16181C]/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-50 text-xs animate-fade-in divide-y divide-[#2F3336]/60", children: isOwner ? /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setEditName(name);
                    setEditPhone(phone);
                    setEditUsername(username);
                    setEditBio(bio);
                    setEditLocation(location);
                    setEditBirthDate(birthDate);
                    setIsEditModalOpen(true);
                    setIsMenuOpen(false);
                  },
                  className: "w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl",
                  children: [
                    /* @__PURE__ */ jsx(Edit3, { size: 16, className: "text-zinc-400 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white text-sm", children: "\u062A\u0639\u062F\u064A\u0644" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleLogout,
                  className: "w-full px-3 py-2.5 text-right hover:bg-rose-500/15 active:bg-rose-500/20 flex items-center gap-3 text-white font-bold transition rounded-xl",
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { size: 16, className: "text-rose-500 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white text-sm", children: "\u062E\u0631\u0648\u062C" })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    navigator.clipboard?.writeText(window.location.href);
                    setIsMenuOpen(false);
                    showToast("\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637");
                  },
                  className: "w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl",
                  children: [
                    /* @__PURE__ */ jsx(Share, { size: 16, className: "text-zinc-400 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white text-sm", children: "\u0645\u0634\u0627\u0631\u0643\u0629" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    setIsMenuOpen(false);
                    showToast("\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0644\u0627\u063A");
                  },
                  className: "w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl",
                  children: [
                    /* @__PURE__ */ jsx(AlertTriangle, { size: 16, className: "text-zinc-400 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white text-sm", children: "\u0625\u0628\u0644\u0627\u063A" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleToggleBlock,
                  className: "w-full px-3.5 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl",
                  children: [
                    /* @__PURE__ */ jsx(Lock, { size: 16, className: isBlocked ? "text-[#1D9BF0] flex-shrink-0" : "text-rose-500 flex-shrink-0" }),
                    /* @__PURE__ */ jsx("span", { className: "text-white text-sm", children: isBlocked ? "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u0638\u0631" : "\u062D\u0638\u0631" })
                  ]
                }
              ) })
            ] }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-4 relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end -mt-14 sm:-mt-16 mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center", children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-[#182338] text-white flex items-center justify-center text-3xl font-black", children: name ? name[0] : "\u061F" }) }),
          isOwner && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => avatarInputRef.current?.click(),
              className: "absolute bottom-0 right-0 p-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white border-2 border-black shadow-lg transition",
              title: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629",
              children: /* @__PURE__ */ jsx(Camera, { size: 16 })
            }
          )
        ] }),
        isOwner ? /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => showToast("\u062D\u0633\u0627\u0628\u0643 \u0645\u0639\u062A\u0645\u062F \u0648\u0646\u0634\u0637 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629 \u2728"),
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D9BF0]/15 border border-[#1D9BF0]/40 text-[#1D9BF0] text-xs font-bold hover:bg-[#1D9BF0]/25 transition",
            children: [
              /* @__PURE__ */ jsx("span", { children: "\u062D\u0633\u0627\u0628 \u0645\u0639\u062A\u0645\u062F" }),
              /* @__PURE__ */ jsx(VerifiedBadge, { type: verificationType || "blue", size: 16 })
            ]
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsDmOpen(true),
              className: "p-2 sm:px-3 sm:py-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95",
              title: "\u0645\u0631\u0627\u0633\u0644\u0629 \u062E\u0627\u0635\u0629",
              children: [
                /* @__PURE__ */ jsx(Mail, { size: 16, className: "text-[#1D9BF0]" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "\u0631\u0633\u0627\u0644\u0629" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleToggleFollow,
              className: `flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black transition active:scale-95 shadow-md ${isFollowing ? "bg-zinc-800 text-white border border-zinc-700 hover:bg-rose-500/20 hover:text-rose-400" : "bg-white text-black hover:bg-zinc-200"}`,
              children: isFollowing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(UserCheck, { size: 15 }),
                /* @__PURE__ */ jsx("span", { children: "\u062A\u062A\u0627\u0628\u0639\u0647" })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(UserPlus, { size: 15 }),
                /* @__PURE__ */ jsx("span", { children: "\u0645\u062A\u0627\u0628\u0639\u0629" })
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-black text-white leading-tight", children: name || "\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u0645\u0646 \u0631\u064A\u062A\u0646\u062C" }),
          /* @__PURE__ */ jsx(VerifiedBadge, { type: verificationType, size: 22 })
        ] }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#71767B] font-mono mt-0.5", dir: "ltr", children: [
          "@",
          username || "user"
        ] })
      ] }),
      bio ? /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#E7E9EA] leading-relaxed whitespace-pre-wrap", children: bio }) : isOwner ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-zinc-600 italic cursor-pointer hover:text-zinc-400", onClick: () => setIsEditModalOpen(true), children: "+ \u0623\u0636\u0641 \u0646\u0628\u0630\u0629 \u062A\u0639\u0631\u064A\u0641\u064A\u0629 \u0639\u0646\u0643 (Bio)" }) : null,
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-[#71767B]", children: [
        isOwner && email && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-zinc-300", children: [
          /* @__PURE__ */ jsx(Mail, { size: 14, className: "text-[#1D9BF0]" }),
          /* @__PURE__ */ jsx("span", { dir: "ltr", children: email })
        ] }),
        isOwner && phone && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-zinc-300", children: [
          /* @__PURE__ */ jsx(Phone, { size: 14, className: "text-[#1D9BF0]" }),
          /* @__PURE__ */ jsx("span", { dir: "ltr", children: phone })
        ] }),
        location && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(MapPin, { size: 14 }),
          /* @__PURE__ */ jsx("span", { children: location })
        ] }),
        isOwner && birthDate && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Cake, { size: 14 }),
          /* @__PURE__ */ jsx("span", { children: birthDate })
        ] }),
        joinDate && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(Calendar, { size: 14 }),
          /* @__PURE__ */ jsx("span", { children: joinDate })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5 mt-3.5 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "hover:underline cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate(`/u/${username}?tab=following`),
              className: "hover:underline cursor-pointer",
              children: /* @__PURE__ */ jsx("span", { className: "font-extrabold text-white ml-1", children: followingCount })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[#71767B]", children: "\u0645\u062A\u0627\u0628\u064E\u0639\u0629" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hover:underline cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate(`/u/${username}?tab=followers`),
              className: "hover:underline cursor-pointer",
              children: /* @__PURE__ */ jsx("span", { className: "font-extrabold text-white ml-1", children: followersCount })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[#71767B]", children: "\u0645\u062A\u0627\u0628\u0650\u0639\u064B\u0627" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4", children: [
        isOwner ? /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setEditName(name);
              setEditPhone(phone);
              setEditUsername(username);
              setEditBio(bio);
              setEditLocation(location);
              setEditBirthDate(birthDate);
              setIsEditModalOpen(true);
            },
            className: "w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-[#181818] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Edit3, { size: 15 }),
              /* @__PURE__ */ jsx("span", { children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0641\u0651 \u0627\u0644\u0634\u062E\u0635\u064A\u0651" })
            ]
          }
        ) : /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleToggleFollow,
            className: `w-full py-2 px-4 rounded-full font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${isFollowing ? "border border-zinc-700 bg-zinc-900 text-white" : "bg-white text-black"}`,
            children: isFollowing ? "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629" : "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062D\u0633\u0627\u0628"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              navigator.clipboard?.writeText(window.location.href);
              showToast("\u062A\u0645 \u0646\u0633\u062E \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A!");
            },
            className: "w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-[#181818] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Share, { size: 15 }),
              /* @__PURE__ */ jsx("span", { children: "\u0645\u0634\u0627\u0631\u0643\u0629" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 border-b border-[#2F3336] flex items-center justify-around text-sm font-bold", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("posts"),
          className: `py-3 flex-1 flex items-center justify-center gap-1.5 relative transition ${activeTab === "posts" ? "text-white font-black" : "text-[#71767B] hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062A (",
              userPosts.length,
              ")"
            ] }),
            activeTab === "posts" && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-16 h-1 bg-white rounded-full" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("likes"),
          className: `py-3 flex-1 flex items-center justify-center relative transition ${activeTab === "likes" ? "text-white font-black" : "text-[#71767B] hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(Heart, { size: 18 }),
            activeTab === "likes" && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-8 h-1 bg-white rounded-full" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#2F3336]", children: userPosts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 px-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-white mb-1", children: isOwner ? "\u0644\u0645 \u062A\u0642\u0645 \u0628\u0646\u0634\u0631 \u0623\u064A \u0645\u0646\u0634\u0648\u0631 \u0628\u0639\u062F" : `\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u0634\u0648\u0631\u0627\u062A \u0644\u0640 ${name}` }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-[#71767B] mb-4", children: isOwner ? "\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0632\u0631 (+) \u0628\u0627\u0644\u0623\u0633\u0641\u0644 \u0644\u062A\u0646\u0634\u0631 \u0623\u0648\u0644 \u062A\u063A\u0631\u064A\u062F\u0629 \u0648\u062A\u0634\u0627\u0631\u0643\u0647\u0627 \u0645\u0639 \u0627\u0644\u062C\u0645\u064A\u0639!" : "\u0639\u0646\u062F\u0645\u0627 \u064A\u0646\u0634\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u062A\u063A\u0631\u064A\u062F\u0627\u062A\u060C \u0633\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0641\u0648\u0631\u0627\u064B." }),
      isOwner && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsPostModalOpen(true),
          className: "px-5 py-2.5 rounded-full bg-[#1D9BF0] text-white text-xs font-bold hover:bg-[#1A8CD8] transition shadow-lg",
          children: "\u0627\u0643\u062A\u0628 \u062A\u063A\u0631\u064A\u062F\u0629 \u062C\u062F\u064A\u062F\u0629"
        }
      )
    ] }) : userPosts.map((post) => /* @__PURE__ */ jsx("article", { className: "px-4 py-3 border-b border-[#2F3336] hover:bg-white/[0.03] transition cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg", children: post.authorAvatar ? /* @__PURE__ */ jsx("img", { src: post.authorAvatar, alt: post.authorName || name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("span", { children: post.authorName?.[0] || name?.[0] || "\u061F" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white text-[14px] hover:underline cursor-pointer truncate", children: post.authorName || name }),
            post.authorBadge && post.authorBadge !== "none" && /* @__PURE__ */ jsxs(
              "svg",
              {
                className: "w-[18px] h-[18px] flex-shrink-0",
                viewBox: "0 0 24 24",
                fill: "currentColor",
                style: { color: post.authorBadge === "blue" ? "#1D9BF0" : post.authorBadge === "gold" ? "#FFD700" : "#71767B" },
                children: [
                  /* @__PURE__ */ jsx("path", { d: "M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.755 2.73 1.882 3.475-.038.2-.058.406-.058.617 0 2.21 1.71 4 3.918 4 .47 0 .92-.085 1.336-.25.52 1.335 1.828 2.25 3.337 2.25s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.21-.02-.417-.058-.617C21.745 15.23 22.5 13.96 22.5 12.5z" }),
                  /* @__PURE__ */ jsx("path", { fill: "white", d: "M10.825 16.583l-3.66-3.66a.75.75 0 111.06-1.061l2.6 2.6 5.405-5.405a.75.75 0 111.06 1.061l-5.935 5.935a.75.75 0 01-1.06 0z" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-[#71767B] text-[13px] truncate", children: [
              "@",
              post.authorUsername || username
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[#71767B] text-[13px]", children: "\xB7" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#71767B] text-[12px] hover:underline cursor-pointer", title: post.createdAtDisplay || post.createdAt, children: formatTimeAgo(post.createdAt).relative })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setActiveMenuPost(post);
              },
              className: "text-[#71767B] hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition shrink-0",
              title: "\u0627\u0644\u0645\u0632\u064A\u062F",
              children: /* @__PURE__ */ jsx(MoreHorizontal, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-[15px] leading-5 text-[#E7E9EA] whitespace-pre-wrap break-words [overflow-wrap:anywhere]", children: post.text }),
        post.image && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-2xl overflow-hidden border border-[#2F3336] max-h-96", children: /* @__PURE__ */ jsx("img", { src: post.image, alt: "\u0627\u0644\u0635\u0648\u0631\u0629", className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3 max-w-md", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setActiveCommentPost(post);
                loadComments(post.id);
              },
              className: "flex items-center gap-1.5 hover:text-[#1D9BF0] transition group",
              title: "\u0627\u0644\u0631\u062F\u0648\u062F",
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10", children: /* @__PURE__ */ jsx(MessageCircle, { size: 16 }) }),
                /* @__PURE__ */ jsx("span", { children: post.replies || 0 })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                handleRepost(post.id);
              },
              className: "flex items-center gap-1.5 hover:text-emerald-400 transition group",
              title: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u063A\u0631\u064A\u062F",
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-full group-hover:bg-emerald-500/10", children: /* @__PURE__ */ jsx(Repeat2, { size: 17 }) }),
                /* @__PURE__ */ jsx("span", { children: post.reposts || 0 })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleToggleLike(post.id),
              className: `flex items-center gap-1.5 transition group ${post.isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"}`,
              title: "\u0625\u0639\u062C\u0627\u0628",
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-full group-hover:bg-rose-500/10", children: /* @__PURE__ */ jsx(Heart, { size: 16, className: post.isLiked ? "fill-current" : "" }) }),
                /* @__PURE__ */ jsx("span", { children: post.likes || 0 })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: (e) => e.stopPropagation(),
              className: "flex items-center gap-1.5 text-[#71767B] hover:text-[#1D9BF0] transition group",
              title: "\u0627\u0644\u0645\u0634\u0627\u0647\u062F\u0627\u062A",
              children: [
                /* @__PURE__ */ jsx("div", { className: "p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10", children: /* @__PURE__ */ jsx(BarChart, { size: 17 }) }),
                /* @__PURE__ */ jsx("span", { children: post.views || 0 })
              ]
            }
          )
        ] })
      ] })
    ] }) }, post.id)) }),
    isEditModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#000000] border border-[#2F3336] w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-black", children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0641\u0651 \u0627\u0644\u0634\u062E\u0635\u064A\u0651" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIsEditModalOpen(false), className: "text-[#71767B] hover:text-white p-1 rounded-full", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveProfile, className: "space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[#71767B] font-bold mb-1", children: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: editName,
              onChange: (e) => setEditName(e.target.value),
              className: "w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[#71767B] font-bold mb-1", children: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              value: editPhone,
              onChange: (e) => setEditPhone(e.target.value),
              className: "w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none font-mono",
              placeholder: "+967 77xxxxxxx",
              dir: "ltr"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[#71767B] font-bold mb-1", children: "\u0627\u0644\u0645\u0639\u0631\u0651\u0641 (@Username)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: editUsername,
              onChange: (e) => setEditUsername(e.target.value),
              className: "w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none font-mono",
              dir: "ltr"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[#71767B] font-bold mb-1", children: "\u0627\u0644\u0646\u0628\u0630\u0629 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A\u0629 (Bio)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 3,
              value: editBio,
              onChange: (e) => setEditBio(e.target.value),
              className: "w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none",
              placeholder: "\u0627\u0643\u062A\u0628 \u0646\u0628\u0630\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[#71767B] font-bold mb-1", children: "\u0627\u0644\u0645\u0648\u0642\u0639 / \u0627\u0644\u0645\u062F\u064A\u0646\u0629" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: editLocation,
              onChange: (e) => setEditLocation(e.target.value),
              className: "w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none",
              placeholder: "\u0635\u0646\u0639\u0627\u0621\u060C \u0627\u0644\u064A\u0645\u0646"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-2 space-y-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: savingProfile,
              className: "w-full py-3 rounded-full bg-white hover:bg-zinc-200 active:scale-98 text-black font-extrabold text-sm transition",
              children: savingProfile ? "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638..." : "\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: handleLogout,
              className: "w-full py-2.5 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-xs transition flex items-center justify-center gap-1.5",
              children: [
                /* @__PURE__ */ jsx(LogOut, { size: 15 }),
                /* @__PURE__ */ jsx("span", { children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0645\u0646 \u0627\u0644\u062D\u0633\u0627\u0628" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    isPostModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#000000] border border-[#2F3336] w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-black", children: "\u0645\u0646\u0634\u0648\u0631 \u062C\u062F\u064A\u062F" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setIsPostModalOpen(false), className: "text-[#71767B] hover:text-white p-1 rounded-full", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCreatePost, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold", children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("span", { children: name ? name[0] : "\u061F" }) }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 4,
              value: newPostText,
              onChange: (e) => setNewPostText(e.target.value),
              placeholder: "\u0645\u0627\u0630\u0627 \u064A\u062D\u062F\u062B\u061F \u0627\u0643\u062A\u0628 \u0645\u0646\u0634\u0648\u0631\u0643...",
              maxLength: 280,
              className: "w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none",
              autoFocus: true
            }
          )
        ] }),
        newPostImage && /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-[#2F3336] max-h-60", children: [
          /* @__PURE__ */ jsx("img", { src: newPostImage, alt: "\u0645\u0639\u0627\u064A\u0646\u0629", className: "w-full h-full object-cover" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setNewPostImage(""),
              className: "absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition",
              children: /* @__PURE__ */ jsx(X, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-[#2F3336]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => postImageInputRef.current?.click(),
              className: "p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition",
              title: "\u0625\u0631\u0641\u0627\u0642 \u0635\u0648\u0631\u0629",
              children: /* @__PURE__ */ jsx(ImageIcon, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs font-mono select-none", dir: "ltr", children: [
              /* @__PURE__ */ jsx("span", { className: newPostText.length > 280 ? "text-rose-500 font-bold" : newPostText.length >= 260 ? "text-amber-400 font-bold" : "text-zinc-500", children: newPostText.length }),
              /* @__PURE__ */ jsx("span", { className: "text-zinc-600", children: "/ 280" }),
              newPostText.length >= 260 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-amber-400 mr-1", children: [
                "(\u0645\u062A\u0628\u0642\u064A ",
                280 - newPostText.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: !newPostText.trim() && !newPostImage || newPostText.length > 280,
                className: "px-5 py-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-sm transition",
                children: "\u0646\u0634\u0631"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    isDmOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-[#16181C] border border-[#2F3336] rounded-3xl p-5 shadow-2xl animate-scale-up text-right", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setIsDmOpen(false), className: "text-zinc-400 hover:text-white p-1 rounded-full", children: /* @__PURE__ */ jsx(X, { size: 18 }) }),
        /* @__PURE__ */ jsxs("h3", { className: "font-black text-white text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "\u0645\u0631\u0627\u0633\u0644\u0629 \u062E\u0627\u0635\u0629 \u0645\u0639 ",
            name
          ] }),
          /* @__PURE__ */ jsx(Mail, { size: 16, className: "text-[#1D9BF0]" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSendDm, className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: dmContent,
            onChange: (e) => setDmContent(e.target.value),
            placeholder: "\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u062A\u0643 \u0627\u0644\u062E\u0627\u0635\u0629 \u0647\u0646\u0627...",
            rows: 4,
            className: "w-full bg-black/60 border border-[#2F3336] rounded-2xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1D9BF0] resize-none"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIsDmOpen(false), className: "px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:bg-white/5 transition", children: "\u0625\u0644\u063A\u0627\u0621" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "px-6 py-2 rounded-full text-xs font-black bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white transition shadow-lg active:scale-95", children: "\u0625\u0631\u0633\u0627\u0644 \u2709\uFE0F" })
        ] })
      ] })
    ] }) }),
    confirmModal?.open && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs bg-[#16181C] border border-[#2F3336] rounded-3xl p-5 shadow-2xl text-center animate-scale-up", dir: "rtl", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-black text-white mb-1.5", children: confirmModal.title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-400 mb-5 leading-relaxed", children: confirmModal.desc }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setConfirmModal(null),
            className: "flex-1 py-2.5 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95",
            children: "\u0625\u0644\u063A\u0627\u0621"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              confirmModal.onConfirm();
              setConfirmModal(null);
            },
            className: "flex-1 py-2.5 rounded-full text-xs font-black bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white transition active:scale-95 shadow-md shadow-blue-900/30",
            children: "\u062A\u0623\u0643\u064A\u062F"
          }
        )
      ] })
    ] }) }),
    activeMenuPost && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-2",
        onClick: () => setActiveMenuPost(null),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "w-full max-w-md bg-[#16181C] rounded-2xl overflow-hidden mb-20",
            onClick: (e) => e.stopPropagation(),
            children: [
              isOwner && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    handleDeletePost(activeMenuPost.id);
                    setActiveMenuPost(null);
                  },
                  className: "w-full px-4 py-4 text-right text-[#F4212E] font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { size: 18 }),
                    /* @__PURE__ */ jsx("span", { children: "\u062D\u0630\u0641 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    showToast("\u0627\u0644\u062A\u062B\u0628\u064A\u062A \u0642\u0631\u064A\u0628\u0627\u064B");
                    setActiveMenuPost(null);
                  },
                  className: "w-full px-4 py-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Pin, { size: 18 }),
                    /* @__PURE__ */ jsx("span", { children: "\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    navigator.clipboard?.writeText(window.location.origin + `/account?id=${activeMenuPost.authorId}`);
                    showToast("\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637!");
                    setActiveMenuPost(null);
                  },
                  className: "w-full px-4 py-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(Share, { size: 18 }),
                    /* @__PURE__ */ jsx("span", { children: "\u0646\u0633\u062E \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0629" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setActiveMenuPost(null),
                  className: "w-full px-4 py-4 text-center text-white font-bold hover:bg-white/5 transition",
                  children: "\u0625\u0644\u063A\u0627\u0621"
                }
              )
            ]
          }
        )
      }
    ),
    activeCommentPost && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between h-[100dvh] w-full max-w-lg mx-auto border border-[#2F3336] p-4 text-white overflow-hidden shadow-2xl", dir: "rtl", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-[#2F3336] mb-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveCommentPost(null),
              className: "text-[#71767B] hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSubmitComment,
              disabled: !newCommentText.trim() || newCommentText.length > 280,
              className: "px-5 py-1.5 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 text-white rounded-full text-xs font-black transition",
              children: "\u0627\u0644\u0631\u062F\u0651"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#71767B] mb-3 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { children: "\u0631\u062F\u0627\u064B \u0639\u0644\u0649" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[#1D9BF0] font-mono font-bold", dir: "ltr", children: [
            "@",
            activeCommentPost.authorUsername
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold", children: avatarUrl ? /* @__PURE__ */ jsx("img", { src: avatarUrl, alt: name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("span", { children: name ? name[0] : "\u061F" }) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 4,
              value: newCommentText,
              onChange: (e) => setNewCommentText(e.target.value),
              placeholder: "\u0627\u0646\u0634\u0631 \u0631\u062F\u0651\u0643",
              maxLength: 280,
              className: "w-full bg-transparent text-white placeholder-[#71767B] text-sm focus:outline-none resize-none",
              autoFocus: true
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto mt-4", children: loadingComments ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-[#71767B]", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." }) : postComments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-[#71767B]", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0631\u062F\u0648\u062F \u0628\u0639\u062F" }) : postComments.map((c) => /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-[#2F3336]", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0", children: c.userAvatar ? /* @__PURE__ */ jsx("img", { src: c.userAvatar, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-sm", children: c.userName?.[0] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-sm flex-wrap", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-white", children: c.userName }),
            /* @__PURE__ */ jsxs("span", { className: "text-[#71767B]", children: [
              "@",
              c.userUsername
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[#71767B]", children: "\xB7" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#71767B]", children: c.createdAt })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm mt-1 whitespace-pre-wrap", children: c.content })
        ] })
      ] }) }, c.id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-auto pt-3 border-t border-[#2F3336] bg-black", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end text-xs font-mono", dir: "ltr", children: [
        /* @__PURE__ */ jsx("span", { className: newCommentText.length > 280 ? "text-rose-500 font-bold" : "text-[#71767B]", children: newCommentText.length }),
        /* @__PURE__ */ jsx("span", { className: "text-zinc-600 mx-1", children: "/ 280" })
      ] }) })
    ] }),
    isOwner && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsPostModalOpen(true),
        className: "fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(29,155,240,0.5)] transition",
        title: "\u062A\u063A\u0631\u064A\u062F\u0629 \u062C\u062F\u064A\u062F\u0629",
        children: /* @__PURE__ */ jsx(Plus, { size: 28, className: "stroke-[2.5]" })
      }
    ),
    /* @__PURE__ */ jsx(MobileBottomNav, { onNavigate: (path) => navigate(path) })
  ] });
};
export {
  AccountPage,
  VerifiedBadge
};
