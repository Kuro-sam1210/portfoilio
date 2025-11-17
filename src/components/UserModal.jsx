import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { toast } from 'sonner';
import { FiCopy, FiEdit2 } from 'react-icons/fi';

const truncateMiddle = (s, head = 6, tail = 4) => {
  if (!s) return '';
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}...${s.slice(-tail)}`;
};

const copyId = async (id) => {
  if (!id) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(id);
    } else {
      const ta = document.createElement('textarea');
      ta.value = id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast.success('ID copied to clipboard');
  } catch (e) {
    console.error('copy failed', e);
    toast.error('Failed to copy ID');
  }
};

const formatBalance = (u) => {
  const raw = u?.raw || u;
  const val = Number(raw?.balance ?? u?.balance ?? 0) || 0;
  const symbol = '$';
  return `${symbol}${new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)}`;
};

export default function UserModal() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState(null);

  // parse URL query param
  const readQuery = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('user');
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const onPop = () => setUserId(readQuery());
    // initial
    const initial = readQuery();
    console.debug('[UserModal] initial query user ->', initial);
    setUserId(initial);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    console.debug('[UserModal] userId changed ->', userId);
    const load = async () => {
      if (!userId) {
        setUser(null);
        return;
      }
      setLoading(true);
      try {
        // Use dummy user data
        const dummyUser = {
          userId: userId,
          _id: userId,
          id: userId,
          username: userId === 'ST20250001' ? 'john_doe' : userId === 'ST20250002' ? 'jane_smith' : 'user_' + userId,
          firstName: userId === 'ST20250001' ? 'John' : userId === 'ST20250002' ? 'Jane' : 'User',
          lastName: userId === 'ST20250001' ? 'Doe' : userId === 'ST20250002' ? 'Smith' : 'Name',
          email: userId === 'ST20250001' ? 'john@example.com' : userId === 'ST20250002' ? 'jane@example.com' : 'user@example.com',
          subscriptionPlan: 'Premium',
          balance: 150,
          isDisabled: false,
          verified: true,
          dateJoined: new Date().toISOString(),
          bio: 'Sample user bio',
          city: 'Lagos',
          state: 'LA',
          country: 'Nigeria',
          distance: 50,
          showDistance: true,
          showOnlineStatus: true,
          hobbies: ['Reading', 'Coding'],
          interests: ['Technology', 'Music'],
          gender: 'Male',
          dateOfBirth: '1995-03-15',
          ageRange: { start: 18, end: 35 },
          canWithdraw: true,
          profileVerification: true,
        };

        const id = dummyUser.userId || dummyUser._id || dummyUser.id || userId;
        const username = dummyUser.username || (dummyUser.email ? dummyUser.email.split('@')[0] : '');
        const first = dummyUser.firstName || dummyUser.first || '';
        const last = dummyUser.lastName || dummyUser.lastName || dummyUser.last || '';
        const fullName = `${first} ${last}`.trim() || username;
        const planRaw = dummyUser.subscriptionPlan ?? 'Free';
        const subscriptionPlan = planRaw && typeof planRaw === 'object' ? (planRaw.planName || planRaw.name || 'Free') : planRaw;

        const verifiedFlag = dummyUser.verified ?? dummyUser.isVerified ?? dummyUser.profileVerification ?? false;
        const newUser = {
          id,
          username,
          profilePic: dummyUser.picture || dummyUser.profilePic || '',
          fullName,
          email: dummyUser.email || '',
          subscriptionPlan,
          balance: typeof dummyUser.balance !== 'undefined' ? dummyUser.balance : (dummyUser.rawBalance || 0),
          isDisabled: dummyUser.isDisabled || false,
          verified: !!verifiedFlag,
          dateJoined: dummyUser.dateJoined ? new Date(dummyUser.dateJoined).toLocaleDateString() : '',
          raw: dummyUser,
        };
        setUser(newUser);
        setFormState({
          fullName: newUser.fullName || '',
          username: newUser.username || '',
          email: newUser.email || '',
          subscriptionPlan: newUser.subscriptionPlan || 'Free',
          verified: !!newUser.verified,
          bio: newUser.raw?.bio || '',
          city: newUser.raw?.city || '',
          state: newUser.raw?.state || '',
          country: newUser.raw?.country || '',
          distance: newUser.raw?.distance || 50,
          showDistance: newUser.raw?.showDistance ?? true,
          showOnlineStatus: newUser.raw?.showOnlineStatus ?? true,
          hobbies: Array.isArray(newUser.raw?.hobbies) ? newUser.raw.hobbies : [],
          interests: Array.isArray(newUser.raw?.interests) ? newUser.raw.interests : [],
          gender: newUser.raw?.gender || '',
          dateOfBirth: newUser.raw?.dateOfBirth ? new Date(newUser.raw.dateOfBirth).toISOString().split('T')[0] : '',
          ageRange: newUser.raw?.ageRange || { start: 18, end: 35 },
          canWithdraw: newUser.raw?.canWithdraw ?? true,
          isDisabled: newUser.raw?.isDisabled ?? false,
          profileVerification: newUser.raw?.profileVerification ?? false,
        });
      } catch (err) {
        console.error('[user modal] fetch error', err);
        toast.error('Failed to load user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const close = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('user');
      window.history.pushState({}, '', url);
      setUserId(null);
      setUser(null);
      setEditing(false);
    } catch (e) {
      // fallback
      window.history.pushState({}, '', window.location.pathname);
      setUserId(null);
      setUser(null);
      setEditing(false);
    }
  };

  const onEditToggle = () => setEditing((s) => !s);

  const onChange = (k, v) => setFormState((s) => ({ ...(s || {}), [k]: v }));

  const onArrayChange = (k, v) => {
    const arr = v.split(',').map(s => s.trim()).filter(s => s);
    setFormState((s) => ({ ...(s || {}), [k]: arr }));
  };

  const save = async () => {
    if (!userId || !formState) return;
    setLoading(true);
    try {
      // Simulate update with dummy data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Create updated user object
      const updatedUser = {
        userId: userId,
        _id: userId,
        id: userId,
        username: formState.username,
        firstName: formState.fullName.split(' ')[0] || '',
        lastName: formState.fullName.split(' ').slice(1).join(' ') || '',
        email: formState.email,
        subscriptionPlan: formState.subscriptionPlan,
        balance: user.balance,
        isDisabled: formState.isDisabled,
        verified: formState.verified,
        dateJoined: user.raw?.dateJoined || new Date().toISOString(),
        bio: formState.bio,
        city: formState.city,
        state: formState.state,
        country: formState.country,
        distance: formState.distance,
        showDistance: formState.showDistance,
        showOnlineStatus: formState.showOnlineStatus,
        hobbies: formState.hobbies,
        interests: formState.interests,
        gender: formState.gender,
        dateOfBirth: formState.dateOfBirth ? new Date(formState.dateOfBirth).toISOString() : null,
        ageRange: formState.ageRange,
        canWithdraw: formState.canWithdraw,
        profileVerification: formState.profileVerification,
      };

      // notify Users list to update
      window.dispatchEvent(new CustomEvent('admin:user-updated', { detail: updatedUser }));
      toast.success('User updated');

      // Update local state
      const id = updatedUser.userId || updatedUser._id || updatedUser.id || userId;
      const username = updatedUser.username || (updatedUser.email ? updatedUser.email.split('@')[0] : '');
      const first = updatedUser.firstName || updatedUser.first || '';
      const last = updatedUser.lastName || updatedUser.lastName || updatedUser.last || '';
      const fullName = `${first} ${last}`.trim() || username;
      const planRaw = updatedUser.subscriptionPlan ?? 'Free';
      const subscriptionPlan = planRaw && typeof planRaw === 'object' ? (planRaw.planName || planRaw.name || 'Free') : planRaw;
      const verifiedFlag = updatedUser.verified ?? updatedUser.isVerified ?? updatedUser.profileVerification ?? false;

      const newUser = {
        id,
        username,
        profilePic: updatedUser.picture || updatedUser.profilePic || '',
        fullName,
        email: updatedUser.email || '',
        subscriptionPlan,
        balance: typeof updatedUser.balance !== 'undefined' ? updatedUser.balance : (updatedUser.rawBalance || 0),
        isDisabled: updatedUser.isDisabled || false,
        verified: !!verifiedFlag,
        dateJoined: updatedUser.dateJoined ? new Date(updatedUser.dateJoined).toLocaleDateString() : '',
        raw: updatedUser,
      };

      setUser(newUser);
      setFormState({
        fullName: newUser.fullName || '',
        username: newUser.username || '',
        email: newUser.email || '',
        subscriptionPlan: newUser.subscriptionPlan || 'Free',
        verified: !!newUser.verified,
        bio: newUser.raw?.bio || '',
        city: newUser.raw?.city || '',
        state: newUser.raw?.state || '',
        country: newUser.raw?.country || '',
        distance: newUser.raw?.distance || 50,
        showDistance: newUser.raw?.showDistance ?? true,
        showOnlineStatus: newUser.raw?.showOnlineStatus ?? true,
        hobbies: Array.isArray(newUser.raw?.hobbies) ? newUser.raw.hobbies : [],
        interests: Array.isArray(newUser.raw?.interests) ? newUser.raw.interests : [],
        gender: newUser.raw?.gender || '',
        dateOfBirth: newUser.raw?.dateOfBirth ? new Date(newUser.raw.dateOfBirth).toISOString().split('T')[0] : '',
        ageRange: newUser.raw?.ageRange || { start: 18, end: 35 },
        canWithdraw: newUser.raw?.canWithdraw ?? true,
        isDisabled: newUser.raw?.isDisabled ?? false,
        profileVerification: newUser.raw?.profileVerification ?? false,
      });
      setEditing(false);
    } catch (err) {
      console.error('[user modal] update error', err);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button onClick={close} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:opacity-90">Close</button>
      {!editing ? (
        <button onClick={onEditToggle} className="px-4 py-2 rounded-lg bg-[var(--color-primary-cyan)] text-white">Edit</button>
      ) : (
        <>
          <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)]">Cancel</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-[var(--color-accent-green)] text-white">Save</button>
        </>
      )}
    </>
  );

  return (
    <Modal
      isOpen={!!userId}
      onClose={close}
      title={user ? `User Profile • ${user.fullName}` : 'User Profile'}
      size="lg"
      footer={footer}
    >
      {loading ? (
        <div className="py-6 text-center text-[var(--color-text-secondary)]">Loading...</div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {(user.profilePic || user.raw?.picture) ? (
                <img src={user.profilePic || user.raw?.picture} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zM4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor"/></svg></div>
              )}
              <div>
                {!editing ? (
                  <>
                    <div className="text-[var(--color-text-primary)] font-semibold">{user.fullName}</div>
                    <div className="text-[var(--color-text-secondary)] text-sm">{user.email}</div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <input className="w-full px-3 py-1 rounded border" value={formState?.fullName || ''} onChange={(e) => onChange('fullName', e.target.value)} />
                    <input className="w-full px-3 py-1 rounded border text-sm" value={formState?.email || ''} onChange={(e) => onChange('email', e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--color-text-secondary)]">Balance</div>
              <div className="text-[var(--color-text-primary)] font-semibold">{formatBalance(user)}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">User ID</div>
              <div className="flex items-center gap-2">
                <div className="text-[var(--color-text-primary)] font-mono">{truncateMiddle(user.id || user.raw?.userId)}</div>
                <button onClick={() => copyId(user.id || user.raw?.userId)} title="Copy ID" className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]">
                  <FiCopy className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
              </div>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Plan</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.subscriptionPlan}{user.raw?.subscriptionPlan && typeof user.raw.subscriptionPlan === 'object' ? ` • ${user.raw.subscriptionPlan.planName || ''}` : ''}</div>
              ) : (
                <select className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.subscriptionPlan} onChange={(e) => onChange('subscriptionPlan', e.target.value)}>
                  <option value="Free">Free</option>
                  <option value="Orbit">Orbit</option>
                  <option value="Starlight">Starlight</option>
                  <option value="Nova">Nova</option>
                  <option value="Equinox">Equinox</option>
                  <option value="Polaris">Polaris</option>
                  <option value="Orion">Orion</option>
                  <option value="Cosmos">Cosmos</option>
                </select>
              )}
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Status</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.isDisabled ? 'Suspended' : user.verified ? 'Verified' : 'Active'}</div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Verified</label>
                  <input type="checkbox" checked={!!formState?.verified} onChange={(e) => onChange('verified', e.target.checked)} />
                </div>
              )}
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Active</div>
              <div className="text-[var(--color-text-primary)]">{user.raw?.active !== false ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Full Name</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.fullName}</div>
              ) : (
                <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.fullName || ''} onChange={(e) => onChange('fullName', e.target.value)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Username</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.username || user.raw?.username}</div>
              ) : (
                <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.username || ''} onChange={(e) => onChange('username', e.target.value)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Referral Code</div>
              <div className="text-[var(--color-text-primary)]">{user.raw?.referralCode || ''}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Gender</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.gender || ''}</div>
              ) : (
                <select className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.gender || ''} onChange={(e) => onChange('gender', e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              )}
            </div>

            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Location</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{[user.raw?.city, user.raw?.state, user.raw?.country].filter(Boolean).join(', ')}</div>
              ) : (
                <div className="space-y-1">
                  <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" placeholder="City" value={formState?.city || ''} onChange={(e) => onChange('city', e.target.value)} />
                  <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" placeholder="State" value={formState?.state || ''} onChange={(e) => onChange('state', e.target.value)} />
                  <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" placeholder="Country" value={formState?.country || ''} onChange={(e) => onChange('country', e.target.value)} />
                </div>
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Distance</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.distance ?? ''} km</div>
              ) : (
                <input type="number" className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.distance || 50} onChange={(e) => onChange('distance', parseInt(e.target.value))} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Show Distance / Online</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.showDistance ? 'Yes' : 'No'} / {user.raw?.showOnlineStatus ? 'Yes' : 'No'}</div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Distance</label>
                  <input type="checkbox" checked={!!formState?.showDistance} onChange={(e) => onChange('showDistance', e.target.checked)} />
                  <label className="text-sm">Online</label>
                  <input type="checkbox" checked={!!formState?.showOnlineStatus} onChange={(e) => onChange('showOnlineStatus', e.target.checked)} />
                </div>
              )}
            </div>

            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Date of Birth</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.dateOfBirth ? new Date(user.raw.dateOfBirth).toLocaleDateString() : ''}</div>
              ) : (
                <input type="date" className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.dateOfBirth || ''} onChange={(e) => onChange('dateOfBirth', e.target.value)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Age Range</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.ageRange ? `${user.raw.ageRange.start}-${user.raw.ageRange.end}` : ''}</div>
              ) : (
                <div className="flex gap-1">
                  <input type="number" placeholder="Min" className="w-16 px-2 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.ageRange?.start || 18} onChange={(e) => onChange('ageRange', { ...formState.ageRange, start: parseInt(e.target.value) })} />
                  <span className="text-[var(--color-text-primary)]">-</span>
                  <input type="number" placeholder="Max" className="w-16 px-2 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" value={formState?.ageRange?.end || 35} onChange={(e) => onChange('ageRange', { ...formState.ageRange, end: parseInt(e.target.value) })} />
                </div>
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Can Withdraw</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.canWithdraw ? 'Yes' : 'No'}</div>
              ) : (
                <input type="checkbox" checked={!!formState?.canWithdraw} onChange={(e) => onChange('canWithdraw', e.target.checked)} />
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Bio</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.bio || ''}</div>
              ) : (
                <textarea className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" rows="3" value={formState?.bio || ''} onChange={(e) => onChange('bio', e.target.value)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Hobbies</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{Array.isArray(user.raw?.hobbies) ? user.raw.hobbies.join(', ') : ''}</div>
              ) : (
                <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" placeholder="Comma separated" value={formState?.hobbies?.join(', ') || ''} onChange={(e) => onArrayChange('hobbies', e.target.value)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Interests</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{Array.isArray(user.raw?.interests) ? user.raw.interests.join(', ') : ''}</div>
              ) : (
                <input className="w-full px-3 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-bg-tertiary)]" placeholder="Comma separated" value={formState?.interests?.join(', ') || ''} onChange={(e) => onArrayChange('interests', e.target.value)} />
              )}
            </div>

            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Affiliates</div>
              <div className="text-[var(--color-text-primary)]">{Array.isArray(user.raw?.affiliates) ? user.raw.affiliates.join(', ') : ''}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Blocked Users</div>
              <div className="text-[var(--color-text-primary)]">{Array.isArray(user.raw?.blockedUsers) ? user.raw.blockedUsers.join(', ') : ''}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Profile Verification</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.profileVerification ? 'Yes' : 'No'}</div>
              ) : (
                <input type="checkbox" checked={!!formState?.profileVerification} onChange={(e) => onChange('profileVerification', e.target.checked)} />
              )}
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Disabled</div>
              {!editing ? (
                <div className="text-[var(--color-text-primary)]">{user.raw?.isDisabled ? 'Yes' : 'No'}</div>
              ) : (
                <input type="checkbox" checked={!!formState?.isDisabled} onChange={(e) => onChange('isDisabled', e.target.checked)} />
              )}
            </div>

            <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4">
              <div className="text-xs text-[var(--color-text-secondary)]">Created At</div>
              <div className="text-[var(--color-text-primary)]">{user.raw?.createdAt ? new Date(user.raw.createdAt).toLocaleString() : ''}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Updated At</div>
              <div className="text-[var(--color-text-primary)]">{user.raw?.updatedAt ? new Date(user.raw.updatedAt).toLocaleString() : ''}</div>
              <div className="text-xs text-[var(--color-text-secondary)] mt-2">Date Joined</div>
              <div className="text-[var(--color-text-primary)]">{user.raw?.dateJoined ? new Date(user.raw.dateJoined).toLocaleString() : ''}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-[var(--color-text-secondary)]">No user selected</div>
      )}
    </Modal>
  );
}
