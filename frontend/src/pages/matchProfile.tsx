import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { ShieldAlert, Trash2, Users } from 'lucide-react';
import api from '../api.ts';
import type { MatchItem } from '../types/domain.ts';
import { getDisplayName } from '../helpers.ts';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import InfoItem from '../components/common/InfoItem';
import Section from '../components/layout/Section';
import DestructiveButton from '../components/form/DestructiveButton';
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
      <div className="flex-1 px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center w-full min-h-[60vh]">
            <Spinner color="purple" size="lg" className="animate-spin" />
          </div>
        ) : !match?.profile ? (
          <Section maxWidth="lg">
            <EmptyState
              icon={Users}
              title="Match not found"
              description="Select a match from the sidebar to view their profile."
            />
          </Section>
        ) : (
          <Section maxWidth="2xl">
            <div className="w-full bg-bgPrimary/95 border border-borderAccentLight rounded-3xl shadow-2xl p-6 md:p-8 space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">Match profile</p>
                  <h1 className="mt-2 text-3xl font-bold text-textAccent">{getDisplayName(match)}</h1>
                  {matchedAtLabel && (
                    <p className="mt-2 text-sm text-textSecondary">Matched {matchedAtLabel}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.profile?.user_id && (
                    <span className="inline-flex items-center rounded-full border border-borderAccentLight bg-bgSecondary/60 px-3 py-1 text-xs font-semibold text-textSecondary">
                      User ID: {match.profile.user_id}
                    </span>
                  )}
                  {matchedAtLabel && (
                    <span className="inline-flex items-center rounded-full border border-borderAccentLight bg-bgSecondary/60 px-3 py-1 text-xs font-semibold text-textSecondary">
                      Matched {matchedAtLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem
                  label="Birth date"
                  value={formatDate(match.profile?.birth_date) || 'Unknown'}
                />
                <InfoItem label="Gender" value={match.profile?.gender_id ?? 'Unknown'} />
                <InfoItem
                  label="Languages"
                  value={match.profile?.languages?.length
                    ? match.profile.languages.map(language => language.name).join(', ')
                    : 'Unknown'}
                />
                <InfoItem label="Religion" value={match.profile?.religion_id ?? 'Unknown'} />
                <InfoItem
                  label="Smoker"
                  value={match.profile?.is_smoker === null || match.profile?.is_smoker === undefined
                    ? 'Unknown'
                    : match.profile?.is_smoker
                      ? 'Yes'
                      : 'No'}
                />
                <InfoItem
                  label="Wants children"
                  value={match.profile?.wants_children === null || match.profile?.wants_children === undefined
                    ? 'Not sure'
                    : match.profile?.wants_children
                      ? 'Yes'
                      : 'No'}
                />
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-textPrimary">Danger zone</h2>
                    <p className="text-xs text-textSecondary mt-1">
                      Removing this match is permanent and will delete your conversation history.
                    </p>
                  </div>
                </div>
                <DestructiveButton
                  type="button"
                  onClick={handleDelete}
                  className="mt-4 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete match
                </DestructiveButton>
              </div>
            </div>
          </Section>
        )}
      </div>
    </DashboardLayout>
  );
}