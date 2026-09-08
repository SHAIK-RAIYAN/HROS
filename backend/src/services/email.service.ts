import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

export const sendStageActivationEmail = async (
  userEmail: string,
  stageName: string,
  caseNumber: string
): Promise<boolean> => {
  try {
    const subject = `[Action Required] Clearance Stage Active: ${stageName} (${caseNumber})`;
    const text = `Hello,\n\nThe offboarding clearance stage '${stageName}' for case ${caseNumber} is now active and requires your review and approval.\n\nPlease log in to BlazeUp HROS to complete your department checklist.\n\nThank you,\nHR Operations`;

    const info = await transporter.sendMail({
      from: '"BlazeUp HROS" <notifications@blazeup.terralogic.com>',
      to: userEmail,
      subject,
      text,
    });

    console.log(`[Email Sent] To: ${userEmail} | Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email Failed] To: ${userEmail} | Error:`, error);
    return false;
  }
};

export const sendOffboardingCompleteEmail = async (
  hrEmail: string,
  employeeName: string,
  caseNumber: string
): Promise<boolean> => {
  try {
    const subject = `[Completed] Offboarding Complete: ${employeeName} (${caseNumber})`;
    const text = `Hello HR Team,\n\nAll departmental clearance stages for ${employeeName} (${caseNumber}) have been successfully completed and approved.\n\nOfficial offboarding documents (Resignation Acceptance, NOC, and Experience/Relieving Letter) have been generated and are available in the portal.\n\nThank you,\nBlazeUp HROS Automated Engine`;

    const info = await transporter.sendMail({
      from: '"BlazeUp HROS" <notifications@blazeup.terralogic.com>',
      to: hrEmail,
      subject,
      text,
    });

    console.log(`[Email Sent] To: ${hrEmail} | Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email Failed] To: ${hrEmail} | Error:`, error);
    return false;
  }
};
