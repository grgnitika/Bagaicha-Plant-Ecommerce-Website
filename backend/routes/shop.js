const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { uploadProductImages } = require("../controllers/shop");
const shopController = require("../controllers/shop");
const orderController = require("../controllers/orders");
const isAuth = require("../middleware/is-auth");

router.post("/add-product", upload.single("image"), shopController.addProductWithImage);

router.get("/search", shopController.searchBasedFromUser);

router.get("/shop", shopController.home);

router.post("/checkout/khalti", orderController.verifyKhaltiPayment);

router.get("/user/orders/:id", isAuth, shopController.getUserSingleOrderDetail);

router.get("/categories", shopController.getCategoriesList);

router.get(
  "/collections/:categoryid",
  shopController.getCategoryInfoWithAttributes
);

router.get(
  "/collections-product/:categoryid",
  shopController.getCategoriesWiseProductsLists
);

router.get("/products/:productid", shopController.getProductsDetails);

router.post("/orders", isAuth, shopController.getUserOrderslist);

router.get("/cart/:userid", isAuth, shopController.getCart);

router.post("/cart/:userid", isAuth, shopController.postCart);

router.post("/checkout/cod", orderController.postCodCheckout);


router.post(
  "/products/upload-images",
  upload.array("media", 10), 
  uploadProductImages
);


module.exports = router;
