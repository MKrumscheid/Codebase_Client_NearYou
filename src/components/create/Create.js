const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent the default form submission
  // Create a new FormData object, since we need to store files as well (not just JSON data)
  const formData = new FormData();
  for (const key in formState) {
    formData.append(key, formState[key]);
  }

  try {
    //const response = await fetch("http://localhost:3000/api/coupons", {
    const response = await fetch(
      "https://nearyou-server-28246f0c9e39.herokuapp.com/api/coupons",
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.ok) {
      // Handle successful submission
      alert("Coupon created successfully!");
      //reset the form state
      setFormState({
        product: "",
        productInfo: "",
        price: "",
        discount: "",
        productCategory: "",
        validity: "",
        quantity: 1,
        productPhoto: null,
        companyLogo: null,
        longitude: location.longitude || "",
        latitude: location.latitude || "",
        productPhotoPreview: null,
        companyLogoPreview: null,
      });
    } else {
      // Handle error
      alert("Failed to create coupon.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Error submitting form.");
  }
};
