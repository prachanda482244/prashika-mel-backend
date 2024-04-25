import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, quantity } = req.body;
  if ([title, price, quantity].some((field) => field?.trim === "")) {
    throw new ApiError(409, "All field required");
  }
  const productImageUploadPromises = req.files["image"].map((file) =>
    uploadOnCloudinary(file.path)
  );

  const productImages = await Promise.all(productImageUploadPromises);
  if (!productImages) {
    throw new ApiError(400, "Failed to upload the images");
  }
  const productImageUrls = productImages.map((image) => ({
    url: image.url,
    publicId: image.public_id,
  }));

  const product = await Product.create({
    title,
    description,
    price,
    quantity,
    images: productImageUrls,
  });
  if (!product) {
    throw new ApiError(400, "failed to create error");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const allProducts = await Product.find().sort({ createdAt: -1 });
  if (!allProducts) {
    throw new ApiError(404, "Not found any products");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allProducts, "All products"));
});

const updateProductDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!product) throw new ApiError(400, "Failed to update details");
  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product update successfully"));
});

const updateProductImage = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const existingProduct = await Product.findById(productId);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  const oldImagePublicIds = existingProduct.images.map(
    (image) => image.publicId
  );

  for (const publicId of oldImagePublicIds) {
    await deleteOnCloudinary(publicId);
  }

  const productImageUploadPromises = req.files.map((file) =>
    uploadOnCloudinary(file.path)
  );

  const productImages = await Promise.all(productImageUploadPromises);
  if (!productImages) {
    throw new ApiError(400, "Failed to upload the images");
  }
  const productImageUrls = productImages.map((image) => ({
    url: image.url,
    publicId: image.public_id,
  }));

  const updatedProductImage = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        images: productImageUrls,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedProductImage) throw new ApiError(400, "Failed to update");
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProductImage, "product updated successfully")
    );
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }
  await Product.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});
const productImageDelete = asyncHandler(async (req, res) => {});
export {
  createProduct,
  getAllProducts,
  updateProductDetails,
  updateProductImage,
  deleteProduct,
  productImageDelete,
};