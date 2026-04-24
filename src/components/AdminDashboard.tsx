import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc, getDocs, where } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Calendar, MessageSquare, LogOut, Check, Trash2, Clock, Users, Shield, Globe, XCircle, Home, UserPlus, AlertCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { translations, Language } from '../i18n/translations';

/**
 * Map Firebase Auth error codes to clear Mongolian messages.
 * Root cause of login failures on production:
 *   auth/unauthorized-domain → goy-house.vercel.app must be added in
 *   Firebase Console → Authentication → Settings → Authorized domains
 */
const getAuthError = (error: any, t: typeof translations.mn.admin): string => {
  switch (error?.code) {
    case 'auth/unauthorized-domain':      return t.authErrDomain;
    case 'auth/popup-blocked':            return t.authErrPopupBlocked;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':  return t.authErrPopupClosed;
    case 'auth/network-request-failed':   return t.authErrNetwork;
    case 'auth/too-many-requests':        return t.authErrTooMany;
    case 'auth/user-disabled':            return t.authErrDisabled;
    default:                              return t.loginError;
  }
};

/** Resolve check-in date from new or old booking schema */
const getCheckIn  = (b: any) => b.checkIn  ?? b.date  ?? '—';
/** Resolve check-out date from new or old booking schema */
const getCheckOut = (b: any) => b.checkOut ?? b.time  ?? '—';
/** Resolve guest name from new or old booking schema */
const getGuestName = (b: any) => b.fullName ?? b.name ?? '—';

const formatMoney = (n: number | undefined) =>
  n != null ? n.toLocaleString('mn-MN') + '₮' : '—';

export const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'team'>('bookings');
  const [lang, setLang] = useState<Language>('mn');
  const t = translations[lang].admin;
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [adminEmails, setAdminEmails] = useState<any[]>([]);

  // Add-admin-by-email form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminEmailError, setAdminEmailError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userEmail = (currentUser.email ?? '').toLowerCase();
        const isSuperAdmin = userEmail === 'amoron466@gmail.com';
        try {
          const userRef  = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          // Already known admin — fast path
          if (userSnap.exists() && userSnap.data().role === 'admin') {
            setUserRole('admin');
            setLoading(false);
            return;
          }

          // Check adminEmails pre-authorization list
          let isPreAuthorized = isSuperAdmin;
          if (!isPreAuthorized) {
            try {
              const preAuthSnap = await getDoc(doc(db, 'adminEmails', userEmail));
              isPreAuthorized = preAuthSnap.exists();
            } catch {
              // permission-denied means not in the list — that's fine
            }
          }

          if (isPreAuthorized) {
            // Promote user and write/merge their users doc
            setUserRole('admin');
            await setDoc(userRef, {
              email:     currentUser.email,
              role:      'admin',
              createdAt: userSnap.exists()
                ? userSnap.data().createdAt
                : new Date().toISOString(),
            }, { merge: true });
          } else if (userSnap.exists()) {
            setUserRole(userSnap.data().role as 'admin' | 'user');
          } else {
            // First-time user, not pre-authorized → regular user
            setUserRole('user');
            await setDoc(userRef, {
              email:     currentUser.email,
              role:      'user',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole(isSuperAdmin ? 'admin' : 'user');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || userRole !== 'admin') return;

    // Listen to Bookings
    const qBookings = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'bookings'));

    // Listen to Messages
    const qMessages = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'contactMessages'));

    // Listen to Team Members (Users)
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn('Could not load users:', error);
    });

    // Listen to pre-authorized admin emails
    const qAdminEmails = query(collection(db, 'adminEmails'), orderBy('addedAt', 'desc'));
    const unsubAdminEmails = onSnapshot(qAdminEmails, (snapshot) => {
      setAdminEmails(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn('Could not load adminEmails:', error);
    });

    return () => {
      unsubBookings();
      unsubMessages();
      unsubUsers();
      unsubAdminEmails();
    };
  }, [user, userRole]);

  const handleLogin = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user document exists
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            role: result.user.email === 'amoron466@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(getAuthError(error, translations[lang].admin));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const updateStatus = async (collectionName: string, id: string, status: string) => {
    try {
      if (collectionName === 'users') {
        await updateDoc(doc(db, collectionName, id), { role: status });
      } else {
        await updateDoc(doc(db, collectionName, id), {
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, collectionName);
    }
  };

  const deleteItem = async (collectionName: string, id: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, collectionName);
      }
    }
  };

  const addAdminEmail = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminEmailError(t.emailErrInvalid);
      return;
    }
    if (adminEmails.some(a => a.email === email)) {
      setAdminEmailError(t.emailErrExists);
      return;
    }
    setAddingAdmin(true);
    setAdminEmailError('');
    try {
      // Write to adminEmails (document ID = email for easy lookup on login)
      await setDoc(doc(db, 'adminEmails', email), {
        email,
        addedAt: new Date().toISOString(),
        addedBy: user.email ?? '',
      });
      // If this person has already signed in, promote them immediately
      const existing = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
      for (const snap of existing.docs) {
        await updateDoc(snap.ref, { role: 'admin' });
      }
      setNewAdminEmail('');
    } catch (error) {
      console.error('addAdminEmail error:', error);
      setAdminEmailError(t.addAdminErr);
    } finally {
      setAddingAdmin(false);
    }
  };

  const removeAdminEmail = async (email: string) => {
    if (!window.confirm(t.revokeConfirm.replace('{email}', email))) return;
    const isSelfRemoval = email === (user?.email ?? '').toLowerCase();
    try {
      await deleteDoc(doc(db, 'adminEmails', email));
      const existing = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
      for (const snap of existing.docs) {
        await updateDoc(snap.ref, { role: 'user' });
      }
      if (isSelfRemoval) {
        await signOut(auth);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'adminEmails');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-950">{t.loading}</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="absolute top-4 left-4">
          <a
            href="/"
            className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-800"
          >
            <Home className="w-4 h-4" />
            <span>{t.homeLink}</span>
          </a>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-stone-500" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent text-sm font-medium text-stone-400 focus:outline-none cursor-pointer"
          >
            <option value="mn">Монгол</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="bg-stone-900 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-stone-800">
          <h1 className="text-2xl font-serif font-medium text-stone-100 mb-6">{t.adminLogin}</h1>
          {loginError && (
            <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-xl text-sm text-left">
              {loginError}
            </div>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-gold-400 text-stone-900 py-3 rounded-xl font-medium hover:bg-gold-500 transition-colors"
          >
            {t.signInGoogle}
          </button>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="bg-stone-900 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-stone-800">
          <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-medium text-stone-100 mb-4">{t.accessDenied}</h1>
          <p className="text-stone-400 mb-8">
            {t.accessDeniedDesc}
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-gold-400 text-stone-900 py-3 rounded-xl font-medium hover:bg-gold-500 transition-colors"
          >
            {t.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-800"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{t.homeLink}</span>
          </a>
          <span className="text-stone-700 hidden sm:inline">|</span>
          <h1 className="text-xl font-serif font-medium text-stone-100">{t.title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-500" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-sm font-medium text-stone-400 focus:outline-none cursor-pointer"
            >
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-400 hidden md:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'bookings' ? 'bg-stone-800 text-stone-100' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            {t.bookings} ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'messages' ? 'bg-stone-800 text-stone-100' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {t.messages} ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'team' ? 'bg-stone-800 text-stone-100' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            <Users className="w-5 h-5" />
            {t.team} ({teamMembers.length})
          </button>
        </div>

        <div className="bg-stone-900 rounded-2xl shadow-sm border border-stone-800 overflow-hidden">
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">{t.colPeriod}</th>
                    <th className="p-4 font-medium">{t.colGuest}</th>
                    <th className="p-4 font-medium">{t.colPriceNights}</th>
                    <th className="p-4 font-medium">{t.status}</th>
                    <th className="p-4 font-medium text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-800/50 transition-colors">
                      {/* Check-in / Check-out */}
                      <td className="p-4">
                        <div className="font-medium text-stone-100">
                          {getCheckIn(booking)}
                        </div>
                        <div className="text-sm text-stone-500">
                          → {getCheckOut(booking)}
                        </div>
                      </td>

                      {/* Guest info */}
                      <td className="p-4">
                        <div className="font-medium text-stone-100">{getGuestName(booking)}</div>
                        <div className="text-sm text-stone-500">{booking.phone}</div>
                        {booking.note && (
                          <div className="mt-2 text-sm text-stone-300 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 max-w-xs whitespace-pre-wrap leading-snug">
                            {booking.note}
                          </div>
                        )}
                      </td>

                      {/* Price / Nights */}
                      <td className="p-4">
                        {booking.totalPrice != null ? (
                          <div className="font-medium text-stone-100">
                            {formatMoney(booking.totalPrice)}
                          </div>
                        ) : (
                          <div className="text-stone-500">—</div>
                        )}
                        {booking.nights != null && (
                          <div className="text-sm text-stone-500">{booking.nights} {t.nightsUnit}</div>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-900/30 text-emerald-400'
                            : booking.status === 'cancelled'
                            ? 'bg-stone-800 text-stone-500'
                            : 'bg-amber-900/30 text-amber-400'
                        }`}>
                          {booking.status === 'confirmed' && <Check className="w-3 h-3" />}
                          {booking.status === 'pending'   && <Clock className="w-3 h-3" />}
                          {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                          {booking.status === 'confirmed' ? t.statusConfirmed
                            : booking.status === 'cancelled' ? t.statusCancelled
                            : t.statusPending}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => updateStatus('bookings', booking.id, 'confirmed')}
                              className="p-2 text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title={t.confirmBtn}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus('bookings', booking.id, 'cancelled')}
                              className="p-2 text-amber-400 hover:bg-amber-900/20 rounded-lg transition-colors"
                              title={t.cancelBtn}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteItem('bookings', booking.id)}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500">{t.noBookings}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">{t.dateTime}</th>
                    <th className="p-4 font-medium">{t.sender}</th>
                    <th className="p-4 font-medium">{t.message}</th>
                    <th className="p-4 font-medium text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="p-4 text-sm text-stone-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-stone-100">{msg.name}</div>
                        <div className="text-sm text-stone-500">{msg.email}</div>
                      </td>
                      <td className="p-4 text-stone-400 max-w-md">
                        <p className="truncate">{msg.message}</p>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteItem('contactMessages', msg.id)}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-500">{t.noMessages}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              {/* ── Add admin by email ──────────────────────────────── */}
              <div className="p-6 border-b border-stone-800">
                <h2 className="text-lg font-semibold text-stone-100 mb-1 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-400" />
                  {t.addAdminTitle}
                </h2>
                <p className="text-sm text-stone-400 mb-4">
                  {t.addAdminDesc}
                </p>
                <div className="flex gap-3 max-w-lg">
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={newAdminEmail}
                    onChange={e => { setNewAdminEmail(e.target.value); setAdminEmailError(''); }}
                    onKeyDown={e => e.key === 'Enter' && addAdminEmail()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700
                               text-stone-100 placeholder-stone-500 outline-none
                               focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 text-sm"
                  />
                  <button
                    onClick={addAdminEmail}
                    disabled={addingAdmin || !newAdminEmail.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-stone-900
                               font-medium text-sm transition-colors disabled:opacity-50
                               disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    {addingAdmin ? t.addingBtn : t.addBtn}
                  </button>
                </div>
                {adminEmailError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {adminEmailError}
                  </p>
                )}
              </div>

              {/* ── Admin list ──────────────────────────────────────── */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-900/60 border-b border-stone-800 text-stone-400 text-sm">
                    <tr>
                      <th className="p-4 font-medium">{t.colGmail}</th>
                      <th className="p-4 font-medium">{t.colAddedDate}</th>
                      <th className="p-4 font-medium">{t.colAddedBy}</th>
                      <th className="p-4 font-medium">{t.status}</th>
                      <th className="p-4 font-medium text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {/* Superadmin fixed row */}
                    <tr className="hover:bg-stone-800/30 transition-colors">
                      <td className="p-4 font-medium text-stone-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gold-400 flex-shrink-0" />
                        amoron466@gmail.com
                      </td>
                      <td className="p-4 text-sm text-stone-500">—</td>
                      <td className="p-4 text-sm text-stone-500">{t.systemLabel}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gold-400/10 text-gold-400 border border-gold-400/20">
                          <Shield className="w-3 h-3" /> {t.superAdminLabel}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs text-stone-600">{t.protectedLabel}</span>
                      </td>
                    </tr>

                    {adminEmails.map((entry) => {
                      const isSignedIn = teamMembers.some(
                        m => m.email === entry.email && m.role === 'admin'
                      );
                      const isSelf = entry.email === (user?.email ?? '').toLowerCase();
                      return (
                        <tr key={entry.id} className="hover:bg-stone-800/30 transition-colors">
                          <td className="p-4 font-medium text-stone-100">{entry.email}</td>
                          <td className="p-4 text-sm text-stone-500 whitespace-nowrap">
                            {entry.addedAt
                              ? new Date(entry.addedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'mn-MN')
                              : '—'}
                          </td>
                          <td className="p-4 text-sm text-stone-500 truncate max-w-[160px]">
                            {entry.addedBy || '—'}
                          </td>
                          <td className="p-4">
                            {isSignedIn ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/40">
                                <Check className="w-3 h-3" /> {t.activeLabel}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-400 border border-stone-700">
                                <Clock className="w-3 h-3" /> {t.pendingSignInLabel}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => removeAdminEmail(entry.email)}
                              className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                              title={t.removeAdminTitle}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {adminEmails.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500 text-sm">
                          {t.noAdminsMsg}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
