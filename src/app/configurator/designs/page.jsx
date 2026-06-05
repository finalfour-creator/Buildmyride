"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Container, Breadcrumbs, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert,
} from "@mui/material";
import Link from "next/link";
import DesignCard from "@/feature/dashboard/components/DesignCard";
import apiClient from "@/lib/axios";
import { useSession } from "next-auth/react";

export default function MyDesignsPage() {
  const { status } = useSession();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Selection state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Delete confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({ open: false, ids: [], label: "" });
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  /* ── Fetch ─────────────────────────────────────── */
  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await apiClient.get("/designs");
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.designs ?? res.data?.data ?? [];
      // Normalise: some Mongoose configs return `id` (string alias) without `_id`
      const data = raw.map(d => ({ ...d, _id: d._id || d.id }));
      setDesigns(data);
    } catch (err) {
      console.error("Failed to fetch designs:", err);
      setFetchError("Could not load your designs. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchDesigns();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchDesigns]);

  /* ── Selection helpers ──────────────────────────── */
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === designs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(designs.map(d => d._id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  /* ── Delete flow ────────────────────────────────── */
  const askDelete = (ids, label) => {
    setConfirmDialog({ open: true, ids, label });
  };

  const handleSingleDelete = (id, name) => {
    askDelete([id], `"${name}"`);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    askDelete([...selectedIds], `${count} design${count > 1 ? "s" : ""}`);
  };

  const confirmDelete = async () => {
    const { ids } = confirmDialog;
    setDeleting(true);
    setConfirmDialog(d => ({ ...d, open: false }));

    const results = await Promise.allSettled(
      ids.map(id => apiClient.delete(`/designs/${id}`))
    );

    const failed = results.filter(r => r.status === "rejected").length;
    const succeeded = ids.length - failed;

    setDeleting(false);

    if (failed === 0) {
      setSnack({ open: true, msg: `${succeeded} design${succeeded > 1 ? "s" : ""} deleted.`, severity: "success" });
    } else {
      setSnack({ open: true, msg: `${succeeded} deleted, ${failed} failed.`, severity: "warning" });
    }

    // Remove successfully deleted ids from state (optimistic)
    const deletedSet = new Set(ids);
    setDesigns(prev => prev.filter(d => !deletedSet.has(d._id)));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  /* ── Render guards ──────────────────────────────── */
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress size={32} sx={{ color: "#2c5364" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your saved designs…</Typography>
      </Container>
    );
  }

  if (fetchError) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h6" color="error" mb={3}>{fetchError}</Typography>
        <Button variant="contained" onClick={fetchDesigns} sx={{ background: "linear-gradient(135deg, #0f2027, #2c5364)", color: "white" }}>
          Retry
        </Button>
      </Container>
    );
  }

  const allSelected = designs.length > 0 && selectedIds.size === designs.length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1, fontSize: 13 }}>
          <Link href="/configurator/dashboard" style={{ textDecoration: "none", color: "#64748b" }}>Dashboard</Link>
          <Typography sx={{ fontSize: 13, color: "#1a2a32", fontWeight: 600 }}>My Designs</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1a2a32">My Design Gallery</Typography>
            <Typography variant="body1" color="#64748b">Browse and manage all your automotive customizations</Typography>
          </Box>

          {/* Toolbar buttons */}
          {designs.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {!selectMode ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectMode(true)}
                  sx={{ borderColor: "#cbd5e1", color: "#475569", fontWeight: 600, fontSize: 12 }}
                >
                  Select
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleSelectAll}
                    sx={{ borderColor: "#cbd5e1", color: "#475569", fontWeight: 600, fontSize: 12 }}
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={exitSelectMode}
                    sx={{ borderColor: "#cbd5e1", color: "#475569", fontWeight: 600, fontSize: 12 }}
                  >
                    Cancel
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleBulkDelete}
                      disabled={deleting}
                      sx={{
                        background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                        color: "white", fontWeight: 700, fontSize: 12,
                        "&:hover": { background: "linear-gradient(135deg, #a93226, #c0392b)" },
                      }}
                    >
                      {deleting ? "Deleting…" : `Delete ${selectedIds.size} selected`}
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Selection count bar */}
        {selectMode && (
          <Box sx={{ mt: 1.5, px: 2, py: 1, background: "#fff8f8", border: "1px solid #fecaca", borderRadius: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#b91c1c", fontWeight: 600 }}>
              {selectedIds.size === 0
                ? "Click cards or use checkboxes to select designs"
                : `${selectedIds.size} of ${designs.length} selected`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Grid ── */}
      {designs.length > 0 ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
          {designs.map((design) => (
            <DesignCard
              key={design._id}
              {...design}
              selectMode={selectMode}
              selected={selectedIds.has(design._id)}
              onSelect={toggleSelect}
              onDelete={handleSingleDelete}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 12, background: "white", border: "1px dashed #cbd5e1", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>No designs found</Typography>
          <Typography variant="body2" color="#64748b" mb={4}>You haven't saved any car configurations yet.</Typography>
          <Link href="/configurator/customization" style={{
            padding: "12px 32px",
            background: "linear-gradient(135deg, #0f2027, #2c5364)",
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
            borderRadius: 4,
          }}>
            Create Your First Design
          </Link>
        </Box>
      )}

      {/* ── Confirm delete dialog ── */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(d => ({ ...d, open: false }))}
        PaperProps={{ sx: { borderRadius: 2, px: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#b91c1c" }}>
          🗑 Delete {confirmDialog.label}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is permanent and cannot be undone. The selected design{confirmDialog.ids?.length > 1 ? "s" : ""} will be removed from your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDialog(d => ({ ...d, open: false }))} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)", color: "white", fontWeight: 700 }}
          >
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Container>
  );
}
