import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { InstrumentState, QCDataPoint } from "../types";

// In a real scenario, this would be process.env.API_KEY.
// For the demo, we assume it's available.
const API_KEY = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const generateIVDAssistance = async (
  prompt: string, 
  instrumentState: InstrumentState
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Using offline simulation mode: Based on the current instrument state, please check the reagents and ensure the reaction disk temperature is within 37.0°C ± 0.3°C. (This is a mock response)";
  }

  const systemContext = `
    You are IVD-Copilot, an expert AI assistant for high-end In-Vitro Diagnostic instruments.
    
    CURRENT INSTRUMENT TELEMETRY:
    - Status: ${instrumentState.status}
    - Reaction Temperature: ${instrumentState.reactionTemp.toFixed(2)}°C (Target: 37.0°C)
    - Reagent Remaining: ${instrumentState.reagentVol}%
    - Throughput: ${instrumentState.throughput} T/H
    - Active Error: ${instrumentState.lastError || "None"}

    YOUR ROLE:
    1. Analyze technical issues based on the provided telemetry.
    2. Suggest troubleshooting steps for errors (e.g., E-304 Motor Step Loss, Temperature drift).
    3. Interpret QC (Quality Control) trends using Westgard rules concepts.
    4. Be professional, concise, and safety-oriented.

    If the user asks about an error, reference standard maintenance procedures (check belts, sensors, voltage).
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemContext + "\n\nUser Query: " + prompt }] }
      ],
      config: {
        temperature: 0.2, // Low temperature for technical accuracy
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with IVD-Copilot cloud service. Please check network connection.";
  }
};

export const generateInstrumentReport = async (
  instrumentState: InstrumentState,
  qcDataSummary: string,
  reportType: string = "Daily Status Report"
): Promise<string> => {
  if (!ai) {
    return `# Offline Mode Report: ${reportType}\n\nAPI Key is missing. Cannot generate AI report.\n\nCurrent Status: ` + instrumentState.status;
  }

  let specificContext = "";
  switch(reportType) {
    case "Monthly QC Summary":
      specificContext = "Focus on statistical analysis, Westgard rule violations, Levey-Jennings trends, and Coefficient of Variation (CV%) for the last 30 days. Simulate realistic statistical data.";
      break;
    case "Calibration Certificate":
      specificContext = "Generate a formal calibration certificate. Include Slope, Intercept, and R-Squared values for key analytes (ALT, AST, TSH). Certify that the instrument meets linearity requirements.";
      break;
    case "Maintenance Log":
      specificContext = "List recent maintenance activities such as 'Photometer Lamp check', 'Needle Wash', 'Reaction Cuvette cleaning'. Confirm schedule adherence.";
      break;
    case "Error History Audit":
      specificContext = "Analyze the recent error logs. If 'lastError' is present, provide a detailed root cause analysis and prevention strategy. If none, confirm error-free operation.";
      break;
    case "Reagent Usage Report":
      specificContext = "Detail reagent consumption rates, remaining onboard volume, and predicted days until replenishment is needed for high-volume tests.";
      break;
    default:
      specificContext = "Provide a general executive summary of the system's operational health, throughput efficiency, and immediate attention items.";
  }

  const prompt = `
    Generate a professional "${reportType}" for a Clinical Diagnostic Analyzer.
    
    DATA SOURCE:
    - Timestamp: ${new Date().toLocaleString()}
    - Instrument Status: ${instrumentState.status}
    - Reaction Temperature: ${instrumentState.reactionTemp.toFixed(2)}°C
    - Reagent Level: ${instrumentState.reagentVol}%
    - Throughput: ${instrumentState.throughput} T/H
    - Current Error: ${instrumentState.lastError || "None"}
    - QC Summary: ${qcDataSummary}

    REPORT GUIDELINES:
    - Focus: ${specificContext}
    - Format: Use Markdown. Include professional headers, bullet points, and mock data tables where appropriate.
    - Title: "IVD-Copilot | ${reportType}"
    - Tone: Formal, Technical, Clinical Engineering style.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating report. Please check network.";
  }
};