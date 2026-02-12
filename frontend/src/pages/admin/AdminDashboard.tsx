/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Tabs as FlowbiteTabs, // 1. Rename the import
  Button,
  TextInput
} from 'flowbite-react';
import { Trash2, UserPlus, ShieldAlert, CheckCircle, Ban, Undo2 } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/toastContext';
import { commonInputClasses } from '../../components/form/formStyles';

// 2. Cast 'Tabs' to 'any'.
// This forces TypeScript to accept <Tabs.Item> without errors,
// matching the fact that it already works in the browser.
const Tabs = FlowbiteTabs as any;

interface GenericLookup {
  id: number;
  name: string;
}

interface UserReportSummary {
  user_id: string;
  email: string;
  report_count: number;
  disabled: boolean;
}

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();

  // Lookup Data
  const [genders, setGenders] = useState<GenericLookup[]>([]);
  const [languages, setLanguages] = useState<GenericLookup[]>([]);
  const [religions, setReligions] = useState<GenericLookup[]>([]);

  // User Data
  const [reportedUsers, setReportedUsers] = useState<UserReportSummary[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const fetchLookups = useCallback(async () => {
    try {
      const g = await api.get('/profile/genders');
      const l = await api.get('/profile/languages');
      const r = await api.get('/profile/religions');
      setGenders(g.data);
      setLanguages(l.data);
      setReligions(r.data);
    } catch {
      showToast('Error fetching lookups', 'error');
    }
  }, [showToast]);

  const fetchReportedSummary = useCallback(async () => {
    try {
      const res = await api.get('/users/reported-summary');
      setReportedUsers(res.data);
    } catch {
      showToast('Error fetching reported users', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchLookups();
    void fetchReportedSummary();
  }, [fetchLookups, fetchReportedSummary]);

  const handleBan = async (userId: string, value: boolean) => {
    try {
      await api.post('/users/ban', { user_id: userId, value });
      showToast(value ? 'User banned' : 'User unbanned', 'success');
      void fetchReportedSummary();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const generateAdminToken = async () => {
    try {
      const res = await api.get('/auth/register-admin-token');
      setAdminToken(res.data);
    } catch {
      showToast('Failed to generate token', 'error');
    }
  };

  const deleteLookup = async (type: 'genders' | 'languages' | 'religions', id: number) => {
    const typeSingular = type.slice(0, -1);
    if (!window.confirm(`Are you sure you want to delete this ${typeSingular}?`)) {
      return;
    }

    try {
      await api.delete(`/profile/${type}?${type.slice(0, -1)}_id=${id}`);
      showToast('Deleted successfully', 'success');
      void fetchLookups();
    } catch (e: any) {
      const errorMsg = e.response?.data?.detail || 'Delete failed';
      showToast(errorMsg, 'error');
    }
  };

  const addLookup = async (type: 'genders' | 'languages' | 'religions', name: string) => {
    try {
      await api.post(`/profile/${type}`, { name });
      showToast('Added successfully', 'success');
      void fetchLookups();
    } catch {
      showToast('Add failed', 'error');
    }
  };

  return (
    <div className="p-8 bg-bgPrimary text-textPrimary min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-textAccent">Admin Dashboard</h1>
        <Button color="failure" onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }}>Logout</Button>
      </div>

      <Tabs aria-label="Admin tasks" variant="underline">
        <Tabs.Item active title="Users & Reports" icon={ShieldAlert}>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Reported Users (Most reported first)</h2>

            {/* MANUAL TABLE IMPLEMENTATION FOR DARK MODE SUPPORT */}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Reports</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-bgSecondary">
                  {reportedUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-textPrimary">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">{u.report_count}</td>
                      <td className="px-6 py-4">
                        {u.disabled ? <span className="text-red-500 font-bold">BANNED</span> : 'Active'}
                      </td>
                      <td className="px-6 py-4">
                        {u.disabled ? (
                          <Button size="xs" color="success" onClick={() => handleBan(u.user_id, false)}>
                            <Undo2 className="mr-2 h-4 w-4" /> Unban
                          </Button>
                        ) : (
                          <Button size="xs" color="failure" onClick={() => handleBan(u.user_id, true)}>
                            <Ban className="mr-2 h-4 w-4" /> Ban
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reportedUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No reported users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </Tabs.Item>

        <Tabs.Item title="Lookup Data" icon={CheckCircle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
             <LookupSection title="Genders" items={genders} onAdd={(name) => addLookup('genders', name)} onDelete={(id) => deleteLookup('genders', id)} />
             <LookupSection title="Languages" items={languages} onAdd={(name) => addLookup('languages', name)} onDelete={(id) => deleteLookup('languages', id)} />
             <LookupSection title="Religions" items={religions} onAdd={(name) => addLookup('religions', name)} onDelete={(id) => deleteLookup('religions', id)} />
          </div>
        </Tabs.Item>

        <Tabs.Item title="Manage Admins" icon={UserPlus}>
          <div className="mt-4 max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Create New Admin</h2>
            <p className="text-gray-400 mb-4">Generate a one-time registration token for a new admin. Share this link with them.</p>
            <Button onClick={generateAdminToken}>Generate Admin Registration Link</Button>

            {adminToken && (
               <div className="mt-4 p-4 bg-green-900/20 rounded border border-green-500/50 text-green-300">
                  <p className="font-mono break-all text-xs mb-2">
                    {window.location.origin}/register?token={adminToken}&type=admin
                  </p>
                  <Button size="xs" color="success" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/register?token=${adminToken}&type=admin`)}>Copy Link</Button>
               </div>
            )}
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

interface LookupSectionProps {
  title: string;
  items: GenericLookup[];
  onAdd: (name: string) => void;
  onDelete: (id: number) => void;
}

const LookupSection: React.FC<LookupSectionProps> = ({ title, items, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');

  return (
    <div className="bg-bgSecondary p-4 rounded-lg shadow-lg border border-borderAccentLight/20 flex flex-col h-[500px]">
      <h3 className="text-lg font-bold mb-4 text-textAccent">{title}</h3>
      <div className="flex gap-2 mb-4">
        <TextInput
          placeholder={`Add ${title}...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={`flex-1 ${commonInputClasses}`}
        />
        <Button onClick={() => { if(newName) { onAdd(newName); setNewName(''); } }}>Add</Button>
      </div>

      {/* REPLACED TABLE WITH CUSTOM LIST */}
      <div className="flex-1 overflow-y-auto border border-gray-700/50 rounded-md bg-bgPrimary/30">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-700/50">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between items-center p-3 hover:bg-white/5 transition-colors">
                <span className="font-medium text-textPrimary pl-2">{item.name}</span>
                <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-white/10 transition-all"
                    title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
                No items added yet
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
