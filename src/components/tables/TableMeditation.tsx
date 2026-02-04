"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteMantra, favoriteMantra, getAllMantras } from "@/lib/api/mantras";
import AudioPlayer from "@/components/AudioPlayer";
import ModalConfirmDelete from "@/components/modals/ModalConfirmDelete";
import Toast from "@/components/Toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteMeditation,
  toggleFavorite,
  setError,
  setLoading,
  setMeditations,
} from "@/store/features/meditationSlice";

export default function TableMeditation() {
  const dispatch = useAppDispatch();
  const { meditations, loading, error } = useAppSelector(
    (state) => state.meditation,
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const fetchMeditations = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await getAllMantras(isAuthenticated);
      dispatch(setMeditations(response.mantras ?? []));
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        "Unable to load meditations. Please try again.";
      dispatch(setError(message));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  const visibleRows = useMemo(() => {
    const safeMeditations = Array.isArray(meditations) ? meditations : [];
    if (!isAuthenticated) {
      return safeMeditations.filter(
        (meditation) => meditation.visibility?.toLowerCase() === "public",
      );
    }

    return safeMeditations.filter(
      (meditation) =>
        meditation.visibility?.toLowerCase() === "public" || meditation.isOwned,
    );
  }, [isAuthenticated, meditations]);

  const handleToggleFavorite = async (mantraId: number, currentValue?: boolean) => {
    if (!isAuthenticated) return;
    const nextValue = !currentValue;
    dispatch(toggleFavorite({ id: mantraId, isFavorite: nextValue }));

    try {
      await favoriteMantra(mantraId, nextValue);
    } catch (err) {
      dispatch(toggleFavorite({ id: mantraId, isFavorite: !nextValue }));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteMantra(deleteTarget.id);
      dispatch(deleteMeditation(deleteTarget.id));
      setToast({ message: "Meditation deleted.", variant: "success" });
      setDeleteTarget(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setToast({ message: "You can only delete your own meditations.", variant: "error" });
      } else if (status === 404) {
        setToast({ message: "Meditation not found.", variant: "error" });
      } else {
        setToast({ message: "Unable to delete meditation. Please try again.", variant: "error" });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-calm-200/70 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:border-primary-200"
        aria-expanded={isExpanded}
      >
        <div>
          <h2 className="text-xl font-display font-semibold text-calm-900">
            Meditations
          </h2>
          <p className="text-sm text-calm-500">Explore the community library</p>
        </div>
        <span className="text-calm-500">
          {isExpanded ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="rounded-3xl border border-calm-200/70 bg-white p-4 shadow-sm md:p-6">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-calm-100 bg-calm-50 px-4 py-3 animate-pulse"
                >
                  <div className="h-4 w-1/2 rounded-full bg-calm-200" />
                  <div className="h-4 w-16 rounded-full bg-calm-200" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchMeditations}
                className="mt-3 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <div className="max-h-[360px] min-w-[520px] overflow-y-auto rounded-2xl border border-calm-100">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur">
                    <tr className="text-calm-500">
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Play</th>
                      {isAuthenticated && (
                        <th className="px-4 py-3 text-center font-semibold">Favorite</th>
                      )}
                      <th className="px-4 py-3 text-right font-semibold">
                        Listens
                      </th>
                      {isAuthenticated && (
                        <th className="px-4 py-3 text-right font-semibold">Delete</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={isAuthenticated ? 5 : 3}
                          className="px-4 py-6 text-center text-calm-500"
                        >
                          No meditations available yet.
                        </td>
                      </tr>
                    )}
                    {visibleRows.map((meditation) => (
                      <tr
                        key={meditation.id}
                        className="border-t border-calm-100 text-calm-700"
                      >
                        <td className="px-4 py-3 font-medium text-calm-900">
                          {meditation.title}
                        </td>
                        <td className="px-4 py-3">
                          <AudioPlayer mantraId={meditation.id} title={meditation.title} />
                        </td>
                        {isAuthenticated && (
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleFavorite(meditation.id, meditation.isFavorite)
                              }
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
                                meditation.isFavorite
                                  ? "border-amber-200 bg-amber-50 text-amber-500"
                                  : "border-calm-200 text-calm-400 hover:border-primary-200 hover:text-primary-700"
                              }`}
                              aria-label={
                                meditation.isFavorite
                                  ? `Remove ${meditation.title} from favorites`
                                  : `Add ${meditation.title} to favorites`
                              }
                            >
                              ★
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3 text-right text-calm-600">
                          {meditation.listens}
                        </td>
                        {isAuthenticated && (
                          <td className="px-4 py-3 text-right">
                            {meditation.isOwned ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({ id: meditation.id, title: meditation.title })
                                }
                                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:border-red-300"
                              >
                                Delete
                              </button>
                            ) : (
                              <span className="text-xs text-calm-300">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      <ModalConfirmDelete
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.title || "meditation"}`}
        message="This will permanently remove this meditation from your library."
        confirmLabel="Delete meditation"
        isLoading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
