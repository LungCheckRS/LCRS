const smokingStatus = document.getElementById('smokingStatus');
const smokingDetails = document.getElementById('smokingDetails');

smokingStatus.addEventListener('change', function () {
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
  const quitMonths = parseInt(document.getElementById('quitMonths').value) || 0;
  const secondhand = document.getElementById('secondhand').value;
  const familyHistory = document.getElementById('familyHistory').value;

  const yearsSmoked = monthsSmoked / 12;
  const packYears = (cigPerDay / 20) * yearsSmoked;
  const quitYears = quitMonths / 12;

  let ageEligible = (ageGroup === "50-59" || ageGroup === "60-69" || ageGroup === "70+");

  let uspstfEligible = false;

  if (
    ageEligible &&
    packYears >= 20 &&
    (
      status === "current" ||
      (status === "former" && quitYears <= 15)
    )
  ) {
    uspstfEligible = true;
  }

  // ------------------------
  // Research Weighted Model
  // ------------------------

  let researchScore = 0;

  // Age weighting
  if (ageGroup === "60-69") researchScore += 2;
  if (ageGroup === "70+") researchScore += 3;

  // Pack-year weighting
  if (packYears >= 20 && packYears < 30) researchScore += 2;
  if (packYears >= 30 && packYears < 40) researchScore += 3;
  if (packYears >= 40) researchScore += 4;

  // Smoking weighting
  if (status === "current") researchScore += 3;

  if (status === "former") {
    if (quitYears <= 5) researchScore += 2;
    else if (quitYears <= 15) researchScore += 1;
  }

  // Additional factors
  if (secondhand === "yes") researchScore += 1;
  if (familyHistory === "yes") researchScore += 2;

  let riskCategory = "";
  if (researchScore <= 3) riskCategory = "Low Risk";
  else if (researchScore <= 6) riskCategory = "Moderate Risk";
  else riskCategory = "High Risk";

  // ------------------------
  // Output Display
  // ------------------------

  let resultHTML = `
    <div class="result-card">
      <h2>Screening Assessment Results</h2>

      <div class="section">
        <h3>USPSTF Recommendation (Grade B)</h3>
        <p><strong>Population:</strong> Adults aged 50–80 with ≥20 pack-years who currently smoke or quit within 15 years.</p>
        <p><strong>Your Pack-Years:</strong> ${packYears.toFixed(1)}</p>
        <p class="${uspstfEligible ? 'eligible' : 'not-eligible'}">
          ${uspstfEligible 
            ? "You meet official USPSTF screening criteria. Annual LDCT screening is recommended."
            : "You do NOT meet full USPSTF screening criteria based on provided inputs."}
        </p>
      </div>

      <div class="section">
        <h3>Research-Based Risk Model (Exploratory)</h3>
        <p><strong>Risk Score:</strong> ${researchScore}</p>
        <p><strong>Risk Category:</strong> ${riskCategory}</p>
  `;

  if (!uspstfEligible && riskCategory === "High Risk") {
    resultHTML += `
      <p class="advisory">
        Although you do not meet official USPSTF criteria, your overall risk profile suggests discussing screening with a healthcare provider.
      </p>
    `;
  }

  resultHTML += `
        <p class="disclaimer">
          This tool is for educational and research purposes only and does not replace professional medical advice.
        </p>
      </div>
    </div>
  `;

  document.getElementById('result').innerHTML = resultHTML;
}
