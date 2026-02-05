import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldAlert, Trash2, Users, Heart } from 'lucide-react';
import api from '../api.ts';
import type { MatchItem } from '../types/domain.ts';
import { calculateAge, getDisplayName } from '../helpers.ts';
import DashboardLayout from '../components/layout/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import InfoItem from '../components/common/InfoItem';
import Section from '../components/layout/Section';
import DestructiveButton from '../components/form/DestructiveButton';
import { useToast } from '../context/toastContext.tsx';
import { DeleteConfirmationModal } from '../components/common/DeleteConfirmationModal';
import CenteredLoader from '../components/layout/CenteredLoader';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMatch(null);
      setLoading(false);
      return;
    }

    const fetchMatch = async () => {
      try {
        const response = await api.get<MatchItem>(`/matches/match-profile/${userId}`);
        setMatch(response.data);
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

    setIsDeleting(true);
    try {
      await api.delete('/matches/match', { params: { match_id: match.match_id } });
      showToast('Match deleted.', 'success');
      setIsDeleteModalOpen(false);
      navigate('/my-matches', { replace: true });
    } catch (error) {
      console.error('Failed to delete match:', error);
      showToast('Failed to delete match.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Match Profile">
      <div className="flex-1 px-4 py-8">
        {loading ? (
          <CenteredLoader
            text="Loading profile..."
            className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
          />
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
                  <p className="text-xs font-semibold tracking-wide text-textSecondary/80">Match profile</p>
                  <h1 className="mt-2 text-3xl font-bold text-textAccent">{getDisplayName(match)}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedAtLabel && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-borderAccentLight bg-bgSecondary/60 px-4 py-1.5 text-xs font-semibold text-textSecondary shadow-sm">
                      <Heart className="w-3.5 h-3.5 text-textAccent" />
                      Matched on {matchedAtLabel}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem
                  label="Age"
                  value={calculateAge(match.profile?.birth_date)}
                />
                <InfoItem label="Gender" value={match.profile?.gender?.name ?? 'Unknown'} />
                <InfoItem
                  label="Languages"
                  value={match.profile?.languages?.length
                    ? match.profile.languages.map(language => language.name).join(', ')
                    : 'Unknown'}
                />
                <InfoItem label="Religion" value={match.profile?.religion?.name ?? 'Unknown'} />
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
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="mt-4 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete match
                </DestructiveButton>
              </div>
            </div>

            <DeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDelete}
              title="Delete Match"
              description="Are you sure you want to delete this match? This action is permanent."
              isDeleting={isDeleting}
            />
          </Section>
        )}
      </div>
    </DashboardLayout>
  );
}