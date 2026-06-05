"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";

export default function DangerZone({ showMessage }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/users/${session?.user?.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete account");
      }

      // ✅ logout
      await signOut({ redirect: false });

      // ✅ redirect to login
      router.push("/login");

    } catch (err) {
      showMessage(err.message || "Delete failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDialog = () => {
    if (isDeleting) return;
    setDeleteDialogOpen(false);
    setConfirmText("");
  };

  return (
    <>
      <SectionCard
        danger
        
        title="Delete Account"
        subtitle="Permanently delete your account and all of its data"
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: "#1a2a32", fontWeight: 600, mb: 0.5 }}>
              Close your account
            </Typography>
            <Typography variant="caption" sx={{ color: "#6b7c88", display: "block", lineHeight: 1.5 }}>
              Once deleted, your account, designs, and saved data are removed for good.
              This action cannot be undone.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              color: "#dc2626",
              borderColor: "#dc2626",
              borderRadius: 2,
              textTransform: "none",
              flexShrink: 0,
              "&:hover": {
                borderColor: "#b91c1c",
                backgroundColor: "rgba(220,38,38,0.04)",
              },
            }}
          >
            Delete Account
          </Button>
        </Box>
      </SectionCard>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDialog}
        PaperProps={{ sx: { borderRadius: 2, width: "100%", maxWidth: 450 } }}
      >
        <DialogTitle sx={{ color: "#dc2626", fontWeight: 600 }}>
          Delete Account
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#64748b" }}>
            This action is permanent and cannot be undone. All your designs, saved
            data, and personal information will be permanently deleted.
          </DialogContentText>

          <DialogContentText sx={{ fontWeight: 500, color: "#1a2a32", mb: 1 }}>
            Type <strong style={{ color: "#dc2626" }}>DELETE</strong> to confirm:
          </DialogContentText>

          <TextField
            fullWidth
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={closeDialog}
            disabled={isDeleting}
            sx={{ color: "#64748b", borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            disabled={confirmText !== "DELETE" || isDeleting}
            variant="contained"
            sx={{
              bgcolor: "#dc2626",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { bgcolor: "#b91c1c" },
              "&.Mui-disabled": { bgcolor: "#fecaca", color: "#ffffff" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
