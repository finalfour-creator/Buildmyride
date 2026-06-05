// "use client";
// import { useState } from "react";
// import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";

// export default function DangerZone({ showMessage }) {
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [confirmText, setConfirmText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDeleteConfirm = () => {
//     if (confirmText !== "DELETE") return;
//     setIsDeleting(true);
//     setTimeout(() => {
//       console.log("Account deleted");
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//       setConfirmText("");
//       showMessage("Account deletion requested");
//     }, 1500);
//   };

//   return (
//     <>
//       <Paper
//         sx={{
//           background: "linear-gradient(135deg, #ffffff, #fafcff)",
//           border: "1px solid #e8e0d6",
//           boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
//           overflow: "hidden",
//           width: "100%",
//         }}
//       >
//         <Box
//           sx={{
//             background: "linear-gradient(135deg, #991b1b, #dc2626)",
//             p: 2,
//             textAlign: "center",
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
//             Danger Zone
//           </Typography>
//         </Box>

//         <Box sx={{ p: 3 }}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 2,
//               p: 1.5,
//               bgcolor: "#fef2f2",
//               borderRadius: 1,
//               border: "1px solid #fecaca",
//             }}
//           >
//             <Box
//               sx={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg, #dc2626, #dc2626cc)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 20,
//               }}
//             >
//               ⚠️
//             </Box>
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="body2" sx={{ color: "#991b1b", fontWeight: 500, mb: 0.5 }}>
//                 Delete Account
//               </Typography>
//               <Typography variant="caption" sx={{ color: "#b91c1c", display: "block", mb: 2 }}>
//                 Once you delete your account, all your designs, saved data, and personal information will be permanently removed. This action cannot be undone.
//               </Typography>
//               <Button
//                 variant="outlined"
//                 onClick={() => setDeleteDialogOpen(true)}
//                 sx={{
//                   color: "#dc2626",
//                   borderColor: "#dc2626",
//                   borderRadius: 2,
//                   textTransform: "none",
//                   "&:hover": { borderColor: "#b91c1c", backgroundColor: "rgba(220, 38, 38, 0.04)" },
//                 }}
//               >
//                 Delete Account
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Paper>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialogOpen}
//         onClose={() => !isDeleting && setDeleteDialogOpen(false)}
//         PaperProps={{ sx: { borderRadius: 2, width: "100%", maxWidth: 450 } }}
//       >
//         <DialogTitle sx={{ color: "#dc2626", fontWeight: 600 }}>Delete Account</DialogTitle>
//         <DialogContent>
//           <DialogContentText sx={{ mb: 2, color: "#64748b" }}>
//             This action is permanent and cannot be undone. All your designs, saved data, and personal information will be permanently deleted.
//           </DialogContentText>
//           <DialogContentText sx={{ fontWeight: 500, color: "#1a2a32", mb: 1 }}>
//             Type <strong style={{ color: "#dc2626" }}>DELETE</strong> to confirm:
//           </DialogContentText>
//           <TextField
//             fullWidth
//             size="small"
//             value={confirmText}
//             onChange={(e) => setConfirmText(e.target.value)}
//             disabled={isDeleting}
//             sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
//           />
//         </DialogContent>
//         <DialogActions sx={{ p: 2, gap: 1 }}>
//           <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} sx={{ color: "#64748b", borderRadius: 2, textTransform: "none" }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleDeleteConfirm}
//             disabled={confirmText !== "DELETE" || isDeleting}
//             variant="contained"
//             sx={{
//               bgcolor: "#dc2626",
//               borderRadius: 2,
//               textTransform: "none",
//               "&:hover": { bgcolor: "#b91c1c" },
//               "&.Mui-disabled": { bgcolor: "#fecaca", color: "#dc2626" },
//             }}
//           >
//             {isDeleting ? "Deleting..." : "Delete Account"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

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
      showMessage(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Paper
        sx={{
          background: "linear-gradient(135deg, #ffffff, #fafcff)",
          border: "1px solid #e8e0d6",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #991b1b, #dc2626)",
            p: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#ffffff" }}>
            Danger Zone
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              bgcolor: "#fef2f2",
              borderRadius: 1,
              border: "1px solid #fecaca",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dc2626, #dc2626cc)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚠️
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: "#991b1b", fontWeight: 500, mb: 0.5 }}
              >
                Delete Account
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: "#b91c1c", display: "block", mb: 2 }}
              >
                Once you delete your account, all your data will be permanently removed.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  color: "#dc2626",
                  borderColor: "#dc2626",
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Delete Account
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          Delete Account
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action is permanent.
          </DialogContentText>

          <DialogContentText sx={{ mb: 1 }}>
            Type <strong>DELETE</strong> to confirm:
          </DialogContentText>

          <TextField
            fullWidth
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            disabled={confirmText !== "DELETE" || isDeleting}
            variant="contained"
            sx={{ bgcolor: "#dc2626" }}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}