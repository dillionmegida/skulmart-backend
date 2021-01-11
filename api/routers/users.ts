import {
  addAtmCardComplete,
  addAtmCardInitialize,
  addBankAccount,
  confirmEmail,
  createUser,
  deleteUser,
  getBanks,
  loginUser,
  removeAtmCard,
  removeBankAccount,
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

// Get all available banks
router.get("/bank", getBanks);

/**
 * Adding new card is based on how paystack works
 * The first one initializes the transaction, giving the user a ui form to pay through
 * then the second is a callback, which is called after the form
 * to add the card details to the user's document, also, refunding the user
 */

// adding card start

// Add new card (initialize)
router.post("/card/initialize", addAtmCardInitialize);

// Add new card (complete)
router.post("/card/complete", addAtmCardComplete);

// adding card complete

// Remove a saved card
router.delete("/card", removeAtmCard);

// Add a user's bank account
router.post("/bank", addBankAccount);

// Add a user's bank account

// Add a user's bank account
router.delete("/bank", removeBankAccount);

export default router;
