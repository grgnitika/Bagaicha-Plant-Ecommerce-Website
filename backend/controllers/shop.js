const Category = require("../models/category");
const Customer = require("../models/customers");
const { Product, ProductDetails } = require("../models/product");
const Attribute = require("../models/attributes");
const Shop = require("../models/shop");
const Order = require("../models/orders");
const { decrypt } = require("../utils/encryption");

const { sortBySelectionAggerationStages } = require("../utils/helper.util");

exports.searchBasedFromUser = async (req, res, next) => {
  const { input } = req.query;

  try {
    const searchResult = await Product.find({
      $or: [
        { sku: { $regex: input, $options: "i" } },
        { productname: { $regex: input, $options: "i" } },
      ],
    }).select("productname price ratingstar featuredimageUrl");

    res.status(200).json(searchResult);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};


exports.home = async (req, res, next) => {
  try {
    const home_banner_url = null;

    // Fetch latest 5 products sorted by newest first
    const latestProduct = await Product.find()
      .sort({ _id: -1 })
      .select("productname price ratingstar featuredimageUrl")
      .limit(5);

    if (!latestProduct || latestProduct.length === 0) {
      const error = new Error("No products found.");
      error.statusCode = 503;
      throw error;
    }

    res.status(200).json({ latestProduct, home_banner_url });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};


exports.getCategoriesList = async (req, res, next) => {
  try {
    const categoriesList = await Category.find({ status: "enabled" }).select(
      "title categoriesid thumbnail_imageurl"
    );

    if (!categoriesList) {
      const error = new Error(
        "Couldn't fetch categories. Please try again later."
      );
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json(categoriesList);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getCategoryInfoWithAttributes = async (req, res, next) => {
  const categoryParams = req.params.categoryid;

  try {
    if (!categoryParams) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findOne({ categoriesid: categoryParams });

    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    const productlistprice = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories_detail",
        },
      },
      {
        $match: {
          $and: [{ "categories_detail.0.categoriesid": categoryParams }],
        },
      },
      {
        $project: {
          _id: 1,
          price: 1,
          oldprice: 1,
          categories: "$categories_detail._id",
          createdAt: 1,
        },
      },
    ]);

    const resultmaxPrice = Math.max(
      ...productlistprice.map((item) => item.price)
    );

    const attribute = await Attribute.aggregate([
      {
        $match: {
          $and: [
            {
              attribute_group: category._id,
            },
            { display_customer: "yes" },
          ],
        },
      },
    ]);

    res.status(200).json({
      categories: category,
      attributes: attribute,
      maxPrice: resultmaxPrice,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};


exports.getCategoriesWiseProductsLists = async (req, res, next) => {
  const categoryParams = req.params.categoryid;
  const sortBy = req.query.sortBy || "latest";
  const minPrice = req.query.minPrice || 0;
  const maxPrice = req.query.maxPrice || 99999;
  const dynamicAttributes = req.query;
  const cursor = req.query.cursor || 0;
  const pageSize = 5;

  let finalAttributes;
  let attributeslist = [];

  if (Object.keys(dynamicAttributes)?.length !== 0) {
    delete dynamicAttributes.sortBy;
    delete dynamicAttributes.minPrice;
    delete dynamicAttributes.maxPrice;
    delete dynamicAttributes.cursor;

    for (const attributekey in dynamicAttributes) {
      let attributeValue = dynamicAttributes[attributekey];
      const eachValueAttribute = attributeValue.split(",");
      attributeslist.push(eachValueAttribute);
    }

    finalAttributes = attributeslist.flat();
  }

  const sortOperators = sortBySelectionAggerationStages(sortBy);

  try {
    if (!categoryParams) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const productslist = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categories.0",
          foreignField: "_id",
          as: "categories_detail",
        },
      },
      {
        $lookup: {
          from: "product_details",
          localField: "productdetails",
          foreignField: "_id",
          as: "product_details",
        },
      },
      {
        $addFields: {
          product_details: {
            $arrayElemAt: ["$product_details", 0],
          },
        },
      },
      {
        $match: {
          "categories_detail.0.categoriesid": categoryParams,
          "product_details.status": "enabled"
        }
      },
      {
        $project: {
          _id: 1,
          productname: 1,
          sku: 1,
          price: 1,
          oldprice: 1,
          categories: "$categories_detail._id",
          attributes: 1,
          ratingstar: 1,
          featuredimageUrl: 1,
          createdAt: 1,
        },
      },
      {
        $sort: sortOperators,
      },
      {
        $skip: Number(cursor),
      },
      {
        $limit: pageSize,
      },
      {
        $unionWith: {
          coll: "categories",
          pipeline: [
            {
              $match: {
                categoriesid: categoryParams,
              },
            },
          ],
        },
      },
    ]);

    console.log("Fetched products:", productslist.length);

    productslist.splice(-1);

    const totalDocs = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories_detail",
        },
      },
      {
        $lookup: {
          from: "product_details",
          localField: "productdetails",
          foreignField: "_id",
          as: "product_details",
        },
      },
      {
        $addFields: {
          product_details: {
            $arrayElemAt: ["$product_details", 0],
          },
        },
      },
      {
        $match: {
          $and: [
            { "categories_detail.0.categoriesid": categoryParams },
            { "product_details.status": "enabled" },
            { price: { $gte: Number(minPrice), $lte: Number(maxPrice) } },
            ...(finalAttributes?.length > 0
              ? [{ "attributes.label": { $in: finalAttributes } }]
              : []),
          ],
        },
      },
      {
        $count: "totalDocs",
      },
    ]);

    const maxTotalDocs = totalDocs[0]?.totalDocs || 1;
    const nextCursor =
      cursor < maxTotalDocs ? Number(cursor) + Number(pageSize) : null;

    res.status(200).json({
      productslist,
      nextCursor,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getProductsDetails = async (req, res, next) => {
  const productid = req.params.productid;
  let realtedProductlist;
  try {
    if (!productid) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const shopDetail = await Shop.find({});

    const productdetail = await Product.findById(productid)
      .populate("productdetails")
      .populate("categories", "title categoriesid");

    if (productdetail) {
      //Fetch related Products lists
      realtedProductlist = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categories_detail",
          },
        },
        {
          $lookup: {
            from: "product_details",
            localField: "productdetails",
            foreignField: "_id",
            as: "product_details",
          },
        },
        {
          $match: {
            $and: [
              {
                "categories_detail.categoriesid":
                  productdetail.categories[0].categoriesid,
              },
              { "product_details.status": "enabled" },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            productname: 1,
            sku: 1,
            price: 1,
            oldprice: 1,
            ratingstar: 1,
            featuredimageUrl: 1,
          },
        },
      ]);
    }

    if (!productdetail) {
      const error = new Error("Couldn't find product.");
      error.statusCode = 400;
      throw error;
    }

    if (!realtedProductlist) {
      const error = new Error("Couldn't fetch related Products.");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      singleProduct: productdetail,
      relatedproduct: realtedProductlist,
      shopdetail: shopDetail[0],
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  const id = req.params.userid;

  if (!id) {
    const error = new Error("Missing id params");
    error.statusCode = 400;
    throw error;
  }

  try {

    const cartdata = await Customer.findById(id).select("cart").populate({
      path: "cart.items.productid",
      select: "productname price featuredimageUrl",
    });

    if (!cartdata) {
      const error = new Error("Couldn't find cart.");
      error.statusCode = 400;
      throw error;
    }
    
    res.status(200).json({ cart: cartdata.cart });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const cart = req.body.cartdata;
  const customerid = req.params.userid;

  if (!customerid && !cart) {
    const error = new Error("Missing cart data");
    error.statusCode = 400;
    throw error;
  }

  try {
    const cartdata = await Customer.findById(customerid);

    if (!cartdata) {
      const error = new Error("Couldn't update on server.");
      error.statusCode = 204;
      throw error;
    }

    if (cartdata.cart?.items.length > 0 && cart.items.length > 0) {
      let cloneCart = [...cartdata.cart.items];
      cart.items.forEach((citem) => {
        const cartProductIndex = cartdata.cart?.items.findIndex((cp) => {
          return cp.productid.toString() === citem.productid.toString();
        });
        let newQuantity = 1;
        if (cartProductIndex >= 0) {
          newQuantity = citem.quantity;
          cloneCart[cartProductIndex].quantity = newQuantity;
        } else {
          cloneCart.push({
            productid: citem.productid,
            quantity: newQuantity,
          });
        }
      });
      const updatedCart = {
        items: cloneCart,
      };

      cartdata.cart = updatedCart;
    } else {
      cartdata.cart = cart;
    }
    await cartdata.save();

    res.status(201).json({ message: "Successful" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getUserOrderslist = async (req, res, next) => {
  const { userid } = req.body;
  try {
    if (!userid) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const orderslist = await Customer.find({ _id: userid }).populate(
      "orders",
      "status createdAt order_number amount"
    );

    if (!orderslist) {
      const error = new Error("Couldn't find resource.");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json(orderslist[0].orders);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//GET Method - User's Single Order Details
exports.getUserSingleOrderDetail = async (req, res, next) => {
  const id = req.params.id;

  try {
    const orderdetails = await Order.find({ _id: id })
      .populate(
        "paymentid",
        "razorpay_payment.payment_id status gateway type amount cod_id"
      )
      .populate(
        "items.productid",
        "productname sku price featuredimageUrl carrier"
      );

    if (!orderdetails) {
      const error = new Error("Something went wrong.");
      error.statusCode = 400;
      throw error;
    }

    const order_detail = {
      _id: orderdetails[0]._id,
      order_number: orderdetails[0].order_number,
      status: orderdetails[0].status,
      product_list: orderdetails[0].items,
      total_cost: orderdetails[0].amount,
      shippingcost: Number(orderdetails[0].shippingcost),
      tax: Number(orderdetails[0].tax),
      notes: orderdetails[0]?.customernote
        ? orderdetails[0].customernote
        : "No Notes from customer",
    };

    const carrier_detail = {
      tracking_number: orderdetails[0]?.carrier.trackingid,
      carrier_name: orderdetails[0]?.carrier.carriername,
    };

    const payment_detail = orderdetails[0].paymentid;
    
    const decryptedShipping = {
      full_name: decrypt(orderdetails[0].shipping_address.full_name),
      address: decrypt(orderdetails[0].shipping_address.address),
      city: decrypt(orderdetails[0].shipping_address.city),
      state: decrypt(orderdetails[0].shipping_address.state),
      country: decrypt(orderdetails[0].shipping_address.country),
      zip: decrypt(orderdetails[0].shipping_address.zip),
    };
    
    const decryptedBilling = {
      full_name: decrypt(orderdetails[0].billing_address.full_name),
      address: decrypt(orderdetails[0].billing_address.address),
      city: decrypt(orderdetails[0].billing_address.city),
      state: decrypt(orderdetails[0].billing_address.state),
      country: decrypt(orderdetails[0].billing_address.country),
      zip: decrypt(orderdetails[0].billing_address.zip),
    };

const customerdetail = {
  email: decrypt(orderdetails[0].email),
  phoneno: decrypt(orderdetails[0].contact),
  shipping_address: decryptedShipping,
  billing_address: decryptedBilling,
};


    res.status(200).json({
      customerdetail,
      order_detail: order_detail,
      carrier_detail,
      payment_detail,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.addProductWithImage = async (req, res, next) => {
  try {
    const parsedProduct = JSON.parse(req.body.productInputData);

    const {
      productname,
      sku,
      price,
      categories,
      attributes,
      description,
      shortdescription,
      weight,
      status,
      managestock,
      quantity,
      stockavailability,
    } = parsedProduct;

    const featuredImage = req.files?.featureimage?.[0]
      ? `${req.protocol}://${req.get("host")}/uploads/${req.files.featureimage[0].filename}`
      : null;

    const mediaUrls = req.files?.media?.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }) || [];

    const newProduct = new Product({
      productname,
      sku,
      price,
      categories,
      attributes,
      featuredimageUrl: featuredImage,
    });

    const savedProduct = await newProduct.save();

    const newDetails = new ProductDetails({
      product_id: savedProduct._id,
      short_description: shortdescription,
      description,
      weight,
      mediaurl: mediaUrls,
      status,
      mangestock: managestock,
      quantity,
      stock_availability: stockavailability,
    });

    const savedDetails = await newDetails.save();

    savedProduct.productdetails = savedDetails._id;
    await savedProduct.save();

    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    console.error("Add product failed:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
};


const multer = require("multer");
const path = require("path");

// Setup for Multer to handle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
exports.upload = upload;

// API: POST /api/products/upload-images
exports.uploadProductImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filePaths = req.files.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    });

    res.status(200).json({ images: filePaths });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload images" });
  }
};
