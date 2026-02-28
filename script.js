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
  const quitMonths = parseInt(document.getElementById('quitMonths').value) || 0;

  // Convert age group to approximate age range
  let ageEligible = (ageGroup === "50-59" || ageGroup === "60-69" || ageGroup === "70+");

  // Calculate pack-years
  const packYears = (cigPerDay / 20) * (monthsSmoked / 12);

  // Convert quit months to years
  const quitYears = quitMonths / 12;

  let uspstfEligible = false;

  // USPSTF Criteria
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

  let resultHTML = "";

  if (uspstfEligible) {
    resultHTML += `
      <h3>USPSTF Screening Recommendation (Grade B)</h3>
      <p><strong>Population:</strong> Adults aged 50 to 80 years with a 20 pack-year smoking history who currently smoke or quit within the past 15 years.</p>
      <p><strong>Recommendation:</strong> Annual screening with low-dose computed tomography (LDCT).</p>
      <p><strong>Grade:</strong> B</p>
      <p>Based on your inputs, you meet USPSTF criteria for annual lung cancer screening. Please consult a healthcare provider.</p>
    `;
  } else {
    resultHTML += `
      <h3>USPSTF Screening Recommendation (Grade B)</h3>
      <p><strong>Population:</strong> Adults aged 50 to 80 years with a 20 pack-year smoking history who currently smoke or quit within the past 15 years.</p>
      <p><strong>Recommendation:</strong> Annual screening with LDCT if criteria are met.</p>
      <p><strong>Grade:</strong> B</p>
      <p>⚠️ Based on your inputs, you do not currently meet full USPSTF screening criteria.</p>
    `;
  }

  // General Research-Based Risk Insight
  resultHTML += `
    <hr>
    <h3>General Research-Based Risk Insight</h3>
    <p>Lung cancer risk increases with:</p>
    <ul>
      <li>Longer smoking duration</li>
      <li>Higher pack-year history</li>
      <li>Secondhand smoke exposure</li>
      <li>Family history of lung cancer</li>
      <li>Pre-existing lung disease</li>
    </ul>
    <p>Even if you do not meet formal screening criteria, discussing risk factors with a healthcare provider is recommended.</p>
  `;

  document.getElementById('result').innerHTML = resultHTML;
}
