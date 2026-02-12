/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Tabs as FlowbiteTabs,
  Button,
  TextInput,
  Modal as FlowbiteModal,
  Pagination,
  Select
} from 'flowbite-react';
import { Trash2, UserPlus, ShieldAlert, CheckCircle, Ban, Undo2, Link as LinkIcon, Copy, LogOut, Eye, X } from 'lucide-react';
import api from '../../api';
import { useToast } from '../../context/toastContext';
import { commonInputClasses } from '../../components/form/formStyles';

// CASTING:
// We cast these to 'any' to bypass TypeScript errors regarding missing static properties
// (like Tabs.Item or Modal.Header) which are causing issues in your build.
const Tabs = FlowbiteTabs as any;
const Modal = FlowbiteModal as any;

const paginationTheme = {
  pages: {
    base: "xs:mt-0 mt-2 inline-flex items-center space-x-4",
    previous: {
      base: "ml-0 rounded-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
    },
    next: {
      base: "rounded-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
    },
    selector: {
      base: "w-10 rounded-lg border border-gray-300 bg-white py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
    },
  },
};

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

interface UserReport {
  id: number;
  reporter_email: string;
  reason: string;
  created_at: string;
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

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bannedFilter, setBannedFilter] = useState<'all' | 'banned' | 'active'>('active');
  const itemsPerPage = 10;

  const [selectedUserForReports, setSelectedUserForReports] = useState<UserReportSummary | null>(null);
  const [currentReports, setCurrentReports] = useState<UserReport[]>([]);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

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
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (bannedFilter === 'banned') params.disabled = true;
      if (bannedFilter === 'active') params.disabled = false;

      const res = await api.get('/users/reported-summary', { params });
      setReportedUsers(res.data.items);
      setTotalPages(Math.ceil(res.data.total / itemsPerPage));
    } catch {
      showToast('Error fetching reported users', 'error');
    }
  }, [showToast, currentPage, bannedFilter]);

  useEffect(() => {
    void fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    void fetchReportedSummary();
  }, [fetchReportedSummary]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const fetchUserReports = async (user: UserReportSummary) => {
    try {
      const res = await api.get(`/users/reports/${user.user_id}`);
      setCurrentReports(res.data);
      setSelectedUserForReports(user);
      setIsReportsModalOpen(true);
    } catch {
      showToast('Failed to fetch reports', 'error');
    }
  };

  return (
    <div className="p-8 bg-bgPrimary text-textPrimary min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-textAccent">Admin Dashboard</h1>
        <Button color="failure" size="sm" onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs aria-label="Admin tasks" variant="underline">
        <Tabs.Item active title="Users & Reports" icon={ShieldAlert}>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Reported Users</h2>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <Select
                value={bannedFilter}
                onChange={(e) => {
                  setBannedFilter(e.target.value as 'all' | 'banned' | 'active');
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="w-full md:w-auto mb-4 md:mb-0"
              >
                <option value="all">All Users</option>
                <option value="banned">Banned Users</option>
                <option value="active">Active Users</option>
              </Select>

              {totalPages > 1 && (
                <Pagination
                  theme={paginationTheme}
                  className="mt-4 md:mt-0"
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                  showIcons
                  totalPages={totalPages}
                />
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-center">Reports</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-bgSecondary">
                  {reportedUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-textPrimary">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none ${u.report_count > 5 ? 'text-red-100 bg-red-600' : 'text-orange-100 bg-orange-500'} rounded-full`}>
                          {u.report_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.disabled ? <span className="text-red-500 font-bold">BANNED</span> : 'Active'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button size="xs" color="gray" onClick={() => fetchUserReports(u)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
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

        <Tabs.Item title="Manage Attributes" icon={CheckCircle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
             <LookupSection title="Genders" items={genders} onAdd={(name) => addLookup('genders', name)} onDelete={(id) => deleteLookup('genders', id)} />
             <LookupSection title="Languages" items={languages} onAdd={(name) => addLookup('languages', name)} onDelete={(id) => deleteLookup('languages', id)} />
             <LookupSection title="Religions" items={religions} onAdd={(name) => addLookup('religions', name)} onDelete={(id) => deleteLookup('religions', id)} />
          </div>
        </Tabs.Item>

        <Tabs.Item title="Manage Admins" icon={UserPlus}>
          <div className="mt-6 max-w-2xl">
            <div className="bg-bgSecondary p-6 rounded-xl shadow-lg border border-borderAccentLight/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-textAccent/10 rounded-lg">
                  <UserPlus className="h-6 w-6 text-textAccent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-textPrimary">Create New Admin</h2>
                  <p className="text-sm text-textSecondary">Invite a new administrator by generating a secure, one-time registration link.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-bgPrimary/50 rounded-lg border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-textPrimary mb-2 uppercase tracking-wider">Instructions</h3>
                  <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                    <li>The generated link can only be used <strong>once</strong>.</li>
                    <li>The link will expire in <strong>30 minutes</strong>.</li>
                    <li>The recipient will be prompted to create an account with admin privileges.</li>
                  </ul>
                </div>

                {!adminToken ? (
                  <Button
                    className="w-full md:w-auto"
                    onClick={generateAdminToken}
                  >
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Generate Invitation Link
                  </Button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="p-3 bg-bgPrimary/40 rounded flex flex-col md:flex-row items-center gap-3">
                        <div className="flex-1 font-mono text-xs text-green-400 break-all select-all p-2 bg-black/20 rounded border border-black/10">
                          {window.location.origin}/register?token={adminToken}&type=admin
                        </div>
                        <Button
                          size="sm"
                          color="success"
                          className="w-full md:w-auto"
                          onClick={() => {
                            void navigator.clipboard.writeText(`${window.location.origin}/register?token=${adminToken}&type=admin`);
                            showToast('Link copied to clipboard!', 'success');
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <p className="text-xs text-green-500/80 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Link generated successfully
                      </p>
                      <button
                        onClick={() => setAdminToken(null)}
                        className="text-xs text-textSecondary hover:text-textPrimary transition-colors"
                      >
                        Generate another?
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs.Item>
      </Tabs>

      {/* Reports Modal */}
      {/* FIX: We use the Modal wrapper but replace Modal.Header/Body/Footer with div to avoid 'undefined' errors */}
      <Modal show={isReportsModalOpen} onClose={() => setIsReportsModalOpen(false)} size="xl">
        <div className="bg-bgSecondary rounded-lg text-textPrimary">
            {/* Custom Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold">
                    Reports for {selectedUserForReports?.email}
                </h3>
                <button
                    onClick={() => setIsReportsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Custom Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {currentReports.length > 0 ? (
                currentReports.map((report) => (
                    <div key={report.id} className="p-4 bg-bgPrimary/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-textAccent">Reporter: {report.reporter_email}</span>
                        <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 italic">"{report.reason}"</p>
                    </div>
                ))
                ) : (
                <p className="text-center text-gray-500 py-8">No detailed reports found.</p>
                )}
            </div>

            {/* Custom Footer */}
            <div className="flex items-center justify-end p-4 border-t border-gray-700">
                <Button color="gray" onClick={() => setIsReportsModalOpen(false)}>
                    Close
                </Button>
            </div>
        </div>
      </Modal>
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
