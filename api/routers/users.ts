import {
  addAtmCard,
  addBankAccount,
  confirmEmail,
  createUser,
  deleteUser,
  getBanks,
  loginUser,
  resendEmailConfirmationLink,
  resetPassword,
  resetPasswordRequest,
  updateUser,
  updateUserEmail,
  updateUserPassword,
} from "api/controllers/users";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
import userTypeRequired from "middlewares/userTypeRequired";
import upload from "utils/multer";
const router = express.Router();

// Create new user
router.post("/", upload.single("avatar"), userTypeRequired, createUser);

// Email confirmation
router.get("/confirm_email/:hash", confirmEmail);

// Get authenticated user
router.get("/me", isAuthenticated, async (req: any, res: any) => {
  // req.user is gotten from isAuthenticated
  res.json(req.user);
});

// Update user
router.post(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  userTypeRequired,
  updateUser
);

// used userTypeRequired manually in the above requests because
// req.body will return an empty object is multer does not do its work
router.use(userTypeRequired);

// Log in user
router.post("/login", loginUser);

// Resend email confirmation link
router.post("/resend_confirmation_link", resendEmailConfirmationLink);

// Reset password request
router.post("/reset_password", resetPasswordRequest);

// Reset password
router.post("/reset_password/:hash", resetPassword);

router.use(isAuthenticated);

// Update seller email
router.post("/update/email", updateUserEmail);

// Update user password
router.post("/update/password", updateUserPassword);

// Delete user
router.delete("/", deleteUser);

// router.post("/card", addAtmCard);

// Add a user's bank account
router.post("/bank", addBankAccount);

// Get all available banks
router.get("/bank", getBanks);

export default router;
