import { Router } from "express";
import { authorizeAdmin, verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllDetailsCount,
  getAllProducts,
  getAllUsers,
  deleteUser,
} from "../controllers/dashboard.controller.js";
import {
  createProduct,
  deleteProduct,
  productImageDelete,
  updateProductDetails,
  updateProductImage,
} from "../controllers/product.controller.js";
import { getAllOrder } from "../controllers/order.controller.js";
import { searchUsers } from "../controllers/search.controller.js";
const dashboardRouter = Router();

dashboardRouter.use(verifyJwt);
dashboardRouter.use(authorizeAdmin);

dashboardRouter.route("/").get(getAllDetailsCount);
dashboardRouter.route("/get-all-users").get(getAllUsers);
dashboardRouter.route("/delete-user/:userId").delete(deleteUser);

dashboardRouter.route("/get-all-products").get(getAllProducts);
dashboardRouter.route("/product/create-new-product").post(
  upload.fields([
    {
      name: "image",
      maxCount: 3,
    },
  ]),
  createProduct
);
dashboardRouter
  .route("/product/update-product-details/:id")
  .patch(updateProductDetails);

dashboardRouter
  .route("/product/update-product-image/:productId")
  .patch(upload.array("image", 3), updateProductImage);
dashboardRouter.route("/product/delete-product/:id").delete(deleteProduct);
dashboardRouter.route("/order/get-all-order").get(getAllOrder);

dashboardRouter
  .route("/product/:id/product-image/:imageId")
  .delete(productImageDelete);
dashboardRouter.route("/users").post(searchUsers);

export default dashboardRouter;
