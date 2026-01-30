import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { Users } from 'lucide-react';
import api from '../api.ts';
import type { MatchItem } from '../types/domain.ts';
import { getDisplayName } from '../helpers.ts';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import PrimaryButton from '../components/form/PrimaryButton';
import { useToast } from '../context/toastContext.tsx';

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

export default function MatchProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setMatch(null);
      setLoading(false);
      return;
    }

    const fetchMatch = async () => {
      try {
        const response = await api.get<MatchItem[]>('/matches/mine');
        const found = (response.data ?? []).find((item) => item.profile?.user_id === userId) ?? null;
        setMatch(found);
      } catch (error) {
        console.error('Failed to load match profile:', error);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [userId]);

  const matchedAtLabel = useMemo(() => formatDate(match?.matched_at), [match?.matched_at]);

  const handleDelete = async () => {
    if (!match?.match_id) {
      showToast('Match cannot be deleted right now.', 'error');
      return;
    }

    const confirmed = window.confirm('Delete this match?');
    if (!confirmed) return;

    try {
      await api.delete('/matches/match', { params: { match_id: match.match_id } });
      showToast('Match deleted.', 'success');
      navigate('/my-matches', { replace: true });
    } catch (error) {
      console.error('Failed to delete match:', error);
      showToast('Failed to delete match.', 'error');
    }
  };

  return (
    <DashboardLayout title="Match Profile">
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center w-full">
            <Spinner color="purple" size="lg" />
          </div>
        ) : !match?.profile ? (
          <EmptyState
            icon={Users}
            title="Match not found"
            description="Select a match from the sidebar to view their profile."
          />
        ) : (
          <div className="w-full max-w-2xl bg-bgPrimary border border-borderAccentLight rounded-2xl shadow-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-textAccent">{getDisplayName(match)}</h1>
                {matchedAtLabel && (
                  <p className="text-sm text-textSecondary">Matched {matchedAtLabel}</p>
                )}
              </div>
              <span className="text-xs text-textSecondary">User ID: {match.profile?.user_id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-textSecondary">Birth date</p>
                <p className="text-textPrimary font-medium">{formatDate(match.profile?.birth_date) || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-textSecondary">Gender</p>
                <p className="text-textPrimary font-medium">{match.profile?.gender_id ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-textSecondary">Language</p>
                <p className="text-textPrimary font-medium">{match.profile?.language_id ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-textSecondary">Religion</p>
                <p className="text-textPrimary font-medium">{match.profile?.religion_id ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-textSecondary">Smoker</p>
                <p className="text-textPrimary font-medium">
                  {match.profile?.is_smoker === null || match.profile?.is_smoker === undefined
                    ? 'Unknown'
                    : match.profile?.is_smoker
                      ? 'Yes'
                      : 'No'}
                </p>
              </div>
              <div>
                <p className="text-textSecondary">Wants children</p>
                <p className="text-textPrimary font-medium">
                  {match.profile?.wants_children === null || match.profile?.wants_children === undefined
                    ? 'Not sure'
                    : match.profile?.wants_children
                      ? 'Yes'
                      : 'No'}
                </p>
              </div>
            </div>

            <PrimaryButton
              type="button"
              onClick={handleDelete}
              className="mt-8 bg-red-600 hover:bg-red-700"
            >
              Delete match
            </PrimaryButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}