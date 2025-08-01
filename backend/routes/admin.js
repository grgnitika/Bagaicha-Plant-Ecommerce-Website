// routes/admin.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const { validate } = require("../middleware/validation");
const shopActionController = require("../controllers/admin/adminShopActions");
const shopReadController = require("../controllers/admin/adminShopRead");
const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-admin-auth");
const shopController = require("../controllers/shop");

router.post("/login-step1", authControllers.adminLoginStepOne); 
router.post("/login-step2", authControllers.adminLoginStepTwo); 

router.post("/register", authControllers.registerAdminAccount);

router.get("/dashboard", isAuth, shopReadController.getDashboard);
router.get("/orders", isAuth, shopReadController.getOrderslist);
router.get("/orders/:id", isAuth, shopReadController.getSingleOrderDetails);
router.post("/orders/updatecarrier/:orderid", isAuth, shopActionController.postCarrierwithTrackingNumber);
router.put("/orders/updatestatus/:orderid", isAuth, shopActionController.updateOrderStatus);
router.put("/orders/updatecodstatus/:paymentid", isAuth, shopActionController.updateOrdercodstatus);

router.get("/customer-list", isAuth, shopReadController.getCustomersList);
router.get("/single-customer-detail/:id", isAuth, shopReadController.getsingleCustomerDetail);
router.get("/products", isAuth, shopReadController.getProductsList);
router.delete("/products/:id", isAuth, shopActionController.deleteSingleProduct);

router.post(
  "/products/new",
  upload.fields([
    { name: "featureimage", maxCount: 1 },
    { name: "media", maxCount: 10 }
  ]),
  shopController.addProductWithImage
);


router.get("/products/edit/:id", isAuth, shopReadController.getEditProductDetails);

router.put(
  "/products/edit/:id",
  upload.fields([
    { name: "featureimage", maxCount: 1 },
  ]),
  isAuth,
  shopActionController.putEditProductDetails
);

router.get("/categories", isAuth, shopReadController.getCategoryList);
router.get("/categories/edit/:id", isAuth, shopReadController.getEditCategoryDetails);

router.put(
  "/categories/edit/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "breadcrumbbanner", maxCount: 1 },
  ]),
  isAuth,
  shopActionController.putEditCategoryDetails
);

router.put(
  "/update-category/:id",
  upload.single("categoryimage"),
  isAuth,
  shopActionController.updateCategoryById
);


router.post(
  "/categories",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "breadcrumbbanner", maxCount: 1 },
  ]),
  isAuth,
  validate("new-category"),
  shopActionController.postCategory
);

router.get("/attributes", isAuth, shopReadController.getAttributeList);
router.get("/attributes/edit/:id", isAuth, shopReadController.getEditAttributesDetails);
router.put("/attributes/edit/:id", isAuth, shopActionController.putEditAttributeDetails);
router.get("/attributes/:selectedcategory", isAuth, shopReadController.getAttributeListInputField);

router.post(
  "/attributes",
  isAuth,
  validate("new-attribute"),
  shopActionController.postAttributes
);

router.delete("/attributes/:attributeid", isAuth, shopActionController.deleteSingleAttribute);
router.get("/shop-settings", isAuth, shopReadController.getStoreSettings);

router.put(
  "/shop-settings",
  upload.fields([
    { name: "bannerimage", maxCount: 1 },
  ]),
  isAuth,
  shopActionController.putShopSettings
);

module.exports = router;

