// import React, { useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import { toast } from "sonner";
// import LoadingBar from "react-top-loading-bar";

// import { getAdminCategories } from "@/lib/admin-http";
// import {
//   profileFormSchema,
//   toolbarOptions,
// } from "@/components/admin/Products/util";

// import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import FileUploadComponent from "@/components/admin/Products/FormComponents/FileUploadComponent";
// import InputRadioGroup from "@/components/admin/FormFields/InputRadioGroup";
// import MangeInputQuantity from "@/components/admin/Products/FormComponents/MangeInputQuantity";
// import InputField from "@/components/inputfield/InputField";
// import ImageUpload from "@/components/admin/FormFields/ImageUpload";
// import MultiSelect from "@/components/admin/FormFields/MultiSelect";

// import { CaretCircleLeft } from "@phosphor-icons/react";

// function ProductForm() {
//   const { id } = useParams();
//   const isEditForm = id !== undefined;
//   const loadingRef = useRef(null);
//   const navigate = useNavigate();

//   const { data: categorieslist } = useQuery({
//     queryKey: ["categories"],
//     queryFn: getAdminCategories,
//   });

//   const form = useForm({
//     resolver: zodResolver(profileFormSchema),
//     mode: "onChange",
//     defaultValues: {
//       managestock: "no",
//     },
//   });

//   const { handleSubmit, control, getValues } = form;

//   const onSubmit = async (data) => {
//     loadingRef.current.continuousStart();

//     const token = localStorage.getItem("admin-token");
//     if (!token) {
//       toast.error("Missing admin token.");
//       loadingRef.current.complete();
//       return;
//     }

//     try {
//       const formData = new FormData();
//       const productData = { ...data };

//       // Separate files
//       const mediaFiles = productData.media;
//       const featureImageFile = productData.featureimage;

//       delete productData.media;
//       delete productData.featureimage;

//       // Append files
//       mediaFiles.forEach((file) => {
//         formData.append("media", file);
//       });
//       formData.append("featureimage", featureImageFile);

//       // Append the rest as JSON
//       formData.append("productInputData", JSON.stringify(productData));

//       const response = await fetch(
//         `${import.meta.env.VITE_ADMIN_AUTH_API_URL}products/new`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: "Bearer " + token,
//           },
//           body: formData,
//         }
//       );

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Upload failed");
//       }

//       toast.success(result.message || "Product added successfully");
//       loadingRef.current.complete();
//       setTimeout(() => navigate(".."), 1000);
//     } catch (error) {
//       loadingRef.current.complete();
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="container my-12">
//       <LoadingBar color="#003E29" ref={loadingRef} shadow={true} />
//       <Link to=".." className="flex flex-row gap-2 items-center my-5">
//         <CaretCircleLeft size={32} color="#121212" />
//         <p className="font-normal text-xl">Back</p>
//       </Link>

//       <FormProvider {...form}>
//         <Form {...form}>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <main className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//               <div className="col-span-2">
//                 <Card>
//                   <CardHeader className="font-bold">New Product</CardHeader>
//                   <CardContent className="space-y-4 h-auto">
//                     <InputField form={form} label="Name" fieldname="productname" />
//                     <div className="grid sm:grid-cols-3 gap-2">
//                       <InputField form={form} label="SKU" fieldname="sku" />
//                       <InputField form={form} label="Price" fieldname="price" />
//                       <InputField form={form} label="Weight (Kg)" fieldname="weight" />
//                     </div>
//                     <div className="grid sm:grid-cols-3 gap-2">
//                       <FormField
//                         control={control}
//                         name="categories"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Categories</FormLabel>
//                             <FormControl>
//                               <Select
//                                 onValueChange={field.onChange}
//                                 value={field.value}
//                               >
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select a Category" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {categorieslist?.map((category) => (
//                                     <SelectItem
//                                       key={category._id}
//                                       value={category._id}
//                                     >
//                                       {category.title}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <MultiSelect
//                         form={form}
//                         fieldname="attributes"
//                         className="col-span-2"
//                         isEditForm={isEditForm}
//                       />
//                     </div>

//                     <FormField
//                       control={control}
//                       name="shortdescription"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Short Description</FormLabel>
//                           <FormControl>
//                             <Textarea
//                               placeholder="Brief product summary."
//                               className="resize-none"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormDescription>
//                             This short description shows next to the product title.
//                           </FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={control}
//                       name="description"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Description</FormLabel>
//                           <FormControl>
//                             <ReactQuill
//                               theme="snow"
//                               value={field.value}
//                               onChange={field.onChange}
//                               modules={{ toolbar: toolbarOptions }}
//                             />
//                           </FormControl>
//                           <FormDescription>
//                             Main product description below the fold.
//                           </FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>

//                 <Card className="mt-10">
//                   <CardHeader className="font-bold">Media</CardHeader>
//                   <CardContent>
//                     {!isEditForm && <FileUploadComponent form={form} />}
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="space-y-3">
//                 <Card>
//                   <CardHeader className="font-bold">Featured Image</CardHeader>
//                   <CardContent>
//                     <ImageUpload
//                       form={form}
//                       fieldname="featureimage"
//                       isEditForm={isEditForm}
//                       imageAlt={form.getValues("productname")}
//                     />
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="font-bold">Product Status</CardHeader>
//                   <CardContent>
//                     <FormField
//                       control={control}
//                       name="status"
//                       render={({ field }) => (
//                         <InputRadioGroup
//                           field={field}
//                           label="Status"
//                           defaultValue="enabled"
//                           optionOne={{ value: "disabled", label: "Disabled" }}
//                           optionTwo={{ value: "enabled", label: "Enabled" }}
//                         />
//                       )}
//                     />
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="font-bold">Inventory</CardHeader>
//                   <CardContent>
//                     <FormField
//                       control={control}
//                       name="managestock"
//                       render={({ field }) => (
//                         <InputRadioGroup
//                           field={field}
//                           label="Manage Stock?"
//                           defaultValue="no"
//                           optionOne={{ value: "no", label: "No" }}
//                           optionTwo={{ value: "yes", label: "Yes" }}
//                         />
//                       )}
//                     />
//                     <Separator className="my-5" />
//                     <FormField
//                       control={control}
//                       name="stockavailability"
//                       render={({ field }) => (
//                         <InputRadioGroup
//                           field={field}
//                           label="Stock Availability"
//                           defaultValue="no"
//                           optionOne={{ value: "no", label: "No" }}
//                           optionTwo={{ value: "yes", label: "Yes" }}
//                         />
//                       )}
//                     />
//                     <MangeInputQuantity control={control} />
//                   </CardContent>
//                 </Card>
//               </div>
//             </main>
//             <Button variant="outline" type="submit">
//               Save
//             </Button>
//           </form>
//         </Form>
//       </FormProvider>
//     </div>
//   );
// }

// export default ProductForm;

import React, { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import LoadingBar from "react-top-loading-bar";

import { getAdminCategories } from "@/lib/admin-http";
import {
  profileFormSchema,
  toolbarOptions,
} from "@/components/admin/Products/util";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FileUploadComponent from "@/components/admin/Products/FormComponents/FileUploadComponent";
import InputRadioGroup from "@/components/admin/FormFields/InputRadioGroup";
import MangeInputQuantity from "@/components/admin/Products/FormComponents/MangeInputQuantity";
import InputField from "@/components/inputfield/InputField";
import ImageUpload from "@/components/admin/FormFields/ImageUpload";
import MultiSelect from "@/components/admin/FormFields/MultiSelect";

import { CaretCircleLeft } from "@phosphor-icons/react";

function ProductForm() {
  const { id } = useParams();
  const isEditForm = id !== undefined;
  const loadingRef = useRef(null);
  const navigate = useNavigate();

  const [attributeOptions, setAttributeOptions] = useState([]);

  const { data: categorieslist } = useQuery({
    queryKey: ["categories"],
    queryFn: getAdminCategories,
  });

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      managestock: "no",
    },
  });

  const { handleSubmit, control } = form;

  // ✅ Watch selected category
  const selectedCategoryId = useWatch({ control, name: "categories" });

  // ✅ Fetch attributes when category changes
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!selectedCategoryId) {
        setAttributeOptions([]);
        return;
      }

      try {
        const token = localStorage.getItem("admin-token");
        const response = await fetch(
          `${import.meta.env.VITE_ADMIN_AUTH_API_URL}attributes/${selectedCategoryId}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const result = await response.json();

        if (Array.isArray(result)) {
          const options = result.map((attr) => ({
            label: attr.name,
            value: attr._id,
          }));
          setAttributeOptions(options);
        } else {
          setAttributeOptions([]);
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setAttributeOptions([]);
      }
    };

    fetchAttributes();
  }, [selectedCategoryId]);

  const onSubmit = async (data) => {
    loadingRef.current.continuousStart();

    const token = localStorage.getItem("admin-token");
    if (!token) {
      toast.error("Missing admin token.");
      loadingRef.current.complete();
      return;
    }

    try {
      const formData = new FormData();
      const productData = { ...data };

      const mediaFiles = productData.media;
      const featureImageFile = productData.featureimage;

      delete productData.media;
      delete productData.featureimage;

      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });
      formData.append("featureimage", featureImageFile);

      formData.append("productInputData", JSON.stringify(productData));

      const response = await fetch(
        `${import.meta.env.VITE_ADMIN_AUTH_API_URL}products/new`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      toast.success(result.message || "Product added successfully");
      loadingRef.current.complete();
      setTimeout(() => navigate(".."), 1000);
    } catch (error) {
      loadingRef.current.complete();
      toast.error(error.message);
    }
  };

  return (
    <div className="container my-12">
      <LoadingBar color="#003E29" ref={loadingRef} shadow={true} />
      <Link to=".." className="flex flex-row gap-2 items-center my-5">
        <CaretCircleLeft size={32} color="#121212" />
        <p className="font-normal text-xl">Back</p>
      </Link>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <main className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-2">
                <Card>
                  <CardHeader className="font-bold">New Product</CardHeader>
                  <CardContent className="space-y-4 h-auto">
                    <InputField form={form} label="Name" fieldname="productname" />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <InputField form={form} label="SKU" fieldname="sku" />
                      <InputField form={form} label="Price" fieldname="price" />
                      <InputField form={form} label="Weight (Kg)" fieldname="weight" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <FormField
                        control={control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categorieslist?.map((category) => (
                                    <SelectItem
                                      key={category._id}
                                      value={category._id}
                                    >
                                      {category.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <MultiSelect
                        form={form}
                        fieldname="attributes"
                        className="col-span-2"
                        isEditForm={isEditForm}
                        options={attributeOptions} // ✅ pass fetched options
                      />
                    </div>

                    <FormField
                      control={control}
                      name="shortdescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief product summary."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This short description shows next to the product title.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <ReactQuill
                              theme="snow"
                              value={field.value}
                              onChange={field.onChange}
                              modules={{ toolbar: toolbarOptions }}
                            />
                          </FormControl>
                          <FormDescription>
                            Main product description below the fold.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="mt-10">
                  <CardHeader className="font-bold">Media</CardHeader>
                  <CardContent>
                    {!isEditForm && <FileUploadComponent form={form} />}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Card>
                  <CardHeader className="font-bold">Featured Image</CardHeader>
                  <CardContent>
                    <ImageUpload
                      form={form}
                      fieldname="featureimage"
                      isEditForm={isEditForm}
                      imageAlt={form.getValues("productname")}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="font-bold">Product Status</CardHeader>
                  <CardContent>
                    <FormField
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <InputRadioGroup
                          field={field}
                          label="Status"
                          defaultValue="enabled"
                          optionOne={{ value: "disabled", label: "Disabled" }}
                          optionTwo={{ value: "enabled", label: "Enabled" }}
                        />
                      )}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="font-bold">Inventory</CardHeader>
                  <CardContent>
                    <FormField
                      control={control}
                      name="managestock"
                      render={({ field }) => (
                        <InputRadioGroup
                          field={field}
                          label="Manage Stock?"
                          defaultValue="no"
                          optionOne={{ value: "no", label: "No" }}
                          optionTwo={{ value: "yes", label: "Yes" }}
                        />
                      )}
                    />
                    <Separator className="my-5" />
                    <FormField
                      control={control}
                      name="stockavailability"
                      render={({ field }) => (
                        <InputRadioGroup
                          field={field}
                          label="Stock Availability"
                          defaultValue="no"
                          optionOne={{ value: "no", label: "No" }}
                          optionTwo={{ value: "yes", label: "Yes" }}
                        />
                      )}
                    />
                    <MangeInputQuantity control={control} />
                  </CardContent>
                </Card>
              </div>
            </main>
            <Button variant="outline" type="submit">
              Save
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}

export default ProductForm;
