submitQueryBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    showAlert("queryAlert", "❌ You must be logged in", "error");
    return;
  }

  const queryType = document.getElementById("queryType").value;
  const description = document.getElementById("queryDescription").value.trim();

  if (!queryType || !description) {
    showAlert("queryAlert", "❌ Please fill all fields", "error");
    return;
  }

  try {
    submitQueryBtn.disabled = true;
    submitQueryBtn.textContent = "Submitting...";

    const workerDoc = await getDoc(doc(db, "workers", user.uid));
    const workerData = workerDoc.data();

    const queryId = `QRY-${Date.now()}`;

    await setDoc(doc(db, "queries", queryId), {
      queryId,
      uid: user.uid,
      workerId: workerData.workerId,
      workerName: workerData.name,
      queryType,
      description,
      status: "Submitted",
      adminNote: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    showAlert("queryAlert", "✅ Query submitted successfully!", "success");
    document.getElementById("queryDescription").value = "";

  } catch (error) {
    console.error("❌ Query submission error:", error);
    showAlert("queryAlert", "❌ Failed to submit query", "error");

  } finally {
    submitQueryBtn.disabled = false;
    submitQueryBtn.textContent = "Submit Query";
  }
});
