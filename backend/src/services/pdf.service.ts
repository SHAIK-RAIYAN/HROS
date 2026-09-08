import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";

const uploadsDir = path.join(process.cwd(), "uploads", "documents");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface GeneratedDocumentsResult {
  resignationAcceptance: string;
  noc: string;
  experienceRelieving: string;
}

const formatDate = (dateInput: Date | string): string => {
  try {
    return dayjs(dateInput).format("MMMM D, YYYY");
  } catch {
    return String(dateInput);
  }
};

const createResignationLetter = async (
  employeeName: string,
  resignationDate: Date | string,
  lastWorkingDay: Date | string,
  caseNumber: string
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 40,
    y: 750,
    width: 515,
    height: 50,
    color: rgb(0.08, 0.18, 0.36),
  });

  page.drawText("TERRALOGIC - RESIGNATION ACCEPTANCE LETTER", {
    x: 60,
    y: 768,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  const formattedResDate = formatDate(resignationDate);
  const formattedLwd = formatDate(lastWorkingDay);
  const currentDate = dayjs().format("MMMM D, YYYY");

  page.drawText(`Reference Case: ${caseNumber}`, {
    x: 50,
    y: 710,
    size: 11,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Date: ${currentDate}`, {
    x: 50,
    y: 690,
    size: 10,
    font: regularFont,
  });

  page.drawText(`To,\n${employeeName}`, {
    x: 50,
    y: 650,
    size: 11,
    font: boldFont,
    lineHeight: 16,
  });

  page.drawText(`Dear ${employeeName},`, {
    x: 50,
    y: 600,
    size: 10,
    font: boldFont,
  });

  const bodyText = [
    `This letter formally acknowledges receipt and acceptance of your formal resignation submitted`,
    `on ${formattedResDate}. As mutually agreed upon, your final working day with Terralogic Inc. will be`,
    `${formattedLwd}.`,
    "",
    "We request that you ensure all project responsibilities, knowledge transfer sessions,",
    "and company assets (IT hardware, access cards) are properly returned through the",
    "BlazeUp HROS digital clearance process prior to your last working day.",
    "",
    "We appreciate your contributions to the company and wish you continued success in your",
    "future professional endeavors.",
    "",
    "Sincerely,",
    "Human Resources Department",
    "Terralogic Inc.",
  ];

  let yOffset = 570;
  for (const line of bodyText) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: 10,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    yOffset -= 18;
  }

  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: 545, y: 100 },
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText("Digitally Verified via BlazeUp HROS Workflow Automation Engine", {
    x: 50,
    y: 80,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const fileName = `resignation-${caseNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(filePath, pdfBytes);

  return `/uploads/documents/${fileName}`;
};

const createNocCertificate = async (
  employeeName: string,
  resignationDate: Date | string,
  lastWorkingDay: Date | string,
  caseNumber: string
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 40,
    y: 750,
    width: 515,
    height: 50,
    color: rgb(0.12, 0.35, 0.22),
  });

  page.drawText("NO OBJECTION CERTIFICATE (NOC) & CLEARANCE", {
    x: 60,
    y: 768,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  const formattedLwd = formatDate(lastWorkingDay);
  const currentDate = dayjs().format("MMMM D, YYYY");

  page.drawText(`Certificate ID: NOC-${caseNumber}`, {
    x: 50,
    y: 710,
    size: 11,
    font: boldFont,
  });

  page.drawText(`Issue Date: ${currentDate}`, {
    x: 50,
    y: 690,
    size: 10,
    font: regularFont,
  });

  page.drawText(`CLEARANCE CERTIFICATE FOR ${employeeName.toUpperCase()}`, {
    x: 50,
    y: 640,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const lines = [
    `This is to certify that ${employeeName} has completed all departmental clearance`,
    `protocols with Terralogic Inc. as of ${formattedLwd}.`,
    "",
    "Departmental Clearance Verification Record:",
    " [X] Project & Reporting Manager : Knowledge transfer & project handover verified",
    " [X] Admin & Systems             : IT hardware returned & system accesses revoked",
    " [X] Accounts Department         : Advances, staff loans, and dues cleared",
    " [X] Personnel                   : Access cards and physical IDs collected",
    " [X] Human Resources             : Final clearance certified and documented",
    "",
    "Terralogic Inc. confirms there are no pending claims, obligations, or dues outstanding",
    "against the aforementioned employee.",
    "",
    "Authorized Signatory,",
    "Head of People Operations",
    "Terralogic Inc.",
  ];

  let yOffset = 600;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: 10,
      font: line.startsWith(" [X]") ? boldFont : regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    yOffset -= 20;
  }

  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: 545, y: 100 },
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText("Digitally Generated & Approved via BlazeUp HROS Platform", {
    x: 50,
    y: 80,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const fileName = `noc-${caseNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(filePath, pdfBytes);

  return `/uploads/documents/${fileName}`;
};

const createRelievingLetter = async (
  employeeName: string,
  resignationDate: Date | string,
  lastWorkingDay: Date | string,
  caseNumber: string,
  designation?: string
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 40,
    y: 750,
    width: 515,
    height: 50,
    color: rgb(0.3, 0.15, 0.45),
  });

  page.drawText("EXPERIENCE & RELIEVING LETTER", {
    x: 60,
    y: 768,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  const formattedLwd = formatDate(lastWorkingDay);
  const currentDate = dayjs().format("MMMM D, YYYY");

  page.drawText(`Letter Ref: EXP-${caseNumber}`, {
    x: 50,
    y: 710,
    size: 11,
    font: boldFont,
  });

  page.drawText(`Date: ${currentDate}`, {
    x: 50,
    y: 690,
    size: 10,
    font: regularFont,
  });

  page.drawText(`RELIEVING LETTER FOR ${employeeName.toUpperCase()}`, {
    x: 50,
    y: 640,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const designationText = designation ? ` as ${designation}` : "";

  const lines = [
    `This is to certify that ${employeeName} was employed with Terralogic Inc.${designationText}`,
    `and has been formally relieved of all employment duties effective ${formattedLwd}.`,
    "",
    "During their tenure with us, their conduct and performance were found to be sincere,",
    "professional, and dedicated to achieving team goals.",
    "",
    "They have satisfactorily fulfilled all handover requirements and complete offboarding",
    "clearances across all operational divisions.",
    "",
    "We thank them for their valuable contributions and wish them all success and prosperity",
    "in their future career endeavors.",
    "",
    "For Terralogic Inc.,",
    "",
    "Director of Human Resources",
  ];

  let yOffset = 600;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: 10,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    yOffset -= 20;
  }

  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: 545, y: 100 },
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText("Official Document - BlazeUp HROS Offboarding Automation Module", {
    x: 50,
    y: 80,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const fileName = `relieving-${caseNumber}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  const pdfBytes = await pdfDoc.save();
  await fs.promises.writeFile(filePath, pdfBytes);

  return `/uploads/documents/${fileName}`;
};

export const generateOffboardingDocuments = async (
  employeeName: string,
  resignationDate: Date | string,
  lastWorkingDay: Date | string,
  caseNumber: string,
  designation?: string
): Promise<GeneratedDocumentsResult> => {
  const [resignationAcceptance, noc, experienceRelieving] = await Promise.all([
    createResignationLetter(employeeName, resignationDate, lastWorkingDay, caseNumber),
    createNocCertificate(employeeName, resignationDate, lastWorkingDay, caseNumber),
    createRelievingLetter(employeeName, resignationDate, lastWorkingDay, caseNumber, designation),
  ]);

  return {
    resignationAcceptance,
    noc,
    experienceRelieving,
  };
};
