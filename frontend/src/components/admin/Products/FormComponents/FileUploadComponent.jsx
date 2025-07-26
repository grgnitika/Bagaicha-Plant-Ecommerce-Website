// import React, { useEffect, useState } from "react";
// import ConnectForm from "./ConnectForm";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// // Import React FilePond
// import { FilePond, registerPlugin } from "react-filepond";

// // Import FilePond styles
// import "filepond/dist/filepond.min.css";

// import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
// import FilePondPluginImagePreview from "filepond-plugin-image-preview";
// import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// registerPlugin(
//   FilePondPluginImageExifOrientation,
//   FilePondPluginImagePreview,
// );

// function FileUploadComponent({ form }) {
//   const [files, setFiles] = useState([]);

//   // useEffect(() => {
//   //   console.log(files);
//   // }, [files, setFiles]);
//   return (
//     <ConnectForm>
//       {({ register, setValue }) => (
//         <FormField
//           control={form.control}
//           name="media"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Media</FormLabel>
//               <FormControl>
//                 <FilePond
//                   files={files}
//                   onupdatefiles={(fileItems) => {
//                     const files1 = {files: fileItems.map((fileItem) => fileItem?.file)}
//                     // console.log(files1);
//                     setFiles(fileItems);
//                     setValue("media", files1.files);
//                   }}
//                   allowMultiple={true}
//                   maxFiles={5}
//                   name="media" /* sets the file input name, it's filepond by default */
//                   labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                  
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       )}
//     </ConnectForm>
//   );
// }

// export default FileUploadComponent;


import React, { useState } from "react";
import ConnectForm from "./ConnectForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";

// Import FilePond styles
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register FilePond plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview
);

function FileUploadComponent({ form }) {
  const [files, setFiles] = useState([]);

  return (
    <ConnectForm>
      {({ setValue }) => (
        <FormField
          control={form.control}
          name="media"
          render={() => (
            <FormItem>
              <FormLabel>Media</FormLabel>
              <FormControl>
                <FilePond
                  name="media" // ✅ This MUST match backend field name
                  files={files}
                  onupdatefiles={(fileItems) => {
                    const uploadedFiles = fileItems.map((fileItem) => fileItem.file);
                    setFiles(fileItems);
                    setValue("media", uploadedFiles); // ✅ update react-hook-form
                  }}
                  allowMultiple={true}
                  maxFiles={10}
                  labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </ConnectForm>
  );
}

export default FileUploadComponent;
