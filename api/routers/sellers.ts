import {
  getAllSellers,
  getAuthSellerProducts,
  getSellerById,
  getSellerBySearch,
  getSellerByUsername,
  initializeSubscription,
  subscriptionCallback,
} from "api/controllers/sellers";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";

// Get all sellers in a store
router.get("/", getAllSellers);

// Get seller by username
router.get("/:username", getSellerByUsername);

// Get seller by id
router.get("/id/:id", getSellerById);

// Get sellers by query
router.get("/search/query", getSellerBySearch);

// Get all products of logged in seller
router.get("/products/all", isAuthenticated, getAuthSellerProducts);

/*
 *
 * PRIVATE ROUTES
 *
 */

// Initialize seller subscription
router.get("/subscription/initialize", isAuthenticated, initializeSubscription);

// Subscription callback
router.get("/subscription/callback", subscriptionCallback);
