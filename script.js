const smokingStatus = document.getElementById('smokingStatus');
const smokingDetails = document.getElementById('smokingDetails');

smokingStatus.addEventListener('change', function() {
  if (this.value === 'current' || this.value === 'former') {
    smokingDetails.style.display = 'block';
  } else {
    smokingDetails.style.display = 'none';
  }
});

function calculateRisk() {
  const ageGroup = document.getElementById('ageGroup').value;
  const status = document.getElementById('smokingStatus').value;
  const monthsSmoked = parseInt(document.getElementById('monthsSmoked').value) || 0;
  const cigPerDay = parseInt(document.getElementById('cigPerDay').value) || 0;

  let resultText = '';

  // Approximate pack-years
  const packYears = (cigPerDay / 20) * (monthsSmoked / 12);

  // Simple eligibility logic (similar to USPSTF)
  if ((ageGroup === "50-59" || ageGroup === "60-69" || ageGroup === "70+") &&
      (status === 'current' || status === 'former') &&
      packYears >= 20) {
    resultText = "You may be eligible for low-dose CT lung cancer screening. Please consult a healthcare provider.";
  } else {
    resultText = "Based on your inputs, you may not currently meet screening criteria. Discuss your risk with a healthcare provider if concerned.";
  }

  document.getElementById('result').innerText = resultText;
}
