import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';

const ProfilePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const isOwner = isAuthenticated && user?.id === Number(id);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, eventsRes, rsvpsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/events`),
          api.get(`/users/${id}/rsvps`),
        ]);

        if (profileRes.success) {
          const profileData = profileRes.data.user;
          setProfile(profileData);
          setBio(profileData.bio || '');
          setAvatarPreview(profileData.avatar_url || '');
        }

        if (eventsRes.success) {
          setCreatedEvents(eventsRes.data.events || []);
        }

        if (rsvpsRes.success) {
          setAttendingEvents(rsvpsRes.data.events || []);
        }
      } catch (error) {
        console.error('Error fetching profile data', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      let avatarUrl = profile?.avatar_url || '';
      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const token = localStorage.getItem('token') || '';
        const uploadRes = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) avatarUrl = uploadData.data.url;
      }

      const updateRes = await api.put(`/users/${id}`, { bio, avatar_url: avatarUrl });
      if (updateRes.success) {
        setProfile((prev) => ({ ...prev, bio, avatar_url: avatarUrl }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (loading) return <div className="mt-10 text-center">Loading profile...</div>;
  if (!profile) return <div className="mt-10 text-center">Profile not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden bg-white p-6 shadow sm:rounded-lg">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0">
              <img className="mx-auto h-20 w-20 rounded-full" src={avatarPreview || 'https://via.placeholder.com/150'} alt={profile.name} />
              {isEditing && (
                <div className="mt-2 flex justify-center">
                  <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <span>Upload</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{profile.name}</p>
              <p className="text-sm font-medium text-gray-600">Joined {formatDate(profile.created_at)}</p>
              <p className="mt-1 text-sm text-gray-500">Role: {profile.role || 'Member'}</p>
              {isEditing ? (
                <textarea className="mt-2 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" rows="3" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Tell us about yourself..." />
              ) : (
                <p className="mt-2 text-md text-gray-800">{profile.bio || 'No bio provided.'}</p>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="mt-5 flex justify-center sm:mt-0">
              {isEditing ? (
                <div className="space-x-2">
                  <button type="button" onClick={handleSaveProfile} className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Save</button>
                  <button type="button" onClick={() => { setIsEditing(false); setBio(profile.bio || ''); setAvatarPreview(profile.avatar_url || ''); setAvatarFile(null); }} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Edit Profile</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select id="tabs" name="tabs" className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" value={activeTab} onChange={(event) => setActiveTab(event.target.value)}>
            <option value="created">My Events</option>
            <option value="attending">Attending</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button type="button" onClick={() => setActiveTab('created')} className={`${activeTab === 'created' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>My Events</button>
              <button type="button" onClick={() => setActiveTab('attending')} className={`${activeTab === 'attending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>Attending</button>
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'created' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Events Created by {profile.name}</h2>
            {createdEvents.length === 0 ? <p className="text-gray-500">No events created yet.</p> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{createdEvents.map((event) => <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h3 className="font-semibold text-gray-900">{event.title}</h3><p className="mt-1 text-sm text-gray-600">{event.location}</p></div>)}</div>}
          </div>
        )}
        {activeTab === 'attending' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Events {profile.name} is Attending</h2>
            {attendingEvents.length === 0 ? <p className="text-gray-500">Not attending any events yet.</p> : <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{attendingEvents.map((event) => <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h3 className="font-semibold text-gray-900">{event.title}</h3><p className="mt-1 text-sm text-gray-600">{event.location}</p></div>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
