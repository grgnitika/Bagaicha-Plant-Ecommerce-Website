const { validationResult } = require("express-validator");
const { Product, ProductDetails } = require("../../models/product");
const Category = require("../../models/category");
const Attribute = require("../../models/attributes");
const Order = require("../../models/orders");
const Payment = require("../../models/payment");
const Shop = require("../../models/shop");

const fs = require("fs");
const path = require("path");

const deleteLocalImage = (filename) => {
  if (!filename) return;
  const imagePath = path.join(__dirname, "../../uploads", filename);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
};


// POST Method - Update shipment tracking Order
exports.postCarrierwithTrackingNumber = async (req, res, next) => {
  const orderid = req.params.orderid;
  const { carrier, tracking_number } = req.body;
  try {
    const update_order = await Order.updateMany(
      { _id: orderid },
      {
        $set: {
          carrier: { carriername: carrier, trackingid: tracking_number },
          status: "Shipped",
        },
      }
    );

    if (update_order.length === 0) {
      const error = new Error("Couldn't update. Something went wrong");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({ message: "Successfully update." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// POST Method - Update order status
exports.updateOrderStatus = async (req, res, next) => {
  const { orderid } = req.params;
  const { status } = req.body;
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      { _id: orderid },
      { status: status }
    );

    if (updateOrderStatus.length === 0) {
      const error = new Error("Couldn't update. Something went wrong");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({ message: "Successfully update." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// PUT Method - COD update status
exports.updateOrdercodstatus = async (req, res, next) => {
  const { paymentid } = req.params;

  try {
    if (!paymentid) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const codupdatestatus = await Payment.findByIdAndUpdate(
      { _id: paymentid },
      { status: "Paid" }
    );

    if (codupdatestatus.length === 0) {
      const error = new Error("Couldn't update. Something went wrong");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({ message: "Successfully update." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// DELETE Method - Delete Single Product
exports.deleteSingleProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      const error = new Error("Couldn't find product.");
      error.statusCode = 400;
      throw error;
    }

    const getProduct = await Product.findById(id);
    const getDetails = await ProductDetails.findOne({ product_id: id });

    // Delete featured image
    deleteLocalImage(getProduct.featuredimageUrl);

    // Delete media images
    if (getDetails?.mediaurl?.length > 0) {
      getDetails.mediaurl.forEach(filename => {
        deleteLocalImage(filename);
      });
    }

    // Delete DB records
    await ProductDetails.deleteOne({ product_id: id });
    await Product.deleteOne({ _id: id });

    res.status(200).json({ message: "Successfully deleted." });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};


// POST Method - Create new Product
exports.postProduct = async (req, res, next) => {
  try {
    const productInputData = JSON.parse(req.body.productInputData);
    const mediaFiles = req.files["media"];
    const featuredImageFile = req.files["featureimage"]?.[0];

    if (!mediaFiles || !featuredImageFile) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    // Extract filenames to save as URLs (accessible via /uploads/<filename>)
    const featured_imageurl = featuredImageFile.filename;
    const media_imageurl = mediaFiles.map(file => file.filename);

    const product = new Product({
      productname: productInputData.productname,
      price: productInputData.price,
      oldprice: productInputData?.oldprice || null,
      featuredimageUrl: featured_imageurl,
      categories: productInputData.categories,
      attributes: productInputData.attributes,
      sku: productInputData.sku,
    });

    const result = await product.save();
    if (result) {
      const productdetails = new ProductDetails({
        product_id: result._id,
        short_description: productInputData.shortdescription,
        description: productInputData.description,
        mediaurl: media_imageurl,
        status: productInputData.status,
        mangestock: productInputData.managestock,
        quantity: productInputData?.quantity || null,
        stock_availability: productInputData.stock_availability,
        weight: productInputData.weight,
      });

      const pd_result = await productdetails.save();

      if (pd_result) {
        result.productdetails = pd_result._id;
        await result.save();

        return res.status(201).json({
          message: "Successfully created product",
        });
      }
    }

    throw new Error("Not able to save data.");
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};


// PUT Method - Update Product
exports.putEditProductDetails = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    let inputdata;
    const featuredImage = req.files?.featureimage?.[0];

    if (featuredImage) {
      inputdata = JSON.parse(req.body.inputdata);
    } else {
      inputdata = req.body.inputdata;
    }

    // Function to update product and product details
    async function overwriteDataHandler(id, newImageFilename = null) {
      const result_updation = await Product.findById(id);
      if (!result_updation) {
        const error = new Error("Could not find Product.");
        error.statusCode = 400;
        throw error;
      }

      // Delete old featured image if replaced
      if (newImageFilename && result_updation.featuredimageUrl) {
        deleteLocalImage(result_updation.featuredimageUrl);
      }

      result_updation.productname = inputdata.productname;
      result_updation.price = inputdata.price;
      result_updation.oldprice = inputdata?.oldprice || null;
      result_updation.featuredimageUrl = newImageFilename
        ? newImageFilename
        : inputdata?.featureimage;
      result_updation.categories = inputdata.categories;
      result_updation.attributes = inputdata.attributes;
      result_updation.sku = inputdata.sku;

      const update_product_result = await result_updation.save();

      if (update_product_result) {
        const update_product_details = await ProductDetails.findById(
          result_updation.productdetails
        );

        update_product_details.product_id = result_updation._id;
        update_product_details.short_description = inputdata.shortdescription;
        update_product_details.description = inputdata.description;
        update_product_details.mediaurl = inputdata.media;
        update_product_details.status = inputdata.status;
        update_product_details.mangestock = inputdata.managestock;
        update_product_details.quantity = inputdata?.quantity || null;
        update_product_details.stock_availability = inputdata.stockavailability;
        update_product_details.weight = inputdata.weight;

        const update_pd_result = await update_product_details.save();

        if (!update_pd_result) {
          const error = new Error("Could not update.");
          error.statusCode = 503;
          throw error;
        }

        return {
          product: update_product_result,
          product_details: update_pd_result,
        };
      }
    }

    // If new image is uploaded
    if (!inputdata.hasOwnProperty("featureimage") && featuredImage) {
      const result = await overwriteDataHandler(id, featuredImage.filename);
      return res.status(201).json({
        message: "Successfully updated product.",
        payload: result,
      });
    }

    // If no image is replaced
    const result = await overwriteDataHandler(id);
    res.status(201).json({
      message: "Successfully updated product.",
      payload: result,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

// PUT Method - Update Category
// controllers/admin/adminShopActions.js

// PUT Method - Update Category
exports.putEditCategoryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const parsedData = JSON.parse(req.body.inputdata);
    const { categoryname, categoriesid, description, status, menuinlcude } = parsedData;

    const updatedData = {
      title: categoryname,
      categoriesid,
      description,
      status,
      ismenuinclude: menuinlcude,
    };

    if (req.files?.thumbnail?.[0]) {
      updatedData.thumbnail_imageurl = req.files.thumbnail[0].filename;
    }

    if (req.files?.breadcrumbbanner?.[0]) {
      updatedData.category_bannerurl = req.files.breadcrumbbanner[0].filename;
    }

    const result = await Category.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ message: "Category updated", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};

// PUT Method - Edit Attribute Data
exports.putEditAttributeDetails = async (req, res, next) => {
  const { id } = req.params;
  const editinputattribute_data = req.body.attribute_data;

  // console.log(editinputattribute_data);
  try {
    if (!id) {
      const error = new Error("Missing id params");
      error.statusCode = 400;
      throw error;
    }

    const editAttribute = await Attribute.findById(id);

    if (!editAttribute) {
      const error = new Error(
        "Something went wrong.Please contact administration"
      );
      error.statusCode = 500;
      throw error;
    }

    editAttribute.name = editinputattribute_data.attributesname;
    editAttribute.attribute_code = editinputattribute_data.attributescode;
    editAttribute.attribute_options = editinputattribute_data.attribute_options;
    editAttribute.attribute_group = editinputattribute_data.parentcategories;
    editAttribute.display_customer = editinputattribute_data.displaycustomer;

    const result_updation = await editAttribute.save();

    if (!result_updation) {
      const error = new Error("Couldn't update. Please try again later.");
      error.statusCode = 500;
      throw error;
    }

    res.status(201).json({ message: "Successfully update." });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// POST Method - Create new Category
exports.postCategory = async (req, res, next) => {
  try {
    const inputdata = JSON.parse(req.body.inputdata);
    const breadcrumbbannerimage = req.files?.breadcrumbbanner?.[0];
    const thumbnailimage = req.files?.thumbnail?.[0];

    if (!breadcrumbbannerimage || !thumbnailimage) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    const category = new Category({
      title: inputdata.categoryname,
      categoriesid: inputdata.categoriesid,
      description: inputdata.description,
      category_bannerurl: breadcrumbbannerimage.filename,
      thumbnail_imageurl: thumbnailimage.filename,
      status: inputdata.status,
      ismenuinclude: inputdata.menuinlcude,
    });

    const resultCategoryData = await category.save();

    if (!resultCategoryData) {
      const error = new Error("Not able to save data.");
      error.statusCode = 500;
      throw error;
    }

    res.status(201).json({
      message: "Successfully created category",
      category: resultCategoryData,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};


// POST Method - Create new Attributes
exports.postAttributes = async (req, res, next) => {
  const {
    attributesname,
    attributescode,
    attribute_options,
    parentcategories,
    displaycustomer,
  } = req.body;

  const validationerror = validationResult(req);

  if (!validationerror.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect.");
    error.statusCode = 422;
    error.data = validationerror.array();
    next(error);
  }

  try {
    const attribute = new Attribute({
      name: attributesname.toString(),
      attribute_code: attributescode,
      attribute_options: attribute_options,
      attribute_group: parentcategories,
      display_customer: displaycustomer,
    });

    const result = await attribute.save();

    if (!result) {
      const error = new Error("Not able to save data.");
      error.statusCode = 500;
      throw error;
    }

    res
      .status(201)
      .json({ message: "Successfully created category", attribute: result });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//DELETE Method - delete attribute from list.
exports.deleteSingleAttribute = async (req, res, next) => {
  const attributeid = req.params.attributeid;

  try {
    if (!attributeid) {
      const error = new Error("Couldn't find attribute.");
      error.statusCode = 400;
      throw error;
    }

    const result = await Attribute.deleteOne({ _id: attributeid });

    if (!result) {
      const error = new Error("Wouldn't delete. Please contact administrator");
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json({ message: "Sucessfully deletion." });
  } catch (error) {
    if (!error?.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// PUT Method - Store Settings update or Create.
exports.putShopSettings = async (req, res, next) => {
  const inputdata = req.body.inputdata;
  const bannerImage = req.files?.bannerimage?.[0];

  try {
    let shopsettings = await Shop.find({});

    if (shopsettings.length === 0) {
      const newShopSettings = new Shop({
        shipping_policy: inputdata.shipping_policy,
        delivery_message: inputdata.delivery_message,
        return_policy: inputdata.return_policy,
        banner_image: bannerImage?.filename || null,
      });

      await newShopSettings.save();

      return res.status(201).json({ message: "Successfully created store settings." });
    }

    const existing = shopsettings[0];

    // If new banner uploaded, delete old one
    if (bannerImage) {
      if (existing.banner_image) {
        deleteLocalImage(existing.banner_image);
      }
      existing.banner_image = bannerImage.filename;
    }

    existing.shipping_policy = inputdata.shipping_policy;
    existing.delivery_message = inputdata.delivery_message;
    existing.return_policy = inputdata.return_policy;

    await existing.save();

    res.status(201).json({ message: "Successfully updated store settings." });
  } catch (error) {
    if (!error?.statusCode) error.statusCode = 500;
    next(error);
  }
};

// Update category name and/or image
exports.updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryname } = req.body;

    const updateData = {
      categoryname,
    };

    if (req.file) {
      updateData.categoryimageUrl = req.file.filename; 
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};
