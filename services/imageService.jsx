export const getFilePath = (file) => {
  if (file && typeof file == "string") 
    return { uri: file };     // wrap in object
  if (file && typeof file == "object") 
    return { uri: file.uri }; // wrap in object

  return null;
};
